
import { z } from 'zod';

// ...existing code...

// Single source of ItemSchema and Item type
export const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['weapon', 'armor', 'consumable', 'utility', 'ammunition']),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  durability: z.number().min(0).max(100).optional(),
  weight: z.number().min(0),
  value: z.number().min(0),
  properties: z.record(z.any()),
});
export type Item = z.infer<typeof ItemSchema>;

// Gun/Weapon System Types (must be after ItemSchema definition)
export const GunSchema = ItemSchema.extend({
  type: z.literal('weapon'),
  ammo: z.number().min(0),
  maxAmmo: z.number().min(1),
  reloadTime: z.number().min(0), // seconds
  damage: z.number().min(1),
  icon: z.string(), // SVG path or import
  slot: z.number().min(1).max(9),
  name: z.string(),
});
export type Gun = z.infer<typeof GunSchema>;

// Character System Types
export const CharacterClassSchema = z.enum(['assault', 'sniper', 'medic', 'engineer', 'demolitions']);
export type CharacterClass = z.infer<typeof CharacterClassSchema>;

export const CharacterStatsSchema = z.object({
  strength: z.number().min(1).max(100),
  agility: z.number().min(1).max(100),
  intelligence: z.number().min(1).max(100),
  endurance: z.number().min(1).max(100),
  marksmanship: z.number().min(1).max(100),
  medical: z.number().min(1).max(100),
});
export type CharacterStats = z.infer<typeof CharacterStatsSchema>;

// ...existing code...

export const CharacterSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  class: CharacterClassSchema,
  level: z.number().min(1).max(100),
  experience: z.number().min(0),
  health: z.number().min(0),
  maxHealth: z.number().min(1),
  stats: CharacterStatsSchema,
  inventory: z.array(ItemSchema),
  equipment: z.record(ItemSchema.optional()),
  skills: z.array(z.string()),
  traits: z.array(z.string()),
  economy: z.object({
    currency: z.number().min(0),
    bank: z.number().min(0).optional(),
  }),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Character = z.infer<typeof CharacterSchema>;

// Guild System Types
export const GuildRoleSchema = z.enum(['owner', 'officer', 'member']);
export type GuildRole = z.infer<typeof GuildRoleSchema>;

export const GuildSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  bank: z.object({
    currency: z.number().min(0),
    inventory: z.array(ItemSchema),
  }),
  permissions: z.record(z.array(z.string())),
  settings: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Guild = z.infer<typeof GuildSchema>;

// Campaign System Types
export const CampaignSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  mapData: z.object({
    chunks: z.record(z.any()),
    modifications: z.array(z.any()),
  }),
  objectives: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    completed: z.boolean(),
    progress: z.number().min(0).max(100),
  })),
  progress: z.object({
    sessionsCompleted: z.number().min(0),
    totalScore: z.number().min(0),
    achievements: z.array(z.string()),
  }),
  settings: z.object({
    difficulty: z.enum(['easy', 'normal', 'hard', 'hardcore']),
    permadeath: z.boolean(),
    maxPlayers: z.number().min(1).max(8),
  }),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Campaign = z.infer<typeof CampaignSchema>;

// Game Session Types
export const GameSessionSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  sessionData: z.object({
    turn: z.number().min(0),
    phase: z.enum(['planning', 'execution', 'resolution']),
    playerActions: z.record(z.any()),
    worldState: z.any(),
  }),
  outcome: z.object({
    victory: z.boolean(),
    score: z.number(),
    rewards: z.array(ItemSchema),
    casualties: z.array(z.string()),
  }).optional(),
  startedAt: z.date(),
  endedAt: z.date().optional(),
});
export type GameSession = z.infer<typeof GameSessionSchema>;

// API Response Types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// WebSocket Event Types
export const SocketEventSchema = z.object({
  type: z.string(),
  payload: z.any(),
  timestamp: z.date(),
});
export type SocketEvent = z.infer<typeof SocketEventSchema>;

export const RoomEventSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
  event: SocketEventSchema,
});
export type RoomEvent = z.infer<typeof RoomEventSchema>;

// Combat System Types
export const CombatActionTypeSchema = z.enum(['move', 'attack', 'ability', 'item', 'defend', 'wait']);
export type CombatActionType = z.infer<typeof CombatActionTypeSchema>;

export const CombatTargetTypeSchema = z.enum(['unit', 'ground', 'area', 'self']);
export type CombatTargetType = z.infer<typeof CombatTargetTypeSchema>;

export const DamageTypeSchema = z.enum(['physical', 'ballistic', 'explosive', 'energy', 'medical']);
export type DamageType = z.infer<typeof DamageTypeSchema>;

export const CombatStatusSchema = z.enum(['healthy', 'wounded', 'suppressed', 'stunned', 'unconscious', 'dead']);
export type CombatStatus = z.infer<typeof CombatStatusSchema>;

export const CombatActionSchema = z.object({
  id: z.string(),
  type: CombatActionTypeSchema,
  actorId: z.string(),
  targetType: CombatTargetTypeSchema,
  targetId: z.string().optional(),
  targetPosition: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }).optional(),
  actionPointCost: z.number().min(0).max(10),
  damage: z.number().optional(),
  damageType: DamageTypeSchema.optional(),
  effects: z.array(z.string()).optional(),
  timestamp: z.date()
});
export type CombatAction = z.infer<typeof CombatActionSchema>;

export const CombatUnitSchema = z.object({
  id: z.string(),
  characterId: z.string(),
  name: z.string(),
  class: CharacterClassSchema,
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }),
  health: z.number().min(0),
  maxHealth: z.number().min(1),
  armor: z.number().min(0).default(0),
  actionPoints: z.number().min(0).max(10),
  maxActionPoints: z.number().min(1).max(10),
  status: CombatStatusSchema,
  statusEffects: z.array(z.string()).default([]),
  faction: z.enum(['player', 'enemy', 'neutral']),
  hasActed: z.boolean().default(false),
  initiative: z.number(),
  // Combat stats derived from character stats
  combatStats: z.object({
    accuracy: z.number().min(0).max(100),
    damage: z.number().min(0),
    range: z.number().min(1),
    mobility: z.number().min(1),
    defense: z.number().min(0)
  })
});
export type CombatUnit = z.infer<typeof CombatUnitSchema>;

export const CombatTurnSchema = z.object({
  turnNumber: z.number().min(1),
  phase: z.enum(['movement', 'action', 'reaction', 'end']),
  activeUnitId: z.string(),
  remainingActionPoints: z.number().min(0),
  actionsThisTurn: z.array(CombatActionSchema),
  turnStartTime: z.date(),
  timeLimit: z.number().optional() // seconds
});
export type CombatTurn = z.infer<typeof CombatTurnSchema>;

export const CombatStateSchema = z.object({
  combatId: z.string(),
  campaignId: z.string().optional(),
  status: z.enum(['setup', 'active', 'paused', 'completed']),
  currentTurn: CombatTurnSchema,
  units: z.array(CombatUnitSchema),
  turnOrder: z.array(z.string()), // unit IDs in initiative order
  battlefield: z.object({
    width: z.number(),
    height: z.number(),
    terrain: z.array(z.object({
      position: z.object({ x: z.number(), z: z.number() }),
      type: z.enum(['normal', 'cover', 'difficult', 'impassable']),
      coverValue: z.number().min(0).max(100).optional()
    }))
  }),
  victory: z.object({
    conditions: z.array(z.enum(['eliminate_enemies', 'reach_objective', 'survive_turns', 'protect_unit'])),
    status: z.enum(['ongoing', 'player_victory', 'enemy_victory', 'draw']).optional()
  }),
  actionHistory: z.array(CombatActionSchema),
  createdAt: z.date(),
  updatedAt: z.date()
});
export type CombatState = z.infer<typeof CombatStateSchema>;
