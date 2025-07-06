/**
 * Browser Console Test Script for Frontend Authentication
 * 
 * Instructions:
 * 1. Open your Vercel preview URL in browser
 * 2. Open Developer Tools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter to run
 * 
 * This will test:
 * - Environment variable detection
 * - API configuration
 * - Actual network requests to Railway
 */

console.log('🧪 Frontend Auth Test - Vercel Preview Environment');
console.log('================================================');

// Helper function to get environment variables in browser
function getEnvVars() {
  // Try to access Vite environment variables
  const env = {
    VITE_PR_NUMBER: window.__VITE_PR_NUMBER__ || (typeof import !== 'undefined' && import.meta?.env?.VITE_PR_NUMBER),
    VITE_VERCEL_ENV: window.__VITE_VERCEL_ENV__ || (typeof import !== 'undefined' && import.meta?.env?.VITE_VERCEL_ENV),
    VITE_API_URL: window.__VITE_API_URL__ || (typeof import !== 'undefined' && import.meta?.env?.VITE_API_URL),
    VITE_SOCKET_URL: window.__VITE_SOCKET_URL__ || (typeof import !== 'undefined' && import.meta?.env?.VITE_SOCKET_URL)
  };
  
  console.log('📋 Environment Variables:');
  console.table(env);
  return env;
}

// Simulate the API config logic
function simulateApiConfig(env) {
  const prNumber = env.VITE_PR_NUMBER;
  const vercelEnv = env.VITE_VERCEL_ENV;
  
  console.log('🔧 Configuration Logic:');
  console.log('PR Number:', prNumber);
  console.log('Vercel Environment:', vercelEnv);
  
  let config;
  
  if (vercelEnv === 'preview' && prNumber) {
    const railwayURL = `https://tactical-operators-tactical-operators-pr-${prNumber}.up.railway.app`;
    config = {
      baseURL: railwayURL,
      apiURL: '/api',
      authURL: '/api/auth',
      characterURL: '/api/character',
      socketURL: railwayURL,
    };
    console.log('🎯 Using PR Railway URL:', railwayURL);
  } else if (vercelEnv === 'production') {
    const railwayURL = 'https://tactical-operator-api.up.railway.app';
    config = {
      baseURL: railwayURL,
      apiURL: '/api',
      authURL: '/api/auth',
      characterURL: '/api/character',
      socketURL: railwayURL,
    };
    console.log('🎯 Using Production Railway URL:', railwayURL);
  } else {
    config = {
      baseURL: '',
      apiURL: '/api',
      authURL: '/api/auth',
      characterURL: '/api/character',
      socketURL: 'http://localhost:3001',
    };
    console.log('🎯 Using Development Configuration');
  }
  
  console.log('📋 Expected API Config:');
  console.table(config);
  return config;
}

// Test actual network requests
async function testNetworkRequests() {
  console.log('\n🌐 Testing Network Requests...');
  
  const tests = [
    { name: 'Root API', url: '/api', method: 'GET' },
    { name: 'Auth Root', url: '/api/auth', method: 'GET' },
    { name: 'Character Root', url: '/api/character', method: 'GET' },
    { name: 'Login Endpoint', url: '/api/auth/login', method: 'POST', body: { email: 'test@example.com', password: 'test123' } }
  ];
  
  for (const test of tests) {
    try {
      console.log(`🔍 Testing ${test.name}...`);
      
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const response = await fetch(test.url, options);
      
      console.log(`📝 ${test.name}:`);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   URL: ${response.url}`);
      console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
      
      // Check if response was proxied to Railway
      if (response.url.includes('railway.app')) {
        console.log(`✅ ${test.name}: Request was proxied to Railway!`);
      } else if (response.url.includes('vercel.app')) {
        console.log(`⚠️  ${test.name}: Request stayed on Vercel (may be expected for some endpoints)`);
      } else {
        console.log(`❓ ${test.name}: Unexpected URL pattern`);
      }
      
      // Try to read response body
      if (response.ok || response.status === 404) {
        try {
          const text = await response.text();
          if (text) {
            console.log(`   Body: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
          }
        } catch (e) {
          console.log(`   Body: [Could not read response body]`);
        }
      }
      
    } catch (error) {
      console.error(`❌ ${test.name} failed:`, error.message);
    }
    
    console.log(''); // Add spacing
  }
}

// Check current page environment
function checkPageEnvironment() {
  console.log('\n🌍 Page Environment Info:');
  console.log('Current URL:', window.location.href);
  console.log('Origin:', window.location.origin);
  console.log('Host:', window.location.host);
  
  // Check if this is a Vercel preview deployment
  if (window.location.host.includes('vercel.app')) {
    console.log('✅ Running on Vercel deployment');
    
    // Try to extract PR info from URL if possible
    const match = window.location.host.match(/tactical-operator-web-(.+)-(.+)\.vercel\.app/);
    if (match) {
      console.log('🔍 Detected preview deployment branch/PR info from URL');
    }
  } else {
    console.log('🏠 Running on local development');
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Frontend Authentication Tests...\n');
  
  // 1. Check page environment
  checkPageEnvironment();
  
  // 2. Get environment variables
  const env = getEnvVars();
  
  // 3. Test API configuration logic
  const config = simulateApiConfig(env);
  
  // 4. Test actual network requests
  await testNetworkRequests();
  
  console.log('🎉 Frontend authentication testing complete!');
  console.log('💡 Check the Network tab in DevTools to see actual request URLs and responses');
  console.log('💡 Look for requests to railway.app domains to confirm proxy is working');
}

// Auto-run the tests
runAllTests().catch(console.error);
