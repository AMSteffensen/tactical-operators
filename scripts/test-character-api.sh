#!/bin/bash

# Test script for Character API endpoints
API_BASE="http://localhost:3001/api"
USER_ID="test-user-1"

echo "🧪 Testing Character API Endpoints"
echo "=================================="

echo "📊 1. Health Check..."
curl -s -X GET "$API_BASE/../health" | echo

echo -e "\n📝 2. Creating a test character..."
RESPONSE=$(curl -s -X POST "$API_BASE/characters" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'"$USER_ID"'",
    "name": "Test Assault",
    "class": "assault",
    "stats": {
      "strength": 15,
      "agility": 12,
      "intelligence": 8,
      "endurance": 10,
      "marksmanship": 8,
      "medical": 7
    }
  }')

echo "$RESPONSE"

echo -e "\n📋 3. Fetching all characters for user..."
curl -s -X GET "$API_BASE/characters?userId=$USER_ID" | jq '.' || echo "jq not available, raw output above"

echo -e "\n✅ Character API test complete!"
