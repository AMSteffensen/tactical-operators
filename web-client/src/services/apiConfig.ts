/**
 * Dynamic API configuration based on Vercel environment variables
 * Uses VERCEL_ENV and VERCEL_GIT_PULL_REQUEST_ID for automatic Railway URL detection
 */

export interface ApiConfig {
  baseURL: string;
  apiURL: string;
  authURL: string;
  characterURL: string;
  socketURL: string;
}

export const getApiConfig = (): ApiConfig => {
  // For Vercel deployments, use serverless function proxy
  // For local development, use Vite proxy to local API
  
  const prNumber = import.meta.env.VITE_PR_NUMBER;
  const env = import.meta.env.VITE_VERCEL_ENV;
  
  // Fallback detection: check if we're on a Vercel preview URL when env vars aren't set
  const isVercelPreview = typeof window !== 'undefined' && 
    (window.location.hostname.includes('vercel.app') && 
     !window.location.hostname.startsWith('tactical-operator-web.vercel.app'));
  
  console.log('🔧 API Config Debug:', {
    prNumber,
    env,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
    isVercelPreview
  });

  // For Vercel deployments (preview or production), use serverless function proxy
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    console.log('🎯 Using Vercel serverless function proxy');
    return {
      baseURL: '', // Use current domain
      apiURL: '/api/proxy',           // Proxy through serverless function
      authURL: '/api/proxy/auth',     // Proxy through serverless function  
      characterURL: '/api/proxy/character', // Proxy through serverless function
      socketURL: prNumber ? 
        `https://tactical-operators-tactical-operators-pr-${prNumber}.up.railway.app` :
        'https://tactical-operator-api.up.railway.app', // Direct WebSocket connection
    };
  }

  // In development (localhost), use relative URLs with Vite proxy
  console.log('🎯 Using development configuration');
  return {
    baseURL: '',
    apiURL: '/api',
    authURL: '/api/auth',
    characterURL: '/api/character',
    socketURL: 'http://localhost:3001',
  };
};
