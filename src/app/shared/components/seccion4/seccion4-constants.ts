/**
 * ✅ SECCION4_CONSTANTS
 * Constantes centralizadas para Sección 4 - Caracterización Socioeconómica
 * - Campos observados para persistencia
 * - Configuración de fotos
 * - IDs de sección
 */

export const SECCION4_WATCHED_FIELDS = [
  'tablaAISD1Datos',
  'tablaAISD2Datos',
  'tablaAISD1Datos_A1',
  'tablaAISD2Datos_A1',
  'tablaAISD1Datos_A2',
  'tablaAISD2Datos_A2',
  'parrafoSeccion4_introduccion_aisd',
  'parrafoSeccion4_comunidad_completo',
  'parrafoSeccion4_caracterizacion_indicadores',
  'cuadroTituloAISD1',
  'cuadroTituloAISD2',
  // Fotos con prefijos (10 máximo por tipo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaUbicacionReferencial${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaUbicacionReferencial${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaUbicacionReferencial${i + 1}Imagen`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaPoblacionViviendas${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaPoblacionViviendas${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaPoblacionViviendas${i + 1}Imagen`),
];

export const SECCION4_PHOTO_PREFIXES = {
  UBICACION: 'fotografiaUbicacionReferencial',
  POBLACION: 'fotografiaPoblacionViviendas'
} as const;

export const SECCION4_SECTION_ID = '3.1.4';
export const SECCION4_DEFAULT_SUBSECTION = '3.1.4.A.1';

// Configuración de tablas
export const SECCION4_TABLA_AISD1_CONFIG = {
  tablaKey: 'tablaAISD1Datos',
  totalKey: 'localidad',
  campoTotal: 'localidad',
  estructuraInicial: [{ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' }]
};

export const SECCION4_TABLA_AISD2_CONFIG = {
  tablaKey: 'tablaAISD2Datos',
  totalKey: 'punto',
  campoTotal: 'punto',
  estructuraInicial: [{ punto: '', codigo: '', poblacion: '', viviendasEmpadronadas: '', viviendasOcupadas: '' }]
};

export const SECCION4_COLUMNAS_AISD1 = [
  { field: 'localidad', label: 'Localidad', type: 'text' as const, placeholder: 'Nombre de localidad' },
  { field: 'coordenadas', label: 'Coordenadas', type: 'text' as const, placeholder: 'Lat, Long' },
  { field: 'altitud', label: 'Altitud (m)', type: 'text' as const, placeholder: 'Altitud' },
  { field: 'distrito', label: 'Distrito', type: 'text' as const, placeholder: 'Distrito' },
  { field: 'provincia', label: 'Provincia', type: 'text' as const, placeholder: 'Provincia' },
  { field: 'departamento', label: 'Departamento', type: 'text' as const, placeholder: 'Departamento' }
];

export const SECCION4_COLUMNAS_AISD2 = [
  { field: 'punto', label: 'Punto', type: 'text' as const, placeholder: 'Punto' },
  { field: 'codigo', label: 'Código', type: 'text' as const, placeholder: 'Código' },
  { field: 'poblacion', label: 'Población', type: 'text' as const, placeholder: '0' },
  { field: 'viviendasEmpadronadas', label: 'Viviendas Empadronadas', type: 'text' as const, placeholder: '0' },
  { field: 'viviendasOcupadas', label: 'Viviendas Ocupadas', type: 'text' as const, placeholder: '0' }
];
