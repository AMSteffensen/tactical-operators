# Character Selection Screen - Single Character Gameplay

## Current Task
Create a character selection screen for mobile and desktop where users select ONE character before joining the game. Remove multi-character selection and switching abilities.

## Requirements
1. **Single Character Selection Screen**
   - Mobile and desktop responsive UI
   - Select one character from available characters
   - Character preview with stats
   - "Play" button to enter game with selected character

2. **Remove Multi-Character Features**
   - Remove ability to select multiple characters (4-character squads)
   - Remove character switching during gameplay (clicking units to switch control)
   - Single character per game session

3. **Updated Game Flow**
   - Character Selection Screen → Single Character Deployment → Single Character Gameplay
   - No squad selection, no character switching
   - Focus on single character real-time movement and combat

## Implementation Plan
- [x] Create CharacterSelectionScreen component
- [x] Remove multi-character selection logic from existing components
- [x] Update TacticalView to disable character switching
- [x] Remove "Click other player units to switch control" functionality
- [x] Update game state management for single character
- [x] **Combat System - COMPLETED**
  - [x] Implement shooting mechanics (left-click to aim/shoot)
  - [x] Add aiming system with crosshair/targeting
  - [x] Implement damage system for weapons
  - [x] Add health bars and damage feedback
  - [x] Create weapon system (different guns, damage, range)
  - [x] Combat system integration with TacticalRenderer
  - [x] Fix all TypeScript compilation errors
- [ ] **Next Steps**
  - [ ] Add enemy AI with health and damage
  - [ ] Add visual combat feedback (muzzle flashes, bullet tracers)
  - [ ] Add audio system (gunshot sounds, damage feedback)
  - [ ] Mobile touch controls for aiming and shooting
  - [ ] Test combat system end-to-end
- [ ] Test on mobile and desktop  