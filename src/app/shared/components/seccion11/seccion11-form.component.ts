import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { SessionDataService } from 'src/app/core/services/session/session-data.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { 
  SECCION11_WATCHED_FIELDS, 
  SECCION11_PHOTO_PREFIX_TRANSPORTE, 
  SECCION11_PHOTO_PREFIX_TELECOMUNICACIONES,
  SECCION11_TEMPLATES,
  SECCION11_SECTION_ID
} from './seccion11-constants';

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
  selector: 'app-seccion11-form',
  templateUrl: './seccion11-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion11FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION11_SECTION_ID;
  @Input() override modoFormulario: boolean = false;

  // ✅ Hacer TEMPLATES accesible en template
  readonly SECCION11_TEMPLATES = SECCION11_TEMPLATES;

  readonly PHOTO_PREFIX_TRANSPORTE = SECCION11_PHOTO_PREFIX_TRANSPORTE;
  readonly PHOTO_PREFIX_TELECOMUNICACIONES = SECCION11_PHOTO_PREFIX_TELECOMUNICACIONES;
  
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION11_WATCHED_FIELDS;

  fotografiasTransporteFormMulti: FotoItem[] = [];
  fotografiasTelecomunicacionesFormMulti: FotoItem[] = [];

  override readonly PHOTO_PREFIX = '';
  override fotografiasCache: FotoItem[] = [];
  fotografiasTransporteCache: FotoItem[] = [];
  fotografiasTelecomunicacionesCache: FotoItem[] = [];

  // ✅ Inyectar SessionDataService para almacenamiento temporal
  private sessionDataService = this.injector.get(SessionDataService);

  // ✅ CAMPOS EDITABLES CON AUTO-SYNC (createAutoSyncField) - CON PREFIJO DE GRUPO
  readonly parrafoTransporte = this.createAutoSyncField(`parrafoSeccion11_transporte_completo${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly parrafoTelecomunicaciones = this.createAutoSyncField(`parrafoSeccion11_telecomunicaciones_completo${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly costoTransporteMinimo = this.createAutoSyncField(`costoTransporteMinimo${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly costoTransporteMaximo = this.createAutoSyncField(`costoTransporteMaximo${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly tituloTelecomunicaciones = this.createAutoSyncField(`tituloTelecomunicaciones${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly fuenteTelecomunicaciones = this.createAutoSyncField(`fuenteTelecomunicaciones${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');

  // ✅ HELPER PARA OBTENER PREFIJO DE GRUPO
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
  }

  // ✅ SIGNALS PUROS - Datos del store
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly grupoAISDSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'grupoAISD')() || '____';
  });

  // ✅ REFACTOR: Usar ubicacionGlobal
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

  readonly telecomunicacionesTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `telecomunicacionesTabla${prefijo}` : 'telecomunicacionesTabla';
    const tabla = this.projectFacade.selectField(this.seccionId, null, tablaKey)() || [];
    return Array.isArray(tabla) ? tabla : [];
  });

  // ✅ SIGNAL PARA FOTOGRAFÍAS - ÚNICA VERDAD (PATRÓN OBLIGATORIO)
  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const prefijo = this.obtenerPrefijo();
    
    // Fotografías de Transporte
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TRANSPORTE}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TRANSPORTE}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TRANSPORTE}${i}Imagen${prefijo}`)();
      
      if (imagen) {
        fotos.push({
          titulo: titulo || `Fotografía ${i}`,
          fuente: fuente || 'GEADES, 2024',
          imagen: imagen
        } as FotoItem);
      }
    }
    
    // Fotografías de Telecomunicaciones
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TELECOMUNICACIONES}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TELECOMUNICACIONES}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TELECOMUNICACIONES}${i}Imagen${prefijo}`)();
      
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

  // ✅ CONFIGURACIÓN DE TABLA (para tablas de texto puro, sin cálculos)
  get telecomunicacionesConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyTelecomunicaciones(),
      totalKey: '',  // ✅ VACÍO: tabla de texto puro, sin totales
      campoTotal: '',  // ✅ VACÍO: no hay campo de total numérico
      campoPorcentaje: '',  // ✅ VACÍO: no hay cálculos de porcentaje
      estructuraInicial: [
        { medio: '', descripcion: '' }
      ],
      calcularPorcentajes: false  // ✅ NO calcular porcentajes
    };
  }

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private formChange: FormChangeService  // ✅ Para persistencia en Redis
  ) {
    super(cdRef, injector);

    // ✅ EFFECT 1: Auto-sync formDataSignal (Sincronización automática con ProjectState)
    // IMPORTANTE: Hacer merge para no sobrescribir datos locales de tablas
    effect(() => {
      const data = this.formDataSignal();
      if (!data || typeof data !== 'object') return;
      
      // Preservar datos existentes de tablas que pueden haber sido editados localmente
      const tablasPreservar = ['telecomunicacionesTabla', 'telecomunicacionesTabla_A1', 'telecomunicacionesTabla_B1'];
      const tablasExistentes: Record<string, any[]> = {};
      for (const key of tablasPreservar) {
        if (this.datos[key] && Array.isArray(this.datos[key]) && this.datos[key].length > 0) {
          tablasExistentes[key] = this.datos[key];
        }
      }
      
      // Merge: nuevos datos + datos locales preservados
      this.datos = { ...data, ...tablasExistentes };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2: Monitor fotosCacheSignal (Sincronización automática de fotos)
    effect(() => {
      const fotos = this.fotosCacheSignal();
      this.fotografiasTransporteFormMulti = fotos.filter(f => f.imagen);
      this.fotografiasTelecomunicacionesFormMulti = fotos.filter(f => f.imagen);
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  protected getSectionKey(): string {
    return 'seccion11_aisd';
  }

  protected getLoadParameters(): string[] | null {
    return null;
  }

  protected override tieneFotografias(): boolean {
    return false;
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  // ✅ GETTERS PARA TABLA KEYS
  getTablaKeyTelecomunicaciones(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `telecomunicacionesTabla${prefijo}` : 'telecomunicacionesTabla';
  }

  // ✅ MÉTODOS PARA OBTENER DATOS DE TABLA
  getTablaTelecomunicaciones(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'telecomunicacionesTabla', this.seccionId) || this.datos.telecomunicacionesTabla || [];
    return tabla;
  }

  // ✅ MÉTODOS PARA CARGAR FOTOGRAFÍAS
  getFotografiasTransporteVista(): FotoItem[] {
    if (this.fotografiasTransporteCache && this.fotografiasTransporteCache.length > 0) {
      return [...this.fotografiasTransporteCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TRANSPORTE,
      groupPrefix
    );
    this.fotografiasTransporteCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasTransporteCache;
  }

  override getFotografiasVista(): FotoItem[] {
    if (this.fotografiasTelecomunicacionesCache && this.fotografiasTelecomunicacionesCache.length > 0) {
      return [...this.fotografiasTelecomunicacionesCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TELECOMUNICACIONES,
      groupPrefix
    );
    this.fotografiasTelecomunicacionesCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasTelecomunicacionesCache;
  }

  override actualizarFotografiasFormMulti() {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasTransporteFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TRANSPORTE,
      groupPrefix
    );
    this.fotografiasTelecomunicacionesFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TELECOMUNICACIONES,
      groupPrefix
    );
  }

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    
    const fotosTransporte = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TRANSPORTE,
      groupPrefix
    );
    this.fotografiasTransporteCache = fotosTransporte && fotosTransporte.length > 0 ? [...fotosTransporte] : [];
    
    const fotosTelecomunicaciones = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TELECOMUNICACIONES,
      groupPrefix
    );
    this.fotografiasTelecomunicacionesCache = fotosTelecomunicaciones && fotosTelecomunicaciones.length > 0 ? [...fotosTelecomunicaciones] : [];
    
    this.cdRef.markForCheck();
  }

  onFotografiasTransporteChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_TRANSPORTE, fotografias);
    this.fotografiasTransporteFormMulti = [...fotografias];
    this.fotografiasTransporteCache = [...fotografias];
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  onFotografiasTelecomunicacionesChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_TELECOMUNICACIONES, fotografias);
    this.fotografiasTelecomunicacionesFormMulti = [...fotografias];
    this.fotografiasTelecomunicacionesCache = [...fotografias];
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  // ✅ MANEJADOR DE TABLA DE TELECOMUNICACIONES (UNICA_VERDAD)
  onTelecomunicacionesTableUpdated(updatedData?: any[]): void {
    // ✅ LEER DEL SIGNAL REACTIVO
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `telecomunicacionesTabla${prefijo}` : 'telecomunicacionesTabla';
    
    // Obtener datos actuales de la tabla
    let tablaActual: any[] = updatedData || [];
    if (tablaActual.length === 0) {
      const datos = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
      if (Array.isArray(datos)) {
        tablaActual = datos;
      }
    }
    
    // ✅ ACTUALIZAR this.datos LOCAL para que el UI se actualice inmediatamente
    this.datos[tablaKey] = tablaActual;
    
    // ✅ GUARDAR EN PROJECTSTATEFACADE (tanto setField como setTableData)
    this.projectFacade.setField(this.seccionId, null, tablaKey, tablaActual);
    this.projectFacade.setTableData(this.seccionId, null, tablaKey, tablaActual);
    
    // ✅ PERSISTIR EN REDIS (además del SessionDataService existente)
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaActual }, { notifySync: true });
    } catch (e) { console.error(e); }
    
    // Mantener también el guardado en SessionDataService
    void this.sessionDataService.saveData(`seccion-11:${tablaKey}`, tablaActual)
      .catch((error) => { console.warn(error); });
    
    // ✅ ACTUALIZAR EL SIGNAL REACTIVO
    this.telecomunicacionesTablaSignal();
    
    // ✅ FORZAR DETECCIÓN DE CAMBIOS PARA ACTUALIZAR LA VISTA
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
    console.log(`🔵 [SECCION11] onFieldChange LLAMADO - Campo: ${fieldId}`);
    
    // 🔵 [SECCION11] Depuración de guardado de datos
    console.log(`🔵 [SECCION11] onFieldChange - Campo: ${fieldId}, Valor:`, value);

    // ⚠️ NO agregar prefijo aquí - puede que ya lo tenga desde onTelecomunicacionesTableUpdated
    // Solo si NO tiene prefijo, agregarlo
    const prefijo = this.obtenerPrefijo();
    const campoConPrefijo = prefijo && !fieldId.includes(prefijo) ? `${fieldId}${prefijo}` : fieldId;
    
    console.log(`🔵 [SECCION11] Campo original: ${fieldId}, Campo con prefijo: ${campoConPrefijo}`);
    
    // Guardar en SessionDataService (backend) para datos temporales
    void this.sessionDataService.saveData(`seccion-11:${campoConPrefijo}`, value)
      .then(() => {
        console.log(`✅ [SECCION11] Datos guardados en backend: ${campoConPrefijo}`);
      })
      .catch((error) => {
        console.warn(`⚠️ [SECCION11] Error guardando en backend, usando fallback localStorage:`, error);
      });

    // ✅ GUARDAR EN PROJECTSTATEFACADE CON PREFIJO CORRECTO
    this.projectFacade.setField(this.seccionId, null, campoConPrefijo, value);
    
    super.onFieldChange(campoConPrefijo, value, options);
  }
  obtenerTextoSeccion11TransporteCompleto(): string {
    const prefijo = this.obtenerPrefijo();
    const manualKey = `parrafoSeccion11_transporte_completo${prefijo}`;
    const texto = this.datos[manualKey] || this.datos['parrafoSeccion11_transporte_completo'];

    // ✅ TEXTO POR DEFECTO - SINCRONIZADO CON VISTA
    if (!texto || texto.trim() === '') {
      const nombreComunidad = this.obtenerNombreComunidadActual();
      const ubicacion = this.ubicacionGlobal();
      const provincia = ubicacion.provincia || '____';
      const distrito = ubicacion.distrito || '____';
      const costoMin = this.datos['costoTransporteMinimo'] || '____';
      const costoMax = this.datos['costoTransporteMaximo'] || '____';

      return `En la CC ${nombreComunidad}, la infraestructura de transporte es limitada. Dentro de la comunidad solo se encuentran trochas carrozables que permiten llegar al anexo ${nombreComunidad}. Estas vías facilitan el acceso en vehículos, pero son de tierra y no están pavimentadas, lo que dificulta el tránsito en épocas de lluvias o durante el invierno. Los demás puntos poblados dentro de la comunidad también son accesibles mediante trochas carrozables, aunque en condiciones más precarias que las principales que permiten el acceso al anexo o centro administrativo comunal.\n\nPor otro lado, no existen empresas de transporte formalmente establecidas dentro de la comunidad. Sin embargo, existe un servicio de transporte frecuente que es provisto por una combi todos los días lunes. El único destino de esta movilidad es la ciudad de ${provincia}, a la cual parte cerca de las 10:30 am desde la capital distrital de ${distrito}. El costo por este servicio varía entre S/. ${costoMin} y S/. ${costoMax} por trayecto, dependiendo de la demanda y las condiciones del viaje. Es así que esta es la única opción que tienen los comuneros para desplazarse a ciudades más grandes.`;
    }

    return texto;
  }

  obtenerTextoSeccion11TelecomunicacionesCompleto(): string {
    const prefijo = this.obtenerPrefijo();
    const manualKey = `parrafoSeccion11_telecomunicaciones_completo${prefijo}`;
    const texto = this.datos[manualKey] || this.datos['parrafoSeccion11_telecomunicaciones_completo'];

    // ✅ TEXTO POR DEFECTO - SINCRONIZADO CON VISTA
    if (!texto || texto.trim() === '') {
      const nombreComunidad = this.obtenerNombreComunidadActual();

      return `En la CC ${nombreComunidad}, la infraestructura en telecomunicaciones presenta algunas limitaciones, aunque existen servicios disponibles para la población. En cuanto a radiodifusión, no es posible captar señal de emisoras provinciales o nacionales. Respecto a la señal de televisión, la comunidad cuenta con acceso a América TV (canal 4) a través de señal abierta, gracias a una antena de la municipalidad que retransmite este canal, lo que garantiza una opción de entretenimiento y noticias. Adicionalmente, algunas familias tienen contratado el servicio de DIRECTV, el cual brinda acceso a televisión satelital.\n\nEn lo que respecta a la telefonía móvil, la cobertura es restringida y solo las operadoras de Movistar y Entel logran captar señal en la comunidad, lo cual limita las opciones de comunicación para los habitantes. Por otro lado, el acceso a internet depende únicamente de Movistar, ya que los comuneros solo pueden conectarse a través de los datos móviles proporcionados por esta empresa. Además, cabe mencionar que, si bien existe acceso a internet, la calidad y estabilidad de la conexión pueden ser deficientes, especialmente en las zonas más alejadas dentro de la comunidad.`;
    }

    return texto;
  }

  // ✅ MÉTODO PARA TRACKBY EN LOOPS
  trackByIndex(index: number): number {
    return index;
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
  }
}

