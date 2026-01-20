const fs = require('fs');
const path = require('path');

console.log('🔍 Generando env.js...');
console.log('Variables de entorno disponibles:');
console.log('  process.env.API_URL:', process.env.API_URL || '(no definida)');
console.log('  process.env.USE_MOCK_DATA:', process.env.USE_MOCK_DATA || '(no definida)');
console.log('  process.env.NODE_ENV:', process.env.NODE_ENV || '(no definida)');
console.log('Todas las variables process.env:', Object.keys(process.env).filter(k => k.includes('API') || k.includes('MOCK') || k.includes('NODE')));

const isRender = !!process.env.RENDER || 
                 !!process.env.RENDER_EXTERNAL_URL || 
                 process.env.NODE_ENV === 'production' ||
                 process.cwd().includes('/opt/render') ||
                 !!process.env.PORT;
const defaultApiUrl = isRender ? 'https://backend-api-lbs.onrender.com' : 'http://localhost:8000';

console.log('🔍 Detección de entorno:');
console.log('  isRender:', isRender);
console.log('  RENDER:', process.env.RENDER);
console.log('  RENDER_EXTERNAL_URL:', process.env.RENDER_EXTERNAL_URL);
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  PORT:', process.env.PORT);
console.log('  defaultApiUrl:', defaultApiUrl);

const envVars = {
  USE_MOCK_DATA: process.env.USE_MOCK_DATA || 'false',
  API_URL: process.env.API_URL || defaultApiUrl,
  MOCK_DATA_PATH: process.env.MOCK_DATA_PATH || 'assets/mockData',
  NODE_ENV: process.env.NODE_ENV || 'production'
};

if (!process.env.API_URL) {
  if (isRender) {
    console.warn('⚠️ API_URL no está definida, usando valor por defecto para Render:', defaultApiUrl);
  } else {
    console.warn('⚠️ API_URL no está definida, usando localhost (desarrollo)');
  }
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
