import * as THREE from 'three';
import { 
  CombatState, 
  CombatUnit, 
  CombatAction, 
  Character
} from '@shared/types';
import { 
  COMBAT_CONFIG, 
  CLASS_COMBAT_MODIFIERS 
} from '@shared/constants';

export class CombatEngine {
  private combatState: CombatState;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  constructor(campaignId?: string) {
    this.combatState = this.initializeCombatState(campaignId);
  }

  private initializeCombatState(campaignId?: string): CombatState {
    return {
      combatId: `combat_${Date.now()}`,
      campaignId,
      status: 'setup',
      currentTurn: {
        turnNumber: 1,
        phase: 'movement',
        activeUnitId: '',
        remainingActionPoints: 0,
        actionsThisTurn: [],
        turnStartTime: new Date(),
        timeLimit: COMBAT_CONFIG.TURN_TIME_LIMIT
      },
      units: [],
      turnOrder: [],
      battlefield: {
        width: 20,
        height: 20,
        terrain: []
      },
      victory: {
        conditions: ['eliminate_enemies'],
        status: 'ongoing'
      },
      actionHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  addUnit(character: Character, position: THREE.Vector3, faction: 'player' | 'enemy' | 'neutral'): CombatUnit {
    const classModifiers = CLASS_COMBAT_MODIFIERS[character.class];
    
    const combatUnit: CombatUnit = {
      id: `unit_${character.id}`,
      characterId: character.id,
      name: character.name,
      class: character.class,
      position: {
        x: position.x,
        y: position.y,
        z: position.z
      },
      health: character.health,
      maxHealth: character.maxHealth,
      armor: 0,
      actionPoints: classModifiers.actionPoints,
      maxActionPoints: classModifiers.actionPoints,
      status: 'healthy',
      statusEffects: [],
      faction,
      hasActed: false,
      initiative: character.stats.agility + Math.random() * 10,
      combatStats: {
        accuracy: character.stats.marksmanship * 0.5 + classModifiers.accuracy,
        damage: character.stats.strength * 0.3 + classModifiers.damage,
        range: COMBAT_CONFIG.BASE_ATTACK_RANGE + classModifiers.range,
        mobility: Math.floor(character.stats.agility * 0.1) + classModifiers.mobility + 1,
        defense: character.stats.endurance * 0.2 + classModifiers.defense
      }
    };

    this.combatState.units.push(combatUnit);
    this.updateCombatState();
    return combatUnit;
  }

  startCombat(): void {
    if (this.combatState.units.length === 0) {
      throw new Error('Cannot start combat with no units');
    }

    this.combatState.turnOrder = this.combatState.units
      .sort((a, b) => b.initiative - a.initiative)
      .map(unit => unit.id);

    this.combatState.status = 'active';
    this.startNewTurn();
    this.emit('combatStarted', this.combatState);
  }

  executeAction(action: Omit<CombatAction, 'id' | 'timestamp'>): boolean {
    const activeUnit = this.getActiveUnit();
    if (!activeUnit) return false;

    if (activeUnit.actionPoints < action.actionPointCost) {
      return false;
    }

    const fullAction: CombatAction = {
      ...action,
      id: `action_${Date.now()}`,
      timestamp: new Date()
    };

    // Simple action processing
    switch (action.type) {
      case 'move':
        if (action.targetPosition) {
          activeUnit.position = action.targetPosition;
          this.emit('unitMoved', activeUnit.id, action.targetPosition);
        }
        break;
      case 'attack':
        if (action.targetId) {
          const target = this.getUnit(action.targetId);
          if (target) {
            const damage = Math.floor(Math.random() * 20) + 10;
            target.health = Math.max(0, target.health - damage);
            this.emit('attackHit', activeUnit.id, target.id, damage, false);
            if (target.health <= 0) {
              target.status = 'dead';
              this.emit('unitEliminated', target.id);
            }
          }
        }
        break;
      case 'defend':
        activeUnit.statusEffects.push('defending');
        break;
    }

    activeUnit.actionPoints -= action.actionPointCost;
    this.combatState.currentTurn.remainingActionPoints = activeUnit.actionPoints;
    this.combatState.currentTurn.actionsThisTurn.push(fullAction);
    this.combatState.actionHistory.push(fullAction);

    if (activeUnit.actionPoints <= 0) {
      this.endCurrentTurn();
    }

    this.updateCombatState();
    this.emit('actionExecuted', fullAction, activeUnit);
    return true;
  }

  getActiveUnit(): CombatUnit | null {
    return this.getUnit(this.combatState.currentTurn.activeUnitId);
  }

  getUnit(unitId: string): CombatUnit | null {
    return this.combatState.units.find(u => u.id === unitId) || null;
  }

  getCombatState(): CombatState {
    return { ...this.combatState };
  }

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

  private startNewTurn(): void {
    const nextUnitId = this.getNextActiveUnit();
    if (!nextUnitId) {
      this.endCombat('draw');
      return;
    }

    const activeUnit = this.getUnit(nextUnitId);
    if (!activeUnit) return;

    activeUnit.actionPoints = activeUnit.maxActionPoints;
    activeUnit.hasActed = false;

    this.combatState.currentTurn = {
      turnNumber: this.combatState.currentTurn.turnNumber + 1,
      phase: 'movement',
      activeUnitId: nextUnitId,
      remainingActionPoints: activeUnit.actionPoints,
      actionsThisTurn: [],
      turnStartTime: new Date(),
      timeLimit: COMBAT_CONFIG.TURN_TIME_LIMIT
    };

    this.updateCombatState();
    this.emit('turnStarted', this.combatState.currentTurn, activeUnit);
  }

  private getNextActiveUnit(): string | null {
    const currentIndex = this.combatState.turnOrder.indexOf(this.combatState.currentTurn.activeUnitId);
    const nextIndex = (currentIndex + 1) % this.combatState.turnOrder.length;
    
    for (let i = 0; i < this.combatState.turnOrder.length; i++) {
      const checkIndex = (nextIndex + i) % this.combatState.turnOrder.length;
      const unitId = this.combatState.turnOrder[checkIndex];
      const unit = this.getUnit(unitId);
      
      if (unit && unit.status !== 'dead') {
        return unitId;
      }
    }
    
    return null;
  }

  private endCurrentTurn(): void {
    const activeUnit = this.getActiveUnit();
    if (activeUnit) {
      activeUnit.hasActed = true;
    }
    
    if (this.checkVictoryConditions()) {
      return;
    }
    
    setTimeout(() => this.startNewTurn(), 500);
  }

  private checkVictoryConditions(): boolean {
    const playerUnits = this.combatState.units.filter(u => u.faction === 'player' && u.status !== 'dead');
    const enemyUnits = this.combatState.units.filter(u => u.faction === 'enemy' && u.status !== 'dead');
    
    if (enemyUnits.length === 0) {
      this.endCombat('player_victory');
      return true;
    }
    
    if (playerUnits.length === 0) {
      this.endCombat('enemy_victory');
      return true;
    }
    
    return false;
  }

  private endCombat(result: 'player_victory' | 'enemy_victory' | 'draw'): void {
    this.combatState.status = 'completed';
    this.combatState.victory.status = result;
    this.updateCombatState();
    this.emit('combatEnded', result, this.combatState);
  }

  private emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in combat event listener for ${event}:`, error);
        }
      });
    }
  }

  private updateCombatState(): void {
    this.combatState.updatedAt = new Date();
    this.emit('stateUpdated', this.combatState);
  }
}