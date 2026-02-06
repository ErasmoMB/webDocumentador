import { Injectable } from '@angular/core';
import { ImageBackendService } from '../image-backend.service';

@Injectable({
  providedIn: 'root'
})
export class ImageLogicService {

  constructor(
    private imageBackendService: ImageBackendService
  ) {}

  isValidImage(imagen: any): boolean {
    if (!imagen) return false;
    if (typeof imagen === 'string') {
      return imagen !== 'null' && imagen.trim() !== '' && 
        (
          imagen.startsWith('data:image') ||
          imagen.startsWith('http') ||
          imagen.length > 100 ||
          this.isImageId(imagen)
        );
    }
    if (imagen instanceof File) {
      return imagen.type.startsWith('image/');
    }
    return false;
  }

  isImageId(value: string): boolean {
    if (typeof value !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  getImageUrl(imagen: string): string {
    if (!imagen) return '';
    if (imagen.startsWith('data:image') || imagen.startsWith('http')) {
      return imagen;
    }
    if (this.isImageId(imagen)) {
      return this.imageBackendService.getImageUrl(imagen);
    }
    return imagen;
  }

  normalizeImageValue(imagen: string): string {
    if (!imagen || typeof imagen !== 'string') return '';
    
    if (imagen.startsWith('data:image')) {
      return imagen;
    }
    
    if (this.isImageId(imagen)) {
      return imagen;
    }
    
    if (imagen.includes('/imagenes/')) {
      const match = imagen.match(/\/api\/imagenes\/([0-9a-f-]{36})/i);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return imagen;
  }

  getFieldWithPrefix(baseField: string, groupPrefix: string = ''): string {
    return groupPrefix ? `${baseField}${groupPrefix}` : baseField;
  }
}
