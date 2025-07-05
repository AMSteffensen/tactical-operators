#!/bin/bash

# 🚂 Railway Staging Environment Setup
# This script helps set up a staging environment on Railway

set -e

echo "🚂 Setting up Railway staging environment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed."
    echo "📥 Install it with: npm install -g @railway/cli"
    exit 1
fi

# Login to Railway
echo "🔐 Logging in to Railway..."
railway login

# List current projects
echo "📋 Current Railway projects:"
railway projects

echo ""
echo "🏗️ Setting up staging environment:"
echo "1. Create a new environment called 'staging'"
echo "2. Deploy staging database"
echo "3. Deploy staging API"

# Create staging environment
echo "⚡ Creating staging environment..."
railway environment new staging

# Switch to staging
railway environment staging

# Deploy database
echo "🗄️ Setting up staging database..."
railway add --database postgresql

# Set staging environment variables
echo "⚙️ Setting staging environment variables..."
railway variables set NODE_ENV=staging
railway variables set PORT=3001

# Get database URL
DB_URL=$(railway variables get DATABASE_URL 2>/dev/null || echo "")
if [ -n "$DB_URL" ]; then
    echo "✅ Database URL configured"
else
    echo "⚠️ Please configure DATABASE_URL manually"
fi

# Deploy the application
echo "🚀 Deploying to staging..."
railway up

echo ""
echo "✅ Staging environment setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Note your staging URL"
echo "2. Add RAILWAY_STAGING_TOKEN to GitHub secrets"
echo "3. Test a pull request to trigger staging deployment"
echo ""
echo "🔧 To get your staging token:"
echo "railway auth token"
echo ""
echo "📊 To check staging status:"
echo "railway status"
