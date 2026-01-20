import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { ViviendaService } from 'src/app/core/services/vivienda.service';
import { MaterialesService } from 'src/app/core/services/materiales.service';

@Component({
  selector: 'app-seccion25',
  templateUrl: './seccion25.component.html',
  styleUrls: ['./seccion25.component.css']
})
export class Seccion25Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  private readonly regexCache = new Map<string, RegExp>();
  
  override watchedFields: string[] = ['centroPobladoAISI', 'tiposViviendaAISI', 'condicionOcupacionAISI', 'materialesViviendaAISI', 'textoViviendaAISI', 'textoOcupacionViviendaAISI', 'textoEstructuraAISI'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB14';
  
  fotografiasInstitucionalidadCache: any[] = [];

  tiposViviendaConfig: TableConfig = {
    tablaKey: 'tiposViviendaAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  condicionOcupacionConfig: TableConfig = {
    tablaKey: 'condicionOcupacionAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  materialesViviendaConfig: TableConfig = {
    tablaKey: 'materialesViviendaAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    cdRef: ChangeDetectorRef,
    private tableService: TableManagementService,
    private stateService: StateService,
    private sanitizer: DomSanitizer,
    autoLoader: AutoBackendDataLoaderService,
    private groupConfig: GroupConfigService,
    private viviendaService: ViviendaService,
    private materialesService: MaterialesService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, null as any, cdRef, autoLoader);
  }

  protected override onInitCustom(): void {
    this.eliminarFilasTotal();
    this.actualizarFotografiasCache();
    this.cargarDatosVivienda();
    this.cargarDatosMateriales();
    
    setTimeout(() => {
      (window as any).debugCuadro345 = () => this.debugCuadro345();
      (window as any).debugCuadro347 = () => this.debugCuadro347();
      console.log('💡 Para depurar:');
      console.log('   - Cuadro 3.45 (Condición Ocupación): debugCuadro345()');
      console.log('   - Cuadro 3.47 (Materiales): debugCuadro347()');
    }, 1000);
    
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  override ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  protected getSectionKey(): string {
    return 'seccion25_aisi';
  }

  protected getLoadParameters(): string[] | null {
    return this.groupConfig.getAISICCPPActivos();
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
    const centroPobladoAISIActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'centroPobladoAISI', this.seccionId);
    const centroPobladoAISIAnterior = this.datosAnteriores.centroPobladoAISI || null;
    const centroPobladoAISIEnDatos = this.datos.centroPobladoAISI || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (!this.compararValores(valorActual, valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = this.clonarValor(valorActual);
      }
    }
    
    if (centroPobladoAISIActual !== centroPobladoAISIAnterior || centroPobladoAISIActual !== centroPobladoAISIEnDatos || hayCambios) {
      return true;
    }
    
    return false;
  }

  protected override actualizarDatosCustom(): void {
    this.actualizarFotografiasCache();
  }

  protected override actualizarValoresConPrefijo(): void {
    const centroPobladoAISI = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    this.datos.centroPobladoAISI = centroPobladoAISI || null;
    this.datosAnteriores.centroPobladoAISI = centroPobladoAISI || null;
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getTablaKeyTiposVivienda(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `tiposViviendaAISI${prefijo}` : 'tiposViviendaAISI';
  }

  getTablaKeyCondicionOcupacion(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `condicionOcupacionAISI${prefijo}` : 'condicionOcupacionAISI';
  }

  getTablaKeyMaterialesVivienda(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `materialesViviendaAISI${prefijo}` : 'materialesViviendaAISI';
  }

  protected override tieneFotografias(): boolean {
    return true;
  }

  getViviendasOcupadasPresentes(): string {
    const tablaKey = this.getTablaKeyCondicionOcupacion();
    const tabla = this.datos[tablaKey] || this.datos?.condicionOcupacionAISI || [];
    
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const item = tabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && item.categoria.toLowerCase().includes('presentes')
    );
    return item?.casos?.toString() || '____';
  }

  getPorcentajeOcupadasPresentes(): string {
    const tablaKey = this.getTablaKeyCondicionOcupacion();
    const tabla = this.datos[tablaKey] || this.datos?.condicionOcupacionAISI || [];
    
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    
    // Buscar la fila "Ocupado"
    const item = tabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase() === 'ocupado'
    );
    
    if (!item) {
      return '____';
    }
    
    // Calcular dinámicamente basado en casos (igual que calcularPorcentajeCondicion)
    const total = this.getTotalCondicionOcupacion();
    if (total === 0) {
      return '0,00 %';
    }
    const casos = Number(item.casos) || 0;
    const porcentaje = (casos / total) * 100;
    return this.formatearPorcentaje(porcentaje);
  }

  getPorcentajePisosTierra(): string {
    const tablaKey = this.getTablaKeyMaterialesVivienda();
    const tabla = this.datos[tablaKey] || this.datos?.materialesViviendaAISI || [];
    
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const item = tabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('piso') && 
      item.tipoMaterial && item.tipoMaterial.toLowerCase().includes('tierra')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajePisosCemento(): string {
    const tablaKey = this.getTablaKeyMaterialesVivienda();
    const tabla = this.datos[tablaKey] || this.datos?.materialesViviendaAISI || [];
    
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const item = tabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('piso') && 
      item.tipoMaterial && item.tipoMaterial.toLowerCase().includes('cemento')
    );
    return item?.porcentaje || '____';
  }

  getFotoEstructura(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaEstructuraAISITitulo'] || 'Estructura de las viviendas en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaEstructuraAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaEstructuraAISIImagen'] || '';
    
    return {
      numero: '3. 28',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoEstructuraParaImageUpload(): FotoItem[] {
    const foto = this.getFotoEstructura();
    if (!foto.ruta) {
      return [];
    }
    return [{
      titulo: foto.titulo,
      fuente: foto.fuente,
      imagen: foto.ruta
    }];
  }

  override actualizarFotografiasCache() {
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
  }

  override getFotografiasVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
  }

  cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = [...fotos];
    this.cdRef.markForCheck();
  }

  onFotografiasChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
  }

  onMaterialesViviendaFieldChange(index: number, field: string, value: any) {
    const tablaKey = this.getTablaKeyMaterialesVivienda();
    const tabla = this.datos[tablaKey] || this.datos['materialesViviendaAISI'] || [];
    
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      
      if (field === 'casos') {
        this.calcularPorcentajesMaterialesViviendaAISI();
      }
      
      this.datos[tablaKey] = [...tabla];
      this.formularioService.actualizarDato(tablaKey as any, tabla);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onMaterialesViviendaTableUpdated() {
    const tablaKey = this.getTablaKeyMaterialesVivienda();
    const tabla = this.datos[tablaKey] || this.datos['materialesViviendaAISI'] || [];
    this.calcularPorcentajesMaterialesViviendaAISI();
    this.datos[tablaKey] = [...tabla];
    this.formularioService.actualizarDato(tablaKey as any, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  calcularPorcentajesMaterialesViviendaAISI() {
    const tablaKey = this.getTablaKeyMaterialesVivienda();
    const tabla = this.datos[tablaKey] || this.datos['materialesViviendaAISI'] || [];
    
    if (!tabla || tabla.length === 0) {
      return;
    }
    
    const categorias = ['paredes', 'techos', 'pisos'];
    categorias.forEach(categoria => {
      const itemsCategoria = tabla.filter((item: any) => 
        item.categoria && item.categoria.toLowerCase().includes(categoria)
      );
      if (itemsCategoria.length > 0) {
        const totalItem = itemsCategoria.find((item: any) => 
          item.categoria && item.categoria.toLowerCase().includes('total')
        );
        const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
        
        if (total > 0) {
          itemsCategoria.forEach((item: any) => {
            if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
              const casos = parseFloat(item.casos) || 0;
              const porcentaje = ((casos / total) * 100).toFixed(2);
              item.porcentaje = porcentaje + ' %';
            }
          });
        }
      }
    });
    
    // Actualizar la tabla en datos
    this.datos[tablaKey] = [...tabla];
  }

  obtenerTextoViviendaAISI(): string {
    if (this.datos.textoViviendaAISI && this.datos.textoViviendaAISI !== '____') {
      return this.datos.textoViviendaAISI;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const totalViviendas = this.getTotalViviendasEmpadronadas();
    
    return `Según los Censos Nacionales 2017, en el CP ${centroPoblado} se hallan un total de ${totalViviendas} viviendas empadronadas. El único tipo de vivienda existente es la casa independiente, pues representa el 100,0 % del conjunto.`;
  }

  obtenerTextoOcupacionViviendaAISI(): string {
    if (this.datos.textoOcupacionViviendaAISI && this.datos.textoOcupacionViviendaAISI !== '____') {
      return this.datos.textoOcupacionViviendaAISI;
    }
    
    const viviendasOcupadas = this.getViviendasOcupadasPresentes();
    const porcentajeOcupadas = this.getPorcentajeOcupadasPresentes();
    
    return `Para poder describir el acápite de estructura de las viviendas de esta localidad, así como la sección de los servicios básicos, se toma como conjunto total a las viviendas ocupadas con personas presentes que llegan a la cantidad de ${viviendasOcupadas}. A continuación, se muestra el cuadro con la información respecto a la condición de ocupación de viviendas, tal como realiza el Censo Nacional 2017. De aquí se halla que las viviendas ocupadas con personas presentes representan el ${porcentajeOcupadas} del conjunto analizado.`;
  }

  obtenerTextoEstructuraAISI(): string {
    if (this.datos.textoEstructuraAISI && this.datos.textoEstructuraAISI !== '____') {
      return this.datos.textoEstructuraAISI;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const porcentajePisosTierra = this.getPorcentajePisosTierra();
    const porcentajePisosCemento = this.getPorcentajePisosCemento();
    
    return `Según la información recabada de los Censos Nacionales 2017, dentro del CP ${centroPoblado}, el único material empleado para la construcción de las paredes de las viviendas es el adobe. Respecto a los techos, también se cuenta con un único material, que son las planchas de calamina, fibra de cemento o similares.\n\nFinalmente, en cuanto a los pisos, la mayoría están hechos de tierra (${porcentajePisosTierra}). El porcentaje restante, que consta del ${porcentajePisosCemento}, cuentan con pisos elaborados a base de cemento.`;
  }

  // Métodos para filtrar filas Total de tipos de vivienda
  getTiposViviendaSinTotal(): any[] {
    const tablaKey = this.getTablaKeyTiposVivienda();
    const tabla = this.datos[tablaKey] || this.datos?.tiposViviendaAISI || [];
    
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => 
      !item.categoria || !item.categoria.toLowerCase().includes('total')
    );
  }

  getTotalTiposVivienda(): number {
    const filtered = this.getTiposViviendaSinTotal();
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  }

  // Alias para compatibilidad - obtener total de viviendas empadronadas
  getTotalViviendasEmpadronadas(): number {
    return this.getTotalTiposVivienda();
  }

  // Métodos para filtrar filas Total de condición de ocupación
  getCondicionOcupacionSinTotal(): any[] {
    const tablaKey = this.getTablaKeyCondicionOcupacion();
    const tabla = this.datos[tablaKey] || this.datos?.condicionOcupacionAISI || [];
    console.log('[S25] getCondicionOcupacionSinTotal - tablaKey:', tablaKey, 'datos:', tabla);
    if (!tabla || !Array.isArray(tabla)) {
      console.log('[S25] No hay datos o no es array');
      return [];
    }
    const filtered = tabla.filter((item: any) => 
      !item.categoria || !item.categoria.toLowerCase().includes('total')
    );
    console.log('[S25] Filtrado:', filtered);
    return filtered;
  }

  getTotalCondicionOcupacion(): number {
    const filtered = this.getCondicionOcupacionSinTotal();
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  }

  // Calcular porcentaje dinámico para tabla manual de Condición de Ocupación
  calcularPorcentajeCondicion(item: any): string {
    const total = this.getTotalCondicionOcupacion();
    if (total === 0) {
      return '0,00 %';
    }
    const casos = Number(item.casos) || 0;
    const porcentaje = (casos / total) * 100;
    return this.formatearPorcentaje(porcentaje);
  }

  // Métodos para filtrar filas Total de materiales de vivienda
  getMaterialesViviendaSinTotal(): any[] {
    const tablaKey = this.getTablaKeyMaterialesVivienda();
    const tabla = this.datos[tablaKey] || this.datos?.materialesViviendaAISI || [];
    console.log('[S25] getMaterialesViviendaSinTotal - tablaKey:', tablaKey, 'datos:', tabla);
    if (!tabla || !Array.isArray(tabla)) {
      console.log('[S25] No hay datos o no es array');
      return [];
    }
    const filtered = tabla.filter((item: any) => 
      !item.categoria || !item.categoria.toLowerCase().includes('total')
    );
    console.log('[S25] Filtrado:', filtered);
    return filtered;
  }

  // Agrupar materiales por categoría con subtotales
  getMaterialesAgrupados(): any[] {
    const materiales = this.getMaterialesViviendaSinTotal();
    if (!materiales || materiales.length === 0) {
      return [];
    }

    // Agrupar por categoría
    const grupos: { [key: string]: any[] } = {};
    const ordenCategorias: string[] = [];

    materiales.forEach((item: any) => {
      const categoria = item.categoria || '';
      if (!grupos[categoria]) {
        grupos[categoria] = [];
        ordenCategorias.push(categoria);
      }
      grupos[categoria].push(item);
    });

    // Construir resultado con subtotales
    const resultado: any[] = [];
    ordenCategorias.forEach((categoria: string) => {
      const itemsCategoria = grupos[categoria];
      const subtotal = itemsCategoria.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);

      // Agregar items de la categoría
      itemsCategoria.forEach((item: any) => {
        resultado.push({
          ...item,
          esSubtotal: false,
          categoria: categoria
        });
      });

      // Agregar fila de subtotal con "Total" en la categoría
      resultado.push({
        categoria: 'Total',
        tipoMaterial: '—',
        casos: subtotal,
        porcentaje: '100,00 %',
        esSubtotal: true
      });
    });

    return resultado;
  }

  getTotalMaterialesVivienda(): number {
    const filtered = this.getMaterialesViviendaSinTotal();
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  }

  // Eliminar filas Total al cargar datos
  eliminarFilasTotal(): void {
    // Tipos de Vivienda
    const tiposViviendaKey = this.getTablaKeyTiposVivienda();
    const tiposVivienda = this.datos[tiposViviendaKey] || this.datos?.tiposViviendaAISI;
    if (tiposVivienda && Array.isArray(tiposVivienda)) {
      const filtered = tiposVivienda.filter((item: any) => 
        !item.categoria || !item.categoria.toLowerCase().includes('total')
      );
      if (filtered.length !== tiposVivienda.length) {
        this.datos[tiposViviendaKey] = filtered;
        this.formularioService.actualizarDato(tiposViviendaKey as any, filtered);
      }
    }

    // Condición de Ocupación
    const condicionKey = this.getTablaKeyCondicionOcupacion();
    const condicion = this.datos[condicionKey] || this.datos?.condicionOcupacionAISI;
    if (condicion && Array.isArray(condicion)) {
      const filtered = condicion.filter((item: any) => 
        !item.categoria || !item.categoria.toLowerCase().includes('total')
      );
      if (filtered.length !== condicion.length) {
        this.datos[condicionKey] = filtered;
        this.formularioService.actualizarDato(condicionKey as any, filtered);
      }
    }

    // Materiales de Vivienda
    const materialesKey = this.getTablaKeyMaterialesVivienda();
    const materiales = this.datos[materialesKey] || this.datos?.materialesViviendaAISI;
    if (materiales && Array.isArray(materiales)) {
      const filtered = materiales.filter((item: any) => 
        !item.categoria || !item.categoria.toLowerCase().includes('total')
      );
      if (filtered.length !== materiales.length) {
        this.datos[materialesKey] = filtered;
        this.formularioService.actualizarDato(materialesKey as any, filtered);
      }
    }
  }

  debugCuadro345(): void {
    console.log('=== DEBUG CUADRO 3.45 - CONDICIÓN DE OCUPACIÓN ===');
    const codigos = this.groupConfig.getAISICCPPActivos();
    console.log('1. Códigos UBIGEO activos:', codigos);
    console.log('2. Sección ID:', this.seccionId);
    console.log('3. Prefijo grupo:', this.obtenerPrefijoGrupo());
    console.log('4. Tabla key esperada:', this.getTablaKeyCondicionOcupacion());
    console.log('5. Datos actuales:');
    const todosLosDatos = this.formularioService.obtenerDatos();
    console.log('   - condicionOcupacionAISI:', todosLosDatos['condicionOcupacionAISI']);
    console.log('   - condicionOcupacionAISI_B1:', todosLosDatos['condicionOcupacionAISI_B1']);
    console.log('6. Datos en this.datos:', this.datos?.condicionOcupacionAISI);
    console.log('⚠️ NOTA: No hay endpoint para condición de ocupación. Los datos deben ingresarse manualmente.');
    console.log('=== FIN DEBUG ===');
  }

  debugCuadro347(): void {
    console.log('=== DEBUG CUADRO 3.47 - MATERIALES DE CONSTRUCCIÓN ===');
    const codigos = this.groupConfig.getAISICCPPActivos();
    console.log('1. Códigos UBIGEO activos:', codigos);
    console.log('2. Sección ID:', this.seccionId);
    console.log('3. Prefijo grupo:', this.obtenerPrefijoGrupo());
    console.log('4. Tabla key esperada:', this.getTablaKeyMaterialesVivienda());
    console.log('5. Datos actuales:');
    const todosLosDatos = this.formularioService.obtenerDatos();
    console.log('   - materialesViviendaAISI:', todosLosDatos['materialesViviendaAISI']);
    console.log('   - materialesViviendaAISI_B1:', todosLosDatos['materialesViviendaAISI_B1']);
    console.log('6. Datos en this.datos:', this.datos?.materialesViviendaAISI);
    
    if (codigos && codigos.length > 0) {
      console.log('7. Probando llamada al backend...');
      this.materialesService.obtenerMateriales(codigos).subscribe(
        (response: any) => {
          console.log('✅ Respuesta del backend:', response);
          if (response && response.success && response.materiales_construccion) {
            console.log('✅ Datos recibidos:', response.materiales_construccion);
            console.log('   Cantidad de registros:', response.materiales_construccion.length);
          } else {
            console.warn('⚠️ Respuesta sin success o sin data:', response);
          }
        },
        (error: any) => {
          console.error('❌ Error al llamar al backend:', error);
        }
      );
    }
    console.log('=== FIN DEBUG ===');
  }

  private cargarDatosVivienda(): void {
    const codigos = this.groupConfig.getAISICCPPActivos();
    
    if (!codigos || codigos.length === 0) {
      return;
    }

    console.log('[S25] Cargando tipos de vivienda con códigos:', codigos);
    this.viviendaService.obtenerTiposVivienda(codigos).subscribe(
      (response: any) => {
        console.log('[S25] Respuesta tipos vivienda:', response);
        if (response && response.success && response.tipos_vivienda) {
          console.log('[S25] Datos recibidos:', response.tipos_vivienda);
          const viviendas = response.tipos_vivienda.map((item: any) => ({
            categoria: item.tipo_vivienda || '',
            casos: Number(item.casos) || 0,
            porcentaje: '0,00 %'
          }));
          console.log('[S25] Datos procesados:', viviendas);

          const tablaKey = this.getTablaKeyTiposVivienda();
          console.log('[S25] Guardando en tablaKey:', tablaKey);
          this.datos[tablaKey] = viviendas;
          this.formularioService.actualizarDato(tablaKey as any, viviendas);
          this.tableService.calcularPorcentajes(this.datos, { ...this.tiposViviendaConfig, tablaKey });
          console.log('[S25] Datos guardados. Verificando:', this.datos[tablaKey]);
          
          this.cdRef.markForCheck();
          this.cdRef.detectChanges();
        } else {
          console.warn('[S25] Respuesta sin success o sin tipos_vivienda:', response);
        }
      },
      (error: any) => {
        console.error('[S25] Error cargando tipos vivienda:', error);
      }
    );
  }

  private cargarDatosMateriales(): void {
    const codigos = this.groupConfig.getAISICCPPActivos();
    
    if (!codigos || codigos.length === 0) {
      return;
    }

    console.log('[S25] Cargando materiales con códigos:', codigos);
    this.materialesService.obtenerMateriales(codigos).subscribe(
      (response: any) => {
        console.log('[S25] Respuesta materiales:', response);
        if (response && response.success && response.materiales_construccion) {
          console.log('[S25] Datos recibidos:', response.materiales_construccion);
          const materiales = response.materiales_construccion.map((item: any) => ({
            categoria: item.categoria || '',
            tipoMaterial: item.tipo_material || '',
            casos: Number(item.casos) || 0,
            porcentaje: '0,00 %'
          }));
          console.log('[S25] Datos procesados:', materiales);

          const tablaKey = this.getTablaKeyMaterialesVivienda();
          console.log('[S25] Guardando en tablaKey:', tablaKey);
          this.datos[tablaKey] = materiales;
          this.formularioService.actualizarDato(tablaKey as any, materiales);
          this.tableService.calcularPorcentajes(this.datos, { ...this.materialesViviendaConfig, tablaKey });
          console.log('[S25] Datos guardados. Verificando:', this.datos[tablaKey]);
          
          this.cdRef.markForCheck();
          this.cdRef.detectChanges();
        } else {
          console.warn('[S25] Respuesta sin success o sin materiales_construccion:', response);
        }
      },
      (error: any) => {
        console.error('[S25] Error cargando materiales:', error);
      }
    );
  }

  onTiposViviendaFieldChange(index: number, field: string, value: any): void {
    const tablaKey = this.getTablaKeyTiposVivienda();
    const tabla = this.datos[tablaKey] || this.datos.tiposViviendaAISI || [];
    
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      
      if (field === 'casos') {
        const total = tabla.reduce((sum: number, item: any) => {
          const categoria = item.categoria?.toString().toLowerCase() || '';
          if (categoria.includes('total')) return sum;
          const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
          return sum + casos;
        }, 0);
        
        if (total > 0) {
          tabla.forEach((item: any) => {
            const categoria = item.categoria?.toString().toLowerCase() || '';
            if (!categoria.includes('total')) {
              const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
              const porcentaje = ((casos / total) * 100)
                .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                .replace('.', ',') + ' %';
              item.porcentaje = porcentaje;
            }
          });
        }
      }
      
      this.datos[tablaKey] = [...tabla];
      this.formularioService.actualizarDato(tablaKey as any, tabla);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onTiposViviendaTableUpdated(): void {
    const tablaKey = this.getTablaKeyTiposVivienda();
    const tabla = this.datos[tablaKey] || this.datos.tiposViviendaAISI || [];
    this.datos[tablaKey] = [...tabla];
    this.formularioService.actualizarDato(tablaKey as any, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onCondicionOcupacionFieldChange(index: number, field: string, value: any): void {
    const tablaKey = this.getTablaKeyCondicionOcupacion();
    const tabla = this.datos[tablaKey] || this.datos.condicionOcupacionAISI || [];
    
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      
      if (field === 'casos') {
        const total = tabla.reduce((sum: number, item: any) => {
          const categoria = item.categoria?.toString().toLowerCase() || '';
          if (categoria.includes('total')) return sum;
          const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
          return sum + casos;
        }, 0);
        
        if (total > 0) {
          tabla.forEach((item: any) => {
            const categoria = item.categoria?.toString().toLowerCase() || '';
            if (!categoria.includes('total')) {
              const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
              const porcentaje = ((casos / total) * 100)
                .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                .replace('.', ',') + ' %';
              item.porcentaje = porcentaje;
            }
          });
        }
      }
      
      this.datos[tablaKey] = [...tabla];
      this.formularioService.actualizarDato(tablaKey as any, tabla);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onCondicionOcupacionTableUpdated(): void {
    const tablaKey = this.getTablaKeyCondicionOcupacion();
    const tabla = this.datos[tablaKey] || this.datos.condicionOcupacionAISI || [];
    this.datos[tablaKey] = [...tabla];
    this.formularioService.actualizarDato(tablaKey as any, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  private formatearPorcentaje(num: number): string {
    return num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  }

  private obtenerRegExp(pattern: string): RegExp {
    if (!this.regexCache.has(pattern)) {
      this.regexCache.set(pattern, new RegExp(pattern, 'g'));
    }
    return this.regexCache.get(pattern)!;
  }

  private compararValores(actual: any, anterior: any): boolean {
    if (actual === anterior) return true;
    if (actual == null || anterior == null) return actual === anterior;
    if (typeof actual !== typeof anterior) return false;
    if (typeof actual !== 'object') return actual === anterior;
    if (Array.isArray(actual) !== Array.isArray(anterior)) return false;
    if (Array.isArray(actual)) {
      if (actual.length !== anterior.length) return false;
      for (let i = 0; i < actual.length; i++) {
        if (!this.compararValores(actual[i], anterior[i])) return false;
      }
      return true;
    }
    const keysActual = Object.keys(actual);
    const keysAnterior = Object.keys(anterior);
    if (keysActual.length !== keysAnterior.length) return false;
    for (const key of keysActual) {
      if (!keysAnterior.includes(key)) return false;
      if (!this.compararValores(actual[key], anterior[key])) return false;
    }
    return true;
  }

  private clonarValor(valor: any): any {
    if (valor == null || typeof valor !== 'object') return valor;
    if (Array.isArray(valor)) {
      return valor.map(item => this.clonarValor(item));
    }
    const clon: any = {};
    for (const key in valor) {
      if (valor.hasOwnProperty(key)) {
        clon[key] = this.clonarValor(valor[key]);
      }
    }
    return clon;
  }
}

