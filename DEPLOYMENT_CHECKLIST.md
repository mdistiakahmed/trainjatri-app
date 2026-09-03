# Play Store Deployment Checklist

Use this checklist to track your deployment progress.

## Phase 1: Preparation (Before Starting)
- [ ] App fully tested and working
- [ ] All features complete
- [ ] No console errors or warnings
- [ ] Icons and splash screen finalized
- [ ] App name finalized: "TrainJatri"
- [ ] Package name confirmed: com.trainjatri.app

## Phase 2: Accounts Setup
- [ ] Expo account created (https://expo.dev)
- [ ] Google Play Console account created ($25 fee paid)
- [ ] Payment method added to Play Console

## Phase 3: Install Tools
- [ ] Node.js and npm installed
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Logged into EAS: `eas login`
- [ ] Project configured: `eas build:configure`

## Phase 4: Build App
- [ ] Test build created (APK): `eas build --platform android --profile preview`
- [ ] APK downloaded and tested on device
- [ ] All features working in test build
- [ ] Production build created (AAB): `eas build --platform android --profile production`
- [ ] AAB file downloaded

## Phase 5: Graphics Preparation
- [ ] App icon (512x512) ready
- [ ] Feature graphic (1024x500) created
- [ ] Screenshot 1: Home screen
- [ ] Screenshot 2: Train search/list
- [ ] Screenshot 3: Train details
- [ ] Screenshot 4: Station search/list
- [ ] Screenshot 5: Live tracking
- [ ] Screenshot 6: Quick access menu (optional)
- [ ] All screenshots are 1080x1920 or 1920x1080

## Phase 6: Store Listing Content
- [ ] Short description written (80 chars max)
- [ ] Full description written (from STORE_LISTING_CONTENT.md)
- [ ] Release notes written
- [ ] Privacy policy created (if needed)
- [ ] Contact email decided
- [ ] Website URL (optional)

## Phase 7: Google Play Console - App Setup
- [ ] App created in Play Console
- [ ] App name: "TrainJatri"
- [ ] Default language: English
- [ ] App/Game: App
- [ ] Free/Paid: Free
- [ ] Declarations accepted

## Phase 8: Google Play Console - Setup Tasks
- [ ] App access: Completed
- [ ] Ads declaration: Completed
- [ ] Content rating: Questionnaire completed
- [ ] Target audience: Age groups selected
- [ ] News app: No (completed)
- [ ] COVID-19 apps: No (completed)
- [ ] Data safety: Questions answered
- [ ] Government apps: No (completed)
- [ ] Financial features: No (completed)
- [ ] Health: No (completed)

## Phase 9: Main Store Listing
- [ ] App name entered
- [ ] Short description entered
- [ ] Full description entered
- [ ] App icon uploaded
- [ ] Feature graphic uploaded
- [ ] Phone screenshots uploaded (2-8)
- [ ] App category: Travel & Local
- [ ] Contact email added
- [ ] Website added (if available)

## Phase 10: Production Release
- [ ] "Production" track opened
- [ ] New release created
- [ ] AAB file uploaded
- [ ] Release notes added
- [ ] Changes saved
- [ ] Release reviewed

## Phase 11: Pricing & Distribution
- [ ] Pricing set to Free
- [ ] Countries selected (all or specific)
- [ ] Content guidelines checked
- [ ] Saved

## Phase 12: Submit
- [ ] All sections completed (green checkmarks)
- [ ] "Send for review" clicked
- [ ] Confirmation received
- [ ] Review status: In Review

## Phase 13: Post-Submission (Wait 1-7 days)
- [ ] App approved
- [ ] App live on Play Store
- [ ] Play Store link saved: https://play.google.com/store/apps/details?id=com.trainjatri.app
- [ ] Tested download from Play Store
- [ ] App installs correctly from store

## Phase 14: Launch
- [ ] Announced on website
- [ ] Shared on social media
- [ ] Shared with beta testers
- [ ] Friends and family notified

## Phase 15: Post-Launch Monitoring
- [ ] Check crash reports daily (first week)
- [ ] Monitor user reviews
- [ ] Respond to user feedback
- [ ] Track download numbers
- [ ] Plan first update based on feedback

---

## Quick Reference

### Build Command
```bash
eas build --platform android --profile production
```

### Submit Command
```bash
eas submit --platform android
```

### Check Status
```bash
eas build:list
```

### Play Store URL (after approval)
```
https://play.google.com/store/apps/details?id=com.trainjatri.app
```

---

## Estimated Timeline

- **Account Setup**: 1 hour
- **Graphics Preparation**: 2-4 hours
- **First Build**: 15-30 minutes (mostly waiting)
- **Store Listing Setup**: 1-2 hours
- **Google Review**: 1-7 days (usually 1-3 days)
- **Total**: 3-8 days from start to approval

---

## Common Issues & Solutions

### Issue: Build fails
**Solution**: Check logs in EAS dashboard, fix errors, rebuild

### Issue: Can't submit without privacy policy
**Solution**: Create simple privacy policy using template in STORE_LISTING_CONTENT.md

### Issue: Content rating rejected
**Solution**: Review answers, ensure consistency with app content

### Issue: App not appearing in search after approval
**Solution**: Wait 24-48 hours, ensure proper keywords in description

---

## Need Help?

- **Full Guide**: DEPLOYMENT_GUIDE.md
- **Store Content**: STORE_LISTING_CONTENT.md
- **Quick Start**: QUICK_START_DEPLOYMENT.md
- **Expo Docs**: https://docs.expo.dev/
- **Play Console Help**: https://support.google.com/googleplay/android-developer/

---

Progress: ☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐ 0/15 phases complete

Update this as you go! Good luck! 🚀
