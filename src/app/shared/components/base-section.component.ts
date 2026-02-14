import { OnInit, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef, Input, Directive, OnDestroy, Injector, ProviderToken, Signal, signal, effect } from '@angular/core';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { GroupDefinition, CCPPEntry } from 'src/app/core/state/project-state.model';
import { FieldMappingFacade } from 'src/app/core/services/field-mapping/field-mapping.facade';
import { FieldTestDataService } from 'src/app/core/services/field-mapping/field-test-data.service';
import { SectionDataLoaderService } from 'src/app/core/services/utilities/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image/image-management.service';
import { ImageManagementFacade } from 'src/app/core/services/image/image-management.facade';
import { PhotoNumberingService } from 'src/app/core/services/numbering/photo-numbering.service';
import { CacheCleanupService } from 'src/app/core/services/infrastructure/cache-cleanup.service';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { AISIGroupService } from 'src/app/core/services/groups/aisi-group.service';
import { AISDGroupService } from 'src/app/core/services/groups/aisd-group.service';
import { FotoItem } from './image-upload/image-upload.component';
import { PhotoGroupConfig } from '../utils/photo-group-config';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { SectionReactiveSyncCoordinator } from '../utils/section-reactive-sync-coordinator';
import { SectionPersistenceCoordinator } from '../utils/section-persistence-coordinator';
import { SectionPhotoCoordinator } from '../utils/section-photo-coordinator';
import { SectionTableCoordinator } from '../utils/section-table-coordinator';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';

@Directive()
export abstract class BaseSectionComponent implements OnInit, OnChanges, DoCheck, OnDestroy {
  @Input() seccionId: string = '';
  @Input() modoFormulario: boolean = false;
  
  datos: any = {};
  protected datosAnteriores: any = {};
  watchedFields: string[] = [];
  
  fotografiasCache: FotoItem[] = [];
  fotografiasFormMulti: FotoItem[] = [];
  readonly PHOTO_PREFIX: string = '';
  
  protected photoGroups: Map<string, FotoItem[]> = new Map();
  protected photoGroupsConfig: PhotoGroupConfig[] = [];
  protected destroy$ = new Subject<void>();
  protected useReactiveSync: boolean = false;
  protected projectFacade: ProjectStateFacade;
  private readonly reactiveSync: SectionReactiveSyncCoordinator;
  private readonly persistence: SectionPersistenceCoordinator;
  private readonly photos: SectionPhotoCoordinator;
  private readonly tables: SectionTableCoordinator;
  private legacyStateSubscription?: Subscription;
  
  // ✅ SIGNALS PARA GRUPOS AISD/AISI
  readonly aisdGroups: Signal<readonly GroupDefinition[]>;
  readonly aisiGroups: Signal<readonly GroupDefinition[]>;  // ✅ AGREGADO
  readonly allPopulatedCenters: Signal<readonly CCPPEntry[]>;

  protected constructor(
    protected cdRef: ChangeDetectorRef,
    protected injector: Injector
  ) {
    this.projectFacade = injector.get(ProjectStateFacade);
    
    // ✅ Inicializar signals para grupos AISD, AISI y CCPP
    this.aisdGroups = this.projectFacade.groupsByType('AISD');
    this.aisiGroups = this.projectFacade.groupsByType('AISI');  // ✅ AGREGADO
    this.allPopulatedCenters = this.projectFacade.allPopulatedCenters();
    
    this.reactiveSync = new SectionReactiveSyncCoordinator(this.fieldMapping, this.cdRef);
    this.persistence = new SectionPersistenceCoordinator();
    this.photos = new SectionPhotoCoordinator(this.imageFacade, this.photoNumberingService, this.cdRef);
    this.tables = new SectionTableCoordinator();
  }

  protected get fieldMapping(): FieldMappingFacade {
    return this.resolve(FieldMappingFacade);
  }

  protected get fieldTestData(): FieldTestDataService {
    return this.resolve(FieldTestDataService);
  }

  protected get sectionDataLoader(): SectionDataLoaderService {
    return this.resolve(SectionDataLoaderService);
  }

  protected get imageFacade(): ImageManagementFacade {
    return this.resolve(ImageManagementFacade);
  }

  protected get imageService(): ImageManagementService {
    return this.resolve(ImageManagementService);
  }

  protected get photoNumberingService(): PhotoNumberingService | null {
    return this.resolveOptional(PhotoNumberingService);
  }

  /**
   * ✅ AGREGADO: Servicio para acceder a datos del grupo AISI actual
   * Proporciona métodos claros para obtener centros poblados, nombres, etc.
   */
  protected get aisiGroupService(): AISIGroupService {
    return this.resolve(AISIGroupService);
  }

  /**
   * ✅ AGREGADO: Servicio para acceder a datos del grupo AISD actual
   * Proporciona métodos claros para obtener centros poblados, nombres, etc.
   */
  protected get aisdGroupService(): AISDGroupService {
    return this.resolve(AISDGroupService);
  }

  private resolve<T>(token: ProviderToken<T>): T {
    return this.injector.get(token);
  }

  private resolveOptional<T>(token: ProviderToken<T>): T | null {
    return this.injector.get(token, null);
  }

  private getHost(): any {
    return this as any;
  }

  ngOnInit(): void {
    this.bootstrapSectionState();
    if (this.useReactiveSync) this.initializeReactiveSync();
    this.initializeLegacyStateSync();
    this.onInitCustom();
  }

  /**
   * ✅ Inicializa sincronización con ReactiveStateAdapter para actualización inmediata de la vista
   * Solo se activa cuando NO está en modo formulario
   */
  private initializeLegacyStateSync(): void {
    // Limpiar suscripción anterior si existe
    if (this.legacyStateSubscription) {
      this.legacyStateSubscription.unsubscribe();
      this.legacyStateSubscription = undefined;
    }

    // En modo formulario, no suscribirse para evitar actualizaciones constantes
    // Las actualizaciones vendrán del formulario directamente
    if (this.modoFormulario) {
      return;
    }

    try {
      const stateAdapter = this.injector.get(ReactiveStateAdapter, null);
      if (!stateAdapter) return;

      this.legacyStateSubscription = stateAdapter.datos$.pipe(
        debounceTime(100), // Increased debounce to reduce frequency
        takeUntil(this.destroy$)
      ).subscribe(() => {
        // En modo vista, actualizar datos desde ProjectStateFacade
        this.actualizarDatos();
        // Recargar fotografías si aplica
        if (this.tieneFotografias()) {
          this.cargarFotografias();
        }
        this.cdRef.markForCheck();
      });
    } catch {
      // ReactiveStateAdapter no disponible - los componentes usan sus propias suscripciones
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seccionId']) {
      this.reactiveSync.dispose();

      this.bootstrapSectionState();
      if (this.useReactiveSync) this.initializeReactiveSync();
      this.initializeLegacyStateSync();
      // Llamar a onInitCustom cuando cambia el seccionId para ejecutar lógica personalizada
      this.onInitCustom();
    }

    if (changes['modoFormulario']) {
      // Reinicializar suscripción cuando cambia el modo
      this.initializeLegacyStateSync();
      // Marcar para detección de cambios cuando modoFormulario cambia
      this.cdRef.markForCheck();
    }

    if (changes['modoFormulario'] && !this.modoFormulario) {
      if (this.tieneFotografias()) {
        this.guardarTodosLosGrupos();
        this.actualizarFotografiasCache();
        this.actualizarFotografiasFormMulti();
        this.cargarFotografias();
      }
      this.cdRef.markForCheck();
    }

    if (changes['modoFormulario'] && this.modoFormulario) {
      if (this.tieneFotografias()) {
        this.cargarTodosLosGrupos();
        this.cdRef.markForCheck();
      }
    }

    this.onChangesCustom(changes);
    if (changes['seccionId'] && !changes['seccionId'].firstChange) {
      if (this.tieneFotografias()) {
        setTimeout(() => {
          this.cargarFotografias();
          this.cdRef.markForCheck();
        }, 0);
      }
    }
  }

  ngDoCheck(): void {
    if (this.useReactiveSync) return;

    if (this.detectarCambios()) {
      this.actualizarDatos();
      if (this.tieneFotografias()) {
        this.actualizarFotografiasCache();
        if (this.modoFormulario) {
          this.actualizarFotografiasFormMulti();
        }
      }
      this.cdRef.markForCheck();
    }
  }

  private bootstrapSectionState(): void {
    this.actualizarDatos();
    this.restorePersistedSectionState();
    this.loadSectionData();

    if (this.tieneFotografias()) {
      this.actualizarFotografiasFormMulti();
      this.cargarFotografias();
    }
  }

  protected actualizarDatos(): void {
    // Obtener datos del ProjectStateFacade (fuente única de verdad)
    // Usar obtenerDatos() que lee de FormularioService (localStorage)
    const groupId = this.obtenerPrefijoGrupo() || null;
    
    // ✅ CORREGIDO: Usar obtenerDatos() que incluye datos de FormularioService
    let datosNuevos: any = this.projectFacade.obtenerDatos();
    
    // Si no hay datos, intentar con getSectionFields como fallback
    if (!datosNuevos || Object.keys(datosNuevos).length === 0) {
      datosNuevos = this.projectFacade.getSectionFields(this.seccionId, groupId);
    }
    
    // Si aún no hay datos, intentar con 'global'
    if (!datosNuevos || Object.keys(datosNuevos).length === 0) {
      datosNuevos = this.projectFacade.getSectionFields('global', null);
    }

    // Si hay datos nuevos, actualizarlos en this.datos (merge parcial).
    // NO resetear this.datos a {} si no hay datos nuevos: esto evita sobrescrituras
    // temporales que causan la pérdida de valores editados localmente.
    if (datosNuevos && Object.keys(datosNuevos).length > 0) {
      Object.keys(datosNuevos).forEach(key => {
        // No sobrescribir si el campo está en edición activa (por ejemplo: títulos o fuentes que el usuario está editando)
        try {
          if ((this as any).isFieldBeingEdited && typeof (this as any).isFieldBeingEdited === 'function' && (this as any).isFieldBeingEdited(key)) {
            return;
          }
        } catch {}

        const valor = datosNuevos[key];

        if (Array.isArray(valor)) {
          this.datos[key] = valor.map(item => 
            typeof item === 'object' && item !== null ? { ...item } : item
          );
        } else if (typeof valor === 'object' && valor !== null) {
          this.datos[key] = { ...valor };
        } else {
          if (valor !== null && valor !== undefined) {
            this.datos[key] = valor;
          }
        }
      });
    }

    this.actualizarValoresConPrefijo();
    this.actualizarDatosCustom();
    // Usar markForCheck en lugar de detectChanges para mejor rendimiento
    // detectChanges fuerza renderizado completo, markForCheck solo marca para checking
    this.cdRef.markForCheck();
  }

  protected loadSectionData(): void {
    const fieldsToLoad = this.fieldMapping.getFieldsForSection(this.seccionId);
    if (fieldsToLoad.length > 0) {
      this.sectionDataLoader.loadSectionData(this.seccionId, fieldsToLoad)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
  }

  ngOnDestroy(): void {
    this.reactiveSync.dispose();

    // Limpiar suscripción a ReactiveStateAdapter
    if (this.legacyStateSubscription) {
      this.legacyStateSubscription.unsubscribe();
      this.legacyStateSubscription = undefined;
    }

    try {
      const injector = this.injector;
      if (injector) {
        const cacheCleanup = injector.get(CacheCleanupService, null);
        if (cacheCleanup) {
          cacheCleanup.cleanupAll();
        }
      }
    } catch {
    }

    this.clearAllCaches();
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected clearAllCaches(): void {
  }

  protected obtenerValorConPrefijo(campo: string): any {
    return PrefijoHelper.obtenerValorConPrefijo(this.datos, campo, this.seccionId);
  }

  protected obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  obtenerNombreComunidadActual(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // ✅ NUEVO: Usar aisdGroups() signal para obtener el nombre del grupo actual
    if (prefijo && prefijo.startsWith('_A')) {
      const match = prefijo.match(/_A(\d+)/);
      if (match) {
        const index = parseInt(match[1]) - 1; // _A1 → índice 0, _A2 → índice 1
        const grupos = this.aisdGroups();
        if (grupos && grupos[index]?.nombre) {
          return grupos[index].nombre;
        }
      }
    }
    
    // Fallback: buscar en datos guardados
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    if (grupoAISD && grupoAISD.trim() !== '') {
      return grupoAISD;
    }
    
    const grupoConSufijo = prefijo ? this.datos[`grupoAISD${prefijo}`] : null;
    if (grupoConSufijo && grupoConSufijo.trim() !== '') {
      return grupoConSufijo;
    }
    
    if (this.datos.comunidadesCampesinas && Array.isArray(this.datos.comunidadesCampesinas) && this.datos.comunidadesCampesinas.length > 0) {
      const primerCC = this.datos.comunidadesCampesinas[0];
      if (primerCC && primerCC.nombre && primerCC.nombre.trim() !== '') {
        return primerCC.nombre;
      }
    }
    
    if (this.datos.tablaAISD1Localidad && this.datos.tablaAISD1Localidad.trim() !== '') {
      return this.datos.tablaAISD1Localidad;
    }
    
    const grupoAISDBase = this.datos.grupoAISD;
    if (grupoAISDBase && grupoAISDBase.trim() !== '') {
      return grupoAISDBase;
    }
    
    return '____';
  }

  /**
   * ✅ NUEVO: Obtiene el nombre del distrito AISI actual usando aisiGroups signal.
   * Ej: si seccionId = '3.1.4.B.1', devuelve el nombre del grupo AISI[0]
   */
  obtenerNombreDistritoActual(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // Usar aisiGroups() signal para obtener el nombre del grupo actual
    if (prefijo && prefijo.startsWith('_B')) {
      const match = prefijo.match(/_B(\d+)/);
      if (match) {
        const index = parseInt(match[1]) - 1; // _B1 → índice 0, _B2 → índice 1
        const grupos = this.aisiGroups();
        if (grupos && grupos[index]?.nombre) {
          return grupos[index].nombre;
        }
      }
    }
    
    // Fallback: buscar en datos guardados
    const grupoAISIValor = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISI', this.seccionId);
    if (grupoAISIValor && grupoAISIValor.trim() !== '') {
      return grupoAISIValor;
    }
    
    const grupoConSufijo = prefijo ? this.datos[`grupoAISI${prefijo}`] : null;
    if (grupoConSufijo && grupoConSufijo.trim() !== '') {
      return grupoConSufijo;
    }
    
    if (this.datos.distritosAISI && Array.isArray(this.datos.distritosAISI) && this.datos.distritosAISI.length > 0) {
      const primerDistrito = this.datos.distritosAISI[0];
      if (primerDistrito && primerDistrito.nombre && primerDistrito.nombre.trim() !== '') {
        return primerDistrito.nombre;
      }
    }
    
    const grupoAISIBase = this.datos.grupoAISI;
    if (grupoAISIBase && grupoAISIBase.trim() !== '') {
      return grupoAISIBase;
    }
    
    return '____';
  }

  /**
   * ✅ NUEVO: Obtiene el nombre del centro poblado AISI actual usando aisiGroups signal.
   * Ej: si seccionId = '3.1.4.B.1.1_B1', devuelve el nombre del grupo AISI[0]
   * 
   * Este método aplica el patrón de nombres dinámicos para secciones AISI:
   * 1️⃣ Primero consulta aisiGroups() signal por el prefijo (_B1, _B2, etc.)
   * 2️⃣ Fallback a datos guardados (centroPobladoAISI, centroPobladoAISI_B1)
   * 3️⃣ Fallback a centros poblados del arreglo
   * 4️⃣ Placeholder '____' como último recurso
   */
  obtenerNombreCentroPobladoActual(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // ✅ PASO 1: Usar aisiGroups() signal para obtener el nombre del grupo actual
    if (prefijo && prefijo.startsWith('_B')) {
      const match = prefijo.match(/_B(\d+)/);
      if (match) {
        const index = parseInt(match[1]) - 1; // _B1 → índice 0, _B2 → índice 1
        const grupos = this.aisiGroups();
        if (grupos && grupos[index]?.nombre) {
          return grupos[index].nombre; // ✅ RETORNA EL NOMBRE CORRECTO
        }
      }
    }
    
    // ✅ PASO 2: Fallback a datos guardados
    const centroPobladoAISI = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    if (centroPobladoAISI && centroPobladoAISI.trim() !== '') {
      return centroPobladoAISI;
    }
    
    const centroPobladoConSufijo = prefijo ? this.datos[`centroPobladoAISI${prefijo}`] : null;
    if (centroPobladoConSufijo && centroPobladoConSufijo.trim() !== '') {
      return centroPobladoConSufijo;
    }
    
    // ✅ PASO 3: Fallback a centros poblados
    if (this.datos.centrosPobladosAISI && Array.isArray(this.datos.centrosPobladosAISI) && this.datos.centrosPobladosAISI.length > 0) {
      const primerCentro = this.datos.centrosPobladosAISI[0];
      if (primerCentro && primerCentro.nombre && primerCentro.nombre.trim() !== '') {
        return primerCentro.nombre;
      }
    }
    
    // ✅ PASO 3B: Fallback a valor base sin prefijo
    const centroPobladoBase = this.datos.centroPobladoAISI;
    if (centroPobladoBase && centroPobladoBase.trim() !== '') {
      return centroPobladoBase;
    }
    
    return '____'; // Placeholder como último recurso
  }

  // ============================================================================
  // ✅ MÉTODOS DE CONVENIENCIA PARA GRUPOS AISI (usando AISIGroupService)
  // ============================================================================

  /**
   * Obtiene los códigos de centros poblados del grupo AISI actual
   * Ej: ['0214090010', '0214090059', ...]
   */
  protected getCodigosCentrosPobladosAISI(): readonly string[] {
    return this.aisiGroupService.obtenerCodigosCentrosPoblados(this.seccionId);
  }

  /**
   * Obtiene los nombres de los centros poblados del grupo AISI actual
   * Útil para autocompletar y dropdowns
   */
  protected getNombresCentrosPobladosAISI(): readonly string[] {
    return this.aisiGroupService.obtenerNombresCentrosPoblados(this.seccionId);
  }

  /**
   * Obtiene el nombre de un centro poblado dado su código
   */
  protected getNombreCentroPobladoPorCodigoAISI(codigo: string): string | null {
    return this.aisiGroupService.obtenerNombrePorCodigo(this.seccionId, codigo);
  }

  /**
   * Obtiene el código de un centro poblado dado su nombre
   */
  protected getCodigoCentroPobladoPorNombreAISI(nombre: string): string | null {
    return this.aisiGroupService.obtenerCodigoPorNombre(this.seccionId, nombre);
  }

  /**
   * Verifica si un código de centro poblado pertenece al grupo AISI actual
   */
  protected perteneceCentroPobladoAlGrupoAISI(codigo: string): boolean {
    return this.aisiGroupService.perteneceAlGrupoActual(this.seccionId, codigo);
  }

  /**
   * DEBUG: Obtiene información detallada del grupo AISI actual
   */
  protected getAISIGroupDebugInfo(): object {
    return this.aisiGroupService.obtenerInfoDebug(this.seccionId);
  }

  // ============================================================================
  // ✅ MÉTODOS DE CONVENIENCIA PARA GRUPOS AISD (usando AISDGroupService)
  // ============================================================================

  /**
   * Obtiene los códigos de centros poblados del grupo AISD actual
   * Ej: ['0214090010', '0214090059', ...]
   */
  protected getCodigosCentrosPobladosAISD(): readonly string[] {
    return this.aisdGroupService.obtenerCodigosCentrosPoblados(this.seccionId);
  }

  /**
   * Obtiene los nombres de los centros poblados del grupo AISD actual
   * Útil para autocompletar y dropdowns
   */
  protected getNombresCentrosPobladosAISD(): readonly string[] {
    return this.aisdGroupService.obtenerNombresCentrosPoblados(this.seccionId);
  }

  /**
   * Obtiene el nombre de un centro poblado dado su código
   */
  protected getNombreCentroPobladoPorCodigoAISD(codigo: string): string | null {
    return this.aisdGroupService.obtenerNombrePorCodigo(this.seccionId, codigo);
  }

  /**
   * Obtiene el código de un centro poblado dado su nombre
   */
  protected getCodigoCentroPobladoPorNombreAISD(nombre: string): string | null {
    return this.aisdGroupService.obtenerCodigoPorNombre(this.seccionId, nombre);
  }

  /**
   * Verifica si un código de centro poblado pertenece al grupo AISD actual
   */
  protected perteneceCentroPobladoAlGrupoAISD(codigo: string): boolean {
    return this.aisdGroupService.perteneceAlGrupoActual(this.seccionId, codigo);
  }

  /**
   * DEBUG: Obtiene información detallada del grupo AISD actual
   */
  protected getAISDGroupDebugInfo(): object {
    return this.aisdGroupService.obtenerInfoDebug(this.seccionId);
  }

  protected actualizarFotografiasCache(): void {
    this.photos.actualizarFotografiasCache(this.getHost());
  }

  protected actualizarFotografiasFormMulti(): void {
    this.photos.actualizarFotografiasFormMulti(this.getHost());
  }

  protected getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
    return this.fieldMapping.getDataSourceType(fieldName);
  }

  protected onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
    // ✅ Actualizar this.datos localmente PRIMERO para que esté disponible inmediatamente
    // Esto evita que otros campos se vacíen cuando se re-renderiza el componente
    this.datos[fieldId] = value;
    // No logging ruidoso por defecto
    const injector = this.injector;
    this.persistence.persistFieldChange(
      injector,
      { seccionId: this.seccionId, datos: this.datos },
      fieldId,
      value
    );

    // Además de persistir en FormularioService y ProjectState, asegurar que el FormState
    // y SectionSyncService sean notificados inmediatamente para actualizar view/components
    try {
      const FormChangeServiceToken = require('src/app/core/services/state/form-change.service').FormChangeService;
      const formChange = injector.get(FormChangeServiceToken, null);
      if (formChange) {
        // Persistir en FormStateService y notificar sección (notifySync) para que la vista se actualice
        try { formChange.persistFields(this.seccionId, 'text', { [fieldId]: value }, { notifySync: true }); } catch (e) {}
      }
    } catch (e) {
      // No bloquear si no está disponible
    }

    if (options?.refresh ?? true) {
      this.actualizarDatos();
    }
  }

  protected restorePersistedSectionState(): void {
    const injector = this.injector;
    this.persistence.restorePersistedSectionState(injector, { seccionId: this.seccionId, datos: this.datos });
  }

  protected abstract detectarCambios(): boolean;
  protected abstract actualizarValoresConPrefijo(): void;
  
  protected tieneFotografias(): boolean {
    return this.photos.tieneFotografias(this.getHost());
  }
  protected cargarFotografias(): void {
    this.photos.cargarFotografias(this.getHost());
  }
  protected onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    this.photos.onFotografiasChange(this.getHost(), fotografias, customPrefix);
  }

  protected onPhotoLoadComplete(fotografias: FotoItem[]): void {
  }

  protected onPhotoSaveComplete(fotografias: FotoItem[], prefix: string): void {
  }

  diagnosticarImagenes(): void {
    this.photos.diagnosticarImagenes(this.getHost());
  }

  protected onInitCustom(): void {
  }

  protected onChangesCustom(changes: SimpleChanges): void {
  }

  protected actualizarDatosCustom(): void {
  }

  /**
   * Inicializa sincronización reactiva con SectionSyncService
   */
  protected initializeReactiveSync(): void {
    const injector = this.injector;
    this.reactiveSync.initialize(injector, {
      seccionId: this.seccionId,
      datos: this.datos,
      datosAnteriores: this.datosAnteriores,
      watchedFields: this.watchedFields,
      obtenerPrefijoGrupo: () => this.obtenerPrefijoGrupo(),
      actualizarValoresConPrefijo: () => this.actualizarValoresConPrefijo(),
      actualizarDatosCustom: () => this.actualizarDatosCustom(),
      onReactiveChanges: (changes: Record<string, any>) => this.onReactiveChanges(changes)
    });
  }

  /**
   * Hook para lógica personalizada cuando hay cambios reactivos
   */
  protected onReactiveChanges(changes: Record<string, any>): void {
  }

  protected getPhotoGroup(prefix: string): FotoItem[] {
    return this.photos.getPhotoGroup(this.getHost(), prefix);
  }

  protected setPhotoGroup(prefix: string, fotografias: FotoItem[]): void {
    this.photos.setPhotoGroup(this.getHost(), prefix, fotografias);
  }

  protected cargarGrupoFotografias(prefix: string): FotoItem[] {
    return this.photos.cargarGrupoFotografias(this.getHost(), prefix);
  }

  protected guardarGrupoFotografias(prefix: string, fotografias: FotoItem[]): void {
    this.photos.guardarGrupoFotografias(this.getHost(), prefix, fotografias);
  }

  protected cargarTodosLosGrupos(): void {
    this.photos.cargarTodosLosGrupos(this.getHost());
  }

  protected guardarTodosLosGrupos(): void {
    this.photos.guardarTodosLosGrupos(this.getHost());
  }

  protected onGrupoFotografiasChange(prefix: string, fotografias: FotoItem[]): void {
    this.photos.onGrupoFotografiasChange(this.getHost(), prefix, fotografias);
  }

  protected getFotografiasVista(prefix: string): FotoItem[] {
    return this.photos.getFotografiasVista(this.getHost(), prefix);
  }

  protected getFotografiasFormMulti(prefix: string): FotoItem[] {
    return this.photos.getFotografiasFormMulti(this.getHost(), prefix);
  }

  protected createTableConfig(
    tableKey: string,
    fallbackConfig?: Partial<TableConfig>
  ): TableConfig {
    const injector = this.injector;
    return this.tables.createTableConfig(injector, this.seccionId, tableKey, fallbackConfig);
  }

  protected createTableHandler(
    tableKey: string,
    config: TableConfig | (() => TableConfig),
    afterChange?: () => void
  ): (index: number, field: string, value: any) => void {
    const injector = this.injector;

    return this.tables.createTableHandler(
      injector,
      () => this.datos,
      () => this.seccionId,
      (newData: any) => this.datos = newData,
      (fieldId: string, value: any) => this.onFieldChange(fieldId, value),
      () => this.cdRef.detectChanges(),
      tableKey,
      config,
      afterChange
    );
  }

  // ============================================================================
  // ✅ MÉTODOS PARA OBTENER GRUPO ACTUAL Y SUS CCPP (disponibles en todas las secciones)
  // ============================================================================

  /**
   * Obtiene el grupo AISD actual según el prefijo del seccionId.
   * Ej: si seccionId = '3.1.4.A.1', devuelve el grupo AISD[0]
   */
  protected obtenerGrupoActualAISD(): GroupDefinition | null {
    const prefijo = this.obtenerPrefijoGrupo();
    if (!prefijo || !prefijo.startsWith('_A')) {
      return null;
    }
    
    const match = prefijo.match(/_A(\d+)/);
    if (!match) return null;
    
    const index = parseInt(match[1], 10) - 1;
    const grupos = this.aisdGroups();
    
    return (index >= 0 && index < grupos.length) ? grupos[index] : null;
  }

  /**
   * Obtiene el grupo AISI actual según el prefijo del seccionId.
   * Ej: si seccionId = '3.1.4.B.1', devuelve el grupo AISI[0]
   */
  protected obtenerGrupoActualAISI(): GroupDefinition | null {
    const prefijo = this.obtenerPrefijoGrupo();
    if (!prefijo || !prefijo.startsWith('_B')) {
      return null;
    }
    
    const match = prefijo.match(/_B(\d+)/);
    if (!match) return null;
    
    const index = parseInt(match[1], 10) - 1;
    // Usar projectFacade para obtener grupos AISI
    const grupos = this.projectFacade.groupsByType('AISI')();
    
    return (index >= 0 && index < grupos.length) ? grupos[index] : null;
  }

  /**
   * Obtiene los CCPP IDs del grupo AISD actual.
   * @returns Array de códigos de centros poblados seleccionados
   */
  protected obtenerCCPPIdsDelGrupoAISD(): readonly string[] {
    const grupo = this.obtenerGrupoActualAISD();
    return grupo?.ccppIds || [];
  }

  /**
   * Obtiene los CCPP IDs del grupo AISI actual.
   * @returns Array de códigos de centros poblados seleccionados
   */
  protected obtenerCCPPIdsDelGrupoAISI(): readonly string[] {
    const grupo = this.obtenerGrupoActualAISI();
    return grupo?.ccppIds || [];
  }

  /**
   * Obtiene las entradas CCPP completas del grupo AISD actual.
   * @returns Array de CCPPEntry con todos los datos
   */
  protected obtenerCCPPsDelGrupoAISD(): CCPPEntry[] {
    const ccppIds = this.obtenerCCPPIdsDelGrupoAISD();
    const todosLosCCPP = this.allPopulatedCenters();
    
    return todosLosCCPP.filter(ccpp => ccppIds.includes(ccpp.id));
  }

  /**
   * Obtiene las entradas CCPP completas del grupo AISI actual.
   * @returns Array de CCPPEntry con todos los datos
   */
  protected obtenerCCPPsDelGrupoAISI(): CCPPEntry[] {
    const ccppIds = this.obtenerCCPPIdsDelGrupoAISI();
    const todosLosCCPP = this.allPopulatedCenters();
    
    return todosLosCCPP.filter(ccpp => ccppIds.includes(ccpp.id));
  }

  /**
   * ✅ NUEVO: Obtiene el nombre del centro poblado principal del grupo AISI actual.
   * @returns Nombre del grupo AISI (ej: DISTRITO1) o '____' si no hay datos
   */
  protected obtenerCentroPobladoAISI(): string {
    // Primero intentar obtener el nombre del grupo AISI actual
    const nombreGrupo = this.obtenerNombreDistritoActual();
    if (nombreGrupo && nombreGrupo !== '____') {
      return nombreGrupo;
    }
    
    // Fallback: buscar el primer CCPP del grupo
    const ccpps = this.obtenerCCPPsDelGrupoAISI();
    if (ccpps && ccpps.length > 0) {
      const primerCP = ccpps.find(cp => cp.nombre && cp.nombre.trim() !== '');
      if (primerCP && primerCP.nombre) {
        return primerCP.nombre;
      }
    }
    return '____';
  }
  /**
   * PATTERN REACTIVO AUTOMÁTICO: Crea un campo con auto-sync
   * - Signal para el valor
   * - Auto-persist cuando cambia
   * - Reutilizable en todas las secciones
   */
  protected createAutoSyncField<T>(fieldName: string, initialValue: T): {
    value: Signal<T>,
    update: (newValue: T) => void
  } {
    const formChangeService = this.resolve(FormChangeService);
    const valueSignal = signal(initialValue);
    let isFirstRun = true;

    // AUTO-PERSIST: Cada cambio en el signal persiste automáticamente
    effect(() => {
      const newValue = valueSignal();

      if (isFirstRun) {
        isFirstRun = false;
        return;
      }

      if (newValue !== undefined && newValue !== null) {
        formChangeService.persistFields(
          this.seccionId,
          null, // groupId: null para campos sin grupo específico
          { [fieldName]: newValue },
          { updateLegacy: true, updateState: true, notifySync: true, persist: true }
        );
        // Force change detection para vista
        this.cdRef.markForCheck();
      }
    });

    return {
      value: valueSignal,
      update: (newValue: T) => valueSignal.set(newValue)
    };
  }


}
