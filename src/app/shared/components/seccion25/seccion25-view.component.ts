import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { SECCION25_TEMPLATES } from './seccion25-constants';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, GenericTableComponent],
  selector: 'app-seccion25-view',
  templateUrl: './seccion25-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion25ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.4';

  // ✅ EXPORTAR TEMPLATES para el HTML
  readonly SECCION25_TEMPLATES = SECCION25_TEMPLATES;

  // ✅ PHOTO_PREFIX como Signal para que se actualice cuando cambie el grupo
  readonly photoPrefixSignal: Signal<string>;
  
  // ✅ NUMERACIÓN GLOBAL
  readonly globalTableNumberSignal: Signal<string>;
  readonly globalTableNumberSignal2: Signal<string>;
  readonly globalTableNumberSignal3: Signal<string>;
  readonly globalPhotoNumbersSignal: Signal<string[]>;
  
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

  // ✅ Signal que SINCRONIZA exactamente con el formulario (datos del backend sin modificar)
  readonly tiposViviendaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `tiposViviendaAISI${prefijo}` : 'tiposViviendaAISI';
    // Leer exactamente los datos del backend - usar selectField como en el formulario
    const data = this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
    return Array.isArray(data) ? data : [];
  });

  // ✅ Signal que SINCRONIZA exactamente con el formulario (datos del backend sin modificar)
  readonly condicionOcupacionSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `condicionOcupacionAISI${prefijo}` : 'condicionOcupacionAISI';
    // Leer exactamente los datos del backend - usar selectField como en el formulario
    const data = this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
    return Array.isArray(data) ? data : [];
  });

  // ✅ Signal que SINCRONIZA exactamente con el formulario (datos del backend sin modificar)
  readonly materialesViviendaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `materialesViviendaAISI${prefijo}` : 'materialesViviendaAISI';
    // Leer exactamente los datos del backend - usar selectField como en el formulario
    const data = this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
    return Array.isArray(data) ? data : [];
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

    // ✅ TABLAS DEL BACKEND - Sin modificaciones ni cálculos
    tiposVivienda: this.tiposViviendaSignal(),
    condicionOcupacion: this.condicionOcupacionSignal(),
    materiales: this.materialesViviendaSignal(),

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

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private globalNumbering: GlobalNumberingService) {
    super(cdRef, injector);
    
    // ✅ Crear Signal para PHOTO_PREFIX dinámico
    this.photoPrefixSignal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const prefix = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';
      return prefix;
    });
    
    // Inicializar PHOTO_PREFIX para compatibilidad
    this.PHOTO_PREFIX = this.photoPrefixSignal();
    
    // ✅ Signal para número global de tabla (primera tabla: tiposViviendaAISI)
    this.globalTableNumberSignal = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
      return globalNum;
    });
    
    // ✅ Signal para número global de tabla (segunda tabla: condicionOcupacionAISI)
    this.globalTableNumberSignal2 = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);

      return globalNum;
    });
    
    // ✅ Signal para número global de tabla (tercera tabla: materialesViviendaAISI)
    this.globalTableNumberSignal3 = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 2);
      return globalNum;
    });
    
    // ✅ Signal para números globales de fotos
    this.globalPhotoNumbersSignal = computed(() => {
      const prefix = this.photoPrefixSignal();
      const fotos = this.fotosSignal();
      const photoNumbers = fotos.map((_, index) => {
        return this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index);
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
    const viviendasOcupadas = this.totalCondicionSignal();
    const porcentajeOcupadas = this.porcentajeOcupadasPresentesSignal();
    return `Para poder describir el acápite de estructura de las viviendas de esta localidad, así como la sección de los servicios básicos, se toma como conjunto total a las viviendas ocupadas con personas presentes que llegan a la cantidad de ${viviendasOcupadas}. A continuación, se muestra el cuadro con la información respecto a la condición de ocupación de viviendas, tal como realiza el Censo Nacional 2017. De aquí se halla que las viviendas ocupadas con personas presentes representan el ${porcentajeOcupadas} del conjunto analizado.`;
  }

  private generarTextoEstructuraDefault(): string {
    const data = this.formDataSignal() || {};
    const centroPoblado = data['centroPobladoAISI'] || 'Cahuacho';
    const porcentajePisosTierra = this.porcentajePisosTierraSignal();
    const porcentajePisosCemento = this.porcentajePisosCementoSignal();
    return `Según la información recabada de los Censos Nacionales 2017, dentro del CP ${centroPoblado}, el único material empleado para la construcción de las paredes de las viviendas es el adobe. Respecto a los techos, también se cuenta con un único material, que son las planchas de calamina, fibra de cemento o similares.\n\nFinalmente, en cuanto a los pisos, la mayoría están hechos de tierra (${porcentajePisosTierra}). El porcentaje restante, que consta del ${porcentajePisosCemento}, cuentan con pisos elaborados a base de cemento.`;
  }

  private formatearPorcentaje(num: number): string {
    return num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  }

  obtenerNumeroCuadroTiposVivienda(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  }

  obtenerNumeroCuadroCondicionOcupacion(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
  }

  obtenerNumeroCuadroMateriales(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 2);
  }

  // ✅ Métodos para agrupar materiales por categoría (con rowspan)
  getMaterialesAgrupados(): any[] {
    return this.materialesViviendaSignal() || [];
  }

  getRowspanMateriales(index: number): number {
    const datos = this.getMaterialesAgrupados();
    if (!datos || datos.length === 0) return 1;
    
    const currentItem = datos[index];
    if (!currentItem) return 1;
    
    // Contar cuántas filas consecutivas tienen la misma categoría
    let rowspan = 1;
    const currentCategoria = currentItem.categoria;
    
    for (let i = index + 1; i < datos.length; i++) {
      if (datos[i].categoria === currentCategoria) {
        rowspan++;
      } else {
        break;
      }
    }
    
    return rowspan;
  }

  shouldShowCategoriaMateriales(index: number): boolean {
    const datos = this.getMaterialesAgrupados();
    if (index === 0) return true;
    
    const currentItem = datos[index];
    const previousItem = datos[index - 1];
    
    // Mostrar categoría solo si es diferente a la anterior
    return currentItem.categoria !== previousItem.categoria;
  }

  // --- Computed signals for preview (MODO IDEAL) ---
  readonly tiposViviendaConPorcentajes = computed(() => {
    const tabla = this.tiposViviendaSignal() || [];
    const cuadro = this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
  });

  readonly condicionOcupacionConPorcentajes = computed(() => {
    const tabla = this.condicionOcupacionSignal() || [];
    const cuadro = this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
  });

  readonly materialesConPorcentajes = computed(() => {
    const tabla = this.materialesViviendaSignal() || [];
    const cuadro = this.globalNumbering.getGlobalTableNumber(this.seccionId, 2);
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
