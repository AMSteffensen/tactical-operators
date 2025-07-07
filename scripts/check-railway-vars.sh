#!/bin/bash

# 🔍 Railway Environment Variables Checker
# Checks if Railway has proper environment variables configured

echo "🚂 Checking Railway Environment Variables"
echo "========================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not installed"
    echo "   Install with: curl -fsSL https://railway.app/install.sh | sh"
    exit 1
fi

# Check if we're logged in
if ! railway auth &> /dev/null; then
    echo "❌ Not logged into Railway"
    echo "   Login with: railway login"
    exit 1
fi

echo "✅ Railway CLI installed and authenticated"
echo ""

# Check production environment
echo "🔍 Production Environment Variables:"
echo "------------------------------------"

# List all variables (this will show keys but not sensitive values)
echo "📋 Available variables:"
railway variables --environment production 2>/dev/null || {
    echo "❌ Could not fetch production variables"
    echo "   Make sure you have access to the project"
}

echo ""

# Check specific required variables
echo "🔑 Checking critical variables:"

# Check JWT_SECRET
if railway variables get JWT_SECRET --environment production &> /dev/null; then
    echo "✅ JWT_SECRET is set"
else
    echo "❌ JWT_SECRET is missing or empty"
    echo "   This is likely causing auth endpoint failures"
fi

# Check DATABASE_URL
if railway variables get DATABASE_URL --environment production &> /dev/null; then
    echo "✅ DATABASE_URL is set"
else
    echo "❌ DATABASE_URL is missing"
fi

# Check NODE_ENV
NODE_ENV=$(railway variables get NODE_ENV --environment production 2>/dev/null || echo "not set")
echo "📝 NODE_ENV: $NODE_ENV"

echo ""

# Check PR environment if exists
echo "🔍 PR Environment Variables (if exists):"
echo "---------------------------------------"

# Get current PR number from environment or git
PR_NUMBER=${VITE_PR_NUMBER:-$(git rev-parse --abbrev-ref HEAD | grep -o 'pr-[0-9]*' | cut -d'-' -f2)}

if [ -n "$PR_NUMBER" ] && [ "$PR_NUMBER" != "HEAD" ]; then
    echo "🎯 Checking PR environment for PR #$PR_NUMBER"
    
    # Check JWT_SECRET in PR environment
    if railway variables get JWT_SECRET --environment "pr-$PR_NUMBER" &> /dev/null; then
        echo "✅ JWT_SECRET is set in PR environment"
    else
        echo "❌ JWT_SECRET is missing in PR environment"
        echo "   This could be causing PR preview auth failures"
    fi
else
    echo "ℹ️  No active PR environment detected"
fi

echo ""
echo "🚀 Quick Fixes:"
echo ""

echo "1. Set JWT_SECRET in production:"
echo "   railway variables set JWT_SECRET=\$(openssl rand -base64 64) --environment production"
echo ""

if [ -n "$PR_NUMBER" ] && [ "$PR_NUMBER" != "HEAD" ]; then
    echo "2. Set JWT_SECRET in PR environment:"
    echo "   railway variables set JWT_SECRET=\$(openssl rand -base64 64) --environment pr-$PR_NUMBER"
    echo ""
fi

echo "3. Test the fix:"
echo "   curl https://tactical-operator-api.up.railway.app/health"
echo "   curl -X POST https://tactical-operator-api.up.railway.app/api/auth/login \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"email\":\"test@test.com\",\"password\":\"test\"}'"