import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, effect, SimpleChanges } from '@angular/core';
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
    if (guardado) return guardado;
    return this.obtenerTextoParrafoPrincipal();
  });

  readonly parrafoIntroduccionSignal: Signal<string> = computed(() => {
    const formData = this.formDataSignal();
    const guardado = formData['parrafoSeccion1_4'];
    if (guardado) return guardado;
    return this.obtenerTextoIntroduccionObjetivos();
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
    const actuales = this.objetivosSignal();
    const nuevos = [...actuales, ''];
    this.projectFacade.setField(this.seccionId, null, 'objetivosSeccion1', nuevos);
    this.onFieldChange('objetivosSeccion1', nuevos);
    this.cdRef.markForCheck();
  }

  // ✅ CRUD: Eliminar objetivo
  eliminarObjetivo(index: number): void {
    const actuales = this.objetivosSignal();
    if (actuales.length > 1) {
      const nuevos = actuales.filter((_, i) => i !== index);
      this.projectFacade.setField(this.seccionId, null, 'objetivosSeccion1', nuevos);
      this.onFieldChange('objetivosSeccion1', nuevos);
      this.cdRef.markForCheck();
    }
  }

  // ✅ CRUD: Actualizar objetivo
  actualizarObjetivo(index: number, valor: string): void {
    const actuales = this.objetivosSignal();
    if (index >= 0 && index < actuales.length && actuales[index] !== valor) {
      const nuevos = [...actuales];
      nuevos[index] = valor;
      this.projectFacade.setField(this.seccionId, null, 'objetivosSeccion1', nuevos);
      this.onFieldChange('objetivosSeccion1', nuevos);
      this.cdRef.markForCheck();
    }
  }

  // ✅ Para vista: retorna los objetivos con reemplazo de placeholders
  obtenerObjetivosParaVista(): string[] {
    const proyecto = this.projectNameSignal();
    return this.objetivosSignal().map(o => (o || '').replace(/____/g, proyecto));
  }

  // ✅ TrackBy para listas
  trackByIndex(index: number): number {
    return index;
  }

  protected override onChangesCustom(changes: SimpleChanges): void {
    if (changes['modoFormulario'] && this.modoFormulario) {
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
    if (this.datos?.parrafoSeccion1_principal) {
      return this.datos.parrafoSeccion1_principal;
    }
    
    const proyecto = this.datos?.projectName || '____';
    const distrito = this.datos?.distritoSeleccionado || '____';
    const provincia = this.datos?.provinciaSeleccionada || '____';
    const departamento = this.datos?.departamentoSeleccionado || '____';
    
    return `Este componente realiza una caracterización de los aspectos socioeconómicos, culturales y antropológicos del área de influencia social del proyecto ${proyecto}, como un patrón de referencia inicial en base a la cual se pueda medir los impactos sobre la población del entorno directo del Proyecto.\n\nEl proyecto ${proyecto} se encuentra ubicado en el distrito de ${distrito}, en la provincia de ${provincia}, en el departamento de ${departamento}, bajo la administración del Gobierno Regional de ${departamento}, en el sur del Perú.\n\nEste estudio se elabora de acuerdo con el Reglamento de la Ley del Sistema Nacional de Evaluación de Impacto Ambiental, los Términos de Referencia comunes para actividades de exploración minera y la Guía de Relaciones Comunitarias del Ministerio de Energía y Minas (MINEM).`;
  }

  obtenerTextoIntroduccionObjetivos(): string {
    if (this.datos?.parrafoSeccion1_4) {
      return this.datos.parrafoSeccion1_4;
    }
    
    return 'Los objetivos de la presente línea de base social (LBS) son los siguientes:';
  }

  onJSONFileSelected(event: any) {
    console.log('🎯 [Seccion1] onJSONFileSelected llamado');
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      console.warn('⚠️ [Seccion1] No se seleccionó ningún archivo');
      return;
    }

    console.log('📁 [Seccion1] Archivo seleccionado:', file.name, file.size, 'bytes');

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        console.log('📖 [Seccion1] Leyendo contenido del archivo...');
        const jsonContent = JSON.parse(e.target.result);
        console.log('✅ [Seccion1] JSON parseado correctamente');
        
        // ===== FASE 1: ProjectState como fuente PRIMARIA =====
        // Validar estructura JSON antes de procesar
        const validation = validateJSONStructure(jsonContent);
        if (!validation.valid) {
          console.warn('[Seccion1] JSON validation failed:', validation.error);
          alert(validation.error || 'Error al procesar el archivo JSON. Verifique el formato.');
          return;
        }

        console.log('🔧 [Seccion1] Creando batch command...');
        // Crear BatchCommand para ProjectState
        const { batch, result } = createJSONProcessingBatch(jsonContent, {
          fileName: file.name,
          transactionId: `json_upload_${Date.now()}`
        });

        console.log('🔍 [Seccion1] Batch creado:', batch ? 'SÍ' : 'NO');
        if (batch) {
          console.log('📤 [Seccion1] Despachando batch con', batch.payload.commands.length, 'comandos');
          const groupCommands = batch.payload.commands.filter(c => c.type === 'groupConfig/addGroup');
          console.log('📤 [Seccion1] Comandos de grupos:', groupCommands.length);
          groupCommands.forEach((c: any, i: number) => {
            console.log(`   ${i + 1}. ${c.payload.tipo}: "${c.payload.nombre}" (${c.payload.ccppIds?.length || 0} centros)`);
          });
          
          this.store.dispatch(batch);
          console.log('✅ [Seccion1] Batch despachado al store');
          
          // ✅ Verificar que los grupos se crearon
          setTimeout(() => {
            try {
              const gruposAISD = this.projectFacade.aisdGroups();
              const gruposAISI = this.projectFacade.aisiGroups();
              console.log('✅ [Seccion1] Después del dispatch - Grupos AISD:', gruposAISD.length, gruposAISD.map(g => g.nombre));
              console.log('✅ [Seccion1] Después del dispatch - Grupos AISI:', gruposAISI.length, gruposAISI.map(g => g.nombre));
            } catch (error) {
              console.error('❌ [Seccion1] Error al leer grupos después del dispatch:', error);
            }
          }, 100);
          
          // ✅ CRÍTICO: Inicializar árbol de secciones después de cargar JSON
          // Esto genera las secciones dinámicas a.1, a.2, b.1, b.2 etc.
          this.projectFacade.initializeSectionsTree();
          
          const stats = getJSONStats(result);
          console.log(`[Seccion1] JSON procesado via ProjectState: ${stats.totalCCPP} CCPP, ${stats.totalGroups} grupos (Formato ${stats.format})`);
        } else {
          console.warn('⚠️ [Seccion1] No se pudo crear el batch command');
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

  override onFotografiasChange(fotografias: FotoItem[]): void {
    this.fotografiasFormMulti = [...fotografias];
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

    // ✅ GENERAR SIEMPRE el párrafo principal con datos de prueba
    // Solo preservar si el usuario lo editó manualmente (no contiene "____")
    const parrafoPrincipalActual = this.datos?.parrafoSeccion1_principal;
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
      
      // ✅ CRÍTICO: Guardar el párrafo PRIMERO
      // Actualizar this.datos directamente para que esté disponible inmediatamente
      this.datos.parrafoSeccion1_principal = nuevoParrafoPrincipal;
      
      // Guardar en el facade (con refresh: true para que se persista inmediatamente)
      this.onFieldChange('parrafoSeccion1_principal', nuevoParrafoPrincipal, { refresh: true });
    }

    // ✅ Guardar objetivos y limpiar legacy
    this.onFieldChange('objetivosSeccion1', [...objetivosPrueba], { refresh: false });
    this.onFieldChange('objetivoSeccion1_1', null, { refresh: false });
    this.onFieldChange('objetivoSeccion1_2', null, { refresh: false });
    
    // Solo cargar fotografías y detectar cambios
    this.cargarFotografias();
    this.cdRef.detectChanges();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}


