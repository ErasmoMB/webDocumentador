const path = require('path');
const { chromium } = require('playwright');

const path = require('path');
const { chromium } = require('playwright');

const BASE_URL = process.env.APP_URL || 'http://localhost:4200';
const DOWNLOAD_NAME = 'exportado-e2e.docx';

const CAHUACHO_JSON = `{
"CAHUACHO":[
 {"ITEM":1,"UBIGEO":40306,"CODIGO":403060001,"CCPP":"Cahuacho","CATEGORIA":"Capital distrital","POBLACION":160,"DPTO":"Arequipa","PROV":"Caraveli","DIST":"Cahuacho","ESTE":663078,"NORTE":8285498,"ALTITUD":3423},
 {"ITEM":2,"UBIGEO":40306,"CODIGO":403060002,"CCPP":"Sondor","CATEGORIA":"Anexo","POBLACION":108,"DPTO":"Arequipa","PROV":"Caraveli","DIST":"Cahuacho","ESTE":648739,"NORTE":8285929,"ALTITUD":3418},
 {"ITEM":3,"UBIGEO":40306,"CODIGO":403060003,"CCPP":"Paucaray","CATEGORIA":"Caserio","POBLACION":52,"DPTO":"Arequipa","PROV":"Caraveli","DIST":"Cahuacho","ESTE":651983,"NORTE":8285405,"ALTITUD":3369},
 {"ITEM":4,"UBIGEO":40306,"CODIGO":403060004,"CCPP":"Yuracranra","CATEGORIA":"Unidad agropecuaria","POBLACION":0,"DPTO":"Arequipa","PROV":"Caraveli","DIST":"Cahuacho","ESTE":661378,"NORTE":8291106,"ALTITUD":3626},
 {"ITEM":5,"UBIGEO":40306,"CODIGO":403060005,"CCPP":"Ayroca","CATEGORIA":"Caserio","POBLACION":224,"DPTO":"Arequipa","PROV":"Caraveli","DIST":"Cahuacho","ESTE":660619,"NORTE":8291173,"ALTITUD":3599},
 {"ITEM":6,"UBIGEO":40306,"CODIGO":403060006,"CCPP":"Nauquipa","CATEGORIA":"Anexo","POBLACION":30,"DPTO":"Arequipa","PROV":"Caraveli","DIST":"Cahuacho","ESTE":679509,"NORTE":8293979,"ALTITUD":3081},
 {"ITEM":7,"UBIGEO":40306,"CODIGO":403060007,"CCPP":"Kañayjaza","CATEGORIA":"Unidad agropecuaria","POBLACION":0,"DPTO":"Arequipa","PROV":"Caraveli","DIST":"Cahuacho","ESTE":665359,"NORTE":8284738,"ALTITUD":3469},
 {"ITEM":8,"UBIGEO":40306,"CODIGO":403060008,"CCPP":"Tastanic","CATEGORIA":"Otros","POBLACION":0,"DPTO":"Arequipa","PROV":"Caraveli","DIST":"Cahuacho","ESTE":661666,"NORTE":8290717,"ALTITUD":3627},
 {"ITEM":9,"UBIGEO":40306,"CODIGO":403060009,"CCPP":"Carpisa","CATEGORIA":"Otros","POBLACION":14,"DPTO":"Arequipa","PROV":"Caraveli","DIST":"Cahuacho","ESTE":681140,"NORTE":8294833,"ALTITUD":2194},
 {"ITEM":10,"UBIGEO":40306,"CODIGO":403060010,"CCPP":"Nuevo Nauquipa Taiwan","CATEGORIA":"Otros","POBLACION":1,"DPTO":"Arequipa","PROV":"Caraveli","DIST":"Cahuacho","ESTE":677727,"NORTE":8292843,"ALTITUD":3556},
 {"ITEM":11,"UBIGEO":40306,"CODIGO":403060012,"CCPP":"El Cruce","CATEGORIA":"Otros","POBLACION":19,"DPTO":"Arequipa","PROV":"Caraveli","DIST":"Cahuacho","ESTE":649448,"NORTE":8283488,"ALTITUD":3340},
 {"ITEM":12,"UBIGEO":40306,"CODIGO":403060013,"CCPP":"Chaparrahuada","CATEGORIA":"Otros","POBLACION":0,"DPTO":"Arequipa","PROV":"Caraveli","DIST":"Cahuacho","ESTE":653587,"NORTE":8274212,"ALTITUD":3117},
 {"ITEM":13,"UBIGEO":40306,"CODIGO":403060014,"CCPP":"Faldahuasi","CATEGORIA":"Otros","POBLACION":1,"DPTO":"Arequipa","PROV":"Caraveli","DIST":"Cahuacho","ESTE":658774,"NORTE":8294722,"ALTITUD":3583},
 {"ITEM":14,"UBIGEO":40306,"CODIGO":403060019,"CCPP":"Ocoruro","CATEGORIA":"Otros","POBLACION":0,"DPTO":"Arequipa","PROV":"Caraveli","DIST":"Cahuacho","ESTE":664443,"NORTE":8284608,"ALTITUD":3405},
 {"ITEM":15,"UBIGEO":40306,"CODIGO":403060022,"CCPP":"Asiaco","CATEGORIA":"Otros","POBLACION":1,"DPTO":"Arequipa","PROV":"Caraveli","DIST":"Cahuacho","ESTE":651388,"NORTE":8294757,"ALTITUD":3665}
]}`;

async function clickIfExists(page, text) {
  const btn = page.locator(`button:has-text("${text}")`);
  if (await btn.count()) {
    await btn.first().click({ force: true });
    await page.waitForTimeout(150);
    return true;
  }
  return false;
}

async function fillIfExists(page, selector, value) {
  const loc = page.locator(selector).first();
  if (await loc.count()) {
    await loc.fill(value);
    return true;
  }
  return false;
}

async function fillTextareas(page, values) {
  const areas = page.locator('textarea');
  const count = await areas.count();
  for (let i = 0; i < count; i += 1) {
    const v = values[i] || values[values.length - 1];
    await areas.nth(i).fill(v);
  }
}

async function fillInputsText(page, values) {
  const inputs = page.locator('input[type="text"]:not([type="file"])');
  const count = await inputs.count();
  for (let i = 0; i < count; i += 1) {
    const v = values[i] || values[values.length - 1];
    await inputs.nth(i).fill(v);
  }
}

async function fillInputsNumber(page, values) {
  const inputs = page.locator('input[type="number"]');
  const count = await inputs.count();
  for (let i = 0; i < count; i += 1) {
    const v = values[i] || values[values.length - 1];
    await inputs.nth(i).fill(String(v));
  }
}

async function fillPage1Documento(page) {
  const fileInput = page.locator('input[type="file"]');
  if (await fileInput.count()) {
    await fileInput.setInputFiles({ name: 'cahuacho.json', mimeType: 'application/json', buffer: Buffer.from(CAHUACHO_JSON, 'utf-8') });
  }
  await page.waitForTimeout(400);

  const selDep = page.locator('select').nth(0);
  const selProv = page.locator('select').nth(1);
  const selDist = page.locator('select').nth(2);
  await selDep.selectOption({ label: 'Arequipa' }).catch(() => {});
  await page.waitForTimeout(200);
  await selProv.selectOption({ label: 'Caraveli' }).catch(() => {});
  await page.waitForTimeout(200);
  await selDist.selectOption({ label: 'Cahuacho' }).catch(() => {});

  const projInputs = page.locator('input.inputstyle[type="text"]');
  if ((await projInputs.count()) >= 1) {
    await projInputs.nth(0).fill('Exploración Cahuacho');
  }
  if ((await projInputs.count()) >= 2) {
    await projInputs.nth(1).fill('zona altoandina con accesos por trocha y servicios limitados');
  }
}

async function fillPagina2(page) {
  await fillTextareas(page, [
    'los centros poblados Cahuacho, Sondor y Ayroca donde se ubican accesos y campamentos',
    'el resto del distrito de Cahuacho por rutas de abastecimiento y empleo temporal',
    'Los criterios incluyen tránsito, empleo local, uso de agua y cercanía a frentes de trabajo'
  ]);
  await fillInputsText(page, [
    'Grupo AISD: familias cercanas a frentes de exploración',
    'Grupo AISI: proveedores y capital distrital',
    'Trabajo de campo: julio 2024'
  ]);
}

async function fillPagina3(page) {
  const selector = page.locator('select.selectstyle');
  if (await selector.count()) {
    const options = selector.locator('option');
    if ((await options.count()) > 1) {
      await selector.selectOption({ index: 1 }).catch(() => {});
      await clickIfExists(page, 'Agregar');
    }
    await clickIfExists(page, 'Seleccionar Todos');
  }

  const areas = page.locator('textarea.inputstyle');
  if ((await areas.count()) >= 2) {
    await areas.nth(0).fill('el distrito de Cahuacho, provincia de Caravelí, departamento de Arequipa');
    await areas.nth(1).fill('se consideran accesos, abastecimiento, empleo indirecto y uso de servicios por comunidades vecinas del distrito');
  }
}

async function fillPagina5(page) {
  const detailedInputs = page.locator('input.inputstyle[type="text"]');
  if ((await detailedInputs.count()) >= 1) {
    await detailedInputs.nth(0).fill('Comunidad Campesina Cahuacho, Anexo Sondor y Caserío Ayroca');
  }
  if ((await detailedInputs.count()) >= 2) {
    await detailedInputs.nth(1).fill('La Comunidad Campesina Cahuacho se encuentra ubicada predominantemente dentro del distrito de Cahuacho, provincia de Caraveli; no obstante, sus límites comunales pueden abarcar pequeñas áreas de distritos colindantes.');
  }
  if ((await detailedInputs.count()) >= 3) {
    await detailedInputs.nth(2).fill('Centro Comunal');
  }
  if ((await detailedInputs.count()) >= 4) {
    await detailedInputs.nth(3).fill('Esta delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales y la posible ocurrencia de impactos directos del proyecto.');
  }
  await clickIfExists(page, 'Siguiente');
}

async function fillPagina4(page) {
  await fillIfExists(page, 'input.inputstyle[type="number"]', '12');
  await page.waitForTimeout(300);

  await fillIfExists(page, 'input.inputstyle[type="text"]', '30');
  await page.waitForTimeout(800);

  const textInputs = page.locator('input.inputstyle[type="text"]');
  const cantidad = await textInputs.count();
  
  if (cantidad >= 2) {
    await textInputs.nth(1).fill('Julio 2024');
  }
  if (cantidad >= 4) {
    await textInputs.nth(3).fill('encuestas socioeconómicas complementarias con participación de capital distrital y anexos');
  }
  if (cantidad >= 5) {
    await textInputs.nth(4).fill('la dispersión geográfica, accesibilidad limitada por geografía montañosa y elevados costos operativos en zonas altoandinas');
  }
  if (cantidad >= 6) {
    await textInputs.nth(5).fill('Consultora Andina SAC');
  }

  const entrevistados = [
    { nombre: 'Rosa Huamani Quispe', cargo: 'Teniente Gobernadora', organizacion: 'Comunidad Cahuacho' },
    { nombre: 'Juan Nina Apaza', cargo: 'Presidente Junta de Usuarios', organizacion: 'Comité de Agua' },
    { nombre: 'María Choque Condori', cargo: 'Dirigente de mercado', organizacion: 'Asociación de Comerciantes' },
    { nombre: 'Elmer Mamani Ccama', cargo: 'Agente Municipal', organizacion: 'Anexo Sondor' },
    { nombre: 'Julia Cutipa Laura', cargo: 'Promotora de salud', organizacion: 'Puesto de Salud' },
    { nombre: 'Luis Coaquira Huayta', cargo: 'Docente multigrado', organizacion: 'IE N° 40215' },
    { nombre: 'Verónica Pacco Flores', cargo: 'Presidenta vaso de leche', organizacion: 'Comité Social' },
    { nombre: 'Edgar Huaracha Puma', cargo: 'Ganadero', organizacion: 'Asociación de Criadores' },
    { nombre: 'Inés Ccori Yupanqui', cargo: 'Alcaldesa distrital (e)', organizacion: 'Municipalidad de Cahuacho' },
    { nombre: 'Ricardo Soto Huamani', cargo: 'Transportista', organizacion: 'Ruta Cahuacho-Chala' },
    { nombre: 'Celia Arce Mamani', cargo: 'Pastora', organizacion: 'Comunidad Ayroca' },
    { nombre: 'Walter Puma Tito', cargo: 'Inspector ambiental', organizacion: 'Municipalidad Distrital' }
  ];

  const nombres = page.locator('input[placeholder="Nombres y apellidos"]');
  const cargos = page.locator('input[placeholder="Cargo y Ocupación"]');
  const orgs = page.locator('input[placeholder="Organización"]');
  const rows = Math.min(await nombres.count(), entrevistados.length);
  for (let i = 0; i < rows; i += 1) {
    await nombres.nth(i).fill(entrevistados[i].nombre);
    await cargos.nth(i).fill(entrevistados[i].cargo);
    await orgs.nth(i).fill(entrevistados[i].organizacion);
  }

  const guardarBtns = page.locator('button:has-text("Guardar")');
  if (await guardarBtns.count() >= 1) {
    await guardarBtns.first().click({ force: true });
    await page.waitForTimeout(500);
  }

  await page.waitForTimeout(300);
  await fillIfExists(page, 'input[placeholder="Muestra"]', '30');
  await fillIfExists(page, 'input[placeholder="Universo"]', '60');
  await fillIfExists(page, 'input[placeholder="Margen de error"]', '5');
  await fillIfExists(page, 'input[placeholder="Nombre del universo"]', 'Hogares del AISD');
  await fillIfExists(page, 'input[placeholder="Variable"]', 'Hogares encuestados');
  await fillIfExists(page, 'input[placeholder="Nivel de confianza"]', '95');

  await clickIfExists(page, 'Actualizar');
  await page.waitForTimeout(600);

  const detailPrecisionInputs = page.locator('input.inputstyle2[style*="margin-bottom"]');
  const detailCount = await detailPrecisionInputs.count();
  if (detailCount >= 1) {
    await detailPrecisionInputs.nth(0).fill('La muestra incluyó 30 hogares en capital distrital y anexos con representación de género y grupos etarios.');
  }
  if (detailCount >= 2) {
    await detailPrecisionInputs.nth(1).fill('Cobertura representativa del AISD; margen de error 5% a nivel de confianza 95%. Selección aleatoria de hogares.');
  }

  if (await guardarBtns.count() > 1) {
    await guardarBtns.nth(1).click({ force: true });
    await page.waitForTimeout(500);
  }
}

async function fillPagina6(page) {
  const categorias = [
    { actividad: 'Agricultura de secano', casos: '35', comentario: 'Papa y cebada para autoconsumo' },
    { actividad: 'Ganadería ovina', casos: '22', comentario: 'Venta de lana y carne' },
    { actividad: 'Comercio local', casos: '8', comentario: 'Bodegas y ferias semanales' }
  ];
  for (const row of categorias) {
    await fillIfExists(page, 'input[placeholder="Categoría"], input[placeholder="Actividad"]', row.actividad);
    await fillIfExists(page, 'input[placeholder="Casos"]', row.casos);
    await fillIfExists(page, 'input[placeholder="Comentario"]', row.comentario);
    await clickIfExists(page, 'Agregar');
  }
  await clickIfExists(page, 'Actualizar Lista');
}

async function fillPagina7y8(page) {
  await fillTextareas(page, [
    'Actores locales: juntas vecinales, tenientes gobernadores, comités de regantes.',
    'Percepción: demanda de empleo y mejora de vías; preocupación por agua para riego.'
  ]);
  await clickIfExists(page, 'Guardar');
}

async function fillPagina9(page) {
  const actividades = [
    { actividad: 'Agricultura', casos: '30', porcentaje: '48.0' },
    { actividad: 'Ganadería', casos: '20', porcentaje: '32.0' },
    { actividad: 'Comercio/servicios', casos: '12', porcentaje: '20.0' }
  ];
  for (const row of actividades) {
    await fillIfExists(page, 'input[placeholder="Actividad"]', row.actividad);
    await fillIfExists(page, 'input[placeholder="Casos"]', row.casos);
    await clickIfExists(page, 'Agregar');
  }
  await fillIfExists(page, 'input[placeholder="No Aplica"]', '0');
  await clickIfExists(page, 'Actualizar Lista');
}

async function fillPagina10(page) {
  await fillInputsNumber(page, [320, 1180, 50, 180, 12, 90, 45, 22, 38, 25, 100, 75, 60, 40, 30]);
  await fillTextareas(page, [
    'Según el Censo del 2017, en el distrito de Cahuacho se registraron viviendas con diferentes condiciones de ocupación y materiales de construcción predominantes.',
    'Paredes predominan tapia y piedra con barro, seguidas de adobe.',
    'Techos mezclan calamina y teja en la capital distrital, ichu en anexos altos.',
    'Pisos mayormente de tierra; algunos de cemento en la capital y caseríos cercanos.'
  ]);
}

async function fillPagina11a16(page) {
  const url = page.url();
  
  // Pagina 11: Servicios básicos (agua, desagüe, electricidad, residuos)
  if (url.includes('/pagina11')) {
    await fillTextareas(page, [
      'En el distrito de Cahuacho, según el Censo Nacional 2017, se identificaron las siguientes condiciones de acceso a servicios básicos.',
      'Respecto al abastecimiento de agua, la mayoría de viviendas en Cahuacho se abastecen de fuentes naturales como ríos o manantiales. Solo el 25% tiene conexión a red pública.',
      'En cuanto al servicio higiénico, predomina el uso de letrinas o pozos ciegos (60%), seguido de conexión a red pública en la capital distrital (30%).',
      'El acceso a electricidad es limitado, con 40% de viviendas conectadas a red pública y 35% sin servicio. Algunos hogares utilizan paneles solares.',
      'La eliminación de residuos sólidos se realiza principalmente mediante quema (45%) o entierro (30%). Solo en la capital existe servicio de recolección municipal.'
    ]);
    await fillInputsNumber(page, [150, 90, 60, 45, 30, 20, 100, 50, 40, 30, 15, 80, 50, 35, 20, 10, 70, 40, 30, 15]);
  }
  
  // Pagina 12: Transporte y telecomunicaciones
  else if (url.includes('/pagina12')) {
    await fillTextareas(page, [
      'El acceso al distrito de Cahuacho se realiza principalmente por vía terrestre a través de carreteras afirmadas desde Chala (120 km, 4 horas) y trochas carrozables hacia anexos.',
      'En cuanto a telecomunicaciones, el acceso a telefonía móvil es parcial (cobertura Movistar/Claro solo en capital distrital). Internet muy limitado; se utiliza en oficinas municipales.'
    ]);
  }
  
  // Pagina 13: Infraestructura social
  else if (url.includes('/pagina13')) {
    await fillTextareas(page, [
      'El distrito de Cahuacho cuenta con infraestructura básica en salud, educación y recreación, aunque presenta limitaciones en cobertura y mantenimiento.',
      'Se cuenta con un puesto de salud en la capital distrital que brinda atención básica. Casos complejos se derivan a Chala o Arequipa.',
      'Existen instituciones educativas de nivel inicial (2), primaria (3 multigrado) y secundaria (1 en capital). Infraestructura requiere mejoras.',
      'La infraestructura recreativa incluye losas deportivas en capital y dos anexos, además de plaza principal para eventos cívicos y culturales.'
    ]);
  }
  
  // Pagina 14: Salud, Educación, Cultura
  else if (url.includes('/pagina14')) {
    await fillTextareas(page, [
      'En el distrito de Cahuacho, los principales indicadores de salud muestran tasas de desnutrición infantil de 28% y anemia en menores de 5 años de 45%, acordes al contexto rural altoandino.',
      'El nivel educativo de la población presenta tasas de alfabetización de 75% en adultos, con mayor porcentaje en jóvenes (90%) y menor en adultos mayores (55%).',
      'La población predominantemente habla quechua (85%) con dominio del castellano en población menor de 40 años. La religión católica es mayoritaria (90%), con presencia evangélica (10%).'
    ]);
  }
  
  // Pagina 15: IDH, NBI, Uso de suelos
  else if (url.includes('/pagina15')) {
    await fillTextareas(page, [
      'El Índice de Desarrollo Humano del distrito de Cahuacho es de 0.3124 (PNUD 2019), ubicándolo en el puesto 1542 a nivel nacional, reflejando condiciones de desarrollo medio-bajo.',
      'Las Necesidades Básicas Insatisfechas muestran carencias en: vivienda inadecuada (35%), servicios higiénicos (40%), hacinamiento (28%) y baja asistencia escolar (15%).',
      'El uso de suelos en la zona está destinado principalmente a pastoreo extensivo de ovinos y camélidos (60%), agricultura de secano (25%), y áreas de conservación y protección de fuentes de agua (15%).'
    ]);
  }
  
  // Pagina 16: Organización, Festividades
  else if (url.includes('/pagina16')) {
    await fillTextareas(page, [
      'La organización social en Cahuacho se estructura a través de la comunidad campesina, juntas vecinales, comités de regantes, club de madres y rondas campesinas.',
      'Las principales festividades están vinculadas al calendario agrícola y religioso: San Juan (24 junio), Aniversario Distrital (15 agosto), Virgen de la Asunción, Día de Todos los Santos y Carnavales.'
    ]);
  }
  
  // Genérico para otras páginas
  else {
    await fillTextareas(page, [
      'Descripción general para esta sección del documento.',
      'Información complementaria relevante al apartado.'
    ]);
  }
}

async function fillGeneric(page) {
  await page.waitForTimeout(150);
  await fillInputsNumber(page, [50, 80, 120, 15]);
  await fillInputsText(page, [
    'Dato consistente de prueba',
    'Detalle breve verosímil',
    'Observación complementaria'
  ]);
  await fillTextareas(page, [
    'Texto descriptivo breve y realista para este apartado.',
    'Segundo párrafo con hallazgos resumidos.'
  ]);
}

async function fillCurrentPage(page, step) {
  const url = page.url();
  if (url.includes('/documento')) {
    await fillPage1Documento(page);
  } else if (url.includes('/pagina2')) {
    await fillPagina2(page);
  } else if (url.includes('/pagina3')) {
    await fillPagina3(page);
  } else if (url.includes('/pagina4')) {
    await fillPagina4(page);
  } else if (url.includes('/pagina5')) {
    await fillPagina5(page);
  } else if (url.includes('/pagina6')) {
    await fillPagina6(page);
  } else if (url.includes('/pagina7') || url.includes('/pagina8')) {
    await fillPagina7y8(page);
  } else if (url.includes('/pagina9')) {
    await fillPagina9(page);
  } else if (url.includes('/pagina10')) {
    await fillPagina10(page);
  } else if (url.includes('/pagina11') || url.includes('/pagina12') || url.includes('/pagina13') || url.includes('/pagina14') || url.includes('/pagina15') || url.includes('/pagina16')) {
    await fillPagina11a16(page);
  } else {
    await fillGeneric(page);
  }

  const nextBtn = page.locator('button:has-text("Siguiente")');
  if ((await nextBtn.count()) === 0) {
    console.log(`[step ${step}] No se encontró botón "Siguiente". Ruta actual: ${page.url()}`);
    return false;
  }

  const prevUrl = page.url();
  await Promise.all([
    page.waitForTimeout(200),
    nextBtn.first().click({ force: true })
  ]);
  await page.waitForTimeout(600);
  const newUrl = page.url();
  console.log(`[step ${step}] Navegó: ${prevUrl} -> ${newUrl}`);
  return true;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  console.log(`Abriendo ${BASE_URL} ...`);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  let step = 1;
  while (!page.url().includes('/resumen')) {
    const advanced = await fillCurrentPage(page, step);
    step += 1;
    if (!advanced) break;
    if (step > 20) break;
  }

  if (!page.url().includes('/resumen')) {
    console.error('No se llegó a /resumen; abortando descarga.');
    await browser.close();
    process.exit(1);
  }

  const downloadPath = path.join(process.cwd(), DOWNLOAD_NAME);
  console.log(`En resumen, iniciando descarga en ${downloadPath}`);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Exportar a Word/i }).click({ force: true }),
  ]);
  await download.saveAs(downloadPath);
  console.log(`Descarga completada: ${downloadPath}`);

  await browser.close();
})();
