import { Injectable } from '@angular/core';
import { TABLES_REGISTRY, initializeTablesRegistry } from '../config/tables-registry.config';
import { TableMetadata } from '../models/table-metadata.model';
import { TableTransformFactoryService } from './table-transform-factory.service';

export interface DataMapping {
  fieldName: string;
  endpoint: string;
  transform?: (data: any) => any;
  paramType?: 'id_ubigeo' | 'ubigeo';
  aggregatable?: boolean;
  method?: 'GET' | 'POST';
}

export interface SectionDataConfig {
  [fieldName: string]: DataMapping;
}

@Injectable({
  providedIn: 'root'
})
export class BackendDataMapperService {
  private readonly mappingConfigs: Map<string, SectionDataConfig> = new Map();

  constructor(
    private transformFactory: TableTransformFactoryService
  ) {
    this.initializeMappings();
  }

  private initializeMappings(): void {
    // Primero: Cargar mappings desde registry declarativo (nuevo sistema)
    this.initializeMappingsFromRegistry();
  }

  /**
   * Inicializa mappings desde el registro declarativo (nuevo sistema)
   */
  private initializeMappingsFromRegistry(): void {
    // Inicializar registry si no está inicializado
    if (TABLES_REGISTRY.size === 0) {
      initializeTablesRegistry();
    }

    TABLES_REGISTRY.forEach((tables, sectionKey) => {
      const sectionConfig: SectionDataConfig = {};

      tables.forEach(table => {
        // Crear transform usando factory
        const transform = this.transformFactory.createTransform(table);

        // Construir DataMapping desde TableMetadata
        sectionConfig[table.fieldName] = {
          fieldName: table.fieldName,
          endpoint: table.endpoint,
          method: table.method || 'GET',
          paramType: table.paramType || 'id_ubigeo',
          aggregatable: table.aggregatable || false,
          transform: transform
        };
      });

      // Solo agregar si hay tablas configuradas
      // Si ya existe en legacy, el registry tiene prioridad
      if (Object.keys(sectionConfig).length > 0) {
        this.mappingConfigs.set(sectionKey, sectionConfig);
      }
    });
  }

  getConfig(sectionKey: string): SectionDataConfig | null {
    return this.mappingConfigs.get(sectionKey) || null;
  }

  getMapping(sectionKey: string, fieldName: string): DataMapping | null {
    const config = this.getConfig(sectionKey);
    return config?.[fieldName] || null;
  }

  /**
   * Obtiene metadata de una tabla específica desde el registry
   */
  getTableMetadata(sectionKey: string, fieldName: string): TableMetadata | undefined {
    const tables = TABLES_REGISTRY.get(sectionKey);
    return tables?.find(t => t.fieldName === fieldName);
  }

  /**
   * Obtiene todas las tablas de una sección desde el registry
   */
  getSectionTables(sectionKey: string): TableMetadata[] {
    return TABLES_REGISTRY.get(sectionKey) || [];
  }

  /**
   * Verifica si una sección tiene tablas en el registry
   */
  hasTablesInRegistry(sectionKey: string): boolean {
    return TABLES_REGISTRY.has(sectionKey) && (TABLES_REGISTRY.get(sectionKey)?.length || 0) > 0;
  }

  private transformPoblacionSexo(data: any[]): any[] {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    const item = data[0];
    const resultado = [
      { sexo: 'Hombre', casos: item?.hombres || 0 },
      { sexo: 'Mujer', casos: item?.mujeres || 0 }
    ];
    return resultado;
  }

  private transformPoblacionSexoDesdeCentrosPoblados(data: any[]): any[] {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    let totalHombres = 0;
    let totalMujeres = 0;
    
    for (const centro of data) {
      totalHombres += Number(centro?.hombres || 0);
      totalMujeres += Number(centro?.mujeres || 0);
    }
    
    return [
      { sexo: 'Hombre', casos: totalHombres },
      { sexo: 'Mujer', casos: totalMujeres }
    ];
  }

  private transformPoblacionEtario(data: any[]): any[] {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    const d = data[0];
    const resultado = [
      { categoria: 'Menores de 1', casos: d?.menores_1 || 0 },
      { categoria: '1-14 años', casos: d?.de_1_a_14 || 0 },
      { categoria: '15-29 años', casos: d?.de_15_a_29 || 0 },
      { categoria: '30-44 años', casos: d?.de_30_a_44 || 0 },
      { categoria: '45-64 años', casos: d?.de_45_a_64 || 0 },
      { categoria: '65+ años', casos: d?.mayores_65 || 0 }
    ].filter(item => item.casos > 0);
    return resultado;
  }

  private transformPoblacionEtarioDesdeCentrosPoblados(data: any[]): any[] {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    let total_6_14 = 0;
    let total_15_29 = 0;
    let total_30_44 = 0;
    let total_45_64 = 0;
    
    for (const centro of data) {
      total_6_14 += Number(centro?.de_6_a_14_anios || 0);
      total_15_29 += Number(centro?.de_15_a_29 || 0);
      total_30_44 += Number(centro?.de_30_a_44 || 0);
      total_45_64 += Number(centro?.de_45_a_64 || 0);
    }
    
    const resultado = [
      { categoria: '0 a 14 años', casos: total_6_14 },
      { categoria: '15 a 29 años', casos: total_15_29 },
      { categoria: '30 a 44 años', casos: total_30_44 },
      { categoria: '45 a 64 años', casos: total_45_64 },
      { categoria: '65 años a más', casos: 0 }
    ].filter(item => item.casos > 0);
    
    return resultado;
  }

  private transformPET(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      categoria: item.categoría || item.categoria,
      casos: item.casos || 0
    }));
  }

  private transformPETTabla(data: any[]): any[] {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const d = data[0] || {};
    const de_15_a_29 = d?.de_15_a_29 || 0;
    const de_30_a_44 = d?.de_30_a_44 || 0;
    const de_45_a_64 = d?.de_45_a_64 || 0;
    const mayores_65 = d?.mayores_65 || 0;

    return [
      { categoria: '15 a 29 años', casos: de_15_a_29, porcentaje: null },
      { categoria: '30 a 44 años', casos: de_30_a_44, porcentaje: null },
      { categoria: '45 a 64 años', casos: de_45_a_64, porcentaje: null },
      { categoria: '65 años a más', casos: mayores_65, porcentaje: null }
    ].filter(item => (item.casos || 0) > 0);
  }

  private transformActividades(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      actividad: item.actividad || '',
      casos: item.casos || 0,
      porcentaje: item.porcentaje || null
    }));
  }

  private transformMateriales(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      categoria: item.categoria || '',
      tipo_material: item.tipo_material || item.tipoMaterial || '',
      casos: item.casos || 0,
      porcentaje: item.porcentaje || null
    }));
  }

  private transformServicios(data: any): any[] {
    if (!data || typeof data !== 'object') return [];
    
    const servicios: any[] = [];
    const categorias = ['Agua', 'Desagüe', 'Alumbrado'];
    
    categorias.forEach(categoria => {
      const items = data[categoria] || [];
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          servicios.push({
            servicio: categoria,
            tipo: item.tipo || '',
            casos: item.casos || 0,
            porcentaje: item.porcentaje || null
          });
        });
      }
    });
    
    return servicios;
  }

  private transformLenguas(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      idioma: item.idioma || '',
      casos: item.casos || 0,
      porcentaje: item.porcentaje || null
    }));
  }

  private transformReligiones(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    // ✅ FASE 1: NO preservar porcentajes de datos mock - se calcularán dinámicamente
    return data.map(item => ({
      religion: item.religion || '',
      casos: item.casos || 0
      // porcentaje: item.porcentaje || null // ❌ ELIMINADO - se calculará dinámicamente
    }));
  }

  private transformNBI(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      necesidad: item.necesidad || '',
      casos: item.casos || 0,
      porcentaje: item.porcentaje || null
    }));
  }

  private transformCentrosPoblados(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      localidad: item.centro_poblado || item.localidad || '',
      coordenadas: item.coordenadas || '',
      altitud: item.altitud || '',
      distrito: item.distrito || '',
      provincia: item.provincia || '',
      departamento: item.departamento || '',
      // Campos opcionales del endpoint original
      centro_poblado: item.centro_poblado || '',
      categoria: item.categoria || '',
      poblacion: item.poblacion || 0,
      viviendas_empadronadas: item.viviendas_empadronadas || 0,
      viviendas_ocupadas: item.viviendas_ocupadas || 0
    }));
  }

  private transformPEAOcupaciones(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    // ✅ FASE 1: NO preservar porcentajes de datos mock - se calcularán dinámicamente
    const items = data.map(item => ({
      categoria: item.actividad || item.categoria || '',
      casos: item.casos || 0
      // porcentaje: item.porcentaje || null // ❌ ELIMINADO - se calculará dinámicamente
    }));
    return items;
  }
}
