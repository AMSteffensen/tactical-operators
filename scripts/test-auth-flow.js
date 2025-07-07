#!/usr/bin/env node

/**
 * Test script to verify authentication flow is working
 * Run this in browser console to test auth service
 */

console.log('🧪 Testing Authentication Flow...');

// Test the configuration
import { getApiConfig } from '../web-client/src/services/apiConfig.js';
const config = getApiConfig();
console.log('📋 API Configuration:', config);

// Test login endpoint availability
async function testAuthEndpoints() {
  const testEmail = 'test@example.com';
  const testPassword = 'testpassword123';
  
  try {
    // Test registration endpoint
    console.log('🔧 Testing registration endpoint...');
    const registerResponse = await fetch(`${config.authURL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        username: 'testuser',
        password: testPassword
      })
    });
    
    console.log('📝 Register response status:', registerResponse.status);
    
    // Test login endpoint
    console.log('🔧 Testing login endpoint...');
    const loginResponse = await fetch(`${config.authURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    console.log('🔑 Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', loginData);
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData);
    }
    
  } catch (error) {
    console.error('🔥 Network error:', error);
  }
}

// Run the test
testAuthEndpoints();
