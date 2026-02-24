import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, OnInit, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { CCPPEntry, GroupDefinition } from 'src/app/core/state/project-state.model';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { SECCION4_WATCHED_FIELDS, SECCION4_PHOTO_PREFIXES, SECCION4_TABLA_AISD1_CONFIG, SECCION4_TABLA_AISD2_CONFIG, SECCION4_COLUMNAS_AISD1, SECCION4_COLUMNAS_AISD2, SECCION4_TEMPLATES, SECCION4_CONFIG } from './seccion4-constants';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, ImageUploadComponent],
  selector: 'app-seccion4-form',
  templateUrl: './seccion4-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion4FormComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = SECCION4_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = true;

  // ✅ Hacer TEMPLATES accesible en template
  readonly SECCION4_TEMPLATES = SECCION4_TEMPLATES;

  readonly PHOTO_PREFIX_UBICACION = SECCION4_PHOTO_PREFIXES.UBICACION;
  readonly PHOTO_PREFIX_POBLACION = SECCION4_PHOTO_PREFIXES.POBLACION;
  override readonly PHOTO_PREFIX = '';

  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION4_WATCHED_FIELDS;

  // Constantes de tablas para usar en template
  readonly tablaAISD1Config = SECCION4_TABLA_AISD1_CONFIG;
  readonly tablaAISD2Config = SECCION4_TABLA_AISD2_CONFIG;
  readonly columnasAISD1 = SECCION4_COLUMNAS_AISD1;
  readonly columnasAISD2 = SECCION4_COLUMNAS_AISD2;

  private autoLlenarTablasExecuted = false;
  private isProcessingPipeline = false;
  private lastAutoFillKey: string | null = null;

  private getPrefixedFieldKey(baseField: string): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return `${baseField}${prefijo}`;
  }

  actualizarCampoPrefijado(baseField: string, value: any): void {
    this.onFieldChange(this.getPrefixedFieldKey(baseField), value, { refresh: false });
  }

  readonly formDataSignal: Signal<Record<string, any>>;
  readonly tablaAISD1Signal: Signal<any[]>;
  readonly tablaAISD2Signal: Signal<any[]>;
  readonly fotosCacheSignal: Signal<FotoItem[]>;
  readonly viewModel: Signal<any>;
  
  // ✅ NUMERACIÓN GLOBAL - Tablas
  readonly globalTableNumberSignalAISD1: Signal<string>;
  readonly globalTableNumberSignalAISD2: Signal<string>;
  
  // ✅ NUMERACIÓN GLOBAL - Fotos
  readonly photoNumbersSignal: Signal<string[]>;

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private globalNumbering: GlobalNumberingService,
    private formChange: FormChangeService
  ) {
    super(cdRef, injector);

    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX_UBICACION, label: SECCION4_TEMPLATES.labelFotografiasUbicacion },
      { prefix: this.PHOTO_PREFIX_POBLACION, label: SECCION4_TEMPLATES.labelFotografiasOblacion }
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
      if (Array.isArray(conPrefijo) && conPrefijo.length > 0) {
        return conPrefijo;
      }

      const sinPrefijo = this.projectFacade.selectField(this.seccionId, null, 'tablaAISD1Datos')();
      return Array.isArray(sinPrefijo) && sinPrefijo.length > 0 ? sinPrefijo : [];
    });

    this.tablaAISD2Signal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const keyA2 = `tablaAISD2Datos${prefijo}`;
      const conPrefijo = this.projectFacade.selectField(this.seccionId, null, keyA2)();
      if (Array.isArray(conPrefijo) && conPrefijo.length > 0) {
        return conPrefijo;
      }

      const sinPrefijo = this.projectFacade.selectField(this.seccionId, null, 'tablaAISD2Datos')();
      return Array.isArray(sinPrefijo) && sinPrefijo.length > 0 ? sinPrefijo : [];
    });

    // ✅ SIGNAL PARA FOTOGRAFÍAS - ÚNICA VERDAD (PATRÓN OBLIGATORIO)
    this.fotosCacheSignal = computed(() => {
      const fotos: FotoItem[] = [];
      const prefijo = this.obtenerPrefijoGrupo();
      
      for (const basePrefix of [this.PHOTO_PREFIX_UBICACION, this.PHOTO_PREFIX_POBLACION]) {
        for (let i = 1; i <= 10; i++) {
          // intentar versión con prefijo; si no hay imagen, hacer fallback a clave base
          let titulo = this.projectFacade.selectField(this.seccionId, null, `${basePrefix}${i}Titulo${prefijo}`)();
          let fuente = this.projectFacade.selectField(this.seccionId, null, `${basePrefix}${i}Fuente${prefijo}`)();
          let imagen = this.projectFacade.selectField(this.seccionId, null, `${basePrefix}${i}Imagen${prefijo}`)();

          if (!imagen && prefijo) {
            // no se encontró en clave con prefijo; revisar clave sin sufijo
            titulo = titulo || this.projectFacade.selectField(this.seccionId, null, `${basePrefix}${i}Titulo`)();
            fuente = fuente || this.projectFacade.selectField(this.seccionId, null, `${basePrefix}${i}Fuente`)();
            imagen = this.projectFacade.selectField(this.seccionId, null, `${basePrefix}${i}Imagen`)();
          }

          if (imagen) {
            fotos.push({
              titulo: titulo || `Fotografía ${i}`,
              fuente: fuente || 'GEADES, 2024',
              imagen: imagen
            } as FotoItem);
          }
        }
      }
      return fotos;
    });

    // ✅ NUMERACIÓN GLOBAL - Tablas AISD
    this.globalTableNumberSignalAISD1 = computed(() => {
      return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
    });

    this.globalTableNumberSignalAISD2 = computed(() => {
      return this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
    });

    // ✅ NUMERACIÓN GLOBAL - Fotos
    this.photoNumbersSignal = computed(() => {
      const prefix = `${this.PHOTO_PREFIX_UBICACION}${this.obtenerPrefijoGrupo()}`;
      const fotos = this.fotografiasCache || [];
      return fotos.map((_, index) => 
        this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index)
      );
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
        viviendasEmpadronadas: tablaAISD2Array.map(f => Number(f['viviendasEmpadronadas']) || 0).reduce((a, b) => a + b, 0),
        viviendasOcupadas: tablaAISD2Array.map(f => Number(f['viviendasOcupadas']) || 0).reduce((a, b) => a + b, 0)
      };
      
      return {
        nombreComunidad,
        data: {
          ...data,
          comunidadesCampesinas: sectionData['comunidadesCampesinas'] ?? [],
          cuadroTituloAISD1: data['cuadroTituloAISD1' + this.obtenerPrefijoGrupo()] ?? '',
          cuadroTituloAISD2: data['cuadroTituloAISD2' + this.obtenerPrefijoGrupo()] ?? '',
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
      this.fotosCacheSignal();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });

    // ✅ Effect para esperar a que grupos AISD y centros poblados estén disponibles
    effect(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const gruposAISD = this.aisdGroups();
      const centrosPoblados = this.allPopulatedCenters();

      // Solo aplica a AISD
      if (!prefijo || !prefijo.startsWith('_A')) return;
      // Solo ejecutar si hay grupos AISD y centros poblados cargados
      if (!gruposAISD || gruposAISD.length === 0) return;
      if (!centrosPoblados || centrosPoblados.length === 0) return;

      const match = prefijo.match(/_A(\d+)/);
      const index = match ? parseInt(match[1], 10) - 1 : -1;
      const grupoActual = index >= 0 && index < gruposAISD.length ? gruposAISD[index] : null;
      if (!grupoActual) return;

      // Key reactiva: si cambia el set de centros poblados del grupo, recalcular
      const ccppKey = (grupoActual.ccppIds || []).join('|');
      const autoFillKey = `${prefijo}::${ccppKey}`;
      if (this.lastAutoFillKey === autoFillKey) return;
      this.lastAutoFillKey = autoFillKey;

      // No bloquear por la bandera legacy: este fill debe responder a cambios en Sección 2
      setTimeout(() => {
        this.autoLlenarTablas();
      }, 0);
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

  /**
   * Verifica si una fila de tabla tiene datos válidos (no solo valores vacíos)
   */
  private filaTieneDatosValidos(fila: any): boolean {
    if (!fila || typeof fila !== 'object') return false;
    
    // Verificar si al menos el campo 'punto' tiene contenido
    const punto = fila.punto;
    if (punto && punto !== '' && punto !== '____') {
      return true;
    }
    
    // Verificar si algún campo de datos tiene contenido
    const camposConDatos = ['poblacion', 'viviendasEmpadronadas', 'viviendasOcupadas'];
    return camposConDatos.some(campo => {
      const valor = fila[campo];
      return valor !== undefined && valor !== '' && valor !== null && valor !== '____';
    });
  }

  /**
   * Verifica si una tabla tiene datos válidos (no solo filas vacías)
   */
  private tablaTieneDatosValidos(tabla: any[]): boolean {
    if (!Array.isArray(tabla) || tabla.length === 0) return false;
    return tabla.some(fila => this.filaTieneDatosValidos(fila));
  }

  /**
   * Formatea un número con espacios de miles
   * @param valor - Valor numérico o string a formatear
   * @returns String con espacios de miles (ej: 660619 → "660 619")
   */
  private formatMiles(valor: number | string | undefined | null): string {
    if (valor === undefined || valor === null || valor === '') return '';
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(num)) return '';
    return num.toLocaleString('es-PE');
  }

  /**
   * Formatea las coordenadas en el formato requerido
   * @param este - Coordenada Este
   * @param norte - Coordenada Norte
   * @returns String formateado con zona UTM
   */
  private formatCoordenadas(este: number | string | undefined | null, norte: number | string | undefined | null): string {
    const zonaUTM = '18L'; // Zona UTM para Perú
    const esteFormateado = this.formatMiles(este);
    const norteFormateado = this.formatMiles(norte);
    return `${zonaUTM}\nE:  ${esteFormateado} m\nN:  ${norteFormateado} m`;
  }

  /**
   * Formatea la altitud con su unidad
   * @param altitud - Valor de altitud
   * @returns String formateado (ej: 3599 → "3 599 msnm")
   */
  private formatAltitud(altitud: number | string | undefined | null): string {
    const altitudFormateada = this.formatMiles(altitud);
    return altitudFormateada ? `${altitudFormateada} msnm` : '';
  }

  private autoLlenarTablas(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const dataKeyA1 = `tablaAISD1Datos${prefijo}`;
    const dataKeyA2 = `tablaAISD2Datos${prefijo}`;
    
    console.group('🔍 [SECCION4] autoLlenarTablas');
    console.log(`seccionId: ${this.seccionId}`);
    console.log(`prefijo extraído: "${prefijo}"`);
    
    if (!prefijo || !prefijo.startsWith('_A')) {
      console.log('⚠️ Prefijo no válido (no empieza con _A)');
      console.groupEnd();
      return;
    }
    
    const gruposAISD = this.aisdGroups();
    const centrosPoblados = this.allPopulatedCenters();
    
    console.log(`Total grupos AISD: ${gruposAISD.length}`);
    console.log(`Total centros poblados: ${centrosPoblados.length}`);
    
    const match = prefijo.match(/_A(\d+)/);
    const index = match ? parseInt(match[1]) - 1 : -1;
    console.log(`Índice del grupo: ${index}`);
    
    const grupoActual = index >= 0 && index < gruposAISD.length ? gruposAISD[index] : null;
    console.log(`Grupo actual:`, grupoActual);
    
    if (!grupoActual) {
      console.log('⚠️ No se encontró el grupo actual');
      console.groupEnd();
      return;
    }
    
    console.log(`Grupo ID: ${grupoActual.id}`);
    console.log(`Grupo nombre: "${grupoActual.nombre}"`);
    console.log(`Grupo ccppIds: [${grupoActual.ccppIds.length}] ${grupoActual.ccppIds.join(', ')}`);
    
    // Filtrar los centros poblados del grupo actual
    const centrosDelGrupo = grupoActual && grupoActual.ccppIds && grupoActual.ccppIds.length > 0
      ? centrosPoblados.filter(cp => grupoActual.ccppIds.includes(String(cp.codigo)))
      : [];
    
    console.log(`Centros poblados en grupo: ${centrosDelGrupo.length}`);
    
    // === TABLA A1: Llenar con la CAPITAL o el de mayor población ===
    const tablaA1Actual = this.projectFacade.selectField(this.seccionId, null, dataKeyA1)();
    const estaVaciaA1 = !tablaA1Actual || tablaA1Actual.length === 0;
    const tieneDatosValidosA1 = this.tablaTieneDatosValidos(tablaA1Actual);
    
    console.log(`Tabla A1 actual:`, tablaA1Actual);
    console.log(`¿Esta vacia A1?: ${estaVaciaA1}, ¿Tiene datos validos A1?: ${tieneDatosValidosA1}`);
    
    // ✅ CORREGIDO: si está vacía o sin datos válidos, se debe auto-llenar
    if ((estaVaciaA1 || !tieneDatosValidosA1) && centrosDelGrupo.length > 0) {
      // Buscar capital
      let capital = centrosDelGrupo.find(cp => {
        const cat = (cp.categoria || '').toLowerCase();
        return cat.includes('capital');
      });
      
      // Si no hay capital, usar el de mayor población
      if (!capital && centrosDelGrupo.length > 0) {
        capital = centrosDelGrupo.reduce((max, cp) => {
          const pobMax = max?.poblacion ?? 0;
          const pobActual = cp.poblacion ?? 0;
          return pobActual > pobMax ? cp : max;
        }, centrosDelGrupo[0]);
      }
      
      if (capital) {
        console.log(`Capital encontrado: ${capital.nombre}`);
        const filaA1 = [{
          localidad: capital.nombre || '____',
          coordenadas: this.formatCoordenadas(capital.este, capital.norte),
          altitud: this.formatAltitud(capital.altitud),
          distrito: capital.dist || '____',
          provincia: capital.prov || '____',
          departamento: capital.dpto || '____'
        }];
        this.projectFacade.setField(this.seccionId, null, dataKeyA1, filaA1);
        // Persistir al backend
        try { this.formChange.persistFields(this.seccionId, 'table', { [dataKeyA1]: filaA1 }, { notifySync: true }); } catch (e) {}
      } else {
        console.log('⚠️ No se encontró capital ni centro poblado');
      }
    } else if (tieneDatosValidosA1) {
      console.log('✅ La tabla A1 ya tiene datos válidos');
    } else if (centrosDelGrupo.length === 0) {
      console.log('⚠️ No hay centros poblados en el grupo (no se puede auto-llenar A1)');
    } else {
      console.log('⚠️ La tabla A1 está vacía y no se auto-llenó (condición no cumplida)');
    }

    // === TABLA A2: Llenar con todos los centros poblados del grupo ===
    const tablaA2Actual = this.projectFacade.selectField(this.seccionId, null, dataKeyA2)();
    const estaVaciaA2 = !tablaA2Actual || tablaA2Actual.length === 0;
    const tieneDatosValidosA2 = this.tablaTieneDatosValidos(tablaA2Actual);

    const expectedCodigos = centrosDelGrupo.map(cp => String(cp.codigo)).filter(c => c && c.trim() !== '').sort();
    const existingCodigos = (Array.isArray(tablaA2Actual) ? tablaA2Actual : [])
      .map((r: any) => String(r?.codigo ?? '').trim())
      .filter((c: string) => c && c !== '____')
      .sort();
    const codigosCoinciden = expectedCodigos.length === existingCodigos.length
      && expectedCodigos.every((c, i) => c === existingCodigos[i]);
    
    console.log(`Tabla A2 actual:`, tablaA2Actual);
    console.log(`¿Esta vacia A2?: ${estaVaciaA2}, ¿Tiene datos validos A2?: ${tieneDatosValidosA2}`);
    
    // ✅ NUEVO CRITERIO: si cambia el set de códigos (Sección 2), debe re-sincronizar la tabla
    // Incluso si tiene datos válidos.
    if (((estaVaciaA2 || !tieneDatosValidosA2) || !codigosCoinciden) && centrosDelGrupo.length > 0) {
      console.log(`Llenando/actualizando tabla A2 con ${centrosDelGrupo.length} centros poblados`);

      // Merge suave: si una fila existe (mismo código), preservar valores editados cuando estén presentes
      const existingByCodigo = new Map<string, any>();
      if (Array.isArray(tablaA2Actual)) {
        for (const row of tablaA2Actual) {
          const codigo = String((row as any)?.codigo ?? '').trim();
          if (codigo) existingByCodigo.set(codigo, row);
        }
      }

      const filas = centrosDelGrupo.map(cp => {
        const codigo = String(cp.codigo || '').trim() || '____';
        const existing = existingByCodigo.get(codigo);
        const poblacionExisting = existing?.poblacion;
        const vivEmpExisting = existing?.viviendasEmpadronadas;
        const vivOcupExisting = existing?.viviendasOcupadas;
        return {
          punto: cp.nombre || existing?.punto || '____',
          codigo,
          poblacion: (poblacionExisting !== undefined && poblacionExisting !== null && String(poblacionExisting).trim() !== '' && String(poblacionExisting).trim() !== '____')
            ? String(poblacionExisting)
            : String(cp.poblacion ?? ''),
          viviendasEmpadronadas: (vivEmpExisting !== undefined && vivEmpExisting !== null && String(vivEmpExisting).trim() !== '' && String(vivEmpExisting).trim() !== '____')
            ? String(vivEmpExisting)
            : String(cp.viviendas_empadronadas ?? ''),
          viviendasOcupadas: (vivOcupExisting !== undefined && vivOcupExisting !== null && String(vivOcupExisting).trim() !== '' && String(vivOcupExisting).trim() !== '____')
            ? String(vivOcupExisting)
            : String(cp.viviendas_ocupadas ?? '')
        };
      });
      
      console.log(`Guardando datos en campo: ${dataKeyA2}`);
      console.log(`Datos a guardar:`, filas);
      this.projectFacade.setField(this.seccionId, null, dataKeyA2, filas);
      // Persistir al backend
      try { this.formChange.persistFields(this.seccionId, 'table', { [dataKeyA2]: filas }, { notifySync: true }); } catch (e) {}
      console.log(`✅ Datos guardados correctamente`);
    } else if (tieneDatosValidosA2) {
      console.log('✅ La tabla A2 ya tiene datos válidos');
    } else if (centrosDelGrupo.length === 0) {
      console.log('⚠️ No hay centros poblados en el grupo');
    }

    console.groupEnd();
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
    
    if (payload[keyA1]) {
      this.onFieldChange(keyA1, payload[keyA1], { refresh: false });
    }
    if (payload[keyA2]) {
      this.onFieldChange(keyA2, payload[keyA2], { refresh: false });
    }
    
    // Calcular totales inline
    const tablaA2Array = Array.isArray(tablaA2Actual) ? tablaA2Actual : [];
    const totals = {
      poblacion: tablaA2Array.map(f => Number(f['poblacion']) || 0).reduce((a, b) => a + b, 0),
      viviendasEmpadronadas: tablaA2Array.map(f => Number(f['viviendasEmpadronadas']) || 0).reduce((a, b) => a + b, 0),
      viviendasOcupadas: tablaA2Array.map(f => Number(f['viviendasOcupadas']) || 0).reduce((a, b) => a + b, 0)
    };
    
    // ✅ Guardar totales directamente sin onFieldChange
    const totalesPayload: Record<string, any> = {};
    totalesPayload[`tablaAISD2TotalPoblacion${prefijo}`] = totals.poblacion;
    totalesPayload[`tablaAISD2TotalViviendasEmpadronadas${prefijo}`] = totals.viviendasEmpadronadas;
    totalesPayload[`tablaAISD2TotalViviendasOcupadas${prefijo}`] = totals.viviendasOcupadas;
    Object.entries(totalesPayload).forEach(([key, value]) => {
      this.onFieldChange(key, value, { refresh: false });
    });
    
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

  // ✅ Override: Persistir fotografías directamente al backend (patrón secciones 21-22)
  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    const groupPrefix = this.obtenerPrefijoGrupo(); // '_B1' o '_A1'
    const updates: Record<string, any> = {};
    
    // Determinar qué prefijo usar basándose en customPrefix o usar el primero por defecto
    const prefixes = customPrefix 
      ? [customPrefix] 
      : [this.PHOTO_PREFIX_UBICACION, this.PHOTO_PREFIX_POBLACION];
    
    for (const basePrefix of prefixes) {
      // Limpiar fotos anteriores (todas las 10 posiciones para este grupo)
      for (let i = 1; i <= 10; i++) {
        const imgKey = groupPrefix ? `${basePrefix}${i}Imagen${groupPrefix}` : `${basePrefix}${i}Imagen`;
        const titKey = groupPrefix ? `${basePrefix}${i}Titulo${groupPrefix}` : `${basePrefix}${i}Titulo`;
        const fuenteKey = groupPrefix ? `${basePrefix}${i}Fuente${groupPrefix}` : `${basePrefix}${i}Fuente`;
        updates[imgKey] = '';
        updates[titKey] = '';
        updates[fuenteKey] = '';

        // también borrar versión sin prefijo para mantener consistencia
        if (groupPrefix) {
          updates[`${basePrefix}${i}Imagen`] = '';
          updates[`${basePrefix}${i}Titulo`] = '';
          updates[`${basePrefix}${i}Fuente`] = '';
        }
      }
      
      // Guardar nuevas fotos para este grupo (asumiendo que las fotos vienen en orden del grupo)
      fotografias.forEach((foto, index) => {
        if (foto.imagen) {
          const idx = index + 1;
          const imgKey = groupPrefix ? `${basePrefix}${idx}Imagen${groupPrefix}` : `${basePrefix}${idx}Imagen`;
          const titKey = groupPrefix ? `${basePrefix}${idx}Titulo${groupPrefix}` : `${basePrefix}${idx}Titulo`;
          const fuenteKey = groupPrefix ? `${basePrefix}${idx}Fuente${groupPrefix}` : `${basePrefix}${idx}Fuente`;
          const valorImagen = foto.imagen;

          updates[imgKey] = valorImagen;
          updates[titKey] = foto.titulo || '';
          updates[fuenteKey] = foto.fuente || '';

          // duplicar a clave base cuando exista prefijo para soportar cambio de seccionId
          if (groupPrefix) {
            updates[`${basePrefix}${idx}Imagen`] = valorImagen;
            updates[`${basePrefix}${idx}Titulo`] = foto.titulo || '';
            updates[`${basePrefix}${idx}Fuente`] = foto.fuente || '';
          }
        }
      });
    }
    
    // Guardar en ProjectStateFacade
    this.projectFacade.setFields(this.seccionId, null, updates);
    
    // Persistir al backend
    try {
      this.formChange.persistFields(this.seccionId, 'images', updates);
    } catch (e) {}
    
    this.cdRef.markForCheck();
  }

  // antiguo handler que ya no se invoca desde el HTML; mantenido solo
  // por si alguna otra parte del código lo llama. Redirige al nuevo método
  // genérico (`onFotografiasChange`) que soporta múltiples grupos.
  onGrupoFotosChange(prefix: string, fotografias: FotoItem[]): void {
    // delegar al método principal pasando `customPrefix` para que solo procese
    // el grupo indicado.
    this.onFotografiasChange(fotografias, prefix);
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {}

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  // ✅ MÉTODOS INLINE DE TEXTO (sin servicios)
  // Modificado para evitar fallback que causa mezcla de datos entre grupos
  private obtenerCampoConPrefijo(datos: any, campoBase: string): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `${campoBase}${prefijo}` : campoBase;
    const valor = datos[campoConPrefijo];
    // Solo devolver valor si tiene contenido real (no vacío, no placeholder)
    if (valor && typeof valor === 'string' && valor.trim() !== '' && valor !== '____') {
      return valor;
    }
    // NO hacer fallback a versión sin prefijo para evitar mezcla de datos entre grupos
    return '';
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
    
    const textoPorDefecto = `La CC ${nombreComunidad} se encuentra ubicada predominantemente dentro del distrito de ${distrito}, provincia de ${provincia}; no obstante, sus límites comunales abarcan pequeñas áreas de los distritos de Puyusca y de Pausa, del departamento de ${departamento}. Esta comunidad se caracteriza por su historia y tradiciones que se mantienen vivas a lo largo de los años. Se encuentra compuesta por el anexo ${nombreComunidad}, el cual es el centro administrativo comunal, además de los sectores agropecuarios de Yuracranra, Tastanic y Faldahuasi. Ellos se pudo validar durante el trabajo de campo, así como mediante la Base de Datos de Pueblos Indígenas u Originarios (BDPI). Sin embargo, en la actualidad, estos sectores agropecuarios no cuentan con población permanente y la mayor parte de los comuneros se concentran en el anexo ${nombreComunidad}.

En cuanto al nombre "${nombreComunidad}", según los entrevistados, este proviene de una hierba que se empleaba para elaborar moldes artesanales para queso; no obstante, ya no se viene utilizando en el presente y es una práctica que ha ido reduciéndose paulatinamente. Por otro lado, cabe mencionar que la comunidad sehalla al este de la CC Sondor, al norte del CP ${grupoAISI} y al oeste del anexo Nauquipa.

Asimismo, la CC ${nombreComunidad} es reconocida por el Ministerio de Cultura como parte de los pueblos indígenas u originarios, específicamente como parte del pueblo quechua. Esta identidad es un pilar fundamental de la comunidad, influyendo en sus prácticas agrícolas, celebraciones y organización social. La oficialización de la comunidad por parte del Estado peruano se remonta al 24 de agosto de 1987, cuando fue reconocida mediante RD N°495 – 87 – MAG – DR – VIII – A. Este reconocimiento formalizó la existencia y los derechos de la comunidad, fortaleciendo su posición y legitimidad dentro del marco legal peruano. Posteriormente, las tierras de la comunidad fueron tituladas el 28 de marzo de 1996, conforme consta en la Ficha 90000300, según la BDPI. Esta titulación ha sido crucial para la protección y manejo de sus recursos naturales, permitiendo a la comunidad planificar y desarrollar proyectos que beneficien a todos sus comuneros. La administración de estas tierras ha sido un factor clave en la preservación de su cultura y en el desarrollo sostenible de la comunidad.`;
    
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
