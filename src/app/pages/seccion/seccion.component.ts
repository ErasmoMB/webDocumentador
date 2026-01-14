import { Component, OnInit, ChangeDetectorRef, AfterViewChecked, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { DataService } from 'src/app/core/services/data.service';
import { ConfigService } from 'src/app/core/services/config.service';
import { TextNormalizationService } from 'src/app/core/services/text-normalization.service';
import { StateService } from 'src/app/core/services/state.service';
import { DemografiaService } from 'src/app/core/services/demografia.service';
import { AutocompleteService } from 'src/app/core/services/autocomplete.service';
import { TablaManagerService } from 'src/app/core/services/tabla-manager.service';
import { PoblacionService } from 'src/app/core/services/poblacion.service';
import { CensoCompletoService } from 'src/app/core/services/censo-completo.service';
import { BackendApiService } from 'src/app/core/services/backend-api.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { DebounceUtil } from 'src/app/core/utils/debounce.util';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormularioDatos, ComunidadCampesina } from 'src/app/core/models/formulario.model';
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
import { CentroPoblado } from 'src/app/core/models/api-response.model';

@Component({
  selector: 'app-seccion',
  templateUrl: './seccion.component.html',
  styleUrls: ['./seccion.component.css']
})
export class SeccionComponent implements OnInit, AfterViewChecked, OnDestroy {
  private actualizandoPETTabla: boolean = false
  private viviendasCargando = new Set<string>()
  private erroresViviendasRegistrados = new Set<string>();
  private hasLoggedPrefix: boolean = false;
  
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
  
  seccionId: string = '';
  seccionTitulo: string = '';
  seccionPadreTitulo: string = '';
  datos: FormularioDatos = {} as FormularioDatos;
  formData: Partial<FormularioDatos> = {};
  datos$ = this.stateService.datos$;
  loadingOptions: { [key: string]: boolean } = {};
  distritos: string[] = [];
  provincias: string[] = [];
  departamentos: string[] = [];
  centrosPoblados: CentroPoblado[] = [];
  distritosSugeridos: string[] = [];
  mostrarSugerencias: boolean = false;
  distritoBuscado: string = '';
  autocompleteData: { [key: string]: { sugerencias: any[], mostrar: boolean, buscado: string } } = {};
  private scrollRealizado: boolean = false;
  puedeIrAnterior: boolean = false;
  puedeIrSiguiente: boolean = false;
  isResizing: boolean = false;
  previewFlex: string = '1';
  formularioFlex: string = '0 0 400px';
  filasTablaAISD2: number = 1;
  fotografias: any[] = [{ numero: 1, titulo: 'Título de fotografía', fuente: 'GEADES, 2024', imagen: null, preview: null }];
  fotografiasCahuacho: any[] = [];
  fotografiasCahuachoFormMulti: any[] = [];
  fotografiasInstitucionalidadAISIFormMulti: any[] = [];
  fotografiasDemografiaAISIFormMulti: any[] = [];
  fotografiasPEAAISIFormMulti: any[] = [];
  fotografiasGanaderiaAISIFormMulti: any[] = [];
  fotografiasActividadesEconomicasFormMulti: any[] = [];
  fotografiasMercadoFormMulti: any[] = [];
  fotografiasInstitucionalidadFormMulti: any[] = [];
  fotografiasAISDFormMulti: any[] = [];
  fotografiasGanaderiaFormMulti: any[] = [];
  fotografiasAgriculturaFormMulti: any[] = [];
  fotografiasComercioFormMulti: any[] = [];
  fotografiasEstructuraFormMulti: any[] = [];
  fotografiasDesechosSolidosFormMulti: any[] = [];
  fotografiasElectricidadFormMulti: any[] = [];
  fotografiasTransporteFormMulti: any[] = [];
  fotografiasTelecomunicacionesFormMulti: any[] = [];
  fotografiasSaludFormMulti: any[] = [];
  fotografiasEducacionFormMulti: any[] = [];
  fotografiasIEAyrocaFormMulti: any[] = [];
  fotografiasIE40270FormMulti: any[] = [];
  fotografiasRecreacionFormMulti: any[] = [];
  fotografiasDeporteFormMulti: any[] = [];
  fotografiasIglesiaFormMulti: any[] = [];
  fotografiasReservorioFormMulti: any[] = [];
  fotografiasUsoSuelosFormMulti: any[] = [];
  fotografiasEstructuraAISIFormMulti: any[] = [];
  fotografiasDesechosSolidosAISIFormMulti: any[] = [];
  fotografiasElectricidadAISIFormMulti: any[] = [];
  fotografiasTransporteAISIFormMulti: any[] = [];
  fotografiasTelecomunicacionesAISIFormMulti: any[] = [];
  fotografiasSaludAISIFormMulti: any[] = [];
  fotografiasEducacionAISIFormMulti: any[] = [];
  fotografiasEducacion1AISIFormMulti: any[] = [];
  fotografiasEducacion2AISIFormMulti: any[] = [];
  fotografiasEducacion3AISIFormMulti: any[] = [];
  fotografiasRecreacionAISIFormMulti: any[] = [];
  fotografiasDeporteAISIFormMulti: any[] = [];
  fotografiasDemografiaFormMulti: any[] = [];
  fotografiasPEAFormMulti: any[] = [];
  fotografiasOrganizacionSocialFormMulti: any[] = [];
  fotografiasSaludIndicadoresFormMulti: any[] = [];
  fotografiasEducacionIndicadoresFormMulti: any[] = [];
  fotografiasIDHFormMulti: any[] = [];
  fotografiasNBIFormMulti: any[] = [];
  fotografiasOrganizacionFormMulti: any[] = [];
  fotografiasFestividadesFormMulti: any[] = [];
  fotografiasSaludIndicadoresAISIFormMulti: any[] = [];
  fotografiasEducacionIndicadoresAISIFormMulti: any[] = [];
  fotografiasSeccion1FormMulti: any[] = [];
  fotografiasSeccion2FormMulti: any[] = [];
  fotografiasSeccion3FormMulti: any[] = [];
  fotografiasSeccion4FormMulti: any[] = [];
  fotografiasSeccion14FormMulti: any[] = [];
  fotografiasSeccion17FormMulti: any[] = [];
  fotografiasSeccion18FormMulti: any[] = [];
  fotografiasSeccion19FormMulti: any[] = [];
  fotografiasSeccion20FormMulti: any[] = [];
  fotografiasSeccion22FormMulti: any[] = [];
  fotografiasSeccion23FormMulti: any[] = [];
  fotografiasSeccion29FormMulti: any[] = [];
  fotografiasSeccion30FormMulti: any[] = [];
  
  columnasPET: any[] = [
    { key: 'categoria', label: 'Categoría', type: 'text', placeholder: '15 a 29 años' },
    { key: 'casos', label: 'Casos', type: 'number', placeholder: '0' },
    { key: 'porcentaje', label: 'Porcentaje', type: 'text', placeholder: '0%', readonly: true }
  ];

  columnasPEA: any[] = [
    { key: 'categoria', label: 'Categoría', type: 'text', placeholder: 'PEA/No PEA' },
    { key: 'hombres', label: 'Hombres', type: 'number', placeholder: '0' },
    { key: 'porcentajeHombres', label: '% Hombres', type: 'text', placeholder: '0%' },
    { key: 'mujeres', label: 'Mujeres', type: 'number', placeholder: '0' },
    { key: 'porcentajeMujeres', label: '% Mujeres', type: 'text', placeholder: '0%' },
    { key: 'casos', label: 'Casos', type: 'number', placeholder: '0' },
    { key: 'porcentaje', label: 'Porcentaje', type: 'text', placeholder: '0%' }
  ];
  
  fotoInstitucionalidadDragOver: boolean = false;
  fotoInstitucionalidadPreview: string | null = null;
  
  fotosGanaderia: any[] = [];
  fotosAgricultura: any[] = [];
  fotoComercioDragOver: boolean = false;
  fotoComercioPreview: string | null = null;
  fotoEstructuraPreview: string | null = null;
  fotoDesechosSolidosPreview: string | null = null;
  fotoElectricidadPreview: string | null = null;
  fotoTransportePreview: string | null = null;
  fotoTelecomunicacionesPreview: string | null = null;
  fotoSaludPreview: string | null = null;
  fotosEducacion: any[] = [];
  fotosRecreacion: any[] = [];
  fotosDeporte: any[] = [];
  fotoIglesiaPreview: string | null = null;
  fotoReservorioPreview: string | null = null;
  fotoUsoSuelosPreview: string | null = null;
  fotoCahuachoPreview: string | null = null;
  fotoActividadesEconomicasPreview: string | null = null;
  fotoMercadoPreview: string | null = null;
  fotoEstructuraAISIPreview: string | null = null;
  fotoDesechosSolidosAISIPreview: string | null = null;
  fotoElectricidadAISIPreview: string | null = null;
  fotoTransporteAISIPreview: string | null = null;
  fotoTelecomunicacionesAISIPreview: string | null = null;
  fotoSaludAISIPreview: string | null = null;
  fotoEducacion1AISIPreview: string | null = null;
  fotoEducacion2AISIPreview: string | null = null;
  fotoEducacion3AISIPreview: string | null = null;
  fotoRecreacionAISIPreview: string | null = null;
  fotoDeporteAISIPreview: string | null = null;
  private subscriptions: Subscription[] = [];

  jsonFileName: string = '';
  centrosPobladosJSON: any[] = [];
  centroPobladoSeleccionado: any = null;
  geoInfo: { DPTO: string, PROV: string, DIST: string } = { DPTO: '', PROV: '', DIST: '' };
  distritosDisponiblesAISI: string[] = [];
  distritosSeleccionadosAISI: string[] = [];
  centrosPobladosSeleccionadosAISD: string[] = [];
  distritosProvincia: string[] = [];
  comunidadesCampesinas: ComunidadCampesina[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formularioService: FormularioService,
    private dataService: DataService,
    private configService: ConfigService,
    private cdRef: ChangeDetectorRef,
    private textNormalization: TextNormalizationService,
    private stateService: StateService,
    private demografiaService: DemografiaService,
    private autocompleteService: AutocompleteService,
    private tablaManagerService: TablaManagerService,
    private poblacionService: PoblacionService,
    private censoCompletoService: CensoCompletoService,
    private backendApi: BackendApiService,
    private fieldMapping: FieldMappingService,
    private imageManagementService: ImageManagementService
  ) {}

  obtenerPrefijoGrupo(): string {
    const matchA = this.seccionId.match(/^3\.1\.4\.A\.(\d+)/);
    if (matchA) {
      const numero = matchA[1];
      return `_A${numero}`;
    }
    
    const matchB = this.seccionId.match(/^3\.1\.4\.B\.(\d+)/);
    if (matchB) {
      const numero = matchB[1];
      return `_B${numero}`;
    }
    
    if (this.seccionId.startsWith('3.1.4.A')) {
      return '_A1';
    } else if (this.seccionId.startsWith('3.1.4.B')) {
      return '_B1';
    }
    return '';
  }

  obtenerCampoConPrefijo(campo: string): string {
    const prefijo = this.obtenerPrefijoGrupo();
    if (!prefijo) return campo;
    
    const camposCompartidos = ['distritoSeleccionado', 'provinciaSeleccionada', 'departamentoSeleccionado', 'projectName', 'consultora', 'entrevistados', 'fechaTrabajoCampo', 'cantidadEntrevistas', 'coordenadasAISD', 'altitudAISD'];
    if (camposCompartidos.includes(campo)) {
      return campo;
    }
    
    // No duplicar prefijo si ya contiene _A1, _A2, _B1 o _B2
    if (campo.includes('_A1') || campo.includes('_A2') || campo.includes('_B1') || campo.includes('_B2')) {
      return campo;
    }
    
    return `${campo}${prefijo}`;
  }

  obtenerValorConPrefijo(campo: string): any {
    const campoConPrefijo = this.obtenerCampoConPrefijo(campo);
    const valor = this.datos[campoConPrefijo];
    if (valor !== undefined && valor !== null) {
      return valor;
    }
    if (campoConPrefijo !== campo) {
      return this.datos[campo];
    }
    return valor;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.seccionId = params['id'];
      this.cargarSeccion();
    });
    
    this.datos = this.formularioService.obtenerDatos();
    this.formData = { ...this.datos };
    this.stateService.setDatos(this.datos);
    
    this.fotografiasInstitucionalidadFormMulti = this.getFotografiasInstitucionalidadFormMulti();
    this.fotografiasAISDFormMulti = this.getFotografiasAISDFormMulti();
    this.fotografiasSeccion1FormMulti = this.getFotografiasSeccion1FormMulti();
    this.fotografiasSeccion2FormMulti = this.getFotografiasSeccion2FormMulti();
    this.fotografiasSeccion3FormMulti = this.getFotografiasSeccion3FormMulti();
    this.fotografiasSeccion4FormMulti = this.getFotografiasSeccion4FormMulti();
    this.fotografiasDemografiaFormMulti = this.getFotografiasDemografiaFormMulti();
    this.fotografiasPEAFormMulti = this.getFotografiasPEAFormMulti();
    this.fotografiasIDHFormMulti = this.getFotografiasIDHFormMulti();
    this.fotografiasNBIFormMulti = this.getFotografiasNBIFormMulti();
    
    if (this.seccionId === '3.1.4.A.1.1' || this.seccionId === '3.1.4.A.2.1') {
      setTimeout(() => {
        this.actualizarFotografiasInstitucionalidadFormMulti();
        this.actualizarFotografiasAISDFormMulti();
        const seccion5 = ViewChildHelper.getComponent('seccion5');
        if (seccion5) {
          seccion5.actualizarDatos();
        }
        const seccion4 = ViewChildHelper.getComponent('seccion4');
        if (seccion4) {
          seccion4.actualizarDatos();
        }
        this.cdRef.detectChanges();
      }, 200);
    }
    
    this.datos$.subscribe(datos => {
      if (datos) {
        this.datos = datos;
      }
    });

    const jsonData = this.formularioService.obtenerJSON();
    if (jsonData && jsonData.length > 0) {
      this.centrosPobladosJSON = jsonData.map((cp: any) => ({
        ...cp,
        selected: false
      }));

      if (this.centrosPobladosJSON.length > 0) {
        const primerCP = this.centrosPobladosJSON[0];
        this.geoInfo = {
          DPTO: primerCP.DPTO || '',
          PROV: primerCP.PROV || '',
          DIST: primerCP.DIST || ''
        };
      }
    }
  }

  async cargarSeccion() {
    this.actualizarTitulo();
    this.datos = this.formularioService.obtenerDatos();
    this.formData = { ...this.datos };
    
    this.comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
    
    const jsonData = this.formularioService.obtenerJSON();
    if (jsonData && jsonData.length > 0) {
      let centrosPobladosParaMostrar = jsonData;
      
      if (this.seccionId.match(/^3\.1\.4\.A\.\d+/)) {
        const codigosComunidad = this.obtenerCentrosPobladosDeComunidadCampesina();
        if (codigosComunidad.length > 0) {
          const codigosSet = new Set(codigosComunidad.map(c => c.toString().trim()));
          centrosPobladosParaMostrar = jsonData.filter((cp: any) => {
            if (!cp.CODIGO) return false;
            const codigo = cp.CODIGO.toString().trim();
            return codigo && codigosSet.has(codigo);
          });
        }
      }
      
      this.centrosPobladosJSON = centrosPobladosParaMostrar.map((cp: any) => ({
        ...cp,
        selected: cp === this.centroPobladoSeleccionado,
        selectedAISD: true
      }));
      
      if (!this.centroPobladoSeleccionado && this.centrosPobladosJSON.length > 0) {
        const capitalDistrital = this.centrosPobladosJSON.find((cp: any) => 
          cp.CATEGORIA === 'Capital distrital' || cp.CATEGORIA === 'VILLA'
        );
        this.centroPobladoSeleccionado = capitalDistrital || this.centrosPobladosJSON[0];
      }
      
      if (this.centrosPobladosJSON.length > 0 && !this.jsonFileName) {
        this.jsonFileName = 'JSON cargado';
      }
      
      if (this.centrosPobladosJSON.length > 0 && !this.geoInfo.DPTO) {
        const primerCP = this.centrosPobladosJSON[0];
        this.geoInfo = {
          DPTO: primerCP.DPTO || '',
          PROV: primerCP.PROV || '',
          DIST: primerCP.DIST || ''
        };
      }
      
      const distritosSet = new Set<string>();
      jsonData.forEach((cp: any) => {
        if (cp && cp.DIST) {
          distritosSet.add(cp.DIST);
        }
      });
      this.distritosDisponiblesAISI = Array.from(distritosSet).sort();

      this.distritosSeleccionadosAISI = this.datos['distritosSeleccionadosAISI'] || [];
      if (this.distritosSeleccionadosAISI.length === 0 && this.distritosDisponiblesAISI.length > 0) {
        this.distritosSeleccionadosAISI = [...this.distritosDisponiblesAISI];
        this.onFieldChange('distritosSeleccionadosAISI', this.distritosSeleccionadosAISI);
      }

      this.centrosPobladosSeleccionadosAISD = this.datos['centrosPobladosSeleccionadosAISD'] || [];
      if (this.centrosPobladosSeleccionadosAISD.length === 0 && this.centrosPobladosJSON.length > 0) {
        this.centrosPobladosSeleccionadosAISD = this.centrosPobladosJSON
          .filter((cp: any) => cp.CODIGO)
          .map((cp: any) => cp.CODIGO.toString());
        this.onFieldChange('centrosPobladosSeleccionadosAISD', this.centrosPobladosSeleccionadosAISD);
      }

      if (this.comunidadesCampesinas.length === 0 && this.centrosPobladosJSON.length > 0) {
        const nombreExistente = this.datos['grupoAISD'] || '';
        this.comunidadesCampesinas = [{
          id: this.generarIdComunidad(),
          nombre: nombreExistente,
          centrosPobladosSeleccionados: []
        }];
        this.guardarComunidadesCampesinas();
      }
      
      this.datos['comunidadesCampesinas'] = this.comunidadesCampesinas;
      this.formularioService.actualizarDato('comunidadesCampesinas', this.comunidadesCampesinas);
    }
    
    if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId.match(/^3\.1\.4\.A\.\d+/) || this.seccionId.match(/^3\.1\.4\.A\.\d+\.3$/)) {
      const prefijo = this.obtenerPrefijoGrupo();
      let filasConDatos = 0;
      for (let i = 1; i <= 20; i++) {
        const punto = this.datos[`tablaAISD2Fila${i}Punto${prefijo}`] || this.datos[`tablaAISD2Fila${i}Punto`] || '';
        const codigo = this.datos[`tablaAISD2Fila${i}Codigo${prefijo}`] || this.datos[`tablaAISD2Fila${i}Codigo`] || '';
        const poblacion = this.datos[`tablaAISD2Fila${i}Poblacion${prefijo}`] || this.datos[`tablaAISD2Fila${i}Poblacion`] || '';
        const viviendasEmp = this.datos[`tablaAISD2Fila${i}ViviendasEmpadronadas${prefijo}`] || this.datos[`tablaAISD2Fila${i}ViviendasEmpadronadas`] || '';
        const viviendasOcp = this.datos[`tablaAISD2Fila${i}ViviendasOcupadas${prefijo}`] || this.datos[`tablaAISD2Fila${i}ViviendasOcupadas`] || '';
        
        const tieneValor = (val: string) => val && val !== '____' && val.toString().trim() !== '';
        const tieneAlgunDato = tieneValor(punto) || tieneValor(codigo) || tieneValor(poblacion) || 
                               tieneValor(viviendasEmp) || tieneValor(viviendasOcp);
        
        if (tieneAlgunDato) {
          filasConDatos = i;
        }
      }
      this.filasTablaAISD2 = filasConDatos > 0 ? filasConDatos : 1;
    }
    
    this.actualizarEstadoNavegacion();
    
    if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.1$/)) {
      const prefijo = this.obtenerPrefijoGrupo();
      const comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
      const match = prefijo.match(/_A(\d+)/);
      let grupoAISD = this.obtenerValorConPrefijo('grupoAISD');
      
      if (match && comunidadesCampesinas.length > 0) {
        const indiceComunidad = parseInt(match[1]) - 1;
        if (indiceComunidad >= 0 && indiceComunidad < comunidadesCampesinas.length) {
          const comunidad = comunidadesCampesinas[indiceComunidad];
          if (comunidad && comunidad.nombre && comunidad.nombre.trim() !== '') {
            grupoAISD = comunidad.nombre;
            this.onFieldChange(this.obtenerCampoConPrefijo('grupoAISD'), grupoAISD);
          }
        }
      }
      
      if (!grupoAISD) {
        grupoAISD = prefijo === '_A1' ? 'Ayroca' : 'Saccsaguero';
      }
      this.fotoInstitucionalidadPreview = this.datos[`fotografiaAISD3Imagen${prefijo}`] || this.datos[`fotografiaInstitucionalidadImagen${prefijo}`] || 
                                          this.datos['fotografiaAISD3Imagen'] || this.datos['fotografiaInstitucionalidadImagen'] || null;
      
      const tituloInstituciones = this.obtenerCampoConPrefijo('tituloInstituciones');
      if (!this.datos[tituloInstituciones]) {
        const tituloDefault = 'Instituciones existentes - CC ' + grupoAISD;
        this.onFieldChange(tituloInstituciones, tituloDefault);
      }
      
      const fuenteInstituciones = this.obtenerCampoConPrefijo('fuenteInstituciones');
      if (!this.datos[fuenteInstituciones]) {
        this.onFieldChange(fuenteInstituciones, 'GEADES (2024)');
      }
      
      const fotografiaAISD3Titulo = this.obtenerCampoConPrefijo('fotografiaAISD3Titulo');
      const fotoInstitucionalidadTitulo = this.obtenerCampoConPrefijo('fotoInstitucionalidadTitulo');
      if (!this.datos[fotografiaAISD3Titulo] && !this.datos[fotoInstitucionalidadTitulo]) {
        const tituloFotoDefault = 'Local Comunal de la CC ' + grupoAISD;
        this.onFieldChange(fotografiaAISD3Titulo, tituloFotoDefault);
        this.onFieldChange(fotoInstitucionalidadTitulo, tituloFotoDefault);
      }
      
      const fotografiaAISD3Fuente = this.obtenerCampoConPrefijo('fotografiaAISD3Fuente');
      const fotoInstitucionalidadFuente = this.obtenerCampoConPrefijo('fotoInstitucionalidadFuente');
      if (!this.datos[fotografiaAISD3Fuente] && !this.datos[fotoInstitucionalidadFuente]) {
        this.onFieldChange(fotografiaAISD3Fuente, 'GEADES, 2024');
        this.onFieldChange(fotoInstitucionalidadFuente, 'GEADES, 2024');
      }
      
      this.actualizarFotografiasInstitucionalidadFormMulti();
    }
    
    if (this.seccionId === '3.1.1' || this.seccionId === '3.1.1.A' || this.seccionId === '3.1.1.B') {
      this.actualizarFotografiasSeccion1FormMulti();
    }

    if (this.seccionId === '3.1.2' || this.seccionId === '3.1.2.A' || this.seccionId === '3.1.2.B') {
      this.actualizarFotografiasSeccion2FormMulti();
    }

    if (this.seccionId === '3.1.3' || this.seccionId === '3.1.3.A' || this.seccionId === '3.1.3.B') {
      this.actualizarFotografiasSeccion3FormMulti();
    }

    if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId === '3.1.4.A.1' || this.seccionId === '3.1.4.A.2') {
      this.actualizarFotografiasSeccion4FormMulti();
    }
    
    if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.4$/)) {
      this.actualizarFotografiasGanaderiaFormMulti();
      this.actualizarFotografiasAgriculturaFormMulti();
      this.actualizarFotografiasComercioFormMulti();
    }
    
    if (this.seccionId === '3.1.4.B' || this.seccionId === '3.1.4.B.1' || this.seccionId === '3.1.4.B.2') {
      const prefijo = this.obtenerPrefijoGrupo();
      const centroPobladoAISI = this.obtenerValorConPrefijo('centroPobladoAISI') || (prefijo === '_B1' ? 'Cahuacho' : 'Montesory');
      this.fotoCahuachoPreview = this.datos[`fotografiaCahuachoImagen${prefijo}`] || this.datos['fotografiaCahuachoImagen'] || null;
      const fotografiaCahuachoTitulo = this.obtenerCampoConPrefijo('fotografiaCahuachoTitulo');
      if (!this.datos[fotografiaCahuachoTitulo]) {
        this.onFieldChange(fotografiaCahuachoTitulo, 'Vista panorámica del CP ' + centroPobladoAISI);
      }
      const fotografiaCahuachoFuente = this.obtenerCampoConPrefijo('fotografiaCahuachoFuente');
      if (!this.datos[fotografiaCahuachoFuente]) {
        this.onFieldChange(fotografiaCahuachoFuente, 'GEADES, 2024');
      }
      this.actualizarFotografiasCahuachoFormMulti();
    }

    if (this.seccionId === '3.1.4.B.1.1' || this.seccionId === '3.1.4.B.2.1') {
      this.actualizarFotografiasInstitucionalidadAISIFormMulti();
    }

    if (this.seccionId === '3.1.4.B.1.2' || this.seccionId === '3.1.4.B.2.2') {
      this.actualizarFotografiasDemografiaAISIFormMulti();
      this.actualizarFotografiasPEAAISIFormMulti();
    }

    if (this.seccionId === '3.1.4.B.1.3' || this.seccionId === '3.1.4.B.2.3') {
      this.actualizarFotografiasPEAAISIFormMulti();
    }

    if (this.seccionId === '3.1.4.B.1.4' || this.seccionId === '3.1.4.B.2.4') {
      this.actualizarFotografiasGanaderiaAISIFormMulti();
    }
    
    if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.5$/)) {
      this.actualizarFotografiasEstructuraFormMulti();
      const codigosCPP = this.obtenerCodigosCPPDeTablaAISD2();
      if (codigosCPP.length > 0) {
        setTimeout(() => {
          this.cargarViviendasAISD(null);
        }, 300);
      } else {
        const prefijo = this.obtenerPrefijoGrupo();
        const condicionOcupacionTabla = this.obtenerCampoConPrefijo('condicionOcupacionTabla');
        if (!this.datos[condicionOcupacionTabla] || this.datos[condicionOcupacionTabla].length === 0) {
          this.inicializarCondicionOcupacion();
        }
      }
    }
    
    if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.6$/)) {
      this.actualizarFotografiasDesechosSolidosFormMulti();
      this.actualizarFotografiasElectricidadFormMulti();
      const codigosCPP = this.obtenerCodigosCPPDeTablaAISD2();
      if (codigosCPP.length > 0) {
        setTimeout(() => {
          this.cargarServiciosBasicosAISD(null);
        }, 300);
      }
    }
    
    if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.7$/)) {
      this.actualizarFotografiasTransporteFormMulti();
      this.actualizarFotografiasTelecomunicacionesFormMulti();
    }
    
    if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.8$/)) {
      this.actualizarFotografiasSaludFormMulti();
      this.actualizarFotografiasIEAyrocaFormMulti();
      this.actualizarFotografiasIE40270FormMulti();
      this.actualizarFotografiasRecreacionFormMulti();
      this.actualizarFotografiasDeporteFormMulti();
      const codigosCPP = this.obtenerCodigosCPPDeTablaAISD2();
      if (codigosCPP.length > 0) {
        setTimeout(() => {
          this.cargarInfraestructuraAISD(null);
        }, 300);
      }
    }

    if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.15$/)) {
      this.actualizarFotografiasOrganizacionSocialFormMulti();
    }

    if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.16$/)) {
      this.actualizarFotografiasFestividadesFormMulti();
    }
    
    if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.9$/)) {
      const codigosCPP = this.obtenerCodigosCPPDeTablaAISD2();
      if (codigosCPP.length > 0) {
        setTimeout(() => {
          this.cargarIndicadoresSaludAISD(null);
        }, 300);
      }
    }
    
    if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.10$/)) {
      const codigosCPP = this.obtenerCodigosCPPDeTablaAISD2();
      if (codigosCPP.length > 0) {
        setTimeout(() => {
          this.cargarIndicadoresEducacionAISD(null);
        }, 300);
      }
    }
    
    if (this.seccionId === '3.1.4.A.1.11') {
      this.fotoIglesiaPreview = this.datos['fotografiaIglesiaImagen'] || null;
      this.fotoCahuachoPreview = this.datos['fotografiaCahuachoImagen'] || null;
      this.fotoActividadesEconomicasPreview = this.datos['fotografiaActividadesEconomicasImagen'] || null;
      this.fotoMercadoPreview = this.datos['fotografiaMercadoImagen'] || null;
      this.fotoEstructuraAISIPreview = this.datos['fotografiaEstructuraAISIImagen'] || null;
      this.fotoDesechosSolidosAISIPreview = this.datos['fotografiaDesechosSolidosAISIImagen'] || null;
      this.fotoElectricidadAISIPreview = this.datos['fotografiaElectricidadAISIImagen'] || null;
      this.fotoTransporteAISIPreview = this.datos['fotografiaTransporteAISIImagen'] || null;
      this.fotoTelecomunicacionesAISIPreview = this.datos['fotografiaTelecomunicacionesAISIImagen'] || null;
      this.fotoSaludAISIPreview = this.datos['fotografiaSaludAISIImagen'] || null;
      this.fotoEducacion1AISIPreview = this.datos['fotografiaEducacion1AISIImagen'] || null;
      this.fotoEducacion2AISIPreview = this.datos['fotografiaEducacion2AISIImagen'] || null;
      this.fotoEducacion3AISIPreview = this.datos['fotografiaEducacion3AISIImagen'] || null;
      this.fotoRecreacionAISIPreview = this.datos['fotografiaRecreacionAISIImagen'] || null;
      this.fotoDeporteAISIPreview = this.datos['fotografiaDeporteAISIImagen'] || null;
    }
    
    if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.13$/)) {
      const codigosCPP = this.obtenerCodigosCPPDeTablaAISD2();
      if (codigosCPP.length > 0) {
        setTimeout(() => {
          this.cargarIDHAISD(null);
        }, 300);
      }
    }
    
    if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.14$/)) {
      const codigosCPP = this.obtenerCodigosCPPDeTablaAISD2();
      if (codigosCPP.length > 0) {
        setTimeout(() => {
          this.cargarNBIAISD(null);
        }, 300);
      }
    }
    
    if (this.seccionId === '3.1.4.A.1.12' || this.seccionId === '3.1.4.A.2.12') {
      const prefijo = this.obtenerPrefijoGrupo();
      const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || (prefijo === '_A1' ? 'Ayroca' : 'Saccsaguero');
      this.fotoReservorioPreview = this.datos[`fotografiaReservorioImagen${prefijo}`] || this.datos['fotografiaReservorioImagen'] || null;
      this.fotoUsoSuelosPreview = this.datos[`fotografiaUsoSuelosImagen${prefijo}`] || this.datos['fotografiaUsoSuelosImagen'] || null;
      const fotografiaReservorioTitulo = this.obtenerCampoConPrefijo('fotografiaReservorioTitulo');
      if (!this.datos[fotografiaReservorioTitulo]) {
        this.onFieldChange(fotografiaReservorioTitulo, 'Reservorio del anexo ' + grupoAISD);
      }
      const fotografiaReservorioFuente = this.obtenerCampoConPrefijo('fotografiaReservorioFuente');
      if (!this.datos[fotografiaReservorioFuente]) {
        this.onFieldChange(fotografiaReservorioFuente, 'GEADES, 2024');
      }
      const fotografiaUsoSuelosTitulo = this.obtenerCampoConPrefijo('fotografiaUsoSuelosTitulo');
      if (!this.datos[fotografiaUsoSuelosTitulo]) {
        this.onFieldChange(fotografiaUsoSuelosTitulo, 'Uso de los suelos en el anexo ' + grupoAISD);
      }
      if (!this.datos['fotografiaUsoSuelosFuente']) {
        this.onFieldChange('fotografiaUsoSuelosFuente', 'GEADES, 2024');
      }
    }
    
    // Actualizar seccion1 si estamos en la sección 3.1.1
    if (this.seccionId === '3.1.1') {
      setTimeout(() => {
        const comp1 = ViewChildHelper.getComponent('seccion1');
        if (comp1) {
          comp1.actualizarDatos();
        }
      }, 100);
    }
    
    // Actualizar seccion2 si estamos en la sección 3.1.2, 3.1.2.A o 3.1.2.B
    if (this.seccionId === '3.1.2' || this.seccionId === '3.1.2.A' || this.seccionId === '3.1.2.B') {
      setTimeout(() => {
        const comp2 = ViewChildHelper.getComponent('seccion2');
        if (comp2) {
          comp2.actualizarDatos();
          if (comp2['detectarDistritos']) {
            comp2['detectarDistritos']();
          }
        }
      }, 100);
      
      if (this.formData['distritoSeleccionado']) {
        this.cargarCentrosPobladosParaAISD(this.formData['distritoSeleccionado']);
        if (!this.formData['grupoAISI']) {
          this.autoCompletarCpAisi();
        }
      }
    }
    
    // Actualizar seccion3 si estamos en la sección 3.1.3, 3.1.3.A o 3.1.3.B
    if (this.seccionId === '3.1.3' || this.seccionId === '3.1.3.A' || this.seccionId === '3.1.3.B') {
      setTimeout(() => {
        const comp3 = ViewChildHelper.getComponent('seccion3');
        if (comp3) {
          comp3.actualizarDatos();
        }
      }, 100);
    }
    
    setTimeout(() => {
      this.actualizarComponenteSeccion();
    }, 100);
    
    if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId.match(/^3\.1\.4\.A\.\d+$/)) {
      this.fotografias = [{ numero: 1, titulo: 'Título de fotografía', fuente: 'GEADES, 2024', imagen: null, preview: null, dragOver: false }];
    }
    
    if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId.match(/^3\.1\.4\.A\.\d+$/)) {
      if (this.formData['coordenadasAISD'] === undefined || this.formData['coordenadasAISD'] === null) {
        this.formData['coordenadasAISD'] = '';
        this.datos['coordenadasAISD'] = '';
      }
      if (this.formData['altitudAISD'] === undefined || this.formData['altitudAISD'] === null) {
        this.formData['altitudAISD'] = '';
        this.datos['altitudAISD'] = '';
      }

      if (!this.formData['cuadroTituloAISD1']) {
        this.onFieldChange('cuadroTituloAISD1', 'Ubicación referencial');
      }
      if (!this.formData['cuadroFuenteAISD1']) {
        this.onFieldChange('cuadroFuenteAISD1', 'GEADES (2024)');
      }
      if (!this.formData['cuadroTituloAISD2']) {
        this.onFieldChange('cuadroTituloAISD2', 'Cantidad total de población y viviendas');
      }
      if (!this.formData['cuadroFuenteAISD2']) {
        this.onFieldChange('cuadroFuenteAISD2', 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)');
      }

      this.fotografias.forEach((foto, index) => {
        const fotoKey1 = `fotografiaAISD${index + 1}Titulo`;
        const fotoKey2 = `fotografiaAISD${index + 1}Fuente`;
        if (!this.formData[fotoKey1]) {
          this.onFieldChange(fotoKey1, 'Título de fotografía');
          foto.titulo = 'Título de fotografía';
        }
        if (!this.formData[fotoKey2]) {
          this.onFieldChange(fotoKey2, 'GEADES, 2024');
          foto.fuente = 'GEADES, 2024';
        }
      });

      const prefijo = this.obtenerPrefijoGrupo();
      const jsonData = this.formularioService.obtenerJSON();
      
      if (prefijo && prefijo.startsWith('_A') && jsonData && jsonData.length > 0) {
        this.datos = this.formularioService.obtenerDatos();
        this.comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
        
        const codigosComunidad = this.obtenerCentrosPobladosDeComunidadCampesina();
        if (codigosComunidad.length > 0) {
          const codigosSet = new Set(codigosComunidad.map(c => c.toString().trim()));
          const centrosPobladosFiltrados = jsonData.filter((cp: any) => {
            if (!cp.CODIGO) return false;
            const codigo = cp.CODIGO.toString().trim();
            return codigo && codigosSet.has(codigo);
          });
          if (centrosPobladosFiltrados.length > 0) {
            setTimeout(() => {
              this.poblarTablaAISD2DesdeJSON(centrosPobladosFiltrados);
              setTimeout(() => {
                this.cargarViviendasParaTablaExistente();
              }, 500);
            }, 200);
            return;
          }
        }
      }
      
      if (!(prefijo && prefijo.startsWith('_A'))) {
        if (jsonData && jsonData.length > 0) {
          setTimeout(() => {
            this.poblarTablaAISD2DesdeJSON(jsonData);
            setTimeout(() => {
              this.cargarViviendasParaTablaExistente();
            }, 500);
          }, 200);
        } else {
          setTimeout(() => {
            this.cargarViviendasParaTablaExistente();
            this.calcularTotalesTablaAISD2();
          }, 100);
        }
      }
    }
    
    if (this.formData['distritoSeleccionado']) {
      this.cargarOpcionesBackend();
      
      if ((this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId.match(/^3\.1\.4\.A\.\d+$/)) && !this.obtenerValorConPrefijo('grupoAISI')) {
        const prefijo = this.obtenerPrefijoGrupo();
        this.onFieldChange(this.obtenerCampoConPrefijo('grupoAISI'), this.formData['distritoSeleccionado']);
      }
      
      if (this.formData['distritoSeleccionado'] && this.formData['provinciaSeleccionada'] && this.formData['departamentoSeleccionado']) {
        if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId.match(/^3\.1\.4\.A\.\d+$/)) {
          this.cargarCentrosPobladosParaAISD(this.formData['distritoSeleccionado']);
        }
        if (this.seccionId === '3.1.4.B' || this.seccionId === '3.1.4.B.1' || this.seccionId === '3.1.4.B.2') {
          this.cargarCentrosPobladosParaAISI(this.formData['distritoSeleccionado']);
        }
      }
    }
    
    if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.2$/)) {
      const prefijo = this.obtenerPrefijoGrupo();
      this.datos = this.formularioService.obtenerDatos();
      this.comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
      const codigosComunidad = this.obtenerCentrosPobladosDeComunidadCampesina();
      if (codigosComunidad.length > 0) {
        const jsonDataCompleto = this.formularioService.obtenerJSON();
        if (jsonDataCompleto && jsonDataCompleto.length > 0) {
          const codigosSet = new Set(codigosComunidad.map(c => c.toString().trim()));
          const centrosPobladosFiltrados = jsonDataCompleto.filter((cp: any) => {
            if (!cp.CODIGO) return false;
            const codigo = cp.CODIGO.toString().trim();
            return codigo && codigosSet.has(codigo);
          });
          if (centrosPobladosFiltrados.length > 0) {
            setTimeout(() => {
              this.poblarTablaAISD2DesdeJSON(centrosPobladosFiltrados);
              setTimeout(() => {
                this.cargarViviendasParaTablaExistente();
              }, 500);
            }, 300);
          }
        }
      }
      this.cargarDatosDemografiaAISDSiDisponible();
    } else if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.3$/)) {
      const distrito = this.datos['distritoSeleccionado'] || this.formData['distritoSeleccionado'];
      if (distrito && (!this.datos['peaTabla'] || this.datos['peaTabla'].length === 0)) {
        this.cargarDatosPEAAISD();
      }
      setTimeout(() => {
        this.cargarPETDesdeDemografiaAISD();
      }, 800);
    } else if (this.seccionId === '3.1.4.B.1.1') {
      this.cargarDatosDemografiaAISI();
    } else if (this.seccionId === '3.1.4.B.1.2') {
      this.cargarDatosPEAAISI();
    }
    
    this.cargarDatosAutomaticos();
    
    this.scrollRealizado = false;
    this.cdRef.detectChanges();
  }

  cargarDatosDemografiaAISDSiDisponible() {
    if (this.datos['poblacionSexoAISD'] && this.datos['poblacionSexoAISD'].length > 0 &&
        this.datos['poblacionEtarioAISD'] && this.datos['poblacionEtarioAISD'].length > 0) {
      return;
    }

    let tieneCodigosCPP = false;
    
    if (this.datos['codigos'] && Array.isArray(this.datos['codigos']) && this.datos['codigos'].length > 0) {
      tieneCodigosCPP = true;
    } else {
      for (let i = 1; i <= this.filasTablaAISD2; i++) {
        const codigo = this.formData[`tablaAISD2Fila${i}Codigo`] || this.datos[`tablaAISD2Fila${i}Codigo`] || '';
        if (codigo && codigo.trim() !== '') {
          tieneCodigosCPP = true;
          break;
        }
      }
    }

    if (tieneCodigosCPP) {
      setTimeout(() => {
        this.cargarDatosDemografiaAISD();
      }, 300);
    }
  }

  async cargarDatosDemografiaAISD() {
    try {
      const datosActualizados = await this.demografiaService.cargarDatosDemografiaAISD(
        this.datos,
        this.filasTablaAISD2,
        this.formData
      );
      this.datos = datosActualizados;
      this.formularioService.actualizarDatos(this.datos);
      
      if (this.seccionId === '3.1.4.A.1.3') {
        setTimeout(() => {
          this.cargarPETDesdeDemografiaAISD();
        }, 500);
      }
      this.formularioService.actualizarDatos(this.datos);
      this.cdRef.detectChanges();
      
      if (this.seccionId === '3.1.4.A.1.3') {
        setTimeout(() => {
          this.cargarPETDesdeDemografiaAISD();
        }, 300);
      }
    } catch (error: any) {
      if (error.message === 'NO_CODIGOS_CPP') {
        const distrito = this.datos['distritoSeleccionado'];
        if (!distrito) {
          return;
        }
        try {
          const datosActualizados = await this.demografiaService.cargarPorDistrito(this.datos, distrito);
          this.datos = datosActualizados;
          this.formularioService.actualizarDatos(this.datos);
          this.cdRef.detectChanges();
          
          if (this.seccionId === '3.1.4.A.1.3') {
            setTimeout(() => {
              this.cargarPETDesdeDemografiaAISD();
            }, 300);
          }
        } catch (err: any) {
        }
      }
    }
  }

  async cargarDatosDemografiaAISI() {
    try {
      const datosActualizados = await this.demografiaService.cargarDatosDemografiaAISI(this.datos);
      this.datos = datosActualizados;
      this.formularioService.actualizarDatos(this.datos);
      this.cdRef.detectChanges();
    } catch (error: any) {
      alert(error.message);
    }
  }

  cargarDatosDemografiaAISIOld() {
    const distrito = this.datos['distritoSeleccionado'];
    const grupoAISI = this.datos['grupoAISI'] || distrito;
    
    if (!distrito) {
      return;
    }

    const jsonData = this.formularioService.obtenerJSON();
    if (jsonData && jsonData.length > 0) {
      const centroPoblado = jsonData.find((cp: any) => 
        cp.CCPP && cp.CCPP.toUpperCase() === grupoAISI.toUpperCase()
      ) || jsonData.find((cp: any) => cp.CATEGORIA === 'Capital distrital');

      if (centroPoblado && centroPoblado.POBLACION) {
        const poblacionTotal = centroPoblado.POBLACION;
        const porcentajeHombres = '49.65%';
        const porcentajeMujeres = '50.35%';
        const hombres = Math.round(poblacionTotal * 0.4965);
        const mujeres = poblacionTotal - hombres;

        this.datos['poblacionSexoAISI'] = [
          { sexo: 'Hombre', casos: hombres, porcentaje: porcentajeHombres },
          { sexo: 'Mujer', casos: mujeres, porcentaje: porcentajeMujeres },
          { sexo: 'Total', casos: poblacionTotal, porcentaje: '100,00 %' }
        ];

        this.formularioService.actualizarDatos(this.datos);
        this.cdRef.detectChanges();
        return;
      }
    }
    
    this.dataService.getPoblacionByDistrito(distrito.toUpperCase()).subscribe({
      next: (response) => {
        if (response && response.success && Array.isArray(response.data)) {
          const centroPoblado = response.data.find((cp: CentroPoblado) => 
            cp.centro_poblado && cp.centro_poblado.toUpperCase() === grupoAISI.toUpperCase()
          ) || response.data[0];
          
          if (centroPoblado) {
            const total = centroPoblado.total || 0;
            const hombres = centroPoblado.hombres || 0;
            const mujeres = centroPoblado.mujeres || 0;
            
            const porcentajeHombres = total > 0 ? ((hombres / total) * 100).toFixed(2) + '%' : '0%';
            const porcentajeMujeres = total > 0 ? ((mujeres / total) * 100).toFixed(2) + '%' : '0%';
            
            this.datos['poblacionSexoAISI'] = [
              { sexo: 'Hombres', casos: hombres, porcentaje: porcentajeHombres },
              { sexo: 'Mujeres', casos: mujeres, porcentaje: porcentajeMujeres }
            ];
            
            this.formularioService.actualizarDatos(this.datos);
            this.cdRef.detectChanges();
          }
        }
      },
      error: (error) => {
      }
    });
  }

  cargarDatosPEAAISI() {
    const distrito = this.datos['distritoSeleccionado'];
    const grupoAISI = this.datos['grupoAISI'] || this.datos['centroPobladoAISI'] || distrito;
    
    if (!distrito) {
      alert('Por favor, seleccione primero un distrito');
      return;
    }

    this.dataService.getPoblacionByDistrito(distrito.toUpperCase()).subscribe({
      next: (poblacionResponse) => {
        let totalHombresDistrito = 0;
        let totalMujeresDistrito = 0;
        let poblacionDistritalTotal = 0;

        if (poblacionResponse && poblacionResponse.success && Array.isArray(poblacionResponse.data)) {
          poblacionDistritalTotal = poblacionResponse.data.reduce((sum: number, cp: CentroPoblado) => {
            totalHombresDistrito += cp.hombres || 0;
            totalMujeresDistrito += cp.mujeres || 0;
            return sum + (cp.total || 0);
          }, 0);
        }

        this.datos['poblacionDistritalAISI'] = poblacionDistritalTotal.toString();

        const jsonData = this.formularioService.obtenerJSON();
        let codigoCPP: string | null = null;
        
        if (jsonData && jsonData.length > 0) {
          const centroPoblado = jsonData.find((cp: any) => 
            cp.CCPP && cp.CCPP.toUpperCase() === grupoAISI.toUpperCase()
          ) || jsonData.find((cp: any) => cp.CATEGORIA === 'Capital distrital');
          
          if (centroPoblado && centroPoblado.CODIGO) {
            codigoCPP = centroPoblado.CODIGO.toString();
          }
        }

        if (codigoCPP) {
          this.dataService.getPoblacionByCpp([codigoCPP]).subscribe({
            next: (poblacionCppResponse) => {
              if (poblacionCppResponse && poblacionCppResponse.success && poblacionCppResponse.data?.poblacion) {
                const poblacion = poblacionCppResponse.data.poblacion;
                const edad15_29 = poblacion.edad_15_29 || 0;
                const edad30_44 = poblacion.edad_30_44 || 0;
                const edad45_64 = poblacion.edad_45_64 || 0;
                const edad65_mas = poblacion.edad_65_mas || 0;
                const totalPET = edad15_29 + edad30_44 + edad45_64 + edad65_mas;

                this.datos['petGruposEdadAISI'] = [
                  {
                    categoria: '15 a 29 años',
                    casos: edad15_29,
                    porcentaje: totalPET > 0 ? ((edad15_29 / totalPET) * 100).toFixed(2).replace('.', ',') + ' %' : '0,00 %'
                  },
                  {
                    categoria: '30 a 44 años',
                    casos: edad30_44,
                    porcentaje: totalPET > 0 ? ((edad30_44 / totalPET) * 100).toFixed(2).replace('.', ',') + ' %' : '0,00 %'
                  },
                  {
                    categoria: '45 a 64 años',
                    casos: edad45_64,
                    porcentaje: totalPET > 0 ? ((edad45_64 / totalPET) * 100).toFixed(2).replace('.', ',') + ' %' : '0,00 %'
                  },
                  {
                    categoria: '65 años a más',
                    casos: edad65_mas,
                    porcentaje: totalPET > 0 ? ((edad65_mas / totalPET) * 100).toFixed(2).replace('.', ',') + ' %' : '0,00 %'
                  },
                  {
                    categoria: 'Total',
                    casos: totalPET,
                    porcentaje: '100,00 %'
                  }
                ];
              }
              
              this.cargarPEADataAISI(distrito, poblacionDistritalTotal, totalHombresDistrito, totalMujeresDistrito);
            },
            error: (error) => {
              console.error('Error al cargar población por CPP:', error);
              this.cargarPEADataAISI(distrito, poblacionDistritalTotal, totalHombresDistrito, totalMujeresDistrito);
            }
          });
        } else {
          this.cargarPEADataAISI(distrito, poblacionDistritalTotal, totalHombresDistrito, totalMujeresDistrito);
        }
      },
      error: (error) => {
        console.error('Error al cargar población distrital:', error);
        // Silenciar error - usando datos mock
      }
    });
  }

  cargarPEADataAISI(distrito: string, poblacionDistritalTotal: number, totalHombresDistrito: number, totalMujeresDistrito: number) {
    this.dataService.getPEAByDistrito(distrito.toUpperCase()).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          const data = response.data;
          
          const totalPEA = data.pea || 0;
          const totalNoPEA = data.no_pea || 0;
          const totalPET = totalPEA + totalNoPEA;
          
          this.datos['petDistritalAISI'] = totalPET.toString();
          
          const totalOcupada = data.ocupada || 0;
          const totalDesocupada = data.desocupada || 0;
          
          const proporcionHombres = poblacionDistritalTotal > 0 ? totalHombresDistrito / poblacionDistritalTotal : 0.5;
          const proporcionMujeres = 1 - proporcionHombres;
          
          const hombresPEA = Math.round(totalPEA * proporcionHombres);
          const mujeresPEA = totalPEA - hombresPEA;
          const hombresNoPEA = Math.round(totalNoPEA * proporcionHombres);
          const mujeresNoPEA = totalNoPEA - hombresNoPEA;
          
          const totalHombresPET = hombresPEA + hombresNoPEA;
          const totalMujeresPET = mujeresPEA + mujeresNoPEA;
          
          const calcularPorcentajeSexo = (valor: number, total: number) => {
            return total > 0 ? ((valor / total) * 100).toFixed(2).replace('.', ',') + ' %' : '0 %';
          };
          
          this.datos['peaDistritoSexoTabla'] = [
            {
              categoria: 'PEA',
              hombres: hombresPEA,
              porcentajeHombres: calcularPorcentajeSexo(hombresPEA, totalHombresPET),
              mujeres: mujeresPEA,
              porcentajeMujeres: calcularPorcentajeSexo(mujeresPEA, totalMujeresPET),
              casos: totalPEA,
              porcentaje: data.porcentaje_pea || '0%'
            },
            {
              categoria: 'No PEA',
              hombres: hombresNoPEA,
              porcentajeHombres: calcularPorcentajeSexo(hombresNoPEA, totalHombresPET),
              mujeres: mujeresNoPEA,
              porcentajeMujeres: calcularPorcentajeSexo(mujeresNoPEA, totalMujeresPET),
              casos: totalNoPEA,
              porcentaje: data.porcentaje_no_pea || '0%'
            },
            {
              categoria: 'Total',
              hombres: totalHombresPET,
              porcentajeHombres: '100,00 %',
              mujeres: totalMujeresPET,
              porcentajeMujeres: '100,00 %',
              casos: totalPET,
              porcentaje: '100,00 %'
            }
          ];
          
          const hombresOcupada = Math.round(totalOcupada * proporcionHombres);
          const mujeresOcupada = totalOcupada - hombresOcupada;
          const hombresDesocupada = Math.round(totalDesocupada * proporcionHombres);
          const mujeresDesocupada = totalDesocupada - hombresDesocupada;
          
          const totalHombresPEA = hombresOcupada + hombresDesocupada;
          const totalMujeresPEA = mujeresOcupada + mujeresDesocupada;
          const totalPEA2 = totalHombresPEA + totalMujeresPEA;
          
          this.datos['peaOcupadaDesocupadaTabla'] = [
            {
              categoria: 'PEA Ocupada',
              hombres: hombresOcupada,
              porcentajeHombres: calcularPorcentajeSexo(hombresOcupada, totalHombresPEA),
              mujeres: mujeresOcupada,
              porcentajeMujeres: calcularPorcentajeSexo(mujeresOcupada, totalMujeresPEA),
              casos: totalOcupada,
              porcentaje: data.porcentaje_ocupada || '0%'
            },
            {
              categoria: 'PEA Desocupada',
              hombres: hombresDesocupada,
              porcentajeHombres: calcularPorcentajeSexo(hombresDesocupada, totalHombresPEA),
              mujeres: mujeresDesocupada,
              porcentajeMujeres: calcularPorcentajeSexo(mujeresDesocupada, totalMujeresPEA),
              casos: totalDesocupada,
              porcentaje: data.porcentaje_desocupada || '0%'
            },
            {
              categoria: 'Total',
              hombres: totalHombresPEA,
              porcentajeHombres: '100,00 %',
              mujeres: totalMujeresPEA,
              porcentajeMujeres: '100,00 %',
              casos: totalPEA2,
              porcentaje: '100,00 %'
            }
          ];
          
          this.datos['peaAISI'] = {
            pea: totalPEA,
            no_pea: totalNoPEA,
            porcentaje_pea: data.porcentaje_pea || '0%',
            porcentaje_no_pea: data.porcentaje_no_pea || '0%',
            ocupada: totalOcupada,
            desocupada: totalDesocupada,
            porcentaje_ocupada: data.porcentaje_ocupada || '0%',
            porcentaje_desocupada: data.porcentaje_desocupada || '0%'
          };
          
          this.formularioService.actualizarDato('poblacionDistritalAISI', this.datos['poblacionDistritalAISI']);
          this.formularioService.actualizarDato('petDistritalAISI', this.datos['petDistritalAISI']);
          this.formularioService.actualizarDato('petGruposEdadAISI', this.datos['petGruposEdadAISI']);
          this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos['peaDistritoSexoTabla']);
          this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos['peaOcupadaDesocupadaTabla']);
          this.formularioService.actualizarDato('peaAISI', this.datos['peaAISI']);
          this.actualizarComponenteSeccion();
          this.cdRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al cargar datos PEA:', error);
        // Silenciar error - usando datos mock
      }
    });
  }

  cargarDatosAutomaticos() {
    const codigosCPP = this.datos['codigos'] || [];
    const distrito = this.datos['distritoSeleccionado'];
    const jsonData = this.formularioService.obtenerJSON();
    
    if (!codigosCPP || codigosCPP.length === 0) {
      if (jsonData && jsonData.length > 0) {
        const codigosExtraidos = jsonData
          .filter((cp: any) => cp.CODIGO)
          .map((cp: any) => cp.CODIGO.toString());
        if (codigosExtraidos.length > 0) {
          this.datos['codigos'] = codigosExtraidos;
          this.formularioService.actualizarDatos(this.datos);
        }
      }
    }
    
    let codigosDisponibles = this.datos['codigos'] || [];
    
    if (this.seccionId.startsWith('3.1.4.A')) {
      const codigosComunidad = this.obtenerCentrosPobladosDeComunidadCampesina();
      if (codigosComunidad.length > 0) {
        codigosDisponibles = codigosComunidad;
      }
    }
    
    let codigoPrincipal = codigosDisponibles.length > 0 ? codigosDisponibles[0] : null;
    
    const centroPobladoAISI = this.datos['centroPobladoAISI'] || this.datos['grupoAISI'];
    if (jsonData && jsonData.length > 0 && centroPobladoAISI) {
      const cpAISI = jsonData.find((cp: any) => 
        cp.CCPP && cp.CCPP.toUpperCase() === centroPobladoAISI.toUpperCase()
      ) || jsonData.find((cp: any) => cp.CATEGORIA === 'Capital distrital' || cp.CATEGORIA === 'VILLA');
      
      if (cpAISI && cpAISI.CODIGO) {
        const codigoAISI = cpAISI.CODIGO.toString();
        if (this.seccionId.startsWith('3.1.4.B')) {
          codigoPrincipal = codigoAISI;
        }
      }
    }
    
    if (!codigoPrincipal && !distrito) {
      return;
    }
    
    const seccionesAISD: { [key: string]: () => void } = {};
    
    const matchAISD = this.seccionId.match(/^3\.1\.4\.A\.(\d+)\.(\d+)$/);
    if (matchAISD) {
      const numeroGrupo = matchAISD[1];
      const numeroSubseccion = matchAISD[2];
      
      seccionesAISD[`3.1.4.A.${numeroGrupo}.2`] = () => {
        const prefijo = this.obtenerPrefijoGrupo();
        this.datos = this.formularioService.obtenerDatos();
        this.comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
        const codigosComunidad = this.obtenerCentrosPobladosDeComunidadCampesina();
        if (codigosComunidad.length > 0) {
          const jsonDataCompleto = this.formularioService.obtenerJSON();
          if (jsonDataCompleto && jsonDataCompleto.length > 0) {
            const codigosSet = new Set(codigosComunidad.map(c => c.toString().trim()));
            const centrosPobladosFiltrados = jsonDataCompleto.filter((cp: any) => {
              if (!cp.CODIGO) return false;
              const codigo = cp.CODIGO.toString().trim();
              return codigo && codigosSet.has(codigo);
            });
            if (centrosPobladosFiltrados.length > 0) {
              setTimeout(() => {
                this.poblarTablaAISD2DesdeJSON(centrosPobladosFiltrados);
                setTimeout(() => {
                  this.cargarViviendasParaTablaExistente();
                }, 500);
              }, 300);
            }
          }
        }
        this.cargarDatosDemografiaAISDSiDisponible();
      };
      seccionesAISD[`3.1.4.A.${numeroGrupo}.3`] = () => {
        if (distrito && (!this.datos['peaTabla'] || this.datos['peaTabla'].length === 0)) {
          this.cargarDatosPEAAISD();
        }
        setTimeout(() => {
          this.cargarPETDesdeDemografiaAISD();
        }, 600);
        this.cargarActividadesEconomicasAISD(codigoPrincipal);
        this.cargarIngresoPerCapitaAISD(codigoPrincipal, distrito);
      };
      seccionesAISD[`3.1.4.A.${numeroGrupo}.4`] = () => this.cargarActividadesEconomicasAISD(codigoPrincipal);
      seccionesAISD[`3.1.4.A.${numeroGrupo}.5`] = () => this.cargarViviendasAISD(codigoPrincipal);
      seccionesAISD[`3.1.4.A.${numeroGrupo}.6`] = () => this.cargarServiciosBasicosAISD(codigoPrincipal);
      seccionesAISD[`3.1.4.A.${numeroGrupo}.8`] = () => this.cargarInfraestructuraAISD(codigoPrincipal);
      seccionesAISD[`3.1.4.A.${numeroGrupo}.9`] = () => this.cargarIndicadoresSaludAISD(codigoPrincipal);
      seccionesAISD[`3.1.4.A.${numeroGrupo}.10`] = () => this.cargarIndicadoresEducacionAISD(codigoPrincipal);
      seccionesAISD[`3.1.4.A.${numeroGrupo}.13`] = () => this.cargarIDHAISD(codigoPrincipal);
      seccionesAISD[`3.1.4.A.${numeroGrupo}.14`] = () => this.cargarNBIAISD(codigoPrincipal);
    }
    
    const seccionesAISI = {
      '3.1.4.B': () => this.cargarUbicacionAISI(jsonData),
      '3.1.4.B.1': () => this.cargarUbicacionAISI(jsonData),
      '3.1.4.B.1.1': () => {
        if (!this.datos['poblacionSexoAISI'] || this.datos['poblacionSexoAISI'].length === 0) {
          this.cargarDatosDemografiaAISI();
        }
      },
      '3.1.4.B.1.2': () => {
        if (distrito && (!this.datos['peaDistritoSexoTabla'] || this.datos['peaDistritoSexoTabla'].length === 0)) {
          this.cargarDatosPEAAISI();
        }
        this.cargarIngresoPerCapitaAISI(codigoPrincipal, distrito);
      },
      '3.1.4.B.1.3': () => {
        this.cargarActividadesEconomicasAISI(codigoPrincipal);
        this.cargarIngresoPerCapitaAISI(codigoPrincipal, distrito);
      },
      '3.1.4.B.1.4': () => this.cargarViviendasAISI(codigoPrincipal),
      '3.1.4.B.1.5': () => this.cargarServiciosBasicosAISI(codigoPrincipal),
      '3.1.4.B.1.7': () => this.cargarInfraestructuraAISI(codigoPrincipal),
      '3.1.4.B.1.8': () => this.cargarIndicadoresSaludAISI(codigoPrincipal),
      '3.1.4.B.1.9': () => this.cargarIndicadoresEducacionAISI(codigoPrincipal)
    };
    
    if (seccionesAISD[this.seccionId as keyof typeof seccionesAISD]) {
      seccionesAISD[this.seccionId as keyof typeof seccionesAISD]();
    } else if (seccionesAISI[this.seccionId as keyof typeof seccionesAISI]) {
      seccionesAISI[this.seccionId as keyof typeof seccionesAISI]();
    }
  }
  
  cargarIngresoPerCapitaAISD(cpp: string | null, distrito: string | null) {
    if (!cpp && !distrito) return;
    
    if (cpp) {
      this.censoCompletoService.getDatosCompletos(cpp).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const data = response.data;
            if (data.ingreso_per_capita) {
              this.datos['ingresoFamiliarPerCapita'] = data.ingreso_per_capita.toString();
              this.datos['rankingIngresoPerCapita'] = data.ranking_ingreso || '0';
              this.formularioService.actualizarDatos(this.datos);
              this.cdRef.detectChanges();
            }
          }
        },
        error: () => {}
      });
    }
  }
  
  cargarIngresoPerCapitaAISI(cpp: string | null, distrito: string | null) {
    if (!cpp && !distrito) return;
    
    if (cpp) {
      this.censoCompletoService.getDatosCompletos(cpp).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const data = response.data;
            if (data.ingreso_per_capita) {
              this.datos['ingresoPerCapitaAISI'] = data.ingreso_per_capita.toString();
              this.datos['rankingIngresoAISI'] = data.ranking_ingreso || '0';
              this.formularioService.actualizarDatos(this.datos);
              this.cdRef.detectChanges();
            }
          }
        },
        error: () => {}
      });
    }
  }
  
  cargarActividadesEconomicasAISD(cpp: string | null) {
    if (!cpp) return;
    
    this.censoCompletoService.getDatosCompletos(cpp).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          if (data.actividades_economicas && Array.isArray(data.actividades_economicas)) {
            const actividades = data.actividades_economicas.map((act: any) => ({
              actividad: act.actividad || act.nombre || '____',
              casos: act.casos || act.cantidad || 0,
              porcentaje: act.porcentaje || '0%'
            }));
            this.datos['actividadesEconomicasAISD'] = actividades;
            this.formularioService.actualizarDatos(this.datos);
            this.cdRef.detectChanges();
          }
        }
      },
      error: () => {}
    });
  }
  
  cargarViviendasAISD(cpp: string | null) {
    const codigosCPP = this.obtenerCodigosCPPDeTablaAISD2();
    const prefijo = this.obtenerPrefijoGrupo();
    
    if (codigosCPP.length === 0 && cpp) {
      codigosCPP.push(cpp);
    }
    
    if (codigosCPP.length === 0) {
      return;
    }
    
    const requests = codigosCPP.map(codigo => 
      this.censoCompletoService.getViviendas(codigo).pipe(
        catchError(() => of(null))
      )
    );
    
    forkJoin(requests).subscribe({
      next: (responses) => {
        let totalEmpadronadas = 0;
        let totalOcupadas = 0;
        const materialesParedes: { [key: string]: number } = {};
        const materialesTechos: { [key: string]: number } = {};
        const materialesPisos: { [key: string]: number } = {};
        
        responses.forEach((response: any) => {
          if (response && response.success && response.data && response.data.viviendas) {
            const viviendas = response.data.viviendas;
            
            totalEmpadronadas += viviendas.total_viviendas_particulares || 0;
            totalOcupadas += viviendas.total_viviendas_ocupantes_presentes || 0;
            
            if (viviendas.materiales_paredes) {
              Object.keys(viviendas.materiales_paredes).forEach(key => {
                if (!materialesParedes[key]) materialesParedes[key] = 0;
                materialesParedes[key] += viviendas.materiales_paredes[key].casos || 0;
              });
            }
            
            if (viviendas.materiales_techos) {
              Object.keys(viviendas.materiales_techos).forEach(key => {
                if (!materialesTechos[key]) materialesTechos[key] = 0;
                materialesTechos[key] += viviendas.materiales_techos[key].casos || 0;
              });
            }
            
            if (viviendas.materiales_pisos) {
              Object.keys(viviendas.materiales_pisos).forEach(key => {
                if (!materialesPisos[key]) materialesPisos[key] = 0;
                materialesPisos[key] += viviendas.materiales_pisos[key].casos || 0;
              });
            }
          }
        });
        
        if (totalEmpadronadas > 0 || totalOcupadas > 0) {
          this.datos[`tablaAISD2TotalViviendasEmpadronadas${prefijo}`] = totalEmpadronadas.toString();
          this.datos[`tablaAISD2TotalViviendasOcupadas${prefijo}`] = totalOcupadas.toString();
          
          const otrasCondiciones = totalEmpadronadas - totalOcupadas;
          const porcentajeOcupadas = totalEmpadronadas > 0 
            ? ((totalOcupadas / totalEmpadronadas) * 100).toFixed(2).replace('.', ',') + ' %' 
            : '0 %';
          const porcentajeOtras = totalEmpadronadas > 0 
            ? ((otrasCondiciones / totalEmpadronadas) * 100).toFixed(2).replace('.', ',') + ' %' 
            : '0 %';
          
          this.datos[`condicionOcupacionTabla${prefijo}`] = [
            { categoria: 'Viviendas ocupadas', casos: totalOcupadas, porcentaje: porcentajeOcupadas },
            { categoria: 'Viviendas con otra condición', casos: otrasCondiciones, porcentaje: porcentajeOtras },
            { categoria: 'Total', casos: totalEmpadronadas, porcentaje: '100,00 %' }
          ];
        }
        
        const tiposMaterialesTabla: any[] = [];
        
        const mapeoParedes: { [key: string]: string } = {
          'adobe': 'Adobe',
          'triplay_calamina_estera': 'Triplay / calamina / estera'
        };
        
        const mapeoTechos: { [key: string]: string } = {
          'planchas_calamina_fibra_cemento': 'Planchas de calamina, fibra de cemento o similares',
          'triplay_estera_carrizo': 'Triplay / estera / carrizo',
          'tejas': 'Tejas'
        };
        
        const mapeoPisos: { [key: string]: string } = {
          'tierra': 'Tierra',
          'cemento': 'Cemento'
        };
        
        let totalParedes = 0;
        Object.keys(materialesParedes).forEach(key => {
          if (mapeoParedes[key] && materialesParedes[key] > 0) {
            totalParedes += materialesParedes[key];
            tiposMaterialesTabla.push({
              categoria: 'Materiales de las paredes de las viviendas',
              tipoMaterial: mapeoParedes[key],
              casos: materialesParedes[key],
              porcentaje: ''
            });
          }
        });
        
        if (totalParedes > 0) {
          tiposMaterialesTabla.forEach(item => {
            if (item.categoria === 'Materiales de las paredes de las viviendas' && item.tipoMaterial !== 'Total') {
              item.porcentaje = ((item.casos / totalParedes) * 100).toFixed(2).replace('.', ',') + ' %';
            }
          });
          tiposMaterialesTabla.push({
            categoria: 'Materiales de las paredes de las viviendas',
            tipoMaterial: 'Total',
            casos: totalParedes,
            porcentaje: '100,00 %'
          });
        }
        
        let totalTechos = 0;
        Object.keys(materialesTechos).forEach(key => {
          if (mapeoTechos[key] && materialesTechos[key] > 0) {
            totalTechos += materialesTechos[key];
            tiposMaterialesTabla.push({
              categoria: 'Materiales de los techos de las viviendas',
              tipoMaterial: mapeoTechos[key],
              casos: materialesTechos[key],
              porcentaje: ''
            });
          }
        });
        
        if (totalTechos > 0) {
          tiposMaterialesTabla.forEach(item => {
            if (item.categoria === 'Materiales de los techos de las viviendas' && item.tipoMaterial !== 'Total') {
              item.porcentaje = ((item.casos / totalTechos) * 100).toFixed(2).replace('.', ',') + ' %';
            }
          });
          tiposMaterialesTabla.push({
            categoria: 'Materiales de los techos de las viviendas',
            tipoMaterial: 'Total',
            casos: totalTechos,
            porcentaje: '100,00 %'
          });
        }
        
        let totalPisos = 0;
        Object.keys(materialesPisos).forEach(key => {
          if (mapeoPisos[key] && materialesPisos[key] > 0) {
            totalPisos += materialesPisos[key];
            tiposMaterialesTabla.push({
              categoria: 'Materiales de los pisos de las viviendas',
              tipoMaterial: mapeoPisos[key],
              casos: materialesPisos[key],
              porcentaje: ''
            });
          }
        });
        
        if (totalPisos > 0) {
          tiposMaterialesTabla.forEach(item => {
            if (item.categoria === 'Materiales de los pisos de las viviendas' && item.tipoMaterial !== 'Total') {
              item.porcentaje = ((item.casos / totalPisos) * 100).toFixed(2).replace('.', ',') + ' %';
            }
          });
          tiposMaterialesTabla.push({
            categoria: 'Materiales de los pisos de las viviendas',
            tipoMaterial: 'Total',
            casos: totalPisos,
            porcentaje: '100,00 %'
          });
        }
        
        if (tiposMaterialesTabla.length > 0) {
          this.datos[`tiposMaterialesTabla${prefijo}`] = tiposMaterialesTabla;
        }
        
        this.formularioService.actualizarDatos(this.datos);
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      },
      error: () => {}
    });
  }
  
  cargarServiciosBasicosAISD(cpp: string | null) {
    const codigosCPP = this.obtenerCodigosCPPDeTablaAISD2();
    const prefijo = this.obtenerPrefijoGrupo();
    
    if (codigosCPP.length === 0 && cpp) {
      codigosCPP.push(cpp);
    }
    
    if (codigosCPP.length === 0) {
      return;
    }
    
    const requests = codigosCPP.map(codigo => 
      this.censoCompletoService.getServiciosBasicos(codigo).pipe(
        catchError(() => of(null))
      )
    );
    
    forkJoin(requests).subscribe({
      next: (responses) => {
        let totalViviendasOcupadas = parseInt(this.datos['tablaAISD2TotalViviendasOcupadas'] || '0') || 0;
        
        const aguaConRed: { [key: string]: number } = {};
        const aguaSinRed: { [key: string]: number } = {};
        const alcantarilladoCon: { [key: string]: number } = {};
        const alcantarilladoSin: { [key: string]: number } = {};
        const electricidadCon: { [key: string]: number } = {};
        const electricidadSin: { [key: string]: number } = {};
        
        responses.forEach((response: any) => {
          if (response && response.success && response.data && response.data.servicios_basicos) {
            const servicios = response.data.servicios_basicos;
            
            if (servicios.agua) {
              if (servicios.agua.con_acceso_red_publica) {
                aguaConRed['con_acceso'] = (aguaConRed['con_acceso'] || 0) + (servicios.agua.con_acceso_red_publica.casos || 0);
              }
              if (servicios.agua.sin_acceso_red_publica) {
                aguaSinRed['sin_acceso'] = (aguaSinRed['sin_acceso'] || 0) + (servicios.agua.sin_acceso_red_publica.casos || 0);
              }
            }
            
            if (servicios.alcantarillado) {
              if (servicios.alcantarillado.con_alcantarillado) {
                alcantarilladoCon['con_alcantarillado'] = (alcantarilladoCon['con_alcantarillado'] || 0) + (servicios.alcantarillado.con_alcantarillado.casos || 0);
              }
              if (servicios.alcantarillado.sin_alcantarillado) {
                alcantarilladoSin['sin_alcantarillado'] = (alcantarilladoSin['sin_alcantarillado'] || 0) + (servicios.alcantarillado.sin_alcantarillado.casos || 0);
              }
            }
            
            if (servicios.alumbrado_electrico) {
              if (servicios.alumbrado_electrico.con_alumbrado) {
                electricidadCon['con_alumbrado'] = (electricidadCon['con_alumbrado'] || 0) + (servicios.alumbrado_electrico.con_alumbrado.casos || 0);
              }
              if (servicios.alumbrado_electrico.sin_alumbrado) {
                electricidadSin['sin_alumbrado'] = (electricidadSin['sin_alumbrado'] || 0) + (servicios.alumbrado_electrico.sin_alumbrado.casos || 0);
              }
            }
          }
        });
        
        if (totalViviendasOcupadas === 0) {
          totalViviendasOcupadas = aguaConRed['con_acceso'] + aguaSinRed['sin_acceso'] || 
                                   alcantarilladoCon['con_alcantarillado'] + alcantarilladoSin['sin_alcantarillado'] ||
                                   electricidadCon['con_alumbrado'] + electricidadSin['sin_alumbrado'] || 0;
        }
        
        const abastecimientoAguaTabla: any[] = [];
        const totalAgua = aguaConRed['con_acceso'] + aguaSinRed['sin_acceso'];
        
        if (totalAgua > 0) {
          const casosConRed = aguaConRed['con_acceso'] || 0;
          const casosSinRed = aguaSinRed['sin_acceso'] || 0;
          const porcentajeConRed = totalAgua > 0 ? ((casosConRed / totalAgua) * 100).toFixed(2).replace('.', ',') + ' %' : '0 %';
          const porcentajeSinRed = totalAgua > 0 ? ((casosSinRed / totalAgua) * 100).toFixed(2).replace('.', ',') + ' %' : '0 %';
          
          abastecimientoAguaTabla.push({
            categoria: 'Viviendas con abastecimiento de agua por red pública',
            casos: casosConRed,
            porcentaje: porcentajeConRed
          });
          abastecimientoAguaTabla.push({
            categoria: 'Viviendas con abastecimiento de agua por pilón',
            casos: 0,
            porcentaje: '0 %'
          });
          abastecimientoAguaTabla.push({
            categoria: 'Viviendas sin abastecimiento de agua por los medios mencionados',
            casos: casosSinRed,
            porcentaje: porcentajeSinRed
          });
          abastecimientoAguaTabla.push({
            categoria: 'Total',
            casos: totalAgua,
            porcentaje: '100,00 %'
          });
        }
        
        const tiposSaneamientoTabla: any[] = [];
        const totalSaneamiento = alcantarilladoCon['con_alcantarillado'] + alcantarilladoSin['sin_alcantarillado'];
        
        if (totalSaneamiento > 0) {
          const casosConAlcantarillado = alcantarilladoCon['con_alcantarillado'] || 0;
          const casosSinAlcantarillado = alcantarilladoSin['sin_alcantarillado'] || 0;
          const porcentajeConAlcantarillado = totalSaneamiento > 0 ? ((casosConAlcantarillado / totalSaneamiento) * 100).toFixed(2).replace('.', ',') + ' %' : '0 %';
          const porcentajeSinAlcantarillado = totalSaneamiento > 0 ? ((casosSinAlcantarillado / totalSaneamiento) * 100).toFixed(2).replace('.', ',') + ' %' : '0 %';
          
          tiposSaneamientoTabla.push({
            categoria: 'Viviendas con saneamiento vía red pública',
            casos: casosConAlcantarillado,
            porcentaje: porcentajeConAlcantarillado
          });
          tiposSaneamientoTabla.push({
            categoria: 'Viviendas con saneamiento vía pozo séptico',
            casos: 0,
            porcentaje: '0 %'
          });
          tiposSaneamientoTabla.push({
            categoria: 'Viviendas sin saneamiento vía los medios mencionados',
            casos: casosSinAlcantarillado,
            porcentaje: porcentajeSinAlcantarillado
          });
          tiposSaneamientoTabla.push({
            categoria: 'Total',
            casos: totalSaneamiento,
            porcentaje: '100,00 %'
          });
        }
        
        const coberturaElectricaTabla: any[] = [];
        const totalElectricidad = electricidadCon['con_alumbrado'] + electricidadSin['sin_alumbrado'];
        
        if (totalElectricidad > 0) {
          const casosConElectricidad = electricidadCon['con_alumbrado'] || 0;
          const casosSinElectricidad = electricidadSin['sin_alumbrado'] || 0;
          const porcentajeConElectricidad = totalElectricidad > 0 ? ((casosConElectricidad / totalElectricidad) * 100).toFixed(2).replace('.', ',') + ' %' : '0 %';
          const porcentajeSinElectricidad = totalElectricidad > 0 ? ((casosSinElectricidad / totalElectricidad) * 100).toFixed(2).replace('.', ',') + ' %' : '0 %';
          
          coberturaElectricaTabla.push({
            categoria: 'Viviendas con acceso a electricidad',
            casos: casosConElectricidad,
            porcentaje: porcentajeConElectricidad
          });
          coberturaElectricaTabla.push({
            categoria: 'Viviendas sin acceso a electricidad',
            casos: casosSinElectricidad,
            porcentaje: porcentajeSinElectricidad
          });
          coberturaElectricaTabla.push({
            categoria: 'Total',
            casos: totalElectricidad,
            porcentaje: '100,00 %'
          });
        }
        
        if (abastecimientoAguaTabla.length > 0) {
          this.datos['abastecimientoAguaTabla'] = abastecimientoAguaTabla;
        }
        if (tiposSaneamientoTabla.length > 0) {
          this.datos['tiposSaneamientoTabla'] = tiposSaneamientoTabla;
        }
        if (coberturaElectricaTabla.length > 0) {
          this.datos['coberturaElectricaTabla'] = coberturaElectricaTabla;
        }
        
        this.formularioService.actualizarDatos(this.datos);
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      },
      error: () => {}
    });
  }
  
  cargarInfraestructuraAISD(cpp: string | null) {
    const codigosCPP = this.obtenerCodigosCPPDeTablaAISD2();
    
    if (codigosCPP.length === 0 && cpp) {
      codigosCPP.push(cpp);
    }
    
    if (codigosCPP.length === 0) {
      return;
    }
    
    const requestsEducacion = codigosCPP.map(codigo => 
      this.censoCompletoService.getEducacion(codigo).pipe(
        catchError(() => of(null))
      )
    );
    
    forkJoin(requestsEducacion).subscribe({
      next: (responses) => {
        const institucionesMap: { [key: string]: any } = {};
        
        responses.forEach((response: any) => {
          if (response && response.success && response.data && response.data.educacion) {
            const educacion = response.data.educacion;
            
            if (educacion.instituciones && Array.isArray(educacion.instituciones)) {
              educacion.instituciones.forEach((inst: any) => {
                const key = (inst.nombre || inst.institucion || '').toLowerCase();
                if (key && !institucionesMap[key]) {
                  institucionesMap[key] = {
                    institucion: inst.nombre || inst.institucion || '____',
                    nivel: inst.nivel || '____',
                    gestion: inst.gestion || inst.tipo_gestion || '____',
                    total: inst.cantidad_estudiantes || inst.total || 0,
                    porcentaje: inst.porcentaje || '0%'
                  };
                }
              });
            }
          }
        });
        
        const instituciones = Object.values(institucionesMap);
        
        if (instituciones.length > 0) {
          const totalEstudiantes = instituciones.reduce((sum: number, inst: any) => sum + (inst.total || 0), 0);
          
          instituciones.forEach((inst: any) => {
            if (totalEstudiantes > 0) {
              inst.porcentaje = ((inst.total / totalEstudiantes) * 100).toFixed(2).replace('.', ',') + ' %';
            }
          });
          
          this.datos['cantidadEstudiantesEducacionTabla'] = instituciones;
        }
        
        this.formularioService.actualizarDatos(this.datos);
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      },
      error: () => {}
    });
  }
  
  cargarIndicadoresSaludAISD(cpp: string | null) {
    const codigosCPP = this.obtenerCodigosCPPDeTablaAISD2();
    
    if (codigosCPP.length === 0 && cpp) {
      codigosCPP.push(cpp);
    }
    
    if (codigosCPP.length === 0) {
      return;
    }
    
    const requests = codigosCPP.map(codigo => 
      this.censoCompletoService.getSalud(codigo).pipe(
        catchError(() => of(null))
      )
    );
    
    forkJoin(requests).subscribe({
      next: (responses) => {
        const segurosAgregados: { [key: string]: number } = {};
        let totalPoblacion = 0;
        
        responses.forEach((response: any) => {
          if (response && response.success && response.data && response.data.salud) {
            const salud = response.data.salud;
            
            if (salud.seguros) {
              for (const key in salud.seguros) {
                if (salud.seguros.hasOwnProperty(key)) {
                  const seguro = salud.seguros[key];
                  segurosAgregados[key] = (segurosAgregados[key] || 0) + (seguro.casos || 0);
                  totalPoblacion += (seguro.casos || 0);
                }
              }
            }
          }
        });
        
        const afiliacionSaludTabla: any[] = [];
        
        if (totalPoblacion > 0) {
          const nombresSeguros: { [key: string]: string } = {
            'sis': 'SIS',
            'essalud': 'ESSALUD',
            'fuerzas_armadas_policiales': 'Fuerzas Armadas/Policiales',
            'privado': 'Privado',
            'otro': 'Otro',
            'ninguno': 'Ninguno'
          };
          
          for (const key in segurosAgregados) {
            if (segurosAgregados.hasOwnProperty(key)) {
              const casos = segurosAgregados[key] || 0;
              const porcentaje = totalPoblacion > 0 
                ? ((casos / totalPoblacion) * 100).toFixed(2).replace('.', ',') + ' %' 
                : '0 %';
              
              afiliacionSaludTabla.push({
                categoria: nombresSeguros[key] || key,
                casos: casos,
                porcentaje: porcentaje
              });
            }
          }
          
          afiliacionSaludTabla.sort((a, b) => b.casos - a.casos);
        }
        
        if (afiliacionSaludTabla.length > 0) {
          this.datos['afiliacionSaludTabla'] = afiliacionSaludTabla;
          this.datos['seguroSaludTabla'] = afiliacionSaludTabla;
          
          const sis = afiliacionSaludTabla.find((item: any) => item.categoria === 'SIS');
          const essalud = afiliacionSaludTabla.find((item: any) => item.categoria === 'ESSALUD');
          const ninguno = afiliacionSaludTabla.find((item: any) => item.categoria === 'Ninguno');
          
          if (sis) {
            this.datos['porcentajeSIS'] = sis.porcentaje.replace(' %', '').replace(',', '.');
          }
          if (essalud) {
            this.datos['porcentajeESSALUD'] = essalud.porcentaje.replace(' %', '').replace(',', '.');
          }
          if (ninguno) {
            this.datos['porcentajeSinSeguro'] = ninguno.porcentaje.replace(' %', '').replace(',', '.');
          }
        }
        
        this.formularioService.actualizarDatos(this.datos);
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      },
      error: () => {}
    });
  }
  
  cargarIndicadoresEducacionAISD(cpp: string | null) {
    const codigosCPP = this.obtenerCodigosCPPDeTablaAISD2();
    
    if (codigosCPP.length === 0 && cpp) {
      codigosCPP.push(cpp);
    }
    
    if (codigosCPP.length === 0) {
      return;
    }
    
    const requests = codigosCPP.map(codigo => 
      this.censoCompletoService.getEducacion(codigo).pipe(
        catchError(() => of(null))
      )
    );
    
    forkJoin(requests).subscribe({
      next: (responses) => {
        const nivelesAgregados: { [key: string]: number } = {};
        let totalPoblacion15Mas = 0;
        let totalAnalfabetos = 0;
        
        responses.forEach((response: any) => {
          if (response && response.success && response.data && response.data.educacion) {
            const educacion = response.data.educacion;
            
            if (educacion.niveles_educativos) {
              for (const key in educacion.niveles_educativos) {
                if (educacion.niveles_educativos.hasOwnProperty(key)) {
                  const nivel = educacion.niveles_educativos[key];
                  nivelesAgregados[key] = (nivelesAgregados[key] || 0) + (nivel.casos || 0);
                  totalPoblacion15Mas += (nivel.casos || 0);
                }
              }
            }
            
            if (educacion.poblacion_sin_saber_leer_escribir) {
              totalAnalfabetos += educacion.poblacion_sin_saber_leer_escribir || 0;
            }
          }
        });
        
        const nivelEducativoTabla: any[] = [];
        
        if (totalPoblacion15Mas > 0) {
          const nombresNiveles: { [key: string]: string } = {
            'sin_nivel_o_inicial': 'Sin nivel o inicial',
            'primaria_incluye_basica': 'Primaria (incluye básica)',
            'secundaria': 'Secundaria',
            'superior_no_universitaria': 'Superior no universitaria',
            'superior_universitaria': 'Superior universitaria'
          };
          
          for (const key in nivelesAgregados) {
            if (nivelesAgregados.hasOwnProperty(key)) {
              const casos = nivelesAgregados[key] || 0;
              const porcentaje = totalPoblacion15Mas > 0 
                ? ((casos / totalPoblacion15Mas) * 100).toFixed(2).replace('.', ',') + ' %' 
                : '0 %';
              
              nivelEducativoTabla.push({
                categoria: nombresNiveles[key] || key,
                casos: casos,
                porcentaje: porcentaje
              });
            }
          }
          
          nivelEducativoTabla.sort((a, b) => b.casos - a.casos);
        }
        
        const tasaAnalfabetismoTabla: any[] = [];
        
        if (totalPoblacion15Mas > 0) {
          const porcentajeAnalfabetismo = totalPoblacion15Mas > 0 
            ? ((totalAnalfabetos / totalPoblacion15Mas) * 100).toFixed(2).replace('.', ',') + ' %' 
            : '0 %';
          
          tasaAnalfabetismoTabla.push({
            indicador: 'Población que no sabe leer ni escribir',
            casos: totalAnalfabetos,
            porcentaje: porcentajeAnalfabetismo
          });
          
          tasaAnalfabetismoTabla.push({
            indicador: 'Población total de 15 años a más',
            casos: totalPoblacion15Mas,
            porcentaje: '100,00 %'
          });
        }
        
        if (nivelEducativoTabla.length > 0) {
          this.datos['nivelEducativoTabla'] = nivelEducativoTabla;
        }
        
        if (tasaAnalfabetismoTabla.length > 0) {
          this.datos['tasaAnalfabetismoTabla'] = tasaAnalfabetismoTabla;
        }
        
        this.formularioService.actualizarDatos(this.datos);
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      },
      error: () => {}
    });
  }
  
  cargarIDHAISD(cpp: string | null) {
    if (!cpp) return;
    
    this.censoCompletoService.getDatosCompletos(cpp).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          if (data.idh) {
            this.datos['indiceDesarrolloHumanoTabla'] = [{
              poblacion: data.idh.poblacion || 0,
              idh: data.idh.valor || '0',
              esperanzaVida: data.idh.esperanza_vida || '0',
              educacion: data.idh.educacion || '0',
              rankEducacion2: data.idh.rank_educacion || '0',
              anosEducacion: data.idh.anos_educacion || '0',
              rankAnios: data.idh.rank_anos_educacion || '0',
              ingreso: data.idh.ingreso || '0',
              rankIngresoFinal: data.idh.rank_ingreso || '0'
            }];
            this.formularioService.actualizarDatos(this.datos);
            this.cdRef.detectChanges();
          }
        }
      },
      error: () => {}
    });
  }
  
  cargarNBIAISD(cpp: string | null) {
    const codigosCPP = this.obtenerCodigosCPPDeTablaAISD2();
    
    if (codigosCPP.length === 0 && cpp) {
      codigosCPP.push(cpp);
    }
    
    if (codigosCPP.length === 0) {
      return;
    }
    
    const requests = codigosCPP.map(codigo => 
      this.censoCompletoService.getViviendas(codigo).pipe(
        catchError(() => of(null))
      )
    );
    
    forkJoin(requests).subscribe({
      next: (responses) => {
        let totalViviendas = 0;
        let totalHacinamiento = 0;
        let totalSinServiciosHigienicos = 0;
        let totalInadecuadas = 0;
        
        responses.forEach((response: any) => {
          if (response && response.success && response.data && response.data.viviendas) {
            const viviendas = response.data.viviendas;
            totalViviendas += viviendas.total_viviendas_particulares || 0;
            
            if (viviendas.caracteristicas_fisicas) {
              totalHacinamiento += viviendas.caracteristicas_fisicas.hacinamiento?.casos || 0;
              totalSinServiciosHigienicos += viviendas.caracteristicas_fisicas.sin_servicios_higienicos?.casos || 0;
              totalInadecuadas += viviendas.caracteristicas_fisicas.inadecuadas?.casos || 0;
            }
          }
        });
        
        const nbiCCAyrocaTabla: any[] = [];
        
        if (totalViviendas > 0) {
          const porcentajeHacinamiento = totalViviendas > 0 
            ? ((totalHacinamiento / totalViviendas) * 100).toFixed(2).replace('.', ',') + ' %' 
            : '0 %';
          const porcentajeSinServicios = totalViviendas > 0 
            ? ((totalSinServiciosHigienicos / totalViviendas) * 100).toFixed(2).replace('.', ',') + ' %' 
            : '0 %';
          const porcentajeInadecuadas = totalViviendas > 0 
            ? ((totalInadecuadas / totalViviendas) * 100).toFixed(2).replace('.', ',') + ' %' 
            : '0 %';
          
          if (totalHacinamiento > 0) {
            nbiCCAyrocaTabla.push({
              categoria: 'Viviendas con hacinamiento',
              casos: totalHacinamiento,
              porcentaje: porcentajeHacinamiento
            });
          }
          
          if (totalSinServiciosHigienicos > 0) {
            nbiCCAyrocaTabla.push({
              categoria: 'Viviendas sin servicios higiénicos',
              casos: totalSinServiciosHigienicos,
              porcentaje: porcentajeSinServicios
            });
          }
          
          if (totalInadecuadas > 0) {
            nbiCCAyrocaTabla.push({
              categoria: 'Viviendas inadecuadas',
              casos: totalInadecuadas,
              porcentaje: porcentajeInadecuadas
            });
          }
          
          nbiCCAyrocaTabla.push({
            categoria: 'Total referencial',
            casos: totalViviendas,
            porcentaje: '100,00 %'
          });
        }
        
        if (nbiCCAyrocaTabla.length > 0) {
          this.datos['nbiCCAyrocaTabla'] = nbiCCAyrocaTabla;
        }
        
        this.formularioService.actualizarDatos(this.datos);
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      },
      error: () => {}
    });
  }
  
  cargarUbicacionAISI(jsonData: any[]) {
    if (!jsonData || jsonData.length === 0) return;
    
    const capitalDistrital = jsonData.find((cp: any) => 
      cp.CATEGORIA === 'Capital distrital' || cp.CATEGORIA === 'VILLA'
    ) || jsonData[0];
    
    if (capitalDistrital) {
      const ubicacion = [{
        localidad: capitalDistrital.CCPP || '____',
        coordenadas: capitalDistrital.ESTE && capitalDistrital.NORTE 
          ? `18L E: ${capitalDistrital.ESTE.toLocaleString()} m N: ${capitalDistrital.NORTE.toLocaleString()} m`
          : '____',
        altitud: capitalDistrital.ALTITUD ? capitalDistrital.ALTITUD.toString() : '____',
        distrito: capitalDistrital.DIST || this.datos['distritoSeleccionado'] || '____',
        provincia: capitalDistrital.PROV || this.datos['provinciaSeleccionada'] || '____',
        departamento: capitalDistrital.DPTO || this.datos['departamentoSeleccionado'] || '____'
      }];
      
      this.datos['ubicacionCpTabla'] = ubicacion;
      this.datos['centroPobladoAISI'] = capitalDistrital.CCPP || this.datos['distritoSeleccionado'];
      this.formularioService.actualizarDatos(this.datos);
      this.cdRef.detectChanges();
    }
  }
  
  cargarActividadesEconomicasAISI(cpp: string | null) {
    if (!cpp) return;
    
    this.censoCompletoService.getDatosCompletos(cpp).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          if (data.actividades_economicas && Array.isArray(data.actividades_economicas)) {
            const actividades = data.actividades_economicas.map((act: any) => ({
              actividad: act.actividad || act.nombre || '____',
              casos: act.casos || act.cantidad || 0,
              porcentaje: act.porcentaje || '0%'
            }));
            this.datos['actividadesEconomicasAISI'] = actividades;
            this.formularioService.actualizarDatos(this.datos);
            this.cdRef.detectChanges();
          }
        }
      },
      error: () => {}
    });
  }
  
  cargarViviendasAISI(cpp: string | null) {
    if (!cpp) return;
    
    this.censoCompletoService.getViviendas(cpp).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          if (data.viviendas && data.viviendas.tipos) {
            const tipos = data.viviendas.tipos.map((tipo: any) => ({
              categoria: tipo.tipo || tipo.categoria || '____',
              casos: tipo.cantidad || tipo.casos || 0,
              porcentaje: tipo.porcentaje || '0%'
            }));
            this.datos['tiposViviendaAISI'] = tipos;
            this.formularioService.actualizarDatos(this.datos);
            this.cdRef.detectChanges();
          }
        }
      },
      error: () => {}
    });
  }
  
  cargarServiciosBasicosAISI(cpp: string | null) {
    if (!cpp) return;
    
    this.censoCompletoService.getServiciosBasicos(cpp).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          if (data.servicios_basicos) {
            if (data.servicios_basicos.agua) {
              this.datos['abastecimientoAguaCpTablaAISI'] = data.servicios_basicos.agua.map((item: any) => ({
                categoria: item.tipo || item.categoria || '____',
                casos: item.cantidad || item.casos || 0,
                porcentaje: item.porcentaje || '0%'
              }));
            }
            if (data.servicios_basicos.saneamiento) {
              this.datos['tipoServicioHigienicoTablaAISI'] = data.servicios_basicos.saneamiento.map((item: any) => ({
                categoria: item.tipo || item.categoria || '____',
                casos: item.cantidad || item.casos || 0,
                porcentaje: item.porcentaje || '0%'
              }));
            }
            if (data.servicios_basicos.energia) {
              this.datos['energiaElectricaTablaAISI'] = data.servicios_basicos.energia.map((item: any) => ({
                categoria: item.tipo || item.categoria || '____',
                casos: item.cantidad || item.casos || 0,
                porcentaje: item.porcentaje || '0%'
              }));
            }
            this.formularioService.actualizarDatos(this.datos);
            this.cdRef.detectChanges();
          }
        }
      },
      error: () => {}
    });
  }
  
  cargarInfraestructuraAISI(cpp: string | null) {
    if (!cpp) return;
    
    this.censoCompletoService.getEducacion(cpp).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          if (data.educacion && data.educacion.instituciones) {
            const instituciones = data.educacion.instituciones.map((inst: any) => ({
              institucion: inst.nombre || inst.institucion || '____',
              nivel: inst.nivel || '____',
              gestion: inst.gestion || inst.tipo_gestion || '____',
              total: inst.cantidad_estudiantes || inst.total || 0,
              porcentaje: inst.porcentaje || '0%'
            }));
            this.datos['educacionCpTablaAISI'] = instituciones;
            this.formularioService.actualizarDatos(this.datos);
            this.cdRef.detectChanges();
          }
        }
      },
      error: () => {}
    });
    
    this.censoCompletoService.getSalud(cpp).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          if (data.salud) {
            this.datos['datosSaludAISI'] = data.salud;
            this.formularioService.actualizarDatos(this.datos);
            this.cdRef.detectChanges();
          }
        }
      },
      error: () => {}
    });
  }
  
  cargarIndicadoresSaludAISI(cpp: string | null) {
    if (!cpp) return;
    
    this.censoCompletoService.getSalud(cpp).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          if (data.salud && data.salud.natalidad_mortalidad) {
            this.datos['natalidadMortalidadCpTablaAISI'] = data.salud.natalidad_mortalidad.map((item: any) => ({
              anio: item.anio || item.ano || '____',
              natalidad: item.natalidad || item.nacimientos || 0,
              mortalidad: item.mortalidad || item.defunciones || 0
            }));
            this.formularioService.actualizarDatos(this.datos);
            this.cdRef.detectChanges();
          }
        }
      },
      error: () => {}
    });
  }
  
  cargarIndicadoresEducacionAISI(cpp: string | null) {
    if (!cpp) return;
    
    this.censoCompletoService.getEducacion(cpp).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          if (data.educacion && data.educacion.niveles) {
            this.datos['nivelEducativoTablaAISI'] = data.educacion.niveles.map((item: any) => ({
              categoria: item.nivel || item.categoria || '____',
              casos: item.cantidad || item.casos || 0,
              porcentaje: item.porcentaje || '0%'
            }));
            this.formularioService.actualizarDatos(this.datos);
            this.cdRef.detectChanges();
          }
        }
      },
      error: () => {}
    });
  }

  cargarOpcionesBackend() {
    if (this.formData['distritoSeleccionado']) {
      this.buscarDistrito(this.formData['distritoSeleccionado'], true);
    }
  }

  onDistritoInput(value: string) {
    this.distritoBuscado = value;
    this.formData['distritoSeleccionado'] = value;
    
    if (value && value.trim().length >= 2) {
      this.buscarDistritosSugeridos(value);
    } else {
      this.distritosSugeridos = [];
      this.mostrarSugerencias = false;
      if (!value || value.trim().length === 0) {
        this.limpiarProvinciaYDepartamento();
      }
    }
  }

  onAutocompleteInput(fieldId: string, value: string) {
    if (!this.autocompleteData[fieldId]) {
      this.autocompleteData[fieldId] = { sugerencias: [], mostrar: false, buscado: '' };
    }
    
    this.autocompleteData[fieldId].buscado = value;
    
    if (fieldId === 'grupoAISD') {
      const campoConPrefijo = this.obtenerCampoConPrefijo('grupoAISD');
      this.formData[campoConPrefijo] = value;
    } else if (fieldId === 'centroPobladoAISI') {
      const campoConPrefijo = this.obtenerCampoConPrefijo('centroPobladoAISI');
      this.formData[campoConPrefijo] = value;
    } else {
      this.formData[fieldId] = value;
    }
    
    if (value && value.trim().length >= 1) {
      const subscription = DebounceUtil.debounce(`autocomplete_${fieldId}`, value, 300).subscribe(
        debouncedValue => {
          if (fieldId === 'grupoAISD') {
            const distrito = this.formData['distritoSeleccionado'];
            if (distrito) {
              this.cargarCentrosPobladosParaAISD(distrito);
            }
          } else if (fieldId === 'centroPobladoAISI') {
            const distrito = this.formData['distritoSeleccionado'];
            if (distrito) {
              this.cargarCentrosPobladosParaAISI(distrito);
            }
          } else if (fieldId === 'grupoAISI') {
            this.buscarSugerenciasCentroPoblado(fieldId, debouncedValue);
          } else {
            this.buscarSugerenciasDistrito(fieldId, debouncedValue);
          }
        }
      );
      this.subscriptions.push(subscription);
    } else {
      this.autocompleteData[fieldId].sugerencias = [];
      this.autocompleteData[fieldId].mostrar = false;
    }
  }

  buscarSugerenciasDistrito(fieldId: string, termino: string) {
    if (!termino || termino.trim().length < 1) {
      if (this.autocompleteData[fieldId]) {
        this.autocompleteData[fieldId].sugerencias = [];
        this.autocompleteData[fieldId].mostrar = false;
      }
      return;
    }

    if ((fieldId === 'aisdComponente1' || fieldId === 'aisdComponente2') && this.distritosProvincia.length > 0) {
      const sugerencias = this.filtrarDistritosLocalmente(termino);
      
      if (!this.autocompleteData[fieldId]) {
        this.autocompleteData[fieldId] = { sugerencias: [], mostrar: false, buscado: '' };
      }
      
      this.autocompleteData[fieldId].sugerencias = sugerencias;
      this.autocompleteData[fieldId].mostrar = sugerencias.length > 0;
      this.cdRef.detectChanges();
      return;
    }

    this.loadingOptions[fieldId] = true;
    
    this.autocompleteService.buscarSugerenciasDistrito(termino).subscribe({
      next: (sugerencias) => {
        if (!this.autocompleteData[fieldId]) {
          this.autocompleteData[fieldId] = { sugerencias: [], mostrar: false, buscado: '' };
        }
        this.autocompleteData[fieldId].sugerencias = sugerencias;
        this.autocompleteData[fieldId].mostrar = sugerencias.length > 0;
        this.loadingOptions[fieldId] = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        if (this.autocompleteData[fieldId]) {
          this.autocompleteData[fieldId].sugerencias = [];
          this.autocompleteData[fieldId].mostrar = false;
        }
        this.loadingOptions[fieldId] = false;
        this.cdRef.detectChanges();
      }
    });
  }

  buscarSugerenciasCentroPoblado(fieldId: string, termino: string) {
    if (!termino || termino.trim().length < 2) {
      if (this.autocompleteData[fieldId]) {
        this.autocompleteData[fieldId].sugerencias = [];
        this.autocompleteData[fieldId].mostrar = false;
      }
      return;
    }

    const distritoSeleccionado = this.formData['distritoSeleccionado'];
    if (!distritoSeleccionado || distritoSeleccionado.trim() === '') {
      if (this.autocompleteData[fieldId]) {
        this.autocompleteData[fieldId].sugerencias = [];
        this.autocompleteData[fieldId].mostrar = false;
      }
      return;
    }

    this.loadingOptions[fieldId] = true;
    
    this.autocompleteService.buscarSugerenciasCentroPoblado(termino, distritoSeleccionado).subscribe({
      next: (sugerencias) => {
        if (!this.autocompleteData[fieldId]) {
          this.autocompleteData[fieldId] = { sugerencias: [], mostrar: false, buscado: '' };
        }
        this.autocompleteData[fieldId].sugerencias = sugerencias;
        this.autocompleteData[fieldId].mostrar = sugerencias.length > 0;
        this.loadingOptions[fieldId] = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        if (this.autocompleteData[fieldId]) {
          this.autocompleteData[fieldId].sugerencias = [];
          this.autocompleteData[fieldId].mostrar = false;
        }
        this.loadingOptions[fieldId] = false;
        this.cdRef.detectChanges();
      }
    });
  }

  seleccionarSugerencia(fieldId: string, valor: string) {
    if (fieldId === 'grupoAISD') {
      const campoConPrefijo = this.obtenerCampoConPrefijo('grupoAISD');
      this.formData[campoConPrefijo] = valor;
      this.datos[campoConPrefijo] = valor;
      if (this.autocompleteData[fieldId]) {
        this.autocompleteData[fieldId].buscado = valor;
        this.autocompleteData[fieldId].mostrar = false;
        this.autocompleteData[fieldId].sugerencias = [];
      }
      this.onFieldChange(campoConPrefijo, valor);
      this.actualizarComponenteSeccion();
      setTimeout(() => {
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }, 50);
    } else if (fieldId === 'centroPobladoAISI') {
      const campoConPrefijo = this.obtenerCampoConPrefijo('centroPobladoAISI');
      this.formData[campoConPrefijo] = valor;
      this.datos[campoConPrefijo] = valor;
      if (this.autocompleteData[fieldId]) {
        this.autocompleteData[fieldId].buscado = valor;
        this.autocompleteData[fieldId].mostrar = false;
        this.autocompleteData[fieldId].sugerencias = [];
      }
      this.onFieldChange(campoConPrefijo, valor);
      this.actualizarComponenteSeccion();
      setTimeout(() => {
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }, 50);
    } else {
      this.formData[fieldId] = valor;
      if (this.autocompleteData[fieldId]) {
        this.autocompleteData[fieldId].buscado = valor;
        this.autocompleteData[fieldId].mostrar = false;
        this.autocompleteData[fieldId].sugerencias = [];
      }
      this.onFieldChange(fieldId, valor);
    }
  }

  onFocusDistritoAdicional(fieldId: string) {
    if (!this.autocompleteData[fieldId]) {
      this.autocompleteData[fieldId] = { sugerencias: [], mostrar: false, buscado: '' };
    }

    const valorActual = this.formData[fieldId] || '';
    if (valorActual && this.autocompleteData[fieldId].sugerencias.length > 0) {
      this.autocompleteData[fieldId].mostrar = true;
      return;
    }

    if (valorActual && valorActual.trim().length >= 1) {
      this.buscarSugerenciasDistrito(fieldId, valorActual);
    }
  }

  cerrarSugerenciasAutocomplete(fieldId: string) {
    setTimeout(() => {
      if (this.autocompleteData[fieldId]) {
        this.autocompleteData[fieldId].mostrar = false;
      }
      this.cdRef.detectChanges();
    }, 300);
  }

  onPuntoPoblacionInput(filaIndex: number, value: string) {
    const fieldId = `puntoPoblacion${filaIndex}`;
    if (!this.autocompleteData[fieldId]) {
      this.autocompleteData[fieldId] = { sugerencias: [], mostrar: false, buscado: '' };
    }
    
    this.autocompleteData[fieldId].buscado = value;
    const campoPunto = this.obtenerCampoConPrefijo(`tablaAISD2Fila${filaIndex}Punto`);
    this.onFieldChange(campoPunto, value);
    
    if (value && value.trim().length >= 1) {
      const subscription = DebounceUtil.debounce(`puntoPoblacion_${filaIndex}`, value, 300).subscribe(
        debouncedValue => {
          this.buscarPuntosPoblacion(filaIndex, debouncedValue);
        }
      );
      this.subscriptions.push(subscription);
    } else {
      this.autocompleteData[fieldId].sugerencias = [];
      this.autocompleteData[fieldId].mostrar = false;
    }
  }

  buscarPuntosPoblacion(filaIndex: number, termino: string) {
    if (!termino || termino.trim().length < 1) {
      return;
    }

    let jsonData = this.formularioService.obtenerJSON();
    if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
      return;
    }

    if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.2$/)) {
      const codigosComunidad = this.obtenerCentrosPobladosDeComunidadCampesina();
      if (codigosComunidad.length > 0) {
        const codigosSet = new Set(codigosComunidad.map(c => c.toString().trim()));
        jsonData = jsonData.filter((cp: any) => {
          if (!cp.CODIGO) return false;
          const codigo = cp.CODIGO.toString().trim();
          return codigo && codigosSet.has(codigo);
        });
      }
    }

    const terminoLower = termino.toLowerCase().trim();
    const sugerencias = jsonData
      .filter((cp: any) => {
        const nombreCP = (cp.CCPP || '').toLowerCase().trim();
        return nombreCP.includes(terminoLower);
      })
      .map((cp: any) => ({
        nombre: cp.CCPP || '',
        codigo: cp.CODIGO?.toString() || '',
        poblacion: cp.POBLACION || 0,
        datos: cp
      }))
      .slice(0, 10);

    const fieldId = `puntoPoblacion${filaIndex}`;
    if (!this.autocompleteData[fieldId]) {
      this.autocompleteData[fieldId] = { sugerencias: [], mostrar: false, buscado: '' };
    }
    
    this.autocompleteData[fieldId].sugerencias = sugerencias;
    this.autocompleteData[fieldId].mostrar = sugerencias.length > 0;
    this.cdRef.detectChanges();
  }

  seleccionarPuntoPoblacion(filaIndex: number, sugerencia: any) {
    const fieldId = `puntoPoblacion${filaIndex}`;
    if (this.autocompleteData[fieldId]) {
      this.autocompleteData[fieldId].buscado = sugerencia.nombre;
      this.autocompleteData[fieldId].mostrar = false;
      this.autocompleteData[fieldId].sugerencias = [];
    }

    const campoPunto = this.obtenerCampoConPrefijo(`tablaAISD2Fila${filaIndex}Punto`);
    const campoCodigo = this.obtenerCampoConPrefijo(`tablaAISD2Fila${filaIndex}Codigo`);
    const campoPoblacion = this.obtenerCampoConPrefijo(`tablaAISD2Fila${filaIndex}Poblacion`);
    
    this.onFieldChange(campoPunto, sugerencia.nombre);
    this.onFieldChange(campoCodigo, sugerencia.codigo);
    this.onFieldChange(campoPoblacion, sugerencia.poblacion.toString());

    if (sugerencia.codigo) {
      this.cargarViviendasPorCPP(filaIndex, sugerencia.codigo);
    }

    this.cdRef.detectChanges();
  }

  onPuntoPoblacionBlur(filaIndex: number) {
    const fieldId = `puntoPoblacion${filaIndex}`;
    const campoPunto = this.obtenerCampoConPrefijo(`tablaAISD2Fila${filaIndex}Punto`);
    const campoCodigo = this.obtenerCampoConPrefijo(`tablaAISD2Fila${filaIndex}Codigo`);
    const campoPoblacion = this.obtenerCampoConPrefijo(`tablaAISD2Fila${filaIndex}Poblacion`);
    const valorActual = this.obtenerValorConPrefijo(`tablaAISD2Fila${filaIndex}Punto`) || '';
    
    if (valorActual && !this.obtenerValorConPrefijo(`tablaAISD2Fila${filaIndex}Codigo`)) {
      const jsonData = this.formularioService.obtenerJSON();
      if (jsonData && Array.isArray(jsonData)) {
        const centroPoblado = jsonData.find((cp: any) => 
          (cp.CCPP || '').toLowerCase().trim() === valorActual.toLowerCase().trim()
        );
        
        if (centroPoblado) {
          this.onFieldChange(campoCodigo, centroPoblado.CODIGO?.toString() || '');
          this.onFieldChange(campoPoblacion, centroPoblado.POBLACION?.toString() || '0');
          
          if (centroPoblado.CODIGO) {
            this.cargarViviendasPorCPP(filaIndex, centroPoblado.CODIGO.toString());
          }
        }
      }
    }
    
    setTimeout(() => {
      if (this.autocompleteData[fieldId]) {
        this.autocompleteData[fieldId].mostrar = false;
      }
      this.cdRef.detectChanges();
    }, 300);
  }

  cargarViviendasPorCPP(filaIndex: number, cpp: string) {
    if (!cpp || cpp.trim() === '') {
      return;
    }

    const cppKey = cpp.trim();
    if (this.viviendasCargando.has(cppKey)) {
      return;
    }

    if (this.erroresViviendasRegistrados.has(cppKey)) {
      return;
    }

    this.viviendasCargando.add(cppKey);

    this.censoCompletoService.getViviendas(cpp).subscribe({
      next: (response) => {
        this.viviendasCargando.delete(cppKey);
        if (response && response.success && response.data && response.data.viviendas) {
          const viviendas = response.data.viviendas;
          const empadronadas = viviendas.total_viviendas_particulares ?? viviendas.empadronadas ?? viviendas.total_empadronadas ?? 0;
          const ocupadas = viviendas.total_viviendas_ocupantes_presentes ?? viviendas.ocupadas ?? viviendas.total_ocupadas ?? 0;
          
          if (empadronadas !== null && empadronadas !== undefined) {
            if (!this.formData[`tablaAISD2Fila${filaIndex}ViviendasEmpadronadas`] || this.formData[`tablaAISD2Fila${filaIndex}ViviendasEmpadronadas`] === '0' || this.formData[`tablaAISD2Fila${filaIndex}ViviendasEmpadronadas`] === '____') {
              this.onFieldChange(`tablaAISD2Fila${filaIndex}ViviendasEmpadronadas`, empadronadas.toString());
            }
          }
          if (ocupadas !== null && ocupadas !== undefined) {
            if (!this.formData[`tablaAISD2Fila${filaIndex}ViviendasOcupadas`] || this.formData[`tablaAISD2Fila${filaIndex}ViviendasOcupadas`] === '0' || this.formData[`tablaAISD2Fila${filaIndex}ViviendasOcupadas`] === '____') {
              this.onFieldChange(`tablaAISD2Fila${filaIndex}ViviendasOcupadas`, ocupadas.toString());
            }
          }
          
          setTimeout(() => {
            this.calcularTotalesTablaAISD2();
            this.cdRef.detectChanges();
          }, 100);
        }
      },
      error: (error) => {
        this.viviendasCargando.delete(cppKey);
        if (error.status === 500) {
          const errorDetail = error.error?.detail || '';
          if (errorDetail.includes('Unknown column') || errorDetail.includes('Incorrect number of arguments')) {
            this.erroresViviendasRegistrados.add(cppKey);
            return;
          }
          if (error.url?.includes('viviendas-ubicacion')) {
            this.erroresViviendasRegistrados.add(cppKey);
            return;
          }
        }
        if (!this.erroresViviendasRegistrados.has(cppKey)) {
          this.erroresViviendasRegistrados.add(cppKey);
        }
      }
    });
  }

  cargarViviendasParaTablaExistente() {
    if (this.seccionId !== '3.1.2.A' && this.seccionId !== '3.1.4' && this.seccionId !== '3.1.4.A' && this.seccionId !== '3.1.4.A.1' && this.seccionId !== '3.1.4.A.2') {
      return;
    }

    for (let i = 1; i <= this.filasTablaAISD2; i++) {
      const codigo = this.formData[`tablaAISD2Fila${i}Codigo`] || '';
      const tieneViviendas = this.formData[`tablaAISD2Fila${i}ViviendasEmpadronadas`] && 
                              this.formData[`tablaAISD2Fila${i}ViviendasEmpadronadas`] !== '____' &&
                              this.formData[`tablaAISD2Fila${i}ViviendasEmpadronadas`] !== '0';
      
      if (codigo && !tieneViviendas) {
        setTimeout(() => {
          this.cargarViviendasPorCPP(i, codigo);
        }, i * 200);
      }
    }
  }

  buscarDistritosSugeridos(termino: string) {
    if (!termino || termino.trim().length < 2) {
      this.distritosSugeridos = [];
      this.mostrarSugerencias = false;
      return;
    }

    this.loadingOptions['distritoSeleccionado'] = true;
    const terminoBusqueda = termino.trim().toUpperCase();
    
    this.dataService.getPoblacionByDistrito(terminoBusqueda).subscribe({
      next: (response) => {
        if (response && response.success && Array.isArray(response.data)) {
          const distritosUnicos = new Set<string>();
          const terminoLower = termino.toLowerCase();
          
          response.data.forEach((cp: CentroPoblado) => {
            if (cp.distrito) {
              const distritoLower = cp.distrito.toLowerCase();
              if (distritoLower.includes(terminoLower)) {
                distritosUnicos.add(cp.distrito);
              }
            }
          });
          
          this.distritosSugeridos = Array.from(distritosUnicos).sort();
          this.mostrarSugerencias = this.distritosSugeridos.length > 0;
        } else {
          this.distritosSugeridos = [];
          this.mostrarSugerencias = false;
        }
        this.loadingOptions['distritoSeleccionado'] = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        this.distritosSugeridos = [];
        this.mostrarSugerencias = false;
        this.loadingOptions['distritoSeleccionado'] = false;
        this.cdRef.detectChanges();
      }
    });
  }

  seleccionarDistrito(distrito: string) {
    this.formData['distritoSeleccionado'] = distrito;
    this.distritoBuscado = distrito;
    this.mostrarSugerencias = false;
    this.distritosSugeridos = [];
    this.onFieldChange('distritoSeleccionado', distrito);
    this.buscarDistrito(distrito, false);
    
    if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId.match(/^3\.1\.4\.A\.\d+$/)) {
      const prefijo = this.obtenerPrefijoGrupo();
      this.onFieldChange(this.obtenerCampoConPrefijo('grupoAISI'), distrito);
    }
    
    if (this.seccionId === '3.1.2' || this.seccionId === '3.1.2.A' || this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId.match(/^3\.1\.4\.A\.\d+$/)) {
      this.cargarCentrosPobladosParaAISD(distrito);
    }
    
    if (this.seccionId === '3.1.4.B' || this.seccionId === '3.1.4.B.1' || this.seccionId === '3.1.4.B.2') {
      this.cargarCentrosPobladosParaAISI(distrito);
    }
  }

  autoCompletarCpAisi() {
    const distrito = this.formData['distritoSeleccionado'];
    if (!distrito) return;
    
    const prefijo = this.obtenerPrefijoGrupo();
    const campoGrupoAISI = this.obtenerCampoConPrefijo('grupoAISI');
    
    if (this.obtenerValorConPrefijo('grupoAISI')) {
      return;
    }

    const jsonData = this.formularioService.obtenerJSON();
    if (jsonData && Array.isArray(jsonData) && jsonData.length > 0) {
      const capitalDistrital = jsonData.find((cp: any) => 
        cp.DIST && cp.DIST.toUpperCase() === distrito.toUpperCase() &&
        cp.CATEGORIA === 'Capital distrital'
      );
      
      if (capitalDistrital && capitalDistrital.CCPP) {
        this.onFieldChange(campoGrupoAISI, capitalDistrital.CCPP);
        this.onFieldChange(this.obtenerCampoConPrefijo('centroPobladoAISI'), capitalDistrital.CCPP);
        return;
      }
    }
    
    this.dataService.getPoblacionByDistrito(distrito).subscribe({
      next: (response) => {
        if (response && response.data && response.data.length > 0) {
          const primerCP = response.data[0];
          if (primerCP.centro_poblado && !this.obtenerValorConPrefijo('grupoAISI')) {
            this.onFieldChange(campoGrupoAISI, primerCP.centro_poblado);
            this.onFieldChange(this.obtenerCampoConPrefijo('centroPobladoAISI'), primerCP.centro_poblado);
          }
          
          if (primerCP.provincia && primerCP.departamento) {
            this.cargarCentrosPobladosParaAISD(distrito);
          }
        }
      }
    });
  }

  cargarCentrosPobladosParaAISI(distrito: string) {
    if (!distrito || distrito.trim() === '') {
      const prefijo = this.obtenerPrefijoGrupo();
      const campoCentroPoblado = `centroPobladoAISI${prefijo}`;
      if (this.autocompleteData[campoCentroPoblado]) {
        this.autocompleteData[campoCentroPoblado].sugerencias = [];
      }
      return;
    }

    const jsonData = this.formularioService.obtenerJSON();
    const centrosPobladosDesdeJSON = new Set<string>();

    if (jsonData && Array.isArray(jsonData) && jsonData.length > 0) {
      jsonData.forEach((cp: any) => {
        if (cp.DIST && cp.DIST.toUpperCase() === distrito.toUpperCase() &&
            cp.CATEGORIA === 'Capital distrital') {
          if (cp.CCPP) {
            centrosPobladosDesdeJSON.add(cp.CCPP);
          }
        }
      });
    }

    const prefijo = this.obtenerPrefijoGrupo();
    const campoCentroPoblado = `centroPobladoAISI${prefijo}`;
    
    if (!this.autocompleteData[campoCentroPoblado]) {
      this.autocompleteData[campoCentroPoblado] = { sugerencias: [], mostrar: false, buscado: '' };
    }
    
    if (!this.autocompleteData['centroPobladoAISI']) {
      this.autocompleteData['centroPobladoAISI'] = { sugerencias: [], mostrar: false, buscado: '' };
    }

    if (centrosPobladosDesdeJSON.size > 0) {
      this.autocompleteData[campoCentroPoblado].sugerencias = Array.from(centrosPobladosDesdeJSON).sort();
      this.autocompleteData['centroPobladoAISI'].sugerencias = Array.from(centrosPobladosDesdeJSON).sort();
      this.cdRef.detectChanges();
      return;
    }

    this.dataService.getPoblacionByDistrito(distrito.toUpperCase()).subscribe({
      next: (response) => {
        if (response && response.success && Array.isArray(response.data)) {
          const centrosPobladosUnicos = new Set<string>();
          
          response.data.forEach((cp: CentroPoblado) => {
            if (cp.centro_poblado) {
              centrosPobladosUnicos.add(cp.centro_poblado);
            }
          });
          
          this.autocompleteData[campoCentroPoblado].sugerencias = Array.from(centrosPobladosUnicos).sort();
          this.autocompleteData['centroPobladoAISI'].sugerencias = Array.from(centrosPobladosUnicos).sort();
        }
        this.cdRef.detectChanges();
      },
      error: (error) => {
      }
    });
  }

  cargarCentrosPobladosParaAISD(distrito: string) {
    if (!distrito || distrito.trim() === '') {
      if (this.autocompleteData['grupoAISD']) {
        this.autocompleteData['grupoAISD'].sugerencias = [];
      }
      return;
    }

    if (!this.autocompleteData['grupoAISD']) {
      this.autocompleteData['grupoAISD'] = { sugerencias: [], mostrar: false, buscado: '' };
    }

    const jsonData = this.formularioService.obtenerJSON();
    const comunidadesDesdeJSON = new Set<string>();

    if (jsonData && Array.isArray(jsonData) && jsonData.length > 0) {
      jsonData.forEach((cp: any) => {
        if (cp.DIST && cp.DIST.toUpperCase() === distrito.toUpperCase()) {
          const categoria = (cp.CATEGORIA || '').toLowerCase();
          const nombre = (cp.CCPP || '').toLowerCase();
          
          if (categoria === 'caserio' || 
              categoria === 'anexo' ||
              nombre.includes('ayroca') ||
              nombre.includes('saccsaguero') ||
              nombre.includes('sondor') ||
              nombre.includes('nauquipa')) {
            if (cp.CCPP) {
              comunidadesDesdeJSON.add(cp.CCPP);
            }
          }
        }
      });
    }

    if (comunidadesDesdeJSON.size > 0) {
      this.autocompleteData['grupoAISD'].sugerencias = Array.from(comunidadesDesdeJSON).sort();
      this.cdRef.detectChanges();
      return;
    }

    this.dataService.getPoblacionByDistrito(distrito.toUpperCase()).subscribe({
      next: (response) => {
        if (response && response.success && Array.isArray(response.data)) {
          const centrosPobladosUnicos = new Set<string>();
          
          response.data.forEach((cp: CentroPoblado) => {
            if (cp.centro_poblado) {
              centrosPobladosUnicos.add(cp.centro_poblado);
            }
          });
          
          this.autocompleteData['grupoAISD'].sugerencias = Array.from(centrosPobladosUnicos).sort();
        }
        this.cdRef.detectChanges();
      },
      error: (error) => {
      }
    });
  }

  buscarDistrito(distrito: string, esCargaInicial: boolean = false) {
    if (!distrito || distrito.trim() === '') {
      this.limpiarProvinciaYDepartamento();
      return;
    }

    this.loadingOptions['provinciaSeleccionada'] = true;
    this.loadingOptions['departamentoSeleccionado'] = true;
    
    this.dataService.getPoblacionByDistrito(distrito.toUpperCase()).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          const primerCP = response.data[0] as CentroPoblado;
          
          if (primerCP.provincia) {
            this.formData['provinciaSeleccionada'] = primerCP.provincia;
            this.onFieldChange('provinciaSeleccionada', primerCP.provincia);
          }
          
          if (primerCP.departamento) {
            this.formData['departamentoSeleccionado'] = primerCP.departamento;
            this.onFieldChange('departamentoSeleccionado', primerCP.departamento);
          }
          
          if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId.match(/^3\.1\.4\.A\.\d+$/)) {
            if (primerCP.provincia && primerCP.departamento) {
              this.cargarCentrosPobladosParaAISD(distrito);
            }
          }
          
          if (this.seccionId === '3.1.4.B' || this.seccionId === '3.1.4.B.1' || this.seccionId === '3.1.4.B.2') {
            if (primerCP.provincia && primerCP.departamento) {
              this.cargarCentrosPobladosParaAISI(distrito);
            }
          }
          
          if (this.seccionId === '3.1.2' || this.seccionId === '3.1.2.B') {
            if (primerCP.centro_poblado && !this.formData['grupoAISI']) {
              this.formData['grupoAISI'] = primerCP.centro_poblado;
              this.onFieldChange('grupoAISI', primerCP.centro_poblado);
            }
          }
          
          const provinciasUnicas = new Set<string>();
          const departamentosUnicos = new Set<string>();
          
          response.data.forEach((cp: CentroPoblado) => {
            if (cp.provincia) provinciasUnicas.add(cp.provincia);
            if (cp.departamento) departamentosUnicos.add(cp.departamento);
          });
          
          this.provincias = Array.from(provinciasUnicas).sort();
          this.departamentos = Array.from(departamentosUnicos).sort();
        } else {
          this.limpiarProvinciaYDepartamento();
        }
        
        this.loadingOptions['provinciaSeleccionada'] = false;
        this.loadingOptions['departamentoSeleccionado'] = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.limpiarProvinciaYDepartamento();
        this.loadingOptions['provinciaSeleccionada'] = false;
        this.loadingOptions['departamentoSeleccionado'] = false;
        this.cdRef.detectChanges();
      }
    });
  }

  limpiarProvinciaYDepartamento() {
    this.provincias = [];
    this.departamentos = [];
    this.formData['provinciaSeleccionada'] = '';
    this.formData['departamentoSeleccionado'] = '';
    this.onFieldChange('provinciaSeleccionada', '');
    this.onFieldChange('departamentoSeleccionado', '');
  }

  cerrarSugerencias() {
    setTimeout(() => {
      this.mostrarSugerencias = false;
      this.cdRef.detectChanges();
    }, 300);
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

    if (seccionesPadre[this.seccionId]) {
      this.seccionPadreTitulo = seccionesPadre[this.seccionId];
      return;
    }

    let seccionPadreId = '';
    
    if (this.seccionId.includes('.')) {
      const partes = this.seccionId.split('.');
      if (partes.length > 2) {
        if (this.seccionId.endsWith('.A') || this.seccionId.endsWith('.B')) {
          partes.pop();
          seccionPadreId = partes.join('.');
        } else {
          partes.pop();
          seccionPadreId = partes.join('.');
        }
      } else if (partes.length === 2) {
        partes.pop();
        seccionPadreId = partes.join('.');
      }
    }

    if (seccionPadreId && seccionesPadre[seccionPadreId]) {
      let tituloPadre = seccionesPadre[seccionPadreId];
      
      const matchA = this.seccionId.match(/^3\.1\.4\.A\.(\d+)/);
      if (matchA) {
        const numero = matchA[1];
        const grupoAISD = this.obtenerValorConPrefijo('grupoAISD');
        if (grupoAISD) {
          tituloPadre = `A.${numero} Comunidad Campesina ${grupoAISD}`;
        } else {
          tituloPadre = `A.${numero} Comunidad Campesina`;
        }
      } else if (this.seccionId.startsWith('3.1.4.B.1')) {
        const centroPobladoAISI = this.obtenerValorConPrefijo('centroPobladoAISI');
        if (centroPobladoAISI) {
          tituloPadre = `B.1 Centro Poblado ${centroPobladoAISI}`;
        } else {
          tituloPadre = 'B.1 Centro Poblado';
        }
      } else if (this.seccionId.startsWith('3.1.4.B.2')) {
        const centroPobladoAISI = this.obtenerValorConPrefijo('centroPobladoAISI');
        if (centroPobladoAISI) {
          tituloPadre = `B.2 Centro Poblado ${centroPobladoAISI}`;
        } else {
          tituloPadre = 'B.2 Centro Poblado';
        }
      }
      
      this.seccionPadreTitulo = tituloPadre;
    } else {
      this.seccionPadreTitulo = '';
    }
  }

  mostrarTablaDatos(): boolean {
    const seccionesConTabla: string[] = [];
    return seccionesConTabla.includes(this.seccionId);
  }

  mostrarImagenes(): boolean {
    const seccionesConImagenes: string[] = [];
    return seccionesConImagenes.includes(this.seccionId);
  }

  actualizarComponenteSeccion() {
    const seccionMap: { [key: string]: (componentId: string) => void } = {
      '3.1.1': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.2': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.2.A': (id) => ViewChildHelper.getComponent('seccion2')?.actualizarDatos(),
      '3.1.2.B': (id) => ViewChildHelper.getComponent('seccion2')?.actualizarDatos(),
      '3.1.3': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.3.A': (id) => ViewChildHelper.getComponent('seccion3')?.actualizarDatos(),
      '3.1.3.B': (id) => ViewChildHelper.getComponent('seccion3')?.actualizarDatos(),
      '3.1.4.A': (id) => {
        const component = ViewChildHelper.getComponent('seccion4');
        if (component) {
          component.actualizarDatos();
        }
      },
      '3.1.4.A.1': (id) => {
        const component = ViewChildHelper.getComponent('seccion4');
        if (component) {
          component.actualizarDatos();
        }
      },
      '3.1.4.A.2': (id) => {
        const component = ViewChildHelper.getComponent('seccion4');
        if (component) {
          component.actualizarDatos();
        }
      },
      '3.1.4.A.1.1': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.A.1.2': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.A.1.3': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.A.1.4': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.A.1.5': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.A.1.6': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.A.1.7': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.A.1.8': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.A.1.9': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.A.1.10': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.A.1.11': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.A.1.12': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.A.1.13': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.A.1.14': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.A.1.15': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.A.1.16': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.B': (id) => {
        ViewChildHelper.getComponent('seccion21')?.actualizarDatos();
        this.actualizarFotografiasCahuachoFormMulti();
      },
      '3.1.4.B.1': (id) => {
        ViewChildHelper.getComponent('seccion21')?.actualizarDatos();
        this.actualizarFotografiasCahuachoFormMulti();
      },
      '3.1.4.B.1.1': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.B.1.2': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.B.1.3': (id) => {
        ViewChildHelper.getComponent(id)?.actualizarDatos();
        this.actualizarFotografiasActividadesEconomicasFormMulti();
        this.actualizarFotografiasMercadoFormMulti();
      },
      '3.1.4.B.1.4': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.B.1.5': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.B.1.6': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.B.1.7': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.B.1.8': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos(),
      '3.1.4.B.1.9': (id) => ViewChildHelper.getComponent(id)?.actualizarDatos()
    };

    const componentIdMap: { [key: string]: string } = {
      '3.1.1': 'seccion1',
      '3.1.2': 'seccion2',
      '3.1.2.A': 'seccion2',
      '3.1.2.B': 'seccion2',
      '3.1.4.A': 'seccion4',
      '3.1.4.A.1': 'seccion4',
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
      '3.1.4.B.1.15': 'seccion36'
    };

    const actualizar = seccionMap[this.seccionId];
    if (actualizar) {
      const componentId = componentIdMap[this.seccionId] || this.seccionId;
      actualizar(componentId);
    }
  }

  obtenerTextoParrafoPrincipal(): string {
    if (this.formData['parrafoSeccion1_principal']) {
      return this.formData['parrafoSeccion1_principal'];
    }
    
    const proyecto = this.formData['projectName'] || '____';
    const distrito = this.formData['distritoSeleccionado'] || '____';
    const provincia = this.formData['provinciaSeleccionada'] || '____';
    const departamento = this.formData['departamentoSeleccionado'] || '____';
    
    return `Este componente realiza una caracterización de los aspectos socioeconómicos, culturales y antropológicos del área de influencia social del proyecto ${proyecto}, como un patrón de referencia inicial en base a la cual se pueda medir los impactos sobre la población del entorno directo del Proyecto.\n\nEl proyecto ${proyecto} se encuentra ubicado en el distrito de ${distrito}, en la provincia de ${provincia}, en el departamento de ${departamento}, bajo la administración del Gobierno Regional de ${departamento}, en el sur del Perú.\n\nEste estudio se elabora de acuerdo con el Reglamento de la Ley del Sistema Nacional de Evaluación de Impacto Ambiental, los Términos de Referencia comunes para actividades de exploración minera y la Guía de Relaciones Comunitarias del Ministerio de Energía y Minas (MINEM).`;
  }

  obtenerTextoIntroduccionObjetivos(): string {
    if (this.formData['parrafoSeccion1_4']) {
      return this.formData['parrafoSeccion1_4'];
    }
    
    return 'Los objetivos de la presente línea de base social (LBS) son los siguientes:';
  }

  obtenerTextoObjetivo1(): string {
    if (this.formData['objetivoSeccion1_1']) {
      return this.formData['objetivoSeccion1_1'];
    }
    
    const proyecto = this.formData['projectName'] || '____';
    const proyectoNormalizado = this.textNormalization.normalizarNombreProyecto(proyecto, false);
    
    return `Describir los aspectos demográficos, sociales, económicos, culturales y políticos que caracterizan a las poblaciones de las áreas de influencia social del proyecto de exploración minera ${proyectoNormalizado}.`;
  }

  obtenerTextoObjetivo2(): string {
    if (this.formData['objetivoSeccion1_2']) {
      return this.formData['objetivoSeccion1_2'];
    }
    
    return 'Brindar información básica de los poblados comprendidos en el área de influencia social donde se realizará el Proyecto que sirvan de base para poder determinar los posibles impactos sociales a originarse en esta primera etapa de exploración y, por ende, prevenir, reducir o mitigar las consecuencias negativas y potenciar las positivas.';
  }

  obtenerTextoSeccion2Introduccion(): string {
    if (this.formData['parrafoSeccion2_introduccion']) {
      return this.formData['parrafoSeccion2_introduccion'];
    }
    
    return 'En términos generales, la delimitación del ámbito de estudio de las áreas de influencia social se hace tomando en consideración a los agentes e instancias sociales, individuales y/o colectivas, públicas y/o privadas, que tengan derechos o propiedad sobre el espacio o los recursos respecto de los cuales el proyecto de exploración minera tiene incidencia.\n\nAsimismo, el área de influencia social de un Proyecto tiene en consideración a los grupos de interés que puedan ser potencialmente afectadas por el desarrollo de dicho proyecto (según La Guía de Relaciones Comunitarias de la DGAAM del MINEM, se denomina "grupos de interés" a aquellos grupos humanos que son impactados por dicho Proyecto).\n\nEl criterio social para la delimitación de un área de influencia debe tener en cuenta la influencia que el Proyecto pudiera tener sobre el entorno social, que será o no ambientalmente impactado, considerando también la posibilidad de generar otro tipo de impactos, expectativas, intereses y/o demandas del entorno social.\n\nEn base a estos criterios se han identificado las áreas de influencia social directa e indirecta:';
  }

  obtenerTextoSeccion2AISDCompleto(): string {
    if (this.formData['parrafoSeccion2_aisd_completo']) {
      return this.formData['parrafoSeccion2_aisd_completo'];
    }
    
    const comunidades = this.datos['comunidadesCampesinas'] || [];
    const tieneUna = comunidades.length === 1;
    const tieneMultiples = comunidades.length > 1;
    const textoComunidades = comunidades.length === 0 ? '____' : 
      comunidades.length === 1 ? comunidades[0].nombre :
      comunidades.length === 2 ? `${comunidades[0].nombre} y ${comunidades[1].nombre}` :
      comunidades.slice(0, -1).map((cc: any) => cc.nombre).join(', ') + ' y ' + comunidades[comunidades.length - 1].nombre;
    
    const distrito = this.formData['distritoSeleccionado'] || '____';
    const aisd1 = this.formData['aisdComponente1'] || '____';
    const aisd2 = this.formData['aisdComponente2'] || '____';
    const departamento = this.formData['departamentoSeleccionado'] || '____';
    
    const textoPosesion = tieneMultiples ? 'Estas comunidades poseen' : 'Esta comunidad posee';
    const textoComunidad = tieneMultiples ? 'estas comunidades' : 'esta comunidad';
    const textoComunidadPlural = tieneMultiples ? 'las comunidades' : 'la comunidad';
    const textoRequiere = tieneMultiples ? 'requieren' : 'requiere';
    const textoPromovera = tieneMultiples ? 'promoverán' : 'promoverá';
    
    const prefijoCC = tieneMultiples ? 'las CC ' : 'la CC ';
    const textoComunidadesImpactos = textoComunidades;
    const textoComunidadesFinal = textoComunidades;
    
    return `El Área de influencia social directa (AISD) se delimita en torno a ${tieneUna ? 'la comunidad campesina (CC)' : 'las comunidades campesinas (CC)'} ${textoComunidades}${tieneUna ? `, cuya área comunal se encuentra predominantemente en el distrito de ${distrito} y en menor proporción en los distritos de ${aisd1} y de ${aisd2}, pertenecientes al departamento de ${departamento}` : `, cuyas áreas comunales se encuentran predominantemente en el distrito de ${distrito} y en menor proporción en los distritos de ${aisd1} y de ${aisd2}, pertenecientes al departamento de ${departamento}`}. La delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales. ${textoPosesion} y gestiona${tieneMultiples ? 'n' : ''} las tierras donde se llevará a cabo la exploración minera, lo que implica una relación directa y significativa con el Proyecto.\n\nLa titularidad de estas tierras establece un vínculo crucial con los pobladores locales, ya que cualquier actividad realizada en el área puede influir directamente sus derechos, usos y costumbres asociados a la tierra. Además, la gestión y administración de estos terrenos por parte de ${textoComunidad} ${textoRequiere} una consideración detallada en la planificación y ejecución del Proyecto, asegurando que las operaciones se lleven a cabo con respeto a la estructura organizativa y normativa de ${textoComunidadPlural}.\n\nLos impactos directos en ${prefijoCC}${textoComunidadesImpactos}, derivados del proyecto de exploración minera, incluyen la contratación de mano de obra local, la interacción con las costumbres y autoridades, y otros efectos socioeconómicos y culturales. La generación de empleo local no solo proporcionará oportunidades económicas inmediatas, sino que también fomentará el desarrollo de habilidades y capacidades en la población. La interacción constante con las autoridades y ${textoComunidadPlural} ${textoPromovera} un diálogo y una cooperación que son esenciales para el éxito del Proyecto, respetando y adaptándose a las prácticas y tradiciones locales. La consideración de estos factores en la delimitación del AISD garantiza que el Proyecto avance de manera inclusiva y sostenible, alineado con las expectativas y necesidades de ${prefijoCC}${textoComunidadesFinal}.`;
  }

  obtenerTextoSeccion2AISICompleto(): string {
    if (this.formData['parrafoSeccion2_aisi_completo']) {
      return this.formData['parrafoSeccion2_aisi_completo'];
    }
    
    const distritosAISI = this.datos['distritosSeleccionadosAISI'] || [];
    const tieneUnDistrito = distritosAISI.length === 1;
    const tieneMultiplesDistritos = distritosAISI.length > 1;
    
    const textoAISI = distritosAISI.length === 0 ? '____' :
      distritosAISI.length === 1 ? distritosAISI[0] :
      distritosAISI.length === 2 ? `${distritosAISI[0]} y ${distritosAISI[1]}` :
      distritosAISI.slice(0, -1).join(', ') + ' y ' + distritosAISI[distritosAISI.length - 1];
    
    if (tieneUnDistrito) {
      return `El Área de influencia social indirecta (AISI) se delimita en torno a la capital distrital de la jurisdicción de ${textoAISI}. Esta localidad se considera dentro del AISI debido a su función como centro administrativo y político de su respectivo distrito. Como capital distrital, el Centro Poblado (CP) ${textoAISI} es un punto focal para la interacción con las autoridades locales, quienes jugarán un papel crucial en la gestión y supervisión de las actividades del Proyecto. Además, la adquisición de bienes y servicios esporádicos en este centro poblado será esencial para el soporte logístico, lo que justifica su inclusión en el AISI.\n\nLa delimitación también se basa en la necesidad de establecer un diálogo continuo y efectivo con las autoridades políticas locales en el distrito de ${textoAISI}. Esta interacción es vital para asegurar que las operaciones del Proyecto sean transparentes y alineadas con las normativas locales y las expectativas de la población. Asimismo, la compra esporádica de suministros y la contratación de servicios en este centro poblado contribuirá al dinamismo económico de la capital distrital, generando beneficios indirectos para esta población. De esta manera, la delimitación del AISI considera tanto la dimensión administrativa y política como la económica, garantizando un enfoque integral y sostenible en la implementación del Proyecto.`;
    } else {
      return `El Área de influencia social indirecta (AISI) se delimita en torno a las capitales distritales de las jurisdicciones de ${textoAISI}. Estas localidades se consideran dentro del AISI debido a su función como centros administrativos y políticos de sus respectivos distritos. Como capitales distritales, los Centros Poblados (CP) de ${textoAISI} son puntos focales para la interacción con las autoridades locales, quienes jugarán un papel crucial en la gestión y supervisión de las actividades del Proyecto. Además, la adquisición de bienes y servicios esporádicos en estos centros poblados será esencial para el soporte logístico, lo que justifica su inclusión en el AISI.\n\nLa delimitación también se basa en la necesidad de establecer un diálogo continuo y efectivo con las autoridades políticas locales en los distritos de ${textoAISI}. Esta interacción es vital para asegurar que las operaciones del Proyecto sean transparentes y alineadas con las normativas locales y las expectativas de la población. Asimismo, la compra esporádica de suministros y la contratación de servicios en estos centros poblados contribuirá al dinamismo económico de las capitales distritales, generando beneficios indirectos para esta población. De esta manera, la delimitación del AISI considera tanto la dimensión administrativa y política como la económica, garantizando un enfoque integral y sostenible en la implementación del Proyecto.`;
    }
  }

  obtenerTextoSeccion3Metodologia(): string {
    if (this.formData['parrafoSeccion3_metodologia']) {
      return this.formData['parrafoSeccion3_metodologia'];
    }
    
    return 'Para la descripción del aspecto socioeconómico se ha utilizado una combinación de métodos y técnicas cualitativas de investigación social, entre ellas se ha seleccionado las técnicas de entrevistas semiestructuradas con autoridades locales y/o informantes calificados, así como de encuestas de carácter socioeconómico. Además de ello, se ha recurrido a la recopilación de documentos que luego son contrastados y completados con la consulta de diversas fuentes de información oficiales actualizadas respecto al área de influencia social tales como el Censo Nacional INEI (2017), Escale – MINEDU, la base de datos de la Oficina General de Estadística e Informática del Ministerio de Salud, entre otros.';
  }

  obtenerTextoSeccion3FuentesPrimarias(): string {
    if (this.formData['parrafoSeccion3_fuentes_primarias']) {
      return this.formData['parrafoSeccion3_fuentes_primarias'];
    }
    
    const cantidadEntrevistas = this.formData['cantidadEntrevistas'] || '____';
    return `Dentro de las fuentes primarias se consideran a las autoridades comunales y locales, así como pobladores que fueron entrevistados y proporcionaron información cualitativa y cuantitativa. Esta información de primera mano muestra datos fidedignos que proporcionan un alcance más cercano de la realidad en la que se desarrollan las poblaciones del área de influencia social. Para la obtención de información cualitativa, se realizaron un total de ${cantidadEntrevistas} entrevistas en profundidad a informantes calificados y autoridades locales.`;
  }

  obtenerTextoSeccion3FuentesSecundarias(): string {
    if (this.formData['parrafoSeccion3_fuentes_secundarias']) {
      return this.formData['parrafoSeccion3_fuentes_secundarias'];
    }
    
    return 'En la elaboración de la LBS se utilizó información cuantitativa de fuentes secundarias provenientes de fuentes oficiales, entre las que se encuentran las siguientes:';
  }

  obtenerTextoSeccion4IntroduccionAISD(): string {
    if (this.formData['parrafoSeccion4_introduccion_aisd']) {
      return this.formData['parrafoSeccion4_introduccion_aisd'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || '____';
    return `Se ha determinado como Área de Influencia Social Directa (AISD) a la CC ${grupoAISD}. Esta delimitación se justifica en los criterios de propiedad de terreno superficial, además de la posible ocurrencia de impactos directos como la contratación de mano de obra local, adquisición de bienes y servicios, así como logística. En los siguientes apartados se desarrolla la caracterización socioeconómica y cultural de la comunidad delimitada como parte del AISD.`;
  }

  obtenerTextoSeccion4ComunidadCompleto(): string {
    if (this.formData['parrafoSeccion4_comunidad_completo']) {
      return this.formData['parrafoSeccion4_comunidad_completo'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || '____';
    const distrito = this.formData['distritoSeleccionado'] || '____';
    const provincia = this.formData['provinciaSeleccionada'] || '____';
    const aisd1 = this.formData['aisdComponente1'] || '____';
    const aisd2 = this.formData['aisdComponente2'] || '____';
    const departamento = this.formData['departamentoSeleccionado'] || '____';
    const grupoAISI = this.formData['grupoAISI'] || this.formData['distritoSeleccionado'] || '____';
    
    return `La CC ${grupoAISD} se encuentra ubicada predominantemente dentro del distrito de ${distrito}, provincia de ${provincia}; no obstante, sus límites comunales abarcan pequeñas áreas de los distritos de ${aisd1} y de ${aisd2}, del departamento de ${departamento}. Esta comunidad se caracteriza por su historia y tradiciones que se mantienen vivas a lo largo de los años. Se encuentra compuesta por el anexo ${grupoAISD}, el cual es el centro administrativo comunal, además de los sectores agropecuarios de Yuracranra, Tastanic y Faldahuasi. Ello se pudo validar durante el trabajo de campo, así como mediante la Base de Datos de Pueblos Indígenas u Originarios (BDPI). Sin embargo, en la actualidad, estos sectores agropecuarios no cuentan con población permanente y la mayor parte de los comuneros se concentran en el anexo ${grupoAISD}.\n\nEn cuanto al nombre "${grupoAISD}", según los entrevistados, este proviene de una hierba que se empleaba para elaborar moldes artesanales para queso; no obstante, ya no se viene utilizando en el presente y es una práctica que ha ido reduciéndose paulatinamente. Por otro lado, cabe mencionar que la comunidad se halla al este de la CC Sondor, al norte del CP ${grupoAISI} y al oeste del anexo Nauquipa.\n\nAsimismo, la CC ${grupoAISD} es reconocida por el Ministerio de Cultura como parte de los pueblos indígenas u originarios, específicamente como parte del pueblo quechua. Esta identidad es un pilar fundamental de la comunidad, influyendo en sus prácticas agrícolas, celebraciones y organización social. La oficialización de la comunidad por parte del Estado peruano se remonta al 24 de agosto de 1987, cuando fue reconocida mediante RD N°495 – 87 – MAG – DR – VIII – A. Este reconocimiento formalizó la existencia y los derechos de la comunidad, fortaleciendo su posición y legitimidad dentro del marco legal peruano. Posteriormente, las tierras de la comunidad fueron tituladas el 28 de marzo de 1996, conforme consta en la Ficha 90000300, según la BDPI. Esta titulación ha sido crucial para la protección y manejo de sus recursos naturales, permitiendo a la comunidad planificar y desarrollar proyectos que beneficien a todos sus comuneros. La administración de estas tierras ha sido un factor clave en la preservación de su cultura y en el desarrollo sostenible de la comunidad.`;
  }

  obtenerTextoSeccion4CaracterizacionIndicadores(): string {
    if (this.formData['parrafoSeccion4_caracterizacion_indicadores']) {
      return this.formData['parrafoSeccion4_caracterizacion_indicadores'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || '____';
    return `Para la caracterización de los indicadores demográficos y aquellos relacionados a viviendas, se emplea la sumatoria de casos obtenida al considerar aquellos puntos de población que conforman la CC ${grupoAISD}. En el siguiente cuadro, se presenta aquellos puntos de población identificados por el INEI que se encuentran dentro de la comunidad en cuestión.`;
  }

  obtenerListaFuentesSecundarias(): string[] {
    return this.formData['fuentesSecundariasLista'] || [];
  }

  actualizarFuenteSecundaria(index: number, valor: string): void {
    const lista = [...(this.formData['fuentesSecundariasLista'] || [])];
    lista[index] = valor;
    this.onFieldChange('fuentesSecundariasLista', lista);
  }

  eliminarFuenteSecundaria(index: number): void {
    const lista = [...(this.formData['fuentesSecundariasLista'] || [])];
    lista.splice(index, 1);
    this.onFieldChange('fuentesSecundariasLista', lista);
  }

  agregarFuenteSecundaria(): void {
    const lista = [...(this.formData['fuentesSecundariasLista'] || [])];
    lista.push('');
    this.onFieldChange('fuentesSecundariasLista', lista);
  }

  obtenerTextoSeccion7SituacionEmpleoCompleto(): string {
    if (this.formData['parrafoSeccion7_situacion_empleo_completo']) {
      return this.formData['parrafoSeccion7_situacion_empleo_completo'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || '____';
    return `En la CC ${grupoAISD}, la mayor parte de la población se dedica a actividades económicas de carácter independiente, siendo la ganadería la principal fuente de sustento. De manera complementaria, también se desarrolla la agricultura. Esta realidad implica que la mayoría de los comuneros se dediquen al trabajo por cuenta propia, centrado en la crianza de vacunos y ovinos como las principales especies ganaderas. Estas actividades son claves para la economía local, siendo la venta de ganado y sus derivados una fuente de ingresos importante para las familias. En el ámbito agrícola, las tierras comunales se destinan a la producción de cultivos como la papa, habas y cebada, productos que se destinan principalmente al autoconsumo y de manera esporádica a la comercialización en mercados cercanos.\n\nEl empleo dependiente en la CC ${grupoAISD} es mínimo y se encuentra limitado a aquellos que trabajan en instituciones públicas. Entre ellos se encuentran los docentes que laboran en las instituciones educativas locales, así como el personal que presta servicios en el puesto de salud. Estas ocupaciones representan un pequeño porcentaje de la fuerza laboral, ya que la mayoría de los comuneros siguen trabajando en actividades tradicionales como la ganadería y la agricultura, que forman parte de su modo de vida ancestral.`;
  }

  obtenerTextoSeccion7IngresosCompleto(): string {
    if (this.formData['parrafoSeccion7_ingresos_completo']) {
      return this.formData['parrafoSeccion7_ingresos_completo'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || '____';
    const distrito = this.formData['distritoSeleccionado'] || 'Cahuacho';
    const ingresoPerCapita = this.formData['ingresoFamiliarPerCapita'] || '391,06';
    const ranking = this.formData['rankingIngresoPerCapita'] || '1191';
    
    return `En la CC ${grupoAISD}, los ingresos de la población provienen principalmente de las actividades ganaderas y agrícolas, que son las fuentes económicas predominantes en la localidad. La venta de vacunos y ovinos, así como de productos agrícolas como papa, habas y cebada, proporciona ingresos variables, dependiendo de las condiciones climáticas y las fluctuaciones en los mercados locales. Sin embargo, debido a la dependencia de estos sectores primarios, los ingresos no son estables ni regulares, y pueden verse afectados por factores como las heladas, la falta de pasto en épocas de sequía o la baja demanda de los productos en el mercado.\n\nOtra parte de los ingresos proviene de los comuneros que participan en actividades de comercio de pequeña escala, vendiendo sus productos en mercados locales o en ferias regionales. No obstante, esta forma de generación de ingresos sigue siendo limitada y no representa una fuente principal para la mayoría de las familias. En cuanto a los pocos habitantes que se encuentran empleados de manera dependiente, tales como los maestros en las instituciones educativas y el personal del puesto de salud, sus ingresos son más regulares, aunque representan una porción muy pequeña de la población.\n\nAdicionalmente, cabe mencionar que, según el informe del PNUD 2019, el distrito de ${distrito} (jurisdicción que abarca a los poblados que conforman la CC ${grupoAISD}) cuenta con un ingreso familiar per cápita de S/. ${ingresoPerCapita} mensuales, ocupando el puesto N°${ranking} en el ranking de dicha variable, lo que convierte a dicha jurisdicción en una de las que cuentan con menor ingreso familiar per cápita en todo el país.`;
  }

  obtenerTextoSeccion8GanaderiaCompleto(): string {
    if (this.formData['parrafoSeccion8_ganaderia_completo']) {
      return this.formData['parrafoSeccion8_ganaderia_completo'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || '____';
    const provincia = this.formData['provinciaSeleccionada'] || 'Caravelí';
    
    return `En la CC ${grupoAISD}, la ganadería es la actividad económica predominante, con un 80 % de la producción destinada al autoconsumo familiar y un 20 % a la venta, según los entrevistados. Las principales especies que se crían son los vacunos y los ovinos, aunque también se crían caprinos y animales menores como gallinas y cuyes. El precio del ganado en pie varía dependiendo de la especie: los vacunos se venden entre S/. 1 200 y S/. 1 500, los ovinos entre S/. 180 y S/. 200, las gallinas entre S/. 20 y S/. 30, y los cuyes entre S/. 25 y S/. 30.\n\nLa alimentación del ganado se basa principalmente en pasto natural, aunque también se les proporciona pasto cultivable en las temporadas de escasez. Uno de los productos derivados más importantes es el queso, el cual se destina particularmente a la capital provincial de ${provincia} para la venta; también se elabora yogurt, aunque en menor medida.\n\nA pesar de la importancia de esta actividad para la economía local, la ganadería enfrenta diversas problemáticas. Entre las principales están la falta de especialistas en salud veterinaria, así como los desafíos climáticos, especialmente las heladas, que pueden reducir la disponibilidad de pastos y generar pérdidas en los rebaños. Estas dificultades impactan directamente en la productividad y los ingresos de los comuneros ganaderos.`;
  }

  obtenerTextoSeccion8AgriculturaCompleto(): string {
    if (this.formData['parrafoSeccion8_agricultura_completo']) {
      return this.formData['parrafoSeccion8_agricultura_completo'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || '____';
    
    return `En la CC ${grupoAISD}, la agricultura desempeña un papel complementario a la ganadería, y la mayor parte de la producción, cerca de un 95 % según los entrevistados, se destina al autoconsumo, mientras que solo un 5 % se comercializa. Los principales cultivos son la papa, habas, cebada y forraje (como avena y alfalfa), los cuales son esenciales para la dieta de las familias comuneras y en menor medida para la alimentación del ganado. Estos productos se cultivan en pequeñas parcelas, con cada familia disponiendo de un promedio de 1 ½ hectárea de tierra.\n\nEl sistema de riego utilizado en la comunidad es principalmente por gravedad, aprovechando las fuentes de agua disponibles en la zona. Sin embargo, la actividad agrícola enfrenta serios desafíos, como las heladas, que dañan los cultivos durante las temporadas frías, y las sequías, que disminuyen la disponibilidad de agua, afectando la capacidad productiva de las familias. Adicionalmente, se enfrentan plagas y enfermedades como roedores y el gusano blanco. Estas problemáticas, recurrentes en el ciclo agrícola, limitan tanto la cantidad como la calidad de los productos cosechados.`;
  }

  obtenerTextoSeccion10ServiciosBasicosIntro(): string {
    if (this.formData['parrafoSeccion10_servicios_basicos_intro']) {
      return this.formData['parrafoSeccion10_servicios_basicos_intro'];
    }
    
    const viviendasOcupadas = this.datos['condicionOcupacionTabla']?.find((item: any) => item.categoria === 'Ocupadas')?.casos || '____';
    
    return `Los servicios básicos nos indican el nivel de desarrollo de una comunidad y un saneamiento deficiente va asociado a la transmisión de enfermedades como el cólera, la diarrea, la disentería, la hepatitis A, la fiebre tifoidea y la poliomielitis, y agrava el retraso del crecimiento. En 2010, la Asamblea General de las Naciones Unidas reconoció que el acceso al agua potable salubre y limpia, y al saneamiento es un derecho humano y pidió que se realizaran esfuerzos internacionales para ayudar a los países a proporcionar agua potable e instalaciones de saneamiento salubres, limpias, accesibles y asequibles. Los servicios básicos serán descritos a continuación tomando como referencia el total de viviendas con ocupantes presentes (${viviendasOcupadas}), tal como realiza el Censo Nacional 2017.`;
  }

  obtenerTextoSeccion11TransporteCompleto(): string {
    if (this.formData['parrafoSeccion11_transporte_completo']) {
      return this.formData['parrafoSeccion11_transporte_completo'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || '____';
    const provincia = this.formData['provinciaSeleccionada'] || 'Caravelí';
    const distrito = this.formData['distritoSeleccionado'] || 'Cahuacho';
    const costoMin = this.formData['costoTransporteMinimo'] || '25';
    const costoMax = this.formData['costoTransporteMaximo'] || '30';
    
    return `En la CC ${grupoAISD}, la infraestructura de transporte es limitada. Dentro de la comunidad solo se encuentran trochas carrozables que permiten llegar al anexo ${grupoAISD}. Estas vías facilitan el acceso en vehículos, pero son de tierra y no están pavimentadas, lo que dificulta el tránsito en épocas de lluvias o durante el invierno. Los demás puntos poblados dentro de la comunidad también son accesibles mediante trochas carrozables, aunque en condiciones más precarias que las principales que permiten el acceso al anexo o centro administrativo comunal.\n\nPor otro lado, no existen empresas de transporte formalmente establecidas dentro de la comunidad. Sin embargo, existe un servicio de transporte frecuente que es provisto por una combi todos los días lunes. El único destino de esta movilidad es la ciudad de ${provincia}, a la cual parte cerca de las 10:30 am desde la capital distrital de ${distrito}. El costo por este servicio varía entre S/. ${costoMin} y S/. ${costoMax} por trayecto, dependiendo de la demanda y las condiciones del viaje. Es así que esta es la única opción que tienen los comuneros para desplazarse a ciudades más grandes.`;
  }

  obtenerTextoSeccion11TelecomunicacionesCompleto(): string {
    if (this.formData['parrafoSeccion11_telecomunicaciones_completo']) {
      return this.formData['parrafoSeccion11_telecomunicaciones_completo'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || '____';
    
    return `En la CC ${grupoAISD}, la infraestructura en telecomunicaciones presenta algunas limitaciones, aunque existen servicios disponibles para la población. En cuanto a radiodifusión, no es posible captar señal de emisoras provinciales o nacionales. Respecto a la señal de televisión, la comunidad cuenta con acceso a América TV (canal 4) a través de señal abierta, gracias a una antena de la municipalidad que retransmite este canal, lo que garantiza una opción de entretenimiento y noticias. Adicionalmente, algunas familias tienen contratado el servicio de DIRECTV, el cual brinda acceso a televisión satelital.\n\nEn lo que respecta a la telefonía móvil, la cobertura es restringida y solo las operadoras de Movistar y Entel logran captar señal en la comunidad, lo cual limita las opciones de comunicación para los habitantes. Por otro lado, el acceso a internet depende únicamente de Movistar, ya que los comuneros solo pueden conectarse a través de los datos móviles proporcionados por esta empresa. Además, cabe mencionar que, si bien existe acceso a internet, la calidad y estabilidad de la conexión pueden ser deficientes, especialmente en las zonas más alejadas dentro de la comunidad.`;
  }

  obtenerTextoSeccion12SaludCompleto(): string {
    if (this.formData['parrafoSeccion12_salud_completo']) {
      return this.formData['parrafoSeccion12_salud_completo'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || '____';
    const provincia = this.formData['provinciaSeleccionada'] || 'Caravelí';
    
    return `Dentro de la CC ${grupoAISD} se encuentra un puesto de salud, que está bajo la gestión directa del MINSA. Este establecimiento es de categoría I – 2 y brinda atención primaria a los habitantes de la comunidad. En la actualidad, se viene ofreciendo tres servicios con carácter permanente: medicina, obstetricia y enfermería; aunque también se coordina en conjunto con la MICRORED la realización de campañas de salud como psicología y salud bucal. No obstante, ante casos de mayor complejidad, la población es derivada a establecimientos de mayor categoría, principalmente ubicados en la ciudad de ${provincia}.`;
  }

  obtenerTextoSeccion12EducacionCompleto(): string {
    if (this.formData['parrafoSeccion12_educacion_completo']) {
      return this.formData['parrafoSeccion12_educacion_completo'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || '____';
    
    return `Dentro de la CC ${grupoAISD} se hallan instituciones educativas de los dos primeros niveles de educación básica regular (inicial y primaria). Todas ellas se encuentran concentradas en el anexo ${grupoAISD}, el centro administrativo comunal. En base al Censo Educativo 2023, la institución con mayor cantidad de estudiantes dentro de la comunidad es la IE N°40270, la cual es de nivel primaria, con un total de 21 estudiantes. A continuación, se presenta el cuadro con la cantidad de estudiantes por institución educativa y nivel dentro de la localidad en cuestión.`;
  }

  obtenerTextoSeccion13NatalidadMortalidadCompleto(): string {
    if (this.formData['parrafoSeccion13_natalidad_mortalidad_completo']) {
      return this.formData['parrafoSeccion13_natalidad_mortalidad_completo'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || 'Ayroca';
    
    return `El presente ítem proporciona una visión crucial sobre las dinámicas demográficas, reflejando las tendencias en el crecimiento poblacional. De los datos obtenidos en el Puesto de Salud ${grupoAISD} durante el trabajo de campo, se obtiene que en el año 2023 solo ocurrió un nacimiento, mientras que para el 2024 (hasta el 13 de noviembre) se dieron un total de tres (03) nacimientos.\n\nRespecto a la mortalidad, según la misma fuente, se obtiene que en el año 2023 se registró un fallecimiento, por suicidio; mientras que para el 2024 no ocurrieron decesos dentro de la CC ${grupoAISD}, hasta la fecha indicada.`;
  }

  obtenerTextoSeccion13MorbilidadCompleto(): string {
    if (this.formData['parrafoSeccion13_morbilidad_completo']) {
      return this.formData['parrafoSeccion13_morbilidad_completo'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || '____';
    const distrito = this.formData['distritoSeleccionado'] || 'Cahuacho';
    
    return `De acuerdo con las entrevistas aplicadas durante el trabajo de campo, las autoridades locales y los informantes calificados reportaron que las enfermedades más recurrentes dentro de la CC ${grupoAISD} son las infecciones respiratorias agudas (IRAS) y las enfermedades diarreicas agudas (EDAS). Asimismo, se mencionan casos de hipertensión y diabetes, que son más frecuentes en adultos mayores.\n\nEn cuanto a los grupos de morbilidad que se hallan a nivel distrital de ${distrito} (jurisdicción que abarca a los poblados de la CC ${grupoAISD}) para el año 2023, se destaca que las condiciones más frecuentes son las infecciones agudas de las vías respiratorias superiores (1012 casos) y la obesidad y otros de hiperalimentación (191 casos). Para la primera, se reportó un mayor número de casos en el bloque etario de 0-11 años, mientras que para la segunda, el rango de 30-59 años mostró más casos. A continuación, se presenta el cuadro con la cantidad de casos por grupo de morbilidad y bloques etarios dentro del distrito, según el portal REUNIS del MINSA.`;
  }

  obtenerTextoSeccion14IndicadoresEducacionIntro(): string {
    if (this.formData['parrafoSeccion14_indicadores_educacion_intro']) {
      return this.formData['parrafoSeccion14_indicadores_educacion_intro'];
    }
    
    return `La educación es un pilar fundamental para el desarrollo social y económico de una comunidad. En ese sentido, los indicadores de educación juegan un papel crucial al proporcionar una visión clara del estado actual del sistema educativo y su impacto en la población. Este apartado se centra en dos indicadores clave: el nivel educativo de la población y la tasa de analfabetismo. El análisis de estos indicadores permite comprender mejor las fortalezas y desafíos del sistema educativo local, así como diseñar estrategias efectivas para mejorar la calidad educativa y reducir las desigualdades en el acceso a la educación.`;
  }

  obtenerTextoSeccion21AISIIntroCompleto(): string {
    if (this.formData['parrafoSeccion21_aisi_intro_completo']) {
      return this.formData['parrafoSeccion21_aisi_intro_completo'];
    }
    
    const centroPoblado = this.formData['centroPobladoAISI'] || 'Cahuacho';
    const provincia = this.formData['provinciaSeleccionada'] || 'Caravelí';
    const departamento = this.formData['departamentoSeleccionado'] || 'Arequipa';
    
    return `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el CP ${centroPoblado}, capital distrital de la jurisdicción homónima, en la provincia de ${provincia}, en el departamento de ${departamento}. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, es la localidad de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`;
  }

  obtenerTextoSeccion21CentroPobladoCompleto(): string {
    if (this.formData['parrafoSeccion21_centro_poblado_completo']) {
      return this.formData['parrafoSeccion21_centro_poblado_completo'];
    }
    
    const centroPoblado = this.formData['centroPobladoAISI'] || 'Cahuacho';
    const provincia = this.formData['provinciaSeleccionada'] || 'Caravelí';
    const departamento = this.formData['departamentoSeleccionado'] || 'Arequipa';
    const ley = this.formData['leyCreacionDistrito'] || '8004';
    const fecha = this.formData['fechaCreacionDistrito'] || '22 de febrero de 1935';
    const distrito = this.formData['distritoSeleccionado'] || 'Cahuacho';
    const distritoAnterior = this.formData['distritoAnterior'] || 'Caravelí';
    const origen1 = this.formData['origenPobladores1'] || 'Caravelí';
    const origen2 = this.formData['origenPobladores2'] || 'Parinacochas';
    const deptoOrigen = this.formData['departamentoOrigen'] || 'Ayacucho';
    const anexos = this.formData['anexosEjemplo'] || 'Ayroca o Sóndor';
    
    return `El CP ${centroPoblado} es la capital del distrito homónimo, perteneciente a la provincia de ${provincia}, en el departamento de ${departamento}. Su designación como capital distrital se oficializó mediante la Ley N°${ley}, promulgada el ${fecha}, fecha en que se creó el distrito de ${distrito}. Antes de ello, este asentamiento era un caserío del distrito de ${distritoAnterior}, marcando un importante cambio en su desarrollo administrativo y social.\n\nLos primeros pobladores de ${centroPoblado} provenían principalmente de ${origen1} y la provincia de ${origen2}, en ${deptoOrigen}. Entre las familias pioneras destacan apellidos como Espinoza, Miralles, De la Cruz y Aguayo, quienes sentaron las bases de la localidad actual. El nombre "${centroPoblado}" proviene del término quechua Ccahuayhuachu, que se traduce como "mírame desde aquí", reflejando posiblemente su ubicación estratégica o una percepción cultural del entorno.\n\nA diferencia de algunos anexos del distrito, como ${anexos}, que son centros administrativos de sus respectivas comunidades campesinas, el centro poblado ${centroPoblado} no se encuentra dentro de los límites de ninguna comunidad campesina. Esto le otorga una característica particular dentro del contexto rural, marcando su identidad como un núcleo urbano-administrativo independiente en el distrito.`;
  }

  obtenerTextoSeccion15ReligionCompleto(): string {
    if (this.formData['parrafoSeccion15_religion_completo']) {
      return this.formData['parrafoSeccion15_religion_completo'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || '____';
    
    return `La confesión predominante dentro de la CC ${grupoAISD} es el catolicismo. Según las entrevistas, la permanencia del catolicismo como religión mayoritaria se debe a la presencia de la iglesia, denominada Iglesia Matriz de ${grupoAISD}, y a la no existencia de templos evangélicos u otras confesiones. Esta iglesia es descrita como el principal punto de encuentro religioso para la comunidad y desempeña un papel importante en la vida espiritual de sus habitantes. Otro espacio de valor espiritual es el cementerio, donde los comuneros entierran y visitan a sus difuntos. Este lugar se encuentra ubicado al sur del anexo ${grupoAISD}.`;
  }

  obtenerTextoSeccion16AguaCompleto(): string {
    if (this.formData['parrafoSeccion16_agua_completo']) {
      return this.formData['parrafoSeccion16_agua_completo'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || '____';
    const ojosAgua1 = this.formData['ojosAgua1'] || 'Quinsa Rumi';
    const ojosAgua2 = this.formData['ojosAgua2'] || 'Pallalli';
    const rioAgricola = this.formData['rioAgricola'] || 'Yuracyacu';
    const quebradaAgricola = this.formData['quebradaAgricola'] || 'Pucaccocha';
    
    return `Las fuentes de agua en la CC ${grupoAISD} son diversas, dependiendo del uso que se les dé. Para el consumo humano, el agua se obtiene principalmente de los ojos de agua de ${ojosAgua1} y ${ojosAgua2}. En el caso del anexo ${grupoAISD}, esta agua es almacenada en un reservorio, desde donde se distribuye a las viviendas locales a través de una red básica de distribución. Aunque el abastecimiento cubre las necesidades esenciales de la población, existen desafíos relacionados con la calidad del agua y el mantenimiento de la infraestructura.\n\nEn cuanto al uso agrícola, el agua proviene del río ${rioAgricola} y la quebrada ${quebradaAgricola}, que sirven como una fuente importante de riego. Finalmente, para el uso ganadero, la comunidad se abastece de las diferentes quebradas que se hallan dentro del área de la CC ${grupoAISD}, las cuales proporcionan agua para el sustento del ganado local, principalmente vacunos y ovinos.`;
  }

  obtenerTextoSeccion16RecursosNaturalesCompleto(): string {
    if (this.formData['parrafoSeccion16_recursos_naturales_completo']) {
      return this.formData['parrafoSeccion16_recursos_naturales_completo'];
    }
    
    const grupoAISD = this.obtenerValorConPrefijo('grupoAISD') || '____';
    
    return `En la CC ${grupoAISD}, la tenencia de la tierra es comunal, lo que significa que la comunidad en su conjunto es la propietaria de los terrenos superficiales. Los comuneros no son propietarios individuales de la tierra, sino que la comunidad les cede los terrenos en calidad de posesión para que puedan vivir y trabajar en ellos. Este sistema de tenencia comunal busca asegurar el acceso equitativo a los recursos entre los miembros de la comunidad, aunque limita la posibilidad de transacciones privadas de terrenos.\n\nEn cuanto a los usos del suelo, la mayor parte del territorio está destinado a las actividades agrícolas y ganaderas, las cuales son el principal sustento económico de la población. La tierra es aprovechada para el cultivo de papa, haba y cebada, y para el pastoreo de vacunos y ovinos. Entre los recursos naturales que se aprovechan destacan la queñua, eucalipto, lloque y tola, que son utilizados como leña para la cocción de alimentos o en la construcción.\n\nAdemás, según algunos comuneros, dentro del territorio de la comunidad existen diversas hierbas medicinales con efectos positivos para la salud. Entre ellas destacan la huamanripa, llantén, muña y salvia. Estas son utilizadas en un primer nivel de atención antes de acudir al establecimiento de salud local.`;
  }

  obtenerTextoSeccion30IndicadoresEducacionIntro(): string {
    if (this.formData['parrafoSeccion30_indicadores_educacion_intro']) {
      return this.formData['parrafoSeccion30_indicadores_educacion_intro'];
    }
    
    return `La educación es un pilar fundamental para el desarrollo social y económico de una comunidad. En ese sentido, los indicadores de educación juegan un papel crucial al proporcionar una visión clara del estado actual del sistema educativo y su impacto en la población. Este apartado se centra en dos indicadores clave: el nivel educativo de la población y la tasa de analfabetismo. El análisis de estos indicadores permite comprender mejor las fortalezas y desafíos del sistema educativo local, así como diseñar estrategias efectivas para mejorar la calidad educativa y reducir las desigualdades en el acceso a la educación.`;
  }

  onFieldChange(fieldId: string, value: any) {
    if (fieldId === 'projectName' || fieldId === 'grupoAISD' || fieldId === 'grupoAISI' || fieldId.includes('Punto')) {
      if (value && typeof value === 'string') {
        value = this.capitalizarTexto(value);
      }
    }
    
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    
    const campoConPrefijo = this.obtenerCampoConPrefijo(fieldId);
    
    if (fieldId === 'coordenadasAISD' || fieldId === 'altitudAISD') {
      console.log(`[onFieldChange] ${fieldId} -> ${campoConPrefijo}:`, valorLimpio);
    }
    
    this.formData[campoConPrefijo] = valorLimpio;
    this.datos[campoConPrefijo] = valorLimpio;
    this.formularioService.actualizarDato(campoConPrefijo as keyof FormularioDatos, valorLimpio);
    this.datos = this.formularioService.obtenerDatos();
    
    if (fieldId === 'coordenadasAISD' || fieldId === 'altitudAISD') {
      console.log(`[onFieldChange] Después de guardar - this.datos.${campoConPrefijo}:`, this.datos[campoConPrefijo]);
    }
    
    this.stateService.updateDato(campoConPrefijo as keyof FormularioDatos, valorLimpio);
    
    if (campoConPrefijo.includes('grupoAISD') || campoConPrefijo.includes('centroPobladoAISI')) {
      this.actualizarComponenteSeccion();
      if (this.seccionId.startsWith('3.1.4.A') || this.seccionId.startsWith('3.1.4.B')) {
        setTimeout(() => {
          const component = ViewChildHelper.getComponent('seccion4');
          if (component) {
            component.actualizarDatos();
          }
          this.cdRef.detectChanges();
        }, 0);
      }
    } else {
      this.actualizarComponenteSeccion();
    }
    
    if (fieldId.includes('parrafoSeccion1_principal') || fieldId.includes('objetivoSeccion1_') || fieldId.includes('parrafoSeccion2_') || fieldId.includes('parrafoSeccion3_')) {
      setTimeout(() => {
        const comp1 = ViewChildHelper.getComponent('seccion1');
        if (comp1) {
          comp1.actualizarDatos();
        }
        this.cdRef.detectChanges();
      }, 0);
    }
    
    if (fieldId.includes('tablaAISD2Fila')) {
      if (fieldId.includes('Poblacion') || fieldId.includes('Viviendas')) {
        this.calcularTotalesTablaAISD2();
      }
      if (fieldId.includes('Codigo')) {
        setTimeout(() => {
          this.actualizarFilasActivas();
        }, 100);
      }
    }
    
    this.cdRef.markForCheck();
    setTimeout(() => {
      this.cdRef.detectChanges();
    }, 0);
  }

  getCamposConValorPorDefecto(seccionId: string): string[] {
    const camposConDefault: { [key: string]: string[] } = {
      '3.1.1': [
        'parrafoSeccion1_principal',
        'parrafoSeccion1_4',
        'objetivoSeccion1_1',
        'objetivoSeccion1_2'
      ],
      '3.1.2': [
        'parrafoSeccion2_introduccion',
        'parrafoSeccion2_aisd_completo',
        'parrafoSeccion2_aisi_completo'
      ],
      '3.1.2.A': [
        'parrafoSeccion2_introduccion',
        'parrafoSeccion2_aisd_completo'
      ],
      '3.1.2.B': [
        'parrafoSeccion2_introduccion',
        'parrafoSeccion2_aisi_completo'
      ],
      '3.1.3': [
        'parrafoSeccion3_metodologia',
        'parrafoSeccion3_fuentes_primarias',
        'parrafoSeccion3_fuentes_primarias_cuadro',
        'parrafoSeccion3_fuentes_secundarias'
      ],
      '3.1.3.A': [
        'parrafoSeccion3_metodologia',
        'parrafoSeccion3_fuentes_primarias',
        'parrafoSeccion3_fuentes_primarias_cuadro'
      ],
      '3.1.3.B': [
        'parrafoSeccion3_fuentes_secundarias'
      ],
      '3.1.4': [
        'parrafoSeccion4_introduccion_aisd',
        'parrafoSeccion4_comunidad_completo',
        'parrafoSeccion4_caracterizacion_indicadores'
      ],
      '3.1.4.A': [
        'parrafoSeccion4_introduccion_aisd',
        'parrafoSeccion4_comunidad_completo',
        'parrafoSeccion4_caracterizacion_indicadores'
      ],
      '3.1.4.A.1': [
        'parrafoSeccion4_introduccion_aisd',
        'parrafoSeccion4_comunidad_completo',
        'parrafoSeccion4_caracterizacion_indicadores'
      ],
      '3.1.5': [
        'parrafoSeccion5_institucionalidad'
      ]
    };
    
    const baseSeccionId = seccionId.split('.').slice(0, 3).join('.');
    if (camposConDefault[baseSeccionId]) {
      return camposConDefault[baseSeccionId];
    }
    
    return camposConDefault[seccionId] || [];
  }

  limpiarDatos() {
    if (confirm('¿Está seguro que desea limpiar todos los datos? Esta acción no se puede deshacer.')) {
      this.fieldMapping.clearTestDataFields();
      this.formularioService.limpiarDatos();
      this.datos = this.formularioService.obtenerDatos();
      this.formData = { ...this.datos };
      this.centrosPobladosJSON = [];
      this.jsonFileName = '';
      this.geoInfo = { DPTO: '', PROV: '', DIST: '' };
      this.centroPobladoSeleccionado = null;
      this.comunidadesCampesinas = [];
      this.filasTablaAISD2 = 1;
      this.viviendasCargando.clear();
      this.erroresViviendasRegistrados.clear();
      this.cargarSeccion();
      this.cdRef.detectChanges();
      alert('Todos los datos han sido limpiados.');
    }
  }

  inicializarPoblacionSexo() {
    if (!this.datos['poblacionSexoAISD'] || this.datos['poblacionSexoAISD'].length === 0) {
      this.datos['poblacionSexoAISD'] = [
        { sexo: 'Hombres', casos: 0, porcentaje: '0%' },
        { sexo: 'Mujeres', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('poblacionSexoAISD', this.datos['poblacionSexoAISD']);
      this.cdRef.detectChanges();
    }
  }

  inicializarPoblacionEtario() {
    if (!this.datos['poblacionEtarioAISD'] || this.datos['poblacionEtarioAISD'].length === 0) {
      this.datos['poblacionEtarioAISD'] = [
        { categoria: '0 a 14 años', casos: 0, porcentaje: '0%' },
        { categoria: '15 a 29 años', casos: 0, porcentaje: '0%' },
        { categoria: '30 a 44 años', casos: 0, porcentaje: '0%' },
        { categoria: '45 a 64 años', casos: 0, porcentaje: '0%' },
        { categoria: '65 años a más', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('poblacionEtarioAISD', this.datos['poblacionEtarioAISD']);
      this.cdRef.detectChanges();
    }
  }

  actualizarPoblacionSexo(index: number, field: string, value: any) {
    if (!this.datos['poblacionSexoAISD']) {
      this.inicializarPoblacionSexo();
    }
    if (this.datos['poblacionSexoAISD'][index]) {
      this.datos['poblacionSexoAISD'][index][field] = value;
      if (field === 'casos' && this.datos['tablaAISD2TotalPoblacion']) {
        const total = parseInt(this.datos['tablaAISD2TotalPoblacion']) || 0;
        if (total > 0) {
          const casos = parseInt(value) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2) + '%';
          this.datos['poblacionSexoAISD'][index].porcentaje = porcentaje;
        }
      }
      this.formularioService.actualizarDato('poblacionSexoAISD', this.datos['poblacionSexoAISD']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarPoblacionEtario(index: number, field: string, value: any) {
    if (!this.datos['poblacionEtarioAISD']) {
      this.inicializarPoblacionEtario();
    }
    if (this.datos['poblacionEtarioAISD'][index]) {
      this.datos['poblacionEtarioAISD'][index][field] = value;
      if (field === 'casos' && this.datos['tablaAISD2TotalPoblacion']) {
        const total = parseInt(this.datos['tablaAISD2TotalPoblacion']) || 0;
        if (total > 0) {
          const casos = parseInt(value) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2) + '%';
          this.datos['poblacionEtarioAISD'][index].porcentaje = porcentaje;
        }
      }
      this.formularioService.actualizarDato('poblacionEtarioAISD', this.datos['poblacionEtarioAISD']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  getTotalPoblacionSexo(): string {
    if (!this.datos['poblacionSexoAISD'] || !Array.isArray(this.datos['poblacionSexoAISD'])) {
      return '0';
    }
    const total = this.datos['poblacionSexoAISD'].reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getTotalPoblacionEtario(): string {
    if (!this.datos['poblacionEtarioAISD'] || !Array.isArray(this.datos['poblacionEtarioAISD'])) {
      return '0';
    }
    const total = this.datos['poblacionEtarioAISD'].reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  inicializarInstituciones() {
    if (!this.datos.tablepagina6 || this.datos.tablepagina6.length === 0) {
      this.datos.tablepagina6 = [
        { categoria: '', respuesta: '', nombre: '', comentario: '' }
      ];
      this.formularioService.actualizarDato('tablepagina6', this.datos.tablepagina6);
      this.cdRef.detectChanges();
    }
  }

  agregarInstitucion() {
    if (!this.datos.tablepagina6) {
      this.inicializarInstituciones();
    }
    this.datos.tablepagina6.push({ categoria: '', respuesta: '', nombre: '', comentario: '' });
    this.formularioService.actualizarDato('tablepagina6', this.datos.tablepagina6);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarInstitucion(index: number) {
    if (this.datos.tablepagina6 && this.datos.tablepagina6.length > 1) {
      this.datos.tablepagina6.splice(index, 1);
      this.formularioService.actualizarDato('tablepagina6', this.datos.tablepagina6);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarInstitucion(index: number, field: string, value: any) {
    if (!this.datos.tablepagina6) {
      this.inicializarInstituciones();
    }
    if (this.datos.tablepagina6[index]) {
      this.datos.tablepagina6[index][field] = value;
      this.formularioService.actualizarDato('tablepagina6', this.datos.tablepagina6);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  cargarPETDesdeDemografiaAISD() {
    if (this.actualizandoPETTabla) {
      return;
    }
    
    this.datos = this.formularioService.obtenerDatos();
    this.formData = { ...this.datos };
    
    if (this.datos['petTabla'] && this.datos['petTabla'].length > 0) {
      const tieneDatos = this.datos['petTabla'].some((item: any) => {
        const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
        return item.categoria !== 'Total' && casos > 0;
      });
      if (tieneDatos) {
        return;
      }
    }
    
    this.actualizandoPETTabla = true;

    if (this.datos['poblacionEtarioAISD'] && Array.isArray(this.datos['poblacionEtarioAISD']) && this.datos['poblacionEtarioAISD'].length > 0) {
      const edad15_29 = this.datos['poblacionEtarioAISD'].find((item: any) => 
        item.categoria && item.categoria.includes('15') && item.categoria.includes('29')
      );
      const edad30_44 = this.datos['poblacionEtarioAISD'].find((item: any) => 
        item.categoria && item.categoria.includes('30') && item.categoria.includes('44')
      );
      const edad45_64 = this.datos['poblacionEtarioAISD'].find((item: any) => 
        item.categoria && item.categoria.includes('45') && item.categoria.includes('64')
      );
      const edad65_mas = this.datos['poblacionEtarioAISD'].find((item: any) => 
        item.categoria && (item.categoria.includes('65') || item.categoria.includes('más') || item.categoria.includes('mas'))
      );

      const casos15_29 = edad15_29 ? (typeof edad15_29.casos === 'number' ? edad15_29.casos : parseInt(edad15_29.casos) || 0) : 0;
      const casos30_44 = edad30_44 ? (typeof edad30_44.casos === 'number' ? edad30_44.casos : parseInt(edad30_44.casos) || 0) : 0;
      const casos45_64 = edad45_64 ? (typeof edad45_64.casos === 'number' ? edad45_64.casos : parseInt(edad45_64.casos) || 0) : 0;
      const casos65_mas = edad65_mas ? (typeof edad65_mas.casos === 'number' ? edad65_mas.casos : parseInt(edad65_mas.casos) || 0) : 0;

      const totalPET = casos15_29 + casos30_44 + casos45_64 + casos65_mas;
      const totalPoblacion = parseInt(this.datos['tablaAISD2TotalPoblacion'] || '0') || 0;

      if (totalPET > 0) {
        const calcularPorcentaje = (valor: number, total: number) => {
          return total > 0 
            ? ((valor / total) * 100).toFixed(2).replace('.', ',') + ' %' 
            : '0,00 %';
        };

        this.datos['petTabla'] = [
          {
            categoria: '15 a 29 años',
            casos: casos15_29,
            porcentaje: calcularPorcentaje(casos15_29, totalPET)
          },
          {
            categoria: '30 a 44 años',
            casos: casos30_44,
            porcentaje: calcularPorcentaje(casos30_44, totalPET)
          },
          {
            categoria: '45 a 64 años',
            casos: casos45_64,
            porcentaje: calcularPorcentaje(casos45_64, totalPET)
          },
          {
            categoria: '65 años a más',
            casos: casos65_mas,
            porcentaje: calcularPorcentaje(casos65_mas, totalPET)
          },
          {
            categoria: 'Total',
            casos: totalPET,
            porcentaje: totalPoblacion > 0 ? calcularPorcentaje(totalPET, totalPoblacion) : '100,00 %'
          }
        ];

        this.formularioService.actualizarDato('petTabla', this.datos['petTabla']);
        this.datos = this.formularioService.obtenerDatos();
        this.actualizarComponenteSeccion();
        
        setTimeout(() => {
          this.actualizandoPETTabla = false;
          if (this.seccion7) {
            this.seccion7.actualizarDatos();
          }
          this.cdRef.detectChanges();
        }, 50);
        return;
      }
    }

    const codigosCPP = this.obtenerCodigosCPPDeTablaAISD2();
    
    if (codigosCPP.length > 0) {
      this.dataService.getPoblacionByCpp(codigosCPP).subscribe({
        next: (response) => {
          if (response && response.success && response.data && response.data.poblacion) {
            const poblacion = response.data.poblacion;
            
            const edad15_29 = poblacion.edad_15_29 || 0;
            const edad30_44 = poblacion.edad_30_44 || 0;
            const edad45_64 = poblacion.edad_45_64 || 0;
            const edad65_mas = poblacion.edad_65_mas || 0;
            
            const totalPoblacion = poblacion.total_poblacion || 0;
            const totalPET = edad15_29 + edad30_44 + edad45_64 + edad65_mas;
            
            if (totalPET === 0) {
              this.actualizandoPETTabla = false;
              return;
            }
            
            const calcularPorcentaje = (valor: number, total: number) => {
              return total > 0 
                ? ((valor / total) * 100).toFixed(2).replace('.', ',') + ' %' 
                : '0,00 %';
            };
            
            this.datos['petTabla'] = [
              {
                categoria: '15 a 29 años',
                casos: edad15_29,
                porcentaje: calcularPorcentaje(edad15_29, totalPET)
              },
              {
                categoria: '30 a 44 años',
                casos: edad30_44,
                porcentaje: calcularPorcentaje(edad30_44, totalPET)
              },
              {
                categoria: '45 a 64 años',
                casos: edad45_64,
                porcentaje: calcularPorcentaje(edad45_64, totalPET)
              },
              {
                categoria: '65 años a más',
                casos: edad65_mas,
                porcentaje: calcularPorcentaje(edad65_mas, totalPET)
              },
              {
                categoria: 'Total',
                casos: totalPET,
                porcentaje: totalPoblacion > 0 ? calcularPorcentaje(totalPET, totalPoblacion) : '100,00 %'
              }
            ];
            
            this.formularioService.actualizarDato('petTabla', this.datos['petTabla']);
            this.datos = this.formularioService.obtenerDatos();
            this.actualizarComponenteSeccion();
            
            setTimeout(() => {
              this.actualizandoPETTabla = false;
              if (this.seccion7) {
                this.seccion7.actualizarDatos();
              }
              this.cdRef.detectChanges();
            }, 50);
          }
        },
        error: (error) => {
          this.actualizandoPETTabla = false;
          if (this.datos['poblacionEtarioAISD'] && Array.isArray(this.datos['poblacionEtarioAISD']) && this.datos['poblacionEtarioAISD'].length > 0) {
            const edad15_29 = this.datos['poblacionEtarioAISD'].find((item: any) => 
              item.categoria && item.categoria.includes('15') && item.categoria.includes('29')
            );
            const edad30_44 = this.datos['poblacionEtarioAISD'].find((item: any) => 
              item.categoria && item.categoria.includes('30') && item.categoria.includes('44')
            );
            const edad45_64 = this.datos['poblacionEtarioAISD'].find((item: any) => 
              item.categoria && item.categoria.includes('45') && item.categoria.includes('64')
            );
            const edad65_mas = this.datos['poblacionEtarioAISD'].find((item: any) => 
              item.categoria && (item.categoria.includes('65') || item.categoria.includes('más') || item.categoria.includes('mas'))
            );

            const casos15_29 = edad15_29 ? (typeof edad15_29.casos === 'number' ? edad15_29.casos : parseInt(edad15_29.casos) || 0) : 0;
            const casos30_44 = edad30_44 ? (typeof edad30_44.casos === 'number' ? edad30_44.casos : parseInt(edad30_44.casos) || 0) : 0;
            const casos45_64 = edad45_64 ? (typeof edad45_64.casos === 'number' ? edad45_64.casos : parseInt(edad45_64.casos) || 0) : 0;
            const casos65_mas = edad65_mas ? (typeof edad65_mas.casos === 'number' ? edad65_mas.casos : parseInt(edad65_mas.casos) || 0) : 0;

            const totalPET = casos15_29 + casos30_44 + casos45_64 + casos65_mas;
            const totalPoblacion = parseInt(this.datos['tablaAISD2TotalPoblacion'] || '0') || 0;

            if (totalPET > 0) {
              const calcularPorcentaje = (valor: number, total: number) => {
                return total > 0 
                  ? ((valor / total) * 100).toFixed(2).replace('.', ',') + ' %' 
                  : '0,00 %';
              };
              
              this.datos['petTabla'] = [
                {
                  categoria: '15 a 29 años',
                  casos: casos15_29,
                  porcentaje: calcularPorcentaje(casos15_29, totalPET)
                },
                {
                  categoria: '30 a 44 años',
                  casos: casos30_44,
                  porcentaje: calcularPorcentaje(casos30_44, totalPET)
                },
                {
                  categoria: '45 a 64 años',
                  casos: casos45_64,
                  porcentaje: calcularPorcentaje(casos45_64, totalPET)
                },
                {
                  categoria: '65 años a más',
                  casos: casos65_mas,
                  porcentaje: calcularPorcentaje(casos65_mas, totalPET)
                },
                {
                  categoria: 'Total',
                  casos: totalPET,
                  porcentaje: totalPoblacion > 0 ? calcularPorcentaje(totalPET, totalPoblacion) : '100,00 %'
                }
              ];
              
              this.formularioService.actualizarDato('petTabla', this.datos['petTabla']);
              this.datos = this.formularioService.obtenerDatos();
              this.actualizarComponenteSeccion();
              
              setTimeout(() => {
                this.actualizandoPETTabla = false;
                this.cdRef.detectChanges();
              }, 50);
            }
          }
        }
      });
      return;
    }

    this.actualizandoPETTabla = false;
    
    if (this.datos['poblacionEtarioAISD'] && Array.isArray(this.datos['poblacionEtarioAISD']) && this.datos['poblacionEtarioAISD'].length > 0) {
      const edad15_29 = this.datos['poblacionEtarioAISD'].find((item: any) => 
        item.categoria && item.categoria.includes('15') && item.categoria.includes('29')
      );
      const edad30_44 = this.datos['poblacionEtarioAISD'].find((item: any) => 
        item.categoria && item.categoria.includes('30') && item.categoria.includes('44')
      );
      const edad45_64 = this.datos['poblacionEtarioAISD'].find((item: any) => 
        item.categoria && item.categoria.includes('45') && item.categoria.includes('64')
      );
      const edad65_mas = this.datos['poblacionEtarioAISD'].find((item: any) => 
        item.categoria && (item.categoria.includes('65') || item.categoria.includes('más') || item.categoria.includes('mas'))
      );

      const casos15_29 = edad15_29 ? (typeof edad15_29.casos === 'number' ? edad15_29.casos : parseInt(edad15_29.casos) || 0) : 0;
      const casos30_44 = edad30_44 ? (typeof edad30_44.casos === 'number' ? edad30_44.casos : parseInt(edad30_44.casos) || 0) : 0;
      const casos45_64 = edad45_64 ? (typeof edad45_64.casos === 'number' ? edad45_64.casos : parseInt(edad45_64.casos) || 0) : 0;
      const casos65_mas = edad65_mas ? (typeof edad65_mas.casos === 'number' ? edad65_mas.casos : parseInt(edad65_mas.casos) || 0) : 0;

      const totalPET = casos15_29 + casos30_44 + casos45_64 + casos65_mas;
      const totalPoblacion = parseInt(this.datos['tablaAISD2TotalPoblacion'] || '0') || 0;

      if (totalPET > 0) {
        this.actualizandoPETTabla = true;
        const calcularPorcentaje = (valor: number, total: number) => {
          return total > 0 
            ? ((valor / total) * 100).toFixed(2).replace('.', ',') + ' %' 
            : '0,00 %';
        };

        this.datos['petTabla'] = [
          {
            categoria: '15 a 29 años',
            casos: casos15_29,
            porcentaje: calcularPorcentaje(casos15_29, totalPET)
          },
          {
            categoria: '30 a 44 años',
            casos: casos30_44,
            porcentaje: calcularPorcentaje(casos30_44, totalPET)
          },
          {
            categoria: '45 a 64 años',
            casos: casos45_64,
            porcentaje: calcularPorcentaje(casos45_64, totalPET)
          },
          {
            categoria: '65 años a más',
            casos: casos65_mas,
            porcentaje: calcularPorcentaje(casos65_mas, totalPET)
          },
          {
            categoria: 'Total',
            casos: totalPET,
            porcentaje: totalPoblacion > 0 ? calcularPorcentaje(totalPET, totalPoblacion) : '100,00 %'
          }
        ];

        this.formularioService.actualizarDato('petTabla', this.datos['petTabla']);
        this.datos = this.formularioService.obtenerDatos();
        this.actualizarComponenteSeccion();
        
        setTimeout(() => {
          this.actualizandoPETTabla = false;
          this.cdRef.detectChanges();
        }, 50);
        return;
      } else {
        this.actualizandoPETTabla = false;
      }
    }

    if (this.seccionId === '3.1.4.A.1.3') {
      setTimeout(() => {
        this.cargarDatosDemografiaAISDSiDisponible();
        setTimeout(() => {
          this.cargarPETDesdeDemografiaAISD();
        }, 1000);
      }, 300);
    } else {
      this.actualizandoPETTabla = false;
    }
  }

  obtenerCodigosCPPDeTablaAISD2(): string[] {
    const codigos: string[] = [];
    this.datos = this.formularioService.obtenerDatos();
    this.formData = { ...this.datos };
    const prefijo = this.obtenerPrefijoGrupo();
    
    const maxFilas = Math.max(this.filasTablaAISD2 || 1, 20);
    
    for (let i = 1; i <= maxFilas; i++) {
      const campoCodigo = `tablaAISD2Fila${i}Codigo${prefijo}`;
      const codigo = this.formData[campoCodigo] || this.datos[campoCodigo] || 
                     this.formData[`tablaAISD2Fila${i}Codigo`] || this.datos[`tablaAISD2Fila${i}Codigo`] || '';
      if (codigo && codigo.trim() !== '' && codigo !== '____') {
        codigos.push(codigo.trim());
      }
    }
    
    if (codigos.length === 0) {
      const filasActivas = this.formularioService.obtenerFilasActivasTablaAISD2(prefijo);
      if (filasActivas.length > 0) {
        return filasActivas;
      }
      
      const codigosCampo = prefijo ? `codigos${prefijo}` : 'codigos';
      if (this.datos[codigosCampo] && Array.isArray(this.datos[codigosCampo]) && this.datos[codigosCampo].length > 0) {
        return this.datos[codigosCampo];
      }
      
      const centrosPobladosComunidad = this.obtenerCentrosPobladosDeComunidadCampesina();
      if (centrosPobladosComunidad.length > 0) {
        return centrosPobladosComunidad;
      }
      
      if (this.datos['codigos'] && Array.isArray(this.datos['codigos']) && this.datos['codigos'].length > 0) {
        return this.datos['codigos'];
      }
    }
    
    return codigos;
  }

  obtenerCentrosPobladosDeComunidadCampesina(): string[] {
    const prefijo = this.obtenerPrefijoGrupo();
    if (!prefijo || !prefijo.startsWith('_A')) {
      return [];
    }
    
    this.datos = this.formularioService.obtenerDatos();
    this.comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
    
    const match = prefijo.match(/_A(\d+)/);
    if (!match) {
      return [];
    }
    
    const indiceComunidad = parseInt(match[1]) - 1;
    
    if (indiceComunidad >= 0 && indiceComunidad < this.comunidadesCampesinas.length) {
      const comunidad = this.comunidadesCampesinas[indiceComunidad];
      if (comunidad && comunidad.centrosPobladosSeleccionados && Array.isArray(comunidad.centrosPobladosSeleccionados)) {
        const codigos = comunidad.centrosPobladosSeleccionados.filter((codigo: string) => codigo && codigo.trim() !== '');
        return codigos;
      }
    }
    
    return [];
  }

  inicializarPET() {
    if (!this.datos['petTabla'] || this.datos['petTabla'].length === 0) {
      this.datos['petTabla'] = [
        { categoria: '15 a 29 años', casos: 0, porcentaje: '0%' },
        { categoria: '30 a 44 años', casos: 0, porcentaje: '0%' },
        { categoria: '45 a 64 años', casos: 0, porcentaje: '0%' },
        { categoria: '65 años a más', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('petTabla', this.datos['petTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarPET() {
    if (!this.datos['petTabla']) {
      this.inicializarPET();
    }
    const totalIndex = this.datos['petTabla'].findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['petTabla'].splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['petTabla'].push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('petTabla', this.datos['petTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPET(index: number) {
    if (this.datos['petTabla'] && this.datos['petTabla'].length > 1 && this.datos['petTabla'][index].categoria !== 'Total') {
      this.datos['petTabla'].splice(index, 1);
      this.formularioService.actualizarDato('petTabla', this.datos['petTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  onPETTablaChange(nuevaTabla: any[]) {
    if (this.actualizandoPETTabla) {
      return;
    }
    
    const tablaActual = this.datos['petTabla'] || [];
    const sonIguales = JSON.stringify(tablaActual) === JSON.stringify(nuevaTabla);
    
    if (sonIguales) {
      return;
    }
    
    this.actualizandoPETTabla = true;
    this.datos['petTabla'] = nuevaTabla;
    this.formularioService.actualizarDato('petTabla', nuevaTabla);
    this.stateService.updateDato('petTabla', nuevaTabla);
    this.actualizarComponenteSeccion();
    
    setTimeout(() => {
      this.actualizandoPETTabla = false;
    }, 100);
  }

  onPEATablaChange(nuevaTabla: any[]) {
    this.datos['peaTabla'] = nuevaTabla;
    this.formularioService.actualizarDatos(this.datos);
    this.stateService.updateDato('peaTabla', nuevaTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  actualizarPET(index: number, field: string, value: any) {
    if (!this.datos['petTabla']) {
      this.inicializarPET();
    }
    if (this.datos['petTabla'][index]) {
      this.datos['petTabla'][index][field] = value;
      if (field === 'casos' && this.datos['petTabla'][index].categoria !== 'Total') {
        const totalCasos = this.datos['petTabla']
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos['petTabla'].find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          const totalPorcentaje = this.datos['tablaAISD2TotalPoblacion'] ? 
            ((totalCasos / parseInt(this.datos['tablaAISD2TotalPoblacion'])) * 100).toFixed(2) + '%' : '100,00 %';
          totalItem.porcentaje = totalPorcentaje;
        }
      }
      this.formularioService.actualizarDato('petTabla', this.datos['petTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarPEA() {
    if (!this.datos['peaTabla'] || this.datos['peaTabla'].length === 0) {
      this.datos['peaTabla'] = [
        { categoria: 'PEA', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' },
        { categoria: 'No PEA', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('peaTabla', this.datos['peaTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarPEA() {
    if (!this.datos['peaTabla']) {
      this.inicializarPEA();
    }
    const totalIndex = this.datos['peaTabla'].findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['peaTabla'].splice(totalIndex, 0, { categoria: '', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['peaTabla'].push({ categoria: '', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('peaTabla', this.datos['peaTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPEA(index: number) {
    if (this.datos['peaTabla'] && this.datos['peaTabla'].length > 1 && this.datos['peaTabla'][index].categoria !== 'Total') {
      this.datos['peaTabla'].splice(index, 1);
      this.formularioService.actualizarDato('peaTabla', this.datos['peaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarPEA(index: number, field: string, value: any) {
    if (!this.datos['peaTabla']) {
      this.inicializarPEA();
    }
    if (this.datos['peaTabla'][index]) {
      this.datos['peaTabla'][index][field] = value;
      this.formularioService.actualizarDato('peaTabla', this.datos['peaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarPEAOcupada() {
    if (!this.datos['peaOcupadaTabla'] || this.datos['peaOcupadaTabla'].length === 0) {
      this.datos['peaOcupadaTabla'] = [
        { categoria: 'PEA Ocupada', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' },
        { categoria: 'PEA Desocupada', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('peaOcupadaTabla', this.datos['peaOcupadaTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarPEAOcupada() {
    if (!this.datos['peaOcupadaTabla']) {
      this.inicializarPEAOcupada();
    }
    const totalIndex = this.datos['peaOcupadaTabla'].findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['peaOcupadaTabla'].splice(totalIndex, 0, { categoria: '', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['peaOcupadaTabla'].push({ categoria: '', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('peaOcupadaTabla', this.datos['peaOcupadaTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPEAOcupada(index: number) {
    if (this.datos['peaOcupadaTabla'] && this.datos['peaOcupadaTabla'].length > 1 && this.datos['peaOcupadaTabla'][index].categoria !== 'Total') {
      this.datos['peaOcupadaTabla'].splice(index, 1);
      this.formularioService.actualizarDato('peaOcupadaTabla', this.datos['peaOcupadaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarPEAOcupada(index: number, field: string, value: any) {
    if (!this.datos['peaOcupadaTabla']) {
      this.inicializarPEAOcupada();
    }
    if (this.datos['peaOcupadaTabla'][index]) {
      this.datos['peaOcupadaTabla'][index][field] = value;
      this.formularioService.actualizarDato('peaOcupadaTabla', this.datos['peaOcupadaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  cargarDatosPEAAISD() {
    const distrito = this.formData['distritoSeleccionado'] || this.datos['distritoSeleccionado'];
    if (!distrito) {
      return;
    }

    this.dataService.getPoblacionByDistrito(distrito.toUpperCase()).subscribe({
      next: (poblacionResponse) => {
        let totalHombresDistrito = 0;
        let totalMujeresDistrito = 0;
        let poblacionDistritalTotal = 0;

        if (poblacionResponse && poblacionResponse.success && Array.isArray(poblacionResponse.data)) {
          poblacionDistritalTotal = poblacionResponse.data.reduce((sum: number, cp: CentroPoblado) => {
            totalHombresDistrito += cp.hombres || 0;
            totalMujeresDistrito += cp.mujeres || 0;
            return sum + (cp.total || 0);
          }, 0);
        }

        this.datos['poblacionDistritalCahuacho'] = poblacionDistritalTotal.toString();

        this.dataService.getPEAByDistrito(distrito.toUpperCase()).subscribe({
          next: (response) => {
            if (response && response.success && response.data) {
              const data = response.data;
              
              const totalPEA = data.pea || 0;
              const totalNoPEA = data.no_pea || 0;
              const totalPET = totalPEA + totalNoPEA;
              
              this.datos['petDistritalCahuacho'] = totalPET.toString();
              
              const totalOcupada = data.ocupada || 0;
              const totalDesocupada = data.desocupada || 0;
              
              const proporcionHombres = poblacionDistritalTotal > 0 ? totalHombresDistrito / poblacionDistritalTotal : 0.5;
              const proporcionMujeres = 1 - proporcionHombres;
              
              const hombresPEA = Math.round(totalPEA * proporcionHombres);
              const mujeresPEA = totalPEA - hombresPEA;
              const hombresNoPEA = Math.round(totalNoPEA * proporcionHombres);
              const mujeresNoPEA = totalNoPEA - hombresNoPEA;
              
              const totalHombresPET = hombresPEA + hombresNoPEA;
              const totalMujeresPET = mujeresPEA + mujeresNoPEA;
              
              const calcularPorcentajeSexo = (valor: number, total: number) => {
                return total > 0 ? ((valor / total) * 100).toFixed(2).replace('.', ',') + ' %' : '0 %';
              };
              
              this.datos['peaTabla'] = [
                {
                  categoria: 'PEA',
                  hombres: hombresPEA,
                  porcentajeHombres: calcularPorcentajeSexo(hombresPEA, totalHombresPET),
                  mujeres: mujeresPEA,
                  porcentajeMujeres: calcularPorcentajeSexo(mujeresPEA, totalMujeresPET),
                  casos: totalPEA,
                  porcentaje: data.porcentaje_pea || '0%'
                },
                {
                  categoria: 'No PEA',
                  hombres: hombresNoPEA,
                  porcentajeHombres: calcularPorcentajeSexo(hombresNoPEA, totalHombresPET),
                  mujeres: mujeresNoPEA,
                  porcentajeMujeres: calcularPorcentajeSexo(mujeresNoPEA, totalMujeresPET),
                  casos: totalNoPEA,
                  porcentaje: data.porcentaje_no_pea || '0%'
                },
                {
                  categoria: 'Total',
                  hombres: totalHombresPET,
                  porcentajeHombres: '100,00 %',
                  mujeres: totalMujeresPET,
                  porcentajeMujeres: '100,00 %',
                  casos: totalPET,
                  porcentaje: '100,00 %'
                }
              ];
              
              const hombresOcupada = Math.round(totalOcupada * proporcionHombres);
              const mujeresOcupada = totalOcupada - hombresOcupada;
              const hombresDesocupada = Math.round(totalDesocupada * proporcionHombres);
              const mujeresDesocupada = totalDesocupada - hombresDesocupada;
              
              const totalHombresPEA = hombresOcupada + hombresDesocupada;
              const totalMujeresPEA = mujeresOcupada + mujeresDesocupada;
              
              this.datos['peaOcupadaTabla'] = [
                {
                  categoria: 'PEA Ocupada',
                  hombres: hombresOcupada,
                  porcentajeHombres: calcularPorcentajeSexo(hombresOcupada, totalHombresPEA),
                  mujeres: mujeresOcupada,
                  porcentajeMujeres: calcularPorcentajeSexo(mujeresOcupada, totalMujeresPEA),
                  casos: totalOcupada,
                  porcentaje: data.porcentaje_ocupada || '0%'
                },
                {
                  categoria: 'PEA Desocupada',
                  hombres: hombresDesocupada,
                  porcentajeHombres: calcularPorcentajeSexo(hombresDesocupada, totalHombresPEA),
                  mujeres: mujeresDesocupada,
                  porcentajeMujeres: calcularPorcentajeSexo(mujeresDesocupada, totalMujeresPEA),
                  casos: totalDesocupada,
                  porcentaje: data.porcentaje_desocupada || '0%'
                },
                {
                  categoria: 'Total',
                  hombres: totalHombresPEA,
                  porcentajeHombres: '100,00 %',
                  mujeres: totalMujeresPEA,
                  porcentajeMujeres: '100,00 %',
                  casos: totalPEA,
                  porcentaje: '100,00 %'
                }
              ];
              
              this.formularioService.actualizarDato('poblacionDistritalCahuacho', this.datos['poblacionDistritalCahuacho']);
              this.formularioService.actualizarDato('petDistritalCahuacho', this.datos['petDistritalCahuacho']);
              this.formularioService.actualizarDato('peaTabla', this.datos['peaTabla']);
              this.formularioService.actualizarDato('peaOcupadaTabla', this.datos['peaOcupadaTabla']);
              this.actualizarComponenteSeccion();
              this.cdRef.detectChanges();
            }
          },
          error: (error) => {
            console.error('Error al cargar datos PEA:', error);
            // Silenciar error - usando datos mock
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar población distrital:', error);
        // Silenciar error - usando datos mock
      }
    });
  }

  inicializarPEAOcupaciones() {
    if (!this.datos['peaOcupacionesTabla'] || this.datos['peaOcupacionesTabla'].length === 0) {
      this.datos['peaOcupacionesTabla'] = [
        { categoria: 'Trabajador independiente o por cuenta propia', casos: 0, porcentaje: '0%' },
        { categoria: 'Obrero', casos: 0, porcentaje: '0%' },
        { categoria: 'Empleado', casos: 0, porcentaje: '0%' },
        { categoria: 'Empleador o patrono', casos: 0, porcentaje: '0%' },
        { categoria: 'Trabajador en negocio de un familiar', casos: 0, porcentaje: '0%' },
        { categoria: 'Trabajador del hogar', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('peaOcupacionesTabla', this.datos['peaOcupacionesTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarPEAOcupaciones() {
    if (!this.datos['peaOcupacionesTabla']) {
      this.inicializarPEAOcupaciones();
    }
    const totalIndex = this.datos['peaOcupacionesTabla'].findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['peaOcupacionesTabla'].splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['peaOcupacionesTabla'].push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('peaOcupacionesTabla', this.datos['peaOcupacionesTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPEAOcupaciones(index: number) {
    if (this.datos['peaOcupacionesTabla'] && this.datos['peaOcupacionesTabla'].length > 1 && this.datos['peaOcupacionesTabla'][index].categoria !== 'Total') {
      this.datos['peaOcupacionesTabla'].splice(index, 1);
      this.formularioService.actualizarDato('peaOcupacionesTabla', this.datos['peaOcupacionesTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarPEAOcupaciones(index: number, field: string, value: any) {
    if (!this.datos['peaOcupacionesTabla']) {
      this.inicializarPEAOcupaciones();
    }
    if (this.datos['peaOcupacionesTabla'][index]) {
      this.datos['peaOcupacionesTabla'][index][field] = value;
      if (field === 'casos' && this.datos['peaOcupacionesTabla'][index].categoria !== 'Total') {
        const totalCasos = this.datos['peaOcupacionesTabla']
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos['peaOcupacionesTabla'].find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          totalItem.porcentaje = '100,00 %';
        }
      }
      this.formularioService.actualizarDato('peaOcupacionesTabla', this.datos['peaOcupacionesTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarPoblacionPecuaria() {
    if (!this.datos['poblacionPecuariaTabla'] || this.datos['poblacionPecuariaTabla'].length === 0) {
      this.datos['poblacionPecuariaTabla'] = [
        { especie: 'Vacuno', cantidadPromedio: '4 – 50', ventaUnidad: 'S/. 1 200 – S/. 1 500' },
        { especie: 'Ovino', cantidadPromedio: '5 – 7', ventaUnidad: 'S/. 180 – S/. 200' },
        { especie: 'Gallinas', cantidadPromedio: '5 – 10', ventaUnidad: 'S/. 20 – S/. 30' },
        { especie: 'Cuyes', cantidadPromedio: '15 – 20', ventaUnidad: 'S/. 25 – S/. 30' }
      ];
      this.formularioService.actualizarDato('poblacionPecuariaTabla', this.datos['poblacionPecuariaTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarPoblacionPecuaria() {
    if (!this.datos['poblacionPecuariaTabla']) {
      this.inicializarPoblacionPecuaria();
    }
    this.datos['poblacionPecuariaTabla'].push({ especie: '', cantidadPromedio: '', ventaUnidad: '' });
    this.formularioService.actualizarDato('poblacionPecuariaTabla', this.datos['poblacionPecuariaTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPoblacionPecuaria(index: number) {
    if (this.datos['poblacionPecuariaTabla'] && this.datos['poblacionPecuariaTabla'].length > 1) {
      this.datos['poblacionPecuariaTabla'].splice(index, 1);
      this.formularioService.actualizarDato('poblacionPecuariaTabla', this.datos['poblacionPecuariaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarPoblacionPecuaria(index: number, field: string, value: any) {
    if (!this.datos['poblacionPecuariaTabla']) {
      this.inicializarPoblacionPecuaria();
    }
    if (this.datos['poblacionPecuariaTabla'][index]) {
      this.datos['poblacionPecuariaTabla'][index][field] = value;
      this.formularioService.actualizarDato('poblacionPecuariaTabla', this.datos['poblacionPecuariaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarCaracteristicasAgricultura() {
    if (!this.datos['caracteristicasAgriculturaTabla'] || this.datos['caracteristicasAgriculturaTabla'].length === 0) {
      this.datos['caracteristicasAgriculturaTabla'] = [
        { categoria: 'Destino de la producción (aprox.)', detalle: 'Autoconsumo: 95 %\nVenta: 5 %' },
        { categoria: 'Tipos de Cultivo', detalle: 'Papa, haba, cebada, avena, alfalfa' },
        { categoria: 'Cantidad de área para cultivar (en Ha) por familia', detalle: '1 ½ ha.' },
        { categoria: 'Tipo de Riego', detalle: 'Gravedad' },
        { categoria: 'Mercado o lugares de venta', detalle: 'Comunalmente\nCapital provincial de Caravelí' },
        { categoria: 'Problemáticas principales', detalle: 'Heladas\nSequías\nPlagas y enfermedades' }
      ];
      this.formularioService.actualizarDato('caracteristicasAgriculturaTabla', this.datos['caracteristicasAgriculturaTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarCaracteristicasAgricultura() {
    if (!this.datos['caracteristicasAgriculturaTabla']) {
      this.inicializarCaracteristicasAgricultura();
    }
    this.datos['caracteristicasAgriculturaTabla'].push({ categoria: '', detalle: '' });
    this.formularioService.actualizarDato('caracteristicasAgriculturaTabla', this.datos['caracteristicasAgriculturaTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCaracteristicasAgricultura(index: number) {
    if (this.datos['caracteristicasAgriculturaTabla'] && this.datos['caracteristicasAgriculturaTabla'].length > 1) {
      this.datos['caracteristicasAgriculturaTabla'].splice(index, 1);
      this.formularioService.actualizarDato('caracteristicasAgriculturaTabla', this.datos['caracteristicasAgriculturaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarCaracteristicasAgricultura(index: number, field: string, value: any) {
    if (!this.datos['caracteristicasAgriculturaTabla']) {
      this.inicializarCaracteristicasAgricultura();
    }
    if (this.datos['caracteristicasAgriculturaTabla'][index]) {
      this.datos['caracteristicasAgriculturaTabla'][index][field] = value;
      this.formularioService.actualizarDato('caracteristicasAgriculturaTabla', this.datos['caracteristicasAgriculturaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  getFotografiasGanaderiaForm(): any[] {
    if (this.fotosGanaderia.length === 0) {
      for (let i = 1; i <= 2; i++) {
        const imagenKey = `fotografiaGanaderia${i}Imagen`;
        const preview = this.datos[imagenKey] || null;
        this.fotosGanaderia.push({
          titulo: this.datos[`fotografiaGanaderia${i}Titulo`] || '',
          fuente: this.datos[`fotografiaGanaderia${i}Fuente`] || '',
          preview: preview,
          dragOver: false
        });
      }
    } else {
      for (let i = 0; i < this.fotosGanaderia.length; i++) {
        const imagenKey = `fotografiaGanaderia${i + 1}Imagen`;
        if (!this.fotosGanaderia[i].preview && this.datos[imagenKey]) {
          this.fotosGanaderia[i].preview = this.datos[imagenKey];
        }
        if (!this.fotosGanaderia[i].titulo && this.datos[`fotografiaGanaderia${i + 1}Titulo`]) {
          this.fotosGanaderia[i].titulo = this.datos[`fotografiaGanaderia${i + 1}Titulo`];
        }
        if (!this.fotosGanaderia[i].fuente && this.datos[`fotografiaGanaderia${i + 1}Fuente`]) {
          this.fotosGanaderia[i].fuente = this.datos[`fotografiaGanaderia${i + 1}Fuente`];
        }
      }
    }
    return this.fotosGanaderia;
  }

  actualizarFotoGanaderia(index: number, field: string, value: any) {
    if (field === 'titulo') {
      this.onFieldChange(`fotografiaGanaderia${index + 1}Titulo`, value);
    } else if (field === 'fuente') {
      this.onFieldChange(`fotografiaGanaderia${index + 1}Fuente`, value);
    } else if (field === 'imagen') {
      this.onFieldChange(`fotografiaGanaderia${index + 1}Imagen`, value);
      if (this.fotosGanaderia[index]) {
        this.fotosGanaderia[index].preview = value;
      }
    }
  }

  agregarFotoGanaderia() {
    const nuevoIndex = this.fotosGanaderia.length + 1;
    this.fotosGanaderia.push({
      titulo: '',
      fuente: 'GEADES, 2024',
      preview: null,
      dragOver: false
    });
  }

  eliminarFotoGanaderia(index: number) {
    if (this.fotosGanaderia.length > 1) {
      const fotoKey = `fotografiaGanaderia${index + 1}`;
      this.onFieldChange(`${fotoKey}Titulo`, '');
      this.onFieldChange(`${fotoKey}Fuente`, '');
      this.onFieldChange(`${fotoKey}Imagen`, '');
      this.fotosGanaderia.splice(index, 1);
      this.cdRef.detectChanges();
    }
  }

  getFotografiasAgriculturaForm(): any[] {
    if (this.fotosAgricultura.length === 0) {
      for (let i = 1; i <= 2; i++) {
        const imagenKey = `fotografiaAgricultura${i}Imagen`;
        const preview = this.datos[imagenKey] || null;
        this.fotosAgricultura.push({
          titulo: this.datos[`fotografiaAgricultura${i}Titulo`] || '',
          fuente: this.datos[`fotografiaAgricultura${i}Fuente`] || '',
          preview: preview,
          dragOver: false
        });
      }
    } else {
      for (let i = 0; i < this.fotosAgricultura.length; i++) {
        const imagenKey = `fotografiaAgricultura${i + 1}Imagen`;
        if (!this.fotosAgricultura[i].preview && this.datos[imagenKey]) {
          this.fotosAgricultura[i].preview = this.datos[imagenKey];
        }
        if (!this.fotosAgricultura[i].titulo && this.datos[`fotografiaAgricultura${i + 1}Titulo`]) {
          this.fotosAgricultura[i].titulo = this.datos[`fotografiaAgricultura${i + 1}Titulo`];
        }
        if (!this.fotosAgricultura[i].fuente && this.datos[`fotografiaAgricultura${i + 1}Fuente`]) {
          this.fotosAgricultura[i].fuente = this.datos[`fotografiaAgricultura${i + 1}Fuente`];
        }
      }
    }
    return this.fotosAgricultura;
  }

  actualizarFotoAgricultura(index: number, field: string, value: any) {
    if (field === 'titulo') {
      this.onFieldChange(`fotografiaAgricultura${index + 1}Titulo`, value);
    } else if (field === 'fuente') {
      this.onFieldChange(`fotografiaAgricultura${index + 1}Fuente`, value);
    } else if (field === 'imagen') {
      this.onFieldChange(`fotografiaAgricultura${index + 1}Imagen`, value);
      if (this.fotosAgricultura[index]) {
        this.fotosAgricultura[index].preview = value;
      }
    }
  }

  agregarFotoAgricultura() {
    const nuevoIndex = this.fotosAgricultura.length + 1;
    this.fotosAgricultura.push({
      titulo: '',
      fuente: 'GEADES, 2024',
      preview: null,
      dragOver: false
    });
  }

  eliminarFotoAgricultura(index: number) {
    if (this.fotosAgricultura.length > 1) {
      const fotoKey = `fotografiaAgricultura${index + 1}`;
      this.onFieldChange(`${fotoKey}Titulo`, '');
      this.onFieldChange(`${fotoKey}Fuente`, '');
      this.onFieldChange(`${fotoKey}Imagen`, '');
      this.fotosAgricultura.splice(index, 1);
      this.cdRef.detectChanges();
    }
  }

  getFotografiasGanaderiaFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaGanaderia',
      'fotosGanaderia',
      'Ganado vacuno en la CC ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024'
    );
  }

  actualizarFotografiasGanaderiaFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaGanaderia',
      'fotografiasGanaderiaFormMulti',
      'Ganado vacuno en la CC ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024'
    );
  }

  onFotografiasGanaderiaChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaGanaderia',
      'fotografiasGanaderiaFormMulti',
      'Ganado vacuno en la CC ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024'
    );
  }

  getFotografiasAgriculturaFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaAgricultura',
      'fotosAgricultura',
      'Parcela agrícola en el anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024'
    );
  }

  actualizarFotografiasAgriculturaFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaAgricultura',
      'fotografiasAgriculturaFormMulti',
      'Parcela agrícola en el anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024'
    );
  }

  onFotografiasAgriculturaChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaAgricultura',
      'fotografiasAgriculturaFormMulti',
      'Parcela agrícola en el anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024'
    );
  }

  getFotografiasEducacionFormMulti(): any[] {
    const fotos = this.getFotografiasEducacionForm();
    return fotos.map((foto, index) => ({
      titulo: foto.titulo || (index === 0 ? 'Infraestructura de la IE ' + (this.datos.grupoAISD || 'Ayroca') : 'Infraestructura de la IE N°40270'),
      fuente: foto.fuente || 'GEADES, 2024',
      imagen: foto.preview || null,
      id: `educacion-${index}`
    }));
  }

  actualizarFotografiasEducacionFormMulti() {
    const nuevasFotografias = this.getFotografiasEducacionFormMulti();
    const actualSerialized = JSON.stringify(this.fotografiasEducacionFormMulti.map(f => ({
      titulo: f.titulo,
      fuente: f.fuente,
      imagen: f.imagen
    })));
    const nuevasSerialized = JSON.stringify(nuevasFotografias.map(f => ({
      titulo: f.titulo,
      fuente: f.fuente,
      imagen: f.imagen
    })));
    
    if (actualSerialized !== nuevasSerialized) {
      this.fotografiasEducacionFormMulti = nuevasFotografias;
    }
  }

  onFotografiasEducacionChange(fotografias: any[]) {
    fotografias.forEach((foto, index) => {
      if (index === 0) {
        this.onFieldChange('fotografiaIEAyrocaTitulo', foto.titulo);
        this.onFieldChange('fotografiaIEAyrocaFuente', foto.fuente);
        this.onFieldChange('fotografiaIEAyrocaImagen', foto.imagen || '');
      } else {
        this.onFieldChange('fotografiaIE40270Titulo', foto.titulo);
        this.onFieldChange('fotografiaIE40270Fuente', foto.fuente);
        this.onFieldChange('fotografiaIE40270Imagen', foto.imagen || '');
      }
    });
    this.fotosEducacion = fotografias.map(f => ({ ...f, preview: f.imagen }));
    this.actualizarFotografiasEducacionFormMulti();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  getFotografiasRecreacionFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaRecreacion',
      'fotografiasRecreacionFormMulti',
      'Parque recreacional público del anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  actualizarFotografiasRecreacionFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaRecreacion',
      'fotografiasRecreacionFormMulti',
      'Parque recreacional público del anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  onFotografiasRecreacionChangeGeneric(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaRecreacion',
      'fotografiasRecreacionFormMulti',
      'Parque recreacional público del anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024',
      'fotoRecreacionPreview'
    );
  }

  onFotografiasRecreacionChange(fotografias: any[]) {
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      this.onFieldChange(`fotografiaRecreacion${num}Titulo`, foto.titulo);
      this.onFieldChange(`fotografiaRecreacion${num}Fuente`, foto.fuente);
      this.onFieldChange(`fotografiaRecreacion${num}Imagen`, foto.imagen || '');
    });
    for (let i = fotografias.length + 1; i <= 10; i++) {
      this.onFieldChange(`fotografiaRecreacion${i}Titulo`, '');
      this.onFieldChange(`fotografiaRecreacion${i}Fuente`, '');
      this.onFieldChange(`fotografiaRecreacion${i}Imagen`, '');
    }
    this.fotosRecreacion = fotografias.map(f => ({ ...f, preview: f.imagen }));
    this.actualizarFotografiasRecreacionFormMulti();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  getFotografiasDeporteFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaDeporte',
      'fotografiasDeporteFormMulti',
      'Losa deportiva del anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  actualizarFotografiasDeporteFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaDeporte',
      'fotografiasDeporteFormMulti',
      'Losa deportiva del anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  onFotografiasDeporteChangeGeneric(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaDeporte',
      'fotografiasDeporteFormMulti',
      'Losa deportiva del anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024',
      'fotoDeportePreview'
    );
  }

  onFotografiasDeporteChange(fotografias: any[]) {
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      this.onFieldChange(`fotografiaDeporte${num}Titulo`, foto.titulo);
      this.onFieldChange(`fotografiaDeporte${num}Fuente`, foto.fuente);
      this.onFieldChange(`fotografiaDeporte${num}Imagen`, foto.imagen || '');
    });
    for (let i = fotografias.length + 1; i <= 10; i++) {
      this.onFieldChange(`fotografiaDeporte${i}Titulo`, '');
      this.onFieldChange(`fotografiaDeporte${i}Fuente`, '');
      this.onFieldChange(`fotografiaDeporte${i}Imagen`, '');
    }
    this.fotosDeporte = fotografias.map(f => ({ ...f, preview: f.imagen }));
    this.actualizarFotografiasDeporteFormMulti();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  // Fotografías Organización Social - Optimizado
  getFotografiasOrganizacionSocialFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaOrganizacionSocial',
      'fotografiasOrganizacionSocialFormMulti',
      'Organización Social y Liderazgo - CC ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  actualizarFotografiasOrganizacionSocialFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaOrganizacionSocial',
      'fotografiasOrganizacionSocialFormMulti',
      'Organización Social y Liderazgo - CC ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  onFotografiasOrganizacionSocialChangeGeneric(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaOrganizacionSocial',
      'fotografiasOrganizacionSocialFormMulti',
      'Organización Social y Liderazgo - CC ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024',
      'fotoOrganizacionSocialPreview'
    );
  }

  // Fotografías IE Ayroca - Optimizado
  getFotografiasIEAyrocaFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaIEAyroca',
      'fotografiasIEAyrocaFormMulti',
      'Infraestructura de la IE ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  actualizarFotografiasIEAyrocaFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaIEAyroca',
      'fotografiasIEAyrocaFormMulti',
      'Infraestructura de la IE ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  onFotografiasIEAyrocaChangeGeneric(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaIEAyroca',
      'fotografiasIEAyrocaFormMulti',
      'Infraestructura de la IE ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024',
      'fotoIEAyrocaPreview'
    );
  }

  // Fotografías IE 40270 - Optimizado
  getFotografiasIE40270FormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaIE40270',
      'fotografiasIE40270FormMulti',
      'Infraestructura de la IE N°40270'
    );
  }

  actualizarFotografiasIE40270FormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaIE40270',
      'fotografiasIE40270FormMulti',
      'Infraestructura de la IE N°40270'
    );
  }

  onFotografiasIE40270ChangeGeneric(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaIE40270',
      'fotografiasIE40270FormMulti',
      'Infraestructura de la IE N°40270',
      'GEADES, 2024',
      'fotoIE40270Preview'
    );
  }

  getFotografiasEducacionAISIFormMulti(): any[] {
    const fotos = [];
    for (let i = 1; i <= 3; i++) {
      const tituloKey = `fotografiaEducacion${i}AISITitulo`;
      const fuenteKey = `fotografiaEducacion${i}AISIFuente`;
      const imagenKey = `fotografiaEducacion${i}AISIImagen`;
      const titulosDefault = [
        'Infraestructura de la IE Cahuacho',
        'Infraestructura de la IE N°40271',
        'Infraestructura de la IE Virgen de Copacabana'
      ];
      fotos.push({
        titulo: this.datos[tituloKey] || titulosDefault[i - 1] || '',
        fuente: this.datos[fuenteKey] || 'GEADES, 2024',
        imagen: this.datos[imagenKey] || null,
        id: `educacion-aisi-${i}`
      });
    }
    return fotos;
  }

  onFotografiasEducacionAISIChange(fotografias: any[]) {
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      this.onFieldChange(`fotografiaEducacion${num}AISITitulo`, foto.titulo);
      this.onFieldChange(`fotografiaEducacion${num}AISIFuente`, foto.fuente);
      this.onFieldChange(`fotografiaEducacion${num}AISIImagen`, foto.imagen || '');
    });
    for (let i = fotografias.length + 1; i <= 10; i++) {
      this.onFieldChange(`fotografiaEducacion${i}AISITitulo`, '');
      this.onFieldChange(`fotografiaEducacion${i}AISIFuente`, '');
      this.onFieldChange(`fotografiaEducacion${i}AISIImagen`, '');
    }
  }

  calcularTotalesTablaAISD2() {
    const prefijo = this.obtenerPrefijoGrupo();
    let totalPoblacion = 0;
    let totalViviendasEmpadronadas = 0;
    let totalViviendasOcupadas = 0;
    
    for (let i = 1; i <= this.filasTablaAISD2; i++) {
      const poblacion = parseInt(this.formData[`tablaAISD2Fila${i}Poblacion${prefijo}`] || this.formData[`tablaAISD2Fila${i}Poblacion`] || '0') || 0;
      const viviendasEmp = parseInt(this.formData[`tablaAISD2Fila${i}ViviendasEmpadronadas${prefijo}`] || this.formData[`tablaAISD2Fila${i}ViviendasEmpadronadas`] || '0') || 0;
      const viviendasOcp = parseInt(this.formData[`tablaAISD2Fila${i}ViviendasOcupadas${prefijo}`] || this.formData[`tablaAISD2Fila${i}ViviendasOcupadas`] || '0') || 0;
      
      totalPoblacion += poblacion;
      totalViviendasEmpadronadas += viviendasEmp;
      totalViviendasOcupadas += viviendasOcp;
    }
    
    const campoPoblacion = `tablaAISD2TotalPoblacion${prefijo}`;
    const campoViviendasEmp = `tablaAISD2TotalViviendasEmpadronadas${prefijo}`;
    const campoViviendasOcp = `tablaAISD2TotalViviendasOcupadas${prefijo}`;
    
    this.formData[campoPoblacion] = totalPoblacion.toString();
    this.formData[campoViviendasEmp] = totalViviendasEmpadronadas.toString();
    this.formData[campoViviendasOcp] = totalViviendasOcupadas.toString();
    
    this.datos[campoPoblacion] = totalPoblacion.toString();
    this.datos[campoViviendasEmp] = totalViviendasEmpadronadas.toString();
    this.datos[campoViviendasOcp] = totalViviendasOcupadas.toString();
    
    this.formularioService.actualizarDato(campoPoblacion as keyof FormularioDatos, totalPoblacion.toString());
    this.formularioService.actualizarDato(campoViviendasEmp as keyof FormularioDatos, totalViviendasEmpadronadas.toString());
    this.formularioService.actualizarDato(campoViviendasOcp as keyof FormularioDatos, totalViviendasOcupadas.toString());
    
    if (this.seccionId === '3.1.4.A.1.2' || this.seccionId === '3.1.4.A.2.2') {
      setTimeout(() => {
        this.cargarDatosDemografiaAISDSiDisponible();
      }, 500);
    } else if (this.seccionId === '3.1.4.A.1.5' || this.seccionId === '3.1.4.A.2.5') {
      setTimeout(() => {
        this.cargarViviendasAISD(null);
      }, 500);
    } else if (this.seccionId === '3.1.4.A.1.6') {
      setTimeout(() => {
        this.cargarServiciosBasicosAISD(null);
      }, 500);
    } else if (this.seccionId === '3.1.4.A.1.8') {
      setTimeout(() => {
        this.cargarInfraestructuraAISD(null);
      }, 500);
    } else if (this.seccionId === '3.1.4.A.1.9') {
      setTimeout(() => {
        this.cargarIndicadoresSaludAISD(null);
      }, 500);
    } else if (this.seccionId === '3.1.4.A.1.10') {
      setTimeout(() => {
        this.cargarIndicadoresEducacionAISD(null);
      }, 500);
    }
  }

  capitalizarTexto(texto: string): string {
    return this.textNormalization.capitalizarTexto(texto);
  }

  onAltitudChange(value: string) {
    const valorLimpio = value || '';
    this.formData['altitudAISD'] = valorLimpio;
    this.datos['altitudAISD'] = valorLimpio;
  }

  normalizarAltitud() {
    let altitud = this.formData['altitudAISD'] || '';
    if (altitud && altitud.trim() !== '') {
      altitud = altitud.replace(/\s*msnm\s*/gi, '').trim();
      if (!altitud.toLowerCase().endsWith('msnm')) {
        altitud = altitud + ' msnm';
      }
      this.onFieldChange('altitudAISD', altitud);
    } else {
      this.formData['altitudAISD'] = '';
      this.datos['altitudAISD'] = '';
    }
  }

  getFilasTabla(): number[] {
    return Array.from({ length: this.filasTablaAISD2 }, (_, i) => i + 1);
  }

  limpiarTablaAISD2(prefijo: string) {
    for (let i = 1; i <= 20; i++) {
      const campoPunto = this.obtenerCampoConPrefijo(`tablaAISD2Fila${i}Punto`);
      const campoCodigo = this.obtenerCampoConPrefijo(`tablaAISD2Fila${i}Codigo`);
      const campoPoblacion = this.obtenerCampoConPrefijo(`tablaAISD2Fila${i}Poblacion`);
      const campoViviendasEmp = this.obtenerCampoConPrefijo(`tablaAISD2Fila${i}ViviendasEmpadronadas`);
      const campoViviendasOcp = this.obtenerCampoConPrefijo(`tablaAISD2Fila${i}ViviendasOcupadas`);
      
      this.onFieldChange(campoPunto, '');
      this.onFieldChange(campoCodigo, '');
      this.onFieldChange(campoPoblacion, '');
      this.onFieldChange(campoViviendasEmp, '');
      this.onFieldChange(campoViviendasOcp, '');
    }
    this.filasTablaAISD2 = 0;
  }

  poblarTablaAISD2DesdeJSON(centrosPoblados: any[]) {
    if (!centrosPoblados || centrosPoblados.length === 0) {
      return;
    }

    const prefijo = this.obtenerPrefijoGrupo();
    
    // Si es una sección A.X, filtrar los centros según la CC seleccionada
    let centrosFiltrados = centrosPoblados;
    if (prefijo && prefijo.startsWith('_A')) {
      const codigosComunidad = this.obtenerCentrosPobladosDeComunidadCampesina();
      if (codigosComunidad.length > 0) {
        const codigosSet = new Set(codigosComunidad.map(c => c.toString().trim()));
        centrosFiltrados = centrosPoblados.filter((cp: any) => {
          const codigo = cp.CODIGO?.toString().trim() || '';
          return codigo && codigosSet.has(codigo);
        });
      }
    }
    
    this.limpiarTablaAISD2(prefijo);
    
    const centrosPobladosValidos = centrosFiltrados.filter((cp: any) => cp.CCPP && cp.CODIGO);
    
    if (centrosPobladosValidos.length === 0) {
      return;
    }

    const codigosActivos: string[] = [];
    this.filasTablaAISD2 = centrosPobladosValidos.length;
    
    centrosPobladosValidos.forEach((cp: any, index: number) => {
      const filaIndex = index + 1;
      const codigoCPP = cp.CODIGO?.toString().trim() || '';
      const campoPunto = this.obtenerCampoConPrefijo(`tablaAISD2Fila${filaIndex}Punto`);
      const campoCodigo = this.obtenerCampoConPrefijo(`tablaAISD2Fila${filaIndex}Codigo`);
      const campoPoblacion = this.obtenerCampoConPrefijo(`tablaAISD2Fila${filaIndex}Poblacion`);
      
      this.onFieldChange(campoPunto, cp.CCPP || '');
      this.onFieldChange(campoCodigo, codigoCPP);
      this.onFieldChange(campoPoblacion, cp.POBLACION?.toString() || '0');
      
      if (codigoCPP) {
        setTimeout(() => {
          this.cargarViviendasPorCPP(filaIndex, codigoCPP);
        }, filaIndex * 200);
      }
      codigosActivos.push(codigoCPP);
    });
    
    this.formularioService.guardarFilasActivasTablaAISD2(codigosActivos, prefijo);
    
    this.recalcularFilasConDatos();

    setTimeout(() => {
      this.calcularTotalesTablaAISD2();
      this.cdRef.detectChanges();
      if (this.seccionId.match(/^3\.1\.4\.A\.\d+\.2$/)) {
        setTimeout(() => {
          this.cargarDatosDemografiaAISDSiDisponible();
        }, 600);
      }
    }, 100);
  }

  agregarFilaTabla() {
    let tieneFilaVacia = false;
    for (let i = 1; i <= this.filasTablaAISD2; i++) {
      const punto = this.formData[`tablaAISD2Fila${i}Punto`] || '';
      const codigo = this.formData[`tablaAISD2Fila${i}Codigo`] || '';
      const poblacion = this.formData[`tablaAISD2Fila${i}Poblacion`] || '';
      const viviendasEmp = this.formData[`tablaAISD2Fila${i}ViviendasEmpadronadas`] || '';
      const viviendasOcp = this.formData[`tablaAISD2Fila${i}ViviendasOcupadas`] || '';
      
      const esVacia = (!punto || punto === '____') && 
                      (!codigo || codigo === '____') && 
                      (!poblacion || poblacion === '____') && 
                      (!viviendasEmp || viviendasEmp === '____') && 
                      (!viviendasOcp || viviendasOcp === '____');
      
      if (esVacia) {
        tieneFilaVacia = true;
        break;
      }
    }
    
    if (!tieneFilaVacia) {
      this.filasTablaAISD2++;
    }
    this.actualizarFilasActivas();
  }

  actualizarFilasActivas() {
    const prefijo = this.obtenerPrefijoGrupo();
    const codigosActivos: string[] = [];
    for (let i = 1; i <= this.filasTablaAISD2; i++) {
      const codigo = this.formData[`tablaAISD2Fila${i}Codigo${prefijo}`] || this.formData[`tablaAISD2Fila${i}Codigo`] || '';
      if (codigo && codigo !== '____' && codigo.trim() !== '') {
        codigosActivos.push(codigo);
      }
    }
    this.formularioService.guardarFilasActivasTablaAISD2(codigosActivos, prefijo);
    this.recalcularFilasConDatos();
  }
  
  recalcularFilasConDatos() {
    const prefijo = this.obtenerPrefijoGrupo();
    let filasConDatos = 0;
    for (let i = 1; i <= 20; i++) {
      const punto = this.formData[`tablaAISD2Fila${i}Punto${prefijo}`] || this.formData[`tablaAISD2Fila${i}Punto`] || '';
      const codigo = this.formData[`tablaAISD2Fila${i}Codigo${prefijo}`] || this.formData[`tablaAISD2Fila${i}Codigo`] || '';
      const poblacion = this.formData[`tablaAISD2Fila${i}Poblacion${prefijo}`] || this.formData[`tablaAISD2Fila${i}Poblacion`] || '';
      const viviendasEmp = this.formData[`tablaAISD2Fila${i}ViviendasEmpadronadas${prefijo}`] || this.formData[`tablaAISD2Fila${i}ViviendasEmpadronadas`] || '';
      const viviendasOcp = this.formData[`tablaAISD2Fila${i}ViviendasOcupadas${prefijo}`] || this.formData[`tablaAISD2Fila${i}ViviendasOcupadas`] || '';
      
      const tieneValor = (val: string) => val && val !== '____' && val.toString().trim() !== '';
      const tieneAlgunDato = tieneValor(punto) || tieneValor(codigo) || tieneValor(poblacion) || 
                             tieneValor(viviendasEmp) || tieneValor(viviendasOcp);
      
      if (tieneAlgunDato) {
        filasConDatos = i;
      }
    }
    this.filasTablaAISD2 = filasConDatos > 0 ? filasConDatos : 1;
  }

  eliminarFilaTabla(index: number) {
    if (this.filasTablaAISD2 > 1) {
      const filaIndex = index + 1;
      const codigoEliminado = this.formData[`tablaAISD2Fila${filaIndex}Codigo`] || '';
      
      this.onFieldChange(`tablaAISD2Fila${filaIndex}Punto`, '');
      this.onFieldChange(`tablaAISD2Fila${filaIndex}Codigo`, '');
      this.onFieldChange(`tablaAISD2Fila${filaIndex}Poblacion`, '');
      this.onFieldChange(`tablaAISD2Fila${filaIndex}ViviendasEmpadronadas`, '');
      this.onFieldChange(`tablaAISD2Fila${filaIndex}ViviendasOcupadas`, '');
      
      for (let i = filaIndex + 1; i <= this.filasTablaAISD2; i++) {
        const siguientePunto = this.formData[`tablaAISD2Fila${i}Punto`] || '';
        const siguienteCodigo = this.formData[`tablaAISD2Fila${i}Codigo`] || '';
        const siguientePoblacion = this.formData[`tablaAISD2Fila${i}Poblacion`] || '';
        const siguienteViviendasEmp = this.formData[`tablaAISD2Fila${i}ViviendasEmpadronadas`] || '';
        const siguienteViviendasOcp = this.formData[`tablaAISD2Fila${i}ViviendasOcupadas`] || '';
        
        this.onFieldChange(`tablaAISD2Fila${i-1}Punto`, siguientePunto);
        this.onFieldChange(`tablaAISD2Fila${i-1}Codigo`, siguienteCodigo);
        this.onFieldChange(`tablaAISD2Fila${i-1}Poblacion`, siguientePoblacion);
        this.onFieldChange(`tablaAISD2Fila${i-1}ViviendasEmpadronadas`, siguienteViviendasEmp);
        this.onFieldChange(`tablaAISD2Fila${i-1}ViviendasOcupadas`, siguienteViviendasOcp);
      }
      
      this.filasTablaAISD2--;
      
      if (codigoEliminado) {
        const filasActivas = this.formularioService.obtenerFilasActivasTablaAISD2();
        const nuevasFilasActivas = filasActivas.filter((codigo: string) => codigo !== codigoEliminado);
        this.formularioService.guardarFilasActivasTablaAISD2(nuevasFilasActivas);
      }
      
      this.calcularTotalesTablaAISD2();
      this.cdRef.detectChanges();
    }
  }

  agregarEntrevistado() {
    if (!this.datos.entrevistados) {
      this.datos.entrevistados = [];
    }
    this.datos.entrevistados.push({ nombre: '', cargo: '', organizacion: '' });
    this.formularioService.actualizarDato('entrevistados', this.datos.entrevistados);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarEntrevistado(index: number) {
    if (this.datos.entrevistados && this.datos.entrevistados.length > 0) {
      this.datos.entrevistados.splice(index, 1);
      this.formularioService.actualizarDato('entrevistados', this.datos.entrevistados);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarEntrevistado(index: number, campo: string, value: string) {
    if (!this.datos.entrevistados) {
      this.datos.entrevistados = [];
    }
    if (!this.datos.entrevistados[index]) {
      this.datos.entrevistados[index] = { nombre: '', cargo: '', organizacion: '' };
    }
    (this.datos.entrevistados[index] as any)[campo] = value;
    this.formularioService.actualizarDato('entrevistados', this.datos.entrevistados);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }


  ngAfterViewChecked() {
    this.cdRef.detectChanges();
    
    if (!this.scrollRealizado) {
      if (this.seccionId === '3.1.2.A') {
        setTimeout(() => {
          const elemento = document.getElementById('seccion-3-1-2-A');
          if (elemento) {
            const viewportContent = document.querySelector('.viewport-content');
            if (viewportContent) {
              const elementoTop = elemento.offsetTop;
              viewportContent.scrollTo({ top: elementoTop - 20, behavior: 'smooth' });
            } else {
              elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            this.scrollRealizado = true;
          }
        }, 200);
      } else if (this.seccionId === '3.1.2.B') {
        setTimeout(() => {
          const elemento = document.getElementById('seccion-3-1-2-B');
          if (elemento) {
            const viewportContent = document.querySelector('.viewport-content');
            if (viewportContent) {
              const elementoTop = elemento.offsetTop;
              viewportContent.scrollTo({ top: elementoTop - 20, behavior: 'smooth' });
            } else {
              elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            this.scrollRealizado = true;
          }
        }, 200);
      }
    }
  }

  normalizarNombreProyecto(texto: string | undefined | null, conArticulo: boolean = true): string {
    return this.textNormalization.normalizarNombreProyecto(texto, conArticulo);
  }

  irAPlantilla() {
    this.router.navigate(['/plantilla'], {
      state: { returnSection: this.seccionId }
    });
  }

  private obtenerTodasLasSecciones(): string[] {
    return [
      '3.1.1',
      '3.1.2.A',
      '3.1.2.B',
      '3.1.3.A',
      '3.1.3.B',
      '3.1.4.A',
      '3.1.4.A.1',
      '3.1.4.A.1.1',
      '3.1.4.A.1.2',
      '3.1.4.A.1.3',
      '3.1.4.A.1.4',
      '3.1.4.A.1.5',
      '3.1.4.A.1.6',
      '3.1.4.A.1.7',
      '3.1.4.A.1.8',
      '3.1.4.A.1.9',
      '3.1.4.A.1.10',
      '3.1.4.A.1.11',
      '3.1.4.A.1.12',
      '3.1.4.A.1.13',
      '3.1.4.A.1.14',
      '3.1.4.A.1.15',
      '3.1.4.A.1.16',
      '3.1.4.A.2',
      '3.1.4.A.2.1',
      '3.1.4.A.2.2',
      '3.1.4.A.2.3',
      '3.1.4.A.2.4',
      '3.1.4.A.2.5',
      '3.1.4.A.2.6',
      '3.1.4.A.2.7',
      '3.1.4.A.2.8',
      '3.1.4.A.2.9',
      '3.1.4.A.2.10',
      '3.1.4.A.2.11',
      '3.1.4.A.2.12',
      '3.1.4.A.2.13',
      '3.1.4.A.2.14',
      '3.1.4.A.2.15',
      '3.1.4.A.2.16',
      '3.1.4.B',
      '3.1.4.B.1',
      '3.1.4.B.1.1',
      '3.1.4.B.1.2',
      '3.1.4.B.1.3',
      '3.1.4.B.1.4',
      '3.1.4.B.1.5',
      '3.1.4.B.1.6',
      '3.1.4.B.1.7',
      '3.1.4.B.1.8',
      '3.1.4.B.1.9',
      '3.1.4.B.1.10',
      '3.1.4.B.1.11',
      '3.1.4.B.1.12',
      '3.1.4.B.1.13',
      '3.1.4.B.1.14',
      '3.1.4.B.1.15',
      '3.1.4.B.2',
      '3.1.4.B.2.1',
      '3.1.4.B.2.2',
      '3.1.4.B.2.3',
      '3.1.4.B.2.4',
      '3.1.4.B.2.5',
      '3.1.4.B.2.6',
      '3.1.4.B.2.7',
      '3.1.4.B.2.8',
      '3.1.4.B.2.9',
      '3.1.4.B.2.10',
      '3.1.4.B.2.11',
      '3.1.4.B.2.12',
      '3.1.4.B.2.13',
      '3.1.4.B.2.14',
      '3.1.4.B.2.15'
    ];
  }

  actualizarEstadoNavegacion() {
    const secciones = this.obtenerTodasLasSecciones();
    const index = secciones.indexOf(this.seccionId);
    const componenteActual = this.obtenerComponenteId(this.seccionId);
    
    let puedeAnterior = false;
    for (let i = index - 1; i >= 0; i--) {
      const componenteAnterior = this.obtenerComponenteId(secciones[i]);
      if (componenteAnterior !== componenteActual) {
        puedeAnterior = true;
        break;
      }
    }
    this.puedeIrAnterior = puedeAnterior;
    
    let puedeSiguiente = false;
    for (let i = index + 1; i < secciones.length; i++) {
      const componenteSiguiente = this.obtenerComponenteId(secciones[i]);
      if (componenteSiguiente !== componenteActual) {
        puedeSiguiente = true;
        break;
      }
    }
    this.puedeIrSiguiente = puedeSiguiente;
  }

  private obtenerComponenteId(seccionId: string): string | null {
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
      '3.1.4.A.2': 'seccion4',
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
    return componentIdMap[seccionId] || null;
  }

  seccionAnterior() {
    const secciones = this.obtenerTodasLasSecciones();
    const index = secciones.indexOf(this.seccionId);
    if (index <= 0) return;
    
    if (this.seccionId === '3.1.4.A') {
      this.router.navigate(['/seccion', '3.1.3.B']);
      return;
    }
    
    if (this.seccionId === '3.1.4.A.1.1') {
      this.router.navigate(['/seccion', '3.1.4.A.1']);
      return;
    }
    
    if (this.seccionId === '3.1.4.A.2.1') {
      this.router.navigate(['/seccion', '3.1.4.A.2']);
      return;
    }
    
    // B.1.1: Ir a B.1 (no a la última subsección del último grupo AISD)
    if (this.seccionId === '3.1.4.B.1.1') {
      this.router.navigate(['/seccion', '3.1.4.B.1']);
      return;
    }
    
    if (this.seccionId === '3.1.4.B.2.1') {
      this.router.navigate(['/seccion', '3.1.4.B.2']);
      return;
    }

    // B.X.Y (donde Y > 1): Ir a B.X.(Y-1)
    const matchBSubseccion = this.seccionId.match(/^3\.1\.4\.B\.(\d+)\.(\d+)$/);
    if (matchBSubseccion) {
      const numeroGrupo = parseInt(matchBSubseccion[1]);
      const numeroSubseccion = parseInt(matchBSubseccion[2]);
      if (numeroSubseccion > 1) {
        this.router.navigate(['/seccion', `3.1.4.B.${numeroGrupo}.${numeroSubseccion - 1}`]);
        return;
      }
    }

    // A.X: Ir a A.(X-1).16
    const matchA = this.seccionId.match(/^3\.1\.4\.A\.(\d+)$/);
    if (matchA) {
      const numero = parseInt(matchA[1]);
      if (numero > 1) {
        this.router.navigate(['/seccion', `3.1.4.A.${numero - 1}.16`]);
        return;
      }
    }

    // B.X: Ir a B.(X-1).16 o a último A si es B.1
    const matchB = this.seccionId.match(/^3\.1\.4\.B\.(\d+)$/);
    if (matchB) {
      const numero = parseInt(matchB[1]);
      if (numero > 1) {
        this.router.navigate(['/seccion', `3.1.4.B.${numero - 1}.16`]);
        return;
      } else {
        // B.1: Ir al último grupo AISD
        let ultimoGrupoAISD = 1;
        for (let i = 10; i >= 1; i--) {
          if (this.existeGrupoAISD('A', i)) {
            ultimoGrupoAISD = i;
            break;
          }
        }
        this.router.navigate(['/seccion', `3.1.4.A.${ultimoGrupoAISD}.16`]);
        return;
      }
    }
    
    const componenteActual = this.obtenerComponenteId(this.seccionId);
    const grupoActual = this.obtenerGrupoSeccion(this.seccionId);
    
    for (let i = index - 1; i >= 0; i--) {
      const grupoAnterior = this.obtenerGrupoSeccion(secciones[i]);
      if (grupoActual && grupoAnterior && grupoActual !== grupoAnterior) {
        continue;
      }
      const componenteAnterior = this.obtenerComponenteId(secciones[i]);
      if (componenteAnterior !== componenteActual) {
        this.router.navigate(['/seccion', secciones[i]]);
        return;
      }
    }
    
    if (index > 0) {
      this.router.navigate(['/seccion', secciones[index - 1]]);
    }
  }

  seccionSiguiente() {
    if (this.seccionId === '3.1.3.B') {
      this.router.navigate(['/seccion', '3.1.4.A']);
      return;
    }
    
    // A.1.16: Si no hay A.2, ir a B.1
    if (this.seccionId === '3.1.4.A.1.16') {
      const existeA2 = this.existeGrupoAISD('A', 2);
      if (existeA2) {
        this.router.navigate(['/seccion', '3.1.4.A.2']);
      } else {
        this.router.navigate(['/seccion', '3.1.4.B.1']);
      }
      return;
    }
    
    // A.2.16: Si no hay A.3, ir a B.1
    if (this.seccionId === '3.1.4.A.2.16') {
      const existeA3 = this.existeGrupoAISD('A', 3);
      if (existeA3) {
        this.router.navigate(['/seccion', '3.1.4.A.3']);
      } else {
        this.router.navigate(['/seccion', '3.1.4.B.1']);
      }
      return;
    }

    // A.3.16: Si no hay A.4, ir a B.1
    if (this.seccionId === '3.1.4.A.3.16') {
      const existeA4 = this.existeGrupoAISD('A', 4);
      if (existeA4) {
        this.router.navigate(['/seccion', '3.1.4.A.4']);
      } else {
        this.router.navigate(['/seccion', '3.1.4.B.1']);
      }
      return;
    }

    // Manejar otros A.X.16 dinámicamente
    const matchAFin = this.seccionId.match(/^3\.1\.4\.A\.(\d+)\.16$/);
    if (matchAFin) {
      const numeroActual = parseInt(matchAFin[1]);
      const existeSiguiente = this.existeGrupoAISD('A', numeroActual + 1);
      if (existeSiguiente) {
        this.router.navigate(['/seccion', `3.1.4.A.${numeroActual + 1}`]);
      } else {
        this.router.navigate(['/seccion', '3.1.4.B.1']);
      }
      return;
    }
    
    // B.1.16: Si no hay B.2, terminar
    if (this.seccionId === '3.1.4.B.1.16') {
      const existeB2 = this.existeGrupoAISI('B', 2);
      if (existeB2) {
        this.router.navigate(['/seccion', '3.1.4.B.2']);
      }
      // Si no existe B.2, no hacer nada (termina aquí)
      return;
    }
    
    // B.2.16: Si no hay B.3, terminar
    if (this.seccionId === '3.1.4.B.2.16') {
      const existeB3 = this.existeGrupoAISI('B', 3);
      if (existeB3) {
        this.router.navigate(['/seccion', '3.1.4.B.3']);
      }
      // Si no existe B.3, no hacer nada (termina aquí)
      return;
    }

    // Manejar otros B.X.16 dinámicamente
    const matchBFin = this.seccionId.match(/^3\.1\.4\.B\.(\d+)\.16$/);
    if (matchBFin) {
      const numeroActual = parseInt(matchBFin[1]);
      const existeSiguiente = this.existeGrupoAISI('B', numeroActual + 1);
      if (existeSiguiente) {
        this.router.navigate(['/seccion', `3.1.4.B.${numeroActual + 1}`]);
      }
      // Si no existe siguiente, no hacer nada (termina aquí)
      return;
    }
    
    const secciones = this.obtenerTodasLasSecciones();
    const index = secciones.indexOf(this.seccionId);
    if (index >= secciones.length - 1) return;
    
    const matchA = this.seccionId.match(/^3\.1\.4\.A\.(\d+)$/);
    if (matchA) {
      const numero = matchA[1];
      this.router.navigate(['/seccion', `3.1.4.A.${numero}.1`]);
      return;
    }
    
    if (this.seccionId === '3.1.4.B.1') {
      this.router.navigate(['/seccion', '3.1.4.B.1.1']);
      return;
    }
    
    if (this.seccionId === '3.1.4.B.2') {
      this.router.navigate(['/seccion', '3.1.4.B.2.1']);
      return;
    }
    
    const componenteActual = this.obtenerComponenteId(this.seccionId);
    const grupoActual = this.obtenerGrupoSeccion(this.seccionId);
    
    for (let i = index + 1; i < secciones.length; i++) {
      if (secciones[i] === '3.1.4') {
        continue;
      }
      const grupoSiguiente = this.obtenerGrupoSeccion(secciones[i]);
      if (grupoActual && grupoSiguiente && grupoActual !== grupoSiguiente) {
        continue;
      }
      const componenteSiguiente = this.obtenerComponenteId(secciones[i]);
      if (componenteSiguiente !== componenteActual) {
        this.router.navigate(['/seccion', secciones[i]]);
        return;
      }
    }
    
    if (index < secciones.length - 1) {
      this.router.navigate(['/seccion', secciones[index + 1]]);
    }
  }
  
  private obtenerGrupoSeccion(seccionId: string): string | null {
    const matchA = seccionId.match(/^3\.1\.4\.A\.(\d+)/);
    if (matchA) {
      return `A.${matchA[1]}`;
    }
    const matchB = seccionId.match(/^3\.1\.4\.B\.(\d+)/);
    if (matchB) {
      return `B.${matchB[1]}`;
    }
    return null;
  }

  private existeGrupoAISD(tipo: string, numero: number): boolean {
    const datos = this.formularioService.obtenerDatos();
    const grupoKey = `grupoAISD_${tipo}${numero}`;
    return datos[grupoKey] && datos[grupoKey] !== '' && datos[grupoKey] !== '____';
  }

  private existeGrupoAISI(tipo: string, numero: number): boolean {
    const datos = this.formularioService.obtenerDatos();
    const grupoKey = `centroPobladoAISI_${tipo}${numero}`;
    return datos[grupoKey] && datos[grupoKey] !== '' && datos[grupoKey] !== '____';
  }

  probarConexionBackend() {
    const distritoPrueba = this.formData['distritoSeleccionado'] || 'CAHUACHO';
    
    if (this.configService.isMockMode()) {
    }
    
    this.dataService.getPoblacionByDistrito(distritoPrueba).subscribe({
      next: (response) => {
      },
      error: (error) => {
      }
    });
  }

  cargarDatosPorCPP(cppCode: string) {
    if (!cppCode || cppCode.trim() === '') {
      alert('Por favor ingrese un código CPP');
      return;
    }

    const jsonData = this.formularioService.obtenerJSON();
    if (jsonData && jsonData.length > 0) {
      const centroPoblado = jsonData.find((cp: any) => 
        cp.CODIGO && cp.CODIGO.toString().trim() === cppCode.trim()
      );

      if (centroPoblado) {
        let filaIndex = -1;
        for (let i = 1; i <= this.filasTablaAISD2; i++) {
          if (!this.formData[`tablaAISD2Fila${i}Punto`] || this.formData[`tablaAISD2Fila${i}Punto`] === '' || this.formData[`tablaAISD2Fila${i}Punto`] === '____') {
            filaIndex = i;
            break;
          }
        }

        if (filaIndex === -1) {
          this.agregarFilaTabla();
          filaIndex = this.filasTablaAISD2;
        }

        this.onFieldChange(`tablaAISD2Fila${filaIndex}Punto`, centroPoblado.CCPP || '');
        this.onFieldChange(`tablaAISD2Fila${filaIndex}Codigo`, centroPoblado.CODIGO?.toString() || '');
        this.onFieldChange(`tablaAISD2Fila${filaIndex}Poblacion`, centroPoblado.POBLACION?.toString() || '');
        
        if (centroPoblado.CODIGO) {
          this.cargarViviendasPorCPP(filaIndex, centroPoblado.CODIGO.toString());
        }
        
        this.cdRef.detectChanges();
        return;
      }
    }

    const distrito = this.formData['distritoSeleccionado'];
    if (!distrito) {
      alert('Por favor seleccione primero el distrito principal');
      return;
    }

    this.dataService.getPoblacionByDistrito(distrito.toUpperCase()).subscribe({
      next: (response) => {
        if (response && response.success && Array.isArray(response.data)) {
          const centroPoblado = response.data.find((cp: CentroPoblado) => 
            cp.cpp && cp.cpp.trim() === cppCode.trim()
          );

          if (centroPoblado) {
            let filaIndex = -1;
            for (let i = 1; i <= this.filasTablaAISD2; i++) {
              if (!this.formData[`tablaAISD2Fila${i}Punto`] || this.formData[`tablaAISD2Fila${i}Punto`] === '' || this.formData[`tablaAISD2Fila${i}Punto`] === '____') {
                filaIndex = i;
                break;
              }
            }

            if (filaIndex === -1) {
              this.agregarFilaTabla();
              filaIndex = this.filasTablaAISD2;
            }

            this.onFieldChange(`tablaAISD2Fila${filaIndex}Punto`, centroPoblado.centro_poblado || '');
            this.onFieldChange(`tablaAISD2Fila${filaIndex}Codigo`, centroPoblado.cpp || '');
            this.onFieldChange(`tablaAISD2Fila${filaIndex}Poblacion`, centroPoblado.total?.toString() || '');
            
            if (centroPoblado.cpp) {
              this.cargarViviendasPorCPP(filaIndex, centroPoblado.cpp);
            }
            
            this.cdRef.detectChanges();
          } else {
            alert(`No se encontró un centro poblado con el código CPP ${cppCode} en el distrito ${distrito}`);
          }
        }
      },
      error: (error) => {
        // Silenciar error - usando datos mock
      }
    });
  }

  actualizarFoto(index: number, campo: string, value: string) {
    if (this.fotografias[index]) {
      this.fotografias[index][campo] = value;
      const fotoKey = `fotografiaAISD${index + 1}${campo.charAt(0).toUpperCase() + campo.slice(1)}`;
      this.formData[fotoKey] = value;
      this.datos[fotoKey] = value;
      this.formularioService.actualizarDato(fotoKey, value);
      this.cdRef.detectChanges();
    }
  }

  agregarFoto() {
    const nuevoNumero = this.fotografias.length + 1;
    this.fotografias.push({
      numero: nuevoNumero,
      titulo: 'Título de fotografía',
      fuente: 'GEADES, 2024',
      imagen: null,
      preview: null,
      dragOver: false
    });
    const fotoKey1 = `fotografiaAISD${nuevoNumero}Titulo`;
    const fotoKey2 = `fotografiaAISD${nuevoNumero}Fuente`;
    this.onFieldChange(fotoKey1, 'Título de fotografía');
    this.onFieldChange(fotoKey2, 'GEADES, 2024');
    this.cdRef.detectChanges();
  }

  eliminarFoto(index: number) {
    if (this.fotografias.length > 1) {
      const fotoKey1 = `fotografiaAISD${index + 1}Titulo`;
      const fotoKey2 = `fotografiaAISD${index + 1}Fuente`;
      const fotoKey3 = `fotografiaAISD${index + 1}Imagen`;
      this.onFieldChange(fotoKey1, '');
      this.onFieldChange(fotoKey2, '');
      this.onFieldChange(fotoKey3, '');
      
      this.fotografias.splice(index, 1);
      this.fotografias.forEach((foto, i) => {
        foto.numero = i + 1;
      });
      this.cdRef.detectChanges();
    }
  }

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.procesarImagen(file, index);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const index = parseInt(target.getAttribute('data-index') || '0');
    if (this.fotografias[index]) {
      this.fotografias[index].dragOver = true;
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const index = parseInt(target.getAttribute('data-index') || '0');
    if (this.fotografias[index]) {
      this.fotografias[index].dragOver = false;
    }
  }

  onDrop(event: DragEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    if (this.fotografias[index]) {
      this.fotografias[index].dragOver = false;
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          this.procesarImagen(file, index);
        }
      }
    }
  }

  procesarImagen(file: File, index: number) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (this.fotografias[index]) {
        this.fotografias[index].imagen = file;
        this.fotografias[index].preview = e.target.result;
        const fotoKey = `fotografiaAISD${index + 1}Imagen`;
        this.formData[fotoKey] = e.target.result;
        this.datos[fotoKey] = e.target.result;
        this.formularioService.actualizarDato(fotoKey, e.target.result);
        this.cdRef.detectChanges();
      }
    };
    reader.readAsDataURL(file);
  }

  eliminarImagen(index: number) {
    if (this.fotografias[index]) {
      this.fotografias[index].imagen = null;
      this.fotografias[index].preview = null;
      const fotoKey = `fotografiaAISD${index + 1}Imagen`;
      this.onFieldChange(fotoKey, '');
      this.cdRef.detectChanges();
    }
  }

  onFileSelectedFotoInstitucionalidad(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.procesarImagenFotoInstitucionalidad(file);
    }
  }

  onDragOverFotoInstitucionalidad(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.fotoInstitucionalidadDragOver = true;
  }

  onDragLeaveFotoInstitucionalidad(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.fotoInstitucionalidadDragOver = false;
  }

  onDropFotoInstitucionalidad(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.fotoInstitucionalidadDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.procesarImagenFotoInstitucionalidad(file);
      }
    }
  }

  procesarImagenFotoInstitucionalidad(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fotoInstitucionalidadPreview = e.target.result;
      const fotoKey = 'fotografiaAISD3Imagen';
      const fotoKeyAlt = 'fotografiaInstitucionalidadImagen';
      this.formData[fotoKey] = e.target.result;
      this.formData[fotoKeyAlt] = e.target.result;
      this.datos[fotoKey] = e.target.result;
      this.datos[fotoKeyAlt] = e.target.result;
      this.formularioService.actualizarDato(fotoKey, e.target.result);
      this.formularioService.actualizarDato(fotoKeyAlt, e.target.result);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  eliminarImagenFotoInstitucionalidad() {
    this.fotoInstitucionalidadPreview = null;
    const fotoKey = 'fotografiaAISD3Imagen';
    const fotoKeyAlt = 'fotografiaInstitucionalidadImagen';
    this.onFieldChange(fotoKey, '');
    this.onFieldChange(fotoKeyAlt, '');
    this.cdRef.detectChanges();
  }

  onImagenInstitucionalidadChange(imagenBase64: string) {
    this.fotoInstitucionalidadPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaAISD3Imagen';
    const fotoKeyAlt = 'fotografiaInstitucionalidadImagen';
    this.formData[fotoKey] = imagenBase64;
    this.formData[fotoKeyAlt] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.datos[fotoKeyAlt] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.formularioService.actualizarDato(fotoKeyAlt, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  onFileSelectedFotoGanaderia(event: any, index: number) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.procesarImagenFotoGanaderia(file, index);
    }
  }

  onDragOverFotoGanaderia(event: DragEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    if (this.fotosGanaderia[index]) {
      this.fotosGanaderia[index].dragOver = true;
    }
  }

  onDragLeaveFotoGanaderia(event: DragEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    if (this.fotosGanaderia[index]) {
      this.fotosGanaderia[index].dragOver = false;
    }
  }

  onDropFotoGanaderia(event: DragEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    if (this.fotosGanaderia[index]) {
      this.fotosGanaderia[index].dragOver = false;
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          this.procesarImagenFotoGanaderia(file, index);
        }
      }
    }
  }

  procesarImagenFotoGanaderia(file: File, index: number) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (this.fotosGanaderia[index]) {
        this.fotosGanaderia[index].preview = e.target.result;
        const fotoKey = `fotografiaGanaderia${index + 1}Imagen`;
        this.formData[fotoKey] = e.target.result;
        this.datos[fotoKey] = e.target.result;
        this.formularioService.actualizarDato(fotoKey, e.target.result);
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    };
    reader.readAsDataURL(file);
  }

  eliminarImagenFotoGanaderia(index: number) {
    if (this.fotosGanaderia[index]) {
      this.fotosGanaderia[index].preview = null;
      const fotoKey = `fotografiaGanaderia${index + 1}Imagen`;
      this.onFieldChange(fotoKey, '');
      this.cdRef.detectChanges();
    }
  }

  onFileSelectedFotoAgricultura(event: any, index: number) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.procesarImagenFotoAgricultura(file, index);
    }
  }

  onDragOverFotoAgricultura(event: DragEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    if (this.fotosAgricultura[index]) {
      this.fotosAgricultura[index].dragOver = true;
    }
  }

  onDragLeaveFotoAgricultura(event: DragEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    if (this.fotosAgricultura[index]) {
      this.fotosAgricultura[index].dragOver = false;
    }
  }

  onDropFotoAgricultura(event: DragEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    if (this.fotosAgricultura[index]) {
      this.fotosAgricultura[index].dragOver = false;
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          this.procesarImagenFotoAgricultura(file, index);
        }
      }
    }
  }

  procesarImagenFotoAgricultura(file: File, index: number) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (this.fotosAgricultura[index]) {
        this.fotosAgricultura[index].preview = e.target.result;
        const fotoKey = `fotografiaAgricultura${index + 1}Imagen`;
        this.formData[fotoKey] = e.target.result;
        this.datos[fotoKey] = e.target.result;
        this.formularioService.actualizarDato(fotoKey, e.target.result);
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    };
    reader.readAsDataURL(file);
  }

  eliminarImagenFotoAgricultura(index: number) {
    if (this.fotosAgricultura[index]) {
      this.fotosAgricultura[index].preview = null;
      const fotoKey = `fotografiaAgricultura${index + 1}Imagen`;
      this.onFieldChange(fotoKey, '');
      this.cdRef.detectChanges();
    }
  }

  onFileSelectedFotoComercio(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.procesarImagenFotoComercio(file);
    }
  }

  onDragOverFotoComercio(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.fotoComercioDragOver = true;
  }

  onDragLeaveFotoComercio(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.fotoComercioDragOver = false;
  }

  onDropFotoComercio(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.fotoComercioDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.procesarImagenFotoComercio(file);
      }
    }
  }

  procesarImagenFotoComercio(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fotoComercioPreview = e.target.result;
      const fotoKey = 'fotografiaComercioImagen';
      this.formData[fotoKey] = e.target.result;
      this.datos[fotoKey] = e.target.result;
      this.formularioService.actualizarDato(fotoKey, e.target.result);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  eliminarImagenFotoComercio() {
    this.fotoComercioPreview = null;
    const fotoKey = 'fotografiaComercioImagen';
    this.onFieldChange(fotoKey, '');
    this.cdRef.detectChanges();
  }

  inicializarCondicionOcupacion() {
    if (!this.datos['condicionOcupacionTabla'] || this.datos['condicionOcupacionTabla'].length === 0) {
      const totalEmpadronadas = parseInt(this.datos['tablaAISD2TotalViviendasEmpadronadas'] || '0') || 0;
      const totalOcupadas = parseInt(this.datos['tablaAISD2TotalViviendasOcupadas'] || '0') || 0;
      const otrasCondiciones = totalEmpadronadas - totalOcupadas;
      
      const porcentajeOcupadas = totalEmpadronadas > 0 
        ? ((totalOcupadas / totalEmpadronadas) * 100).toFixed(2).replace('.', ',') + ' %' 
        : '0 %';
      const porcentajeOtras = totalEmpadronadas > 0 
        ? ((otrasCondiciones / totalEmpadronadas) * 100).toFixed(2).replace('.', ',') + ' %' 
        : '0 %';
      
      this.datos['condicionOcupacionTabla'] = [
        { categoria: 'Viviendas ocupadas', casos: totalOcupadas, porcentaje: porcentajeOcupadas },
        { categoria: 'Viviendas con otra condición', casos: otrasCondiciones, porcentaje: porcentajeOtras },
        { categoria: 'Total', casos: totalEmpadronadas, porcentaje: '100,00 %' }
      ];
      this.formularioService.actualizarDato('condicionOcupacionTabla', this.datos['condicionOcupacionTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarCondicionOcupacion() {
    if (!this.datos['condicionOcupacionTabla']) {
      this.inicializarCondicionOcupacion();
    }
    const totalIndex = this.datos['condicionOcupacionTabla'].findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['condicionOcupacionTabla'].splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['condicionOcupacionTabla'].push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('condicionOcupacionTabla', this.datos['condicionOcupacionTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCondicionOcupacion(index: number) {
    if (this.datos['condicionOcupacionTabla'] && this.datos['condicionOcupacionTabla'].length > 1 && this.datos['condicionOcupacionTabla'][index].categoria !== 'Total') {
      this.datos['condicionOcupacionTabla'].splice(index, 1);
      this.formularioService.actualizarDato('condicionOcupacionTabla', this.datos['condicionOcupacionTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarCondicionOcupacion(index: number, field: string, value: any) {
    if (!this.datos['condicionOcupacionTabla']) {
      this.inicializarCondicionOcupacion();
    }
    if (this.datos['condicionOcupacionTabla'][index]) {
      this.datos['condicionOcupacionTabla'][index][field] = value;
      if (field === 'casos' && this.datos['condicionOcupacionTabla'][index].categoria !== 'Total') {
        const totalCasos = this.datos['condicionOcupacionTabla']
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos['condicionOcupacionTabla'].find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          totalItem.porcentaje = '100,00 %';
        }
      }
      this.formularioService.actualizarDato('condicionOcupacionTabla', this.datos['condicionOcupacionTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarTiposMateriales() {
    if (!this.datos['tiposMaterialesTabla'] || this.datos['tiposMaterialesTabla'].length === 0) {
      this.datos['tiposMaterialesTabla'] = [
        { categoria: 'Materiales de las paredes de las viviendas', tipoMaterial: 'Adobe', casos: 0, porcentaje: '0%' },
        { categoria: 'Materiales de las paredes de las viviendas', tipoMaterial: 'Triplay / calamina / estera', casos: 0, porcentaje: '0%' },
        { categoria: 'Materiales de las paredes de las viviendas', tipoMaterial: 'Total', casos: 0, porcentaje: '0%' },
        { categoria: 'Materiales de los techos de las viviendas', tipoMaterial: 'Planchas de calamina, fibra de cemento o similares', casos: 0, porcentaje: '0%' },
        { categoria: 'Materiales de los techos de las viviendas', tipoMaterial: 'Triplay / estera / carrizo', casos: 0, porcentaje: '0%' },
        { categoria: 'Materiales de los techos de las viviendas', tipoMaterial: 'Tejas', casos: 0, porcentaje: '0%' },
        { categoria: 'Materiales de los techos de las viviendas', tipoMaterial: 'Total', casos: 0, porcentaje: '0%' },
        { categoria: 'Materiales de los pisos de las viviendas', tipoMaterial: 'Tierra', casos: 0, porcentaje: '0%' },
        { categoria: 'Materiales de los pisos de las viviendas', tipoMaterial: 'Cemento', casos: 0, porcentaje: '0%' },
        { categoria: 'Materiales de los pisos de las viviendas', tipoMaterial: 'Total', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('tiposMaterialesTabla', this.datos['tiposMaterialesTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarTiposMateriales() {
    if (!this.datos['tiposMaterialesTabla']) {
      this.inicializarTiposMateriales();
    }
    const totalIndex = this.datos['tiposMaterialesTabla'].findIndex((item: any) => item.tipoMaterial === 'Total');
    if (totalIndex >= 0) {
      this.datos['tiposMaterialesTabla'].splice(totalIndex, 0, { categoria: '', tipoMaterial: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['tiposMaterialesTabla'].push({ categoria: '', tipoMaterial: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('tiposMaterialesTabla', this.datos['tiposMaterialesTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarTiposMateriales(index: number) {
    if (this.datos['tiposMaterialesTabla'] && this.datos['tiposMaterialesTabla'].length > 1 && this.datos['tiposMaterialesTabla'][index].tipoMaterial !== 'Total') {
      this.datos['tiposMaterialesTabla'].splice(index, 1);
      this.formularioService.actualizarDato('tiposMaterialesTabla', this.datos['tiposMaterialesTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarTiposMateriales(index: number, field: string, value: any) {
    if (!this.datos['tiposMaterialesTabla']) {
      this.inicializarTiposMateriales();
    }
    if (this.datos['tiposMaterialesTabla'][index]) {
      this.datos['tiposMaterialesTabla'][index][field] = value;
      this.formularioService.actualizarDato('tiposMaterialesTabla', this.datos['tiposMaterialesTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  onImagenEstructuraChange(imagenBase64: string) {
    this.fotoEstructuraPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaEstructuraImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  inicializarAbastecimientoAgua() {
    if (!this.datos['abastecimientoAguaTabla'] || this.datos['abastecimientoAguaTabla'].length === 0) {
      this.datos['abastecimientoAguaTabla'] = [
        { categoria: 'Viviendas con abastecimiento de agua por red pública', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas con abastecimiento de agua por pilón', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas sin abastecimiento de agua por los medios mencionados', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('abastecimientoAguaTabla', this.datos['abastecimientoAguaTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarAbastecimientoAgua() {
    if (!this.datos['abastecimientoAguaTabla']) {
      this.inicializarAbastecimientoAgua();
    }
    const totalIndex = this.datos['abastecimientoAguaTabla'].findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['abastecimientoAguaTabla'].splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['abastecimientoAguaTabla'].push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('abastecimientoAguaTabla', this.datos['abastecimientoAguaTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarAbastecimientoAgua(index: number) {
    if (this.datos['abastecimientoAguaTabla'] && this.datos['abastecimientoAguaTabla'].length > 1 && this.datos['abastecimientoAguaTabla'][index].categoria !== 'Total') {
      this.datos['abastecimientoAguaTabla'].splice(index, 1);
      this.formularioService.actualizarDato('abastecimientoAguaTabla', this.datos['abastecimientoAguaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarAbastecimientoAgua(index: number, field: string, value: any) {
    if (!this.datos['abastecimientoAguaTabla']) {
      this.inicializarAbastecimientoAgua();
    }
    if (this.datos['abastecimientoAguaTabla'][index]) {
      this.datos['abastecimientoAguaTabla'][index][field] = value;
      if (field === 'casos' && this.datos['abastecimientoAguaTabla'][index].categoria !== 'Total') {
        const totalCasos = this.datos['abastecimientoAguaTabla']
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos['abastecimientoAguaTabla'].find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          totalItem.porcentaje = '100,00 %';
        }
      }
      this.formularioService.actualizarDato('abastecimientoAguaTabla', this.datos['abastecimientoAguaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarTiposSaneamiento() {
    if ((!this.datos['tiposSaneamientoTabla'] || this.datos['tiposSaneamientoTabla'].length === 0) && (!this.datos['saneamientoTabla'] || this.datos['saneamientoTabla'].length === 0)) {
      this.datos['tiposSaneamientoTabla'] = [
        { categoria: 'Viviendas con saneamiento vía red pública', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas con saneamiento vía pozo séptico', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas sin saneamiento vía los medios mencionados', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('tiposSaneamientoTabla', this.datos['tiposSaneamientoTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarTiposSaneamiento() {
    if (!this.datos['tiposSaneamientoTabla'] && !this.datos['saneamientoTabla']) {
      this.inicializarTiposSaneamiento();
    }
    const tabla = this.datos['tiposSaneamientoTabla'] || this.datos['saneamientoTabla'];
    if (tabla) {
      const totalIndex = tabla.findIndex((item: any) => item.categoria === 'Total');
      if (totalIndex >= 0) {
        tabla.splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
      } else {
        tabla.push({ categoria: '', casos: 0, porcentaje: '0%' });
      }
      const key = this.datos['tiposSaneamientoTabla'] ? 'tiposSaneamientoTabla' : 'saneamientoTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  eliminarTiposSaneamiento(index: number) {
    const tabla = this.datos['tiposSaneamientoTabla'] || this.datos['saneamientoTabla'];
    if (tabla && tabla.length > 1 && tabla[index].categoria !== 'Total') {
      tabla.splice(index, 1);
      const key = this.datos['tiposSaneamientoTabla'] ? 'tiposSaneamientoTabla' : 'saneamientoTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarTiposSaneamiento(index: number, field: string, value: any) {
    if (!this.datos['tiposSaneamientoTabla'] && !this.datos['saneamientoTabla']) {
      this.inicializarTiposSaneamiento();
    }
    const tabla = this.datos['tiposSaneamientoTabla'] || this.datos['saneamientoTabla'];
    if (tabla && tabla[index]) {
      tabla[index][field] = value;
      if (field === 'casos' && tabla[index].categoria !== 'Total') {
        const totalCasos = tabla
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = tabla.find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          totalItem.porcentaje = '100,00 %';
        }
      }
      const key = this.datos['tiposSaneamientoTabla'] ? 'tiposSaneamientoTabla' : 'saneamientoTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarCoberturaElectrica() {
    if (!this.datos['coberturaElectricaTabla'] || this.datos['coberturaElectricaTabla'].length === 0) {
      this.datos['coberturaElectricaTabla'] = [
        { categoria: 'Viviendas con acceso a electricidad', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas sin acceso a electricidad', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('coberturaElectricaTabla', this.datos['coberturaElectricaTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarCoberturaElectrica() {
    if (!this.datos['coberturaElectricaTabla']) {
      this.inicializarCoberturaElectrica();
    }
    const totalIndex = this.datos['coberturaElectricaTabla'].findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['coberturaElectricaTabla'].splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['coberturaElectricaTabla'].push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('coberturaElectricaTabla', this.datos['coberturaElectricaTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCoberturaElectrica(index: number) {
    if (this.datos['coberturaElectricaTabla'] && this.datos['coberturaElectricaTabla'].length > 1 && this.datos['coberturaElectricaTabla'][index].categoria !== 'Total') {
      this.datos['coberturaElectricaTabla'].splice(index, 1);
      this.formularioService.actualizarDato('coberturaElectricaTabla', this.datos['coberturaElectricaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarCoberturaElectrica(index: number, field: string, value: any) {
    if (!this.datos['coberturaElectricaTabla']) {
      this.inicializarCoberturaElectrica();
    }
    if (this.datos['coberturaElectricaTabla'][index]) {
      this.datos['coberturaElectricaTabla'][index][field] = value;
      if (field === 'casos' && this.datos['coberturaElectricaTabla'][index].categoria !== 'Total') {
        const totalCasos = this.datos['coberturaElectricaTabla']
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos['coberturaElectricaTabla'].find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          totalItem.porcentaje = '100,00 %';
        }
      }
      this.formularioService.actualizarDato('coberturaElectricaTabla', this.datos['coberturaElectricaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  onImagenDesechosSolidosChange(imagenBase64: string) {
    this.fotoDesechosSolidosPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaDesechosSolidosImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  onImagenElectricidadChange(imagenBase64: string) {
    this.fotoElectricidadPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaElectricidadImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  inicializarTelecomunicaciones() {
    if (!this.datos['telecomunicacionesTabla'] || this.datos['telecomunicacionesTabla'].length === 0) {
      this.datos['telecomunicacionesTabla'] = [
        { medio: 'Emisoras de radio', descripcion: '--' },
        { medio: 'Señales de televisión', descripcion: 'América TV\nDIRECTV' },
        { medio: 'Señales de telefonía móvil', descripcion: 'Movistar\nEntel' },
        { medio: 'Señal de Internet', descripcion: 'Movistar' }
      ];
      this.formularioService.actualizarDato('telecomunicacionesTabla', this.datos['telecomunicacionesTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarTelecomunicaciones() {
    if (!this.datos['telecomunicacionesTabla']) {
      this.inicializarTelecomunicaciones();
    }
    this.datos['telecomunicacionesTabla'].push({ medio: '', descripcion: '' });
    this.formularioService.actualizarDato('telecomunicacionesTabla', this.datos['telecomunicacionesTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarTelecomunicaciones(index: number) {
    if (this.datos['telecomunicacionesTabla'] && this.datos['telecomunicacionesTabla'].length > 1) {
      this.datos['telecomunicacionesTabla'].splice(index, 1);
      this.formularioService.actualizarDato('telecomunicacionesTabla', this.datos['telecomunicacionesTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarTelecomunicaciones(index: number, field: string, value: any) {
    if (!this.datos['telecomunicacionesTabla']) {
      this.inicializarTelecomunicaciones();
    }
    if (this.datos['telecomunicacionesTabla'][index]) {
      this.datos['telecomunicacionesTabla'][index][field] = value;
      this.formularioService.actualizarDato('telecomunicacionesTabla', this.datos['telecomunicacionesTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  onImagenTransporteChange(imagenBase64: string) {
    this.fotoTransportePreview = imagenBase64 || null;
    const fotoKey = 'fotografiaTransporteImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  onImagenTelecomunicacionesChange(imagenBase64: string) {
    this.fotoTelecomunicacionesPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaTelecomunicacionesImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  inicializarCaracteristicasSalud() {
    if (!this.datos['caracteristicasSaludTabla'] || this.datos['caracteristicasSaludTabla'].length === 0) {
      this.datos['caracteristicasSaludTabla'] = [
        { categoria: 'Nombre', descripcion: 'Puesto de Salud Ayroca' },
        { categoria: 'Ubicación', descripcion: 'Ayroca – Cahuacho – Caravelí – Arequipa' },
        { categoria: 'Director Médico y/o Responsable de la Atención de Salud', descripcion: 'Daniela Manuel Sivinche' },
        { categoria: 'Código Único de IPRESS', descripcion: '00001379' },
        { categoria: 'Categoría del EESS', descripcion: 'I – 2' },
        { categoria: 'Tipo de Establecimiento de Salud', descripcion: 'Establecimiento de salud sin internamiento' },
        { categoria: 'Nombre de la subcategoría (Clasificación)', descripcion: 'Puestos de salud o postas médicas' },
        { categoria: 'Estado del EESS', descripcion: 'Activo' },
        { categoria: 'Condición del EESS', descripcion: 'Activo' },
        { categoria: 'Nombre de DISA/DIRESA', descripcion: 'DIRESA Arequipa' },
        { categoria: 'Nombre de RED', descripcion: 'Camaná – Caravelí' },
        { categoria: 'Nombre de MICRORED', descripcion: 'Caravelí' },
        { categoria: 'Institución a la que pertenece el establecimiento', descripcion: 'MINSA' },
        { categoria: 'Teléfono del establecimiento', descripcion: '944 649 039 (Obstetra Daniela Núñez)' },
        { categoria: 'Grupo objetivo', descripcion: 'Población general' },
        { categoria: 'Número de ambientes con los que cuenta el establecimiento', descripcion: '8' },
        { categoria: 'Horario de atención', descripcion: '08:00 – 20:00' },
        { categoria: 'Número de atenciones mensuales', descripcion: '400' },
        { categoria: 'Infraestructura y servicios', descripcion: '• El establecimiento cuenta con los servicios básicos de agua, desagüe y electricidad.\n• Se cuenta con paneles solares que permiten la refrigeración de vacunas.\n• No tiene acceso a Internet.\n• Los desechos sólidos comunes son recogidos por la municipalidad (mensualmente), mientras que los biocontaminados por la RED.\n• La infraestructura del establecimiento consta de bloquetas en las paredes, calamina en los techos y cerámicos en los pisos.\n• El personal del establecimiento está conformado por cinco miembros: médico, obstetra, enfermera, y dos técnicos en enfermería.\n• Entre los servicios que se brindan se hallan los siguientes: medicina, obstetricia y enfermería. De manera complementaria se coordina campañas de psicología y salud bucal con la MICRORED.\n• Se cuenta con una ambulancia de tipo I – 1.' }
      ];
      this.formularioService.actualizarDato('caracteristicasSaludTabla', this.datos['caracteristicasSaludTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarCaracteristicasSalud() {
    if (!this.datos['caracteristicasSaludTabla']) {
      this.inicializarCaracteristicasSalud();
    }
    this.datos['caracteristicasSaludTabla'].push({ categoria: '', descripcion: '' });
    this.formularioService.actualizarDato('caracteristicasSaludTabla', this.datos['caracteristicasSaludTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCaracteristicasSalud(index: number) {
    if (this.datos['caracteristicasSaludTabla'] && this.datos['caracteristicasSaludTabla'].length > 1) {
      this.datos['caracteristicasSaludTabla'].splice(index, 1);
      this.formularioService.actualizarDato('caracteristicasSaludTabla', this.datos['caracteristicasSaludTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarCaracteristicasSalud(index: number, field: string, value: any) {
    if (!this.datos['caracteristicasSaludTabla']) {
      this.inicializarCaracteristicasSalud();
    }
    if (this.datos['caracteristicasSaludTabla'][index]) {
      this.datos['caracteristicasSaludTabla'][index][field] = value;
      this.formularioService.actualizarDato('caracteristicasSaludTabla', this.datos['caracteristicasSaludTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarCantidadEstudiantesEducacion() {
    if (!this.datos['cantidadEstudiantesEducacionTabla'] || this.datos['cantidadEstudiantesEducacionTabla'].length === 0) {
      this.datos['cantidadEstudiantesEducacionTabla'] = [
        { institucion: 'IE Ayroca', nivel: 'Inicial - Jardín', gestion: 'Pública de gestión directa', total: 0, porcentaje: '0%' },
        { institucion: 'IE N°40270', nivel: 'Primaria', gestion: 'Pública de gestión directa', total: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('cantidadEstudiantesEducacionTabla', this.datos['cantidadEstudiantesEducacionTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarCantidadEstudiantesEducacion() {
    if (!this.datos['cantidadEstudiantesEducacionTabla']) {
      this.inicializarCantidadEstudiantesEducacion();
    }
    this.datos['cantidadEstudiantesEducacionTabla'].push({ institucion: '', nivel: '', gestion: '', total: 0, porcentaje: '0%' });
    this.formularioService.actualizarDato('cantidadEstudiantesEducacionTabla', this.datos['cantidadEstudiantesEducacionTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCantidadEstudiantesEducacion(index: number) {
    if (this.datos['cantidadEstudiantesEducacionTabla'] && this.datos['cantidadEstudiantesEducacionTabla'].length > 1) {
      this.datos['cantidadEstudiantesEducacionTabla'].splice(index, 1);
      this.formularioService.actualizarDato('cantidadEstudiantesEducacionTabla', this.datos['cantidadEstudiantesEducacionTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarCantidadEstudiantesEducacion(index: number, field: string, value: any) {
    if (!this.datos['cantidadEstudiantesEducacionTabla']) {
      this.inicializarCantidadEstudiantesEducacion();
    }
    if (this.datos['cantidadEstudiantesEducacionTabla'][index]) {
      this.datos['cantidadEstudiantesEducacionTabla'][index][field] = value;
      this.formularioService.actualizarDato('cantidadEstudiantesEducacionTabla', this.datos['cantidadEstudiantesEducacionTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarIEAyroca() {
    if (!this.datos['ieAyrocaTabla'] || this.datos['ieAyrocaTabla'].length === 0) {
      this.datos['ieAyrocaTabla'] = [
        { categoria: 'Tipo de I.E.', descripcion: 'Pública de gestión directa, mixta' },
        { categoria: 'Nombre del(la) director(a)', descripcion: 'María Elena Aguayo Arias' },
        { categoria: 'Características y observaciones', descripcion: '• La institución educativa data del año 1989, aproximadamente.\n• La directora de la institución es a la vez profesora de los alumnos (unidocente). Se dispone de una sola aula.\n• El establecimiento cuenta con los servicios básicos de agua, desagüe y electricidad.\n• No tiene acceso a Internet.\n• Se clasifican los residuos sólidos, pero estos no son recolectados frecuentemente por la municipalidad.\n• La infraestructura consta de material noble en las paredes, calamina en los techos y mayólica en los pisos.\n• Se cuenta con el ambiente para la cocina y el comedor, pero hace falta la implementación del mismo.\n• No se cuenta con una biblioteca, por lo que se improvisa con un pequeño estante.\n• Los juegos recreativos de la institución se encuentran en condiciones precarias, puesto que se hallan oxidados.\n• Se halla una pequeña losa deportiva de cemento para que los alumnos puedan desarrollar actividad física.' }
      ];
      this.formularioService.actualizarDato('ieAyrocaTabla', this.datos['ieAyrocaTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarIEAyroca() {
    if (!this.datos['ieAyrocaTabla']) {
      this.inicializarIEAyroca();
    }
    this.datos['ieAyrocaTabla'].push({ categoria: '', descripcion: '' });
    this.formularioService.actualizarDato('ieAyrocaTabla', this.datos['ieAyrocaTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarIEAyroca(index: number) {
    if (this.datos['ieAyrocaTabla'] && this.datos['ieAyrocaTabla'].length > 1) {
      this.datos['ieAyrocaTabla'].splice(index, 1);
      this.formularioService.actualizarDato('ieAyrocaTabla', this.datos['ieAyrocaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarIEAyroca(index: number, field: string, value: any) {
    if (!this.datos['ieAyrocaTabla']) {
      this.inicializarIEAyroca();
    }
    if (this.datos['ieAyrocaTabla'][index]) {
      this.datos['ieAyrocaTabla'][index][field] = value;
      this.formularioService.actualizarDato('ieAyrocaTabla', this.datos['ieAyrocaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarIE40270() {
    if (!this.datos['ie40270Tabla'] || this.datos['ie40270Tabla'].length === 0) {
      this.datos['ie40270Tabla'] = [
        { categoria: 'Tipo de I.E.', descripcion: 'Pública de gestión directa, mixta' },
        { categoria: 'Nombre del(la) director(a)', descripcion: 'Nieves Bernaola Torres' },
        { categoria: 'Características y observaciones', descripcion: '• Se tiene en funcionamiento dos aulas, cada una es dirigida por una docente. Una de ellas es, a la vez, directora de la institución educativa.\n• La infraestructura de las aulas consta principalmente de material noble en las paredes, calamina en los techos y mayólica en los pisos.\n• La institución cuenta con los servicios básicos de agua, desagüe y electricidad.\n• No tiene acceso a Internet.\n• Se cuenta con una cocina y un comedor, en un solo ambiente compartido.\n• No tiene biblioteca propia, por lo que se ha improvisado con estantes.\n• No se cuenta con una sala de computación, aunque si se posee tabletas electrónicas.\n• Los juegos recreativos de la institución se encuentran en condiciones precarias, puesto que se hallan oxidados.\n• Se halla una losa deportiva de cemento para que los alumnos puedan desarrollar actividad física.' }
      ];
      this.formularioService.actualizarDato('ie40270Tabla', this.datos['ie40270Tabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarIE40270() {
    if (!this.datos['ie40270Tabla']) {
      this.inicializarIE40270();
    }
    this.datos['ie40270Tabla'].push({ categoria: '', descripcion: '' });
    this.formularioService.actualizarDato('ie40270Tabla', this.datos['ie40270Tabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarIE40270(index: number) {
    if (this.datos['ie40270Tabla'] && this.datos['ie40270Tabla'].length > 1) {
      this.datos['ie40270Tabla'].splice(index, 1);
      this.formularioService.actualizarDato('ie40270Tabla', this.datos['ie40270Tabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarIE40270(index: number, field: string, value: any) {
    if (!this.datos['ie40270Tabla']) {
      this.inicializarIE40270();
    }
    if (this.datos['ie40270Tabla'][index]) {
      this.datos['ie40270Tabla'][index][field] = value;
      this.formularioService.actualizarDato('ie40270Tabla', this.datos['ie40270Tabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarAlumnosIEAyroca() {
    if (!this.datos['alumnosIEAyrocaTabla'] || this.datos['alumnosIEAyrocaTabla'].length === 0) {
      this.datos['alumnosIEAyrocaTabla'] = [
        { nombre: 'IE Ayroca', nivel: 'Inicial – Jardín', totalH: 0, totalM: 0, tresH: 0, tresM: 0, cuatroH: 0, cuatroM: 0, cincoH: 0, cincoM: 0 }
      ];
      this.formularioService.actualizarDato('alumnosIEAyrocaTabla', this.datos['alumnosIEAyrocaTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarAlumnosIEAyroca() {
    if (!this.datos['alumnosIEAyrocaTabla']) {
      this.inicializarAlumnosIEAyroca();
    }
    this.datos['alumnosIEAyrocaTabla'].push({ nombre: '', nivel: '', totalH: 0, totalM: 0, tresH: 0, tresM: 0, cuatroH: 0, cuatroM: 0, cincoH: 0, cincoM: 0 });
    this.formularioService.actualizarDato('alumnosIEAyrocaTabla', this.datos['alumnosIEAyrocaTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarAlumnosIEAyroca(index: number) {
    if (this.datos['alumnosIEAyrocaTabla'] && this.datos['alumnosIEAyrocaTabla'].length > 1) {
      this.datos['alumnosIEAyrocaTabla'].splice(index, 1);
      this.formularioService.actualizarDato('alumnosIEAyrocaTabla', this.datos['alumnosIEAyrocaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarAlumnosIEAyroca(index: number, field: string, value: any) {
    if (!this.datos['alumnosIEAyrocaTabla']) {
      this.inicializarAlumnosIEAyroca();
    }
    if (this.datos['alumnosIEAyrocaTabla'][index]) {
      this.datos['alumnosIEAyrocaTabla'][index][field] = value;
      this.formularioService.actualizarDato('alumnosIEAyrocaTabla', this.datos['alumnosIEAyrocaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarAlumnosIE40270() {
    if (!this.datos['alumnosIE40270Tabla'] || this.datos['alumnosIE40270Tabla'].length === 0) {
      this.datos['alumnosIE40270Tabla'] = [
        { nombre: 'IE N°40270', nivel: 'Primaria', totalH: 0, totalM: 0, p1H: 0, p1M: 0, p2H: 0, p2M: 0, p3H: 0, p3M: 0, p4H: 0, p4M: 0, p5H: 0, p5M: 0, p6H: 0, p6M: 0 }
      ];
      this.formularioService.actualizarDato('alumnosIE40270Tabla', this.datos['alumnosIE40270Tabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarAlumnosIE40270() {
    if (!this.datos['alumnosIE40270Tabla']) {
      this.inicializarAlumnosIE40270();
    }
    this.datos['alumnosIE40270Tabla'].push({ nombre: '', nivel: '', totalH: 0, totalM: 0, p1H: 0, p1M: 0, p2H: 0, p2M: 0, p3H: 0, p3M: 0, p4H: 0, p4M: 0, p5H: 0, p5M: 0, p6H: 0, p6M: 0 });
    this.formularioService.actualizarDato('alumnosIE40270Tabla', this.datos['alumnosIE40270Tabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarAlumnosIE40270(index: number) {
    if (this.datos['alumnosIE40270Tabla'] && this.datos['alumnosIE40270Tabla'].length > 1) {
      this.datos['alumnosIE40270Tabla'].splice(index, 1);
      this.formularioService.actualizarDato('alumnosIE40270Tabla', this.datos['alumnosIE40270Tabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarAlumnosIE40270(index: number, field: string, value: any) {
    if (!this.datos['alumnosIE40270Tabla']) {
      this.inicializarAlumnosIE40270();
    }
    if (this.datos['alumnosIE40270Tabla'][index]) {
      this.datos['alumnosIE40270Tabla'][index][field] = value;
      this.formularioService.actualizarDato('alumnosIE40270Tabla', this.datos['alumnosIE40270Tabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  getFotografiasEducacionForm(): any[] {
    if (this.fotosEducacion.length === 0) {
      for (let i = 1; i <= 2; i++) {
        const imagenKey = i === 1 ? 'fotografiaIEAyrocaImagen' : 'fotografiaIE40270Imagen';
        const tituloKey = i === 1 ? 'fotografiaIEAyrocaTitulo' : 'fotografiaIE40270Titulo';
        const fuenteKey = i === 1 ? 'fotografiaIEAyrocaFuente' : 'fotografiaIE40270Fuente';
        const tituloDefault = i === 1 ? 'Infraestructura de la IE ' + (this.datos.grupoAISD || 'Ayroca') : 'Infraestructura de la IE N°40270';
        this.fotosEducacion.push({
          titulo: this.datos[tituloKey] || tituloDefault,
          fuente: this.datos[fuenteKey] || 'GEADES, 2024',
          preview: this.datos[imagenKey] || null
        });
      }
    } else {
      for (let i = 0; i < this.fotosEducacion.length; i++) {
        const imagenKey = i === 0 ? 'fotografiaIEAyrocaImagen' : 'fotografiaIE40270Imagen';
        const tituloKey = i === 0 ? 'fotografiaIEAyrocaTitulo' : 'fotografiaIE40270Titulo';
        const fuenteKey = i === 0 ? 'fotografiaIEAyrocaFuente' : 'fotografiaIE40270Fuente';
        const tituloDefault = i === 0 ? 'Infraestructura de la IE ' + (this.datos.grupoAISD || 'Ayroca') : 'Infraestructura de la IE N°40270';
        if (!this.fotosEducacion[i].preview && this.datos[imagenKey]) {
          this.fotosEducacion[i].preview = this.datos[imagenKey];
        }
        if (!this.fotosEducacion[i].titulo && this.datos[tituloKey]) {
          this.fotosEducacion[i].titulo = this.datos[tituloKey];
        } else if (!this.fotosEducacion[i].titulo) {
          this.fotosEducacion[i].titulo = tituloDefault;
        }
        if (!this.fotosEducacion[i].fuente && this.datos[fuenteKey]) {
          this.fotosEducacion[i].fuente = this.datos[fuenteKey];
        } else if (!this.fotosEducacion[i].fuente) {
          this.fotosEducacion[i].fuente = 'GEADES, 2024';
        }
      }
    }
    return this.fotosEducacion;
  }

  actualizarFotoEducacion(index: number, field: string, value: any) {
    if (index === 0) {
      const key = field === 'titulo' ? 'fotografiaIEAyrocaTitulo' : field === 'fuente' ? 'fotografiaIEAyrocaFuente' : 'fotografiaIEAyrocaImagen';
      this.onFieldChange(key, value);
      if (this.fotosEducacion[index]) {
        this.fotosEducacion[index][field === 'imagen' ? 'preview' : field] = value;
      }
    } else {
      const key = field === 'titulo' ? 'fotografiaIE40270Titulo' : field === 'fuente' ? 'fotografiaIE40270Fuente' : 'fotografiaIE40270Imagen';
      this.onFieldChange(key, value);
      if (this.fotosEducacion[index]) {
        this.fotosEducacion[index][field === 'imagen' ? 'preview' : field] = value;
      }
    }
    this.cdRef.detectChanges();
  }

  getFotografiasRecreacionForm(): any[] {
    const titulosDefault = [
      'Parque recreacional público del anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'Plaza de toros del anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'Plaza central del anexo ' + (this.datos.grupoAISD || 'Ayroca')
    ];
    if (this.fotosRecreacion.length === 0) {
      for (let i = 1; i <= 3; i++) {
        const imagenKey = `fotografiaRecreacion${i}Imagen`;
        const tituloKey = `fotografiaRecreacion${i}Titulo`;
        const fuenteKey = `fotografiaRecreacion${i}Fuente`;
        this.fotosRecreacion.push({
          titulo: this.datos[tituloKey] || titulosDefault[i - 1],
          fuente: this.datos[fuenteKey] || 'GEADES, 2024',
          preview: this.datos[imagenKey] || null
        });
      }
    } else {
      for (let i = 0; i < this.fotosRecreacion.length; i++) {
        const imagenKey = `fotografiaRecreacion${i + 1}Imagen`;
        const tituloKey = `fotografiaRecreacion${i + 1}Titulo`;
        const fuenteKey = `fotografiaRecreacion${i + 1}Fuente`;
        if (!this.fotosRecreacion[i].preview && this.datos[imagenKey]) {
          this.fotosRecreacion[i].preview = this.datos[imagenKey];
        }
        if (!this.fotosRecreacion[i].titulo && this.datos[tituloKey]) {
          this.fotosRecreacion[i].titulo = this.datos[tituloKey];
        } else if (!this.fotosRecreacion[i].titulo) {
          this.fotosRecreacion[i].titulo = titulosDefault[i];
        }
        if (!this.fotosRecreacion[i].fuente && this.datos[fuenteKey]) {
          this.fotosRecreacion[i].fuente = this.datos[fuenteKey];
        } else if (!this.fotosRecreacion[i].fuente) {
          this.fotosRecreacion[i].fuente = 'GEADES, 2024';
        }
      }
    }
    return this.fotosRecreacion;
  }

  actualizarFotoRecreacion(index: number, field: string, value: any) {
    const key = field === 'titulo' ? `fotografiaRecreacion${index + 1}Titulo` : field === 'fuente' ? `fotografiaRecreacion${index + 1}Fuente` : `fotografiaRecreacion${index + 1}Imagen`;
    this.onFieldChange(key, value);
    if (this.fotosRecreacion[index]) {
      this.fotosRecreacion[index][field === 'imagen' ? 'preview' : field] = value;
    }
    this.cdRef.detectChanges();
  }

  getPlaceholderRecreacion(index: number): string {
    const placeholders = [
      'Ej: Parque recreacional público del anexo Ayroca',
      'Ej: Plaza de toros del anexo Ayroca',
      'Ej: Plaza central del anexo Ayroca'
    ];
    return placeholders[index] || 'Ej: Fotografía de recreación';
  }

  getFotografiasDeporteForm(): any[] {
    const titulosDefault = [
      'Losa deportiva del anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'Estadio del anexo ' + (this.datos.grupoAISD || 'Ayroca')
    ];
    if (this.fotosDeporte.length === 0) {
      for (let i = 1; i <= 2; i++) {
        const imagenKey = `fotografiaDeporte${i}Imagen`;
        const tituloKey = `fotografiaDeporte${i}Titulo`;
        const fuenteKey = `fotografiaDeporte${i}Fuente`;
        this.fotosDeporte.push({
          titulo: this.datos[tituloKey] || titulosDefault[i - 1],
          fuente: this.datos[fuenteKey] || 'GEADES, 2024',
          preview: this.datos[imagenKey] || null
        });
      }
    } else {
      for (let i = 0; i < this.fotosDeporte.length; i++) {
        const imagenKey = `fotografiaDeporte${i + 1}Imagen`;
        const tituloKey = `fotografiaDeporte${i + 1}Titulo`;
        const fuenteKey = `fotografiaDeporte${i + 1}Fuente`;
        if (!this.fotosDeporte[i].preview && this.datos[imagenKey]) {
          this.fotosDeporte[i].preview = this.datos[imagenKey];
        }
        if (!this.fotosDeporte[i].titulo && this.datos[tituloKey]) {
          this.fotosDeporte[i].titulo = this.datos[tituloKey];
        } else if (!this.fotosDeporte[i].titulo) {
          this.fotosDeporte[i].titulo = titulosDefault[i];
        }
        if (!this.fotosDeporte[i].fuente && this.datos[fuenteKey]) {
          this.fotosDeporte[i].fuente = this.datos[fuenteKey];
        } else if (!this.fotosDeporte[i].fuente) {
          this.fotosDeporte[i].fuente = 'GEADES, 2024';
        }
      }
    }
    return this.fotosDeporte;
  }

  actualizarFotoDeporte(index: number, field: string, value: any) {
    const key = field === 'titulo' ? `fotografiaDeporte${index + 1}Titulo` : field === 'fuente' ? `fotografiaDeporte${index + 1}Fuente` : `fotografiaDeporte${index + 1}Imagen`;
    this.onFieldChange(key, value);
    if (this.fotosDeporte[index]) {
      this.fotosDeporte[index][field === 'imagen' ? 'preview' : field] = value;
    }
    this.cdRef.detectChanges();
  }

  onImagenSaludChange(imagenBase64: string) {
    this.fotoSaludPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaSaludImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  inicializarNatalidadMortalidad() {
    if (!this.datos['natalidadMortalidadTabla'] || this.datos['natalidadMortalidadTabla'].length === 0) {
      this.datos['natalidadMortalidadTabla'] = [
        { anio: '2023', natalidad: 0, mortalidad: 0 },
        { anio: '2024 (hasta 13/11)', natalidad: 0, mortalidad: 0 }
      ];
      this.formularioService.actualizarDato('natalidadMortalidadTabla', this.datos['natalidadMortalidadTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarNatalidadMortalidad() {
    if (!this.datos['natalidadMortalidadTabla']) {
      this.inicializarNatalidadMortalidad();
    }
    this.datos['natalidadMortalidadTabla'].push({ anio: '', natalidad: 0, mortalidad: 0 });
    this.formularioService.actualizarDato('natalidadMortalidadTabla', this.datos['natalidadMortalidadTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarNatalidadMortalidad(index: number) {
    if (this.datos['natalidadMortalidadTabla'] && this.datos['natalidadMortalidadTabla'].length > 1) {
      this.datos['natalidadMortalidadTabla'].splice(index, 1);
      this.formularioService.actualizarDato('natalidadMortalidadTabla', this.datos['natalidadMortalidadTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarNatalidadMortalidad(index: number, field: string, value: any) {
    if (!this.datos['natalidadMortalidadTabla']) {
      this.inicializarNatalidadMortalidad();
    }
    if (this.datos['natalidadMortalidadTabla'][index]) {
      this.datos['natalidadMortalidadTabla'][index][field] = value;
      this.formularioService.actualizarDato('natalidadMortalidadTabla', this.datos['natalidadMortalidadTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarMorbilidad() {
    if ((!this.datos['morbilidadTabla'] || this.datos['morbilidadTabla'].length === 0) && (!this.datos['morbiliadTabla'] || this.datos['morbiliadTabla'].length === 0)) {
      this.datos['morbilidadTabla'] = [
        { grupo: 'Enfermedades infecciosas intestinales', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 },
        { grupo: 'Obesidad y otros de hiperalimentación', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 },
        { grupo: 'Infecciones agudas de las vías respiratorias superiores', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 },
        { grupo: 'Enfermedades de la cavidad bucal, de las glándulas salivales y de los maxilares', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 },
        { grupo: 'Enfermedades del esófago, del estómago y del duodeno', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 },
        { grupo: 'Artropatías', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 },
        { grupo: 'Dorsopatías', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 },
        { grupo: 'Otras enfermedades del sistema urinario', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 },
        { grupo: 'Síntomas y signos que involucran el sistema digestivo y el abdomen', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 },
        { grupo: 'Síntomas y signos generales', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 }
      ];
      this.formularioService.actualizarDato('morbilidadTabla', this.datos['morbilidadTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarMorbilidad() {
    if (!this.datos['morbilidadTabla'] && !this.datos['morbiliadTabla']) {
      this.inicializarMorbilidad();
    }
    const tabla = this.datos['morbilidadTabla'] || this.datos['morbiliadTabla'];
    if (tabla) {
      tabla.push({ grupo: '', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 });
      const key = this.datos['morbilidadTabla'] ? 'morbilidadTabla' : 'morbiliadTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  eliminarMorbilidad(index: number) {
    const tabla = this.datos['morbilidadTabla'] || this.datos['morbiliadTabla'];
    if (tabla && tabla.length > 1) {
      tabla.splice(index, 1);
      const key = this.datos['morbilidadTabla'] ? 'morbilidadTabla' : 'morbiliadTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarMorbilidad(index: number, field: string, value: any) {
    if (!this.datos['morbilidadTabla'] && !this.datos['morbiliadTabla']) {
      this.inicializarMorbilidad();
    }
    const tabla = this.datos['morbilidadTabla'] || this.datos['morbiliadTabla'];
    if (tabla && tabla[index]) {
      tabla[index][field] = value;
      if (field !== 'casos') {
        const total = (parseInt(tabla[index].rango0_11) || 0) + 
                     (parseInt(tabla[index].rango12_17) || 0) + 
                     (parseInt(tabla[index].rango18_29) || 0) + 
                     (parseInt(tabla[index].rango30_59) || 0) + 
                     (parseInt(tabla[index].rango60) || 0);
        tabla[index].casos = total;
      }
      const key = this.datos['morbilidadTabla'] ? 'morbilidadTabla' : 'morbiliadTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarAfiliacionSalud() {
    if ((!this.datos['afiliacionSaludTabla'] || this.datos['afiliacionSaludTabla'].length === 0) && (!this.datos['seguroSaludTabla'] || this.datos['seguroSaludTabla'].length === 0)) {
      this.datos['afiliacionSaludTabla'] = [
        { categoria: 'Seguro Integral de Salud (SIS)', casos: 0, porcentaje: '0%' },
        { categoria: 'ESSALUD', casos: 0, porcentaje: '0%' },
        { categoria: 'Ningún seguro', casos: 0, porcentaje: '0%' },
        { categoria: 'Total referencial', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('afiliacionSaludTabla', this.datos['afiliacionSaludTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarAfiliacionSalud() {
    if (!this.datos['afiliacionSaludTabla'] && !this.datos['seguroSaludTabla']) {
      this.inicializarAfiliacionSalud();
    }
    const tabla = this.datos['afiliacionSaludTabla'] || this.datos['seguroSaludTabla'];
    if (tabla) {
      const totalIndex = tabla.findIndex((item: any) => item.categoria === 'Total referencial');
      if (totalIndex >= 0) {
        tabla.splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
      } else {
        tabla.push({ categoria: '', casos: 0, porcentaje: '0%' });
      }
      const key = this.datos['afiliacionSaludTabla'] ? 'afiliacionSaludTabla' : 'seguroSaludTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  eliminarAfiliacionSalud(index: number) {
    const tabla = this.datos['afiliacionSaludTabla'] || this.datos['seguroSaludTabla'];
    if (tabla && tabla.length > 1 && tabla[index].categoria !== 'Total referencial') {
      tabla.splice(index, 1);
      const key = this.datos['afiliacionSaludTabla'] ? 'afiliacionSaludTabla' : 'seguroSaludTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarAfiliacionSalud(index: number, field: string, value: any) {
    if (!this.datos['afiliacionSaludTabla'] && !this.datos['seguroSaludTabla']) {
      this.inicializarAfiliacionSalud();
    }
    const tabla = this.datos['afiliacionSaludTabla'] || this.datos['seguroSaludTabla'];
    if (tabla && tabla[index]) {
      tabla[index][field] = value;
      if (field === 'casos' && tabla[index].categoria !== 'Total referencial') {
        const totalCasos = tabla
          .filter((item: any) => item.categoria !== 'Total referencial')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = tabla.find((item: any) => item.categoria === 'Total referencial');
        if (totalItem) {
          totalItem.casos = totalCasos;
        }
      }
      const key = this.datos['afiliacionSaludTabla'] ? 'afiliacionSaludTabla' : 'seguroSaludTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarNivelEducativo() {
    if (!this.datos['nivelEducativoTabla'] || this.datos['nivelEducativoTabla'].length === 0) {
      this.datos['nivelEducativoTabla'] = [
        { categoria: 'Sin nivel o Inicial', casos: 0, porcentaje: '0%' },
        { categoria: 'Primaria', casos: 0, porcentaje: '0%' },
        { categoria: 'Secundaria', casos: 0, porcentaje: '0%' },
        { categoria: 'Superior no Universitaria', casos: 0, porcentaje: '0%' },
        { categoria: 'Superior Universitaria', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '100,00%' }
      ];
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarNivelEducativo() {
    if (!this.datos['nivelEducativoTabla']) {
      this.inicializarNivelEducativo();
    }
    const totalIndex = this.datos['nivelEducativoTabla'].findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['nivelEducativoTabla'].splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['nivelEducativoTabla'].push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarNivelEducativo(index: number) {
    if (this.datos['nivelEducativoTabla'] && this.datos['nivelEducativoTabla'].length > 1 && this.datos['nivelEducativoTabla'][index].categoria !== 'Total') {
      this.datos['nivelEducativoTabla'].splice(index, 1);
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarNivelEducativo(index: number, field: string, value: any) {
    if (!this.datos['nivelEducativoTabla']) {
      this.inicializarNivelEducativo();
    }
    if (this.datos['nivelEducativoTabla'][index]) {
      this.datos['nivelEducativoTabla'][index][field] = value;
      if (field === 'casos' && this.datos['nivelEducativoTabla'][index].categoria !== 'Total') {
        const totalCasos = this.datos['nivelEducativoTabla']
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos['nivelEducativoTabla'].find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          if (totalCasos > 0) {
            totalItem.porcentaje = '100,00%';
          }
        }
      }
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarTasaAnalfabetismo() {
    if (!this.datos['tasaAnalfabetismoTabla'] || this.datos['tasaAnalfabetismoTabla'].length === 0) {
      this.datos['tasaAnalfabetismoTabla'] = [
        { indicador: 'Sabe leer y escribir', casos: 0, porcentaje: '0%' },
        { indicador: 'No sabe leer ni escribir', casos: 0, porcentaje: '0%' },
        { indicador: 'Total', casos: 0, porcentaje: '100,00%' }
      ];
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarTasaAnalfabetismo() {
    if (!this.datos['tasaAnalfabetismoTabla']) {
      this.inicializarTasaAnalfabetismo();
    }
    const totalIndex = this.datos['tasaAnalfabetismoTabla'].findIndex((item: any) => item.indicador === 'Total');
    if (totalIndex >= 0) {
      this.datos['tasaAnalfabetismoTabla'].splice(totalIndex, 0, { indicador: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['tasaAnalfabetismoTabla'].push({ indicador: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarTasaAnalfabetismo(index: number) {
    if (this.datos['tasaAnalfabetismoTabla'] && this.datos['tasaAnalfabetismoTabla'].length > 1 && this.datos['tasaAnalfabetismoTabla'][index].indicador !== 'Total') {
      this.datos['tasaAnalfabetismoTabla'].splice(index, 1);
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarTasaAnalfabetismo(index: number, field: string, value: any) {
    if (!this.datos['tasaAnalfabetismoTabla']) {
      this.inicializarTasaAnalfabetismo();
    }
    if (this.datos['tasaAnalfabetismoTabla'][index]) {
      this.datos['tasaAnalfabetismoTabla'][index][field] = value;
      if (field === 'casos' && this.datos['tasaAnalfabetismoTabla'][index].indicador !== 'Total') {
        const totalCasos = this.datos['tasaAnalfabetismoTabla']
          .filter((item: any) => item.indicador !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos['tasaAnalfabetismoTabla'].find((item: any) => item.indicador === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          if (totalCasos > 0) {
            totalItem.porcentaje = '100,00%';
          }
        }
      }
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarLenguasMaternas() {
    if (!this.datos['lenguasMaternasTabla'] || this.datos['lenguasMaternasTabla'].length === 0) {
      this.datos['lenguasMaternasTabla'] = [
        { categoria: 'Castellano', casos: 0, porcentaje: '0%' },
        { categoria: 'Quechua', casos: 0, porcentaje: '0%' },
        { categoria: 'No sabe / No responde', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '100,00%' }
      ];
      this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos['lenguasMaternasTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarLenguasMaternas() {
    if (!this.datos['lenguasMaternasTabla']) {
      this.inicializarLenguasMaternas();
    }
    if (!this.datos['lenguasMaternasTabla']) {
      this.inicializarLenguasMaternas();
    }
    const totalIndex = this.datos['lenguasMaternasTabla']!.findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['lenguasMaternasTabla']!.splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['lenguasMaternasTabla']!.push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos['lenguasMaternasTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarLenguasMaternas(index: number) {
    if (this.datos['lenguasMaternasTabla'] && this.datos['lenguasMaternasTabla'].length > 1 && this.datos['lenguasMaternasTabla'][index].categoria !== 'Total') {
      this.datos['lenguasMaternasTabla'].splice(index, 1);
      this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos['lenguasMaternasTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarLenguasMaternas(index: number, field: string, value: any) {
    if (!this.datos['lenguasMaternasTabla']) {
      this.inicializarLenguasMaternas();
    }
    if (this.datos['lenguasMaternasTabla'] && this.datos['lenguasMaternasTabla'][index]) {
      this.datos['lenguasMaternasTabla'][index][field] = value;
      if (field === 'casos' && this.datos['lenguasMaternasTabla'][index].categoria !== 'Total') {
        const totalCasos = this.datos['lenguasMaternasTabla']
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos['lenguasMaternasTabla'].find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          if (totalCasos > 0) {
            totalItem.porcentaje = '100,00%';
          }
        }
      }
      this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos['lenguasMaternasTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarReligiones() {
    if (!this.datos['religionesTabla'] || this.datos['religionesTabla'].length === 0) {
      this.datos['religionesTabla'] = [
        { categoria: 'Católica', casos: 0, porcentaje: '0%' },
        { categoria: 'Evangélica', casos: 0, porcentaje: '0%' },
        { categoria: 'Otra', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '100,00%' }
      ];
      this.formularioService.actualizarDato('religionesTabla', this.datos['religionesTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarReligiones() {
    if (!this.datos['religionesTabla']) {
      this.inicializarReligiones();
    }
    const totalIndex = this.datos['religionesTabla'].findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['religionesTabla'].splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['religionesTabla'].push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('religionesTabla', this.datos['religionesTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarReligiones(index: number) {
    if (this.datos['religionesTabla'] && this.datos['religionesTabla'].length > 1 && this.datos['religionesTabla'][index].categoria !== 'Total') {
      this.datos['religionesTabla'].splice(index, 1);
      this.formularioService.actualizarDato('religionesTabla', this.datos['religionesTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarReligiones(index: number, field: string, value: any) {
    if (!this.datos['religionesTabla']) {
      this.inicializarReligiones();
    }
    if (this.datos['religionesTabla'][index]) {
      this.datos['religionesTabla'][index][field] = value;
      if (field === 'casos' && this.datos['religionesTabla'][index].categoria !== 'Total') {
        const totalCasos = this.datos['religionesTabla']
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos['religionesTabla'].find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          if (totalCasos > 0) {
            totalItem.porcentaje = '100,00%';
          }
        }
      }
      this.formularioService.actualizarDato('religionesTabla', this.datos['religionesTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  onImagenIglesiaChange(imagenBase64: string) {
    this.fotoIglesiaPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaIglesiaImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  onImagenReservorioChange(imagenBase64: string) {
    this.fotoReservorioPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaReservorioImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  onImagenUsoSuelosChange(imagenBase64: string) {
    this.fotoUsoSuelosPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaUsoSuelosImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  inicializarIndiceDesarrolloHumano() {
    if (!this.datos['indiceDesarrolloHumanoTabla'] || this.datos['indiceDesarrolloHumanoTabla'].length === 0) {
      this.datos['indiceDesarrolloHumanoTabla'] = [
        { poblacion: 0, rankIdh1: 0, idh: '', rankEsperanza: 0, esperanzaVida: '', rankEducacion1: 0, educacion: '', rankEducacion2: 0, anosEducacion: '', rankAnios: 0, ingreso: '', rankIngreso: 0 }
      ];
      this.formularioService.actualizarDato('indiceDesarrolloHumanoTabla', this.datos['indiceDesarrolloHumanoTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarIndiceDesarrolloHumano() {
    if (!this.datos['indiceDesarrolloHumanoTabla']) {
      this.inicializarIndiceDesarrolloHumano();
    }
    if (!this.datos['indiceDesarrolloHumanoTabla']) {
      this.inicializarIndiceDesarrolloHumano();
    }
    this.datos['indiceDesarrolloHumanoTabla']!.push({ poblacion: 0, rankIdh1: 0, idh: '', rankEsperanza: 0, esperanzaVida: '', rankEducacion1: 0, educacion: '', rankEducacion2: 0, anosEducacion: '', rankAnios: 0, ingreso: '', rankIngreso: 0 });
    this.formularioService.actualizarDato('indiceDesarrolloHumanoTabla', this.datos['indiceDesarrolloHumanoTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarIndiceDesarrolloHumano(index: number) {
    if (this.datos['indiceDesarrolloHumanoTabla'] && this.datos['indiceDesarrolloHumanoTabla'].length > 1) {
      this.datos['indiceDesarrolloHumanoTabla'].splice(index, 1);
      this.formularioService.actualizarDato('indiceDesarrolloHumanoTabla', this.datos['indiceDesarrolloHumanoTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarIndiceDesarrolloHumano(index: number, field: string, value: any) {
    if (!this.datos['indiceDesarrolloHumanoTabla']) {
      this.inicializarIndiceDesarrolloHumano();
    }
    if (this.datos['indiceDesarrolloHumanoTabla'] && this.datos['indiceDesarrolloHumanoTabla'][index]) {
      if (field === 'rankIngreso') {
        this.datos['indiceDesarrolloHumanoTabla'][index]['rankIngreso'] = value;
        this.datos['indiceDesarrolloHumanoTabla'][index]['rankIngresoFinal'] = value;
      } else {
        this.datos['indiceDesarrolloHumanoTabla'][index][field] = value;
      }
      this.formularioService.actualizarDato('indiceDesarrolloHumanoTabla', this.datos['indiceDesarrolloHumanoTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarNBICCAyroca() {
    if (!this.datos['nbiCCAyrocaTabla'] || this.datos['nbiCCAyrocaTabla'].length === 0) {
      this.datos['nbiCCAyrocaTabla'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('nbiCCAyrocaTabla', this.datos['nbiCCAyrocaTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarNBICCAyroca() {
    if (!this.datos['nbiCCAyrocaTabla']) {
      this.inicializarNBICCAyroca();
    }
    if (!this.datos['nbiCCAyrocaTabla']) {
      this.inicializarNBICCAyroca();
    }
    this.datos['nbiCCAyrocaTabla']!.push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('nbiCCAyrocaTabla', this.datos['nbiCCAyrocaTabla']);
    this.calcularPorcentajesNBICCAyroca();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarNBICCAyroca(index: number) {
    if (this.datos['nbiCCAyrocaTabla'] && this.datos['nbiCCAyrocaTabla'].length > 1) {
      const item = this.datos['nbiCCAyrocaTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['nbiCCAyrocaTabla'].splice(index, 1);
        this.formularioService.actualizarDato('nbiCCAyrocaTabla', this.datos['nbiCCAyrocaTabla']);
        this.calcularPorcentajesNBICCAyroca();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarNBICCAyroca(index: number, field: string, value: any) {
    if (!this.datos['nbiCCAyrocaTabla']) {
      this.inicializarNBICCAyroca();
    }
    if (this.datos['nbiCCAyrocaTabla'] && this.datos['nbiCCAyrocaTabla'][index]) {
      this.datos['nbiCCAyrocaTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesNBICCAyroca();
      }
      this.formularioService.actualizarDato('nbiCCAyrocaTabla', this.datos['nbiCCAyrocaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesNBICCAyroca() {
    if (!this.datos['nbiCCAyrocaTabla'] || this.datos['nbiCCAyrocaTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['nbiCCAyrocaTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total referencial')
    );
    const totalReferencial = totalItem ? parseFloat(String(totalItem.casos || 0)) || 0 : 0;
    
    if (totalReferencial > 0) {
      this.datos['nbiCCAyrocaTabla'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total referencial')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / totalReferencial) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarNBIDistritoCahuacho() {
    if (!this.datos['nbiDistritoCahuachoTabla'] || this.datos['nbiDistritoCahuachoTabla'].length === 0) {
      this.datos['nbiDistritoCahuachoTabla'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('nbiDistritoCahuachoTabla', this.datos['nbiDistritoCahuachoTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarNBIDistritoCahuacho() {
    if (!this.datos['nbiDistritoCahuachoTabla']) {
      this.inicializarNBIDistritoCahuacho();
    }
    if (!this.datos['nbiDistritoCahuachoTabla']) {
      this.inicializarNBIDistritoCahuacho();
    }
    this.datos['nbiDistritoCahuachoTabla']!.push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('nbiDistritoCahuachoTabla', this.datos['nbiDistritoCahuachoTabla']);
    this.calcularPorcentajesNBIDistritoCahuacho();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarNBIDistritoCahuacho(index: number) {
    if (this.datos['nbiDistritoCahuachoTabla'] && this.datos['nbiDistritoCahuachoTabla'].length > 1) {
      const item = this.datos['nbiDistritoCahuachoTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['nbiDistritoCahuachoTabla'].splice(index, 1);
        this.formularioService.actualizarDato('nbiDistritoCahuachoTabla', this.datos['nbiDistritoCahuachoTabla']);
        this.calcularPorcentajesNBIDistritoCahuacho();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarNBIDistritoCahuacho(index: number, field: string, value: any) {
    if (!this.datos['nbiDistritoCahuachoTabla']) {
      this.inicializarNBIDistritoCahuacho();
    }
    if (this.datos['nbiDistritoCahuachoTabla'] && this.datos['nbiDistritoCahuachoTabla'][index]) {
      this.datos['nbiDistritoCahuachoTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesNBIDistritoCahuacho();
      }
      this.formularioService.actualizarDato('nbiDistritoCahuachoTabla', this.datos['nbiDistritoCahuachoTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesNBIDistritoCahuacho() {
    if (!this.datos['nbiDistritoCahuachoTabla'] || this.datos['nbiDistritoCahuachoTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['nbiDistritoCahuachoTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total referencial')
    );
    const totalReferencial = totalItem ? parseFloat(String(totalItem.casos || 0)) || 0 : 0;
    
    if (totalReferencial > 0) {
      this.datos['nbiDistritoCahuachoTabla'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total referencial')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / totalReferencial) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarAutoridades() {
    if (!this.datos.autoridades || this.datos.autoridades.length === 0) {
      this.datos.autoridades = [
        { organizacion: '', cargo: '', nombre: '' }
      ];
      this.formularioService.actualizarDato('autoridades', this.datos.autoridades);
      this.cdRef.detectChanges();
    }
  }

  agregarAutoridades() {
    if (!this.datos.autoridades) {
      this.inicializarAutoridades();
    }
    if (!this.datos.autoridades) {
      this.inicializarAutoridades();
    }
    this.datos.autoridades!.push({ organizacion: '', cargo: '', nombre: '' });
    this.formularioService.actualizarDato('autoridades', this.datos.autoridades);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarAutoridades(index: number) {
    if (this.datos.autoridades && this.datos.autoridades.length > 1) {
      this.datos.autoridades.splice(index, 1);
      this.formularioService.actualizarDato('autoridades', this.datos.autoridades);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarAutoridades(index: number, field: string, value: any) {
    if (!this.datos.autoridades) {
      this.inicializarAutoridades();
    }
    if (this.datos.autoridades && this.datos.autoridades[index]) {
      this.datos.autoridades[index][field] = value;
      this.formularioService.actualizarDato('autoridades', this.datos.autoridades);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarFestividades() {
    if (!this.datos['festividades'] || this.datos['festividades'].length === 0) {
      this.datos['festividades'] = [
        { festividad: '', fecha: '' }
      ];
      this.formularioService.actualizarDato('festividades', this.datos['festividades']);
      this.cdRef.detectChanges();
    }
  }

  agregarFestividades() {
    if (!this.datos['festividades']) {
      this.inicializarFestividades();
    }
    this.datos['festividades'].push({ festividad: '', fecha: '' });
    this.formularioService.actualizarDato('festividades', this.datos['festividades']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarFestividades(index: number) {
    if (this.datos['festividades'] && this.datos['festividades'].length > 1) {
      this.datos['festividades'].splice(index, 1);
      this.formularioService.actualizarDato('festividades', this.datos['festividades']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarFestividades(index: number, field: string, value: any) {
    if (!this.datos['festividades']) {
      this.inicializarFestividades();
    }
    if (this.datos['festividades'][index]) {
      this.datos['festividades'][index][field] = value;
      this.formularioService.actualizarDato('festividades', this.datos['festividades']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarUbicacionCP() {
    if (!this.datos['ubicacionCpTabla'] || this.datos['ubicacionCpTabla'].length === 0) {
      this.datos['ubicacionCpTabla'] = [
        { localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' }
      ];
      this.formularioService.actualizarDato('ubicacionCpTabla', this.datos['ubicacionCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarUbicacionCP() {
    if (!this.datos['ubicacionCpTabla']) {
      this.inicializarUbicacionCP();
    }
    this.datos['ubicacionCpTabla'].push({ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' });
    this.formularioService.actualizarDato('ubicacionCpTabla', this.datos['ubicacionCpTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarUbicacionCP(index: number) {
    if (this.datos['ubicacionCpTabla'] && this.datos['ubicacionCpTabla'].length > 1) {
      this.datos['ubicacionCpTabla'].splice(index, 1);
      this.formularioService.actualizarDato('ubicacionCpTabla', this.datos['ubicacionCpTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarUbicacionCP(index: number, field: string, value: any) {
    if (!this.datos['ubicacionCpTabla']) {
      this.inicializarUbicacionCP();
    }
    if (this.datos['ubicacionCpTabla'][index]) {
      this.datos['ubicacionCpTabla'][index][field] = value;
      this.formularioService.actualizarDato('ubicacionCpTabla', this.datos['ubicacionCpTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  // Fotografías Cahuacho (AISI) - Optimizado
  getFotografiasCahuachoFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaCahuacho',
      'fotografiasCahuachoFormMulti',
      'Vista panorámica del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasCahuachoFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaCahuacho',
      'fotografiasCahuachoFormMulti',
      'Vista panorámica del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasCahuachoChangeGeneric(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaCahuacho',
      'fotografiasCahuachoFormMulti',
      'Vista panorámica del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoCahuachoPreview'
    );
  }

  // Sección 22 (B.1.1) - Institucionalidad AISI
  getFotografiasInstitucionalidadAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaCahuachoB11',
      'fotografiasInstitucionalidadAISIFormMulti',
      'Institucionalidad - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasInstitucionalidadAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaCahuachoB11',
      'fotografiasInstitucionalidadAISIFormMulti',
      'Institucionalidad - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasInstitucionalidadAISIChangeGeneric(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaCahuachoB11',
      'fotografiasInstitucionalidadAISIFormMulti',
      'Institucionalidad - ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoInstitucionalidadAISIPreview'
    );
  }

  // Sección 23 (B.1.2) - Demografía AISI
  getFotografiasDemografiaAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaCahuachoB12',
      'fotografiasDemografiaAISIFormMulti',
      'Aspectos Demográficos - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasDemografiaAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaCahuachoB12',
      'fotografiasDemografiaAISIFormMulti',
      'Aspectos Demográficos - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasDemografiaAISIChangeGeneric(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaCahuachoB12',
      'fotografiasDemografiaAISIFormMulti',
      'Aspectos Demográficos - ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoDemografiaAISIPreview'
    );
  }

  // Sección 24 (B.1.3) - PEA AISI
  getFotografiasPEAAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaPEA',
      'fotografiasPEAAISIFormMulti',
      'Población Económicamente Activa - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasPEAAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaPEA',
      'fotografiasPEAAISIFormMulti',
      'Población Económicamente Activa - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasPEAAISIChangeGeneric(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaPEA',
      'fotografiasPEAAISIFormMulti',
      'Población Económicamente Activa - ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoPEAAISIPreview'
    );
  }

  // Sección 25 (B.1.4) - Ganadería/Agricultura/Comercio AISI
  getFotografiasGanaderiaAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaGanaderia',
      'fotografiasGanaderiaAISIFormMulti',
      'Actividades Económicas - Ganadería - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasGanaderiaAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaGanaderia',
      'fotografiasGanaderiaAISIFormMulti',
      'Actividades Económicas - Ganadería - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasGanaderiaAISIChangeGeneric(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaGanaderia',
      'fotografiasGanaderiaAISIFormMulti',
      'Actividades Económicas - Ganadería - ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoGanaderiaAISIPreview'
    );
  }

  onImagenCahuachoChange(imagenBase64: string) {
    this.fotoCahuachoPreview = imagenBase64 || null;
    this.onFieldChange('fotografiaCahuachoImagen', imagenBase64 || '');
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  inicializarPoblacionSexoAISI() {
    if (!this.datos['poblacionSexoAISI'] || this.datos['poblacionSexoAISI'].length === 0) {
      this.datos['poblacionSexoAISI'] = [
        { sexo: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('poblacionSexoAISI', this.datos['poblacionSexoAISI']);
      this.cdRef.detectChanges();
    }
  }

  agregarPoblacionSexoAISI() {
    if (!this.datos['poblacionSexoAISI']) {
      this.inicializarPoblacionSexoAISI();
    }
    this.datos['poblacionSexoAISI'].push({ sexo: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('poblacionSexoAISI', this.datos['poblacionSexoAISI']);
    this.calcularPorcentajesPoblacionSexoAISI();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPoblacionSexoAISI(index: number) {
    if (this.datos['poblacionSexoAISI'] && this.datos['poblacionSexoAISI'].length > 1) {
      const item = this.datos['poblacionSexoAISI'][index];
      if (!item.sexo || !item.sexo.toLowerCase().includes('total')) {
        this.datos['poblacionSexoAISI'].splice(index, 1);
        this.formularioService.actualizarDato('poblacionSexoAISI', this.datos['poblacionSexoAISI']);
        this.calcularPorcentajesPoblacionSexoAISI();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarPoblacionSexoAISI(index: number, field: string, value: any) {
    if (!this.datos['poblacionSexoAISI']) {
      this.inicializarPoblacionSexoAISI();
    }
    if (this.datos['poblacionSexoAISI'][index]) {
      this.datos['poblacionSexoAISI'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesPoblacionSexoAISI();
      }
      this.formularioService.actualizarDato('poblacionSexoAISI', this.datos['poblacionSexoAISI']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesPoblacionSexoAISI() {
    if (!this.datos['poblacionSexoAISI'] || this.datos['poblacionSexoAISI'].length === 0) {
      return;
    }
    const totalItem = this.datos['poblacionSexoAISI'].find((item: any) => 
      item.sexo && item.sexo.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['poblacionSexoAISI'].forEach((item: any) => {
        if (!item.sexo || !item.sexo.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarPoblacionEtarioAISI() {
    if (!this.datos['poblacionEtarioAISI'] || this.datos['poblacionEtarioAISI'].length === 0) {
      this.datos['poblacionEtarioAISI'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('poblacionEtarioAISI', this.datos['poblacionEtarioAISI']);
      this.cdRef.detectChanges();
    }
  }

  agregarPoblacionEtarioAISI() {
    if (!this.datos['poblacionEtarioAISI']) {
      this.inicializarPoblacionEtarioAISI();
    }
    this.datos['poblacionEtarioAISI'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('poblacionEtarioAISI', this.datos['poblacionEtarioAISI']);
    this.calcularPorcentajesPoblacionEtarioAISI();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPoblacionEtarioAISI(index: number) {
    if (this.datos['poblacionEtarioAISI'] && this.datos['poblacionEtarioAISI'].length > 1) {
      const item = this.datos['poblacionEtarioAISI'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['poblacionEtarioAISI'].splice(index, 1);
        this.formularioService.actualizarDato('poblacionEtarioAISI', this.datos['poblacionEtarioAISI']);
        this.calcularPorcentajesPoblacionEtarioAISI();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarPoblacionEtarioAISI(index: number, field: string, value: any) {
    if (!this.datos['poblacionEtarioAISI']) {
      this.inicializarPoblacionEtarioAISI();
    }
    if (this.datos['poblacionEtarioAISI'][index]) {
      this.datos['poblacionEtarioAISI'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesPoblacionEtarioAISI();
      }
      this.formularioService.actualizarDato('poblacionEtarioAISI', this.datos['poblacionEtarioAISI']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesPoblacionEtarioAISI() {
    if (!this.datos['poblacionEtarioAISI'] || this.datos['poblacionEtarioAISI'].length === 0) {
      return;
    }
    const totalItem = this.datos['poblacionEtarioAISI'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['poblacionEtarioAISI'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarPETGruposEdadAISI() {
    if (!this.datos['petGruposEdadAISI'] || this.datos['petGruposEdadAISI'].length === 0) {
      this.datos['petGruposEdadAISI'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('petGruposEdadAISI', this.datos['petGruposEdadAISI']);
      this.cdRef.detectChanges();
    }
  }

  agregarPETGruposEdadAISI() {
    if (!this.datos['petGruposEdadAISI']) {
      this.inicializarPETGruposEdadAISI();
    }
    this.datos['petGruposEdadAISI'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('petGruposEdadAISI', this.datos['petGruposEdadAISI']);
    this.calcularPorcentajesPETGruposEdadAISI();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPETGruposEdadAISI(index: number) {
    if (this.datos['petGruposEdadAISI'] && this.datos['petGruposEdadAISI'].length > 1) {
      const item = this.datos['petGruposEdadAISI'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['petGruposEdadAISI'].splice(index, 1);
        this.formularioService.actualizarDato('petGruposEdadAISI', this.datos['petGruposEdadAISI']);
        this.calcularPorcentajesPETGruposEdadAISI();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarPETGruposEdadAISI(index: number, field: string, value: any) {
    if (!this.datos['petGruposEdadAISI']) {
      this.inicializarPETGruposEdadAISI();
    }
    if (this.datos['petGruposEdadAISI'][index]) {
      this.datos['petGruposEdadAISI'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesPETGruposEdadAISI();
      }
      this.formularioService.actualizarDato('petGruposEdadAISI', this.datos['petGruposEdadAISI']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesPETGruposEdadAISI() {
    if (!this.datos['petGruposEdadAISI'] || this.datos['petGruposEdadAISI'].length === 0) {
      return;
    }
    const totalItem = this.datos['petGruposEdadAISI'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['petGruposEdadAISI'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarPEADistritoSexo() {
    if (!this.datos['peaDistritoSexoTabla'] || this.datos['peaDistritoSexoTabla'].length === 0) {
      this.datos['peaDistritoSexoTabla'] = [
        { categoria: '', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos['peaDistritoSexoTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarPEADistritoSexo() {
    if (!this.datos['peaDistritoSexoTabla']) {
      this.inicializarPEADistritoSexo();
    }
    this.datos['peaDistritoSexoTabla'].push({ categoria: '', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos['peaDistritoSexoTabla']);
    this.calcularPorcentajesPEADistritoSexo();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPEADistritoSexo(index: number) {
    if (this.datos['peaDistritoSexoTabla'] && this.datos['peaDistritoSexoTabla'].length > 1) {
      const item = this.datos['peaDistritoSexoTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['peaDistritoSexoTabla'].splice(index, 1);
        this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos['peaDistritoSexoTabla']);
        this.calcularPorcentajesPEADistritoSexo();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarPEADistritoSexo(index: number, field: string, value: any) {
    if (!this.datos['peaDistritoSexoTabla']) {
      this.inicializarPEADistritoSexo();
    }
    if (this.datos['peaDistritoSexoTabla'][index]) {
      this.datos['peaDistritoSexoTabla'][index][field] = value;
      if (field === 'hombres' || field === 'mujeres' || field === 'casos') {
        this.calcularPorcentajesPEADistritoSexo();
      }
      this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos['peaDistritoSexoTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesPEADistritoSexo() {
    if (!this.datos['peaDistritoSexoTabla'] || this.datos['peaDistritoSexoTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['peaDistritoSexoTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const totalHombres = totalItem ? parseFloat(totalItem.hombres) || 0 : 0;
    const totalMujeres = totalItem ? parseFloat(totalItem.mujeres) || 0 : 0;
    const totalCasos = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    this.datos['peaDistritoSexoTabla'].forEach((item: any) => {
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        const hombres = parseFloat(item.hombres) || 0;
        const mujeres = parseFloat(item.mujeres) || 0;
        const casos = parseFloat(item.casos) || 0;
        
        if (totalHombres > 0) {
          const porcentajeHombres = ((hombres / totalHombres) * 100).toFixed(2);
          item.porcentajeHombres = porcentajeHombres + ' %';
        }
        if (totalMujeres > 0) {
          const porcentajeMujeres = ((mujeres / totalMujeres) * 100).toFixed(2);
          item.porcentajeMujeres = porcentajeMujeres + ' %';
        }
        if (totalCasos > 0) {
          const porcentaje = ((casos / totalCasos) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      }
    });
  }

  inicializarPEAOcupadaDesocupada() {
    if (!this.datos['peaOcupadaDesocupadaTabla'] || this.datos['peaOcupadaDesocupadaTabla'].length === 0) {
      this.datos['peaOcupadaDesocupadaTabla'] = [
        { categoria: '', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos['peaOcupadaDesocupadaTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarPEAOcupadaDesocupada() {
    if (!this.datos['peaOcupadaDesocupadaTabla']) {
      this.inicializarPEAOcupadaDesocupada();
    }
    this.datos['peaOcupadaDesocupadaTabla'].push({ categoria: '', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos['peaOcupadaDesocupadaTabla']);
    this.calcularPorcentajesPEAOcupadaDesocupada();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPEAOcupadaDesocupada(index: number) {
    if (this.datos['peaOcupadaDesocupadaTabla'] && this.datos['peaOcupadaDesocupadaTabla'].length > 1) {
      const item = this.datos['peaOcupadaDesocupadaTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['peaOcupadaDesocupadaTabla'].splice(index, 1);
        this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos['peaOcupadaDesocupadaTabla']);
        this.calcularPorcentajesPEAOcupadaDesocupada();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarPEAOcupadaDesocupada(index: number, field: string, value: any) {
    if (!this.datos['peaOcupadaDesocupadaTabla']) {
      this.inicializarPEAOcupadaDesocupada();
    }
    if (this.datos['peaOcupadaDesocupadaTabla'][index]) {
      this.datos['peaOcupadaDesocupadaTabla'][index][field] = value;
      if (field === 'hombres' || field === 'mujeres' || field === 'casos') {
        this.calcularPorcentajesPEAOcupadaDesocupada();
      }
      this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos['peaOcupadaDesocupadaTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesPEAOcupadaDesocupada() {
    if (!this.datos['peaOcupadaDesocupadaTabla'] || this.datos['peaOcupadaDesocupadaTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['peaOcupadaDesocupadaTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const totalHombres = totalItem ? parseFloat(totalItem.hombres) || 0 : 0;
    const totalMujeres = totalItem ? parseFloat(totalItem.mujeres) || 0 : 0;
    const totalCasos = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    this.datos['peaOcupadaDesocupadaTabla'].forEach((item: any) => {
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        const hombres = parseFloat(item.hombres) || 0;
        const mujeres = parseFloat(item.mujeres) || 0;
        const casos = parseFloat(item.casos) || 0;
        
        if (totalHombres > 0) {
          const porcentajeHombres = ((hombres / totalHombres) * 100).toFixed(2);
          item.porcentajeHombres = porcentajeHombres + ' %';
        }
        if (totalMujeres > 0) {
          const porcentajeMujeres = ((mujeres / totalMujeres) * 100).toFixed(2);
          item.porcentajeMujeres = porcentajeMujeres + ' %';
        }
        if (totalCasos > 0) {
          const porcentaje = ((casos / totalCasos) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      }
    });
  }

  inicializarActividadesEconomicasAISI() {
    if (!this.datos['actividadesEconomicasAISI'] || this.datos['actividadesEconomicasAISI'].length === 0) {
      this.datos['actividadesEconomicasAISI'] = [
        { actividad: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('actividadesEconomicasAISI', this.datos['actividadesEconomicasAISI']);
      this.cdRef.detectChanges();
    }
  }

  agregarActividadesEconomicasAISI() {
    if (!this.datos['actividadesEconomicasAISI']) {
      this.inicializarActividadesEconomicasAISI();
    }
    this.datos['actividadesEconomicasAISI'].push({ actividad: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('actividadesEconomicasAISI', this.datos['actividadesEconomicasAISI']);
    this.calcularPorcentajesActividadesEconomicasAISI();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarActividadesEconomicasAISI(index: number) {
    if (this.datos['actividadesEconomicasAISI'] && this.datos['actividadesEconomicasAISI'].length > 1) {
      const item = this.datos['actividadesEconomicasAISI'][index];
      if (!item.actividad || !item.actividad.toLowerCase().includes('total')) {
        this.datos['actividadesEconomicasAISI'].splice(index, 1);
        this.formularioService.actualizarDato('actividadesEconomicasAISI', this.datos['actividadesEconomicasAISI']);
        this.calcularPorcentajesActividadesEconomicasAISI();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarActividadesEconomicasAISI(index: number, field: string, value: any) {
    if (!this.datos['actividadesEconomicasAISI']) {
      this.inicializarActividadesEconomicasAISI();
    }
    if (this.datos['actividadesEconomicasAISI'][index]) {
      this.datos['actividadesEconomicasAISI'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesActividadesEconomicasAISI();
      }
      this.formularioService.actualizarDato('actividadesEconomicasAISI', this.datos['actividadesEconomicasAISI']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesActividadesEconomicasAISI() {
    if (!this.datos['actividadesEconomicasAISI'] || this.datos['actividadesEconomicasAISI'].length === 0) {
      return;
    }
    const totalItem = this.datos['actividadesEconomicasAISI'].find((item: any) => 
      item.actividad && item.actividad.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['actividadesEconomicasAISI'].forEach((item: any) => {
        if (!item.actividad || !item.actividad.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  onImagenActividadesEconomicasChange(imagenBase64: string) {
    this.fotoActividadesEconomicasPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaActividadesEconomicasImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  onImagenMercadoChange(imagenBase64: string) {
    this.fotoMercadoPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaMercadoImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  getFotografiasActividadesEconomicasForm(): any[] {
    const fotografias: any[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const imagenKey = `fotografiaActividadesEconomicas${i}Imagen`;
      let preview = this.datos[imagenKey] || null;
      
      if (i === 1 && !preview) {
        preview = this.datos['fotografiaActividadesEconomicasImagen'] || null;
      }
      
      let titulo = this.datos[`fotografiaActividadesEconomicas${i}Titulo`];
      let fuente = this.datos[`fotografiaActividadesEconomicas${i}Fuente`];
      
      if (i === 1) {
        if (!titulo) {
          titulo = this.datos['fotografiaActividadesEconomicasTitulo'] || 'Parcelas agrícolas en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho');
        }
        if (!fuente) {
          fuente = this.datos['fotografiaActividadesEconomicasFuente'] || 'GEADES, 2024';
        }
      }
      
      if (i === 1 || titulo || preview) {
        fotografias.push({
          titulo: titulo || (i === 1 ? 'Parcelas agrícolas en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho') : ''),
          fuente: fuente || 'GEADES, 2024',
          preview: preview,
          dragOver: false
        });
      }
    }
    
    if (fotografias.length === 0) {
      fotografias.push({
        titulo: 'Parcelas agrícolas en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
        fuente: 'GEADES, 2024',
        preview: null,
        dragOver: false
      });
    }
    
    return fotografias;
  }

  getFotografiasActividadesEconomicasFormMulti(): any[] {
    const fotos = this.getFotografiasActividadesEconomicasForm();
    return fotos.map((foto, index) => ({
      titulo: foto.titulo || (index === 0 ? 'Parcelas agrícolas en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho') : 'Título de fotografía'),
      fuente: foto.fuente || 'GEADES, 2024',
      imagen: foto.preview || null,
      id: `actividades-${index}-${Date.now()}`
    }));
  }

  actualizarFotografiasActividadesEconomicasFormMulti() {
    const nuevasFotografias = this.getFotografiasActividadesEconomicasFormMulti();
    const actualSerialized = JSON.stringify(this.fotografiasActividadesEconomicasFormMulti.map(f => ({
      titulo: f.titulo,
      fuente: f.fuente,
      imagen: f.imagen
    })));
    const nuevasSerialized = JSON.stringify(nuevasFotografias.map(f => ({
      titulo: f.titulo,
      fuente: f.fuente,
      imagen: f.imagen
    })));
    
    if (actualSerialized !== nuevasSerialized) {
      this.fotografiasActividadesEconomicasFormMulti = nuevasFotografias;
    }
  }

  onFotografiasActividadesEconomicasChange(fotografias: any[]) {
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      this.onFieldChange(`fotografiaActividadesEconomicas${num}Titulo`, foto.titulo);
      this.onFieldChange(`fotografiaActividadesEconomicas${num}Fuente`, foto.fuente);
      this.onFieldChange(`fotografiaActividadesEconomicas${num}Imagen`, foto.imagen || '');
      
      if (num === 1) {
        this.onFieldChange('fotografiaActividadesEconomicasTitulo', foto.titulo);
        this.onFieldChange('fotografiaActividadesEconomicasFuente', foto.fuente);
        this.onFieldChange('fotografiaActividadesEconomicasImagen', foto.imagen || '');
        this.fotoActividadesEconomicasPreview = foto.imagen || null;
      }
    });
    for (let i = fotografias.length + 1; i <= 10; i++) {
      this.onFieldChange(`fotografiaActividadesEconomicas${i}Titulo`, '');
      this.onFieldChange(`fotografiaActividadesEconomicas${i}Fuente`, '');
      this.onFieldChange(`fotografiaActividadesEconomicas${i}Imagen`, '');
    }
    this.actualizarFotografiasActividadesEconomicasFormMulti();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  getFotografiasMercadoForm(): any[] {
    const fotografias: any[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const imagenKey = `fotografiaMercado${i}Imagen`;
      let preview = this.datos[imagenKey] || null;
      
      if (i === 1 && !preview) {
        preview = this.datos['fotografiaMercadoImagen'] || null;
      }
      
      let titulo = this.datos[`fotografiaMercado${i}Titulo`];
      let fuente = this.datos[`fotografiaMercado${i}Fuente`];
      
      if (i === 1) {
        if (!titulo) {
          titulo = this.datos['fotografiaMercadoTitulo'] || 'Bodega en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho');
        }
        if (!fuente) {
          fuente = this.datos['fotografiaMercadoFuente'] || 'GEADES, 2024';
        }
      }
      
      if (i === 1 || titulo || preview) {
        fotografias.push({
          titulo: titulo || (i === 1 ? 'Bodega en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho') : ''),
          fuente: fuente || 'GEADES, 2024',
          preview: preview,
          dragOver: false
        });
      }
    }
    
    if (fotografias.length === 0) {
      fotografias.push({
        titulo: 'Bodega en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
        fuente: 'GEADES, 2024',
        preview: null,
        dragOver: false
      });
    }
    
    return fotografias;
  }

  getFotografiasMercadoFormMulti(): any[] {
    const fotos = this.getFotografiasMercadoForm();
    return fotos.map((foto, index) => ({
      titulo: foto.titulo || (index === 0 ? 'Bodega en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho') : 'Título de fotografía'),
      fuente: foto.fuente || 'GEADES, 2024',
      imagen: foto.preview || null,
      id: `mercado-${index}-${Date.now()}`
    }));
  }

  actualizarFotografiasMercadoFormMulti() {
    const nuevasFotografias = this.getFotografiasMercadoFormMulti();
    const actualSerialized = JSON.stringify(this.fotografiasMercadoFormMulti.map(f => ({
      titulo: f.titulo,
      fuente: f.fuente,
      imagen: f.imagen
    })));
    const nuevasSerialized = JSON.stringify(nuevasFotografias.map(f => ({
      titulo: f.titulo,
      fuente: f.fuente,
      imagen: f.imagen
    })));
    
    if (actualSerialized !== nuevasSerialized) {
      this.fotografiasMercadoFormMulti = nuevasFotografias;
    }
  }

  onFotografiasMercadoChange(fotografias: any[]) {
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      this.onFieldChange(`fotografiaMercado${num}Titulo`, foto.titulo);
      this.onFieldChange(`fotografiaMercado${num}Fuente`, foto.fuente);
      this.onFieldChange(`fotografiaMercado${num}Imagen`, foto.imagen || '');
      
      if (num === 1) {
        this.onFieldChange('fotografiaMercadoTitulo', foto.titulo);
        this.onFieldChange('fotografiaMercadoFuente', foto.fuente);
        this.onFieldChange('fotografiaMercadoImagen', foto.imagen || '');
        this.fotoMercadoPreview = foto.imagen || null;
      }
    });
    for (let i = fotografias.length + 1; i <= 10; i++) {
      this.onFieldChange(`fotografiaMercado${i}Titulo`, '');
      this.onFieldChange(`fotografiaMercado${i}Fuente`, '');
      this.onFieldChange(`fotografiaMercado${i}Imagen`, '');
    }
    this.actualizarFotografiasMercadoFormMulti();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  getFotografiasFormMultiGeneric(
    prefix: string, 
    arrayProperty: string, 
    tituloDefault: string, 
    fuenteDefault: string = 'GEADES, 2024'
  ): any[] {
    const fotografias: any[] = [];
    const arrayRef = (this as any)[arrayProperty] || [];
    
    // Solo aplicar grupo a fotografías AISD
    let grupoPrefijo = '';
    const aisd_prefixes = [
      'fotografiaAISD', 'fotografiaInstitucionalidad', 'fotografiaDemografia', 'fotografiaPEA',
      'fotografiaGanaderia', 'fotografiaAgricultura', 'fotografiaComercio',
      'fotografiaSalud', 'fotografiaEducacion', 'fotografiaRecreacion', 'fotografiaDeporte',
      'fotografiaEstructura', 'fotografiaTransporte', 'fotografiaTelecomunicaciones',
      'fotografiaDesechosSolidos', 'fotografiaElectricidad',
      'fotografiaAcceso', 'fotografiaOrganizacion', 'fotografiaSaludIndicadores', 'fotografiaEducacionIndicadores',
      'fotografiaIglesia', 'fotografiaReservorio', 'fotografiaUsoSuelos',
      'fotografiaIEAyroca', 'fotografiaIE40270',
      'fotografiaIDH', 'fotografiaNBI',
      'fotografiaOrganizacionSocial', 'fotografiaFestividades',
      'fotografiaCahuacho', 'fotografiaCahuachoB11', 'fotografiaCahuachoB12', 'fotografiaCahuachoB13', 'fotografiaCahuachoB14', 'fotografiaCahuachoB15', 'fotografiaCahuachoB16', 'fotografiaCahuachoB17', 'fotografiaCahuachoB18', 'fotografiaCahuachoB19'  // AISI grupo B y subsecciones
    ];
    
    if (aisd_prefixes.includes(prefix)) {
      grupoPrefijo = this.imageManagementService.getGroupPrefix(this.seccionId);
    }
    
    // Log para verificación (solo primera vez por prefix)
    if (!this.hasLoggedPrefix) {
      this.hasLoggedPrefix = true;
      console.log('\n' + '='.repeat(80));
      console.log('✅ PUNTO 3: Prefijos en getFotografiasFormMultiGeneric');
      console.log('='.repeat(80));
      console.log('Prefijos AISD (con grupo):', aisd_prefixes.join(', '));
      console.log('='.repeat(80) + '\n');
    }
    
    for (let i = 1; i <= 10; i++) {
      // Leer SIEMPRE con prefijo de grupo (sin fallback)
      const imagenKey = grupoPrefijo ? `${prefix}${i}Imagen${grupoPrefijo}` : `${prefix}${i}Imagen`;
      const tituloKey = grupoPrefijo ? `${prefix}${i}Titulo${grupoPrefijo}` : `${prefix}${i}Titulo`;
      const fuenteKey = grupoPrefijo ? `${prefix}${i}Fuente${grupoPrefijo}` : `${prefix}${i}Fuente`;
      
      let preview = this.datos[imagenKey] || null;
      let titulo = this.datos[tituloKey];
      let fuente = this.datos[fuenteKey];
      
      // Para la primera foto, también intentar campo base sin número
      if (i === 1 && !preview) {
        const imagenBaseKey = grupoPrefijo ? `${prefix}Imagen${grupoPrefijo}` : `${prefix}Imagen`;
        preview = this.datos[imagenBaseKey] || null;
      }
      
      if (i === 1) {
        if (!titulo) {
          const tituloBaseKey = grupoPrefijo ? `${prefix}Titulo${grupoPrefijo}` : `${prefix}Titulo`;
          titulo = this.datos[tituloBaseKey] || tituloDefault;
        }
        if (!fuente) {
          const fuenteBaseKey = grupoPrefijo ? `${prefix}Fuente${grupoPrefijo}` : `${prefix}Fuente`;
          fuente = this.datos[fuenteBaseKey] || fuenteDefault;
        }
      }
      
      // Agregar la foto SOLO si tiene imagen, o si es primera pero el array está vacío
      const tieneImagen = preview && preview !== 'null' && typeof preview === 'string' && preview.trim() !== '';
      
      if (tieneImagen) {
        const fotoObj = {
          numero: i.toString(),
          titulo: titulo || (i === 1 ? tituloDefault : 'Título de fotografía'),
          fuente: fuente || fuenteDefault,
          imagen: preview || null,
          id: `${prefix}-${i}-${Date.now()}`
        };
        fotografias.push(fotoObj);
      }
    }
    
    // Siempre garantizar al menos una foto vacía
    if (fotografias.length === 0) {
      fotografias.push({
        numero: '1',
        titulo: tituloDefault,
        fuente: fuenteDefault,
        imagen: null,
        id: `${prefix}-1-${Date.now()}`
      });
    }
    return fotografias;
  }

  actualizarFotografiasFormMultiGeneric(
    prefix: string,
    arrayProperty: string,
    tituloDefault: string,
    fuenteDefault: string = 'GEADES, 2024'
  ) {
    const nuevasFotografias = this.getFotografiasFormMultiGeneric(prefix, arrayProperty, tituloDefault, fuenteDefault);
    const arrayRef = (this as any)[arrayProperty] || [];
    const actualSerialized = JSON.stringify(arrayRef.map((f: any) => ({
      titulo: f.titulo,
      fuente: f.fuente,
      imagen: f.imagen
    })));
    const nuevasSerialized = JSON.stringify(nuevasFotografias.map(f => ({
      titulo: f.titulo,
      fuente: f.fuente,
      imagen: f.imagen
    })));
    
    if (actualSerialized !== nuevasSerialized) {
      (this as any)[arrayProperty] = nuevasFotografias;
    }
  }

  onFotografiasChangeGeneric(
    fotografias: any[],
    prefix: string,
    arrayProperty: string,
    tituloDefault: string,
    fuenteDefault: string = 'GEADES, 2024',
    previewProperty?: string
  ) {
    // Aplicar grupo a todos los prefijos AISD
    const aisd_prefixes = [
      'fotografiaAISD', 'fotografiaInstitucionalidad', 'fotografiaDemografia', 'fotografiaPEA',
      'fotografiaGanaderia', 'fotografiaAgricultura', 'fotografiaComercio',
      'fotografiaSalud', 'fotografiaEducacion', 'fotografiaRecreacion', 'fotografiaDeporte',
      'fotografiaEstructura', 'fotografiaTransporte', 'fotografiaTelecomunicaciones',
      'fotografiaAcceso', 'fotografiaOrganizacion', 'fotografiaSaludIndicadores', 'fotografiaEducacionIndicadores',
      'fotografiaIDH', 'fotografiaNBI',
      'fotografiaOrganizacionSocial', 'fotografiaFestividades',
      'fotografiaDesechosSolidos', 'fotografiaElectricidad',
      'fotografiaIglesia', 'fotografiaReservorio', 'fotografiaUsoSuelos',
      'fotografiaIEAyroca', 'fotografiaIE40270',
      'fotografiaCahuacho', 'fotografiaCahuachoB11', 'fotografiaCahuachoB12', 'fotografiaCahuachoB13', 'fotografiaCahuachoB14', 'fotografiaCahuachoB15', 'fotografiaCahuachoB16', 'fotografiaCahuachoB17', 'fotografiaCahuachoB18', 'fotografiaCahuachoB19'  // AISI grupo B y subsecciones
    ];
    
    let grupoPrefijo = '';
    if (aisd_prefixes.includes(prefix)) {
      grupoPrefijo = this.imageManagementService.getGroupPrefix(this.seccionId);
    }
    
    // Guardar cada fotografía con sus datos - SIEMPRE con grupoPrefijo
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      const titulo = foto.titulo || '';
      const fuente = foto.fuente || '';
      const imagen = foto.imagen || '';
      
      // Guardar SIEMPRE con prefijo de grupo (sin fallback)
      const campoNumero = grupoPrefijo ? `${prefix}${num}Numero${grupoPrefijo}` : `${prefix}${num}Numero`;
      const campoTitulo = grupoPrefijo ? `${prefix}${num}Titulo${grupoPrefijo}` : `${prefix}${num}Titulo`;
      const campoFuente = grupoPrefijo ? `${prefix}${num}Fuente${grupoPrefijo}` : `${prefix}${num}Fuente`;
      const campoImagen = grupoPrefijo ? `${prefix}${num}Imagen${grupoPrefijo}` : `${prefix}${num}Imagen`;
      
      this.onFieldChange(campoNumero, num.toString());
      this.onFieldChange(campoTitulo, titulo);
      this.onFieldChange(campoFuente, fuente);
      this.onFieldChange(campoImagen, imagen);
      
      if (num === 1) {
        const campoTituloBase = grupoPrefijo ? `${prefix}Titulo${grupoPrefijo}` : `${prefix}Titulo`;
        const campoFuenteBase = grupoPrefijo ? `${prefix}Fuente${grupoPrefijo}` : `${prefix}Fuente`;
        const campoImagenBase = grupoPrefijo ? `${prefix}Imagen${grupoPrefijo}` : `${prefix}Imagen`;
        
        this.onFieldChange(campoTituloBase, titulo);
        this.onFieldChange(campoFuenteBase, fuente);
        this.onFieldChange(campoImagenBase, imagen);
        
        if (previewProperty) {
          (this as any)[previewProperty] = imagen || null;
        }
      }
    });
    
    // Limpiar slots de fotografías sin usar (máximo 10) - SIEMPRE con prefijo
    for (let i = fotografias.length + 1; i <= 10; i++) {
      const campoTitulo = grupoPrefijo ? `${prefix}${i}Titulo${grupoPrefijo}` : `${prefix}${i}Titulo`;
      const campoFuente = grupoPrefijo ? `${prefix}${i}Fuente${grupoPrefijo}` : `${prefix}${i}Fuente`;
      const campoImagen = grupoPrefijo ? `${prefix}${i}Imagen${grupoPrefijo}` : `${prefix}${i}Imagen`;
      
      this.onFieldChange(campoTitulo, '');
      this.onFieldChange(campoFuente, '');
      this.onFieldChange(campoImagen, '');
    }
    
    // Actualizar array local
    (this as any)[arrayProperty] = fotografias.map((f: any) => ({ ...f, preview: f.imagen, dragOver: false }));
    
    // Refrescar this.datos con los datos guardados
    this.datos = this.formularioService.obtenerDatos();
    
    this.actualizarFotografiasFormMultiGeneric(prefix, arrayProperty, tituloDefault, fuenteDefault);
    this.actualizarComponenteSeccion();
    
    // Sincronizar con seccion5 si es institucionalidad o fotografiaAISD
    if (prefix === 'fotografiaInstitucionalidad' || prefix === 'fotografiaAISD') {
      // Primer update - inmediato
      setTimeout(() => {
        const seccion5 = ViewChildHelper.getComponent('seccion5');
        if (seccion5 && seccion5['actualizarDatos']) {
          seccion5['actualizarDatos']();
        }
        this.cdRef.detectChanges();
      }, 50);
      
      // Segundo update - después de un pequeño delay para sincronización de datos
      setTimeout(() => {
        const seccion5 = ViewChildHelper.getComponent('seccion5');
        if (seccion5 && seccion5['actualizarDatos']) {
          seccion5['actualizarDatos']();
        }
        this.cdRef.detectChanges();
      }, 200);
    }
    
    this.cdRef.detectChanges();
  }

  getFotografiasInstitucionalidadFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaInstitucionalidad',
      'fotografiasInstitucionalidadFormMulti',
      'Local Comunal de la CC ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  actualizarFotografiasInstitucionalidadFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaInstitucionalidad',
      'fotografiasInstitucionalidadFormMulti',
      'Local Comunal de la CC ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  onFotografiasInstitucionalidadChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaInstitucionalidad',
      'fotografiasInstitucionalidadFormMulti',
      'Local Comunal de la CC ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024',
      'fotoInstitucionalidadPreview'
    );
  }

  getFotografiasAISDFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaAISD',
      'fotografiasAISDFormMulti',
      'Título de fotografía'
    );
  }

  actualizarFotografiasAISDFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaAISD',
      'fotografiasAISDFormMulti',
      'Título de fotografía'
    );
  }

  onFotografiasAISDChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaAISD',
      'fotografiasAISDFormMulti',
      'Título de fotografía',
      'GEADES, 2024',
      'fotoAISDPreview'
    );
  }

  getFotografiasComercioFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaComercio',
      'fotografiasComercioFormMulti',
      'Comercio ambulatorio en el anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  actualizarFotografiasComercioFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaComercio',
      'fotografiasComercioFormMulti',
      'Comercio ambulatorio en el anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  onFotografiasComercioChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaComercio',
      'fotografiasComercioFormMulti',
      'Comercio ambulatorio en el anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024',
      'fotoComercioPreview'
    );
  }

  getFotografiasEstructuraFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaEstructura',
      'fotografiasEstructuraFormMulti',
      'Estructura de las viviendas en el anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  actualizarFotografiasEstructuraFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaEstructura',
      'fotografiasEstructuraFormMulti',
      'Estructura de las viviendas en el anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  onFotografiasEstructuraChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaEstructura',
      'fotografiasEstructuraFormMulti',
      'Estructura de las viviendas en el anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024',
      'fotoEstructuraPreview'
    );
  }

  getFotografiasDesechosSolidosFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaDesechosSolidos',
      'fotografiasDesechosSolidosFormMulti',
      'Contenedor de residuos sólidos y plásticos en el anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  actualizarFotografiasDesechosSolidosFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaDesechosSolidos',
      'fotografiasDesechosSolidosFormMulti',
      'Contenedor de residuos sólidos y plásticos en el anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  onFotografiasDesechosSolidosChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaDesechosSolidos',
      'fotografiasDesechosSolidosFormMulti',
      'Contenedor de residuos sólidos y plásticos en el anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024',
      'fotoDesechosSolidosPreview'
    );
  }

  getFotografiasElectricidadFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaElectricidad',
      'fotografiasElectricidadFormMulti',
      'Infraestructura eléctrica en el anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  actualizarFotografiasElectricidadFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaElectricidad',
      'fotografiasElectricidadFormMulti',
      'Infraestructura eléctrica en el anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  onFotografiasElectricidadChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaElectricidad',
      'fotografiasElectricidadFormMulti',
      'Infraestructura eléctrica en el anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024',
      'fotoElectricidadPreview'
    );
  }

  getFotografiasTransporteFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaTransporte',
      'fotografiasTransporteFormMulti',
      'Infraestructura de transporte en la CC ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  actualizarFotografiasTransporteFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaTransporte',
      'fotografiasTransporteFormMulti',
      'Infraestructura de transporte en la CC ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  onFotografiasTransporteChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaTransporte',
      'fotografiasTransporteFormMulti',
      'Infraestructura de transporte en la CC ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024',
      'fotoTransportePreview'
    );
  }

  getFotografiasTelecomunicacionesFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaTelecomunicaciones',
      'fotografiasTelecomunicacionesFormMulti',
      'Infraestructura de telecomunicaciones en la CC ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  actualizarFotografiasTelecomunicacionesFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaTelecomunicaciones',
      'fotografiasTelecomunicacionesFormMulti',
      'Infraestructura de telecomunicaciones en la CC ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  onFotografiasTelecomunicacionesChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaTelecomunicaciones',
      'fotografiasTelecomunicacionesFormMulti',
      'Infraestructura de telecomunicaciones en la CC ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024',
      'fotoTelecomunicacionesPreview'
    );
  }

  getFotografiasSaludFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaSalud',
      'fotografiasSaludFormMulti',
      'Infraestructura de salud en la CC ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  actualizarFotografiasSaludFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaSalud',
      'fotografiasSaludFormMulti',
      'Infraestructura de salud en la CC ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  onFotografiasSaludChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaSalud',
      'fotografiasSaludFormMulti',
      'Infraestructura de salud en la CC ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024',
      'fotoSaludPreview'
    );
  }

  getFotografiasIglesiaFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaIglesia',
      'fotografiasIglesiaFormMulti',
      'Iglesia del anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  actualizarFotografiasIglesiaFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaIglesia',
      'fotografiasIglesiaFormMulti',
      'Iglesia del anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  onFotografiasIglesiaChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaIglesia',
      'fotografiasIglesiaFormMulti',
      'Iglesia del anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024',
      'fotoIglesiaPreview'
    );
  }

  getFotografiasReservorioFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaReservorio',
      'fotografiasReservorioFormMulti',
      'Reservorio del anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  actualizarFotografiasReservorioFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaReservorio',
      'fotografiasReservorioFormMulti',
      'Reservorio del anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  onFotografiasReservorioChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaReservorio',
      'fotografiasReservorioFormMulti',
      'Reservorio del anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024',
      'fotoReservorioPreview'
    );
  }

  getFotografiasUsoSuelosFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaUsoSuelos',
      'fotografiasUsoSuelosFormMulti',
      'Uso de los suelos en el anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  actualizarFotografiasUsoSuelosFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaUsoSuelos',
      'fotografiasUsoSuelosFormMulti',
      'Uso de los suelos en el anexo ' + (this.datos.grupoAISD || 'Ayroca')
    );
  }

  onFotografiasUsoSuelosChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaUsoSuelos',
      'fotografiasUsoSuelosFormMulti',
      'Uso de los suelos en el anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'GEADES, 2024',
      'fotoUsoSuelosPreview'
    );
  }

  getFotografiasEstructuraAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaEstructuraAISI',
      'fotografiasEstructuraAISIFormMulti',
      'Estructura de las viviendas en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasEstructuraAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaEstructuraAISI',
      'fotografiasEstructuraAISIFormMulti',
      'Estructura de las viviendas en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasEstructuraAISIChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaEstructuraAISI',
      'fotografiasEstructuraAISIFormMulti',
      'Estructura de las viviendas en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoEstructuraAISIPreview'
    );
  }

  getFotografiasDesechosSolidosAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaDesechosSolidosAISI',
      'fotografiasDesechosSolidosAISIFormMulti',
      'Desechos sólidos en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasDesechosSolidosAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaDesechosSolidosAISI',
      'fotografiasDesechosSolidosAISIFormMulti',
      'Desechos sólidos en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasDesechosSolidosAISIChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaDesechosSolidosAISI',
      'fotografiasDesechosSolidosAISIFormMulti',
      'Desechos sólidos en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoDesechosSolidosAISIPreview'
    );
  }

  getFotografiasElectricidadAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaElectricidadAISI',
      'fotografiasElectricidadAISIFormMulti',
      'Infraestructura eléctrica en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasElectricidadAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaElectricidadAISI',
      'fotografiasElectricidadAISIFormMulti',
      'Infraestructura eléctrica en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasElectricidadAISIChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaElectricidadAISI',
      'fotografiasElectricidadAISIFormMulti',
      'Infraestructura eléctrica en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoElectricidadAISIPreview'
    );
  }

  getFotografiasTransporteAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaTransporteAISI',
      'fotografiasTransporteAISIFormMulti',
      'Infraestructura de transporte en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasTransporteAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaTransporteAISI',
      'fotografiasTransporteAISIFormMulti',
      'Infraestructura de transporte en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasTransporteAISIChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaTransporteAISI',
      'fotografiasTransporteAISIFormMulti',
      'Infraestructura de transporte en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoTransporteAISIPreview'
    );
  }

  getFotografiasTelecomunicacionesAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaTelecomunicacionesAISI',
      'fotografiasTelecomunicacionesAISIFormMulti',
      'Infraestructura de telecomunicaciones en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasTelecomunicacionesAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaTelecomunicacionesAISI',
      'fotografiasTelecomunicacionesAISIFormMulti',
      'Infraestructura de telecomunicaciones en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasTelecomunicacionesAISIChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaTelecomunicacionesAISI',
      'fotografiasTelecomunicacionesAISIFormMulti',
      'Infraestructura de telecomunicaciones en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoTelecomunicacionesAISIPreview'
    );
  }

  getFotografiasSaludAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaSaludAISI',
      'fotografiasSaludAISIFormMulti',
      'Infraestructura de salud en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasSaludAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaSaludAISI',
      'fotografiasSaludAISIFormMulti',
      'Infraestructura de salud en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasSaludAISIChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaSaludAISI',
      'fotografiasSaludAISIFormMulti',
      'Infraestructura de salud en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoSaludAISIPreview'
    );
  }

  getFotografiasEducacion1AISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaEducacion1AISI',
      'fotografiasEducacion1AISIFormMulti',
      'Infraestructura educativa 1 en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasEducacion1AISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaEducacion1AISI',
      'fotografiasEducacion1AISIFormMulti',
      'Infraestructura educativa 1 en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasEducacion1AISIChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaEducacion1AISI',
      'fotografiasEducacion1AISIFormMulti',
      'Infraestructura educativa 1 en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoEducacion1AISIPreview'
    );
  }

  getFotografiasEducacion2AISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaEducacion2AISI',
      'fotografiasEducacion2AISIFormMulti',
      'Infraestructura educativa 2 en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasEducacion2AISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaEducacion2AISI',
      'fotografiasEducacion2AISIFormMulti',
      'Infraestructura educativa 2 en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasEducacion2AISIChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaEducacion2AISI',
      'fotografiasEducacion2AISIFormMulti',
      'Infraestructura educativa 2 en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoEducacion2AISIPreview'
    );
  }

  getFotografiasEducacion3AISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaEducacion3AISI',
      'fotografiasEducacion3AISIFormMulti',
      'Infraestructura educativa 3 en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasEducacion3AISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaEducacion3AISI',
      'fotografiasEducacion3AISIFormMulti',
      'Infraestructura educativa 3 en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasEducacion3AISIChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaEducacion3AISI',
      'fotografiasEducacion3AISIFormMulti',
      'Infraestructura educativa 3 en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoEducacion3AISIPreview'
    );
  }

  getFotografiasRecreacionAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaRecreacionAISI',
      'fotografiasRecreacionAISIFormMulti',
      'Plaza de toros del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasRecreacionAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaRecreacionAISI',
      'fotografiasRecreacionAISIFormMulti',
      'Plaza de toros del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasRecreacionAISIChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaRecreacionAISI',
      'fotografiasRecreacionAISIFormMulti',
      'Plaza de toros del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoRecreacionAISIPreview'
    );
  }

  getFotografiasDeporteAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaDeporteAISI',
      'fotografiasDeporteAISIFormMulti',
      'Losa deportiva en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasDeporteAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaDeporteAISI',
      'fotografiasDeporteAISIFormMulti',
      'Losa deportiva en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasDeporteAISIChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaDeporteAISI',
      'fotografiasDeporteAISIFormMulti',
      'Losa deportiva en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoDeporteAISIPreview'
    );
  }

  getFotografiasDemografiaFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaDemografia', 'fotografiasDemografiaFormMulti', 'Demografía');
  }

  onFotografiasDemografiaChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaDemografia', 'fotografiasDemografiaFormMulti', 'Demografía', 'GEADES, 2024', 'fotoDemografiaPreview');
  }

  getFotografiasPEAFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaPEA', 'fotografiasPEAFormMulti', 'PEA');
  }

  onFotografiasPEAChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaPEA', 'fotografiasPEAFormMulti', 'PEA', 'GEADES, 2024', 'fotoPEAPreview');
  }

  getFotografiasSaludIndicadoresFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaSaludIndicadores', 'fotografiasSaludIndicadoresFormMulti', 'Indicadores de Salud');
  }

  onFotografiasSaludIndicadoresChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaSaludIndicadores', 'fotografiasSaludIndicadoresFormMulti', 'Indicadores de Salud', 'GEADES, 2024', 'fotoSaludIndicadoresPreview');
  }

  getFotografiasEducacionIndicadoresFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaEducacionIndicadores', 'fotografiasEducacionIndicadoresFormMulti', 'Indicadores de Educación');
  }

  onFotografiasEducacionIndicadoresChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaEducacionIndicadores', 'fotografiasEducacionIndicadoresFormMulti', 'Indicadores de Educación', 'GEADES, 2024', 'fotoEducacionIndicadoresPreview');
  }

  getFotografiasIDHFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaIDH', 'fotografiasIDHFormMulti', 'IDH');
  }

  onFotografiasIDHChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaIDH', 'fotografiasIDHFormMulti', 'IDH', 'GEADES, 2024', 'fotoIDHPreview');
  }

  getFotografiasNBIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaNBI', 'fotografiasNBIFormMulti', 'NBI');
  }

  onFotografiasNBIChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaNBI', 'fotografiasNBIFormMulti', 'NBI', 'GEADES, 2024', 'fotoNBIPreview');
  }

  getFotografiasOrganizacionFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaOrganizacion', 'fotografiasOrganizacionFormMulti', 'Organización Social');
  }

  onFotografiasOrganizacionChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaOrganizacion', 'fotografiasOrganizacionFormMulti', 'Organización Social', 'GEADES, 2024', 'fotoOrganizacionPreview');
  }

  getFotografiasFestividadesFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaFestividades', 'fotografiasFestividadesFormMulti', 'Festividades');
  }

  actualizarFotografiasFestividadesFormMulti() {
    this.actualizarFotografiasFormMultiGeneric('fotografiaFestividades', 'fotografiasFestividadesFormMulti', 'Festividades');
  }

  onFotografiasFestividadesChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaFestividades', 'fotografiasFestividadesFormMulti', 'Festividades', 'GEADES, 2024', 'fotoFestividadesPreview');
  }

  getFotografiasSaludIndicadoresAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaSaludIndicadoresAISI', 'fotografiasSaludIndicadoresAISIFormMulti', 'Indicadores de Salud AISI');
  }

  onFotografiasSaludIndicadoresAISIChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaSaludIndicadoresAISI', 'fotografiasSaludIndicadoresAISIFormMulti', 'Indicadores de Salud AISI', 'GEADES, 2024', 'fotoSaludIndicadoresAISIPreview');
  }

  getFotografiasEducacionIndicadoresAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaEducacionIndicadoresAISI', 'fotografiasEducacionIndicadoresAISIFormMulti', 'Indicadores de Educación AISI');
  }

  onFotografiasEducacionIndicadoresAISIChange(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaEducacionIndicadoresAISI', 'fotografiasEducacionIndicadoresAISIFormMulti', 'Indicadores de Educación AISI', 'GEADES, 2024', 'fotoEducacionIndicadoresAISIPreview');
  }

  getFotografiasSeccion1FormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaSeccion1', 'fotografiasSeccion1FormMulti', 'Sección 1');
  }

  onFotografiasSeccion1Change(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaSeccion1', 'fotografiasSeccion1FormMulti', 'Sección 1', 'GEADES, 2024', 'fotoSeccion1Preview');
  }

  actualizarFotografiasSeccion1FormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaSeccion1',
      'fotografiasSeccion1FormMulti',
      'Sección 1'
    );
  }

  getFotografiasSeccion2FormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaSeccion2', 'fotografiasSeccion2FormMulti', 'Sección 2');
  }

  onFotografiasSeccion2Change(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaSeccion2', 'fotografiasSeccion2FormMulti', 'Sección 2', 'GEADES, 2024', 'fotoSeccion2Preview');
  }

  actualizarFotografiasSeccion2FormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaSeccion2',
      'fotografiasSeccion2FormMulti',
      'Sección 2'
    );
  }

  getFotografiasSeccion3FormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaSeccion3', 'fotografiasSeccion3FormMulti', 'Sección 3');
  }

  onFotografiasSeccion3Change(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaSeccion3', 'fotografiasSeccion3FormMulti', 'Sección 3', 'GEADES, 2024', 'fotoSeccion3Preview');
  }

  actualizarFotografiasSeccion3FormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaSeccion3',
      'fotografiasSeccion3FormMulti',
      'Sección 3'
    );
  }

  getFotografiasSeccion4FormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaSeccion4', 'fotografiasSeccion4FormMulti', 'Sección 4');
  }

  onFotografiasSeccion4Change(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaSeccion4', 'fotografiasSeccion4FormMulti', 'Sección 4', 'GEADES, 2024', 'fotoSeccion4Preview');
  }

  actualizarFotografiasSeccion4FormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaSeccion4',
      'fotografiasSeccion4FormMulti',
      'Sección 4'
    );
  }

  getFotografiasSeccion14FormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaSeccion14', 'fotografiasSeccion14FormMulti', 'Sección 14');
  }

  onFotografiasSeccion14Change(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaSeccion14', 'fotografiasSeccion14FormMulti', 'Sección 14', 'GEADES, 2024', 'fotoSeccion14Preview');
  }

  getFotografiasSeccion17FormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaSeccion17', 'fotografiasSeccion17FormMulti', 'Sección 17');
  }

  onFotografiasSeccion17Change(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaSeccion17', 'fotografiasSeccion17FormMulti', 'Sección 17', 'GEADES, 2024', 'fotoSeccion17Preview');
  }

  getFotografiasSeccion18FormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaSeccion18', 'fotografiasSeccion18FormMulti', 'Sección 18');
  }

  onFotografiasSeccion18Change(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaSeccion18', 'fotografiasSeccion18FormMulti', 'Sección 18', 'GEADES, 2024', 'fotoSeccion18Preview');
  }

  getFotografiasSeccion19FormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaSeccion19', 'fotografiasSeccion19FormMulti', 'Sección 19');
  }

  onFotografiasSeccion19Change(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaSeccion19', 'fotografiasSeccion19FormMulti', 'Sección 19', 'GEADES, 2024', 'fotoSeccion19Preview');
  }

  getFotografiasSeccion20FormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaSeccion20', 'fotografiasSeccion20FormMulti', 'Sección 20');
  }

  onFotografiasSeccion20Change(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaSeccion20', 'fotografiasSeccion20FormMulti', 'Sección 20', 'GEADES, 2024', 'fotoSeccion20Preview');
  }

  getFotografiasSeccion22FormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaSeccion22', 'fotografiasSeccion22FormMulti', 'Sección 22');
  }

  onFotografiasSeccion22Change(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaSeccion22', 'fotografiasSeccion22FormMulti', 'Sección 22', 'GEADES, 2024', 'fotoSeccion22Preview');
  }

  getFotografiasSeccion23FormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaSeccion23', 'fotografiasSeccion23FormMulti', 'Sección 23');
  }

  onFotografiasSeccion23Change(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaSeccion23', 'fotografiasSeccion23FormMulti', 'Sección 23', 'GEADES, 2024', 'fotoSeccion23Preview');
  }

  getFotografiasSeccion29FormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaSeccion29', 'fotografiasSeccion29FormMulti', 'Sección 29');
  }

  onFotografiasSeccion29Change(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaSeccion29', 'fotografiasSeccion29FormMulti', 'Sección 29', 'GEADES, 2024', 'fotoSeccion29Preview');
  }

  getFotografiasSeccion30FormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric('fotografiaSeccion30', 'fotografiasSeccion30FormMulti', 'Sección 30');
  }

  onFotografiasSeccion30Change(fotografias: any[]) {
    this.onFotografiasChangeGeneric(fotografias, 'fotografiaSeccion30', 'fotografiasSeccion30FormMulti', 'Sección 30', 'GEADES, 2024', 'fotoSeccion30Preview');
  }

  inicializarTiposViviendaAISI() {
    if (!this.datos['tiposViviendaAISI'] || this.datos['tiposViviendaAISI'].length === 0) {
      this.datos['tiposViviendaAISI'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('tiposViviendaAISI', this.datos['tiposViviendaAISI']);
      this.cdRef.detectChanges();
    }
  }

  agregarTiposViviendaAISI() {
    if (!this.datos['tiposViviendaAISI']) {
      this.inicializarTiposViviendaAISI();
    }
    this.datos['tiposViviendaAISI'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('tiposViviendaAISI', this.datos['tiposViviendaAISI']);
    this.calcularPorcentajesTiposViviendaAISI();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarTiposViviendaAISI(index: number) {
    if (this.datos['tiposViviendaAISI'] && this.datos['tiposViviendaAISI'].length > 1) {
      const item = this.datos['tiposViviendaAISI'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['tiposViviendaAISI'].splice(index, 1);
        this.formularioService.actualizarDato('tiposViviendaAISI', this.datos['tiposViviendaAISI']);
        this.calcularPorcentajesTiposViviendaAISI();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarTiposViviendaAISI(index: number, field: string, value: any) {
    if (!this.datos['tiposViviendaAISI']) {
      this.inicializarTiposViviendaAISI();
    }
    if (this.datos['tiposViviendaAISI'][index]) {
      this.datos['tiposViviendaAISI'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesTiposViviendaAISI();
      }
      this.formularioService.actualizarDato('tiposViviendaAISI', this.datos['tiposViviendaAISI']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesTiposViviendaAISI() {
    if (!this.datos['tiposViviendaAISI'] || this.datos['tiposViviendaAISI'].length === 0) {
      return;
    }
    const totalItem = this.datos['tiposViviendaAISI'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['tiposViviendaAISI'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarCondicionOcupacionAISI() {
    if (!this.datos['condicionOcupacionAISI'] || this.datos['condicionOcupacionAISI'].length === 0) {
      this.datos['condicionOcupacionAISI'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('condicionOcupacionAISI', this.datos['condicionOcupacionAISI']);
      this.cdRef.detectChanges();
    }
  }

  agregarCondicionOcupacionAISI() {
    if (!this.datos['condicionOcupacionAISI']) {
      this.inicializarCondicionOcupacionAISI();
    }
    this.datos['condicionOcupacionAISI'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('condicionOcupacionAISI', this.datos['condicionOcupacionAISI']);
    this.calcularPorcentajesCondicionOcupacionAISI();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCondicionOcupacionAISI(index: number) {
    if (this.datos['condicionOcupacionAISI'] && this.datos['condicionOcupacionAISI'].length > 1) {
      const item = this.datos['condicionOcupacionAISI'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['condicionOcupacionAISI'].splice(index, 1);
        this.formularioService.actualizarDato('condicionOcupacionAISI', this.datos['condicionOcupacionAISI']);
        this.calcularPorcentajesCondicionOcupacionAISI();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarCondicionOcupacionAISI(index: number, field: string, value: any) {
    if (!this.datos['condicionOcupacionAISI']) {
      this.inicializarCondicionOcupacionAISI();
    }
    if (this.datos['condicionOcupacionAISI'][index]) {
      this.datos['condicionOcupacionAISI'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesCondicionOcupacionAISI();
      }
      this.formularioService.actualizarDato('condicionOcupacionAISI', this.datos['condicionOcupacionAISI']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesCondicionOcupacionAISI() {
    if (!this.datos['condicionOcupacionAISI'] || this.datos['condicionOcupacionAISI'].length === 0) {
      return;
    }
    const totalItem = this.datos['condicionOcupacionAISI'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['condicionOcupacionAISI'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarMaterialesViviendaAISI() {
    if (!this.datos['materialesViviendaAISI'] || this.datos['materialesViviendaAISI'].length === 0) {
      this.datos['materialesViviendaAISI'] = [
        { categoria: '', tipoMaterial: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('materialesViviendaAISI', this.datos['materialesViviendaAISI']);
      this.cdRef.detectChanges();
    }
  }

  agregarMaterialesViviendaAISI() {
    if (!this.datos['materialesViviendaAISI']) {
      this.inicializarMaterialesViviendaAISI();
    }
    this.datos['materialesViviendaAISI'].push({ categoria: '', tipoMaterial: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('materialesViviendaAISI', this.datos['materialesViviendaAISI']);
    this.calcularPorcentajesMaterialesViviendaAISI();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarMaterialesViviendaAISI(index: number) {
    if (this.datos['materialesViviendaAISI'] && this.datos['materialesViviendaAISI'].length > 1) {
      this.datos['materialesViviendaAISI'].splice(index, 1);
      this.formularioService.actualizarDato('materialesViviendaAISI', this.datos['materialesViviendaAISI']);
      this.calcularPorcentajesMaterialesViviendaAISI();
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarMaterialesViviendaAISI(index: number, field: string, value: any) {
    if (!this.datos['materialesViviendaAISI']) {
      this.inicializarMaterialesViviendaAISI();
    }
    if (this.datos['materialesViviendaAISI'][index]) {
      this.datos['materialesViviendaAISI'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesMaterialesViviendaAISI();
      }
      this.formularioService.actualizarDato('materialesViviendaAISI', this.datos['materialesViviendaAISI']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesMaterialesViviendaAISI() {
    if (!this.datos['materialesViviendaAISI'] || this.datos['materialesViviendaAISI'].length === 0) {
      return;
    }
    const categorias = ['paredes', 'techos', 'pisos'];
    categorias.forEach(categoria => {
      const itemsCategoria = this.datos['materialesViviendaAISI'].filter((item: any) => 
        item.categoria && item.categoria.toLowerCase().includes(categoria)
      );
      if (itemsCategoria.length > 0) {
        const totalItem = itemsCategoria.find((item: any) => 
          item.categoria && item.categoria.toLowerCase().includes('total')
        );
        const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
        
        if (total > 0) {
          itemsCategoria.forEach((item: any) => {
            if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
              const casos = parseFloat(item.casos) || 0;
              const porcentaje = ((casos / total) * 100).toFixed(2);
              item.porcentaje = porcentaje + ' %';
            }
          });
        }
      }
    });
  }

  onImagenEstructuraAISIChange(imagenBase64: string) {
    this.fotoEstructuraAISIPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaEstructuraAISIImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  inicializarAbastecimientoAguaCP() {
    if (!this.datos['abastecimientoAguaCpTabla'] || this.datos['abastecimientoAguaCpTabla'].length === 0) {
      this.datos['abastecimientoAguaCpTabla'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('abastecimientoAguaCpTabla', this.datos['abastecimientoAguaCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarAbastecimientoAguaCP() {
    if (!this.datos['abastecimientoAguaCpTabla']) {
      this.inicializarAbastecimientoAguaCP();
    }
    this.datos['abastecimientoAguaCpTabla'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('abastecimientoAguaCpTabla', this.datos['abastecimientoAguaCpTabla']);
    this.calcularPorcentajesAbastecimientoAguaCP();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarAbastecimientoAguaCP(index: number) {
    if (this.datos['abastecimientoAguaCpTabla'] && this.datos['abastecimientoAguaCpTabla'].length > 1) {
      const item = this.datos['abastecimientoAguaCpTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['abastecimientoAguaCpTabla'].splice(index, 1);
        this.formularioService.actualizarDato('abastecimientoAguaCpTabla', this.datos['abastecimientoAguaCpTabla']);
        this.calcularPorcentajesAbastecimientoAguaCP();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarAbastecimientoAguaCP(index: number, field: string, value: any) {
    if (!this.datos['abastecimientoAguaCpTabla']) {
      this.inicializarAbastecimientoAguaCP();
    }
    if (this.datos['abastecimientoAguaCpTabla'][index]) {
      this.datos['abastecimientoAguaCpTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesAbastecimientoAguaCP();
      }
      this.formularioService.actualizarDato('abastecimientoAguaCpTabla', this.datos['abastecimientoAguaCpTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesAbastecimientoAguaCP() {
    if (!this.datos['abastecimientoAguaCpTabla'] || this.datos['abastecimientoAguaCpTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['abastecimientoAguaCpTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['abastecimientoAguaCpTabla'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarSaneamientoCP() {
    if (!this.datos['saneamientoCpTabla'] || this.datos['saneamientoCpTabla'].length === 0) {
      this.datos['saneamientoCpTabla'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('saneamientoCpTabla', this.datos['saneamientoCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarSaneamientoCP() {
    if (!this.datos['saneamientoCpTabla']) {
      this.inicializarSaneamientoCP();
    }
    this.datos['saneamientoCpTabla'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('saneamientoCpTabla', this.datos['saneamientoCpTabla']);
    this.calcularPorcentajesSaneamientoCP();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarSaneamientoCP(index: number) {
    if (this.datos['saneamientoCpTabla'] && this.datos['saneamientoCpTabla'].length > 1) {
      const item = this.datos['saneamientoCpTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['saneamientoCpTabla'].splice(index, 1);
        this.formularioService.actualizarDato('saneamientoCpTabla', this.datos['saneamientoCpTabla']);
        this.calcularPorcentajesSaneamientoCP();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarSaneamientoCP(index: number, field: string, value: any) {
    if (!this.datos['saneamientoCpTabla']) {
      this.inicializarSaneamientoCP();
    }
    if (this.datos['saneamientoCpTabla'][index]) {
      this.datos['saneamientoCpTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesSaneamientoCP();
      }
      this.formularioService.actualizarDato('saneamientoCpTabla', this.datos['saneamientoCpTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesSaneamientoCP() {
    if (!this.datos['saneamientoCpTabla'] || this.datos['saneamientoCpTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['saneamientoCpTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['saneamientoCpTabla'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarCoberturaElectricaCP() {
    if (!this.datos['coberturaElectricaCpTabla'] || this.datos['coberturaElectricaCpTabla'].length === 0) {
      this.datos['coberturaElectricaCpTabla'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('coberturaElectricaCpTabla', this.datos['coberturaElectricaCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarCoberturaElectricaCP() {
    if (!this.datos['coberturaElectricaCpTabla']) {
      this.inicializarCoberturaElectricaCP();
    }
    this.datos['coberturaElectricaCpTabla'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('coberturaElectricaCpTabla', this.datos['coberturaElectricaCpTabla']);
    this.calcularPorcentajesCoberturaElectricaCP();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCoberturaElectricaCP(index: number) {
    if (this.datos['coberturaElectricaCpTabla'] && this.datos['coberturaElectricaCpTabla'].length > 1) {
      const item = this.datos['coberturaElectricaCpTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['coberturaElectricaCpTabla'].splice(index, 1);
        this.formularioService.actualizarDato('coberturaElectricaCpTabla', this.datos['coberturaElectricaCpTabla']);
        this.calcularPorcentajesCoberturaElectricaCP();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarCoberturaElectricaCP(index: number, field: string, value: any) {
    if (!this.datos['coberturaElectricaCpTabla']) {
      this.inicializarCoberturaElectricaCP();
    }
    if (this.datos['coberturaElectricaCpTabla'][index]) {
      this.datos['coberturaElectricaCpTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesCoberturaElectricaCP();
      }
      this.formularioService.actualizarDato('coberturaElectricaCpTabla', this.datos['coberturaElectricaCpTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesCoberturaElectricaCP() {
    if (!this.datos['coberturaElectricaCpTabla'] || this.datos['coberturaElectricaCpTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['coberturaElectricaCpTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['coberturaElectricaCpTabla'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarCombustiblesCocinarCP() {
    if (!this.datos['combustiblesCocinarCpTabla'] || this.datos['combustiblesCocinarCpTabla'].length === 0) {
      this.datos['combustiblesCocinarCpTabla'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('combustiblesCocinarCpTabla', this.datos['combustiblesCocinarCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarCombustiblesCocinarCP() {
    if (!this.datos['combustiblesCocinarCpTabla']) {
      this.inicializarCombustiblesCocinarCP();
    }
    this.datos['combustiblesCocinarCpTabla'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('combustiblesCocinarCpTabla', this.datos['combustiblesCocinarCpTabla']);
    this.calcularPorcentajesCombustiblesCocinarCP();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCombustiblesCocinarCP(index: number) {
    if (this.datos['combustiblesCocinarCpTabla'] && this.datos['combustiblesCocinarCpTabla'].length > 1) {
      const item = this.datos['combustiblesCocinarCpTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['combustiblesCocinarCpTabla'].splice(index, 1);
        this.formularioService.actualizarDato('combustiblesCocinarCpTabla', this.datos['combustiblesCocinarCpTabla']);
        this.calcularPorcentajesCombustiblesCocinarCP();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarCombustiblesCocinarCP(index: number, field: string, value: any) {
    if (!this.datos['combustiblesCocinarCpTabla']) {
      this.inicializarCombustiblesCocinarCP();
    }
    if (this.datos['combustiblesCocinarCpTabla'][index]) {
      this.datos['combustiblesCocinarCpTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesCombustiblesCocinarCP();
      }
      this.formularioService.actualizarDato('combustiblesCocinarCpTabla', this.datos['combustiblesCocinarCpTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesCombustiblesCocinarCP() {
    if (!this.datos['combustiblesCocinarCpTabla'] || this.datos['combustiblesCocinarCpTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['combustiblesCocinarCpTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['combustiblesCocinarCpTabla'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  onImagenDesechosSolidosAISIChange(imagenBase64: string) {
    this.fotoDesechosSolidosAISIPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaDesechosSolidosAISIImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  onImagenElectricidadAISIChange(imagenBase64: string) {
    this.fotoElectricidadAISIPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaElectricidadAISIImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  inicializarTelecomunicacionesCP() {
    if (!this.datos['telecomunicacionesCpTabla'] || this.datos['telecomunicacionesCpTabla'].length === 0) {
      this.datos['telecomunicacionesCpTabla'] = [
        { medio: '', descripcion: '' }
      ];
      this.formularioService.actualizarDato('telecomunicacionesCpTabla', this.datos['telecomunicacionesCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarTelecomunicacionesCP() {
    if (!this.datos['telecomunicacionesCpTabla']) {
      this.inicializarTelecomunicacionesCP();
    }
    this.datos['telecomunicacionesCpTabla'].push({ medio: '', descripcion: '' });
    this.formularioService.actualizarDato('telecomunicacionesCpTabla', this.datos['telecomunicacionesCpTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarTelecomunicacionesCP(index: number) {
    if (this.datos['telecomunicacionesCpTabla'] && this.datos['telecomunicacionesCpTabla'].length > 1) {
      this.datos['telecomunicacionesCpTabla'].splice(index, 1);
      this.formularioService.actualizarDato('telecomunicacionesCpTabla', this.datos['telecomunicacionesCpTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarTelecomunicacionesCP(index: number, field: string, value: any) {
    if (!this.datos['telecomunicacionesCpTabla']) {
      this.inicializarTelecomunicacionesCP();
    }
    if (this.datos['telecomunicacionesCpTabla'][index]) {
      this.datos['telecomunicacionesCpTabla'][index][field] = value;
      this.formularioService.actualizarDato('telecomunicacionesCpTabla', this.datos['telecomunicacionesCpTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  onImagenTransporteAISIChange(imagenBase64: string) {
    this.fotoTransporteAISIPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaTransporteAISIImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  onImagenTelecomunicacionesAISIChange(imagenBase64: string) {
    this.fotoTelecomunicacionesAISIPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaTelecomunicacionesAISIImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  inicializarPuestoSaludCP() {
    if (!this.datos['puestoSaludCpTabla'] || this.datos['puestoSaludCpTabla'].length === 0) {
      this.datos['puestoSaludCpTabla'] = [
        { categoria: '', descripcion: '' }
      ];
      this.formularioService.actualizarDato('puestoSaludCpTabla', this.datos['puestoSaludCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarPuestoSaludCP() {
    if (!this.datos['puestoSaludCpTabla']) {
      this.inicializarPuestoSaludCP();
    }
    this.datos['puestoSaludCpTabla'].push({ categoria: '', descripcion: '' });
    this.formularioService.actualizarDato('puestoSaludCpTabla', this.datos['puestoSaludCpTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPuestoSaludCP(index: number) {
    if (this.datos['puestoSaludCpTabla'] && this.datos['puestoSaludCpTabla'].length > 1) {
      this.datos['puestoSaludCpTabla'].splice(index, 1);
      this.formularioService.actualizarDato('puestoSaludCpTabla', this.datos['puestoSaludCpTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarPuestoSaludCP(index: number, field: string, value: any) {
    if (!this.datos['puestoSaludCpTabla']) {
      this.inicializarPuestoSaludCP();
    }
    if (this.datos['puestoSaludCpTabla'][index]) {
      this.datos['puestoSaludCpTabla'][index][field] = value;
      this.formularioService.actualizarDato('puestoSaludCpTabla', this.datos['puestoSaludCpTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarEducacionCP() {
    if (!this.datos['educacionCpTabla'] || this.datos['educacionCpTabla'].length === 0) {
      this.datos['educacionCpTabla'] = [
        { nombreIE: '', nivel: '', tipoGestion: '', cantidadEstudiantes: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('educacionCpTabla', this.datos['educacionCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarEducacionCP() {
    if (!this.datos['educacionCpTabla']) {
      this.inicializarEducacionCP();
    }
    this.datos['educacionCpTabla'].push({ nombreIE: '', nivel: '', tipoGestion: '', cantidadEstudiantes: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('educacionCpTabla', this.datos['educacionCpTabla']);
    this.calcularPorcentajesEducacionCP();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarEducacionCP(index: number) {
    if (this.datos['educacionCpTabla'] && this.datos['educacionCpTabla'].length > 1) {
      const item = this.datos['educacionCpTabla'][index];
      if (!item.nombreIE || !item.nombreIE.toLowerCase().includes('total')) {
        this.datos['educacionCpTabla'].splice(index, 1);
        this.formularioService.actualizarDato('educacionCpTabla', this.datos['educacionCpTabla']);
        this.calcularPorcentajesEducacionCP();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarEducacionCP(index: number, field: string, value: any) {
    if (!this.datos['educacionCpTabla']) {
      this.inicializarEducacionCP();
    }
    if (this.datos['educacionCpTabla'][index]) {
      this.datos['educacionCpTabla'][index][field] = value;
      if (field === 'cantidadEstudiantes') {
        this.calcularPorcentajesEducacionCP();
      }
      this.formularioService.actualizarDato('educacionCpTabla', this.datos['educacionCpTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesEducacionCP() {
    if (!this.datos['educacionCpTabla'] || this.datos['educacionCpTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['educacionCpTabla'].find((item: any) => 
      item.nombreIE && item.nombreIE.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.cantidadEstudiantes) || 0 : 0;
    
    if (total > 0) {
      this.datos['educacionCpTabla'].forEach((item: any) => {
        if (!item.nombreIE || !item.nombreIE.toLowerCase().includes('total')) {
          const cantidad = parseFloat(item.cantidadEstudiantes) || 0;
          const porcentaje = ((cantidad / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  onImagenSaludAISIChange(imagenBase64: string) {
    this.fotoSaludAISIPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaSaludAISIImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  onImagenEducacion1AISIChange(imagenBase64: string) {
    this.fotoEducacion1AISIPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaEducacion1AISIImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  onImagenEducacion2AISIChange(imagenBase64: string) {
    this.fotoEducacion2AISIPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaEducacion2AISIImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  onImagenEducacion3AISIChange(imagenBase64: string) {
    this.fotoEducacion3AISIPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaEducacion3AISIImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  onImagenRecreacionAISIChange(imagenBase64: string) {
    this.fotoRecreacionAISIPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaRecreacionAISIImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  onImagenDeporteAISIChange(imagenBase64: string) {
    this.fotoDeporteAISIPreview = imagenBase64 || null;
    const fotoKey = 'fotografiaDeporteAISIImagen';
    this.formData[fotoKey] = imagenBase64;
    this.datos[fotoKey] = imagenBase64;
    this.formularioService.actualizarDato(fotoKey, imagenBase64);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  inicializarNatalidadMortalidadCP() {
    if (!this.datos['natalidadMortalidadCpTabla'] || this.datos['natalidadMortalidadCpTabla'].length === 0) {
      this.datos['natalidadMortalidadCpTabla'] = [
        { anio: '', natalidad: 0, mortalidad: 0 }
      ];
      this.formularioService.actualizarDato('natalidadMortalidadCpTabla', this.datos['natalidadMortalidadCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarNatalidadMortalidadCP() {
    if (!this.datos['natalidadMortalidadCpTabla']) {
      this.inicializarNatalidadMortalidadCP();
    }
    this.datos['natalidadMortalidadCpTabla'].push({ anio: '', natalidad: 0, mortalidad: 0 });
    this.formularioService.actualizarDato('natalidadMortalidadCpTabla', this.datos['natalidadMortalidadCpTabla']);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarNatalidadMortalidadCP(index: number) {
    if (this.datos['natalidadMortalidadCpTabla'] && this.datos['natalidadMortalidadCpTabla'].length > 1) {
      this.datos['natalidadMortalidadCpTabla'].splice(index, 1);
      this.formularioService.actualizarDato('natalidadMortalidadCpTabla', this.datos['natalidadMortalidadCpTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarNatalidadMortalidadCP(index: number, field: string, value: any) {
    if (!this.datos['natalidadMortalidadCpTabla']) {
      this.inicializarNatalidadMortalidadCP();
    }
    if (this.datos['natalidadMortalidadCpTabla'][index]) {
      this.datos['natalidadMortalidadCpTabla'][index][field] = value;
      this.formularioService.actualizarDato('natalidadMortalidadCpTabla', this.datos['natalidadMortalidadCpTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarMorbilidadCP() {
    if (!this.datos['morbilidadCpTabla'] || this.datos['morbilidadCpTabla'].length === 0) {
      this.datos['morbilidadCpTabla'] = [
        { grupo: '', edad0_11: 0, edad12_17: 0, edad18_29: 0, edad30_59: 0, edad60_mas: 0, casos: 0 }
      ];
      this.formularioService.actualizarDato('morbilidadCpTabla', this.datos['morbilidadCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarMorbilidadCP() {
    if (!this.datos['morbilidadCpTabla']) {
      this.inicializarMorbilidadCP();
    }
    this.datos['morbilidadCpTabla'].push({ grupo: '', edad0_11: 0, edad12_17: 0, edad18_29: 0, edad30_59: 0, edad60_mas: 0, casos: 0 });
    this.formularioService.actualizarDato('morbilidadCpTabla', this.datos['morbilidadCpTabla']);
    this.calcularTotalesMorbilidadCP();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarMorbilidadCP(index: number) {
    if (this.datos['morbilidadCpTabla'] && this.datos['morbilidadCpTabla'].length > 1) {
      this.datos['morbilidadCpTabla'].splice(index, 1);
      this.formularioService.actualizarDato('morbilidadCpTabla', this.datos['morbilidadCpTabla']);
      this.calcularTotalesMorbilidadCP();
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarMorbilidadCP(index: number, field: string, value: any) {
    if (!this.datos['morbilidadCpTabla']) {
      this.inicializarMorbilidadCP();
    }
    if (this.datos['morbilidadCpTabla'][index]) {
      this.datos['morbilidadCpTabla'][index][field] = value;
      if (field !== 'casos' && field !== 'grupo') {
        this.calcularTotalesMorbilidadCP();
      }
      this.formularioService.actualizarDato('morbilidadCpTabla', this.datos['morbilidadCpTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularTotalesMorbilidadCP() {
    if (!this.datos['morbilidadCpTabla'] || this.datos['morbilidadCpTabla'].length === 0) {
      return;
    }
    this.datos['morbilidadCpTabla'].forEach((item: any) => {
      const edad0_11 = parseFloat(item.edad0_11) || 0;
      const edad12_17 = parseFloat(item.edad12_17) || 0;
      const edad18_29 = parseFloat(item.edad18_29) || 0;
      const edad30_59 = parseFloat(item.edad30_59) || 0;
      const edad60_mas = parseFloat(item.edad60_mas) || 0;
      const total = edad0_11 + edad12_17 + edad18_29 + edad30_59 + edad60_mas;
      item.casos = total;
    });
  }

  inicializarAfiliacionSaludTabla() {
    if (!this.datos['afiliacionSaludTabla'] || this.datos['afiliacionSaludTabla'].length === 0) {
      this.datos['afiliacionSaludTabla'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('afiliacionSaludTabla', this.datos['afiliacionSaludTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarAfiliacionSaludTabla() {
    if (!this.datos['afiliacionSaludTabla']) {
      this.inicializarAfiliacionSaludTabla();
    }
    this.datos['afiliacionSaludTabla'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('afiliacionSaludTabla', this.datos['afiliacionSaludTabla']);
    this.calcularPorcentajesAfiliacionSaludTabla();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarAfiliacionSaludTabla(index: number) {
    if (this.datos['afiliacionSaludTabla'] && this.datos['afiliacionSaludTabla'].length > 1) {
      const item = this.datos['afiliacionSaludTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['afiliacionSaludTabla'].splice(index, 1);
        this.formularioService.actualizarDato('afiliacionSaludTabla', this.datos['afiliacionSaludTabla']);
        this.calcularPorcentajesAfiliacionSaludTabla();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarAfiliacionSaludTabla(index: number, field: string, value: any) {
    if (!this.datos['afiliacionSaludTabla']) {
      this.inicializarAfiliacionSaludTabla();
    }
    if (this.datos['afiliacionSaludTabla'][index]) {
      this.datos['afiliacionSaludTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesAfiliacionSaludTabla();
      }
      this.formularioService.actualizarDato('afiliacionSaludTabla', this.datos['afiliacionSaludTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesAfiliacionSaludTabla() {
    if (!this.datos['afiliacionSaludTabla'] || this.datos['afiliacionSaludTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['afiliacionSaludTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['afiliacionSaludTabla'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarNivelEducativoTabla() {
    if (!this.datos['nivelEducativoTabla'] || this.datos['nivelEducativoTabla'].length === 0) {
      this.datos['nivelEducativoTabla'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarNivelEducativoTabla() {
    if (!this.datos['nivelEducativoTabla']) {
      this.inicializarNivelEducativoTabla();
    }
    this.datos['nivelEducativoTabla'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
    this.calcularPorcentajesNivelEducativoTabla();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarNivelEducativoTabla(index: number) {
    if (this.datos['nivelEducativoTabla'] && this.datos['nivelEducativoTabla'].length > 1) {
      const item = this.datos['nivelEducativoTabla'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['nivelEducativoTabla'].splice(index, 1);
        this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
        this.calcularPorcentajesNivelEducativoTabla();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarNivelEducativoTabla(index: number, field: string, value: any) {
    if (!this.datos['nivelEducativoTabla']) {
      this.inicializarNivelEducativoTabla();
    }
    if (this.datos['nivelEducativoTabla'][index]) {
      this.datos['nivelEducativoTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesNivelEducativoTabla();
      }
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesNivelEducativoTabla() {
    if (!this.datos['nivelEducativoTabla'] || this.datos['nivelEducativoTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['nivelEducativoTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['nivelEducativoTabla'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarTasaAnalfabetismoTabla() {
    if (!this.datos['tasaAnalfabetismoTabla'] || this.datos['tasaAnalfabetismoTabla'].length === 0) {
      this.datos['tasaAnalfabetismoTabla'] = [
        { indicador: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarTasaAnalfabetismoTabla() {
    if (!this.datos['tasaAnalfabetismoTabla']) {
      this.inicializarTasaAnalfabetismoTabla();
    }
    this.datos['tasaAnalfabetismoTabla'].push({ indicador: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
    this.calcularPorcentajesTasaAnalfabetismoTabla();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarTasaAnalfabetismoTabla(index: number) {
    if (this.datos['tasaAnalfabetismoTabla'] && this.datos['tasaAnalfabetismoTabla'].length > 1) {
      const item = this.datos['tasaAnalfabetismoTabla'][index];
      if (!item.indicador || !item.indicador.toLowerCase().includes('total')) {
        this.datos['tasaAnalfabetismoTabla'].splice(index, 1);
        this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
        this.calcularPorcentajesTasaAnalfabetismoTabla();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarTasaAnalfabetismoTabla(index: number, field: string, value: any) {
    if (!this.datos['tasaAnalfabetismoTabla']) {
      this.inicializarTasaAnalfabetismoTabla();
    }
    if (this.datos['tasaAnalfabetismoTabla'][index]) {
      this.datos['tasaAnalfabetismoTabla'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesTasaAnalfabetismoTabla();
      }
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesTasaAnalfabetismoTabla() {
    if (!this.datos['tasaAnalfabetismoTabla'] || this.datos['tasaAnalfabetismoTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['tasaAnalfabetismoTabla'].find((item: any) => 
      item.indicador && item.indicador.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['tasaAnalfabetismoTabla'].forEach((item: any) => {
        if (!item.indicador || !item.indicador.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  llenarDatosPrueba() {
    const datosPrueba: any = {};

    if (this.seccionId === '3.1.3' || this.seccionId === '3.1.3.A' || this.seccionId === '3.1.3.B') {
      datosPrueba.cantidadEntrevistas = '18';
      datosPrueba.fechaTrabajoCampo = 'noviembre 2024';
      datosPrueba.consultora = 'GEADES (2024)';
      datosPrueba.entrevistados = [
        { nombre: 'Miguel Ángel Sayaverde Rospigliosi', cargo: 'Presidente', organizacion: '' },
        { nombre: 'Julio Edilberto Ventura Quispe', cargo: 'Vicepresidente', organizacion: 'CC Ayroca' },
        { nombre: 'Zarita Juana Sayaverde Bustamante', cargo: 'Tesorero', organizacion: 'CC Ayroca' },
        { nombre: 'Elena Bustamante Rubio', cargo: 'Fiscal', organizacion: 'CC Ayroca' },
        { nombre: 'Kelvin Quispe Merino', cargo: 'Teniente Gobernador', organizacion: 'Anexo Ayroca' },
        { nombre: 'María Elena Aguayo Arias', cargo: 'Director', organizacion: 'IE Ayroca' },
        { nombre: 'Nieves Bernaola Torres', cargo: 'Director', organizacion: 'IE N°40270' },
        { nombre: 'Daniela Manuel Sivinche', cargo: 'Jefa de Puesto de Salud', organizacion: 'Puesto de Salud Ayroca' },
        { nombre: 'Daniela Núñez', cargo: 'Obstetra', organizacion: 'Puesto de Salud Ayroca' },
        { nombre: 'Catalina Inés De la Cruz Rubio', cargo: 'Regidor distrital', organizacion: 'Municipalidad Distrital de Cahuacho' },
        { nombre: 'Mario Sergio Patiño Merma', cargo: 'Gerente Municipal', organizacion: 'Municipalidad Distrital de Cahuacho' },
        { nombre: 'Kelvin Elías De la Cruz Quispe', cargo: 'Subprefecto', organizacion: 'Subprefectura Distrital de Cahuacho' },
        { nombre: 'Edgar Manuel Espinoza Aguayo', cargo: 'Ex-alcalde', organizacion: 'CP Cahuacho' },
        { nombre: 'Juana Espinoza De la Cruz', cargo: 'Presidente', organizacion: 'Comedor Popular "Virgen del Rosario"' },
        { nombre: 'María Rosario Yana Franco', cargo: 'Director', organizacion: 'IE Cahuacho' },
        { nombre: 'Maykeylyn Ccama Mamani', cargo: 'Director', organizacion: 'IE N°40271' },
        { nombre: 'Adrián Reynaldo Morante Chipana', cargo: 'Director', organizacion: 'IE Virgen de Copacabana' },
        { nombre: 'Deyma Salazar Herrera', cargo: 'Jefa de Recursos Humanos', organizacion: 'Puesto de Salud Cahuacho' }
      ];
    } else if (this.seccionId === '3.1.1') {
      datosPrueba.projectName = 'Paka';
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.provinciaSeleccionada = 'Caravelí';
      datosPrueba.departamentoSeleccionado = 'Arequipa';
    } else if (this.seccionId === '3.1.4.A.1.1') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.tituloInstituciones = 'Instituciones existentes - CC Ayroca';
      datosPrueba.fuenteInstituciones = 'GEADES (2024)';
      datosPrueba.tablepagina6 = [
        {
          categoria: 'Municipalidad',
          respuesta: 'NO',
          nombre: '--',
          comentario: '--'
        },
        {
          categoria: 'Programas Sociales',
          respuesta: 'SI',
          nombre: 'Pensión 65\nJuntos\nQali Warma\nComedor Popular\nVaso de Leche',
          comentario: '--'
        },
        {
          categoria: 'Empresa de transportes',
          respuesta: 'NO',
          nombre: '--',
          comentario: 'Se emplea únicamente una combi que brinda el servicio de transporte todos los lunes cubriendo la ruta entre Ayroca y Caravelí'
        },
        {
          categoria: 'Delegación Policial',
          respuesta: 'NO',
          nombre: '--',
          comentario: 'Acuden efectivos policiales de jurisdicciones cercanas en caso de urgencia'
        },
        {
          categoria: 'Comercializadora de insumos agropecuarios',
          respuesta: 'NO',
          nombre: '--',
          comentario: 'La población acude a diferentes destinos como Caravelí o Cora Cora'
        },
        {
          categoria: 'Instituciones que dan asistencia técnica agropecuaria',
          respuesta: 'SI',
          nombre: 'SENASA',
          comentario: 'Brinda asistencia técnica de manera esporádica, normalmente con periodicidad anual'
        },
        {
          categoria: 'Oficina de radio emisoras',
          respuesta: 'NO',
          nombre: '--',
          comentario: 'Existen dificultades para captar señal de radio'
        },
        {
          categoria: 'Estructura para mercado o feria',
          respuesta: 'NO',
          nombre: '--',
          comentario: '--'
        },
        {
          categoria: 'Infraestructura eléctrica',
          respuesta: 'SI',
          nombre: 'ADINELSA',
          comentario: '--'
        },
        {
          categoria: 'Infraestructura de agua y desagüe',
          respuesta: 'SI',
          nombre: 'JASS Ayroca',
          comentario: '--'
        },
        {
          categoria: 'Iglesias / Templos',
          respuesta: 'SI',
          nombre: 'Iglesia Matriz de Ayroca',
          comentario: '--'
        },
        {
          categoria: 'Telefonía móvil',
          respuesta: 'SI',
          nombre: 'Movistar\nEntel',
          comentario: '--'
        },
        {
          categoria: 'Agentes de entidades financieras',
          respuesta: 'NO',
          nombre: '--',
          comentario: 'Acuden al agente del Banco de la Nación en la Municipalidad Distrital de Cahuacho'
        },
        {
          categoria: 'Empresas mineras',
          respuesta: 'NO',
          nombre: '--',
          comentario: 'Existen indicios de actividad minera informal y/o artesanal'
        },
        {
          categoria: 'Empresas de exploración minera',
          respuesta: 'NO',
          nombre: '--',
          comentario: '--'
        }
      ];
      datosPrueba.fotografiaAISD3Titulo = 'Local Comunal de la CC Ayroca';
      datosPrueba.fotografiaAISD3Fuente = 'GEADES, 2024';
      datosPrueba.fotografiaInstitucionalidadTitulo = 'Local Comunal de la CC Ayroca';
      datosPrueba.fotografiaInstitucionalidadFuente = 'GEADES, 2024';
    } else if (this.seccionId === '3.1.4.A.1.2') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.tablaAISD2TotalPoblacion = '225';
      datosPrueba.poblacionSexoAISD = [
        {
          sexo: 'Hombres',
          casos: 114,
          porcentaje: '50,67 %'
        },
        {
          sexo: 'Mujeres',
          casos: 111,
          porcentaje: '49,33 %'
        }
      ];
      datosPrueba.poblacionEtarioAISD = [
        {
          categoria: '0 a 14 años',
          casos: 59,
          porcentaje: '26,22 %'
        },
        {
          categoria: '15 a 29 años',
          casos: 60,
          porcentaje: '26,67 %'
        },
        {
          categoria: '30 a 44 años',
          casos: 38,
          porcentaje: '16,89 %'
        },
        {
          categoria: '45 a 64 años',
          casos: 43,
          porcentaje: '19,11 %'
        },
        {
          categoria: '65 años a más',
          casos: 25,
          porcentaje: '11,11 %'
        }
      ];
    } else if (this.seccionId === '3.1.4.A.1.3') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.poblacionDistritalCahuacho = '610';
      datosPrueba.petDistritalCahuacho = '461';
      datosPrueba.ingresoFamiliarPerCapita = '391,06';
      datosPrueba.rankingIngresoPerCapita = '1191';
      datosPrueba.petTabla = [
        {
          categoria: '15 a 29 años',
          casos: 60,
          porcentaje: '36,14 %'
        },
        {
          categoria: '30 a 44 años',
          casos: 38,
          porcentaje: '22,89 %'
        },
        {
          categoria: '45 a 64 años',
          casos: 43,
          porcentaje: '25,90 %'
        },
        {
          categoria: '65 años a más',
          casos: 25,
          porcentaje: '15,06 %'
        },
        {
          categoria: 'Total',
          casos: 166,
          porcentaje: '100,00 %'
        }
      ];
      datosPrueba.peaTabla = [
        {
          categoria: 'PEA',
          hombres: 184,
          porcentajeHombres: '77,31 %',
          mujeres: 92,
          porcentajeMujeres: '41,26 %',
          casos: 276,
          porcentaje: '59,87 %'
        },
        {
          categoria: 'No PEA',
          hombres: 54,
          porcentajeHombres: '22,69 %',
          mujeres: 131,
          porcentajeMujeres: '58,74 %',
          casos: 185,
          porcentaje: '40,13 %'
        },
        {
          categoria: 'Total',
          hombres: 238,
          porcentajeHombres: '100,00 %',
          mujeres: 223,
          porcentajeMujeres: '100,00 %',
          casos: 461,
          porcentaje: '100,00 %'
        }
      ];
      datosPrueba.peaOcupadaTabla = [
        {
          categoria: 'PEA Ocupada',
          hombres: 180,
          porcentajeHombres: '97,83 %',
          mujeres: 87,
          porcentajeMujeres: '94,57 %',
          casos: 267,
          porcentaje: '96,74 %'
        },
        {
          categoria: 'PEA Desocupada',
          hombres: 4,
          porcentajeHombres: '2,17 %',
          mujeres: 5,
          porcentajeMujeres: '5,43 %',
          casos: 9,
          porcentaje: '3,26 %'
        },
        {
          categoria: 'Total',
          hombres: 184,
          porcentajeHombres: '100,00 %',
          mujeres: 92,
          porcentajeMujeres: '100,00 %',
          casos: 276,
          porcentaje: '100,00 %'
        }
      ];
    } else if (this.seccionId === '3.1.4.A.1.4') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.provinciaSeleccionada = 'Caravelí';
      datosPrueba.peaOcupacionesTabla = [
        {
          categoria: 'Trabajador independiente o por cuenta propia',
          casos: 59,
          porcentaje: '77,63 %'
        },
        {
          categoria: 'Obrero',
          casos: 12,
          porcentaje: '15,79 %'
        },
        {
          categoria: 'Empleado',
          casos: 5,
          porcentaje: '6,58 %'
        },
        {
          categoria: 'Empleador o patrono',
          casos: 0,
          porcentaje: '0,00 %'
        },
        {
          categoria: 'Trabajador en negocio de un familiar',
          casos: 0,
          porcentaje: '0,00 %'
        },
        {
          categoria: 'Trabajador del hogar',
          casos: 0,
          porcentaje: '0,00 %'
        },
        {
          categoria: 'Total',
          casos: 76,
          porcentaje: '100,00 %'
        }
      ];
      datosPrueba.poblacionPecuariaTabla = [
        {
          especie: 'Vacuno',
          cantidadPromedio: '4 – 50',
          ventaUnidad: 'S/. 1 200 – S/. 1 500'
        },
        {
          especie: 'Ovino',
          cantidadPromedio: '5 – 7',
          ventaUnidad: 'S/. 180 – S/. 200'
        },
        {
          especie: 'Gallinas',
          cantidadPromedio: '5 – 10',
          ventaUnidad: 'S/. 20 – S/. 30'
        },
        {
          especie: 'Cuyes',
          cantidadPromedio: '15 – 20',
          ventaUnidad: 'S/. 25 – S/. 30'
        }
      ];
      datosPrueba.caracteristicasAgriculturaTabla = [
        {
          categoria: 'Destino de la producción (aprox.)',
          detalle: 'Autoconsumo: 95 %\nVenta: 5 %'
        },
        {
          categoria: 'Tipos de Cultivo',
          detalle: 'Papa, haba, cebada, avena, alfalfa'
        },
        {
          categoria: 'Cantidad de área para cultivar (en Ha) por familia',
          detalle: '1 ½ ha.'
        },
        {
          categoria: 'Tipo de Riego',
          detalle: 'Gravedad'
        },
        {
          categoria: 'Mercado o lugares de venta',
          detalle: 'Comunalmente\nCapital provincial de Caravelí'
        },
        {
          categoria: 'Problemáticas principales',
          detalle: 'Heladas\nSequías\nPlagas y enfermedades'
        }
      ];
      datosPrueba.fotografiaGanaderia1Titulo = 'Ganado vacuno en la CC Ayroca';
      datosPrueba.fotografiaGanaderia1Fuente = 'GEADES, 2024';
      datosPrueba.fotografiaGanaderia2Titulo = 'Ganado ovino y caprino en la CC Ayroca';
      datosPrueba.fotografiaGanaderia2Fuente = 'GEADES, 2024';
      datosPrueba.fotografiaAgricultura1Titulo = 'Parcela agrícola en el anexo Ayroca';
      datosPrueba.fotografiaAgricultura1Fuente = 'GEADES, 2024';
      datosPrueba.fotografiaAgricultura2Titulo = 'Sector agrícola en la CC Ayroca';
      datosPrueba.fotografiaAgricultura2Fuente = 'GEADES, 2024';
      datosPrueba.fotografiaComercioTitulo = 'Comercio ambulatorio en el anexo Ayroca';
      datosPrueba.fotografiaComercioFuente = 'GEADES, 2024';
    } else if (this.seccionId === '3.1.4.A.1.5') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.condicionOcupacionTabla = [
        {
          categoria: 'Viviendas ocupadas',
          casos: 61,
          porcentaje: '67,78 %'
        },
        {
          categoria: 'Viviendas con otra condición',
          casos: 29,
          porcentaje: '32,22 %'
        },
        {
          categoria: 'Total',
          casos: 90,
          porcentaje: '100,00 %'
        }
      ];
      datosPrueba.tiposMaterialesTabla = [
        {
          categoria: 'Materiales de las paredes de las viviendas',
          tipoMaterial: 'Adobe',
          casos: 60,
          porcentaje: '98,36 %'
        },
        {
          categoria: 'Materiales de las paredes de las viviendas',
          tipoMaterial: 'Triplay / calamina / estera',
          casos: 1,
          porcentaje: '1,64 %'
        },
        {
          categoria: 'Materiales de las paredes de las viviendas',
          tipoMaterial: 'Total',
          casos: 61,
          porcentaje: '100,00 %'
        },
        {
          categoria: 'Materiales de los techos de las viviendas',
          tipoMaterial: 'Planchas de calamina, fibra de cemento o similares',
          casos: 59,
          porcentaje: '96,72 %'
        },
        {
          categoria: 'Materiales de los techos de las viviendas',
          tipoMaterial: 'Triplay / estera / carrizo',
          casos: 1,
          porcentaje: '1,64 %'
        },
        {
          categoria: 'Materiales de los techos de las viviendas',
          tipoMaterial: 'Tejas',
          casos: 1,
          porcentaje: '1,64 %'
        },
        {
          categoria: 'Materiales de los techos de las viviendas',
          tipoMaterial: 'Total',
          casos: 61,
          porcentaje: '100,00 %'
        },
        {
          categoria: 'Materiales de los pisos de las viviendas',
          tipoMaterial: 'Tierra',
          casos: 58,
          porcentaje: '95,08 %'
        },
        {
          categoria: 'Materiales de los pisos de las viviendas',
          tipoMaterial: 'Cemento',
          casos: 3,
          porcentaje: '4,92 %'
        },
        {
          categoria: 'Materiales de los pisos de las viviendas',
          tipoMaterial: 'Total',
          casos: 61,
          porcentaje: '100,00 %'
        }
      ];
      datosPrueba.fotografiaEstructuraTitulo = 'Estructura de las viviendas en el anexo Ayroca';
      datosPrueba.fotografiaEstructuraFuente = 'GEADES, 2024';
    } else if (this.seccionId === '3.1.4.A.1.6') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.abastecimientoAguaTabla = [
        {
          categoria: 'Viviendas con abastecimiento de agua por red pública',
          casos: 56,
          porcentaje: '91,80 %'
        },
        {
          categoria: 'Viviendas con abastecimiento de agua por pilón',
          casos: 0,
          porcentaje: '0,00 %'
        },
        {
          categoria: 'Viviendas sin abastecimiento de agua por los medios mencionados',
          casos: 5,
          porcentaje: '8,20 %'
        },
        {
          categoria: 'Total',
          casos: 61,
          porcentaje: '100,00 %'
        }
      ];
      datosPrueba.cuotaMensualAgua = '4';
      datosPrueba.tiposSaneamientoTabla = [
        {
          categoria: 'Viviendas con saneamiento vía red pública',
          casos: 47,
          porcentaje: '77,05 %'
        },
        {
          categoria: 'Viviendas con saneamiento vía pozo séptico',
          casos: 0,
          porcentaje: '0,00 %'
        },
        {
          categoria: 'Viviendas sin saneamiento vía los medios mencionados',
          casos: 14,
          porcentaje: '22,95 %'
        },
        {
          categoria: 'Total',
          casos: 61,
          porcentaje: '100,00 %'
        }
      ];
      datosPrueba.coberturaElectricaTabla = [
        {
          categoria: 'Viviendas con acceso a electricidad',
          casos: 55,
          porcentaje: '90,16 %'
        },
        {
          categoria: 'Viviendas sin acceso a electricidad',
          casos: 6,
          porcentaje: '9,84 %'
        },
        {
          categoria: 'Total',
          casos: 61,
          porcentaje: '100,00 %'
        }
      ];
      datosPrueba.empresaElectrica = 'ADINELSA';
      datosPrueba.costoElectricidadMinimo = '20';
      datosPrueba.costoElectricidadMaximo = '40';
      datosPrueba.fotografiaDesechosSolidosTitulo = 'Contenedor de residuos sólidos y plásticos en el anexo Ayroca';
      datosPrueba.fotografiaDesechosSolidosFuente = 'GEADES, 2024';
      datosPrueba.fotografiaElectricidadTitulo = 'Infraestructura eléctrica en el anexo Ayroca';
      datosPrueba.fotografiaElectricidadFuente = 'GEADES, 2024';
    } else if (this.seccionId === '3.1.4.A.1.7') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.provinciaSeleccionada = 'Caravelí';
      datosPrueba.costoTransporteMinimo = '25';
      datosPrueba.costoTransporteMaximo = '30';
      datosPrueba.telecomunicacionesTabla = [
        {
          medio: 'Emisoras de radio',
          descripcion: '--'
        },
        {
          medio: 'Señales de televisión',
          descripcion: 'América TV\nDIRECTV'
        },
        {
          medio: 'Señales de telefonía móvil',
          descripcion: 'Movistar\nEntel'
        },
        {
          medio: 'Señal de Internet',
          descripcion: 'Movistar'
        }
      ];
      datosPrueba.fotografiaTransporteTitulo = 'Infraestructura de transporte en la CC Ayroca';
      datosPrueba.fotografiaTransporteFuente = 'GEADES, 2024';
      datosPrueba.fotografiaTelecomunicacionesTitulo = 'Vivienda con antena de DIRECTV en el anexo Ayroca';
      datosPrueba.fotografiaTelecomunicacionesFuente = 'GEADES, 2024';
    } else if (this.seccionId === '3.1.4.A.1.8') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.provinciaSeleccionada = 'Caravelí';
      datosPrueba.caracteristicasSaludTabla = [
        { categoria: 'Nombre', descripcion: 'Puesto de Salud Ayroca' },
        { categoria: 'Ubicación', descripcion: 'Ayroca – Cahuacho – Caravelí – Arequipa' },
        { categoria: 'Director Médico y/o Responsable de la Atención de Salud', descripcion: 'Daniela Manuel Sivinche' },
        { categoria: 'Código Único de IPRESS', descripcion: '00001379' },
        { categoria: 'Categoría del EESS', descripcion: 'I – 2' },
        { categoria: 'Tipo de Establecimiento de Salud', descripcion: 'Establecimiento de salud sin internamiento' },
        { categoria: 'Nombre de la subcategoría (Clasificación)', descripcion: 'Puestos de salud o postas médicas' },
        { categoria: 'Estado del EESS', descripcion: 'Activo' },
        { categoria: 'Condición del EESS', descripcion: 'Activo' },
        { categoria: 'Nombre de DISA/DIRESA', descripcion: 'DIRESA Arequipa' },
        { categoria: 'Nombre de RED', descripcion: 'Camaná – Caravelí' },
        { categoria: 'Nombre de MICRORED', descripcion: 'Caravelí' },
        { categoria: 'Institución a la que pertenece el establecimiento', descripcion: 'MINSA' },
        { categoria: 'Teléfono del establecimiento', descripcion: '944 649 039 (Obstetra Daniela Núñez)' },
        { categoria: 'Grupo objetivo', descripcion: 'Población general' },
        { categoria: 'Número de ambientes con los que cuenta el establecimiento', descripcion: '8' },
        { categoria: 'Horario de atención', descripcion: '08:00 – 20:00' },
        { categoria: 'Número de atenciones mensuales', descripcion: '400' },
        { categoria: 'Infraestructura y servicios', descripcion: '• El establecimiento cuenta con los servicios básicos de agua, desagüe y electricidad.\n• Se cuenta con paneles solares que permiten la refrigeración de vacunas.\n• No tiene acceso a Internet.\n• Los desechos sólidos comunes son recogidos por la municipalidad (mensualmente), mientras que los biocontaminados por la RED.\n• La infraestructura del establecimiento consta de bloquetas en las paredes, calamina en los techos y cerámicos en los pisos.\n• El personal del establecimiento está conformado por cinco miembros: médico, obstetra, enfermera, y dos técnicos en enfermería.\n• Entre los servicios que se brindan se hallan los siguientes: medicina, obstetricia y enfermería. De manera complementaria se coordina campañas de psicología y salud bucal con la MICRORED.\n• Se cuenta con una ambulancia de tipo I – 1.' }
      ];
      datosPrueba.fotografiaSaludTitulo = 'Infraestructura externa del Puesto de Salud Ayroca';
      datosPrueba.fotografiaSaludFuente = 'GEADES, 2024';
      datosPrueba.cantidadEstudiantesEducacionTabla = [
        { institucion: 'IE Ayroca', nivel: 'Inicial - Jardín', gestion: 'Pública de gestión directa', total: 5, porcentaje: '19,23 %' },
        { institucion: 'IE N°40270', nivel: 'Primaria', gestion: 'Pública de gestión directa', total: 21, porcentaje: '80,77 %' }
      ];
      datosPrueba.ieAyrocaTabla = [
        { categoria: 'Tipo de I.E.', descripcion: 'Pública de gestión directa, mixta' },
        { categoria: 'Nombre del(la) director(a)', descripcion: 'María Elena Aguayo Arias' },
        { categoria: 'Características y observaciones', descripcion: '• La institución educativa data del año 1989, aproximadamente.\n• La directora de la institución es a la vez profesora de los alumnos (unidocente). Se dispone de una sola aula.\n• El establecimiento cuenta con los servicios básicos de agua, desagüe y electricidad.\n• No tiene acceso a Internet.\n• Se clasifican los residuos sólidos, pero estos no son recolectados frecuentemente por la municipalidad.\n• La infraestructura consta de material noble en las paredes, calamina en los techos y mayólica en los pisos.\n• Se cuenta con el ambiente para la cocina y el comedor, pero hace falta la implementación del mismo.\n• No se cuenta con una biblioteca, por lo que se improvisa con un pequeño estante.\n• Los juegos recreativos de la institución se encuentran en condiciones precarias, puesto que se hallan oxidados.\n• Se halla una pequeña losa deportiva de cemento para que los alumnos puedan desarrollar actividad física.' }
      ];
      datosPrueba.ie40270Tabla = [
        { categoria: 'Tipo de I.E.', descripcion: 'Pública de gestión directa, mixta' },
        { categoria: 'Nombre del(la) director(a)', descripcion: 'Nieves Bernaola Torres' },
        { categoria: 'Características y observaciones', descripcion: '• Se tiene en funcionamiento dos aulas, cada una es dirigida por una docente. Una de ellas es, a la vez, directora de la institución educativa.\n• La infraestructura de las aulas consta principalmente de material noble en las paredes, calamina en los techos y mayólica en los pisos.\n• La institución cuenta con los servicios básicos de agua, desagüe y electricidad.\n• No tiene acceso a Internet.\n• Se cuenta con una cocina y un comedor, en un solo ambiente compartido.\n• No tiene biblioteca propia, por lo que se ha improvisado con estantes.\n• No se cuenta con una sala de computación, aunque si se posee tabletas electrónicas.\n• Los juegos recreativos de la institución se encuentran en condiciones precarias, puesto que se hallan oxidados.\n• Se halla una losa deportiva de cemento para que los alumnos puedan desarrollar actividad física.' }
      ];
      datosPrueba.alumnosIEAyrocaTabla = [
        { nombre: 'IE Ayroca', nivel: 'Inicial – Jardín', totalH: 5, totalM: 4, tresH: 4, tresM: 2, cuatroH: 1, cuatroM: 1, cincoH: 0, cincoM: 1 }
      ];
      datosPrueba.alumnosIE40270Tabla = [
        { nombre: 'IE N°40270', nivel: 'Primaria', totalH: 6, totalM: 10, p1H: 0, p1M: 1, p2H: 2, p2M: 1, p3H: 0, p3M: 1, p4H: 0, p4M: 0, p5H: 2, p5M: 3, p6H: 2, p6M: 4 }
      ];
      datosPrueba.fotografiaIEAyrocaTitulo = 'Infraestructura de la IE Ayroca';
      datosPrueba.fotografiaIEAyrocaFuente = 'GEADES, 2024';
      datosPrueba.fotografiaIE40270Titulo = 'Infraestructura de la IE N°40270';
      datosPrueba.fotografiaIE40270Fuente = 'GEADES, 2024';
      datosPrueba.fotografiaRecreacion1Titulo = 'Parque recreacional público del anexo Ayroca';
      datosPrueba.fotografiaRecreacion1Fuente = 'GEADES, 2024';
      datosPrueba.fotografiaRecreacion2Titulo = 'Plaza de toros del anexo Ayroca';
      datosPrueba.fotografiaRecreacion2Fuente = 'GEADES, 2024';
      datosPrueba.fotografiaRecreacion3Titulo = 'Plaza central del anexo Ayroca';
      datosPrueba.fotografiaRecreacion3Fuente = 'GEADES, 2024';
      datosPrueba.fotografiaDeporte1Titulo = 'Losa deportiva del anexo Ayroca';
      datosPrueba.fotografiaDeporte1Fuente = 'GEADES, 2024';
      datosPrueba.fotografiaDeporte2Titulo = 'Estadio del anexo Ayroca';
      datosPrueba.fotografiaDeporte2Fuente = 'GEADES, 2024';
    } else if (this.seccionId === '3.1.4.A.1.9') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.natalidadMortalidadTabla = [
        { anio: '2023', natalidad: 1, mortalidad: 1 },
        { anio: '2024 (hasta 13/11)', natalidad: 3, mortalidad: 0 }
      ];
      datosPrueba.morbilidadTabla = [
        { grupo: 'Enfermedades infecciosas intestinales', rango0_11: 55, rango12_17: 6, rango18_29: 9, rango30_59: 59, rango60: 49, casos: 178 },
        { grupo: 'Obesidad y otros de hiperalimentación', rango0_11: 16, rango12_17: 10, rango18_29: 21, rango30_59: 103, rango60: 41, casos: 191 },
        { grupo: 'Infecciones agudas de las vías respiratorias superiores', rango0_11: 348, rango12_17: 93, rango18_29: 111, rango30_59: 327, rango60: 133, casos: 1012 },
        { grupo: 'Enfermedades de la cavidad bucal, de las glándulas salivales y de los maxilares', rango0_11: 6, rango12_17: 5, rango18_29: 11, rango30_59: 33, rango60: 8, casos: 63 },
        { grupo: 'Enfermedades del esófago, del estómago y del duodeno', rango0_11: 1, rango12_17: 9, rango18_29: 18, rango30_59: 58, rango60: 67, casos: 153 },
        { grupo: 'Artropatías', rango0_11: 1, rango12_17: 1, rango18_29: 4, rango30_59: 22, rango60: 77, casos: 105 },
        { grupo: 'Dorsopatías', rango0_11: 0, rango12_17: 3, rango18_29: 7, rango30_59: 60, rango60: 70, casos: 140 },
        { grupo: 'Otras enfermedades del sistema urinario', rango0_11: 6, rango12_17: 2, rango18_29: 8, rango30_59: 44, rango60: 28, casos: 88 },
        { grupo: 'Síntomas y signos que involucran el sistema digestivo y el abdomen', rango0_11: 29, rango12_17: 10, rango18_29: 18, rango30_59: 60, rango60: 44, casos: 161 },
        { grupo: 'Síntomas y signos generales', rango0_11: 32, rango12_17: 4, rango18_29: 7, rango30_59: 16, rango60: 21, casos: 80 }
      ];
      datosPrueba.porcentajeSIS = '84,44';
      datosPrueba.porcentajeESSALUD = '3,56';
      datosPrueba.porcentajeSinSeguro = '12,00';
      datosPrueba.afiliacionSaludTabla = [
        { categoria: 'Seguro Integral de Salud (SIS)', casos: 190, porcentaje: '84,44%' },
        { categoria: 'ESSALUD', casos: 8, porcentaje: '3,56%' },
        { categoria: 'Ningún seguro', casos: 27, porcentaje: '12,00%' },
        { categoria: 'Total referencial', casos: 225, porcentaje: '100,00%' }
      ];
    } else if (this.seccionId === '3.1.4.A.1.10') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.nivelEducativoTabla = [
        { categoria: 'Sin nivel o Inicial', casos: 10, porcentaje: '6,02%' },
        { categoria: 'Primaria', casos: 75, porcentaje: '45,18%' },
        { categoria: 'Secundaria', casos: 64, porcentaje: '38,55%' },
        { categoria: 'Superior no Universitaria', casos: 7, porcentaje: '4,22%' },
        { categoria: 'Superior Universitaria', casos: 10, porcentaje: '6,02%' },
        { categoria: 'Total', casos: 166, porcentaje: '100,00%' }
      ];
      datosPrueba.tasaAnalfabetismoTabla = [
        { indicador: 'Sabe leer y escribir', casos: 151, porcentaje: '90,96%' },
        { indicador: 'No sabe leer ni escribir', casos: 15, porcentaje: '9,04%' },
        { indicador: 'Total', casos: 166, porcentaje: '100,00%' }
      ];
    } else if (this.seccionId === '3.1.4.A.1.11') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.lenguasMaternasTabla = [
        { categoria: 'Castellano', casos: 179, porcentaje: '82,49%' },
        { categoria: 'Quechua', casos: 37, porcentaje: '17,05%' },
        { categoria: 'No sabe / No responde', casos: 1, porcentaje: '0,46%' },
        { categoria: 'Total', casos: 217, porcentaje: '100,00%' }
      ];
      datosPrueba.religionesTabla = [
        { categoria: 'Católica', casos: 0, porcentaje: '0%' },
        { categoria: 'Evangélica', casos: 0, porcentaje: '0%' },
        { categoria: 'Otra', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '100,00%' }
      ];
      datosPrueba.fotografiaIglesiaTitulo = 'Iglesia Matriz del anexo Ayroca';
      datosPrueba.fotografiaIglesiaFuente = 'GEADES, 2024';
    } else if (this.seccionId === '3.1.4.A.1.12') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.ojosAgua1 = 'Quinsa Rumi';
      datosPrueba.ojosAgua2 = 'Pallalli';
      datosPrueba.rioAgricola = 'Yuracyacu';
      datosPrueba.quebradaAgricola = 'Pucaccocha';
      datosPrueba.fotografiaReservorioTitulo = 'Reservorio del anexo Ayroca';
      datosPrueba.fotografiaReservorioFuente = 'GEADES, 2024';
      datosPrueba.fotografiaUsoSuelosTitulo = 'Uso de los suelos en el anexo Ayroca';
      datosPrueba.fotografiaUsoSuelosFuente = 'GEADES, 2024';
    } else if (this.seccionId === '3.1.4.A.1.13') {
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.indiceDesarrolloHumanoTabla = [
        {
          poblacion: 762,
          rankIdh1: 1686,
          idh: '0,3870',
          rankEsperanza: 934,
          esperanzaVida: '83,27',
          rankEducacion1: 29,
          educacion: '55,35',
          rankEducacion2: 1010,
          anosEducacion: '6,18',
          rankAnios: 972,
          ingreso: '391,1',
          rankIngreso: 1191,
          rankIngresoFinal: 1191
        }
      ];
    } else if (this.seccionId === '3.1.4.A.1.14') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.nbiCCAyrocaTabla = [
        { categoria: 'Población en Viviendas con características físicas inadecuadas', casos: 5, porcentaje: '2,53 %' },
        { categoria: 'Población en Viviendas con hacinamiento', casos: 50, porcentaje: '25,25 %' },
        { categoria: 'Población en Viviendas sin servicios higiénicos', casos: 37, porcentaje: '18,69 %' },
        { categoria: 'Población en Hogares con niños que no asisten a la escuela', casos: 0, porcentaje: '0,00 %' },
        { categoria: 'Total referencial', casos: 198, porcentaje: '' }
      ];
      datosPrueba.nbiDistritoCahuachoTabla = [
        { categoria: 'Viviendas con características físicas inadecuadas', casos: 6, porcentaje: '2,79 %' },
        { categoria: 'Viviendas con hacinamiento', casos: 15, porcentaje: '6,98 %' },
        { categoria: 'Viviendas sin servicios higiénicos', casos: 34, porcentaje: '15,81 %' },
        { categoria: 'Hogares con niños que no asisten a la escuela', casos: 0, porcentaje: '0,00 %' },
        { categoria: 'Hogares con alta dependencia económica', casos: 5, porcentaje: '2,33 %' },
        { categoria: 'Total referencial', casos: 215, porcentaje: '' }
      ];
    } else if (this.seccionId === '3.1.4.A.1.15') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.comunerosCalificados = 65;
      datosPrueba.autoridades = [
        { organizacion: 'CC Ayroca (2024-2025)', cargo: 'Presidente', nombre: 'Miguel Ángel Sayaverde Rospigliosi' },
        { organizacion: 'CC Ayroca (2024-2025)', cargo: 'Vicepresidente', nombre: 'Julio Edilberto Ventura Quispe' },
        { organizacion: 'CC Ayroca (2024-2025)', cargo: 'Secretario', nombre: 'Emil Mundo Merino Bustamante' },
        { organizacion: 'CC Ayroca (2024-2025)', cargo: 'Tesorero', nombre: 'Zarita Juana Sayaverde Bustamante' },
        { organizacion: 'CC Ayroca (2024-2025)', cargo: 'Fiscal', nombre: 'Elena Bustamante Rubio' },
        { organizacion: 'CC Ayroca (2024-2025)', cargo: '1° Vocal', nombre: 'Agripina Albania Quispe Muñua' },
        { organizacion: 'CC Ayroca (2024-2025)', cargo: '2° Vocal', nombre: 'Jhon Omar Cataño Espinoza' },
        { organizacion: 'CC Ayroca (2024-2025)', cargo: '3° Vocal', nombre: 'Emerson Jossemar Bustamante Merino' },
        { organizacion: 'JASS Ayroca', cargo: 'Presidente', nombre: 'Emil Mundo Merino Bustamante' },
        { organizacion: 'Asociación de Vicuñas', cargo: 'Presidente', nombre: 'Emil Mundo Merino Bustamante' },
        { organizacion: 'Junta de Usuarios de Riego', cargo: 'Presidente', nombre: 'Roberto Merino Rivera' },
        { organizacion: 'Municipalidad Distrital de Cahuacho', cargo: 'Agente municipal', nombre: 'Adrián Cataño Ramos' },
        { organizacion: 'Subprefectura Distrital de Cahuacho', cargo: 'Teniente gobernador', nombre: 'Kelvin Quispe Merino' }
      ];
    } else if (this.seccionId === '3.1.4.A.1.16') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.sitioArqueologico = 'Incahuasi';
      datosPrueba.festividades = [
        { festividad: 'Carnavales', fecha: 'Febrero' },
        { festividad: 'Virgen de Chapi', fecha: '01/05' },
        { festividad: 'Fiesta de las Cruces', fecha: '03/05 – 05/05' },
        { festividad: 'San Vicente Ferrer', fecha: '21/06 - 23/06' },
        { festividad: 'Aniversario de la CC Ayroca', fecha: '24/06' }
      ];
    } else if (this.seccionId === '3.1.4.B' || this.seccionId === '3.1.4.B.1') {
      datosPrueba.centroPobladoAISI = 'Cahuacho';
      datosPrueba.provinciaSeleccionada = 'Caravelí';
      datosPrueba.departamentoSeleccionado = 'Arequipa';
      datosPrueba.leyCreacionDistrito = '8004';
      datosPrueba.fechaCreacionDistrito = '22 de febrero de 1935';
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.distritoAnterior = 'Caravelí';
      datosPrueba.origenPobladores1 = 'Caravelí';
      datosPrueba.origenPobladores2 = 'Parinacochas';
      datosPrueba.departamentoOrigen = 'Ayacucho';
      datosPrueba.anexosEjemplo = 'Ayroca o Sóndor';
      datosPrueba.ubicacionCpTabla = [
        {
          localidad: 'Cahuacho',
          coordenadas: '18 L, E: 663 078 m, N: 8 285 498 m',
          altitud: '3 423 msnm',
          distrito: 'Cahuacho',
          provincia: 'Caravelí',
          departamento: 'Arequipa'
        }
      ];
      datosPrueba.fotografiaCahuachoTitulo = 'Vista panorámica del CP Cahuacho';
      datosPrueba.fotografiaCahuachoFuente = 'GEADES, 2024';
    } else if (this.seccionId === '3.1.4.B.1.1') {
      datosPrueba.centroPobladoAISI = 'Cahuacho';
      datosPrueba.poblacionSexoAISI = [
        { sexo: 'Hombre', casos: 78, porcentaje: '48,75 %' },
        { sexo: 'Mujer', casos: 82, porcentaje: '51,25 %' },
        { sexo: 'Total', casos: 160, porcentaje: '100,00 %' }
      ];
      datosPrueba.poblacionEtarioAISI = [
        { categoria: '0 a 14 años', casos: 41, porcentaje: '25,63 %' },
        { categoria: '15 a 29 años', casos: 25, porcentaje: '15,63 %' },
        { categoria: '30 a 44 años', casos: 31, porcentaje: '19,38 %' },
        { categoria: '45 a 64 años', casos: 38, porcentaje: '23,75 %' },
        { categoria: '65 años a más', casos: 25, porcentaje: '15,63 %' },
        { categoria: 'Total', casos: 160, porcentaje: '100,00 %' }
      ];
    } else if (this.seccionId === '3.1.4.B.1.2') {
      datosPrueba.centroPobladoAISI = 'Cahuacho';
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.poblacionDistritalAISI = 610;
      datosPrueba.petDistritalAISI = 461;
      datosPrueba.ingresoPerCapitaAISI = '391,06';
      datosPrueba.rankingIngresoAISI = 1191;
      datosPrueba.petGruposEdadAISI = [
        { categoria: '14 a 29 años', casos: 28, porcentaje: '22,95 %' },
        { categoria: '30 a 44 años', casos: 31, porcentaje: '25,41 %' },
        { categoria: '45 a 64 años', casos: 38, porcentaje: '31,15 %' },
        { categoria: '65 años a más', casos: 25, porcentaje: '20,49 %' },
        { categoria: 'Total', casos: 122, porcentaje: '100,00 %' }
      ];
      datosPrueba.peaDistritoSexoTabla = [
        { categoria: 'PEA', hombres: 184, porcentajeHombres: '77,31 %', mujeres: 92, porcentajeMujeres: '41,26 %', casos: 276, porcentaje: '59,87 %' },
        { categoria: 'No PEA', hombres: 54, porcentajeHombres: '22,69 %', mujeres: 131, porcentajeMujeres: '58,74 %', casos: 185, porcentaje: '40,13 %' },
        { categoria: 'Total', hombres: 238, porcentajeHombres: '100,00 %', mujeres: 223, porcentajeMujeres: '100,00 %', casos: 461, porcentaje: '100,00 %' }
      ];
      datosPrueba.peaOcupadaDesocupadaTabla = [
        { categoria: 'PEA Ocupada', hombres: 180, porcentajeHombres: '97,83 %', mujeres: 87, porcentajeMujeres: '94,57 %', casos: 267, porcentaje: '96,74 %' },
        { categoria: 'PEA Desocupada', hombres: 4, porcentajeHombres: '2,17 %', mujeres: 5, porcentajeMujeres: '5,43 %', casos: 9, porcentaje: '3,26 %' },
        { categoria: 'Total', hombres: 184, porcentajeHombres: '100,00 %', mujeres: 92, porcentajeMujeres: '100,00 %', casos: 276, porcentaje: '100,00 %' }
      ];
    } else if (this.seccionId === '3.1.4.B.1.3') {
      datosPrueba.centroPobladoAISI = 'Cahuacho';
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.ciudadOrigenComercio = 'Caravelí';
      datosPrueba.actividadesEconomicasAISI = [
        { actividad: 'A. Agricultura, ganadería, silvicultura y pesca', casos: 50, porcentaje: '64,10 %' },
        { actividad: 'B. Explotación de minas y canteras', casos: 1, porcentaje: '1,28 %' },
        { actividad: 'D. Suministro de electricidad, gas, vapor y aire acondicionado', casos: 1, porcentaje: '1,28 %' },
        { actividad: 'F. Construcción', casos: 1, porcentaje: '1,28 %' },
        { actividad: 'G. Comercio al por mayor y al por menor; reparación de vehículos automotores y motocicletas', casos: 3, porcentaje: '3,85 %' },
        { actividad: 'H. Transporte y almacenamiento', casos: 1, porcentaje: '1,28 %' },
        { actividad: 'I. Actividades de alojamiento y de servicio de comidas', casos: 1, porcentaje: '1,28 %' },
        { actividad: 'J. Información y comunicaciones', casos: 1, porcentaje: '1,28 %' },
        { actividad: 'O. Administración pública y defensa; planes de seguridad social de afiliación obligatoria', casos: 11, porcentaje: '14,10 %' },
        { actividad: 'P. Enseñanza', casos: 3, porcentaje: '3,85 %' },
        { actividad: 'Q. Actividades de atención de la salud humana y de asistencia social', casos: 5, porcentaje: '6,41 %' },
        { actividad: 'Total', casos: 78, porcentaje: '100,00 %' }
      ];
      datosPrueba.fotografiaActividadesEconomicasTitulo = 'Parcelas agrícolas en el CP Cahuacho';
      datosPrueba.fotografiaActividadesEconomicasFuente = 'GEADES, 2024';
      datosPrueba.fotografiaMercadoTitulo = 'Bodega en el CP Cahuacho';
      datosPrueba.fotografiaMercadoFuente = 'GEADES, 2024';
    } else if (this.seccionId === '3.1.4.B.1.4') {
      datosPrueba.centroPobladoAISI = 'Cahuacho';
      datosPrueba.tiposViviendaAISI = [
        { categoria: 'Casa independiente', casos: 164, porcentaje: '100,00 %' },
        { categoria: 'Total', casos: 164, porcentaje: '100,00 %' }
      ];
      datosPrueba.condicionOcupacionAISI = [
        { categoria: 'Ocupada, con personas presentes', casos: 49, porcentaje: '29,88 %' },
        { categoria: 'Ocupada, con personas ausentes', casos: 19, porcentaje: '11,59 %' },
        { categoria: 'Ocupada, de uso ocasional', casos: 73, porcentaje: '44,51 %' },
        { categoria: 'Desocupada, abandonada o cerrada', casos: 23, porcentaje: '14,02 %' },
        { categoria: 'Total', casos: 164, porcentaje: '100,00 %' }
      ];
      datosPrueba.materialesViviendaAISI = [
        { categoria: 'Materiales de las paredes de las viviendas', tipoMaterial: 'Adobe', casos: 49, porcentaje: '100,00 %' },
        { categoria: 'Materiales de las paredes de las viviendas', tipoMaterial: 'Total', casos: 49, porcentaje: '100,00 %' },
        { categoria: 'Materiales de los techos de las viviendas', tipoMaterial: 'Planchas de calamina, fibra de cemento o similares', casos: 49, porcentaje: '100,00 %' },
        { categoria: 'Materiales de los techos de las viviendas', tipoMaterial: 'Total', casos: 49, porcentaje: '100,00 %' },
        { categoria: 'Materiales de los pisos de las viviendas', tipoMaterial: 'Tierra', casos: 39, porcentaje: '79,59 %' },
        { categoria: 'Materiales de los pisos de las viviendas', tipoMaterial: 'Cemento', casos: 10, porcentaje: '20,41 %' },
        { categoria: 'Materiales de los pisos de las viviendas', tipoMaterial: 'Total', casos: 49, porcentaje: '100,00 %' }
      ];
      datosPrueba.fotografiaEstructuraAISITitulo = 'Estructura de viviendas en el CP Cahuacho';
      datosPrueba.fotografiaEstructuraAISIFuente = 'GEADES, 2024';
    } else if (this.seccionId === '3.1.4.B.1.5') {
      datosPrueba.centroPobladoAISI = 'Cahuacho';
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.abastecimientoAguaCpTabla = [
        { categoria: 'Red pública dentro de la vivienda', casos: 48, porcentaje: '97,96 %' },
        { categoria: 'Red pública fuera de la vivienda, pero dentro de la edificación', casos: 1, porcentaje: '2,04 %' },
        { categoria: 'Total', casos: 49, porcentaje: '100,00 %' }
      ];
      datosPrueba.saneamientoCpTabla = [
        { categoria: 'Red pública de desagüe dentro de la vivienda', casos: 40, porcentaje: '81,63 %' },
        { categoria: 'Pozo séptico, tanque séptico o biodigestor', casos: 5, porcentaje: '10,20 %' },
        { categoria: 'Red pública de desagüe fuera de la vivienda, pero dentro de la edificación', casos: 1, porcentaje: '2,04 %' },
        { categoria: 'Letrina (con tratamiento)', casos: 1, porcentaje: '2,04 %' },
        { categoria: 'Pozo ciego o negro', casos: 1, porcentaje: '2,04 %' },
        { categoria: 'Campo abierto o al aire libre', casos: 1, porcentaje: '2,04 %' },
        { categoria: 'Total', casos: 49, porcentaje: '100,00 %' }
      ];
      datosPrueba.coberturaElectricaCpTabla = [
        { categoria: 'Si tiene alumbrado eléctrico', casos: 48, porcentaje: '97,96 %' },
        { categoria: 'No tiene alumbrado eléctrico', casos: 1, porcentaje: '2,04 %' },
        { categoria: 'Total', casos: 49, porcentaje: '100,00 %' }
      ];
      datosPrueba.combustiblesCocinarCpTabla = [
        { categoria: 'Leña', casos: 45, porcentaje: '84,91 %' },
        { categoria: 'Gas (balón GLP)', casos: 29, porcentaje: '54,72 %' },
        { categoria: 'Bosta, estiércol', casos: 9, porcentaje: '16,98 %' },
        { categoria: 'Electricidad', casos: 3, porcentaje: '5,66 %' },
        { categoria: 'Total referencial', casos: 53, porcentaje: '' }
      ];
      datosPrueba.fotografiaDesechosSolidosAISITitulo = 'Contenedores de residuos sólidos en el CP Cahuacho';
      datosPrueba.fotografiaDesechosSolidosAISIFuente = 'GEADES, 2024';
      datosPrueba.fotografiaElectricidadAISITitulo = 'Infraestructura eléctrica en el CP Cahuacho';
      datosPrueba.fotografiaElectricidadAISIFuente = 'GEADES, 2024';
    } else if (this.seccionId === '3.1.4.B.1.6') {
      datosPrueba.centroPobladoAISI = 'Cahuacho';
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.ciudadOrigenComercio = 'Caravelí';
      datosPrueba.costoTransporteMinimo = 25;
      datosPrueba.costoTransporteMaximo = 30;
      datosPrueba.telecomunicacionesCpTabla = [
        { medio: 'Emisoras de radio', descripcion: 'RPP, Nacional, Unión' },
        { medio: 'Señales de televisión', descripcion: 'América TV, DIRECTV' },
        { medio: 'Señales de telefonía móvil', descripcion: 'Movistar, Claro, Entel' },
        { medio: 'Señal de Internet', descripcion: 'Movistar, Entel' }
      ];
      datosPrueba.fotografiaTransporteAISITitulo = 'Infraestructura de transporte en el CP Cahuacho';
      datosPrueba.fotografiaTransporteAISIFuente = 'GEADES, 2024';
      datosPrueba.fotografiaTelecomunicacionesAISITitulo = 'Infraestructura de telecomunicaciones en el CP Cahuacho';
      datosPrueba.fotografiaTelecomunicacionesAISIFuente = 'GEADES, 2024';
    } else if (this.seccionId === '3.1.4.B.1.7') {
      datosPrueba.centroPobladoAISI = 'Cahuacho';
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.nombreIEMayorEstudiantes = 'IE Virgen de Copacabana';
      datosPrueba.cantidadEstudiantesIEMayor = 28;
      datosPrueba.puestoSaludCpTabla = [
        { categoria: 'Nombre', descripcion: 'Puesto de Salud Cahuacho' },
        { categoria: 'Ubicación', descripcion: 'Cahuacho - Caravelí - Arequipa' },
        { categoria: 'Director Médico y/o Responsable de la Atención de Salud', descripcion: 'Lady Flores Cauti' },
        { categoria: 'Código Único de IPRESS', descripcion: '00001377' },
        { categoria: 'Categoría del EESS', descripcion: '1-2' },
        { categoria: 'Tipo de Establecimiento de Salud', descripcion: 'Establecimiento de salud sin internamiento' },
        { categoria: 'Nombre de la subcategoría (Clasificación)', descripcion: 'Puestos de salud o postas de salud' },
        { categoria: 'Estado del EESS', descripcion: 'Activo' },
        { categoria: 'Condición del EESS', descripcion: 'Activo' },
        { categoria: 'Nombre de DISA/DIRESA', descripcion: 'DIRESA Arequipa' },
        { categoria: 'Nombre de RED', descripcion: 'Camaná - Caravelí' },
        { categoria: 'Nombre de MICRORED', descripcion: 'Caravelí' },
        { categoria: 'Institución a la que pertenece el establecimiento', descripcion: 'MINSA' },
        { categoria: 'Teléfono del establecimiento', descripcion: '967703571 (Jefa de RRHH)' },
        { categoria: 'Número de ambientes con que cuenta el establecimiento', descripcion: '7' },
        { categoria: 'Horario de atención', descripcion: '08:00 - 20:00' }
      ];
      datosPrueba.educacionCpTabla = [
        { nombreIE: 'IE Cahuacho', nivel: 'Inicial - Jardín', tipoGestion: 'Pública de gestión directa', cantidadEstudiantes: 6, porcentaje: '11,11 %' },
        { nombreIE: 'IE N°40271', nivel: 'Primaria', tipoGestion: 'Pública de gestión directa', cantidadEstudiantes: 20, porcentaje: '37,04 %' },
        { nombreIE: 'IE Virgen de Copacabana', nivel: 'Secundaria', tipoGestion: 'Pública de gestión directa', cantidadEstudiantes: 28, porcentaje: '51,85 %' },
        { nombreIE: 'Total', nivel: '', tipoGestion: '', cantidadEstudiantes: 54, porcentaje: '100,00 %' }
      ];
      datosPrueba.fotografiaSaludAISITitulo = 'Infraestructura del Puesto de Salud Cahuacho';
      datosPrueba.fotografiaSaludAISIFuente = 'GEADES, 2024';
      datosPrueba.fotografiaEducacion1AISITitulo = 'Infraestructura de la IE Cahuacho';
      datosPrueba.fotografiaEducacion1AISIFuente = 'GEADES, 2024';
      datosPrueba.fotografiaEducacion2AISITitulo = 'Infraestructura de la IE N°40271';
      datosPrueba.fotografiaEducacion2AISIFuente = 'GEADES, 2024';
      datosPrueba.fotografiaEducacion3AISITitulo = 'Infraestructura de la IE Virgen de Copacabana';
      datosPrueba.fotografiaEducacion3AISIFuente = 'GEADES, 2024';
      datosPrueba.fotografiaRecreacionAISITitulo = 'Plaza de toros del CP Cahuacho';
      datosPrueba.fotografiaRecreacionAISIFuente = 'GEADES, 2024';
      datosPrueba.fotografiaDeporteAISITitulo = 'Losa deportiva en el CP Cahuacho';
      datosPrueba.fotografiaDeporteAISIFuente = 'GEADES, 2024';
    } else if (this.seccionId === '3.1.4.B.1.8') {
      datosPrueba.centroPobladoAISI = 'Cahuacho';
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.natalidadMortalidadCpTabla = [
        { anio: '2023', natalidad: 4, mortalidad: 0 },
        { anio: '2024 (hasta 14/11)', natalidad: 1, mortalidad: 1 }
      ];
      datosPrueba.morbilidadCpTabla = [
        { grupo: 'Enfermedades infecciosas intestinales', edad0_11: 55, edad12_17: 6, edad18_29: 9, edad30_59: 59, edad60_mas: 49, casos: 178 },
        { grupo: 'Obesidad y otros de hiperalimentación', edad0_11: 16, edad12_17: 10, edad18_29: 21, edad30_59: 103, edad60_mas: 41, casos: 191 },
        { grupo: 'Infecciones agudas de las vías respiratorias superiores', edad0_11: 348, edad12_17: 93, edad18_29: 111, edad30_59: 327, edad60_mas: 133, casos: 1012 },
        { grupo: 'Enfermedades de la cavidad bucal, de las glándulas salivales y de los maxilares', edad0_11: 6, edad12_17: 5, edad18_29: 11, edad30_59: 33, edad60_mas: 8, casos: 63 },
        { grupo: 'Enfermedades del esófago, del estómago y del duodeno', edad0_11: 1, edad12_17: 9, edad18_29: 18, edad30_59: 58, edad60_mas: 67, casos: 153 },
        { grupo: 'Artropatías', edad0_11: 1, edad12_17: 1, edad18_29: 4, edad30_59: 22, edad60_mas: 77, casos: 105 },
        { grupo: 'Dorsopatías', edad0_11: 0, edad12_17: 3, edad18_29: 7, edad30_59: 60, edad60_mas: 70, casos: 140 },
        { grupo: 'Otras enfermedades del sistema urinario', edad0_11: 6, edad12_17: 2, edad18_29: 8, edad30_59: 44, edad60_mas: 28, casos: 88 },
        { grupo: 'Síntomas y signos que involucran el sistema digestivo y el abdomen', edad0_11: 29, edad12_17: 10, edad18_29: 18, edad30_59: 60, edad60_mas: 44, casos: 161 },
        { grupo: 'Síntomas y signos generales', edad0_11: 32, edad12_17: 4, edad18_29: 7, edad30_59: 16, edad60_mas: 21, casos: 80 }
      ];
      datosPrueba.afiliacionSaludTabla = [
        { categoria: 'Seguro Integral de Salud (SIS)', casos: 129, porcentaje: '80,63 %' },
        { categoria: 'ESSALUD', casos: 14, porcentaje: '8,75 %' },
        { categoria: 'Seguro de fuerzas armadas o policiales', casos: 4, porcentaje: '2,50 %' },
        { categoria: 'Seguro privado de salud', casos: 2, porcentaje: '1,25 %' },
        { categoria: 'Ningún seguro', casos: 12, porcentaje: '7,50 %' },
        { categoria: 'Total referencial', casos: 160, porcentaje: '' }
      ];
    } else if (this.seccionId === '3.1.4.B.1.9') {
      datosPrueba.centroPobladoAISI = 'Cahuacho';
      datosPrueba.nivelEducativoTabla = [
        { categoria: 'Sin nivel o Inicial', casos: 6, porcentaje: '5,04 %' },
        { categoria: 'Primaria', casos: 35, porcentaje: '29,41 %' },
        { categoria: 'Secundaria', casos: 51, porcentaje: '42,86 %' },
        { categoria: 'Superior no Universitaria', casos: 14, porcentaje: '11,76 %' },
        { categoria: 'Superior Universitaria', casos: 13, porcentaje: '10,92 %' },
        { categoria: 'Total', casos: 119, porcentaje: '100,00 %' }
      ];
      datosPrueba.tasaAnalfabetismoTabla = [
        { indicador: 'Sabe leer y escribir', casos: 114, porcentaje: '95,80 %' },
        { indicador: 'No sabe leer ni escribir', casos: 5, porcentaje: '4,20 %' },
        { indicador: 'Total', casos: 119, porcentaje: '100,00 %' }
      ];
    } else if (this.seccionId === '3.1.2' || this.seccionId === '3.1.2.A' || this.seccionId === '3.1.2.B') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.provinciaSeleccionada = 'Caravelí';
      datosPrueba.departamentoSeleccionado = 'Arequipa';
      datosPrueba.aisdComponente1 = 'Puyusca';
      datosPrueba.aisdComponente2 = 'Pausa';
      datosPrueba.grupoAISI = 'Cahuacho';
    } else if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId === '3.1.4.A.1') {
      datosPrueba.grupoAISD = 'Ayroca';
      datosPrueba.distritoSeleccionado = 'Cahuacho';
      datosPrueba.provinciaSeleccionada = 'Caravelí';
      datosPrueba.departamentoSeleccionado = 'Arequipa';
      datosPrueba.aisdComponente1 = 'Puyusca';
      datosPrueba.aisdComponente2 = 'Pausa';
      datosPrueba.grupoAISI = 'Cahuacho';
      datosPrueba.coordenadasAISD = '18L E: 660 619 m N: 8 291 173 m';
      datosPrueba.altitudAISD = '3599 msnm';
      datosPrueba.tablaAISD1Localidad = 'Ayroca';
      datosPrueba.tablaAISD1Coordenadas = '18L E: 660 619 m N: 8 291 173 m';
      datosPrueba.tablaAISD1Altitud = '3599 msnm';
      datosPrueba.tablaAISD1Distrito = 'Cahuacho';
      datosPrueba.tablaAISD1Provincia = 'Caravelí';
      datosPrueba.tablaAISD1Departamento = 'Arequipa';
      datosPrueba.cuadroTituloAISD1 = 'Ubicación referencial';
      datosPrueba.cuadroFuenteAISD1 = 'GEADES (2024)';
      datosPrueba.cuadroTituloAISD2 = 'Cantidad total de población y viviendas';
      datosPrueba.cuadroFuenteAISD2 = 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)';
      
      datosPrueba.tablaAISD2Fila1Punto = 'Yuracranra';
      datosPrueba.tablaAISD2Fila1Codigo = '0403060004';
      datosPrueba.tablaAISD2Fila1Poblacion = '0';
      datosPrueba.tablaAISD2Fila1ViviendasEmpadronadas = '1';
      datosPrueba.tablaAISD2Fila1ViviendasOcupadas = '0';
      
      datosPrueba.tablaAISD2Fila2Punto = 'Ayroca';
      datosPrueba.tablaAISD2Fila2Codigo = '0403060005';
      datosPrueba.tablaAISD2Fila2Poblacion = '224';
      datosPrueba.tablaAISD2Fila2ViviendasEmpadronadas = '84';
      datosPrueba.tablaAISD2Fila2ViviendasOcupadas = '60';
      
      datosPrueba.tablaAISD2Fila3Punto = 'Tastanic';
      datosPrueba.tablaAISD2Fila3Codigo = '0403060008';
      datosPrueba.tablaAISD2Fila3Poblacion = '0';
      datosPrueba.tablaAISD2Fila3ViviendasEmpadronadas = '1';
      datosPrueba.tablaAISD2Fila3ViviendasOcupadas = '0';
      
      datosPrueba.tablaAISD2Fila4Punto = 'Faldahuasi';
      datosPrueba.tablaAISD2Fila4Codigo = '0403060014';
      datosPrueba.tablaAISD2Fila4Poblacion = '1';
      datosPrueba.tablaAISD2Fila4ViviendasEmpadronadas = '4';
      datosPrueba.tablaAISD2Fila4ViviendasOcupadas = '1';
      
      datosPrueba.fotografiaAISD1Titulo = 'Vista panorámica del Anexo Ayroca';
      datosPrueba.fotografiaAISD1Fuente = 'GEADES, 2024';
      
      this.filasTablaAISD2 = 4;
      this.fotografias = [{ numero: 1, titulo: datosPrueba.fotografiaAISD1Titulo, fuente: datosPrueba.fotografiaAISD1Fuente, imagen: null, preview: null, dragOver: false }];
    }

    const camposTabla = ['poblacionSexoAISD', 'poblacionEtarioAISD', 'tablepagina6', 'petTabla', 'peaTabla', 'peaOcupadaTabla', 'peaOcupacionesTabla', 'poblacionPecuariaTabla', 'caracteristicasAgriculturaTabla', 'condicionOcupacionTabla', 'tiposMaterialesTabla', 'abastecimientoAguaTabla', 'tiposSaneamientoTabla', 'saneamientoTabla', 'coberturaElectricaTabla', 'telecomunicacionesTabla', 'caracteristicasSaludTabla', 'cantidadEstudiantesEducacionTabla', 'ieAyrocaTabla', 'ie40270Tabla', 'alumnosIEAyrocaTabla', 'alumnosIE40270Tabla', 'natalidadMortalidadTabla', 'morbilidadTabla', 'morbiliadTabla', 'afiliacionSaludTabla', 'seguroSaludTabla', 'nivelEducativoTabla', 'tasaAnalfabetismoTabla', 'lenguasMaternasTabla', 'religionesTabla', 'indiceDesarrolloHumanoTabla', 'nbiCCAyrocaTabla', 'nbiDistritoCahuachoTabla', 'autoridades', 'festividades', 'ubicacionCpTabla', 'poblacionSexoAISI', 'poblacionEtarioAISI', 'petGruposEdadAISI', 'peaDistritoSexoTabla', 'peaOcupadaDesocupadaTabla', 'actividadesEconomicasAISI', 'tiposViviendaAISI', 'condicionOcupacionAISI', 'materialesViviendaAISI', 'abastecimientoAguaCpTabla', 'saneamientoCpTabla', 'coberturaElectricaCpTabla', 'combustiblesCocinarCpTabla', 'telecomunicacionesCpTabla', 'puestoSaludCpTabla', 'educacionCpTabla', 'natalidadMortalidadCpTabla', 'morbilidadCpTabla'];

    const necesitaLlenar = (valorActual: any, valorNuevo: any): boolean => {
      if (valorActual === null || valorActual === undefined) {
        return true;
      }
      if (typeof valorActual === 'string') {
        const valorTrim = valorActual.trim();
        return valorTrim === '' || valorTrim === '____' || valorTrim === '0' || valorTrim === '0%';
      }
      if (typeof valorActual === 'number') {
        return valorActual === 0;
      }
      if (Array.isArray(valorActual)) {
        return valorActual.length === 0;
      }
      if (typeof valorActual === 'object') {
        return Object.keys(valorActual).length === 0;
      }
      return false;
    };

    const camposLlenados: string[] = [];
    const camposNoLlenados: string[] = [];
    const camposEsperados = this.fieldMapping.getFieldsForSection(this.seccionId);
    
    const camposConValorPorDefecto = this.getCamposConValorPorDefecto(this.seccionId);
    const valoresUnicosEsperados = camposEsperados.filter(campo => !camposConValorPorDefecto.includes(campo));
    
    Object.keys(datosPrueba).forEach(key => {
      const valorActual = this.datos[key] || this.formData[key];
      const valorNuevo = datosPrueba[key];

      if (key === 'coordenadasAISD' || key === 'altitudAISD') {
        console.log(`[LlenarPrueba] ${key}:`, { valorActual, valorNuevo });
      }

      const camposTablaAISD1 = ['tablaAISD1Localidad', 'tablaAISD1Coordenadas', 'tablaAISD1Altitud', 'tablaAISD1Distrito', 'tablaAISD1Provincia', 'tablaAISD1Departamento'];
      const debeLlenar = camposTablaAISD1.includes(key) || necesitaLlenar(valorActual, valorNuevo);

      if (!debeLlenar) {
        camposNoLlenados.push(key);
        if (key === 'coordenadasAISD' || key === 'altitudAISD') {
          console.log(`[LlenarPrueba] ${key} NO se llenó (ya tenía valor)`);
        }
        return;
      }

      this.fieldMapping.markFieldAsTestData(key);
      camposLlenados.push(key);

      if (camposTabla.includes(key)) {
        this.datos[key] = valorNuevo;
        this.formularioService.actualizarDato(key, valorNuevo);
        if (key === 'morbilidadTabla') {
          if (this.datos['morbiliadTabla']) {
            this.datos['morbiliadTabla'] = null as any;
            this.formularioService.actualizarDato('morbiliadTabla', null);
          }
        }
      } else {
        if (key === 'coordenadasAISD' || key === 'altitudAISD') {
          console.log(`[LlenarPrueba] Llenando ${key} vía onFieldChange con:`, valorNuevo);
        }
        this.onFieldChange(key, valorNuevo);
      }
    });

    const valoresUnicosLlenados = valoresUnicosEsperados.filter(campo => camposLlenados.includes(campo));
    const valoresUnicosQueYaTenían = valoresUnicosEsperados.filter(campo => camposNoLlenados.includes(campo));
    const valoresUnicosFaltantes = valoresUnicosEsperados.filter(campo => !camposLlenados.includes(campo) && !camposNoLlenados.includes(campo));
    
    const totalValoresEsperados = valoresUnicosEsperados.length;
    const totalValoresLlenados = valoresUnicosLlenados.length;
    const totalValoresQueYaTenían = valoresUnicosQueYaTenían.length;
    const totalValoresFaltantes = valoresUnicosFaltantes.length;
    const totalValoresCompletos = totalValoresLlenados + totalValoresQueYaTenían;
    
    console.group(`📊 Llenar Prueba - Sección ${this.seccionId}`);
    console.log(`📋 Total valores únicos esperados: ${totalValoresEsperados}`);
    console.log(`✅ Valores llenados ahora: ${totalValoresLlenados}`);
    console.log(`ℹ️  Valores que ya tenían valor: ${totalValoresQueYaTenían}`);
    console.log(`📊 Total valores completos: ${totalValoresCompletos} de ${totalValoresEsperados}`);
    console.log('[LlenarPrueba] Estado final de coordenadas y altitud:');
    console.log('  coordenadasAISD en this.datos:', this.datos['coordenadasAISD']);
    console.log('  altitudAISD en this.datos:', this.datos['altitudAISD']);
    if (totalValoresFaltantes > 0) {
      console.warn(`❌ Valores faltantes por llenar: ${totalValoresFaltantes}`);
      console.warn('Valores faltantes:', valoresUnicosFaltantes);
    }
    if (totalValoresCompletos === totalValoresEsperados) {
      console.log('%c✅ Todos los valores están completos (llenados ahora + ya tenían valor)', 'color: green; font-weight: bold');
    } else {
      console.warn(`%c⚠️  Faltan ${totalValoresFaltantes} valores por llenar`, 'color: orange; font-weight: bold');
    }
    console.groupEnd();
    
    if (this.seccionId === '3.1.4.A.1.1' || this.seccionId === '3.1.4.A.1.2' || this.seccionId === '3.1.4.A.1.3' || this.seccionId === '3.1.4.A.1.4' || this.seccionId === '3.1.4.A.1.5' || this.seccionId === '3.1.4.A.1.6' || this.seccionId === '3.1.4.A.1.7' || this.seccionId === '3.1.4.A.1.8' || this.seccionId === '3.1.4.A.1.9' || this.seccionId === '3.1.4.A.1.10' || this.seccionId === '3.1.4.A.1.11' || this.seccionId === '3.1.4.A.1.12' || this.seccionId === '3.1.4.A.1.13' || this.seccionId === '3.1.4.A.1.14' || this.seccionId === '3.1.4.A.1.15' || this.seccionId === '3.1.4.A.1.16' || this.seccionId === '3.1.4.B' || this.seccionId === '3.1.4.B.1' || this.seccionId === '3.1.4.B.1.1' || this.seccionId === '3.1.4.B.1.2' || this.seccionId === '3.1.4.B.1.3' || this.seccionId === '3.1.4.B.1.4' || this.seccionId === '3.1.4.B.1.5' || this.seccionId === '3.1.4.B.1.6' || this.seccionId === '3.1.4.B.1.7' || this.seccionId === '3.1.4.B.1.8' || this.seccionId === '3.1.4.B.1.9') {
      setTimeout(() => {
        this.datos = this.formularioService.obtenerDatos();
        this.formData = { ...this.datos };
        if (this.seccionId === '3.1.4.A.1.9' && datosPrueba.morbilidadTabla) {
          this.datos['morbilidadTabla'] = datosPrueba.morbilidadTabla;
          if (this.datos['morbiliadTabla']) {
            this.datos['morbiliadTabla'] = null as any;
          }
        }
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }, 50);
    }

    if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId === '3.1.4.A.1') {
      setTimeout(() => {
        this.calcularTotalesTablaAISD2();
        if (datosPrueba.distritoSeleccionado) {
          this.buscarDistrito(datosPrueba.distritoSeleccionado, false);
          setTimeout(() => {
            this.normalizarAltitud();
            this.cdRef.detectChanges();
          }, 300);
        } else {
          this.normalizarAltitud();
          this.cdRef.detectChanges();
        }
      }, 100);
    } else if (datosPrueba.distritoSeleccionado) {
      setTimeout(() => {
        this.buscarDistrito(datosPrueba.distritoSeleccionado, false);
        this.cdRef.detectChanges();
      }, 200);
    } else {
      this.cdRef.detectChanges();
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

  onJSONFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.jsonFileName = file.name;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        this.procesarJSON(jsonData);
      } catch (error) {
        alert('Error al leer el archivo JSON. Verifique que el formato sea correcto.');
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
  }

  selectJSONFile() {
    const fileInput = document.getElementById('jsonFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  procesarJSON(jsonData: any) {
    this.centrosPobladosJSON = [];
    this.geoInfo = { DPTO: '', PROV: '', DIST: '' };

    // 1️⃣ EXTRAER TODAS LAS COMUNIDADES CAMPESINAS (claves del JSON)
    const comunidadesCampesinas = Object.keys(jsonData);
    
    if (comunidadesCampesinas.length === 0) {
      alert('El JSON no contiene datos válidos.');
      return;
    }

    // 2️⃣ CONCATENAR TODOS LOS CENTROS POBLADOS DE TODAS LAS COMUNIDADES
    let todosLosCentrosPoblados: any[] = [];
    
    comunidadesCampesinas.forEach(nombreCC => {
      const centrosDeEstaCC = jsonData[nombreCC];
      
      if (Array.isArray(centrosDeEstaCC)) {
        // Normalizar CODIGO a string para búsquedas consistentes
        const centrosNormalizados = centrosDeEstaCC.map((cp: any) => ({
          ...cp,
          CODIGO: cp.CODIGO?.toString() || '',
          NOMBRE_CC: nombreCC  // Agregar nombre de la CC a cada centro
        }));
        todosLosCentrosPoblados.push(...centrosNormalizados);
      }
    });

    if (todosLosCentrosPoblados.length === 0) {
      alert('El JSON no contiene centros poblados válidos.');
      return;
    }

    // 3️⃣ NO FILTRAR EN procesarJSON() - Cargar todos los centros poblados
    // El filtrado ocurrirá dinámicamente cuando el usuario navegue a A.1, A.2, etc.
    let centrosPobladosParaMostrar = todosLosCentrosPoblados;
    this.datos = this.formularioService.obtenerDatos();
    this.comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];

    const capitalDistrital = centrosPobladosParaMostrar.find((cp: any) => cp.CATEGORIA === 'Capital distrital');
    const centroPobladoPrincipal = capitalDistrital || centrosPobladosParaMostrar[0];

    this.centrosPobladosJSON = centrosPobladosParaMostrar.map((cp: any) => ({
      ...cp,
      selected: true,
      selectedAISD: true
    }));

    // Guardar centrosPobladosJSON en FormularioService para que Sección 4 lo pueda acceder
    this.datos['centrosPobladosJSON'] = this.centrosPobladosJSON;
    this.formularioService.actualizarDato('centrosPobladosJSON', this.centrosPobladosJSON);

    // 4️⃣ EXTRAER TODOS LOS DISTRITOS ÚNICOS
    const distritosUnicos = [...new Set(this.centrosPobladosJSON.map((cp: any) => cp.DIST))].filter(Boolean);

    // 5️⃣ CREAR AUTOMÁTICAMENTE LAS COMUNIDADES CAMPESINAS
    this.comunidadesCampesinas = comunidadesCampesinas.map(nombreCC => {
      // Obtener todos los códigos de centros poblados de esta CC
      const centrosDeEstaCC = this.centrosPobladosJSON
        .filter(cp => cp.NOMBRE_CC === nombreCC)
        .map(cp => cp.CODIGO);
      
      return {
        id: this.generarIdComunidad(),
        nombre: nombreCC.replace('CCPP ', ''),  // Remover prefijo "CCPP"
        centrosPobladosSeleccionados: centrosDeEstaCC
      };
    });
    
    // Guardar comunidades en FormularioService
    this.datos['comunidadesCampesinas'] = this.comunidadesCampesinas;
    this.onFieldChange('comunidadesCampesinas', this.comunidadesCampesinas);
    
    // Actualizar el sidebar para mostrar las secciones AISD dinámicas
    if (typeof (window as any).layoutComponentRef !== 'undefined') {
      (window as any).layoutComponentRef.actualizarSeccionesAISD();
    }

    if (centrosPobladosParaMostrar.length > 0) {
      const primerCP = centrosPobladosParaMostrar[0];
      this.geoInfo = {
        DPTO: primerCP.DPTO || '',
        PROV: primerCP.PROV || '',
        DIST: primerCP.DIST || ''
      };

      if (!this.formData['departamentoSeleccionado'] && this.geoInfo.DPTO) {
        this.onFieldChange('departamentoSeleccionado', this.geoInfo.DPTO);
      }
      if (!this.formData['provinciaSeleccionada'] && this.geoInfo.PROV) {
        this.onFieldChange('provinciaSeleccionada', this.geoInfo.PROV);
      }
      if (!this.formData['distritoSeleccionado'] && this.geoInfo.DIST) {
        this.onFieldChange('distritoSeleccionado', this.geoInfo.DIST);
      }
    }

    if (centroPobladoPrincipal) {
      this.centroPobladoSeleccionado = centroPobladoPrincipal;

      if (centroPobladoPrincipal.CODIGO) {
        const codigos = this.datos.codigos || [];
        if (!codigos.includes(centroPobladoPrincipal.CODIGO.toString())) {
          codigos.push(centroPobladoPrincipal.CODIGO.toString());
          this.onFieldChange('codigos', codigos);
        }
      }

      if (centroPobladoPrincipal.CATEGORIA === 'Capital distrital' && !this.formData['grupoAISI']) {
        this.onFieldChange('grupoAISI', centroPobladoPrincipal.CCPP);
        this.onFieldChange('centroPobladoAISI', centroPobladoPrincipal.CCPP);
      }

      if (centroPobladoPrincipal.ESTE && centroPobladoPrincipal.NORTE) {
        const coordenadas = `18L E: ${centroPobladoPrincipal.ESTE.toLocaleString()} m N: ${centroPobladoPrincipal.NORTE.toLocaleString()} m`;
        if (!this.formData['coordenadasAISD']) {
          this.onFieldChange('coordenadasAISD', coordenadas);
        }
      }

      if (centroPobladoPrincipal.ALTITUD && !this.formData['altitudAISD']) {
        this.onFieldChange('altitudAISD', centroPobladoPrincipal.ALTITUD.toString());
      }

      this.onFieldChange('centroPobladoSeleccionadoData', {
        CCPP: centroPobladoPrincipal.CCPP,
        CATEGORIA: centroPobladoPrincipal.CATEGORIA,
        CODIGO: centroPobladoPrincipal.CODIGO,
        POBLACION: centroPobladoPrincipal.POBLACION,
        ESTE: centroPobladoPrincipal.ESTE,
        NORTE: centroPobladoPrincipal.NORTE,
        ALTITUD: centroPobladoPrincipal.ALTITUD,
        DPTO: centroPobladoPrincipal.DPTO,
        PROV: centroPobladoPrincipal.PROV,
        DIST: centroPobladoPrincipal.DIST
      });
    }

    // NO llenar la tabla aquí - Se llenará automáticamente en seccion4 cuando navegue a A.1, A.2, etc.
    // if (this.seccionId.match(/^3\.1\.4\.A\.\d+/)) {
    //   if (centrosPobladosParaMostrar.length > 0) {
    //     this.poblarTablaAISD2DesdeJSON(centrosPobladosParaMostrar);
    //   }
    // } else {
    //   this.poblarTablaAISD2DesdeJSON(centrosPobladosParaMostrar);
    // }

    const codigosCPP = centrosPobladosParaMostrar
      .filter((cp: any) => cp.CODIGO)
      .map((cp: any) => cp.CODIGO.toString());
    
    if (codigosCPP.length > 0) {
      this.datos['codigos'] = codigosCPP;
      this.onFieldChange('codigos', codigosCPP);
    }

    // Extraer distritos únicos de los centros poblados cargados
    const distritosSet = new Set<string>();
    todosLosCentrosPoblados.forEach((cp: any) => {
      if (cp && cp.DIST) {
        distritosSet.add(cp.DIST);
      }
    });

    this.distritosDisponiblesAISI = Array.from(distritosSet).sort();
    
    const distritosGuardados = this.datos['distritosSeleccionadosAISI'] || [];
    if (distritosGuardados.length === 0) {
      this.distritosSeleccionadosAISI = [...this.distritosDisponiblesAISI];
      this.onFieldChange('distritosSeleccionadosAISI', this.distritosSeleccionadosAISI);
    } else {
      this.distritosSeleccionadosAISI = distritosGuardados.filter((d: string) => 
        this.distritosDisponiblesAISI.includes(d)
      );
    }

    const centrosAISDGuardados = this.datos['centrosPobladosSeleccionadosAISD'] || [];
    if (centrosAISDGuardados.length === 0) {
      this.centrosPobladosSeleccionadosAISD = todosLosCentrosPoblados
        .filter((cp: any) => cp.CODIGO)
        .map((cp: any) => cp.CODIGO.toString());
      this.onFieldChange('centrosPobladosSeleccionadosAISD', this.centrosPobladosSeleccionadosAISD);
    } else {
      this.centrosPobladosSeleccionadosAISD = centrosAISDGuardados;
    }

    this.formularioService.guardarJSON(todosLosCentrosPoblados);
    
    this.formularioService.actualizarDatos(this.datos);
    
    setTimeout(() => {
      const comp2 = ViewChildHelper.getComponent('seccion2');
      if (comp2 && comp2['detectarDistritos']) {
        comp2['detectarDistritos']();
        comp2['actualizarDatos']();
      }
    }, 200);
    
    this.cdRef.detectChanges();
  }

  obtenerDistritosDeComunidad(): string[] {
    const prefijo = this.obtenerPrefijoGrupo();
    if (!prefijo || !prefijo.startsWith('_A')) {
      return [];
    }

    const match = prefijo.match(/_A(\d+)/);
    if (!match) {
      return [];
    }

    const indiceComunidad = parseInt(match[1]) - 1;
    const comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
    
    if (indiceComunidad < 0 || indiceComunidad >= comunidadesCampesinas.length) {
      return [];
    }

    const comunidad = comunidadesCampesinas[indiceComunidad];
    if (!comunidad || !comunidad.centrosPobladosSeleccionados) {
      return [];
    }

    const jsonData = this.datos['centrosPobladosJSON'] || [];
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return [];
    }

    const codigosSet = new Set(comunidad.centrosPobladosSeleccionados.map((c: string) => c.toString().trim()));
    const distritosSet = new Set<string>();

    jsonData.forEach((cp: any) => {
      if (cp.CODIGO && codigosSet.has(cp.CODIGO.toString().trim()) && cp.DIST) {
        distritosSet.add(cp.DIST);
      }
    });

    return Array.from(distritosSet).sort();
  }

  onDistritoPrincipalChange(distrito: string): void {
    this.onFieldChange('distritoSeleccionado', distrito);
    this.formData['distritoSeleccionado'] = distrito;
    this.cdRef.detectChanges();
  }

  onTablaFieldChange(campo: string, valor: any): void {
    this.onFieldChange(campo, valor);

    setTimeout(() => {
      const seccion4 = ViewChildHelper.getComponent('seccion4');
      if (seccion4 && seccion4['actualizarDatos']) {
        seccion4['actualizarDatos']();
        if (seccion4['cdRef']) {
          seccion4['cdRef'].detectChanges();
        }
      }
    }, 50);
  }

  extraerCodigoProvincia(ubigeo: number | string): string | null {
    if (!ubigeo) return null;
    
    const ubigeoStr = ubigeo.toString().padStart(6, '0');
    
    if (ubigeoStr.length >= 4) {
      return ubigeoStr.substring(2, 4);
    }
    
    return null;
  }

  cargarDistritosPorProvincia(ubigeo: number | string) {
    const codigoProvincia = this.extraerCodigoProvincia(ubigeo);
    
    if (!codigoProvincia) {
      return;
    }

    this.backendApi.getDistritos(codigoProvincia).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          const distritoPrincipal = this.formData['distritoSeleccionado'] || this.geoInfo.DIST;
          this.distritosProvincia = response.data
            .map((d: any) => d.nombre || d.distrito || '')
            .filter((nombre: string) => nombre && nombre.trim() !== '' && nombre !== distritoPrincipal)
            .sort();
        }
      },
      error: (error) => {
        if (error.status !== 500 || !error.error?.detail?.includes('Incorrect number of arguments')) {
          console.warn('Error al cargar distritos de la provincia (no crítico):', error.status);
        }
      }
    });
  }

  filtrarDistritosLocalmente(termino: string): string[] {
    if (!termino || termino.trim().length < 1) {
      return [];
    }

    const terminoLower = termino.toLowerCase().trim();
    
    return this.distritosProvincia.filter((distrito: string) => 
      distrito.toLowerCase().includes(terminoLower)
    );
  }

  toggleCentroPobladoAISD(codigo: string) {
    const index = this.centrosPobladosSeleccionadosAISD.indexOf(codigo);
    if (index > -1) {
      this.centrosPobladosSeleccionadosAISD.splice(index, 1);
    } else {
      this.centrosPobladosSeleccionadosAISD.push(codigo);
    }
    this.onFieldChange('centrosPobladosSeleccionadosAISD', [...this.centrosPobladosSeleccionadosAISD]);
  }

  estaCentroPobladoSeleccionadoAISD(codigo: string): boolean {
    return this.centrosPobladosSeleccionadosAISD.includes(codigo);
  }

  seleccionarTodosCentrosPobladosAISD() {
    const todosCodigos = this.centrosPobladosJSON
      .filter((cp: any) => cp.CODIGO)
      .map((cp: any) => cp.CODIGO.toString());
    this.centrosPobladosSeleccionadosAISD = [...todosCodigos];
    this.onFieldChange('centrosPobladosSeleccionadosAISD', this.centrosPobladosSeleccionadosAISD);
  }

  deseleccionarTodosCentrosPobladosAISD() {
    this.centrosPobladosSeleccionadosAISD = [];
    this.onFieldChange('centrosPobladosSeleccionadosAISD', this.centrosPobladosSeleccionadosAISD);
  }

  generarIdComunidad(): string {
    return 'cc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  agregarComunidadCampesina() {
    const nuevaComunidad: ComunidadCampesina = {
      id: this.generarIdComunidad(),
      nombre: '',
      centrosPobladosSeleccionados: []
    };
    this.comunidadesCampesinas.push(nuevaComunidad);
    this.guardarComunidadesCampesinas();
  }

  eliminarComunidadCampesina(id: string) {
    this.comunidadesCampesinas = this.comunidadesCampesinas.filter(cc => cc.id !== id);
    this.guardarComunidadesCampesinas();
  }

  actualizarNombreComunidad(id: string, nombre: string) {
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    if (comunidad) {
      comunidad.nombre = nombre;
      this.guardarComunidadesCampesinas();
    }
  }

  toggleCentroPobladoComunidad(id: string, codigo: string) {
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    if (comunidad) {
      const index = comunidad.centrosPobladosSeleccionados.indexOf(codigo);
      if (index > -1) {
        comunidad.centrosPobladosSeleccionados.splice(index, 1);
      } else {
        comunidad.centrosPobladosSeleccionados.push(codigo);
      }
      this.guardarComunidadesCampesinas();
    }
  }

  estaCentroPobladoSeleccionadoComunidad(id: string, codigo: string): boolean {
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    return comunidad ? comunidad.centrosPobladosSeleccionados.includes(codigo) : false;
  }

  seleccionarTodosCentrosPobladosComunidad(id: string) {
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    if (comunidad) {
      const todosCodigos = this.centrosPobladosJSON
        .filter((cp: any) => cp.CODIGO)
        .map((cp: any) => cp.CODIGO.toString());
      comunidad.centrosPobladosSeleccionados = [...todosCodigos];
      this.guardarComunidadesCampesinas();
    }
  }

  obtenerCentrosPobladosSeleccionadosComunidad(id: string): string[] {
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    return comunidad ? (comunidad.centrosPobladosSeleccionados || []) : [];
  }

  deseleccionarTodosCentrosPobladosComunidad(id: string) {
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    if (comunidad) {
      comunidad.centrosPobladosSeleccionados = [];
      this.guardarComunidadesCampesinas();
    }
  }

  guardarComunidadesCampesinas() {
    this.datos['comunidadesCampesinas'] = this.comunidadesCampesinas;
    this.formularioService.actualizarDato('comunidadesCampesinas', this.comunidadesCampesinas);
    this.stateService.setDatos(this.datos);
    if (this.comunidadesCampesinas.length > 0) {
      this.onFieldChange('grupoAISD', this.comunidadesCampesinas[0].nombre);
      this.onFieldChange('centrosPobladosSeleccionadosAISD', this.comunidadesCampesinas[0].centrosPobladosSeleccionados);
    }
  }

  esSubseccionAISD(seccionId: string, subseccion: number): boolean {
    return !!seccionId.match(new RegExp(`^3\\.1\\.4\\.A\\.\\d+\\.${subseccion}$`));
  }

  toggleDistritoAISI(distrito: string) {
    const index = this.distritosSeleccionadosAISI.indexOf(distrito);
    if (index > -1) {
      this.distritosSeleccionadosAISI.splice(index, 1);
    } else {
      this.distritosSeleccionadosAISI.push(distrito);
    }
    this.onFieldChange('distritosSeleccionadosAISI', [...this.distritosSeleccionadosAISI]);
    
    setTimeout(() => {
      const comp2 = ViewChildHelper.getComponent('seccion2');
      if (comp2 && comp2['actualizarDatos']) {
        comp2['actualizarDatos']();
      }
    }, 100);
  }

  estaDistritoSeleccionadoAISI(distrito: string): boolean {
    return this.distritosSeleccionadosAISI.includes(distrito);
  }

  obtenerCentrosPobladosDelJSON(): any[] {
    return this.centrosPobladosJSON;
  }

  toggleCentroPoblado(index: number) {
    const cp = this.centrosPobladosJSON[index];
    cp.selected = !cp.selected;

    if (cp.selected) {
      this.centroPobladoSeleccionado = cp;
      
      if (cp.CODIGO) {
        const codigos = this.datos.codigos || [];
        if (!codigos.includes(cp.CODIGO.toString())) {
          codigos.push(cp.CODIGO.toString());
          this.onFieldChange('codigos', codigos);
        }
      }

      if (cp.CATEGORIA === 'Capital distrital' && !this.formData['grupoAISI']) {
        this.onFieldChange('grupoAISI', cp.CCPP);
        this.onFieldChange('centroPobladoAISI', cp.CCPP);
      }

      if (cp.ESTE && cp.NORTE) {
        const coordenadas = `18L E: ${cp.ESTE.toLocaleString()} m N: ${cp.NORTE.toLocaleString()} m`;
        if (!this.formData['coordenadasAISD']) {
          this.onFieldChange('coordenadasAISD', coordenadas);
        }
      }

      if (cp.ALTITUD && !this.formData['altitudAISD']) {
        this.onFieldChange('altitudAISD', cp.ALTITUD.toString());
      }
    } else {
      if (this.centroPobladoSeleccionado === cp) {
        this.centroPobladoSeleccionado = null;
      }
    }

    this.cdRef.detectChanges();
  }

  // Sección 26 (B.1.5) - Servicios Básicos
  getFotografiasServiciosBasicosAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaCahuachoB15',
      'fotografiasServiciosBasicosAISIFormMulti',
      'Servicios Básicos - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasServiciosBasicosAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaCahuachoB15',
      'fotografiasServiciosBasicosAISIFormMulti',
      'Servicios Básicos - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasServiciosBasicosAISIChangeGeneric(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaCahuachoB15',
      'fotografiasServiciosBasicosAISIFormMulti',
      'Servicios Básicos - ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoServiciosBasicosAISIPreview'
    );
  }

  // Sección 27 (B.1.6) - Transportes y Comunicaciones
  getFotografiasTransportesAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaCahuachoB16',
      'fotografiasTransportesAISIFormMulti',
      'Transportes y Comunicaciones - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasTransportesAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaCahuachoB16',
      'fotografiasTransportesAISIFormMulti',
      'Transportes y Comunicaciones - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasTransportesAISIChangeGeneric(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaCahuachoB16',
      'fotografiasTransportesAISIFormMulti',
      'Transportes y Comunicaciones - ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoTransportesAISIPreview'
    );
  }

  // Sección 28 (B.1.7) - Infraestructura en Salud y Educación
  getFotografiasInfraestructuraAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaCahuachoB17',
      'fotografiasInfraestructuraAISIFormMulti',
      'Infraestructura en Salud y Educación - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasInfraestructuraAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaCahuachoB17',
      'fotografiasInfraestructuraAISIFormMulti',
      'Infraestructura en Salud y Educación - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasInfraestructuraAISIChangeGeneric(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaCahuachoB17',
      'fotografiasInfraestructuraAISIFormMulti',
      'Infraestructura en Salud y Educación - ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoInfraestructuraAISIPreview'
    );
  }

  // Sección 29 (B.1.8) - Indicadores de Salud
  getFotografiasIndicadoresSaludAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaCahuachoB18',
      'fotografiasIndicadoresSaludAISIFormMulti',
      'Indicadores de Salud - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasIndicadoresSaludAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaCahuachoB18',
      'fotografiasIndicadoresSaludAISIFormMulti',
      'Indicadores de Salud - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasIndicadoresSaludAISIChangeGeneric(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaCahuachoB18',
      'fotografiasIndicadoresSaludAISIFormMulti',
      'Indicadores de Salud - ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoIndicadoresSaludAISIPreview'
    );
  }

  // Sección 30 (B.1.9) - Indicadores de Educación
  getFotografiasIndicadoresEducacionAISIFormMulti(): any[] {
    return this.getFotografiasFormMultiGeneric(
      'fotografiaCahuachoB19',
      'fotografiasIndicadoresEducacionAISIFormMulti',
      'Indicadores de Educación - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  actualizarFotografiasIndicadoresEducacionAISIFormMulti() {
    this.actualizarFotografiasFormMultiGeneric(
      'fotografiaCahuachoB19',
      'fotografiasIndicadoresEducacionAISIFormMulti',
      'Indicadores de Educación - ' + (this.datos.centroPobladoAISI || 'Cahuacho')
    );
  }

  onFotografiasIndicadoresEducacionAISIChangeGeneric(fotografias: any[]) {
    this.onFotografiasChangeGeneric(
      fotografias,
      'fotografiaCahuachoB19',
      'fotografiasIndicadoresEducacionAISIFormMulti',
      'Indicadores de Educación - ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      'GEADES, 2024',
      'fotoIndicadoresEducacionAISIPreview'
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    DebounceUtil.clearAll();
  }
}

