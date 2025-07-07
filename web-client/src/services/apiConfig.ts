/**
 * API configuration for different environments
 */

export interface ApiConfig {
  baseURL: string;
  apiURL: string;
  authURL: string;
  characterURL: string;
  socketURL: string;
}

export const getApiConfig = (): ApiConfig => {
  // Check if we're in production (Vercel deployment)
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    // Production: Use Railway API directly
    return {
      baseURL: 'https://tactical-operators-production.up.railway.app',
      apiURL: 'https://tactical-operators-production.up.railway.app/api',
      authURL: 'https://tactical-operators-production.up.railway.app/api/auth',
      characterURL: 'https://tactical-operators-production.up.railway.app/api/character',
      socketURL: 'https://tactical-operators-production.up.railway.app',
    };
  }

  // Development: Use Vite proxy to local API
  return {
    baseURL: '',
    apiURL: '/api',
    authURL: '/api/auth',
    characterURL: '/api/character',
    socketURL: 'http://localhost:3001',
  };
};
