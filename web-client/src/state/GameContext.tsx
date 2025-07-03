import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Character, Guild, Campaign } from '@shared/types';

interface GameState {
  user: {
    id: string;
    email: string;
    username: string;
  } | null;
  characters: Character[];
  guilds: Guild[];
  campaigns: Campaign[];
  currentCharacter: Character | null;
  currentGuild: Guild | null;
  currentCampaign: Campaign | null;
  isLoading: boolean;
  error: string | null;
}

type GameAction =
  | { type: 'SET_USER'; payload: GameState['user'] }
  | { type: 'SET_CHARACTERS'; payload: Character[] }
  | { type: 'SET_GUILDS'; payload: Guild[] }
  | { type: 'SET_CAMPAIGNS'; payload: Campaign[] }
  | { type: 'SET_CURRENT_CHARACTER'; payload: Character | null }
  | { type: 'SET_CURRENT_GUILD'; payload: Guild | null }
  | { type: 'SET_CURRENT_CAMPAIGN'; payload: Campaign | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: GameState = {
  user: null,
  characters: [],
  guilds: [],
  campaigns: [],
  currentCharacter: null,
  currentGuild: null,
  currentCampaign: null,
  isLoading: false,
  error: null,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_CHARACTERS':
      return { ...state, characters: action.payload };
    case 'SET_GUILDS':
      return { ...state, guilds: action.payload };
    case 'SET_CAMPAIGNS':
      return { ...state, campaigns: action.payload };
    case 'SET_CURRENT_CHARACTER':
      return { ...state, currentCharacter: action.payload };
    case 'SET_CURRENT_GUILD':
      return { ...state, currentGuild: action.payload };
    case 'SET_CURRENT_CAMPAIGN':
      return { ...state, currentCampaign: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
