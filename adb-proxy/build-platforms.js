const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PLATFORMS = {
  windows: {
    adbUrl:
      'https://dl.google.com/android/repository/platform-tools-latest-windows.zip',
    executable: 'adb-proxy.exe',
    pkgExecutable: 'adb-proxy.exe'
  },
  linux: {
    adbUrl:
      'https://dl.google.com/android/repository/platform-tools-latest-linux.zip',
    executable: 'adb-proxy',
    pkgExecutable: 'adb-proxy'
  },
  macos: {
    adbUrl:
      'https://dl.google.com/android/repository/platform-tools-latest-darwin.zip',
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
  } else {
    throw new Error(`Unsupported archive format: ${filename}`);
  }
}

async function buildForPlatform(platform) {
  const config = PLATFORMS[platform];
  const buildDir = path.join('dist', platform);

  console.log(`🔨 Building for ${platform}...`);

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
    console.log(`✅ Execute permissions set for ${platform} executable`);
  }

  // Download and extract ADB
  console.log(`📥 Downloading ADB for ${platform}...`);
  const adbArchive = path.join(buildDir, 'adb-archive.zip');
  await downloadFile(config.adbUrl, adbArchive);
  await extractArchive(adbArchive, buildDir);

  // Find and copy ADB binary
  const platformToolsDir = path.join(buildDir, 'platform-tools');
  if (fs.existsSync(platformToolsDir)) {
    const adbBinary = platform === 'windows' ? 'adb.exe' : 'adb';
    const adbPath = path.join(platformToolsDir, adbBinary);
    if (fs.existsSync(adbPath)) {
      fs.copyFileSync(adbPath, path.join(buildDir, adbBinary));
      console.log(`✅ ADB binary copied for ${platform}`);
    }
  }

  if (fs.existsSync(adbArchive)) {
    fs.unlinkSync(adbArchive);
  }
  if (fs.existsSync(platformToolsDir)) {
    fs.rmSync(platformToolsDir, { recursive: true });
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
echo
echo "Starting proxy..."
echo

DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
export PATH="$DIR:\$PATH"
"$DIR/${config.executable}"`;

  fs.writeFileSync(path.join(buildDir, scriptName), startupScript);
  if (platform !== 'windows') {
    fs.chmodSync(path.join(buildDir, scriptName), '755');
  }

  // Create README
  const readme = `# ADB Proxy - Portable Version

This is a portable version of the ADB Proxy that includes:
- ADB Proxy executable
- ADB binary  
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

## Files

- ${config.executable}: Main proxy executable (generated by @yao-pkg/pkg)
- ${platform === 'windows' ? 'adb.exe' : 'adb'}: Android Debug Bridge binary
- ${scriptName}: Startup script
`;

  fs.writeFileSync(path.join(buildDir, 'README.txt'), readme);

  console.log(`✅ Build complete for ${platform} in dist/${platform}/`);
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
