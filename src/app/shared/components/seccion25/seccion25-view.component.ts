import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { TableNumberingService } from 'src/app/core/services/table-numbering.service';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { PrefijoHelper } from '../../utils/prefijo-helper';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, GenericTableComponent],
  selector: 'app-seccion25-view',
  templateUrl: './seccion25-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion25ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.4';

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  override readonly PHOTO_PREFIX: string;
  override useReactiveSync: boolean = true;

  override watchedFields: string[] = [
    'centroPobladoAISI', 'tiposViviendaAISI', 'condicionOcupacionAISI', 'materialesViviendaAISI', 'textoViviendaAISI', 'textoOcupacionViviendaAISI', 'textoEstructuraAISI',
    'cuadroTituloTiposVivienda', 'cuadroFuenteTiposVivienda', 'cuadroTituloCondicionOcupacion', 'cuadroFuenteCondicionOcupacion', 'cuadroTituloMaterialesVivienda', 'cuadroFuenteMaterialesVivienda'
  ];

  fotografiasInstitucionalidadCache: FotoItem[] = [];

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly textoViviendaSignal = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoViviendaAISI')();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoViviendaDefault();
  });

  readonly textoOcupacionSignal = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoOcupacionViviendaAISI')();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoOcupacionDefault();
  });

  readonly textoEstructuraSignal = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoEstructuraAISI')();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoEstructuraDefault();
  });

  readonly tiposViviendaSignal = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tableKeyPref = prefijo ? `tiposViviendaAISI${prefijo}` : 'tiposViviendaAISI';
    // Prefer table store (canonical) and fallback to legacy field
    return this.projectFacade.selectTableData(this.seccionId, null, tableKeyPref)() ??
           this.projectFacade.selectTableData(this.seccionId, null, 'tiposViviendaAISI')() ??
           this.projectFacade.selectField(this.seccionId, null, tableKeyPref)() ??
           this.projectFacade.selectField(this.seccionId, null, 'tiposViviendaAISI')() ?? [];
  });

  readonly condicionOcupacionSignal = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tableKeyPref = prefijo ? `condicionOcupacionAISI${prefijo}` : 'condicionOcupacionAISI';
    return this.projectFacade.selectTableData(this.seccionId, null, tableKeyPref)() ??
           this.projectFacade.selectTableData(this.seccionId, null, 'condicionOcupacionAISI')() ??
           this.projectFacade.selectField(this.seccionId, null, tableKeyPref)() ??
           this.projectFacade.selectField(this.seccionId, null, 'condicionOcupacionAISI')() ?? [];
  });

  readonly materialesViviendaSignal = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tableKeyPref = prefijo ? `materialesViviendaAISI${prefijo}` : 'materialesViviendaAISI';
    return this.projectFacade.selectTableData(this.seccionId, null, tableKeyPref)() ??
           this.projectFacade.selectTableData(this.seccionId, null, 'materialesViviendaAISI')() ??
           this.projectFacade.selectField(this.seccionId, null, tableKeyPref)() ??
           this.projectFacade.selectField(this.seccionId, null, 'materialesViviendaAISI')() ?? [];
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

  // computed preview signals (MODO IDEAL)
  readonly porcentajeOcupadasPresentesSignal: Signal<string> = computed(() => {
    const tabla = this.condicionOcupacionSignal() || [];
    const item = tabla.find((item: any) => item.categoria && item.categoria.toString().toLowerCase() === 'ocupado');
    if (!item) return '____';
    const total = this.totalCondicionSignal();
    if (total === 0) return '0,00 %';
    const casos = Number(item.casos) || 0;
    return this.formatearPorcentaje((casos / total) * 100);
  });

  readonly porcentajePisosTierraSignal: Signal<string> = computed(() => {
    const tabla = this.materialesViviendaSignal() || [];
    const item = tabla.find((item: any) => item.categoria && item.categoria.toString().toLowerCase().includes('piso') && item.tipoMaterial && item.tipoMaterial.toString().toLowerCase().includes('tierra'));
    return item?.porcentaje || '____';
  });

  readonly porcentajePisosCementoSignal: Signal<string> = computed(() => {
    const tabla = this.materialesViviendaSignal() || [];
    const item = tabla.find((item: any) => item.categoria && item.categoria.toString().toLowerCase().includes('piso') && item.tipoMaterial && item.tipoMaterial.toString().toLowerCase().includes('cemento'));
    return item?.porcentaje || '____';
  });

  readonly fotoEstructuraSignal: Signal<FotoItem[]> = computed(() => {
    const data = this.formDataSignal() || {};
    const centroPobladoAISI = data['centroPobladoAISI'] || '____';
    const titulo = data?.['fotografiaEstructuraAISITitulo'] || 'Estructura de las viviendas en el CP ' + centroPobladoAISI;
    const fuente = data?.['fotografiaEstructuraAISIFuente'] || 'GEADES, 2024';
    const imagen = data?.['fotografiaEstructuraAISIImagen'] || '';
    if (!imagen) return [];
    return [{ titulo, fuente, imagen }];
  });

  // Final unified viewModel exposing ONLY computed values and signals (no methods in template)
  readonly viewModel = computed(() => ({
    // texts
    textoVivienda: this.textoViviendaSignal(),
    textoOcupacion: this.textoOcupacionSignal(),
    textoEstructura: this.textoEstructuraSignal(),

    // raw fields mirrored
    centroPobladoAISI: this.formDataSignal()?.['centroPobladoAISI'] || 'Cahuacho',
    cuadroTituloTiposVivienda: this.formDataSignal()?.['cuadroTituloTiposVivienda'] || '',
    cuadroFuenteTiposVivienda: this.formDataSignal()?.['cuadroFuenteTiposVivienda'] || '',
    cuadroTituloCondicionOcupacion: this.formDataSignal()?.['cuadroTituloCondicionOcupacion'] || '',
    cuadroFuenteCondicionOcupacion: this.formDataSignal()?.['cuadroFuenteCondicionOcupacion'] || '',
    cuadroTituloMaterialesVivienda: this.formDataSignal()?.['cuadroTituloMaterialesVivienda'] || '',
    cuadroFuenteMaterialesVivienda: this.formDataSignal()?.['cuadroFuenteMaterialesVivienda'] || '',

    // tables and computed versions
    tiposVivienda: this.tiposViviendaSignal(),
    tiposViviendaConPorcentajes: this.tiposViviendaConPorcentajes(),

    condicionOcupacion: this.condicionOcupacionSignal(),
    condicionOcupacionConPorcentajes: this.condicionOcupacionConPorcentajes(),

    materiales: this.materialesViviendaSignal(),
    materialesConPorcentajes: this.materialesConPorcentajes(),

    // derived values
    totalViviendas: this.totalViviendasSignal(),
    totalCondicion: this.totalCondicionSignal(),
    porcentajeOcupadasPresentes: this.porcentajeOcupadasPresentesSignal(),
    porcentajePisosTierra: this.porcentajePisosTierraSignal(),
    porcentajePisosCemento: this.porcentajePisosCementoSignal(),

    // photos
    fotos: this.getFotografiasVista(this.PHOTO_PREFIX),
    fotoEstructura: this.fotoEstructuraSignal()
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private tableNumberingService: TableNumberingService) {
    super(cdRef, injector);
    // Inicializar PHOTO_PREFIX dinámicamente basado en el grupo actual
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';

    effect(() => {
      const data = this.formDataSignal();
      // Merge instead of replace: keep existing datos when selector is empty (fallback to BaseSectionComponent data)
      if (data && Object.keys(data).length > 0) {
        this.datos = { ...this.datos, ...data };
      }
      // Aplicar valores con prefijo después del merge (leer del signal, no de this.datos)
      const centroPrefijado = PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId);
      if (centroPrefijado) {
        this.datos.centroPobladoAISI = centroPrefijado;
      }
      this.cdRef.markForCheck();
    });

    effect(() => {
      // Recompute fotos when photo fields change
      this.photoFieldsHash();

      // Leer y loguear tablas para diagnóstico (prefer table store signals)
      const tipos = this.tiposViviendaSignal();
      const condicion = this.condicionOcupacionSignal();
      const materiales = this.materialesViviendaSignal();

      const fotos = this.fotosSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasCache();
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  private generarTextoViviendaDefault(): string {
    const data = this.formDataSignal() || {};
    const centroPoblado = data['centroPobladoAISI'] || 'Cahuacho';
    const totalViviendas = this.totalViviendasSignal();
    return `Según los Censos Nacionales 2017, en el CP ${centroPoblado} se hallan un total de ${totalViviendas} viviendas empadronadas. El único tipo de vivienda existente es la casa independiente, pues representa el 100,0 % del conjunto.`;
  }

  private generarTextoOcupacionDefault(): string {
    return 'Texto por defecto — ocupación de vivienda.';
  }

  private generarTextoEstructuraDefault(): string {
    return 'Texto por defecto — estructura.';
  }

  private formatearPorcentaje(num: number): string {
    return num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  }

  obtenerNumeroCuadroTiposVivienda(): string {
    return this.tableNumberingService.getGlobalTableNumber(this.seccionId, 0);
  }

  obtenerNumeroCuadroCondicionOcupacion(): string {
    return this.tableNumberingService.getGlobalTableNumber(this.seccionId, 1);
  }

  obtenerNumeroCuadroMateriales(): string {
    return this.tableNumberingService.getGlobalTableNumber(this.seccionId, 2);
  }

  // --- Computed signals for preview (MODO IDEAL) ---
  readonly tiposViviendaConPorcentajes = computed(() => {
    const tabla = this.tiposViviendaSignal() || [];
    const cuadro = this.tableNumberingService.getGlobalTableNumber(this.seccionId, 0);
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
  });

  readonly condicionOcupacionConPorcentajes = computed(() => {
    const tabla = this.condicionOcupacionSignal() || [];
    const cuadro = this.tableNumberingService.getGlobalTableNumber(this.seccionId, 1);
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
  });

  readonly materialesConPorcentajes = computed(() => {
    const tabla = this.materialesViviendaSignal() || [];
    const cuadro = this.tableNumberingService.getGlobalTableNumber(this.seccionId, 2);
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
  });

  readonly totalViviendasSignal = computed(() => {
    const tabla = this.tiposViviendaSignal() || [];
    const filtered = tabla.filter((item: any) => !item.categoria || !item.categoria.toString().toLowerCase().includes('total'));
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  });

  readonly totalCondicionSignal = computed(() => {
    const tabla = this.condicionOcupacionSignal() || [];
    const filtered = tabla.filter((item: any) => !item.categoria || !item.categoria.toString().toLowerCase().includes('total'));
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  });

  readonly fotosSignal = computed(() => this.getFotografiasVista(this.PHOTO_PREFIX));
}
