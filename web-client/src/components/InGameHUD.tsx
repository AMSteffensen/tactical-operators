import React from 'react';
import { WeaponDisplay } from './ui/WeaponDisplay';
import type { Gun } from '@shared/types';
import './InGameHUD.css';

// No props needed for now, inventory will be passed in future

export const InGameHUD: React.FC = () => {
  // Inventory with two weapons
  const inventory: Gun[] = [
    {
      id: 'pistol-001',
      name: 'Pistol',
      type: 'weapon',
      slot: 1,
      ammo: 7,
      maxAmmo: 7,
      icon: '/src/assets/icons/pistol.svg',
      damage: 15,
      reloadTime: 1,
      value: 100,
      rarity: 'common',
      weight: 1,
      properties: {},
    },
    {
      id: 'smg-001',
      name: 'Submachine Gun',
      type: 'weapon',
      slot: 2,
      ammo: 25,
      maxAmmo: 25,
      icon: '/src/assets/icons/smg.svg',
      damage: 10,
      reloadTime: 0.5,
      value: 250,
      rarity: 'uncommon',
      weight: 1.2,
      properties: { fireRate: 'fast' },
    },
  ];

  // Track selected weapon index (0 = pistol, 1 = smg)
  const [selectedWeapon, setSelectedWeapon] = React.useState(0);

  // Keyboard handler for 1 and 2
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') setSelectedWeapon(0);
      if (e.key === '2') setSelectedWeapon(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="in-game-hud vertical-inventory">
      <div className="inventory-panel">
        {inventory.map((item, idx) => (
          <div
            className={`inventory-item${selectedWeapon === idx ? ' selected' : ''}`}
            key={item.id}
            tabIndex={0}
            aria-label={item.name + (selectedWeapon === idx ? ' (selected)' : '')}
            style={selectedWeapon === idx ? { boxShadow: '0 0 0 2px #4CAF50, 0 2px 8px rgba(0,0,0,0.15)' } : {}}
          >
            <WeaponDisplay
              weaponName={item.name}
              className=""
            />
            {/* Show slot number for clarity */}
            <div
              style={{
                position: 'absolute',
                top: 2,
                left: 4,
                fontSize: '0.7em',
                color: selectedWeapon === idx ? '#4CAF50' : '#aaa',
                fontWeight: 700,
                background: 'rgba(0,0,0,0.5)',
                borderRadius: 3,
                padding: '0 3px',
                pointerEvents: 'none',
              }}
            >
              {idx + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

