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

    effect(() => {
      const d = this.formDataSignal();
      this.datos = { ...this.datos, ...d };
      // Aplicar valores con prefijo después del merge (leer del signal, no de this.datos)
      const centroPrefijado = PrefijoHelper.obtenerValorConPrefijo(d, 'centroPobladoAISI', this.seccionId);
      if (centroPrefijado) {
        this.datos.centroPobladoAISI = centroPrefijado;
      }
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
