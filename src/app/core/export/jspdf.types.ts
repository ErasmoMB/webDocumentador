/**
 * Type definitions for jspdf (optional dependency)
 * 
 * Este archivo proporciona tipos básicos para jspdf sin requerir
 * que el paquete esté instalado.
 */

export interface JsPDFOptions {
  orientation?: 'portrait' | 'landscape';
  unit?: 'mm' | 'pt' | 'cm' | 'in';
  format?: 'a4' | 'letter' | [number, number];
}

export interface JsPDFInternal {
  pageSize: {
    getWidth(): number;
    getHeight(): number;
  };
}

export interface JsPDFInstance {
  internal: JsPDFInternal;
  setFontSize(size: number): void;
  setFont(family: string, style?: string): void;
  setTextColor(r: number, g?: number, b?: number): void;
  setDrawColor(r: number, g?: number, b?: number): void;
  setFillColor(r: number, g?: number, b?: number): void;
  text(text: string | string[], x: number, y: number, options?: any): void;
  splitTextToSize(text: string, maxWidth: number): string[];
  line(x1: number, y1: number, x2: number, y2: number): void;
  rect(x: number, y: number, w: number, h: number, style?: string): void;
  addPage(): void;
  setPage(pageNumber: number): void;
  addImage(data: string, format: string, x: number, y: number, w: number, h: number): void;
  output(type: string): Blob;
  getTextWidth(text: string): number;
  setLineWidth(width: number): void;
  save(filename: string): void;
  getNumberOfPages(): number;
}

export type JsPDFConstructor = new (options?: JsPDFOptions) => JsPDFInstance;
