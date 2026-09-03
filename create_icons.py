from PIL import Image, ImageDraw, ImageOps
import os

# Paths
web_public = r"d:\train-jatri-app\trainjatri-web\public"
app_assets = r"d:\train-jatri-app\trainjatri-app\assets\images"

# Check existing logos
print("Checking existing logos from web app:")
for logo_file in ['logo.png', 'new_logo.png', 'final_1.png']:
    logo_path = os.path.join(web_public, logo_file)
    if os.path.exists(logo_path):
        img = Image.open(logo_path)
        print(f"{logo_file}: {img.size[0]}x{img.size[1]} pixels, mode: {img.mode}")
        img.close()

print("\n" + "="*60)
print("Creating app icons...")
print("="*60 + "\n")

# Load the main logo
logo_path = os.path.join(web_public, 'logo.png')
logo = Image.open(logo_path)
print(f"Using logo.png as base: {logo.size[0]}x{logo.size[1]}")

# Define brand colors
LIGHT_BLUE = "#E6F4FE"
FACEBOOK_BLUE = "#1877F2"
WHITE = "#FFFFFF"

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_icon_with_background(logo_img, size, bg_color, padding_percent=15):
    """Create icon with logo centered on colored background"""
    # Create background
    icon = Image.new('RGB', size, hex_to_rgb(bg_color))
    
    # Calculate logo size with padding
    padding = int(size[0] * padding_percent / 100)
    logo_size = size[0] - (2 * padding)
    
    # Resize logo maintaining aspect ratio
    logo_resized = logo_img.copy()
    logo_resized.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Calculate position to center logo
    x = (size[0] - logo_resized.width) // 2
    y = (size[1] - logo_resized.height) // 2
    
    # Paste logo (handle transparency if present)
    if logo_resized.mode == 'RGBA':
        icon.paste(logo_resized, (x, y), logo_resized)
    else:
        icon.paste(logo_resized, (x, y))
    
    return icon

def create_transparent_icon(logo_img, size, padding_percent=20):
    """Create icon with transparent background (for foreground layers)"""
    # Create transparent background
    icon = Image.new('RGBA', size, (0, 0, 0, 0))
    
    # Calculate logo size with padding
    padding = int(size[0] * padding_percent / 100)
    logo_size = size[0] - (2 * padding)
    
    # Resize logo maintaining aspect ratio
    logo_resized = logo_img.copy()
    if logo_resized.mode != 'RGBA':
        logo_resized = logo_resized.convert('RGBA')
    logo_resized.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Calculate position to center logo
    x = (size[0] - logo_resized.width) // 2
    y = (size[1] - logo_resized.height) // 2
    
    # Paste logo
    icon.paste(logo_resized, (x, y), logo_resized)
    
    return icon

def create_monochrome_icon(logo_img, size, padding_percent=20):
    """Create white monochrome version for themed icons"""
    # Create transparent background
    icon = Image.new('RGBA', size, (0, 0, 0, 0))
    
    # Calculate logo size with padding
    padding = int(size[0] * padding_percent / 100)
    logo_size = size[0] - (2 * padding)
    
    # Convert logo to grayscale then to monochrome
    logo_gray = logo_img.copy().convert('L')
    logo_resized = logo_gray.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Create white version with alpha from grayscale
    logo_mono = Image.new('RGBA', logo_resized.size)
    pixels = logo_mono.load()
    gray_pixels = logo_resized.load()
    
    for y in range(logo_resized.height):
        for x in range(logo_resized.width):
            gray_val = gray_pixels[x, y]
            # Use gray value as alpha, make pixel white
            alpha = 255 if gray_val > 128 else 0
            pixels[x, y] = (255, 255, 255, alpha)
    
    # Calculate position to center
    x = (size[0] - logo_mono.width) // 2
    y = (size[1] - logo_mono.height) // 2
    
    # Paste on transparent background
    icon.paste(logo_mono, (x, y), logo_mono)
    
    return icon

# 1. Create icon.png (main app icon - 1024x1024, no transparency)
print("1. Creating icon.png...")
icon_main = create_icon_with_background(logo, (1024, 1024), WHITE, padding_percent=15)
icon_main.save(os.path.join(app_assets, 'icon.png'), 'PNG')
print("   ✓ icon.png saved (1024x1024, white background)")

# 2. Create android-icon-foreground.png (1024x1024, with transparency)
print("2. Creating android-icon-foreground.png...")
icon_foreground = create_transparent_icon(logo, (1024, 1024), padding_percent=20)
icon_foreground.save(os.path.join(app_assets, 'android-icon-foreground.png'), 'PNG')
print("   ✓ android-icon-foreground.png saved (1024x1024, transparent)")

# 3. Create android-icon-background.png (1024x1024, solid color)
print("3. Creating android-icon-background.png...")
bg_img = Image.new('RGB', (1024, 1024), hex_to_rgb(LIGHT_BLUE))
bg_img.save(os.path.join(app_assets, 'android-icon-background.png'), 'PNG')
print("   ✓ android-icon-background.png saved (1024x1024, light blue)")

# 4. Create android-icon-monochrome.png (1024x1024, white on transparent)
print("4. Creating android-icon-monochrome.png...")
icon_mono = create_monochrome_icon(logo, (1024, 1024), padding_percent=20)
icon_mono.save(os.path.join(app_assets, 'android-icon-monochrome.png'), 'PNG')
print("   ✓ android-icon-monochrome.png saved (1024x1024, white monochrome)")

# 5. Create splash-icon.png (1024x1024, with transparency for splash screen)
print("5. Creating splash-icon.png...")
splash_icon = create_transparent_icon(logo, (1024, 1024), padding_percent=25)
splash_icon.save(os.path.join(app_assets, 'splash-icon.png'), 'PNG')
print("   ✓ splash-icon.png saved (1024x1024, transparent)")

# 6. Create favicon.png (48x48 for web)
print("6. Creating favicon.png...")
favicon = create_icon_with_background(logo, (48, 48), FACEBOOK_BLUE, padding_percent=10)
favicon.save(os.path.join(app_assets, 'favicon.png'), 'PNG')
print("   ✓ favicon.png saved (48x48, Facebook blue background)")

print("\n" + "="*60)
print("✨ All icons created successfully!")
print("="*60)
print(f"\nIcons saved to: {app_assets}")
print("\nCreated files:")
print("  - icon.png (1024x1024)")
print("  - android-icon-foreground.png (1024x1024)")
print("  - android-icon-background.png (1024x1024)")
print("  - android-icon-monochrome.png (1024x1024)")
print("  - splash-icon.png (1024x1024)")
print("  - favicon.png (48x48)")

logo.close()
print("\n✓ Done!")
