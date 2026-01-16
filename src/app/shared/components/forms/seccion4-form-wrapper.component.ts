import { Component, Input, OnDestroy, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { StateService } from 'src/app/core/services/state.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { TableAdapterService } from 'src/app/core/services/table-adapter.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion4-form-wrapper',
  templateUrl: './seccion4-form-wrapper.component.html',
  styleUrls: ['./seccion4-form-wrapper.component.css']
})
export class Seccion4FormWrapperComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  
  fotografiasUbicacionFormMulti: FotoItem[] = [];
  fotografiasPoblacionFormMulti: FotoItem[] = [];
  
  formData: any = {};
  autocompleteData: any = {};
  filasTablaAISD2: number = 1;
  private stateSubscription?: Subscription;
  private sincronizando: boolean = false;

  tablaAISD1Config: TableConfig = {
    tablaKey: 'tablaAISD1Datos',
    totalKey: 'localidad',
    campoTotal: 'localidad',
    campoPorcentaje: '',
    estructuraInicial: [{
      localidad: '',
      coordenadas: '',
      altitud: '',
      distrito: '',
      provincia: '',
      departamento: ''
    }]
  };

  tablaAISD2Config: TableConfig = {
    tablaKey: 'tablaAISD2Datos',
    totalKey: 'punto',
    campoTotal: 'punto',
    campoPorcentaje: '',
    estructuraInicial: [{
      punto: '',
      codigo: '',
      poblacion: '',
      viviendasEmpadronadas: '',
      viviendasOcupadas: ''
    }]
  };

  override watchedFields: string[] = [
    'distritoSeleccionado',
    'coordenadasAISD',
    'altitudAISD',
    'cuadroTituloAISD1',
    'cuadroFuenteAISD1',
    'tablaAISD1Localidad',
    'tablaAISD1Coordenadas',
    'tablaAISD1Altitud',
    'tablaAISD1Distrito',
    'tablaAISD1Provincia',
    'tablaAISD1Departamento',
    'tablaAISD1Datos',
    'tablaAISD2Datos',
    'cuadroTituloAISD2',
    'cuadroFuenteAISD2',
    'parrafoSeccion4_introduccion_aisd',
    'parrafoSeccion4_comunidad_completo',
    'parrafoSeccion4_caracterizacion_indicadores'
  ];

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    private stateService: StateService,
    private tableService: TableManagementService,
    private tableAdapter: TableAdapterService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override onInitCustom(): void {
    console.log('[Seccion4FormWrapper] onInitCustom - INICIO');
    this.cargarFotografias();
    this.inicializarTablas();
    this.stateSubscription = this.stateService.datos$.subscribe(() => {
      console.log('[Seccion4FormWrapper] stateService.datos$ - Cambio detectado', {
        sincronizando: this.sincronizando,
        tablaAISD1Datos: this.datos?.tablaAISD1Datos?.length,
        tablaAISD2Datos: this.datos?.tablaAISD2Datos?.length
      });
      if (!this.sincronizando) {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      } else {
        console.log('[Seccion4FormWrapper] stateService.datos$ - Ignorando cambio (sincronizando)');
      }
    });
    setTimeout(() => {
      const seccion4 = ViewChildHelper.getComponent('seccion4');
      if (seccion4 && seccion4['autocompleteData']) {
        this.autocompleteData = { ...this.autocompleteData, ...seccion4['autocompleteData'] };
      }
    }, 100);
  }

  protected override onChangesCustom(changes: SimpleChanges): void {
    if (changes['seccionId']) {
      this.cargarFotografias();
      if (!this.sincronizando) {
        setTimeout(() => {
          this.inicializarTablas();
        }, 100);
      }
    }
    if (changes['datos'] && !this.sincronizando) {
      setTimeout(() => {
        this.inicializarTablas();
      }, 100);
    }
  }

  protected override actualizarDatosCustom(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const camposAISD2 = [];
    for (let i = 1; i <= 3; i++) {
      const campoPunto = prefijo ? `tablaAISD2Fila${i}Punto${prefijo}` : `tablaAISD2Fila${i}Punto`;
      const campoCodigo = prefijo ? `tablaAISD2Fila${i}Codigo${prefijo}` : `tablaAISD2Fila${i}Codigo`;
      camposAISD2.push({
        fila: i,
        punto: this.datos?.[campoPunto] || this.datos?.[`tablaAISD2Fila${i}Punto`],
        codigo: this.datos?.[campoCodigo] || this.datos?.[`tablaAISD2Fila${i}Codigo`]
      });
    }
    
    console.log('[Seccion4FormWrapper] actualizarDatosCustom - INICIO', {
      sincronizando: this.sincronizando,
      tieneDatos: !!this.datos,
      prefijo,
      tablaAISD1Datos: this.datos?.tablaAISD1Datos?.length,
      tablaAISD2Datos: this.datos?.tablaAISD2Datos?.length,
      tablaAISD1Localidad: this.datos?.tablaAISD1Localidad,
      tablaAISD1Coordenadas: this.datos?.tablaAISD1Coordenadas,
      primerosCamposAISD2: camposAISD2
    });
    
    if (!this.sincronizando) {
      const prefijosPosiblesAISD1 = ['', '_A1', '_A2', '_B1', '_B2'];
      let prefijoDetectadoAISD1 = prefijo;
      
      if (!prefijo) {
        for (const prefijoTest of prefijosPosiblesAISD1) {
          const campoTest = `tablaAISD1Localidad${prefijoTest}`;
          if (this.datos[campoTest] && this.datos[campoTest].toString().trim() !== '') {
            prefijoDetectadoAISD1 = prefijoTest;
            break;
          }
        }
      }
      
      const campoLocalidad = prefijoDetectadoAISD1 ? `tablaAISD1Localidad${prefijoDetectadoAISD1}` : 'tablaAISD1Localidad';
      const campoCoordenadas = prefijoDetectadoAISD1 ? `tablaAISD1Coordenadas${prefijoDetectadoAISD1}` : 'tablaAISD1Coordenadas';
      const campoAltitud = prefijoDetectadoAISD1 ? `tablaAISD1Altitud${prefijoDetectadoAISD1}` : 'tablaAISD1Altitud';
      
      const tieneDatosIndividualesAISD1 = !!(this.datos[campoLocalidad] || 
        this.datos[campoCoordenadas] || 
        this.datos[campoAltitud] ||
        this.datos.tablaAISD1Localidad ||
        this.datos.tablaAISD1Coordenadas ||
        this.datos.tablaAISD1Altitud);
      
      const tieneArrayValidoAISD1 = this.datos.tablaAISD1Datos && 
        Array.isArray(this.datos.tablaAISD1Datos) &&
        this.datos.tablaAISD1Datos.length > 0 &&
        this.datos.tablaAISD1Datos.some((fila: any) => {
          const localidad = fila.localidad || fila.Localidad || '';
          const coordenadas = fila.coordenadas || fila.Coordenadas || '';
          const altitud = fila.altitud || fila.Altitud || '';
          return (localidad && localidad.toString().trim() !== '' && localidad !== '____') ||
                 (coordenadas && coordenadas.toString().trim() !== '' && coordenadas !== '____') ||
                 (altitud && altitud.toString().trim() !== '' && altitud !== '____');
        });
      
      if (tieneDatosIndividualesAISD1 && !tieneArrayValidoAISD1) {
        console.log('[Seccion4FormWrapper] actualizarDatosCustom - Sincronizando AISD1 desde campos individuales');
        this.tableAdapter.sincronizarArrayDesdeCamposIndividuales(
          this.datos,
          'tablaAISD1Datos',
          {
            baseField: 'tablaAISD1',
            fields: ['Localidad', 'Coordenadas', 'Altitud', 'Distrito', 'Provincia', 'Departamento']
          },
          prefijoDetectadoAISD1,
          1,
          false,
          true
        );
      }
    }
    
    this.formData = { ...this.datos };
    this.cargarFotografias();
    if (!this.sincronizando && this.datos) {
      setTimeout(() => {
        console.log('[Seccion4FormWrapper] actualizarDatosCustom - Llamando sincronizarTablasDesdeCampos');
        this.sincronizarTablasDesdeCampos();
      }, 0);
    }
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      
      let haCambiado = false;
      
      if (Array.isArray(valorActual) || Array.isArray(valorAnterior)) {
        haCambiado = JSON.stringify(valorActual) !== JSON.stringify(valorAnterior);
      } else if (typeof valorActual === 'object' && valorActual !== null || 
                 typeof valorAnterior === 'object' && valorAnterior !== null) {
        haCambiado = JSON.stringify(valorActual) !== JSON.stringify(valorAnterior);
      } else {
        haCambiado = valorActual !== valorAnterior;
      }
      
      if (haCambiado) {
        hayCambios = true;
        if (Array.isArray(valorActual)) {
          this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
        } else if (typeof valorActual === 'object' && valorActual !== null) {
          this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
        } else {
          this.datosAnteriores[campo] = valorActual;
        }
      }
    }

    return hayCambios;
  }

  protected override actualizarValoresConPrefijo(): void {
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = (this.datos as any)[campo] || null;
    });
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  cargarFotografias() {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasUbicacionFormMulti = this.imageService.loadImages(
      this.seccionId,
      'fotografiaUbicacionReferencial',
      groupPrefix
    );
    this.fotografiasPoblacionFormMulti = this.imageService.loadImages(
      this.seccionId,
      'fotografiaPoblacionViviendas',
      groupPrefix
    );
  }

  override onFieldChange(fieldId: string, value: any) {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    this.formData[fieldId] = valorLimpio;
    super.onFieldChange(fieldId, valorLimpio);
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


  override obtenerValorConPrefijo(campo: string): any {
    return super.obtenerValorConPrefijo(campo);
  }

  inicializarTablas(): void {
    console.log('[Seccion4FormWrapper] inicializarTablas - INICIO', {
      sincronizando: this.sincronizando,
      tieneDatos: !!this.datos,
      tablaAISD1Datos: this.datos?.tablaAISD1Datos?.length,
      tablaAISD2Datos: this.datos?.tablaAISD2Datos?.length
    });
    
    if (this.sincronizando || !this.datos) {
      console.log('[Seccion4FormWrapper] inicializarTablas - SALIENDO (sincronizando o sin datos)');
      return;
    }
    
    this.sincronizando = true;
    const prefijo = this.obtenerPrefijoGrupo();
    console.log('[Seccion4FormWrapper] inicializarTablas - Prefijo:', prefijo);
    
    const camposAISD1EnDatos = Object.keys(this.datos).filter(key => key.startsWith('tablaAISD1')).slice(0, 10);
    
    const prefijosPosiblesAISD1 = ['', '_A1', '_A2', '_B1', '_B2'];
    let prefijoDetectadoAISD1 = prefijo;
    let tieneDatosConPrefijoAISD1 = false;
    
    if (!prefijo) {
      for (const prefijoTest of prefijosPosiblesAISD1) {
        const campoTest = `tablaAISD1Localidad${prefijoTest}`;
        if (this.datos[campoTest] && this.datos[campoTest].toString().trim() !== '') {
          prefijoDetectadoAISD1 = prefijoTest;
          tieneDatosConPrefijoAISD1 = true;
          console.log(`[Seccion4FormWrapper] Detectado prefijo AISD1 automáticamente: ${prefijoTest}`, {
            campoTest,
            valor: this.datos[campoTest]
          });
          break;
        }
      }
    }
    
    const campoLocalidad = prefijoDetectadoAISD1 ? `tablaAISD1Localidad${prefijoDetectadoAISD1}` : 'tablaAISD1Localidad';
    const campoCoordenadas = prefijoDetectadoAISD1 ? `tablaAISD1Coordenadas${prefijoDetectadoAISD1}` : 'tablaAISD1Coordenadas';
    const campoAltitud = prefijoDetectadoAISD1 ? `tablaAISD1Altitud${prefijoDetectadoAISD1}` : 'tablaAISD1Altitud';
    
    const tieneDatosIndividualesAISD1 = !!(this.datos[campoLocalidad] || 
      this.datos[campoCoordenadas] || 
      this.datos[campoAltitud] ||
      this.datos.tablaAISD1Localidad ||
      this.datos.tablaAISD1Coordenadas ||
      this.datos.tablaAISD1Altitud);
    
    const tieneArrayValidoAISD1 = this.datos.tablaAISD1Datos && 
      Array.isArray(this.datos.tablaAISD1Datos) &&
      this.datos.tablaAISD1Datos.length > 0 &&
      this.datos.tablaAISD1Datos.some((fila: any) => {
        const localidad = fila.localidad || fila.Localidad || '';
        const coordenadas = fila.coordenadas || fila.Coordenadas || '';
        const altitud = fila.altitud || fila.Altitud || '';
        const distrito = fila.distrito || fila.Distrito || '';
        const provincia = fila.provincia || fila.Provincia || '';
        const departamento = fila.departamento || fila.Departamento || '';
        return (localidad && localidad.toString().trim() !== '' && localidad !== '____') ||
               (coordenadas && coordenadas.toString().trim() !== '' && coordenadas !== '____') ||
               (altitud && altitud.toString().trim() !== '' && altitud !== '____') ||
               (distrito && distrito.toString().trim() !== '' && distrito !== '____') ||
               (provincia && provincia.toString().trim() !== '' && provincia !== '____') ||
               (departamento && departamento.toString().trim() !== '' && departamento !== '____');
      });
    
    const contenidoArrayCompleto = this.datos.tablaAISD1Datos ? 
      JSON.stringify(this.datos.tablaAISD1Datos, null, 2) : 'null';
    
    console.log('[Seccion4FormWrapper] inicializarTablas - AISD1', {
      prefijoOriginal: prefijo,
      prefijoDetectado: prefijoDetectadoAISD1,
      tieneDatosConPrefijo: tieneDatosConPrefijoAISD1,
      campoLocalidad,
      campoCoordenadas,
      campoAltitud,
      valorLocalidad: this.datos[campoLocalidad] || this.datos.tablaAISD1Localidad,
      valorCoordenadas: this.datos[campoCoordenadas] || this.datos.tablaAISD1Coordenadas,
      valorAltitud: this.datos[campoAltitud] || this.datos.tablaAISD1Altitud,
      tieneDatosIndividuales: !!tieneDatosIndividualesAISD1,
      tieneArray: !!this.datos.tablaAISD1Datos,
      tieneArrayValido: !!tieneArrayValidoAISD1,
      arrayLength: this.datos.tablaAISD1Datos?.length,
      contenidoArray: this.datos.tablaAISD1Datos?.[0],
      contenidoArrayCompleto,
      camposAISD1EnDatos
    });
    
    if (this.datos.tablaAISD1Datos && Array.isArray(this.datos.tablaAISD1Datos) && this.datos.tablaAISD1Datos.length > 0) {
      console.log('[Seccion4FormWrapper] inicializarTablas - AISD1 tiene array, normalizando claves siempre');
      const arrayCompletoAISD1 = this.datos.tablaAISD1Datos;
      
      let localidadDesdeAISD2 = '';
      if (this.datos.tablaAISD2Datos && Array.isArray(this.datos.tablaAISD2Datos) && this.datos.tablaAISD2Datos.length > 0) {
        const primeraFilaAISD2 = this.datos.tablaAISD2Datos[0];
        const puntoAISD2 = primeraFilaAISD2?.punto || primeraFilaAISD2?.Punto || '';
        if (puntoAISD2 && puntoAISD2.toString().trim() !== '' && puntoAISD2 !== '____') {
          localidadDesdeAISD2 = puntoAISD2.toString().trim();
          console.log('[Seccion4FormWrapper] Localidad obtenida desde AISD2:', localidadDesdeAISD2);
        }
      }
      
      if (!localidadDesdeAISD2) {
        const prefijosPosiblesAISD2 = ['', '_A1', '_A2', '_B1', '_B2'];
        for (const prefijoTest of prefijosPosiblesAISD2) {
          const campoTest = `tablaAISD2Fila1Punto${prefijoTest}`;
          if (this.datos[campoTest] && this.datos[campoTest].toString().trim() !== '' && this.datos[campoTest] !== '____') {
            localidadDesdeAISD2 = this.datos[campoTest].toString().trim();
            console.log('[Seccion4FormWrapper] Localidad obtenida desde campo individual AISD2:', localidadDesdeAISD2, { campoTest });
            break;
          }
        }
      }
      
      const arrayNormalizadoAISD1 = arrayCompletoAISD1.map((fila: any) => {
        const localidad = fila.localidad || fila.Localidad || '';
        const coordenadas = fila.coordenadas || fila.Coordenadas || '';
        const altitud = fila.altitud || fila.Altitud || '';
        const distrito = fila.distrito || fila.Distrito || '';
        const provincia = fila.provincia || fila.Provincia || '';
        const departamento = fila.departamento || fila.Departamento || '';
        
        const nombreComunidad = this.obtenerNombreComunidadActual();
        const localidadFinal = localidad && localidad.toString().trim() !== '' && localidad !== '____' 
          ? localidad 
          : (this.datos.tablaAISD1Localidad && this.datos.tablaAISD1Localidad.toString().trim() !== '' && this.datos.tablaAISD1Localidad !== '____'
            ? this.datos.tablaAISD1Localidad 
            : (nombreComunidad && nombreComunidad !== '____' 
              ? nombreComunidad 
              : (localidadDesdeAISD2 || '')));
        
        return {
          localidad: localidadFinal,
          coordenadas: coordenadas && coordenadas.toString().trim() !== '' && coordenadas !== '____' ? coordenadas : (this.datos.tablaAISD1Coordenadas || this.datos.coordenadasAISD || ''),
          altitud: altitud && altitud.toString().trim() !== '' && altitud !== '____' ? altitud : (this.datos.tablaAISD1Altitud || this.datos.altitudAISD || ''),
          distrito: distrito && distrito.toString().trim() !== '' && distrito !== '____' ? distrito : (this.datos.tablaAISD1Distrito || this.datos.distritoSeleccionado || ''),
          provincia: provincia && provincia.toString().trim() !== '' && provincia !== '____' ? provincia : (this.datos.tablaAISD1Provincia || this.datos.provinciaSeleccionada || ''),
          departamento: departamento && departamento.toString().trim() !== '' && departamento !== '____' ? departamento : (this.datos.tablaAISD1Departamento || this.datos.departamentoSeleccionado || '')
        };
      });
      console.log('[Seccion4FormWrapper] Array AISD1 normalizado:', {
        totalFilas: arrayNormalizadoAISD1.length,
        primerElemento: arrayNormalizadoAISD1[0],
        arrayCompleto: JSON.stringify(arrayNormalizadoAISD1, null, 2)
      });
      this.datos.tablaAISD1Datos = arrayNormalizadoAISD1;
      this.formularioService.actualizarDato('tablaAISD1Datos', arrayNormalizadoAISD1);
      console.log('[Seccion4FormWrapper] Array AISD1 actualizado en datos y servicio');
    } else if (tieneDatosIndividualesAISD1) {
      console.log('[Seccion4FormWrapper] inicializarTablas - Sincronizando AISD1 desde campos individuales', {
        prefijoUsado: prefijoDetectadoAISD1
      });
      this.tableAdapter.sincronizarArrayDesdeCamposIndividuales(
        this.datos,
        'tablaAISD1Datos',
        {
          baseField: 'tablaAISD1',
          fields: ['Localidad', 'Coordenadas', 'Altitud', 'Distrito', 'Provincia', 'Departamento']
        },
        prefijoDetectadoAISD1,
        1,
        false,
        true
      );
      
      const nombreComunidad = this.obtenerNombreComunidadActual();
      let localidadDesdeAISD2 = '';
      if (this.datos.tablaAISD2Datos && Array.isArray(this.datos.tablaAISD2Datos) && this.datos.tablaAISD2Datos.length > 0) {
        const primeraFilaAISD2 = this.datos.tablaAISD2Datos[0];
        const puntoAISD2 = primeraFilaAISD2?.punto || primeraFilaAISD2?.Punto || '';
        if (puntoAISD2 && puntoAISD2.toString().trim() !== '' && puntoAISD2 !== '____') {
          localidadDesdeAISD2 = puntoAISD2.toString().trim();
        }
      }
      if (!localidadDesdeAISD2) {
        const prefijosPosiblesAISD2 = ['', '_A1', '_A2', '_B1', '_B2'];
        for (const prefijoTest of prefijosPosiblesAISD2) {
          const campoTest = `tablaAISD2Fila1Punto${prefijoTest}`;
          if (this.datos[campoTest] && this.datos[campoTest].toString().trim() !== '' && this.datos[campoTest] !== '____') {
            localidadDesdeAISD2 = this.datos[campoTest].toString().trim();
            break;
          }
        }
      }
      if (this.datos.tablaAISD1Datos && Array.isArray(this.datos.tablaAISD1Datos) && this.datos.tablaAISD1Datos.length > 0) {
        const primeraFila = this.datos.tablaAISD1Datos[0];
        if (!primeraFila.localidad || primeraFila.localidad.toString().trim() === '' || primeraFila.localidad === '____') {
          const localidadFinal = nombreComunidad && nombreComunidad !== '____' 
            ? nombreComunidad 
            : (localidadDesdeAISD2 || '');
          primeraFila.localidad = localidadFinal;
          this.formularioService.actualizarDato('tablaAISD1Datos', this.datos.tablaAISD1Datos);
          console.log('[Seccion4FormWrapper] Localidad llenada:', { nombreComunidad, localidadDesdeAISD2, localidadFinal });
        }
      }
    } else if (!this.datos.tablaAISD1Datos || this.datos.tablaAISD1Datos.length === 0) {
      console.log('[Seccion4FormWrapper] inicializarTablas - Creando AISD1 con valores por defecto');
      const nombreComunidad = this.obtenerNombreComunidadActual();
      let localidadDesdeAISD2 = '';
      if (this.datos.tablaAISD2Datos && Array.isArray(this.datos.tablaAISD2Datos) && this.datos.tablaAISD2Datos.length > 0) {
        const primeraFilaAISD2 = this.datos.tablaAISD2Datos[0];
        const puntoAISD2 = primeraFilaAISD2?.punto || primeraFilaAISD2?.Punto || '';
        if (puntoAISD2 && puntoAISD2.toString().trim() !== '' && puntoAISD2 !== '____') {
          localidadDesdeAISD2 = puntoAISD2.toString().trim();
        }
      }
      if (!localidadDesdeAISD2) {
        const prefijosPosiblesAISD2 = ['', '_A1', '_A2', '_B1', '_B2'];
        for (const prefijoTest of prefijosPosiblesAISD2) {
          const campoTest = `tablaAISD2Fila1Punto${prefijoTest}`;
          if (this.datos[campoTest] && this.datos[campoTest].toString().trim() !== '' && this.datos[campoTest] !== '____') {
            localidadDesdeAISD2 = this.datos[campoTest].toString().trim();
            break;
          }
        }
      }
      const localidadFinal = nombreComunidad && nombreComunidad !== '____' 
        ? nombreComunidad 
        : (localidadDesdeAISD2 || this.datos.tablaAISD1Localidad || '');
      console.log('[Seccion4FormWrapper] Nombre comunidad obtenido:', { nombreComunidad, localidadDesdeAISD2, localidadFinal });
      const filaInicial = {
        localidad: localidadFinal,
        coordenadas: this.datos.tablaAISD1Coordenadas || this.datos.coordenadasAISD || '',
        altitud: this.datos.tablaAISD1Altitud || this.datos.altitudAISD || '',
        distrito: this.datos.tablaAISD1Distrito || this.datos.distritoSeleccionado || '',
        provincia: this.datos.tablaAISD1Provincia || this.datos.provinciaSeleccionada || '',
        departamento: this.datos.tablaAISD1Departamento || this.datos.departamentoSeleccionado || ''
      };
      console.log('[Seccion4FormWrapper] Fila inicial creada:', filaInicial);
      this.datos.tablaAISD1Datos = [filaInicial];
      this.formularioService.actualizarDato('tablaAISD1Datos', this.datos.tablaAISD1Datos);
    }
    
    const camposAISD2EnDatos = Object.keys(this.datos).filter(key => key.startsWith('tablaAISD2Fila')).slice(0, 10);
    
    const prefijosPosibles = ['', '_A1', '_A2', '_B1', '_B2'];
    let prefijoDetectado = prefijo;
    let tieneDatosConPrefijo = false;
    
    if (!prefijo) {
      for (const prefijoTest of prefijosPosibles) {
        const campoTest = `tablaAISD2Fila1Punto${prefijoTest}`;
        if (this.datos[campoTest] && this.datos[campoTest].toString().trim() !== '') {
          prefijoDetectado = prefijoTest;
          tieneDatosConPrefijo = true;
          console.log(`[Seccion4FormWrapper] Detectado prefijo automáticamente: ${prefijoTest}`, {
            campoTest,
            valor: this.datos[campoTest]
          });
          break;
        }
      }
    }
    
    const campoPunto = prefijoDetectado ? `tablaAISD2Fila1Punto${prefijoDetectado}` : 'tablaAISD2Fila1Punto';
    const campoCodigo = prefijoDetectado ? `tablaAISD2Fila1Codigo${prefijoDetectado}` : 'tablaAISD2Fila1Codigo';
    const campoPoblacion = prefijoDetectado ? `tablaAISD2Fila1Poblacion${prefijoDetectado}` : 'tablaAISD2Fila1Poblacion';
    
    const valoresPrimerasFilas = [];
    for (let i = 1; i <= 3; i++) {
      const punto = prefijoDetectado 
        ? (this.datos[`tablaAISD2Fila${i}Punto${prefijoDetectado}`] || this.datos[`tablaAISD2Fila${i}Punto`])
        : (this.datos[`tablaAISD2Fila${i}Punto`] || this.datos[`tablaAISD2Fila${i}Punto${prefijoDetectado}`]);
      const codigo = prefijoDetectado 
        ? (this.datos[`tablaAISD2Fila${i}Codigo${prefijoDetectado}`] || this.datos[`tablaAISD2Fila${i}Codigo`])
        : (this.datos[`tablaAISD2Fila${i}Codigo`] || this.datos[`tablaAISD2Fila${i}Codigo${prefijoDetectado}`]);
      const poblacion = prefijoDetectado 
        ? (this.datos[`tablaAISD2Fila${i}Poblacion${prefijoDetectado}`] || this.datos[`tablaAISD2Fila${i}Poblacion`])
        : (this.datos[`tablaAISD2Fila${i}Poblacion`] || this.datos[`tablaAISD2Fila${i}Poblacion${prefijoDetectado}`]);
      if (punto || codigo || poblacion) {
        valoresPrimerasFilas.push({ fila: i, punto, codigo, poblacion });
      }
    }
    
    const tieneDatosIndividualesAISD2 = !!(this.datos[campoPunto] || this.datos[campoCodigo] || this.datos[campoPoblacion]) ||
      valoresPrimerasFilas.length > 0;
    
    console.log('[Seccion4FormWrapper] inicializarTablas - AISD2', {
      prefijoOriginal: prefijo,
      prefijoDetectado,
      tieneDatosConPrefijo,
      seccionId: this.seccionId,
      campoPunto,
      campoCodigo,
      campoPoblacion,
      valorCampoPunto: this.datos[campoPunto],
      valorCampoCodigo: this.datos[campoCodigo],
      valorCampoPoblacion: this.datos[campoPoblacion],
      valorSinPrefijoPunto: this.datos.tablaAISD2Fila1Punto,
      valorSinPrefijoCodigo: this.datos.tablaAISD2Fila1Codigo,
      valorSinPrefijoPoblacion: this.datos.tablaAISD2Fila1Poblacion,
      tieneDatosIndividuales: !!tieneDatosIndividualesAISD2,
      tieneArray: !!this.datos.tablaAISD2Datos,
      arrayLength: this.datos.tablaAISD2Datos?.length,
      contenidoArray: this.datos.tablaAISD2Datos?.[0],
      contenidoArrayCompleto: this.datos.tablaAISD2Datos,
      camposAISD2EnDatos,
      valoresPrimerasFilas
    });
    
    const arrayCompleto = this.datos.tablaAISD2Datos;
    const tieneArrayValido = arrayCompleto && 
      Array.isArray(arrayCompleto) &&
      arrayCompleto.length > 0 &&
      arrayCompleto.some((fila: any) => {
        const punto = fila.punto || fila.Punto || '';
        const codigo = fila.codigo || fila.Codigo || '';
        const poblacion = fila.poblacion || fila.Poblacion || '';
        const viviendasEmp = fila.viviendasEmpadronadas || fila.ViviendasEmpadronadas || '';
        const viviendasOcp = fila.viviendasOcupadas || fila.ViviendasOcupadas || '';
        
        const tienePunto = punto && punto.toString().trim() !== '' && punto !== '____';
        const tieneCodigo = codigo && codigo.toString().trim() !== '' && codigo !== '____';
        const tienePoblacion = poblacion && poblacion.toString().trim() !== '' && poblacion !== '____';
        const tieneViviendasEmp = viviendasEmp && viviendasEmp.toString().trim() !== '' && viviendasEmp !== '____';
        const tieneViviendasOcp = viviendasOcp && viviendasOcp.toString().trim() !== '' && viviendasOcp !== '____';
        
        return tienePunto || tieneCodigo || tienePoblacion || tieneViviendasEmp || tieneViviendasOcp;
      });
    
    const analisisArray = arrayCompleto && Array.isArray(arrayCompleto) && arrayCompleto.length > 0
      ? arrayCompleto.slice(0, 3).map((fila: any, index: number) => ({
          fila: index + 1,
          claves: Object.keys(fila),
          tienePunto: !!(fila.punto || fila.Punto),
          tieneCodigo: !!(fila.codigo || fila.Codigo),
          tienePoblacion: !!(fila.poblacion || fila.Poblacion),
          valores: {
            punto: fila.punto || fila.Punto || '',
            codigo: fila.codigo || fila.Codigo || '',
            poblacion: fila.poblacion || fila.Poblacion || ''
          }
        }))
      : [];
    
    console.log('[Seccion4FormWrapper] inicializarTablas - Verificación array AISD2', {
      tieneArray: !!arrayCompleto,
      esArray: Array.isArray(arrayCompleto),
      length: arrayCompleto?.length,
      tieneArrayValido,
      analisisPrimerasFilas: analisisArray,
      arrayCompletoJSON: JSON.stringify(arrayCompleto?.slice(0, 5), null, 2)
    });
    
    const arrayVacioOInvalido = !tieneArrayValido;
    
    if (tieneArrayValido) {
      console.log('[Seccion4FormWrapper] inicializarTablas - AISD2 tiene array válido, normalizando claves');
      const arrayNormalizado = arrayCompleto.map((fila: any, index: number) => {
        const filaNormalizada = {
          punto: fila.punto || fila.Punto || '',
          codigo: fila.codigo || fila.Codigo || '',
          poblacion: fila.poblacion || fila.Poblacion || '',
          viviendasEmpadronadas: fila.viviendasEmpadronadas || fila.ViviendasEmpadronadas || '',
          viviendasOcupadas: fila.viviendasOcupadas || fila.ViviendasOcupadas || ''
        };
        if (index < 3) {
          console.log(`[Seccion4FormWrapper] Normalizando fila ${index + 1}:`, {
            original: { punto: fila.punto || fila.Punto, codigo: fila.codigo || fila.Codigo, poblacion: fila.poblacion || fila.Poblacion },
            normalizado: filaNormalizada
          });
        }
        return filaNormalizada;
      });
      console.log('[Seccion4FormWrapper] Array normalizado completo:', {
        totalFilas: arrayNormalizado.length,
        primeras3Filas: arrayNormalizado.slice(0, 3),
        tieneDatos: arrayNormalizado.some(f => f.punto || f.codigo || f.poblacion)
      });
      this.datos.tablaAISD2Datos = arrayNormalizado;
      this.formularioService.actualizarDato('tablaAISD2Datos', arrayNormalizado);
      console.log('[Seccion4FormWrapper] Array actualizado en datos y servicio');
    } else if (tieneDatosIndividualesAISD2) {
      console.log('[Seccion4FormWrapper] inicializarTablas - Sincronizando AISD2 desde campos individuales', {
        arrayVacioOInvalido,
        tieneDatosIndividualesAISD2
      });
      this.tableAdapter.sincronizarArrayDesdeCamposIndividuales(
        this.datos,
        'tablaAISD2Datos',
        {
          baseField: 'tablaAISD2',
          fields: ['Punto', 'Codigo', 'Poblacion', 'ViviendasEmpadronadas', 'ViviendasOcupadas']
        },
        prefijoDetectado,
        20,
        true,
        true
      );
      console.log('[Seccion4FormWrapper] inicializarTablas - AISD2 después de sincronizar', {
        arrayLength: this.datos.tablaAISD2Datos?.length,
        primerElemento: this.datos.tablaAISD2Datos?.[0],
        segundoElemento: this.datos.tablaAISD2Datos?.[1],
        arrayCompleto: JSON.stringify(this.datos.tablaAISD2Datos?.slice(0, 3), null, 2)
      });
    } else {
      console.log('[Seccion4FormWrapper] inicializarTablas - NO sincronizando AISD2 (array ya tiene datos válidos)');
    }
    
    setTimeout(() => {
      this.sincronizando = false;
      console.log('[Seccion4FormWrapper] inicializarTablas - FIN', {
      sincronizando: false,
      tablaAISD1Datos: {
        length: this.datos.tablaAISD1Datos?.length,
        tieneDatos: !!(this.datos.tablaAISD1Datos && this.datos.tablaAISD1Datos.length > 0)
      },
      tablaAISD2Datos: {
        length: this.datos.tablaAISD2Datos?.length,
        tieneDatos: !!(this.datos.tablaAISD2Datos && this.datos.tablaAISD2Datos.length > 0),
        primerElemento: this.datos.tablaAISD2Datos?.[0]
      }
    });
    }, 0);
  }

  sincronizarTablasDesdeCampos(): void {
    console.log('[Seccion4FormWrapper] sincronizarTablasDesdeCampos - INICIO', {
      sincronizando: this.sincronizando,
      tieneDatos: !!this.datos
    });
    
    if (this.sincronizando || !this.datos) {
      console.log('[Seccion4FormWrapper] sincronizarTablasDesdeCampos - SALIENDO (sincronizando o sin datos)');
      return;
    }
    
    this.sincronizando = true;
    const prefijo = this.obtenerPrefijoGrupo();
    console.log('[Seccion4FormWrapper] sincronizarTablasDesdeCampos - Prefijo:', prefijo);
    
    const prefijosPosiblesAISD1Sync = ['', '_A1', '_A2', '_B1', '_B2'];
    let prefijoDetectadoAISD1Sync = prefijo;
    
    if (!prefijo) {
      for (const prefijoTest of prefijosPosiblesAISD1Sync) {
        const campoTest = `tablaAISD1Localidad${prefijoTest}`;
        if (this.datos[campoTest] && this.datos[campoTest].toString().trim() !== '') {
          prefijoDetectadoAISD1Sync = prefijoTest;
          break;
        }
      }
    }
    
    const campoLocalidadSync = prefijoDetectadoAISD1Sync ? `tablaAISD1Localidad${prefijoDetectadoAISD1Sync}` : 'tablaAISD1Localidad';
    const campoCoordenadasSync = prefijoDetectadoAISD1Sync ? `tablaAISD1Coordenadas${prefijoDetectadoAISD1Sync}` : 'tablaAISD1Coordenadas';
    const campoAltitudSync = prefijoDetectadoAISD1Sync ? `tablaAISD1Altitud${prefijoDetectadoAISD1Sync}` : 'tablaAISD1Altitud';
    
    const tieneDatosIndividualesAISD1 = !!(this.datos[campoLocalidadSync] || 
      this.datos[campoCoordenadasSync] || 
      this.datos[campoAltitudSync] ||
      this.datos.tablaAISD1Localidad ||
      this.datos.tablaAISD1Coordenadas ||
      this.datos.tablaAISD1Altitud);
    
    console.log('[Seccion4FormWrapper] sincronizarTablasDesdeCampos - AISD1', {
      prefijoUsado: prefijoDetectadoAISD1Sync,
      tieneDatosIndividuales: !!tieneDatosIndividualesAISD1,
      tieneArray: !!this.datos.tablaAISD1Datos,
      arrayLength: this.datos.tablaAISD1Datos?.length
    });
    
    if (tieneDatosIndividualesAISD1 || !this.datos.tablaAISD1Datos || this.datos.tablaAISD1Datos.length === 0) {
      console.log('[Seccion4FormWrapper] sincronizarTablasDesdeCampos - Sincronizando AISD1');
        this.tableAdapter.sincronizarArrayDesdeCamposIndividuales(
          this.datos,
          'tablaAISD1Datos',
          {
            baseField: 'tablaAISD1',
            fields: ['Localidad', 'Coordenadas', 'Altitud', 'Distrito', 'Provincia', 'Departamento']
          },
          prefijoDetectadoAISD1Sync,
          1,
          false,
          false
        );
        
        let localidadDesdeAISD2 = '';
        if (this.datos.tablaAISD2Datos && Array.isArray(this.datos.tablaAISD2Datos) && this.datos.tablaAISD2Datos.length > 0) {
          const primeraFilaAISD2 = this.datos.tablaAISD2Datos[0];
          const puntoAISD2 = primeraFilaAISD2?.punto || primeraFilaAISD2?.Punto || '';
          if (puntoAISD2 && puntoAISD2.toString().trim() !== '' && puntoAISD2 !== '____') {
            localidadDesdeAISD2 = puntoAISD2.toString().trim();
          }
        }
        if (!localidadDesdeAISD2) {
          const prefijosPosiblesAISD2 = ['', '_A1', '_A2', '_B1', '_B2'];
          for (const prefijoTest of prefijosPosiblesAISD2) {
            const campoTest = `tablaAISD2Fila1Punto${prefijoTest}`;
            if (this.datos[campoTest] && this.datos[campoTest].toString().trim() !== '' && this.datos[campoTest] !== '____') {
              localidadDesdeAISD2 = this.datos[campoTest].toString().trim();
              break;
            }
          }
        }
        if (this.datos.tablaAISD1Datos && Array.isArray(this.datos.tablaAISD1Datos) && this.datos.tablaAISD1Datos.length > 0) {
          const primeraFila = this.datos.tablaAISD1Datos[0];
          if (!primeraFila.localidad || primeraFila.localidad.toString().trim() === '' || primeraFila.localidad === '____') {
            const nombreComunidad = this.obtenerNombreComunidadActual();
            const localidadFinal = nombreComunidad && nombreComunidad !== '____' 
              ? nombreComunidad 
              : (localidadDesdeAISD2 || '');
            primeraFila.localidad = localidadFinal;
            this.formularioService.actualizarDato('tablaAISD1Datos', this.datos.tablaAISD1Datos);
            console.log('[Seccion4FormWrapper] sincronizarTablasDesdeCampos - Localidad llenada:', { nombreComunidad, localidadDesdeAISD2, localidadFinal });
          }
        }
    }
    
    const campoPunto = prefijo ? `tablaAISD2Fila1Punto${prefijo}` : 'tablaAISD2Fila1Punto';
    const campoCodigo = prefijo ? `tablaAISD2Fila1Codigo${prefijo}` : 'tablaAISD2Fila1Codigo';
    const campoPoblacion = prefijo ? `tablaAISD2Fila1Poblacion${prefijo}` : 'tablaAISD2Fila1Poblacion';
    const tieneDatosIndividualesAISD2 = this.datos[campoPunto] || 
      this.datos[campoCodigo] || 
      this.datos[campoPoblacion] ||
      this.datos.tablaAISD2Fila1Punto ||
      this.datos.tablaAISD2Fila1Codigo ||
      this.datos.tablaAISD2Fila1Poblacion;
    
    console.log('[Seccion4FormWrapper] sincronizarTablasDesdeCampos - AISD2', {
      prefijo,
      campoPunto,
      campoCodigo,
      campoPoblacion,
      valorCampoPunto: this.datos[campoPunto],
      valorCampoCodigo: this.datos[campoCodigo],
      valorCampoPoblacion: this.datos[campoPoblacion],
      valorSinPrefijoPunto: this.datos.tablaAISD2Fila1Punto,
      valorSinPrefijoCodigo: this.datos.tablaAISD2Fila1Codigo,
      valorSinPrefijoPoblacion: this.datos.tablaAISD2Fila1Poblacion,
      tieneDatosIndividuales: !!tieneDatosIndividualesAISD2,
      tieneArray: !!this.datos.tablaAISD2Datos,
      arrayLength: this.datos.tablaAISD2Datos?.length
    });
    
    if (tieneDatosIndividualesAISD2 || !this.datos.tablaAISD2Datos || this.datos.tablaAISD2Datos.length === 0) {
      console.log('[Seccion4FormWrapper] sincronizarTablasDesdeCampos - Sincronizando AISD2');
      this.tableAdapter.sincronizarArrayDesdeCamposIndividuales(
        this.datos,
        'tablaAISD2Datos',
        {
          baseField: 'tablaAISD2',
          fields: ['Punto', 'Codigo', 'Poblacion', 'ViviendasEmpadronadas', 'ViviendasOcupadas']
        },
        prefijo,
        20,
        true,
        false
      );
      console.log('[Seccion4FormWrapper] sincronizarTablasDesdeCampos - AISD2 después de sincronizar', {
        arrayLength: this.datos.tablaAISD2Datos?.length,
        primerElemento: this.datos.tablaAISD2Datos?.[0]
      });
    }
    
    if (this.datos.tablaAISD1Datos || this.datos.tablaAISD2Datos) {
      const datosActualizar: any = {};
      if (this.datos.tablaAISD1Datos) {
        datosActualizar.tablaAISD1Datos = this.datos.tablaAISD1Datos;
      }
      if (this.datos.tablaAISD2Datos) {
        datosActualizar.tablaAISD2Datos = this.datos.tablaAISD2Datos;
      }
      console.log('[Seccion4FormWrapper] sincronizarTablasDesdeCampos - Actualizando servicio con:', datosActualizar);
      this.formularioService.actualizarDatos(datosActualizar);
    }
    
    setTimeout(() => {
      this.sincronizando = false;
      console.log('[Seccion4FormWrapper] sincronizarTablasDesdeCampos - FIN (sincronizando = false)');
    }, 0);
  }

  sincronizarCamposDesdeTablas(): void {
    console.log('[Seccion4FormWrapper] sincronizarCamposDesdeTablas - INICIO', {
      sincronizando: this.sincronizando,
      tablaAISD1Datos: this.datos?.tablaAISD1Datos?.length,
      tablaAISD2Datos: this.datos?.tablaAISD2Datos?.length
    });
    
    if (this.sincronizando) {
      console.log('[Seccion4FormWrapper] sincronizarCamposDesdeTablas - SALIENDO (ya sincronizando)');
      return;
    }
    
    this.sincronizando = true;
    const prefijo = this.obtenerPrefijoGrupo();
    
    const prefijosPosiblesAISD1Sync2 = ['', '_A1', '_A2', '_B1', '_B2'];
    let prefijoDetectadoAISD1Sync2 = prefijo;
    
    if (!prefijo) {
      for (const prefijoTest of prefijosPosiblesAISD1Sync2) {
        const campoTest = `tablaAISD1Localidad${prefijoTest}`;
        if (this.datos[campoTest] && this.datos[campoTest].toString().trim() !== '') {
          prefijoDetectadoAISD1Sync2 = prefijoTest;
          break;
        }
      }
    }
    
    const prefijosPosiblesAISD2Sync2 = ['', '_A1', '_A2', '_B1', '_B2'];
    let prefijoDetectadoAISD2Sync2 = prefijo;
    
    if (!prefijo) {
      for (const prefijoTest of prefijosPosiblesAISD2Sync2) {
        const campoTest = `tablaAISD2Fila1Punto${prefijoTest}`;
        if (this.datos[campoTest] && this.datos[campoTest].toString().trim() !== '') {
          prefijoDetectadoAISD2Sync2 = prefijoTest;
          break;
        }
      }
    }
    
    console.log('[Seccion4FormWrapper] sincronizarCamposDesdeTablas - Prefijos detectados', {
      prefijoOriginal: prefijo,
      prefijoAISD1: prefijoDetectadoAISD1Sync2,
      prefijoAISD2: prefijoDetectadoAISD2Sync2
    });
    
    this.tableAdapter.sincronizarCamposIndividualesDesdeArray(
      this.datos,
      'tablaAISD1Datos',
      {
        baseField: 'tablaAISD1',
        fields: ['Localidad', 'Coordenadas', 'Altitud', 'Distrito', 'Provincia', 'Departamento']
      },
      prefijoDetectadoAISD1Sync2,
      1,
      false,
      false
    );
    
    this.tableAdapter.sincronizarCamposIndividualesDesdeArray(
      this.datos,
      'tablaAISD2Datos',
      {
        baseField: 'tablaAISD2',
        fields: ['Punto', 'Codigo', 'Poblacion', 'ViviendasEmpadronadas', 'ViviendasOcupadas']
      },
      prefijoDetectadoAISD2Sync2,
      20,
      true,
      false
    );
    
    console.log('[Seccion4FormWrapper] sincronizarCamposDesdeTablas - Actualizando servicio con todos los datos');
    this.formularioService.actualizarDatos(this.datos);
    
    setTimeout(() => {
      this.sincronizando = false;
      console.log('[Seccion4FormWrapper] sincronizarCamposDesdeTablas - FIN (sincronizando = false)');
    }, 0);
  }

  onTablaFieldChange(fieldId: string, value: any) {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `${fieldId}${prefijo}` : fieldId;
    this.onFieldChange(campoConPrefijo, value);
    
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['onTablaFieldChange']) {
      component['onTablaFieldChange'](fieldId, value);
    }
  }

  onTablaAISD1Updated(): void {
    console.log('[Seccion4FormWrapper] onTablaAISD1Updated - Tabla actualizada');
    this.sincronizarCamposDesdeTablas();
    this.cdRef.detectChanges();
  }

  onTablaAISD2Updated(): void {
    console.log('[Seccion4FormWrapper] onTablaAISD2Updated - Tabla actualizada', {
      tablaAISD2Datos: this.datos?.tablaAISD2Datos?.length,
      primerElemento: this.datos?.tablaAISD2Datos?.[0]
    });
    this.sincronizarCamposDesdeTablas();
    this.cdRef.detectChanges();
  }

  getFilasTabla(): any[] {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['getFilasTablaAISD2']) {
      return component['getFilasTablaAISD2']();
    }
    return [];
  }

  agregarFilaTabla() {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['agregarFilaTabla']) {
      component['agregarFilaTabla']();
      this.actualizarDatos();
    } else {
      this.filasTablaAISD2++;
    }
  }

  eliminarFilaTabla(index: number) {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['eliminarFilaTabla']) {
      component['eliminarFilaTabla'](index);
      this.actualizarDatos();
    } else {
      if (this.filasTablaAISD2 > 1) {
        this.filasTablaAISD2--;
      }
    }
  }

  onPuntoPoblacionInput(index: number, value: string) {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['onPuntoPoblacionInput']) {
      component['onPuntoPoblacionInput'](index, value);
      if (component['autocompleteData']) {
        this.autocompleteData = { ...this.autocompleteData, ...component['autocompleteData'] };
      }
    }
  }

  onPuntoPoblacionBlur(index: number) {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['onPuntoPoblacionBlur']) {
      component['onPuntoPoblacionBlur'](index);
      if (component['autocompleteData']) {
        this.autocompleteData = { ...this.autocompleteData, ...component['autocompleteData'] };
      }
    }
  }

  seleccionarPuntoPoblacion(index: number, sugerencia: any) {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['seleccionarPuntoPoblacion']) {
      component['seleccionarPuntoPoblacion'](index, sugerencia);
      if (component['autocompleteData']) {
        this.autocompleteData = { ...this.autocompleteData, ...component['autocompleteData'] };
      }
      this.actualizarDatos();
    }
  }

  cerrarSugerenciasAutocomplete(field: string) {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['cerrarSugerenciasAutocomplete']) {
      component['cerrarSugerenciasAutocomplete'](field);
      if (component['autocompleteData']) {
        this.autocompleteData = { ...this.autocompleteData, ...component['autocompleteData'] };
      }
    }
  }

  onFotografiasUbicacionChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange('fotografiaUbicacionReferencial', fotografias);
    this.fotografiasUbicacionFormMulti = [...fotografias];
  }

  onFotografiasPoblacionChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange('fotografiaPoblacionViviendas', fotografias);
    this.fotografiasPoblacionFormMulti = [...fotografias];
  }

  obtenerNombreComunidadActual(): string {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['obtenerNombreComunidadActual']) {
      return component['obtenerNombreComunidadActual']();
    }
    if (!this.datos) return '____';
    const prefijo = this.obtenerPrefijoGrupo();
    if (!prefijo || !prefijo.startsWith('_A')) {
      return this.datos.grupoAISD || '____';
    }
    return this.datos.grupoAISD || '____';
  }

  obtenerTextoSeccion4IntroduccionAISD(): string {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['obtenerTextoSeccion4IntroduccionAISD']) {
      return component['obtenerTextoSeccion4IntroduccionAISD']();
    }
    
    if (!this.datos) return '';
    
    const prefijo = this.obtenerPrefijoGrupo();
    const campoParrafo = prefijo ? `parrafoSeccion4_introduccion_aisd${prefijo}` : 'parrafoSeccion4_introduccion_aisd';
    if (this.datos[campoParrafo] || this.datos['parrafoSeccion4_introduccion_aisd']) {
      return this.datos[campoParrafo] || this.datos['parrafoSeccion4_introduccion_aisd'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    return `Se ha determinado como Área de Influencia Social Directa (AISD) a la CC ${grupoAISD}. Esta delimitación se justifica en los criterios de propiedad de terreno superficial, además de la posible ocurrencia de impactos directos como la contratación de mano de obra local, adquisición de bienes y servicios, así como logística. En los siguientes apartados se desarrolla la caracterización socioeconómica y cultural de la comunidad delimitada como parte del AISD.`;
  }

  obtenerTextoSeccion4ComunidadCompleto(): string {
    if (!this.datos) return '';
    
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['obtenerTextoSeccion4ComunidadCompleto']) {
      return component['obtenerTextoSeccion4ComunidadCompleto']();
    }
    
    const prefijo = this.obtenerPrefijoGrupo();
    const campoParrafo = prefijo ? `parrafoSeccion4_comunidad_completo${prefijo}` : 'parrafoSeccion4_comunidad_completo';
    if (this.datos[campoParrafo] || this.datos['parrafoSeccion4_comunidad_completo']) {
      return this.datos[campoParrafo] || this.datos['parrafoSeccion4_comunidad_completo'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const distrito = this.datos.distritoSeleccionado || '____';
    const provincia = this.datos.provinciaSeleccionada || '____';
    const aisd1 = this.datos.aisdComponente1 || '____';
    const aisd2 = this.datos.aisdComponente2 || '____';
    const departamento = this.datos.departamentoSeleccionado || '____';
    const grupoAISI = this.datos.grupoAISI || this.datos.distritoSeleccionado || '____';
    
    return `La CC ${grupoAISD} se encuentra ubicada predominantemente dentro del distrito de ${distrito}, provincia de ${provincia}; no obstante, sus límites comunales abarcan pequeñas áreas de los distritos de ${aisd1} y de ${aisd2}, del departamento de ${departamento}. Esta comunidad se caracteriza por su historia y tradiciones que se mantienen vivas a lo largo de los años. Se encuentra compuesta por el anexo ${grupoAISD}, el cual es el centro administrativo comunal, además de los sectores agropecuarios de Yuracranra, Tastanic y Faldahuasi. Ello se pudo validar durante el trabajo de campo, así como mediante la Base de Datos de Pueblos Indígenas u Originarios (BDPI). Sin embargo, en la actualidad, estos sectores agropecuarios no cuentan con población permanente y la mayor parte de los comuneros se concentran en el anexo ${grupoAISD}.\n\nEn cuanto al nombre "${grupoAISD}", según los entrevistados, este proviene de una hierba que se empleaba para elaborar moldes artesanales para queso; no obstante, ya no se viene utilizando en el presente y es una práctica que ha ido reduciéndose paulatinamente. Por otro lado, cabe mencionar que la comunidad se halla al este de la CC Sondor, al norte del CP ${grupoAISI} y al oeste del anexo Nauquipa.\n\nAsimismo, la CC ${grupoAISD} es reconocida por el Ministerio de Cultura como parte de los pueblos indígenas u originarios, específicamente como parte del pueblo quechua. Esta identidad es un pilar fundamental de la comunidad, influyendo en sus prácticas agrícolas, celebraciones y organización social. La oficialización de la comunidad por parte del Estado peruano se remonta al 24 de agosto de 1987, cuando fue reconocida mediante RD N°495 – 87 – MAG – DR – VIII – A. Este reconocimiento formalizó la existencia y los derechos de la comunidad, fortaleciendo su posición y legitimidad dentro del marco legal peruano. Posteriormente, las tierras de la comunidad fueron tituladas el 28 de marzo de 1996, conforme consta en la Ficha 90000300, según la BDPI. Esta titulación ha sido crucial para la protección y manejo de sus recursos naturales, permitiendo a la comunidad planificar y desarrollar proyectos que beneficien a todos sus comuneros. La administración de estas tierras ha sido un factor clave en la preservación de su cultura y en el desarrollo sostenible de la comunidad.`;
  }

  obtenerTextoSeccion4CaracterizacionIndicadores(): string {
    if (!this.datos) return '';
    
    const prefijo = this.obtenerPrefijoGrupo();
    const campoParrafo = prefijo ? `parrafoSeccion4_caracterizacion_indicadores${prefijo}` : 'parrafoSeccion4_caracterizacion_indicadores';
    if (this.datos[campoParrafo] || this.datos['parrafoSeccion4_caracterizacion_indicadores']) {
      return this.datos[campoParrafo] || this.datos['parrafoSeccion4_caracterizacion_indicadores'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    return `Para la caracterización de los indicadores demográficos y aquellos relacionados a viviendas, se emplea la sumatoria de casos obtenida al considerar aquellos puntos de población que conforman la CC ${grupoAISD}. En el siguiente cuadro, se presenta aquellos puntos de población identificados por el INEI que se encuentran dentro de la comunidad en cuestión.`;
  }

  getTotalPoblacionAISD2(): number | '____' {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['getTotalPoblacionAISD2']) {
      return component['getTotalPoblacionAISD2']();
    }
    return '____';
  }

  getTotalViviendasEmpadronadasAISD2(): number | '____' {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['getTotalViviendasEmpadronadasAISD2']) {
      return component['getTotalViviendasEmpadronadasAISD2']();
    }
    return '____';
  }

  getTotalViviendasOcupadasAISD2(): number | '____' {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['getTotalViviendasOcupadasAISD2']) {
      return component['getTotalViviendasOcupadasAISD2']();
    }
    return '____';
  }
}
