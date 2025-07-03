# 🎮 Tactical Operator: Guild Protocol

A tactical top-down multiplayer shooter with RPG mechanics, persistent characters, and guild-based cooperative gameplay.

## 🎯 Overview

Tactical Operator combines tactical combat with persistent character progression and guild-based economics. Players manage squads of soldiers who retain stats, inventory, and experience across campaigns and sessions.

### Key Features

- **✅ WebGL 3D Tactical View**: Three.js-powered top-down tactical combat view
- **✅ Real-time Multiplayer**: Socket.IO integration with room management and live unit movement
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

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL 14+ OR Docker (recommended for database)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/tactical-operator.git
   cd tactical-operator
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

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
   
   **Option A: Concurrent Development (Recommended)**
   ```bash
   # Start both API server and web client together
   npm run dev
   ```
   
   **Option B: Separate Terminals**
   ```bash
   # Terminal 1 - API Server
   npm run dev:api
   
   # Terminal 2 - Web Client  
   npm run dev:web
   ```

This will start:
- Web client on http://localhost:3000
- API server on http://localhost:3001
- Database on localhost:5432 (if using Docker)

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
# Development
npm run dev              # Start all dev servers
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
