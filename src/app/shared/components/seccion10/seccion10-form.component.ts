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

  // ✅ NUEVO: Signal para ubicación global (desde metadata)
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

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
    return `Para la preparación de alimentos, la comunidad utiliza principalmente leña y gas, lo que representa un riesgo para la salud debido a la exposición prolongada al humo y la deforestación de áreas cercanas.`;
  }
}
