import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, OnInit, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { CCPPEntry, GroupDefinition } from 'src/app/core/state/project-state.model';
import { Seccion4TextGeneratorService } from 'src/app/core/services/domain/seccion4-text-generator.service';
import { Seccion4DataService } from 'src/app/core/services/domain/seccion4-data.service';
import { Seccion4TableConfigService } from 'src/app/core/services/domain/seccion4-table-config.service';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, ImageUploadComponent],
  selector: 'app-seccion4',
  templateUrl: './seccion4.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion4Component extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1';
  @Input() override modoFormulario: boolean = false;

  // ✅ Declarar métodos públicos explícitamente ANTES de usarlos
  // Esto evita problemas con el index signature de BaseSectionComponent
  obtenerNombreComunidadPublico!: () => string;
  getTextoIntroduccionEfectivo!: () => string;
  getTextoComunidadEfectivo!: () => string;
  getTextoCaracterizacionEfectivo!: () => string;

  readonly PHOTO_PREFIX_UBICACION = 'fotografiaUbicacionReferencial';
  readonly PHOTO_PREFIX_POBLACION = 'fotografiaPoblacionViviendas';
  override readonly PHOTO_PREFIX = '';

  override useReactiveSync: boolean = true;

  override watchedFields: string[] = [
    'tablaAISD1Datos', 'tablaAISD2Datos',
    'tablaAISD1Datos_A1', 'tablaAISD2Datos_A1',
    'tablaAISD1Datos_A2', 'tablaAISD2Datos_A2',
    'parrafoSeccion4_introduccion_aisd', 'parrafoSeccion4_comunidad_completo',
    'parrafoSeccion4_caracterizacion_indicadores'
  ];

  readonly formDataSignal: Signal<Record<string, any>>;
  readonly tablaAISD1Signal: Signal<any[]>;
  readonly tablaAISD2Signal: Signal<any[]>;
  readonly viewModel: Signal<{
    nombreComunidad: string;
    data: Record<string, any>;
    texts: { introduccionText: string; comunidadText: string; caracterizacionText: string };
    tables: { tablaAISD1: any[]; tablaAISD2: any[] };
    calculations: { totalesAISD2: { poblacion: number; empadronadas: number; ocupadas: number } };
    sources: { tablaAISD1Source: string; tablaAISD2Source: string };
  }>;
  readonly photoFieldsHash: Signal<string>;
   
  // ✅ Bandera para evitar bucle infinito en autoLlenarTablas
  private autoLlenarTablasExecuted = false;
  
  private isProcessingPipeline = false;

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private textGen: Seccion4TextGeneratorService,
    private dataSrv: Seccion4DataService,
    public tableCfg: Seccion4TableConfigService
  ) {
    super(cdRef, injector);
    
    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX_UBICACION, label: 'Ubicación' },
      { prefix: this.PHOTO_PREFIX_POBLACION, label: 'Población' }
    ];

    // ✅ Inicializar métodos públicos para evitar problemas con index signature
    // ✅ Usar obtenerNombreComunidadActual() del BaseSectionComponent (que usa aisdGroups signal)
    this.obtenerNombreComunidadPublico = () => {
      return this.obtenerNombreComunidadActual();
    };
    
    this.getTextoIntroduccionEfectivo = () => {
      return this.textGen.obtenerTextoIntroduccionAISD(this.datos, this.obtenerNombreComunidadPublico(), this.seccionId);
    };
    
    this.getTextoComunidadEfectivo = () => {
      return this.textGen.obtenerTextoComunidadCompleto(this.datos, this.obtenerNombreComunidadPublico(), this.seccionId);
    };
    
    this.getTextoCaracterizacionEfectivo = () => {
      return this.textGen.obtenerTextoCaracterizacionIndicadores(this.datos, this.obtenerNombreComunidadPublico(), this.seccionId);
    };

    this.formDataSignal = computed(() => {
      const sectionData = this.projectFacade.selectSectionFields(this.seccionId, null)();
      const seccion2Data = this.projectFacade.selectSectionFields('3.1.2', null)();
      return { ...sectionData, comunidadesCampesinas: seccion2Data['comunidadesCampesinas'] || sectionData['comunidadesCampesinas'] };
    });

    this.tablaAISD1Signal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const keyA1 = `tablaAISD1Datos${prefijo}`;
      const conPrefijo = this.projectFacade.selectField(this.seccionId, null, keyA1)();
      return Array.isArray(conPrefijo) && conPrefijo.length > 0 ? conPrefijo : [];
    });

    this.tablaAISD2Signal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const keyA2 = `tablaAISD2Datos${prefijo}`;
      const conPrefijo = this.projectFacade.selectField(this.seccionId, null, keyA2)();
      return Array.isArray(conPrefijo) && conPrefijo.length > 0 ? conPrefijo : [];
    });

    this.photoFieldsHash = computed(() => {
      let hash = '';
      const prefijo = this.obtenerPrefijoGrupo();
      for (const basePrefix of [this.PHOTO_PREFIX_UBICACION, this.PHOTO_PREFIX_POBLACION]) {
        const prefix = basePrefix + prefijo;
        for (let i = 1; i <= 10; i++) {
          const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
          const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
          const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
          hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
        }
      }
      return hash;
    });

    this.viewModel = computed(() => {
      const sectionData = this.formDataSignal();
      // ✅ MODELO IDEAL: Solo usar sectionData de signals, NO mezclar obtenerDatos()
      const data = sectionData;
      // ✅ Usar obtenerNombreComunidadActual() del BaseSectionComponent (que usa aisdGroups signal)
      const nombreComunidad = this.obtenerNombreComunidadActual();
      
      const tablaAISD1 = this.tablaAISD1Signal();
      const tablaAISD2 = this.tablaAISD2Signal();
      
      const totales = this.dataSrv.calcularTotalesAISD2(Array.isArray(tablaAISD2) ? tablaAISD2 : []);
      return {
        // ✅ Agregar nombreComunidad para usar en el template
        nombreComunidad,
        data: {
          ...data,
          comunidadesCampesinas: sectionData['comunidadesCampesinas'] ?? [],
          cuadroTituloAISD1: data['cuadroTituloAISD1' + this.obtenerPrefijoGrupo()] ?? '',
          tablaAISD1Datos: tablaAISD1,
          tablaAISD2Datos: tablaAISD2
        },
        texts: {
          introduccionText: this.textGen.obtenerTextoIntroduccionAISD(data, nombreComunidad, this.seccionId),
          comunidadText: this.textGen.obtenerTextoComunidadCompleto(data, nombreComunidad, this.seccionId),
          caracterizacionText: this.textGen.obtenerTextoCaracterizacionIndicadores(data, nombreComunidad, this.seccionId)
        },
        tables: {
          tablaAISD1: Array.isArray(tablaAISD1) ? tablaAISD1 : [],
          tablaAISD2: Array.isArray(tablaAISD2) ? tablaAISD2 : []
        },
        calculations: {
          totalesAISD2: {
            poblacion: totales.poblacion,
            empadronadas: totales.empadronadas,
            ocupadas: totales.ocupadas
          }
        },
        sources: {
          tablaAISD1Source: data['cuadroFuenteAISD1' + this.obtenerPrefijoGrupo()] ?? '',
          tablaAISD2Source: data['cuadroFuenteAISD2' + this.obtenerPrefijoGrupo()] ?? ''
        }
      };
    });

    effect(() => {
      const sectionData = this.formDataSignal();
      const legacyData = this.projectFacade.obtenerDatos();
      this.datos = { ...legacyData, ...sectionData };
      this.datos['comunidadesCampesinas'] = sectionData['comunidadesCampesinas'] || legacyData['comunidadesCampesinas'] || [];
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });

    // ✅ Effect para autoLlenarTablas cuando datos estén disponibles
    effect(() => {
      // Solo ejecutar autoLlenarTablas una vez
      if (this.autoLlenarTablasExecuted) {
        return;
      }
      
      const tablaA1 = this.tablaAISD1Signal();
      const tablaA2 = this.tablaAISD2Signal();
      const datos = this.datos;
      const tieneDatosCompletos = datos && Object.keys(datos).length > 0;
      
      if (tieneDatosCompletos && this.modoFormulario === false) {
        this.autoLlenarTablasExecuted = true;
        setTimeout(() => {
          this.autoLlenarTablas();
        }, 0);
      }
    }, { allowSignalWrites: true });

    // ❌ DEBUG: MONITOR DESHABILITADO - Causaba bucle de logs
    // effect(() => {
    //   const tablaA1 = this.tablaAISD1Signal();
    //   const tablaA2 = this.tablaAISD2Signal();
    //   const prefijo = this.obtenerPrefijoGrupo();
    //   
    //   console.log(`%c[Seccion4] === SIGNAL CHANGE ===`, 'color: #ff00ff; font-weight: bold; font-size: 12px');
    //   console.log(`[Seccion4] prefijo: "${prefijo}"`);
    //   console.log(`[Seccion4] tablaAISD1Signal.length: ${tablaA1?.length || 0}`);
    //   console.log(`[Seccion4] tablaAISD2Signal.length: ${tablaA2?.length || 0}`);
    //   if (tablaA2 && tablaA2.length > 3) {
    //     console.log(`[Seccion4] A2 filas 4+:`, tablaA2.slice(3));
    //   }
    //   console.log(`%c[Seccion4] === END SIGNAL CHANGE ===\n`, 'color: #ff00ff; font-weight: bold; font-size: 12px');
    // });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.cargarFotografias();
    this.autoLlenarTablas();
    
    if (this.modoFormulario) {
      this.initDataPipeline();
    }
  }

  private initDataPipeline(): void {
    if (this.isProcessingPipeline) return;
    this.isProcessingPipeline = true;
    try {
      this.autoLlenarTablas();
      this.cargarTodosLosGrupos();
    } finally {
      this.isProcessingPipeline = false;
    }
  }

  /** Auto-llena tabla AISD1 (3.2) con la capital del grupo Y tabla AISD2 (3.3) con los centros poblados SIEMPRE */
  private autoLlenarTablas(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const dataKeyA1 = `tablaAISD1Datos${prefijo}`;
    const dataKeyA2 = `tablaAISD2Datos${prefijo}`;
    
    // ✅ VALIDACIÓN: Debe tener prefijo válido
    if (!prefijo || !prefijo.startsWith('_A')) {
      return;
    }
    
    // ============ OBTENER GRUPOS DESDE PROJECTSTATE ============
    const gruposAISD = this.aisdGroups();
    const centrosPoblados = this.allPopulatedCenters();
    
    // Obtener el grupo actual según el prefijo
    const match = prefijo.match(/_A(\d+)/);
    const index = match ? parseInt(match[1]) - 1 : -1;
    const grupoActual = index >= 0 && index < gruposAISD.length ? gruposAISD[index] : null;
    
    // ============ TABLA A1: CAPITAL ============
    const tablaA1Actual = this.datos[dataKeyA1] || [];
    
    // ✅ LÓGICA: Llenar SOLO si está completamente vacía o sin localidad válida
    const estaVaciaA1 = !tablaA1Actual || tablaA1Actual.length === 0;
    const estaInvalidaA1 = tablaA1Actual.length === 1 && (!tablaA1Actual[0].localidad || tablaA1Actual[0].localidad === '____');
    
    if (estaVaciaA1 || estaInvalidaA1) {
      // ✅ OPCIÓN 1: Usar datos del mock si están disponibles (tablaAISD1Datos sin prefijo)
      const tablaA1Mock = this.datos['tablaAISD1Datos'];
      if (tablaA1Mock && tablaA1Mock.length > 0 && tablaA1Mock[0].localidad && tablaA1Mock[0].localidad !== '____') {
        this.onFieldChange(dataKeyA1 as any, tablaA1Mock, { refresh: false });
        this.datos[dataKeyA1] = tablaA1Mock;
      } else {
        // ✅ OPCIÓN 2: Generar desde tablaAISD2 (usar la capital que es la primera fila con población > 0)
        const tablaA2Actual = this.datos[dataKeyA2] || this.datos['tablaAISD2Datos'] || [];
        
        // Buscar la fila con mayor población (generalmente es la capital)
        let filaCapital = tablaA2Actual.find((f: any) => f.poblacion && parseInt(f.poblacion) > 0);
        
        // Si no hay población, usar la primera fila
        if (!filaCapital && tablaA2Actual.length > 0) {
          filaCapital = tablaA2Actual[0];
        }
        
        if (filaCapital) {
          const capital = filaCapital.punto || filaCapital.nombre || '____';
          const datosCap = this.dataSrv.buscarDatosCentro(this.datos, capital);
          
          // ✅ CREAR FILA DE TABLA A1 CON LA CAPITAL
          const filaA1 = [{
            localidad: capital,
            coordenadas: datosCap?.coordenadas || this.datos.coordenadasAISD || this.datos['tablaAISD1Coordenadas'] || '____',
            altitud: datosCap?.altitud || this.datos.altitudAISD || this.datos['tablaAISD1Altitud'] || '____',
            distrito: datosCap?.distrito || this.datos.distritoSeleccionado || this.datos['tablaAISD1Fila1Distrito'] || '____',
            provincia: datosCap?.provincia || this.datos.provinciaSeleccionada || this.datos['tablaAISD1Fila1Provincia'] || '____',
            departamento: datosCap?.departamento || this.datos.departamentoSeleccionado || this.datos['tablaAISD1Fila1Departamento'] || '____'
          }];
          
          this.onFieldChange(dataKeyA1 as any, filaA1, { refresh: false });
          this.datos[dataKeyA1] = filaA1;
        }
      }
    }

    // ============ TABLA A2: CENTROS POBLADOS ============
    // ✅ OBTENER CÓDIGOS DE CENTROS POBLADOS SELECCIONADOS DESDE PROJECTSTATE
    let codigosComunidad: string[] = [];
    if (grupoActual && grupoActual.ccppIds && grupoActual.ccppIds.length > 0) {
      codigosComunidad = grupoActual.ccppIds as string[];
    } else {
      // Fallback al método legacy
      codigosComunidad = this.dataSrv.obtenerCodigosPorPrefijo(this.datos, this.seccionId);
    }
    
    // ✅ OBTENER TABLA A2 ACTUAL
    const tablaA2Actual = this.datos[dataKeyA2] || [];
    
    // ✅ LÓGICA: Llenar SOLO si está vacía
    const estaVaciaA2 = !tablaA2Actual || tablaA2Actual.length === 0;
    
    if (estaVaciaA2) {
      // ✅ OPCIÓN 1: Generar desde ProjectState si hay códigos
      if (codigosComunidad.length > 0 && centrosPoblados.length > 0) {
        const filas = codigosComunidad.map(codigo => {
          const ccpp = centrosPoblados.find(c => c.id === codigo || c.codigo === codigo);
          return {
            punto: ccpp?.nombre || codigo,
            codigo: codigo,
            poblacion: ccpp?.poblacion?.toString() || '0',
            viviendasEmpadronadas: '0',
            viviendasOcupadas: '0'
          };
        });
        
        if (filas.length > 0) {
          this.onFieldChange(dataKeyA2 as any, filas, { refresh: false });
          this.datos[dataKeyA2] = filas;
        }
      } else {
        // ✅ OPCIÓN 2: Fallback a datos del mock
        const tablaA2Mock = this.datos['tablaAISD2Datos'];
        if (tablaA2Mock && tablaA2Mock.length > 0) {
          this.onFieldChange(dataKeyA2 as any, tablaA2Mock, { refresh: false });
          this.datos[dataKeyA2] = tablaA2Mock;
        } else {
          // ✅ OPCIÓN 3: Usar puntosPoblacion del mock
          const puntosPoblacionMock = this.datos['puntosPoblacion'];
          if (puntosPoblacionMock && puntosPoblacionMock.length > 0) {
            const filas = puntosPoblacionMock.map((cp: any) => ({
              punto: cp.nombre || cp.punto || '____',
              codigo: (cp.codigo || '').toString(),
              poblacion: (cp.poblacion || '0').toString(),
              viviendasEmpadronadas: (cp.viviendasEmpadronadas || '0').toString(),
              viviendasOcupadas: (cp.viviendasOcupadas || '0').toString()
            }));
            
            this.onFieldChange(dataKeyA2 as any, filas, { refresh: false });
            this.datos[dataKeyA2] = filas;
          }
        }
      }
    }

    this.actualizarDatos();
    this.cdRef.markForCheck();
  }

  onTablaUpdated(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const keyA1 = prefijo ? `tablaAISD1Datos${prefijo}` : 'tablaAISD1Datos';
    const keyA2 = prefijo ? `tablaAISD2Datos${prefijo}` : 'tablaAISD2Datos';
    
    // ✅ USAR SIGNALS PARA OBTENER DATOS COMPLETOS Y ACTUALIZADOS
    let tablaA1Actual = this.tablaAISD1Signal();
    const tablaA2Actual = this.tablaAISD2Signal();
    
    // ✅ Protección: si tabla A1 está vacía, re-llenarla automáticamente
    if (!tablaA1Actual || tablaA1Actual.length === 0) {
      const nombreComunidad = this.obtenerNombreComunidadPublico();
      const capital = this.dataSrv.obtenerCapitalComunidad(this.datos, this.seccionId) || nombreComunidad;
      const datosCap = this.dataSrv.buscarDatosCentro(this.datos, capital);
      tablaA1Actual = [{
        localidad: capital,
        coordenadas: datosCap?.coordenadas || this.datos.coordenadasAISD || '____',
        altitud: datosCap?.altitud || this.datos.altitudAISD || '____',
        distrito: datosCap?.distrito || this.datos.distritoSeleccionado || '____',
        provincia: datosCap?.provincia || this.datos.provinciaSeleccionada || '____',
        departamento: datosCap?.departamento || this.datos.departamentoSeleccionado || '____'
      }];
    }
    
    // 1. Persistir ambas tablas al projectFacade
    const payload: Record<string, any> = {};
    if (tablaA1Actual && tablaA1Actual.length > 0) {
      payload[keyA1] = tablaA1Actual.map((r: any) => (typeof r === 'object' && r != null ? { ...r } : r));
    }
    if (tablaA2Actual && tablaA2Actual.length > 0) {
      payload[keyA2] = tablaA2Actual.map((r: any) => (typeof r === 'object' && r != null ? { ...r } : r));
    }
    
    if (Object.keys(payload).length > 0) {
      this.projectFacade.setFields(this.seccionId, null, payload);
    }
    
    // ✅ CALCULAR TOTALES USANDO EL ARRAY COMPLETO DE LA TABLA
    const totals = this.dataSrv.calcularTotalesAISD2(tablaA2Actual || []);
    
    // 2. Persistir totales
    this.onFieldChange(`tablaAISD2TotalPoblacion${prefijo}`, totals.poblacion, { refresh: false });
    this.onFieldChange(`tablaAISD2TotalViviendasEmpadronadas${prefijo}`, totals.empadronadas, { refresh: false });
    this.onFieldChange(`tablaAISD2TotalViviendasOcupadas${prefijo}`, totals.ocupadas, { refresh: false });
    
    this.actualizarDatos();
    this.cdRef.markForCheck();
  }

  /** Sección 4 tiene varios grupos de fotos (Ubicación, Población); cargar todos para la vista */
  protected override cargarFotografias(): void {
    if (this.photoGroupsConfig.length > 0) {
      this.cargarTodosLosGrupos();
      this.cdRef.markForCheck();
    } else {
      super.cargarFotografias();
    }
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {}
}
