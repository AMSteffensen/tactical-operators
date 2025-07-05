import React, { useState } from 'react';
import { Character } from '@shared/types';
import { TacticalView } from '../components/TacticalView';
import { CharacterList } from '../components/CharacterList';
import { CharacterCreation } from '../components/CharacterCreation';
import './Game.css';

interface DeployedCharacter extends Character {
  isDeployed: boolean;
  deployPosition?: { x: number; z: number };
  currentHealth: number;
  status: 'ready' | 'moving' | 'action' | 'wounded' | 'down';
}

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<'setup' | 'deployment' | 'active' | 'paused'>('setup');
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [deployedCharacters, setDeployedCharacters] = useState<DeployedCharacter[]>([]);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacters(prev => {
      const isAlreadySelected = prev.find(c => c.id === character.id);
      if (isAlreadySelected) {
        return prev.filter(c => c.id !== character.id);
      } else if (prev.length < 4) { // Max 4 characters per squad
        return [...prev, character];
      } else {
        alert('Maximum 4 characters can be selected for a mission');
        return prev;
      }
    });
  };

  const handleDeployCharacters = () => {
    if (selectedCharacters.length === 0) {
      alert('Please select at least one character to deploy');
      return;
    }

    // Convert selected characters to deployed characters
    const newDeployedCharacters: DeployedCharacter[] = selectedCharacters.map((char, index) => ({
      ...char,
      isDeployed: true,
      deployPosition: { 
        x: -2 + index * 1.5, // Space them out in a line
        z: -6 // Deploy them at the back
      },
      currentHealth: char.health || char.maxHealth || 100,
      status: 'ready' as const
    }));

    setDeployedCharacters(newDeployedCharacters);
    setGameState('deployment');
    
    // TODO: Add characters to tactical view
    console.log('🚀 Deploying characters:', newDeployedCharacters);
  };

  const handleStartMission = () => {
    if (deployedCharacters.length === 0) {
      alert('Please deploy characters first');
      return;
    }
    setGameState('active');
  };

  const handleCharacterCreated = (_character: Character) => {
    setShowCharacterCreation(false);
    // Character will be available in the next character list refresh
  };

  const getSquadStats = () => {
    if (deployedCharacters.length === 0) return null;
    
    const totalHealth = deployedCharacters.reduce((sum, char) => sum + char.currentHealth, 0);
    const maxHealth = deployedCharacters.reduce((sum, char) => sum + (char.maxHealth || 100), 0);
    const averageLevel = deployedCharacters.reduce((sum, char) => sum + (char.level || 1), 0) / deployedCharacters.length;
    
    return {
      size: deployedCharacters.length,
      health: `${totalHealth}/${maxHealth}`,
      averageLevel: Math.round(averageLevel),
      readyCount: deployedCharacters.filter(c => c.status === 'ready').length
    };
  };

  if (showCharacterCreation) {
    return (
      <div className="h-full">
        <CharacterCreation
          onCharacterCreated={handleCharacterCreated}
          onCancel={() => setShowCharacterCreation(false)}
        />
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Tactical Operations</h1>
        <p>Deploy your squad and complete the mission</p>
      </div>

      <div className="game-grid">
        {/* Character Selection Panel */}
        <div className="squad-selection-panel">
          <h3 className="squad-selection-title">Squad Selection</h3>
          
          {gameState === 'setup' && (
            <div>
              <p className="squad-info">
                Select up to 4 characters for your mission squad
              </p>
              
              <div className="mb-4">
                <h4 className="selected-characters-header">
                  Selected ({selectedCharacters.length}/4)
                </h4>
                {selectedCharacters.length === 0 ? (
                  <p className="no-characters-selected">No characters selected</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCharacters.map(char => (
                      <div key={char.id} className="selected-character-item">
                        <span className="character-name">{char.name}</span>
                        <span className="character-class">{char.class}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="squad-actions">
                <button
                  onClick={handleDeployCharacters}
                  disabled={selectedCharacters.length === 0}
                  className="deploy-button"
                >
                  Deploy Squad
                </button>
                <button
                  onClick={() => setShowCharacterCreation(true)}
                  className="create-character-button"
                >
                  Create New Character
                </button>
              </div>
            </div>
          )}

          {gameState !== 'setup' && (
            <div>
              <h4 className="deployed-squad-header">Deployed Squad</h4>
              {deployedCharacters.map(char => (
                <div key={char.id} className="deployed-character-card">
                  <div className="deployed-character-header">
                    <span className="deployed-character-name">{char.name}</span>
                    <span className={`character-status status-${char.status}`}>
                      {char.status}
                    </span>
                  </div>
                  <div className="deployed-character-details">
                    {char.class} • HP: {char.currentHealth}/{char.maxHealth || 100}
                  </div>
                </div>
              ))}
              
              {gameState === 'deployment' && (
                <button
                  onClick={handleStartMission}
                  className="start-mission-button"
                >
                  Start Mission
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tactical View */}
        <div>
          <TacticalView
            height={600}
            deployedCharacters={deployedCharacters}
            gameState={gameState}
            onCharacterPositionUpdate={(characterId: string, position: { x: number; z: number }) => {
              setDeployedCharacters(prev => prev.map(char => 
                char.id === characterId 
                  ? { ...char, deployPosition: position }
                  : char
              ));
            }}
          />
        </div>

        {/* Character Selection List or Mission Status */}
        <div>
          {gameState === 'setup' && (
            <div className="card h-full overflow-y-auto">
              <CharacterList
                onCharacterSelect={handleCharacterSelect}
                onCreateNew={() => setShowCharacterCreation(true)}
              />
            </div>
          )}
          
          {gameState !== 'setup' && (
            <div className="space-y-4">
              <div className="mission-status-panel">
                <h3 className="mission-status-title">Mission Status</h3>
                <div className="status-grid">
                  <div className="status-row">
                    <span className="status-label">State:</span>
                    <span className="status-value capitalize">{gameState}</span>
                  </div>
                  {(() => {
                    const stats = getSquadStats();
                    return stats && (
                      <>
                        <div className="status-row">
                          <span className="status-label">Squad Size:</span>
                          <span className="status-value">{stats.size}</span>
                        </div>
                        <div className="status-row">
                          <span className="status-label">Health:</span>
                          <span className="status-value">{stats.health}</span>
                        </div>
                        <div className="status-row">
                          <span className="status-label">Avg Level:</span>
                          <span className="status-value">{stats.averageLevel}</span>
                        </div>
                        <div className="status-row">
                          <span className="status-label">Ready:</span>
                          <span className="status-value">{stats.readyCount}/{stats.size}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="controls-panel">
                <h3 className="controls-title">Controls</h3>
                <ul className="controls-list">
                  <li>• Left click: Select units</li>
                  <li>• Right click: Deselect</li>
                  <li>• Click ground: Move unit</li>
                  <li>• Mouse wheel: Zoom</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
