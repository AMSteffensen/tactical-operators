// Game Constants
export const GAME_CONFIG = {
  // Character System
  MAX_CHARACTER_LEVEL: 100,
  MAX_PARTY_SIZE: 4,
  STARTING_HEALTH: 100,
  STARTING_CURRENCY: 1000,
  
  // Combat System
  TURN_TIME_LIMIT: 30, // seconds
  MAX_ACTION_POINTS: 10,
  CRITICAL_HIT_MULTIPLIER: 2,
  
  // Map System
  TILE_SIZE: 64, // pixels
  CHUNK_SIZE: 16, // tiles per chunk
  VISIBILITY_RANGE: 8, // tiles
  
  // Economy
  STARTING_GUILD_FUNDS: 10000,
  MAX_INVENTORY_WEIGHT: 50,
  ITEM_DURABILITY_LOSS_RATE: 0.1,
  
  // Campaign
  MAX_CAMPAIGN_PARTICIPANTS: 8,
  SESSION_TIMEOUT: 3600, // seconds (1 hour)
} as const;

// Character Classes Configuration
export const CHARACTER_CLASSES = {
  assault: {
    name: 'Assault',
    description: 'Front-line fighter with high health and close combat skills',
    startingStats: {
      strength: 80,
      agility: 60,
      intelligence: 40,
      endurance: 80,
      marksmanship: 60,
      medical: 30,
    },
    startingEquipment: ['assault_rifle', 'combat_armor', 'first_aid_kit'],
  },
  sniper: {
    name: 'Sniper',
    description: 'Long-range specialist with exceptional accuracy',
    startingStats: {
      strength: 50,
      agility: 70,
      intelligence: 80,
      endurance: 60,
      marksmanship: 90,
      medical: 20,
    },
    startingEquipment: ['sniper_rifle', 'ghillie_suit', 'scope'],
  },
  medic: {
    name: 'Medic',
    description: 'Support specialist focused on healing and team survival',
    startingStats: {
      strength: 40,
      agility: 60,
      intelligence: 90,
      endurance: 70,
      marksmanship: 50,
      medical: 90,
    },
    startingEquipment: ['medical_kit', 'light_armor', 'sidearm'],
  },
  engineer: {
    name: 'Engineer',
    description: 'Technical specialist for repairs, hacking, and gadgets',
    startingStats: {
      strength: 60,
      agility: 50,
      intelligence: 90,
      endurance: 60,
      marksmanship: 40,
      medical: 40,
    },
    startingEquipment: ['toolkit', 'utility_vest', 'tablet'],
  },
  demolitions: {
    name: 'Demolitions',
    description: 'Explosives expert for breaching and area denial',
    startingStats: {
      strength: 70,
      agility: 50,
      intelligence: 70,
      endurance: 80,
      marksmanship: 60,
      medical: 30,
    },
    startingEquipment: ['grenade_launcher', 'bomb_suit', 'explosives'],
  },
} as const;

// Item Rarities and Drop Rates
export const ITEM_RARITIES = {
  common: { color: '#ffffff', dropRate: 0.6 },
  uncommon: { color: '#00ff00', dropRate: 0.25 },
  rare: { color: '#0080ff', dropRate: 0.1 },
  epic: { color: '#8000ff', dropRate: 0.04 },
  legendary: { color: '#ff8000', dropRate: 0.01 },
} as const;

// Game Events
export const GAME_EVENTS = {
  // Character Events
  CHARACTER_CREATED: 'character:created',
  CHARACTER_UPDATED: 'character:updated',
  CHARACTER_DELETED: 'character:deleted',
  
  // Guild Events
  GUILD_CREATED: 'guild:created',
  GUILD_UPDATED: 'guild:updated',
  GUILD_MEMBER_JOINED: 'guild:member_joined',
  GUILD_MEMBER_LEFT: 'guild:member_left',
  
  // Campaign Events
  CAMPAIGN_CREATED: 'campaign:created',
  CAMPAIGN_STARTED: 'campaign:started',
  CAMPAIGN_ENDED: 'campaign:ended',
  SESSION_STARTED: 'session:started',
  SESSION_ENDED: 'session:ended',
  
  // Combat Events
  TURN_STARTED: 'combat:turn_started',
  ACTION_PERFORMED: 'combat:action_performed',
  DAMAGE_DEALT: 'combat:damage_dealt',
  PLAYER_DEFEATED: 'combat:player_defeated',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Session expired, please login again',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  
  // Character
  CHARACTER_NOT_FOUND: 'Character not found',
  CHARACTER_NAME_TAKEN: 'Character name is already taken',
  INVALID_CHARACTER_CLASS: 'Invalid character class',
  
  // Guild
  GUILD_NOT_FOUND: 'Guild not found',
  GUILD_NAME_TAKEN: 'Guild name is already taken',
  NOT_GUILD_MEMBER: 'You are not a member of this guild',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
  
  // Campaign
  CAMPAIGN_NOT_FOUND: 'Campaign not found',
  CAMPAIGN_FULL: 'Campaign is full',
  ALREADY_IN_CAMPAIGN: 'You are already participating in this campaign',
  
  // General
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
} as const;
