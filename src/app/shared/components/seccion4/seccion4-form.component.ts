import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy, Injector, Signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { Seccion4TableConfigService } from 'src/app/core/services/domain/seccion4-table-config.service';
import { Seccion4DataService } from 'src/app/core/services/domain/seccion4-data.service';
import { Seccion4TextGeneratorService } from 'src/app/core/services/domain/seccion4-text-generator.service';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion4-form',
    templateUrl: './seccion4-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion4FormComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1';
  
  readonly PHOTO_PREFIX_UBICACION = 'fotografiaUbicacionReferencial';
  readonly PHOTO_PREFIX_POBLACION = 'fotografiaPoblacionViviendas';

  override useReactiveSync = true;

  override watchedFields: string[] = [
    'tablaAISD1Datos', 'tablaAISD2Datos',
    'tablaAISD1Datos_A1', 'tablaAISD2Datos_A1',
    'tablaAISD1Datos_A2', 'tablaAISD2Datos_A2',
    'parrafoSeccion4_introduccion_aisd', 'parrafoSeccion4_comunidad_completo',
    'parrafoSeccion4_caracterizacion_indicadores'
  ];

  readonly formDataSignal: Signal<Record<string, any>>;

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private formChange: FormChangeService,
    public tableCfg: Seccion4TableConfigService,
    private dataSrv: Seccion4DataService,
    private textGen: Seccion4TextGeneratorService
  ) {
    super(cdRef, injector);
    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX_UBICACION, label: 'Ubicación' },
      { prefix: this.PHOTO_PREFIX_POBLACION, label: 'Población' }
    ];
    this.formDataSignal = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());
    effect(() => {
      const sectionData = this.formDataSignal();
      const legacyData = this.projectFacade.obtenerDatos();
      this.datos = { ...legacyData, ...sectionData };
      this.cdRef.markForCheck();
    });
  }

  private isProcessingPipeline = false;

  protected override onInitCustom(): void {
    this.initDataPipeline();
  }

  private initDataPipeline(): void {
    if (this.isProcessingPipeline) return;
    this.isProcessingPipeline = true;
    try {
      this.autoLlenarTablas();
      this.cargarTodosLosGrupos();
    } finally {
      this.isProcessingPipeline = false;
    }
  }

  /** Auto-llena las tablas AISD1 y AISD2 si están vacías o desincronizadas */
  private autoLlenarTablas(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const dataKeyA2 = `tablaAISD2Datos${prefijo}`;
    const dataKeyA1 = `tablaAISD1Datos${prefijo}`;
    
    if (!prefijo?.startsWith('_A')) return;

    const codigosComunidad = this.dataSrv.obtenerCodigosPorPrefijo(this.datos, this.seccionId);
    if (!codigosComunidad || codigosComunidad.length === 0) return;

    const tablaA2Actual = this.datos[dataKeyA2];
    const filasActuales = Array.isArray(tablaA2Actual) ? tablaA2Actual.length : 0;
    
    // ✅ Sincronizar solo si hay diferencia entre filas actuales y códigos seleccionados
    if (filasActuales === codigosComunidad.length && filasActuales > 0) return;

    const jsonCompleto = this.datos['jsonCompleto'];
    if (!jsonCompleto) return;

    const centrosPoblados = this.dataSrv.obtenerDatosCentrosPorCodigos(jsonCompleto, codigosComunidad);
    
    if (centrosPoblados.length > 0) {
      const filas = centrosPoblados.map(cp => ({
        punto: cp.CCPP || cp.ccpp || '____',
        nombre: cp.CCPP || cp.ccpp || '____',
        codigo: (cp.CODIGO || cp.codigo || '').toString(),
        poblacion: (cp.POBLACION || cp.poblacion || '0').toString(),
        viviendasEmpadronadas: '0', 
        viviendasOcupadas: '0'
      }));
      
      // ✅ SIEMPRE guardar con prefijo
      this.onFieldChange(dataKeyA2 as any, filas, { refresh: false });

      // Llenar tabla A1 (Capital) - también con prefijo
      const actualA1 = this.datos[dataKeyA1] || [];
      if (actualA1.length === 0 || (actualA1.length === 1 && !actualA1[0].localidad)) {
        const nombreComunidad = this.obtenerNombreComunidad();
        const capital = this.dataSrv.obtenerCapitalComunidad(this.datos, this.seccionId) || nombreComunidad;
        const datosCap = this.dataSrv.buscarDatosCentro(this.datos, capital);
        const filaA1 = [{
          localidad: capital,
          coordenadas: datosCap?.coordenadas || this.datos.coordenadasAISD || '____',
          altitud: datosCap?.altitud || this.datos.altitudAISD || '____',
          distrito: datosCap?.distrito || this.datos.distritoSeleccionado || '____',
          provincia: datosCap?.provincia || this.datos.provinciaSeleccionada || '____',
          departamento: datosCap?.departamento || this.datos.departamentoSeleccionado || '____'
        }];
        this.onFieldChange(dataKeyA1 as any, filaA1, { refresh: false });
      }

      this.actualizarDatos(); // Forzar actualización local
    }
  }

  onTablaUpdated(): void {
    setTimeout(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const keyA1 = prefijo ? `tablaAISD1Datos${prefijo}` : 'tablaAISD1Datos';
      const keyA2 = prefijo ? `tablaAISD2Datos${prefijo}` : 'tablaAISD2Datos';
      const payload: Record<string, any> = {};
      if (this.datos[keyA1] !== undefined) {
        payload[keyA1] = Array.isArray(this.datos[keyA1])
          ? this.datos[keyA1].map((r: any) => (typeof r === 'object' && r != null ? { ...r } : r))
          : this.datos[keyA1];
      }
      if (this.datos[keyA2] !== undefined) {
        payload[keyA2] = Array.isArray(this.datos[keyA2])
          ? this.datos[keyA2].map((r: any) => (typeof r === 'object' && r != null ? { ...r } : r))
          : this.datos[keyA2];
      }
      if (Object.keys(payload).length > 0) {
        this.projectFacade.setFields(this.seccionId, null, payload);
        this.formChange.persistFields(this.seccionId, 'form', payload);
      }
      this.actualizarDatos();
      const raw = this.obtenerValorConPrefijo('tablaAISD2Datos') || [];
      const totals = this.dataSrv.calcularTotalesAISD2(raw);
      this.onFieldChange(`tablaAISD2TotalPoblacion${prefijo}`, totals.poblacion);
      this.onFieldChange(`tablaAISD2TotalViviendasEmpadronadas${prefijo}`, totals.empadronadas);
      this.onFieldChange(`tablaAISD2TotalViviendasOcupadas${prefijo}`, totals.ocupadas);
      this.cdRef.markForCheck();
    }, 0);
  }

  obtenerNombreComunidad(): string {
    return this.dataSrv.obtenerNombreComunidadActual(this.datos, this.seccionId);
  }

  /** Mismo texto que muestra la vista (personalizado o por defecto) para sincronizar formulario ↔ vista */
  getTextoIntroduccionEfectivo(): string {
    return this.textGen.obtenerTextoIntroduccionAISD(this.datos, this.obtenerNombreComunidad());
  }

  /** Mismo texto que muestra la vista (personalizado o por defecto) */
  getTextoComunidadEfectivo(): string {
    return this.textGen.obtenerTextoComunidadCompleto(this.datos, this.obtenerNombreComunidad());
  }

  /** Mismo texto que muestra la vista (personalizado o por defecto) */
  getTextoCaracterizacionEfectivo(): string {
    return this.textGen.obtenerTextoCaracterizacionIndicadores(this.datos, this.obtenerNombreComunidad());
  }

  protected override detectarCambios(): boolean {
    const actual = JSON.stringify(this.projectFacade.obtenerDatos());
    const anterior = JSON.stringify(this.datosAnteriores);
    if (actual !== anterior) {
      this.datosAnteriores = JSON.parse(actual);
      return true;
    }
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    if (prefijo) {
      this.datos.grupoAISD = this.obtenerValorConPrefijo('grupoAISD');
      this.datos.tablaAISD1Datos = this.obtenerValorConPrefijo('tablaAISD1Datos');
      this.datos.tablaAISD2Datos = this.obtenerValorConPrefijo('tablaAISD2Datos');
    }
  }
}
