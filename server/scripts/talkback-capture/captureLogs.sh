#!/bin/sh

SCRIPT_DIR="$(dirname "$0")"

# Source the common functions
. "$SCRIPT_DIR/common.sh"

TALKBACK_PACKAGE_NAME="com.google.android.marvin.talkback"
TALKBACK_LOGS_OUTPUT="$SCRIPT_DIR/talkback_capture.log"

# Flags
CLEAR_ADB_LOGS=false

while test $# -gt 0; do
  case "$1" in
  -h | --help)
    echo "options:"
    echo "-h, --help                show brief help"
    echo "-c, --clear-adb-logs      clear the device's adb logs after running this script"
    exit 0
    ;;
  -c | --clear-adb-logs)
    CLEAR_ADB_LOGS=true
    shift
    ;;
  *)
    break
    ;;
  esac
done

# Check if adb is available
if ! find_adb; then
  exit 1
fi

# Check if developer mode is enabled
if ! check_developer_mode; then
  exit 1
fi

echo "Capturing TalkBack logs at $TALKBACK_LOGS_OUTPUT ..."

$ADB_LOCATION logcat --pid=$($ADB_LOCATION shell pidof -s $TALKBACK_PACKAGE_NAME) -v threadtime -d >$TALKBACK_LOGS_OUTPUT

if [ $? -eq 0 ]; then
  echo "TalkBack logs captured successfully at $TALKBACK_LOGS_OUTPUT"
  if [ "$CLEAR_ADB_LOGS" = true ]; then
    echo "Clearing adb logs..."
    clear_logcat
  fi
else
  echo "Failed to capture TalkBack logs. Please check if TalkBack is running."
  exit 1
fi
