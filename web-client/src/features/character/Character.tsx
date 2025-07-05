import React, { useState } from 'react';
import { Character as CharacterType } from '@shared/types';
import { CharacterList } from '../../components/CharacterList';
import { CharacterCreation } from '../../components/CharacterCreation';
import './Character.css';

type ViewMode = 'list' | 'create' | 'details';

export const Character: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null);

  const handleCreateNew = () => {
    setViewMode('create');
    setSelectedCharacter(null);
  };

  const handleCharacterCreated = (character: CharacterType) => {
    console.log('✅ Character created:', character);
    setSelectedCharacter(character);
    setViewMode('list');
    // Optionally show a success message
  };

  const handleCharacterSelect = (character: CharacterType) => {
    setSelectedCharacter(character);
    // Could switch to a detail view in the future
    console.log('🎯 Character selected:', character);
  };

  const handleCancel = () => {
    setViewMode('list');
  };

  return (
    <div className="character-page">
      <div className="character-page-header">
        <h1>Character Management</h1>
        <p>Create and manage your tactical operators</p>
      </div>

      <div className="character-content">
        {viewMode === 'list' && (
          <CharacterList
            onCreateNew={handleCreateNew}
            onCharacterSelect={handleCharacterSelect}
            selectedCharacterId={selectedCharacter?.id}
          />
        )}

        {viewMode === 'create' && (
          <CharacterCreation
            onCharacterCreated={handleCharacterCreated}
            onCancel={handleCancel}
          />
        )}

        {/* Future: Character details view */}
        {viewMode === 'details' && selectedCharacter && (
          <div className="character-details">
            <h2>Character Details</h2>
            <p>Detailed view for {selectedCharacter.name} - Coming soon!</p>
            <button onClick={() => setViewMode('list')}>
              ← Back to List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
