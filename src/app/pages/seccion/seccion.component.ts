import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentRef, EnvironmentInjector, Inject, OnDestroy, OnInit, Type, ViewChild, ViewContainerRef, Injector, effect } from '@angular/core';
import { SectionReferenceValidationService, SectionReferenceError } from 'src/app/core/services/section-reference-validation.service';
import { FormStateService } from 'src/app/core/services/state/form-state.service';
import { FormPersistenceService } from 'src/app/core/services/state/form-persistence.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { DataService } from 'src/app/core/services/data.service';
import { ConfigService } from 'src/app/core/services/config.service';
import { TextNormalizationService } from 'src/app/core/services/text-normalization.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { FieldMappingFacade } from 'src/app/core/services/field-mapping/field-mapping.facade';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { SectionNavigationService } from 'src/app/core/services/section-navigation.service';
import { MockDataService } from 'src/app/core/services/infrastructure/mock-data.service';
import { FormularioMockService } from 'src/app/core/services/formulario-mock.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { StorageFacade } from 'src/app/core/services/infrastructure/storage-facade.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { debugLog } from 'src/app/shared/utils/debug';
import { Subscription } from 'rxjs';
import { FormularioDatos, ComunidadCampesina } from 'src/app/core/models/formulario.model';
import { FotoItem } from 'src/app/shared/components/image-upload/image-upload.component';

type ComponentLoader = () => Promise<Type<any>>;

@Component({
    selector: 'app-seccion',
    templateUrl: './seccion.component.html',
    styleUrls: ['./seccion.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SeccionComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('previewHost', { read: ViewContainerRef }) private previewHost?: ViewContainerRef;
  @ViewChild('formHost', { read: ViewContainerRef }) private formHost?: ViewContainerRef;

  private previewComponentRef?: ComponentRef<any>;
  private formComponentRef?: ComponentRef<any>;
  private viewInitialized = false;
  private renderSeq = 0;
  isSectionComponentLoading = false;
  private readonly componentLoaders = {
    seccion1: () => import('src/app/shared/components/seccion1/seccion1.component').then(m => m.Seccion1Component as unknown as Type<any>),
    seccion2: () => import('src/app/shared/components/seccion2/seccion2.component').then(m => m.Seccion2Component as unknown as Type<any>),
    seccion3: () => import('src/app/shared/components/seccion3/seccion3.component').then(m => m.Seccion3Component as unknown as Type<any>),
    seccion4: () => import('src/app/shared/components/seccion4/seccion4.component').then(m => m.Seccion4Component as unknown as Type<any>),
    seccion5: () => import('src/app/shared/components/seccion5/seccion5.component').then(m => m.Seccion5Component as unknown as Type<any>),
    seccion6: () => import('src/app/shared/components/seccion6/seccion6.component').then(m => m.Seccion6Component as unknown as Type<any>),
    seccion7View: () => import('src/app/shared/components/seccion7/seccion7-view.component').then(m => m.Seccion7ViewComponent as unknown as Type<any>),
    seccion8: () => import('src/app/shared/components/seccion8/seccion8.component').then(m => m.Seccion8Component as unknown as Type<any>),
    seccion9: () => import('src/app/shared/components/seccion9/seccion9.component').then(m => m.Seccion9Component as unknown as Type<any>),
    seccion10: () => import('src/app/shared/components/seccion10/seccion10.component').then(m => m.Seccion10Component as unknown as Type<any>),
    seccion11: () => import('src/app/shared/components/seccion11/seccion11.component').then(m => m.Seccion11Component as unknown as Type<any>),
    seccion12: () => import('src/app/shared/components/seccion12/seccion12.component').then(m => m.Seccion12Component as unknown as Type<any>),
    seccion13: () => import('src/app/shared/components/seccion13/seccion13.component').then(m => m.Seccion13Component as unknown as Type<any>),
    seccion14: () => import('src/app/shared/components/seccion14/seccion14.component').then(m => m.Seccion14Component as unknown as Type<any>),
    seccion15: () => import('src/app/shared/components/seccion15/seccion15.component').then(m => m.Seccion15Component as unknown as Type<any>),
    seccion16: () => import('src/app/shared/components/seccion16/seccion16.component').then(m => m.Seccion16Component as unknown as Type<any>),
    seccion17: () => import('src/app/shared/components/seccion17/seccion17.component').then(m => m.Seccion17Component as unknown as Type<any>),
    seccion18: () => import('src/app/shared/components/seccion18/seccion18.component').then(m => m.Seccion18Component as unknown as Type<any>),
    seccion19: () => import('src/app/shared/components/seccion19/seccion19.component').then(m => m.Seccion19Component as unknown as Type<any>),
    seccion20: () => import('src/app/shared/components/seccion20/seccion20.component').then(m => m.Seccion20Component as unknown as Type<any>),
    seccion21: () => import('src/app/shared/components/seccion21/seccion21.component').then(m => m.Seccion21Component as unknown as Type<any>),
    seccion22: () => import('src/app/shared/components/seccion22/seccion22.component').then(m => m.Seccion22Component as unknown as Type<any>),
    seccion23: () => import('src/app/shared/components/seccion23/seccion23.component').then(m => m.Seccion23Component as unknown as Type<any>),
    seccion24: () => import('src/app/shared/components/seccion24/seccion24.component').then(m => m.Seccion24Component as unknown as Type<any>),
    seccion25: () => import('src/app/shared/components/seccion25/seccion25.component').then(m => m.Seccion25Component as unknown as Type<any>),
    seccion26: () => import('src/app/shared/components/seccion26/seccion26.component').then(m => m.Seccion26Component as unknown as Type<any>),
    seccion27: () => import('src/app/shared/components/seccion27/seccion27.component').then(m => m.Seccion27Component as unknown as Type<any>),
    seccion28: () => import('src/app/shared/components/seccion28/seccion28.component').then(m => m.Seccion28Component as unknown as Type<any>),
    seccion29: () => import('src/app/shared/components/seccion29/seccion29.component').then(m => m.Seccion29Component as unknown as Type<any>),
    seccion30: () => import('src/app/shared/components/seccion30/seccion30.component').then(m => m.Seccion30Component as unknown as Type<any>),
    seccion31: () => import('src/app/shared/components/seccion31/seccion31.component').then(m => m.Seccion31Component as unknown as Type<any>),
    seccion32: () => import('src/app/shared/components/seccion32/seccion32.component').then(m => m.Seccion32Component as unknown as Type<any>),
    seccion33: () => import('src/app/shared/components/seccion33/seccion33.component').then(m => m.Seccion33Component as unknown as Type<any>),
    seccion34: () => import('src/app/shared/components/seccion34/seccion34.component').then(m => m.Seccion34Component as unknown as Type<any>),
    seccion35: () => import('src/app/shared/components/seccion35/seccion35.component').then(m => m.Seccion35Component as unknown as Type<any>),
    seccion36: () => import('src/app/shared/components/seccion36/seccion36.component').then(m => m.Seccion36Component as unknown as Type<any>),

    seccion2Form: () => import('src/app/shared/components/seccion2/seccion2-form.component').then(m => m.Seccion2FormComponent as unknown as Type<any>),
    seccion3Form: () => import('src/app/shared/components/seccion3/seccion3-form.component').then(m => m.Seccion3FormComponent as unknown as Type<any>),

    seccion1FormWrapper: () => import('src/app/shared/components/forms/seccion1-form-wrapper.component').then(m => m.Seccion1FormWrapperComponent as unknown as Type<any>),
    seccion2FormWrapper: () => import('src/app/shared/components/forms/seccion2-form-wrapper.component').then(m => m.Seccion2FormWrapperComponent as unknown as Type<any>),
    seccion4FormWrapper: () => import('src/app/shared/components/forms/seccion4-form-wrapper.component').then(m => m.Seccion4FormWrapperComponent as unknown as Type<any>),
    seccion7FormWrapper: () => import('src/app/shared/components/forms/seccion7-form-wrapper.component').then(m => m.Seccion7FormWrapperComponent as unknown as Type<any>),
    seccion14FormWrapper: () => import('src/app/shared/components/forms/seccion14-form-wrapper.component').then(m => m.Seccion14FormWrapperComponent as unknown as Type<any>),
    seccion15FormWrapper: () => import('src/app/shared/components/forms/seccion15-form-wrapper.component').then(m => m.Seccion15FormWrapperComponent as unknown as Type<any>),
    seccion16FormWrapper: () => import('src/app/shared/components/forms/seccion16-form-wrapper.component').then(m => m.Seccion16FormWrapperComponent as unknown as Type<any>),
    seccion17FormWrapper: () => import('src/app/shared/components/forms/seccion17-18-form-wrapper.component').then(m => m.Seccion17FormWrapperComponent as unknown as Type<any>),
    seccion30FormWrapper: () => import('src/app/shared/components/forms/seccion30-form-wrapper.component').then(m => m.Seccion30FormWrapperComponent as unknown as Type<any>),
  } satisfies Record<string, ComponentLoader>;

  private readonly formRules = this.createFormRules();
  
  seccionId: string = '';
  seccionTitulo: string = '';
  seccionPadreTitulo: string = '';
  datos: FormularioDatos = {} as FormularioDatos;
  formData: Partial<FormularioDatos> = {};
  datos$ = this.stateAdapter.datos$;
  private scrollRealizado: boolean = false;
  puedeIrAnterior: boolean = false;
  puedeIrSiguiente: boolean = false;
  esUltimaSeccion: boolean = false;
  isResizing: boolean = false;
  previewFlex: string = '1';
  formularioFlex: string = '0 0 400px';
  private subscriptions: Subscription[] = [];

  fotografiasAISDFormMulti: FotoItem[] = [];
  filasTablaAISD2: number = 1;
  jsonFileName: string = '';
  centrosPobladosJSON: any[] = [];
  comunidadesCampesinas: ComunidadCampesina[] = [];
  geoInfo: any = {};
  autocompleteData: any = {};
  testDataActive = false;
  validationErrors: SectionReferenceError[] = [];
  canNavigateValidation = true;
  private validationDisposer?: { destroy: () => void };
  
  // Mobile view toggle
  mobileViewMode: 'preview' | 'form' = 'form'; // Por defecto mostrar formulario en mobile

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectFacade: ProjectStateFacade,
    private formularioMock: FormularioMockService,
    private dataService: DataService,
    private configService: ConfigService,
    private cdRef: ChangeDetectorRef,
    private textNormalization: TextNormalizationService,
    private stateAdapter: ReactiveStateAdapter,
    private fieldMapping: FieldMappingFacade,
    private imageService: ImageManagementService,
    private navigationService: SectionNavigationService,
    private mockDataService: MockDataService,
    private tableFacade: TableManagementFacade,
    private formChange: FormChangeService,
    private environmentInjector: EnvironmentInjector,
    private injector: Injector,
    private formPersistence: FormPersistenceService,
    private storage: StorageFacade,
    private validationService: SectionReferenceValidationService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        const newSeccionId = params['id'];
        // Solo recargar si la sección realmente cambió
        if (this.seccionId !== newSeccionId) {
          this.seccionId = newSeccionId;
          // Ejecutar cargarSeccion como async pero sin bloquear
          void this.cargarSeccion();
        }
      })
    );
    
    this.datos = this.projectFacade.obtenerDatos() as FormularioDatos;
    this.formData = { ...this.datos };
    this.stateAdapter.setDatos(this.datos);
    
    this.centrosPobladosJSON = this.datos['centrosPobladosJSON'] || [];
    this.comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
    this.geoInfo = this.datos['geoInfo'] || {};
    this.jsonFileName = this.datos['jsonFileName'] || '';
    
    this.subscriptions.push(
      this.datos$.subscribe(datos => {
        if (datos) {
          this.datos = datos;
          this.centrosPobladosJSON = datos['centrosPobladosJSON'] || [];
          this.comunidadesCampesinas = datos['comunidadesCampesinas'] || [];
          this.geoInfo = datos['geoInfo'] || {};
          this.jsonFileName = datos['jsonFileName'] || '';

          // ✅ Actualizar estado de navegación cuando los datos cambian (habilita/deshabilita Anterior/Siguiente)
          this.actualizarEstadoNavegacion();
          this.cdRef.markForCheck();
        }
      })
    );

    this.validationDisposer = effect(() => {
      this.validationErrors = Array.from(this.validationService.errors());
      this.canNavigateValidation = this.validationService.isValid();
      if (!this.canNavigateValidation) {
        this.actualizarEstadoNavegacion();
      }
    }, { allowSignalWrites: true });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    // Renderizar los componentes ahora que la vista está lista
    if (this.seccionId) {
      void this.renderSectionComponents();
    }
  }

  async cargarSeccion() {
    this.actualizarTitulo();
    this.datos = this.projectFacade.obtenerDatos() as FormularioDatos;
    this.formData = { ...this.datos };
    this.centrosPobladosJSON = this.datos['centrosPobladosJSON'] || [];
    this.comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
    this.geoInfo = this.datos['geoInfo'] || {};
    this.jsonFileName = this.datos['jsonFileName'] || '';
    this.testDataActive = this.fieldMapping.hasAnyTestDataForSection(this.seccionId);
    this.sincronizarStoreConDatosPersistidos();
    this.actualizarEstadoNavegacion();
    this.scrollRealizado = false;

    await this.renderSectionComponents();

    setTimeout(() => {
      // Scroll al inicio de los contenedores al cambiar de sección
      this.scrollContainersToTop();
      
      // No llamar actualizarComponenteSeccion aquí para evitar bucles
      const seccion2 = ViewChildHelper.getComponent('seccion2');
      if (seccion2 && seccion2['autocompleteData']) {
        this.autocompleteData = seccion2['autocompleteData'];
      }
      const seccion4 = ViewChildHelper.getComponent('seccion4');
      if (seccion4 && seccion4['autocompleteData']) {
        this.autocompleteData = { ...this.autocompleteData, ...seccion4['autocompleteData'] };
      }
    }, 50);
  }
  
  /**
   * Scroll al inicio de los contenedores de preview y formulario
   */
  private scrollContainersToTop(): void {
    const previewContent = document.querySelector('.preview-content');
    const formularioContent = document.querySelector('.formulario-content');
    
    if (previewContent) {
      previewContent.scrollTop = 0;
    }
    if (formularioContent) {
      formularioContent.scrollTop = 0;
    }
  }

  private async renderSectionComponents(): Promise<void> {
    if (!this.viewInitialized) return;
    if (!this.previewHost || !this.formHost) return;
    if (!this.seccionId) return;

    const currentSeq = ++this.renderSeq;
    this.isSectionComponentLoading = true;

    this.clearDynamicComponents();
    this.cdRef.markForCheck();

    try {
      const previewRenderer = this.resolvePreviewRenderer(this.seccionId);
      const formRenderer = this.resolveFormRenderer(this.seccionId);

      const [previewType, formType] = await Promise.all([
        previewRenderer ? previewRenderer.loader() : Promise.resolve(null),
        formRenderer ? formRenderer.loader() : Promise.resolve(null),
      ]);

      if (currentSeq !== this.renderSeq) return;

      if (previewRenderer && previewType) {
        this.previewComponentRef = this.previewHost.createComponent(previewType, { environmentInjector: this.environmentInjector });
        this.applyInputs(this.previewComponentRef, previewRenderer.inputs);
        this.previewComponentRef.changeDetectorRef.detectChanges();
        this.registerComponentForSection(this.seccionId, this.previewComponentRef.instance, true);
      }

      if (formRenderer && formType) {
        this.formComponentRef = this.formHost.createComponent(formType, { environmentInjector: this.environmentInjector });
        this.applyInputs(this.formComponentRef, formRenderer.inputs);
        this.formComponentRef.changeDetectorRef.detectChanges();
        // El registro preferente viene del preview, salvo casos especiales (seccion2/seccion3)
        this.registerComponentForSection(this.seccionId, this.formComponentRef.instance, false);

        // Algunos wrappers exponen el componente interno después de un ciclo de render
        setTimeout(() => {
          if (currentSeq !== this.renderSeq) return;
          this.registerComponentForSection(this.seccionId, this.formComponentRef?.instance, false);
        }, 0);
      }
    } finally {
      if (currentSeq === this.renderSeq) {
        this.isSectionComponentLoading = false;
        this.cdRef.markForCheck();
      }
    }
  }

  private clearDynamicComponents(): void {
    try {
      this.previewComponentRef?.destroy();
    } catch {}
    try {
      this.formComponentRef?.destroy();
    } catch {}
    this.previewComponentRef = undefined;
    this.formComponentRef = undefined;
    this.previewHost?.clear();
    this.formHost?.clear();
  }

  private applyInputs(ref: ComponentRef<any>, inputs: { [key: string]: any } | undefined | null): void {
    if (!inputs) return;
    for (const [key, value] of Object.entries(inputs)) {
      try {
        ref.setInput(key, value);
      } catch {
        // Ignorar inputs desconocidos
      }
    }
  }

  private registerComponentForSection(seccionId: string, instance: any, preferPreview: boolean): void {
    const componentId = this.resolveComponentId(seccionId);
    if (!componentId || !instance) return;

    // Mantener el comportamiento anterior: seccion2/seccion3 se registran desde el form wrapper
    if (preferPreview && (componentId === 'seccion2' || componentId === 'seccion3')) {
      return;
    }

    if (preferPreview && ViewChildHelper.hasComponent(componentId)) {
      return;
    }

    // Casos especiales: wrappers que exponen componente interno
    if (componentId === 'seccion2' && instance.seccion2Component) {
      ViewChildHelper.registerComponent(componentId, instance.seccion2Component);
      return;
    }
    if (componentId === 'seccion3' && instance.seccion3Component) {
      ViewChildHelper.registerComponent(componentId, instance.seccion3Component);
      return;
    }
    if (componentId === 'seccion7' && instance.seccion7InternalComponent) {
      ViewChildHelper.registerComponent(componentId, instance.seccion7InternalComponent);
      return;
    }

    ViewChildHelper.registerComponent(componentId, instance);
  }

  actualizarTitulo() {
    const titulos: { [key: string]: string } = {
      '3.1.1': '3.1.1 Objetivos de la línea base social',
      '3.1.2': '3.1.2 Delimitación de las áreas de influencia social',
      '3.1.2.A': 'A. Área de Influencia Social Directa (AISD)',
      '3.1.2.B': 'B. Área de Influencia Social Indirecta (AISI)',
      '3.1.3.A': 'A. Fuentes primarias',
      '3.1.3.B': 'B. Fuentes secundarias',
      '3.1.4': '3.1.4 Caracterización socioeconómica de las áreas de influencia social',
      '3.1.4.A': '3.1.4 Caracterización socioeconómica de las áreas de influencia social',
      '3.1.4.A.1': '3.1.4 Caracterización socioeconómica de las áreas de influencia social',
      '3.1.4.A.2': '3.1.4 Caracterización socioeconómica de las áreas de influencia social',
      '3.1.4.B': 'B. Caracterización socioeconómica del Área de Influencia Social Indirecta (AISI)',
      '3.1.4.B.1': 'B.1 Centro Poblado',
      '3.1.4.B.2': 'B.2 Centro Poblado',
      '3.1.4.A.1.1': 'A.1.1 Institucionalidad local',
      '3.1.4.A.2.1': 'A.2.1 Institucionalidad local',
      '3.1.4.A.1.2': 'A.1.2 Aspectos demográficos',
      '3.1.4.A.1.3': 'A.1.3 Aspectos económicos',
      '3.1.4.A.1.4': 'A.1.4 Actividades económicas',
      '3.1.4.A.1.5': 'A.1.5 Viviendas',
      '3.1.4.A.1.6': 'A.1.6 Servicios básicos',
      '3.1.4.A.1.7': 'A.1.7 Transporte y telecomunicaciones',
      '3.1.4.A.1.8': 'A.1.8 Infraestructura en salud, educación, recreación y deporte',
      '3.1.4.A.1.9': 'A.1.9 Indicadores de salud',
      '3.1.4.A.1.10': 'A.1.10 Indicadores de educación',
      '3.1.4.A.1.11': 'A.1.11 Aspectos culturales',
      '3.1.4.A.1.12': 'A.1.12 Agua, uso de suelos y recursos naturales',
      '3.1.4.A.1.13': 'A.1.13 Índice de Desarrollo Humano (IDH)',
      '3.1.4.A.1.14': 'A.1.14 Necesidades Básicas Insatisfechas (NBI)',
      '3.1.4.A.1.15': 'A.1.15 Organización social y liderazgo',
      '3.1.4.A.1.16': 'A.1.16 Festividades y tradiciones',
      '3.1.4.A.2.2': 'A.2.2 Aspectos demográficos',
      '3.1.4.A.2.3': 'A.2.3 Aspectos económicos',
      '3.1.4.A.2.4': 'A.2.4 Actividades económicas',
      '3.1.4.A.2.5': 'A.2.5 Viviendas',
      '3.1.4.A.2.6': 'A.2.6 Servicios básicos',
      '3.1.4.A.2.7': 'A.2.7 Transporte y telecomunicaciones',
      '3.1.4.A.2.8': 'A.2.8 Infraestructura en salud, educación, recreación y deporte',
      '3.1.4.A.2.9': 'A.2.9 Indicadores de salud',
      '3.1.4.A.2.10': 'A.2.10 Indicadores de educación',
      '3.1.4.A.2.11': 'A.2.11 Aspectos culturales',
      '3.1.4.A.2.12': 'A.2.12 Agua, uso de suelos y recursos naturales',
      '3.1.4.A.2.13': 'A.2.13 Índice de Desarrollo Humano (IDH)',
      '3.1.4.A.2.14': 'A.2.14 Necesidades Básicas Insatisfechas (NBI)',
      '3.1.4.A.2.15': 'A.2.15 Organización social y liderazgo',
      '3.1.4.A.2.16': 'A.2.16 Festividades y tradiciones',
      '3.1.4.B.1.1': 'B.1.1 Aspectos demográficos',
      '3.1.4.B.1.2': 'B.1.2 Indicadores y distribución de la PEA',
      '3.1.4.B.1.3': 'B.1.3 Actividades económicas',
      '3.1.4.B.1.4': 'B.1.4 Vivienda',
      '3.1.4.B.1.5': 'B.1.5 Servicios básicos',
      '3.1.4.B.1.6': 'B.1.6 Infraestructura de transporte y comunicaciones',
      '3.1.4.B.1.7': 'B.1.7 Infraestructura en salud, educación, recreación y deporte',
      '3.1.4.B.1.8': 'B.1.8 Indicadores de salud',
      '3.1.4.B.1.9': 'B.1.9 Indicadores de educación',
      '3.1.4.B.1.10': 'B.1.10 Aspectos culturales',
      '3.1.4.B.1.11': 'B.1.11 Agua, uso de suelos y recursos naturales',
      '3.1.4.B.1.12': 'B.1.12 Índice de Desarrollo Humano (IDH)',
      '3.1.4.B.1.13': 'B.1.13 Necesidades Básicas Insatisfechas (NBI)',
      '3.1.4.B.1.14': 'B.1.14 Organización social y liderazgo',
      '3.1.4.B.1.15': 'B.1.15 Festividades, costumbres y turismo',
      '3.1.4.B.2.1': 'B.2.1 Aspectos demográficos',
      '3.1.4.B.2.2': 'B.2.2 Indicadores y distribución de la PEA',
      '3.1.4.B.2.3': 'B.2.3 Actividades económicas',
      '3.1.4.B.2.4': 'B.2.4 Vivienda',
      '3.1.4.B.2.5': 'B.2.5 Servicios básicos',
      '3.1.4.B.2.6': 'B.2.6 Infraestructura de transporte y comunicaciones',
      '3.1.4.B.2.7': 'B.2.7 Infraestructura en salud, educación, recreación y deporte',
      '3.1.4.B.2.8': 'B.2.8 Indicadores de salud',
      '3.1.4.B.2.9': 'B.2.9 Indicadores de educación',
      '3.1.4.B.2.10': 'B.2.10 Aspectos culturales',
      '3.1.4.B.2.11': 'B.2.11 Agua, uso de suelos y recursos naturales',
      '3.1.4.B.2.12': 'B.2.12 Índice de Desarrollo Humano (IDH)',
      '3.1.4.B.2.13': 'B.2.13 Necesidades Básicas Insatisfechas (NBI)',
      '3.1.4.B.2.14': 'B.2.14 Organización social y liderazgo',
      '3.1.4.B.2.15': 'B.2.15 Festividades, costumbres y turismo'
    };
    this.seccionTitulo = titulos[this.seccionId] || 'Sección';
    this.obtenerTituloSeccionPadre();
  }

  obtenerTituloSeccionPadre() {
    const seccionesPadre: { [key: string]: string } = {
      '3.1.1': '3.1 Descripción y caracterización de los aspectos sociales, culturales y antropológicos',
      '3.1.2': '3.1 Descripción y caracterización de los aspectos sociales, culturales y antropológicos',
      '3.1.2.A': '3.1.2 Delimitación de las áreas de influencia social',
      '3.1.2.B': '3.1.2 Delimitación de las áreas de influencia social',
      '3.1.3': '3.1 Descripción y caracterización de los aspectos sociales, culturales y antropológicos',
      '3.1.3.A': '3.1.3 Índices demográficos, sociales, económicos, de ocupación laboral y otros similares',
      '3.1.3.B': '3.1.3 Índices demográficos, sociales, económicos, de ocupación laboral y otros similares',
      '3.1.4': '3.1 Descripción y caracterización de los aspectos sociales, culturales y antropológicos',
      '3.1.4.A': '3.1.4 Caracterización socioeconómica de las áreas de influencia social',
      '3.1.4.B': '3.1.4 Caracterización socioeconómica de las áreas de influencia social',
      '3.1.4.A.1': 'A. Caracterización socioeconómica del Área de Influencia Social Directa (AISD)',
      '3.1.4.A.2': 'A. Caracterización socioeconómica del Área de Influencia Social Directa (AISD)',
      '3.1.4.B.1': 'B. Caracterización socioeconómica del Área de Influencia Social Indirecta (AISI)',
      '3.1.4.B.2': 'B. Caracterización socioeconómica del Área de Influencia Social Indirecta (AISI)'
    };

    this.seccionPadreTitulo = seccionesPadre[this.seccionId] || '';
  }

  private resolvePreviewRenderer(seccionId: string): { loader: ComponentLoader; inputs: { [key: string]: any } } | null {
    if (!seccionId) return null;

    const inputs = this.getPreviewInputs(seccionId);

    // ✅ AISD: Subsecciones dinámicas (A.1.X, A.2.X, A.3.X, etc.)
    if (this.esSubseccionAISD(seccionId, 1)) return { loader: this.componentLoaders.seccion5, inputs };
    if (this.esSubseccionAISD(seccionId, 2)) return { loader: this.componentLoaders.seccion6, inputs };
    if (this.esSubseccionAISD(seccionId, 3)) return { loader: this.componentLoaders.seccion7View, inputs };
    if (this.esSubseccionAISD(seccionId, 4)) return { loader: this.componentLoaders.seccion8, inputs };
    if (this.esSubseccionAISD(seccionId, 5)) return { loader: this.componentLoaders.seccion9, inputs };
    if (this.esSubseccionAISD(seccionId, 6)) return { loader: this.componentLoaders.seccion10, inputs };
    if (this.esSubseccionAISD(seccionId, 7)) return { loader: this.componentLoaders.seccion11, inputs };
    if (this.esSubseccionAISD(seccionId, 8)) return { loader: this.componentLoaders.seccion12, inputs };
    if (this.esSubseccionAISD(seccionId, 9)) return { loader: this.componentLoaders.seccion13, inputs };
    if (this.esSubseccionAISD(seccionId, 10)) return { loader: this.componentLoaders.seccion14, inputs };
    if (this.esSubseccionAISD(seccionId, 11)) return { loader: this.componentLoaders.seccion15, inputs };
    if (this.esSubseccionAISD(seccionId, 12)) return { loader: this.componentLoaders.seccion16, inputs };
    if (this.esSubseccionAISD(seccionId, 13)) return { loader: this.componentLoaders.seccion17, inputs };
    if (this.esSubseccionAISD(seccionId, 14)) return { loader: this.componentLoaders.seccion18, inputs };
    if (this.esSubseccionAISD(seccionId, 15)) return { loader: this.componentLoaders.seccion19, inputs };
    if (this.esSubseccionAISD(seccionId, 16)) return { loader: this.componentLoaders.seccion20, inputs };

    // ✅ AISI: Subsecciones dinámicas (B.1.X, B.2.X, B.3.X, etc.)
    if (this.esSubseccionAISI(seccionId, 1)) return { loader: this.componentLoaders.seccion22, inputs };
    if (this.esSubseccionAISI(seccionId, 2)) return { loader: this.componentLoaders.seccion23, inputs };
    if (this.esSubseccionAISI(seccionId, 3)) return { loader: this.componentLoaders.seccion24, inputs };
    if (this.esSubseccionAISI(seccionId, 4)) return { loader: this.componentLoaders.seccion25, inputs };
    if (this.esSubseccionAISI(seccionId, 5)) return { loader: this.componentLoaders.seccion26, inputs };
    if (this.esSubseccionAISI(seccionId, 6)) return { loader: this.componentLoaders.seccion27, inputs };
    if (this.esSubseccionAISI(seccionId, 7)) return { loader: this.componentLoaders.seccion28, inputs };
    if (this.esSubseccionAISI(seccionId, 8)) return { loader: this.componentLoaders.seccion29, inputs };
    if (this.esSubseccionAISI(seccionId, 9)) return { loader: this.componentLoaders.seccion30, inputs };
    if (this.esSubseccionAISI(seccionId, 10)) return { loader: this.componentLoaders.seccion31, inputs };
    if (this.esSubseccionAISI(seccionId, 11)) return { loader: this.componentLoaders.seccion32, inputs };
    if (this.esSubseccionAISI(seccionId, 12)) return { loader: this.componentLoaders.seccion33, inputs };
    if (this.esSubseccionAISI(seccionId, 13)) return { loader: this.componentLoaders.seccion34, inputs };
    if (this.esSubseccionAISI(seccionId, 14)) return { loader: this.componentLoaders.seccion35, inputs };
    if (this.esSubseccionAISI(seccionId, 15)) return { loader: this.componentLoaders.seccion36, inputs };

    // ✅ Secciones raíz AISD (A.X) - cualquier grupo
    if (seccionId.match(/^3\.1\.4\.A(\.\d+)?$/)) {
      return { loader: this.componentLoaders.seccion4, inputs: { seccionId, modoFormulario: false } };
    }

    // ✅ Secciones raíz AISI (B.X) - cualquier grupo
    if (seccionId.match(/^3\.1\.4\.B(\.\d+)?$/)) {
      return { loader: this.componentLoaders.seccion21, inputs };
    }

    const componentMap: Partial<Record<string, ComponentLoader>> = {
      '3.1.1': this.componentLoaders.seccion1,
      '3.1.2': this.componentLoaders.seccion2,
      '3.1.2.A': this.componentLoaders.seccion2,
      '3.1.2.B': this.componentLoaders.seccion2,
      '3.1.3': this.componentLoaders.seccion3,
      '3.1.3.A': this.componentLoaders.seccion3,
      '3.1.3.B': this.componentLoaders.seccion3,
    };

    const loader = componentMap[seccionId];
    return loader ? { loader, inputs } : null;
  }

  private getPreviewInputs(seccionId: string): { [key: string]: any } {
    if (seccionId === '3.1.4.B' || seccionId === '3.1.4.B.1' || seccionId === '3.1.4.B.2') {
      return {};
    }
    if (seccionId === '3.1.4.A' || seccionId === '3.1.4.A.1' || seccionId === '3.1.4.A.2') {
      return { seccionId, modoFormulario: false };
    }
    return { seccionId };
  }

  private resolveComponentId(seccionId: string): string | undefined {
    const componentIdMap: { [key: string]: string } = {
      '3.1.1': 'seccion1',
      '3.1.2': 'seccion2',
      '3.1.2.A': 'seccion2',
      '3.1.2.B': 'seccion2',
      '3.1.3': 'seccion3',
      '3.1.3.A': 'seccion3',
      '3.1.3.B': 'seccion3',
      '3.1.4.A': 'seccion4',
      '3.1.4.A.1': 'seccion4',
      '3.1.4.A.2': 'seccion4',
      '3.1.4.A.1.1': 'seccion5',
      '3.1.4.A.1.2': 'seccion6',
      '3.1.4.A.1.3': 'seccion7',
      '3.1.4.A.1.4': 'seccion8',
      '3.1.4.A.1.5': 'seccion9',
      '3.1.4.A.1.6': 'seccion10',
      '3.1.4.A.1.7': 'seccion11',
      '3.1.4.A.1.8': 'seccion12',
      '3.1.4.A.1.9': 'seccion13',
      '3.1.4.A.1.10': 'seccion14',
      '3.1.4.A.1.11': 'seccion15',
      '3.1.4.A.1.12': 'seccion16',
      '3.1.4.A.1.13': 'seccion17',
      '3.1.4.A.1.14': 'seccion18',
      '3.1.4.A.1.15': 'seccion19',
      '3.1.4.A.1.16': 'seccion20',
      '3.1.4.A.2.1': 'seccion5',
      '3.1.4.A.2.2': 'seccion6',
      '3.1.4.A.2.3': 'seccion7',
      '3.1.4.A.2.4': 'seccion8',
      '3.1.4.A.2.5': 'seccion9',
      '3.1.4.A.2.6': 'seccion10',
      '3.1.4.A.2.7': 'seccion11',
      '3.1.4.A.2.8': 'seccion12',
      '3.1.4.A.2.9': 'seccion13',
      '3.1.4.A.2.10': 'seccion14',
      '3.1.4.A.2.11': 'seccion15',
      '3.1.4.A.2.12': 'seccion16',
      '3.1.4.A.2.13': 'seccion17',
      '3.1.4.A.2.14': 'seccion18',
      '3.1.4.A.2.15': 'seccion19',
      '3.1.4.A.2.16': 'seccion20',
      '3.1.4.B': 'seccion21',
      '3.1.4.B.1': 'seccion21',
      '3.1.4.B.1.1': 'seccion22',
      '3.1.4.B.1.2': 'seccion23',
      '3.1.4.B.1.3': 'seccion24',
      '3.1.4.B.1.4': 'seccion25',
      '3.1.4.B.1.5': 'seccion26',
      '3.1.4.B.1.6': 'seccion27',
      '3.1.4.B.1.7': 'seccion28',
      '3.1.4.B.1.8': 'seccion29',
      '3.1.4.B.1.9': 'seccion30',
      '3.1.4.B.1.10': 'seccion31',
      '3.1.4.B.1.11': 'seccion32',
      '3.1.4.B.1.12': 'seccion33',
      '3.1.4.B.1.13': 'seccion34',
      '3.1.4.B.1.14': 'seccion35',
      '3.1.4.B.1.15': 'seccion36',
      '3.1.4.B.2': 'seccion21',
      '3.1.4.B.2.1': 'seccion22',
      '3.1.4.B.2.2': 'seccion23',
      '3.1.4.B.2.3': 'seccion24',
      '3.1.4.B.2.4': 'seccion25',
      '3.1.4.B.2.5': 'seccion26',
      '3.1.4.B.2.6': 'seccion27',
      '3.1.4.B.2.7': 'seccion28',
      '3.1.4.B.2.8': 'seccion29',
      '3.1.4.B.2.9': 'seccion30',
      '3.1.4.B.2.10': 'seccion31',
      '3.1.4.B.2.11': 'seccion32',
      '3.1.4.B.2.12': 'seccion33',
      '3.1.4.B.2.13': 'seccion34',
      '3.1.4.B.2.14': 'seccion35',
      '3.1.4.B.2.15': 'seccion36'
    };

    return componentIdMap[seccionId];
  }

  private resolveFormRenderer(seccionId: string | undefined | null): { loader: ComponentLoader; inputs: { [key: string]: any } } | null {
    if (!seccionId) return null;

    for (const rule of this.formRules) {
      if (rule.matches(seccionId)) {
        return { loader: rule.loader, inputs: rule.inputs(seccionId) };
      }
    }

    return null;
  }

  private createFormRules(): Array<{
    matches: (seccionId: string) => boolean;
    loader: ComponentLoader;
    inputs: (seccionId: string) => { [key: string]: any };
  }> {
    const eq = (...ids: string[]) => (seccionId: string) => ids.includes(seccionId);
    const hasAny = (...parts: string[]) => (seccionId: string) => parts.some(p => seccionId.includes(p));
    const aisd = (numero: number) => (seccionId: string) => this.esSubseccionAISD(seccionId, numero);

    const withSeccionId = (seccionId: string) => ({ seccionId });
    const withModoFormulario = (seccionId: string) => ({ seccionId, modoFormulario: true });

    return [
      { matches: eq('3.1.1'), loader: this.componentLoaders.seccion1FormWrapper, inputs: withSeccionId },
      { matches: eq('3.1.2', '3.1.2.A', '3.1.2.B'), loader: this.componentLoaders.seccion2FormWrapper, inputs: withSeccionId },
      { matches: eq('3.1.3', '3.1.3.A', '3.1.3.B'), loader: this.componentLoaders.seccion3Form, inputs: withSeccionId },
      {
        matches: hasAny(
          '3.1.4.A.1.13',
          '3.1.4.A.2.13',
          '3.1.4.B.1.13',
          '3.1.4.B.2.13',
          '3.1.4.A.1.14',
          '3.1.4.A.2.14',
          '3.1.4.B.1.14',
          '3.1.4.B.2.14'
        ),
        loader: this.componentLoaders.seccion17FormWrapper,
        inputs: withSeccionId
      },
      { matches: eq('3.1.4.B', '3.1.4.B.1', '3.1.4.B.2'), loader: this.componentLoaders.seccion21, inputs: withModoFormulario },
      { matches: eq('3.1.4', '3.1.4.A', '3.1.4.A.1', '3.1.4.A.2'), loader: this.componentLoaders.seccion4FormWrapper, inputs: withSeccionId },

      { matches: aisd(1), loader: this.componentLoaders.seccion5, inputs: withModoFormulario },
      { matches: aisd(2), loader: this.componentLoaders.seccion6, inputs: withModoFormulario },
      { matches: aisd(3), loader: this.componentLoaders.seccion7FormWrapper, inputs: withSeccionId },
      { matches: aisd(4), loader: this.componentLoaders.seccion8, inputs: withModoFormulario },
      { matches: aisd(5), loader: this.componentLoaders.seccion9, inputs: withModoFormulario },
      { matches: aisd(6), loader: this.componentLoaders.seccion10, inputs: withModoFormulario },
      { matches: aisd(7), loader: this.componentLoaders.seccion11, inputs: withModoFormulario },
      { matches: aisd(8), loader: this.componentLoaders.seccion12, inputs: withModoFormulario },
      { matches: aisd(9), loader: this.componentLoaders.seccion13, inputs: withModoFormulario },
      { matches: aisd(10), loader: this.componentLoaders.seccion14FormWrapper, inputs: withSeccionId },
      { matches: aisd(11), loader: this.componentLoaders.seccion15FormWrapper, inputs: withSeccionId },
      { matches: aisd(12), loader: this.componentLoaders.seccion16FormWrapper, inputs: withSeccionId },
      { matches: aisd(13), loader: this.componentLoaders.seccion17, inputs: withModoFormulario },
      { matches: aisd(14), loader: this.componentLoaders.seccion18, inputs: withModoFormulario },
      { matches: aisd(15), loader: this.componentLoaders.seccion19, inputs: withModoFormulario },
      { matches: aisd(16), loader: this.componentLoaders.seccion20, inputs: withModoFormulario },

      { matches: eq('3.1.4.B.1.1', '3.1.4.B.2.1'), loader: this.componentLoaders.seccion22, inputs: withModoFormulario },
      { matches: eq('3.1.4.B.1.2', '3.1.4.B.2.2'), loader: this.componentLoaders.seccion23, inputs: withModoFormulario },
      { matches: eq('3.1.4.B.1.3', '3.1.4.B.2.3'), loader: this.componentLoaders.seccion24, inputs: withModoFormulario },
      { matches: eq('3.1.4.B.1.4', '3.1.4.B.2.4'), loader: this.componentLoaders.seccion25, inputs: withModoFormulario },
      { matches: eq('3.1.4.B.1.5', '3.1.4.B.2.5'), loader: this.componentLoaders.seccion26, inputs: withModoFormulario },
      { matches: eq('3.1.4.B.1.6', '3.1.4.B.2.6'), loader: this.componentLoaders.seccion27, inputs: withModoFormulario },
      { matches: eq('3.1.4.B.1.7', '3.1.4.B.2.7'), loader: this.componentLoaders.seccion28, inputs: withModoFormulario },
      { matches: eq('3.1.4.B.1.8', '3.1.4.B.2.8'), loader: this.componentLoaders.seccion29, inputs: withModoFormulario },
      { matches: eq('3.1.4.B.1.9', '3.1.4.B.2.9'), loader: this.componentLoaders.seccion30FormWrapper, inputs: withSeccionId }
    ];
  }

  actualizarComponenteSeccion() {
    const componentId = this.resolveComponentId(this.seccionId);
    if (componentId) {
      const component = ViewChildHelper.getComponent(componentId);
      if (component && component['actualizarDatos']) {
        component['actualizarDatos']();
      }
    }
  }

  onFieldChange(fieldId: string, value: any) {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    
    this.formData[fieldId] = valorLimpio;
    this.datos[fieldId] = valorLimpio;
    this.formChange.persistFields(this.seccionId, 'form', { [fieldId]: valorLimpio });
    
    // ✅ Después de cambiar campos, actualizar estado de navegación para reflejar nuevas secciones disponibles
    this.actualizarEstadoNavegacion();

    this.actualizarComponenteSeccion();
    this.cdRef.markForCheck();
  }

  limpiarDatos() {
    if (confirm('¿Está seguro que desea limpiar todos los datos? Esta acción no se puede deshacer.')) {
      try {
        
        // 1. Limpiar campos marcados como test data
        this.fieldMapping.clearTestDataFields();
        
        // 2. Limpiar FormStateService completamente
        try {
          const formState = this.injector.get(FormStateService, null);
          if (formState) {
            formState.resetForm();
          }
        } catch (e) {
        }
        
        // 3. Limpiar FormPersistenceService (todas las secciones)
        try {
          this.formPersistence.clearAll();
        } catch (e) {
        }
        
        // 4. Resetear el estado del proyecto (fuente única de verdad)
        this.projectFacade.reset();
        
        // 5. Resetear datos locales inmediatamente
        this.datos = {} as FormularioDatos;
        this.formData = {};
        this.testDataActive = false;

        // 6. Limpiar todos los datos del localStorage y sessionStorage
        setTimeout(async () => {
          try {
            debugLog('[DEBUG] Ejecutando limpieza completa de storages');
            
            // Guardar el flag de limpieza manual antes de limpiar
            const manualFlag = this.storage.getItem('__datos_limpios_manualmente__');
            
            // Limpiar todas las claves relacionadas con formularios
            const keysToRemove: string[] = [];
            const allKeys = this.storage.keys();
            for (const key of allKeys) {
              // Mantener solo el flag de limpieza manual
              if (key !== '__datos_limpios_manualmente__') {
                keysToRemove.push(key);
              }
            }
            
            // Eliminar todas las claves excepto el flag
            keysToRemove.forEach(key => this.storage.removeItem(key));
            
            // Restaurar el flag si existía
            if (manualFlag === 'true') {
              this.storage.setItem('__datos_limpios_manualmente__', 'true');
            }
            
            // Limpiar sessionStorage completamente
            sessionStorage.clear();
            
            // Limpiar caches del navegador
            if (typeof caches !== 'undefined' && typeof caches.keys === 'function') {
              const cacheNames = await caches.keys();
              await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            

          } catch (err) {
          } finally {
            // Recargar la página para asegurar que todas las secciones se reseteen
            window.location.reload();
          }
        }, 50);
        
        alert('Todos los datos han sido limpiados correctamente. El formulario está listo para volver a llenar desde cero.');
      } catch (error) {
        alert('Ocurrió un error al limpiar los datos. Por favor, intente nuevamente.');
      }
    }
  }

  irAPlantilla() {
    this.router.navigate(['/plantilla'], {
      state: { returnSection: this.seccionId }
    });
  }

  // Toggle entre vista previa y formulario en mobile
  toggleMobileView() {
    this.mobileViewMode = this.mobileViewMode === 'preview' ? 'form' : 'preview';
  }

  /**
   * Sincroniza el store (fields) con los datos persistidos en localStorage
   * para que los formularios que leen por signals vean los datos al cargar/recargar.
   */
  private sincronizarStoreConDatosPersistidos(): void {
    const seccionFields = this.fieldMapping.getFieldsForSection(this.seccionId);
    if (!seccionFields?.length) return;
    const sectionData: Record<string, any> = {};
    for (const field of seccionFields) {
      const value = (this.datos as Record<string, any>)[field];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length === 0) continue;
        sectionData[field] = value;
      }
    }
    if (Object.keys(sectionData).length > 0) {
      this.projectFacade.setFields(this.seccionId, null, sectionData);
    }
  }

  actualizarEstadoNavegacion() {
    const datosActualizados = this.projectFacade.obtenerDatos() as FormularioDatos;
    const estado = this.navigationService.actualizarEstadoNavegacion(this.seccionId, datosActualizados);
    this.puedeIrAnterior = estado.puedeIrAnterior;
    this.puedeIrSiguiente = estado.puedeIrSiguiente;
    this.esUltimaSeccion = estado.esUltimaSeccion;
  }

  seccionAnterior() {
    const seccionAnterior = this.navigationService.obtenerSeccionAnterior(this.seccionId, this.datos);
    if (seccionAnterior) {
      this.router.navigate(['/seccion', seccionAnterior]);
    }
  }

  seccionSiguiente() {
    const seccionSiguiente = this.navigationService.obtenerSeccionSiguiente(this.seccionId, this.datos);
    if (seccionSiguiente) {
      this.router.navigate(['/seccion', seccionSiguiente]);
    }
  }

  startResize(event: MouseEvent) {
    this.isResizing = true;
    const startX = event.clientX;
    const formularioElement = document.querySelector('.seccion-formulario') as HTMLElement;
    if (!formularioElement) return;
    
    const initialWidth = formularioElement.offsetWidth;
    const containerRect = formularioElement.parentElement?.getBoundingClientRect();
    if (!containerRect) return;

    const minFormWidth = 300;
    const maxFormWidth = containerRect.width - 300;

    const doResize = (e: MouseEvent) => {
      const deltaX = startX - e.clientX;
      let newFormWidth = initialWidth + deltaX;
      
      if (newFormWidth < minFormWidth) newFormWidth = minFormWidth;
      if (newFormWidth > maxFormWidth) newFormWidth = maxFormWidth;
      
      this.formularioFlex = `0 0 ${newFormWidth}px`;
      this.previewFlex = '1';
      this.cdRef.detectChanges();
    };

    const stopResize = () => {
      this.isResizing = false;
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
    event.preventDefault();
  }

  // REMOVIDO ngAfterViewChecked - causaba loop infinito de detección de cambios
  // ngAfterViewChecked() {
  //   this.cdRef.detectChanges();
  // }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.validationDisposer) {
      this.validationDisposer.destroy();
    }
  }

  obtenerValorConPrefijo(campo: string): any {
    return PrefijoHelper.obtenerValorConPrefijo(this.datos, campo, this.seccionId);
  }

  onTablaFieldChange(fieldId: string, value: any) {
    this.onFieldChange(fieldId, value);
  }

  /**
   * Verifica si una sección es una subsección AISD con número específico
   * Soporta cualquier cantidad de grupos: A.1.X, A.2.X, A.3.X, etc.
   * @param seccionId - ID de la sección (ej: '3.1.4.A.1.5', '3.1.4.A.3.12')
   * @param numero - Número de subsección a verificar (1-16)
   * @returns true si coincide con el patrón
   */
  esSubseccionAISD(seccionId: string, numero: number): boolean {
    // Patrón: 3.1.4.A.{cualquier_grupo}.{numero}
    const pattern = `^3\\.1\\.4\\.A\\.\\d+\\.${numero}$`;
    return !!seccionId.match(new RegExp(pattern));
  }

  /**
   * Verifica si una sección es una subsección AISI con número específico
   * Soporta cualquier cantidad de grupos: B.1.X, B.2.X, B.3.X, etc.
   * @param seccionId - ID de la sección (ej: '3.1.4.B.1.5', '3.1.4.B.3.9')
   * @param numero - Número de subsección a verificar (1-15)
   * @returns true si coincide con el patrón
   */
  esSubseccionAISI(seccionId: string, numero: number): boolean {
    // Patrón: 3.1.4.B.{cualquier_grupo}.{numero}
    const pattern = `^3\\.1\\.4\\.B\\.\\d+\\.${numero}$`;
    return !!seccionId.match(new RegExp(pattern));
  }

  getFilasTabla(): any[] {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['getFilasTablaAISD2']) {
      return component['getFilasTablaAISD2']();
    }
    return [];
  }

  agregarFilaTabla() {
    this.filasTablaAISD2++;
  }

  eliminarFilaTabla(index: number) {
    if (this.filasTablaAISD2 > 1) {
      this.filasTablaAISD2--;
    }
  }

  actualizarPEAOcupada(index: number, field: string, value: any) {
    const component = ViewChildHelper.getComponent('seccion23');
    if (component && component['actualizarPEAOcupadaDesocupada']) {
      component['actualizarPEAOcupadaDesocupada'](index, field, value);
    }
  }

  eliminarPEAOcupada(index: number) {
    const component = ViewChildHelper.getComponent('seccion23');
    if (component && component['eliminarPEAOcupadaDesocupada']) {
      component['eliminarPEAOcupadaDesocupada'](index);
    }
  }

  inicializarPEAOcupada() {
    const component = ViewChildHelper.getComponent('seccion23');
    if (component && component['inicializarPEAOcupadaDesocupada']) {
      component['inicializarPEAOcupadaDesocupada']();
    }
  }

  agregarPEAOcupada() {
    const component = ViewChildHelper.getComponent('seccion23');
    if (component && component['agregarPEAOcupadaDesocupada']) {
      component['agregarPEAOcupadaDesocupada']();
    }
  }

  actualizarNivelEducativo(index: number, field: string, value: any) {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['actualizarNivelEducativo']) {
      component['actualizarNivelEducativo'](index, field, value);
    }
  }

  eliminarNivelEducativo(index: number) {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['eliminarNivelEducativo']) {
      component['eliminarNivelEducativo'](index);
    }
  }

  inicializarNivelEducativo() {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['inicializarNivelEducativo']) {
      component['inicializarNivelEducativo']();
    }
  }

  agregarNivelEducativo() {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['agregarNivelEducativo']) {
      component['agregarNivelEducativo']();
    }
  }

  actualizarTasaAnalfabetismo(index: number, field: string, value: any) {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['actualizarTasaAnalfabetismo']) {
      component['actualizarTasaAnalfabetismo'](index, field, value);
    }
  }

  eliminarTasaAnalfabetismo(index: number) {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['eliminarTasaAnalfabetismo']) {
      component['eliminarTasaAnalfabetismo'](index);
    }
  }

  inicializarTasaAnalfabetismo() {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['inicializarTasaAnalfabetismo']) {
      component['inicializarTasaAnalfabetismo']();
    }
  }

  agregarTasaAnalfabetismo() {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['agregarTasaAnalfabetismo']) {
      component['agregarTasaAnalfabetismo']();
    }
  }

  actualizarLenguasMaternas(index: number, field: string, value: any) {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['actualizarLenguasMaternas']) {
      component['actualizarLenguasMaternas'](index, field, value);
    }
  }

  eliminarLenguasMaternas(index: number) {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['eliminarLenguasMaternas']) {
      component['eliminarLenguasMaternas'](index);
    }
  }

  inicializarLenguasMaternas() {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['inicializarLenguasMaternas']) {
      component['inicializarLenguasMaternas']();
    }
  }

  agregarLenguasMaternas() {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['agregarLenguasMaternas']) {
      component['agregarLenguasMaternas']();
    }
  }

  actualizarReligiones(index: number, field: string, value: any) {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['actualizarReligiones']) {
      component['actualizarReligiones'](index, field, value);
    }
  }

  eliminarReligiones(index: number) {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['eliminarReligiones']) {
      component['eliminarReligiones'](index);
    }
  }

  inicializarReligiones() {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['inicializarReligiones']) {
      component['inicializarReligiones']();
    }
  }

  agregarReligiones() {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['agregarReligiones']) {
      component['agregarReligiones']();
    }
  }

  onFotografiasAISDChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const updates: Record<string, any> = {};
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      const suffix = groupPrefix ? groupPrefix : '';
      updates[`fotografiaAISD${num}Titulo${suffix}`] = foto.titulo || '';
      updates[`fotografiaAISD${num}Fuente${suffix}`] = foto.fuente || '';
      updates[`fotografiaAISD${num}Imagen${suffix}`] = foto.imagen || '';
    });
    if (Object.keys(updates).length > 0) {
      this.formChange.persistFields(this.seccionId, 'form', updates);
    }
  }

  onFotografiasEducacionIndicadoresChange(fotografias: FotoItem[]) {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['onFotografiasEducacionIndicadoresChange']) {
      component['onFotografiasEducacionIndicadoresChange'](fotografias);
    }
  }

  onFotografiasIglesiaChange(fotografias: FotoItem[]) {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['onFotografiasIglesiaChange']) {
      component['onFotografiasIglesiaChange'](fotografias);
    }
  }

  onFotografiasReservorioChange(fotografias: FotoItem[]) {
    const component = ViewChildHelper.getComponent('seccion16');
    if (component && component['onFotografiasReservorioChange']) {
      component['onFotografiasReservorioChange'](fotografias);
    }
  }

  onFotografiasUsoSuelosChange(fotografias: FotoItem[]) {
    const component = ViewChildHelper.getComponent('seccion16');
    if (component && component['onFotografiasUsoSuelosChange']) {
      component['onFotografiasUsoSuelosChange'](fotografias);
    }
  }

  obtenerTextoSeccion14IndicadoresEducacionIntro(): string {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['obtenerTextoSeccion14IndicadoresEducacionIntro']) {
      return component['obtenerTextoSeccion14IndicadoresEducacionIntro']();
    }
    return '';
  }

  obtenerTextoSeccion15ReligionCompleto(): string {
    const component = ViewChildHelper.getComponent('seccion15');
    if (component && component['obtenerTextoSeccion15ReligionCompleto']) {
      return component['obtenerTextoSeccion15ReligionCompleto']();
    }
    return '';
  }

  obtenerTextoSeccion16AguaCompleto(): string {
    const component = ViewChildHelper.getComponent('seccion16');
    if (component && component['obtenerTextoSeccion16AguaCompleto']) {
      return component['obtenerTextoSeccion16AguaCompleto']();
    }
    return '';
  }

  obtenerTextoSeccion16RecursosNaturalesCompleto(): string {
    const component = ViewChildHelper.getComponent('seccion16');
    if (component && component['obtenerTextoSeccion16RecursosNaturalesCompleto']) {
      return component['obtenerTextoSeccion16RecursosNaturalesCompleto']();
    }
    return '';
  }

  obtenerTextoSeccion30IndicadoresEducacionIntro(): string {
    const component = ViewChildHelper.getComponent('seccion30');
    if (component && component['obtenerTextoSeccion30IndicadoresEducacionIntro']) {
      return component['obtenerTextoSeccion30IndicadoresEducacionIntro']();
    }
    return '';
  }

  private esCampoVacio(valor: any): boolean {
    if (valor === null || valor === undefined) {
      return true;
    }
    
    if (typeof valor === 'string') {
      const trimmed = valor.trim();
      return trimmed === '' || trimmed === '____' || trimmed === '-' || trimmed === 'N/A' || trimmed === 'n/a';
    }
    
    if (Array.isArray(valor)) {
      if (valor.length === 0) {
        return true;
      }
      return valor.every(item => this.esCampoVacio(item));
    }
    
    if (typeof valor === 'object') {
      return Object.keys(valor).length === 0 || Object.values(valor).every(v => this.esCampoVacio(v));
    }
    
    return false;
  }

  private esFilaTablaVacia(datos: any, campoBase: string, numeroFila: number, camposFila: string[], prefijos: string[] = ['']): boolean {
    for (const prefijo of prefijos) {
      let tieneAlgunDato = false;
      
      for (const campo of camposFila) {
        const campoCompleto = prefijo 
          ? `${campoBase}Fila${numeroFila}${campo}${prefijo}`
          : `${campoBase}Fila${numeroFila}${campo}`;
        
        const valor = datos[campoCompleto];
        if (!this.esCampoVacio(valor)) {
          tieneAlgunDato = true;
          break;
        }
      }
      
      if (tieneAlgunDato) {
        return false;
      }
    }
    
    return true;
  }

  private obtenerPrefijosParaCampo(campo: string, datos: any, mockData?: any): string[] {
    const prefijos: string[] = [''];
    
    if (campo.startsWith('tablaAISD2Fila') || campo.startsWith('tablaAISD1Fila')) {
      const prefijosEncontrados = new Set<string>();
      const tablaBase = campo.split('Fila')[0];
      const camposFila = campo.startsWith('tablaAISD2') 
        ? ['Punto', 'Codigo', 'Poblacion', 'ViviendasEmpadronadas', 'ViviendasOcupadas']
        : ['Localidad', 'Coordenadas', 'Altitud', 'Distrito', 'Provincia', 'Departamento'];
      
      const fuentes = [datos];
      if (mockData) {
        fuentes.push(mockData);
      }
      
      fuentes.forEach(fuente => {
        Object.keys(fuente).forEach(key => {
          if (key.startsWith(tablaBase + 'Fila')) {
            for (const campoFila of camposFila) {
              if (key.endsWith(campoFila)) {
                const match = key.match(new RegExp(`Fila\\d+${campoFila}(.*)$`));
                if (match && match[1] && match[1] !== '') {
                  prefijosEncontrados.add(match[1]);
                }
              }
            }
          }
        });
      });
      
      if (prefijosEncontrados.size === 0) {
        prefijos.push('_A1', '_A2', '_B1', '_B2');
      } else {
        prefijos.push(...Array.from(prefijosEncontrados));
      }
    }
    
    return prefijos;
  }

  async llenarDatosPrueba() {
    try {
      const mock = await this.mockDataService.getCapitulo3Datos();
      const datosMock = mock?.datos || {};
      const seccionFields = this.fieldMapping.getFieldsForSection(this.seccionId);
      const datosActuales = this.projectFacade.obtenerDatos();

      const enrichedMock = this.formularioMock.aplicarTransformacionesMock(datosMock);

      const aliasMap: Record<string, string[]> = {
        textoPoblacionSexoAISD: ['textoPoblacionSexo'],
        poblacionSexoAISD: ['poblacionSexoTabla'],
        textoPoblacionEtarioAISD: ['textoPoblacionEtario'],
        poblacionEtarioAISD: ['poblacionEtarioTabla'],
        textoPET: ['textoPET'],
        petAISD: ['petTabla'],
        parrafoSeccion13_natalidad_mortalidad_completo: ['textoNatalidadMortalidad'],
        parrafoSeccion13_morbilidad_completo: ['textoMorbilidad'],
        natalidadMortalidadTabla: ['natalidadMortalidadTabla'],
        morbilidadTabla: ['morbilidadCpTabla', 'morbiliadTabla'],
        textoAfiliacionSalud: ['textoAfiliacionSalud'],
        afiliacionSaludTabla: ['afiliacionSaludTabla']
      };

      const fieldsConDatos: string[] = [];
      const camposTablaProcesados = new Set<string>();
      const updates: Record<string, any> = {};

      const prefijoSeccion = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const camposConPrefijos = ['textoPoblacionSexoAISD', 'poblacionSexoAISD', 'textoPoblacionEtarioAISD', 'poblacionEtarioAISD', 'tablaAISD2TotalPoblacion', 'grupoAISD'];
      
      // Campos que NO se deben llenar con datos de prueba (mantienen texto por defecto o se gestionan manualmente)
      const camposExcluidos = [
        'parrafoSeccion3_metodologia',
        'parrafoSeccion3_fuentes_primarias',
        'parrafoSeccion3_fuentes_secundarias',
        'fuentesSecundariasLista'
      ];

      seccionFields.forEach(field => {
        // Saltar campos excluidos
        if (camposExcluidos.includes(field)) {
          return;
        }
        
        const campoFinal = (prefijoSeccion && camposConPrefijos.includes(field)) ? `${field}${prefijoSeccion}` : field;
        const valorActual = (datosActuales as any)[campoFinal] || (datosActuales as any)[field];
        
        if (!this.esCampoVacio(valorActual)) {
          return;
        }

        let value = enrichedMock[field];
        
        if (value === undefined && aliasMap[field]) {
          for (const altKey of aliasMap[field]) {
            if (enrichedMock[altKey] !== undefined) {
              value = enrichedMock[altKey];
              break;
            }
          }
        }

        if (value === undefined && prefijoSeccion && camposConPrefijos.includes(field)) {
          const campoConPrefijo = `${field}${prefijoSeccion}`;
          value = enrichedMock[campoConPrefijo];
          
          if (value === undefined && aliasMap[field]) {
            for (const altKey of aliasMap[field]) {
              if (enrichedMock[altKey] !== undefined) {
                value = enrichedMock[altKey];
                break;
              }
              const altKeyConPrefijo = `${altKey}${prefijoSeccion}`;
              if (enrichedMock[altKeyConPrefijo] !== undefined) {
                value = enrichedMock[altKeyConPrefijo];
                break;
              }
            }
          }
        }

        if (value === undefined && field === 'tablaAISD2TotalPoblacion') {
          if (enrichedMock['tablaAISD2TotalPoblacion'] !== undefined) {
            value = enrichedMock['tablaAISD2TotalPoblacion'];
          } else if (prefijoSeccion) {
            const campoConPrefijo = `tablaAISD2TotalPoblacion${prefijoSeccion}`;
            value = enrichedMock[campoConPrefijo];
          }
          if (value === undefined && Array.isArray(enrichedMock['poblacionSexoAISD'])) {
            value = enrichedMock['poblacionSexoAISD'].reduce((sum: number, item: any) => {
              const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
              return sum + casos;
            }, 0);
          } else if (value === undefined && Array.isArray(enrichedMock['poblacionSexoTabla'])) {
            value = enrichedMock['poblacionSexoTabla'].reduce((sum: number, item: any) => {
              const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
              return sum + casos;
            }, 0);
          }
        }

        if (value !== undefined && !this.esCampoVacio(value)) {
          if (field.startsWith('tablaAISD2Fila') || field.startsWith('tablaAISD1Fila')) {
            camposTablaProcesados.add(field);
          }
          let valorParaGuardar = value;
          if (Array.isArray(value)) {
            valorParaGuardar = JSON.parse(JSON.stringify(value));
          } else if (typeof value === 'object' && value !== null) {
            valorParaGuardar = JSON.parse(JSON.stringify(value));
          }
          
          updates[campoFinal] = valorParaGuardar;
          fieldsConDatos.push(campoFinal);
        }
      });

      const prefijosAISD2 = this.obtenerPrefijosParaCampo('tablaAISD2Fila1', datosActuales, enrichedMock);
      const camposFilaAISD2 = ['Punto', 'Codigo', 'Poblacion', 'ViviendasEmpadronadas', 'ViviendasOcupadas'];
      
      for (let i = 1; i <= 20; i++) {
        const filaYaProcesada = camposFilaAISD2.some(campo => {
          const campoSinPrefijo = `tablaAISD2Fila${i}${campo}`;
          return camposTablaProcesados.has(campoSinPrefijo) || 
                 prefijosAISD2.some(pref => camposTablaProcesados.has(`tablaAISD2Fila${i}${campo}${pref}`));
        });
        
        if (!filaYaProcesada && this.esFilaTablaVacia(datosActuales, 'tablaAISD2', i, camposFilaAISD2, prefijosAISD2)) {
          for (const prefijo of prefijosAISD2) {
            let filaTieneDatosMock = false;
            
            for (const campo of camposFilaAISD2) {
              const campoMock = prefijo 
                ? `tablaAISD2Fila${i}${campo}${prefijo}`
                : `tablaAISD2Fila${i}${campo}`;
              
              const valorMock = enrichedMock[campoMock];
              if (valorMock !== undefined && !this.esCampoVacio(valorMock)) {
                filaTieneDatosMock = true;
                const campoCompleto = prefijo 
                  ? `tablaAISD2Fila${i}${campo}${prefijo}`
                  : `tablaAISD2Fila${i}${campo}`;
                
                updates[campoCompleto] = valorMock;
                if (!fieldsConDatos.includes(campoCompleto)) {
                  fieldsConDatos.push(campoCompleto);
                }
              }
            }
            
            if (filaTieneDatosMock) {
              break;
            }
          }
        }
      }

      const prefijosAISD1 = this.obtenerPrefijosParaCampo('tablaAISD1Fila1', datosActuales, enrichedMock);
      const camposFilaAISD1 = ['Localidad', 'Coordenadas', 'Altitud', 'Distrito', 'Provincia', 'Departamento'];
      
      for (let i = 1; i <= 20; i++) {
        const filaYaProcesada = camposFilaAISD1.some(campo => {
          const campoSinPrefijo = `tablaAISD1Fila${i}${campo}`;
          return camposTablaProcesados.has(campoSinPrefijo) || 
                 prefijosAISD1.some(pref => camposTablaProcesados.has(`tablaAISD1Fila${i}${campo}${pref}`));
        });
        
        if (!filaYaProcesada && this.esFilaTablaVacia(datosActuales, 'tablaAISD1', i, camposFilaAISD1, prefijosAISD1)) {
          for (const prefijo of prefijosAISD1) {
            let filaTieneDatosMock = false;
            
            for (const campo of camposFilaAISD1) {
              const campoMock = prefijo 
                ? `tablaAISD1Fila${i}${campo}${prefijo}`
                : `tablaAISD1Fila${i}${campo}`;
              
              const valorMock = enrichedMock[campoMock];
              if (valorMock !== undefined && !this.esCampoVacio(valorMock)) {
                filaTieneDatosMock = true;
                const campoCompleto = prefijo 
                  ? `tablaAISD1Fila${i}${campo}${prefijo}`
                  : `tablaAISD1Fila${i}${campo}`;
                
                updates[campoCompleto] = valorMock;
                if (!fieldsConDatos.includes(campoCompleto)) {
                  fieldsConDatos.push(campoCompleto);
                }
              }
            }
            
            if (filaTieneDatosMock) {
              break;
            }
          }
        }
      }

      if (this.seccionId === '3.1.4.A.1.1' || this.seccionId === '3.1.4.A.2.1') {
        if (enrichedMock.tablepagina6 && Array.isArray(enrichedMock.tablepagina6) && enrichedMock.tablepagina6.length > 0) {
          const tablepagina6Actual = datosActuales['tablepagina6'];
          if (this.esCampoVacio(tablepagina6Actual)) {
            const tablepagina6Data = JSON.parse(JSON.stringify(enrichedMock.tablepagina6));
            updates['tablepagina6'] = tablepagina6Data;
            if (!fieldsConDatos.includes('tablepagina6')) {
              fieldsConDatos.push('tablepagina6');
            }
          }
        }
      }
      
      if ((this.seccionId === '3.1.3' || this.seccionId === '3.1.3.A' || this.seccionId === '3.1.3.B') && enrichedMock.entrevistados) {
        if (Array.isArray(enrichedMock.entrevistados) && enrichedMock.entrevistados.length > 0) {
          const entrevistadosActual = datosActuales['entrevistados'];
          if (this.esCampoVacio(entrevistadosActual)) {
            const entrevistadosData = JSON.parse(JSON.stringify(enrichedMock.entrevistados));
            updates['entrevistados'] = entrevistadosData;
            if (!fieldsConDatos.includes('entrevistados')) {
              fieldsConDatos.push('entrevistados');
            }
          }
        }
      }

      // Asegurar que el párrafo principal de la Sección 1 incluya el nombre
      // del proyecto cuando se están cargando datos de prueba. Esto evita
      // que la vista muestre el texto por defecto con '____' durante la
      // ventana de sincronización asíncrona.
      if (!updates['parrafoSeccion1_principal']) {
        const projectCandidate = updates['projectName'] || enrichedMock?.projectName || enrichedMock?.['nombreProyecto'] || 'Paka';
        updates['parrafoSeccion1_principal'] = `Describir los aspectos demográficos, sociales, económicos, culturales y políticos que caracterizan a las poblaciones de las áreas de influencia social del proyecto de exploración minera ${projectCandidate}.`;
      }

      // Si estamos llenando la sección 3.1.1, asegurarnos de que los objetivos
      // también se establezcan con el nombre del proyecto para evitar que se
      // muestren placeholders ('____') antes de la sincronización completa.
      if (this.seccionId === '3.1.1' && !updates['objetivosSeccion1']) {
        const projectCandidateObj = updates['projectName'] || enrichedMock?.projectName || enrichedMock?.['nombreProyecto'] || 'Paka';
        updates['objetivosSeccion1'] = [
          `Describir los aspectos demográficos, sociales, económicos, culturales y políticos que caracterizan a las poblaciones de las áreas de influencia social del proyecto de exploración minera ${projectCandidateObj}.`,
          `Brindar información básica de los poblados comprendidos en el área de influencia social donde se realizará el Proyecto que sirvan de base para poder determinar los posibles impactos sociales a originarse en esta primera etapa de exploración y, por ende, prevenir, reducir o mitigar las consecuencias negativas y potenciar las positivas.`
        ];
      }

      if (Object.keys(updates).length > 0) {
        this.formChange.persistFields(this.seccionId, 'form', updates);
        this.projectFacade.setFields(this.seccionId, null, updates);
      }
      
      this.fieldMapping.markFieldsAsTestData(fieldsConDatos);

      this.datos = this.projectFacade.obtenerDatos() as FormularioDatos;

      this.stateAdapter.setDatos(this.datos);
      
      // Sincronizar de inmediato el formulario de sección 3 para que el cuadro de entrevistados se vea sin recargar
      const esSeccion3 = this.seccionId === '3.1.3' || this.seccionId === '3.1.3.A' || this.seccionId === '3.1.3.B';
      if (esSeccion3 && this.formComponentRef?.instance?.sincronizarDesdeStore) {
        setTimeout(() => this.formComponentRef?.instance?.sincronizarDesdeStore(), 0);
      }
      
      setTimeout(() => {
        this.actualizarComponenteSeccion();
        this.testDataActive = this.fieldMapping.hasAnyTestDataForSection(this.seccionId);
        this.cdRef.detectChanges();
        
        setTimeout(() => {
          const componentIdMap: { [key: string]: string } = {
            '3.1.3': 'seccion3',
            '3.1.3.A': 'seccion3',
            '3.1.3.B': 'seccion3',
            '3.1.4': 'seccion4',
            '3.1.4.A': 'seccion4',
            '3.1.4.A.1': 'seccion4',
            '3.1.4.A.1.1': 'seccion5',
            '3.1.4.A.2.1': 'seccion5',
            '3.1.4.A.1.2': 'seccion6',
            '3.1.4.A.2.2': 'seccion6'
          };
          
          const componentId = componentIdMap[this.seccionId];
          if (componentId) {
            const component = ViewChildHelper.getComponent(componentId);
            if (component) {
              if (component['actualizarDatos']) {
                component['actualizarDatos']();
              }
              if (component['cdRef'] && component['cdRef']['detectChanges']) {
                component['cdRef'].detectChanges();
              }
            }
          }
          
          
          this.datos = this.projectFacade.obtenerDatos() as FormularioDatos;
          this.stateAdapter.setDatos(this.datos);
          this.cdRef.detectChanges();
        }, 100);
      }, 50);
    } catch (error) {
      alert('No se pudieron cargar los datos de prueba. Por favor, intenta nuevamente.');
    }
  }

  onJSONFileSelected(event: any) {
    const component = ViewChildHelper.getComponent('seccion1');
    if (component && component['onJSONFileSelected']) {
      component['onJSONFileSelected'](event);
    }
  }

  selectJSONFile() {
    const component = ViewChildHelper.getComponent('seccion1');
    if (component && component['selectJSONFile']) {
      component['selectJSONFile']();
    }
  }

  obtenerDistritosDeComunidad(): string[] {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['obtenerDistritosDeComunidad']) {
      return component['obtenerDistritosDeComunidad']();
    }
    return [];
  }

  onDistritoPrincipalChange(value: string) {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['onDistritoPrincipalChange']) {
      component['onDistritoPrincipalChange'](value);
    }
  }

  onAltitudChange(value: any) {
    this.onFieldChange('altitudAISD', value);
  }

  normalizarAltitud() {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['normalizarAltitud']) {
      component['normalizarAltitud']();
    }
  }

  eliminarComunidadCampesina(id: string) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['eliminarComunidadCampesina']) {
      component['eliminarComunidadCampesina'](id);
    }
  }

  agregarComunidadCampesina() {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['agregarComunidadCampesina']) {
      component['agregarComunidadCampesina']();
    }
  }

  actualizarNombreComunidad(id: string, nombre: string) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['actualizarNombreComunidad']) {
      component['actualizarNombreComunidad'](id, nombre);
    }
  }

  obtenerCentrosPobladosSeleccionadosComunidad(id: string): string[] {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['obtenerCentrosPobladosSeleccionadosComunidad']) {
      return component['obtenerCentrosPobladosSeleccionadosComunidad'](id);
    }
    return [];
  }

  estaCentroPobladoSeleccionadoComunidad(id: string, codigo: string): boolean {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['estaCentroPobladoSeleccionadoComunidad']) {
      return component['estaCentroPobladoSeleccionadoComunidad'](id, codigo);
    }
    return false;
  }

  toggleCentroPobladoComunidad(id: string, codigo: string) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['toggleCentroPobladoComunidad']) {
      component['toggleCentroPobladoComunidad'](id, codigo);
    }
  }

  seleccionarTodosCentrosPobladosComunidad(id: string) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['seleccionarTodosCentrosPobladosComunidad']) {
      component['seleccionarTodosCentrosPobladosComunidad'](id);
    }
  }

  deseleccionarTodosCentrosPobladosComunidad(id: string) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['deseleccionarTodosCentrosPobladosComunidad']) {
      component['deseleccionarTodosCentrosPobladosComunidad'](id);
    }
  }

  onAutocompleteInput(field: string, value: string) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['onAutocompleteInput']) {
      component['onAutocompleteInput'](field, value);
      this.autocompleteData = component['autocompleteData'] || {};
    }
  }

  onFocusDistritoAdicional(field: string) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['onFocusDistritoAdicional']) {
      component['onFocusDistritoAdicional'](field);
      this.autocompleteData = component['autocompleteData'] || {};
    }
  }

  cerrarSugerenciasAutocomplete(field: string) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['cerrarSugerenciasAutocomplete']) {
      component['cerrarSugerenciasAutocomplete'](field);
      this.autocompleteData = component['autocompleteData'] || {};
    }
  }

  seleccionarSugerencia(field: string, sugerencia: any) {
    const component = ViewChildHelper.getComponent('seccion2');
    if (component && component['seleccionarSugerencia']) {
      component['seleccionarSugerencia'](field, sugerencia);
      this.autocompleteData = component['autocompleteData'] || {};
    }
  }

  onPuntoPoblacionInput(index: number, value: string) {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['onPuntoPoblacionInput']) {
      component['onPuntoPoblacionInput'](index, value);
      this.autocompleteData = component['autocompleteData'] || {};
    }
  }

  onPuntoPoblacionBlur(index: number) {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['onPuntoPoblacionBlur']) {
      component['onPuntoPoblacionBlur'](index);
      this.autocompleteData = component['autocompleteData'] || {};
    }
  }

  seleccionarPuntoPoblacion(index: number, sugerencia: any) {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['seleccionarPuntoPoblacion']) {
      component['seleccionarPuntoPoblacion'](index, sugerencia);
      this.autocompleteData = component['autocompleteData'] || {};
    }
  }

  onFotografiasIDHChange(fotografias: FotoItem[]) {
    const component = ViewChildHelper.getComponent('seccion17');
    if (component && component['onFotografiasIDHChange']) {
      component['onFotografiasIDHChange'](fotografias);
    }
  }

  onFotografiasNBIChange(fotografias: FotoItem[]) {
    const component = ViewChildHelper.getComponent('seccion18');
    if (component && component['onFotografiasNBIChange']) {
      component['onFotografiasNBIChange'](fotografias);
    }
  }
}
