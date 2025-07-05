#!/bin/bash

# Smart API Server Start Script
# Handles port conflicts by killing existing processes and finding available ports

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
DEFAULT_PORT=3001
MAX_PORT=3010
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
API_DIR="$PROJECT_ROOT/api-server"

echo -e "${BLUE}🚀 Starting Tactical Operator API Server...${NC}"

# Function to check if a port is in use
is_port_in_use() {
    local port=$1
    lsof -i :$port >/dev/null 2>&1
}

# Function to kill process using a port
kill_port_process() {
    local port=$1
    echo -e "${YELLOW}⚡ Killing existing process on port $port...${NC}"
    
    # Get the PID of the process using the port
    local pid=$(lsof -ti :$port)
    
    if [ ! -z "$pid" ]; then
        # Try graceful termination first
        echo -e "${BLUE}   Sending SIGTERM to PID $pid...${NC}"
        kill -TERM $pid 2>/dev/null || true
        
        # Wait up to 5 seconds for graceful shutdown
        local count=0
        while [ $count -lt 5 ] && kill -0 $pid 2>/dev/null; do
            sleep 1
            count=$((count + 1))
        done
        
        # If still running, force kill
        if kill -0 $pid 2>/dev/null; then
            echo -e "${RED}   Force killing PID $pid...${NC}"
            kill -KILL $pid 2>/dev/null || true
            sleep 1
        fi
        
        echo -e "${GREEN}   ✓ Process on port $port terminated${NC}"
    else
        echo -e "${YELLOW}   No process found on port $port${NC}"
    fi
}

# Function to find an available port
find_available_port() {
    local start_port=$1
    local max_port=$2
    
    for port in $(seq $start_port $max_port); do
        if ! is_port_in_use $port; then
            echo $port
            return 0
        fi
    done
    
    echo ""
    return 1
}

# Main execution
cd "$API_DIR"

# Check if we should kill existing process on default port
PREFERRED_PORT=${1:-$DEFAULT_PORT}

if is_port_in_use $PREFERRED_PORT; then
    echo -e "${YELLOW}📍 Port $PREFERRED_PORT is in use${NC}"
    
    # Ask user preference (with timeout for CI/automated environments)
    echo -e "${BLUE}Choose an option:${NC}"
    echo -e "  ${GREEN}1)${NC} Kill existing process and use port $PREFERRED_PORT"
    echo -e "  ${GREEN}2)${NC} Find next available port"
    echo -e "  ${GREEN}3)${NC} Exit"
    echo ""
    
    # Read user input with timeout (defaults to option 1 for automation)
    read -t 10 -p "Enter choice (1-3) [default: 1]: " choice 2>/dev/null || choice="1"
    echo ""
    
    case $choice in
        1|"")
            kill_port_process $PREFERRED_PORT
            FINAL_PORT=$PREFERRED_PORT
            ;;
        2)
            echo -e "${BLUE}🔍 Finding next available port...${NC}"
            FINAL_PORT=$(find_available_port $((PREFERRED_PORT + 1)) $MAX_PORT)
            if [ -z "$FINAL_PORT" ]; then
                echo -e "${RED}❌ No available ports found between $((PREFERRED_PORT + 1)) and $MAX_PORT${NC}"
                exit 1
            fi
            echo -e "${GREEN}✓ Found available port: $FINAL_PORT${NC}"
            ;;
        3)
            echo -e "${YELLOW}👋 Exiting...${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid choice. Exiting...${NC}"
            exit 1
            ;;
    esac
else
    FINAL_PORT=$PREFERRED_PORT
    echo -e "${GREEN}✓ Port $PREFERRED_PORT is available${NC}"
fi

# Set the port environment variable
export PORT=$FINAL_PORT

# Update .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    # Update or add PORT in .env
    if grep -q "^PORT=" "$PROJECT_ROOT/.env"; then
        # Update existing PORT line
        sed -i.bak "s/^PORT=.*/PORT=$FINAL_PORT/" "$PROJECT_ROOT/.env"
        echo -e "${BLUE}📝 Updated PORT in .env file${NC}"
    else
        # Add PORT line
        echo "PORT=$FINAL_PORT" >> "$PROJECT_ROOT/.env"
        echo -e "${BLUE}📝 Added PORT to .env file${NC}"
    fi
fi

echo -e "${GREEN}🚀 Starting API server on port $FINAL_PORT...${NC}"
echo -e "${BLUE}📊 Health check will be available at: http://localhost:$FINAL_PORT/health${NC}"
echo -e "${BLUE}🔌 Socket.IO will be enabled${NC}"
echo ""

# Start the server
exec npm run dev
