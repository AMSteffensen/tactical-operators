#!/bin/bash

# Demo script to test smart API port handling

echo "🧪 Testing Smart API Port Handling..."
echo ""

# Start first instance
echo "1️⃣ Starting first API server instance..."
cd /Users/andreassteffensen/dev/tactical-operator/api-server
npm run dev:smart &
FIRST_PID=$!

sleep 6

echo ""
echo "2️⃣ Checking first instance health..."
curl -s http://localhost:3001/health | jq '.' || echo "First instance not responding"

echo ""
echo "3️⃣ Starting second instance (should handle port conflict)..."
echo "2" | npm run dev:smart &
SECOND_PID=$!

sleep 6

echo ""
echo "4️⃣ Checking both instances..."
echo "Port 3001:"
curl -s http://localhost:3001/health | jq '.' || echo "Port 3001 not responding"

echo "Port 3002:"
curl -s http://localhost:3002/health | jq '.' || echo "Port 3002 not responding"

echo ""
echo "5️⃣ Cleaning up..."
kill $FIRST_PID $SECOND_PID 2>/dev/null || true
sleep 2

echo ""
echo "✅ Smart API port handling demo complete!"
