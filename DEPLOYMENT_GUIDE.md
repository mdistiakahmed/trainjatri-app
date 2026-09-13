# Google Play Store Deployment Guide

This guide will walk you through deploying your TrainJatri app to the Google Play Store for the first time.

## Prerequisites

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Create an Expo Account

- Go to https://expo.dev/signup
- Sign up for a free account
- Verify your email

### 3. Login to EAS

```bash
eas login
```

### 4. Create a Google Play Console Account

- Go to https://play.google.com/console
- Pay the one-time $25 registration fee
- Complete the account setup

## Step 1: Configure Your App

### Update app.json (Already Done)

Your `app.json` is already configured with:

- Package name: `com.trainjatri.app`
- App name: `TrainJatri`
- Version: `1.0.0`
- Version code: `1`

### Create EAS Build Configuration

Run this command to create `eas.json`:

```bash
eas build:configure
```

This will create an `eas.json` file. Update it to look like this:

```json
{
  "cli": {
    "version": ">= 13.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Step 1b: Firebase `google-services.json` (EAS secret)

Do **not** commit `google-services.json`. It is gitignored because GitHub treats the API key as a secret.

Keep the file locally as `./google-services.json`. From the **app project directory** (`trainjatri-app/`, not the parent folder), upload it to EAS once per environment before you build:

```bash
cd trainjatri-app
eas env:set --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --environment production --visibility secret
eas env:set --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --environment preview --visibility secret
```

`app.config.js` uses `GOOGLE_SERVICES_JSON` on EAS builds, and falls back to `./google-services.json` on your machine.

If you later download a new Firebase config, run the same commands again (or update the existing env vars in the Expo dashboard).

## Step 2: Build Your App

### For Testing (APK)

Build an APK to test on your device first:

```bash
eas build --platform android --profile preview
```

This will:

1. Upload your code to Expo's servers
2. Build an APK file
3. Provide a download link when complete (takes 10-20 minutes)

Download and install the APK on your Android device to test.

### For Production (AAB)

Once testing is complete, build the production app bundle:

```bash
eas build --platform android --profile production
```

This creates an `.aab` (Android App Bundle) file optimized for Play Store.

**Important:** During the build, EAS will ask if you want to generate a new keystore. Select **YES** and let EAS manage it for you.

## Step 3: Prepare Store Listing Materials

Before submitting, prepare these materials:

### Required Graphics

1. **App Icon** (already have: `icon.png`)
   - 512x512 PNG
   - No transparency

2. **Feature Graphic**
   - 1024x500 PNG or JPG
   - Showcases your app

3. **Screenshots** (2-8 required)
   - Phone: 16:9 or 9:16 ratio
   - Recommended: 1080x1920 or 1920x1080
   - Take screenshots of:
     - Home screen
     - Train search/list
     - Train details
     - Station search
     - Live tracking

### Required Text Content

1. **Short Description** (max 80 characters)

   ```
   Complete Bangladesh Railway guide with train schedules & live tracking
   ```

2. **Full Description** (max 4000 characters)

   ```
   TrainJatri - Your Complete Bangladesh Railway Guide

   Find train schedules, track trains in real-time, and get comprehensive station information for all major routes across Bangladesh.

   FEATURES:
   • Complete Train Schedules - Access detailed schedules for all trains with arrival and departure times
   • Station Information - View all trains departing from major railway stations
   • Live Train Tracking - Track trains in real-time via SMS integration
   • Bilingual Support - Browse in both English and Bengali
   • Quick Access - Save your favorite trains, stations, and routes
   • Offline Ready - Access train schedules without internet connection
   • Dark Mode - Comfortable viewing in any lighting condition

   PERFECT FOR:
   • Daily commuters
   • Travelers exploring Bangladesh
   • Anyone planning railway journeys

   COVERAGE:
   All major routes including Dhaka, Chattogram, Sylhet, Rajshahi, Khulna, Rangpur, and more.

   Download TrainJatri today and make your railway journey planning effortless!
   ```

3. **Privacy Policy URL** (optional but recommended)
   - Create a simple privacy policy page
   - Host it on your website or GitHub Pages

## Step 4: Create App in Google Play Console

### 1. Create New App

1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in:
   - App name: `TrainJatri`
   - Default language: `English (United States)`
   - App or game: `App`
   - Free or paid: `Free`
4. Accept declarations and click "Create app"

### 2. Complete Setup Checklist

#### App Access

- Select "All functionality is available without special access"
- Click Save

#### Ads

- Select whether your app contains ads (currently no)
- Click Save

#### Content Rating

1. Click "Start questionnaire"
2. Enter your email
3. Select category: `Utility, Productivity, Communication, or Other`
4. Answer all questions honestly
5. Submit and save rating

#### Target Audience

1. Select age groups (e.g., 13+)
2. Appeal to children: No
3. Click Save

#### News App

- Select No
- Click Save

#### COVID-19 Contact Tracing & Status Apps

- Select No
- Click Save

#### Data Safety

1. Click "Start"
2. Answer questions about data collection:
   - Does your app collect user data? `No` (unless you add analytics)
   - Does your app share user data? `No`
3. Click Save

#### Government Apps

- Select No
- Click Save

#### Financial Features

- Select No
- Click Save

#### Health

- Select No
- Click Save

## Step 5: Create Release

### 1. Production Track

1. In left menu, go to "Production"
2. Click "Create new release"

### 2. Upload App Bundle

1. Click "Upload"
2. Upload the `.aab` file from EAS build
   - Download it from the EAS build page
   - Or use: `eas submit --platform android` (automated)

### 3. Release Name

- Automatically filled (e.g., "1 (1.0.0)")

### 4. Release Notes

```
Initial release

Features:
• Complete train schedules for all routes
• Station-wise train information
• Live train tracking
• Bilingual (English/Bengali) interface
• Quick access to favorites
• Dark mode support
```

### 5. Click "Save" then "Review Release"

## Step 6: Store Listing

### 1. Main Store Listing

Go to "Store presence" > "Main store listing"

Fill in:

- **App name**: TrainJatri
- **Short description**: (from above)
- **Full description**: (from above)
- **App icon**: Upload your 512x512 icon
- **Feature graphic**: Upload 1024x500 graphic
- **Phone screenshots**: Upload 2-8 screenshots

### 2. Categorization

- **App category**: Travel & Local
- **Tags**: railway, train, schedule, tracking, bangladesh

### 3. Contact Details

- Email: your-email@example.com
- Website: (optional)
- Phone: (optional)

### 4. Click "Save"

## Step 7: Pricing & Distribution

1. Go to "Pricing and distribution"
2. **Pricing**: Free
3. **Countries**: Select all or specific countries
   - Recommended: Select all for maximum reach
   - Or focus on: Bangladesh, India, Pakistan
4. **Content guidelines**: Check the box
5. Click "Save"

## Step 8: Submit for Review

1. Go back to "Production" release
2. Click "Send X changes for review"
3. Review will take 1-7 days (usually 1-3 days)

## Step 9: After Approval

Once approved:

1. Your app will be live on Play Store
2. Update the website with Play Store link
3. Share with users!

## Automated Submission (Alternative)

Instead of manually uploading, use EAS Submit:

```bash
# First time - generates and downloads service account key
eas submit --platform android

# Follow the prompts to:
# 1. Select the build to submit
# 2. Create Google Service Account
# 3. Download JSON key file
# 4. EAS will submit to Play Store automatically
```

## Future Updates

When you want to release updates:

1. Update version in `app.json`:

   ```json
   {
     "version": "1.1.0",
     "android": {
       "versionCode": 2
     }
   }
   ```

   **Important**: Always increment `versionCode` for each release!

2. Build new version:

   ```bash
   eas build --platform android --profile production
   ```

3. Submit to Play Store:
   ```bash
   eas submit --platform android
   ```

## Troubleshooting

### Build Fails

- Check error logs in EAS dashboard
- Common issues:
  - Missing dependencies: `npm install`
  - Outdated packages: `npm update`
  - TypeScript errors: Fix before building

### Submission Rejected

- Read rejection reason carefully
- Common issues:
  - Missing privacy policy
  - Unclear app purpose
  - Content rating issues
  - Target audience conflicts

### App Not Appearing in Search

- Wait 24-48 hours after approval
- Optimize store listing with keywords
- Get initial downloads/reviews

## Useful Commands

```bash
# Check build status
eas build:list

# View submission status
eas submission:list

# Update credentials
eas credentials

# View project info
eas project:info

# Upload Firebase google-services.json (run from trainjatri-app/, do not commit this file)
eas env:set --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --environment production --visibility secret
eas env:set --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --environment preview --visibility secret
```

## Resources

- Expo Documentation: https://docs.expo.dev/
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/
- Play Console Help: https://support.google.com/googleplay/android-developer/

## Costs

- **Google Play Console**: $25 one-time fee
- **EAS Build**: Free tier includes builds (check current limits)
- **App Store Fees**: 0% for first $1M revenue (if you add paid features)

## Next Steps After Launch

1. Monitor crash reports in Play Console
2. Respond to user reviews
3. Plan feature updates based on feedback
4. Consider iOS version (similar process)
5. Add analytics (Google Analytics, Firebase)
6. Implement actual Google AdMob ads

---

Good luck with your deployment! 🚀
