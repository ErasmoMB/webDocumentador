import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { SECCION8_TEMPLATES, SECCION8_WATCHED_FIELDS } from './seccion8-constants';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CoreSharedModule,
    ImageUploadComponent
  ],
  selector: 'app-seccion8-view',
  templateUrl: './seccion8-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host ::ng-deep .data-manual.has-data,
    :host ::ng-deep .data-section.has-data {
      background-color: transparent !important;
      padding: 0 !important;
      border-radius: 0 !important;
      font-weight: normal !important;
      color: inherit !important;
    }
  `]
})
export class Seccion8ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.4';
  @Input() override modoFormulario: boolean = false;
  
  // ✅ Hacer TEMPLATES accesible en templates
  readonly SECCION8_TEMPLATES = SECCION8_TEMPLATES;
  
  override readonly PHOTO_PREFIX = '';
  override watchedFields: string[] = SECCION8_WATCHED_FIELDS;

  readonly PHOTO_PREFIX_GANADERIA = 'fotografiaGanaderia';
  readonly PHOTO_PREFIX_AGRICULTURA = 'fotografiaAgricultura';
  readonly PHOTO_PREFIX_COMERCIO = 'fotografiaComercio';
  
  fotografiasGanaderiaCache: FotoItem[] = [];
  fotografiasAgriculturaCache: FotoItem[] = [];
  fotografiasComercioCache: FotoItem[] = [];

  private readonly regexCache = new Map<string, RegExp>();

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly peaOcupacionesSignal: Signal<any[]> = computed(() => {
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `peaOcupacionesTabla${prefijo}` : 'peaOcupacionesTabla';
    return Array.isArray(formData[tablaKey]) ? formData[tablaKey] : [];
  });

  readonly poblacionPecuariaSignal: Signal<any[]> = computed(() => {
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `poblacionPecuariaTabla${prefijo}` : 'poblacionPecuariaTabla';
    return Array.isArray(formData[tablaKey]) ? formData[tablaKey] : [];
  });

  readonly caracteristicasAgriculturaSignal: Signal<any[]> = computed(() => {
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `caracteristicasAgriculturaTabla${prefijo}` : 'caracteristicasAgriculturaTabla';
    return Array.isArray(formData[tablaKey]) ? formData[tablaKey] : [];
  });

  readonly peaOcupacionesConPorcentajesSignal: Signal<any[]> = computed(() => {
    const tablaPEA = this.peaOcupacionesSignal();
    if (!tablaPEA || !Array.isArray(tablaPEA) || tablaPEA.length === 0) {
      return [];
    }

    // ✅ EXCLUIR FILA TOTAL DEL CÁLCULO (buscar por categoria)
    const filasNormales = tablaPEA.filter((item: any) => {
      const cat = (item.categoria || '').toString().toLowerCase();
      return !cat.includes('total');
    });

    const total = filasNormales.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      return tablaPEA.map((item: any) => ({ ...item, porcentaje: '0,00 %' }));
    }

    const tablaConPorcentajes = tablaPEA.map((item: any) => {
      const cat = (item.categoria || '').toString().toLowerCase();
      
      // Si es fila Total, usar 100%
      if (cat.includes('total')) {
        return {
          ...item,
          casos: total,  // ✅ Mostrar el total calculado
          porcentaje: '100,00 %'
        };
      }

      // Para filas normales, calcular porcentaje
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      return {
        ...item,
        casos,
        porcentaje: porcentajeFormateado
      };
    });

    return tablaConPorcentajes;
  });

  // ✅ PATRÓN UNICA_VERDAD: fotosCacheSignal Signal para monitorear cambios de imágenes
  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `${this.PHOTO_PREFIX_GANADERIA}${i}Titulo${prefijo}`;
      const fuenteKey = `${this.PHOTO_PREFIX_GANADERIA}${i}Fuente${prefijo}`;
      const imagenKey = `${this.PHOTO_PREFIX_GANADERIA}${i}Imagen${prefijo}`;
      
      const titulo = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, imagenKey)();
      
      if (imagen) {
        fotos.push({
          titulo: titulo || `Fotografía ${i}`,
          fuente: fuente || 'GEADES, 2024',
          imagen: imagen
        } as FotoItem);
      }
    }
    return fotos;
  });

  // ✅ NUEVO: Signal para ubicación global (desde metadata)
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);

    effect(() => {
      this.formDataSignal();
      this.peaOcupacionesSignal();
      this.peaOcupacionesConPorcentajesSignal();
      this.poblacionPecuariaSignal();
      this.caracteristicasAgriculturaSignal();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.fotosCacheSignal();
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

  protected override actualizarValoresConPrefijo(): void {
  }

  override cargarFotografias(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const maxFotos = 10;
    
    // ✅ Cargar Ganadería desde estado (projectFacade) primero
    const fotosGanaderia: FotoItem[] = [];
    for (let i = 1; i <= maxFotos; i++) {
      const tituloKey = `${this.PHOTO_PREFIX_GANADERIA}${i}Titulo${prefijo}`;
      const fuenteKey = `${this.PHOTO_PREFIX_GANADERIA}${i}Fuente${prefijo}`;
      const imagenKey = `${this.PHOTO_PREFIX_GANADERIA}${i}Imagen${prefijo}`;
      
      const titulo = this.datos[tituloKey] || '';
      const fuente = this.datos[fuenteKey] || '';
      const imagen = this.datos[imagenKey] || '';
      
      if (titulo || fuente || imagen) {
        fotosGanaderia.push({ titulo, fuente, imagen });
      }
    }
    
    // Fallback a imageService si no hay datos en estado
    if (fotosGanaderia.length === 0) {
      const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
      this.fotografiasGanaderiaCache = this.imageService.loadImages(
        this.seccionId,
        this.PHOTO_PREFIX_GANADERIA,
        groupPrefix
      ) || [];
    } else {
      this.fotografiasGanaderiaCache = fotosGanaderia;
    }
    
    // ✅ Cargar Agricultura desde estado (projectFacade) primero
    const fotosAgricultura: FotoItem[] = [];
    for (let i = 1; i <= maxFotos; i++) {
      const tituloKey = `${this.PHOTO_PREFIX_AGRICULTURA}${i}Titulo${prefijo}`;
      const fuenteKey = `${this.PHOTO_PREFIX_AGRICULTURA}${i}Fuente${prefijo}`;
      const imagenKey = `${this.PHOTO_PREFIX_AGRICULTURA}${i}Imagen${prefijo}`;
      
      const titulo = this.datos[tituloKey] || '';
      const fuente = this.datos[fuenteKey] || '';
      const imagen = this.datos[imagenKey] || '';
      
      if (titulo || fuente || imagen) {
        fotosAgricultura.push({ titulo, fuente, imagen });
      }
    }
    
    // Fallback a imageService si no hay datos en estado
    if (fotosAgricultura.length === 0) {
      const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
      this.fotografiasAgriculturaCache = this.imageService.loadImages(
        this.seccionId,
        this.PHOTO_PREFIX_AGRICULTURA,
        groupPrefix
      ) || [];
    } else {
      this.fotografiasAgriculturaCache = fotosAgricultura;
    }
    
    // ✅ Cargar Comercio desde estado (projectFacade) primero
    const fotosComercio: FotoItem[] = [];
    for (let i = 1; i <= maxFotos; i++) {
      const tituloKey = `${this.PHOTO_PREFIX_COMERCIO}${i}Titulo${prefijo}`;
      const fuenteKey = `${this.PHOTO_PREFIX_COMERCIO}${i}Fuente${prefijo}`;
      const imagenKey = `${this.PHOTO_PREFIX_COMERCIO}${i}Imagen${prefijo}`;
      
      const titulo = this.datos[tituloKey] || '';
      const fuente = this.datos[fuenteKey] || '';
      const imagen = this.datos[imagenKey] || '';
      
      if (titulo || fuente || imagen) {
        fotosComercio.push({ titulo, fuente, imagen });
      }
    }
    
    // Fallback a imageService si no hay datos en estado
    if (fotosComercio.length === 0) {
      const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
      this.fotografiasComercioCache = this.imageService.loadImages(
        this.seccionId,
        this.PHOTO_PREFIX_COMERCIO,
        groupPrefix
      ) || [];
    } else {
      this.fotografiasComercioCache = fotosComercio;
    }
    
    this.cdRef.markForCheck();
  }

  getPEAOcupacionesConPorcentajes(): any[] {
    return this.peaOcupacionesConPorcentajesSignal();
  }

  private obtenerValorCampo(baseField: string): any {
    const formData = this.formDataSignal();
    const prefijo = this.obtenerPrefijoGrupo();
    const claveConPrefijo = `${baseField}${prefijo}`;
    return formData[claveConPrefijo] ?? formData[baseField];
  }

  obtenerTextoActividadesEconomicas(): string {
    const manual = this.obtenerValorCampo('textoActividadesEconomicas');
    if (manual && manual !== '____') {
      return manual;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `Las actividades económicas de la población son un reflejo de los patrones de producción, consumo y empleo en una localidad o jurisdicción determinada. En este ítem, se describe las ocupaciones principales existentes en los poblados de la CC ${grupoAISD}, que forma parte del AISD.`;
  }

  obtenerTextoFuentesActividadesEconomicas(): string {
    const manual = this.obtenerValorCampo('textoFuentesActividadesEconomicas');
    if (manual && manual !== '____') {
      return manual;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `A partir de fuentes oficiales, se exploran las principales labores y ocupaciones más relevantes dentro de la CC ${grupoAISD}. En esta ocasión, se recurre a los datos provistos por la Plataforma Nacional de Datos Georreferenciados – Geo Perú.`;
  }

  obtenerTituloPEA(): string {
    const titulo = this.obtenerValorCampo('cuadroTituloPEA') || 'PEA Ocupada según ocupaciones principales';
    const comunidad = this.obtenerNombreComunidadActual();
    return `${titulo} – CC ${comunidad} (2017)`;
  }

  obtenerFuentePEA(): string {
    return this.obtenerValorCampo('cuadroFuentePEA') || 'Plataforma Nacional de Datos Georreferenciados – Geo Perú';
  }

  obtenerFuentePoblacionPecuaria(): string {
    return this.obtenerValorCampo('cuadroFuentePoblacionPecuaria') || 'GEADES (2024)';
  }

  obtenerFuenteCaracteristicasAgricultura(): string {
    return this.obtenerValorCampo('cuadroFuenteCaracteristicasAgricultura') || 'GEADES (2024)';
  }

  obtenerTituloGanaderia(): string {
    const formData = this.formDataSignal();
    const prefijo = this.obtenerPrefijoGrupo();
    
    // ✅ Buscar CON prefijo primero (forma de guardar del formulario)
    const claveConPrefijo = `cuadroTituloPoblacionPecuaria${prefijo}`;
    const titulo = formData[claveConPrefijo] || formData['cuadroTituloPoblacionPecuaria'] || 'Población Pecuaria';
    const comunidad = this.obtenerNombreComunidadActual();
    return `${titulo} – CC ${comunidad}`;
  }

  obtenerTituloAgricultura(): string {
    const formData = this.formDataSignal();
    const prefijo = this.obtenerPrefijoGrupo();
    
    // ✅ Buscar CON prefijo primero (forma de guardar del formulario)
    const claveConPrefijo = `cuadroTituloCaracteristicasAgricultura${prefijo}`;
    const titulo = formData[claveConPrefijo] || formData['cuadroTituloCaracteristicasAgricultura'] || 'Características de la Agricultura';
    const comunidad = this.obtenerNombreComunidadActual();
    return `${titulo} – CC ${comunidad}`;
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
    const manual = this.obtenerValorCampo('textoAnalisisCuadro310');
    // ✅ Si el usuario editó manualmente, usar ESO (no regenerar)
    if (manual && manual !== '____' && manual.trim().length > 0) {
      return manual;
    }
    
    // Solo si está vacío, generar por defecto
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
    return this.sanitizer.sanitize(1, texto) as SafeHtml;
  }

  obtenerTextoSeccion8GanaderiaCompleto(): string {
    const formData = this.formDataSignal();
    const prefijo = this.obtenerPrefijoGrupo();
    
    // ✅ Buscar CON prefijo primero (forma de guardar del formulario)
    const claveConPrefijo = `parrafoSeccion8_ganaderia_completo${prefijo}`;
    if (formData[claveConPrefijo]) {
      return formData[claveConPrefijo];
    }
    
    // Fallback sin prefijo para compatibilidad
    if (formData['parrafoSeccion8_ganaderia_completo']) {
      return formData['parrafoSeccion8_ganaderia_completo'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    // ✅ REFACTOR: Usar ubicacionGlobal en lugar de formData
    const provincia = this.ubicacionGlobal().provincia || '____';
    
    return `En la CC ${grupoAISD}, la ganadería es la actividad económica predominante, con un 80 % de la producción destinada al autoconsumo familiar y un 20 % a la venta, según los entrevistados. Las principales especies que se crían son los vacunos y los ovinos, aunque también se crían caprinos y animales menores como gallinas y cuyes. El precio del ganado en pie varía dependiendo de la especie: los vacunos se venden entre S/. 1 200 y S/. 1 500, los ovinos entre S/. 180 y S/. 200, les gallinas entre S/. 20 y S/. 30, y los cuyes entre S/. 25 y S/. 30.\n\nLa alimentación del ganado se basa principalmente en pasto natural, aunque también se les proporciona pasto cultivable en las temporadas de escasez. Uno de los productos derivados más importantes es el queso, el cual se destina particularmente a la capital provincial de ${provincia} para la venta; también se elabora yogurt, aunque en menor medida.\n\nA pesar de la importancia de esta actividad para la economía local, la ganadería enfrenta diversas problemáticas. Entre las principales están la falta de especialistas en salud veterinaria, así como los desafíos climáticos, especialmente las heladas, que pueden reducir la disponibilidad de pastos y generar pérdidas en los rebaños. Estas dificultades impactan directamente en la productividad y los ingresos de los comuneros ganaderos.`;
  }

  obtenerTextoSeccion8GanaderiaCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion8GanaderiaCompleto();
    const parrafos = texto.split(/\n\n+/);
    const html = parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
    return this.sanitizer.sanitize(1, html) as SafeHtml;
  }

  obtenerTextoSeccion8AgriculturaCompleto(): string {
    const formData = this.formDataSignal();
    const prefijo = this.obtenerPrefijoGrupo();
    
    // ✅ Buscar CON prefijo primero (forma de guardar del formulario)
    const claveConPrefijo = `parrafoSeccion8_agricultura_completo${prefijo}`;
    if (formData[claveConPrefijo]) {
      return formData[claveConPrefijo];
    }
    
    // Fallback sin prefijo para compatibilidad
    if (formData['parrafoSeccion8_agricultura_completo']) {
      return formData['parrafoSeccion8_agricultura_completo'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `En la CC ${grupoAISD}, la agricultura desempeña un papel complementario a la ganadería, y la mayor parte de la producción, cerca de un 95 % según los entrevistados, se destina al autoconsumo, mientras que solo un 5 % se comercializa. Los principales cultivos son la papa, habas, cebada y forraje (como avena y alfalfa), los cuales son esenciales para la dieta de las familias comuneras y en menor medida para la alimentación del ganado. Estos productos se cultivan en pequeñas parcelas, con cada familia disponiendo de un promedio de 1 ½ hectárea de tierra.\n\nEl sistema de riego utilizado en la comunidad es principalmente por gravedad, aprovechando las fuentes de agua disponibles en la zona. Sin embargo, la actividad agrícola enfrenta serios desafíos, como las heladas, que dañan los cultivos durante las temporadas frías, y las sequías, que disminuyen la disponibilidad de agua, afectando la capacidad productiva de las familias. Adicionalmente, se enfrentan plagas y enfermedades como roedores y el gusano blanco. Estas problemáticas, recurrentes en el ciclo agrícola, limitan tanto la cantidad como la calidad de los productos cosechados.`;
  }

  obtenerTextoSeccion8AgriculturaCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion8AgriculturaCompleto();
    const parrafos = texto.split(/\n\n+/);
    const html = parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
    return this.sanitizer.sanitize(1, html) as SafeHtml;
  }

  obtenerTextoMercadoComercializacion1(): string {
    const manual = this.obtenerValorCampo('textoMercadoComercializacion1');
    if (manual && manual !== '____') {
      return manual;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `Dentro de la CC ${grupoAISD} no existe un mercado local donde se puedan comercializar los productos agrícolas o ganaderos directamente. Toda la venta de estos productos se realiza a través de intermediarios que visitan la comunidad en busca de animales en pie o productos como el queso. Estos intermediarios suelen establecer los precios de compra, lo que limita la capacidad de los comuneros para negociar y obtener un valor justo por su producción.`;
  }

  obtenerTextoMercadoComercializacion1ConResaltado(): SafeHtml {
    const texto = this.obtenerTextoMercadoComercializacion1();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    // ✅ Sin resaltado amarillo - solo texto plano
    const textoConResaltado = texto.replace(
      this.obtenerRegExp(this.escapeRegex(grupoAISD)),
      `<span>${this.escapeHtml(grupoAISD)}</span>`
    );
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoMercadoComercializacion2(): string {
    const manual = this.obtenerValorCampo('textoMercadoComercializacion2');
    if (manual && manual !== '____') {
      return manual;
    }
    
    return `Esta dependencia de los intermediarios presenta diversas dificultades. Por un lado, los comuneros reciben precios más bajos en comparación con los que podrían obtener si tuvieran acceso directo a mercados más grandes o si contaran con un punto de venta dentro de la comunidad. Además, el transporte de los productos fuera de la comunidad aumenta los costos logísticos, afectando la rentabilidad de las actividades económicas. Este sistema de comercialización se traduce en una vulnerabilidad económica para las familias, ya que dependen de las condiciones impuestas por terceros para la venta de sus bienes.`;
  }

  obtenerTextoMercadoComercializacion2ConResaltado(): SafeHtml {
    const texto = this.obtenerTextoMercadoComercializacion2();
    return this.sanitizer.sanitize(1, texto) as SafeHtml;
  }

  obtenerTextoHabitosConsumo1(): string {
    const manual = this.obtenerValorCampo('textoHabitosConsumo1');
    if (manual && manual !== '____') {
      return manual;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `En la CC ${grupoAISD}, los hábitos de consumo se caracterizan por una dieta basada principalmente en productos que se adquieren de comerciantes que visitan la comunidad periódicamente (quincenalmente, en promedio), así como en pequeñas bodegas locales. Entre los alimentos más consumidos destacan los abarrotes como el arroz, maíz y fideos, que forman parte esencial de la alimentación diaria de las familias. Estos productos son complementados con la producción local de papa y habas, que también son alimentos fundamentales en la dieta.`;
  }

  obtenerTextoHabitosConsumo1ConResaltado(): SafeHtml {
    const texto = this.obtenerTextoHabitosConsumo1();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    // ✅ Sin resaltado amarillo - solo texto plano
    const textoConResaltado = texto.replace(
      this.obtenerRegExp(this.escapeRegex(grupoAISD)),
      `<span>${this.escapeHtml(grupoAISD)}</span>`
    );
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoHabitosConsumo2(): string {
    const manual = this.obtenerValorCampo('textoHabitosConsumo2');
    if (manual && manual !== '____') {
      return manual;
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

  getTopOcupaciones(limit: number = 3): Array<{categoria: string, porcentaje: string, casos: number}> {
    const tabla = this.peaOcupacionesSignal();
    
    const sinTotal = tabla
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

  getFotografiasGanaderiaVista(): FotoItem[] {
    return this.fotografiasGanaderiaCache || [];
  }

  getFotografiasAgriculturaVista(): FotoItem[] {
    return this.fotografiasAgriculturaCache || [];
  }

  getFotografiasComercioVista(): FotoItem[] {
    return this.fotografiasComercioCache || [];
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  /**
   * ✅ Helper para templates - retorna prefijo de grupo para uso en HTML
   */
  obtenerPrefijo(): string {
    return this.obtenerPrefijoGrupo();
  }

  formatearMoneda(valor: any): string {
    if (!valor || valor === '____') return '____';
    const num = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(/,/g, '.'));
    if (isNaN(num)) return String(valor);
    return `S/. ${num.toFixed(2).replace('.', ',')}`;
  }

  calcularTotalCantidadPecuaria(): number {
    const datos = this.poblacionPecuariaSignal() || [];
    return datos.reduce((sum, item) => {
      if (!item.cantidadPromedio || item.cantidadPromedio === '____') return sum;
      const num = typeof item.cantidadPromedio === 'number' 
        ? item.cantidadPromedio 
        : parseFloat(String(item.cantidadPromedio).replace(/,/g, '.'));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }

  calcularTotalVentaPecuaria(): number {
    const datos = this.poblacionPecuariaSignal() || [];
    return datos.reduce((sum, item) => {
      if (!item.ventaUnidad || item.ventaUnidad === '____') return sum;
      const num = typeof item.ventaUnidad === 'number' 
        ? item.ventaUnidad 
        : parseFloat(String(item.ventaUnidad).replace(/,/g, '.'));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }
}
