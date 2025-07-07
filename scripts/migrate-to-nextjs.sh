#!/bin/bash

# 🚀 Next.js Migration Script
# Automates the migration from React + Express to Next.js full-stack

set -e

PROJECT_NAME="tactical-operator-nextjs"
CURRENT_DIR=$(pwd)

echo "🚀 Starting Next.js Migration for Tactical Operator"
echo "=================================================="

# Step 1: Create Next.js project
echo "📦 Step 1: Creating Next.js project..."
npx create-next-app@latest $PROJECT_NAME \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git

cd $PROJECT_NAME

# Step 2: Install additional dependencies
echo "📦 Step 2: Installing dependencies..."
npm install \
  @prisma/client \
  prisma \
  bcryptjs \
  jsonwebtoken \
  zod \
  three \
  @types/three \
  socket.io \
  socket.io-client \
  axios \
  zustand

npm install -D \
  @types/bcryptjs \
  @types/jsonwebtoken \
  @types/node

# Step 3: Copy shared types
echo "📁 Step 3: Copying shared types..."
mkdir -p lib/shared
cp -r ../shared/src/* lib/shared/
cp ../shared/package.json lib/shared/

# Step 4: Set up Prisma
echo "🗄️ Step 4: Setting up Prisma..."
mkdir -p prisma
cp -r ../api-server/prisma/* prisma/

# Step 5: Create project structure
echo "🏗️ Step 5: Creating project structure..."

# Create directories
mkdir -p src/components/auth
mkdir -p src/components/navigation
mkdir -p src/components/game
mkdir -p src/systems/rendering
mkdir -p src/systems/combat
mkdir -p src/lib/auth
mkdir -p src/lib/database
mkdir -p src/lib/services
mkdir -p src/app/api/auth/login
mkdir -p src/app/api/auth/register
mkdir -p src/app/api/character
mkdir -p src/app/api/guild
mkdir -p src/app/api/campaign
mkdir -p src/app/game
mkdir -p src/app/characters
mkdir -p src/app/guild
mkdir -p src/app/campaign

# Step 6: Copy and migrate React components
echo "⚛️ Step 6: Migrating React components..."

# Function to add 'use client' directive
add_use_client() {
  local source_file="$1"
  local target_file="$2"
  
  echo "'use client';" > "$target_file"
  echo "" >> "$target_file"
  cat "$source_file" >> "$target_file"
}

# Copy components with 'use client' directive
echo "Copying authentication components..."
add_use_client "../web-client/src/components/auth/LoginForm.tsx" "src/components/auth/LoginForm.tsx"
add_use_client "../web-client/src/components/auth/RegisterForm.tsx" "src/components/auth/RegisterForm.tsx"
add_use_client "../web-client/src/components/auth/ProtectedRoute.tsx" "src/components/auth/ProtectedRoute.tsx"

echo "Copying navigation components..."
add_use_client "../web-client/src/components/navigation/Navigation.tsx" "src/components/navigation/Navigation.tsx"

echo "Copying game components..."
add_use_client "../web-client/src/components/TacticalView.tsx" "src/components/game/TacticalView.tsx"
add_use_client "../web-client/src/components/CharacterList.tsx" "src/components/game/CharacterList.tsx"
add_use_client "../web-client/src/components/CharacterCreation.tsx" "src/components/game/CharacterCreation.tsx"

# Copy game systems (no 'use client' needed for these)
echo "Copying game systems..."
cp -r ../web-client/src/systems/* src/systems/

# Copy services
echo "Copying services..."
cp -r ../web-client/src/services/* src/lib/services/

# Copy contexts
echo "Copying contexts..."
mkdir -p src/lib/contexts
add_use_client "../web-client/src/contexts/AuthContext.tsx" "src/lib/contexts/AuthContext.tsx"

# Step 7: Create API routes
echo "🔌 Step 7: Creating API routes..."

# Auth login route
cat > src/app/api/auth/login/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Check for user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET as string
    );

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
EOF

# Auth register route
cat > src/app/api/auth/register/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = registerSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET as string
    );

    return NextResponse.json({
      success: true,
      data: {
        user,
        token,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
EOF

# Character API route
cat > src/app/api/character/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  const user = await authenticate(request);
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const characters = await prisma.character.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: { characters },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch characters' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticate(request);
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { name, class: characterClass, stats } = body;

    // Create character
    const character = await prisma.character.create({
      data: {
        name,
        class: characterClass,
        userId: user.id,
        stats: stats || {},
        inventory: [],
        equipment: {},
        skills: [],
        traits: [],
        economy: {
          currency: 100,
          bank: 0,
        },
        level: 1,
        experience: 0,
        health: 100,
        maxHealth: 100,
      },
    });

    return NextResponse.json({
      success: true,
      data: { character },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create character' },
      { status: 500 }
    );
  }
}
EOF

# Step 8: Create auth middleware
echo "🔐 Step 8: Creating authentication middleware..."

mkdir -p src/lib/auth
cat > src/lib/auth/middleware.ts << 'EOF'
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}
EOF

# Step 9: Create database configuration
echo "🗄️ Step 9: Creating database configuration..."

cat > src/lib/database/prisma.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
EOF

# Step 10: Create pages
echo "📄 Step 10: Creating pages..."

# Home page
cat > src/app/page.tsx << 'EOF'
import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to Tactical Operator
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          A tactical top-down multiplayer shooter with RPG mechanics and persistent campaigns.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Link href="/game" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg">
            Start Playing
          </Link>
          <Link href="/characters" className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg">
            Manage Characters
          </Link>
        </div>
      </div>
    </div>
  );
}
EOF

# Game page
cat > src/app/game/page.tsx << 'EOF'
'use client';
import dynamic from 'next/dynamic';

// Dynamically import game components to avoid SSR issues with WebGL
const TacticalView = dynamic(
  () => import('@/components/game/TacticalView'),
  { ssr: false }
);

export default function GamePage() {
  return (
    <div className="h-screen bg-black">
      <TacticalView />
    </div>
  );
}
EOF

# Characters page
cat > src/app/characters/page.tsx << 'EOF'
'use client';
import { CharacterList } from '@/components/game/CharacterList';
import { CharacterCreation } from '@/components/game/CharacterCreation';
import { useState } from 'react';

export default function CharactersPage() {
  const [showCreation, setShowCreation] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Character Management</h1>
        <p className="text-gray-300">Create and manage your tactical operators</p>
      </div>

      {showCreation ? (
        <CharacterCreation onBack={() => setShowCreation(false)} />
      ) : (
        <div>
          <div className="mb-4">
            <button
              onClick={() => setShowCreation(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Create New Character
            </button>
          </div>
          <CharacterList onCreateNew={() => setShowCreation(true)} />
        </div>
      )}
    </div>
  );
}
EOF

# Step 11: Update layout
echo "🎨 Step 11: Creating root layout..."

cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { Navigation } from '@/components/navigation/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tactical Operator',
  description: 'A tactical top-down multiplayer shooter with RPG mechanics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
        <AuthProvider>
          <Navigation />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
EOF

# Step 12: Create environment configuration
echo "🔧 Step 12: Creating environment configuration..."

cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tactical_operator?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="another-super-secret-key"
EOF

# Step 13: Update package.json scripts
echo "📦 Step 13: Updating package.json scripts..."

# Add database scripts to package.json
npm pkg set scripts.db:generate="prisma generate"
npm pkg set scripts.db:push="prisma db push"
npm pkg set scripts.db:migrate="prisma migrate dev"
npm pkg set scripts.db:studio="prisma studio"
npm pkg set scripts.postinstall="prisma generate"

# Step 14: Fix import paths in migrated files
echo "🔧 Step 14: Fixing import paths..."

# Update import paths in all TypeScript files
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
  -e 's|@shared/types|@/lib/shared/types|g' \
  -e 's|../services/|@/lib/services/|g' \
  -e 's|../../contexts/|@/lib/contexts/|g' \
  -e 's|../contexts/|@/lib/contexts/|g'

# Step 15: Create Next.js configuration
echo "⚙️ Step 15: Creating Next.js configuration..."

cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    // Handle Three.js imports
    config.externals = config.externals || [];
    config.externals.push({
      'three': 'three'
    });
    
    return config;
  },
  // Disable static optimization for pages that use WebGL
  staticPageGenerationTimeout: 1000,
};

module.exports = nextConfig;
EOF

# Step 16: Update Tailwind config for game UI
echo "🎨 Step 16: Updating Tailwind configuration..."

cat > tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#1a1a1a',
        'game-panel': '#2a2a2a',
        'game-accent': '#4CAF50',
      },
    },
  },
  plugins: [],
}

export default config
EOF

echo ""
echo "✅ Next.js Migration Complete!"
echo "================================"
echo ""
echo "📁 Project created at: $PROJECT_NAME"
echo ""
echo "🚀 Next steps:"
echo "  1. cd $PROJECT_NAME"
echo "  2. Update .env.local with your database URL"
echo "  3. npm run db:push"
echo "  4. npm run dev"
echo ""
echo "🔧 Manual tasks remaining:"
echo "  - Update import paths if any are broken"
echo "  - Test WebGL components"
echo "  - Configure Socket.IO (if needed)"
echo "  - Update CSS classes for Tailwind"
echo ""
echo "📚 Documentation: /docs/NEXTJS_MIGRATION_ANALYSIS.md"
