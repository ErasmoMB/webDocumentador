import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, OnInit, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { CCPPEntry, GroupDefinition } from 'src/app/core/state/project-state.model';
import { Seccion4TextGeneratorService } from 'src/app/core/services/domain/seccion4-text-generator.service';
import { Seccion4DataService } from 'src/app/core/services/domain/seccion4-data.service';
import { Seccion4TableConfigService } from 'src/app/core/services/domain/seccion4-table-config.service';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { SECCION4_WATCHED_FIELDS, SECCION4_PHOTO_PREFIXES } from './seccion4-constants';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, ImageUploadComponent],
  selector: 'app-seccion4-form',
  templateUrl: './seccion4-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion4FormComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1';
  @Input() override modoFormulario: boolean = true;

  readonly PHOTO_PREFIX_UBICACION = SECCION4_PHOTO_PREFIXES.UBICACION;
  readonly PHOTO_PREFIX_POBLACION = SECCION4_PHOTO_PREFIXES.POBLACION;
  override readonly PHOTO_PREFIX = '';

  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION4_WATCHED_FIELDS;

  private autoLlenarTablasExecuted = false;
  private isProcessingPipeline = false;

  readonly formDataSignal: Signal<Record<string, any>>;
  readonly tablaAISD1Signal: Signal<any[]>;
  readonly tablaAISD2Signal: Signal<any[]>;
  readonly photoFieldsHash: Signal<string>;
  readonly viewModel: Signal<any>;

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private textGen: Seccion4TextGeneratorService,
    private dataSrv: Seccion4DataService,
    public tableCfg: Seccion4TableConfigService,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);

    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX_UBICACION, label: 'Ubicación' },
      { prefix: this.PHOTO_PREFIX_POBLACION, label: 'Población' }
    ];

    this.formDataSignal = computed(() => {
      const sectionData = this.projectFacade.selectSectionFields(this.seccionId, null)();
      const seccion2Data = this.projectFacade.selectSectionFields('3.1.2', null)();
      return { ...sectionData, comunidadesCampesinas: seccion2Data['comunidadesCampesinas'] || sectionData['comunidadesCampesinas'] };
    });

    this.tablaAISD1Signal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const keyA1 = `tablaAISD1Datos${prefijo}`;
      const conPrefijo = this.projectFacade.selectField(this.seccionId, null, keyA1)();
      return Array.isArray(conPrefijo) && conPrefijo.length > 0 ? conPrefijo : [];
    });

    this.tablaAISD2Signal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const keyA2 = `tablaAISD2Datos${prefijo}`;
      const conPrefijo = this.projectFacade.selectField(this.seccionId, null, keyA2)();
      return Array.isArray(conPrefijo) && conPrefijo.length > 0 ? conPrefijo : [];
    });

    this.photoFieldsHash = computed(() => {
      let hash = '';
      const prefijo = this.obtenerPrefijoGrupo();
      for (const basePrefix of [this.PHOTO_PREFIX_UBICACION, this.PHOTO_PREFIX_POBLACION]) {
        const prefix = basePrefix + prefijo;
        for (let i = 1; i <= 10; i++) {
          const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
          const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
          const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
          hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
        }
      }
      return hash;
    });

    this.viewModel = computed(() => {
      const sectionData = this.formDataSignal();
      const data = sectionData;
      const nombreComunidad = this.obtenerNombreComunidadActual();
      const tablaAISD1 = this.tablaAISD1Signal();
      const tablaAISD2 = this.tablaAISD2Signal();
      const totales = this.dataSrv.calcularTotalesAISD2(Array.isArray(tablaAISD2) ? tablaAISD2 : []);
      
      return {
        nombreComunidad,
        data: {
          ...data,
          comunidadesCampesinas: sectionData['comunidadesCampesinas'] ?? [],
          cuadroTituloAISD1: data['cuadroTituloAISD1' + this.obtenerPrefijoGrupo()] ?? '',
          tablaAISD1Datos: tablaAISD1,
          tablaAISD2Datos: tablaAISD2
        },
        texts: {
          introduccionText: this.textGen.obtenerTextoIntroduccionAISD(data, nombreComunidad, this.seccionId),
          comunidadText: this.textGen.obtenerTextoComunidadCompleto(data, nombreComunidad, this.seccionId),
          caracterizacionText: this.textGen.obtenerTextoCaracterizacionIndicadores(data, nombreComunidad, this.seccionId)
        },
        tables: {
          tablaAISD1: Array.isArray(tablaAISD1) ? tablaAISD1 : [],
          tablaAISD2: Array.isArray(tablaAISD2) ? tablaAISD2 : []
        },
        calculations: {
          totalesAISD2: {
            poblacion: totales.poblacion,
            empadronadas: totales.empadronadas,
            ocupadas: totales.ocupadas
          }
        },
        sources: {
          tablaAISD1Source: data['cuadroFuenteAISD1' + this.obtenerPrefijoGrupo()] ?? '',
          tablaAISD2Source: data['cuadroFuenteAISD2' + this.obtenerPrefijoGrupo()] ?? ''
        }
      };
    });

    effect(() => {
      const sectionData = this.formDataSignal();
      const legacyData = this.projectFacade.obtenerDatos();
      this.datos = { ...legacyData, ...sectionData };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });

    effect(() => {
      if (this.autoLlenarTablasExecuted) return;
      const tablaA1 = this.tablaAISD1Signal();
      const tablaA2 = this.tablaAISD2Signal();
      const datos = this.datos;
      const tieneDatosCompletos = datos && Object.keys(datos).length > 0;
      
      if (tieneDatosCompletos && this.modoFormulario === false) {
        this.autoLlenarTablasExecuted = true;
        setTimeout(() => {
          this.autoLlenarTablas();
        }, 0);
      }
    }, { allowSignalWrites: true });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.cargarFotografias();
    this.autoLlenarTablas();
    
    if (this.modoFormulario) {
      this.initDataPipeline();
    }
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

  private autoLlenarTablas(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const dataKeyA1 = `tablaAISD1Datos${prefijo}`;
    const dataKeyA2 = `tablaAISD2Datos${prefijo}`;
    
    if (!prefijo || !prefijo.startsWith('_A')) return;
    
    const gruposAISD = this.aisdGroups();
    const centrosPoblados = this.allPopulatedCenters();
    
    const match = prefijo.match(/_A(\d+)/);
    const index = match ? parseInt(match[1]) - 1 : -1;
    const grupoActual = index >= 0 && index < gruposAISD.length ? gruposAISD[index] : null;
    
    // Tabla A1
    const tablaA1Actual = this.datos[dataKeyA1] || [];
    const estaVaciaA1 = !tablaA1Actual || tablaA1Actual.length === 0;
    const estaInvalidaA1 = tablaA1Actual.length === 1 && (!tablaA1Actual[0].localidad || tablaA1Actual[0].localidad === '____');
    
    if (estaVaciaA1 || estaInvalidaA1) {
      const tablaA1Mock = this.datos['tablaAISD1Datos'];
      if (tablaA1Mock && tablaA1Mock.length > 0 && tablaA1Mock[0].localidad && tablaA1Mock[0].localidad !== '____') {
        this.onFieldChange(dataKeyA1 as any, tablaA1Mock, { refresh: false });
        this.datos[dataKeyA1] = tablaA1Mock;
      } else {
        const tablaA2Actual = this.datos[dataKeyA2] || this.datos['tablaAISD2Datos'] || [];
        let filaCapital = tablaA2Actual.find((f: any) => f.poblacion && parseInt(f.poblacion) > 0);
        if (!filaCapital && tablaA2Actual.length > 0) filaCapital = tablaA2Actual[0];
        
        if (filaCapital) {
          const capital = filaCapital.punto || filaCapital.nombre || '____';
          const datosCap = this.dataSrv.buscarDatosCentro(this.datos, capital);
          const filaA1 = [{
            localidad: capital,
            coordenadas: datosCap?.coordenadas || this.datos.coordenadasAISD || this.datos['tablaAISD1Coordenadas'] || '____',
            altitud: datosCap?.altitud || this.datos.altitudAISD || this.datos['tablaAISD1Altitud'] || '____',
            distrito: datosCap?.distrito || this.datos.distritoSeleccionado || this.datos['tablaAISD1Fila1Distrito'] || '____',
            provincia: datosCap?.provincia || this.datos.provinciaSeleccionada || this.datos['tablaAISD1Fila1Provincia'] || '____',
            departamento: datosCap?.departamento || this.datos.departamentoSeleccionado || this.datos['tablaAISD1Fila1Departamento'] || '____'
          }];
          this.onFieldChange(dataKeyA1 as any, filaA1, { refresh: false });
          this.datos[dataKeyA1] = filaA1;
        }
      }
    }

    // Tabla A2
    let codigosComunidad: string[] = [];
    if (grupoActual && grupoActual.ccppIds && grupoActual.ccppIds.length > 0) {
      codigosComunidad = grupoActual.ccppIds as string[];
    } else {
      codigosComunidad = this.dataSrv.obtenerCodigosPorPrefijo(this.datos, this.seccionId);
    }
    
    const tablaA2Actual = this.datos[dataKeyA2] || [];
    const estaVaciaA2 = !tablaA2Actual || tablaA2Actual.length === 0;
    
    if (estaVaciaA2) {
      if (codigosComunidad.length > 0 && centrosPoblados.length > 0) {
        const filas = codigosComunidad.map(codigo => {
          const ccpp = centrosPoblados.find(c => c.id === codigo || c.codigo === codigo);
          return {
            punto: ccpp?.nombre || codigo,
            codigo: codigo,
            poblacion: ccpp?.poblacion?.toString() || '0',
            viviendasEmpadronadas: '0',
            viviendasOcupadas: '0'
          };
        });
        if (filas.length > 0) {
          this.onFieldChange(dataKeyA2 as any, filas, { refresh: false });
          this.datos[dataKeyA2] = filas;
        }
      } else {
        const tablaA2Mock = this.datos['tablaAISD2Datos'];
        if (tablaA2Mock && tablaA2Mock.length > 0) {
          this.onFieldChange(dataKeyA2 as any, tablaA2Mock, { refresh: false });
          this.datos[dataKeyA2] = tablaA2Mock;
        } else {
          const puntosPoblacionMock = this.datos['puntosPoblacion'];
          if (puntosPoblacionMock && puntosPoblacionMock.length > 0) {
            const filas = puntosPoblacionMock.map((cp: any) => ({
              punto: cp.nombre || cp.punto || '____',
              codigo: (cp.codigo || '').toString(),
              poblacion: (cp.poblacion || '0').toString(),
              viviendasEmpadronadas: (cp.viviendasEmpadronadas || '0').toString(),
              viviendasOcupadas: (cp.viviendasOcupadas || '0').toString()
            }));
            this.onFieldChange(dataKeyA2 as any, filas, { refresh: false });
            this.datos[dataKeyA2] = filas;
          }
        }
      }
    }

    this.actualizarDatos();
    this.cdRef.markForCheck();
  }

  onTablaUpdated(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const keyA1 = prefijo ? `tablaAISD1Datos${prefijo}` : 'tablaAISD1Datos';
    const keyA2 = prefijo ? `tablaAISD2Datos${prefijo}` : 'tablaAISD2Datos';
    
    let tablaA1Actual = this.tablaAISD1Signal();
    const tablaA2Actual = this.tablaAISD2Signal();
    
    if (!tablaA1Actual || tablaA1Actual.length === 0) {
      const nombreComunidad = this.obtenerNombreComunidadActual();
      const capital = this.dataSrv.obtenerCapitalComunidad(this.datos, this.seccionId) || nombreComunidad;
      const datosCap = this.dataSrv.buscarDatosCentro(this.datos, capital);
      tablaA1Actual = [{
        localidad: capital,
        coordenadas: datosCap?.coordenadas || this.datos.coordenadasAISD || '____',
        altitud: datosCap?.altitud || this.datos.altitudAISD || '____',
        distrito: datosCap?.distrito || this.datos.distritoSeleccionado || '____',
        provincia: datosCap?.provincia || this.datos.provinciaSeleccionada || '____',
        departamento: datosCap?.departamento || this.datos.departamentoSeleccionado || '____'
      }];
    }
    
    const payload: Record<string, any> = {};
    if (tablaA1Actual && tablaA1Actual.length > 0) {
      payload[keyA1] = tablaA1Actual.map((r: any) => (typeof r === 'object' && r != null ? { ...r } : r));
    }
    if (tablaA2Actual && tablaA2Actual.length > 0) {
      payload[keyA2] = tablaA2Actual.map((r: any) => (typeof r === 'object' && r != null ? { ...r } : r));
    }
    
    if (Object.keys(payload).length > 0) {
      this.projectFacade.setFields(this.seccionId, null, payload);
    }
    
    const totals = this.dataSrv.calcularTotalesAISD2(tablaA2Actual || []);
    this.onFieldChange(`tablaAISD2TotalPoblacion${prefijo}`, totals.poblacion, { refresh: false });
    this.onFieldChange(`tablaAISD2TotalViviendasEmpadronadas${prefijo}`, totals.empadronadas, { refresh: false });
    this.onFieldChange(`tablaAISD2TotalViviendasOcupadas${prefijo}`, totals.ocupadas, { refresh: false });
    
    this.actualizarDatos();
    this.cdRef.markForCheck();
  }

  protected override cargarFotografias(): void {
    if (this.photoGroupsConfig.length > 0) {
      this.cargarTodosLosGrupos();
      this.cdRef.markForCheck();
    } else {
      super.cargarFotografias();
    }
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {}

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
