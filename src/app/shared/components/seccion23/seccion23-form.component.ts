import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { SECCION23_TEMPLATES, SECCION23_PHOTO_PREFIX, SECCION23_WATCHED_FIELDS, SECCION23_TABLE_CONFIGS, SECCION23_SECTION_ID } from './seccion23-constants';

// ============================================================================
// FUNCIONES TRANSFORMADORAS - Convertir datos del backend al formato de tabla
// ============================================================================

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

const transformPETDesdeDemograficos = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];

  return data.map(item => ({
    categoria: item.categoria || item.nombre || '',
    casos: item.casos !== undefined ? item.casos : item.total || 0,
    porcentaje: item.porcentaje || item.percentage || ''
  }));
};

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
    imports: [CommonModule, FormsModule, CoreSharedModule, ParagraphEditorComponent, ImageUploadComponent],
    selector: 'app-seccion23-form',
    templateUrl: './seccion23-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class Seccion23FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION23_SECTION_ID;
  @Input() override modoFormulario: boolean = false;

  // ✅ Exportar TEMPLATES para usar en HTML
  readonly SECCION23_TEMPLATES = SECCION23_TEMPLATES;

  // Campos observados para sincronización reactiva (se expande con prefijos automáticamente)
  override watchedFields: string[] = SECCION23_WATCHED_FIELDS;

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  override readonly PHOTO_PREFIX: string;
  override useReactiveSync: boolean = true;

  readonly petGruposEdadConfig: TableConfig = {
    tablaKey: 'petGruposEdadAISI',
    totalKey: '',
    campoTotal: '',
    campoPorcentaje: '',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: false,
    camposParaCalcular: [],
    permiteAgregarFilas: true,
    permiteEliminarFilas: true
  };

  readonly peaDistritoSexoConfig: TableConfig = {
    tablaKey: 'peaDistritoSexoTabla',
    totalKey: '',
    campoTotal: '',
    campoPorcentaje: '',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: false,
    camposParaCalcular: [],
    permiteAgregarFilas: true,
    permiteEliminarFilas: true
  };

  readonly peaOcupadaDesocupadaConfig: TableConfig = {
    tablaKey: 'peaOcupadaDesocupadaTabla',
    totalKey: '',
    campoTotal: '',
    campoPorcentaje: '',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: false,
    camposParaCalcular: [],
    permiteAgregarFilas: true,
    permiteEliminarFilas: true
  };

  // Signals
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly petGruposEdadSignal: Signal<any[]> = computed(() => {
    const pref = this.obtenerPrefijoGrupo();
    const key = pref ? `${this.petGruposEdadConfig.tablaKey}${pref}` : this.petGruposEdadConfig.tablaKey;
    return (this.projectFacade.selectField(this.seccionId, null, key)() ?? this.projectFacade.selectTableData(this.seccionId, null, this.petGruposEdadConfig.tablaKey)() ?? []) as any[];
  });

  readonly peaDistritoSexoSignal: Signal<any[]> = computed(() => {
    const pref = this.obtenerPrefijoGrupo();
    const key = pref ? `${this.peaDistritoSexoConfig.tablaKey}${pref}` : this.peaDistritoSexoConfig.tablaKey;
    return (this.projectFacade.selectField(this.seccionId, null, key)() ?? this.projectFacade.selectTableData(this.seccionId, null, this.peaDistritoSexoConfig.tablaKey)() ?? []) as any[];
  });

  readonly peaOcupadaDesocupadaSignal: Signal<any[]> = computed(() => {
    const pref = this.obtenerPrefijoGrupo();
    const key = pref ? `${this.peaOcupadaDesocupadaConfig.tablaKey}${pref}` : this.peaOcupadaDesocupadaConfig.tablaKey;
    return (this.projectFacade.selectField(this.seccionId, null, key)() ?? this.projectFacade.selectTableData(this.seccionId, null, this.peaOcupadaDesocupadaConfig.tablaKey)() ?? []) as any[];
  });

  // Photos
  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const loaded = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix) || [];
    return loaded;
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

  // ✅ NUEVO: Signal para ubicación global (desde metadata)
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

  readonly viewModel: Signal<any> = computed(() => ({
    ...this.formDataSignal(),
    petGruposEdad: this.petGruposEdadSignal(),
    peaDistritoSexo: this.peaDistritoSexoSignal(),
    peaOcupadaDesocupada: this.peaOcupadaDesocupadaSignal(),
    fotos: this.fotosCacheSignal()
  }));

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    protected tableFacade: TableManagementFacade,
    private backendApi: BackendApiService,
    private globalNumbering: GlobalNumberingService
  ) {
    super(cdRef, injector);
    // Inicializar PHOTO_PREFIX dinámicamente basado en el grupo actual
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = 'fotografiaPEA';

    // Sync this.datos for compatibility - usar claves con prefijo
    effect(() => {
      const data = this.formDataSignal();
      // Merge tables from signals to ensure tables are present in this.datos
      const pet = this.petGruposEdadSignal();
      const distrito = this.peaDistritoSexoSignal();
      const ocup = this.peaOcupadaDesocupadaSignal();
      
      this.datos = { ...data };
      // Asignar con claves que usan prefijo
      const pref = this.obtenerPrefijoGrupo();
      if (pref) {
        this.datos[`petGruposEdadAISI${pref}`] = pet;
        this.datos[`peaDistritoSexoTabla${pref}`] = distrito;
        this.datos[`peaOcupadaDesocupadaTabla${pref}`] = ocup;
      }
      // Mantener compatibilidad con código legacy que usa claves sin prefijo
      this.datos.petGruposEdadAISI = pet;
      this.datos.peaDistritoSexoTabla = distrito;
      this.datos.peaOcupadaDesocupadaTabla = ocup;
      this.cdRef.markForCheck();
    });

    // Watch photos
    effect(() => {
      this.photoFieldsHash();
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });

    // Initialize paragraphs that depend on table-derived percentages once tables are available
    effect(() => {
      const pet = this.petGruposEdadSignal();
      const pea = this.peaDistritoSexoSignal();
      const ocup = this.peaOcupadaDesocupadaSignal();
      if ((Array.isArray(pet) && pet.length > 0) || (Array.isArray(pea) && pea.length > 0) || (Array.isArray(ocup) && ocup.length > 0)) {
        this.initializeParagraphsDependentOnTables();
      }
    });

    // Provide a convenient accessor for FormChangeService
  }

  protected get formChange(): FormChangeService { return this.injector.get(FormChangeService); }

  protected override onInitCustom(): void {
    // ✅ AUTO-LLENAR centroPobladoAISI con el nombre del grupo AISI actual
    const centroPobladoAISI = this.obtenerNombreCentroPobladoActual();
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
    
    // Actualizar tanto el objeto local como el store
    this.datos[campoConPrefijo] = centroPobladoAISI;
    this.datos['centroPobladoAISI'] = centroPobladoAISI;
    this.projectFacade.setField(this.seccionId, null, campoConPrefijo, centroPobladoAISI);
    this.onFieldChange(campoConPrefijo, centroPobladoAISI, { refresh: false });
    try { this.formChange.persistFields(this.seccionId, 'form', { [campoConPrefijo]: centroPobladoAISI }); } catch (e) {}
    
    this.actualizarFotografiasFormMulti();
    this.inicializarTablasVacias();
    this.cargarDatosDelBackend();

    // Inicializar titulos y fuentes
    try {
      const tablesToInit = [
        { tituloField: 'petGruposEdadTitulo', fuenteField: 'petGruposEdadFuente' },
        { tituloField: 'peaDistritoSexoTitulo', fuenteField: 'peaDistritoSexoFuente' },
        { tituloField: 'peaOcupadaDesocupadaTitulo', fuenteField: 'peaOcupadaDesocupadaFuente' }
      ];

      for (const t of tablesToInit) {
        // Inicializar título y fuente si faltan
        const tituloField = t.tituloField;
        const fuenteField = t.fuenteField;
        const tituloActual = this.datos[tituloField];
        if (tituloField && (!tituloActual || this.tienePlaceholder(tituloActual))) {
          let valorTitulo = '';
          // ✅ Distrito derivado desde Sección 21 (tabla de ubicación) vía BaseSectionComponent
          const centroPoblado = this.obtenerNombreCentroPobladoActual() || '____';
          const distrito = this.obtenerNombreDistritoActual() || '____';
          
          // ✅ Usar constantes para títulos
          const tituloFieldLower = tituloField.toLowerCase();
          if (tituloFieldLower.includes('pet')) {
            valorTitulo = SECCION23_TEMPLATES.defaultPETTableTitle.replace('{{centroPoblado}}', centroPoblado);
          } else if (tituloFieldLower.includes('peaocupada')) {
            valorTitulo = SECCION23_TEMPLATES.defaultPeaOcupadaDesocupadaTableTitle.replace('{{distrito}}', distrito);
          } else {
            valorTitulo = SECCION23_TEMPLATES.defaultPeaDistritoSexoTableTitle.replace('{{distrito}}', distrito);
          }
          
          this.datos[tituloField] = valorTitulo;
          this.onFieldChange(tituloField, valorTitulo, { refresh: false });
        }
        if (fuenteField && !this.datos[fuenteField]) {
          // ✅ Usar constantes para fuentes
          let valorFuente = SECCION23_TEMPLATES.defaultPeaDistritoSexoFuente;
          const fuenteFieldLower = fuenteField.toLowerCase();
          if (fuenteFieldLower.includes('pet')) {
            valorFuente = SECCION23_TEMPLATES.defaultPETFuente;
          } else if (fuenteFieldLower.includes('peaocupada')) {
            valorFuente = SECCION23_TEMPLATES.defaultPeaOcupadaDesocupadaFuente;
          }
          
          this.datos[fuenteField] = valorFuente;
          this.onFieldChange(fuenteField, valorFuente, { refresh: false });
        }
      }
    } catch (e) {
      // no bloquear inicio por errores en inicialización
    }

    // Inicializar párrafos si no existen para que los editores muestren contenido por defecto
    try {
      // No inicializamos aquí los campos que dependen de porcentajes (se inicializarán
      // cuando las tablas PET/PEA estén disponibles para evitar insertar valores vacíos)
      const paragraphFields = [
        'textoPETIntro_AISI',
        'textoIndicadoresDistritalesAISI',
        'textoPEA_AISI',
        'textoEmpleoAISI',
        'textoEmpleoDependiente_AISI',
        'textoIngresosAISI',
        'textoIndiceDesempleoAISI',
        'textoPEAAISI'
      ];

      for (const field of paragraphFields) {
        const current = this.projectFacade.selectField(this.seccionId, null, field)();
        if (!current || current === '____' || (typeof current === 'string' && (current.trim() === '' || this.tienePlaceholder(current)))) {
          let defaultVal = '';
          try {
            // Usar los generadores existentes cuando estén disponibles
            switch (field) {
              case 'textoIndicadoresDistritalesAISI': defaultVal = this.obtenerTextoIndicadoresDistritalesAISI(); break;
              case 'textoPEA_AISI': defaultVal = this.obtenerTextoPEA_AISI(); break;
              case 'textoEmpleoAISI': defaultVal = this.obtenerTextoEmpleoAISI(); break;
              case 'textoIngresosAISI': defaultVal = this.obtenerTextoIngresosAISI(); break;
              case 'textoIndiceDesempleoAISI': defaultVal = this.obtenerTextoIndiceDesempleoAISI(); break;
              case 'textoPEAAISI': defaultVal = this.obtenerTextoPEAAISI ? this.obtenerTextoPEAAISI() : '' ; break;
              default: defaultVal = '';
            }
          } catch (e) {
            defaultVal = '';
          }

          // Persistir valor por defecto (no forzar refresh para evitar loops)
          this.projectFacade.setField(this.seccionId, null, field, defaultVal);
          try { this.formChange.persistFields(this.seccionId, 'text', { [field]: defaultVal }); } catch (e) {}
          this.onFieldChange(field, defaultVal, { refresh: false });
        }
      }
    } catch (e) {
      // Error en inicialización
    }
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void {
    const centro = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || null;
    this.datos.centroPobladoAISI = centro;
  }

  protected override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  protected getSectionKey(): string { return 'seccion23_aisi'; }
  protected getLoadParameters(): string[] | null {
    const codigos = this.getCodigosCentrosPobladosAISI();
    return codigos && codigos.length > 0 ? [...codigos] : null;
  }

  // Handlers
  onPetGruposEdadUpdated(eventOrTabla: any): void {
    const tabla = Array.isArray(eventOrTabla) ? eventOrTabla : (eventOrTabla?.detail ?? eventOrTabla);
    if (!Array.isArray(tabla)) return;

    const tablaNormalizada = this.normalizarTabla(tabla);

    const pref = this.obtenerPrefijoGrupo();
    const keyBase = this.petGruposEdadConfig.tablaKey;
    const keyPref = pref ? `${keyBase}${pref}` : null;

    // Persistir la versión prefijada primero (si existe) y luego la base para evitar sobrescrituras
    try {
      if (keyPref) {
        this.projectFacade.setField(this.seccionId, null, keyPref, tablaNormalizada);
      }
      this.projectFacade.setField(this.seccionId, null, keyBase, tablaNormalizada);
    } catch (e) {
    }

    // Persistir ambas claves en un solo call para consistencia
    const payload: Record<string, any> = { [keyBase]: tablaNormalizada };
    if (keyPref) payload[keyPref] = tablaNormalizada;
    this.formChange.persistFields(this.seccionId, 'table', payload);

    // Notificar cambio usando preferentemente la clave prefijada para que la vista lea el dato correcto
    if (keyPref) this.onFieldChange(keyPref, tablaNormalizada);
    else this.onFieldChange(keyBase, tablaNormalizada);
  }

  onPeaDistritoUpdated(eventOrTabla: any): void {
    const tabla = Array.isArray(eventOrTabla) ? eventOrTabla : (eventOrTabla?.detail ?? eventOrTabla);
    if (!Array.isArray(tabla)) return;

    const tablaNormalizada = this.normalizarTabla(tabla);
    const keyBase = this.peaDistritoSexoConfig.tablaKey;
    const pref = this.obtenerPrefijoGrupo();
    const keyPref = pref ? `${keyBase}${pref}` : null;

    try {
      if (keyPref) this.projectFacade.setField(this.seccionId, null, keyPref, tablaNormalizada);
      this.projectFacade.setField(this.seccionId, null, keyBase, tablaNormalizada);
    } catch (e) {
    }

    const payload: Record<string, any> = { [keyBase]: tablaNormalizada };
    if (keyPref) payload[keyPref] = tablaNormalizada;
    this.formChange.persistFields(this.seccionId, 'table', payload);

    if (keyPref) this.onFieldChange(keyPref, tablaNormalizada);
    else this.onFieldChange(keyBase, tablaNormalizada);
  }

  onPeaOcupadaDesocupadaUpdated(eventOrTabla: any): void {
    const tabla = Array.isArray(eventOrTabla) ? eventOrTabla : (eventOrTabla?.detail ?? eventOrTabla);
    if (!Array.isArray(tabla)) return;

    const tablaNormalizada = this.normalizarTabla(tabla);
    const keyBase = this.peaOcupadaDesocupadaConfig.tablaKey;
    const pref = this.obtenerPrefijoGrupo();
    const keyPref = pref ? `${keyBase}${pref}` : null;

    try {
      if (keyPref) this.projectFacade.setField(this.seccionId, null, keyPref, tablaNormalizada);
      this.projectFacade.setField(this.seccionId, null, keyBase, tablaNormalizada);
    } catch (e) {
    }

    const payload: Record<string, any> = { [keyBase]: tablaNormalizada };
    if (keyPref) payload[keyPref] = tablaNormalizada;
    this.formChange.persistFields(this.seccionId, 'table', payload);

    if (keyPref) this.onFieldChange(keyPref, tablaNormalizada);
    else this.onFieldChange(keyBase, tablaNormalizada);
  }

  // Template compatibility wrappers
  onPetGruposEdadFieldChange(index: number, field: string, value: any): void {
    // Update the row value in the appropriate tabla (prefijada si existe), then recompute
    const pref = this.obtenerPrefijoGrupo();
    const keyPref = pref ? `${this.petGruposEdadConfig.tablaKey}${pref}` : null;
    const tablaKeyToUse = (keyPref && this.datos[keyPref]) ? keyPref : this.petGruposEdadConfig.tablaKey;
    const configWithKey = { ...this.petGruposEdadConfig, tablaKey: tablaKeyToUse };

    // Actualizar la fila usando la facade para mantener la lógica consistente
    try {
      this.tableFacade.actualizarFila(this.datos, configWithKey, index, field, value, false);
    } catch (e) {
    }

    const tabla = this.datos[tablaKeyToUse] ?? [];
    if (!Array.isArray(tabla)) return;
    if ((keyPref && tablaKeyToUse === keyPref) || !this.datos[this.petGruposEdadConfig.tablaKey]) {
    }

    this.onPetGruposEdadUpdated(tabla);
  }

  onPetGruposEdadTableUpdated(): void { this.onPetGruposEdadUpdated(this.datos[this.petGruposEdadConfig.tablaKey] || []); }

  onPEADistritoSexoFieldChange(index: number, field: string, value: any): void {
    const pref = this.obtenerPrefijoGrupo();
    const keyPref = pref ? `${this.peaDistritoSexoConfig.tablaKey}${pref}` : null;
    const tablaKeyToUse = (keyPref && this.datos[keyPref]) ? keyPref : this.peaDistritoSexoConfig.tablaKey;
    const configWithKey = { ...this.peaDistritoSexoConfig, tablaKey: tablaKeyToUse };

    try {
      // Permitir ejecución automática de cálculos (autoCalcular = true)
      this.tableFacade.actualizarFila(this.datos, configWithKey, index, field, value, true);
    } catch (e) {
    }

    const tabla = this.datos[tablaKeyToUse] ?? [];
    const usedKey = (keyPref && this.datos[keyPref]) ? keyPref : this.peaDistritoSexoConfig.tablaKey;

    this.onPeaDistritoUpdated(tabla);
  }
  onPEADistritoSexoTableUpdated(): void { this.onPeaDistritoUpdated(this.datos[this.peaDistritoSexoConfig.tablaKey] || []); }

  onPEAOcupadaDesocupadaFieldChange(index: number, field: string, value: any): void {
    const pref = this.obtenerPrefijoGrupo();
    const keyPref = pref ? `${this.peaOcupadaDesocupadaConfig.tablaKey}${pref}` : null;
    const tablaKeyToUse = (keyPref && this.datos[keyPref]) ? keyPref : this.peaOcupadaDesocupadaConfig.tablaKey;
    const configWithKey = { ...this.peaOcupadaDesocupadaConfig, tablaKey: tablaKeyToUse };

    try {
      this.tableFacade.actualizarFila(this.datos, configWithKey, index, field, value, false);
    } catch (e) {
    }

    const tabla = this.datos[tablaKeyToUse] ?? [];
    this.onPeaOcupadaDesocupadaUpdated(tabla);
  }
  onPEAOcupadaDesocupadaTableUpdated(): void { this.onPeaOcupadaDesocupadaUpdated(this.datos[this.peaOcupadaDesocupadaConfig.tablaKey] || []); }

  // Utilities
  private normalizarTabla(tabla: any[]): any[] {
    return tabla.map((row: any) => {
      const rowN: any = {};
      for (const key of Object.keys(row)) {
        const v = row[key];
        rowN[key] = (v && typeof v === 'object' && v.value !== undefined) ? v.value : v;
      }
      return rowN;
    });
  }

  private inicializarTablasVacias(): void {
    const prefijo = this.obtenerPrefijoGrupo();

    const petKey = prefijo ? `petGruposEdadAISI${prefijo}` : 'petGruposEdadAISI';
    const peaKey = prefijo ? `peaDistritoSexoTabla${prefijo}` : 'peaDistritoSexoTabla';
    const peaOcupadaKey = prefijo ? `peaOcupadaDesocupadaTabla${prefijo}` : 'peaOcupadaDesocupadaTabla';

    this.projectFacade.setField(this.seccionId, null, petKey, []);
    this.projectFacade.setField(this.seccionId, null, 'petGruposEdadAISI', []);
    this.projectFacade.setField(this.seccionId, null, peaKey, []);
    this.projectFacade.setField(this.seccionId, null, 'peaDistritoSexoTabla', []);
    this.projectFacade.setField(this.seccionId, null, peaOcupadaKey, []);
    this.projectFacade.setField(this.seccionId, null, 'peaOcupadaDesocupadaTabla', []);
  }

  private cargarDatosDelBackend(): void {
    const codigosArray = this.getCodigosCentrosPobladosAISI();
    const codigos = [...codigosArray];

    if (!codigos || codigos.length === 0) return;

    const prefijo = this.obtenerPrefijoGrupo();

    // Usar endpoint PET agrupado 14-29 (sp_pet_por_grupo_14_29)
    this.backendApi.postPetGrupo14(codigos).subscribe({
      next: (response: any) => {
        const datosTransformados = transformPETDesdeDemograficos(
          unwrapDemograficoData(response?.data || [])
        );
        if (datosTransformados.length === 0) return;

        const tablaKey = prefijo ? `petGruposEdadAISI${prefijo}` : 'petGruposEdadAISI';
        this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
        this.projectFacade.setField(this.seccionId, null, 'petGruposEdadAISI', datosTransformados);
        this.cdRef.markForCheck();
      }
    });

    this.backendApi.postPea(codigos).subscribe({
      next: (response: any) => {
        const datosTransformados = transformPEADesdeDemograficos(
          unwrapDemograficoData(response?.data || [])
        );
        if (datosTransformados.length === 0) return;

        const tablaKey = prefijo ? `peaDistritoSexoTabla${prefijo}` : 'peaDistritoSexoTabla';
        this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
        this.projectFacade.setField(this.seccionId, null, 'peaDistritoSexoTabla', datosTransformados);
        this.cdRef.markForCheck();
      }
    });

    this.backendApi.postPeaOcupadaDesocupada(codigos).subscribe({
      next: (response: any) => {
        const datosTransformados = transformPEAOcupadaDesdeDemograficos(
          unwrapDemograficoData(response?.data || [])
        );
        if (datosTransformados.length === 0) return;

        const tablaKey = prefijo ? `peaOcupadaDesocupadaTabla${prefijo}` : 'peaOcupadaDesocupadaTabla';
        this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
        this.projectFacade.setField(this.seccionId, null, 'peaOcupadaDesocupadaTabla', datosTransformados);
        this.cdRef.markForCheck();
      }
    });
  }

  override actualizarFotografiasFormMulti() {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix);
  }

  // Small helpers
  getPoblacionDistritalFn(): string { return this.datos.poblacionDistritalAISI || '____'; }
  getPETDistrital(): string { return this.datos?.petDistritalAISI || '____'; }

  onFotografiasPEAChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
  }

  // Totals & textos usados por template
  getTotalPetGruposEdad(): string {
    const tabla = this.datos[this.petGruposEdadConfig.tablaKey] || this.datos.petGruposEdadAISI || [];
    if (!Array.isArray(tabla)) return '0';
    const total = tabla.reduce((sum: number, item: any) => {
      const categoria = (item?.categoria || '').toString().toLowerCase();
      if (categoria.includes('total')) return sum; // Ignorar fila Total
      return sum + (typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0);
    }, 0);
    return total.toString();
  }

  getTotalPeaDistritoSexo(): string {
    const tabla = this.peaDistritoSexoSignal() || [];
    if (!Array.isArray(tabla)) return '0';
    const total = tabla.reduce((sum: number, item: any) => {
      const categoria = (item?.categoria || '').toString().toLowerCase();
      if (categoria.includes('total')) return sum;
      return sum + (typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0);
    }, 0);
    return total.toString();
  }

  getTotalPeaDistritoSexoHombres(): string {
    const tabla = this.peaDistritoSexoSignal() || [];
    if (!Array.isArray(tabla)) return '0';
    const total = tabla.reduce((sum: number, item: any) => {
      const categoria = (item?.categoria || '').toString().toLowerCase();
      if (categoria.includes('total')) return sum;
      return sum + (typeof item.hombres === 'number' ? item.hombres : parseInt(item.hombres) || 0);
    }, 0);
    return total.toString();
  }

  getTotalPeaDistritoSexoMujeres(): string {
    const tabla = this.peaDistritoSexoSignal() || [];
    if (!Array.isArray(tabla)) return '0';
    const total = tabla.reduce((sum: number, item: any) => {
      const categoria = (item?.categoria || '').toString().toLowerCase();
      if (categoria.includes('total')) return sum;
      return sum + (typeof item.mujeres === 'number' ? item.mujeres : parseInt(item.mujeres) || 0);
    }, 0);
    return total.toString();
  }

  // Text generators used in template
  obtenerTextoIndicadoresDistritalesAISI(): string {
    const texto = this.datos.textoIndicadoresDistritalesAISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    // ✅ Distrito derivado desde Sección 21 (tabla de ubicación) vía BaseSectionComponent
    const distrito = this.obtenerNombreDistritoActual() || '____';
    const poblacionDistrital = this.getPoblacionDistritalFn();
    const petDistrital = this.getPETDistrital();
    return SECCION23_TEMPLATES.indicadoresDistritalesTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{poblacionDistrital}}', poblacionDistrital)
      .replace('{{petDistrital}}', petDistrital);
  }

  obtenerTextoPET_AISI(): string {
    const texto = this.datos.textoPET_AISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    // ✅ CORREGIDO: Usar obtenerNombreCentroPobladoActual() que usa aisiGroups() signal
    const centroPoblado = this.obtenerNombreCentroPobladoActual();
    const porcentajePET = this.getPorcentajePET();
    const porcentaje4564 = this.getPorcentajeGrupoPET('45 a 64');
    const porcentaje65 = this.getPorcentajeGrupoPET('65');
    return SECCION23_TEMPLATES.petCompleteTemplateWithVariables
      .replace('{{centroPoblado}}', centroPoblado)
      .replace('{{porcentajePET}}', porcentajePET)
      .replace('{{porcentaje4564}}', porcentaje4564)
      .replace('{{porcentaje65}}', porcentaje65);
  }

  obtenerTextoPETIntro_AISI(): string {
    const texto = this.datos.textoPETIntro_AISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    return SECCION23_TEMPLATES.petIntroDefault;
  }

  getPorcentajePEA(): string {
    const tabla = this.peaDistritoSexoSignal() || [];
    if (!Array.isArray(tabla)) return '____';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getPorcentajeNoPEA(): string {
    const tabla = this.peaDistritoSexoSignal() || [];
    if (!Array.isArray(tabla)) return '____';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('no pea'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getPorcentajeHombresPEA(): string {
    const tabla = this.peaDistritoSexoSignal() || [];
    if (!Array.isArray(tabla)) return '____';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no'));
    return item?.porcentajeHombres ? String(item.porcentajeHombres) : '____';
  }

  getPorcentajeMujeresNoPEA(): string {
    const tabla = this.peaDistritoSexoSignal() || [];
    if (!Array.isArray(tabla)) return '____';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('no pea'));
    return item?.porcentajeMujeres ? String(item.porcentajeMujeres) : '____';
  }

  getIngresoPerCapita(): string { return this.datos?.ingresoPerCapitaAISI || '391,06'; }
  getRankingIngreso(): string { return this.datos?.rankingIngresoAISI || '1191'; }

  getPorcentajeDesempleo(): string {
    const tabla = this.peaOcupadaDesocupadaSignal() || [];
    if (!Array.isArray(tabla)) return '0,00 %';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('desocupada'));
    return item?.porcentaje || '0,00 %';
  }

  getPorcentajeHombresOcupados(): string {
    const tabla = this.peaOcupadaDesocupadaSignal() || [];
    if (!Array.isArray(tabla)) return '0,00 %';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('ocupada'));
    return item?.porcentajeHombres || '0,00 %';
  }

  getPorcentajeMujeresOcupadas(): string {
    const tabla = this.peaOcupadaDesocupadaSignal() || [];
    if (!Array.isArray(tabla)) return '0,00 %';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('ocupada'));
    return item?.porcentajeMujeres || '0,00 %';
  }
  obtenerTextoPEA_AISI(): string {
    const texto = this.datos.textoPEA_AISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    // ✅ Distrito derivado desde Sección 21 (tabla de ubicación) vía BaseSectionComponent
    const distrito = this.obtenerNombreDistritoActual() || '____';
    // ✅ CORREGIDO: Usar obtenerNombreCentroPobladoActual()
    const centroPoblado = this.obtenerNombreCentroPobladoActual();
    return SECCION23_TEMPLATES.peaCompleteTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{centroPoblado}}', centroPoblado);
  }

  getPorcentajePET(): string {
    if (!this.datos?.petGruposEdadAISI || !Array.isArray(this.datos.petGruposEdadAISI)) return '____';
    const totalPET = this.datos.petGruposEdadAISI.reduce((sum: number, item: any) => sum + (typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0), 0);
    const totalPoblacion = this.datos?.poblacionSexoAISI?.reduce((sum: number, item: any) => sum + (typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0), 0) || 0;
    if (!totalPoblacion || totalPoblacion === 0) return '____';
    return ((totalPET / totalPoblacion) * 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  }

  getPorcentajeGrupoPET(categoria: string): string {
    if (!this.datos?.petGruposEdadAISI || !Array.isArray(this.datos.petGruposEdadAISI)) return '____';
    const item = this.datos.petGruposEdadAISI.find((item: any) => item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase()));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  obtenerTextoAnalisisPEA_AISI(): string {
    if (this.datos.textoAnalisisPEA_AISI && this.datos.textoAnalisisPEA_AISI !== '____') return this.datos.textoAnalisisPEA_AISI;
    // ✅ Distrito derivado desde Sección 21 (tabla de ubicación) vía BaseSectionComponent
    const distrito = this.obtenerNombreDistritoActual() || '____';
    const porcentajePEA = this.getPorcentajePEA();
    const porcentajeNoPEA = this.getPorcentajeNoPEA();
    const porcentajeHombresPEA = this.getPorcentajeHombresPEA();
    const porcentajeMujeresNoPEA = this.getPorcentajeMujeresNoPEA();
    return SECCION23_TEMPLATES.peaAnalisisTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{porcentajePEA}}', porcentajePEA)
      .replace('{{porcentajeNoPEA}}', porcentajeNoPEA)
      .replace('{{porcentajeHombresPEA}}', porcentajeHombresPEA)
      .replace('{{porcentajeMujeresNoPEA}}', porcentajeMujeresNoPEA);
  }

  // Inicializa textos que dependen de los porcentajes calculados en las tablas
  private initializeParagraphsDependentOnTables(): void {
    try {
      const fields = ['textoPET_AISI', 'textoAnalisisPEA_AISI', 'textoPEAAISI'];
      for (const field of fields) {
        const current = this.projectFacade.selectField(this.seccionId, null, field)();
        if (!current || current === '____' || (typeof current === 'string' && current.trim() === '')) {
          let defaultVal = '';
          try {
            if (field === 'textoPET_AISI') defaultVal = this.obtenerTextoPET_AISI();
            if (field === 'textoAnalisisPEA_AISI') defaultVal = this.obtenerTextoAnalisisPEA_AISI();
          } catch (e) {
            defaultVal = '';
          }

          // Persistir y forzar refresh para que el editor/vista muestren los porcentajes calculados
          this.projectFacade.setField(this.seccionId, null, field, defaultVal);
          try { this.formChange.persistFields(this.seccionId, 'text', { [field]: defaultVal }); } catch (e) {}
          this.onFieldChange(field, defaultVal, { refresh: true });
        }
      }
    } catch (e) {
    }
  }

  obtenerTextoEmpleoAISI(): string {
    const texto = this.datos.textoEmpleoAISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    // ✅ Distrito derivado desde Sección 21 (tabla de ubicación) vía BaseSectionComponent
    const distrito = this.obtenerNombreDistritoActual() || '____';
    return SECCION23_TEMPLATES.empleoSituacionDefault.replace('{{distrito}}', distrito);
  }

  obtenerTextoEmpleoDependiente_AISI(): string {
    const texto = this.datos.textoEmpleoDependiente_AISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    return SECCION23_TEMPLATES.empleoDependienteDefault;
  }

  obtenerTextoIngresosAISI(): string {
    const texto = this.datos.textoIngresosAISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    // ✅ Distrito derivado desde Sección 21 (tabla de ubicación) vía BaseSectionComponent
    const distrito = this.obtenerNombreDistritoActual() || '____';
    const centroPoblado = this.obtenerNombreCentroPobladoActual();
    const ingresoPerCapita = this.getIngresoPerCapita();
    const rankingIngreso = this.getRankingIngreso();
    return SECCION23_TEMPLATES.ingresosTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{centroPoblado}}', centroPoblado)
      .replace('{{ingresoPerCapita}}', ingresoPerCapita)
      .replace('{{rankingIngreso}}', rankingIngreso);
  }

  obtenerTextoIndiceDesempleoAISI(): string {
    const texto = this.datos.textoIndiceDesempleoAISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    // ✅ Distrito derivado desde Sección 21 (tabla de ubicación) vía BaseSectionComponent
    const distrito = this.obtenerNombreDistritoActual() || '____';
    const centroPoblado = this.obtenerNombreCentroPobladoActual();
    return SECCION23_TEMPLATES.indiceDesempleoTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{centroPoblado}}', centroPoblado);
  }

  // Compatibility helpers for template (PEA Ocupada/Desocupada totals)
  getTotalPeaOcupadaDesocupada(): string {
    const tabla = this.peaOcupadaDesocupadaSignal() || [];
    if (!Array.isArray(tabla)) return '0';
    const total = tabla.reduce((sum: number, item: any) => {
      const categoria = (item?.categoria || '').toString().toLowerCase();
      if (categoria.includes('total')) return sum;
      return sum + (typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0);
    }, 0);
    return total.toString();
  }

  getTotalPeaOcupadaDesocupadaHombres(): string {
    const tabla = this.peaOcupadaDesocupadaSignal() || [];
    if (!Array.isArray(tabla)) return '0';
    const total = tabla.reduce((sum: number, item: any) => sum + (typeof item.hombres === 'number' ? item.hombres : parseInt(item.hombres) || 0), 0);
    return total.toString();
  }

  getTotalPeaOcupadaDesocupadasMujeres(): string {
    const tabla = this.peaOcupadaDesocupadaSignal() || [];
    if (!Array.isArray(tabla)) return '0';
    const total = tabla.reduce((sum: number, item: any) => sum + (typeof item.mujeres === 'number' ? item.mujeres : parseInt(item.mujeres) || 0), 0);
    return total.toString();
  }

  // Alias expected by some templates
  obtenerTextoPEAAISI(): string {
    const texto = this.datos.textoPEAAISI;
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    // ✅ Distrito derivado desde Sección 21 (tabla de ubicación) vía BaseSectionComponent
    const distrito = this.obtenerNombreDistritoActual() || '____';
    const porcentajeDesempleo = this.getPorcentajeDesempleo();
    const porcentajeHombres = this.getPorcentajeHombresOcupados();
    const porcentajeMujeres = this.getPorcentajeMujeresOcupadas();
    return SECCION23_TEMPLATES.peaOcupadaDesocupadaTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{porcentajeDesempleo}}', porcentajeDesempleo)
      .replace('{{porcentajeHombres}}', porcentajeHombres)
      .replace('{{porcentajeMujeres}}', porcentajeMujeres);
  }

  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    super.onFotografiasChange(fotografias, customPrefix);
    // Sync the editable array used by the form UI
    this.fotografiasFormMulti = fotografias;
    this.cdRef.markForCheck();
  }

  trackByIndex(index: number): number { return index; }

  private tienePlaceholder(texto: string | null | undefined): boolean {
    return !!texto && texto.includes('____');
  }
}
