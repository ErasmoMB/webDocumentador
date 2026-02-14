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

  readonly centroPobladoSignal: Signal<string> = computed(() => this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || '');

  readonly textoNatalidadCP1Signal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoNatalidadCP1')();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoNatalidadCP1();
  });

  readonly textoNatalidadCP2Signal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoNatalidadCP2')();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoNatalidadCP2();
  });

  readonly textoMorbilidadCPSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoMorbilidadCP')();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoMorbilidadCP();
  });

  readonly textoAfiliacionSaludSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'textoAfiliacionSalud')();
    if (manual && manual.trim().length > 0) return manual;
    return this.generarTextoAfiliacionSalud();
  });

  readonly natalidadTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `natalidadMortalidadCpTabla${prefijo}` : 'natalidadMortalidadCpTabla';
    return this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? [];
  });

  readonly morbilidadTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `morbilidadCpTabla${prefijo}` : 'morbilidadCpTabla';
    return this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? [];
  });

  readonly afiliacionTablaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `afiliacionSaludTabla${prefijo}` : 'afiliacionSaludTabla';
    return this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? [];
  });

  readonly fotografiasSignal: Signal<any[]> = computed(() => {
    // Prefer the SectionPhotoCoordinator-populated array (fotografiasFormMulti) when available
    const formMulti = (this as any).fotografiasFormMulti as any[] | undefined;
    if (formMulti && Array.isArray(formMulti) && formMulti.length > 0) return formMulti;
    return this.projectFacade.selectField(this.seccionId, null, 'fotografiasInstitucionalidad')() ?? [];
  });

  // Titles and sources for tables (editable fields)
  readonly tituloNatalidadSignal: Signal<string> = computed(() => this.projectFacade.selectField(this.seccionId, null, 'tituloNatalidadMortalidad')() ?? '');
  readonly fuenteNatalidadSignal: Signal<string> = computed(() => this.projectFacade.selectField(this.seccionId, null, 'fuenteNatalidadMortalidad')() ?? '');

  readonly tituloMorbilidadSignal: Signal<string> = computed(() => this.projectFacade.selectField(this.seccionId, null, 'tituloMorbilidad')() ?? '');
  readonly fuenteMorbilidadSignal: Signal<string> = computed(() => this.projectFacade.selectField(this.seccionId, null, 'fuenteMorbilidad')() ?? '');

  readonly tituloAfiliacionSignal: Signal<string> = computed(() => this.projectFacade.selectField(this.seccionId, null, 'tituloAfiliacionSalud')() ?? '');
  readonly fuenteAfiliacionSignal: Signal<string> = computed(() => this.projectFacade.selectField(this.seccionId, null, 'fuenteAfiliacionSalud')() ?? '');

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

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private backendApi: BackendApiService) {
    super(cdRef, injector);

    // ✅ Inicializar PHOTO_PREFIX dinámicamente
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';

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
    const centro = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || SECCION29_TEMPLATES.centroPobladoDefault;
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
    const centroPoblado = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || SECCION29_TEMPLATES.centroPobladoDefault;
    const infecciones = (this.morbilidadTablaSignal() || []).find((it:any)=> it.grupo?.toString?.().toLowerCase?.().includes('infecciones'))?.casos || 0;
    const obesidad = (this.morbilidadTablaSignal() || []).find((it:any)=> it.grupo?.toString?.().toLowerCase?.().includes('obesidad'))?.casos || 0;
    return SECCION29_DEFAULT_TEXTS.morbilidadCP(distrito, centroPoblado, infecciones, obesidad);
  }

  generarTextoAfiliacionSalud(): string {
    const centro = this.projectFacade.selectField(this.seccionId, null, 'centroPobladoAISI')() || SECCION29_TEMPLATES.centroPobladoDefault;
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

    if (!codigos || codigos.length === 0) {
      console.log('[SECCION29-AFILIACION] ⚠️ No hay centros poblados en el grupo');
      return;
    }

    // 2. Llamar al backend para obtener datos de afiliación a seguros
    this.backendApi.postSeguroSaludPorCpp(codigos).subscribe({
      next: (response: any) => {
        try {
          // 3. Desenvuelver y transformar datos (tal cual del backend, sin filtros)
          const dataRaw = response?.data || [];
          const datosDesenvueltos = this.unwrapDemograficoData(dataRaw);
          let datosTransformados = transformAfiliacionSaludTabla(datosDesenvueltos);
          
          console.log('[SECCION29-AFILIACION] ✅ Datos cargados del backend (100% sin lógica frontend):', datosTransformados);
          
          // 4. Guardar en state CON PREFIJO y SIN PREFIJO (fallback)
          if (datosTransformados.length > 0) {
            const prefijo = this.obtenerPrefijoGrupo();
            const tablaKey = prefijo ? `afiliacionSaludTabla${prefijo}` : 'afiliacionSaludTabla';
            
            this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
            // También guardar sin prefijo para fallback
            this.projectFacade.setField(this.seccionId, null, 'afiliacionSaludTabla', datosTransformados);
            
            this.cdRef.markForCheck();
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

    // ✅ CARGAR datos de afiliación del backend (tabla de solo lectura)
    this.cargarAfiliacionDelBackend();

    // Ensure paragraph fields exist so editor shows current value (empty string if not set)
    ['textoNatalidadCP1', 'textoNatalidadCP2', 'textoMorbilidadCP', 'textoAfiliacionSalud'].forEach(field => {
      const current = this.projectFacade.selectField(this.seccionId, null, field)();
      if (current === undefined || current === null) {
        this.onFieldChange(field, '');
      }
    });

    // Initialize title and fuente fields if missing so they are editable
    const keys = [
      ['tituloNatalidadMortalidad', 'fuenteNatalidadMortalidad'],
      ['tituloMorbilidad', 'fuenteMorbilidad'],
      ['tituloAfiliacionSalud', 'fuenteAfiliacionSalud']
    ];

    keys.forEach(([tituloKey, fuenteKey]) => {
      const t = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
      const f = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
      if (t === undefined || t === null) this.onFieldChange(tituloKey, '');
      if (f === undefined || f === null) this.onFieldChange(fuenteKey, '');
    });
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
    noInicializarDesdeEstructura: true
  };

  readonly morbilidadConfig: TableConfig = {
    tablaKey: 'morbilidadCpTabla',
    totalKey: 'grupo',
    campoTotal: 'casos',
    camposParaCalcular: ['casos'],
    calcularPorcentajes: false,
    noInicializarDesdeEstructura: true
  };

  readonly afiliacionConfig: TableConfig = {
    tablaKey: 'afiliacionSaludTabla',
    totalKey: '',                  // ✅ Sin fila de total (datos del backend)
    campoTotal: '',                // ✅ Sin cálculo total
    campoPorcentaje: '',           // ✅ Sin cálculo de porcentaje
    calcularPorcentajes: false,    // ✅ No calcular (viene del backend)
    camposParaCalcular: ['casos'],
    noInicializarDesdeEstructura: true,
    permiteAgregarFilas: false,    // ✅ Solo lectura - no agregar
    permiteEliminarFilas: false    // ✅ Solo lectura - no eliminar
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
    { field: 'porcentaje', label: SECCION29_TEMPLATES.columnPorcentajeLabel, type: 'text' as const, readonly: true }
  ];

  actualizarTexto(field: string, valor: string) {
    this.onFieldChange(field, valor);
  }

  onTablaUpdated(tablaKey: string, tabla: any[]) {
    // ✅ PATRÓN SECCION 28: Crear nuevas referencias para forzar cambio de referencia en binding
    const tablaKeyBase = tablaKey.replace(/Grupo\d+$/, ''); // Remover sufijo de grupo para tener la clave base
    
    this.datos[tablaKey] = [...tabla]; // Nueva referencia con spread
    this.datos[tablaKeyBase] = [...tabla]; // Nueva referencia en clave base también
    
    this.onFieldChange(tablaKey, tabla, { refresh: false });
    if (tablaKeyBase !== tablaKey) {
      this.onFieldChange(tablaKeyBase, tabla, { refresh: false });
    }
    
    this.cdRef.detectChanges(); // ✅ Forzar detección de cambios inmediatamente
  }

  override onFotografiasChange(fotografias: any[]) {
    super.onFotografiasChange(fotografias);
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
