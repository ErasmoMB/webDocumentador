/**
 * Constantes para Sección 22 - Características Demográficas (AISI)
 * 
 * CAMPOS OBSERVADOS (con aislamiento por prefijo):
 * - Párrafos: textoDemografiaAISI, textoGrupoEtarioAISI
 * - Tablas: poblacionSexoAISI, poblacionEtarioAISI
 * - Títulos/Fuentes: cuadroTituloPoblacionSexo, cuadroFuentePoblacionSexo, etc.
 * - Foto: fotografiaSeccion22
 */

export const SECCION22_SECTION_ID = '3.1.4.B.1.1';

export const SECCION22_WATCHED_FIELDS = [
  // Párrafos (pueden tener prefijo)
  'textoDemografiaAISI',
  'textoGrupoEtarioAISI',
  
  // Tablas (pueden tener prefijo)
  'poblacionSexoAISI',
  'poblacionEtarioAISI',
  
  // Títulos y fuentes (pueden tener prefijo)
  'cuadroTituloPoblacionSexo',
  'cuadroFuentePoblacionSexo',
  'cuadroTituloPoblacionEtario',
  'cuadroFuentePoblacionEtario',
  
  // Datos base (sin prefijo, compartidos)
  'centroPobladoAISI',
  
  // Fotografías
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion22${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion22${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion22${i + 1}Imagen`)
];

export const SECCION22_PHOTO_PREFIX = 'fotografiaSeccion22';

export const SECCION22_CONFIG = {
  sectionId: SECCION22_SECTION_ID,
  title: 'Aspectos demográficos',
  photoPrefix: SECCION22_PHOTO_PREFIX,
  maxPhotos: 10
};

/**
 * TEMPLATES - Todos los textos centralizados
 * Categorías: Títulos, Labels, Placeholders, Valores por defecto, Mensajes
 */
export const SECCION22_TEMPLATES = {
  // ✅ TÍTULOS PRINCIPALES
  tituloSeccion: 'B.1.1. Aspectos demográficos',
  
  // ✅ LABELS DE FORMULARIO
  labelTextoDemografia: 'Texto Demografía',
  labelTextoGrupoEtario: 'Texto Grupo Etario',
  labelTituloPoblacionSexo: 'Título — Población según sexo',
  labelFuentePoblacionSexo: 'Fuente — Población por Sexo',
  labelTituloPoblacionEtario: 'Título — Población según grupo etario',
  labelFuentePoblacionEtario: 'Fuente — Población por Grupo Etario',
  labelPoblacionSexo: 'Población por Sexo',
  labelPoblacionEtario: 'Población por Grupo Etario',
  labelFotografias: 'Fotografías',
  
  // ✅ PLACEHOLDERS DE ENTRADA
  placeholderTextoDemografia: 'Editar texto de demografía',
  placeholderTextoGrupoEtario: 'Editar texto de grupo etario',
  placeholderTituloPoblacionSexo: 'Ej: Población por sexo – CP Cahuacho (2017)',
  placeholderFuentePoblacionSexo: 'Ej: Censos Nacionales 2017',
  placeholderTituloPoblacionEtario: 'Ej: Población por grupo etario – CP Cahuacho (2017)',
  placeholderFuentePoblacionEtario: 'Ej: Censos Nacionales 2017',
  
  // ✅ VALORES POR DEFECTO (FALLBACK)
  textodeafrafiaDemografiaDefault: 'En cuanto a la demografía, la población se distribuye de forma equilibrada. La composición por sexo refleja una estructura típica de comunidades andinas.',
  textoGrupoEtarioDefault: 'Por grupo etario, se observa una población joven con predominio en los rangos de menores de edad y adultos jóvenes, característica de áreas con baja cobertura de servicios de salud.',
  
  // ✅ TEMPLATES PARA AUTO-GENERACIÓN (con placeholders {{...}})
  textoDemografiaTemplate: 'En cuanto a la demografía del CP {{cp}}, la población total es de {{poblacion}} habitantes. La distribución por sexo refleja una composición equilibrada de la comunidad.',
  textoGrupoEtarioTemplate: 'Por grupo etario, el CP {{cp}} presenta una población joven con predominio de edades entre menores de edad y adultos jóvenes. La población total por grupo etario es {{poblacion}} habitantes.',
  
  // ✅ TÍTULOS Y FUENTES DEFAULT
  tituloPoblacionSexoDefault: 'Población por sexo',
  fuentePoblacionSexoDefault: 'Censos Nacionales 2017',
  tituloPoblacionEtarioDefault: 'Población por grupo etario',
  fuentePoblacionEtarioDefault: 'Censos Nacionales 2017',
  
  // ✅ TEMPLATES PARA TÍTULOS CON PLACEHOLDERS ({{cp}}, {{año}})
  tituloPoblacionSexoTemplate: 'Población por sexo – CP {{cp}} ({{año}})',
  tituloPoblacionEtarioTemplate: 'Población por grupo etario – CP {{cp}} ({{año}})',
  
  // ✅ TEXTOS DE TABLA  
  columnaSexo: 'Sexo',
  columnaCasos: 'Casos',
  columnaPorcentaje: 'Porcentaje',
  columnaCategoria: 'Categoría',
  
  // ✅ SUBTÍTULOS/SECCIONES
  subtituloA: 'a. Población según sexo',
  subtituloB: 'b. Población según grupo etario',
  
  // ✅ ETIQUETAS PARA FOTOS
  labelFotoTitulo: 'Título de la fotografía',
  labelFotoFuente: 'Fuente',
  labelFotoImagen: 'Imagen',
  tituloFotoDefault: 'Seccion 22 - Aspectos demográficos',
  fuenteFotoDefault: 'GEADES, 2024',
  placeholderFotoTitulo: 'Ej: Vista del área de estudio',
  placeholderFotoFuente: 'Ej: GEADES, 2024',
  
  // ✅ MENSAJES
  mensajeNoDatos: 'No hay datos registrados',
  mensajeListaVacia: 'No hay fotografías'
};
