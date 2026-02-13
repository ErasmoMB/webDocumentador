import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { GroupConfigService } from 'src/app/core/services/groups/group-config.service';
import { PeaService } from 'src/app/core/infrastructure/services';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableNumberingService } from 'src/app/core/services/numbering/table-numbering.service';
import { SECCION23_TEMPLATES, SECCION23_PHOTO_PREFIX, SECCION23_WATCHED_FIELDS, SECCION23_TABLE_CONFIGS, SECCION23_SECTION_ID } from './seccion23-constants';

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
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  readonly peaDistritoSexoConfig: TableConfig = {
    tablaKey: 'peaDistritoSexoTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: true,
    camposParaCalcular: ['hombres', 'mujeres']
  };

  readonly peaOcupadaDesocupadaConfig: TableConfig = {
    tablaKey: 'peaOcupadaDesocupadaTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: true,
    camposParaCalcular: ['hombres','mujeres']
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
    private groupConfig: GroupConfigService,
    private peaService: PeaService,
    private tableNumbering: TableNumberingService
  ) {
    super(cdRef, injector);
    // Inicializar PHOTO_PREFIX dinámicamente basado en el grupo actual
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = prefijo ? `fotografiaPEA${prefijo}` : 'fotografiaPEA';

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
    const centroPobladoAISI = this.obtenerCentroPobladoAISI();
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
    
    // Actualizar tanto el objeto local como el store
    this.datos[campoConPrefijo] = centroPobladoAISI;
    this.datos['centroPobladoAISI'] = centroPobladoAISI;
    this.projectFacade.setField(this.seccionId, null, campoConPrefijo, centroPobladoAISI);
    this.onFieldChange(campoConPrefijo, centroPobladoAISI, { refresh: false });
    try { this.formChange.persistFields(this.seccionId, 'form', { [campoConPrefijo]: centroPobladoAISI }); } catch (e) {}
    
    this.actualizarFotografiasFormMulti();
    this.eliminarFilasTotal();
    this.cargarDatosPEA();

    // Inicializar tablas y títulos (persistir estructura inicial en claves base y prefijadas)
    try {
      const tablesToInit = [
        { key: this.petGruposEdadConfig.tablaKey, estructura: this.petGruposEdadConfig.estructuraInicial, tituloField: 'petGruposEdadTitulo', fuenteField: 'petGruposEdadFuente' },
        { key: this.peaDistritoSexoConfig.tablaKey, estructura: this.peaDistritoSexoConfig.estructuraInicial, tituloField: 'peaDistritoSexoTitulo', fuenteField: 'peaDistritoSexoFuente' },
        { key: this.peaOcupadaDesocupadaConfig.tablaKey, estructura: this.peaOcupadaDesocupadaConfig.estructuraInicial, tituloField: 'peaOcupadaDesocupadaTitulo', fuenteField: 'peaOcupadaDesocupadaFuente' }
      ];

      for (const t of tablesToInit) {
        const existingField = this.projectFacade.selectField(this.seccionId, null, t.key)();
        const existingTable = this.projectFacade.selectTableData(this.seccionId, null, t.key)();
        const current = existingField ?? existingTable ?? [];
        if (!Array.isArray(current) || current.length === 0) {
          const inicial = structuredClone(t.estructura || []);
          const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
          if (prefijo) this.projectFacade.setField(this.seccionId, null, `${t.key}${prefijo}`, inicial);
          this.projectFacade.setField(this.seccionId, null, t.key, inicial);
          try { this.formChange.persistFields(this.seccionId, 'table', { [t.key]: inicial }); } catch (e) {}
          this.datos[t.key] = inicial;
        }

        // Inicializar título y fuente si faltan
        const tituloField = t.tituloField;
        const fuenteField = t.fuenteField;
        if (tituloField && !this.datos[tituloField]) {
          let valorTitulo = '';
          const centroPoblado = this.datos.centroPobladoAISI || this.datos.distritoSeleccionado || '_____';
          const distrito = this.datos.distritoSeleccionado || '_____';
          
          // ✅ Usar constantes para títulos
          if (tituloField.includes('PET')) {
            valorTitulo = SECCION23_TEMPLATES.defaultPETTableTitle.replace('{{centroPoblado}}', centroPoblado);
          } else if (tituloField.includes('peaOcupada')) {
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
          if (fuenteField.includes('PET')) {
            valorFuente = SECCION23_TEMPLATES.defaultPETFuente;
          } else if (fuenteField.includes('peaOcupada')) {
            valorFuente = SECCION23_TEMPLATES.defaultPeaOcupadaDesocupadaFuente;
          }
          
          this.datos[fuenteField] = valorFuente;
          this.onFieldChange(fuenteField, valorFuente, { refresh: false });
        }
      }
    } catch (e) {
      // no bloquear inicio por errores en inicialización
      console.warn('[S23] error inicializando tablas:', e);
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
        if (!current || current === '____' || (typeof current === 'string' && current.trim() === '')) {
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
      console.warn('[S23] Error inicializando párrafos:', e);
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
  protected getLoadParameters(): string[] | null { return this.groupConfig.getAISICCPPActivos(); }

  // Handlers
  onPetGruposEdadUpdated(eventOrTabla: any): void {
    const tabla = Array.isArray(eventOrTabla) ? eventOrTabla : (eventOrTabla?.detail ?? eventOrTabla);
    console.debug('[S23][FORM] onPetGruposEdadUpdated', { tablaLength: Array.isArray(tabla) ? tabla.length : 0, sample: Array.isArray(tabla) ? tabla.slice(0,2) : tabla });
    if (!Array.isArray(tabla)) return;

    const cuadro = this.tableNumbering.getGlobalTableNumber(this.seccionId, 0);
    const tablaConPorcentajes = TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
    const tablaNormalizada = this.normalizarTabla(tablaConPorcentajes);

    // Quitar fila 'Total' generada por el helper para evitar duplicados en el formulario
    const tablaSinTotal = tablaNormalizada.filter((row: any) => {
      const cat = (row?.categoria || '').toString().toLowerCase();
      return !cat.includes('total');
    });

    const pref = this.obtenerPrefijoGrupo();
    const keyBase = this.petGruposEdadConfig.tablaKey;
    const keyPref = pref ? `${keyBase}${pref}` : null;

    // Persistir la versión prefijada primero (si existe) y luego la base para evitar sobrescrituras
    try {
      if (keyPref) {
        this.projectFacade.setField(this.seccionId, null, keyPref, tablaSinTotal);
      }
      this.projectFacade.setField(this.seccionId, null, keyBase, tablaSinTotal);
    } catch (e) {
      console.warn('[S23] Error al setField en onPetGruposEdadUpdated', e);
    }

    // Persistir ambas claves en un solo call para consistencia
    const payload: Record<string, any> = { [keyBase]: tablaSinTotal };
    if (keyPref) payload[keyPref] = tablaSinTotal;
    this.formChange.persistFields(this.seccionId, 'table', payload);

    // Notificar cambio usando preferentemente la clave prefijada para que la vista lea el dato correcto
    if (keyPref) this.onFieldChange(keyPref, tablaSinTotal);
    else this.onFieldChange(keyBase, tablaSinTotal);
  }

  onPeaDistritoUpdated(eventOrTabla: any): void {
    const tabla = Array.isArray(eventOrTabla) ? eventOrTabla : (eventOrTabla?.detail ?? eventOrTabla);
    console.debug('[S23][FORM] onPeaDistritoUpdated', { tablaLength: Array.isArray(tabla) ? tabla.length : 0, sample: Array.isArray(tabla) ? tabla.slice(0,2) : tabla });
    if (!Array.isArray(tabla)) return;

    const tablaNormalizada = this.normalizarTabla(tabla);
    const keyBase = this.peaDistritoSexoConfig.tablaKey;
    const pref = this.obtenerPrefijoGrupo();
    const keyPref = pref ? `${keyBase}${pref}` : null;

    try {
      if (keyPref) this.projectFacade.setField(this.seccionId, null, keyPref, tablaNormalizada);
      this.projectFacade.setField(this.seccionId, null, keyBase, tablaNormalizada);
    } catch (e) {
      console.warn('[S23] Error al setField en onPeaDistritoUpdated', e);
    }

    const payload: Record<string, any> = { [keyBase]: tablaNormalizada };
    if (keyPref) payload[keyPref] = tablaNormalizada;
    this.formChange.persistFields(this.seccionId, 'table', payload);

    if (keyPref) this.onFieldChange(keyPref, tablaNormalizada);
    else this.onFieldChange(keyBase, tablaNormalizada);
  }

  onPeaOcupadaDesocupadaUpdated(eventOrTabla: any): void {
    const tabla = Array.isArray(eventOrTabla) ? eventOrTabla : (eventOrTabla?.detail ?? eventOrTabla);
    console.debug('[S23][FORM] onPeaOcupadaDesocupadaUpdated', { tablaLength: Array.isArray(tabla) ? tabla.length : 0, sample: Array.isArray(tabla) ? tabla.slice(0,2) : tabla });
    if (!Array.isArray(tabla)) return;

    const tablaNormalizada = this.normalizarTabla(tabla);
    const keyBase = this.peaOcupadaDesocupadaConfig.tablaKey;
    const pref = this.obtenerPrefijoGrupo();
    const keyPref = pref ? `${keyBase}${pref}` : null;

    try {
      if (keyPref) this.projectFacade.setField(this.seccionId, null, keyPref, tablaNormalizada);
      this.projectFacade.setField(this.seccionId, null, keyBase, tablaNormalizada);
    } catch (e) {
      console.warn('[S23] Error al setField en onPeaOcupadaDesocupadaUpdated', e);
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
      console.warn('[S23] Error actualizando fila PET en onPetGruposEdadFieldChange', e);
    }

    const tabla = this.datos[tablaKeyToUse] ?? [];
    if (!Array.isArray(tabla)) return;
    if ((keyPref && tablaKeyToUse === keyPref) || !this.datos[this.petGruposEdadConfig.tablaKey]) {
      console.log('[S23] onPetGruposEdadFieldChange updated pref tabla', { tablaKeyToUse, index, field, value });
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
      console.warn('[S23] Error actualizando fila PEA distrito en onPEADistritoSexoFieldChange', e);
    }

    const tabla = this.datos[tablaKeyToUse] ?? [];
    const usedKey = (keyPref && this.datos[keyPref]) ? keyPref : this.peaDistritoSexoConfig.tablaKey;

    // Forzar cálculo por sexo inmediatamente para asegurar que 'casos' y porcentajes se actualizan
    try {
      this.tableFacade.calcularPorcentajesPorSexo(this.datos, { ...this.peaDistritoSexoConfig, tablaKey: tablaKeyToUse });
    } catch (e) { console.warn('[S23] Error calculando porcentajes por sexo', e); }

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
      console.warn('[S23] Error actualizando fila PEA ocupada/desocupada en onPEAOcupadaDesocupadaFieldChange', e);
    }

    const tabla = this.datos[tablaKeyToUse] ?? [];
    console.log('[S23] onPEAOcupadaDesocupadaFieldChange updated', { tablaKeyToUse, tablaLength: tabla.length, index, field, value });
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

  private eliminarFilasTotal(): void {
    // Remove any 'total' rows if present
    ['petGruposEdadAISI', 'peaDistritoSexoTabla', 'peaOcupadaDesocupadaTabla'].forEach(k => {
      const tabla = this.datos[k];
      if (Array.isArray(tabla)) {
        const filtered = tabla.filter((item: any) => !(item?.categoria?.toString().toLowerCase?.() || '').includes('total'));
        if (filtered.length !== tabla.length) {
          this.projectFacade.setField(this.seccionId, null, k, filtered);
          this.onFieldChange(k, filtered, { refresh: false });
        }
      }
    });
  }

  private cargarDatosPEA(): void {
    // If data present, skip
    const ubigeos = this.groupConfig.getAISICCPPActivos();
    if (!ubigeos || ubigeos.length === 0) return;

    // ✅ Subscription única sin needsof takeUntil (solo se ejecuta una vez desde onInitCustom)
    this.peaService.obtenerPorCodigos(ubigeos)
      .subscribe((response: any) => {
        if (!response || !response.success) return;

        let petGruposEdad = response.tabla_3_41_pea_grupos_edad || [];
        petGruposEdad = petGruposEdad.map((item: any) => ({
          categoria: item.categoria || '',
          orden: item.orden || 0,
          casos: Number(item.casos) || 0,
          porcentaje: '0,00 %'
        }));

        this.projectFacade.setField(this.seccionId, null, this.petGruposEdadConfig.tablaKey, petGruposEdad);
        this.formChange.persistFields(this.seccionId, 'table', { [this.petGruposEdadConfig.tablaKey]: petGruposEdad });

        const datos_estado_sexo = response.tabla_3_42_3_43_pea_estado_sexo || [];
        const peaDistritoSexo = this.agruparPorEstado(datos_estado_sexo);
        this.projectFacade.setField(this.seccionId, null, this.peaDistritoSexoConfig.tablaKey, peaDistritoSexo);
        this.projectFacade.setField(this.seccionId, null, this.peaOcupadaDesocupadaConfig.tablaKey, peaDistritoSexo);
        this.formChange.persistFields(this.seccionId, 'table', { [this.peaDistritoSexoConfig.tablaKey]: peaDistritoSexo });

        this.cdRef.detectChanges();
      }, (error: any) => {
        console.error('[S23] Error cargando datos PEA:', error);
      });
  }

  private agruparPorEstado(datos_estado_sexo: any[]): any[] {
    const estados: { [key: string]: any } = {};
    for (const item of datos_estado_sexo) {
      let estado = item.estado || item.nombre || '';
      let sexo = item.sexo || '';
      let cantidad = item.cantidad || 0;
      if (typeof cantidad === 'string') cantidad = parseInt(cantidad) || 0;
      if (!estado || estado.trim() === '') continue;
      estado = estado.trim();
      if (!estados[estado]) {
        estados[estado] = { categoria: estado, hombres: 0, mujeres: 0, casos: 0, porcentajeHombres: '0,00 %', porcentajeMujeres: '0,00 %', porcentaje: '0,00 %' };
      }
      const sexoLower = (sexo + '').toLowerCase().trim();
      if (sexoLower === 'hombre' || sexoLower === 'h' || sexoLower === 'm' || sexoLower === 'masculino') {
        estados[estado].hombres += cantidad;
      } else if (sexoLower === 'mujer' || sexoLower === 'f' || sexoLower === 'femenino') {
        estados[estado].mujeres += cantidad;
      }
      estados[estado].casos += cantidad;
    }

    let totalGlobal = 0;
    for (const key in estados) totalGlobal += estados[key].casos;
    for (const key in estados) {
      const estado = estados[key];
      const totalEstado = estado.hombres + estado.mujeres;
      if (totalEstado > 0) {
        estado.porcentajeHombres = ((estado.hombres / totalEstado) * 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
        estado.porcentajeMujeres = ((estado.mujeres / totalEstado) * 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
      }
      if (totalGlobal > 0) {
        estado.porcentaje = ((estado.casos / totalGlobal) * 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
      }
    }

    return Object.values(estados);
  }

  override actualizarFotografiasFormMulti() {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix);
  }

  // Small helpers
  getPoblacionDistritalFn(): string { return this.datos.poblacionDistritalAISI || '____'; }
  getPETDistrital(): string { return this.datos?.petDistritalAISI || ''; }

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
    if (this.datos.textoIndicadoresDistritalesAISI && this.datos.textoIndicadoresDistritalesAISI !== '____') return this.datos.textoIndicadoresDistritalesAISI;
    const distrito = this.datos.distritoSeleccionado || '_____';
    const poblacionDistrital = this.getPoblacionDistritalFn();
    const petDistrital = this.getPETDistrital();
    return SECCION23_TEMPLATES.indicadoresDistritalesTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{poblacionDistrital}}', poblacionDistrital)
      .replace('{{petDistrital}}', petDistrital);
  }

  obtenerTextoPET_AISI(): string {
    if (this.datos.textoPET_AISI && this.datos.textoPET_AISI !== '____') return this.datos.textoPET_AISI;
    const centroPoblado = this.datos.centroPobladoAISI || '_____';
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
    if (this.datos.textoPETIntro_AISI && this.datos.textoPETIntro_AISI !== '____') return this.datos.textoPETIntro_AISI;
    return SECCION23_TEMPLATES.petIntroDefault;
  }

  getPorcentajePEA(): string {
    const tabla = this.peaDistritoSexoSignal() || [];
    if (!Array.isArray(tabla)) return '';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no'));
    return item?.porcentaje || '';
  }

  getPorcentajeNoPEA(): string {
    const tabla = this.peaDistritoSexoSignal() || [];
    if (!Array.isArray(tabla)) return '';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('no pea'));
    return item?.porcentaje || '';
  }

  getPorcentajeHombresPEA(): string {
    const tabla = this.peaDistritoSexoSignal() || [];
    if (!Array.isArray(tabla)) return '';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no'));
    return item?.porcentajeHombres || '';
  }

  getPorcentajeMujeresNoPEA(): string {
    const tabla = this.peaDistritoSexoSignal() || [];
    if (!Array.isArray(tabla)) return '';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('no pea'));
    return item?.porcentajeMujeres || '';
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
    if (this.datos.textoPEA_AISI && this.datos.textoPEA_AISI !== '____') return this.datos.textoPEA_AISI;
    const distrito = this.datos.distritoSeleccionado || '_____';
    const centroPoblado = this.datos.centroPobladoAISI || '_____';
    return SECCION23_TEMPLATES.peaCompleteTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{centroPoblado}}', centroPoblado);
  }

  getPorcentajePET(): string {
    if (!this.datos?.petGruposEdadAISI || !Array.isArray(this.datos.petGruposEdadAISI)) return '0,00 %';
    const totalPET = this.datos.petGruposEdadAISI.reduce((sum: number, item: any) => sum + (typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0), 0);
    const totalPoblacion = this.datos?.poblacionSexoAISI?.reduce((sum: number, item: any) => sum + (typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0), 0) || 0;
    if (!totalPoblacion || totalPoblacion === 0) return '';
    return ((totalPET / totalPoblacion) * 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  }

  getPorcentajeGrupoPET(categoria: string): string {
    if (!this.datos?.petGruposEdadAISI || !Array.isArray(this.datos.petGruposEdadAISI)) return '';
    const item = this.datos.petGruposEdadAISI.find((item: any) => item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase()));
    return item?.porcentaje || '';
  }

  obtenerTextoAnalisisPEA_AISI(): string {
    if (this.datos.textoAnalisisPEA_AISI && this.datos.textoAnalisisPEA_AISI !== '____') return this.datos.textoAnalisisPEA_AISI;
    const distrito = this.datos.distritoSeleccionado || '_____';
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
      console.warn('[S23] Error inicializando párrafos dependientes de tablas:', e);
    }
  }

  obtenerTextoEmpleoAISI(): string {
    if (this.datos.textoEmpleoAISI && this.datos.textoEmpleoAISI !== '____') return this.datos.textoEmpleoAISI;
    const distrito = this.datos.distritoSeleccionado || '_____';
    return SECCION23_TEMPLATES.empleoSituacionDefault.replace('{{distrito}}', distrito);
  }

  obtenerTextoEmpleoDependiente_AISI(): string {
    if (this.datos.textoEmpleoDependiente_AISI && this.datos.textoEmpleoDependiente_AISI !== '____') return this.datos.textoEmpleoDependiente_AISI;
    return SECCION23_TEMPLATES.empleoDependienteDefault;
  }

  obtenerTextoIngresosAISI(): string {
    if (this.datos.textoIngresosAISI && this.datos.textoIngresosAISI !== '____') return this.datos.textoIngresosAISI;
    const distrito = this.datos.distritoSeleccionado || '_____';
    const centroPoblado = this.datos.centroPobladoAISI || '_____';
    const ingresoPerCapita = this.getIngresoPerCapita();
    const rankingIngreso = this.getRankingIngreso();
    return SECCION23_TEMPLATES.ingresosTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{centroPoblado}}', centroPoblado)
      .replace('{{ingresoPerCapita}}', ingresoPerCapita)
      .replace('{{rankingIngreso}}', rankingIngreso);
  }

  obtenerTextoIndiceDesempleoAISI(): string {
    if (this.datos.textoIndiceDesempleoAISI && this.datos.textoIndiceDesempleoAISI !== '____') return this.datos.textoIndiceDesempleoAISI;
    const distrito = this.datos.distritoSeleccionado || '_____';
    const centroPoblado = this.datos.centroPobladoAISI || '_____';
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
    if (this.datos.textoPEAAISI && this.datos.textoPEAAISI !== '____') return this.datos.textoPEAAISI;
    const distrito = this.datos.distritoSeleccionado || '_____';
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
}
