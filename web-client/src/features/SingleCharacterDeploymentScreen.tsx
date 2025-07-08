import React, { useState } from 'react';
import { Character } from '@shared/types';
import { TacticalView } from '../components/TacticalView';
import './SingleCharacterDeploymentScreen.css';

interface SingleCharacterDeploymentScreenProps {
  selectedCharacter: Character;
  onDeploymentComplete: (deployedCharacter: DeployedCharacter) => void;
  onBack: () => void;
}

interface DeployedCharacter extends Character {
  isDeployed: boolean;
  deployPosition?: { x: number; z: number };
  currentHealth: number;
  status: 'ready' | 'moving' | 'action' | 'wounded' | 'down';
}

export const SingleCharacterDeploymentScreen: React.FC<SingleCharacterDeploymentScreenProps> = ({
  selectedCharacter,
  onDeploymentComplete,
  onBack
}) => {
  const [deployedCharacter, setDeployedCharacter] = useState<DeployedCharacter | null>(null);

  const handleCharacterPositionUpdate = (_characterId: string, position: { x: number; z: number }) => {
    setDeployedCharacter(prev => prev ? {
      ...prev,
      deployPosition: position
    } : null);
  };

  const handleAutoDeploy = () => {
    const deployed: DeployedCharacter = {
      ...selectedCharacter,
      isDeployed: true,
      deployPosition: { x: 0, z: -5 }, // Default spawn position
      currentHealth: selectedCharacter.health || selectedCharacter.maxHealth || 100,
      status: 'ready'
    };
    
    setDeployedCharacter(deployed);
  };

  const handleStartMission = () => {
    if (deployedCharacter) {
      onDeploymentComplete(deployedCharacter);
    }
  };

  const getCharacterClassInfo = () => {
    // Import characterService if needed, or implement inline
    const classColors: Record<string, string> = {
      assault: '#ff4444',
      sniper: '#44ff44', 
      medic: '#4444ff',
      engineer: '#ffaa00',
      demolitions: '#ff44ff'
    };
    
    return {
      color: classColors[selectedCharacter.class] || '#666',
      name: selectedCharacter.class.charAt(0).toUpperCase() + selectedCharacter.class.slice(1)
    };
  };

  const characterInfo = getCharacterClassInfo();

  return (
    <div className="single-character-deployment-screen">
      {/* Header */}
      <div className="deployment-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Character Selection
        </button>
        <h1 className="deployment-title">Deploy Your Operator</h1>
        <div className="deployment-subtitle">
          Position {selectedCharacter.name} for the mission
        </div>
      </div>

      {/* Deployment Content */}
      <div className="deployment-content">
        {/* Character Info Panel */}
        <div className="character-info-panel">
          <div className="character-summary">
            <div className="character-avatar" style={{ backgroundColor: characterInfo.color }}>
              {selectedCharacter.name.charAt(0).toUpperCase()}
            </div>
            <div className="character-details">
              <h3 className="character-name">{selectedCharacter.name}</h3>
              <p className="character-class">{characterInfo.name}</p>
              <p className="character-health">
                Health: {selectedCharacter.health}/{selectedCharacter.maxHealth}
              </p>
            </div>
          </div>

          <div className="deployment-status">
            <h4>Deployment Status</h4>
            {deployedCharacter ? (
              <div className="status-deployed">
                <span className="status-icon">✓</span>
                <div className="status-info">
                  <p><strong>Deployed</strong></p>
                  <p>Position: ({deployedCharacter.deployPosition?.x.toFixed(1)}, {deployedCharacter.deployPosition?.z.toFixed(1)})</p>
                  <p>Status: {deployedCharacter.status}</p>
                </div>
              </div>
            ) : (
              <div className="status-not-deployed">
                <span className="status-icon">⏳</span>
                <div className="status-info">
                  <p><strong>Awaiting Deployment</strong></p>
                  <p>Click on the tactical map to position your character</p>
                </div>
              </div>
            )}
          </div>

          <div className="deployment-instructions">
            <h4>Instructions</h4>
            <ul>
              <li>Click on the tactical map to position your character</li>
              <li>Choose a strategic starting position</li>
              <li>Avoid placing near enemy spawn points</li>
              <li>Use cover and high ground when possible</li>
            </ul>
          </div>

          <div className="deployment-actions">
            <button 
              className="auto-deploy-button"
              onClick={handleAutoDeploy}
            >
              Auto Deploy
            </button>
            
            <button
              className="start-mission-button"
              onClick={handleStartMission}
              disabled={!deployedCharacter}
            >
              🚀 Start Mission
            </button>
          </div>
        </div>

        {/* Tactical Map */}
        <div className="tactical-map-container">
          <TacticalView
            deployedCharacters={deployedCharacter ? [deployedCharacter] : []}
            gameState="deployment"
            onCharacterPositionUpdate={handleCharacterPositionUpdate}
            height="100%"
            singleCharacterMode={true}
          />
        </div>
      </div>
    </div>
  );
};
