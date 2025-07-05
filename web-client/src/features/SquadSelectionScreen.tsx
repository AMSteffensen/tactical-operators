import React, { useState } from 'react';
import { Character } from '@shared/types';
import { CharacterList } from '../components/CharacterList';
import { CharacterCreation } from '../components/CharacterCreation';
import './SquadSelectionScreen.css';

interface SquadSelectionScreenProps {
  onSquadSelected: (characters: Character[]) => void;
  onCancel?: () => void;
}

export const SquadSelectionScreen: React.FC<SquadSelectionScreenProps> = ({
  onSquadSelected,
  onCancel
}) => {
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);

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

  const handleConfirmSelection = () => {
    if (selectedCharacters.length === 0) {
      alert('Please select at least one character');
      return;
    }
    onSquadSelected(selectedCharacters);
  };

  const handleCharacterCreated = () => {
    setShowCharacterCreation(false);
    // The CharacterList component will automatically refresh with the new character
  };

  if (showCharacterCreation) {
    return (
      <div className="squad-selection-screen">
        <div className="creation-container">
          <CharacterCreation
            onCharacterCreated={handleCharacterCreated}
            onCancel={() => setShowCharacterCreation(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="squad-selection-screen">
      {/* Header */}
      <div className="selection-header">
        <h1 className="screen-title">Squad Selection</h1>
        <p className="screen-subtitle">
          Choose up to 4 characters for your tactical mission
        </p>
        {onCancel && (
          <button 
            className="cancel-button"
            onClick={onCancel}
          >
            ← Back
          </button>
        )}
      </div>

      {/* Selected Squad Preview */}
      {selectedCharacters.length > 0 && (
        <div className="selected-squad-preview">
          <h3>Selected Squad ({selectedCharacters.length}/4)</h3>
          <div className="squad-grid">
            {selectedCharacters.map(char => (
              <div key={char.id} className="selected-character-card">
                <div className="character-avatar">
                  {char.name.charAt(0).toUpperCase()}
                </div>
                <div className="character-info">
                  <div className="character-name">{char.name}</div>
                  <div className="character-class">{char.class}</div>
                  <div className="character-stats">
                    HP: {char.health || char.maxHealth || 100}
                  </div>
                </div>
                <button
                  className="remove-character"
                  onClick={() => handleCharacterSelect(char)}
                  title="Remove from squad"
                >
                  ×
                </button>
              </div>
            ))}
            {/* Fill empty slots */}
            {Array.from({ length: 4 - selectedCharacters.length }).map((_, index) => (
              <div key={`empty-${index}`} className="empty-slot">
                <div className="empty-slot-content">
                  <div className="plus-icon">+</div>
                  <div className="empty-text">Empty Slot</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Character Selection Area */}
      <div className="character-selection-area">
        <div className="selection-controls">
          <h3>Available Characters</h3>
          <button
            className="create-character-button"
            onClick={() => setShowCharacterCreation(true)}
          >
            + Create New Character
          </button>
        </div>

        <div className="character-list-container">
          <CharacterList
            onCharacterSelect={handleCharacterSelect}
            selectedCharacterIds={selectedCharacters.map(c => c.id)}
            showSelectionState={true}
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="squad-summary">
          <span className="squad-count">
            {selectedCharacters.length} character{selectedCharacters.length !== 1 ? 's' : ''} selected
          </span>
          {selectedCharacters.length > 0 && (
            <span className="squad-stats">
              Avg Level: {Math.round(
                selectedCharacters.reduce((sum, char) => sum + (char.level || 1), 0) / selectedCharacters.length
              )}
            </span>
          )}
        </div>
        
        <div className="action-buttons">
          <button
            className="proceed-button"
            onClick={handleConfirmSelection}
            disabled={selectedCharacters.length === 0}
          >
            Proceed to Deployment →
          </button>
        </div>
      </div>
    </div>
  );
};
