import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy, Injector } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { Seccion4TableConfigService } from 'src/app/core/services/domain/seccion4-table-config.service';
import { Seccion4DataService } from 'src/app/core/services/domain/seccion4-data.service';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion4-form',
    templateUrl: './seccion4-form.component.html'
})
export class Seccion4FormComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1';
  
  readonly PHOTO_PREFIX_UBICACION = 'fotografiaUbicacionReferencial';
  readonly PHOTO_PREFIX_POBLACION = 'fotografiaPoblacionViviendas';

  override watchedFields: string[] = [
    'tablaAISD1Datos', 'tablaAISD2Datos',
    'tablaAISD1Datos_A1', 'tablaAISD2Datos_A1',
    'tablaAISD1Datos_A2', 'tablaAISD2Datos_A2',
    'parrafoSeccion4_introduccion_aisd', 'parrafoSeccion4_comunidad_completo',
    'parrafoSeccion4_caracterizacion_indicadores'
  ];

  private stateSubscription?: Subscription;

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    public tableCfg: Seccion4TableConfigService,
    private dataSrv: Seccion4DataService,
    private stateAdapter: ReactiveStateAdapter
  ) {
    super(cdRef, injector);
    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX_UBICACION, label: 'Ubicación' },
      { prefix: this.PHOTO_PREFIX_POBLACION, label: 'Población' }
    ];
  }

  private isProcessingPipeline = false;

  protected override onInitCustom(): void {
    this.initDataPipeline();
  }

  private initDataPipeline(): void {
    if (this.isProcessingPipeline) return;
    this.isProcessingPipeline = true;
    try {
      this.llenarTablaAutomaticamenteSiNecesario();
      this.cargarTodosLosGrupos();
    } finally {
      this.isProcessingPipeline = false;
    }
  }

  private llenarTablaAutomaticamenteSiNecesario(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const flagKey = `tablaAISD2DatosLlena${prefijo}`;
    const dataKey = `tablaAISD2Datos${prefijo}`;
    
    if (!prefijo?.startsWith('_A') || this.datos[flagKey]) return;

    const codigosComunidad = this.dataSrv.obtenerCodigosPorPrefijo(this.datos, this.seccionId);
    if (!codigosComunidad || codigosComunidad.length === 0) return;

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
      
      this.onFieldChange(dataKey as any, filas, { refresh: false });
      this.onFieldChange(flagKey as any, true, { refresh: false });
      
      // ✅ Llenar también Tabla A1 si está vacía
      const dataKeyA1 = `tablaAISD1Datos${prefijo}`;
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
    this.actualizarDatos();
    const raw = this.obtenerValorConPrefijo('tablaAISD2Datos') || [];
    const totals = this.dataSrv.calcularTotalesAISD2(raw);
    const prefijo = this.obtenerPrefijoGrupo();
    
    this.onFieldChange(`tablaAISD2TotalPoblacion${prefijo}`, totals.poblacion);
    this.onFieldChange(`tablaAISD2TotalViviendasEmpadronadas${prefijo}`, totals.empadronadas);
    this.onFieldChange(`tablaAISD2TotalViviendasOcupadas${prefijo}`, totals.ocupadas);
  }

  obtenerNombreComunidad(): string {
    return this.dataSrv.obtenerNombreComunidadActual(this.datos, this.seccionId);
  }

  // Métodos obligatorios de BaseSectionComponent con lógica de detección real
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
