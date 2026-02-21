import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, effect } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { SECCION13_PHOTO_PREFIX, SECCION13_TEMPLATES } from './seccion13-constants';

// ============================================================================
// HELPER FUNCTIONS - TRANSFORMACIÓN DE DATOS
// ============================================================================

/**
 * 🔄 Desenvuelve datos del backend (maneja diferentes formatos de respuesta)
 * El backend puede devolver datos en diferentes estructuras
 */
const unwrapAfiliacionSaludData = (responseData: any): any[] => {
  if (!responseData) return [];
  
  // Si es un array
  if (Array.isArray(responseData)) {
    // Si es un array de objetos con "rows" (formato: [{ rows: [...] }])
    if (responseData.length > 0 && responseData[0]?.rows && Array.isArray(responseData[0].rows)) {
      return responseData[0].rows;
    }
    // Si es un array directo de datos
    return responseData;
  }
  
  // Si tiene estructura con rows
  if (responseData.rows && Array.isArray(responseData.rows)) {
    return responseData.rows;
  }
  
  // Si tiene estructura data.rows
  if (responseData.data && Array.isArray(responseData.data)) {
    return responseData.data;
  }
  
  return [];
};

/**
 * 🔄 Transforma datos desde `/demograficos/seguro-salud`
 * Mapea el formato del backend directamente a la tabla
 * ✅ SIN FILTROS, SIN MODIFICACIONES - devuelve exactamente lo del backend
 */
const transformAfiliacionSaludDesdeBackend = (data: any[]): any[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  // ✅ Mapeo directo - sin filtrar "Total referencial"
  return data.map((item: any) => ({
    categoria: item.categoria || '',
    casos: item.casos !== undefined ? item.casos : 0,
    porcentaje: item.porcentaje || ''
  }));
};

@Component({
  selector: 'app-seccion13-form',
  templateUrl: './seccion13-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  standalone: true
})
export class Seccion13FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.9';
  @Input() override modoFormulario: boolean = false;

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION13_TEMPLATES = SECCION13_TEMPLATES;
  override readonly PHOTO_PREFIX = 'fotografiaSaludIndicadores';
  override useReactiveSync: boolean = true;

  fotografiasSeccion13: FotoItem[] = [];
  private readonly regexCache = new Map<string, RegExp>();

  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  // ✅ Helper para obtener prefijo
  private obtenerPrefijo(): string {
    return this.obtenerPrefijoGrupo();
  }

  readonly natalidadMortalidadTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `natalidadMortalidadTabla${prefijo}`;
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return fromField ?? fromTable ?? [];
  });

  readonly morbilidadTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `morbilidadTabla${prefijo}`;
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return fromField ?? fromTable ?? [];
  });

  readonly afiliacionSaludTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `afiliacionSaludTabla${prefijo}`;
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return fromField ?? fromTable ?? [];
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ CONFIGURACIONES DE TABLAS - Patrón MODO IDEAL
  readonly natalidadMortalidadConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `natalidadMortalidadTabla${this.obtenerPrefijo()}`,
    totalKey: '',
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    noInicializarDesdeEstructura: false,
    estructuraInicial: [
      { anio: '', natalidad: 0, mortalidad: 0 }
    ]
  }));

  readonly morbilidadConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `morbilidadTabla${this.obtenerPrefijo()}`,
    totalKey: 'grupo',
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    noInicializarDesdeEstructura: false,
    estructuraInicial: [
      { grupo: '', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 }
    ]
  }));

  readonly afiliacionSaludConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `afiliacionSaludTabla${this.obtenerPrefijo()}`,
    totalKey: '',                    // ✅ Sin fila de total
    campoTotal: '',                  // ✅ Sin cálculo total
    campoPorcentaje: '',             // ✅ Sin cálculo porcentaje
    calcularPorcentajes: false,      // ✅ No calcular automáticamente
    camposParaCalcular: ['casos', 'porcentaje'],  // Los campos ya vienen calculados del backend
    noInicializarDesdeEstructura: true,  // ✅ No inicializar vacía
    permiteAgregarFilas: true,
    permiteEliminarFilas: true
  }));

  // ✅ REFACTOR: Usar ubicacionGlobal
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

  // ✅ COLUMNAS PARA TABLAS - Patrón MODO IDEAL
  readonly columnasNatalidadMortalidad = [
    { field: 'anio', label: 'Año', type: 'text' as const, placeholder: '2023' },
    { field: 'natalidad', label: 'Natalidad', type: 'number' as const, placeholder: '0' },
    { field: 'mortalidad', label: 'Mortalidad', type: 'number' as const, placeholder: '0' }
  ];

  readonly columnasMorbilidad = [
    { field: 'grupo', label: 'Grupo de Morbilidad', type: 'text' as const, placeholder: 'Infecciones agudas' },
    { field: 'rango0_11', label: '0 – 11', type: 'number' as const, placeholder: '0' },
    { field: 'rango12_17', label: '12 – 17', type: 'number' as const, placeholder: '0' },
    { field: 'rango18_29', label: '18 – 29', type: 'number' as const, placeholder: '0' },
    { field: 'rango30_59', label: '30 – 59', type: 'number' as const, placeholder: '0' },
    { field: 'rango60', label: '60 ->', type: 'number' as const, placeholder: '0' },
    { field: 'casos', label: 'Casos Totales', type: 'number' as const, placeholder: '0', readonly: true }
  ];

  readonly columnasAfiliacionSalud = [
    { field: 'categoria', label: 'Categoría', type: 'text' as const, placeholder: 'SIS' },
    { field: 'casos', label: 'Casos', type: 'number' as const, placeholder: '0' },
    { field: 'porcentaje', label: 'Porcentaje', type: 'text' as const, placeholder: '0%', readonly: true }
  ];

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private globalNumbering: GlobalNumberingService,
    private backendApi: BackendApiService
  ) {
    super(cdRef, injector);

    effect(() => {
      const sectionData = this.formDataSignal();
      this.datos = { ...sectionData };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    // ✅ PATRÓN: Cargar datos desde backend
    this.inicializarTablasVacias();  // Primero vacías
    this.cargarDatosDelBackend();    // Luego llenar con backend
  }

  /**
   * 🔄 Inicializa la tabla de afiliación como array vacío
   * Sin estructura inicial, sin filas de total
   */
  private inicializarTablasVacias(): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `afiliacionSaludTabla${prefijo}`;
    
    // Inicializar como array vacío
    this.projectFacade.setField(this.seccionId, null, tablaKey, []);
    this.projectFacade.setField(this.seccionId, null, 'afiliacionSaludTabla', []);
    
    console.log(`[SECCION13] ✅ Tabla ${tablaKey} inicializada vacía`);
  }

  /**
   * 🔄 Carga datos de afiliación de salud desde el backend
   * Endpoint: POST /demograficos/seguro-salud
   * ✅ PATRÓN: Solo lectura - los datos vienen tal cual del backend
   */
  private cargarDatosDelBackend(): void {
    // 1. Obtener los códigos de centros poblados del grupo actual AISD
    const codigosArray = this.getCodigosCentrosPobladosAISD();
    const codigos = [...codigosArray]; // Copia mutable

    if (!codigos || codigos.length === 0) {
      console.warn('[SECCION13] ⚠️ No hay centros poblados en el grupo AISD actual');
      return;
    }

    console.log('[SECCION13] 📡 Cargando datos de afiliación de salud desde backend...');
    console.log('[SECCION13] 📍 Centros poblados:', codigos);

    // 2. Llamar al endpoint del backend
    this.backendApi.postSeguroSalud(codigos).subscribe({
      next: (response: any) => {
        try {
          // 3. Desenvuelver datos (maneja diferentes formatos de respuesta)
          const datosRaw = response?.data || [];
          const datosDesenvueltos = unwrapAfiliacionSaludData(datosRaw);
          
          console.log('[SECCION13] 📨 Respuesta del backend:', response);
          console.log('[SECCION13] 🔍 Datos desenvueltos:', datosDesenvueltos);

          // 4. Transformar (mapeo de campos - SIN FILTROS)
          const datosTransformados = transformAfiliacionSaludDesdeBackend(datosDesenvueltos);
          
          console.log('[SECCION13] ✨ Datos transformados:', datosTransformados);

          // 5. Guardar con prefijo del grupo actual
          const prefijo = this.obtenerPrefijo();
          const tablaKey = `afiliacionSaludTabla${prefijo}`;
          
          // ✅ Guardar directamente SIN cálculos adicionales
          // ✅ TODAS las filas incluyendo "Total referencial"
          this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
          this.projectFacade.setField(this.seccionId, null, 'afiliacionSaludTabla', datosTransformados);
          
          console.log(`[SECCION13] ✅ Tabla ${tablaKey} cargada con ${datosTransformados.length} filas del backend`);
          
          this.cdRef.markForCheck();
        } catch (error) {
          console.error('[SECCION13] ❌ Error procesando datos de afiliación:', error);
        }
      },
      error: (error: any) => {
        console.error('[SECCION13] ❌ Error cargando datos del backend:', error);
      }
    });
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void { }

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix);
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    this.cdRef.markForCheck();
  }

  override onFotografiasChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
    this.fotografiasSeccion13 = [...fotografias];
    this.cdRef.detectChanges();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  /**
   * ✅ REFACTOR (13/02/2026): Lee el distrito DIRECTAMENTE de la tabla "Ubicación referencial" de Sección 4
   * En lugar de usar ubicacionGlobal() que viene de Sección 1.
   * Patrón igual a Sección 18.
   */
  obtenerDistrito(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const seccion4Id = '3.1.4.A.1'; // Sección 4 - Caracterización socioeconómica
    const tablaKey = `tablaAISD1Datos${prefijo}`;
    
    // Lee tabla desde sección 4 (Ubicación referencial) - REACTIVO
    const tabla = this.projectFacade.selectField(seccion4Id, null, tablaKey)() || [];
    
    // Retorna distrito del primer registro
    if (Array.isArray(tabla) && tabla.length > 0 && tabla[0]?.distrito) {
      return tabla[0].distrito;
    }
    
    // Fallback: usar ubicacionGlobal como alternativa
    return this.ubicacionGlobal().distrito || '____';
  }

  // ✅ Sobrescribir onFieldChange para agregar prefijos automáticamente
  override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
    const prefijo = this.obtenerPrefijo();
    const campoConPrefijo = prefijo ? `${fieldId}${prefijo}` : fieldId;
    super.onFieldChange(campoConPrefijo, value, options);
  }

  getTablaKeyNatalidadMortalidad(): string {
    return `natalidadMortalidadTabla${this.obtenerPrefijo()}`;
  }

  getTablaKeyMorbilidad(): string {
    return `morbilidadTabla${this.obtenerPrefijo()}`;
  }

  getTablaKeyAfiliacionSalud(): string {
    return `afiliacionSaludTabla${this.obtenerPrefijo()}`;
  }

  obtenerTextoSeccion13NatalidadMortalidadCompleto(): string {
    if (this.datos.parrafoSeccion13_natalidad_mortalidad_completo) {
      return this.datos.parrafoSeccion13_natalidad_mortalidad_completo;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    return SECCION13_TEMPLATES.textoNatalidadMortalidadDefault.replace(/____/g, grupoAISD);
  }

  obtenerTextoSeccion13MorbilidadCompleto(): string {
    if (this.datos.parrafoSeccion13_morbilidad_completo) {
      return this.datos.parrafoSeccion13_morbilidad_completo;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    // ✅ REFACTOR (13/02/2026): Leer distrito de tabla S4 (dinámico)
    const distrito = this.obtenerDistrito();
    return SECCION13_TEMPLATES.textoMorbilidadDefault
      .replace(/____/g, (match, offset, string) => {
        // Primera ocurrencia: grupoAISD, segunda: distrito, tercera: grupoAISD
        const before = string.substring(0, offset);
        const countBefore = (before.match(/____/g) || []).length;
        if (countBefore === 0) return grupoAISD;
        if (countBefore === 1) return distrito;
        return grupoAISD;
      });
  }

  obtenerTextoAfiliacionSalud(): string {
    if (this.datos.textoAfiliacionSalud && this.datos.textoAfiliacionSalud !== '____') {
      return this.datos.textoAfiliacionSalud;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajeSIS = this.getPorcentajeSIS() || '____';
    const porcentajeESSALUD = this.getPorcentajeESSALUD() || '____';
    const porcentajeSinSeguro = this.getPorcentajeSinSeguro() || '____';
    return SECCION13_TEMPLATES.textoAfiliacionSaludDefault
      .replace(/____/g, (match, offset, string) => {
        const before = string.substring(0, offset);
        const countBefore = (before.match(/____/g) || []).length;
        if (countBefore === 0) return grupoAISD;
        if (countBefore === 1) return porcentajeSIS;
        if (countBefore === 2) return porcentajeESSALUD;
        return porcentajeSinSeguro;
      });
  }

  obtenerTituloCuadroNatalidad(): string {
    return this.datos['cuadroTituloNatalidadMortalidad'] || 
      SECCION13_TEMPLATES.cuadroTituloNatalidadMortalidadDefault.replace(/____/g, this.obtenerNombreComunidadActual());
  }

  obtenerFuenteCuadroNatalidad(): string {
    return this.datos['cuadroFuenteNatalidadMortalidad'] || SECCION13_TEMPLATES.cuadroFuenteNatalidadMortalidadDefault;
  }

  obtenerTituloCuadroMorbilidad(): string {
    // ✅ REFACTOR (13/02/2026): Leer distrito de tabla S4 (dinámico)
    const distrito = this.obtenerDistrito();
    return this.datos['cuadroTituloMorbilidad'] || 
      SECCION13_TEMPLATES.cuadroTituloMorbilidadDefault.replace(/____/g, distrito);
  }

  obtenerFuenteCuadroMorbilidad(): string {
    return this.datos['cuadroFuenteMorbilidad'] || SECCION13_TEMPLATES.cuadroFuenteMorbilidadDefault;
  }

  obtenerTituloCuadroAfiliacion(): string {
    return this.datos['cuadroTituloAfiliacionSalud'] || 
      SECCION13_TEMPLATES.cuadroTituloAfiliacionSaludDefault.replace(/____/g, this.obtenerNombreComunidadActual());
  }

  obtenerFuenteCuadroAfiliacion(): string {
    return this.datos['cuadroFuenteAfiliacionSalud'] || SECCION13_TEMPLATES.cuadroFuenteAfiliacionSaludDefault;
  }

  getMorbilidadSinTotal(): any[] {
    const tabla = this.morbilidadTablaSignal();
    if (!tabla || !Array.isArray(tabla)) return [];
    return tabla.filter((item: any) => {
      const grupo = item.grupo?.toString().toLowerCase() || '';
      return !grupo.includes('total');
    });
  }

  getAfiliacionSaludSinTotal(): any[] {
    const tabla = this.afiliacionSaludTablaSignal();
    if (!tabla || !Array.isArray(tabla)) return [];
    return tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total') && !categoria.includes('referencial');
    });
  }

  getPorcentajeSIS(): string {
    const tabla = this.getAfiliacionSaludSinTotal();
    const itemSIS = tabla.find((item: any) => item.categoria && item.categoria.toString().toLowerCase().includes('sis'));
    return itemSIS ? (itemSIS.porcentaje ? String(itemSIS.porcentaje) : '____') : '____';
  }

  getPorcentajeESSALUD(): string {
    const tabla = this.getAfiliacionSaludSinTotal();
    const itemESSALUD = tabla.find((item: any) => item.categoria && item.categoria.toString().toLowerCase().includes('essalud'));
    return itemESSALUD ? (itemESSALUD.porcentaje ? String(itemESSALUD.porcentaje) : '____') : '____';
  }

  getPorcentajeSinSeguro(): string {
    const tabla = this.getAfiliacionSaludSinTotal();
    const itemSinSeguro = tabla.find((item: any) => item.categoria && (item.categoria.toString().toLowerCase().includes('sin seguro') || item.categoria.toString().toLowerCase().includes('sin seg') || item.categoria.toString().toLowerCase().includes('ningún')));
    return itemSinSeguro ? (itemSinSeguro.porcentaje ? String(itemSinSeguro.porcentaje) : '____') : '____';
  }

  getTotalMorbilidad(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getTotalMorbilidadRango0_11(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const rango = typeof item.rango0_11 === 'number' ? item.rango0_11 : parseInt(item.rango0_11) || 0;
      return sum + rango;
    }, 0);
    return total.toString();
  }

  getTotalMorbilidadRango12_17(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const rango = typeof item.rango12_17 === 'number' ? item.rango12_17 : parseInt(item.rango12_17) || 0;
      return sum + rango;
    }, 0);
    return total.toString();
  }

  getTotalMorbilidadRango18_29(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const rango = typeof item.rango18_29 === 'number' ? item.rango18_29 : parseInt(item.rango18_29) || 0;
      return sum + rango;
    }, 0);
    return total.toString();
  }

  getTotalMorbilidadRango30_59(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const rango = typeof item.rango30_59 === 'number' ? item.rango30_59 : parseInt(item.rango30_59) || 0;
      return sum + rango;
    }, 0);
    return total.toString();
  }

  getTotalMorbilidadRango60(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const rango = typeof item.rango60 === 'number' ? item.rango60 : parseInt(item.rango60) || 0;
      return sum + rango;
    }, 0);
    return total.toString();
  }

  getTotalAfiliacionSalud(): string {
    const filtered = this.getAfiliacionSaludSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getAfiliacionSaludConPorcentajes(): any[] {
    // ✅ PATRÓN: Solo lectura - devolver datos exactos del backend SIN cálculos
    const tabla = this.afiliacionSaludTablaSignal();
    return tabla || [];
  }

  formatearPorcentaje(value: any): string {
    if (value == null || value === undefined || value === '') return '';
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace('%', '').trim().replace(',', '.')) || 0;
    return num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  }

  onMorbilidadFieldChange(rowIndex: number, field: string, value: any) {
    const tabla = [...this.morbilidadTablaSignal()];
    if (tabla && tabla[rowIndex]) {
      tabla[rowIndex] = { ...tabla[rowIndex], [field]: value };
      if (field !== 'casos' && field !== 'grupo') {
        this.calcularTotalesMorbilidad();
        return;
      }
      const tablaKey = this.getTablaKeyMorbilidad();
      this.onFieldChange(tablaKey, tabla, { refresh: true });
      const tablaPersistida = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || tabla;
      this.datos[tablaKey] = tablaPersistida;
      this.cdRef.detectChanges();
    }
  }

  calcularTotalesMorbilidad() {
    const tabla = this.morbilidadTablaSignal();
    if (!tabla || tabla.length === 0) return;
    const nuevos = tabla.map((item: any) => {
      const rango0_11 = parseFloat(item.rango0_11) || 0;
      const rango12_17 = parseFloat(item.rango12_17) || 0;
      const rango18_29 = parseFloat(item.rango18_29) || 0;
      const rango30_59 = parseFloat(item.rango30_59) || 0;
      const rango60 = parseFloat(item.rango60) || 0;
      const total = rango0_11 + rango12_17 + rango18_29 + rango30_59 + rango60;
      return { ...item, casos: total };
    });
    const tablaKey = this.getTablaKeyMorbilidad();
    this.onFieldChange(tablaKey, nuevos, { refresh: true });
    const tablaPersistida = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || nuevos;
    this.datos[tablaKey] = tablaPersistida;
    this.cdRef.detectChanges();
  }

  onNatalidadMortalidadTableUpdated(updatedData?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `natalidadMortalidadTabla${prefijo}`;
    const datos = (updatedData && updatedData.length > 0) ? updatedData : (this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || []);
    this.datos[tablaKey] = datos;
    const formChange = this.injector.get(FormChangeService);
    formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { updateState: true, notifySync: true });
    this.cdRef.detectChanges();
  }

  onMorbilidadTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyMorbilidad();
    const datos = (updatedData && updatedData.length > 0) ? updatedData : (this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || []);
    this.datos[tablaKey] = datos;
    const formChange = this.injector.get(FormChangeService);
    formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { updateState: true, notifySync: true });
    this.cdRef.detectChanges();
  }

  onAfiliacionSaludTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyAfiliacionSalud();
    // ✅ Sin cálculos: Solo persistir los datos exactos del backend
    const datos = (updatedData && updatedData.length > 0) ? updatedData : (this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || []);
    this.datos[tablaKey] = datos;
    const formChange = this.injector.get(FormChangeService);
    formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { updateState: true, notifySync: true });
    this.cdRef.detectChanges();
  }

  private obtenerRegExp(pattern: string): RegExp {
    if (!this.regexCache.has(pattern)) {
      this.regexCache.set(pattern, new RegExp(pattern, 'g'));
    }
    return this.regexCache.get(pattern)!;
  }

  private escapeRegex(text: any): string {
    const str = typeof text === 'string' ? text : String(text || '');
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
