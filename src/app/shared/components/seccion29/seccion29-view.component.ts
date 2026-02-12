import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Injector, Input, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from '../base-section.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { PrefijoHelper } from '../../utils/prefijo-helper';

@Component({
  selector: 'app-seccion29-view',
  templateUrl: './seccion29-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, CoreSharedModule, GenericTableComponent, ImageUploadComponent]
})
export class Seccion29ViewComponent extends BaseSectionComponent {
  @Input() override seccionId: string = '3.1.4.B.1.8';
  @Input() override modoFormulario: boolean = false;

  // Photo prefix used by SectionPhotoCoordinator and to load images into `fotografiasCache`
  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  override readonly PHOTO_PREFIX: string;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly textoNatalidadCP1Signal = computed(() => this.projectFacade.selectField(this.seccionId, null, 'textoNatalidadCP1')() ?? '');
  readonly textoNatalidadCP2Signal = computed(() => this.projectFacade.selectField(this.seccionId, null, 'textoNatalidadCP2')() ?? '');
  readonly textoMorbilidadCPSignal = computed(() => this.projectFacade.selectField(this.seccionId, null, 'textoMorbilidadCP')() ?? '');
  readonly textoAfiliacionSaludSignal = computed(() => this.projectFacade.selectField(this.seccionId, null, 'textoAfiliacionSalud')() ?? '');

  // Titles and fuentes
  readonly tituloNatalidadSignal = computed(() => this.projectFacade.selectField(this.seccionId, null, 'tituloNatalidadMortalidad')() ?? '');
  readonly fuenteNatalidadSignal = computed(() => this.projectFacade.selectField(this.seccionId, null, 'fuenteNatalidadMortalidad')() ?? '');

  readonly tituloMorbilidadSignal = computed(() => this.projectFacade.selectField(this.seccionId, null, 'tituloMorbilidad')() ?? '');
  readonly fuenteMorbilidadSignal = computed(() => this.projectFacade.selectField(this.seccionId, null, 'fuenteMorbilidad')() ?? '');

  readonly tituloAfiliacionSignal = computed(() => this.projectFacade.selectField(this.seccionId, null, 'tituloAfiliacionSalud')() ?? '');
  readonly fuenteAfiliacionSignal = computed(() => this.projectFacade.selectField(this.seccionId, null, 'fuenteAfiliacionSalud')() ?? '');

  readonly centroPobladoSignal = computed(() => this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() ?? 'Cahuacho');
  readonly distritoSeleccionadoSignal = computed(() => this.projectFacade.selectField(this.seccionId, null, 'distritoSeleccionado')() ?? 'Cahuacho');

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
    centroPobladoAISI: this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() ?? ''
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);

    // ✅ Inicializar PHOTO_PREFIX dinámicamente
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';

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
    const data = this.formDataSignal();
    if (data['textoNatalidadCP1'] && data['textoNatalidadCP1'].trim().length > 0) {
      return data['textoNatalidadCP1'];
    }
    return this.generarTextoNatalidadCP1();
  }

  obtenerTextoNatalidadCP2(): string {
    const data = this.formDataSignal();
    if (data['textoNatalidadCP2'] && data['textoNatalidadCP2'].trim().length > 0) {
      return data['textoNatalidadCP2'];
    }
    return this.generarTextoNatalidadCP2();
  }

  obtenerTextoMorbilidadCP(): string {
    const data = this.formDataSignal();
    if (data['textoMorbilidadCP'] && data['textoMorbilidadCP'].trim().length > 0) {
      return data['textoMorbilidadCP'];
    }
    return this.generarTextoMorbilidadCP();
  }

  obtenerTextoAfiliacionSalud(): string {
    const data = this.formDataSignal();
    if (data['textoAfiliacionSalud'] && data['textoAfiliacionSalud'].trim().length > 0) {
      return data['textoAfiliacionSalud'];
    }
    return this.generarTextoAfiliacionSalud();
  }

  // ✅ Generadores de texto (copiados del form)
  generarTextoNatalidadCP1(): string {
    const centro = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || 'Cahuacho';
    return `Este ítem proporciona una visión crucial de la dinámica demográfica, reflejando las tendencias de crecimiento poblacional. Los datos obtenidos del trabajo de campo del Puesto de Salud ${centro} indican que, durante el año 2023, se registró un total de ${this.getNatalidad2023()} nacimientos. Para el año 2024 (hasta el 14 de noviembre), se registró únicamente ${this.getNatalidad2024()} nacimiento.`;
  }

  generarTextoNatalidadCP2(): string {
    return `Respecto a la mortalidad, se puede observar que el número de defunciones en la localidad fue de ${this.getMortalidad2023()} durante el año 2023. Sin embargo, para el año 2024, sí se registró ${this.getMortalidad2024()} defunción.`;
  }

  generarTextoMorbilidadCP(): string {
    const distrito = this.projectFacade.obtenerDatos()?.['distritoSeleccionado'] || 'Cahuacho';
    const infecciones = (this.morbilidadTablaSignal() || []).find((it:any)=> it.grupo?.toString?.().toLowerCase?.().includes('infecciones'))?.casos || 0;
    const obesidad = (this.morbilidadTablaSignal() || []).find((it:any)=> it.grupo?.toString?.().toLowerCase?.().includes('obesidad'))?.casos || 0;
    return `Entre los grupos de morbilidad que se hallan a nivel distrital de ${distrito} (jurisdicción que abarca al Puesto de Salud ${this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || 'Cahuacho'}), para el año 2023, los más frecuentes fueron las infecciones agudas de las vías respiratorias superiores (${infecciones} casos) y la obesidad y otros de hiperalimentación (${obesidad} casos).`;
  }

  generarTextoAfiliacionSalud(): string {
    const centro = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || 'Cahuacho';
    const sis = this.afiliacionTablaSignal()
      .find((i:any)=> i.categoria?.toString?.().toLowerCase?.().includes('sis'))?.porcentaje || '0,00 %';
    const essalud = this.afiliacionTablaSignal()
      .find((i:any)=> i.categoria?.toString?.().toLowerCase?.().includes('essalud'))?.porcentaje || '0,00 %';
    const sinseguro = this.afiliacionTablaSignal()
      .find((i:any)=> i.categoria?.toString?.().toLowerCase?.().includes('sin seguro'))?.porcentaje || '0,00 %';

    return `En el CP ${centro}, la mayor parte de los habitantes se encuentra afiliada a algún tipo de seguro de salud. Es así que el grupo mayoritario corresponde al Seguro Integral de Salud (SIS), el cual representa el ${sis} de la población. En menor medida, se halla la afiliación a ESSALUD, que representa el ${essalud} de la población. Por último, cabe mencionar que el ${sinseguro} de la población no cuenta con ningún tipo de seguro de salud.`;
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
    return (this.afiliacionTablaSignal() || []).filter((item: any) => !item?.categoria?.toString?.().toLowerCase?.().includes('total'));
  }

  // Total removed by user request
  getTotalAfiliacionSalud(): any { return null; }

  override getFotografiasVista(): any[] { return this.fotografiasCache; }
}
