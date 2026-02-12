import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { GlobalNumberingService } from 'src/app/core/services/global-numbering.service';
import { PrefijoHelper } from '../../utils/prefijo-helper';

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

  // ✅ Inyección de GlobalNumberingService
  private globalNumberingService = inject(GlobalNumberingService);

  // ✅ PHOTO_PREFIX Signals dinámicos
  readonly photoPrefixSignalDesechos: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `fotografiaDesechosSolidosAISI${prefijo}` : 'fotografiaDesechosSolidosAISI';
  });

  readonly photoPrefixSignalElectricidad: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `fotografiaElectricidadAISI${prefijo}` : 'fotografiaElectricidadAISI';
  });

  readonly photoPrefixSignalCocinar: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `fotografiaEnergiaCocinarAISI${prefijo}` : 'fotografiaEnergiaCocinarAISI';
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
  private obtenerPrefijo(): string {
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

  // ✅ Tablas con noInicializarDesdeEstructura: true
  abastecimientoConfig: TableConfig = {
    tablaKey: 'abastecimientoAguaCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos'],
    noInicializarDesdeEstructura: true
  };

  saneamientoConfig: TableConfig = {
    tablaKey: 'saneamientoCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos'],
    noInicializarDesdeEstructura: true
  };

  coberturaConfig: TableConfig = {
    tablaKey: 'coberturaElectricaCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos'],
    noInicializarDesdeEstructura: true
  };

  combustiblesConfig: TableConfig = {
    tablaKey: 'combustiblesCocinarCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos'],
    noInicializarDesdeEstructura: true
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
    fotosDesechos: this.imageFacade.loadImages(this.seccionId, this.photoPrefixSignalDesechos(), this.imageFacade.getGroupPrefix(this.seccionId)),
    fotosElectricidad: this.imageFacade.loadImages(this.seccionId, this.photoPrefixSignalElectricidad(), this.imageFacade.getGroupPrefix(this.seccionId)),
    fotosCocinar: this.imageFacade.loadImages(this.seccionId, this.photoPrefixSignalCocinar(), this.imageFacade.getGroupPrefix(this.seccionId))
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);

    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.viewModel();
      // sync image caches for the form
      this.actualizarFotografiasFormMulti();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    // ✅ AUTO-LLENAR centroPobladoAISI con el nombre del grupo AISI actual
    const centroPobladoAISI = this.obtenerCentroPobladoAISI();
    const prefijo = this.obtenerPrefijo();
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
    const centro = this.datos['centroPobladoAISI'] || this.formDataSignal()?.['centroPobladoAISI'] || 'Cahuacho';
    const tabla = this.abastecimientoSignal() || [];
    const cuadro = this.globalTableNumberSignalAbastecimiento();
    const tablaCon = TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
    const dentro = tablaCon.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('dentro'))?.porcentaje?.value || '____';
    const fuera = tablaCon.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('fuera'))?.porcentaje?.value || '____';
    return `Respecto al servicio de agua para consumo humano en el CP ${centro}, se cuenta con cobertura de dicho recurso en las viviendas. Es así que, según los Censos Nacionales 2017, un ${dentro} de las viviendas cuenta con red pública dentro de la misma. El porcentaje restante (${fuera}) consta de red pública fuera de la vivienda, pero dentro de la edificación.`;
  }

  private generarTextoDesagueDefault(): string {
    const centro = this.datos['centroPobladoAISI'] || this.formDataSignal()?.['centroPobladoAISI'] || 'Cahuacho';
    const cuadro = this.globalTableNumberSignalSaneamiento();
    const tabla = TablePercentageHelper.calcularPorcentajesSimple(this.saneamientoSignal() || [], cuadro);
    const dentro = tabla.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('dentro'))?.porcentaje?.value || '____';
    const pozo = tabla.find((i:any)=> i.categoria && (i.categoria.toString().toLowerCase().includes('pozo') || i.categoria.toString().toLowerCase().includes('tanque') || i.categoria.toString().toLowerCase().includes('biodigestor')))?.porcentaje?.value || '____';
    const p1 = `Respecto al servicio de saneamiento en las viviendas de la capital distrital de ${centro}, se cuenta con una amplia cobertura de dicho servicio. Es así que, según los Censos Nacionales 2017, un ${dentro} de las viviendas cuenta con red pública de desagüe dentro de las mismas. Adicionalmente, un ${pozo} cuenta con pozo séptico, tanque séptico o biodigestor.`;
    const p2 = `Por otra parte, se hallan otras categorías con porcentajes menores: red pública de desagüe fuera de la vivienda, pero dentro de la edificación; letrina (con tratamiento); pozo ciego o negro; y campo abierto o al aire libre, todas las cuales representan un 2,04 % cada una.`;
    return `${p1}\n\n${p2}`;
  }

  private generarTextoDesechosDefault(): string {
    const distrito = this.datos['distritoSeleccionado'] || this.formDataSignal()?.['distritoSeleccionado'] || 'Cahuacho';
    const centro = this.datos['centroPobladoAISI'] || this.formDataSignal()?.['centroPobladoAISI'] || 'Cahuacho';
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
    const centro = this.datos['centroPobladoAISI'] || this.formDataSignal()?.['centroPobladoAISI'] || 'Cahuacho';
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
    const tabla = this.datos[tablaKey] || [];
    if (!Array.isArray(tabla) || index < 0 || index >= tabla.length) {
      console.warn('[Seccion26] handleTableFieldChange - index out of range or tabla invalid', index, tabla.length, 'tablaKey:', tablaKey);
      return;
    }

    tabla[index][field] = value;

    // If 'casos' changed, recalculate percentages for the table
    if (field === 'casos') {
      const rows = tabla.filter((item: any) => !(item.categoria && item.categoria.toString().toLowerCase().includes('total')));
      const total = rows.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
      if (total > 0) {
        rows.forEach((item: any) => {
          if (!item.categoria || !item.categoria.toString().toLowerCase().includes('total')) {
            const casos = Number(item.casos) || 0;
            const formatted = (casos / total * 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
            item.porcentaje = { value: formatted, isCalculated: true };
          }
        });
        // Update or add Total row
        const totalRowIndex = tabla.findIndex((r:any)=> r.categoria && r.categoria.toString().toLowerCase().includes('total'));
        const totalObj = { categoria: 'Total', casos: { value: total, isCalculated: true }, porcentaje: { value: '100,00 %', isCalculated: true } };
        if (totalRowIndex >= 0) {
          tabla[totalRowIndex] = { ...tabla[totalRowIndex], ...totalObj };
        } else {
          tabla.push(totalObj);
        }
      } else {
        rows.forEach((item: any) => {
          if (!item.categoria || !item.categoria.toString().toLowerCase().includes('total')) {
            item.porcentaje = { value: '0,00 %', isCalculated: true };
          }
        });
      }
    }

    // Write back to the actual key used
    this.datos[tablaKey] = [...tabla];

    // Ensure ProjectState is updated
    try { this.projectFacade.setTableData(this.seccionId, null, tablaKey, this.datos[tablaKey]); } catch (e) { console.warn('[Seccion26] setTableData error', e); }

    try {
      const FormChangeServiceToken = require('src/app/core/services/state/form-change.service').FormChangeService;
      const formChange = this.injector.get(FormChangeServiceToken, null);
      if (formChange) {
        const textPayload: any = {};
        const textKey = this.getParrafoKeyForTabla(tablaKey);
        if (textKey && this.datos[textKey] !== undefined) textPayload[textKey] = this.datos[textKey];
        const payload: any = { [tablaKey]: this.datos[tablaKey], ...textPayload };
        formChange.persistFields(this.seccionId, 'table', payload, { notifySync: true });

        try { const ViewChildHelper = require('src/app/shared/utils/view-child-helper').ViewChildHelper; ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) { /* noop */ }
      }
    } catch (e) { console.warn('[Seccion26] formChange persistFields error', e); }

    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  private genericTablePersist(tablaKey: string, updated?: any[]) {
    const tabla = updated || this.datos[tablaKey] || [];
    this.datos[tablaKey] = [...tabla];
    try { this.projectFacade.setTableData(this.seccionId, null, tablaKey, this.datos[tablaKey]); } catch (e) {}
    try {
      const FormChangeServiceToken = require('src/app/core/services/state/form-change.service').FormChangeService;
      const formChange = this.injector.get(FormChangeServiceToken, null);
      if (formChange) {
        const textPayload: any = {};
        const textKey = this.getParrafoKeyForTabla(tablaKey);
        if (textKey && this.datos[textKey] !== undefined) textPayload[textKey] = this.datos[textKey];
        const payload = { [tablaKey]: this.datos[tablaKey], ...textPayload };
        formChange.persistFields(this.seccionId, 'table', payload, { notifySync: true });

        try { this.projectFacade.setField(this.seccionId, null, tablaKey, this.datos[tablaKey]); } catch (e) { console.warn('[Seccion26] setField error', e); }
        try { const ViewChildHelper = require('src/app/shared/utils/view-child-helper').ViewChildHelper; ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) { /* noop */ }
      }
    } catch (e) { console.warn('[Seccion26] formChange persistFields error', e); }
    this.actualizarDatos();
    this.cdRef.detectChanges();
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
