import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy, Injector, ChangeDetectionStrategy, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { SECCION6_COLUMNAS_POBLACION_SEXO, SECCION6_COLUMNAS_POBLACION_ETARIO, SECCION6_TABLA_POBLACION_SEXO_CONFIG, SECCION6_TABLA_POBLACION_ETARIO_CONFIG, SECCION6_TEMPLATES, SECCION6_CONFIG, SECCION6_WATCHED_FIELDS } from './seccion6-constants';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { FotoItem } from '../image-upload/image-upload.component';
import { debugLog } from 'src/app/shared/utils/debug';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { transformPoblacionSexoDesdeDemograficos, transformPoblacionEtarioDesdeDemograficos } from 'src/app/core/config/table-transforms';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { FormPersistenceService } from 'src/app/core/services/state/form-persistence.service';

// Función helper para desenvuelver datos del backend (igual a auto-backend-endpoint-handlers)
const unwrapDemograficoData = (responseData: any): any[] => {
  if (!responseData) return [];
  // El backend devuelve un array con un objeto que contiene rows
  if (Array.isArray(responseData) && responseData.length > 0) {
    return responseData[0]?.rows || responseData;
  }
  if (responseData.data) {
    const data = responseData.data;
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.rows || data;
    }
    return data;
  }
  return [];
};

@Component({
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CoreSharedModule
  ],
  selector: 'app-seccion6-form',
  templateUrl: './seccion6-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion6FormComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = SECCION6_CONFIG.sectionId;
  
  // ✅ Hacer TEMPLATES accesible en template
  readonly SECCION6_TEMPLATES = SECCION6_TEMPLATES;
  
  override readonly PHOTO_PREFIX = SECCION6_CONFIG.photoPrefix;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION6_WATCHED_FIELDS;

  // ✅ Signal de prefijo de grupo AISD
  readonly prefijoGrupoSignal: Signal<string> = computed(() => this.obtenerPrefijoGrupo());

  poblacionSexoConfig: TableConfig = SECCION6_TABLA_POBLACION_SEXO_CONFIG;
  poblacionEtarioConfig: TableConfig = SECCION6_TABLA_POBLACION_ETARIO_CONFIG;
  
  // ✅ Getters para columnas
  get poblacionSexoColumns() { return SECCION6_COLUMNAS_POBLACION_SEXO; }
  get poblacionEtarioColumns() { return SECCION6_COLUMNAS_POBLACION_ETARIO; }
  
  override fotografiasFormMulti: FotoItem[] = [];

  // ✅ SIGNAL PARA FOTOGRAFÍAS - ÚNICA VERDAD
  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const prefix = this.PHOTO_PREFIX;
    const prefijo = this.prefijoGrupoSignal();
    const data = this.sectionDataSignal();
    
    for (let i = 1; i <= 10; i++) {
      const imagenKey = `${prefix}${i}Imagen${prefijo}`;
      const tituloKey = `${prefix}${i}Titulo${prefijo}`;
      const fuenteKey = `${prefix}${i}Fuente${prefijo}`;
      
      const imagen = data[imagenKey];
      if (imagen) {
        fotos.push({
          imagen: imagen,
          titulo: data[tituloKey] || `Fotografía ${i}`,
          fuente: data[fuenteKey] || 'GEADES, 2024'
        } as FotoItem);
      }
    }
    return fotos;
  });

  // ✅ SIGNALS PUROS
  readonly sectionDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly poblacionSexoSignal: Signal<any[]> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.sectionDataSignal();
    const tablaKey = prefijo ? `poblacionSexoAISD${prefijo}` : 'poblacionSexoAISD';
    
    // ✅ SOLO buscar con prefijo - no fallback a sin prefijo para evitar confusión
    const tablaConPrefijo = prefijo ? data[`poblacionSexoAISD${prefijo}`] : null;
    
    if (tablaConPrefijo && this.tieneContenidoRealTablaDemografia(tablaConPrefijo)) {
      return tablaConPrefijo;
    }
    return [];
  });

  readonly poblacionEtarioSignal: Signal<any[]> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.sectionDataSignal();
    const tablaKey = prefijo ? `poblacionEtarioAISD${prefijo}` : 'poblacionEtarioAISD';
    
    const tablaConPrefijo = prefijo ? data[`poblacionEtarioAISD${prefijo}`] : null;
    
    // ✅ SOLO buscar con prefijo - no fallback a sin prefijo para evitar confusión
    if (tablaConPrefijo && this.tieneContenidoRealTablaDemografia(tablaConPrefijo)) {
      return tablaConPrefijo;
    }
    return [];
  });

  readonly textoPoblacionSexoSignal: Signal<string> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.sectionDataSignal();
    
    // ✅ Prioridad: leer valor manual si existe (con prefijo y sin prefijo)
    const manualKey = `textoPoblacionSexoAISD${prefijo}`;
    const manual = data[manualKey];
    
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    
    // Fallback: generar texto automático
    const nombreComunidad = this.obtenerNombreComunidadActual();
    return this.obtenerTextoPoblacionSexo(data, nombreComunidad);
  });

  readonly textoPoblacionEtarioSignal: Signal<string> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.sectionDataSignal();
    
    // ✅ Prioridad: leer valor manual si existe (con prefijo y sin prefijo)
    const manualKey = `textoPoblacionEtarioAISD${prefijo}`;
    const manual = data[manualKey];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    
    // Fallback: generar texto automático
    const nombreComunidad = this.obtenerNombreComunidadActual();
    return this.obtenerTextoPoblacionEtario(data, nombreComunidad);
  });

  readonly totalPoblacionSexoSignal: Signal<number> = computed(() => {
    const poblacion = this.poblacionSexoSignal();
    const sinTotal = Array.isArray(poblacion)
      ? poblacion.filter((item: any) => (item?.sexo ?? '').toString().toLowerCase() !== 'total')
      : [];
    return sinTotal.reduce((sum: number, item: any) => {
      const casos = parseInt(item['casos'], 10);
      return sum + (isNaN(casos) ? 0 : casos);
    }, 0);
  });

  readonly totalPoblacionEtarioSignal: Signal<number> = computed(() => {
    const poblacion = this.poblacionEtarioSignal();
    const sinTotal = Array.isArray(poblacion)
      ? poblacion.filter((item: any) => (item?.categoria ?? '').toString().toLowerCase() !== 'total')
      : [];
    return sinTotal.reduce((sum: number, item: any) => {
      const casos = parseInt(item['casos'], 10);
      return sum + (isNaN(casos) ? 0 : casos);
    }, 0);
  });

  private backendLoadSeq = 0;

  private tieneContenidoRealTablaDemografia(tabla: any[]): boolean {
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) return false;
    return tabla.some((item: any) => {
      if (!item || typeof item !== 'object') return false;
      const sexo = (item.sexo ?? '').toString().trim();
      const categoria = (item.categoria ?? '').toString().trim();
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos, 10) || 0;
      return sexo !== '' || categoria !== '' || casos > 0;
    });
  }

  // ✅ SIGNAL PARA INFORMACIÓN DE GRUPOS AISD (Sección 6 pertenece a un grupo)
  readonly aisdGroupsSignal: Signal<readonly any[]> = computed(() => {
    return this.projectFacade.groupsByType('AISD')();
  });

  // ✅ NUMERACIÓN GLOBAL - Tablas (dos tablas: sexo y etario)
  readonly globalTableNumberSignalSexo: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  });
  
  readonly globalTableNumberSignalEtario: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
  });
  
  // ✅ NUMERACIÓN GLOBAL - Fotos
  readonly photoNumbersSignal: Signal<string[]> = computed(() => {
    const fotos = this.fotografiasCache || [];
    return fotos.map((_, index) => 
      this.globalNumbering.getGlobalPhotoNumber(this.seccionId, this.PHOTO_PREFIX, index)
    );
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private tableFacade: TableManagementFacade,
    private globalNumbering: GlobalNumberingService,
    private backendApi: BackendApiService,
    private formChange: FormChangeService,
    private formPersistence: FormPersistenceService
  ) {
    super(cdRef, injector);
    
    // ✅ FLUJO UNICA_VERDAD - Logging para pruebas
    console.clear();
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════════════╗');
    console.log('║  🎯 SECCIÓN 6 - FLUJO UNICA_VERDAD - MODO DEBUG                    ║');
    console.log('╠════════════════════════════════════════════════════════════════════════╣');
    console.log('║  Escenarios:                                                           ║');
    console.log('║    #1: Primera carga    → Backend + Session-Data                     ║');
    console.log('║    #2: Recarga F5       → Session-Data (sin Backend)                  ║');
    console.log('║    #3: Edita datos      → Actualizar Session-Data                    ║');
    console.log('║    #4: Recarga después  → Session-Data (recupera edits)               ║');
    console.log('║    #5: Cambia CPP      → Limpiar Session-Data + Backend nuevo        ║');
    console.log('║    #6: TTL expira      → Backend + Session-Data nueva                ║');
    console.log('╚════════════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`[SECCION6:INIT] 📋 Sección ID: ${this.seccionId}`);
    console.log(`[SECCION6:INIT] 🏷️ Prefijo inicial: ${this.obtenerPrefijoGrupo()}`);
    console.log('[SECCION6:INIT] ⏳ Esperando carga de datos...');
    console.log('');
    
    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX, label: 'Demografía' }
    ];
    // Configs ya inicializadas como propiedades de clase
    
    // ✅ EFFECT 1: NO USAR - Los signals leen directamente de ProjectStateFacade
    // Los signals como poblacionSexoSignal ya leen de ProjectStateFacade correctamente

    // ✅ EFFECT 2: Monitorear cambios de fotografías y sincronizar
    // Este efecto replica el patrón de Sección 5 (MODO IDEAL)
    // allowSignalWrites: true permite escribir a fotografiasFormMulti después de cargarFotografias()
    effect(() => {
      this.fotosCacheSignal();  // ✅ ÚNICA VERDAD: Monitorea cambios en CUALQUIER campo de fotografía
      this.cargarFotografias();  // Recarga fotografías reactivamente
      
      // ✅ CRÍTICO: Después de cargarFotografias(), actualizar fotografiasFormMulti
      // Esto asegura que el template se renderice con las nuevas imágenes
      this.fotografiasFormMulti = [...this.fotografiasCache];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });

    // ✅ EFFECT 3: Calcular porcentajes cuando los datos de población cambien
    effect(() => {
      const prefijo = this.prefijoGrupoSignal();
      const sexoData = this.poblacionSexoSignal();
      const etarioData = this.poblacionEtarioSignal();
      
      // Verificar si necesita cálculo de porcentajes
      if (sexoData.length > 0 && !this.tienePorcentajesCalculados(sexoData)) {
        console.log(`[SECCION6:CALCULO] ⚡ Calculando porcentajes para tabla sexo...`);
        this.tableFacade.calcularTotalesYPorcentajes(
          this.sectionDataSignal(),
          { ...SECCION6_TABLA_POBLACION_SEXO_CONFIG, tablaKey: `poblacionSexoAISD${prefijo}` }
        );
      }

      if (etarioData.length > 0 && !this.tienePorcentajesCalculados(etarioData)) {
        console.log(`[SECCION6:CALCULO] ⚡ Calculando porcentajes para tabla etario...`);
        this.tableFacade.calcularTotalesYPorcentajes(
          this.sectionDataSignal(),
          { ...SECCION6_TABLA_POBLACION_ETARIO_CONFIG, tablaKey: `poblacionEtarioAISD${prefijo}` }
        );
      }

      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 4: Monitoreo de grupos AISD
    effect(() => {
      const gruposAISD = this.aisdGroupsSignal();
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 5: Detectar cambio de CPP/grupo y limpiar session-data
    effect(() => {
      const prefijoActual = this.prefijoGrupoSignal();
      
      // Si no hay prefijo (aún no se inicializó), ignorar
      if (!prefijoActual) return;
      
      // Comparar con el prefijo anterior
      const prefijoAnterior = this._prefijoAnterior;
      if (prefijoAnterior === undefined) {
        // Primera vez que cargamos el prefijo, solo guardar
        console.log(`[SECCION6:EFFECT] 🆕 First time load, saving prefijo: ${prefijoActual}`);
        this._prefijoAnterior = prefijoActual;
        return;
      }
      
      // Si el prefijo cambió, significa que el usuario cambió de CPP/grupo
      if (prefijoAnterior !== prefijoActual) {
        console.log('');
        console.log('╔═════════════════════════════════════════════════════════════╗');
        console.log('║ 🎯 ESCENARIO #5: CAMBIO DE CPP DETECTADO                 ║');
        console.log('║                                                             ║');
        console.log('║ El usuario cambió de Centro Poblado en Sección 2           ║');
        console.log('║ Esto requiere:                                              ║');
        console.log('║   1. Limpiar Session-Data (datos antiguos)              ║');
        console.log('║   2. Nuevo backend call (nuevos datos)                  ║');
        console.log('╚═════════════════════════════════════════════════════════════╝');
        console.log(`[SECCION6:EFFECT] 🔄 CAMBIO DE CPP DETECTADO!!!`, { 
          prefijoAnterior, 
          prefijoNuevo: prefijoActual,
          backendLoadSeq_before: this.backendLoadSeq
        });
        
        // Limpiar session-data de las tablas del prefijo anterior
        const tablaKeySexoAnterior = `poblacionSexoAISD${prefijoAnterior}`;
        const tablaKeyEtarioAnterior = `poblacionEtarioAISD${prefijoAnterior}`;
        console.log(`[SECCION6:EFFECT] 🗑️ Will clear tables: ${tablaKeySexoAnterior}, ${tablaKeyEtarioAnterior}`);
        
        try {
          this.formPersistence.clearSectionState(this.seccionId);
          console.log(`[SECCION6:EFFECT] ✅ Session-data cleaned for new CPP`);
        } catch (e) {
          console.error(`[SECCION6:EFFECT] ⚠️ Error cleaning session-data:`, e);
        }
        
        // Actualizar el prefijo anterior
        this._prefijoAnterior = prefijoActual;
        
        // Marcar que necesita recargarse
        this.backendLoadSeq++;
        console.log(`[SECCION6:EFFECT] 📌 Incremented backendLoadSeq to: ${this.backendLoadSeq}, will trigger reload`);
      } else {
        console.log(`[SECCION6:EFFECT] ➖ Prefijo unchanged: ${prefijoActual}`);
      }
    });
  }
  
  // ✅ Variable privada para rastrear el prefijo anterior (para detectar cambios)
  private _prefijoAnterior: string | undefined;

  /**
   * Log interno para mostrar información del grupo AISD en consola
   */
  private logGrupoAISDParaConsola(numeroGrupo: number, grupo: any): void {
    // Method body removed
  }

  protected override onInitCustom(): void {
    this.cargarTodosLosGrupos();
    this.cargarFotografias();
    // ✅ Sincronizar fotografiasFormMulti con fotografiasCache después de cargar
    this.fotografiasFormMulti = [...this.fotografiasCache];
    
    // ✅ FASE 3: Cargar datos demográficos desde el backend
    // Los endpoints están configurados en field-mappings para cargar automáticamente
    this.cargarDatosDelBackend();
  }
  
  /**
   * ✅ Carga datos del backend UNA SOLA VEZ (con session-data)
   * FLUJO:
   * 1️⃣ PRIMERA CARGA: Backend → Session-data (como si usuario ingresara) → Mostrar
   * 2️⃣ RECARGA (F5): Session-data → Mostrar (sin backend)
   * 3️⃣ EDITS: Actualizar session-data
   * 4️⃣ CAMBIO CPP: Limpiar session-data → Vuelve al paso 1
   */
  // ✅ FLUJO: Cargar datos - Primero Session-Data, luego Backend si no existe
  private cargarDatosDelBackend(): void {
    console.log('');
    console.log('┌─────────────────────────────────────────────────────────────');
    console.log('│ [SECCION6:FLUJO] 🔍 CARGAR DATOS DEL BACKEND');
    console.log('│                                                             ');
    console.log('│ Flujo: Verificar Session-Data → Si no existe → Backend   ');
    console.log('└─────────────────────────────────────────────────────────────');
    console.log(`[SECCION6] 🚀 cargarDatosDelBackend() called, backendLoadSeq: ${this.backendLoadSeq}`);
    
    // ✅ USAR getCodigosCentrosPobladosAISD() DEL GRUPO ACTUAL
    const codigosArray = this.getCodigosCentrosPobladosAISD();
    const codigos = [...codigosArray];

    if (!codigos || codigos.length === 0) {
      console.log(`[SECCION6] ⚠️ No hay centros poblados en el grupo actual para cargar datos`);
      return;
    }
    
    console.log(`[SECCION6] 📋 Codigos CPP: ${codigos.join(', ')}`);

    const seccionIdAtCall = this.seccionId;
    const prefijoAtCall = this.obtenerPrefijoGrupo();
    const tablaKeySexo = `poblacionSexoAISD${prefijoAtCall}`;
    const tablaKeyEtario = `poblacionEtarioAISD${prefijoAtCall}`;
    
    console.log(`[SECCION6] 🔑 Keys: sexo=${tablaKeySexo}, etario=${tablaKeyEtario}`);

    // ✅ CARGAR DE SESSION-DATA PRIMERO (datos ya guardados después de primera carga backend)
    console.log(`[SECCION6] 🔍 Checking session-data for section: ${seccionIdAtCall}`);
    this.formPersistence.loadSectionState(seccionIdAtCall).then(sessionState => {
      console.log(`[SECCION6] 📦 Session state loaded:`, sessionState ? 'EXISTS' : 'NULL');
      
      // ✅ Buscar en el grupo 'table' donde se guardan las tablas
      const tableGroup = sessionState?.['table'];
      const sexoData = tableGroup?.[tablaKeySexo]?.value;
      const etarioData = tableGroup?.[tablaKeyEtario]?.value;
      
      // ============================================================
      // 🎯 FLUJO: DECISIÓN - Session-Data vs Backend
      // ============================================================
      // - Si sessionState tiene datos → USAR Session-Data (Escenario #2, #4)
      // - Si sessionState NO tiene datos → LLAMAR Backend (Escenario #1, #5, #6)
      // ============================================================
      
      if (sexoData || etarioData) {
        console.log('');
        console.log('┌─────────────────────────────────────────────────────────────┐');
        console.log('│ 🎯 ESCENARIO #2 o #4: SESION-DATA EXISTE → USAR CACHE   │');
        console.log('│                                                             │');
        console.log('│ Esto ocurre cuando:                                         │');
        console.log('│   #2: Usuario recarga página (F5) después de primera carga │');
        console.log('│   #4: Usuario vuelve después de editar datos              │');
        console.log('└─────────────────────────────────────────────────────────────┘');
        console.log(`[SECCION6] ✅ DATOS ENCONTRADOS EN SESSION-DATA! Using cached data.`);
        console.log(`[SECCION6] ✅ Keys found in session: sexo=${!!sexoData}, etario=${!!etarioData}`);
        
        // ✅ IMPORTANTE: Restaurar datos en ProjectStateFacade desde session-data
        // Esto asegura que los signals lean datos correctos
        if (sexoData) {
          this.projectFacade.setField(seccionIdAtCall, null, tablaKeySexo, sexoData);
          this.projectFacade.setTableData(seccionIdAtCall, null, tablaKeySexo, sexoData);
          console.log(`[SECCION6] ✅ Sexo data RESTORED to ProjectStateFacade`);
        }
        if (etarioData) {
          this.projectFacade.setField(seccionIdAtCall, null, tablaKeyEtario, etarioData);
          this.projectFacade.setTableData(seccionIdAtCall, null, tablaKeyEtario, etarioData);
          console.log(`[SECCION6] ✅ Etario data RESTORED to ProjectStateFacade`);
        }
        
        // ✅ FORZAR actualización del Form para que Lea los signals correctamente
        this.cdRef.markForCheck();
        console.log(`[SECCION6] ✅ Form updated with cached data`);
        return;
      }
      
      // ✅ NO están en session-data → PRIMERA VEZ → Cargar del backend
      console.log('');
      console.log('┌─────────────────────────────────────────────────────────────┐');
      console.log('│ 🎯 ESCENARIO #1, #5 o #6: SIN SESSION-DATA → BACKEND    │');
      console.log('│                                                             │');
      console.log('│ Esto ocurre cuando:                                         │');
      console.log('│   #1: Primera vez que usuario abre la sección             │');
      console.log('│   #5: Usuario cambió de CPP (nuevo prefijo)               │');
      console.log('│   #6: TTL de 7 días expiró (Redis eliminó datos)         │');
      console.log('└─────────────────────────────────────────────────────────────┘');
      console.log(`[SECCION6] 📡 ❌ NO HAY DATOS EN SESSION-DATA! This is FIRST LOAD or NEW CPP.`);
      console.log(`[SECCION6] 📡 Calling backend to fetch demography data...`);
      this.cargarDelBackendYGuardarEnSessionData(seccionIdAtCall, prefijoAtCall, tablaKeySexo, tablaKeyEtario, codigos);
    });
  }

  /**
   * ✅ Cargar del backend y guardar en session-data (como si usuario ingresara)
   */
  private cargarDelBackendYGuardarEnSessionData(
    seccionId: string,
    prefijo: string,
    tablaKeySexo: string,
    tablaKeyEtario: string,
    codigos: string[]
  ): void {
    const seq = ++this.backendLoadSeq;
    console.log(`[SECCION6:BACKEND] 📡 Starting backend load, seq=${seq}, codigos=${codigos.join(',')}`);
    
    // Cargar población por sexo desde /demograficos/datos
    this.backendApi.postDatosDemograficos(codigos).subscribe({
      next: async (response: any) => {
        try {
          if (seq !== this.backendLoadSeq) {
            console.log(`[SECCION6:BACKEND] ⚠️ SEQ MISMATCH (sexo): ignoring response, seq=${seq}, currentSeq=${this.backendLoadSeq}`);
            return;
          }
          if (this.seccionId !== seccionId) {
            console.log(`[SECCION6:BACKEND] ⚠️ Section ID mismatch (sexo): ignoring`);
            return;
          }

          const dataRaw = response?.data || [];
          const datosDesenvueltos = unwrapDemograficoData(dataRaw);
          const datosTransformados = transformPoblacionSexoDesdeDemograficos(datosDesenvueltos);
          console.log(`[SECCION6:BACKEND] ✅ Sexo data loaded from backend: ${datosTransformados.length} rows`);
          
          if (datosTransformados.length > 0) {
            // ✅ Recalc para consistencia
            const tmp: Record<string, any> = { [tablaKeySexo]: structuredClone(datosTransformados) };
            this.tableFacade.calcularTotalesYPorcentajes(tmp, { ...SECCION6_TABLA_POBLACION_SEXO_CONFIG, tablaKey: tablaKeySexo });
            const tablaFinal = tmp[tablaKeySexo] || datosTransformados;

            // ✅ GUARDAR EN PROJECTSTATE (solo con prefijo para aislamiento correcto)
            this.projectFacade.setField(seccionId, null, tablaKeySexo, tablaFinal);
            // NO guardar en poblacionSexoAISD sin prefijo - causa confusión
            this.projectFacade.setTableData(seccionId, null, tablaKeySexo, tablaFinal);
            // NO guardar en poblacionSexoAISD sin prefijo

            // ✅ GUARDAR EN SESSION-DATA SOLO CON PREFIJO (aislamiento correcto)
            try {
              console.log(`[SECCION6:BACKEND] 💾 Saving sexo ONLY with prefix: ${tablaKeySexo}`);
              this.formChange.persistFields(seccionId, 'table', { [tablaKeySexo]: tablaFinal }, { notifySync: true });
              console.log(`[SECCION6:BACKEND] ✅ Sexo data saved to session-data with prefix only`);
              
              // ============================================================
              // 🎯 FLUJO COMPLETO #1: Primera carga
              // ============================================================
              // 1. ✅ Backend devuelve datos
              // 2. ✅ Transformar datos
              // 3. ✅ GUARDAR en Session-Data (Redis) ← ACABAMOS DE HACER ESTO
              // 4. ✅ Mostrar en UI (signals leen de ProjectStateFacade)
              // 5. ✅ Si usuario recarga (F5) → Escenario #2
              // ============================================================
              console.log('');
              console.log('┌─────────────────────────────────────────────────────────────┐');
              console.log('│ ✅ ESCENARIO #1 COMPLETADO: Primera carga exitosa        │');
              console.log('│                                                             │');
              console.log('│ Datos guardados en:                                         │');
              console.log('│   1. Session-Data (Redis) - TTL 7 días                     │');
              console.log('│   2. ProjectStateFacade (Frontend)                        │');
              console.log('│                                                             │');
              console.log('│ Siguiente paso:                                             │');
              console.log('│   - Si usuario recarga (F5) → Escenario #2                │');
              console.log('│   - Si usuario edita datos → Escenario #3                 │');
              console.log('└─────────────────────────────────────────────────────────────┘');
            } catch (e) {
              console.error(`[SECCION6:BACKEND] ⚠️ Could not save to session-data:`, e);
            }

            this.cdRef.markForCheck();
          }
        } catch (e) {
          console.error(`[SECCION6:BACKEND] ❌ Error transforming sexo data:`, e);
        }
      },
      error: (err: any) => {
        console.error(`[SECCION6:BACKEND] ❌ Error loading population by sexo:`, err);
      }
    });

    // Cargar población por grupo etario
    this.backendApi.postEtario(codigos).subscribe({
      next: async (response: any) => {
        try {
          if (seq !== this.backendLoadSeq) {
            console.log(`[SECCION6:BACKEND] ⚠️ SEQ MISMATCH (etario): ignoring response`);
            return;
          }
          if (this.seccionId !== seccionId) return;

          const dataRaw = response?.data || [];
          const datosDesenvueltos = unwrapDemograficoData(dataRaw);
          const datosTransformados = transformPoblacionEtarioDesdeDemograficos(datosDesenvueltos);
          console.log(`[SECCION6:BACKEND] ✅ Etario data loaded from backend: ${datosTransformados.length} rows`);
          
          if (datosTransformados.length > 0) {
            const tmp: Record<string, any> = { [tablaKeyEtario]: structuredClone(datosTransformados) };
            this.tableFacade.calcularTotalesYPorcentajes(tmp, { ...SECCION6_TABLA_POBLACION_ETARIO_CONFIG, tablaKey: tablaKeyEtario });
            const tablaFinal = tmp[tablaKeyEtario] || datosTransformados;

            this.projectFacade.setField(seccionId, null, tablaKeyEtario, tablaFinal);
            // NO guardar en poblacionEtarioAISD sin prefijo - causa confusión
            this.projectFacade.setTableData(seccionId, null, tablaKeyEtario, tablaFinal);
            // NO guardar en poblacionEtarioAISD sin prefijo

            // ✅ GUARDAR EN SESSION-DATA SOLO CON PREFIJO (aislamiento correcto)
            try {
              console.log(`[SECCION6:BACKEND] 💾 Saving etario ONLY with prefix: ${tablaKeyEtario}`);
              this.formChange.persistFields(seccionId, 'table', { [tablaKeyEtario]: tablaFinal }, { notifySync: true });
              console.log(`[SECCION6:BACKEND] ✅ Etario data saved to session-data with prefix only`);
            } catch (e) {
              console.error(`[SECCION6:BACKEND] ⚠️ Could not save etario to session-data:`, e);
            }

            this.cdRef.markForCheck();
          }
        } catch (e) {
          console.error(`[SECCION6:BACKEND] ❌ Error transforming etario data:`, e);
        }
      },
      error: (err: any) => {
        console.error(`[SECCION6:BACKEND] ❌ Error loading population by etario:`, err);
      }
    });
  }

  /**
   * ✅ Aplica los edits del usuario (desde session-data) sobre los datos del backend
   * Hace un merge por índice de fila: si el usuario editó una fila, se usa su versión
   */
  private aplicarEditsATabla(datosBackend: any[], editsUsuario: any[]): any[] {
    if (!Array.isArray(datosBackend) || !Array.isArray(editsUsuario)) {
      return datosBackend;
    }

    // Crear un mapa de edits por índice
    const editMap = new Map<number, any>();
    editsUsuario.forEach((edit, index) => {
      editMap.set(index, edit);
    });

    // Aplicar edits: si el usuario editó la fila en ese índice, usar su versión
    const resultado = datosBackend.map((datosRow, index) => {
      if (editMap.has(index)) {
        // El usuario editó esta fila
        return editMap.get(index);
      }
      // No fue editada, mantener datos del backend
      return datosRow;
    });

    return resultado;
  }

  /**
   * ✅ Verifica si una tabla ya tiene porcentajes calculados
   */
  private tienePorcentajesCalculados(datos: any[]): boolean {
    return datos.some((item: any) => 
      item.porcentaje && 
      item.porcentaje !== '—' && 
      item.porcentaje !== '' && 
      item.porcentaje !== null &&
      !item.sexo?.toString().toLowerCase().includes('total') &&
      !item.categoria?.toString().toLowerCase().includes('total')
    );
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  override obtenerNombreComunidadActual(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // ✅ NUEVO: Usar aisdGroups() signal para obtener el nombre del grupo actual
    if (prefijo && prefijo.startsWith('_A')) {
      const match = prefijo.match(/_A(\d+)/);
      if (match) {
        const index = parseInt(match[1]) - 1; // _A1 → índice 0, _A2 → índice 1
        const grupos = this.aisdGroups();
        if (grupos && grupos[index]?.nombre) {
          return grupos[index].nombre;
        }
      }
    }
    
    const datos = this.sectionDataSignal();
    
    // Fallback: buscar en datos guardados
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(datos, 'grupoAISD', this.seccionId);
    if (grupoAISD && grupoAISD.trim() !== '') {
      return grupoAISD;
    }
    
    const grupoConSufijo = prefijo ? datos[`grupoAISD${prefijo}`] : null;
    if (grupoConSufijo && grupoConSufijo.trim() !== '') {
      return grupoConSufijo;
    }
    
    if (datos['comunidadesCampesinas'] && Array.isArray(datos['comunidadesCampesinas']) && datos['comunidadesCampesinas'].length > 0) {
      const primerCC = datos['comunidadesCampesinas'][0];
      if (primerCC && primerCC['nombre'] && primerCC['nombre'].trim() !== '') {
        return primerCC['nombre'];
      }
    }
    
    return '____';
  }

  override obtenerValorConPrefijo(campo: string): any {
    const datos = this.sectionDataSignal();
    return PrefijoHelper.obtenerValorConPrefijo(datos, campo, this.seccionId);
  }



  getTotalPoblacionSexo(): number {
    return this.totalPoblacionSexoSignal();
  }

  getTotalPoblacionEtario(): number {
    return this.totalPoblacionEtarioSignal();
  }

  getPorcentajeTotalPoblacionSexo(): string {
    const total = this.getTotalPoblacionSexo();
    return total === 0 ? '0,00 %' : '100,00 %';
  }

  getPorcentajeTotalPoblacionEtario(): string {
    const total = this.getTotalPoblacionEtario();
    return total === 0 ? '0,00 %' : '100,00 %';
  }

  onTablaSexoActualizada(): void {
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onTablaEtarioActualizada(): void {
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  // ✅ Override: UNICA_VERDAD - Solo guardar en ProjectStateFacade
  // ELIMINADO: super.onFotografiasChange() que escribía en PhotoCoordinator (legacy)
  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    console.log(`[SECCION6:FORM:FOTOS] 📝 onFotografiasChange llamado con ${fotografias.length} fotos`);
    console.log(`[SECCION6:FORM:FOTOS] 📝 Detalle fotos:`, fotografias.map(f => ({ titulo: f.titulo, fuente: f.fuente, tieneImagen: !!f.imagen })));
    
    // ✅ GUARDAR EN PROJECTSTATEFACADE - ÚNICA FUENTE DE VERDAD
    const prefijo = this.prefijoGrupoSignal();
    console.log(`[SECCION6:FORM:FOTOS] 📝 Prefijo: ${prefijo}, guardando ${fotografias.length} fotos en ProjectStateFacade`);
    
    for (let i = 0; i < fotografias.length; i++) {
      const foto = fotografias[i];
      const idx = i + 1;
      
      // ✅ Usar PHOTO_PREFIX consistente (fotografiaDemografia)
      const imgKey = `${this.PHOTO_PREFIX}${idx}Imagen${prefijo}`;
      const titKey = `${this.PHOTO_PREFIX}${idx}Titulo${prefijo}`;
      const fuenteKey = `${this.PHOTO_PREFIX}${idx}Fuente${prefijo}`;
      const numeroKey = `${this.PHOTO_PREFIX}${idx}Numero${prefijo}`;
      
      console.log(`[SECCION6:FORM:FOTOS] 💾 Guardando foto ${idx}:`, {
        imgKey,
        titKey,
        fuenteKey,
        tieneImagen: !!foto.imagen,
        titulo: foto.titulo,
        fuente: foto.fuente
      });
      
      this.projectFacade.setField(this.seccionId, null, imgKey, foto.imagen);
      this.projectFacade.setField(this.seccionId, null, titKey, foto.titulo);
      this.projectFacade.setField(this.seccionId, null, fuenteKey, foto.fuente);
      this.projectFacade.setField(this.seccionId, null, numeroKey, idx);
    }
    
    console.log(`[SECCION6:FORM:FOTOS] ✅ Guardado completado en UNICA_VERDAD`);
    
    // ✅ Actualizar referencias locales (para templates que usan fotografiasFormMulti)
    this.fotografiasFormMulti = fotografias;
    
    // ✅ Marcar para detección de cambios
    this.cdRef.markForCheck();
  }

  protected override onFieldChange(fieldName: string, value: any, options?: { refresh?: boolean }): void {
    super.onFieldChange(fieldName, value, { refresh: options?.refresh ?? false });
    this.cdRef.markForCheck();
  }

  // ✅ OVERRIDE CRÍTICO: cargarFotografias() DEBE LEER DEL SIGNAL REACTIVO (sectionDataSignal)
  // NO de imageFacade.loadImages() que lee localStorage desactualizado
  // Esto asegura que los cambios de titulo/fuente se reflejen inmediatamente
  override cargarFotografias(): void {
    const formData = this.sectionDataSignal();  // ✅ LEER DEL SIGNAL REACTIVO
    const prefijo = this.prefijoGrupoSignal();
    const fotos: FotoItem[] = [];
    
    // ✅ Reconstruir array de fotografías leyendo directamente del state reactivo
    for (let i = 1; i <= 10; i++) {
      const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`;
      const imagen = formData[imagenKey];
      
      // Si hay imagen, agregar a array
      if (imagen) {
        const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`;
        const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`;
        const numeroKey = `${this.PHOTO_PREFIX}${i}Numero${prefijo}`;
        
        fotos.push({
          imagen: imagen,
          titulo: formData[tituloKey] || '',
          fuente: formData[fuenteKey] || '',
          numero: formData[numeroKey] || i
        });
      }
    }
    
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    this.fotografiasFormMulti = [...this.fotografiasCache];
    this.cdRef.markForCheck();
  }

  override ngOnDestroy(): void {
    this.guardarTodosLosGrupos();
    super.ngOnDestroy();
  }
  // ✅ MÉTODOS INLINE DE TEXTO (usando TEMPLATES)
  obtenerTextoPoblacionSexo(datos: any, nombreComunidad: string): string {
    const textoPersonalizado = PrefijoHelper.obtenerValorConPrefijo(datos, 'textoPoblacionSexoAISD', this.seccionId);
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado.replace(/{COMUNIDAD}/g, nombreComunidad || '____');
    }
    return SECCION6_TEMPLATES.textoPoblacionSexoDefault.replace(/{COMUNIDAD}/g, nombreComunidad || '____');
  }

  obtenerTextoPoblacionEtario(datos: any, nombreComunidad: string): string {
    const textoPersonalizado = PrefijoHelper.obtenerValorConPrefijo(datos, 'textoPoblacionEtarioAISD', this.seccionId);
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado.replace(/{COMUNIDAD}/g, nombreComunidad || '____');
    }
    return SECCION6_TEMPLATES.textoPoblacionEtarioDefault.replace(/{COMUNIDAD}/g, nombreComunidad || '____');
  }
}


