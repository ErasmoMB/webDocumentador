import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy, Injector, ChangeDetectionStrategy, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { Seccion6TableConfigService } from 'src/app/core/services/domain/seccion6-table-config.service';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { FotoItem } from '../image-upload/image-upload.component';
import { debugLog } from 'src/app/shared/utils/debug';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

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
  @Input() override seccionId: string = '3.1.4.A.1.2';
  
  override readonly PHOTO_PREFIX = 'fotografiaDemografia';
  override useReactiveSync: boolean = true;

  // ✅ Signal de prefijo de grupo AISD
  readonly prefijoGrupoSignal: Signal<string> = computed(() => this.obtenerPrefijoGrupo());

  override watchedFields: string[] = [
    'grupoAISD'
  ];

  poblacionSexoConfig!: TableConfig;
  poblacionEtarioConfig!: TableConfig;
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

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    public tableCfg: Seccion6TableConfigService,
    private tableFacade: TableManagementFacade
  ) {
    super(cdRef, injector);
    this.photoGroupsConfig = [
      { prefix: `${this.PHOTO_PREFIX}${this.prefijoGrupoSignal()}`, label: 'Demografía' }
    ];
    this.poblacionSexoConfig = this.tableCfg.getTablaPoblacionSexoConfig();
    this.poblacionEtarioConfig = this.tableCfg.getTablaPoblacionEtarioConfig();
    
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
          { ...this.poblacionSexoConfig, tablaKey: `poblacionSexoAISD${prefijo}` }
        );
      }

      if (etarioData.length > 0 && !this.tienePorcentajesCalculados(etarioData)) {
        debugLog('[PORCENTAJES] ⚡ Calculando porcentajes para tabla etario...');
        this.tableFacade.calcularTotalesYPorcentajes(
          this.sectionDataSignal(),
          { ...this.poblacionEtarioConfig, tablaKey: `poblacionEtarioAISD${prefijo}` }
        );
      }

      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 4: Log automático del grupo AISD de esta sección
    effect(() => {
      const gruposAISD = this.aisdGroupsSignal();
      
      // Log solo si hay grupos cargados
      if (gruposAISD.length > 0) {
        console.log('%c=== INFORMACIÓN DE GRUPO AISD - SECCIÓN 6 ===', 'color: #1f2937; background: #f3f4f6; font-weight: bold; padding: 4px 8px; border-radius: 3px');
        
        gruposAISD.forEach((grupo, index) => {
          this.logGrupoAISDParaConsola(index + 1, grupo);
        });
      }
    });
  }

  /**
   * Log interno para mostrar información del grupo AISD en consola
   */
  private logGrupoAISDParaConsola(numeroGrupo: number, grupo: any): void {
    console.log(`%c🏘️ GRUPO AISD: A.${numeroGrupo} - ${grupo.nombre || 'Sin nombre'}`, 'color: #2563eb; font-weight: bold; font-size: 13px');
    console.log(`%cCentros Poblados (CCPP):`, 'color: #7c3aed; font-weight: bold');
    
    const centrosPobladosSeleccionados = grupo.ccppIds || [];
    console.log(`[DEBUG] centrosPobladosSeleccionados (${centrosPobladosSeleccionados.length}):`, centrosPobladosSeleccionados);
    
    if (centrosPobladosSeleccionados.length === 0) {
      console.log('  (Sin centros poblados asignados)');
      return;
    }
    
    const jsonCompleto = this.projectFacade.obtenerDatos()['jsonCompleto'] || {};
    const centrosDetalles: any[] = [];
    
    centrosPobladosSeleccionados.forEach((codigo: any) => {
      Object.keys(jsonCompleto).forEach((grupoKey: string) => {
        const grupoData = jsonCompleto[grupoKey];
        if (Array.isArray(grupoData)) {
          const centro = grupoData.find((c: any) => {
            const codigoCentro = String(c.CODIGO || '').trim();
            const codigoBuscado = String(codigo).trim();
            return codigoCentro === codigoBuscado;
          });
          if (centro && !centrosDetalles.find(c => c.CODIGO === centro.CODIGO)) {
            centrosDetalles.push(centro);
          }
        }
      });
    });
    
    if (centrosDetalles.length > 0) {
      centrosDetalles.forEach((cp: any, index: number) => {
        const nombre = cp.CCPP || cp.nombre || `CCPP ${index + 1}`;
        console.log(`  ${index + 1}. ${nombre} (Código: ${cp.CODIGO})`);
      });
    }
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
    const datos = this.sectionDataSignal();
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


