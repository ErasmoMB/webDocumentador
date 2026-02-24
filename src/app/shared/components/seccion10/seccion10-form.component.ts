import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TablePercentageHelper } from '../../utils/table-percentage-helper';
import { 
  SECCION10_WATCHED_FIELDS, 
  SECCION10_PHOTO_PREFIX,
  SECCION10_TEMPLATES,
  SECCION10_CONFIG,
  SECCION10_SECTION_ID
} from './seccion10-constants';

// ============================================================================
// FUNCIONES TRANSFORMADORAS - Convertir datos del backend al formato de tabla
// ============================================================================

/**
 * 🚨 PATRÓN SOLO LECTURA - Desenvuelve datos demográficos del backend
 * Maneja diferentes estructuras de respuesta
 */
const unwrapDemograficoData = (responseData: any): any[] => {
  if (!responseData) return [];
  
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

/**
 * 🚨 PATRÓN SOLO LECTURA - Transforma datos de Abastecimiento de Agua del backend
 * Mapea directamente TODOS los campos sin filtros
 */
const transformAbastecimientoAguaDesdeDemograficos = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => ({
    categoria: item.categoria || item.nombre || item.tipo || '',
    casos: item.casos !== undefined ? item.casos : (item.total || 0),
    porcentaje: item.porcentaje || ''
  }));
};

/**
 * 🚨 PATRÓN SOLO LECTURA - Transforma datos de Saneamiento del backend  
 * Mapea directamente TODOS los campos sin filtros
 */
const transformSaneamientoDesdeDemograficos = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => ({
    categoria: item.categoria || item.nombre || item.tipo || '',
    casos: item.casos !== undefined ? item.casos : (item.total || 0),
    porcentaje: item.porcentaje || ''
  }));
};

/**
 * 🚨 PATRÓN SOLO LECTURA - Transforma datos de Alumbrado Eléctrico del backend
 * Mapea directamente TODOS los campos sin filtros
 */
const transformAlumbradoElectricoDesdeDemograficos = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => ({
    categoria: item.categoria || item.nombre || item.tipo || '',
    casos: item.casos !== undefined ? item.casos : (item.total || 0),
    porcentaje: item.porcentaje || ''
  }));
};

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CoreSharedModule,
    ImageUploadComponent,
    DynamicTableComponent,
    ParagraphEditorComponent
  ],
  selector: 'app-seccion10-form',
  templateUrl: './seccion10-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion10FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION10_SECTION_ID;
  @Input() override modoFormulario: boolean = false;

  // ✅ Hacer TEMPLATES accesible en template
  readonly SECCION10_TEMPLATES = SECCION10_TEMPLATES;

  override readonly PHOTO_PREFIX = SECCION10_PHOTO_PREFIX;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION10_WATCHED_FIELDS;

  fotografiasSeccion10: FotoItem[] = [];

  // ✅ HELPER PARA OBTENER PREFIJO DE GRUPO
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
  }

  override obtenerNombreComunidadActual(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // ✅ Usar aisdGroups() signal para obtener el nombre del grupo actual
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
    
    // Fallback: buscar en datos guardados
    const grupoAISD = this.projectFacade.selectField(this.seccionId, null, 'grupoAISD')();
    if (grupoAISD && grupoAISD.trim() !== '') {
      return grupoAISD;
    }
    
    const grupoConSufijo = prefijo ? this.projectFacade.selectField(this.seccionId, null, `grupoAISD${prefijo}`)() : null;
    if (grupoConSufijo && grupoConSufijo.trim() !== '') {
      return grupoConSufijo;
    }
    
    return '____';
  }

  // ✅ CAMPOS EDITABLES CON AUTO-SYNC (createAutoSyncField) - CON PREFIJO DE GRUPO
  readonly parrafoIntroduccion = this.createAutoSyncField(`parrafoSeccion10_servicios_basicos_intro${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoServiciosAgua = this.createAutoSyncField(`textoServiciosAgua${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoServiciosAguaDetalle = this.createAutoSyncField(`textoServiciosAguaDetalle${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoServiciosDesague = this.createAutoSyncField(`textoServiciosDesague${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoServiciosDesagueDetalle = this.createAutoSyncField(`textoServiciosDesagueDetalle${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoDesechosSolidos1 = this.createAutoSyncField(`textoDesechosSolidos1${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoDesechosSolidos2 = this.createAutoSyncField(`textoDesechosSolidos2${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoDesechosSolidos3 = this.createAutoSyncField(`textoDesechosSolidos3${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoElectricidad1 = this.createAutoSyncField(`textoElectricidad1${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoElectricidad2 = this.createAutoSyncField(`textoElectricidad2${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoEnergiaParaCocinar = this.createAutoSyncField(`textoEnergiaParaCocinar${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoTecnologiaComunicaciones = this.createAutoSyncField(`textoTecnologiaComunicaciones${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  
  readonly tituloAbastecimientoAgua = this.createAutoSyncField(`tituloAbastecimientoAgua${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly tituloTiposSaneamiento = this.createAutoSyncField(`tituloTiposSaneamiento${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly tituloCoberturaElectrica = this.createAutoSyncField(`tituloCoberturaElectrica${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly tituloEnergiaCocinar = this.createAutoSyncField(`tituloEnergiaCocinar${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly tituloTecnologiaComunicaciones = this.createAutoSyncField(`tituloTecnologiaComunicaciones${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  
  readonly fuenteAbastecimientoAgua = this.createAutoSyncField(`fuenteAbastecimientoAgua${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly fuenteTiposSaneamiento = this.createAutoSyncField(`fuenteTiposSaneamiento${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly fuenteCoberturaElectrica = this.createAutoSyncField(`fuenteCoberturaElectrica${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly fuenteEnergiaCocinar = this.createAutoSyncField(`fuenteEnergiaCocinar${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly fuenteTecnologiaComunicaciones = this.createAutoSyncField(`fuenteTecnologiaComunicaciones${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');

  // ✅ SIGNALS PUROS - Datos del store
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  // ✅ PATRÓN UNICA_VERDAD: fotosCacheSignal Signal para monitorear cambios de imágenes
  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`)();
      
      if (imagen) {
        fotos.push({
          titulo: titulo || `Fotografía ${i}`,
          fuente: fuente || 'GEADES, 2024',
          imagen: imagen
        } as FotoItem);
      }
    }
    return fotos;
  });

  // ✅ NUMERACIÓN GLOBAL - Tablas (cinco tablas: agua, saneamiento, electrica, energia, comunicaciones)
  readonly globalTableNumberSignalAgua: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  });
  
  readonly globalTableNumberSignalSaneamiento: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
  });
  
  readonly globalTableNumberSignalElectrica: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 2);
  });
  
  readonly globalTableNumberSignalEnergia: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 3);
  });
  
  readonly globalTableNumberSignalComunicaciones: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 4);
  });

  // ✅ NUEVO: Signal para ubicación global (desde metadata)
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private globalNumbering: GlobalNumberingService,
    private backendApi: BackendApiService,
    private formChange: FormChangeService,  // ✅ Para persistencia en Redis
    private tableFacade: TableManagementFacade  // ✅ Para cálculo de totales y porcentajes
  ) {
    super(cdRef, injector);

    // ✅ EFFECT 1: Auto-sync formDataSignal (Sincronización automática con ProjectState)
    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2: Monitor fotosCacheSignal (Sincronización automática de fotos)
    effect(() => {
      this.fotosCacheSignal();
      this.cargarFotografias();
      this.fotografiasSeccion10 = [...this.fotografiasFormMulti];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    // ✅ TABLAS MANUALES - NO cargar del backend (3.15, 3.16, 3.17)
    // ✅ TABLA 3.18 - SÍ CARGAR DEL BACKEND (Energía para cocinar)
    const prefijo = this.obtenerPrefijoGrupo();
    const formData = this.formDataSignal();
    
    // Verificar tablas
    const aguaKey = prefijo ? `abastecimientoAguaTabla${prefijo}` : 'abastecimientoAguaTabla';
    const existingAguaData = formData[aguaKey];
    
    // ✅ NUEVA LÓGICA: Solo inicializar/cargar si NO hay datos en NINGUNA tabla
    const tieneDatosPersistidos = existingAguaData && Array.isArray(existingAguaData) && existingAguaData.length > 0;
    
    if (!tieneDatosPersistidos) {
      console.log('[SECCION10] No hay datos persistidos, inicializando tablas vacías y cargando del backend...');
      this.inicializarTablasVacias();
      
      // 🔧 SÍ CARGAR ENERGÍA PARA COCINAR DEL BACKEND (tabla 3.18)
      this.cargarDatosDelBackend();
    } else {
      console.log('[SECCION10] Datos persistidos encontrados, no se carga del backend');
    }
    
    this.cargarFotografias();
  }


  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  // ============================================================================
  // 😨 PATRÓN SOLO LECTURA - CARGA DE DATOS DEL BACKEND
  // ============================================================================

  /**
   * 😨 PATRÓN SOLO LECTURA - Inicializar tablas vacías
   * Se ejecuta ANTES de cargar datos del backend
   */
  private inicializarTablasVacias(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // Inicializar cada tabla como array vacío
    this.projectFacade.setField(this.seccionId, null, `abastecimientoAguaTabla${prefijo}`, []);
    
    this.projectFacade.setField(this.seccionId, null, `tiposSaneamientoTabla${prefijo}`, []);
    
    this.projectFacade.setField(this.seccionId, null, `alumbradoElectricoTabla${prefijo}`, []);
    
    // Tecnología de comunicaciones - solo inicializar vacía (sin endpoint disponible)
    this.projectFacade.setField(this.seccionId, null, `tecnologiaComunicacionesTabla${prefijo}`, []);
  }

  /**
   * 😨 PATRÓN SOLO LECTURA - Carga datos del backend
   * ✅ MODIFICADO: Carga SOLO tabla 3.18 (Energía para cocinar)
   * Las otras tablas (3.15, 3.16, 3.17) quedan vacías para entrada manual
   */
  private cargarDatosDelBackend(): void {
    // 1. Obtener los códigos de centros poblados del grupo actual
    const codigosArray = this.getCodigosCentrosPobladosAISD();
    const codigos = [...codigosArray]; // Copia mutable

    if (!codigos || codigos.length === 0) {
      console.log('[SECCION10] ⚠️ No hay centros poblados en el grupo actual');
      return;
    }

    console.log('[SECCION10] 🔍 Cargando tabla 3.18 (Energía para cocinar) del backend');
    const prefijo = this.obtenerPrefijoGrupo();

    // ❌ TABLAS MANUALES - NO CARGAR (comentadas)
    // - 3.15 Abastecimiento de Agua
    // - 3.16 Tipos de Saneamiento
    // - 3.17 Alumbrado Eléctrico
    // - 3.18 Energía para Cocinar (ELIMINADA)
    // Se inicializan vacías en inicializarTablasVacias() para entrada manual

    // NOTA: Tecnología de comunicaciones - no hay endpoint disponible
    // La tabla queda vacía para entrada manual si es necesario
  }

  // ============================================================================
  // 😨 PATRÓN SOLO LECTURA - SIGNALS PARA DATOS DEL BACKEND
  // ============================================================================

  readonly abastecimientoAguaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const data = this.formDataSignal();
    const tablaKey = `abastecimientoAguaTabla${prefijo}`;
    return data[tablaKey] || [];
  });

  readonly tiposSaneamientoSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const data = this.formDataSignal();
    const tablaKey = `tiposSaneamientoTabla${prefijo}`;
    return data[tablaKey] || [];
  });

  readonly alumbradoElectricoSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const data = this.formDataSignal();
    const tablaKey = `alumbradoElectricoTabla${prefijo}`;
    return data[tablaKey] || [];
  });

  readonly tecnologiaComunicacionesSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const data = this.formDataSignal();
    const tablaKey = `tecnologiaComunicacionesTabla${prefijo}`;
    return data[tablaKey] || [];
  });

  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    super.onFotografiasChange(fotografias, customPrefix);
    this.fotografiasSeccion10 = fotografias;
    this.cdRef.markForCheck();
  }

  // ✅ MÉTODO PARA TRACKBY EN LOOPS
  trackByIndex(index: number): number {
    return index;
  }

  // ✅ CONFIGURACIONES DE TABLAS - PATRÓN UNICA_VERDAD CON CÁLCULO
  get abastecimientoAguaConfig(): any {
    return {
      tablaKey: this.getTablaKeyAbastecimientoAgua(),
      totalKey: '',                      // 🔧 MANUAL - Sin fila de Total
      campoTotal: '',                    // 🔧 MANUAL - Sin cálculo de total
      campoPorcentaje: 'porcentaje',    // ✅ Porcentaje se calcula manualmente
      calcularPorcentajes: true,         // ✅ Habilitar cálculo automático
      camposParaCalcular: ['casos'],
      noInicializarDesdeEstructura: true,
      permiteAgregarFilas: true,
      permiteEliminarFilas: true
    };
  }

  get tiposSaneamientoConfig(): any {
    return {
      tablaKey: this.getTablaKeyTiposSaneamiento(),
      totalKey: '',                      // 🔧 MANUAL - Sin fila de Total
      campoTotal: '',                    // 🔧 MANUAL - Sin cálculo de total
      campoPorcentaje: 'porcentaje',    // ✅ Porcentaje se calcula manualmente
      calcularPorcentajes: true,         // ✅ Habilitar cálculo automático
      camposParaCalcular: ['casos'],
      noInicializarDesdeEstructura: true,
      permiteAgregarFilas: true,
      permiteEliminarFilas: true
    };
  }

  get coberturaElectricaConfig(): any {
    return {
      tablaKey: this.getTablaKeyCoberturaElectrica(),
      totalKey: '',                      // 🔧 MANUAL - Sin fila de Total
      campoTotal: '',                    // 🔧 MANUAL - Sin cálculo de total
      campoPorcentaje: 'porcentaje',    // ✅ Porcentaje se calcula manualmente
      calcularPorcentajes: true,         // ✅ Habilitar cálculo automático
      camposParaCalcular: ['casos'],
      noInicializarDesdeEstructura: true,
      permiteAgregarFilas: true,
      permiteEliminarFilas: true
    };
  }

  get tecnologiaComunicacionesConfig(): any {
    return {
      tablaKey: this.getTablaKeyTecnologiaComunicaciones(),
      totalKey: '',                    // ✅ Sin fila de total
      campoTotal: '',                  // ✅ Sin cálculo total
      campoPorcentaje: '',             // ✅ Sin cálculo porcentaje
      calcularPorcentajes: false,      // ✅ No calcular automáticamente
      camposParaCalcular: ['casos'],   // Los campos que ya vienen calculados
      noInicializarDesdeEstructura: true,  // ✅ No inicializar vacía
      permiteAgregarFilas: true,
      permiteEliminarFilas: true
    };
  }

  // ✅ GETTERS PARA TABLA KEYS
  getTablaKeyAbastecimientoAgua(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `abastecimientoAguaTabla${prefijo}` : 'abastecimientoAguaTabla';
  }

  getTablaKeyTiposSaneamiento(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `tiposSaneamientoTabla${prefijo}` : 'tiposSaneamientoTabla';
  }

  getTablaKeyCoberturaElectrica(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `alumbradoElectricoTabla${prefijo}` : 'alumbradoElectricoTabla';
  }

  getTablaKeyTecnologiaComunicaciones(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `tecnologiaComunicacionesTabla${prefijo}` : 'tecnologiaComunicacionesTabla';
  }

  // ✅ HANDLERS PARA CAMBIOS DE TABLA (UNICA_VERDAD con cálculo y persistencia)
  onAbastecimientoAguaTableUpdated(updatedData?: any[]): void {
    // 🔧 MANUAL TABLE - Calcular porcentajes sin endpoint
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `abastecimientoAguaTabla${prefijo}` : 'abastecimientoAguaTabla';
    const tablaKeyBase = 'abastecimientoAguaTabla';
    
    // Obtener datos actuales o usar los proporcionados
    let tablaActual = updatedData || formData[tablaKey] || [];
    
    // ✅ CALCULAR PORCENTAJES Y TOTAL (Patrón Única Verdad)
    if (tablaActual.length > 0) {
      const tablaClon = JSON.parse(JSON.stringify(tablaActual));
      tablaActual = TablePercentageHelper.calcularPorcentajesSimple(tablaClon, tablaKey) || tablaActual;
    }
    
    console.log(`[SECCION10] 💾 Guardando AbastecimientoAgua:`, tablaActual);
    
    // ✅ GUARDAR EN PROJECTSTATEFACADE (con y sin prefijo)
    this.projectFacade.setField(this.seccionId, null, tablaKey, tablaActual);
    this.projectFacade.setField(this.seccionId, null, tablaKeyBase, tablaActual);
    
    // ✅ PERSISTIR EN REDIS (con y sin prefijo)
    try {
      this.formChange.persistFields(this.seccionId, 'table', 
        { [tablaKey]: tablaActual, [tablaKeyBase]: tablaActual }, 
        { notifySync: true });
    } catch (e) { 
      console.error('[SECCION10] Error persistiendo AbastecimientoAgua:', e); 
    }
    this.cdRef.markForCheck();
  }

  onTiposSaneamientoTableUpdated(updatedData?: any[]): void {
    // 🔧 MANUAL TABLE - Calcular porcentajes sin endpoint
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `tiposSaneamientoTabla${prefijo}` : 'tiposSaneamientoTabla';
    const tablaKeyBase = 'tiposSaneamientoTabla';
    
    // Obtener datos actuales o usar los proporcionados
    let tablaActual = updatedData || formData[tablaKey] || [];
    
    // ✅ CALCULAR PORCENTAJES Y TOTAL (Patrón Única Verdad)
    if (tablaActual.length > 0) {
      const tablaClon = JSON.parse(JSON.stringify(tablaActual));
      tablaActual = TablePercentageHelper.calcularPorcentajesSimple(tablaClon, tablaKey) || tablaActual;
    }
    
    console.log(`[SECCION10] 💾 Guardando TiposSaneamiento:`, tablaActual);
    
    // ✅ GUARDAR EN PROJECTSTATEFACADE (con y sin prefijo)
    this.projectFacade.setField(this.seccionId, null, tablaKey, tablaActual);
    this.projectFacade.setField(this.seccionId, null, tablaKeyBase, tablaActual);
    
    // ✅ PERSISTIR EN REDIS (con y sin prefijo)
    try {
      this.formChange.persistFields(this.seccionId, 'table', 
        { [tablaKey]: tablaActual, [tablaKeyBase]: tablaActual }, 
        { notifySync: true });
    } catch (e) { 
      console.error('[SECCION10] Error persistiendo TiposSaneamiento:', e); 
    }
    this.cdRef.markForCheck();
  }

  onCoberturaElectricaTableUpdated(updatedData?: any[]): void {
    // 🔧 MANUAL TABLE - Calcular porcentajes sin endpoint
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `alumbradoElectricoTabla${prefijo}` : 'alumbradoElectricoTabla';
    const tablaKeyBase = 'alumbradoElectricoTabla';
    
    // Obtener datos actuales o usar los proporcionados
    let tablaActual = updatedData || formData[tablaKey] || [];
    
    // ✅ CALCULAR PORCENTAJES Y TOTAL (Patrón Única Verdad)
    if (tablaActual.length > 0) {
      const tablaClon = JSON.parse(JSON.stringify(tablaActual));
      tablaActual = TablePercentageHelper.calcularPorcentajesSimple(tablaClon, tablaKey) || tablaActual;
    }
    
    console.log(`[SECCION10] 💾 Guardando AlumbradoElectrico:`, tablaActual);
    
    // ✅ GUARDAR EN PROJECTSTATEFACADE (con y sin prefijo)
    this.projectFacade.setField(this.seccionId, null, tablaKey, tablaActual);
    this.projectFacade.setField(this.seccionId, null, tablaKeyBase, tablaActual);
    
    // ✅ PERSISTIR EN REDIS (con y sin prefijo)
    try {
      this.formChange.persistFields(this.seccionId, 'table', 
        { [tablaKey]: tablaActual, [tablaKeyBase]: tablaActual }, 
        { notifySync: true });
    } catch (e) { 
      console.error('[SECCION10] Error persistiendo AlumbradoElectrico:', e); 
    }
    this.cdRef.markForCheck();
  }

  onTecnologiaComunicacionesTableUpdated(updatedData?: any[]): void {
    const formData = this.formDataSignal();
    const tablaKey = this.getTablaKeyTecnologiaComunicaciones();
    const tablaActual = updatedData || formData[tablaKey] || [];
    
    this.projectFacade.setField(this.seccionId, null, tablaKey, tablaActual);
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaActual }, { notifySync: true });
    } catch (e) { console.error(e); }
    this.cdRef.markForCheck();
  }

  // ✅ MÉTODOS PARA MOSTRAR TEXTOS POR DEFECTO EN EL FORMULARIO (PATRÓN: FORMULARIO-VISTA SINCRONIZADO)
  
  obtenerTextoSeccion10ServiciosBasicosIntro(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['parrafoSeccion10_servicios_basicos_intro' + prefijo];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoServiciosBasicosIntro();
  }

  obtenerTextoServiciosAgua(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoServiciosAgua' + prefijo];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoServiciosAgua();
  }

  obtenerTextoServiciosAguaDetalle(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoServiciosAguaDetalle' + prefijo];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoServiciosAguaDetalle();
  }

  obtenerTextoServiciosDesague(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoServiciosDesague' + prefijo];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoServiciosDesague();
  }

  obtenerTextoServiciosDesagueDetalle(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoServiciosDesagueDetalle' + prefijo];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoServiciosDesagueDetalle();
  }

  obtenerTextoDesechosSolidos(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoDesechosSolidos1' + prefijo];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoDesechosSolidos();
  }

  obtenerTextoDesechosSolidosDetalle(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoDesechosSolidos2' + prefijo];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoDesechosSolidosDetalle();
  }

  obtenerTextoElectricidad(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoElectricidad1' + prefijo];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoElectricidad();
  }

  obtenerTextoElectricidadDetalle(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoElectricidad2' + prefijo];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoElectricidadDetalle();
  }

  obtenerTextoEnergiaCocinar(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoEnergiaParaCocinar' + prefijo];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoEnergiaCocinar();
  }

  // ✅ GENERADORES DE TEXTO (PRIVADOS)
  
  private generarTextoServiciosBasicosIntro(): string {
    return `En términos generales, la delimitación del ámbito de estudio de las áreas de influencia social se hace tomando en consideración a los agentes e instancias sociales, individuales y/o colectivas, públicas y/o privadas, que tengan derechos o propiedad sobre el espacio o los recursos respecto de los cuales el proyecto de exploración minera tiene incidencia.

Asimismo, el área de influencia social de un proyecto tiene en consideración a los grupos de interés que puedan ser potencialmente afectadas por el desarrollo de dicho proyecto (según La Guía de Relaciones Comunitarias de la DGAAM del MINEM, se denomina "grupos de interés" a aquellos grupos humanos que son impactados por dicho proyecto).

El criterio social para la delimitación de un área de influencia debe tener en cuenta la influencia que el Proyecto pudiera tener sobre el entorno social, que será o no ambientalmente impactado, considerando también la posibilidad de generar otro tipo de impactos, expectativas, intereses y/o demandas del entorno social.

En base a estos criterios se han identificado las áreas de influencia social directa e indirecta:`;
  }

  private generarTextoServiciosAgua(): string {
    const comunidad = this.obtenerNombreComunidadActual();
    return `Según la plataforma REDINFORMA del MIDIS, en los poblados que conforman la CC ${comunidad} se hallaron viviendas que presentan diferentes tipos de abastecimiento de agua. El ____% de las viviendas cuenta con abastecimiento de agua a través de red pública dentro de la vivienda, mientras que el ____% no cuenta con acceso a red pública de agua.`;
  }

  private generarTextoServiciosAguaDetalle(): string {
    return `En la comunidad se han identificado diferentes medios para el abastecimiento de agua, considerando que en muchos casos el acceso al agua potable es limitado y requiere de soluciones innovadoras para satisfacer las necesidades básicas de la población.`;
  }

  private generarTextoServiciosDesague(): string {
    const comunidad = this.obtenerNombreComunidadActual();
    return `En cuanto a los servicios de desagüe, según la plataforma REDINFORMA del MIDIS, en los poblados que conforman la CC ${comunidad} se hallaron viviendas que presentan diferentes tipos de saneamiento. El ____% de las viviendas cuenta con desagüe a través de red pública de desagüe, mientras que el ____% no cuenta con alcantarillado.`;
  }

  private generarTextoServiciosDesagueDetalle(): string {
    return `Cabe mencionar que la falta de servicios de desagüe adecuados en la comunidad genera desafíos significativos para la salud pública y el ambiente, siendo necesarias intervenciones para mejorar las condiciones sanitarias y la calidad de vida de la población.`;
  }

  private generarTextoElectricidad(): string {
    const comunidad = this.obtenerNombreComunidadActual();
    return `Respecto a los servicios de electricidad, según la plataforma REDINFORMA del MIDIS, en los poblados que conforman la CC ${comunidad} se hallaron viviendas que presentan diferentes situaciones en cuanto al alumbrado eléctrico. El ____% de las viviendas cuenta con alumbrado eléctrico.`;
  }

  private generarTextoElectricidadDetalle(): string {
    return `Cabe mencionar que, para poder describir el aspecto de estructura de las viviendas de esta comunidad, así como la sección de los servicios básicos, se toma como conjunto total a las viviendas ocupadas.`;
  }

  private generarTextoDesechosSolidos(): string {
    return `En relación a la gestión de residuos sólidos, se observa que en la comunidad se realiza la disposición de residuos sólidos de manera inadecuada, lo que genera impactos ambientales negativos en el entorno.`;
  }

  private generarTextoDesechosSolidosDetalle(): string {
    return `La falta de un sistema adecuado de recolección y disposición final de residuos sólidos contribuye a la contaminación del suelo, agua y aire, afectando la salud de la población y el ecosistema local.`;
  }

  private generarTextoEnergiaCocinar(): string {
    return `En la CC Ayroca, el principal combustible utilizado para cocinar es la leña. Este recurso es ampliamente aprovechado por las familias, quienes lo obtienen y almacenan para su uso diario en la preparación de alimentos. La disponibilidad constante de leña hace que sea el combustible preferido debido a su bajo costo y fácil acceso, lo que contribuye a su uso extendido en los hogares de la comunidad. La costumbre de emplear leña también está vinculada a prácticas ancestrales, en las que se ha recurrido a los recursos locales para la subsistencia.
De manera complementaria, las familias también adquieren balones de gas (GLP) para cocinar, especialmente en situaciones puntuales o cuando tienen la posibilidad económica de acceder a este recurso. Sin embargo, el uso del gas sigue siendo limitado, puesto que su disponibilidad no está presente permanentemente, lo que hace que la mayoría de la población continúe dependiendo de los recursos naturales más accesibles, como la leña.
`;
  }
}
