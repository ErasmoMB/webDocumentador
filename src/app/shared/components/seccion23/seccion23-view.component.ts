import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
  selector: 'app-seccion23-view',
  templateUrl: './seccion23-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule, GenericTableComponent],
  standalone: true
})
export class Seccion23ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.2';
  @Input() override modoFormulario: boolean = false;

  // Campos observados para sincronización reactiva (se expande con prefijos automáticamente)
  override watchedFields: string[] = [
    'grupoAISD', 'distritoSeleccionado', 'poblacionDistritalAISI', 'petDistritalAISI',
    'petGruposEdadAISI', 'petGruposEdadTitulo', 'petGruposEdadFuente',
    'peaDistritoSexoTabla', 'peaDistritoSexoTitulo', 'peaDistritoSexoFuente',
    'peaOcupadaDesocupadaTabla', 'peaOcupadaDesocupadaTitulo', 'peaOcupadaDesocupadaFuente',
    'textoPET_AISI', 'textoPETIntro_AISI', 'textoAnalisisPEA_AISI', 'textoPEAAISI',
    'textoEmpleoAISI', 'textoEmpleoDependiente_AISI', 'textoIndiceDesempleoAISI'
  ];

  override readonly PHOTO_PREFIX = 'fotografiaPEA';
  override useReactiveSync: boolean = true;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly petGruposEdadSignal: Signal<any[]> = computed(() => {
    const pref = this.obtenerPrefijoGrupo();
    const key = pref ? `petGruposEdadAISI${pref}` : 'petGruposEdadAISI';
    const v = this.projectFacade.selectField(this.seccionId, null, key)() ?? this.projectFacade.selectTableData(this.seccionId, null, 'petGruposEdadAISI')() ?? this.datos.petGruposEdadAISI ?? [];
    return v as any[];
  });

  readonly peaDistritoSexoSignal: Signal<any[]> = computed(() => {
    const pref = this.obtenerPrefijoGrupo();
    const key = pref ? `peaDistritoSexoTabla${pref}` : 'peaDistritoSexoTabla';
    return (this.projectFacade.selectField(this.seccionId, null, key)() ?? this.projectFacade.selectTableData(this.seccionId, null, 'peaDistritoSexoTabla')() ?? this.datos.peaDistritoSexoTabla ?? []) as any[];
  });

  readonly peaOcupadaDesocupadaSignal: Signal<any[]> = computed(() => {
    const pref = this.obtenerPrefijoGrupo();
    const key = pref ? `peaOcupadaDesocupadaTabla${pref}` : 'peaOcupadaDesocupadaTabla';
    return (this.projectFacade.selectField(this.seccionId, null, key)() ?? this.projectFacade.selectTableData(this.seccionId, null, 'peaOcupadaDesocupadaTabla')() ?? this.datos.peaOcupadaDesocupadaTabla ?? []) as any[];
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix) || [];
  });

  readonly viewModel: Signal<any> = computed(() => ({
    ...this.formDataSignal(),
    petGruposEdad: this.petGruposEdadSignal(),
    peaDistritoSexo: this.peaDistritoSexoSignal(),
    peaOcupadaDesocupada: this.peaOcupadaDesocupadaSignal(),
    fotos: this.fotosCacheSignal()
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);

    effect(() => {
      const data = this.formDataSignal();
      // Merge instead of replace: keep existing datos when selector is empty (fallback to BaseSectionComponent data)
      if (data && Object.keys(data).length > 0) {
        this.datos = { ...this.datos, ...data };
      }
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override obtenerPrefijoGrupo(): string { return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId); }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void {
    const centro = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    this.datos.centroPobladoAISI = centro || null;
  }

  getPorcentajePEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) return '';
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no'));
    return item?.porcentaje || '';
  }

  getPorcentajeNoPEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) return '';
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('no pea'));
    return item?.porcentaje || '';
  }

  getPorcentajeHombresPEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) return '';
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no'));
    return item?.porcentajeHombres || '';
  }

  getPorcentajeMujeresNoPEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) return '';
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('no pea'));
    return item?.porcentajeMujeres || '';
  }

  override ngOnDestroy(): void { super.ngOnDestroy(); }

  getPetGruposEdadAISIConPorcentajes(): any[] {
    return TablePercentageHelper.calcularPorcentajesSimple(this.petGruposEdadSignal(), '3.40');
  }

  getPeaDistritoSexoConPorcentajes(): any[] {
    return TablePercentageHelper.calcularPorcentajesMultiples(this.peaDistritoSexoSignal(), '3.41');
  }

  getPeaOcupadaDesocupadaConPorcentajes(): any[] {
    return TablePercentageHelper.calcularPorcentajesMultiples(this.peaOcupadaDesocupadaSignal(), '3.42');
  }

  // Keep the same helper names used by template for compatibility
  getPoblacionDistritalFn(): string {
    return this.datos.poblacionDistritalAISI || '____';
  }

  getPETDistrital(): string {
    return this.datos?.petDistritalAISI || '';
  }

  getPorcentajePET(): string {
    if (!this.datos?.petGruposEdadAISI || !Array.isArray(this.datos.petGruposEdadAISI)) return '0,00 %';
    const totalPET = this.datos.petGruposEdadAISI.reduce((sum: number, item: any) => sum + (typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0), 0);
    const totalPoblacion = this.datos?.poblacionSexoAISI?.reduce((sum: number, item: any) => sum + (typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0), 0) || 0;
    if (!totalPoblacion || totalPoblacion === 0) return '';
    return ((totalPET / totalPoblacion) * 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  }

  getPorcentajeGrupoPET(categoria: string): string {
    if (!this.datos?.petGruposEdadAISI || !Array.isArray(this.datos.petGruposEdadAISI)) return '';
    const item = this.datos.petGruposEdadAISI.find((item: any) => item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase()));
    return item?.porcentaje || '';
  }

  getPorcentajeDesempleo(): string {
    const rows = this.getPeaOcupadaDesocupadaConPorcentajes() || [];
    const item = rows.find((r: any) => r.categoria && r.categoria.toLowerCase().includes('desocup'));
    return item?.porcentaje || '';
  }

  getPorcentajeHombresOcupados(): string {
    const rows = this.getPeaOcupadaDesocupadaConPorcentajes() || [];
    const item = rows.find((r: any) => r.categoria && r.categoria.toLowerCase().includes('ocup'));
    return item?.porcentajeHombres || '';
  }

  getPorcentajeMujeresOcupadas(): string {
    const rows = this.getPeaOcupadaDesocupadaConPorcentajes() || [];
    const item = rows.find((r: any) => r.categoria && r.categoria.toLowerCase().includes('ocup'));
    return item?.porcentajeMujeres || '';
  }

  getIngresoPerCapita(): string {
    const v = this.datos?.['ingresoPerCapita'] ?? (this.formDataSignal() && this.formDataSignal()['ingresoPerCapita']) ?? null;
    if (v === null || v === undefined || v === '') return '____';
    const num = typeof v === 'number' ? v : parseFloat(String(v)) || 0;
    return num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getRankingIngreso(): string {
    return this.datos?.['rankingIngreso'] ?? (this.formDataSignal() && this.formDataSignal()['rankingIngreso']) ?? '____';
  }
}

