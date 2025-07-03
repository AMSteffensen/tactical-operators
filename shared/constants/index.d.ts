export declare const GAME_CONFIG: {
    readonly MAX_CHARACTER_LEVEL: 100;
    readonly MAX_PARTY_SIZE: 4;
    readonly STARTING_HEALTH: 100;
    readonly STARTING_CURRENCY: 1000;
    readonly TURN_TIME_LIMIT: 30;
    readonly MAX_ACTION_POINTS: 10;
    readonly CRITICAL_HIT_MULTIPLIER: 2;
    readonly TILE_SIZE: 64;
    readonly CHUNK_SIZE: 16;
    readonly VISIBILITY_RANGE: 8;
    readonly STARTING_GUILD_FUNDS: 10000;
    readonly MAX_INVENTORY_WEIGHT: 50;
    readonly ITEM_DURABILITY_LOSS_RATE: 0.1;
    readonly MAX_CAMPAIGN_PARTICIPANTS: 8;
    readonly SESSION_TIMEOUT: 3600;
};
export declare const CHARACTER_CLASSES: {
    readonly assault: {
        readonly name: "Assault";
        readonly description: "Front-line fighter with high health and close combat skills";
        readonly startingStats: {
            readonly strength: 80;
            readonly agility: 60;
            readonly intelligence: 40;
            readonly endurance: 80;
            readonly marksmanship: 60;
            readonly medical: 30;
        };
        readonly startingEquipment: readonly ["assault_rifle", "combat_armor", "first_aid_kit"];
    };
    readonly sniper: {
        readonly name: "Sniper";
        readonly description: "Long-range specialist with exceptional accuracy";
        readonly startingStats: {
            readonly strength: 50;
            readonly agility: 70;
            readonly intelligence: 80;
            readonly endurance: 60;
            readonly marksmanship: 90;
            readonly medical: 20;
        };
        readonly startingEquipment: readonly ["sniper_rifle", "ghillie_suit", "scope"];
    };
    readonly medic: {
        readonly name: "Medic";
        readonly description: "Support specialist focused on healing and team survival";
        readonly startingStats: {
            readonly strength: 40;
            readonly agility: 60;
            readonly intelligence: 90;
            readonly endurance: 70;
            readonly marksmanship: 50;
            readonly medical: 90;
        };
        readonly startingEquipment: readonly ["medical_kit", "light_armor", "sidearm"];
    };
    readonly engineer: {
        readonly name: "Engineer";
        readonly description: "Technical specialist for repairs, hacking, and gadgets";
        readonly startingStats: {
            readonly strength: 60;
            readonly agility: 50;
            readonly intelligence: 90;
            readonly endurance: 60;
            readonly marksmanship: 40;
            readonly medical: 40;
        };
        readonly startingEquipment: readonly ["toolkit", "utility_vest", "tablet"];
    };
    readonly demolitions: {
        readonly name: "Demolitions";
        readonly description: "Explosives expert for breaching and area denial";
        readonly startingStats: {
            readonly strength: 70;
            readonly agility: 50;
            readonly intelligence: 70;
            readonly endurance: 80;
            readonly marksmanship: 60;
            readonly medical: 30;
        };
        readonly startingEquipment: readonly ["grenade_launcher", "bomb_suit", "explosives"];
    };
};
export declare const ITEM_RARITIES: {
    readonly common: {
        readonly color: "#ffffff";
        readonly dropRate: 0.6;
    };
    readonly uncommon: {
        readonly color: "#00ff00";
        readonly dropRate: 0.25;
    };
    readonly rare: {
        readonly color: "#0080ff";
        readonly dropRate: 0.1;
    };
    readonly epic: {
        readonly color: "#8000ff";
        readonly dropRate: 0.04;
    };
    readonly legendary: {
        readonly color: "#ff8000";
        readonly dropRate: 0.01;
    };
};
export declare const GAME_EVENTS: {
    readonly CHARACTER_CREATED: "character:created";
    readonly CHARACTER_UPDATED: "character:updated";
    readonly CHARACTER_DELETED: "character:deleted";
    readonly GUILD_CREATED: "guild:created";
    readonly GUILD_UPDATED: "guild:updated";
    readonly GUILD_MEMBER_JOINED: "guild:member_joined";
    readonly GUILD_MEMBER_LEFT: "guild:member_left";
    readonly CAMPAIGN_CREATED: "campaign:created";
    readonly CAMPAIGN_STARTED: "campaign:started";
    readonly CAMPAIGN_ENDED: "campaign:ended";
    readonly SESSION_STARTED: "session:started";
    readonly SESSION_ENDED: "session:ended";
    readonly TURN_STARTED: "combat:turn_started";
    readonly ACTION_PERFORMED: "combat:action_performed";
    readonly DAMAGE_DEALT: "combat:damage_dealt";
    readonly PLAYER_DEFEATED: "combat:player_defeated";
};
export declare const ERROR_MESSAGES: {
    readonly INVALID_CREDENTIALS: "Invalid email or password";
    readonly TOKEN_EXPIRED: "Session expired, please login again";
    readonly UNAUTHORIZED: "You are not authorized to perform this action";
    readonly CHARACTER_NOT_FOUND: "Character not found";
    readonly CHARACTER_NAME_TAKEN: "Character name is already taken";
    readonly INVALID_CHARACTER_CLASS: "Invalid character class";
    readonly GUILD_NOT_FOUND: "Guild not found";
    readonly GUILD_NAME_TAKEN: "Guild name is already taken";
    readonly NOT_GUILD_MEMBER: "You are not a member of this guild";
    readonly INSUFFICIENT_PERMISSIONS: "You do not have permission to perform this action";
    readonly CAMPAIGN_NOT_FOUND: "Campaign not found";
    readonly CAMPAIGN_FULL: "Campaign is full";
    readonly ALREADY_IN_CAMPAIGN: "You are already participating in this campaign";
    readonly VALIDATION_ERROR: "Validation error";
    readonly SERVER_ERROR: "Internal server error";
    readonly NOT_FOUND: "Resource not found";
};
