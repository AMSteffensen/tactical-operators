import React, { useState } from 'react';
import { CharacterClass, CharacterStats, Gun } from '@shared/types';
import { characterService, CreateCharacterData } from '../services/CharacterService';
import './CharacterCreation.css';

interface CharacterCreationProps {
  onCharacterCreated?: (character: any) => void;
  onCancel?: () => void;
}

const CHARACTER_CLASSES: CharacterClass[] = ['assault', 'sniper', 'medic', 'engineer', 'demolitions'];

export const CharacterCreation: React.FC<CharacterCreationProps> = ({
  onCharacterCreated,
  onCancel,
}) => {
  const defaultPistol: Gun = {
    id: 'pistol_1',
    name: 'Pistol',
    type: 'weapon',
    rarity: 'common',
    durability: 100,
    weight: 1,
    value: 50,
    properties: {},
    ammo: 12,
    maxAmmo: 12,
    reloadTime: 1.5,
    damage: 10,
    icon: '/src/assets/icons/pistol.svg',
    slot: 2,
  };

  const [formData, setFormData] = useState<CreateCharacterData & { inventory?: any[] }>({
    name: '',
    class: 'assault',
    stats: {
      strength: 50,
      agility: 50,
      intelligence: 50,
      endurance: 50,
      marksmanship: 50,
      medical: 50,
    },
    inventory: [defaultPistol],
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>('');
  const [availablePoints, setAvailablePoints] = useState(50); // Points to distribute

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
    setError('');
  };

  const handleClassChange = (selectedClass: CharacterClass) => {
    // Reset stats to class defaults when class changes
    const baseStats = generateDefaultStatsForClass(selectedClass);
    
    setFormData({
      ...formData,
      class: selectedClass,
      stats: baseStats,
    });
    setAvailablePoints(50); // Reset available points
  };

  const handleStatChange = (stat: keyof CharacterStats, value: number) => {
    if (!formData.stats) return;

    const currentValue = formData.stats[stat];
    const difference = value - currentValue;
    
    // Check if we have enough points
    if (difference > availablePoints) return;
    
    // Ensure stat stays within bounds
    if (value < 10 || value > 100) return;

    setFormData({
      ...formData,
      stats: {
        ...formData.stats,
        [stat]: value,
      },
    });
    
    setAvailablePoints(availablePoints - difference);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Character name is required');
      return;
    }

    if (formData.name.length < 2) {
      setError('Character name must be at least 2 characters');
      return;
    }

    setIsCreating(true);
    setError('');

    // Always include the default pistol in inventory
    const payload = {
      ...formData,
      inventory: [defaultPistol],
    };

    try {
      const response = await characterService.createCharacter(payload);
      
      if (response.success && response.data) {
        console.log('✅ Character created successfully:', response.data.character);
        onCharacterCreated?.(response.data.character);
      } else {
        setError(response.error || 'Failed to create character');
      }
    } catch (err) {
      console.error('❌ Error creating character:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const resetStats = () => {
    const baseStats = generateDefaultStatsForClass(formData.class);
    setFormData({
      ...formData,
      stats: baseStats,
    });
    setAvailablePoints(50);
  };

  const selectedClassInfo = characterService.getCharacterClassInfo(formData.class);

  return (
    <div className="character-creation">
      <div className="character-creation-header">
        <h2>Create New Character</h2>
        <p>Design your tactical operator for combat missions</p>
      </div>

      <form onSubmit={handleSubmit} className="character-form">
        {/* Character Name */}
        <div className="form-section">
          <label htmlFor="character-name" className="form-label">
            Character Name
          </label>
          <input
            id="character-name"
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="Enter character name..."
            className="form-input"
            maxLength={50}
            required
          />
        </div>

        {/* Character Class Selection */}
        <div className="form-section">
          <label className="form-label">Class</label>
          <div className="class-selection">
            {CHARACTER_CLASSES.map((cls) => {
              const classInfo = characterService.getCharacterClassInfo(cls);
              return (
                <div
                  key={cls}
                  className={`class-option ${formData.class === cls ? 'selected' : ''}`}
                  onClick={() => handleClassChange(cls)}
                >
                  <div 
                    className="class-icon"
                    style={{ backgroundColor: classInfo.color }}
                  >
                    {cls.charAt(0).toUpperCase()}
                  </div>
                  <div className="class-info">
                    <h4>{classInfo.name}</h4>
                    <p>{classInfo.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Class Details */}
        <div className="form-section">
          <div className="class-details">
            <h3>
              <span 
                className="class-badge"
                style={{ backgroundColor: selectedClassInfo.color }}
              >
                {selectedClassInfo.name}
              </span>
            </h3>
            <p>{selectedClassInfo.description}</p>
            <div className="starting-skills">
              <strong>Starting Skills:</strong>
              <div className="skills-list">
                {selectedClassInfo.startingSkills.map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stat Allocation */}
        <div className="form-section">
          <div className="stats-header">
            <label className="form-label">Stats</label>
            <div className="points-remaining">
              Available Points: <strong>{availablePoints}</strong>
            </div>
          </div>
          
          <div className="stats-grid">
            {Object.entries(formData.stats || {}).map(([statName, value]) => (
              <div key={statName} className="stat-control">
                <label className="stat-label">
                  {statName.charAt(0).toUpperCase() + statName.slice(1)}
                </label>
                <div className="stat-input-group">
                  <button
                    type="button"
                    className="stat-button"
                    onClick={() => handleStatChange(statName as keyof CharacterStats, value - 1)}
                    disabled={value <= 10}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleStatChange(statName as keyof CharacterStats, parseInt(e.target.value) || 0)}
                    className="stat-input"
                    min={10}
                    max={100}
                  />
                  <button
                    type="button"
                    className="stat-button"
                    onClick={() => handleStatChange(statName as keyof CharacterStats, value + 1)}
                    disabled={value >= 100 || availablePoints <= 0}
                  >
                    +
                  </button>
                </div>
                <div className="stat-bar">
                  <div 
                    className="stat-fill"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button type="button" onClick={resetStats} className="reset-stats-button">
            Reset to Class Defaults
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="create-button"
            disabled={isCreating || !formData.name.trim()}
          >
            {isCreating ? 'Creating...' : 'Create Character'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Helper function to generate default stats for a class
function generateDefaultStatsForClass(characterClass: CharacterClass): CharacterStats {
  const baseStats = {
    strength: 40,
    agility: 40,
    intelligence: 40,
    endurance: 40,
    marksmanship: 40,
    medical: 40,
  };

  switch (characterClass) {
    case 'assault':
      return {
        ...baseStats,
        strength: 60,
        endurance: 55,
        agility: 50,
      };
    case 'sniper':
      return {
        ...baseStats,
        marksmanship: 65,
        intelligence: 50,
        agility: 50,
      };
    case 'medic':
      return {
        ...baseStats,
        medical: 70,
        intelligence: 55,
        endurance: 45,
      };
    case 'engineer':
      return {
        ...baseStats,
        intelligence: 65,
        agility: 55,
        strength: 35,
      };
    case 'demolitions':
      return {
        ...baseStats,
        strength: 55,
        intelligence: 50,
        endurance: 50,
      };
    default:
      return baseStats;
  }
}
