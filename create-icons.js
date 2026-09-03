const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Paths
const webPublic = path.join(__dirname, '..', 'trainjatri-web', 'public');
const appAssets = path.join(__dirname, 'assets', 'images');

// Brand colors
const LIGHT_BLUE = { r: 230, g: 244, b: 254 };
const FACEBOOK_BLUE = { r: 24, g: 119, b: 242 };
const WHITE = { r: 255, g: 255, b: 255 };

async function createIconWithBackground(logoPath, size, bgColor, padding) {
  const paddingPx = Math.floor(size * padding / 100);
  const logoSize = size - (2 * paddingPx);
  
  // Load and resize logo
  const logo = await sharp(logoPath)
    .resize(logoSize, logoSize, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  
  // Get actual logo dimensions after resize
  const logoMetadata = await sharp(logo).metadata();
  
  // Calculate center position
  const x = Math.floor((size - logoMetadata.width) / 2);
  const y = Math.floor((size - logoMetadata.height) / 2);
  
  // Create background and composite logo
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: bgColor
    }
  })
  .composite([{
    input: logo,
    left: x,
    top: y
  }]);
}

async function createTransparentIcon(logoPath, size, padding) {
  const paddingPx = Math.floor(size * padding / 100);
  const logoSize = size - (2 * paddingPx);
  
  // Load and resize logo
  const logo = await sharp(logoPath)
    .resize(logoSize, logoSize, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  
  // Get actual logo dimensions after resize
  const logoMetadata = await sharp(logo).metadata();
  
  // Calculate center position
  const x = Math.floor((size - logoMetadata.width) / 2);
  const y = Math.floor((size - logoMetadata.height) / 2);
  
  // Create transparent background and composite logo
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{
    input: logo,
    left: x,
    top: y
  }]);
}

async function createMonochromeIcon(logoPath, size, padding) {
  const paddingPx = Math.floor(size * padding / 100);
  const logoSize = size - (2 * paddingPx);
  
  // Load, convert to grayscale, and resize logo
  const logo = await sharp(logoPath)
    .greyscale()
    .resize(logoSize, logoSize, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  
  // Get actual logo dimensions
  const logoMetadata = await sharp(logo).metadata();
  
  // Calculate center position
  const x = Math.floor((size - logoMetadata.width) / 2);
  const y = Math.floor((size - logoMetadata.height) / 2);
  
  // Create white monochrome version
  const whiteLogo = await sharp(logo)
    .negate() // Invert to get white
    .toBuffer();
  
  // Create transparent background and composite
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{
    input: whiteLogo,
    left: x,
    top: y
  }]);
}

async function createIcons() {
  console.log('='.repeat(60));
  console.log('Creating TrainJatri App Icons');
  console.log('='.repeat(60));
  console.log('');
  
  const logoPath = path.join(webPublic, 'logo.png');
  
  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.error(`❌ Logo not found: ${logoPath}`);
    process.exit(1);
  }
  
  const logoMetadata = await sharp(logoPath).metadata();
  console.log(`✓ Using logo.png: ${logoMetadata.width}x${logoMetadata.height}`);
  console.log('');
  
  try {
    // 1. icon.png - Main app icon with white background
    console.log('1. Creating icon.png...');
    await (await createIconWithBackground(logoPath, 1024, WHITE, 15))
      .png()
      .toFile(path.join(appAssets, 'icon.png'));
    console.log('   ✓ icon.png saved (1024x1024, white background)');
    
    // 2. android-icon-foreground.png - Transparent for adaptive icon
    console.log('2. Creating android-icon-foreground.png...');
    await (await createTransparentIcon(logoPath, 1024, 20))
      .png()
      .toFile(path.join(appAssets, 'android-icon-foreground.png'));
    console.log('   ✓ android-icon-foreground.png saved (1024x1024, transparent)');
    
    // 3. android-icon-background.png - Solid color background
    console.log('3. Creating android-icon-background.png...');
    await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 3,
        background: LIGHT_BLUE
      }
    })
    .png()
    .toFile(path.join(appAssets, 'android-icon-background.png'));
    console.log('   ✓ android-icon-background.png saved (1024x1024, light blue)');
    
    // 4. android-icon-monochrome.png - White monochrome version
    console.log('4. Creating android-icon-monochrome.png...');
    await (await createMonochromeIcon(logoPath, 1024, 20))
      .png()
      .toFile(path.join(appAssets, 'android-icon-monochrome.png'));
    console.log('   ✓ android-icon-monochrome.png saved (1024x1024, white monochrome)');
    
    // 5. splash-icon.png - Splash screen with transparency
    console.log('5. Creating splash-icon.png...');
    await (await createTransparentIcon(logoPath, 1024, 25))
      .png()
      .toFile(path.join(appAssets, 'splash-icon.png'));
    console.log('   ✓ splash-icon.png saved (1024x1024, transparent)');
    
    // 6. favicon.png - Small favicon with Facebook blue background
    console.log('6. Creating favicon.png...');
    await (await createIconWithBackground(logoPath, 48, FACEBOOK_BLUE, 10))
      .png()
      .toFile(path.join(appAssets, 'favicon.png'));
    console.log('   ✓ favicon.png saved (48x48, Facebook blue background)');
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✨ All icons created successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log(`Icons saved to: ${appAssets}`);
    console.log('');
    console.log('Created files:');
    console.log('  - icon.png (1024x1024)');
    console.log('  - android-icon-foreground.png (1024x1024)');
    console.log('  - android-icon-background.png (1024x1024)');
    console.log('  - android-icon-monochrome.png (1024x1024)');
    console.log('  - splash-icon.png (1024x1024)');
    console.log('  - favicon.png (48x48)');
    console.log('');
    console.log('✓ Done! You can now delete the old React logo files:');
    console.log('  del assets\\images\\partial-react-logo.png');
    console.log('  del assets\\images\\react-logo.png');
    console.log('  del assets\\images\\react-logo@2x.png');
    console.log('  del assets\\images\\react-logo@3x.png');
    
  } catch (error) {
    console.error('❌ Error creating icons:', error);
    process.exit(1);
  }
}

// Run the icon creation
createIcons();
