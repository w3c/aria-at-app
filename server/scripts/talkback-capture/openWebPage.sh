#!/bin/sh

SCRIPT_DIR="$(dirname "$0")"

# Source the common functions
. "$SCRIPT_DIR/common.sh"

# Check if URL is provided
if [ $# -eq 0 ]; then
  echo "Usage: $0 <url>"
  echo "Example: $0 https://example.com"
  exit 1
fi

URL="$1"

# Check if adb is available
if ! find_adb; then
  exit 1
fi

# Check if Chrome is installed
if ! check_chrome_installed; then
  exit 1
fi

# Open the URL in Chrome
echo "Opening $URL in Chrome..."
open_url_in_chrome "$URL"

if [ $? -eq 0 ]; then
  echo "URL opened successfully in Chrome"
else
  echo "Failed to open URL in Chrome"
  exit 1
fi
