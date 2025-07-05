#!/bin/bash

# 🛡️ Complete Branch Protection & Staging Setup
# This script sets up both GitHub branch protection and Railway staging

set -e

echo "🛡️ Setting up complete safe development workflow..."
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "📥 Install it with: brew install gh"
    exit 1
fi

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed."
    echo "📥 Install it with: npm install -g @railway/cli"
    exit 1
fi

echo "✅ Prerequisites checked"
echo ""

# Step 1: Setup Railway staging
echo "🚂 Step 1: Setting up Railway staging environment..."
./scripts/setup-railway-staging.sh

echo ""
echo "⏸️  Please complete Railway setup and then press Enter to continue..."
read -p "Press Enter when Railway staging is ready..."

# Step 2: Get Railway token
echo "🔑 Step 2: Getting Railway staging token..."
echo "Please run this command and copy the token:"
echo "railway auth token"
echo ""
read -p "Enter your Railway staging token: " RAILWAY_TOKEN

if [ -z "$RAILWAY_TOKEN" ]; then
    echo "❌ No token provided. Please add it manually later."
else
    # Add token to GitHub secrets
    echo "🔐 Adding token to GitHub secrets..."
    gh secret set RAILWAY_STAGING_TOKEN --body="$RAILWAY_TOKEN"
    echo "✅ Token added to GitHub secrets"
fi

echo ""

# Step 3: Setup branch protection
echo "🛡️ Step 3: Setting up branch protection..."
./scripts/setup-branch-protection.sh

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Summary:"
echo "  ✅ Railway staging environment created"
echo "  ✅ GitHub branch protection enabled"
echo "  ✅ CI/CD workflows configured"
echo "  ✅ Staging deployment automation ready"
echo ""
echo "🚀 Next steps:"
echo "1. Create a test PR to verify staging deployment"
echo "2. Review the workflow in docs/BRANCH_PROTECTION_GUIDE.md"
echo "3. Train your team on the new workflow"
echo ""
echo "🧪 Test the workflow:"
echo "git checkout -b test/staging-deployment"
echo "git commit --allow-empty -m 'test: staging deployment'"
echo "git push origin test/staging-deployment"
echo "gh pr create --title 'test: staging deployment' --body 'Testing the new workflow'"
