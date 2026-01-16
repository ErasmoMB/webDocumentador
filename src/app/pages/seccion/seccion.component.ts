import { Component, OnInit, ChangeDetectorRef, AfterViewChecked, ViewChild, OnDestroy, Type } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { DataService } from 'src/app/core/services/data.service';
import { ConfigService } from 'src/app/core/services/config.service';
import { TextNormalizationService } from 'src/app/core/services/text-normalization.service';
import { StateService } from 'src/app/core/services/state.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { SectionNavigationService } from 'src/app/core/services/section-navigation.service';
import { MockDataService } from 'src/app/core/services/mock-data.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { Subscription } from 'rxjs';
import { FormularioDatos, ComunidadCampesina } from 'src/app/core/models/formulario.model';
import { FotoItem } from 'src/app/shared/components/image-upload/image-upload.component';
import { Seccion1Component } from 'src/app/shared/components/seccion1/seccion1.component';
import { Seccion2Component } from 'src/app/shared/components/seccion2/seccion2.component';
import { Seccion3Component } from 'src/app/shared/components/seccion3/seccion3.component';
import { Seccion4Component } from 'src/app/shared/components/seccion4/seccion4.component';
import { Seccion5Component } from 'src/app/shared/components/seccion5/seccion5.component';
import { Seccion6Component } from 'src/app/shared/components/seccion6/seccion6.component';
import { Seccion7Component } from 'src/app/shared/components/seccion7/seccion7.component';
import { Seccion8Component } from 'src/app/shared/components/seccion8/seccion8.component';
import { Seccion9Component } from 'src/app/shared/components/seccion9/seccion9.component';
import { Seccion10Component } from 'src/app/shared/components/seccion10/seccion10.component';
import { Seccion11Component } from 'src/app/shared/components/seccion11/seccion11.component';
import { Seccion12Component } from 'src/app/shared/components/seccion12/seccion12.component';
import { Seccion13Component } from 'src/app/shared/components/seccion13/seccion13.component';
import { Seccion14Component } from 'src/app/shared/components/seccion14/seccion14.component';
import { Seccion15Component } from 'src/app/shared/components/seccion15/seccion15.component';
import { Seccion16Component } from 'src/app/shared/components/seccion16/seccion16.component';
import { Seccion17Component } from 'src/app/shared/components/seccion17/seccion17.component';
import { Seccion18Component } from 'src/app/shared/components/seccion18/seccion18.component';
import { Seccion19Component } from 'src/app/shared/components/seccion19/seccion19.component';
import { Seccion20Component } from 'src/app/shared/components/seccion20/seccion20.component';
import { Seccion21Component } from 'src/app/shared/components/seccion21/seccion21.component';
import { Seccion22Component } from 'src/app/shared/components/seccion22/seccion22.component';
import { Seccion23Component } from 'src/app/shared/components/seccion23/seccion23.component';
import { Seccion24Component } from 'src/app/shared/components/seccion24/seccion24.component';
import { Seccion25Component } from 'src/app/shared/components/seccion25/seccion25.component';
import { Seccion26Component } from 'src/app/shared/components/seccion26/seccion26.component';
import { Seccion27Component } from 'src/app/shared/components/seccion27/seccion27.component';
import { Seccion28Component } from 'src/app/shared/components/seccion28/seccion28.component';
import { Seccion29Component } from 'src/app/shared/components/seccion29/seccion29.component';
import { Seccion30Component } from 'src/app/shared/components/seccion30/seccion30.component';
import { Seccion31Component } from 'src/app/shared/components/seccion31/seccion31.component';
import { Seccion32Component } from 'src/app/shared/components/seccion32/seccion32.component';
import { Seccion33Component } from 'src/app/shared/components/seccion33/seccion33.component';
import { Seccion34Component } from 'src/app/shared/components/seccion34/seccion34.component';
import { Seccion35Component } from 'src/app/shared/components/seccion35/seccion35.component';
import { Seccion36Component } from 'src/app/shared/components/seccion36/seccion36.component';

@Component({
  selector: 'app-seccion',
  templateUrl: './seccion.component.html',
  styleUrls: ['./seccion.component.css']
})
export class SeccionComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(Seccion1Component) set seccion1(comp: Seccion1Component) {
    ViewChildHelper.registerComponent('seccion1', comp);
  }
  @ViewChild(Seccion2Component) set seccion2(comp: Seccion2Component) {
    ViewChildHelper.registerComponent('seccion2', comp);
  }
  @ViewChild(Seccion3Component) set seccion3(comp: Seccion3Component) {
    ViewChildHelper.registerComponent('seccion3', comp);
  }
  @ViewChild(Seccion4Component) set seccion4(comp: Seccion4Component) {
    ViewChildHelper.registerComponent('seccion4', comp);
  }
  @ViewChild(Seccion5Component) set seccion5(comp: Seccion5Component) {
    ViewChildHelper.registerComponent('seccion5', comp);
  }
  @ViewChild(Seccion6Component) set seccion6(comp: Seccion6Component) {
    ViewChildHelper.registerComponent('seccion6', comp);
  }
  @ViewChild(Seccion7Component) set seccion7(comp: Seccion7Component) {
    ViewChildHelper.registerComponent('seccion7', comp);
  }
  @ViewChild(Seccion8Component) set seccion8(comp: Seccion8Component) {
    ViewChildHelper.registerComponent('seccion8', comp);
  }
  @ViewChild(Seccion9Component) set seccion9(comp: Seccion9Component) {
    ViewChildHelper.registerComponent('seccion9', comp);
  }
  @ViewChild(Seccion10Component) set seccion10(comp: Seccion10Component) {
    ViewChildHelper.registerComponent('seccion10', comp);
  }
  @ViewChild(Seccion11Component) set seccion11(comp: Seccion11Component) {
    ViewChildHelper.registerComponent('seccion11', comp);
  }
  @ViewChild(Seccion12Component) set seccion12(comp: Seccion12Component) {
    ViewChildHelper.registerComponent('seccion12', comp);
  }
  @ViewChild(Seccion13Component) set seccion13(comp: Seccion13Component) {
    ViewChildHelper.registerComponent('seccion13', comp);
  }
  @ViewChild(Seccion14Component) set seccion14(comp: Seccion14Component) {
    ViewChildHelper.registerComponent('seccion14', comp);
  }
  @ViewChild(Seccion15Component) set seccion15(comp: Seccion15Component) {
    ViewChildHelper.registerComponent('seccion15', comp);
  }
  @ViewChild(Seccion16Component) set seccion16(comp: Seccion16Component) {
    ViewChildHelper.registerComponent('seccion16', comp);
  }
  @ViewChild(Seccion17Component) set seccion17(comp: Seccion17Component) {
    ViewChildHelper.registerComponent('seccion17', comp);
  }
  @ViewChild(Seccion18Component) set seccion18(comp: Seccion18Component) {
    ViewChildHelper.registerComponent('seccion18', comp);
  }
  @ViewChild(Seccion19Component) set seccion19(comp: Seccion19Component) {
    ViewChildHelper.registerComponent('seccion19', comp);
  }
  @ViewChild(Seccion20Component) set seccion20(comp: Seccion20Component) {
    ViewChildHelper.registerComponent('seccion20', comp);
  }
  @ViewChild(Seccion21Component) set seccion21(comp: Seccion21Component) {
    ViewChildHelper.registerComponent('seccion21', comp);
  }
  @ViewChild(Seccion22Component) set seccion22(comp: Seccion22Component) {
    ViewChildHelper.registerComponent('seccion22', comp);
  }
  @ViewChild(Seccion23Component) set seccion23(comp: Seccion23Component) {
    ViewChildHelper.registerComponent('seccion23', comp);
  }
  @ViewChild(Seccion24Component) set seccion24(comp: Seccion24Component) {
    ViewChildHelper.registerComponent('seccion24', comp);
  }
  @ViewChild(Seccion25Component) set seccion25(comp: Seccion25Component) {
    ViewChildHelper.registerComponent('seccion25', comp);
  }
  @ViewChild(Seccion26Component) set seccion26(comp: Seccion26Component) {
    ViewChildHelper.registerComponent('seccion26', comp);
  }
  @ViewChild(Seccion27Component) set seccion27(comp: Seccion27Component) {
    ViewChildHelper.registerComponent('seccion27', comp);
  }
  @ViewChild(Seccion28Component) set seccion28(comp: Seccion28Component) {
    ViewChildHelper.registerComponent('seccion28', comp);
  }
  @ViewChild(Seccion29Component) set seccion29(comp: Seccion29Component) {
    ViewChildHelper.registerComponent('seccion29', comp);
  }
  @ViewChild(Seccion30Component) set seccion30(comp: Seccion30Component) {
    ViewChildHelper.registerComponent('seccion30', comp);
  }
  @ViewChild(Seccion31Component) set seccion31(comp: Seccion31Component) {
    ViewChildHelper.registerComponent('seccion31', comp);
  }
  @ViewChild(Seccion32Component) set seccion32(comp: Seccion32Component) {
    ViewChildHelper.registerComponent('seccion32', comp);
  }
  @ViewChild(Seccion33Component) set seccion33(comp: Seccion33Component) {
    ViewChildHelper.registerComponent('seccion33', comp);
  }
  @ViewChild(Seccion34Component) set seccion34(comp: Seccion34Component) {
    ViewChildHelper.registerComponent('seccion34', comp);
  }
  @ViewChild(Seccion35Component) set seccion35(comp: Seccion35Component) {
    ViewChildHelper.registerComponent('seccion35', comp);
  }
  @ViewChild(Seccion36Component) set seccion36(comp: Seccion36Component) {
    ViewChildHelper.registerComponent('seccion36', comp);
  }
  
  seccionId: string = '';
  seccionTitulo: string = '';
  seccionPadreTitulo: string = '';
  datos: FormularioDatos = {} as FormularioDatos;
  formData: Partial<FormularioDatos> = {};
  datos$ = this.stateService.datos$;
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formularioService: FormularioService,
    private dataService: DataService,
    private configService: ConfigService,
    private cdRef: ChangeDetectorRef,
    private textNormalization: TextNormalizationService,
    private stateService: StateService,
    private fieldMapping: FieldMappingService,
    private imageService: ImageManagementService,
    private navigationService: SectionNavigationService,
    private mockDataService: MockDataService,
    private tableService: TableManagementService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.seccionId = params['id'];
      this.cargarSeccion();
    });
    
    this.datos = this.formularioService.obtenerDatos();
    this.formData = { ...this.datos };
    this.stateService.setDatos(this.datos);
    
    this.centrosPobladosJSON = this.datos['centrosPobladosJSON'] || [];
    this.comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
    this.geoInfo = this.datos['geoInfo'] || {};
    this.jsonFileName = this.datos['jsonFileName'] || '';
    
    this.datos$.subscribe(datos => {
      if (datos) {
        this.datos = datos;
        this.centrosPobladosJSON = datos['centrosPobladosJSON'] || [];
        this.comunidadesCampesinas = datos['comunidadesCampesinas'] || [];
        this.geoInfo = datos['geoInfo'] || {};
        this.jsonFileName = datos['jsonFileName'] || '';
      }
    });
  }

  async cargarSeccion() {
    this.actualizarTitulo();
    this.datos = this.formularioService.obtenerDatos();
    this.formData = { ...this.datos };
    this.centrosPobladosJSON = this.datos['centrosPobladosJSON'] || [];
    this.comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
    this.geoInfo = this.datos['geoInfo'] || {};
    this.jsonFileName = this.datos['jsonFileName'] || '';
    this.testDataActive = this.fieldMapping.hasAnyTestDataForSection(this.seccionId);
    this.actualizarEstadoNavegacion();
    this.scrollRealizado = false;
    this.cdRef.detectChanges();
    
    setTimeout(() => {
      this.actualizarComponenteSeccion();
      const seccion2 = ViewChildHelper.getComponent('seccion2');
      if (seccion2 && seccion2['autocompleteData']) {
        this.autocompleteData = seccion2['autocompleteData'];
      }
      const seccion4 = ViewChildHelper.getComponent('seccion4');
      if (seccion4 && seccion4['autocompleteData']) {
        this.autocompleteData = { ...this.autocompleteData, ...seccion4['autocompleteData'] };
      }
    }, 100);
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

  getPreviewComponentType(): Type<any> | null {
    if (this.esSubseccionAISD(this.seccionId, 1)) return Seccion5Component;
    if (this.esSubseccionAISD(this.seccionId, 2)) return Seccion6Component;
    if (this.esSubseccionAISD(this.seccionId, 3)) return Seccion7Component;
    if (this.esSubseccionAISD(this.seccionId, 4)) return Seccion8Component;
    if (this.esSubseccionAISD(this.seccionId, 5)) return Seccion9Component;
    if (this.esSubseccionAISD(this.seccionId, 6)) return Seccion10Component;
    if (this.esSubseccionAISD(this.seccionId, 7)) return Seccion11Component;
    if (this.esSubseccionAISD(this.seccionId, 8)) return Seccion12Component;
    if (this.esSubseccionAISD(this.seccionId, 9)) return Seccion13Component;
    if (this.esSubseccionAISD(this.seccionId, 10)) return Seccion14Component;
    if (this.esSubseccionAISD(this.seccionId, 11)) return Seccion15Component;
    if (this.esSubseccionAISD(this.seccionId, 12)) return Seccion16Component;
    if (this.esSubseccionAISD(this.seccionId, 13)) return Seccion17Component;
    if (this.esSubseccionAISD(this.seccionId, 14)) return Seccion18Component;
    if (this.esSubseccionAISD(this.seccionId, 15)) return Seccion19Component;
    if (this.esSubseccionAISD(this.seccionId, 16)) return Seccion20Component;

    const componentMap: { [key: string]: Type<any> } = {
      '3.1.1': Seccion1Component,
      '3.1.2': Seccion2Component,
      '3.1.2.A': Seccion2Component,
      '3.1.2.B': Seccion2Component,
      '3.1.3': Seccion3Component,
      '3.1.3.A': Seccion3Component,
      '3.1.3.B': Seccion3Component,
      '3.1.4.A': Seccion4Component,
      '3.1.4.A.1': Seccion4Component,
      '3.1.4.A.2': Seccion4Component,
      '3.1.4.B': Seccion21Component,
      '3.1.4.B.1': Seccion21Component,
      '3.1.4.B.2': Seccion21Component,
      '3.1.4.B.1.1': Seccion22Component,
      '3.1.4.B.2.1': Seccion22Component,
      '3.1.4.B.1.2': Seccion23Component,
      '3.1.4.B.2.2': Seccion23Component,
      '3.1.4.B.1.3': Seccion24Component,
      '3.1.4.B.2.3': Seccion24Component,
      '3.1.4.B.1.4': Seccion25Component,
      '3.1.4.B.2.4': Seccion25Component,
      '3.1.4.B.1.5': Seccion26Component,
      '3.1.4.B.2.5': Seccion26Component,
      '3.1.4.B.1.6': Seccion27Component,
      '3.1.4.B.2.6': Seccion27Component,
      '3.1.4.B.1.7': Seccion28Component,
      '3.1.4.B.2.7': Seccion28Component,
      '3.1.4.B.1.8': Seccion29Component,
      '3.1.4.B.2.8': Seccion29Component,
      '3.1.4.B.1.9': Seccion30Component,
      '3.1.4.B.2.9': Seccion30Component,
      '3.1.4.B.1.10': Seccion31Component,
      '3.1.4.B.2.10': Seccion31Component,
      '3.1.4.B.1.11': Seccion32Component,
      '3.1.4.B.2.11': Seccion32Component,
      '3.1.4.B.1.12': Seccion33Component,
      '3.1.4.B.2.12': Seccion33Component,
      '3.1.4.B.1.13': Seccion34Component,
      '3.1.4.B.2.13': Seccion34Component,
      '3.1.4.B.1.14': Seccion35Component,
      '3.1.4.B.2.14': Seccion35Component,
      '3.1.4.B.1.15': Seccion36Component,
      '3.1.4.B.2.15': Seccion36Component
    };

    return componentMap[this.seccionId] || null;
  }

  getPreviewComponentInputs(): { [key: string]: any } {
    if (this.seccionId === '3.1.4.B' || this.seccionId === '3.1.4.B.1' || this.seccionId === '3.1.4.B.2') {
      return {};
    }
    if (this.seccionId === '3.1.4.A' || this.seccionId === '3.1.4.A.1' || this.seccionId === '3.1.4.A.2') {
      return { seccionId: this.seccionId, modoFormulario: false };
    }
    return { seccionId: this.seccionId };
  }

  actualizarComponenteSeccion() {
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

    const componentId = componentIdMap[this.seccionId];
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
    this.formularioService.actualizarDato(fieldId as keyof FormularioDatos, valorLimpio);
    this.datos = this.formularioService.obtenerDatos();
    this.stateService.updateDato(fieldId as keyof FormularioDatos, valorLimpio);
    
    this.actualizarComponenteSeccion();
    this.cdRef.markForCheck();
    
    setTimeout(() => {
      this.cdRef.detectChanges();
    }, 0);
  }

  limpiarDatos() {
    if (confirm('ยฟEstá seguro que desea limpiar todos los datos? Esta acción no se puede deshacer.')) {
      try {
        this.fieldMapping.clearTestDataFields();
        this.formularioService.limpiarDatos();
        
        this.datos = this.formularioService.obtenerDatos();
        this.formData = { ...this.datos };
        this.testDataActive = false;
        
        this.cargarSeccion();
        this.cdRef.detectChanges();
        
        alert('Todos los datos han sido limpiados correctamente. El formulario está listo para volver a llenar desde cero.');
      } catch (error) {
        console.error('Error al limpiar datos:', error);
        alert('Ocurrió un error al limpiar los datos. Por favor, intente nuevamente.');
      }
    }
  }

  irAPlantilla() {
    this.router.navigate(['/plantilla'], {
      state: { returnSection: this.seccionId }
    });
  }

  actualizarEstadoNavegacion() {
    const estado = this.navigationService.actualizarEstadoNavegacion(this.seccionId, this.datos);
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

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  obtenerValorConPrefijo(campo: string): any {
    return PrefijoHelper.obtenerValorConPrefijo(this.datos, campo, this.seccionId);
  }

  onTablaFieldChange(fieldId: string, value: any) {
    this.onFieldChange(fieldId, value);
  }

  esSubseccionAISD(seccionId: string, numero: number): boolean {
    const pattern = `^3\\.1\\.4\\.A\\.\\d+\\.${numero}$`;
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
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      const suffix = groupPrefix ? groupPrefix : '';
      this.formularioService.actualizarDato(`fotografiaAISD${num}Titulo${suffix}` as any, foto.titulo || '');
      this.formularioService.actualizarDato(`fotografiaAISD${num}Fuente${suffix}` as any, foto.fuente || '');
      this.formularioService.actualizarDato(`fotografiaAISD${num}Imagen${suffix}` as any, foto.imagen || '');
    });
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
      const datosActuales = this.formularioService.obtenerDatos();

      const enrichedMock = this.formularioService.aplicarTransformacionesMock(datosMock);

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

      const prefijoSeccion = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const camposConPrefijos = ['textoPoblacionSexoAISD', 'poblacionSexoAISD', 'textoPoblacionEtarioAISD', 'poblacionEtarioAISD', 'tablaAISD2TotalPoblacion', 'grupoAISD'];

      seccionFields.forEach(field => {
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
          if (enrichedMock.tablaAISD2TotalPoblacion !== undefined) {
            value = enrichedMock.tablaAISD2TotalPoblacion;
          } else if (prefijoSeccion) {
            const campoConPrefijo = `tablaAISD2TotalPoblacion${prefijoSeccion}`;
            value = enrichedMock[campoConPrefijo];
          }
          if (value === undefined && Array.isArray(enrichedMock.poblacionSexoAISD)) {
            value = enrichedMock.poblacionSexoAISD.reduce((sum: number, item: any) => {
              const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
              return sum + casos;
            }, 0);
          } else if (value === undefined && Array.isArray(enrichedMock.poblacionSexoTabla)) {
            value = enrichedMock.poblacionSexoTabla.reduce((sum: number, item: any) => {
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
          
          this.formularioService.actualizarDato(campoFinal as keyof FormularioDatos, valorParaGuardar);
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
                
                this.formularioService.actualizarDato(campoCompleto as keyof FormularioDatos, valorMock);
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
                
                this.formularioService.actualizarDato(campoCompleto as keyof FormularioDatos, valorMock);
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
            this.formularioService.actualizarDato('tablepagina6', tablepagina6Data);
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
            this.formularioService.actualizarDato('entrevistados', entrevistadosData);
            if (!fieldsConDatos.includes('entrevistados')) {
              fieldsConDatos.push('entrevistados');
            }
          }
        }
      }
      
      this.fieldMapping.markFieldsAsTestData(fieldsConDatos);

      this.datos = this.formularioService.obtenerDatos();

      this.stateService.setDatos(this.datos);
      
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
          
          
          this.datos = this.formularioService.obtenerDatos();
          this.stateService.setDatos(this.datos);
          this.cdRef.detectChanges();
        }, 100);
      }, 50);
    } catch (error) {
      console.error('Error al llenar datos de prueba:', error);
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
