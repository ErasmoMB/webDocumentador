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
import { PeaActividadesService } from 'src/app/core/services/pea-actividades.service';

@Component({
  selector: 'app-seccion24',
  templateUrl: './seccion24.component.html',
  styleUrls: ['./seccion24.component.css']
})
export class Seccion24Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  private readonly regexCache = new Map<string, RegExp>();
  
  override watchedFields: string[] = ['centroPobladoAISI', 'actividadesEconomicasAISI', 'ciudadOrigenComercio', 'textoIntroActividadesEconomicasAISI', 'textoActividadesEconomicasAISI', 'textoMercadoProductos', 'textoHabitosConsumo'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB13';
  
  fotografiasActividadesEconomicasCache: any[] = [];
  fotografiasMercadoCache: any[] = [];
  fotografiasInstitucionalidadCache: any[] = [];
  
  fotografiasActividadesEconomicasForm: FotoItem[] = [];
  fotografiasMercadoForm: FotoItem[] = [];
  fotografiasHabitosConsumoForm: FotoItem[] = [];

  actividadesEconomicasConfig: TableConfig = {
    tablaKey: 'actividadesEconomicasAISI',
    totalKey: 'actividad',
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
    private peaActividadesService: PeaActividadesService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, null as any, cdRef, autoLoader);
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasCache();
    this.eliminarFilasTotal();
    this.cargarDatosActividadesEconomicas();
    
    setTimeout(() => {
      (window as any).debugCuadro344 = () => this.debugCuadro344();
      console.log('💡 Para depurar el cuadro 3.44 (PEA Ocupada), ejecuta en consola: debugCuadro344()');
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
    return 'seccion24_aisi';
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

  protected override actualizarDatos(): void {
    const datosAnteriores = {
      actividades: this.datos?.['fotografiaActividadesEconomicasImagen'],
      mercado: this.datos?.['fotografiaMercadoImagen']
    };
    
    const datosNuevos = this.formularioService.obtenerDatos();
    this.datos = { ...datosNuevos };
    this.actualizarValoresConPrefijo();
    
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = this.clonarValor((this.datos as any)[campo] || null);
    });
    
    const datosActuales = {
      actividades: this.datos?.['fotografiaActividadesEconomicasImagen'],
      mercado: this.datos?.['fotografiaMercadoImagen']
    };
    
    if (!this.compararValores(datosAnteriores, datosActuales)) {
      this.actualizarFotografiasCache();
      this.cdRef.detectChanges();
    } else {
      this.actualizarFotografiasCache();
    }
  }

  protected override actualizarValoresConPrefijo(): void {
    const centroPobladoAISI = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    this.datos.centroPobladoAISI = centroPobladoAISI || null;
    this.datosAnteriores.centroPobladoAISI = centroPobladoAISI || null;
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getTablaKeyActividadesEconomicas(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `actividadesEconomicasAISI${prefijo}` : 'actividadesEconomicasAISI';
  }

  protected override tieneFotografias(): boolean {
    return true;
  }

  override actualizarFotografiasCache() {
    this.fotografiasActividadesEconomicasCache = this.getFotografiasActividadesEconomicas();
    this.fotografiasMercadoCache = this.getFotografiasMercado();
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
  }

  getFotografiasActividadesEconomicas(): any[] {
    const fotografias = [];
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `fotografiaActividadesEconomicas${i}Titulo`;
      const fuenteKey = `fotografiaActividadesEconomicas${i}Fuente`;
      const imagenKey = `fotografiaActividadesEconomicas${i}Imagen`;
      
      let titulo = this.datos?.[tituloKey];
      let fuente = this.datos?.[fuenteKey];
      let imagen = this.datos?.[imagenKey];
      
      const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
      if (i === 1) {
        titulo = titulo || this.datos?.['fotografiaActividadesEconomicasTitulo'] || 'Parcelas agrícolas en el CP ' + centroPobladoAISI;
        fuente = fuente || this.datos?.['fotografiaActividadesEconomicasFuente'] || 'GEADES, 2024';
        imagen = imagen || this.datos?.['fotografiaActividadesEconomicasImagen'] || '';
      }
      
      if (imagen && typeof imagen === 'string' && imagen.trim() !== '' && (imagen.startsWith('data:image') || imagen.startsWith('blob:'))) {
        fotografias.push({
          numero: `3. ${25 + i}`,
          titulo: titulo || 'Parcelas agrícolas en el CP ' + centroPobladoAISI,
          fuente: fuente || 'GEADES, 2024',
          ruta: imagen
        });
      }
    }
    
    return fotografias;
  }

  getFotografiasActividadesEconomicasParaImageUpload(): FotoItem[] {
    return this.fotografiasActividadesEconomicasCache.map(f => ({
      titulo: f.titulo,
      fuente: f.fuente,
      imagen: f.ruta
    }));
  }

  getFotografiasMercadoParaImageUpload(): FotoItem[] {
    return this.fotografiasMercadoCache.map(f => ({
      titulo: f.titulo,
      fuente: f.fuente,
      imagen: f.ruta
    }));
  }

  getFotografiasMercado(): any[] {
    const fotografias = [];
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `fotografiaMercado${i}Titulo`;
      const fuenteKey = `fotografiaMercado${i}Fuente`;
      const imagenKey = `fotografiaMercado${i}Imagen`;
      
      let titulo = this.datos?.[tituloKey];
      let fuente = this.datos?.[fuenteKey];
      let imagen = this.datos?.[imagenKey];
      
      const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
      if (i === 1) {
        titulo = titulo || this.datos?.['fotografiaMercadoTitulo'] || 'Bodega en el CP ' + centroPobladoAISI;
        fuente = fuente || this.datos?.['fotografiaMercadoFuente'] || 'GEADES, 2024';
        imagen = imagen || this.datos?.['fotografiaMercadoImagen'] || '';
      }
      
      if (imagen && typeof imagen === 'string' && imagen.trim() !== '' && (imagen.startsWith('data:image') || imagen.startsWith('blob:'))) {
        fotografias.push({
          numero: `3. ${35 + i}`,
          titulo: titulo || 'Bodega en el CP ' + centroPobladoAISI,
          fuente: fuente || 'GEADES, 2024',
          ruta: imagen
        });
      }
    }
    
    return fotografias;
  }

  getPorcentajeAgricultura(): string {
    const tablaKey = this.getTablaKeyActividadesEconomicas();
    const tabla = this.datos[tablaKey] || this.datos?.actividadesEconomicasAISI || [];
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const item = tabla.find((item: any) => 
      item.actividad && item.actividad.toLowerCase().includes('agricultura')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeAdministracion(): string {
    const tablaKey = this.getTablaKeyActividadesEconomicas();
    const tabla = this.datos[tablaKey] || this.datos?.actividadesEconomicasAISI || [];
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const item = tabla.find((item: any) => 
      item.actividad && item.actividad.toLowerCase().includes('administración')
    );
    return item?.porcentaje || '____';
  }

  getFotoActividadesEconomicas(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaActividadesEconomicasTitulo'] || 'Actividades económicas en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaActividadesEconomicasFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaActividadesEconomicasImagen'] || '';
    
    return {
      numero: '3. 26',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoMercado(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaMercadoTitulo'] || 'Comercio en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaMercadoFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaMercadoImagen'] || '';
    
    return {
      numero: '3. 27',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
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
    
    this.fotografiasActividadesEconomicasForm = this.imageService.loadImages(
      '3.1.4.B.1.3',
      'fotografiaActividadesEconomicas',
      groupPrefix
    );
    
    this.fotografiasMercadoForm = this.imageService.loadImages(
      '3.1.4.B.1.3',
      'fotografiaMercado',
      groupPrefix
    );
    
    this.fotografiasHabitosConsumoForm = this.imageService.loadImages(
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
    this.fotografiasHabitosConsumoForm = [...fotografias];
  }

  onFotografiasActividadesEconomicasChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix('3.1.4.B.1.3');
    this.imageService.saveImages('3.1.4.B.1.3', 'fotografiaActividadesEconomicas', fotografias, groupPrefix);
    this.fotografiasActividadesEconomicasForm = [...fotografias];
    this.actualizarDatos();
    this.cdRef.markForCheck();
  }

  onFotografiasMercadoChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix('3.1.4.B.1.3');
    this.imageService.saveImages('3.1.4.B.1.3', 'fotografiaMercado', fotografias, groupPrefix);
    this.fotografiasMercadoForm = [...fotografias];
    this.actualizarDatos();
    this.cdRef.markForCheck();
  }

  obtenerTextoIntroActividadesEconomicasAISI(): string {
    if (this.datos.textoIntroActividadesEconomicasAISI && this.datos.textoIntroActividadesEconomicasAISI !== '____') {
      return this.datos.textoIntroActividadesEconomicasAISI;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    
    return `Las actividades económicas de la población son un reflejo de los patrones de producción, consumo y empleo en una localidad o jurisdicción determinada. En este ítem, se describirá la estructura y la diversidad de las actividades económicas en la capital distrital de ${distrito}, que forma parte del AISI.\n\nA partir de fuentes oficiales, se exploran las principales fuentes de ingresos y los sectores productivos más relevantes dentro del CP ${centroPoblado} (capital distrital). En esta ocasión, se recurre a los datos provistos por los Censos Nacionales 2017.`;
  }

  obtenerTextoActividadesEconomicasAISI(): string {
    if (this.datos.textoActividadesEconomicasAISI && this.datos.textoActividadesEconomicasAISI !== '____') {
      return this.datos.textoActividadesEconomicasAISI;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const porcentajeAgricultura = this.getPorcentajeAgricultura();
    const porcentajeAdministracion = this.getPorcentajeAdministracion();
    
    return `Del cuadro anterior, se aprecia que la actividad económica más frecuente dentro del CP ${centroPoblado} es el grupo "Agricultura, ganadería, silvicultura y pesca" con un ${porcentajeAgricultura}. Esto se condice con las entrevistas aplicadas en campo, pues los informantes y autoridades declararon que la mayoría de la población se dedica principalmente a la agricultura y a la ganadería. La segunda actividad más frecuente dentro de esta localidad es la de "Administración pública y defensa; planes de seguridad social de afiliación obligatoria" con ${porcentajeAdministracion}.`;
  }

  obtenerTextoMercadoProductos(): string {
    if (this.datos.textoMercadoProductos && this.datos.textoMercadoProductos !== '____') {
      return this.datos.textoMercadoProductos;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const ciudadOrigen = this.datos.ciudadOrigenComercio || 'Caravelí';
    
    return `El CP ${centroPoblado} no cuenta con un mercado formal que centralice las actividades comerciales de la localidad. El comercio en este lugar es incipiente y se lleva a cabo principalmente a través de pequeñas bodegas. Estas bodegas atienden la demanda cotidiana en la localidad, pero la oferta sigue siendo limitada y gran parte de los productos llega desde ${ciudadOrigen}.\n\nAdemás, la comercialización de productos en ${distrito} se complementa con la presencia de comerciantes mayoristas que viajan hacia la localidad para comprar y vender productos. La mayoría de estos comerciantes provienen de la ciudad de ${ciudadOrigen}, desde donde abastecen las bodegas locales con mercancías diversas. Este sistema de intermediación permite que los pobladores de ${centroPoblado} accedan a una variedad más amplia de productos, aunque la oferta sigue siendo limitada en comparación con las zonas urbanas más grandes. La falta de un mercado formal y de una infraestructura de comercio mayor limita el desarrollo del intercambio comercial en la localidad, pero el dinamismo de las pequeñas bodegas y la llegada de comerciantes externos contribuyen a mantener un flujo de productos que satisface las necesidades básicas de la población.`;
  }

  obtenerTextoHabitosConsumo(): string {
    if (this.datos.textoHabitosConsumo && this.datos.textoHabitosConsumo !== '____') {
      return this.datos.textoHabitosConsumo;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const ciudadOrigen = this.datos.ciudadOrigenComercio || 'Caravelí';
    
    return `En la capital distrital de ${distrito}, los hábitos de consumo están basados principalmente en alimentos tradicionales y accesibles dentro de la comunidad. Los productos más consumidos incluyen tubérculos (como papa y oca) y verduras, los cuales son esenciales en la dieta diaria de los hogares. Estos productos se adquieren tanto a través de la producción local, como es el caso de la papa y la oca, como de compras a pequeños comerciantes que llegan a la capital distrital desde ${ciudadOrigen}. La papa, por ser uno de los cultivos más abundantes en la zona, tiene un rol fundamental en la alimentación, acompañando la mayoría de las comidas junto a otros carbohidratos.\n\nEn cuanto al consumo de proteínas, los habitantes del pueblo suelen recurrir a la carne de animales menores como las gallinas y los cuyes, así como de vacuno, los cuales son criados en sus propias viviendas. Estas carnes son un complemento importante en la dieta y una fuente de nutrientes esenciales, especialmente en eventos familiares o festividades. Si bien se consumen otros tipos de carne en menor proporción, como ovino, estas son generalmente reservadas para ocasiones especiales. Los hábitos de consumo en esta localidad reflejan una combinación de autosuficiencia en algunos alimentos, y la dependencia de productos traídos por comerciantes para completar la dieta diaria.\n\nPor otra parte, cabe mencionar que en el CP ${centroPoblado} se preparan diversos platos tradicionales, comúnmente durante las festividades o en ocasiones especiales. Entre ellos destacan el cuy chactado, el picante de cuy, sopa de morón con charqui, picante de quinua, mazamorra de quinua y chicha de cebada.`;
  }

  getActividadesEconomicasSinTotal(): any[] {
    const tablaKey = this.getTablaKeyActividadesEconomicas();
    const tabla = this.datos[tablaKey] || this.datos?.actividadesEconomicasAISI || [];
    console.log('[S24] getActividadesEconomicasSinTotal - tablaKey:', tablaKey, 'datos:', tabla);
    if (!tabla || !Array.isArray(tabla)) {
      console.log('[S24] No hay datos o no es array');
      return [];
    }
    const filtered = tabla.filter((item: any) => {
      const actividad = item.actividad?.toString().toLowerCase() || '';
      return !actividad.includes('total');
    });
    console.log('[S24] Filtrado:', filtered);
    return filtered;
  }

  getTotalActividadesEconomicas(): string {
    const filtered = this.getActividadesEconomicasSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  private eliminarFilasTotal(): void {
    const tablaKey = this.getTablaKeyActividadesEconomicas();
    const tabla = this.datos[tablaKey] || this.datos['actividadesEconomicasAISI'];
    if (tabla && Array.isArray(tabla)) {
      const longitudOriginal = tabla.length;
      const filtered = tabla.filter((item: any) => {
        const actividad = item.actividad?.toString().toLowerCase() || '';
        return !actividad.includes('total');
      });
      if (filtered.length !== longitudOriginal) {
        this.datos[tablaKey] = filtered;
        this.datos['actividadesEconomicasAISI'] = filtered;
        this.formularioService.actualizarDato(tablaKey as any, filtered);
        this.cdRef.detectChanges();
      }
    }
  }

  debugCuadro344(): void {
    console.log('=== DEBUG CUADRO 3.44 - PEA OCUPADA SEGÚN ACTIVIDAD ECONÓMICA ===');
    const codigos = this.groupConfig.getAISICCPPActivos();
    console.log('1. Códigos UBIGEO activos:', codigos);
    console.log('2. Sección ID:', this.seccionId);
    console.log('3. Prefijo grupo:', this.obtenerPrefijoGrupo());
    console.log('4. Tabla key esperada:', this.getTablaKeyActividadesEconomicas());
    console.log('5. Datos actuales en formularioService:');
    const todosLosDatos = this.formularioService.obtenerDatos();
    console.log('   - actividadesEconomicasAISI:', todosLosDatos['actividadesEconomicasAISI']);
    console.log('   - actividadesEconomicasAISI_B1:', todosLosDatos['actividadesEconomicasAISI_B1']);
    console.log('   - actividadesEconomicasAISI_B2:', todosLosDatos['actividadesEconomicasAISI_B2']);
    console.log('6. Datos en this.datos:');
    console.log('   - actividadesEconomicasAISI:', this.datos?.actividadesEconomicasAISI);
    console.log('   - actividadesEconomicasAISI_B1:', this.datos?.['actividadesEconomicasAISI_B1']);
    console.log('   - actividadesEconomicasAISI_B2:', this.datos?.['actividadesEconomicasAISI_B2']);
    
    if (codigos && codigos.length > 0) {
      console.log('7. Probando llamada al backend...');
      this.peaActividadesService.obtenerActividadesOcupadas(codigos).subscribe(
        (response: any) => {
          console.log('✅ Respuesta del backend:', response);
          if (response && response.success && response.actividades_economicas) {
            console.log('✅ Datos recibidos:', response.actividades_economicas);
            console.log('   Cantidad de registros:', response.actividades_economicas.length);
            if (response.actividades_economicas.length > 0) {
              console.log('   Primeros 20 registros:', response.actividades_economicas.slice(0, 20));
            }
          } else {
            console.warn('⚠️ Respuesta sin success o sin actividades_economicas:', response);
          }
        },
        (error: any) => {
          console.error('❌ Error al llamar al backend:', error);
        }
      );
    } else {
      console.warn('⚠️ No hay códigos UBIGEO para probar');
    }
    console.log('=== FIN DEBUG ===');
  }

  private cargarDatosActividadesEconomicas(): void {
    const codigos = this.groupConfig.getAISICCPPActivos();
    
    if (!codigos || codigos.length === 0) {
      return;
    }

    console.log('[S24] Cargando actividades económicas con códigos:', codigos);
    this.peaActividadesService.obtenerActividadesOcupadas(codigos).subscribe(
      (response: any) => {
        console.log('[S24] Respuesta completa:', response);
        if (response && response.success && response.actividades_economicas) {
          console.log('[S24] Datos recibidos (primeros 5):', response.actividades_economicas.slice(0, 5));
          console.log('[S24] Estructura del primer item:', response.actividades_economicas[0]);
          const actividades = response.actividades_economicas.map((item: any, index: number) => {
            const actividad = item.actividad || item.nombre || item.categoria || '';
            console.log(`[S24] Item ${index}: actividad='${actividad}', casos=${item.casos}, porcentaje=${item.porcentaje}`);
            return {
              actividad: actividad,
              casos: Number(item.casos) || 0,
              porcentaje: item.porcentaje ? `${item.porcentaje.toFixed(2).replace('.', ',')} %` : '0,00 %'
            };
          });
          console.log('[S24] Datos procesados (primeros 5):', actividades.slice(0, 5));

          const tablaKey = this.getTablaKeyActividadesEconomicas();
          console.log('[S24] Guardando en tablaKey:', tablaKey);
          this.datos[tablaKey] = actividades;
          this.datos['actividadesEconomicasAISI'] = actividades;
          this.formularioService.actualizarDato(tablaKey as any, actividades);
          this.tableService.calcularPorcentajes(this.datos, { ...this.actividadesEconomicasConfig, tablaKey });
          console.log('[S24] Datos guardados. Verificando:', this.datos[tablaKey]);

          this.cdRef.markForCheck();
          this.cdRef.detectChanges();
        } else {
          console.warn('[S24] Respuesta sin success o sin actividades_economicas:', response);
        }
      },
      (error: any) => {
        console.error('[S24] Error cargando actividades económicas:', error);
      }
    );
  }

  private formatearPorcentaje(valor: number | string): string {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(num)) return '0,00 %';
    return num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  }

  onActividadesEconomicasFieldChange(index: number, field: string, value: any): void {
    const tablaKey = this.getTablaKeyActividadesEconomicas();
    const tabla = this.datos[tablaKey] || this.datos.actividadesEconomicasAISI || [];
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      
      if (field === 'casos') {
        const total = tabla.reduce((sum: number, item: any) => {
          const actividad = item.actividad?.toString().toLowerCase() || '';
          if (actividad.includes('total')) return sum;
          const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
          return sum + casos;
        }, 0);
        
        if (total > 0) {
          tabla.forEach((item: any) => {
            const actividad = item.actividad?.toString().toLowerCase() || '';
            if (!actividad.includes('total')) {
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
      this.datos.actividadesEconomicasAISI = [...tabla];
      this.formularioService.actualizarDato(tablaKey as any, tabla);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onActividadesEconomicasTableUpdated(): void {
    const tablaKey = this.getTablaKeyActividadesEconomicas();
    const tabla = this.datos[tablaKey] || this.datos.actividadesEconomicasAISI || [];
    this.datos[tablaKey] = [...tabla];
    this.datos.actividadesEconomicasAISI = [...tabla];
    this.formularioService.actualizarDato(tablaKey as any, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
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
