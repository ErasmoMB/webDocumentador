import { Injectable } from '@angular/core';
import { LoggerService } from '../infrastructure/logger.service';
import { SessionDataService } from '../session/session-data.service';
import { CentroPobladoData, FormularioDatos } from '../../models/formulario.model';

/**
 * ✅ UNIFICADO: Usa SessionDataService como única capa de persistencia
 * - Backend primero (SessionDataService maneja esto automáticamente)
 * - Fallback a localStorage si backend falla
 * - Elimina confusión entre múltiples sistemas de almacenamiento
 */
@Injectable({
  providedIn: 'root'
})
export class FormularioStorageService {
  private readonly STORAGE_KEY = 'formulario_datos';
  private readonly STORAGE_JSON_KEY = 'formulario_json';
  private readonly STORAGE_TABLA_FILAS_KEY = 'tabla_aisd2_filas_activas';

  constructor(
    private logger: LoggerService,
    private sessionData: SessionDataService
  ) {}

  saveDatos(datos: FormularioDatos): void {
    // ✅ UNIFICADO: Backend primero, fallback a localStorage automático
    this.sessionData.saveData(this.STORAGE_KEY, datos).catch(error => {
      this.logger.error('Error al guardar datos del formulario', error);
    });
  }

  async loadDatos(): Promise<Partial<FormularioDatos> | null> {
    // ✅ UNIFICADO: Backend primero, fallback a localStorage automático
    try {
      const datos = await this.sessionData.loadData(this.STORAGE_KEY);
      return datos || null;
    } catch (error) {
      this.logger.error('Error al cargar datos del formulario', error);
      return null;
    }
  }

  saveJson(data: CentroPobladoData[]): void {
    // ✅ UNIFICADO: Backend primero, fallback a localStorage automático
    this.sessionData.saveData(this.STORAGE_JSON_KEY, data).catch(error => {
      this.logger.error('Error al guardar JSON', error);
    });
  }

  async loadJson(): Promise<CentroPobladoData[] | null> {
    // ✅ UNIFICADO: Backend primero, fallback a localStorage automático
    try {
      const json = await this.sessionData.loadData(this.STORAGE_JSON_KEY);
      return json || null;
    } catch (error) {
      this.logger.error('Error al cargar JSON', error);
      return null;
    }
  }

  saveActiveRows(codigosActivos: string[], prefijo: string = ''): void {
    // ✅ UNIFICADO: Backend primero, fallback a localStorage automático
    const key = prefijo ? `${this.STORAGE_TABLA_FILAS_KEY}${prefijo}` : this.STORAGE_TABLA_FILAS_KEY;
    this.sessionData.saveData(key, codigosActivos).catch(error => {
      this.logger.error('Error al guardar filas activas', error);
    });
  }

  async loadActiveRows(prefijo: string = ''): Promise<string[]> {
    // ✅ UNIFICADO: Backend primero, fallback a localStorage automático
    try {
      const key = prefijo ? `${this.STORAGE_TABLA_FILAS_KEY}${prefijo}` : this.STORAGE_TABLA_FILAS_KEY;
      const filas = await this.sessionData.loadData(key);
      if (filas && Array.isArray(filas)) {
        return filas;
      }
      // Fallback a clave con _A1 si no hay prefijo
      if (!prefijo) {
        const filasA1 = await this.sessionData.loadData(`${this.STORAGE_TABLA_FILAS_KEY}_A1`);
        if (filasA1 && Array.isArray(filasA1)) {
          return filasA1;
        }
      }
    } catch (error) {
      this.logger.error('Error al obtener filas activas', error);
    }
    return [];
  }

  clearAll(): void {
    // ✅ UNIFICADO: Limpia tanto backend como localStorage
    this.sessionData.clearAll().catch(error => {
      this.logger.error('Error al limpiar datos', error);
    });
  }
}
