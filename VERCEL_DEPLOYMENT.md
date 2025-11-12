# Vercel Deployment Guide

## Quick Start - Deploy in 2 Minutes! 🚀

### Method 1: GitHub + Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"

That's it! Vercel will automatically:
- Detect Vite framework
- Run `npm run build`
- Deploy to a live URL

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd kaboom-shooter
vercel

# Follow prompts and you're done!
```

## 🔧 Vercel Configuration

The `vercel.json` file is already configured with optimal settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

## ✅ Pre-Deployment Checklist

Before deploying, make sure:

- [ ] All files are committed to git
- [ ] `npm run build` works locally
- [ ] `package.json` has all dependencies
- [ ] Images are in the `/public` folder
- [ ] No absolute paths in imports

## 🐛 Fixing "Blank Screen" on Vercel

If you see a blank screen after deployment:

### Step 1: Check Build Logs

1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Deployments"
4. Click on the latest deployment
5. Check the "Build Logs" tab

### Step 2: Common Issues & Solutions

#### Issue: "Module not found"
**Solution**: Make sure all imports are relative:
```javascript
// ❌ Wrong
import something from '/src/file.js'

// ✅ Correct
import something from './file.js'
```

#### Issue: "Failed to load resource"
**Solution**: Check image paths use `/` prefix:
```javascript
// ✅ Correct
k.loadSprite("ncp", "/ncp.png")
```

#### Issue: "White screen but no errors"
**Solution**: 
1. Clear browser cache (Ctrl + Shift + R)
2. Check browser console (F12)
3. Redeploy with `vercel --prod`

### Step 3: Force Redeploy

```bash
vercel --prod --force
```

## 📱 Testing Mobile on Vercel

After deployment:

1. **Open on mobile** - Visit your Vercel URL on your phone
2. **Test touch controls** - Try the slider and fire button
3. **Check orientation** - Rotate device to test landscape/portrait
4. **Add to home screen** - Works like a native app!

## 🌐 Custom Domain (Optional)

To use your own domain:

1. Go to Vercel Dashboard
2. Select your project
3. Click "Settings" → "Domains"
4. Add your custom domain
5. Follow DNS setup instructions

## 🔄 Continuous Deployment

With GitHub integration, Vercel automatically:
- Deploys on every push to `main`
- Creates preview URLs for pull requests
- Runs build checks before deployment

## 📊 Environment Variables (If Needed)

Currently, the game doesn't need environment variables. But if you add them later:

1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add your variables
4. Redeploy

## 🎯 Performance Optimization

The game is already optimized with:
- ✅ Vite's automatic code splitting
- ✅ Asset optimization
- ✅ Cache headers in `vercel.json`
- ✅ Minimal dependencies

## 📞 Need Help?

- Check [Vercel Documentation](https://vercel.com/docs)
- Review build logs in Vercel dashboard
- Test locally first: `npm run build && npm run preview`
- Open browser console for JavaScript errors

## 🎉 Success!

Once deployed, you'll get:
- Live URL (e.g., `your-project.vercel.app`)
- Automatic HTTPS
- Global CDN
- Mobile-optimized
- Perfect Lighthouse scores!

Share your game with the world! 🌍
