/**
 * EXPORT SERVICE - Servicio principal de exportación
 * 
 * Orquesta los diferentes exportadores (JSON, PDF, etc.)
 * 
 * PRINCIPIOS:
 * 1. Fachada única para exportación
 * 2. NO accede al state - usa DocumentBuilder
 * 3. Delega a exportadores específicos
 */

import { Injectable, inject } from '@angular/core';
import { 
  ExportFormat, 
  ExportOptions, 
  ExportResult, 
  ExportError,
  DEFAULT_EXPORT_OPTIONS,
  SUPPORTED_EXPORT_FORMATS
} from './export.contract';
import { DocumentBuilderService, getDocumentStats, DocumentStats } from './document-builder.service';
import { PDFRendererService, PDFOptions, DEFAULT_PDF_OPTIONS } from './pdf-renderer.service';
import { JSONExporterService, JSONExportOptions, DEFAULT_JSON_OPTIONS } from './json-exporter.service';

// ============================================================================
// COMBINED EXPORT OPTIONS
// ============================================================================

export interface FullExportOptions extends ExportOptions {
  readonly pdf?: Partial<PDFOptions>;
  readonly json?: Partial<JSONExportOptions>;
}

// ============================================================================
// EXPORT SERVICE
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private readonly builder = inject(DocumentBuilderService);
  private readonly pdfRenderer = inject(PDFRendererService);
  private readonly jsonExporter = inject(JSONExporterService);
  
  /**
   * Exporta el documento actual en el formato especificado.
   */
  async export(options: Partial<FullExportOptions> = {}): Promise<ExportResult> {
    const format = options.format || DEFAULT_EXPORT_OPTIONS.format;
    
    // Validar formato soportado
    if (!SUPPORTED_EXPORT_FORMATS.includes(format)) {
      const error: ExportError = {
        success: false,
        error: `Formato no soportado: ${format}`,
        details: `Formatos soportados: ${SUPPORTED_EXPORT_FORMATS.join(', ')}`
      };
      return error;
    }
    
    // 1. Construir documento usando selectores
    const doc = this.builder.build(options);
    
    // 2. Delegar al exportador específico
    switch (format) {
      case 'pdf':
        return this.pdfRenderer.render(doc, options.pdf || {});
        
      case 'json':
        return this.jsonExporter.export(doc, options.json || {});
        
      case 'docx':
        // TODO: Implementar exportador DOCX
        return {
          success: false,
          error: 'Formato DOCX no implementado aún'
        };
        
      default:
        return {
          success: false,
          error: `Formato desconocido: ${format}`
        };
    }
  }
  
  /**
   * Exporta a JSON (atajo).
   */
  exportJSON(options: Partial<JSONExportOptions> = {}): ExportResult {
    const doc = this.builder.build({ format: 'json' });
    return this.jsonExporter.export(doc, options);
  }
  
  /**
   * Exporta a PDF (atajo).
   */
  async exportPDF(options: Partial<PDFOptions> = {}): Promise<ExportResult> {
    const doc = this.builder.build({ format: 'pdf' });
    return this.pdfRenderer.render(doc, options);
  }
  
  /**
   * Obtiene estadísticas del documento actual.
   */
  getStats(): DocumentStats {
    const doc = this.builder.build({
      includeEmptyFields: true,
      includeEmptyTables: true
    });
    return getDocumentStats(doc);
  }
  
  /**
   * Vista previa del documento (retorna estructura sin renderizar).
   */
  preview(options: Partial<ExportOptions> = {}) {
    return this.builder.build(options);
  }
  
  /**
   * Descarga el resultado de exportación.
   */
  download(result: ExportResult): void {
    if (!result.success) {
      console.error('Cannot download failed export:', result.error);
      return;
    }
    
    const { data, filename, format } = result;
    
    // Crear blob si es string
    const blob = data instanceof Blob 
      ? data 
      : new Blob([data], { type: this.getMimeType(format) });
    
    // Crear link y descargar
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    // Limpiar
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  
  /**
   * Exporta y descarga en un solo paso.
   */
  async exportAndDownload(options: Partial<FullExportOptions> = {}): Promise<ExportResult> {
    const result = await this.export(options);
    
    if (result.success) {
      this.download(result);
    }
    
    return result;
  }
  
  // ============================================================================
  // HELPERS
  // ============================================================================
  
  private getMimeType(format: ExportFormat): string {
    switch (format) {
      case 'json': return 'application/json';
      case 'pdf': return 'application/pdf';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default: return 'application/octet-stream';
    }
  }
}
