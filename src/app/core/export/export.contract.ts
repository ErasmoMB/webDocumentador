/**
 * EXPORT CONTRACT - PASO 8.1
 * 
 * Define qué se exporta y el formato del documento exportable.
 * 
 * PRINCIPIOS:
 * 1. NO lee estado directamente - usa selectores
 * 2. Estructura de exportación independiente del state interno
 * 3. Metadatos de versión y firma incluidos
 * 4. Formatos soportados: JSON, PDF, (opcional) DOCX
 */

// ============================================================================
// EXPORT VERSION & SIGNATURE
// ============================================================================

/** Versión del formato de exportación */
export const EXPORT_VERSION = '1.0.0';

/** Identificador de la aplicación exportadora */
export const EXPORTER_ID = 'webDocumentador';

// ============================================================================
// EXPORT FORMATS
// ============================================================================

export type ExportFormat = 'json' | 'pdf' | 'docx';

export const SUPPORTED_EXPORT_FORMATS: readonly ExportFormat[] = ['json', 'pdf'] as const;

// ============================================================================
// EXPORT METADATA
// ============================================================================

/** Metadatos incluidos en toda exportación */
export interface ExportMetadata {
  /** Versión del formato de exportación */
  readonly exportVersion: string;
  /** ID de la aplicación exportadora */
  readonly exporterId: string;
  /** Timestamp de exportación */
  readonly exportedAt: number;
  /** Hash de integridad del contenido */
  readonly contentHash: string;
  /** Formato de exportación usado */
  readonly format: ExportFormat;
}

// ============================================================================
// DOCUMENT STRUCTURE (Lo que se exporta)
// ============================================================================

/** Información del proyecto en el documento exportado */
export interface ExportProjectInfo {
  readonly projectId: string;
  readonly projectName: string;
  readonly consultora: string;
  readonly detalleProyecto: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

/** Información de ubicación */
export interface ExportUbicacion {
  readonly departamento: string;
  readonly provincia: string;
  readonly distrito: string;
}

/** Grupo exportado (AISD o AISI) */
export interface ExportGroup {
  readonly id: string;
  readonly nombre: string;
  readonly parentId: string | null;
  readonly level: number;
}

/** Entrevistado exportado */
export interface ExportEntrevistado {
  readonly nombre: string;
  readonly cargo: string;
  readonly telefono: string;
  readonly email: string;
}

/** Campo exportado */
export interface ExportField {
  readonly fieldName: string;
  readonly value: unknown;
  readonly source: 'user' | 'api' | 'default' | 'computed';
}

/** Fila de tabla exportada */
export interface ExportTableRow {
  readonly order: number;
  readonly data: Record<string, unknown>;
}

/** Tabla exportada */
export interface ExportTable {
  readonly tableKey: string;
  readonly tableNumber: string; // ej: "3.1", "3.26" - calculado dinámicamente
  readonly rows: readonly ExportTableRow[];
}

/** Imagen exportada */
export interface ExportImage {
  readonly id: string;
  readonly numero: number;
  readonly titulo: string;
  readonly fuente: string;
  /** Base64 o URL de la imagen */
  readonly data: string;
}

/** Sección exportada */
export interface ExportSection {
  readonly sectionId: string;
  readonly groupType: 'AISD' | 'AISI' | 'NINGUNO';
  readonly groupId: string | null;
  readonly groupName: string | null;
  readonly fields: readonly ExportField[];
  readonly tables: readonly ExportTable[];
  readonly images: readonly ExportImage[];
}

// ============================================================================
// COMPLETE EXPORTED DOCUMENT
// ============================================================================

/** Documento completo exportado */
export interface ExportedDocument {
  /** Metadatos de la exportación */
  readonly _export: ExportMetadata;
  
  /** Información del proyecto */
  readonly project: ExportProjectInfo;
  
  /** Ubicación geográfica */
  readonly ubicacion: ExportUbicacion;
  
  /** Grupos AISD */
  readonly aisd: readonly ExportGroup[];
  
  /** Grupos AISI */
  readonly aisi: readonly ExportGroup[];
  
  /** Lista de entrevistados */
  readonly entrevistados: readonly ExportEntrevistado[];
  
  /** Secciones del documento */
  readonly sections: readonly ExportSection[];
}

// ============================================================================
// EXPORT OPTIONS
// ============================================================================

/** Opciones para exportación */
export interface ExportOptions {
  /** Formato de salida */
  readonly format: ExportFormat;
  /** Incluir imágenes en base64 (aumenta tamaño) */
  readonly includeImageData: boolean;
  /** Incluir campos vacíos */
  readonly includeEmptyFields: boolean;
  /** Incluir tablas sin datos */
  readonly includeEmptyTables: boolean;
  /** Solo secciones específicas (null = todas) */
  readonly sectionsFilter: readonly string[] | null;
  /** Solo grupos específicos (null = todos) */
  readonly groupsFilter: readonly string[] | null;
}

/** Opciones por defecto */
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'json',
  includeImageData: true,
  includeEmptyFields: false,
  includeEmptyTables: false,
  sectionsFilter: null,
  groupsFilter: null
};

// ============================================================================
// EXPORT RESULT
// ============================================================================

export interface ExportSuccess {
  readonly success: true;
  readonly format: ExportFormat;
  readonly data: string | Blob;
  readonly filename: string;
  readonly document: ExportedDocument;
}

export interface ExportError {
  readonly success: false;
  readonly error: string;
  readonly details?: string;
}

export type ExportResult = ExportSuccess | ExportError;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Genera hash de contenido para firma.
 */
export function generateContentHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Genera nombre de archivo para exportación.
 */
export function generateExportFilename(
  projectName: string, 
  format: ExportFormat
): string {
  const sanitized = projectName
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  const timestamp = new Date().toISOString().slice(0, 10);
  const extension = format === 'json' ? 'json' : format;
  return `${sanitized}_${timestamp}.${extension}`;
}

/**
 * Crea metadatos de exportación.
 */
export function createExportMetadata(
  format: ExportFormat,
  contentHash: string
): ExportMetadata {
  return {
    exportVersion: EXPORT_VERSION,
    exporterId: EXPORTER_ID,
    exportedAt: Date.now(),
    contentHash,
    format
  };
}

/**
 * Valida que un documento exportado tenga la estructura correcta.
 */
export function validateExportedDocument(doc: unknown): doc is ExportedDocument {
  if (!doc || typeof doc !== 'object') return false;
  
  const d = doc as Record<string, unknown>;
  
  // Check required top-level properties
  const requiredProps = ['_export', 'project', 'ubicacion', 'aisd', 'aisi', 'entrevistados', 'sections'];
  for (const prop of requiredProps) {
    if (!(prop in d)) return false;
  }
  
  // Check _export metadata
  const meta = d['_export'] as Record<string, unknown>;
  if (!meta || typeof meta['exportVersion'] !== 'string') return false;
  
  // Check project info
  const project = d['project'] as Record<string, unknown>;
  if (!project || typeof project['projectName'] !== 'string') return false;
  
  // Check arrays
  if (!Array.isArray(d['aisd'])) return false;
  if (!Array.isArray(d['aisi'])) return false;
  if (!Array.isArray(d['sections'])) return false;
  
  return true;
}
