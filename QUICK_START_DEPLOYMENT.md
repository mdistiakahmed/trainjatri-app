# Quick Deployment Commands

## First Time Setup (Run Once)

```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Login to Expo account
eas login

# 3. Configure EAS for your project
eas build:configure
```

## Build Commands

```bash
# Build APK for testing (faster, test on your device)
eas build --platform android --profile preview

# Build AAB for Play Store (production)
eas build --platform android --profile production

# Check build status
eas build:list
```

## Submit to Play Store

```bash
# Automated submission (recommended after first setup)
eas submit --platform android

# Check submission status
eas submission:list
```

## Before Building Checklist

- [ ] All features tested and working
- [ ] App icons and splash screen ready
- [ ] Version number updated in app.json
- [ ] Version code incremented (for updates)
- [ ] No console errors or warnings
- [ ] Screenshots prepared
- [ ] Store listing text ready
- [ ] Google Play Console account created ($25 fee)

## What Happens During Build

1. ⏳ Code uploaded to Expo servers (1-2 min)
2. 🔨 Android build starts (10-20 min)
3. 📦 Build completes, download link provided
4. ✅ Download and test APK or submit AAB

## Need Help?

- Full guide: See DEPLOYMENT_GUIDE.md
- Expo docs: https://docs.expo.dev/
- Build status: https://expo.dev/accounts/YOUR_ACCOUNT/projects/trainjatri-app/builds
