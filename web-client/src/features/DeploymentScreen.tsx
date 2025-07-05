import React, { useState, useEffect } from 'react';
import { Character } from '@shared/types';
import './DeploymentScreen.css';

interface DeployedCharacter extends Character {
  isDeployed: boolean;
  deployPosition?: { x: number; z: number };
  currentHealth: number;
  status: 'ready' | 'moving' | 'action' | 'wounded' | 'down';
}

interface DeploymentScreenProps {
  selectedCharacters: Character[];
  onDeploymentComplete: (deployedCharacters: DeployedCharacter[]) => void;
  onBack: () => void;
}

export const DeploymentScreen: React.FC<DeploymentScreenProps> = ({
  selectedCharacters,
  onDeploymentComplete,
  onBack
}) => {
  const [deployedCharacters, setDeployedCharacters] = useState<DeployedCharacter[]>([]);

  // Initialize deployment characters
  useEffect(() => {
    const initialDeployment: DeployedCharacter[] = selectedCharacters.map((char) => ({
      ...char,
      isDeployed: false,
      currentHealth: char.health || char.maxHealth || 100,
      status: 'ready' as const
    }));
    setDeployedCharacters(initialDeployment);
  }, [selectedCharacters]);

  // Generate deployment grid (4x3 for now)
  const deploymentGrid: Array<{
    position: { x: number; z: number };
    key: string;
    isOccupied: boolean;
    character?: DeployedCharacter;
  }> = [];
  const gridWidth = 4;
  const gridHeight = 3;
  
  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      const position = { x: col - 1.5, z: row - 1 }; // Center around origin
      const positionKey = `${position.x},${position.z}`;
      deploymentGrid.push({
        position,
        key: positionKey,
        isOccupied: deployedCharacters.some(char => 
          char.deployPosition && 
          char.deployPosition.x === position.x && 
          char.deployPosition.z === position.z
        ),
        character: deployedCharacters.find(char => 
          char.deployPosition && 
          char.deployPosition.x === position.x && 
          char.deployPosition.z === position.z
        )
      });
    }
  }

  const handleGridCellClick = (position: { x: number; z: number }) => {
    // Find undeployed character to deploy
    const undeployedCharacter = deployedCharacters.find(char => !char.isDeployed);
    
    if (undeployedCharacter) {
      setDeployedCharacters(prev => prev.map(char => 
        char.id === undeployedCharacter.id 
          ? { ...char, isDeployed: true, deployPosition: position }
          : char
      ));
    }
  };

  const handleCharacterRemove = (characterId: string) => {
    setDeployedCharacters(prev => prev.map(char => 
      char.id === characterId 
        ? { ...char, isDeployed: false, deployPosition: undefined }
        : char
    ));
  };

  const handleAutoDeploy = () => {
    const undeployedChars = deployedCharacters.filter(char => !char.isDeployed);
    const availablePositions = deploymentGrid.filter(cell => !cell.isOccupied);
    
    const newDeployment = [...deployedCharacters];
    undeployedChars.forEach((char, index) => {
      if (index < availablePositions.length) {
        const position = availablePositions[index].position;
        const charIndex = newDeployment.findIndex(c => c.id === char.id);
        if (charIndex !== -1) {
          newDeployment[charIndex] = {
            ...newDeployment[charIndex],
            isDeployed: true,
            deployPosition: position
          };
        }
      }
    });
    
    setDeployedCharacters(newDeployment);
  };

  const handleStartMission = () => {
    const allDeployedCharacters = deployedCharacters.filter(char => char.isDeployed);
    if (allDeployedCharacters.length === 0) {
      alert('Please deploy at least one character');
      return;
    }
    onDeploymentComplete(deployedCharacters);
  };

  const deployedCount = deployedCharacters.filter(char => char.isDeployed).length;
  const totalCharacters = deployedCharacters.length;

  return (
    <div className="deployment-screen">
      {/* Header */}
      <div className="deployment-header">
        <button className="back-button" onClick={onBack}>
          ← Squad Selection
        </button>
        <div className="header-content">
          <h1 className="screen-title">Tactical Deployment</h1>
          <p className="screen-subtitle">
            Position your squad members on the battlefield
          </p>
        </div>
        <div className="deployment-progress">
          {deployedCount}/{totalCharacters} Deployed
        </div>
      </div>

      {/* Main Content */}
      <div className="deployment-content">
        {/* Squad Panel */}
        <div className="squad-panel">
          <h3>Squad Members</h3>
          <div className="character-cards">
            {deployedCharacters.map(char => (
              <div 
                key={char.id} 
                className={`character-card ${char.isDeployed ? 'deployed' : 'undeployed'}`}
              >
                <div className="character-avatar">
                  {char.name.charAt(0).toUpperCase()}
                </div>
                <div className="character-details">
                  <div className="character-name">{char.name}</div>
                  <div className="character-class">{char.class}</div>
                  <div className="character-health">
                    HP: {char.currentHealth}/{char.maxHealth || 100}
                  </div>
                  <div className={`deployment-status ${char.isDeployed ? 'deployed' : 'pending'}`}>
                    {char.isDeployed ? 'Deployed' : 'Awaiting Deployment'}
                  </div>
                </div>
                {char.isDeployed && char.deployPosition && (
                  <button
                    className="remove-deployment"
                    onClick={() => handleCharacterRemove(char.id)}
                    title="Remove from battlefield"
                  >
                    ↺
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="squad-actions">
            <button 
              className="auto-deploy-button"
              onClick={handleAutoDeploy}
              disabled={deployedCount === totalCharacters}
            >
              Auto Deploy All
            </button>
          </div>
        </div>

        {/* Deployment Grid */}
        <div className="deployment-grid-container">
          <h3>Battlefield Deployment Zone</h3>
          <div className="deployment-grid">
            {deploymentGrid.map(cell => (
              <div
                key={cell.key}
                className={`grid-cell ${cell.isOccupied ? 'occupied' : 'empty'} ${
                  !cell.isOccupied && deployedCharacters.some(c => !c.isDeployed) ? 'available' : ''
                }`}
                onClick={() => !cell.isOccupied && handleGridCellClick(cell.position)}
              >
                {cell.character ? (
                  <div className="deployed-character">
                    <div className="deployed-avatar">
                      {cell.character.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="deployed-name">{cell.character.name}</div>
                  </div>
                ) : (
                  <div className="empty-indicator">
                    {deployedCharacters.some(c => !c.isDeployed) ? '+' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="grid-legend">
            <div className="legend-item">
              <div className="legend-color deployed"></div>
              <span>Deployed Character</span>
            </div>
            <div className="legend-item">
              <div className="legend-color available"></div>
              <span>Available Position</span>
            </div>
            <div className="legend-item">
              <div className="legend-color enemy"></div>
              <span>Enemy Territory</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="deployment-action-bar">
        <div className="deployment-summary">
          <div className="summary-item">
            <span className="summary-label">Characters Deployed:</span>
            <span className="summary-value">{deployedCount}/{totalCharacters}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Mission Readiness:</span>
            <span className={`summary-value ${deployedCount > 0 ? 'ready' : 'pending'}`}>
              {deployedCount > 0 ? 'Ready' : 'Pending'}
            </span>
          </div>
        </div>
        
        <div className="action-buttons">
          <button
            className="start-mission-button"
            onClick={handleStartMission}
            disabled={deployedCount === 0}
          >
            {deployedCount === totalCharacters ? '⚔️ Start Mission' : `▶️ Start with ${deployedCount} Characters`}
          </button>
        </div>
      </div>
    </div>
  );
};
