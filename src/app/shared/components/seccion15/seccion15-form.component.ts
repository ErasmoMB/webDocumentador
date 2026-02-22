import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { TableConfig } from '../../../core/services/tables/table-management.service';
import { TableManagementFacade } from '../../../core/services/tables/table-management.facade';
import { FormChangeService } from '../../../core/services/state/form-change.service';
import { BackendApiService } from '../../../core/services/infrastructure/backend-api.service';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { TablePercentageHelper } from '../../utils/table-percentage-helper';
import { SECCION15_SECTION_ID, SECCION15_PHOTO_PREFIX, SECCION15_DEFAULT_TEXTS, SECCION15_TEMPLATES, SECCION15_WATCHED_FIELDS } from './seccion15-constants';
import { debugLog } from '../../utils/debug';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion15-form',
    templateUrl: './seccion15-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion15FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION15_SECTION_ID;
  @Input() override modoFormulario: boolean = false;

  // ✅ Exportar TEMPLATES e importar constantes
  readonly SECCION15_TEMPLATES = SECCION15_TEMPLATES;
  readonly SECCION15_DEFAULT_TEXTS = SECCION15_DEFAULT_TEXTS;

  override readonly PHOTO_PREFIX = SECCION15_PHOTO_PREFIX;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION15_WATCHED_FIELDS;

  fotografiasIglesia: FotoItem[] = [];

  // ✅ HELPER PARA OBTENER PREFIJO
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
  }

  // ✅ OVERRIDE: onFieldChange CON PREFIJO AUTOMÁTICO
  override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
    const prefijo = this.obtenerPrefijo();
    const campoConPrefijo = prefijo ? `${fieldId}${prefijo}` : fieldId;
    super.onFieldChange(campoConPrefijo, value, options);
  }

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  // ✅ MÉTODOS INLINE PARA TEXTOS (CAPA 3: Default + Personalización del usuario)
  obtenerTextoAspectosCulturales(): string {
    const prefijo = this.obtenerPrefijo();
    const campoKey = `textoAspectosCulturales${prefijo}`;
    
    // CAPA 1: Personalización del usuario
    if (this.datos[campoKey] && String(this.datos[campoKey]).trim().length > 0) {
      return String(this.datos[campoKey]);
    }
    
    // CAPA 3: Default con contexto
    const comunidad = this.obtenerNombreComunidadActual();
    return SECCION15_DEFAULT_TEXTS.textoAspectosCulturalesDefault(comunidad);
  }

  obtenerTextoIdioma(): string {
    const prefijo = this.obtenerPrefijo();
    const campoKey = `textoIdioma${prefijo}`;
    
    // CAPA 1: Personalización del usuario
    if (this.datos[campoKey] && String(this.datos[campoKey]).trim().length > 0) {
      return String(this.datos[campoKey]);
    }
    
    // CAPA 3: Default
    return SECCION15_DEFAULT_TEXTS.textoIdiomaDefault;
  }

  obtenerTextoReligion(): string {
    const prefijo = this.obtenerPrefijo();
    const campoKey = `parrafoSeccion15_religion_completo${prefijo}`;
    
    // CAPA 1: Personalización del usuario
    if (this.datos[campoKey] && String(this.datos[campoKey]).trim().length > 0) {
      return String(this.datos[campoKey]);
    }
    
    // CAPA 3: Default con contexto
    const comunidad = this.obtenerNombreComunidadActual();
    return SECCION15_DEFAULT_TEXTS.textoReligionDefault(comunidad);
  }

  // ✅ PATRÓN UNICA_VERDAD: fotosCacheSignal Signal para monitorear cambios de imágenes
  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const prefijo = this.obtenerPrefijo();
    
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`)();
      
      if (imagen) {
        fotos.push({
          titulo: titulo || `Fotografía ${i}`,
          fuente: fuente || 'GEADES, 2024',
          imagen: imagen
        } as FotoItem);
      }
    }
    return fotos;
  });

  readonly lenguasMaternasSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `lenguasMaternasTabla${prefijo}` : 'lenguasMaternasTabla';
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return fromField ?? fromTable ?? [];
  });

  readonly religionesSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `religionesTabla${prefijo}` : 'religionesTabla';
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return fromField ?? fromTable ?? [];
  });

  readonly lenguasMaternasConfigSignal: Signal<TableConfig> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `lenguasMaternasTabla${prefijo}` : 'lenguasMaternasTabla';
    return {
      tablaKey: tablaKey,
      totalKey: 'categoria',           // ✅ Campo que identifica la fila Total
      campoTotal: 'casos',             // ✅ Campo numérico a sumar
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,        // ✅ Habilitar cálculo
      camposParaCalcular: ['casos'],
      permiteAgregarFilas: true,
      permiteEliminarFilas: true,
      noInicializarDesdeEstructura: true
    };
  });

  readonly religionesConfigSignal: Signal<TableConfig> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `religionesTabla${prefijo}` : 'religionesTabla';
    return {
      tablaKey: tablaKey,
      totalKey: 'categoria',           // ✅ Campo que identifica la fila Total
      campoTotal: 'casos',             // ✅ Campo numérico a sumar
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,        // ✅ Habilitar cálculo
      camposParaCalcular: ['casos'],
      permiteAgregarFilas: true,
      permiteEliminarFilas: true,
      noInicializarDesdeEstructura: true
    };
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private formChangeService: FormChangeService,
    private backendApi: BackendApiService,
    private tableFacade: TableManagementFacade
  ) {
    super(cdRef, injector);

    effect(() => {
      const sectionData = this.formDataSignal();
      this.datos = { ...sectionData };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.lenguasMaternasSignal();
      this.religionesSignal();
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    // ✅ VERIFICAR SI YA EXISTEN DATOS PERSISTIDOS antes de cargar del backend
    const prefijo = this.obtenerPrefijo();
    const formData = this.formDataSignal();
    
    const lenguasKey = `lenguasMaternasTabla${prefijo}`;
    const religionesKey = `religionesTabla${prefijo}`;
    
    const existingLenguas = formData[lenguasKey];
    const existingReligiones = formData[religionesKey];
    
    const hasLenguas = existingLenguas && Array.isArray(existingLenguas) && existingLenguas.length > 0;
    const hasReligiones = existingReligiones && Array.isArray(existingReligiones) && existingReligiones.length > 0;
    
    if (!hasLenguas || !hasReligiones) {
      debugLog('[SECCION15] No hay datos persistidos, cargando del backend...');
      // Solo inicializar las que no tienen datos
      if (!hasLenguas) {
        this.projectFacade.setField(this.seccionId, null, lenguasKey, []);
        this.projectFacade.setField(this.seccionId, null, 'lenguasMaternasTabla', []);
      }
      if (!hasReligiones) {
        this.projectFacade.setField(this.seccionId, null, religionesKey, []);
        this.projectFacade.setField(this.seccionId, null, 'religionesTabla', []);
      }
      this.cargarDatosDelBackend();
    } else {
      debugLog('[SECCION15] Datos persistidos encontrados, no se carga del backend');
    }
    
    this.cargarFotografias();
  }

  // ============================================================================
  // 😨 PATRÓN SOLO LECTURA - CARGA DE DATOS DEL BACKEND
  // ============================================================================

  /**
   * Inicializa tablas como arrays vacíos antes de cargar del backend
   */
  private inicializarTablasVacias(): void {
    const prefijo = this.obtenerPrefijo();
    
    // Inicializar lenguas maternas
    const lenguasKeyConPrefijo = `lenguasMaternasTabla${prefijo}`;
    this.projectFacade.setField(this.seccionId, null, lenguasKeyConPrefijo, []);
    this.projectFacade.setField(this.seccionId, null, 'lenguasMaternasTabla', []);
    
    // Inicializar religiones
    const religionesKeyConPrefijo = `religionesTabla${prefijo}`;
    this.projectFacade.setField(this.seccionId, null, religionesKeyConPrefijo, []);
    this.projectFacade.setField(this.seccionId, null, 'religionesTabla', []);
  }

  /**
   * Carga datos de lenguas maternas y religiones desde el backend con cálculo y persistencia
   */
  private cargarDatosDelBackend(): void {
    // Obtener el ubigeo/id_ubigeo del grupo actual
    const codigosArray = this.getCodigosCentrosPobladosAISD();
    const codigos = [...codigosArray]; // Copia mutable
    
    if (!codigos || codigos.length === 0) {
      console.log('[SECCION15] No hay centros poblados en el grupo actual');
      return;
    }

    const prefijo = this.obtenerPrefijo();

    console.log('[SECCION15] Cargando datos del backend con codigos:', codigos);

    // 1. Cargar Lenguas desde POST /demograficos/lengua
    this.backendApi.postLengua(codigos).subscribe({
      next: (response: any) => {
        try {
          // El backend devuelve [{ rows: [...] }]
          const dataRaw = response?.data?.[0]?.rows || [];
          let datosTransformados = this.transformarLenguas(dataRaw);
          console.log('[SECCION15] ✅ Datos de lenguas maternas cargados:', datosTransformados);
          
          if (datosTransformados.length > 0) {
            const lenguasKey = `lenguasMaternasTabla${prefijo}`;
            
            // ✅ CALCULAR TOTALES Y PORCENTAJES (incluye fila Total)
            const datosConPorcentajes = TablePercentageHelper.calcularPorcentajesSimple(datosTransformados, '1');
            
            // ✅ GUARDAR EN PROJECTSTATEFACADE
            this.projectFacade.setField(this.seccionId, null, lenguasKey, datosConPorcentajes);
            this.projectFacade.setField(this.seccionId, null, 'lenguasMaternasTabla', datosConPorcentajes);
            
            // ✅ PERSISTIR EN REDIS (con Y sin prefijo)
            try {
              this.formChangeService.persistFields(this.seccionId, 'table', 
                { [lenguasKey]: datosConPorcentajes, 'lenguasMaternasTabla': datosConPorcentajes }, 
                { notifySync: true }
              );
            } catch (e) { console.error(e); }
          }
        } catch (err) {
          console.error('[SECCION15] ❌ Error procesando lenguas maternas:', err);
        }
      },
      error: (err) => {
        console.error('[SECCION15] ❌ Error cargando lenguas maternas:', err);
      }
    });

    // 2. Cargar Religiones desde POST /demograficos/religion-por-cpp
    this.backendApi.postReligionPorCpp(codigos).subscribe({
      next: (response: any) => {
        try {
          // El backend devuelve [{ rows: [...] }]
          const dataRaw = response?.data?.[0]?.rows || [];
          let datosTransformados = this.transformarReligiones(dataRaw);
          console.log('[SECCION15] ✅ Datos de religiones cargados:', datosTransformados);
          
          if (datosTransformados.length > 0) {
            const religionesKey = `religionesTabla${prefijo}`;
            
            // ✅ CALCULAR TOTALES Y PORCENTAJES (incluye fila Total)
            const datosConPorcentajes = TablePercentageHelper.calcularPorcentajesSimple(datosTransformados, '2');
            
            // ✅ GUARDAR EN PROJECTSTATEFACADE
            this.projectFacade.setField(this.seccionId, null, religionesKey, datosConPorcentajes);
            this.projectFacade.setField(this.seccionId, null, 'religionesTabla', datosConPorcentajes);
            
            // ✅ PERSISTIR EN REDIS (con Y sin prefijo)
            try {
              this.formChangeService.persistFields(this.seccionId, 'table', 
                { [religionesKey]: datosConPorcentajes, 'religionesTabla': datosConPorcentajes }, 
                { notifySync: true }
              );
            } catch (e) { console.error(e); }
          }
        } catch (err) {
          console.error('[SECCION15] ❌ Error procesando religiones:', err);
        }
      },
      error: (err) => {
        console.error('[SECCION15] ❌ Error cargando religiones:', err);
      }
    });
  }



  /**
   * Transforma datos de lenguas desde el formato del backend
   * Filtra la fila Total que viene del backend
   */
  private transformarLenguas(data: any[]): any[] {
    if (!Array.isArray(data)) {
      return [];
    }
    
    // Filtrar la fila Total y devolver solo las categorías
    return data
      .filter(item => item.categoria !== 'Total')
      .map(item => ({
        categoria: item.categoria || item.lengua || item.nombre || '',
        casos: parseInt(item.casos || item.count || '0', 10),
        porcentaje: item.porcentaje || item.percentage || ''
      }));
  }

  /**
   * Transforma datos de religiones desde el formato del backend
   * Filtra la fila Total que viene del backend
   */
  private transformarReligiones(data: any[]): any[] {
    if (!Array.isArray(data)) {
      return [];
    }
    
    // Filtrar la fila Total y devolver solo las categorías
    return data
      .filter(item => item.categoria !== 'Total')
      .map(item => ({
        categoria: item.categoria || item.religion || item.nombre || '',
        casos: parseInt(item.casos || item.count || '0', 10),
        porcentaje: item.porcentaje || item.percentage || ''
      }));
  }

  onLenguasMaternasTableUpdated(updatedData?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `lenguasMaternasTabla${prefijo}` : 'lenguasMaternasTabla';
    let datos = updatedData || this.lenguasMaternasSignal() || [];
    
    // ✅ CALCULAR TOTALES Y PORCENTAJES (incluye fila Total)
    const datosConPorcentajes = TablePercentageHelper.calcularPorcentajesSimple(datos, '1');
    
    // ✅ GUARDAR EN PROJECTSTATEFACADE (UNICA VERDAD)
    this.projectFacade.setField(this.seccionId, null, tablaKey, datosConPorcentajes);
    this.projectFacade.setField(this.seccionId, null, 'lenguasMaternasTabla', datosConPorcentajes);
    this.datos[tablaKey] = datosConPorcentajes;

    // ✅ Persistir en Redis (con Y sin prefijo)
    debugLog('[SECCION15] 💾 Persistiendo lenguas maternas');
    try {
      this.formChangeService.persistFields(this.seccionId, 'table', 
        { [tablaKey]: datosConPorcentajes, 'lenguasMaternasTabla': datosConPorcentajes }, 
        { notifySync: true }
      );
      debugLog('[SECCION15] ✅ Persistencia lenguas maternas exitosa');
    } catch (e) { 
      debugLog('[SECCION15] ❌ Error persistencia:', e); 
    }

    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  onReligionesTableUpdated(updatedData?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `religionesTabla${prefijo}` : 'religionesTabla';
    let datos = updatedData || this.religionesSignal() || [];
    
    // ✅ CALCULAR TOTALES Y PORCENTAJES (incluye fila Total)
    const datosConPorcentajes = TablePercentageHelper.calcularPorcentajesSimple(datos, '2');
    
    // ✅ GUARDAR EN PROJECTSTATEFACADE (UNICA VERDAD)
    this.projectFacade.setField(this.seccionId, null, tablaKey, datosConPorcentajes);
    this.projectFacade.setField(this.seccionId, null, 'religionesTabla', datosConPorcentajes);
    this.datos[tablaKey] = datosConPorcentajes;

    // ✅ Persistir en Redis (con Y sin prefijo)
    debugLog('[SECCION15] 💾 Persistiendo religiones');
    try {
      this.formChangeService.persistFields(this.seccionId, 'table', 
        { [tablaKey]: datosConPorcentajes, 'religionesTabla': datosConPorcentajes }, 
        { notifySync: true }
      );
      debugLog('[SECCION15] ✅ Persistencia religiones exitosa');
    } catch (e) { 
      debugLog('[SECCION15] ❌ Error persistencia:', e); 
    }

    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  // ============================================================================
  // MÉTODOS GETTERS PARA CLAVES DE TABLA (Patrón de Sección 9)
  // ============================================================================

  getTablaKeyLenguasMaternas(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `lenguasMaternasTabla${prefijo}` : 'lenguasMaternasTabla';
  }

  getTablaKeyReligiones(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `religionesTabla${prefijo}` : 'religionesTabla';
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
  }

  override getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
    return 'manual';
  }

  onInputChange(fieldName: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.onFieldChange(fieldName, target.value);
    }
  }
}
