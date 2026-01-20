const fs = require('fs');
const path = require('path');

const envVars = {
  USE_MOCK_DATA: process.env.USE_MOCK_DATA || 'false',
  API_URL: process.env.API_URL || 'http://localhost:8000',
  MOCK_DATA_PATH: process.env.MOCK_DATA_PATH || 'assets/mockData',
  NODE_ENV: process.env.NODE_ENV || 'production'
};

const envJsContent = `(function() {
  window.__ENV__ = {
    USE_MOCK_DATA: ${JSON.stringify(envVars.USE_MOCK_DATA)},
    API_URL: ${JSON.stringify(envVars.API_URL)},
    MOCK_DATA_PATH: ${JSON.stringify(envVars.MOCK_DATA_PATH)},
    NODE_ENV: ${JSON.stringify(envVars.NODE_ENV)}
  };
})();
`;

const outputPath = path.join(__dirname, '../src/assets/env.js');
fs.writeFileSync(outputPath, envJsContent, 'utf8');

console.log('✅ env.js generado correctamente');
console.log('Variables de entorno:');
console.log('  API_URL:', envVars.API_URL);
console.log('  USE_MOCK_DATA:', envVars.USE_MOCK_DATA);
console.log('  NODE_ENV:', envVars.NODE_ENV);
