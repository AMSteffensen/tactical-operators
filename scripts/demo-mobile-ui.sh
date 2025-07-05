#!/bin/bash

# 📱 Mobile-First UI Demo Script for Tactical Operator

set -e

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}📱 Tactical Operator - Mobile-First UI Demo${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

echo -e "${GREEN}🎯 Features Demonstrated:${NC}"
echo -e "   ✅ Full-screen mobile game layout"
echo -e "   ✅ Touch-friendly action buttons"
echo -e "   ✅ Responsive side panels"
echo -e "   ✅ Adaptive UI based on screen size"
echo -e "   ✅ Mobile-optimized character selection"
echo -e "   ✅ Touch-enabled 3D tactical view"
echo ""

# Project directory
PROJECT_DIR="/Users/andreassteffensen/dev/tactical-operator"

echo -e "${YELLOW}🔧 Starting development environment...${NC}"

# Start API server in background
echo -e "${BLUE}   Starting API server (smart port management)...${NC}"
cd "$PROJECT_DIR/api-server"
npm run dev:smart &
API_PID=$!

# Wait for API to start
sleep 6

# Start web client
echo -e "${BLUE}   Starting web client...${NC}"
cd "$PROJECT_DIR/web-client"
npm run dev &
WEB_PID=$!

# Wait for web client to start
sleep 8

echo ""
echo -e "${GREEN}🚀 Demo Environment Ready!${NC}"
echo ""
echo -e "${PURPLE}📱 Mobile Features Available:${NC}"
echo -e "   • Open: ${YELLOW}http://localhost:3000/game${NC}"
echo -e "   • Resize browser to mobile width (≤768px) to see mobile layout"
echo -e "   • Use browser dev tools device emulation for best mobile experience"
echo ""

echo -e "${PURPLE}🎮 Test Flow:${NC}"
echo -e "   1. Navigate to /game route"
echo -e "   2. Tap 'Characters' button (👥) to select squad"
echo -e "   3. Select up to 4 characters for your mission"
echo -e "   4. Tap 'Deploy' (🚀) to deploy your squad"
echo -e "   5. Tap 'Start' (⚔️) to begin tactical combat"
echo -e "   6. Use action buttons: Move (🏃), Attack (⚔️), Defend (🛡️)"
echo -e "   7. Tap panel toggles (👥 📊) to access character/stats panels"
echo ""

echo -e "${PURPLE}📏 Responsive Breakpoints:${NC}"
echo -e "   • Mobile: 320px - 575px (4 action columns)"
echo -e "   • Small Tablet: 576px - 767px (5 action columns)"
echo -e "   • Tablet: 768px - 991px (6 action columns)"
echo -e "   • Desktop: 992px+ (8 action columns + side panels)"
echo ""

echo -e "${YELLOW}⌨️  Press any key to stop demo environment...${NC}"
read -n 1 -s

echo ""
echo -e "${BLUE}🛑 Stopping demo environment...${NC}"

# Clean shutdown
if kill -0 $API_PID 2>/dev/null; then
    echo -e "   Stopping API server..."
    kill $API_PID 2>/dev/null || true
fi

if kill -0 $WEB_PID 2>/dev/null; then
    echo -e "   Stopping web client..."
    kill $WEB_PID 2>/dev/null || true
fi

# Wait for processes to terminate
sleep 3

echo ""
echo -e "${GREEN}✅ Mobile UI Demo Complete!${NC}"
echo ""
echo -e "${PURPLE}🎨 Mobile UI Highlights:${NC}"
echo -e "   • Touch-optimized game controls"
echo -e "   • Responsive design (mobile-first)"
echo -e "   • Full-screen tactical gameplay"
echo -e "   • Intuitive action button layout"
echo -e "   • Collapsible information panels"
echo -e "   • Smooth animations and transitions"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo -e "   • Add pixel art character sprites"
echo -e "   • Implement gesture controls (pinch-zoom, swipe)"
echo -e "   • Add haptic feedback for mobile devices"
echo -e "   • Create PWA manifest for mobile installation"
