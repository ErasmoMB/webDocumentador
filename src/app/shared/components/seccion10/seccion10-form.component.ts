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
import { TableNumberingService } from 'src/app/core/services/numbering/table-numbering.service';
import { 
  SECCION10_WATCHED_FIELDS, 
  SECCION10_PHOTO_PREFIX,
  SECCION10_TEMPLATES,
  SECCION10_CONFIG,
  SECCION10_SECTION_ID
} from './seccion10-constants';

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
    return this.projectFacade.selectField(this.seccionId, null, 'grupoAISD')() || '____';
  }

  // ✅ CAMPOS EDITABLES CON AUTO-SYNC (createAutoSyncField)
  readonly parrafoIntroduccion = this.createAutoSyncField('parrafoSeccion10_servicios_basicos_intro', '');
  readonly textoServiciosAgua = this.createAutoSyncField('textoServiciosAgua', '');
  readonly textoServiciosAguaDetalle = this.createAutoSyncField('textoServiciosAguaDetalle', '');
  readonly textoServiciosDesague = this.createAutoSyncField('textoServiciosDesague', '');
  readonly textoServiciosDesagueDetalle = this.createAutoSyncField('textoServiciosDesagueDetalle', '');
  readonly textoDesechosSolidos1 = this.createAutoSyncField('textoDesechosSolidos1', '');
  readonly textoDesechosSolidos2 = this.createAutoSyncField('textoDesechosSolidos2', '');
  readonly textoDesechosSolidos3 = this.createAutoSyncField('textoDesechosSolidos3', '');
  readonly textoElectricidad1 = this.createAutoSyncField('textoElectricidad1', '');
  readonly textoElectricidad2 = this.createAutoSyncField('textoElectricidad2', '');
  readonly textoEnergiaParaCocinar = this.createAutoSyncField('textoEnergiaParaCocinar', '');
  readonly textoTecnologiaComunicaciones = this.createAutoSyncField('textoTecnologiaComunicaciones', '');
  
  readonly tituloAbastecimientoAgua = this.createAutoSyncField('tituloAbastecimientoAgua', '');
  readonly tituloTiposSaneamiento = this.createAutoSyncField('tituloTiposSaneamiento', '');
  readonly tituloCoberturaElectrica = this.createAutoSyncField('tituloCoberturaElectrica', '');
  readonly tituloEnergiaCocinar = this.createAutoSyncField('tituloEnergiaCocinar', '');
  readonly tituloTecnologiaComunicaciones = this.createAutoSyncField('tituloTecnologiaComunicaciones', '');
  
  readonly fuenteAbastecimientoAgua = this.createAutoSyncField('fuenteAbastecimientoAgua', '');
  readonly fuenteTiposSaneamiento = this.createAutoSyncField('fuenteTiposSaneamiento', '');
  readonly fuenteCoberturaElectrica = this.createAutoSyncField('fuenteCoberturaElectrica', '');
  readonly fuenteEnergiaCocinar = this.createAutoSyncField('fuenteEnergiaCocinar', '');
  readonly fuenteTecnologiaComunicaciones = this.createAutoSyncField('fuenteTecnologiaComunicaciones', '');

  // ✅ SIGNALS PUROS - Datos del store
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private tableNumberingService: TableNumberingService
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
      this.fotografiasSeccion10 = [...this.fotografiasFormMulti];
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

  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    super.onFotografiasChange(fotografias, customPrefix);
    this.fotografiasSeccion10 = fotografias;
    this.cdRef.markForCheck();
  }

  // ✅ MÉTODO PARA TRACKBY EN LOOPS
  trackByIndex(index: number): number {
    return index;
  }

  // ✅ CONFIGURACIONES DE TABLAS
  get abastecimientoAguaConfig(): any {
    return {
      tablaKey: this.getTablaKeyAbastecimientoAgua(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      noInicializarDesdeEstructura: true,
      calcularPorcentajes: true
    };
  }

  get tiposSaneamientoConfig(): any {
    return {
      tablaKey: this.getTablaKeyTiposSaneamiento(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      noInicializarDesdeEstructura: true,
      calcularPorcentajes: true
    };
  }

  get coberturaElectricaConfig(): any {
    return {
      tablaKey: this.getTablaKeyCoberturaElectrica(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      noInicializarDesdeEstructura: true,
      calcularPorcentajes: true
    };
  }

  get energiaCocinarConfig(): any {
    return {
      tablaKey: this.getTablaKeyEnergiaCocinar(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      noInicializarDesdeEstructura: true,
      calcularPorcentajes: true
    };
  }

  get tecnologiaComunicacionesConfig(): any {
    return {
      tablaKey: this.getTablaKeyTecnologiaComunicaciones(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      noInicializarDesdeEstructura: true,
      calcularPorcentajes: true
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

  getTablaKeyEnergiaCocinar(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `energiaCocinarTabla${prefijo}` : 'energiaCocinarTabla';
  }

  getTablaKeyTecnologiaComunicaciones(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `tecnologiaComunicacionesTabla${prefijo}` : 'tecnologiaComunicacionesTabla';
  }

  // ✅ HANDLERS PARA CAMBIOS DE TABLA (delegados automáticamente por signals)
  onAbastecimientoAguaTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyAbastecimientoAgua();
    const datos = updatedData || this.datos[tablaKey] || [];
    // El cambio se sincroniza automáticamente via createAutoSyncField si es necesario
    this.cdRef.markForCheck();
  }

  onTiposSaneamientoTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyTiposSaneamiento();
    const datos = updatedData || this.datos[tablaKey] || [];
    this.cdRef.markForCheck();
  }

  onCoberturaElectricaTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyCoberturaElectrica();
    const datos = updatedData || this.datos[tablaKey] || [];
    this.cdRef.markForCheck();
  }

  onEnergiaCocinarTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyEnergiaCocinar();
    const datos = updatedData || this.datos[tablaKey] || [];
    this.cdRef.markForCheck();
  }

  onTecnologiaComunicacionesTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyTecnologiaComunicaciones();
    const datos = updatedData || this.datos[tablaKey] || [];
    this.cdRef.markForCheck();
  }
}
