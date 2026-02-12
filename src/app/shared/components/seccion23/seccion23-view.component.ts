import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { GlobalNumberingService } from 'src/app/core/services/global-numbering.service';

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

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  readonly photoPrefixSignal: Signal<string>;
  
  // ✅ NUMERACIÓN GLOBAL
  readonly globalTableNumberSignal: Signal<string>;
  readonly globalTableNumberSignal2: Signal<string>;
  readonly globalTableNumberSignal3: Signal<string>;
  readonly globalPhotoNumbersSignal: Signal<string[]>;
  
  override readonly PHOTO_PREFIX: string;
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

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private globalNumbering: GlobalNumberingService) {
    super(cdRef, injector);
    
    // ✅ Crear Signal para PHOTO_PREFIX dinámico
    this.photoPrefixSignal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const prefix = prefijo ? `fotografiaPEA${prefijo}` : 'fotografiaPEA';
      console.debug(`[SECCION23-VIEW] photoPrefixSignal: ${prefix}`);
      return prefix;
    });
    
    // Inicializar PHOTO_PREFIX para compatibilidad (usar el valor del signal)
    const prefijoInit = this.photoPrefixSignal();
    this.PHOTO_PREFIX = prefijoInit;
    
    // ✅ Signal para número global de tabla (primera tabla: petGruposEdadAISI)
    this.globalTableNumberSignal = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
      console.debug(`[SECCION23-VIEW] globalTableNumberSignal: Cuadro N° ${globalNum}`);
      return globalNum;
    });
    
    // ✅ Signal para número global de tabla (segunda tabla: peaDistritoSexoTabla)
    this.globalTableNumberSignal2 = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
      console.debug(`[SECCION23-VIEW] globalTableNumberSignal2: Cuadro N° ${globalNum}`);
      return globalNum;
    });
    
    // ✅ Signal para número global de tabla (tercera tabla: peaOcupadaDesocupadaTabla)
    this.globalTableNumberSignal3 = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 2);
      console.debug(`[SECCION23-VIEW] globalTableNumberSignal3: Cuadro N° ${globalNum}`);
      return globalNum;
    });
    
    // ✅ Signal para números globales de fotos
    this.globalPhotoNumbersSignal = computed(() => {
      const prefix = this.photoPrefixSignal();
      const fotos = this.fotosCacheSignal();
      console.log(`[SECCION23-VIEW] 📷 Calculando fotos para ${this.seccionId}`);
      console.log(`[SECCION23-VIEW]   prefix: ${prefix}, fotos.length: ${fotos.length}`);
      
      const photoNumbers = fotos.map((_, index) => {
        const globalNum = this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index);
        console.log(`[SECCION23-VIEW]   foto ${index}: ${globalNum}`);
        return globalNum;
      });
      
      console.log(`[SECCION23-VIEW] globalPhotoNumbersSignal: ${photoNumbers.join(', ')}`);
      return photoNumbers;
    });

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

  getPorcentajePET(): string {
    const tabla = this.petGruposEdadSignal();
    if (!tabla || !Array.isArray(tabla)) return '';
    const total = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('total'));
    return total?.porcentaje || '';
  }

  getPorcentajeGrupoPET(grupo: string): string {
    const tabla = this.petGruposEdadSignal();
    if (!tabla || !Array.isArray(tabla)) return '';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes(grupo.toLowerCase()));
    return item?.porcentaje || '';
  }

  getPorcentajePEA(): string {
    const tabla = this.peaDistritoSexoSignal();
    if (!tabla || !Array.isArray(tabla)) return '';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no pea'));
    return item?.porcentaje || '';
  }

  getPorcentajeNoPEA(): string {
    const tabla = this.peaDistritoSexoSignal();
    if (!tabla || !Array.isArray(tabla)) return '';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('no pea'));
    return item?.porcentaje || '';
  }

  getPorcentajeHombresPEA(): string {
    const tabla = this.peaDistritoSexoSignal();
    if (!tabla || !Array.isArray(tabla)) return '';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no pea'));
    return item?.porcentajeHombres || '';
  }

  getPorcentajeMujeresNoPEA(): string {
    const tabla = this.peaDistritoSexoSignal();
    if (!tabla || !Array.isArray(tabla)) return '';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('no pea'));
    return item?.porcentajeMujeres || '';
  }

  // Textos para template
  obtenerTextoPETIntro(): string {
    const data = this.formDataSignal();
    return data['textoPETIntro_AISI'] || 'La población cumplida de 14 años de edad, se encuentra en edad de trabajar...';
  }

  obtenerTextoPET(): string {
    const data = this.formDataSignal();
    return data['textoPET_AISI'] || '';
  }

  obtenerTextoIndicadoresDistritales(): string {
    const data = this.formDataSignal();
    return data['textoIndicadoresDistritalesAISI'] || '';
  }

  obtenerTextoPEA(): string {
    const data = this.formDataSignal();
    return data['textoPEA_AISI'] || '';
  }

  obtenerCentroPoblado(): string {
    const data = this.formDataSignal();
    return data['centroPobladoAISI'] || 'Cahuacho';
  }

  obtenerDistrito(): string {
    const data = this.formDataSignal();
    return data['distritoSeleccionado'] || 'Cahuacho';
  }

  obtenerPoblacionDistrital(): string {
    const data = this.formDataSignal();
    return data['poblacionDistritalAISI'] || '';
  }

  obtenerPETDistrital(): string {
    const data = this.formDataSignal();
    return data['petDistritalAISI'] || '';
  }

  override ngOnDestroy(): void { super.ngOnDestroy(); }

  getPetGruposEdadAISIConPorcentajes(): any[] {
    return TablePercentageHelper.calcularPorcentajesSimple(this.petGruposEdadSignal(), '');
  }

  getPeaDistritoSexoConPorcentajes(): any[] {
    return TablePercentageHelper.calcularPorcentajesMultiples(this.peaDistritoSexoSignal(), '');
  }

  getPeaOcupadaDesocupadaConPorcentajes(): any[] {
    return TablePercentageHelper.calcularPorcentajesMultiples(this.peaOcupadaDesocupadaSignal(), '');
  }


  getIngresoPerCapita(): string {
    const v = this.formDataSignal()?.['ingresoPerCapita'] ?? null;
    if (v === null || v === undefined || v === '') return '____';
    const num = typeof v === 'number' ? v : parseFloat(String(v)) || 0;
    return num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getRankingIngreso(): string {
    return this.formDataSignal()?.['rankingIngreso'] ?? '____';
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

  getPoblacionDistritalFn(): string {
    const data = this.formDataSignal();
    return data?.['poblacionDistritalAISI'] || '____';
  }

  getPETDistrital(): string {
    const data = this.formDataSignal();
    return data?.['petDistritalAISI'] || '';
  }
}

