import * as THREE from 'three';

/**
 * TacticalRenderer handles the WebGL rendering for the top-down tactical view
 * Manages scene, camera, lighting, and basic map rendering
 */
export class TacticalRenderer {
  private scene: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private renderer!: THREE.WebGLRenderer;
  private container: HTMLElement;
  private mapMesh: THREE.Mesh | null = null;

  // Camera controls for tactical view
  private cameraDistance = 20;
  private cameraTarget = new THREE.Vector3(0, 0, 0);

  // Fog of War System
  private fogOfWarEnabled = true;
  private visibilityRadius = 8; // Units can see 8 grid units around them
  private exploredAreas = new Set<string>(); // Stores explored grid coordinates
  private fogMesh: THREE.Mesh | null = null;
  private fogTexture: THREE.DataTexture | null = null;
  private fogData: Uint8Array | null = null;
  private mapWidth = 80;
  private mapHeight = 60;
  private fogResolution = 128; // Resolution of fog texture

  // Interaction system
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private selectedUnit: THREE.Object3D | null = null;
  private hoveredUnit: THREE.Object3D | null = null;

  // Event callbacks
  private onUnitSelectedCallback?: (unit: THREE.Object3D) => void;
  private onUnitMovedCallback?: (unitId: string, position: THREE.Vector3) => void;
  private onGroundClickedCallback?: (position: THREE.Vector3) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLighting();
    this.setupControls();

    // Start render loop
    this.animate();
  }

  private setupCamera() {
    // Orthographic camera for top-down tactical view - smaller FOV for fog of war
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const viewSize = 6; // Much smaller view for tactical visibility (was 10)

    this.camera = new THREE.OrthographicCamera(
      -viewSize * aspect, viewSize * aspect,
      viewSize, -viewSize,
      0.1, 1000
    );

    // Position camera above looking down
    this.camera.position.set(0, this.cameraDistance, 0);
    this.camera.lookAt(this.cameraTarget);
  }

  private setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x2a2a2a, 1);

    this.container.appendChild(this.renderer.domElement);
  }

  private setupLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    // Directional light from above (simulating overhead lighting)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 20, 0);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;

    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;

    this.scene.add(directionalLight);
  }

  private setupControls() {
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Basic mouse controls for camera movement
    this.container.addEventListener('wheel', this.onMouseWheel.bind(this));

    // Mouse interaction for unit selection and movement
    this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.container.addEventListener('click', this.onMouseClick.bind(this));
    this.container.addEventListener('contextmenu', this.onRightClick.bind(this));
  }

  private onWindowResize() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const viewSize = 6; // Tactical view size for fog of war

    this.camera.left = -viewSize * aspect;
    this.camera.right = viewSize * aspect;
    this.camera.top = viewSize;
    this.camera.bottom = -viewSize;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  private onMouseWheel(event: WheelEvent) {
    event.preventDefault();

    // Zoom in/out by adjusting camera distance
    this.cameraDistance += event.deltaY * 0.01;
    this.cameraDistance = Math.max(5, Math.min(50, this.cameraDistance));

    this.camera.position.y = this.cameraDistance;
  }

  private onMouseMove(event: MouseEvent) {
    // Update mouse coordinates for raycasting
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Handle unit hovering
    this.handleMouseHover();
  }

  private onMouseClick(event: MouseEvent) {
    event.preventDefault();

    // Update mouse coordinates
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Cast ray to find what was clicked
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;

      // Find the top-level unit group
      let unitObject = clickedObject;
      while (unitObject.parent && unitObject.parent !== this.scene) {
        unitObject = unitObject.parent;
      }

      // Check if we clicked on a unit
      if (unitObject.userData?.type === 'unit') {
        this.selectUnit(unitObject);
      } else if (unitObject === this.mapMesh && this.selectedUnit) {
        // Move selected unit to clicked position
        const clickPosition = intersects[0].point;
        clickPosition.y = 0; // Keep on ground level
        this.moveUnitToPosition(this.selectedUnit.name, clickPosition);
      } else {
        // Clicked on ground - call ground click callback
        const clickPosition = intersects[0].point;
        clickPosition.y = 0;
        this.onGroundClickedCallback?.(clickPosition);
      }
    }
  }

  private onRightClick(event: MouseEvent) {
    event.preventDefault();
    // Right click could be used for context menus or other actions
    this.deselectUnit();
  }

  private handleMouseHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    // Reset previous hover state
    if (this.hoveredUnit && this.hoveredUnit !== this.selectedUnit) {
      this.setUnitHoverState(this.hoveredUnit, false);
    }
    this.hoveredUnit = null;

    if (intersects.length > 0) {
      const hoveredObject = intersects[0].object;

      // Find the top-level unit group
      let unitObject = hoveredObject;
      while (unitObject.parent && unitObject.parent !== this.scene) {
        unitObject = unitObject.parent;
      }

      // Check if we're hovering over a unit
      if (unitObject.userData?.type === 'unit' && unitObject !== this.selectedUnit) {
        this.hoveredUnit = unitObject;
        this.setUnitHoverState(unitObject, true);
        this.container.style.cursor = 'pointer';
      } else {
        this.container.style.cursor = this.selectedUnit ? 'crosshair' : 'default';
      }
    } else {
      this.container.style.cursor = this.selectedUnit ? 'crosshair' : 'default';
    }
  }

  /**
   * Create a basic tactical map/grid
   */
  createBasicMap(width: number = 20, height: number = 20) {
    // Remove existing map
    if (this.mapMesh) {
      this.scene.remove(this.mapMesh);
    }

    // Create a plane for the ground
    const groundGeometry = new THREE.PlaneGeometry(width, height);
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0x4a5d23,
      transparent: true,
      opacity: 0.8
    });

    this.mapMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    this.mapMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    this.mapMesh.receiveShadow = true;
    this.scene.add(this.mapMesh);

    // Add grid lines for tactical positioning
    this.createGrid(width, height);
  }

  private createGrid(width: number, height: number) {
    const gridHelper = new THREE.GridHelper(
      Math.max(width, height),
      Math.max(width, height),
      0x888888,
      0x444444
    );
    gridHelper.position.y = 0.01; // Slightly above ground to avoid z-fighting
    this.scene.add(gridHelper);
  }

  /**
   * Create an enhanced tactical environment with varied terrain
   */
  createTacticalEnvironment(width: number = 20, height: number = 20) {
    // Remove existing map
    if (this.mapMesh) {
      this.scene.remove(this.mapMesh);
    }

    // Create a more detailed ground with texture-like appearance
    const groundGeometry = new THREE.PlaneGeometry(width, height, 20, 20);

    // Add some vertex displacement for terrain variation
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] += (Math.random() - 0.5) * 0.1; // Small height variations
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();

    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0x4a5d23,
      transparent: true,
      opacity: 0.9
    });

    this.mapMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    this.mapMesh.rotation.x = -Math.PI / 2;
    this.mapMesh.receiveShadow = true;
    this.mapMesh.userData = { type: 'ground' };
    this.scene.add(this.mapMesh);

    // Enhanced grid with tactical markings
    this.createTacticalGrid(width, height);

    // Add environmental elements
    this.addEnvironmentalElements(width, height);
  }

  /**
   * Create a large-scale tactical battlefield with multiple zones
   */
  createLargeBattlefield(width: number = 80, height: number = 60) {
    console.log(`🗺️ Creating large battlefield: ${width}x${height} units`);

    // Remove existing map
    if (this.mapMesh) {
      this.scene.remove(this.mapMesh);
    }

    // Clear existing environmental elements
    this.clearEnvironmentalElements();

    // Create multiple terrain zones
    this.createTerrainZones(width, height);

    // Add major landmarks and structures
    this.addMajorLandmarks(width, height);

    // Create road network
    this.createRoadNetwork(width, height);

    // Add forests and vegetation zones
    this.addForestZones(width, height);

    // Add water features
    this.addWaterFeatures(width, height);

    // Create defensive positions and fortifications
    this.addDefensiveStructures(width, height);

    // Enhanced tactical grid
    this.createLargeTacticalGrid(width, height);

    // Update camera for larger map
    this.adjustCameraForLargeMap(width, height);

    // Initialize fog of war system
    this.initializeFogOfWar(width, height);

    console.log('✅ Large battlefield created successfully');
  }

  private createTerrainZones(width: number, height: number) {
    // Create multiple terrain patches with different elevations and materials
    const zones = [
      { x: -width / 4, z: -height / 4, w: width / 3, h: height / 3, color: 0x6b8e23, name: 'hills' },      // Olive green hills
      { x: width / 4, z: -height / 4, w: width / 4, h: height / 2, color: 0x8b7355, name: 'desert' },     // Sandy desert
      { x: -width / 3, z: height / 4, w: width / 2, h: height / 4, color: 0x2f4f2f, name: 'forest' },     // Dark forest
      { x: width / 6, z: height / 6, w: width / 3, h: height / 3, color: 0x556b2f, name: 'grassland' },   // Grassland
      { x: 0, z: 0, w: width / 6, h: height / 6, color: 0x4a5d23, name: 'central' },                  // Central area
    ];

    zones.forEach((zone, index) => {
      const zoneGeometry = new THREE.PlaneGeometry(zone.w, zone.h, 15, 15);

      // Add height variation based on zone type
      const vertices = zoneGeometry.attributes.position.array;
      for (let i = 0; i < vertices.length; i += 3) {
        let heightVariation = 0;
        switch (zone.name) {
          case 'hills':
            heightVariation = Math.sin((vertices[i] + vertices[i + 1]) * 0.1) * 2 + Math.random() * 0.5;
            break;
          case 'desert':
            heightVariation = (Math.random() - 0.5) * 0.3; // Flat with small dunes
            break;
          case 'forest':
            heightVariation = (Math.random() - 0.5) * 0.8; // Uneven forest floor
            break;
          default:
            heightVariation = (Math.random() - 0.5) * 0.2;
        }
        vertices[i + 2] += heightVariation;
      }
      zoneGeometry.attributes.position.needsUpdate = true;
      zoneGeometry.computeVertexNormals();

      const zoneMaterial = new THREE.MeshLambertMaterial({
        color: zone.color,
        transparent: true,
        opacity: 0.8
      });

      const zoneMesh = new THREE.Mesh(zoneGeometry, zoneMaterial);
      zoneMesh.rotation.x = -Math.PI / 2;
      zoneMesh.position.set(zone.x, 0.1 + index * 0.05, zone.z); // Stack slightly to avoid z-fighting
      zoneMesh.receiveShadow = true;
      zoneMesh.userData = { type: 'terrain', zone: zone.name };
      this.scene.add(zoneMesh);
    });

    // Main base terrain
    const baseGeometry = new THREE.PlaneGeometry(width, height, 30, 30);
    const baseVertices = baseGeometry.attributes.position.array;
    for (let i = 0; i < baseVertices.length; i += 3) {
      baseVertices[i + 2] += (Math.random() - 0.5) * 0.1;
    }
    baseGeometry.attributes.position.needsUpdate = true;
    baseGeometry.computeVertexNormals();

    const baseMaterial = new THREE.MeshLambertMaterial({
      color: 0x3a4a1a,
      transparent: true,
      opacity: 0.7
    });

    this.mapMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    this.mapMesh.rotation.x = -Math.PI / 2;
    this.mapMesh.receiveShadow = true;
    this.mapMesh.userData = { type: 'ground' };
    this.scene.add(this.mapMesh);
  }

  private addMajorLandmarks(width: number, height: number) {
    // Large central building complex
    const centralBuildingGroup = new THREE.Group();

    // Main building
    const mainBuildingGeometry = new THREE.BoxGeometry(8, 12, 6);
    const mainBuildingMaterial = new THREE.MeshLambertMaterial({ color: 0x8b8680 });
    const mainBuilding = new THREE.Mesh(mainBuildingGeometry, mainBuildingMaterial);
    mainBuilding.position.set(0, 6, 0);
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    centralBuildingGroup.add(mainBuilding);

    // Building wings
    for (let i = 0; i < 3; i++) {
      const wingGeometry = new THREE.BoxGeometry(4, 8, 3);
      const wingMaterial = new THREE.MeshLambertMaterial({ color: 0x999999 });
      const wing = new THREE.Mesh(wingGeometry, wingMaterial);
      wing.position.set(
        (i - 1) * 6,
        4,
        -5
      );
      wing.castShadow = true;
      wing.receiveShadow = true;
      centralBuildingGroup.add(wing);
    }

    centralBuildingGroup.userData = { type: 'landmark', name: 'central_complex' };
    this.scene.add(centralBuildingGroup);

    // Watchtowers at corners
    const towerPositions = [
      { x: -width / 3, z: -height / 3 },
      { x: width / 3, z: -height / 3 },
      { x: -width / 3, z: height / 3 },
      { x: width / 3, z: height / 3 }
    ];

    towerPositions.forEach((pos, index) => {
      const towerGroup = new THREE.Group();

      // Tower base
      const baseGeometry = new THREE.CylinderGeometry(2, 3, 2, 8);
      const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = 1;
      base.castShadow = true;
      towerGroup.add(base);

      // Tower shaft
      const shaftGeometry = new THREE.CylinderGeometry(1.5, 2, 8, 8);
      const shaftMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
      const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
      shaft.position.y = 6;
      shaft.castShadow = true;
      towerGroup.add(shaft);

      // Tower top
      const topGeometry = new THREE.CylinderGeometry(2.5, 1.5, 1.5, 8);
      const topMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.y = 10.75;
      top.castShadow = true;
      towerGroup.add(top);

      towerGroup.position.set(pos.x, 0, pos.z);
      towerGroup.userData = { type: 'landmark', name: `tower_${index}` };
      this.scene.add(towerGroup);
    });

    // Bridge structures
    const bridge1Geometry = new THREE.BoxGeometry(20, 0.5, 4);
    const bridgeMaterial = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
    const bridge1 = new THREE.Mesh(bridge1Geometry, bridgeMaterial);
    bridge1.position.set(0, 2, height / 4);
    bridge1.castShadow = true;
    bridge1.receiveShadow = true;
    bridge1.userData = { type: 'landmark', name: 'bridge_north' };
    this.scene.add(bridge1);
  }

  private createRoadNetwork(width: number, height: number) {
    const roadMaterial = new THREE.MeshLambertMaterial({
      color: 0x404040,
      transparent: true,
      opacity: 0.9
    });

    // Main cross roads
    const mainRoadNS = new THREE.PlaneGeometry(4, height);
    const roadNS = new THREE.Mesh(mainRoadNS, roadMaterial);
    roadNS.rotation.x = -Math.PI / 2;
    roadNS.position.set(0, 0.02, 0);
    roadNS.receiveShadow = true;
    roadNS.userData = { type: 'road' };
    this.scene.add(roadNS);

    const mainRoadEW = new THREE.PlaneGeometry(width, 4);
    const roadEW = new THREE.Mesh(mainRoadEW, roadMaterial);
    roadEW.rotation.x = -Math.PI / 2;
    roadEW.position.set(0, 0.02, 0);
    roadEW.receiveShadow = true;
    roadEW.userData = { type: 'road' };
    this.scene.add(roadEW);

    // Diagonal access roads
    const diagonalRoads = [
      { start: [-width / 3, -height / 3], end: [width / 3, height / 3] },
      { start: [width / 3, -height / 3], end: [-width / 3, height / 3] }
    ];

    diagonalRoads.forEach((road, index) => {
      const roadLength = Math.sqrt(
        Math.pow(road.end[0] - road.start[0], 2) +
        Math.pow(road.end[1] - road.start[1], 2)
      );
      const roadGeometry = new THREE.PlaneGeometry(2, roadLength);
      const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
      roadMesh.rotation.x = -Math.PI / 2;
      roadMesh.rotation.z = Math.atan2(road.end[1] - road.start[1], road.end[0] - road.start[0]) - Math.PI / 2;
      roadMesh.position.set(
        (road.start[0] + road.end[0]) / 2,
        0.02,
        (road.start[1] + road.end[1]) / 2
      );
      roadMesh.receiveShadow = true;
      roadMesh.userData = { type: 'road', name: `diagonal_${index}` };
      this.scene.add(roadMesh);
    });
  }

  private addForestZones(width: number, height: number) {
    // Dense forest areas
    const forestZones = [
      { x: -width / 3, z: height / 4, radius: 8, density: 0.8 },
      { x: width / 2.5, z: -height / 3, radius: 6, density: 0.6 },
      { x: -width / 2, z: -height / 6, radius: 5, density: 0.7 }
    ];

    forestZones.forEach((zone) => {
      const treeCount = Math.floor(zone.radius * zone.radius * zone.density);

      for (let i = 0; i < treeCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * zone.radius;
        const x = zone.x + Math.cos(angle) * distance;
        const z = zone.z + Math.sin(angle) * distance;

        this.addTree(x, z);
      }
    });
  }

  private addTree(x: number, z: number) {
    const treeGroup = new THREE.Group();

    // Tree trunk
    const trunkHeight = 2 + Math.random() * 3;
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, trunkHeight, 6);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Tree foliage
    const foliageRadius = 1 + Math.random() * 1.5;
    const foliageGeometry = new THREE.SphereGeometry(foliageRadius, 8, 6);
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = trunkHeight + foliageRadius * 0.7;
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    treeGroup.add(foliage);

    treeGroup.position.set(x, 0, z);
    treeGroup.userData = { type: 'environmental', subtype: 'tree' };
    this.scene.add(treeGroup);
  }

  private addWaterFeatures(width: number, height: number) {
    // River running through the map
    const riverPoints = [
      [-width / 2, -height / 4],
      [-width / 6, -height / 8],
      [width / 8, height / 8],
      [width / 2, height / 3]
    ];

    for (let i = 0; i < riverPoints.length - 1; i++) {
      const start = riverPoints[i];
      const end = riverPoints[i + 1];
      const segmentLength = Math.sqrt(
        Math.pow(end[0] - start[0], 2) +
        Math.pow(end[1] - start[1], 2)
      );

      const riverGeometry = new THREE.PlaneGeometry(3, segmentLength);
      const riverMaterial = new THREE.MeshLambertMaterial({
        color: 0x4682b4,
        transparent: true,
        opacity: 0.7
      });
      const riverSegment = new THREE.Mesh(riverGeometry, riverMaterial);
      riverSegment.rotation.x = -Math.PI / 2;
      riverSegment.rotation.z = Math.atan2(end[1] - start[1], end[0] - start[0]) - Math.PI / 2;
      riverSegment.position.set(
        (start[0] + end[0]) / 2,
        -0.1,
        (start[1] + end[1]) / 2
      );
      riverSegment.receiveShadow = true;
      riverSegment.userData = { type: 'water', name: 'river' };
      this.scene.add(riverSegment);
    }

    // Small ponds
    const pondPositions = [
      { x: width / 3, z: height / 6, radius: 4 },
      { x: -width / 4, z: -height / 3, radius: 3 }
    ];

    pondPositions.forEach((pond, index) => {
      const pondGeometry = new THREE.CircleGeometry(pond.radius, 16);
      const pondMaterial = new THREE.MeshLambertMaterial({
        color: 0x1e90ff,
        transparent: true,
        opacity: 0.8
      });
      const pondMesh = new THREE.Mesh(pondGeometry, pondMaterial);
      pondMesh.rotation.x = -Math.PI / 2;
      pondMesh.position.set(pond.x, -0.05, pond.z);
      pondMesh.receiveShadow = true;
      pondMesh.userData = { type: 'water', name: `pond_${index}` };
      this.scene.add(pondMesh);
    });
  }

  private addDefensiveStructures(width: number, height: number) {
    // Bunker complex
    const bunkerPositions = [
      { x: -width / 6, z: -height / 5 },
      { x: width / 5, z: height / 6 },
      { x: -width / 4, z: height / 4 }
    ];

    bunkerPositions.forEach((pos, index) => {
      const bunkerGroup = new THREE.Group();

      // Main bunker structure
      const bunkerGeometry = new THREE.BoxGeometry(6, 3, 4);
      const bunkerMaterial = new THREE.MeshLambertMaterial({ color: 0x556b2f });
      const bunker = new THREE.Mesh(bunkerGeometry, bunkerMaterial);
      bunker.position.y = 1;
      bunker.castShadow = true;
      bunker.receiveShadow = true;
      bunkerGroup.add(bunker);

      // Sandbag barriers
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const sandbagGeometry = new THREE.BoxGeometry(1, 0.8, 0.5);
        const sandbagMaterial = new THREE.MeshLambertMaterial({ color: 0xdaa520 });
        const sandbag = new THREE.Mesh(sandbagGeometry, sandbagMaterial);
        sandbag.position.set(
          Math.cos(angle) * 5,
          0.4,
          Math.sin(angle) * 5
        );
        sandbag.rotation.y = angle;
        sandbag.castShadow = true;
        sandbag.receiveShadow = true;
        bunkerGroup.add(sandbag);
      }

      bunkerGroup.position.set(pos.x, 0, pos.z);
      bunkerGroup.userData = { type: 'defensive', name: `bunker_${index}` };
      this.scene.add(bunkerGroup);
    });

    // Trench network
    const trenchSections = [
      { start: [-width / 8, -height / 8], end: [width / 8, -height / 8] },
      { start: [width / 8, -height / 8], end: [width / 8, height / 8] },
      { start: [width / 8, height / 8], end: [-width / 8, height / 8] },
      { start: [-width / 8, height / 8], end: [-width / 8, -height / 8] }
    ];

    trenchSections.forEach((trench, index) => {
      const trenchLength = Math.sqrt(
        Math.pow(trench.end[0] - trench.start[0], 2) +
        Math.pow(trench.end[1] - trench.start[1], 2)
      );
      const trenchGeometry = new THREE.BoxGeometry(1.5, 1.5, trenchLength);
      const trenchMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
      const trenchMesh = new THREE.Mesh(trenchGeometry, trenchMaterial);
      trenchMesh.rotation.y = Math.atan2(trench.end[1] - trench.start[1], trench.end[0] - trench.start[0]);
      trenchMesh.position.set(
        (trench.start[0] + trench.end[0]) / 2,
        -0.5,
        (trench.start[1] + trench.end[1]) / 2
      );
      trenchMesh.receiveShadow = true;
      trenchMesh.userData = { type: 'defensive', name: `trench_${index}` };
      this.scene.add(trenchMesh);
    });
  }

  private createLargeTacticalGrid(width: number, height: number) {
    // Main grid with larger spacing
    const gridHelper = new THREE.GridHelper(
      Math.max(width, height),
      Math.max(width, height) / 4, // Fewer grid lines for larger map
      0x888888,
      0x444444
    );
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // Sector markers every 20 units
    const sectorMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sectorMarkerGeometry = new THREE.SphereGeometry(0.2, 4, 3);

    for (let x = -width / 2; x <= width / 2; x += 20) {
      for (let z = -height / 2; z <= height / 2; z += 20) {
        if (x !== 0 || z !== 0) { // Skip center
          const marker = new THREE.Mesh(sectorMarkerGeometry, sectorMarkerMaterial);
          marker.position.set(x, 0.5, z);
          this.scene.add(marker);
        }
      }
    }

    // Central origin marker
    const originGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 12);
    const originMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const origin = new THREE.Mesh(originGeometry, originMaterial);
    origin.position.set(0, 0.05, 0);
    this.scene.add(origin);
  }

  private adjustCameraForLargeMap(width: number, height: number) {
    // Update camera for tactical close-up view with fog of war
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const viewSize = 6; // Small tactical view (was showing entire battlefield)

    this.camera.left = -viewSize * aspect;
    this.camera.right = viewSize * aspect;
    this.camera.top = viewSize;
    this.camera.bottom = -viewSize;
    this.camera.updateProjectionMatrix();

    // Set closer camera distance for tactical view
    this.cameraDistance = 12;
    this.camera.position.y = this.cameraDistance;

    // For large maps, zoom out further
    this.cameraDistance = Math.max(width, height) * 0.8;
    this.camera.position.y = this.cameraDistance;

    console.log(`📹 Camera adjusted for tactical view: ${viewSize} unit radius`);
  }

  private clearEnvironmentalElements() {
    // Remove existing environmental elements
    const toRemove: THREE.Object3D[] = [];
    this.scene.traverse((object) => {
      if (object.userData?.type === 'environmental' ||
        object.userData?.type === 'landmark' ||
        object.userData?.type === 'road' ||
        object.userData?.type === 'water' ||
        object.userData?.type === 'defensive' ||
        object.userData?.type === 'terrain') {
        toRemove.push(object);
      }
    });
    toRemove.forEach(obj => this.scene.remove(obj));
  }

  private createTacticalGrid(width: number, height: number) {
    // Main grid
    const gridHelper = new THREE.GridHelper(
      Math.max(width, height),
      Math.max(width, height),
      0x888888,
      0x444444
    );
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // Add coordinate markers at key points
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const markerGeometry = new THREE.SphereGeometry(0.05, 4, 3);

    for (let x = -width / 2; x <= width / 2; x += 5) {
      for (let z = -height / 2; z <= height / 2; z += 5) {
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(x, 0.02, z);
        this.scene.add(marker);
      }
    }
  }

  private addEnvironmentalElements(width: number, height: number) {
    // Add some scattered rocks/debris
    for (let i = 0; i < 8; i++) {
      const rockSize = 0.3 + Math.random() * 0.4;
      const rockGeometry = new THREE.DodecahedronGeometry(rockSize, 0);
      const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);

      rock.position.set(
        (Math.random() - 0.5) * width * 0.8,
        rockSize * 0.5,
        (Math.random() - 0.5) * height * 0.8
      );
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      rock.userData = { type: 'environmental' };
      this.scene.add(rock);
    }

    // Add some vegetation/bushes
    for (let i = 0; i < 5; i++) {
      const bushGeometry = new THREE.SphereGeometry(0.4 + Math.random() * 0.3, 6, 4);
      const bushMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5016 });
      const bush = new THREE.Mesh(bushGeometry, bushMaterial);

      bush.position.set(
        (Math.random() - 0.5) * width * 0.7,
        0.2,
        (Math.random() - 0.5) * height * 0.7
      );
      bush.scale.y = 0.6; // Flatten slightly
      bush.castShadow = true;
      bush.receiveShadow = true;
      bush.userData = { type: 'environmental' };
      this.scene.add(bush);
    }
  }

  /**
   * Add a simple unit/character representation with enhanced visual
   */
  addUnit(id: string, position: THREE.Vector3, color: number = 0x00ff00) {
    // Create a group to hold multiple parts
    const unitGroup = new THREE.Group();
    unitGroup.name = id;
    unitGroup.userData = { id, type: 'unit' };

    // Main body (torso)
    const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.5, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.25;
    body.castShadow = true;
    unitGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.15, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(color).multiplyScalar(1.2) // Slightly brighter
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.65;
    head.castShadow = true;
    unitGroup.add(head);

    // Weapon (simple representation)
    const weaponGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.4);
    const weaponMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
    weapon.position.set(0.2, 0.4, 0);
    weapon.rotation.z = Math.PI / 6; // Angle it slightly
    weapon.castShadow = true;
    unitGroup.add(weapon);

    // Position the group
    unitGroup.position.copy(position);
    this.scene.add(unitGroup);

    return unitGroup;
  }

  /**
   * Add a character-based unit with character info and enhanced visuals
   */
  addCharacterUnit(character: any, position: THREE.Vector3) {
    // Get color and shape based on character class
    const classConfigs: Record<string, { color: number; weaponType: string; size: number }> = {
      assault: { color: 0xff4444, weaponType: 'rifle', size: 1.0 },      // Red - Standard size
      sniper: { color: 0x44ff44, weaponType: 'sniper', size: 0.9 },      // Green - Slightly smaller
      medic: { color: 0x4444ff, weaponType: 'pistol', size: 0.95 },      // Blue - Medical cross
      engineer: { color: 0xffaa00, weaponType: 'tool', size: 1.05 },     // Orange - Slightly larger
      demolitions: { color: 0xaa44ff, weaponType: 'heavy', size: 1.1 },  // Purple - Largest
    };

    const config = classConfigs[character.class] || classConfigs.assault;

    // Create enhanced unit group
    const unitGroup = new THREE.Group();
    unitGroup.name = character.id;
    unitGroup.userData = {
      id: character.id,
      type: 'unit',
      character,
      characterName: character.name,
      characterClass: character.class,
    };

    const scale = config.size;

    // Main body (torso) - class-specific size
    const bodyGeometry = new THREE.CylinderGeometry(0.25 * scale, 0.3 * scale, 0.5 * scale, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: config.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.25 * scale;
    body.castShadow = true;
    unitGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.15 * scale, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(config.color).multiplyScalar(1.2) // Slightly brighter
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.65 * scale;
    head.castShadow = true;
    unitGroup.add(head);

    // Class-specific equipment
    this.addClassEquipment(unitGroup, character.class, config, scale);

    // Class identifier on base
    this.addClassIdentifier(unitGroup, character.class, config.color, scale);

    // Position the group
    unitGroup.position.copy(position);
    this.scene.add(unitGroup);

    return unitGroup;
  }

  private addClassEquipment(unitGroup: THREE.Group, _characterClass: string, config: any, scale: number) {
    switch (config.weaponType) {
      case 'rifle':
        // Standard assault rifle
        const rifleGeometry = new THREE.BoxGeometry(0.05 * scale, 0.05 * scale, 0.4 * scale);
        const rifleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const rifle = new THREE.Mesh(rifleGeometry, rifleMaterial);
        rifle.position.set(0.2 * scale, 0.4 * scale, 0);
        rifle.rotation.z = Math.PI / 6;
        rifle.castShadow = true;
        unitGroup.add(rifle);
        break;

      case 'sniper':
        // Long sniper rifle
        const sniperGeometry = new THREE.BoxGeometry(0.04 * scale, 0.04 * scale, 0.6 * scale);
        const sniperMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const sniper = new THREE.Mesh(sniperGeometry, sniperMaterial);
        sniper.position.set(0.15 * scale, 0.4 * scale, -0.1 * scale);
        sniper.rotation.z = Math.PI / 8;
        sniper.castShadow = true;
        unitGroup.add(sniper);

        // Scope
        const scopeGeometry = new THREE.BoxGeometry(0.02 * scale, 0.06 * scale, 0.06 * scale);
        const scopeMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const scope = new THREE.Mesh(scopeGeometry, scopeMaterial);
        scope.position.set(0.15 * scale, 0.46 * scale, -0.1 * scale);
        scope.castShadow = true;
        unitGroup.add(scope);
        break;

      case 'pistol':
        // Small pistol for medic
        const pistolGeometry = new THREE.BoxGeometry(0.03 * scale, 0.03 * scale, 0.15 * scale);
        const pistolMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const pistol = new THREE.Mesh(pistolGeometry, pistolMaterial);
        pistol.position.set(0.15 * scale, 0.3 * scale, 0);
        pistol.rotation.z = Math.PI / 4;
        pistol.castShadow = true;
        unitGroup.add(pistol);

        // Medical cross on back
        const crossV = new THREE.BoxGeometry(0.02 * scale, 0.2 * scale, 0.02 * scale);
        const crossH = new THREE.BoxGeometry(0.1 * scale, 0.02 * scale, 0.02 * scale);
        const crossMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 });

        const crossVertical = new THREE.Mesh(crossV, crossMaterial);
        crossVertical.position.set(-0.25 * scale, 0.4 * scale, 0);
        unitGroup.add(crossVertical);

        const crossHorizontal = new THREE.Mesh(crossH, crossMaterial);
        crossHorizontal.position.set(-0.25 * scale, 0.4 * scale, 0);
        unitGroup.add(crossHorizontal);
        break;

      case 'tool':
        // Engineer tools
        const toolGeometry = new THREE.BoxGeometry(0.04 * scale, 0.04 * scale, 0.3 * scale);
        const toolMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const tool = new THREE.Mesh(toolGeometry, toolMaterial);
        tool.position.set(0.18 * scale, 0.35 * scale, 0);
        tool.rotation.z = Math.PI / 3;
        tool.castShadow = true;
        unitGroup.add(tool);
        break;

      case 'heavy':
        // Heavy weapon for demolitions
        const heavyGeometry = new THREE.BoxGeometry(0.08 * scale, 0.06 * scale, 0.35 * scale);
        const heavyMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const heavy = new THREE.Mesh(heavyGeometry, heavyMaterial);
        heavy.position.set(0.22 * scale, 0.4 * scale, 0);
        heavy.rotation.z = Math.PI / 6;
        heavy.castShadow = true;
        unitGroup.add(heavy);
        break;
    }
  }

  private addClassIdentifier(unitGroup: THREE.Group, _characterClass: string, color: number, scale: number) {
    // Base ring to identify class
    const ringGeometry = new THREE.RingGeometry(0.35 * scale, 0.4 * scale, 8);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    unitGroup.add(ring);
  }

  /**
   * Remove a unit by ID
   */
  removeUnit(id: string) {
    const unit = this.scene.getObjectByName(id);
    if (unit) {
      this.scene.remove(unit);
    }
  }

  /**
   * Move a unit to a new position with animation
   */
  moveUnit(id: string, newPosition: THREE.Vector3) {
    const unit = this.scene.getObjectByName(id);
    if (unit) {
      this.animateUnitMovement(unit, newPosition);
    }
  }

  /**
   * Get all units in the scene
   */
  getUnits() {
    return this.scene.children.filter(obj => obj.userData?.type === 'unit');
  }

  /**
   * Clear all units from the scene
   */
  clearUnits() {
    const units = this.getUnits();
    units.forEach(unit => {
      this.scene.remove(unit);
    });
  }

  /**
   * Add a basic obstacle/cover
   */
  addObstacle(position: THREE.Vector3, size: THREE.Vector3, color: number = 0x8B4513) {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshLambertMaterial({ color });

    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.copy(position);
    obstacle.position.y = size.y / 2; // Bottom on ground
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;
    obstacle.userData = { type: 'obstacle' };

    this.scene.add(obstacle);
    return obstacle;
  }

  /**
   * Get the Three.js scene for direct access when needed
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Unit selection and interaction methods
   */
  selectUnit(unit: THREE.Object3D) {
    // Deselect previous unit
    if (this.selectedUnit) {
      this.setUnitSelectedState(this.selectedUnit, false);
    }

    // Select new unit
    this.selectedUnit = unit;
    this.setUnitSelectedState(unit, true);

    // Center camera on selected unit and reveal fog around it
    this.centerCameraOnPosition(unit.position);

    // Call selection callback
    this.onUnitSelectedCallback?.(unit);

    console.log(`✅ Selected unit: ${unit.name}`, unit.userData);
  }

  private deselectUnit() {
    if (this.selectedUnit) {
      this.setUnitSelectedState(this.selectedUnit, false);
      this.selectedUnit = null;
      console.log('❌ Deselected unit');
    }
  }

  private setUnitSelectedState(unit: THREE.Object3D, selected: boolean) {
    // Add/remove selection indicator (bright outline)
    const selectionColor = selected ? 0xffff00 : null; // Yellow for selection
    this.addUnitOutline(unit, selectionColor, selected ? 0.1 : 0);
  }

  private setUnitHoverState(unit: THREE.Object3D, hovered: boolean) {
    // Add/remove hover indicator (subtle outline)
    const hoverColor = hovered ? 0xffffff : null; // White for hover
    this.addUnitOutline(unit, hoverColor, hovered ? 0.05 : 0);
  }

  private addUnitOutline(unit: THREE.Object3D, color: number | null, thickness: number) {
    // Remove existing outline
    const existingOutline = unit.getObjectByName('outline');
    if (existingOutline) {
      unit.remove(existingOutline);
    }

    if (color !== null && thickness > 0) {
      // Create outline effect by scaling up a wireframe version
      const outlineGroup = new THREE.Group();
      outlineGroup.name = 'outline';

      unit.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const outlineGeometry = child.geometry.clone();
          const outlineMaterial = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.8,
            wireframe: true
          });

          const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
          outline.position.copy(child.position);
          outline.rotation.copy(child.rotation);
          outline.scale.copy(child.scale).multiplyScalar(1 + thickness);

          outlineGroup.add(outline);
        }
      });

      unit.add(outlineGroup);
    }
  }

  private moveUnitToPosition(unitId: string, position: THREE.Vector3) {
    const unit = this.scene.getObjectByName(unitId);
    if (unit) {
      // Animate the movement
      this.animateUnitMovement(unit, position);

      // Center camera on new position and reveal fog
      this.centerCameraOnPosition(position);

      // Call movement callback
      this.onUnitMovedCallback?.(unitId, position);

      console.log(`🚶 Moving unit ${unitId} to`, position);
    }
  }

  private animateUnitMovement(unit: THREE.Object3D, targetPosition: THREE.Vector3) {
    const startPosition = unit.position.clone();
    const duration = 1000; // 1 second
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing function
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Interpolate position
      unit.position.lerpVectors(startPosition, targetPosition, easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Center the camera on a given position (top-down view)
   */
  private centerCameraOnPosition(position: THREE.Vector3) {
    this.cameraTarget.copy(position);
    this.camera.position.x = position.x;
    this.camera.position.z = position.z;
    this.camera.lookAt(this.cameraTarget);
  }

  /**
   * Event callback setters
   */
  setOnUnitSelected(callback: (unit: THREE.Object3D) => void) {
    this.onUnitSelectedCallback = callback;
  }

  setOnUnitMoved(callback: (unitId: string, position: THREE.Vector3) => void) {
    this.onUnitMovedCallback = callback;
  }

  setOnGroundClicked(callback: (position: THREE.Vector3) => void) {
    this.onGroundClickedCallback = callback;
  }

  /**
   * Get currently selected unit
   */
  getSelectedUnit(): THREE.Object3D | null {
    return this.selectedUnit;
  }

  /**
   * Main render loop
   */
  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Clean up resources
   */
  dispose() {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.container.removeEventListener('wheel', this.onMouseWheel.bind(this));
    this.container.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.container.removeEventListener('click', this.onMouseClick.bind(this));
    this.container.removeEventListener('contextmenu', this.onRightClick.bind(this));

    if (this.renderer) this.renderer.dispose();
    if (this.container && this.renderer) {
      this.container.removeChild(this.renderer.domElement);
    }
  }

  /**
   * Initialize fog of war system for the battlefield
   * TODO: Implement proper fog of war functionality
   */
  private initializeFogOfWar(width: number, height: number) {
    if (!this.fogOfWarEnabled) {
      return;
    }

    console.log(`🌫️ Initializing fog of war for ${width}x${height} battlefield`);
    
    // Store map dimensions for fog calculations
    this.mapWidth = width;
    this.mapHeight = height;

    // Create fog texture data
    const textureSize = this.fogResolution;
    this.fogData = new Uint8Array(textureSize * textureSize * 4);

    // Initialize as fully fogged (black)
    for (let i = 0; i < this.fogData.length; i += 4) {
      this.fogData[i] = 0;     // R
      this.fogData[i + 1] = 0; // G  
      this.fogData[i + 2] = 0; // B
      this.fogData[i + 3] = 255; // A (opaque fog)
    }

    // Create fog texture
    this.fogTexture = new THREE.DataTexture(
      this.fogData,
      textureSize,
      textureSize,
      THREE.RGBAFormat
    );
    this.fogTexture.needsUpdate = true;

    // Create fog plane mesh
    const fogGeometry = new THREE.PlaneGeometry(width, height);
    const fogMaterial = new THREE.MeshBasicMaterial({
      map: this.fogTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.MultiplyBlending,
      premultipliedAlpha: true
    });

    this.fogMesh = new THREE.Mesh(fogGeometry, fogMaterial);
    this.fogMesh.rotation.x = -Math.PI / 2;
    this.fogMesh.position.y = 0.1; // Slightly above ground
    this.fogMesh.userData = { type: 'fog' };
    this.scene.add(this.fogMesh);

    // Initial fog reveal at center (just to demonstrate the system works)
    this.revealFogAroundPosition(new THREE.Vector3(0, 0, 0), this.visibilityRadius);

    console.log('✅ Fog of war system initialized');
  }

  /**
   * Reveal fog around a position (called when units move or are selected)
   * TODO: Implement proper fog revealing based on unit vision
   */
  private revealFogAroundPosition(position: THREE.Vector3, radius: number = this.visibilityRadius) {
    if (!this.fogOfWarEnabled || !this.fogData || !this.fogTexture) {
      return;
    }

    // Convert world position to texture coordinates
    const textureX = Math.floor(((position.x + this.mapWidth / 2) / this.mapWidth) * this.fogResolution);
    const textureZ = Math.floor(((position.z + this.mapHeight / 2) / this.mapHeight) * this.fogResolution);

    // Reveal area around position
    const radiusInTexels = Math.floor((radius / Math.max(this.mapWidth, this.mapHeight)) * this.fogResolution);

    for (let x = -radiusInTexels; x <= radiusInTexels; x++) {
      for (let z = -radiusInTexels; z <= radiusInTexels; z++) {
        const texX = textureX + x;
        const texZ = textureZ + z;

        if (texX >= 0 && texX < this.fogResolution && texZ >= 0 && texZ < this.fogResolution) {
          const distance = Math.sqrt(x * x + z * z);
          if (distance <= radiusInTexels) {
            const index = (texZ * this.fogResolution + texX) * 4;
            
            // Mark as explored
            this.exploredAreas.add(`${texX},${texZ}`);
            
            // Clear fog (make transparent)
            this.fogData[index + 3] = Math.max(0, 255 - (255 * (1 - distance / radiusInTexels)));
          }
        }
      }
    }

    this.fogTexture.needsUpdate = true;
  }
}
