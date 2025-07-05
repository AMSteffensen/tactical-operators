// Character API service for frontend
import { Character, CharacterClass, CharacterStats } from '@shared/types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

export interface CreateCharacterData {
  name: string;
  class: CharacterClass;
  stats?: CharacterStats;
}

export interface UpdateCharacterData {
  name?: string;
  stats?: CharacterStats;
  inventory?: any[];
  equipment?: Record<string, any>;
  economy?: {
    currency: number;
    bank?: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

class CharacterService {
  // Development user ID - in production this would come from authentication
  private readonly DEV_USER_ID = 'dev-user-1';

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}/character${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Include cookies for authentication
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`CharacterService error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get all characters for the current user
   */
  async getCharacters(): Promise<ApiResponse<{ characters: Character[] }>> {
    return this.makeRequest(`/?userId=${this.DEV_USER_ID}`);
  }

  /**
   * Get a specific character by ID
   */
  async getCharacter(id: string): Promise<ApiResponse<{ character: Character }>> {
    return this.makeRequest(`/${id}`);
  }

  /**
   * Create a new character
   */
  async createCharacter(characterData: CreateCharacterData): Promise<ApiResponse<{ character: Character }>> {
    // Add development user ID to the character data
    const dataWithUserId = {
      ...characterData,
      userId: this.DEV_USER_ID,
    };
    
    return this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify(dataWithUserId),
    });
  }

  /**
   * Update an existing character
   */
  async updateCharacter(
    id: string,
    updates: UpdateCharacterData
  ): Promise<ApiResponse<{ character: Character }>> {
    return this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a character (soft delete)
   */
  async deleteCharacter(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get character class information
   */
  getCharacterClassInfo(characterClass: CharacterClass) {
    const classInfo = {
      assault: {
        name: 'Assault',
        description: 'Front-line combat specialist with high strength and endurance',
        primaryStats: ['strength', 'endurance', 'agility'],
        startingSkills: ['rifle_proficiency', 'close_quarters_combat'],
        color: '#ff4444', // Red
      },
      sniper: {
        name: 'Sniper',
        description: 'Long-range specialist with exceptional marksmanship and stealth',
        primaryStats: ['marksmanship', 'intelligence', 'agility'],
        startingSkills: ['long_range_shooting', 'stealth'],
        color: '#44ff44', // Green
      },
      medic: {
        name: 'Medic',
        description: 'Medical specialist focused on healing and support',
        primaryStats: ['medical', 'intelligence', 'endurance'],
        startingSkills: ['first_aid', 'battlefield_medicine'],
        color: '#4444ff', // Blue
      },
      engineer: {
        name: 'Engineer',
        description: 'Technical specialist with equipment expertise and problem-solving skills',
        primaryStats: ['intelligence', 'agility', 'medical'],
        startingSkills: ['tech_specialist', 'equipment_repair'],
        color: '#ffaa00', // Orange
      },
      demolitions: {
        name: 'Demolitions',
        description: 'Explosives expert with tactical destruction capabilities',
        primaryStats: ['strength', 'intelligence', 'endurance'],
        startingSkills: ['explosives_handling', 'breach_tactics'],
        color: '#aa44ff', // Purple
      },
    };

    return classInfo[characterClass];
  }

  /**
   * Calculate character's total level based on experience
   */
  calculateLevel(experience: number): number {
    // Simple level calculation: 100 XP per level
    return Math.floor(experience / 100) + 1;
  }

  /**
   * Calculate experience needed for next level
   */
  getExperienceForNextLevel(experience: number): number {
    const currentLevel = this.calculateLevel(experience);
    return currentLevel * 100 - experience;
  }

  /**
   * Get character's combat effectiveness rating
   */
  getCombatRating(character: Character): number {
    const stats = character.stats;
    const combatStats = [
      stats.strength,
      stats.agility,
      stats.marksmanship,
      stats.endurance,
    ];
    
    return Math.round(combatStats.reduce((sum, stat) => sum + stat, 0) / combatStats.length);
  }
}

export const characterService = new CharacterService();
