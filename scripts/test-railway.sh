#!/bin/bash

# 🚂 Railway Deployment Test

echo "🚂 Testing Railway Deployment Fix"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

RAILWAY_URL="https://tactical-operator-api.up.railway.app"

echo -e "${BLUE}🔍 Testing Railway API deployment...${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local endpoint="$1"
    local expected_status="$2"
    local description="$3"
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo "URL: $RAILWAY_URL$endpoint"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$RAILWAY_URL$endpoint" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS: HTTP $response${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL: Expected HTTP $expected_status, got HTTP $response${NC}"
        return 1
    fi
    echo ""
}

# Test health endpoint
test_endpoint "/health" "200" "Health Check"

# Test API base
test_endpoint "/api" "404" "API Base (404 expected)"

# Test characters endpoint
test_endpoint "/api/characters" "200" "Characters API"

echo ""
echo -e "${BLUE}📊 Railway deployment status:${NC}"

if test_endpoint "/health" "200" > /dev/null 2>&1; then
    echo -e "${GREEN}🎉 Railway deployment is working!${NC}"
    echo ""
    echo -e "${BLUE}✅ Ready for Vercel frontend deployment${NC}"
    echo -e "${BLUE}🌐 API URL for Vercel: $RAILWAY_URL${NC}"
else
    echo -e "${RED}❌ Railway deployment still has issues${NC}"
    echo ""
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo "1. Check Railway logs for specific errors"
    echo "2. Verify environment variables are set"
    echo "3. Check database connection"
    echo ""
    echo -e "${BLUE}🔧 Railway dashboard: https://railway.app${NC}"
fi

echo ""
echo -e "${BLUE}📝 Note: It may take 2-3 minutes for deployment to complete${NC}"
