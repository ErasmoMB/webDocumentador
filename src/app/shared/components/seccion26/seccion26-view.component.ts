import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { normalizeTitleWithPlaceholders } from '../../utils/placeholder-text.helper';
import { SECCION26_TEMPLATES } from './seccion26-constants';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, GenericTableComponent],
  selector: 'app-seccion26-view',
  templateUrl: './seccion26-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion26ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.5';

  // ✅ Exportar TEMPLATES para el template
  readonly SECCION26_TEMPLATES = SECCION26_TEMPLATES;

  // ✅ Inyección de GlobalNumberingService
  private globalNumberingService = inject(GlobalNumberingService);

  override useReactiveSync: boolean = true;

  // ✅ PHOTO_PREFIX para compatibilidad con template
  readonly PHOTO_PREFIX_DESECHOS = 'fotografiaDesechosSolidosAISI';
  readonly PHOTO_PREFIX_ELECTRICIDAD = 'fotografiaElectricidadAISI';
  readonly PHOTO_PREFIX_COCINAR = 'fotografiaEnergiaCocinarAISI';

  // ✅ FormDataSignal local
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly centroPobladoSignal: Signal<string> = computed(() => {
    this.formDataSignal();
    return this.obtenerNombreCentroPobladoActual() || '____';
  });

  readonly distritoActualSignal: Signal<string> = computed(() => {
    this.formDataSignal();
    return this.obtenerNombreDistritoActual() || '____';
  });

  // ✅ Helper para obtener prefijo de grupo
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  // ✅ PHOTO_PREFIX Signals dinámicos
  readonly photoPrefixSignalDesechos: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `fotografiaDesechosSolidosAISI${prefijo}` : 'fotografiaDesechosSolidosAISI';
  });

  readonly photoPrefixSignalElectricidad: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `fotografiaElectricidadAISI${prefijo}` : 'fotografiaElectricidadAISI';
  });

  readonly photoPrefixSignalCocinar: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
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

  // ✅ Campos con prefijos
  readonly textoIntroSignal = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoIntroServiciosBasicosAISI${prefijo}` : 'textoIntroServiciosBasicosAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;

    // fallback: generate default combined intro (two paragraphs)
    const datos = this.formDataSignal() || {};
    const viviendas = (datos['condicionOcupacionAISI'] || []).find((i:any) => i.categoria && (i.categoria.toLowerCase().includes('ocupado')))?.casos || '____';
    return `Los servicios básicos nos indican el nivel de desarrollo de una comunidad y un saneamiento deficiente va asociado a la transmisión de enfermedades como el cólera, la diarrea, la disentería, la hepatitis A, la fiebre tifoidea y la poliomielitis, y agrava el retraso del crecimiento.\n\nEn 2010, la Asamblea General de las Naciones Unidas reconoció que el acceso al agua potable salubre y limpia, y al saneamiento es un derecho humano y pidió que se realizaran esfuerzos internacionales para ayudar a los países a proporcionar agua potable e instalaciones de saneamiento salubres, limpias, accesibles y asequibles. Los servicios básicos serán descritos a continuación tomando como referencia al total de viviendas ocupadas presentes (${viviendas}), tal como realiza el Censo Nacional 2017.`;
  });

  readonly textoServiciosAguaSignal = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoServiciosAguaAISI${prefijo}` : 'textoServiciosAguaAISI';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    // Generated default using computed percentages
    const dentro = this.porcentajeAguaDentroSignal();
    const fuera = this.porcentajeAguaFueraSignal();
    const centro = this.centroPobladoSignal();
    return `Respecto al servicio de agua para consumo humano en el CP ${centro}, se cuenta con cobertura de dicho recurso en las viviendas. Es así que, según los Censos Nacionales 2017, un ${dentro} de las viviendas cuenta con red pública dentro de la misma. El porcentaje restante (${fuera}) consta de red pública fuera de la vivienda, pero dentro de la edificación.`;
  });

  readonly textoDesagueSignal = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoDesagueCP${prefijo}` : 'textoDesagueCP';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    const centro = this.centroPobladoSignal();
    const tabla = this.saneamientoConPorcentajes() || [];
    const dentro = tabla.find((i:any) => i.categoria && i.categoria.toString().toLowerCase().includes('dentro'))?.porcentaje?.value || tabla[0]?.porcentaje?.value || '____';
    const pozo = tabla.find((i:any) => i.categoria && (i.categoria.toString().toLowerCase().includes('pozo') || i.categoria.toString().toLowerCase().includes('tanque') || i.categoria.toString().toLowerCase().includes('biodigestor')))?.porcentaje?.value || '____';
    const p1 = `Respecto al servicio de saneamiento en las viviendas de la capital distrital de ${centro}, se cuenta con una amplia cobertura de dicho servicio. Es así que, según los Censos Nacionales 2017, un ${dentro} de las viviendas cuenta con red pública de desagüe dentro de las mismas. Adicionalmente, un ${pozo} cuenta con pozo séptico, tanque séptico o biodigestor.`;
    const p2 = `Por otra parte, se hallan otras categorías con porcentajes menores: red pública de desagüe fuera de la vivienda, pero dentro de la edificación; letrina (con tratamiento); pozo ciego o negro; y campo abierto o al aire libre, todas las cuales representan un 2,04 % cada una.`;
    return `${p1}\n\n${p2}`;
  });

  readonly textoDesechosSignal = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoDesechosSolidosCP${prefijo}` : 'textoDesechosSolidosCP';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    const distrito = this.distritoActualSignal();
    const centro = this.centroPobladoSignal();
    const p1 = `La gestión de los desechos sólidos está a cargo de la Municipalidad Distrital de ${distrito}, aunque según los entrevistados, la recolección se realiza de manera mensual, en promedio. En ese sentido, no existe una fecha establecida en la que la municipalidad gestione los desechos sólidos. Adicional a ello, las limitaciones en cuanto a infraestructura adecuada para el tratamiento de desechos sólidos generan algunos retos en la gestión eficiente de los mismos.`;
    const p2 = `Cuando los desechos sólidos son recolectados, estos son trasladados a un botadero cercano a la capital distrital, donde se realiza su disposición final. La falta de un sistema más avanzado para el tratamiento de los residuos, como plantas de reciclaje o de tratamiento, dificulta el manejo integral de los desechos y plantea preocupaciones ambientales a largo plazo. Además, la comunidad enfrenta desafíos derivados de la acumulación de basura en ciertos puntos, especialmente en épocas en que la recolección es menos frecuente. Ante ello, la misma población acude al botadero para disponer sus residuos sólidos, puesto que está prohibida la incineración. Cabe mencionar que sí existen puntos dentro del CP ${centro} en donde la población puede disponer sus desechos plásticos como botellas, aunque estos tampoco son recolectados frecuentemente por el personal de la municipalidad.`;
    return `${p1}\n\n${p2}`;
  });

  readonly textoElectricidadSignal = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoElectricidadCP${prefijo}` : 'textoElectricidadCP';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    const si = this.porcentajeElectricidadSiSignal();
    const no = this.porcentajeElectricidadNoSignal();
    return `Se puede apreciar una amplia cobertura de alumbrado eléctrico en las viviendas del centro poblado en cuestión. Según los Censos Nacionales 2017, se cuenta con los siguientes datos: el ${si} de las viviendas cuenta con alumbrado eléctrico, mientras que el ${no} restante no tiene el referido servicio.`;
  });

  readonly textoCocinarSignal = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const campoKey = prefijo ? `textoEnergiaCocinarCP${prefijo}` : 'textoEnergiaCocinarCP';
    const manual = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    if (manual && manual.trim() !== '' && manual !== '____') return manual;
    const centro = this.centroPobladoSignal();
    const totalHogares = this.totalCombustiblesSignal();
    const lena = this.porcentajeLenaSignal();
    const gas = this.porcentajeGasSignal();
    const bosta = this.porcentajeBostaSignal();
    const electr = this.porcentajeElectricidadCocinarSignal();
    return `Según los Censos Nacionales 2017, de un total de ${totalHogares} hogares en el CP ${centro}, se obtiene que un ${lena} emplea la leña. En menor medida, se emplean otros combustibles como el gas (balón GLP) en un ${gas}, la bosta o estiércol en un ${bosta} y la electricidad con un ${electr}. Cabe mencionar que los hogares pueden emplear más de un tipo de combustible para la cocción de los alimentos.`;
  });

  // ✅ Tables con prefijos
  readonly abastecimientoSignal = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `abastecimientoAguaCpTabla${prefijo}` : 'abastecimientoAguaCpTabla';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  readonly saneamientoSignal = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `saneamientoCpTabla${prefijo}` : 'saneamientoCpTabla';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
           this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  readonly coberturaSignal = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `coberturaElectricaCpTabla${prefijo}` : 'coberturaElectricaCpTabla';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  readonly combustiblesSignal = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `combustiblesCocinarCpTabla${prefijo}` : 'combustiblesCocinarCpTabla';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  // ✅ computed with percentages
  readonly abastecimientoConPorcentajes = computed(() => {
    const cuadroNumero = this.globalTableNumberSignalAbastecimiento();
    return TablePercentageHelper.calcularPorcentajesSimple(this.abastecimientoSignal(), cuadroNumero);
  });

  readonly saneamientoConPorcentajes = computed(() => {
    const cuadroNumero = this.globalTableNumberSignalSaneamiento();
    return TablePercentageHelper.calcularPorcentajesSimple(this.saneamientoDetalladoSignal(), cuadroNumero);
  });

  readonly coberturaConPorcentajes = computed(() => {
    const cuadroNumero = this.globalTableNumberSignalCobertura();
    return TablePercentageHelper.calcularPorcentajesSimple(this.coberturaSignal(), cuadroNumero);
  });

  readonly combustiblesConPorcentajes = computed(() => {
    const cuadroNumero = this.globalTableNumberSignalCombustibles();
    return TablePercentageHelper.calcularPorcentajesSimple(this.combustiblesSignal(), cuadroNumero);
  });

  // Totals & percentage helpers
  readonly totalAbastecimientoSignal: Signal<number> = computed(() => {
    const tabla = this.abastecimientoSignal() || [];
    const filtered = tabla.filter((item: any) => !item.categoria || !item.categoria.toString().toLowerCase().includes('total'));
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  });

  readonly porcentajeAguaDentroSignal: Signal<string> = computed(() => {
    const tabla = this.abastecimientoConPorcentajes() || [];
    const item = tabla.find((i: any) => i.categoria && i.categoria.toString().toLowerCase().includes('dentro')) || tabla[0];
    return item?.porcentaje?.value ?? item?.porcentaje ?? '____';
  });

  readonly porcentajeAguaFueraSignal: Signal<string> = computed(() => {
    const tabla = this.abastecimientoConPorcentajes() || [];
    const item = tabla.find((i: any) => i.categoria && i.categoria.toString().toLowerCase().includes('fuera')) || tabla[1];
    return item?.porcentaje?.value ?? item?.porcentaje ?? '____';
  });

  readonly totalSaneamientoSignal: Signal<number> = computed(() => {
    const tabla = this.saneamientoSignal() || [];
    const filtered = tabla.filter((item: any) => !item.categoria || !item.categoria.toString().toLowerCase().includes('total'));
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  });

  readonly porcentajeElectricidadSiSignal: Signal<string> = computed(() => {
    const tabla = this.coberturaConPorcentajes() || [];
    const item = tabla.find((i:any) => i.categoria && i.categoria.toString().toLowerCase().includes('si')) || tabla[0];
    return item?.porcentaje?.value ?? item?.porcentaje ?? '____';
  });

  readonly porcentajeElectricidadNoSignal: Signal<string> = computed(() => {
    const tabla = this.coberturaConPorcentajes() || [];
    const item = tabla.find((i:any) => i.categoria && i.categoria.toString().toLowerCase().includes('no')) || tabla[1];
    return item?.porcentaje?.value ?? item?.porcentaje ?? '____';
  });

  readonly totalCombustiblesSignal: Signal<number> = computed(() => {
    const tabla = this.combustiblesSignal() || [];
    return tabla.reduce((sum:number, item:any) => sum + (Number(item.casos) || 0), 0);
  });

  readonly porcentajeLenaSignal: Signal<string> = computed(() => {
    const tabla = this.combustiblesConPorcentajes() || [];
    const item = tabla.find((i:any) => i.categoria && i.categoria.toString().toLowerCase().includes('leña')) || tabla[0];
    return item?.porcentaje?.value ?? item?.porcentaje ?? '____';
  });

  readonly porcentajeGasSignal: Signal<string> = computed(() => {
    const tabla = this.combustiblesConPorcentajes() || [];
    const item = tabla.find((i:any) => i.categoria && i.categoria.toString().toLowerCase().includes('gas')) || tabla.find((_, idx) => idx === 1);
    return item?.porcentaje?.value ?? item?.porcentaje ?? '____';
  });

  readonly porcentajeBostaSignal: Signal<string> = computed(() => {
    const tabla = this.combustiblesConPorcentajes() || [];
    const item = tabla.find((i:any) => i.categoria && i.categoria.toString().toLowerCase().includes('bosta')) || tabla.find((_, idx) => idx === 2);
    return item?.porcentaje?.value ?? item?.porcentaje ?? '____';
  });

  readonly porcentajeElectricidadCocinarSignal: Signal<string> = computed(() => {
    const tabla = this.combustiblesConPorcentajes() || [];
    const item = tabla.find((i:any) => i.categoria && i.categoria.toString().toLowerCase().includes('electricidad')) || tabla.find((_, idx) => idx === 3);
    return item?.porcentaje?.value ?? item?.porcentaje ?? '____';
  });

  // ✅ Fotos con prefijos
  readonly fotosDesechosSignal = computed(() => this.imageFacade.loadImages(this.seccionId, this.photoPrefixSignalDesechos(), this.imageFacade.getGroupPrefix(this.seccionId)));
  readonly fotosElectricidadSignal = computed(() => this.imageFacade.loadImages(this.seccionId, this.photoPrefixSignalElectricidad(), this.imageFacade.getGroupPrefix(this.seccionId)));
  readonly fotosCocinarSignal = computed(() => this.imageFacade.loadImages(this.seccionId, this.photoPrefixSignalCocinar(), this.imageFacade.getGroupPrefix(this.seccionId)));

  // ✅ Campos de títulos y fuentes con prefijos
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

  readonly viewModel = computed(() => ({
    textoIntro: this.textoIntroSignal(),
    textoServiciosAgua: this.textoServiciosAguaSignal(),
    textoDesague: this.textoDesagueSignal(),
    textoDesechos: this.textoDesechosSignal(),
    textoElectricidad: this.textoElectricidadSignal(),
    textoCocinar: this.textoCocinarSignal(),
    abastecimiento: this.abastecimientoConPorcentajes(),
    saneamiento: this.saneamientoConPorcentajes(),
    cobertura: this.coberturaConPorcentajes(),
    combustibles: this.combustiblesConPorcentajes(),
    fotosDesechos: this.fotosDesechosSignal(),
    fotosElectricidad: this.fotosElectricidadSignal(),
    fotosCocinar: this.fotosCocinarSignal(),
    cuadroTituloAbastecimiento: this.cuadroTituloAbastecimientoSignal(),
    cuadroFuenteAbastecimiento: this.cuadroFuenteAbastecimientoSignal(),
    cuadroTituloSaneamiento: this.cuadroTituloSaneamientoSignal(),
    cuadroFuenteSaneamiento: this.cuadroFuenteSaneamientoSignal(),
    cuadroTituloCobertura: this.cuadroTituloCoberturaSignal(),
    cuadroFuenteCobertura: this.cuadroFuenteCoberturaSignal(),
    cuadroTituloCombustibles: this.cuadroTituloCombustiblesSignal(),
    cuadroFuenteCombustibles: this.cuadroFuenteCombustiblesSignal(),
    centroPoblado: this.centroPobladoSignal(),
    saneamientoDetallado: this.saneamientoDetalladoSignal()
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector) {
    super(cdRef, injector);

    effect(() => {
      const data = this.formDataSignal();
      // Merge instead of replace: keep existing datos when selector is empty (fallback to BaseSectionComponent data)
      if (data && Object.keys(data).length > 0) {
        this.datos = { ...this.datos, ...data };
      }
      this.cdRef.markForCheck();
    });

    effect(() => {
      // touch signals so effects run on changes
      this.abastecimientoSignal();
      this.saneamientoSignal();
      this.coberturaSignal();
      this.combustiblesSignal();
      this.fotosDesechosSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasCache();
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  // small helpers kept for compatibility
  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  override ngOnDestroy(): void {
    // nothing extra
    super.ngOnDestroy();
  }

  getTituloAbastecimiento(): string {
    const vm = this.viewModel();
    const centroPoblado = vm.centroPoblado || this.obtenerNombreCentroPobladoActual() || '____';
    const distrito = this.obtenerNombreDistritoActual();
    const defaultTitle = SECCION26_TEMPLATES.cuadroTituloAbastecimientoDefault.replace('CP ____', `CP ${centroPoblado}`);
    return normalizeTitleWithPlaceholders(vm.cuadroTituloAbastecimiento, defaultTitle, centroPoblado, distrito);
  }

  getTituloSaneamiento(): string {
    const vm = this.viewModel();
    const centroPoblado = vm.centroPoblado || this.obtenerNombreCentroPobladoActual() || '____';
    const distrito = this.obtenerNombreDistritoActual();
    const defaultTitle = SECCION26_TEMPLATES.cuadroTituloSaneamientoDefault.replace('CP ____', `CP ${centroPoblado}`);
    return normalizeTitleWithPlaceholders(vm.cuadroTituloSaneamiento, defaultTitle, centroPoblado, distrito);
  }

  getTituloCobertura(): string {
    const vm = this.viewModel();
    const centroPoblado = vm.centroPoblado || this.obtenerNombreCentroPobladoActual() || '____';
    const distrito = this.obtenerNombreDistritoActual();
    const defaultTitle = SECCION26_TEMPLATES.cuadroTituloCoberturaDefault.replace('CP ____', `CP ${centroPoblado}`);
    return normalizeTitleWithPlaceholders(vm.cuadroTituloCobertura, defaultTitle, centroPoblado, distrito);
  }

  getTituloCombustibles(): string {
    const vm = this.viewModel();
    const centroPoblado = vm.centroPoblado || this.obtenerNombreCentroPobladoActual() || '____';
    const distrito = this.obtenerNombreDistritoActual();
    const defaultTitle = SECCION26_TEMPLATES.cuadroTituloCombustiblesDefault.replace('CP ____', `CP ${centroPoblado}`);
    return normalizeTitleWithPlaceholders(vm.cuadroTituloCombustibles, defaultTitle, centroPoblado, distrito);
  }

  // ✅ Signal para saneamiento (misma clave que el formulario, con prefijo)
  readonly saneamientoDetalladoSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `saneamientoCpTabla${prefijo}` : 'saneamientoCpTabla';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ??
           this.projectFacade.selectField(this.seccionId, null, tablaKey)() ?? [];
  });

  // ✅ Propiedad para el template (renombrada semanticamente)
  get saneamientoDetallado(): any[] {
    return this.saneamientoDetalladoSignal();
  }
}
