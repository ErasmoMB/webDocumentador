import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { CentrosPobladosActivosService } from 'src/app/core/services/centros-poblados-activos.service';
import { Subscription } from 'rxjs';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion9',
  templateUrl: './seccion9.component.html',
  styleUrls: ['./seccion9.component.css']
})
export class Seccion9Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['grupoAISD', 'condicionOcupacionTabla', 'tiposMaterialesTabla', 'textoViviendas', 'textoEstructura'];
  
  override readonly PHOTO_PREFIX = 'fotografiaEstructura';
  
  override fotografiasCache: FotoItem[] = [];

  get condicionOcupacionConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyCondicionOcupacion(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      estructuraInicial: [],
      calcularPorcentajes: true,
      camposParaCalcular: ['casos']
    };
  }

  get tiposMaterialesConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyTiposMateriales(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      estructuraInicial: [],
      calcularPorcentajes: true,
      camposParaCalcular: ['casos']
    };
  }

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    protected override autoLoader: AutoBackendDataLoaderService,
    private tableService: TableManagementService,
    private stateService: StateService,
    private groupConfig: GroupConfigService,
    private centrosPobladosActivos: CentrosPobladosActivosService,
    private sanitizer: DomSanitizer
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef, autoLoader);
  }

  protected getSectionKey(): string {
    return 'seccion9_aisd';
  }

  protected getLoadParameters(): string[] | null {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const codigosActivos = prefijo?.startsWith('_A')
      ? this.centrosPobladosActivos.obtenerCodigosActivosPorPrefijo(prefijo)
      : this.groupConfig.getAISDCCPPActivos();

    return codigosActivos && codigosActivos.length > 0 ? codigosActivos : null;
  }

  protected override onInitCustom(): void {
    this.eliminarFilasTotal();
    this.cargarFotografias();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  protected override applyLoadedData(loadedData: { [fieldName: string]: any }): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    console.log('[SECCION9-COMPONENT] applyLoadedData called with:', loadedData);

    for (const [fieldName, data] of Object.entries(loadedData)) {
      if (data === null || data === undefined) continue;
      const fieldKey = prefijo ? `${fieldName}${prefijo}` : fieldName;

      const actual = this.datos[fieldKey];
      const vieneNoVacio = Array.isArray(data) && data.length > 0;
      const actualEsPlaceholder = this.esTablaPlaceholder(actual);

      const siempreDesdeBackend = fieldName === 'condicionOcupacionTabla' || fieldName === 'tiposMaterialesTabla';

      if (
        (siempreDesdeBackend && vieneNoVacio) ||
        this.datos[fieldKey] === undefined ||
        this.datos[fieldKey] === null ||
        (vieneNoVacio && actualEsPlaceholder)
      ) {
        console.log(`[SECCION9-COMPONENT] Applying ${fieldName} to form:`, data);
        if (fieldName === 'tiposMaterialesTabla' && Array.isArray(data)) {
          const tabla = data.map((x: any) => ({ ...x }));
          this.calcularPorcentajesPorCategoria(tabla);
          this.formularioService.actualizarDato(fieldKey as any, tabla);
          continue;
        }
        this.formularioService.actualizarDato(fieldKey as any, data);
      }
    }

    this.actualizarDatos();
  }

  private esTablaPlaceholder(valor: any): boolean {
    if (!Array.isArray(valor) || valor.length === 0) {
      return true;
    }
    const todosCeros = valor.every((row: any) => {
      const casos = typeof row?.casos === 'number' ? row.casos : parseInt(row?.casos) || 0;
      return casos === 0;
    });

    if (todosCeros) {
      return true;
    }

    return valor.every((row: any) => {
      if (!row) return true;
      const casos = typeof row.casos === 'number' ? row.casos : parseInt(row.casos) || 0;
      const categoriaVacia = row.categoria !== undefined ? (row.categoria?.toString().trim() || '') === '' : true;
      const tipoVacio = row.tipoMaterial !== undefined ? (row.tipoMaterial?.toString().trim() || '') === '' : true;
      return (categoriaVacia || tipoVacio) && casos === 0;
    });
  }

  private eliminarFilasTotal(): void {
    const tablaKeyCondicion = this.getTablaKeyCondicionOcupacion();
    const tablaCondicion = this.getTablaCondicionOcupacion();
    
    if (tablaCondicion && Array.isArray(tablaCondicion)) {
      const longitudOriginal = tablaCondicion.length;
      const datosFiltrados = tablaCondicion.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.formularioService.actualizarDato(tablaKeyCondicion, datosFiltrados);
      }
    }
    
    const tablaKeyMateriales = this.getTablaKeyTiposMateriales();
    const tablaMateriales = this.getTablaTiposMateriales();
    
    if (tablaMateriales && Array.isArray(tablaMateriales)) {
      const longitudOriginal = tablaMateriales.length;
      const datosFiltrados = tablaMateriales.filter((item: any) => {
        const tipoMaterial = item.tipoMaterial?.toString().toLowerCase() || '';
        return !tipoMaterial.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.formularioService.actualizarDato(tablaKeyMateriales, datosFiltrados);
      }
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    let hayCambios = false;
    const prefijo = this.obtenerPrefijoGrupo();
    
    for (const campo of this.watchedFields) {
      let valorActual: any = null;
      let valorAnterior: any = null;
      
      if (campo === 'condicionOcupacionTabla' || campo === 'tiposMaterialesTabla') {
        const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
        valorActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, campo, this.seccionId) || null;
        valorAnterior = this.datosAnteriores[campoConPrefijo] || this.datosAnteriores[campo] || null;
      } else {
        valorActual = (datosActuales as any)[campo] || null;
        valorAnterior = this.datosAnteriores[campo] || null;
      }
      
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        if (campo === 'condicionOcupacionTabla' || campo === 'tiposMaterialesTabla') {
          const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
          this.datosAnteriores[campoConPrefijo] = JSON.parse(JSON.stringify(valorActual));
        } else {
          this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
        }
      }
    }
    
    if (grupoAISDActual !== grupoAISDAnterior || grupoAISDActual !== grupoAISDEnDatos || hayCambios) {
      return true;
    }
    
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
  }

  getTotalViviendasEmpadronadas(): string {
    const total = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'tablaAISD2TotalViviendasEmpadronadas', this.seccionId) 
      || this.datos?.tablaAISD2TotalViviendasEmpadronadas 
      || this.datos?.totalViviendasEmpadronadas 
      || '____';
    return total !== '____' && total !== null && total !== undefined ? total.toString() : '____';
  }

  getViviendasOcupadas(): string {
    const ocupadas = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'tablaAISD2TotalViviendasOcupadas', this.seccionId)
      || this.datos?.tablaAISD2TotalViviendasOcupadas 
      || this.datos?.totalViviendasOcupadas 
      || '____';
    return ocupadas !== '____' && ocupadas !== null && ocupadas !== undefined ? ocupadas.toString() : '____';
  }

  getPorcentajeViviendasOcupadas(): string {
    const totalEmpadronadasRaw = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'tablaAISD2TotalViviendasEmpadronadas', this.seccionId)
      || this.datos?.tablaAISD2TotalViviendasEmpadronadas 
      || this.datos?.totalViviendasEmpadronadas 
      || '0';
    const totalOcupadasRaw = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'tablaAISD2TotalViviendasOcupadas', this.seccionId)
      || this.datos?.tablaAISD2TotalViviendasOcupadas 
      || this.datos?.totalViviendasOcupadas 
      || '0';
    
    const totalEmpadronadas = parseInt(totalEmpadronadasRaw.toString()) || 0;
    const totalOcupadas = parseInt(totalOcupadasRaw.toString()) || 0;
    
    if (totalEmpadronadas === 0) {
      return '____';
    }
    
    const porcentaje = ((totalOcupadas / totalEmpadronadas) * 100).toFixed(2).replace('.', ',') + ' %';
    return porcentaje;
  }

  getPorcentajeMaterial(categoria: string, tipoMaterial: string): string {
    const tabla = this.getTablaTiposMateriales();
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) {
      console.log(`[SECCION9] getPorcentajeMaterial - tabla vacía o no disponible`);
      return '____';
    }
    
    const norm = (s: string) =>
      (s ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\W_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    const catNorm = norm(categoria);
    const tipoNorm = norm(tipoMaterial);
    
    // Variaciones de búsqueda: singular/plural
    const catVariations = [catNorm, catNorm.endsWith('s') ? catNorm.slice(0, -1) : catNorm + 's'];
    
    console.log(`[SECCION9] getPorcentajeMaterial buscando: "${categoria}" + "${tipoMaterial}"`)
    console.log(`  Categoría normalizada: "${catNorm}" (variaciones: ${catVariations.join(', ')})`)
    console.log(`  Tipo normalizado: "${tipoNorm}"`)
    console.log(`  Items en tabla: ${tabla.length}`);
    
    const item = tabla.find((item: any) => {
      const itemCatNorm = norm(item.categoria || '');
      const itemTipoNorm = norm(item.tipoMaterial || '');
      
      // Buscar si la categoría coincide (singular o plural)
      const catMatch = catVariations.some(v => itemCatNorm.includes(v) || v.includes(itemCatNorm));
      
      // Buscar si todas las palabras del tipo buscado están en el tipo del item
      const typeWords = tipoNorm.split(/\s+/).filter(w => w.length > 0);
      const tipoMatch = typeWords.length === 0 || typeWords.some(word => itemTipoNorm.includes(word));
      
      const match = catMatch && tipoMatch;
      
      if (match) {
        console.log(`  ✓ Encontrado: "${item.categoria}" | "${item.tipoMaterial}" = ${item.porcentaje}`);
      }
      
      return match;
    });
    
    if (!item) {
      console.log(`  ✗ NO encontrado para: "${categoria}" + "${tipoMaterial}"`);
      // Mostrar opciones disponibles para debugging
      const availableCats = [...new Set(tabla.map(i => i.categoria))];
      console.log(`  Categorías disponibles: ${availableCats.join(', ')}`);
    }
    
    return item?.porcentaje || '____';
  }

  private getTablaCondicionOcupacion(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'condicionOcupacionTabla', this.seccionId) || this.datos.condicionOcupacionTabla || [];
    return tabla;
  }

  getTablaKeyCondicionOcupacion(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `condicionOcupacionTabla${prefijo}` : 'condicionOcupacionTabla';
  }

  getCondicionOcupacionSinTotal(): any[] {
    const tabla = this.getTablaCondicionOcupacion();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalCondicionOcupacion(): string {
    const tabla = this.getTablaCondicionOcupacion();
    if (!tabla || !Array.isArray(tabla)) {
      return '0';
    }
    const datosSinTotal = tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  private getTablaTiposMateriales(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'tiposMaterialesTabla', this.seccionId) || this.datos.tiposMaterialesTabla || [];
    return tabla;
  }

  getTablaKeyTiposMateriales(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `tiposMaterialesTabla${prefijo}` : 'tiposMaterialesTabla';
  }

  getTiposMaterialesSinTotal(): any[] {
    const tabla = this.getTablaTiposMateriales();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => {
      const tipoMaterial = item.tipoMaterial?.toString().toLowerCase() || '';
      return !tipoMaterial.includes('total');
    });
  }

  getTotalTiposMateriales(): string {
    const tabla = this.getTablaTiposMateriales();
    if (!tabla || !Array.isArray(tabla)) {
      return '0';
    }
    const datosSinTotal = tabla.filter((item: any) => {
      const tipoMaterial = item.tipoMaterial?.toString().toLowerCase() || '';
      return !tipoMaterial.includes('total');
    });
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasEstructuraVista(): FotoItem[] {
    if (this.fotografiasCache && this.fotografiasCache.length > 0) {
      return [...this.fotografiasCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasCache;
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    this.cdRef.markForCheck();
  }

  onFotografiasChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  onCondicionOcupacionFieldChange(index: number, field: string, value: any) {
    const tablaKey = this.getTablaKeyCondicionOcupacion();
    let tabla = this.getTablaCondicionOcupacion();
    if (!tabla || !Array.isArray(tabla)) {
      tabla = [];
    }
    
    this.tableService.actualizarFila(this.datos, this.condicionOcupacionConfig, index, field, value, false);
    
    tabla = this.getTablaCondicionOcupacion();
    
    if (field === 'casos') {
      const itemsSinTotal = tabla.filter((item: any) => item.categoria !== 'Total');
      const totalCasos = itemsSinTotal.reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
      
      itemsSinTotal.forEach((item: any) => {
        if (totalCasos > 0) {
          const casos = parseInt(item.casos) || 0;
          const porcentaje = ((casos / totalCasos) * 100).toFixed(2).replace('.', ',') + ' %';
          item.porcentaje = porcentaje;
        } else {
          item.porcentaje = '0,00 %';
        }
      });
      
      const totalItem = tabla.find((item: any) => item.categoria === 'Total');
      if (totalItem) {
        totalItem.casos = totalCasos;
        totalItem.porcentaje = '100,00 %';
      }
    }
    
    this.formularioService.actualizarDato(tablaKey, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onCondicionOcupacionTableUpdated() {
    const tablaKey = this.getTablaKeyCondicionOcupacion();
    let tabla = this.getTablaCondicionOcupacion();
    
    const itemsSinTotal = tabla.filter((item: any) => item.categoria !== 'Total');
    const totalCasos = itemsSinTotal.reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
    
    itemsSinTotal.forEach((item: any) => {
      if (totalCasos > 0) {
        const casos = parseInt(item.casos) || 0;
        const porcentaje = ((casos / totalCasos) * 100).toFixed(2).replace('.', ',') + ' %';
        item.porcentaje = porcentaje;
      } else {
        item.porcentaje = '0,00 %';
      }
    });
    
    const totalItem = tabla.find((item: any) => item.categoria === 'Total');
    if (totalItem) {
      totalItem.casos = totalCasos;
      totalItem.porcentaje = '100,00 %';
    }
    
    this.formularioService.actualizarDato(tablaKey, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onTiposMaterialesFieldChange(index: number, field: string, value: any) {
    const tablaKey = this.getTablaKeyTiposMateriales();
    let tabla = this.getTablaTiposMateriales();
    if (!tabla || !Array.isArray(tabla)) {
      tabla = [];
    }
    
    this.tableService.actualizarFila(this.datos, this.tiposMaterialesConfig, index, field, value, false);
    
    tabla = this.getTablaTiposMateriales();
    
    if (field === 'casos') {
      this.calcularPorcentajesPorCategoria(tabla);
    }
    
    this.formularioService.actualizarDato(tablaKey, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  calcularPorcentajesPorCategoria(tabla: any[]): void {
    const categorias = [...new Set(tabla.map(item => item.categoria).filter(cat => cat && cat !== 'Total'))];
    
    categorias.forEach(categoria => {
      const itemsCategoria = tabla.filter(item => item.categoria === categoria && item.tipoMaterial !== 'Total');
      const totalCategoria = itemsCategoria.reduce((sum, item) => sum + (parseInt(item.casos) || 0), 0);
      
      if (totalCategoria <= 0) {
        itemsCategoria.forEach(item => (item.porcentaje = '0,00 %'));
        return;
      }

      const calculadas = itemsCategoria.map(item => {
        const casos = parseInt(item.casos) || 0;
        const porcentaje = (casos / totalCategoria) * 100;
        const porcentajeNum = Math.round(porcentaje * 100) / 100;
        return { item, porcentajeNum };
      });

      const suma = calculadas.reduce((sum, x) => sum + (x.porcentajeNum || 0), 0);
      const diff = Math.round((100 - suma) * 100) / 100;
      const idxAjuste = calculadas.length - 1;
      calculadas[idxAjuste].porcentajeNum = Math.round(((calculadas[idxAjuste].porcentajeNum || 0) + diff) * 100) / 100;

      calculadas.forEach(({ item, porcentajeNum }) => {
        item.porcentaje = (porcentajeNum || 0)
          .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          .replace('.', ',') + ' %';
      });
    });
  }

  onTiposMaterialesTableUpdated() {
    const tablaKey = this.getTablaKeyTiposMateriales();
    let tabla = this.getTablaTiposMateriales();
    this.calcularPorcentajesPorCategoria(tabla);
    this.formularioService.actualizarDato(tablaKey, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  getCategoriasMateriales(): string[] {
    const tabla = this.getTablaTiposMateriales();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return [...new Set(tabla.map(item => item.categoria).filter(cat => cat && cat !== 'Total' && cat !== '____'))];
  }

  getItemsPorCategoria(categoria: string): any[] {
    const tabla = this.getTablaTiposMateriales();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter(item => item.categoria === categoria && item.tipoMaterial !== 'Total');
  }

  getTotalPorCategoria(categoria: string): number {
    const items = this.getItemsPorCategoria(categoria);
    return items.reduce((sum, item) => sum + (parseInt(item.casos) || 0), 0);
  }

  obtenerTextoViviendas(): string {
    if (this.datos.textoViviendas && this.datos.textoViviendas !== '____') {
      return this.datos.textoViviendas;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const totalViviendas = this.getTotalViviendasEmpadronadas();
    const viviendasOcupadas = this.getViviendasOcupadas();
    const porcentajeOcupadas = this.getPorcentajeViviendasOcupadas();
    
    return `Según la plataforma REDINFORMA del MIDIS, en los poblados que conforman la CC ${grupoAISD} se hallan un total de ${totalViviendas} viviendas empadronadas. De estas, solamente ${viviendasOcupadas} se encuentran ocupadas, representando un ${porcentajeOcupadas}. Cabe mencionar que, para poder describir el acápite de estructura de las viviendas de esta comunidad, así como la sección de los servicios básicos, se toma como conjunto total a las viviendas ocupadas.`;
  }

  obtenerTextoViviendasConResaltado(): SafeHtml {
    const texto = this.obtenerTextoViviendas();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const totalViviendas = this.getTotalViviendasEmpadronadas();
    const viviendasOcupadas = this.getViviendasOcupadas();
    const porcentajeOcupadas = this.getPorcentajeViviendasOcupadas();
    
    let textoConResaltado = texto
      .replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(new RegExp(this.escapeRegex(totalViviendas), 'g'), `<span class="data-section">${this.escapeHtml(totalViviendas)}</span>`)
      .replace(new RegExp(this.escapeRegex(viviendasOcupadas), 'g'), `<span class="data-section">${this.escapeHtml(viviendasOcupadas)}</span>`)
      .replace(new RegExp(this.escapeRegex(porcentajeOcupadas), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeOcupadas)}</span>`);
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoEstructura(): string {
    if (this.datos.textoEstructura && this.datos.textoEstructura !== '____') {
      return this.datos.textoEstructura;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajeAdobe = this.getPorcentajeMaterial('paredes', 'adobe');
    const porcentajeTriplayParedes = this.getPorcentajeMaterial('paredes', 'triplay');
    const porcentajeCalamina = this.getPorcentajeMaterial('techos', 'calamina');
    const porcentajeTriplayTechos = this.getPorcentajeMaterial('techos', 'triplay');
    const porcentajeTejas = this.getPorcentajeMaterial('techos', 'tejas');
    const porcentajeTierra = this.getPorcentajeMaterial('pisos', 'tierra');
    const porcentajeCemento = this.getPorcentajeMaterial('pisos', 'cemento');
    
    console.log(`%c[SECCION9] Texto Estructura - Valores extraídos:`, 'color: #FF6F00; font-weight: bold;');
    console.log(`  Adobe (paredes): ${porcentajeAdobe}`);
    console.log(`  Triplay (paredes): ${porcentajeTriplayParedes}`);
    console.log(`  Calamina (techos): ${porcentajeCalamina}`);
    console.log(`  Triplay (techos): ${porcentajeTriplayTechos}`);
    console.log(`  Tejas (techos): ${porcentajeTejas}`);
    console.log(`  Tierra (pisos): ${porcentajeTierra}`);
    console.log(`  Cemento (pisos): ${porcentajeCemento}`);
    
    return `Según la información recabada de los Censos Nacionales 2017, dentro de la CC ${grupoAISD}, el material más empleado para la construcción de las paredes de las viviendas es el adobe, pues representa el ${porcentajeAdobe}. A ello le complementa el material de triplay / calamina / estera (${porcentajeTriplayParedes}).\n\nRespecto a los techos, destacan principalmente las planchas de calamina, fibra de cemento o similares con un ${porcentajeCalamina}. El porcentaje restante consiste en triplay / estera / carrizo (${porcentajeTriplayTechos}) y en tejas (${porcentajeTejas}).\n\nFinalmente, en cuanto a los pisos, la mayoría están hechos de tierra (${porcentajeTierra}). Por otra parte, el porcentaje restante (${porcentajeCemento}) consiste en cemento.`;
  }

  obtenerTextoEstructuraConResaltado(): SafeHtml {
    const texto = this.obtenerTextoEstructura();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajeAdobe = this.getPorcentajeMaterial('paredes', 'adobe');
    const porcentajeTriplayParedes = this.getPorcentajeMaterial('paredes', 'triplay');
    const porcentajeCalamina = this.getPorcentajeMaterial('techos', 'calamina');
    const porcentajeTriplayTechos = this.getPorcentajeMaterial('techos', 'triplay');
    const porcentajeTejas = this.getPorcentajeMaterial('techos', 'tejas');
    const porcentajeTierra = this.getPorcentajeMaterial('pisos', 'tierra');
    const porcentajeCemento = this.getPorcentajeMaterial('pisos', 'cemento');
    
    let textoConResaltado = texto
      .replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(new RegExp(this.escapeRegex(porcentajeAdobe), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeAdobe)}</span>`)
      .replace(new RegExp(this.escapeRegex(porcentajeTriplayParedes), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeTriplayParedes)}</span>`)
      .replace(new RegExp(this.escapeRegex(porcentajeCalamina), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeCalamina)}</span>`)
      .replace(new RegExp(this.escapeRegex(porcentajeTriplayTechos), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeTriplayTechos)}</span>`)
      .replace(new RegExp(this.escapeRegex(porcentajeTejas), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeTejas)}</span>`)
      .replace(new RegExp(this.escapeRegex(porcentajeTierra), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeTierra)}</span>`)
      .replace(new RegExp(this.escapeRegex(porcentajeCemento), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeCemento)}</span>`)
      .replace(/\n\n/g, '<br><br>');
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

