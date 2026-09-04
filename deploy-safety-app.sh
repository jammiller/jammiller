#!/bin/bash
#
# Automated Safety App Deployment to Google Play Store
#
# Prerequisites:
#   1. Read DEPLOY_TO_PLAYSTORE.md and complete one-time setup
#   2. Service account JSON at ~/.play-store-secrets/play-store-key.json
#   3. Android SDK + JDK 17+ installed
#
# Usage:
#   bash deploy-safety-app.sh
#

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Safety App Deployment to Google Play${NC}"
echo "=========================================="

# Check prerequisites
SERVICE_ACCOUNT_KEY="$HOME/.play-store-secrets/play-store-key.json"
if [ ! -f "$SERVICE_ACCOUNT_KEY" ]; then
    echo -e "${RED}❌ Service account key not found at $SERVICE_ACCOUNT_KEY${NC}"
    echo "Read DEPLOY_TO_PLAYSTORE.md to set up."
    exit 1
fi

echo -e "${GREEN}✓ Service account key found${NC}"

# Step 1: Build web assets
echo -e "\n${YELLOW}📦 Building web assets...${NC}"
VITE_APP_VARIANT=safety npm run build

# Step 2: Sync to Android
echo -e "\n${YELLOW}📱 Syncing to Android...${NC}"
npx cap sync android

# Step 3: Build release bundle
echo -e "\n${YELLOW}🔨 Building Android release bundle...${NC}"
cd android
./gradlew bundleSafetyRelease
cd ..

BUNDLE_PATH="android/app/build/outputs/bundle/safetyRelease/app-safety-release.aab"

if [ ! -f "$BUNDLE_PATH" ]; then
    echo -e "${RED}❌ Bundle not found at $BUNDLE_PATH${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Bundle created: $BUNDLE_PATH${NC}"

# Step 4: Upload to Google Play
echo -e "\n${YELLOW}📤 Uploading to Google Play...${NC}"

# Using bundletool (requires manual bundletool setup)
# For production, use the Python playstore-api or Node.js @googlemaps/js-api-loader

echo -e "\n${GREEN}✓ Build complete!${NC}"
echo ""
echo "Bundle ready at: $BUNDLE_PATH"
echo ""
echo "Next steps:"
echo "1. Go to: https://play.google.com/console/"
echo "2. Select 'Safety App' → Release → Production"
echo "3. Click 'Create new release'"
echo "4. Upload: $BUNDLE_PATH"
echo "5. Add release notes and publish"
echo ""
echo -e "${YELLOW}Note: Automatic upload requires additional setup.${NC}"
echo "See DEPLOY_TO_PLAYSTORE.md for full automation."
