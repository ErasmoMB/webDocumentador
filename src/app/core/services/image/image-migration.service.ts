import { Injectable } from '@angular/core';
import { LoggerService } from '../infrastructure/logger.service';
import { StorageFacade } from '../infrastructure/storage-facade.service';

@Injectable({
  providedIn: 'root'
})
export class ImageMigrationService {
  constructor(
    private logger: LoggerService,
    private storage: StorageFacade
  ) {}

  /**
   * Comprime todas las imágenes base64 en localStorage
   */
  async comprimirImagenesEnLocalStorage(): Promise<void> {
    try {
      const datosStr = this.storage.getItem('formularioDatos');
      if (!datosStr) {
        this.logger.info('No hay datos en localStorage para migrar');
        return;
      }

      const tamanioAntes = new Blob([datosStr]).size / (1024 * 1024);
      this.logger.info(`Tamaño antes de la migración: ${tamanioAntes.toFixed(2)} MB`);

      const datos = JSON.parse(datosStr);
      let imagenesComprimidas = 0;

      // Comprimir imágenes en todos los campos
      await this.comprimirImagenesRecursivo(datos);

      const datosNuevos = JSON.stringify(datos);
      const tamanioDespues = new Blob([datosNuevos]).size / (1024 * 1024);
      
      this.storage.setItem('formularioDatos', datosNuevos);
      
      this.logger.info(`Migración completada:`);
      this.logger.info(`- Tamaño antes: ${tamanioAntes.toFixed(2)} MB`);
      this.logger.info(`- Tamaño después: ${tamanioDespues.toFixed(2)} MB`);
      this.logger.info(`- Reducción: ${((tamanioAntes - tamanioDespues) / tamanioAntes * 100).toFixed(1)}%`);
      
      return;
    } catch (error) {
      this.logger.error('Error durante la migración:', error);
      throw error;
    }
  }

  private async comprimirImagenesRecursivo(obj: any): Promise<void> {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const valor = obj[key];

        // Si es un string que parece ser una imagen base64
        if (typeof valor === 'string' && this.esImagenBase64(valor)) {
          try {
            const comprimida = await this.comprimirImagen(valor);
            if (comprimida.length < valor.length) {
              obj[key] = comprimida;
              const reduccion = ((valor.length - comprimida.length) / valor.length * 100).toFixed(1);
              this.logger.debug(`Imagen comprimida en ${key}: ${reduccion}% de reducción`);
            }
          } catch (error) {
            this.logger.warn(`Error al comprimir imagen en ${key}:`, error);
          }
        }
        // Si es un objeto o array, recursión
        else if (typeof valor === 'object') {
          await this.comprimirImagenesRecursivo(valor);
        }
      }
    }
  }

  private esImagenBase64(str: string): boolean {
    return str.startsWith('data:image/') && str.includes('base64,');
  }

  private comprimirImagen(base64: string, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.65): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones manteniendo aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const imagenComprimida = canvas.toDataURL('image/jpeg', quality);
          resolve(imagenComprimida);
        } else {
          reject(new Error('No se pudo obtener el contexto del canvas'));
        }
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };

      img.src = base64;
    });
  }

  /**
   * Obtiene el tamaño actual del localStorage en MB
   */
  obtenerTamanioLocalStorage(): number {
    const datos = this.storage.getItem('formularioDatos');
    if (!datos) return 0;
    return new Blob([datos]).size / (1024 * 1024);
  }

  /**
   * Limpia completamente el localStorage
   */
  limpiarLocalStorage(): void {
    if (confirm('¿Estás seguro de que deseas borrar todos los datos guardados?')) {
      this.storage.clear();
      this.logger.info('localStorage limpiado');
      window.location.reload();
    }
  }
}
