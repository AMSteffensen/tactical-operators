import React, { useState, useEffect } from 'react';
import { HybridGameManager, GameMode, Army, Squad } from '../systems/HybridGameManager';
import { CombatEngine } from '../systems/combat/CombatEngine';
import { Character } from '@shared/types';
import { TacticalView } from '../components/TacticalView';
import { InGameHUD } from '../components/InGameHUD';
import { StrategicView } from '../components/StrategicView.tsx';
// import { CombatActionType } from '@shared/types';
import './HybridGameScreen.css';

interface HybridGameScreenProps {
  selectedCharacters: Character[];
  onExitGame: () => void;
}

export const HybridGameScreen: React.FC<HybridGameScreenProps> = ({
  selectedCharacters,
  onExitGame
}) => {
  // Game state
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.STRATEGIC);
  const [gameManager] = useState(() => new HybridGameManager());
  const [combatEngine, setCombatEngine] = useState<CombatEngine | null>(null);
  
  // Strategic state
  const [playerArmies, setPlayerArmies] = useState<Army[]>([]);
  const [selectedArmyId, setSelectedArmyId] = useState<string | null>(null);
  const [strategicResources, setStrategicResources] = useState({
    food: 1000,
    materials: 500,
    fuel: 300
  });

  // UI state
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [gameLog, setGameLog] = useState<string[]>([]);

  // Initialize game
  useEffect(() => {
    console.log('🎮 Initializing Hybrid Game with characters:', selectedCharacters);

    // Create initial player army from selected characters
    if (selectedCharacters.length > 0) {
      const initialSquads: Squad[] = [{
        id: 'player_squad_1',
        name: 'Alpha Squad',
        units: selectedCharacters,
        formation: 'line',
        status: 'healthy',
        experience: 0
      }];

      const armyId = gameManager.createArmy(
        initialSquads,
        { x: -10, z: -10 }, // Starting position
        'player'
      );

      addToGameLog(`Created Alpha Squad with ${selectedCharacters.length} units`);
      setSelectedArmyId(armyId);
    }

    // Create enemy army for demonstration
    const enemySquad: Squad = {
      id: 'enemy_squad_1',
      name: 'Enemy Patrol',
      units: [
        {
          id: 'enemy_1',
          name: 'Enemy Soldier 1',
          class: 'assault',
          health: 80,
          maxHealth: 80,
          stats: { strength: 15, agility: 12, intelligence: 10, endurance: 14, marksmanship: 13, medical: 8 }
        },
        {
          id: 'enemy_2', 
          name: 'Enemy Soldier 2',
          class: 'sniper',
          health: 70,
          maxHealth: 70,
          stats: { strength: 12, agility: 15, intelligence: 12, endurance: 10, marksmanship: 18, medical: 6 }
        }
      ] as Character[],
      formation: 'spread',
      status: 'healthy',
      experience: 0
    };

    gameManager.createArmy(
      [enemySquad],
      { x: 10, z: 10 }, // Enemy starting position
      'enemy'
    );

    addToGameLog('Enemy patrol detected in the area');

    // Setup event handlers
    setupGameManagerEvents();

    // Start the game
    gameManager.start();

    return () => {
      gameManager.stop();
    };
  }, []);

  const setupGameManagerEvents = () => {
    // Mode transitions
    gameManager.on('modeChanged', (newMode: GameMode) => {
      console.log(`🔄 Game mode changed to: ${newMode}`);
      setGameMode(newMode);
      addToGameLog(`Mode changed to ${newMode}`);
    });

    // Strategic events
    gameManager.on('armyCreated', (army: Army) => {
      if (army.faction === 'player') {
        setPlayerArmies(prev => [...prev, army]);
      }
      addToGameLog(`Army ${army.id} created`);
    });

    gameManager.on('armyMoved', (army: Army) => {
      if (army.faction === 'player') {
        setPlayerArmies(prev => prev.map(a => a.id === army.id ? army : a));
      }
    });

    // Combat events
    gameManager.on('combatInitiated', ({ armyA, armyB }: any) => {
      addToGameLog(`⚔️ Combat initiated between ${armyA.id} and ${armyB.id}`);
    });

    gameManager.on('tacticalBattleReady', (engine: CombatEngine) => {
      console.log('🎯 Tactical battle ready');
      setCombatEngine(engine);
    });

    gameManager.on('combatResolved', (result: any) => {
      addToGameLog(`Combat resolved: ${result.victor} victory`);
      setCombatEngine(null);
    });

    // Resource updates
    gameManager.on('strategicStateUpdated', (state: any) => {
      setStrategicResources(state.resources.player);
    });
  };

  const addToGameLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setGameLog(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  };

  // Strategic mode handlers
  const handleArmySelect = (armyId: string) => {
    setSelectedArmyId(armyId);
    addToGameLog(`Selected army: ${armyId}`);
  };

  const handleArmyMove = (destination: { x: number; z: number }) => {
    if (!selectedArmyId) return;
    
    const success = gameManager.moveArmy(selectedArmyId, destination);
    if (success) {
      addToGameLog(`Army ${selectedArmyId} ordered to move to (${destination.x}, ${destination.z})`);
    }
  };

  const handleStrategicPause = () => {
    gameManager.pauseStrategic();
    addToGameLog('Strategic gameplay paused');
  };

  // Tactical mode handlers
  // Removed: handleActionSelected (was only used for InGameHUD props)

  // Exit handling
  const handleExit = () => {
    if (gameMode === GameMode.TACTICAL) {
      alert('Cannot exit during tactical combat. Resolve the battle first.');
      return;
    }
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    gameManager.stop();
    onExitGame();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          if (showExitConfirm) {
            setShowExitConfirm(false);
          } else {
            handleExit();
          }
          break;
        case ' ': // Spacebar
          event.preventDefault();
          if (gameMode === GameMode.STRATEGIC) {
            handleStrategicPause();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameMode, showExitConfirm]);

  return (
    <div className="hybrid-game-screen">
      {/* Game Mode Indicator */}
      <div className="game-mode-indicator">
        <div className={`mode-badge ${gameMode}`}>
          {gameMode === GameMode.STRATEGIC && '🗺️ Strategic'}
          {gameMode === GameMode.TACTICAL && '⚔️ Tactical'}
          {gameMode === GameMode.TRANSITION && '🔄 Transitioning...'}
        </div>
        
        {gameMode === GameMode.STRATEGIC && (
          <div className="strategic-controls">
            <button onClick={handleStrategicPause} className="control-btn">
              ⏸️ Pause
            </button>
          </div>
        )}
      </div>

      {/* Strategic Mode - RTS View */}
      {gameMode === GameMode.STRATEGIC && (
        <div className="strategic-mode">
          <StrategicView
            armies={playerArmies}
            selectedArmyId={selectedArmyId}
            onArmySelect={handleArmySelect}
            onArmyMove={handleArmyMove}
            resources={strategicResources}
            gameLog={gameLog}
          />
        </div>
      )}

      {/* Tactical Mode - Turn-Based Combat */}
      {gameMode === GameMode.TACTICAL && combatEngine && (
        <div className="tactical-mode">
          <TacticalView
            className="tactical-view-fullscreen"
            hideUIElements={true}
            gameState="active"
          />
          
          <InGameHUD />
        </div>
      )}

      {/* Transition Mode */}
      {gameMode === GameMode.TRANSITION && (
        <div className="transition-mode">
          <div className="transition-overlay">
            <div className="transition-content">
              <div className="loading-spinner">🔄</div>
              <h2>Preparing for Battle...</h2>
              <p>Deploying units to tactical battlefield</p>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation */}
      {showExitConfirm && (
        <div className="exit-confirm-overlay">
          <div className="exit-confirm-dialog">
            <h3>Exit Game?</h3>
            <p>Are you sure you want to exit the current campaign?</p>
            <div className="exit-confirm-buttons">
              <button onClick={confirmExit} className="btn-exit">
                Yes, Exit
              </button>
              <button onClick={() => setShowExitConfirm(false)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Log */}
      <div className="game-log-overlay">
        <div className="log-header">Mission Log</div>
        <div className="log-entries">
          {gameLog.map((entry, index) => (
            <div key={index} className="log-entry">
              {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
