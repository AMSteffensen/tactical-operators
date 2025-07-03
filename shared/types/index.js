"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomEventSchema = exports.SocketEventSchema = exports.ApiResponseSchema = exports.GameSessionSchema = exports.CampaignSchema = exports.GuildSchema = exports.GuildRoleSchema = exports.CharacterSchema = exports.ItemSchema = exports.CharacterStatsSchema = exports.CharacterClassSchema = void 0;
const zod_1 = require("zod");
// Character System Types
exports.CharacterClassSchema = zod_1.z.enum(['assault', 'sniper', 'medic', 'engineer', 'demolitions']);
exports.CharacterStatsSchema = zod_1.z.object({
    strength: zod_1.z.number().min(1).max(100),
    agility: zod_1.z.number().min(1).max(100),
    intelligence: zod_1.z.number().min(1).max(100),
    endurance: zod_1.z.number().min(1).max(100),
    marksmanship: zod_1.z.number().min(1).max(100),
    medical: zod_1.z.number().min(1).max(100),
});
exports.ItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    type: zod_1.z.enum(['weapon', 'armor', 'consumable', 'utility', 'ammunition']),
    rarity: zod_1.z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
    durability: zod_1.z.number().min(0).max(100).optional(),
    weight: zod_1.z.number().min(0),
    value: zod_1.z.number().min(0),
    properties: zod_1.z.record(zod_1.z.any()),
});
exports.CharacterSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1).max(50),
    class: exports.CharacterClassSchema,
    level: zod_1.z.number().min(1).max(100),
    experience: zod_1.z.number().min(0),
    health: zod_1.z.number().min(0),
    maxHealth: zod_1.z.number().min(1),
    stats: exports.CharacterStatsSchema,
    inventory: zod_1.z.array(exports.ItemSchema),
    equipment: zod_1.z.record(exports.ItemSchema.optional()),
    skills: zod_1.z.array(zod_1.z.string()),
    traits: zod_1.z.array(zod_1.z.string()),
    economy: zod_1.z.object({
        currency: zod_1.z.number().min(0),
        bank: zod_1.z.number().min(0).optional(),
    }),
    isActive: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// Guild System Types
exports.GuildRoleSchema = zod_1.z.enum(['owner', 'officer', 'member']);
exports.GuildSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1).max(50),
    description: zod_1.z.string().optional(),
    bank: zod_1.z.object({
        currency: zod_1.z.number().min(0),
        inventory: zod_1.z.array(exports.ItemSchema),
    }),
    permissions: zod_1.z.record(zod_1.z.array(zod_1.z.string())),
    settings: zod_1.z.record(zod_1.z.any()),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// Campaign System Types
exports.CampaignSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    mapData: zod_1.z.object({
        chunks: zod_1.z.record(zod_1.z.any()),
        modifications: zod_1.z.array(zod_1.z.any()),
    }),
    objectives: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        description: zod_1.z.string(),
        completed: zod_1.z.boolean(),
        progress: zod_1.z.number().min(0).max(100),
    })),
    progress: zod_1.z.object({
        sessionsCompleted: zod_1.z.number().min(0),
        totalScore: zod_1.z.number().min(0),
        achievements: zod_1.z.array(zod_1.z.string()),
    }),
    settings: zod_1.z.object({
        difficulty: zod_1.z.enum(['easy', 'normal', 'hard', 'hardcore']),
        permadeath: zod_1.z.boolean(),
        maxPlayers: zod_1.z.number().min(1).max(8),
    }),
    isActive: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// Game Session Types
exports.GameSessionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    campaignId: zod_1.z.string(),
    sessionData: zod_1.z.object({
        turn: zod_1.z.number().min(0),
        phase: zod_1.z.enum(['planning', 'execution', 'resolution']),
        playerActions: zod_1.z.record(zod_1.z.any()),
        worldState: zod_1.z.any(),
    }),
    outcome: zod_1.z.object({
        victory: zod_1.z.boolean(),
        score: zod_1.z.number(),
        rewards: zod_1.z.array(exports.ItemSchema),
        casualties: zod_1.z.array(zod_1.z.string()),
    }).optional(),
    startedAt: zod_1.z.date(),
    endedAt: zod_1.z.date().optional(),
});
// API Response Types
exports.ApiResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional(),
    message: zod_1.z.string().optional(),
});
// WebSocket Event Types
exports.SocketEventSchema = zod_1.z.object({
    type: zod_1.z.string(),
    payload: zod_1.z.any(),
    timestamp: zod_1.z.date(),
});
exports.RoomEventSchema = zod_1.z.object({
    roomId: zod_1.z.string(),
    userId: zod_1.z.string(),
    event: exports.SocketEventSchema,
});
