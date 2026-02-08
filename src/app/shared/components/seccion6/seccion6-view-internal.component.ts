import { Component, Input, ChangeDetectorRef, OnDestroy, Injector, ChangeDetectionStrategy, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { FotoItem } from '../image-upload/image-upload.component';
import { Seccion6TableConfigService } from 'src/app/core/services/domain/seccion6-table-config.service';
import { Seccion6DataService } from 'src/app/core/services/domain/seccion6-data.service';
import { Seccion6TextGeneratorService } from 'src/app/core/services/domain/seccion6-text-generator.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { debugLog } from 'src/app/shared/utils/debug';

@Component({
  standalone: true,
  imports: [CommonModule, CoreSharedModule],
  selector: 'app-seccion6-view-internal',
  templateUrl: './seccion6-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion6ViewInternalComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.2';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaDemografia';
  override useReactiveSync: boolean = true;
  fotografiasVista: FotoItem[] = [];

  override watchedFields: string[] = [
    'grupoAISD',
    'poblacionSexoAISD',
    'poblacionEtarioAISD',
    'textoPoblacionSexoAISD',
    'textoPoblacionEtarioAISD',
    'tituloPoblacionSexoAISD',
    'tituloPoblacionEtarioAISD',
    'fuentePoblacionSexoAISD',
    'fuentePoblacionEtarioAISD'
  ];

  poblacionSexoConfig!: TableConfig;
  poblacionEtarioConfig!: TableConfig;

  readonly vistDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly vistTextoPoblacionSexoSignal: Signal<string> = computed(() => {
    const data = this.vistDataSignal();
    const manual = data['textoPoblacionSexoAISD'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    const nombreComunidad = this.dataSrv.obtenerNombreComunidadActual(data, this.seccionId);
    return this.textGenSrv.obtenerTextoPoblacionSexo(data, nombreComunidad);
  });

  readonly vistTextoPoblacionEtarioSignal: Signal<string> = computed(() => {
    const data = this.vistDataSignal();
    const manual = data['textoPoblacionEtarioAISD'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    const nombreComunidad = this.dataSrv.obtenerNombreComunidadActual(data, this.seccionId);
    return this.textGenSrv.obtenerTextoPoblacionEtario(data, nombreComunidad);
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo`;
      const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente`;
      const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen`;
      
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
    private dataSrv: Seccion6DataService,
    private textGenSrv: Seccion6TextGeneratorService,
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
    // Este efecto replica el patrón de Sección 5 (MODO IDEAL)
    // allowSignalWrites: true permite escribir a fotografiasVista después de cargarFotografias()
    effect(() => {
      this.photoFieldsHash();  // Monitorea cambios en CUALQUIER campo de fotografía
      this.cargarFotografias();  // Recarga fotografías reactivamente
      
      // ✅ CRÍTICO: Después de cargarFotografias(), actualizar fotografiasVista
      // Esto asegura que el template se renderice con las nuevas imágenes
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
    return this.dataSrv.obtenerNombreComunidadActual(this.vistDataSignal(), this.seccionId);
  }

  override obtenerValorConPrefijo(campo: string): any {
    return this.dataSrv.obtenerValorConPrefijo(this.vistDataSignal(), campo, this.seccionId);
  }

  obtenerTextoPoblacionSexoConResaltado(): SafeHtml {
    const texto = this.vistTextoPoblacionSexoSignal();
    const html = this.textGenSrv.obtenerTextoPoblacionSexoConResaltado(
      this.vistDataSignal(),
      this.obtenerNombreComunidadActual()
    );
    return html;
  }

  obtenerTextoPoblacionEtarioConResaltado(): SafeHtml {
    const texto = this.vistTextoPoblacionEtarioSignal();
    const html = this.textGenSrv.obtenerTextoPoblacionEtarioConResaltado(
      this.vistDataSignal(),
      this.obtenerNombreComunidadActual()
    );
    return html;
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

  getInstituciones(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    
    const tablaConPrefijo = prefijo ? this.datos[`institucionesAISD${prefijo}`] : null;
    if (tablaConPrefijo && this.tieneContenidoRealInstituciones(tablaConPrefijo)) {
      return tablaConPrefijo;
    }
    
    if (this.datos.institucionesAISD && this.tieneContenidoRealInstituciones(this.datos.institucionesAISD)) {
      return this.datos.institucionesAISD;
    }
    
    if (this.datos.institucionesTabla && this.tieneContenidoRealInstituciones(this.datos.institucionesTabla)) {
      return this.datos.institucionesTabla;
    }
    
    return [];
  }

  private tieneContenidoRealInstituciones(tabla: any[]): boolean {
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) return false;
    return tabla.some(item => {
      const institucion = item.institucion?.toString().trim() || '';
      const disponibilidad = item.disponibilidad?.toString().trim() || '';
      const ubicacion = item.ubicacion?.toString().trim() || '';
      return institucion !== '' || disponibilidad !== '' || ubicacion !== '';
    });
  }

  // ✅ OVERRIDE CRÍTICO: cargarFotografias() DEBE LEER DEL SIGNAL REACTIVO (vistDataSignal)
  // NO de imageFacade.loadImages() que lee localStorage desactualizado
  // Esto asegura que los cambios de titulo/fuente se reflejen inmediatamente en la vista
  override cargarFotografias(): void {
    const formData = this.vistDataSignal();  // ✅ LEER DEL SIGNAL REACTIVO
    const fotos: FotoItem[] = [];
    
    // ✅ Reconstruir array de fotografías leyendo directamente del state reactivo
    for (let i = 1; i <= 10; i++) {
      const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen`;
      const imagen = formData[imagenKey];
      
      // Si hay imagen, agregar a array
      if (imagen) {
        const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo`;
        const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente`;
        const numeroKey = `${this.PHOTO_PREFIX}${i}Numero`;
        
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
}