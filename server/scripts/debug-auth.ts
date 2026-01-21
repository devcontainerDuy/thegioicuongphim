import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ 
  jar, 
  withCredentials: true,
  validateStatus: () => true // Don't throw on error status
}));

const BASE_URL = 'http://localhost:3006/api';

async function testAuthFlow() {
  console.log('🚀 Starting Auth Flow Test...\n');

  // 1. REGISTER
  const randomSuffix = Math.floor(Math.random() * 10000);
  const email = `test.auth.${randomSuffix}@example.com`;
  const password = 'Password@123';
  
  console.log(`[1] Registering User (${email})...`);
  const regRes = await client.post(`${BASE_URL}/auth/register`, {
    email,
    password,
    name: 'Test Auth User'
  });

  if (regRes.status !== 201) {
    console.error('❌ Registration Failed:', regRes.data);
    return;
  }
  console.log('✅ Registration Successful');

  // 2. LOGIN
  console.log('\n[2] Logging In...');
  const loginRes = await client.post(`${BASE_URL}/auth/login`, {
    email,
    password
  });

  if (loginRes.status !== 200) {
    console.error('❌ Login Failed:', loginRes.data);
    return;
  }
  console.log('✅ Login Successful');
  
  const accessToken = loginRes.data.access_token;
  if (!accessToken) {
    console.error('❌ No Access Token returned!');
    return;
  }
  console.log(`🔑 Access Token received (Starts with: ${accessToken.substring(0, 15)}...)`);
  
  // Check Cookies
  const cookies = await jar.getCookies(BASE_URL);
  const refreshToken = cookies.find(c => c.key === 'refresh_token');
  if (refreshToken) {
    console.log('🍪 Refresh Token Cookie found!');
  } else {
    console.error('❌ Refresh Token Cookie NOT found!');
  }

  // 3. ACCESS PROTECTED ROUTE (PROFILE)
  console.log('\n[3] Accessing Protected Profile...');
  const profileRes = await client.get(`${BASE_URL}/user/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (profileRes.status === 200) {
    console.log('✅ Profile Access Successful:', profileRes.data.email);
  } else {
    console.error(`❌ Profile Access Failed (${profileRes.status}):`, profileRes.data);
  }

  // 4. REFRESH TOKEN
  console.log('\n[4] Refreshing Token...');
  const refreshRes = await client.post(`${BASE_URL}/auth/refresh`);

  if (refreshRes.status === 200) {
    console.log('✅ Token Refresh Successful');
    console.log(`🔑 New Access Token: ${refreshRes.data.access_token.substring(0, 15)}...`);
  } else {
    console.error(`❌ Token Refresh Failed (${refreshRes.status}):`, refreshRes.data);
  }
}

testAuthFlow().catch(console.error);
