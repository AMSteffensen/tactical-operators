#!/bin/bash

# 🔑 Environment Setup Script

set -e

echo "🔑 Tactical Operator - Environment Setup"
echo "======================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: This script must be run from the tactical-operator root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Setting up development environment variables...${NC}"
echo ""

# API Server .env setup
echo -e "${YELLOW}1. Setting up API server environment...${NC}"
if [ ! -f "api-server/.env" ]; then
    cp api-server/.env.example api-server/.env
    echo -e "${GREEN}✅ Created api-server/.env from example${NC}"
else
    echo -e "${YELLOW}⚠️  api-server/.env already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp api-server/.env.example api-server/.env
        echo -e "${GREEN}✅ Overwrote api-server/.env${NC}"
    fi
fi

# Web Client .env setup
echo -e "${YELLOW}2. Setting up web client environment...${NC}"
if [ ! -f "web-client/.env" ]; then
    cp web-client/.env.example web-client/.env
    echo -e "${GREEN}✅ Created web-client/.env from example${NC}"
else
    echo -e "${YELLOW}⚠️  web-client/.env already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp web-client/.env.example web-client/.env
        echo -e "${GREEN}✅ Overwrote web-client/.env${NC}"
    fi
fi

echo ""
echo -e "${BLUE}🔐 Generating secure secrets...${NC}"

# Generate JWT secret for development
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "${GREEN}✅ Generated JWT secret: ${JWT_SECRET:0:16}...${NC}"

# Update API server .env with generated secret
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" api-server/.env
else
    # Linux
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" api-server/.env
fi

echo ""
echo -e "${BLUE}🐳 Database setup...${NC}"

# Ask about database setup
echo "Choose your database setup:"
echo "1. Docker (Recommended - automatic setup)"
echo "2. Local PostgreSQL (Manual setup required)"
read -p "Enter choice (1 or 2): " -n 1 -r
echo ""

if [[ $REPLY == "1" ]]; then
    echo -e "${YELLOW}🐳 Setting up Docker database...${NC}"
    
    # Update DATABASE_URL for Docker
    DOCKER_DB_URL="postgresql://tactical_user:tactical_dev_password@localhost:5432/tactical_operator"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"${DOCKER_DB_URL}\"|" api-server/.env
    else
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"${DOCKER_DB_URL}\"|" api-server/.env
    fi
    
    # Start Docker database
    echo -e "${BLUE}🚀 Starting Docker database...${NC}"
    npm run docker:db
    
    echo -e "${GREEN}✅ Docker database started${NC}"
    
elif [[ $REPLY == "2" ]]; then
    echo -e "${YELLOW}⚠️  Local PostgreSQL setup${NC}"
    echo ""
    echo "You'll need to:"
    echo "1. Install PostgreSQL on your system"
    echo "2. Create a database named 'tactical_operator'"
    echo "3. Update the DATABASE_URL in api-server/.env"
    echo ""
    echo "Current DATABASE_URL in api-server/.env:"
    grep "DATABASE_URL" api-server/.env
    echo ""
    read -p "Press Enter to continue when ready..."
fi

echo ""
echo -e "${BLUE}🧪 Testing environment setup...${NC}"

# Test if Node.js can load the environment
cd api-server
if node -e "require('dotenv').config(); console.log('✅ Environment loaded successfully')"; then
    echo -e "${GREEN}✅ API server environment loaded successfully${NC}"
else
    echo -e "${RED}❌ Error loading API server environment${NC}"
fi
cd ..

echo ""
echo -e "${GREEN}🎉 Environment setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Run database migrations:"
echo "   cd api-server && npm run db:migrate"
echo ""
echo "2. Start development servers:"
echo "   npm run dev"
echo ""
echo "3. Test the setup:"
echo "   Open http://localhost:3000 in your browser"
echo ""
echo -e "${BLUE}📚 For production setup, see:${NC}"
echo "   docs/ENVIRONMENT_SETUP.md"
echo "   docs/HOSTING_SETUP_GUIDE.md"
