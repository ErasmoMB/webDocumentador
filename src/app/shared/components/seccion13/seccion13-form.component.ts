import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, effect } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { TableNumberingService } from 'src/app/core/services/table-numbering.service';
import { SECCION13_PHOTO_PREFIX } from './seccion13-constants';

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
    const prefix = `${this.PHOTO_PREFIX}${prefijo}`;
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ CONFIGURACIONES DE TABLAS - Patrón MODO IDEAL
  readonly natalidadMortalidadConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `natalidadMortalidadTabla${this.obtenerPrefijo()}`,
    totalKey: 'anio',
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
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    noInicializarDesdeEstructura: false,
    estructuraInicial: [
      { categoria: '', casos: 0, porcentaje: '0%' }
    ],
    calcularPorcentajes: false  // ❌ DESACTIVADO: Causa ocultamiento de filas
  }));

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
    private tableNumbering: TableNumberingService
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

  override obtenerNombreComunidadActual(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    if (prefijo) {
      return PrefijoHelper.obtenerValorConPrefijo(this.datos, 'nombreGrupo', this.seccionId) || '____';
    }
    return this.datos.grupoAISD || '____';
  }

  obtenerTextoSeccion13NatalidadMortalidadCompleto(): string {
    if (this.datos.parrafoSeccion13_natalidad_mortalidad_completo) {
      return this.datos.parrafoSeccion13_natalidad_mortalidad_completo;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    return `El presente ítem proporciona una visión crucial sobre las dinámicas demográficas, reflejando las tendencias en el crecimiento poblacional. De los datos obtenidos en el Puesto de Salud ${grupoAISD} durante el trabajo de campo, se obtiene que en el año 2023 solo ocurrió un nacimiento, mientras que para el 2024 (hasta el 13 de noviembre) se dieron un total de tres (03) nacimientos.\n\nRespecto a la mortalidad, según la misma fuente, se obtiene que en el año 2023 se registró un fallecimiento, por suicidio; mientras que para el 2024 no ocurrieron decesos dentro de la CC ${grupoAISD}, hasta la fecha indicada.`;
  }

  obtenerTextoSeccion13MorbilidadCompleto(): string {
    if (this.datos.parrafoSeccion13_morbilidad_completo) {
      return this.datos.parrafoSeccion13_morbilidad_completo;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    const distrito = this.datos.distritoSeleccionado || '____';
    return `De acuerdo con las entrevistas aplicadas durante el trabajo de campo, las autoridades locales y los informantes calificados reportaron que las enfermedades más recurrentes dentro de la CC ${grupoAISD} son las infecciones respiratorias agudas (IRAS) y las enfermedades diarreicas agudas (EDAS). Asimismo, se mencionan casos de hipertensión y diabetes, que son más frecuentes en adultos mayores.\n\nEn cuanto a los grupos de morbilidad que se hallan a nivel distrital de ${distrito} (jurisdicción que abarca a los poblados de la CC ${grupoAISD}) para el año 2023, se destaca que las condiciones más frecuentes son las infecciones agudas de las vías respiratorias superiores (1012 casos) y la obesidad y otros de hiperalimentación (191 casos). Para la primera, se reportó un mayor número de casos en el bloque etario de 0-11 años, mientras que para la segunda, el rango de 30-59 años mostró más casos. A continuación, se presenta el cuadro con la cantidad de casos por grupo de morbilidad y bloques etarios dentro del distrito, según el portal REUNIS del MINSA.`;
  }

  obtenerTextoAfiliacionSalud(): string {
    if (this.datos.textoAfiliacionSalud && this.datos.textoAfiliacionSalud !== '____') {
      return this.datos.textoAfiliacionSalud;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajeSIS = this.getPorcentajeSIS() || '____';
    const porcentajeESSALUD = this.getPorcentajeESSALUD() || '____';
    const porcentajeSinSeguro = this.getPorcentajeSinSeguro() || '____';
    return `Dentro de la CC ${grupoAISD}, la mayoría de habitantes se encuentran afiliados a algún tipo de seguro de salud. Es así que el Seguro Integral de Salud (SIS) se halla en primer lugar, al abarcar el ${porcentajeSIS} % de la población. A ello le sigue ESSALUD, con un ${porcentajeESSALUD} %. Por otro lado, el ${porcentajeSinSeguro} % de la población no cuenta con ningún tipo de seguro de salud.`;
  }

  obtenerTituloCuadroNatalidad(): string {
    return this.datos['cuadroTituloNatalidadMortalidad'] || `Indicadores de natalidad y mortalidad – CC ${this.obtenerNombreComunidadActual()}`;
  }

  obtenerFuenteCuadroNatalidad(): string {
    return this.datos['cuadroFuenteNatalidadMortalidad'] || 'GEADES (2024)';
  }

  obtenerTituloCuadroMorbilidad(): string {
    return this.datos['cuadroTituloMorbilidad'] || `Casos por grupos de morbilidad – Distrito ${this.datos.distritoSeleccionado || '____'} (2023)`;
  }

  obtenerFuenteCuadroMorbilidad(): string {
    return this.datos['cuadroFuenteMorbilidad'] || 'REUNIS (2024)';
  }

  obtenerTituloCuadroAfiliacion(): string {
    return this.datos['cuadroTituloAfiliacionSalud'] || `Población según tipo de seguro de salud afiliado – CC ${this.obtenerNombreComunidadActual()} (2017)`;
  }

  obtenerFuenteCuadroAfiliacion(): string {
    return this.datos['cuadroFuenteAfiliacionSalud'] || 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
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
    const tabla = this.afiliacionSaludTablaSignal();
    const cuadro = this.tableNumbering.getGlobalTableNumber(this.seccionId, 2);
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
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
    formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { updateState: true, notifySync: true, persist: false } as any);
    this.cdRef.detectChanges();
  }

  onMorbilidadTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyMorbilidad();
    const datos = (updatedData && updatedData.length > 0) ? updatedData : (this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || []);
    this.datos[tablaKey] = datos;
    const formChange = this.injector.get(FormChangeService);
    formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { updateState: true, notifySync: true, persist: false } as any);
    this.cdRef.detectChanges();
  }

  onAfiliacionSaludTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyAfiliacionSalud();
    const datosRaw = (updatedData && updatedData.length > 0) ? updatedData : (this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || []);
    const cuadro = this.tableNumbering.getGlobalTableNumber(this.seccionId, 2);
    const datosConPorcentajes = TablePercentageHelper.calcularPorcentajesSimple(datosRaw, cuadro);
    this.datos[tablaKey] = datosConPorcentajes;
    const formChange = this.injector.get(FormChangeService);
    formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datosConPorcentajes }, { updateState: true, notifySync: true, persist: false } as any);
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
