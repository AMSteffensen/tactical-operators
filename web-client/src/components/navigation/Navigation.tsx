import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navigation.css';

export const Navigation: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-text">Tactical Operator</span>
        </Link>

        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <Link to="/characters" className="nav-link">
                Characters
              </Link>
              <Link to="/game" className="nav-link">
                Game
              </Link>
              <div className="nav-user">
                <span className="nav-username">
                  Welcome, {user?.username}
                </span>
                <button onClick={handleLogout} className="nav-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
