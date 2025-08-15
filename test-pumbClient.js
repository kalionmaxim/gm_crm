const { getToken } = require('./lib/pumbClient');

(async () => {
  try {
    const token = await getToken();
    console.log('Access Token:', token);
  } catch (e) {
    console.error('Failed to get token:', e.message);
  }
})();
