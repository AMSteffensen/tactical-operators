
import { Routes, Route, useLocation } from 'react-router-dom';
import { GameProvider } from './state/GameContext';
import { Header } from './components/Header';
import { Home } from './features/Home';
import { ResponsiveGame } from './features/ResponsiveGame';
import { Character } from './features/character/Character';
import { Guild } from './features/guild/Guild';
import { Campaign } from './features/campaign/Campaign';

function App() {
  const location = useLocation();
  const isGameRoute = location.pathname === '/game';

  return (
    <GameProvider>
      <div className="app">
        {!isGameRoute && <Header />}
        <main className={isGameRoute ? "game-main" : "main-content"}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<ResponsiveGame />} />
            <Route path="/character" element={<Character />} />
            <Route path="/guild" element={<Guild />} />
            <Route path="/campaign" element={<Campaign />} />
          </Routes>
        </main>
      </div>
    </GameProvider>
  );
}

export default App;
