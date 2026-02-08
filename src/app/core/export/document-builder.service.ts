/**
 * DOCUMENT BUILDER - PASO 8.2
 * 
 * Construye el documento exportable usando SOLO selectores.
 * 
 * PRINCIPIOS:
 * 1. NO lee ProjectState directamente
 * 2. USA los selectores del UIStoreContract
 * 3. Orden jerárquico del documento
 * 4. Funciones puras (sin side-effects)
 */

import { Injectable, inject } from '@angular/core';
import { ProjectState } from '../state/project-state.model';
import { Selectors, UIStoreService, GroupOption, FormField, GalleryImage } from '../state/ui-store.contract';
import { TableNumberingService } from '../services/table-numbering.service';
import {
  ExportedDocument,
  ExportProjectInfo,
  ExportUbicacion,
  ExportGroup,
  ExportEntrevistado,
  ExportSection,
  ExportField,
  ExportTable,
  ExportTableRow,
  ExportImage,
  ExportOptions,
  ExportMetadata,
  DEFAULT_EXPORT_OPTIONS,
  generateContentHash,
  createExportMetadata
} from './export.contract';

// ============================================================================
// DOCUMENT BUILDER SERVICE
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class DocumentBuilderService {
  private readonly store = inject(UIStoreService);
  private readonly tableNumbering = inject(TableNumberingService);
  
  /**
   * Construye el documento exportable completo.
   * Usa el snapshot actual del store.
   */
  build(options: Partial<ExportOptions> = {}): ExportedDocument {
    const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
    const state = this.store.getSnapshot();
    return buildDocument(state, opts, this.tableNumbering);
  }
  
  /**
   * Construye documento desde un state específico.
   * Útil para tests y preview.
   */
  buildFromState(state: ProjectState, options: Partial<ExportOptions> = {}): ExportedDocument {
    const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
    return buildDocument(state, opts, this.tableNumbering);
  }
}

// ============================================================================
// PURE BUILDER FUNCTIONS (Usan selectores)
// ============================================================================

/**
 * Función principal de construcción - usa solo selectores.
 */
export function buildDocument(state: ProjectState, options: ExportOptions, tableNumbering: TableNumberingService): ExportedDocument {
  // 1. Construir cada sección del documento
  const project = buildProjectInfo(state);
  const ubicacion = buildUbicacion(state);
  const aisd = buildGroups(state, 'AISD', options);
  const aisi = buildGroups(state, 'AISI', options);
  const entrevistados = buildEntrevistados(state);
  const sections = buildSections(state, options, tableNumbering);
  
  // 2. Crear documento sin metadatos de export todavía
  const docWithoutMeta = {
    project,
    ubicacion,
    aisd,
    aisi,
    entrevistados,
    sections
  };
  
  // 3. Generar hash del contenido
  const contentHash = generateContentHash(JSON.stringify(docWithoutMeta));
  
  // 4. Crear metadatos
  const _export = createExportMetadata(options.format, contentHash);
  
  return {
    _export,
    ...docWithoutMeta
  };
}

/**
 * Construye información del proyecto usando selectores.
 */
function buildProjectInfo(state: ProjectState): ExportProjectInfo {
  const info = Selectors.getProjectInfo(state);
  
  return {
    projectId: state.metadata.projectId, // OK porque Selectors.getProjectInfo no lo incluye
    projectName: info.projectName,
    consultora: info.consultora,
    detalleProyecto: info.detalleProyecto,
    createdAt: state.metadata.createdAt,
    updatedAt: state.metadata.updatedAt
  };
}

/**
 * Construye ubicación usando selectores.
 */
function buildUbicacion(state: ProjectState): ExportUbicacion {
  const ubicacion = Selectors.getUbicacion(state);
  return {
    departamento: ubicacion.departamento,
    provincia: ubicacion.provincia,
    distrito: ubicacion.distrito
  };
}

/**
 * Construye grupos usando selectores.
 */
function buildGroups(
  state: ProjectState, 
  tipo: 'AISD' | 'AISI',
  options: ExportOptions
): readonly ExportGroup[] {
  const groups = tipo === 'AISD' 
    ? Selectors.getAISDGroups(state)
    : Selectors.getAISIGroups(state);
  
  // Aplicar filtro si existe
  let filtered = groups;
  if (options.groupsFilter) {
    filtered = groups.filter(g => options.groupsFilter!.includes(g.id));
  }
  
  return filtered.map(g => ({
    id: g.id,
    nombre: g.nombre,
    parentId: g.parentId,
    level: g.level
  }));
}

/**
 * Construye entrevistados usando selectores.
 */
function buildEntrevistados(state: ProjectState): readonly ExportEntrevistado[] {
  const entrevistados = Selectors.getEntrevistados(state);
  
  return entrevistados.map(e => ({
    nombre: e.nombre || '',
    cargo: e.cargo || '',
    telefono: (e as any).telefono || (e as any).organizacion || '',
    email: (e as any).email || ''
  }));
}

/**
 * Construye secciones usando selectores.
 */
function buildSections(
  state: ProjectState,
  options: ExportOptions,
  tableNumbering: TableNumberingService
): readonly ExportSection[] {
  const initializedSections = Selectors.getInitializedSections(state);
  
  // Aplicar filtro si existe
  let filtered = initializedSections;
  if (options.sectionsFilter) {
    filtered = initializedSections.filter(s => 
      options.sectionsFilter!.includes(s.sectionId)
    );
  }
  
  return filtered.map(nav => 
    buildSection(state, nav.sectionId, nav.groupId, nav.groupType, options, tableNumbering)
  );
}

/**
 * Construye una sección individual.
 */
function buildSection(
  state: ProjectState,
  sectionId: string,
  groupId: string | null,
  groupType: string,
  options: ExportOptions,
  tableNumbering: TableNumberingService
): ExportSection {
  // Obtener nombre del grupo si aplica
  let groupName: string | null = null;
  if (groupId && (groupType === 'AISD' || groupType === 'AISI')) {
    const group = Selectors.getGroup(state, groupType, groupId);
    groupName = group?.nombre || null;
  }
  
  // Construir campos
  const fields = buildFields(state, sectionId, groupId, options);
  
  // Construir tablas
  const tables = buildTables(state, sectionId, groupId, options, tableNumbering);
  
  // Construir imágenes
  const images = buildImages(state, sectionId, groupId, options);
  
  return {
    sectionId,
    groupType: groupType as 'AISD' | 'AISI' | 'NINGUNO',
    groupId,
    groupName,
    fields,
    tables,
    images
  };
}

/**
 * Construye campos de una sección.
 */
function buildFields(
  state: ProjectState,
  sectionId: string,
  groupId: string | null,
  options: ExportOptions
): readonly ExportField[] {
  const formFields = Selectors.getSectionFields(state, sectionId, groupId);
  
  // Extraer nombre del campo de la key
  const fields = formFields.map(f => {
    const parts = f.key.split('::');
    const fieldName = parts[parts.length - 1];
    return {
      fieldName,
      value: f.value,
      source: f.source
    };
  });
  
  // Filtrar vacíos si la opción está deshabilitada
  if (!options.includeEmptyFields) {
    return fields.filter(f => 
      f.value !== null && 
      f.value !== undefined && 
      f.value !== ''
    );
  }
  
  return fields;
}

/**
 * Construye tablas de una sección.
 */
function buildTables(
  state: ProjectState,
  sectionId: string,
  groupId: string | null,
  options: ExportOptions,
  tableNumbering: TableNumberingService
): readonly ExportTable[] {
  // Necesitamos identificar qué tablas pertenecen a esta sección
  // Usando el patrón de keys del state
  const prefix = groupId 
    ? `${sectionId}::${groupId}::` 
    : `${sectionId}::`;
  
  const tableKeys = state.tables.allKeys.filter(k => k.startsWith(prefix));
  
  const tables: ExportTable[] = [];
  let localTableIndex = 0;
  
  for (const fullKey of tableKeys) {
    // Extraer el tableKey del fullKey
    const tableKey = fullKey.replace(prefix, '');
    
    // Usar selector para obtener datos
    const rows = Selectors.getTableData(state, sectionId, groupId, tableKey);
    
    // Filtrar tablas vacías si la opción está deshabilitada
    if (!options.includeEmptyTables && rows.length === 0) {
      continue;
    }
    
    // Calcular número global usando el servicio de numeración
    const tableNumber = tableNumbering.getGlobalTableNumber(sectionId, localTableIndex);
    
    tables.push({
      tableKey,
      tableNumber,
      rows: rows.map((data, index) => ({
        order: index,
        data
      }))
    });
    
    localTableIndex++;
  }
  
  return tables;
}

/**
 * Construye imágenes de una sección.
 */
function buildImages(
  state: ProjectState,
  sectionId: string,
  groupId: string | null,
  options: ExportOptions
): readonly ExportImage[] {
  const galleryImages = Selectors.getSectionImages(state, sectionId, groupId);
  
  return galleryImages.map(img => ({
    id: img.id,
    numero: img.numero,
    titulo: img.titulo,
    fuente: img.fuente,
    data: options.includeImageData ? (img.preview || '') : ''
  }));
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Obtiene estadísticas del documento construido.
 */
export function getDocumentStats(doc: ExportedDocument): DocumentStats {
  const totalFields = doc.sections.reduce((acc, s) => acc + s.fields.length, 0);
  const totalTables = doc.sections.reduce((acc, s) => acc + s.tables.length, 0);
  const totalRows = doc.sections.reduce((acc, s) => 
    acc + s.tables.reduce((t, table) => t + table.rows.length, 0), 0);
  const totalImages = doc.sections.reduce((acc, s) => acc + s.images.length, 0);
  
  return {
    sectionsCount: doc.sections.length,
    fieldsCount: totalFields,
    tablesCount: totalTables,
    rowsCount: totalRows,
    imagesCount: totalImages,
    aisdGroupsCount: doc.aisd.length,
    aisiGroupsCount: doc.aisi.length,
    entrevistadosCount: doc.entrevistados.length
  };
}

export interface DocumentStats {
  readonly sectionsCount: number;
  readonly fieldsCount: number;
  readonly tablesCount: number;
  readonly rowsCount: number;
  readonly imagesCount: number;
  readonly aisdGroupsCount: number;
  readonly aisiGroupsCount: number;
  readonly entrevistadosCount: number;
}

/**
 * Filtra el documento para incluir solo ciertas secciones.
 */
export function filterDocumentSections(
  doc: ExportedDocument,
  sectionIds: string[]
): ExportedDocument {
  return {
    ...doc,
    sections: doc.sections.filter(s => sectionIds.includes(s.sectionId))
  };
}

/**
 * Ordena secciones por un criterio específico.
 */
export function sortDocumentSections(
  doc: ExportedDocument,
  order: readonly string[]
): ExportedDocument {
  const orderMap = new Map(order.map((id, idx) => [id, idx]));
  
  const sortedSections = [...doc.sections].sort((a, b) => {
    const orderA = orderMap.get(a.sectionId) ?? 999;
    const orderB = orderMap.get(b.sectionId) ?? 999;
    return orderA - orderB;
  });
  
  return {
    ...doc,
    sections: sortedSections
  };
}
