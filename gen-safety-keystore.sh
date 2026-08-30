#!/bin/bash
#
# Safety App — Generate a signing keystore for Google Play
#
# Run this ONCE on your local machine before building the release.
# Requires Java JDK 17+ (bundled with Android Studio).
#
# Usage:
#   ./gen-safety-keystore.sh
#
# After generating:
#   1. Back up android/app/safety.keystore somewhere safe (cloud, USB, etc.)
#   2. If you lose this file, you CANNOT update your app on the Play Store.
#   3. For CI/CD: base64-encode the keystore and add it as a GitHub secret
#      named SAFETY_KEYSTORE_BASE64. Also add:
#        SAFETY_KEYSTORE_PASSWORD, SAFETY_KEY_ALIAS, SAFETY_KEY_PASSWORD
#

set -e

KEYSTORE="android/app/safety.keystore"
ALIAS="safety"
STOREPASS="safety123"
KEYPASS="safety123"

if [ -f "$KEYSTORE" ]; then
  echo "Keystore already exists at $KEYSTORE — skipping."
  echo "If you need a new one, delete the existing file first."
  exit 0
fi

echo "Generating Safety App signing keystore..."

keytool -genkey -v \
  -keystore "$KEYSTORE" \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "$STOREPASS" \
  -keypass "$KEYPASS" \
  -dname "CN=SafetyApp, OU=App, O=DataPulse Social, L=City, ST=State, C=US"

echo ""
echo "Done! Keystore created at: $KEYSTORE"
echo ""
echo "IMPORTANT:"
echo "  1. Change the default password (safety123) for production use."
echo "  2. Back up this file — losing it means you can never update your app."
echo "  3. For CI: base64-encode it and add as GitHub secret SAFETY_KEYSTORE_BASE64."
echo ""
echo "  base64 $KEYSTORE | pbcopy    # macOS"
echo "  base64 -w 0 $KEYSTORE        # Linux"
