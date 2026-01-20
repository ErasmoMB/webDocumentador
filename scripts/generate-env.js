const fs = require('fs');
const path = require('path');

console.log('🔍 Generando env.js...');
console.log('Variables de entorno disponibles:');
console.log('  process.env.API_URL:', process.env.API_URL || '(no definida)');
console.log('  process.env.USE_MOCK_DATA:', process.env.USE_MOCK_DATA || '(no definida)');
console.log('  process.env.NODE_ENV:', process.env.NODE_ENV || '(no definida)');
console.log('Todas las variables process.env:', Object.keys(process.env).filter(k => k.includes('API') || k.includes('MOCK') || k.includes('NODE')));

const envVars = {
  USE_MOCK_DATA: process.env.USE_MOCK_DATA || 'false',
  API_URL: process.env.API_URL || 'http://localhost:8000',
  MOCK_DATA_PATH: process.env.MOCK_DATA_PATH || 'assets/mockData',
  NODE_ENV: process.env.NODE_ENV || 'production'
};

if (!process.env.API_URL) {
  console.error('❌ ERROR: API_URL no está definida en las variables de entorno');
  console.error('❌ En Render, ve a Environment y agrega:');
  console.error('   Key: API_URL');
  console.error('   Value: https://backend-api-lbs.onrender.com');
  console.error('❌ Usando valor por defecto (localhost) - esto NO funcionará en producción');
}

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
console.log('Valores finales:');
console.log('  API_URL:', envVars.API_URL);
console.log('  USE_MOCK_DATA:', envVars.USE_MOCK_DATA);
console.log('  NODE_ENV:', envVars.NODE_ENV);
