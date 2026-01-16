import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion8',
  templateUrl: './seccion8.component.html',
  styleUrls: ['./seccion8.component.css']
})
export class Seccion8Component extends BaseSectionComponent implements OnDestroy {
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
  
  override readonly PHOTO_PREFIX = '';

  peaOcupacionesConfig: TableConfig = {
    tablaKey: 'peaOcupacionesTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0%' }],
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
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    private tableService: TableManagementService,
    private stateService: StateService,
    private sanitizer: DomSanitizer
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
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
      
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        if (campo === 'peaOcupacionesTabla') {
          const prefijo = this.obtenerPrefijoGrupo();
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
        this.formularioService.actualizarDato(tablaKey, datosFiltrados);
      }
    }
  }

  getPEAOcupacionesSinTotal(): any[] {
    const tabla = this.getTablaPEAOcupaciones();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalPEAOcupaciones(): string {
    const datosSinTotal = this.getPEAOcupacionesSinTotal();
    if (datosSinTotal.length === 0) return '0';
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
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
    const tabla = this.getTablaPEAOcupaciones();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    
    const sinTotal = tabla.filter((item: any) => 
      item.categoria && 
      item.categoria.toLowerCase() !== 'total' &&
      item.casos !== undefined &&
      item.casos > 0
    );
    
    sinTotal.sort((a: any, b: any) => {
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

  onPEAOcupacionesTableUpdated() {
    this.eliminarFilasTotal();
    const tablaKey = this.getTablaKeyPEAOcupaciones();
    const tabla = this.getTablaPEAOcupaciones();
    this.formularioService.actualizarDato(tablaKey, tabla);
    this.actualizarDatos();
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
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
        this.fotografiasGanaderiaCache = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_GANADERIA, groupPrefix) || [];
        this.fotografiasAgriculturaCache = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_AGRICULTURA, groupPrefix) || [];
        this.fotografiasComercioCache = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_COMERCIO, groupPrefix) || [];
        this.cdRef.detectChanges();
      });
    }
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
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
    const provincia = this.datos.provinciaSeleccionada || 'Caravelí';
    
    return `En la CC ${grupoAISD}, la ganadería es la actividad económica predominante, con un 80 % de la producción destinada al autoconsumo familiar y un 20 % a la venta, según los entrevistados. Las principales especies que se crían son los vacunos y los ovinos, aunque también se crían caprinos y animales menores como gallinas y cuyes. El precio del ganado en pie varía dependiendo de la especie: los vacunos se venden entre S/. 1 200 y S/. 1 500, los ovinos entre S/. 180 y S/. 200, las gallinas entre S/. 20 y S/. 30, y los cuyes entre S/. 25 y S/. 30.\n\nLa alimentación del ganado se basa principalmente en pasto natural, aunque también se les proporciona pasto cultivable en las temporadas de escasez. Uno de los productos derivados más importantes es el queso, el cual se destina particularmente a la capital provincial de ${provincia} para la venta; también se elabora yogurt, aunque en menor medida.\n\nA pesar de la importancia de esta actividad para la economía local, la ganadería enfrenta diversas problemáticas. Entre las principales están la falta de especialistas en salud veterinaria, así como los desafíos climáticos, especialmente las heladas, que pueden reducir la disponibilidad de pastos y generar pérdidas en los rebaños. Estas dificultades impactan directamente en la productividad y los ingresos de los comuneros ganaderos.`;
  }

  obtenerTextoSeccion8GanaderiaCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion8GanaderiaCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const provincia = this.datos.provinciaSeleccionada || 'Caravelí';
    
    let textoConResaltado = texto
      .replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(new RegExp(this.escapeRegex(provincia), 'g'), `<span class="data-section">${this.escapeHtml(provincia)}</span>`);
    
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
      new RegExp(this.escapeRegex(grupoAISD), 'g'),
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
          new RegExp(this.escapeRegex(ocupacion.categoria), 'g'), 
          `<span class="data-backend">${this.escapeHtml(ocupacion.categoria)}</span>`
        );
      }
      if (ocupacion.porcentaje && ocupacion.porcentaje !== '____') {
        textoConResaltado = textoConResaltado.replace(
          new RegExp(this.escapeRegex(ocupacion.porcentaje), 'g'), 
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
      new RegExp(this.escapeRegex(grupoAISD), 'g'),
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
      new RegExp(this.escapeRegex(grupoAISD), 'g'),
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
      new RegExp(this.escapeRegex(grupoAISD), 'g'),
      `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`
    );
    
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

