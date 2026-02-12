import { Injectable } from '@angular/core';
import { LoggerService } from '../infrastructure/logger.service';
import { StorageFacade } from '../infrastructure/storage-facade.service';
import { CentroPobladoData, FormularioDatos } from '../../models/formulario.model';

@Injectable({
  providedIn: 'root'
})
export class FormularioStorageService {
  private readonly STORAGE_KEY = 'formulario_datos';
  private readonly STORAGE_JSON_KEY = 'formulario_json';
  private readonly STORAGE_TABLA_FILAS_KEY = 'tabla_aisd2_filas_activas';

  constructor(
    private logger: LoggerService,
    private storage: StorageFacade
  ) {}

  saveDatos(datos: FormularioDatos): void {
    try {
      const datosSerializados = JSON.stringify(datos);
      const tamanioMB = new Blob([datosSerializados]).size / (1024 * 1024);
      if (tamanioMB > 4) {
        this.logger.warn(`Los datos son muy grandes (${tamanioMB.toFixed(2)} MB). Algunas imágenes pueden no guardarse correctamente.`);
      }
      this.storage.setItem(this.STORAGE_KEY, datosSerializados);
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        this.logger.error('Error: localStorage está lleno. Intenta eliminar datos antiguos o reducir el tamaño de las imágenes.');
      } else {
        this.logger.error('Error al guardar en localStorage', error);
      }
    }
  }

  loadDatos(): Partial<FormularioDatos> | null {
    try {
      const datosGuardados = this.storage.getItem(this.STORAGE_KEY);
      if (datosGuardados) {
        return JSON.parse(datosGuardados);
      }
    } catch (error) {
      this.logger.error('Error al cargar desde localStorage', error);
    }
    return null;
  }

  saveJson(data: CentroPobladoData[]): void {
    try {
      this.storage.setItem(this.STORAGE_JSON_KEY, JSON.stringify(data));
    } catch (error) {
      this.logger.error('Error al guardar JSON en localStorage', error);
    }
  }

  loadJson(): CentroPobladoData[] | null {
    try {
      const jsonGuardado = this.storage.getItem(this.STORAGE_JSON_KEY);
      if (jsonGuardado) {
        return JSON.parse(jsonGuardado);
      }
    } catch (error) {
      this.logger.error('Error al cargar JSON desde localStorage', error);
    }
    return null;
  }

  saveActiveRows(codigosActivos: string[], prefijo: string = ''): void {
    try {
      const key = prefijo ? `${this.STORAGE_TABLA_FILAS_KEY}${prefijo}` : this.STORAGE_TABLA_FILAS_KEY;
      this.storage.setItem(key, JSON.stringify(codigosActivos));
    } catch (error) {
      this.logger.error('Error al guardar filas activas', error);
    }
  }

  loadActiveRows(prefijo: string = ''): string[] {
    try {
      const key = prefijo ? `${this.STORAGE_TABLA_FILAS_KEY}${prefijo}` : this.STORAGE_TABLA_FILAS_KEY;
      const filasGuardadas = this.storage.getItem(key);
      if (filasGuardadas) {
        return JSON.parse(filasGuardadas);
      }
      if (!prefijo) {
        const filasA1 = this.storage.getItem(`${this.STORAGE_TABLA_FILAS_KEY}_A1`);
        if (filasA1) {
          return JSON.parse(filasA1);
        }
      }
    } catch (error) {
      this.logger.error('Error al obtener filas activas', error);
    }
    return [];
  }

  clearAll(): void {
    // Limpiar todo localStorage para asegurar un reset completo
    this.storage.clear();
  }
}
