import React from 'react';

export const Campaign: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Campaign Management</h1>
        <p className="text-gray-300">Join persistent campaigns and track your progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Active Campaigns</h2>
            </div>
            
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🗺️</div>
              <p className="text-gray-400 mb-4">No active campaigns</p>
              <div className="space-x-2">
                <button className="btn btn-primary">
                  Create Campaign
                </button>
                <button className="btn btn-secondary">
                  Join Campaign
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Campaign Types</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-gray-700 rounded">
                <div className="font-medium text-green-400">Co-op</div>
                <div className="text-gray-300">Team vs AI</div>
              </div>
              <div className="p-2 bg-gray-700 rounded">
                <div className="font-medium text-blue-400">Solo</div>
                <div className="text-gray-300">Single player</div>
              </div>
              <div className="p-2 bg-gray-700 rounded">
                <div className="font-medium text-red-400">Guild</div>
                <div className="text-gray-300">Guild members only</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Campaign Stats</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Completed:</span>
                <span className="text-white">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">In Progress:</span>
                <span className="text-white">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Score:</span>
                <span className="text-white">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Achievements:</span>
                <span className="text-white">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">How Campaigns Work</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">1️⃣</div>
              <h4 className="font-medium text-white mb-1">Create/Join</h4>
              <p className="text-gray-300">Start or join a campaign with your characters</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">2️⃣</div>
              <h4 className="font-medium text-white mb-1">Deploy Squad</h4>
              <p className="text-gray-300">Select your tactical team for the mission</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">3️⃣</div>
              <h4 className="font-medium text-white mb-1">Execute Mission</h4>
              <p className="text-gray-300">Complete objectives in tactical combat</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">4️⃣</div>
              <h4 className="font-medium text-white mb-1">Progress</h4>
              <p className="text-gray-300">Gain XP, loot, and advance the campaign</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
