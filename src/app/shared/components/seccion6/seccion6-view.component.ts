import { Component, Input, ChangeDetectorRef, OnDestroy, Injector, ChangeDetectionStrategy, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { FotoItem } from '../image-upload/image-upload.component';
import { SECCION6_COLUMNAS_POBLACION_SEXO, SECCION6_COLUMNAS_POBLACION_ETARIO, SECCION6_TABLA_POBLACION_SEXO_CONFIG, SECCION6_TABLA_POBLACION_ETARIO_CONFIG, SECCION6_TEMPLATES, SECCION6_CONFIG, SECCION6_WATCHED_FIELDS } from './seccion6-constants';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { debugLog } from 'src/app/shared/utils/debug';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
  standalone: true,
  imports: [CommonModule, CoreSharedModule],
  selector: 'app-seccion6-view',
  templateUrl: './seccion6-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion6ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION6_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = false;
  
  // ✅ Hacer TEMPLATES accesible en template
  readonly SECCION6_TEMPLATES = SECCION6_TEMPLATES;
  
  override readonly PHOTO_PREFIX = SECCION6_CONFIG.photoPrefix;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION6_WATCHED_FIELDS;
  fotografiasVista: FotoItem[] = [];

  // ✅ Signal de prefijo de grupo AISD
  readonly prefijoGrupoSignal: Signal<string> = computed(() => this.obtenerPrefijoGrupo());

  poblacionSexoConfig: TableConfig = SECCION6_TABLA_POBLACION_SEXO_CONFIG;
  poblacionEtarioConfig: TableConfig = SECCION6_TABLA_POBLACION_ETARIO_CONFIG;
  poblacionSexoColumns = SECCION6_COLUMNAS_POBLACION_SEXO;
  poblacionEtarioColumns = SECCION6_COLUMNAS_POBLACION_ETARIO;

  readonly vistDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly vistTextoPoblacionSexoSignal: Signal<string> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.vistDataSignal();
    
    // ✅ Prioridad: leer valor manual si existe (con prefijo y sin prefijo)
    const manualKey = `textoPoblacionSexoAISD${prefijo}`;
    const manual = data[manualKey];
    
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    
    const nombreComunidad = this.obtenerNombreComunidadActual();
    return this.obtenerTextoPoblacionSexo(data, nombreComunidad);
  });

  readonly vistTextoPoblacionEtarioSignal: Signal<string> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.vistDataSignal();
    
    // ✅ Prioridad: leer valor manual si existe (con prefijo y sin prefijo)
    const manualKey = `textoPoblacionEtarioAISD${prefijo}`;
    const manual = data[manualKey];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    
    const nombreComunidad = this.obtenerNombreComunidadActual();
    return this.obtenerTextoPoblacionEtario(data, nombreComunidad);
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const prefix = this.PHOTO_PREFIX;
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `${prefix}${i}Titulo${prefijo}`;
      const fuenteKey = `${prefix}${i}Fuente${prefijo}`;
      const imagenKey = `${prefix}${i}Imagen${prefijo}`;
      
      const titulo = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, imagenKey)();
      
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    // Seccion6TableConfigService eliminado - configs ahora son constantes
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);
    // Configs ya inicializadas como propiedades de clase

    effect(() => {
      const vistData = this.vistDataSignal();
      this.datos = { ...vistData };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2: Monitorear cambios de fotografías y sincronizar
    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.fotografiasVista = [...this.fotografiasCache];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    this.fotografiasVista = [...this.fotografiasCache];
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  override obtenerNombreComunidadActual(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // ✅ NUEVO: Usar aisdGroups() signal para obtener el nombre del grupo actual
    if (prefijo && prefijo.startsWith('_A')) {
      const match = prefijo.match(/_A(\d+)/);
      if (match) {
        const index = parseInt(match[1]) - 1; // _A1 → índice 0, _A2 → índice 1
        const grupos = this.aisdGroups();
        if (grupos && grupos[index]?.nombre) {
          return grupos[index].nombre;
        }
      }
    }
    
    const datos = this.vistDataSignal();
    
    // Fallback: buscar en datos guardados
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(datos, 'grupoAISD', this.seccionId);
    if (grupoAISD && grupoAISD.trim() !== '') {
      return grupoAISD;
    }
    
    const grupoConSufijo = prefijo ? datos[`grupoAISD${prefijo}`] : null;
    if (grupoConSufijo && grupoConSufijo.trim() !== '') {
      return grupoConSufijo;
    }
    
    if (datos['comunidadesCampesinas'] && Array.isArray(datos['comunidadesCampesinas']) && datos['comunidadesCampesinas'].length > 0) {
      const primerCC = datos['comunidadesCampesinas'][0];
      if (primerCC && primerCC['nombre'] && primerCC['nombre'].trim() !== '') {
        return primerCC['nombre'];
      }
    }
    
    return '____';
  }

  override obtenerValorConPrefijo(campo: string): any {
    const datos = this.vistDataSignal();
    return PrefijoHelper.obtenerValorConPrefijo(datos, campo, this.seccionId);
  }

  obtenerTextoPoblacionSexoView(): string {
    const texto = this.vistTextoPoblacionSexoSignal();
    const nombreComunidad = this.obtenerNombreComunidadActual();
    if (texto && texto.trim() !== '' && texto !== '____') {
      return texto.replace(/___/g, nombreComunidad);
    }
    return this.obtenerTextoPoblacionSexo(this.vistDataSignal(), nombreComunidad);
  }

  obtenerTextoPoblacionEtarioView(): string {
    const texto = this.vistTextoPoblacionEtarioSignal();
    const nombreComunidad = this.obtenerNombreComunidadActual();
    if (texto && texto.trim() !== '' && texto !== '____') {
      return texto.replace(/___/g, nombreComunidad);
    }
    return this.obtenerTextoPoblacionEtario(this.vistDataSignal(), nombreComunidad);
  }

  getPoblacionSexoConPorcentajes(): any[] {
    return this.getTablaSexo();
  }

  getPoblacionEtarioConPorcentajes(): any[] {
    return this.getTablaEtario();
  }

  private getTablaSexo(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    
    const tablaConPrefijo = prefijo ? this.datos[`poblacionSexoAISD${prefijo}`] : null;
    if (tablaConPrefijo && this.tieneContenidoRealDemografia(tablaConPrefijo)) {
      return tablaConPrefijo;
    }
    
    if (this.datos.poblacionSexoAISD && this.tieneContenidoRealDemografia(this.datos.poblacionSexoAISD)) {
      return this.datos.poblacionSexoAISD;
    }
    
    if (this.datos.poblacionSexoTabla && this.tieneContenidoRealDemografia(this.datos.poblacionSexoTabla)) {
      return this.datos.poblacionSexoTabla;
    }
    
    return [];
  }

  private getTablaEtario(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    
    const tablaConPrefijo = prefijo ? this.datos[`poblacionEtarioAISD${prefijo}`] : null;
    if (tablaConPrefijo && this.tieneContenidoRealDemografia(tablaConPrefijo)) {
      return tablaConPrefijo;
    }
    
    if (this.datos.poblacionEtarioAISD && this.tieneContenidoRealDemografia(this.datos.poblacionEtarioAISD)) {
      return this.datos.poblacionEtarioAISD;
    }
    
    if (this.datos.poblacionEtarioTabla && this.tieneContenidoRealDemografia(this.datos.poblacionEtarioTabla)) {
      return this.datos.poblacionEtarioTabla;
    }
    
    return [];
  }

  private tieneContenidoRealDemografia(tabla: any[]): boolean {
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) return false;
    return tabla.some(item => {
      const sexo = item.sexo?.toString().trim() || '';
      const categoria = item.categoria?.toString().trim() || '';
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sexo !== '' || categoria !== '' || casos > 0;
    });
  }

  getTotalPoblacionSexo(): number {
    const tablaSexo = this.getTablaSexo();
    if (!tablaSexo || !Array.isArray(tablaSexo) || tablaSexo.length === 0) {
      return 0;
    }
    
    return tablaSexo.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
  }

  getTotalPoblacionEtario(): number {
    const tablaEtario = this.getTablaEtario();
    if (!tablaEtario || !Array.isArray(tablaEtario) || tablaEtario.length === 0) {
      return 0;
    }
    
    return tablaEtario.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
  }

  getPorcentajeTotalPoblacionSexo(): string {
    const total = this.getTotalPoblacionSexo();
    return total === 0 ? '0,00 %' : '100,00 %';
  }

  getPorcentajeTotalPoblacionEtario(): string {
    const total = this.getTotalPoblacionEtario();
    return total === 0 ? '0,00 %' : '100,00 %';
  }

  // ✅ OVERRIDE CRÍTICO: cargarFotografias() DEBE LEER DEL SIGNAL REACTIVO (vistDataSignal)
  override cargarFotografias(): void {
    const formData = this.vistDataSignal();
    const prefijo = this.prefijoGrupoSignal();
    const fotos: FotoItem[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`;
      const imagen = formData[imagenKey];
      
      if (imagen) {
        const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`;
        const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`;
        const numeroKey = `${this.PHOTO_PREFIX}${i}Numero${prefijo}`;
        
        fotos.push({
          imagen: imagen,
          titulo: formData[tituloKey] || '',
          fuente: formData[fuenteKey] || '',
          numero: formData[numeroKey] || i
        });
      }
    }
    
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    this.fotografiasVista = [...this.fotografiasCache];
    this.cdRef.markForCheck();
  }

  // ✅ MÉTODOS INLINE DE TEXTO (usando TEMPLATES)
  obtenerTextoPoblacionSexo(datos: any, nombreComunidad: string): string {
    const textoPersonalizado = PrefijoHelper.obtenerValorConPrefijo(datos, 'textoPoblacionSexoAISD', this.seccionId);
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado.replace(/{COMUNIDAD}/g, nombreComunidad || '____');
    }
    return SECCION6_TEMPLATES.textoPoblacionSexoDefault.replace(/{COMUNIDAD}/g, nombreComunidad || '____');
  }

  obtenerTextoPoblacionEtario(datos: any, nombreComunidad: string): string {
    const textoPersonalizado = PrefijoHelper.obtenerValorConPrefijo(datos, 'textoPoblacionEtarioAISD', this.seccionId);
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado.replace(/{COMUNIDAD}/g, nombreComunidad || '____');
    }
    return SECCION6_TEMPLATES.textoPoblacionEtarioDefault.replace(/{COMUNIDAD}/g, nombreComunidad || '____');
  }
}

