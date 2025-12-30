(function() {
  function getEnv(key, defaultValue) {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    return defaultValue;
  }

  window.__ENV__ = {
    USE_MOCK_DATA: getEnv('USE_MOCK_DATA', 'false'),
    API_URL: getEnv('API_URL', 'http://localhost:8000/api/v1'),
    MOCK_DATA_PATH: getEnv('MOCK_DATA_PATH', 'assets/mockData'),
    NODE_ENV: getEnv('NODE_ENV', 'development')
  };

  console.log('env.js cargado:', window.__ENV__);
})();
