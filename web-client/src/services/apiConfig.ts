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
  // For HTTP requests, always use relative URLs so Vercel rewrites can proxy them
  // Only for WebSocket connections do we need direct URLs
  
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

  // In preview environments with PR number, provide direct URL for WebSocket
  if ((env === 'preview' && prNumber) || (isVercelPreview && prNumber)) {
    const railwayURL = `https://tactical-operators-tactical-operators-pr-${prNumber}.up.railway.app`;
    console.log('🎯 Using PR Railway URL:', railwayURL);
    return {
      baseURL: railwayURL,
      apiURL: '/api',           // Relative - uses Vercel rewrite
      authURL: '/api/auth',     // Relative - uses Vercel rewrite  
      characterURL: '/api/character', // Relative - uses Vercel rewrite
      socketURL: railwayURL,    // Direct - WebSocket connection
    };
  }

  // For Vercel preview deployments without PR number, try to extract from environment or use staging
  if ((env === 'preview') || isVercelPreview) {
    // For now, fall back to production Railway URL for preview deployments without PR number
    const railwayURL = 'https://tactical-operator-api.up.railway.app';
    console.log('🎯 Using fallback Railway URL for preview:', railwayURL);
    return {
      baseURL: railwayURL,
      apiURL: '/api',           // Relative - uses Vercel rewrite
      authURL: '/api/auth',     // Relative - uses Vercel rewrite
      characterURL: '/api/character', // Relative - uses Vercel rewrite
      socketURL: railwayURL,    // Direct - WebSocket connection
    };
  }

  // In production, provide direct URL for WebSocket
  if (env === 'production') {
    const railwayURL = 'https://tactical-operator-api.up.railway.app';
    console.log('🎯 Using production Railway URL:', railwayURL);
    return {
      baseURL: railwayURL,
      apiURL: '/api',           // Relative - uses Vercel rewrite
      authURL: '/api/auth',     // Relative - uses Vercel rewrite
      characterURL: '/api/character', // Relative - uses Vercel rewrite
      socketURL: railwayURL,    // Direct - WebSocket connection
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
