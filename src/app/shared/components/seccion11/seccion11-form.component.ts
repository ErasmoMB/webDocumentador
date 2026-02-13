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

  // ✅ CAMPOS EDITABLES CON AUTO-SYNC (createAutoSyncField)
  readonly parrafoTransporte = this.createAutoSyncField('parrafoSeccion11_transporte_completo', '');
  readonly parrafoTelecomunicaciones = this.createAutoSyncField('parrafoSeccion11_telecomunicaciones_completo', '');
  readonly costoTransporteMinimo = this.createAutoSyncField('costoTransporteMinimo', '');
  readonly costoTransporteMaximo = this.createAutoSyncField('costoTransporteMaximo', '');
  readonly tituloTelecomunicaciones = this.createAutoSyncField('tituloTelecomunicaciones', '');
  readonly fuenteTelecomunicaciones = this.createAutoSyncField('fuenteTelecomunicaciones', '');

  // ✅ HELPER PARA OBTENER PREFIJO DE GRUPO
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
  }

  override obtenerNombreComunidadActual(): string {
    return this.projectFacade.selectField(this.seccionId, null, 'grupoAISD')() || '____';
  }

  // ✅ SIGNALS PUROS - Datos del store
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly grupoAISDSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'grupoAISD')() || '';
  });

  // ✅ REFACTOR: Usar ubicacionGlobal
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

  readonly telecomunicacionesTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `telecomunicacionesTabla${prefijo}` : 'telecomunicacionesTabla';
    const tabla = this.projectFacade.selectField(this.seccionId, null, tablaKey)() || [];
    return Array.isArray(tabla) ? tabla : [];
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const tituloTransporte = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TRANSPORTE}${i}Titulo${prefijo}`)();
      const fuenteTransporte = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TRANSPORTE}${i}Fuente${prefijo}`)();
      const imagenTransporte = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TRANSPORTE}${i}Imagen${prefijo}`)();
      
      const tituloTele = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TELECOMUNICACIONES}${i}Titulo${prefijo}`)();
      const fuenteTele = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TELECOMUNICACIONES}${i}Fuente${prefijo}`)();
      const imagenTele = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_TELECOMUNICACIONES}${i}Imagen${prefijo}`)();
      
      hash += `${tituloTransporte || ''}|${fuenteTransporte || ''}|${imagenTransporte ? '1' : '0'}|`;
      hash += `${tituloTele || ''}|${fuenteTele || ''}|${imagenTele ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ CONFIGURACIÓN DE TABLA
  get telecomunicacionesConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyTelecomunicaciones(),
      totalKey: 'medio',
      campoTotal: 'medio',
      campoPorcentaje: 'descripcion',
      estructuraInicial: [
        { medio: '', descripcion: '' }
      ],
      calcularPorcentajes: false
    };
  }

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);

    // ✅ EFFECT 1: Auto-sync formDataSignal (Sincronización automática con ProjectState)
    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2: Monitor photoFieldsHash (Sincronización automática de fotos)
    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.fotografiasTransporteFormMulti = [...this.fotografiasTransporteFormMulti];
      this.fotografiasTelecomunicacionesFormMulti = [...this.fotografiasTelecomunicacionesFormMulti];
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

  // ✅ MANEJADOR DE TABLA DE TELECOMUNICACIONES
  onTelecomunicacionesTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyTelecomunicaciones();
    this.cdRef.markForCheck();
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

