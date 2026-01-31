import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';

// Clean Architecture imports
import { LoadSeccion4UseCase } from 'src/app/core/application/use-cases';
import { UpdateSeccion4DataUseCase } from 'src/app/core/application/use-cases';
import { Seccion4ViewModel } from 'src/app/core/application/use-cases';

// Domain imports
import { Seccion4Data } from 'src/app/core/domain/entities';

// Legacy services (temporal, para compatibilidad)
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { CentrosPobladosActivosService } from 'src/app/core/services/centros-poblados-activos.service';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';

// Domain Services
import { Seccion4TextGeneratorService } from 'src/app/core/services/domain/seccion4-text-generator.service';
import { Seccion4DataService } from 'src/app/core/services/domain/seccion4-data.service';

// ProjectState
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';

import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';

@Component({
    imports: [
        CommonModule,
        CoreSharedModule
    ],
    selector: 'app-seccion4',
    templateUrl: './seccion4.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion4Component implements OnInit, OnDestroy {
  @Input() seccionId: string = '3.1.4.A.1';
  @Input() modoFormulario: boolean = false;

  readonly PHOTO_PREFIX_UBICACION = 'fotografiaUbicacionReferencial';
  readonly PHOTO_PREFIX_POBLACION = 'fotografiaPoblacionViviendas';

  readonly PHOTO_PREFIX = '';

  // Clean Architecture properties
  viewModel$!: Observable<Seccion4ViewModel>;
  private destroy$ = new Subject<void>();

  // Legacy compatibility properties (temporal)
  photoGroupsConfig: any[] = [];
  datos: any = {};
  imageService: any;

  // Properties for photo management
  private photoGroups: Map<string, any[]> = new Map();
  private stateSubscription?: any;
  private isProcessingPipeline = false;

  constructor(
    private cdRef: ChangeDetectorRef,
    private injector: Injector,
    private loadSeccion4UseCase: LoadSeccion4UseCase,
    private updateSeccion4UseCase: UpdateSeccion4DataUseCase,
    private stateAdapter: ReactiveStateAdapter,
    private centrosPobladosActivos: CentrosPobladosActivosService,
    private autoLoader: AutoBackendDataLoaderService,
    private textGen: Seccion4TextGeneratorService,
    private dataSrv: Seccion4DataService,
    private projectFacade: ProjectStateFacade
  ) {
    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX_UBICACION, label: 'Ubicación' },
      { prefix: this.PHOTO_PREFIX_POBLACION, label: 'Población' }
    ];
  }

  ngOnInit(): void {
    // Load ViewModel using Clean Architecture
    this.viewModel$ = this.loadSeccion4UseCase.execute();

    // Legacy compatibility initialization
    this.initDataPipeline();
    this.cargarFotografias();

    // Suscribirse a cambios de datos para actualizar fotografías en tiempo real
    this.stateSubscription = this.stateAdapter.datos$.subscribe(() => {
      this.cargarFotografias();
      this.cdRef.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stateSubscription?.unsubscribe();
  }

  // Legacy compatibility methods (temporal)
  private setPhotoGroup(prefix: string, photos: any[]): void {
    this.photoGroups.set(prefix, photos);
  }

  getPhotoGroup(prefix: string): any[] {
    return this.photoGroups.get(prefix) || [];
  }

  cargarFotografias(): void {
    // Legacy photo loading - will be refactored in future phases
    if (!this.imageService) return;

    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);

    // Cargar fotos de ubicación
    const fotosUbicacion = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_UBICACION,
      groupPrefix
    );
    this.setPhotoGroup(this.PHOTO_PREFIX_UBICACION, fotosUbicacion);

    // Cargar fotos de población
    const fotosPoblacion = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_POBLACION,
      groupPrefix
    );
    this.setPhotoGroup(this.PHOTO_PREFIX_POBLACION, fotosPoblacion);

    this.cdRef.markForCheck();
  }

  private initDataPipeline(): void {
    if (this.isProcessingPipeline) return;
    this.isProcessingPipeline = true;

    try {
      this.llenarTablaAutomaticamenteSiNecesario();
      this.cargarDatosBackend();
      this.cargarTodosLosGrupos();
      this.inicializarParrafos();
    } finally {
      this.isProcessingPipeline = false;
    }
  }

  // Legacy methods - simplified for Clean Architecture transition
  private obtenerPrefijoGrupo(): string {
    return '';
  }

  private obtenerNombreComunidadActual(): string {
    return 'Comunidad';
  }

  private onFieldChange(field: string, value: any, options?: any): void {
    this.datos[field] = value;
    if (options?.refresh !== false) {
      this.cdRef.markForCheck();
    }
  }

  private actualizarDatos(): void {
    // Usar projectFacade para actualizar campos
    this.projectFacade.setFields(this.seccionId, null, this.datos);
  }

  private cargarDatosBackend(): void {
    // Simplified backend data loading for transition
  }

  private cargarTodosLosGrupos(): void {
    // Simplified group loading for transition
  }

  private inicializarParrafos(): void {
    // Simplified paragraph initialization for transition
  }

  private llenarTablaAutomaticamenteSiNecesario(): void {
    // Simplified table filling for transition
  }
}

