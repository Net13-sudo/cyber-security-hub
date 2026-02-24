#!/bin/bash

# 🚀 Scorpion Security Hub - Render Deployment Setup
# This script prepares your project for deployment to Render

echo "🦂 Preparing Scorpion Security Hub for Render deployment..."

# Step 1: Install dependencies
echo "\n📦 Installing dependencies..."
cd server
npm install
cd ..

# Step 2: Initialize git repository (if not exists)
if [ ! -d ".git" ]; then
    echo "\n🔧 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - ready for Render deployment"
else
    echo "\n✅ Git repository already initialized"
fi

# Step 3: Display next steps
echo "\n✅ Project is ready for deployment!"
echo "\n📝 Next steps:"
echo "1. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/Scorpion-Security-Hub.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2. Go to https://render.com"
echo "3. Create a new Web Service and connect your GitHub repository"
echo "4. Configure as per DEPLOY_RENDER.md"
echo ""
echo "5. After deployment, initialize the database:"
echo "   - Go to Render dashboard"
echo "   - Click your service"
echo "   - Click 'Shell' tab"
echo "   - Run: cd server && npm run create-admin"
echo ""
echo "6. Update frontend config and redeploy"
echo ""
echo "📚 Detailed instructions: see DEPLOY_RENDER.md"
echo "🦂 Good luck! 🚀"
