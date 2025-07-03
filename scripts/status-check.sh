#!/bin/bash

# Tactical Operator Development Status Check
echo "🎮 Tactical Operator - Development Environment Status"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

check_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

check_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo ""
echo "📦 Package Status:"

# Check if packages are built
if [ -d "shared/dist" ]; then
    check_status 0 "Shared package built"
else
    check_status 1 "Shared package needs building (run: npm run build:shared)"
fi

if [ -d "api-server/dist" ]; then
    check_status 0 "API server built"
else
    check_status 1 "API server needs building (run: cd api-server && npm run build)"
fi

echo ""
echo "🗄️  Database Status:"

# Check if Docker is running
if docker ps &> /dev/null; then
    check_status 0 "Docker is running"
    
    # Check if database container is running
    if docker ps | grep -q "tactical-operator-db-dev"; then
        check_status 0 "PostgreSQL container is running"
    else
        check_status 1 "PostgreSQL container not running (run: npm run docker:db)"
    fi
else
    check_status 1 "Docker is not running"
fi

echo ""
echo "🌐 Server Status:"

# Check if API server is running
if curl -s http://localhost:3001/health &> /dev/null; then
    check_status 0 "API server is running on port 3001"
else
    check_status 1 "API server not running (run: npm run dev:api)"
fi

# Check if web client is running
if curl -s http://localhost:3000 &> /dev/null; then
    check_status 0 "Web client is running on port 3000"
else
    check_status 1 "Web client not running (run: npm run dev:web)"
fi

echo ""
echo "🔧 Quick Commands:"
check_info "Start everything: npm run dev"
check_info "Start database: npm run docker:db"
check_info "Build all: npm run build"
check_info "View logs: npm run docker:db:logs"

echo ""
