/**
 * EXPORT MODULE - BARREL EXPORT
 * 
 * Exports públicos del sistema de exportación.
 * 
 * PASO 8: Exportación del Documento
 * - 8.1: Export Contract (tipos, formatos, metadatos)
 * - 8.2: Document Builder (usa selectores)
 * - 8.3: PDF Renderer + JSON Exporter
 * - 8.4: Tests
 */

// ============================================================================
// 8.1 - EXPORT CONTRACT
// ============================================================================

export {
  // Constants
  EXPORT_VERSION,
  EXPORTER_ID,
  SUPPORTED_EXPORT_FORMATS,
  DEFAULT_EXPORT_OPTIONS,
  
  // Types
  type ExportFormat,
  type ExportMetadata,
  type ExportProjectInfo,
  type ExportUbicacion,
  type ExportGroup,
  type ExportEntrevistado,
  type ExportField,
  type ExportTableRow,
  type ExportTable,
  type ExportImage,
  type ExportSection,
  type ExportedDocument,
  type ExportOptions,
  type ExportSuccess,
  type ExportError,
  type ExportResult,
  
  // Functions
  generateContentHash,
  generateExportFilename,
  createExportMetadata,
  validateExportedDocument
} from './export.contract';

// ============================================================================
// 8.2 - DOCUMENT BUILDER
// ============================================================================

export {
  // Service
  DocumentBuilderService,
  
  // Functions
  buildDocument,
  getDocumentStats,
  filterDocumentSections,
  sortDocumentSections,
  
  // Types
  type DocumentStats
} from './document-builder.service';

// ============================================================================
// 8.3 - RENDERERS & EXPORTERS
// ============================================================================

export {
  // PDF Service
  PDFRendererService,
  
  // PDF Types & Options
  type PDFOptions,
  DEFAULT_PDF_OPTIONS
} from './pdf-renderer.service';

export {
  // JSON Service
  JSONExporterService,
  
  // JSON Types & Options
  type JSONExportOptions,
  DEFAULT_JSON_OPTIONS
} from './json-exporter.service';

export {
  // Main Export Service
  ExportService,
  
  // Combined Options
  type FullExportOptions
} from './export.service';
