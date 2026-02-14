import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, effect, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { TextNormalizationService } from 'src/app/core/services/utilities/text-normalization.service';
import { GruposService } from 'src/app/core/infrastructure/services';
import { UIStoreService } from 'src/app/core/state/ui-store.contract';
import { FotoItem } from '../image-upload/image-upload.component';
import { 
  createJSONProcessingBatch, 
  validateJSONStructure, 
  getJSONStats,
  NormalizedJSONResult 
} from 'src/app/core/services/data/json-normalizer';
import {
  SECCION1_WATCHED_FIELDS,
  SECCION1_SECTION_ID,
  SECCION1_TEMPLATES,
  OBJETIVO_DEFAULT_1,
  OBJETIVO_DEFAULT_2
} from './seccion1-constants';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, CoreSharedModule],
    selector: 'app-seccion1-form',
    templateUrl: './seccion1-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion1FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION1_SECTION_ID;
  @Input() override modoFormulario: boolean = true;
  private parrafoPrincipalBloqueadoPorEdicionManual = false;

  // ✅ Hacer TEMPLATES accesible en el template
  readonly SECCION1_TEMPLATES = SECCION1_TEMPLATES;

  override readonly PHOTO_PREFIX = 'fotografiaSeccion1';
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION1_WATCHED_FIELDS;

  // ✅ PROPIEDADES PARA FOTOGRAFÍAS
  override fotografiasFormMulti: FotoItem[] = [];

  // ✅ SIGNAL PRINCIPAL: Lee todos los datos de la sección actual
  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  // ✅ SIGNALS DERIVADOS POR CAMPO - Data básica
  readonly projectNameSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'projectName')() || '____';
  });

  readonly geoInfoSignal: Signal<any> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'geoInfo')() || {};
  });

  readonly departamentoSeleccionadoSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    return formData['departamentoSeleccionado'] ?? formData['geoInfo']?.DPTO ?? '';
  });

  readonly provinciaSeleccionadaSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    return formData['provinciaSeleccionada'] ?? formData['geoInfo']?.PROV ?? '';
  });

  readonly distritoSeleccionadoSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    return formData['distritoSeleccionado'] ?? formData['geoInfo']?.DIST ?? '';
  });

  readonly jsonFileNameSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    return formData['jsonFileName'] ?? '';
  });

  readonly centrosPobladosJSONSignal: Signal<any[]> = computed(() => {
    const formData = this.formDataSignal();
    return formData['centrosPobladosJSON'] ?? [];
  });

  // ✅ OBJETIVOS: Valores por defecto + valores del store
  readonly objetivosSignal: Signal<string[]> = computed(() => {
    const fromStore = this.projectFacade.selectField(this.seccionId, null, 'objetivosSeccion1')();
    if (Array.isArray(fromStore) && fromStore.length > 0) {
      return fromStore;
    }
    // Fallback a valores por defecto
    return [
      this.getObjetivoDefault(0),
      this.getObjetivoDefault(1)
    ];
  });

  // ✅ PÁRRAFOS: Valores guardados o por defecto
  readonly parrafoPrincipalSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    const guardado = formData['parrafoSeccion1_principal'];
    if (guardado) return this.reemplazarPlaceholdersEnParrafo(guardado);
    return this.obtenerTextoParrafoPrincipal();
  });

  readonly parrafoIntroduccionSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    const guardado = formData['parrafoSeccion1_4'];
    if (guardado) return guardado;
    return this.obtenerTextoIntroduccionObjetivos();
  });

  // ✅ SIGNALS REACTIVOS CON AUTO-PERSIST (NEW ARCHITECTURE)
  readonly projectName = this.createAutoSyncField('projectName', '');
  readonly departamentoSeleccionado = this.createAutoSyncField('departamentoSeleccionado', '');
  readonly provinciaSeleccionada = this.createAutoSyncField('provinciaSeleccionada', '');
  readonly distritoSeleccionado = this.createAutoSyncField('distritoSeleccionado', '');
  readonly parrafoPrincipal = this.createAutoSyncField('parrafoSeccion1_principal', '');
  readonly parrafoIntroduccion = this.createAutoSyncField('parrafoSeccion1_4', '');
  readonly objetivosSeccion1 = this.createAutoSyncField('objetivosSeccion1', [] as string[]);

  // ✅ JSON Processing fields
  readonly centrosPobladosJSON = this.createAutoSyncField<any[]>('centrosPobladosJSON', [] as any[]);
  readonly jsonCompleto = this.createAutoSyncField<Record<string, any>>('jsonCompleto', {} as Record<string, any>);
  readonly geoInfoField = this.createAutoSyncField<Record<string, any>>('geoInfo', {} as Record<string, any>);
  readonly jsonFileName = this.createAutoSyncField<string>('jsonFileName', '');
  readonly comunidadesCampesinas = this.createAutoSyncField<any[]>('comunidadesCampesinas', [] as any[]);
  readonly districtosGuardados = this.createAutoSyncField<Array<{ dpto: string; prov: string; dist: string }>>('districtosGuardados', []);

  // ✅ MULTI-DISTRITO SUPPORT (NUEVA ARQUITECTURA)
  // Almacena todos los distritos extraídos del JSON
  private readonly districtosDisponibles = signal<Array<{ dpto: string; prov: string; dist: string }>>([]);

  // Opciones de combos cascada
  readonly dptoOptions = computed(() => {
    const distritos = this.districtosDisponibles();
    const dptos = new Set(distritos.map(d => d.dpto));
    return Array.from(dptos).sort();
  });

  readonly provOptions = computed(() => {
    const distritos = this.districtosDisponibles();
    const dpto = this.departamentoSeleccionado.value();
    if (!dpto) return [];
    const provs = distritos
      .filter(d => d.dpto === dpto)
      .map(d => d.prov);
    return Array.from(new Set(provs)).sort();
  });

  readonly distOptions = computed(() => {
    const distritos = this.districtosDisponibles();
    const dpto = this.departamentoSeleccionado.value();
    const prov = this.provinciaSeleccionada.value();
    if (!dpto || !prov) return [];
    const dists = distritos
      .filter(d => d.dpto === dpto && d.prov === prov)
      .map(d => d.dist);
    return Array.from(new Set(dists)).sort();
  });

  // ✅ EFFECT para reactividad automática
  private readonly syncEffect = effect(
    () => {
      const _ = [
        this.projectNameSignal(),
        this.geoInfoSignal(),
        this.departamentoSeleccionadoSignal(),
        this.provinciaSeleccionadaSignal(),
        this.distritoSeleccionadoSignal(),
        this.objetivosSignal(),
        this.parrafoPrincipalSignal(),
        this.parrafoIntroduccionSignal(),
        this.centrosPobladosJSONSignal()
      ];
      this.cdRef.markForCheck();
    },
    { allowSignalWrites: true }
  );

  // ✅ EFFECT: Auto-seleccionar primer distrito y actualizar párrafo
  private readonly autoSelectDistrictEffect = effect(
    () => {
      const distritos = this.districtosDisponibles();
      const currentDpto = this.departamentoSeleccionado.value();
      
      if (distritos.length > 0 && !currentDpto) {
        // Auto-seleccionar el primero
        const primero = distritos[0];
        console.log('[Seccion1] Auto-seleccionando distrito:', primero);
        this.departamentoSeleccionado.update(primero.dpto);
        this.provinciaSeleccionada.update(primero.prov);
        this.distritoSeleccionado.update(primero.dist);
        
        // ✅ Guardar en METADATA GLOBAL (para que todas las secciones lean)
        console.log('[Seccion1] autoSelectDistrictEffect - dispatching setUbicacionGlobal:', primero);
        this.projectFacade.setUbicacionGlobal(primero.dpto, primero.prov, primero.dist);
        
        // Actualizar párrafo principal con los datos seleccionados
        this.actualizarParrafoPrincipal();
      }
    },
    { allowSignalWrites: true }
  );

  // ✅ EFFECT: Actualizar párrafo cuando cambia ubicación
  private readonly updateParagraphEffect = effect(
    () => {
      const dpto = this.departamentoSeleccionado.value();
      const prov = this.provinciaSeleccionada.value();
      const dist = this.distritoSeleccionado.value();
      
      // Trigger cuando cualquiera cambia
      if (dpto && prov && dist) {
        this.actualizarParrafoPrincipal();
      }
    },
    { allowSignalWrites: true }
  );

  constructor(
    private textNormalization: TextNormalizationService,
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private gruposService: GruposService,
    private store: UIStoreService
  ) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void {
    // ✅ Load initial values from state or use defaults
    const projectNameValue = this.projectFacade.selectField(this.seccionId, null, 'projectName')() || '';
    console.log('[Seccion1] onInitCustom - projectNameValue:', projectNameValue);
    if (projectNameValue) {
      this.projectName.update(projectNameValue);
    }
    
    const departamentoValue = this.projectFacade.selectField(this.seccionId, null, 'departamentoSeleccionado')() || '';
    const provinciaValue = this.projectFacade.selectField(this.seccionId, null, 'provinciaSeleccionada')() || '';
    const distritoValue = this.projectFacade.selectField(this.seccionId, null, 'distritoSeleccionado')() || '';
    
    if (departamentoValue) {
      this.departamentoSeleccionado.update(departamentoValue);
    }
    
    if (provinciaValue) {
      this.provinciaSeleccionada.update(provinciaValue);
    }
    
    if (distritoValue) {
      this.distritoSeleccionado.update(distritoValue);
    }

     // ✅ CRÍTICO: SIEMPRE despachar setUbicacionGlobal para sincronizar con otras secciones
     // Si hay valores, se usan; si no, el effect de auto-select los seleccionará
     console.log('[Seccion1] onInitCustom - dispatching setUbicacionGlobal:', { departamentoValue, provinciaValue, distritoValue });
     this.projectFacade.setUbicacionGlobal(departamentoValue, provinciaValue, distritoValue);

    // ✅ CRÍTICO: Recuperar datos del JSON cargado (centros poblados, nombre archivo)
    const centrosPobladosValue = this.projectFacade.selectField(this.seccionId, null, 'centrosPobladosJSON')();
    if (centrosPobladosValue && Array.isArray(centrosPobladosValue)) {
      this.centrosPobladosJSON.update(centrosPobladosValue);
    }

    const jsonFileNameValue = this.projectFacade.selectField(this.seccionId, null, 'jsonFileName')() || '';
    if (jsonFileNameValue) {
      this.jsonFileName.update(jsonFileNameValue);
    }

    const geoInfoValue = this.projectFacade.selectField(this.seccionId, null, 'geoInfo')();
    if (geoInfoValue) {
      this.geoInfoField.update(geoInfoValue);
    }
    
    // ✅ CRÍTICO: Restaurar districtosDisponibles si existe jsonCompleto guardado
    const jsonCompletoValue = this.projectFacade.selectField(this.seccionId, null, 'jsonCompleto')();
    if (jsonCompletoValue && Object.keys(jsonCompletoValue).length > 0) {
      this.parseDistrictsFromJSON(jsonCompletoValue);
    } else {
      // Fallback: restaurar desde districtosGuardados
      const districtosGuardadosValue = this.projectFacade.selectField(this.seccionId, null, 'districtosGuardados')();
      if (districtosGuardadosValue && Array.isArray(districtosGuardadosValue) && districtosGuardadosValue.length > 0) {
        this.districtosDisponibles.set(districtosGuardadosValue);
        this.districtosGuardados.update(districtosGuardadosValue);
      }
    }
    
    // ✅ Usar métodos getter como fallback para párrafos
    const parrafoPrincipalGuardado = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion1_principal')();
    this.parrafoPrincipalBloqueadoPorEdicionManual = !!(parrafoPrincipalGuardado && String(parrafoPrincipalGuardado).trim().length > 0);
    const parrafoPrincipalValue = parrafoPrincipalGuardado || this.obtenerTextoParrafoPrincipal();
    this.parrafoPrincipal.update(parrafoPrincipalValue);
    
    const parrafoIntroduccionValue = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion1_4')() || this.obtenerTextoIntroduccionObjetivos();
    this.parrafoIntroduccion.update(parrafoIntroduccionValue);
    
    const objetivosValue = this.projectFacade.selectField(this.seccionId, null, 'objetivosSeccion1')() || [];
    if (Array.isArray(objetivosValue) && objetivosValue.length > 0) {
      this.objetivosSeccion1.update(objetivosValue);
    } else {
      // ✅ Use default objectives if none exist
      this.objetivosSeccion1.update([
        this.getObjetivoDefault(0),
        this.getObjetivoDefault(1)
      ]);
    }
    
    this.cargarFotografias();
  }

  private getObjetivoDefault(index: number): string {
    const proyecto = this.projectNameSignal();
    const proyectoNormalizado = this.textNormalization.normalizarNombreProyecto(proyecto === '____' ? undefined : proyecto, false);
    
    if (index === 0) {
      return OBJETIVO_DEFAULT_1.replace('{projectName}', proyectoNormalizado);
    }
    return OBJETIVO_DEFAULT_2;
  }

  // ✅ CRUD: Agregar objetivo
  agregarObjetivo(): void {
    const actuales = this.objetivosSeccion1.value();
    const nuevos = [...actuales, ''];
    this.objetivosSeccion1.update(nuevos);
    this.cdRef.markForCheck();
  }

  // ✅ CRUD: Eliminar objetivo
  eliminarObjetivo(index: number): void {
    const actuales = this.objetivosSeccion1.value();
    if (actuales.length > 1) {
      const nuevos = actuales.filter((_, i) => i !== index);
      this.objetivosSeccion1.update(nuevos);
      this.cdRef.markForCheck();
    }
  }

  // ✅ CRUD: Actualizar objetivo
  actualizarObjetivo(index: number, valor: string): void {
    const actuales = this.objetivosSeccion1.value();
    if (index >= 0 && index < actuales.length && actuales[index] !== valor) {
      const nuevos = [...actuales];
      nuevos[index] = valor;
      this.objetivosSeccion1.update(nuevos);
      this.cdRef.markForCheck();
    }
  }

  // ✅ Para vista: retorna los objetivos con reemplazo de placeholders
  obtenerObjetivosParaVista(): string[] {
    const proyecto = this.projectName.value();
    return this.objetivosSeccion1.value().map(o => (o || '').replace(/____/g, proyecto));
  }

  // ✅ Reemplaza placeholders en párrafos guardados
  private reemplazarPlaceholdersEnParrafo(texto: string): string {
    let resultado = texto;
    const proyecto = this.projectName.value() || '____';
    const distrito = this.distritoSeleccionado.value() || '____';
    const provincia = this.provinciaSeleccionada.value() || '____';
    const departamento = this.departamentoSeleccionado.value() || '____';
    
    // 🔍 Reemplazar placeholders en orden específico y contextos
    // Proyecto (múltiples contextos)
    resultado = resultado.replace(/proyecto ____(?=[,.])/g, `proyecto ${proyecto}`);
    resultado = resultado.replace(/del proyecto ____/g, `del proyecto ${proyecto}`);
    resultado = resultado.replace(/El proyecto ____/g, `El proyecto ${proyecto}`);
    
    // Ubicación geográfica
    resultado = resultado.replace(/en el distrito de ____/g, `en el distrito de ${distrito}`);
    resultado = resultado.replace(/del distrito de ____/g, `del distrito de ${distrito}`);
    resultado = resultado.replace(/en la provincia de ____/g, `en la provincia de ${provincia}`);
    resultado = resultado.replace(/provincia de ____/g, `provincia de ${provincia}`);
    resultado = resultado.replace(/en el departamento de ____/g, `en el departamento de ${departamento}`);
    resultado = resultado.replace(/departamento de ____/g, `departamento de ${departamento}`);
    resultado = resultado.replace(/Regional de ____/g, `Regional de ${departamento}`);
    
    return resultado;
  }

  // ✅ TrackBy para listas
  trackByIndex(index: number): number {
    return index;
  }

  protected override onChangesCustom(changes: SimpleChanges): void {
    if (changes['modoFormulario'] && this.modoFormulario) {
      this.cargarFotografias();
      this.cdRef.markForCheck();
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
    const formData = this.formDataSignal();
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = (formData as any)[campo] || null;
    });
  }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
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
    if (this.parrafoPrincipal.value()) {
      return this.parrafoPrincipal.value();
    }
    
    const proyecto = this.projectName.value() || '____';
    const distrito = this.distritoSeleccionado.value() || '____';
    const provincia = this.provinciaSeleccionada.value() || '____';
    const departamento = this.departamentoSeleccionado.value() || '____';
    
    return `Este componente realiza una caracterización de los aspectos socioeconómicos, culturales y antropológicos del área de influencia social del proyecto ${proyecto}, como un patrón de referencia inicial en base a la cual se pueda medir los impactos sobre la población del entorno directo del Proyecto.\n\nEl proyecto ${proyecto} se encuentra ubicado en el distrito de ${distrito}, en la provincia de ${provincia}, en el departamento de ${departamento}, bajo la administración del Gobierno Regional de ${departamento}, en el sur del Perú.\n\nEste estudio se elabora de acuerdo con el Reglamento de la Ley del Sistema Nacional de Evaluación de Impacto Ambiental, los Términos de Referencia comunes para actividades de exploración minera y la Guía de Relaciones Comunitarias del Ministerio de Energía y Minas (MINEM).`;
  }

  obtenerTextoIntroduccionObjetivos(): string {
    if (this.parrafoIntroduccion.value()) {
      return this.parrafoIntroduccion.value();
    }
    
    return 'Los objetivos de la presente línea de base social (LBS) son los siguientes:';
  }

  onJSONFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const jsonContent = JSON.parse(e.target.result);
        
        // ===== FASE 1: ProjectState como fuente PRIMARIA =====
        // Validar estructura JSON antes de procesar
        const validation = validateJSONStructure(jsonContent);
        if (!validation.valid) {
          alert(validation.error || 'Error al procesar el archivo JSON. Verifique el formato.');
          return;
        }

        // ✅ NUEVO: Parsear distritos para combos cascada
        this.parseDistrictsFromJSON(jsonContent);

        // Crear BatchCommand para ProjectState
        const { batch, result } = createJSONProcessingBatch(jsonContent, {
          fileName: file.name,
          transactionId: `json_upload_${Date.now()}`
        });

        if (batch) {
          
          // ✅ CRÍTICO: DESPACHAR batch al estado para crear grupos AISD/AISI
          // Este batch contiene los comandos para:
          // - Registrar CCPPs en el estado
          // - Crear grupos AISD (desde KEYs del JSON)
          // - Crear grupos AISI (desde DISTintos únicos)
          this.projectFacade.dispatch(batch);
          
          // ✅ Inicializar árbol de secciones después de cargar JSON
          // Esto genera las secciones dinámicas a.1, a.2, b.1, b.2 etc.
          this.projectFacade.initializeSectionsTree();
          
          const stats = getJSONStats(result);
        } else {
          // No se pudo crear batch
        }

        // ===== FALLBACK: Legacy para compatibilidad temporal =====
        // Mantener sync con legacy hasta que toda la UI migre
        const { data, geoInfo, fileName, comunidadesCampesinas, jsonCompleto } = this.procesarJSONLegacy(jsonContent, file.name, result);
        
        // ✅ NUEVA ARQUITECTURA: Persistir usando signals reactivos
        console.log('[Seccion1] onJSONFileSelected - geoInfo:', geoInfo);
        this.departamentoSeleccionado.update(geoInfo.DPTO || '');
        this.provinciaSeleccionada.update(geoInfo.PROV || '');
        this.distritoSeleccionado.update(geoInfo.DIST || '');
        
        // ✅ CRÍTICO: Despachar setUbicacionGlobal inmediatamente
        console.log('[Seccion1] onJSONFileSelected - dispatching setUbicacionGlobal:', geoInfo);
        this.projectFacade.setUbicacionGlobal(geoInfo.DPTO || '', geoInfo.PROV || '', geoInfo.DIST || '');
        this.centrosPobladosJSON.update(data);
        this.jsonCompleto.update(jsonCompleto);
        this.geoInfoField.update(geoInfo);
        this.jsonFileName.update(fileName);
        
        if (comunidadesCampesinas && comunidadesCampesinas.length > 0) {
          this.comunidadesCampesinas.update(comunidadesCampesinas);
        }
        
        this.actualizarDatos();
        this.cdRef.detectChanges();
        
      } catch (error) {
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

  /**
   * ✅ NUEVO: Parsea el JSON cargado y extrae distritos únicos
   * Prepara las opciones para los combos cascada
   */
  private parseDistrictsFromJSON(jsonContent: any): void {
    const districtMap = new Map<string, { dpto: string; prov: string; dist: string }>();

    // Recorrer todas las keys del JSON
    for (const key in jsonContent) {
      const items = jsonContent[key];
      if (!Array.isArray(items)) continue;

      // Extraer distritos únicos
      items.forEach((item: any) => {
        if (item.DPTO && item.PROV && item.DIST) {
          const districtKey = `${item.DPTO}|${item.PROV}|${item.DIST}`;
          if (!districtMap.has(districtKey)) {
            districtMap.set(districtKey, {
              dpto: item.DPTO,
              prov: item.PROV,
              dist: item.DIST
            });
          }
        }
      });
    }

    // Actualizar signal de distritos disponibles
    const distritos = Array.from(districtMap.values()).sort((a, b) => a.dist.localeCompare(b.dist));

    this.districtosDisponibles.set(distritos);
    // ✅ También guardar en autoSyncField para persistencia
    this.districtosGuardados.update(distritos);
  }

  /**
   * ✅ NUEVO: Actualiza automáticamente el párrafo principal
   * cuando cambian departamento, provincia o distrito
   */
  private actualizarParrafoPrincipal(): void {
    if (this.parrafoPrincipalBloqueadoPorEdicionManual) {
      return;
    }

    const parrafoGuardado = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion1_principal')();
    if (parrafoGuardado && String(parrafoGuardado).trim().length > 0) {
      this.parrafoPrincipalBloqueadoPorEdicionManual = true;
      return;
    }

    const proyecto = this.projectName.value() || '____';
    const distrito = this.distritoSeleccionado.value() || '____';
    const provincia = this.provinciaSeleccionada.value() || '____';
    const departamento = this.departamentoSeleccionado.value() || '____';

    // Template original con placeholders
    const textoOriginal = `Este componente realiza una caracterización de los aspectos socioeconómicos, culturales y antropológicos del área de influencia social del proyecto ____, como un patrón de referencia inicial en base a la cual se pueda medir los impactos sobre la población del entorno directo del Proyecto.

El proyecto ____ se encuentra ubicado en el distrito de ____, en la provincia de ____, en el departamento de ____, bajo la administración del Gobierno Regional de ____, en el sur del Perú.

Este estudio se elabora de acuerdo con el Reglamento de la Ley del Sistema Nacional de Evaluación de Impacto Ambiental, los Términos de Referencia comunes para actividades de exploración minera y la Guía de Relaciones Comunitarias del Ministerio de Energía y Minas (MINEM).`;

    let resultado = textoOriginal;

    // Reemplazar placeholders en orden
    resultado = resultado.replace(/proyecto ____(?=[,.])/g, `proyecto ${proyecto}`);
    resultado = resultado.replace(/del proyecto ____/g, `del proyecto ${proyecto}`);
    resultado = resultado.replace(/El proyecto ____/g, `El proyecto ${proyecto}`);

    resultado = resultado.replace(/en el distrito de ____/g, `en el distrito de ${distrito}`);
    resultado = resultado.replace(/en la provincia de ____/g, `en la provincia de ${provincia}`);
    resultado = resultado.replace(/en el departamento de ____/g, `en el departamento de ${departamento}`);
    resultado = resultado.replace(/Gobierno Regional de ____/g, `Gobierno Regional de ${departamento}`);

    // Actualizar el signal del párrafo
    this.parrafoPrincipal.update(resultado);
  }

  onParrafoPrincipalChange(value: string): void {
    this.parrafoPrincipalBloqueadoPorEdicionManual = true;
    this.parrafoPrincipal.update(value);
  }

  /**
   * ✅ NUEVO: Handler para cuando cambia el departamento en el combo
   */
  onDptoChange(): void {
    // Reset provincia y distrito
    this.provinciaSeleccionada.update('');
    this.distritoSeleccionado.update('');
    this.cdRef.markForCheck();
  }

  /**
   * ✅ NUEVO: Handler para cuando cambia la provincia en el combo
   */
  onProvChange(): void {
    // Reset distrito
    this.distritoSeleccionado.update('');
    this.cdRef.markForCheck();
  }

  /**
   * ✅ NUEVO: Handler para cuando cambia el distrito en el combo
   * Actualiza automáticamente el párrafo principal
   * Y guarda en METADATA GLOBAL (para todas las secciones)
   */
  onDistritoChange(): void {
    const dpto = this.departamentoSeleccionado.value();
    const prov = this.provinciaSeleccionada.value();
    const dist = this.distritoSeleccionado.value();

    // ✅ GUARDAR EN METADATA GLOBAL (para que todas las secciones lean)
    if (dpto && prov && dist) {
      this.projectFacade.setUbicacionGlobal(dpto, prov, dist);
    }

    this.actualizarParrafoPrincipal();
    this.cdRef.markForCheck();
  }

  selectJSONFile() {
    const fileInput = document.getElementById('jsonFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  override onFotografiasChange(fotografias: FotoItem[]): void {
    this.fotografiasFormMulti = [...fotografias];
  }

  llenarDatosPrueba() {
    // ✅ NUEVA ARQUITECTURA: Usar signals reactivos directamente
    this.projectName.update('Paka');
    this.departamentoSeleccionado.update('Arequipa');
    this.provinciaSeleccionada.update('Caravelí');
    this.distritoSeleccionado.update('Cahuacho');
    
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
    }
    
    // ✅ NUEVA ARQUITECTURA: Usar signals reactivos
    this.centrosPobladosJSON.update(jsonPrueba);
    this.geoInfoField.update({
      DPTO: 'Arequipa',
      PROV: 'Caravelí',
      DIST: 'Cahuacho'
    });
    this.jsonFileName.update('datos_prueba.json');
    
    // ✅ Definir datos de prueba
    const datosPrueba = {
      projectName: 'Paka',
      distritoSeleccionado: 'Cahuacho',
      provinciaSeleccionada: 'Caravelí',
      departamentoSeleccionado: 'Arequipa'
    };

    // ✅ Llenar objetivos con valores por defecto usando el nombre del proyecto
    const objetivosPrueba = [
      `Describir los aspectos demográficos, sociales, económicos, culturales y políticos que caracterizan a las poblaciones de las áreas de influencia social del proyecto de exploración minera Paka.`,
      `Brindar información básica de los poblados comprendidos en el área de influencia social donde se realizará el Proyecto que sirvan de base para poder determinar los posibles impactos sociales a originarse en esta primera etapa de exploración y, por ende, prevenir, reducir o mitigar las consecuencias negativas y potenciar las positivas.`
    ];

    // ✅ GENERAR SIEMPRE el párrafo principal con datos de prueba
    // Solo preservar si el usuario lo editó manualmente (no contiene "____")
    const parrafoPrincipalActual = this.parrafoPrincipal.value();
    const esParrafoPersonalizado = parrafoPrincipalActual && 
      !parrafoPrincipalActual.includes('____') && 
      parrafoPrincipalActual.trim().length > 0 &&
      parrafoPrincipalActual !== this.obtenerTextoParrafoPrincipal(); // No es el texto por defecto
    
    let nuevoParrafoPrincipal: string | null = null;
    
    // Si NO es personalizado, generar uno nuevo con los datos de prueba
    if (!esParrafoPersonalizado) {
      const proyecto = datosPrueba.projectName;
      const distrito = datosPrueba.distritoSeleccionado;
      const provincia = datosPrueba.provinciaSeleccionada;
      const departamento = datosPrueba.departamentoSeleccionado;
      
      nuevoParrafoPrincipal = `Este componente realiza una caracterización de los aspectos socioeconómicos, culturales y antropológicos del área de influencia social del proyecto ${proyecto}, como un patrón de referencia inicial en base a la cual se pueda medir los impactos sobre la población del entorno directo del Proyecto.\n\nEl proyecto ${proyecto} se encuentra ubicado en el distrito de ${distrito}, en la provincia de ${provincia}, en el departamento de ${departamento}, bajo la administración del Gobierno Regional de ${departamento}, en el sur del Perú.\n\nEste estudio se elabora de acuerdo con el Reglamento de la Ley del Sistema Nacional de Evaluación de Impacto Ambiental, los Términos de Referencia comunes para actividades de exploración minera y la Guía de Relaciones Comunitarias del Ministerio de Energía y Minas (MINEM).`;
      
      // ✅ Guardar el párrafo con el signal (auto-persiste vía effect)
      this.parrafoPrincipal.update(nuevoParrafoPrincipal);
    }

    // ✅ Guardar objetivos (auto-persisten vía effect)
    this.objetivosSeccion1.update([...objetivosPrueba]);
    
    // Solo cargar fotografías y detectar cambios
    this.cargarFotografias();
    this.cdRef.detectChanges();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}


