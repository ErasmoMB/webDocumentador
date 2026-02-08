import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { TableNumberingService } from 'src/app/core/services/table-numbering.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CoreSharedModule,
    ImageUploadComponent
  ],
  selector: 'app-seccion10-view',
  templateUrl: './seccion10-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host ::ng-deep .data-manual.has-data,
    :host ::ng-deep .data-section.has-data {
      background-color: transparent !important;
      padding: 0 !important;
      border-radius: 0 !important;
      font-weight: normal !important;
      color: inherit !important;
    }
  `]
})
export class Seccion10ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.6';
  @Input() override modoFormulario: boolean = false;

  override readonly PHOTO_PREFIX = 'fotografiaSeccion10';

  override fotografiasCache: FotoItem[] = [];

  // ✅ FUNCIONES PURAS PARA CÁLCULO DE PORCENTAJES (FASE 5)
  private calcularPorcentajesPuros(tabla: any[]): any[] {
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) {
      return [];
    }

    // Filtrar filas Total si existen
    const tablaSinTotal = tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });

    // Calcular total dinámicamente como suma de casos en la tabla
    const total = tablaSinTotal.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      return tablaSinTotal.map((item: any) => ({ ...item, porcentaje: { value: '0,00 %', isCalculated: true } }));
    }

    // Calcular porcentajes basados en el total de la tabla
    return tablaSinTotal.map((item: any) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      return {
        ...item,
        porcentaje: { value: porcentajeFormateado, isCalculated: true }
      };
    });
  }

  // ✅ SIGNALS PUROS
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly abastecimientoAguaSignal: Signal<any[]> = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `abastecimientoAguaTabla${prefijo}` : 'abastecimientoAguaTabla';
    return Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
  });

  readonly tiposSaneamientoSignal: Signal<any[]> = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `tiposSaneamientoTabla${prefijo}` : 'tiposSaneamientoTabla';
    return Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
  });

  readonly alumbradoElectricoSignal: Signal<any[]> = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `alumbradoElectricoTabla${prefijo}` : 'alumbradoElectricoTabla';
    return Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
  });

  readonly abastecimientoAguaConPorcentajesSignal: Signal<any[]> = computed(() => {
    const tabla = this.abastecimientoAguaSignal();
    return this.calcularPorcentajesPuros(tabla);
  });

  readonly tiposSaneamientoConPorcentajesSignal: Signal<any[]> = computed(() => {
    const tabla = this.tiposSaneamientoSignal();
    return this.calcularPorcentajesPuros(tabla);
  });

  readonly coberturaElectricaConPorcentajesSignal: Signal<any[]> = computed(() => {
    const tabla = this.alumbradoElectricoSignal();
    return this.calcularPorcentajesPuros(tabla);
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
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
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 3: Sincronización automática de señales calculadas (para reactividad en vista)
    effect(() => {
      // Monitorear señales calculadas para asegurar reactividad automática
      this.abastecimientoAguaConPorcentajesSignal();
      this.tiposSaneamientoConPorcentajesSignal();
      this.coberturaElectricaConPorcentajesSignal();
      this.abastecimientoAguaSignal();
      this.tiposSaneamientoSignal();
      this.alumbradoElectricoSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  protected override cargarFotografias(): void {
    super.cargarFotografias();
  }

  // ✅ MÉTODO PARA TRACKBY EN LOOPS
  trackByIndex(index: number): number {
    return index;
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

  obtenerTextoSeccion10ServiciosBasicosIntroConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion10ServiciosBasicosIntro();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoServiciosAgua(): string {
    const manual = this.datos['textoServiciosAgua'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoServiciosAgua();
  }

  obtenerTextoServiciosAguaConResaltado(): SafeHtml {
    const texto = this.obtenerTextoServiciosAgua();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoServiciosAguaDetalle(): string {
    const manual = this.datos['textoServiciosAguaDetalle'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoServiciosAguaDetalle();
  }

  obtenerTextoServiciosAguaDetalleConResaltado(): SafeHtml {
    const texto = this.obtenerTextoServiciosAguaDetalle();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoServiciosDesague(): string {
    const manual = this.datos['textoServiciosDesague'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoServiciosDesague();
  }

  obtenerTextoServiciosDesagueConResaltado(): SafeHtml {
    const texto = this.obtenerTextoServiciosDesague();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoServiciosDesagueDetalle(): string {
    const manual = this.datos['textoServiciosDesagueDetalle'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoServiciosDesagueDetalle();
  }

  obtenerTextoServiciosDesagueDetalleConResaltado(): SafeHtml {
    const texto = this.obtenerTextoServiciosDesagueDetalle();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoElectricidad(): string {
    const manual = this.datos['textoElectricidad1'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoElectricidad();
  }

  obtenerTextoElectricidadConResaltado(): SafeHtml {
    const texto = this.obtenerTextoElectricidad();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoElectricidadDetalle(): string {
    const manual = this.datos['textoElectricidad2'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoElectricidadDetalle();
  }

  obtenerTextoElectricidadDetalleConResaltado(): SafeHtml {
    const texto = this.obtenerTextoElectricidadDetalle();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoDesechosSolidos(): string {
    const manual = this.datos['textoDesechosSolidos1'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoDesechosSolidos();
  }

  obtenerTextoDesechosSolidosConResaltado(): SafeHtml {
    const texto = this.obtenerTextoDesechosSolidos();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoDesechosSolidosDetalle(): string {
    const manual = this.datos['textoDesechosSolidos2'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoDesechosSolidosDetalle();
  }

  obtenerTextoDesechosSolidosDetalleConResaltado(): SafeHtml {
    const texto = this.obtenerTextoDesechosSolidosDetalle();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoEnergiaCocinar(): string {
    const manual = this.datos['textoEnergiaParaCocinar'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoEnergiaCocinar();
  }

  obtenerTextoEnergiaCocinarConResaltado(): SafeHtml {
    const texto = this.obtenerTextoEnergiaCocinar();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  private generarTextoServiciosBasicosIntro(): string {
    return `En términos generales, la delimitación del ámbito de estudio de las áreas de influencia social se hace tomando en consideración a los agentes e instancias sociales, individuales y/o colectivas, públicas y/o privadas, que tengan derechos o propiedad sobre el espacio o los recursos respecto de los cuales el proyecto de exploración minera tiene incidencia.

Asimismo, el área de influencia social de un proyecto tiene en consideración a los grupos de interés que puedan ser potencialmente afectadas por el desarrollo de dicho proyecto (según La Guía de Relaciones Comunitarias de la DGAAM del MINEM, se denomina "grupos de interés" a aquellos grupos humanos que son impactados por dicho proyecto).

El criterio social para la delimitación de un área de influencia debe tener en cuenta la influencia que el Proyecto pudiera tener sobre el entorno social, que será o no ambientalmente impactado, considerando también la posibilidad de generar otro tipo de impactos, expectativas, intereses y/o demandas del entorno social.

En base a estos criterios se han identificado las áreas de influencia social directa e indirecta:`;
  }

  private generarTextoServiciosAgua(): string {
    const comunidad = this.obtenerNombreComunidadActual();
    const porcentajeRedPublica = this.getPorcentajeAguaRedPublica();
    const porcentajeSinAbastecimiento = this.getPorcentajeAguaSinAbastecimiento();

    return `Según la plataforma REDINFORMA del MIDIS, en los poblados que conforman la CC ${comunidad} se hallaron viviendas que presentan diferentes tipos de abastecimiento de agua. El ${porcentajeRedPublica}% de las viviendas cuenta con abastecimiento de agua a través de red pública dentro de la vivienda, mientras que el ${porcentajeSinAbastecimiento}% no cuenta con acceso a red pública de agua.`;
  }

  private generarTextoServiciosAguaDetalle(): string {
    return '';
  }

  private generarTextoServiciosDesague(): string {
    const comunidad = this.obtenerNombreComunidadActual();
    const porcentajeRedPublica = this.getPorcentajeSaneamientoRedPublica();
    const porcentajeSinSaneamiento = this.getPorcentajeSaneamientoSinSaneamiento();

    return `En cuanto a los servicios de desagüe, según la plataforma REDINFORMA del MIDIS, en los poblados que conforman la CC ${comunidad} se hallaron viviendas que presentan diferentes tipos de saneamiento. El ${porcentajeRedPublica}% de las viviendas cuenta con desagüe a través de red pública de desagüe, mientras que el ${porcentajeSinSaneamiento}% no cuenta con alcantarillado.`;
  }

  private generarTextoServiciosDesagueDetalle(): string {
    return '';
  }

  private generarTextoElectricidad(): string {
    const comunidad = this.obtenerNombreComunidadActual();
    const porcentajeConElectricidad = this.getPorcentajeElectricidad();

    return `Respecto a los servicios de electricidad, según la plataforma REDINFORMA del MIDIS, en los poblados que conforman la CC ${comunidad} se hallaron viviendas que presentan diferentes situaciones en cuanto al alumbrado eléctrico. El ${porcentajeConElectricidad}% de las viviendas cuenta con alumbrado eléctrico.`;
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

  private getPorcentajeAguaRedPublica(): string {
    const tabla = this.abastecimientoAguaConPorcentajesSignal();
    if (!tabla || !Array.isArray(tabla)) return '____';

    const redPublica = tabla.find((item: any) => {
      const cat = (item.categoria || '').toLowerCase();
      return cat.includes('red pública') || cat.includes('red pública dentro');
    });

    return redPublica?.porcentaje?.value || redPublica?.porcentaje || '____';
  }

  private getPorcentajeAguaSinAbastecimiento(): string {
    const tabla = this.abastecimientoAguaConPorcentajesSignal();
    if (!tabla || !Array.isArray(tabla)) return '____';

    const sinAbastecimiento = tabla.find((item: any) => {
      const cat = (item.categoria || '').toLowerCase();
      return cat.includes('sin acceso a red pública') ||
             cat.includes('sin abastecimiento') ||
             cat.includes('no se abastece') ||
             cat.includes('río') ||
             cat.includes('otro tipo');
    });

    return sinAbastecimiento?.porcentaje?.value || sinAbastecimiento?.porcentaje || '____';
  }

  private getPorcentajeSaneamientoRedPublica(): string {
    const tabla = this.tiposSaneamientoConPorcentajesSignal();
    if (!tabla || !Array.isArray(tabla)) return '____';

    const redPublica = tabla.find((item: any) => {
      const cat = (item.categoria || '').toLowerCase();
      return cat.includes('red pública') ||
             cat.includes('con alcantarillado') ||
             cat.includes('red pública de desagüe');
    });

    return redPublica?.porcentaje?.value || redPublica?.porcentaje || '____';
  }

  private getPorcentajeSaneamientoSinSaneamiento(): string {
    const tabla = this.tiposSaneamientoConPorcentajesSignal();
    if (!tabla || !Array.isArray(tabla)) return '____';

    const sinSaneamiento = tabla.find((item: any) => {
      const cat = (item.categoria || '').toLowerCase();
      return cat.includes('sin alcantarillado') ||
             cat.includes('no tiene desagüe') ||
             cat.includes('río') ||
             cat.includes('pozo negro');
    });

    return sinSaneamiento?.porcentaje?.value || sinSaneamiento?.porcentaje || '____';
  }

  private getPorcentajeElectricidad(): string {
    const tabla = this.coberturaElectricaConPorcentajesSignal();
    if (!tabla || !Array.isArray(tabla)) return '____';

    const conElectricidad = tabla.find((item: any) => {
      const cat = (item.categoria || '').toLowerCase();
      return cat.includes('con electricidad') ||
             cat.includes('con alumbrado');
    });

    return conElectricidad?.porcentaje?.value || conElectricidad?.porcentaje || '____';
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

  // ✅ MÉTODOS FALTANTES PARA EL TEMPLATE
  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  obtenerTituloEnergiaCocinar(): string {
    const tituloKey = 'tituloEnergiaCocinar';
    const titulo = this.datos[tituloKey];
    if (titulo && titulo.trim().length > 0) return titulo;
    const comunidad = this.obtenerNombreComunidadActual();
    return `Energía utilizada para cocinar en las viviendas – CC ${comunidad} (2017)`;
  }

  energiaCocinarConPorcentajesSignal(): any[] {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `energiaCocinarTabla${prefijo}` : 'energiaCocinarTabla';
    const tabla = Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
    return this.calcularPorcentajesPuros(tabla);
  }

  obtenerFuenteEnergiaCocinar(): string {
    const fuenteKey = 'fuenteEnergiaCocinar';
    const fuente = this.datos[fuenteKey];
    if (fuente && fuente.trim().length > 0) return fuente;
    return 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)';
  }

  obtenerTextoEnergiaCocinarDetalleConResaltado(): SafeHtml {
    const texto = this.obtenerTextoEnergiaCocinarDetalle();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoTecnologiaComunicacionesConResaltado(): SafeHtml {
    const texto = this.obtenerTextoTecnologiaComunicaciones();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTituloTecnologiaComunicaciones(): string {
    const tituloKey = 'tituloTecnologiaComunicaciones';
    const titulo = this.datos[tituloKey];
    if (titulo && titulo.trim().length > 0) return titulo;
    const comunidad = this.obtenerNombreComunidadActual();
    return `Tecnología de comunicaciones en las viviendas – CC ${comunidad} (2017)`;
  }

  tecnologiaComunicacionesConPorcentajesSignal(): any[] {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `tecnologiaComunicacionesTabla${prefijo}` : 'tecnologiaComunicacionesTabla';
    const tabla = Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
    return this.calcularPorcentajesPuros(tabla);
  }

  obtenerFuenteTecnologiaComunicaciones(): string {
    const fuenteKey = 'fuenteTecnologiaComunicaciones';
    const fuente = this.datos[fuenteKey];
    if (fuente && fuente.trim().length > 0) return fuente;
    return 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)';
  }

  obtenerTextoTecnologiaComunicacionesDetalleConResaltado(): SafeHtml {
    const texto = this.obtenerTextoTecnologiaComunicacionesDetalle();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  // ✅ NÚMEROS DE CUADROS USANDO SERVICIO DE NUMERACIÓN
  private obtenerNumeroCuadroEnergiaCocinar(): string {
    return this.tableNumberingService.getGlobalTableNumber(this.seccionId, 3);
  }

  private obtenerNumeroCuadroTecnologiaComunicaciones(): string {
    return this.tableNumberingService.getGlobalTableNumber(this.seccionId, 4);
  }

  private obtenerTextoEnergiaCocinarDetalle(): string {
    const manual = this.datos['textoEnergiaCocinarDetalle'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return 'Detalle generado para energía utilizada para cocinar';
  }

  obtenerTextoTecnologiaComunicaciones(): string {
    const manual = this.datos['textoTecnologiaComunicaciones'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return 'Las tecnologías de comunicación son cada vez más importante en el desarrollo rural. Los pobladores tienen acceso a diferentes tipos de tecnologías según las características de su territorio y su capacidad económica.';
  }

  private obtenerTextoTecnologiaComunicacionesDetalle(): string {
    const manual = this.datos['textoTecnologiaComunicacionesDetalle'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return 'Detalle generado para tecnología de comunicaciones';
  }

  // ✅ MÉTODOS PARA FILAS DE TOTAL
  obtenerTotalAbastecimientoAgua(): any {
    const tabla = this.abastecimientoAguaConPorcentajesSignal();
    if (!tabla || tabla.length === 0) {
      return null;
    }
    const totalCasos = tabla.reduce((sum, item) => {
      const casos = typeof item.casos === 'number' ? item.casos : (typeof item.casos === 'string' ? parseInt(item.casos) || 0 : 0);
      return sum + casos;
    }, 0);
    return {
      categoria: 'Total',
      casos: totalCasos,
      porcentaje: { value: '100,00 %', isCalculated: true }
    };
  }

  obtenerTotalTiposSaneamiento(): any {
    const tabla = this.tiposSaneamientoConPorcentajesSignal();
    if (!tabla || tabla.length === 0) {
      return null;
    }
    const totalCasos = tabla.reduce((sum, item) => {
      const casos = typeof item.casos === 'number' ? item.casos : (typeof item.casos === 'string' ? parseInt(item.casos) || 0 : 0);
      return sum + casos;
    }, 0);
    return {
      categoria: 'Total',
      casos: totalCasos,
      porcentaje: { value: '100,00 %', isCalculated: true }
    };
  }

  obtenerTotalCoberturaElectrica(): any {
    const tabla = this.coberturaElectricaConPorcentajesSignal();
    if (!tabla || tabla.length === 0) {
      return null;
    }
    const totalCasos = tabla.reduce((sum, item) => {
      const casos = typeof item.casos === 'number' ? item.casos : (typeof item.casos === 'string' ? parseInt(item.casos) || 0 : 0);
      return sum + casos;
    }, 0);
    return {
      categoria: 'Total',
      casos: totalCasos,
      porcentaje: { value: '100,00 %', isCalculated: true }
    };
  }

  obtenerTotalEnergiaCocinar(): any {
    const tabla = this.energiaCocinarConPorcentajesSignal();
    if (!tabla || tabla.length === 0) {
      return null;
    }
    const totalCasos = tabla.reduce((sum, item) => {
      const casos = typeof item.casos === 'number' ? item.casos : (typeof item.casos === 'string' ? parseInt(item.casos) || 0 : 0);
      return sum + casos;
    }, 0);
    return {
      categoria: 'Total',
      casos: totalCasos,
      porcentaje: { value: '100,00 %', isCalculated: true }
    };
  }
}