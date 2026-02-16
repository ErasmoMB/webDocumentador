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
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { transformPoblacionSexoDesdeDemograficos, transformPoblacionEtarioDesdeDemograficos } from 'src/app/core/config/table-transforms';

// Helper para desenvuelver datos del backend (misma idea que en el form)
const unwrapDemograficoData = (responseData: any): any[] => {
  if (!responseData) return [];
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

  // ✅ Códigos AISD del grupo actual (pueden llegar después de montar la vista)
  private readonly codigosAISDSignal: Signal<readonly string[]> = computed(() => {
    return this.getCodigosCentrosPobladosAISD();
  });

  private backendLoadRequested = false;

  // ✅ Tablas reactivas (evita vacíos intermitentes en vista OnPush)
  readonly poblacionSexoRowsSignal: Signal<any[]> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.vistDataSignal();
    const tablaConPrefijo = prefijo ? data[`poblacionSexoAISD${prefijo}`] : null;
    if (tablaConPrefijo && this.tieneContenidoRealDemografia(tablaConPrefijo)) {
      return tablaConPrefijo;
    }
    if (data['poblacionSexoAISD'] && this.tieneContenidoRealDemografia(data['poblacionSexoAISD'])) {
      return data['poblacionSexoAISD'];
    }
    if (data['poblacionSexoTabla'] && this.tieneContenidoRealDemografia(data['poblacionSexoTabla'])) {
      return data['poblacionSexoTabla'];
    }
    return [];
  });

  readonly poblacionEtarioRowsSignal: Signal<any[]> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.vistDataSignal();
    const tablaConPrefijo = prefijo ? data[`poblacionEtarioAISD${prefijo}`] : null;
    if (tablaConPrefijo && this.tieneContenidoRealDemografia(tablaConPrefijo)) {
      return tablaConPrefijo;
    }
    if (data['poblacionEtarioAISD'] && this.tieneContenidoRealDemografia(data['poblacionEtarioAISD'])) {
      return data['poblacionEtarioAISD'];
    }
    if (data['poblacionEtarioTabla'] && this.tieneContenidoRealDemografia(data['poblacionEtarioTabla'])) {
      return data['poblacionEtarioTabla'];
    }
    return [];
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
    private sanitizer: DomSanitizer,
    private backendApi: BackendApiService
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

    // ✅ EFFECT 3: En vista/plantilla, cargar backend si faltan datos (evita “se llena recién al recargar”)
    effect(() => {
      const codigos = this.codigosAISDSignal();
      const rowsSexo = this.poblacionSexoRowsSignal();
      const rowsEtario = this.poblacionEtarioRowsSignal();

      const necesitaSexo = !rowsSexo || rowsSexo.length === 0;
      const necesitaEtario = !rowsEtario || rowsEtario.length === 0;

      if (!necesitaSexo && !necesitaEtario) return;
      if (this.backendLoadRequested) return;
      if (!codigos || codigos.length === 0) return;

      this.backendLoadRequested = true;
      this.cargarDatosDelBackendVista(codigos, { sexo: necesitaSexo, etario: necesitaEtario });
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    this.fotografiasVista = [...this.fotografiasCache];
  }

  private cargarDatosDelBackendVista(
    codigos: readonly string[],
    flags: { sexo: boolean; etario: boolean }
  ): void {
    const prefijo = this.obtenerPrefijoGrupo();
    debugLog('[SECCION6:VIEW] 📡 Cargando demografía desde backend (vista)...', {
      seccionId: this.seccionId,
      prefijo,
      codigos,
      flags
    });

    if (flags.sexo) {
      this.backendApi.postDatosDemograficos([...codigos]).subscribe({
        next: (response: any) => {
          try {
            // Guardas: no sobre-escribir si ya se llenó mientras esperábamos
            if (this.poblacionSexoRowsSignal().length > 0) return;

            const dataRaw = response?.data ?? response;
            const datosDesenvueltos = unwrapDemograficoData(dataRaw);
            const datosTransformados = transformPoblacionSexoDesdeDemograficos(datosDesenvueltos);

            if (datosTransformados.length > 0) {
              const tablaKey = `poblacionSexoAISD${prefijo}`;
              this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
              this.projectFacade.setField(this.seccionId, null, 'poblacionSexoAISD', datosTransformados);
              this.cdRef.markForCheck();
              debugLog('[SECCION6:VIEW] ✅ Tabla sexo cargada', { tablaKey, rows: datosTransformados.length });
            } else {
              debugLog('[SECCION6:VIEW] ⚠️ Tabla sexo sin datos transformados', { prefijo });
            }
          } catch (e) {
            debugLog('[SECCION6:VIEW] ❌ Error transformando datos de sexo:', e);
          }
        },
        error: (err: any) => {
          debugLog('[SECCION6:VIEW] ❌ Error cargando población por sexo:', err);
        }
      });
    }

    if (flags.etario) {
      this.backendApi.postEtario([...codigos]).subscribe({
        next: (response: any) => {
          try {
            if (this.poblacionEtarioRowsSignal().length > 0) return;

            const dataRaw = response?.data ?? response;
            const datosDesenvueltos = unwrapDemograficoData(dataRaw);
            const datosTransformados = transformPoblacionEtarioDesdeDemograficos(datosDesenvueltos);

            if (datosTransformados.length > 0) {
              const tablaKey = `poblacionEtarioAISD${prefijo}`;
              this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
              this.projectFacade.setField(this.seccionId, null, 'poblacionEtarioAISD', datosTransformados);
              this.cdRef.markForCheck();
              debugLog('[SECCION6:VIEW] ✅ Tabla etario cargada', { tablaKey, rows: datosTransformados.length });
            } else {
              debugLog('[SECCION6:VIEW] ⚠️ Tabla etario sin datos transformados', { prefijo });
            }
          } catch (e) {
            debugLog('[SECCION6:VIEW] ❌ Error transformando datos etario:', e);
          }
        },
        error: (err: any) => {
          debugLog('[SECCION6:VIEW] ❌ Error cargando población etario:', err);
        }
      });
    }
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
    return this.poblacionSexoRowsSignal();
  }

  getPoblacionEtarioConPorcentajes(): any[] {
    return this.poblacionEtarioRowsSignal();
  }

  private getTablaSexo(): any[] {
    return this.poblacionSexoRowsSignal();
  }

  private getTablaEtario(): any[] {
    return this.poblacionEtarioRowsSignal();
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
    try {
      const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId) || '';
      const fotos = this.imageFacade.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix, 10);
      this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
      this.fotografiasVista = [...this.fotografiasCache];
      this.cdRef.markForCheck();
    } catch {
      this.fotografiasCache = [];
      this.fotografiasVista = [];
      this.cdRef.markForCheck();
    }
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

