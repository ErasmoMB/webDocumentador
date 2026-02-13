import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import {
  SECCION9_WATCHED_FIELDS,
  SECCION9_CONFIG,
  SECCION9_TEMPLATES,
  SECCION9_PLANTILLAS_DINAMICAS
} from './seccion9-constants';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CoreSharedModule,
    ImageUploadComponent
  ],
  selector: 'app-seccion9-view',
  templateUrl: './seccion9-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host ::ng-deep .data-manual.has-data,
    :host ::ng-deep .data-section.has-data {
      background-color: transparent !important;
      padding: 0 !important;
      border-radius: 0 !important;
      font-weight: normal !important;
      color: inherit !important;
    }
  `]
})
export class Seccion9ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION9_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = false;
  
  // ✅ Hacer TEMPLATES accesible en template
  readonly SECCION9_TEMPLATES = SECCION9_TEMPLATES;

  override readonly PHOTO_PREFIX = SECCION9_CONFIG.photoPrefix;
  
  override fotografiasCache: FotoItem[] = [];

  override watchedFields: string[] = SECCION9_WATCHED_FIELDS;

  // ✅ SIGNAL PRINCIPAL: Lee todos los datos de la sección
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  // ✅ SIGNALS DERIVADOS: Lectura de campos individuales
  readonly grupoAISDSignal: Signal<string> = computed(() => {
    // 1️⃣ Intentar obtener desde campo grupoAISD guardado en la sección
    const guardado = this.projectFacade.selectField(this.seccionId, null, 'grupoAISD')();
    if (guardado && guardado.trim() !== '') {
      return guardado;
    }
    
    // 2️⃣ Intentar desde AISD groups (para secciones con prefijo como _A1, _A2)
    if (this.aisdGroups) {
      const grupos = this.aisdGroups();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      if (prefijo && prefijo.startsWith('_A')) {
        const match = prefijo.match(/_A(\d+)/);
        if (match) {
          const index = parseInt(match[1]) - 1;
          if (grupos && grupos[index]?.nombre) {
            return grupos[index].nombre;
          }
        }
      }
    }
    
    // 3️⃣ Fallback: Intentar obtener desde comunidades campesinas (Sección 1)
    const comunidadesCampesinas = this.projectFacade.selectField('3.1.1', null, 'comunidadesCampesinas')();
    if (comunidadesCampesinas && Array.isArray(comunidadesCampesinas) && comunidadesCampesinas.length > 0) {
      const primerCC = comunidadesCampesinas[0];
      if (primerCC?.nombre?.trim()) {
        return primerCC.nombre;
      }
    }
    
    // 4️⃣ Último recurso
    return '____';
  });

  // ✅ TEXTOS DINÁMICOS: Con sustitución de comunidad
  readonly textoViviendasSignal: Signal<string> = computed(() => {
    const data = this.formDataSignal();
    const guardado = data['textoViviendas'];
    if (guardado && guardado.trim().length > 0) {
      return guardado;
    }
    const comunidad = this.grupoAISDSignal();
    return SECCION9_PLANTILLAS_DINAMICAS.textoViviendasTemplate.replace('__COMUNIDAD__', comunidad);
  });

  readonly textoEstructuraSignal: Signal<string> = computed(() => {
    const data = this.formDataSignal();
    const guardado = data['textoEstructura'];
    if (guardado && guardado.trim().length > 0) {
      return guardado;
    }
    const comunidad = this.grupoAISDSignal();
    return SECCION9_PLANTILLAS_DINAMICAS.textoEstructuraTemplate.replace('__COMUNIDAD__', comunidad);
  });

  // ✅ TABLAS CON CÁLCULOS: Condición de Ocupación
  readonly condicionOcupacionConPorcentajesSignal: Signal<any[]> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `condicionOcupacionTabla${prefijo}` : 'condicionOcupacionTabla';
    let datos = this.projectFacade.selectField(this.seccionId, null, tablaKey)() || [];
    
    if (!Array.isArray(datos) || datos.length === 0) {
      return [];
    }

    const total = datos.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      return datos.map((item: any) => ({ ...item, porcentaje: '____' }));
    }

    const tablaConPorcentajes = datos.map((item: any) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const formateado = porcentaje.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).replace('.', ',') + ' %';
      return { ...item, casos, porcentaje: formateado };
    });

    tablaConPorcentajes.push({
      categoria: 'Total',
      casos: total,
      porcentaje: '100,00 %'
    });

    return tablaConPorcentajes;
  });

  // ✅ TABLAS CON AGRUPACIONES: Tipos de Materiales
  readonly tiposMaterialesAgrupados: Signal<{ [key: string]: any[] }> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `tiposMaterialesTabla${prefijo}` : 'tiposMaterialesTabla';
    const datos = this.projectFacade.selectField(this.seccionId, null, tablaKey)() || [];
    
    const agrupados: { [key: string]: any[] } = {};

    if (Array.isArray(datos)) {
      datos.forEach((item: any) => {
        const categoria = item.categoria || '____';
        if (!agrupados[categoria]) {
          agrupados[categoria] = [];
        }
        agrupados[categoria].push(item);
      });
    }

    return agrupados;
  });

  // ✅ TÍTULOS Y FUENTES: Con fallback a defaults
  readonly tituloCondicionOcupacionSignal: Signal<string> = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tituloKey = prefijo ? `tituloCondicionOcupacion${prefijo}` : 'tituloCondicionOcupacion';
    const titulo = data[tituloKey];
    const comunidad = this.grupoAISDSignal();
    
    return titulo && titulo.trim().length > 0 
      ? titulo 
      : SECCION9_TEMPLATES.tituloDefaultCondicionOcupacion.replace('{comunidad}', comunidad);
  });

  readonly fuenteCondicionOcupacionSignal: Signal<string> = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const fuenteKey = prefijo ? `fuenteCondicionOcupacion${prefijo}` : 'fuenteCondicionOcupacion';
    const fuente = data[fuenteKey];
    
    return fuente && fuente.trim().length > 0
      ? fuente
      : SECCION9_TEMPLATES.fuenteDefaultCondicionOcupacion;
  });

  readonly tituloTiposMaterialesSignal: Signal<string> = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tituloKey = prefijo ? `tituloTiposMateriales${prefijo}` : 'tituloTiposMateriales';
    const titulo = data[tituloKey];
    const comunidad = this.grupoAISDSignal();
    
    return titulo && titulo.trim().length > 0 
      ? titulo 
      : SECCION9_TEMPLATES.tituloDefaultTiposMateriales.replace('{comunidad}', comunidad);
  });

  readonly fuenteTiposMaterialesSignal: Signal<string> = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const fuenteKey = prefijo ? `fuenteTiposMateriales${prefijo}` : 'fuenteTiposMateriales';
    const fuente = data[fuenteKey];
    
    return fuente && fuente.trim().length > 0
      ? fuente
      : SECCION9_TEMPLATES.fuenteDefaultTiposMateriales;
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private globalNumbering: GlobalNumberingService
  ) {
    super(cdRef, injector);

    // ✅ EFFECT: Auto-sync datos generales
    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT: Monitorear fotos y actualizar
    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT: Monitorear cambios en tablas
    effect(() => {
      this.condicionOcupacionConPorcentajesSignal();
      this.tiposMaterialesAgrupados();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  // ✅ HELPER: Obtener categorías de materiales
  getCategoriasMateriales(): string[] {
    const agrupados = this.tiposMaterialesAgrupados();
    return Object.keys(agrupados).filter(cat => cat !== '____');
  }

  // ✅ HELPER: Obtener items de categoría
  getItemsPorCategoria(categoria: string): any[] {
    const agrupados = this.tiposMaterialesAgrupados();
    return agrupados[categoria] || [];
  }

  // ✅ HELPER: Calcular total por categoría
  calcularTotalPorCategoria(categoria: string): number {
    const items = this.getItemsPorCategoria(categoria);
    return items.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);
  }

  // ✅ HELPER: Obtener número de cuadro (ahora usando GlobalNumberingService)
  obtenerNumeroCuadroCondicionOcupacion(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  }

  obtenerNumeroCuadroTiposMateriales(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
  }

  override getFotografiasVista(): FotoItem[] {
    return this.fotografiasCache;
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByCategoria(_: number, cat: string): string {
    return cat;
  }

  /**
   * ✅ Helper para templates - retorna prefijo de grupo para uso en HTML
   */
  obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }
}
