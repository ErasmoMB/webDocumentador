import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, effect } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { TableNumberingService } from 'src/app/core/services/table-numbering.service';

@Component({
  selector: 'app-seccion13-view',
  templateUrl: './seccion13-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  standalone: true
})
export class Seccion13ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.9';
  @Input() override modoFormulario: boolean = false;  
  // NOTE: seccionId uses AISD-style identifiers (3.1.4.A.1.X) to match table numbering fixed sections

  override readonly PHOTO_PREFIX = 'fotografiaSaludIndicadores';
  override useReactiveSync: boolean = true;

  fotografiasSeccion13: FotoItem[] = [];
  private readonly regexCache = new Map<string, RegExp>();

  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  readonly natalidadMortalidadTablaSignal: Signal<any[]> = computed(() => {
    const fromField = this.projectFacade.selectField(this.seccionId, null, 'natalidadMortalidadTabla')();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, 'natalidadMortalidadTabla')();
    return fromField ?? fromTable ?? [];
  });

  readonly morbilidadTablaSignal: Signal<any[]> = computed(() => {
    const fromField = this.projectFacade.selectField(this.seccionId, null, 'morbilidadTabla')();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, 'morbilidadTabla')();
    return fromField ?? fromTable ?? [];
  });

  readonly afiliacionSaludTablaSignal: Signal<any[]> = computed(() => {
    const fromField = this.projectFacade.selectField(this.seccionId, null, 'afiliacionSaludTabla')();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, 'afiliacionSaludTabla')();
    return fromField ?? fromTable ?? [];
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

  readonly textoNatalidadMortalidadSignal: Signal<SafeHtml> = computed(() => {
    const texto = this.obtenerTextoSeccion13NatalidadMortalidadCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(/\n\n/g, '<br><br>');
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  });

  readonly textoMorbilidadSignal: Signal<SafeHtml> = computed(() => {
    const texto = this.obtenerTextoSeccion13MorbilidadCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const distrito = this.projectFacade.selectField(this.seccionId, null, 'distritoSeleccionado')() || '____';
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(this.obtenerRegExp(this.escapeRegex(distrito)), `<span class="data-section">${this.escapeHtml(distrito)}</span>`)
      .replace(/\n\n/g, '<br><br>');
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  });

  readonly textoAfiliacionSaludSignal: Signal<SafeHtml> = computed(() => {
    let texto = this.obtenerTextoAfiliacionSalud();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajeSIS = this.getPorcentajeSIS();
    const porcentajeESSALUD = this.getPorcentajeESSALUD();
    const porcentajeSinSeguro = this.getPorcentajeSinSeguro();
    let textoConValores = texto;
    if (porcentajeSinSeguro !== '____') {
      textoConValores = textoConValores.replace(/el ____ %/g, `el ${porcentajeSinSeguro} %`);
    }
    let textoConResaltado = textoConValores
      .replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    if (porcentajeSIS !== '____') {
      textoConResaltado = textoConResaltado.replace(
        this.obtenerRegExp(`${this.escapeRegex(porcentajeSIS)}\\s*%`),
        `<span class="data-calculated">${this.escapeHtml(porcentajeSIS)} %</span>`
      );
    }
    if (porcentajeESSALUD !== '____') {
      textoConResaltado = textoConResaltado.replace(
        new RegExp(`${this.escapeRegex(porcentajeESSALUD)}\\s*%`, 'g'),
        `<span class="data-calculated">${this.escapeHtml(porcentajeESSALUD)} %</span>`
      );
    }
    if (porcentajeSinSeguro !== '____') {
      textoConResaltado = textoConResaltado.replace(
        this.obtenerRegExp(`${this.escapeRegex(porcentajeSinSeguro)}\\s*%`),
        `<span class="data-calculated">${this.escapeHtml(porcentajeSinSeguro)} %</span>`
      );
    }
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private tableNumbering: TableNumberingService
  ) {
    super(cdRef, injector);

    effect(() => {
      const sectionData = this.formDataSignal();
      this.datos = { ...sectionData };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
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

  protected override actualizarValoresConPrefijo(): void { }

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix);
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    this.cdRef.markForCheck();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  override obtenerNombreComunidadActual(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    if (prefijo) {
      const nombre = this.projectFacade.selectField(this.seccionId, null, 'nombreGrupo')();
      return nombre || '____';
    }
    const grupoAISD = this.projectFacade.selectField(this.seccionId, null, 'grupoAISD')();
    return grupoAISD || '____';
  }

  obtenerTextoSeccion13NatalidadMortalidadCompleto(): string {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion13_natalidad_mortalidad_completo')();
    if (manual) {
      return manual;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    return `El presente ítem proporciona una visión crucial sobre las dinámicas demográficas, reflejando las tendencias en el crecimiento poblacional. De los datos obtenidos en el Puesto de Salud ${grupoAISD} durante el trabajo de campo, se obtiene que en el año 2023 solo ocurrió un nacimiento, mientras que para el 2024 (hasta el 13 de noviembre) se dieron un total de tres (03) nacimientos.\n\nRespecto a la mortalidad, según la misma fuente, se obtiene que en el año 2023 se registró un fallecimiento, por suicidio; mientras que para el 2024 no ocurrieron decesos dentro de la CC ${grupoAISD}, hasta la fecha indicada.`;
  }

  obtenerTextoSeccion13MorbilidadCompleto(): string {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion13_morbilidad_completo')();
    if (manual) {
      return manual;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    const distrito = this.projectFacade.selectField(this.seccionId, null, 'distritoSeleccionado')() || '____';
    return `De acuerdo con las entrevistas aplicadas durante el trabajo de campo, las autoridades locales y los informantes calificados reportaron que las enfermedades más recurrentes dentro de la CC ${grupoAISD} son las infecciones respiratorias agudas (IRAS) y las enfermedades diarreicas agudas (EDAS). Asimismo, se mencionan casos de hipertensión y diabetes, que son más frecuentes en adultos mayores.\n\nEn cuanto a los grupos de morbilidad que se hallan a nivel distrital de ${distrito} (jurisdicción que abarca a los poblados de la CC ${grupoAISD}) para el año 2023, se destaca que las condiciones más frecuentes son las infecciones agudas de las vías respiratorias superiores (1012 casos) y la obesidad y otros de hiperalimentación (191 casos). Para la primera, se reportó un mayor número de casos en el bloque etario de 0-11 años, mientras que para la segunda, el rango de 30-59 años mostró más casos. A continuación, se presenta el cuadro con la cantidad de casos por grupo de morbilidad y bloques etarios dentro del distrito, según el portal REUNIS del MINSA.`;
  }

  obtenerTextoAfiliacionSalud(): string {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoAfiliacionSalud')();
    if (manual && manual !== '____') {
      return manual;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajeSIS = this.getPorcentajeSIS() || '____';
    const porcentajeESSALUD = this.getPorcentajeESSALUD() || '____';
    const porcentajeSinSeguro = this.getPorcentajeSinSeguro() || '____';
    return `Dentro de la CC ${grupoAISD}, la mayoría de habitantes se encuentran afiliados a algún tipo de seguro de salud. Es así que el Seguro Integral de Salud (SIS) se halla en primer lugar, al abarcar el ${porcentajeSIS} % de la población. A ello le sigue ESSALUD, con un ${porcentajeESSALUD} %. Por otro lado, el ${porcentajeSinSeguro} % de la población no cuenta con ningún tipo de seguro de salud.`;
  }

  obtenerTituloCuadroNatalidad(): string {
    const titulo = this.projectFacade.selectField(this.seccionId, null, 'cuadroTituloNatalidadMortalidad')();
    return titulo || `Indicadores de natalidad y mortalidad – CC ${this.obtenerNombreComunidadActual()}`;
  }

  obtenerFuenteCuadroNatalidad(): string {
    const fuente = this.projectFacade.selectField(this.seccionId, null, 'cuadroFuenteNatalidadMortalidad')();
    return fuente || 'GEADES (2024)';
  }

  obtenerTituloCuadroMorbilidad(): string {
    const titulo = this.projectFacade.selectField(this.seccionId, null, 'cuadroTituloMorbilidad')();
    const distrito = this.projectFacade.selectField(this.seccionId, null, 'distritoSeleccionado')() || '____';
    return titulo || `Casos por grupos de morbilidad – Distrito ${distrito} (2023)`;
  }

  obtenerFuenteCuadroMorbilidad(): string {
    const fuente = this.projectFacade.selectField(this.seccionId, null, 'cuadroFuenteMorbilidad')();
    return fuente || 'REUNIS (2024)';
  }

  obtenerTituloCuadroAfiliacion(): string {
    const titulo = this.projectFacade.selectField(this.seccionId, null, 'cuadroTituloAfiliacionSalud')();
    return titulo || `Población según tipo de seguro de salud afiliado – CC ${this.obtenerNombreComunidadActual()} (2017)`;
  }

  obtenerFuenteCuadroAfiliacion(): string {
    const fuente = this.projectFacade.selectField(this.seccionId, null, 'cuadroFuenteAfiliacionSalud')();
    return fuente || 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
  }

  getMorbilidadSinTotal(): any[] {
    const tabla = this.morbilidadTablaSignal();
    if (!tabla || !Array.isArray(tabla)) return [];
    return tabla.filter((item: any) => {
      const grupo = item.grupo?.toString().toLowerCase() || '';
      return !grupo.includes('total');
    });
  }

  getAfiliacionSaludSinTotal(): any[] {
    const tabla = this.afiliacionSaludTablaSignal();
    if (!tabla || !Array.isArray(tabla)) return [];
    return tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total') && !categoria.includes('referencial');
    });
  }

  getPorcentajeSIS(): string {
    const tabla = this.getAfiliacionSaludConPorcentajes();
    const itemSIS = tabla.find((item: any) => item.categoria && item.categoria.toString().toLowerCase().includes('sis'));
    return itemSIS ? (itemSIS.porcentaje?.value ? String(itemSIS.porcentaje.value).replace(' %', '') : '____') : '____';
  }

  getPorcentajeESSALUD(): string {
    const tabla = this.getAfiliacionSaludConPorcentajes();
    const itemESSALUD = tabla.find((item: any) => item.categoria && item.categoria.toString().toLowerCase().includes('essalud'));
    return itemESSALUD ? (itemESSALUD.porcentaje?.value ? String(itemESSALUD.porcentaje.value).replace(' %', '') : '____') : '____';
  }

  getPorcentajeSinSeguro(): string {
    const tabla = this.getAfiliacionSaludConPorcentajes();
    const itemSinSeguro = tabla.find((item: any) => item.categoria && (item.categoria.toString().toLowerCase().includes('sin seguro') || item.categoria.toString().toLowerCase().includes('sin seg') || item.categoria.toString().toLowerCase().includes('ningún')));
    return itemSinSeguro ? (itemSinSeguro.porcentaje?.value ? String(itemSinSeguro.porcentaje.value).replace(' %', '') : '____') : '____';
  }

  getTotalMorbilidad(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getTotalMorbilidadRango0_11(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const rango = typeof item.rango0_11 === 'number' ? item.rango0_11 : parseInt(item.rango0_11) || 0;
      return sum + rango;
    }, 0);
    return total.toString();
  }

  getTotalMorbilidadRango12_17(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const rango = typeof item.rango12_17 === 'number' ? item.rango12_17 : parseInt(item.rango12_17) || 0;
      return sum + rango;
    }, 0);
    return total.toString();
  }

  getTotalMorbilidadRango18_29(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const rango = typeof item.rango18_29 === 'number' ? item.rango18_29 : parseInt(item.rango18_29) || 0;
      return sum + rango;
    }, 0);
    return total.toString();
  }

  getTotalMorbilidadRango30_59(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const rango = typeof item.rango30_59 === 'number' ? item.rango30_59 : parseInt(item.rango30_59) || 0;
      return sum + rango;
    }, 0);
    return total.toString();
  }

  getTotalMorbilidadRango60(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const rango = typeof item.rango60 === 'number' ? item.rango60 : parseInt(item.rango60) || 0;
      return sum + rango;
    }, 0);
    return total.toString();
  }

  getTotalAfiliacionSalud(): string {
    const filtered = this.getAfiliacionSaludSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getAfiliacionSaludConPorcentajes(): any[] {
    const tabla = this.afiliacionSaludTablaSignal();
    const cuadroNumero = this.tableNumbering.getGlobalTableNumber(this.seccionId, 2);
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadroNumero);
  }

  private obtenerRegExp(pattern: string): RegExp {
    if (!this.regexCache.has(pattern)) {
      this.regexCache.set(pattern, new RegExp(pattern, 'g'));
    }
    return this.regexCache.get(pattern)!;
  }

  private escapeRegex(text: any): string {
    const str = typeof text === 'string' ? text : String(text || '');
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
