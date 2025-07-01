#!/bin/sh

SCRIPT_DIR="$(dirname "$0")"

# Source the common functions
. "$SCRIPT_DIR/common.sh"

TALKBACK_PACKAGE_NAME="com.google.android.marvin.talkback"

# Initialize temporary utterances file; remove on interrupt
TEMP_FILE=$(mktemp)
trap 'rm -f "$TEMP_FILE"' EXIT

# Flags
VERBOSE=false
DISPLAY_ALL_LINES=false

while test $# -gt 0; do
  case "$1" in
  -h | --help)
    echo "options:"
    echo "-h, --help                show brief help"
    echo "-v, --verbose             show entire TalkBack output line for any given utterance"
    echo "-a, --display-all-lines   show all TalkBack output lines, even if no clear utterances to be captured. \"--verbose\" will be automatically enabled"
    exit 0
    ;;
  -v | --verbose)
    VERBOSE=true
    shift
    ;;
  -a | --display-all-lines)
    VERBOSE=true
    DISPLAY_ALL_LINES=true
    shift
    ;;
  *)
    break
    ;;
  esac
done

# Handle interrupt to capture the collected utterances
cleanup() {
  echo "\n\nCollected utterances:"
  if [ -s "$TEMP_FILE" ]; then
    utterances=$(cat "$TEMP_FILE")
    echo "$utterances"
    # Copy to clipboard
    echo "$utterances" | pbcopy
    echo "\nCopied to clipboard"
  else
    echo "No utterances were collected."
  fi
  exit 0
}

# Set up trap for interrupt signal (Ctrl+C)
trap cleanup INT

if ! find_adb; then
  exit 1
fi

if ! check_developer_mode; then
  exit 1
fi

if ! check_talkback_enabled; then
  echo "TalkBack is not enabled. You can run enableTalkback.sh to enable it."
  exit 1
fi

echo "\nUtterances will continue to be collected until the end of the example is found.\nYou can also press Ctrl+C to stop capturing and display the collected utterances\n"
echo "Starting to capture TalkBack logs..."
echo "Please press the 'Run Test Setup' button now..."

# Clear any existing logcat buffer
$ADB_LOCATION logcat -c

# Start capturing logs and filter for TalkBack utterances
$ADB_LOCATION logcat --pid=$($ADB_LOCATION shell pidof -s $TALKBACK_PACKAGE_NAME) | grep -i "talkback\|utterance" | while read -r line; do
  # Look for ACTION_CLICK and Run Test Setup in the same line
  # https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo.AccessibilityAction#ACTION_CLICK
  if echo "$line" | grep -q "text.*Run Test Setup"; then
    echo "--- Start of Example ---\n"
    # Continue capturing the next utterances
    while read -r next_line; do
      if [ "$DISPLAY_ALL_LINES" = true ]; then
        echo "$next_line"
      fi

      # Check for "End of Example" text
      if echo "$next_line" | grep -q "End of Example"; then
        echo "\n--- End of Example ---"
        cleanup
      fi

      # Extract text from lines containing "text="
      if echo "$next_line" | grep -q "text=.*utterance"; then
        if [ "$VERBOSE" = true ] && [ "$DISPLAY_ALL_LINES" = false ]; then
          echo "$next_line"
        fi

        new_utterance=$(echo "$next_line" | sed 's/.*text="\([^"]*\)".*/\1/')
        echo "$new_utterance"

        # Join the utterances with double spaces. This is to match how other ATs' utterances have been getting captured; (TODO: formatting in that way may not be necessary -- revisit)
        printf "%s  " "$new_utterance" >> "$TEMP_FILE"
      fi
    done
  fi
done
