import { Component, ChangeDetectorRef, Input, OnDestroy, Injector } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { Subscription } from 'rxjs';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { debugLog } from 'src/app/shared/utils/debug';
// Clean Architecture imports
import { LoadSeccion8UseCase, UpdateSeccion8DataUseCase, Seccion8ViewModel } from 'src/app/core/application/use-cases';
import { Seccion8Data } from 'src/app/core/domain/entities';

@Component({
    selector: 'app-seccion8',
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule,
        ParagraphEditorComponent,
        DynamicTableComponent,
        ImageUploadComponent
    ],
    templateUrl: './seccion8.component.html'
})
export class Seccion8Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['grupoAISD', 'provinciaSeleccionada', 'parrafoSeccion8_ganaderia_completo', 'parrafoSeccion8_agricultura_completo', 'peaOcupacionesTabla', 'poblacionPecuariaTabla', 'caracteristicasAgriculturaTabla', 'textoActividadesEconomicas', 'textoFuentesActividadesEconomicas', 'textoAnalisisCuadro310', 'textoMercadoComercializacion1', 'textoMercadoComercializacion2', 'textoHabitosConsumo1', 'textoHabitosConsumo2'];
  
  readonly PHOTO_PREFIX_GANADERIA = 'fotografiaGanaderia';
  readonly PHOTO_PREFIX_AGRICULTURA = 'fotografiaAgricultura';
  readonly PHOTO_PREFIX_COMERCIO = 'fotografiaComercio';
  
  fotografiasGanaderiaFormMulti: FotoItem[] = [];
  fotografiasAgriculturaFormMulti: FotoItem[] = [];
  fotografiasComercioFormMulti: FotoItem[] = [];
  
  override fotografiasCache: FotoItem[] = [];
  fotografiasGanaderiaCache: FotoItem[] = [];
  fotografiasAgriculturaCache: FotoItem[] = [];
  fotografiasComercioCache: FotoItem[] = [];
  
  private peaOcupacionesCache: any[] = [];
  private peaOcupacionesCacheKey: string = '';
  private totalPEACache: string = '0';
  
  override readonly PHOTO_PREFIX = '';

  private readonly regexCache = new Map<string, RegExp>();

  // Clean Architecture ViewModel
  seccion8ViewModel$ = this.loadSeccion8UseCase.execute();
  seccion8ViewModel?: Seccion8ViewModel;

  peaOcupacionesConfig: TableConfig = {
    tablaKey: 'peaOcupacionesTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    // Sin fila por defecto para que, si el backend no trae datos, la tabla quede vacía
    estructuraInicial: [],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  poblacionPecuariaConfig: TableConfig = {
    tablaKey: 'poblacionPecuariaTabla',
    totalKey: 'especie',
    campoTotal: 'especie',
    campoPorcentaje: 'cantidadPromedio',
    estructuraInicial: [{ especie: '', cantidadPromedio: '', ventaUnidad: '' }]
  };

  caracteristicasAgriculturaConfig: TableConfig = {
    tablaKey: 'caracteristicasAgriculturaTabla',
    totalKey: 'categoria',
    campoTotal: 'categoria',
    campoPorcentaje: 'detalle',
    estructuraInicial: [{ categoria: '', detalle: '' }]
  };

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    protected override autoLoader: AutoBackendDataLoaderService,
    protected override tableFacade: TableManagementFacade,
    private stateAdapter: ReactiveStateAdapter,
    private groupConfig: GroupConfigService,
    private sanitizer: DomSanitizer,
    // Clean Architecture dependencies
    private loadSeccion8UseCase: LoadSeccion8UseCase,
    private updateSeccion8DataUseCase: UpdateSeccion8DataUseCase
  ) {
    super(cdRef, autoLoader, injector, undefined, tableFacade);
    
    // Subscribe to ViewModel for Clean Architecture
    this.seccion8ViewModel$.subscribe(viewModel => {
      this.seccion8ViewModel = viewModel;
      this.cdRef.markForCheck();
    });
  }

  // Clean Architecture methods
  updateSeccion8Data(updates: Partial<Seccion8Data>): void {
    if (this.seccion8ViewModel) {
      const currentData = this.seccion8ViewModel.data;
      const updatedData = { ...currentData, ...updates };
      this.updateSeccion8DataUseCase.execute(updatedData).subscribe(updatedViewModel => {
        this.seccion8ViewModel = updatedViewModel;
        this.cdRef.markForCheck();
      });
    }
  }

  // Backward compatibility methods - delegate to Clean Architecture
  obtenerTextoGanaderia(): string {
    return this.seccion8ViewModel?.texts.ganaderiaText || this.datos.parrafoSeccion8_ganaderia_completo || '';
  }

  obtenerTextoAgricultura(): string {
    return this.seccion8ViewModel?.texts.agriculturaText || this.datos.parrafoSeccion8_agricultura_completo || '';
  }

  obtenerTextoMercadoComercializacion(): string {
    return this.seccion8ViewModel?.texts.mercadoComercializacionText || '';
  }

  obtenerTextoHabitosConsumo(): string {
    return this.seccion8ViewModel?.texts.habitosConsumoText || '';
  }

  protected getSectionKey(): string {
    return 'seccion8_aisd';
  }

  protected getLoadParameters(): string[] | null {
    const ccppDesdeGrupo = this.groupConfig.getAISDCCPPActivos();
    if (ccppDesdeGrupo && ccppDesdeGrupo.length > 0) {
      return ccppDesdeGrupo;
    }
    return null;
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.projectFacade.obtenerDatos();
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      let valorActual: any = null;
      let valorAnterior: any = null;
      
      if (campo === 'peaOcupacionesTabla') {
        const prefijo = this.obtenerPrefijoGrupo();
        const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
        valorActual = (datosActuales as any)[campoConPrefijo] || (datosActuales as any)[campo] || null;
        valorAnterior = this.datosAnteriores[campoConPrefijo] || this.datosAnteriores[campo] || null;
      } else {
        valorActual = (datosActuales as any)[campo] || null;
        valorAnterior = this.datosAnteriores[campo] || null;
      }
      
      const sonIguales = this.compararValores(valorActual, valorAnterior);
      if (!sonIguales) {
        hayCambios = true;
        if (campo === 'peaOcupacionesTabla') {
          this.invalidarCachePEA();
          const prefijo = this.obtenerPrefijoGrupo();
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
    this.eliminarFilasTotal();
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
  }

  private getTablaPEAOcupaciones(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `peaOcupacionesTabla${prefijo}` : 'peaOcupacionesTabla';
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'peaOcupacionesTabla', this.seccionId) || this.datos.peaOcupacionesTabla || [];
    
    return tabla;
  }

  getTablaKeyPEAOcupaciones(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `peaOcupacionesTabla${prefijo}` : 'peaOcupacionesTabla';
  }

  private eliminarFilasTotal(): void {
    const tabla = this.getTablaPEAOcupaciones();
    if (tabla && Array.isArray(tabla)) {
      const longitudOriginal = tabla.length;
      const datosFiltrados = tabla.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        const tablaKey = this.getTablaKeyPEAOcupaciones();
        this.datos[tablaKey] = datosFiltrados;
        this.onFieldChange(tablaKey, datosFiltrados);
      }
    }
  }

  getPEAOcupacionesSinTotal(): any[] {
    const tabla = this.getTablaPEAOcupaciones();
    const tablaKey = this.getTablaKeyPEAOcupaciones();
    
    // Si el caache es válido para esta clave, devolverlo
    if (this.peaOcupacionesCacheKey === tablaKey && this.peaOcupacionesCache.length > 0) {
      return this.peaOcupacionesCache;
    }
    
    if (!tabla || !Array.isArray(tabla)) {
      this.peaOcupacionesCache = [];
      this.peaOcupacionesCacheKey = tablaKey;
      return [];
    }
    
    const filtrada = tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
    
    const total = filtrada.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    
    this.totalPEACache = total.toString();
    
    const resultado = filtrada.map((item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      const porcentaje = total > 0 ? ((casos / total) * 100).toFixed(2).replace('.', ',') : '0,00';
      return {
        ...item,
        porcentaje: `${porcentaje} %`
      };
    });


    
    // Guardar en caache
    this.peaOcupacionesCache = resultado;
    this.peaOcupacionesCacheKey = tablaKey;
    
    return resultado;
  }

  getTotalPEAOcupaciones(): string {
    // Asegurar que el caache esté actualizado
    this.getPEAOcupacionesSinTotal();
    return this.totalPEACache;
  }

  /**
   * Obtiene la tabla PEA Ocupaciones con porcentajes calculados dinámicamente
   * Similar a getPETConPorcentajes() y getPoblacionSexoConPorcentajes()
   * Principio SOLID: Single Responsibility - Este método solo calcula porcentajes para PEA Ocupaciones
   */
  getPEAOcupacionesConPorcentajes(): any[] {
    const tablaPEA = this.getPEAOcupacionesSinTotal();
    if (!tablaPEA || !Array.isArray(tablaPEA) || tablaPEA.length === 0) {
      return [];
    }

    // Calcular total dinámicamente como suma de casos en la tabla
    const total = tablaPEA.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      debugLog('⚠️ Total casos en tabla PEA Ocupaciones <= 0, retornando porcentajes 0,00%');
      return tablaPEA.map((item: any) => ({ ...item, porcentaje: '0,00 %' }));
    }

    // Calcular porcentajes basados en el total de la tabla
    const tablaConPorcentajes = tablaPEA.map((item: any) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      debugLog(`📊 Cálculo porcentaje PEA Ocupaciones ${item.categoria}: ${casos} / ${total} = ${porcentaje.toFixed(2)}%`);

      return {
        ...item,
        casos,
        porcentaje: porcentajeFormateado
      };
    });

    // Agregar fila de total si no existe
    const filaTotal = {
      categoria: 'Total',
      casos: total,
      porcentaje: '100,00 %'
    };
    tablaConPorcentajes.push(filaTotal);

    // Log específico para la tabla Cuadro 3.10
    debugLog('📊 Cuadro N° 3.10 - PEA Ocupada según ocupaciones principales:', tablaConPorcentajes);
    
    return tablaConPorcentajes;
  }

  private invalidarCachePEA(): void {
    this.peaOcupacionesCache = [];
    this.peaOcupacionesCacheKey = '';
    this.totalPEACache = '0';
  }

  protected override tieneFotografias(): boolean {
    return false;
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  getPorcentajeOcupacion(categoria: string): string {
    const tabla = this.getTablaPEAOcupaciones();
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const item = tabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase())
    );
    return item?.porcentaje || '____';
  }

  getTopOcupaciones(limit: number = 3): Array<{categoria: string, porcentaje: string, casos: number}> {
    // Usa la versión calculada (con porcentaje ya evaluado) para que el texto se alimente del backend.
    const calculada = this.getPEAOcupacionesSinTotal();
    if (!calculada || !Array.isArray(calculada)) {
      return [];
    }

    const sinTotal = calculada
      .filter((item: any) => item.categoria && item.casos !== undefined && item.casos > 0)
      .sort((a: any, b: any) => {
        const casosA = parseInt(a.casos) || 0;
        const casosB = parseInt(b.casos) || 0;
        return casosB - casosA;
      });

    return sinTotal.slice(0, limit).map((item: any) => ({
      categoria: item.categoria || '____',
      porcentaje: item.porcentaje || '____',
      casos: parseInt(item.casos) || 0
    }));
  }

  /**
   * ✅ SOLID - REFACTORIZADO: Usa TableManagementFacade en lugar de cálculo manual
   * ✅ SOLID - DRY: Elimina duplicación de lógica de cálculo
   * ✅ SOLID - DIP: Depende de abstracción (facade) en lugar de implementación concreta
   */
  onPEAOcupacionesFieldChange(index: number, field: string, value: any): void {
    const tablaKey = this.getTablaKeyPEAOcupaciones();
    const configConTablaKey = { ...this.peaOcupacionesConfig, tablaKey };

    // ✅ SOLID - DIP: Usar facade para actualizar fila con cálculo automático
    this.tableFacade.actualizarFila(
      this.datos,
      configConTablaKey,
      index,
      field,
      value,
      true // autoCalcular = true (usuario editó, calcular automáticamente)
    );

    // Invalidar caché PEA
    this.invalidarCachePEA();
    
    // Limpiar texto de análisis si cambió el campo 'casos'
    if (field === 'casos') {
      const fieldIdParrafo = 'textoAnalisisCuadro310';
      if (this.datos[fieldIdParrafo]) {
        delete this.datos[fieldIdParrafo];
        this.onFieldChange(fieldIdParrafo as any, null);
      }
    }

    // Eliminar filas Total (si existen)
    this.eliminarFilasTotal();
    
    // Actualizar datos y detectar cambios
    this.onFieldChange(tablaKey as any, this.datos[tablaKey]);
    this.cdRef.detectChanges();
  }

  onPEAOcupacionesTableUpdated() {
    this.invalidarCachePEA();
    this.eliminarFilasTotal();
    const tablaKey = this.getTablaKeyPEAOcupaciones();
    const tabla = this.getTablaPEAOcupaciones();
    this.onFieldChange(tablaKey, tabla);
    this.cdRef.detectChanges();
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  override actualizarFotografiasFormMulti() {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasGanaderiaFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_GANADERIA,
      groupPrefix
    );
    this.fotografiasAgriculturaFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_AGRICULTURA,
      groupPrefix
    );
    this.fotografiasComercioFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_COMERCIO,
      groupPrefix
    );
  }

  protected override onInitCustom(): void {
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateAdapter.datos$.subscribe(() => {
        this.cargarFotografias();
        const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
        this.fotografiasGanaderiaCache = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_GANADERIA, groupPrefix) || [];
        this.fotografiasAgriculturaCache = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_AGRICULTURA, groupPrefix) || [];
        this.fotografiasComercioCache = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_COMERCIO, groupPrefix) || [];
        this.cdRef.detectChanges();
      });
    }
    this.logGrupoActual();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
  }

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = [...fotos];
    this.cdRef.markForCheck();
  }

  onFotografiasGanaderiaChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_GANADERIA, fotografias);
    this.fotografiasGanaderiaFormMulti = [...fotografias];
    this.fotografiasGanaderiaCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  onFotografiasAgriculturaChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_AGRICULTURA, fotografias);
    this.fotografiasAgriculturaFormMulti = [...fotografias];
    this.fotografiasAgriculturaCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  onFotografiasComercioChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_COMERCIO, fotografias);
    this.fotografiasComercioFormMulti = [...fotografias];
    this.fotografiasComercioCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  obtenerTextoSeccion8GanaderiaCompleto(): string {
    if (this.datos.parrafoSeccion8_ganaderia_completo) {
      return this.datos.parrafoSeccion8_ganaderia_completo;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const provincia = this.datos.provinciaSeleccionada || '____';
    
    return `En la CC ${grupoAISD}, la ganadería es la actividad económica predominante, con un 80 % de la producción destinada al autoconsumo familiar y un 20 % a la venta, según los entrevistados. Las principales especies que se crían son los vacunos y los ovinos, aunque también se crían caprinos y animales menores como gallinas y cuyes. El precio del ganado en pie varía dependiendo de la especie: los vacunos se venden entre S/. 1 200 y S/. 1 500, los ovinos entre S/. 180 y S/. 200, las gallinas entre S/. 20 y S/. 30, y los cuyes entre S/. 25 y S/. 30.\n\nLa alimentación del ganado se basa principalmente en pasto natural, aunque también se les proporciona pasto cultivable en las temporadas de escasez. Uno de los productos derivados más importantes es el queso, el cual se destina particularmente a la capital provincial de ${provincia} para la venta; también se elabora yogurt, aunque en menor medida.\n\nA pesar de la importancia de esta actividad para la economía local, la ganadería enfrenta diversas problemáticas. Entre las principales están la falta de especialistas en salud veterinaria, así como los desafíos climáticos, especialmente las heladas, que pueden reducir la disponibilidad de pastos y generar pérdidas en los rebaños. Estas dificultades impactan directamente en la productividad y los ingresos de los comuneros ganaderos.`;
  }

  obtenerTextoSeccion8GanaderiaCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion8GanaderiaCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const provincia = this.datos.provinciaSeleccionada || '____';
    
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(this.obtenerRegExp(this.escapeRegex(provincia)), `<span class="data-section">${this.escapeHtml(provincia)}</span>`);
    
    const parrafos = textoConResaltado.split(/\n\n+/);
    const html = parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
    
    return this.sanitizer.sanitize(1, html) as SafeHtml;
  }

  obtenerTextoSeccion8AgriculturaCompleto(): string {
    if (this.datos.parrafoSeccion8_agricultura_completo) {
      return this.datos.parrafoSeccion8_agricultura_completo;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `En la CC ${grupoAISD}, la agricultura desempeña un papel complementario a la ganadería, y la mayor parte de la producción, cerca de un 95 % según los entrevistados, se destina al autoconsumo, mientras que solo un 5 % se comercializa. Los principales cultivos son la papa, habas, cebada y forraje (como avena y alfalfa), los cuales son esenciales para la dieta de las familias comuneras y en menor medida para la alimentación del ganado. Estos productos se cultivan en pequeñas parcelas, con cada familia disponiendo de un promedio de 1 ½ hectárea de tierra.\n\nEl sistema de riego utilizado en la comunidad es principalmente por gravedad, aprovechando las fuentes de agua disponibles en la zona. Sin embargo, la actividad agrícola enfrenta serios desafíos, como las heladas, que dañan los cultivos durante las temporadas frías, y las sequías, que disminuyen la disponibilidad de agua, afectando la capacidad productiva de las familias. Adicionalmente, se enfrentan plagas y enfermedades como roedores y el gusano blanco. Estas problemáticas, recurrentes en el ciclo agrícola, limitan tanto la cantidad como la calidad de los productos cosechados.`;
  }

  obtenerTextoSeccion8AgriculturaCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion8AgriculturaCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let textoConResaltado = texto
      .replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    
    const parrafos = textoConResaltado.split(/\n\n+/);
    const html = parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
    
    return this.sanitizer.sanitize(1, html) as SafeHtml;
  }

  obtenerTextoActividadesEconomicas(): string {
    if (this.datos.textoActividadesEconomicas && this.datos.textoActividadesEconomicas !== '____') {
      return this.datos.textoActividadesEconomicas;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `Las actividades económicas de la población son un reflejo de los patrones de producción, consumo y empleo en una localidad o jurisdicción determinada. En este ítem, se describe las ocupaciones principales existentes en los poblados de la CC ${grupoAISD}, que forma parte del AISD.`;
  }

  obtenerTextoActividadesEconomicasConResaltado(): SafeHtml {
    const texto = this.obtenerTextoActividadesEconomicas();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    const textoConResaltado = texto.replace(
      this.obtenerRegExp(this.escapeRegex(grupoAISD)),
      `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`
    );
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoAnalisisCuadro310(): string {
    if (this.datos.textoAnalisisCuadro310 && this.datos.textoAnalisisCuadro310 !== '____') {
      return this.datos.textoAnalisisCuadro310;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const topOcupaciones = this.getTopOcupaciones(3);
    
    if (topOcupaciones.length === 0) {
      return `Del cuadro anterior, se aprecia que, al momento de la aplicación de los Censos Nacionales 2017, no se registraron ocupaciones dentro de la CC ${grupoAISD}.`;
    }
    
    const primera = topOcupaciones[0];
    const segunda = topOcupaciones[1] || { categoria: '____', porcentaje: '____' };
    const tercera = topOcupaciones[2] || { categoria: '____', porcentaje: '____' };
    
    return `Del cuadro anterior, se aprecia que, al momento de la aplicación de los Censos Nacionales 2017, la ocupación más frecuente dentro de la CC ${grupoAISD} es la de "${primera.categoria}" con un ${primera.porcentaje}. Las siguientes ocupaciones que se hallan son la de ${segunda.categoria} (${segunda.porcentaje}) y ${tercera.categoria} (${tercera.porcentaje}). Ello se condice con las entrevistas aplicadas en campo, puesto que se recolectó información que indica que la mayor parte de la población se dedica a las actividades agropecuarias de subsistencia de manera independiente o por cuenta propia.`;
  }

  obtenerTextoAnalisisCuadro310ConResaltado(): SafeHtml {
    const texto = this.obtenerTextoAnalisisCuadro310();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const topOcupaciones = this.getTopOcupaciones(3);
    
    let textoConResaltado = texto
      .replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    
    topOcupaciones.forEach(ocupacion => {
      if (ocupacion.categoria && ocupacion.categoria !== '____') {
        textoConResaltado = textoConResaltado.replace(
          this.obtenerRegExp(this.escapeRegex(ocupacion.categoria)), 
          `<span class="data-backend">${this.escapeHtml(ocupacion.categoria)}</span>`
        );
      }
      if (ocupacion.porcentaje && ocupacion.porcentaje !== '____') {
        textoConResaltado = textoConResaltado.replace(
          this.obtenerRegExp(this.escapeRegex(ocupacion.porcentaje)), 
          `<span class="data-calculated">${this.escapeHtml(ocupacion.porcentaje)}</span>`
        );
      }
    });
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoMercadoComercializacion1(): string {
    if (this.datos.textoMercadoComercializacion1 && this.datos.textoMercadoComercializacion1 !== '____') {
      return this.datos.textoMercadoComercializacion1;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `Dentro de la CC ${grupoAISD} no existe un mercado local donde se puedan comercializar los productos agrícolas o ganaderos directamente. Toda la venta de estos productos se realiza a través de intermediarios que visitan la comunidad en busca de animales en pie o productos como el queso. Estos intermediarios suelen establecer los precios de compra, lo que limita la capacidad de los comuneros para negociar y obtener un valor justo por su producción.`;
  }

  obtenerTextoMercadoComercializacion1ConResaltado(): SafeHtml {
    const texto = this.obtenerTextoMercadoComercializacion1();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    const textoConResaltado = texto.replace(
      this.obtenerRegExp(this.escapeRegex(grupoAISD)),
      `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`
    );
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoMercadoComercializacion2(): string {
    if (this.datos.textoMercadoComercializacion2 && this.datos.textoMercadoComercializacion2 !== '____') {
      return this.datos.textoMercadoComercializacion2;
    }
    
    return `Esta dependencia de los intermediarios presenta diversas dificultades. Por un lado, los comuneros reciben precios más bajos en comparación con los que podrían obtener si tuvieran acceso directo a mercados más grandes o si contaran con un punto de venta dentro de la comunidad. Además, el transporte de los productos fuera de la comunidad aumenta los costos logísticos, afectando la rentabilidad de las actividades económicas. Este sistema de comercialización se traduce en una vulnerabilidad económica para las familias, ya que dependen de las condiciones impuestas por terceros para la venta de sus bienes.`;
  }

  obtenerTextoMercadoComercializacion2ConResaltado(): SafeHtml {
    const texto = this.obtenerTextoMercadoComercializacion2();
    return this.sanitizer.sanitize(1, texto) as SafeHtml;
  }

  obtenerTextoHabitosConsumo1(): string {
    if (this.datos.textoHabitosConsumo1 && this.datos.textoHabitosConsumo1 !== '____') {
      return this.datos.textoHabitosConsumo1;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `En la CC ${grupoAISD}, los hábitos de consumo se caracterizan por una dieta basada principalmente en productos que se adquieren de comerciantes que visitan la comunidad periódicamente (quincenalmente, en promedio), así como en pequeñas bodegas locales. Entre los alimentos más consumidos destacan los abarrotes como el arroz, maíz y fideos, que forman parte esencial de la alimentación diaria de las familias. Estos productos son complementados con la producción local de papa y habas, que también son alimentos fundamentales en la dieta.`;
  }

  obtenerTextoHabitosConsumo1ConResaltado(): SafeHtml {
    const texto = this.obtenerTextoHabitosConsumo1();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    const textoConResaltado = texto.replace(
      this.obtenerRegExp(this.escapeRegex(grupoAISD)),
      `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`
    );
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoHabitosConsumo2(): string {
    if (this.datos.textoHabitosConsumo2 && this.datos.textoHabitosConsumo2 !== '____') {
      return this.datos.textoHabitosConsumo2;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `El consumo de papa y habas es especialmente importante, ya que ambos son productos locales y tradicionales, que no solo se destinan al autoconsumo, sino que también forman parte de la base alimentaria debido a su disponibilidad y bajo costo. La producción de estos alimentos es continua, lo que asegura su presencia en la mayoría de los hogares. Dentro de la CC ${grupoAISD} resaltan algunos platos tradicionales como el "revuelto de habas", cuy chactado y el chicharrón. Por otra parte, también destaca el consumo de frutas que son obtenidas a través de los comerciantes que visitan la comunidad, los cuales ofrecen productos adicionales como verduras y prendas en determinadas ocasiones.`;
  }

  obtenerTextoHabitosConsumo2ConResaltado(): SafeHtml {
    const texto = this.obtenerTextoHabitosConsumo2();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    const textoConResaltado = texto.replace(
      this.obtenerRegExp(this.escapeRegex(grupoAISD)),
      `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`
    );
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
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


  getFotografiasGanaderiaVista(): FotoItem[] {
    if (this.fotografiasGanaderiaCache && this.fotografiasGanaderiaCache.length > 0) {
      return this.fotografiasGanaderiaCache;
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_GANADERIA,
      groupPrefix
    );
    this.fotografiasGanaderiaCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasGanaderiaCache;
  }

  getFotografiasAgriculturaVista(): FotoItem[] {
    if (this.fotografiasAgriculturaCache && this.fotografiasAgriculturaCache.length > 0) {
      return this.fotografiasAgriculturaCache;
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_AGRICULTURA,
      groupPrefix
    );
    this.fotografiasAgriculturaCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasAgriculturaCache;
  }

  getFotografiasComercioVista(): FotoItem[] {
    if (this.fotografiasComercioCache && this.fotografiasComercioCache.length > 0) {
      return this.fotografiasComercioCache;
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_COMERCIO,
      groupPrefix
    );
    this.fotografiasComercioCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasComercioCache;
  }
}


