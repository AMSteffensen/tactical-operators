import React from 'react';
import './WeaponDisplay.css';


interface WeaponDisplayProps {
  weaponName: string;
  className?: string;
}

export const WeaponDisplay: React.FC<WeaponDisplayProps> = ({ weaponName, className = '' }) => {
  // Only show SVG icon for inventory HUD
  // Show different SVG for pistol and SMG
  const renderWeaponSVG = () => {
    if (weaponName.toLowerCase().includes('smg') || weaponName.toLowerCase().includes('submachine')) {
      // SMG SVG
      return (
        <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="9" width="20" height="3" rx="1" fill="#222"/>
          <rect x="22" y="10" width="7" height="2" rx="1" fill="#666"/>
          <rect x="27" y="12" width="2" height="5" rx="1" fill="#444"/>
          <rect x="8" y="12" width="6" height="2" rx="1" fill="#888"/>
          <rect x="14" y="14" width="2" height="4" rx="1" fill="#222"/>
          <rect x="5" y="7" width="4" height="2" rx="1" fill="#555"/>
          <rect x="10" y="5" width="8" height="2" rx="1" fill="#999"/>
        </svg>
      );
    }
    // Default: Pistol SVG
    return (
      <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="8" width="18" height="4" rx="1" fill="#333"/>
        <rect x="20" y="10" width="8" height="2" rx="1" fill="#666"/>
        <rect x="24" y="12" width="2" height="5" rx="1" fill="#444"/>
        <rect x="6" y="12" width="4" height="2" rx="1" fill="#888"/>
        <rect x="10" y="14" width="2" height="4" rx="1" fill="#222"/>
      </svg>
    );
  };
  return (
    <div className={`weapon-display ${className}`} style={{padding: 0, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div className="weapon-svg" style={{width: 32, height: 20}}>
        {renderWeaponSVG()}
      </div>
      <span className="sr-only">{weaponName}</span>
    </div>
  );
};
