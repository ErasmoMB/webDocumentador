import { Injectable, Injector } from '@angular/core';
import { FotoItem } from '../../../shared/components/image-upload/image-upload.component';
import { ImageManagementFacade } from './image-management.facade';
import { ImageLogicService } from './image-logic.service';
import { ImageStorageService } from './image-storage.service';
import { PhotoNumberingService } from '../numbering/photo-numbering.service';

/**
 * @deprecated Este servicio ha sido dividido en servicios especializados siguiendo SRP.
 * 
 * **Migración:**
 * - Usa `ImageManagementFacade` para compatibilidad hacia atrás
 * - O usa directamente los servicios especializados:
 *   - `ImageLogicService` - Validación y procesamiento de imágenes
 *   - `ImageStorageService` - Carga y guardado de imágenes
 * 
 * **Ejemplo de migración:**
 * ```typescript
 * // ANTES
 * constructor(private imageService: ImageManagementService) {}
 * 
 * // DESPUÉS (opción 1 - Facade)
 * constructor(private imageFacade: ImageManagementFacade) {}
 * 
 * // DESPUÉS (opción 2 - Servicios especializados)
 * constructor(
 *   private imageLogic: ImageLogicService,
 *   private imageStorage: ImageStorageService
 * ) {}
 * ```
 * 
 * **Fecha de deprecación:** 27 de enero de 2026
 * **Fecha de eliminación planificada:** Después de migración completa (Fase 3)
 */
@Injectable({
  providedIn: 'root'
})
export class ImageManagementService {
  private facade: ImageManagementFacade;

  constructor(private injector: Injector) {
    const imageLogic = this.injector.get(ImageLogicService);
    const imageStorage = this.injector.get(ImageStorageService);
    const photoNumbering = this.injector.get(PhotoNumberingService);
    
    this.facade = new ImageManagementFacade(imageLogic, imageStorage, photoNumbering);
  }

  loadImages(
    sectionId: string, 
    prefix: string, 
    groupPrefix: string = '', 
    maxPhotos: number = 10
  ): FotoItem[] {
    return this.facade.loadImages(sectionId, prefix, groupPrefix, maxPhotos);
  }

  saveImages(
    sectionId: string, 
    prefix: string, 
    images: FotoItem[], 
    groupPrefix: string = '',
    maxPhotos: number = 10
  ): void {
    this.facade.saveImages(sectionId, prefix, images, groupPrefix, maxPhotos);
  }

  getGroupPrefix(sectionId: string): string {
    return this.facade.getGroupPrefix(sectionId);
  }

  isValidImage(imagen: any): boolean {
    return this.facade.isValidImage(imagen);
  }

  isImageId(value: string): boolean {
    return this.facade.isImageId(value);
  }

  getImageUrl(imagen: string): string {
    return this.facade.getImageUrl(imagen);
  }

  getFieldWithPrefix(baseField: string, groupPrefix: string = ''): string {
    return this.facade.getFieldWithPrefix(baseField, groupPrefix);
  }
}
