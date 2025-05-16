#!/bin/bash

set -euf -o pipefail

# Decode and write GoogleService-Info.plist for iOS
if [ -n "$GOOGLE_SERVICES_PLIST_BASE64" ]; then
  echo "Decoding GOOGLE_SERVICES_PLIST_BASE64 to ios/GoogleService-Info.plist"
  mkdir -p ios
  echo "$GOOGLE_SERVICES_PLIST_BASE64" | base64 --decode > ios/GoogleService-Info.plist
else
  echo "Warning: GOOGLE_SERVICES_PLIST_BASE64 not set. Skipping GoogleService-Info.plist creation."
fi

# You can add similar logic for Android's google-services.json if needed
# if [ -n "$GOOGLE_SERVICES_JSON_BASE64" ]; then
#   echo "Decoding GOOGLE_SERVICES_JSON_BASE64 to android/app/google-services.json"
#   mkdir -p android/app
#   echo "$GOOGLE_SERVICES_JSON_BASE64" | base64 --decode > android/app/google-services.json
# else
#   echo "Warning: GOOGLE_SERVICES_JSON_BASE64 not set. Skipping google-services.json creation."
# fi 