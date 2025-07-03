# 📘 PLANNING.md – Project Architecture, Goals & Conventions

This document serves as the single source of truth for the project's vision, architecture, structure, and conventions. All contributors (human or AI) must refer to this file before writing or modifying any code.

---

## 🎯 PROJECT GOAL

Develop a **top-down multiplayer shooter** in WebGL using **React + TypeScript**, featuring:

* **Persistent maps** where player actions affect the world long-term (e.g. fortifications, dropped gear).
* **RPG mechanics**: Players control a squad of soldiers who level up, gain skills, and carry gear.
* **Guild system**: Shared guild banks, economic cooperation, and squad-level tactics.
* **Solo play viable**, but cooperative (guild/team) play is rewarded.
* **Backend persistence** for player, guild, and world state.

---

## 🧱 TECH STACK

| Layer      | Tech / Framework                                     |
| ---------- | ---------------------------------------------------- |
| Frontend   | React + TypeScript + WebGL (via Pixi.js or Three.js) |
| State Mgmt | Zustand or Redux Toolkit                             |
| Backend    | Node.js (Express) or FastAPI (Python)                |
| DB         | PostgreSQL + Prisma ORM                              |
| Auth       | JWT + Bcrypt (Auth API)                              |
| Realtime   | Socket.IO or WebSocket API (Node or FastAPI)         |
| Dev Tools  | ESLint, Prettier, Vitest / Jest                      |
| Deployment | Docker + VPS (Hostinger or Fly.io)                   |

---

## 🧠 GAME SYSTEMS OVERVIEW

### 🗺️ Persistent Map

* Chunked world data stored in DB.
* Events (e.g., destroyed turret) persist across logins and affect future players.
* Requires backend "world sync" system.

### 🎖️ Player System

* Players manage a squad (1–4 soldiers).
* Soldiers level up and persist across sessions.
* Inventory, stats, wounds, traits, and fatigue tracked in DB.

### ⚔️ Combat System

* Real-time with pause-like tactical options in solo.
* Multiplayer uses strict server-side validation for shooting, hits, actions.
* Aiming and line of sight must be handled visually and logically.

### 🛡️ Guilds

* Guilds have shared storage (e.g., weapons, fuel, currency).
* Guild economy and permissions (officers, members, etc.)
* Optional guild missions or quests.

---

## 📁 FILE STRUCTURE

```txt
/project-root
├─ PLANNING.md
├─ TASK.md
├─ COPILOT.md
├─ README.md
├─ /web-client
│   ├─ /features
│   ├─ /components
│   ├─ /systems       ← game logic systems (combat, movement, AI)
│   ├─ /state         ← Zustand/Redux stores
│   ├─ /assets        ← sprites, maps, SFX
│   └─ main.tsx
├─ /api-server
│   ├─ /routes
│   ├─ /services
│   ├─ /models        ← Prisma/SQLAlchemy schemas
│   ├─ /controllers
│   ├─ /sockets       ← WebSocket logic
│   └─ app.ts
├─ /shared
│   ├─ /types         ← shared interfaces/enums
│   └─ /utils
├─ /tests
│   ├─ /api-server
│   └─ /web-client
```

📦 MODULE DESIGN CONVENTIONS
Frontend Game Features
Each game system should be split into:

SystemNameSystem.ts (logic/loop)

SystemNameUI.tsx (interface elements)

SystemNameUtils.ts (shared logic)

Example: /features/combat/

CombatSystem.ts

CombatUI.tsx

CombatUtils.ts

# Backend Features
Each backend service follows:

/routes/combat.ts
/services/combatService.ts
/models/combatModel.ts
/tests/combat.test.ts
Use PostgreSQL via Prisma or SQLAlchemy for all persistence.

# API STRUCTURE
REST endpoints grouped by domain:

/api/player/
/api/guild/
/api/world/
/api/combat/
Real-time gameplay sync via /ws.


🎨 DESIGN + UX GOALS
Grid-based world (e.g. 64x64 tiles).

Pixelart or minimalist art style.

Mobile-first for menus and squad management.

Desktop-first for full WebGL tactical view.



# DESIGN PRINCIPLES
- Persistence First: Player and world state must persist and load reliably.

- Modular by Feature: Code is grouped by domain, not by file type.

- Solo or Squad: Support different playstyles.

- Readable & Refactorable: No mega-files. Code must be understandable by a mid-level dev.

- Build to Scale: Systems should anticipate multiplayer and future economy complexity.


# NAMING CONVENTIONS
Type	Convention	Example
Variables	camelCase	playerHealth
Constants	UPPER_SNAKE_CASE	MAX_PARTY_SIZE
Interfaces	PascalCase + I	ICombatAction
Components	PascalCase	CombatHUD.tsx
Files/Folders	kebab-case or camelCase	combat-utils.ts, guildSystem


📚 SOURCES / REFERENCES
Gameplay Inspiration: Jagged Alliance, X-COM, DayZ, RimWorld

Tech Reference:

Zustand docs: https://docs.pmnd.rs/zustand

Pixi.js: https://pixijs.com/

Prisma ORM: https://www.prisma.io/

FastAPI: https://fastapi.tiangolo.com/

Three.js: https://threejs.org/


🚨 GOTCHAS / AI REMINDERS
Never assume default imports — always check file existence.

Don’t overwrite logic outside the current task scope.

Keep game systems independent — no circular dependencies between UI and logic.

Game loops must be deterministic for server-side validation.

Socket events must be rate-limited and validated server-side.

Always load .env and handle missing vars gracefully.