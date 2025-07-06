#!/bin/bash

# 🔐 Authentication System Test Script
# Tests the complete authentication flow: API endpoints + Frontend integration

set -e

echo "🧪 Testing Tactical Operator Authentication System"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3001"
WEB_URL="http://localhost:3000"
TEST_EMAIL="test-user-$(date +%s)@example.com"
TEST_USERNAME="testuser$(date +%s)"
TEST_PASSWORD="TestPassword123"

echo -e "${BLUE}📋 Test Configuration:${NC}"
echo "  API URL: $API_URL"
echo "  Web URL: $WEB_URL"
echo "  Test Email: $TEST_EMAIL"
echo "  Test Username: $TEST_USERNAME"
echo ""

# Test 1: API Health Check
echo -e "${YELLOW}🩺 Test 1: API Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -X GET "$API_URL/health")
if [[ $HEALTH_RESPONSE == *"\"status\":\"OK\""* ]]; then
    echo -e "${GREEN}✅ API Health Check: PASSED${NC}"
else
    echo -e "${RED}❌ API Health Check: FAILED${NC}"
    echo "Response: $HEALTH_RESPONSE"
    exit 1
fi

# Test 2: User Registration
echo -e "${YELLOW}🔐 Test 2: User Registration${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"username\":\"$TEST_USERNAME\"}")

if [[ $REGISTER_RESPONSE == *"\"success\":true"* ]]; then
    echo -e "${GREEN}✅ User Registration: PASSED${NC}"
    echo "   Created user: $TEST_USERNAME"
else
    echo -e "${RED}❌ User Registration: FAILED${NC}"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
fi

# Test 3: User Login
echo -e "${YELLOW}🔑 Test 3: User Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if [[ $LOGIN_RESPONSE == *"\"success\":true"* ]] && [[ $LOGIN_RESPONSE == *"\"token\":"* ]]; then
    echo -e "${GREEN}✅ User Login: PASSED${NC}"
    # Extract JWT token from response
    JWT_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "   JWT Token: ${JWT_TOKEN:0:20}..."
else
    echo -e "${RED}❌ User Login: FAILED${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test 4: Protected Route Access
echo -e "${YELLOW}🛡️  Test 4: Protected Route Access${NC}"
CHARACTER_RESPONSE=$(curl -s -X GET "$API_URL/api/character" \
    -H "Authorization: Bearer $JWT_TOKEN")

if [[ $CHARACTER_RESPONSE == *"\"success\":true"* ]]; then
    echo -e "${GREEN}✅ Protected Route Access: PASSED${NC}"
    echo "   User has access to character routes"
else
    echo -e "${RED}❌ Protected Route Access: FAILED${NC}"
    echo "Response: $CHARACTER_RESPONSE"
    exit 1
fi

# Test 5: Invalid Token Rejection
echo -e "${YELLOW}🚫 Test 5: Invalid Token Rejection${NC}"
INVALID_RESPONSE=$(curl -s -X GET "$API_URL/api/character" \
    -H "Authorization: Bearer invalid-token-123")

if [[ $INVALID_RESPONSE == *"\"error\""* ]] || [[ $INVALID_RESPONSE == *"Access denied"* ]]; then
    echo -e "${GREEN}✅ Invalid Token Rejection: PASSED${NC}"
    echo "   Invalid tokens are properly rejected"
else
    echo -e "${RED}❌ Invalid Token Rejection: FAILED${NC}"
    echo "Response: $INVALID_RESPONSE"
    exit 1
fi

# Test 6: Web Client Accessibility
echo -e "${YELLOW}🌐 Test 6: Web Client Accessibility${NC}"
WEB_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$WEB_URL")

if [[ $WEB_RESPONSE == "200" ]]; then
    echo -e "${GREEN}✅ Web Client Accessibility: PASSED${NC}"
    echo "   Frontend is accessible at $WEB_URL"
else
    echo -e "${RED}❌ Web Client Accessibility: FAILED${NC}"
    echo "HTTP Status: $WEB_RESPONSE"
    exit 1
fi

# Test Summary
echo ""
echo -e "${GREEN}🎉 All Authentication Tests PASSED!${NC}"
echo "=================================================="
echo -e "${BLUE}📝 Test Summary:${NC}"
echo "  ✅ API Health Check"
echo "  ✅ User Registration"
echo "  ✅ User Login with JWT Token"
echo "  ✅ Protected Route Access"
echo "  ✅ Invalid Token Rejection"
echo "  ✅ Web Client Accessibility"
echo ""
echo -e "${YELLOW}🚀 Next Steps:${NC}"
echo "  1. Open browser to: $WEB_URL"
echo "  2. Test registration/login in the UI"
echo "  3. Verify protected routes work"
echo "  4. Test character creation flow"
echo ""
echo -e "${BLUE}🔧 Manual Test Credentials:${NC}"
echo "  Email: $TEST_EMAIL"
echo "  Password: $TEST_PASSWORD"
echo "  Username: $TEST_USERNAME"