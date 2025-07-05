# 📄 Preliminary Requirements Plan (PRP)

**Project Title:** *Tactical Operator: Guild Protocol* (placeholder name)
**Genre:** Tactical Top-Down Shooter with RPG & Strategy Elements
**Platform:** WebGL (desktop & mobile), optional physical tabletop elements
**Tech Stack:** TypeScript, WebGL, React Native (for mobile), Node.js backend with a database (PostgreSQL or SQLite)

---

## 🎯 1. Project Goals

* Create a **tactical shooter game** that combines **team-based planning**, **RPG progression**, and **persistent strategy elements**.
* Support both **digital-only gameplay** and **physical board/tabletop hybrid play** using smartphones for character data and random events.
* Provide **deep economic and tactical gameplay**, allowing both **solo and guild playstyles**.
* Focus on **campaign-based progression** across multiple playgroups and sessions.

---

## 🧩 2. Core Features

### Gameplay

* Team-based planning rounds (turn-based strategy or timed execution)
* Tactical map control (objectives, capture points)
* Combat resolution using probability/dice-like mechanics
* Persistent soldier characters (XP, inventory, health, economy)
* Campaign modes:

  * PvE (vs. AI team)
  * PvP (future)
  * Solo / Co-op
  * Ongoing campaigns with scorekeeping

### Character System

* Persistent across campaigns
* Inventory and economy management
* Leveling, skills, and status effects
* Character deaths and gear loss in hardcore modes

### Economy

* Player and team-based currency
* Gear upgrades, loadouts, and tactical purchases
* Guild banks and shared team economies
* Strategic gear allocation per session

### Campaign System

* Each room is a unique campaign
* Campaign maps stored server-side
* Players can return and resume progress
* Multiple campaign support per player
* Sessions contribute to long-term campaign goals

### Social / Multiplayer Layer

* Room-based lobbies (like Kahoot or Jackbox)
* Device-based characters (React Native app or PWA)
* Vote-based team leadership and tactical decisions
* Guild formation and management

### Optional Physical Board Integration

* Use app for random events, fog of war, damage resolution
* Players place physical tokens on a printed or reusable mat
* Shared room code for campaign sync

---

## 🏗 3. Technical Requirements

### Frontend (WebGL)

* TypeScript + PixiJS/Three.js or PlayCanvas
* React for web UI layer
* Scene management, camera control, basic physics

### Mobile Companion App

* React Native app (or responsive PWA)
* Character manager: loadouts, stats, gear
* Session room join and result sync

### Backend

* Node.js + Express or tRPC
* PostgreSQL or SQLite DB
* REST/GraphQL API for:

  * Player auth
  * Character management
  * Campaign data
  * Combat session updates

### Infrastructure

* Authentication with Supabase/Auth0 or custom JWT
* Host backend on VPS or cloud (Render, Vercel, Railway)
* DevOps: GitHub, Docker (optional), CI/CD pipeline

---

## 🗺 4. Development Roadmap

### Phase 1: Prototype (0–3 months)

* Character creation & persistence
* Campaign room system
* Basic map and action system (planning → resolution)
* Dice-based combat logic
* Mobile app for joining sessions & character tracking

### Phase 2: Core Gameplay (3–6 months)

* Full character economy, gear, and leveling
* AI team opponent
* Campaign persistence and save/load
* Victory conditions, score tracking
* Guild system (basic)

### Phase 3: Physical Integration (6–9 months)

* Phone-camera-assisted tabletop mode (optional)
* Printed map/playmat designs
* Fog of war / random event generation

### Phase 4: Expansion (9–12+ months)

* Full PvP multiplayer option
* Advanced guild management
* Server-based dynamic campaigns
* Cosmetic customization
* Monetization (skins, cosmetics, expansions)

---

## 📌 5. Risks & Considerations

| Risk                             | Mitigation                                             |
| -------------------------------- | ------------------------------------------------------ |
| Scope creep                      | Prioritize core loop; expand gradually                 |
| Backend complexity               | Start with simple REST/tRPC, modularize early          |
| Physical-digital integration     | Optional; treat as stretch goal                        |
| Balancing tactical vs. RPG depth | Playtest early; offer both casual & hardcore options   |
| Multiplayer stability            | Delay until core gameplay and campaign loop are stable |

---

## 🔑 6. Unique Selling Points (USP)

* **Persistent tactical squads** like a mix of XCOM + Football Manager
* **Strategic and economic layers** rarely seen in shooters
* **Hybrid tabletop-digital experience**
* **Accessible for solo or casual teams**, with optional hardcore modes
* **Replayable campaign structure** with guild and character continuity

