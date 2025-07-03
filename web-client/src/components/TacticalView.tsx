import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TacticalRenderer } from '../systems/rendering/TacticalRenderer';
import { useSocket } from '../hooks/useSocket';
import { ConnectionStatus } from './ConnectionStatus';
import './TacticalView.css';

interface TacticalViewProps {
  className?: string;
  height?: number;
}

/**
 * React component that renders the tactical 3D view
 * Manages the TacticalRenderer lifecycle and provides game state integration
 */
export const TacticalView: React.FC<TacticalViewProps> = ({ 
  className = '',
  height = 600
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<TacticalRenderer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
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
        
        // Create a basic demo scene
        setupDemoScene(rendererRef.current);
        
        setIsInitialized(true);
        console.log('✅ TacticalView initialized successfully');
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

  const setupDemoScene = (renderer: TacticalRenderer) => {
    // Create basic tactical map
    renderer.createBasicMap(20, 20);
    
    // Add some demo units
    renderer.addUnit(
      'player1', 
      new THREE.Vector3(-3, 0, -3), 
      0x00ff00 // Green for player
    );
    
    renderer.addUnit(
      'enemy1', 
      new THREE.Vector3(3, 0, 3), 
      0xff0000 // Red for enemy
    );
    
    renderer.addUnit(
      'ally1', 
      new THREE.Vector3(-1, 0, 2), 
      0x0000ff // Blue for ally
    );
    
    // Add some tactical cover/obstacles
    renderer.addObstacle(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(2, 1, 0.5), // width, height, depth
      0x8B4513 // Brown for cover
    );
    
    renderer.addObstacle(
      new THREE.Vector3(4, 0, -2),
      new THREE.Vector3(1, 1.5, 1),
      0x696969 // Gray for wall
    );
    
    renderer.addObstacle(
      new THREE.Vector3(-4, 0, 1),
      new THREE.Vector3(1.5, 0.8, 2),
      0x8B4513 // Brown for crate
    );
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className={`tactical-view-wrapper ${className}`}>
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
          <div className="status-indicator">
            <span className={`status-dot ${isInitialized ? 'active' : 'inactive'}`} />
            {isInitialized ? 'Ready' : 'Loading...'}
          </div>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="tactical-view-container"
        style={{ 
          width: '100%', 
          height: height,
          border: '2px solid #333',
          borderRadius: '8px',
          backgroundColor: '#1a1a1a',
          position: 'relative',
          overflow: 'hidden'
        }}
      />
      
      {!isInitialized && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>Initializing 3D engine...</p>
        </div>
      )}
      
      <div className="tactical-view-footer">
        <div className="tactical-info">
          <span>Mouse wheel: Zoom | WASD: Move (coming soon)</span>
        </div>
        <div className="tactical-legend">
          <span className="legend-item">
            <span className="legend-color green" /> Player
          </span>
          <span className="legend-item">
            <span className="legend-color blue" /> Ally
          </span>
          <span className="legend-item">
            <span className="legend-color red" /> Enemy
          </span>
          <span className="legend-item">
            <span className="legend-color brown" /> Cover
          </span>
        </div>
      </div>
    </div>
  );
};