import { Character, Guild, Item } from '@shared/types';
import { GAME_CONFIG } from '@shared/constants';

/**
 * Economy Management System
 * 
 * This example demonstrates how character economy interacts with guild banks:
 * - Personal vs. guild currency management
 * - Item trading between characters and guilds
 * - Economic permissions and restrictions
 * - Transaction history and auditing
 */

export interface EconomyTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'purchase' | 'sale';
  amount: number;
  itemId?: string;
  fromEntity: string;
  toEntity: string;
  timestamp: Date;
  description: string;
}

export interface EconomyState {
  personalCurrency: number;
  guildCurrency: number;
  pendingTransactions: EconomyTransaction[];
  transactionHistory: EconomyTransaction[];
}

export class EconomyManager {
  private character: Character;
  private guild: Guild | null;
  private transactions: EconomyTransaction[] = [];

  constructor(character: Character, guild: Guild | null = null) {
    this.character = character;
    this.guild = guild;
  }

  /**
   * Deposit currency from character to guild bank
   */
  async depositToGuild(amount: number): Promise<{ success: boolean; error?: string }> {
    if (!this.guild) {
      return { success: false, error: 'No guild available' };
    }

    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    if (this.character.economy.currency < amount) {
      return { success: false, error: 'Insufficient personal funds' };
    }

    // Check guild permissions
    if (!this.canDepositToGuild()) {
      return { success: false, error: 'No permission to deposit to guild bank' };
    }

    // Execute transaction
    this.character.economy.currency -= amount;
    this.guild.bank.currency += amount;

    // Record transaction
    await this.recordTransaction({
      id: this.generateTransactionId(),
      type: 'deposit',
      amount,
      fromEntity: `character:${this.character.id}`,
      toEntity: `guild:${this.guild.id}`,
      timestamp: new Date(),
      description: `Deposited ${amount} credits to guild bank`,
    });

    return { success: true };
  }

  /**
   * Withdraw currency from guild bank to character
   */
  async withdrawFromGuild(amount: number): Promise<{ success: boolean; error?: string }> {
    if (!this.guild) {
      return { success: false, error: 'No guild available' };
    }

    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    if (this.guild.bank.currency < amount) {
      return { success: false, error: 'Insufficient guild funds' };
    }

    // Check guild permissions
    if (!this.canWithdrawFromGuild(amount)) {
      return { success: false, error: 'No permission to withdraw from guild bank' };
    }

    // Execute transaction
    this.guild.bank.currency -= amount;
    this.character.economy.currency += amount;

    // Record transaction
    await this.recordTransaction({
      id: this.generateTransactionId(),
      type: 'withdrawal',
      amount,
      fromEntity: `guild:${this.guild.id}`,
      toEntity: `character:${this.character.id}`,
      timestamp: new Date(),
      description: `Withdrew ${amount} credits from guild bank`,
    });

    return { success: true };
  }

  /**
   * Transfer item from character to guild inventory
   */
  async transferItemToGuild(itemId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.guild) {
      return { success: false, error: 'No guild available' };
    }

    const itemIndex = this.character.inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return { success: false, error: 'Item not found in character inventory' };
    }

    if (!this.canTransferItemToGuild()) {
      return { success: false, error: 'No permission to transfer items to guild' };
    }

    const item = this.character.inventory[itemIndex];

    // Remove from character inventory
    this.character.inventory.splice(itemIndex, 1);

    // Add to guild inventory
    this.guild.bank.inventory.push(item);

    // Record transaction
    await this.recordTransaction({
      id: this.generateTransactionId(),
      type: 'transfer',
      amount: 0,
      itemId: item.id,
      fromEntity: `character:${this.character.id}`,
      toEntity: `guild:${this.guild.id}`,
      timestamp: new Date(),
      description: `Transferred ${item.name} to guild inventory`,
    });

    return { success: true };
  }

  /**
   * Take item from guild inventory to character
   */
  async takeItemFromGuild(itemId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.guild) {
      return { success: false, error: 'No guild available' };
    }

    const itemIndex = this.guild.bank.inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return { success: false, error: 'Item not found in guild inventory' };
    }

    if (!this.canTakeItemFromGuild()) {
      return { success: false, error: 'No permission to take items from guild' };
    }

    const item = this.guild.bank.inventory[itemIndex];

    // Check character carrying capacity
    const currentWeight = this.calculateInventoryWeight();
    const carryingCapacity = this.getCarryingCapacity();

    if (currentWeight + item.weight > carryingCapacity) {
      return { success: false, error: 'Carrying capacity exceeded' };
    }

    // Remove from guild inventory
    this.guild.bank.inventory.splice(itemIndex, 1);

    // Add to character inventory
    this.character.inventory.push(item);

    // Record transaction
    await this.recordTransaction({
      id: this.generateTransactionId(),
      type: 'transfer',
      amount: 0,
      itemId: item.id,
      fromEntity: `guild:${this.guild.id}`,
      toEntity: `character:${this.character.id}`,
      timestamp: new Date(),
      description: `Took ${item.name} from guild inventory`,
    });

    return { success: true };
  }

  /**
   * Purchase item from marketplace using character or guild funds
   */
  async purchaseItem(
    item: Item, 
    useGuildFunds: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    if (useGuildFunds) {
      if (!this.guild) {
        return { success: false, error: 'No guild available' };
      }

      if (!this.canSpendGuildFunds(item.value)) {
        return { success: false, error: 'No permission to spend guild funds' };
      }

      if (this.guild.bank.currency < item.value) {
        return { success: false, error: 'Insufficient guild funds' };
      }

      // Deduct from guild bank
      this.guild.bank.currency -= item.value;
    } else {
      if (this.character.economy.currency < item.value) {
        return { success: false, error: 'Insufficient personal funds' };
      }

      // Deduct from character
      this.character.economy.currency -= item.value;
    }

    // Add item to character inventory
    this.character.inventory.push(item);

    // Record transaction
    await this.recordTransaction({
      id: this.generateTransactionId(),
      type: 'purchase',
      amount: item.value,
      itemId: item.id,
      fromEntity: useGuildFunds ? `guild:${this.guild?.id}` : `character:${this.character.id}`,
      toEntity: 'marketplace',
      timestamp: new Date(),
      description: `Purchased ${item.name} for ${item.value} credits`,
    });

    return { success: true };
  }

  /**
   * Get current economy state
   */
  getEconomyState(): EconomyState {
    return {
      personalCurrency: this.character.economy.currency,
      guildCurrency: this.guild?.bank.currency || 0,
      pendingTransactions: this.transactions.filter(t => t.timestamp > new Date(Date.now() - 60000)),
      transactionHistory: this.transactions.slice(-50),
    };
  }

  // Permission checks
  private canDepositToGuild(): boolean {
    return this.guild !== null; // Basic check - can be extended with role permissions
  }

  private canWithdrawFromGuild(amount: number): boolean {
    if (!this.guild) return false;
    // Add role-based permission checks here
    return amount <= 1000; // Example: limit withdrawal amounts
  }

  private canTransferItemToGuild(): boolean {
    return this.guild !== null;
  }

  private canTakeItemFromGuild(): boolean {
    return this.guild !== null;
  }

  private canSpendGuildFunds(amount: number): boolean {
    if (!this.guild) return false;
    // Check if character has officer or owner role
    return amount <= 500; // Example: spending limit
  }

  // Utility methods
  private calculateInventoryWeight(): number {
    return this.character.inventory.reduce((total, item) => total + item.weight, 0);
  }

  private getCarryingCapacity(): number {
    return GAME_CONFIG.MAX_INVENTORY_WEIGHT + 
           Math.floor(this.character.stats.strength / 10) * 5;
  }

  private async recordTransaction(transaction: EconomyTransaction): Promise<void> {
    this.transactions.push(transaction);
    // In a real implementation, this would save to database
    console.log('Transaction recorded:', transaction);
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

/**
 * Example usage demonstrating guild economy interaction
 */
export async function exampleEconomyManagement() {
  // Mock character and guild data
  const character: Character = {
    id: 'char_123',
    name: 'Sergeant Miller',
    class: 'assault',
    level: 5,
    experience: 1250,
    health: 100,
    maxHealth: 120,
    stats: {
      strength: 80,
      agility: 60,
      intelligence: 40,
      endurance: 80,
      marksmanship: 70,
      medical: 30,
    },
    inventory: [
      {
        id: 'rifle_001',
        name: 'M4A1 Rifle',
        type: 'weapon',
        rarity: 'common',
        weight: 3.5,
        value: 800,
        properties: {},
      }
    ],
    equipment: {},
    skills: [],
    traits: [],
    economy: {
      currency: 2500,
      bank: 0,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const guild: Guild = {
    id: 'guild_456',
    name: 'Alpha Squad',
    description: 'Elite tactical unit',
    bank: {
      currency: 15000,
      inventory: [],
    },
    permissions: {},
    settings: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const economyManager = new EconomyManager(character, guild);

  // Example: Deposit to guild
  const depositResult = await economyManager.depositToGuild(500);
  console.log('Deposit result:', depositResult);

  // Example: Purchase item with guild funds
  const newItem: Item = {
    id: 'armor_vest_001',
    name: 'Tactical Vest',
    type: 'armor',
    rarity: 'uncommon',
    weight: 2.0,
    value: 600,
    properties: { protection: 30 },
  };

  const purchaseResult = await economyManager.purchaseItem(newItem, true);
  console.log('Purchase result:', purchaseResult);

  // Show final economy state
  const state = economyManager.getEconomyState();
  console.log('Final economy state:', state);
}
