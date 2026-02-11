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
import { TableNumberingService } from 'src/app/core/services/table-numbering.service';

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
  @Input() override seccionId: string = '3.1.4.A.1.6';
  @Input() override modoFormulario: boolean = false;

  override readonly PHOTO_PREFIX = 'fotografiaSeccion10';
  override useReactiveSync: boolean = true;

  fotografiasSeccion10: FotoItem[] = [];

  // ✅ SIGNALS PUROS
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly parrafoServiciosBasicosIntroSignal: Signal<string> = computed(() => {
    const data = this.formDataSignal();
    return data['parrafoSeccion10_servicios_basicos_intro'] || '';
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

  override obtenerNombreComunidadActual(): string {
    return this.projectFacade.selectField(this.seccionId, null, 'grupoAISD')() || '____';
  }

  obtenerTextoSeccion10ServiciosBasicosIntro(): string {
    const manual = this.datos['parrafoSeccion10_servicios_basicos_intro'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoServiciosBasicosIntro();
  }

  private generarTextoServiciosBasicosIntro(): string {
    return `En términos generales, la delimitación del ámbito de estudio de las áreas de influencia social se hace tomando en consideración a los agentes e instancias sociales, individuales y/o colectivas, públicas y/o privadas, que tengan derechos o propiedad sobre el espacio o los recursos respecto de los cuales el proyecto de exploración minera tiene incidencia.

Asimismo, el área de influencia social de un proyecto tiene en consideración a los grupos de interés que puedan ser potencialmente afectadas por el desarrollo de dicho proyecto (según La Guía de Relaciones Comunitarias de la DGAAM del MINEM, se denomina "grupos de interés" a aquellos grupos humanos que son impactados por dicho proyecto).

El criterio social para la delimitación de un área de influencia debe tener en cuenta la influencia que el Proyecto pudiera tener sobre el entorno social, que será o no ambientalmente impactado, considerando también la posibilidad de generar otro tipo de impactos, expectativas, intereses y/o demandas del entorno social.

En base a estos criterios se han identificado las áreas de influencia social directa e indirecta:`;
  }

  obtenerNumeroCuadroAbastecimientoAgua(): string {
    return this.tableNumberingService.getGlobalTableNumber(this.seccionId, 0);
  }

  obtenerNumeroCuadroTiposSaneamiento(): string {
    return this.tableNumberingService.getGlobalTableNumber(this.seccionId, 1);
  }

  obtenerNumeroCuadroCoberturaElectrica(): string {
    return this.tableNumberingService.getGlobalTableNumber(this.seccionId, 2);
  }

  obtenerNumeroCuadroEnergiaCocinar(): string {
    return this.tableNumberingService.getGlobalTableNumber(this.seccionId, 3);
  }

  obtenerNumeroCuadroTecnologiaComunicaciones(): string {
    return this.tableNumberingService.getGlobalTableNumber(this.seccionId, 4);
  }

  obtenerTituloAbastecimientoAgua(): string {
    const tituloKey = 'tituloAbastecimientoAgua';
    const titulo = this.datos[tituloKey];
    if (titulo && titulo.trim().length > 0) return titulo;
    const comunidad = this.obtenerNombreComunidadActual();
    return `Tipos de abastecimiento de agua en las viviendas – CC ${comunidad} (2017)`;
  }

  obtenerTituloTiposSaneamiento(): string {
    const tituloKey = 'tituloTiposSaneamiento';
    const titulo = this.datos[tituloKey];
    if (titulo && titulo.trim().length > 0) return titulo;
    const comunidad = this.obtenerNombreComunidadActual();
    return `Tipos de saneamiento en las viviendas – CC ${comunidad} (2017)`;
  }

  obtenerTituloCoberturaElectrica(): string {
    const tituloKey = 'tituloCoberturaElectrica';
    const titulo = this.datos[tituloKey];
    if (titulo && titulo.trim().length > 0) return titulo;
    const comunidad = this.obtenerNombreComunidadActual();
    return `Cobertura de alumbrado eléctrico en las viviendas – CC ${comunidad} (2017)`;
  }

  obtenerFuenteAbastecimientoAgua(): string {
    const fuenteKey = 'fuenteAbastecimientoAgua';
    const fuente = this.datos[fuenteKey];
    if (fuente && fuente.trim().length > 0) return fuente;
    return 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)';
  }

  obtenerFuenteTiposSaneamiento(): string {
    const fuenteKey = 'fuenteTiposSaneamiento';
    const fuente = this.datos[fuenteKey];
    if (fuente && fuente.trim().length > 0) return fuente;
    return 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)';
  }

  obtenerFuenteCoberturaElectrica(): string {
    const fuenteKey = 'fuenteCoberturaElectrica';
    const fuente = this.datos[fuenteKey];
    if (fuente && fuente.trim().length > 0) return fuente;
    return 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)';
  }

  onTituloAbastecimientoAguaChange(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.onFieldChange('tituloAbastecimientoAgua', valor, { refresh: false });
    this.cdRef.markForCheck();
  }

  onTituloTiposSaneamientoChange(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.onFieldChange('tituloTiposSaneamiento', valor, { refresh: false });
    this.cdRef.markForCheck();
  }

  onTituloCoberturaElectricaChange(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.onFieldChange('tituloCoberturaElectrica', valor, { refresh: false });
    this.cdRef.markForCheck();
  }

  onFuenteAbastecimientoAguaChange(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.onFieldChange('fuenteAbastecimientoAgua', valor, { refresh: false });
    this.cdRef.markForCheck();
  }

  onFuenteTiposSaneamientoChange(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.onFieldChange('fuenteTiposSaneamiento', valor, { refresh: false });
    this.cdRef.markForCheck();
  }

  onFuenteCoberturaElectricaChange(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.onFieldChange('fuenteCoberturaElectrica', valor, { refresh: false });
    this.cdRef.markForCheck();
  }

  // ✅ TABLA 1: Abastecimiento de Agua
  get abastecimientoAguaConfig(): any {
    return {
      tablaKey: this.getTablaKeyAbastecimientoAgua(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      noInicializarDesdeEstructura: true,  // ✅ Sin estructura inicial - el backend llenará datos
      calcularPorcentajes: true
    };
  }

  // ✅ TABLA 2: Tipos de Saneamiento
  get tiposSaneamientoConfig(): any {
    return {
      tablaKey: this.getTablaKeyTiposSaneamiento(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      noInicializarDesdeEstructura: true,  // ✅ Sin estructura inicial - el backend llenará datos
      calcularPorcentajes: true
    };
  }

  // ✅ TABLA 3: Cobertura Eléctrica
  get coberturaElectricaConfig(): any {
    return {
      tablaKey: this.getTablaKeyCoberturaElectrica(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      noInicializarDesdeEstructura: true,  // ✅ Sin estructura inicial - el backend llenará datos
      calcularPorcentajes: true
    };
  }

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

  onAbastecimientoAguaTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyAbastecimientoAgua();
    const datos = updatedData || this.datos[tablaKey] || [];
    this.onFieldChange(tablaKey, datos, { refresh: true });
    this.cdRef.markForCheck();
  }

  onTiposSaneamientoTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyTiposSaneamiento();
    const datos = updatedData || this.datos[tablaKey] || [];
    this.onFieldChange(tablaKey, datos, { refresh: true });
    this.cdRef.markForCheck();
  }

  onCoberturaElectricaTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyCoberturaElectrica();
    const datos = updatedData || this.datos[tablaKey] || [];
    this.onFieldChange(tablaKey, datos, { refresh: true });
    this.cdRef.markForCheck();
  }

  // ✅ TABLA 4: Energía para Cocinar
  get energiaCocinarConfig(): any {
    return {
      tablaKey: this.getTablaKeyEnergiaCocinar(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      noInicializarDesdeEstructura: true,  // ✅ Sin estructura inicial - el backend llenará datos
      calcularPorcentajes: true
    };
  }

  getTablaKeyEnergiaCocinar(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `energiaCocinarTabla${prefijo}` : 'energiaCocinarTabla';
  }

  onEnergiaCocinarTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyEnergiaCocinar();
    const datos = updatedData || this.datos[tablaKey] || [];
    this.onFieldChange(tablaKey, datos, { refresh: true });
    this.cdRef.markForCheck();
  }

  // ✅ TABLA 5: Tecnología de Comunicaciones
  get tecnologiaComunicacionesConfig(): any {
    return {
      tablaKey: this.getTablaKeyTecnologiaComunicaciones(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      noInicializarDesdeEstructura: true,  // ✅ Sin estructura inicial - el backend llenará datos
      calcularPorcentajes: true
    };
  }

  getTablaKeyTecnologiaComunicaciones(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `tecnologiaComunicacionesTabla${prefijo}` : 'tecnologiaComunicacionesTabla';
  }

  onTecnologiaComunicacionesTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyTecnologiaComunicaciones();
    const datos = updatedData || this.datos[tablaKey] || [];
    this.onFieldChange(tablaKey, datos, { refresh: true });
    this.cdRef.markForCheck();
  }

  // ✅ MÉTODOS PARA GENERACIÓN DE TEXTOS (COPIADOS DEL VIEW COMPONENT)
  obtenerTextoServiciosAgua(): string {
    const manual = this.datos['textoServiciosAgua'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoServiciosAgua();
  }

  obtenerTextoServiciosAguaDetalle(): string {
    const manual = this.datos['textoServiciosAguaDetalle'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoServiciosAguaDetalle();
  }

  obtenerTextoServiciosDesague(): string {
    const manual = this.datos['textoServiciosDesague'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoServiciosDesague();
  }

  obtenerTextoServiciosDesagueDetalle(): string {
    const manual = this.datos['textoServiciosDesagueDetalle'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoServiciosDesagueDetalle();
  }

  obtenerTextoDesechosSolidos1(): string {
    const manual = this.datos['textoDesechosSolidos1'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoDesechosSolidos1();
  }

  obtenerTextoDesechosSolidos2(): string {
    const manual = this.datos['textoDesechosSolidos2'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoDesechosSolidos2();
  }

  obtenerTextoDesechosSolidos3(): string {
    const manual = this.datos['textoDesechosSolidos3'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoDesechosSolidos3();
  }

  obtenerTextoElectricidad1(): string {
    const manual = this.datos['textoElectricidad1'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoElectricidad1();
  }

  obtenerTextoElectricidad2(): string {
    const manual = this.datos['textoElectricidad2'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoElectricidad2();
  }

  obtenerTextoEnergiaParaCocinar(): string {
    const manual = this.datos['textoEnergiaParaCocinar'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoEnergiaParaCocinar();
  }

  // ✅ MÉTODOS DE GENERACIÓN (LÓGICA DINÁMICA)
  private generarTextoServiciosAgua(): string {
    const tabla = this.formDataSignal()[this.getTablaKeyAbastecimientoAgua()] || [];
    if (!tabla || tabla.length === 0) {
      return 'Según la plataforma REDINFORMA del MIDIS, en los poblados que conforman la CC ____ se hallaron viviendas con diferentes tipos de abastecimiento de agua.';
    }
    const comunidad = this.obtenerNombreComunidadActual();
    return `Según la plataforma REDINFORMA del MIDIS, en los poblados que conforman la CC ${comunidad} se hallaron viviendas con diferentes tipos de abastecimiento de agua.`;
  }

  private generarTextoServiciosAguaDetalle(): string {
    return 'El acceso a agua potable es fundamental para la salud y el bienestar de la población. La disponibilidad y calidad del servicio de agua en la comunidad impacta directamente en las condiciones de vida de los pobladores.';
  }

  private generarTextoServiciosDesague(): string {
    const tabla = this.formDataSignal()[this.getTablaKeyTiposSaneamiento()] || [];
    if (!tabla || tabla.length === 0) {
      return 'Con respecto a los servicios de saneamiento, en los poblados de la CC ____ se identificaron diferentes tipos de sistemas de disposición de excretas.';
    }
    const comunidad = this.obtenerNombreComunidadActual();
    return `Con respecto a los servicios de saneamiento, en los poblados de la CC ${comunidad} se identificaron diferentes tipos de sistemas de disposición de excretas.`;
  }

  private generarTextoServiciosDesagueDetalle(): string {
    return 'El acceso a servicios de saneamiento adecuados es esencial para prevenir enfermedades relacionadas con la contaminación del agua y mantener condiciones sanitarias aceptables en la comunidad.';
  }

  private generarTextoDesechosSolidos1(): string {
    return 'La gestión de desechos sólidos es un aspecto crítico para mantener un entorno saludable en la comunidad. Los pobladores de la CC realizan diferentes prácticas para el manejo de sus residuos.';
  }

  private generarTextoDesechosSolidos2(): string {
    return 'Cuando los desechos sólidos son recolectados, estos son trasladados a un botadero cercano a la comunidad, donde se realiza su disposición final. La falta de un sistema más avanzado para el tratamiento de los residuos plantea preocupaciones ambientales.';
  }

  private generarTextoDesechosSolidos3(): string {
    return 'El mejoramiento de los sistemas de gestión de desechos sólidos constituye una oportunidad para incrementar la calidad de vida y la sostenibilidad ambiental de la comunidad.';
  }

  private generarTextoElectricidad1(): string {
    const tabla = this.formDataSignal()[this.getTablaKeyCoberturaElectrica()] || [];
    if (!tabla || tabla.length === 0) {
      return 'Respecto a la cobertura de alumbrado eléctrico en la CC ____, los pobladores cuentan con diferentes niveles de acceso al servicio de electricidad.';
    }
    const comunidad = this.obtenerNombreComunidadActual();
    return `Respecto a la cobertura de alumbrado eléctrico en la CC ${comunidad}, los pobladores cuentan con diferentes niveles de acceso al servicio de electricidad.`;
  }

  private generarTextoElectricidad2(): string {
    return 'El acceso a electricidad facilita el desarrollo económico, mejora la calidad de vida y permite el acceso a servicios de comunicación e información en la comunidad.';
  }

  private generarTextoEnergiaParaCocinar(): string {
    return 'La disponibilidad de combustible para cocinar y energía es fundamental para las actividades cotidianas. Los pobladores utilizan diferentes fuentes de energía según su disponibilidad y accesibilidad.';
  }

  // ✅ MÉTODOS PARA TÍTULOS Y FUENTES (ENERGÍA PARA COCINAR)
  obtenerTituloEnergiaCocinar(): string {
    const tituloKey = 'tituloEnergiaCocinar';
    const manual = this.datos[tituloKey];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    const comunidad = this.obtenerNombreComunidadActual();
    return `Energía utilizada para cocinar en las viviendas – CC ${comunidad} (2017)`;
  }

  onTituloEnergiaCocinarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    this.onFieldChange('tituloEnergiaCocinar', valor, { refresh: false });
    this.cdRef.markForCheck();
  }

  obtenerFuenteEnergiaCocinar(): string {
    const fuenteKey = 'fuenteEnergiaCocinar';
    const manual = this.datos[fuenteKey];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)';
  }

  onFuenteEnergiaCocinarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    this.onFieldChange('fuenteEnergiaCocinar', valor, { refresh: false });
    this.cdRef.markForCheck();
  }

  // ✅ MÉTODOS PARA TÍTULOS Y FUENTES (TECNOLOGÍA DE COMUNICACIONES)
  obtenerTituloTecnologiaComunicaciones(): string {
    const tituloKey = 'tituloTecnologiaComunicaciones';
    const manual = this.datos[tituloKey];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    const comunidad = this.obtenerNombreComunidadActual();
    return `Tecnología de comunicaciones en las viviendas – CC ${comunidad} (2017)`;
  }

  onTituloTecnologiaComunicacionesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    this.onFieldChange('tituloTecnologiaComunicaciones', valor, { refresh: false });
    this.cdRef.markForCheck();
  }

  obtenerFuenteTecnologiaComunicaciones(): string {
    const fuenteKey = 'fuenteTecnologiaComunicaciones';
    const manual = this.datos[fuenteKey];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)';
  }

  onFuenteTecnologiaComunicacionesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    this.onFieldChange('fuenteTecnologiaComunicaciones', valor, { refresh: false });
    this.cdRef.markForCheck();
  }

  obtenerTextoTecnologiaComunicaciones(): string {
    const manual = this.datos['textoTecnologiaComunicaciones'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoTecnologiaComunicaciones();
  }

  private generarTextoTecnologiaComunicaciones(): string {
    return 'Las tecnologías de comunicación son cada vez más importante en el desarrollo rural. Los pobladores tienen acceso a diferentes tipos de tecnologías según las características de su territorio y su capacidad económica.';
  }
}
