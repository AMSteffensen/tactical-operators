# 🎮 Hybrid RTS + Turn-Based Combat System

## Game Flow Design

### Strategic Layer (RTS)
```
World Map View (Real-Time)
├── Army Movement (continuous)
├── Resource Management
├── Base Building  
├── Unit Production
└── When armies meet → Tactical Combat
```

### Tactical Layer (Turn-Based)
```
Combat Encounter (Paused Time)
├── Deploy squads on battlefield
├── Turn-based tactical combat
├── Individual unit actions
├── Environmental tactics
└── Victory → Return to Strategic
```

## Implementation Plan

### Phase 1: Strategic Mode Foundation
1. **World Map System**: Large-scale RTS camera and movement
2. **Army Groups**: Multiple squads moving as formations
3. **Real-Time Movement**: Continuous pathfinding and positioning
4. **Encounter Detection**: When enemy armies meet

### Phase 2: Mode Transition
1. **Combat Initiation**: Detect when armies engage
2. **Battlefield Generation**: Create tactical map from strategic position
3. **Unit Deployment**: Deploy strategic units into tactical formation
4. **Mode Switching**: Seamless transition between views

### Phase 3: Return Integration
1. **Battle Resolution**: Apply tactical results to strategic units
2. **Casualties & XP**: Update army composition based on battle
3. **Strategic Continuation**: Resume real-time gameplay
4. **Campaign Progression**: Long-term consequences of battles

## Technical Architecture

### Game Mode Manager
```typescript
enum GameMode {
  STRATEGIC = 'strategic',  // RTS world map
  TACTICAL = 'tactical',    // Turn-based combat
  TRANSITION = 'transition' // Loading between modes
}

class HybridGameManager {
  currentMode: GameMode = GameMode.STRATEGIC;
  strategicState: StrategicGameState;
  tacticalState: TacticalGameState;
  
  initiateCombat(armyA: Army, armyB: Army) {
    this.transitionToTactical(armyA, armyB);
  }
  
  resolveCombat(result: BattleResult) {
    this.applyResultsToStrategic(result);
    this.transitionToStrategic();
  }
}
```

### Strategic Game Engine
```typescript
class StrategicEngine {
  private armies: Map<string, Army>;
  private gameLoop: number;
  
  start() {
    this.gameLoop = setInterval(() => {
      this.updateArmyMovement();
      this.checkEncounters();
      this.updateResources();
      this.emit('strategicUpdate');
    }, 16); // 60 FPS
  }
  
  checkEncounters() {
    for (const [id1, army1] of this.armies) {
      for (const [id2, army2] of this.armies) {
        if (this.armiesInContact(army1, army2)) {
          this.initiateCombat(army1, army2);
        }
      }
    }
  }
}
```

### Army System
```typescript
interface Army {
  id: string;
  position: { x: number; z: number };
  squads: Squad[];
  faction: 'player' | 'enemy' | 'neutral';
  movement: {
    speed: number;
    destination?: { x: number; z: number };
    path: { x: number; z: number }[];
  };
  supplies: {
    food: number;
    ammunition: number;
    morale: number;
  };
}

interface Squad {
  id: string;
  units: Character[];
  formation: Formation;
  status: 'healthy' | 'damaged' | 'depleted';
}
```

## Benefits of This Approach

### 🎯 Best of Both Worlds
- **Strategic Depth**: Large-scale planning and resource management
- **Tactical Detail**: Individual soldier actions and character progression
- **Seamless Flow**: Natural transition between scales
- **Replayability**: Different strategic approaches, tactical outcomes

### 🔧 Technical Advantages
- **Reuse Existing Systems**: Both RTS and turn-based engines already built
- **Modular Design**: Each mode can be developed and balanced independently
- **Performance**: Only render active mode (strategic OR tactical)
- **Scalability**: Support for massive campaigns with detailed battles

### 🎮 Gameplay Innovation
- **Strategic Consequences**: Tactical losses affect strategic capabilities
- **Terrain Matters**: Strategic position influences tactical battlefield
- **Character Continuity**: Same soldiers across strategic and tactical
- **Multiple Engagement Types**: Raids, sieges, pitched battles, ambushes
