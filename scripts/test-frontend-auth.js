#!/usr/bin/env node

// 🧪 Frontend Authentication Test
// Tests that the frontend auth service works correctly with the fixed URLs

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000'; // Frontend dev server URL
const TEST_EMAIL = `test-fe-${Math.floor(Math.random() * 10000)}@example.com`;
const TEST_USERNAME = `testfe${Math.floor(Math.random() * 10000)}`;
const TEST_PASSWORD = 'TestPassword123';

console.log('🧪 Testing Frontend Authentication API Calls');
console.log('==============================================');
console.log(`Test Email: ${TEST_EMAIL}`);
console.log(`Test Username: ${TEST_USERNAME}`);
console.log('');

async function testFrontendAuth() {
  try {
    // Test registration through frontend proxy
    console.log('🔐 Testing Registration through Frontend Proxy...');
    const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        username: TEST_USERNAME,
        password: TEST_PASSWORD,
      }),
    });

    if (!registerResponse.ok) {
      console.log('❌ Frontend Registration: HTTP Error');
      console.log(`   Status: ${registerResponse.status} ${registerResponse.statusText}`);
      const errorText = await registerResponse.text();
      console.log(`   Response: ${errorText}`);
      return;
    }

    const registerData = await registerResponse.json();

    if (registerData.success) {
      console.log('✅ Frontend Registration: PASSED');
      console.log(`   Created user: ${TEST_USERNAME}`);
    } else {
      console.log('❌ Frontend Registration: FAILED');
      console.log('   Response:', registerData);
      return;
    }

    // Test login through frontend proxy
    console.log('🔑 Testing Login through Frontend Proxy...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });

    const loginData = await loginResponse.json();

    if (loginData.success && (loginData.token || loginData.data?.token)) {
      console.log('✅ Frontend Login: PASSED');
      const token = loginData.token || loginData.data.token;
      console.log(`   JWT Token: ${token.substring(0, 20)}...`);
    } else {
      console.log('❌ Frontend Login: FAILED');
      console.log('   Response:', loginData);
      return;
    }

    console.log('');
    console.log('🎉 All Frontend Authentication Tests PASSED!');
    console.log('✅ The double /api issue has been resolved');
    console.log('✅ Frontend can successfully communicate with API');
  } catch (error) {
    console.log('❌ Frontend Authentication Test FAILED');
    console.log('Error:', error.message);
  }
}

testFrontendAuth();
