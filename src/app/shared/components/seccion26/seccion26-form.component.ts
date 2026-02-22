import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { SECCION26_TEMPLATES, transformAbastecimientoAguaDesdeDemograficos, transformSaneamientoDesdeDemograficos, transformCoberturaElectricaDesdeDemograficos, transformCombustiblesCocinarDesdeDemograficos, unwrapDemograficoData } from './seccion26-constants';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, ParagraphEditorComponent, ImageUploadComponent, DynamicTableComponent],
  selector: 'app-seccion26-form',
  templateUrl: './seccion26-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion26FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.5';
  @Input() override modoFormulario: boolean = false;

  // ✅ enable reactive signal sync (UNICA VERDAD)
  override useReactiveSync: boolean = true;

  // ✅ PATRÓN UNICA_VERDAD: fotosCacheSignal que combina todos los grupos de fotos
  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const grupo = this.obtenerPrefijo();
    // Cargar fotos de Desechos
    const fotosDesechos = this.imageService.loadImages(this.seccionId, this.photoPrefixSignalDesechos(), grupo);
    // Cargar fotos de Electricidad
    const fotosElectricidad = this.imageService.loadImages(this.seccionId, this.photoPrefixSignalElectricidad(), grupo);
    // Cargar fotos de Cocinar
    const fotosCocinar = this.imageService.loadImages(this.seccionId, this.photoPrefixSignalCocinar(), grupo);
    return [...fotosDesechos, ...fotosElectricidad, ...fotosCocinar];
  });

  // ✅ Signals individuales para cada grupo de fotos (para usar en el form)
  readonly fotosDesechosSignal: Signal<FotoItem[]> = computed(() => {
    return this.imageService.loadImages(this.seccionId, this.photoPrefixSignalDesechos(), this.obtenerPrefijo());
  });

  readonly fotosElectricidadSignal: Signal<FotoItem[]> = computed(() => {
    return this.imageService.loadImages(this.seccionId, this.photoPrefixSignalElectricidad(), this.obtenerPrefijo());
  });

  readonly fotosCocinarSignal: Signal<FotoItem[]> = computed(() => {
    return this.imageService.loadImages(this.seccionId, this.photoPrefixSignalCocinar(), this.obtenerPrefijo());
  });

  // ✅ Exportar TEMPLATES para el template
  readonly SECCION26_TEMPLATES = SECCION26_TEMPLATES;

  // ✅ Inyección de GlobalNumberingService
  private globalNumberingService = inject(GlobalNumberingService);

  // ✅ PHOTO_PREFIX Signals dinámicos (solo base, sin grupo - el grupo se agrega en onFotografiasChange)
  readonly photoPrefixSignalDesechos: Signal<string> = computed(() => {
    return 'fotografiaDesechosSolidosAISI';
  });

  readonly photoPrefixSignalElectricidad: Signal<string> = computed(() => {
    return 'fotografiaElectricidadAISI';
  });

  readonly photoPrefixSignalCocinar: Signal<string> = computed(() => {
    return 'fotografiaEnergiaCocinarAISI';
  });

  // ✅ Global Table Numbers Signals
  readonly globalTableNumberSignalAbastecimiento: Signal<string> = computed(() => {
    return this.globalNumberingService.getGlobalTableNumber(this.seccionId, 0);
  });

  readonly globalTableNumberSignalSaneamiento: Signal<string> = computed(() => {
    return this.globalNumberingService.getGlobalTableNumber(this.seccionId, 1);
  });

  readonly globalTableNumberSignalCobertura: Signal<string> = computed(() => {
    return this.globalNumberingService.getGlobalTableNumber(this.seccionId, 2);
  });

  readonly globalTableNumberSignalCombustibles: Signal<string> = computed(() => {
    return this.globalNumberingService.getGlobalTableNumber(this.seccionId, 3);
  });

  fotografiasDesechosFormMulti: FotoItem[] = [];
  fotografiasElectricidadFormMulti: FotoItem[] = [];
  fotografiasCocinarFormMulti: FotoItem[] = [];

  // ✅ FormDataSignal local
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  // ✅ Helper para obtener prefijo de grupo
  // Se expone como public para poder invocarlo desde la plantilla
  public obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  // ✅ Helpers para obtener keys con prefijo (CRÍTICO para sync)
  getKeyTextoIntro(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoIntroServiciosBasicosAISI${prefijo}` : 'textoIntroServiciosBasicosAISI';
  }

  getKeyTextoServiciosAgua(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoServiciosAguaAISI${prefijo}` : 'textoServiciosAguaAISI';
  }

  getKeyTextoDesague(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoDesagueCP${prefijo}` : 'textoDesagueCP';
  }

  getKeyTextoDesechos(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoDesechosSolidosCP${prefijo}` : 'textoDesechosSolidosCP';
  }

  getKeyTextoElectricidad(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoElectricidadCP${prefijo}` : 'textoElectricidadCP';
  }

  getKeyTextoEnergiaCocinar(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `textoEnergiaCocinarCP${prefijo}` : 'textoEnergiaCocinarCP';
  }

  // ✅ Tablas con noInicializarDesdeEstructura: true - PATRÓN SOLO LECTURA
  abastecimientoConfig: TableConfig = {
    tablaKey: 'abastecimientoAguaCpTabla',
    totalKey: '',
    campoTotal: '',
    campoPorcentaje: '',
    calcularPorcentajes: false,
    camposParaCalcular: ['casos'],
    noInicializarDesdeEstructura: true,
    permiteAgregarFilas: true,
    permiteEliminarFilas: true
  };

  saneamientoConfig: TableConfig = {
    tablaKey: 'saneamientoCpTabla',
    totalKey: '',
    campoTotal: '',
    campoPorcentaje: '',
    calcularPorcentajes: false,
    camposParaCalcular: ['casos'],
    noInicializarDesdeEstructura: true,
    permiteAgregarFilas: true,
    permiteEliminarFilas: true
  };

  coberturaConfig: TableConfig = {
    tablaKey: 'coberturaElectricaCpTabla',
    totalKey: '',
    campoTotal: '',
    campoPorcentaje: '',
    calcularPorcentajes: false,
    camposParaCalcular: ['casos'],
    noInicializarDesdeEstructura: true,
    permiteAgregarFilas: true,
    permiteEliminarFilas: true
  };

  combustiblesConfig: TableConfig = {
    tablaKey: 'combustiblesCocinarCpTabla',
    totalKey: '',
    campoTotal: '',
    campoPorcentaje: '',
    calcularPorcentajes: false,
    camposParaCalcular: ['casos'],
    noInicializarDesdeEstructura: true,
    permiteAgregarFilas: true,
    permiteEliminarFilas: true
  };

  // ✅ Campos con prefijos dinámicos
  readonly cuadroTituloAbastecimientoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `cuadroTituloAbastecimiento${prefijo}` : 'cuadroTituloAbastecimiento';
    return this.projectFacade.selectField(this.seccionId, null, campoKey)() ?? '';
  });

  readonly cuadroFuenteAbastecimientoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `cuadroFuenteAbastecimiento${prefijo}` : 'cuadroFuenteAbastecimiento';
    return this.projectFacade.selectField(this.seccionId, null, campoKey)() ?? '';
  });

  readonly cuadroTituloSaneamientoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `cuadroTituloSaneamiento${prefijo}` : 'cuadroTituloSaneamiento';
    return this.projectFacade.selectField(this.seccionId, null, campoKey)() ?? '';
  });

  readonly cuadroFuenteSaneamientoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `cuadroFuenteSaneamiento${prefijo}` : 'cuadroFuenteSaneamiento';
    return this.projectFacade.selectField(this.seccionId, null, campoKey)() ?? '';
  });

  readonly cuadroTituloCoberturaSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `cuadroTituloCobertura${prefijo}` : 'cuadroTituloCobertura';
    return this.projectFacade.selectField(this.seccionId, null, campoKey)() ?? '';
  });

  readonly cuadroFuenteCoberturaSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `cuadroFuenteCobertura${prefijo}` : 'cuadroFuenteCobertura';
    return this.projectFacade.selectField(this.seccionId, null, campoKey)() ?? '';
  });

  readonly cuadroTituloCombustiblesSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `cuadroTituloCombustibles${prefijo}` : 'cuadroTituloCombustibles';
    return this.projectFacade.selectField(this.seccionId, null, campoKey)() ?? '';
  });

  readonly cuadroFuenteCombustiblesSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `cuadroFuenteCombustibles${prefijo}` : 'cuadroFuenteCombustibles';
    return this.projectFacade.selectField(this.seccionId, null, campoKey)() ?? '';
  });

  // ✅ Tablas con prefijos
  readonly abastecimientoSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `abastecimientoAguaCpTabla${prefijo}` : 'abastecimientoAguaCpTabla';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
           this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  readonly saneamientoSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `saneamientoCpTabla${prefijo}` : 'saneamientoCpTabla';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
           this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  readonly coberturaSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `coberturaElectricaCpTabla${prefijo}` : 'coberturaElectricaCpTabla';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
           this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  readonly combustiblesSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `combustiblesCocinarCpTabla${prefijo}` : 'combustiblesCocinarCpTabla';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
           this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  // ✅ Texto signals (MODO IDEAL - computed reactivos, no IIFE)
  readonly textoIntroSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoIntroServiciosBasicosAISI${prefijo}` : 'textoIntroServiciosBasicosAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    return this.obtenerTextoIntroServiciosBasicosAISI();
  });

  readonly textoServiciosAguaSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoServiciosAguaAISI${prefijo}` : 'textoServiciosAguaAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    return this.obtenerTextoServiciosAguaAISI();
  });

  readonly textoDesagueSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoDesagueCP${prefijo}` : 'textoDesagueCP';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    return this.obtenerTextoDesagueCP();
  });

  readonly textoDesechosSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoDesechosSolidosCP${prefijo}` : 'textoDesechosSolidosCP';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    return this.obtenerTextoDesechosSolidosCP();
  });

  readonly textoElectricidadSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoElectricidadCP${prefijo}` : `textoElectricidadCP`;
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    return this.obtenerTextoElectricidadCP();
  });

  readonly textoCocinarSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoEnergiaCocinarCP${prefijo}` : 'textoEnergiaCocinarCP';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    return this.obtenerTextoEnergiaCocinarCP();
  });

  readonly viewModel = computed(() => ({
    textoIntro: this.textoIntroSignal(),
    textoServiciosAgua: this.textoServiciosAguaSignal(),
    textoDesague: this.textoDesagueSignal(),
    textoDesechos: this.textoDesechosSignal(),
    textoElectricidad: this.textoElectricidadSignal(),
    textoCocinar: this.textoCocinarSignal(),
    cuadroTituloAbastecimiento: this.cuadroTituloAbastecimientoSignal(),
    cuadroFuenteAbastecimiento: this.cuadroFuenteAbastecimientoSignal(),
    cuadroTituloSaneamiento: this.cuadroTituloSaneamientoSignal(),
    cuadroFuenteSaneamiento: this.cuadroFuenteSaneamientoSignal(),
    cuadroTituloCobertura: this.cuadroTituloCoberturaSignal(),
    cuadroFuenteCobertura: this.cuadroFuenteCoberturaSignal(),
    cuadroTituloCombustibles: this.cuadroTituloCombustiblesSignal(),
    cuadroFuenteCombustibles: this.cuadroFuenteCombustiblesSignal(),
    abastecimiento: this.abastecimientoSignal(),
    saneamiento: this.saneamientoSignal(),
    cobertura: this.coberturaSignal(),
    combustibles: this.combustiblesSignal(),
    // Fotos con patron correcto
    fotosDesechos: (() => {
      const fotos: FotoItem[] = [];
      const basePrefix = 'fotografiaDesechosSolidosAISI';
      const groupPrefix = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      for (let i = 1; i <= 10; i++) {
        const imgKey = groupPrefix ? `${basePrefix}${i}Imagen${groupPrefix}` : `${basePrefix}${i}Imagen`;
        const titKey = groupPrefix ? `${basePrefix}${i}Titulo${groupPrefix}` : `${basePrefix}${i}Titulo`;
        const fuenteKey = groupPrefix ? `${basePrefix}${i}Fuente${groupPrefix}` : `${basePrefix}${i}Fuente`;
        const titulo = this.projectFacade.selectField(this.seccionId, null, titKey)();
        const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
        const imagen = this.projectFacade.selectField(this.seccionId, null, imgKey)();
        if (imagen) fotos.push({ titulo: titulo || `Foto ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
      }
      return fotos;
    })(),
    fotosElectricidad: (() => {
      const fotos: FotoItem[] = [];
      const basePrefix = 'fotografiaElectricidadAISI';
      const groupPrefix = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      for (let i = 1; i <= 10; i++) {
        const imgKey = groupPrefix ? `${basePrefix}${i}Imagen${groupPrefix}` : `${basePrefix}${i}Imagen`;
        const titKey = groupPrefix ? `${basePrefix}${i}Titulo${groupPrefix}` : `${basePrefix}${i}Titulo`;
        const fuenteKey = groupPrefix ? `${basePrefix}${i}Fuente${groupPrefix}` : `${basePrefix}${i}Fuente`;
        const titulo = this.projectFacade.selectField(this.seccionId, null, titKey)();
        const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
        const imagen = this.projectFacade.selectField(this.seccionId, null, imgKey)();
        if (imagen) fotos.push({ titulo: titulo || `Foto ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
      }
      return fotos;
    })(),
    fotosCocinar: (() => {
      const fotos: FotoItem[] = [];
      const basePrefix = 'fotografiaEnergiaCocinarAISI';
      const groupPrefix = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      for (let i = 1; i <= 10; i++) {
        const imgKey = groupPrefix ? `${basePrefix}${i}Imagen${groupPrefix}` : `${basePrefix}${i}Imagen`;
        const titKey = groupPrefix ? `${basePrefix}${i}Titulo${groupPrefix}` : `${basePrefix}${i}Titulo`;
        const fuenteKey = groupPrefix ? `${basePrefix}${i}Fuente${groupPrefix}` : `${basePrefix}${i}Fuente`;
        const titulo = this.projectFacade.selectField(this.seccionId, null, titKey)();
        const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
        const imagen = this.projectFacade.selectField(this.seccionId, null, imgKey)();
        if (imagen) fotos.push({ titulo: titulo || `Foto ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
      }
      return fotos;
    })()
  }));

  // ✅ NUEVO: Signal para ubicación global (desde metadata)
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

  constructor(
    cdRef: ChangeDetectorRef, 
    injector: Injector,
    private backendApi: BackendApiService,
    private formChange: FormChangeService // used for Redis persistence
  ) {
    super(cdRef, injector);

    // simple effect to trigger change detection when data updates
    effect(() => {
      this.formDataSignal();
      // also touch table signals so template re-renders automatically
      this.abastecimientoSignal();
      this.saneamientoSignal();
      this.coberturaSignal();
      this.combustiblesSignal();
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.viewModel();
      this.actualizarFotografiasFormMulti();
      // ✅ PATRÓN UNICA_VERDAD: tocar fotosCacheSignal para recarga reactiva
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  /**
   * ✅ MÉTODOS DE CARGA DEL BACKEND
   * Cargan datos demográficos del backend para llenar las tablas
   */

  private inicializarTablasVacias(): void {
    const prefijo = this.obtenerPrefijo();
    
    // Inicializar cada tabla como array vacío
    const tablas = [
      'abastecimientoAguaCpTabla',
      'saneamientoCpTabla', 
      'coberturaElectricaCpTabla',
      'combustiblesCocinarCpTabla'
    ];
    
    for (const tablaKey of tablas) {
      const tablaKeyConPrefijo = prefijo ? `${tablaKey}${prefijo}` : tablaKey;
      this.projectFacade.setField(this.seccionId, null, tablaKeyConPrefijo, []);
      this.projectFacade.setField(this.seccionId, null, tablaKey, []);
    }
  }

  private cargarDatosDelBackend(): void {
    // Obtener los códigos de centros poblados del grupo actual
    const codigosArray = this.getCodigosCentrosPobladosAISI();
    const codigos = [...codigosArray]; // Copia mutable

    if (!codigos || codigos.length === 0) {
      console.log('[SECCION26] ⚠️ No hay centros poblados AISI para cargar datos');
      return;
    }

    // ✅ 1. CARGAR DATOS DE ABASTECIMIENTO DE AGUA (viviendas -> usa sp_abastecimiento_agua_por_cpp)
    this.backendApi.postAbastecimientoAguaViviendas(codigos).subscribe({
      next: (response: any) => {
        const datosTransformados = transformAbastecimientoAguaDesdeDemograficos(
          unwrapDemograficoData(response?.data || [])
        );
        
        const prefijo = this.obtenerPrefijo();
        const tablaKey = prefijo ? `abastecimientoAguaCpTabla${prefijo}` : 'abastecimientoAguaCpTabla';
        this.projectFacade.setTableData(this.seccionId, null, tablaKey, datosTransformados);
        this.projectFacade.setTableData(this.seccionId, null, 'abastecimientoAguaCpTabla', datosTransformados);
      },
      error: (error: any) => console.error('[SECCION26] Error cargando abastecimiento de agua:', error)
    });

    // ✅ 2. CARGAR DATOS DE SANEAMIENTO DETALLADO
    this.backendApi.postSaneamientoDetallado(codigos).subscribe({
      next: (response: any) => {
        const datosTransformados = transformSaneamientoDesdeDemograficos(
          unwrapDemograficoData(response?.data || [])
        );
        
        const prefijo = this.obtenerPrefijo();
        const tablaKey = prefijo ? `saneamientoCpTabla${prefijo}` : 'saneamientoCpTabla';
        this.projectFacade.setTableData(this.seccionId, null, tablaKey, datosTransformados);
        this.projectFacade.setTableData(this.seccionId, null, 'saneamientoCpTabla', datosTransformados);
      },
      error: (error: any) => console.error('[SECCION26] Error cargando saneamiento:', error)
    });

    // ✅ 3. CARGAR DATOS DE COBERTURA ELÉCTRICA
    this.backendApi.postAlumbradoPorCpp(codigos).subscribe({
      next: (response: any) => {
        const datosTransformados = transformCoberturaElectricaDesdeDemograficos(
          unwrapDemograficoData(response?.data || [])
        );
        
        const prefijo = this.obtenerPrefijo();
        const tablaKey = prefijo ? `coberturaElectricaCpTabla${prefijo}` : 'coberturaElectricaCpTabla';
        this.projectFacade.setTableData(this.seccionId, null, tablaKey, datosTransformados);
        this.projectFacade.setTableData(this.seccionId, null, 'coberturaElectricaCpTabla', datosTransformados);
      },
      error: (error: any) => console.error('[SECCION26] Error cargando cobertura eléctrica:', error)
    });

    // ✅ 4. CARGAR DATOS DE COMBUSTIBLES PARA COCINAR
    this.backendApi.postCombustiblesCocinaPorCpp(codigos).subscribe({
      next: (response: any) => {
        const datosTransformados = transformCombustiblesCocinarDesdeDemograficos(
          unwrapDemograficoData(response?.data || [])
        );
        
        const prefijo = this.obtenerPrefijo();
        const tablaKey = prefijo ? `combustiblesCocinarCpTabla${prefijo}` : 'combustiblesCocinarCpTabla';
        this.projectFacade.setTableData(this.seccionId, null, tablaKey, datosTransformados);
        this.projectFacade.setTableData(this.seccionId, null, 'combustiblesCocinarCpTabla', datosTransformados);
      },
      error: (error: any) => console.error('[SECCION26] Error cargando combustibles:', error)
    });
  }

  protected override onInitCustom(): void {
    const prefijo = this.obtenerPrefijo();
    const tablaAbasKey = prefijo ? `abastecimientoAguaCpTabla${prefijo}` : 'abastecimientoAguaCpTabla';
    const existing = this.formDataSignal()[tablaAbasKey];

    // Solo inicializar y cargar si no hay datos persistidos
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      // 1. Inicializar tablas vacías y cargar backend
      this.inicializarTablasVacias();
      this.cargarDatosDelBackend();
    } else {
      console.log('[SECCION26] datos persistidos encontrados, no se cargan del backend');
    }

    // ✅ 3. AUTO-LLENAR centroPobladoAISI con el nombre del grupo AISI actual
    const centroPobladoAISI = this.obtenerCentroPobladoAISI();
    const campoConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
    
    // Actualizar tanto el objeto local como el store
    this.datos[campoConPrefijo] = centroPobladoAISI;
    this.datos['centroPobladoAISI'] = centroPobladoAISI;
    this.projectFacade.setField(this.seccionId, null, campoConPrefijo, centroPobladoAISI);
    this.onFieldChange(campoConPrefijo, centroPobladoAISI, { refresh: false });
    
    this.cargarFotografias();
    
    // ✅ Inicializar campos con prefijos usando PrefijoHelper
    const keys = [
      'textoIntroServiciosBasicosAISI', 'textoServiciosAguaAISI', 'textoDesagueCP', 'textoDesechosSolidosCP', 'textoElectricidadCP', 'textoEnergiaCocinarCP',
      'cuadroTituloAbastecimiento', 'cuadroFuenteAbastecimiento', 'cuadroTituloSaneamiento', 'cuadroFuenteSaneamiento', 
      'cuadroTituloCobertura', 'cuadroFuenteCobertura', 'cuadroTituloCombustibles', 'cuadroFuenteCombustibles'
    ];
    try {
      for (const k of keys) {
        const prefijoKey = this.obtenerPrefijo();
        const prefixedKey = prefijoKey ? `${k}${prefijoKey}` : k;
        const val = this.projectFacade.selectField(this.seccionId, null, prefixedKey)();
        if (val === undefined || val === null) {
          this.projectFacade.setField(this.seccionId, null, prefixedKey, '');
        }
      }
    } catch (e) {}
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  // ✅ Private generators - these read from cache first, then formDataSignal  
  private generarTextoIntroDefault(): string {
    const viviendas = this.getViviendasOcupadasPresentes();
    return `Los servicios básicos nos indican el nivel de desarrollo de una comunidad y un saneamiento deficiente va asociado a la transmisión de enfermedades como el cólera, la diarrea, la disentería, la hepatitis A, la fiebre tifoidea y la poliomielitis, y agrava el retraso del crecimiento.\n\nEn 2010, la Asamblea General de las Naciones Unidas reconoció que el acceso al agua potable salubre y limpia, y al saneamiento es un derecho humano y pidió que se realizaran esfuerzos internacionales para ayudar a los países a proporcionar agua potable e instalaciones de saneamiento salubres, limpias, accesibles y asequibles. Los servicios básicos serán descritos a continuación tomando como referencia al total de viviendas ocupadas presentes (${viviendas}), tal como realiza el Censo Nacional 2017.`;
  }

  private generarTextoServiciosAguaDefault(): string {
    const centro = this.datos['centroPobladoAISI'] || this.formDataSignal()?.['centroPobladoAISI'] || this.obtenerNombreCentroPobladoActual() || '____';
    const tabla = this.abastecimientoSignal() || [];
    const cuadro = this.globalTableNumberSignalAbastecimiento();
    const tablaCon = TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
    const dentro = tablaCon.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('dentro'))?.porcentaje?.value || '____';
    const fuera = tablaCon.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('fuera'))?.porcentaje?.value || '____';
    return `Respecto al servicio de agua para consumo humano en el CP ${centro}, se cuenta con cobertura de dicho recurso en las viviendas. Es así que, según los Censos Nacionales 2017, un ${dentro} de las viviendas cuenta con red pública dentro de la misma. El porcentaje restante (${fuera}) consta de red pública fuera de la vivienda, pero dentro de la edificación.`;
  }

  private generarTextoDesagueDefault(): string {
    const centro = this.datos['centroPobladoAISI'] || this.formDataSignal()?.['centroPobladoAISI'] || this.obtenerNombreCentroPobladoActual() || '____';
    const cuadro = this.globalTableNumberSignalSaneamiento();
    const tabla = TablePercentageHelper.calcularPorcentajesSimple(this.saneamientoSignal() || [], cuadro);
    const dentro = tabla.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('dentro'))?.porcentaje?.value || '____';
    const pozo = tabla.find((i:any)=> i.categoria && (i.categoria.toString().toLowerCase().includes('pozo') || i.categoria.toString().toLowerCase().includes('tanque') || i.categoria.toString().toLowerCase().includes('biodigestor')))?.porcentaje?.value || '____';
    const p1 = `Respecto al servicio de saneamiento en las viviendas de la capital distrital de ${centro}, se cuenta con una amplia cobertura de dicho servicio. Es así que, según los Censos Nacionales 2017, un ${dentro} de las viviendas cuenta con red pública de desagüe dentro de las mismas. Adicionalmente, un ${pozo} cuenta con pozo séptico, tanque séptico o biodigestor.`;
    const p2 = `Por otra parte, se hallan otras categorías con porcentajes menores: red pública de desagüe fuera de la vivienda, pero dentro de la edificación; letrina (con tratamiento); pozo ciego o negro; y campo abierto o al aire libre, todas las cuales representan un 2,04 % cada una.`;
    return `${p1}\n\n${p2}`;
  }

  private generarTextoDesechosDefault(): string {
    const distrito = this.obtenerNombreDistritoActual() || '____';
    const centro = this.datos['centroPobladoAISI'] || this.formDataSignal()?.['centroPobladoAISI'] || this.obtenerNombreCentroPobladoActual() || '____';
    const p1 = `La gestión de los desechos sólidos está a cargo de la Municipalidad Distrital de ${distrito}, aunque según los entrevistados, la recolección se realiza de manera mensual, en promedio. En ese sentido, no existe una fecha establecida en la que la municipalidad gestione los desechos sólidos. Adicional a ello, las limitaciones en cuanto a infraestructura adecuada para el tratamiento de desechos sólidos generan algunos retos en la gestión eficiente de los mismos.`;
    const p2 = `Cuando los desechos sólidos son recolectados, estos son trasladados a un botadero cercano a la capital distrital, donde se realiza su disposición final. La falta de un sistema más avanzado para el tratamiento de los residuos, como plantas de reciclaje o de tratamiento, dificulta el manejo integral de los desechos y plantea preocupaciones ambientales a largo plazo. Además, la comunidad enfrenta desafíos derivados de la acumulación de basura en ciertos puntos, especialmente en épocas en que la recolección es menos frecuente. Ante ello, la misma población acude al botadero para disponer sus residuos sólidos, puesto que está prohibida la incineración. Cabe mencionar que sí existen puntos dentro del CP ${centro} en donde la población puede disponer sus desechos plásticos como botellas, aunque estos tampoco son recolectados frecuentemente por el personal de la municipalidad.`;
    return `${p1}\n\n${p2}`;
  }

  private generarTextoElectricidadDefault(): string {
    const cuadro = this.globalTableNumberSignalCobertura();
    const tabla = TablePercentageHelper.calcularPorcentajesSimple(this.coberturaSignal()||[], cuadro);
    const si = tabla.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('si'))?.porcentaje?.value || '____';
    const no = tabla.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('no'))?.porcentaje?.value || '____';
    return `Se puede apreciar una amplia cobertura de alumbrado eléctrico en las viviendas del centro poblado en cuestión. Según los Censos Nacionales 2017, se cuenta con los siguientes datos: el ${si} de las viviendas cuenta con alumbrado eléctrico, mientras que el ${no} restante no tiene el referido servicio.`;
  }

  private generarTextoEnergiaCocinarDefault(): string {
    const centro = this.datos['centroPobladoAISI'] || this.formDataSignal()?.['centroPobladoAISI'] || this.obtenerNombreCentroPobladoActual() || '____';
    const cuadro = this.globalTableNumberSignalCombustibles();
    const tabla = TablePercentageHelper.calcularPorcentajesSimple(this.combustiblesSignal()||[], cuadro);
    const lena = tabla.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('leña'))?.porcentaje?.value || '____';
    const gas = tabla.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('gas'))?.porcentaje?.value || '____';
    const bosta = tabla.find((i:any)=> i.categoria && (i.categoria.toString().toLowerCase().includes('bosta') || i.categoria.toString().toLowerCase().includes('estiércol')))?.porcentaje?.value || '____';
    const electr = tabla.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('electricidad'))?.porcentaje?.value || '____';
    return `Según los Censos Nacionales 2017, de un total de ${this.getTotalCombustiblesCocinar()} hogares en el CP ${centro}, se obtiene que un ${lena} emplea la leña. En menor medida, se emplean otros combustibles como el gas (balón GLP) en un ${gas}, la bosta o estiércol en un ${bosta} y la electricidad con un ${electr}. Cabe mencionar que los hogares pueden emplear más de un tipo de combustible para la cocción de los alimentos.`;
  }

  // ✅ Public getters - call generator once if no manual value
  obtenerTextoIntroServiciosBasicosAISI(): string {
    return this.generarTextoIntroDefault();
  }

  obtenerTextoServiciosAguaAISI(): string {
    return this.generarTextoServiciosAguaDefault();
  }

  obtenerTextoDesagueCP(): string {
    return this.generarTextoDesagueDefault();
  }

  obtenerTextoDesechosSolidosCP(): string {
    return this.generarTextoDesechosDefault();
  }

  obtenerTextoElectricidadCP(): string {
    return this.generarTextoElectricidadDefault();
  }

  obtenerTextoEnergiaCocinarCP(): string {
    return this.generarTextoEnergiaCocinarDefault();
  }

  private getViviendasOcupadasPresentes(): string {
    const data = this.formDataSignal();
    if (!data?.['condicionOcupacionAISI'] || !Array.isArray(data['condicionOcupacionAISI'])) {
      return '____';
    }
    const item = data['condicionOcupacionAISI'].find((item: any) => 
      item.categoria?.toLowerCase().includes('ocupado') || item.categoria?.toLowerCase().includes('ocupada')
    );
    return item?.casos?.toString() || '____';
  }

  // ✅ Table update handlers con prefijos
  onAbastecimientoAguaTableUpdated(updated?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `abastecimientoAguaCpTabla${prefijo}` : 'abastecimientoAguaCpTabla';
    this.genericTablePersist(tablaKey, updated);
  }

  onAbastecimientoAguaFieldChange(index: number, field: string, value: any): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `abastecimientoAguaCpTabla${prefijo}` : 'abastecimientoAguaCpTabla';
    this.handleTableFieldChange(tablaKey, index, field, value);
  }

  onSaneamientoFieldChange(index: number, field: string, value: any): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `saneamientoCpTabla${prefijo}` : 'saneamientoCpTabla';
    this.handleTableFieldChange(tablaKey, index, field, value);
  }

  onCoberturaElectricaFieldChange(index: number, field: string, value: any): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `coberturaElectricaCpTabla${prefijo}` : 'coberturaElectricaCpTabla';
    this.handleTableFieldChange(tablaKey, index, field, value);
  }

  onCombustiblesCocinarFieldChange(index: number, field: string, value: any): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `combustiblesCocinarCpTabla${prefijo}` : 'combustiblesCocinarCpTabla';
    this.handleTableFieldChange(tablaKey, index, field, value);
  }

  onSaneamientoTableUpdated(updated?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `saneamientoCpTabla${prefijo}` : 'saneamientoCpTabla';
    this.genericTablePersist(tablaKey, updated);
  }

  onCoberturaElectricaTableUpdated(updated?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `coberturaElectricaCpTabla${prefijo}` : 'coberturaElectricaCpTabla';
    this.genericTablePersist(tablaKey, updated);
  }

  onCombustiblesCocinarTableUpdated(updated?: any[]): void {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `combustiblesCocinarCpTabla${prefijo}` : 'combustiblesCocinarCpTabla';
    this.genericTablePersist(tablaKey, updated);
  }

  private handleTableFieldChange(tablaKey: string, index: number, field: string, value: any) {
    // working directly against the live table stored in projectFacade
    const formData = this.formDataSignal();
    const tabla = formData[tablaKey] ? [...formData[tablaKey]] : [];
    if (!Array.isArray(tabla) || index < 0 || index >= tabla.length) {
      return;
    }

    tabla[index][field] = value;

    // If 'casos' changed, recalculate percentages for the table
    if (field === 'casos') {
      // ✅ Separar filas normales de la fila Total
      const filasNormales = tabla.filter((item: any) => !item.categoria || !item.categoria.toString().toLowerCase().includes('total'));
      const filaTotal = tabla.find((item: any) => item.categoria && item.categoria.toString().toLowerCase().includes('total'));
      
      const total = filasNormales.reduce((sum: number, item: any) => sum + (Number(item.casos?.value || item.casos) || 0), 0);
      
      if (total > 0) {
        // Calcular porcentajes para filas normales
        filasNormales.forEach((item: any) => {
          const casos = Number(item.casos?.value || item.casos) || 0;
          const formatted = (casos / total * 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
          item.porcentaje = { value: formatted, isCalculated: true };
        });
        
        // Crear o actualizar fila Total
        const totalObj = { categoria: 'Total', casos: { value: total, isCalculated: true }, porcentaje: { value: '100,00 %', isCalculated: true } };
        
        // ✅ REORDENAR: filas normales primero, Total al final
        if (filaTotal) {
          Object.assign(filaTotal, totalObj);
          tabla.splice(0, tabla.length, ...filasNormales, filaTotal);
        } else {
          tabla.splice(0, tabla.length, ...filasNormales, totalObj);
        }
      } else {
        filasNormales.forEach((item: any) => {
          item.porcentaje = { value: '0,00 %', isCalculated: true };
        });
        // ✅ REORDENAR también cuando total es 0
        if (filaTotal) {
          Object.assign(filaTotal, { categoria: 'Total', casos: { value: 0, isCalculated: true }, porcentaje: { value: '0,00 %', isCalculated: true } });
          tabla.splice(0, tabla.length, ...filasNormales, filaTotal);
        } else {
          tabla.splice(0, tabla.length, ...filasNormales);
        }
      }
    } else {
      // ✅ Si no es 'casos', también reordenar para mantener Total al final
      const filasNormales = tabla.filter((item: any) => !item.categoria || !item.categoria.toString().toLowerCase().includes('total'));
      const filaTotal = tabla.find((item: any) => item.categoria && item.categoria.toString().toLowerCase().includes('total'));
      if (filaTotal) {
        tabla.splice(0, tabla.length, ...filasNormales, filaTotal);
      }
    }

// Write back to project state (both prefixed and unprefixed keys)
    const prefijo = this.obtenerPrefijo();
    const claveConPrefijo = tablaKey;
    const claveSinPrefijo = prefijo ? tablaKey.replace(prefijo, '') : tablaKey;

    try {
      this.projectFacade.setField(this.seccionId, null, claveConPrefijo, tabla);
      this.projectFacade.setField(this.seccionId, null, claveSinPrefijo, tabla);
    } catch (e) {}

    // persist to Redis via FormChangeService
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [claveConPrefijo]: tabla, [claveSinPrefijo]: tabla }, { notifySync: true });
    } catch (e) {}

    // let view update automatically through signals
    this.cdRef.markForCheck();
  }

  private genericTablePersist(tablaKey: string, updated?: any[]) {
    let tabla = updated ? [...updated] : (this.formDataSignal()[tablaKey] ? [...this.formDataSignal()[tablaKey]] : []);
    const prefijo = this.obtenerPrefijo();
    const claveConPrefijo = tablaKey;
    const claveSinPrefijo = prefijo ? tablaKey.replace(prefijo, '') : tablaKey;
    
    // ✅ CLON PROFUNDO para evitar compartir referencias
    tabla = JSON.parse(JSON.stringify(tabla));
    
    // ✅ REORDENAR: filas normales primero, Total al final
    const filasNormales = tabla.filter((item: any) => !item.categoria || !item.categoria.toString().toLowerCase().includes('total'));
    const filaTotal = tabla.find((item: any) => item.categoria && item.categoria.toString().toLowerCase().includes('total'));
    
    // Recalcular totales y porcentajes
    const total = filasNormales.reduce((sum: number, item: any) => sum + (Number(item.casos?.value || item.casos) || 0), 0);
    
    if (total > 0) {
      // Calcular porcentajes para filas normales
      filasNormales.forEach((item: any) => {
        const casos = Number(item.casos?.value || item.casos) || 0;
        const formatted = (casos / total * 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
        item.porcentaje = { value: formatted, isCalculated: true };
      });
      
      // Actualizar o agregar fila Total
      const totalObj = { categoria: 'Total', casos: { value: total, isCalculated: true }, porcentaje: { value: '100,00 %', isCalculated: true } };
      if (filaTotal) {
        Object.assign(filaTotal, totalObj);
        tabla = [...filasNormales, filaTotal];
      } else {
        tabla = [...filasNormales, totalObj];
      }
    } else {
      // Total es 0
      filasNormales.forEach((item: any) => {
        item.porcentaje = { value: '0,00 %', isCalculated: true };
      });
      if (filaTotal) {
        Object.assign(filaTotal, { categoria: 'Total', casos: { value: 0, isCalculated: true }, porcentaje: { value: '0,00 %', isCalculated: true } });
        tabla = [...filasNormales, filaTotal];
      } else {
        tabla = [...filasNormales];
      }
    }

    // ✅ Guardar en projectFacade (state interno)
    try {
      this.projectFacade.setField(this.seccionId, null, claveConPrefijo, tabla);
      this.projectFacade.setField(this.seccionId, null, claveSinPrefijo, tabla);
    } catch (e) {}

    // ✅ PERSISTIR EN REDIS (solo notifySync)
    try {
      this.formChange.persistFields(this.seccionId, 'table', { [claveConPrefijo]: tabla, [claveSinPrefijo]: tabla }, { notifySync: true });
    } catch (e) {}

    // mark for CD so form updates
    this.cdRef.markForCheck();
  }

  private getParrafoKeyForTabla(tablaKey: string): string | null {
    const prefijo = this.obtenerPrefijo();
    switch (tablaKey) {
      case 'abastecimientoAguaCpTabla': return prefijo ? `textoServiciosAguaAISI${prefijo}` : 'textoServiciosAguaAISI';
      case 'saneamientoCpTabla': return prefijo ? `textoDesagueCP${prefijo}` : 'textoDesagueCP';
      case 'coberturaElectricaCpTabla': return prefijo ? `textoElectricidadCP${prefijo}` : 'textoElectricidadCP';
      case 'combustiblesCocinarCpTabla': return prefijo ? `textoEnergiaCocinarCP${prefijo}` : 'textoEnergiaCocinarCP';
      default: return null;
    }
  }

  getTotalAbastecimientoAgua(): number {
    const tabla = this.abastecimientoSignal() || [];
    return (tabla || []).filter((item:any) => !(item.categoria && item.categoria.toString().toLowerCase().includes('total'))).reduce((s:number,i:any)=>s + (Number(i.casos)||0),0);
  }

  getTotalSaneamiento(): number {
    const tabla = this.saneamientoSignal() || [];
    return (tabla || []).filter((item:any) => !(item.categoria && item.categoria.toString().toLowerCase().includes('total'))).reduce((s:number,i:any)=>s + (Number(i.casos)||0),0);
  }

  getTotalCoberturaElectrica(): number {
    const tabla = this.coberturaSignal() || [];
    return (tabla || []).filter((item:any) => !(item.categoria && item.categoria.toString().toLowerCase().includes('total'))).reduce((s:number,i:any)=>s + (Number(i.casos)||0),0);
  }

  getTotalCombustiblesCocinar(): number {
    const tabla = this.combustiblesSignal() || [];
    return (tabla || []).filter((item:any) => !(item.nombre && item.nombre.toString().toLowerCase().includes('total'))).reduce((s:number,i:any)=>s + (Number(i.casos)||0),0);
  }

  // ✅ PATRÓN SECCIÓN 24: Override de onFotografiasChange para persistencia correcta
  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    const prefix = customPrefix || '';
    const groupPrefix = this.obtenerPrefijo();
    const updates: Record<string, any> = {};
    
    // Paso 1: Limpiar slots anteriores (hasta 10)
    for (let i = 1; i <= 10; i++) {
      const imgKey = groupPrefix ? `${prefix}${i}Imagen${groupPrefix}` : `${prefix}${i}Imagen`;
      const titKey = groupPrefix ? `${prefix}${i}Titulo${groupPrefix}` : `${prefix}${i}Titulo`;
      const fuenteKey = groupPrefix ? `${prefix}${i}Fuente${groupPrefix}` : `${prefix}${i}Fuente`;
      updates[imgKey] = '';
      updates[titKey] = '';
      updates[fuenteKey] = '';
    }
    
    // Paso 2: Guardar nuevas fotos
    fotografias.forEach((foto, index) => {
      if (foto.imagen) {
        const idx = index + 1;
        const imgKey = groupPrefix ? `${prefix}${idx}Imagen${groupPrefix}` : `${prefix}${idx}Imagen`;
        const titKey = groupPrefix ? `${prefix}${idx}Titulo${groupPrefix}` : `${prefix}${idx}Titulo`;
        const fuenteKey = groupPrefix ? `${prefix}${idx}Fuente${groupPrefix}` : `${prefix}${idx}Fuente`;
        updates[imgKey] = foto.imagen;
        updates[titKey] = foto.titulo || '';
        updates[fuenteKey] = foto.fuente || '';
      }
    });
    
    // Paso 3: Persistir en ProjectFacade (capa 1)
    this.projectFacade.setFields(this.seccionId, null, updates);
    
    // Paso 4: Persistir en Backend (capa 2)
    try {
      this.formChange.persistFields(this.seccionId, 'images', updates);
    } catch (e) {
      console.error('[SECCION26] ⚠️ Error persistiendo imágenes:', e);
    }
    
    // update local cache arrays based on the prefix
    if (prefix.startsWith('fotografiaDesechos')) {
      this.fotografiasDesechosFormMulti = fotografias;
    } else if (prefix.startsWith('fotografiaElectricidad')) {
      this.fotografiasElectricidadFormMulti = fotografias;
    } else if (prefix.startsWith('fotografiaEnergiaCocinar')) {
      this.fotografiasCocinarFormMulti = fotografias;
    }
    this.cdRef.markForCheck();
  }

  onFotografiasDesechosChange(fotografias: FotoItem[]): void { 
    this.onFotografiasChange(fotografias, this.photoPrefixSignalDesechos()); 
  }
  onFotografiasElectricidadChange(fotografias: FotoItem[]): void { 
    this.onFotografiasChange(fotografias, this.photoPrefixSignalElectricidad()); 
  }
  onFotografiasCocinarChange(fotografias: FotoItem[]): void { 
    this.onFotografiasChange(fotografias, this.photoPrefixSignalCocinar()); 
  }
}
