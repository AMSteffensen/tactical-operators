import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="flex items-center justify-between max-w-6xl mx-auto">
      
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
            <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold">
            Tactical Operator
          </Link>
        </div>
              <Link to="/character" className="hover:text-blue-400">
                Character
              </Link>
              <Link to="/guild" className="hover:text-blue-400">
                Guild
              </Link>
              <Link to="/campaign" className="hover:text-blue-400">
                Campaign
              </Link>
              <Link to="/game" className="btn btn-primary">
            Play Game
          </Link>
            </>
          ) : null}
          
        </div>
      </nav>
    </header>
  );
};
