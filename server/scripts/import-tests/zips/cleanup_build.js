#!/usr/bin/env node

/**
 * Usage: node cleanup_build.js [build_folder] [--dry-run]
 */

const fs = require('fs');
const path = require('path');

let BUILD_DIR = 'build';
let DRY_RUN = false;

process.argv.slice(2).forEach(arg => {
  if (arg === '--dry-run') {
    DRY_RUN = true;
  } else {
    BUILD_DIR = arg;
  }
});

if (!fs.existsSync(BUILD_DIR) || !fs.statSync(BUILD_DIR).isDirectory()) {
  console.error(`Error: Directory '${BUILD_DIR}' does not exist.`);
  process.exit(1);
}

const absoluteBuildDir = path.resolve(BUILD_DIR);
const buildDirName = path.basename(absoluteBuildDir);
const parentDirName = path.basename(path.dirname(absoluteBuildDir));

if (buildDirName !== 'build' || parentDirName !== 'aria-at') {
  console.error(
    "Error: Safety check failed. This script can only run on a 'build' folder inside an 'aria-at' directory."
  );
  console.error(`Absolute path: ${absoluteBuildDir}`);
  console.error(`Build directory name: ${buildDirName}`);
  console.error(`Parent directory name: ${parentDirName}`);
  console.error(
    "Expected: build directory named 'build' inside parent directory named 'aria-at'"
  );
  process.exit(1);
}

function log(msg, { isError = false } = {}) {
  if (isError) return console.error(msg);
  // eslint-disable-next-line no-console
  console.info(msg);
}

function removeFile(file) {
  if (DRY_RUN) {
    log(`[DRY RUN] Would remove file: ${file}`);
  } else {
    try {
      fs.unlinkSync(file);
      log(`Removed file: ${file}`);
    } catch (e) {
      log(`Failed to remove file: ${file} (${e.message})`, { isError: true });
    }
  }
}

function removeDir(dir) {
  if (DRY_RUN) {
    log(`[DRY RUN] Would remove directory: ${dir}`);
  } else {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      log(`Removed directory: ${dir}`);
    } catch (e) {
      log(`Failed to remove directory: ${dir} (${e.message})`, {
        isError: true
      });
    }
  }
}

function removeNonCollectedJsonFiles(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removeNonCollectedJsonFiles(fullPath);
    } else if (entry.isFile() && !entry.name.endsWith('.collected.json')) {
      removeFile(fullPath);
    }
  });
}

function removeEmptyDirs(dir, rootDir) {
  if (dir === rootDir) return; // skip root tests dir
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removeEmptyDirs(fullPath, rootDir);
    }
  }
  // After checking children, if no .collected.json files remain, remove dir
  const stillHasCollectedJson = fs
    .readdirSync(dir)
    .some(f => f.endsWith('.collected.json'));
  if (!stillHasCollectedJson) {
    removeDir(dir);
  }
}

function walkDirsReverse(dir, cb) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDirsReverse(fullPath, cb);
      cb(fullPath);
    }
  });
}

// Remove all files at the root of the build directory (not directories)
fs.readdirSync(BUILD_DIR, { withFileTypes: true })
  .filter(entry => entry.isFile())
  .forEach(entry => {
    removeFile(path.join(BUILD_DIR, entry.name));
  });

// Remove the review folder if it exists at the root of the build directory
const REVIEW_DIR = path.join(BUILD_DIR, 'review');
if (fs.existsSync(REVIEW_DIR) && fs.statSync(REVIEW_DIR).isDirectory()) {
  removeDir(REVIEW_DIR);
}

// Remove all files in tests/ that are not .collected.json
const TESTS_DIR = path.join(BUILD_DIR, 'tests');
if (fs.existsSync(TESTS_DIR) && fs.statSync(TESTS_DIR).isDirectory()) {
  removeNonCollectedJsonFiles(TESTS_DIR);
  // Remove all directories that do not contain any .collected.json files
  walkDirsReverse(TESTS_DIR, dir => removeEmptyDirs(dir, TESTS_DIR));
}

log(`Cleanup completed for directory: ${BUILD_DIR}`);
if (DRY_RUN) {
  log('[DRY RUN] No files were actually removed.');
}
