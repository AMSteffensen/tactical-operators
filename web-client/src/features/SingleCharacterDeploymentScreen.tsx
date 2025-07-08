import React, { useState, useEffect, useRef } from 'react';
import { Character } from '@shared/types';
import './SingleCharacterDeploymentScreen.css';

interface SingleCharacterDeploymentScreenProps {
  selectedCharacter: Character;
  onDeploymentComplete: (deployedCharacter: DeployedCharacter) => void;
  onBack: () => void;
}

interface DeployedCharacter extends Character {
  isDeployed: boolean;
  deployPosition?: { x: number; z: number };
  currentHealth: number;
  status: 'ready' | 'moving' | 'action' | 'wounded' | 'down';
}

export const SingleCharacterDeploymentScreen: React.FC<SingleCharacterDeploymentScreenProps> = ({
  selectedCharacter,
  onDeploymentComplete,
  onBack
}) => {
  const [deployedCharacter, setDeployedCharacter] = useState<DeployedCharacter | null>(null);
  // --- Multiplayer Lobby State ---
  const [players, setPlayers] = useState<Array<{ id: string; name: string; class: string }>>([
    { id: 'me', name: selectedCharacter.name, class: selectedCharacter.class }
  ]);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [lobbyId] = useState(() => {
    // Generate or get lobby ID (could be from URL or backend)
    return window.location.pathname.split('/').pop() || Math.random().toString(36).slice(2, 8);
  });
  const inviteUrl = `${window.location.origin}/game/join/${lobbyId}`;
  const maxPlayers = 5;
  const availableMaps = ['Warehouse', 'Desert Outpost', 'Urban Streets'];
  const [selectedMap, setSelectedMap] = useState(availableMaps[0]);

  // Simulate other players joining (replace with real socket logic)
  useEffect(() => {
    if (players.length < maxPlayers) {
      const timeout = setTimeout(() => {
        setPlayers(prev =>
          prev.length < maxPlayers
            ? [...prev, { id: `p${prev.length+1}`, name: `Player${prev.length+1}`, class: ['assault','sniper','medic','engineer','demolitions'][prev.length%5] }]
            : prev
        );
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [players.length]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAutoDeploy = () => {
    const deployed: DeployedCharacter = {
      ...selectedCharacter,
      isDeployed: true,
      deployPosition: { x: 0, z: -5 }, // Default spawn position
      currentHealth: selectedCharacter.health || selectedCharacter.maxHealth || 100,
      status: 'ready'
    };
    
    setDeployedCharacter(deployed);
  };

  const handleStartMission = () => {
    if (deployedCharacter) {
      onDeploymentComplete(deployedCharacter);
    }
  };

  // --- UI ---
  return (
    <div className="single-character-deployment-screen">
      {/* Header */}
      <div className="deployment-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Character Selection
        </button>
        <h1 className="deployment-title">Game Lobby</h1>
        <div className="deployment-subtitle">
          Share this link to invite up to 5 players
        </div>
      </div>

      <div className="deployment-content lobby-layout">
        {/* Left: Player List & Invite */}
        <div className="lobby-left-panel">
          <div className="lobby-invite">
            <input
              type="text"
              value={inviteUrl}
              readOnly
              style={{ width: '100%', marginBottom: 8 }}
              onFocus={e => e.target.select()}
            />
            <button
              onClick={() => navigator.clipboard.writeText(inviteUrl)}
              style={{ width: '100%' }}
            >
              Copy Invite Link
            </button>
          </div>
          <div className="lobby-players">
            <h4>Players in Lobby ({players.length}/{maxPlayers})</h4>
            <ul>
              {players.map(p => (
                <li key={p.id} style={{ fontWeight: p.id === 'me' ? 'bold' : undefined, display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{
                    display: 'inline-block',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#222',
                    color: '#fff',
                    textAlign: 'center',
                    lineHeight: '28px',
                    marginRight: 8,
                    fontWeight: 600
                  }}>{p.name.charAt(0).toUpperCase()}</span>
                  {p.name} <span style={{ color: '#888', marginLeft: 6 }}>{p.class}</span> {p.id === 'me' ? '(You)' : ''}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Center: Map Preview & Settings */}
        <div className="lobby-center-panel">
          <div className="map-vote-section">
            <h4>Map Selection (Coming Soon)</h4>
            <select value={selectedMap} onChange={e => setSelectedMap(e.target.value)} disabled>
              {availableMaps.map(map => (
                <option key={map} value={map}>{map}</option>
              ))}
            </select>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              Map voting and settings will be enabled in a future update.
            </div>
          </div>
          <div className="map-preview-section">
            <h4>Map Preview</h4>
            <div style={{ width: 220, height: 140, background: '#181c22', borderRadius: 8, border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 18 }}>
              (Map Preview Here)
            </div>
          </div>
          <div className="lobby-actions">
            <button
              className="start-mission-button"
              onClick={() => {
                handleAutoDeploy();
                handleStartMission();
              }}
              disabled={players.length > maxPlayers}
            >
              🚀 Start Game ({players.length} / {maxPlayers} joined)
            </button>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              You can start with 1 player, or wait for others to join (max 5).
            </div>
          </div>
        </div>

        {/* Right: Lobby Chat */}
        <div className="lobby-right-panel">
          <div className="lobby-chat">
            <h4>Lobby Chat</h4>
            <div className="chat-messages" style={{ height: 180, overflowY: 'auto', background: '#181c22', borderRadius: 6, padding: 8, border: '1px solid #333', marginBottom: 8 }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: 4 }}>
                  <span style={{ fontWeight: 'bold', color: '#6cf' }}>{msg.sender}:</span> <span>{msg.text}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (chatInput.trim()) {
                  setChatMessages(msgs => [...msgs, { sender: 'You', text: chatInput }]);
                  setChatInput('');
                }
              }}
              style={{ display: 'flex', gap: 4 }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1 }}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
