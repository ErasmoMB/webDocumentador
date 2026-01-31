/**
 * Registro declarativo de todas las tablas del sistema
 * 
 * Este archivo centraliza la configuración de todas las tablas que se cargan desde backend.
 * Agregar una nueva tabla es tan simple como agregar un objeto aquí.
 * 
 * El sistema automáticamente:
 * - Registra el mapping en BackendDataMapperService
 * - Crea la función de transformación usando TableTransformFactory
 * - Configura la tabla editable en DynamicTableComponent
 * - Maneja prefijos automáticamente
 */

import { TableMetadata } from '../models/table-metadata.model';
import {
  transformServiciosPorCategoria,
  transformAfiliacionSaludTabla,
  transformNivelEducativoTabla,
  transformTasaAnalfabetismoTabla,
  transformLenguasSimple,
  transformReligionesSimple,
  transformNBISimple,
  transformServiciosBasicosAISI,
  transformCentrosPobladosAISI,
  transformLenguasMaternasTabla,
  transformReligionesTabla,
  transformPoblacionSexoDesdeDemograficos,
  transformPoblacionEtarioDesdeDemograficos,
  transformPETDesdeAisdPet,
  transformActividadesEconomicas
} from './table-transforms';

export const TABLES_REGISTRY: Map<string, TableMetadata[]> = new Map();

/**
 * Transformación custom para población por sexo desde múltiples centros poblados
 * Agrega datos de múltiples CCPP y los transforma a formato estándar
 */
function transformPoblacionSexoDesdeCentrosPoblados(data: any[]): any[] {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  let totalHombres = 0;
  let totalMujeres = 0;
  
  for (const centro of data) {
    totalHombres += Number(centro?.hombres || 0);
    totalMujeres += Number(centro?.mujeres || 0);
  }
  
  const total = totalHombres + totalMujeres;
  if (total === 0) {
    return [];
  }
  
  const porcentajeHombres = total > 0 
    ? ((totalHombres / total) * 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ',') + ' %'
    : '0,00 %';
  const porcentajeMujeres = total > 0
    ? ((totalMujeres / total) * 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ',') + ' %'
    : '0,00 %';
  
  return [
    { sexo: 'Hombre', casos: totalHombres, porcentaje: porcentajeHombres },
    { sexo: 'Mujer', casos: totalMujeres, porcentaje: porcentajeMujeres }
  ];
}

/**
 * Transformación custom para población etario desde múltiples centros poblados
 */
function transformPoblacionEtarioDesdeCentrosPoblados(data: any[]): any[] {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  let total_6_14 = 0;
  let total_15_29 = 0;
  let total_30_44 = 0;
  let total_45_64 = 0;
  let total_65_mas = 0;
  
  for (const centro of data) {
    total_6_14 += Number(centro?.de_6_a_14_anios || 0);
    total_15_29 += Number(centro?.de_15_a_29 || 0);
    total_30_44 += Number(centro?.de_30_a_44 || 0);
    total_45_64 += Number(centro?.de_45_a_64 || 0);
    total_65_mas += Number(centro?.mayores_65 || 0);
  }
  
  const total = total_6_14 + total_15_29 + total_30_44 + total_45_64 + total_65_mas;
  if (total === 0) {
    return [];
  }
  
  const resultado: Array<{ categoria: string; casos: number; porcentaje?: string }> = [
    { categoria: '0 a 14 años', casos: total_6_14 },
    { categoria: '15 a 29 años', casos: total_15_29 },
    { categoria: '30 a 44 años', casos: total_30_44 },
    { categoria: '45 a 64 años', casos: total_45_64 },
    { categoria: '65 años a más', casos: total_65_mas }
  ].filter(item => item.casos > 0);
  
  // Calcular porcentajes
  resultado.forEach(item => {
    const porcentaje = total > 0
      ? ((item.casos / total) * 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ',') + ' %'
      : '0,00 %';
    item.porcentaje = porcentaje;
  });
  
  return resultado;
}

/**
 * Transformación custom para actividades económicas
 */
function transformActividades(actividades: any[]): any[] {
  if (!Array.isArray(actividades)) return [];
  return actividades.map(item => ({
    actividad: item.actividad || '',
    casos: item.casos || 0,
    porcentaje: item.porcentaje || null
  }));
}

/**
 * Transformación custom para PEA ocupaciones
 */
function transformPEAOcupaciones(actividades: any[]): any[] {
  if (!Array.isArray(actividades)) return [];
  
  // ✅ FASE 1: NO agregar porcentaje por defecto - se calculará dinámicamente
  // Mapear directamente (la agregación se hace en el backend)
  return actividades.map(item => ({
    ocupacion: item.ocupacion || item.actividad || item.categoria || 'Sin categoría',
    casos: Number(item.casos || 0)
    // porcentaje: item.porcentaje || '0,00 %' // ❌ ELIMINADO - se calculará dinámicamente
  }));
}

/**
 * Inicializa el registry con las tablas migradas
 */
export function initializeTablesRegistry(): void {
  // ============================================
  // FASE 2: PRUEBA DE CONCEPTO
  // ============================================
  
  // Sección 6 AISD - Demografía
  TABLES_REGISTRY.set('seccion6_aisd', [
    {
      sectionKey: 'seccion6_aisd',
      fieldName: 'poblacionSexoAISD',
      tablaKey: 'poblacionSexoAISD',
      endpoint: '/centros-poblados/por-codigos-ubigeo',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformPoblacionSexoDesdeCentrosPoblados,
      tableConfig: {
        totalKey: 'sexo',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true
      },
      editable: true,
      columns: [
        { field: 'sexo', label: 'Sexo', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Población según sexo - Agregada desde múltiples centros poblados'
    },
    {
      sectionKey: 'seccion6_aisd',
      fieldName: 'poblacionEtarioAISD',
      tablaKey: 'poblacionEtarioAISD',
      endpoint: '/centros-poblados/por-codigos-ubigeo',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformPoblacionEtarioDesdeCentrosPoblados,
      tableConfig: {
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true
      },
      editable: true,
      columns: [
        { field: 'categoria', label: 'Categoría', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Población según grupo etario - Agregada desde múltiples centros poblados'
    }
  ]);

  // Sección 4 AISD - Ubicación Geográfica
  TABLES_REGISTRY.set('seccion4_aisd', [
    {
      sectionKey: 'seccion4_aisd',
      fieldName: 'tablaAISD2Datos',
      tablaKey: 'tablaAISD2Datos',
      endpoint: '/aisd/centros-poblados',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: (data: any) => {
        if (!Array.isArray(data)) return [];
        return data.map((item: any) => ({
          punto: item.centro_poblado || '____',
          codigo: item.codigo || '____',
          poblacion: item.poblacion || 0,
          viviendasEmpadronadas: item.viviendas_empadronadas || 0,
          viviendasOcupadas: item.viviendas_ocupadas || 0
        }));
      },
      tableConfig: {
        totalKey: 'punto',
        campoTotal: 'poblacion'
      },
      editable: true,
      columns: [
        { field: 'punto', label: 'Punto', type: 'text' },
        { field: 'codigo', label: 'Código', type: 'text' },
        { field: 'poblacion', label: 'Población', type: 'number' },
        { field: 'viviendasEmpadronadas', label: 'Viv. Empadronadas', type: 'number' },
        { field: 'viviendasOcupadas', label: 'Viv. Ocupadas', type: 'number' }
      ],
      description: 'Centros poblados AISD con población y viviendas'
    }
  ]);

  // Sección 7 AISD - PEA y Empleo
  TABLES_REGISTRY.set('seccion7_aisd', [
    {
      sectionKey: 'seccion7_aisd',
      fieldName: 'petTabla',
      tablaKey: 'petTabla',
      endpoint: '/demograficos/datos',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'aggregate',
      tableConfig: {
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true
      },
      editable: true,
      columns: [
        { field: 'categoria', label: 'Categoría', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'PET según grupos de edad'
    }
  ]);

  // Sección 8 AISD - Actividades Económicas
  TABLES_REGISTRY.set('seccion8_aisd', [
    {
      sectionKey: 'seccion8_aisd',
      fieldName: 'actividadesEconomicasAISD',
      tablaKey: 'actividadesEconomicasAISD',
      endpoint: '/pea/actividades-ocupadas',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: (data: any) => {
        const actividades = data?.actividades_economicas || data?.data || data || [];
        return transformActividades(actividades);
      },
      tableConfig: {
        totalKey: 'actividad',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true
      },
      editable: true,
      columns: [
        { field: 'actividad', label: 'Actividad', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Actividades económicas AISD'
    },
    {
      sectionKey: 'seccion8_aisd',
      fieldName: 'peaOcupacionesTabla',
      tablaKey: 'peaOcupacionesTabla',
      endpoint: '/pea/actividades-ocupadas',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: (data: any) => {
        const actividades = data?.actividades_economicas || data?.data || data || [];
        return transformPEAOcupaciones(actividades);
      },
      tableConfig: {
        totalKey: 'ocupacion',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true
      },
      editable: true,
      columns: [
        { field: 'ocupacion', label: 'Ocupación', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'PEA por ocupaciones - Agregada desde múltiples centros poblados'
    }
  ]);

  // Sección 9 AISD - Vivienda
  TABLES_REGISTRY.set('seccion9_aisd', [
    {
      sectionKey: 'seccion9_aisd',
      fieldName: 'condicionOcupacionTabla',
      tablaKey: 'condicionOcupacionTabla',
      endpoint: '/aisd/centros-poblados',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: (data: any) => {
        const arr = Array.isArray(data) ? data : [];
        const emp = arr.reduce((sum, x) => sum + (Number(x?.viviendas_empadronadas) || 0), 0);
        const ocu = arr.reduce((sum, x) => sum + (Number(x?.viviendas_ocupadas) || 0), 0);
        const otras = Math.max(emp - ocu, 0);
        const total = emp;
        if (total <= 0) return [];
        return [
          { condicion: 'Ocupadas', casos: ocu, porcentaje: ((ocu / total) * 100).toFixed(2) + ' %' },
          { condicion: 'Desocupadas', casos: otras, porcentaje: ((otras / total) * 100).toFixed(2) + ' %' }
        ];
      },
      tableConfig: {
        totalKey: 'condicion',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'condicion', label: 'Condición', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Condición de ocupación de viviendas'
    }
  ]);

  // ============================================
  // SECCIONES AISI (21-30)
  // ============================================

  // Sección 22 AISI - Población y Demografía (equivalente a Sección 6 AISD)
  TABLES_REGISTRY.set('seccion22_aisi', [
    {
      sectionKey: 'seccion22_aisi',
      fieldName: 'poblacionSexoAISI',
      tablaKey: 'poblacionSexoAISI',
      endpoint: '/centros-poblados/por-codigos-ubigeo',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformPoblacionSexoDesdeCentrosPoblados,
      tableConfig: {
        totalKey: 'sexo',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true
      },
      editable: true,
      columns: [
        { field: 'sexo', label: 'Sexo', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Población AISI según sexo'
    },
    {
      sectionKey: 'seccion22_aisi',
      fieldName: 'poblacionEtarioAISI',
      tablaKey: 'poblacionEtarioAISI',
      endpoint: '/centros-poblados/por-codigos-ubigeo',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformPoblacionEtarioDesdeCentrosPoblados,
      tableConfig: {
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true
      },
      editable: true,
      columns: [
        { field: 'categoria', label: 'Categoría', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Población AISI según grupo etario'
    },
    {
      sectionKey: 'seccion22_aisi',
      fieldName: 'centrosPobladosAISI',
      tablaKey: 'centrosPobladosAISI',
      endpoint: '/aisi/centros-poblados',
      method: 'GET',
      paramType: 'ubigeo',
      aggregatable: false,
      transformType: 'custom',
      customTransform: transformCentrosPobladosAISI,
      tableConfig: {
        totalKey: 'localidad',
        campoTotal: 'poblacion'
      },
      editable: true,
      columns: [
        { field: 'localidad', label: 'Localidad', type: 'text' },
        { field: 'poblacion', label: 'Población', type: 'number' },
        { field: 'viviendas_empadronadas', label: 'Viv. Empadronadas', type: 'number' },
        { field: 'viviendas_ocupadas', label: 'Viv. Ocupadas', type: 'number' }
      ],
      description: 'Centros poblados AISI'
    }
  ]);

  // Sección 23 AISI - Servicios Básicos
  TABLES_REGISTRY.set('seccion23_aisi', [
    {
      sectionKey: 'seccion23_aisi',
      fieldName: 'petGruposEdadAISI',
      tablaKey: 'petGruposEdadAISI',
      endpoint: '/demograficos/datos',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'aggregate',
      tableConfig: {
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true
      },
      editable: true,
      columns: [
        { field: 'categoria', label: 'Categoría', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'PET según grupos de edad AISI'
    },
    {
      sectionKey: 'seccion23_aisi',
      fieldName: 'poblacionSexoAISI',
      tablaKey: 'poblacionSexoAISI',
      endpoint: '/demograficos/datos',
      method: 'POST',
      paramType: 'ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformPoblacionSexoDesdeDemograficos,
      tableConfig: {
        totalKey: 'sexo',
        campoTotal: 'casos'
      },
      editable: true,
      columns: [
        { field: 'sexo', label: 'Sexo', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' }
      ],
      description: 'Población AISI según sexo (demográficos)'
    }
  ]);

  // ============================================
  // SECCIONES AISD (10-20) - Migradas desde legacy
  // ============================================

  TABLES_REGISTRY.set('seccion10_aisd', [
    {
      sectionKey: 'seccion10_aisd',
      fieldName: 'abastecimientoAguaTabla',
      tablaKey: 'abastecimientoAguaTabla',
      endpoint: '/servicios/por-codigos',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: (data: any) => transformServiciosPorCategoria(data, 'Agua'),
      tableConfig: {
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'categoria', label: 'Categoría', type: 'text' },
        { field: 'tipo', label: 'Tipo', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Abastecimiento de agua'
    },
    {
      sectionKey: 'seccion10_aisd',
      fieldName: 'tiposSaneamientoTabla',
      tablaKey: 'tiposSaneamientoTabla',
      endpoint: '/servicios/por-codigos',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: (data: any) => transformServiciosPorCategoria(data, 'Desagüe'),
      tableConfig: {
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'categoria', label: 'Categoría', type: 'text' },
        { field: 'tipo', label: 'Tipo', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Tipos de saneamiento'
    },
    {
      sectionKey: 'seccion10_aisd',
      fieldName: 'alumbradoElectricoTabla',
      tablaKey: 'alumbradoElectricoTabla',
      endpoint: '/servicios/por-codigos',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: (data: any) => transformServiciosPorCategoria(data, 'Alumbrado'),
      tableConfig: {
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'categoria', label: 'Categoría', type: 'text' },
        { field: 'tipo', label: 'Tipo', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Alumbrado eléctrico'
    }
  ]);

  TABLES_REGISTRY.set('seccion13_aisd', [
    {
      sectionKey: 'seccion13_aisd',
      fieldName: 'afiliacionSaludTabla',
      tablaKey: 'afiliacionSaludTabla',
      endpoint: '/salud/seguro-salud/por-codigos',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformAfiliacionSaludTabla,
      tableConfig: {
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'categoria', label: 'Categoría', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Afiliación a seguro de salud'
    }
  ]);

  TABLES_REGISTRY.set('seccion14_aisd', [
    {
      sectionKey: 'seccion14_aisd',
      fieldName: 'nivelEducativoTabla',
      tablaKey: 'nivelEducativoTabla',
      endpoint: '/educacion/por-codigos',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformNivelEducativoTabla,
      tableConfig: {
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'categoria', label: 'Nivel educativo', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Nivel educativo'
    },
    {
      sectionKey: 'seccion14_aisd',
      fieldName: 'tasaAnalfabetismoTabla',
      tablaKey: 'tasaAnalfabetismoTabla',
      endpoint: '/educacion/tasa-analfabetismo/por-codigos',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformTasaAnalfabetismoTabla,
      tableConfig: {
        totalKey: 'indicador',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'indicador', label: 'Indicador', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Tasa de analfabetismo'
    }
  ]);

  TABLES_REGISTRY.set('seccion15_aisd', [
    {
      sectionKey: 'seccion15_aisd',
      fieldName: 'lenguasAISD',
      tablaKey: 'lenguasAISD',
      endpoint: '/vistas/lenguas-ubicacion',
      method: 'GET',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformLenguasSimple,
      tableConfig: {
        totalKey: 'idioma',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'idioma', label: 'Idioma', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Lenguas AISD'
    },
    {
      sectionKey: 'seccion15_aisd',
      fieldName: 'lenguasMaternasTabla',
      tablaKey: 'lenguasMaternasTabla',
      endpoint: '/vistas/lenguas-ubicacion',
      method: 'GET',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformLenguasMaternasTabla,
      tableConfig: {
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'categoria', label: 'Lengua', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Lenguas maternas (agregado)'
    },
    {
      sectionKey: 'seccion15_aisd',
      fieldName: 'religionesTabla',
      tablaKey: 'religionesTabla',
      endpoint: '/vistas/religiones-ubicacion',
      method: 'GET',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformReligionesTabla,
      tableConfig: {
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'categoria', label: 'Religión', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Religiones (agregado)'
    }
  ]);

  TABLES_REGISTRY.set('seccion16_aisd', [
    {
      sectionKey: 'seccion16_aisd',
      fieldName: 'religionesAISD',
      tablaKey: 'religionesAISD',
      endpoint: '/vistas/religiones-ubicacion',
      method: 'GET',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformReligionesSimple,
      tableConfig: {
        totalKey: 'religion',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'religion', label: 'Religión', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Religiones AISD'
    }
  ]);

  TABLES_REGISTRY.set('seccion18_aisd', [
    {
      sectionKey: 'seccion18_aisd',
      fieldName: 'nbiCCAyrocaTabla',
      tablaKey: 'nbiCCAyrocaTabla',
      endpoint: '/nbi/por-codigos',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'standard',
      transformConfig: {
        categoriaField: 'carencia',
        casosField: 'casos',
        porcentajeField: 'porcentaje'
      },
      tableConfig: {
        totalKey: 'carencia',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'carencia', label: 'Carencia', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'NBI CCAyroca'
    },
    {
      sectionKey: 'seccion18_aisd',
      fieldName: 'nbiDistritoCahuachoTabla',
      tablaKey: 'nbiDistritoCahuachoTabla',
      endpoint: '/nbi/por-codigos',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'standard',
      transformConfig: {
        categoriaField: 'carencia',
        casosField: 'casos',
        porcentajeField: 'porcentaje'
      },
      tableConfig: {
        totalKey: 'carencia',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'carencia', label: 'Carencia', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'NBI Distrito Cahuacho'
    }
  ]);

  TABLES_REGISTRY.set('seccion19_aisd', [
    {
      sectionKey: 'seccion19_aisd',
      fieldName: 'nbiAISD',
      tablaKey: 'nbiAISD',
      endpoint: '/nbi/por-codigos',
      method: 'POST',
      paramType: 'id_ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: (data: any) => {
        const arr = Array.isArray(data) ? data : data?.data || [];
        return transformNBISimple(arr);
      },
      tableConfig: {
        totalKey: 'necesidad',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'necesidad', label: 'Necesidad', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'NBI AISD'
    }
  ]);

  // ============================================
  // SECCIONES AISI (21-30) - Migradas desde legacy
  // ============================================

  TABLES_REGISTRY.set('seccion21_aisi', [
    {
      sectionKey: 'seccion21_aisi',
      fieldName: 'informacionReferencialAISI',
      tablaKey: 'informacionReferencialAISI',
      endpoint: '/aisi/informacion-referencial',
      method: 'GET',
      paramType: 'ubigeo',
      aggregatable: false,
      transformType: 'passthrough',
      tableConfig: {
        totalKey: 'id',
        campoTotal: 'id'
      },
      editable: false,
      description: 'Información referencial AISI'
    }
  ]);

  TABLES_REGISTRY.set('seccion24_aisi', [
    {
      sectionKey: 'seccion24_aisi',
      fieldName: 'poblacionEtarioAISI',
      tablaKey: 'poblacionEtarioAISI',
      endpoint: '/demograficos/datos',
      method: 'POST',
      paramType: 'ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformPoblacionEtarioDesdeDemograficos,
      tableConfig: {
        totalKey: 'categoria',
        campoTotal: 'casos'
      },
      editable: true,
      columns: [
        { field: 'categoria', label: 'Categoría', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' }
      ],
      description: 'Población AISI por grupo etario (demográficos)'
    }
  ]);

  TABLES_REGISTRY.set('seccion25_aisi', [
    {
      sectionKey: 'seccion25_aisi',
      fieldName: 'petAISI',
      tablaKey: 'petAISI',
      endpoint: '/aisd/pet',
      method: 'GET',
      paramType: 'ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformPETDesdeAisdPet,
      tableConfig: {
        totalKey: 'categoria',
        campoTotal: 'casos'
      },
      editable: true,
      columns: [
        { field: 'categoria', label: 'Categoría', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' }
      ],
      description: 'PET AISI'
    }
  ]);

  TABLES_REGISTRY.set('seccion26_aisi', [
    {
      sectionKey: 'seccion26_aisi',
      fieldName: 'peaDistrital',
      tablaKey: 'peaDistrital',
      endpoint: '/aisi/pea-distrital',
      method: 'GET',
      paramType: 'ubigeo',
      aggregatable: false,
      transformType: 'passthrough',
      tableConfig: {
        totalKey: 'id',
        campoTotal: 'id'
      },
      editable: false,
      description: 'PEA distrital'
    }
  ]);

  TABLES_REGISTRY.set('seccion27_aisi', [
    {
      sectionKey: 'seccion27_aisi',
      fieldName: 'actividadesEconomicasAISI',
      tablaKey: 'actividadesEconomicasAISI',
      endpoint: '/pea/actividades-ocupadas',
      method: 'POST',
      paramType: 'ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: (data: any) => {
        const actividades = data?.actividades_economicas || data?.data || data || [];
        return transformActividadesEconomicas(Array.isArray(actividades) ? actividades : []);
      },
      tableConfig: {
        totalKey: 'actividad',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'actividad', label: 'Actividad', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Actividades económicas AISI'
    }
  ]);

  TABLES_REGISTRY.set('seccion28_aisi', [
    {
      sectionKey: 'seccion28_aisi',
      fieldName: 'viviendasCensoAISI',
      tablaKey: 'viviendasCensoAISI',
      endpoint: '/aisi/viviendas-censo',
      method: 'GET',
      paramType: 'ubigeo',
      aggregatable: false,
      transformType: 'passthrough',
      tableConfig: {
        totalKey: 'id',
        campoTotal: 'id'
      },
      editable: false,
      description: 'Viviendas censo AISI'
    }
  ]);

  TABLES_REGISTRY.set('seccion29_aisi', [
    {
      sectionKey: 'seccion29_aisi',
      fieldName: 'serviciosBasicosAISI',
      tablaKey: 'serviciosBasicosAISI',
      endpoint: '/servicios/por-codigos',
      method: 'POST',
      paramType: 'ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformServiciosBasicosAISI,
      tableConfig: {
        totalKey: 'tipo',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'servicio', label: 'Servicio', type: 'text' },
        { field: 'tipo', label: 'Tipo', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Servicios básicos AISI'
    }
  ]);

  TABLES_REGISTRY.set('seccion30_aisi', [
    {
      sectionKey: 'seccion30_aisi',
      fieldName: 'lenguasAISI',
      tablaKey: 'lenguasAISI',
      endpoint: '/vistas/lenguas-ubicacion',
      method: 'GET',
      paramType: 'ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformLenguasSimple,
      tableConfig: {
        totalKey: 'idioma',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'idioma', label: 'Idioma', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Lenguas AISI'
    },
    {
      sectionKey: 'seccion30_aisi',
      fieldName: 'religionesAISI',
      tablaKey: 'religionesAISI',
      endpoint: '/vistas/religiones-ubicacion',
      method: 'GET',
      paramType: 'ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: transformReligionesSimple,
      tableConfig: {
        totalKey: 'religion',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'religion', label: 'Religión', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'Religiones AISI'
    },
    {
      sectionKey: 'seccion30_aisi',
      fieldName: 'nbiAISI',
      tablaKey: 'nbiAISI',
      endpoint: '/nbi/por-codigos',
      method: 'POST',
      paramType: 'ubigeo',
      aggregatable: true,
      transformType: 'custom',
      customTransform: (data: any) => {
        const arr = Array.isArray(data) ? data : data?.data || [];
        return transformNBISimple(arr);
      },
      tableConfig: {
        totalKey: 'necesidad',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      },
      editable: true,
      columns: [
        { field: 'necesidad', label: 'Necesidad', type: 'text' },
        { field: 'casos', label: 'Casos', type: 'number' },
        { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
      ],
      description: 'NBI AISI'
    }
  ]);

  // Secciones 26-30 AISI - Placeholder para migración futura (no sobrescribir si ya existen)
  ['seccion26_aisi', 'seccion27_aisi', 'seccion28_aisi', 'seccion29_aisi', 'seccion30_aisi'].forEach(sectionKey => {
    if (!TABLES_REGISTRY.has(sectionKey)) {
      TABLES_REGISTRY.set(sectionKey, []);
    }
  });
}

// Exportar funciones de transformación para uso en otros lugares si es necesario
export { 
  transformPoblacionSexoDesdeCentrosPoblados,
  transformPoblacionEtarioDesdeCentrosPoblados,
  transformActividades,
  transformPEAOcupaciones
};
