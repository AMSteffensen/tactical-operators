import { CombatEngine } from './combat/CombatEngine';
import { StrategicEngine } from './strategic/StrategicEngine';
import { Character } from '@shared/types';
import * as THREE from 'three';

export enum GameMode {
  STRATEGIC = 'strategic',  // RTS world map view
  TACTICAL = 'tactical',    // Turn-based combat
  TRANSITION = 'transition' // Loading between modes
}

export interface Army {
  id: string;
  position: { x: number; z: number };
  squads: Squad[];
  faction: 'player' | 'enemy' | 'neutral';
  movement: {
    speed: number;
    destination?: { x: number; z: number };
    path: { x: number; z: number }[];
    isMoving: boolean;
  };
  supplies: {
    food: number;
    ammunition: number;
    morale: number;
  };
  status: 'active' | 'engaged' | 'retreating' | 'destroyed';
}

export interface Squad {
  id: string;
  name: string;
  units: Character[];
  formation: 'line' | 'column' | 'spread' | 'defensive';
  status: 'healthy' | 'damaged' | 'depleted';
  experience: number;
}

export interface BattleResult {
  victor: 'player' | 'enemy' | 'draw';
  casualties: {
    player: Character[];
    enemy: Character[];
  };
  experience: {
    survivors: Map<string, number>; // characterId -> xp gained
  };
  loot: any[];
  strategicPosition?: { x: number; z: number };
}

export interface StrategicGameState {
  armies: Map<string, Army>;
  resources: {
    player: { food: number; materials: number; fuel: number; };
    enemy: { food: number; materials: number; fuel: number; };
  };
  map: {
    width: number;
    height: number;
    terrain: any[];
    controlPoints: any[];
  };
  gameTime: number; // seconds elapsed
  isPaused: boolean;
}

export class HybridGameManager {
  private currentMode: GameMode = GameMode.STRATEGIC;
  private strategicEngine: StrategicEngine;
  private combatEngine: CombatEngine | null = null;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();
  
  // State management
  private strategicState: StrategicGameState;
  private pendingBattle: { armyA: Army; armyB: Army; position: { x: number; z: number } } | null = null;

  constructor() {
    this.strategicEngine = new StrategicEngine();
    this.strategicState = this.initializeStrategicState();
    this.setupEventHandlers();
  }

  private initializeStrategicState(): StrategicGameState {
    return {
      armies: new Map(),
      resources: {
        player: { food: 1000, materials: 500, fuel: 300 },
        enemy: { food: 800, materials: 400, fuel: 250 }
      },
      map: {
        width: 200,
        height: 200,
        terrain: [],
        controlPoints: []
      },
      gameTime: 0,
      isPaused: false
    };
  }

  private setupEventHandlers() {
    // Strategic engine events
    this.strategicEngine.on('armiesEngaged', (armyA: Army, armyB: Army, position: { x: number; z: number }) => {
      this.initiateCombat(armyA, armyB, position);
    });

    this.strategicEngine.on('resourcesUpdated', (resources: any) => {
      this.strategicState.resources = resources;
      this.emit('strategicStateUpdated', this.strategicState);
    });
  }

  // Public API
  getCurrentMode(): GameMode {
    return this.currentMode;
  }

  getStrategicState(): StrategicGameState {
    return { ...this.strategicState };
  }

  getCombatEngine(): CombatEngine | null {
    return this.combatEngine;
  }

  // Strategic mode operations
  moveArmy(armyId: string, destination: { x: number; z: number }) {
    if (this.currentMode !== GameMode.STRATEGIC) return false;
    
    const army = this.strategicState.armies.get(armyId);
    if (!army || army.status !== 'active') return false;

    return this.strategicEngine.moveArmy(armyId, destination);
  }

  pauseStrategic() {
    this.strategicState.isPaused = true;
    this.strategicEngine.pause();
    this.emit('strategicPaused');
  }

  resumeStrategic() {
    this.strategicState.isPaused = false;
    this.strategicEngine.resume();
    this.emit('strategicResumed');
  }

  // Combat transition
  private async initiateCombat(armyA: Army, armyB: Army, position: { x: number; z: number }) {
    console.log(`🔥 Combat initiated between ${armyA.id} and ${armyB.id} at (${position.x}, ${position.z})`);
    
    this.currentMode = GameMode.TRANSITION;
    this.pendingBattle = { armyA, armyB, position };
    
    // Pause strategic gameplay
    this.strategicEngine.pause();
    
    // Mark armies as engaged
    armyA.status = 'engaged';
    armyB.status = 'engaged';
    
    this.emit('combatInitiated', { armyA, armyB, position });
    
    // Create tactical battlefield
    await this.createTacticalBattle(armyA, armyB, position);
  }

  private async createTacticalBattle(armyA: Army, armyB: Army, _position: { x: number; z: number }) {
    // Create new combat engine for tactical battle
    this.combatEngine = new CombatEngine(`strategic_${armyA.id}_vs_${armyB.id}`);
    
    // Setup combat event handlers
    this.combatEngine.on('combatEnded', (result: string, combatState: any) => {
      this.resolveCombat(result, combatState);
    });

    // Deploy squads to tactical battlefield
    this.deploySquadsToTactical(armyA, 'player');
    this.deploySquadsToTactical(armyB, 'enemy');

    // Transition to tactical mode
    this.currentMode = GameMode.TACTICAL;
    this.emit('modeChanged', GameMode.TACTICAL);
    this.emit('tacticalBattleReady', this.combatEngine);
    
    // Start tactical combat
    setTimeout(() => {
      this.combatEngine?.startCombat();
    }, 1000);
  }

  private deploySquadsToTactical(army: Army, faction: 'player' | 'enemy') {
    if (!this.combatEngine) return;

    army.squads.forEach((squad, squadIndex) => {
      squad.units.forEach((unit, unitIndex) => {
        // Calculate deployment position based on faction
        const baseX = faction === 'player' ? -6 : 6;
        const position = new THREE.Vector3(
          baseX + squadIndex * 2,
          0,
          -3 + unitIndex * 1.5
        );

        this.combatEngine!.addUnit(unit, position, faction);
      });
    });
  }

  private resolveCombat(result: string, combatState: any) {
    if (!this.pendingBattle) return;

    console.log(`⚔️ Combat resolved: ${result}`);
    
    const battleResult: BattleResult = this.calculateBattleResult(result, combatState);
    
    // Apply results to strategic layer
    this.applyBattleResults(battleResult);
    
    // Transition back to strategic
    this.transitionToStrategic();
    
    this.emit('combatResolved', battleResult);
  }

  private calculateBattleResult(result: string, combatState: any): BattleResult {
    const casualties = combatState.units.filter((u: any) => u.status === 'dead');
    
    return {
      victor: result as 'player' | 'enemy' | 'draw',
      casualties: {
        player: casualties.filter((u: any) => u.faction === 'player'),
        enemy: casualties.filter((u: any) => u.faction === 'enemy')
      },
      experience: {
        survivors: new Map() // TODO: Calculate XP for survivors
      },
      loot: [], // TODO: Calculate loot
      strategicPosition: this.pendingBattle?.position
    };
  }

  private applyBattleResults(result: BattleResult) {
    if (!this.pendingBattle) return;

    const { armyA, armyB } = this.pendingBattle;
    
    // Update army status based on battle outcome
    if (result.victor === 'player') {
      if (armyA.faction === 'player') {
        armyA.status = 'active';
        armyB.status = 'destroyed';
      } else {
        armyB.status = 'active';
        armyA.status = 'destroyed';
      }
    } else if (result.victor === 'enemy') {
      if (armyA.faction === 'enemy') {
        armyA.status = 'active';
        armyB.status = 'destroyed';
      } else {
        armyB.status = 'active';
        armyA.status = 'destroyed';
      }
    } else {
      // Draw - both armies retreat
      armyA.status = 'retreating';
      armyB.status = 'retreating';
    }

    // Remove casualties from squads
    this.applyCasualties(armyA, result.casualties.player);
    this.applyCasualties(armyB, result.casualties.enemy);
    
    // Remove destroyed armies
    if (armyA.status === 'destroyed') {
      this.strategicState.armies.delete(armyA.id);
    }
    if (armyB.status === 'destroyed') {
      this.strategicState.armies.delete(armyB.id);
    }
  }

  private applyCasualties(army: Army, casualties: Character[]) {
    const casualtyIds = new Set(casualties.map(c => c.id));
    
    army.squads.forEach(squad => {
      squad.units = squad.units.filter(unit => !casualtyIds.has(unit.id));
      
      // Update squad status based on remaining units
      if (squad.units.length === 0) {
        squad.status = 'depleted';
      } else if (squad.units.length <= 2) {
        squad.status = 'damaged';
      }
    });
    
    // Remove depleted squads
    army.squads = army.squads.filter(squad => squad.status !== 'depleted');
  }

  private transitionToStrategic() {
    this.currentMode = GameMode.TRANSITION;
    
    // Cleanup combat engine
    this.combatEngine = null;
    this.pendingBattle = null;
    
    // Resume strategic gameplay
    this.strategicEngine.resume();
    
    // Switch to strategic mode
    this.currentMode = GameMode.STRATEGIC;
    this.emit('modeChanged', GameMode.STRATEGIC);
    this.emit('strategicResumed');
  }

  // Army management
  createArmy(squads: Squad[], position: { x: number; z: number }, faction: 'player' | 'enemy'): string {
    const armyId = `army_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const army: Army = {
      id: armyId,
      position,
      squads,
      faction,
      movement: {
        speed: 5, // units per second
        isMoving: false,
        path: []
      },
      supplies: {
        food: 100,
        ammunition: 100,
        morale: 100
      },
      status: 'active'
    };

    this.strategicState.armies.set(armyId, army);
    this.strategicEngine.addArmy(army);
    
    this.emit('armyCreated', army);
    return armyId;
  }

  // Event system
  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  private emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in hybrid game event listener for ${event}:`, error);
        }
      });
    }
  }

  // Lifecycle
  start() {
    this.strategicEngine.start();
    this.emit('gameStarted');
  }

  stop() {
    this.strategicEngine.stop();
    this.combatEngine = null;
    this.emit('gameStopped');
  }
}
