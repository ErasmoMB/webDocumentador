import { Component, ChangeDetectorRef, OnDestroy, Injector, ChangeDetectionStrategy, Signal, computed, effect, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DataHighlightService } from '../../directives/data-highlight.service';
import { FormChangeService } from '../../../core/services/state/form-change.service';
import { ProjectStateFacade } from '../../../core/state/project-state.facade';
import { BaseSectionComponent } from '../base-section.component';
import { GroupDefinition, CCPPEntry } from '../../../core/state/project-state.model';
import { SECCION2_WATCHED_FIELDS, SECCION2_CONFIG, SECCION2_TEMPLATES } from './seccion2-constants';

@Component({
  selector: 'app-seccion2-form',
  templateUrl: './seccion2-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ImageUploadComponent,
    CoreSharedModule
  ],
  standalone: true
})
export class Seccion2FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.2';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaSeccion2';
  override useReactiveSync: boolean = true;

  readonly SECCION2_TEMPLATES = SECCION2_TEMPLATES;

  fotografiasSeccion2: FotoItem[] = [];
  imageUploadKey: number = 0;

  // ✅ SEÑALES REACTIVAS CON AUTO-PERSIST (NUEVA ARQUITECTURA)
  readonly parrafoIntroduccion = this.createAutoSyncField<string>('parrafoSeccion2_introduccion', '');
  readonly parrafoAISD = this.createAutoSyncField<string>('parrafoSeccion2_aisd_completo', '');
  readonly parrafoAISI = this.createAutoSyncField<string>('parrafoSeccion2_aisi_completo', '');
  readonly geoInfoField = this.createAutoSyncField<any>('geoInfo', {});
  readonly aisdComponente1 = this.createAutoSyncField<string>('aisdComponente1', '');
  readonly aisdComponente2 = this.createAutoSyncField<string>('aisdComponente2', '');
  readonly comunidadesCampesinasField = this.createAutoSyncField<any[]>('comunidadesCampesinas', []);
  readonly distritosAISIField = this.createAutoSyncField<any[]>('distritosAISI', []);

  // ✅ aisiGroups ahora viene de BaseSectionComponent (con override)
  override readonly aisiGroups: Signal<readonly GroupDefinition[]> = this.projectFacade.groupsByType('AISI');

  readonly comunidadesNombres: Signal<string[]> = computed(() => 
    this.aisdGroups().map(g => g.nombre)
  );

  readonly distritosNombres: Signal<string[]> = computed(() => 
    this.aisiGroups().map(g => g.nombre)
  );

  // ✅ NUEVO: Signal para ubicación global (desde metadata)
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

  readonly textoAISDFormateado: Signal<SafeHtml> = computed(() => {
    // ✅ CRÍTICO: Leer explícitamente signals para registrar dependencias
    this.aisdGroups();
    this.comunidadesNombres();
    this.ubicacionGlobal(); // ✅ DEPENDENCIA CRÍTICA: ubicación global (departamento, distrito)
    const grupos = this.aisdGroups();
    const texto = this.obtenerTextoSeccion2AISDCompleto();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly textoAISIFormateado: Signal<SafeHtml> = computed(() => {
    // ✅ CRÍTICO: Leer explícitamente signals para registrar dependencias
    this.aisiGroups();
    this.distritosNombres();
    const grupos = this.aisiGroups();
    const texto = this.obtenerTextoSeccion2AISICompleto();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo`;
      const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente`;
      const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen`;
      
      const titulo = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, imagenKey)();
      
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  private readonly dataHighlightService = this.injector.get(DataHighlightService);
  private readonly formChangeService = this.injector.get(FormChangeService);

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);
    
    // ✅ Inicializar campos desde store
    this.inicializarCamposDesdeStore();
    
    // ✅ CRÍTICO: Effect para sincronización de nombres de AISD/AISI con textos formateados
    effect(() => {
      this.aisdGroups();
      this.aisiGroups();
      this.ubicacionGlobal(); // ✅ DEPENDENCIA CRÍTICA: cambios en ubicación deben triggerear la actualización
      this.comunidadesNombres();
      this.distritosNombres();
      this.textoAISDFormateado();
      this.textoAISIFormateado();
      this.allPopulatedCenters();
      this.cdRef.markForCheck();
    });
  }

  /**
   * ✅ Inicializa campos desde el store o usa valores por defecto
   */
  private inicializarCamposDesdeStore(): void {
    // Párrafos: usar fallback si no hay dato guardado
    const parrafoIntro = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion2_introduccion')() || this.obtenerTextoSeccion2Introduccion();
    this.parrafoIntroduccion.update(parrafoIntro);
    
    const parrafoAISDValor = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion2_aisd_completo')() || this.obtenerTextoSeccion2AISDParaEdicion();
    this.parrafoAISD.update(parrafoAISDValor);
    
    const parrafoAISIValor = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion2_aisi_completo')() || this.obtenerTextoSeccion2AISIParaEdicion();
    this.parrafoAISI.update(parrafoAISIValor);
    
    // Geo info - LEER DE SECCIÓN 1 (3.1.1)
    const geoInfo = this.projectFacade.selectField('3.1.1', null, 'geoInfo')();
    if (geoInfo) this.geoInfoField.update(geoInfo);
    
    // Componentes AISD
    const comp1 = this.projectFacade.selectField(this.seccionId, null, 'aisdComponente1')();
    if (comp1) this.aisdComponente1.update(comp1);
    
    const comp2 = this.projectFacade.selectField(this.seccionId, null, 'aisdComponente2')();
    if (comp2) this.aisdComponente2.update(comp2);
    
    // Grupos (si ya existen)
    const comunidades = this.projectFacade.selectField(this.seccionId, null, 'comunidadesCampesinas')();
    if (comunidades && comunidades.length > 0) {
      this.comunidadesCampesinasField.update(comunidades);
    }
    
    const distritos = this.projectFacade.selectField(this.seccionId, null, 'distritosAISI')();
    if (distritos && distritos.length > 0) {
      this.distritosAISIField.update(distritos);
    }
  }

  /**
   * Log interno para mostrar grupo en consola
   */
  private logGrupoParaConsola(tipo: 'AISD' | 'AISI', numeroGrupo: number, grupo: GroupDefinition): void {
    // Log method - empty
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected override actualizarDatosCustom(): void {
    this.cdRef.markForCheck();
  }

  agregarComunidadCampesina(): void {
    const nombre = `Comunidad Campesina ${this.aisdGroups().length + 1}`;
    this.projectFacade.addGroup('AISD', nombre, null);
    this.cdRef.markForCheck();
  }

  eliminarComunidadCampesina(id: string): void {
    this.projectFacade.removeGroup('AISD', id, true);
    this.cdRef.markForCheck();
  }

  actualizarNombreComunidad(id: string, nombre: string): void {
    this.projectFacade.renameGroup('AISD', id, nombre);
    this.cdRef.markForCheck();
  }

  agregarDistritoAISI(): void {
    const nombre = `Distrito ${this.aisiGroups().length + 1}`;
    this.projectFacade.addGroup('AISI', nombre, null);
    this.cdRef.markForCheck();
  }

  eliminarDistritoAISI(id: string): void {
    this.projectFacade.removeGroup('AISI', id, true);
    this.cdRef.markForCheck();
  }

  actualizarNombreDistrito(id: string, nombre: string): void {
    this.projectFacade.renameGroup('AISI', id, nombre);
    this.cdRef.markForCheck();
  }

  addCCPPToComunidad(communityId: string, ccppId: string): void {
    this.projectFacade.dispatch({
      type: 'groupConfig/addCCPPToGroup',
      payload: { tipo: 'AISD', groupId: communityId, ccppId }
    });
    
    // ✅ FORZAR persistencia de comunidadesCampesinas después del dispatch
    this.persistirComunidadesCampesinas();
    this.cdRef.markForCheck();
  }

  removeCCPPFromComunidad(communityId: string, ccppId: string): void {
    this.projectFacade.dispatch({
      type: 'groupConfig/removeCCPPFromGroup',
      payload: { tipo: 'AISD', groupId: communityId, ccppId }
    });
    
    // ✅ FORZAR persistencia de comunidadesCampesinas después del dispatch
    this.persistirComunidadesCampesinas();
    this.cdRef.markForCheck();
  }

  addCCPPToDistrito(districtId: string, ccppId: string): void {
    this.projectFacade.dispatch({
      type: 'groupConfig/addCCPPToGroup',
      payload: { tipo: 'AISI', groupId: districtId, ccppId }
    });
    
    // ✅ FORZAR persistencia de distritosAISI después del dispatch
    this.persistirDistritosAISI();
    this.cdRef.markForCheck();
  }

  removeCCPPFromDistrito(districtId: string, ccppId: string): void {
    this.projectFacade.dispatch({
      type: 'groupConfig/removeCCPPFromGroup',
      payload: { tipo: 'AISI', groupId: districtId, ccppId }
    });
    
    // ✅ FORZAR persistencia de distritosAISI después del dispatch
    this.persistirDistritosAISI();
    this.cdRef.markForCheck();
  }

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

  estaCentroPobladoSeleccionadoComunidad(id: string, codigo: string): boolean {
    const grupo = this.aisdGroups().find(g => g.id === id);
    if (!grupo) return false;
    const codigoNormalizado = codigo?.toString().trim() || '';
    return grupo.ccppIds.includes(codigoNormalizado);
  }

  estaCentroPobladoSeleccionadoDistrito(id: string, codigo: string): boolean {
    const grupo = this.aisiGroups().find(g => g.id === id);
    if (!grupo) return false;
    const codigoNormalizado = codigo?.toString().trim() || '';
    return grupo.ccppIds.includes(codigoNormalizado);
  }

  seleccionarTodosCentrosPobladosComunidad(id: string): void {
    const grupo = this.aisdGroups().find(g => g.id === id);
    const codigos = this.allPopulatedCenters().map(c => String(c.codigo));
    
    this.projectFacade.dispatch({
      type: 'groupConfig/setGroupCCPP',
      payload: { tipo: 'AISD', groupId: id, ccppIds: codigos }
    });
    
    // ✅ FORZAR persistencia de comunidadesCampesinas después del dispatch
    this.persistirComunidadesCampesinas();
    this.cdRef.markForCheck();
  }

  deseleccionarTodosCentrosPobladosComunidad(id: string): void {
    this.projectFacade.dispatch({
      type: 'groupConfig/setGroupCCPP',
      payload: { tipo: 'AISD', groupId: id, ccppIds: [] }
    });
    
    // ✅ FORZAR persistencia de comunidadesCampesinas después del dispatch
    this.persistirComunidadesCampesinas();
    this.cdRef.markForCheck();
  }

  seleccionarTodosCentrosPobladosDistrito(id: string): void {
    const codigos = this.allPopulatedCenters().map(c => String(c.codigo));
    
    this.projectFacade.dispatch({
      type: 'groupConfig/setGroupCCPP',
      payload: { tipo: 'AISI', groupId: id, ccppIds: codigos }
    });
    
    // ✅ FORZAR persistencia de distritosAISI después del dispatch
    this.persistirDistritosAISI();
    this.cdRef.markForCheck();
  }

  deseleccionarTodosCentrosPobladosDistrito(id: string): void {
    this.projectFacade.dispatch({
      type: 'groupConfig/setGroupCCPP',
      payload: { tipo: 'AISI', groupId: id, ccppIds: [] }
    });
    
    // ✅ FORZAR persistencia de distritosAISI después del dispatch
    this.persistirDistritosAISI();
    this.cdRef.markForCheck();
  }

  obtenerCentrosPobladosSeleccionadosComunidad(id: string): string[] {
    const grupo = this.aisdGroups().find(g => g.id === id);
    return grupo?.ccppIds as string[] || [];
  }

  obtenerTodosCentrosPoblados(): CCPPEntry[] {
    return this.allPopulatedCenters() as CCPPEntry[];
  }

  tieneUnaComunidad(): boolean {
    return this.aisdGroups().length === 1;
  }

  tieneMultiplesComunidades(): boolean {
    return this.aisdGroups().length > 1;
  }

  obtenerTextoComunidades(): string {
    const nombres = this.comunidadesNombres();
    if (nombres.length === 0) return '____';
    if (nombres.length === 1) return nombres[0];
    if (nombres.length === 2) return `${nombres[0]} y ${nombres[1]}`;
    return nombres.slice(0, -1).join(', ') + ' y ' + nombres[nombres.length - 1];
  }

  obtenerTextoComunidadesSingular(): string {
    return this.tieneUnaComunidad() ? 'comunidad campesina' : 'comunidades campesinas';
  }

  obtenerTextoComunidadesPosesion(): string {
    return this.tieneUnaComunidad() ? 'su' : 'sus';
  }

  obtenerPrefijoCCImpactos(): string {
    return this.tieneUnaComunidad() ? 'la CC' : 'las CC';
  }

  obtenerTextoComunidadesImpactos(): string {
    return this.obtenerTextoComunidades();
  }

  obtenerPrefijoCCFinal(): string {
    return this.tieneUnaComunidad() ? 'la CC' : 'las CC';
  }

  obtenerTextoComunidadesFinal(): string {
    return this.obtenerTextoComunidades();
  }

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

    // ✅ USAR TEMPLATE EN LUGAR DE HARDCODING
    return SECCION2_TEMPLATES.textoAISDTemplate
      .replace(/{{comunidades}}/g, comunidades)
      .replace(/{{distrito}}/g, distrito)
      .replace(/{{componente1}}/g, componente1)
      .replace(/{{componente2}}/g, componente2)
      .replace(/{{departamento}}/g, departamento);
  }

  obtenerTextoSeccion2AISDParaEdicion(): string {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion2_aisd_completo')();
    if (manual && manual.trim().length > 0) return manual;

    const comunidades = this.obtenerTextoComunidades();
    // ✅ REFACTOR: Usar ubicacionGlobal en lugar de geoInfo
    const ubicacion = this.projectFacade.ubicacionGlobal();
    const distrito = ubicacion.distrito || '____';
    const departamento = ubicacion.departamento || '____';
    const provincia = ubicacion.provincia || '____';
    const componente1 = this.projectFacade.selectField(this.seccionId, null, 'aisdComponente1')() || '____';
    const componente2 = this.projectFacade.selectField(this.seccionId, null, 'aisdComponente2')() || '____';

    return this.generarTextoAISDSinHTML({ 
      comunidades, 
      distrito, 
      componente1, 
      componente2, 
      departamento 
    });
  }

  obtenerTextoSeccion2AISIParaEdicion(): string {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion2_aisi_completo')();
    if (manual && manual.trim().length > 0) return manual;

    // ✅ REFACTOR: Usar ubicacionGlobal en lugar de geoInfo
    const ubicacion = this.projectFacade.ubicacionGlobal();
    const provincia = ubicacion.provincia || '____';
    const departamento = ubicacion.departamento || '____';
    const distrito = ubicacion.distrito || '____';

    // ✅ USAR TEMPLATE EN LUGAR DE HARDCODING
    return SECCION2_TEMPLATES.textoAISITemplate
      .replace(/{{distrito}}/g, distrito)
      .replace(/{{provincia}}/g, provincia)
      .replace(/{{departamento}}/g, departamento);
  }

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
    
    const comunidadesClass = comunidades !== '____' 
      ? `${manualClass} has-data` 
      : highlightClass;

    // ✅ USAR TEMPLATE EN LUGAR DE HARDCODING
    const textoBase = SECCION2_TEMPLATES.textoAISDTemplate
      .replace('{{comunidades}}', `<span class="${comunidadesClass}">${comunidades}</span>`)
      .replace(/{{distrito}}/g, `<span class="${highlightClass}">${distrito}</span>`)
      .replace(/{{componente1}}/g, `<span class="${manualClass}">${componente1}</span>`)
      .replace(/{{componente2}}/g, `<span class="${manualClass}">${componente2}</span>`)
      .replace(/{{departamento}}/g, `<span class="${highlightClass}">${departamento}</span>`);

    return textoBase;
  }

  obtenerTextoSeccion2Introduccion(): string {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion2_introduccion')();
    if (manual && manual.trim().length > 0) return manual;

    return SECCION2_TEMPLATES.introduccionDefault;
  }

  obtenerTextoSeccion2AISDCompleto(): string {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion2_aisd_completo')();
    if (manual && manual.trim().length > 0) return manual;

    const comunidades = this.obtenerTextoComunidades();
    // ✅ REFACTOR: Usar ubicacionGlobal en lugar de geoInfo
    const ubicacion = this.projectFacade.ubicacionGlobal();
    const distrito = ubicacion.distrito || '____';
    const departamento = ubicacion.departamento || '____';
    const componente1 = this.projectFacade.selectField(this.seccionId, null, 'aisdComponente1')() || '____';
    const componente2 = this.projectFacade.selectField(this.seccionId, null, 'aisdComponente2')() || '____';

    return this.generarTextoAISDCompleto({ 
      comunidades, 
      distrito, 
      componente1, 
      componente2, 
      departamento 
    });
  }

  obtenerTextoSeccion2AISICompleto(): string {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion2_aisi_completo')();
    if (manual && manual.trim().length > 0) return manual;

    const gruposAISI = this.aisiGroups();
    const distritosNombres = gruposAISI
      .map(g => g.nombre?.trim())
      .filter(nombre => nombre && nombre !== '' && nombre !== 'Distrito');

    const geoInfo = this.projectFacade.selectField('3.1.1', null, 'geoInfo')() || {};
    const provincia = geoInfo.PROV || '____';
    const departamento = geoInfo.DPTO || '____';

    const highlightClass = this.dataHighlightService.getInheritedClass();
    const manualClass = this.dataHighlightService.getManualClass();

    let textoDistritos = '____';
    if (distritosNombres.length === 1) {
      textoDistritos = distritosNombres[0];
    } else if (distritosNombres.length === 2) {
      textoDistritos = `${distritosNombres[0]} y ${distritosNombres[1]}`;
    } else if (distritosNombres.length > 2) {
      const ultimo = distritosNombres[distritosNombres.length - 1];
      const anteriores = distritosNombres.slice(0, -1).join(', ');
      textoDistritos = `${anteriores} y ${ultimo}`;
    }

    const distritosClass = distritosNombres.length > 0 
      ? `${manualClass} has-data`
      : highlightClass;

    if (distritosNombres.length === 1) {
      return `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el <span class="${distritosClass}">${textoDistritos}</span>, capital distrital de la jurisdicción homónima, en la provincia de <span class="${highlightClass}">${provincia}</span>, en el departamento de <span class="${highlightClass}">${departamento}</span>. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, es la localidad de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`;
    } else if (distritosNombres.length > 1) {
      return `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por los distritos de <span class="${distritosClass}">${textoDistritos}</span>, capitales distritales de sus respectivas jurisdicciones, en la provincia de <span class="${highlightClass}">${provincia}</span>, en el departamento de <span class="${highlightClass}">${departamento}</span>. Esta delimitación se debe a que estas localidades son los centros políticos de las jurisdicciones donde se ubica el Proyecto, así como al hecho de que mantienen una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, son las localidades de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`;
    }

    return `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el <span class="${highlightClass}">____</span>, capital distrital de la jurisdicción homónima, en la provincia de <span class="${highlightClass}">${provincia}</span>, en el departamento de <span class="${highlightClass}">${departamento}</span>. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, es la localidad de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`;
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  llenarDatosPrueba(): void {
    const parrafoPrueba = `Los centros poblados ubicados en el área de influencia del proyecto presentan características sociodemográficas variadas. 
Se ha identificado la presencia de comunidades campesinas organizadas que mantienen prácticas tradicionales de gestión territorial.
El nivel de organización comunitaria es significativo, con presencia de autoridades locales reconocidas.`;

    // ✅ USAR SEÑALES DIRECTAMENTE
    this.parrafoIntroduccion.update(parrafoPrueba);
    this.parrafoAISD.update('El área de influencia social directa comprende los centros poblados donde el proyecto tendrá impacto directo sobre la población.');
    this.parrafoAISI.update('El área de influencia social indirecta comprende los distritos adyacentes que podrían recibir impactos indirectos.');
    this.geoInfoField.update({
      DPTO: 'Arequipa',
      PROV: 'Caravelí', 
      DIST: 'Cahuacho'
    });
    
    this.modoFormulario = false;
    this.cdRef.detectChanges();
  }

  trackByComunidadId(index: number, comunidad: GroupDefinition): string {
    return comunidad.id;
  }

  trackByDistritoId(index: number, distrito: GroupDefinition): string {
    return distrito.id;
  }

  /**
   * ✅ Persiste distritosAISI en localStorage después de cambios
   */
  private persistirDistritosAISI(): void {
    const gruposAISI = this.aisiGroups();
    const distritosParaPersistir = gruposAISI.map(g => ({
      id: g.id,
      nombre: g.nombre,
      centrosPobladosSeleccionados: g.ccppIds || []
    }));
    

    
    this.formChangeService.persistFields('3.1.2', 'form', {
      distritosAISI: distritosParaPersistir
    });
    

  }

  /**
   * ✅ Persiste comunidadesCampesinas en localStorage después de cambios
   */
  private persistirComunidadesCampesinas(): void {
    const gruposAISD = this.aisdGroups();
    const comunidadesParaPersistir = gruposAISD.map(g => ({
      id: g.id,
      nombre: g.nombre,
      centrosPobladosSeleccionados: g.ccppIds || []
    }));
    

    
    this.formChangeService.persistFields('3.1.2', 'form', {
      comunidadesCampesinas: comunidadesParaPersistir
    });
    

  }
}