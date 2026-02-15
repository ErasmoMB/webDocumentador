import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Injector, Input, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from '../base-section.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { normalizeTitleWithPlaceholders } from '../../utils/placeholder-text.helper';
import { SECCION29_SECTION_ID, SECCION29_TEMPLATES, SECCION29_DEFAULT_TEXTS } from './seccion29-constants';

@Component({
  selector: 'app-seccion29-view',
  templateUrl: './seccion29-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, CoreSharedModule, GenericTableComponent, ImageUploadComponent]
})
export class Seccion29ViewComponent extends BaseSectionComponent {
  @Input() override seccionId: string = SECCION29_SECTION_ID;
  @Input() override modoFormulario: boolean = false;

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION29_TEMPLATES = SECCION29_TEMPLATES;
  override readonly PHOTO_PREFIX: string;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  private getFieldKey(field: string): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `${field}${prefijo}` : field;
  }

  private getFieldValue(field: string): any {
    const key = this.getFieldKey(field);
    return this.projectFacade.selectField(this.seccionId, null, key)()
      ?? this.projectFacade.selectField(this.seccionId, null, field)();
  }

  readonly textoNatalidadCP1Signal = computed(() => this.getFieldValue('textoNatalidadCP1') ?? '');
  readonly textoNatalidadCP2Signal = computed(() => this.getFieldValue('textoNatalidadCP2') ?? '');
  readonly textoMorbilidadCPSignal = computed(() => this.getFieldValue('textoMorbilidadCP') ?? '');
  readonly textoAfiliacionSaludSignal = computed(() => this.getFieldValue('textoAfiliacionSalud') ?? '');

  // Titles and fuentes
  readonly tituloNatalidadSignal = computed(() => {
    const cp = this.centroPobladoSignal();
    const distrito = this.distritoSeleccionadoSignal();
    const fallback = SECCION29_TEMPLATES.placeholderTituloNatalidadView;
    return normalizeTitleWithPlaceholders(this.getFieldValue('tituloNatalidadMortalidad'), fallback, cp, distrito);
  });
  readonly fuenteNatalidadSignal = computed(() => this.getFieldValue('fuenteNatalidadMortalidad') ?? '');

  readonly tituloMorbilidadSignal = computed(() => {
    const distrito = this.distritoSeleccionadoSignal();
    const fallback = SECCION29_TEMPLATES.placeholderTituloMorbilidadView;
    return normalizeTitleWithPlaceholders(this.getFieldValue('tituloMorbilidad'), fallback, this.centroPobladoSignal(), distrito);
  });
  readonly fuenteMorbilidadSignal = computed(() => this.getFieldValue('fuenteMorbilidad') ?? '');

  readonly tituloAfiliacionSignal = computed(() => {
    const cp = this.centroPobladoSignal();
    const distrito = this.distritoSeleccionadoSignal();
    const fallback = SECCION29_TEMPLATES.placeholderTituloAfiliacionView;
    return normalizeTitleWithPlaceholders(this.getFieldValue('tituloAfiliacionSalud'), fallback, cp, distrito);
  });
  readonly fuenteAfiliacionSignal = computed(() => this.getFieldValue('fuenteAfiliacionSalud') ?? '');

  readonly centroPobladoSignal = computed(() => {
    // Priorizar el nombre del CP del grupo AISI actual (como en secciones previas)
    const fromGroup = this.obtenerNombreCentroPobladoActual();
    if (fromGroup && fromGroup.trim() !== '' && fromGroup.trim() !== '____') {
      return fromGroup;
    }

    const fromField = this.getFieldValue('centroPobladoAISI');
    if (fromField && String(fromField).trim() !== '') {
      return String(fromField);
    }

    return SECCION29_TEMPLATES.centroPobladoDefault;
  });
  readonly distritoSeleccionadoSignal = computed(() => {
    return this.obtenerNombreDistritoActual()
      || this.getFieldValue('distritoSeleccionado')
      || SECCION29_TEMPLATES.distritoDefault;
  });

  readonly natalidadTablaSignal = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `natalidadMortalidadCpTabla${prefijo}` : 'natalidadMortalidadCpTabla';
    return this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? [];
  });
  readonly morbilidadTablaSignal = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `morbilidadCpTabla${prefijo}` : 'morbilidadCpTabla';
    return this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? [];
  });
  readonly afiliacionTablaSignal = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `afiliacionSaludTabla${prefijo}` : 'afiliacionSaludTabla';
    return this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? [];
  });
  // Prefer the SectionPhotoCoordinator-populated cache (fotografiasCache) for the view
  readonly fotografiasSignal = computed(() => this.fotografiasCache ?? (this.projectFacade.selectField(this.seccionId, null, 'fotografiasInstitucionalidad')() ?? []));

  readonly viewModel = computed(() => ({
    textoNatalidadCP1: this.textoNatalidadCP1Signal(),
    textoNatalidadCP2: this.textoNatalidadCP2Signal(),
    textoMorbilidadCP: this.textoMorbilidadCPSignal(),
    textoAfiliacionSalud: this.textoAfiliacionSaludSignal(),
    natalidadTabla: this.natalidadTablaSignal(),
    morbilidadTabla: this.morbilidadTablaSignal(),
    afiliacionTabla: this.afiliacionTablaSignal(),
    tituloNatalidad: this.tituloNatalidadSignal(),
    fuenteNatalidad: this.fuenteNatalidadSignal(),
    tituloMorbilidad: this.tituloMorbilidadSignal(),
    fuenteMorbilidad: this.fuenteMorbilidadSignal(),
    tituloAfiliacion: this.tituloAfiliacionSignal(),
    fuenteAfiliacion: this.fuenteAfiliacionSignal(),
    fotografias: this.fotografiasSignal(),
    centroPobladoAISI: this.getFieldValue('centroPobladoAISI') ?? ''
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);

    // ✅ Inicializar PHOTO_PREFIX dinámicamente
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = 'fotografiaCahuacho';

    // ✅ Effect para sincronizar cambios en tiempo real
    effect(() => {
      this.formDataSignal();
      this.cdRef.markForCheck();
    });

    // Watch image-related fields and reload photos when they change
    effect(() => {
      // Depend on the stored image keys so this effect runs when images change
      let hash = '';
      for (let i = 1; i <= 10; i++) {
        hash += (this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)() ? '1' : '0');
        hash += (this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)() ? '1' : '0');
        hash += (this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)() ? '1' : '0');
      }
      // also include base keys
      hash += this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}Imagen`)() ? '1' : '0';
      // When effect runs, reload cached photos so view updates immediately
      this.cargarFotografias();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void { this.cargarFotografias(); }
  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  // ✅ Configuraciones de tablas (evita problemas con caracteres especiales en templates)
  readonly natalidadTableConfig: any = {
    columns: [
      { key: 'anio', header: SECCION29_TEMPLATES.columnAñoLabel, align: 'left' as const },
      { key: 'natalidad', header: SECCION29_TEMPLATES.columnNatalidadLabel, align: 'right' as const },
      { key: 'mortalidad', header: SECCION29_TEMPLATES.columnMortalidadLabel, align: 'right' as const }
    ],
    showFooter: false,
    striped: true,
    hover: true
  };

  readonly morbilidadTableConfig: any = {
    columns: [
      { key: 'grupo', header: SECCION29_TEMPLATES.columnGrupoMorbilidadLabel, align: 'left' as const },
      { key: 'edad0_11', header: SECCION29_TEMPLATES.columnEdad0_11Label, align: 'right' as const },
      { key: 'edad12_17', header: SECCION29_TEMPLATES.columnEdad12_17Label, align: 'right' as const },
      { key: 'edad18_29', header: SECCION29_TEMPLATES.columnEdad18_29Label, align: 'right' as const },
      { key: 'edad30_59', header: SECCION29_TEMPLATES.columnEdad30_59Label, align: 'right' as const },
      { key: 'edad60_mas', header: SECCION29_TEMPLATES.columnEdad60_masLabel, align: 'right' as const },
      { key: 'casos', header: SECCION29_TEMPLATES.columnCasosTotalesLabel, align: 'right' as const }
    ],
    showFooter: false,
    striped: true,
    hover: true
  };

  readonly afiliacionTableConfig: any = {
    columns: [
      { key: 'categoria', header: SECCION29_TEMPLATES.columnCategoriaAfiliacionLabel, align: 'left' as const },
      { key: 'casos', header: SECCION29_TEMPLATES.columnPoblacionLabel, align: 'right' as const },
      { key: 'porcentaje', header: SECCION29_TEMPLATES.columnPorcentajeLabel, align: 'right' as const }
    ],
    showFooter: false,
    striped: true,
    hover: true
  };

  // Helper methods ported from monolith for template
  getNatalidad2023(): number {
    const item = (this.natalidadTablaSignal() || []).find((item: any) => item.anio === 2023);
    return item?.natalidad || 0;
  }
  getNatalidad2024(): number {
    const item = (this.natalidadTablaSignal() || []).find((item: any) => item.anio === 2024);
    return item?.natalidad || 0;
  }
  getMortalidad2023(): number {
    const item = (this.natalidadTablaSignal() || []).find((item: any) => item.anio === 2023);
    return item?.mortalidad || 0;
  }
  getMortalidad2024(): number {
    const item = (this.natalidadTablaSignal() || []).find((item: any) => item.anio === 2024);
    return item?.mortalidad || 0;
  }

  // ✅ Métodos de generación de texto (copiados del form)
  obtenerTextoNatalidadCP1(): string {
    const manual = this.getFieldValue('textoNatalidadCP1');
    if (manual && String(manual).trim().length > 0) {
      return manual;
    }
    return this.generarTextoNatalidadCP1();
  }

  obtenerTextoNatalidadCP2(): string {
    const manual = this.getFieldValue('textoNatalidadCP2');
    if (manual && String(manual).trim().length > 0) {
      return manual;
    }
    return this.generarTextoNatalidadCP2();
  }

  obtenerTextoMorbilidadCP(): string {
    const manual = this.getFieldValue('textoMorbilidadCP');
    if (manual && String(manual).trim().length > 0) {
      return manual;
    }
    return this.generarTextoMorbilidadCP();
  }

  obtenerTextoAfiliacionSalud(): string {
    const manual = this.getFieldValue('textoAfiliacionSalud');
    if (manual && String(manual).trim().length > 0) {
      return manual;
    }
    return this.generarTextoAfiliacionSalud();
  }

  // ✅ Generadores de texto usando SECCION29_DEFAULT_TEXTS y constantes
  generarTextoNatalidadCP1(): string {
    const centro = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || SECCION29_TEMPLATES.centroPobladoDefault;
    const natalidad2023 = this.getNatalidad2023();
    const natalidad2024 = this.getNatalidad2024();
    return SECCION29_DEFAULT_TEXTS.natalidadCP1(centro, natalidad2023, natalidad2024);
  }

  generarTextoNatalidadCP2(): string {
    const mortalidad2023 = this.getMortalidad2023();
    const mortalidad2024 = this.getMortalidad2024();
    return SECCION29_DEFAULT_TEXTS.natalidadCP2(mortalidad2023, mortalidad2024);
  }

  generarTextoMorbilidadCP(): string {
    const distrito = this.projectFacade.selectField(this.seccionId, null, 'distritoSeleccionado')() || SECCION29_TEMPLATES.distritoDefault;
    const centroPoblado = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || SECCION29_TEMPLATES.centroPobladoDefault;
    const infecciones = (this.morbilidadTablaSignal() || []).find((it:any)=> it.grupo?.toString?.().toLowerCase?.().includes('infecciones'))?.casos || 0;
    const obesidad = (this.morbilidadTablaSignal() || []).find((it:any)=> it.grupo?.toString?.().toLowerCase?.().includes('obesidad'))?.casos || 0;
    return SECCION29_DEFAULT_TEXTS.morbilidadCP(distrito, centroPoblado, infecciones, obesidad);
  }

  generarTextoAfiliacionSalud(): string {
    const centro = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || SECCION29_TEMPLATES.centroPobladoDefault;
    const sis = this.afiliacionTablaSignal()
      .find((i:any)=> i.categoria?.toString?.().toLowerCase?.().includes('sis'))?.porcentaje || '0,00 %';
    const essalud = this.afiliacionTablaSignal()
      .find((i:any)=> i.categoria?.toString?.().toLowerCase?.().includes('essalud'))?.porcentaje || '0,00 %';
    const sinseguro = this.afiliacionTablaSignal()
      .find((i:any)=> i.categoria?.toString?.().toLowerCase?.().includes('sin seguro'))?.porcentaje || '0,00 %';

    return SECCION29_DEFAULT_TEXTS.afiliacionSalud(centro, sis, essalud, sinseguro);
  }

  getNatalidadMortalidadSinTotal(): any[] {
    return (this.natalidadTablaSignal() || []).filter((item: any) => !item?.anio?.toString?.().toLowerCase?.().includes('total'));
  }

  // Total removed by user request

  getMorbilidadSinTotal(): any[] {
    return (this.morbilidadTablaSignal() || []).filter((item: any) => !item?.grupo?.toString?.().toLowerCase?.().includes('total'));
  }

  // Totals removed by user request
  getTotalMorbilidadRango0_11(): number { return 0; }
  getTotalMorbilidadRango12_17(): number { return 0; }
  getTotalMorbilidadRango18_29(): number { return 0; }
  getTotalMorbilidadRango30_59(): number { return 0; }
  getTotalMorbilidadRango60_mas(): number { return 0; }
  getTotalMorbilidadCasos(): number { return 0; }

  getAfiliacionSaludAISIConPorcentajes(): any[] {
    return (this.afiliacionTablaSignal() || []).map((item: any) => ({ ...item, porcentaje: item.porcentaje || '0,00 %' }));
  }

  getPorcentajeSIS(): string {
    const item = (this.afiliacionTablaSignal() || []).find((item: any) => item.categoria?.toString?.().toLowerCase?.().includes('sis'));
    return item?.porcentaje || '0,00 %';
  }

  getPorcentajeESSALUD(): string {
    const item = (this.afiliacionTablaSignal() || []).find((item: any) => item.categoria?.toString?.().toLowerCase?.().includes('essalud'));
    return item?.porcentaje || '0,00 %';
  }

  getPorcentajeSinSeguro(): string {
    const item = (this.afiliacionTablaSignal() || []).find((item: any) => item.categoria?.toString?.().toLowerCase?.().includes('sin seguro'));
    return item?.porcentaje || '0,00 %';
  }

  getAfiliacionSaludSinTotal(): any[] {
    // ✅ REMOVIDO: Ahora mostramos todas las filas del backend sin filtros
    return (this.afiliacionTablaSignal() || []);
  }

  // Total removed by user request
  getTotalAfiliacionSalud(): any { return null; }

  override getFotografiasVista(): any[] { return this.fotografiasCache; }
}
