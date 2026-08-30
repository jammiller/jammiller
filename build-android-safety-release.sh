#!/bin/bash
set -e

VITE_APP_VARIANT=safety npm run build
npx cap sync android
cd android
./gradlew bundleSafetyRelease

echo "Safety App bundle: android/app/build/outputs/bundle/safetyRelease/app-safety-release.aab"
