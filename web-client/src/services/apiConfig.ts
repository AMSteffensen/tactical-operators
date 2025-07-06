/**
 * Dynamic API configuration based on Vercel environment variables
 * Uses VERCEL_ENV and VERCEL_GIT_PULL_REQUEST_ID for automatic Railway URL detection
 */

const prNumber = import.meta.env.VITE_PR_NUMBER;
const env = import.meta.env.VITE_VERCEL_ENV;

export interface ApiConfig {
  baseURL: string;
  apiURL: string;
  authURL: string;
  characterURL: string;
  socketURL: string;
}

export const getApiConfig = (): ApiConfig => {
  // In preview environments with PR number, use PR-specific Railway URL
  if (env === 'preview' && prNumber) {
    const baseURL = `https://tactical-operators-tactical-operators-pr-${prNumber}.up.railway.app`;
    return {
      baseURL,
      apiURL: `${baseURL}/api`,
      authURL: `${baseURL}/api/auth`,
      characterURL: `${baseURL}/api/character`,
      socketURL: baseURL,
    };
  }

  // In production, use main Railway production URL
  if (env === 'production') {
    const baseURL = 'https://tactical-operator-api.up.railway.app';
    return {
      baseURL,
      apiURL: `${baseURL}/api`,
      authURL: `${baseURL}/api/auth`,
      characterURL: `${baseURL}/api/character`,
      socketURL: baseURL,
    };
  }

  // In development (localhost), use relative URLs with Vite proxy
  return {
    baseURL: '',
    apiURL: '/api',
    authURL: '/api/auth',
    characterURL: '/api/character',
    socketURL: 'http://localhost:3001',
  };
};
