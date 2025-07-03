## FEATURE:

Persistent Tactical Character System

This feature allows each player to manage a persistent character (soldier/operator) across campaigns and sessions. The character retains stats, inventory, economy, and progression data whether playing solo, in a guild, or across different playgroups. The system supports both digital-only and hybrid tabletop gameplay.

## EXAMPLES:

* `examples/char_creation.ts`: Defines TypeScript interfaces and character creation logic (class, stats, inventory slots)
* `examples/economy_manager.ts`: Shows how character economy interacts with team/guild banks
* `examples/progression_tracker.ts`: Demonstrates how to calculate XP, injuries, and gear durability across sessions
* `examples/sync_mobile.ts`: Example of how the React Native mobile app syncs character state via API to the backend

## DOCUMENTATION:

* [https://docs.expo.dev/](https://docs.expo.dev/) for React Native app integration
* [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/) for database schema planning
* [https://pixijs.com/](https://pixijs.com/) or [https://playcanvas.com/](https://playcanvas.com/) for frontend rendering logic
* [https://next-auth.js.org/](https://next-auth.js.org/) or Supabase docs for user authentication

## OTHER CONSIDERATIONS:

* Ensure characters are stored securely with encrypted fields for sensitive data (e.g., in-game wallet)
* Allow characters to be soft-locked or tagged inactive when switching between campaigns to avoid state conflicts
* AI assistants may forget about unique character states between room sessions—ensure strong backend validation for campaign syncing
* Implement rollback/versioning for player state in case of connection loss or session crashes
* Consider how death/permadeath works across campaigns and whether to allow resurrection mechanics, backups, or insurance sys
