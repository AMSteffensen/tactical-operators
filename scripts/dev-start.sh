#!/bin/bash

# Start development environment for Tactical Operator
echo "🚀 Starting Tactical Operator Development Environment..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root directory (one level up from scripts/)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
API_COLOR='\033[0;34m'  # Blue
WEB_COLOR='\033[0;32m'  # Green
DB_COLOR='\033[0;33m'   # Yellow
NC='\033[0m'            # No Color

# Function to print colored output
print_status() {
    echo -e "${2}[${1}]${NC} ${3}"
}

# Change to project root
cd "$PROJECT_ROOT"

# Start database
print_status "DB" "$DB_COLOR" "Starting PostgreSQL database..."
npm run docker:db

# Build shared package
print_status "SHARED" "$DB_COLOR" "Building shared package..."
npm run build:shared

# Start API server in background
print_status "API" "$API_COLOR" "Starting API server on port 3001..."
(cd "$PROJECT_ROOT/api-server" && npm run dev) &
API_PID=$!

# Wait a moment for API to start
sleep 3

# Start web client
print_status "WEB" "$WEB_COLOR" "Starting web client on port 3000..."
(cd "$PROJECT_ROOT/web-client" && npm run dev) &
WEB_PID=$!

# Function to cleanup processes on exit
cleanup() {
    print_status "CLEANUP" "$DB_COLOR" "Stopping development servers..."
    kill $API_PID 2>/dev/null
    kill $WEB_PID 2>/dev/null
    wait
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

print_status "READY" "$WEB_COLOR" "Development environment started!"
print_status "INFO" "$API_COLOR" "API: http://localhost:3001"
print_status "INFO" "$WEB_COLOR" "Web: http://localhost:3000"
print_status "INFO" "$DB_COLOR" "Press Ctrl+C to stop all servers"

# Wait for background processes
wait
