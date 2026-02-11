import { Component, ChangeDetectorRef, OnDestroy, Injector, ChangeDetectionStrategy, Signal, computed, effect, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DataHighlightService } from '../../../core/services/data-highlight.service';
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

  fotografiasSeccion2: FotoItem[] = [];
  imageUploadKey: number = 0;

  // ✅ aisiGroups ahora viene de BaseSectionComponent (con override)
  override readonly aisiGroups: Signal<readonly GroupDefinition[]> = this.projectFacade.groupsByType('AISI');

  readonly comunidadesNombres: Signal<string[]> = computed(() => 
    this.aisdGroups().map(g => g.nombre)
  );

  readonly distritosNombres: Signal<string[]> = computed(() => 
    this.aisiGroups().map(g => g.nombre)
  );

  readonly textoAISDFormateado: Signal<SafeHtml> = computed(() => {
    const grupos = this.aisdGroups();
    const texto = this.obtenerTextoSeccion2AISDCompleto();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly textoAISIFormateado: Signal<SafeHtml> = computed(() => {
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
    
    effect(() => {
      this.aisdGroups();
      this.aisiGroups();
      this.allPopulatedCenters();
      this.cdRef.markForCheck();
    });

    effect(() => {
      const gruposAISD = this.aisdGroups();
      const comunidadesParaPersistir = gruposAISD.map(g => ({
        id: g.id,
        nombre: g.nombre,
        centrosPobladosSeleccionados: g.ccppIds || []
      }));
      this.formChangeService.persistFields('3.1.2', 'form', {
        comunidadesCampesinas: comunidadesParaPersistir
      });
    });

    effect(() => {
      const gruposAISI = this.aisiGroups();
      const distritosParaPersistir = gruposAISI.map(g => ({
        id: g.id,
        nombre: g.nombre,
        centrosPobladosSeleccionados: g.ccppIds || []
      }));
      
      console.debug(`[SECCION2-DEBUG] 🔄 EFFECT EJECUTADO | grupos: ${gruposAISI.length}`);
      console.debug(`[SECCION2-DEBUG]   B.1: ${gruposAISI[0]?.nombre} | CCPPs: ${gruposAISI[0]?.ccppIds?.length || 0}`);
      console.debug(`[SECCION2-DEBUG]   B.2: ${gruposAISI[1]?.nombre} | CCPPs: ${gruposAISI[1]?.ccppIds?.length || 0}`);
      
      // Persistir solo si hay datos
      if (distritosParaPersistir.length > 0) {
        this.formChangeService.persistFields('3.1.2', 'form', {
          distritosAISI: distritosParaPersistir
        });
        console.debug(`[SECCION2-DEBUG] ✅ distritosAISI persistido`);
      }
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    });

    // ✅ Log automático de grupos cargados
    effect(() => {
      const gruposAISD = this.aisdGroups();
      const gruposAISI = this.aisiGroups();
      
      // Log solo si hay grupos cargados
      if (gruposAISD.length > 0 || gruposAISI.length > 0) {
        console.log('%c=== GRUPOS CARGADOS EN SECCIÓN 2 ===', 'color: #1f2937; background: #f3f4f6; font-weight: bold; padding: 4px 8px; border-radius: 3px');
        
        if (gruposAISD.length > 0) {
          gruposAISD.forEach((grupo, index) => {
            this.logGrupoParaConsola('AISD', index + 1, grupo);
          });
        }
        
        if (gruposAISI.length > 0) {
          gruposAISI.forEach((grupo, index) => {
            this.logGrupoParaConsola('AISI', index + 1, grupo);
          });
        }
      }
    });
  }

  /**
   * Log interno para mostrar grupo en consola
   */
  private logGrupoParaConsola(tipo: 'AISD' | 'AISI', numeroGrupo: number, grupo: GroupDefinition): void {
    const icono = tipo === 'AISD' ? '🏘️' : '🗺️';
    const color = tipo === 'AISD' ? '#2563eb' : '#dc2626';
    const prefijo = tipo === 'AISD' ? 'A' : 'B';
    
    console.log(`%c${icono} GRUPO ${tipo}: ${prefijo}.${numeroGrupo} - ${grupo.nombre || 'Sin nombre'}`, `color: ${color}; font-weight: bold; font-size: 13px`);
    console.log(`%cCentros Poblados (CCPP):`, `color: ${color === '#2563eb' ? '#7c3aed' : '#b91c1c'}; font-weight: bold`);
    
    const centrosPobladosSeleccionados = grupo.ccppIds || [];
    console.log(`[DEBUG] centrosPobladosSeleccionados (${centrosPobladosSeleccionados.length}):`, centrosPobladosSeleccionados);
    
    if (centrosPobladosSeleccionados.length === 0) {
      console.log('  (Sin centros poblados asignados)');
      return;
    }
    
    const jsonCompleto = this.projectFacade.obtenerDatos()['jsonCompleto'] || {};
    const centrosDetalles: any[] = [];
    
    centrosPobladosSeleccionados.forEach((codigo: any) => {
      Object.keys(jsonCompleto).forEach((grupoKey: string) => {
        const grupoData = jsonCompleto[grupoKey];
        if (Array.isArray(grupoData)) {
          const centro = grupoData.find((c: any) => {
            const codigoCentro = String(c.CODIGO || '').trim();
            const codigoBuscado = String(codigo).trim();
            return codigoCentro === codigoBuscado;
          });
          if (centro && !centrosDetalles.find(c => c.CODIGO === centro.CODIGO)) {
            centrosDetalles.push(centro);
          }
        }
      });
    });
    
    if (centrosDetalles.length > 0) {
      centrosDetalles.forEach((cp: any, index: number) => {
        const nombre = cp.CCPP || cp.nombre || `CCPP ${index + 1}`;
        console.log(`  ${index + 1}. ${nombre} (Código: ${cp.CODIGO})`);
      });
    }
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
    console.log(`✅ Comunidad AISD: ${nombre}`);
    this.cdRef.markForCheck();
  }

  eliminarComunidadCampesina(id: string): void {
    this.projectFacade.removeGroup('AISD', id, true);
    console.log(`❌ Comunidad AISD eliminada: ${id}`);
    this.cdRef.markForCheck();
  }

  actualizarNombreComunidad(id: string, nombre: string): void {
    this.projectFacade.renameGroup('AISD', id, nombre);
    this.cdRef.markForCheck();
  }

  agregarDistritoAISI(): void {
    const nombre = `Distrito ${this.aisiGroups().length + 1}`;
    this.projectFacade.addGroup('AISI', nombre, null);
    console.log(`✅ Distrito AISI: ${nombre}`);
    this.cdRef.markForCheck();
  }

  eliminarDistritoAISI(id: string): void {
    this.projectFacade.removeGroup('AISI', id, true);
    console.log(`❌ Distrito AISI eliminado: ${id}`);
    this.cdRef.markForCheck();
  }

  actualizarNombreDistrito(id: string, nombre: string): void {
    this.projectFacade.renameGroup('AISI', id, nombre);
    this.cdRef.markForCheck();
  }

  addCCPPToComunidad(communityId: string, ccppId: string): void {
    console.debug(`[SECCION2-DEBUG] 📤 dispatch groupConfig/addCCPPToGroup | tipo: AISD | groupId: ${communityId} | ccppId: ${ccppId}`);
    
    this.projectFacade.dispatch({
      type: 'groupConfig/addCCPPToGroup',
      payload: { tipo: 'AISD', groupId: communityId, ccppId }
    });
    
    // ✅ FORZAR persistencia de comunidadesCampesinas después del dispatch
    this.persistirComunidadesCampesinas();
    
    console.debug(`[SECCION2-DEBUG] ✅ dispatch completado`);
    this.cdRef.markForCheck();
  }

  removeCCPPFromComunidad(communityId: string, ccppId: string): void {
    console.debug(`[SECCION2-DEBUG] 📤 dispatch groupConfig/removeCCPPFromGroup | tipo: AISD | groupId: ${communityId} | ccppId: ${ccppId}`);
    
    this.projectFacade.dispatch({
      type: 'groupConfig/removeCCPPFromGroup',
      payload: { tipo: 'AISD', groupId: communityId, ccppId }
    });
    
    // ✅ FORZAR persistencia de comunidadesCampesinas después del dispatch
    this.persistirComunidadesCampesinas();
    
    console.debug(`[SECCION2-DEBUG] ✅ dispatch completado`);
    this.cdRef.markForCheck();
  }

  addCCPPToDistrito(districtId: string, ccppId: string): void {
    console.debug(`[SECCION2-DEBUG] 📤 dispatch groupConfig/addCCPPToGroup | tipo: AISI | groupId: ${districtId} | ccppId: ${ccppId}`);
    
    this.projectFacade.dispatch({
      type: 'groupConfig/addCCPPToGroup',
      payload: { tipo: 'AISI', groupId: districtId, ccppId }
    });
    
    // ✅ FORZAR persistencia de distritosAISI después del dispatch
    this.persistirDistritosAISI();
    
    console.debug(`[SECCION2-DEBUG] ✅ dispatch completado`);
    this.cdRef.markForCheck();
  }

  removeCCPPFromDistrito(districtId: string, ccppId: string): void {
    console.debug(`[SECCION2-DEBUG] 📤 dispatch groupConfig/removeCCPPFromGroup | tipo: AISI | groupId: ${districtId} | ccppId: ${ccppId}`);
    
    this.projectFacade.dispatch({
      type: 'groupConfig/removeCCPPFromGroup',
      payload: { tipo: 'AISI', groupId: districtId, ccppId }
    });
    
    // ✅ FORZAR persistencia de distritosAISI después del dispatch
    this.persistirDistritosAISI();
    
    console.debug(`[SECCION2-DEBUG] ✅ dispatch completado`);
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
    console.debug(`[SECCION2-DEBUG] 🔄 toggleCentroPobladoDistrito | id: ${id} | codigo: ${codigoNormalizado} | existe: ${existe}`);
    
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
    const numeroGrupo = grupo ? (this.aisdGroups().indexOf(grupo) + 1) : '?';
    const nombreGrupo = grupo?.nombre || '?';
    const codigos = this.allPopulatedCenters().map(c => String(c.codigo));
    
    console.debug(`[SECCION2-DEBUG] 📤 dispatch setGroupCCPP (seleccionar todos) | AISD A.${numeroGrupo} | ccppIds: ${codigos.length}`);
    
    this.projectFacade.dispatch({
      type: 'groupConfig/setGroupCCPP',
      payload: { tipo: 'AISD', groupId: id, ccppIds: codigos }
    });
    
    // ✅ FORZAR persistencia de comunidadesCampesinas después del dispatch
    this.persistirComunidadesCampesinas();
    
    console.log(`✅ Seleccionados ${codigos.length} centros poblados en AISD A.${numeroGrupo} - ${nombreGrupo}`);
    this.cdRef.markForCheck();
  }

  deseleccionarTodosCentrosPobladosComunidad(id: string): void {
    const grupo = this.aisdGroups().find(g => g.id === id);
    const numeroGrupo = grupo ? (this.aisdGroups().indexOf(grupo) + 1) : '?';
    const nombreGrupo = grupo?.nombre || '?';
    
    console.debug(`[SECCION2-DEBUG] 📤 dispatch setGroupCCPP (deseleccionar todos) | AISD A.${numeroGrupo} | ccppIds: []`);
    
    this.projectFacade.dispatch({
      type: 'groupConfig/setGroupCCPP',
      payload: { tipo: 'AISD', groupId: id, ccppIds: [] }
    });
    
    // ✅ FORZAR persistencia de comunidadesCampesinas después del dispatch
    this.persistirComunidadesCampesinas();
    
    console.log(`❌ Deseleccionados todos los centros poblados en AISD A.${numeroGrupo} - ${nombreGrupo}`);
    this.cdRef.markForCheck();
  }

  seleccionarTodosCentrosPobladosDistrito(id: string): void {
    const grupo = this.aisiGroups().find(g => g.id === id);
    const numeroGrupo = grupo ? (this.aisiGroups().indexOf(grupo) + 1) : '?';
    const nombreGrupo = grupo?.nombre || '?';
    const codigos = this.allPopulatedCenters().map(c => String(c.codigo));
    
    console.debug(`[SECCION2-DEBUG] 📤 dispatch setGroupCCPP (seleccionar todos) | AISI B.${numeroGrupo} | ccppIds: ${codigos.length}`);
    
    this.projectFacade.dispatch({
      type: 'groupConfig/setGroupCCPP',
      payload: { tipo: 'AISI', groupId: id, ccppIds: codigos }
    });
    
    // ✅ FORZAR persistencia de distritosAISI después del dispatch
    this.persistirDistritosAISI();
    
    this.cdRef.markForCheck();
  }

  deseleccionarTodosCentrosPobladosDistrito(id: string): void {
    const grupo = this.aisiGroups().find(g => g.id === id);
    const numeroGrupo = grupo ? (this.aisiGroups().indexOf(grupo) + 1) : '?';
    const nombreGrupo = grupo?.nombre || '?';
    
    console.debug(`[SECCION2-DEBUG] 📤 dispatch setGroupCCPP (deseleccionar todos) | AISI B.${numeroGrupo} | ccppIds: []`);
    
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

    return `El Área de influencia social directa (AISD) se delimita en torno a la comunidad campesina (CC) ${comunidades}, cuya área comunal se encuentra predominantemente en el distrito de ${distrito} y en menor proporción en los distritos de ${componente1} y de ${componente2}, pertenecientes al departamento de ${departamento}. La delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales. Esta comunidad posee y gestiona las tierras donde se llevará a cabo la exploración minera, lo que implica una relación directa y significativa con el Proyecto. La titularidad de estas tierras establece un vínculo crucial con los pobladores locales, ya que cualquier actividad realizada en el área puede influir directamente sus derechos, usos y costumbres asociados a la tierra. Además, la gestión y administración de estos terrenos por parte de esta comunidad requiere una consideración detallada en la planificación y ejecución del Proyecto, asegurando que las operaciones se lleven a cabo con respeto a la estructura organizativa y normativa de la comunidad. Los impactos directos en la CC ${comunidades}, derivados del proyecto de exploración minera, incluyen la contratación de mano de obra local, la interacción con las costumbres y autoridades, y otros efectos socioeconómicos y culturales. La generación de empleo local no solo proporcionará oportunidades económicas inmediatas, sino que también fomentará el desarrollo de habilidades y capacidades en la población. La interacción constante con las autoridades y la comunidad promoverá un diálogo y una cooperación que son esenciales para el éxito del Proyecto, respetando y adaptándose a las prácticas y tradiciones locales. La consideración de estos factores en la delimitación del AISD garantiza que el Proyecto avance de manera inclusiva y sostenible, alineado con las expectativas y necesidades de la CC ${comunidades}.`;
  }

  obtenerTextoSeccion2AISDParaEdicion(): string {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion2_aisd_completo')();
    if (manual && manual.trim().length > 0) return manual;

    const comunidades = this.obtenerTextoComunidades();
    const geoInfo = this.projectFacade.selectField(this.seccionId, null, 'geoInfo')() || {};
    const distrito = geoInfo.DIST || '____';
    const departamento = geoInfo.DPTO || '____';
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

    const geoInfo = this.projectFacade.selectField(this.seccionId, null, 'geoInfo')() || {};
    const provincia = geoInfo.PROV || '____';
    const departamento = geoInfo.DPTO || '____';

    return `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el ${geoInfo.DIST || '____'}, capital distrital de la jurisdicción homónima, en la provincia de ${provincia}, en el departamento de ${departamento}. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, es la localidad de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`;
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

    return `El Área de influencia social directa (AISD) se delimita en torno a la comunidad campesina (CC) <span class="${comunidadesClass}">${comunidades}</span>, cuya área comunal se encuentra predominantemente en el distrito de <span class="${highlightClass}">${distrito}</span> y en menor proporción en los distritos de <span class="${manualClass}">${componente1}</span> y de <span class="${manualClass}">${componente2}</span>, pertenecientes al departamento de <span class="${highlightClass}">${departamento}</span>. La delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales. Esta comunidad posee y gestiona las tierras donde se llevará a cabo la exploración minera, lo que implica una relación directa y significativa con el Proyecto. La titularidad de estas tierras establece un vínculo crucial con los pobladores locales, ya que cualquier actividad realizada en el área puede influir directamente sus derechos, usos y costumbres asociados a la tierra. Además, la gestión y administración de estos terrenos por parte de esta comunidad requiere una consideración detallada en la planificación y ejecución del Proyecto, asegurando que las operaciones se lleven a cabo con respeto a la estructura organizativa y normativa de la comunidad. Los impactos directos en la CC <span class="${comunidadesClass}">${comunidades}</span>, derivados del proyecto de exploración minera, incluyen la contratación de mano de obra local, la interacción con las costumbres y autoridades, y otros efectos socioeconómicos y culturales. La generación de empleo local no solo proporcionará oportunidades económicas inmediatas, sino que también fomentará el desarrollo de habilidades y capacidades en la población. La interacción constante con las autoridades y la comunidad promoverá un diálogo y una cooperación que son esenciales para el éxito del Proyecto, respetando y adaptándose a las prácticas y tradiciones locales. La consideración de estos factores en la delimitación del AISD garantiza que el Proyecto avance de manera inclusiva y sostenible, alineado con las expectativas y necesidades de la CC <span class="${comunidadesClass}">${comunidades}</span>.`;
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
    const geoInfo = this.projectFacade.selectField(this.seccionId, null, 'geoInfo')() || {};
    const distrito = geoInfo.DIST || '____';
    const departamento = geoInfo.DPTO || '____';
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

    const geoInfo = this.projectFacade.selectField(this.seccionId, null, 'geoInfo')() || {};
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
    
    console.debug(`[SECCION2-DEBUG] 💾 persistirDistritosAISI | grupos: ${gruposAISI.length}`);
    console.debug(`[SECCION2-DEBUG]   B.1: ${gruposAISI[0]?.nombre} | CCPPs: ${gruposAISI[0]?.ccppIds?.length || 0}`);
    console.debug(`[SECCION2-DEBUG]   B.2: ${gruposAISI[1]?.nombre} | CCPPs: ${gruposAISI[1]?.ccppIds?.length || 0}`);
    
    this.formChangeService.persistFields('3.1.2', 'form', {
      distritosAISI: distritosParaPersistir
    });
    
    console.debug(`[SECCION2-DEBUG] ✅ distritosAISI persistido`);
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
    
    console.debug(`[SECCION2-DEBUG] 💾 persistirComunidadesCampesinas | grupos: ${gruposAISD.length}`);
    
    this.formChangeService.persistFields('3.1.2', 'form', {
      comunidadesCampesinas: comunidadesParaPersistir
    });
    
    console.debug(`[SECCION2-DEBUG] ✅ comunidadesCampesinas persistido`);
  }
}