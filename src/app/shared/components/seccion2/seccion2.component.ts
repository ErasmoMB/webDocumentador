import { Component, ChangeDetectorRef, OnDestroy, Injector, ChangeDetectionStrategy, Signal, computed, effect, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion2TextGeneratorService } from '../../../core/services/seccion2-text-generator.service';
import { DataHighlightService } from '../../../core/services/data-highlight.service';
import { ProjectStateFacade } from '../../../core/state/project-state.facade';
import { BaseSectionComponent } from '../base-section.component';
import { ReactiveStateAdapter } from '../../../core/services/state-adapters/reactive-state-adapter.service';
import { Commands } from '../../../core/state/ui-store.contract';
import { GroupDefinition, CCPPEntry } from '../../../core/state/project-state.model';

/**
 * SECCION 2 - ÁREA DE INFLUENCIA SOCIAL
 * 
 * Componente refactorizado para consumir exclusivamente señales (Signals) del ProjectStateFacade.
 * 
 * PRINCIPIOS:
 * - ✅ No usa projectFacade.obtenerDatos()
 * - ✅ Lee datos solo de signals: groupsByType, allPopulatedCenters
 * - ✅ Cada modificación dispara comandos específicos (addGroup, removeGroup, renameGroup, setGroupCCPP, etc.)
 * - ✅ Los centros poblados activos se derivan de grupo.ccppIds (reactivo)
 * - ✅ UI reactiva: effect() para loguear cambios automáticamente
 * 
 * COMANDOS UTILIZADOS:
 * - addGroup: Agregar comunidad/distrito
 * - removeGroup: Eliminar comunidad/distrito
 * - renameGroup: Cambiar nombre
 * - setGroupCCPP: Reemplazar todos los CCPP de un grupo
 * - addCCPPToGroup: Agregar un CCPP individual
 * - removeCCPPFromGroup: Remover un CCPP individual
 */
@Component({
  selector: 'app-seccion2',
  templateUrl: './seccion2.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ImageUploadComponent,
    CoreSharedModule
  ],
  standalone: true
})
export class Seccion2Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.2';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaSeccion2';
  override useReactiveSync: boolean = true;
  
  override watchedFields: string[] = [
    'parrafoSeccion2_introduccion',
    'parrafoSeccion2_aisd_completo',
    'parrafoSeccion2_aisi_completo'
  ];

  fotografiasSeccion2: FotoItem[] = [];
  imageUploadKey: number = 0;

  // ============================================================================
  // SIGNALS - Única fuente de verdad para grupos y centros poblados
  // ============================================================================
  
  /** Signal: Grupos AISD (Comunidades Campesinas) */
  readonly aisdGroups: Signal<readonly GroupDefinition[]> = this.projectFacade.groupsByType('AISD');
  
  /** Signal: Grupos AISI (Distritos) */
  readonly aisiGroups: Signal<readonly GroupDefinition[]> = this.projectFacade.groupsByType('AISI');
  
  /** Signal: Todos los centros poblados registrados */
  readonly allPopulatedCenters: Signal<readonly CCPPEntry[]> = this.projectFacade.allPopulatedCenters();

  /** Signal derivado: Nombres de comunidades para texto */
  readonly comunidadesNombres: Signal<string[]> = computed(() => 
    this.aisdGroups().map(g => g.nombre)
  );

  /** Signal derivado: Nombres de distritos para texto */
  readonly distritosNombres: Signal<string[]> = computed(() => 
    this.aisiGroups().map(g => g.nombre)
  );

  /** Signal derivado: Texto AISD formateado para vista */
  readonly textoAISDFormateado: Signal<SafeHtml> = computed(() => {
    const texto = this.obtenerTextoSeccion2AISDCompleto();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  /** Signal derivado: Texto AISI formateado para vista */
  readonly textoAISIFormateado: Signal<SafeHtml> = computed(() => {
    const texto = this.obtenerTextoSeccion2AISICompleto();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  // ============================================================================
  // SERVICIOS
  // ============================================================================
  
  private readonly textGenerator = this.injector.get(Seccion2TextGeneratorService);
  private readonly dataHighlightService = this.injector.get(DataHighlightService);

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);
    
    // ✅ REACTIVIDAD: Registrar effect para loguear cambios en grupos
    effect(() => {
      const aisd = this.aisdGroups();
      const aisi = this.aisiGroups();
      const centros = this.allPopulatedCenters();
      
      console.log('🔄 [Seccion2] Grupos AISD actualizados:', aisd.length, 'grupos');
      console.log('🔄 [Seccion2] Grupos AISI actualizados:', aisi.length, 'grupos');
      console.log('🔄 [Seccion2] Centros poblados disponibles:', centros.length);
      
      aisd.forEach(grupo => {
        const centrosActivos = grupo.ccppIds.map(id => 
          centros.find(c => c.codigo === id)?.nombre || id
        );
        console.log(`   Grupo ${grupo.nombre} → centros:`, centrosActivos);
      });
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    // ✅ Cargar fotografías
    this.cargarFotografias();
  }

  override ngOnDestroy(): void {
    // Limpieza si fuera necesario
  }

  protected override actualizarDatosCustom(): void {
    // Cargar fotografías cuando se actualizan datos
    this.cargarFotografias();
  }

  protected override onChangesCustom(changes: SimpleChanges): void {
    if (changes['modoFormulario'] && !this.modoFormulario) {
      setTimeout(() => {
        this.cargarFotografias();
        this.cdRef.markForCheck();
      }, 0);
    }
  }

  // ============================================================================
  // COMANDOS - AISD (Comunidades Campesinas)
  // ============================================================================

  /**
   * Agrega una nueva comunidad campesina (grupo AISD)
   */
  agregarComunidadCampesina(): void {
    const nombre = `Comunidad Campesina ${this.aisdGroups().length + 1}`;
    this.projectFacade.addGroup('AISD', nombre, null);
    console.log(`✅ [Comando] Agregada comunidad: ${nombre}`);
    this.cdRef.markForCheck();
  }

  /**
   * Elimina una comunidad campesina
   */
  eliminarComunidadCampesina(id: string): void {
    this.projectFacade.removeGroup('AISD', id, true);
    console.log(`❌ [Comando] Eliminada comunidad: ${id}`);
    this.cdRef.markForCheck();
  }

  /**
   * Actualiza el nombre de una comunidad
   */
  actualizarNombreComunidad(id: string, nombre: string): void {
    this.projectFacade.renameGroup('AISD', id, nombre);
    console.log(`📝 [Comando] Renombrada comunidad ${id} → ${nombre}`);
    this.cdRef.markForCheck();
  }

  // ============================================================================
  // COMANDOS - AISI (Distritos)
  // ============================================================================

  /**
   * Agrega un nuevo distrito (grupo AISI)
   */
  agregarDistritoAISI(): void {
    const nombre = `Distrito ${this.aisiGroups().length + 1}`;
    this.projectFacade.addGroup('AISI', nombre, null);
    console.log(`✅ [Comando] Agregado distrito: ${nombre}`);
    this.cdRef.markForCheck();
  }

  /**
   * Elimina un distrito
   */
  eliminarDistritoAISI(id: string): void {
    this.projectFacade.removeGroup('AISI', id, true);
    console.log(`❌ [Comando] Eliminado distrito: ${id}`);
    this.cdRef.markForCheck();
  }

  /**
   * Actualiza el nombre de un distrito
   */
  actualizarNombreDistrito(id: string, nombre: string): void {
    this.projectFacade.renameGroup('AISI', id, nombre);
    console.log(`📝 [Comando] Renombrado distrito ${id} → ${nombre}`);
    this.cdRef.markForCheck();
  }

  // ============================================================================
  // COMANDOS - CENTROS POBLADOS
  // ============================================================================

  /**
   * Agrega un centro poblado a una comunidad
   */
  addCCPPToComunidad(communityId: string, ccppId: string): void {
    this.projectFacade.dispatch({
      type: 'groupConfig/addCCPPToGroup',
      payload: { tipo: 'AISD', groupId: communityId, ccppId }
    });
    console.log(`➕ [Comando] Centro ${ccppId} agregado a comunidad ${communityId}`);
    this.cdRef.markForCheck();
  }

  /**
   * Remueve un centro poblado de una comunidad
   */
  removeCCPPFromComunidad(communityId: string, ccppId: string): void {
    this.projectFacade.dispatch({
      type: 'groupConfig/removeCCPPFromGroup',
      payload: { tipo: 'AISD', groupId: communityId, ccppId }
    });
    console.log(`➖ [Comando] Centro ${ccppId} removido de comunidad ${communityId}`);
    this.cdRef.markForCheck();
  }

  /**
   * Agrega un centro poblado a un distrito
   */
  addCCPPToDistrito(districtId: string, ccppId: string): void {
    this.projectFacade.dispatch({
      type: 'groupConfig/addCCPPToGroup',
      payload: { tipo: 'AISI', groupId: districtId, ccppId }
    });
    console.log(`➕ [Comando] Centro ${ccppId} agregado a distrito ${districtId}`);
    this.cdRef.markForCheck();
  }

  /**
   * Remueve un centro poblado de un distrito
   */
  removeCCPPFromDistrito(districtId: string, ccppId: string): void {
    this.projectFacade.dispatch({
      type: 'groupConfig/removeCCPPFromGroup',
      payload: { tipo: 'AISI', groupId: districtId, ccppId }
    });
    console.log(`➖ [Comando] Centro ${ccppId} removido de distrito ${districtId}`);
    this.cdRef.markForCheck();
  }

  /**
   * Toggle (agrega o remueve) un centro poblado de una comunidad
   */
  toggleCentroPobladoComunidad(id: string, codigo: string): void {
    const grupo = this.aisdGroups().find(g => g.id === id);
    if (!grupo) return;

    const codigoNormalizado = codigo?.toString().trim();
    if (!codigoNormalizado) return;

    const existe = grupo.ccppIds.includes(codigoNormalizado);
    
    if (existe) {
      this.removeCCPPFromComunidad(id, codigoNormalizado);
    } else {
      this.addCCPPToComunidad(id, codigoNormalizado);
    }
  }

  /**
   * Toggle (agrega o remueve) un centro poblado de un distrito
   */
  toggleCentroPobladoDistrito(id: string, codigo: string): void {
    const grupo = this.aisiGroups().find(g => g.id === id);
    if (!grupo) return;

    const codigoNormalizado = codigo?.toString().trim();
    if (!codigoNormalizado) return;

    const existe = grupo.ccppIds.includes(codigoNormalizado);
    
    if (existe) {
      this.removeCCPPFromDistrito(id, codigoNormalizado);
    } else {
      this.addCCPPToDistrito(id, codigoNormalizado);
    }
  }

  /**
   * Selecciona todos los centros poblados disponibles para una comunidad
   */
  seleccionarTodosCentrosPobladosComunidad(id: string): void {
    const codigos = this.allPopulatedCenters().map(c => String(c.codigo));
    this.projectFacade.dispatch({
      type: 'groupConfig/setGroupCCPP',
      payload: { tipo: 'AISD', groupId: id, ccppIds: codigos }
    });
    console.log(`✅ [Comando] Todos los centros seleccionados para comunidad ${id}`);
    this.cdRef.markForCheck();
  }

  /**
   * Deselecciona todos los centros poblados de una comunidad
   */
  deseleccionarTodosCentrosPobladosComunidad(id: string): void {
    this.projectFacade.dispatch({
      type: 'groupConfig/setGroupCCPP',
      payload: { tipo: 'AISD', groupId: id, ccppIds: [] }
    });
    console.log(`❌ [Comando] Todos los centros deseleccionados para comunidad ${id}`);
    this.cdRef.markForCheck();
  }

  /**
   * Selecciona todos los centros poblados disponibles para un distrito
   */
  seleccionarTodosCentrosPobladosDistrito(id: string): void {
    const codigos = this.allPopulatedCenters().map(c => String(c.codigo));
    this.projectFacade.dispatch({
      type: 'groupConfig/setGroupCCPP',
      payload: { tipo: 'AISI', groupId: id, ccppIds: codigos }
    });
    console.log(`✅ [Comando] Todos los centros seleccionados para distrito ${id}`);
    this.cdRef.markForCheck();
  }

  /**
   * Deselecciona todos los centros poblados de un distrito
   */
  deseleccionarTodosCentrosPobladosDistrito(id: string): void {
    this.projectFacade.dispatch({
      type: 'groupConfig/setGroupCCPP',
      payload: { tipo: 'AISI', groupId: id, ccppIds: [] }
    });
    console.log(`❌ [Comando] Todos los centros deseleccionados para distrito ${id}`);
    this.cdRef.markForCheck();
  }

  // ============================================================================
  // MÉTODOS DERIVADOS - Compatibilidad con templates y formularios
  // ============================================================================

  /**
   * Obtiene los centros poblados seleccionados de una comunidad (derivado del signal)
   */
  obtenerCentrosPobladosSeleccionadosComunidad(id: string): string[] {
    const grupo = this.aisdGroups().find(g => g.id === id);
    return grupo?.ccppIds as string[] || [];
  }

  /**
   * Obtiene todos los centros poblados disponibles
   */
  obtenerTodosCentrosPoblados(): CCPPEntry[] {
    return this.allPopulatedCenters() as CCPPEntry[];
  }

  /**
   * Verifica si un grupo tiene una sola comunidad
   */
  tieneUnaComunidad(): boolean {
    return this.aisdGroups().length === 1;
  }

  /**
   * Verifica si un grupo tiene múltiples comunidades
   */
  tieneMultiplesComunidades(): boolean {
    return this.aisdGroups().length > 1;
  }

  /**
   * Obtiene nombres de comunidades como texto
   */
  obtenerTextoComunidades(): string {
    const nombres = this.comunidadesNombres();
    if (nombres.length === 0) return '____';
    if (nombres.length === 1) return nombres[0];
    if (nombres.length === 2) return `${nombres[0]} y ${nombres[1]}`;
    return nombres.slice(0, -1).join(', ') + ' y ' + nombres[nombres.length - 1];
  }

  /**
   * Obtiene texto de comunidades en singular
   */
  obtenerTextoComunidadesSingular(): string {
    return this.tieneUnaComunidad() ? 'comunidad campesina' : 'comunidades campesinas';
  }

  /**
   * Obtiene texto de comunidades en posesión
   */
  obtenerTextoComunidadesPosesion(): string {
    return this.tieneUnaComunidad() ? 'su' : 'sus';
  }

  /**
   * Obtiene prefijo para texto de impactos
   */
  obtenerPrefijoCCImpactos(): string {
    return this.tieneUnaComunidad() ? 'la CC' : 'las CC';
  }

  /**
   * Obtiene texto de comunidades para impactos
   */
  obtenerTextoComunidadesImpactos(): string {
    return this.obtenerTextoComunidades();
  }

  /**
   * Obtiene prefijo para texto final
   */
  obtenerPrefijoCCFinal(): string {
    return this.tieneUnaComunidad() ? 'la CC' : 'las CC';
  }

  /**
   * Obtiene texto de comunidades final
   */
  obtenerTextoComunidadesFinal(): string {
    return this.obtenerTextoComunidades();
  }

  // ============================================================================
  // TEXTOS DERIVADOS PARA VISTA
  // ============================================================================
  // MÉTODOS PARA GENERAR TEXTO SIN HTML (versión plana para edición)
  // ============================================================================

  /**
   * Genera texto AISD **SIN HTML** para usar en el editor (texto plano)
   */
  generarTextoAISDSinHTML(params: { 
    comunidades: string; 
    distrito: string; 
    componente1?: string; 
    componente2?: string; 
    departamento?: string 
  }): string {
    const comunidades = params.comunidades || '____';
    const distrito = params.distrito || '____';
    const componente1 = params.componente1 || '____';
    const componente2 = params.componente2 || '____';
    const departamento = params.departamento || '____';

    return `El Área de influencia social directa (AISD) se delimita en torno a la comunidad campesina (CC) ${comunidades}, cuya área comunal se encuentra predominantemente en el distrito de ${distrito} y en menor proporción en los distritos de ${componente1} y de ${componente2}, pertenecientes al departamento de ${departamento}. La delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales. Esta comunidad posee y gestiona las tierras donde se llevará a cabo la exploración minera, lo que implica una relación directa y significativa con el Proyecto. La titularidad de estas tierras establece un vínculo crucial con los pobladores locales, ya que cualquier actividad realizada en el área puede influir directamente sus derechos, usos y costumbres asociados a la tierra. Además, la gestión y administración de estos terrenos por parte de esta comunidad requiere una consideración detallada en la planificación y ejecución del Proyecto, asegurando que las operaciones se lleven a cabo con respeto a la estructura organizativa y normativa de la comunidad. Los impactos directos en la CC ${comunidades}, derivados del proyecto de exploración minera, incluyen la contratación de mano de obra local, la interacción con las costumbres y autoridades, y otros efectos socioeconómicos y culturales. La generación de empleo local no solo proporcionará oportunidades económicas inmediatas, sino que también fomentará el desarrollo de habilidades y capacidades en la población. La interacción constante con las autoridades y la comunidad promoverá un diálogo y una cooperación que son esenciales para el éxito del Proyecto, respetando y adaptándose a las prácticas y tradiciones locales. La consideración de estos factores en la delimitación del AISD garantiza que el Proyecto avance de manera inclusiva y sostenible, alineado con las expectativas y necesidades de la CC ${comunidades}.`;
  }

  /**
   * Obtiene texto AISD para edición (sin HTML)
   */
  obtenerTextoSeccion2AISDParaEdicion(): string {
    const manual = this.projectFacade.obtenerDatos()?.['parrafoSeccion2_aisd_completo'];
    if (manual && manual.trim().length > 0) return manual;

    const comunidades = this.obtenerTextoComunidades();
    const datos = this.projectFacade.obtenerDatos();
    const geoInfo = datos?.['geoInfo'] || {};
    const distrito = geoInfo.DIST || '____';
    const departamento = geoInfo.DPTO || '____';
    const componente1 = datos?.['aisdComponente1'] || '____';
    const componente2 = datos?.['aisdComponente2'] || '____';

    return this.generarTextoAISDSinHTML({ 
      comunidades, 
      distrito, 
      componente1, 
      componente2, 
      departamento 
    });
  }

  /**
   * Obtiene texto AISI para edición (sin HTML)
   */
  obtenerTextoSeccion2AISIParaEdicion(): string {
    const manual = this.projectFacade.obtenerDatos()?.['parrafoSeccion2_aisi_completo'];
    if (manual && manual.trim().length > 0) return manual;

    const datos = this.projectFacade.obtenerDatos();
    const geoInfo = datos?.['geoInfo'] || {};
    const centroPoblado = geoInfo.DIST || '____';
    const distrito = geoInfo.DIST || '____';
    const provincia = geoInfo.PROV || '____';
    const departamento = geoInfo.DPTO || '____';

    return `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el ${centroPoblado}, capital distrital de la jurisdicción homónima, en la provincia de ${provincia}, en el departamento de ${departamento}. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, es la localidad de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`;
  }

  // ============================================================================

  /**
   * Genera texto AISD completo para vista
   */
  generarTextoAISDCompleto(params: { 
    comunidades: string; 
    distrito: string; 
    componente1?: string; 
    componente2?: string; 
    departamento?: string 
  }): string {
    const comunidades = params.comunidades || '____';
    const distrito = params.distrito || '____';
    const componente1 = params.componente1 || '____';
    const componente2 = params.componente2 || '____';
    const departamento = params.departamento || '____';

    const highlightClass = this.dataHighlightService.getInheritedClass();
    const manualClass = this.dataHighlightService.getManualClass();

    return `El Área de influencia social directa (AISD) se delimita en torno a la comunidad campesina (CC) <span class="${highlightClass}">${comunidades}</span>, cuya área comunal se encuentra predominantemente en el distrito de <span class="${highlightClass}">${distrito}</span> y en menor proporción en los distritos de <span class="${manualClass}">${componente1}</span> y de <span class="${manualClass}">${componente2}</span>, pertenecientes al departamento de <span class="${highlightClass}">${departamento}</span>. La delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales. Esta comunidad posee y gestiona las tierras donde se llevará a cabo la exploración minera, lo que implica una relación directa y significativa con el Proyecto. La titularidad de estas tierras establece un vínculo crucial con los pobladores locales, ya que cualquier actividad realizada en el área puede influir directamente sus derechos, usos y costumbres asociados a la tierra. Además, la gestión y administración de estos terrenos por parte de esta comunidad requiere una consideración detallada en la planificación y ejecución del Proyecto, asegurando que las operaciones se lleven a cabo con respeto a la estructura organizativa y normativa de la comunidad. Los impactos directos en la CC <span class="${highlightClass}">${comunidades}</span>, derivados del proyecto de exploración minera, incluyen la contratación de mano de obra local, la interacción con las costumbres y autoridades, y otros efectos socioeconómicos y culturales. La generación de empleo local no solo proporcionará oportunidades económicas inmediatas, sino que también fomentará el desarrollo de habilidades y capacidades en la población. La interacción constante con las autoridades y la comunidad promoverá un diálogo y una cooperación que son esenciales para el éxito del Proyecto, respetando y adaptándose a las prácticas y tradiciones locales. La consideración de estos factores en la delimitación del AISD garantiza que el Proyecto avance de manera inclusiva y sostenible, alineado con las expectativas y necesidades de la CC <span class="${highlightClass}">${comunidades}</span>.`;
  }

  /**
   * Obtiene texto de introducción de Sección 2
   */
  obtenerTextoSeccion2Introduccion(): string {
    const manual = this.projectFacade.obtenerDatos()?.['parrafoSeccion2_introduccion'];
    if (manual && manual.trim().length > 0) return manual;

    return `En términos generales, la delimitación del ámbito de estudio de las áreas de influencia social se hace tomando en consideración a los agentes e instancias sociales, individuales y/o colectivas, públicas y/o privadas, que tengan derechos o propiedad sobre el espacio o los recursos respecto de los cuales el proyecto de exploración minera tiene incidencia.\n\nAsimismo, el área de influencia social de un proyecto tiene en consideración a los grupos de interés que puedan ser potencialmente afectadas por el desarrollo de dicho proyecto (según La Guía de Relaciones Comunitarias de la DGAAM del MINEM, se denomina "grupos de interés" a aquellos grupos humanos que son impactados por dicho proyecto).\n\nEl criterio social para la delimitación de un área de influencia debe tener en cuenta la influencia que el Proyecto pudiera tener sobre el entorno social, que será o no ambientalmente impactado, considerando también la posibilidad de generar otro tipo de impactos, expectativas, intereses y/o demandas del entorno social.\n\nEn base a estos criterios se han identificado las áreas de influencia social directa e indirecta:`;
  }

  /**
   * Obtiene texto completo AISD
   */
  obtenerTextoSeccion2AISDCompleto(): string {
    const manual = this.projectFacade.obtenerDatos()?.['parrafoSeccion2_aisd_completo'];
    if (manual && manual.trim().length > 0) return manual;

    const comunidades = this.obtenerTextoComunidades();
    const datos = this.projectFacade.obtenerDatos();
    const geoInfo = datos?.['geoInfo'] || {};
    const distrito = geoInfo.DIST || '____';
    const departamento = geoInfo.DPTO || '____';
    const componente1 = datos?.['aisdComponente1'] || '____';
    const componente2 = datos?.['aisdComponente2'] || '____';

    return this.generarTextoAISDCompleto({ 
      comunidades, 
      distrito, 
      componente1, 
      componente2, 
      departamento 
    });
  }

  /**
   * Obtiene texto completo AISI
   */
  obtenerTextoSeccion2AISICompleto(): string {
    const manual = this.projectFacade.obtenerDatos()?.['parrafoSeccion2_aisi_completo'];
    if (manual && manual.trim().length > 0) return manual;

    const datos = this.projectFacade.obtenerDatos();
    const geoInfo = datos?.['geoInfo'] || {};
    const centroPoblado = geoInfo.DIST || '____';
    const distrito = geoInfo.DIST || '____';
    const provincia = geoInfo.PROV || '____';
    const departamento = geoInfo.DPTO || '____';

    const highlightClass = this.dataHighlightService.getInheritedClass();

    return `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el <span class="${highlightClass}">${centroPoblado}</span>, capital distrital de la jurisdicción homónima, en la provincia de <span class="${highlightClass}">${provincia}</span>, en el departamento de <span class="${highlightClass}">${departamento}</span>. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, es la localidad de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`;
  }

  /**
   * Formatea un párrafo con etiquetas HTML
   */
  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  protected override actualizarValoresConPrefijo(): void {
    // ✅ Implementación específica para sección 2
    // Actualizar valores que dependen de prefijos si es necesario
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.projectFacade.obtenerDatos();
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (valorActual !== valorAnterior) {
        hayCambios = true;
        this.datosAnteriores[campo] = valorActual;
      }
    }

    return hayCambios;
  }

  override onFieldChange(field: string, value: any, options?: { refresh?: boolean }): void {
    // ✅ Usar el sistema unificado de persistencia de BaseSectionComponent
    super.onFieldChange(field, value, options);
  }

  override onFotografiasChange(fotos: any[]): void {
    // ✅ Usar el sistema unificado de fotos
    super.onFotografiasChange(fotos);
  }

  // ✅ MÉTODO LLENAR DATOS DE PRUEBA
  llenarDatosPrueba(): void {
    const parrafoPrueba = `Los centros poblados ubicados en el área de influencia del proyecto presentan características sociodemográficas variadas. 
Se ha identificado la presencia de comunidades campesinas organizadas que mantienen prácticas tradicionales de gestión territorial.
El nivel de organización comunitaria es significativo, con presencia de autoridades locales reconocidas.`;

    this.onFieldChange('parrafoSeccion2_introduccion', parrafoPrueba, { refresh: false });
    this.onFieldChange('parrafoSeccion2_aisd_completo', 
      'El área de influencia social directa comprende los centros poblados donde el proyecto tendrá impacto directo sobre la población.', 
      { refresh: false });
    this.onFieldChange('parrafoSeccion2_aisi_completo', 
      'El área de influencia social indirecta comprende los distritos adyacentes que podrían recibir impactos indirectos.', 
      { refresh: false });

    this.onFieldChange('geoInfo', {
      DPTO: 'Arequipa',
      PROV: 'Caravelí', 
      DIST: 'Cahuacho'
    }, { refresh: false });
    
    this.modoFormulario = false;
    this.cdRef.detectChanges();
  }
}
