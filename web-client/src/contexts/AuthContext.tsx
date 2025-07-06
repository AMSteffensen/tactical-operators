import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

// Types
interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuthStatus: () => void;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

// Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_AUTH_STATUS'; payload: { user: User; token: string } };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_AUTH_STATUS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app load
  const checkAuthStatus = () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'SET_AUTH_STATUS', payload: { user, token } });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        return { success: true };
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'Network error' };
    }
  };

  // Register function
  const register = async (email: string, username: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await authService.register(email, username, password);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        return { success: true };
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'Network error' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    dispatch({ type: 'LOGOUT' });
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
