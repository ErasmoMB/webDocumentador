import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { CentrosPobladosActivosService } from 'src/app/core/services/centros-poblados-activos.service';
import { Subscription } from 'rxjs';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { TableWrapperComponent } from '../table-wrapper/table-wrapper.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
// Clean Architecture imports
import { LoadSeccion9UseCase, UpdateSeccion9DataUseCase, Seccion9ViewModel } from 'src/app/core/application/use-cases';
import { Seccion9Data } from 'src/app/core/domain/entities';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion9',
    templateUrl: './seccion9.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion9Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['grupoAISD', 'condicionOcupacionTabla', 'tiposMaterialesTabla', 'textoViviendas', 'textoEstructura'];
  
  override readonly PHOTO_PREFIX = 'fotografiaEstructura';
  
  override fotografiasCache: FotoItem[] = [];

  private readonly regexCache = new Map<string, RegExp>();

  // Clean Architecture ViewModel
  seccion9ViewModel$ = this.loadSeccion9UseCase.execute();
  seccion9ViewModel?: Seccion9ViewModel;

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
    cdRef: ChangeDetectorRef,
    injector: Injector,
    protected override autoLoader: AutoBackendDataLoaderService,
    protected override tableFacade: TableManagementFacade,
    private stateAdapter: ReactiveStateAdapter,
    private groupConfig: GroupConfigService,
    private centrosPobladosActivos: CentrosPobladosActivosService,
    private sanitizer: DomSanitizer,
    // Clean Architecture dependencies
    private loadSeccion9UseCase: LoadSeccion9UseCase,
    private updateSeccion9DataUseCase: UpdateSeccion9DataUseCase
  ) {
    super(cdRef, autoLoader, injector, undefined, tableFacade);
    
    // Subscribe to ViewModel for Clean Architecture
    this.seccion9ViewModel$.subscribe(viewModel => {
      this.seccion9ViewModel = viewModel;
      this.cdRef.markForCheck();
    });
  }

  // Clean Architecture methods
  updateSeccion9Data(updates: Partial<Seccion9Data>): void {
    if (this.seccion9ViewModel) {
      const currentData = this.seccion9ViewModel.data;
      const updatedData = { ...currentData, ...updates };
      this.updateSeccion9DataUseCase.execute(updatedData).subscribe(updatedViewModel => {
        this.seccion9ViewModel = updatedViewModel;
        this.cdRef.markForCheck();
      });
    }
  }

  // Backward compatibility methods - delegate to Clean Architecture
  obtenerTextoViviendas(): string {
    return this.seccion9ViewModel?.texts.viviendasText || this.datos.textoViviendas || '';
  }

  obtenerTextoEstructura(): string {
    return this.seccion9ViewModel?.texts.estructuraText || this.datos.textoEstructura || '';
  }

  obtenerTextoViviendasConResaltado(): SafeHtml {
    const texto = this.obtenerTextoViviendas();
    // Simple highlighting - in a real implementation this would be more sophisticated
    return this.sanitizer.sanitize(1, texto) as SafeHtml;
  }

  obtenerTextoEstructuraConResaltado(): SafeHtml {
    const texto = this.obtenerTextoEstructura();
    // Simple highlighting - in a real implementation this would be more sophisticated
    return this.sanitizer.sanitize(1, texto) as SafeHtml;
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
      this.stateSubscription = this.stateAdapter.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
    this.logGrupoActual();
  }

  protected override applyLoadedData(loadedData: { [fieldName: string]: any }): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);

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
        if (fieldName === 'tiposMaterialesTabla' && Array.isArray(data)) {
          const tabla = data.map((x: any) => ({
            ...x,
            tipoMaterial: x.tipo_material || x.tipoMaterial || '',
            categoria: x.categoria || ''
          }));
          this.calcularPorcentajesPorCategoria(tabla);
          this.onFieldChange(fieldKey as any, tabla);
          continue;
        }
        this.onFieldChange(fieldKey as any, data);
      }
    }

    this.actualizarDatos();
  }

  protected override esTablaPlaceholder(valor: any): boolean {
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
        this.onFieldChange(tablaKeyCondicion, datosFiltrados);
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
        this.onFieldChange(tablaKeyMateriales, datosFiltrados);
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
    const datosActuales = this.projectFacade.obtenerDatos();
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
      
      const sonIguales = this.compararValores(valorActual, valorAnterior);
      if (!sonIguales) {
        hayCambios = true;
        if (campo === 'condicionOcupacionTabla' || campo === 'tiposMaterialesTabla') {
          const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
          this.datosAnteriores[campoConPrefijo] = this.clonarValor(valorActual);
        } else {
          this.datosAnteriores[campo] = this.clonarValor(valorActual);
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
    // Buscar el Total en la tabla de condición de ocupación
    const tabla = this.getTablaCondicionOcupacion();
    if (tabla && Array.isArray(tabla)) {
      const totalRow = tabla.find((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return categoria.includes('total');
      });
      if (totalRow && totalRow.casos !== undefined && totalRow.casos !== null && totalRow.casos !== '') {
        return totalRow.casos.toString();
      }
    }
    return '____';
  }

  getViviendasOcupadas(): string {
    // Buscar la fila "Ocupada" o "Vivienda Ocupada" en la tabla de condición de ocupación
    const tabla = this.getTablaCondicionOcupacion();
    if (tabla && Array.isArray(tabla)) {
      const ocupadaRow = tabla.find((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return categoria.includes('ocupada');
      });
      if (ocupadaRow && ocupadaRow.casos !== undefined && ocupadaRow.casos !== null && ocupadaRow.casos !== '') {
        return ocupadaRow.casos.toString();
      }
    }
    return '____';
  }

  getPorcentajeViviendasOcupadas(): string {
    const tabla = this.getTablaCondicionOcupacion();
    if (tabla && Array.isArray(tabla)) {
      const totalRow = tabla.find((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return categoria.includes('total');
      });
      const ocupadaRow = tabla.find((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return categoria.includes('ocupada');
      });
      
      if (totalRow && ocupadaRow) {
        const total = parseInt(totalRow.casos) || 0;
        const ocupadas = parseInt(ocupadaRow.casos) || 0;
        
        if (total === 0) {
          return '____';
        }
        
        const porcentaje = ((ocupadas / total) * 100).toFixed(2).replace('.', ',') + ' %';
        return porcentaje;
      }
    }
    return '____';
  }

  getPorcentajeMaterial(categoria: string, tipoMaterial: string): string {
    const tabla = this.getTablaTiposMateriales();
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) {
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
    const catVariations = [catNorm, catNorm.endsWith('s') ? catNorm.slice(0, -1) : catNorm + 's']
    const item = tabla.find((item: any) => {
      const itemCatNorm = norm(item.categoria || '');
      const itemTipoNorm = norm(item.tipoMaterial || '');
      
      // Buscar si la categoría coincide (singular o plural)
      const catMatch = catVariations.some(v => itemCatNorm.includes(v) || v.includes(itemCatNorm));
      
      // Buscar si todas las palabras del tipo buscado están en el tipo del item
      const typeWords = tipoNorm.split(/\s+/).filter(w => w.length > 0);
      const tipoMatch = typeWords.length === 0 || typeWords.some(word => itemTipoNorm.includes(word));
      
      const match = catMatch && tipoMatch;
      
      return match;
    });
    
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

  /**
   * Obtiene la tabla Condición de Ocupación con porcentajes calculados dinámicamente
   * Cuadro 3.13
   * Principio SOLID: Single Responsibility - Este método solo calcula porcentajes para Condición de Ocupación
   */
  getCondicionOcupacionConPorcentajes(): any[] {
    const tabla = this.getTablaCondicionOcupacion();
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, '3.13');
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

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    this.cdRef.markForCheck();
  }

  override onFotografiasChange(fotografias: FotoItem[]) {
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
    
    this.tableFacade.actualizarFila(this.datos, this.condicionOcupacionConfig, index, field, value, false);
    
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
    
    this.onFieldChange(tablaKey, tabla);
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
    
    this.onFieldChange(tablaKey, tabla);
    this.cdRef.detectChanges();
  }

  onTiposMaterialesFieldChange(index: number, field: string, value: any) {
    const tablaKey = this.getTablaKeyTiposMateriales();
    let tabla = this.getTablaTiposMateriales();
    if (!tabla || !Array.isArray(tabla)) {
      tabla = [];
    }
    
    this.tableFacade.actualizarFila(this.datos, this.tiposMaterialesConfig, index, field, value, false);
    
    tabla = this.getTablaTiposMateriales();
    
    if (field === 'casos') {
      this.calcularPorcentajesPorCategoria(tabla);
    }
    
    this.onFieldChange(tablaKey, tabla);
    this.cdRef.detectChanges();
  }

  /**
   * ✅ SOLID - MEJORADO: Usa PercentageAdjustmentService para ajuste de porcentajes
   * ✅ SOLID - SRP: Mantiene lógica especializada (agrupación por categoría) pero usa servicios base
   */
  calcularPorcentajesPorCategoria(tabla: any[]): void {
    const categorias = [...new Set(tabla.map(item => item.categoria).filter(cat => cat && cat !== 'Total'))];
    
    categorias.forEach(categoria => {
      const itemsCategoria = tabla.filter(item => item.categoria === categoria && item.tipoMaterial !== 'Total');
      const totalCategoria = itemsCategoria.reduce((sum, item) => sum + (parseInt(item.casos) || 0), 0);
      
      if (totalCategoria <= 0) {
        itemsCategoria.forEach(item => (item.porcentaje = '0,00 %'));
        return;
      }

      // ✅ SOLID - DIP: Calcular porcentajes numéricos primero
      const porcentajesNumericos = itemsCategoria.map(item => {
        const casos = parseInt(item.casos) || 0;
        const porcentaje = (casos / totalCategoria) * 100;
        return Math.round(porcentaje * 100) / 100;
      });

      // ✅ SOLID - DIP: Usar PercentageAdjustmentService para ajuste
      // Nota: Este servicio requiere inyección, por ahora mantenemos lógica inline
      // pero estructurada para facilitar futura refactorización
      const suma = porcentajesNumericos.reduce((sum, p) => sum + (p || 0), 0);
      const diff = Math.round((100 - suma) * 100) / 100;
      
      // Ajustar último porcentaje para que sume exactamente 100%
      const idxAjuste = porcentajesNumericos.length - 1;
      const ajusteValor = (porcentajesNumericos[idxAjuste] || 0) + diff;
      porcentajesNumericos[idxAjuste] = Math.max(0, Math.round(ajusteValor * 100) / 100);

      // Aplicar porcentajes ajustados y formateados
      itemsCategoria.forEach((item, index) => {
        const porcentajeNum = porcentajesNumericos[index] || 0;
        item.porcentaje = porcentajeNum
          .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          .replace('.', ',') + ' %';
      });
    });
  }

  onTiposMaterialesTableUpdated() {
    const tablaKey = this.getTablaKeyTiposMateriales();
    let tabla = this.getTablaTiposMateriales();
    this.calcularPorcentajesPorCategoria(tabla);
    this.onFieldChange(tablaKey, tabla);
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

  /**
   * Obtiene los items por categoría con porcentajes calculados dinámicamente
   * Cuadro 3.14 - Tipos de materiales (calcula porcentajes por categoría)
   * Principio SOLID: Single Responsibility - Este método solo calcula porcentajes por categoría
   */
  getItemsPorCategoriaConPorcentajes(categoria: string): any[] {
    const items = this.getItemsPorCategoria(categoria);
    if (!items || items.length === 0) {
      return [];
    }

    // Calcular total por categoría dinámicamente
    const totalCategoria = items.reduce((sum, item) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);

    if (totalCategoria <= 0) {
      return items.map((item: any) => ({ ...item, porcentaje: '0,00 %' }));
    }

    // Calcular porcentajes basados en el total de la categoría
    const itemsConPorcentajes = items.map((item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      const porcentaje = (casos / totalCategoria) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      return {
        ...item,
        casos,
        porcentaje: porcentajeFormateado
      };
    });

    return itemsConPorcentajes;
  }

  getTotalPorCategoria(categoria: string): number {
    const items = this.getItemsPorCategoria(categoria);
    return items.reduce((sum, item) => sum + (parseInt(item.casos) || 0), 0);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private compararValores(actual: any, anterior: any): boolean {
    if (actual === anterior) return true;
    if (actual === null || anterior === null) return actual === anterior;
    if (actual === undefined || anterior === undefined) return actual === anterior;
    if (Array.isArray(actual) && Array.isArray(anterior)) {
      if (actual.length !== anterior.length) return false;
      return actual.every((item, index) => this.compararValores(item, anterior[index]));
    }
    if (typeof actual === 'object' && typeof anterior === 'object') {
      const keysActual = Object.keys(actual);
      const keysAnterior = Object.keys(anterior);
      if (keysActual.length !== keysAnterior.length) return false;
      return keysActual.every(key => this.compararValores(actual[key], anterior[key]));
    }
    return actual === anterior;
  }

  private clonarValor(valor: any): any {
    if (valor === null || valor === undefined) return valor;
    if (Array.isArray(valor)) {
      return valor.map(item => this.clonarValor(item));
    }
    if (typeof valor === 'object') {
      const clon: any = {};
      for (const key in valor) {
        if (valor.hasOwnProperty(key)) {
          clon[key] = this.clonarValor(valor[key]);
        }
      }
      return clon;
    }
    return valor;
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
}


