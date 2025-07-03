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
    // Orthographic camera for top-down tactical view
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const viewSize = 10; // Size of the view in world units
    
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
    
    // Basic mouse controls for camera movement (for development)
    this.container.addEventListener('wheel', this.onMouseWheel.bind(this));
  }
  
  private onWindowResize() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const viewSize = 10;
    
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
   * Add a simple unit/character representation
   */
  addUnit(id: string, position: THREE.Vector3, color: number = 0x00ff00) {
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 8);
    const material = new THREE.MeshLambertMaterial({ color });
    
    const unit = new THREE.Mesh(geometry, material);
    unit.position.copy(position);
    unit.position.y = 0.3; // Half the height above ground
    unit.castShadow = true;
    unit.userData = { id, type: 'unit' };
    
    this.scene.add(unit);
    return unit;
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
    
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
  
  /**
   * Get the Three.js scene for advanced operations
   */
  getScene() {
    return this.scene;
  }
  
  /**
   * Get the camera for advanced operations
   */
  getCamera() {
    return this.camera;
  }
  
  /**
   * Get the renderer for advanced operations
   */
  getRenderer() {
    return this.renderer;
  }
}
