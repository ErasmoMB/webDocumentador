import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, effect } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { SECCION13_TEMPLATES } from './seccion13-constants';

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

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION13_TEMPLATES = SECCION13_TEMPLATES;
  override readonly PHOTO_PREFIX = 'fotografiaSaludIndicadores';
  override useReactiveSync: boolean = true;

  fotografiasSeccion13: FotoItem[] = [];
  private readonly regexCache = new Map<string, RegExp>();

  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  // ✅ Helper para obtener prefijo
  private obtenerPrefijo(): string {
    return this.obtenerPrefijoGrupo();
  }

  readonly natalidadMortalidadTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `natalidadMortalidadTabla${prefijo}`;
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return fromField ?? fromTable ?? [];
  });

  readonly morbilidadTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `morbilidadTabla${prefijo}`;
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return fromField ?? fromTable ?? [];
  });

  readonly afiliacionSaludTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `afiliacionSaludTabla${prefijo}`;
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return fromField ?? fromTable ?? [];
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const prefix = `${this.PHOTO_PREFIX}${prefijo}`;
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ REFACTOR: Usar ubicacionGlobal
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

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
    // ✅ REFACTOR (13/02/2026): Leer distrito de tabla S4 (dinámico)
    const distrito = this.obtenerDistrito();
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
    private globalNumbering: GlobalNumberingService
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

  /**
   * ✅ REFACTOR (13/02/2026): Lee el distrito DIRECTAMENTE de la tabla "Ubicación referencial" de Sección 4
   * En lugar de usar ubicacionGlobal() que viene de Sección 1.
   * Patrón igual a Sección 18.
   */
  obtenerDistrito(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const seccion4Id = '3.1.4.A.1'; // Sección 4 - Caracterización socioeconómica
    const tablaKey = `tablaAISD1Datos${prefijo}`;
    
    // Lee tabla desde sección 4 (Ubicación referencial) - REACTIVO
    const tabla = this.projectFacade.selectField(seccion4Id, null, tablaKey)() || [];
    
    // Retorna distrito del primer registro
    if (Array.isArray(tabla) && tabla.length > 0 && tabla[0]?.distrito) {
      return tabla[0].distrito;
    }
    
    // Fallback: usar ubicacionGlobal como alternativa
    return this.ubicacionGlobal().distrito || '____';
  }

  obtenerTextoSeccion13NatalidadMortalidadCompleto(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.projectFacade.selectField(this.seccionId, null, `parrafoSeccion13_natalidad_mortalidad_completo${prefijo}`)();
    if (manual) {
      return manual;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    return SECCION13_TEMPLATES.textoNatalidadMortalidadDefault.replace(/____/g, grupoAISD);
  }

  obtenerTextoSeccion13MorbilidadCompleto(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.projectFacade.selectField(this.seccionId, null, `parrafoSeccion13_morbilidad_completo${prefijo}`)();
    if (manual) {
      return manual;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    // ✅ REFACTOR (13/02/2026): Leer distrito de tabla S4 (dinámico)
    const distrito = this.obtenerDistrito();
    return SECCION13_TEMPLATES.textoMorbilidadDefault
      .replace(/____/g, (match, offset, string) => {
        const before = string.substring(0, offset);
        const countBefore = (before.match(/____/g) || []).length;
        if (countBefore === 0) return grupoAISD;
        if (countBefore === 1) return distrito;
        return grupoAISD;
      });
  }

  obtenerTextoAfiliacionSalud(): string {
    const prefijo = this.obtenerPrefijo();
    const manual = this.projectFacade.selectField(this.seccionId, null, `textoAfiliacionSalud${prefijo}`)();
    if (manual && manual !== '____') {
      return manual;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajeSIS = this.getPorcentajeSIS() || '____';
    const porcentajeESSALUD = this.getPorcentajeESSALUD() || '____';
    const porcentajeSinSeguro = this.getPorcentajeSinSeguro() || '____';
    return SECCION13_TEMPLATES.textoAfiliacionSaludDefault
      .replace(/____/g, (match, offset, string) => {
        const before = string.substring(0, offset);
        const countBefore = (before.match(/____/g) || []).length;
        if (countBefore === 0) return grupoAISD;
        if (countBefore === 1) return porcentajeSIS;
        if (countBefore === 2) return porcentajeESSALUD;
        return porcentajeSinSeguro;
      });
  }

  obtenerTituloCuadroNatalidad(): string {
    const prefijo = this.obtenerPrefijo();
    const titulo = this.projectFacade.selectField(this.seccionId, null, `cuadroTituloNatalidadMortalidad${prefijo}`)();
    return titulo || SECCION13_TEMPLATES.cuadroTituloNatalidadMortalidadDefault.replace(/____/g, this.obtenerNombreComunidadActual());
  }

  obtenerFuenteCuadroNatalidad(): string {
    const prefijo = this.obtenerPrefijo();
    const fuente = this.projectFacade.selectField(this.seccionId, null, `cuadroFuenteNatalidadMortalidad${prefijo}`)();
    return fuente || SECCION13_TEMPLATES.cuadroFuenteNatalidadMortalidadDefault;
  }

  obtenerTituloCuadroMorbilidad(): string {
    const prefijo = this.obtenerPrefijo();
    const titulo = this.projectFacade.selectField(this.seccionId, null, `cuadroTituloMorbilidad${prefijo}`)();
    // ✅ REFACTOR (13/02/2026): Leer distrito de tabla S4 (dinámico)
    const distrito = this.obtenerDistrito();
    return titulo || SECCION13_TEMPLATES.cuadroTituloMorbilidadDefault.replace(/____/g, distrito);
  }

  obtenerFuenteCuadroMorbilidad(): string {
    const prefijo = this.obtenerPrefijo();
    const fuente = this.projectFacade.selectField(this.seccionId, null, `cuadroFuenteMorbilidad${prefijo}`)();
    return fuente || SECCION13_TEMPLATES.cuadroFuenteMorbilidadDefault;
  }

  obtenerTituloCuadroAfiliacion(): string {
    const prefijo = this.obtenerPrefijo();
    const titulo = this.projectFacade.selectField(this.seccionId, null, `cuadroTituloAfiliacionSalud${prefijo}`)();
    return titulo || SECCION13_TEMPLATES.cuadroTituloAfiliacionSaludDefault.replace(/____/g, this.obtenerNombreComunidadActual());
  }

  obtenerFuenteCuadroAfiliacion(): string {
    const prefijo = this.obtenerPrefijo();
    const fuente = this.projectFacade.selectField(this.seccionId, null, `cuadroFuenteAfiliacionSalud${prefijo}`)();
    return fuente || SECCION13_TEMPLATES.cuadroFuenteAfiliacionSaludDefault;
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
    const cuadroNumero = this.globalNumbering.getGlobalTableNumber(this.seccionId, 2);
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
