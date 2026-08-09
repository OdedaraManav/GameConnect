// Test script for GameConnect Auth APIs

async function runAuthTests() {
  console.log('🧪 Starting Auth API tests...\n');
  const baseUrl = 'http://localhost:5000/api/auth';

  let testToken = '';

  // Test 1: Register new user
  console.log('1️⃣ Testing Registration...');
  const regRes = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'TestPlayer1',
      email: 'testplayer1@gameconnect.io',
      password: 'SecurePassword123!'
    })
  });
  const regData = await regRes.json();
  console.log('Status:', regRes.status, regData);

  // Test 2: Register duplicate email
  console.log('\n2️⃣ Testing Duplicate Email...');
  const dupEmailRes = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'UniqueUser2',
      email: 'testplayer1@gameconnect.io',
      password: 'Password123!'
    })
  });
  console.log('Status:', dupEmailRes.status, await dupEmailRes.json());

  // Test 3: Register duplicate username
  console.log('\n3️⃣ Testing Duplicate Username...');
  const dupUserRes = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'TestPlayer1',
      email: 'differentemail@gameconnect.io',
      password: 'Password123!'
    })
  });
  console.log('Status:', dupUserRes.status, await dupUserRes.json());

  // Test 4: Register missing fields
  console.log('\n4️⃣ Testing Missing Fields...');
  const missingRes = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'NoPasswordUser',
      email: 'nopass@gameconnect.io'
    })
  });
  console.log('Status:', missingRes.status, await missingRes.json());

  // Test 5: Successful Login
  console.log('\n5️⃣ Testing Successful Login...');
  const loginRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'testplayer1@gameconnect.io',
      password: 'SecurePassword123!'
    })
  });
  const loginData = await loginRes.json();
  console.log('Status:', loginRes.status, loginData);
  if (loginData.token) {
    testToken = loginData.token;
  }

  // Test 6: Incorrect Password Login
  console.log('\n6️⃣ Testing Incorrect Password...');
  const wrongPassRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'testplayer1@gameconnect.io',
      password: 'WrongPassword999'
    })
  });
  console.log('Status:', wrongPassRes.status, await wrongPassRes.json());

  // Test 7: Non-existent Email Login
  console.log('\n7️⃣ Testing Non-existent Email...');
  const noUserRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'nobody@gameconnect.io',
      password: 'SomePassword'
    })
  });
  console.log('Status:', noUserRes.status, await noUserRes.json());

  // Test 8: Valid JWT Auth Middleware (GET /api/auth/me)
  console.log('\n8️⃣ Testing Protected Route with Valid Token...');
  const meRes = await fetch(`${baseUrl}/me`, {
    headers: { 'Authorization': `Bearer ${testToken}` }
  });
  console.log('Status:', meRes.status, await meRes.json());

  // Test 9: Invalid JWT Auth Middleware
  console.log('\n9️⃣ Testing Protected Route with Invalid Token...');
  const badTokenRes = await fetch(`${baseUrl}/me`, {
    headers: { 'Authorization': 'Bearer invalid_fake_token_123' }
  });
  console.log('Status:', badTokenRes.status, await badTokenRes.json());

  // Test 10: Missing JWT Auth Middleware
  console.log('\n🔟 Testing Protected Route with Missing Token...');
  const noTokenRes = await fetch(`${baseUrl}/me`);
  console.log('Status:', noTokenRes.status, await noTokenRes.json());

  console.log('\n✅ All Auth API tests completed!');
}

runAuthTests().catch(console.error);
