import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import {
  SECCION9_WATCHED_FIELDS,
  SECCION9_SECTION_ID,
  SECCION9_TEMPLATES,
  SECCION9_PLANTILLAS_DINAMICAS,
  SECCION9_CONFIG,
  SECCION9_TABLA_CONDICION_OCUPACION_CONFIG,
  SECCION9_TABLA_TIPOS_MATERIALES_CONFIG
} from './seccion9-constants';

// ============================================================================
// FUNCIONES TRANSFORMADORAS - Convertir datos del backend al formato de tabla
// ============================================================================

/**
 * Desenvuelve datos demográficos del backend
 * Estructura: [{ rows: [...] }]
 * Extrae directamente el array de rows
 */
const unwrapDemograficoData = (responseData: any): any[] => {
  if (!responseData) return [];
  
  // Estructura: [{ rows: [...] }]
  if (Array.isArray(responseData) && responseData.length > 0 && responseData[0]?.rows) {
    return responseData[0].rows;
  }
  
  // Fallback si ya es un array de items
  if (Array.isArray(responseData)) {
    return responseData;
  }
  
  return [];
};

/**
 * Transforma datos de Condición de Ocupación del backend
 * Cada item ya tiene: categoria, casos, porcentaje
 */
const transformCondicionOcupacionDesdeBackend = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => ({
    categoria: item.categoria || item.condicion || '',
    casos: parseFloat(item.casos || 0) || 0,
    porcentaje: item.porcentaje || ''
  }));
};

/**
 * Transforma datos de Materiales de Construcción del backend
 * Cada item ya tiene: categoria, subcategoria, casos, porcentaje
 * Mapea subcategoria a tipoMaterial
 */
const transformMaterialesConstruccionDesdeBackend = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => ({
    categoria: item.categoria || '',                    // ✅ Ya viene en el item
    tipoMaterial: item.subcategoria || item.material || item.tipo_material || item.tipoMaterial || '',
    casos: parseFloat(item.casos || 0) || 0,
    porcentaje: item.porcentaje || ''
  }));
};

// ============================================================================
 // COMPONENTE
// ============================================================================

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CoreSharedModule,
    ImageUploadComponent,
    DynamicTableComponent,
    ParagraphEditorComponent
  ],
  selector: 'app-seccion9-form',
  templateUrl: './seccion9-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion9FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION9_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = true;
  
  // ✅ Hacer TEMPLATES accesible en template
  readonly SECCION9_TEMPLATES = SECCION9_TEMPLATES;

  override readonly PHOTO_PREFIX = SECCION9_CONFIG.photoPrefix;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION9_WATCHED_FIELDS;

  fotografiasSeccion9: FotoItem[] = [];

  // ✅ SIGNAL PRINCIPAL: Lee todos los datos de la sección
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  // ✅ AUTO-SYNC FIELDS (reemplazan onFieldChange) - CON PREFIJO DE GRUPO
  readonly textoViviendas = this.createAutoSyncField(`textoViviendas${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoEstructura = this.createAutoSyncField(`textoEstructura${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly tituloCondicionOcupacion = this.createAutoSyncField(`tituloCondicionOcupacion${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly fuenteCondicionOcupacion = this.createAutoSyncField(`fuenteCondicionOcupacion${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly tituloTiposMateriales = this.createAutoSyncField(`tituloTiposMateriales${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly fuenteTiposMateriales = this.createAutoSyncField(`fuenteTiposMateriales${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');

  // ✅ SIGNALS DERIVADOS: Lectura del estado
  readonly grupoAISDSignal: Signal<string> = computed(() => {
    // 1️⃣ Intentar obtener desde campo grupoAISD guardado en la sección
    const guardado = this.projectFacade.selectField(this.seccionId, null, 'grupoAISD')();
    if (guardado && guardado.trim() !== '') {
      return guardado;
    }
    
    // 2️⃣ Intentar desde AIISD groups (para secciones con prefijo como _A1, _A2)
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

  // ✅ NUMERACIÓN GLOBAL - Tablas (dos tablas: condicionOcupacion, tiposMateriales)
  readonly globalTableNumberSignalCondicionOcupacion: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  });
  
  readonly globalTableNumberSignalTiposMateriales: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
  });

  readonly condicionOcupacionSignal: Signal<any[]> = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `condicionOcupacionTabla${prefijo}` : 'condicionOcupacionTabla';
    return Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
  });

  readonly tiposMaterialesSignal: Signal<any[]> = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `tiposMaterialesTabla${prefijo}` : 'tiposMaterialesTabla';
    return Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
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

  // ✅ PLANTILLAS DINÁMICAS: Con sustitución de comunidad
  readonly textoViviendasDinamico: Signal<string> = computed(() => {
    const guardado = this.textoViviendas.value();
    if (guardado && guardado.trim().length > 0) {
      return guardado;
    }
    const comunidad = this.grupoAISDSignal();
    return SECCION9_PLANTILLAS_DINAMICAS.textoViviendasTemplate.replace('__COMUNIDAD__', comunidad);
  });

  readonly textoEstructuraDinamico: Signal<string> = computed(() => {
    const guardado = this.textoEstructura.value();
    if (guardado && guardado.trim().length > 0) {
      return guardado;
    }
    const comunidad = this.grupoAISDSignal();
    return SECCION9_PLANTILLAS_DINAMICAS.textoEstructuraTemplate.replace('__COMUNIDAD__', comunidad);
  });

  readonly tituloCondicionOcupacionDinamico: Signal<string> = computed(() => {
    const guardado = this.tituloCondicionOcupacion.value();
    if (guardado && guardado.trim().length > 0) {
      return guardado;
    }
    const comunidad = this.grupoAISDSignal();
    return SECCION9_TEMPLATES.tituloDefaultCondicionOcupacion.replace('{comunidad}', comunidad);
  });

  readonly tituloTiposMaterialesDinamico: Signal<string> = computed(() => {
    const guardado = this.tituloTiposMateriales.value();
    if (guardado && guardado.trim().length > 0) {
      return guardado;
    }
    const comunidad = this.grupoAISDSignal();
    return SECCION9_TEMPLATES.tituloDefaultTiposMateriales.replace('{comunidad}', comunidad);
  });

  readonly fuenteCondicionOcupacionDinamico: Signal<string> = computed(() => {
    const guardado = this.fuenteCondicionOcupacion.value();
    if (guardado && guardado.trim().length > 0) {
      return guardado;
    }
    return SECCION9_TEMPLATES.fuenteDefaultCondicionOcupacion;
  });

  readonly fuenteTiposMaterialesDinamico: Signal<string> = computed(() => {
    const guardado = this.fuenteTiposMateriales.value();
    if (guardado && guardado.trim().length > 0) {
      return guardado;
    }
    return SECCION9_TEMPLATES.fuenteDefaultTiposMateriales;
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private globalNumbering: GlobalNumberingService,
    private backendApi: BackendApiService
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
      this.fotografiasSeccion9 = [...this.fotografiasFormMulti];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.inicializarTablasVacias();  // Primero vacías
    this.cargarDatosDelBackend();    // Luego llenar con backend
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    super.onFotografiasChange(fotografias, customPrefix);
    this.fotografiasSeccion9 = fotografias;
    this.cdRef.markForCheck();
  }

  // ============================================================================
  // ✅ PATRÓN BACKEND SOLO LECTURA - MÉTODOS DE CARGA
  // ============================================================================

  /**
   * Inicializar las tablas como arrays vacíos
   */
  private inicializarTablasVacias(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // Inicializar cada tabla como array vacío CON prefijo y SIN prefijo (fallback)
    this.projectFacade.setField(this.seccionId, null, `condicionOcupacionTabla${prefijo}`, []);
    this.projectFacade.setField(this.seccionId, null, 'condicionOcupacionTabla', []);
    
    this.projectFacade.setField(this.seccionId, null, `tiposMaterialesTabla${prefijo}`, []);
    this.projectFacade.setField(this.seccionId, null, 'tiposMaterialesTabla', []);
  }

  /**
   * ✅ Cargar datos del backend siguiendo el patrón de Sección 6 y 7
   * Carga dos tablas: Condición de Ocupación y Materiales de Construcción
   */
  private cargarDatosDelBackend(): void {
    // 1. Obtener los códigos de centros poblados del grupo actual
    const codigosArray = this.getCodigosCentrosPobladosAISD();
    const codigos = [...codigosArray]; // Copia mutable

    if (!codigos || codigos.length === 0) {
      console.log('[SECCION9] ⚠️ No hay centros poblados en el grupo actual');
      return;
    }

    const prefijo = this.obtenerPrefijoGrupo();
    console.log('[SECCION9] 🔍 Cargando datos del backend con códigos:', codigos);

    // 2. Cargar Condición de Ocupación desde /demograficos/condicion-ocupacion
    this.backendApi.postCondicionOcupacion(codigos).subscribe({
      next: (response: any) => {
        try {
          const dataRaw = response?.data || [];
          const datosDesenvueltos = unwrapDemograficoData(dataRaw);
          const datosTransformados = transformCondicionOcupacionDesdeBackend(datosDesenvueltos);
          
          console.log('[SECCION9] ✅ Datos de condición ocupación cargados:', datosTransformados);
          
          // Guardar CON prefijo y SIN prefijo (fallback)
          if (datosTransformados.length > 0) {
            const tablaKey = `condicionOcupacionTabla${prefijo}`;
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            this.projectFacade.setField(this.seccionId, null, 'condicionOcupacionTabla', datosTransformados);
          }
        } catch (err) {
          console.error('[SECCION9] Error procesando condición ocupación:', err);
        }
      },
      error: (err) => {
        console.error('[SECCION9] ❌ Error cargando condición ocupación:', err);
      }
    });

    // 3. Cargar Materiales de Construcción desde /demograficos/materiales-construccion
    this.backendApi.postMaterialesConstruccion(codigos).subscribe({
      next: (response: any) => {
        try {
          const dataRaw = response?.data || [];
          const datosDesenvueltos = unwrapDemograficoData(dataRaw);
          const datosTransformados = transformMaterialesConstruccionDesdeBackend(datosDesenvueltos);
          
          console.log('[SECCION9] 🔍 RAW DATA:', dataRaw);
          console.log('[SECCION9] 🔍 DATOS DESENVUELTOS:', datosDesenvueltos);
          console.log('[SECCION9] ✅ Datos de materiales construcción TRANSFORMADOS:', datosTransformados);
          
          // Guardar CON prefijo y SIN prefijo (fallback)  
          if (datosTransformados.length > 0) {
            const tablaKey = `tiposMaterialesTabla${prefijo}`;
            console.log('[SECCION9] 💾 Guardando en clave:', tablaKey);
            console.log('[SECCION9] 💾 Primer item guardado:', datosTransformados[0]);
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            this.projectFacade.setField(this.seccionId, null, 'tiposMaterialesTabla', datosTransformados);
          }
        } catch (err) {
          console.error('[SECCION9] Error procesando materiales construcción:', err);
        }
      },
      error: (err) => {
        console.error('[SECCION9] ❌ Error cargando materiales construcción:', err);
      }
    });
  }

  // ============================================================================
  // ✅ CONFIGURACIÓN DE TABLAS - USANDO TABLECONFIG DEL PATRÓN
  // ============================================================================

  // ✅ CONFIGURACIÓN DE TABLA 1: Condición de Ocupación (Solo Lectura)
  get condicionOcupacionConfig(): TableConfig {
    return {
      ...SECCION9_TABLA_CONDICION_OCUPACION_CONFIG,
      tablaKey: this.getTablaKeyCondicionOcupacion()
    };
  }

  getTablaKeyCondicionOcupacion(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `condicionOcupacionTabla${prefijo}` : 'condicionOcupacionTabla';
  }

  onCondicionOcupacionTableUpdated(updatedData?: any[]): void {
    // ✅ Para tablas de solo lectura, no hay cambios manuales
    // Los datos solo vienen del backend
    console.log('[SECCION9] ℹ️ Tabla condición ocupación es de solo lectura');
  }

  // ✅ CONFIGURACIÓN DE TABLA 2: Tipos de Materiales (Solo Lectura)
  get tiposMaterialesConfig(): TableConfig {
    return {
      ...SECCION9_TABLA_TIPOS_MATERIALES_CONFIG,
      tablaKey: this.getTablaKeyTiposMateriales()
    };
  }

  getTablaKeyTiposMateriales(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `tiposMaterialesTabla${prefijo}` : 'tiposMaterialesTabla';
  }

  onTiposMaterialesTableUpdated(updatedData?: any[]): void {
    // ✅ Para tablas de solo lectura, no hay cambios manuales
    // Los datos solo vienen del backend
    console.log('[SECCION9] ℹ️ Tabla tipos materiales es de solo lectura');
  }

  // ✅ NÚMEROS DE CUADROS DINÁMICOS (ahora usando GlobalNumberingService)
  obtenerNumeroCuadroCondicionOcupacion(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  }

  obtenerNumeroCuadroTiposMateriales(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  /**
   * ✅ Helper para templates - retorna prefijo de grupo para uso en HTML
   */
  obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  /**
   * ✅ Helper interno - obtener prefijo de grupo para métodos
   */
  protected override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }
}
