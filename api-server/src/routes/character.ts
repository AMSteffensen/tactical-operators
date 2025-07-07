import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ApiResponse } from '../../../shared/dist/types/index.js';
import { CharacterSchema, CharacterStatsSchema, CharacterClassSchema } from '../../../shared/dist/types/index.js';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Character creation schema for API validation
const CreateCharacterSchema = z.object({
  name: z.string().min(1).max(50),
  class: CharacterClassSchema,
  stats: CharacterStatsSchema.optional(),
});

// Character update schema for API validation
const UpdateCharacterSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  stats: CharacterStatsSchema.optional(),
  inventory: z.array(z.any()).optional(), // TODO: Replace with proper ItemSchema validation
  equipment: z.record(z.any()).optional(), // TODO: Replace with proper ItemSchema validation
  economy: z.object({
    currency: z.number().min(0),
    bank: z.number().min(0).optional(),
  }).optional(),
});

// @desc    Get user's characters
// @route   GET /api/character
// @access  Private
router.get('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    let userId: string;
    
    // For development: allow userId query parameter ONLY in development
    if (process.env.NODE_ENV === 'development' && req.query.userId) {
      userId = req.query.userId as string;
      console.log('🔧 Dev mode: Using userId from query parameter:', userId);
    } else if (req.user?.id) {
      userId = req.user.id;
    } else {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, no token provided',
      });
    }

    const characters = await prisma.character.findMany({
      where: {
        userId: userId,
        isActive: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { characters },
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch characters',
    });
  }
});

// @desc    Get specific character
// @route   GET /api/character/:id
// @access  Private
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const character = await prisma.character.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
        isActive: true,
      },
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
      });
    }

    res.json({
      success: true,
      data: { character },
    });
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch character',
    });
  }
});

// @desc    Create new character
// @route   POST /api/character
// @desc    Create character
// @route   POST /api/character  
// @access  Private (or dev mode with userId in body)
// @desc    Create a new character
// @route   POST /api/character
// @access  Private
router.post('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    let userId: string;
    
    // For development: allow userId in request body ONLY in development
    if (process.env.NODE_ENV === 'development' && req.body.userId) {
      userId = req.body.userId as string;
      console.log('🔧 Dev mode: Using userId from request body:', userId);
    } else if (req.user?.id) {
      userId = req.user.id;
    } else {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, no token provided',
      });
    }

    // Validate request body (excluding userId from validation)
    const { userId: _, ...validationData } = req.body;
    const validation = CreateCharacterSchema.safeParse(validationData);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid character data',
        details: validation.error.issues,
      });
    }

    const { name, class: characterClass, stats } = validation.data;

    // Check if character name is already taken for this user
    const existingCharacter = await prisma.character.findFirst({
      where: {
        userId: userId,
        name,
        isActive: true,
      },
    });

    if (existingCharacter) {
      return res.status(409).json({
        success: false,
        error: 'Character name already exists',
      });
    }

    // Generate default stats based on class if not provided
    const defaultStats = generateDefaultStats(characterClass);
    const finalStats = stats || defaultStats;

    // Create character
    const character = await prisma.character.create({
      data: {
        name,
        class: characterClass,
        userId: userId,
        stats: finalStats,
        inventory: [],
        equipment: {},
        skills: getStartingSkills(characterClass),
        traits: [],
        economy: {
          currency: 100, // Starting currency
          bank: 0,
        },
        level: 1,
        experience: 0,
        health: 100,
        maxHealth: 100,
      },
    });

    res.status(201).json({
      success: true,
      data: { character },
      message: 'Character created successfully',
    });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create character',
    });
  }
});

// @desc    Update character
// @route   PUT /api/character/:id
// @access  Private
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const character = await prisma.character.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
        isActive: true,
      },
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
      });
    }

    // Validate updatable fields with proper schema validation
    const validation = UpdateCharacterSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid character update data',
        details: validation.error.issues,
      });
    }

    const updates = validation.data;

    const updatedCharacter = await prisma.character.update({
      where: { id: req.params.id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: { character: updatedCharacter },
      message: 'Character updated successfully',
    });
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update character',
    });
  }
});

// @desc    Delete character (soft delete)
// @route   DELETE /api/character/:id
// @access  Private
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const character = await prisma.character.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
        isActive: true,
      },
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
      });
    }

    // Soft delete
    await prisma.character.update({
      where: { id: req.params.id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Character deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete character',
    });
  }
});

// Helper functions
function generateDefaultStats(characterClass: string) {
  const baseStats = {
    strength: 50,
    agility: 50,
    intelligence: 50,
    endurance: 50,
    marksmanship: 50,
    medical: 50,
  };

  // Adjust stats based on class
  switch (characterClass) {
    case 'assault':
      return {
        ...baseStats,
        strength: 70,
        endurance: 65,
        agility: 55,
      };
    case 'sniper':
      return {
        ...baseStats,
        marksmanship: 75,
        intelligence: 60,
        agility: 55,
      };
    case 'medic':
      return {
        ...baseStats,
        medical: 80,
        intelligence: 65,
        endurance: 55,
      };
    case 'engineer':
      return {
        ...baseStats,
        intelligence: 75,
        agility: 60,
        strength: 45,
      };
    case 'demolitions':
      return {
        ...baseStats,
        strength: 65,
        intelligence: 60,
        endurance: 60,
      };
    default:
      return baseStats;
  }
}

function getStartingSkills(characterClass: string): string[] {
  const baseSkills = ['basic_combat', 'basic_movement'];
  
  switch (characterClass) {
    case 'assault':
      return [...baseSkills, 'rifle_proficiency', 'close_quarters_combat'];
    case 'sniper':
      return [...baseSkills, 'long_range_shooting', 'stealth'];
    case 'medic':
      return [...baseSkills, 'first_aid', 'battlefield_medicine'];
    case 'engineer':
      return [...baseSkills, 'tech_specialist', 'equipment_repair'];
    case 'demolitions':
      return [...baseSkills, 'explosives_handling', 'breach_tactics'];
    default:
      return baseSkills;
  }
}

export { router as characterRoutes };
