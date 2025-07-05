import React, { useState, useEffect } from 'react';
import { Character, CombatActionType } from '@shared/types';
import { TacticalView } from '../components/TacticalView';
import { InGameHUD } from '../components/InGameHUD';
import { CombatEngine } from '../systems/combat/CombatEngine';
import './GameplayScreen.css';

interface DeployedCharacter extends Character {
  isDeployed: boolean;
  deployPosition?: { x: number; z: number };
  currentHealth: number;
  status: 'ready' | 'moving' | 'action' | 'wounded' | 'down';
}

interface GameplayScreenProps {
  deployedCharacters: DeployedCharacter[];
  onExitGame: () => void;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  deployedCharacters,
  onExitGame
}) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameState, setGameState] = useState<'active' | 'paused'>('active');
  const [combatEngine, setCombatEngine] = useState<CombatEngine | null>(null);
  const [selectedAction, setSelectedAction] = useState<CombatActionType | null>(null);

  // Handle action selection from InGameHUD
  const handleActionSelected = (action: CombatActionType) => {
    setSelectedAction(action);
    console.log(`🎮 Action selected: ${action}`);
  };

  // Handle combat engine updates from TacticalView
  const handleCombatEngineUpdate = (engine: CombatEngine) => {
    setCombatEngine(engine);
  };

  // Handle escape key for pause menu
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (showExitConfirm) {
          setShowExitConfirm(false);
        } else if (gameState === 'active') {
          setGameState('paused');
        } else {
          setGameState('active');
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameState, showExitConfirm]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleExitGame = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    onExitGame();
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    handleExitGame();
  };

  return (
    <div className="gameplay-screen">
      {/* Full-screen tactical view with no distractions */}
      <div className="game-canvas-full">
        <TacticalView
          deployedCharacters={deployedCharacters}
          gameState={gameState}
          height="100vh"
          hideUIElements={true}
          selectedAction={selectedAction}
          onCombatEngineCreated={handleCombatEngineUpdate}
          onCharacterPositionUpdate={(characterId, position) => {
            // Handle character movement updates if needed
            console.log(`Character ${characterId} moved to`, position);
          }}
        />
        
        {/* In-Game HUD - JRPG-style action selection rendered over 3D view */}
        {combatEngine && gameState === 'active' && (
          <InGameHUD
            combatEngine={combatEngine}
            onActionSelected={handleActionSelected}
            gameState={gameState}
          />
        )}
      </div>

      {/* Minimal overlay - only shown when paused or for critical actions */}
      {gameState === 'paused' && (
        <div className="pause-overlay">
          <div className="pause-menu">
            <h2>Game Paused</h2>
            <div className="pause-actions">
              <button
                className="resume-button"
                onClick={() => setGameState('active')}
              >
                ▶️ Resume Game
              </button>
              <button
                className="fullscreen-button"
                onClick={handleFullscreenToggle}
              >
                {isFullscreen ? '🔲 Exit Fullscreen' : '⛶ Fullscreen'}
              </button>
              <button
                className="exit-button"
                onClick={() => setShowExitConfirm(true)}
              >
                🚪 Exit Mission
              </button>
            </div>
            <div className="pause-hint">
              Press ESC to resume
            </div>
          </div>
        </div>
      )}

      {/* Exit confirmation dialog */}
      {showExitConfirm && (
        <div className="exit-overlay">
          <div className="exit-dialog">
            <h3>Exit Mission?</h3>
            <p>Are you sure you want to exit the current mission? Your progress may be lost.</p>
            <div className="exit-actions">
              <button
                className="cancel-exit-button"
                onClick={() => setShowExitConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-exit-button"
                onClick={confirmExit}
              >
                Exit Mission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimal UI hint - only visible briefly at start */}
      {gameState === 'active' && (
        <div className="ui-hint">
          Press ESC to pause
        </div>
      )}
    </div>
  );
};
