import { Injectable } from '@angular/core';
import { PhotoNumberingService } from '../numbering/photo-numbering.service';
import { FotoItem } from '../../../shared/components/image-upload/image-upload.component';
import { ImageLogicService } from './image-logic.service';
import { ImageStorageService } from './image-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ImageManagementFacade {

  constructor(
    private imageLogic: ImageLogicService,
    private imageStorage: ImageStorageService,
    private photoNumberingService: PhotoNumberingService
  ) {}

  loadImages(
    sectionId: string, 
    prefix: string, 
    groupPrefix: string = '', 
    maxPhotos: number = 10
  ): FotoItem[] {
    return this.imageStorage.loadImages(sectionId, prefix, groupPrefix, maxPhotos);
  }

  saveImages(
    sectionId: string, 
    prefix: string, 
    images: FotoItem[], 
    groupPrefix: string = '',
    maxPhotos: number = 10
  ): void {
    this.imageStorage.saveImages(sectionId, prefix, images, groupPrefix, maxPhotos);
  }

  getGroupPrefix(sectionId: string): string {
    return this.photoNumberingService.getGroupPrefix(sectionId);
  }

  isValidImage(imagen: any): boolean {
    return this.imageLogic.isValidImage(imagen);
  }

  isImageId(value: string): boolean {
    return this.imageLogic.isImageId(value);
  }

  getImageUrl(imagen: string): string {
    return this.imageLogic.getImageUrl(imagen);
  }

  getFieldWithPrefix(baseField: string, groupPrefix: string = ''): string {
    return this.imageLogic.getFieldWithPrefix(baseField, groupPrefix);
  }
}
