import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TacticalRenderer } from '../systems/rendering/TacticalRenderer';
import { WEAPONS } from '../systems/combat/CombatSystem';
import { HealthBar } from './ui/HealthBar';
import { WeaponDisplay } from './ui/WeaponDisplay';
import { useSocket } from '../hooks/useSocket';
import { ConnectionStatus } from './ConnectionStatus';
import { characterService } from '../services/CharacterService';
import { Character } from '@shared/types';
import './TacticalView.css';

interface TacticalViewProps {
  className?: string;
  height?: number | string;
  deployedCharacters?: any[];
  gameState?: 'setup' | 'deployment' | 'active' | 'paused';
  onCharacterPositionUpdate?: (characterId: string, position: { x: number; z: number }) => void;
  hideUIElements?: boolean; // For distraction-free gameplay
  singleCharacterMode?: boolean; // Disable character switching for single character gameplay
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
  singleCharacterMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<TacticalRenderer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [activePlayerUnit, setActivePlayerUnit] = useState<any>(null); // Currently controlled unit
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerMaxHealth, setPlayerMaxHealth] = useState(100);
  const [weaponInfo, setWeaponInfo] = useState<{ ammo: number; maxAmmo: number; isReloading: boolean } | null>(null);
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
    // Create clean test map for collision testing (40x30 units)
    renderer.createCleanTestMap(40, 30);
    
    // Add some demo units positioned for the clean test map (40x30)
    const playerPos = new THREE.Vector3(-3, 0, -12); // Player area (bottom of map)
    const playerUnit = renderer.addUnit(
      'player1', 
      playerPos, 
      0x00ff00 // Green for player
    );
    if (playerUnit) {
      playerUnit.userData.faction = 'player';
      // Add to combat system with assault rifle
      renderer.addCombatUnit('player1', playerUnit, WEAPONS.ASSAULT_RIFLE, 'player');
    }
    
    const enemyPos = new THREE.Vector3(8, 0, 10); // Enemy in open area
    const enemyUnit = renderer.addUnit(
      'enemy1', 
      enemyPos, 
      0xff0000 // Red for enemy
    );
    if (enemyUnit) {
      enemyUnit.userData.faction = 'enemy';
      // Add to combat system with SMG
      renderer.addCombatUnit('enemy1', enemyUnit, WEAPONS.SMG, 'enemy');
    }
    
    const allyPos = new THREE.Vector3(-8, 0, 5); // AI teammate positioned for testing
    const allyUnit = renderer.addUnit(
      'ally1', 
      allyPos, 
      0x0088ff // Light blue for AI teammate
    );
    if (allyUnit) {
      allyUnit.userData.faction = 'ally'; // Mark as AI ally, not player-controlled
      allyUnit.userData.aiControlled = true;
      // Add to combat system with pistol
      renderer.addCombatUnit('ally1', allyUnit, WEAPONS.PISTOL, 'player');
    }
    
    // Additional units across the battlefield
    const enemy2Unit = renderer.addUnit(
      'enemy2',
      new THREE.Vector3(25, 0, -15),
      0xff0000
    );
    if (enemy2Unit) {
      enemy2Unit.userData.faction = 'enemy';
      // Add to combat system with assault rifle
      renderer.addCombatUnit('enemy2', enemy2Unit, WEAPONS.ASSAULT_RIFLE, 'enemy');
    }
    
    const enemy3Unit = renderer.addUnit(
      'enemy3',
      new THREE.Vector3(-20, 0, 18),
      0xff0000
    );
    if (enemy3Unit) {
      enemy3Unit.userData.faction = 'enemy';
      // Add to combat system with sniper rifle
      renderer.addCombatUnit('enemy3', enemy3Unit, WEAPONS.SNIPER_RIFLE, 'enemy');
    }
    
    const ally2Unit = renderer.addUnit(
      'ally2',
      new THREE.Vector3(8, 0, -12),
      0x0088ff // Light blue for AI teammate
    );
    if (ally2Unit) {
      ally2Unit.userData.faction = 'ally'; // Mark as AI ally, not player-controlled
      ally2Unit.userData.aiControlled = true;
      // Add to combat system with assault rifle
      renderer.addCombatUnit('ally2', ally2Unit, WEAPONS.ASSAULT_RIFLE, 'player');
    }
    
    // Start with player1 selected and as the active controllable unit
    setTimeout(() => {
      const playerUnitObj = renderer.getScene().getObjectByName('player1');
      if (playerUnitObj) {
        console.log('🎮 Auto-selecting player1 for control');
        renderer.selectUnit(playerUnitObj);
        
        // In single character mode, automatically set as active player unit
        if (singleCharacterMode) {
          setActivePlayerUnit({ 
            id: 'player1', 
            characterName: 'Player',
            faction: 'player' 
          });
          renderer.setActivePlayerUnit(playerUnitObj);
          addToGameLog('🎮 You control the GREEN unit only');
          addToGameLog('🔫 Click RED enemies to shoot them!');
          addToGameLog('🤖 Light blue units are AI allies');
          addToGameLog('💥 Watch for hit/miss messages in this log');
          addToGameLog('⚡ Use WASD keys to move around');
        }
      }
    }, 500);
    
    // Clean test map - no obstacles initially for clean collision testing
    // Note: You can add test collision objects using renderer.addTestWall() or renderer.addTestObstacle()
    console.log('🧪 Clean test map ready for collision testing');
    console.log('📝 Available test methods:');
    console.log('   - renderer.addTestWall(position, size, color)');
    console.log('   - renderer.addTestObstacle(position, radius, color)');
    console.log('   - renderer.addTestCollisionBoundaries() - adds predefined test walls');
    console.log('   - renderer.clearTestObjects() - removes all test objects');
    
    // Add initial game log entry
    addToGameLog('🧪 Clean test map loaded - ready for collision testing (40x30 units)');
  };

  // Set up interaction event handlers
  const setupInteractionHandlers = (renderer: TacticalRenderer) => {
    // Handle unit selection
    renderer.setOnUnitSelected((unit) => {
      setSelectedUnit(unit.userData);
      
      // In single character mode, restrict character switching
      if (singleCharacterMode) {
        // Only allow meaningful interaction with our own character or targeting enemies
        if (unit.userData?.faction === 'enemy') {
          addToGameLog(`🎯 Targeting enemy: ${unit.userData.characterName || unit.name}`);
          // Don't set as selected unit - just acknowledge targeting
        } else if (unit.userData?.faction === 'player') {
          if (!activePlayerUnit) {
            // First time selecting a player character
            setActivePlayerUnit(unit.userData);
            renderer.setActivePlayerUnit(unit);
            addToGameLog(`🎮 Now controlling: ${unit.userData.characterName || unit.name}`);
          } else if (activePlayerUnit.id === unit.userData.id) {
            // Re-selecting our own character
            addToGameLog(`🎮 Character selected: ${unit.userData.characterName || unit.name}`);
          } else {
            // Trying to switch to a different player character (teammate) - blocked
            addToGameLog(`⚠️ Cannot control teammates in single character mode`);
            return; // Don't change selection
          }
        } else if (unit.userData?.faction === 'ally') {
          // AI-controlled ally - cannot control
          addToGameLog(`🤖 AI ally: ${unit.userData.characterName || unit.name} (AI controlled)`);
          return;
        } else {
          // Other units (neutral, etc.) - no interaction
          addToGameLog(`❌ Cannot interact with ${unit.userData.characterName || unit.name}`);
          return;
        }
      } else {
        // Multi-character mode (original behavior)
        if (unit.userData?.faction === 'player') {
          setActivePlayerUnit(unit.userData);
          renderer.setActivePlayerUnit(unit);
          addToGameLog(`🎮 Now controlling: ${unit.userData.characterName || unit.name}`);
        } else {
          addToGameLog(`👁️ Selected: ${unit.userData.characterName || unit.name}`);
        }
      }
      
      console.log('🎯 Unit selected:', unit.userData);
    });
    
    // Handle unit movement (continuous real-time movement)
    renderer.setOnUnitMoved((unitId, position) => {
      // Only log major position changes to avoid spam
      addToGameLog(`🚶 Unit moving to (${position.x.toFixed(1)}, ${position.z.toFixed(1)})`);
      
      // Emit movement to other players via socket (throttled)
      socket.moveUnit(unitId, { x: position.x, y: position.y, z: position.z });
      
      // Notify parent component of character position update
      onCharacterPositionUpdate?.(unitId, { x: position.x, z: position.z });
    });
    
    // Handle ground clicks for movement commands
    renderer.setOnGroundClicked((position) => {
      if (singleCharacterMode) {
        // In single character mode, only move our controlled character
        if (activePlayerUnit) {
          const activeUnit = renderer.getActivePlayerUnit();
          if (activeUnit) {
            renderer.moveUnitToPosition(activeUnit.name, position);
            addToGameLog(`🎯 Moving to (${position.x.toFixed(1)}, ${position.z.toFixed(1)})`);
          }
        } else {
          addToGameLog(`❌ No character to move`);
        }
      } else {
        // Multi-character mode - move selected unit if it's a player unit
        if (activePlayerUnit && selectedUnit?.faction === 'player') {
          const activeUnit = renderer.getActivePlayerUnit();
          if (activeUnit) {
            renderer.moveUnitToPosition(activeUnit.name, position);
            addToGameLog(`🎯 Moving to (${position.x.toFixed(1)}, ${position.z.toFixed(1)})`);
          }
        } else {
          addToGameLog(`👆 Clicked ground at (${position.x.toFixed(1)}, ${position.z.toFixed(1)})`);
        }
      }
    });

    // Set up combat system callbacks
    renderer.setOnShotFired((result) => {
      addToGameLog(`🔫 SHOT FIRED! Target: ${result.target?.name || 'unknown'}`);
      if (result.hit) {
        addToGameLog(`🎯 HIT! Damage: ${result.damage}`);
        if (result.target) {
          // Update health if we hit a target
          const health = result.target.health;
          const maxHealth = result.target.maxHealth;
          
          if (result.target.faction === 'player') {
            setPlayerHealth(health);
            setPlayerMaxHealth(maxHealth);
          }
          
          addToGameLog(`💔 ${result.target.name} health: ${health}/${maxHealth}`);
          
          if (!result.target.isAlive) {
            addToGameLog(`💀 ${result.target.name} eliminated!`);
          }
        }
      } else {
        addToGameLog(`❌ MISSED! No damage dealt`);
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
    
    // Add deployed characters to the tactical view with player faction
    deployedCharacters.forEach((deployedChar) => {
      if (deployedChar.deployPosition) {
        const position = new THREE.Vector3(
          deployedChar.deployPosition.x,
          0,
          deployedChar.deployPosition.z
        );
        
        const unit = rendererRef.current?.addCharacterUnit(deployedChar, position);
        if (unit) {
          // Mark as player-controlled unit
          unit.userData.faction = 'player';
          
          // Add to combat system with appropriate weapon based on class
          let weapon = WEAPONS.ASSAULT_RIFLE; // Default
          switch (deployedChar.class) {
            case 'sniper':
              weapon = WEAPONS.SNIPER_RIFLE;
              break;
            case 'medic':
              weapon = WEAPONS.PISTOL;
              break;
            case 'assault':
            case 'engineer':
            case 'demolitions':
            default:
              weapon = WEAPONS.ASSAULT_RIFLE;
              break;
          }
          
          rendererRef.current?.addCombatUnit(deployedChar.id, unit, weapon, 'player');
        }
        console.log(`✅ Deployed character ${deployedChar.name} at position`, deployedChar.deployPosition);
      }
    });
    
    if (deployedCharacters.length > 0) {
      addToGameLog(`📍 Deployed ${deployedCharacters.length} player characters`);
      
      // Auto-select the first deployed character as the active unit
      const firstDeployedChar = deployedCharacters[0];
      if (firstDeployedChar && rendererRef.current) {
        setTimeout(() => {
          const unit = rendererRef.current?.getScene().getObjectByName(firstDeployedChar.id);
          if (unit) {
            rendererRef.current?.selectUnit(unit);
          }
        }, 500);
      }
    }
  }, [deployedCharacters, isInitialized]);

  // Initialize real-time gameplay when game state becomes active
  useEffect(() => {
    if (gameState === 'active' && deployedCharacters.length > 0) {
      initializeRealTimeGameplay();
    }
  }, [gameState, deployedCharacters]);

  const initializeRealTimeGameplay = () => {
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
      
      const unit = rendererRef.current?.addCharacterUnit(enemyChar as any, pos);
      if (unit) {
        // Mark as enemy unit
        unit.userData.faction = 'enemy';
      }
    });
    
    addToGameLog('🎮 Real-time gameplay initialized!');
    addToGameLog('💡 Use WASD to move your character');
    addToGameLog('🔫 Left-click on RED enemies to shoot!');
    addToGameLog('💡 Click ground to move with mouse');
    if (!singleCharacterMode) {
      addToGameLog('💡 Click other player units to switch control');
    }
  };

  // --- ENEMY AI MOVEMENT SYSTEM ---
  useEffect(() => {
    if (!isInitialized || !rendererRef.current) return;
    if (gameState !== 'active') return;

    // Store interval ID for cleanup
    let aiInterval: ReturnType<typeof setInterval> | null = null;

    // Helper to move an enemy unit in a random direction
    const moveEnemyRandomly = (enemyObj: THREE.Object3D) => {
      // Pick a random direction and distance
      const angle = Math.random() * Math.PI * 2;
      const distance = 2 + Math.random() * 3; // Move 2-5 units
      const dx = Math.cos(angle) * distance;
      const dz = Math.sin(angle) * distance;
      const newPos = enemyObj.position.clone();
      newPos.x += dx;
      newPos.z += dz;
      // Clamp to map bounds (assuming 40x30 test map)
      newPos.x = Math.max(-19, Math.min(19, newPos.x));
      newPos.z = Math.max(-14, Math.min(14, newPos.z));
      rendererRef.current?.moveUnitToPosition(enemyObj.name, newPos);
    };

    aiInterval = setInterval(() => {
      if (!rendererRef.current) return;
      const scene = rendererRef.current.getScene();
      // Find all enemy units
      scene.children.forEach(obj => {
        if (obj.userData?.faction === 'enemy') {
          // 50% chance to move this tick
          if (Math.random() < 0.5) moveEnemyRandomly(obj);
        }
      });
    }, 2000); // Every 2 seconds

    return () => {
      if (aiInterval) clearInterval(aiInterval);
    };
  }, [isInitialized, gameState]);

  // Track weapon info for active player unit
  useEffect(() => {
    if (activePlayerUnit && rendererRef.current) {
      const updateWeaponInfo = () => {
        const info = rendererRef.current?.getUnitWeaponInfo(activePlayerUnit.id || activePlayerUnit.characterName);
        setWeaponInfo(info || null);
      };
      
      // Update weapon info immediately
      updateWeaponInfo();
      
      // Set up interval to update weapon info regularly (for reload status, ammo changes)
      const interval = setInterval(updateWeaponInfo, 100);
      
      return () => clearInterval(interval);
    } else {
      setWeaponInfo(null);
    }
  }, [activePlayerUnit]);

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
      
      {/* Real-time Control Panel - only show when game is active and UI elements not hidden */}
      {!hideUIElements && gameState === 'active' && (
        <div className="realtime-control-panel">
          <div className="control-header">
            <h4>🎮 Real-time Controls</h4>
            {activePlayerUnit && (
              <span className="active-unit-indicator">
                Controlling: {activePlayerUnit.characterName || activePlayerUnit.id}
              </span>
            )}
          </div>
          
          {/* Combat UI Components */}
          {activePlayerUnit && (
            <div className="combat-ui-section">
              <div className="combat-stats">
                <HealthBar 
                  health={playerHealth}
                  maxHealth={playerMaxHealth}
                  size="medium"
                />
                {weaponInfo && (
                  <WeaponDisplay
                    weaponName="Assault Rifle"
                    ammo={weaponInfo.ammo}
                    maxAmmo={weaponInfo.maxAmmo}
                    isReloading={weaponInfo.isReloading}
                    canShoot={!weaponInfo.isReloading && weaponInfo.ammo > 0}
                  />
                )}
              </div>
            </div>
          )}
          
          <div className="control-instructions">
            <div className="instruction-row">
              <span className="key-combo">WASD</span>
              <span className="description">Move {singleCharacterMode ? 'your character' : 'active character'}</span>
            </div>
            {!singleCharacterMode && (
              <div className="instruction-row">
                <span className="key-combo">Click Unit</span>
                <span className="description">Switch control to another character</span>
              </div>
            )}
            <div className="instruction-row">
              <span className="key-combo">Click Ground</span>
              <span className="description">Move {singleCharacterMode ? 'your character' : 'active character'} to location</span>
            </div>
            <div className="instruction-row">
              <span className="key-combo">Click Enemy</span>
              <span className="description">🔫 Shoot at enemy target</span>
            </div>
          </div>
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
            {selectedUnit.faction === 'player' && (
              <p><strong>🎮 Controllable:</strong> Use WASD to move</p>
            )}
            {selectedUnit.faction === 'enemy' && (
              <p><strong>⚔️ Enemy Unit:</strong> Cannot control</p>
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
            <br />
            <span>⌨️ WASD: Move {singleCharacterMode ? 'your character' : 'active character'} (real-time){!singleCharacterMode ? ' | Click player units to switch control' : ''}</span>
            {gameState !== 'setup' && (
              <span className="game-state-info"> | Game Mode: REAL-TIME {gameState.toUpperCase()}</span>
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
                <span className="legend-color yellow" /> 
                {selectedUnit.faction === 'player' ? '🎮 ' : '👁️ '}
                Selected: {selectedUnit.characterName || selectedUnit.id}
              </span>
            )}
            {activePlayerUnit && activePlayerUnit !== selectedUnit && (
              <span className="legend-item active-indicator">
                <span className="legend-color blue" /> 🎮 Controlling: {activePlayerUnit.characterName || activePlayerUnit.id}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};