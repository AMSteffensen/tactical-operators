import React, { useState } from 'react';
import { Character } from '@shared/types';
import { SquadSelectionScreen } from './SquadSelectionScreen';
import { DeploymentScreen } from './DeploymentScreen';
import { GameplayScreen } from './GameplayScreen';
import './DistracationFreeGame.css';

interface DeployedCharacter extends Character {
  isDeployed: boolean;
  deployPosition?: { x: number; z: number };
  currentHealth: number;
  status: 'ready' | 'moving' | 'action' | 'wounded' | 'down';
}

type GameFlow = 'squad-selection' | 'deployment' | 'gameplay';

interface DistractionFreeGameProps {
  className?: string;
}

export const DistractionFreeGame: React.FC<DistractionFreeGameProps> = ({ className = '' }) => {
  const [currentScreen, setCurrentScreen] = useState<GameFlow>('squad-selection');
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [deployedCharacters, setDeployedCharacters] = useState<DeployedCharacter[]>([]);

  // Handle squad selection completion
  const handleSquadSelected = (characters: Character[]) => {
    setSelectedCharacters(characters);
    setCurrentScreen('deployment');
  };

  // Handle deployment completion
  const handleDeploymentComplete = (deployed: DeployedCharacter[]) => {
    setDeployedCharacters(deployed);
    setCurrentScreen('gameplay');
  };

  // Handle back to squad selection from deployment
  const handleBackToSquadSelection = () => {
    setCurrentScreen('squad-selection');
  };

  // Handle exit from gameplay
  const handleExitGame = () => {
    // Reset all state and go back to squad selection
    setSelectedCharacters([]);
    setDeployedCharacters([]);
    setCurrentScreen('squad-selection');
  };

  return (
    <div className={`distraction-free-game ${className}`}>
      {currentScreen === 'squad-selection' && (
        <SquadSelectionScreen
          onSquadSelected={handleSquadSelected}
          onCancel={undefined} // No cancel on first screen
        />
      )}

      {currentScreen === 'deployment' && (
        <DeploymentScreen
          selectedCharacters={selectedCharacters}
          onDeploymentComplete={handleDeploymentComplete}
          onBack={handleBackToSquadSelection}
        />
      )}

      {currentScreen === 'gameplay' && (
        <GameplayScreen
          deployedCharacters={deployedCharacters}
          onExitGame={handleExitGame}
        />
      )}
    </div>
  );
};
