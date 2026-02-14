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

  // ✅ TABLAS DE SOLO LECTURA - DATOS DEL BACKEND SIN MODIFICACIÓN
  readonly condicionOcupacionConPorcentajesSignal: Signal<any[]> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `condicionOcupacionTabla${prefijo}` : 'condicionOcupacionTabla';
    
    // Intentar con prefijo primero, luego fallback sin prefijo
    const datosConPrefijo = prefijo ? this.projectFacade.selectField(this.seccionId, null, tablaKey)() : null;
    if (datosConPrefijo && this.tieneContenidoReal(datosConPrefijo)) {
      return datosConPrefijo;
    }
    
    // Fallback a versión sin prefijo
    return this.projectFacade.selectField(this.seccionId, null, 'condicionOcupacionTabla')() || [];
  });

  // ✅ TABLAS DE SOLO LECTURA - DATOS DEL BACKEND SIN MODIFICACIÓN
  readonly tiposMaterialesSignal: Signal<any[]> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `tiposMaterialesTabla${prefijo}` : 'tiposMaterialesTabla';
    
    // Intentar con prefijo primero, luego fallback sin prefijo  
    const datosConPrefijo = prefijo ? this.projectFacade.selectField(this.seccionId, null, tablaKey)() : null;
    if (datosConPrefijo && this.tieneContenidoReal(datosConPrefijo)) {
      return datosConPrefijo;
    }
    
    // Fallback a versión sin prefijo
    return this.projectFacade.selectField(this.seccionId, null, 'tiposMaterialesTabla')() || [];
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
      this.tiposMaterialesSignal();
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

  // ============================================================================
  // ✅ MÉTODOS PATRÓN SOLO LECTURA - GETTER PARA VISTA  
  // ============================================================================

  /**
   * Obtener datos de Condición de Ocupación para mostar en vista
   */
  getCondicionOcupacionData(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaConPrefijo = prefijo ? this.datos[`condicionOcupacionTabla${prefijo}`] : null;
    if (tablaConPrefijo && this.tieneContenidoReal(tablaConPrefijo)) {
      return tablaConPrefijo;
    }
    return this.datos.condicionOcupacionTabla || [];
  }

  /**
   * Obtener datos de Tipos de Materiales para mostrar en vista
   */
  getTiposMaterialesData(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaConPrefijo = prefijo ? this.datos[`tiposMaterialesTabla${prefijo}`] : null;
    if (tablaConPrefijo && this.tieneContenidoReal(tablaConPrefijo)) {
      return tablaConPrefijo;
    }
    return this.datos.tiposMaterialesTabla || [];
  }

  /**
   * Helper para verificar si una tabla tiene contenido real (no datos de ejemplo)
   */
  private tieneContenidoReal(tabla: any[]): boolean {
    if (!Array.isArray(tabla) || tabla.length === 0) {
      return false;
    }
    
    // Verificar que al menos un elemento tenga casos > 0
    return tabla.some(item => {
      const casos = parseFloat(item.casos) || 0;
      return casos > 0;
    });
  }

  // ✅ MÉTODOS PARA ROWSPAN EN TABLAS AGRUPADAS EN VISTA

  /**
   * Calcula el rowspan para categoría en tabla de tipos de materiales
   */
  getRowspanTiposMateriales(rowIndex: number): number {
    const data = this.getTiposMaterialesData();
    if (!data || rowIndex >= data.length) return 1;
    
    const currentRow = data[rowIndex];
    
    // Si es encabezado de grupo, contar todas las filas hasta el siguiente encabezado
    if (currentRow?.esEncabezadoGrupo) {
      let count = 1;
      for (let i = rowIndex + 1; i < data.length; i++) {
        const nextRow = data[i];
        // Parar si encontramos otro encabezado de grupo
        if (nextRow?.esEncabezadoGrupo) break;
        count++;
      }
      return count;
    }
    
    return 1;
  }

  /**
   * Determina si mostrar la celda de categoría (solo para encabezados de grupo)
   */
  shouldShowCategoriaCellTiposMateriales(rowIndex: number): boolean {
    const data = this.getTiposMaterialesData();
    if (!data || rowIndex >= data.length) return true;
    
    const currentRow = data[rowIndex];
    
    // Solo mostrar celda para encabezados de grupo
    return !!currentRow?.esEncabezadoGrupo;
  }

  /**
   * Obtiene las clases CSS para filas agrupadas
   */
  getRowClassesTiposMateriales(item: any): string {
    const classes: string[] = [];
    
    if (item?.esEncabezadoGrupo) {
      classes.push('fila-encabezado-grupo');
    }
    
    if (item?.esSubcategoria) {
      classes.push('fila-subcategoria');
    }
    
    if (item?.esTotalGrupo) {
      classes.push('fila-total');
    }
    
    return classes.join(' ');
  }

  /**
   * Helper interno - obtener prefijo de grupo
   */
  protected override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
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

  /**
   * ✅ Helper para templates - retorna prefijo de grupo para uso en HTML
   */
  obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }
}
