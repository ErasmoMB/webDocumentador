import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
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
  @Input() override seccionId: string = SECCION10_SECTION_ID;
  @Input() override modoFormulario: boolean = false;

  // ✅ Hacer TEMPLATES accesible en template
  readonly SECCION10_TEMPLATES = SECCION10_TEMPLATES;

  override readonly PHOTO_PREFIX = SECCION10_PHOTO_PREFIX;

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

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private globalNumbering: GlobalNumberingService
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

  // ✅ HELPER PARA OBTENER PREFIJO DE GRUPO
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
  }

  obtenerTextoSeccion10ServiciosBasicosIntro(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['parrafoSeccion10_servicios_basicos_intro' + prefijo];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoServiciosBasicosIntro();
  }

  obtenerTextoSeccion10ServiciosBasicosIntroConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion10ServiciosBasicosIntro();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  private generarTextoServiciosBasicosIntro(): string {
    return `En términos generales, la delimitación del ámbito de estudio de las áreas de influencia social se hace tomando en consideración a los agentes e instancias sociales, individuales y/o colectivas, públicas y/o privadas, que tengan derechos o propiedad sobre el espacio o los recursos respecto de los cuales el proyecto de exploración minera tiene incidencia.

Asimismo, el área de influencia social de un proyecto tiene en consideración a los grupos de interés que puedan ser potencialmente afectadas por el desarrollo de dicho proyecto (según La Guía de Relaciones Comunitarias de la DGAAM del MINEM, se denomina "grupos de interés" a aquellos grupos humanos que son impactados por dicho proyecto).

El criterio social para la delimitación de un área de influencia debe tener en cuenta la influencia que el Proyecto pudiera tener sobre el entorno social, que será o no ambientalmente impactado, considerando también la posibilidad de generar otro tipo de impactos, expectativas, intereses y/o demandas del entorno social.

En base a estos criterios se han identificado las áreas de influencia social directa e indirecta:`;
  }

  // ✅ SEÑALES PARA TABLAS CON PORCENTAJES
  private getTablaSignal(tablaKeyBase: string): Signal<any[]> {
    return computed(() => {
      const data = this.formDataSignal();
      const prefijo = this.obtenerPrefijo();
      const tablaKey = prefijo ? `${tablaKeyBase}${prefijo}` : tablaKeyBase;
      return Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
    });
  }

  readonly abastecimientoAguaSignal: Signal<any[]> = this.getTablaSignal('abastecimientoAguaTabla');
  readonly tiposSaneamientoSignal: Signal<any[]> = this.getTablaSignal('tiposSaneamientoTabla');
  readonly alumbradoElectricoSignal: Signal<any[]> = this.getTablaSignal('alumbradoElectricoTabla');

  // 🚨 PATRÓN SOLO LECTURA - Mostrar datos DIRECTOS del backend
  readonly abastecimientoAguaConPorcentajesSignal: Signal<any[]> = computed(() => {
    return this.abastecimientoAguaSignal(); // Datos directos sin procesamiento
  });

  readonly tiposSaneamientoConPorcentajesSignal: Signal<any[]> = computed(() => {
    return this.tiposSaneamientoSignal(); // Datos directos sin procesamiento  
  });

  readonly coberturaElectricaConPorcentajesSignal: Signal<any[]> = computed(() => {
    return this.alumbradoElectricoSignal(); // Datos directos sin procesamiento
  });

  // 🚨 PATRÓN SOLO LECTURA - Datos directos del backend
  energiaCocinarConPorcentajesSignal(): any[] {
    const data = this.formDataSignal();
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `energiaCocinarTabla${prefijo}` : 'energiaCocinarTabla';
    const tabla = Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
    return tabla; // Datos directos sin procesamiento
  }

  tecnologiaComunicacionesConPorcentajesSignal(): any[] {
    const data = this.formDataSignal();
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `tecnologiaComunicacionesTabla${prefijo}` : 'tecnologiaComunicacionesTabla';
    const tabla = Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
    return tabla; // Datos directos sin procesamiento
  }

  // ✅ TEXTOS CON PREFIJO
  obtenerTextoServiciosAgua(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoServiciosAgua' + prefijo];
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
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoServiciosAguaDetalle' + prefijo];
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
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoServiciosDesague' + prefijo];
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
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoServiciosDesagueDetalle' + prefijo];
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
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoElectricidad1' + prefijo];
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
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoElectricidad2' + prefijo];
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
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoDesechosSolidos1' + prefijo];
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
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoDesechosSolidos2' + prefijo];
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
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoEnergiaParaCocinar' + prefijo];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return this.generarTextoEnergiaCocinar();
  }

  obtenerTextoEnergiaCocinarConResaltado(): SafeHtml {
    const texto = this.obtenerTextoEnergiaCocinar();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  // ✅ GENERADORES DE TEXTO
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

  // ✅ PORCENTAJES CON PREFIJO
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

  // ✅ NÚMEROS DE CUADRO CON PREFIJO (ahora usando GlobalNumberingService)
  obtenerNumeroCuadroAbastecimientoAgua(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  }

  obtenerNumeroCuadroTiposSaneamiento(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
  }

  obtenerNumeroCuadroCoberturaElectrica(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 2);
  }

  // ✅ TÍTULOS Y FUENTES CON PREFIJO
  obtenerTituloAbastecimientoAgua(): string {
    const prefijo = this.obtenerPrefijo();
    const tituloKey = 'tituloAbastecimientoAgua' + prefijo;
    const titulo = this.datos[tituloKey];
    if (titulo && titulo.trim().length > 0) return titulo;
    const comunidad = this.obtenerNombreComunidadActual();
    return `Tipos de abastecimiento de agua en las viviendas – CC ${comunidad} (2017)`;
  }

  obtenerTituloTiposSaneamiento(): string {
    const prefijo = this.obtenerPrefijo();
    const tituloKey = 'tituloTiposSaneamiento' + prefijo;
    const titulo = this.datos[tituloKey];
    if (titulo && titulo.trim().length > 0) return titulo;
    const comunidad = this.obtenerNombreComunidadActual();
    return `Tipos de saneamiento en las viviendas – CC ${comunidad} (2017)`;
  }

  obtenerTituloCoberturaElectrica(): string {
    const prefijo = this.obtenerPrefijo();
    const tituloKey = 'tituloCoberturaElectrica' + prefijo;
    const titulo = this.datos[tituloKey];
    if (titulo && titulo.trim().length > 0) return titulo;
    const comunidad = this.obtenerNombreComunidadActual();
    return `Cobertura de alumbrado eléctrico en las viviendas – CC ${comunidad} (2017)`;
  }

  obtenerFuenteAbastecimientoAgua(): string {
    const prefijo = this.obtenerPrefijo();
    const fuenteKey = 'fuenteAbastecimientoAgua' + prefijo;
    const fuente = this.datos[fuenteKey];
    if (fuente && fuente.trim().length > 0) return fuente;
    return SECCION10_TEMPLATES.fuenteDefault;
  }

  obtenerFuenteTiposSaneamiento(): string {
    const prefijo = this.obtenerPrefijo();
    const fuenteKey = 'fuenteTiposSaneamiento' + prefijo;
    const fuente = this.datos[fuenteKey];
    if (fuente && fuente.trim().length > 0) return fuente;
    return SECCION10_TEMPLATES.fuenteDefault;
  }

  obtenerFuenteCoberturaElectrica(): string {
    const prefijo = this.obtenerPrefijo();
    const fuenteKey = 'fuenteCoberturaElectrica' + prefijo;
    const fuente = this.datos[fuenteKey];
    if (fuente && fuente.trim().length > 0) return fuente;
    return SECCION10_TEMPLATES.fuenteDefault;
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
    const prefijo = this.obtenerPrefijo();
    const tituloKey = 'tituloEnergiaCocinar' + prefijo;
    const titulo = this.datos[tituloKey];
    if (titulo && titulo.trim().length > 0) return titulo;
    const comunidad = this.obtenerNombreComunidadActual();
    return `Energía utilizada para cocinar en las viviendas – CC ${comunidad} (2017)`;
  }

  obtenerFuenteEnergiaCocinar(): string {
    const prefijo = this.obtenerPrefijo();
    const fuenteKey = 'fuenteEnergiaCocinar' + prefijo;
    const fuente = this.datos[fuenteKey];
    if (fuente && fuente.trim().length > 0) return fuente;
    return SECCION10_TEMPLATES.fuenteDefault;
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
    const prefijo = this.obtenerPrefijo();
    const tituloKey = 'tituloTecnologiaComunicaciones' + prefijo;
    const titulo = this.datos[tituloKey];
    if (titulo && titulo.trim().length > 0) return titulo;
    const comunidad = this.obtenerNombreComunidadActual();
    return `Tecnología de comunicaciones en las viviendas – CC ${comunidad} (2017)`;
  }

  obtenerFuenteTecnologiaComunicaciones(): string {
    const prefijo = this.obtenerPrefijo();
    const fuenteKey = 'fuenteTecnologiaComunicaciones' + prefijo;
    const fuente = this.datos[fuenteKey];
    if (fuente && fuente.trim().length > 0) return fuente;
    return SECCION10_TEMPLATES.fuenteDefault;
  }

  obtenerTextoTecnologiaComunicacionesDetalleConResaltado(): SafeHtml {
    const texto = this.obtenerTextoTecnologiaComunicacionesDetalle();
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  // ✅ NÚMEROS DE CUADROS USANDO SERVICIO DE NUMERACIÓN (ahora usando GlobalNumberingService)
  private obtenerNumeroCuadroEnergiaCocinar(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 3);
  }

  private obtenerNumeroCuadroTecnologiaComunicaciones(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 4);
  }

  private obtenerTextoEnergiaCocinarDetalle(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoEnergiaCocinarDetalle' + prefijo];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return ''; // Sin valor por defecto - usuario debe proporcionar
  }

  obtenerTextoTecnologiaComunicaciones(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoTecnologiaComunicaciones' + prefijo];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return ''; // Sin valor por defecto - usuario debe proporcionar
  }

  private obtenerTextoTecnologiaComunicacionesDetalle(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.datos['textoTecnologiaComunicacionesDetalle' + prefijo];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    return ''; // Sin valor por defecto - usuario debe proporcionar
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
