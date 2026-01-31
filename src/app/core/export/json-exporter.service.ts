/**
 * JSON EXPORTER - PASO 8.3 (complemento)
 * 
 * Exporta el documento como JSON firmado y versionado.
 */

import { Injectable } from '@angular/core';
import {
  ExportedDocument,
  ExportResult,
  ExportSuccess,
  ExportError,
  generateExportFilename
} from './export.contract';

// ============================================================================
// JSON EXPORT OPTIONS
// ============================================================================

export interface JSONExportOptions {
  /** Formato de indentación (espacios, null = minificado) */
  readonly indent: number | null;
  /** Incluir metadatos de exportación */
  readonly includeMetadata: boolean;
}

export const DEFAULT_JSON_OPTIONS: JSONExportOptions = {
  indent: 2,
  includeMetadata: true
};

// ============================================================================
// JSON EXPORTER SERVICE
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class JSONExporterService {
  
  /**
   * Exporta documento a JSON.
   */
  export(
    doc: ExportedDocument,
    options: Partial<JSONExportOptions> = {}
  ): ExportResult {
    const opts = { ...DEFAULT_JSON_OPTIONS, ...options };
    
    try {
      // Documento a exportar
      const exportData = opts.includeMetadata ? doc : this.stripMetadata(doc);
      
      // Serializar
      const json = opts.indent !== null
        ? JSON.stringify(exportData, null, opts.indent)
        : JSON.stringify(exportData);
      
      // Generar nombre de archivo
      const filename = generateExportFilename(doc.project.projectName, 'json');
      
      const success: ExportSuccess = {
        success: true,
        format: 'json',
        data: json,
        filename,
        document: doc
      };
      
      return success;
    } catch (err) {
      const error: ExportError = {
        success: false,
        error: 'Error al exportar JSON',
        details: err instanceof Error ? err.message : 'Error desconocido'
      };
      return error;
    }
  }
  
  /**
   * Importa documento desde JSON.
   */
  import(json: string): { success: true; document: ExportedDocument } | { success: false; error: string } {
    try {
      const parsed = JSON.parse(json);
      
      // Validación básica
      if (!parsed.project || !parsed.sections) {
        return { success: false, error: 'Formato de documento inválido' };
      }
      
      return { success: true, document: parsed as ExportedDocument };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error al parsear JSON' 
      };
    }
  }
  
  /**
   * Elimina metadatos de exportación.
   */
  private stripMetadata(doc: ExportedDocument): Omit<ExportedDocument, '_export'> {
    const { _export, ...rest } = doc;
    return rest;
  }
}
