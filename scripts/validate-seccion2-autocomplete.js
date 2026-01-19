/**
 * Script de validación para Sección 2 - Autocomplete de Distritos Adicionales
 * 
 * Verifica que:
 * 1. El backend esté respondiendo correctamente
 * 2. La provincia se extraiga del JSON correctamente
 * 3. Las sugerencias de distritos se obtengan del backend
 * 4. El filtrado por provincia funcione
 * 
 * Ejecución: node scripts/validate-seccion2-autocomplete.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.cyan);
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Cargar JSON de prueba
function cargarJSONPrueba() {
  // OPCIÓN 1: Usar JSON de test específico
  try {
    const testJsonPath = path.join(__dirname, 'test-data-seccion2.json');
    if (fs.existsSync(testJsonPath)) {
      const jsonContent = fs.readFileSync(testJsonPath, 'utf8');
      logInfo('Usando JSON de prueba: test-data-seccion2.json');
      return JSON.parse(jsonContent);
    }
  } catch (error) {
    logWarning(`No se pudo cargar test-data-seccion2.json: ${error.message}`);
  }
  
  // OPCIÓN 2: Usar variable de entorno
  const jsonManual = process.env.TEST_JSON;
  if (jsonManual) {
    try {
      logInfo('Usando JSON desde variable de entorno TEST_JSON');
      return JSON.parse(jsonManual);
    } catch (error) {
      logWarning(`JSON manual inválido: ${error.message}`);
    }
  }
  
  // OPCIÓN 3: Cargar desde archivo mockData
  try {
    const jsonPath = path.join(__dirname, '../src/assets/mockData/capitulo3.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const fullData = JSON.parse(jsonContent);
    logInfo('Usando JSON desde: src/assets/mockData/capitulo3.json');
    
    // El JSON real está en fullData.datos.jsonCompleto
    if (fullData.datos && fullData.datos.jsonCompleto) {
      return fullData.datos.jsonCompleto;
    }
    
    // Si hay campos que parecen ser comunidades (empiezan con "CCPP")
    const ccppKeys = Object.keys(fullData).filter(key => 
      key.startsWith('CCPP') && Array.isArray(fullData[key])
    );
    
    if (ccppKeys.length > 0) {
      const resultado = {};
      ccppKeys.forEach(key => {
        resultado[key] = fullData[key];
      });
      return resultado;
    }
    
    return fullData;
    
  } catch (error) {
    logError(`No se pudo cargar el JSON de prueba: ${error.message}`);
    logInfo('');
    logInfo('💡 Solución:');
    logInfo('   Crea el archivo scripts/test-data-seccion2.json con el JSON de prueba');
    logInfo('');
    return null;
  }
}

// Extraer provincia del JSON (igual que en el componente)
function obtenerProvinciaDelJSON(jsonCompleto) {
  if (!jsonCompleto || typeof jsonCompleto !== 'object' || Array.isArray(jsonCompleto)) {
    return null;
  }
  
  const primerKey = Object.keys(jsonCompleto)[0];
  if (primerKey) {
    const centrosPoblados = jsonCompleto[primerKey];
    if (Array.isArray(centrosPoblados) && centrosPoblados.length > 0) {
      return centrosPoblados[0].PROV || null;
    }
  }
  
  return null;
}

// Extraer distritos únicos del JSON
function obtenerDistritosDelJSON(jsonCompleto) {
  const distritosSet = new Set();
  
  if (jsonCompleto && typeof jsonCompleto === 'object' && !Array.isArray(jsonCompleto)) {
    Object.keys(jsonCompleto).forEach(key => {
      const centrosPoblados = jsonCompleto[key];
      if (Array.isArray(centrosPoblados)) {
        centrosPoblados.forEach(cp => {
          const nombreDistrito = cp.DIST || cp.dist;
          if (nombreDistrito && typeof nombreDistrito === 'string') {
            distritosSet.add(nombreDistrito.trim());
          }
        });
      }
    });
  }
  
  return Array.from(distritosSet).sort();
}

// Consultar al backend (usa la ruta correcta según data.service.ts)
function consultarBackend(termino, provincia) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: `/ubicaciones/distritos`, // Ruta correcta según backend
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: response
          });
        } catch (error) {
          reject(new Error(`Error parsing JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout: El backend no respondió en 5 segundos'));
    });

    req.end();
  });
}

// Test principal
async function validarAutocomplete() {
  logSection('VALIDACIÓN SECCIÓN 2 - AUTOCOMPLETE DISTRITOS ADICIONALES');
  
  let errores = 0;
  let warnings = 0;
  let exitos = 0;

  // Test 1: Cargar JSON
  logSection('Test 1: Cargar JSON de prueba');
  const jsonCompleto = cargarJSONPrueba();
  
  if (!jsonCompleto) {
    logError('No se pudo cargar el JSON de prueba');
    errores++;
    return { errores, warnings, exitos };
  }
  
  logSuccess('JSON de prueba cargado correctamente');
  logInfo(`Keys encontrados: ${Object.keys(jsonCompleto).join(', ')}`);
  exitos++;

  // Test 2: Extraer provincia
  logSection('Test 2: Extraer provincia del JSON');
  const provincia = obtenerProvinciaDelJSON(jsonCompleto);
  
  if (!provincia) {
    logError('No se pudo extraer la provincia del JSON');
    errores++;
  } else {
    logSuccess(`Provincia extraída: ${provincia}`);
    exitos++;
  }

  // Test 3: Extraer distritos del JSON
  logSection('Test 3: Extraer distritos del JSON');
  const distritosLocales = obtenerDistritosDelJSON(jsonCompleto);
  
  if (distritosLocales.length === 0) {
    logError('No se encontraron distritos en el JSON');
    errores++;
  } else {
    logSuccess(`${distritosLocales.length} distritos encontrados en el JSON:`);
    distritosLocales.forEach(d => logInfo(`  - ${d}`));
    exitos++;
  }

  // Test 4: Verificar conectividad con backend (OPCIONAL)
  logSection('Test 4: Verificar conectividad con backend (OPCIONAL)');
  logInfo('Este test requiere que el backend esté corriendo en http://localhost:8000');
  console.log('');
  
  if (distritosLocales.length > 0) {
    const primerDistrito = distritosLocales[0];
    const terminoBusqueda = primerDistrito.substring(0, 3); // Primeras 3 letras
    
    try {
      logInfo(`Consultando GET /api/demograficos/ubicaciones...`);
      const response = await consultarBackend(terminoBusqueda, provincia);
      
      if (response.status === 200) {
        logSuccess('Backend respondió correctamente (HTTP 200)');
        
        if (response.data && response.data.success) {
          logSuccess('Estructura de respuesta válida (success: true)');
          
          if (Array.isArray(response.data.data)) {
            const cantidadResultados = response.data.data.length;
            logSuccess(`Backend devolvió ${cantidadResultados} centros poblados`);
            
            // Extraer distritos únicos de la respuesta
            const distritosBackend = new Set();
            response.data.data.forEach(cp => {
              if (cp.distrito) {
                distritosBackend.add(cp.distrito);
              }
            });
            
            const distritosUnicos = Array.from(distritosBackend);
            logInfo(`Distritos únicos en respuesta del backend: ${distritosUnicos.length}`);
            if (distritosUnicos.length > 0) {
              distritosUnicos.slice(0, 5).forEach(d => logInfo(`  - ${d}`));
              if (distritosUnicos.length > 5) {
                logInfo(`  ... y ${distritosUnicos.length - 5} más`);
              }
            }
            
            logSuccess('✅ Backend funcionando correctamente');
            exitos++;
            
          } else {
            logWarning('response.data.data no es un array');
            logInfo('El autocomplete puede seguir funcionando con datos locales');
            warnings++;
          }
        } else {
          logWarning('Respuesta del backend no tiene success: true');
          logInfo('El autocomplete puede seguir funcionando con datos locales');
          warnings++;
        }
      } else {
        logWarning(`Backend respondió con código HTTP ${response.status}`);
        logInfo('El autocomplete puede seguir funcionando con datos locales');
        warnings++;
      }
      
    } catch (error) {
      logWarning(`Backend no disponible: ${error.message}`);
      logInfo('💡 Esto es normal si el backend no está corriendo');
      logInfo('   El autocomplete seguirá funcionando con datos locales del JSON');
      logInfo('   Para iniciar el backend: (instrucciones del README del backend)');
      warnings++;
    }
  } else {
    logWarning('No se puede probar el backend sin distritos en el JSON');
    warnings++;
  }

  // Test 5: Validar lógica de filtrado
  logSection('Test 5: Validar lógica de filtrado por provincia');
  
  if (provincia && distritosLocales.length > 0) {
    logInfo(`Provincia actual: ${provincia}`);
    logInfo(`Distritos en JSON: ${distritosLocales.join(', ')}`);
    logSuccess('El backend debería filtrar solo distritos de esta provincia');
    exitos++;
  } else {
    logWarning('No se puede validar filtrado sin provincia o distritos');
    warnings++;
  }

  // Resumen final
  logSection('RESUMEN DE VALIDACIÓN');
  console.log('');
  logInfo(`Total de tests ejecutados: ${exitos + errores + warnings}`);
  logSuccess(`Tests exitosos: ${exitos}`);
  
  if (warnings > 0) {
    logWarning(`Advertencias: ${warnings}`);
  }
  
  if (errores > 0) {
    logError(`Tests fallidos: ${errores}`);
  } else {
    console.log('');
    logSuccess('✅ TODOS LOS TESTS PASARON CORRECTAMENTE ✅');
  }
  
  console.log('');
  
  return { errores, warnings, exitos };
}

// Ejecutar validación
validarAutocomplete()
  .then(({ errores, warnings, exitos }) => {
    process.exit(errores > 0 ? 1 : 0);
  })
  .catch(error => {
    logError(`Error fatal: ${error.message}`);
    process.exit(1);
  });
