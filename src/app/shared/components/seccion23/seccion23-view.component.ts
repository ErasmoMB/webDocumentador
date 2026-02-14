import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { SECCION23_TEMPLATES, SECCION23_WATCHED_FIELDS, SECCION23_SECTION_ID } from './seccion23-constants';

@Component({
  selector: 'app-seccion23-view',
  templateUrl: './seccion23-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule, GenericTableComponent],
  standalone: true
})
export class Seccion23ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION23_SECTION_ID;
  @Input() override modoFormulario: boolean = false;

  // ✅ Exportar TEMPLATES para usar en HTML
  readonly SECCION23_TEMPLATES = SECCION23_TEMPLATES;

  // Campos observados para sincronización reactiva (se expande con prefijos automáticamente)
  override watchedFields: string[] = SECCION23_WATCHED_FIELDS;

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
      return prefix;
    });
    
    // Inicializar PHOTO_PREFIX para compatibilidad (usar el valor del signal)
    const prefijoInit = this.photoPrefixSignal();
    this.PHOTO_PREFIX = prefijoInit;
    
    // ✅ Signal para número global de tabla (primera tabla: petGruposEdadAISI)
    this.globalTableNumberSignal = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
      return globalNum;
    });
    
    // ✅ Signal para número global de tabla (segunda tabla: peaDistritoSexoTabla)
    this.globalTableNumberSignal2 = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
      return globalNum;
    });
    
    // ✅ Signal para número global de tabla (tercera tabla: peaOcupadaDesocupadaTabla)
    this.globalTableNumberSignal3 = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 2);
      return globalNum;
    });
    
    // ✅ Signal para números globales de fotos
    this.globalPhotoNumbersSignal = computed(() => {
      const prefix = this.photoPrefixSignal();
      const fotos = this.fotosCacheSignal();
      
      const photoNumbers = fotos.map((_, index) => {
        const globalNum = this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index);
        return globalNum;
      });
      
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

  obtenerTituloTabla(fieldName: string, defaultTitle: string): string {
    const valor = this.datos?.[fieldName];
    if (!valor || typeof valor !== 'string') return defaultTitle;
    const texto = valor.trim();
    if (!texto || this.tienePlaceholder(texto)) return defaultTitle;
    const limpio = this.eliminarNumeroCuadro(texto);
    return limpio || defaultTitle;
  }

  private eliminarNumeroCuadro(titulo: string): string {
    return titulo.replace(/^Cuadro\s+N[º°]\s*[\d\.]+(?:[\s:\-–—]+)?/i, '').trim();
  }

  tienePlaceholder(texto: string | null | undefined): boolean {
    return !!texto && /_{4,}/.test(texto);
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
    const texto = this.datos.textoPETIntro_AISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    return SECCION23_TEMPLATES.petIntroDefault;
  }

  obtenerTextoPET(): string {
    const texto = this.datos.textoPET_AISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const centroPoblado = this.obtenerNombreCentroPobladoActual();
    const porcentajePET = this.getPorcentajePET();
    const porcentaje4564 = this.getPorcentajeGrupoPET('45 a 64');
    const porcentaje65 = this.getPorcentajeGrupoPET('65');
    return SECCION23_TEMPLATES.petCompleteTemplateWithVariables
      .replace('{{centroPoblado}}', centroPoblado)
      .replace('{{porcentajePET}}', porcentajePET)
      .replace('{{porcentaje4564}}', porcentaje4564)
      .replace('{{porcentaje65}}', porcentaje65);
  }

  obtenerTextoIndicadoresDistritales(): string {
    const texto = this.datos.textoIndicadoresDistritalesAISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const distrito = this.obtenerNombreDistritoActual();
    const poblacionDistrital = this.getPoblacionDistritalFn();
    const petDistrital = this.getPETDistrital();
    return SECCION23_TEMPLATES.indicadoresDistritalesTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{poblacionDistrital}}', poblacionDistrital)
      .replace('{{petDistrital}}', petDistrital);
  }

  obtenerTextoPEA(): string {
    const texto = this.datos.textoPEA_AISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const distrito = this.obtenerNombreDistritoActual();
    const centroPoblado = this.obtenerNombreCentroPobladoActual();
    return SECCION23_TEMPLATES.peaCompleteTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{centroPoblado}}', centroPoblado);
  }

  obtenerTextoAnalisisPEA_AISI(): string {
    const texto = this.datos.textoAnalisisPEA_AISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const distrito = this.obtenerNombreDistritoActual();
    return SECCION23_TEMPLATES.peaAnalisisTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{porcentajePEA}}', this.getPorcentajePEA())
      .replace('{{porcentajeNoPEA}}', this.getPorcentajeNoPEA())
      .replace('{{porcentajeHombresPEA}}', this.getPorcentajeHombresPEA())
      .replace('{{porcentajeMujeresNoPEA}}', this.getPorcentajeMujeresNoPEA());
  }

  obtenerTextoEmpleoAISI(): string {
    const texto = this.datos.textoEmpleoAISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const distrito = this.obtenerNombreDistritoActual();
    return SECCION23_TEMPLATES.empleoSituacionDefault.replace('{{distrito}}', distrito);
  }

  obtenerTextoEmpleoDependiente_AISI(): string {
    const texto = this.datos.textoEmpleoDependiente_AISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    return SECCION23_TEMPLATES.empleoDependienteDefault;
  }

  obtenerTextoIngresosAISI(): string {
    const texto = this.datos.textoIngresosAISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const distrito = this.obtenerNombreDistritoActual();
    const centroPoblado = this.obtenerNombreCentroPobladoActual();
    const ingresoPerCapita = this.getIngresoPerCapita();
    const rankingIngreso = this.getRankingIngreso();
    return SECCION23_TEMPLATES.ingresosTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{centroPoblado}}', centroPoblado)
      .replace('{{ingresoPerCapita}}', ingresoPerCapita)
      .replace('{{rankingIngreso}}', rankingIngreso);
  }

  obtenerTextoIndiceDesempleoAISI(): string {
    const texto = this.datos.textoIndiceDesempleoAISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const distrito = this.obtenerNombreDistritoActual();
    const centroPoblado = this.obtenerNombreCentroPobladoActual();
    return SECCION23_TEMPLATES.indiceDesempleoTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{centroPoblado}}', centroPoblado);
  }

  obtenerTextoPEAAISI(): string {
    const texto = this.datos.textoPEAAISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const distrito = this.obtenerNombreDistritoActual();
    return SECCION23_TEMPLATES.peaOcupadaDesocupadaTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{porcentajeDesempleo}}', this.getPorcentajeDesempleo())
      .replace('{{porcentajeHombres}}', this.getPorcentajeHombresOcupados())
      .replace('{{porcentajeMujeres}}', this.getPorcentajeMujeresOcupadas());
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
    return this.petGruposEdadSignal();
  }

  getPeaDistritoSexoConPorcentajes(): any[] {
    return this.peaDistritoSexoSignal();
  }

  getPeaOcupadaDesocupadaConPorcentajes(): any[] {
    return this.peaOcupadaDesocupadaSignal();
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
    const rows = this.peaOcupadaDesocupadaSignal() || [];
    const item = rows.find((r: any) => r.categoria && r.categoria.toLowerCase().includes('desocup'));
    return item?.porcentaje || '';
  }

  getPorcentajeHombresOcupados(): string {
    const rows = this.peaOcupadaDesocupadaSignal() || [];
    const item = rows.find((r: any) => r.categoria && r.categoria.toLowerCase().includes('ocup'));
    return item?.porcentajeHombres || '';
  }

  getPorcentajeMujeresOcupadas(): string {
    const rows = this.peaOcupadaDesocupadaSignal() || [];
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

