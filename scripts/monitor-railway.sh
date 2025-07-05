#!/bin/bash

# 🚂 Railway Deployment Monitor

echo "🚂 Railway Deployment Monitor"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Your Railway API URL (update this with your actual URL)
RAILWAY_API_URL="https://tactical-operator-api.up.railway.app"

echo -e "${BLUE}📊 Monitoring Railway deployment...${NC}"
echo ""

# Function to check service health
check_health() {
    local url="$1/health"
    local response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url" 2>/dev/null)
    echo "$response"
}

# Function to check if service is responding
check_service() {
    local url="$1"
    local response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url" 2>/dev/null)
    echo "$response"
}

# Monitor loop
while true; do
    echo -e "${YELLOW}⏱️  $(date '+%H:%M:%S') - Checking deployment status...${NC}"
    
    # Check if service is responding
    SERVICE_STATUS=$(check_service "$RAILWAY_API_URL")
    HEALTH_STATUS=$(check_health "$RAILWAY_API_URL")
    
    if [ "$HEALTH_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ API Server is healthy! (HTTP $HEALTH_STATUS)${NC}"
        echo -e "${GREEN}🎉 Deployment successful!${NC}"
        echo ""
        echo -e "${BLUE}🌐 Your API is live at: $RAILWAY_API_URL${NC}"
        echo -e "${BLUE}🔍 Health check: $RAILWAY_API_URL/health${NC}"
        break
    elif [ "$SERVICE_STATUS" = "200" ] || [ "$SERVICE_STATUS" = "404" ]; then
        echo -e "${YELLOW}⚠️  Service responding but health check failed (HTTP $SERVICE_STATUS/$HEALTH_STATUS)${NC}"
        echo -e "${YELLOW}   This might be normal during deployment...${NC}"
    elif [ "$SERVICE_STATUS" = "000" ]; then
        echo -e "${RED}❌ Service not reachable (still deploying or failed)${NC}"
    else
        echo -e "${YELLOW}⚠️  Service status: HTTP $SERVICE_STATUS${NC}"
    fi
    
    echo -e "${BLUE}   Retrying in 10 seconds...${NC}"
    sleep 10
    echo ""
done

echo ""
echo -e "${GREEN}🚀 Ready to test your API!${NC}"
echo ""
echo -e "${BLUE}Quick tests you can run:${NC}"
echo "curl $RAILWAY_API_URL/health"
echo "curl $RAILWAY_API_URL/api/characters"
echo ""
