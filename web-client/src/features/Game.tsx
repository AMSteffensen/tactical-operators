import React from 'react';

export const Game: React.FC = () => {
  return (
    <div className="h-full">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white">Game View</h1>
        <p className="text-gray-300">WebGL rendering will be implemented here</p>
      </div>

      <div className="flex justify-center">
        <div className="game-canvas w-full max-w-4xl h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎮</div>
            <p className="text-gray-400">Game rendering system coming soon!</p>
            <p className="text-sm text-gray-500 mt-2">
              This will feature the WebGL top-down tactical view
            </p>
          </div>
        </div>
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
