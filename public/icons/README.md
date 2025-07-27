# PWA Installation Script for Icon Generation

This script creates placeholder images for PWA icons in different sizes.
Since we're using SVG as the base, you can replace these with actual rendered PNG versions.

The SVG icon is located at: /public/icons/base-icon.svg

To generate actual PNG icons from the SVG, you can use:
1. Online tools like svg2png.com
2. CLI tools like ImageMagick or Inkscape
3. Design tools like Figma or Sketch

Required icon sizes:
- 72x72 (small Android icon)
- 96x96 (shortcut icons)
- 128x128 (Chrome extension)
- 144x144 (Microsoft tile)
- 152x152 (iPad icon)
- 192x192 (Android icon)
- 384x384 (splash screen)
- 512x512 (large icon)

For now, we'll create a simple placeholder that browsers can use.