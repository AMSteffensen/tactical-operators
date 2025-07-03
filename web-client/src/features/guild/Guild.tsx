import React from 'react';

export const Guild: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Guild Management</h1>
        <p className="text-gray-300">Join or create guilds for collaborative gameplay</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Your Guilds</h2>
          </div>
          
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏛️</div>
            <p className="text-gray-400 mb-4">You're not a member of any guilds</p>
            <div className="space-x-2">
              <button className="btn btn-primary">
                Create Guild
              </button>
              <button className="btn btn-secondary">
                Join Guild
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Available Guilds</h2>
          </div>
          
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-400 mb-4">No public guilds available</p>
            <button className="btn btn-secondary">
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="card-title">Guild Benefits</h3>
          <ul className="text-gray-300 mt-2 space-y-1 text-sm">
            <li>• Shared economy and resources</li>
            <li>• Collaborative campaigns</li>
            <li>• Group tactical planning</li>
            <li>• Member progression bonuses</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="card-title">Guild Roles</h3>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-yellow-400">Owner</span>
              <span className="text-gray-300">Full control</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400">Officer</span>
              <span className="text-gray-300">Management</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400">Member</span>
              <span className="text-gray-300">Participant</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Guild Features</h3>
          <ul className="text-gray-300 mt-2 space-y-1 text-sm">
            <li>• Guild bank and treasury</li>
            <li>• Shared equipment locker</li>
            <li>• Guild-exclusive missions</li>
            <li>• Member rankings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
