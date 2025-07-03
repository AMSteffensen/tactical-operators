# 📋 TASK.md – Project Task List

This file tracks all tasks, features, and development work. Always check here before starting new work and update it when tasks are completed or discovered.

---

## ✅ Completed Tasks

* [x] **Project Structure Setup** - Created complete folder structure with all necessary directories
* [x] **Package Configuration** - Set up package.json files for all modules (web-client, api-server, mobile-app, shared)
* [x] **TypeScript Configuration** - Created tsconfig.json files with proper module resolution and path mapping
* [x] **Build System Setup** - Configured Vite for web client, Node.js build for API server
* [x] **Shared Types & Constants** - Created comprehensive type definitions and game constants in shared package
* [x] **API Server Foundation** - Set up Express server with middleware, routes, and Socket.IO integration
* [x] **Database Schema** - Created Prisma schema with User, Character, Guild, Campaign, and Session models
* [x] **Web Client Foundation** - Set up React app with routing, context, and component structure
* [x] **Development Tooling** - Configured ESLint, Prettier, and environment files
* [x] **Documentation** - Created comprehensive README.md and example files
* [x] **Git Configuration** - Set up .gitignore with appropriate exclusions for all platforms
* [x] **Docker Setup** - Created Docker Compose files for database and full development environment
* [x] **Environment Configuration** - Set up .env files with Docker database configuration
* [x] **Database Migration** - Successfully tested database setup and migrations with Prisma
* [x] **Build Testing** - Verified that shared package and API server build successfully
* [x] **Development Scripts** - Added npm scripts for Docker management and development workflow
* [x] **Port Configuration** - Fixed port conflicts by moving API server from 5000 to 3001
* [x] **Module System Fix** - Resolved CommonJS/ES Module conflicts between packages
* [x] **Concurrent Development** - Set up concurrent script to run API and web client together
* [x] **Development Tools** - Created status check script and enhanced development workflow
* [x] **Runtime Testing** - Verified API server starts on port 3001 and web client on port 3000

---

## 🔨 Active Tasks

### 🏃‍♂️ Immediate Priority (Next Development Session)

* [ ] **WebGL Basic Setup** - Implement Three.js or Babylon.js for top-down tactical view
* [ ] **Real-time Communication** - Test and enhance Socket.IO integration between client/server
* [ ] **Character System MVP** - Create basic character creation and display in web client
* [ ] **Database Integration** - Connect frontend forms to backend APIs for character persistence

### 🧱 Core Systems

* [ ] Build basic WebGL rendering in React (top-down camera, map rendering)
* [ ] Create player squad management interface
* [ ] Implement persistent player state in backend (DB + API)
* [ ] Create soldier leveling and inventory system
* [ ] Implement basic combat loop logic (turn-based or real-time to be defined)
* [ ] Develop guild system with shared economy and permissions
* [ ] Build frontend state management (Zustand or Redux)

### 🕹 Game Modes

* [ ] Add campaign mode with saved progress per group
* [ ] Support solo, co-op (2–4 players), and AI enemies
* [ ] Support offline/local-only play with NPCs
* [ ] Add character sync across rooms/groups (same state, new game)

### 📱 Hybrid Tabletop System

* [ ] React Native app: Player inventory + economy dashboard
* [ ] Room joining system (like Kahoot) with real-time state sync
* [ ] Roll-out mat / board + phone = hybrid play design
* [ ] Per-round randomness handled digitally, played out physically

### 🌐 Backend / API

* [ ] Player API: create, update, fetch character/squad
* [ ] Guild API: create, update, invite/join, bank management
* [ ] Match/Room API: create room, join, sync state
* [ ] Campaign persistence per player and group
* [ ] WebSocket or Socket.IO room sync system

---

## 🔍 Discovered During Work

### Port & Configuration Issues (RESOLVED ✅)
- **Issue**: macOS Control Center uses port 5000, causing API server startup conflicts
- **Solution**: Changed API server to port 3001, updated all references in configs
- **Files Updated**: `.env`, `vite.config.ts`, `docker-compose.yml`, documentation

### Module System Resolution (RESOLVED ✅)  
- **Issue**: ES Module/CommonJS conflicts between shared package and API server
- **Solution**: Converted all packages to CommonJS, removed `"type": "module"` declarations
- **Tools Added**: `tsconfig-paths` for runtime path resolution

### Development Workflow Improvements
- **Added**: Concurrent development scripts with colored output
- **Added**: Status check script to verify environment health
- **Added**: Enhanced package.json scripts for better DX

### Next Session Notes
- API server successfully starts on port 3001
- Web client successfully starts on port 3000  
- Database container runs on port 5432
- Both can be started with `npm run dev` or separately in different terminals
- All builds are working (shared, api-server, web-client)

---

## 📅 Planning

* Update `TASK.md` after each completed or started task
* Add newly discovered tasks under “Discovered During Work”
* Reflect dependencies (e.g. guilds depend on player system)
* Discuss major changes in `PLANNING.md` before implementation
