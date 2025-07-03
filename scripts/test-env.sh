#!/bin/bash

# Development Environment Test Script
echo "🧪 Testing Tactical Operator Development Environment"
echo "================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

echo -e "${BLUE}📦 Building packages...${NC}"

# Build shared package
cd shared && npm run build
test_result $? "Shared package builds successfully"

# Build API server  
cd ../api-server && npm run build
test_result $? "API server builds successfully"

# Build web client
cd ../web-client && npm run build
test_result $? "Web client builds successfully"

cd ..

echo -e "${BLUE}🐳 Starting database...${NC}"
npm run docker:db > /dev/null 2>&1
sleep 3
test_result $? "Database container starts"

echo -e "${BLUE}🧪 Testing API server startup...${NC}"
cd api-server
timeout 10s npm start > /dev/null 2>&1 &
API_PID=$!
sleep 5

# Test if API is responding
curl -s http://localhost:3001/health > /dev/null 2>&1
API_TEST=$?

# Clean up
kill $API_PID 2>/dev/null

test_result $API_TEST "API server responds on port 3001"

cd ..

echo ""
echo -e "${GREEN}🎉 All tests passed! Development environment is ready.${NC}"
echo ""
echo "To start development:"
echo "  npm run dev     # Start both API and web client"
echo "  npm run status  # Check environment status"
echo ""
