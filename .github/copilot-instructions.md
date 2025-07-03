# 🤖 COPILOT.md – Instructions for GitHub Copilot & AI Coding Assistants

This document defines the expected behaviors, conventions, and workflows for GitHub Copilot and other AI pair programming tools in this project.

---

## 🔄 Project Awareness & Context

- **Always read `PLANNING.md`** at the start of a new session. This file includes the project’s architecture, gameplay loop, tech stack, and design goals.
- **Refer to `TASK.md`** before starting work. If the current task is not listed, add a brief summary and date.
- **Respect all naming conventions, file structures, and architectural patterns** described in `PLANNING.md`.
- **Use `.env` files for all environment config**. Load them via `dotenv` (Node)

---

## 🎮 Game Code Structure & Modularity

- **Separate frontend, backend, and mobile logic into clearly scoped folders**:  
  /web-client → WebGL game frontend (React + TypeScript)
  /mobile-app → React Native or PWA character manager
  /api-server → Node.js backend (Express or tRPC)
  /shared → Shared constants, types, interfaces

- **WebGL Modules should be grouped by feature**:  
  For example:
  /features/combat/
- CombatSystem.ts
- CombatUI.tsx
- CombatUtils.ts

- **Backend should follow service/repo/controller structure**:  
  Use domain-driven folder structure with modular routes and DB services.

- **Limit each file to ≤ 500 lines**. If larger, split into helper modules or internal folders.

---

## 🧪 Testing & Reliability

- **Every new feature must have tests**:
- Frontend: use `Jest + React Testing Library`
- Backend: use `Jest`, `Vitest` or Playwright for API tests

- **Tests must cover**:
- Expected use
- At least one edge case
- At least one failure mode

- **Tests should mirror app structure in `/tests/`** or `__tests__/`.

---

## ✅ Task Lifecycle

- **Mark completed tasks in `TASK.md`** immediately after finishing.
- **Add discovered bugs, improvements, or TODOs** to `TASK.md` under **“Discovered During Work”**.

---

## 📎 Style & Conventions

### General

- Use **TypeScript** in frontend and mobile apps.
- Use **TypeScript** in the backend, depending on service.
- Format TypeScript with **Prettier**.

### Type Definitions

- **Use Zod or Pydantic** for schema validation.
- All API endpoints must **validate and sanitize input**.

📚 Documentation & Explainability
Update README.md if you:

Add or remove dependencies

Add features

Change setup instructions or environment usage

Use inline comments to explain non-obvious logic.

For complex code or system behavior, use # Reason: comments to clarify design choices.

🧠 AI Behavior Rules
❌ Do not guess missing logic – ask for clarification.

❌ Never invent libraries or syntax. Use only confirmed and installed dependencies.

✅ Confirm that all referenced files, functions, and modules exist.

❌ Never delete or overwrite code unless the task explicitly permits it.

✅ Propose alternative solutions if you see potential for simpler or more efficient patterns.

🛠 Example File Layout
/project-root
├─ PLANNING.md
├─ TASK.md
├─ COPILOT.md
├─ /web-client
│ ├─ /features/
│ ├─ /components/
│ ├─ main.ts
├─ /api-server
│ ├─ /routes/
│ ├─ /services/
├─ /tests/
├─ .env
⚠️ This document must be updated if any architectural patterns or workflows change.
