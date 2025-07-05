#!/bin/bash

# 🚂 Railway API Test Script
# Tests all Railway deployment endpoints

echo "🚂 Testing Railway API Deployment"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Railway URL
RAILWAY_URL="https://tactical-operators-production.up.railway.app"

echo -e "${BLUE}🌐 Testing Railway URL: $RAILWAY_URL${NC}"
echo ""

# Test 1: Root endpoint
echo -e "${YELLOW}1. Testing Root Endpoint...${NC}"
response=$(curl -s "$RAILWAY_URL/")
if [[ $response == *"Tactical Operator API Server"* ]]; then
    echo -e "${GREEN}✅ Root endpoint working${NC}"
else
    echo -e "${RED}❌ Root endpoint failed${NC}"
    echo "Response: $response"
fi
echo ""

# Test 2: Health check
echo -e "${YELLOW}2. Testing Health Check...${NC}"
response=$(curl -s "$RAILWAY_URL/health")
if [[ $response == *"OK"* ]]; then
    echo -e "${GREEN}✅ Health check working${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Response: $response"
fi
echo ""

# Test 3: Auth endpoint structure
echo -e "${YELLOW}3. Testing Auth Endpoints...${NC}"

# Test register endpoint (should fail validation but show it exists)
echo "   Testing register endpoint..."
response=$(curl -s -X POST "$RAILWAY_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{}')
if [[ $response == *"error"* ]]; then
    echo -e "${GREEN}✅ Register endpoint exists (validation working)${NC}"
else
    echo -e "${RED}❌ Register endpoint issue${NC}"
    echo "Response: $response"
fi

# Test login endpoint (should fail validation but show it exists)
echo "   Testing login endpoint..."
response=$(curl -s -X POST "$RAILWAY_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{}')
if [[ $response == *"error"* ]]; then
    echo -e "${GREEN}✅ Login endpoint exists (validation working)${NC}"
else
    echo -e "${RED}❌ Login endpoint issue${NC}"
    echo "Response: $response"
fi
echo ""

# Test 4: Protected endpoints
echo -e "${YELLOW}4. Testing Protected Endpoints...${NC}"

# Character endpoint (should require auth)
echo "   Testing character endpoint..."
response=$(curl -s "$RAILWAY_URL/api/character")
if [[ $response == *"Not authorized"* ]]; then
    echo -e "${GREEN}✅ Character endpoint protected${NC}"
else
    echo -e "${RED}❌ Character endpoint security issue${NC}"
    echo "Response: $response"
fi

# Guild endpoint (should require auth)
echo "   Testing guild endpoint..."
response=$(curl -s "$RAILWAY_URL/api/guild")
if [[ $response == *"Not authorized"* ]]; then
    echo -e "${GREEN}✅ Guild endpoint protected${NC}"
else
    echo -e "${RED}❌ Guild endpoint security issue${NC}"
    echo "Response: $response"
fi

# Campaign endpoint (should require auth)
echo "   Testing campaign endpoint..."
response=$(curl -s "$RAILWAY_URL/api/campaign")
if [[ $response == *"Not authorized"* ]]; then
    echo -e "${GREEN}✅ Campaign endpoint protected${NC}"
else
    echo -e "${RED}❌ Campaign endpoint security issue${NC}"
    echo "Response: $response"
fi
echo ""

echo -e "${GREEN}🎉 Railway API Testing Complete!${NC}"
echo ""
echo -e "${BLUE}📚 To test full functionality:${NC}"
echo "1. Use the register endpoint to create a user"
echo "2. Use the login endpoint to get a JWT token"
echo "3. Use the token to access protected endpoints"
echo ""
echo -e "${BLUE}Example register command:${NC}"
echo "curl -X POST $RAILWAY_URL/api/auth/register \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\":\"test@example.com\",\"username\":\"testuser\",\"password\":\"TestPassword123\"}'"
