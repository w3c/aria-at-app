#!/bin/bash

# Usage: ./cleanup_build.sh [build_folder] [--dry-run]

# Default values
BUILD_DIR="build"
DRY_RUN=0

# Parse arguments
for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    DRY_RUN=1
  else
    BUILD_DIR="$arg"
  fi
done

if [ ! -d "$BUILD_DIR" ]; then
  echo "Error: Directory '$BUILD_DIR' does not exist."
  exit 1
fi

# Remove .DS_Store files first
find "$BUILD_DIR" -name ".DS_Store" | while read -r file; do
  if [ $DRY_RUN -eq 1 ]; then
    echo "[DRY RUN] Would remove .DS_Store: $file"
  else
    rm -f "$file"
    echo "Removed .DS_Store: $file"
  fi
done

# Remove all files at the root of the build directory (not directories)
find "$BUILD_DIR" -maxdepth 1 -type f | while read -r file; do
  if [ $DRY_RUN -eq 1 ]; then
    echo "[DRY RUN] Would remove file: $file"
  else
    rm -f "$file"
    echo "Removed file: $file"
  fi
done

# Remove the review folder if it exists at the root of the build directory
REVIEW_DIR="${BUILD_DIR}/review"
if [ -d "$REVIEW_DIR" ]; then
  if [ $DRY_RUN -eq 1 ]; then
    echo "[DRY RUN] Would remove review directory: $REVIEW_DIR"
  else
    rm -rf "$REVIEW_DIR"
    echo "Removed review directory: $REVIEW_DIR"
  fi
fi

# Remove all files that are not .collected.json
TESTS_DIR="${BUILD_DIR}/tests"
find "$TESTS_DIR" -type f ! -name "*.collected.json" | while read -r file; do
  if [ $DRY_RUN -eq 1 ]; then
    echo "[DRY RUN] Would remove file: $file"
  else
    rm -f "$file"
    echo "Removed file: $file"
  fi
done

# Remove all directories that do not contain any .collected.json files
find "$TESTS_DIR" -type d | sort -r | while read -r dir; do
  # Skip the root tests dir
  if [ "$dir" = "$TESTS_DIR" ]; then
    continue
  fi
  # If the directory does not contain any .collected.json files, remove it
  if ! find "$dir" -type f -name "*.collected.json" | grep -q .; then
    if [ $DRY_RUN -eq 1 ]; then
      echo "[DRY RUN] Would remove directory: $dir"
    else
      rm -rf "$dir"
      echo "Removed directory: $dir"
    fi
  fi
done

echo "Cleanup completed for directory: $BUILD_DIR"
if [ $DRY_RUN -eq 1 ]; then
  echo "[DRY RUN] No files were actually removed."
fi
