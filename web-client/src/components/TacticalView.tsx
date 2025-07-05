import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TacticalRenderer } from '../systems/rendering/TacticalRenderer';
import { CombatEngine } from '../systems/combat/CombatEngine';
import { CombatUI } from './CombatUI';
import { useSocket } from '../hooks/useSocket';
import { ConnectionStatus } from './ConnectionStatus';
import { characterService } from '../services/CharacterService';
import { Character, CombatActionType } from '@shared/types';
import './TacticalView.css';

interface TacticalViewProps {
  className?: string;
  height?: number | string;
  deployedCharacters?: any[];
  gameState?: 'setup' | 'deployment' | 'active' | 'paused';
  onCharacterPositionUpdate?: (characterId: string, position: { x: number; z: number }) => void;
  hideUIElements?: boolean; // For distraction-free gameplay
  selectedAction?: CombatActionType | null; // Pass selected action from external HUD
  onCombatEngineCreated?: (engine: CombatEngine) => void; // Callback when combat engine is created
}

/**
 * React component that renders the tactical 3D view
 * Manages the TacticalRenderer lifecycle and provides game state integration
 */
export const TacticalView: React.FC<TacticalViewProps> = ({ 
  className = '',
  height = 600,
  deployedCharacters = [],
  gameState = 'setup',
  onCharacterPositionUpdate,
  hideUIElements = false,
  selectedAction: externalSelectedAction = null,
  onCombatEngineCreated
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<TacticalRenderer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [combatEngine, setCombatEngine] = useState<CombatEngine | null>(null);
  const [selectedAction, setSelectedAction] = useState<CombatActionType | null>(null);
  const socket = useSocket();

  // Real-time event handlers
  useEffect(() => {
    if (!isInitialized || !rendererRef.current) return;
    
    // Handle unit movement from other players
    const handleUnitMoved = (unitId: string, position: { x: number; y: number; z: number }) => {
      console.log('🎮 Unit moved:', unitId, position);
      if (rendererRef.current) {
        const scene = rendererRef.current.getScene();
        const unit = scene.getObjectByName(unitId);
        if (unit) {
          unit.position.set(position.x, position.y, position.z);
        }
      }
    };
    
    // Handle player joining
    const handlePlayerJoined = (player: any) => {
      console.log('👤 Player joined:', player);
      // Could spawn their units or update UI
    };
    
    // Handle turn changes
    const handleTurnStarted = (playerId: string) => {
      console.log('🎯 Turn started for:', playerId);
      // Update UI to show whose turn it is
    };
    
    // Subscribe to real-time events
    socket.on('unitMoved', handleUnitMoved);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('turnStarted', handleTurnStarted);
    
    return () => {
      socket.off('unitMoved');
      socket.off('playerJoined');
      socket.off('turnStarted');
    };
  }, [isInitialized, socket]);

  useEffect(() => {
    if (containerRef.current && !rendererRef.current) {
      try {
        // Initialize the tactical renderer
        rendererRef.current = new TacticalRenderer(containerRef.current);
        
        // Set up interaction callbacks
        setupInteractionHandlers(rendererRef.current);
        
        // Create a basic demo scene
        setupDemoScene(rendererRef.current);
        
        setIsInitialized(true);
        console.log('✅ TacticalView initialized successfully');
        
        // Initialize game log
        addToGameLog('Tactical View initialized');
        
        // Load characters after initialization
        loadCharacters();
      } catch (error) {
        console.error('❌ Failed to initialize TacticalView:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
        setIsInitialized(false);
      }
    };
  }, []);

  // Load characters and display them in the tactical view (only for setup mode)
  const loadCharacters = async () => {
    if (!rendererRef.current || gameState !== 'setup') return;
    
    setLoadingCharacters(true);
    try {
      const response = await characterService.getCharacters();
      
      if (response.success && response.data) {
        const userCharacters = response.data.characters;
        setCharacters(userCharacters);          // Only show character preview in setup mode
        if (gameState === 'setup') {
          // Clear existing character units (keep demo units for now)
          const renderer = rendererRef.current;
          
          // Add character units to the scene as preview - spread them out more on the larger battlefield
          userCharacters.slice(0, 3).forEach((character, index) => {
            // Position characters in a line with more spacing for the larger map
            const position = new THREE.Vector3(
              -8 + index * 6, // More space between characters
              0,
              -20 // Position them further back on the larger battlefield
            );
            
            renderer.addCharacterUnit(character, position);
            console.log(`✅ Added character ${character.name} to tactical view (preview)`);
          });
          
          console.log(`✅ Loaded ${userCharacters.length} characters into tactical view`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load characters:', error);
    } finally {
      setLoadingCharacters(false);
    }
  };

  const setupDemoScene = (renderer: TacticalRenderer) => {
    // Create large enhanced tactical battlefield
    renderer.createLargeBattlefield(80, 60);
    
    // Add some demo units spread across the larger battlefield
    const playerPos = new THREE.Vector3(-10, 0, -8);
    renderer.addUnit(
      'player1', 
      playerPos, 
      0x00ff00 // Green for player
    );
    
    const enemyPos = new THREE.Vector3(15, 0, 12);
    renderer.addUnit(
      'enemy1', 
      enemyPos, 
      0xff0000 // Red for enemy
    );
    
    const allyPos = new THREE.Vector3(-5, 0, 8);
    renderer.addUnit(
      'ally1', 
      allyPos, 
      0x0000ff // Blue for ally
    );
    
    // Additional units across the battlefield
    renderer.addUnit(
      'enemy2',
      new THREE.Vector3(25, 0, -15),
      0xff0000
    );
    
    renderer.addUnit(
      'enemy3',
      new THREE.Vector3(-20, 0, 18),
      0xff0000
    );
    
    renderer.addUnit(
      'ally2',
      new THREE.Vector3(8, 0, -12),
      0x0000ff
    );
    
    // Start with player1 selected and camera centered
    setTimeout(() => {
      const playerUnit = renderer.getScene().getObjectByName('player1');
      if (playerUnit) {
        renderer.selectUnit(playerUnit);
      }
    }, 500);
    
    // Add strategic tactical cover/obstacles spread across the battlefield
    renderer.addObstacle(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(3, 1.5, 1), // width, height, depth
      0x8B4513 // Brown for cover
    );
    
    renderer.addObstacle(
      new THREE.Vector3(12, 0, -8),
      new THREE.Vector3(2, 2, 4),
      0x696969 // Gray for wall
    );
    
    renderer.addObstacle(
      new THREE.Vector3(-15, 0, 5),
      new THREE.Vector3(2.5, 1, 3),
      0x8B4513 // Brown for crate
    );
    
    // Additional cover positions across the large map
    renderer.addObstacle(
      new THREE.Vector3(20, 0, 10),
      new THREE.Vector3(4, 1.2, 2),
      0x8B4513
    );
    
    renderer.addObstacle(
      new THREE.Vector3(-25, 0, -10),
      new THREE.Vector3(3, 1.8, 1.5),
      0x696969
    );
    
    renderer.addObstacle(
      new THREE.Vector3(8, 0, 20),
      new THREE.Vector3(2, 1, 4),
      0x8B4513
    );
    
    // Add initial game log entry
    addToGameLog('Large tactical battlefield loaded - 80x60 units with multiple zones');
  };

  // Set up interaction event handlers
  const setupInteractionHandlers = (renderer: TacticalRenderer) => {
    // Handle unit selection
    renderer.setOnUnitSelected((unit) => {
      setSelectedUnit(unit.userData);
      addToGameLog(`Selected: ${unit.userData.characterName || unit.name}`);
      console.log('🎯 Unit selected:', unit.userData);
    });
    
    // Handle unit movement
    renderer.setOnUnitMoved((unitId, position) => {
      addToGameLog(`Unit ${unitId} moved to (${position.x.toFixed(1)}, ${position.z.toFixed(1)})`);
      
      // Emit movement to other players via socket
      socket.moveUnit(unitId, { x: position.x, y: position.y, z: position.z });
      
      // Notify parent component of character position update
      onCharacterPositionUpdate?.(unitId, { x: position.x, z: position.z });
    });
    
    // Handle ground clicks
    renderer.setOnGroundClicked((position) => {
      if (combatEngine && currentSelectedAction) {
        handleCombatClick(position);
      } else if (selectedUnit) {
        addToGameLog(`Moving ${selectedUnit.characterName || selectedUnit.id} to (${position.x.toFixed(1)}, ${position.z.toFixed(1)})`);
      } else {
        addToGameLog(`Clicked ground at (${position.x.toFixed(1)}, ${position.z.toFixed(1)})`);
      }
    });
  };

  // Add message to game log
  const addToGameLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setGameLog(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]); // Keep last 10 messages
  };

  // Clear game log
  const clearGameLog = () => {
    setGameLog([]);
  };

  // Handle unit deselection
  const handleDeselectUnit = () => {
    if (rendererRef.current) {
      const selectedUnitObj = rendererRef.current.getSelectedUnit();
      if (selectedUnitObj) {
        // Trigger deselection
        setSelectedUnit(null);
        addToGameLog('Unit deselected');
      }
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    }
  };

  // Handle deployed characters changes
  useEffect(() => {
    if (!rendererRef.current || !isInitialized) return;
    
    // Clear existing player characters (keep demo units)
    characters.forEach(char => {
      rendererRef.current?.removeUnit(char.id);
    });
    
    // Add deployed characters to the tactical view
    deployedCharacters.forEach((deployedChar) => {
      if (deployedChar.deployPosition) {
        const position = new THREE.Vector3(
          deployedChar.deployPosition.x,
          0,
          deployedChar.deployPosition.z
        );
        
        rendererRef.current?.addCharacterUnit(deployedChar, position);
        console.log(`✅ Deployed character ${deployedChar.name} at position`, deployedChar.deployPosition);
      }
    });
    
    if (deployedCharacters.length > 0) {
      addToGameLog(`Deployed ${deployedCharacters.length} characters to the battlefield`);
    }
  }, [deployedCharacters, isInitialized]);

  // Initialize combat when game state becomes active
  useEffect(() => {
    if (gameState === 'active' && deployedCharacters.length > 0 && !combatEngine) {
      initializeCombat();
    }
  }, [gameState, deployedCharacters, combatEngine]);

  const initializeCombat = () => {
    const newCombatEngine = new CombatEngine();
    
    // Add player characters to combat
    deployedCharacters.forEach((char, index) => {
      const position = new THREE.Vector3(
        char.deployPosition?.x || -15 + index * 4, // Spread out more on larger battlefield
        0,
        char.deployPosition?.z || -25 // Start further back
      );
      newCombatEngine.addUnit(char, position, 'player');
    });
    
    // Add enemy units for demonstration - spread across the larger battlefield
    const enemyPositions = [
      new THREE.Vector3(15, 0, 20),   // Northeast sector
      new THREE.Vector3(25, 0, 10),   // East sector  
      new THREE.Vector3(10, 0, 25),   // North sector
      new THREE.Vector3(20, 0, 15),   // Central east
      new THREE.Vector3(5, 0, 30),    // Far north
    ];
    
    enemyPositions.forEach((pos, index) => {
      // Create mock enemy character
      const enemyChar = {
        id: `enemy_${index}`,
        name: `Enemy ${index + 1}`,
        class: 'assault' as const,
        health: 80,
        maxHealth: 80,
        stats: {
          strength: 15,
          agility: 12,
          intelligence: 10,
          endurance: 14,
          marksmanship: 13,
          medical: 8
        }
      };
      
      newCombatEngine.addUnit(enemyChar as any, pos, 'enemy');
    });
    
    // Set up combat event listeners
    newCombatEngine.on('combatStarted', () => {
      addToGameLog('Combat has begun!');
    });
    
    newCombatEngine.on('turnStarted', (_turn: any, unit: any) => {
      addToGameLog(`${unit.name}'s turn (${unit.faction})`);
    });
    
    newCombatEngine.on('actionExecuted', (action: any, unit: any) => {
      addToGameLog(`${unit.name} used ${action.type}`);
    });
    
    newCombatEngine.on('attackHit', (attackerId: string, targetId: string, damage: number, critical: boolean) => {
      const attacker = newCombatEngine.getUnit(attackerId);
      const target = newCombatEngine.getUnit(targetId);
      addToGameLog(`${attacker?.name} hit ${target?.name} for ${damage} damage${critical ? ' (Critical!)' : ''}`);
    });
    
    newCombatEngine.on('unitEliminated', (unitId: string) => {
      const unit = newCombatEngine.getUnit(unitId);
      addToGameLog(`${unit?.name} has been eliminated!`);
    });
    
    newCombatEngine.on('combatEnded', (result: string) => {
      addToGameLog(`Combat ended: ${result.replace('_', ' ')}`);
    });
    
    setCombatEngine(newCombatEngine);
    
    // Notify parent component that combat engine is ready
    onCombatEngineCreated?.(newCombatEngine);
    
    // Start combat after a brief delay
    setTimeout(() => {
      newCombatEngine.startCombat();
    }, 1000);
  };

  const handleActionSelected = (actionType: CombatActionType) => {
    setSelectedAction(actionType);
    addToGameLog(`Selected action: ${actionType}`);
  };

  // Use external action selection if provided (for in-game HUD), otherwise use internal
  const currentSelectedAction = externalSelectedAction || selectedAction;

  const handleCombatClick = (position: THREE.Vector3, clickedObject?: any) => {
    if (!combatEngine || !currentSelectedAction) return;
    
    const activeUnit = combatEngine.getActiveUnit();
    if (!activeUnit || activeUnit.faction !== 'player') return;
    
    // Execute different actions based on selected action type
    switch (currentSelectedAction) {
      case 'move':
        combatEngine.executeAction({
          type: 'move',
          actorId: activeUnit.id,
          targetType: 'ground',
          targetPosition: { x: position.x, y: position.y, z: position.z },
          actionPointCost: 1
        });
        break;
        
      case 'attack':
        if (clickedObject?.userData?.type === 'unit') {
          const targetUnit = combatEngine.getUnit(clickedObject.name);
          if (targetUnit && targetUnit.faction === 'enemy') {
            combatEngine.executeAction({
              type: 'attack',
              actorId: activeUnit.id,
              targetType: 'unit',
              targetId: targetUnit.id,
              actionPointCost: 2,
              damageType: 'ballistic'
            });
          }
        }
        break;
        
      case 'defend':
        combatEngine.executeAction({
          type: 'defend',
          actorId: activeUnit.id,
          targetType: 'self',
          actionPointCost: 1
        });
        break;
    }
    
    // Clear action selection only if using internal selection
    if (!externalSelectedAction) {
      setSelectedAction(null);
    }
  };

  return (
    <div className={`tactical-view-wrapper ${className} ${hideUIElements ? 'distraction-free' : ''}`}>
      {!hideUIElements && (
        <div className="tactical-view-header">
          <h3>Tactical View</h3>
          <div className="tactical-controls">
            <ConnectionStatus showDetails={false} />
            <button 
              onClick={handleFullscreen}
              className="control-button"
              title="Fullscreen"
            >
              🔳
            </button>
            {selectedUnit && (
              <button
                onClick={handleDeselectUnit}
                className="control-button deselect-btn"
                title="Deselect Unit"
              >
                ❌ Deselect
              </button>
            )}
            <div className="status-indicator">
              <span className={`status-dot ${isInitialized ? 'active' : 'inactive'}`} />
              {isInitialized ? 'Ready' : 'Loading...'}
            </div>
            {loadingCharacters && (
              <div className="loading-characters">
                Loading characters...
              </div>
            )}
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="tactical-view-container"
        style={{ 
          width: '100%', 
          height: height,
          border: hideUIElements ? 'none' : '2px solid #333',
          borderRadius: hideUIElements ? '0' : '8px',
          backgroundColor: '#1a1a1a',
          position: 'relative',
          overflow: 'hidden'
        }}
      />
      
      {/* Combat UI - only show when combat is active and UI elements not hidden */}
      {!hideUIElements && combatEngine && gameState === 'active' && (
        <div className="combat-ui-panel">
          <CombatUI 
            combatEngine={combatEngine}
            onActionSelected={handleActionSelected}
          />
        </div>
      )}
      
      {/* Selected Unit Info Panel - hidden in distraction-free mode */}
      {!hideUIElements && selectedUnit && (
        <div className="selected-unit-info">
          <h4>Selected Unit</h4>
          <div className="unit-details">
            <p><strong>Name:</strong> {selectedUnit.characterName || selectedUnit.id}</p>
            {selectedUnit.character && (
              <>
                <p><strong>Class:</strong> {selectedUnit.character.class}</p>
                <p><strong>Health:</strong> {selectedUnit.character.stats?.health || 100}</p>
                <p><strong>Stats:</strong> STR: {selectedUnit.character.stats?.strength || 0}, 
                   AGI: {selectedUnit.character.stats?.agility || 0}</p>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Game Log Panel - hidden in distraction-free mode */}
      {!hideUIElements && gameLog.length > 0 && (
        <div className="game-log-panel">
          <div className="game-log-header">
            <h4>Game Log</h4>
            <button onClick={clearGameLog} className="clear-log-btn">Clear</button>
          </div>
          <div className="game-log-content">
            {gameLog.map((entry, index) => (
              <div key={index} className="log-entry">{entry}</div>
            ))}
          </div>
        </div>
      )}
      
      {!isInitialized && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>Initializing 3D engine...</p>
        </div>
      )}
      
      {!hideUIElements && (
        <div className="tactical-view-footer">
          <div className="tactical-info">
            <span>🖱️ Left click: Select units | 🖱️ Right click: Deselect | 🖱️ Click ground: Move selected unit | 🖲️ Mouse wheel: Zoom</span>
            {gameState !== 'setup' && (
              <span className="game-state-info"> | Game State: {gameState.toUpperCase()}</span>
            )}
          </div>
          <div className="tactical-legend">
            {gameState === 'setup' && (
              <>
                <span className="legend-item">
                  <span className="legend-color green" /> Character Preview
                </span>
                <span className="legend-item">
                  <span className="legend-color blue" /> Demo Ally
                </span>
                <span className="legend-item">
                  <span className="legend-color red" /> Demo Enemy
                </span>
              </>
            )}
            {gameState !== 'setup' && (
              <>
                <span className="legend-item">
                  <span className="legend-color multi" /> Deployed Squad ({deployedCharacters.length})
                </span>
                <span className="legend-item">
                  <span className="legend-color red" /> Hostile Forces
                </span>
              </>
            )}
            <span className="legend-item">
              <span className="legend-color brown" /> Cover
            </span>
            {characters.length > 0 && gameState === 'setup' && (
              <span className="legend-item">
                <span className="legend-color multi" /> Available Characters ({characters.length})
              </span>
            )}
            {selectedUnit && (
              <span className="legend-item selected-indicator">
                <span className="legend-color yellow" /> Selected: {selectedUnit.characterName || selectedUnit.id}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};