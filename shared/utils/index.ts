/**
 * Utility functions for character management
 */
export const CharacterUtils = {
  /**
   * Calculate experience required for next level
   */
  getExperienceForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  },

  /**
   * Calculate total experience required to reach a level
   */
  getTotalExperienceForLevel(level: number): number {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += this.getExperienceForLevel(i);
    }
    return total;
  },

  /**
   * Get character level from total experience
   */
  getLevelFromExperience(experience: number): number {
    let level = 1;
    let totalExp = 0;
    
    while (totalExp <= experience) {
      totalExp += this.getExperienceForLevel(level);
      if (totalExp <= experience) {
        level++;
      }
    }
    
    return level;
  },

  /**
   * Calculate health based on level and endurance
   */
  calculateMaxHealth(level: number, endurance: number): number {
    const baseHealth = 100;
    const levelBonus = (level - 1) * 5;
    const enduranceBonus = Math.floor(endurance / 10) * 10;
    return baseHealth + levelBonus + enduranceBonus;
  },

  /**
   * Calculate carrying capacity based on strength
   */
  calculateCarryingCapacity(strength: number): number {
    const baseCapacity = 50;
    const strengthBonus = Math.floor(strength / 10) * 5;
    return baseCapacity + strengthBonus;
  },
};

/**
 * Utility functions for combat calculations
 */
export const CombatUtils = {
  /**
   * Calculate hit chance based on stats and conditions
   */
  calculateHitChance(
    attackerMarksmanship: number,
    defenderAgility: number,
    distance: number,
    conditions: { cover?: boolean; moving?: boolean } = {}
  ): number {
    let baseChance = attackerMarksmanship - defenderAgility + 50;
    
    // Distance penalty
    const distancePenalty = Math.max(0, (distance - 5) * 2);
    baseChance -= distancePenalty;
    
    // Cover penalty
    if (conditions.cover) {
      baseChance -= 20;
    }
    
    // Moving penalty
    if (conditions.moving) {
      baseChance -= 15;
    }
    
    return Math.max(5, Math.min(95, baseChance));
  },

  /**
   * Calculate damage based on weapon and stats
   */
  calculateDamage(
    baseDamage: number,
    attackerStrength: number,
    defenderEndurance: number,
    isCritical: boolean = false
  ): number {
    const strengthBonus = Math.floor(attackerStrength / 20);
    const enduranceReduction = Math.floor(defenderEndurance / 25);
    
    let damage = baseDamage + strengthBonus - enduranceReduction;
    
    if (isCritical) {
      damage *= 2;
    }
    
    return Math.max(1, damage);
  },

  /**
   * Check if attack is critical hit
   */
  isCriticalHit(attackerMarksmanship: number): boolean {
    const critChance = Math.floor(attackerMarksmanship / 10);
    return Math.random() * 100 < critChance;
  },
};

/**
 * Utility functions for map and positioning
 */
export const MapUtils = {
  /**
   * Calculate distance between two points
   */
  calculateDistance(
    point1: { x: number; y: number },
    point2: { x: number; y: number }
  ): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Check if point is within range
   */
  isWithinRange(
    point1: { x: number; y: number },
    point2: { x: number; y: number },
    range: number
  ): boolean {
    return this.calculateDistance(point1, point2) <= range;
  },

  /**
   * Convert world coordinates to tile coordinates
   */
  worldToTile(worldX: number, worldY: number, tileSize: number = 64): { x: number; y: number } {
    return {
      x: Math.floor(worldX / tileSize),
      y: Math.floor(worldY / tileSize),
    };
  },

  /**
   * Convert tile coordinates to world coordinates
   */
  tileToWorld(tileX: number, tileY: number, tileSize: number = 64): { x: number; y: number } {
    return {
      x: tileX * tileSize + tileSize / 2,
      y: tileY * tileSize + tileSize / 2,
    };
  },
};

/**
 * Utility functions for validation
 */
export const ValidationUtils = {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate username format
   */
  isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  },

  /**
   * Validate character name
   */
  isValidCharacterName(name: string): boolean {
    const nameRegex = /^[a-zA-Z0-9\s]{1,50}$/;
    return nameRegex.test(name) && name.trim().length > 0;
  },

  /**
   * Validate guild name
   */
  isValidGuildName(name: string): boolean {
    const nameRegex = /^[a-zA-Z0-9\s]{1,50}$/;
    return nameRegex.test(name) && name.trim().length > 0;
  },
};

/**
 * Utility functions for formatting
 */
export const FormatUtils = {
  /**
   * Format number with commas
   */
  formatNumber(num: number): string {
    return num.toLocaleString();
  },

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return `$${this.formatNumber(amount)}`;
  },

  /**
   * Format percentage
   */
  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  },

  /**
   * Format time duration
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  },
};
