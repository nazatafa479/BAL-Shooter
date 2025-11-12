# How to Add Custom Character Images

## Quick Setup

1. **Add your images to the `/public` folder** with these exact names:
   - `ncp.png` - NCP character
   - `bnp.png` - BNP character  
   - `jamat.png` - JAMAT character
   - `bal-enemy.png` - BAL enemy

2. **Image specifications:**
   - Format: PNG (preferred) or JPG
   - Recommended size: 64x64px to 128x128px
   - Square images work best
   - Transparent background recommended for PNG

3. **The game will automatically:**
   - Load your custom images if they exist
   - Fall back to geometric shapes if images are missing
   - Scale images appropriately for the game

## File Structure

```
kaboom-shooter/
├── public/
│   ├── ncp.png          ← Add your NCP image here
│   ├── bnp.png          ← Add your BNP image here
│   ├── jamat.png        ← Add your JAMAT image here
│   └── bal-enemy.png    ← Add your BAL enemy image here
├── src/
│   └── ...
└── index.html
```

## Example: Adding Images

### Option 1: Using URLs (External Images)

If you have images hosted online, you can modify `/src/main.js`:

```javascript
// Replace these with your actual image URLs
k.loadSprite("ncp", "https://example.com/ncp.png");
k.loadSprite("bnp", "https://example.com/bnp.png");
k.loadSprite("jamat", "https://example.com/jamat.png");
k.loadSprite("bal-enemy", "https://example.com/bal-enemy.png");
```

### Option 2: Using Local Files (Recommended)

1. Save your images to the `public/` folder
2. Rename them exactly as: `ncp.png`, `bnp.png`, `jamat.png`, `bal-enemy.png`
3. Restart the dev server: `npm run dev`
4. The game will automatically load them!

## Creating Custom Images

### Using Free Tools:

1. **GIMP** (Free) - https://www.gimp.org/
2. **Photopea** (Free, Online) - https://www.photopea.com/
3. **Canva** (Free) - https://www.canva.com/

### Tips for Best Results:

- **Character images**: Make them face upward (top of image)
- **Enemy images**: Simple, recognizable shapes work best
- **Colors**: Use contrasting colors against dark blue background
- **Style**: Pixel art, cartoon, or realistic - your choice!

## Troubleshooting

**Images not showing?**
1. Check file names match exactly (case-sensitive)
2. Verify images are in the `/public` folder
3. Restart the dev server
4. Check browser console for errors (F12)

**Images too big/small?**
- Edit `/src/scenes/select.js` and `/src/scenes/game.js`
- Look for `k.scale(0.5)` and adjust the number
- Larger number = bigger image

**Want different image formats?**
- The game supports PNG, JPG, and GIF
- Just change the extension in `/src/main.js`

## Current Setup

The game is configured to load:
- `/ncp.png` for NCP character
- `/bnp.png` for BNP character
- `/jamat.png` for JAMAT character
- `/bal-enemy.png` for BAL enemies

If these files don't exist, it uses default geometric shapes.
