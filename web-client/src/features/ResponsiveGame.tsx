import React from 'react';
import { DistractionFreeGame } from './DistractionFreeGame';

interface ResponsiveGameProps {
  className?: string;
}

export const ResponsiveGame: React.FC<ResponsiveGameProps> = ({ className = '' }) => {
  // Use the new distraction-free game flow by default
  // This provides: Squad Selection Screen → Deployment Screen → Full-Screen Gameplay
  return <DistractionFreeGame className={className} />;
  
  // Legacy layouts available for comparison (uncomment if needed):
  // import { Game } from './Game';
  // import { MobileGame } from './MobileGame';
  // const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  // const shouldUseMobileLayout = windowWidth < 1200;
  // if (shouldUseMobileLayout) {
  //   return <MobileGame className={className} />;
  // } else {
  //   return <Game />;
  // }
};
