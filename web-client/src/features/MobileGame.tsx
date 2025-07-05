import React, { useState, useEffect } from 'react';
import { Character } from '@shared/types';
import { TacticalView } from '../components/TacticalView';
import { CharacterList } from '../components/CharacterList';
import { CharacterCreation } from '../components/CharacterCreation';
import '../styles/MobileGame.css';

interface DeployedCharacter extends Character {
  isDeployed: boolean;
  deployPosition?: { x: number; z: number };
  currentHealth: number;
  status: 'ready' | 'moving' | 'action' | 'wounded' | 'down';
}

interface MobileGameProps {
  className?: string;
}

export const MobileGame: React.FC<MobileGameProps> = ({ className = '' }) => {
  const [gameState, setGameState] = useState<'setup' | 'deployment' | 'active' | 'paused'>('setup');
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [deployedCharacters, setDeployedCharacters] = useState<DeployedCharacter[]>([]);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [currentTurn] = useState(1);
  const [showPanelToggles, setShowPanelToggles] = useState(false);

  // Handle character selection
  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacters(prev => {
      const isAlreadySelected = prev.find(c => c.id === character.id);
      if (isAlreadySelected) {
        return prev.filter(c => c.id !== character.id);
      } else if (prev.length < 4) {
        return [...prev, character];
      } else {
        alert('Maximum 4 characters can be selected for a mission');
        return prev;
      }
    });
  };

  // Deploy characters
  const handleDeployCharacters = () => {
    if (selectedCharacters.length === 0) {
      alert('Please select at least one character to deploy');
      return;
    }

    const newDeployedCharacters: DeployedCharacter[] = selectedCharacters.map((char, index) => ({
      ...char,
      isDeployed: true,
      deployPosition: { 
        x: -2 + index * 1.5,
        z: -6
      },
      currentHealth: char.health || char.maxHealth || 100,
      status: 'ready' as const
    }));

    setDeployedCharacters(newDeployedCharacters);
    setGameState('deployment');
    setLeftPanelOpen(false); // Close panel after deployment
  };

  // Start mission
  const handleStartMission = () => {
    if (deployedCharacters.length === 0) {
      alert('Please deploy characters first');
      return;
    }
    setGameState('active');
  };

  // Handle action selection
  const handleActionSelect = (action: string) => {
    setSelectedAction(selectedAction === action ? null : action);
  };

  // Get squad statistics
  const getSquadStats = () => {
    if (deployedCharacters.length === 0) return null;
    
    const totalHealth = deployedCharacters.reduce((sum, char) => sum + char.currentHealth, 0);
    const maxHealth = deployedCharacters.reduce((sum, char) => sum + (char.maxHealth || 100), 0);
    const readyCount = deployedCharacters.filter(c => c.status === 'ready').length;
    
    return {
      size: deployedCharacters.length,
      health: totalHealth,
      maxHealth,
      healthPercentage: Math.round((totalHealth / maxHealth) * 100),
      readyCount
    };
  };

  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (window.innerWidth < 992) { // Only on mobile/tablet
        setLeftPanelOpen(false);
        setRightPanelOpen(false);
      }
    };

    const handleResize = () => {
      setShowPanelToggles(window.innerWidth < 992);
    };

    // Set initial values
    handleResize();
    
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (showCharacterCreation) {
    return (
      <div className="mobile-game-container">
        <CharacterCreation
          onCharacterCreated={() => setShowCharacterCreation(false)}
          onCancel={() => setShowCharacterCreation(false)}
        />
      </div>
    );
  }

  const squadStats = getSquadStats();

  return (
    <div className={`mobile-game-container ${className}`}>
      {/* Game Canvas */}
      <div className="game-canvas-container">
        <TacticalView
          deployedCharacters={deployedCharacters}
          gameState={gameState}
          onCharacterPositionUpdate={(characterId, position) => {
            setDeployedCharacters(prev => 
              prev.map(char => 
                char.id === characterId 
                  ? { ...char, deployPosition: position }
                  : char
              )
            );
          }}
        />

        {/* UI Overlay */}
        <div className="mobile-ui-overlay">
          {/* Top HUD */}
          <div className="top-hud">
            <div className="game-title">
              Tactical Operator
            </div>
            
            {squadStats && (
              <div className="character-stats">
                <div className="character-stat">
                  <span className="stat-label">Squad:</span>
                  <span className="stat-value">{squadStats.size}</span>
                </div>
                <div className="character-stat">
                  <span className="stat-label">HP:</span>
                  <span className="stat-value">{squadStats.healthPercentage}%</span>
                </div>
                <div className="character-stat">
                  <span className="stat-label">Ready:</span>
                  <span className="stat-value">{squadStats.readyCount}</span>
                </div>
              </div>
            )}

            {gameState === 'active' && (
              <div className="turn-indicator">
                Turn {currentTurn}
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="bottom-action-bar">
            {squadStats && (
              <div className="squad-status-bar">
                <div className="squad-info">
                  Squad: {squadStats.size} | Ready: {squadStats.readyCount}
                </div>
                <div className="squad-health">
                  {squadStats.health}/{squadStats.maxHealth} HP
                </div>
              </div>
            )}

            <div className="action-buttons">
              {gameState === 'setup' && (
                <>
                  <button 
                    className="action-button"
                    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                  >
                    <div className="action-icon">👥</div>
                    Characters
                  </button>
                  <button 
                    className="action-button"
                    onClick={handleDeployCharacters}
                    disabled={selectedCharacters.length === 0}
                  >
                    <div className="action-icon">🚀</div>
                    Deploy
                  </button>
                  <button 
                    className="action-button"
                    onClick={() => setShowCharacterCreation(true)}
                  >
                    <div className="action-icon">➕</div>
                    Create
                  </button>
                </>
              )}

              {gameState === 'deployment' && (
                <>
                  <button 
                    className="action-button"
                    onClick={handleStartMission}
                    disabled={deployedCharacters.length === 0}
                  >
                    <div className="action-icon">⚔️</div>
                    Start
                  </button>
                  <button 
                    className="action-button"
                    onClick={() => setGameState('setup')}
                  >
                    <div className="action-icon">↩️</div>
                    Back
                  </button>
                </>
              )}

              {gameState === 'active' && (
                <>
                  <button 
                    className={`action-button ${selectedAction === 'move' ? 'selected' : ''}`}
                    onClick={() => handleActionSelect('move')}
                  >
                    <div className="action-icon">🏃</div>
                    Move
                  </button>
                  <button 
                    className={`action-button ${selectedAction === 'attack' ? 'selected' : ''}`}
                    onClick={() => handleActionSelect('attack')}
                  >
                    <div className="action-icon">⚔️</div>
                    Attack
                  </button>
                  <button 
                    className={`action-button ${selectedAction === 'defend' ? 'selected' : ''}`}
                    onClick={() => handleActionSelect('defend')}
                  >
                    <div className="action-icon">🛡️</div>
                    Defend
                  </button>
                  <button 
                    className={`action-button ${selectedAction === 'ability' ? 'selected' : ''}`}
                    onClick={() => handleActionSelect('ability')}
                  >
                    <div className="action-icon">✨</div>
                    Ability
                  </button>
                  <button 
                    className="action-button"
                    onClick={() => setGameState('paused')}
                  >
                    <div className="action-icon">⏸️</div>
                    Pause
                  </button>
                  <button 
                    className="action-button"
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  >
                    <div className="action-icon">📊</div>
                    Stats
                  </button>
                </>
              )}

              {gameState === 'paused' && (
                <>
                  <button 
                    className="action-button"
                    onClick={() => setGameState('active')}
                  >
                    <div className="action-icon">▶️</div>
                    Resume
                  </button>
                  <button 
                    className="action-button"
                    onClick={() => setGameState('setup')}
                  >
                    <div className="action-icon">🏠</div>
                    Menu
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Panel Toggle Buttons (Mobile/Tablet only) */}
          {showPanelToggles && (
            <>
              <button 
                className="panel-toggle panel-toggle-left"
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              >
                👥
              </button>
              <button 
                className="panel-toggle panel-toggle-right"
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
              >
                📊
              </button>
            </>
          )}

          {/* Left Panel - Character Selection */}
          <div className={`side-panel side-panel-left ${leftPanelOpen ? 'open' : ''}`}>
            <div className="side-panel-header">
              Squad Selection ({selectedCharacters.length}/4)
            </div>
            <div className="side-panel-content">
              {gameState === 'setup' && (
                <>
                  {selectedCharacters.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ color: '#4CAF50', marginBottom: '8px', fontSize: '0.9rem' }}>
                        Selected Characters
                      </h4>
                      {selectedCharacters.map(char => (
                        <div key={char.id} className="mobile-character-item selected">
                          <div className="character-avatar">
                            {char.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="character-details">
                            <div className="character-name">{char.name}</div>
                            <div className="character-class">{char.class}</div>
                            <div className="character-health">
                              HP: {char.health || char.maxHealth || 100}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mobile-character-list">
                    <CharacterList
                      onCharacterSelect={handleCharacterSelect}
                      onCreateNew={() => setShowCharacterCreation(true)}
                    />
                  </div>
                </>
              )}
              
              {gameState !== 'setup' && deployedCharacters.length > 0 && (
                <>
                  <h4 style={{ color: '#4CAF50', marginBottom: '8px', fontSize: '0.9rem' }}>
                    Deployed Squad
                  </h4>
                  {deployedCharacters.map(char => (
                    <div key={char.id} className="mobile-character-item">
                      <div className="character-avatar">
                        {char.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="character-details">
                        <div className="character-name">{char.name}</div>
                        <div className="character-class">{char.class}</div>
                        <div className="character-health">
                          HP: {char.currentHealth}/{char.maxHealth || 100}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: char.status === 'ready' ? '#4CAF50' : '#F59E0B' }}>
                          Status: {char.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Game Stats */}
          <div className={`side-panel side-panel-right ${rightPanelOpen ? 'open' : ''}`}>
            <div className="side-panel-header">
              Mission Stats
            </div>
            <div className="side-panel-content">
              <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Game State:</strong> {gameState}
                </div>
                
                {squadStats && (
                  <>
                    <div style={{ marginBottom: '12px' }}>
                      <strong>Squad Size:</strong> {squadStats.size}
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <strong>Total Health:</strong> {squadStats.health}/{squadStats.maxHealth} ({squadStats.healthPercentage}%)
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <strong>Ready Units:</strong> {squadStats.readyCount}/{squadStats.size}
                    </div>
                  </>
                )}
                
                {gameState === 'active' && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Current Turn:</strong> {currentTurn}
                  </div>
                )}
                
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '6px', fontSize: '0.75rem' }}>
                  <strong>Controls:</strong><br />
                  • Tap units to select<br />
                  • Tap ground to move<br />
                  • Use action buttons below<br />
                  • Pinch to zoom
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
