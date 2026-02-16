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
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { transformPoblacionSexoDesdeDemograficos, transformPoblacionEtarioDesdeDemograficos } from 'src/app/core/config/table-transforms';

// Función helper para desenvuelver datos del backend (igual a auto-backend-endpoint-handlers)
const unwrapDemograficoData = (responseData: any): any[] => {
  if (!responseData) return [];
  // El backend devuelve un array con un objeto que contiene rows
  if (Array.isArray(responseData) && responseData.length > 0) {
    return responseData[0]?.rows || responseData;
  }
  if (responseData.data) {
    const data = responseData.data;
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.rows || data;
    }
    return data;
  }
  return [];
};

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
    return data[tablaKey] || [];
  });

  readonly poblacionEtarioSignal: Signal<any[]> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.sectionDataSignal();
    const tablaKey = `poblacionEtarioAISD${prefijo}`;
    return data[tablaKey] || [];
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
    const poblacion = this.poblacionSexoSignal() || [];
    const sinTotal = Array.isArray(poblacion) 
      ? poblacion.filter((item: any) => item['sexo'] && item['sexo'] !== 'Total')
      : [];
    return sinTotal.reduce((sum: number, item: any) => {
      const casos = parseInt(item['casos'], 10);
      return sum + (isNaN(casos) ? 0 : casos);
    }, 0);
  });

  readonly totalPoblacionEtarioSignal: Signal<number> = computed(() => {
    const poblacion = this.poblacionEtarioSignal() || [];
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

  // ✅ NUMERACIÓN GLOBAL - Tablas (dos tablas: sexo y etario)
  readonly globalTableNumberSignalSexo: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  });
  
  readonly globalTableNumberSignalEtario: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
  });
  
  // ✅ NUMERACIÓN GLOBAL - Fotos
  readonly photoNumbersSignal: Signal<string[]> = computed(() => {
    const fotos = this.fotografiasCache || [];
    return fotos.map((_, index) => 
      this.globalNumbering.getGlobalPhotoNumber(this.seccionId, this.PHOTO_PREFIX, index)
    );
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private tableFacade: TableManagementFacade,
    private globalNumbering: GlobalNumberingService,
    private backendApi: BackendApiService
  ) {
    super(cdRef, injector);
    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX, label: 'Demografía' }
    ];
    // Configs ya inicializadas como propiedades de clase
    
    debugLog('[PORCENTAJES] 🔧 Seccion6FormComponent - Config creada:', {
      poblacionSexoConfig: this.poblacionSexoConfig,
      tieneCampoTotal: !!this.poblacionSexoConfig.campoTotal,
      tieneCampoPorcentaje: !!this.poblacionSexoConfig.campoPorcentaje,
      calcularPorcentajes: this.poblacionSexoConfig.calcularPorcentajes
    });

    // ✅ EFFECT 1: Auto-sync datos reactivamente (MERGE para no pisar ediciones en curso)
    effect(() => {
      const sectionData = this.sectionDataSignal();
      if (sectionData && Object.keys(sectionData).length > 0) {
        this.datos = { ...this.datos, ...sectionData };
      }
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
    
    // ✅ FASE 3: Cargar datos demográficos desde el backend
    // Los endpoints están configurados en field-mappings para cargar automáticamente
    this.cargarDatosDelBackend();
  }
  
  /**
   * ✅ Carga datos de los endpoints del backend para las tablas de demografía
   * - poblacionSexoAISD: /demograficos/datos
   * - poblacionEtarioAISD: /demograficos/etario
   */
  private cargarDatosDelBackend(): void {
    // ✅ USAR getCodigosCentrosPobladosAISD() DEL GRUPO ACTUAL (clase base)
    // Esto obtiene solo los centros poblados específicos del grupo AISD actual
    const codigosArray = this.getCodigosCentrosPobladosAISD();
    const codigos = [...codigosArray]; // Crear copia mutable para el API

    if (!codigos || codigos.length === 0) {
      debugLog('[SECCION6] ⚠️ No hay centros poblados en el grupo actual para cargar datos');
      return;
    }

    debugLog('[SECCION6] 📡 Cargando datos de demografía desde backend para grupo actual...', { codigos });

    // ✅ OBTENER PREFIJO PARA GUARDAR CON CLAVE CORRECTA
    const prefijo = this.obtenerPrefijoGrupo();
    
    // Cargar población por sexo desde /demograficos/datos
    this.backendApi.postDatosDemograficos(codigos).subscribe({
      next: (response: any) => {
        try {
          const dataRaw = response?.data || [];
          // Desenvuelver datos del backend
          const datosDesenvueltos = unwrapDemograficoData(dataRaw);
          const datosTransformados = transformPoblacionSexoDesdeDemograficos(datosDesenvueltos);
          debugLog('[SECCION6] ✅ Datos de sexo cargados:', datosTransformados);
          
          // Guardar en el state CON PREFIJO
          if (datosTransformados.length > 0) {
            const tablaKey = `poblacionSexoAISD${prefijo}`;
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            // También guardar sin prefijo para fallback
            this.projectFacade.setField(this.seccionId, null, 'poblacionSexoAISD', datosTransformados);
            this.cdRef.markForCheck();
          }
        } catch (e) {
          debugLog('[SECCION6] ❌ Error transformando datos de sexo:', e);
        }
      },
      error: (err: any) => {
        debugLog('[SECCION6] ❌ Error cargando población por sexo:', err);
      }
    });

    // Cargar población por grupo etario desde /demograficos/etario
    this.backendApi.postEtario(codigos).subscribe({
      next: (response: any) => {
        try {
          const dataRaw = response?.data || [];
          // Desenvuelver datos del backend
          const datosDesenvueltos = unwrapDemograficoData(dataRaw);
          const datosTransformados = transformPoblacionEtarioDesdeDemograficos(datosDesenvueltos);
          debugLog('[SECCION6] ✅ Datos de etario cargados (sin Total):', datosTransformados);
          
          // Guardar en el state CON PREFIJO
          if (datosTransformados.length > 0) {
            const tablaKey = `poblacionEtarioAISD${prefijo}`;
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            // También guardar sin prefijo para fallback
            this.projectFacade.setField(this.seccionId, null, 'poblacionEtarioAISD', datosTransformados);
            this.cdRef.markForCheck();
          }
        } catch (e) {
          debugLog('[SECCION6] ❌ Error transformando datos de etario:', e);
        }
      },
      error: (err: any) => {
        debugLog('[SECCION6] ❌ Error cargando población por etario:', err);
      }
    });
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
    // No llamar actualizarDatos(): lee de legacy (obtenerDatos/FormularioService)
    this.cdRef.markForCheck();
  }

  onTablaEtarioActualizada(): void {
    // No llamar actualizarDatos(): lee de legacy (obtenerDatos/FormularioService)
    this.cdRef.markForCheck();
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
    const fotos: FotoItem[] = [];
    
    // ✅ Reconstruir array de fotografías leyendo directamente del state reactivo
    for (let i = 1; i <= 10; i++) {
      const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`;
      const imagen = formData[imagenKey];
      
      // Si hay imagen, agregar a array
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


