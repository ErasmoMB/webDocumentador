/**
 * Constantes compartidas para Sección 1: Ubicación del Proyecto
 * Usadas en form y view para evitar duplicación
 */

export const SECCION1_WATCHED_FIELDS: string[] = [
  'parrafoSeccion1_principal',
  'parrafoSeccion1_4',
  'objetivosSeccion1',
  'projectName',
  'distritoSeleccionado',
  'provinciaSeleccionada',
  'departamentoSeleccionado',
  'geoInfo',
  'centrosPobladosJSON',
  'jsonFileName',
  'jsonCompleto',
  'comunidadesCampesinas'
];

export const SECCION1_SECTION_ID = '3.1.1';
export const SECCION1_DEFAULT_SUBSECTION = '3.1.1';

export const OBJETIVO_DEFAULT_1 = 'Describir los aspectos demográficos, sociales, económicos, culturales y políticos que caracterizan a las poblaciones de las áreas de influencia social del proyecto de exploración minera {projectName}.';

export const OBJETIVO_DEFAULT_2 = 'Brindar información básica de los poblados comprendidos en el área de influencia social donde se realizará el Proyecto que sirvan de base para poder determinar los posibles impactos sociales a originarse en esta primera etapa de exploración y, por ende, prevenir, reducir o mitigar las consecuencias negativas y potenciar las positivas.';

export const SECCION1_TEMPLATES = {
  TITULO_FORM: '3.1. DESCRIPCIÓN Y CARACTERIZACIÓN - EDICIÓN',
  TITULO_VIEW: '3.1. DESCRIPCIÓN Y CARACTERIZACIÓN DE LOS ASPECTOS SOCIALES, CULTURALES Y ANTROPOLÓGICOS',
  SUBTITULO: 'Información geográfica, objetivos y fotografías',
  SECCION_OBJETIVOS: '3.1.1 Objetivos de la línea base social'
} as const;
