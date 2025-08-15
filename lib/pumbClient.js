const axios = require('axios');
const qs = require('qs');

const getToken = async () => {
  const data = qs.stringify({
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

module.exports = { getToken };
