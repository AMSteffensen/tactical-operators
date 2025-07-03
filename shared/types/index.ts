import { z } from 'zod';

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
