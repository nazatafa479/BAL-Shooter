# Attack on BAL - Kaboom Shooter Game

A mobile-friendly, browser-based 2D shooter game built with Kaboom.js and Vite.

## 🚀 Deploy to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/BAL-Shooter)

### Manual Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Build the project**:
   ```bash
   npm install
   npm run build
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Confirm settings
   - Deploy!

### Important Notes for Vercel Deployment

- The `vercel.json` file is already configured
- Make sure all dependencies are in `package.json`
- The build command is `npm run build`
- Output directory is `dist`

### Environment Setup

No environment variables needed! The game works out of the box.

## 📱 Mobile Support

The game is fully mobile-friendly with:
- ✅ Responsive layout that adapts to screen size
- ✅ Touch controls for slider and fire button
- ✅ Optimized for both portrait and landscape
- ✅ Prevents pull-to-refresh on mobile browsers
- ✅ No scrolling or zooming issues

## 🎮 How to Play

### Desktop Controls:
- **A/D or Arrow Keys** - Move left/right
- **Space** - Shoot
- **Mouse** - Use slider or click fire button
- **P** - Pause
- **R** - Restart (after game over)

### Mobile Controls:
- **Slider** - Drag to move character left/right
- **FIRE button** - Tap to shoot
- **P** on virtual keyboard - Pause

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Custom Character Images

To add custom character images:

1. Create a `public` folder (if it doesn't exist)
2. Add your images with these exact names:
   - `ncp.png` - NCP character
   - `bnp.png` - BNP character
   - `jamat.png` - JAMAT character
   - `bal-enemy.png` - BAL enemy

See `HOW_TO_ADD_IMAGES.md` for detailed instructions.

## 📦 Project Structure

```
kaboom-shooter/
├── public/              # Static assets (images)
├── src/
│   ├── main.js         # Game entry point
│   ├── assets.js       # Character configurations
│   └── scenes/
│       ├── select.js   # Character selection
│       └── game.js     # Main gameplay
├── index.html          # HTML template
├── package.json        # Dependencies
└── vercel.json        # Vercel configuration
```

## 🐛 Troubleshooting Vercel Deployment

### Blank Screen Issue

If you see a blank screen after deployment:

1. **Check build logs** on Vercel dashboard
2. **Verify** `vercel.json` is in root directory
3. **Ensure** all imports use correct paths (no absolute paths)
4. **Check browser console** for errors
5. **Clear cache** and hard reload (Ctrl+Shift+R)

### Common Fixes

**Issue**: Images not loading
- **Solution**: Make sure images are in the `public` folder and paths start with `/`

**Issue**: Build fails
- **Solution**: Run `npm run build` locally to test

**Issue**: Game not responsive on mobile
- **Solution**: Clear browser cache, the CSS is mobile-optimized

## 📄 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

Built with ❤️ using [Kaboom.js](https://kaboomjs.com/) and [Vite](https://vitejs.dev/)
