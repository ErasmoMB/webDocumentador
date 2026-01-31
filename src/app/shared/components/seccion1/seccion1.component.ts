import { Component, OnDestroy, Input, SimpleChanges, OnInit, ChangeDetectionStrategy, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextNormalizationService } from 'src/app/core/services/text-normalization.service';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { DataOrchestratorService } from 'src/app/core/services/orchestration/data-orchestrator.service';
import { GruposService } from 'src/app/core/services/domain/grupos.service';
import { ChangeDetectorRef } from '@angular/core';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';
import { from } from 'rxjs';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { GenericImageComponent } from '../generic-image/generic-image.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DataSourceDirective } from '../../directives/data-source.directive';
import { DataHighlightDirective } from '../../directives/data-highlight.directive';
import { TableNumberDirective } from '../../directives/table-number.directive';
import { PhotoNumberDirective } from '../../directives/photo-number.directive';
import { MockDataService } from '../../../core/services/infrastructure/mock-data.service';
// ProjectState Integration
import { UIStoreService, Selectors } from 'src/app/core/state/ui-store.contract';
import { 
  createJSONProcessingBatch, 
  validateJSONStructure, 
  getJSONStats,
  NormalizedJSONResult 
} from 'src/app/core/services/data/json-normalizer';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion1',
    templateUrl: './seccion1.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion1Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.1';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaSeccion1';
  
  // ✅ ACTIVAR SINCRONIZACIÓN REACTIVA PARA SINCRONIZACIÓN PERFECTA
  override useReactiveSync: boolean = true;
  
  fotografiasSeccion1: FotoItem[] = [];
  private subscription?: Subscription;
  private stateSubscription?: Subscription;
  private subscriptions: Subscription[] = [];

  datosMock: any = {};
  
  // ✅ Array de objetivos dinámicos
  objetivos: string[] = [];
  
  // Objetivos por defecto
  private readonly objetivoDefault1 = 'Describir los aspectos demográficos, sociales, económicos, culturales y políticos que caracterizan a las poblaciones de las áreas de influencia social del proyecto de exploración minera {projectName}.';
  private readonly objetivoDefault2 = 'Brindar información básica de los poblados comprendidos en el área de influencia social donde se realizará el Proyecto que sirvan de base para poder determinar los posibles impactos sociales a originarse en esta primera etapa de exploración y, por ende, prevenir, reducir o mitigar las consecuencias negativas y potenciar las positivas.';
  
  override watchedFields: string[] = [
    'parrafoSeccion1_principal',
    'parrafoSeccion1_4',
    'objetivosSeccion1',
    'projectName',
    'distritoSeleccionado',
    'provinciaSeleccionada',
    'departamentoSeleccionado'
  ];

  // Último nombre de proyecto conocido (fallback estable)
  private lastProjectName: string | null = null;

  constructor(
    private textNormalization: TextNormalizationService,
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private stateAdapter: ReactiveStateAdapter,
    private orchestrator: DataOrchestratorService,
    private mockDataService: MockDataService,
    private store: UIStoreService
  ) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void {
    // ✅ NO cargar mock data automáticamente - los datos vienen de persistencia
    // this.loadData(); -- Desactivado para evitar sobrescribir datos persistidos
    
    // Inicializar objetivos desde datos guardados o por defecto
    this.inicializarObjetivos();
    // Inicializar lastProjectName desde datos si existe
    if (this.datos && this.datos.projectName) {
      this.lastProjectName = this.datos.projectName;
    }
    
    if (!this.modoFormulario) {
      // Suscripción más prudente: solo sincroniza lo que realmente cambió
      this.stateSubscription = this.stateAdapter.datos$.subscribe((datos: any) => {
        console.debug('[Seccion1] stateAdapter.datos$ -> recibidos datos:', datos && { projectName: datos.projectName, objetivosSeccion1: datos.objetivosSeccion1, parrafo: datos.parrafoSeccion1_principal });
        if (!datos) return;

        // Si los objetivos en persistencia difieren de los locales, sincronizarlos
        const objetivosPersistidos = datos.objetivosSeccion1;
        if (objetivosPersistidos && Array.isArray(objetivosPersistidos)) {
          const sonDiferentes = objetivosPersistidos.length !== this.objetivos.length ||
            objetivosPersistidos.some((o: string, i: number) => o !== this.objetivos[i]);
          if (sonDiferentes) {
              this.objetivos = [...objetivosPersistidos];
              this.datos.objetivosSeccion1 = [...objetivosPersistidos];
              console.debug('[Seccion1] sincronizados objetivos desde datos persistidos:', this.objetivos);
            }
        }

          // Actualizar fallback estable del nombre del proyecto
          if (datos.projectName) {
            this.lastProjectName = datos.projectName;
            console.debug('[Seccion1] lastProjectName actualizado:', this.lastProjectName);
          }

          // Si cambió el nombre del proyecto, o campos principales, refrescar todos los datos
        if (datos.projectName !== this.datos.projectName || datos.distritoSeleccionado !== this.datos.distritoSeleccionado || datos.provinciaSeleccionada !== this.datos.provinciaSeleccionada || datos.departamentoSeleccionado !== this.datos.departamentoSeleccionado) {
          this.actualizarDatos();
        }

        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  private inicializarObjetivos(): void {
    console.debug('[Seccion1] inicializarObjetivos - datos actuales:', { projectName: this.datos.projectName, objetivos: this.datos.objetivosSeccion1 });
    // Primero verificar si hay objetivos guardados como array
    if (this.datos.objetivosSeccion1 && Array.isArray(this.datos.objetivosSeccion1) && this.datos.objetivosSeccion1.length > 0) {
      this.objetivos = [...this.datos.objetivosSeccion1];
      console.debug('[Seccion1] inicializarObjetivos - usando objetivos desde this.datos:', this.objetivos);
      return;
    }
    
    // Migrar desde campos antiguos si existen
    const objetivosLegacy: string[] = [];
    if (this.datos.objetivoSeccion1_1) {
      objetivosLegacy.push(this.datos.objetivoSeccion1_1);
    }
    if (this.datos.objetivoSeccion1_2) {
      objetivosLegacy.push(this.datos.objetivoSeccion1_2);
    }
    
    if (objetivosLegacy.length > 0) {
      this.objetivos = objetivosLegacy;
      // Guardar en nuevo formato
      this.onFieldChange('objetivosSeccion1', this.objetivos);
      return;
    }
    
    // Si no hay datos, usar objetivos por defecto
    if (this.objetivos.length === 0) {
      this.objetivos = [
        this.getObjetivoDefault(0),
        this.getObjetivoDefault(1)
      ];
      console.debug('[Seccion1] inicializarObjetivos - usando objetivos por defecto:', this.objetivos);
    }
  }

  private getObjetivoDefault(index: number): string {
    const proyecto = this.lastProjectName || this.datos.projectName || '____';
    const proyectoNormalizado = this.textNormalization.normalizarNombreProyecto(proyecto, false);
    
    if (index === 0) {
      return this.objetivoDefault1.replace('{projectName}', proyectoNormalizado);
    }
    return this.objetivoDefault2;
  }

  agregarObjetivo(): void {
    // ✅ IMPORTANTE: Sincronizar PRIMERO desde datos persistidos antes de modificar
    this.sincronizarObjetivosDesdeData();
    
    this.objetivos = [...this.objetivos, ''];
    this.guardarObjetivos();
    // ✅ Usar setTimeout para evitar interferencias con otros bindings
    setTimeout(() => this.cdRef.detectChanges(), 0);
  }

  eliminarObjetivo(index: number): void {
    if (this.objetivos.length > 1) {
      // ✅ IMPORTANTE: Sincronizar PRIMERO desde datos persistidos antes de modificar
      this.sincronizarObjetivosDesdeData();
      
      this.objetivos = this.objetivos.filter((_, i) => i !== index);
      this.guardarObjetivos();
      // ✅ Usar setTimeout para evitar interferencias con otros bindings
      setTimeout(() => this.cdRef.detectChanges(), 0);
    }
  }

  // ✅ Solo actualiza el valor local, NO guarda (para evitar lag al escribir)
  actualizarObjetivo(index: number, valor: string): void {
    if (index >= 0 && index < this.objetivos.length) {
      this.objetivos[index] = valor;
      // NO llamar a guardarObjetivos() aquí - se hará on blur
    }
  }

  // ✅ Guardar cuando el usuario sale del campo (blur)
  guardarObjetivoOnBlur(): void {
    this.guardarObjetivos();
    // ✅ Usar setTimeout para evitar interferencias con otros bindings
    setTimeout(() => this.cdRef.detectChanges(), 0);
  }

  // ✅ TrackBy más estable para evitar problemas de re-renderizado
  trackByIndex(index: number, item: string): string {
    return `${index}-${item?.substring(0, 10) || 'empty'}`;
  }

  private guardarObjetivos(): void {
    // ✅ Crear copia profunda de los objetivos actuales
    const objetivosACopiar = this.objetivos.map(o => o);

    // ✅ Guardar en el estado SIN refresh para evitar que actualizarDatos() sobrescriba
    // los cambios locales con datos potencialmente desactualizados del facade
    this.onFieldChange('objetivosSeccion1', objetivosACopiar, { refresh: false });

    // ✅ NO sincronizar inmediatamente con this.datos para evitar interferencias
    // con otros campos del formulario. Dejar que el sistema de persistencia maneje esto.
  }

  getObjetivosParaVista(): string[] {
    // Priorizar el array local `this.objetivos` si tiene contenido válido.
    // Esto evita que la vista muestre valores por defecto cuando hay una breve
    // desincronización entre persistencia y estado local al agregar/eliminar.
    if (this.objetivos && Array.isArray(this.objetivos)) {
      const objetivosNoVaciosLocal = this.objetivos.filter((o: string) => o && o.trim() !== '');
      if (objetivosNoVaciosLocal.length > 0) {
        // Reemplazar placeholders '____' por el nombre de proyecto disponible
        const proyecto = this.datos.projectName || this.lastProjectName || '____';
        return objetivosNoVaciosLocal.map(o => (o || '').replace(/____/g, proyecto));
      }
    }

    // Si no hay array local, usar datos persistidos
    if (this.datos.objetivosSeccion1 && Array.isArray(this.datos.objetivosSeccion1) && this.datos.objetivosSeccion1.length > 0) {
      return (this.datos.objetivosSeccion1 as string[]).filter((o: string) => o && o.trim() !== '');
    }
    
    // Compatibilidad con formato antiguo
    const objetivos: string[] = [];
    if (this.datos.objetivoSeccion1_1) {
      objetivos.push(this.datos.objetivoSeccion1_1);
    } else {
      objetivos.push(this.getObjetivoDefault(0));
    }
    if (this.datos.objetivoSeccion1_2) {
      objetivos.push(this.datos.objetivoSeccion1_2);
    } else {
      objetivos.push(this.getObjetivoDefault(1));
    }
    
    return objetivos;
  }

  formatearObjetivo(objetivo: string): string {
    if (!objetivo) return '';
    // Resaltar el nombre del proyecto si aparece
    const proyecto = this.datos.projectName;
    if (proyecto && objetivo.includes(proyecto)) {
      return objetivo.replace(
        proyecto, 
        `<span class="data-manual has-data">${proyecto}</span>`
      );
    }
    return objetivo;
  }

  private loadData(): void {
    // ✅ Este método ahora solo se usa para el botón "Llenar Datos"
    // NO se ejecuta automáticamente al iniciar
    const datosSubscription = from(this.mockDataService.getCapitulo3Datos()).subscribe(datos => {
      this.datosMock = datos;
      this.cdRef.detectChanges();
    });
    this.subscriptions.push(datosSubscription);
  }

  override ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
    super.ngOnDestroy();
  }

  protected override onChangesCustom(changes: SimpleChanges): void {
    if (changes['modoFormulario'] && !this.modoFormulario) {
      setTimeout(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.projectFacade.obtenerDatos();
    let hayCambios = false;
    let necesitaRecargar = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (valorActual !== valorAnterior) {
        hayCambios = true;
        this.datosAnteriores[campo] = valorActual;
        
        if (campo === 'distritoSeleccionado' || campo === 'provinciaSeleccionada' || campo === 'departamentoSeleccionado') {
          necesitaRecargar = true;
        }
      }
    }

    if (necesitaRecargar && hayCambios) {
      this.loadSectionData();
    }

    return hayCambios;
  }

  protected override actualizarValoresConPrefijo(): void {
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = (this.datos as any)[campo] || null;
    });
  }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
    
    // ✅ Sincronizar objetivos desde datos persistidos cuando cambian los datos
    // Esto es importante cuando se usa "Llenar Datos" desde la página principal
    this.sincronizarObjetivosDesdeData();
  }

  /**
   * Sincroniza el array local `this.objetivos` con los datos persistidos
   * Lee directamente del projectFacade para obtener los datos más recientes
   */
  private sincronizarObjetivosDesdeData(): void {
    // ✅ Leer datos frescos directamente del projectFacade (fuente de verdad)
    const datosFrescos = this.projectFacade.obtenerDatos();
    const objetivosGuardados = datosFrescos['objetivosSeccion1'];
    
    if (objetivosGuardados && Array.isArray(objetivosGuardados) && objetivosGuardados.length > 0) {
      // Verificar si los objetivos son diferentes
      const sonDiferentes = objetivosGuardados.length !== this.objetivos.length ||
        objetivosGuardados.some((obj: string, i: number) => obj !== this.objetivos[i]);
      
      if (sonDiferentes) {
        this.objetivos = [...objetivosGuardados];
        // También actualizar this.datos para mantener consistencia
        this.datos.objetivosSeccion1 = [...objetivosGuardados];
      }
    }
  }

  override getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
    return this.fieldMapping.getDataSourceType(fieldName);
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  normalizarNombreProyecto(texto: string | undefined | null, conArticulo: boolean = true): string {
    return this.textNormalization.normalizarNombreProyecto(texto, conArticulo);
  }

  capitalizarTexto(texto: string): string {
    return this.textNormalization.capitalizarTexto(texto);
  }

  obtenerTextoParrafoPrincipal(): string {
    if (this.datos.parrafoSeccion1_principal) {
      return this.datos.parrafoSeccion1_principal;
    }
    
    const proyecto = this.datos.projectName || '____';
    const distrito = this.datos.distritoSeleccionado || '____';
    const provincia = this.datos.provinciaSeleccionada || '____';
    const departamento = this.datos.departamentoSeleccionado || '____';
    
    return `Este componente realiza una caracterización de los aspectos socioeconómicos, culturales y antropológicos del área de influencia social del proyecto ${proyecto}, como un patrón de referencia inicial en base a la cual se pueda medir los impactos sobre la población del entorno directo del Proyecto.\n\nEl proyecto ${proyecto} se encuentra ubicado en el distrito de ${distrito}, en la provincia de ${provincia}, en el departamento de ${departamento}, bajo la administración del Gobierno Regional de ${departamento}, en el sur del Perú.\n\nEste estudio se elabora de acuerdo con el Reglamento de la Ley del Sistema Nacional de Evaluación de Impacto Ambiental, los Términos de Referencia comunes para actividades de exploración minera y la Guía de Relaciones Comunitarias del Ministerio de Energía y Minas (MINEM).`;
  }

  obtenerTextoIntroduccionObjetivos(): string {
    if (this.datos.parrafoSeccion1_4) {
      return this.datos.parrafoSeccion1_4;
    }
    
    return 'Los objetivos de la presente línea de base social (LBS) son los siguientes:';
  }

  onJSONFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const jsonContent = JSON.parse(e.target.result);
        
        // ===== FASE 1: ProjectState como fuente PRIMARIA =====
        // Validar estructura JSON antes de procesar
        const validation = validateJSONStructure(jsonContent);
        if (!validation.valid) {
          console.warn('[Seccion1] JSON validation failed:', validation.error);
          alert(validation.error || 'Error al procesar el archivo JSON. Verifique el formato.');
          return;
        }

        // Crear BatchCommand para ProjectState
        const { batch, result } = createJSONProcessingBatch(jsonContent, {
          fileName: file.name,
          transactionId: `json_upload_${Date.now()}`
        });

        if (batch) {
          // DISPATCH al ProjectState (FUENTE PRIMARIA)
          this.store.dispatch(batch);
          
          // ✅ CRÍTICO: Inicializar árbol de secciones después de cargar JSON
          // Esto genera las secciones dinámicas a.1, a.2, b.1, b.2 etc.
          this.projectFacade.initializeSectionsTree();
          
          const stats = getJSONStats(result);
          console.log(`[Seccion1] JSON procesado via ProjectState: ${stats.totalCCPP} CCPP, ${stats.totalGroups} grupos (Formato ${stats.format})`);
        }

        // ===== FALLBACK: Legacy para compatibilidad temporal =====
        // Mantener sync con legacy hasta que toda la UI migre
        const { data, geoInfo, fileName, comunidadesCampesinas, jsonCompleto } = this.procesarJSONLegacy(jsonContent, file.name, result);
        
        // Persistir centros poblados usando onFieldChange (que internamente usa projectFacade)
        this.onFieldChange('centrosPobladosJSON', data);
        this.onFieldChange('jsonCompleto', jsonCompleto);
        this.onFieldChange('geoInfo', geoInfo);
        this.onFieldChange('jsonFileName', fileName);
        
        if (comunidadesCampesinas && comunidadesCampesinas.length > 0) {
          this.onFieldChange('comunidadesCampesinas', comunidadesCampesinas);
        }
        
        if (geoInfo.DPTO) {
          this.onFieldChange('departamentoSeleccionado', geoInfo.DPTO);
        }
        if (geoInfo.PROV) {
          this.onFieldChange('provinciaSeleccionada', geoInfo.PROV);
        }
        if (geoInfo.DIST) {
          this.onFieldChange('distritoSeleccionado', geoInfo.DIST);
        }
        
        this.actualizarDatos();
        this.cdRef.detectChanges();
        
      } catch (error) {
        console.error('[Seccion1] Error processing JSON:', error);
        alert('Error al procesar el archivo JSON. Verifique el formato.');
      }
    };
    
    reader.readAsText(file);
  }

  /**
   * Procesa JSON para sistema legacy (fallback temporal)
   * @deprecated Usar ProjectState como fuente primaria
   */
  private procesarJSONLegacy(
    jsonContent: any, 
    fileName: string,
    normalizedResult?: NormalizedJSONResult
  ): { 
    data: any[], 
    geoInfo: any, 
    fileName: string, 
    comunidadesCampesinas?: any[],
    jsonCompleto?: any
  } {
    // Si tenemos resultado normalizado, usar esos datos
    if (normalizedResult && normalizedResult.format !== 'unknown') {
      const data = normalizedResult.rawData as any[];
      const geoInfo = {
        DPTO: normalizedResult.ubicacion.departamento,
        PROV: normalizedResult.ubicacion.provincia,
        DIST: normalizedResult.ubicacion.distrito
      };
      const comunidadesCampesinas = normalizedResult.groups.map(g => ({
        id: g.id,
        nombre: g.nombre,
        centrosPobladosSeleccionados: [...g.ccppIds]
      }));
      
      return {
        data,
        geoInfo,
        fileName,
        comunidadesCampesinas: comunidadesCampesinas.length > 0 ? comunidadesCampesinas : undefined,
        jsonCompleto: jsonContent
      };
    }
    
    // Fallback: procesar con método legacy original cuando no hay resultado normalizado
    return this.procesarJSONFallback(jsonContent, fileName);
  }

  /**
   * Método legacy para procesar JSON (fallback cuando normalizer falla)
   */
  private procesarJSONFallback(jsonContent: any, fileName: string): { 
    data: any[], 
    geoInfo: any, 
    fileName: string, 
    comunidadesCampesinas?: any[],
    jsonCompleto?: any
  } {
    let centrosPoblados: any[] = [];
    let geoInfo: any = {};
    let comunidadesCampesinas: any[] = [];
    let jsonCompleto: any = null;
    
    if (Array.isArray(jsonContent)) {
      centrosPoblados = jsonContent;
      jsonCompleto = jsonContent;
    } else if (typeof jsonContent === 'object') {
      jsonCompleto = jsonContent;
      const keys = Object.keys(jsonContent);
      
      if (keys.length > 0) {
        for (const grupoKey of keys) {
          const grupoData = jsonContent[grupoKey];
          
          if (Array.isArray(grupoData)) {
            const centrosGrupo = grupoData;
            centrosPoblados = centrosPoblados.concat(centrosGrupo);
            
            const codigosGrupo = centrosGrupo
              .map((cp: any) => {
                const codigo = cp.CODIGO;
                if (codigo === null || codigo === undefined) return '';
                return codigo.toString().trim();
              })
              .filter((codigo: string) => codigo !== '');
            
            let nombreComunidad = grupoKey;
            if (nombreComunidad.toUpperCase().startsWith('CCPP ')) {
              nombreComunidad = nombreComunidad.substring(5).trim();
            }
            
            const comunidadId = `cc_${nombreComunidad.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
            comunidadesCampesinas.push({
              id: comunidadId,
              nombre: nombreComunidad,
              centrosPobladosSeleccionados: codigosGrupo
            });
          }
        }
      }
    }
    
    if (centrosPoblados.length > 0) {
      const primer = centrosPoblados[0];
      if (primer.DPTO) geoInfo.DPTO = primer.DPTO;
      if (primer.PROV) geoInfo.PROV = primer.PROV;
      if (primer.DIST) geoInfo.DIST = primer.DIST;
    }
    
    return { 
      data: centrosPoblados, 
      geoInfo, 
      fileName, 
      comunidadesCampesinas: comunidadesCampesinas.length > 0 ? comunidadesCampesinas : undefined,
      jsonCompleto
    };
  }

  selectJSONFile() {
    const fileInput = document.getElementById('jsonFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  llenarDatosPrueba() {
    const datosPrueba = {
      projectName: 'Paka',
      departamentoSeleccionado: 'Arequipa',
      provinciaSeleccionada: 'Caravelí',
      distritoSeleccionado: 'Cahuacho'
    };
    
    Object.keys(datosPrueba).forEach(key => {
      this.onFieldChange(key as any, (datosPrueba as any)[key]);
    });
    
    const jsonPrueba = [
      {
        "ITEM": 1,
        "UBIGEO": 40306,
        "CODIGO": 403060001,
        "CCPP": "Cahuacho",
        "CATEGORIA": "Capital distrital",
        "POBLACION": 160,
        "DPTO": "Arequipa",
        "PROV": "Caravelí",
        "DIST": "Cahuacho",
        "ESTE": 663078,
        "NORTE": 8285498,
        "ALTITUD": 3423
      }
    ];
    
    // FASE 1: Procesar via ProjectState primero
    const { batch, result } = createJSONProcessingBatch(jsonPrueba, {
      fileName: 'datos_prueba.json',
      transactionId: 'test_data_fill'
    });
    
    if (batch) {
      this.store.dispatch(batch);
      console.log('[Seccion1] Datos de prueba cargados via ProjectState');
    }
    
    // Legacy fallback - usar onFieldChange que usa projectFacade internamente
    this.onFieldChange('centrosPobladosJSON', jsonPrueba, { refresh: false });
    this.onFieldChange('geoInfo', {
      DPTO: 'Arequipa',
      PROV: 'Caravelí',
      DIST: 'Cahuacho'
    }, { refresh: false });
    this.onFieldChange('jsonFileName', 'datos_prueba.json', { refresh: false });
    
    // ✅ Llenar objetivos con valores por defecto usando el nombre del proyecto
    const objetivosPrueba = [
      `Describir los aspectos demográficos, sociales, económicos, culturales y políticos que caracterizan a las poblaciones de las áreas de influencia social del proyecto de exploración minera Paka.`,
      `Brindar información básica de los poblados comprendidos en el área de influencia social donde se realizará el Proyecto que sirvan de base para poder determinar los posibles impactos sociales a originarse en esta primera etapa de exploración y, por ende, prevenir, reducir o mitigar las consecuencias negativas y potenciar las positivas.`
    ];

    // Guardar objetivos y limpiar legacy
    this.onFieldChange('objetivosSeccion1', [...objetivosPrueba], { refresh: false });
    this.onFieldChange('objetivoSeccion1_1', null, { refresh: false });
    this.onFieldChange('objetivoSeccion1_2', null, { refresh: false });

    // Forzar sincronización local de datos y objetivos
    this.actualizarDatos();
    this.inicializarObjetivos();
    this.cdRef.detectChanges();
  }
}


