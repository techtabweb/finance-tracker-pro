# Finance Tracker - Vercel Deployment Guide

## 🚀 Deploying to Vercel

This Finance Tracker application is ready for deployment on Vercel. Follow these steps:

### Prerequisites
- Node.js 18+ installed locally
- A Vercel account (free)
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

### Deployment Steps

#### Option 1: Deploy via Vercel Dashboard (Recommended)
1. Visit [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically detect it's a Vite project
5. Configure the following settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click "Deploy"

#### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to your project directory
cd your-finance-tracker

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: finance-tracker (or your preferred name)
# - Directory: ./
# - Override settings? No
```

### Environment Variables
The app uses a Gemini AI API key. Set this in your Vercel project:

1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add the following variable:
   - **Name**: `VITE_GEMINI_API_KEY`
   - **Value**: Your Gemini API key
   - **Environment**: Production, Preview, Development

### Build Configuration
The project includes:
- ✅ `vercel.json` - Vercel configuration
- ✅ Optimized build settings
- ✅ SPA routing configuration
- ✅ Security headers
- ✅ Asset caching

### Performance Optimizations
- 🎯 Code splitting enabled
- 📦 Asset compression
- 🔄 Immutable asset caching
- 🚀 CDN distribution via Vercel Edge Network

### Post-Deployment
After deployment:
1. Your app will be available at `https://your-project-name.vercel.app`
2. Custom domains can be added in project settings
3. Automatic deployments occur on Git push

### Troubleshooting

#### Build Errors
If you encounter build errors:
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run type-check
```

#### Environment Variables
Make sure all required environment variables are set in Vercel dashboard.

#### Performance
Monitor your app's performance in the Vercel dashboard under "Analytics".

### Features Available After Deployment
- 💰 Complete expense tracking
- 📊 Analytics and insights
- 🤖 AI-powered features (receipt scanning, chat)
- 📱 Mobile-responsive design
- 🌙 Dark mode support
- 📈 Budget management
- 📄 Report generation
- 🎯 Goal setting

### Support
If you encounter issues:
1. Check Vercel function logs in the dashboard
2. Review build logs
3. Ensure all dependencies are compatible

---

**Happy deploying! 🎉**