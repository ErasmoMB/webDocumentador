import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Injector, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Signal, computed, effect } from '@angular/core';
import { BaseSectionComponent } from '../base-section.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { TableConfig } from 'src/app/core/services/table-management.service';

@Component({
  selector: 'app-seccion29-form',
  templateUrl: './seccion29-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, ParagraphEditorComponent, DynamicTableComponent, ImageUploadComponent]
})
export class Seccion29FormComponent extends BaseSectionComponent {
  @Input() override seccionId: string = '3.1.4.B.1.8';
  @Input() override modoFormulario: boolean = false;
  // Photo prefix used by SectionPhotoCoordinator and ImageUpload flow
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB18';

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly centroPobladoSignal: Signal<string> = computed(() => this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || '');

  readonly textoNatalidadCP1Signal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoNatalidadCP1')();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoNatalidadCP1();
  });

  readonly textoNatalidadCP2Signal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoNatalidadCP2')();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoNatalidadCP2();
  });

  readonly textoMorbilidadCPSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoMorbilidadCP')();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoMorbilidadCP();
  });

  readonly textoAfiliacionSaludSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoAfiliacionSalud')();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoAfiliacionSalud();
  });

  readonly natalidadTablaSignal: Signal<any[]> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'natalidadMortalidadCpTabla')() ?? this.projectFacade.selectTableData(this.seccionId, null, 'natalidadMortalidadCpTabla')() ?? [];
  });

  readonly morbilidadTablaSignal: Signal<any[]> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'morbilidadCpTabla')() ?? this.projectFacade.selectTableData(this.seccionId, null, 'morbilidadCpTabla')() ?? [];
  });

  readonly afiliacionTablaSignal: Signal<any[]> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'afiliacionSaludTabla')() ?? this.projectFacade.selectTableData(this.seccionId, null, 'afiliacionSaludTabla')() ?? [];
  });

  readonly fotografiasSignal: Signal<any[]> = computed(() => {
    // Prefer the SectionPhotoCoordinator-populated array (fotografiasFormMulti) when available
    const formMulti = (this as any).fotografiasFormMulti as any[] | undefined;
    if (formMulti && Array.isArray(formMulti) && formMulti.length > 0) return formMulti;
    return this.projectFacade.selectField(this.seccionId, null, 'fotografiasInstitucionalidad')() ?? [];
  });

  // Titles and sources for tables (editable fields)
  readonly tituloNatalidadSignal: Signal<string> = computed(() => this.projectFacade.selectField(this.seccionId, null, 'tituloNatalidadMortalidad')() ?? '');
  readonly fuenteNatalidadSignal: Signal<string> = computed(() => this.projectFacade.selectField(this.seccionId, null, 'fuenteNatalidadMortalidad')() ?? '');

  readonly tituloMorbilidadSignal: Signal<string> = computed(() => this.projectFacade.selectField(this.seccionId, null, 'tituloMorbilidad')() ?? '');
  readonly fuenteMorbilidadSignal: Signal<string> = computed(() => this.projectFacade.selectField(this.seccionId, null, 'fuenteMorbilidad')() ?? '');

  readonly tituloAfiliacionSignal: Signal<string> = computed(() => this.projectFacade.selectField(this.seccionId, null, 'tituloAfiliacionSalud')() ?? '');
  readonly fuenteAfiliacionSignal: Signal<string> = computed(() => this.projectFacade.selectField(this.seccionId, null, 'fuenteAfiliacionSalud')() ?? '');

  readonly viewModel = computed(() => ({
    centroPoblado: this.centroPobladoSignal(),
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
    fotografias: this.fotografiasSignal()
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);

    // Sync legacy data object for backward compatibility
    effect(() => {
      const d = this.formDataSignal();
      this.datos = { ...this.datos, ...d };
      this.cdRef.markForCheck();
    });
  }

  // Helper methods to generate fallback paragraph texts
  private getNatalidad2023(): number {
    const item = (this.natalidadTablaSignal() || []).find((item: any) => item.anio === 2023);
    return item?.natalidad || 0;
  }

  private getNatalidad2024(): number {
    const item = (this.natalidadTablaSignal() || []).find((item: any) => item.anio === 2024);
    return item?.natalidad || 0;
  }

  private getMortalidad2023(): number {
    const item = (this.natalidadTablaSignal() || []).find((item: any) => item.anio === 2023);
    return item?.mortalidad || 0;
  }

  private getMortalidad2024(): number {
    const item = (this.natalidadTablaSignal() || []).find((item: any) => item.anio === 2024);
    return item?.mortalidad || 0;
  }

  private generarTextoNatalidadCP1(): string {
    const centro = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || 'Cahuacho';
    return `Este ítem proporciona una visión crucial de la dinámica demográfica, reflejando las tendencias de crecimiento poblacional. Los datos obtenidos del trabajo de campo del Puesto de Salud ${centro} indican que, durante el año 2023, se registró un total de ${this.getNatalidad2023()} nacimientos. Para el año 2024 (hasta el 14 de noviembre), se registró únicamente ${this.getNatalidad2024()} nacimiento.`;
  }

  private generarTextoNatalidadCP2(): string {
    return `Respecto a la mortalidad, se puede observar que el número de defunciones en la localidad fue de ${this.getMortalidad2023()} durante el año 2023. Sin embargo, para el año 2024, sí se registró ${this.getMortalidad2024()} defunción.`;
  }

  private generarTextoMorbilidadCP(): string {
    const distrito = this.projectFacade.obtenerDatos()?.['distritoSeleccionado'] || 'Cahuacho';
    const infecciones = (this.morbilidadTablaSignal() || []).find((it:any)=> it.grupo?.toString?.().toLowerCase?.().includes('infecciones'))?.casos || 0;
    const obesidad = (this.morbilidadTablaSignal() || []).find((it:any)=> it.grupo?.toString?.().toLowerCase?.().includes('obesidad'))?.casos || 0;
    return `Entre los grupos de morbilidad que se hallan a nivel distrital de ${distrito} (jurisdicción que abarca al Puesto de Salud ${this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || 'Cahuacho'}), para el año 2023, los más frecuentes fueron las infecciones agudas de las vías respiratorias superiores (${infecciones} casos) y la obesidad y otros de hiperalimentación (${obesidad} casos).`;
  }

  private generarTextoAfiliacionSalud(): string {
    const centro = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || 'Cahuacho';
    const sis = this.afiliacionTablaSignal()
      .find((i:any)=> i.categoria?.toString?.().toLowerCase?.().includes('sis'))?.porcentaje || '0,00 %';
    const essalud = this.afiliacionTablaSignal()
      .find((i:any)=> i.categoria?.toString?.().toLowerCase?.().includes('essalud'))?.porcentaje || '0,00 %';
    const sinseguro = this.afiliacionTablaSignal()
      .find((i:any)=> i.categoria?.toString?.().toLowerCase?.().includes('sin seguro'))?.porcentaje || '0,00 %';

    return `En el CP ${centro}, la mayor parte de los habitantes se encuentra afiliada a algún tipo de seguro de salud. Es así que el grupo mayoritario corresponde al Seguro Integral de Salud (SIS), el cual representa el ${sis} de la población. En menor medida, se halla la afiliación a ESSALUD, que representa el ${essalud} de la población. Por último, cabe mencionar que el ${sinseguro} de la población no cuenta con ningún tipo de seguro de salud.`;
  }

  protected override onInitCustom(): void {
    // Initialize empty tables if missing
    if (!Array.isArray(this.natalidadTablaSignal())) {
      this.onFieldChange('natalidadMortalidadCpTabla', []);
    }
    if (!Array.isArray(this.morbilidadTablaSignal())) {
      this.onFieldChange('morbilidadCpTabla', []);
    }
    if (!Array.isArray(this.afiliacionTablaSignal())) {
      this.onFieldChange('afiliacionSaludTabla', []);
    }

    // Ensure paragraph fields exist so editor shows current value (empty string if not set)
    ['textoNatalidadCP1', 'textoNatalidadCP2', 'textoMorbilidadCP', 'textoAfiliacionSalud'].forEach(field => {
      const current = this.projectFacade.selectField(this.seccionId, null, field)();
      if (current === undefined || current === null) {
        this.onFieldChange(field, '');
      }
    });

    // Initialize title and fuente fields if missing so they are editable
    const keys = [
      ['tituloNatalidadMortalidad', 'fuenteNatalidadMortalidad'],
      ['tituloMorbilidad', 'fuenteMorbilidad'],
      ['tituloAfiliacionSalud', 'fuenteAfiliacionSalud']
    ];

    keys.forEach(([tituloKey, fuenteKey]) => {
      const t = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
      const f = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
      if (t === undefined || t === null) this.onFieldChange(tituloKey, '');
      if (f === undefined || f === null) this.onFieldChange(fuenteKey, '');
    });
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  // Table configs for DynamicTable usage in the form
  readonly natalidadConfig: TableConfig = {
    tablaKey: 'natalidadMortalidadCpTabla',
    totalKey: 'anio',
    campoTotal: 'natalidad',
    camposParaCalcular: ['natalidad', 'mortalidad'],
    calcularPorcentajes: false
  };

  readonly morbilidadConfig: TableConfig = {
    tablaKey: 'morbilidadCpTabla',
    totalKey: 'grupo',
    campoTotal: 'casos',
    camposParaCalcular: ['casos'],
    calcularPorcentajes: false
  };

  readonly afiliacionConfig: TableConfig = {
    tablaKey: 'afiliacionSaludTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos'],
    estructuraInicial: [
      { categoria: 'Seguro Integral de Salud (SIS)', casos: null, porcentaje: null },
      { categoria: 'ESSALUD', casos: null, porcentaje: null },
      { categoria: 'Seguro de fuerzas armadas o policiales', casos: null, porcentaje: null },
      { categoria: 'Seguro privado de salud', casos: null, porcentaje: null },
      { categoria: 'Ningún seguro', casos: null, porcentaje: null }
    ]
  };

  actualizarTexto(field: string, valor: string) {
    this.onFieldChange(field, valor);
  }

  onTablaUpdated(tablaKey: string, tabla: any[]) {
    // Normalizar guardar tabla simple
    this.onFieldChange(tablaKey, tabla);
  }

  override onFotografiasChange(fotografias: any[]) {
    super.onFotografiasChange(fotografias);
  }
}
