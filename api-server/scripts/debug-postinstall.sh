#!/bin/bash

echo "🔍 Debug: Postinstall Script Starting"
echo "=================================="

# Check current working directory
echo "📂 Current Directory: $(pwd)"
echo "📂 Directory Contents:"
ls -la

# Check environment variables
echo ""
echo "🌍 Environment Variables:"
echo "- NODE_ENV: $NODE_ENV"
echo "- DATABASE_URL: ${DATABASE_URL:+SET (${DATABASE_URL:0:30}...)} ${DATABASE_URL:-NOT SET}"
echo "- PORT: $PORT"

# Check for Prisma schema
echo ""
echo "📋 Prisma Schema Check:"
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Prisma schema found"
    echo "📄 Schema preview:"
    head -20 prisma/schema.prisma
else
    echo "❌ Prisma schema NOT found"
    echo "📂 Looking for schema files:"
    find . -name "*.prisma" -type f 2>/dev/null || echo "No .prisma files found"
fi

# Check for Railway-specific variables
echo ""
echo "🚂 Railway Variables:"
env | grep -i "railway\|postgres\|database" | head -10

# Run Prisma generate with debugging
echo ""
echo "🔧 Running Prisma Generate..."
npx prisma generate --schema=./prisma/schema.prisma

if [ $? -eq 0 ]; then
    echo "✅ Prisma generate successful"
else
    echo "❌ Prisma generate failed"
    exit 1
fi

# Run Prisma db push with debugging
echo ""
echo "🚀 Running Prisma DB Push..."
npx prisma db push --schema=./prisma/schema.prisma

if [ $? -eq 0 ]; then
    echo "✅ Prisma db push successful"
else
    echo "❌ Prisma db push failed"
    exit 1
fi

echo ""
echo "🎉 Postinstall completed successfully"
