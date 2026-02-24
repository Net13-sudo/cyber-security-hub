#!/bin/bash

# 🦂 Scorpion Security Hub - Deploy to Render
# Easy deployment script for Render.com

echo "🚀 Deploying Scorpion Security Hub to Render..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Verify git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Step 2: Check if in git repository
if [ ! -d ".git" ]; then
    echo -e "${BLUE}📝 Initializing git repository...${NC}"
    git init
    git add .
    git commit -m "🚀 Initial commit - ready for Render deployment"
fi

# Step 3: Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes. Please commit them first:${NC}"
    echo "   git add ."
    echo "   git commit -m 'Your changes'"
    exit 1
fi

# Step 4: Display deployment instructions
echo ""
echo -e "${GREEN}✅ Project is ready for Render deployment!${NC}"
echo ""
echo -e "${BLUE}Step 1: Push to GitHub${NC}"
echo "  Run these commands:"
echo "  git remote add origin https://github.com/YOUR_USERNAME/Scorpion-Security-Hub.git"
echo "  git branch -M main"
echo "  git push -u origin main"
echo ""

echo -e "${BLUE}Step 2: Connect to Render${NC}"
echo "  1. Go to https://render.com"
echo "  2. Click 'New +' → 'Web Service'"
echo "  3. Select your GitHub repository"
echo "  4. Name: scorpion-security-api"
echo "  5. Environment: Node"
echo "  6. Build Command: cd server && npm install"
echo "  7. Start Command: cd server && npm start"
echo ""

echo -e "${BLUE}Step 3: Set Environment Variables${NC}"
echo "  Add these in Render dashboard:"
echo "  - PORT=3001"
echo "  - NODE_ENV=production"
echo "  - JWT_SECRET=(generate strong random string)"
echo "  - BCRYPT_ROUNDS=12"
echo "  - CORS_ORIGIN=https://your-frontend-domain.onrender.com"
echo ""

echo -e "${BLUE}Step 4: Create Admin User${NC}"
echo "  1. After service deploys, go to 'Shell' tab"
echo "  2. Run: cd server && npm run create-admin"
echo "  3. Save credentials securely"
echo ""

echo -e "${BLUE}Step 5: Deploy Frontend${NC}"
echo "  1. Click 'New +' → 'Static Site'"
echo "  2. Select same GitHub repository"
echo "  3. Leave build command empty"
echo "  4. Publish directory: . (or leave blank)"
echo ""

echo -e "${GREEN}📚 For detailed instructions, see: DEPLOY_RENDER.md${NC}"
echo -e "${GREEN}🦂 Ready to deploy! 🚀${NC}"
