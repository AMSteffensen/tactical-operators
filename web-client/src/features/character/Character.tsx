import React from 'react';

export const Character: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Character Management</h1>
        <p className="text-gray-300">Create and manage your persistent tactical operators</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Your Characters</h2>
            </div>
            
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👤</div>
              <p className="text-gray-400 mb-4">No characters created yet</p>
              <button className="btn btn-primary">
                Create New Character
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Character Classes</h3>
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-gray-700 rounded">
                <div className="font-medium text-blue-400">Assault</div>
                <div className="text-sm text-gray-300">Front-line fighter</div>
              </div>
              <div className="p-2 bg-gray-700 rounded">
                <div className="font-medium text-green-400">Sniper</div>
                <div className="text-sm text-gray-300">Long-range specialist</div>
              </div>
              <div className="p-2 bg-gray-700 rounded">
                <div className="font-medium text-red-400">Medic</div>
                <div className="text-sm text-gray-300">Support specialist</div>
              </div>
              <div className="p-2 bg-gray-700 rounded">
                <div className="font-medium text-yellow-400">Engineer</div>
                <div className="text-sm text-gray-300">Technical specialist</div>
              </div>
              <div className="p-2 bg-gray-700 rounded">
                <div className="font-medium text-orange-400">Demolitions</div>
                <div className="text-sm text-gray-300">Explosives expert</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Stats</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Characters:</span>
                <span className="text-white">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Max Level:</span>
                <span className="text-white">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Active Campaigns:</span>
                <span className="text-white">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
