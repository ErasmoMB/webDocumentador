/**
 * PDF RENDERER - PASO 8.3
 * 
 * Genera PDF a partir del ExportedDocument.
 * 
 * PRINCIPIOS:
 * 1. Recibe ExportedDocument (ya construido por DocumentBuilder)
 * 2. NO accede al state - trabaja solo con datos exportados
 * 3. Usa jspdf para generación de PDF (dependencia opcional)
 * 4. Estructura jerárquica con numeración consistente
 */

import { Injectable } from '@angular/core';
import {
  ExportedDocument,
  ExportSection,
  ExportField,
  ExportTable,
  ExportImage,
  ExportResult,
  ExportSuccess,
  ExportError,
  generateExportFilename
} from './export.contract';
import { JsPDFInstance, JsPDFConstructor } from './jspdf.types';

// ============================================================================
// PDF OPTIONS
// ============================================================================

export interface PDFOptions {
  /** Tamaño de página */
  readonly pageSize: 'a4' | 'letter';
  /** Orientación */
  readonly orientation: 'portrait' | 'landscape';
  /** Márgenes en mm */
  readonly margins: {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
  };
  /** Fuente principal */
  readonly fontFamily: string;
  /** Tamaño de fuente base */
  readonly baseFontSize: number;
  /** Incluir tabla de contenidos */
  readonly includeTableOfContents: boolean;
  /** Incluir encabezado en páginas */
  readonly includeHeader: boolean;
  /** Incluir pie de página con número */
  readonly includePageNumbers: boolean;
}

export const DEFAULT_PDF_OPTIONS: PDFOptions = {
  pageSize: 'a4',
  orientation: 'portrait',
  margins: { top: 20, right: 15, bottom: 20, left: 15 },
  fontFamily: 'helvetica',
  baseFontSize: 11,
  includeTableOfContents: true,
  includeHeader: true,
  includePageNumbers: true
};

// ============================================================================
// PDF STRUCTURE (Internal representation before rendering)
// ============================================================================

interface PDFElement {
  readonly type: 'title' | 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'field' | 'table' | 'image' | 'pageBreak' | 'toc';
  readonly content: unknown;
}

interface PDFTitle extends PDFElement {
  readonly type: 'title';
  readonly content: string;
}

interface PDFHeading extends PDFElement {
  readonly type: 'heading1' | 'heading2' | 'heading3';
  readonly content: { text: string; number?: string };
}

interface PDFParagraph extends PDFElement {
  readonly type: 'paragraph';
  readonly content: string;
}

interface PDFFieldElement extends PDFElement {
  readonly type: 'field';
  readonly content: { label: string; value: string };
}

interface PDFTableElement extends PDFElement {
  readonly type: 'table';
  readonly content: {
    readonly caption: string;
    readonly headers: readonly string[];
    readonly rows: readonly (readonly string[])[];
  };
}

interface PDFImageElement extends PDFElement {
  readonly type: 'image';
  readonly content: {
    readonly numero: number;
    readonly titulo: string;
    readonly fuente: string;
    readonly data: string;
  };
}

type AnyPDFElement = PDFTitle | PDFHeading | PDFParagraph | PDFFieldElement | PDFTableElement | PDFImageElement | PDFElement;

// ============================================================================
// PDF RENDERER SERVICE
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class PDFRendererService {
  
  /**
   * Genera PDF desde documento exportado.
   */
  async render(
    doc: ExportedDocument,
    options: Partial<PDFOptions> = {}
  ): Promise<ExportResult> {
    const opts = { ...DEFAULT_PDF_OPTIONS, ...options };
    
    try {
      // 1. Construir estructura PDF
      const elements = this.buildPDFStructure(doc, opts);
      
      // 2. Generar PDF
      const blob = await this.generatePDF(elements, doc, opts);
      
      // 3. Generar nombre de archivo
      const filename = generateExportFilename(doc.project.projectName, 'pdf');
      
      const success: ExportSuccess = {
        success: true,
        format: 'pdf',
        data: blob,
        filename,
        document: doc
      };
      
      return success;
    } catch (err) {
      const error: ExportError = {
        success: false,
        error: 'Error al generar PDF',
        details: err instanceof Error ? err.message : 'Error desconocido'
      };
      return error;
    }
  }
  
  /**
   * Construye la estructura del PDF.
   */
  private buildPDFStructure(doc: ExportedDocument, options: PDFOptions): AnyPDFElement[] {
    const elements: AnyPDFElement[] = [];
    
    // 1. Portada
    elements.push(...this.buildCoverPage(doc));
    
    // 2. Tabla de contenidos (placeholder, se genera después)
    if (options.includeTableOfContents) {
      elements.push({ type: 'toc', content: null });
    }
    
    // 3. Información general
    elements.push(...this.buildGeneralInfo(doc));
    
    // 4. Secciones del documento
    let sectionNumber = 1;
    for (const section of doc.sections) {
      elements.push(...this.buildSection(section, sectionNumber, doc));
      sectionNumber++;
    }
    
    return elements;
  }
  
  /**
   * Construye la portada.
   */
  private buildCoverPage(doc: ExportedDocument): AnyPDFElement[] {
    return [
      { type: 'title', content: doc.project.projectName } as PDFTitle,
      { type: 'paragraph', content: `Consultora: ${doc.project.consultora}` } as PDFParagraph,
      { type: 'paragraph', content: doc.project.detalleProyecto } as PDFParagraph,
      { type: 'paragraph', content: `Ubicación: ${doc.ubicacion.departamento}, ${doc.ubicacion.provincia}, ${doc.ubicacion.distrito}` } as PDFParagraph,
      { type: 'paragraph', content: `Fecha de exportación: ${new Date(doc._export.exportedAt).toLocaleDateString()}` } as PDFParagraph,
      { type: 'pageBreak', content: null }
    ];
  }
  
  /**
   * Construye información general.
   */
  private buildGeneralInfo(doc: ExportedDocument): AnyPDFElement[] {
    const elements: AnyPDFElement[] = [];
    
    // Entrevistados
    if (doc.entrevistados.length > 0) {
      elements.push({ 
        type: 'heading1', 
        content: { text: 'Entrevistados' } 
      } as PDFHeading);
      
      const headers = ['Nombre', 'Cargo', 'Teléfono', 'Email'];
      const rows = doc.entrevistados.map(e => [
        e.nombre,
        e.cargo,
        e.telefono,
        e.email
      ]);
      
      elements.push({
        type: 'table',
        content: {
          caption: 'Lista de entrevistados',
          headers,
          rows
        }
      } as PDFTableElement);
    }
    
    // Grupos AISD
    if (doc.aisd.length > 0) {
      elements.push({ 
        type: 'heading1', 
        content: { text: 'Áreas de Influencia Social Directa (AISD)' } 
      } as PDFHeading);
      
      const aisdTable = {
        type: 'table' as const,
        content: {
          caption: 'Grupos AISD',
          headers: ['ID', 'Nombre', 'Nivel'],
          rows: doc.aisd.map(g => [g.id, g.nombre, String(g.level)])
        }
      };
      elements.push(aisdTable);
    }
    
    // Grupos AISI
    if (doc.aisi.length > 0) {
      elements.push({ 
        type: 'heading1', 
        content: { text: 'Áreas de Influencia Social Indirecta (AISI)' } 
      } as PDFHeading);
      
      const aisiTable = {
        type: 'table' as const,
        content: {
          caption: 'Grupos AISI',
          headers: ['ID', 'Nombre', 'Nivel'],
          rows: doc.aisi.map(g => [g.id, g.nombre, String(g.level)])
        }
      };
      elements.push(aisiTable);
    }
    
    elements.push({ type: 'pageBreak', content: null });
    
    return elements;
  }
  
  /**
   * Construye una sección del documento.
   */
  private buildSection(
    section: ExportSection, 
    sectionNumber: number,
    doc: ExportedDocument
  ): AnyPDFElement[] {
    const elements: AnyPDFElement[] = [];
    
    // Título de sección
    const sectionTitle = section.groupName 
      ? `${section.sectionId} - ${section.groupName}`
      : section.sectionId;
    
    elements.push({
      type: 'heading1',
      content: { 
        text: sectionTitle, 
        number: String(sectionNumber) 
      }
    } as PDFHeading);
    
    // Campos
    if (section.fields.length > 0) {
      elements.push({
        type: 'heading2',
        content: { text: 'Información', number: `${sectionNumber}.1` }
      } as PDFHeading);
      
      for (const field of section.fields) {
        elements.push({
          type: 'field',
          content: {
            label: this.formatFieldName(field.fieldName),
            value: this.formatFieldValue(field.value)
          }
        } as PDFFieldElement);
      }
    }
    
    // Tablas
    let tableCounter = 1;
    for (const table of section.tables) {
      elements.push({
        type: 'heading2',
        content: { 
          text: `Cuadro N° ${table.tableNumber}`, 
          number: `${sectionNumber}.${tableCounter + (section.fields.length > 0 ? 1 : 0)}` 
        }
      } as PDFHeading);
      
      if (table.rows.length > 0) {
        const headers = Object.keys(table.rows[0].data);
        const rows = table.rows.map(r => 
          headers.map(h => this.formatFieldValue(r.data[h]))
        );
        
        elements.push({
          type: 'table',
          content: {
            caption: `Cuadro N° ${table.tableNumber}`,
            headers: headers.map(h => this.formatFieldName(h)),
            rows
          }
        } as PDFTableElement);
      }
      
      tableCounter++;
    }
    
    // Imágenes
    if (section.images.length > 0) {
      elements.push({
        type: 'heading2',
        content: { text: 'Registro Fotográfico' }
      } as PDFHeading);
      
      for (const image of section.images) {
        elements.push({
          type: 'image',
          content: {
            numero: image.numero,
            titulo: image.titulo,
            fuente: image.fuente,
            data: image.data
          }
        } as PDFImageElement);
      }
    }
    
    return elements;
  }
  
  /**
   * Carga dinámicamente jspdf.
   * Retorna null si no está instalado.
   */
  private async loadJsPDF(): Promise<JsPDFConstructor | null> {
    try {
      // @ts-ignore - dynamic import of optional dependency
      const module = await Function('return import("jspdf")')();
      return module.jsPDF as JsPDFConstructor;
    } catch (e) {
      return null;
    }
  }
  
  /**
   * Genera el PDF final.
   * En implementación real, usa jspdf o pdfmake.
   */
  private async generatePDF(
    elements: AnyPDFElement[],
    doc: ExportedDocument,
    options: PDFOptions
  ): Promise<Blob> {
    // Importación dinámica de jspdf
    const JsPDF = await this.loadJsPDF();
    if (!JsPDF) {
      throw new Error(
        'El paquete jspdf no está instalado. ' +
        'Ejecute: npm install jspdf --save'
      );
    }
    
    const pdf: JsPDFInstance = new JsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.pageSize
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margins = options.margins;
    const contentWidth = pageWidth - margins.left - margins.right;
    
    let y = margins.top;
    let pageNumber = 1;
    
    // Función helper para agregar página si necesario
    const checkPageBreak = (requiredHeight: number) => {
      if (y + requiredHeight > pageHeight - margins.bottom) {
        pdf.addPage();
        pageNumber++;
        y = margins.top;
        
        // Header en nueva página
        if (options.includeHeader) {
          pdf.setFontSize(8);
          pdf.setTextColor(128);
          pdf.text(doc.project.projectName, margins.left, 10);
          pdf.setTextColor(0);
        }
      }
    };
    
    // Renderizar elementos
    for (const element of elements) {
      switch (element.type) {
        case 'title':
          checkPageBreak(30);
          pdf.setFontSize(24);
          pdf.setFont(options.fontFamily, 'bold');
          const titleLines = pdf.splitTextToSize(element.content as string, contentWidth);
          pdf.text(titleLines, pageWidth / 2, y, { align: 'center' });
          y += titleLines.length * 10 + 10;
          break;
          
        case 'heading1':
          checkPageBreak(15);
          pdf.setFontSize(16);
          pdf.setFont(options.fontFamily, 'bold');
          const h1 = element.content as { text: string; number?: string };
          const h1Text = h1.number ? `${h1.number}. ${h1.text}` : h1.text;
          pdf.text(h1Text, margins.left, y);
          y += 10;
          break;
          
        case 'heading2':
          checkPageBreak(12);
          pdf.setFontSize(14);
          pdf.setFont(options.fontFamily, 'bold');
          const h2 = element.content as { text: string; number?: string };
          const h2Text = h2.number ? `${h2.number}. ${h2.text}` : h2.text;
          pdf.text(h2Text, margins.left, y);
          y += 8;
          break;
          
        case 'heading3':
          checkPageBreak(10);
          pdf.setFontSize(12);
          pdf.setFont(options.fontFamily, 'bold');
          const h3 = element.content as { text: string; number?: string };
          const h3Text = h3.number ? `${h3.number}. ${h3.text}` : h3.text;
          pdf.text(h3Text, margins.left, y);
          y += 7;
          break;
          
        case 'paragraph':
          checkPageBreak(10);
          pdf.setFontSize(options.baseFontSize);
          pdf.setFont(options.fontFamily, 'normal');
          const pLines = pdf.splitTextToSize(element.content as string, contentWidth);
          pdf.text(pLines, margins.left, y);
          y += pLines.length * 5 + 3;
          break;
          
        case 'field':
          checkPageBreak(8);
          pdf.setFontSize(options.baseFontSize);
          const field = element.content as { label: string; value: string };
          pdf.setFont(options.fontFamily, 'bold');
          pdf.text(`${field.label}: `, margins.left, y);
          const labelWidth = pdf.getTextWidth(`${field.label}: `);
          pdf.setFont(options.fontFamily, 'normal');
          const valueLines = pdf.splitTextToSize(field.value, contentWidth - labelWidth);
          pdf.text(valueLines, margins.left + labelWidth, y);
          y += Math.max(valueLines.length * 5, 6);
          break;
          
        case 'table':
          const table = element.content as {
            caption: string;
            headers: readonly string[];
            rows: readonly (readonly string[])[];
          };
          
          const colCount = table.headers.length;
          const colWidth = contentWidth / colCount;
          const rowHeight = 7;
          const tableHeight = (table.rows.length + 1) * rowHeight + 10;
          
          checkPageBreak(Math.min(tableHeight, 50));
          
          // Dibujar encabezados
          pdf.setFontSize(9);
          pdf.setFont(options.fontFamily, 'bold');
          pdf.setFillColor(240, 240, 240);
          pdf.rect(margins.left, y, contentWidth, rowHeight, 'F');
          
          for (let i = 0; i < colCount; i++) {
            const cellX = margins.left + (i * colWidth);
            pdf.text(table.headers[i], cellX + 2, y + 5);
          }
          y += rowHeight;
          
          // Dibujar filas
          pdf.setFont(options.fontFamily, 'normal');
          for (const row of table.rows) {
            checkPageBreak(rowHeight);
            for (let i = 0; i < colCount; i++) {
              const cellX = margins.left + (i * colWidth);
              const cellText = String(row[i] || '').substring(0, 30);
              pdf.text(cellText, cellX + 2, y + 5);
            }
            // Línea horizontal
            pdf.setDrawColor(200);
            pdf.line(margins.left, y + rowHeight, margins.left + contentWidth, y + rowHeight);
            y += rowHeight;
          }
          y += 5;
          break;
          
        case 'image':
          const img = element.content as {
            numero: number;
            titulo: string;
            fuente: string;
            data: string;
          };
          
          checkPageBreak(80);
          
          // Agregar imagen si hay data
          if (img.data && img.data.startsWith('data:image')) {
            try {
              pdf.addImage(img.data, 'JPEG', margins.left, y, 80, 60);
              y += 65;
            } catch {
              // Si falla la imagen, solo mostrar placeholder
              pdf.setDrawColor(200);
              pdf.rect(margins.left, y, 80, 60);
              pdf.setFontSize(10);
              pdf.text('[Imagen no disponible]', margins.left + 20, y + 30);
              y += 65;
            }
          }
          
          // Caption
          pdf.setFontSize(9);
          pdf.setFont(options.fontFamily, 'italic');
          pdf.text(`Fotografía ${img.numero}: ${img.titulo}`, margins.left, y);
          y += 5;
          pdf.text(`Fuente: ${img.fuente}`, margins.left, y);
          y += 10;
          break;
          
        case 'pageBreak':
          pdf.addPage();
          pageNumber++;
          y = margins.top;
          break;
          
        case 'toc':
          // TOC se genera después de procesar todo
          break;
      }
    }
    
    // Agregar números de página
    if (options.includePageNumbers) {
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(128);
        pdf.text(
          `Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    }
    
    return pdf.output('blob');
  }
  
  // ============================================================================
  // FORMATTING HELPERS
  // ============================================================================
  
  private formatFieldName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^\s/, '')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
  
  private formatFieldValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
  
  private formatTableName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^\s/, '')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
}
