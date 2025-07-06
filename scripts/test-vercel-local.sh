#!/bin/bash

# 🌐 Test Vercel Deployment Locally
# This script tests the web client build with production environment settings

set -e

echo "🌐 Testing Vercel deployment configuration locally..."

# Set production environment variables
export VITE_API_URL="https://tactical-operators-production.up.railway.app"
export VITE_SOCKET_URL="https://tactical-operators-production.up.railway.app"
export VITE_ENVIRONMENT="production"

echo "📦 Building shared package..."
cd shared
npm ci
npm run build
cd ..

echo "🏗️ Building web client with production settings..."
cd web-client
npm ci
npm run build

echo "✅ Build completed successfully!"
echo ""
echo "📋 Build artifacts:"
ls -la dist/

echo ""
echo "🧪 Testing build artifacts..."

# Check if essential files exist
if [ -f "dist/index.html" ]; then
    echo "✅ index.html exists"
else
    echo "❌ index.html missing"
    exit 1
fi

if [ -d "dist/assets" ]; then
    echo "✅ assets directory exists"
else
    echo "❌ assets directory missing"
    exit 1
fi

echo ""
echo "🔍 Checking environment variables in build..."
if grep -q "tactical-operators-production" dist/assets/*.js 2>/dev/null; then
    echo "✅ Production API URL found in build"
else
    echo "⚠️ Production API URL not found in build (may be normal)"
fi

echo ""
echo "🚀 Starting preview server..."
echo "📖 Open http://localhost:4173 to test the deployment locally"
echo "🔗 This should connect to the production Railway API"
echo ""
echo "🧪 Manual testing checklist:"
echo "  [ ] Page loads without errors"
echo "  [ ] Character creation works" 
echo "  [ ] 3D tactical view renders"
echo "  [ ] API calls to Railway succeed"
echo "  [ ] Socket.IO connects (check browser console)"
echo "  [ ] No CORS errors in browser dev tools"
echo ""
echo "Press Ctrl+C to stop the preview server"

npm run preview
