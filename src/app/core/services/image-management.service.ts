import { Injectable } from '@angular/core';
import { FormularioService } from './formulario.service';
import { PhotoNumberingService } from './photo-numbering.service';
import { FotoItem } from '../../shared/components/image-upload/image-upload.component';

@Injectable({
  providedIn: 'root'
})
export class ImageManagementService {

  constructor(
    private formularioService: FormularioService,
    private photoNumberingService: PhotoNumberingService
  ) {}

  /**
   * Carga imágenes para una sección específica
   * @param sectionId - ID de la sección (ej: '3.1.1')
   * @param prefix - Prefijo del campo (ej: 'fotografiaSeccion1')
   * @param groupPrefix - Prefijo de grupo opcional (ej: '_A1')
   * @param maxPhotos - Número máximo de fotos a cargar (default: 10)
   * @returns Array de FotoItem con las imágenes encontradas
   */
  loadImages(
    sectionId: string, 
    prefix: string, 
    groupPrefix: string = '', 
    maxPhotos: number = 10
  ): FotoItem[] {
    const fotografias: FotoItem[] = [];
    const datos = this.formularioService.obtenerDatos();
    // Mostrar solo el primer hallazgo relevante para evitar spam
    let logueado = false;
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
        if (!logueado) {
          console.log(`[IMG-MANAGEMENT] Foto válida encontrada:`, {numeroGlobal, titulo, fuente, imagen, imagenKey});
          logueado = true;
        }
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

  /**
   * Guarda imágenes para una sección
   * @param sectionId - ID de la sección
   * @param prefix - Prefijo del campo
   * @param images - Array de imágenes a guardar
   * @param groupPrefix - Prefijo de grupo opcional
   * @param maxPhotos - Número máximo de slots a limpiar (default: 10)
   */
  saveImages(
    sectionId: string, 
    prefix: string, 
    images: FotoItem[], 
    groupPrefix: string = '',
    maxPhotos: number = 10
  ): void {
    // Limpieza total de slots antes de guardar (previene slots fantasma)
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

    // Guardar cada imagen con sus datos (solo imágenes válidas)
    let validIndex = 0;
    images.forEach((foto) => {
      if (this.isValidImage(foto.imagen)) {
        validIndex++;
        const num = validIndex;
        const imagenKey = groupPrefix ? `${prefix}${num}Imagen${groupPrefix}` : `${prefix}${num}Imagen`;
        const tituloKey = groupPrefix ? `${prefix}${num}Titulo${groupPrefix}` : `${prefix}${num}Titulo`;
        const fuenteKey = groupPrefix ? `${prefix}${num}Fuente${groupPrefix}` : `${prefix}${num}Fuente`;
        const numeroKey = groupPrefix ? `${prefix}${num}Numero${groupPrefix}` : `${prefix}${num}Numero`;

        this.formularioService.actualizarDato(numeroKey as any, num.toString());
        this.formularioService.actualizarDato(imagenKey as any, foto.imagen || '');
        this.formularioService.actualizarDato(tituloKey as any, foto.titulo || '');
        this.formularioService.actualizarDato(fuenteKey as any, foto.fuente || '');

        // Para la primera foto, también guardar en campo base sin número
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
  }

  /**
   * Obtiene el prefijo de grupo según la sección (dinámico: _A1, _A2, _A3... _B1, _B2, _B3...)
   * @param sectionId - ID de la sección (ej: '3.1.4.A.3.1' → '_A3')
   * @returns Prefijo de grupo dinámico (_A1, _A2, _B1, _B2, etc.) o string vacío
   */
  getGroupPrefix(sectionId: string): string {
    // Delegar a la lógica centralizada de PhotoNumberingService
    return this.photoNumberingService.getGroupPrefix(sectionId);
  }

  /**
   * Valida si una imagen es válida
   * @param imagen - Valor de la imagen a validar
   * @returns true si es imagen válida
   */
  private isValidImage(imagen: any): boolean {
    return imagen && 
           typeof imagen === 'string' && 
           imagen !== 'null' && 
           imagen.trim() !== '';
  }

  /**
   * Obtiene el nombre del campo con prefijo si aplica
   * @param baseField - Campo base (sin prefijo)
   * @param groupPrefix - Prefijo de grupo
   * @returns Campo con prefijo aplicado si corresponde
   */
  getFieldWithPrefix(baseField: string, groupPrefix: string = ''): string {
    return groupPrefix ? `${baseField}${groupPrefix}` : baseField;
  }
}
