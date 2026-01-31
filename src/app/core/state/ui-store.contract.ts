/**
 * UI ↔ STORE CONTRACT
 * 
 * Este archivo define el ÚNICO punto de acceso entre la UI y el Store.
 * 
 * REGLAS:
 * 1. UI solo puede LEER a través de Selectors
 * 2. UI solo puede ESCRIBIR a través de Commands
 * 3. UI NO conoce la estructura interna de ProjectState
 * 4. UI NO calcula totales, porcentajes ni reglas de negocio
 * 5. UI NO guarda copias del state (sin datosAnteriores, sin caches)
 * 
 * @module UIStoreContract
 */

import { Injectable, Signal, computed, signal } from '@angular/core';
import { 
  ProjectState, 
  ProjectMetadata,
  GroupDefinition,
  SectionState,
  FieldEntry,
  FieldState,
  TableEntry,
  TableRow,
  ImageEntry,
  INITIAL_PROJECT_STATE,
  generateFieldKey,
  generateTableKey,
  generateImageGroupKey,
  CCPPEntry
} from './project-state.model';
import { 
  ProjectStateCommand,
  MetadataCommand,
  GroupConfigCommand,
  SectionCommand,
  FieldCommand,
  TableCommand,
  ImageCommand,
  ProjectCommand,
  BatchCommand
} from './commands.model';
import { rootReducer, createInitialState } from './reducers';
import { GroupType } from '../models/section-config.model';
import { Entrevistado } from '../models/formulario.model';

// ============================================================================
// TIPOS PÚBLICOS PARA UI (Solo lo que la UI necesita ver)
// ============================================================================

/** Información básica del proyecto para display */
export interface ProjectInfo {
  readonly projectName: string;
  readonly consultora: string;
  readonly detalleProyecto: string;
  readonly isDirty: boolean;
  readonly lastSaved: number;
}

/** Grupo para selección en UI */
export interface GroupOption {
  readonly id: string;
  readonly nombre: string;
  readonly level: number;
  readonly hasChildren: boolean;
  readonly parentId: string | null;
}

/** Estado de sección para navegación */
export interface SectionNavItem {
  readonly sectionId: string;
  readonly isInitialized: boolean;
  readonly isComplete: boolean;
  readonly isActive: boolean;
  readonly groupType: GroupType;
  readonly groupId: string | null;
}

/** Campo para formulario */
export interface FormField {
  readonly key: string;
  readonly value: any;
  readonly source: 'user' | 'api' | 'computed' | 'default';
  readonly touched: boolean;
  readonly lastModified: number;
}

/** Fila de tabla para display */
export interface UITableRow {
  readonly rowId: string;
  readonly data: Record<string, any>;
  readonly order: number;
}

/** Imagen para galería */
export interface GalleryImage {
  readonly id: string;
  readonly numero: number;
  readonly titulo: string;
  readonly fuente: string;
  readonly preview: string | null;
  readonly uploadStatus: 'pending' | 'uploaded' | 'error';
}

/** Ubicación geográfica */
export interface UbicacionInfo {
  readonly departamento: string;
  readonly provincia: string;
  readonly distrito: string;
}

// ============================================================================
// SELECTORES (Funciones Puras - Solo Lectura)
// ============================================================================

/**
 * SELECTORES PÚBLICOS
 * 
 * La UI solo puede acceder al estado a través de estos selectores.
 * Todos los selectores son funciones puras que reciben el estado
 * y devuelven datos derivados.
 */
export const Selectors = {
  // === METADATA ===
  
  /** Obtiene información básica del proyecto */
  getProjectInfo: (state: ProjectState): ProjectInfo => ({
    projectName: state.metadata.projectName,
    consultora: state.metadata.consultora,
    detalleProyecto: state.metadata.detalleProyecto,
    isDirty: state._internal.isDirty,
    lastSaved: state._internal.lastSaved
  }),

  /** Obtiene el nombre del proyecto */
  getProjectName: (state: ProjectState): string => state.metadata.projectName,
  
  /** Obtiene la consultora */
  getConsultora: (state: ProjectState): string => state.metadata.consultora,
  
  /** Verifica si el proyecto tiene cambios sin guardar */
  isDirty: (state: ProjectState): boolean => state._internal.isDirty,

  // === GRUPOS ===
  
  /** Obtiene grupos AISD como opciones para select */
  getAISDGroups: (state: ProjectState): GroupOption[] => 
    state.groupConfig.aisd.map(g => ({
      id: g.id,
      nombre: g.nombre,
      level: g.id.split('.').length - 1,
      hasChildren: state.groupConfig.aisd.some(child => child.parentId === g.id),
      parentId: g.parentId
    })),

  /** Obtiene grupos AISI como opciones para select */
  getAISIGroups: (state: ProjectState): GroupOption[] => 
    state.groupConfig.aisi.map(g => ({
      id: g.id,
      nombre: g.nombre,
      level: g.id.split('.').length - 1,
      hasChildren: state.groupConfig.aisi.some(child => child.parentId === g.id),
      parentId: g.parentId
    })),

  /** Obtiene un grupo específico por tipo e ID */
  getGroup: (state: ProjectState, tipo: 'AISD' | 'AISI', groupId: string): GroupOption | null => {
    const groups = tipo === 'AISD' ? state.groupConfig.aisd : state.groupConfig.aisi;
    const g = groups.find(group => group.id === groupId);
    if (!g) return null;
    return {
      id: g.id,
      nombre: g.nombre,
      level: g.id.split('.').length - 1,
      hasChildren: groups.some(child => child.parentId === g.id),
      parentId: g.parentId
    };
  },

  /** Obtiene todos los grupos de un tipo */
  getGroupsByType: (state: ProjectState, tipo: 'AISD' | 'AISI'): readonly GroupDefinition[] => {
    return tipo === 'AISD' ? state.groupConfig.aisd : state.groupConfig.aisi;
  },

  /** Obtiene un grupo definido (sin map a UI) */
  getGroupById: (state: ProjectState, tipo: 'AISD' | 'AISI', groupId: string): GroupDefinition | null => {
    const groups = tipo === 'AISD' ? state.groupConfig.aisd : state.groupConfig.aisi;
    return groups.find(group => group.id === groupId) || null;
  },

  /** Obtiene un centro poblado registrado por su ID */
  getPopulatedCenterById: (state: ProjectState, centerId: string): CCPPEntry | null => {
    return state.ccppRegistry.byId[centerId] || null;
  },

  /** Obtiene todos los centros poblados registrados */
  getAllPopulatedCenters: (state: ProjectState): readonly CCPPEntry[] => {
    return state.ccppRegistry.allIds.map(id => state.ccppRegistry.byId[id]);
  },

  /** Obtiene grupos raíz (sin padre) */
  getRootGroups: (state: ProjectState, tipo: 'AISD' | 'AISI'): GroupOption[] => {
    const groups = tipo === 'AISD' ? state.groupConfig.aisd : state.groupConfig.aisi;
    return groups
      .filter(g => g.parentId === null)
      .map(g => ({
        id: g.id,
        nombre: g.nombre,
        level: 0,
        hasChildren: groups.some(child => child.parentId === g.id),
        parentId: null
      }));
  },

  /** Obtiene hijos de un grupo */
  getGroupChildren: (state: ProjectState, tipo: 'AISD' | 'AISI', parentId: string): GroupOption[] => {
    const groups = tipo === 'AISD' ? state.groupConfig.aisd : state.groupConfig.aisi;
    return groups
      .filter(g => g.parentId === parentId)
      .map(g => ({
        id: g.id,
        nombre: g.nombre,
        level: g.id.split('.').length - 1,
        hasChildren: groups.some(child => child.parentId === g.id),
        parentId: g.parentId
      }));
  },

  // === SECCIONES ===
  
  /** Obtiene la sección activa */
  getActiveSection: (state: ProjectState): SectionNavItem | null => {
    const sectionId = state.sections.activeSectionId;
    if (!sectionId) return null;
    const section = state.sections.byId[sectionId];
    if (!section) return null;
    return {
      sectionId: section.id,
      isInitialized: section.isInitialized,
      isComplete: section.isComplete,
      isActive: true,
      groupType: section.groupType,
      groupId: section.groupId
    };
  },

  /** Obtiene el ID de la sección activa */
  getActiveSectionId: (state: ProjectState): string | null => 
    state.sections.activeSectionId,

  /** Obtiene el estado de navegación de una sección */
  getSectionNav: (state: ProjectState, sectionId: string): SectionNavItem | null => {
    const section = state.sections.byId[sectionId];
    if (!section) return null;
    return {
      sectionId: section.id,
      isInitialized: section.isInitialized,
      isComplete: section.isComplete,
      isActive: state.sections.activeSectionId === sectionId,
      groupType: section.groupType,
      groupId: section.groupId
    };
  },

  /** Obtiene todas las secciones inicializadas */
  getInitializedSections: (state: ProjectState): SectionNavItem[] => 
    state.sections.allIds
      .map(id => state.sections.byId[id])
      .filter(s => s && s.isInitialized)
      .map(s => ({
        sectionId: s.id,
        isInitialized: s.isInitialized,
        isComplete: s.isComplete,
        isActive: state.sections.activeSectionId === s.id,
        groupType: s.groupType,
        groupId: s.groupId
      })),

  /** Verifica si una sección está completa */
  isSectionComplete: (state: ProjectState, sectionId: string): boolean => 
    state.sections.byId[sectionId]?.isComplete ?? false,

  // === CAMPOS ===
  
  /** Obtiene un campo específico */
  getField: (state: ProjectState, sectionId: string, groupId: string | null, fieldName: string): FormField | null => {
    const key = generateFieldKey(sectionId, groupId, fieldName);
    const entry = state.fields.byKey[key];
    if (!entry) return null;
    return {
      key,
      value: entry.state.value,
      source: entry.state.source,
      touched: entry.state.touched,
      lastModified: entry.state.lastModified
    };
  },

  /** Obtiene el valor de un campo */
  getFieldValue: (state: ProjectState, sectionId: string, groupId: string | null, fieldName: string): any => {
    const key = generateFieldKey(sectionId, groupId, fieldName);
    return state.fields.byKey[key]?.state.value ?? null;
  },

  /** Obtiene todos los campos de una sección */
  getSectionFields: (state: ProjectState, sectionId: string, groupId: string | null): FormField[] => {
    const prefix = groupId ? `${sectionId}::${groupId}::` : `${sectionId}::`;
    return state.fields.allKeys
      .filter(key => key.startsWith(prefix))
      .map(key => {
        const entry = state.fields.byKey[key];
        return {
          key,
          value: entry.state.value,
          source: entry.state.source,
          touched: entry.state.touched,
          lastModified: entry.state.lastModified
        };
      });
  },

  /** Obtiene campos como objeto para formulario */
  getSectionFieldsAsObject: (state: ProjectState, sectionId: string, groupId: string | null): Record<string, any> => {
    const prefix = groupId ? `${sectionId}::${groupId}::` : `${sectionId}::`;
    const result: Record<string, any> = {};
    
    for (const key of state.fields.allKeys) {
      if (key.startsWith(prefix)) {
        const fieldName = key.replace(prefix, '');
        result[fieldName] = state.fields.byKey[key]?.state.value ?? null;
      }
    }
    
    return result;
  },

  /** Verifica si algún campo de la sección fue tocado */
  hasTouchedFields: (state: ProjectState, sectionId: string): boolean => {
    const prefix = `${sectionId}::`;
    return state.fields.allKeys
      .filter(key => key.startsWith(prefix))
      .some(key => state.fields.byKey[key]?.state.touched);
  },

  // === TABLAS ===
  
  /** Obtiene una tabla específica */
  getTable: (state: ProjectState, sectionId: string, groupId: string | null, tableKey: string): UITableRow[] => {
    const key = generateTableKey(sectionId, groupId, tableKey);
    const table = state.tables.byKey[key];
    if (!table) return [];
    return table.state.rows.map((row, index) => ({
      rowId: row.id,
      data: { ...row.data },
      order: index
    }));
  },

  /** Obtiene filas de tabla como array de datos */
  getTableData: (state: ProjectState, sectionId: string, groupId: string | null, tableKey: string): any[] => {
    const key = generateTableKey(sectionId, groupId, tableKey);
    const table = state.tables.byKey[key];
    if (!table) return [];
    return table.state.rows.map(row => ({ ...row.data }));
  },

  /** Cuenta filas de una tabla */
  getTableRowCount: (state: ProjectState, sectionId: string, groupId: string | null, tableKey: string): number => {
    const key = generateTableKey(sectionId, groupId, tableKey);
    return state.tables.byKey[key]?.state.rows.length ?? 0;
  },

  /** Verifica si una tabla existe y tiene datos */
  hasTableData: (state: ProjectState, sectionId: string, groupId: string | null, tableKey: string): boolean => {
    const key = generateTableKey(sectionId, groupId, tableKey);
    const table = state.tables.byKey[key];
    return table !== undefined && table.state.rows.length > 0;
  },

  // === IMÁGENES ===
  
  /** Obtiene todas las imágenes de una sección */
  getSectionImages: (state: ProjectState, sectionId: string, groupId: string | null): GalleryImage[] => {
    const key = generateImageGroupKey(sectionId, groupId);
    const imageIds = state.images.bySectionGroup[key] || [];
    return imageIds.map(id => {
      const img = state.images.byId[id];
      if (!img) return null;
      return {
        id: img.id,
        numero: img.numero,
        titulo: img.titulo,
        fuente: img.fuente,
        preview: img.preview,
        uploadStatus: img.uploadStatus
      };
    }).filter((img): img is GalleryImage => img !== null);
  },

  /** Obtiene el siguiente número de imagen global */
  getNextImageNumber: (state: ProjectState): number => 
    state.images.allIds.length + 1,

  /** Cuenta imágenes de una sección */
  getSectionImageCount: (state: ProjectState, sectionId: string, groupId: string | null): number => {
    const key = generateImageGroupKey(sectionId, groupId);
    return state.images.bySectionGroup[key]?.length ?? 0;
  },

  /** Obtiene una imagen específica */
  getImage: (state: ProjectState, imageId: string): GalleryImage | null => {
    const img = state.images.byId[imageId];
    if (!img) return null;
    return {
      id: img.id,
      numero: img.numero,
      titulo: img.titulo,
      fuente: img.fuente,
      preview: img.preview,
      uploadStatus: img.uploadStatus
    };
  },

  // === GLOBAL REGISTRY ===
  
  /** Obtiene la ubicación del proyecto */
  getUbicacion: (state: ProjectState): UbicacionInfo => ({
    departamento: state.globalRegistry.ubicacion.departamento,
    provincia: state.globalRegistry.ubicacion.provincia,
    distrito: state.globalRegistry.ubicacion.distrito
  }),

  /** Obtiene los entrevistados */
  getEntrevistados: (state: ProjectState): readonly Entrevistado[] => 
    state.globalRegistry.entrevistados,

  // === UTILIDADES ===
  
  /** Verifica si el proyecto está cargado */
  isProjectLoaded: (state: ProjectState): boolean => 
    state._internal.loadedFrom !== null,

  /** Obtiene la fuente de carga del proyecto */
  getLoadSource: (state: ProjectState): 'storage' | 'api' | 'fresh' | null => 
    state._internal.loadedFrom,

  /** Obtiene snapshot del estado completo (solo para debug) */
  _getDebugSnapshot: (state: ProjectState): ProjectState => 
    JSON.parse(JSON.stringify(state))
};

// ============================================================================
// COMMAND BUILDERS (Fábricas para comandos - Aseguran tipado correcto)
// ============================================================================

/**
 * COMMAND BUILDERS
 * 
 * La UI usa estos builders para crear comandos tipados.
 * Esto previene errores de tipado y centraliza la creación de comandos.
 */
export const Commands = {
  // === METADATA ===
  
  setProjectName: (projectName: string): MetadataCommand => ({
    type: 'metadata/setProjectName',
    payload: { projectName }
  }),

  setConsultora: (consultora: string): MetadataCommand => ({
    type: 'metadata/setConsultora',
    payload: { consultora }
  }),

  setDetalleProyecto: (detalleProyecto: string): MetadataCommand => ({
    type: 'metadata/setDetalleProyecto',
    payload: { detalleProyecto }
  }),

  updateMetadata: (updates: Partial<ProjectMetadata>): MetadataCommand => ({
    type: 'metadata/update',
    payload: updates as any
  }),

  // === GRUPOS ===
  
  addGroup: (
    tipo: 'AISD' | 'AISI',
    nombre: string,
    parentId: string | null = null,
    ccppIds: string[] = []
  ): GroupConfigCommand => ({
    type: 'groupConfig/addGroup',
    payload: { tipo, nombre, parentId, ccppIds }
  }),

  removeGroup: (
    tipo: 'AISD' | 'AISI',
    groupId: string,
    cascade: boolean = false
  ): GroupConfigCommand => ({
    type: 'groupConfig/removeGroup',
    payload: { tipo, groupId, cascade }
  }),

  renameGroup: (
    tipo: 'AISD' | 'AISI',
    groupId: string,
    nuevoNombre: string
  ): GroupConfigCommand => ({
    type: 'groupConfig/renameGroup',
    payload: { tipo, groupId, nuevoNombre }
  }),

  reorderGroups: (
    tipo: 'AISD' | 'AISI',
    orderedIds: string[]
  ): GroupConfigCommand => ({
    type: 'groupConfig/reorderGroups',
    payload: { tipo, orderedIds }
  }),

  // === SECCIONES ===
  
  initializeSection: (
    sectionId: string,
    groupType: GroupType = 'NONE',
    groupId: string | null = null
  ): SectionCommand => ({
    type: 'section/initialize',
    payload: { sectionId, groupType, groupId }
  }),

  setActiveSection: (sectionId: string): SectionCommand => ({
    type: 'section/setActive',
    payload: { sectionId }
  }),

  markSectionComplete: (sectionId: string, isComplete: boolean = true): SectionCommand => ({
    type: 'section/markComplete',
    payload: { sectionId, isComplete }
  }),

  resetSection: (sectionId: string, preserveStructure: boolean = false): SectionCommand => ({
    type: 'section/reset',
    payload: { sectionId, preserveStructure }
  }),

  assignSectionToGroup: (sectionId: string, groupId: string): SectionCommand => ({
    type: 'section/assignToGroup',
    payload: { sectionId, groupId }
  }),

  // === CAMPOS ===
  
  setField: (
    sectionId: string,
    groupId: string | null,
    fieldName: string,
    value: any,
    source: 'user' | 'api' | 'computed' | 'default' = 'user'
  ): FieldCommand => ({
    type: 'field/set',
    payload: { sectionId, groupId, fieldName, value, source }
  }),

  setFields: (
    sectionId: string,
    groupId: string | null,
    fields: Array<{ fieldName: string; value: any; source?: 'user' | 'api' | 'computed' | 'default' }>
  ): FieldCommand => ({
    type: 'field/setMultiple',
    payload: { 
      sectionId, 
      groupId, 
      fields: fields.map(f => ({ ...f, source: f.source || 'user' }))
    }
  }),

  clearField: (
    sectionId: string,
    groupId: string | null,
    fieldName: string
  ): FieldCommand => ({
    type: 'field/clear',
    payload: { sectionId, groupId, fieldName }
  }),

  clearSectionFields: (sectionId: string, groupId: string | null = null): FieldCommand => ({
    type: 'field/clearSection',
    payload: { sectionId, groupId }
  }),

  touchField: (
    sectionId: string,
    groupId: string | null,
    fieldName: string
  ): FieldCommand => ({
    type: 'field/touch',
    payload: { sectionId, groupId, fieldName }
  }),

  // === TABLAS ===
  
  setTableData: (
    sectionId: string,
    groupId: string | null,
    tableKey: string,
    rows: Array<{ data: Record<string, any> }>,
    config: { totalKey: string; campoTotal: string; campoPorcentaje?: string } = { totalKey: 'total', campoTotal: 'casos' }
  ): TableCommand => ({
    type: 'table/setData',
    payload: { sectionId, groupId, tableKey, rows, config }
  }),

  addTableRow: (
    sectionId: string,
    groupId: string | null,
    tableKey: string,
    data: Record<string, any>,
    insertAt?: number
  ): TableCommand => ({
    type: 'table/addRow',
    payload: { sectionId, groupId, tableKey, data, insertAt }
  }),

  updateTableRow: (
    sectionId: string,
    groupId: string | null,
    tableKey: string,
    rowId: string,
    data: Partial<Record<string, any>>
  ): TableCommand => ({
    type: 'table/updateRow',
    payload: { sectionId, groupId, tableKey, rowId, data }
  }),

  removeTableRow: (
    sectionId: string,
    groupId: string | null,
    tableKey: string,
    rowId: string
  ): TableCommand => ({
    type: 'table/removeRow',
    payload: { sectionId, groupId, tableKey, rowId }
  }),

  reorderTableRows: (
    sectionId: string,
    groupId: string | null,
    tableKey: string,
    orderedRowIds: string[]
  ): TableCommand => ({
    type: 'table/reorderRows',
    payload: { sectionId, groupId, tableKey, orderedRowIds }
  }),

  clearTable: (
    sectionId: string,
    groupId: string | null,
    tableKey: string
  ): TableCommand => ({
    type: 'table/clear',
    payload: { sectionId, groupId, tableKey }
  }),

  // === IMÁGENES ===
  
  addImage: (
    sectionId: string,
    groupId: string | null,
    titulo: string,
    fuente: string,
    preview?: string,
    localPath?: string
  ): ImageCommand => ({
    type: 'image/add',
    payload: { 
      sectionId, 
      groupId, 
      titulo, 
      fuente, 
      preview: preview || null,
      localPath: localPath || null
    }
  }),

  updateImage: (
    imageId: string,
    changes: { titulo?: string; fuente?: string; preview?: string }
  ): ImageCommand => ({
    type: 'image/update',
    payload: { imageId, changes }
  }),

  removeImage: (imageId: string): ImageCommand => ({
    type: 'image/remove',
    payload: { imageId }
  }),

  reorderImages: (
    sectionId: string,
    groupId: string | null,
    orderedImageIds: string[]
  ): ImageCommand => ({
    type: 'image/reorder',
    payload: { sectionId, groupId, orderedImageIds }
  }),

  setImageUploadStatus: (
    imageId: string,
    status: 'pending' | 'uploaded' | 'error',
    backendId?: string
  ): ImageCommand => ({
    type: 'image/setUploadStatus',
    payload: { imageId, status, backendId }
  }),

  clearSectionImages: (sectionId: string, groupId: string | null = null): ImageCommand => ({
    type: 'image/clearSection',
    payload: { sectionId, groupId }
  }),

  // === PROYECTO ===
  
  loadProject: (data: any, source: 'storage' | 'api'): ProjectCommand => ({
    type: 'project/load',
    payload: { data, source }
  }),

  /**
   * Carga datos JSON desde archivo importado.
   * @param fileContent - Contenido JSON parseado del archivo
   * @param projectName - Nombre del proyecto (requerido)
   * @param fileName - Nombre del archivo original (opcional, para metadata)
   */
  loadJsonData: (fileContent: unknown, projectName: string, fileName?: string): ProjectCommand => ({
    type: 'project/loadJsonData',
    payload: { fileContent, projectName, fileName }
  }),

  clearProject: (preserveMetadata: boolean = false): ProjectCommand => ({
    type: 'project/clear',
    payload: { preserveMetadata }
  }),

  markProjectSaved: (): ProjectCommand => ({
    type: 'project/markSaved',
    payload: { timestamp: Date.now() }
  }),

  setUbicacion: (
    departamento?: string,
    provincia?: string,
    distrito?: string
  ): ProjectCommand => ({
    type: 'project/setUbicacion',
    payload: { departamento, provincia, distrito }
  }),

  addEntrevistado: (nombre: string, cargo: string, organizacion: string): ProjectCommand => ({
    type: 'project/addEntrevistado',
    payload: { nombre, cargo, organizacion }
  }),

  removeEntrevistado: (index: number): ProjectCommand => ({
    type: 'project/removeEntrevistado',
    payload: { index }
  }),

  // === BATCH ===
  
  batch: (commands: ProjectStateCommand[], transactionId?: string): BatchCommand => ({
    type: 'batch/execute',
    payload: { 
      commands, 
      transactionId: transactionId || `batch_${Date.now()}` 
    }
  })
};

// ============================================================================
// STORE SERVICE (Servicio Angular para conectar UI con State)
// ============================================================================

/**
 * UIStoreService
 * 
 * Servicio singleton que conecta la UI con el sistema de estado.
 * Usa Angular Signals para reactividad.
 */
@Injectable({ providedIn: 'root' })
export class UIStoreService {
  /** Estado interno (privado - UI no accede directamente) */
  private readonly _state = signal<ProjectState>(createInitialState());

  /** Estado como signal readonly (para selectores) */
  readonly state = this._state.asReadonly();

  /**
   * Selecciona datos del estado usando un selector.
   * Retorna un Signal que se actualiza automáticamente.
   */
  select<T>(selector: (state: ProjectState) => T): Signal<T> {
    return computed(() => selector(this._state()));
  }

  /**
   * Selecciona datos usando un selector con argumentos.
   */
  selectWith<T, A extends any[]>(
    selector: (state: ProjectState, ...args: A) => T,
    ...args: A
  ): Signal<T> {
    return computed(() => selector(this._state(), ...args));
  }

  /**
   * Despacha un comando al store.
   */
  dispatch(command: ProjectStateCommand): void {
    const currentState = this._state();
    const newState = rootReducer(currentState, command);
    this._state.set(newState);
  }

  /**
   * Despacha múltiples comandos como batch.
   */
  dispatchBatch(commands: ProjectStateCommand[], transactionId?: string): void {
    this.dispatch(Commands.batch(commands, transactionId));
  }

  /**
   * Obtiene un snapshot del estado actual.
   */
  getSnapshot(): ProjectState {
    return this._state();
  }

  /**
   * Resetea el store al estado inicial.
   */
  reset(): void {
    this._state.set(createInitialState());
  }

  /**
   * Carga un estado completo (para hidratación desde storage).
   */
  hydrate(state: ProjectState): void {
    this._state.set(state);
  }
}

// ============================================================================
// TYPE GUARDS Y UTILIDADES PARA UI
// ============================================================================

/** Verifica si un valor es un campo válido */
export function isValidField(field: FormField | null): field is FormField {
  return field !== null && field.value !== undefined;
}

/** Verifica si una sección está lista para edición */
export function isSectionEditable(section: SectionNavItem | null): boolean {
  return section !== null && section.isInitialized && !section.isComplete;
}

/** Crea un ID único para elementos UI */
export function createUIElementId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Re-export Entrevistado for facade
export type { Entrevistado };
