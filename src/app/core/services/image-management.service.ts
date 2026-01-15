import { Injectable } from '@angular/core';
import { FormularioService } from './formulario.service';
import { PhotoNumberingService } from './photo-numbering.service';
import { StateService } from './state.service';
import { FotoItem } from '../../shared/components/image-upload/image-upload.component';

@Injectable({
  providedIn: 'root'
})
export class ImageManagementService {

  constructor(
    private formularioService: FormularioService,
    private photoNumberingService: PhotoNumberingService,
    private stateService: StateService
  ) {}

  loadImages(
    sectionId: string, 
    prefix: string, 
    groupPrefix: string = '', 
    maxPhotos: number = 10
  ): FotoItem[] {
    const fotografias: FotoItem[] = [];
    const datos = this.formularioService.obtenerDatos();
    
    for (let i = 1; i <= maxPhotos; i++) {
      const imagenKey = groupPrefix ? `${prefix}${i}Imagen${groupPrefix}` : `${prefix}${i}Imagen`;
      const tituloKey = groupPrefix ? `${prefix}${i}Titulo${groupPrefix}` : `${prefix}${i}Titulo`;
      const fuenteKey = groupPrefix ? `${prefix}${i}Fuente${groupPrefix}` : `${prefix}${i}Fuente`;
      let imagen = datos[imagenKey];
      if (i === 1 && !imagen) {
        const imagenBaseKey = groupPrefix ? `${prefix}Imagen${groupPrefix}` : `${prefix}Imagen`;
        imagen = datos[imagenBaseKey];
      }
      if (this.isValidImage(imagen)) { 
        const titulo = datos[tituloKey] || `Foto ${i}`;
        const fuente = datos[fuenteKey] || 'GEADES, 2024';
        const numeroGlobal = this.photoNumberingService.getGlobalPhotoNumber(
          sectionId,
          i,
          prefix,
          groupPrefix
        );
        fotografias.push({
          numero: numeroGlobal,
          titulo,
          fuente,
          imagen
        });
      }
    }
    return fotografias;
  }

  saveImages(
    sectionId: string, 
    prefix: string, 
    images: FotoItem[], 
    groupPrefix: string = '',
    maxPhotos: number = 10
  ): void {
    const datosAnteriores = this.formularioService.obtenerDatos();
    let fotosAnteriores = 0;
    for (let i = 1; i <= maxPhotos; i++) {
      const imagenKey = groupPrefix ? `${prefix}${i}Imagen${groupPrefix}` : `${prefix}${i}Imagen`;
      if (this.isValidImage(datosAnteriores[imagenKey])) {
        fotosAnteriores++;
      }
    }

    for (let i = 1; i <= maxPhotos; i++) {
      const imagenKey = groupPrefix ? `${prefix}${i}Imagen${groupPrefix}` : `${prefix}${i}Imagen`;
      const tituloKey = groupPrefix ? `${prefix}${i}Titulo${groupPrefix}` : `${prefix}${i}Titulo`;
      const fuenteKey = groupPrefix ? `${prefix}${i}Fuente${groupPrefix}` : `${prefix}${i}Fuente`;
      const numeroKey = groupPrefix ? `${prefix}${i}Numero${groupPrefix}` : `${prefix}${i}Numero`;
      this.formularioService.actualizarDato(imagenKey as any, '');
      this.formularioService.actualizarDato(tituloKey as any, '');
      this.formularioService.actualizarDato(fuenteKey as any, '');
      this.formularioService.actualizarDato(numeroKey as any, '');
    }

    const imagenBaseKey = groupPrefix ? `${prefix}Imagen${groupPrefix}` : `${prefix}Imagen`;
    const tituloBaseKey = groupPrefix ? `${prefix}Titulo${groupPrefix}` : `${prefix}Titulo`;
    const fuenteBaseKey = groupPrefix ? `${prefix}Fuente${groupPrefix}` : `${prefix}Fuente`;
    this.formularioService.actualizarDato(imagenBaseKey as any, '');
    this.formularioService.actualizarDato(tituloBaseKey as any, '');
    this.formularioService.actualizarDato(fuenteBaseKey as any, '');

    let validIndex = 0;
    images.forEach((foto) => {
      if (this.isValidImage(foto.imagen)) {
        validIndex++;
        const num = validIndex;
        const imagenKey = groupPrefix ? `${prefix}${num}Imagen${groupPrefix}` : `${prefix}${num}Imagen`;
        const tituloKey = groupPrefix ? `${prefix}${num}Titulo${groupPrefix}` : `${prefix}${num}Titulo`;
        const fuenteKey = groupPrefix ? `${prefix}${num}Fuente${groupPrefix}` : `${prefix}${num}Fuente`;
        const numeroKey = groupPrefix ? `${prefix}${num}Numero${groupPrefix}` : `${prefix}${num}Numero`;

        const numeroGlobal = foto.numero || this.photoNumberingService.getGlobalPhotoNumber(
          sectionId,
          num,
          prefix,
          groupPrefix
        );
        this.formularioService.actualizarDato(numeroKey as any, numeroGlobal);
        this.formularioService.actualizarDato(imagenKey as any, foto.imagen || '');
        this.formularioService.actualizarDato(tituloKey as any, foto.titulo || '');
        this.formularioService.actualizarDato(fuenteKey as any, foto.fuente || '');

        if (num === 1) {
          const imagenBaseKey = groupPrefix ? `${prefix}Imagen${groupPrefix}` : `${prefix}Imagen`;
          const tituloBaseKey = groupPrefix ? `${prefix}Titulo${groupPrefix}` : `${prefix}Titulo`;
          const fuenteBaseKey = groupPrefix ? `${prefix}Fuente${groupPrefix}` : `${prefix}Fuente`;

          this.formularioService.actualizarDato(imagenBaseKey as any, foto.imagen || '');
          this.formularioService.actualizarDato(tituloBaseKey as any, foto.titulo || '');
          this.formularioService.actualizarDato(fuenteBaseKey as any, foto.fuente || '');
        }
      }
    });

    const datosActuales = this.formularioService.obtenerDatos();
    if (datosActuales) {
      this.stateService.setDatos(datosActuales);
    }
  }

  getGroupPrefix(sectionId: string): string {
    return this.photoNumberingService.getGroupPrefix(sectionId);
  }

  private isValidImage(imagen: any): boolean {
    if (!imagen) return false;
    if (typeof imagen === 'string') {
      return imagen !== 'null' && imagen.trim() !== '' && (imagen.startsWith('data:image') || imagen.length > 100);
    }
    if (imagen instanceof File) {
      return imagen.type.startsWith('image/');
    }
    return false;
  }

  getFieldWithPrefix(baseField: string, groupPrefix: string = ''): string {
    return groupPrefix ? `${baseField}${groupPrefix}` : baseField;
  }
}
