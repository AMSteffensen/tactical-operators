#!/bin/bash

# 🚀 Deploy Tactical Operator - Production Deployment Script

set -e

echo "🎮 Tactical Operator - Production Deployment"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "railway.json" ]; then
    echo -e "${RED}❌ Error: This script must be run from the tactical-operator root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Pre-deployment checklist:${NC}"
echo ""

# Check GitHub setup
if git remote get-url origin > /dev/null 2>&1; then
    REPO_URL=$(git remote get-url origin)
    echo -e "${GREEN}✅ Git repository configured: $REPO_URL${NC}"
else
    echo -e "${RED}❌ Git repository not configured${NC}"
    echo "   Run: git remote add origin https://github.com/yourusername/tactical-operator.git"
    exit 1
fi

# Check if secrets are configured (we can't check the actual values, but we can remind)
echo -e "${YELLOW}⚠️  Ensure GitHub Secrets are configured:${NC}"
echo "   - RAILWAY_TOKEN"
echo "   - VERCEL_TOKEN"  
echo "   - VERCEL_ORG_ID"
echo "   - VERCEL_PROJECT_ID"
echo "   - EXPO_TOKEN"
echo "   - VITE_API_URL"
echo "   - VITE_SOCKET_URL"
echo ""

# Build and test locally first
echo -e "${BLUE}🔨 Building project locally...${NC}"
npm run build

echo -e "${GREEN}✅ Local build successful${NC}"
echo ""

# Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
npm run test

echo -e "${GREEN}✅ Tests passed${NC}"
echo ""

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
    git status --short
    echo ""
    read -p "Do you want to commit and deploy anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}📝 Committing changes...${NC}"
    git add .
    git commit -m "Deploy to production - $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Deploy
echo -e "${BLUE}🚀 Deploying to production...${NC}"
echo ""

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  You're on branch '$BRANCH', not 'main'${NC}"
    read -p "Deploy from current branch? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        echo "   Switch to main: git checkout main"
        exit 1
    fi
fi

# Push to trigger deployment
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
git push origin $BRANCH

echo ""
echo -e "${GREEN}🎉 Deployment initiated!${NC}"
echo ""
echo -e "${BLUE}📊 Monitor deployment progress:${NC}"
echo "   GitHub Actions: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
echo ""
echo -e "${BLUE}🌐 Your app will be available at:${NC}"
echo "   🚂 API Server: https://tactical-operator-api.up.railway.app"
echo "   🌐 Web Client: https://tactical-operator-web.vercel.app"
echo "   📱 Mobile App: Check Expo dashboard for build status"
echo ""
echo -e "${YELLOW}⏱️  Deployment typically takes 3-5 minutes${NC}"
echo -e "${GREEN}✅ Deployment script completed successfully!${NC}"
