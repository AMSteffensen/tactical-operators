import * as THREE from 'three';
import { Army } from '../HybridGameManager';

export interface StrategicGameState {
  armies: Map<string, Army>;
  gameTime: number;
  isPaused: boolean;
  resources: {
    player: { food: number; materials: number; fuel: number; };
    enemy: { food: number; materials: number; fuel: number; };
  };
}

export class StrategicEngine {
  private gameState: StrategicGameState;
  private gameLoop: number | null = null;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();
  private lastUpdateTime: number = 0;
  
  // RTS settings
  private readonly GAME_SPEED = 1; // 1x speed
  private readonly UPDATE_FREQUENCY = 60; // 60 FPS
  private readonly ENCOUNTER_DISTANCE = 3; // Distance for armies to engage

  constructor() {
    this.gameState = {
      armies: new Map(),
      gameTime: 0,
      isPaused: false,
      resources: {
        player: { food: 1000, materials: 500, fuel: 300 },
        enemy: { food: 800, materials: 400, fuel: 250 }
      }
    };
  }

  // Lifecycle methods
  start() {
    if (this.gameLoop) return;
    
    this.lastUpdateTime = performance.now();
    this.gameLoop = setInterval(() => {
      this.update();
    }, 1000 / this.UPDATE_FREQUENCY) as unknown as number;
    
    console.log('🎮 Strategic Engine started');
    this.emit('engineStarted');
  }

  stop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    
    console.log('⏸️ Strategic Engine stopped');
    this.emit('engineStopped');
  }

  pause() {
    this.gameState.isPaused = true;
    this.emit('enginePaused');
  }

  resume() {
    this.gameState.isPaused = false;
    this.lastUpdateTime = performance.now(); // Reset timer to prevent large delta
    this.emit('engineResumed');
  }

  // Main game loop
  private update() {
    if (this.gameState.isPaused) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = currentTime;

    // Update game time
    this.gameState.gameTime += deltaTime * this.GAME_SPEED;

    // Update all game systems
    this.updateArmyMovement(deltaTime);
    this.checkEncounters();
    this.updateResources(deltaTime);
    this.updateSupplies(deltaTime);

    // Emit state update
    this.emit('stateUpdated', this.gameState);
  }

  // Army movement system
  private updateArmyMovement(deltaTime: number) {
    for (const [, army] of this.gameState.armies) {
      if (army.status !== 'active' || !army.movement.isMoving) continue;

      this.moveArmyTowardsDestination(army, deltaTime);
    }
  }

  private moveArmyTowardsDestination(army: Army, deltaTime: number) {
    if (!army.movement.destination) {
      army.movement.isMoving = false;
      return;
    }

    const currentPos = new THREE.Vector2(army.position.x, army.position.z);
    const targetPos = new THREE.Vector2(army.movement.destination.x, army.movement.destination.z);
    const distance = currentPos.distanceTo(targetPos);

    // Check if we've reached the destination
    if (distance < 0.5) {
      army.position.x = army.movement.destination.x;
      army.position.z = army.movement.destination.z;
      army.movement.destination = undefined;
      army.movement.isMoving = false;
      army.movement.path = [];
      
      this.emit('armyReachedDestination', army);
      return;
    }

    // Move towards destination
    const direction = targetPos.clone().sub(currentPos).normalize();
    const moveDistance = army.movement.speed * deltaTime;
    
    army.position.x += direction.x * moveDistance;
    army.position.z += direction.y * moveDistance;
    
    this.emit('armyMoved', army);
  }

  // Combat encounter detection
  private checkEncounters() {
    const armies = Array.from(this.gameState.armies.values());
    
    for (let i = 0; i < armies.length; i++) {
      for (let j = i + 1; j < armies.length; j++) {
        const armyA = armies[i];
        const armyB = armies[j];
        
        // Only check active armies from different factions
        if (armyA.status !== 'active' || armyB.status !== 'active') continue;
        if (armyA.faction === armyB.faction) continue;

        if (this.armiesInContact(armyA, armyB)) {
          const encounterPosition = {
            x: (armyA.position.x + armyB.position.x) / 2,
            z: (armyA.position.z + armyB.position.z) / 2
          };
          
          console.log(`⚔️ Armies ${armyA.id} and ${armyB.id} engaged at (${encounterPosition.x.toFixed(1)}, ${encounterPosition.z.toFixed(1)})`);
          
          this.emit('armiesEngaged', armyA, armyB, encounterPosition);
          return; // Only handle one encounter per frame
        }
      }
    }
  }

  private armiesInContact(armyA: Army, armyB: Army): boolean {
    const posA = new THREE.Vector2(armyA.position.x, armyA.position.z);
    const posB = new THREE.Vector2(armyB.position.x, armyB.position.z);
    
    return posA.distanceTo(posB) <= this.ENCOUNTER_DISTANCE;
  }

  // Resource management
  private updateResources(deltaTime: number) {
    // Generate resources over time
    const resourceRate = deltaTime; // Resources per second
    
    this.gameState.resources.player.food += resourceRate * 0.5;
    this.gameState.resources.player.materials += resourceRate * 0.3;
    this.gameState.resources.player.fuel += resourceRate * 0.2;
    
    this.gameState.resources.enemy.food += resourceRate * 0.4;
    this.gameState.resources.enemy.materials += resourceRate * 0.25;
    this.gameState.resources.enemy.fuel += resourceRate * 0.15;
    
    this.emit('resourcesUpdated', this.gameState.resources);
  }

  // Supply management
  private updateSupplies(deltaTime: number) {
    for (const [, army] of this.gameState.armies) {
      if (army.status !== 'active') continue;

      // Consume supplies over time
      const supplyRate = deltaTime * 0.1; // Supply consumption per second
      
      army.supplies.food = Math.max(0, army.supplies.food - supplyRate);
      army.supplies.ammunition = Math.max(0, army.supplies.ammunition - supplyRate * 0.5);
      
      // Morale decreases if low on food
      if (army.supplies.food < 20) {
        army.supplies.morale = Math.max(0, army.supplies.morale - supplyRate * 2);
      } else {
        army.supplies.morale = Math.min(100, army.supplies.morale + supplyRate * 0.5);
      }
      
      // If army runs out of supplies, it becomes less effective
      if (army.supplies.food <= 0 || army.supplies.morale <= 10) {
        army.movement.speed *= 0.5; // Move slower when demoralized
      }
    }
  }

  // Public API methods
  addArmy(army: Army) {
    this.gameState.armies.set(army.id, army);
    this.emit('armyAdded', army);
  }

  removeArmy(armyId: string) {
    const army = this.gameState.armies.get(armyId);
    if (army) {
      this.gameState.armies.delete(armyId);
      this.emit('armyRemoved', army);
    }
  }

  moveArmy(armyId: string, destination: { x: number; z: number }): boolean {
    const army = this.gameState.armies.get(armyId);
    if (!army || army.status !== 'active') return false;

    // Set movement destination
    army.movement.destination = destination;
    army.movement.isMoving = true;
    
    // Calculate simple path (direct line for now)
    army.movement.path = [destination];
    
    console.log(`📍 Army ${armyId} moving to (${destination.x}, ${destination.z})`);
    this.emit('armyOrderedToMove', army, destination);
    
    return true;
  }

  getGameState(): StrategicGameState {
    return { ...this.gameState };
  }

  getArmy(armyId: string): Army | undefined {
    return this.gameState.armies.get(armyId);
  }

  getAllArmies(): Army[] {
    return Array.from(this.gameState.armies.values());
  }

  // Army management
  setArmyDestination(armyId: string, destination: { x: number; z: number }) {
    return this.moveArmy(armyId, destination);
  }

  stopArmy(armyId: string) {
    const army = this.gameState.armies.get(armyId);
    if (army) {
      army.movement.isMoving = false;
      army.movement.destination = undefined;
      army.movement.path = [];
      this.emit('armyStopped', army);
    }
  }

  // Resource management
  spendResources(faction: 'player' | 'enemy', cost: { food?: number; materials?: number; fuel?: number }): boolean {
    const resources = this.gameState.resources[faction];
    
    // Check if we can afford it
    if ((cost.food || 0) > resources.food || 
        (cost.materials || 0) > resources.materials || 
        (cost.fuel || 0) > resources.fuel) {
      return false;
    }
    
    // Spend the resources
    resources.food -= cost.food || 0;
    resources.materials -= cost.materials || 0;
    resources.fuel -= cost.fuel || 0;
    
    this.emit('resourcesSpent', faction, cost);
    return true;
  }

  addResources(faction: 'player' | 'enemy', amount: { food?: number; materials?: number; fuel?: number }) {
    const resources = this.gameState.resources[faction];
    
    resources.food += amount.food || 0;
    resources.materials += amount.materials || 0;
    resources.fuel += amount.fuel || 0;
    
    this.emit('resourcesAdded', faction, amount);
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
          console.error(`Error in strategic engine event listener for ${event}:`, error);
        }
      });
    }
  }
}
