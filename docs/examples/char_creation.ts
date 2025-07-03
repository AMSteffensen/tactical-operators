import { z } from 'zod';
import { CHARACTER_CLASSES, GAME_CONFIG } from '@shared/constants';
import { CharacterSchema, CharacterClass, CharacterStats } from '@shared/types';
import { CharacterUtils } from '@shared/utils';

/**
 * Character Creation System
 * 
 * This example demonstrates how character creation works with:
 * - Class selection and starting stats
 * - Inventory slot allocation
 * - Initial equipment assignment
 * - Validation and persistence
 */

export interface CreateCharacterRequest {
  name: string;
  class: CharacterClass;
  userId: string;
}

export interface CreateCharacterResponse {
  success: boolean;
  character?: Character;
  error?: string;
}

export class CharacterCreationService {
  /**
   * Create a new character with starting stats and equipment
   */
  static async createCharacter(request: CreateCharacterRequest): Promise<CreateCharacterResponse> {
    try {
      // Validate character name
      if (!request.name || request.name.trim().length === 0) {
        return { success: false, error: 'Character name is required' };
      }

      if (request.name.length > 50) {
        return { success: false, error: 'Character name too long' };
      }

      // Get class configuration
      const classConfig = CHARACTER_CLASSES[request.class];
      if (!classConfig) {
        return { success: false, error: 'Invalid character class' };
      }

      // Calculate starting health based on endurance
      const maxHealth = CharacterUtils.calculateMaxHealth(1, classConfig.startingStats.endurance);

      // Create character data
      const characterData = {
        id: generateId(),
        name: request.name.trim(),
        class: request.class,
        level: 1,
        experience: 0,
        health: maxHealth,
        maxHealth,
        stats: classConfig.startingStats,
        inventory: await this.createStartingInventory(classConfig.startingEquipment),
        equipment: await this.createStartingEquipment(classConfig.startingEquipment),
        skills: [],
        traits: [],
        economy: {
          currency: GAME_CONFIG.STARTING_CURRENCY,
          bank: 0,
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Validate the character data
      const validatedCharacter = CharacterSchema.parse(characterData);

      // In a real implementation, this would save to database
      console.log('Creating character:', validatedCharacter);

      return {
        success: true,
        character: validatedCharacter,
      };
    } catch (error) {
      console.error('Character creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create starting inventory based on class equipment
   */
  private static async createStartingInventory(startingEquipment: string[]) {
    const inventory = [];
    
    for (const equipmentId of startingEquipment) {
      const item = await this.getItemById(equipmentId);
      if (item) {
        inventory.push(item);
      }
    }

    // Add some basic starting items
    inventory.push(
      await this.getItemById('rations'),
      await this.getItemById('water_bottle'),
      await this.getItemById('field_dressing')
    );

    return inventory.filter(Boolean);
  }

  /**
   * Create starting equipment loadout
   */
  private static async createStartingEquipment(startingEquipment: string[]) {
    const equipment: Record<string, any> = {};
    
    for (const equipmentId of startingEquipment) {
      const item = await this.getItemById(equipmentId);
      if (item) {
        // Determine equipment slot based on item type
        const slot = this.getEquipmentSlot(item);
        if (slot) {
          equipment[slot] = item;
        }
      }
    }

    return equipment;
  }

  /**
   * Get item by ID (placeholder - would query item database)
   */
  private static async getItemById(itemId: string) {
    // This would typically query a database or item registry
    const itemDatabase: Record<string, any> = {
      assault_rifle: {
        id: 'assault_rifle',
        name: 'M4A1 Assault Rifle',
        type: 'weapon',
        rarity: 'common',
        durability: 100,
        weight: 3.5,
        value: 800,
        properties: {
          damage: 35,
          range: 300,
          accuracy: 75,
          fireRate: 750,
        },
      },
      combat_armor: {
        id: 'combat_armor',
        name: 'Combat Vest',
        type: 'armor',
        rarity: 'common',
        durability: 100,
        weight: 2.0,
        value: 400,
        properties: {
          protection: 25,
          mobility: -5,
        },
      },
      first_aid_kit: {
        id: 'first_aid_kit',
        name: 'First Aid Kit',
        type: 'consumable',
        rarity: 'common',
        weight: 0.5,
        value: 50,
        properties: {
          healAmount: 50,
          uses: 3,
        },
      },
      rations: {
        id: 'rations',
        name: 'MRE Rations',
        type: 'consumable',
        rarity: 'common',
        weight: 0.3,
        value: 10,
        properties: {
          nutrition: 100,
        },
      },
      water_bottle: {
        id: 'water_bottle',
        name: 'Water Bottle',
        type: 'consumable',
        rarity: 'common',
        weight: 0.5,
        value: 5,
        properties: {
          hydration: 100,
        },
      },
      field_dressing: {
        id: 'field_dressing',
        name: 'Field Dressing',
        type: 'consumable',
        rarity: 'common',
        weight: 0.1,
        value: 15,
        properties: {
          healAmount: 20,
          stopsBleeding: true,
        },
      },
    };

    return itemDatabase[itemId] || null;
  }

  /**
   * Determine equipment slot for an item
   */
  private static getEquipmentSlot(item: any): string | null {
    switch (item.type) {
      case 'weapon':
        return 'primary_weapon';
      case 'armor':
        return 'chest_armor';
      case 'utility':
        return 'utility_slot';
      default:
        return null;
    }
  }
}

/**
 * Generate a unique ID (placeholder)
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Example usage:
 */
export async function exampleCharacterCreation() {
  const result = await CharacterCreationService.createCharacter({
    name: 'Sergeant Miller',
    class: 'assault',
    userId: 'user_123',
  });

  if (result.success && result.character) {
    console.log('Character created successfully:', result.character.name);
    console.log('Starting stats:', result.character.stats);
    console.log('Starting equipment:', result.character.equipment);
    console.log('Starting inventory:', result.character.inventory.length, 'items');
  } else {
    console.error('Character creation failed:', result.error);
  }
}
