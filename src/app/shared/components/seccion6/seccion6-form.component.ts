import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy, Injector, ChangeDetectionStrategy, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { SECCION6_COLUMNAS_POBLACION_SEXO, SECCION6_COLUMNAS_POBLACION_ETARIO, SECCION6_TABLA_POBLACION_SEXO_CONFIG, SECCION6_TABLA_POBLACION_ETARIO_CONFIG, SECCION6_TEMPLATES, SECCION6_CONFIG, SECCION6_WATCHED_FIELDS } from './seccion6-constants';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { FotoItem } from '../image-upload/image-upload.component';
import { debugLog } from 'src/app/shared/utils/debug';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';

@Component({
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CoreSharedModule
  ],
  selector: 'app-seccion6-form',
  templateUrl: './seccion6-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion6FormComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = SECCION6_CONFIG.sectionId;
  
  // ✅ Hacer TEMPLATES accesible en template
  readonly SECCION6_TEMPLATES = SECCION6_TEMPLATES;
  
  override readonly PHOTO_PREFIX = SECCION6_CONFIG.photoPrefix;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION6_WATCHED_FIELDS;

  // ✅ Signal de prefijo de grupo AISD
  readonly prefijoGrupoSignal: Signal<string> = computed(() => this.obtenerPrefijoGrupo());

  poblacionSexoConfig: TableConfig = SECCION6_TABLA_POBLACION_SEXO_CONFIG;
  poblacionEtarioConfig: TableConfig = SECCION6_TABLA_POBLACION_ETARIO_CONFIG;
  
  // ✅ Getters para columnas
  get poblacionSexoColumns() { return SECCION6_COLUMNAS_POBLACION_SEXO; }
  get poblacionEtarioColumns() { return SECCION6_COLUMNAS_POBLACION_ETARIO; }
  
  override fotografiasFormMulti: FotoItem[] = [];

  // ✅ SIGNALS PUROS
  readonly sectionDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly poblacionSexoSignal: Signal<any[]> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.sectionDataSignal();
    const tablaKey = `poblacionSexoAISD${prefijo}`;
    return data[tablaKey] || data['poblacionSexoAISD'] || [];
  });

  readonly poblacionEtarioSignal: Signal<any[]> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.sectionDataSignal();
    const tablaKey = `poblacionEtarioAISD${prefijo}`;
    return data[tablaKey] || data['poblacionEtarioAISD'] || [];
  });

  readonly textoPoblacionSexoSignal: Signal<string> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.sectionDataSignal();
    
    // ✅ Prioridad: leer valor manual si existe (con prefijo y sin prefijo)
    const manualKey = `textoPoblacionSexoAISD${prefijo}`;
    const manual = data[manualKey];
    
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    
    // Fallback: generar texto automático
    const nombreComunidad = this.obtenerNombreComunidadActual();
    return this.obtenerTextoPoblacionSexo(data, nombreComunidad);
  });

  readonly textoPoblacionEtarioSignal: Signal<string> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.sectionDataSignal();
    
    // ✅ Prioridad: leer valor manual si existe (con prefijo y sin prefijo)
    const manualKey = `textoPoblacionEtarioAISD${prefijo}`;
    const manual = data[manualKey];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    
    // Fallback: generar texto automático
    const nombreComunidad = this.obtenerNombreComunidadActual();
    return this.obtenerTextoPoblacionEtario(data, nombreComunidad);
  });

  readonly totalPoblacionSexoSignal: Signal<number> = computed(() => {
    const poblacion = this.sectionDataSignal()['poblacionSexoAISD'] || [];
    const sinTotal = Array.isArray(poblacion) 
      ? poblacion.filter((item: any) => item['sexo'] && item['sexo'] !== 'Total')
      : [];
    return sinTotal.reduce((sum: number, item: any) => {
      const casos = parseInt(item['casos'], 10);
      return sum + (isNaN(casos) ? 0 : casos);
    }, 0);
  });

  readonly totalPoblacionEtarioSignal: Signal<number> = computed(() => {
    const poblacion = this.sectionDataSignal()['poblacionEtarioAISD'] || [];
    const sinTotal = Array.isArray(poblacion)
      ? poblacion.filter((item: any) => item['categoria'] && item['categoria'] !== 'Total')
      : [];
    return sinTotal.reduce((sum: number, item: any) => {
      const casos = parseInt(item['casos'], 10);
      return sum + (isNaN(casos) ? 0 : casos);
    }, 0);
  });

  // ✅ SIGNAL PARA INFORMACIÓN DE GRUPOS AISD (Sección 6 pertenece a un grupo)
  readonly aisdGroupsSignal: Signal<readonly any[]> = computed(() => {
    return this.projectFacade.groupsByType('AISD')();
  });

  // ✅ PATRÓN MODO IDEAL: photoFieldsHash Signal para monitorear cambios de imágenes
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

  // ✅ NUMERACIÓN GLOBAL - Tablas (dos tablas: sexo y etario)
  readonly globalTableNumberSignalSexo: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  });
  
  readonly globalTableNumberSignalEtario: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
  });
  
  // ✅ NUMERACIÓN GLOBAL - Fotos
  readonly photoNumbersSignal: Signal<string[]> = computed(() => {
    const prefix = `${this.PHOTO_PREFIX}${this.prefijoGrupoSignal()}`;
    const fotos = this.fotografiasCache || [];
    return fotos.map((_, index) => 
      this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index)
    );
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private tableFacade: TableManagementFacade,
    private globalNumbering: GlobalNumberingService
  ) {
    super(cdRef, injector);
    this.photoGroupsConfig = [
      { prefix: `${this.PHOTO_PREFIX}${this.prefijoGrupoSignal()}`, label: 'Demografía' }
    ];
    // Configs ya inicializadas como propiedades de clase
    
    debugLog('[PORCENTAJES] 🔧 Seccion6FormComponent - Config creada:', {
      poblacionSexoConfig: this.poblacionSexoConfig,
      tieneCampoTotal: !!this.poblacionSexoConfig.campoTotal,
      tieneCampoPorcentaje: !!this.poblacionSexoConfig.campoPorcentaje,
      calcularPorcentajes: this.poblacionSexoConfig.calcularPorcentajes
    });

    // ✅ EFFECT 1: Auto-sync datos reactivamente
    effect(() => {
      const sectionData = this.sectionDataSignal();
      this.datos = { ...sectionData };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2: Monitorear cambios de fotografías y sincronizar
    // Este efecto replica el patrón de Sección 5 (MODO IDEAL)
    // allowSignalWrites: true permite escribir a fotografiasFormMulti después de cargarFotografias()
    effect(() => {
      this.photoFieldsHash();  // Monitorea cambios en CUALQUIER campo de fotografía
      this.cargarFotografias();  // Recarga fotografías reactivamente
      
      // ✅ CRÍTICO: Después de cargarFotografias(), actualizar fotografiasFormMulti
      // Esto asegura que el template se renderice con las nuevas imágenes
      this.fotografiasFormMulti = [...this.fotografiasCache];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });

    // ✅ EFFECT 3: Calcular porcentajes cuando los datos de población cambien
    effect(() => {
      const prefijo = this.prefijoGrupoSignal();
      const sexoData = this.poblacionSexoSignal();
      const etarioData = this.poblacionEtarioSignal();
      
      // Verificar si necesita cálculo de porcentajes
      if (sexoData.length > 0 && !this.tienePorcentajesCalculados(sexoData)) {
        debugLog('[PORCENTAJES] ⚡ Calculando porcentajes para tabla sexo...');
        this.tableFacade.calcularTotalesYPorcentajes(
          this.sectionDataSignal(),
          { ...SECCION6_TABLA_POBLACION_SEXO_CONFIG, tablaKey: `poblacionSexoAISD${prefijo}` }
        );
      }

      if (etarioData.length > 0 && !this.tienePorcentajesCalculados(etarioData)) {
        debugLog('[PORCENTAJES] ⚡ Calculando porcentajes para tabla etario...');
        this.tableFacade.calcularTotalesYPorcentajes(
          this.sectionDataSignal(),
          { ...SECCION6_TABLA_POBLACION_ETARIO_CONFIG, tablaKey: `poblacionEtarioAISD${prefijo}` }
        );
      }

      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 4: Monitoreo de grupos AISD removido
    effect(() => {
      const gruposAISD = this.aisdGroupsSignal();
      this.cdRef.markForCheck();
    });
  }

  /**
   * Log interno para mostrar información del grupo AISD en consola
   */
  private logGrupoAISDParaConsola(numeroGrupo: number, grupo: any): void {
    // Method body removed
  }

  protected override onInitCustom(): void {
    this.cargarTodosLosGrupos();
    this.cargarFotografias();
    // ✅ Sincronizar fotografiasFormMulti con fotografiasCache después de cargar
    this.fotografiasFormMulti = [...this.fotografiasCache];
  }

  /**
   * ✅ Verifica si una tabla ya tiene porcentajes calculados
   */
  private tienePorcentajesCalculados(datos: any[]): boolean {
    return datos.some((item: any) => 
      item.porcentaje && 
      item.porcentaje !== '—' && 
      item.porcentaje !== '' && 
      item.porcentaje !== null &&
      !item.sexo?.toString().toLowerCase().includes('total') &&
      !item.categoria?.toString().toLowerCase().includes('total')
    );
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
    
    const datos = this.sectionDataSignal();
    
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
    const datos = this.sectionDataSignal();
    return PrefijoHelper.obtenerValorConPrefijo(datos, campo, this.seccionId);
  }

  getPoblacionSexoSinTotal(): any[] {
    const poblacion = this.sectionDataSignal()['poblacionSexoAISD'] || [];
    return Array.isArray(poblacion) 
      ? poblacion.filter((item: any) => item['sexo'] && item['sexo'] !== 'Total')
      : [];
  }

  getPoblacionEtarioSinTotal(): any[] {
    const poblacion = this.sectionDataSignal()['poblacionEtarioAISD'] || [];
    return Array.isArray(poblacion)
      ? poblacion.filter((item: any) => item['categoria'] && item['categoria'] !== 'Total')
      : [];
  }

  getTotalPoblacionSexo(): number {
    return this.totalPoblacionSexoSignal();
  }

  getTotalPoblacionEtario(): number {
    return this.totalPoblacionEtarioSignal();
  }

  getPorcentajeTotalPoblacionSexo(): string {
    const total = this.getTotalPoblacionSexo();
    return total === 0 ? '0,00 %' : '100,00 %';
  }

  getPorcentajeTotalPoblacionEtario(): string {
    const total = this.getTotalPoblacionEtario();
    return total === 0 ? '0,00 %' : '100,00 %';
  }

  onTablaSexoActualizada(): void {
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onTablaEtarioActualizada(): void {
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  // ✅ Override: PhotoCoordinator maneja TODO la persistencia de imágenes
  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    // 🔧 PATRÓN CORRECTO: Solo llamar a super() que usa PhotoCoordinator
    // PhotoCoordinator se encarga de:
    // - Guardar todas las imágenes via ImageManagementFacade
    // - Actualizar fotografiasFormMulti y fotografiasCache
    super.onFotografiasChange(fotografias, customPrefix);
    
    // ✅ Actualizar referencias locales (para templates que usan fotografiasFormMulti)
    this.fotografiasFormMulti = fotografias;
    
    // ✅ Marcar para detección de cambios
    this.cdRef.markForCheck();
  }

  protected override onFieldChange(fieldName: string, value: any, options?: { refresh?: boolean }): void {
    super.onFieldChange(fieldName, value, { refresh: options?.refresh ?? false });
    this.cdRef.markForCheck();
  }

  // ✅ OVERRIDE CRÍTICO: cargarFotografias() DEBE LEER DEL SIGNAL REACTIVO (sectionDataSignal)
  // NO de imageFacade.loadImages() que lee localStorage desactualizado
  // Esto asegura que los cambios de titulo/fuente se reflejen inmediatamente
  override cargarFotografias(): void {
    const formData = this.sectionDataSignal();  // ✅ LEER DEL SIGNAL REACTIVO
    const prefijo = this.prefijoGrupoSignal();
    const prefix = `${this.PHOTO_PREFIX}${prefijo}`;
    const fotos: FotoItem[] = [];
    
    // ✅ Reconstruir array de fotografías leyendo directamente del state reactivo
    for (let i = 1; i <= 10; i++) {
      const imagenKey = `${prefix}${i}Imagen`;
      const imagen = formData[imagenKey];
      
      // Si hay imagen, agregar a array
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
    this.fotografiasFormMulti = [...this.fotografiasCache];
    this.cdRef.markForCheck();
  }

  override ngOnDestroy(): void {
    this.guardarTodosLosGrupos();
    super.ngOnDestroy();
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


