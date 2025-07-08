import * as THREE from 'three';

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  range: number;
  fireRate: number; // shots per second
  accuracy: number; // 0-1, affects spread
  ammo: number;
  maxAmmo: number;
  reloadTime: number; // milliseconds
}

export interface CombatUnit {
  id: string;
  name: string;
  position: THREE.Vector3;
  health: number;
  maxHealth: number;
  weapon: Weapon;
  faction: 'player' | 'enemy' | 'neutral';
  isAlive: boolean;
  lastShotTime: number;
  isReloading: boolean;
  aimDirection: THREE.Vector3;
}

export interface ShotResult {
  hit: boolean;
  damage: number;
  target?: CombatUnit;
  impact: THREE.Vector3;
  distance: number;
}

export class CombatSystem {
  private units: Map<string, CombatUnit> = new Map();
  private bullets: Array<{
    id: string;
    position: THREE.Vector3;
    direction: THREE.Vector3;
    speed: number;
    damage: number;
    range: number;
    startTime: number;
    shooterId: string;
  }> = [];
  private scene: THREE.Scene;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private nextBulletId = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  // Add a unit to the combat system
  addUnit(unit: CombatUnit): void {
    this.units.set(unit.id, unit);
  }

  // Remove a unit from the combat system
  removeUnit(unitId: string): void {
    this.units.delete(unitId);
  }

  // Get a unit by ID
  getUnit(unitId: string): CombatUnit | undefined {
    return this.units.get(unitId);
  }

  // Update unit position
  updateUnitPosition(unitId: string, position: THREE.Vector3): void {
    const unit = this.units.get(unitId);
    if (unit) {
      unit.position.copy(position);
    }
  }

  // Update unit aim direction
  updateUnitAim(unitId: string, direction: THREE.Vector3): void {
    const unit = this.units.get(unitId);
    if (unit) {
      unit.aimDirection.copy(direction.normalize());
    }
  }

  // Attempt to shoot from a unit towards a target position
  shoot(shooterId: string, targetPosition: THREE.Vector3): ShotResult | null {
    const shooter = this.units.get(shooterId);
    if (!shooter || !shooter.isAlive) {
      return null;
    }

    const now = Date.now();
    
    // Check fire rate
    const timeSinceLastShot = now - shooter.lastShotTime;
    const minTimeBetweenShots = 1000 / shooter.weapon.fireRate;
    if (timeSinceLastShot < minTimeBetweenShots) {
      return null; // Too soon to shoot again
    }

    // Check if reloading
    if (shooter.isReloading) {
      return null;
    }

    // Check ammo
    if (shooter.weapon.ammo <= 0) {
      this.startReload(shooterId);
      return null;
    }

    // Calculate shot direction with accuracy spread
    const direction = targetPosition.clone().sub(shooter.position).normalize();
    const accuracy = shooter.weapon.accuracy;
    const spread = (1 - accuracy) * 0.2; // Max spread of 0.2 radians
    
    // Add random spread
    const spreadX = (Math.random() - 0.5) * spread;
    const spreadY = (Math.random() - 0.5) * spread;
    direction.x += spreadX;
    direction.y += spreadY;
    direction.normalize();

    // Update shooter state
    shooter.lastShotTime = now;
    shooter.weapon.ammo--;
    shooter.aimDirection.copy(direction);

    // Create bullet
    const bulletId = `bullet_${this.nextBulletId++}`;
    const bullet = {
      id: bulletId,
      position: shooter.position.clone(),
      direction: direction.clone(),
      speed: 50, // units per second
      damage: shooter.weapon.damage,
      range: shooter.weapon.range,
      startTime: now,
      shooterId: shooterId
    };

    this.bullets.push(bullet);

    // Perform raycast to check for immediate hits
    this.raycaster.set(shooter.position, direction);
    const intersectableObjects = this.getIntersectableObjects(shooterId);
    const intersects = this.raycaster.intersectObjects(intersectableObjects, true);

    let result: ShotResult = {
      hit: false,
      damage: 0,
      impact: targetPosition.clone(),
      distance: shooter.position.distanceTo(targetPosition)
    };

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const hitObject = intersection.object;
      const distance = intersection.distance;

      // Check if within weapon range
      if (distance <= shooter.weapon.range) {
        // Find the target unit
        const targetUnit = this.findUnitByObject(hitObject);
        if (targetUnit && targetUnit.faction !== shooter.faction) {
          result = this.applyDamage(targetUnit, shooter.weapon.damage, intersection.point);
        }
      }
    }

    return result;
  }

  // Start reload process
  startReload(unitId: string): void {
    const unit = this.units.get(unitId);
    if (!unit || unit.isReloading) return;

    unit.isReloading = true;
    setTimeout(() => {
      if (unit.isAlive) {
        unit.weapon.ammo = unit.weapon.maxAmmo;
        unit.isReloading = false;
      }
    }, unit.weapon.reloadTime);
  }

  // Apply damage to a unit
  private applyDamage(target: CombatUnit, damage: number, impactPoint: THREE.Vector3): ShotResult {
    const actualDamage = Math.min(damage, target.health);
    target.health -= actualDamage;

    if (target.health <= 0) {
      target.health = 0;
      target.isAlive = false;
    }

    return {
      hit: true,
      damage: actualDamage,
      target: target,
      impact: impactPoint,
      distance: 0
    };
  }

  // Get objects that can be hit by bullets (excluding the shooter)
  private getIntersectableObjects(shooterId: string): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    
    this.scene.traverse((child) => {
      if (child.userData.unitId && child.userData.unitId !== shooterId) {
        objects.push(child);
      }
    });

    return objects;
  }

  // Find unit by 3D object
  private findUnitByObject(object: THREE.Object3D): CombatUnit | undefined {
    let current = object;
    while (current) {
      if (current.userData.unitId) {
        return this.units.get(current.userData.unitId);
      }
      current = current.parent as THREE.Object3D;
    }
    return undefined;
  }

  // Update bullet positions and check for collisions
  update(deltaTime: number): void {
    const now = Date.now();
    
    // Update bullet positions
    this.bullets = this.bullets.filter(bullet => {
      const timeAlive = now - bullet.startTime;
      const distanceTraveled = (bullet.speed * timeAlive) / 1000;
      
      // Remove bullets that have traveled too far
      if (distanceTraveled > bullet.range) {
        return false;
      }

      // Update bullet position
      const movement = bullet.direction.clone().multiplyScalar(bullet.speed * deltaTime);
      bullet.position.add(movement);

      return true;
    });
  }

  // Get all units
  getAllUnits(): CombatUnit[] {
    return Array.from(this.units.values());
  }

  // Get living units by faction
  getUnitsByFaction(faction: 'player' | 'enemy' | 'neutral'): CombatUnit[] {
    return Array.from(this.units.values()).filter(unit => 
      unit.faction === faction && unit.isAlive
    );
  }

  // Check if unit can shoot
  canShoot(unitId: string): boolean {
    const unit = this.units.get(unitId);
    if (!unit || !unit.isAlive || unit.isReloading) {
      return false;
    }

    const now = Date.now();
    const timeSinceLastShot = now - unit.lastShotTime;
    const minTimeBetweenShots = 1000 / unit.weapon.fireRate;
    
    return timeSinceLastShot >= minTimeBetweenShots && unit.weapon.ammo > 0;
  }

  // Get weapon info for UI
  getWeaponInfo(unitId: string): { ammo: number; maxAmmo: number; isReloading: boolean } | null {
    const unit = this.units.get(unitId);
    if (!unit) return null;

    return {
      ammo: unit.weapon.ammo,
      maxAmmo: unit.weapon.maxAmmo,
      isReloading: unit.isReloading
    };
  }
}

// Default weapons
export const WEAPONS = {
  ASSAULT_RIFLE: {
    id: 'assault_rifle',
    name: 'Assault Rifle',
    damage: 25,
    range: 100,
    fireRate: 5, // 5 shots per second
    accuracy: 0.8,
    ammo: 30,
    maxAmmo: 30,
    reloadTime: 2500
  } as Weapon,

  PISTOL: {
    id: 'pistol',
    name: 'Pistol',
    damage: 15,
    range: 50,
    fireRate: 3,
    accuracy: 0.9,
    ammo: 15,
    maxAmmo: 15,
    reloadTime: 1500
  } as Weapon,

  SNIPER_RIFLE: {
    id: 'sniper_rifle',
    name: 'Sniper Rifle',
    damage: 75,
    range: 200,
    fireRate: 0.5, // One shot every 2 seconds
    accuracy: 0.95,
    ammo: 5,
    maxAmmo: 5,
    reloadTime: 3000
  } as Weapon,

  SMG: {
    id: 'smg',
    name: 'SMG',
    damage: 18,
    range: 60,
    fireRate: 8,
    accuracy: 0.7,
    ammo: 40,
    maxAmmo: 40,
    reloadTime: 2000
  } as Weapon
};
