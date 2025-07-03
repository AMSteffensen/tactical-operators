import React from 'react';
import { TacticalView } from '../components/TacticalView';

export const Game: React.FC = () => {
  return (
    <div className="h-full">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white">Tactical Operations</h1>
        <p className="text-gray-300">WebGL-powered tactical combat view</p>
      </div>

      <div className="flex justify-center mb-6">
        <TacticalView height={500} />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="card-title">Controls</h3>
          <ul className="text-gray-300 mt-2 space-y-1">
            <li>• WASD - Move camera</li>
            <li>• Mouse - Select units</li>
            <li>• Space - Pause/Resume</li>
            <li>• Tab - Unit switching</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="card-title">Current Mission</h3>
          <p className="text-gray-300 mt-2">No active mission</p>
        </div>

        <div className="card">
          <h3 className="card-title">Squad Status</h3>
          <p className="text-gray-300 mt-2">No squad deployed</p>
        </div>
      </div>
    </div>
  );
};
