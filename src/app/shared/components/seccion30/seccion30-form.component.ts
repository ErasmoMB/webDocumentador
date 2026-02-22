import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { TableMockMergeService } from 'src/app/core/services/tables/table-mock-merge.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { transformNivelEducativoDesdeDemograficos, transformTasaAnalfabetismoDesdeDemograficos } from 'src/app/core/config/table-transforms';
import { SECCION30_TEMPLATES, SECCION30_TABLE_CONFIG, SECCION30_CONFIG, SECCION30_WATCHED_FIELDS } from './seccion30-constants';

// ✅ Helper para desenvuelver datos del backend (respuesta del endpoint)
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
  imports: [CommonModule, FormsModule, CoreSharedModule],
  selector: 'app-seccion30-form',
  templateUrl: './seccion30-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class Seccion30FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION30_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = false;

  // ✅ EXPORTAR CONSTANTS PARA USAR EN TEMPLATE
  readonly SECCION30_TEMPLATES = SECCION30_TEMPLATES;

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  override readonly PHOTO_PREFIX: string;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION30_WATCHED_FIELDS;

  // Textos por defecto - Ahora desde CONSTANTS ✅
  readonly PARRAFO_INTRO_DEFAULT = SECCION30_TEMPLATES.parrafoIntroDefault;
  readonly TITULO_NIVEL_EDUCATIVO_DEFAULT = SECCION30_TEMPLATES.tituloNivelEducativoDefault;
  readonly FUENTE_NIVEL_EDUCATIVO_DEFAULT = SECCION30_TEMPLATES.fuenteNivelEducativoDefault;
  readonly TITULO_TASA_ANALFABETISMO_DEFAULT = SECCION30_TEMPLATES.tituloTasaAnalfabetismoDefault;
  readonly FUENTE_TASA_ANALFABETISMO_DEFAULT = SECCION30_TEMPLATES.fuenteTasaAnalfabetismoDefault;

  // Estructuras iniciales ELIMINADAS por request del usuario
  
  nivelEducativoDynamicConfig = SECCION30_TABLE_CONFIG.nivelEducativo;
  tasaAnalfabetismoDynamicConfig = SECCION30_TABLE_CONFIG.tasaAnalfabetismo;

  // ✅ COLUMNAS COMO SIGNALS - Evita problemas con caracteres acentuados en templates
  readonly nivelEducativoColumnasSignal: Signal<any[]> = computed(() => [
    { field: 'nivel', label: SECCION30_TEMPLATES.lblCategoría, type: 'text' },
    { field: 'casos', label: SECCION30_TEMPLATES.lblCasos, type: 'number' },
    { field: 'porcentaje', label: SECCION30_TEMPLATES.lblPorcentaje, type: 'text' }
  ]);

  readonly tasaAnalfabetismoColumnasSignal: Signal<any[]> = computed(() => [
    { field: 'indicador', label: SECCION30_TEMPLATES.lblIndicador, type: 'text' },
    { field: 'casos', label: SECCION30_TEMPLATES.lblCasos, type: 'number' },
    { field: 'porcentaje', label: SECCION30_TEMPLATES.lblPorcentaje, type: 'text' }
  ]);

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  // ✅ PÁRRAFO INTRO con fallback y prefijo de grupo
  readonly parrafoSignal: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const campo = `parrafoSeccion30_indicadores_educacion_intro${prefijo}`;
    const manual = this.projectFacade.selectField(this.seccionId, null, campo)();
    return manual && manual.trim().length > 0 ? manual : this.PARRAFO_INTRO_DEFAULT;
  });

  // ✅ TEXTO NIVEL EDUCATIVO con fallback y prefijo de grupo
  readonly textoNivelEducativoSignal: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const campo = `textoNivelEducativo${prefijo}`;
    const manual = this.projectFacade.selectField(this.seccionId, null, campo)();
    const cp = this.obtenerNombreCentroPobladoActual()
      || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')()
      || '____';
    if (manual && manual.trim().length > 0) return manual;
    return SECCION30_TEMPLATES.textoNivelEducativoDefault(cp);
  });

  // ✅ TEXTO TASA ANALFABETISMO con fallback y prefijo de grupo
  readonly textoTasaAnalfabetismoSignal: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const campo = `textoTasaAnalfabetismo${prefijo}`;
    const manual = this.projectFacade.selectField(this.seccionId, null, campo)();
    const cp = this.obtenerNombreCentroPobladoActual()
      || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')()
      || '____';
    if (manual && manual.trim().length > 0) return manual;
    return SECCION30_TEMPLATES.textoTasaAnalfabetismoDefault(cp);
  });

  // ✅ TÍTULOS Y FUENTES DE TABLAS
  readonly tituloNivelEducativoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'tituloNivelEducativo')();
    const cp = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || this.obtenerNombreCentroPobladoActual() || '____';
    return manual && manual.trim().length > 0 ? manual : `${this.TITULO_NIVEL_EDUCATIVO_DEFAULT} – CP ${cp} (2017)`;
  });

  readonly fuenteNivelEducativoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'fuenteNivelEducativo')();
    return manual && manual.trim().length > 0 ? manual : this.FUENTE_NIVEL_EDUCATIVO_DEFAULT;
  });

  readonly tituloTasaAnalfabetismoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'tituloTasaAnalfabetismo')();
    const cp = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || this.obtenerNombreCentroPobladoActual() || '____';
    return manual && manual.trim().length > 0 ? manual : `${this.TITULO_TASA_ANALFABETISMO_DEFAULT} – CP ${cp} (2017)`;
  });

  readonly fuenteTasaAnalfabetismoSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'fuenteTasaAnalfabetismo')();
    return manual && manual.trim().length > 0 ? manual : this.FUENTE_TASA_ANALFABETISMO_DEFAULT;
  });

  // ✅ CENTRO POBLADO
  readonly centroPobladoSignal: Signal<string> = computed(() => {
    return this.obtenerNombreCentroPobladoActual()
      || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')()
      || '____';
  });

  readonly nivelEducativoSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `nivelEducativoTabla${prefijo}` : 'nivelEducativoTabla';
    const v = this.projectFacade.selectField(this.seccionId, null, tablaKey)()
      ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return Array.isArray(v) ? v : [];
  });

  readonly tasaAnalfabetismoSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `tasaAnalfabetismoTabla${prefijo}` : 'tasaAnalfabetismoTabla';
    const v = this.projectFacade.selectField(this.seccionId, null, tablaKey)()
      ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return Array.isArray(v) ? v : [];
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      if (imagen) {
        fotos.push({ titulo: titulo || `Fotografía ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
      }
    }
    return fotos;
  });
  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });
  // ✅ VIEWMODEL COMPLETO
  readonly viewModel: Signal<any> = computed(() => ({
    parrafo: this.parrafoSignal(),
    textoNivelEducativo: this.textoNivelEducativoSignal(),
    textoTasaAnalfabetismo: this.textoTasaAnalfabetismoSignal(),
    tituloNivelEducativo: this.tituloNivelEducativoSignal(),
    fuenteNivelEducativo: this.fuenteNivelEducativoSignal(),
    tituloTasaAnalfabetismo: this.tituloTasaAnalfabetismoSignal(),
    fuenteTasaAnalfabetismo: this.fuenteTasaAnalfabetismoSignal(),
    centroPoblado: this.centroPobladoSignal(),
    nivelEducativo: this.nivelEducativoSignal(),
    tasaAnalfabetismo: this.tasaAnalfabetismoSignal(),
    fotos: this.fotosCacheSignal()
  }));

  private mockMergeService: TableMockMergeService;
  private tableFacade: TableManagementFacade;
  private tablasYaInicializadas = new Set<string>(); // Evitar bucles de inicialización

  constructor(
    cdRef: ChangeDetectorRef, 
    injector: Injector, 
    private formChange: FormChangeService,
    private backendApi: BackendApiService
  ) {
    super(cdRef, injector);
    this.mockMergeService = injector.get(TableMockMergeService);
    this.tableFacade = injector.get(TableManagementFacade);

    // ✅ Inicializar PHOTO_PREFIX dinámicamente
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = 'fotografiaCahuacho';

    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    // Monitor photo fields to force re-evaluation and mark for check
    effect(() => {
      this.photoFieldsHash();
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });

    // ✅ CRÍTICO: Escuchar cambios en signals de tabla y forzar detección de cambios
    effect(() => {
      this.nivelEducativoSignal();
      this.tasaAnalfabetismoSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    // ✅ 1. Inicializar tablas como vacías primero
    this.inicializarTablasVacias();

    // ✅ 2. Cargar datos del backend (Métodos POST demográficos)
    this.cargarDatosDelBackend();

    // ✅ 3. AUTO-LLENAR centroPobladoAISI con el nombre del grupo AISI actual
    const centroPobladoAISI = this.obtenerCentroPobladoAISI();
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
    
    // Actualizar tanto el objeto local como el store
    this.datos[campoConPrefijo] = centroPobladoAISI;
    this.datos['centroPobladoAISI'] = centroPobladoAISI;
    this.projectFacade.setField(this.seccionId, null, campoConPrefijo, centroPobladoAISI);
    this.onFieldChange(campoConPrefijo, centroPobladoAISI, { refresh: false });
    
    this.cargarFotografias();
  }

  /**
   * ✅ Inicializa las tablas como vacías si no hay datos
   */
  private inicializarTablasVacias(): void {
    const tablas = ['nivelEducativoTabla', 'tasaAnalfabetismoTabla'];
    
    tablas.forEach(tablaKey => {
      if (this.tablasYaInicializadas.has(tablaKey)) {
        return;
      }
      const datosActuales = this.projectFacade.selectField(this.seccionId, null, tablaKey)()
        ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
      if (!Array.isArray(datosActuales) || datosActuales.length === 0) {
        this.tablasYaInicializadas.add(tablaKey);
        this.projectFacade.setField(this.seccionId, null, tablaKey, []);
        this.onFieldChange(tablaKey, []);
      }
    });
  }

  /**
   * ✅ Carga datos de los endpoints del backend para las tablas de educación
   * - nivelEducativoTabla: /demograficos/educacion
   * - tasaAnalfabetismoTabla: /demograficos/alfabetizacion
   * 
   * PATRÓN: 100% datos del backend, tablas de solo lectura
   */
  private cargarDatosDelBackend(): void {
    // ✅ USAR getCodigosCentrosPobladosAISI() DEL GRUPO ACTUAL (clase base)
    const codigosArray = this.getCodigosCentrosPobladosAISI();
    const codigos = [...codigosArray]; // Crear copia mutable para el API

    if (!codigos || codigos.length === 0) {
      console.warn('[SECCION30] ⚠️ No hay centros poblados en el grupo actual para cargar datos');
      return;
    }

    console.log('[SECCION30] 📡 Cargando datos de educación desde backend...', { codigos });

    // ✅ OBTENER PREFIJO PARA GUARDAR CON CLAVE CORRECTA
    const prefijo = this.obtenerPrefijoGrupo();

    // ✅ 1. CARGAR DATOS DE NIVEL EDUCATIVO
    this.backendApi.postEducacion(codigos).subscribe({
      next: (response: any) => {
        try {
          const dataRaw = response?.data || [];
          // Desenvuelver datos del backend
          const datosDesenvueltos = unwrapDemograficoData(dataRaw);
          const datosTransformados = transformNivelEducativoDesdeDemograficos(datosDesenvueltos);
          console.log('[SECCION30] ✅ Datos de nivel educativo cargados:', datosTransformados);
          
          // Guardar en el state CON PREFIJO y SIN PREFIJO (fallback)
          if (datosTransformados.length > 0) {
            const tablaKey = `nivelEducativoTabla${prefijo}`;
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            // También guardar sin prefijo para fallback
            this.projectFacade.setField(this.seccionId, null, 'nivelEducativoTabla', datosTransformados);
            this.cdRef.markForCheck();
          }
        } catch (e) {
          console.error('[SECCION30] ❌ Error transformando datos de nivel educativo:', e);
        }
      },
      error: (err: any) => {
        console.error('[SECCION30] ❌ Error cargando nivel educativo:', err);
      }
    });

    // ✅ 2. CARGAR DATOS DE TASA DE ANALFABETISMO (Alfabetización)
    this.backendApi.postAlfabetizacion(codigos).subscribe({
      next: (response: any) => {
        try {
          const dataRaw = response?.data || [];
          // Desenvuelver datos del backend
          const datosDesenvueltos = unwrapDemograficoData(dataRaw);
          const datosTransformados = transformTasaAnalfabetismoDesdeDemograficos(datosDesenvueltos);
          console.log('[SECCION30] ✅ Datos de analfabetismo cargados:', datosTransformados);
          
          // Guardar en el state CON PREFIJO y SIN PREFIJO (fallback)
          if (datosTransformados.length > 0) {
            const tablaKey = `tasaAnalfabetismoTabla${prefijo}`;
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            // También guardar sin prefijo para fallback
            this.projectFacade.setField(this.seccionId, null, 'tasaAnalfabetismoTabla', datosTransformados);
            this.cdRef.markForCheck();
          }
        } catch (e) {
          console.error('[SECCION30] ❌ Error transformando datos de analfabetismo:', e);
        }
      },
      error: (err: any) => {
        console.error('[SECCION30] ❌ Error cargando analfabetismo:', err);
      }
    });
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  override ngOnDestroy(): void { super.ngOnDestroy(); }

  // ✅ ACTUALIZADORES DE TEXTO
  actualizarTexto(fieldId: string, valor: string): void {
    this.projectFacade.setField(this.seccionId, null, fieldId, valor);
    this.onFieldChange(fieldId, valor);
    try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
  }

  actualizarParrafo(valor: string): void {
    this.actualizarTexto('parrafoSeccion30_indicadores_educacion_intro', valor);
  }

  actualizarTextoNivelEducativo(valor: string): void {
    this.actualizarTexto('textoNivelEducativo', valor);
  }

  actualizarTextoTasaAnalfabetismo(valor: string): void {
    this.actualizarTexto('textoTasaAnalfabetismo', valor);
  }

  // ✅ ACTUALIZADORES DE TÍTULOS Y FUENTES
  actualizarTituloNivelEducativo(valor: string): void {
    this.actualizarTexto('tituloNivelEducativo', valor);
  }

  actualizarFuenteNivelEducativo(valor: string): void {
    this.actualizarTexto('fuenteNivelEducativo', valor);
  }

  actualizarTituloTasaAnalfabetismo(valor: string): void {
    this.actualizarTexto('tituloTasaAnalfabetismo', valor);
  }

  actualizarFuenteTasaAnalfabetismo(valor: string): void {
    this.actualizarTexto('fuenteTasaAnalfabetismo', valor);
  }

  // ✅ PATRÓN SECCIÓN 24: Override de onFotografiasChange para persistencia correcta
  override onFotografiasChange(fotografias: FotoItem[]): void {
    const prefix = this.PHOTO_PREFIX;
    const groupPrefix = this.obtenerPrefijoGrupo();
    const updates: Record<string, any> = {};
    
    // Paso 1: Limpiar slots anteriores (hasta 10)
    for (let i = 1; i <= 10; i++) {
      const imgKey = groupPrefix ? `${prefix}${i}Imagen${groupPrefix}` : `${prefix}${i}Imagen`;
      const titKey = groupPrefix ? `${prefix}${i}Titulo${groupPrefix}` : `${prefix}${i}Titulo`;
      const fuenteKey = groupPrefix ? `${prefix}${i}Fuente${groupPrefix}` : `${prefix}${i}Fuente`;
      updates[imgKey] = '';
      updates[titKey] = '';
      updates[fuenteKey] = '';
    }
    
    // Paso 2: Guardar nuevas fotos
    fotografias.forEach((foto, index) => {
      if (foto.imagen) {
        const idx = index + 1;
        const imgKey = groupPrefix ? `${prefix}${idx}Imagen${groupPrefix}` : `${prefix}${idx}Imagen`;
        const titKey = groupPrefix ? `${prefix}${idx}Titulo${groupPrefix}` : `${prefix}${idx}Titulo`;
        const fuenteKey = groupPrefix ? `${prefix}${idx}Fuente${groupPrefix}` : `${prefix}${idx}Fuente`;
        updates[imgKey] = foto.imagen;
        updates[titKey] = foto.titulo || '';
        updates[fuenteKey] = foto.fuente || '';
      }
    });
    
    // Paso 3: Persistir en ProjectFacade (capa 1)
    this.projectFacade.setFields(this.seccionId, null, updates);
    
    // Paso 4: Persistir en Backend (capa 2)
    try {
      this.formChange.persistFields(this.seccionId, 'images', updates);
    } catch (e) {
      console.error('[SECCION30] ⚠️ Error persistiendo imágenes:', e);
    }
    
    this.cdRef.markForCheck();
  }

  /**
   * ✅ Reordena la tabla para mantener la fila Total al final
   * Las filas que contienen "total" (case-insensitive) van al final
   */
  private reordenarTablaConTotal(tabla: any[], campoCategoria: string = 'nivel'): any[] {
    if (!Array.isArray(tabla)) return [];
    
    const filasNormales: any[] = [];
    const filasTotal: any[] = [];
    
    tabla.forEach(fila => {
      const categoria = (fila[campoCategoria] || '').toString().toLowerCase();
      if (categoria.includes('total')) {
        filasTotal.push(fila);
      } else {
        filasNormales.push(fila);
      }
    });
    
    return [...filasNormales, ...filasTotal];
  }

  /**
   * ✅ Calcula el total de casos y ajusta porcentajes para Nivel Educativo
   * La fila Total debe mostrar 100% en el porcentaje
   */
  private calcularTotalYNivelEducativo(tabla: any[]): any[] {
    if (!Array.isArray(tabla)) return [];
    
    let totalCasos = 0;
    
    // Calcular suma de casos de filas normales (sin "total")
    tabla.forEach(fila => {
      const nivel = (fila.nivel || '').toString().toLowerCase();
      if (!nivel.includes('total')) {
        const casos = parseFloat(fila.casos) || 0;
        totalCasos += casos;
      }
    });
    
    // Actualizar filas: calcular porcentajes y poner 100% en el de Total
    return tabla.map(fila => {
      const nivel = (fila.nivel || '').toString().toLowerCase();
      const casos = parseFloat(fila.casos) || 0;
      
      if (nivel.includes('total')) {
        // Para fila Total: usar el total calculado y mostrar 100%
        return { ...fila, casos: totalCasos, porcentaje: '100.00 %' };
      } else {
        // Para filas normales: calcular porcentaje
        const porcentaje = totalCasos > 0 ? ((casos / totalCasos) * 100).toFixed(2) + ' %' : '0.00 %';
        return { ...fila, porcentaje };
      }
    });
  }

  /**
   * ✅ Calcula el total de casos y ajusta porcentajes para Tasa Analfabetismo
   * La fila Total debe mostrar 100% en el porcentaje
   */
  private calcularTotalYTasaAnalfabetismo(tabla: any[]): any[] {
    if (!Array.isArray(tabla)) return [];
    
    let totalCasos = 0;
    
    // Calcular suma de casos de filas normales (sin "total")
    tabla.forEach(fila => {
      const indicador = (fila.indicador || '').toString().toLowerCase();
      if (!indicador.includes('total')) {
        const casos = parseFloat(fila.casos) || 0;
        totalCasos += casos;
      }
    });
    
    // Actualizar filas: calcular porcentajes y poner 100% en el de Total
    return tabla.map(fila => {
      const indicador = (fila.indicador || '').toString().toLowerCase();
      const casos = parseFloat(fila.casos) || 0;
      
      if (indicador.includes('total')) {
        // Para fila Total: usar el total calculado y mostrar 100%
        return { ...fila, casos: totalCasos, porcentaje: '100.00 %' };
      } else {
        // Para filas normales: calcular porcentaje
        const porcentaje = totalCasos > 0 ? ((casos / totalCasos) * 100).toFixed(2) + ' %' : '0.00 %';
        return { ...fila, porcentaje };
      }
    });
  }

  onNivelEducativoTableUpdated(): void {
    // ✅ Igual que Sección 26
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `nivelEducativoTabla${prefijo}` : 'nivelEducativoTabla';
    
    // ✅ Leer datos del formDataSignal
    let tabla = this.formDataSignal()[tablaKey] ? [...this.formDataSignal()[tablaKey]] : [];
    
    // ✅ CLON PROFUNDO para evitar compartir referencias
    tabla = JSON.parse(JSON.stringify(tabla));
    
    // ✅ Reordenar para mantener Total al final
    tabla = this.reordenarTablaConTotal(tabla, 'nivel');
    
    // ✅ Calcular totales y porcentajes
    tabla = this.calcularTotalYNivelEducativo(tabla);
    
    // ✅ Guardar en projectFacade y persistir (igual que Sección 26)
    try {
      this.projectFacade.setField(this.seccionId, null, tablaKey, tabla);
      this.projectFacade.setField(this.seccionId, null, 'nivelEducativoTabla', tabla);
    } catch (e) {}

    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tabla, 'nivelEducativoTabla': tabla }, { notifySync: true });
    } catch (e) {}
    
    this.cdRef.markForCheck();
  }

  onTasaAnalfabetismoTableUpdated(): void {
    // ✅ Igual que Sección 26
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `tasaAnalfabetismoTabla${prefijo}` : 'tasaAnalfabetismoTabla';
    
    // ✅ Leer datos del formDataSignal
    let tabla = this.formDataSignal()[tablaKey] ? [...this.formDataSignal()[tablaKey]] : [];
    
    // ✅ CLON PROFUNDO para evitar compartir referencias
    tabla = JSON.parse(JSON.stringify(tabla));
    
    // ✅ Reordenar para mantener Total al final
    tabla = this.reordenarTablaConTotal(tabla, 'indicador');
    
    // ✅ Calcular totales y porcentajes
    tabla = this.calcularTotalYTasaAnalfabetismo(tabla);
    
    // ✅ Guardar en projectFacade y persistir (igual que Sección 26)
    try {
      this.projectFacade.setField(this.seccionId, null, tablaKey, tabla);
      this.projectFacade.setField(this.seccionId, null, 'tasaAnalfabetismoTabla', tabla);
    } catch (e) {}

    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tabla, 'tasaAnalfabetismoTabla': tabla }, { notifySync: true });
    } catch (e) {}
    
    this.cdRef.markForCheck();
  }

  trackByIndex(index: number): number { return index; }

  // ✅ Métodos para retornar datos de tabla formateados para binding
  getNivelEducativoTablaKey(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `nivelEducativoTabla${prefijo}` : 'nivelEducativoTabla';
  }

  getTasaAnalfabetismoTablaKey(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `tasaAnalfabetismoTabla${prefijo}` : 'tasaAnalfabetismoTabla';
  }

  getNivelEducativoTablaData(): Record<string, any[]> {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `nivelEducativoTabla${prefijo}` : 'nivelEducativoTabla';
    return { [tablaKey]: this.nivelEducativoSignal() };
  }

  getTasaAnalfabetismoTablaData(): Record<string, any[]> {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `tasaAnalfabetismoTabla${prefijo}` : 'tasaAnalfabetismoTabla';
    return { [tablaKey]: this.tasaAnalfabetismoSignal() };
  }
}
