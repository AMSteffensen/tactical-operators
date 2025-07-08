import React from 'react';
import './WeaponDisplay.css';

interface WeaponDisplayProps {
  weaponName: string;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  canShoot: boolean;
  className?: string;
}

export const WeaponDisplay: React.FC<WeaponDisplayProps> = ({
  weaponName,
  ammo,
  maxAmmo,
  isReloading,
  canShoot,
  className = ''
}) => {
  const ammoPercentage = (ammo / maxAmmo) * 100;
  
  const getAmmoColor = (percentage: number): string => {
    if (percentage > 50) return '#4CAF50'; // Green
    if (percentage > 20) return '#FFA726'; // Orange
    return '#f44336'; // Red
  };

  const ammoColor = getAmmoColor(ammoPercentage);

  return (
    <div className={`weapon-display ${className} ${isReloading ? 'reloading' : ''} ${!canShoot ? 'cannot-shoot' : ''}`}>
      <div className="weapon-info">
        <div className="weapon-name">
          {weaponName}
          {isReloading && <span className="reload-indicator">🔄</span>}
        </div>
        
        <div className="ammo-info">
          <div className="ammo-numbers">
            <span className="current-ammo" style={{ color: ammoColor }}>
              {ammo}
            </span>
            <span className="ammo-separator">/</span>
            <span className="max-ammo">{maxAmmo}</span>
          </div>
          
          <div className="ammo-bar-container">
            <div className="ammo-bar-background">
              <div 
                className="ammo-bar-fill"
                style={{ 
                  width: `${ammoPercentage}%`,
                  backgroundColor: ammoColor
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {isReloading && (
        <div className="reload-status">
          <div className="reload-text">Reloading...</div>
          <div className="reload-animation">
            <div className="reload-spinner"></div>
          </div>
        </div>
      )}

      {ammo === 0 && !isReloading && (
        <div className="empty-ammo-warning">
          <span className="warning-icon">⚠️</span>
          <span className="warning-text">No Ammo - Press R to Reload</span>
        </div>
      )}
    </div>
  );
};
