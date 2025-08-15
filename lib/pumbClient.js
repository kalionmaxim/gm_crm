const axios = require('axios');
const { URLSearchParams } = require('url'); // <-- ensure URLSearchParams exists

const fetchToken = async ({
  username,
  password,
  clientId = 'EXT_OIC',          // keep your default if PUMB requires it
  authUrl,
  grantType = 'password'
}) => {
  if (!authUrl) throw new Error('authUrl is required');
  if (!username || !password) throw new Error('username/password required');

  const form = new URLSearchParams();
  form.append('grant_type', grantType);

  if (grantType === 'password') {
    form.append('username', username);
    form.append('password', password);
    if (clientId) form.append('client_id', clientId);
  } else if (grantType === 'client_credentials') {
    // if PUMB switches grant type later
    form.append('client_id', username);
    form.append('client_secret', password);
  }

  const res = await axios.post(authUrl, form.toString(), {
    timeout: 15000,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    validateStatus: s => s >= 200 && s < 500
  });

  if (res.status >= 400) {
    const err = new Error(`Token fetch failed: ${res.status}`);
    err.status = res.status;
    err.details = res.data;
    throw err;
  }

  return res.data; // { access_token, expires_in, ... }
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

module.exports = { fetchToken, createCredit, getCredit };
