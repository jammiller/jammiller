# Automated Google Play Store Deployment

This guide gets you from zero to deploying the Safety App to Google Play in ~10 minutes.

## One-Time Setup (5 minutes)

### Step 1: Create Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Service Accounts**
4. Click **Create Service Account**
5. Name: `play-store-deployer`
6. Click **Create and Continue**
7. Click **Continue** (skip the optional grant step for now)
8. Click **Create Key** → **JSON** → **Create**
   - A file `*.json` will download — **save this securely**
9. Go back to the service account, copy the email (looks like `play-store-deployer@...iam.gserviceaccount.com`)

### Step 2: Grant Play Store Access

1. Go to [Google Play Console](https://play.google.com/console/)
2. Select your Safety App
3. Go to **Settings** → **User and permissions**
4. Click **Invite user**
5. Paste the service account email from Step 1
6. Give it **Admin** role
7. Click **Send invite**

### Step 3: Store Credentials Locally (NOT in Git)

```bash
# Create a secrets directory
mkdir -p ~/.play-store-secrets

# Copy your downloaded JSON file here
cp ~/Downloads/your-service-account-file.json ~/.play-store-secrets/play-store-key.json

# Protect it
chmod 600 ~/.play-store-secrets/play-store-key.json
```

### Step 4: Install Deployment Tool

```bash
npm install --save-dev @googlemaps/js-api-loader google-play-developer-api
# Or use bundletool (recommended)
npm install --save-dev bundletool
```

## Deploy (One Command)

Once setup is done, deploy with:

```bash
./deploy-safety-app.sh
```

This will:
1. Build the web assets
2. Sync to Android
3. Build the release bundle (`app-safety-release.aab`)
4. Upload to Google Play (Safety App)
5. You're done ✓

## Troubleshooting

**"Permission denied" on upload?**
- Verify service account has Admin role in Play Console

**"Keystore not found"?**
- Run: `bash gen-safety-keystore.sh`

**"Build failed"?**
- Ensure Android SDK is installed
- Run: `npm run cap:add:android`

## Manual Upload (Fallback)

If the script fails, upload manually:

1. Find your bundle: `android/app/build/outputs/bundle/safetyRelease/app-safety-release.aab`
2. Go to [Google Play Console](https://play.google.com/console/) → Safety App
3. **Release** → **Production** → **Create new release**
4. Upload the `.aab` file
5. Add release notes
6. Click **Review and publish**

---

**Questions?** Check the script comments or reference Google's [Play Developer API docs](https://developers.google.com/play/developer/api).
