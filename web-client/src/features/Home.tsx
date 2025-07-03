import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to Tactical Operator
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          A tactical top-down multiplayer shooter with RPG mechanics and persistent campaigns.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Link to="/game" className="btn btn-primary">
            Start Playing
          </Link>
          <Link to="/character" className="btn btn-secondary">
            Manage Characters
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="card-title mb-3">Tactical Combat</h3>
          <p className="text-gray-300">
            Plan your moves carefully in turn-based tactical combat with real-time execution.
          </p>
        </div>

        <div className="card">
          <h3 className="card-title mb-3">Persistent Characters</h3>
          <p className="text-gray-300">
            Create and develop characters that persist across campaigns and sessions.
          </p>
        </div>

        <div className="card">
          <h3 className="card-title mb-3">Guild System</h3>
          <p className="text-gray-300">
            Join or create guilds with shared economies and collaborative gameplay.
          </p>
        </div>
      </div>
    </div>
  );
};
