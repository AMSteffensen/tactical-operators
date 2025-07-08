import React from 'react';
import './HealthBar.css';

interface HealthBarProps {
  health: number;
  maxHealth: number;
  size?: 'small' | 'medium' | 'large';
  showNumbers?: boolean;
  className?: string;
}

export const HealthBar: React.FC<HealthBarProps> = ({
  health,
  maxHealth,
  size = 'medium',
  showNumbers = true,
  className = ''
}) => {
  const healthPercentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  
  const getHealthColor = (percentage: number): string => {
    if (percentage > 70) return '#4CAF50'; // Green
    if (percentage > 30) return '#FFA726'; // Orange
    return '#f44336'; // Red
  };

  const healthColor = getHealthColor(healthPercentage);

  return (
    <div className={`health-bar health-bar-${size} ${className}`}>
      {showNumbers && (
        <div className="health-numbers">
          <span className="current-health">{Math.ceil(health)}</span>
          <span className="health-separator">/</span>
          <span className="max-health">{maxHealth}</span>
        </div>
      )}
      <div className="health-bar-container">
        <div className="health-bar-background">
          <div 
            className="health-bar-fill"
            style={{ 
              width: `${healthPercentage}%`,
              backgroundColor: healthColor
            }}
          />
        </div>
      </div>
    </div>
  );
};
