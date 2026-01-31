/**
 * SECTION SELECTORS - FASE 2
 * 
 * Selectores para computar numeración global de imágenes y tablas.
 * Implementa el patrón de "Índice Computado" - NO guardamos números "quemados".
 * 
 * REGLA CRÍTICA:
 * La numeración de figuras/tablas se CALCULA en tiempo de lectura,
 * nunca se almacena. Esto garantiza consistencia automática al agregar/eliminar.
 * 
 * FUNCIONES PURAS - sin side effects
 */

import { 
  Section, 
  SectionContent, 
  ImageContent, 
  TableContent,
  SectionsContentState,
  isImageContent,
  isTableContent
} from './section.model';
import { ProjectState } from './project-state.model';

// ============================================================================
// TIPOS PARA SELECTORES
// ============================================================================

/**
 * Imagen con su índice global computado
 */
export interface ImageWithGlobalIndex {
  readonly content: ImageContent;
  readonly sectionId: string;
  readonly globalIndex: number;  // 1-based (Figura 1, Figura 2, etc.)
}

/**
 * Tabla con su índice global computado
 */
export interface TableWithGlobalIndex {
  readonly content: TableContent;
  readonly sectionId: string;
  readonly globalIndex: number;  // 1-based (Tabla 1, Tabla 2, etc.)
}

/**
 * Resumen de contenido por sección
 */
export interface SectionContentSummary {
  readonly sectionId: string;
  readonly sectionTitle: string;
  readonly paragraphCount: number;
  readonly imageCount: number;
  readonly tableCount: number;
  readonly firstImageIndex: number | null;
  readonly firstTableIndex: number | null;
}

// ============================================================================
// SELECTORES BASE
// ============================================================================

/**
 * Obtiene el estado de secciones de contenido del ProjectState
 * NOTA: Asume que ProjectState tiene sectionsContent (agregar en Fase 2)
 */
export function selectSectionsContentState(state: ProjectState & { sectionsContent?: SectionsContentState }): SectionsContentState {
  return state.sectionsContent ?? {
    byId: {},
    sectionOrder: [],
    activeSectionId: null,
    lastModified: 0
  };
}

/**
 * Selecciona una sección por ID
 */
export function selectSectionById(
  sectionsState: SectionsContentState,
  sectionId: string
): Section | undefined {
  return sectionsState.byId[sectionId];
}

/**
 * Selecciona todas las secciones en orden
 */
export function selectAllSectionsOrdered(
  sectionsState: SectionsContentState
): readonly Section[] {
  return sectionsState.sectionOrder
    .map(id => sectionsState.byId[id])
    .filter((s): s is Section => s !== undefined);
}

// ============================================================================
// SELECTORES DE IMÁGENES (NUMERACIÓN GLOBAL)
// ============================================================================

/**
 * SELECTOR CRÍTICO: Obtiene todas las imágenes en orden global.
 * 
 * Recorre secciones en el orden definido por sectionOrder y extrae
 * todas las imágenes manteniendo su orden (orden dentro de la sección).
 * 
 * @param sectionsState - Estado de secciones
 * @returns Lista plana de imágenes con su sectionId
 */
export function selectAllImagesOrdered(
  sectionsState: SectionsContentState
): readonly { content: ImageContent; sectionId: string }[] {
  const images: { content: ImageContent; sectionId: string }[] = [];
  
  // Recorrer secciones en orden global
  for (const sectionId of sectionsState.sectionOrder) {
    const section = sectionsState.byId[sectionId];
    if (!section) continue;
    
    // Extraer imágenes de la sección, ordenadas por su campo 'orden'
    const sectionImages = section.contents
      .filter(isImageContent)
      .sort((a, b) => a.orden - b.orden);
    
    for (const img of sectionImages) {
      images.push({ content: img, sectionId });
    }
  }
  
  return images;
}

/**
 * SELECTOR PARAMETRIZADO CRÍTICO: Obtiene el índice global de una imagen.
 * 
 * Este selector es el corazón de la numeración automática.
 * Al agregar/eliminar imágenes ANTES de esta, el índice cambia automáticamente.
 * 
 * @param sectionsState - Estado de secciones
 * @param imageId - ID de la imagen
 * @returns Número de figura (1-based) o null si no se encuentra
 * 
 * @example
 * // Si hay 3 imágenes antes de esta imagen
 * const index = getImageGlobalIndex(state, 'img_123');
 * // index === 4 (es la cuarta figura)
 */
export function getImageGlobalIndex(
  sectionsState: SectionsContentState,
  imageId: string
): number | null {
  const allImages = selectAllImagesOrdered(sectionsState);
  
  const index = allImages.findIndex(img => img.content.id === imageId);
  
  if (index === -1) {
    return null;
  }
  
  // Retornar índice 1-based (Figura 1, no Figura 0)
  return index + 1;
}

/**
 * Obtiene todas las imágenes con sus índices globales
 */
export function selectAllImagesWithGlobalIndex(
  sectionsState: SectionsContentState
): readonly ImageWithGlobalIndex[] {
  const allImages = selectAllImagesOrdered(sectionsState);
  
  return allImages.map((img, index) => ({
    content: img.content,
    sectionId: img.sectionId,
    globalIndex: index + 1
  }));
}

/**
 * Obtiene imágenes de una sección específica con sus índices globales
 */
export function selectSectionImagesWithGlobalIndex(
  sectionsState: SectionsContentState,
  sectionId: string
): readonly ImageWithGlobalIndex[] {
  const allImagesWithIndex = selectAllImagesWithGlobalIndex(sectionsState);
  return allImagesWithIndex.filter(img => img.sectionId === sectionId);
}

/**
 * Cuenta el total de imágenes en el documento
 */
export function selectTotalImageCount(sectionsState: SectionsContentState): number {
  return selectAllImagesOrdered(sectionsState).length;
}

// ============================================================================
// SELECTORES DE TABLAS (NUMERACIÓN GLOBAL)
// ============================================================================

/**
 * Obtiene todas las tablas en orden global
 */
export function selectAllTablesOrdered(
  sectionsState: SectionsContentState
): readonly { content: TableContent; sectionId: string }[] {
  const tables: { content: TableContent; sectionId: string }[] = [];
  
  for (const sectionId of sectionsState.sectionOrder) {
    const section = sectionsState.byId[sectionId];
    if (!section) continue;
    
    const sectionTables = section.contents
      .filter(isTableContent)
      .sort((a, b) => a.orden - b.orden);
    
    for (const table of sectionTables) {
      tables.push({ content: table, sectionId });
    }
  }
  
  return tables;
}

/**
 * Obtiene el índice global de una tabla
 */
export function getTableGlobalIndex(
  sectionsState: SectionsContentState,
  tableId: string
): number | null {
  const allTables = selectAllTablesOrdered(sectionsState);
  const index = allTables.findIndex(t => t.content.id === tableId);
  return index === -1 ? null : index + 1;
}

/**
 * Obtiene todas las tablas con sus índices globales
 */
export function selectAllTablesWithGlobalIndex(
  sectionsState: SectionsContentState
): readonly TableWithGlobalIndex[] {
  const allTables = selectAllTablesOrdered(sectionsState);
  
  return allTables.map((t, index) => ({
    content: t.content,
    sectionId: t.sectionId,
    globalIndex: index + 1
  }));
}

/**
 * Cuenta el total de tablas
 */
export function selectTotalTableCount(sectionsState: SectionsContentState): number {
  return selectAllTablesOrdered(sectionsState).length;
}

// ============================================================================
// SELECTORES DE NAVEGACIÓN
// ============================================================================

/**
 * Obtiene la sección activa
 */
export function selectActiveSection(
  sectionsState: SectionsContentState
): Section | null {
  if (!sectionsState.activeSectionId) return null;
  return sectionsState.byId[sectionsState.activeSectionId] ?? null;
}

/**
 * Obtiene la sección siguiente a la activa
 */
export function selectNextSection(
  sectionsState: SectionsContentState
): Section | null {
  if (!sectionsState.activeSectionId) return null;
  
  const currentIndex = sectionsState.sectionOrder.indexOf(sectionsState.activeSectionId);
  if (currentIndex === -1 || currentIndex >= sectionsState.sectionOrder.length - 1) {
    return null;
  }
  
  const nextId = sectionsState.sectionOrder[currentIndex + 1];
  return sectionsState.byId[nextId] ?? null;
}

/**
 * Obtiene la sección anterior a la activa
 */
export function selectPreviousSection(
  sectionsState: SectionsContentState
): Section | null {
  if (!sectionsState.activeSectionId) return null;
  
  const currentIndex = sectionsState.sectionOrder.indexOf(sectionsState.activeSectionId);
  if (currentIndex <= 0) {
    return null;
  }
  
  const prevId = sectionsState.sectionOrder[currentIndex - 1];
  return sectionsState.byId[prevId] ?? null;
}

// ============================================================================
// SELECTORES DE RESUMEN
// ============================================================================

/**
 * Obtiene resumen de contenido por sección
 */
export function selectSectionContentSummary(
  sectionsState: SectionsContentState,
  sectionId: string
): SectionContentSummary | null {
  const section = sectionsState.byId[sectionId];
  if (!section) return null;
  
  const images = selectSectionImagesWithGlobalIndex(sectionsState, sectionId);
  const tables = selectAllTablesWithGlobalIndex(sectionsState)
    .filter(t => t.sectionId === sectionId);
  const paragraphs = section.contents.filter(c => c.type === 'PARAGRAPH');
  
  return {
    sectionId,
    sectionTitle: section.title,
    paragraphCount: paragraphs.length,
    imageCount: images.length,
    tableCount: tables.length,
    firstImageIndex: images.length > 0 ? images[0].globalIndex : null,
    firstTableIndex: tables.length > 0 ? tables[0].globalIndex : null
  };
}

/**
 * Obtiene resumen de contenido de todas las secciones
 */
export function selectAllSectionsSummary(
  sectionsState: SectionsContentState
): readonly SectionContentSummary[] {
  return sectionsState.sectionOrder
    .map(id => selectSectionContentSummary(sectionsState, id))
    .filter((s): s is SectionContentSummary => s !== null);
}

// ============================================================================
// SELECTORES DE BÚSQUEDA
// ============================================================================

/**
 * Busca una imagen por ID y retorna su información completa
 */
export function selectImageById(
  sectionsState: SectionsContentState,
  imageId: string
): ImageWithGlobalIndex | null {
  const allImages = selectAllImagesWithGlobalIndex(sectionsState);
  return allImages.find(img => img.content.id === imageId) ?? null;
}

/**
 * Busca una tabla por ID y retorna su información completa
 */
export function selectTableById(
  sectionsState: SectionsContentState,
  tableId: string
): TableWithGlobalIndex | null {
  const allTables = selectAllTablesWithGlobalIndex(sectionsState);
  return allTables.find(t => t.content.id === tableId) ?? null;
}

// ============================================================================
// SELECTORES DE VALIDACIÓN
// ============================================================================

/**
 * Verifica si todas las secciones tienen contenido mínimo
 */
export function selectSectionsCompleteness(
  sectionsState: SectionsContentState
): { complete: number; incomplete: number; total: number } {
  let complete = 0;
  let incomplete = 0;
  
  for (const sectionId of sectionsState.sectionOrder) {
    const section = sectionsState.byId[sectionId];
    if (!section) continue;
    
    if (section.contents.length > 0) {
      complete++;
    } else {
      incomplete++;
    }
  }
  
  return {
    complete,
    incomplete,
    total: complete + incomplete
  };
}

/**
 * Obtiene secciones sin contenido
 */
export function selectEmptySections(
  sectionsState: SectionsContentState
): readonly Section[] {
  return sectionsState.sectionOrder
    .map(id => sectionsState.byId[id])
    .filter((s): s is Section => s !== undefined && s.contents.length === 0);
}
