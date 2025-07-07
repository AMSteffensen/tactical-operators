#!/bin/bash

# Test the frontend authentication setup with various environment configurations

echo "🧪 Testing Frontend Auth Configuration Setup"
echo "============================================="

cd /Users/andreassteffensen/dev/tactical-operator

# Test 1: Development environment (no special variables)
echo ""
echo "📍 Test 1: Development Environment"
echo "--------------------------------"
cd web-client
VERCEL_ENV="" VERCEL_GIT_PULL_REQUEST_ID="" npm run prebuild
echo "Expected: Should use localhost for development"
echo ""

# Test 2: Preview environment with PR number
echo "📍 Test 2: Preview Environment (PR #42)"
echo "---------------------------------------"
VERCEL_ENV="preview" VERCEL_GIT_PULL_REQUEST_ID="42" npm run prebuild
echo "Expected: Should use PR-specific Railway URL"
echo ""

# Test 3: Production environment
echo "📍 Test 3: Production Environment"
echo "---------------------------------"
VERCEL_ENV="production" npm run prebuild
echo "Expected: Should use production Railway URL"
echo ""

# Check that the environment variables are properly set in vercel.json
echo "📍 Checking Generated Environment Variables"
echo "------------------------------------------"
echo "Current vercel.json env section:"
grep -A 10 '"env":' ../vercel.json

echo ""
echo "✅ Frontend auth configuration tests complete!"
echo "💡 Next steps:"
echo "   1. Commit and push these changes"
echo "   2. Test on Vercel preview deployment"
echo "   3. Use browser console test script to verify network requests"
