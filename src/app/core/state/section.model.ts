/**
 * SECTION MODEL - FASE 2
 * 
 * Modelos para el Motor de Secciones y Numeración Global.
 * Define tipos de contenido (PARAGRAPH, IMAGE, TABLE) y estructura de secciones.
 * 
 * REGLAS:
 * - Todas las interfaces son inmutables (readonly)
 * - IDs son strings para consistencia
 * - Timestamps son números (epoch ms)
 * - Numeración global es COMPUTADA, no almacenada
 */

// ============================================================================
// CONTENT TYPES
// ============================================================================

/**
 * Tipo base de contenido
 */
export type SectionContentType = 'PARAGRAPH' | 'IMAGE' | 'TABLE';

/**
 * Contenido base con propiedades comunes
 */
interface BaseContent {
  readonly id: string;
  readonly type: SectionContentType;
  readonly orden: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}

/**
 * Contenido de tipo párrafo/texto
 */
export interface ParagraphContent extends BaseContent {
  readonly type: 'PARAGRAPH';
  readonly text: string;
  readonly format: 'plain' | 'html' | 'markdown';
}

/**
 * Contenido de tipo imagen
 * NOTA: La numeración global (numero) se COMPUTA via selector, no se almacena
 */
export interface ImageContent extends BaseContent {
  readonly type: 'IMAGE';
  readonly titulo: string;
  readonly fuente: string;
  readonly preview: string | null;
  readonly localPath: string | null;
  readonly backendId: string | null;
  readonly uploadStatus: 'pending' | 'uploaded' | 'error';
}

/**
 * Esquema mínimo para transportar referencias limpias a grupos y centros
 */
export interface TableRowReferenceData {
  readonly groupReferenceId?: string;
  readonly groupReferenceType?: 'AISD' | 'AISI';
  readonly populatedCenterId?: string;
  readonly ubigeoCode?: string;
}

/**
 * Fila de tabla
 */
export interface TableRowData {
  readonly id: string;
  readonly orden: number;
  readonly data: Readonly<TableRowReferenceData & Record<string, unknown>>;
}

/**
 * Contenido de tipo tabla
 * NOTA: La numeración global se COMPUTA via selector
 */
export interface TableContent extends BaseContent {
  readonly type: 'TABLE';
  readonly titulo: string;
  readonly fuente: string;
  readonly rows: readonly TableRowData[];
  readonly columns: readonly string[];
  readonly totalKey: string | null;
  readonly campoTotal: string | null;
}

/**
 * Unión de todos los tipos de contenido
 */
export type SectionContent = ParagraphContent | ImageContent | TableContent;

// ============================================================================
// SECTION DEFINITION
// ============================================================================

/**
 * Tipo de sección según configuración
 */
export type SectionType = 'STATIC' | 'AISD_ROOT' | 'AISD_SUB' | 'AISI_ROOT' | 'AISI_SUB';

/**
 * Definición completa de una sección
 */
export interface Section {
  readonly id: string;                          // "2.1", "a.1.1", "b.2.3"
  readonly title: string;                       // "Generalidades"
  readonly sectionType: SectionType;            // Tipo de sección
  readonly groupId: string | null;              // ID del grupo asociado (si aplica)
  readonly parentId: string | null;             // ID de sección padre (para jerarquía)
  readonly contents: readonly SectionContent[]; // Contenidos de la sección
  readonly orden: number;                       // Orden dentro de su nivel
  readonly isLocked: boolean;                   // ¿Sección protegida?
  readonly createdAt: number;
  readonly updatedAt: number;
}

/**
 * Estado de todas las secciones
 */
export interface SectionsContentState {
  readonly byId: Readonly<Record<string, Section>>;
  readonly sectionOrder: readonly string[];      // Orden global de secciones
  readonly activeSectionId: string | null;
  readonly lastModified: number;
}

/**
 * Estado inicial de secciones de contenido
 */
export const INITIAL_SECTIONS_CONTENT_STATE: SectionsContentState = {
  byId: {},
  sectionOrder: [],
  activeSectionId: null,
  lastModified: 0
};

// ============================================================================
// DEFINICIONES DE SUBSECCIONES
// ============================================================================

/**
 * Subsecciones para AISD (Comunidad) - 20 subsecciones
 */
export const AISD_SUBSECTIONS: readonly { suffix: string; title: string }[] = [
  { suffix: '1', title: 'Características Generales' },
  { suffix: '2', title: 'Ubicación Geográfica' },
  { suffix: '3', title: 'Extensión y Límites' },
  { suffix: '4', title: 'Vías de Comunicación' },
  { suffix: '5', title: 'Clima' },
  { suffix: '6', title: 'Flora y Fauna' },
  { suffix: '7', title: 'Recursos Hídricos' },
  { suffix: '8', title: 'Demografía' },
  { suffix: '9', title: 'Organización Social' },
  { suffix: '10', title: 'Actividades Económicas' },
  { suffix: '11', title: 'Infraestructura Educativa' },
  { suffix: '12', title: 'Infraestructura de Salud' },
  { suffix: '13', title: 'Servicios Básicos' },
  { suffix: '14', title: 'Vivienda' },
  { suffix: '15', title: 'Patrimonio Cultural' },
  { suffix: '16', title: 'Fiestas y Costumbres' },
  { suffix: '17', title: 'Problemática Social' },
  { suffix: '18', title: 'Percepciones del Proyecto' },
  { suffix: '19', title: 'Conclusiones AISD' },
  { suffix: '20', title: 'Anexos AISD' }
];

/**
 * Subsecciones para AISI (Distrito) - 9 subsecciones
 */
export const AISI_SUBSECTIONS: readonly { suffix: string; title: string }[] = [
  { suffix: '1', title: 'Características del Distrito' },
  { suffix: '2', title: 'Organización Política' },
  { suffix: '3', title: 'Demografía Distrital' },
  { suffix: '4', title: 'Actividad Económica Regional' },
  { suffix: '5', title: 'Infraestructura Distrital' },
  { suffix: '6', title: 'Servicios Públicos' },
  { suffix: '7', title: 'Aspectos Ambientales' },
  { suffix: '8', title: 'Percepciones Institucionales' },
  { suffix: '9', title: 'Conclusiones AISI' }
];

/**
 * Secciones estáticas del documento
 */
export const STATIC_SECTIONS: readonly { id: string; title: string; orden: number }[] = [
  { id: '1', title: 'Introducción', orden: 0 },
  { id: '1.1', title: 'Objetivos', orden: 1 },
  { id: '1.2', title: 'Marco Normativo', orden: 2 },
  { id: '1.3', title: 'Metodología', orden: 3 },
  { id: '2', title: 'Descripción del Proyecto', orden: 4 },
  { id: '2.1', title: 'Generalidades', orden: 5 },
  { id: '2.2', title: 'Área de Influencia', orden: 6 },
  { id: '3', title: 'Línea Base Social', orden: 7 }
];

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isParagraphContent(content: SectionContent): content is ParagraphContent {
  return content.type === 'PARAGRAPH';
}

export function isImageContent(content: SectionContent): content is ImageContent {
  return content.type === 'IMAGE';
}

export function isTableContent(content: SectionContent): content is TableContent {
  return content.type === 'TABLE';
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Genera un ID único para contenido
 */
export function generateContentId(type: SectionContentType, sectionId: string): string {
  return `${type.toLowerCase()}_${sectionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Crea contenido de párrafo vacío
 */
export function createEmptyParagraph(sectionId: string, orden: number): ParagraphContent {
  const timestamp = Date.now();
  return {
    id: generateContentId('PARAGRAPH', sectionId),
    type: 'PARAGRAPH',
    text: '',
    format: 'plain',
    orden,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

/**
 * Crea contenido de imagen vacío
 */
export function createEmptyImage(sectionId: string, orden: number): ImageContent {
  const timestamp = Date.now();
  return {
    id: generateContentId('IMAGE', sectionId),
    type: 'IMAGE',
    titulo: '',
    fuente: '',
    preview: null,
    localPath: null,
    backendId: null,
    uploadStatus: 'pending',
    orden,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

/**
 * Crea contenido de tabla vacío
 */
export function createEmptyTable(sectionId: string, orden: number): TableContent {
  const timestamp = Date.now();
  return {
    id: generateContentId('TABLE', sectionId),
    type: 'TABLE',
    titulo: '',
    fuente: '',
    rows: [],
    columns: [],
    totalKey: null,
    campoTotal: null,
    orden,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
