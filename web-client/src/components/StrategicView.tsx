import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Army } from '../systems/HybridGameManager';
import './StrategicView.css';

interface StrategicViewProps {
  armies: Army[];
  selectedArmyId: string | null;
  onArmySelect: (armyId: string) => void;
  onArmyMove: (destination: { x: number; z: number }) => void;
  resources: { food: number; materials: number; fuel: number };
  gameLog: string[];
}

export const StrategicView: React.FC<StrategicViewProps> = ({
  armies,
  selectedArmyId,
  onArmySelect,
  onArmyMove,
  resources,
  gameLog,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const armyMeshes = useRef<Map<string, THREE.Object3D>>(new Map());
  const raycaster = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouse = useRef<THREE.Vector2>(new THREE.Vector2());

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current || isInitialized) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a3d1a); // Dark green for strategic map
    sceneRef.current = scene;

    // Camera setup (orthographic for RTS view)
    const camera = new THREE.OrthographicCamera(-20, 20, 15, -15, 0.1, 1000);
    camera.position.set(0, 30, 0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create strategic map terrain
    createTerrain(scene);

    // Mouse interaction
    const canvas = renderer.domElement;
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleMouseMove);

    setIsInitialized(true);

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
    };
  }, []);

  // Create strategic map terrain
  const createTerrain = (scene: THREE.Scene) => {
    // Base terrain
    const terrainGeometry = new THREE.PlaneGeometry(40, 30);
    const terrainMaterial = new THREE.MeshLambertMaterial({
      color: 0x2d4a2d,
      transparent: true,
      opacity: 0.8,
    });
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);

    // Grid lines
    const gridHelper = new THREE.GridHelper(40, 20, 0x444444, 0x444444);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Add some strategic features
    addStrategicFeatures(scene);
  };

  const addStrategicFeatures = (scene: THREE.Scene) => {
    // Mountains
    const mountainGeometry = new THREE.ConeGeometry(2, 4, 6);
    const mountainMaterial = new THREE.MeshLambertMaterial({ color: 0x8b7355 });

    const mountain1 = new THREE.Mesh(mountainGeometry, mountainMaterial);
    mountain1.position.set(8, 2, 5);
    scene.add(mountain1);

    const mountain2 = new THREE.Mesh(mountainGeometry, mountainMaterial);
    mountain2.position.set(-12, 2, -8);
    scene.add(mountain2);

    // Forests
    const forestGeometry = new THREE.CylinderGeometry(1, 1.5, 3, 8);
    const forestMaterial = new THREE.MeshLambertMaterial({ color: 0x0f4a0f });

    for (let i = 0; i < 5; i++) {
      const tree = new THREE.Mesh(forestGeometry, forestMaterial);
      tree.position.set((Math.random() - 0.5) * 30, 1.5, (Math.random() - 0.5) * 20);
      scene.add(tree);
    }

    // Strategic objectives (flags)
    const flagGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const flagMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });

    const objective1 = new THREE.Mesh(flagGeometry, flagMaterial);
    objective1.position.set(15, 1.5, 10);
    scene.add(objective1);

    const objective2 = new THREE.Mesh(flagGeometry, flagMaterial);
    objective2.position.set(-15, 1.5, -10);
    scene.add(objective2);
  };

  // Update army positions
  useEffect(() => {
    if (!sceneRef.current || !isInitialized) return;

    // Remove old army meshes
    armyMeshes.current.forEach((mesh, armyId) => {
      if (!armies.find((a) => a.id === armyId)) {
        sceneRef.current!.remove(mesh);
        armyMeshes.current.delete(armyId);
      }
    });

    // Add or update army meshes
    armies.forEach((army) => {
      let armyMesh = armyMeshes.current.get(army.id);

      if (!armyMesh) {
        armyMesh = createArmyMesh(army);
        sceneRef.current!.add(armyMesh);
        armyMeshes.current.set(army.id, armyMesh);
      }

      // Update position
      armyMesh.position.set(army.position.x, 0.5, army.position.z);

      // Update selection highlight
      const isSelected = army.id === selectedArmyId;
      if (armyMesh.children.length > 1) {
        const selectionRing = armyMesh.children[1] as THREE.Mesh;
        selectionRing.visible = isSelected;
      }
    });

    // Render the scene
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [armies, selectedArmyId, isInitialized]);

  const createArmyMesh = (army: Army): THREE.Object3D => {
    const group = new THREE.Group();
    group.userData = { armyId: army.id, type: 'army' };

    // Army representation (different shapes for different factions)
    let geometry: THREE.BufferGeometry;
    let material: THREE.MeshLambertMaterial;

    if (army.faction === 'player') {
      geometry = new THREE.BoxGeometry(1, 1, 1);
      material = new THREE.MeshLambertMaterial({ color: 0x4caf50 });
    } else {
      geometry = new THREE.ConeGeometry(0.5, 1, 6);
      material = new THREE.MeshLambertMaterial({ color: 0xf44336 });
    }

    const armyMesh = new THREE.Mesh(geometry, material);
    armyMesh.castShadow = true;
    group.add(armyMesh);

    // Selection ring
    const ringGeometry = new THREE.RingGeometry(1.2, 1.4, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const selectionRing = new THREE.Mesh(ringGeometry, ringMaterial);
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.position.y = 0.1;
    selectionRing.visible = false;
    group.add(selectionRing);

    return group;
  };

  // Mouse interaction handlers
  const handleMouseMove = (event: MouseEvent) => {
    if (!mountRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const handleCanvasClick = (event: MouseEvent) => {
    if (!sceneRef.current || !cameraRef.current || !mountRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, cameraRef.current);

    // Check for army clicks
    const armyObjects = Array.from(armyMeshes.current.values());
    const armyIntersects = raycaster.current.intersectObjects(armyObjects, true);

    if (armyIntersects.length > 0) {
      const clickedObject = armyIntersects[0].object;
      let parent = clickedObject.parent;

      while (parent && !parent.userData.armyId) {
        parent = parent.parent;
      }

      if (parent && parent.userData.armyId) {
        onArmySelect(parent.userData.armyId);
        return;
      }
    }

    // Check for ground clicks (movement commands)
    const groundIntersects = raycaster.current.intersectObjects(
      sceneRef.current.children.filter(
        (obj) => obj instanceof THREE.Mesh && obj.geometry instanceof THREE.PlaneGeometry
      )
    );

    if (groundIntersects.length > 0 && selectedArmyId) {
      const point = groundIntersects[0].point;
      onArmyMove({ x: point.x, z: point.z });
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      rendererRef.current.setSize(width, height);

      const aspect = width / height;
      const frustumSize = 40;
      cameraRef.current.left = (-frustumSize * aspect) / 2;
      cameraRef.current.right = (frustumSize * aspect) / 2;
      cameraRef.current.top = frustumSize / 2;
      cameraRef.current.bottom = -frustumSize / 2;
      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="strategic-view">
      <div ref={mountRef} className="strategic-canvas" />

      {/* Strategic UI */}
      <div className="strategic-ui">
        {/* Resource Panel */}
        <div className="resource-panel">
          <h3>Resources</h3>
          <div className="resource-grid">
            <div className="resource-item">
              <span className="resource-icon">🍖</span>
              <span className="resource-value">{Math.floor(resources.food)}</span>
            </div>
            <div className="resource-item">
              <span className="resource-icon">⚙️</span>
              <span className="resource-value">{Math.floor(resources.materials)}</span>
            </div>
            <div className="resource-item">
              <span className="resource-icon">⛽</span>
              <span className="resource-value">{Math.floor(resources.fuel)}</span>
            </div>
          </div>
        </div>

        {/* Army Panel */}
        <div className="army-panel">
          <h3>Armies</h3>
          <div className="army-list">
            {armies.map((army) => (
              <div
                key={army.id}
                className={`army-item ${army.id === selectedArmyId ? 'selected' : ''} ${army.status}`}
                onClick={() => onArmySelect(army.id)}
              >
                <div className="army-name">{army.id}</div>
                <div className="army-info">
                  <span className="squad-count">{army.squads.length} squads</span>
                  <span className="army-status">{army.status}</span>
                </div>
                <div className="army-supplies">
                  <span>Food: {Math.floor(army.supplies.food)}</span>
                  <span>Morale: {Math.floor(army.supplies.morale)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="instructions-panel">
          <h4>Controls</h4>
          <ul>
            <li>Click army to select</li>
            <li>Click ground to move selected army</li>
            <li>When armies meet, tactical combat begins</li>
            <li>Press SPACE to pause</li>
          </ul>
        </div>

        {/* Game Log */}
        <div className="game-log-panel">
          <h4>Game Log</h4>
          <div className="log-entries">
            {gameLog.slice(-5).map((entry, index) => (
              <div key={index} className="log-entry">{entry}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
