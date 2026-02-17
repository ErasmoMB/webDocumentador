/**
 * Constantes compartidas para Sección 8 (Actividades Económicas)
 * ✅ ARQUITECTURA IDEAL: Todo centralizado en TEMPLATES
 */

import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { TableColumn } from 'src/app/shared/components/dynamic-table/dynamic-table.component';

export const SECCION8_WATCHED_FIELDS: string[] = [
  'grupoAISD',
  'provinciaSeleccionada',
  'textoActividadesEconomicas',
  'textoFuentesActividadesEconomicas',
  'textoAnalisisCuadro310',
  'cuadroTituloPEA',
  'cuadroFuentePEA',
  'parrafoSeccion8_ganaderia_completo',
  'cuadroTituloPoblacionPecuaria',
  'cuadroFuentePoblacionPecuaria',
  'parrafoSeccion8_agricultura_completo',
  'cuadroTituloCaracteristicasAgricultura',
  'cuadroFuenteCaracteristicasAgricultura',
  'textoMercadoComercializacion1',
  'textoMercadoComercializacion2',
  'textoHabitosConsumo1',
  'textoHabitosConsumo2',
  'peaOcupacionesTabla',
  'poblacionPecuariaTabla',
  'caracteristicasAgriculturaTabla',
  // Fotografías
  ...Array.from({ length: 10 }, (_, i) => `fotografiaGanaderia${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaGanaderia${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaGanaderia${i + 1}Imagen`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaAgricultura${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaAgricultura${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaAgricultura${i + 1}Imagen`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaComercio${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaComercio${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaComercio${i + 1}Imagen`),
];

export const SECCION8_PHOTO_PREFIXES = {
  GANADERIA: 'fotografiaGanaderia',
  AGRICULTURA: 'fotografiaAgricultura',
  COMERCIO: 'fotografiaComercio'
} as const;

export const SECCION8_SECTION_ID = '3.1.4.A.1.4';
export const SECCION8_DEFAULT_SUBSECTION = '3.1.4.A.1.4';

/**
 * ✅ TEMPLATES - TODOS LOS TEXTOS CENTRALIZADOS
 */
export const SECCION8_TEMPLATES = {
  // Títulos principales
  TITULO_FORM: 'A.1.4. Actividades económicas de la población',
  TITULO_VIEW: 'A.1.4. Actividades económicas de la población',

  // Secciones/subtítulos
  seccionActividadesEconomicas: 'Actividades económicas de la población',
  seccionEditarParrafos: 'Editar Párrafos',
  seccionAnalisis: 'Análisis',
  subseccionGanaderia: 'a. Ganadería',
  subseccionAgricultura: 'b. Agricultura',
  subseccionMercadoComercializacion: 'c. Mercado y comercialización de productos',
  subseccionHabitosConsumo: 'd. Hábitos de consumo',

  // Labels para campos de texto
  labelActividadesEconomicas: 'Actividades Económicas - Texto Completo',
  labelFuentesActividadesEconomicas: 'Fuentes Oficiales de Actividades Económicas',
  labelAnalisisCuadro310: 'Análisis Cuadro 3.10 - Texto Completo',
  labelGanaderiaCompleto: 'Ganadería - Texto Completo',
  labelAgriculturaCompleto: 'Agricultura - Texto Completo',
  labelMercadoComercializacion1: 'Mercado y Comercialización - Párrafo 1',
  labelMercadoComercializacion2: 'Mercado y Comercialización - Párrafo 2',
  labelHabitosConsumo1: 'Hábitos de Consumo - Párrafo 1',
  labelHabitosConsumo2: 'Hábitos de Consumo - Párrafo 2',

  // Labels para tablas
  labelTituloPEA: 'Título de la Tabla',
  labelTablaPEA: 'Tabla PEA Ocupada según ocupaciones principales',
  labelFuentePEA: 'Fuente de la Tabla',
  labelTituloPoblacionPecuaria: 'Título de la Tabla',
  labelTablaPoblacionPecuaria: 'Tabla Población Pecuaria',
  labelFuentePoblacionPecuaria: 'Fuente de la Tabla',
  labelTituloCaracteristicasAgricultura: 'Título de la Tabla',
  labelTablaCaracteristicasAgricultura: 'Tabla Características de la Agricultura',
  labelFuenteCaracteristicasAgricultura: 'Fuente de la Tabla',

  // Labels para fotografías
  labelFotografiasGanaderia: 'Fotografías de Ganadería',
  labelFotografiasAgricultura: 'Fotografías de Agricultura',
  labelFotografiasComercio: 'Fotografías de Comercio',

  // Placeholders para inputs
  placeholderTituloPEA: 'Ej: PEA Ocupada según ocupaciones principales',
  placeholderFuentePEA: 'Ej: Plataforma Nacional de Datos Georreferenciados – Geo Perú',
  placeholderTituloPoblacionPecuaria: 'Ej: Población Pecuaria',
  placeholderFuentePoblacionPecuaria: 'Ej: GEADES, 2024',
  placeholderTituloCaracteristicasAgricultura: 'Ej: Características de la Agricultura',
  placeholderFuenteCaracteristicasAgricultura: 'Ej: GEADES, 2024',

  // Hints/ayudas
  hintTextoCompleto: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintIntroduccionFuentes: 'Párrafo introductorio sobre fuentes oficiales. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintParrafoGanaderia: 'Edite todo el bloque de texto sobre ganadería. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintParrafoAgricultura: 'Edite todo el bloque de texto sobre agricultura. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',

  // Valores por defecto de fotografías
  tituloFotoDefault: 'Ganadería',
  fuenteFotoDefault: 'GEADES, 2024',

  // Etiquetas de vista (para imagen-upload)
  labelFotoTitulo: 'Título',
  labelFotoFuente: 'Fuente',
  labelFotoImagen: 'Imagen',
} as const;

/**
 * ✅ CONFIGURACIÓN DE TABLAS - SECCIÓN 8
 */

/**
 * ✅ Configuración para tabla PEA Ocupaciones - PATRÓN SOLO LECTURA
 * Los datos vienen del backend automáticamente
 */
export const SECCION8_TABLA_PEA_OCUPACIONES_CONFIG: TableConfig = {
  tablaKey: 'peaOcupacionesTabla',
  totalKey: '',                        // ✅ Sin total automático - datos vienen del backend
  campoTotal: '',                      // ✅ Sin cálculo de total
  campoPorcentaje: '',                 // ✅ Sin cálculo de porcentaje
  calcularPorcentajes: false,          // ✅ Los porcentajes vienen del backend
  camposParaCalcular: [],              // ✅ No calcular nada - datos puros del backend
  noInicializarDesdeEstructura: true,  // ✅ No inicializar vacía
  permiteAgregarFilas: true,           // ✅ Permitir agregar
  permiteEliminarFilas: true           // ✅ Permitir eliminar
};

/**
 * Columnas para tabla PEA Ocupaciones
 */
export const SECCION8_COLUMNAS_PEA_OCUPACIONES: TableColumn[] = [
  {
    field: 'categoria',
    label: 'Categoría',
    type: 'text' as const,
    placeholder: 'Trabajador independiente'
  },
  {
    field: 'casos',
    label: 'Casos',
    type: 'number' as const,
    dataType: 'number' as const
  },
  {
    field: 'porcentaje',
    label: 'Porcentaje',
    type: 'text' as const,
    readonly: true
  }
];

/**
 * Configuración para tabla de población pecuaria
 */
export const SECCION8_TABLA_POBLACION_PECUARIA_CONFIG: TableConfig = {
  tablaKey: 'poblacionPecuariaTabla',
  totalKey: '',
  estructuraInicial: []
};

/**
 * Columnas para tabla de población pecuaria
 */
export const SECCION8_COLUMNAS_POBLACION_PECUARIA: TableColumn[] = [
  {
    field: 'especie',
    label: 'Especie',
    type: 'text' as const,
    placeholder: 'Vacuno, Ovino, etc.'
  },
  {
    field: 'cantidadPromedio',
    label: 'Cantidad promedio por familia',
    type: 'text' as const,
    placeholder: '5-10'
  },
  {
    field: 'ventaUnidad',
    label: 'Venta por unidad',
    type: 'text' as const,
    placeholder: 'S/ 1500'
  }
];

/**
 * Configuración para tabla de características de agricultura
 */
export const SECCION8_TABLA_CARACTERISTICAS_AGRICULTURA_CONFIG: TableConfig = {
  tablaKey: 'caracteristicasAgriculturaTabla',
  totalKey: '',
  estructuraInicial: []
};

/**
 * Columnas para tabla de características de agricultura
 */
export const SECCION8_COLUMNAS_CARACTERISTICAS_AGRICULTURA: TableColumn[] = [
  {
    field: 'categoria',
    label: 'Categoría',
    type: 'text' as const,
    placeholder: 'Cultivos principales'
  },
  {
    field: 'detalle',
    label: 'Detalle',
    type: 'text' as const,
    placeholder: 'Papa, maíz, trigo'
  }
];
