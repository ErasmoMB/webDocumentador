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
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
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

/**
 * ✅ Normaliza una etiqueta de material removiendo tildes, espacios extra, etc.
 */
const normalizeMaterialLabel = (raw: string): string => {
  if (!raw) return '';
  let s = String(raw).toLowerCase().trim();
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');  // Remover tildes
  return s;
};

/**
 * ✅ Extrae palabras significativas (removiendo stopwords y caracteres especiales)
 * Retorna array ordenado de palabras clave
 */
const extractSignificantWords = (raw: string): string[] => {
  const normalized = normalizeMaterialLabel(raw);
  
  // Stopwords comunes en construcción (español)
  const stopwords = new Set([
    'el', 'la', 'los', 'las', 'de', 'del', 'con', 'sin', 'en', 'o', 'y', 'e',
    'es', 'son', 'un', 'una', 'por', 'para', 'a', 'al', 'que', 'o', 'u'
  ]);

  // Remover caracteres especiales, separar por espacios/puntuación
  const words = normalized
    .replace(/[\/\\\-,;().]/g, ' ')  // Reemplazar separadores por espacio
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopwords.has(w))  // Filtrar stopwords y palabras muy cortas
    .sort();  // Ordenar alfabéticamente

  return words;
};

/**
 * ✅ Crea clave de búsqueda uniendo palabras ordenadas
 */
const createMaterialSearchKey = (raw: string): string => {
  const words = extractSignificantWords(raw);
  return words.join(' ');
};

/**
 * ✅ Calcula similitud entre dos sets de palabras (0-1)
 * Si coinciden >= 80% de las palabras, son el mismo material
 */
const calculateWordSimilarity = (words1: string[], words2: string[]): number => {
  if (words1.length === 0 && words2.length === 0) return 1;
  if (words1.length === 0 || words2.length === 0) return 0;

  // Contar palabras en común
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const common = [...set1].filter(w => set2.has(w)).length;

  // Similitud = palabras en común / máximo de palabras
  const maxLen = Math.max(set1.size, set2.size);
  return maxLen > 0 ? common / maxLen : 0;
};

/**
 * ✅ Elige la etiqueta más legible entre dos variantes
 * Preferir versiones con comas sobre "/" (ej: "Triplay, calamina, estera" vs "Triplay/Calamina/Estera")
 */
const choosePreferredMaterialLabel = (current: string, incoming: string): string => {
  const a = String(current || '').trim();
  const b = String(incoming || '').trim();
  if (!a) return b;
  if (!b) return a;

  const aHasSlash = a.includes('/');
  const bHasSlash = b.includes('/');
  const aHasComma = a.includes(',');
  const bHasComma = b.includes(',');

  // Preferir versiones con comas frente a versiones con "/" (más legible)
  if (aHasSlash && bHasComma && !bHasSlash) return b;
  if (bHasSlash && aHasComma && !aHasSlash) return a;

  // Si uno es más descriptivo (más largo), mantenerlo
  if (b.length > a.length && a.length < 20) return b;
  return a;
};

/**
 * ✅ Deduplica materiales comparando similitud de palabras clave
 * Agrupa + suma casos + recalcula porcentajes + filas Total
 */
const deduplicateMateriales = (data: any[]): any[] => {
  if (!Array.isArray(data) || data.length === 0) return data;

  // Estructura: categoría → array de materiales deduplicados
  const byCategory = new Map<string, Array<{ display: string; casos: number; words: string[] }>>();

  for (const item of data) {
    const categoria = item.categoria?.trim();
    const tipoMaterial = item.tipoMaterial?.trim();
    
    if (!categoria || !tipoMaterial) continue;
    
    // Ignorar filas Total
    if (tipoMaterial.toLowerCase() === 'total') continue;

    // Extraer palabras clave
    const words = extractSignificantWords(tipoMaterial);
    if (words.length === 0) continue;

    // Inicializar bucket de categoría
    if (!byCategory.has(categoria)) {
      byCategory.set(categoria, []);
    }
    const bucket = byCategory.get(categoria)!;

    // Buscar si ya existe un material similar (similitud >= 80%)
    let found = false;
    for (const existing of bucket) {
      const similarity = calculateWordSimilarity(existing.words, words);
      if (similarity >= 0.8) {
        // Duplicado encontrado: sumar casos + elegir mejor etiqueta
        existing.casos += (item.casos || 0);
        existing.display = choosePreferredMaterialLabel(existing.display, tipoMaterial);
        found = true;
        break;
      }
    }

    // Si no encontró duplicado, agregar como nuevo
    if (!found) {
      bucket.push({
        display: tipoMaterial,
        casos: item.casos || 0,
        words
      });
    }
  }

  // Reconstruir array de salida: datos deduplicados + recalcular porcentajes y totales
  const result: any[] = [];
  
  for (const [categoria, materialesArray] of byCategory.entries()) {
    const totalCategoria = materialesArray.reduce((sum, it) => sum + (it.casos || 0), 0);

    // Agregar cada material deduplicado
    for (const item of materialesArray) {
      result.push({
        categoria,
        tipoMaterial: item.display,
        casos: item.casos || 0,
        porcentaje: totalCategoria > 0 
          ? `${((100 * (item.casos || 0)) / totalCategoria).toFixed(2)} %`
          : '0.00 %'
      });
    }

    // Agregar fila Total recalculada
    result.push({
      categoria,
      tipoMaterial: 'Total',
      casos: totalCategoria,
      porcentaje: totalCategoria > 0 ? '100.00 %' : '0.00 %'
    });
  }

  return result;
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
    private backendApi: BackendApiService,
    private formChange: FormChangeService  // ✅ Para persistencia en Redis
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
          let datosTransformados = transformMaterialesConstruccionDesdeBackend(datosDesenvueltos);
          
          // ✅ Aplicar deduplicación para agrupar variantes semánticas
          datosTransformados = deduplicateMateriales(datosTransformados);
          
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
    // ✅ LEER DEL SIGNAL REACTIVO
    const formData = this.formDataSignal();
    const tablaKey = this.getTablaKeyCondicionOcupacion();
    const tablaActual = updatedData || formData[tablaKey] || [];
    
    // ✅ GUARDAR EN PROJECTSTATEFACADE
    this.projectFacade.setField(this.seccionId, null, tablaKey, tablaActual);
    this.projectFacade.setField(this.seccionId, null, 'condicionOcupacionTabla', tablaActual);
    
    // ✅ PERSISTIR EN REDIS
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaActual }, { notifySync: true });
      console.log(`[SECCION9] ✅ CondicionOcupacion data saved to session-data`);
    } catch (e) {
      console.error(`[SECCION9] ⚠️ Could not save to session-data:`, e);
    }
    
    this.cdRef.markForCheck();
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
    // ✅ LEER DEL SIGNAL REACTIVO
    const formData = this.formDataSignal();
    const tablaKey = this.getTablaKeyTiposMateriales();
    const tablaActual = updatedData || formData[tablaKey] || [];
    
    // ✅ GUARDAR EN PROJECTSTATEFACADE
    this.projectFacade.setField(this.seccionId, null, tablaKey, tablaActual);
    this.projectFacade.setField(this.seccionId, null, 'tiposMaterialesTabla', tablaActual);
    
    // ✅ PERSISTIR EN REDIS
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaActual }, { notifySync: true });
      console.log(`[SECCION9] ✅ TiposMateriales data saved to session-data`);
    } catch (e) {
      console.error(`[SECCION9] ⚠️ Could not save to session-data:`, e);
    }
    
    this.cdRef.markForCheck();
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
