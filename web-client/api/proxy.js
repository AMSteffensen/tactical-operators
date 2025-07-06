// Vercel serverless function to proxy API requests to Railway
// This runs at /api/proxy and forwards requests to the correct Railway environment

export default async function handler(req, res) {
  // Get environment variables
  const prNumber = process.env.VITE_PR_NUMBER;
  const vercelEnv = process.env.VITE_VERCEL_ENV || process.env.VERCEL_ENV;
  
  // Determine Railway URL based on environment
  let railwayBaseUrl;
  
  if (vercelEnv === 'preview' && prNumber) {
    railwayBaseUrl = `https://tactical-operators-tactical-operators-pr-${prNumber}.up.railway.app`;
  } else if (vercelEnv === 'production') {
    railwayBaseUrl = 'https://tactical-operator-api.up.railway.app';
  } else {
    railwayBaseUrl = 'https://tactical-operator-api.up.railway.app'; // fallback
  }
  
  // Extract the path from the request (everything after /api/proxy)
  const path = req.url.replace('/api/proxy', '') || '/';
  const targetUrl = `${railwayBaseUrl}/api${path}`;
  
  console.log(`Proxying ${req.method} ${req.url} -> ${targetUrl}`);
  
  try {
    // Forward the request to Railway
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(railwayBaseUrl).host, // Update host header
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    
    // Copy response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Forward response
    const data = await response.text();
    res.status(response.status).send(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy failed', 
      message: error.message,
      railwayUrl: railwayBaseUrl 
    });
  }
}
