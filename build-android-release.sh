#!/bin/bash
#
# EduSync — Android release build script
#
# Prerequisites:
#   1. Java JDK 17+ installed (Android Studio bundles this)
#   2. Android SDK installed (Android Studio bundles this)
#   3. A keystore file at android/app/edusync.keystore
#
# Step 1: Generate a keystore (only once, before first upload):
#   keytool -genkey -v -keystore android/app/edusync.keystore \
#     -alias edusync -keyalg RSA -keysize 2048 -validity 10000 \
#     -storepass easybus123 -keypass easybus123 \
#     -dname "CN=EduSync, OU=App, O=EduSync, L=City, ST=State, C=US"
#
#   IMPORTANT: Use your own password (not easybus123) for production.
#   BACK UP the keystore file somewhere safe. If you lose it, you cannot
#   update your app on the Play Store — you'd have to create a new listing.
#
# Step 2: Run this script to build the release AAB:
#   ./build-android-release.sh
#
# Step 3: Upload the .aab file to Google Play Console:
#   https://play.google.com/console/
#
#   Go to: Production > Create release > Upload the .aab file
#

set -e

echo "Building web assets..."
npm run build

echo "Syncing to Android..."
npx cap sync android

echo "Building EduSync Android release bundle (.aab)..."
cd android
./gradlew bundleEdusyncRelease

echo ""
echo "Done! Your EduSync release file is at:"
echo "  android/app/build/outputs/bundle/edusyncRelease/app-edusync-release.aab"
echo ""
echo "Upload this file to Google Play Console."
