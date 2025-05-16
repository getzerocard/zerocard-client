#!/usr/bin/env bash
set -eo pipefail

# Ensure the script exits if any command fails
# and prints commands before executing them (optional, for debugging)
# set -x 

echo "EAS Build: Pre-build hook started."

# Decode and save the GoogleService-Info.plist for iOS
if [ -n "$GOOGLE_SERVICES_PLIST_BASE64" ]; then
  # Ensure the ios directory exists
  mkdir -p ./ios

  # Define the path for the GoogleService-Info.plist
  # If your project has a nested structure like ios/YourProjectName/, adjust this path.
  # For example: IOS_PLIST_PATH="./ios/YourProjectName/GoogleService-Info.plist"
  IOS_PLIST_PATH="./ios/GoogleService-Info.plist"

  echo "Decoding GOOGLE_SERVICES_PLIST_BASE64 to $IOS_PLIST_PATH..."
  echo "$GOOGLE_SERVICES_PLIST_BASE64" | base64 --decode > "$IOS_PLIST_PATH"
  
  if [ $? -eq 0 ]; then
    echo "Successfully created $IOS_PLIST_PATH"
  else
    echo "Error: Failed to decode or save $IOS_PLIST_PATH"
    exit 1
  fi
else
  echo "Warning: GOOGLE_SERVICES_PLIST_BASE64 environment variable is not set or is empty."
  # Depending on your project, you might want to make this an error:
  # echo "Error: GOOGLE_SERVICES_PLIST_BASE64 is required but not set."
  # exit 1
fi

echo "EAS Build: Pre-build hook finished." 