#!/bin/bash
set -e

VITE_APP_VARIANT=statslab npm run build
npx cap sync android
cd android
./gradlew bundleStatslabRelease

echo "StatsLab bundle: android/app/build/outputs/bundle/statslabRelease/app-statslab-release.aab"
