import { Component, OnInit, ChangeDetectorRef, AfterViewChecked, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { SectionTemplateService } from 'src/app/core/services/section-template.service';
import { DataService } from 'src/app/core/services/data.service';
import { ConfigService } from 'src/app/core/services/config.service';
import { Seccion1Component } from 'src/app/shared/components/seccion1/seccion1.component';
import { Seccion2Component } from 'src/app/shared/components/seccion2/seccion2.component';
import { Seccion3Component } from 'src/app/shared/components/seccion3/seccion3.component';
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
import { CentroPoblado } from 'src/app/core/models/api-response.model';

@Component({
  selector: 'app-seccion',
  templateUrl: './seccion.component.html',
  styleUrls: ['./seccion.component.css']
})
export class SeccionComponent implements OnInit, AfterViewChecked {
  @ViewChild(Seccion1Component) seccion1Component!: Seccion1Component;
  @ViewChild(Seccion2Component) seccion2Component!: Seccion2Component;
  @ViewChild(Seccion3Component) seccion3Component!: Seccion3Component;
  @ViewChild(Seccion5Component) seccion5Component!: Seccion5Component;
  @ViewChild(Seccion6Component) seccion6Component!: Seccion6Component;
  @ViewChild(Seccion7Component) seccion7Component!: Seccion7Component;
  @ViewChild(Seccion8Component) seccion8Component!: Seccion8Component;
  @ViewChild(Seccion9Component) seccion9Component!: Seccion9Component;
  @ViewChild(Seccion10Component) seccion10Component!: Seccion10Component;
  @ViewChild(Seccion11Component) seccion11Component!: Seccion11Component;
  @ViewChild(Seccion12Component) seccion12Component!: Seccion12Component;
  @ViewChild(Seccion13Component) seccion13Component!: Seccion13Component;
  @ViewChild(Seccion14Component) seccion14Component!: Seccion14Component;
  @ViewChild(Seccion15Component) seccion15Component!: Seccion15Component;
  @ViewChild(Seccion16Component) seccion16Component!: Seccion16Component;
  @ViewChild(Seccion17Component) seccion17Component!: Seccion17Component;
  @ViewChild(Seccion18Component) seccion18Component!: Seccion18Component;
  @ViewChild(Seccion19Component) seccion19Component!: Seccion19Component;
  @ViewChild(Seccion20Component) seccion20Component!: Seccion20Component;
  @ViewChild(Seccion21Component) seccion21Component!: Seccion21Component;
  @ViewChild(Seccion22Component) seccion22Component!: Seccion22Component;
  @ViewChild(Seccion23Component) seccion23Component!: Seccion23Component;
  @ViewChild(Seccion24Component) seccion24Component!: Seccion24Component;
  @ViewChild(Seccion25Component) seccion25Component!: Seccion25Component;
  @ViewChild(Seccion26Component) seccion26Component!: Seccion26Component;
  @ViewChild(Seccion27Component) seccion27Component!: Seccion27Component;
  @ViewChild(Seccion28Component) seccion28Component!: Seccion28Component;
  @ViewChild(Seccion29Component) seccion29Component!: Seccion29Component;
  @ViewChild(Seccion30Component) seccion30Component!: Seccion30Component;
  
  seccionId: string = '';
  seccionTitulo: string = '';
  seccionPadreTitulo: string = '';
  sectionTemplate: string = '';
  sectionFields: any[] = [];
  datos: any = {};
  formData: any = {};
  loadingOptions: { [key: string]: boolean } = {};
  distritos: string[] = [];
  provincias: string[] = [];
  departamentos: string[] = [];
  centrosPoblados: CentroPoblado[] = [];
  distritosSugeridos: string[] = [];
  mostrarSugerencias: boolean = false;
  distritoBuscado: string = '';
  autocompleteData: { [key: string]: { sugerencias: string[], mostrar: boolean, buscado: string } } = {};
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
  fotografiasActividadesEconomicasFormMulti: any[] = [];
  fotografiasMercadoFormMulti: any[] = [];
  fotografiasInstitucionalidadFormMulti: any[] = [];
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

  jsonFileName: string = '';
  centrosPobladosJSON: any[] = [];
  centroPobladoSeleccionado: any = null;
  geoInfo: { DPTO: string, PROV: string, DIST: string } = { DPTO: '', PROV: '', DIST: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formularioService: FormularioService,
    private sectionTemplateService: SectionTemplateService,
    private dataService: DataService,
    private configService: ConfigService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.seccionId = params['id'];
      this.cargarSeccion();
    });
    
    this.datos = this.formularioService.obtenerDatos();
    this.formData = { ...this.datos };

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
    this.sectionTemplate = await this.sectionTemplateService.getSectionTemplate(this.seccionId);
    this.sectionFields = this.sectionTemplateService.getSectionFields(this.seccionId);
    this.datos = this.formularioService.obtenerDatos();
    this.actualizarEstadoNavegacion();
    
    if (this.seccionId === '3.1.4.A.1.1') {
      this.fotoInstitucionalidadPreview = this.datos['fotografiaAISD3Imagen'] || this.datos['fotografiaInstitucionalidadImagen'] || null;
      
      if (!this.datos['tituloInstituciones']) {
        const tituloDefault = 'Instituciones existentes - CC ' + (this.datos['grupoAISD'] || 'Ayroca');
        this.onFieldChange('tituloInstituciones', tituloDefault);
      }
      
      if (!this.datos['fuenteInstituciones']) {
        this.onFieldChange('fuenteInstituciones', 'GEADES (2024)');
      }
      
      if (!this.datos['fotografiaAISD3Titulo'] && !this.datos['fotoInstitucionalidadTitulo']) {
        const tituloFotoDefault = 'Local Comunal de la CC ' + (this.datos['grupoAISD'] || 'Ayroca');
        this.onFieldChange('fotografiaAISD3Titulo', tituloFotoDefault);
        this.onFieldChange('fotoInstitucionalidadTitulo', tituloFotoDefault);
      }
      
      if (!this.datos['fotografiaAISD3Fuente'] && !this.datos['fotoInstitucionalidadFuente']) {
        this.onFieldChange('fotografiaAISD3Fuente', 'GEADES, 2024');
        this.onFieldChange('fotoInstitucionalidadFuente', 'GEADES, 2024');
      }
    }
    
    if (this.seccionId === '3.1.4.A.1.4') {
      if (this.fotosGanaderia.length === 0) {
        this.getFotografiasGanaderiaForm();
      }
      if (this.fotosAgricultura.length === 0) {
        this.getFotografiasAgriculturaForm();
      }
      this.fotosGanaderia = [];
      this.fotosAgricultura = [];
      this.fotoComercioPreview = this.datos['fotografiaComercioImagen'] || null;
    }
    
    if (this.seccionId === '3.1.4.B' || this.seccionId === '3.1.4.B.1') {
      this.fotoCahuachoPreview = this.datos['fotografiaCahuachoImagen'] || null;
      if (!this.datos['fotografiaCahuachoTitulo']) {
        this.onFieldChange('fotografiaCahuachoTitulo', 'Vista panorámica del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'));
      }
      if (!this.datos['fotografiaCahuachoFuente']) {
        this.onFieldChange('fotografiaCahuachoFuente', 'GEADES, 2024');
      }
      this.actualizarFotografiasCahuachoFormMulti();
    }
    
    if (this.seccionId === '3.1.4.A.1.5') {
      this.actualizarFotografiasEstructuraFormMulti();
      if (!this.datos.condicionOcupacionTabla || this.datos.condicionOcupacionTabla.length === 0) {
        this.inicializarCondicionOcupacion();
      }
    }
    
    if (this.seccionId === '3.1.4.A.1.6') {
      this.actualizarFotografiasDesechosSolidosFormMulti();
      this.actualizarFotografiasElectricidadFormMulti();
    }
    
    if (this.seccionId === '3.1.4.A.1.7') {
      this.actualizarFotografiasTransporteFormMulti();
      this.actualizarFotografiasTelecomunicacionesFormMulti();
    }
    
    if (this.seccionId === '3.1.4.A.1.8') {
      this.actualizarFotografiasSaludFormMulti();
      this.actualizarFotografiasEducacionFormMulti();
      this.actualizarFotografiasRecreacionFormMulti();
      this.actualizarFotografiasDeporteFormMulti();
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
    
    if (this.seccionId === '3.1.4.A.1.12') {
      this.fotoReservorioPreview = this.datos['fotografiaReservorioImagen'] || null;
      this.fotoUsoSuelosPreview = this.datos['fotografiaUsoSuelosImagen'] || null;
      if (!this.datos['fotografiaReservorioTitulo']) {
        this.onFieldChange('fotografiaReservorioTitulo', 'Reservorio del anexo ' + (this.datos.grupoAISD || 'Ayroca'));
      }
      if (!this.datos['fotografiaReservorioFuente']) {
        this.onFieldChange('fotografiaReservorioFuente', 'GEADES, 2024');
      }
      if (!this.datos['fotografiaUsoSuelosTitulo']) {
        this.onFieldChange('fotografiaUsoSuelosTitulo', 'Uso de los suelos en el anexo ' + (this.datos.grupoAISD || 'Ayroca'));
      }
      if (!this.datos['fotografiaUsoSuelosFuente']) {
        this.onFieldChange('fotografiaUsoSuelosFuente', 'GEADES, 2024');
      }
    }
    
    // Actualizar seccion1 si estamos en la sección 3.1.1
    if (this.seccionId === '3.1.1') {
      setTimeout(() => {
        if (this.seccion1Component) {
          this.seccion1Component.actualizarDatos();
        }
      }, 100);
    }
    
    // Actualizar seccion2 si estamos en la sección 3.1.2
    if (this.seccionId === '3.1.2') {
      setTimeout(() => {
        if (this.seccion2Component) {
          this.seccion2Component.actualizarDatos();
        }
      }, 100);
    }
    
    // Actualizar seccion3 si estamos en la sección 3.1.3, 3.1.3.A o 3.1.3.B
    if (this.seccionId === '3.1.3' || this.seccionId === '3.1.3.A' || this.seccionId === '3.1.3.B') {
      setTimeout(() => {
        if (this.seccion3Component) {
          this.seccion3Component.actualizarDatos();
        }
      }, 100);
    }
    
    setTimeout(() => {
      this.actualizarComponenteSeccion();
    }, 100);
    
    if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId === '3.1.4.A.1') {
      this.filasTablaAISD2 = 1;
      this.fotografias = [{ numero: 1, titulo: 'Título de fotografía', fuente: 'GEADES, 2024', imagen: null, preview: null, dragOver: false }];
    }
    
    this.sectionFields.forEach(field => {
      this.formData[field.id] = this.datos[field.id] || '';
      
      if (field.type === 'autocomplete' && field.id !== 'distritoSeleccionado') {
        if (!this.autocompleteData[field.id]) {
          this.autocompleteData[field.id] = { 
            sugerencias: [], 
            mostrar: false, 
            buscado: this.datos[field.id] || '' 
          };
        }
      }
    });
    
    if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId === '3.1.4.A.1') {
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

      const jsonData = this.formularioService.obtenerJSON();
      if (jsonData && jsonData.length > 0) {
        setTimeout(() => {
          this.poblarTablaAISD2DesdeJSON(jsonData);
        }, 200);
      } else {
        setTimeout(() => {
          this.calcularTotalesTablaAISD2();
        }, 100);
      }
    }
    
    if (this.formData['distritoSeleccionado']) {
      this.cargarOpcionesBackend();
      
      if ((this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId === '3.1.4.A.1') && !this.formData['grupoAISI']) {
        this.onFieldChange('grupoAISI', this.formData['distritoSeleccionado']);
      }
      
      if (this.formData['distritoSeleccionado'] && this.formData['provinciaSeleccionada'] && this.formData['departamentoSeleccionado']) {
        if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId === '3.1.4.A.1') {
          this.cargarCentrosPobladosParaAISD(this.formData['distritoSeleccionado']);
        }
      }
    }
    
    if (this.seccionId === '3.1.4.A.1.2') {
      this.cargarDatosDemografiaAISD();
    } else if (this.seccionId === '3.1.4.B.1.1') {
      this.cargarDatosDemografiaAISI();
    } else if (this.seccionId === '3.1.4.B.1.2') {
      this.cargarDatosPEAAISI();
    }
    
    this.scrollRealizado = false;
    this.cdRef.detectChanges();
  }

  cargarDatosDemografiaAISD() {
    let codigosCPP: string[] = [];
    
    if (this.datos['codigos'] && Array.isArray(this.datos['codigos'])) {
      codigosCPP = this.datos['codigos'];
    } else {
      for (let i = 1; i <= this.filasTablaAISD2; i++) {
        const codigo = this.formData[`tablaAISD2Fila${i}Codigo`] || this.datos[`tablaAISD2Fila${i}Codigo`] || '';
        if (codigo && codigo.trim() !== '') {
          codigosCPP.push(codigo.trim());
        }
      }
    }
    
    if (!codigosCPP || codigosCPP.length === 0) {
      const distrito = this.datos['distritoSeleccionado'];
      if (!distrito) {
        alert('Por favor, primero carga el JSON en la sección 3.1.4 para obtener los códigos CPP. Sin códigos CPP solo se puede cargar población por sexo, no por grupo etario.');
        return;
      }
      
      const confirmar = confirm('No se encontraron códigos CPP. El endpoint por distrito solo proporciona datos de población por sexo, no por grupo etario. ¿Deseas cargar solo los datos de población por sexo? Para datos completos, carga el JSON en la sección 3.1.4.');
      if (!confirmar) {
        return;
      }
      
      this.dataService.getPoblacionByDistrito(distrito.toUpperCase()).subscribe({
        next: (response) => {
          if (response && response.success && Array.isArray(response.data)) {
            const grupoAISD = this.datos['grupoAISD'];
            const centroPoblado = response.data.find((cp: CentroPoblado) => 
              cp.centro_poblado && cp.centro_poblado.toUpperCase() === grupoAISD?.toUpperCase()
            ) || response.data[0];
            
            if (centroPoblado) {
              const total = centroPoblado.total || 0;
              const hombres = centroPoblado.hombres || 0;
              const mujeres = centroPoblado.mujeres || 0;
              
              const porcentajeHombres = total > 0 ? ((hombres / total) * 100).toFixed(2).replace('.', ',') + ' %' : '0 %';
              const porcentajeMujeres = total > 0 ? ((mujeres / total) * 100).toFixed(2).replace('.', ',') + ' %' : '0 %';
              
              this.datos['tablaAISD2TotalPoblacion'] = total.toString();
              this.datos['poblacionSexoAISD'] = [
                { sexo: 'Hombres', casos: hombres, porcentaje: porcentajeHombres },
                { sexo: 'Mujeres', casos: mujeres, porcentaje: porcentajeMujeres }
              ];
              
              alert('Datos de población por sexo cargados. Nota: Para cargar datos de grupo etario, necesitas cargar el JSON en la sección 3.1.4 para obtener los códigos CPP.');
              
              this.formularioService.actualizarDatos(this.datos);
              this.cdRef.detectChanges();
            }
          }
        },
        error: (error) => {
          console.error('Error al cargar datos demográficos:', error);
          // Silenciar error - usando datos mock
        }
      });
      return;
    }
    
    const codigosValidos = codigosCPP.filter((codigo: string) => codigo && codigo.trim() !== '');
    if (codigosValidos.length === 0) {
      alert('No se encontraron códigos CPP válidos. Por favor, verifica la tabla en la sección 3.1.4.');
      return;
    }
    
    this.dataService.getPoblacionByCpp(codigosValidos).subscribe({
      next: (response) => {
        if (response && response.success && response.data && response.data.poblacion) {
          const poblacion = response.data.poblacion;
          
          const totalPoblacion = poblacion.total_poblacion || 0;
          const totalHombres = poblacion.total_varones || 0;
          const totalMujeres = poblacion.total_mujeres || 0;
          
          const porcentajeHombres = totalPoblacion > 0 
            ? ((totalHombres / totalPoblacion) * 100).toFixed(2).replace('.', ',') + ' %' 
            : '0 %';
          const porcentajeMujeres = totalPoblacion > 0 
            ? ((totalMujeres / totalPoblacion) * 100).toFixed(2).replace('.', ',') + ' %' 
            : '0 %';
          
          this.datos['tablaAISD2TotalPoblacion'] = totalPoblacion.toString();
          this.datos['poblacionSexoAISD'] = [
            { sexo: 'Hombres', casos: totalHombres, porcentaje: porcentajeHombres },
            { sexo: 'Mujeres', casos: totalMujeres, porcentaje: porcentajeMujeres }
          ];
          
          const edad0_14 = poblacion.edad_0_14 || 0;
          const edad15_29 = poblacion.edad_15_29 || 0;
          const edad30_44 = poblacion.edad_30_44 || 0;
          const edad45_64 = poblacion.edad_45_64 || 0;
          const edad65_mas = poblacion.edad_65_mas || 0;
          
          const calcularPorcentaje = (valor: number) => {
            return totalPoblacion > 0 
              ? ((valor / totalPoblacion) * 100).toFixed(2).replace('.', ',') + ' %' 
              : '0 %';
          };
          
          this.datos['poblacionEtarioAISD'] = [
            {
              categoria: '0 a 14 años',
              casos: edad0_14,
              porcentaje: calcularPorcentaje(edad0_14)
            },
            {
              categoria: '15 a 29 años',
              casos: edad15_29,
              porcentaje: calcularPorcentaje(edad15_29)
            },
            {
              categoria: '30 a 44 años',
              casos: edad30_44,
              porcentaje: calcularPorcentaje(edad30_44)
            },
            {
              categoria: '45 a 64 años',
              casos: edad45_64,
              porcentaje: calcularPorcentaje(edad45_64)
            },
            {
              categoria: '65 años a más',
              casos: edad65_mas,
              porcentaje: calcularPorcentaje(edad65_mas)
            }
          ];
          
          const petTotal = edad15_29 + edad30_44 + edad45_64 + edad65_mas;
          const calcularPorcentajePET = (valor: number) => {
            return petTotal > 0 
              ? ((valor / petTotal) * 100).toFixed(2).replace('.', ',') + ' %' 
              : '0 %';
          };
          
          if (!this.datos['petTabla'] || this.datos['petTabla'].length === 0) {
            this.datos['petTabla'] = [
              {
                categoria: '15 a 29 años',
                casos: edad15_29,
                porcentaje: calcularPorcentajePET(edad15_29)
              },
              {
                categoria: '30 a 44 años',
                casos: edad30_44,
                porcentaje: calcularPorcentajePET(edad30_44)
              },
              {
                categoria: '45 a 64 años',
                casos: edad45_64,
                porcentaje: calcularPorcentajePET(edad45_64)
              },
              {
                categoria: '65 años a más',
                casos: edad65_mas,
                porcentaje: calcularPorcentajePET(edad65_mas)
              },
              {
                categoria: 'Total',
                casos: petTotal,
                porcentaje: '100,00 %'
              }
            ];
          }
          
          this.formularioService.actualizarDatos(this.datos);
          this.cdRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al cargar datos demográficos desde códigos CPP:', error);
        // Silenciar error - usando datos mock
      }
    });
  }

  cargarDatosDemografiaAISI() {
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
    this.formData[fieldId] = value;
    
    if (value && value.trim().length >= 2) {
      if (fieldId === 'grupoAISD') {
        this.buscarSugerenciasCentroPoblado(fieldId, value);
      } else {
        this.buscarSugerenciasDistrito(fieldId, value);
      }
    } else {
      this.autocompleteData[fieldId].sugerencias = [];
      this.autocompleteData[fieldId].mostrar = false;
    }
  }

  buscarSugerenciasDistrito(fieldId: string, termino: string) {
    if (!termino || termino.trim().length < 2) {
      if (this.autocompleteData[fieldId]) {
        this.autocompleteData[fieldId].sugerencias = [];
        this.autocompleteData[fieldId].mostrar = false;
      }
      return;
    }

    this.loadingOptions[fieldId] = true;
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
          
          if (!this.autocompleteData[fieldId]) {
            this.autocompleteData[fieldId] = { sugerencias: [], mostrar: false, buscado: '' };
          }
          
          this.autocompleteData[fieldId].sugerencias = Array.from(distritosUnicos).sort();
          this.autocompleteData[fieldId].mostrar = this.autocompleteData[fieldId].sugerencias.length > 0;
        } else {
          if (this.autocompleteData[fieldId]) {
            this.autocompleteData[fieldId].sugerencias = [];
            this.autocompleteData[fieldId].mostrar = false;
          }
        }
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
    const terminoBusqueda = termino.trim().toUpperCase();
    
    this.dataService.getPoblacionByDistrito(distritoSeleccionado.toUpperCase()).subscribe({
      next: (response) => {
        if (response && response.success && Array.isArray(response.data)) {
          const centrosPobladosUnicos = new Set<string>();
          const terminoLower = termino.toLowerCase();
          
          response.data.forEach((cp: CentroPoblado) => {
            if (cp.centro_poblado) {
              const centroLower = cp.centro_poblado.toLowerCase();
              if (centroLower.includes(terminoLower)) {
                centrosPobladosUnicos.add(cp.centro_poblado);
              }
            }
          });
          
          if (!this.autocompleteData[fieldId]) {
            this.autocompleteData[fieldId] = { sugerencias: [], mostrar: false, buscado: '' };
          }
          
          this.autocompleteData[fieldId].sugerencias = Array.from(centrosPobladosUnicos).sort();
          this.autocompleteData[fieldId].mostrar = this.autocompleteData[fieldId].sugerencias.length > 0;
        } else {
          if (this.autocompleteData[fieldId]) {
            this.autocompleteData[fieldId].sugerencias = [];
            this.autocompleteData[fieldId].mostrar = false;
          }
        }
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
    this.formData[fieldId] = valor;
    if (this.autocompleteData[fieldId]) {
      this.autocompleteData[fieldId].buscado = valor;
      this.autocompleteData[fieldId].mostrar = false;
      this.autocompleteData[fieldId].sugerencias = [];
    }
    this.onFieldChange(fieldId, valor);
  }

  cerrarSugerenciasAutocomplete(fieldId: string) {
    setTimeout(() => {
      if (this.autocompleteData[fieldId]) {
        this.autocompleteData[fieldId].mostrar = false;
      }
      this.cdRef.detectChanges();
    }, 300);
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
    
    if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId === '3.1.4.A.1') {
      this.onFieldChange('grupoAISI', distrito);
    }
    
    if (this.seccionId === '3.1.2' || this.seccionId === '3.1.2.A' || this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId === '3.1.4.A.1') {
      this.cargarCentrosPobladosParaAISD(distrito);
    }
  }

  autoCompletarCpAisi() {
    const distrito = this.formData['distritoSeleccionado'];
    if (!distrito) return;
    
    this.dataService.getPoblacionByDistrito(distrito).subscribe({
      next: (response) => {
        if (response && response.data && response.data.length > 0) {
          const primerCP = response.data[0];
          if (primerCP.centro_poblado && !this.formData['grupoAISI']) {
            this.formData['grupoAISI'] = primerCP.centro_poblado;
            this.onFieldChange('grupoAISI', primerCP.centro_poblado);
          }
          
          if (primerCP.provincia && primerCP.departamento) {
            this.cargarCentrosPobladosParaAISD(distrito);
          }
        }
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

    this.dataService.getPoblacionByDistrito(distrito.toUpperCase()).subscribe({
      next: (response) => {
        if (response && response.success && Array.isArray(response.data)) {
          const centrosPobladosUnicos = new Set<string>();
          
          response.data.forEach((cp: CentroPoblado) => {
            if (cp.centro_poblado) {
              centrosPobladosUnicos.add(cp.centro_poblado);
            }
          });
          
          if (!this.autocompleteData['grupoAISD']) {
            this.autocompleteData['grupoAISD'] = { sugerencias: [], mostrar: false, buscado: '' };
          }
          
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
          
          if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId === '3.1.4.A.1') {
            if (primerCP.provincia && primerCP.departamento) {
              this.cargarCentrosPobladosParaAISD(distrito);
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
      '3.1.4.B': 'B. Caracterización socioeconómica del Área de Influencia Social Indirecta (AISI)',
      '3.1.4.B.1': 'B.1 Centro Poblado Cahuacho',
      '3.1.4.A.1.1': 'A.1.1 Institucionalidad local',
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
      '3.1.4.B.1.15': 'B.1.15 Festividades, costumbres y turismo'
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
      '3.1.4.A.1.1': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.A.1.2': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.A.1.3': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.A.1.4': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.A.1.5': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.A.1.6': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.A.1.7': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.A.1.8': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.A.1.9': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.A.1.10': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.A.1.11': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.A.1.12': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.A.1.13': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.A.1.14': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.A.1.15': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.A.1.16': 'A.1 Comunidad Campesina Ayroca',
      '3.1.4.B.1': 'B. Caracterización socioeconómica del Área de Influencia Social Indirecta (AISI)',
      '3.1.4.B.1.1': 'B.1 Centro Poblado Cahuacho',
      '3.1.4.B.1.2': 'B.1 Centro Poblado Cahuacho',
      '3.1.4.B.1.3': 'B.1 Centro Poblado Cahuacho',
      '3.1.4.B.1.4': 'B.1 Centro Poblado Cahuacho',
      '3.1.4.B.1.5': 'B.1 Centro Poblado Cahuacho',
      '3.1.4.B.1.6': 'B.1 Centro Poblado Cahuacho',
      '3.1.4.B.1.7': 'B.1 Centro Poblado Cahuacho',
      '3.1.4.B.1.8': 'B.1 Centro Poblado Cahuacho',
      '3.1.4.B.1.9': 'B.1 Centro Poblado Cahuacho',
      '3.1.4.B.1.10': 'B.1 Centro Poblado Cahuacho',
      '3.1.4.B.1.11': 'B.1 Centro Poblado Cahuacho',
      '3.1.4.B.1.12': 'B.1 Centro Poblado Cahuacho',
      '3.1.4.B.1.13': 'B.1 Centro Poblado Cahuacho',
      '3.1.4.B.1.14': 'B.1 Centro Poblado Cahuacho',
      '3.1.4.B.1.15': 'B.1 Centro Poblado Cahuacho'
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
      this.seccionPadreTitulo = seccionesPadre[seccionPadreId];
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
    const seccionMap: { [key: string]: () => void } = {
      '3.1.1': () => this.seccion1Component?.actualizarDatos(),
      '3.1.2': () => this.seccion2Component?.actualizarDatos(),
      '3.1.3': () => this.seccion3Component?.actualizarDatos(),
      '3.1.3.A': () => this.seccion3Component?.actualizarDatos(),
      '3.1.3.B': () => this.seccion3Component?.actualizarDatos(),
      '3.1.4.A.1.1': () => this.seccion5Component?.actualizarDatos(),
      '3.1.4.A.1.2': () => this.seccion6Component?.actualizarDatos(),
      '3.1.4.A.1.3': () => this.seccion7Component?.actualizarDatos(),
      '3.1.4.A.1.4': () => this.seccion8Component?.actualizarDatos(),
      '3.1.4.A.1.5': () => this.seccion9Component?.actualizarDatos(),
      '3.1.4.A.1.6': () => this.seccion10Component?.actualizarDatos(),
      '3.1.4.A.1.7': () => this.seccion11Component?.actualizarDatos(),
      '3.1.4.A.1.8': () => this.seccion12Component?.actualizarDatos(),
      '3.1.4.A.1.9': () => this.seccion13Component?.actualizarDatos(),
      '3.1.4.A.1.10': () => this.seccion14Component?.actualizarDatos(),
      '3.1.4.A.1.11': () => this.seccion15Component?.actualizarDatos(),
      '3.1.4.A.1.12': () => this.seccion16Component?.actualizarDatos(),
      '3.1.4.A.1.13': () => this.seccion17Component?.actualizarDatos(),
      '3.1.4.A.1.14': () => this.seccion18Component?.actualizarDatos(),
      '3.1.4.A.1.15': () => this.seccion19Component?.actualizarDatos(),
      '3.1.4.A.1.16': () => this.seccion20Component?.actualizarDatos(),
      '3.1.4.B': () => {
        this.seccion21Component?.actualizarDatos();
        this.actualizarFotografiasCahuachoFormMulti();
      },
      '3.1.4.B.1': () => {
        this.seccion21Component?.actualizarDatos();
        this.actualizarFotografiasCahuachoFormMulti();
      },
      '3.1.4.B.1.1': () => this.seccion22Component?.actualizarDatos(),
      '3.1.4.B.1.2': () => this.seccion23Component?.actualizarDatos(),
      '3.1.4.B.1.3': () => {
        this.seccion24Component?.actualizarDatos();
        this.actualizarFotografiasActividadesEconomicasFormMulti();
        this.actualizarFotografiasMercadoFormMulti();
      },
      '3.1.4.B.1.4': () => this.seccion25Component?.actualizarDatos(),
      '3.1.4.B.1.5': () => this.seccion26Component?.actualizarDatos(),
      '3.1.4.B.1.6': () => this.seccion27Component?.actualizarDatos(),
      '3.1.4.B.1.7': () => this.seccion28Component?.actualizarDatos(),
      '3.1.4.B.1.8': () => this.seccion29Component?.actualizarDatos(),
      '3.1.4.B.1.9': () => this.seccion30Component?.actualizarDatos()
    };

    const actualizar = seccionMap[this.seccionId];
    if (actualizar) {
      actualizar();
    }
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
    
    this.formData[fieldId] = valorLimpio;
    this.datos[fieldId] = valorLimpio;
    this.formularioService.actualizarDato(fieldId, valorLimpio);
    this.datos = this.formularioService.obtenerDatos();
    
    this.actualizarComponenteSeccion();
    
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

  limpiarDatos() {
    if (confirm('¿Está seguro que desea limpiar todos los datos? Esta acción no se puede deshacer.')) {
      this.formularioService.limpiarDatos();
      this.datos = this.formularioService.obtenerDatos();
      this.formData = { ...this.datos };
      this.centrosPobladosJSON = [];
      this.jsonFileName = '';
      this.geoInfo = { DPTO: '', PROV: '', DIST: '' };
      this.centroPobladoSeleccionado = null;
      this.cdRef.detectChanges();
      alert('Todos los datos han sido limpiados.');
    }
  }

  inicializarPoblacionSexo() {
    if (!this.datos.poblacionSexoAISD || this.datos.poblacionSexoAISD.length === 0) {
      this.datos.poblacionSexoAISD = [
        { sexo: 'Hombres', casos: 0, porcentaje: '0%' },
        { sexo: 'Mujeres', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('poblacionSexoAISD', this.datos.poblacionSexoAISD);
      this.cdRef.detectChanges();
    }
  }

  inicializarPoblacionEtario() {
    if (!this.datos.poblacionEtarioAISD || this.datos.poblacionEtarioAISD.length === 0) {
      this.datos.poblacionEtarioAISD = [
        { categoria: '0 a 14 años', casos: 0, porcentaje: '0%' },
        { categoria: '15 a 29 años', casos: 0, porcentaje: '0%' },
        { categoria: '30 a 44 años', casos: 0, porcentaje: '0%' },
        { categoria: '45 a 64 años', casos: 0, porcentaje: '0%' },
        { categoria: '65 años a más', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('poblacionEtarioAISD', this.datos.poblacionEtarioAISD);
      this.cdRef.detectChanges();
    }
  }

  actualizarPoblacionSexo(index: number, field: string, value: any) {
    if (!this.datos.poblacionSexoAISD) {
      this.inicializarPoblacionSexo();
    }
    if (this.datos.poblacionSexoAISD[index]) {
      this.datos.poblacionSexoAISD[index][field] = value;
      if (field === 'casos' && this.datos.tablaAISD2TotalPoblacion) {
        const total = parseInt(this.datos.tablaAISD2TotalPoblacion) || 0;
        if (total > 0) {
          const casos = parseInt(value) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2) + '%';
          this.datos.poblacionSexoAISD[index].porcentaje = porcentaje;
        }
      }
      this.formularioService.actualizarDato('poblacionSexoAISD', this.datos.poblacionSexoAISD);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarPoblacionEtario(index: number, field: string, value: any) {
    if (!this.datos.poblacionEtarioAISD) {
      this.inicializarPoblacionEtario();
    }
    if (this.datos.poblacionEtarioAISD[index]) {
      this.datos.poblacionEtarioAISD[index][field] = value;
      if (field === 'casos' && this.datos.tablaAISD2TotalPoblacion) {
        const total = parseInt(this.datos.tablaAISD2TotalPoblacion) || 0;
        if (total > 0) {
          const casos = parseInt(value) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2) + '%';
          this.datos.poblacionEtarioAISD[index].porcentaje = porcentaje;
        }
      }
      this.formularioService.actualizarDato('poblacionEtarioAISD', this.datos.poblacionEtarioAISD);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
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

  inicializarPET() {
    if (!this.datos.petTabla || this.datos.petTabla.length === 0) {
      this.datos.petTabla = [
        { categoria: '15 a 29 años', casos: 0, porcentaje: '0%' },
        { categoria: '30 a 44 años', casos: 0, porcentaje: '0%' },
        { categoria: '45 a 64 años', casos: 0, porcentaje: '0%' },
        { categoria: '65 años a más', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('petTabla', this.datos.petTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarPET() {
    if (!this.datos.petTabla) {
      this.inicializarPET();
    }
    const totalIndex = this.datos.petTabla.findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos.petTabla.splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos.petTabla.push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('petTabla', this.datos.petTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPET(index: number) {
    if (this.datos.petTabla && this.datos.petTabla.length > 1 && this.datos.petTabla[index].categoria !== 'Total') {
      this.datos.petTabla.splice(index, 1);
      this.formularioService.actualizarDato('petTabla', this.datos.petTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarPET(index: number, field: string, value: any) {
    if (!this.datos.petTabla) {
      this.inicializarPET();
    }
    if (this.datos.petTabla[index]) {
      this.datos.petTabla[index][field] = value;
      if (field === 'casos' && this.datos.petTabla[index].categoria !== 'Total') {
        const totalCasos = this.datos.petTabla
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos.petTabla.find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          const totalPorcentaje = this.datos.tablaAISD2TotalPoblacion ? 
            ((totalCasos / parseInt(this.datos.tablaAISD2TotalPoblacion)) * 100).toFixed(2) + '%' : '100,00 %';
          totalItem.porcentaje = totalPorcentaje;
        }
      }
      this.formularioService.actualizarDato('petTabla', this.datos.petTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarPEA() {
    if (!this.datos.peaTabla || this.datos.peaTabla.length === 0) {
      this.datos.peaTabla = [
        { categoria: 'PEA', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' },
        { categoria: 'No PEA', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('peaTabla', this.datos.peaTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarPEA() {
    if (!this.datos.peaTabla) {
      this.inicializarPEA();
    }
    const totalIndex = this.datos.peaTabla.findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos.peaTabla.splice(totalIndex, 0, { categoria: '', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' });
    } else {
      this.datos.peaTabla.push({ categoria: '', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('peaTabla', this.datos.peaTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPEA(index: number) {
    if (this.datos.peaTabla && this.datos.peaTabla.length > 1 && this.datos.peaTabla[index].categoria !== 'Total') {
      this.datos.peaTabla.splice(index, 1);
      this.formularioService.actualizarDato('peaTabla', this.datos.peaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarPEA(index: number, field: string, value: any) {
    if (!this.datos.peaTabla) {
      this.inicializarPEA();
    }
    if (this.datos.peaTabla[index]) {
      this.datos.peaTabla[index][field] = value;
      this.formularioService.actualizarDato('peaTabla', this.datos.peaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarPEAOcupada() {
    if (!this.datos.peaOcupadaTabla || this.datos.peaOcupadaTabla.length === 0) {
      this.datos.peaOcupadaTabla = [
        { categoria: 'PEA Ocupada', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' },
        { categoria: 'PEA Desocupada', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('peaOcupadaTabla', this.datos.peaOcupadaTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarPEAOcupada() {
    if (!this.datos.peaOcupadaTabla) {
      this.inicializarPEAOcupada();
    }
    const totalIndex = this.datos.peaOcupadaTabla.findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos.peaOcupadaTabla.splice(totalIndex, 0, { categoria: '', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' });
    } else {
      this.datos.peaOcupadaTabla.push({ categoria: '', hombres: 0, porcentajeHombres: '0%', mujeres: 0, porcentajeMujeres: '0%', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('peaOcupadaTabla', this.datos.peaOcupadaTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPEAOcupada(index: number) {
    if (this.datos.peaOcupadaTabla && this.datos.peaOcupadaTabla.length > 1 && this.datos.peaOcupadaTabla[index].categoria !== 'Total') {
      this.datos.peaOcupadaTabla.splice(index, 1);
      this.formularioService.actualizarDato('peaOcupadaTabla', this.datos.peaOcupadaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarPEAOcupada(index: number, field: string, value: any) {
    if (!this.datos.peaOcupadaTabla) {
      this.inicializarPEAOcupada();
    }
    if (this.datos.peaOcupadaTabla[index]) {
      this.datos.peaOcupadaTabla[index][field] = value;
      this.formularioService.actualizarDato('peaOcupadaTabla', this.datos.peaOcupadaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  cargarDatosPEAAISD() {
    const distrito = this.formData['distritoSeleccionado'] || this.datos['distritoSeleccionado'];
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
              
              this.datos.peaTabla = [
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
              
              this.datos.peaOcupadaTabla = [
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
              this.formularioService.actualizarDato('peaTabla', this.datos.peaTabla);
              this.formularioService.actualizarDato('peaOcupadaTabla', this.datos.peaOcupadaTabla);
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
    if (!this.datos.peaOcupacionesTabla || this.datos.peaOcupacionesTabla.length === 0) {
      this.datos.peaOcupacionesTabla = [
        { categoria: 'Trabajador independiente o por cuenta propia', casos: 0, porcentaje: '0%' },
        { categoria: 'Obrero', casos: 0, porcentaje: '0%' },
        { categoria: 'Empleado', casos: 0, porcentaje: '0%' },
        { categoria: 'Empleador o patrono', casos: 0, porcentaje: '0%' },
        { categoria: 'Trabajador en negocio de un familiar', casos: 0, porcentaje: '0%' },
        { categoria: 'Trabajador del hogar', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('peaOcupacionesTabla', this.datos.peaOcupacionesTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarPEAOcupaciones() {
    if (!this.datos.peaOcupacionesTabla) {
      this.inicializarPEAOcupaciones();
    }
    const totalIndex = this.datos.peaOcupacionesTabla.findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos.peaOcupacionesTabla.splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos.peaOcupacionesTabla.push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('peaOcupacionesTabla', this.datos.peaOcupacionesTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPEAOcupaciones(index: number) {
    if (this.datos.peaOcupacionesTabla && this.datos.peaOcupacionesTabla.length > 1 && this.datos.peaOcupacionesTabla[index].categoria !== 'Total') {
      this.datos.peaOcupacionesTabla.splice(index, 1);
      this.formularioService.actualizarDato('peaOcupacionesTabla', this.datos.peaOcupacionesTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarPEAOcupaciones(index: number, field: string, value: any) {
    if (!this.datos.peaOcupacionesTabla) {
      this.inicializarPEAOcupaciones();
    }
    if (this.datos.peaOcupacionesTabla[index]) {
      this.datos.peaOcupacionesTabla[index][field] = value;
      if (field === 'casos' && this.datos.peaOcupacionesTabla[index].categoria !== 'Total') {
        const totalCasos = this.datos.peaOcupacionesTabla
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos.peaOcupacionesTabla.find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          totalItem.porcentaje = '100,00 %';
        }
      }
      this.formularioService.actualizarDato('peaOcupacionesTabla', this.datos.peaOcupacionesTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarPoblacionPecuaria() {
    if (!this.datos.poblacionPecuariaTabla || this.datos.poblacionPecuariaTabla.length === 0) {
      this.datos.poblacionPecuariaTabla = [
        { especie: 'Vacuno', cantidadPromedio: '4 – 50', ventaUnidad: 'S/. 1 200 – S/. 1 500' },
        { especie: 'Ovino', cantidadPromedio: '5 – 7', ventaUnidad: 'S/. 180 – S/. 200' },
        { especie: 'Gallinas', cantidadPromedio: '5 – 10', ventaUnidad: 'S/. 20 – S/. 30' },
        { especie: 'Cuyes', cantidadPromedio: '15 – 20', ventaUnidad: 'S/. 25 – S/. 30' }
      ];
      this.formularioService.actualizarDato('poblacionPecuariaTabla', this.datos.poblacionPecuariaTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarPoblacionPecuaria() {
    if (!this.datos.poblacionPecuariaTabla) {
      this.inicializarPoblacionPecuaria();
    }
    this.datos.poblacionPecuariaTabla.push({ especie: '', cantidadPromedio: '', ventaUnidad: '' });
    this.formularioService.actualizarDato('poblacionPecuariaTabla', this.datos.poblacionPecuariaTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPoblacionPecuaria(index: number) {
    if (this.datos.poblacionPecuariaTabla && this.datos.poblacionPecuariaTabla.length > 1) {
      this.datos.poblacionPecuariaTabla.splice(index, 1);
      this.formularioService.actualizarDato('poblacionPecuariaTabla', this.datos.poblacionPecuariaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarPoblacionPecuaria(index: number, field: string, value: any) {
    if (!this.datos.poblacionPecuariaTabla) {
      this.inicializarPoblacionPecuaria();
    }
    if (this.datos.poblacionPecuariaTabla[index]) {
      this.datos.poblacionPecuariaTabla[index][field] = value;
      this.formularioService.actualizarDato('poblacionPecuariaTabla', this.datos.poblacionPecuariaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarCaracteristicasAgricultura() {
    if (!this.datos.caracteristicasAgriculturaTabla || this.datos.caracteristicasAgriculturaTabla.length === 0) {
      this.datos.caracteristicasAgriculturaTabla = [
        { categoria: 'Destino de la producción (aprox.)', detalle: 'Autoconsumo: 95 %\nVenta: 5 %' },
        { categoria: 'Tipos de Cultivo', detalle: 'Papa, haba, cebada, avena, alfalfa' },
        { categoria: 'Cantidad de área para cultivar (en Ha) por familia', detalle: '1 ½ ha.' },
        { categoria: 'Tipo de Riego', detalle: 'Gravedad' },
        { categoria: 'Mercado o lugares de venta', detalle: 'Comunalmente\nCapital provincial de Caravelí' },
        { categoria: 'Problemáticas principales', detalle: 'Heladas\nSequías\nPlagas y enfermedades' }
      ];
      this.formularioService.actualizarDato('caracteristicasAgriculturaTabla', this.datos.caracteristicasAgriculturaTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarCaracteristicasAgricultura() {
    if (!this.datos.caracteristicasAgriculturaTabla) {
      this.inicializarCaracteristicasAgricultura();
    }
    this.datos.caracteristicasAgriculturaTabla.push({ categoria: '', detalle: '' });
    this.formularioService.actualizarDato('caracteristicasAgriculturaTabla', this.datos.caracteristicasAgriculturaTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCaracteristicasAgricultura(index: number) {
    if (this.datos.caracteristicasAgriculturaTabla && this.datos.caracteristicasAgriculturaTabla.length > 1) {
      this.datos.caracteristicasAgriculturaTabla.splice(index, 1);
      this.formularioService.actualizarDato('caracteristicasAgriculturaTabla', this.datos.caracteristicasAgriculturaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarCaracteristicasAgricultura(index: number, field: string, value: any) {
    if (!this.datos.caracteristicasAgriculturaTabla) {
      this.inicializarCaracteristicasAgricultura();
    }
    if (this.datos.caracteristicasAgriculturaTabla[index]) {
      this.datos.caracteristicasAgriculturaTabla[index][field] = value;
      this.formularioService.actualizarDato('caracteristicasAgriculturaTabla', this.datos.caracteristicasAgriculturaTabla);
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
    const fotos = this.getFotografiasGanaderiaForm();
    return fotos.map((foto, index) => ({
      titulo: foto.titulo || (index === 0 ? 'Ganado vacuno en la CC ' + (this.datos.grupoAISD || 'Ayroca') : 'Ganado ovino y caprino en la CC ' + (this.datos.grupoAISD || 'Ayroca')),
      fuente: foto.fuente || 'GEADES, 2024',
      imagen: foto.preview || null,
      id: `ganaderia-${index}`
    }));
  }

  actualizarFotografiasGanaderiaFormMulti() {
    const nuevasFotografias = this.getFotografiasGanaderiaFormMulti();
    const actualSerialized = JSON.stringify(this.fotografiasGanaderiaFormMulti.map(f => ({
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
      this.fotografiasGanaderiaFormMulti = nuevasFotografias;
    }
  }

  onFotografiasGanaderiaChange(fotografias: any[]) {
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      this.onFieldChange(`fotografiaGanaderia${num}Titulo`, foto.titulo);
      this.onFieldChange(`fotografiaGanaderia${num}Fuente`, foto.fuente);
      this.onFieldChange(`fotografiaGanaderia${num}Imagen`, foto.imagen || '');
    });
    for (let i = fotografias.length + 1; i <= 10; i++) {
      this.onFieldChange(`fotografiaGanaderia${i}Titulo`, '');
      this.onFieldChange(`fotografiaGanaderia${i}Fuente`, '');
      this.onFieldChange(`fotografiaGanaderia${i}Imagen`, '');
    }
    this.fotosGanaderia = fotografias.map(f => ({ ...f, preview: f.imagen }));
    this.actualizarFotografiasGanaderiaFormMulti();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  getFotografiasAgriculturaFormMulti(): any[] {
    const fotos = this.getFotografiasAgriculturaForm();
    return fotos.map((foto, index) => ({
      titulo: foto.titulo || (index === 0 ? 'Parcela agrícola en el anexo ' + (this.datos.grupoAISD || 'Ayroca') : 'Sector agrícola en la CC ' + (this.datos.grupoAISD || 'Ayroca')),
      fuente: foto.fuente || 'GEADES, 2024',
      imagen: foto.preview || null,
      id: `agricultura-${index}`
    }));
  }

  actualizarFotografiasAgriculturaFormMulti() {
    const nuevasFotografias = this.getFotografiasAgriculturaFormMulti();
    const actualSerialized = JSON.stringify(this.fotografiasAgriculturaFormMulti.map(f => ({
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
      this.fotografiasAgriculturaFormMulti = nuevasFotografias;
    }
  }

  onFotografiasAgriculturaChange(fotografias: any[]) {
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      this.onFieldChange(`fotografiaAgricultura${num}Titulo`, foto.titulo);
      this.onFieldChange(`fotografiaAgricultura${num}Fuente`, foto.fuente);
      this.onFieldChange(`fotografiaAgricultura${num}Imagen`, foto.imagen || '');
    });
    for (let i = fotografias.length + 1; i <= 10; i++) {
      this.onFieldChange(`fotografiaAgricultura${i}Titulo`, '');
      this.onFieldChange(`fotografiaAgricultura${i}Fuente`, '');
      this.onFieldChange(`fotografiaAgricultura${i}Imagen`, '');
    }
    this.fotosAgricultura = fotografias.map(f => ({ ...f, preview: f.imagen }));
    this.actualizarFotografiasAgriculturaFormMulti();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
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
    const fotos = this.getFotografiasRecreacionForm();
    const titulosDefault = [
      'Parque recreacional público del anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'Plaza de toros del anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      'Plaza central del anexo ' + (this.datos.grupoAISD || 'Ayroca')
    ];
    return fotos.map((foto, index) => ({
      titulo: foto.titulo || titulosDefault[index] || '',
      fuente: foto.fuente || 'GEADES, 2024',
      imagen: foto.preview || null,
      id: `recreacion-${index}`
    }));
  }

  actualizarFotografiasRecreacionFormMulti() {
    const nuevasFotografias = this.getFotografiasRecreacionFormMulti();
    const actualSerialized = JSON.stringify(this.fotografiasRecreacionFormMulti.map(f => ({
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
      this.fotografiasRecreacionFormMulti = nuevasFotografias;
    }
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
    const fotos = this.getFotografiasDeporteForm();
    return fotos.map((foto, index) => ({
      titulo: foto.titulo || (index === 0 ? 'Losa deportiva del anexo ' + (this.datos.grupoAISD || 'Ayroca') : 'Estadio del anexo ' + (this.datos.grupoAISD || 'Ayroca')),
      fuente: foto.fuente || 'GEADES, 2024',
      imagen: foto.preview || null,
      id: `deporte-${index}`
    }));
  }

  actualizarFotografiasDeporteFormMulti() {
    const nuevasFotografias = this.getFotografiasDeporteFormMulti();
    const actualSerialized = JSON.stringify(this.fotografiasDeporteFormMulti.map(f => ({
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
      this.fotografiasDeporteFormMulti = nuevasFotografias;
    }
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

  getFotografiasAISDFormMulti(): any[] {
    return this.fotografias.map((foto, index) => ({
      titulo: foto.titulo || 'Título de fotografía',
      fuente: foto.fuente || 'GEADES, 2024',
      imagen: foto.preview || foto.imagen || null,
      id: `aisd-${index}`
    }));
  }

  onFotografiasAISDChange(fotografias: any[]) {
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      this.onFieldChange(`fotografiaAISD${num}Titulo`, foto.titulo);
      this.onFieldChange(`fotografiaAISD${num}Fuente`, foto.fuente);
      this.onFieldChange(`fotografiaAISD${num}Imagen`, foto.imagen || '');
      this.fotografias[index] = {
        numero: num,
        titulo: foto.titulo,
        fuente: foto.fuente,
        imagen: foto.imagen,
        preview: foto.imagen
      };
    });
    this.fotografias = this.fotografias.slice(0, fotografias.length);
    this.formularioService.actualizarDato('fotografias', this.fotografias);
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
    let totalPoblacion = 0;
    let totalViviendasEmpadronadas = 0;
    let totalViviendasOcupadas = 0;
    
    for (let i = 1; i <= this.filasTablaAISD2; i++) {
      const poblacion = parseInt(this.formData[`tablaAISD2Fila${i}Poblacion`] || '0') || 0;
      const viviendasEmp = parseInt(this.formData[`tablaAISD2Fila${i}ViviendasEmpadronadas`] || '0') || 0;
      const viviendasOcp = parseInt(this.formData[`tablaAISD2Fila${i}ViviendasOcupadas`] || '0') || 0;
      
      totalPoblacion += poblacion;
      totalViviendasEmpadronadas += viviendasEmp;
      totalViviendasOcupadas += viviendasOcp;
    }
    
    this.formData['tablaAISD2TotalPoblacion'] = totalPoblacion.toString();
    this.formData['tablaAISD2TotalViviendasEmpadronadas'] = totalViviendasEmpadronadas.toString();
    this.formData['tablaAISD2TotalViviendasOcupadas'] = totalViviendasOcupadas.toString();
    
    this.datos['tablaAISD2TotalPoblacion'] = totalPoblacion.toString();
    this.datos['tablaAISD2TotalViviendasEmpadronadas'] = totalViviendasEmpadronadas.toString();
    this.datos['tablaAISD2TotalViviendasOcupadas'] = totalViviendasOcupadas.toString();
    
    this.formularioService.actualizarDato('tablaAISD2TotalPoblacion', totalPoblacion.toString());
    this.formularioService.actualizarDato('tablaAISD2TotalViviendasEmpadronadas', totalViviendasEmpadronadas.toString());
    this.formularioService.actualizarDato('tablaAISD2TotalViviendasOcupadas', totalViviendasOcupadas.toString());
  }

  capitalizarTexto(texto: string): string {
    if (!texto || texto.trim() === '') return texto;
    const textoLimpio = texto.trim();
    return textoLimpio.charAt(0).toUpperCase() + textoLimpio.slice(1).toLowerCase();
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

  poblarTablaAISD2DesdeJSON(centrosPoblados: any[]) {
    if (!centrosPoblados || centrosPoblados.length === 0) return;

    const centrosPobladosValidos = centrosPoblados.filter((cp: any) => cp.CCPP && cp.CODIGO);
    
    if (centrosPobladosValidos.length === 0) return;

    const filasActivasGuardadas = this.formularioService.obtenerFilasActivasTablaAISD2();
    const codigosActivos: string[] = [];

    if (filasActivasGuardadas.length > 0) {
      let filaIndex = 1;
      centrosPobladosValidos.forEach((cp: any) => {
        const codigoCPP = cp.CODIGO?.toString() || '';
        if (filasActivasGuardadas.includes(codigoCPP)) {
          this.onFieldChange(`tablaAISD2Fila${filaIndex}Punto`, cp.CCPP || '');
          this.onFieldChange(`tablaAISD2Fila${filaIndex}Codigo`, codigoCPP);
          this.onFieldChange(`tablaAISD2Fila${filaIndex}Poblacion`, cp.POBLACION?.toString() || '0');
          codigosActivos.push(codigoCPP);
          filaIndex++;
        }
      });
      this.filasTablaAISD2 = codigosActivos.length;
    } else {
      this.filasTablaAISD2 = centrosPobladosValidos.length;
      centrosPobladosValidos.forEach((cp: any, index: number) => {
        const filaIndex = index + 1;
        const codigoCPP = cp.CODIGO?.toString() || '';
        this.onFieldChange(`tablaAISD2Fila${filaIndex}Punto`, cp.CCPP || '');
        this.onFieldChange(`tablaAISD2Fila${filaIndex}Codigo`, codigoCPP);
        this.onFieldChange(`tablaAISD2Fila${filaIndex}Poblacion`, cp.POBLACION?.toString() || '0');
        codigosActivos.push(codigoCPP);
      });
      this.formularioService.guardarFilasActivasTablaAISD2(codigosActivos);
    }

    setTimeout(() => {
      this.calcularTotalesTablaAISD2();
      this.cdRef.detectChanges();
    }, 100);
  }

  agregarFilaTabla() {
    this.filasTablaAISD2++;
    this.actualizarFilasActivas();
  }

  actualizarFilasActivas() {
    const codigosActivos: string[] = [];
    for (let i = 1; i <= this.filasTablaAISD2; i++) {
      const codigo = this.formData[`tablaAISD2Fila${i}Codigo`] || '';
      if (codigo) {
        codigosActivos.push(codigo);
      }
    }
    this.formularioService.guardarFilasActivasTablaAISD2(codigosActivos);
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
    this.datos.entrevistados[index][campo] = value;
    this.formularioService.actualizarDato('entrevistados', this.datos.entrevistados);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  getRenderedTemplate(): string {
    if (!this.sectionTemplate) return '';
    
    this.datos = this.formularioService.obtenerDatos();
    
    let template = this.sectionTemplate;
    
    const processExpression = (expr: string): string => {
      if (expr.includes('normalizarNombreProyecto')) {
        const match = expr.match(/normalizarNombreProyecto\(datos\.projectName(?:,\s*(true|false))?\)/);
        if (match) {
          let value = this.datos.projectName;
          if (value && value !== '____') {
            value = this.capitalizarTexto(value);
          }
          const normalized = this.normalizarNombreProyecto(value, match[1] !== 'false');
          return `<span class="highlight">${normalized || '____'}</span>`;
        }
      }
      
      if (expr.includes('||')) {
        const parts = expr.split('||').map(p => p.trim());
        let foundValue = false;
        let result = '';
        
        for (const part of parts) {
          if (part.startsWith('datos.')) {
            const fieldMatch = part.match(/datos\.(\w+)/);
            if (fieldMatch) {
              const field = fieldMatch[1];
              const value = this.datos[field];
              if (value !== undefined && value !== null && value !== '') {
                foundValue = true;
                if (field === 'projectName') {
                  result = `<span class="highlight">${this.capitalizarTexto(value)}</span>`;
                } else {
                  result = `<span class="highlight">${value}</span>`;
                }
                break;
              }
            }
          } else if (part.startsWith("'") || part.startsWith('"')) {
            let defaultValue = part.replace(/^['"]|['"]$/g, '');
            if (defaultValue === '____') {
              if (!foundValue) {
                result = '<span class="highlight">____</span>';
                break;
              }
            } else if (defaultValue.includes('{{')) {
              let processedDefault = defaultValue;
              let innerIterations = 0;
              while (processedDefault.includes('{{') && innerIterations < 5) {
                processedDefault = processedDefault.replace(/\{\{([^}]+)\}\}/g, (match, innerExpr) => {
                  const innerResult = processExpression(innerExpr.trim());
                  return innerResult.replace(/<span class="highlight">|<\/span>/g, '');
                });
                innerIterations++;
              }
              if (!foundValue) {
                result = processedDefault;
                break;
              }
            } else {
              if (!foundValue) {
                result = `<span class="highlight">${defaultValue}</span>`;
                break;
              }
            }
          }
        }
        
        if (result) {
          return result;
        }
      } else if (expr.startsWith('datos.')) {
        const fieldMatch = expr.match(/datos\.(\w+)/);
        if (fieldMatch) {
          const field = fieldMatch[1];
          const value = this.datos[field];
          if (value === undefined || value === null || value === '') {
            return '<span class="highlight">____</span>';
          }
          if (field === 'projectName') {
            return `<span class="highlight">${this.capitalizarTexto(value)}</span>`;
          }
          return `<span class="highlight">${value}</span>`;
        }
      }
      
      return expr;
    };
    
    let iterations = 0;
    let previousTemplate = '';
    while (template !== previousTemplate && iterations < 10) {
      previousTemplate = template;
      template = template.replace(/\{\{([^}]+)\}\}/g, (match, expr) => {
        const result = processExpression(expr.trim());
        if (result && result.includes('{{')) {
          return result;
        }
        return result;
      });
      iterations++;
    }
    
    template = this.procesarTablaAISD2(template);
    template = this.procesarTablaInstituciones(template);
    template = this.procesarFotografiasDinamicas(template);
    template = this.quitarHighlightDeNumeros(template);
    
    return template;
  }

  procesarTablaInstituciones(template: string): string {
    if (!template.includes('A.1.1. Institucionalidad local')) {
      return template;
    }
    
    const textoPattern = /(<h5>A\.1\.1\. Institucionalidad local<\/h5>[\s\S]*?<p class="text-justify">)([\s\S]*?)(<\/p>)/;
    const textoMatch = template.match(textoPattern);
    
    if (textoMatch) {
      const textoInstitucionalidad = this.datos['textoInstitucionalidad'] || '';
      let textoHTML = '';
      
      if (textoInstitucionalidad && textoInstitucionalidad !== '____' && textoInstitucionalidad !== '') {
        textoHTML = textoInstitucionalidad;
      } else {
        const existingText = textoMatch[2].replace(/<span class="highlight">|<\/span>/g, '').trim();
        if (existingText === '____' || existingText === '' || textoMatch[2].includes('<span class="highlight">____</span>')) {
          textoHTML = '____';
        } else {
          textoHTML = textoMatch[2];
        }
      }
      
      template = template.replace(textoPattern, textoMatch[1] + textoHTML + textoMatch[3]);
    }
    
    const tituloTabla = this.datos['tituloInstituciones'] || 'Instituciones existentes – CC ' + (this.datos['grupoAISD'] || 'Ayroca');
    const tituloPattern = /(<p class="table-title">Cuadro N° 3\. 4<\/p>[\s\S]*?<p class="table-title-main">)([\s\S]*?)(<\/p>)/;
    const tituloMatch = template.match(tituloPattern);
    if (tituloMatch) {
      template = template.replace(tituloPattern, tituloMatch[1] + tituloTabla + tituloMatch[3]);
    }
    
    const tablaPattern = /(<p class="table-title">Cuadro N° 3\. 4<\/p>[\s\S]*?<table class="table-container">[\s\S]*?<thead>[\s\S]*?Categoría[\s\S]*?<\/thead>[\s\S]*?<tbody>)([\s\S]*?)(<\/tbody>[\s\S]*?<\/table>)/;
    const match = template.match(tablaPattern);
    
    if (match) {
      const instituciones = this.datos['tablepagina6'] || [];
      let filasHTML = '';
      
      if (instituciones.length > 0) {
        instituciones.forEach((inst: any) => {
          const categoria = inst.categoria || '____';
          const respuesta = inst.respuesta || '____';
          const nombre = inst.nombre || '____';
          const comentario = inst.comentario || '____';
          
          const categoriaHTML = categoria !== '____' && categoria !== '–' ? `<span class="highlight">${categoria}</span>` : (categoria === '–' ? '–' : '____');
          const respuestaHTML = respuesta !== '____' && respuesta !== '–' ? `<span class="highlight">${respuesta}</span>` : (respuesta === '–' ? '–' : '____');
          const nombreHTML = (nombre !== '____' && nombre !== '–' && nombre !== '') ? `<span class="highlight">${nombre}</span>` : (nombre === '–' ? '–' : '____');
          const comentarioHTML = (comentario !== '____' && comentario !== '–' && comentario !== '') ? `<span class="highlight">${comentario}</span>` : (comentario === '–' ? '–' : '____');
          
          filasHTML += `
            <tr>
                <td class="table-cell">${categoriaHTML}</td>
                <td class="table-cell">${respuestaHTML}</td>
                <td class="table-cell">${nombreHTML}</td>
                <td class="table-cell">${comentarioHTML}</td>
            </tr>`;
        });
      } else {
        filasHTML = `
            <tr>
                <td class="table-cell">____</td>
                <td class="table-cell">____</td>
                <td class="table-cell">____</td>
                <td class="table-cell">____</td>
            </tr>`;
      }
      
      template = template.replace(tablaPattern, match[1] + filasHTML + match[3]);
    }
    
    const fuentePattern = /(<p class="source">Fuente:)([\s\S]*?)(<\/p>)/;
    const fuenteMatch = template.match(fuentePattern);
    
    if (fuenteMatch && template.includes('Cuadro N° 3. 4')) {
      const fuenteInstituciones = this.datos['fuenteInstituciones'] || '';
      let fuenteHTML = '';
      
      if (fuenteInstituciones && fuenteInstituciones !== '____' && fuenteInstituciones !== '') {
        fuenteHTML = `<span class="highlight">${fuenteInstituciones}</span>`;
      } else {
        const existingFuente = fuenteMatch[2].replace(/<span class="highlight">|<\/span>/g, '').trim();
        if (existingFuente === '____' || existingFuente === '' || fuenteMatch[2].includes('<span class="highlight">____</span>')) {
          fuenteHTML = '____';
        } else {
          fuenteHTML = fuenteMatch[2];
        }
      }
      
      template = template.replace(fuentePattern, fuenteMatch[1] + fuenteHTML + fuenteMatch[3]);
    }
    
    const a11Index = template.indexOf('A.1.1. Institucionalidad local');
    if (a11Index !== -1) {
      const sectionEnd = template.indexOf('<!-- SECTION:3.1.4.A.1.2:START -->', a11Index);
      const sectionContent = sectionEnd !== -1 ? template.substring(a11Index, sectionEnd) : template.substring(a11Index);
      
      const fotoPattern = /(<div class="image-gallery">[\s\S]*?<div class="image-item">[\s\S]*?<p class="text-center"><strong>Fotografía N° ____<\/strong><\/p>[\s\S]*?<p class="text-center">[\s\S]*?<\/p>[\s\S]*?<p class="text-center"[\s\S]*?style="font-size: 0\.9em; margin-top: 5px;">FUENTE: [\s\S]*?<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>)/;
      const fotoMatch = sectionContent.match(fotoPattern);
      
      if (fotoMatch) {
        const foto3Titulo = this.datos['fotografiaAISD3Titulo'] || '';
        const foto3Fuente = this.datos['fotografiaAISD3Fuente'] || '';
        const foto3Imagen = this.datos['fotografiaAISD3Imagen'] || '';
        
        let fotoHTML = '<div class="image-gallery">';
        fotoHTML += '<div class="image-item">';
        fotoHTML += '<p class="text-center"><strong>Fotografía N° 3. 3</strong></p>';
        
        if (foto3Titulo && foto3Titulo !== '____' && foto3Titulo !== '') {
          fotoHTML += `<p class="text-center"><span class="highlight">${foto3Titulo}</span></p>`;
        } else {
          fotoHTML += '<p class="text-center">____</p>';
        }
        
        if (foto3Imagen) {
          fotoHTML += `<div style="width: 100%; display: flex; align-items: center; justify-content: center;">
            <img src="${foto3Imagen}" style="max-width: 100%; max-height: 400px; border-radius: 8px;" alt="Fotografía">
          </div>`;
        }
        
        if (foto3Fuente && foto3Fuente !== '____' && foto3Fuente !== '') {
          fotoHTML += `<p class="text-center" style="font-size: 0.9em; margin-top: 5px;">FUENTE: ${foto3Fuente}</p>`;
        } else {
          fotoHTML += '<p class="text-center" style="font-size: 0.9em; margin-top: 5px;">FUENTE: ____</p>';
        }
        
        fotoHTML += '</div>';
        fotoHTML += '</div>';
        
        template = template.substring(0, a11Index) + sectionContent.replace(fotoPattern, fotoHTML) + (sectionEnd !== -1 ? template.substring(sectionEnd) : '');
      }
    }
    
    return template;
  }

  procesarTablaAISD2(template: string): string {
    const tablaPattern = /(<table class="table-container">[\s\S]*?<thead>[\s\S]*?Punto de Población \(INEI\)[\s\S]*?<\/thead>[\s\S]*?<tbody>)([\s\S]*?<tr>[\s\S]*?<th class="table-header">Total<\/th>[\s\S]*?<\/tr>)([\s\S]*?<\/tbody>[\s\S]*?<\/table>)/;
    const match = template.match(tablaPattern);
    
    if (!match) {
      return template;
    }
    
    const filasActivas = this.formularioService.obtenerFilasActivasTablaAISD2();
    let filasHTML = '';
    
    for (let i = 1; i <= this.filasTablaAISD2; i++) {
      const punto = this.datos[`tablaAISD2Fila${i}Punto`] || '';
      const codigo = this.datos[`tablaAISD2Fila${i}Codigo`] || '';
      const poblacion = this.datos[`tablaAISD2Fila${i}Poblacion`] || '';
      const viviendasEmp = this.datos[`tablaAISD2Fila${i}ViviendasEmpadronadas`] || '';
      const viviendasOcp = this.datos[`tablaAISD2Fila${i}ViviendasOcupadas`] || '';
      
      const codigoStr = codigo.toString().trim();
      const esFilaActiva = filasActivas.length === 0 || filasActivas.includes(codigoStr);
      
      if (esFilaActiva && (punto || codigo || poblacion || viviendasEmp || viviendasOcp)) {
        filasHTML += `
            <tr>
                <td class="table-cell"><span class="highlight">${punto || '____'}</span></td>
                <td class="table-cell"><span class="highlight">${codigo || '____'}</span></td>
                <td class="table-cell"><span class="highlight">${poblacion || '____'}</span></td>
                <td class="table-cell"><span class="highlight">${viviendasEmp || '____'}</span></td>
                <td class="table-cell"><span class="highlight">${viviendasOcp || '____'}</span></td>
            </tr>`;
      }
    }
    
    if (!filasHTML) {
      filasHTML = `
            <tr>
                <td class="table-cell"><span class="highlight">____</span></td>
                <td class="table-cell"><span class="highlight">____</span></td>
                <td class="table-cell"><span class="highlight">____</span></td>
                <td class="table-cell"><span class="highlight">____</span></td>
                <td class="table-cell"><span class="highlight">____</span></td>
            </tr>`;
    }
    
    const totalPoblacion = this.datos['tablaAISD2TotalPoblacion'] || '____';
    const totalViviendasEmp = this.datos['tablaAISD2TotalViviendasEmpadronadas'] || '____';
    const totalViviendasOcp = this.datos['tablaAISD2TotalViviendasOcupadas'] || '____';
    
    const filaTotal = `
            <tr>
                <th class="table-header">Total</th>
                <th class="table-header"></th>
                <th class="table-header"><span class="highlight">${totalPoblacion}</span></th>
                <th class="table-header"><span class="highlight">${totalViviendasEmp}</span></th>
                <th class="table-header"><span class="highlight">${totalViviendasOcp}</span></th>
            </tr>`;
    
    return template.replace(tablaPattern, match[1] + filasHTML + filaTotal + match[3]);
  }

  quitarHighlightDeNumeros(template: string): string {
    template = template.replace(/<span class="highlight">(Cuadro N° [\d\.\s]+)<\/span>/gi, 'Cuadro N° $1');
    template = template.replace(/Cuadro N° <span class="highlight">([\d\.\s]+)<\/span>/gi, 'Cuadro N° $1');
    template = template.replace(/<span class="highlight">(Fotografía N° [\d\.\s]+)<\/span>/gi, 'Fotografía N° $1');
    template = template.replace(/Fotografía N° <span class="highlight">([\d\.\s]+)<\/span>/gi, 'Fotografía N° $1');
    template = template.replace(/<strong><span class="highlight">(Fotografía N° [\d\.\s]+)<\/span><\/strong>/gi, '<strong>Fotografía N° $1</strong>');
    template = template.replace(/<strong>Fotografía N° <span class="highlight">([\d\.\s]+)<\/span><\/strong>/gi, '<strong>Fotografía N° $1</strong>');
    template = template.replace(/<p class="table-title"><span class="highlight">(Cuadro N° [\d\.\s]+)<\/span><\/p>/gi, '<p class="table-title">Cuadro N° $1</p>');
    template = template.replace(/<p class="table-title">Cuadro N° <span class="highlight">([\d\.\s]+)<\/span><\/p>/gi, '<p class="table-title">Cuadro N° $1</p>');
    template = template.replace(/<p class="text-center"><strong><span class="highlight">(Fotografía N° [\d\.\s]+)<\/span><\/strong><\/p>/gi, '<p class="text-center"><strong>Fotografía N° $1</strong></p>');
    template = template.replace(/<p class="text-center"><strong>Fotografía N° <span class="highlight">([\d\.\s]+)<\/span><\/strong><\/p>/gi, '<p class="text-center"><strong>Fotografía N° $1</strong></p>');
    
    const imageGalleryPattern = /<div class="image-gallery">[\s\S]*?<\/div>/g;
    template = template.replace(imageGalleryPattern, (match) => {
      const fuentes = match.match(/FUENTE:/g);
      if (fuentes && fuentes.length > 1) {
        let resultado = match;
        let primeraFuente = resultado.indexOf('FUENTE:');
        let siguienteFuente = resultado.indexOf('FUENTE:', primeraFuente + 1);
        while (siguienteFuente !== -1) {
          const antes = resultado.substring(0, siguienteFuente);
          const despues = resultado.substring(siguienteFuente + 7);
          resultado = antes + despues;
          siguienteFuente = resultado.indexOf('FUENTE:', primeraFuente + 1);
        }
        return resultado;
      }
      return match;
    });
    
    return template;
  }

  procesarFotografiasDinamicas(template: string): string {
    const startPattern = /<div class="image-gallery">/g;
    let lastIndex = 0;
    let result = '';
    
    while (true) {
      const startMatch = startPattern.exec(template);
      if (!startMatch) break;
      
      const beforeMatch = template.substring(0, startMatch.index);
      const isA11Section = beforeMatch.includes('A.1.1. Institucionalidad local') && beforeMatch.includes('Cuadro N° 3. 4');
      
      if (isA11Section) {
        result += template.substring(lastIndex, startMatch.index);
        let depth = 1;
        let i = startMatch.index + startMatch[0].length;
        
        while (i < template.length && depth > 0) {
          if (template.substring(i, i + 4) === '<div') {
            depth++;
            i += 4;
          } else if (template.substring(i, i + 6) === '</div>') {
            depth--;
            if (depth === 0) {
              i += 6;
              break;
            }
            i += 6;
          } else {
            i++;
          }
        }
        
        result += template.substring(startMatch.index, i);
        lastIndex = i;
        continue;
      }
      
      result += template.substring(lastIndex, startMatch.index);
      
      let depth = 1;
      let i = startMatch.index + startMatch[0].length;
      
      while (i < template.length && depth > 0) {
        if (template.substring(i, i + 4) === '<div') {
          depth++;
          i += 4;
        } else if (template.substring(i, i + 6) === '</div>') {
          depth--;
          if (depth === 0) {
            i += 6;
            break;
          }
          i += 6;
        } else {
          i++;
        }
      }
      
      const fotografias = this.getFotografiasAISD();
      if (fotografias.length > 0) {
        let html = '<div class="image-gallery">';
        fotografias.forEach((foto, idx) => {
          html += `
            <div class="image-item">
              <p class="text-center"><strong>Fotografía N° 3. ${idx + 1}</strong></p>
              <p class="text-center">${foto.titulo || 'Título de fotografía'}</p>
              <div style="width: 100%; display: flex; align-items: center; justify-content: center;">
                <img src="${foto.preview}" style="max-width: 100%; max-height: 400px; border-radius: 8px;" alt="Fotografía">
              </div>
              <p class="text-center" style="font-size: 0.9em; margin-top: 5px;">FUENTE: ${foto.fuente || 'GEADES, 2024'}</p>
            </div>
          `;
        });
        html += '</div>';
        result += html;
      }
      
      lastIndex = i;
    }
    
    result += template.substring(lastIndex);
    return result;
  }

  getFotografiasAISD(): any[] {
    const fotos: any[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const titulo = this.datos?.[`fotografiaAISD${i}Titulo`];
      const fuente = this.datos?.[`fotografiaAISD${i}Fuente`];
      const imagen = this.datos?.[`fotografiaAISD${i}Imagen`];
      
      if (imagen) {
        fotos.push({
          numero: i,
          titulo: titulo || 'Título de fotografía',
          fuente: fuente || 'GEADES, 2024',
          preview: imagen
        });
      }
    }
    
    return fotos;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
    
    if (!this.scrollRealizado && this.sectionTemplate) {
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
    if (!texto || texto === '____' || texto === '...') return '____';
    let resultado = this.capitalizarTexto(texto.trim());
    
    if (conArticulo) {
      if (/^el proyecto /i.test(resultado)) {
        return resultado.charAt(0).toUpperCase() + resultado.slice(1);
      }
      else if (/^proyecto /i.test(resultado)) {
        return 'El ' + resultado.charAt(0).toUpperCase() + resultado.slice(1);
      }
      else {
        return 'El Proyecto ' + resultado;
      }
    } else {
      return resultado;
    }
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
      '3.1.4',
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
      '3.1.4.B.1.15'
    ];
  }

  actualizarEstadoNavegacion() {
    const secciones = this.obtenerTodasLasSecciones();
    const index = secciones.indexOf(this.seccionId);
    this.puedeIrAnterior = index > 0;
    
    if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId === '3.1.4.A.1') {
      const siguienteIndex = secciones.indexOf('3.1.4.A.1.1');
      this.puedeIrSiguiente = siguienteIndex !== -1;
    } else {
      this.puedeIrSiguiente = index < secciones.length - 1;
    }
  }

  seccionAnterior() {
    const secciones = this.obtenerTodasLasSecciones();
    const index = secciones.indexOf(this.seccionId);
    if (index > 0) {
      this.router.navigate(['/seccion', secciones[index - 1]]);
    }
  }

  seccionSiguiente() {
    if (this.seccionId === '3.1.4' || this.seccionId === '3.1.4.A' || this.seccionId === '3.1.4.A.1') {
      this.router.navigate(['/seccion', '3.1.4.A.1.1']);
      return;
    }
    
    const secciones = this.obtenerTodasLasSecciones();
    const index = secciones.indexOf(this.seccionId);
    if (index < secciones.length - 1) {
      this.router.navigate(['/seccion', secciones[index + 1]]);
    }
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
    if (!this.datos.condicionOcupacionTabla || this.datos.condicionOcupacionTabla.length === 0) {
      const totalEmpadronadas = parseInt(this.datos['tablaAISD2TotalViviendasEmpadronadas'] || '0') || 0;
      const totalOcupadas = parseInt(this.datos['tablaAISD2TotalViviendasOcupadas'] || '0') || 0;
      const otrasCondiciones = totalEmpadronadas - totalOcupadas;
      
      const porcentajeOcupadas = totalEmpadronadas > 0 
        ? ((totalOcupadas / totalEmpadronadas) * 100).toFixed(2).replace('.', ',') + ' %' 
        : '0 %';
      const porcentajeOtras = totalEmpadronadas > 0 
        ? ((otrasCondiciones / totalEmpadronadas) * 100).toFixed(2).replace('.', ',') + ' %' 
        : '0 %';
      
      this.datos.condicionOcupacionTabla = [
        { categoria: 'Viviendas ocupadas', casos: totalOcupadas, porcentaje: porcentajeOcupadas },
        { categoria: 'Viviendas con otra condición', casos: otrasCondiciones, porcentaje: porcentajeOtras },
        { categoria: 'Total', casos: totalEmpadronadas, porcentaje: '100,00 %' }
      ];
      this.formularioService.actualizarDato('condicionOcupacionTabla', this.datos.condicionOcupacionTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarCondicionOcupacion() {
    if (!this.datos.condicionOcupacionTabla) {
      this.inicializarCondicionOcupacion();
    }
    const totalIndex = this.datos.condicionOcupacionTabla.findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos.condicionOcupacionTabla.splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos.condicionOcupacionTabla.push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('condicionOcupacionTabla', this.datos.condicionOcupacionTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCondicionOcupacion(index: number) {
    if (this.datos.condicionOcupacionTabla && this.datos.condicionOcupacionTabla.length > 1 && this.datos.condicionOcupacionTabla[index].categoria !== 'Total') {
      this.datos.condicionOcupacionTabla.splice(index, 1);
      this.formularioService.actualizarDato('condicionOcupacionTabla', this.datos.condicionOcupacionTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarCondicionOcupacion(index: number, field: string, value: any) {
    if (!this.datos.condicionOcupacionTabla) {
      this.inicializarCondicionOcupacion();
    }
    if (this.datos.condicionOcupacionTabla[index]) {
      this.datos.condicionOcupacionTabla[index][field] = value;
      if (field === 'casos' && this.datos.condicionOcupacionTabla[index].categoria !== 'Total') {
        const totalCasos = this.datos.condicionOcupacionTabla
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos.condicionOcupacionTabla.find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          totalItem.porcentaje = '100,00 %';
        }
      }
      this.formularioService.actualizarDato('condicionOcupacionTabla', this.datos.condicionOcupacionTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarTiposMateriales() {
    if (!this.datos.tiposMaterialesTabla || this.datos.tiposMaterialesTabla.length === 0) {
      this.datos.tiposMaterialesTabla = [
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
      this.formularioService.actualizarDato('tiposMaterialesTabla', this.datos.tiposMaterialesTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarTiposMateriales() {
    if (!this.datos.tiposMaterialesTabla) {
      this.inicializarTiposMateriales();
    }
    const totalIndex = this.datos.tiposMaterialesTabla.findIndex((item: any) => item.tipoMaterial === 'Total');
    if (totalIndex >= 0) {
      this.datos.tiposMaterialesTabla.splice(totalIndex, 0, { categoria: '', tipoMaterial: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos.tiposMaterialesTabla.push({ categoria: '', tipoMaterial: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('tiposMaterialesTabla', this.datos.tiposMaterialesTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarTiposMateriales(index: number) {
    if (this.datos.tiposMaterialesTabla && this.datos.tiposMaterialesTabla.length > 1 && this.datos.tiposMaterialesTabla[index].tipoMaterial !== 'Total') {
      this.datos.tiposMaterialesTabla.splice(index, 1);
      this.formularioService.actualizarDato('tiposMaterialesTabla', this.datos.tiposMaterialesTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarTiposMateriales(index: number, field: string, value: any) {
    if (!this.datos.tiposMaterialesTabla) {
      this.inicializarTiposMateriales();
    }
    if (this.datos.tiposMaterialesTabla[index]) {
      this.datos.tiposMaterialesTabla[index][field] = value;
      this.formularioService.actualizarDato('tiposMaterialesTabla', this.datos.tiposMaterialesTabla);
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
    if (!this.datos.abastecimientoAguaTabla || this.datos.abastecimientoAguaTabla.length === 0) {
      this.datos.abastecimientoAguaTabla = [
        { categoria: 'Viviendas con abastecimiento de agua por red pública', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas con abastecimiento de agua por pilón', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas sin abastecimiento de agua por los medios mencionados', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('abastecimientoAguaTabla', this.datos.abastecimientoAguaTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarAbastecimientoAgua() {
    if (!this.datos.abastecimientoAguaTabla) {
      this.inicializarAbastecimientoAgua();
    }
    const totalIndex = this.datos.abastecimientoAguaTabla.findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos.abastecimientoAguaTabla.splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos.abastecimientoAguaTabla.push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('abastecimientoAguaTabla', this.datos.abastecimientoAguaTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarAbastecimientoAgua(index: number) {
    if (this.datos.abastecimientoAguaTabla && this.datos.abastecimientoAguaTabla.length > 1 && this.datos.abastecimientoAguaTabla[index].categoria !== 'Total') {
      this.datos.abastecimientoAguaTabla.splice(index, 1);
      this.formularioService.actualizarDato('abastecimientoAguaTabla', this.datos.abastecimientoAguaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarAbastecimientoAgua(index: number, field: string, value: any) {
    if (!this.datos.abastecimientoAguaTabla) {
      this.inicializarAbastecimientoAgua();
    }
    if (this.datos.abastecimientoAguaTabla[index]) {
      this.datos.abastecimientoAguaTabla[index][field] = value;
      if (field === 'casos' && this.datos.abastecimientoAguaTabla[index].categoria !== 'Total') {
        const totalCasos = this.datos.abastecimientoAguaTabla
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos.abastecimientoAguaTabla.find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          totalItem.porcentaje = '100,00 %';
        }
      }
      this.formularioService.actualizarDato('abastecimientoAguaTabla', this.datos.abastecimientoAguaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarTiposSaneamiento() {
    if ((!this.datos.tiposSaneamientoTabla || this.datos.tiposSaneamientoTabla.length === 0) && (!this.datos.saneamientoTabla || this.datos.saneamientoTabla.length === 0)) {
      this.datos.tiposSaneamientoTabla = [
        { categoria: 'Viviendas con saneamiento vía red pública', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas con saneamiento vía pozo séptico', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas sin saneamiento vía los medios mencionados', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('tiposSaneamientoTabla', this.datos.tiposSaneamientoTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarTiposSaneamiento() {
    if (!this.datos.tiposSaneamientoTabla && !this.datos.saneamientoTabla) {
      this.inicializarTiposSaneamiento();
    }
    const tabla = this.datos.tiposSaneamientoTabla || this.datos.saneamientoTabla;
    if (tabla) {
      const totalIndex = tabla.findIndex((item: any) => item.categoria === 'Total');
      if (totalIndex >= 0) {
        tabla.splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
      } else {
        tabla.push({ categoria: '', casos: 0, porcentaje: '0%' });
      }
      const key = this.datos.tiposSaneamientoTabla ? 'tiposSaneamientoTabla' : 'saneamientoTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  eliminarTiposSaneamiento(index: number) {
    const tabla = this.datos.tiposSaneamientoTabla || this.datos.saneamientoTabla;
    if (tabla && tabla.length > 1 && tabla[index].categoria !== 'Total') {
      tabla.splice(index, 1);
      const key = this.datos.tiposSaneamientoTabla ? 'tiposSaneamientoTabla' : 'saneamientoTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarTiposSaneamiento(index: number, field: string, value: any) {
    if (!this.datos.tiposSaneamientoTabla && !this.datos.saneamientoTabla) {
      this.inicializarTiposSaneamiento();
    }
    const tabla = this.datos.tiposSaneamientoTabla || this.datos.saneamientoTabla;
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
      const key = this.datos.tiposSaneamientoTabla ? 'tiposSaneamientoTabla' : 'saneamientoTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarCoberturaElectrica() {
    if (!this.datos.coberturaElectricaTabla || this.datos.coberturaElectricaTabla.length === 0) {
      this.datos.coberturaElectricaTabla = [
        { categoria: 'Viviendas con acceso a electricidad', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas sin acceso a electricidad', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('coberturaElectricaTabla', this.datos.coberturaElectricaTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarCoberturaElectrica() {
    if (!this.datos.coberturaElectricaTabla) {
      this.inicializarCoberturaElectrica();
    }
    const totalIndex = this.datos.coberturaElectricaTabla.findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos.coberturaElectricaTabla.splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos.coberturaElectricaTabla.push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('coberturaElectricaTabla', this.datos.coberturaElectricaTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCoberturaElectrica(index: number) {
    if (this.datos.coberturaElectricaTabla && this.datos.coberturaElectricaTabla.length > 1 && this.datos.coberturaElectricaTabla[index].categoria !== 'Total') {
      this.datos.coberturaElectricaTabla.splice(index, 1);
      this.formularioService.actualizarDato('coberturaElectricaTabla', this.datos.coberturaElectricaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarCoberturaElectrica(index: number, field: string, value: any) {
    if (!this.datos.coberturaElectricaTabla) {
      this.inicializarCoberturaElectrica();
    }
    if (this.datos.coberturaElectricaTabla[index]) {
      this.datos.coberturaElectricaTabla[index][field] = value;
      if (field === 'casos' && this.datos.coberturaElectricaTabla[index].categoria !== 'Total') {
        const totalCasos = this.datos.coberturaElectricaTabla
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos.coberturaElectricaTabla.find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          totalItem.porcentaje = '100,00 %';
        }
      }
      this.formularioService.actualizarDato('coberturaElectricaTabla', this.datos.coberturaElectricaTabla);
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
    if (!this.datos.telecomunicacionesTabla || this.datos.telecomunicacionesTabla.length === 0) {
      this.datos.telecomunicacionesTabla = [
        { medio: 'Emisoras de radio', descripcion: '--' },
        { medio: 'Señales de televisión', descripcion: 'América TV\nDIRECTV' },
        { medio: 'Señales de telefonía móvil', descripcion: 'Movistar\nEntel' },
        { medio: 'Señal de Internet', descripcion: 'Movistar' }
      ];
      this.formularioService.actualizarDato('telecomunicacionesTabla', this.datos.telecomunicacionesTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarTelecomunicaciones() {
    if (!this.datos.telecomunicacionesTabla) {
      this.inicializarTelecomunicaciones();
    }
    this.datos.telecomunicacionesTabla.push({ medio: '', descripcion: '' });
    this.formularioService.actualizarDato('telecomunicacionesTabla', this.datos.telecomunicacionesTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarTelecomunicaciones(index: number) {
    if (this.datos.telecomunicacionesTabla && this.datos.telecomunicacionesTabla.length > 1) {
      this.datos.telecomunicacionesTabla.splice(index, 1);
      this.formularioService.actualizarDato('telecomunicacionesTabla', this.datos.telecomunicacionesTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarTelecomunicaciones(index: number, field: string, value: any) {
    if (!this.datos.telecomunicacionesTabla) {
      this.inicializarTelecomunicaciones();
    }
    if (this.datos.telecomunicacionesTabla[index]) {
      this.datos.telecomunicacionesTabla[index][field] = value;
      this.formularioService.actualizarDato('telecomunicacionesTabla', this.datos.telecomunicacionesTabla);
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
    if (!this.datos.caracteristicasSaludTabla || this.datos.caracteristicasSaludTabla.length === 0) {
      this.datos.caracteristicasSaludTabla = [
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
      this.formularioService.actualizarDato('caracteristicasSaludTabla', this.datos.caracteristicasSaludTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarCaracteristicasSalud() {
    if (!this.datos.caracteristicasSaludTabla) {
      this.inicializarCaracteristicasSalud();
    }
    this.datos.caracteristicasSaludTabla.push({ categoria: '', descripcion: '' });
    this.formularioService.actualizarDato('caracteristicasSaludTabla', this.datos.caracteristicasSaludTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCaracteristicasSalud(index: number) {
    if (this.datos.caracteristicasSaludTabla && this.datos.caracteristicasSaludTabla.length > 1) {
      this.datos.caracteristicasSaludTabla.splice(index, 1);
      this.formularioService.actualizarDato('caracteristicasSaludTabla', this.datos.caracteristicasSaludTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarCaracteristicasSalud(index: number, field: string, value: any) {
    if (!this.datos.caracteristicasSaludTabla) {
      this.inicializarCaracteristicasSalud();
    }
    if (this.datos.caracteristicasSaludTabla[index]) {
      this.datos.caracteristicasSaludTabla[index][field] = value;
      this.formularioService.actualizarDato('caracteristicasSaludTabla', this.datos.caracteristicasSaludTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarCantidadEstudiantesEducacion() {
    if (!this.datos.cantidadEstudiantesEducacionTabla || this.datos.cantidadEstudiantesEducacionTabla.length === 0) {
      this.datos.cantidadEstudiantesEducacionTabla = [
        { institucion: 'IE Ayroca', nivel: 'Inicial - Jardín', gestion: 'Pública de gestión directa', total: 0, porcentaje: '0%' },
        { institucion: 'IE N°40270', nivel: 'Primaria', gestion: 'Pública de gestión directa', total: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('cantidadEstudiantesEducacionTabla', this.datos.cantidadEstudiantesEducacionTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarCantidadEstudiantesEducacion() {
    if (!this.datos.cantidadEstudiantesEducacionTabla) {
      this.inicializarCantidadEstudiantesEducacion();
    }
    this.datos.cantidadEstudiantesEducacionTabla.push({ institucion: '', nivel: '', gestion: '', total: 0, porcentaje: '0%' });
    this.formularioService.actualizarDato('cantidadEstudiantesEducacionTabla', this.datos.cantidadEstudiantesEducacionTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCantidadEstudiantesEducacion(index: number) {
    if (this.datos.cantidadEstudiantesEducacionTabla && this.datos.cantidadEstudiantesEducacionTabla.length > 1) {
      this.datos.cantidadEstudiantesEducacionTabla.splice(index, 1);
      this.formularioService.actualizarDato('cantidadEstudiantesEducacionTabla', this.datos.cantidadEstudiantesEducacionTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarCantidadEstudiantesEducacion(index: number, field: string, value: any) {
    if (!this.datos.cantidadEstudiantesEducacionTabla) {
      this.inicializarCantidadEstudiantesEducacion();
    }
    if (this.datos.cantidadEstudiantesEducacionTabla[index]) {
      this.datos.cantidadEstudiantesEducacionTabla[index][field] = value;
      this.formularioService.actualizarDato('cantidadEstudiantesEducacionTabla', this.datos.cantidadEstudiantesEducacionTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarIEAyroca() {
    if (!this.datos.ieAyrocaTabla || this.datos.ieAyrocaTabla.length === 0) {
      this.datos.ieAyrocaTabla = [
        { categoria: 'Tipo de I.E.', descripcion: 'Pública de gestión directa, mixta' },
        { categoria: 'Nombre del(la) director(a)', descripcion: 'María Elena Aguayo Arias' },
        { categoria: 'Características y observaciones', descripcion: '• La institución educativa data del año 1989, aproximadamente.\n• La directora de la institución es a la vez profesora de los alumnos (unidocente). Se dispone de una sola aula.\n• El establecimiento cuenta con los servicios básicos de agua, desagüe y electricidad.\n• No tiene acceso a Internet.\n• Se clasifican los residuos sólidos, pero estos no son recolectados frecuentemente por la municipalidad.\n• La infraestructura consta de material noble en las paredes, calamina en los techos y mayólica en los pisos.\n• Se cuenta con el ambiente para la cocina y el comedor, pero hace falta la implementación del mismo.\n• No se cuenta con una biblioteca, por lo que se improvisa con un pequeño estante.\n• Los juegos recreativos de la institución se encuentran en condiciones precarias, puesto que se hallan oxidados.\n• Se halla una pequeña losa deportiva de cemento para que los alumnos puedan desarrollar actividad física.' }
      ];
      this.formularioService.actualizarDato('ieAyrocaTabla', this.datos.ieAyrocaTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarIEAyroca() {
    if (!this.datos.ieAyrocaTabla) {
      this.inicializarIEAyroca();
    }
    this.datos.ieAyrocaTabla.push({ categoria: '', descripcion: '' });
    this.formularioService.actualizarDato('ieAyrocaTabla', this.datos.ieAyrocaTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarIEAyroca(index: number) {
    if (this.datos.ieAyrocaTabla && this.datos.ieAyrocaTabla.length > 1) {
      this.datos.ieAyrocaTabla.splice(index, 1);
      this.formularioService.actualizarDato('ieAyrocaTabla', this.datos.ieAyrocaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarIEAyroca(index: number, field: string, value: any) {
    if (!this.datos.ieAyrocaTabla) {
      this.inicializarIEAyroca();
    }
    if (this.datos.ieAyrocaTabla[index]) {
      this.datos.ieAyrocaTabla[index][field] = value;
      this.formularioService.actualizarDato('ieAyrocaTabla', this.datos.ieAyrocaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarIE40270() {
    if (!this.datos.ie40270Tabla || this.datos.ie40270Tabla.length === 0) {
      this.datos.ie40270Tabla = [
        { categoria: 'Tipo de I.E.', descripcion: 'Pública de gestión directa, mixta' },
        { categoria: 'Nombre del(la) director(a)', descripcion: 'Nieves Bernaola Torres' },
        { categoria: 'Características y observaciones', descripcion: '• Se tiene en funcionamiento dos aulas, cada una es dirigida por una docente. Una de ellas es, a la vez, directora de la institución educativa.\n• La infraestructura de las aulas consta principalmente de material noble en las paredes, calamina en los techos y mayólica en los pisos.\n• La institución cuenta con los servicios básicos de agua, desagüe y electricidad.\n• No tiene acceso a Internet.\n• Se cuenta con una cocina y un comedor, en un solo ambiente compartido.\n• No tiene biblioteca propia, por lo que se ha improvisado con estantes.\n• No se cuenta con una sala de computación, aunque si se posee tabletas electrónicas.\n• Los juegos recreativos de la institución se encuentran en condiciones precarias, puesto que se hallan oxidados.\n• Se halla una losa deportiva de cemento para que los alumnos puedan desarrollar actividad física.' }
      ];
      this.formularioService.actualizarDato('ie40270Tabla', this.datos.ie40270Tabla);
      this.cdRef.detectChanges();
    }
  }

  agregarIE40270() {
    if (!this.datos.ie40270Tabla) {
      this.inicializarIE40270();
    }
    this.datos.ie40270Tabla.push({ categoria: '', descripcion: '' });
    this.formularioService.actualizarDato('ie40270Tabla', this.datos.ie40270Tabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarIE40270(index: number) {
    if (this.datos.ie40270Tabla && this.datos.ie40270Tabla.length > 1) {
      this.datos.ie40270Tabla.splice(index, 1);
      this.formularioService.actualizarDato('ie40270Tabla', this.datos.ie40270Tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarIE40270(index: number, field: string, value: any) {
    if (!this.datos.ie40270Tabla) {
      this.inicializarIE40270();
    }
    if (this.datos.ie40270Tabla[index]) {
      this.datos.ie40270Tabla[index][field] = value;
      this.formularioService.actualizarDato('ie40270Tabla', this.datos.ie40270Tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarAlumnosIEAyroca() {
    if (!this.datos.alumnosIEAyrocaTabla || this.datos.alumnosIEAyrocaTabla.length === 0) {
      this.datos.alumnosIEAyrocaTabla = [
        { nombre: 'IE Ayroca', nivel: 'Inicial – Jardín', totalH: 0, totalM: 0, tresH: 0, tresM: 0, cuatroH: 0, cuatroM: 0, cincoH: 0, cincoM: 0 }
      ];
      this.formularioService.actualizarDato('alumnosIEAyrocaTabla', this.datos.alumnosIEAyrocaTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarAlumnosIEAyroca() {
    if (!this.datos.alumnosIEAyrocaTabla) {
      this.inicializarAlumnosIEAyroca();
    }
    this.datos.alumnosIEAyrocaTabla.push({ nombre: '', nivel: '', totalH: 0, totalM: 0, tresH: 0, tresM: 0, cuatroH: 0, cuatroM: 0, cincoH: 0, cincoM: 0 });
    this.formularioService.actualizarDato('alumnosIEAyrocaTabla', this.datos.alumnosIEAyrocaTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarAlumnosIEAyroca(index: number) {
    if (this.datos.alumnosIEAyrocaTabla && this.datos.alumnosIEAyrocaTabla.length > 1) {
      this.datos.alumnosIEAyrocaTabla.splice(index, 1);
      this.formularioService.actualizarDato('alumnosIEAyrocaTabla', this.datos.alumnosIEAyrocaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarAlumnosIEAyroca(index: number, field: string, value: any) {
    if (!this.datos.alumnosIEAyrocaTabla) {
      this.inicializarAlumnosIEAyroca();
    }
    if (this.datos.alumnosIEAyrocaTabla[index]) {
      this.datos.alumnosIEAyrocaTabla[index][field] = value;
      this.formularioService.actualizarDato('alumnosIEAyrocaTabla', this.datos.alumnosIEAyrocaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarAlumnosIE40270() {
    if (!this.datos.alumnosIE40270Tabla || this.datos.alumnosIE40270Tabla.length === 0) {
      this.datos.alumnosIE40270Tabla = [
        { nombre: 'IE N°40270', nivel: 'Primaria', totalH: 0, totalM: 0, p1H: 0, p1M: 0, p2H: 0, p2M: 0, p3H: 0, p3M: 0, p4H: 0, p4M: 0, p5H: 0, p5M: 0, p6H: 0, p6M: 0 }
      ];
      this.formularioService.actualizarDato('alumnosIE40270Tabla', this.datos.alumnosIE40270Tabla);
      this.cdRef.detectChanges();
    }
  }

  agregarAlumnosIE40270() {
    if (!this.datos.alumnosIE40270Tabla) {
      this.inicializarAlumnosIE40270();
    }
    this.datos.alumnosIE40270Tabla.push({ nombre: '', nivel: '', totalH: 0, totalM: 0, p1H: 0, p1M: 0, p2H: 0, p2M: 0, p3H: 0, p3M: 0, p4H: 0, p4M: 0, p5H: 0, p5M: 0, p6H: 0, p6M: 0 });
    this.formularioService.actualizarDato('alumnosIE40270Tabla', this.datos.alumnosIE40270Tabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarAlumnosIE40270(index: number) {
    if (this.datos.alumnosIE40270Tabla && this.datos.alumnosIE40270Tabla.length > 1) {
      this.datos.alumnosIE40270Tabla.splice(index, 1);
      this.formularioService.actualizarDato('alumnosIE40270Tabla', this.datos.alumnosIE40270Tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarAlumnosIE40270(index: number, field: string, value: any) {
    if (!this.datos.alumnosIE40270Tabla) {
      this.inicializarAlumnosIE40270();
    }
    if (this.datos.alumnosIE40270Tabla[index]) {
      this.datos.alumnosIE40270Tabla[index][field] = value;
      this.formularioService.actualizarDato('alumnosIE40270Tabla', this.datos.alumnosIE40270Tabla);
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
    if (!this.datos.natalidadMortalidadTabla || this.datos.natalidadMortalidadTabla.length === 0) {
      this.datos.natalidadMortalidadTabla = [
        { anio: '2023', natalidad: 0, mortalidad: 0 },
        { anio: '2024 (hasta 13/11)', natalidad: 0, mortalidad: 0 }
      ];
      this.formularioService.actualizarDato('natalidadMortalidadTabla', this.datos.natalidadMortalidadTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarNatalidadMortalidad() {
    if (!this.datos.natalidadMortalidadTabla) {
      this.inicializarNatalidadMortalidad();
    }
    this.datos.natalidadMortalidadTabla.push({ anio: '', natalidad: 0, mortalidad: 0 });
    this.formularioService.actualizarDato('natalidadMortalidadTabla', this.datos.natalidadMortalidadTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarNatalidadMortalidad(index: number) {
    if (this.datos.natalidadMortalidadTabla && this.datos.natalidadMortalidadTabla.length > 1) {
      this.datos.natalidadMortalidadTabla.splice(index, 1);
      this.formularioService.actualizarDato('natalidadMortalidadTabla', this.datos.natalidadMortalidadTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarNatalidadMortalidad(index: number, field: string, value: any) {
    if (!this.datos.natalidadMortalidadTabla) {
      this.inicializarNatalidadMortalidad();
    }
    if (this.datos.natalidadMortalidadTabla[index]) {
      this.datos.natalidadMortalidadTabla[index][field] = value;
      this.formularioService.actualizarDato('natalidadMortalidadTabla', this.datos.natalidadMortalidadTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarMorbilidad() {
    if ((!this.datos.morbilidadTabla || this.datos.morbilidadTabla.length === 0) && (!this.datos.morbiliadTabla || this.datos.morbiliadTabla.length === 0)) {
      this.datos.morbilidadTabla = [
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
      this.formularioService.actualizarDato('morbilidadTabla', this.datos.morbilidadTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarMorbilidad() {
    if (!this.datos.morbilidadTabla && !this.datos.morbiliadTabla) {
      this.inicializarMorbilidad();
    }
    const tabla = this.datos.morbilidadTabla || this.datos.morbiliadTabla;
    if (tabla) {
      tabla.push({ grupo: '', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 });
      const key = this.datos.morbilidadTabla ? 'morbilidadTabla' : 'morbiliadTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  eliminarMorbilidad(index: number) {
    const tabla = this.datos.morbilidadTabla || this.datos.morbiliadTabla;
    if (tabla && tabla.length > 1) {
      tabla.splice(index, 1);
      const key = this.datos.morbilidadTabla ? 'morbilidadTabla' : 'morbiliadTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarMorbilidad(index: number, field: string, value: any) {
    if (!this.datos.morbilidadTabla && !this.datos.morbiliadTabla) {
      this.inicializarMorbilidad();
    }
    const tabla = this.datos.morbilidadTabla || this.datos.morbiliadTabla;
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
      const key = this.datos.morbilidadTabla ? 'morbilidadTabla' : 'morbiliadTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarAfiliacionSalud() {
    if ((!this.datos.afiliacionSaludTabla || this.datos.afiliacionSaludTabla.length === 0) && (!this.datos.seguroSaludTabla || this.datos.seguroSaludTabla.length === 0)) {
      this.datos.afiliacionSaludTabla = [
        { categoria: 'Seguro Integral de Salud (SIS)', casos: 0, porcentaje: '0%' },
        { categoria: 'ESSALUD', casos: 0, porcentaje: '0%' },
        { categoria: 'Ningún seguro', casos: 0, porcentaje: '0%' },
        { categoria: 'Total referencial', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('afiliacionSaludTabla', this.datos.afiliacionSaludTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarAfiliacionSalud() {
    if (!this.datos.afiliacionSaludTabla && !this.datos.seguroSaludTabla) {
      this.inicializarAfiliacionSalud();
    }
    const tabla = this.datos.afiliacionSaludTabla || this.datos.seguroSaludTabla;
    if (tabla) {
      const totalIndex = tabla.findIndex((item: any) => item.categoria === 'Total referencial');
      if (totalIndex >= 0) {
        tabla.splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
      } else {
        tabla.push({ categoria: '', casos: 0, porcentaje: '0%' });
      }
      const key = this.datos.afiliacionSaludTabla ? 'afiliacionSaludTabla' : 'seguroSaludTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  eliminarAfiliacionSalud(index: number) {
    const tabla = this.datos.afiliacionSaludTabla || this.datos.seguroSaludTabla;
    if (tabla && tabla.length > 1 && tabla[index].categoria !== 'Total referencial') {
      tabla.splice(index, 1);
      const key = this.datos.afiliacionSaludTabla ? 'afiliacionSaludTabla' : 'seguroSaludTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarAfiliacionSalud(index: number, field: string, value: any) {
    if (!this.datos.afiliacionSaludTabla && !this.datos.seguroSaludTabla) {
      this.inicializarAfiliacionSalud();
    }
    const tabla = this.datos.afiliacionSaludTabla || this.datos.seguroSaludTabla;
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
      const key = this.datos.afiliacionSaludTabla ? 'afiliacionSaludTabla' : 'seguroSaludTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarNivelEducativo() {
    if (!this.datos.nivelEducativoTabla || this.datos.nivelEducativoTabla.length === 0) {
      this.datos.nivelEducativoTabla = [
        { categoria: 'Sin nivel o Inicial', casos: 0, porcentaje: '0%' },
        { categoria: 'Primaria', casos: 0, porcentaje: '0%' },
        { categoria: 'Secundaria', casos: 0, porcentaje: '0%' },
        { categoria: 'Superior no Universitaria', casos: 0, porcentaje: '0%' },
        { categoria: 'Superior Universitaria', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '100,00%' }
      ];
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos.nivelEducativoTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarNivelEducativo() {
    if (!this.datos.nivelEducativoTabla) {
      this.inicializarNivelEducativo();
    }
    const totalIndex = this.datos.nivelEducativoTabla.findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos.nivelEducativoTabla.splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos.nivelEducativoTabla.push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('nivelEducativoTabla', this.datos.nivelEducativoTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarNivelEducativo(index: number) {
    if (this.datos.nivelEducativoTabla && this.datos.nivelEducativoTabla.length > 1 && this.datos.nivelEducativoTabla[index].categoria !== 'Total') {
      this.datos.nivelEducativoTabla.splice(index, 1);
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos.nivelEducativoTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarNivelEducativo(index: number, field: string, value: any) {
    if (!this.datos.nivelEducativoTabla) {
      this.inicializarNivelEducativo();
    }
    if (this.datos.nivelEducativoTabla[index]) {
      this.datos.nivelEducativoTabla[index][field] = value;
      if (field === 'casos' && this.datos.nivelEducativoTabla[index].categoria !== 'Total') {
        const totalCasos = this.datos.nivelEducativoTabla
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos.nivelEducativoTabla.find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          if (totalCasos > 0) {
            totalItem.porcentaje = '100,00%';
          }
        }
      }
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos.nivelEducativoTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarTasaAnalfabetismo() {
    if (!this.datos.tasaAnalfabetismoTabla || this.datos.tasaAnalfabetismoTabla.length === 0) {
      this.datos.tasaAnalfabetismoTabla = [
        { indicador: 'Sabe leer y escribir', casos: 0, porcentaje: '0%' },
        { indicador: 'No sabe leer ni escribir', casos: 0, porcentaje: '0%' },
        { indicador: 'Total', casos: 0, porcentaje: '100,00%' }
      ];
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos.tasaAnalfabetismoTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarTasaAnalfabetismo() {
    if (!this.datos.tasaAnalfabetismoTabla) {
      this.inicializarTasaAnalfabetismo();
    }
    const totalIndex = this.datos.tasaAnalfabetismoTabla.findIndex((item: any) => item.indicador === 'Total');
    if (totalIndex >= 0) {
      this.datos.tasaAnalfabetismoTabla.splice(totalIndex, 0, { indicador: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos.tasaAnalfabetismoTabla.push({ indicador: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos.tasaAnalfabetismoTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarTasaAnalfabetismo(index: number) {
    if (this.datos.tasaAnalfabetismoTabla && this.datos.tasaAnalfabetismoTabla.length > 1 && this.datos.tasaAnalfabetismoTabla[index].indicador !== 'Total') {
      this.datos.tasaAnalfabetismoTabla.splice(index, 1);
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos.tasaAnalfabetismoTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarTasaAnalfabetismo(index: number, field: string, value: any) {
    if (!this.datos.tasaAnalfabetismoTabla) {
      this.inicializarTasaAnalfabetismo();
    }
    if (this.datos.tasaAnalfabetismoTabla[index]) {
      this.datos.tasaAnalfabetismoTabla[index][field] = value;
      if (field === 'casos' && this.datos.tasaAnalfabetismoTabla[index].indicador !== 'Total') {
        const totalCasos = this.datos.tasaAnalfabetismoTabla
          .filter((item: any) => item.indicador !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos.tasaAnalfabetismoTabla.find((item: any) => item.indicador === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          if (totalCasos > 0) {
            totalItem.porcentaje = '100,00%';
          }
        }
      }
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos.tasaAnalfabetismoTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarLenguasMaternas() {
    if (!this.datos.lenguasMaternasTabla || this.datos.lenguasMaternasTabla.length === 0) {
      this.datos.lenguasMaternasTabla = [
        { categoria: 'Castellano', casos: 0, porcentaje: '0%' },
        { categoria: 'Quechua', casos: 0, porcentaje: '0%' },
        { categoria: 'No sabe / No responde', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '100,00%' }
      ];
      this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos.lenguasMaternasTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarLenguasMaternas() {
    if (!this.datos.lenguasMaternasTabla) {
      this.inicializarLenguasMaternas();
    }
    const totalIndex = this.datos.lenguasMaternasTabla.findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos.lenguasMaternasTabla.splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos.lenguasMaternasTabla.push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos.lenguasMaternasTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarLenguasMaternas(index: number) {
    if (this.datos.lenguasMaternasTabla && this.datos.lenguasMaternasTabla.length > 1 && this.datos.lenguasMaternasTabla[index].categoria !== 'Total') {
      this.datos.lenguasMaternasTabla.splice(index, 1);
      this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos.lenguasMaternasTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarLenguasMaternas(index: number, field: string, value: any) {
    if (!this.datos.lenguasMaternasTabla) {
      this.inicializarLenguasMaternas();
    }
    if (this.datos.lenguasMaternasTabla[index]) {
      this.datos.lenguasMaternasTabla[index][field] = value;
      if (field === 'casos' && this.datos.lenguasMaternasTabla[index].categoria !== 'Total') {
        const totalCasos = this.datos.lenguasMaternasTabla
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos.lenguasMaternasTabla.find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          if (totalCasos > 0) {
            totalItem.porcentaje = '100,00%';
          }
        }
      }
      this.formularioService.actualizarDato('lenguasMaternasTabla', this.datos.lenguasMaternasTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarReligiones() {
    if (!this.datos.religionesTabla || this.datos.religionesTabla.length === 0) {
      this.datos.religionesTabla = [
        { categoria: 'Católica', casos: 0, porcentaje: '0%' },
        { categoria: 'Evangélica', casos: 0, porcentaje: '0%' },
        { categoria: 'Otra', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '100,00%' }
      ];
      this.formularioService.actualizarDato('religionesTabla', this.datos.religionesTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarReligiones() {
    if (!this.datos.religionesTabla) {
      this.inicializarReligiones();
    }
    const totalIndex = this.datos.religionesTabla.findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos.religionesTabla.splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos.religionesTabla.push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('religionesTabla', this.datos.religionesTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarReligiones(index: number) {
    if (this.datos.religionesTabla && this.datos.religionesTabla.length > 1 && this.datos.religionesTabla[index].categoria !== 'Total') {
      this.datos.religionesTabla.splice(index, 1);
      this.formularioService.actualizarDato('religionesTabla', this.datos.religionesTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarReligiones(index: number, field: string, value: any) {
    if (!this.datos.religionesTabla) {
      this.inicializarReligiones();
    }
    if (this.datos.religionesTabla[index]) {
      this.datos.religionesTabla[index][field] = value;
      if (field === 'casos' && this.datos.religionesTabla[index].categoria !== 'Total') {
        const totalCasos = this.datos.religionesTabla
          .filter((item: any) => item.categoria !== 'Total')
          .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
        const totalItem = this.datos.religionesTabla.find((item: any) => item.categoria === 'Total');
        if (totalItem) {
          totalItem.casos = totalCasos;
          if (totalCasos > 0) {
            totalItem.porcentaje = '100,00%';
          }
        }
      }
      this.formularioService.actualizarDato('religionesTabla', this.datos.religionesTabla);
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
    if (!this.datos.indiceDesarrolloHumanoTabla || this.datos.indiceDesarrolloHumanoTabla.length === 0) {
      this.datos.indiceDesarrolloHumanoTabla = [
        { poblacion: 0, rankIdh1: 0, idh: '', rankEsperanza: 0, esperanzaVida: '', rankEducacion1: 0, educacion: '', rankEducacion2: 0, anosEducacion: '', rankAnios: 0, ingreso: '', rankIngreso: 0 }
      ];
      this.formularioService.actualizarDato('indiceDesarrolloHumanoTabla', this.datos.indiceDesarrolloHumanoTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarIndiceDesarrolloHumano() {
    if (!this.datos.indiceDesarrolloHumanoTabla) {
      this.inicializarIndiceDesarrolloHumano();
    }
    this.datos.indiceDesarrolloHumanoTabla.push({ poblacion: 0, rankIdh1: 0, idh: '', rankEsperanza: 0, esperanzaVida: '', rankEducacion1: 0, educacion: '', rankEducacion2: 0, anosEducacion: '', rankAnios: 0, ingreso: '', rankIngreso: 0 });
    this.formularioService.actualizarDato('indiceDesarrolloHumanoTabla', this.datos.indiceDesarrolloHumanoTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarIndiceDesarrolloHumano(index: number) {
    if (this.datos.indiceDesarrolloHumanoTabla && this.datos.indiceDesarrolloHumanoTabla.length > 1) {
      this.datos.indiceDesarrolloHumanoTabla.splice(index, 1);
      this.formularioService.actualizarDato('indiceDesarrolloHumanoTabla', this.datos.indiceDesarrolloHumanoTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarIndiceDesarrolloHumano(index: number, field: string, value: any) {
    if (!this.datos.indiceDesarrolloHumanoTabla) {
      this.inicializarIndiceDesarrolloHumano();
    }
    if (this.datos.indiceDesarrolloHumanoTabla[index]) {
      if (field === 'rankIngreso') {
        this.datos.indiceDesarrolloHumanoTabla[index]['rankIngreso'] = value;
        this.datos.indiceDesarrolloHumanoTabla[index]['rankIngresoFinal'] = value;
      } else {
        this.datos.indiceDesarrolloHumanoTabla[index][field] = value;
      }
      this.formularioService.actualizarDato('indiceDesarrolloHumanoTabla', this.datos.indiceDesarrolloHumanoTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarNBICCAyroca() {
    if (!this.datos.nbiCCAyrocaTabla || this.datos.nbiCCAyrocaTabla.length === 0) {
      this.datos.nbiCCAyrocaTabla = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('nbiCCAyrocaTabla', this.datos.nbiCCAyrocaTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarNBICCAyroca() {
    if (!this.datos.nbiCCAyrocaTabla) {
      this.inicializarNBICCAyroca();
    }
    this.datos.nbiCCAyrocaTabla.push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('nbiCCAyrocaTabla', this.datos.nbiCCAyrocaTabla);
    this.calcularPorcentajesNBICCAyroca();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarNBICCAyroca(index: number) {
    if (this.datos.nbiCCAyrocaTabla && this.datos.nbiCCAyrocaTabla.length > 1) {
      const item = this.datos.nbiCCAyrocaTabla[index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos.nbiCCAyrocaTabla.splice(index, 1);
        this.formularioService.actualizarDato('nbiCCAyrocaTabla', this.datos.nbiCCAyrocaTabla);
        this.calcularPorcentajesNBICCAyroca();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarNBICCAyroca(index: number, field: string, value: any) {
    if (!this.datos.nbiCCAyrocaTabla) {
      this.inicializarNBICCAyroca();
    }
    if (this.datos.nbiCCAyrocaTabla[index]) {
      this.datos.nbiCCAyrocaTabla[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesNBICCAyroca();
      }
      this.formularioService.actualizarDato('nbiCCAyrocaTabla', this.datos.nbiCCAyrocaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesNBICCAyroca() {
    if (!this.datos.nbiCCAyrocaTabla || this.datos.nbiCCAyrocaTabla.length === 0) {
      return;
    }
    const totalItem = this.datos.nbiCCAyrocaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total referencial')
    );
    const totalReferencial = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (totalReferencial > 0) {
      this.datos.nbiCCAyrocaTabla.forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total referencial')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / totalReferencial) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarNBIDistritoCahuacho() {
    if (!this.datos.nbiDistritoCahuachoTabla || this.datos.nbiDistritoCahuachoTabla.length === 0) {
      this.datos.nbiDistritoCahuachoTabla = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('nbiDistritoCahuachoTabla', this.datos.nbiDistritoCahuachoTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarNBIDistritoCahuacho() {
    if (!this.datos.nbiDistritoCahuachoTabla) {
      this.inicializarNBIDistritoCahuacho();
    }
    this.datos.nbiDistritoCahuachoTabla.push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('nbiDistritoCahuachoTabla', this.datos.nbiDistritoCahuachoTabla);
    this.calcularPorcentajesNBIDistritoCahuacho();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarNBIDistritoCahuacho(index: number) {
    if (this.datos.nbiDistritoCahuachoTabla && this.datos.nbiDistritoCahuachoTabla.length > 1) {
      const item = this.datos.nbiDistritoCahuachoTabla[index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos.nbiDistritoCahuachoTabla.splice(index, 1);
        this.formularioService.actualizarDato('nbiDistritoCahuachoTabla', this.datos.nbiDistritoCahuachoTabla);
        this.calcularPorcentajesNBIDistritoCahuacho();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarNBIDistritoCahuacho(index: number, field: string, value: any) {
    if (!this.datos.nbiDistritoCahuachoTabla) {
      this.inicializarNBIDistritoCahuacho();
    }
    if (this.datos.nbiDistritoCahuachoTabla[index]) {
      this.datos.nbiDistritoCahuachoTabla[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesNBIDistritoCahuacho();
      }
      this.formularioService.actualizarDato('nbiDistritoCahuachoTabla', this.datos.nbiDistritoCahuachoTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesNBIDistritoCahuacho() {
    if (!this.datos.nbiDistritoCahuachoTabla || this.datos.nbiDistritoCahuachoTabla.length === 0) {
      return;
    }
    const totalItem = this.datos.nbiDistritoCahuachoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total referencial')
    );
    const totalReferencial = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (totalReferencial > 0) {
      this.datos.nbiDistritoCahuachoTabla.forEach((item: any) => {
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
    this.datos.autoridades.push({ organizacion: '', cargo: '', nombre: '' });
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
    if (this.datos.autoridades[index]) {
      this.datos.autoridades[index][field] = value;
      this.formularioService.actualizarDato('autoridades', this.datos.autoridades);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarFestividades() {
    if (!this.datos.festividades || this.datos.festividades.length === 0) {
      this.datos.festividades = [
        { festividad: '', fecha: '' }
      ];
      this.formularioService.actualizarDato('festividades', this.datos.festividades);
      this.cdRef.detectChanges();
    }
  }

  agregarFestividades() {
    if (!this.datos.festividades) {
      this.inicializarFestividades();
    }
    this.datos.festividades.push({ festividad: '', fecha: '' });
    this.formularioService.actualizarDato('festividades', this.datos.festividades);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarFestividades(index: number) {
    if (this.datos.festividades && this.datos.festividades.length > 1) {
      this.datos.festividades.splice(index, 1);
      this.formularioService.actualizarDato('festividades', this.datos.festividades);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarFestividades(index: number, field: string, value: any) {
    if (!this.datos.festividades) {
      this.inicializarFestividades();
    }
    if (this.datos.festividades[index]) {
      this.datos.festividades[index][field] = value;
      this.formularioService.actualizarDato('festividades', this.datos.festividades);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarUbicacionCP() {
    if (!this.datos.ubicacionCpTabla || this.datos.ubicacionCpTabla.length === 0) {
      this.datos.ubicacionCpTabla = [
        { localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' }
      ];
      this.formularioService.actualizarDato('ubicacionCpTabla', this.datos.ubicacionCpTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarUbicacionCP() {
    if (!this.datos.ubicacionCpTabla) {
      this.inicializarUbicacionCP();
    }
    this.datos.ubicacionCpTabla.push({ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' });
    this.formularioService.actualizarDato('ubicacionCpTabla', this.datos.ubicacionCpTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarUbicacionCP(index: number) {
    if (this.datos.ubicacionCpTabla && this.datos.ubicacionCpTabla.length > 1) {
      this.datos.ubicacionCpTabla.splice(index, 1);
      this.formularioService.actualizarDato('ubicacionCpTabla', this.datos.ubicacionCpTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarUbicacionCP(index: number, field: string, value: any) {
    if (!this.datos.ubicacionCpTabla) {
      this.inicializarUbicacionCP();
    }
    if (this.datos.ubicacionCpTabla[index]) {
      this.datos.ubicacionCpTabla[index][field] = value;
      this.formularioService.actualizarDato('ubicacionCpTabla', this.datos.ubicacionCpTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  getFotografiasCahuachoForm(): any[] {
    const fotografias: any[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const imagenKey = `fotografiaCahuacho${i}Imagen`;
      let preview = this.datos[imagenKey] || null;
      
      if (i === 1 && !preview) {
        preview = this.datos['fotografiaCahuachoImagen'] || null;
      }
      
      let titulo = this.datos[`fotografiaCahuacho${i}Titulo`];
      let fuente = this.datos[`fotografiaCahuacho${i}Fuente`];
      
      if (i === 1) {
        if (!titulo) {
          titulo = this.datos['fotografiaCahuachoTitulo'] || 'Vista panorámica del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho');
        }
        if (!fuente) {
          fuente = this.datos['fotografiaCahuachoFuente'] || 'GEADES, 2024';
        }
      }
      
      if (i === 1 || titulo || preview) {
        fotografias.push({
          titulo: titulo || (i === 1 ? 'Vista panorámica del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho') : ''),
          fuente: fuente || 'GEADES, 2024',
          preview: preview,
          dragOver: false
        });
      }
    }
    
    if (fotografias.length === 0) {
      fotografias.push({
        titulo: 'Vista panorámica del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
        fuente: 'GEADES, 2024',
        preview: null,
        dragOver: false
      });
    }
    
    this.fotografiasCahuacho = fotografias;
    return fotografias;
  }

  getFotografiasCahuachoFormMulti(): any[] {
    const fotos = this.getFotografiasCahuachoForm();
    return fotos.map((foto, index) => ({
      titulo: foto.titulo || (index === 0 ? 'Vista panorámica del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho') : 'Título de fotografía'),
      fuente: foto.fuente || 'GEADES, 2024',
      imagen: foto.preview || null,
      id: `cahuacho-${index}-${Date.now()}`
    }));
  }

  actualizarFotografiasCahuachoFormMulti() {
    const nuevasFotografias = this.getFotografiasCahuachoFormMulti();
    const actualSerialized = JSON.stringify(this.fotografiasCahuachoFormMulti.map(f => ({
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
      this.fotografiasCahuachoFormMulti = nuevasFotografias;
    }
  }

  onFotografiasCahuachoChange(fotografias: any[]) {
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      this.onFieldChange(`fotografiaCahuacho${num}Titulo`, foto.titulo);
      this.onFieldChange(`fotografiaCahuacho${num}Fuente`, foto.fuente);
      this.onFieldChange(`fotografiaCahuacho${num}Imagen`, foto.imagen || '');
      
      if (num === 1) {
        this.onFieldChange('fotografiaCahuachoTitulo', foto.titulo);
        this.onFieldChange('fotografiaCahuachoFuente', foto.fuente);
        this.onFieldChange('fotografiaCahuachoImagen', foto.imagen || '');
        this.fotoCahuachoPreview = foto.imagen || null;
      }
    });
    for (let i = fotografias.length + 1; i <= 10; i++) {
      this.onFieldChange(`fotografiaCahuacho${i}Titulo`, '');
      this.onFieldChange(`fotografiaCahuacho${i}Fuente`, '');
      this.onFieldChange(`fotografiaCahuacho${i}Imagen`, '');
    }
    this.fotografiasCahuacho = fotografias.map(f => ({ ...f, preview: f.imagen, dragOver: false }));
    this.actualizarFotografiasCahuachoFormMulti();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  onImagenCahuachoChange(imagenBase64: string) {
    this.fotoCahuachoPreview = imagenBase64 || null;
    this.onFieldChange('fotografiaCahuachoImagen', imagenBase64 || '');
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  inicializarPoblacionSexoAISI() {
    if (!this.datos.poblacionSexoAISI || this.datos.poblacionSexoAISI.length === 0) {
      this.datos.poblacionSexoAISI = [
        { sexo: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('poblacionSexoAISI', this.datos.poblacionSexoAISI);
      this.cdRef.detectChanges();
    }
  }

  agregarPoblacionSexoAISI() {
    if (!this.datos.poblacionSexoAISI) {
      this.inicializarPoblacionSexoAISI();
    }
    this.datos.poblacionSexoAISI.push({ sexo: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('poblacionSexoAISI', this.datos.poblacionSexoAISI);
    this.calcularPorcentajesPoblacionSexoAISI();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPoblacionSexoAISI(index: number) {
    if (this.datos.poblacionSexoAISI && this.datos.poblacionSexoAISI.length > 1) {
      const item = this.datos.poblacionSexoAISI[index];
      if (!item.sexo || !item.sexo.toLowerCase().includes('total')) {
        this.datos.poblacionSexoAISI.splice(index, 1);
        this.formularioService.actualizarDato('poblacionSexoAISI', this.datos.poblacionSexoAISI);
        this.calcularPorcentajesPoblacionSexoAISI();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarPoblacionSexoAISI(index: number, field: string, value: any) {
    if (!this.datos.poblacionSexoAISI) {
      this.inicializarPoblacionSexoAISI();
    }
    if (this.datos.poblacionSexoAISI[index]) {
      this.datos.poblacionSexoAISI[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesPoblacionSexoAISI();
      }
      this.formularioService.actualizarDato('poblacionSexoAISI', this.datos.poblacionSexoAISI);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesPoblacionSexoAISI() {
    if (!this.datos.poblacionSexoAISI || this.datos.poblacionSexoAISI.length === 0) {
      return;
    }
    const totalItem = this.datos.poblacionSexoAISI.find((item: any) => 
      item.sexo && item.sexo.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos.poblacionSexoAISI.forEach((item: any) => {
        if (!item.sexo || !item.sexo.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarPoblacionEtarioAISI() {
    if (!this.datos.poblacionEtarioAISI || this.datos.poblacionEtarioAISI.length === 0) {
      this.datos.poblacionEtarioAISI = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('poblacionEtarioAISI', this.datos.poblacionEtarioAISI);
      this.cdRef.detectChanges();
    }
  }

  agregarPoblacionEtarioAISI() {
    if (!this.datos.poblacionEtarioAISI) {
      this.inicializarPoblacionEtarioAISI();
    }
    this.datos.poblacionEtarioAISI.push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('poblacionEtarioAISI', this.datos.poblacionEtarioAISI);
    this.calcularPorcentajesPoblacionEtarioAISI();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPoblacionEtarioAISI(index: number) {
    if (this.datos.poblacionEtarioAISI && this.datos.poblacionEtarioAISI.length > 1) {
      const item = this.datos.poblacionEtarioAISI[index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos.poblacionEtarioAISI.splice(index, 1);
        this.formularioService.actualizarDato('poblacionEtarioAISI', this.datos.poblacionEtarioAISI);
        this.calcularPorcentajesPoblacionEtarioAISI();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarPoblacionEtarioAISI(index: number, field: string, value: any) {
    if (!this.datos.poblacionEtarioAISI) {
      this.inicializarPoblacionEtarioAISI();
    }
    if (this.datos.poblacionEtarioAISI[index]) {
      this.datos.poblacionEtarioAISI[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesPoblacionEtarioAISI();
      }
      this.formularioService.actualizarDato('poblacionEtarioAISI', this.datos.poblacionEtarioAISI);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesPoblacionEtarioAISI() {
    if (!this.datos.poblacionEtarioAISI || this.datos.poblacionEtarioAISI.length === 0) {
      return;
    }
    const totalItem = this.datos.poblacionEtarioAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos.poblacionEtarioAISI.forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarPETGruposEdadAISI() {
    if (!this.datos.petGruposEdadAISI || this.datos.petGruposEdadAISI.length === 0) {
      this.datos.petGruposEdadAISI = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('petGruposEdadAISI', this.datos.petGruposEdadAISI);
      this.cdRef.detectChanges();
    }
  }

  agregarPETGruposEdadAISI() {
    if (!this.datos.petGruposEdadAISI) {
      this.inicializarPETGruposEdadAISI();
    }
    this.datos.petGruposEdadAISI.push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('petGruposEdadAISI', this.datos.petGruposEdadAISI);
    this.calcularPorcentajesPETGruposEdadAISI();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPETGruposEdadAISI(index: number) {
    if (this.datos.petGruposEdadAISI && this.datos.petGruposEdadAISI.length > 1) {
      const item = this.datos.petGruposEdadAISI[index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos.petGruposEdadAISI.splice(index, 1);
        this.formularioService.actualizarDato('petGruposEdadAISI', this.datos.petGruposEdadAISI);
        this.calcularPorcentajesPETGruposEdadAISI();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarPETGruposEdadAISI(index: number, field: string, value: any) {
    if (!this.datos.petGruposEdadAISI) {
      this.inicializarPETGruposEdadAISI();
    }
    if (this.datos.petGruposEdadAISI[index]) {
      this.datos.petGruposEdadAISI[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesPETGruposEdadAISI();
      }
      this.formularioService.actualizarDato('petGruposEdadAISI', this.datos.petGruposEdadAISI);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesPETGruposEdadAISI() {
    if (!this.datos.petGruposEdadAISI || this.datos.petGruposEdadAISI.length === 0) {
      return;
    }
    const totalItem = this.datos.petGruposEdadAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos.petGruposEdadAISI.forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarPEADistritoSexo() {
    if (!this.datos.peaDistritoSexoTabla || this.datos.peaDistritoSexoTabla.length === 0) {
      this.datos.peaDistritoSexoTabla = [
        { categoria: '', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos.peaDistritoSexoTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarPEADistritoSexo() {
    if (!this.datos.peaDistritoSexoTabla) {
      this.inicializarPEADistritoSexo();
    }
    this.datos.peaDistritoSexoTabla.push({ categoria: '', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos.peaDistritoSexoTabla);
    this.calcularPorcentajesPEADistritoSexo();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPEADistritoSexo(index: number) {
    if (this.datos.peaDistritoSexoTabla && this.datos.peaDistritoSexoTabla.length > 1) {
      const item = this.datos.peaDistritoSexoTabla[index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos.peaDistritoSexoTabla.splice(index, 1);
        this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos.peaDistritoSexoTabla);
        this.calcularPorcentajesPEADistritoSexo();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarPEADistritoSexo(index: number, field: string, value: any) {
    if (!this.datos.peaDistritoSexoTabla) {
      this.inicializarPEADistritoSexo();
    }
    if (this.datos.peaDistritoSexoTabla[index]) {
      this.datos.peaDistritoSexoTabla[index][field] = value;
      if (field === 'hombres' || field === 'mujeres' || field === 'casos') {
        this.calcularPorcentajesPEADistritoSexo();
      }
      this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos.peaDistritoSexoTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesPEADistritoSexo() {
    if (!this.datos.peaDistritoSexoTabla || this.datos.peaDistritoSexoTabla.length === 0) {
      return;
    }
    const totalItem = this.datos.peaDistritoSexoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const totalHombres = totalItem ? parseFloat(totalItem.hombres) || 0 : 0;
    const totalMujeres = totalItem ? parseFloat(totalItem.mujeres) || 0 : 0;
    const totalCasos = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    this.datos.peaDistritoSexoTabla.forEach((item: any) => {
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
    if (!this.datos.peaOcupadaDesocupadaTabla || this.datos.peaOcupadaDesocupadaTabla.length === 0) {
      this.datos.peaOcupadaDesocupadaTabla = [
        { categoria: '', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos.peaOcupadaDesocupadaTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarPEAOcupadaDesocupada() {
    if (!this.datos.peaOcupadaDesocupadaTabla) {
      this.inicializarPEAOcupadaDesocupada();
    }
    this.datos.peaOcupadaDesocupadaTabla.push({ categoria: '', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos.peaOcupadaDesocupadaTabla);
    this.calcularPorcentajesPEAOcupadaDesocupada();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPEAOcupadaDesocupada(index: number) {
    if (this.datos.peaOcupadaDesocupadaTabla && this.datos.peaOcupadaDesocupadaTabla.length > 1) {
      const item = this.datos.peaOcupadaDesocupadaTabla[index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos.peaOcupadaDesocupadaTabla.splice(index, 1);
        this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos.peaOcupadaDesocupadaTabla);
        this.calcularPorcentajesPEAOcupadaDesocupada();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarPEAOcupadaDesocupada(index: number, field: string, value: any) {
    if (!this.datos.peaOcupadaDesocupadaTabla) {
      this.inicializarPEAOcupadaDesocupada();
    }
    if (this.datos.peaOcupadaDesocupadaTabla[index]) {
      this.datos.peaOcupadaDesocupadaTabla[index][field] = value;
      if (field === 'hombres' || field === 'mujeres' || field === 'casos') {
        this.calcularPorcentajesPEAOcupadaDesocupada();
      }
      this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos.peaOcupadaDesocupadaTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesPEAOcupadaDesocupada() {
    if (!this.datos.peaOcupadaDesocupadaTabla || this.datos.peaOcupadaDesocupadaTabla.length === 0) {
      return;
    }
    const totalItem = this.datos.peaOcupadaDesocupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const totalHombres = totalItem ? parseFloat(totalItem.hombres) || 0 : 0;
    const totalMujeres = totalItem ? parseFloat(totalItem.mujeres) || 0 : 0;
    const totalCasos = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    this.datos.peaOcupadaDesocupadaTabla.forEach((item: any) => {
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
    if (!this.datos.actividadesEconomicasAISI || this.datos.actividadesEconomicasAISI.length === 0) {
      this.datos.actividadesEconomicasAISI = [
        { actividad: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('actividadesEconomicasAISI', this.datos.actividadesEconomicasAISI);
      this.cdRef.detectChanges();
    }
  }

  agregarActividadesEconomicasAISI() {
    if (!this.datos.actividadesEconomicasAISI) {
      this.inicializarActividadesEconomicasAISI();
    }
    this.datos.actividadesEconomicasAISI.push({ actividad: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('actividadesEconomicasAISI', this.datos.actividadesEconomicasAISI);
    this.calcularPorcentajesActividadesEconomicasAISI();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarActividadesEconomicasAISI(index: number) {
    if (this.datos.actividadesEconomicasAISI && this.datos.actividadesEconomicasAISI.length > 1) {
      const item = this.datos.actividadesEconomicasAISI[index];
      if (!item.actividad || !item.actividad.toLowerCase().includes('total')) {
        this.datos.actividadesEconomicasAISI.splice(index, 1);
        this.formularioService.actualizarDato('actividadesEconomicasAISI', this.datos.actividadesEconomicasAISI);
        this.calcularPorcentajesActividadesEconomicasAISI();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarActividadesEconomicasAISI(index: number, field: string, value: any) {
    if (!this.datos.actividadesEconomicasAISI) {
      this.inicializarActividadesEconomicasAISI();
    }
    if (this.datos.actividadesEconomicasAISI[index]) {
      this.datos.actividadesEconomicasAISI[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesActividadesEconomicasAISI();
      }
      this.formularioService.actualizarDato('actividadesEconomicasAISI', this.datos.actividadesEconomicasAISI);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesActividadesEconomicasAISI() {
    if (!this.datos.actividadesEconomicasAISI || this.datos.actividadesEconomicasAISI.length === 0) {
      return;
    }
    const totalItem = this.datos.actividadesEconomicasAISI.find((item: any) => 
      item.actividad && item.actividad.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos.actividadesEconomicasAISI.forEach((item: any) => {
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
    
    for (let i = 1; i <= 10; i++) {
      const imagenKey = `${prefix}${i}Imagen`;
      let preview = this.datos[imagenKey] || null;
      
      if (i === 1 && !preview) {
        preview = this.datos[`${prefix}Imagen`] || null;
      }
      
      let titulo = this.datos[`${prefix}${i}Titulo`];
      let fuente = this.datos[`${prefix}${i}Fuente`];
      
      if (i === 1) {
        if (!titulo) {
          titulo = this.datos[`${prefix}Titulo`] || tituloDefault;
        }
        if (!fuente) {
          fuente = this.datos[`${prefix}Fuente`] || fuenteDefault;
        }
      }
      
      if (i === 1 || titulo || preview) {
        fotografias.push({
          titulo: titulo || (i === 1 ? tituloDefault : 'Título de fotografía'),
          fuente: fuente || fuenteDefault,
          imagen: preview || null,
          id: `${prefix}-${i}-${Date.now()}`
        });
      }
    }
    
    if (fotografias.length === 0) {
      fotografias.push({
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
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      this.onFieldChange(`${prefix}${num}Titulo`, foto.titulo);
      this.onFieldChange(`${prefix}${num}Fuente`, foto.fuente);
      this.onFieldChange(`${prefix}${num}Imagen`, foto.imagen || '');
      
      if (num === 1) {
        this.onFieldChange(`${prefix}Titulo`, foto.titulo);
        this.onFieldChange(`${prefix}Fuente`, foto.fuente);
        this.onFieldChange(`${prefix}Imagen`, foto.imagen || '');
        if (previewProperty) {
          (this as any)[previewProperty] = foto.imagen || null;
        }
      }
    });
    for (let i = fotografias.length + 1; i <= 10; i++) {
      this.onFieldChange(`${prefix}${i}Titulo`, '');
      this.onFieldChange(`${prefix}${i}Fuente`, '');
      this.onFieldChange(`${prefix}${i}Imagen`, '');
    }
    (this as any)[arrayProperty] = fotografias.map((f: any) => ({ ...f, preview: f.imagen, dragOver: false }));
    this.actualizarFotografiasFormMultiGeneric(prefix, arrayProperty, tituloDefault, fuenteDefault);
    this.actualizarComponenteSeccion();
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

  inicializarTiposViviendaAISI() {
    if (!this.datos.tiposViviendaAISI || this.datos.tiposViviendaAISI.length === 0) {
      this.datos.tiposViviendaAISI = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('tiposViviendaAISI', this.datos.tiposViviendaAISI);
      this.cdRef.detectChanges();
    }
  }

  agregarTiposViviendaAISI() {
    if (!this.datos.tiposViviendaAISI) {
      this.inicializarTiposViviendaAISI();
    }
    this.datos.tiposViviendaAISI.push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('tiposViviendaAISI', this.datos.tiposViviendaAISI);
    this.calcularPorcentajesTiposViviendaAISI();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarTiposViviendaAISI(index: number) {
    if (this.datos.tiposViviendaAISI && this.datos.tiposViviendaAISI.length > 1) {
      const item = this.datos.tiposViviendaAISI[index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos.tiposViviendaAISI.splice(index, 1);
        this.formularioService.actualizarDato('tiposViviendaAISI', this.datos.tiposViviendaAISI);
        this.calcularPorcentajesTiposViviendaAISI();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarTiposViviendaAISI(index: number, field: string, value: any) {
    if (!this.datos.tiposViviendaAISI) {
      this.inicializarTiposViviendaAISI();
    }
    if (this.datos.tiposViviendaAISI[index]) {
      this.datos.tiposViviendaAISI[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesTiposViviendaAISI();
      }
      this.formularioService.actualizarDato('tiposViviendaAISI', this.datos.tiposViviendaAISI);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesTiposViviendaAISI() {
    if (!this.datos.tiposViviendaAISI || this.datos.tiposViviendaAISI.length === 0) {
      return;
    }
    const totalItem = this.datos.tiposViviendaAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos.tiposViviendaAISI.forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarCondicionOcupacionAISI() {
    if (!this.datos.condicionOcupacionAISI || this.datos.condicionOcupacionAISI.length === 0) {
      this.datos.condicionOcupacionAISI = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('condicionOcupacionAISI', this.datos.condicionOcupacionAISI);
      this.cdRef.detectChanges();
    }
  }

  agregarCondicionOcupacionAISI() {
    if (!this.datos.condicionOcupacionAISI) {
      this.inicializarCondicionOcupacionAISI();
    }
    this.datos.condicionOcupacionAISI.push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('condicionOcupacionAISI', this.datos.condicionOcupacionAISI);
    this.calcularPorcentajesCondicionOcupacionAISI();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCondicionOcupacionAISI(index: number) {
    if (this.datos.condicionOcupacionAISI && this.datos.condicionOcupacionAISI.length > 1) {
      const item = this.datos.condicionOcupacionAISI[index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos.condicionOcupacionAISI.splice(index, 1);
        this.formularioService.actualizarDato('condicionOcupacionAISI', this.datos.condicionOcupacionAISI);
        this.calcularPorcentajesCondicionOcupacionAISI();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarCondicionOcupacionAISI(index: number, field: string, value: any) {
    if (!this.datos.condicionOcupacionAISI) {
      this.inicializarCondicionOcupacionAISI();
    }
    if (this.datos.condicionOcupacionAISI[index]) {
      this.datos.condicionOcupacionAISI[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesCondicionOcupacionAISI();
      }
      this.formularioService.actualizarDato('condicionOcupacionAISI', this.datos.condicionOcupacionAISI);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesCondicionOcupacionAISI() {
    if (!this.datos.condicionOcupacionAISI || this.datos.condicionOcupacionAISI.length === 0) {
      return;
    }
    const totalItem = this.datos.condicionOcupacionAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos.condicionOcupacionAISI.forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarMaterialesViviendaAISI() {
    if (!this.datos.materialesViviendaAISI || this.datos.materialesViviendaAISI.length === 0) {
      this.datos.materialesViviendaAISI = [
        { categoria: '', tipoMaterial: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('materialesViviendaAISI', this.datos.materialesViviendaAISI);
      this.cdRef.detectChanges();
    }
  }

  agregarMaterialesViviendaAISI() {
    if (!this.datos.materialesViviendaAISI) {
      this.inicializarMaterialesViviendaAISI();
    }
    this.datos.materialesViviendaAISI.push({ categoria: '', tipoMaterial: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('materialesViviendaAISI', this.datos.materialesViviendaAISI);
    this.calcularPorcentajesMaterialesViviendaAISI();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarMaterialesViviendaAISI(index: number) {
    if (this.datos.materialesViviendaAISI && this.datos.materialesViviendaAISI.length > 1) {
      this.datos.materialesViviendaAISI.splice(index, 1);
      this.formularioService.actualizarDato('materialesViviendaAISI', this.datos.materialesViviendaAISI);
      this.calcularPorcentajesMaterialesViviendaAISI();
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarMaterialesViviendaAISI(index: number, field: string, value: any) {
    if (!this.datos.materialesViviendaAISI) {
      this.inicializarMaterialesViviendaAISI();
    }
    if (this.datos.materialesViviendaAISI[index]) {
      this.datos.materialesViviendaAISI[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesMaterialesViviendaAISI();
      }
      this.formularioService.actualizarDato('materialesViviendaAISI', this.datos.materialesViviendaAISI);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesMaterialesViviendaAISI() {
    if (!this.datos.materialesViviendaAISI || this.datos.materialesViviendaAISI.length === 0) {
      return;
    }
    const categorias = ['paredes', 'techos', 'pisos'];
    categorias.forEach(categoria => {
      const itemsCategoria = this.datos.materialesViviendaAISI.filter((item: any) => 
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
    if (!this.datos.abastecimientoAguaCpTabla || this.datos.abastecimientoAguaCpTabla.length === 0) {
      this.datos.abastecimientoAguaCpTabla = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('abastecimientoAguaCpTabla', this.datos.abastecimientoAguaCpTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarAbastecimientoAguaCP() {
    if (!this.datos.abastecimientoAguaCpTabla) {
      this.inicializarAbastecimientoAguaCP();
    }
    this.datos.abastecimientoAguaCpTabla.push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('abastecimientoAguaCpTabla', this.datos.abastecimientoAguaCpTabla);
    this.calcularPorcentajesAbastecimientoAguaCP();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarAbastecimientoAguaCP(index: number) {
    if (this.datos.abastecimientoAguaCpTabla && this.datos.abastecimientoAguaCpTabla.length > 1) {
      const item = this.datos.abastecimientoAguaCpTabla[index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos.abastecimientoAguaCpTabla.splice(index, 1);
        this.formularioService.actualizarDato('abastecimientoAguaCpTabla', this.datos.abastecimientoAguaCpTabla);
        this.calcularPorcentajesAbastecimientoAguaCP();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarAbastecimientoAguaCP(index: number, field: string, value: any) {
    if (!this.datos.abastecimientoAguaCpTabla) {
      this.inicializarAbastecimientoAguaCP();
    }
    if (this.datos.abastecimientoAguaCpTabla[index]) {
      this.datos.abastecimientoAguaCpTabla[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesAbastecimientoAguaCP();
      }
      this.formularioService.actualizarDato('abastecimientoAguaCpTabla', this.datos.abastecimientoAguaCpTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesAbastecimientoAguaCP() {
    if (!this.datos.abastecimientoAguaCpTabla || this.datos.abastecimientoAguaCpTabla.length === 0) {
      return;
    }
    const totalItem = this.datos.abastecimientoAguaCpTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos.abastecimientoAguaCpTabla.forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarSaneamientoCP() {
    if (!this.datos.saneamientoCpTabla || this.datos.saneamientoCpTabla.length === 0) {
      this.datos.saneamientoCpTabla = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('saneamientoCpTabla', this.datos.saneamientoCpTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarSaneamientoCP() {
    if (!this.datos.saneamientoCpTabla) {
      this.inicializarSaneamientoCP();
    }
    this.datos.saneamientoCpTabla.push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('saneamientoCpTabla', this.datos.saneamientoCpTabla);
    this.calcularPorcentajesSaneamientoCP();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarSaneamientoCP(index: number) {
    if (this.datos.saneamientoCpTabla && this.datos.saneamientoCpTabla.length > 1) {
      const item = this.datos.saneamientoCpTabla[index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos.saneamientoCpTabla.splice(index, 1);
        this.formularioService.actualizarDato('saneamientoCpTabla', this.datos.saneamientoCpTabla);
        this.calcularPorcentajesSaneamientoCP();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarSaneamientoCP(index: number, field: string, value: any) {
    if (!this.datos.saneamientoCpTabla) {
      this.inicializarSaneamientoCP();
    }
    if (this.datos.saneamientoCpTabla[index]) {
      this.datos.saneamientoCpTabla[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesSaneamientoCP();
      }
      this.formularioService.actualizarDato('saneamientoCpTabla', this.datos.saneamientoCpTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesSaneamientoCP() {
    if (!this.datos.saneamientoCpTabla || this.datos.saneamientoCpTabla.length === 0) {
      return;
    }
    const totalItem = this.datos.saneamientoCpTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos.saneamientoCpTabla.forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarCoberturaElectricaCP() {
    if (!this.datos.coberturaElectricaCpTabla || this.datos.coberturaElectricaCpTabla.length === 0) {
      this.datos.coberturaElectricaCpTabla = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('coberturaElectricaCpTabla', this.datos.coberturaElectricaCpTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarCoberturaElectricaCP() {
    if (!this.datos.coberturaElectricaCpTabla) {
      this.inicializarCoberturaElectricaCP();
    }
    this.datos.coberturaElectricaCpTabla.push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('coberturaElectricaCpTabla', this.datos.coberturaElectricaCpTabla);
    this.calcularPorcentajesCoberturaElectricaCP();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCoberturaElectricaCP(index: number) {
    if (this.datos.coberturaElectricaCpTabla && this.datos.coberturaElectricaCpTabla.length > 1) {
      const item = this.datos.coberturaElectricaCpTabla[index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos.coberturaElectricaCpTabla.splice(index, 1);
        this.formularioService.actualizarDato('coberturaElectricaCpTabla', this.datos.coberturaElectricaCpTabla);
        this.calcularPorcentajesCoberturaElectricaCP();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarCoberturaElectricaCP(index: number, field: string, value: any) {
    if (!this.datos.coberturaElectricaCpTabla) {
      this.inicializarCoberturaElectricaCP();
    }
    if (this.datos.coberturaElectricaCpTabla[index]) {
      this.datos.coberturaElectricaCpTabla[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesCoberturaElectricaCP();
      }
      this.formularioService.actualizarDato('coberturaElectricaCpTabla', this.datos.coberturaElectricaCpTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesCoberturaElectricaCP() {
    if (!this.datos.coberturaElectricaCpTabla || this.datos.coberturaElectricaCpTabla.length === 0) {
      return;
    }
    const totalItem = this.datos.coberturaElectricaCpTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos.coberturaElectricaCpTabla.forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarCombustiblesCocinarCP() {
    if (!this.datos.combustiblesCocinarCpTabla || this.datos.combustiblesCocinarCpTabla.length === 0) {
      this.datos.combustiblesCocinarCpTabla = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('combustiblesCocinarCpTabla', this.datos.combustiblesCocinarCpTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarCombustiblesCocinarCP() {
    if (!this.datos.combustiblesCocinarCpTabla) {
      this.inicializarCombustiblesCocinarCP();
    }
    this.datos.combustiblesCocinarCpTabla.push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('combustiblesCocinarCpTabla', this.datos.combustiblesCocinarCpTabla);
    this.calcularPorcentajesCombustiblesCocinarCP();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarCombustiblesCocinarCP(index: number) {
    if (this.datos.combustiblesCocinarCpTabla && this.datos.combustiblesCocinarCpTabla.length > 1) {
      const item = this.datos.combustiblesCocinarCpTabla[index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos.combustiblesCocinarCpTabla.splice(index, 1);
        this.formularioService.actualizarDato('combustiblesCocinarCpTabla', this.datos.combustiblesCocinarCpTabla);
        this.calcularPorcentajesCombustiblesCocinarCP();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarCombustiblesCocinarCP(index: number, field: string, value: any) {
    if (!this.datos.combustiblesCocinarCpTabla) {
      this.inicializarCombustiblesCocinarCP();
    }
    if (this.datos.combustiblesCocinarCpTabla[index]) {
      this.datos.combustiblesCocinarCpTabla[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesCombustiblesCocinarCP();
      }
      this.formularioService.actualizarDato('combustiblesCocinarCpTabla', this.datos.combustiblesCocinarCpTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesCombustiblesCocinarCP() {
    if (!this.datos.combustiblesCocinarCpTabla || this.datos.combustiblesCocinarCpTabla.length === 0) {
      return;
    }
    const totalItem = this.datos.combustiblesCocinarCpTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos.combustiblesCocinarCpTabla.forEach((item: any) => {
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
    if (!this.datos.telecomunicacionesCpTabla || this.datos.telecomunicacionesCpTabla.length === 0) {
      this.datos.telecomunicacionesCpTabla = [
        { medio: '', descripcion: '' }
      ];
      this.formularioService.actualizarDato('telecomunicacionesCpTabla', this.datos.telecomunicacionesCpTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarTelecomunicacionesCP() {
    if (!this.datos.telecomunicacionesCpTabla) {
      this.inicializarTelecomunicacionesCP();
    }
    this.datos.telecomunicacionesCpTabla.push({ medio: '', descripcion: '' });
    this.formularioService.actualizarDato('telecomunicacionesCpTabla', this.datos.telecomunicacionesCpTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarTelecomunicacionesCP(index: number) {
    if (this.datos.telecomunicacionesCpTabla && this.datos.telecomunicacionesCpTabla.length > 1) {
      this.datos.telecomunicacionesCpTabla.splice(index, 1);
      this.formularioService.actualizarDato('telecomunicacionesCpTabla', this.datos.telecomunicacionesCpTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarTelecomunicacionesCP(index: number, field: string, value: any) {
    if (!this.datos.telecomunicacionesCpTabla) {
      this.inicializarTelecomunicacionesCP();
    }
    if (this.datos.telecomunicacionesCpTabla[index]) {
      this.datos.telecomunicacionesCpTabla[index][field] = value;
      this.formularioService.actualizarDato('telecomunicacionesCpTabla', this.datos.telecomunicacionesCpTabla);
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
    if (!this.datos.puestoSaludCpTabla || this.datos.puestoSaludCpTabla.length === 0) {
      this.datos.puestoSaludCpTabla = [
        { categoria: '', descripcion: '' }
      ];
      this.formularioService.actualizarDato('puestoSaludCpTabla', this.datos.puestoSaludCpTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarPuestoSaludCP() {
    if (!this.datos.puestoSaludCpTabla) {
      this.inicializarPuestoSaludCP();
    }
    this.datos.puestoSaludCpTabla.push({ categoria: '', descripcion: '' });
    this.formularioService.actualizarDato('puestoSaludCpTabla', this.datos.puestoSaludCpTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarPuestoSaludCP(index: number) {
    if (this.datos.puestoSaludCpTabla && this.datos.puestoSaludCpTabla.length > 1) {
      this.datos.puestoSaludCpTabla.splice(index, 1);
      this.formularioService.actualizarDato('puestoSaludCpTabla', this.datos.puestoSaludCpTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarPuestoSaludCP(index: number, field: string, value: any) {
    if (!this.datos.puestoSaludCpTabla) {
      this.inicializarPuestoSaludCP();
    }
    if (this.datos.puestoSaludCpTabla[index]) {
      this.datos.puestoSaludCpTabla[index][field] = value;
      this.formularioService.actualizarDato('puestoSaludCpTabla', this.datos.puestoSaludCpTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarEducacionCP() {
    if (!this.datos.educacionCpTabla || this.datos.educacionCpTabla.length === 0) {
      this.datos.educacionCpTabla = [
        { nombreIE: '', nivel: '', tipoGestion: '', cantidadEstudiantes: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('educacionCpTabla', this.datos.educacionCpTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarEducacionCP() {
    if (!this.datos.educacionCpTabla) {
      this.inicializarEducacionCP();
    }
    this.datos.educacionCpTabla.push({ nombreIE: '', nivel: '', tipoGestion: '', cantidadEstudiantes: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('educacionCpTabla', this.datos.educacionCpTabla);
    this.calcularPorcentajesEducacionCP();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarEducacionCP(index: number) {
    if (this.datos.educacionCpTabla && this.datos.educacionCpTabla.length > 1) {
      const item = this.datos.educacionCpTabla[index];
      if (!item.nombreIE || !item.nombreIE.toLowerCase().includes('total')) {
        this.datos.educacionCpTabla.splice(index, 1);
        this.formularioService.actualizarDato('educacionCpTabla', this.datos.educacionCpTabla);
        this.calcularPorcentajesEducacionCP();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarEducacionCP(index: number, field: string, value: any) {
    if (!this.datos.educacionCpTabla) {
      this.inicializarEducacionCP();
    }
    if (this.datos.educacionCpTabla[index]) {
      this.datos.educacionCpTabla[index][field] = value;
      if (field === 'cantidadEstudiantes') {
        this.calcularPorcentajesEducacionCP();
      }
      this.formularioService.actualizarDato('educacionCpTabla', this.datos.educacionCpTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesEducacionCP() {
    if (!this.datos.educacionCpTabla || this.datos.educacionCpTabla.length === 0) {
      return;
    }
    const totalItem = this.datos.educacionCpTabla.find((item: any) => 
      item.nombreIE && item.nombreIE.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.cantidadEstudiantes) || 0 : 0;
    
    if (total > 0) {
      this.datos.educacionCpTabla.forEach((item: any) => {
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
    if (!this.datos.natalidadMortalidadCpTabla || this.datos.natalidadMortalidadCpTabla.length === 0) {
      this.datos.natalidadMortalidadCpTabla = [
        { anio: '', natalidad: 0, mortalidad: 0 }
      ];
      this.formularioService.actualizarDato('natalidadMortalidadCpTabla', this.datos.natalidadMortalidadCpTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarNatalidadMortalidadCP() {
    if (!this.datos.natalidadMortalidadCpTabla) {
      this.inicializarNatalidadMortalidadCP();
    }
    this.datos.natalidadMortalidadCpTabla.push({ anio: '', natalidad: 0, mortalidad: 0 });
    this.formularioService.actualizarDato('natalidadMortalidadCpTabla', this.datos.natalidadMortalidadCpTabla);
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarNatalidadMortalidadCP(index: number) {
    if (this.datos.natalidadMortalidadCpTabla && this.datos.natalidadMortalidadCpTabla.length > 1) {
      this.datos.natalidadMortalidadCpTabla.splice(index, 1);
      this.formularioService.actualizarDato('natalidadMortalidadCpTabla', this.datos.natalidadMortalidadCpTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarNatalidadMortalidadCP(index: number, field: string, value: any) {
    if (!this.datos.natalidadMortalidadCpTabla) {
      this.inicializarNatalidadMortalidadCP();
    }
    if (this.datos.natalidadMortalidadCpTabla[index]) {
      this.datos.natalidadMortalidadCpTabla[index][field] = value;
      this.formularioService.actualizarDato('natalidadMortalidadCpTabla', this.datos.natalidadMortalidadCpTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  inicializarMorbilidadCP() {
    if (!this.datos.morbilidadCpTabla || this.datos.morbilidadCpTabla.length === 0) {
      this.datos.morbilidadCpTabla = [
        { grupo: '', edad0_11: 0, edad12_17: 0, edad18_29: 0, edad30_59: 0, edad60_mas: 0, casos: 0 }
      ];
      this.formularioService.actualizarDato('morbilidadCpTabla', this.datos.morbilidadCpTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarMorbilidadCP() {
    if (!this.datos.morbilidadCpTabla) {
      this.inicializarMorbilidadCP();
    }
    this.datos.morbilidadCpTabla.push({ grupo: '', edad0_11: 0, edad12_17: 0, edad18_29: 0, edad30_59: 0, edad60_mas: 0, casos: 0 });
    this.formularioService.actualizarDato('morbilidadCpTabla', this.datos.morbilidadCpTabla);
    this.calcularTotalesMorbilidadCP();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarMorbilidadCP(index: number) {
    if (this.datos.morbilidadCpTabla && this.datos.morbilidadCpTabla.length > 1) {
      this.datos.morbilidadCpTabla.splice(index, 1);
      this.formularioService.actualizarDato('morbilidadCpTabla', this.datos.morbilidadCpTabla);
      this.calcularTotalesMorbilidadCP();
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  actualizarMorbilidadCP(index: number, field: string, value: any) {
    if (!this.datos.morbilidadCpTabla) {
      this.inicializarMorbilidadCP();
    }
    if (this.datos.morbilidadCpTabla[index]) {
      this.datos.morbilidadCpTabla[index][field] = value;
      if (field !== 'casos' && field !== 'grupo') {
        this.calcularTotalesMorbilidadCP();
      }
      this.formularioService.actualizarDato('morbilidadCpTabla', this.datos.morbilidadCpTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularTotalesMorbilidadCP() {
    if (!this.datos.morbilidadCpTabla || this.datos.morbilidadCpTabla.length === 0) {
      return;
    }
    this.datos.morbilidadCpTabla.forEach((item: any) => {
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
    if (!this.datos.afiliacionSaludTabla || this.datos.afiliacionSaludTabla.length === 0) {
      this.datos.afiliacionSaludTabla = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('afiliacionSaludTabla', this.datos.afiliacionSaludTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarAfiliacionSaludTabla() {
    if (!this.datos.afiliacionSaludTabla) {
      this.inicializarAfiliacionSaludTabla();
    }
    this.datos.afiliacionSaludTabla.push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('afiliacionSaludTabla', this.datos.afiliacionSaludTabla);
    this.calcularPorcentajesAfiliacionSaludTabla();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarAfiliacionSaludTabla(index: number) {
    if (this.datos.afiliacionSaludTabla && this.datos.afiliacionSaludTabla.length > 1) {
      const item = this.datos.afiliacionSaludTabla[index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos.afiliacionSaludTabla.splice(index, 1);
        this.formularioService.actualizarDato('afiliacionSaludTabla', this.datos.afiliacionSaludTabla);
        this.calcularPorcentajesAfiliacionSaludTabla();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarAfiliacionSaludTabla(index: number, field: string, value: any) {
    if (!this.datos.afiliacionSaludTabla) {
      this.inicializarAfiliacionSaludTabla();
    }
    if (this.datos.afiliacionSaludTabla[index]) {
      this.datos.afiliacionSaludTabla[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesAfiliacionSaludTabla();
      }
      this.formularioService.actualizarDato('afiliacionSaludTabla', this.datos.afiliacionSaludTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesAfiliacionSaludTabla() {
    if (!this.datos.afiliacionSaludTabla || this.datos.afiliacionSaludTabla.length === 0) {
      return;
    }
    const totalItem = this.datos.afiliacionSaludTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos.afiliacionSaludTabla.forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarNivelEducativoTabla() {
    if (!this.datos.nivelEducativoTabla || this.datos.nivelEducativoTabla.length === 0) {
      this.datos.nivelEducativoTabla = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos.nivelEducativoTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarNivelEducativoTabla() {
    if (!this.datos.nivelEducativoTabla) {
      this.inicializarNivelEducativoTabla();
    }
    this.datos.nivelEducativoTabla.push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('nivelEducativoTabla', this.datos.nivelEducativoTabla);
    this.calcularPorcentajesNivelEducativoTabla();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarNivelEducativoTabla(index: number) {
    if (this.datos.nivelEducativoTabla && this.datos.nivelEducativoTabla.length > 1) {
      const item = this.datos.nivelEducativoTabla[index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos.nivelEducativoTabla.splice(index, 1);
        this.formularioService.actualizarDato('nivelEducativoTabla', this.datos.nivelEducativoTabla);
        this.calcularPorcentajesNivelEducativoTabla();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarNivelEducativoTabla(index: number, field: string, value: any) {
    if (!this.datos.nivelEducativoTabla) {
      this.inicializarNivelEducativoTabla();
    }
    if (this.datos.nivelEducativoTabla[index]) {
      this.datos.nivelEducativoTabla[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesNivelEducativoTabla();
      }
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos.nivelEducativoTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesNivelEducativoTabla() {
    if (!this.datos.nivelEducativoTabla || this.datos.nivelEducativoTabla.length === 0) {
      return;
    }
    const totalItem = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos.nivelEducativoTabla.forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarTasaAnalfabetismoTabla() {
    if (!this.datos.tasaAnalfabetismoTabla || this.datos.tasaAnalfabetismoTabla.length === 0) {
      this.datos.tasaAnalfabetismoTabla = [
        { indicador: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos.tasaAnalfabetismoTabla);
      this.cdRef.detectChanges();
    }
  }

  agregarTasaAnalfabetismoTabla() {
    if (!this.datos.tasaAnalfabetismoTabla) {
      this.inicializarTasaAnalfabetismoTabla();
    }
    this.datos.tasaAnalfabetismoTabla.push({ indicador: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos.tasaAnalfabetismoTabla);
    this.calcularPorcentajesTasaAnalfabetismoTabla();
    this.actualizarComponenteSeccion();
    this.cdRef.detectChanges();
  }

  eliminarTasaAnalfabetismoTabla(index: number) {
    if (this.datos.tasaAnalfabetismoTabla && this.datos.tasaAnalfabetismoTabla.length > 1) {
      const item = this.datos.tasaAnalfabetismoTabla[index];
      if (!item.indicador || !item.indicador.toLowerCase().includes('total')) {
        this.datos.tasaAnalfabetismoTabla.splice(index, 1);
        this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos.tasaAnalfabetismoTabla);
        this.calcularPorcentajesTasaAnalfabetismoTabla();
        this.actualizarComponenteSeccion();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarTasaAnalfabetismoTabla(index: number, field: string, value: any) {
    if (!this.datos.tasaAnalfabetismoTabla) {
      this.inicializarTasaAnalfabetismoTabla();
    }
    if (this.datos.tasaAnalfabetismoTabla[index]) {
      this.datos.tasaAnalfabetismoTabla[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesTasaAnalfabetismoTabla();
      }
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos.tasaAnalfabetismoTabla);
      this.actualizarComponenteSeccion();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesTasaAnalfabetismoTabla() {
    if (!this.datos.tasaAnalfabetismoTabla || this.datos.tasaAnalfabetismoTabla.length === 0) {
      return;
    }
    const totalItem = this.datos.tasaAnalfabetismoTabla.find((item: any) => 
      item.indicador && item.indicador.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos.tasaAnalfabetismoTabla.forEach((item: any) => {
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
      datosPrueba.altitudAISD = '3599';
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
    } else {
      this.sectionFields.forEach(field => {
        if (field.type === 'text' || field.type === 'textarea') {
          datosPrueba[field.id] = `Dato de prueba para ${field.label || field.id}`;
        } else if (field.type === 'number') {
          datosPrueba[field.id] = Math.floor(Math.random() * 1000);
        } else if (field.type === 'select') {
          if (field.options && field.options.length > 0) {
            datosPrueba[field.id] = field.options[0].value;
          }
        } else if (field.type === 'autocomplete') {
          datosPrueba[field.id] = `Prueba ${field.label || field.id}`;
        }
      });
    }

    Object.keys(datosPrueba).forEach(key => {
      if (key === 'poblacionSexoAISD' || key === 'poblacionEtarioAISD' || key === 'tablepagina6' || key === 'petTabla' || key === 'peaTabla' || key === 'peaOcupadaTabla' || key === 'peaOcupacionesTabla' || key === 'poblacionPecuariaTabla' || key === 'caracteristicasAgriculturaTabla' || key === 'condicionOcupacionTabla' || key === 'tiposMaterialesTabla' || key === 'abastecimientoAguaTabla' || key === 'tiposSaneamientoTabla' || key === 'saneamientoTabla' || key === 'coberturaElectricaTabla' || key === 'telecomunicacionesTabla' || key === 'caracteristicasSaludTabla' || key === 'cantidadEstudiantesEducacionTabla' || key === 'ieAyrocaTabla' || key === 'ie40270Tabla' || key === 'alumnosIEAyrocaTabla' || key === 'alumnosIE40270Tabla' || key === 'natalidadMortalidadTabla' || key === 'morbilidadTabla' || key === 'morbiliadTabla' || key === 'afiliacionSaludTabla' || key === 'seguroSaludTabla' || key === 'nivelEducativoTabla' || key === 'tasaAnalfabetismoTabla' || key === 'lenguasMaternasTabla' || key === 'religionesTabla' || key === 'indiceDesarrolloHumanoTabla' || key === 'nbiCCAyrocaTabla' || key === 'nbiDistritoCahuachoTabla' || key === 'autoridades' || key === 'festividades' || key === 'ubicacionCpTabla' || key === 'poblacionSexoAISI' || key === 'poblacionEtarioAISI' || key === 'petGruposEdadAISI' || key === 'peaDistritoSexoTabla' || key === 'peaOcupadaDesocupadaTabla' || key === 'actividadesEconomicasAISI' || key === 'tiposViviendaAISI' || key === 'condicionOcupacionAISI' || key === 'materialesViviendaAISI' || key === 'abastecimientoAguaCpTabla' || key === 'saneamientoCpTabla' || key === 'coberturaElectricaCpTabla' || key === 'combustiblesCocinarCpTabla' || key === 'telecomunicacionesCpTabla' || key === 'puestoSaludCpTabla' || key === 'educacionCpTabla' || key === 'natalidadMortalidadCpTabla' || key === 'morbilidadCpTabla') {
        this.datos[key] = datosPrueba[key];
        this.formularioService.actualizarDato(key, datosPrueba[key]);
        if (key === 'morbilidadTabla') {
          if (this.datos.morbiliadTabla) {
            delete this.datos.morbiliadTabla;
            this.formularioService.actualizarDato('morbiliadTabla', null);
          }
        }
      } else {
        this.onFieldChange(key, datosPrueba[key]);
      }
    });
    
    if (this.seccionId === '3.1.4.A.1.2' || this.seccionId === '3.1.4.A.1.3' || this.seccionId === '3.1.4.A.1.4' || this.seccionId === '3.1.4.A.1.5' || this.seccionId === '3.1.4.A.1.6' || this.seccionId === '3.1.4.A.1.7' || this.seccionId === '3.1.4.A.1.8' || this.seccionId === '3.1.4.A.1.9' || this.seccionId === '3.1.4.A.1.10' || this.seccionId === '3.1.4.A.1.11' || this.seccionId === '3.1.4.A.1.12' || this.seccionId === '3.1.4.A.1.13' || this.seccionId === '3.1.4.A.1.14' || this.seccionId === '3.1.4.A.1.15' || this.seccionId === '3.1.4.A.1.16' || this.seccionId === '3.1.4.B' || this.seccionId === '3.1.4.B.1' || this.seccionId === '3.1.4.B.1.1' || this.seccionId === '3.1.4.B.1.2' || this.seccionId === '3.1.4.B.1.3' || this.seccionId === '3.1.4.B.1.4' || this.seccionId === '3.1.4.B.1.5' || this.seccionId === '3.1.4.B.1.6' || this.seccionId === '3.1.4.B.1.7' || this.seccionId === '3.1.4.B.1.8' || this.seccionId === '3.1.4.B.1.9') {
      setTimeout(() => {
        this.datos = this.formularioService.obtenerDatos();
        this.formData = { ...this.datos };
        if (this.seccionId === '3.1.4.A.1.9' && datosPrueba.morbilidadTabla) {
          this.datos.morbilidadTabla = datosPrueba.morbilidadTabla;
          if (this.datos.morbiliadTabla) {
            delete this.datos.morbiliadTabla;
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

    const distritoKeys = Object.keys(jsonData);
    
    if (distritoKeys.length === 0) {
      alert('El JSON no contiene datos válidos.');
      return;
    }

    const primerDistrito = distritoKeys[0];
    const centrosPoblados = jsonData[primerDistrito];

    if (!Array.isArray(centrosPoblados) || centrosPoblados.length === 0) {
      alert('El JSON no contiene un array de centros poblados válido.');
      return;
    }

    const capitalDistrital = centrosPoblados.find((cp: any) => cp.CATEGORIA === 'Capital distrital');
    const centroPobladoPrincipal = capitalDistrital || centrosPoblados[0];

    this.centrosPobladosJSON = centrosPoblados.map((cp: any) => ({
      ...cp,
      selected: cp === centroPobladoPrincipal
    }));

    if (centrosPoblados.length > 0) {
      const primerCP = centrosPoblados[0];
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

    this.poblarTablaAISD2DesdeJSON(centrosPoblados);

    this.formularioService.guardarJSON(centrosPoblados);
    
    this.formularioService.actualizarDatos(this.datos);
    this.cdRef.detectChanges();
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
}

