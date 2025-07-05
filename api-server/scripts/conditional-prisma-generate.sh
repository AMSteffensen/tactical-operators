#!/bin/bash

# 🔧 Conditional Prisma Generate Script
# This script only runs prisma generate if the schema file exists

set -e

SCHEMA_PATH="./prisma/schema.prisma"

if [ -f "$SCHEMA_PATH" ]; then
    echo "📄 Found Prisma schema at $SCHEMA_PATH"
    echo "⚡ Running prisma generate..."
    npx prisma generate --schema="$SCHEMA_PATH"
    echo "✅ Prisma client generated successfully"
else
    echo "⚠️ Prisma schema not found at $SCHEMA_PATH"
    echo "🔄 Skipping prisma generate (will run later in build process)"
fi
