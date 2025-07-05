#!/bin/bash

# Simple Deployment Test Script
echo "🚀 Testing Tactical Operator Deployment"
echo "======================================="

# Build everything locally first
echo "📦 Building packages..."
cd /Users/andreassteffensen/dev/tactical-operator

# Build shared package
echo "Building shared package..."
cd shared && npm run build && cd ..

# Build API server
echo "Building API server..."
cd api-server && npm run build && cd ..

# Test the built API server
echo "🧪 Testing built API server..."
cd api-server

# Try to start with minimal environment
echo "Starting API server test..."
NODE_ENV=production \
PORT=3004 \
JWT_SECRET=test_secret_32_characters_long_12345 \
DATABASE_URL=postgresql://test:test@localhost:5432/test \
CORS_ORIGIN=http://localhost:3000 \
node dist/app.js &

SERVER_PID=$!
sleep 5

# Test health endpoint
echo "Testing health endpoint..."
if curl -s http://localhost:3004/health; then
    echo -e "\n✅ API server is working!"
else
    echo -e "\n❌ API server failed to respond"
fi

# Clean up
kill $SERVER_PID 2>/dev/null || true

echo "🏁 Test complete"
