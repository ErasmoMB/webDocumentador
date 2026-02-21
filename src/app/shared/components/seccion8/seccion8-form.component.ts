import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { 
  SECCION8_TABLA_PEA_OCUPACIONES_CONFIG, 
  SECCION8_TABLA_POBLACION_PECUARIA_CONFIG, 
  SECCION8_TABLA_CARACTERISTICAS_AGRICULTURA_CONFIG, 
  SECCION8_COLUMNAS_PEA_OCUPACIONES, 
  SECCION8_COLUMNAS_POBLACION_PECUARIA, 
  SECCION8_COLUMNAS_CARACTERISTICAS_AGRICULTURA,
  SECCION8_TEMPLATES,
  SECCION8_WATCHED_FIELDS
} from './seccion8-constants';

// ============================================================================
// FUNCIONES TRANSFORMADORAS - Convertir datos del backend al formato de tabla
// ============================================================================

/**
 * Desenvuelve datos del backend
 * Maneja diferentes estructuras de respuesta
 */
const unwrapData = (responseData: any): any[] => {
  if (!responseData) return [];
  
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

/**
 * Transforma datos de PEA Ocupaciones del backend
 * Mapea directamente TODOS los campos sin filtros ni procesamiento
 * Incluye todas las filas tal como vienen del backend (incluyendo totales)
 */
const transformPEAOcupacionesDesdePEA = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => ({
    categoria: item.categoria || item.ocupacion || item.actividad || item.nombre || '',
    casos: item.casos !== undefined ? item.casos : item.total || item.valor || 0,
    porcentaje: item.porcentaje || item.percentage || item.pct || ''
  }));
};

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CoreSharedModule,
    ImageUploadComponent
  ],
  selector: 'app-seccion8-form',
  templateUrl: './seccion8-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion8FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.4';
  @Input() override modoFormulario: boolean = true;

  // ✅ Hacer TEMPLATES accesible en templates
  readonly SECCION8_TEMPLATES = SECCION8_TEMPLATES;
  
  override readonly PHOTO_PREFIX = '';
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION8_WATCHED_FIELDS;

  readonly PHOTO_PREFIX_GANADERIA = 'fotografiaGanaderia';
  readonly PHOTO_PREFIX_AGRICULTURA = 'fotografiaAgricultura';
  readonly PHOTO_PREFIX_COMERCIO = 'fotografiaComercio';
  
  fotografiasGanaderiaFormMulti: FotoItem[] = [];
  fotografiasAgriculturaFormMulti: FotoItem[] = [];
  fotografiasComercioFormMulti: FotoItem[] = [];
  
  fotografiasGanaderiaCache: FotoItem[] = [];
  fotografiasAgriculturaCache: FotoItem[] = [];
  fotografiasComercioCache: FotoItem[] = [];

  // ✅ Signal para obtener el prefijo del grupo actual
  readonly prefijoGrupoSignal: Signal<string> = computed(() => this.obtenerPrefijoGrupo());

  // ✅ CAMPOS EDITABLES CON createAutoSyncField (CON PREFIJO DE GRUPO)
  readonly textoActividadesEconomicas = this.createAutoSyncField(`textoActividadesEconomicas${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoFuentesActividadesEconomicas = this.createAutoSyncField(`textoFuentesActividadesEconomicas${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoAnalisisCuadro310 = this.createAutoSyncField(`textoAnalisisCuadro310${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly cuadroTituloPEA = this.createAutoSyncField(`cuadroTituloPEA${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly cuadroFuentePEA = this.createAutoSyncField(`cuadroFuentePEA${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly parrafoSeccion8_ganaderia_completo = this.createAutoSyncField(`parrafoSeccion8_ganaderia_completo${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly cuadroTituloPoblacionPecuaria = this.createAutoSyncField(`cuadroTituloPoblacionPecuaria${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly cuadroFuentePoblacionPecuaria = this.createAutoSyncField(`cuadroFuentePoblacionPecuaria${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly parrafoSeccion8_agricultura_completo = this.createAutoSyncField(`parrafoSeccion8_agricultura_completo${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly cuadroTituloCaracteristicasAgricultura = this.createAutoSyncField(`cuadroTituloCaracteristicasAgricultura${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly cuadroFuenteCaracteristicasAgricultura = this.createAutoSyncField(`cuadroFuenteCaracteristicasAgricultura${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoMercadoComercializacion1 = this.createAutoSyncField(`textoMercadoComercializacion1${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoMercadoComercializacion2 = this.createAutoSyncField(`textoMercadoComercializacion2${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoHabitosConsumo1 = this.createAutoSyncField(`textoHabitosConsumo1${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoHabitosConsumo2 = this.createAutoSyncField(`textoHabitosConsumo2${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');

  // Configs y Columns para tablas
  get peaOcupacionesConfig() {
    const prefijo = this.prefijoGrupoSignal();
    const config = {
      tablaKey: `peaOcupacionesTabla${prefijo}`,
      totalKey: '',                        // ✅ NO agregar fila de total (viene del backend)
      campoTotal: '',                      // ✅ NO calcular total
      campoPorcentaje: '',                 // ✅ NO calcular porcentaje
      calcularPorcentajes: false,          // ✅ Los datos vienen del backend
      camposParaCalcular: [],              // ✅ NO procesar nada - datos puros del backend
      noInicializarDesdeEstructura: true,  // ✅ No inicializar desde estructura
      permiteAgregarFilas: true,
      permiteEliminarFilas: true
    };
    console.log('[SECCION8] 🔍 Config generado:', config);
    return config;
  }
  poblacionPecuariaConfig = SECCION8_TABLA_POBLACION_PECUARIA_CONFIG;
  caracteristicasAgriculturaConfig = SECCION8_TABLA_CARACTERISTICAS_AGRICULTURA_CONFIG;
  
  peaOcupacionesColumns = SECCION8_COLUMNAS_PEA_OCUPACIONES;
  poblacionPecuariaColumns = SECCION8_COLUMNAS_POBLACION_PECUARIA;
  caracteristicasAgriculturaColumns = SECCION8_COLUMNAS_CARACTERISTICAS_AGRICULTURA;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

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

  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `${this.PHOTO_PREFIX_GANADERIA}${i}Titulo${prefijo}`;
      const fuenteKey = `${this.PHOTO_PREFIX_GANADERIA}${i}Fuente${prefijo}`;
      const imagenKey = `${this.PHOTO_PREFIX_GANADERIA}${i}Imagen${prefijo}`;
      
      const titulo = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, imagenKey)();
      
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ NUMERACIÓN GLOBAL - Tablas (tres tablas: PEA_Ocupaciones, Pecuaria, Agricultura)
  readonly globalTableNumberSignalPEA: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  });
  
  readonly globalTableNumberSignalPecuaria: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
  });
  
  readonly globalTableNumberSignalAgricultura: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 2);
  });
  
  // ✅ NUMERACIÓN GLOBAL - Fotos (3 grupos)
  readonly photoNumbersGanaderiaSignal: Signal<string[]> = computed(() => {
    const prefix = `${this.PHOTO_PREFIX_GANADERIA}${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`;
    const fotos = this.fotografiasGanaderiaCache || [];
    return fotos.map((_, index) => 
      this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index)
    );
  });
  
  readonly photoNumbersAgriculturaSignal: Signal<string[]> = computed(() => {
    const prefix = `${this.PHOTO_PREFIX_AGRICULTURA}${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`;
    const fotos = this.fotografiasAgriculturaCache || [];
    return fotos.map((_, index) => 
      this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index)
    );
  });
  
  readonly photoNumbersComercioSignal: Signal<string[]> = computed(() => {
    const prefix = `${this.PHOTO_PREFIX_COMERCIO}${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`;
    const fotos = this.fotografiasComercioCache || [];
    return fotos.map((_, index) => 
      this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index)
    );
  });

  // ✅ NUEVO: Signal para ubicación global (desde metadata)
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private globalNumbering: GlobalNumberingService,
    private backendApi: BackendApiService,
    private formChange: FormChangeService  // ✅ Para persistencia en Redis
  ) {
    super(cdRef, injector);

    effect(() => {
      this.formDataSignal();
      this.peaOcupacionesSignal();
      this.poblacionPecuariaSignal();
      this.caracteristicasAgriculturaSignal();
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  onPEATableUpdated(updatedData?: any[]): void {
    // ✅ LEER DEL SIGNAL REACTIVO
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `peaOcupacionesTabla${prefijo}` : 'peaOcupacionesTabla';
    const tablaActual = updatedData || formData[tablaKey] || [];
    
    // ✅ GUARDAR EN PROJECTSTATEFACADE
    this.projectFacade.setField(this.seccionId, null, tablaKey, tablaActual);
    this.projectFacade.setField(this.seccionId, null, 'peaOcupacionesTabla', tablaActual);
    
    // ✅ PERSISTIR EN REDIS
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaActual }, { notifySync: true });
      console.log(`[SECCION8] ✅ PEA data saved to session-data`);
    } catch (e) {
      console.error(`[SECCION8] ⚠️ Could not save to session-data:`, e);
    }
    
    this.cdRef.markForCheck();
  }

  onPoblacionPecuariaTableUpdated(updatedData?: any[]): void {
    // ✅ LEER DEL SIGNAL REACTIVO
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `poblacionPecuariaTabla${prefijo}` : 'poblacionPecuariaTabla';
    const tablaActual = updatedData || formData[tablaKey] || [];
    
    // ✅ GUARDAR EN PROJECTSTATEFACADE
    this.projectFacade.setField(this.seccionId, null, tablaKey, tablaActual);
    this.projectFacade.setField(this.seccionId, null, 'poblacionPecuariaTabla', tablaActual);
    
    // ✅ PERSISTIR EN REDIS
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaActual }, { notifySync: true });
      console.log(`[SECCION8] ✅ Pecuaria data saved to session-data`);
    } catch (e) {
      console.error(`[SECCION8] ⚠️ Could not save to session-data:`, e);
    }
    
    this.cdRef.markForCheck();
  }

  onCaracteristicasAgriculturaTableUpdated(updatedData?: any[]): void {
    // ✅ LEER DEL SIGNAL REACTIVO
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `caracteristicasAgriculturaTabla${prefijo}` : 'caracteristicasAgriculturaTabla';
    const tablaActual = updatedData || formData[tablaKey] || [];
    
    // ✅ GUARDAR EN PROJECTSTATEFACADE
    this.projectFacade.setField(this.seccionId, null, tablaKey, tablaActual);
    this.projectFacade.setField(this.seccionId, null, 'caracteristicasAgriculturaTabla', tablaActual);
    
    // ✅ PERSISTIR EN REDIS
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: tablaActual }, { notifySync: true });
      console.log(`[SECCION8] ✅ Agricultura data saved to session-data`);
    } catch (e) {
      console.error(`[SECCION8] ⚠️ Could not save to session-data:`, e);
    }
    
    this.cdRef.markForCheck();
  }

  protected override onInitCustom(): void {
    // ✅ PRIMERO: Asegurar que las tablas estén completamente vacías
    this.inicializarTablasVacias();
    // ✅ SEGUNDO: Cargar datos del backend
    this.cargarDatosDelBackend();
    // TERCERO: Cargar fotografías
    this.cargarFotografias();
  }

  /**
   * ✅ CORREGIDO: Solo inicializar tablas si NO existen datos persistidos
   */
  private inicializarTablasVacias(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const formData = this.formDataSignal();
    
    // ✅ VERIFICAR SI YA EXISTEN DATOS PERSISTIDOS antes de inicializar
    const peaTablaKey = prefijo ? `peaOcupacionesTabla${prefijo}` : 'peaOcupacionesTabla';
    const existingPeaData = formData[peaTablaKey];
    
    // Solo inicializar como vacío si no hay datos persistidos
    if (!existingPeaData || !Array.isArray(existingPeaData) || existingPeaData.length === 0) {
      this.projectFacade.setField(this.seccionId, null, `peaOcupacionesTabla${prefijo}`, []);
      this.projectFacade.setField(this.seccionId, null, 'peaOcupacionesTabla', []);
    }
  }

  /**
   * ✅ Cargar datos del backend siguiendo el patrón de Sección 6 y 7
   * Carga solo la tabla PEA Ocupaciones desde el backend
   */
  private cargarDatosDelBackend(): void {
    // ✅ Obtener códigos de centros poblados del grupo AISD actual
    const codigosArray = this.getCodigosCentrosPobladosAISD();
    const codigos = [...codigosArray]; // Copia mutable

    if (!codigos || codigos.length === 0) {
      console.log('[SECCION8] ⚠️ No hay centros poblados en el grupo actual');
      return;
    }

    const prefijo = this.obtenerPrefijoGrupo();

    // ❌ ELIMINADO: postCondicionOcupacion no retorna datos válidos
    // La tabla PEA Ocupaciones no se llena desde el backend
    // Se deja vacía para que sea rellenada manualmente por el usuario
    console.log('[SECCION8] ⚠️ Tabla PEA Ocupaciones se mantiene vacía (sin carga del backend)');
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasGanaderiaFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_GANADERIA,
      groupPrefix
    ) || [];
    this.fotografiasAgriculturaFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_AGRICULTURA,
      groupPrefix
    ) || [];
    this.fotografiasComercioFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_COMERCIO,
      groupPrefix
    ) || [];
    this.cdRef.markForCheck();
  }

  obtenerTextoSeccion8GanaderiaCompleto(): string {
    const formData = this.formDataSignal();
    if (formData['parrafoSeccion8_ganaderia_completo']) {
      return formData['parrafoSeccion8_ganaderia_completo'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    // ✅ REFACTOR: Usar ubicacionGlobal en lugar de formData
    const provincia = this.ubicacionGlobal().provincia || '____';
    
    return `En la CC ${grupoAISD}, la ganadería es la actividad económica predominante, con un 80 % de la producción destinada al autoconsumo familiar y un 20 % a la venta, según los entrevistados. Las principales especies que se crían son los vacunos y los ovinos, aunque también se crían caprinos y animales menores como gallinas y cuyes. El precio del ganado en pie varía dependiendo de la especie: los vacunos se venden entre S/. 1 200 y S/. 1 500, los ovinos entre S/. 180 y S/. 200, las gallinas entre S/. 20 y S/. 30, y los cuyes entre S/. 25 y S/. 30.\n\nLa alimentación del ganado se basa principalmente en pasto natural, aunque también se les proporciona pasto cultivable en las temporadas de escasez. Uno de los productos derivados más importantes es el queso, el cual se destina particularmente a la capital provincial de ${provincia} para la venta; también se elabora yogurt, aunque en menor medida.\n\nA pesar de la importancia de esta actividad para la economía local, la ganadería enfrenta diversas problemáticas. Entre las principales están la falta de especialistas en salud veterinaria, así como los desafíos climáticos, especialmente las heladas, que pueden reducir la disponibilidad de pastos y generar pérdidas en los rebaños. Estas dificultades impactan directamente en la productividad y los ingresos de los comuneros ganaderos.`;
  }

  obtenerTextoSeccion8AgriculturaCompleto(): string {
    const formData = this.formDataSignal();
    if (formData['parrafoSeccion8_agricultura_completo']) {
      return formData['parrafoSeccion8_agricultura_completo'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `En la CC ${grupoAISD}, la agricultura desempeña un papel complementario a la ganadería, y la mayor parte de la producción, cerca de un 95 % según los entrevistados, se destina al autoconsumo, mientras que solo un 5 % se comercializa. Los principales cultivos son la papa, habas, cebada y forraje (como avena y alfalfa), los cuales son esenciales para la dieta de las familias comuneras y en menor medida para la alimentación del ganado. Estos productos se cultivan en pequeñas parcelas, con cada familia disponiendo de un promedio de 1 ½ hectárea de tierra.\n\nEl sistema de riego utilizado en la comunidad es principalmente por gravedad, aprovechando las fuentes de agua disponibles en la zona. Sin embargo, la actividad agrícola enfrenta serios desafíos, como las heladas, que dañan los cultivos durante las temporadas frías, y las sequías, que disminuyen la disponibilidad de agua, afectando la capacidad productiva de las familias. Adicionalmente, se enfrentan plagas y enfermedades como roedores y el gusano blanco. Estas problemáticas, recurrentes en el ciclo agrícola, limitan tanto la cantidad como la calidad de los productos cosechados.`;
  }

  obtenerTextoActividadesEconomicas(): string {
    const formData = this.formDataSignal();
    if (formData['textoActividadesEconomicas'] && formData['textoActividadesEconomicas'] !== '____') {
      return formData['textoActividadesEconomicas'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `Las actividades económicas de la población son un reflejo de los patrones de producción, consumo y empleo en una localidad o jurisdicción determinada. En este ítem, se describe las ocupaciones principales existentes en los poblados de la CC ${grupoAISD}, que forma parte del AISD.`;
  }

  obtenerTituloPEA(): string {
    const formData = this.formDataSignal();
    const titulo = formData['cuadroTituloPEA'] || 'PEA Ocupada según ocupaciones principales';
    const comunidad = this.obtenerNombreComunidadActual();
    return `${titulo} – CC ${comunidad} (2017)`;
  }

  obtenerTituloGanaderia(): string {
    const formData = this.formDataSignal();
    const titulo = formData['cuadroTituloPoblacionPecuaria'] || 'Población Pecuaria';
    const comunidad = this.obtenerNombreComunidadActual();
    return `${titulo} – CC ${comunidad}`;
  }

  obtenerTituloAgricultura(): string {
    const formData = this.formDataSignal();
    const titulo = formData['cuadroTituloCaracteristicasAgricultura'] || 'Características de la Agricultura';
    const comunidad = this.obtenerNombreComunidadActual();
    return `${titulo} – CC ${comunidad}`;
  }

  obtenerTextoFuentesActividadesEconomicas(): string {
    const formData = this.formDataSignal();
    if (formData['textoFuentesActividadesEconomicas'] && formData['textoFuentesActividadesEconomicas'] !== '____') {
      return formData['textoFuentesActividadesEconomicas'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `A partir de fuentes oficiales, se exploran las principales labores y ocupaciones más relevantes dentro de la CC ${grupoAISD}. En esta ocasión, se recurre a los datos provistos por la Plataforma Nacional de Datos Georreferenciados – Geo Perú.`;
  }

  obtenerTextoAnalisisCuadro310(): string {
    const formData = this.formDataSignal();
    // ✅ Si el usuario editó manualmente, usar ESO (no regenerar)
    if (formData['textoAnalisisCuadro310'] && formData['textoAnalisisCuadro310'] !== '____' && formData['textoAnalisisCuadro310'].trim().length > 0) {
      return formData['textoAnalisisCuadro310'];
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

  obtenerTextoMercadoComercializacion1(): string {
    const formData = this.formDataSignal();
    if (formData['textoMercadoComercializacion1'] && formData['textoMercadoComercializacion1'] !== '____') {
      return formData['textoMercadoComercializacion1'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `Dentro de la CC ${grupoAISD} no existe un mercado local donde se puedan comercializar los productos agrícolas o ganaderos directamente. Toda la venta de estos productos se realiza a través de intermediarios que visitan la comunidad en busca de animales en pie o productos como el queso. Estos intermediarios suelen establecer los precios de compra, lo que limita la capacidad de los comuneros para negociar y obtener un valor justo por su producción.`;
  }

  obtenerTextoMercadoComercializacion2(): string {
    const formData = this.formDataSignal();
    if (formData['textoMercadoComercializacion2'] && formData['textoMercadoComercializacion2'] !== '____') {
      return formData['textoMercadoComercializacion2'];
    }
    
    return `Esta dependencia de los intermediarios presenta diversas dificultades. Por un lado, los comuneros reciben precios más bajos en comparación con los que podrían obtener si tuvieran acceso directo a mercados más grandes o si contaran con un punto de venta dentro de la comunidad. Además, el transporte de los productos fuera de la comunidad aumenta los costos logísticos, afectando la rentabilidad de las actividades económicas. Este sistema de comercialización se traduce en una vulnerabilidad económica para las familias, ya que dependen de las condiciones impuestas por terceros para la venta de sus bienes.`;
  }

  obtenerTextoHabitosConsumo1(): string {
    const formData = this.formDataSignal();
    if (formData['textoHabitosConsumo1'] && formData['textoHabitosConsumo1'] !== '____') {
      return formData['textoHabitosConsumo1'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `En la CC ${grupoAISD}, los hábitos de consumo se caracterizan por una dieta basada principalmente en productos que se adquieren de comerciantes que visitan la comunidad periódicamente (quincenalmente, en promedio), así como en pequeñas bodegas locales. Entre los alimentos más consumidos destacan los abarrotes como el arroz, maíz y fideos, que forman parte esencial de la alimentación diaria de las familias. Estos productos son complementados con la producción local de papa y habas, que también son alimentos fundamentales en la dieta.`;
  }

  obtenerTextoHabitosConsumo2(): string {
    const formData = this.formDataSignal();
    if (formData['textoHabitosConsumo2'] && formData['textoHabitosConsumo2'] !== '____') {
      return formData['textoHabitosConsumo2'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `El consumo de papa y habas es especialmente importante, ya que ambos son productos locales y tradicionales, que no solo se destinan al autoconsumo, sino que también forman parte de la base alimentaria debido a su disponibilidad y bajo costo. La producción de estos alimentos es continua, lo que asegura su presencia en la mayoría de los hogares. Dentro de la CC ${grupoAISD} resaltan algunos platos tradicionales como el "revuelto de habas", cuy chactado y el chicharrón. Por otra parte, también destaca el consumo de frutas que son obtenidas a través de los comerciantes que visitan la comunidad, los cuales ofrecen productos adicionales como verduras y prendas en determinadas ocasiones.`;
  }

  getPEAOcupacionesConPorcentajes(): any[] {
    const tablaPEA = this.peaOcupacionesSignal();
    if (!tablaPEA || !Array.isArray(tablaPEA) || tablaPEA.length === 0) {
      return [];
    }

    const total = tablaPEA.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      return tablaPEA.map((item: any) => ({ ...item, porcentaje: '0,00 %' }));
    }

    const tablaConPorcentajes = tablaPEA.map((item: any) => {
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

    // No agregar fila Total manualmente, el backend ya la envía
    return tablaConPorcentajes;
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

  onFotografiasGanaderiaChange(fotografias: FotoItem[]) {
    // ✅ Guardar via heredado (imageService)
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_GANADERIA, fotografias);
    
    // ✅ PLUS: Guardar también en projectFacade para persistencia en SessionDataService/Backend
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const fotosData = fotografias.map((f, idx) => {
      const i = idx + 1;
      const tituloKey = `${this.PHOTO_PREFIX_GANADERIA}${i}Titulo${prefijo}`;
      const fuenteKey = `${this.PHOTO_PREFIX_GANADERIA}${i}Fuente${prefijo}`;
      const imagenKey = `${this.PHOTO_PREFIX_GANADERIA}${i}Imagen${prefijo}`;
      
      this.projectFacade.setField(this.seccionId, null, tituloKey, f.titulo || '');
      this.projectFacade.setField(this.seccionId, null, fuenteKey, f.fuente || '');
      this.projectFacade.setField(this.seccionId, null, imagenKey, f.imagen || '');
    });
    
    this.fotografiasGanaderiaFormMulti = [...fotografias];
    this.cdRef.detectChanges();
  }

  onFotografiasAgriculturaChange(fotografias: FotoItem[]) {
    // ✅ Guardar via heredado (imageService)
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_AGRICULTURA, fotografias);
    
    // ✅ PLUS: Guardar también en projectFacade para persistencia en SessionDataService/Backend
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    fotografias.forEach((f, idx) => {
      const i = idx + 1;
      const tituloKey = `${this.PHOTO_PREFIX_AGRICULTURA}${i}Titulo${prefijo}`;
      const fuenteKey = `${this.PHOTO_PREFIX_AGRICULTURA}${i}Fuente${prefijo}`;
      const imagenKey = `${this.PHOTO_PREFIX_AGRICULTURA}${i}Imagen${prefijo}`;
      
      this.projectFacade.setField(this.seccionId, null, tituloKey, f.titulo || '');
      this.projectFacade.setField(this.seccionId, null, fuenteKey, f.fuente || '');
      this.projectFacade.setField(this.seccionId, null, imagenKey, f.imagen || '');
    });
    
    this.fotografiasAgriculturaFormMulti = [...fotografias];
    this.cdRef.detectChanges();
  }

  onFotografiasComercioChange(fotografias: FotoItem[]) {
    // ✅ Guardar via heredado (imageService)
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_COMERCIO, fotografias);
    
    // ✅ PLUS: Guardar también en projectFacade para persistencia en SessionDataService/Backend
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    fotografias.forEach((f, idx) => {
      const i = idx + 1;
      const tituloKey = `${this.PHOTO_PREFIX_COMERCIO}${i}Titulo${prefijo}`;
      const fuenteKey = `${this.PHOTO_PREFIX_COMERCIO}${i}Fuente${prefijo}`;
      const imagenKey = `${this.PHOTO_PREFIX_COMERCIO}${i}Imagen${prefijo}`;
      
      this.projectFacade.setField(this.seccionId, null, tituloKey, f.titulo || '');
      this.projectFacade.setField(this.seccionId, null, fuenteKey, f.fuente || '');
      this.projectFacade.setField(this.seccionId, null, imagenKey, f.imagen || '');
    });
    
    this.fotografiasComercioFormMulti = [...fotografias];
    this.cdRef.detectChanges();
  }

  private getTablaKeyPEAOcupaciones(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `peaOcupacionesTabla${prefijo}` : 'peaOcupacionesTabla';
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

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  formatearMoneda(valor: any): string {
    if (!valor || valor === '____') return '____';
    const num = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(/,/g, '.'));
    if (isNaN(num)) return String(valor);
    return `S/. ${num.toFixed(2).replace('.', ',')}`;
  }
}
