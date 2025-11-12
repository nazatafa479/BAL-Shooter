# Changelog - Attack On BAL

## v1.1.0 - Image Consistency & Mobile Optimization (Latest)

### Fixed Image Sizing
✅ **All sprites now display at consistent 60x60px dimensions**
- Character selection screen: NCP, BNP, JAMAT cards use 60x60px boxes
- Game scene player: Scaled to 40x40px (smaller for gameplay)
- Game scene enemies: BAL enemies scaled to 40x40px
- Implemented smart scaling: `Math.min(targetSize / width, targetSize / height)`
- Added `k.getSprite()` check before rendering custom images
- Graceful fallback to geometric shapes when images not found

### Mobile-Friendly Controls
✅ **Responsive touch controls for all screen sizes**
- Fire button: 50px on mobile (<600px width), 40px on desktop
- Slider handle: 22px on mobile, 18px on desktop
- Slider track: 16px height on mobile, 12px on desktop
- Optimized positioning for thumb-friendly access
- Fire button text size: 18px mobile, 16px desktop

### Vercel Deployment Ready
✅ **Fixed blank screen issues**
- Proper sprite loading with error handling
- `k.loadRoot("/")` for correct asset paths
- Removed canvas selector conflicts
- Added loading screen in `index.html`
- Build output: `dist/` folder (verified working)

### Technical Improvements
- **Character Selection Scene (`src/scenes/select.js`)**:
  - Visual box size: 50x50 → 60x60px
  - Sprite existence check with `k.getSprite()`
  - Proportional scaling preserves aspect ratio
  - Pulse animation updated to 60px base

- **Game Scene (`src/scenes/game.js`)**:
  - Player sprite: Consistent 40x40px with smart scaling
  - Enemy sprites: BAL enemies at 40x40px with smart scaling
  - Removed try/catch in favor of sprite existence check
  - Better fallback rendering for missing images

### Image Asset Guide
To use custom images (60x60px recommended):
1. Place images in `/public/` folder:
   - `ncp.png` - NCP party logo
   - `bnp.png` - BNP party logo  
   - `jamat.png` - JAMAT party logo
   - `bal-enemy.png` - BAL enemy sprite
2. Images auto-scale to fit 60x60 (selection) or 40x40 (gameplay)
3. Supported formats: PNG, JPG, WebP
4. Transparent backgrounds recommended

### Build & Deploy
```bash
# Development
npm run dev

# Production build
npm run build

# Deploy to Vercel
vercel deploy
```

Build output verified: ✅ 148.56 kB (gzipped: 57.20 kB)

---

## v1.0.0 - Initial Release

### Core Features
- Kaboom.js v3000.1.17 game engine
- Vite v5.0.0 build system
- 3 playable characters: NCP, BNP, JAMAT
- Bottom-up shooter mechanics
- Wave-based enemy spawning (BAL enemies)
- Keyboard controls (A/D, Space)
- Slider control for movement
- Fire button for shooting
- Health system with visual bars
- Responsive 800x600 base resolution

### Game Mechanics
- Player locked to bottom of screen
- Enemies spawn from top
- Collision detection
- Progressive difficulty (wave system)
- Score tracking
- Pause functionality (ESC)

### Controls
- **Keyboard**: A/D to move, Space to shoot, ESC to pause
- **Mouse**: Click fire button, drag slider
- **Touch**: Tap fire button, drag slider
