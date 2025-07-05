import React, { useState, useEffect } from 'react';
import { CombatEngine } from '../systems/combat/CombatEngine';
import { CombatState, CombatActionType } from '@shared/types';
import './CombatUI.css';

interface CombatUIProps {
  combatEngine: CombatEngine | null;
  onActionSelected?: (actionType: CombatActionType) => void;
  className?: string;
}

export const CombatUI: React.FC<CombatUIProps> = ({
  combatEngine,
  onActionSelected,
  className = ''
}) => {
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [selectedAction, setSelectedAction] = useState<CombatActionType | null>(null);
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (!combatEngine) return;

    // Subscribe to combat engine events
    const handleStateUpdate = (state: CombatState) => {
      setCombatState(state);
    };

    const handleTurnStarted = () => {
      setSelectedAction(null);
      setTurnTimeRemaining(60); // Reset timer
    };

    combatEngine.on('stateUpdated', handleStateUpdate);
    combatEngine.on('turnStarted', handleTurnStarted);

    // Get initial state
    setCombatState(combatEngine.getCombatState());

    return () => {
      combatEngine.off('stateUpdated', handleStateUpdate);
      combatEngine.off('turnStarted', handleTurnStarted);
    };
  }, [combatEngine]);

  useEffect(() => {
    // Turn timer countdown
    if (combatState?.status === 'active' && turnTimeRemaining > 0) {
      const timer = setInterval(() => {
        setTurnTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [combatState?.status, turnTimeRemaining]);

  const handleActionClick = (actionType: CombatActionType) => {
    setSelectedAction(actionType);
    onActionSelected?.(actionType);
  };

  const handleEndTurn = () => {
    if (combatEngine && combatState) {
      combatEngine.executeAction({
        type: 'wait',
        actorId: combatState.currentTurn.activeUnitId,
        targetType: 'self',
        actionPointCost: combatState.currentTurn.remainingActionPoints
      });
    }
  };

  if (!combatState || combatState.status === 'setup') {
    return (
      <div className={`combat-ui ${className}`}>
        <div className="combat-setup">
          <h3>Combat Setup</h3>
          <p>Waiting for combat to begin...</p>
        </div>
      </div>
    );
  }

  if (combatState.status === 'completed') {
    return (
      <div className={`combat-ui ${className}`}>
        <div className="combat-completed">
          <h3>Combat Complete</h3>
          <div className={`victory-status ${combatState.victory.status}`}>
            {combatState.victory.status === 'player_victory' && '🎉 Victory!'}
            {combatState.victory.status === 'enemy_victory' && '💀 Defeat'}
            {combatState.victory.status === 'draw' && '🤝 Draw'}
          </div>
        </div>
      </div>
    );
  }

  const activeUnit = combatEngine?.getActiveUnit();
  const isPlayerTurn = activeUnit?.faction === 'player';

  return (
    <div className={`combat-ui ${className}`}>
      {/* Turn Information */}
      <div className="turn-info">
        <div className="turn-header">
          <h3>Turn {combatState.currentTurn.turnNumber}</h3>
          <div className="turn-timer">
            <span className={turnTimeRemaining <= 10 ? 'urgent' : ''}>
              {Math.floor(turnTimeRemaining / 60)}:{(turnTimeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        
        {activeUnit && (
          <div className="active-unit-info">
            <div className="unit-name">{activeUnit.name}</div>
            <div className="unit-faction">{activeUnit.faction}</div>
            <div className="action-points">
              AP: {combatState.currentTurn.remainingActionPoints}/{activeUnit.maxActionPoints}
            </div>
          </div>
        )}
      </div>

      {/* Combat Actions */}
      {isPlayerTurn && (
        <div className="combat-actions">
          <h4>Actions</h4>
          <div className="action-buttons">
            <button
              className={`action-btn move ${selectedAction === 'move' ? 'selected' : ''}`}
              onClick={() => handleActionClick('move')}
              disabled={!activeUnit || activeUnit.actionPoints < 1}
            >
              <span className="action-icon">🚶</span>
              <span className="action-name">Move</span>
              <span className="action-cost">1 AP</span>
            </button>

            <button
              className={`action-btn attack ${selectedAction === 'attack' ? 'selected' : ''}`}
              onClick={() => handleActionClick('attack')}
              disabled={!activeUnit || activeUnit.actionPoints < 2}
            >
              <span className="action-icon">🎯</span>
              <span className="action-name">Attack</span>
              <span className="action-cost">2 AP</span>
            </button>

            <button
              className={`action-btn ability ${selectedAction === 'ability' ? 'selected' : ''}`}
              onClick={() => handleActionClick('ability')}
              disabled={!activeUnit || activeUnit.actionPoints < 3}
            >
              <span className="action-icon">⚡</span>
              <span className="action-name">Ability</span>
              <span className="action-cost">3 AP</span>
            </button>

            <button
              className={`action-btn defend ${selectedAction === 'defend' ? 'selected' : ''}`}
              onClick={() => handleActionClick('defend')}
              disabled={!activeUnit || activeUnit.actionPoints < 1}
            >
              <span className="action-icon">🛡️</span>
              <span className="action-name">Defend</span>
              <span className="action-cost">1 AP</span>
            </button>
          </div>

          <div className="turn-controls">
            <button
              className="end-turn-btn"
              onClick={handleEndTurn}
              disabled={!activeUnit}
            >
              End Turn
            </button>
          </div>
        </div>
      )}

      {/* Unit Status Panel */}
      <div className="unit-status-panel">
        <h4>Units</h4>
        <div className="units-list">
          {combatState.units.map(unit => (
            <div
              key={unit.id}
              className={`unit-status-item ${unit.faction} ${unit.id === activeUnit?.id ? 'active' : ''}`}
            >
              <div className="unit-info">
                <div className="unit-name">{unit.name}</div>
                <div className="unit-class">{unit.class}</div>
              </div>
              
              <div className="unit-stats">
                <div className="health-bar">
                  <div
                    className="health-fill"
                    style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                  />
                  <span className="health-text">
                    {unit.health}/{unit.maxHealth}
                  </span>
                </div>
                
                <div className="status-effects">
                  {unit.statusEffects.map(effect => (
                    <span key={effect} className={`status-effect ${effect}`}>
                      {effect}
                    </span>
                  ))}
                </div>
              </div>

              <div className="unit-status">
                <span className={`status-indicator ${unit.status}`}>
                  {unit.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action History */}
      <div className="action-history">
        <h4>Combat Log</h4>
        <div className="history-list">
          {combatState.actionHistory.slice(-5).map(action => (
            <div key={action.id} className="history-item">
              <span className="action-actor">
                {combatState.units.find(u => u.id === action.actorId)?.name}
              </span>
              <span className="action-type">{action.type}</span>
              {action.damage && (
                <span className="action-damage">({action.damage} dmg)</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
