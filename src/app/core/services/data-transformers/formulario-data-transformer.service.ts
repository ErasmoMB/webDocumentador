import { Injectable } from '@angular/core';
import { IFormularioDataTransformer } from './interfaces';
import { PhotoTransformer } from './photo-transformer.service';
import { FieldMapper } from './field-mapper.service';
import { DataCalculator } from './data-calculator.service';
import { TableTransformer } from './table-transformer.service';
import { TextGenerator } from './text-generator.service';

@Injectable({
  providedIn: 'root'
})
export class FormularioDataTransformer implements IFormularioDataTransformer {

  constructor(
    private photoTransformer: PhotoTransformer,
    private fieldMapper: FieldMapper,
    private dataCalculator: DataCalculator,
    private tableTransformer: TableTransformer,
    private textGenerator: TextGenerator
  ) {}

  transform(data: any): any {
    let transformed = { ...data };

    // Aplicar transformaciones en orden específico
    transformed = this.applyPhotoTransformations(transformed);
    transformed = this.fieldMapper.applyFieldAliases(transformed);
    transformed = this.dataCalculator.calculateTotals(transformed);
    transformed = this.tableTransformer.transformTables(transformed);
    transformed = this.textGenerator.generateDescriptiveTexts(transformed);

    return transformed;
  }

  private applyPhotoTransformations(data: any): any {
    const transformed = { ...data };

    if (transformed.fotografias && Array.isArray(transformed.fotografias)) {
      const transformedPhotos = this.photoTransformer.transformPhotos(transformed.fotografias);

      transformedPhotos.forEach((photo) => {
        const numFoto = photo.numero;
        transformed[`fotografiaAISD${numFoto}Titulo`] = photo.titulo;
        transformed[`fotografiaAISD${numFoto}Fuente`] = photo.fuente;
        transformed[`fotografiaAISD${numFoto}Imagen`] = photo.ruta;
      });
    }

    return transformed;
  }
}
