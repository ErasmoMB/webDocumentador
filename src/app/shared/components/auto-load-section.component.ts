import { OnInit, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef, Directive, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { Subscription, of } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { BaseSectionComponent } from './base-section.component';

@Directive()
export abstract class AutoLoadSectionComponent extends BaseSectionComponent implements OnInit, OnChanges, DoCheck, OnDestroy {
  protected autoLoadSubscriptions: Subscription[] = [];
  private isLoadingData = false;
  private lastLoadedSectionKey: string | null = null;
  private loadDebounceSubscription: Subscription | null = null;

  protected constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService | null,
    cdRef: ChangeDetectorRef,
    protected autoLoader: AutoBackendDataLoaderService
  ) {
    super(
      formularioService,
      fieldMapping,
      sectionDataLoader,
      imageService,
      photoNumberingService,
      cdRef
    );
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadAutoSectionData();
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    if (changes['seccionId'] && !this.isLoadingData) {
      this.debouncedLoadAutoSectionData();
    }
  }

  override ngOnDestroy(): void {
    if (this.loadDebounceSubscription) {
      this.loadDebounceSubscription.unsubscribe();
    }
    this.autoLoadSubscriptions.forEach(sub => sub.unsubscribe());
    super.ngOnDestroy();
  }

  protected override loadSectionData(): void {
    // La carga automática reemplaza la carga manual de BaseSectionComponent
  }

  private debouncedLoadAutoSectionData(forceRefresh: boolean = false): void {
    if (this.loadDebounceSubscription) {
      this.loadDebounceSubscription.unsubscribe();
    }

    const sectionKey = this.getSectionKey();
    const parameters = this.getLoadParameters();
    
    if (!sectionKey || !parameters) {
      return;
    }

    const ubigeoList = Array.isArray(parameters) ? parameters : [parameters];
    const requestKey = `${sectionKey}_${JSON.stringify(ubigeoList)}`;

    if (this.isLoadingData && this.lastLoadedSectionKey === requestKey && !forceRefresh) {
      return;
    }

    this.loadDebounceSubscription = of({ sectionKey, ubigeoList, forceRefresh })
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.loadAutoSectionData(forceRefresh);
      });
  }

  protected loadAutoSectionData(forceRefresh: boolean = false): void {
    const sectionKey = this.getSectionKey();
    const parameters = this.getLoadParameters();
    
    console.log(`%c[AutoLoad] loadAutoSectionData - sectionKey: ${sectionKey}`, 'color: #0288d1; font-weight: bold;');
    console.log(`%c  parameters:`, 'color: #0288d1;', parameters);
    
    if (!sectionKey || !parameters) {
      console.warn(`%c  ⚠️ Saltando: sectionKey o parameters vacíos`, 'color: #0288d1;');
      return;
    }

    const ubigeoList = Array.isArray(parameters) ? parameters : [parameters];
    const requestKey = `${sectionKey}_${JSON.stringify(ubigeoList)}`;

    if (this.isLoadingData && this.lastLoadedSectionKey === requestKey && !forceRefresh) {
      console.warn(`%c  ⚠️ Carga en progreso para ${sectionKey}, evitando bucle`, 'color: #0288d1;');
      return;
    }

    this.isLoadingData = true;
    this.lastLoadedSectionKey = requestKey;

    console.log(`%c  ubigeoList final:`, 'color: #0288d1;', ubigeoList);
    
    const subscription = this.autoLoader.loadSectionData(sectionKey, ubigeoList, forceRefresh)
      .subscribe(
        (loadedData) => {
          if (Object.keys(loadedData).length > 0) {
            console.log(`%c[AutoLoad] ${sectionKey} cargado exitosamente`, 'color: #0288d1; font-weight: bold;');
            for (const [key, value] of Object.entries(loadedData)) {
              if (Array.isArray(value) && value.length > 0) {
                console.log(`  → ${key}: ${value.length} items`);
              }
            }
          }
          this.applyLoadedData(loadedData);
          this.isLoadingData = false;
          this.cdRef.detectChanges();
        },
        (error) => {
          console.warn(`[✗] Error cargando datos para ${sectionKey}:`, error);
          this.isLoadingData = false;
        }
      );

    this.autoLoadSubscriptions.push(subscription);
  }

  protected applyLoadedData(loadedData: { [fieldName: string]: any }): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    
    console.log('%c[AutoLoad] applyLoadedData - Datos recibidos:', 'color: #0288d1; font-weight: bold;');
    console.log('  Prefijo:', prefijo);
    console.log('  loadedData keys:', Object.keys(loadedData));
    console.log('  loadedData:', loadedData);

    for (const [fieldName, data] of Object.entries(loadedData)) {
      if (data === null || data === undefined) continue;

      const fieldKey = prefijo ? `${fieldName}${prefijo}` : fieldName;
      const datosActuales = this.datos[fieldKey];
      const existeDato = datosActuales !== undefined && datosActuales !== null;

      const sonArrays = Array.isArray(data) && Array.isArray(datosActuales);

      // Reemplaza si no existe, o si el contenido cambió (no solo si crece).
      const debeActualizar = !existeDato ||
        (sonArrays && JSON.stringify(data) !== JSON.stringify(datosActuales)) ||
        (!sonArrays && JSON.stringify(data) !== JSON.stringify(datosActuales));

      if (debeActualizar) {
        console.log(`  ✓ Actualizando ${fieldKey}:`, Array.isArray(data) ? `[Array de ${data.length} items]` : data);
        this.formularioService.actualizarDato(fieldKey as any, data);
        // Invalidar cachés específicos cuando cambian tablas calculadas
        if (fieldName === 'peaOcupacionesTabla' && typeof (this as any).invalidarCachePEA === 'function') {
          (this as any).invalidarCachePEA();
        }
      }
    }

    this.actualizarDatos();
  }

  protected abstract getSectionKey(): string;

  protected abstract getLoadParameters(): string | string[] | null;
}
