import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy, Injector, inject, ChangeDetectionStrategy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription, from } from 'rxjs';
import { LoadSeccion2UseCase, UpdateSeccion2DataUseCase, Seccion2ViewModel } from '../../../core/application/use-cases';
import { Seccion2Data, ComunidadCampesina, DistritoAISI } from '../../../core/domain/entities';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { Seccion2TextGeneratorService } from '../../../core/services/seccion2-text-generator.service';
import { MockDataService } from '../../../core/services/infrastructure/mock-data.service';
import { DataHighlightService } from '../../../core/services/data-highlight.service';
import { ProjectStateFacade } from '../../../core/state/project-state.facade';
import { BaseSectionComponent } from '../base-section.component';
import { ReactiveStateAdapter } from '../../../core/services/state-adapters/reactive-state-adapter.service';
import { UIStoreService, Selectors } from '../../../core/state/ui-store.contract';
import { 
  createJSONProcessingBatch, 
  validateJSONStructure, 
  getJSONStats,
  NormalizedJSONResult 
} from '../../../core/services/data/json-normalizer';

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
  
  // ✅ ACTIVAR SINCRONIZACIÓN REACTIVA PARA SINCRONIZACIÓN PERFECTA
  override useReactiveSync: boolean = true;
  
  override watchedFields: string[] = [
    'parrafoSeccion2_introduccion',
    'comunidadesCampesinas',
    'distritosAISI',
    'projectName',
    'departamentoSeleccionado',
    'provinciaSeleccionada',
    'distritoSeleccionado'
  ];

  viewModel$!: Observable<Seccion2ViewModel>;
  private subscriptions: Subscription[] = [];

  datosMock: any = {};
  
  fotografiasSeccion2: FotoItem[] = [];

  // Form data
  comunidadesCampesinas: ComunidadCampesina[] = [];
  distritosAISI: DistritoAISI[] = [];
  groupConfiguration = {
    selectedComunidades: [] as ComunidadCampesina[],
    selectedDistritos: [] as DistritoAISI[],
    groupName: '',
    description: ''
  };

  // ✅ Propiedades cacheadas para evitar llamadas repetidas en el template
  textoAISDFormateado: string = '';
  textoAISIFormateado: string = '';

  // Inyectar servicios necesarios
  private readonly loadSeccion2UseCase = this.injector.get(LoadSeccion2UseCase);
  private readonly updateSeccion2DataUseCase = this.injector.get(UpdateSeccion2DataUseCase);
  private readonly textGenerator = this.injector.get(Seccion2TextGeneratorService);
  private readonly mockDataService = this.injector.get(MockDataService);
  private readonly dataHighlightService = this.injector.get(DataHighlightService);
  private readonly stateAdapter = this.injector.get(ReactiveStateAdapter);
  private readonly store = this.injector.get(UIStoreService);

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector
  ) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void {
    // Inicializar datos desde datos guardados o por defecto
    this.inicializarDatosSeccion2();
    
    // ✅ Actualizar textos cacheados iniciales
    this.actualizarTextosCacheados();
  }

  override ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private inicializarDatosSeccion2(): void {
    // ✅ PASO 1: Obtener JSON cargado en Sección 1 desde el estado global
    const jsonCargado = this.projectFacade.obtenerDatos()?.['centrosPobladosJSON'];
    
    if (jsonCargado && Array.isArray(jsonCargado) && jsonCargado.length > 0) {
      // ✅ PASO 2: Parsear JSON para identificar AISD (KEYs) y AISI (DIST únicos)
      this.parsearJsonYGenerarGrupos(jsonCargado);
    } else {
      // Fallback a mock si no hay JSON
      const datosSubscription = from(this.mockDataService.getCapitulo3Datos()).subscribe(datos => {
        this.datosMock = datos;
        if (this.comunidadesCampesinas.length === 0) {
          this.comunidadesCampesinas = datos.datos.comunidadesCampesinas || [];
        }
        if (this.distritosAISI.length === 0) {
          this.distritosAISI = datos.datos.distritosAISI || [];
        }
        this.cdRef.detectChanges();
      });
      this.subscriptions.push(datosSubscription);
    }

    // También mantener el viewModel por compatibilidad
    this.viewModel$ = this.loadSeccion2UseCase.execute();
    const subscription = this.viewModel$.subscribe(viewModel => {
      const groupConfig = viewModel.data['groupConfiguration'];
      if (groupConfig) {
        this.groupConfiguration = {
          selectedComunidades: groupConfig.selectedComunidades || [],
          selectedDistritos: groupConfig.selectedDistritos || [],
          groupName: groupConfig.groupName || '',
          description: groupConfig.description || ''
        };
      }
      this.cdRef.detectChanges();
    });
    this.subscriptions.push(subscription);
  }

  // ✅ PARSEAR JSON Y GENERAR GRUPOS AUTOMÁTICAMENTE
  private parsearJsonYGenerarGrupos(jsonData: any): void {
    // ✅ IDENTIFICAR AISD (Comunidades Campesinas)
    // Si el JSON viene como estructura con KEYs, extraer los grupos
    let aisdGrupos: ComunidadCampesina[] = [];
    let todosLosCentrosPoblados: any[] = [];

    // Verificar si es JSON con estructura de KEYs (como {"CAHUACHO": [...], "CCPP SAN PEDRO": [...]})
    if (typeof jsonData === 'object' && !Array.isArray(jsonData)) {
      // Es un objeto con KEYs como nombres de grupos AISD
      let indiceA = 1;
      Object.keys(jsonData).forEach(keyAISD => {
        const centrosPoblados = jsonData[keyAISD];
        if (Array.isArray(centrosPoblados)) {
          aisdGrupos.push({
            id: `A.${indiceA}`,
            nombre: keyAISD,
            centrosPobladosSeleccionados: (centrosPoblados as any[]).map((cp: any) => cp.CCPP || cp.nombre || '')
          });
          todosLosCentrosPoblados = [...todosLosCentrosPoblados, ...centrosPoblados];
          indiceA++;
        }
      });
    } else if (Array.isArray(jsonData)) {
      // Es un array plano, agrupar por el primer centro poblado o por lógica propia
      todosLosCentrosPoblados = jsonData;
      // Crear un grupo AISD genérico
      aisdGrupos.push({
        id: 'A.1',
        nombre: this.projectFacade.obtenerDatos()?.['projectName'] || 'Grupo AISD 1',
        centrosPobladosSeleccionados: (jsonData as any[]).map((cp: any) => cp.CCPP || cp.nombre || '')
      });
    }

    // ✅ IDENTIFICAR AISI (Distritos) - Valores únicos de DIST
    const distritosUnicos = new Set<string>();
    todosLosCentrosPoblados.forEach((cp: any) => {
      if (cp.DIST) {
        distritosUnicos.add(cp.DIST);
      }
    });

    let aisiGrupos: DistritoAISI[] = [];
    let indiceB = 1;
    distritosUnicos.forEach(distrito => {
      const centrosPobladosDistrito = todosLosCentrosPoblados
        .filter((cp: any) => cp.DIST === distrito)
        .map((cp: any) => cp.CCPP || cp.nombre || '');
      
      aisiGrupos.push({
        id: `B.${indiceB}`,
        nombre: `Distrito ${distrito}`,
        centrosPobladosSeleccionados: centrosPobladosDistrito
      });
      indiceB++;
    });

    // ✅ ACTUALIZAR ESTADO LOCAL
    this.comunidadesCampesinas = aisdGrupos;
    this.distritosAISI = aisiGrupos;

    // ✅ GUARDAR EN ESTADO GLOBAL
    this.onFieldChange('comunidadesCampesinas', aisdGrupos, { refresh: false });
    this.onFieldChange('distritosAISI', aisiGrupos, { refresh: false });

    this.cdRef.detectChanges();
  }

  // ✅ AGREGAR NUEVO GRUPO AISD (Comunidad Campesina)
  agregarNuevaComidadCampesina(nombre: string, centrosPoblados: string[]): void {
    const nuevoId = `A.${this.comunidadesCampesinas.length + 1}`;
    const nuevoGrupo: ComunidadCampesina = {
      id: nuevoId,
      nombre: nombre,
      centrosPobladosSeleccionados: centrosPoblados
    };

    this.comunidadesCampesinas = [...this.comunidadesCampesinas, nuevoGrupo];
    this.onFieldChange('comunidadesCampesinas', this.comunidadesCampesinas, { refresh: false });
    this.cdRef.detectChanges();
  }

  // ✅ AGREGAR NUEVO GRUPO AISI (Distrito)
  agregarNuevoDistrito(nombre: string, centrosPoblados: string[]): void {
    const nuevoId = `B.${this.distritosAISI.length + 1}`;
    const nuevoGrupo: DistritoAISI = {
      id: nuevoId,
      nombre: nombre,
      centrosPobladosSeleccionados: centrosPoblados
    };

    this.distritosAISI = [...this.distritosAISI, nuevoGrupo];
    this.onFieldChange('distritosAISI', this.distritosAISI, { refresh: false });
    this.cdRef.detectChanges();
  }

  // ✅ OBTENER TODOS LOS CENTROS POBLADOS DISPONIBLES (del JSON)
  obtenerTodosCentrosPoblados(): string[] {
    const jsonCargado = this.projectFacade.obtenerDatos()?.['centrosPobladosJSON'];
    if (!jsonCargado) return [];

    const centrosPoblados = new Set<string>();
    
    if (typeof jsonCargado === 'object' && !Array.isArray(jsonCargado)) {
      Object.values(jsonCargado).forEach((items: any) => {
        if (Array.isArray(items)) {
          items.forEach((item: any) => {
            if (item.CCPP) {
              centrosPoblados.add(item.CCPP);
            }
          });
        }
      });
    } else if (Array.isArray(jsonCargado)) {
      jsonCargado.forEach((item: any) => {
        if (item.CCPP) {
          centrosPoblados.add(item.CCPP);
        }
      });
    }

    return Array.from(centrosPoblados);
  }

  protected override actualizarDatosCustom(): void {
    // ✅ Si hay datos actualizados, refrescar las comunidades y distritos
    this.inicializarDatosSeccion2();
    this.cargarFotografias();
    // ✅ Actualizar textos cacheados para evitar llamadas en el template
    this.actualizarTextosCacheados();
  }

  /**
   * Actualiza los textos cacheados para AISD y AISI
   * Evita llamadas repetidas a métodos en el template
   */
  private actualizarTextosCacheados(): void {
    const textoAISD = this.obtenerTextoSeccion2AISDCompleto();
    const textoAISI = this.obtenerTextoSeccion2AISICompleto();
    this.textoAISDFormateado = this.formatearParrafo(textoAISD);
    this.textoAISIFormateado = this.formatearParrafo(textoAISI);
  }

  protected override onChangesCustom(changes: SimpleChanges): void {
    if (changes['modoFormulario'] && !this.modoFormulario) {
      setTimeout(() => {
        this.cargarFotografias();
        this.actualizarTextosCacheados();
        this.cdRef.markForCheck();
      }, 0);
    }
  }

  private loadFotografias(): void {
    // ✅ Usar el sistema unificado de fotos de BaseSectionComponent
    this.cargarFotografias();
  }

  onComunidadesChange(comunidades: ComunidadCampesina[]): void {
    this.comunidadesCampesinas = comunidades;
    this.updateData();
  }

  onDistritosChange(distritos: DistritoAISI[]): void {
    this.distritosAISI = distritos;
    this.updateData();
  }

  onGroupConfigurationChange(config: any): void {
    this.groupConfiguration = config;
    this.updateData();
  }

  private updateData(): void {
    const updates: Partial<Seccion2Data> = {
      comunidadesCampesinas: this.comunidadesCampesinas,
      distritosAISI: this.distritosAISI,
      groupConfiguration: this.groupConfiguration
    };

    const subscription = this.updateSeccion2DataUseCase.execute(updates)
      .subscribe(() => {
        this.inicializarDatosSeccion2(); // Reload to get updated texts
      });
    this.subscriptions.push(subscription);
  }

  // Legacy methods for backward compatibility
  get datosSeccion2(): any {
    return {
      ...this.datosMock, // Include all mock data fields
      comunidadesCampesinas: this.comunidadesCampesinas,
      distritosAISI: this.distritosAISI,
      groupConfiguration: this.groupConfiguration
    };
  }

  // Compatibility methods for form wrappers
  obtenerCentrosPobladosSeleccionadosComunidad(id: string): string[] {
    const comunidad = this.comunidadesCampesinas.find(c => c.id === id);
    return comunidad?.centrosPobladosSeleccionados || [];
  }

  toggleCentroPobladoComunidad(id: string, codigo: string): void {
    // Implementation for compatibility
  }

  seleccionarTodosCentrosPobladosComunidad(id: string): void {
    // Implementation for compatibility
  }

  deseleccionarTodosCentrosPobladosComunidad(id: string): void {
    // Implementation for compatibility
  }

  onAutocompleteInput(field: string, value: string): void {
    // Implementation for compatibility
  }

  autocompleteData: any = {};

  onFocusDistritoAdicional(field: string): void {
    // Implementation for compatibility
  }

  cerrarSugerenciasAutocomplete(field: string): void {
    // Implementation for compatibility
  }

  seleccionarSugerencia(field: string, sugerencia: any): void {
    // Implementation for compatibility
  }

  toggleCentroPobladoDistrito(id: string, codigo: string): void {
    // Implementation for compatibility
  }

  seleccionarTodosCentrosPobladosDistrito(id: string): void {
    // Implementation for compatibility
  }

  deseleccionarTodosCentrosPobladosDistrito(id: string): void {
    // Implementation for compatibility
  }

  agregarDistritoAISI(): void {
    const nombreDistrito = `Distrito ${this.distritosAISI.length + 1}`;
    const nuevoDistrito: DistritoAISI = {
      id: `dist_${Date.now()}`,
      nombre: nombreDistrito,
      centrosPobladosSeleccionados: []
    };
    
    this.distritosAISI = [...this.distritosAISI, nuevoDistrito];
    
    // ✅ Registrar en ProjectStateFacade
    this.projectFacade.addGroup('AISI', nombreDistrito, null);
    
    this.updateData();
    this.cdRef.detectChanges();
  }

  eliminarDistritoAISI(id: string): void {
    const distrito = this.distritosAISI.find(d => d.id === id);
    
    if (distrito) {
      // ✅ Eliminar del ProjectStateFacade
      const groups = this.projectFacade.aisiGroups();
      const groupToRemove = groups.find(g => g.nombre === distrito.nombre);
      if (groupToRemove) {
        this.projectFacade.removeGroup('AISI', groupToRemove.id, true);
      }
    }
    
    this.distritosAISI = this.distritosAISI.filter(d => d.id !== id);
    this.updateData();
    this.cdRef.detectChanges();
  }

  actualizarNombreDistrito(id: string, nombre: string): void {
    const distrito = this.distritosAISI.find(d => d.id === id);
    if (distrito) {
      const nombreAnterior = distrito.nombre;
      distrito.nombre = nombre;
      
      // ✅ Actualizar en ProjectStateFacade
      const groups = this.projectFacade.aisiGroups();
      const groupToUpdate = groups.find(g => g.nombre === nombreAnterior);
      if (groupToUpdate) {
        this.projectFacade.renameGroup('AISI', groupToUpdate.id, nombre);
      }
    }
    this.updateData();
    this.cdRef.detectChanges();
  }

  eliminarComunidadCampesina(id: string): void {
    const comunidad = this.comunidadesCampesinas.find(c => c.id === id);
    
    if (comunidad) {
      // ✅ Eliminar del ProjectStateFacade
      const groups = this.projectFacade.aisdGroups();
      const groupToRemove = groups.find(g => g.nombre === comunidad.nombre);
      if (groupToRemove) {
        this.projectFacade.removeGroup('AISD', groupToRemove.id, true);
      }
    }
    
    this.comunidadesCampesinas = this.comunidadesCampesinas.filter(c => c.id !== id);
    this.updateData();
    this.cdRef.detectChanges();
  }

  agregarComunidadCampesina(): void {
    const nombreComunidad = `Comunidad Campesina ${this.comunidadesCampesinas.length + 1}`;
    const nuevaComunidad: ComunidadCampesina = {
      id: `cc_${Date.now()}`,
      nombre: nombreComunidad,
      centrosPobladosSeleccionados: []
    };
    
    this.comunidadesCampesinas = [...this.comunidadesCampesinas, nuevaComunidad];
    
    // ✅ Registrar en ProjectStateFacade
    this.projectFacade.addGroup('AISD', nombreComunidad, null);
    
    this.updateData();
    this.cdRef.detectChanges();
  }

  actualizarNombreComunidad(id: string, nombre: string): void {
    const comunidad = this.comunidadesCampesinas.find(c => c.id === id);
    if (comunidad) {
      const nombreAnterior = comunidad.nombre;
      comunidad.nombre = nombre;
      
      // ✅ Actualizar en ProjectStateFacade
      const groups = this.projectFacade.aisdGroups();
      const groupToUpdate = groups.find(g => g.nombre === nombreAnterior);
      if (groupToUpdate) {
        this.projectFacade.renameGroup('AISD', groupToUpdate.id, nombre);
      }
    }
    this.updateData();
    this.cdRef.detectChanges();
  }

  // Template methods for backward compatibility
  tieneUnaComunidad(): boolean {
    return this.comunidadesCampesinas.length === 1;
  }

  tieneMultiplesComunidades(): boolean {
    return this.comunidadesCampesinas.length > 1;
  }

  obtenerTextoComunidades(): string {
    return this.textGenerator.obtenerTextoComunidades(this.comunidadesCampesinas);
  }

  obtenerTextoComunidadesPosesion(): string {
    return this.textGenerator.obtenerTextoComunidadesPosesion(this.comunidadesCampesinas);
  }

  obtenerTextoComunidadesSingular(): string {
    return this.textGenerator.obtenerTextoComunidadesSingular(this.comunidadesCampesinas);
  }

  obtenerPrefijoCCImpactos(): string {
    return this.textGenerator.obtenerPrefijoCCImpactos(this.comunidadesCampesinas);
  }

  obtenerTextoComunidadesImpactos(): string {
    return this.textGenerator.obtenerTextoComunidadesImpactos(this.comunidadesCampesinas);
  }

  obtenerPrefijoCCFinal(): string {
    return this.textGenerator.obtenerPrefijoCCFinal(this.comunidadesCampesinas);
  }

  obtenerTextoComunidadesFinal(): string {
    return this.textGenerator.obtenerTextoComunidadesFinal(this.comunidadesCampesinas);
  }

  generarTextoAISDCompleto(params: { comunidades: string; distrito: string; componente1?: string; componente2?: string; departamento?: string }): string {
    const comunidades = params.comunidades || '____';
    const distrito = params.distrito || '____';
    const componente1 = params.componente1 || '____';
    const componente2 = params.componente2 || '____';
    const departamento = params.departamento || '____';

    const highlightClass = this.dataHighlightService.getInheritedClass();
    const manualClass = this.dataHighlightService.getManualClass();

    const texto = `El Área de influencia social directa (AISD) se delimita en torno a la comunidad campesina (CC) <span class="${highlightClass}">${comunidades}</span>, cuya área comunal se encuentra predominantemente en el distrito de <span class="${highlightClass}">${distrito}</span> y en menor proporción en los distritos de <span class="${manualClass}">${componente1}</span> y de <span class="${manualClass}">${componente2}</span>, pertenecientes al departamento de <span class="${highlightClass}">${departamento}</span>. La delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales. Esta comunidad posee y gestiona las tierras donde se llevará a cabo la exploración minera, lo que implica una relación directa y significativa con el Proyecto. La titularidad de estas tierras establece un vínculo crucial con los pobladores locales, ya que cualquier actividad realizada en el área puede influir directamente sus derechos, usos y costumbres asociados a la tierra. Además, la gestión y administración de estos terrenos por parte de esta comunidad requiere una consideración detallada en la planificación y ejecución del Proyecto, asegurando que las operaciones se lleven a cabo con respeto a la estructura organizativa y normativa de la comunidad. Los impactos directos en la CC <span class="${highlightClass}">${comunidades}</span>, derivados del proyecto de exploración minera, incluyen la contratación de mano de obra local, la interacción con las costumbres y autoridades, y otros efectos socioeconómicos y culturales. La generación de empleo local no solo proporcionará oportunidades económicas inmediatas, sino que también fomentará el desarrollo de habilidades y capacidades en la población. La interacción constante con las autoridades y la comunidad promoverá un diálogo y una cooperación que son esenciales para el éxito del Proyecto, respetando y adaptándose a las prácticas y tradiciones locales. La consideración de estos factores en la delimitación del AISD garantiza que el Proyecto avance de manera inclusiva y sostenible, alineado con las expectativas y necesidades de la CC <span class="${highlightClass}">${comunidades}</span>.`;

    return texto;
  }

  obtenerTextoSeccion2Introduccion(): string {
    const manual = this.projectFacade.obtenerDatos()?.['parrafoSeccion2_introduccion'];
    if (manual && manual.trim().length > 0) return manual;

    return `En términos generales, la delimitación del ámbito de estudio de las áreas de influencia social se hace tomando en consideración a los agentes e instancias sociales, individuales y/o colectivas, públicas y/o privadas, que tengan derechos o propiedad sobre el espacio o los recursos respecto de los cuales el proyecto de exploración minera tiene incidencia.\n\nAsimismo, el área de influencia social de un proyecto tiene en consideración a los grupos de interés que puedan ser potencialmente afectadas por el desarrollo de dicho proyecto (según La Guía de Relaciones Comunitarias de la DGAAM del MINEM, se denomina “grupos de interés” a aquellos grupos humanos que son impactados por dicho proyecto).\n\nEl criterio social para la delimitación de un área de influencia debe tener en cuenta la influencia que el Proyecto pudiera tener sobre el entorno social, que será o no ambientalmente impactado, considerando también la posibilidad de generar otro tipo de impactos, expectativas, intereses y/o demandas del entorno social.\n\nEn base a estos criterios se han identificado las áreas de influencia social directa e indirecta:`;
  }

  obtenerTextoSeccion2AISDCompleto(): string {
    const manual = this.projectFacade.obtenerDatos()?.['parrafoSeccion2_aisd_completo'];
    if (manual && manual.trim().length > 0) return manual;

    // Construir a partir de datos: usar la primera comunidad como representativa
    const comunidades = this.comunidadesCampesinas.map(c => c.nombre).join(', ') || '____';
    let distrito = (this['geoInfo'] && this['geoInfo'].DIST) || '____';
    if (distrito === '____' && this.comunidadesCampesinas.length > 0) {
      // intentar extraer del primer centro poblado
      const primeros = this.comunidadesCampesinas[0].centrosPobladosSeleccionados || [];
      distrito = primeros.length > 0 ? primeros[0] : distrito;
    }

    // intentar obtener componentes adicionales (otros distritos mencionados)
    const departamentos = new Set<string>();
    this.comunidadesCampesinas.forEach(cc => {
      (cc.centrosPobladosSeleccionados || []).forEach((cp: any) => {
        if (cp && cp.DEPTO) departamentos.add(cp.DEPTO);
      });
    });

    const departamento = departamentos.size > 0 ? Array.from(departamentos)[0] : (this['geoInfo']?.DPTO || '____');

    const comps = (this.comunidadesCampesinas.length > 1) ? this.comunidadesCampesinas.slice(1).map(c => c.nombre).slice(0,2) : [];
    const componente1 = comps[0] || '____';
    const componente2 = comps[1] || '____';

    return this.generarTextoAISDCompleto({ comunidades, distrito, componente1, componente2, departamento });
  }

  obtenerTextoSeccion2AISICompleto(): string {
    const manual = this.projectFacade.obtenerDatos()?.['parrafoSeccion2_aisi_completo'];
    if (manual && manual.trim().length > 0) return manual;

    const primerDistrito = this.distritosAISI.length > 0 ? this.distritosAISI[0] : null;
    const centroPoblado = primerDistrito && primerDistrito.centrosPobladosSeleccionados && primerDistrito.centrosPobladosSeleccionados.length > 0 ? primerDistrito.centrosPobladosSeleccionados[0] : (this['geoInfo']?.DIST || '____');
    const distrito = primerDistrito ? primerDistrito.nombre : (this['geoInfo']?.DIST || '____');
    const provincia = this['geoInfo']?.PROV || '____';
    const departamento = this['geoInfo']?.DPTO || '____';

    const highlightClass = this.dataHighlightService.getInheritedClass();

    const texto = `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el <span class="${highlightClass}">${centroPoblado}</span>, capital distrital de la jurisdicción homónima, en la provincia de <span class="${highlightClass}">${provincia}</span>, en el departamento de <span class="${highlightClass}">${departamento}</span>. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, es la localidad de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`;

    return texto;
  }

  protected override actualizarValoresConPrefijo(): void {
    // ✅ Implementación específica para sección 2
    // Actualizar valores que dependen de prefijos si es necesario
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
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

  imageUploadKey: number = 0;

  override onFotografiasChange(fotos: any[]): void {
    // ✅ Usar el sistema unificado de fotos
    super.onFotografiasChange(fotos);
  }

  // ✅ MÉTODO LLENAR DATOS DE PRUEBA - Patrón unificado como en Sección 1
  llenarDatosPrueba(): void {
    // ✅ CREAR JSON DE PRUEBA CON ESTRUCTURA CORRECTA
    // Los KEYs serán los nombres de grupos AISD
    // Cada item tendrá DIST para identificar AISI
    const centrosPobladosJSON = {
      'Comunidad Campesina Cahuacho': [
        { CCPP: 'Cahuacho Centro', DIST: 'Cahuacho', PROV: 'Caravelí', DEPT: 'Arequipa' },
        { CCPP: 'Pampacolca', DIST: 'Pampacolca', PROV: 'Caravelí', DEPT: 'Arequipa' }
      ],
      'Comunidad Campesina Ocoña': [
        { CCPP: 'Ocoña', DIST: 'Ocoña', PROV: 'Caravelí', DEPT: 'Arequipa' },
        { CCPP: 'Ocoña Centro', DIST: 'Ocoña', PROV: 'Caravelí', DEPT: 'Arequipa' }
      ],
      'Comunidad Campesina Atico': [
        { CCPP: 'Atico', DIST: 'Atico', PROV: 'Caravelí', DEPT: 'Arequipa' }
      ]
    };

    // ✅ GUARDAR JSON EN ESTADO GLOBAL PARA QUE SEA ACCESIBLE
    this.onFieldChange('centrosPobladosJSON', centrosPobladosJSON, { refresh: false });

    // ✅ PARSEAR Y GENERAR GRUPOS AUTOMÁTICAMENTE
    this.parsearJsonYGenerarGrupos(centrosPobladosJSON);

    // ✅ LLENAR PÁRRAFOS DE PRUEBA
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

    // ✅ LLENAR CAMPOS ADICIONALES
    const comunidadesJSON = centrosPobladosJSON;

    this.onFieldChange('centrosPobladosJSON', comunidadesJSON, { refresh: false });
    this.onFieldChange('geoInfo', {
      DPTO: 'Arequipa',
      PROV: 'Caravelí', 
      DIST: 'Cahuacho'
    }, { refresh: false });
    this.onFieldChange('jsonFileName', 'datos_prueba_seccion2.json', { refresh: false });
    
    this.modoFormulario = false;
    this.cdRef.detectChanges();
  }
}
