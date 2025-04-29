#!/bin/sh

TALKBACK_PACKAGE_NAME="com.google.android.marvin.talkback"

# Function to check if adb exists at location and is executable
check_adb_location() {
  if [ -x "$1" ]; then
    ADB_LOCATION="$1"
    echo "adb found at: $1"
    return 0
  fi
  return 1
}

# Function to find adb in common locations
find_adb() {
  CURRENT_USER=$(whoami)

  # Check if adb is available in PATH
  if command -v adb >/dev/null 2>&1; then
    ADB_LOCATION="adb"
    echo "adb found in PATH"
    return 0
  fi

  # Possible adb locations
  for location in "/Users/$CURRENT_USER/Library/Android/sdk/platform-tools/adb" \
    "/Users/$CURRENT_USER/Android/sdk/platform-tools/adb" \
    "/opt/android-sdk/platform-tools/adb" \
    "/usr/local/opt/android-platform-tools/bin/adb" \
    "/usr/local/bin/adb" \
    "/usr/bin/adb" \
    "/opt/homebrew/bin/adb" \
    "/opt/homebrew/opt/android-platform-tools/bin/adb"; do
    if check_adb_location "$location"; then
      return 0
    fi
  done

  # If we still haven't found adb
  echo "adb not found. Please either:"
  echo "1. Install Android SDK Platform Tools and add it to your PATH, or"
  echo "2. Move adb to any of the following locations"
  echo
  echo "Common installation locations checked:"
  echo "/Users/$CURRENT_USER/Library/Android/sdk/platform-tools/adb"
  echo "/Users/$CURRENT_USER/Android/sdk/platform-tools/adb"
  echo "/opt/android-sdk/platform-tools/adb"
  echo "/usr/local/opt/android-platform-tools/bin/adb"
  echo "/usr/local/bin/adb"
  echo "/usr/bin/adb"
  echo "/opt/homebrew/bin/adb"
  echo "/opt/homebrew/opt/android-platform-tools/bin/adb"
  return 1
}

# Function to check if developer mode is enabled
check_developer_mode() {
  if ! $ADB_LOCATION shell settings get global development_settings_enabled 2>/dev/null | grep -q "1"; then
    echo "Developer mode is not enabled on the device."
    echo "Please enable Developer mode by doing the following:"
    echo "1. Go to Settings > About phone"
    echo "2. Tap 'Build number' 7 times"
    echo "3. Go back to Settings > System > Developer options"
    echo "4. Enable 'Developer options'"
    echo "5. Enable 'USB Debugging'"
    return 1
  fi
  return 0
}

# Function to check if TalkBack is installed
check_talkback_installed() {
  if ! $ADB_LOCATION shell pm list packages | grep -q "$TALKBACK_PACKAGE_NAME"; then
    echo "TalkBack is not installed on the device."
    echo "Please install TalkBack from the Google Play Store."
    return 1
  fi
  return 0
}

# Function to check if TalkBack is enabled
check_talkback_enabled() {
  if ! $ADB_LOCATION shell settings get secure enabled_accessibility_services | grep -q "$TALKBACK_PACKAGE_NAME"; then
    return 1
  fi
  return 0
}

# Function to enable TalkBack
enable_talkback() {
  $ADB_LOCATION shell settings put secure enabled_accessibility_services $TALKBACK_PACKAGE_NAME/$TALKBACK_PACKAGE_NAME.TalkBackService
  $ADB_LOCATION shell settings put secure accessibility_verbose_logging 1
  $ADB_LOCATION shell settings put secure accessibility_enabled 1
}

# Function to disable TalkBack
disable_talkback() {
  $ADB_LOCATION shell settings put secure enabled_accessibility_services $TALKBACK_PACKAGE_NAME/NONE
  $ADB_LOCATION shell settings put secure accessibility_verbose_logging 0
  $ADB_LOCATION shell settings put secure accessibility_enabled 0
}

# Function to clear logcat buffer
clear_logcat() {
  $ADB_LOCATION logcat -c
}

# Function to check if Chrome is installed
check_chrome_installed() {
  if ! $ADB_LOCATION shell pm list packages | grep -q "com.android.chrome"; then
    echo "Chrome is not installed on the device."
    echo "Please install Chrome from the Google Play Store."
    return 1
  fi
  return 0
}

# Function to open URL in Chrome
open_url_in_chrome() {
  $ADB_LOCATION shell am start -n com.android.chrome/com.google.android.apps.chrome.Main -a android.intent.action.VIEW -d "$1"
}
