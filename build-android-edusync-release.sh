#!/bin/bash
set -e

VITE_APP_VARIANT=edusync npm run build
npx cap sync android
cd android
./gradlew bundleEdusyncRelease

echo "EduSync bundle: android/app/build/outputs/bundle/edusyncRelease/app-edusync-release.aab"
