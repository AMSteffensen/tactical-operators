import React, { useState, useEffect } from 'react';
import { CombatEngine } from '../systems/combat/CombatEngine';
import { CombatActionType } from '@shared/types';
import './InGameHUD.css';

interface InGameHUDProps {
  combatEngine: CombatEngine | null;
  onActionSelected: (action: CombatActionType) => void;
  gameState: 'active' | 'paused';
}

interface ActiveUnit {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  actionPoints: number;
  maxActionPoints: number;
  status: string;
  faction: string;
}

export const InGameHUD: React.FC<InGameHUDProps> = ({
  combatEngine,
  onActionSelected,
  gameState
}) => {
  const [activeUnit, setActiveUnit] = useState<ActiveUnit | null>(null);
  const [selectedAction, setSelectedAction] = useState<CombatActionType | null>(null);
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(30);
  const [combatState, setCombatState] = useState<any>(null);

  // Update active unit when combat engine changes
  useEffect(() => {
    if (!combatEngine) return;

    const updateActiveUnit = () => {
      const unit = combatEngine.getActiveUnit();
      if (unit) {
        setActiveUnit({
          id: unit.id,
          name: unit.name, // Use unit.name instead of unit.characterName
          health: unit.health,
          maxHealth: unit.maxHealth,
          actionPoints: unit.actionPoints,
          maxActionPoints: unit.maxActionPoints || 3,
          status: unit.status,
          faction: unit.faction
        });
      } else {
        setActiveUnit(null);
      }
    };

    const handleStateUpdate = (state: any) => {
      setCombatState(state);
      updateActiveUnit();
    };

    const handleTurnStarted = () => {
      setSelectedAction(null);
      setTurnTimeRemaining(30);
      updateActiveUnit();
    };

    combatEngine.on('stateUpdated', handleStateUpdate);
    combatEngine.on('turnStarted', handleTurnStarted);

    // Initial update
    updateActiveUnit();

    return () => {
      combatEngine.off('stateUpdated', handleStateUpdate);
      combatEngine.off('turnStarted', handleTurnStarted);
    };
  }, [combatEngine]);

  // Turn timer
  useEffect(() => {
    if (gameState !== 'active' || !activeUnit || activeUnit.faction !== 'player') return;

    const timer = setInterval(() => {
      setTurnTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-skip turn when time runs out - use 'wait' instead of 'skip'
          handleActionSelect('wait');
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, activeUnit]);

  const handleActionSelect = (action: CombatActionType) => {
    setSelectedAction(action);
    onActionSelected(action);
  };

  const getActionCost = (action: CombatActionType): number => {
    switch (action) {
      case 'move': return 1;
      case 'attack': return 2;
      case 'defend': return 1;
      case 'ability': return 2;
      case 'item': return 1; // Use 'item' instead of 'reload'
      case 'wait': return 0; // Use 'wait' instead of 'skip'
      default: return 1;
    }
  };

  const canUseAction = (action: CombatActionType): boolean => {
    if (!activeUnit) return false;
    const cost = getActionCost(action);
    return activeUnit.actionPoints >= cost;
  };

  const getHealthPercentage = (): number => {
    if (!activeUnit) return 0;
    return (activeUnit.health / activeUnit.maxHealth) * 100;
  };

  const getActionPointsPercentage = (): number => {
    if (!activeUnit) return 0;
    return (activeUnit.actionPoints / activeUnit.maxActionPoints) * 100;
  };

  // Don't show HUD if no active unit or not player's turn
  if (!activeUnit || activeUnit.faction !== 'player' || gameState !== 'active') {
    return null;
  }

  return (
    <div className="in-game-hud">
      {/* Unit Status Panel */}
      <div className="unit-status-panel">
        <div className="unit-portrait">
          <div className="portrait-avatar">
            {activeUnit.name.charAt(0).toUpperCase()}
          </div>
          <div className="unit-name">{activeUnit.name}</div>
        </div>

        <div className="unit-stats">
          <div className="stat-bar">
            <div className="stat-label">Health</div>
            <div className="stat-bar-container">
              <div 
                className="stat-bar-fill health"
                style={{ width: `${getHealthPercentage()}%` }}
              />
              <div className="stat-text">
                {activeUnit.health}/{activeUnit.maxHealth}
              </div>
            </div>
          </div>

          <div className="stat-bar">
            <div className="stat-label">Action Points</div>
            <div className="stat-bar-container">
              <div 
                className="stat-bar-fill action-points"
                style={{ width: `${getActionPointsPercentage()}%` }}
              />
              <div className="stat-text">
                {activeUnit.actionPoints}/{activeUnit.maxActionPoints}
              </div>
            </div>
          </div>
        </div>

        <div className="turn-timer">
          <div className="timer-label">Turn Time</div>
          <div className={`timer-value ${turnTimeRemaining <= 10 ? 'warning' : ''}`}>
            {turnTimeRemaining}s
          </div>
        </div>
      </div>

      {/* Action Menu */}
      <div className="action-menu">
        <div className="action-menu-title">Choose Action</div>
        
        <div className="action-grid">
          <button
            className={`action-button move ${selectedAction === 'move' ? 'selected' : ''} ${!canUseAction('move') ? 'disabled' : ''}`}
            onClick={() => handleActionSelect('move')}
            disabled={!canUseAction('move')}
          >
            <div className="action-icon">🏃</div>
            <div className="action-name">Move</div>
            <div className="action-cost">{getActionCost('move')} AP</div>
          </button>

          <button
            className={`action-button attack ${selectedAction === 'attack' ? 'selected' : ''} ${!canUseAction('attack') ? 'disabled' : ''}`}
            onClick={() => handleActionSelect('attack')}
            disabled={!canUseAction('attack')}
          >
            <div className="action-icon">⚔️</div>
            <div className="action-name">Attack</div>
            <div className="action-cost">{getActionCost('attack')} AP</div>
          </button>

          <button
            className={`action-button defend ${selectedAction === 'defend' ? 'selected' : ''} ${!canUseAction('defend') ? 'disabled' : ''}`}
            onClick={() => handleActionSelect('defend')}
            disabled={!canUseAction('defend')}
          >
            <div className="action-icon">🛡️</div>
            <div className="action-name">Defend</div>
            <div className="action-cost">{getActionCost('defend')} AP</div>
          </button>

          <button
            className={`action-button ability ${selectedAction === 'ability' ? 'selected' : ''} ${!canUseAction('ability') ? 'disabled' : ''}`}
            onClick={() => handleActionSelect('ability')}
            disabled={!canUseAction('ability')}
          >
            <div className="action-icon">✨</div>
            <div className="action-name">Ability</div>
            <div className="action-cost">{getActionCost('ability')} AP</div>
          </button>

          <button
            className={`action-button item ${selectedAction === 'item' ? 'selected' : ''} ${!canUseAction('item') ? 'disabled' : ''}`}
            onClick={() => handleActionSelect('item')}
            disabled={!canUseAction('item')}
          >
            <div className="action-icon">🔄</div>
            <div className="action-name">Use Item</div>
            <div className="action-cost">{getActionCost('item')} AP</div>
          </button>

          <button
            className={`action-button wait ${selectedAction === 'wait' ? 'selected' : ''}`}
            onClick={() => handleActionSelect('wait')}
          >
            <div className="action-icon">⏭️</div>
            <div className="action-name">Wait</div>
            <div className="action-cost">Free</div>
          </button>
        </div>

        {selectedAction && (
          <div className="action-instruction">
            {selectedAction === 'move' && "Click on the battlefield to move"}
            {selectedAction === 'attack' && "Click on an enemy to attack"}
            {selectedAction === 'defend' && "Character will take defensive stance"}
            {selectedAction === 'ability' && "Click to use special ability"}
            {selectedAction === 'item' && "Character will use an item"}
            {selectedAction === 'wait' && "End turn without taking action"}
          </div>
        )}
      </div>

      {/* Combat Log */}
      <div className="combat-log-mini">
        <div className="log-title">Combat Log</div>
        <div className="log-entries">
          {combatState?.lastAction && (
            <div className="log-entry recent">
              {combatState.lastAction}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
