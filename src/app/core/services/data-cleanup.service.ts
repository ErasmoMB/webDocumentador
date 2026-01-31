import { Injectable } from '@angular/core';
import { FormPersistenceService } from './state/form-persistence.service';
import { StorageFacade } from './infrastructure/storage-facade.service';
import { TABLE_TEMPLATES } from '../config/table-templates';

/**
 * DataCleanupService
 * 
 * Servicio para detectar y limpiar datos obsoletos que interfieren
 * con la lógica actual del sistema.
 * 
 * OBJETIVO:
 * - Eliminar datos antiguos de versiones anteriores que causan problemas
 * - Detectar y corregir estructuras incompletas o placeholders
 * - Mantener el proyecto limpio y a nivel senior
 * 
 * ESTRATEGIA:
 * - Detección automática de datos obsoletos
 * - Limpieza segura (solo elimina datos problemáticos)
 * - Logging para debugging
 * - Ejecución al iniciar la aplicación
 */
@Injectable({
  providedIn: 'root'
})
export class DataCleanupService {
  private readonly CLEANUP_VERSION = '1.0.2'; // Incrementar cuando cambie la lógica de limpieza
  private readonly CLEANUP_FLAG_KEY = 'lbs:data-cleanup:version';

  constructor(
    private formPersistence: FormPersistenceService,
    private storage: StorageFacade
  ) {}

  /**
   * Ejecuta limpieza completa de datos legacy
   * Se debe llamar al iniciar la aplicación
   */
  async cleanupLegacyData(): Promise<void> {
    const lastCleanupVersion = this.storage.getItem(this.CLEANUP_FLAG_KEY);
    
    // Solo ejecutar si no se ha limpiado con esta versión
    if (lastCleanupVersion !== this.CLEANUP_VERSION) {
      // 🧹 [Legacy Cleanup] Iniciando limpieza de datos legacy...
      
      try {
        // 1. Limpiar datos de formularios legacy
        this.cleanupLegacyFormData();
        
        // 2. Limpiar tablas con estructuras incompletas
        this.cleanupIncompleteTables();
        
        // 3. Marcar como limpiado
        this.storage.setItem(this.CLEANUP_FLAG_KEY, this.CLEANUP_VERSION);
        
        // ✅ [Legacy Cleanup] Limpieza completada exitosamente
      } catch (error) {
        console.error('❌ [Legacy Cleanup] Error durante limpieza:', error);
      }
    } else {
      // ℹ️ [Legacy Cleanup] Ya se ejecutó limpieza en esta versión
    }
  }

  /**
   * Limpia datos de formularios legacy en localStorage
   */
  private cleanupLegacyFormData(): void {
    const keys = this.storage.keys();
    let cleanedCount = 0;

    keys.forEach(key => {
      if (key.startsWith('lbs:form-state:')) {
        try {
          const raw = this.storage.getItem(key);
          if (!raw) return;

          const parsed = JSON.parse(raw);
          const data = parsed?.data;

          if (!data || typeof data !== 'object') return;

          // Buscar tablas con datos legacy
          let hasLegacyData = false;
          const cleanedData: any = {};

          for (const [groupId, groupData] of Object.entries(data)) {
            if (!groupData || typeof groupData !== 'object') continue;

            const cleanedGroup: any = {};

            for (const [fieldName, fieldData] of Object.entries(groupData as any)) {
              const fieldValue = (fieldData as any)?.value;

              // Detectar si es una tabla con datos legacy
              if (this.isLegacyTableData(fieldName, fieldValue)) {
                hasLegacyData = true;
                // 🗑️ [Legacy Cleanup] Eliminando tabla legacy: fieldName en grupo groupId
                // No incluir este campo en cleanedData (eliminarlo)
                continue;
              }

              // ✅ CRÍTICO: Solo incluir campos que NO son legacy
              cleanedGroup[fieldName] = fieldData;
            }

            if (Object.keys(cleanedGroup).length > 0) {
              cleanedData[groupId] = cleanedGroup;
            }
          }

          if (hasLegacyData) {
            // Si quedaron datos válidos, actualizar; si no, eliminar completamente
            if (Object.keys(cleanedData).length > 0) {
              parsed.data = cleanedData;
              this.storage.setItem(key, JSON.stringify(parsed));
            } else {
              this.storage.removeItem(key);
            }
            cleanedCount++;
          }
        } catch (error) {
          console.warn(`⚠️ [Legacy Cleanup] Error procesando ${key}:`, error);
        }
      }
    });

    if (cleanedCount > 0) {
      // ✅ [Legacy Cleanup] Limpiados cleanedCount formularios con datos legacy
    }
  }

  /**
   * Limpia tablas con estructuras incompletas en localStorage
   */
  private cleanupIncompleteTables(): void {
    const keys = this.storage.keys();
    let cleanedCount = 0;

    keys.forEach(key => {
      // Buscar claves que contengan nombres de tablas conocidas
      const tableKeys = [
        'petTabla', 'peaTabla', 'peaOcupadaTabla',
        'poblacionSexo', 'poblacionEtario',
        'Tabla', 'tabla' // Patrones genéricos
      ];

      const isTableKey = tableKeys.some(tableKey => 
        key.toLowerCase().includes(tableKey.toLowerCase())
      );

      if (isTableKey) {
        try {
          const raw = this.storage.getItem(key);
          if (!raw) return;

          // Intentar parsear como array directo
          let tableData: any;
          try {
            tableData = JSON.parse(raw);
          } catch {
            // Si no es JSON válido, puede ser string, eliminarlo
            // 🗑️ [Legacy Cleanup] Eliminando dato inválido: key
            this.storage.removeItem(key);
            cleanedCount++;
            return;
          }

          // Si es un array, verificar si es legacy
          if (Array.isArray(tableData)) {
            if (this.isLegacyTableArray(tableData)) {
              // 🗑️ [Legacy Cleanup] Eliminando tabla legacy: key
              this.storage.removeItem(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          console.warn(`⚠️ [Legacy Cleanup] Error procesando ${key}:`, error);
        }
      }
    });

    if (cleanedCount > 0) {
      // ✅ [Legacy Cleanup] Limpiadas cleanedCount tablas legacy
    }
  }

  /**
   * Detecta si un valor de campo es una tabla con datos legacy
   */
  private isLegacyTableData(fieldName: string, fieldValue: any): boolean {
    if (!fieldValue || !Array.isArray(fieldValue)) {
      return false;
    }

    // ✅ MEJORADO: Detectar tablas conocidas por nombre (más específico)
    const tableFieldPatterns = [
      'tabla', 'table',
      'poblacionSexo', 'poblacionEtario',
      'petTabla', 'peaTabla', 'peaOcupadaTabla'
    ];
    
    const isTableField = tableFieldPatterns.some(pattern => 
      fieldName.toLowerCase().includes(pattern.toLowerCase())
    );

    if (!isTableField) {
      return false;
    }

    return this.isLegacyTableArray(fieldValue);
  }

  /**
   * Detecta si un array de tabla es legacy (estructura incompleta o placeholder)
   */
  private isLegacyTableArray(tableData: any[]): boolean {
    if (!Array.isArray(tableData) || tableData.length === 0) {
      return false;
    }

    // Caso 1: Solo tiene 1 fila y es placeholder vacío
    if (tableData.length === 1) {
      const row = tableData[0];
      if (this.isPlaceholderRow(row)) {
        return true; // Legacy: 1 fila placeholder
      }
    }

    // Caso 2: Tiene menos filas de las esperadas para tablas con estructura inicial
    // (Esto requiere conocer las estructuras esperadas, pero por ahora
    //  nos enfocamos en el caso más común: 1 fila placeholder)

    // Caso 3: Todas las filas son placeholders
    const allPlaceholders = tableData.every(row => this.isPlaceholderRow(row));
    if (allPlaceholders && tableData.length > 0) {
      return true; // Legacy: todas las filas son placeholders
    }

    return false;
  }

  /**
   * Detecta si una fila es un placeholder vacío
   * ✅ MEJORADO: Detección más robusta de placeholders
   */
  private isPlaceholderRow(row: any): boolean {
    if (!row || typeof row !== 'object') {
      return true;
    }

    // Verificar campos clave comunes
    const categoria = row.categoria || row.sexo || '';
    const casos = row.casos || row.hombres || row.mujeres || 0;
    const porcentaje = row.porcentaje || row.porcentajeHombres || row.porcentajeMujeres || '';

    // Es placeholder si:
    // - Categoría está vacía (o no existe)
    // - Casos es 0
    // - Porcentaje es 0 o vacío
    const categoriaVacia = !categoria || categoria.toString().trim() === '';
    const casosCero = casos === 0 || casos === '0' || casos === '' || casos === null || casos === undefined;
    const porcentajeCero = !porcentaje || 
                          porcentaje.toString().trim() === '' ||
                          porcentaje.toString().includes('0%') ||
                          porcentaje.toString().includes('0,00 %') ||
                          porcentaje.toString().includes('0.00 %');

    return categoriaVacia && casosCero && porcentajeCero;
  }

  /**
   * Limpia datos legacy de un objeto datos específico (en memoria)
   * Útil para limpiar datos antes de usarlos
   */
  cleanupDatosObject(datos: any): any {
    if (!datos || typeof datos !== 'object') {
      return datos;
    }

    const cleaned: any = { ...datos };

    // Buscar todas las propiedades que parecen tablas
    for (const [key, value] of Object.entries(datos)) {
      if (key.toLowerCase().includes('tabla') && Array.isArray(value)) {
        if (this.isLegacyTableArray(value)) {
          // 🗑️ [Legacy Cleanup] Limpiando tabla legacy en memoria: key
          // Eliminar la propiedad (no incluirla en cleaned)
          delete cleaned[key];
        }
      }
    }

    return cleaned;
  }

  /**
   * Fuerza limpieza completa (útil para debugging o reset manual)
   */
  forceCleanup(): void {
    this.storage.removeItem(this.CLEANUP_FLAG_KEY);
    this.cleanupLegacyData();
  }
}
