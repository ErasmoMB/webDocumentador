import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, Signal, computed, effect } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { TableColumn } from '../dynamic-table/dynamic-table.component';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import {
  SECCION7_WATCHED_FIELDS,
  SECCION7_SECTION_ID,
  SECCION7_TEMPLATES,
  SECCION7_TEXTOS_DEFAULT
} from './seccion7-constants';

// ============================================================================
// FUNCIONES TRANSFORMADORAS - Convertir datos del backend al formato de tabla
// ============================================================================

/**
 * Desenvuelve datos demográficos del backend
 * Maneja diferentes estructuras de respuesta
 */
const unwrapDemograficoData = (responseData: any): any[] => {
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
 * Transforma datos de PET (Población en Edad de Trabajar) del backend
 * Mapea directamente TODOS los campos sin filtros
 */
const transformPETDesdeDemograficos = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => ({
    categoria: item.categoria || item.nombre || '',
    casos: item.casos !== undefined ? item.casos : item.total || 0,
    porcentaje: item.porcentaje || item.percentage || ''
  }));
};

/**
 * Transforma datos de PEA (Población Económicamente Activa) del backend
 * Mapea directamente TODOS los campos sin filtros
 */
const transformPEADesdeDemograficos = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => ({
    categoria: item.categoria || item.nombre || '',
    hombres: item.hombres !== undefined ? item.hombres : 0,
    porcentajeHombres: item.porcentaje_hombres || item.porcentajeHombres || '',
    mujeres: item.mujeres !== undefined ? item.mujeres : 0,
    porcentajeMujeres: item.porcentaje_mujeres || item.porcentajeMujeres || '',
    casos: item.total !== undefined ? item.total : item.casos || 0,
    porcentaje: item.porcentaje_total || item.porcentaje || ''
  }));
};

/**
 * Transforma datos de PEA Ocupada/Desocupada del backend
 * Mapea directamente TODOS los campos sin filtros
 */
const transformPEAOcupadaDesdeDemograficos = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => ({
    categoria: item.categoria || item.nombre || '',
    hombres: item.hombres !== undefined ? item.hombres : 0,
    porcentajeHombres: item.porcentaje_hombres || item.porcentajeHombres || '',
    mujeres: item.mujeres !== undefined ? item.mujeres : 0,
    porcentajeMujeres: item.porcentaje_mujeres || item.porcentajeMujeres || '',
    casos: item.total !== undefined ? item.total : item.casos || 0,
    porcentaje: item.porcentaje_total || item.porcentaje || ''
  }));
};

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CoreSharedModule
  ],
  selector: 'app-seccion7-form',
  templateUrl: './seccion7-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion7FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION7_SECTION_ID;
  @Input() override modoFormulario: boolean = true;

  // ✅ Hacer TEMPLATES accesible en el template
  readonly SECCION7_TEMPLATES = SECCION7_TEMPLATES;

  override readonly PHOTO_PREFIX = 'fotografiaPEA';
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION7_WATCHED_FIELDS;

  // ✅ Signal de prefijo de grupo AISD
  readonly prefijoGrupoSignal: Signal<string> = computed(() => this.obtenerPrefijoGrupo());

  // ✅ Helper para usar en templates
  obtenerPrefijo(): string {
    return this.prefijoGrupoSignal();
  }

  // ✅ SIGNALS REACTIVOS CON AUTO-PERSIST - Campos editables de títulos y fuentes
  readonly cuadroTituloPET = this.createAutoSyncField(`cuadroTituloPET${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly cuadroFuentePET = this.createAutoSyncField(`cuadroFuentePET${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly cuadroTituloPEA = this.createAutoSyncField(`cuadroTituloPEA${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly cuadroFuentePEA = this.createAutoSyncField(`cuadroFuentePEA${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly cuadroTituloPEAOcupada = this.createAutoSyncField(`cuadroTituloPEAOcupada${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly cuadroFuentePEAOcupada = this.createAutoSyncField(`cuadroFuentePEAOcupada${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  
  // ✅ SIGNALS REACTIVOS CON AUTO-PERSIST - Párrafos y textos editable
  readonly parrafoSeccion7PetCompleto = this.createAutoSyncField(`parrafoSeccion7_pet_completo${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoDetalePEA = this.createAutoSyncField(`textoDetalePEA${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoDefinicionPEA = this.createAutoSyncField(`textoDefinicionPEA${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoAnalisisPEA = this.createAutoSyncField(`textoAnalisisPEA${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly parrafoSeccion7SituacionEmpleoCompleto = this.createAutoSyncField(`parrafoSeccion7_situacion_empleo_completo${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly parrafoSeccion7IngresosCompleto = this.createAutoSyncField(`parrafoSeccion7_ingresos_completo${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoIndiceDesempleo = this.createAutoSyncField(`textoIndiceDesempleo${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoAnalisisOcupacion = this.createAutoSyncField(`textoAnalisisOcupacion${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');

  fotografiasSeccion7: FotoItem[] = [];

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly petTablaSignal: Signal<any[]> = computed(() => {
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    return Array.isArray(formData[petTablaKey]) ? formData[petTablaKey] : [];
  });

  readonly peaTablaSignal: Signal<any[]> = computed(() => {
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
    return Array.isArray(formData[peaTablaKey]) ? formData[peaTablaKey] : [];
  });

  readonly peaOcupadaTablaSignal: Signal<any[]> = computed(() => {
    const formData = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
    return Array.isArray(formData[peaOcupadaTablaKey]) ? formData[peaOcupadaTablaKey] : [];
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`;
      const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`;
      const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`;

      const titulo = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, imagenKey)();

      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ NUMERACIÓN GLOBAL - Tablas (tres tablas: PET, PEA, PEA Ocupada)
  readonly globalTableNumberSignalPET: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  });
  
  readonly globalTableNumberSignalPEA: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
  });
  
  readonly globalTableNumberSignalPEAOcupada: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 2);
  });
  
  // ✅ NUMERACIÓN GLOBAL - Fotos
  readonly photoNumbersSignal: Signal<string[]> = computed(() => {
    const fotos = this.fotografiasSeccion7 || [];
    return fotos.map((_, index) => 
      this.globalNumbering.getGlobalPhotoNumber(this.seccionId, this.PHOTO_PREFIX, index)
    );
  });

  // ✅ COLUMNAS DE TABLAS (INTEGRADO - SIN SERVICIOS EXTERNOS)
  readonly columnasTableaPET: TableColumn[] = [
    { field: 'categoria', label: 'Categoría', type: 'text', placeholder: 'Grupo de edad', readonly: true },
    { field: 'casos', label: 'Casos', type: 'number', dataType: 'number' },
    { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
  ];

  readonly columnasTableaPEA: TableColumn[] = [
    { field: 'categoria', label: 'Categoría', type: 'text', placeholder: 'PEA, No PEA', readonly: true },
    { field: 'hombres', label: 'Hombres', type: 'number', dataType: 'number' },
    { field: 'porcentajeHombres', label: '% Hombres', type: 'text', readonly: true },
    { field: 'mujeres', label: 'Mujeres', type: 'number', dataType: 'number' },
    { field: 'porcentajeMujeres', label: '% Mujeres', type: 'text', readonly: true },
    { field: 'casos', label: 'Total', type: 'number', dataType: 'number', readonly: true },
    { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
  ];

  readonly columnasTableaPEAOcupada: TableColumn[] = [
    { field: 'categoria', label: 'Categoría', type: 'text', placeholder: 'Ocupada, Desocupada', readonly: true },
    { field: 'hombres', label: 'Hombres', type: 'number', dataType: 'number' },
    { field: 'porcentajeHombres', label: '% Hombres', type: 'text', readonly: true },
    { field: 'mujeres', label: 'Mujeres', type: 'number', dataType: 'number' },
    { field: 'porcentajeMujeres', label: '% Mujeres', type: 'text', readonly: true },
    { field: 'casos', label: 'Total', type: 'number', dataType: 'number', readonly: true },
    { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
  ];

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private globalNumbering: GlobalNumberingService,
    private backendApi: BackendApiService
  ) {
    super(cdRef, injector);

    effect(() => {
      const formData = this.formDataSignal();
      this.datos = { ...formData };
      this.cdRef.markForCheck();
    });

    // ✅ MODO IDEAL: Sincronización automática de tablas PET
    effect(() => {
      const tabla = this.petTablaSignal();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
      const datosActuales = this.datos[petTablaKey];
      
      // Solo actualizar si la tabla en Signal es diferente a la en datos legacy
      if (JSON.stringify(tabla) !== JSON.stringify(datosActuales)) {
        this.datos[petTablaKey] = tabla;
      }
      this.cdRef.markForCheck();
    });

    // ✅ MODO IDEAL: Sincronización automática de tablas PEA
    effect(() => {
      const tabla = this.peaTablaSignal();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
      const datosActuales = this.datos[peaTablaKey];
      
      if (JSON.stringify(tabla) !== JSON.stringify(datosActuales)) {
        this.datos[peaTablaKey] = tabla;
      }
      this.cdRef.markForCheck();
    });

    // ✅ MODO IDEAL: Sincronización automática de tablas PEA Ocupada
    effect(() => {
      const tabla = this.peaOcupadaTablaSignal();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
      const datosActuales = this.datos[peaOcupadaTablaKey];
      
      if (JSON.stringify(tabla) !== JSON.stringify(datosActuales)) {
        this.datos[peaOcupadaTablaKey] = tabla;
      }
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.fotografiasSeccion7 = [...this.fotografiasCache];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  get petConfig() {
    const prefijo = this.prefijoGrupoSignal();
    return {
      tablaKey: `petTabla${prefijo}`,
      totalKey: '',                        // ✅ NO agregar fila de total (viene del backend)
      campoTotal: '',                      // ✅ NO calcular total
      campoPorcentaje: '',                 // ✅ NO calcular porcentaje
      calcularPorcentajes: false,          // ✅ Los datos vienen del backend
      camposParaCalcular: [],
      noInicializarDesdeEstructura: true,  // ✅ No inicializar desde estructura
      permiteAgregarFilas: true,
      permiteEliminarFilas: true
    };
  }

  get peaConfig() {
    const prefijo = this.prefijoGrupoSignal();
    return {
      tablaKey: `peaTabla${prefijo}`,
      totalKey: '',                        // ✅ NO agregar fila de total (viene del backend)
      campoTotal: '',                      // ✅ NO calcular total
      campoPorcentaje: '',                 // ✅ NO calcular porcentaje
      calcularPorcentajes: false,          // ✅ Los datos vienen del backend
      camposParaCalcular: [],
      noInicializarDesdeEstructura: true,  // ✅ No inicializar desde estructura
      permiteAgregarFilas: true,
      permiteEliminarFilas: true
    };
  }

  get peaOcupadaConfig() {
    const prefijo = this.prefijoGrupoSignal();
    return {
      tablaKey: `peaOcupadaTabla${prefijo}`,
      totalKey: '',                        // ✅ NO agregar fila de total (viene del backend)
      campoTotal: '',                      // ✅ NO calcular total
      campoPorcentaje: '',                 // ✅ NO calcular porcentaje
      calcularPorcentajes: false,          // ✅ Los datos vienen del backend
      camposParaCalcular: [],
      noInicializarDesdeEstructura: true,  // ✅ No inicializar desde estructura
      permiteAgregarFilas: true,
      permiteEliminarFilas: true
    };
  }

  protected override onInitCustom(): void {
    // ✅ PRIMERO: Asegurar que las tablas estén completamente vacías
    this.inicializarTablasVacias();
    // ✅ SEGUNDO: Cargar datos del backend
    this.cargarDatosDelBackend();
    this.cargarFotografias();
    this.fotografiasSeccion7 = [...this.fotografiasCache];
  }

  /**
   * ✅ Cargar datos del backend siguiendo el patrón de Sección 6
   * Carga three tablas: PET, PEA, PEA Ocupada/Desocupada
   */
  private cargarDatosDelBackend(): void {
    // ✅ Obtener códigos de centros poblados del grupo AISD actual
    const codigosArray = this.getCodigosCentrosPobladosAISD();
    const codigos = [...codigosArray]; // Copia mutable

    if (!codigos || codigos.length === 0) {
      return;
    }

    const prefijo = this.obtenerPrefijoGrupo();

    // 1. Cargar PET (Población en Edad de Trabajar)
    this.backendApi.postPetGrupo(codigos).subscribe({
      next: (response: any) => {
        const datosTransformados = transformPETDesdeDemograficos(
          unwrapDemograficoData(response?.data || [])
        );
        const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
        this.projectFacade.setField(this.seccionId, null, petTablaKey, datosTransformados);
        this.projectFacade.setField(this.seccionId, null, 'petTabla', datosTransformados);
      },
      error: (err) => {
        console.error('[SECCION7] Error cargando PET:', err);
      }
    });

    // 2. Cargar PEA (Población Económicamente Activa)
    this.backendApi.postPea(codigos).subscribe({
      next: (response: any) => {
        const datosTransformados = transformPEADesdeDemograficos(
          unwrapDemograficoData(response?.data || [])
        );
        const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
        this.projectFacade.setField(this.seccionId, null, peaTablaKey, datosTransformados);
        this.projectFacade.setField(this.seccionId, null, 'peaTabla', datosTransformados);
      },
      error: (err) => {
        console.error('[SECCION7] Error cargando PEA:', err);
      }
    });

    // 3. Cargar PEA Ocupada/Desocupada
    this.backendApi.postPeaOcupadaDesocupada(codigos).subscribe({
      next: (response: any) => {
        const datosTransformados = transformPEAOcupadaDesdeDemograficos(
          unwrapDemograficoData(response?.data || [])
        );
        const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
        this.projectFacade.setField(this.seccionId, null, peaOcupadaTablaKey, datosTransformados);
        this.projectFacade.setField(this.seccionId, null, 'peaOcupadaTabla', datosTransformados);
      },
      error: (err) => {
        console.error('[SECCION7] Error cargando PEA Ocupada:', err);
      }
    });
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
  }

  protected override actualizarDatosCustom(): void {
    this.asegurarArraysValidos();
  }

  asegurarArraysValidos() {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
    const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
    
    // ✅ Solo asegurar que sean arrays - NO inicializar con datos
    if (!Array.isArray(this.datos[petTablaKey])) {
      this.datos[petTablaKey] = [];
    }
    if (!Array.isArray(this.datos[peaTablaKey])) {
      this.datos[peaTablaKey] = [];
    }
    if (!Array.isArray(this.datos[peaOcupadaTablaKey])) {
      this.datos[peaOcupadaTablaKey] = [];
    }
  }

  /**
   * ✅ Inicializar todas las tablas como arrays vacíos
   * Esto asegura que solo se muestren datos del backend
   */
  private inicializarTablasVacias(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // Limpiar tablas principales
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
    const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
    
    // ✅ Establecer como arrays completamente vacíos
    this.projectFacade.setField(this.seccionId, null, petTablaKey, []);
    this.projectFacade.setField(this.seccionId, null, 'petTabla', []);
    this.projectFacade.setField(this.seccionId, null, peaTablaKey, []);
    this.projectFacade.setField(this.seccionId, null, 'peaTabla', []);
    this.projectFacade.setField(this.seccionId, null, peaOcupadaTablaKey, []);
    this.projectFacade.setField(this.seccionId, null, 'peaOcupadaTabla', []);
    
    console.log('[SECCION7] Tablas inicializadas como arrays vacíos');
  }

  getTablaPET(): any[] {
    return this.petTablaSignal();
  }

  getTablaPEA(): any[] {
    return this.peaTablaSignal();
  }

  getTablaPEAOcupada(): any[] {
    return this.peaOcupadaTablaSignal();
  }

  // Agregar método que faltaba para compatibilidad
  getTotalPET(): string {
    const petTabla = this.getTablaPET();
    if (!petTabla || !Array.isArray(petTabla)) {
      return '0';
    }
    
    const total = petTabla.reduce((sum: number, item: any) => {
      const casos = parseInt(item.casos?.toString() || '0') || 0;
      return sum + casos;
    }, 0);
    
    return total.toString();
  }

  // ============ GESTIÓN DE FOTOGRAFÍAS ============

  override cargarFotografias(): void {
    const formData = this.formDataSignal();
    const prefijo = this.obtenerPrefijoGrupo();
    const fotos: FotoItem[] = [];

    for (let i = 1; i <= 10; i++) {
      const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`;
      const imagen = formData[imagenKey];

      if (imagen) {
        const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`;
        const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`;
        const numeroKey = `${this.PHOTO_PREFIX}${i}Numero${prefijo}`;

        fotos.push({
          imagen: imagen,
          titulo: formData[tituloKey] || '',
          fuente: formData[fuenteKey] || '',
          numero: formData[numeroKey] || i
        });
      }
    }

    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
  }

  // ✅ Override: UNICA_VERDAD - Solo guardar en ProjectStateFacade
  // ELIMINADO: super.onFotografiasChange() que escribía en PhotoCoordinator (legacy)
  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    console.log(`[SECCION7:FORM:FOTOS] 📝 onFotografiasChange llamado con ${fotografias.length} fotos`);
    
    // ✅ GUARDAR EN PROJECTSTATEFACADE - ÚNICA FUENTE DE VERDAD
    const prefijo = this.prefijoGrupoSignal();
    console.log(`[SECCION7:FORM:FOTOS] 📝 Prefijo: ${prefijo}, guardando ${fotografias.length} fotos`);
    
    for (let i = 0; i < fotografias.length; i++) {
      const foto = fotografias[i];
      const idx = i + 1;
      
      // ✅ Usar PHOTO_PREFIX consistente
      const imgKey = `${this.PHOTO_PREFIX}${idx}Imagen${prefijo}`;
      const titKey = `${this.PHOTO_PREFIX}${idx}Titulo${prefijo}`;
      const fuenteKey = `${this.PHOTO_PREFIX}${idx}Fuente${prefijo}`;
      const numeroKey = `${this.PHOTO_PREFIX}${idx}Numero${prefijo}`;
      
      console.log(`[SECCION7:FORM:FOTOS] 💾 Guardando: ${imgKey}`);
      
      this.projectFacade.setField(this.seccionId, null, imgKey, foto.imagen);
      this.projectFacade.setField(this.seccionId, null, titKey, foto.titulo);
      this.projectFacade.setField(this.seccionId, null, fuenteKey, foto.fuente);
      this.projectFacade.setField(this.seccionId, null, numeroKey, idx);
    }
    
    console.log(`[SECCION7:FORM:FOTOS] ✅ Guardado completado en UNICA_VERDAD`);
    
    // Actualizar referencia local
    this.fotografiasSeccion7 = fotografias;
    this.cdRef.markForCheck();
  }

  // ============ MÉTODOS DE TEXTO (INTEGRADOS - SIN SERVICIOS EXTERNOS) ============

  obtenerTextoSeccion7PETCompleto(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `parrafoSeccion7_pet_completo${prefijo}`;
    const texto = this.datos[manualKey] || this.datos['parrafoSeccion7_pet_completo'];
    if (texto && texto.trim() !== '') return texto;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    return `En concordancia con el Convenio 138 de la Organización Internacional de Trabajo (OIT), aprobado por Resolución Legislativa Nº27453 de fecha 22 de mayo del 2001 y ratificado por DS Nº038-2001-RE, publicado el 31 de mayo de 2001, la población cumplida los 14 años de edad se encuentra en edad de trabajar.\n\nLa población en edad de trabajar (PET) de la CC ${grupoAISD}, considerada desde los 15 años a más, se compone de la población total. El bloque etario que más aporta a la PEA es el de 15 a 29 años. Por otro lado, el grupo etario que menos aporta al indicador es el de 65 años a más.`;
  }

  obtenerTextoPET(): string {
    return this.obtenerTextoSeccion7PETCompleto();
  }

  obtenerTextoDetalePEA(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `textoDetalePEA${prefijo}`;
    const texto = this.datos[manualKey] || this.datos['textoDetalePEA'];
    
    // ✅ Generar texto por defecto si está vacío (igual que en la vista)
    if (!texto || texto.trim() === '') {
      return `La Población Económicamente Activa (PEA) constituye un indicador fundamental para comprender la dinámica económica y social. En este apartado, se presenta la caracterización de la PEA del distrito, empleando información oficial del INEI.`;
    }
    
    return texto;
  }

  obtenerTextoDefinicionPEA(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `textoDefinicionPEA${prefijo}`;
    return this.datos[manualKey] || this.datos['textoDefinicionPEA'] || 'La Población Económicamente Activa (PEA) corresponde a todas aquellas personas en edad de trabajar que se encuentran empleadas o desempleadas activamente buscando empleo.';
  }

  obtenerTextoAnalisisPEA(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `textoAnalisisPEA${prefijo}`;
    const texto = this.datos[manualKey] || this.datos['textoAnalisisPEA'];
    
    // ✅ Generar texto por defecto si está vacío (igual que en la vista)
    if (!texto || texto.trim() === '') {
      return `Del cuadro precedente, se aprecia que la PEA representa un porcentaje importante de la población en edad de trabajar. Asimismo, se evidencia una distribución diferenciada entre hombres y mujeres en su participación económica.`;
    }
    
    return texto;
  }

  obtenerTextoIndiceDesempleo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `textoIndiceDesempleo${prefijo}`;
    const texto = this.datos[manualKey] || this.datos['textoIndiceDesempleo'];
    
    // ✅ Generar texto por defecto si está vacío (igual que en la vista)
    if (!texto || texto.trim() === '') {
      return `El índice de desempleo es un indicador clave para evaluar la salud económica de la jurisdicción. Refleja la proporción de la Población Económicamente Activa (PEA) que se encuentra en búsqueda activa de empleo sin haberlo logrado obtener.`;
    }
    
    return texto;
  }

  obtenerTextoAnalisisOcupacion(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `textoAnalisisOcupacion${prefijo}`;
    return this.datos[manualKey] || this.datos['textoAnalisisOcupacion'] || 'Del cuadro precedente, se halla que la PEA Desocupada representa un porcentaje del total de la PEA. En adición a ello, se aprecia que tanto hombres como mujeres se encuentran predominantemente en el indicador de PEA Ocupada.';
  }

  obtenerTextoSeccion7SituacionEmpleoCompleto(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `parrafoSeccion7_situacion_empleo_completo${prefijo}`;
    const texto = this.datos[manualKey] || this.datos['parrafoSeccion7_situacion_empleo_completo'];
    
    // ✅ Generar texto por defecto si está vacío (igual que en la vista)
    if (!texto || texto.trim() === '') {
      return `La situación del empleo refleja la estructura económica de la localidad. Permite diferenciar entre aquellos que trabajan de manera independiente, en actividades autónomas, y quienes se encuentran en empleos dependientes bajo relación laboral establecida.`;
    }
    
    return texto;
  }

  obtenerTextoSeccion7IngresosCompleto(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const manualKey = `parrafoSeccion7_ingresos_completo${prefijo}`;
    const texto = this.datos[manualKey] || this.datos['parrafoSeccion7_ingresos_completo'];
    
    // ✅ Generar texto por defecto si está vacío (igual que en la vista)
    if (!texto || texto.trim() === '') {
      return `Los ingresos de la población provienen principalmente de las actividades económicas locales. Sin embargo, debido a dependencia de estos sectores y fluctuaciones del mercado, los ingresos no siempre resultan estables ni regulares, generando vulnerabilidad económica en las familias.`;
    }
    
    return texto;
  }

  // ============ MÉTODOS DE PORCENTAJES ============

  getPorcentajePET(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const poblacionKey = prefijo ? `tablaAISD2TotalPoblacion${prefijo}` : 'tablaAISD2TotalPoblacion';
    const totalPoblacion = parseInt(this.datos[poblacionKey] || this.datos.tablaAISD2TotalPoblacion || '0') || 0;
    const totalPET = parseInt(this.getTotalPET()) || 0;
    
    if (totalPoblacion === 0 || totalPET === 0) {
      return '____';
    }
    
    const porcentaje = ((totalPET / totalPoblacion) * 100);
    return porcentaje.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ',') + ' %';
  }

  getPorcentajePETGrupo(rangoInicio: string): string {
    const petTabla = this.getTablaPET();
    if (!petTabla || !Array.isArray(petTabla)) {
      return '____';
    }
    
    const grupo = petTabla.find((item: any) => {
      if (!item.categoria) return false;
      const cat = item.categoria.toString().toLowerCase();
      const rangoLower = rangoInicio.toLowerCase();
      
      if (rangoLower === '15 a 29' || rangoLower === '15-29') {
        return cat.includes('15') && (cat.includes('29') || cat.includes('30'));
      }
      if (rangoLower === '65' || rangoLower === '65 a más') {
        return cat.includes('65') || cat.includes('65 a más');
      }
      
      return cat.includes(rangoLower);
    });
    
    return grupo?.porcentaje || '____';
  }

  getPorcentajePEA(): string {
    const peaTabla = this.getTablaPEA();
    if (!peaTabla || !Array.isArray(peaTabla)) {
      return '____';
    }
    const pea = peaTabla.find((item: any) => 
      item.categoria && item.categoria.includes('PEA Ocupada')
    );
    return pea?.porcentaje || '____';
  }

  getPorcentajeNoPEA(): string {
    const peaTabla = this.getTablaPEA();
    if (!peaTabla || !Array.isArray(peaTabla)) {
      return '____';
    }
    const noPea = peaTabla.find((item: any) => item.categoria === 'No PEA');
    return noPea?.porcentaje || '____';
  }

  getPorcentajePEAHombres(): string {
    const peaTabla = this.getTablaPEA();
    if (!peaTabla || !Array.isArray(peaTabla)) {
      return '____';
    }
    const pea = peaTabla.find((item: any) => 
      item.categoria && item.categoria.includes('PEA Ocupada')
    );
    return pea?.porcentajeHombres || '____';
  }

  getPorcentajeNoPEAMujeres(): string {
    const peaTabla = this.getTablaPEA();
    if (!peaTabla || !Array.isArray(peaTabla)) {
      return '____';
    }
    const noPea = peaTabla.find((item: any) => item.categoria === 'No PEA');
    return noPea?.porcentajeMujeres || '____';
  }

  getPorcentajePEADesocupada(): string {
    const peaOcupadaTabla = this.getTablaPEAOcupada();
    if (!peaOcupadaTabla || !Array.isArray(peaOcupadaTabla)) {
      return '____';
    }
    const desocupada = peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('desocupada')
    );
    return desocupada?.porcentaje || '____';
  }

  getPorcentajePEAOcupadaHombres(): string {
    const peaOcupadaTabla = this.getTablaPEAOcupada();
    if (!peaOcupadaTabla || !Array.isArray(peaOcupadaTabla)) {
      return '____';
    }
    const ocupada = peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && !item.categoria.toLowerCase().includes('desocupada')
    );
    return ocupada?.porcentajeHombres || '____';
  }

  getPorcentajePEAOcupadaMujeres(): string {
    const peaOcupadaTabla = this.getTablaPEAOcupada();
    if (!peaOcupadaTabla || !Array.isArray(peaOcupadaTabla)) {
      return '____';
    }
    const ocupada = peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && !item.categoria.toLowerCase().includes('desocupada')
    );
    return ocupada?.porcentajeMujeres || '____';
  }

  protected override onFieldChange(fieldId: string, value: any): void {
    let valorLimpio: any = value;
    if (value === undefined || value === 'undefined') {
      valorLimpio = '';
    }

    super.onFieldChange(fieldId, valorLimpio);
  }

  onTablaPETActualizada(): void {
    // ✅ MODO IDEAL: Persistir tabla actualizada
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const tablaActual = this.datos[petTablaKey] || [];
    
    // Persistir cambios al projectFacade
    this.projectFacade.setField(this.seccionId, null, petTablaKey, tablaActual);
    
    this.cdRef.markForCheck();
  }

  onTablaPEAActualizada(): void {
    // ✅ MODO IDEAL: Persistir tabla actualizada
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
    const tablaActual = this.datos[peaTablaKey] || [];
    
    // Persistir cambios al projectFacade
    this.projectFacade.setField(this.seccionId, null, peaTablaKey, tablaActual);
    
    this.cdRef.markForCheck();
  }

  onTablaPEAOcupadaActualizada(): void {
    // ✅ MODO IDEAL: Persistir tabla actualizada
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
    const tablaActual = this.datos[peaOcupadaTablaKey] || [];
    
    // Persistir cambios al projectFacade
    this.projectFacade.setField(this.seccionId, null, peaOcupadaTablaKey, tablaActual);
    
    this.cdRef.markForCheck();
  }

  trackByIndex(index: number): number {
    return index;
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }
}