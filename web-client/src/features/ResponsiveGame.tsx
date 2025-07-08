import React from 'react';
import { SingleCharacterGame } from './SingleCharacterGame';

interface ResponsiveGameProps {
  className?: string;
}

export const ResponsiveGame: React.FC<ResponsiveGameProps> = ({ className = '' }) => {
  // Use the new single-character game flow by default
  return <SingleCharacterGame className={className} />;
};
