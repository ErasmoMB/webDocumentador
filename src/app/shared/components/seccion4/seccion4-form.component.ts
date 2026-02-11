import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, OnInit, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { CCPPEntry, GroupDefinition } from 'src/app/core/state/project-state.model';
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
      
      // Calcular totales inline
      const tablaAISD2Array = Array.isArray(tablaAISD2) ? tablaAISD2 : [];
      const totales = {
        poblacion: tablaAISD2Array.map(f => Number(f['poblacion']) || 0).reduce((a, b) => a + b, 0),
        empadronadas: tablaAISD2Array.map(f => Number(f['viviendasEmpadronadas']) || 0).reduce((a, b) => a + b, 0),
        ocupadas: tablaAISD2Array.map(f => Number(f['viviendasOcupadas']) || 0).reduce((a, b) => a + b, 0)
      };
      
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
          introduccionText: this.obtenerTextoIntroduccionAISD(data, nombreComunidad),
          comunidadText: this.obtenerTextoComunidadCompleto(data, nombreComunidad),
          caracterizacionText: this.obtenerTextoCaracterizacionIndicadores(data, nombreComunidad)
        },
        tables: {
          tablaAISD1: Array.isArray(tablaAISD1) ? tablaAISD1 : [],
          tablaAISD2: Array.isArray(tablaAISD2) ? tablaAISD2 : []
        },
        calculations: {
          totalesAISD2: totales
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
          const filaA1 = [{
            localidad: capital,
            coordenadas: this.datos.coordenadasAISD || this.datos['tablaAISD1Coordenadas'] || '____',
            altitud: this.datos.altitudAISD || this.datos['tablaAISD1Altitud'] || '____',
            distrito: this.datos.distritoSeleccionado || this.datos['tablaAISD1Fila1Distrito'] || '____',
            provincia: this.datos.provinciaSeleccionada || this.datos['tablaAISD1Fila1Provincia'] || '____',
            departamento: filaCapital?.departamento || this.datos.departamentoSeleccionado || this.datos['tablaAISD1Fila1Departamento'] || '____'
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
      codigosComunidad = [];
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
      const capital = nombreComunidad;
      tablaA1Actual = [{
        localidad: capital,
        coordenadas: this.datos['coordenadasAISD'] || '____',
        altitud: this.datos['altitudAISD'] || '____',
        distrito: this.datos['distritoSeleccionado'] || '____',
        provincia: this.datos['provinciaSeleccionada'] || '____',
        departamento: this.datos['departamentoSeleccionado'] || '____'
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
    
    // Calcular totales inline
    const tablaA2Array = Array.isArray(tablaA2Actual) ? tablaA2Actual : [];
    const totals = {
      poblacion: tablaA2Array.map(f => Number(f['poblacion']) || 0).reduce((a, b) => a + b, 0),
      empadronadas: tablaA2Array.map(f => Number(f['viviendasEmpadronadas']) || 0).reduce((a, b) => a + b, 0),
      ocupadas: tablaA2Array.map(f => Number(f['viviendasOcupadas']) || 0).reduce((a, b) => a + b, 0)
    };
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

  // ✅ MÉTODOS INLINE DE TEXTO (sin servicios)
  private obtenerCampoConPrefijo(datos: any, campoBase: string): string {
    return PrefijoHelper.obtenerValorConPrefijo(datos, campoBase, this.seccionId) || datos[campoBase] || '';
  }

  obtenerTextoIntroduccionAISD(datos: any, nombreComunidad: string): string {
    const textoPersonalizado = this.obtenerCampoConPrefijo(datos, 'parrafoSeccion4_introduccion_aisd');
    
    const textoPorDefecto = `Se ha determinado como Área de Influencia Social Directa (AISD) a la CC ${nombreComunidad}. Esta delimitación se justifica en los criterios de propiedad de terreno superficial, además de la posible ocurrencia de impactos directos como la contratación de mano de obra local, adquisición de bienes y servicios, así como logística. En los siguientes apartados se desarrolla la caracterización socioeconómica y cultural de la comunidad delimitada como parte del AISD.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado.replace(/CC\s*___/g, `CC ${nombreComunidad}`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoComunidadCompleto(datos: any, nombreComunidad: string): string {
    const textoPersonalizado = this.obtenerCampoConPrefijo(datos, 'parrafoSeccion4_comunidad_completo');
    
    const distrito = datos['distritoSeleccionado'] || '____';
    const provincia = datos['provinciaSeleccionada'] || '____';
    const aisd1 = datos['aisdComponente1'] || '____';
    const aisd2 = datos['aisdComponente2'] || '____';
    const departamento = datos['departamentoSeleccionado'] || '____';
    const grupoAISI = datos['grupoAISI'] || datos['distritoSeleccionado'] || '____';
    
    const textoPorDefecto = `La CC ${nombreComunidad} se encuentra ubicada predominantemente dentro del distrito de ${distrito}, provincia de ${provincia}; no obstante, sus límites comunales abarcan pequeñas áreas de los distritos de ${aisd1} y de ${aisd2}, del departamento de ${departamento}. Esta comunidad se caracteriza por su historia y tradiciones que se mantienen vivas a lo largo de los años. Se encuentra compuesta por el anexo ${nombreComunidad}, el cual es el centro administrativo comunal, además de los sectores agropecuarios de Yuracranra, Tastanic y Faldahuasi. Ello se pudo validar durante el trabajo de campo, así como mediante la Base de Datos de Pueblos Indígenas u Originarios (BDPI). Sin embargo, en la actualidad, estos sectores agropecuarios no cuentan con población permanente y la mayor parte de los comuneros se concentran en el anexo ${nombreComunidad}.\n\nEn cuanto al nombre "${nombreComunidad}", según los entrevistados, este proviene de una hierba que se empleaba para elaborar moldes artesanales para queso; no obstante, ya no se viene utilizando en el presente y es una práctica que ha ido reduciéndose paulatinamente. Por otro lado, cabe mencionar que la comunidad se halla al este de la CC Sondor, al norte del CP ${grupoAISI} y al oeste del anexo Nauquipa.\n\nAsimismo, la CC ${nombreComunidad} es reconocida por el Ministerio de Cultura como parte de los pueblos indígenas u originarios, específicamente como parte del pueblo quechua. Esta identidad es un pilar fundamental de la comunidad, influyendo en sus prácticas agrícolas, celebraciones y organización social. La oficialización de la comunidad por parte del Estado peruano se remonta al 24 de agosto de 1987, cuando fue reconocida mediante RD N°495 – 87 – MAG – DR – VIII – A. Este reconocimiento formalizó la existencia y los derechos de la comunidad, fortaleciendo su posición y legitimidad dentro del marco legal peruano. Posteriormente, las tierras de la comunidad fueron tituladas el 28 de marzo de 1996, conforme consta en la Ficha 90000300, según la BDPI. Esta titulación ha sido crucial para la protección y manejo de sus recursos naturales, permitiendo a la comunidad planificar y desarrollar proyectos que beneficien a todos sus comuneros. La administración de estas tierras ha sido un factor clave en la preservación de su cultura y en el desarrollo sostenible de la comunidad.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado
        .replace(/CC\s*___/g, `CC ${nombreComunidad}`)
        .replace(/distrito de\s*___/g, `distrito de ${distrito}`)
        .replace(/provincia de\s*___/g, `provincia de ${provincia}`)
        .replace(/distritos de\s*___\s*y de/g, `distritos de ${aisd1} y de`)
        .replace(/y de\s*___\s*del departamento/g, `y de ${aisd2} del departamento`)
        .replace(/departamento de\s*___/g, `departamento de ${departamento}`)
        .replace(/CP\s*___/g, `CP ${grupoAISI}`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoCaracterizacionIndicadores(datos: any, nombreComunidad: string): string {
    const textoPersonalizado = this.obtenerCampoConPrefijo(datos, 'parrafoSeccion4_caracterizacion_indicadores');
    
    const textoPorDefecto = `Para la caracterización de los indicadores demográficos y aquellos relacionados a viviendas, se emplea la sumatoria de casos obtenida al considerar aquellos puntos de población que conforman la CC ${nombreComunidad}. En el siguiente cuadro, se presenta aquellos puntos de población identificados por el INEI que se encuentran dentro de la comunidad en cuestión.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado.replace(/CC\s*___/g, `CC ${nombreComunidad}`);
    }
    
    return textoPorDefecto;
  }
}

