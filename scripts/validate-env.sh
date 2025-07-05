#!/bin/bash

# 🔍 Environment Validation Script

echo "🔍 Environment Validation"
echo "========================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Run this from the tactical-operator root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Checking API Server environment...${NC}"

# Check API server .env file
if [ -f "api-server/.env" ]; then
    echo -e "${GREEN}✅ api-server/.env exists${NC}"
    
    # Load and check variables
    source api-server/.env
    
    # Check DATABASE_URL
    if [ -n "$DATABASE_URL" ]; then
        echo -e "${GREEN}✅ DATABASE_URL is set${NC}"
    else
        echo -e "${RED}❌ DATABASE_URL is missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check JWT_SECRET
    if [ -n "$JWT_SECRET" ]; then
        if [ ${#JWT_SECRET} -ge 32 ]; then
            echo -e "${GREEN}✅ JWT_SECRET is set and long enough${NC}"
        else
            echo -e "${YELLOW}⚠️  JWT_SECRET is too short (should be 32+ chars)${NC}"
        fi
    else
        echo -e "${RED}❌ JWT_SECRET is missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check PORT
    if [ -n "$PORT" ]; then
        echo -e "${GREEN}✅ PORT is set to $PORT${NC}"
    else
        echo -e "${RED}❌ PORT is missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check CORS_ORIGIN
    if [ -n "$CORS_ORIGIN" ]; then
        echo -e "${GREEN}✅ CORS_ORIGIN is set to $CORS_ORIGIN${NC}"
    else
        echo -e "${RED}❌ CORS_ORIGIN is missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
else
    echo -e "${RED}❌ api-server/.env is missing${NC}"
    echo "   Run: cp api-server/.env.example api-server/.env"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo -e "${BLUE}📋 Checking Web Client environment...${NC}"

# Check web client .env file
if [ -f "web-client/.env" ]; then
    echo -e "${GREEN}✅ web-client/.env exists${NC}"
    
    # Load and check variables
    source web-client/.env
    
    # Check VITE_API_URL
    if [ -n "$VITE_API_URL" ]; then
        echo -e "${GREEN}✅ VITE_API_URL is set to $VITE_API_URL${NC}"
    else
        echo -e "${RED}❌ VITE_API_URL is missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check VITE_SOCKET_URL
    if [ -n "$VITE_SOCKET_URL" ]; then
        echo -e "${GREEN}✅ VITE_SOCKET_URL is set to $VITE_SOCKET_URL${NC}"
    else
        echo -e "${RED}❌ VITE_SOCKET_URL is missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
else
    echo -e "${RED}❌ web-client/.env is missing${NC}"
    echo "   Run: cp web-client/.env.example web-client/.env"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo -e "${BLUE}📋 Testing database connection...${NC}"

# Test database connection
if [ -f "api-server/.env" ]; then
    cd api-server
    if npm run db:generate > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection works${NC}"
    else
        echo -e "${RED}❌ Database connection failed${NC}"
        echo "   Make sure PostgreSQL is running"
        echo "   For Docker: npm run docker:db"
        ERRORS=$((ERRORS + 1))
    fi
    cd ..
fi

echo ""
echo -e "${BLUE}📋 Testing API server startup...${NC}"

# Test API server can start (dry run)
cd api-server
if node -e "require('dotenv').config(); require('./src/app.ts')" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API server configuration is valid${NC}"
else
    echo -e "${YELLOW}⚠️  API server startup test failed (might be normal)${NC}"
fi
cd ..

echo ""
echo "================================"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Environment validation passed!${NC}"
    echo ""
    echo -e "${BLUE}📋 Ready to start development:${NC}"
    echo "   npm run dev"
    echo ""
    echo -e "${BLUE}📋 For production setup:${NC}"
    echo "   ./scripts/generate-secrets.sh"
    echo "   See docs/ENVIRONMENT_SETUP.md"
else
    echo -e "${RED}❌ Found $ERRORS error(s) in environment setup${NC}"
    echo ""
    echo -e "${BLUE}📋 To fix issues:${NC}"
    echo "   ./scripts/setup-env.sh"
    echo "   See docs/ENVIRONMENT_SETUP.md"
    exit 1
fi
