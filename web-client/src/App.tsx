import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GameProvider } from './state/GameContext';
import { Header } from './components/Header';
import { Home } from './features/Home';
import { Game } from './features/Game';
import { Character } from './features/character/Character';
import { Guild } from './features/guild/Guild';
import { Campaign } from './features/campaign/Campaign';

function App() {
  return (
    <GameProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
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
