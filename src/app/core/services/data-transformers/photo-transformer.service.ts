import { Injectable } from '@angular/core';
import { IPhotoTransformer, TransformedPhoto } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class PhotoTransformer implements IPhotoTransformer {

  transformPhotos(photos: any[]): TransformedPhoto[] {
    if (!photos || !Array.isArray(photos)) {
      return [];
    }

    return photos
      .map((foto: any, index: number) => this.transformSinglePhoto(foto, index))
      .filter((photo): photo is TransformedPhoto => photo !== null);
  }

  private transformSinglePhoto(foto: any, index: number): TransformedPhoto | null {
    const numero = foto.numero || `${index + 1}`;
    const partes = numero.split('.');

    if (partes.length >= 2) {
      const numFoto = parseInt(partes[1].trim());
      if (!isNaN(numFoto) && numFoto >= 1 && numFoto <= 10) {
        return {
          numero: numFoto,
          titulo: foto.titulo || '',
          fuente: foto.fuente || '',
          ruta: foto.ruta || ''
        };
      }
    }

    return null;
  }
}
