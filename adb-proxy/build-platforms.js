const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PLATFORMS = {
  windows: {
    adbUrl:
      'https://dl.google.com/android/repository/platform-tools-latest-windows.zip',
    ngrokUrl:
      'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip',
    executable: 'adb-proxy.exe',
    pkgExecutable: 'adb-proxy.exe'
  },
  linux: {
    adbUrl:
      'https://dl.google.com/android/repository/platform-tools-latest-linux.zip',
    ngrokUrl:
      'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz',
    executable: 'adb-proxy',
    pkgExecutable: 'adb-proxy'
  },
  macos: {
    adbUrl:
      'https://dl.google.com/android/repository/platform-tools-latest-darwin.zip',
    ngrokUrl:
      'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-amd64.tgz',
    executable: 'adb-proxy',
    pkgExecutable: 'adb-proxy'
  }
};

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https
      .get(url, response => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          return downloadFile(response.headers.location, filepath)
            .then(resolve)
            .catch(reject);
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', reject);
  });
}

async function extractArchive(archivePath, extractPath) {
  const filename = path.basename(archivePath);

  if (filename.endsWith('.zip')) {
    if (process.platform === 'win32') {
      execSync(
        `powershell -command "Expand-Archive -Path '${archivePath}' -DestinationPath '${extractPath}'"`,
        { stdio: 'inherit' }
      );
    } else {
      execSync(`unzip -q "${archivePath}" -d "${extractPath}"`, {
        stdio: 'inherit'
      });
    }
  } else if (filename.endsWith('.tgz') || filename.endsWith('.tar.gz')) {
    execSync(`tar -xzf "${archivePath}" -C "${extractPath}"`, {
      stdio: 'inherit'
    });
  } else {
    throw new Error(`Unsupported archive format: ${filename}`);
  }
}

async function buildForPlatform(platform) {
  const config = PLATFORMS[platform];
  const buildDir = path.join('dist', platform);

  console.info(`🔨 Building for ${platform}...`);

  const pkgExecutable = path.join(buildDir, config.pkgExecutable);
  if (!fs.existsSync(pkgExecutable)) {
    console.error(`❌ pkg executable not found at ${pkgExecutable}`);
    console.error(
      'Run the pkg command first to generate the Node.js+app executable'
    );
    return;
  }

  // Set execute permissions on the pkg executable
  if (platform !== 'windows') {
    fs.chmodSync(pkgExecutable, '755');
    console.info(`✅ Execute permissions set for ${platform} executable`);
  }

  // Download and extract ADB
  console.info(`📥 Downloading ADB for ${platform}...`);
  const adbArchive = path.join(buildDir, 'adb-archive.zip');
  await downloadFile(config.adbUrl, adbArchive);
  await extractArchive(adbArchive, buildDir);

  // Find and copy ADB binary and dependencies
  const adbBinary = platform === 'windows' ? 'adb.exe' : 'adb';
  const platformToolsDir = path.join(buildDir, 'platform-tools');
  if (fs.existsSync(platformToolsDir)) {
    const adbPath = path.join(platformToolsDir, adbBinary);
    if (fs.existsSync(adbPath)) {
      fs.copyFileSync(adbPath, path.join(buildDir, adbBinary));
      console.info(`✅ ADB binary copied for ${platform}`);

      // For Windows, copy all DLL files that ADB needs
      if (platform === 'windows') {
        const dllFiles = ['adbwinapi.dll', 'adbwinusbapi.dll'];
        for (const dllFile of dllFiles) {
          const dllPath = path.join(platformToolsDir, dllFile);
          if (fs.existsSync(dllPath)) {
            fs.copyFileSync(dllPath, path.join(buildDir, dllFile));
            console.info(`✅ ${dllFile} copied for Windows`);
          } else {
            console.warn(`⚠️  ${dllFile} not found in platform-tools`);
          }
        }
      }
    }
  }

  if (fs.existsSync(adbArchive)) {
    fs.unlinkSync(adbArchive);
  }
  if (fs.existsSync(platformToolsDir)) {
    fs.rmSync(platformToolsDir, { recursive: true });
  }

  // Download and extract ngrok (optional, for ngrok tunnel type)
  const includeNgrok = process.env.INCLUDE_NGROK === 'true';

  if (includeNgrok) {
    console.info(`📥 Downloading ngrok for ${platform}...`);
    const ngrokArchiveExt = platform === 'windows' ? 'zip' : 'tgz';
    const ngrokArchive = path.join(
      buildDir,
      `ngrok-archive.${ngrokArchiveExt}`
    );

    try {
      await downloadFile(config.ngrokUrl, ngrokArchive);
      await extractArchive(ngrokArchive, buildDir);

      // Find and copy ngrok binary
      const ngrokBinary = platform === 'windows' ? 'ngrok.exe' : 'ngrok';
      const ngrokPath = path.join(buildDir, ngrokBinary);
      if (fs.existsSync(ngrokPath)) {
        console.info(`✅ ngrok binary copied for ${platform}`);
      }

      if (fs.existsSync(ngrokArchive)) {
        fs.unlinkSync(ngrokArchive);
      }
    } catch (error) {
      console.warn(
        `⚠️ Failed to download ngrok for ${platform}:`,
        error.message
      );
      console.info(
        'ℹ️ ngrok is optional - localtunnel will be used by default'
      );
    }
  } else {
    console.info(
      `⏭️ Skipping ngrok download for ${platform} (INCLUDE_NGROK not set to 'true')`
    );
  }

  // Create startup script/batch file
  const scriptName =
    platform === 'windows'
      ? 'start.bat'
      : platform === 'macos'
      ? 'start.command'
      : 'start.sh';
  const startupScript =
    platform === 'windows'
      ? `@echo off
title ADB Proxy for aria-at Testing
color 0A
echo.
echo  ========================================
echo   ADB Proxy for aria-at Testing
echo  ========================================
echo.
echo  1. Make sure your Android device is connected via USB
echo  2. Ensure USB debugging is enabled on your device
echo  3. This window will stay open while the proxy runs
echo.
echo  The proxy will be available at: http://localhost:3080
echo  Using localtunnel for public access (default)
echo.
echo  Starting proxy...
echo.

"%~dp0${config.executable}"
pause`
      : `#!/bin/bash
echo "========================================"
echo "  ADB Proxy for aria-at Testing"
echo "========================================"
echo
echo "1. Make sure your Android device is connected via USB"
echo "2. Ensure USB debugging is enabled on your device"
echo "3. This terminal will stay open while the proxy runs"
echo
echo "The proxy will be available at: http://localhost:3080"
echo "Using localtunnel for public access (default)"
echo
echo "Starting proxy..."
echo

DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
export PATH="$DIR:$PATH"
"$DIR/${config.executable}"`;

  fs.writeFileSync(path.join(buildDir, scriptName), startupScript);
  if (platform !== 'windows') {
    fs.chmodSync(path.join(buildDir, scriptName), '755');
  }

  // Create ngrok-specific startup script (only if ngrok is included)
  if (includeNgrok) {
    const ngrokScriptName =
      platform === 'windows'
        ? 'start-ngrok.bat'
        : platform === 'macos'
        ? 'start-ngrok.command'
        : 'start-ngrok.sh';
    const ngrokStartupScript =
      platform === 'windows'
        ? `@echo off
title ADB Proxy for aria-at Testing (ngrok)
color 0B
echo.
echo  ========================================
echo   ADB Proxy for aria-at Testing
echo   Using ngrok tunnel
echo  ========================================
echo.
echo  1. Make sure your Android device is connected via USB
echo  2. Ensure USB debugging is enabled on your device
echo  3. This window will stay open while the proxy runs
echo.
echo  The proxy will be available at: http://localhost:3080
echo  Using ngrok for public access
echo.
echo  Starting proxy...
echo.

set TUNNEL_TYPE=ngrok
"%~dp0${config.executable}"
pause`
        : `#!/bin/bash
echo "========================================"
echo "  ADB Proxy for aria-at Testing"
echo "  Using ngrok tunnel"
echo "========================================"
echo
echo "1. Make sure your Android device is connected via USB"
echo "2. Ensure USB debugging is enabled on your device"
echo "3. This terminal will stay open while the proxy runs"
echo
echo "The proxy will be available at: http://localhost:3080"
echo "Using ngrok for public access"
echo
echo "Starting proxy..."
echo

DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
export PATH="$DIR:$PATH"
export TUNNEL_TYPE=ngrok
"$DIR/${config.executable}"`;

    fs.writeFileSync(path.join(buildDir, ngrokScriptName), ngrokStartupScript);
    if (platform !== 'windows') {
      fs.chmodSync(path.join(buildDir, ngrokScriptName), '755');
    }
  }

  // Create README
  const ngrokBinary = platform === 'windows' ? 'ngrok.exe' : 'ngrok';
  const ngrokScriptName = includeNgrok
    ? platform === 'windows'
      ? 'start-ngrok.bat'
      : platform === 'macos'
      ? 'start-ngrok.command'
      : 'start-ngrok.sh'
    : 'N/A';

  const readme = `# ADB Proxy - Portable Version

This is a portable version of the ADB Proxy that includes:
- ADB Proxy executable
- ADB binary
- localtunnel (built-in, default tunnel)${
    includeNgrok ? '\n- ngrok binary (optional, for ngrok tunnel type)' : ''
  }
- Startup script
- Complete user guide

## Quick Start

1. Connect your Android device with USB debugging enabled
2. ${
    platform === 'windows'
      ? 'Double-click start.bat'
      : platform === 'macos'
      ? 'Double-click start.command'
      : 'Run ./start.sh in terminal'
  }

The proxy will start on http://localhost:3080

## Tunnel Types

The proxy supports two tunnel types:
- **localtunnel** (default): Uses localtunnel service for public access${
    includeNgrok
      ? '\n- **ngrok**: Uses ngrok service for public access (requires ngrok binary)'
      : ''
  }

${
  includeNgrok
    ? `To use ngrok, set the TUNNEL_TYPE environment variable:
\`\`\`
TUNNEL_TYPE=ngrok ./start.sh
\`\`\`

`
    : ''
}## Files

- ${config.executable}: Main proxy executable (generated by @yao-pkg/pkg)
- ${adbBinary}: Android Debug Bridge binary${
    platform === 'windows' ? ' (with required DLL files)' : ''
  }${includeNgrok ? `\n- ${ngrokBinary}: ngrok binary (optional)` : ''}
- ${scriptName}: Startup script (uses localtunnel by default)${
    includeNgrok
      ? `\n- ${ngrokScriptName}: Startup script for ngrok tunnel`
      : ''
  }
`;

  fs.writeFileSync(path.join(buildDir, 'README.txt'), readme);

  console.info(`✅ Build complete for ${platform} in dist/${platform}/`);
}

async function main() {
  const platform = process.argv[2];

  if (!platform) {
    console.error('Usage: node build-platforms.js <platform>');
    console.error('Platforms: windows, linux, macos, all');
    process.exit(1);
  }

  if (platform === 'all') {
    for (const p of Object.keys(PLATFORMS)) {
      try {
        await buildForPlatform(p);
      } catch (error) {
        console.error(`❌ Build failed for ${p}:`, error.message);
      }
    }
  } else if (PLATFORMS[platform]) {
    try {
      await buildForPlatform(platform);
    } catch (error) {
      console.error(`❌ Build failed for ${platform}:`, error.message);
      process.exit(1);
    }
  } else {
    console.error(`Unknown platform: ${platform}`);
    console.error('Available platforms:', Object.keys(PLATFORMS).join(', '));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { buildForPlatform, PLATFORMS };
