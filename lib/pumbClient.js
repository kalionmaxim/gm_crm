const axios = require('axios');

const fetchToken = async (credentials) => {
  const data = new URLSearchParams({
    client_id: 'EXT_OIC',
    username: credentials.username,
    password: credentials.password,
    grant_type: 'password'
  });

  try {
    const response = await axios.post(
      credentials.authUrl || 'https://auth.dts.fuib.com/auth/realms/pumb_ext/protocol/openid-connect/token',
      data,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return response.data;
  } catch (error) {
    console.error('Auth error:', error.message);
    throw error;
  }
};

const createCredit = async (params) => {
  const { token, flowId, baseUrl, payload, secretKey } = params;
  
  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    if (secretKey) {
      headers['X-Secret-Key'] = secretKey;
    }

    const response = await axios.post(
      `${baseUrl}/sf-credits`,
      {
        flowId,
        ...payload
      },
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Create credit error:', error.message);
    throw error;
  }
};

const getCredit = async (params) => {
  const { token, baseUrl, creditId, secretKey } = params;
  
  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    if (secretKey) {
      headers['X-Secret-Key'] = secretKey;
    }

    const response = await axios.get(
      `${baseUrl}/sf-credits/${creditId}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Get credit error:', error.message);
    throw error;
  }
};

// Keep the old function for backward compatibility
const getToken = async () => {
  const data = new URLSearchParams({
    client_id: 'EXT_OIC',
    username: 'your_username',
    password: 'your_password',
    grant_type: 'password'
  });

  try {
    const response = await axios.post(
      'https://auth.dts.fuib.com/auth/realms/pumb_ext/protocol/openid-connect/token',
      data,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Auth error:', error.message);
    throw error;
  }
};

module.exports = { fetchToken, createCredit, getCredit, getToken };
