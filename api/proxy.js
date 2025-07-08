// Vercel serverless function to proxy API requests to Railway
// This runs at /api/proxy and forwards requests to the correct Railway environment

export default async function handler(req, res) {
  // Debug: Log incoming request URL and method
  console.log('[PROXY] Incoming:', req.method, req.url);

  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only handle paths that start with /api/proxy
  if (!req.url.startsWith('/api/proxy')) {
    res.status(404).json({ error: 'Not Found: This proxy only handles /api/proxy/* requests.' });
    return;
  }

  // Get environment variables - prioritize native Vercel variables
  const prNumber = process.env.VERCEL_GIT_PULL_REQUEST_ID || process.env.VITE_PR_NUMBER;
  const vercelEnv = process.env.VERCEL_ENV || process.env.VITE_VERCEL_ENV;
  
  // Determine Railway URL based on environment
  let railwayBaseUrl;

  if (vercelEnv === 'preview') {
    if (prNumber) {
      railwayBaseUrl = `https://tactical-operators-tactical-operators-pr-${prNumber}.up.railway.app`;
    } else {
      // In preview, but no PR number: error, do not fallback to prod
      res.status(500).json({
        error: 'No PR number detected in Vercel preview environment. Cannot determine Railway PR API URL.',
        environment: vercelEnv,
        prNumber: prNumber
      });
      return;
    }
  } else if (vercelEnv === 'production') {
    railwayBaseUrl = 'https://tactical-operators-production.up.railway.app';
  } else {
    // For local/dev or unknown env, use production as fallback
    railwayBaseUrl = 'https://tactical-operators-production.up.railway.app';
  }
  
  // Extract the path from the request (everything after /api/proxy)
  const path = req.url.replace('/api/proxy', '') || '/';
  const targetUrl = `${railwayBaseUrl}/api${path}`;

  console.log(`[PROXY] Extracted path: ${path}`);
  console.log(`[PROXY] Target URL: ${targetUrl}`);
  console.log(`[PROXY] Environment: ${vercelEnv}, PR: ${prNumber}`);
  
  try {
    // Prepare headers for Railway request
    const railwayHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Vercel-Proxy/1.0',
    };
    
    // Copy authorization header if present
    if (req.headers.authorization) {
      railwayHeaders.authorization = req.headers.authorization;
    }
    
    // Prepare request body for non-GET requests
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      if (typeof req.body === 'string') {
        body = req.body;
      } else {
        body = JSON.stringify(req.body);
      }
    }
    
    // Forward the request to Railway
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: railwayHeaders,
      body: body,
    });
    
    console.log(`[PROXY] Railway response: ${response.status} ${response.statusText}`);
    
    // Get response text
    const responseText = await response.text();
    
    // Try to parse as JSON, fall back to text
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
    
    // Forward response
    res.status(response.status);
    
    // Set content type based on response
    if (typeof responseData === 'object') {
      res.setHeader('Content-Type', 'application/json');
      res.json(responseData);
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.send(responseData);
    }
    
  } catch (error) {
    console.error('[PROXY] Error:', error);
    res.status(500).json({ 
      error: 'Proxy failed', 
      message: error.message,
      railwayUrl: railwayBaseUrl,
      environment: vercelEnv,
      prNumber: prNumber
    });
  }
}

// If this file is imported as a Vercel Edge Function, also export as default
export const config = {
  runtime: 'nodejs',
};

// Catch-all 404 for unmatched requests (should not be reached)
export function default404(req, res) {
  res.status(404).json({ error: 'Not Found: Proxy handler not triggered.' });
}
