import { OnInit, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef, Input, Directive, OnDestroy, Injector, ProviderToken } from '@angular/core';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { FieldMappingFacade } from 'src/app/core/services/field-mapping/field-mapping.facade';
import { FieldTestDataService } from 'src/app/core/services/field-mapping/field-test-data.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { ImageManagementFacade } from 'src/app/core/services/images/image-management.facade';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { CacheCleanupService } from 'src/app/core/services/infrastructure/cache-cleanup.service';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { FotoItem } from './image-upload/image-upload.component';
import { PhotoGroupConfig } from '../utils/photo-group-config';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { SectionReactiveSyncCoordinator } from '../utils/section-reactive-sync-coordinator';
import { SectionPersistenceCoordinator } from '../utils/section-persistence-coordinator';
import { SectionPhotoCoordinator } from '../utils/section-photo-coordinator';
import { SectionTableCoordinator } from '../utils/section-table-coordinator';

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

  [key: string]: any;
  
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

  protected constructor(
    protected cdRef: ChangeDetectorRef,
    protected injector: Injector
  ) {
    this.projectFacade = injector.get(ProjectStateFacade);
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

    // Solo suscribirse en modo vista (no formulario)
    if (this.modoFormulario) return;

    try {
      const stateAdapter = this.injector.get(ReactiveStateAdapter, null);
      if (!stateAdapter) return;

      this.legacyStateSubscription = stateAdapter.datos$.pipe(
        debounceTime(50), // Pequeño debounce para agrupar cambios rápidos
        takeUntil(this.destroy$)
      ).subscribe(() => {
        // Actualizar datos desde ProjectStateFacade (fuente de verdad)
        this.actualizarDatos();
        // Recargar fotografías si aplica
        if (this.tieneFotografias()) {
          this.cargarFotografias();
        }
        this.cdRef.detectChanges();
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
    }

    if (changes['modoFormulario']) {
      // Reinicializar suscripción cuando cambia el modo
      this.initializeLegacyStateSync();
    }

    if (changes['modoFormulario'] && !this.modoFormulario) {
      if (this.tieneFotografias()) {
        this.guardarTodosLosGrupos();
        this.actualizarFotografiasCache();
        this.actualizarFotografiasFormMulti();
        this.cargarFotografias();
      }
      this.cdRef.detectChanges();
    }

    if (changes['modoFormulario'] && this.modoFormulario) {
      if (this.tieneFotografias()) {
        this.cargarTodosLosGrupos();
        this.cdRef.detectChanges();
      }
    }

    this.onChangesCustom(changes);
    if (changes['seccionId'] && !changes['seccionId'].firstChange) {
      if (this.tieneFotografias()) {
        setTimeout(() => {
          this.cargarFotografias();
          this.cdRef.detectChanges();
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
    this.cdRef.detectChanges();
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
    
    const injector = this.injector;
    this.persistence.persistFieldChange(
      injector,
      { seccionId: this.seccionId, datos: this.datos },
      fieldId,
      value
    );

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
}
