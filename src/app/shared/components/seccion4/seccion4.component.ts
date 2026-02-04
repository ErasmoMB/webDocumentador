import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, OnInit, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { Seccion4TextGeneratorService } from 'src/app/core/services/domain/seccion4-text-generator.service';
import { Seccion4DataService } from 'src/app/core/services/domain/seccion4-data.service';
import { Seccion4TableConfigService } from 'src/app/core/services/domain/seccion4-table-config.service';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

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
    data: Record<string, any>;
    texts: { introduccionText: string; comunidadText: string; caracterizacionText: string };
    tables: { tablaAISD1: any[]; tablaAISD2: any[] };
    calculations: { totalesAISD2: { poblacion: number; empadronadas: number; ocupadas: number } };
    sources: { tablaAISD1Source: string; tablaAISD2Source: string };
  }>;
  readonly photoFieldsHash: Signal<string>;

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
    this.obtenerNombreComunidadPublico = () => {
      return this.dataSrv.obtenerNombreComunidadActual(this.datos, this.seccionId);
    };
    
    this.getTextoIntroduccionEfectivo = () => {
      return this.textGen.obtenerTextoIntroduccionAISD(this.datos, this.obtenerNombreComunidadPublico());
    };
    
    this.getTextoComunidadEfectivo = () => {
      return this.textGen.obtenerTextoComunidadCompleto(this.datos, this.obtenerNombreComunidadPublico());
    };
    
    this.getTextoCaracterizacionEfectivo = () => {
      return this.textGen.obtenerTextoCaracterizacionIndicadores(this.datos, this.obtenerNombreComunidadPublico());
    };

    this.formDataSignal = computed(() => {
      const sectionData = this.projectFacade.selectSectionFields(this.seccionId, null)();
      const seccion2Data = this.projectFacade.selectSectionFields('3.1.2', null)();
      return { ...sectionData, comunidadesCampesinas: seccion2Data['comunidadesCampesinas'] || sectionData['comunidadesCampesinas'] };
    });

    this.tablaAISD1Signal = computed(() => {
      // ✅ SIEMPRE leer con prefijo. Sin fallbacks a versiones sin prefijo.
      const prefijo = this.obtenerPrefijoGrupo();
      const keyA1 = `tablaAISD1Datos${prefijo}`;
      const conPrefijo = this.projectFacade.selectField(this.seccionId, null, keyA1)();
      const result = Array.isArray(conPrefijo) && conPrefijo.length > 0 ? conPrefijo : [];
      console.log(`[Seccion4] tablaAISD1Signal computed - prefijo="${prefijo}", key="${keyA1}", rows=${result.length}`);
      return result;
    });

    this.tablaAISD2Signal = computed(() => {
      // ✅ SIEMPRE leer con prefijo. Sin fallbacks a versiones sin prefijo.
      const prefijo = this.obtenerPrefijoGrupo();
      const keyA2 = `tablaAISD2Datos${prefijo}`;
      const conPrefijo = this.projectFacade.selectField(this.seccionId, null, keyA2)();
      const result = Array.isArray(conPrefijo) && conPrefijo.length > 0 ? conPrefijo : [];
      console.log(`[Seccion4] tablaAISD2Signal computed - prefijo="${prefijo}", key="${keyA2}", rows=${result.length}`, result);
      return result;
    });

    this.photoFieldsHash = computed(() => {
      let hash = '';
      for (const prefix of [this.PHOTO_PREFIX_UBICACION, this.PHOTO_PREFIX_POBLACION]) {
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
      const nombreComunidad = this.dataSrv.obtenerNombreComunidadActual(data, this.seccionId);
      
      const tablaAISD1 = this.tablaAISD1Signal();
      const tablaAISD2 = this.tablaAISD2Signal();
      
      const totales = this.dataSrv.calcularTotalesAISD2(Array.isArray(tablaAISD2) ? tablaAISD2 : []);
      return {
        data: {
          ...data,
          comunidadesCampesinas: sectionData['comunidadesCampesinas'] ?? [],
          cuadroTituloAISD1: data['cuadroTituloAISD1'],
          tablaAISD1Datos: tablaAISD1,
          tablaAISD2Datos: tablaAISD2
        },
        texts: {
          introduccionText: this.textGen.obtenerTextoIntroduccionAISD(data, nombreComunidad),
          comunidadText: this.textGen.obtenerTextoComunidadCompleto(data, nombreComunidad),
          caracterizacionText: this.textGen.obtenerTextoCaracterizacionIndicadores(data, nombreComunidad)
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
          tablaAISD1Source: data['cuadroFuenteAISD1'] ?? '',
          tablaAISD2Source: data['cuadroFuenteAISD1'] ?? ''
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

    // ✅ DEBUG: Monitor de cambios en los signals de tabla
    effect(() => {
      const tablaA1 = this.tablaAISD1Signal();
      const tablaA2 = this.tablaAISD2Signal();
      const prefijo = this.obtenerPrefijoGrupo();
      
      console.log(`%c[Seccion4] === SIGNAL CHANGE ===`, 'color: #ff00ff; font-weight: bold; font-size: 12px');
      console.log(`[Seccion4] prefijo: "${prefijo}"`);
      console.log(`[Seccion4] tablaAISD1Signal.length: ${tablaA1?.length || 0}`);
      console.log(`[Seccion4] tablaAISD2Signal.length: ${tablaA2?.length || 0}`);
      if (tablaA2 && tablaA2.length > 3) {
        console.log(`[Seccion4] A2 filas 4+:`, tablaA2.slice(3));
      }
      console.log(`%c[Seccion4] === END SIGNAL CHANGE ===\n`, 'color: #ff00ff; font-weight: bold; font-size: 12px');
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.cargarFotografias();
    
    console.log(`\n%c[Seccion4] === ngOnInit START ===`, 'color: #00aa00; font-weight: bold; font-size: 14px');
    
    // Console.log para mostrar el grupo AISD y sus centros poblados
    this.logGrupoActual();
    
    // ✅ CRÍTICO: SIEMPRE llenar tabla 3.2 si está vacía
    // Esto es lo primero que hacemos en ngOnInit ANTES de initDataPipeline
    this.autoLlenarTablas();
    
    // 🔍 DEBUG: Verificar estado después de autoLlenarTablas
    const prefijo = this.obtenerPrefijoGrupo();
    const dataKeyA1 = `tablaAISD1Datos${prefijo}`;
    console.log(`[Seccion4] Después de autoLlenarTablas - this.datos[${dataKeyA1}]:`, this.datos[dataKeyA1]);
    console.log(`[Seccion4] tablaAISD1Signal() value:`, this.tablaAISD1Signal());
    
    // Forzar actualización de signals
    this.cdRef.markForCheck();
    
    // Inicializar pipeline de datos en formulario si es modo formulario
    if (this.modoFormulario) {
      this.initDataPipeline();
    }
    
    console.log(`%c[Seccion4] === ngOnInit END ===\n`, 'color: #00aa00; font-weight: bold; font-size: 14px');
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
    
    console.log(`%c[Seccion4] autoLlenarTablas START - prefijo="${prefijo}", dataKeyA1="${dataKeyA1}", dataKeyA2="${dataKeyA2}"`, 'color: #0066cc; font-weight: bold');
    
    // ✅ VALIDACIÓN: Debe tener prefijo válido
    if (!prefijo || !prefijo.startsWith('_A')) {
      console.warn(`[Seccion4] ⚠️ Prefijo inválido: "${prefijo}", no puedo llenar tablas`);
      return;
    }

    // ============ TABLA A1: CAPITAL ============
    // ✅ OBTENER TABLA A1 ACTUAL
    const tablaA1Actual = this.datos[dataKeyA1] || [];
    console.log(`[Seccion4] Tabla A1 actual:`, tablaA1Actual);
    
    // ✅ LÓGICA: Llenar SOLO si está completamente vacía o sin localidad válida
    const estaVaciaA1 = !tablaA1Actual || tablaA1Actual.length === 0;
    const estaInvalidaA1 = tablaA1Actual.length === 1 && (!tablaA1Actual[0].localidad || tablaA1Actual[0].localidad === '____');
    
    console.log(`[Seccion4] A1 - estaVacia=${estaVaciaA1}, estaInvalida=${estaInvalidaA1}`);
    
    if (estaVaciaA1 || estaInvalidaA1) {
      // ✅ OBTENER CAPITAL DEL GRUPO
      const nombreComunidad = this.obtenerNombreComunidadPublico();
      const capital = this.dataSrv.obtenerCapitalComunidad(this.datos, this.seccionId) || nombreComunidad;
      console.log(`[Seccion4] Capital detectada: "${capital}"`);
      
      if (capital && capital !== '____') {
        // ✅ BUSCAR DATOS DE LA CAPITAL
        const datosCap = this.dataSrv.buscarDatosCentro(this.datos, capital);
        console.log(`[Seccion4] Datos de capital encontrados:`, datosCap);
        
        // ✅ CREAR FILA DE TABLA A1 CON LA CAPITAL
        const filaA1 = [{
          localidad: capital,
          coordenadas: datosCap?.coordenadas || this.datos.coordenadasAISD || '____',
          altitud: datosCap?.altitud || this.datos.altitudAISD || '____',
          distrito: datosCap?.distrito || this.datos.distritoSeleccionado || '____',
          provincia: datosCap?.provincia || this.datos.provinciaSeleccionada || '____',
          departamento: datosCap?.departamento || this.datos.departamentoSeleccionado || '____'
        }];
        
        console.log(`%c[Seccion4] ✅ LLENANDO tabla A1 con capital`, 'color: #00aa00; font-weight: bold');
        this.onFieldChange(dataKeyA1 as any, filaA1, { refresh: false });
        this.datos[dataKeyA1] = filaA1;
      }
    } else {
      console.log(`[Seccion4] ✅ Tabla A1 ya tiene datos válidos, preservando:`, tablaA1Actual);
    }

    // ============ TABLA A2: CENTROS POBLADOS ============
    // ✅ OBTENER CÓDIGOS DE CENTROS POBLADOS SELECCIONADOS
    const codigosComunidad = this.dataSrv.obtenerCodigosPorPrefijo(this.datos, this.seccionId);
    console.log(`[Seccion4] Códigos de comunidad detectados:`, codigosComunidad);
    
    if (!codigosComunidad || codigosComunidad.length === 0) {
      console.log(`[Seccion4] ⚠️ No hay códigos de centros poblados seleccionados, tabla A2 no se llenará`);
      return;
    }

    // ✅ OBTENER TABLA A2 ACTUAL
    const tablaA2Actual = this.datos[dataKeyA2] || [];
    console.log(`[Seccion4] Tabla A2 actual:`, tablaA2Actual);
    
    // ✅ LÓGICA: Llenar SOLO si está vacía O si el número de filas NO coincide con códigos
    const estaVaciaA2 = !tablaA2Actual || tablaA2Actual.length === 0;
    const filasActuales = Array.isArray(tablaA2Actual) ? tablaA2Actual.length : 0;
    const sincronizado = filasActuales === codigosComunidad.length && filasActuales > 0;
    
    console.log(`[Seccion4] A2 - estaVacia=${estaVaciaA2}, filasActuales=${filasActuales}, codigosExpectados=${codigosComunidad.length}, sincronizado=${sincronizado}`);
    
    if (!sincronizado) {
      // ✅ OBTENER JSON COMPLETO CON DATOS DE CENTROS POBLADOS
      const jsonCompleto = this.datos['jsonCompleto'];
      console.log(`[Seccion4] jsonCompleto disponible:`, !!jsonCompleto);
      
      if (jsonCompleto) {
        // ✅ OBTENER DATOS DE TODOS LOS CENTROS POBLADOS SELECCIONADOS
        const centrosPoblados = this.dataSrv.obtenerDatosCentrosPorCodigos(jsonCompleto, codigosComunidad);
        console.log(`[Seccion4] Centros poblados encontrados:`, centrosPoblados.length);
        
        if (centrosPoblados.length > 0) {
          // ✅ CREAR FILAS DE TABLA A2
          const filas = centrosPoblados.map(cp => ({
            punto: cp.CCPP || cp.ccpp || '____',
            nombre: cp.CCPP || cp.ccpp || '____',
            codigo: (cp.CODIGO || cp.codigo || '').toString(),
            poblacion: (cp.POBLACION || cp.poblacion || '0').toString(),
            viviendasEmpadronadas: '0',
            viviendasOcupadas: '0'
          }));
          
          console.log(`%c[Seccion4] ✅ LLENANDO tabla A2 con ${filas.length} centros poblados`, 'color: #00aa00; font-weight: bold');
          console.log(`[Seccion4] Filas A2 a guardar:`, filas);
          
          this.onFieldChange(dataKeyA2 as any, filas, { refresh: false });
          this.datos[dataKeyA2] = filas;
        } else {
          console.warn(`[Seccion4] ⚠️ No se encontraron datos de centros poblados en jsonCompleto`);
        }
      } else {
        console.warn(`[Seccion4] ⚠️ jsonCompleto no disponible, no puedo llenar tabla A2`);
      }
    } else {
      console.log(`[Seccion4] ✅ Tabla A2 ya sincronizada con códigos, preservando:`, tablaA2Actual);
    }

    this.actualizarDatos(); // Forzar actualización
    this.cdRef.markForCheck(); // Forzar detección de cambios
    
    console.log(`%c[Seccion4] autoLlenarTablas COMPLETE`, 'color: #0066cc; font-weight: bold');
  }

  onTablaUpdated(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const keyA1 = prefijo ? `tablaAISD1Datos${prefijo}` : 'tablaAISD1Datos';
    const keyA2 = prefijo ? `tablaAISD2Datos${prefijo}` : 'tablaAISD2Datos';
    
    console.log(`\n%c[Seccion4] === TABLA ACTUALIZADA ===`, 'color: #ff6600; font-weight: bold; font-size: 14px');
    console.log(`[Seccion4] prefijo detectado: "${prefijo}"`);
    console.log(`[Seccion4] keyA1: "${keyA1}", keyA2: "${keyA2}"`);
    
    // ✅ USAR SIGNALS PARA OBTENER DATOS COMPLETOS Y ACTUALIZADOS
    let tablaA1Actual = this.tablaAISD1Signal();
    const tablaA2Actual = this.tablaAISD2Signal();
    
    console.log(`[Seccion4] tablaA1Actual.length: ${tablaA1Actual?.length || 0}`);
    if (tablaA1Actual && tablaA1Actual.length > 0) {
      console.log(`[Seccion4] Primeras filas A1:`, tablaA1Actual.slice(0, 3));
      if (tablaA1Actual.length > 3) {
        console.log(`[Seccion4] Últimas filas A1:`, tablaA1Actual.slice(-2));
      }
    } else {
      console.warn(`%c[Seccion4] ⚠️ TABLA A1 VACÍA - intentando re-llenarla`, 'color: #ff6600; font-weight: bold');
      // ✅ Protección: si tabla A1 está vacía, re-llenarla automáticamente
      const nombreComunidad = this.obtenerNombreComunidadPublico();
      const capital = this.dataSrv.obtenerCapitalComunidad(this.datos, this.seccionId) || nombreComunidad;
      const datosCap = this.dataSrv.buscarDatosCentro(this.datos, capital);
      const filaA1 = [{
        localidad: capital,
        coordenadas: datosCap?.coordenadas || this.datos.coordenadasAISD || '____',
        altitud: datosCap?.altitud || this.datos.altitudAISD || '____',
        distrito: datosCap?.distrito || this.datos.distritoSeleccionado || '____',
        provincia: datosCap?.provincia || this.datos.provinciaSeleccionada || '____',
        departamento: datosCap?.departamento || this.datos.departamentoSeleccionado || '____'
      }];
      console.log(`%c[Seccion4] ✅ Re-llenando tabla A1 con capital: ${capital}`, 'color: #00aa00; font-weight: bold');
      tablaA1Actual = filaA1;
    }
    
    console.log(`[Seccion4] tablaA2Actual.length: ${tablaA2Actual?.length || 0}`);
    if (tablaA2Actual && tablaA2Actual.length > 0) {
      console.log(`[Seccion4] Primeras filas A2:`, tablaA2Actual.slice(0, 3));
      if (tablaA2Actual.length > 3) {
        console.log(`[Seccion4] Últimas filas A2 (después de fila 3):`, tablaA2Actual.slice(3));
      }
    }
    
    // 1. Persistir ambas tablas al projectFacade
    const payload: Record<string, any> = {};
    if (tablaA1Actual && tablaA1Actual.length > 0) {
      payload[keyA1] = tablaA1Actual.map((r: any) => (typeof r === 'object' && r != null ? { ...r } : r));
      console.log(`[Seccion4] Persistiendo ${tablaA1Actual.length} filas de A1 con key "${keyA1}"`);
    }
    if (tablaA2Actual && tablaA2Actual.length > 0) {
      payload[keyA2] = tablaA2Actual.map((r: any) => (typeof r === 'object' && r != null ? { ...r } : r));
      console.log(`[Seccion4] Persistiendo ${tablaA2Actual.length} filas de A2 con key "${keyA2}"`);
    }
    
    if (Object.keys(payload).length > 0) {
      console.log(`[Seccion4] Llamando projectFacade.setFields()...`);
      this.projectFacade.setFields(this.seccionId, null, payload);
      console.log(`[Seccion4] ✅ setFields completado`);
    }
    
    // ✅ CALCULAR TOTALES USANDO EL ARRAY COMPLETO DE LA TABLA
    // No usar this.datos (que puede estar incompleto), usar tablaA2Actual directamente
    const totals = this.dataSrv.calcularTotalesAISD2(tablaA2Actual || []);
    console.log(`[Seccion4] Totales calculados:`, totals);
    
    // 2. Persistir totales
    console.log(`[Seccion4] Persistiendo totales...`);
    this.onFieldChange(`tablaAISD2TotalPoblacion${prefijo}`, totals.poblacion, { refresh: false });
    this.onFieldChange(`tablaAISD2TotalViviendasEmpadronadas${prefijo}`, totals.empadronadas, { refresh: false });
    this.onFieldChange(`tablaAISD2TotalViviendasOcupadas${prefijo}`, totals.ocupadas, { refresh: false });
    console.log(`[Seccion4] ✅ Totales persistidos`);
    
    this.actualizarDatos();
    this.cdRef.markForCheck();
    console.log(`%c[Seccion4] === FIN TABLA ACTUALIZADA ===\n`, 'color: #ff6600; font-weight: bold; font-size: 14px');
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
