import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { transformNivelEducativoTabla, transformTasaAnalfabetismoTabla } from 'src/app/core/config/table-transforms';
import { debugLog } from 'src/app/shared/utils/debug';
import { SECCION14_PHOTO_PREFIX, SECCION14_DEFAULT_TEXTS, SECCION14_TEMPLATES, SECCION14_WATCHED_FIELDS } from './seccion14-constants';

// Función helper para desenvuelver datos del backend
const unwrapEducacionData = (responseData: any): any[] => {
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
  selector: 'app-seccion14-form',
  templateUrl: './seccion14-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  standalone: true
})
export class Seccion14FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.10';
  @Input() override modoFormulario: boolean = false;

  // ✅ EXPORTAR TEMPLATES PARA EL HTML
  readonly SECCION14_TEMPLATES = SECCION14_TEMPLATES;

  override readonly PHOTO_PREFIX = SECCION14_PHOTO_PREFIX;
  override useReactiveSync: boolean = true;

  fotografiasSeccion14: FotoItem[] = [];

  override watchedFields: string[] = SECCION14_WATCHED_FIELDS;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  // ✅ MÉTODOS INLINE PARA TEXTOS (CAPA 3: Default + Personalización del usuario)
  obtenerTextoIndicadoresEducacionIntro(): string {
    const prefijo = this.obtenerPrefijo();
    const campo = `parrafoSeccion14_indicadores_educacion_intro${prefijo}`;
    
    // CAPA 1: Personalización del usuario (máxima prioridad)
    if (this.datos[campo] && String(this.datos[campo]).trim().length > 0) {
      return String(this.datos[campo]);
    }
    
    // CAPA 3: Default hardcodeado
    return SECCION14_DEFAULT_TEXTS.textoIndicadoresEducacionIntro;
  }

  obtenerTextoNivelEducativo(): string {
    const prefijo = this.obtenerPrefijo();
    const campo = `textoNivelEducativo${prefijo}`;
    
    // CAPA 1: Personalización del usuario
    if (this.datos[campo] && String(this.datos[campo]).trim().length > 0) {
      return String(this.datos[campo]);
    }
    
    // CAPA 3: Default
    return SECCION14_DEFAULT_TEXTS.textoNivelEducativo
      .replace('____% de la población ha alcanzado educación primaria', this.getPorcentajePrimaria() + '% de la población ha alcanzado educación primaria')
      .replace('____% secundaria', this.getPorcentajeSecundaria() + '% secundaria')
      .replace('____% educación superior no universitaria', this.getPorcentajeSuperiorNoUniversitaria() + '% educación superior no universitaria');
  }

  obtenerTextoTasaAnalfabetismo(): string {
    const prefijo = this.obtenerPrefijo();
    const campo = `textoTasaAnalfabetismo${prefijo}`;
    
    // CAPA 1: Personalización del usuario
    if (this.datos[campo] && String(this.datos[campo]).trim().length > 0) {
      return String(this.datos[campo]);
    }
    
    // CAPA 3: Default con valores calculados
    return SECCION14_DEFAULT_TEXTS.textoTasaAnalfabetismo
      .replace('____%, lo que representa ____', this.getTasaAnalfabetismo() + '%, lo que representa ' + this.getCasosAnalfabetismo());
  }

  readonly nivelEducativoTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    // Leer directamente del state del projectFacade
    const tablaKey = `nivelEducativoTabla${prefijo}`;
    const dataConPrefijo = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    if (dataConPrefijo && dataConPrefijo.length > 0) return dataConPrefijo;
    
    const dataSinPrefijo = this.projectFacade.selectField(this.seccionId, null, 'nivelEducativoTabla')();
    return dataSinPrefijo || [];
  });

  readonly tasaAnalfabetismoTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    // Leer directamente del state del projectFacade
    const tablaKey = `tasaAnalfabetismoTabla${prefijo}`;
    const dataConPrefijo = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    if (dataConPrefijo && dataConPrefijo.length > 0) return dataConPrefijo;
    
    const dataSinPrefijo = this.projectFacade.selectField(this.seccionId, null, 'tasaAnalfabetismoTabla')();
    return dataSinPrefijo || [];
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    const prefijo = this.obtenerPrefijo();
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ CONFIGURACIONES DE TABLAS - Solo lectura, datos del backend
  readonly nivelEducativoConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `nivelEducativoTabla${this.obtenerPrefijo()}`,
    totalKey: '',
    campoTotal: '',
    campoPorcentaje: 'porcentaje',
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: false
  }));

  readonly tasaAnalfabetismoConfigSignal: Signal<TableConfig> = computed(() => ({
    tablaKey: `tasaAnalfabetismoTabla${this.obtenerPrefijo()}`,
    totalKey: '',
    campoTotal: '',
    campoPorcentaje: 'porcentaje',
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    noInicializarDesdeEstructura: true,
    calcularPorcentajes: false
  }));

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private backendApi: BackendApiService
  ) {
    super(cdRef, injector);

    effect(() => {
      const sectionData = this.formDataSignal();
      this.datos = { ...sectionData };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    // ✅ Inicializar tablas vacías y luego cargar datos del backend
    this.inicializarTablasVacias();
    this.cargarDatosDelBackend();
  }

  /**
   * ✅ Inicializar tablas como arrays vacíos
   */
  private inicializarTablasVacias(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // Inicializar nivel educativo
    this.projectFacade.setField(this.seccionId, null, `nivelEducativoTabla${prefijo}`, []);
    this.projectFacade.setField(this.seccionId, null, 'nivelEducativoTabla', []);
    
    // Inicializar tasa analfabetismo
    this.projectFacade.setField(this.seccionId, null, `tasaAnalfabetismoTabla${prefijo}`, []);
    this.projectFacade.setField(this.seccionId, null, 'tasaAnalfabetismoTabla', []);
  }

  /**
   * ✅ Carga datos educativos desde el backend
   */
  private cargarDatosDelBackend(): void {
    const codigosArray = this.getCodigosCentrosPobladosAISD();
    const codigos = [...codigosArray];

    if (!codigos || codigos.length === 0) {
      debugLog('[SECCION14] ⚠️ No hay centros poblados en el grupo actual');
      return;
    }

    debugLog('[SECCION14] 📡 Cargando datos educativos desde backend...', { codigos });

    const prefijo = this.obtenerPrefijoGrupo();

    // Cargar nivel educativo
    this.backendApi.postEducacion(codigos).subscribe({
      next: (response: any) => {
        try {
          const dataRaw = response?.data || [];
          const datosDesenvueltos = unwrapEducacionData(dataRaw);
          const datosTransformados = transformNivelEducativoTabla(datosDesenvueltos);
          debugLog('[SECCION14] ✅ Nivel educativo cargado:', datosTransformados);

          if (datosTransformados.length > 0) {
            const tablaKey = `nivelEducativoTabla${prefijo}`;
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            this.projectFacade.setField(this.seccionId, null, 'nivelEducativoTabla', datosTransformados);
            this.cdRef.markForCheck();
          }
        } catch (e) {
          debugLog('[SECCION14] ❌ Error transformando nivel educativo:', e);
        }
      },
      error: (err: any) => {
        debugLog('[SECCION14] ❌ Error cargando nivel educativo:', err);
      }
    });

    // Cargar tasa de analfabetismo
    this.backendApi.postAlfabetizacion(codigos).subscribe({
      next: (response: any) => {
        try {
          const dataRaw = response?.data || [];
          const datosDesenvueltos = unwrapEducacionData(dataRaw);
          const datosTransformados = transformTasaAnalfabetismoTabla(datosDesenvueltos);
          debugLog('[SECCION14] ✅ Tasa analfabetismo cargada:', datosTransformados);

          if (datosTransformados.length > 0) {
            const tablaKey = `tasaAnalfabetismoTabla${prefijo}`;
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            this.projectFacade.setField(this.seccionId, null, 'tasaAnalfabetismoTabla', datosTransformados);
            this.cdRef.markForCheck();
          }
        } catch (e) {
          debugLog('[SECCION14] ❌ Error transformando tasa analfabetismo:', e);
        }
      },
      error: (err: any) => {
        debugLog('[SECCION14] ❌ Error cargando tasa analfabetismo:', err);
      }
    });
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  public obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  public override obtenerPrefijoGrupo(): string {
    return this.obtenerPrefijo();
  }

  getFieldIdIndicadoresEducacionIntro(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion14_indicadores_educacion_intro${prefijo}` : 'parrafoSeccion14_indicadores_educacion_intro';
  }

  getFieldIdNivelEducativo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoNivelEducativo${prefijo}` : 'textoNivelEducativo';
  }

  getFieldIdTasaAnalfabetismo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoTasaAnalfabetismo${prefijo}` : 'textoTasaAnalfabetismo';
  }

  getNivelEducativoConPorcentajes(): any[] {
    const tabla = this.nivelEducativoTablaSignal();
    if (!tabla || tabla.length === 0) return [];
    // Los datos ya vienen con porcentajes del backend
    return tabla;
  }

  getTasaAnalfabetismoConPorcentajes(): any[] {
    const tabla = this.tasaAnalfabetismoTablaSignal();
    if (!tabla || tabla.length === 0) return [];
    // Los datos ya vienen con porcentajes del backend
    return tabla;
  }

  onNivelEducativoTableUpdated(updatedData?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `nivelEducativoTabla${prefijo}`;
    // Priorizar los datos emitidos por el dynamic-table para evitar race conditions
    const datos = (updatedData && updatedData.length > 0) ? updatedData : (this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || []);
    this.datos[tablaKey] = datos;

    const formChange = this.injector.get(FormChangeService);
    formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { updateState: true, notifySync: true });

    // Leer inmediatamente desde el store para validar que el cambio quedó
    const tablaPersistida = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || [];

    // Alineado con Sección 13: actualizar this.datos con la tabla persistida para evitar inconsistencias
    this.datos[tablaKey] = tablaPersistida;

    this.cdRef.detectChanges();
  }

  onTasaAnalfabetismoTableUpdated(updatedData?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = `tasaAnalfabetismoTabla${prefijo}`;
    // Priorizar los datos emitidos por el dynamic-table para evitar race conditions
    const datos = (updatedData && updatedData.length > 0) ? updatedData : (this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || []);
    this.datos[tablaKey] = datos;

    const formChange = this.injector.get(FormChangeService);
    formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datos }, { updateState: true, notifySync: true });

    const tablaPersistida = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || [];

    // Alineado con Sección 13: actualizar this.datos con la tabla persistida para evitar inconsistencias
    this.datos[tablaKey] = tablaPersistida;

    this.cdRef.detectChanges();
  }

  public override obtenerNombreComunidadActual(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // ✅ PASO 1: Usar aisdGroups() signal para obtener el nombre del grupo actual
    if (prefijo && prefijo.startsWith('_A')) {
      const match = prefijo.match(/_A(\d+)/);
      if (match) {
        const index = parseInt(match[1]) - 1; // _A1 → índice 0, _A2 → índice 1
        const grupos = this.aisdGroups();
        if (grupos && grupos[index]?.nombre) {
          return grupos[index].nombre; // ✅ RETORNA EL NOMBRE CORRECTO
        }
      }
    }
    
    // ✅ PASO 2: Fallback a datos guardados
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    if (grupoAISD && grupoAISD.trim() !== '') {
      return grupoAISD;
    }
    
    const grupoConSufijo = prefijo ? this.datos[`grupoAISD${prefijo}`] : null;
    if (grupoConSufijo && grupoConSufijo.trim() !== '') {
      return grupoConSufijo;
    }
    
    // ✅ PASO 3: Fallback a comunidades campesinas
    if (this.datos.comunidadesCampesinas && Array.isArray(this.datos.comunidadesCampesinas) && this.datos.comunidadesCampesinas.length > 0) {
      const primerCC = this.datos.comunidadesCampesinas[0];
      if (primerCC && primerCC.nombre && primerCC.nombre.trim() !== '') {
        return primerCC.nombre;
      }
    }
    
    return '____'; // Placeholder como último recurso
  }

  getPorcentajePrimaria(): string {
    const tabla = this.getNivelEducativoConPorcentajes();
    const item = tabla.find((i: any) => i.categoria?.toLowerCase().includes('primaria'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getPorcentajeSecundaria(): string {
    const tabla = this.getNivelEducativoConPorcentajes();
    const item = tabla.find((i: any) => i.categoria?.toLowerCase().includes('secundaria'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getPorcentajeSuperiorNoUniversitaria(): string {
    const tabla = this.getNivelEducativoConPorcentajes();
    const item = tabla.find((i: any) => i.categoria?.toLowerCase().includes('superior no universitaria'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getTasaAnalfabetismo(): string {
    const tabla = this.getTasaAnalfabetismoConPorcentajes();
    const item = tabla.find((i: any) => i.indicador?.toLowerCase().includes('no sabe'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getCasosAnalfabetismo(): string {
    const tabla = this.getTasaAnalfabetismoConPorcentajes();
    const item = tabla.find((i: any) => i.indicador?.toLowerCase().includes('no sabe'));
    return item?.casos ? String(item.casos) : '____';
  }

  override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
    const prefijo = this.obtenerPrefijo();
    const campoConPrefijo = prefijo ? `${fieldId}${prefijo}` : fieldId;
    super.onFieldChange(campoConPrefijo, value, options);
  }

  override onFotografiasChange(fotografias: FotoItem[]): void {
    super.onFotografiasChange(fotografias);
    this.fotografiasSeccion14 = fotografias;
    this.cdRef.markForCheck();
  }
}