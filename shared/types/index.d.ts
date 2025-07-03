import { z } from 'zod';
export declare const CharacterClassSchema: z.ZodEnum<["assault", "sniper", "medic", "engineer", "demolitions"]>;
export type CharacterClass = z.infer<typeof CharacterClassSchema>;
export declare const CharacterStatsSchema: z.ZodObject<{
    strength: z.ZodNumber;
    agility: z.ZodNumber;
    intelligence: z.ZodNumber;
    endurance: z.ZodNumber;
    marksmanship: z.ZodNumber;
    medical: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    strength: number;
    agility: number;
    intelligence: number;
    endurance: number;
    marksmanship: number;
    medical: number;
}, {
    strength: number;
    agility: number;
    intelligence: number;
    endurance: number;
    marksmanship: number;
    medical: number;
}>;
export type CharacterStats = z.infer<typeof CharacterStatsSchema>;
export declare const ItemSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["weapon", "armor", "consumable", "utility", "ammunition"]>;
    rarity: z.ZodEnum<["common", "uncommon", "rare", "epic", "legendary"]>;
    durability: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodNumber;
    value: z.ZodNumber;
    properties: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    value: number;
    type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
    id: string;
    name: string;
    rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
    weight: number;
    properties: Record<string, any>;
    durability?: number | undefined;
}, {
    value: number;
    type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
    id: string;
    name: string;
    rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
    weight: number;
    properties: Record<string, any>;
    durability?: number | undefined;
}>;
export type Item = z.infer<typeof ItemSchema>;
export declare const CharacterSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    class: z.ZodEnum<["assault", "sniper", "medic", "engineer", "demolitions"]>;
    level: z.ZodNumber;
    experience: z.ZodNumber;
    health: z.ZodNumber;
    maxHealth: z.ZodNumber;
    stats: z.ZodObject<{
        strength: z.ZodNumber;
        agility: z.ZodNumber;
        intelligence: z.ZodNumber;
        endurance: z.ZodNumber;
        marksmanship: z.ZodNumber;
        medical: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        strength: number;
        agility: number;
        intelligence: number;
        endurance: number;
        marksmanship: number;
        medical: number;
    }, {
        strength: number;
        agility: number;
        intelligence: number;
        endurance: number;
        marksmanship: number;
        medical: number;
    }>;
    inventory: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        type: z.ZodEnum<["weapon", "armor", "consumable", "utility", "ammunition"]>;
        rarity: z.ZodEnum<["common", "uncommon", "rare", "epic", "legendary"]>;
        durability: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodNumber;
        value: z.ZodNumber;
        properties: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
        id: string;
        name: string;
        rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
        weight: number;
        properties: Record<string, any>;
        durability?: number | undefined;
    }, {
        value: number;
        type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
        id: string;
        name: string;
        rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
        weight: number;
        properties: Record<string, any>;
        durability?: number | undefined;
    }>, "many">;
    equipment: z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        type: z.ZodEnum<["weapon", "armor", "consumable", "utility", "ammunition"]>;
        rarity: z.ZodEnum<["common", "uncommon", "rare", "epic", "legendary"]>;
        durability: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodNumber;
        value: z.ZodNumber;
        properties: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
        id: string;
        name: string;
        rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
        weight: number;
        properties: Record<string, any>;
        durability?: number | undefined;
    }, {
        value: number;
        type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
        id: string;
        name: string;
        rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
        weight: number;
        properties: Record<string, any>;
        durability?: number | undefined;
    }>>>;
    skills: z.ZodArray<z.ZodString, "many">;
    traits: z.ZodArray<z.ZodString, "many">;
    economy: z.ZodObject<{
        currency: z.ZodNumber;
        bank: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        currency: number;
        bank?: number | undefined;
    }, {
        currency: number;
        bank?: number | undefined;
    }>;
    isActive: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    class: "assault" | "sniper" | "medic" | "engineer" | "demolitions";
    level: number;
    experience: number;
    health: number;
    maxHealth: number;
    stats: {
        strength: number;
        agility: number;
        intelligence: number;
        endurance: number;
        marksmanship: number;
        medical: number;
    };
    inventory: {
        value: number;
        type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
        id: string;
        name: string;
        rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
        weight: number;
        properties: Record<string, any>;
        durability?: number | undefined;
    }[];
    equipment: Record<string, {
        value: number;
        type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
        id: string;
        name: string;
        rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
        weight: number;
        properties: Record<string, any>;
        durability?: number | undefined;
    } | undefined>;
    skills: string[];
    traits: string[];
    economy: {
        currency: number;
        bank?: number | undefined;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}, {
    id: string;
    name: string;
    class: "assault" | "sniper" | "medic" | "engineer" | "demolitions";
    level: number;
    experience: number;
    health: number;
    maxHealth: number;
    stats: {
        strength: number;
        agility: number;
        intelligence: number;
        endurance: number;
        marksmanship: number;
        medical: number;
    };
    inventory: {
        value: number;
        type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
        id: string;
        name: string;
        rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
        weight: number;
        properties: Record<string, any>;
        durability?: number | undefined;
    }[];
    equipment: Record<string, {
        value: number;
        type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
        id: string;
        name: string;
        rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
        weight: number;
        properties: Record<string, any>;
        durability?: number | undefined;
    } | undefined>;
    skills: string[];
    traits: string[];
    economy: {
        currency: number;
        bank?: number | undefined;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export type Character = z.infer<typeof CharacterSchema>;
export declare const GuildRoleSchema: z.ZodEnum<["owner", "officer", "member"]>;
export type GuildRole = z.infer<typeof GuildRoleSchema>;
export declare const GuildSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    bank: z.ZodObject<{
        currency: z.ZodNumber;
        inventory: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodEnum<["weapon", "armor", "consumable", "utility", "ammunition"]>;
            rarity: z.ZodEnum<["common", "uncommon", "rare", "epic", "legendary"]>;
            durability: z.ZodOptional<z.ZodNumber>;
            weight: z.ZodNumber;
            value: z.ZodNumber;
            properties: z.ZodRecord<z.ZodString, z.ZodAny>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
            id: string;
            name: string;
            rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
            weight: number;
            properties: Record<string, any>;
            durability?: number | undefined;
        }, {
            value: number;
            type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
            id: string;
            name: string;
            rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
            weight: number;
            properties: Record<string, any>;
            durability?: number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        inventory: {
            value: number;
            type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
            id: string;
            name: string;
            rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
            weight: number;
            properties: Record<string, any>;
            durability?: number | undefined;
        }[];
        currency: number;
    }, {
        inventory: {
            value: number;
            type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
            id: string;
            name: string;
            rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
            weight: number;
            properties: Record<string, any>;
            durability?: number | undefined;
        }[];
        currency: number;
    }>;
    permissions: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>;
    settings: z.ZodRecord<z.ZodString, z.ZodAny>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    bank: {
        inventory: {
            value: number;
            type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
            id: string;
            name: string;
            rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
            weight: number;
            properties: Record<string, any>;
            durability?: number | undefined;
        }[];
        currency: number;
    };
    createdAt: Date;
    updatedAt: Date;
    permissions: Record<string, string[]>;
    settings: Record<string, any>;
    description?: string | undefined;
}, {
    id: string;
    name: string;
    bank: {
        inventory: {
            value: number;
            type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
            id: string;
            name: string;
            rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
            weight: number;
            properties: Record<string, any>;
            durability?: number | undefined;
        }[];
        currency: number;
    };
    createdAt: Date;
    updatedAt: Date;
    permissions: Record<string, string[]>;
    settings: Record<string, any>;
    description?: string | undefined;
}>;
export type Guild = z.infer<typeof GuildSchema>;
export declare const CampaignSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    mapData: z.ZodObject<{
        chunks: z.ZodRecord<z.ZodString, z.ZodAny>;
        modifications: z.ZodArray<z.ZodAny, "many">;
    }, "strip", z.ZodTypeAny, {
        chunks: Record<string, any>;
        modifications: any[];
    }, {
        chunks: Record<string, any>;
        modifications: any[];
    }>;
    objectives: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        completed: z.ZodBoolean;
        progress: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        title: string;
        completed: boolean;
        progress: number;
    }, {
        id: string;
        description: string;
        title: string;
        completed: boolean;
        progress: number;
    }>, "many">;
    progress: z.ZodObject<{
        sessionsCompleted: z.ZodNumber;
        totalScore: z.ZodNumber;
        achievements: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        sessionsCompleted: number;
        totalScore: number;
        achievements: string[];
    }, {
        sessionsCompleted: number;
        totalScore: number;
        achievements: string[];
    }>;
    settings: z.ZodObject<{
        difficulty: z.ZodEnum<["easy", "normal", "hard", "hardcore"]>;
        permadeath: z.ZodBoolean;
        maxPlayers: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        difficulty: "easy" | "normal" | "hard" | "hardcore";
        permadeath: boolean;
        maxPlayers: number;
    }, {
        difficulty: "easy" | "normal" | "hard" | "hardcore";
        permadeath: boolean;
        maxPlayers: number;
    }>;
    isActive: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    settings: {
        difficulty: "easy" | "normal" | "hard" | "hardcore";
        permadeath: boolean;
        maxPlayers: number;
    };
    mapData: {
        chunks: Record<string, any>;
        modifications: any[];
    };
    objectives: {
        id: string;
        description: string;
        title: string;
        completed: boolean;
        progress: number;
    }[];
    progress: {
        sessionsCompleted: number;
        totalScore: number;
        achievements: string[];
    };
    description?: string | undefined;
}, {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    settings: {
        difficulty: "easy" | "normal" | "hard" | "hardcore";
        permadeath: boolean;
        maxPlayers: number;
    };
    mapData: {
        chunks: Record<string, any>;
        modifications: any[];
    };
    objectives: {
        id: string;
        description: string;
        title: string;
        completed: boolean;
        progress: number;
    }[];
    progress: {
        sessionsCompleted: number;
        totalScore: number;
        achievements: string[];
    };
    description?: string | undefined;
}>;
export type Campaign = z.infer<typeof CampaignSchema>;
export declare const GameSessionSchema: z.ZodObject<{
    id: z.ZodString;
    campaignId: z.ZodString;
    sessionData: z.ZodObject<{
        turn: z.ZodNumber;
        phase: z.ZodEnum<["planning", "execution", "resolution"]>;
        playerActions: z.ZodRecord<z.ZodString, z.ZodAny>;
        worldState: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        turn: number;
        phase: "planning" | "execution" | "resolution";
        playerActions: Record<string, any>;
        worldState?: any;
    }, {
        turn: number;
        phase: "planning" | "execution" | "resolution";
        playerActions: Record<string, any>;
        worldState?: any;
    }>;
    outcome: z.ZodOptional<z.ZodObject<{
        victory: z.ZodBoolean;
        score: z.ZodNumber;
        rewards: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodEnum<["weapon", "armor", "consumable", "utility", "ammunition"]>;
            rarity: z.ZodEnum<["common", "uncommon", "rare", "epic", "legendary"]>;
            durability: z.ZodOptional<z.ZodNumber>;
            weight: z.ZodNumber;
            value: z.ZodNumber;
            properties: z.ZodRecord<z.ZodString, z.ZodAny>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
            id: string;
            name: string;
            rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
            weight: number;
            properties: Record<string, any>;
            durability?: number | undefined;
        }, {
            value: number;
            type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
            id: string;
            name: string;
            rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
            weight: number;
            properties: Record<string, any>;
            durability?: number | undefined;
        }>, "many">;
        casualties: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        victory: boolean;
        score: number;
        rewards: {
            value: number;
            type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
            id: string;
            name: string;
            rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
            weight: number;
            properties: Record<string, any>;
            durability?: number | undefined;
        }[];
        casualties: string[];
    }, {
        victory: boolean;
        score: number;
        rewards: {
            value: number;
            type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
            id: string;
            name: string;
            rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
            weight: number;
            properties: Record<string, any>;
            durability?: number | undefined;
        }[];
        casualties: string[];
    }>>;
    startedAt: z.ZodDate;
    endedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    campaignId: string;
    sessionData: {
        turn: number;
        phase: "planning" | "execution" | "resolution";
        playerActions: Record<string, any>;
        worldState?: any;
    };
    startedAt: Date;
    outcome?: {
        victory: boolean;
        score: number;
        rewards: {
            value: number;
            type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
            id: string;
            name: string;
            rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
            weight: number;
            properties: Record<string, any>;
            durability?: number | undefined;
        }[];
        casualties: string[];
    } | undefined;
    endedAt?: Date | undefined;
}, {
    id: string;
    campaignId: string;
    sessionData: {
        turn: number;
        phase: "planning" | "execution" | "resolution";
        playerActions: Record<string, any>;
        worldState?: any;
    };
    startedAt: Date;
    outcome?: {
        victory: boolean;
        score: number;
        rewards: {
            value: number;
            type: "weapon" | "armor" | "consumable" | "utility" | "ammunition";
            id: string;
            name: string;
            rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
            weight: number;
            properties: Record<string, any>;
            durability?: number | undefined;
        }[];
        casualties: string[];
    } | undefined;
    endedAt?: Date | undefined;
}>;
export type GameSession = z.infer<typeof GameSessionSchema>;
export declare const ApiResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    message?: string | undefined;
    data?: any;
    error?: string | undefined;
}, {
    success: boolean;
    message?: string | undefined;
    data?: any;
    error?: string | undefined;
}>;
export type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};
export declare const SocketEventSchema: z.ZodObject<{
    type: z.ZodString;
    payload: z.ZodAny;
    timestamp: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    type: string;
    timestamp: Date;
    payload?: any;
}, {
    type: string;
    timestamp: Date;
    payload?: any;
}>;
export type SocketEvent = z.infer<typeof SocketEventSchema>;
export declare const RoomEventSchema: z.ZodObject<{
    roomId: z.ZodString;
    userId: z.ZodString;
    event: z.ZodObject<{
        type: z.ZodString;
        payload: z.ZodAny;
        timestamp: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        type: string;
        timestamp: Date;
        payload?: any;
    }, {
        type: string;
        timestamp: Date;
        payload?: any;
    }>;
}, "strip", z.ZodTypeAny, {
    roomId: string;
    userId: string;
    event: {
        type: string;
        timestamp: Date;
        payload?: any;
    };
}, {
    roomId: string;
    userId: string;
    event: {
        type: string;
        timestamp: Date;
        payload?: any;
    };
}>;
export type RoomEvent = z.infer<typeof RoomEventSchema>;
