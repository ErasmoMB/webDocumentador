import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { SECCION25_TEMPLATES, SECCION25_WATCHED_FIELDS } from './seccion25-constants';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { debugLog } from 'src/app/shared/utils/debug';

// ✅ Helper para desenvuelver datos del backend
const unwrapDemograficoData = (responseData: any): any[] => {
  if (!responseData) return [];
  // El backend devuelve un array con un objeto que contiene rows
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

// ✅ Función de transformación para Tipos de Vivienda
const transformTiposViviendaDesdeDemograficos = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  return data.map(item => ({
    categoria: item.categoria || item.f0 || '',
    casos: typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0,
    porcentaje: item.porcentaje || item.f2 || ''
  }));
};

// ✅ Función de transformación para Condición de Ocupación
const transformCondicionOcupacionDesdeDemograficos = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  return data.map(item => ({
    categoria: item.categoria || item.f0 || '',
    casos: typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0,
    porcentaje: item.porcentaje || item.f2 || ''
  }));
};

// ✅ Función de transformación para Materiales de Vivienda
const transformMaterialesViviendaDesdeDemograficos = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  return data.map(item => ({
    categoria: item.categoria || item.f0 || '',
    subcategoria: item.subcategoria || '',  // ✅ Incluir subcategoria del backend
    casos: typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0,
    porcentaje: item.porcentaje || item.f2 || ''
  }));
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, ImageUploadComponent, DynamicTableComponent, ParagraphEditorComponent],
  selector: 'app-seccion25-form',
  templateUrl: './seccion25-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion25FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.4';
  @Input() override modoFormulario: boolean = false;

  // ✅ PHOTO_PREFIX como Signal para que se actualice cuando cambie el grupo
  readonly photoPrefixSignal: Signal<string>;
  
  // ✅ NUMERACIÓN GLOBAL
  readonly globalTableNumberSignal: Signal<string>;
  readonly globalTableNumberSignal2: Signal<string>;
  readonly globalTableNumberSignal3: Signal<string>;
  readonly globalPhotoNumbersSignal: Signal<string[]>;
  
  override readonly PHOTO_PREFIX: string;
  override useReactiveSync: boolean = true;

  fotografiasSeccion25: FotoItem[] = [];

  override watchedFields: string[] = SECCION25_WATCHED_FIELDS;

  // ✅ EXPORTAR TEMPLATES para el HTML
  readonly SECCION25_TEMPLATES = SECCION25_TEMPLATES;

  // ✅ CAMPOS AUTO-SYNC (NUEVA ARQUITECTURA)
  readonly textoVivienda = this.createAutoSyncField('textoViviendaAISI', '');
  readonly textoOcupacion = this.createAutoSyncField('textoOcupacionViviendaAISI', '');
  readonly textoEstructura = this.createAutoSyncField('textoEstructuraAISI', '');
  readonly cuadroTituloTiposVivienda = this.createAutoSyncField('cuadroTituloTiposVivienda', '');
  readonly cuadroFuenteTiposVivienda = this.createAutoSyncField('cuadroFuenteTiposVivienda', '');
  readonly cuadroTituloCondicionOcupacion = this.createAutoSyncField('cuadroTituloCondicionOcupacion', '');
  readonly cuadroFuenteCondicionOcupacion = this.createAutoSyncField('cuadroFuenteCondicionOcupacion', '');
  readonly cuadroTituloMaterialesVivienda = this.createAutoSyncField('cuadroTituloMaterialesVivienda', '');
  readonly cuadroFuenteMaterialesVivienda = this.createAutoSyncField('cuadroFuenteMaterialesVivienda', '');

  // SIGNALS
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly textoViviendaSignal = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `textoViviendaAISI${prefijo}` : 'textoViviendaAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoViviendaDefault();
  });

  readonly textoOcupacionSignal = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `textoOcupacionViviendaAISI${prefijo}` : 'textoOcupacionViviendaAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoOcupacionDefault();
  });

  readonly textoEstructuraSignal = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldKey = prefijo ? `textoEstructuraAISI${prefijo}` : 'textoEstructuraAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoEstructuraDefault();
  });

  readonly tiposViviendaSignal = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const key = prefijo ? `tiposViviendaAISI${prefijo}` : 'tiposViviendaAISI';
    return Array.isArray(data[key]) ? data[key] : [];
  });

  readonly condicionOcupacionSignal = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const key = prefijo ? `condicionOcupacionAISI${prefijo}` : 'condicionOcupacionAISI';
    return Array.isArray(data[key]) ? data[key] : [];
  });

  readonly materialesViviendaSignal = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const key = prefijo ? `materialesViviendaAISI${prefijo}` : 'materialesViviendaAISI';
    return Array.isArray(data[key]) ? data[key] : [];
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // Fotos computed directly from imageFacade like other sections (Seccion24 pattern)
  readonly fotosSignal: Signal<FotoItem[]> = computed(() => {
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix);
  });


  // ✅ Table configs con noInicializarDesdeEstructura - datos del backend
  tiposViviendaConfig: TableConfig = {
    tablaKey: 'tiposViviendaAISI',
    totalKey: '',                        // ✅ Sin fila de total separada
    campoTotal: '',                      // ✅ Backend ya envía Total
    campoPorcentaje: '',                 // ✅ No calcular porcentaje
    noInicializarDesdeEstructura: true,  // ✅ No inicializar vacía
    calcularPorcentajes: false,          // ✅ Backend ya calcula
    camposParaCalcular: [],
    permiteAgregarFilas: false,          // ✅ Solo lectura
    permiteEliminarFilas: false          // ✅ Solo lectura
  };

  condicionOcupacionConfig: TableConfig = {
    tablaKey: 'condicionOcupacionAISI',
    totalKey: '',                        // ✅ Sin fila de total separada
    campoTotal: '',                      // ✅ Backend ya envía Total
    campoPorcentaje: '',                 // ✅ No calcular porcentaje
    noInicializarDesdeEstructura: true,  // ✅ No inicializar vacía
    calcularPorcentajes: false,          // ✅ Backend ya calcula
    camposParaCalcular: [],
    permiteAgregarFilas: false,          // ✅ Solo lectura
    permiteEliminarFilas: false          // ✅ Solo lectura
  };

  materialesViviendaConfig: TableConfig = {
    tablaKey: 'materialesViviendaAISI',
    totalKey: '',                        // ✅ Sin fila de total separada
    campoTotal: '',                      // ✅ Backend ya envía Total
    campoPorcentaje: '',                 // ✅ No calcular porcentaje
    noInicializarDesdeEstructura: true,  // ✅ No inicializar vacía
    calcularPorcentajes: false,          // ✅ Backend ya calcula
    camposParaCalcular: [],
    permiteAgregarFilas: false,          // ✅ Solo lectura
    permiteEliminarFilas: false          // ✅ Solo lectura
  };

  // viewModel
  readonly viewModel = computed(() => ({
    textoVivienda: this.textoVivienda.value() || this.generarTextoViviendaDefault(),
    textoOcupacion: this.textoOcupacion.value() || this.generarTextoOcupacionDefault(),
    textoEstructura: this.textoEstructura.value() || this.generarTextoEstructuraDefault(),
    tiposVivienda: this.tiposViviendaSignal(),
    condicionOcupacion: this.condicionOcupacionSignal(),
    materiales: this.materialesViviendaSignal(),
    fotos: this.fotosSignal(),

    // Mirror cuadro titulo/fuente fields for use in template without reading datos directly
    cuadroTituloTiposVivienda: this.cuadroTituloTiposVivienda.value() ?? '',
    cuadroFuenteTiposVivienda: this.cuadroFuenteTiposVivienda.value() ?? '',
    cuadroTituloCondicionOcupacion: this.cuadroTituloCondicionOcupacion.value() ?? '',
    cuadroFuenteCondicionOcupacion: this.cuadroFuenteCondicionOcupacion.value() ?? '',
    cuadroTituloMaterialesVivienda: this.cuadroTituloMaterialesVivienda.value() ?? '',
    cuadroFuenteMaterialesVivienda: this.cuadroFuenteMaterialesVivienda.value() ?? ''
  }));

  constructor(
    cdRef: ChangeDetectorRef, 
    injector: Injector, 
    private globalNumbering: GlobalNumberingService,
    private formChange: FormChangeService,
    private backendApi: BackendApiService
  ) {
    super(cdRef, injector);
    
    // ✅ Crear Signal para PHOTO_PREFIX dinámico
    this.photoPrefixSignal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const prefix = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';
      return prefix;
    });
    
    // Inicializar PHOTO_PREFIX para compatibilidad
    this.PHOTO_PREFIX = this.photoPrefixSignal();
    
    // ✅ Signal para número global de tabla (primera tabla: tiposViviendaAISI)
    this.globalTableNumberSignal = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
      return globalNum;
    });
    
    // ✅ Signal para número global de tabla (segunda tabla: condicionOcupacionAISI)
    this.globalTableNumberSignal2 = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);

      return globalNum;
    });
    
    // ✅ Signal para número global de tabla (tercera tabla: materialesViviendaAISI)
    this.globalTableNumberSignal3 = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 2);
      return globalNum;
    });
    
    // ✅ Signal para números globales de fotos
    this.globalPhotoNumbersSignal = computed(() => {
      const prefix = this.photoPrefixSignal();
      const fotos = this.fotosSignal();
      const photoNumbers = fotos.map((_, index) => {
        return this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index);
      });
      return photoNumbers;
    });

    // EFFECT: Sync datos
    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    // EFFECT: photos - watch foto fields hash and imageFacade group (ensures form updates when images or metas change)
    effect(() => {
      this.photoFieldsHash();
      // Read fotosSignal so the effect depends on image store
      const fotos = this.fotosSignal() || [];
      // synchronize local caches
      this.fotografiasSeccion25 = fotos;
      this.fotografiasFormMulti = [...this.fotografiasSeccion25];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }


  protected override onInitCustom(): void {
    // ✅ AUTO-LLENAR centroPobladoAISI con el nombre del grupo AISI actual
    const centroPobladoAISI = this.obtenerCentroPobladoAISI();
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
    
    // Actualizar tanto el objeto local como el store
    this.datos[campoConPrefijo] = centroPobladoAISI;
    this.datos['centroPobladoAISI'] = centroPobladoAISI;
    this.projectFacade.setField(this.seccionId, null, campoConPrefijo, centroPobladoAISI);
    try { this.formChange.persistFields(this.seccionId, 'form', { [campoConPrefijo]: centroPobladoAISI }); } catch (e) {}
    
    this.cargarFotografias();

    // Auto-fill table titles and sources when tables are present but title/source fields are empty
    try {
      const datos = this.datos || {};

      // Auto-fill table titles and sources when tables are present but title/source fields are empty
      const prefijo = this.obtenerPrefijoGrupo();
      const tituloTiposKey = prefijo ? `cuadroTituloTiposVivienda${prefijo}` : 'cuadroTituloTiposVivienda';
      const fuenteTiposKey = prefijo ? `cuadroFuenteTiposVivienda${prefijo}` : 'cuadroFuenteTiposVivienda';
      const tituloCondKey = prefijo ? `cuadroTituloCondicionOcupacion${prefijo}` : 'cuadroTituloCondicionOcupacion';
      const fuenteCondKey = prefijo ? `cuadroFuenteCondicionOcupacion${prefijo}` : 'cuadroFuenteCondicionOcupacion';
      const tituloMatKey = prefijo ? `cuadroTituloMaterialesVivienda${prefijo}` : 'cuadroTituloMaterialesVivienda';
      const fuenteMatKey = prefijo ? `cuadroFuenteMaterialesVivienda${prefijo}` : 'cuadroFuenteMaterialesVivienda';
      
      if (Array.isArray(datos[this.getTablaKeyTiposVivienda()]) && (datos[tituloTiposKey] === undefined || datos[tituloTiposKey] === '' || datos[tituloTiposKey] === '____')) {
        this.cuadroTituloTiposVivienda.update(SECCION25_TEMPLATES.tituloTiposViviendaDefault);
      }
      if (Array.isArray(datos[this.getTablaKeyTiposVivienda()]) && (datos[fuenteTiposKey] === undefined || datos[fuenteTiposKey] === '' || datos[fuenteTiposKey] === '____')) {
        this.cuadroFuenteTiposVivienda.update(SECCION25_TEMPLATES.fuenteDefault);
      }

      if (Array.isArray(datos[this.getTablaKeyCondicionOcupacion()]) && (datos[tituloCondKey] === undefined || datos[tituloCondKey] === '' || datos[tituloCondKey] === '____')) {
        this.cuadroTituloCondicionOcupacion.update(SECCION25_TEMPLATES.tituloCondicionOcupacionDefault);
      }
      if (Array.isArray(datos[this.getTablaKeyCondicionOcupacion()]) && (datos[fuenteCondKey] === undefined || datos[fuenteCondKey] === '' || datos[fuenteCondKey] === '____')) {
        this.cuadroFuenteCondicionOcupacion.update(SECCION25_TEMPLATES.fuenteDefault);
      }

      if (Array.isArray(datos[this.getTablaKeyMaterialesVivienda()]) && (datos[tituloMatKey] === undefined || datos[tituloMatKey] === '' || datos[tituloMatKey] === '____')) {
        this.cuadroTituloMaterialesVivienda.update(SECCION25_TEMPLATES.tituloMaterialesViviendaDefault);
      }
      if (Array.isArray(datos[this.getTablaKeyMaterialesVivienda()]) && (datos[fuenteMatKey] === undefined || datos[fuenteMatKey] === '' || datos[fuenteMatKey] === '____')) {
        this.cuadroFuenteMaterialesVivienda.update(SECCION25_TEMPLATES.fuenteDefault);
      }

      // ✅ CORREGIDO - Usar campos con prefijo para párrafos
      const textoViviendaKey = prefijo ? `textoViviendaAISI${prefijo}` : 'textoViviendaAISI';
      const textoOcupacionKey = prefijo ? `textoOcupacionViviendaAISI${prefijo}` : 'textoOcupacionViviendaAISI';
      const textoEstructuraKey = prefijo ? `textoEstructuraAISI${prefijo}` : 'textoEstructuraAISI';
      
      const textoViviendaField = this.projectFacade.selectField(this.seccionId, null, textoViviendaKey)();
      if (textoViviendaField === undefined || textoViviendaField === null || textoViviendaField === '') {
        this.textoVivienda.update(this.obtenerTextoViviendaAISI());
      }

      const textoOcupacionField = this.projectFacade.selectField(this.seccionId, null, textoOcupacionKey)();
      if (textoOcupacionField === undefined || textoOcupacionField === null || textoOcupacionField === '') {
        this.textoOcupacion.update(this.obtenerTextoOcupacionViviendaAISI());
      }

      const textoEstructuraField = this.projectFacade.selectField(this.seccionId, null, textoEstructuraKey)();
      if (textoEstructuraField === undefined || textoEstructuraField === null || textoEstructuraField === '') {
        this.textoEstructura.update(this.obtenerTextoEstructuraAISI());
      }

      // NOTE: Tablas se llenan con datos del backend (no hay estructura inicial)
      // La configuración `noInicializarDesdeEstructura: true` en los TableConfigs asegura esto
      
      // ✅ FASE 3: Cargar datos demográficos desde el backend
      this.inicializarTablasVacias();  // Primero vacías
      this.cargarDatosDelBackend();    // Luego llenar con backend
    } catch (e) {
      /* no bloquear inicio por este auto-fill */
    }
  }

  /**
   * ✅ Inicializa las tablas de vivienda como arrays vacíos
   * Se cargará del backend en cargarDatosDelBackend()
   */
  private inicializarTablasVacias(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // Inicializar Tipos de Vivienda
    const tablaKeyTipos = `tiposViviendaAISI${prefijo}`;
    this.projectFacade.setField(this.seccionId, null, tablaKeyTipos, []);
    this.projectFacade.setField(this.seccionId, null, 'tiposViviendaAISI', []);
    
    // Inicializar Condición de Ocupación
    const tablaKeyCond = `condicionOcupacionAISI${prefijo}`;
    this.projectFacade.setField(this.seccionId, null, tablaKeyCond, []);
    this.projectFacade.setField(this.seccionId, null, 'condicionOcupacionAISI', []);
    
    // Inicializar Materiales de Vivienda
    const tablaKeyMat = `materialesViviendaAISI${prefijo}`;
    this.projectFacade.setField(this.seccionId, null, tablaKeyMat, []);
    this.projectFacade.setField(this.seccionId, null, 'materialesViviendaAISI', []);
  }

  /**
   * ✅ Carga datos de los endpoints del backend para las tablas de vivienda
   * - tiposViviendaAISI: /demograficos/tipo-vivienda
   * - condicionOcupacionAISI: /demograficos/condicion-ocupacion-cpp
   * - materialesViviendaAISI: /demograficos/materiales-por-cpp
   */
  private cargarDatosDelBackend(): void {
    // ✅ USAR getCodigosCentrosPobladosAISI() DEL GRUPO ACTUAL (clase base)
    const codigosArray = this.getCodigosCentrosPobladosAISI();
    const codigos = [...codigosArray]; // Crear copia mutable

    if (!codigos || codigos.length === 0) {
      debugLog('[SECCION25] ⚠️ No hay centros poblados en el grupo actual para cargar datos');
      return;
    }

    debugLog('[SECCION25] 📡 Cargando datos de viviendas desde backend...');

    // ✅ OBTENER PREFIJO PARA GUARDAR CON CLAVE CORRECTA
    const prefijo = this.obtenerPrefijoGrupo();

    // 1️⃣ Cargar Tipos de Vivienda
    this.backendApi.postTipoVivienda(codigos).subscribe({
      next: (response: any) => {
        try {
          const dataRaw = response?.data || [];
          const datosDesenvueltos = unwrapDemograficoData(dataRaw);
          const datosTransformados = transformTiposViviendaDesdeDemograficos(datosDesenvueltos);
          debugLog('[SECCION25] ✅ Tipos de vivienda cargados:', datosTransformados);
          
          if (datosTransformados.length > 0) {
            const tablaKey = `tiposViviendaAISI${prefijo}`;
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            this.projectFacade.setField(this.seccionId, null, 'tiposViviendaAISI', datosTransformados);
            this.cdRef.markForCheck();
          }
        } catch (e) {
          debugLog('[SECCION25] ❌ Error transformando tipos de vivienda:', e);
        }
      },
      error: (err: any) => {
        debugLog('[SECCION25] ❌ Error cargando tipos de vivienda:', err);
      }
    });

    // 2️⃣ Cargar Condición de Ocupación
    this.backendApi.postCondicionOcupacionCpp(codigos).subscribe({
      next: (response: any) => {
        try {
          const dataRaw = response?.data || [];
          const datosDesenvueltos = unwrapDemograficoData(dataRaw);
          const datosTransformados = transformCondicionOcupacionDesdeDemograficos(datosDesenvueltos);
          debugLog('[SECCION25] ✅ Condición de ocupación cargada:', datosTransformados);
          
          if (datosTransformados.length > 0) {
            const tablaKey = `condicionOcupacionAISI${prefijo}`;
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            this.projectFacade.setField(this.seccionId, null, 'condicionOcupacionAISI', datosTransformados);
            this.cdRef.markForCheck();
          }
        } catch (e) {
          debugLog('[SECCION25] ❌ Error transformando condición de ocupación:', e);
        }
      },
      error: (err: any) => {
        debugLog('[SECCION25] ❌ Error cargando condición de ocupación:', err);
      }
    });

    // 3️⃣ Cargar Materiales de Vivienda
    this.backendApi.postMaterialesPorCpp(codigos).subscribe({
      next: (response: any) => {
        try {
          const dataRaw = response?.data || [];
          const datosDesenvueltos = unwrapDemograficoData(dataRaw);
          const datosTransformados = transformMaterialesViviendaDesdeDemograficos(datosDesenvueltos);
          debugLog('[SECCION25] ✅ Materiales de vivienda cargados:', datosTransformados);
          
          if (datosTransformados.length > 0) {
            const tablaKey = `materialesViviendaAISI${prefijo}`;
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            this.projectFacade.setField(this.seccionId, null, 'materialesViviendaAISI', datosTransformados);
            this.cdRef.markForCheck();
          }
        } catch (e) {
          debugLog('[SECCION25] ❌ Error transformando materiales de vivienda:', e);
        }
      },
      error: (err: any) => {
        debugLog('[SECCION25] ❌ Error cargando materiales de vivienda:', err);
      }
    });
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  // Handlers
  onFotografiasChangeHandler(fotografias: FotoItem[], prefix?: string): void {
    // Delegate to base handler
    this.onFotografiasChange(fotografias, prefix);
    this.cdRef.markForCheck();
  }

  onTiposViviendaFieldChange(index: number, field: string, value: any): void {
    const tablaKey = this.getTablaKeyTiposVivienda();
    const tabla = this.datos[tablaKey] || this.datos.tiposViviendaAISI || [];
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      if (field === 'casos') {
        const total = tabla.reduce((sum: number, item: any) => {
          const categoria = item.categoria?.toString().toLowerCase() || '';
          if (categoria.includes('total')) return sum;
          const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
          return sum + casos;
        }, 0);
        if (total > 0) {
          tabla.forEach((item: any) => {
            const categoria = item.categoria?.toString().toLowerCase() || '';
            if (!categoria.includes('total')) {
              const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
              const porcentaje = ((casos / total) * 100)
                .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                .replace('.', ',') + ' %';
              item.porcentaje = porcentaje;
            }
          });
        }
      }
      this.datos[tablaKey] = [...tabla];

      // Persistir correctamente como tabla (store y formulario) y notificar sync
      try { this.projectFacade.setTableData(this.seccionId, null, tablaKey, this.datos[tablaKey]); } catch (e) {}
      try {
        const FormChangeServiceToken = require('src/app/core/services/state/form-change.service').FormChangeService;
        const formChange = this.injector.get(FormChangeServiceToken, null);
        if (formChange) formChange.persistFields(this.seccionId, 'table', { [tablaKey]: this.datos[tablaKey] }, { notifySync: true });
      } catch (e) {}

      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onTiposViviendaTableUpdated(updated?: any[]): void {
    const key = this.getTablaKeyTiposVivienda();
    const datos = updated || this.datos[key] || [];
    this.datos[key] = [...datos];
    try { this.projectFacade.setTableData(this.seccionId, null, key, this.datos[key]); } catch (e) {}
    try {
      // ✅ CORREGIDO - Usar prefijos para párrafos
      const prefijo = this.obtenerPrefijoGrupo();
      const textPayload: any = {};
      const textoViviendaKey = prefijo ? `textoViviendaAISI${prefijo}` : 'textoViviendaAISI';
      const textoOcupacionKey = prefijo ? `textoOcupacionViviendaAISI${prefijo}` : 'textoOcupacionViviendaAISI';
      const textoEstructuraKey = prefijo ? `textoEstructuraAISI${prefijo}` : 'textoEstructuraAISI';
      if (this.datos[textoViviendaKey] !== undefined) textPayload[textoViviendaKey] = this.datos[textoViviendaKey];
      if (this.datos[textoOcupacionKey] !== undefined) textPayload[textoOcupacionKey] = this.datos[textoOcupacionKey];
      if (this.datos[textoEstructuraKey] !== undefined) textPayload[textoEstructuraKey] = this.datos[textoEstructuraKey];

      this.formChange.persistFields(this.seccionId, 'table', { [key]: this.datos[key], ...textPayload }, { notifySync: true });
    } catch (e) {}
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onCondicionOcupacionFieldChange(index: number, field: string, value: any): void {
    const tablaKey = this.getTablaKeyCondicionOcupacion();
    const tabla = this.datos[tablaKey] || this.datos.condicionOcupacionAISI || [];
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      if (field === 'casos') {
        const total = tabla.reduce((sum: number, item: any) => {
          const categoria = item.categoria?.toString().toLowerCase() || '';
          if (categoria.includes('total')) return sum;
          const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
          return sum + casos;
        }, 0);
        if (total > 0) {
          tabla.forEach((item: any) => {
            const categoria = item.categoria?.toString().toLowerCase() || '';
            if (!categoria.includes('total')) {
              const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
              const porcentaje = ((casos / total) * 100)
                .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                .replace('.', ',') + ' %';
              item.porcentaje = porcentaje;
            }
          });
        }
      }
      this.datos[tablaKey] = [...tabla];
      try { this.projectFacade.setTableData(this.seccionId, null, tablaKey, this.datos[tablaKey]); } catch (e) {}
      try {
        const FormChangeServiceToken = require('src/app/core/services/state/form-change.service').FormChangeService;
        const formChange = this.injector.get(FormChangeServiceToken, null);
        if (formChange) formChange.persistFields(this.seccionId, 'table', { [tablaKey]: this.datos[tablaKey] }, { notifySync: true });
      } catch (e) {}
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onCondicionOcupacionTableUpdated() {
    const tablaKey = this.getTablaKeyCondicionOcupacion();
    const tabla = this.datos[tablaKey] || this.datos.condicionOcupacionAISI || [];
    this.datos[tablaKey] = [...tabla];
    try { this.projectFacade.setTableData(this.seccionId, null, tablaKey, this.datos[tablaKey]); } catch (e) {}
    try {
      // ✅ CORREGIDO - Usar prefijos para párrafos
      const prefijo = this.obtenerPrefijoGrupo();
      const textPayload: any = {};
      const textoViviendaKey = prefijo ? `textoViviendaAISI${prefijo}` : 'textoViviendaAISI';
      const textoOcupacionKey = prefijo ? `textoOcupacionViviendaAISI${prefijo}` : 'textoOcupacionViviendaAISI';
      const textoEstructuraKey = prefijo ? `textoEstructuraAISI${prefijo}` : 'textoEstructuraAISI';
      if (this.datos[textoViviendaKey] !== undefined) textPayload[textoViviendaKey] = this.datos[textoViviendaKey];
      if (this.datos[textoOcupacionKey] !== undefined) textPayload[textoOcupacionKey] = this.datos[textoOcupacionKey];
      if (this.datos[textoEstructuraKey] !== undefined) textPayload[textoEstructuraKey] = this.datos[textoEstructuraKey];

      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: this.datos[tablaKey], ...textPayload }, { notifySync: true });
    } catch (e) {}
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onMaterialesViviendaFieldChange(index: number, field: string, value: any) {
    const tablaKey = this.getTablaKeyMaterialesVivienda();
    const tabla = this.datos[tablaKey] || this.datos['materialesViviendaAISI'] || [];
    
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      
      if (field === 'casos') {
        this.calcularPorcentajesMaterialesViviendaAISI();
      }
      
      this.datos[tablaKey] = [...tabla];
      try { this.projectFacade.setTableData(this.seccionId, null, tablaKey, this.datos[tablaKey]); } catch (e) {}
      try {
        const FormChangeServiceToken = require('src/app/core/services/state/form-change.service').FormChangeService;
        const formChange = this.injector.get(FormChangeServiceToken, null);
        if (formChange) formChange.persistFields(this.seccionId, 'table', { [tablaKey]: this.datos[tablaKey] }, { notifySync: true });
      } catch (e) {}
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onMaterialesViviendaTableUpdated() {
    const tablaKey = this.getTablaKeyMaterialesVivienda();
    const tabla = this.datos[tablaKey] || this.datos['materialesViviendaAISI'] || [];
    this.calcularPorcentajesMaterialesViviendaAISI();
    this.datos[tablaKey] = [...tabla];
    try { this.projectFacade.setTableData(this.seccionId, null, tablaKey, this.datos[tablaKey]); } catch (e) {}
    try {
      // ✅ CORREGIDO - Usar prefijos para párrafos
      const prefijo = this.obtenerPrefijoGrupo();
      const textPayload: any = {};
      const textoViviendaKey = prefijo ? `textoViviendaAISI${prefijo}` : 'textoViviendaAISI';
      const textoOcupacionKey = prefijo ? `textoOcupacionViviendaAISI${prefijo}` : 'textoOcupacionViviendaAISI';
      const textoEstructuraKey = prefijo ? `textoEstructuraAISI${prefijo}` : 'textoEstructuraAISI';
      if (this.datos[textoViviendaKey] !== undefined) textPayload[textoViviendaKey] = this.datos[textoViviendaKey];
      if (this.datos[textoOcupacionKey] !== undefined) textPayload[textoOcupacionKey] = this.datos[textoOcupacionKey];
      if (this.datos[textoEstructuraKey] !== undefined) textPayload[textoEstructuraKey] = this.datos[textoEstructuraKey];

      this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: this.datos[tablaKey], ...textPayload }, { notifySync: true });
    } catch (e) {}
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  // Tabla key helpers
  getTablaKeyTiposVivienda(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `tiposViviendaAISI${prefijo}` : 'tiposViviendaAISI';
  }

  getTablaKeyCondicionOcupacion(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `condicionOcupacionAISI${prefijo}` : 'condicionOcupacionAISI';
  }

  getTablaKeyMaterialesVivienda(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `materialesViviendaAISI${prefijo}` : 'materialesViviendaAISI';
  }

  // Helpers similar to monolith for defaults and totals
  getTiposViviendaSinTotal(): any[] {
    const tablaKey = this.getTablaKeyTiposVivienda();
    const tabla = this.datos[tablaKey] || this.datos?.tiposViviendaAISI || [];
    if (!tabla || !Array.isArray(tabla)) return [];
    return tabla.filter((item: any) => !item.categoria || !item.categoria.toLowerCase().includes('total'));
  }

  getTotalTiposVivienda(): number {
    const filtered = this.getTiposViviendaSinTotal();
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  }

  getCondicionOcupacionSinTotal(): any[] {
    const tablaKey = this.getTablaKeyCondicionOcupacion();
    const tabla = this.datos[tablaKey] || this.datos?.condicionOcupacionAISI || [];
    if (!tabla || !Array.isArray(tabla)) return [];
    return tabla.filter((item: any) => !item.categoria || !item.categoria.toLowerCase().includes('total'));
  }

  getTotalCondicionOcupacion(): number {
    const filtered = this.getCondicionOcupacionSinTotal();
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  }

  getViviendasOcupadasPresentes(): string {
    const tablaKey = this.getTablaKeyCondicionOcupacion();
    const tabla = this.datos[tablaKey] || this.datos?.condicionOcupacionAISI || [];
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const item = tabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && item.categoria.toLowerCase().includes('presentes')
    );
    return item?.casos?.toString() || '____';
  }

  getPorcentajeOcupadasPresentes(): string {
    const tablaKey = this.getTablaKeyCondicionOcupacion();
    const tabla = this.datos[tablaKey] || this.datos?.condicionOcupacionAISI || [];
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase() === 'ocupado');
    if (!item) {
      return '____';
    }
    const total = this.getTotalCondicionOcupacion();
    if (total === 0) {
      return '0,00 %';
    }
    const casos = Number(item.casos) || 0;
    const porcentaje = (casos / total) * 100;
    return this.formatearPorcentaje(porcentaje);
  }

  getPorcentajePisosTierra(): string {
    const tablaKey = this.getTablaKeyMaterialesVivienda();
    const tabla = this.datos[tablaKey] || this.datos?.materialesViviendaAISI || [];
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const item = tabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('piso') && item.tipoMaterial && item.tipoMaterial.toLowerCase().includes('tierra')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajePisosCemento(): string {
    const tablaKey = this.getTablaKeyMaterialesVivienda();
    const tabla = this.datos[tablaKey] || this.datos?.materialesViviendaAISI || [];
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const item = tabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('piso') && item.tipoMaterial && item.tipoMaterial.toLowerCase().includes('cemento')
    );
    return item?.porcentaje || '____';
  }
  getMaterialesViviendaSinTotal(): any[] {
    const tablaKey = this.getTablaKeyMaterialesVivienda();
    const tabla = this.datos[tablaKey] || this.datos?.materialesViviendaAISI || [];
    if (!tabla || !Array.isArray(tabla)) return [];
    const filtered = tabla.filter((item: any) => !item.categoria || !item.categoria.toLowerCase().includes('total'));
    return filtered;
  }

  getTotalMaterialesVivienda(): number {
    const filtered = this.getMaterialesViviendaSinTotal();
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  }

  calcularPorcentajesMaterialesViviendaAISI() {
    const tablaKey = this.getTablaKeyMaterialesVivienda();
    const tabla = this.datos[tablaKey] || this.datos['materialesViviendaAISI'] || [];
    
    if (!tabla || tabla.length === 0) {
      return;
    }
    
    const categorias = ['paredes', 'techos', 'pisos'];
    categorias.forEach(categoria => {
      const itemsCategoria = tabla.filter((item: any) => 
        item.categoria && item.categoria.toLowerCase().includes(categoria)
      );
      if (itemsCategoria.length > 0) {
        const totalItem = itemsCategoria.find((item: any) => 
          item.categoria && item.categoria.toLowerCase().includes('total')
        );
        const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
        
        if (total > 0) {
          itemsCategoria.forEach((item: any) => {
            if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
              const casos = parseFloat(item.casos) || 0;
              const porcentaje = ((casos / total) * 100).toFixed(2);
              item.porcentaje = porcentaje + ' %';
            }
          });
        }
      }
    });
    
    // Actualizar la tabla en datos
    this.datos[tablaKey] = [...tabla];
  }

  // Image handler
  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    super.onFotografiasChange(fotografias, customPrefix);
    this.fotografiasSeccion25 = fotografias;
    // Also update the BaseSection cache used by other uploads
    this.fotografiasFormMulti = [...(fotografias || [])];
    this.cdRef.markForCheck();
  }

  // Métodos para generar textos por defecto
  private generarTextoViviendaDefault(): string {
    const centroPoblado = this.datos.centroPobladoAISI || this.formDataSignal()?.['centroPobladoAISI'] || 'Cahuacho';
    const totalViviendas = this.getTotalViviendasEmpadronadas();
    return `Según los Censos Nacionales 2017, en el CP ${centroPoblado} se hallan un total de ${totalViviendas} viviendas empadronadas. El único tipo de vivienda existente es la casa independiente, pues representa el 100,0 % del conjunto.`;
  }

  private generarTextoOcupacionDefault(): string {
    const viviendasOcupadas = this.getViviendasOcupadasPresentes();
    const porcentajeOcupadas = this.getPorcentajeOcupadasPresentes();
    return `Para poder describir el acápite de estructura de las viviendas de esta localidad, así como la sección de los servicios básicos, se toma como conjunto total a las viviendas ocupadas con personas presentes que llegan a la cantidad de ${viviendasOcupadas}. A continuación, se muestra el cuadro con la información respecto a la condición de ocupación de viviendas, tal como realiza el Censo Nacional 2017. De aquí se halla que las viviendas ocupadas con personas presentes representan el ${porcentajeOcupadas} del conjunto analizado.`;
  }

  private generarTextoEstructuraDefault(): string {
    const centroPoblado = this.datos.centroPobladoAISI || this.formDataSignal()?.['centroPobladoAISI'] || 'Cahuacho';
    const porcentajePisosTierra = this.getPorcentajePisosTierra();
    const porcentajePisosCemento = this.getPorcentajePisosCemento();
    return `Según la información recabada de los Censos Nacionales 2017, dentro del CP ${centroPoblado}, el único material empleado para la construcción de las paredes de las viviendas es el adobe. Respecto a los techos, también se cuenta con un único material, que son las planchas de calamina, fibra de cemento o similares.\n\nFinalmente, en cuanto a los pisos, la mayoría están hechos de tierra (${porcentajePisosTierra}). El porcentaje restante, que consta del ${porcentajePisosCemento}, cuentan con pisos elaborados a base de cemento.`;
  }

  // --- Helpers for form defaults (se copia ahora de los métodos generadores above) ---
  obtenerTextoViviendaAISI(): string {
    const data = this.formDataSignal();
    if (data['textoViviendaAISI'] && data['textoViviendaAISI'] !== '____') {
      return data['textoViviendaAISI'];
    }
    return this.generarTextoViviendaDefault();
  }

  obtenerTextoOcupacionViviendaAISI(): string {
    const data = this.formDataSignal();
    if (data['textoOcupacionViviendaAISI'] && data['textoOcupacionViviendaAISI'] !== '____') {
      return data['textoOcupacionViviendaAISI'];
    }
    return this.generarTextoOcupacionDefault();
  }

  obtenerTextoEstructuraAISI(): string {
    const data = this.formDataSignal();
    if (data['textoEstructuraAISI'] && data['textoEstructuraAISI'] !== '____') {
      return data['textoEstructuraAISI'];
    }
    return this.generarTextoEstructuraDefault();
  }

  // Small helper used by the text defaults
  getTotalViviendasEmpadronadas(): number {
    return this.getTotalTiposVivienda();
  }

  private formatearPorcentaje(num: number): string {
    return num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  }
  // Cuadros numbering
  obtenerNumeroCuadroTiposVivienda(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  }

  obtenerNumeroCuadroCondicionOcupacion(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
  }

  obtenerNumeroCuadroMateriales(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 2);
  }
}
