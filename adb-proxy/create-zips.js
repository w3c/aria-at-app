const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PLATFORMS = ['windows', 'linux', 'macos'];

function createZipForPlatform(platform) {
  const distDir = path.join('dist', platform);
  const zipName = `adb-proxy-${platform}.zip`;
  const zipPath = path.join('dist', zipName);

  console.info(`📦 Creating zip for ${platform}...`);

  if (!fs.existsSync(distDir)) {
    console.error(`❌ Build directory not found: ${distDir}`);
    console.error(`Run 'yarn build-${platform}' first`);
    return false;
  }

  try {
    // Remove existing zip if it exists
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }

    // Create zip file
    if (process.platform === 'win32') {
      // Use PowerShell on Windows
      execSync(
        `powershell -command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${zipPath}' -Force"`,
        { stdio: 'inherit' }
      );
    } else {
      // Use zip command on Unix-like systems
      execSync(`cd "${distDir}" && zip -r "../${zipName}" .`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    }

    // Get file size for reporting
    const stats = fs.statSync(zipPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.info(`✅ Created ${zipName} (${fileSizeInMB} MB)`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create zip for ${platform}:`, error.message);
    return false;
  }
}

function createAllZips() {
  console.info('🚀 Creating zip files for all platforms...');

  const results = [];

  for (const platform of PLATFORMS) {
    const success = createZipForPlatform(platform);
    results.push({ platform, success });
  }

  console.info('\n📊 Zip creation summary:');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  if (successful.length > 0) {
    console.info('✅ Successful:');
    successful.forEach(({ platform }) => {
      console.info(`   - adb-proxy-${platform}.zip`);
    });
  }

  if (failed.length > 0) {
    console.error('❌ Failed:');
    failed.forEach(({ platform }) => {
      console.error(`   - ${platform}`);
    });
  }

  console.info(
    '\n📁 Zip files are ready in the dist/ directory for GitHub release!'
  );

  return failed.length === 0;
}

function main() {
  const platform = process.argv[2];

  if (!platform) {
    console.error('Usage: node create-zips.js <platform>');
    console.error('Platforms: windows, linux, macos, all');
    process.exit(1);
  }

  if (platform === 'all') {
    const success = createAllZips();
    process.exit(success ? 0 : 1);
  } else if (PLATFORMS.includes(platform)) {
    const success = createZipForPlatform(platform);
    process.exit(success ? 0 : 1);
  } else {
    console.error(`Unknown platform: ${platform}`);
    console.error('Available platforms:', PLATFORMS.join(', '));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createZipForPlatform, createAllZips };
