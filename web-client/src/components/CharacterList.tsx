import React, { useState, useEffect } from 'react';
import { Character } from '@shared/types';
import { characterService } from '../services/CharacterService';
import './CharacterList.css';

interface CharacterListProps {
  onCharacterSelect?: (character: Character) => void;
  onCreateNew?: () => void;
  selectedCharacterId?: string;
  selectedCharacterIds?: string[];
  showSelectionState?: boolean;
}

export const CharacterList: React.FC<CharacterListProps> = ({
  onCharacterSelect,
  onCreateNew,
  selectedCharacterId,
  selectedCharacterIds = [],
  showSelectionState = false,
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await characterService.getCharacters();

      if (response.success && response.data) {
        setCharacters(response.data.characters);
      } else {
        setError(response.error || 'Failed to load characters');
      }
    } catch (err) {
      console.error('❌ Error loading characters:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCharacter = async (character: Character, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent character selection

    if (!window.confirm(`Are you sure you want to delete "${character.name}"?`)) {
      return;
    }

    try {
      const response = await characterService.deleteCharacter(character.id);

      if (response.success) {
        // Remove from local state
        setCharacters(characters.filter((c) => c.id !== character.id));
        console.log('✅ Character deleted successfully');
      } else {
        alert(response.error || 'Failed to delete character');
      }
    } catch (err) {
      console.error('❌ Error deleting character:', err);
      alert('An unexpected error occurred');
    }
  };

  const getCharacterClassInfo = (characterClass: string) => {
    return characterService.getCharacterClassInfo(characterClass as any);
  };

  const formatLevel = (experience: number) => {
    return characterService.calculateLevel(experience);
  };

  const getCombatRating = (character: Character) => {
    return characterService.getCombatRating(character);
  };

  if (isLoading) {
    return (
      <div className="character-list">
        <div className="character-list-header">
          <h2>Your Characters</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading characters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="character-list">
        <div className="character-list-header">
          <h2>Your Characters</h2>
        </div>
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={loadCharacters} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="character-list">
      <div className="character-list-header">
        <h2>Your Characters</h2>
        {onCreateNew && (
          <button onClick={onCreateNew} className="create-new-button">
            + Create New Character
          </button>
        )}
      </div>

      {characters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No Characters Yet</h3>
          <p>Create your first tactical operator to begin your missions.</p>
          {onCreateNew && (
            <button onClick={onCreateNew} className="create-first-button">
              Create Your First Character
            </button>
          )}
        </div>
      ) : (
        <div className="characters-grid">
          {characters.map((character) => {
            const classInfo = getCharacterClassInfo(character.class);
            const level = formatLevel(character.experience);
            const combatRating = getCombatRating(character);
            const isSelected = showSelectionState
              ? selectedCharacterIds.includes(character.id)
              : character.id === selectedCharacterId;

            return (
              <div
                key={character.id}
                className={`character-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onCharacterSelect?.(character)}
              >
                <div className="character-header">
                  <div className="character-avatar" style={{ backgroundColor: classInfo.color }}>
                    {character.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="character-info">
                    <h3 className="character-name">{character.name}</h3>
                    <div className="character-details">
                      <span className="character-class">{classInfo.name}</span>
                      <span className="character-level">Level {level}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteCharacter(character, e)}
                    className="delete-button"
                    title="Delete Character"
                  >
                    🗑️
                  </button>
                </div>

                <div className="character-stats">
                  <div className="stat-row">
                    <span className="stat-label">Health:</span>
                    <div className="health-bar">
                      <div
                        className="health-fill"
                        style={{ width: `${(character.health / character.maxHealth) * 100}%` }}
                      />
                      <span className="health-text">
                        {character.health}/{character.maxHealth}
                      </span>
                    </div>
                  </div>

                  <div className="stat-row">
                    <span className="stat-label">Combat Rating:</span>
                    <span className="stat-value">{combatRating}/100</span>
                  </div>

                  <div className="stat-row">
                    <span className="stat-label">Experience:</span>
                    <span className="stat-value">{character.experience} XP</span>
                  </div>

                  <div className="stat-row">
                    <span className="stat-label">Currency:</span>
                    <span className="stat-value currency">💰 {character.economy.currency}</span>
                  </div>
                </div>

                <div className="character-skills">
                  <div className="skills-label">Skills:</div>
                  <div className="skills-list">
                    {character.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="skill-tag">
                        {skill.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {character.skills.length > 3 && (
                      <span className="skill-tag more">+{character.skills.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="character-footer">
                  <span className="last-updated">
                    Updated {new Date(character.updatedAt).toLocaleDateString()}
                  </span>
                  {isSelected && (
                    <span className="selected-indicator">
                      {showSelectionState ? '✓ Selected for Squad' : '✓ Selected'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
