// Simple test endpoint for Vercel serverless functions

export default function handler(req, res) {
  const timestamp = new Date().toISOString();
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  res.status(200).json({
    message: 'Vercel serverless function is working!',
    timestamp: timestamp,
    method: req.method,
    url: req.url,
    environment: {
      VERCEL_ENV: process.env.VERCEL_ENV,
      VITE_VERCEL_ENV: process.env.VITE_VERCEL_ENV,
      VERCEL_GIT_PULL_REQUEST_ID: process.env.VERCEL_GIT_PULL_REQUEST_ID,
      VITE_PR_NUMBER: process.env.VITE_PR_NUMBER,
    }
  });
}
