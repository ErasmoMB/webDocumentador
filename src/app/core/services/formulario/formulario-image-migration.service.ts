import { Injectable } from '@angular/core';
import { LoggerService } from '../infrastructure/logger.service';
import { StorageFacade } from '../infrastructure/storage-facade.service';
import { ImageMigrationService } from '../image/image-migration.service';

@Injectable({
  providedIn: 'root'
})
export class FormularioImageMigrationService {
  private readonly MIGRATION_KEY = 'imagenes_migradas_v1';

  constructor(
    private imageMigration: ImageMigrationService,
    private logger: LoggerService,
    private storage: StorageFacade
  ) {}

  async executeIfNeeded(): Promise<boolean> {
    if (this.storage.getItem(this.MIGRATION_KEY)) {
      return false;
    }

    try {
      const tamanioActual = this.imageMigration.obtenerTamanioLocalStorage();
      if (tamanioActual > 3) {
        this.logger.info('Iniciando migración automática de imágenes...');
        await this.imageMigration.comprimirImagenesEnLocalStorage();
        this.storage.setItem(this.MIGRATION_KEY, 'true');
        this.logger.info('Migración completada exitosamente');
        return true;
      }
    } catch (error) {
      this.logger.error('Error durante la migración automática:', error);
    }

    return false;
  }
}
