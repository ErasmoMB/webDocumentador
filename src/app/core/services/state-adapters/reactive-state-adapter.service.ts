import { Injectable, Injector, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { FormularioDatos } from '../../models/formulario.model';
import { Grupo } from '../../models/group-config.model';
import { GroupConfigService } from '../group-config.service';
import { FormularioService } from '../formulario.service';
import { FormularioStoreService } from '../formulario-store.service';
import { SectionSyncService } from '../state/section-sync.service';

/**
 * ReactiveStateAdapter - Bridge Reactivo para Sincronización Vista-Formulario
 * 
 * ✅ ESTE ES EL SERVICIO OFICIAL para sincronización reactiva.
 * 
 * ARQUITECTURA:
 * ```
 * FormularioStoreService (memoria - fuente de verdad)
 *         ↓ (suscripción reactiva)
 * ReactiveStateAdapter.datos$ 
 *         ↓ (suscripción en componentes)
 * Componentes de VISTA (se actualizan automáticamente)
 * ```
 * 
 * USO CORRECTO:
 * - VISTAS: Suscribirse a `datos$` para recibir actualizaciones
 * - FORMULARIOS: NO suscribirse (son la fuente de cambios)
 * 
 * ```typescript
 * // En componente de VISTA (correcto)
 * if (!this.modoFormulario) {
 *   this.stateSubscription = this.stateAdapter.datos$.subscribe(() => {
 *     this.actualizarDatos();
 *     this.cdRef.detectChanges();
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ReactiveStateAdapter implements OnDestroy {
  private datosSubject = new BehaviorSubject<FormularioDatos | null>(null);
  public datos$: Observable<FormularioDatos | null> = this.datosSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$: Observable<string | null> = this.errorSubject.asObservable();

  private aisdGroupSubject = new BehaviorSubject<Grupo | null>(null);
  public aisdGroup$: Observable<Grupo | null> = this.aisdGroupSubject.asObservable();

  private aisiGroupSubject = new BehaviorSubject<Grupo | null>(null);
  public aisiGroup$: Observable<Grupo | null> = this.aisiGroupSubject.asObservable();

  private storeSubscription?: Subscription;
  private syncSubscription?: Subscription;

  constructor(
    private injector: Injector
  ) {
    this.initializeState();
    this.subscribeToStoreChanges();
    this.subscribeToSyncChanges();
  }

  ngOnDestroy(): void {
    if (this.storeSubscription) {
      this.storeSubscription.unsubscribe();
    }
    if (this.syncSubscription) {
      this.syncSubscription.unsubscribe();
    }
  }

  /**
   * ✅ Suscribirse a cambios inmediatos del FormularioStoreService
   * Esto es la fuente de verdad INMEDIATA - sin polling ni delays
   */
  private subscribeToStoreChanges(): void {
    try {
      const store = this.injector.get(FormularioStoreService, null);
      if (store) {
        this.storeSubscription = store.datos$.subscribe((datos) => {
          // Notificar inmediatamente cuando el store cambia
          this.datosSubject.next(datos);
        });
      }
    } catch {
      // FormularioStoreService no disponible
    }
  }

  /**
   * ✅ Suscribirse a cambios del SectionSyncService como backup
   */
  private subscribeToSyncChanges(): void {
    try {
      const sectionSync = this.injector.get(SectionSyncService, null);
      if (sectionSync) {
        this.syncSubscription = sectionSync.changes$.subscribe(() => {
          this.refreshFromStorage();
        });
      }
    } catch {
      // SectionSyncService no disponible
    }
  }

  private initializeState(): void {
    // Cargar datos desde FormularioStoreService (memoria) como fuente primaria
    const store = this.injector.get(FormularioStoreService, null);
    if (store) {
      const datos = store.getDatos();
      if (datos && Object.keys(datos).length > 0) {
        this.datosSubject.next(datos);
      }
    }

    // Fallback: FormularioService (localStorage)
    if (!this.datosSubject.value) {
      const formularioService = this.injector.get(FormularioService, null);
      if (formularioService) {
        const datos = formularioService.obtenerDatos();
        if (datos && Object.keys(datos).length > 0) {
          this.datosSubject.next(datos);
        }
      }
    }

    const groupConfig = this.injector.get(GroupConfigService, null);
    if (groupConfig) {
      const aisdGroup = groupConfig.getAISD(0);
      const aisiGroup = groupConfig.getAISI(0);
      if (aisdGroup) this.aisdGroupSubject.next(aisdGroup);
      if (aisiGroup) this.aisiGroupSubject.next(aisiGroup);
    }
  }

  /**
   * ✅ Refresca datos desde el store en memoria (no localStorage)
   */
  refreshFromStorage(): void {
    const store = this.injector.get(FormularioStoreService, null);
    if (store) {
      const datos = store.getDatos();
      if (datos) {
        this.datosSubject.next(datos);
      }
    }
  }

  setDatos(datos: FormularioDatos): void {
    this.datosSubject.next(datos);
    
    // ✅ Persistir a FormularioService (localStorage) - fuente única de verdad
    const formularioService = this.injector.get(FormularioService, null);
    if (formularioService && datos) {
      formularioService.actualizarDatos(datos as any);
    }
  }

  getDatos(): FormularioDatos | null {
    return this.datosSubject.value;
  }

  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  updateDato<K extends keyof FormularioDatos>(campo: K, valor: FormularioDatos[K]): void {
    const current = this.getDatos();
    if (current) {
      const updated = { ...current, [campo]: valor };
      this.setDatos(updated);
    }
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  setAISDGroup(grupo: Grupo | null): void {
    this.aisdGroupSubject.next(grupo);
    const groupConfig = this.injector.get(GroupConfigService, null);
    if (groupConfig && grupo) {
      groupConfig.setAISD(grupo);
    }
  }

  getAISDGroup(): Grupo | null {
    return this.aisdGroupSubject.value;
  }

  setAISIGroup(grupo: Grupo | null): void {
    this.aisiGroupSubject.next(grupo);
    const groupConfig = this.injector.get(GroupConfigService, null);
    if (groupConfig && grupo) {
      groupConfig.setAISI(grupo);
    }
  }

  getAISIGroup(): Grupo | null {
    return this.aisiGroupSubject.value;
  }

  clearGroups(): void {
    this.aisdGroupSubject.next(null);
    this.aisiGroupSubject.next(null);
    const groupConfig = this.injector.get(GroupConfigService, null);
    if (groupConfig) {
      groupConfig.clearAll();
    }
  }
}
