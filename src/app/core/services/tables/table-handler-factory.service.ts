import { Injectable } from '@angular/core';
import { TableManagementFacade } from './table-management.facade';
import { TableConfig } from './table-management.service';
import { FormChangeService } from '../state/form-change.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

/**
 * 🏭 FACTORY DE HANDLERS DE TABLA
 * 
 * Genera funciones handler automáticas para tablas sin duplicar código.
 * Elimina la necesidad de escribir onXXXFieldChange en cada sección.
 * 
 * PATRÓN: Factory Method + Closure
 * 
 * BENEFICIOS:
 * - ✅ DRY: No repetir lógica de handlers
 * - ✅ Consistencia: Todos los handlers funcionan igual
 * - ✅ Mantenible: Cambios en un solo lugar
 * - ✅ Type-safe: TypeScript valida todo
 * 
 * USO EN COMPONENTES:
 * ```typescript
 * // Crear handler automático
 * onMiTablaFieldChange = this.tableHandlerFactory.createHandler(
 *   'miTabla',
 *   (data) => this.datos = data,
 *   () => this.cdRef.detectChanges()
 * );
 * 
 * // Usar en template
 * <app-dynamic-table
 *   [customFieldChangeHandler]="onMiTablaFieldChange"
 * ></app-dynamic-table>
 * ```
 */
export interface TableHandlerContext {
  /** Datos del componente */
  datos: any;
  /** ID de sección actual */
  seccionId: string;
  /** Configuración de la tabla */
  config: TableConfig;
  /** Callback para actualizar datos del componente */
  updateData: (newData: any) => void;
  /** Callback para forzar detección de cambios */
  detectChanges: () => void;
  /** Opcional: Callback para lógica adicional después del cambio */
  afterChange?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class TableHandlerFactoryService {

  constructor(
    private tableFacade: TableManagementFacade,
    private formChange: FormChangeService
  ) {}

  /**
   * 🏭 CREA UN HANDLER GENÉRICO PARA CUALQUIER TABLA
   * 
   * Este método elimina la necesidad de escribir handlers específicos
   * como onPEAFieldChange, onMorbilidadFieldChange, etc.
   * 
   * @param tableKey - Nombre base de la tabla (sin prefijo)
   * @param context - Contexto del handler
   * @returns Función handler lista para usar
   * 
   * @example
   * ```typescript
   * // En tu componente:
   * onPEAFieldChange = this.createTableHandler('peaTabla', {
   *   datos: () => this.datos,
   *   seccionId: () => this.seccionId,
   *   config: this.peaConfig,
   *   updateData: (data) => this.datos = data,
   *   detectChanges: () => this.cdRef.detectChanges()
   * });
   * ```
   */
  createHandler(
    tableKey: string,
    getDatos: () => any,
    getSeccionId: () => string,
    getConfig: () => TableConfig,
    updateData: (newData: any) => void,
    detectChanges: () => void,
    afterChange?: () => void
  ): (index: number, field: string, value: any) => void {
    
    return (index: number, field: string, value: any) => {
      const datos = getDatos();
      const seccionId = getSeccionId();
      const config = getConfig();

      // Obtener prefijo dinámicamente
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
      const tablaKeyConPrefijo = prefijo ? `${tableKey}${prefijo}` : tableKey;

      // Asegurar que la tabla existe
      // ✅ Respetar noInicializarDesdeEstructura: si está activo, no crear fila vacía
      if (!datos[tablaKeyConPrefijo] || !Array.isArray(datos[tablaKeyConPrefijo])) {
        if (config.noInicializarDesdeEstructura) {
          // No inicializar - dejar como array vacío
          datos[tablaKeyConPrefijo] = [];
        } else {
          datos[tablaKeyConPrefijo] = config.estructuraInicial || [{}];
        }
      }

      const tabla = [...datos[tablaKeyConPrefijo]];

      // Asegurar que la fila existe
      if (!tabla[index]) {
        tabla[index] = {};
      }

      // Actualizar valor
      tabla[index][field] = value;

      // Si hay campos para calcular porcentajes
      if (config.calcularPorcentajes && config.camposParaCalcular) {
        this.tableFacade.calcularPorcentajes(
          { [tablaKeyConPrefijo]: tabla },
          { ...config, tablaKey: tablaKeyConPrefijo }
        );
      }

      // Actualizar datos
      datos[tablaKeyConPrefijo] = [...tabla];
      updateData(datos);

      // Persistir cambios - GUARDAR EN SESSION-DATA DE LA SECCIÓN
      console.log(`[SECCION6:EDIT] 💾 GUARDANDO TABLA EDITADA: seccionId=${seccionId}, tablaKey=${tablaKeyConPrefijo}, rows=${tabla.length}`);
      console.log(`[SECCION6:EDIT] 📋 Datos guardados:`, tabla.map((r: any) => ({ sexo: r.sexo, casos: r.casos })));
      this.formChange.persistFields(seccionId, 'table', { 
        [tablaKeyConPrefijo]: tabla 
      });
      console.log(`[SECCION6:EDIT] ✅ persistFields completado`);

      // Callback personalizado (si existe)
      if (afterChange) {
        afterChange();
      }

      // Forzar detección de cambios
      detectChanges();
    };
  }

  /**
   * 🏭 VERSIÓN SIMPLIFICADA: Crea handler con menos parámetros
   * 
   * Para componentes que no necesitan callbacks adicionales
   * 
   * @example
   * ```typescript
   * onMiTablaFieldChange = this.createSimpleHandler(
   *   'miTabla',
   *   this,
   *   this.miTablaConfig
   * );
   * ```
   */
  createSimpleHandler(
    tableKey: string,
    component: any, // Componente que tiene datos, seccionId, cdRef
    config: TableConfig,
    afterChange?: () => void
  ): (index: number, field: string, value: any) => void {
    
    return this.createHandler(
      tableKey,
      () => component.datos,
      () => component.seccionId,
      () => config,
      (newData) => component.datos = newData,
      () => component.cdRef.detectChanges(),
      afterChange
    );
  }

  /**
   * 🏭 VERSIÓN CON AUTO-CONFIG: Usa configuración del registro
   * 
   * Busca la configuración automáticamente en SectionTableRegistry
   * 
   * NOTA: Requiere que SectionTableRegistry tenga la tabla registrada
   */
  createAutoConfigHandler(
    tableKey: string,
    component: any,
    afterChange?: () => void
  ): (index: number, field: string, value: any) => void {
    
    // La config debe venir del componente (getter dinámico)
    // porque necesitamos acceso al registro de tablas
    return (index: number, field: string, value: any) => {
      const handler = this.createSimpleHandler(
        tableKey,
        component,
        component[`${tableKey}Config`] || {}, // Buscar getter de config
        afterChange
      );
      handler(index, field, value);
    };
  }
}
