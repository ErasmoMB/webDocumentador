import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Injector, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Signal, computed, effect } from '@angular/core';
import { BaseSectionComponent } from '../base-section.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { SECCION29_SECTION_ID, SECCION29_TEMPLATES, SECCION29_DEFAULT_TEXTS, SECCION29_WATCHED_FIELDS } from './seccion29-constants';
import { transformAfiliacionSaludTabla } from 'src/app/core/config/table-transforms';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';

@Component({
  selector: 'app-seccion29-form',
  templateUrl: './seccion29-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, ParagraphEditorComponent, DynamicTableComponent, ImageUploadComponent]
})
export class Seccion29FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION29_SECTION_ID;
  @Input() override modoFormulario: boolean = false;
  
  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION29_TEMPLATES = SECCION29_TEMPLATES;
  override readonly PHOTO_PREFIX: string;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION29_WATCHED_FIELDS;

  /**
   * 🔄 Transforma datos desde `/demograficos/seguro-salud-por-cpp`
   * Desenvuelve la respuesta del backend y devuelve un array limpio
   */
  private readonly unwrapDemograficoData = (responseData: any): any[] => {
    if (!responseData) return [];
    
    // Si es un array, tomar el primer elemento y extraer 'rows'
    if (Array.isArray(responseData) && responseData.length > 0) {
      return responseData[0]?.rows || responseData[0] || [];
    }
    
    // Si tiene propiedad 'data', usar eso
    if (responseData.data) {
      const data = responseData.data;
      if (Array.isArray(data) && data.length > 0) {
        return data[0]?.rows || data;
      }
      return data;
    }
    
    // Si tiene 'rows' directamente, devolverlo
    if (responseData.rows && Array.isArray(responseData.rows)) {
      return responseData.rows;
    }
    
    return responseData && Array.isArray(responseData) ? responseData : [];
  };

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  private getFieldKey(field: string): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `${field}${prefijo}` : field;
  }

  private getFieldValue(field: string): any {
    const key = this.getFieldKey(field);
    return this.projectFacade.selectField(this.seccionId, null, key)()
      ?? this.projectFacade.selectField(this.seccionId, null, field)();
  }

  readonly centroPobladoSignal: Signal<string> = computed(() => {
    return this.obtenerNombreCentroPobladoActual()
      || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')()
      || '';
  });

  readonly textoNatalidadCP1Signal: Signal<string> = computed(() => {
    const manual = this.getFieldValue('textoNatalidadCP1');
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoNatalidadCP1();
  });

  readonly textoNatalidadCP2Signal: Signal<string> = computed(() => {
    const manual = this.getFieldValue('textoNatalidadCP2');
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoNatalidadCP2();
  });

  readonly textoMorbilidadCPSignal: Signal<string> = computed(() => {
    const manual = this.getFieldValue('textoMorbilidadCP');
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoMorbilidadCP();
  });

  readonly textoAfiliacionSaludSignal: Signal<string> = computed(() => {
    const manual = this.getFieldValue('textoAfiliacionSalud');
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoAfiliacionSalud();
  });

  readonly natalidadTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `natalidadMortalidadCpTabla${prefijo}` : 'natalidadMortalidadCpTabla';
    // Intentar con clave con prefijo
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    // Fallback a clave base
    const fromFieldBase = this.projectFacade.selectField(this.seccionId, null, 'natalidadMortalidadCpTabla')();
    const fromTableBase = this.projectFacade.selectTableData(this.seccionId, null, 'natalidadMortalidadCpTabla')();
    return fromField ?? fromTable ?? fromFieldBase ?? fromTableBase ?? [];
  });

  readonly morbilidadTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `morbilidadCpTabla${prefijo}` : 'morbilidadCpTabla';
    // Intentar con clave con prefijo
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    // Fallback a clave base
    const fromFieldBase = this.projectFacade.selectField(this.seccionId, null, 'morbilidadCpTabla')();
    const fromTableBase = this.projectFacade.selectTableData(this.seccionId, null, 'morbilidadCpTabla')();
    return fromField ?? fromTable ?? fromFieldBase ?? fromTableBase ?? [];
  });

  readonly afiliacionTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `afiliacionSaludTabla${prefijo}` : 'afiliacionSaludTabla';
    // Intentar con clave con prefijo
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    // Fallback a clave base
    const fromFieldBase = this.projectFacade.selectField(this.seccionId, null, 'afiliacionSaludTabla')();
    const fromTableBase = this.projectFacade.selectTableData(this.seccionId, null, 'afiliacionSaludTabla')();
    return fromField ?? fromTable ?? fromFieldBase ?? fromTableBase ?? [];
  });

  readonly fotografiasSignal: Signal<any[]> = computed(() => {
    // Prefer the SectionPhotoCoordinator-populated array (fotografiasFormMulti) when available
    const formMulti = (this as any).fotografiasFormMulti as any[] | undefined;
    if (formMulti && Array.isArray(formMulti) && formMulti.length > 0) return formMulti;
    return this.projectFacade.selectField(this.seccionId, null, 'fotografiasInstitucionalidad')() ?? [];
  });

  // Titles and sources for tables (editable fields)
  readonly tituloNatalidadSignal: Signal<string> = computed(() => this.getFieldValue('tituloNatalidadMortalidad') ?? '');
  readonly fuenteNatalidadSignal: Signal<string> = computed(() => this.getFieldValue('fuenteNatalidadMortalidad') ?? '');

  readonly tituloMorbilidadSignal: Signal<string> = computed(() => this.getFieldValue('tituloMorbilidad') ?? '');
  readonly fuenteMorbilidadSignal: Signal<string> = computed(() => this.getFieldValue('fuenteMorbilidad') ?? '');

  readonly tituloAfiliacionSignal: Signal<string> = computed(() => this.getFieldValue('tituloAfiliacionSalud') ?? '');
  readonly fuenteAfiliacionSignal: Signal<string> = computed(() => this.getFieldValue('fuenteAfiliacionSalud') ?? '');

  readonly viewModel = computed(() => ({
    centroPoblado: this.centroPobladoSignal(),
    textoNatalidadCP1: this.textoNatalidadCP1Signal(),
    textoNatalidadCP2: this.textoNatalidadCP2Signal(),
    textoMorbilidadCP: this.textoMorbilidadCPSignal(),
    textoAfiliacionSalud: this.textoAfiliacionSaludSignal(),
    natalidadTabla: this.natalidadTablaSignal(),
    morbilidadTabla: this.morbilidadTablaSignal(),
    afiliacionTabla: this.afiliacionTablaSignal(),
    tituloNatalidad: this.tituloNatalidadSignal(),
    fuenteNatalidad: this.fuenteNatalidadSignal(),
    tituloMorbilidad: this.tituloMorbilidadSignal(),
    fuenteMorbilidad: this.fuenteMorbilidadSignal(),
    tituloAfiliacion: this.tituloAfiliacionSignal(),
    fuenteAfiliacion: this.fuenteAfiliacionSignal(),
    fotografias: this.fotografiasSignal()
  }));

  // ✅ NUEVO: Signal para ubicación global (desde metadata)
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private backendApi: BackendApiService, private formChangeService: FormChangeService) {
    super(cdRef, injector);

    // ✅ Inicializar PHOTO_PREFIX dinámicamente
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = 'fotografiaCahuacho';

    // Sync legacy data object for backward compatibility
    effect(() => {
      const d = this.formDataSignal();
      this.datos = { ...this.datos, ...d };
      this.cdRef.markForCheck();
    });

    // ✅ CRÍTICO: Escuchar cambios en signals de tabla y forzar detección de cambios
    effect(() => {
      this.natalidadTablaSignal();
      this.morbilidadTablaSignal();
      this.afiliacionTablaSignal();
      this.cdRef.markForCheck();
    });
  }

  // Helper methods to generate fallback paragraph texts
  generarTextoNatalidadCP1(): string {
    const centro = this.obtenerNombreCentroPobladoActual()
      || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')()
      || SECCION29_TEMPLATES.centroPobladoDefault;
    const natalidad2023 = this.getNatalidad2023();
    const natalidad2024 = this.getNatalidad2024();
    return SECCION29_DEFAULT_TEXTS.natalidadCP1(centro, natalidad2023, natalidad2024);
  }

  generarTextoNatalidadCP2(): string {
    const mortalidad2023 = this.getMortalidad2023();
    const mortalidad2024 = this.getMortalidad2024();
    return SECCION29_DEFAULT_TEXTS.natalidadCP2(mortalidad2023, mortalidad2024);
  }

  generarTextoMorbilidadCP(): string {
    // ✅ REFACTOR: Usar ubicacionGlobal
    const distrito = this.ubicacionGlobal().distrito || SECCION29_TEMPLATES.distritoDefault;
    const centroPoblado = this.obtenerNombreCentroPobladoActual()
      || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')()
      || SECCION29_TEMPLATES.centroPobladoDefault;
    const infecciones = (this.morbilidadTablaSignal() || []).find((it:any)=> it.grupo?.toString?.().toLowerCase?.().includes('infecciones'))?.casos || 0;
    const obesidad = (this.morbilidadTablaSignal() || []).find((it:any)=> it.grupo?.toString?.().toLowerCase?.().includes('obesidad'))?.casos || 0;
    return SECCION29_DEFAULT_TEXTS.morbilidadCP(distrito, centroPoblado, infecciones, obesidad);
  }

  generarTextoAfiliacionSalud(): string {
    const centro = this.obtenerNombreCentroPobladoActual()
      || this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')()
      || SECCION29_TEMPLATES.centroPobladoDefault;
    const sis = this.afiliacionTablaSignal()
      .find((i:any)=> i.categoria?.toString?.().toLowerCase?.().includes('sis'))?.porcentaje || '0,00 %';
    const essalud = this.afiliacionTablaSignal()
      .find((i:any)=> i.categoria?.toString?.().toLowerCase?.().includes('essalud'))?.porcentaje || '0,00 %';
    const sinseguro = this.afiliacionTablaSignal()
      .find((i:any)=> i.categoria?.toString?.().toLowerCase?.().includes('sin seguro'))?.porcentaje || '0,00 %';

    return SECCION29_DEFAULT_TEXTS.afiliacionSalud(centro, sis, essalud, sinseguro);
  }

  // ✅ Métodos auxiliares para extraer datos de tablas
  getNatalidad2023(): number {
    const item = (this.natalidadTablaSignal() || []).find((item: any) => item.anio === 2023);
    return item?.natalidad || 0;
  }

  getNatalidad2024(): number {
    const item = (this.natalidadTablaSignal() || []).find((item: any) => item.anio === 2024);
    return item?.natalidad || 0;
  }

  getMortalidad2023(): number {
    const item = (this.natalidadTablaSignal() || []).find((item: any) => item.anio === 2023);
    return item?.mortalidad || 0;
  }

  getMortalidad2024(): number {
    const item = (this.natalidadTablaSignal() || []).find((item: any) => item.anio === 2024);
    return item?.mortalidad || 0;
  }

  /**
   * ✅ Cargar tabla de Afiliación a Salud desde el backend
   * Endpoint: POST /demograficos/seguro-salud-por-cpp
   * Datos son de solo lectura (100% backend, sin lógica del frontend)
   */
  private cargarAfiliacionDelBackend(): void {
    // 1. Obtener los códigos de centros poblados del grupo actual
    const codigosArray = this.getCodigosCentrosPobladosAISI();
    const codigos = [...codigosArray]; // Copia mutable

    console.log('[SECCION29-AFILIACION] 🔍 Intentando cargar, codigosCPP:', codigos);

    if (!codigos || codigos.length === 0) {
      console.error('[SECCION29-AFILIACION] ❌ No hay centros poblados en el grupo. Asegúrate de que el grupo AISI tenga CCPP asignados.');
      return;
    }

    // 2. Llamar al backend para obtener datos de afiliación a seguros
    this.backendApi.postSeguroSaludPorCpp(codigos).subscribe({
      next: (response: any) => {
        try {
          // 3. Desenvuelver y transformar datos (tal cual del backend, sin filtros)
          const dataRaw = response?.data || [];
          console.log('[SECCION29-AFILIACION] 📥 Respuesta cruda del backend:', dataRaw);
          
          const datosDesenvueltos = this.unwrapDemograficoData(dataRaw);
          console.log('[SECCION29-AFILIACION] 📦 Datos desenvueltos:', datosDesenvueltos);
          
          let datosTransformados = transformAfiliacionSaludTabla(datosDesenvueltos);
          
          console.log('[SECCION29-AFILIACION] ✅ Datos transformados:', datosTransformados);
          
          // 4. Guardar en state CON PREFIJO y SIN PREFIJO (fallback)
          if (datosTransformados.length > 0) {
            const prefijo = this.obtenerPrefijoGrupo();
            const tablaKey = prefijo ? `afiliacionSaludTabla${prefijo}` : 'afiliacionSaludTabla';
            
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            // También guardar sin prefijo para fallback
            this.projectFacade.setField(this.seccionId, null, 'afiliacionSaludTabla', datosTransformados);
            
            this.cdRef.markForCheck();
          } else {
            console.warn('[SECCION29-AFILIACION] ⚠️ El backend devolvió datos vacíos');
          }
        } catch (error) {
          console.error('[SECCION29-AFILIACION] ❌ Error transformando datos:', error);
        }
      },
      error: (error: any) => {
        console.error('[SECCION29-AFILIACION] ❌ Error cargando datos del backend:', error);
      }
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
    
    // ✅ DEBUG: Mostrar info del grupo AISI
    const codigosCPP = this.getCodigosCentrosPobladosAISI();
    console.log('[SECCION29] 🔍 Iniciando, prefijo:', prefijo, 'codigosCPP:', codigosCPP);

    // ✅ USAR setTimeout PARA ESPERAR A QUE LOS DATOS ESTÉN CARGADOS
    // Esto evita el timing issue donde formDataSignal() está vacío al inicio
    setTimeout(() => {
      this.verificarYCargarDatos(prefijo);
    }, 500);
  }

  /**
   * ✅ Verifica datos persistidos y carga del backend si es necesario
   * Separado en su propio método para ser llamado después de un delay
   */
  private verificarYCargarDatos(prefijo: string | null): void {
    const formData = this.formDataSignal();
    const natalidadKey = prefijo ? `natalidadMortalidadCpTabla${prefijo}` : 'natalidadMortalidadCpTabla';
    const morbilidadKey = prefijo ? `morbilidadCpTabla${prefijo}` : 'morbilidadCpTabla';
    const afiliacionKey = prefijo ? `afiliacionSaludTabla${prefijo}` : 'afiliacionSaludTabla';
    
    const natalidadData = formData[natalidadKey];
    const morbilidadData = formData[morbilidadKey];
    const afiliacionData = formData[afiliacionKey];
    
    console.log('[SECCION29] 📊 Datos en signal:', { natalidadKey, natalidadData, afiliacionKey, afiliacionData });

    // Initialize empty tables if missing
    if (!Array.isArray(this.natalidadTablaSignal())) {
      this.onFieldChange('natalidadMortalidadCpTabla', []);
    }
    if (!Array.isArray(this.morbilidadTablaSignal())) {
      this.onFieldChange('morbilidadCpTabla', []);
    }
    if (!Array.isArray(this.afiliacionTablaSignal())) {
      this.onFieldChange('afiliacionSaludTabla', []);
    }

    // ✅ VERIFICAR SI LOS DATOS SON VÁLIDOS (no solo si existen, sino si tienen contenido)
    const hayNatalidad = natalidadData && Array.isArray(natalidadData) && natalidadData.length > 0 && this.tieneDatosValidos(natalidadData);
    const hayMorbilidad = morbilidadData && Array.isArray(morbilidadData) && morbilidadData.length > 0 && this.tieneDatosValidos(morbilidadData);
    const hayAfiliacion = afiliacionData && Array.isArray(afiliacionData) && afiliacionData.length > 0 && this.tieneDatosValidos(afiliacionData);

    console.log('[SECCION29] 📋 Validando datos:', { natalidadData, hayNatalidad, afiliacionData, hayAfiliacion });

    if (!hayNatalidad) {
      console.log('[SECCION29] ⚠️ No hay datos válidos de natalidad, cargando del backend...');
    }
    if (!hayMorbilidad) {
      console.log('[SECCION29] ⚠️ No hay datos válidos de morbilidad, cargando del backend...');
    }
    if (!hayAfiliacion) {
      console.log('[SECCION29] ⚠️ No hay datos válidos de afiliación, cargando del backend...');
      this.cargarAfiliacionDelBackend();
    } else {
      console.log('[SECCION29] ✅ Datos válidos persistidos encontrados, no se carga del backend');
    }

    // Ensure paragraph fields exist so editor shows current value (empty string if not set)
    ['textoNatalidadCP1', 'textoNatalidadCP2', 'textoMorbilidadCP', 'textoAfiliacionSalud'].forEach(field => {
      const current = this.getFieldValue(field);
      if (current === undefined || current === null) {
        this.onFieldChange(this.getFieldKey(field), '');
      }
    });

    // Initialize title and fuente fields if missing so they are editable
    const keys = [
      ['tituloNatalidadMortalidad', 'fuenteNatalidadMortalidad'],
      ['tituloMorbilidad', 'fuenteMorbilidad'],
      ['tituloAfiliacionSalud', 'fuenteAfiliacionSalud']
    ];

    keys.forEach(([tituloKey, fuenteKey]) => {
      const t = this.getFieldValue(tituloKey);
      const f = this.getFieldValue(fuenteKey);
      if (t === undefined || t === null) this.onFieldChange(this.getFieldKey(tituloKey), '');
      if (f === undefined || f === null) this.onFieldChange(this.getFieldKey(fuenteKey), '');
    });
  }

  /**
   * Verifica si un array de datos de tabla tiene contenido válido
   * Un array con objetos vacíos o con valores vacíos no es válido
   */
  private tieneDatosValidos(data: any[]): boolean {
    if (!Array.isArray(data) || data.length === 0) return false;
    
    // Verificar si al menos una fila tiene datos significativos
    for (const row of data) {
      if (!row || typeof row !== 'object') continue;
      
      // Obtener todos los valores del objeto
      const valores = Object.values(row);
      
      // Verificar si hay al menos un valor no vacío/no cero
      const tieneValor = valores.some(v => {
        if (v === null || v === undefined) return false;
        if (typeof v === 'number') return v > 0;
        if (typeof v === 'string') return v.trim().length > 0;
        return false;
      });
      
      if (tieneValor) return true;
    }
    
    return false;
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  // Table configs for DynamicTable usage in the form
  readonly natalidadConfig: TableConfig = {
    tablaKey: 'natalidadMortalidadCpTabla',
    totalKey: 'anio',
    campoTotal: 'natalidad',
    camposParaCalcular: ['natalidad', 'mortalidad'],
    calcularPorcentajes: false,
    noInicializarDesdeEstructura: false,
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    estructuraInicial: [{ anio: '', natalidad: 0, mortalidad: 0 }]
  };

  readonly morbilidadConfig: TableConfig = {
    tablaKey: 'morbilidadCpTabla',
    totalKey: 'grupo',
    campoTotal: 'casos',
    camposParaCalcular: ['casos'],
    calcularPorcentajes: false,
    noInicializarDesdeEstructura: false,
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    estructuraInicial: [{ grupo: '', edad0_11: 0, edad12_17: 0, edad18_29: 0, edad30_59: 0, edad60_mas: 0, casos: 0 }]
  };

  readonly afiliacionConfig: TableConfig = {
    tablaKey: 'afiliacionSaludTabla',
    totalKey: '',                  // ✅ Sin fila de total (datos del backend)
    campoTotal: '',                // ✅ Sin cálculo total
    campoPorcentaje: '',           // ✅ Sin cálculo de porcentaje
    calcularPorcentajes: false,    // ✅ No calcular (viene del backend)
    camposParaCalcular: ['casos'],
    noInicializarDesdeEstructura: false,
    permiteAgregarFilas: true,
    permiteEliminarFilas: true,
    estructuraInicial: [{ categoria: '', asegurados: 0, porcentaje: 0 }]
  };

  // ✅ Columnas para tables (evita problemas con caracteres especiales en templates)
  readonly natalidadColumns: any[] = [
    { field: 'anio', label: SECCION29_TEMPLATES.columnAñoLabel, type: 'text' as const },
    { field: 'natalidad', label: SECCION29_TEMPLATES.columnNatalidadLabel, type: 'number' as const },
    { field: 'mortalidad', label: SECCION29_TEMPLATES.columnMortalidadLabel, type: 'number' as const }
  ];

  readonly morbilidadColumns: any[] = [
    { field: 'grupo', label: SECCION29_TEMPLATES.columnGrupoMorbilidadLabel, type: 'text' as const },
    { field: 'edad0_11', label: SECCION29_TEMPLATES.columnEdad0_11Label, type: 'number' as const },
    { field: 'edad12_17', label: SECCION29_TEMPLATES.columnEdad12_17Label, type: 'number' as const },
    { field: 'edad18_29', label: SECCION29_TEMPLATES.columnEdad18_29Label, type: 'number' as const },
    { field: 'edad30_59', label: SECCION29_TEMPLATES.columnEdad30_59Label, type: 'number' as const },
    { field: 'edad60_mas', label: SECCION29_TEMPLATES.columnEdad60_masLabel, type: 'number' as const },
    { field: 'casos', label: SECCION29_TEMPLATES.columnCasosTotalesLabel, type: 'number' as const }
  ];

  readonly afiliacionColumns: any[] = [
    { field: 'categoria', label: SECCION29_TEMPLATES.columnCategoriaAfiliacionLabel, type: 'text' as const },
    { field: 'casos', label: SECCION29_TEMPLATES.columnPoblacionLabel, type: 'number' as const },
    { field: 'porcentaje', label: SECCION29_TEMPLATES.columnPorcentajeLabel, type: 'text' as const }
  ];

  actualizarTexto(field: string, valor: string) {
    this.onFieldChange(this.getFieldKey(field), valor);
  }

  onTablaUpdated(tablaKey: string, tabla: any[]) {
    // Ya no se usa - ahora cada tabla tiene su propio método
  }
  
  // ✅ Métodos específicos para cada tabla (igual que Sección 30)
  onNatalidadTableUpdated(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `natalidadMortalidadCpTabla${prefijo}` : 'natalidadMortalidadCpTabla';
    
    // Primero intentar leer de datos locales, luego del signal
    let tabla = this.datos[tablaKey] ? [...this.datos[tablaKey]] : [];
    if (!tabla || tabla.length === 0) {
      tabla = this.formDataSignal()[tablaKey] ? [...this.formDataSignal()[tablaKey]] : [];
    }
    tabla = JSON.parse(JSON.stringify(tabla));
    
    // Actualizar datos locales directamente para mantener consistencia
    this.datos[tablaKey] = tabla;
    this.datos['natalidadMortalidadCpTabla'] = tabla;
    
    // ✅ REORDENAR: filas de datos primero, Total al final
    tabla = this.reordenarTablaConTotal(tabla);
    
    // ✅ Guardar en projectFacade
    try {
      this.projectFacade.setField(this.seccionId, null, tablaKey, tabla);
      this.projectFacade.setField(this.seccionId, null, 'natalidadMortalidadCpTabla', tabla);
    } catch (e) {}
    
    // ✅ PERSISTIR EN REDIS
    try {
      this.formChangeService.persistFields(this.seccionId, 'table', { [tablaKey]: tabla, 'natalidadMortalidadCpTabla': tabla }, { notifySync: true });
    } catch (e) {}
    
    this.cdRef.markForCheck();
  }
  
  onMorbilidadTableUpdated(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `morbilidadCpTabla${prefijo}` : 'morbilidadCpTabla';
    
    // Primero intentar leer de datos locales, luego del signal
    let tabla = this.datos[tablaKey] ? [...this.datos[tablaKey]] : [];
    if (!tabla || tabla.length === 0) {
      tabla = this.formDataSignal()[tablaKey] ? [...this.formDataSignal()[tablaKey]] : [];
    }
    tabla = JSON.parse(JSON.stringify(tabla));
    
    // Actualizar datos locales directamente para mantener consistencia
    this.datos[tablaKey] = tabla;
    this.datos['morbilidadCpTabla'] = tabla;
    
    // ✅ REORDENAR: filas de datos primero, Total al final
    tabla = this.reordenarTablaConTotal(tabla);
    
    // ✅ Guardar en projectFacade
    try {
      this.projectFacade.setField(this.seccionId, null, tablaKey, tabla);
      this.projectFacade.setField(this.seccionId, null, 'morbilidadCpTabla', tabla);
    } catch (e) {}
    
    // ✅ PERSISTIR EN REDIS
    try {
      this.formChangeService.persistFields(this.seccionId, 'table', { [tablaKey]: tabla, 'morbilidadCpTabla': tabla }, { notifySync: true });
    } catch (e) {}
    
    this.cdRef.markForCheck();
  }
  
  onAfiliacionTableUpdated(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `afiliacionSaludTabla${prefijo}` : 'afiliacionSaludTabla';
    
    // Primero intentar leer de datos locales, luego del signal
    let tabla = this.datos[tablaKey] ? [...this.datos[tablaKey]] : [];
    if (!tabla || tabla.length === 0) {
      tabla = this.formDataSignal()[tablaKey] ? [...this.formDataSignal()[tablaKey]] : [];
    }
    tabla = JSON.parse(JSON.stringify(tabla));
    
    // Actualizar datos locales directamente para mantener consistencia
    this.datos[tablaKey] = tabla;
    this.datos['afiliacionSaludTabla'] = tabla;
    
    // ✅ Ajustar Total referencial
    tabla = this.ajustarTotalReferencialAfiliacion(tablaKey, tabla);
    
    // ✅ REORDENAR: filas de datos primero, Total al final
    tabla = this.reordenarTablaConTotal(tabla);
    
    // ✅ Guardar en projectFacade
    try {
      this.projectFacade.setField(this.seccionId, null, tablaKey, tabla);
      this.projectFacade.setField(this.seccionId, null, 'afiliacionSaludTabla', tabla);
    } catch (e) {}
    
    // ✅ PERSISTIR EN REDIS
    try {
      this.formChangeService.persistFields(this.seccionId, 'table', { [tablaKey]: tabla, 'afiliacionSaludTabla': tabla }, { notifySync: true });
    } catch (e) {}
    
    this.cdRef.markForCheck();
  }
  
  /**
   * ✅ Helper para reordenar tabla: filas de datos primero, Total al final
   * Detecta la fila Total buscando en diferentes campos según el tipo de tabla
   */
  private reordenarTablaConTotal(tabla: any[]): any[] {
    if (!tabla || tabla.length === 0) return tabla;
    
    // Clonar para no mutar el original
    const tablaClon = JSON.parse(JSON.stringify(tabla));
    
    // Buscar la fila Total en diferentes campos posibles
    const filaTotalIndex = tablaClon.findIndex((item: any) => {
      const anio = item.anio?.toString().toLowerCase() || '';
      const grupo = item.grupo?.toString().toLowerCase() || '';
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return anio.includes('total') || grupo.includes('total') || categoria.includes('total');
    });
    
    // Filtrar filas normales (excluir Total)
    const filasNormales = tablaClon.filter((item: any) => {
      const anio = item.anio?.toString().toLowerCase() || '';
      const grupo = item.grupo?.toString().toLowerCase() || '';
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !anio.includes('total') && !grupo.includes('total') && !categoria.includes('total');
    });
    
    let filaTotal = null;
    if (filaTotalIndex >= 0) {
      filaTotal = tablaClon[filaTotalIndex];
      
      // ✅ Para "Total referencial" o filas similares, NO calcular porcentaje (dejar vacío)
      const cat = filaTotal.categoria?.toString().toLowerCase() || '';
      if (cat.includes('referencial')) {
        filaTotal.porcentaje = '';
      }
    }
    
    // Recombinar: filas normales + Total al final
    return filaTotal ? [...filasNormales, filaTotal] : [...filasNormales];
  }

  /**
   * ✅ Ajusta la fila "Total referencial" en la tabla de afiliación
   * - Casos = suma de filas normales
   * - Porcentaje = 100%
   */
  private ajustarTotalReferencialAfiliacion(tablaKeyBase: string, tabla: any[]): any[] {
    if (!tabla || tabla.length === 0) return tabla;
    if (!tablaKeyBase.includes('afiliacionSaludTabla')) return tabla;
    
    const tablaClon = JSON.parse(JSON.stringify(tabla));
    const filasNormales = tablaClon.filter((item: any) => !item.categoria?.toString().toLowerCase().includes('total'));
    const total = filasNormales.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
    
    // Calcular porcentajes para filas normales
    filasNormales.forEach((item: any) => {
      const casos = Number(item.casos) || 0;
      if (total > 0) {
        item.porcentaje = (casos / total * 100).toFixed(2).replace('.', ',') + ' %';
      } else {
        item.porcentaje = '0,00 %';
      }
    });
    
    const filaTotal = tablaClon.find((item: any) => item.categoria?.toString().toLowerCase().includes('total'));
    if (filaTotal) {
      filaTotal.casos = total;
      filaTotal.porcentaje = '100,00 %';
    }
    
    return tablaClon;
  }

  override onFotografiasChange(fotografias: any[]) {
    // ✅ Llamar al método base primero
    super.onFotografiasChange(fotografias);
    
    // ✅ PERSISTIR EN REDIS usando onFieldChange (automáticamente persiste)
    const prefijo = this.obtenerPrefijoGrupo();
    for (let i = 0; i < fotografias.length; i++) {
        const foto = fotografias[i];
        const idx = i + 1;
        const imgKey = `${this.PHOTO_PREFIX}${idx}Imagen${prefijo}`;
        const titKey = `${this.PHOTO_PREFIX}${idx}Titulo${prefijo}`;
        const fuenteKey = `${this.PHOTO_PREFIX}${idx}Fuente${prefijo}`;
        
        this.onFieldChange(imgKey, foto.imagen);
        this.onFieldChange(titKey, foto.titulo);
        this.onFieldChange(fuenteKey, foto.fuente);
    }
  }

  // ✅ Métodos para retornar datos de tabla formateados para binding
  getNatalidadTablaKey(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `natalidadMortalidadCpTabla${prefijo}` : 'natalidadMortalidadCpTabla';
  }

  getMorbilidadTablaKey(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `morbilidadCpTabla${prefijo}` : 'morbilidadCpTabla';
  }

  getAfiliacionTablaKey(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `afiliacionSaludTabla${prefijo}` : 'afiliacionSaludTabla';
  }

  getNatalidadTablaData(): Record<string, any[]> {
    const key = this.getNatalidadTablaKey();
    return { [key]: this.natalidadTablaSignal() };
  }

  getMorbilidadTablaData(): Record<string, any[]> {
    const key = this.getMorbilidadTablaKey();
    return { [key]: this.morbilidadTablaSignal() };
  }

  getAfiliacionTablaData(): Record<string, any[]> {
    const key = this.getAfiliacionTablaKey();
    return { [key]: this.afiliacionTablaSignal() };
  }
}
