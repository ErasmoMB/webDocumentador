import { Observable } from 'rxjs';

export interface TransformedPhoto {
  numero: number;
  titulo: string;
  fuente: string;
  ruta: string;
}

export interface IPhotoTransformer {
  transformPhotos(photos: any[]): TransformedPhoto[];
}

export interface IFieldMapper {
  applyFieldAliases(data: any): any;
}

export interface IDataCalculator {
  calculateTotals(data: any): any;
}

export interface ITableTransformer {
  transformTables(data: any): any;
}

export interface ITextGenerator {
  generateDescriptiveTexts(data: any): any;
}

export interface IFormularioDataTransformer {
  transform(data: any): any;
}

export interface IMockDataLoader {
  cargarMockCapitulo3(): Promise<{ datos: any; json?: any[] } | null>;
}
