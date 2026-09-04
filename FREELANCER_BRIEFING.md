# Freelancer Briefing: Google Play Store Deployment Setup

**Project:** Deploy Safety App to Google Play Store (Automated)

**Duration:** 2–3 hours

**Budget:** $100–$150 USD

---

## What You Need Done

Set up automated deployment so the Safety App (`com.aaasa.safetyapp`) can be uploaded to Google Play Store with a single command.

**Repository:** https://github.com/jammiller/jammiller

**App Package Name:** `com.aaasa.safetyapp`

**App Store Link:** https://play.google.com/store/apps/details?id=com.aaasa.safetyapp

---

## Deliverables

The freelancer should:

1. **Create Google Cloud Service Account**
   - Set up a service account in Google Cloud Console
   - Generate a JSON key file
   - Download and securely store it

2. **Grant Play Store Permissions**
   - Add the service account to Google Play Console
   - Give it **Admin** role for the Safety App

3. **Store Credentials Securely**
   - Save the JSON key to `~/.play-store-secrets/play-store-key.json` on your local machine
   - This file should **never** be committed to Git

4. **Set Up Build Environment**
   - Ensure Android SDK and JDK 17+ are installed
   - Verify Capacitor is configured for Android
   - Test the build process once locally

5. **Verify Automated Deployment**
   - Run `bash deploy-safety-app.sh` to test the full workflow
   - Confirm the `.aab` (Android App Bundle) is generated at:
     ```
     android/app/build/outputs/bundle/safetyRelease/app-safety-release.aab
     ```

6. **Provide Instructions**
   - Document any additional setup steps needed
   - Provide clear instructions for you to follow in the future

---

## Technical Requirements

- **OS:** macOS, Linux, or Windows (with WSL)
- **Prerequisites:** Android Studio or Android SDK command-line tools
- **Language:** Bash scripting (already provided in repo)
- **Repository Access:** You'll give them access to your GitHub repo

---

## What's Already in Your Repo

- Build scripts: `build-android-safety-release.sh`
- Deployment guide: `DEPLOY_TO_PLAYSTORE.md`
- Deploy script: `deploy-safety-app.sh`

The freelancer just needs to:
- Complete the Google Cloud setup
- Test everything works
- Hand over the credentials securely

---

## After Setup: How You'll Use It

Once done, here's what you do:

```bash
# Pull latest code
git pull

# Run the deployment script (builds + prepares for upload)
bash deploy-safety-app.sh

# Then go to Google Play Console and click upload
# (or ask the freelancer to do this step for you too)
```

That's it. No coding required.

---

## Security Note

**Important:** The Google Cloud JSON key file is sensitive. 

- The freelancer should create it, but **you** store it on your machine
- Never commit it to Git
- Never share it publicly
- Store in: `~/.play-store-secrets/play-store-key.json`

---

## Interview Questions for Freelancer

Ask them:

1. "Have you worked with Google Play deployment before?"
2. "Can you set up Google Cloud service accounts and JSON keys?"
3. "Are you familiar with Android app builds (Gradle, APK/AAB)?"
4. "Can you verify the build works end-to-end before handing it off?"

---

## Platforms to Find Freelancers

- **Upwork** (search: "Google Play Store deployment" + "Android")
- **Fiverr** (search: "Android app deployment")
- **PeoplePerHour**
- **Toptal** (higher quality, higher cost)

---

## Expected Timeline

- **Day 1:** Freelancer sets up Google Cloud + Play Store access
- **Day 1–2:** Tests build process locally
- **Day 2:** Hands over working setup + instructions
- **You:** Upload to Play Store (or ask them to)

---

## After Delivery Checklist

Ask the freelancer to confirm:

- [ ] Google Cloud service account created
- [ ] JSON key securely stored at `~/.play-store-secrets/play-store-key.json`
- [ ] Service account added to Google Play Console with Admin access
- [ ] `bash deploy-safety-app.sh` runs successfully
- [ ] Release `.aab` file generated without errors
- [ ] Written instructions provided for future deploys
- [ ] All sensitive files are `.gitignore`d and never committed

---

## Questions?

If the freelancer asks, refer them to:
- `DEPLOY_TO_PLAYSTORE.md` in your repo
- Google Play Developer API docs: https://developers.google.com/play/developer/api
- Capacitor Android docs: https://capacitorjs.com/docs/android

---

**You're not a developer—this is not your job. Hire it out. Rest easy.** ✅
