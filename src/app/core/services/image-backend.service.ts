import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from './config.service';

export interface ImageUploadResponse {
  image_id: string;
  url: string;
  filename: string;
}

export interface ImageMetadata {
  id: string;
  section_id: string;
  prefix: string;
  filename: string;
  url: string;
  created_at: string;
}

export interface FormularioImagesResponse {
  formulario_id: string;
  count: number;
  images: ImageMetadata[];
}

@Injectable({
  providedIn: 'root'
})
export class ImageBackendService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    const apiUrl = this.configService.getApiUrl();
    if (apiUrl.includes('/api')) {
      this.baseUrl = apiUrl.replace(/\/api\/?$/, '');
    } else {
      this.baseUrl = apiUrl;
    }
    if (!this.baseUrl) {
      this.baseUrl = 'http://localhost:8000';
    }
  }

  uploadImage(
    file: File,
    formularioId: string,
    sectionId: string,
    prefix: string
  ): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('formulario_id', formularioId);
    formData.append('section_id', sectionId);
    formData.append('prefix', prefix);

    return this.http.post<any>(`${this.baseUrl}/imagenes/upload`, formData).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Error al subir imagen');
      }),
      catchError(this.handleError)
    );
  }

  getImageUrl(imageId: string): string {
    if (!imageId) return '';
    if (imageId.startsWith('data:image') || imageId.startsWith('http')) {
      return imageId;
    }
    if (this.isImageId(imageId)) {
      const url = `${this.baseUrl}/imagenes/${imageId}`;
      return url;
    }
    return imageId;
  }

  private isImageId(value: string): boolean {
    if (typeof value !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  deleteImage(imageId: string): Observable<void> {
    return this.http.delete<any>(`${this.baseUrl}/imagenes/${imageId}`).pipe(
      map(() => undefined),
      catchError(this.handleError)
    );
  }

  deleteAllFormularioImages(formularioId: string): Observable<{ deleted_count: number }> {
    return this.http.delete<any>(`${this.baseUrl}/imagenes/formulario/${formularioId}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return { deleted_count: 0 };
      }),
      catchError(error => {
        console.warn('Error al eliminar imágenes del backend:', error);
        return of({ deleted_count: 0 });
      })
    );
  }

  listFormularioImages(formularioId: string): Observable<FormularioImagesResponse> {
    return this.http.get<any>(`${this.baseUrl}/imagenes/formulario/${formularioId}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return { formulario_id: formularioId, count: 0, images: [] };
      }),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    if (error.error instanceof ErrorEvent) {
      console.error('Error del cliente:', error.error.message);
    } else {
      console.error(`Error del servidor: ${error.status}`, error.error);
    }
    return throwError(() => error);
  }
}
