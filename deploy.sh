#!/bin/bash

# Finance Tracker Deployment Script
# This script helps prepare and deploy your Finance Tracker to Vercel

echo "🚀 Finance Tracker Deployment Helper"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this from the project root."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

# Environment check
echo "🔍 Checking environment setup..."

if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your API keys before deploying"
fi

# Type check
echo "🔍 Running type check..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Type check failed. Please fix TypeScript errors before deploying."
    exit 1
fi

# Lint check
echo "🧹 Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    echo "⚠️  Linting issues found. Consider fixing them before deploying."
fi

# Build test
echo "🔨 Testing build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before deploying."
    exit 1
fi

echo "✅ All checks passed!"
echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub/GitLab"
echo "2. Go to vercel.com and import your repository"
echo "3. Set environment variable: VITE_GEMINI_API_KEY"
echo "4. Deploy!"
echo ""
echo "Or run: vercel"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"