# 🎮 Tactical Operator: Guild Protocol

A tactical top-down multiplayer shooter with RPG mechanics, persistent characters, and guild-based cooperative gameplay.

## 🎯 Overview

Tactical Operator combines tactical combat with persistent character progression and guild-based economics. Players manage squads of soldiers who retain stats, inventory, and experience across campaigns and sessions.

### Key Features

- **✅ WebGL 3D Tactical View**: Three.js-powered top-down tactical combat view
- **✅ Real-time Multiplayer**: Socket.IO integration with room management and live unit movement
- **✅ Distraction-Free Game Screens**: Squad Selection → Deployment → Full-Screen Gameplay flow
- **Tactical Combat**: Turn-based planning with real-time execution
- **Persistent Characters**: RPG-style progression that survives sessions
- **Guild System**: Collaborative economics and shared campaigns
- **Hybrid Play**: Digital-only or physical tabletop integration
- **Multiple Platforms**: WebGL frontend + React Native companion app

## 🏗️ Architecture

```
tactical-operator/
├── web-client/          # React + WebGL game frontend
├── api-server/          # Node.js backend with PostgreSQL
├── mobile-app/          # React Native companion app
├── shared/              # Shared types and utilities
└── tests/               # Test suites for all components
```

## 🚀 Deployment

Your tactical-operator game has a complete CI/CD pipeline ready for free hosting platforms!

### Quick Deploy
```bash
# Check if ready for deployment
npm run deploy:check

# Deploy to production (Railway + Vercel + Expo)
npm run deploy
```

### Hosting Platforms (FREE)
- **🚂 Railway**: API server + PostgreSQL database
- **🌐 Vercel**: Web client hosting  
- **📱 Expo EAS**: Mobile app builds
- **🔄 GitHub Actions**: Automated CI/CD

### Setup Instructions
See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for detailed deployment setup and [`docs/CI_CD_COMPLETION.md`](docs/CI_CD_COMPLETION.md) for what's already configured.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL 14+ OR Docker (recommended for database)
- Git
- Make (available on macOS/Linux, install via tools on Windows)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/tactical-operator.git
   cd tactical-operator
   ```

2. **Install dependencies**
   ```bash
   # Using Makefile (recommended)
   make install
   
   # Or using npm
   npm run install-all
   ```

3. **Quick development start**
   ```bash
   # Start database + development servers
   make quick-start
   
   # Or manually
   make docker-db
   make dev
   ```

### 🛠️ Makefile Commands

The project includes a comprehensive Makefile for standardized operations:

```bash
make help           # Show all available commands
make quick-start    # Start database + development servers  
make quick-build    # Build and test all packages
make quick-check    # Type check + lint all packages
make status         # Check project health
```

See [`docs/MAKEFILE_GUIDE.md`](docs/MAKEFILE_GUIDE.md) for complete command reference.

3. **Set up the database (Choose one option)**

   **Option A: Docker Database (Recommended)**
   ```bash
   # Start PostgreSQL in Docker
   npm run docker:db
   
   # Copy and configure environment files
   cp api-server/.env.example api-server/.env
   cp web-client/.env.example web-client/.env
   
   # Update api-server/.env with Docker database URL:
   # DATABASE_URL="postgresql://tactical_user:tactical_password@localhost:5432/tactical_operator"
   ```

   **Option B: Local PostgreSQL**
   ```bash
   # Install PostgreSQL locally, then:
   cp api-server/.env.example api-server/.env
   cp web-client/.env.example web-client/.env
   # Edit api-server/.env with your local database credentials
   ```

4. **Set up the database schema**
   ```bash
   cd api-server
   npm run db:migrate
   npm run db:seed
   cd ..
   ```

5. **Start the development servers**
   
   **Option A: PM2 Process Management (Recommended)**
   ```bash
   # Start all services with PM2 (automatic restarts, centralized logging)
   npm run dev
   
   # Check status
   npm run dev:status
   
   # View logs
   npm run dev:logs
   
   # Stop services
   npm run stop
   ```
   
   **Option B: Smart Development (Alternative)**
   ```bash
   # Start with automatic port conflict resolution
   npm run dev:traditional
   ```
   This uses the smart API starter that automatically handles port conflicts.
   
   **Option C: Individual Services**
   ```bash
   # API Server with smart port management
   npm run dev:api:smart
   
   # API Server (traditional)
   npm run dev:api
   
   # Web Client  
   npm run dev:web
   ```

This will start:
- Web client on http://localhost:3000 (or next available port)
- API server on http://localhost:3001 (or next available port)
- Database on localhost:5432 (if using Docker)

### Port Conflict Resolution

The smart API starter (`scripts/api-start.sh`) automatically handles port conflicts by:
- Detecting if the preferred port (3001) is in use
- Offering to kill existing processes or find alternative ports
- Updating environment configuration automatically
- Providing graceful shutdown handling

### Alternative Development Commands

```bash
# Start everything including database
npm run dev:full

# Run the custom development script
npm run dev:script

# Build all packages
npm run build

# Run tests
npm run test
```

### Docker Development (Alternative)

For a fully containerized development environment:

```bash
# Start all services in Docker
npm run docker:dev

# View logs
npm run docker:dev:logs

# Stop all services
npm run docker:dev:down
```

See [docs/DOCKER.md](docs/DOCKER.md) for detailed Docker setup and usage.

### Mobile App (Optional)

```bash
cd mobile-app
npm start
```

## 🎮 Game Systems

### ✅ Implemented Features

#### WebGL 3D Tactical View
- **Three.js Integration**: Complete 3D rendering system with orthographic top-down camera
- **Tactical Renderer**: Scene management with lighting, units, and obstacles  
- **Demo Scene**: Interactive tactical map with player (green), enemy (red), ally (blue) units and cover
- **Camera Controls**: Mouse wheel zoom, optimized for tactical overview

#### Real-time Multiplayer
- **Socket.IO Integration**: Comprehensive real-time communication system
- **Room Management**: Players can join/leave tactical sessions
- **Live Unit Movement**: Real-time synchronization of unit positions between players
- **Turn-based Support**: Framework for turn-based tactical gameplay
- **Connection Status**: Visual indicators for network connectivity

#### Distraction-Free Game Screens
- **Squad Selection Screen**: Full-screen character selection with up to 4 squad members
- **Deployment Screen**: Tactical grid-based positioning interface (4x3 grid)
- **Gameplay Screen**: 100% width canvas with zero UI distractions during tactical combat
- **ESC Pause Menu**: Minimal interruption system for fullscreen control
- **Progressive Flow**: Clean separation between selection, deployment, and execution phases

#### Development Ready
- **TypeScript**: Full type safety across client, server, and shared packages
- **Build System**: Vite for client, Node.js for server, concurrent development scripts
- **Database**: PostgreSQL with Prisma ORM, Docker containerization support

### 🔄 In Development

#### Character System
- **Classes**: Assault, Sniper, Medic, Engineer, Demolitions
- **Stats**: Strength, Agility, Intelligence, Endurance, Marksmanship, Medical
- **Progression**: Experience-based leveling with skill unlocks
- **Economy**: Personal currency and inventory management

### Guild System
- **Roles**: Owner, Officer, Member with different permissions
- **Economy**: Shared guild bank and equipment locker
- **Collaboration**: Guild-exclusive campaigns and missions

### Campaign System
- **Persistent Maps**: Player actions affect the world long-term
- **Multiple Modes**: Solo, Co-op, Guild campaigns
- **Session Resume**: Pick up where you left off across sessions

### Combat System
- **Tactical Planning**: Turn-based strategy with action points
- **Real-time Elements**: Movement and aiming with physics
- **Line of Sight**: Visibility and cover mechanics
- **Squad Control**: Manage multiple soldiers simultaneously

## 🛠️ Development

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + TypeScript + WebGL (Pixi.js) |
| Backend | Node.js + Express + Socket.IO |
| Database | PostgreSQL + Prisma ORM |
| Mobile | React Native + Expo |
| State | Zustand (frontend) |
| Auth | JWT + bcrypt |
| Testing | Vitest + React Testing Library |

### Project Structure

```
web-client/
├── features/           # Game systems by domain
│   ├── combat/        # Combat logic and UI
│   ├── character/     # Character management
│   ├── guild/         # Guild features
│   └── campaign/      # Campaign system
├── systems/           # Core game systems
│   ├── rendering/     # WebGL rendering
│   ├── physics/       # Game physics
│   └── input/         # Input handling
└── components/        # Reusable UI components

api-server/
├── routes/            # API endpoints
├── services/          # Business logic
├── models/            # Database models
├── controllers/       # Request handlers
└── sockets/           # WebSocket handlers

shared/
├── types/             # TypeScript interfaces
├── constants/         # Game constants
└── utils/             # Shared utilities
```

### Available Scripts

```bash
# Development with PM2 (Recommended)
npm run dev              # Start all services with PM2
npm run dev:status       # Check PM2 process status
npm run dev:logs         # View all service logs
npm run stop             # Stop all services
npm run restart          # Restart all services

# Traditional Development
npm run dev:traditional  # Start with concurrently
npm run dev:web          # Start web client only
npm run dev:api          # Start API server only
npm run dev:mobile       # Start mobile app

# Building
npm run build            # Build all projects
npm run build:web        # Build web client
npm run build:api        # Build API server

# Testing
npm run test             # Run all tests
npm run test:web         # Test web client
npm run test:api         # Test API server

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
npm run db:studio        # Open Prisma Studio

# Docker
npm run docker:db        # Start PostgreSQL in Docker
npm run docker:db:down   # Stop PostgreSQL Docker container
npm run docker:dev       # Start all services in Docker
npm run docker:dev:down  # Stop all Docker services
```

### Coding Standards

- **TypeScript** for all code
- **ESLint + Prettier** for formatting
- **Zod** for runtime validation
- **Jest/Vitest** for testing
- **File naming**: kebab-case for files, PascalCase for components
- **Max 500 lines** per file (split if larger)

## 🎯 Gameplay

### Solo Play
1. Create and customize your tactical squad
2. Join or create campaigns with AI opponents
3. Complete missions to gain XP and equipment
4. Progress through increasingly difficult scenarios

### Guild Play
1. Join or create a guild with friends
2. Pool resources in the guild bank
3. Coordinate strategies for guild campaigns
4. Share equipment and tactical knowledge

### Hybrid Tabletop
1. Use the mobile app for character management
2. Join sessions via room codes (like Kahoot)
3. Place physical tokens on printed maps
4. Use digital dice and event resolution

## 📱 Mobile Companion

The React Native app provides:
- **Character Management**: Stats, inventory, skills
- **Guild Interface**: Bank access, member communication
- **Session Joining**: Room codes for quick campaign access
- **Offline Mode**: View character data without internet

### 📱 Mobile-First Design

Tactical Operator features a responsive, mobile-first interface that adapts to any screen size:

- **Touch-Optimized Controls**: Large, accessible action buttons designed for mobile interaction
- **Full-Screen Gameplay**: Game canvas utilizes the entire viewport on mobile devices
- **Responsive Layout**: UI automatically adapts from mobile (320px) to desktop (1200px+)
- **Gesture Support**: Touch-friendly Three.js tactical view with pinch-zoom and tap controls
- **Collapsible Panels**: Character selection and stats panels slide in from screen edges

#### Mobile Features
- **Top HUD**: Game status and squad information always visible
- **Bottom Action Bar**: Context-sensitive controls (Move, Attack, Defend, etc.)
- **Side Panels**: Character selection and mission stats accessible via panel toggles
- **Responsive Grid**: Action buttons adapt from 4 columns (mobile) to 8 columns (desktop)

#### Testing Mobile Interface
```bash
# Start mobile UI demo
./scripts/demo-mobile-ui.sh

# Or manually test at:
npm run dev
# Navigate to http://localhost:3000/game
# Use browser dev tools device emulation for best mobile experience
```

## 🔧 Configuration

### Environment Variables

**API Server (.env)**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/tactical_operator
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
```

**Web Client (.env)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Database Setup

1. Create a PostgreSQL database
2. Update `DATABASE_URL` in api-server/.env
3. Run migrations: `npm run db:migrate`
4. Seed data: `npm run db:seed`

## 🧪 Testing

### Running Tests
```bash
# All tests
npm test

# Specific test suites
npm run test:api         # API integration tests
npm run test:web         # Frontend component tests
npm run test:mobile      # Mobile app tests

# Watch mode
npm run test:api -- --watch
npm run test:web -- --watch
```

### Test Coverage
- **API**: Integration tests for all endpoints
- **Frontend**: Component and system tests
- **Mobile**: Screen and service tests
- **Shared**: Utility function tests

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

### Environment Setup
1. Set production environment variables
2. Configure SSL certificates
3. Set up database backups
4. Configure monitoring and logging

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow the coding standards in `COPILOT.md`
- Update `TASK.md` when completing features
- Add tests for new functionality
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎖️ Acknowledgments

- Inspired by tactical games like XCOM, Jagged Alliance, and DayZ
- Built with modern web technologies for cross-platform compatibility
- Designed for both casual and hardcore tactical gaming experiences

---

**Built with ❤️ for tactical gaming enthusiasts**


test