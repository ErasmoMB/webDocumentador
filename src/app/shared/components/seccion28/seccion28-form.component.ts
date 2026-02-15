import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector, ViewChildren, QueryList, Signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { GroupConfigService } from 'src/app/core/services/groups/group-config.service';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { AISIGroupService } from 'src/app/core/services/groups/aisi-group.service';
import { SECCION28_TEMPLATES } from './seccion28-constants';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, ParagraphEditorComponent, ImageUploadComponent, DynamicTableComponent],
  selector: 'app-seccion28-form',
  templateUrl: './seccion28-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion28FormComponent extends BaseSectionComponent implements OnDestroy {
  // NOTE: renamed to avoid overriding BaseSectionComponent 'tables' coordinator
  @ViewChildren(DynamicTableComponent) dynamicTables?: QueryList<DynamicTableComponent>;
  @Input() override seccionId: string = '3.1.4.B.1.7';
  @Input() override modoFormulario: boolean = false;

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION28_TEMPLATES = SECCION28_TEMPLATES;

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  override readonly PHOTO_PREFIX: string;
  readonly PHOTO_PREFIX_SALUD = 'fotografiaSaludAISI';
  readonly PHOTO_PREFIX_EDUCACION = 'fotografiaEducacionAISI';
  readonly PHOTO_PREFIX_RECREACION = 'fotografiaRecreacionAISI';
  readonly PHOTO_PREFIX_DEPORTE = 'fotografiaDeporteAISI';

  // ✅ Signals de prefijos para campos con aislamiento
  readonly photoPrefixSignalSalud: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fotografiaSaludAISI${prefijo}` : 'fotografiaSaludAISI';
  });

  readonly photoPrefixSignalEducacion: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fotografiaEducacionAISI${prefijo}` : 'fotografiaEducacionAISI';
  });

  readonly photoPrefixSignalRecreacion: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fotografiaRecreacionAISI${prefijo}` : 'fotografiaRecreacionAISI';
  });

  readonly photoPrefixSignalDeporte: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fotografiaDeporteAISI${prefijo}` : 'fotografiaDeporteAISI';
  });

  readonly datosSeccionSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)() ?? {};
  });

  readonly centroPobladoActualSignal: Signal<string> = computed(() => {
    const data = this.datosSeccionSignal();
    return this.obtenerNombreCentroPobladoActual() || data?.['centroPobladoAISI'] || this.datos?.centroPobladoAISI || '____';
  });

  readonly distritoActualSignal: Signal<string> = computed(() => {
    const data = this.datosSeccionSignal();
    const ubicacion = this.projectFacade.ubicacionGlobal();
    return this.obtenerNombreDistritoActual() || data?.['distritoSeleccionado'] || ubicacion?.distrito || '____';
  });

  readonly tituloPuestoSaludSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoKey = prefijo ? `puestoSaludTitulo${prefijo}` : 'puestoSaludTitulo';
    return this.datos[campoKey] || this.datos['puestoSaludTitulo'] || '';
  });

  readonly fuentePuestoSaludSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoKey = prefijo ? `puestoSaludFuente${prefijo}` : 'puestoSaludFuente';
    return this.datos[campoKey] || this.datos['puestoSaludFuente'] || '';
  });

  readonly tituloEducacionSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoKey = prefijo ? `educacionTitulo${prefijo}` : 'educacionTitulo';
    return this.datos[campoKey] || this.datos['educacionTitulo'] || '';
  });

  readonly fuenteEducacionSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoKey = prefijo ? `educacionFuente${prefijo}` : 'educacionFuente';
    return this.datos[campoKey] || this.datos['educacionFuente'] || '';
  });

  readonly textoSaludSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoKey = prefijo ? `textoSaludCP${prefijo}` : 'textoSaludCP';
    return this.datos[campoKey] || this.datos['textoSaludCP'] || '';
  });

  readonly textoEducacionSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoKey = prefijo ? `textoEducacionCP${prefijo}` : 'textoEducacionCP';
    return this.datos[campoKey] || this.datos['textoEducacionCP'] || '';
  });

  readonly textoRecreacion1Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoKey = prefijo ? `textoRecreacionCP1${prefijo}` : 'textoRecreacionCP1';
    return this.datos[campoKey] || this.datos['textoRecreacionCP1'] || '';
  });

  readonly textoRecreacion2Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoKey = prefijo ? `textoRecreacionCP2${prefijo}` : 'textoRecreacionCP2';
    return this.datos[campoKey] || this.datos['textoRecreacionCP2'] || '';
  });

  readonly textoRecreacion3Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoKey = prefijo ? `textoRecreacionCP3${prefijo}` : 'textoRecreacionCP3';
    return this.datos[campoKey] || this.datos['textoRecreacionCP3'] || '';
  });

  readonly textoDeporte1Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoKey = prefijo ? `textoDeporteCP1${prefijo}` : 'textoDeporteCP1';
    return this.datos[campoKey] || this.datos['textoDeporteCP1'] || '';
  });

  readonly textoDeporte2Signal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoKey = prefijo ? `textoDeporteCP2${prefijo}` : 'textoDeporteCP2';
    return this.datos[campoKey] || this.datos['textoDeporteCP2'] || '';
  });

  // ✅ Tabla Signals para detección de cambios reactiva en OnPush
  readonly puestoSaludTablaSignal: Signal<any[]> = computed(() => {
    const tablaKey = this.getTablaKeyPuestoSalud();
    return this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? [];
  });

  readonly educacionTablaSignal: Signal<any[]> = computed(() => {
    const tablaKey = this.getTablaKeyEducacion();
    return this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? [];
  });

  fotografiasSaludFormMulti: FotoItem[] = [];
  fotografiasEducacionFormMulti: FotoItem[] = [];
  fotografiasRecreacionFormMulti: FotoItem[] = [];
  fotografiasDeporteFormMulti: FotoItem[] = [];

  puestoSaludConfig: TableConfig = {
    tablaKey: 'puestoSaludCpTabla',
    totalKey: 'categoria',
    campoTotal: 'descripcion',
    campoPorcentaje: '',
    estructuraInicial: [
      { categoria: 'Categoría', descripcion: '' },
      { categoria: 'Nombre', descripcion: '' },
      { categoria: 'Ubicación', descripcion: '' },
      { categoria: 'Director Médico y/o Responsable de la Atención de Salud', descripcion: '' },
      { categoria: 'Código Único de IPRESS', descripcion: '' },
      { categoria: 'Categoría del EESS', descripcion: '' },
      { categoria: 'Tipo de Establecimiento de Salud', descripcion: '' },
      { categoria: 'Nombre de la subcategoría (Clasificación)', descripcion: '' },
      { categoria: 'Estado del EESS', descripcion: '' },
      { categoria: 'Condición del EESS', descripcion: '' },
      { categoria: 'Nombre de DISA/DIRESA', descripcion: '' },
      { categoria: 'Nombre de RED', descripcion: '' },
      { categoria: 'Nombre de MICRORED', descripcion: '' },
      { categoria: 'Institución a la que pertenece el establecimiento', descripcion: '' },
      { categoria: 'Teléfono del establecimiento', descripcion: '' },
      { categoria: 'Número de ambientes con que cuenta el establecimiento', descripcion: '' },
      { categoria: 'Horario de atención', descripcion: '' }
    ]
  }; 

  educacionConfig: TableConfig = {
    tablaKey: 'educacionCpTabla',
    totalKey: 'nombreIE',
    campoTotal: 'cantidadEstudiantes',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['cantidadEstudiantes'],
    noInicializarDesdeEstructura: true  // ✅ Datos del backend
  };

  // ✅ NUEVO: Signal para ubicación global (desde metadata)
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    protected tableFacade: TableManagementFacade,
    private groupConfig: GroupConfigService,
    private backendApi: BackendApiService
  ) {
    super(cdRef, injector);

    // ✅ Inicializar PHOTO_PREFIX dinámicamente
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';

    // ✅ CRÍTICO: Escuchar cambios en signals de tabla y forzar detección de cambios
    effect(() => {
      this.puestoSaludTablaSignal();
      this.educacionTablaSignal();
      this.cdRef.markForCheck();
    });
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
    this.onFieldChange(campoConPrefijo, centroPobladoAISI, { refresh: false });
    
    this.actualizarFotografiasFormMulti();
    // ✅ ORDEN CORREGIDO: Primero cargar datos, LUEGO inicializar
    this.inicializarPuestoSalud();
    this.inicializarEducacion();
    this.cargarEducacion();  // Se ejecuta después de inicializaciones
    this.eliminarFilasTotal();
  }

  private inicializarEducacion(): void {
    const tablaKey = this.getTablaKeyEducacion();
    const tablaKeyBase = 'educacionCpTabla';
    
    const datosExistentes = this.datos[tablaKey] || this.datos[tablaKeyBase];
    if (!Array.isArray(datosExistentes) || datosExistentes.length === 0) {
      const inicial: any[] = [];
      this.datos[tablaKey] = inicial;
      this.datos[tablaKeyBase] = inicial;
    }
    
    // Inicializar título y fuente para la tabla de educación si no existen
    if (this.projectFacade.selectField(this.seccionId, null, 'educacionTitulo')() === undefined) {
      this.onFieldChange('educacionTitulo', '');
    }
    if (this.projectFacade.selectField(this.seccionId, null, 'educacionFuente')() === undefined) {
      this.onFieldChange('educacionFuente', '');
    }
  }

  private inicializarPuestoSalud(): void {
    const tablaKey = this.getTablaKeyPuestoSalud();
    const tablaKeyBase = 'puestoSaludCpTabla';
    
    const datosExistentes = this.datos[tablaKey] || this.datos[tablaKeyBase];
    if (!Array.isArray(datosExistentes) || datosExistentes.length === 0) {
      const inicial = structuredClone(this.puestoSaludConfig.estructuraInicial);
      this.datos[tablaKey] = inicial;
      this.datos[tablaKeyBase] = inicial;
      this.onFieldChange(tablaKey as any, inicial, { refresh: false });
      this.onFieldChange(tablaKeyBase as any, inicial, { refresh: false });
    }

    // Inicializar título y fuente si no existen
    if (this.projectFacade.selectField(this.seccionId, null, 'puestoSaludTitulo')() === undefined) {
      this.onFieldChange('puestoSaludTitulo', '');
    }
    if (this.projectFacade.selectField(this.seccionId, null, 'puestoSaludFuente')() === undefined) {
      this.onFieldChange('puestoSaludFuente', '');
    }
  }

  // Implement abstract methods required by AutoLoadSectionComponent
  protected getSectionKey(): string { return 'seccion28_aisi'; }
  protected getLoadParameters(): string[] | null { return this.groupConfig.getAISICCPPActivos(); }
  protected detectarCambios(): boolean { return false; }
  protected actualizarValoresConPrefijo(): void { }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasSaludFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_SALUD,
      groupPrefix
    );
    this.fotografiasEducacionFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_EDUCACION,
      groupPrefix
    );
    this.fotografiasRecreacionFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_RECREACION,
      groupPrefix
    );
    this.fotografiasDeporteFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_DEPORTE,
      groupPrefix
    );
  }

  // Small helpers and handlers
  onTablaUpdated(): void {
    this.agregarFilaTotalEducacion();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  obtenerTextoRecreacionCP1(): string {
    if (this.datos.textoRecreacionCP1 && this.datos.textoRecreacionCP1 !== '____') {
      return this.datos.textoRecreacionCP1;
    }
    const centroPoblado = this.centroPobladoActualSignal();
    return SECCION28_TEMPLATES.textoRecreacionCP1Default.replace(/____/g, centroPoblado);
  }

  obtenerTextoRecreacionCP2(): string {
    if (this.datos.textoRecreacionCP2 && this.datos.textoRecreacionCP2 !== '____') {
      return this.datos.textoRecreacionCP2;
    }
    return SECCION28_TEMPLATES.textoRecreacionCP2Default;
  }

  obtenerTextoRecreacionCP3(): string {
    if (this.datos.textoRecreacionCP3 && this.datos.textoRecreacionCP3 !== '____') {
      return this.datos.textoRecreacionCP3;
    }
    return SECCION28_TEMPLATES.textoRecreacionCP3Default;
  }

  obtenerTextoDeporteCP1(): string {
    if (this.datos.textoDeporteCP1 && this.datos.textoDeporteCP1 !== '____') {
      return this.datos.textoDeporteCP1;
    }
    const centroPoblado = this.centroPobladoActualSignal();
    return SECCION28_TEMPLATES.textoDeporteCP1Default.replace(/____/g, centroPoblado);
  }

  obtenerTextoDeporteCP2(): string {
    if (this.datos.textoDeporteCP2 && this.datos.textoDeporteCP2 !== '____') {
      return this.datos.textoDeporteCP2;
    }
    const centroPoblado = this.centroPobladoActualSignal();
    return SECCION28_TEMPLATES.textoDeporteCP2Default.replace(/____/g, centroPoblado);
  }

  onFotografiasSaludChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_SALUD, fotografias);
    this.fotografiasSaludFormMulti = [...fotografias];
  }

  onFotografiasEducacionChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_EDUCACION, fotografias);
    this.fotografiasEducacionFormMulti = [...fotografias];
  }

  onFotografiasRecreacionChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_RECREACION, fotografias);
    this.fotografiasRecreacionFormMulti = [...fotografias];
  }

  onFotografiasDeporteChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_DEPORTE, fotografias);
    this.fotografiasDeporteFormMulti = [...fotografias];
  }

  obtenerTextoSaludCP(): string {
    if (this.datos.textoSaludCP && this.datos.textoSaludCP !== '____') {
      return this.datos.textoSaludCP;
    }
    const distrito = this.distritoActualSignal();
    const centroPoblado = this.centroPobladoActualSignal();
    return SECCION28_TEMPLATES.textoSaludDefault
      .replace('____', distrito)
      .replace('____', centroPoblado);
  }

  obtenerTextoEducacionCP(): string {
    if (this.datos.textoEducacionCP && this.datos.textoEducacionCP !== '____') {
      return this.datos.textoEducacionCP;
    }
    const centroPoblado = this.centroPobladoActualSignal();
    const nombreIE = this.datos.nombreIEMayorEstudiantes || 'IE Virgen de Copacabana';
    const cantidadEstudiantes = this.datos.cantidadEstudiantesIEMayor || '28';
    return SECCION28_TEMPLATES.textoEducacionDefault
      .replace('____', centroPoblado)
      .replace('____', nombreIE)
      .replace('____', cantidadEstudiantes);
  }

  private cargarEducacion(): void {
    const tablaKey = this.getTablaKeyEducacion();
    const tablaKeyBase = 'educacionCpTabla';
    
    // ✅ CRÍTICO: Verificar si hay datos EN FORMULARIOSERVICE (cambios guardados por usuario)
    // antes de cargar del backend
    const datosEnFormulario = this.projectFacade.selectField(this.seccionId, null, tablaKey)() 
                              || this.projectFacade.selectField(this.seccionId, null, tablaKeyBase)();
    
    if (datosEnFormulario && Array.isArray(datosEnFormulario) && datosEnFormulario.length > 0) {
      // Ya hay datos guardados por usuario, NO cargar del backend
      this.datos[tablaKey] = datosEnFormulario;
      this.datos[tablaKeyBase] = datosEnFormulario;
      return;
    }

    // Verificar si hay datos locales (this.datos)
    const datosExistentes = this.datos[tablaKey] || this.datos[tablaKeyBase];
    if (datosExistentes && Array.isArray(datosExistentes) && datosExistentes.length > 0) {
      const tieneDatosValidos = datosExistentes.some((item: any) => 
        (item.nombreIE && item.nombreIE !== '____' && item.nombreIE.trim() !== '') || 
        (item.cantidadEstudiantes && item.cantidadEstudiantes !== 0 && item.cantidadEstudiantes !== '0')
      );
      if (tieneDatosValidos) return;
    }

    // Solo cargar del backend si NO hay datos previos
    const codigos = this.groupConfig.getAISICCPPActivos();
    if (!codigos || codigos.length === 0) return;

    // ✅ Subscription única sin takeUntil (solo se ejecuta una vez desde cargarEducacionDelBackend)
    this.backendApi.postEducacion(codigos)
      .subscribe(
      (response: any) => {
        if (response.success && response.data && Array.isArray(response.data)) {
          const educacionData = response.data.map((item: any) => ({
            nombreIE: '____',
            nivel: item.nivel_educativo || '',
            tipoGestion: '____',
            cantidadEstudiantes: Number(item.casos) || 0,
            porcentaje: '0,00 %'
          }));

          // ✅ NUEVO: Verificar NUEVAMENTE antes de asignar (por si user editó mientras se cargaban)
          const datosAhoraEnFormulario = this.projectFacade.selectField(this.seccionId, null, tablaKey)() 
                                         || this.projectFacade.selectField(this.seccionId, null, tablaKeyBase)();
          if (datosAhoraEnFormulario && Array.isArray(datosAhoraEnFormulario) && datosAhoraEnFormulario.length > 0) {
            // User hizo cambios mientras se cargaba, NO sobrescribir
            return;
          }

          // ✅ SEGURO: Asignar datos del backend
          this.datos[tablaKey] = educacionData;
          this.datos[tablaKeyBase] = educacionData;
          this.onFieldChange(tablaKey as any, educacionData, { refresh: false });
          this.onFieldChange(tablaKeyBase as any, educacionData, { refresh: false });
          this.tableFacade.calcularPorcentajes(this.datos, { ...this.educacionConfig, tablaKey });
          this.agregarFilaTotalEducacion();
          this.cdRef.detectChanges();
        }
      },
      (error: any) => {}
    );
  }

  getTablaKeyEducacion(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `educacionCpTabla${prefijo}` : 'educacionCpTabla';
  }

  getTablaKeyPuestoSalud(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `puestoSaludCpTabla${prefijo}` : 'puestoSaludCpTabla';
  }

  // ✅ Métodos para retornar datos de tabla formateados para binding
  getPuestoSaludTablaData(): Record<string, any[]> {
    const key = this.getTablaKeyPuestoSalud();
    return { [key]: this.puestoSaludTablaSignal() };
  }

  getEducacionTablaData(): Record<string, any[]> {
    const key = this.getTablaKeyEducacion();
    return { [key]: this.educacionTablaSignal() };
  }

  // Eliminar filas Total al cargar datos
  eliminarFilasTotal(): void {
    const educacionKey = this.getTablaKeyEducacion();
    const educacion = this.datos[educacionKey] || this.datos?.educacionCpTabla;
    if (educacion && Array.isArray(educacion)) {
      const filtered = educacion.filter((item: any) => 
        !item.nombreIE || !item.nombreIE.toLowerCase().includes('total')
      );
      if (filtered.length !== educacion.length) {
        this.datos[educacionKey] = filtered;
        this.onFieldChange(educacionKey as any, filtered, { refresh: false });
      }
    }
  }

  onPuestoSaludTableUpdated(): void {
    const tablaKey = this.getTablaKeyPuestoSalud();
    const tablaKeyBase = 'puestoSaludCpTabla';
    
    const tabla = this.datos[tablaKey] || this.datos[tablaKeyBase] || [];
    
    this.datos[tablaKey] = [...tabla];
    this.datos[tablaKeyBase] = [...tabla];
    
    this.onFieldChange(tablaKey as any, tabla, { refresh: false });
    this.onFieldChange(tablaKeyBase as any, tabla, { refresh: false });
    
    // ✅ CORREGIDO: NO llamar actualizarDatos() (sobrescribe cambios locales)
    // Los cambios ya están persistidos por onFieldChange()
    
    this.cdRef.detectChanges();
  }

  // Forzar sincronización de una tabla desde ProjectState (prefijo/table store)
  public sincronizarTablaDesdeStore(tablaKeyBase: string): void {
    try {
      const prefixedKey = require('src/app/shared/utils/prefix-manager').PrefixManager.getFieldKey(this.seccionId, tablaKeyBase);
      const fromTable = (this.projectFacade.selectTableData(this.seccionId, null, tablaKeyBase)() || this.projectFacade.selectTableData(this.seccionId, null, prefixedKey)());
      const fromField = (this.projectFacade.selectField(this.seccionId, null, tablaKeyBase)() || this.projectFacade.selectField(this.seccionId, null, prefixedKey)());
      const payload = Array.isArray(fromTable) && fromTable.length > 0 ? fromTable : (Array.isArray(fromField) ? fromField : null);
      if (Array.isArray(payload) && payload.length > 0) {
        const keyToSet = prefixedKey || tablaKeyBase;
        const payloadClone = structuredClone(payload);
        
        // ✅ CRÍTICO: Actualizar this.datos crea NUEVA REFERENCIA completa para forzar OnPush detection
        const datosActualizados = { ...this.datos };
        datosActualizados[keyToSet] = payloadClone;
        if (tablaKeyBase && prefixedKey && prefixedKey !== tablaKeyBase) {
          datosActualizados[tablaKeyBase] = payloadClone;
        }
        
        // ✅ CRÍTICO: Asignar la NUEVA referencia (no mutar la vieja)
        this.datos = datosActualizados;
        
        // Persist locally to avoid other logic re-initializing from estructuraInicial
        this.onFieldChange(keyToSet as any, payloadClone, { refresh: false });
        if (tablaKeyBase && tablaKeyBase !== keyToSet) {
          this.onFieldChange(tablaKeyBase as any, payloadClone, { refresh: false });
        }
        
        try { const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper'); ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) {}
        
        // ✅ CRÍTICO: Detectar cambios ANTES de actualizar componentes hijos
        this.cdRef.detectChanges();
        
        // Force child DynamicTable(s) to refresh if present
        try {
          const tablaKeyPrefixed = prefixedKey || tablaKeyBase;
          if (this.dynamicTables && this.dynamicTables.length > 0) {
            this.dynamicTables.forEach(t => {
              try {
                const tKey = t.tablaKey || t.config?.tablaKey || 'unknown';
                // If payload exists for this table, force load it directly to avoid re-initialization race
                try {
                  if (payloadClone && (tKey === keyToSet || tKey === tablaKeyBase || tKey === tablaKeyPrefixed)) {
                    try { t.forceLoadTableData(tKey === tablaKeyPrefixed ? tablaKeyPrefixed : keyToSet, payloadClone); } catch (e) { /* noop */ }
                    return;
                  }
                } catch (e) {}
                // Otherwise, invoke actualizarDatos() to allow the table to read from the store
                try { t.actualizarDatos(); } catch (e) { /* noop */ }
              } catch (e) {}
            });
          }
        } catch (e) {}
        
        // ✅ CRÍTICO: Detectar cambios DESPUÉS de actualizar child components
        this.cdRef.markForCheck();
        this.cdRef.detectChanges();

        // Agregar fila de total para tabla de educación
        if (tablaKeyBase && tablaKeyBase.includes('educacion')) {
          this.agregarFilaTotalEducacion();
        }
      }
    } catch (e) {
    }
  }

  onEducacionFieldChange(index: number, field: string, value: any): void {
    const tablaKey = this.getTablaKeyEducacion();
    const tabla = this.datos[tablaKey] || this.datos.educacionCpTabla || [];
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      if (field === 'cantidadEstudiantes') {
        const total = tabla.reduce((sum: number, item: any) => {
          const nombreIE = item.nombreIE?.toString().toLowerCase() || '';
          if (nombreIE.includes('total')) return sum;
          const cantidad = typeof item.cantidadEstudiantes === 'number' ? item.cantidadEstudiantes : parseInt(item.cantidadEstudiantes) || 0;
          return sum + cantidad;
        }, 0);
        if (total > 0) {
          tabla.forEach((item: any) => {
            const nombreIE = item.nombreIE?.toString().toLowerCase() || '';
            if (!nombreIE.includes('total')) {
              const cantidad = typeof item.cantidadEstudiantes === 'number' ? item.cantidadEstudiantes : parseInt(item.cantidadEstudiantes) || 0;
              const porcentaje = ((cantidad / total) * 100)
                .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                .replace('.', ',') + ' %';
              item.porcentaje = porcentaje;
            }
          });
        }
      }
      this.datos[tablaKey] = [...tabla];
      this.onFieldChange(tablaKey as any, tabla, { refresh: false });
      const datosNuevos = this.projectFacade.obtenerDatos();
      this.datos = { ...datosNuevos };
      this.cdRef.detectChanges();
    }
  }

  onEducacionTableUpdated(): void {
    const tablaKey = this.getTablaKeyEducacion();
    const tablaKeyBase = 'educacionCpTabla';
    
    const tabla = this.datos[tablaKey] || this.datos[tablaKeyBase] || [];
    
    this.datos[tablaKey] = [...tabla];
    this.datos[tablaKeyBase] = [...tabla];
    
    this.onFieldChange(tablaKey as any, tabla, { refresh: false });
    this.onFieldChange(tablaKeyBase as any, tabla, { refresh: false });
    
    // ✅ CORREGIDO: NO reemplazar todo this.datos (pierde cambios)
    // Solo obtener datos del store si hay cambios externos (no ediciones locales)
    // this.actualizarDatos() sería llamado solo si es necesario
    
    this.cdRef.detectChanges();
  }

  get columnasPuestoSalud(): any[] {
    return [
      { field: 'categoria', label: 'Categoría', type: 'text', placeholder: '', readonly: false, align: 'left' },
      { field: 'descripcion', label: 'Descripción', type: 'text', placeholder: '', readonly: false, align: 'left' }
    ];
  }

  get columnasEducacion(): any[] {
    return [
      { field: 'nombreIE', label: 'Nombre de IE', type: 'text', align: 'left' },
      { field: 'nivel', label: 'Nivel', type: 'text', align: 'left' },
      { field: 'tipoGestion', label: 'Tipo de Gestión', type: 'text', align: 'left' },
      { field: 'cantidadEstudiantes', label: 'Cantidad de estudiantes', type: 'number', align: 'right' },
      { field: 'porcentaje', label: 'Porcentaje', type: 'text', align: 'right', readonly: true }
    ];
  }

  getTotalEducacion(): number {
    const tablaKey = this.getTablaKeyEducacion();
    const tabla = this.datos[tablaKey] || this.datos.educacionCpTabla || [];
    const filtered = (tabla || []).filter((item: any) => !(item.nombreIE && item.nombreIE.toString().toLowerCase().includes('total')));
    return filtered.reduce((s: number, i: any) => s + (Number(i.cantidadEstudiantes) || 0), 0);
  }

  /**
   * Devuelve la tabla de educación con una fila de Total agregada al final
   */
  getEducacionConTotal(): any[] {
    const tablaKey = this.getTablaKeyEducacion();
    const tabla = this.datos[tablaKey] || this.datos.educacionCpTabla || [];
    
    if (!Array.isArray(tabla) || tabla.length === 0) {
      return tabla;
    }

    // Filtrar filas que ya sean total
    const filasValidas = tabla.filter((item: any) => !(item.nombreIE && item.nombreIE.toString().toLowerCase().includes('total')));
    
    // Calcular totales
    const totalEstudiantes = filasValidas.reduce((sum: number, item: any) => sum + (Number(item.cantidadEstudiantes) || 0), 0);
    
    // Crear fila de total
    const filaTotalPorcentaje = totalEstudiantes > 0 ? '100,00 %' : '____';
    const filaTotal = {
      nombreIE: 'Total',
      nivel: '',
      tipoGestion: '',
      cantidadEstudiantes: totalEstudiantes,
      porcentaje: filaTotalPorcentaje
    };

    // Retornar tabla con la fila de total
    return [...filasValidas, filaTotal];
  }

  /**
   * Agrega una fila de Total a la tabla de educación
   * CORREGIDO: Sincroniza AMBAS claves (con y sin prefijo)
   */
  private agregarFilaTotalEducacion(): void {
    const tablaKey = this.getTablaKeyEducacion();
    const tablaKeyBase = 'educacionCpTabla';
    
    const tabla = this.datos[tablaKey] || this.datos[tablaKeyBase] || [];
    
    if (!Array.isArray(tabla) || tabla.length === 0) {
      return;
    }

    // Verificar si ya existe una fila "Total"
    const yaExisteTotal = tabla.some((item: any) => item.nombreIE && item.nombreIE.toString().toLowerCase().includes('total'));
    if (yaExisteTotal) {
      return;
    }

    // Filtrar filas válidas (sin total)
    const filasValidas = tabla.filter((item: any) => !(item.nombreIE && item.nombreIE.toString().toLowerCase().includes('total')));
    
    // Calcular totales
    const totalEstudiantes = filasValidas.reduce((sum: number, item: any) => sum + (Number(item.cantidadEstudiantes) || 0), 0);
    
    // Crear fila de total
    const filaTotalPorcentaje = totalEstudiantes > 0 ? '100,00 %' : '____';
    const filaTotal = {
      nombreIE: 'Total',
      nivel: '',
      tipoGestion: '',
      cantidadEstudiantes: totalEstudiantes,
      porcentaje: filaTotalPorcentaje
    };

    const tablaConTotal = [...filasValidas, filaTotal];
    
    // Actualizar AMBAS claves para sincronización
    this.datos[tablaKey] = tablaConTotal;
    this.datos[tablaKeyBase] = tablaConTotal;
    
    // Persiste ambas claves
    this.onFieldChange(tablaKey as any, tablaConTotal, { refresh: false });
    this.onFieldChange(tablaKeyBase as any, tablaConTotal, { refresh: false });
  }
}
