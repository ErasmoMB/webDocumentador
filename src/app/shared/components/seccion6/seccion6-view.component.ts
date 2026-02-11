import { Component, Input, ChangeDetectorRef, OnDestroy, Injector, ChangeDetectionStrategy, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { FotoItem } from '../image-upload/image-upload.component';
import { Seccion6TableConfigService } from 'src/app/core/services/domain/seccion6-table-config.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TableConfig } from 'src/app/core/services/table-management.service';
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
  @Input() override seccionId: string = '3.1.4.A.1.2';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaDemografia';
  override useReactiveSync: boolean = true;
  fotografiasVista: FotoItem[] = [];

  // ✅ Signal de prefijo de grupo AISD
  readonly prefijoGrupoSignal: Signal<string> = computed(() => this.obtenerPrefijoGrupo());

  override watchedFields: string[] = [
    'grupoAISD'
  ];

  poblacionSexoConfig!: TableConfig;
  poblacionEtarioConfig!: TableConfig;

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
    const prefix = `${this.PHOTO_PREFIX}${prefijo}`;
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `${prefix}${i}Titulo`;
      const fuenteKey = `${prefix}${i}Fuente`;
      const imagenKey = `${prefix}${i}Imagen`;
      
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
    public tableCfg: Seccion6TableConfigService,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);
    this.poblacionSexoConfig = this.tableCfg.getTablaPoblacionSexoConfig();
    this.poblacionEtarioConfig = this.tableCfg.getTablaPoblacionEtarioConfig();

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
    const datos = this.vistDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
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
    const tablaSexo = this.getTablaSexo();
    if (!tablaSexo || !Array.isArray(tablaSexo) || tablaSexo.length === 0) {
      return [];
    }

    const total = tablaSexo.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      return tablaSexo.map((item: any) => ({ ...item, porcentaje: '0,00 %' }));
    }

    const tablaConPorcentajes = tablaSexo.map((item: any) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      return {
        ...item,
        casos,
        porcentaje: porcentajeFormateado
      };
    });

    tablaConPorcentajes.push({
      sexo: 'Total',
      casos: total,
      porcentaje: '100,00 %'
    });

    return tablaConPorcentajes;
  }

  getPoblacionEtarioConPorcentajes(): any[] {
    const tablaEtario = this.getTablaEtario();
    if (!tablaEtario || !Array.isArray(tablaEtario) || tablaEtario.length === 0) {
      return [];
    }

    const total = tablaEtario.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      return tablaEtario.map((item: any) => ({ ...item, porcentaje: '0,00 %' }));
    }

    const tablaConPorcentajes = tablaEtario.map((item: any) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      return {
        ...item,
        casos,
        porcentaje: porcentajeFormateado
      };
    });

    tablaConPorcentajes.push({
      categoria: 'Total',
      casos: total,
      porcentaje: '100,00 %'
    });

    return tablaConPorcentajes;
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
    const prefix = `${this.PHOTO_PREFIX}${prefijo}`;
    const fotos: FotoItem[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const imagenKey = `${prefix}${i}Imagen`;
      const imagen = formData[imagenKey];
      
      if (imagen) {
        const tituloKey = `${prefix}${i}Titulo`;
        const fuenteKey = `${prefix}${i}Fuente`;
        const numeroKey = `${prefix}${i}Numero`;
        
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

  // ✅ MÉTODOS INLINE DE TEXTO (sin servicios)
  obtenerTextoPoblacionSexo(datos: any, nombreComunidad: string): string {
    if (!datos || !nombreComunidad || nombreComunidad === '____') {
      return `Respecto a la población de la CC ___, tomando en cuenta data obtenida de los Censos Nacionales 2017 y los puntos de población que la conforman, existen un total de ___ habitantes que residen permanentemente en la comunidad. De este conjunto, el ___ son varones, por lo que se aprecia una leve mayoría de dicho grupo frente a sus pares femeninos (___).`;
    }

    const textoPersonalizado = PrefijoHelper.obtenerValorConPrefijo(datos, 'textoPoblacionSexoAISD', this.seccionId);
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado.replace(/___/, nombreComunidad);
    }
    return `Respecto a la población de la CC ${nombreComunidad}, tomando en cuenta data obtenida de los Censos Nacionales 2017 y los puntos de población que la conforman, existen un total de ___ habitantes que residen permanentemente en la comunidad. De este conjunto, el ___ son varones, por lo que se aprecia una leve mayoría de dicho grupo frente a sus pares femeninos (___)`.replace(/___/, nombreComunidad);
  }

  obtenerTextoPoblacionEtario(datos: any, nombreComunidad: string): string {
    if (!datos || !nombreComunidad || nombreComunidad === '____') {
      return `En una clasificación en grandes grupos de edad, se puede observar que el grupo etario mayoritario en la CC ___ es el de ___ años, puesto que representa el ___ de la población total. En segundo lugar, bastante cerca del primero, se halla el bloque etario de ___ años (___). Por otro lado, el conjunto minoritario está conformado por la población de ___ años a más, pues solo representa el ___.`;
    }

    const textoPersonalizado = PrefijoHelper.obtenerValorConPrefijo(datos, 'textoPoblacionEtarioAISD', this.seccionId);
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado.replace(/___/, nombreComunidad);
    }
    return `En una clasificación en grandes grupos de edad, se puede observar que el grupo etario mayoritario en la CC ${nombreComunidad} es el de ___ años, puesto que representa el ___ de la población total. En segundo lugar, bastante cerca del primero, se halla el bloque etario de ___ años (___). Por otro lado, el conjunto minoritario está conformado por la población de ___ años a más, pues solo representa el ___.`;
  }
}

