#!/bin/bash

# Usage: ./clean_tests.sh [tests_folder] [--dry-run]

# Default values
TESTS_DIR="tests"
DRY_RUN=0

# Parse arguments
for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    DRY_RUN=1
  else
    TESTS_DIR="$arg"
  fi
done

if [ ! -d "$TESTS_DIR" ]; then
  echo "Error: Directory '$TESTS_DIR' does not exist."
  exit 1
fi

# Remove .DS_Store files first
find "$TESTS_DIR" -name ".DS_Store" | while read -r file; do
  if [ $DRY_RUN -eq 1 ]; then
    echo "[DRY RUN] Would remove .DS_Store: $file"
  else
    rm -f "$file"
    echo "Removed .DS_Store: $file"
  fi
done

# Remove all files at the root of the tests directory (not directories)
find "$TESTS_DIR" -maxdepth 1 -type f | while read -r file; do
  if [ $DRY_RUN -eq 1 ]; then
    echo "[DRY RUN] Would remove file: $file"
  else
    rm -f "$file"
    echo "Removed file: $file"
  fi
done

# Remove the resources folder if it exists at the root of the tests directory
RESOURCES_DIR="${TESTS_DIR}/resources"
if [ -d "$RESOURCES_DIR" ]; then
  if [ $DRY_RUN -eq 1 ]; then
    echo "[DRY RUN] Would remove resources directory: $RESOURCES_DIR"
  else
    rm -rf "$RESOURCES_DIR"
    echo "Removed resources directory: $RESOURCES_DIR"
  fi
fi

# Loop through each subdirectory in tests
find "$TESTS_DIR" -mindepth 1 -maxdepth 1 -type d | while read -r dir; do
  # Remove all files and folders except 'data' in each subdirectory
  find "$dir" -mindepth 1 -maxdepth 1 ! -name 'data' | while read -r item; do
    if [ $DRY_RUN -eq 1 ]; then
      echo "[DRY RUN] Would remove: $item"
    else
      rm -rf "$item"
      echo "Removed: $item"
    fi
  done

  DATA_DIR="${dir}/data"
  if [ -d "$DATA_DIR" ]; then
    # In the data directory, remove everything except assertions.csv and references.csv
    find "$DATA_DIR" -mindepth 1 ! -name 'assertions.csv' ! -name 'references.csv' | while read -r dataitem; do
      if [ $DRY_RUN -eq 1 ]; then
        echo "[DRY RUN] Would remove: $dataitem"
      else
        rm -rf "$dataitem"
        echo "Removed: $dataitem"
      fi
    done
  fi
done

echo "Cleanup completed for directory: $TESTS_DIR"
if [ $DRY_RUN -eq 1 ]; then
  echo "[DRY RUN] No files were actually removed."
fi
