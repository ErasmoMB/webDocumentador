import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FormularioDatos, CentroPobladoData } from '../../models/formulario.model';
import { LoggerService } from '../infrastructure/logger.service';
import { ImageBackendService } from '../image/image-backend.service';
import { FormularioStoreService } from './formulario-store.service';
import { FormularioStorageService } from './formulario-storage.service';
import { FormularioImageMigrationService } from './formulario-image-migration.service';
import { FormularioMockService } from './formulario-mock.service';
import { SessionDataService } from '../session/session-data.service';
import { BackendAvailabilityService } from '../infrastructure/backend-availability.service';

/**
 * @deprecated FASE 1 - Migración SOLID: Este servicio está deprecated.
 * 
 * MIGRACIÓN OBLIGATORIA:
 * - Usar LegacyFormularioAdapter para compatibilidad temporal
 * - Migrar a FormChangeService + LegacyDocumentSnapshotService
 * 
 * Fecha de eliminación: Sprint 3
 * 
 * ANTES:
 * ```typescript
 * constructor(private formularioService: FormularioService) {}
 * this.formularioService.obtenerDatos();
 * ```
 * 
 * DESPUÉS:
 * ```typescript
 * constructor(
 *   private formularioAdapter: LegacyFormularioAdapter,
 *   private formChange: FormChangeService,
 *   private legacySnapshot: LegacyDocumentSnapshotService
 * ) {}
 * this.formularioAdapter.obtenerDatos();
 * // O mejor aún:
 * this.legacySnapshot.getFormularioDatosSnapshot();
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class FormularioService {
  private saveDebounceSubject = new Subject<void>();
  private _datosLoaded = false;

  get datos(): FormularioDatos {
    return this.store.getDatos();
  }

  get jsonData(): CentroPobladoData[] {
    return this.store.getJson();
  }

  constructor(
    private store: FormularioStoreService,
    private storage: FormularioStorageService,
    private imageMigration: FormularioImageMigrationService,
    private imageBackendService: ImageBackendService,
    private mockService: FormularioMockService,
    private logger: LoggerService,
    private sessionDataService: SessionDataService,
    private backendAvailability: BackendAvailabilityService
  ) {
    // ✅ LAZY LOADING: No bloquear el constructor
    // Cargar datos en background sin esperar (permitir que UI renderice primero)
    setTimeout(() => {
      if (!this._datosLoaded) {
        void this.cargarDesdeLocalStorage();
      }
    }, 100); // 100ms delay allows UI to render first
    
    this.ejecutarMigracionImagenes();
    this.inicializarDebounceGuardado();
  }

  private inicializarDebounceGuardado(): void {
    this.saveDebounceSubject.pipe(
      debounceTime(50) // Reducido de 500ms a 50ms para sincronización más rápida
    ).subscribe(() => {
      this.ejecutarGuardado();
    });
  }

  private async ejecutarMigracionImagenes(): Promise<void> {
    const migrated = await this.imageMigration.executeIfNeeded();
    if (migrated) {
      await this.cargarDesdeLocalStorage();
    }
  }

  actualizarDato(campo: keyof FormularioDatos, valor: any): void {
    // SOLID: FormularioService tiene responsabilidad directa sobre sus datos
    // No delegar a FormChangeService para evitar recursión circular
    this.store.setDato(campo, valor);
    this.programarGuardado();
  }

  actualizarDatos(nuevosDatos: Partial<FormularioDatos>): void {
    // SOLID: Actualización directa sin pasar por FormChangeService
    // Esto evita el ciclo: FormularioService → FormChangeService → LegacySnapshot → FormularioService
    const tieneTablas = this.store.aplicarDatos(nuevosDatos);
    if (tieneTablas) {
      this.ejecutarGuardado();
    } else {
      this.programarGuardado();
    }
  }

  reemplazarDatos(nuevosDatos: FormularioDatos): void {
    if (!nuevosDatos) {
      this.logger.warn('reemplazarDatos: nuevosDatos es null o undefined');
      return;
    }
    try {
      this.store.reemplazarDatos(nuevosDatos);
    } catch (error) {
      this.logger.error('Error al reemplazar datos', error);
      this.store.mergeDatos(nuevosDatos);
    }
  }

  obtenerDatos(): FormularioDatos {
    return this.store.getDatos();
  }

  guardarJSON(data: CentroPobladoData[]): void {
    this.store.setJson(data);
    this.storage.saveJson(data);
  }

  obtenerJSON(): CentroPobladoData[] {
    return this.store.getJson();
  }

  private programarGuardado(): void {
    this.saveDebounceSubject.next();
  }

  private ejecutarGuardado(): void {
    // ✅ SIEMPRE guardar en localStorage para garantizar persistencia en recarga (F5)
    // El backend se sincroniza por separado a través de otros servicios
    this.storage.saveDatos(this.store.getDatos());
  }

  private async cargarDesdeLocalStorage(): Promise<void> {
    // ✅ LAZY LOADING: No bloquear el constructor regular
    // Cargar datos del backend/localStorage
    const datosCargados = await this.storage.loadDatos();
    if (datosCargados) {
      this.store.mergeDatos(datosCargados);
    }
    const jsonGuardado = await this.storage.loadJson();
    if (jsonGuardado) {
      this.store.setJson(jsonGuardado);
    }
    this._datosLoaded = true;
  }

  guardarFilasActivasTablaAISD2(codigosActivos: string[], prefijo: string = ''): void {
    this.storage.saveActiveRows(codigosActivos, prefijo);
  }

  async obtenerFilasActivasTablaAISD2(prefijo: string = ''): Promise<string[]> {
    return this.storage.loadActiveRows(prefijo);
  }

  limpiarDatos() {
    const formularioId = this.datos.projectName || 'default';
    if (formularioId && formularioId !== 'default') {
      this.imageBackendService.deleteAllFormularioImages(formularioId).subscribe({
        next: (response) => {
          this.logger.info(`Se eliminaron ${response.deleted_count} imagen(es) del backend`);
        },
        error: (error) => {
          this.logger.warn('Error al eliminar imágenes del backend:', error);
        }
      });
    }
    
    this.store.resetDatos();
    this.storage.clearAll();
    void this.sessionDataService.clearAll();
  }

  async guardarTablesTemporal(nombre: string, datos: any): Promise<void> {
    await this.sessionDataService.saveData(nombre, datos);
  }

  async cargarTablesTemporal(nombre: string): Promise<any> {
    return this.sessionDataService.loadData(nombre);
  }

  async cargarMockCapitulo3(): Promise<boolean> {
    const resultado = await this.mockService.cargarMockCapitulo3();
    if (!resultado) {
      return false;
    }
    this.actualizarDatos(resultado.datos);
    if (resultado.json) {
      this.guardarJSON(resultado.json);
    }
    
    // DEBUG: Mostrar datos de actividadesEconomicasAISI
    const datos: any = resultado.datos;
    if (datos && datos.actividadesEconomicasAISI) {
      // Logged: actividadesEconomicasAISI data
    }
    
    return true;
  }
}

