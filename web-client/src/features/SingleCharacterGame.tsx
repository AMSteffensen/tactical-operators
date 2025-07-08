import React, { useState } from 'react';
import { Character } from '@shared/types';
import { SingleCharacterSelectionScreen } from './SingleCharacterSelectionScreen';
import { SingleCharacterDeploymentScreen } from './SingleCharacterDeploymentScreen';
import { GameplayScreen } from './GameplayScreen';
import './SingleCharacterGame.css';

type GameFlow = 'character-selection' | 'deployment' | 'gameplay';

interface DeployedCharacter extends Character {
  isDeployed: boolean;
  deployPosition?: { x: number; z: number };
  currentHealth: number;
  status: 'ready' | 'moving' | 'action' | 'wounded' | 'down';
}

interface SingleCharacterGameProps {
  className?: string;
}

export const SingleCharacterGame: React.FC<SingleCharacterGameProps> = ({ className = '' }) => {
  const [currentScreen, setCurrentScreen] = useState<GameFlow>('character-selection');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [deployedCharacter, setDeployedCharacter] = useState<DeployedCharacter | null>(null);

  // Handle character selection completion
  const handleCharacterSelected = (character: Character) => {
    setSelectedCharacter(character);
    setCurrentScreen('deployment');
  };

  // Handle deployment completion
  const handleDeploymentComplete = (deployed: DeployedCharacter) => {
    setDeployedCharacter(deployed);
    setCurrentScreen('gameplay');
  };

  // Handle back to character selection from deployment
  const handleBackToCharacterSelection = () => {
    setCurrentScreen('character-selection');
    setSelectedCharacter(null);
    setDeployedCharacter(null);
  };

  // Handle exit from gameplay
  const handleExitGame = () => {
    // Reset all state and go back to character selection
    setSelectedCharacter(null);
    setDeployedCharacter(null);
    setCurrentScreen('character-selection');
  };

  return (
    <div className={`single-character-game ${className}`}>
      {currentScreen === 'character-selection' && (
        <SingleCharacterSelectionScreen
          onCharacterSelected={handleCharacterSelected}
          onCancel={undefined} // No cancel on first screen
        />
      )}

      {currentScreen === 'deployment' && selectedCharacter && (
        <SingleCharacterDeploymentScreen
          selectedCharacter={selectedCharacter}
          onDeploymentComplete={handleDeploymentComplete}
          onBack={handleBackToCharacterSelection}
        />
      )}

      {currentScreen === 'gameplay' && deployedCharacter && (
        <GameplayScreen
          deployedCharacters={[deployedCharacter]} // Single character array
          onExitGame={handleExitGame}
          singleCharacterMode={true}
        />
      )}
    </div>
  );
};
