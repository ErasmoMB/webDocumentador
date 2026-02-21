import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { SECCION19_TEMPLATES, SECCION19_TABLA_AUTORIDADES_CONFIG } from './seccion19.constants';

// ============================================================================
// FUNCIONES TRANSFORMADORAS - Convertir datos del backend al formato de tabla
// ============================================================================

/**
 * Desenvuelve datos demográficos del backend
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
 * Transforma datos de autoridades del backend
 * Mapea campos a: organizacion, cargo, nombre (nombres y apellidos)
 * Si solo hay categoría/casos/porcentaje, transforma a este formato
 */
const transformAutoridadesDesdeDemograficos = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => {
    // Si el item ya tiene organizacion, cargo, nombre, devolverlo como está
    if (item.organizacion || item.cargo || item.nombre) {
      return {
        organizacion: item.organizacion || '',
        cargo: item.cargo || '',
        nombre: item.nombre || item.nombres_apellidos || ''
      };
    }
    
    // Si viene en formato de categoría/casos, mapear a formato de tabla
    // (cuando se carga desde endpoints genéricos como religión)
    return {
      organizacion: item.categoria || item.nombre || '',
      cargo: item.tipo || item.categoria || '',
      nombre: item.casos ? `${item.casos}` : ''
    };
  });
};

@Component({
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule,
        ParagraphEditorComponent
    ],
    selector: 'app-seccion19-form',
    templateUrl: './seccion19-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class Seccion19FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.15';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaOrganizacionSocial';
  override useReactiveSync: boolean = true;

  // ✅ Exportar TEMPLATES y CONFIG para el HTML
  readonly SECCION19_TEMPLATES = SECCION19_TEMPLATES;
  readonly SECCION19_TABLA_AUTORIDADES_CONFIG = SECCION19_TABLA_AUTORIDADES_CONFIG;

  override fotografiasFormMulti: FotoItem[] = [];

  // ✅ HELPER PARA OBTENER PREFIJO
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
  }

  // ✅ OVERRIDE: onFieldChange CON PREFIJO AUTOMÁTICO
  override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
    const prefijo = this.obtenerPrefijo();
    const campoConPrefijo = prefijo ? `${fieldId}${prefijo}` : fieldId;
    super.onFieldChange(campoConPrefijo, value, options);
  }

  // ✅ SIGNALS PUROS
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly grupoAISDSignal: Signal<string> = computed(() => {
    const grupos = this.projectFacade.groupsByType('AISD')();
    return grupos.length > 0 ? grupos[0].nombre : '____';
  });

  readonly comunerosCalificadosSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'comunerosCalificados')() || SECCION19_TEMPLATES.comunerosCalificadosDefault;
  });

  readonly textoOrganizacionSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldId = prefijo ? `textoOrganizacionSocial${prefijo}` : 'textoOrganizacionSocial';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldId)();
    
    if (manual && manual.trim().length > 0) return manual;
    
    const grupoAISD = this.grupoAISDSignal();
    const comunerosCalificados = this.comunerosCalificadosSignal();
    
    return this.generarTextoOrganizacionDefault(grupoAISD, comunerosCalificados);
  });

  readonly autoridadesSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `autoridades${prefijo}` : 'autoridades';
    
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    
    const tabla = fromField ?? fromTable ?? [];
    if (Array.isArray(tabla)) {
      return tabla;
    }
    return [];
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    // Depender de los campos de la sección para que el computed se re-evalúe cuando cambien
    this.projectFacade.selectSectionFields(this.seccionId, null)();
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix);
  });

  // Signal de prefijo de foto para aislamiento AISD
  readonly photoPrefixSignal: Signal<string> = computed(() => {
    return this.PHOTO_PREFIX;
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    const prefijo = this.obtenerPrefijo();
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`)();
      
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ VIEWMODEL: AGRUPA TODOS LOS DATOS
  readonly viewModel: Signal<{
    grupoAISD: string;
    comunerosCalificados: string;
    textoOrganizacion: string;
    autoridades: any[];
    fotos: FotoItem[];
  }> = computed(() => ({
    grupoAISD: this.grupoAISDSignal(),
    comunerosCalificados: this.comunerosCalificadosSignal(),
    textoOrganizacion: this.textoOrganizacionSignal(),
    autoridades: this.autoridadesSignal(),
    fotos: this.fotosCacheSignal(),
  }));

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private formChange: FormChangeService,
    private backendApi: BackendApiService
  ) {
    super(cdRef, injector);

    // ✅ EFFECT 1: Sincronizar this.datos con formDataSignal (solo completar campos faltantes)
    effect(() => {
      const data = this.formDataSignal();
      // No re-asignar this.datos por completo: actualizamos solo campos faltantes o vacíos.
      try {
        Object.keys(data || {}).forEach((key) => {
          const incoming = (data as any)[key];
          const current = (this.datos as any)[key];

          // Si el campo actual es undefined/null => asignar
          if (current === undefined || current === null) {
            (this.datos as any)[key] = Array.isArray(incoming) ? structuredClone(incoming) : (typeof incoming === 'object' && incoming !== null ? { ...incoming } : incoming);
            return;
          }

          // Para strings: NO sobrescribir si el valor local ya tiene contenido (evita borrar mientras se escribe)
          if (typeof incoming === 'string') {
            if (typeof current !== 'string' || (typeof current === 'string' && (current === '' || current === undefined))) {
              (this.datos as any)[key] = incoming;
            }
            return;
          }

          // Para arrays: asignar si local está vacío o no es array
          if (Array.isArray(incoming)) {
            if (!Array.isArray(current) || (Array.isArray(current) && current.length === 0)) {
              (this.datos as any)[key] = structuredClone(incoming);
            }
            return;
          }

          // Para objetos: asignar si local es vacío o no objeto
          if (typeof incoming === 'object' && incoming !== null) {
            if (typeof current !== 'object' || current === null) {
              (this.datos as any)[key] = { ...incoming };
            }
            return;
          }

          // Valores primitivos (number, boolean): asignar si undefined
          // (ya cubierto por el check inicial)
        });
      } catch (e) {
        // En caso de error, no bloquear la UI
      }
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2: Monitorear cambios en fotos
    effect(() => {
      this.photoFieldsHash();
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    // ✅ PRIMERO: Asegurar que las tablas estén completamente vacías
    this.inicializarTablasVacias();
    // ✅ SEGUNDO: Cargar datos del backend
    this.cargarDatosDelBackend();
    
    // ✅ Inicializar campos de título y fuente si no existen
    const tituloAutoridadesField = this.getTituloAutoridadesField();
    if (!this.datos[tituloAutoridadesField]) {
      const titulo = this.obtenerTituloAutoridades();
      this.datos[tituloAutoridadesField] = titulo;
      this.onFieldChange(tituloAutoridadesField, titulo, { refresh: false });
    }
    
    const fuenteAutoridadesField = this.getFuenteAutoridadesField();
    if (!this.datos[fuenteAutoridadesField]) {
      const fuente = this.obtenerFuenteAutoridades();
      this.datos[fuenteAutoridadesField] = fuente;
      this.onFieldChange(fuenteAutoridadesField, fuente, { refresh: false });
    }
    
    this.cargarFotografias();
  }

  /**
   * ✅ Inicializar todas las tablas como arrays vacíos
   * Esto asegura que DynamicTableComponent no muestre datos stale
   */
  private inicializarTablasVacias(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `autoridades${prefijo}` : 'autoridades';

    const current = this.datos[tablaKey];
    const esTabla = Array.isArray(current);
    const tieneColumnasAutoridades = (rows: any[]): boolean => {
      return rows.some(r => {
        if (!r || typeof r !== 'object') return false;
        return 'organizacion' in r || 'cargo' in r || 'nombre' in r;
      });
    };

    // ✅ Normalizar: si no es array, inicializar como vacío
    if (!esTabla) {
      this.datos[tablaKey] = [];
      this.projectFacade.setField(this.seccionId, null, tablaKey, []);
      this.projectFacade.setField(this.seccionId, null, 'autoridades', []);
      return;
    }

    // ✅ Limpieza defensiva: si hay datos con forma incompatible (p.ej. legado/placeholder), vaciar.
    if (current.length > 0 && !tieneColumnasAutoridades(current)) {
      this.datos[tablaKey] = [];
      this.projectFacade.setField(this.seccionId, null, tablaKey, []);
      this.projectFacade.setField(this.seccionId, null, 'autoridades', []);
    }
  }

  /**
   * ✅ Cargar datos del backend siguiendo el patrón de Sección 6/7
   * Carga autoridades desde el backend
   */
  private cargarDatosDelBackend(): void {
    // ✅ Obtener códigos de centros poblados del grupo AISD actual
    const codigosArray = this.getCodigosCentrosPobladosAISD();
    const codigos = [...codigosArray]; // Copia mutable

    if (!codigos || codigos.length === 0) {
      return;
    }

    const prefijo = this.obtenerPrefijoGrupo();

    // ✅ IMPORTANTE
    // Esta sección es principalmente manual. Antes se usaba `postReligionPorCpp(...)` como
    // placeholder para “probar” el llenado; eso provoca que la tabla se llene con datos que
    // NO corresponden (y da la impresión de que “se llena aunque el backend no tenga data”).
    //
    // Si en el futuro existe un endpoint real, úsalo aquí:
    //   (this.backendApi as any).postAutoridadesPorCpp(codigos)
    const backendAny = this.backendApi as any;
    if (typeof backendAny.postAutoridadesPorCpp !== 'function') {
      return;
    }

    backendAny.postAutoridadesPorCpp(codigos).subscribe({
      next: (response: any) => {
        const datosTransformados = transformAutoridadesDesdeDemograficos(
          unwrapDemograficoData(response?.data || [])
        );
        const autoridadesTablaKey = prefijo ? `autoridades${prefijo}` : 'autoridades';
        this.projectFacade.setField(this.seccionId, null, autoridadesTablaKey, datosTransformados);
        this.projectFacade.setField(this.seccionId, null, 'autoridades', datosTransformados);
        this.cdRef.markForCheck();
      },
      error: (err: any) => {
        console.error('[SECCION19] Error cargando autoridades del backend:', err);
      }
    });
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  getFieldIdTextoOrganizacion(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoOrganizacionSocial${prefijo}` : 'textoOrganizacionSocial';
  }

  obtenerTextoOrganizacion(): string {
    const fieldId = this.getFieldIdTextoOrganizacion();
    const textoPersonalizado = (this.datos as any)[fieldId];
    if (textoPersonalizado && textoPersonalizado !== '____' && String(textoPersonalizado).trim() !== '') {
      return textoPersonalizado;
    }
    return this.generarTextoOrganizacionDefault(
      this.datos.grupoAISD || SECCION19_TEMPLATES.grupoAISDDefault,
      this.datos.comunerosCalificados || SECCION19_TEMPLATES.comunerosCalificadosDefault
    );
  }

  private generarTextoOrganizacionDefault(grupoAISD: string, comunerosCalificados: string): string {
    return SECCION19_TEMPLATES.parrafoOrganizacionDefault
      .replace(/____/g, grupoAISD)
      .replace(/____/g, comunerosCalificados);
  }

  // ✅ CRUD: Tabla de autoridades actualizada
  getTablaKeyAutoridades(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `autoridades${prefijo}` : 'autoridades';
  }

  onAutoridadesTableUpdated(tablaData: any[]): void {
    // ✅ LEER DEL SIGNAL REACTIVO
    const formData = this.formDataSignal();
    const tablaKey = this.getTablaKeyAutoridades();
    const tablaActual = tablaData || formData[tablaKey] || [];
    
    // ✅ GUARDAR EN PROJECTSTATEFACADE
    this.projectFacade.setField(this.seccionId, null, tablaKey, tablaActual);
    
    // ✅ PERSISTIR EN REDIS
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaActual }, { notifySync: true });
    } catch (e) { console.error(e); }
    
    this.cdRef.markForCheck();
  }

  // ✅ Métodos para obtener campos de título y fuente (igual que seccion18)
  getTituloAutoridadesField(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `tituloAutoridades${prefijo}` : 'tituloAutoridades';
  }

  getFuenteAutoridadesField(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fuenteAutoridades${prefijo}` : 'fuenteAutoridades';
  }

  obtenerTituloAutoridades(): string {
    const fieldId = this.getTituloAutoridadesField();
    const titulo = (this.datos as any)[fieldId];
    if (titulo && String(titulo).trim() !== '') return titulo;
    const grupoAISD = (this.datos as any).grupoAISD || SECCION19_TEMPLATES.grupoAISDDefault;
    return SECCION19_TEMPLATES.tituloAutoridadesDefault.replace(/____/g, grupoAISD);
  }

  obtenerFuenteAutoridades(): string {
    const fieldId = this.getFuenteAutoridadesField();
    const fuente = (this.datos as any)[fieldId];
    if (fuente && String(fuente).trim() !== '') return fuente;
    return SECCION19_TEMPLATES.fuenteAutoridadesDefault;
  }

  // ✅ Handlers para cambios en título y fuente con persistencia
  onTituloAutoridadesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fieldId = this.getTituloAutoridadesField();
    const valor = input.value;
    this.datos[fieldId] = valor;
    this.onFieldChange('tituloAutoridades', valor, { refresh: false });
    // Forzar actualización en preview y otros componentes
    try {
      const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper');
      ViewChildHelper.updateAllComponents('actualizarDatos');
    } catch {}
    this.cdRef.markForCheck();
  }

  // Flags para evitar que actualizaciones externas sobrescriban edición en curso
  private editingTitulo: boolean = false;
  private editingFuente: boolean = false;

  onTituloAutoridadesInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fieldId = this.getTituloAutoridadesField();
    const valor = input.value;

  }

  onTituloAutoridadesFocus(): void {
    const fieldId = this.getTituloAutoridadesField();
    this.editingTitulo = true;
    this.editingTitulo = true;
  }

  onTituloAutoridadesBlur(): void {
    const fieldId = this.getTituloAutoridadesField();
    this.editingTitulo = false;
    this.editingTitulo = false;
    // Persistir el valor al salir del input
    const valor = this.datos[fieldId];
    this.onFieldChange('tituloAutoridades', valor, { refresh: false });
  }

  onFuenteAutoridadesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fieldId = this.getFuenteAutoridadesField();
    const valor = input.value;
    this.datos[fieldId] = valor;
    this.onFieldChange('fuenteAutoridades', valor, { refresh: false });
    // Forzar actualización en preview y otros componentes
    try {
      const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper');
      ViewChildHelper.updateAllComponents('actualizarDatos');
    } catch {}
    this.cdRef.markForCheck();
  }

  onFuenteAutoridadesInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fieldId = this.getFuenteAutoridadesField();
    const valor = input.value;

  }

  onFuenteAutoridadesFocus(): void {
    const fieldId = this.getFuenteAutoridadesField();
    this.editingFuente = true;
    this.editingFuente = true;
  }

  onFuenteAutoridadesBlur(): void {
    const fieldId = this.getFuenteAutoridadesField();
    this.editingFuente = false;
    // Persistir el valor al salir del input
    const valor = this.datos[fieldId];
    this.onFieldChange(fieldId, valor, { refresh: false });
  }

  // API para SectionReactiveSyncCoordinator: indicar si un campo está en edición activa
  isFieldBeingEdited(fieldName: string): boolean {
    if (!fieldName) return false;
    if (fieldName.includes('tituloAutoridades') && this.editingTitulo) return true;
    if (fieldName.includes('fuenteAutoridades') && this.editingFuente) return true;
    return false;
  }

  // ✅ Fotografías
  override onFotografiasChange(fotografias: FotoItem[]): void {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  protected override cargarFotografias(): void {
    super.cargarFotografias();
    this.fotografiasFormMulti = this.modoFormulario ? this.fotografiasFormMulti : this.fotografiasCache;
  }

  // ✅ TRACKBY
  trackByIndex(index: number): number { return index; }
}
