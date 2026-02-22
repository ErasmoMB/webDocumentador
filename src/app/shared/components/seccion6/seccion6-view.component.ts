import { Component, Input, ChangeDetectorRef, OnDestroy, Injector, ChangeDetectionStrategy, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { FotoItem } from '../image-upload/image-upload.component';
import { SECCION6_COLUMNAS_POBLACION_SEXO, SECCION6_COLUMNAS_POBLACION_ETARIO, SECCION6_TABLA_POBLACION_SEXO_CONFIG, SECCION6_TABLA_POBLACION_ETARIO_CONFIG, SECCION6_TEMPLATES, SECCION6_CONFIG, SECCION6_WATCHED_FIELDS } from './seccion6-constants';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { debugLog } from 'src/app/shared/utils/debug';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { transformPoblacionSexoDesdeDemograficos, transformPoblacionEtarioDesdeDemograficos } from 'src/app/core/config/table-transforms';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { FormPersistenceService } from 'src/app/core/services/state/form-persistence.service';

// Helper para desenvuelver datos del backend (misma idea que en el form)
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
  standalone: true,
  imports: [CommonModule, CoreSharedModule],
  selector: 'app-seccion6-view',
  templateUrl: './seccion6-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion6ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION6_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = false;
  
  // ✅ Hacer TEMPLATES accesible en template
  readonly SECCION6_TEMPLATES = SECCION6_TEMPLATES;
  
  override readonly PHOTO_PREFIX = SECCION6_CONFIG.photoPrefix;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION6_WATCHED_FIELDS;
  fotografiasVista: FotoItem[] = [];

  // ✅ SIGNAL PARA FOTOGRAFÍAS - ÚNICA VERDAD
  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const prefix = this.PHOTO_PREFIX;
    const prefijo = this.prefijoGrupoSignal();
    const data = this.vistDataSignal();
    
    for (let i = 1; i <= 10; i++) {
      const imagenKey = `${prefix}${i}Imagen${prefijo}`;
      const tituloKey = `${prefix}${i}Titulo${prefijo}`;
      const fuenteKey = `${prefix}${i}Fuente${prefijo}`;
      
      const imagen = data[imagenKey];
      if (imagen) {
        fotos.push({
          imagen: imagen,
          titulo: data[tituloKey] || `Fotografía ${i}`,
          fuente: data[fuenteKey] || 'GEADES, 2024'
        } as FotoItem);
      }
    }
    return fotos;
  });

  // ✅ Signal de prefijo de grupo AISD
  readonly prefijoGrupoSignal: Signal<string> = computed(() => this.obtenerPrefijoGrupo());

  poblacionSexoConfig: TableConfig = SECCION6_TABLA_POBLACION_SEXO_CONFIG;
  poblacionEtarioConfig: TableConfig = SECCION6_TABLA_POBLACION_ETARIO_CONFIG;
  poblacionSexoColumns = SECCION6_COLUMNAS_POBLACION_SEXO;
  poblacionEtarioColumns = SECCION6_COLUMNAS_POBLACION_ETARIO;

  readonly vistDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  // ✅ Códigos AISD del grupo actual (pueden llegar después de montar la vista)
  private readonly codigosAISDSignal: Signal<readonly string[]> = computed(() => {
    return this.getCodigosCentrosPobladosAISD();
  });

  private backendLoadInFlight = false;

  // ✅ Tablas reactivas (evita vacíos intermitentes en vista OnPush)
  readonly poblacionSexoRowsSignal: Signal<any[]> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.vistDataSignal();
    
    // ✅ SOLO buscar con prefijo - no fallback a sin prefijo para evitar confusión
    const tablaConPrefijo = prefijo ? data[`poblacionSexoAISD${prefijo}`] : null;
    if (tablaConPrefijo && this.tieneContenidoRealDemografia(tablaConPrefijo)) {
      return tablaConPrefijo;
    }
    return [];
  });

  readonly poblacionEtarioRowsSignal: Signal<any[]> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.vistDataSignal();
    
    // ✅ SOLO buscar con prefijo - no fallback a sin prefijo para evitar confusión
    const tablaConPrefijo = prefijo ? data[`poblacionEtarioAISD${prefijo}`] : null;
    if (tablaConPrefijo && this.tieneContenidoRealDemografia(tablaConPrefijo)) {
      return tablaConPrefijo;
    }
    return [];
  });

  readonly vistTextoPoblacionSexoSignal: Signal<string> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.vistDataSignal();
    
    // ✅ Prioridad: leer valor manual si existe (con prefijo y sin prefijo)
    const manualKey = `textoPoblacionSexoAISD${prefijo}`;
    const manual = data[manualKey];
    
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    
    const nombreComunidad = this.obtenerNombreComunidadActual();
    return this.obtenerTextoPoblacionSexo(data, nombreComunidad);
  });

  readonly vistTextoPoblacionEtarioSignal: Signal<string> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const data = this.vistDataSignal();
    
    // ✅ Prioridad: leer valor manual si existe (con prefijo y sin prefijo)
    const manualKey = `textoPoblacionEtarioAISD${prefijo}`;
    const manual = data[manualKey];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    
    const nombreComunidad = this.obtenerNombreComunidadActual();
    return this.obtenerTextoPoblacionEtario(data, nombreComunidad);
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    // Seccion6TableConfigService eliminado - configs ahora son constantes
    private sanitizer: DomSanitizer,
    private backendApi: BackendApiService,
    private formChange: FormChangeService,
    private formPersistence: FormPersistenceService
  ) {
    super(cdRef, injector);
    // Configs ya inicializadas como propiedades de clase
    
    // ✅ FLUJO UNICA_VERDAD - Logging para pruebas en Vista
    // ✅ FLUJO UNICA_VERDAD - Logging para pruebas
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════════════╗');
    console.log('║  🎯 SECCIÓN 6 (VIEW) - FLUJO UNICA_VERDAD - MODO DEBUG         ║');
    console.log('╚════════════════════════════════════════════════════════════════════════╝');
    console.log(`[SECCION6:VIEW:INIT] 📋 Sección ID: ${this.seccionId}`);
    console.log(`[SECCION6:VIEW:INIT] 🏷️ Prefijo inicial: ${this.obtenerPrefijoGrupo()}`);
    
    // ✅ Cargar fotos al inicio
    this.cargarFotografias();
    
    // ✅ EFFECT 2: Monitorear fotosCacheSignal para recargar fotografías (ÚNICA VERDAD)
    // Se ejecuta cuando las fotos cambian (cuando se agregan/editan fotos en el Form)
    // IMPORTANTE: El flag debe estar FUERA del effect para persistir entre ejecuciones
    const fotogramasView = this;
    let inicializadoView = false;
    effect(() => {
      // ✅ ÚNICA VERDAD: Monitorear fotosCacheSignal
      const fotos = fotogramasView.fotosCacheSignal();
      
      // Skip first execution - photos will be loaded by constructor
      if (!inicializadoView) {
        inicializadoView = true;
        return;
      }
      
      // Recargar fotografías solo si hay fotos con imagen
      if (fotos && fotos.length > 0) {
        fotogramasView.cargarFotografias();
        fotogramasView.fotografiasVista = [...fotogramasView.fotografiasCache];
        fotogramasView.cdRef.markForCheck();
      }
    }, { allowSignalWrites: true });

    // ✅ EFFECT 3: En vista/plantilla, cargar backend si faltan datos (evita “se llena recién al recargar”)
    effect(async () => {
      const codigos = this.codigosAISDSignal();
      const rowsSexo = this.poblacionSexoRowsSignal();
      const rowsEtario = this.poblacionEtarioRowsSignal();

      const necesitaSexo = !rowsSexo || rowsSexo.length === 0;
      const necesitaEtario = !rowsEtario || rowsEtario.length === 0;

      if (!necesitaSexo && !necesitaEtario) return;
      if (this.backendLoadInFlight) return;
      if (!codigos || codigos.length === 0) return;

      // ✅ PRIMERO: Verificar si hay datos en Session-Data
      const prefijo = this.prefijoGrupoSignal();
      const tablaKeySexo = `poblacionSexoAISD${prefijo}`;
      const tablaKeyEtario = `poblacionEtarioAISD${prefijo}`;
      
      try {
        const sessionState = await this.formPersistence.loadSectionState(this.seccionId);
        const tableGroup = sessionState?.['table'];
        const sexoData = tableGroup?.[tablaKeySexo]?.value;
        const etarioData = tableGroup?.[tablaKeyEtario]?.value;
        
        if (sexoData || etarioData) {
          debugLog('[SECCION6:VIEW] 📦 DATOS ENCONTRADOS EN SESSION-DATA! Restaurando...');
          
          // Restaurar en ProjectStateFacade
          if (sexoData) {
            this.projectFacade.setField(this.seccionId, null, tablaKeySexo, sexoData);
            this.projectFacade.setTableData(this.seccionId, null, tablaKeySexo, sexoData);
          }
          if (etarioData) {
            this.projectFacade.setField(this.seccionId, null, tablaKeyEtario, etarioData);
            this.projectFacade.setTableData(this.seccionId, null, tablaKeyEtario, etarioData);
          }
          
          this.backendLoadInFlight = false;
          this.cdRef.markForCheck();
          return;
        }
      } catch (e) {
        debugLog('[SECCION6:VIEW] ⚠️ Error cargando session-data:', e);
      }

      // ✅ Si no hay en Session-Data, llamar al backend
      this.backendLoadInFlight = true;
      this.cargarDatosDelBackendVista(codigos, { sexo: necesitaSexo, etario: necesitaEtario });
    }, { allowSignalWrites: true });

    // ✅ EFFECT 4: Detectar cambio de CPP/grupo y limpiar session-data
    effect(() => {
      const prefijoActual = this.prefijoGrupoSignal();
      
      // Si no hay prefijo (aún no se inicializó), ignorar
      if (!prefijoActual) return;
      
      // Comparar con el prefijo anterior
      const prefijoAnterior = this._prefijoAnterior;
      if (prefijoAnterior === undefined) {
        // Primera vez que cargamos el prefijo, solo guardar
        this._prefijoAnterior = prefijoActual;
        return;
      }
      
      // Si el prefijo cambió, significa que el usuario cambió de CPP/grupo
      if (prefijoAnterior !== prefijoActual) {
        debugLog('[SECCION6:VIEW] 🔄 CAMBIO DE CPP DETECTADO', { 
          prefijoAnterior, 
          prefijoNuevo: prefijoActual 
        });
        
        // Limpiar session-data de Sección 6
        try {
          this.formPersistence.clearSectionState(this.seccionId);
          debugLog('[SECCION6:VIEW] ✅ Session-data limpiada para preparar nuevo CPP');
        } catch (e) {
          debugLog('[SECCION6:VIEW] ⚠️ Error limpiando session-data:', e);
        }
        
        // Actualizar el prefijo anterior
        this._prefijoAnterior = prefijoActual;
        
        // Resetear la bandera para que recargue
        this.backendLoadInFlight = false;
      }
    });
  }
  
  // ✅ Variable privada para rastrear el prefijo anterior (para detectar cambios)
  private _prefijoAnterior: string | undefined;

  protected override onInitCustom(): void {
    this.cargarFotografias();
    this.fotografiasVista = [...this.fotografiasCache];
  }

  private cargarDatosDelBackendVista(
    codigos: readonly string[],
    flags: { sexo: boolean; etario: boolean }
  ): void {
    const prefijo = this.obtenerPrefijoGrupo();
    debugLog('[SECCION6:VIEW] 📡 Cargando demografía desde backend (vista)...', {
      seccionId: this.seccionId,
      prefijo,
      codigos,
      flags
    });

    if (flags.sexo) {
      this.backendApi.postDatosDemograficos([...codigos]).subscribe({
        next: async (response: any) => {
          try {
            // Guardas: no sobre-escribir si ya se llenó mientras esperábamos
            if (this.poblacionSexoRowsSignal().length > 0) return;

            const dataRaw = response?.data ?? response;
            const datosDesenvueltos = unwrapDemograficoData(dataRaw);
            const datosTransformados = transformPoblacionSexoDesdeDemograficos(datosDesenvueltos);

            if (datosTransformados.length > 0) {
              const tablaKey = `poblacionSexoAISD${prefijo}`;
              
              // ✅ GUARDAR SOLO CON PREFIJO (aislamiento correcto)
              try {
                this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datosTransformados }, { notifySync: true });
                debugLog('[SECCION6:VIEW] 💾 Datos de sexo guardados en session-data SOLO con prefijo: ' + tablaKey);
              } catch (e) {
                debugLog('[SECCION6:VIEW] ⚠️ No se pudo guardar en session-data:', e);
              }
              
              // ✅ Solo guardar CON prefijo - no sin prefijo para evitar confusión
              this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
              this.projectFacade.setTableData(this.seccionId, null, tablaKey, datosTransformados);

              this.cdRef.markForCheck();
              debugLog('[SECCION6:VIEW] ✅ Tabla sexo cargada', { tablaKey, rows: datosTransformados.length });
            } else {
              debugLog('[SECCION6:VIEW] ⚠️ Tabla sexo sin datos transformados', { prefijo });
            }
          } catch (e) {
            debugLog('[SECCION6:VIEW] ❌ Error transformando datos de sexo:', e);
          }
        },
        error: (err: any) => {
          debugLog('[SECCION6:VIEW] ❌ Error cargando población por sexo:', err);
        }
      });
    }

    if (flags.etario) {
      this.backendApi.postEtario([...codigos]).subscribe({
        next: async (response: any) => {
          try {
            if (this.poblacionEtarioRowsSignal().length > 0) return;

            const dataRaw = response?.data ?? response;
            const datosDesenvueltos = unwrapDemograficoData(dataRaw);
            const datosTransformados = transformPoblacionEtarioDesdeDemograficos(datosDesenvueltos);

            if (datosTransformados.length > 0) {
              const tablaKey = `poblacionEtarioAISD${prefijo}`;
              
              // ✅ GUARDAR SOLO CON PREFIJO (aislamiento correcto)
              try {
                this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: datosTransformados }, { notifySync: true });
                debugLog('[SECCION6:VIEW] 💾 Datos de etario guardados en session-data SOLO con prefijo: ' + tablaKey);
              } catch (e) {
                debugLog('[SECCION6:VIEW] ⚠️ No se pudo guardar en session-data:', e);
              }
              
              // ✅ Solo guardar CON prefijo - no sin prefijo para evitar confusión
              this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
              this.projectFacade.setTableData(this.seccionId, null, tablaKey, datosTransformados);

              this.cdRef.markForCheck();
              debugLog('[SECCION6:VIEW] ✅ Tabla etario cargada', { tablaKey, rows: datosTransformados.length });
            } else {
              debugLog('[SECCION6:VIEW] ⚠️ Tabla etario sin datos transformados', { prefijo });
            }
          } catch (e) {
            debugLog('[SECCION6:VIEW] ❌ Error transformando datos etario:', e);
          }
        },
        error: (err: any) => {
          debugLog('[SECCION6:VIEW] ❌ Error cargando población etario:', err);
        }
      });
    }

    // ✅ Liberar guard en el siguiente tick; si algo deja la tabla vacía, el effect podrá intentar de nuevo.
    setTimeout(() => {
      this.backendLoadInFlight = false;
      this.cdRef.markForCheck();
    }, 0);
  }

  /**
   * ✅ Aplica los edits del usuario (desde session-data) sobre los datos del backend
   * Hace un merge por índice de fila: si el usuario editó una fila, se usa su versión
   */
  private aplicarEditsATabla(datosBackend: any[], editsUsuario: any[]): any[] {
    if (!Array.isArray(datosBackend) || !Array.isArray(editsUsuario)) {
      return datosBackend;
    }

    // Crear un mapa de edits por índice
    const editMap = new Map<number, any>();
    editsUsuario.forEach((edit, index) => {
      editMap.set(index, edit);
    });

    // Aplicar edits: si el usuario editó la fila en ese índice, usar su versión
    const resultado = datosBackend.map((datosRow, index) => {
      if (editMap.has(index)) {
        // El usuario editó esta fila
        return editMap.get(index);
      }
      // No fue editada, mantener datos del backend
      return datosRow;
    });

    return resultado;
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  override obtenerNombreComunidadActual(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // ✅ NUEVO: Usar aisdGroups() signal para obtener el nombre del grupo actual
    if (prefijo && prefijo.startsWith('_A')) {
      const match = prefijo.match(/_A(\d+)/);
      if (match) {
        const index = parseInt(match[1]) - 1; // _A1 → índice 0, _A2 → índice 1
        const grupos = this.aisdGroups();
        if (grupos && grupos[index]?.nombre) {
          return grupos[index].nombre;
        }
      }
    }
    
    const datos = this.vistDataSignal();
    
    // Fallback: buscar en datos guardados
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(datos, 'grupoAISD', this.seccionId);
    if (grupoAISD && grupoAISD.trim() !== '') {
      return grupoAISD;
    }
    
    const grupoConSufijo = prefijo ? datos[`grupoAISD${prefijo}`] : null;
    if (grupoConSufijo && grupoConSufijo.trim() !== '') {
      return grupoConSufijo;
    }
    
    if (datos['comunidadesCampesinas'] && Array.isArray(datos['comunidadesCampesinas']) && datos['comunidadesCampesinas'].length > 0) {
      const primerCC = datos['comunidadesCampesinas'][0];
      if (primerCC && primerCC['nombre'] && primerCC['nombre'].trim() !== '') {
        return primerCC['nombre'];
      }
    }
    
    return '____';
  }

  override obtenerValorConPrefijo(campo: string): any {
    const datos = this.vistDataSignal();
    return PrefijoHelper.obtenerValorConPrefijo(datos, campo, this.seccionId);
  }

  obtenerTextoPoblacionSexoView(): string {
    const texto = this.vistTextoPoblacionSexoSignal();
    const nombreComunidad = this.obtenerNombreComunidadActual();
    if (texto && texto.trim() !== '' && texto !== '____') {
      return texto.replace(/___/g, nombreComunidad);
    }
    return this.obtenerTextoPoblacionSexo(this.vistDataSignal(), nombreComunidad);
  }

  obtenerTextoPoblacionEtarioView(): string {
    const texto = this.vistTextoPoblacionEtarioSignal();
    const nombreComunidad = this.obtenerNombreComunidadActual();
    if (texto && texto.trim() !== '' && texto !== '____') {
      return texto.replace(/___/g, nombreComunidad);
    }
    return this.obtenerTextoPoblacionEtario(this.vistDataSignal(), nombreComunidad);
  }

  getPoblacionSexoConPorcentajes(): any[] {
    return this.poblacionSexoRowsSignal();
  }

  getPoblacionEtarioConPorcentajes(): any[] {
    return this.poblacionEtarioRowsSignal();
  }

  private getTablaSexo(): any[] {
    return this.poblacionSexoRowsSignal();
  }

  private getTablaEtario(): any[] {
    return this.poblacionEtarioRowsSignal();
  }

  private tieneContenidoRealDemografia(tabla: any[]): boolean {
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) return false;
    return tabla.some(item => {
      const sexo = item.sexo?.toString().trim() || '';
      const categoria = item.categoria?.toString().trim() || '';
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sexo !== '' || categoria !== '' || casos > 0;
    });
  }

  getTotalPoblacionSexo(): number {
    const tablaSexo = this.getTablaSexo();
    if (!tablaSexo || !Array.isArray(tablaSexo) || tablaSexo.length === 0) {
      return 0;
    }
    
    return tablaSexo.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
  }

  getTotalPoblacionEtario(): number {
    const tablaEtario = this.getTablaEtario();
    if (!tablaEtario || !Array.isArray(tablaEtario) || tablaEtario.length === 0) {
      return 0;
    }
    
    return tablaEtario.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
  }

  getPorcentajeTotalPoblacionSexo(): string {
    const total = this.getTotalPoblacionSexo();
    return total === 0 ? '0,00 %' : '100,00 %';
  }

  getPorcentajeTotalPoblacionEtario(): string {
    const total = this.getTotalPoblacionEtario();
    return total === 0 ? '0,00 %' : '100,00 %';
  }

  // ✅ OVERRIDE CRÍTICO: cargarFotografias() DEBE LEER DEL SIGNAL REACTIVO (vistDataSignal)
  override cargarFotografias(): void {
    const formData = this.vistDataSignal();
    const prefijo = this.prefijoGrupoSignal();
    
    // DEBUG: Log qué datos tiene
    const allKeys = Object.keys(formData || {});
    const fotoKeys = allKeys.filter(k => k.includes('fotografia') && k.includes('Imagen') && !k.includes('Titulo') && !k.includes('Fuente') && !k.includes('Numero'));
    
    // Contar fotos reales (con imagen no vacía)
    let fotosReales = 0;
    for (const key of fotoKeys) {
      const valor = formData[key];
      if (valor && typeof valor === 'string' && valor.length > 0 && valor.startsWith('data:')) {
        fotosReales++;
      }
    }
    
    console.log(`[SECCION6:VIEW:FOTOS] 🔍 Cargando fotos:`, {
      prefijo,
      fotoKeys: fotoKeys.slice(0, 5),
      fotosReales,
      fotografiasCacheActual: this.fotografiasCache?.length || 0
    });
    
    // ✅ SOLO mantener cache si la cantidad de fotos es EXACTAMENTE IGUAL
    // Si fotosReales > cache, hay nuevas fotos que deben cargarse
    const cacheCount = this.fotografiasCache?.length || 0;
    if (cacheCount > 0 && cacheCount === fotosReales) {
      console.log(`[SECCION6:VIEW:FOTOS] ✅ Misma cantidad (${cacheCount}), verificando títulos...`);
      // Aquí verificamos si los títulos/fuentes cambiaron comparando con formData
      // Si hay discrepancia, recargamos
      let necesitaRecarga = false;
      for (let i = 0; i < cacheCount; i++) {
        const foto = this.fotografiasCache[i];
        const titKey = `${this.PHOTO_PREFIX}${i + 1}Titulo${prefijo}`;
        const fuenteKey = `${this.PHOTO_PREFIX}${i + 1}Fuente${prefijo}`;
        if (formData[titKey] !== foto.titulo || formData[fuenteKey] !== foto.fuente) {
          console.log(`[SECCION6:VIEW:FOTOS] 🔄 Título/Fuente cambió para foto ${i + 1}, recargando`);
          necesitaRecarga = true;
          break;
        }
      }
      if (!necesitaRecarga) {
        console.log(`[SECCION6:VIEW:FOTOS] ✅ Títulos sin cambios, manteniendo cache`);
        this.fotografiasVista = [...this.fotografiasCache];
        this.cdRef.markForCheck();
        return;
      }
      // Si necesita recarga, continúa el procesamiento normal
    } else {
      console.log(`[SECCION6:VIEW:FOTOS] ℹ️ Cache(${cacheCount}) != Reales(${fotosReales}), recargando`);
    }
    
    // ✅ SOLO procesar si hay datos reales
    if (!formData || Object.keys(formData).length === 0) {
      console.log(`[SECCION6:VIEW:FOTOS] ⚠️ No hay datos, saltando`);
      this.fotografiasCache = [];
      this.fotografiasVista = [];
      this.cdRef.markForCheck();
      return;
    }
    
    const fotos: FotoItem[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`;
      const imagen = formData[imagenKey];
      
      // Verificar que la imagen sea un data URL válido
      const esValida = imagen && typeof imagen === 'string' && imagen.length > 0 && imagen.startsWith('data:');
      
      console.log(`[SECCION6:VIEW:FOTOS] 📷 Foto ${i}: key=${imagenKey}, esValida=${esValida}, longitud=${imagen?.length || 0}`);
      
      if (esValida) {
        const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`;
        const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`;
        const numeroKey = `${this.PHOTO_PREFIX}${i}Numero${prefijo}`;
        
        fotos.push({
          imagen: imagen,
          titulo: formData[tituloKey] || '',
          fuente: formData[fuenteKey] || '',
          numero: formData[numeroKey] || i
        });
      }
    }
    
    console.log(`[SECCION6:VIEW:FOTOS] ✅ Fotos cargadas: ${fotos.length}`);
    
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    this.fotografiasVista = [...this.fotografiasCache];
    this.cdRef.markForCheck();
  }

  // ✅ MÉTODOS INLINE DE TEXTO (usando TEMPLATES)
  obtenerTextoPoblacionSexo(datos: any, nombreComunidad: string): string {
    const textoPersonalizado = PrefijoHelper.obtenerValorConPrefijo(datos, 'textoPoblacionSexoAISD', this.seccionId);
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado.replace(/{COMUNIDAD}/g, nombreComunidad || '____');
    }
    return SECCION6_TEMPLATES.textoPoblacionSexoDefault.replace(/{COMUNIDAD}/g, nombreComunidad || '____');
  }

  obtenerTextoPoblacionEtario(datos: any, nombreComunidad: string): string {
    const textoPersonalizado = PrefijoHelper.obtenerValorConPrefijo(datos, 'textoPoblacionEtarioAISD', this.seccionId);
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado.replace(/{COMUNIDAD}/g, nombreComunidad || '____');
    }
    return SECCION6_TEMPLATES.textoPoblacionEtarioDefault.replace(/{COMUNIDAD}/g, nombreComunidad || '____');
  }
}

