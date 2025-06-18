#!/bin/sh

SCRIPT_DIR="$(dirname "$0")"

# Source the common functions
. "$SCRIPT_DIR/common.sh"

# Check if adb is available
if ! find_adb; then
  exit 1
fi

# Check if developer mode is enabled
if ! check_developer_mode; then
  exit 1
fi

# Check if TalkBack is installed
if ! check_talkback_installed; then
  exit 1
fi

# Check if TalkBack is already enabled
if check_talkback_enabled; then
  echo "TalkBack is already enabled."
  exit 0
fi

echo "Enabling TalkBack..."
enable_talkback

if ! check_talkback_enabled; then
  echo "Failed to enable TalkBack."
  exit 1
else
  echo "TalkBack has been enabled."
  exit 0
fi
