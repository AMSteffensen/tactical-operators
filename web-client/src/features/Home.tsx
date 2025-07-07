import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export const Home: React.FC = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to
            <br />
            Tactical Operator
          </h1>
          <p className="hero-description">
            A tactical top-down multiplayer shooter with RPG mechanics and persistent campaigns.
          </p>
          
          <div className="hero-buttons">
            <Link to="/game" className="btn btn-primary btn-large">
              Start Playing
            </Link>
            <Link to="/character" className="btn btn-secondary btn-large">
              Manage Characters
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <h3 className="feature-title">Tactical Combat</h3>
            <p className="feature-description">
              Plan your moves carefully in turn-based tactical combat with real-time execution.
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-title">Persistent Characters</h3>
            <p className="feature-description">
              Create and develop characters that persist across campaigns and sessions.
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-title">Guild System</h3>
            <p className="feature-description">
              Join or create guilds with shared economies and collaborative gameplay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
