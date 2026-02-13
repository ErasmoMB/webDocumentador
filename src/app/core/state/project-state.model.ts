/**
 * PROJECT STATE MODEL
 * 
 * Tipos para el estado unificado del proyecto.
 * Define la estructura completa del ProjectState según el diseño de PASO 2.
 * 
 * REGLAS:
 * - Todas las interfaces son inmutables (readonly donde aplica)
 * - IDs son strings para consistencia
 * - Timestamps son números (epoch ms)
 * - Arrays vacíos por defecto, nunca null/undefined
 */

import { GroupType } from '../models/section-config.model';
import { CCPP } from '../models/group-config.model';
import { Fotografia, Entrevistado, TablaItem } from '../models/formulario.model';

// ============================================================================
// METADATA
// ============================================================================

export interface ProjectMetadata {
  readonly projectId: string;
  readonly projectName: string;
  readonly consultora: string;
  readonly detalleProyecto: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly version: string;
  
  // ✅ NUEVO: Ubicación global (seleccionada en S1)
  // Estos datos se replican a TODAS las secciones
  readonly departamentoSeleccionado: string;
  readonly provinciaSeleccionada: string;
  readonly distritoSeleccionado: string;
}

export const INITIAL_PROJECT_METADATA: ProjectMetadata = {
  projectId: '',
  projectName: '',
  consultora: '',
  detalleProyecto: '',
  createdAt: 0,
  updatedAt: 0,
  version: '1.0.0',
  
  // ✅ NUEVO: Ubicación vacía
  departamentoSeleccionado: '',
  provinciaSeleccionada: '',
  distritoSeleccionado: ''
};

// ============================================================================
// GROUP CONFIGURATION
// ============================================================================

export interface GroupDefinition {
  readonly id: string;           // 'A', 'A.1', 'A.1.1'
  readonly nombre: string;
  readonly tipo: GroupType;      // 'AISD' | 'AISI'
  readonly parentId: string | null;
  readonly orden: number;
  readonly ccppIds: readonly string[];
}

export interface GroupConfigState {
  readonly aisd: readonly GroupDefinition[];
  readonly aisi: readonly GroupDefinition[];
  readonly lastUpdated: number;
}

export const INITIAL_GROUP_CONFIG: GroupConfigState = {
  aisd: [],
  aisi: [],
  lastUpdated: 0
};

// ============================================================================
// CCPP REGISTRY
// ============================================================================

export interface CCPPEntry extends CCPP {
  readonly id: string;
}

export interface CCPPRegistry {
  readonly byId: Readonly<Record<string, CCPPEntry>>;
  readonly allIds: readonly string[];
}

export const INITIAL_CCPP_REGISTRY: CCPPRegistry = {
  byId: {},
  allIds: []
};

// ============================================================================
// SECTIONS
// ============================================================================

export interface SectionState {
  readonly id: string;
  readonly isInitialized: boolean;
  readonly isComplete: boolean;
  readonly groupId: string | null;
  readonly groupType: GroupType;
  readonly lastModified: number;
}

export interface SectionsState {
  readonly byId: Readonly<Record<string, SectionState>>;
  readonly allIds: readonly string[];
  readonly activeSectionId: string | null;
}

export const INITIAL_SECTIONS_STATE: SectionsState = {
  byId: {},
  allIds: [],
  activeSectionId: null
};

// ============================================================================
// FIELDS
// ============================================================================

export type FieldValue = string | number | boolean | null | readonly any[];

export interface FieldState {
  readonly value: FieldValue;
  readonly touched: boolean;
  readonly dirty: boolean;
  readonly autoloaded: boolean;
  readonly source: 'user' | 'api' | 'default' | 'computed';
  readonly lastModified: number;
}

export interface FieldEntry {
  readonly sectionId: string;
  readonly groupId: string | null;
  readonly fieldName: string;
  readonly state: FieldState;
}

export interface FieldsState {
  readonly byKey: Readonly<Record<string, FieldEntry>>;
  readonly allKeys: readonly string[];
}

export const INITIAL_FIELDS_STATE: FieldsState = {
  byKey: {},
  allKeys: []
};

// Helper para generar claves de campo únicas
export function generateFieldKey(sectionId: string, groupId: string | null, fieldName: string): string {
  return groupId 
    ? `${sectionId}::${groupId}::${fieldName}`
    : `${sectionId}::${fieldName}`;
}

export function parseFieldKey(key: string): { sectionId: string; groupId: string | null; fieldName: string } {
  const parts = key.split('::');
  if (parts.length === 3) {
    return { sectionId: parts[0], groupId: parts[1], fieldName: parts[2] };
  }
  return { sectionId: parts[0], groupId: null, fieldName: parts[1] };
}

// ============================================================================
// TABLES
// ============================================================================

export interface TableRow {
  readonly id: string;
  readonly orden: number;
  readonly data: Readonly<Record<string, any>>;
}

export interface TableState {
  readonly rows: readonly TableRow[];
  readonly totalKey: string;
  readonly campoTotal: string;
  readonly campoPorcentaje: string | null;
  readonly lastModified: number;
}

export interface TableEntry {
  readonly sectionId: string;
  readonly groupId: string | null;
  readonly tableKey: string;
  readonly state: TableState;
}

export interface TablesState {
  readonly byKey: Readonly<Record<string, TableEntry>>;
  readonly allKeys: readonly string[];
}

export const INITIAL_TABLES_STATE: TablesState = {
  byKey: {},
  allKeys: []
};

// Helper para generar claves de tabla únicas
export function generateTableKey(sectionId: string, groupId: string | null, tableKey: string): string {
  return groupId 
    ? `${sectionId}::${groupId}::${tableKey}`
    : `${sectionId}::${tableKey}`;
}

// ============================================================================
// IMAGES
// ============================================================================

export interface ImageEntry {
  readonly id: string;
  readonly sectionId: string;
  readonly groupId: string | null;
  readonly numero: number;
  readonly titulo: string;
  readonly fuente: string;
  readonly preview: string | null;
  readonly uploadStatus: 'pending' | 'uploaded' | 'error';
  readonly backendId: string | null;
  readonly localPath: string | null;
  readonly orden: number;
  readonly lastModified: number;
}

export interface ImagesState {
  readonly byId: Readonly<Record<string, ImageEntry>>;
  readonly allIds: readonly string[];
  readonly bySectionGroup: Readonly<Record<string, readonly string[]>>;
}

export const INITIAL_IMAGES_STATE: ImagesState = {
  byId: {},
  allIds: [],
  bySectionGroup: {}
};

// Helper para generar claves de grupo de imágenes
export function generateImageGroupKey(sectionId: string, groupId: string | null): string {
  return groupId ? `${sectionId}::${groupId}` : sectionId;
}

// ============================================================================
// GLOBAL REGISTRY
// ============================================================================

export interface GlobalRegistryState {
  readonly ubicacion: {
    readonly departamento: string;
    readonly provincia: string;
    readonly distrito: string;
  };
  readonly entrevistados: readonly Entrevistado[];
  readonly comunidadesCampesinas: readonly string[];
  readonly distritos: readonly string[];
}

export const INITIAL_GLOBAL_REGISTRY: GlobalRegistryState = {
  ubicacion: {
    departamento: '',
    provincia: '',
    distrito: ''
  },
  entrevistados: [],
  comunidadesCampesinas: [],
  distritos: []
};

// ============================================================================
// PROJECT STATE (ROOT)
// ============================================================================

export interface ProjectState {
  readonly metadata: ProjectMetadata;
  readonly groupConfig: GroupConfigState;
  readonly ccppRegistry: CCPPRegistry;
  readonly sections: SectionsState;
  readonly fields: FieldsState;
  readonly tables: TablesState;
  readonly images: ImagesState;
  readonly globalRegistry: GlobalRegistryState;
  readonly _internal: {
    readonly isDirty: boolean;
    readonly lastSaved: number;
    readonly loadedFrom: 'storage' | 'api' | 'fresh' | null;
  };
}

export const INITIAL_PROJECT_STATE: ProjectState = {
  metadata: INITIAL_PROJECT_METADATA,
  groupConfig: INITIAL_GROUP_CONFIG,
  ccppRegistry: INITIAL_CCPP_REGISTRY,
  sections: INITIAL_SECTIONS_STATE,
  fields: INITIAL_FIELDS_STATE,
  tables: INITIAL_TABLES_STATE,
  images: INITIAL_IMAGES_STATE,
  globalRegistry: INITIAL_GLOBAL_REGISTRY,
  _internal: {
    isDirty: false,
    lastSaved: 0,
    loadedFrom: null
  }
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidGroupType(value: string): value is GroupType {
  return value === 'AISD' || value === 'AISI' || value === 'BOTH' || value === 'NONE';
}

export function isValidFieldValue(value: unknown): value is FieldValue {
  if (value === null) return true;
  if (typeof value === 'string') return true;
  if (typeof value === 'number') return true;
  if (typeof value === 'boolean') return true;
  if (Array.isArray(value)) return true;
  return false;
}
