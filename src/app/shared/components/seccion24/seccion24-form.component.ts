import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { transformActividadesEconomicas } from 'src/app/core/config/table-transforms';
import { SECCION24_TEMPLATES, SECCION24_DEFAULT_TEXTS } from './seccion24-constants';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';

/**
 * ✅ Desenvuelve datos del backend
 * El backend devuelve: [{ rows: [...], total: number, matched: [], missing: [] }]
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

@Component({
  imports: [CommonModule, FormsModule, CoreSharedModule, DynamicTableComponent, ImageUploadComponent, ParagraphEditorComponent],
  selector: 'app-seccion24-form',
  templateUrl: './seccion24-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class Seccion24FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.3';
  @Input() override modoFormulario: boolean = false;

  // ✅ Flag para evitar ejecuciones múltiples del effect de carga
  private seccion24DatosCargados: boolean = false;

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION24_TEMPLATES = SECCION24_TEMPLATES;

  // ✅ PHOTO_PREFIX como Signal
  readonly photoPrefixSignal: Signal<string>;
  
  // ✅ NUMERACIÓN GLOBAL
  readonly globalTableNumberSignal: Signal<string>;
  readonly globalPhotoNumbersSignal: Signal<string[]>;
  
  // ✅ TableConfig para tabla de SOLO LECTURA (datos del backend)
  readonly actividadesEconomicasConfig: TableConfig = {
    tablaKey: 'actividadesEconomicasAISI',
    totalKey: '',                          // ✅ Sin fila de total
    campoTotal: '',                        // ✅ Sin cálculo total
    campoPorcentaje: '',                   // ✅ Sin cálculo porcentaje
    calcularPorcentajes: false,             // ✅ No calcular automáticamente
    camposParaCalcular: [],                // ✅ No hay campos a calcular
    noInicializarDesdeEstructura: true,    // ✅ No inicializar vacía
    permiteAgregarFilas: true,
    permiteEliminarFilas: true
  };

  override readonly PHOTO_PREFIX: string;
  override useReactiveSync: boolean = true;

  // ✅ Signal para clave de tabla
  readonly tablaKeyActividadesSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `actividadesEconomicasAISI${prefijo}` : 'actividadesEconomicasAISI';
  });

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly actividadesEconomicasSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `actividadesEconomicasAISI${prefijo}` : 'actividadesEconomicasAISI';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
           this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const prefix = this.photoPrefixSignal();
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, prefix, groupPrefix);
  });

  readonly fotosActividadesSignal: Signal<FotoItem[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const prefix = prefijo ? `fotografiaActividadesEconomicas${prefijo}` : 'fotografiaActividadesEconomicas';
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, prefix, groupPrefix);
  });

  readonly fotosMercadoSignal: Signal<FotoItem[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const prefix = prefijo ? `fotografiaMercado${prefijo}` : 'fotografiaMercado';
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, prefix, groupPrefix);
  });

  readonly viewModel = computed(() => ({
    centroPoblado: (this.formDataSignal() as any)?.centroPobladoAISI || '',
    actividadesEconomicas: this.actividadesEconomicasSignal(),
    ciudadOrigenComercio: (this.formDataSignal() as any)?.ciudadOrigenComercio || '',
    textos: {
      intro: (() => {
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldKey = prefijo ? `textoIntroActividadesEconomicasAISI${prefijo}` : 'textoIntroActividadesEconomicasAISI';
        const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
        if (manual && manual.trim().length > 0) return (manual.split('\n\n')[0] || manual);
        return this.generarTextoIntroDefault();
      })(),
      introLong: (() => {
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldKey = prefijo ? `textoIntroActividadesEconomicasAISI${prefijo}` : 'textoIntroActividadesEconomicasAISI';
        const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
        if (manual && manual.trim().length > 0) return (manual.split('\n\n')[1] || '');
        return this.generarTextoIntroLongDefault();
      })(),
      analisis: (() => {
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldKey = prefijo ? `textoActividadesEconomicasAISI${prefijo}` : 'textoActividadesEconomicasAISI';
        const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
        return manual || this.generarTextoAnalisisDefault();
      })(),
      mercado: (() => {
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldKey = prefijo ? `textoMercadoProductos${prefijo}` : 'textoMercadoProductos';
        const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
        return manual || this.generarTextoMercadoDefault();
      })(),
      habitos: (() => {
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldKey = prefijo ? `textoHabitosConsumo${prefijo}` : 'textoHabitosConsumo';
        const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
        return manual || this.generarTextoHabitosDefault();
      })(),
      fuente: (() => {
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldKey = prefijo ? `fuenteActividadesEconomicasAISI${prefijo}` : 'fuenteActividadesEconomicasAISI';
        const manual = this.projectFacade.selectField(this.seccionId, null, fieldKey)();
        return manual || this.generarFuenteDefault();
      })()
    },
    fotos: this.fotosCacheSignal(),
    globalTableNumber: this.globalTableNumberSignal()
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private formChange: FormChangeService, private globalNumbering: GlobalNumberingService, private backendApi: BackendApiService) {
    super(cdRef, injector);
    
    // ✅ Crear Signal para PHOTO_PREFIX dinámico
    this.photoPrefixSignal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      return prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';
    });
    
    // Inicializar PHOTO_PREFIX para compatibilidad
    this.PHOTO_PREFIX = this.photoPrefixSignal();
    
    // ✅ Signal para número global de tabla
    this.globalTableNumberSignal = computed(() => {
      return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
    });
    
    // ✅ Signal para números globales de fotos
    this.globalPhotoNumbersSignal = computed(() => {
      const prefix = this.photoPrefixSignal();
      const fotos = this.fotosCacheSignal();
      return fotos.map((_, index) => this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index));
    });

    effect(() => {
      const data = this.formDataSignal();
      const actividades = this.actividadesEconomicasSignal();
      this.datos = { ...data, actividadesEconomicasAISI: actividades };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.fotosCacheSignal();
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
    try { this.formChange.persistFields(this.seccionId, 'form', { [campoConPrefijo]: centroPobladoAISI }, { notifySync: true }); } catch (e) {}
    
    // ✅ Usar effect para esperar a que los datos de Redis se restauren
    // Esto evita el problema de timing donde los datos aún no están disponibles
    effect(() => {
      const formData = this.formDataSignal();
      // Usar un flag para evitar ejecuciones múltiples
      if (this.seccion24DatosCargados) return;
      
      // Obtener prefijo dentro del effect para asegurar que está actualizado
      const prefijoLocal = this.obtenerPrefijoGrupo();
      const tablaKey = prefijoLocal ? `actividadesEconomicasAISI${prefijoLocal}` : 'actividadesEconomicasAISI';
      const existingData = formData[tablaKey];
      
      if (!existingData || !Array.isArray(existingData) || existingData.length === 0) {
        console.log('[SECCION24] No hay datos persistidos, inicializando y cargando del backend...');
        this.inicializarTablasVacias();
        this.cargarDatosDelBackend();
        this.seccion24DatosCargados = true;
      } else {
        console.log('[SECCION24] Datos persistidos encontrados, no se carga del backend');
        this.seccion24DatosCargados = true;
      }
      
      this.cdRef.markForCheck();
    }, { injector: this.injector });
  }

  /**
   * ✅ Inicializa las tablas como arrays vacíos antes de cargar datos del backend
   */
  private inicializarTablasVacias(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `actividadesEconomicasAISI${prefijo}` : 'actividadesEconomicasAISI';
    
    // Inicializar como array vacío
    this.projectFacade.setField(this.seccionId, null, tablaKey, []);
    // También guardar sin prefijo para fallback
    this.projectFacade.setField(this.seccionId, null, 'actividadesEconomicasAISI', []);
  }

  /**
   * ✅ Carga datos de actividades económicas desde el backend
   * Endpoint: POST /demograficos/actividad-economica
   */
  private cargarDatosDelBackend(): void {
    // ✅ USAR getCodigosCentrosPobladosAISI() DEL GRUPO ACTUAL (clase base)
    const codigosArray = this.getCodigosCentrosPobladosAISI();
    const codigos = [...codigosArray]; // Crear copia mutable para el API

    if (!codigos || codigos.length === 0) {
      console.log('[SECCION24] ⚠️ No hay centros poblados en el grupo actual para cargar datos');
      return;
    }

    console.log('[SECCION24] 📡 Cargando datos de actividades económicas desde backend...', { codigos });

    // ✅ OBTENER PREFIJO PARA GUARDAR CON CLAVE CORRECTA
    const prefijo = this.obtenerPrefijoGrupo();
    
    // Cargar actividades económicas desde /demograficos/actividad-economica
    this.backendApi.postActividadEconomica(codigos).subscribe({
      next: (response: any) => {
        try {
          const dataRaw = response?.data || [];
          // Desenvuelver datos del backend
          const datosDesenvueltos = unwrapDemograficoData(dataRaw);
          const datosTransformados = transformActividadesEconomicas(datosDesenvueltos);
          console.log('[SECCION24] ✅ Datos de actividades económicas cargados:', datosTransformados);
          
          // Guardar en el state CON PREFIJO
          if (datosTransformados.length > 0) {
            const tablaKey = `actividadesEconomicasAISI${prefijo}`;
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            // También guardar sin prefijo para fallback
            this.projectFacade.setField(this.seccionId, null, 'actividadesEconomicasAISI', datosTransformados);
            
            // ✅ PERSISTIR EN REDIS (con Y sin prefijo)
            try {
              this.formChange.persistFields(
                this.seccionId, 
                'table', 
                { [tablaKey]: datosTransformados, 'actividadesEconomicasAISI': datosTransformados }, 
                { notifySync: true }
              );
            } catch (e) {
              console.error('[SECCION24] ⚠️ Could not persist to Redis:', e);
            }
            
            this.cdRef.markForCheck();
          }
        } catch (e) {
          console.error('[SECCION24] ❌ Error transformando datos de actividades económicas:', e);
        }
      },
      error: (err: any) => {
        console.error('[SECCION24] ❌ Error cargando actividades económicas:', err);
      }
    });
  }

  protected override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }
  
  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  actualizarCentroPoblado(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'centroPobladoAISI', valor);
    this.onFieldChange('centroPobladoAISI', valor);
  }

  onActividadesEconomicasChange(tabla: any[]): void {
    // ✅ CALCULAR TOTALES Y PORCENTAJES para tabla simple (actividad, casos, porcentaje)
    const tablaConPorcentajes = TablePercentageHelper.calcularPorcentajesSimple(tabla, '3.45');
    
    // ✅ GUARDAR EN PROJECTSTATEFACADE (UNICA VERDAD)
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `actividadesEconomicasAISI${prefijo}` : 'actividadesEconomicasAISI';
    
    this.projectFacade.setField(this.seccionId, null, tablaKey, tablaConPorcentajes);
    this.projectFacade.setField(this.seccionId, null, 'actividadesEconomicasAISI', tablaConPorcentajes);
    try { this.projectFacade.setTableData(this.seccionId, null, tablaKey, tablaConPorcentajes); } catch (e) { }
    
    // ✅ GUARDAR EN SESSION-DATA (Redis) - CRÍTICO PARA PERSISTENCIA
    try {
      const payload: any = { actividadesEconomicasAISI: tablaConPorcentajes };
      if (prefijo) payload[tablaKey] = tablaConPorcentajes;
      this.formChange.persistFields(this.seccionId, 'table', payload, { notifySync: true });
      console.log('[SECCION24] ✅ Actividades Economicas data saved to session-data');
    } catch (e) {
      console.error('[SECCION24] ⚠️ Could not save to session-data:', e);
    }
    
    // Notify section about the change
    this.onFieldChange('actividadesEconomicasAISI', tablaConPorcentajes);
    this.cdRef.markForCheck();
  }

  actualizarCiudadOrigenComercio(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'ciudadOrigenComercio', valor);
    try {
      const payload: any = { ciudadOrigenComercio: valor };
      const prefijo = this.obtenerPrefijoGrupo();
      if (prefijo) payload[`ciudadOrigenComercio${prefijo}`] = valor;
      this.formChange.persistFields(this.seccionId, 'form', payload);
    } catch (e) {}
    this.onFieldChange('ciudadOrigenComercio', valor);
  }

  actualizarTexto(fieldId: string, valor: string): void {
    // Special behavior only for the intro field: preserve second paragraph when editing Párrafo 1
    if (fieldId === 'textoIntroActividadesEconomicasAISI') {
      const actual = this.projectFacade.selectField(this.seccionId, null, fieldId)() || '';
      const parts = actual.split('\n\n');
      // Prefer stored second paragraph; if none, use generated view default
      const storedSecond = parts[1] || '';
      const generatedSecond = this.viewModel().textos?.introLong || '';
      const second = (storedSecond && storedSecond.trim().length > 0) ? storedSecond : (generatedSecond || '');
      const nuevo = second && second.trim().length > 0 ? `${valor}\n\n${second}` : valor;
      this.projectFacade.setField(this.seccionId, null, fieldId, nuevo);
      try {
        const payload: any = { [fieldId]: nuevo };
        const prefijo = this.obtenerPrefijoGrupo();
        if (prefijo) payload[`${fieldId}${prefijo}`] = nuevo;
        this.formChange.persistFields(this.seccionId, 'text', payload);
      } catch (e) {}
      this.onFieldChange(fieldId, nuevo);
      return;
    }

    // Default behavior: save exactly what the user typed (no merging with other generated texts)
    this.projectFacade.setField(this.seccionId, null, fieldId, valor);
    try {
      const payload: any = { [fieldId]: valor };
      const prefijo = this.obtenerPrefijoGrupo();
      if (prefijo) payload[`${fieldId}${prefijo}`] = valor;
      this.formChange.persistFields(this.seccionId, 'text', payload);
    } catch (e) {}
    this.onFieldChange(fieldId, valor);
  }

  actualizarIntroLong(valor: string): void {
    const fieldId = 'textoIntroActividadesEconomicasAISI';
    const actual = this.projectFacade.selectField(this.seccionId, null, fieldId)() || '';
    const parts = actual.split('\n\n');
    const first = parts[0] || this.generarTextoIntroDefault();
    const nuevo = `${first}\n\n${valor}`;
    this.projectFacade.setField(this.seccionId, null, fieldId, nuevo);
    try { const payload: any = { [fieldId]: nuevo }; const prefijo = this.obtenerPrefijoGrupo(); if (prefijo) payload[`${fieldId}${prefijo}`] = nuevo; this.formChange.persistFields(this.seccionId, 'text', payload); } catch (e) {}
    this.onFieldChange(fieldId, nuevo);
  }

  onFotografiasChangeHandler(fotografias: FotoItem[], prefix?: string): void {
    this.onFotografiasChange(fotografias, prefix);
    this.cdRef.markForCheck();
  }

  private generarTextoIntroDefault(): string {
    const cp = (this.formDataSignal() as any)?.centroPoblado || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || SECCION24_DEFAULT_TEXTS.centroPobladoDefault;
    return SECCION24_DEFAULT_TEXTS.textoIntroActividadesEconomicasAISI.replace(/____/g, cp);
  }

  private generarTextoAnalisisDefault(): string {
    const cp = (this.formDataSignal() as any)?.centroPoblado || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || SECCION24_DEFAULT_TEXTS.centroPobladoDefault;
    const actividades = this.actividadesEconomicasSignal() || [];
    const agricultura = actividades.find((a: any) => a.actividad && String(a.actividad).toLowerCase().includes('agricultura'));
    const administracion = actividades.find((a: any) => a.actividad && String(a.actividad).toLowerCase().includes('administración'));
    const porcentajeAgricultura = agricultura?.porcentaje && String(agricultura.porcentaje).trim().length > 0 ? agricultura.porcentaje : '____';
    const porcentajeAdministracion = administracion?.porcentaje && String(administracion.porcentaje).trim().length > 0 ? administracion.porcentaje : '____';

    return SECCION24_DEFAULT_TEXTS.textoActividadesEconomicasAISI
      .replace(/____/g, cp)
      .replace(/____/g, porcentajeAgricultura)
      .replace(/____/g, porcentajeAdministracion);
  }

  private generarTextoMercadoDefault(): string {
    const cp = (this.formDataSignal() as any)?.centroPoblado || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || SECCION24_DEFAULT_TEXTS.centroPobladoDefault;
    const ciudadOrigen = (this.formDataSignal() as any)?.ciudadOrigenComercio || this.projectFacade.selectField(this.seccionId, null, 'ciudadOrigenComercio')() || SECCION24_DEFAULT_TEXTS.ciudadOrigenDefault;

    return SECCION24_DEFAULT_TEXTS.textoMercadoProductos
      .replace(/____/g, cp)
      .replace(/____/g, ciudadOrigen)
      .replace(/____/g, cp)
      .replace(/____/g, ciudadOrigen)
      .replace(/____/g, cp);
  }

  private generarTextoHabitosDefault(): string {
    const cp = (this.formDataSignal() as any)?.centroPoblado || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || SECCION24_DEFAULT_TEXTS.centroPobladoDefault;
    const ciudadOrigen = (this.formDataSignal() as any)?.ciudadOrigenComercio || this.projectFacade.selectField(this.seccionId, null, 'ciudadOrigenComercio')() || SECCION24_DEFAULT_TEXTS.ciudadOrigenDefault;

    return SECCION24_DEFAULT_TEXTS.textoHabitosConsumo
      .replace(/____/g, cp)
      .replace(/____/g, ciudadOrigen);
  }

  private generarFuenteDefault(): string {
    return SECCION24_DEFAULT_TEXTS.fuenteActividadesEconomicasAISI;
  }

  private generarTextoIntroLongDefault(): string {
    const cp = (this.formDataSignal() as any)?.centroPobladoAISI || SECCION24_DEFAULT_TEXTS.centroPobladoDefault;
    return SECCION24_DEFAULT_TEXTS.textoIntroActividadesEconomicasAISILong.replace(/____/g, cp);
  }

  actualizarFuente(valor: string): void {
    this.projectFacade.setField(this.seccionId, null, 'fuenteActividadesEconomicasAISI', valor);
    try {
      const payload: any = { fuenteActividadesEconomicasAISI: valor };
      const prefijo = this.obtenerPrefijoGrupo();
      if (prefijo) payload[`fuenteActividadesEconomicasAISI${prefijo}`] = valor;
      this.formChange.persistFields(this.seccionId, 'form', payload);
    } catch (e) {}
    this.onFieldChange('fuenteActividadesEconomicasAISI', valor);
  }

  trackByIndex(index: number): number { return index; }
}
