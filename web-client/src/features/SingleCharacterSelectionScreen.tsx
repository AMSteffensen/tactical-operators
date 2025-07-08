import React, { useState, useEffect } from 'react';
import { Character } from '@shared/types';
import { characterService } from '../services/CharacterService';
import { CharacterCreation } from '../components/CharacterCreation';
import './SingleCharacterSelectionScreen.css';

interface SingleCharacterSelectionScreenProps {
  onCharacterSelected: (character: Character) => void;
  onCancel?: () => void;
}

export const SingleCharacterSelectionScreen: React.FC<SingleCharacterSelectionScreenProps> = ({
  onCharacterSelected,
  onCancel
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadCharacters();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

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

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handlePlayWithCharacter = () => {
    if (selectedCharacter) {
      onCharacterSelected(selectedCharacter);
    }
  };

  const handleCreateCharacter = () => {
    setShowCharacterCreation(true);
  };

  const handleCharacterCreated = () => {
    setShowCharacterCreation(false);
    loadCharacters(); // Refresh the list
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

  if (showCharacterCreation) {
    return (
      <div className="single-character-selection-screen">
        <CharacterCreation
          onCharacterCreated={handleCharacterCreated}
          onCancel={() => setShowCharacterCreation(false)}
        />
      </div>
    );
  }

  return (
    <div className="single-character-selection-screen">
      {/* Header */}
      <div className="selection-header">
        <h1 className="screen-title">Choose Your Operator</h1>
        <p className="screen-subtitle">
          Select a character for single-player tactical operations
        </p>
        
        <div className="header-controls">
          {onCancel && (
            <button className="cancel-button" onClick={onCancel}>
              ← Back
            </button>
          )}
          
          <div className="menu-button-container">
            <button 
              className="menu-button" 
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              ☰ Menu
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                <a href="/" className="menu-item">🏠 Home</a>
                <a href="/character" className="menu-item">👤 Characters</a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Character Selection */}
      <div className="character-selection-content">
        {/* Available Characters */}
        <div className="characters-section">
          <div className="section-header">
            <h2>Available Characters</h2>
            <button 
              className="create-character-button"
              onClick={handleCreateCharacter}
            >
              + Create New Character
            </button>
          </div>

          {isLoading && (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Loading characters...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>❌ {error}</p>
              <button onClick={loadCharacters} className="retry-button">
                Try Again
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {characters.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎯</div>
                  <h3>No Characters Yet</h3>
                  <p>Create your first tactical operator to begin missions.</p>
                  <button onClick={handleCreateCharacter} className="create-first-button">
                    Create Your First Character
                  </button>
                </div>
              ) : (
                <div className="characters-grid">
                  {characters.map((character) => {
                    const classInfo = getCharacterClassInfo(character.class);
                    const level = formatLevel(character.experience);
                    const combatRating = getCombatRating(character);
                    const isSelected = selectedCharacter?.id === character.id;

                    return (
                      <div
                        key={character.id}
                        className={`character-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleCharacterSelect(character)}
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
                          {isSelected && (
                            <div className="selected-indicator">
                              ✓
                            </div>
                          )}
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
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Character Preview & Controls */}
        {selectedCharacter && (
          <div className="character-preview">
            <h2>Selected Character</h2>
            
            <div className="preview-card">
              <div className="preview-header">
                <div 
                  className="preview-avatar" 
                  style={{ backgroundColor: getCharacterClassInfo(selectedCharacter.class).color }}
                >
                  {selectedCharacter.name.charAt(0).toUpperCase()}
                </div>
                <div className="preview-info">
                  <h3>{selectedCharacter.name}</h3>
                  <p className="preview-class">
                    {getCharacterClassInfo(selectedCharacter.class).name} • Level {formatLevel(selectedCharacter.experience)}
                  </p>
                </div>
              </div>

              <div className="preview-stats">
                <div className="stat-grid">
                  <div className="stat-item">
                    <span className="stat-name">Strength</span>
                    <span className="stat-number">{selectedCharacter.stats?.strength || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-name">Agility</span>
                    <span className="stat-number">{selectedCharacter.stats?.agility || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-name">Intelligence</span>
                    <span className="stat-number">{selectedCharacter.stats?.intelligence || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-name">Endurance</span>
                    <span className="stat-number">{selectedCharacter.stats?.endurance || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-name">Marksmanship</span>
                    <span className="stat-number">{selectedCharacter.stats?.marksmanship || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-name">Medical</span>
                    <span className="stat-number">{selectedCharacter.stats?.medical || 0}</span>
                  </div>
                </div>
              </div>

              <div className="preview-description">
                <p>{getCharacterClassInfo(selectedCharacter.class).description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="selection-info">
          {selectedCharacter ? (
            <span className="selected-character-info">
              Ready to deploy: <strong>{selectedCharacter.name}</strong>
            </span>
          ) : (
            <span className="no-selection">
              Select a character to continue
            </span>
          )}
        </div>
        
        <div className="action-buttons">
          <button
            className="play-button"
            onClick={handlePlayWithCharacter}
            disabled={!selectedCharacter}
          >
            🎮 Play as {selectedCharacter?.name || 'Character'}
          </button>
        </div>
      </div>
    </div>
  );
};
