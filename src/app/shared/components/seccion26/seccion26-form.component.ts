import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { TableNumberingService } from 'src/app/core/services/table-numbering.service';

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

  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB15';
  readonly PHOTO_PREFIX_DESECHOS = 'fotografiaDesechosSolidosAISI';
  readonly PHOTO_PREFIX_ELECTRICIDAD = 'fotografiaElectricidadAISI';
  readonly PHOTO_PREFIX_COCINAR = 'fotografiaEnergiaCocinarAISI';

  fotografiasDesechosFormMulti: FotoItem[] = [];
  fotografiasElectricidadFormMulti: FotoItem[] = [];
  fotografiasCocinarFormMulti: FotoItem[] = [];

  abastecimientoConfig: TableConfig = {
    tablaKey: 'abastecimientoAguaCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos'],
    estructuraInicial: [
      { categoria: 'Red pública dentro de la vivienda', casos: null, porcentaje: null },
      { categoria: 'Red pública fuera de la vivienda, pero dentro de la edificación', casos: null, porcentaje: null }
    ]
  };

  saneamientoConfig: TableConfig = {
    tablaKey: 'saneamientoCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos'],
    estructuraInicial: [
      { categoria: 'Red pública de desagüe dentro de la vivienda', casos: null, porcentaje: null },
      { categoria: 'Pozo séptico, tanque séptico o biodigestor', casos: null, porcentaje: null },
      { categoria: 'Red pública de desagüe fuera de la vivienda, pero dentro de la edificación', casos: null, porcentaje: null },
      { categoria: 'Letrina (con tratamiento)', casos: null, porcentaje: null },
      { categoria: 'Pozo ciego o negro', casos: null, porcentaje: null },
      { categoria: 'Campo abierto o al aire libre', casos: null, porcentaje: null }
    ]
  };

  coberturaConfig: TableConfig = {
    tablaKey: 'coberturaElectricaCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos'],
    estructuraInicial: [
      { categoria: 'Si tiene alumbrado eléctrico', casos: null, porcentaje: null },
      { categoria: 'No tiene alumbrado eléctrico', casos: null, porcentaje: null }
    ]
  };

  combustiblesConfig: TableConfig = {
    tablaKey: 'combustiblesCocinarCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos'],
    estructuraInicial: [
      { categoria: 'Leña', casos: null, porcentaje: null },
      { categoria: 'Gas (balón GLP)', casos: null, porcentaje: null },
      { categoria: 'Bosta, estiércol', casos: null, porcentaje: null },
      { categoria: 'Electricidad', casos: null, porcentaje: null }
    ]
  };

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly viewModel = computed(() => ({
    textoIntro: ((): string => {
      const manual = this.formDataSignal()?.['textoIntroServiciosBasicosAISI'];
      if (manual && manual.trim() !== '' && manual !== '____') return manual;
      return this.obtenerTextoIntroServiciosBasicosAISI();
    })(),
    textoServiciosAgua: ((): string => {
      const manual = this.formDataSignal()?.['textoServiciosAguaAISI'];
      if (manual && manual.trim() !== '' && manual !== '____') return manual;
      return this.obtenerTextoServiciosAguaAISI();
    })(),
    textoDesague: ((): string => {
      const manual = this.formDataSignal()?.['textoDesagueCP'];
      if (manual && manual.trim() !== '' && manual !== '____') return manual;
      return this.obtenerTextoDesagueCP();
    })(),
    textoDesechos: ((): string => {
      const manual = this.formDataSignal()?.['textoDesechosSolidosCP'];
      if (manual && manual.trim() !== '' && manual !== '____') return manual;
      return this.obtenerTextoDesechosSolidosCP();
    })(),
    textoElectricidad: ((): string => {
      const manual = this.formDataSignal()?.['textoElectricidadCP'];
      if (manual && manual.trim() !== '' && manual !== '____') return manual;
      return this.obtenerTextoElectricidadCP();
    })(),
    textoCocinar: ((): string => {
      const manual = this.formDataSignal()?.['textoEnergiaCocinarCP'];
      if (manual && manual.trim() !== '' && manual !== '____') return manual;
      return this.obtenerTextoEnergiaCocinarCP();
    })(),
    cuadroTituloAbastecimiento: this.formDataSignal()?.['cuadroTituloAbastecimiento'] || '',
    cuadroFuenteAbastecimiento: this.formDataSignal()?.['cuadroFuenteAbastecimiento'] || '',
    cuadroTituloSaneamiento: this.formDataSignal()?.['cuadroTituloSaneamiento'] || '',
    cuadroFuenteSaneamiento: this.formDataSignal()?.['cuadroFuenteSaneamiento'] || '',
    cuadroTituloCobertura: this.formDataSignal()?.['cuadroTituloCobertura'] || '',
    cuadroFuenteCobertura: this.formDataSignal()?.['cuadroFuenteCobertura'] || '',
    cuadroTituloCombustibles: this.formDataSignal()?.['cuadroTituloCombustibles'] || '',
    cuadroFuenteCombustibles: this.formDataSignal()?.['cuadroFuenteCombustibles'] || '',
    abastecimiento: this.formDataSignal()?.['abastecimientoAguaCpTabla'] || this.projectFacade.selectTableData(this.seccionId, null, 'abastecimientoAguaCpTabla')() || [],
    saneamiento: this.formDataSignal()?.['saneamientoCpTabla'] || this.projectFacade.selectTableData(this.seccionId, null, 'saneamientoCpTabla')() || [],
    cobertura: this.formDataSignal()?.['coberturaElectricaCpTabla'] || this.projectFacade.selectTableData(this.seccionId, null, 'coberturaElectricaCpTabla')() || [],
    combustibles: this.formDataSignal()?.['combustiblesCocinarCpTabla'] || this.projectFacade.selectTableData(this.seccionId, null, 'combustiblesCocinarCpTabla')() || [],
    fotosDesechos: this.imageFacade.loadImages(this.seccionId, this.PHOTO_PREFIX_DESECHOS, this.imageFacade.getGroupPrefix(this.seccionId)),
    fotosElectricidad: this.imageFacade.loadImages(this.seccionId, this.PHOTO_PREFIX_ELECTRICIDAD, this.imageFacade.getGroupPrefix(this.seccionId)),
    fotosCocinar: this.imageFacade.loadImages(this.seccionId, this.PHOTO_PREFIX_COCINAR, this.imageFacade.getGroupPrefix(this.seccionId))
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private tableNumbering: TableNumberingService) {
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
    this.cargarFotografias();
    // Ensure paragraph and cuadro title/source fields exist so view can show them
    const keys = ['textoIntroServiciosBasicosAISI','textoServiciosAguaAISI','textoDesagueCP','textoDesechosSolidosCP','textoElectricidadCP','textoEnergiaCocinarCP',
      'cuadroTituloAbastecimiento','cuadroFuenteAbastecimiento','cuadroTituloSaneamiento','cuadroFuenteSaneamiento','cuadroTituloCobertura','cuadroFuenteCobertura','cuadroTituloCombustibles','cuadroFuenteCombustibles'];
    try {
      for (const k of keys) {
        const val = this.projectFacade.selectField(this.seccionId, null, k)();
        if (val === undefined || val === null) this.onFieldChange(k, '');
      }
    } catch (e) {}
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  // Paragraph generators (fallbacks - similar to monolith)
  obtenerTextoIntroServiciosBasicosAISI(): string {
    const viviendas = this.getViviendasOcupadasPresentes();
    return `Los servicios básicos nos indican el nivel de desarrollo de una comunidad y un saneamiento deficiente va asociado a la transmisión de enfermedades como el cólera, la diarrea, la disentería, la hepatitis A, la fiebre tifoidea y la poliomielitis, y agrava el retraso del crecimiento.\n\nEn 2010, la Asamblea General de las Naciones Unidas reconoció que el acceso al agua potable salubre y limpia, y al saneamiento es un derecho humano y pidió que se realizaran esfuerzos internacionales para ayudar a los países a proporcionar agua potable e instalaciones de saneamiento salubres, limpias, accesibles y asequibles. Los servicios básicos serán descritos a continuación tomando como referencia al total de viviendas ocupadas presentes (${viviendas}), tal como realiza el Censo Nacional 2017.`;
  }

  obtenerTextoServiciosAguaAISI(): string {
    const centro = this.formDataSignal()?.['centroPobladoAISI'] || 'Cahuacho';
    const tabla = this.datos['abastecimientoAguaCpTabla'] || [];
    const cuadro = this.tableNumbering.getGlobalTableNumber(this.seccionId, 0);
    const tablaCon = TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
    const dentro = tablaCon.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('dentro'))?.porcentaje?.value || '____';
    const fuera = tablaCon.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('fuera'))?.porcentaje?.value || '____';
    return `Respecto al servicio de agua para consumo humano en el CP ${centro}, se cuenta con cobertura de dicho recurso en las viviendas. Es así que, según los Censos Nacionales 2017, un ${dentro} de las viviendas cuenta con red pública dentro de la misma. El porcentaje restante (${fuera}) consta de red pública fuera de la vivienda, pero dentro de la edificación.`;
  }

  obtenerTextoDesagueCP(): string {
    const centro = this.formDataSignal()?.['centroPobladoAISI'] || 'Cahuacho';
    const cuadro = this.tableNumbering.getGlobalTableNumber(this.seccionId, 1);
    const tabla = TablePercentageHelper.calcularPorcentajesSimple(this.datos['saneamientoCpTabla'] || [], cuadro);
    const dentro = tabla.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('dentro'))?.porcentaje?.value || '____';
    const pozo = tabla.find((i:any)=> i.categoria && (i.categoria.toString().toLowerCase().includes('pozo') || i.categoria.toString().toLowerCase().includes('tanque') || i.categoria.toString().toLowerCase().includes('biodigestor')))?.porcentaje?.value || '____';
    const p1 = `Respecto al servicio de saneamiento en las viviendas de la capital distrital de ${centro}, se cuenta con una amplia cobertura de dicho servicio. Es así que, según los Censos Nacionales 2017, un ${dentro} de las viviendas cuenta con red pública de desagüe dentro de las mismas. Adicionalmente, un ${pozo} cuenta con pozo séptico, tanque séptico o biodigestor.`;
    const p2 = `Por otra parte, se hallan otras categorías con porcentajes menores: red pública de desagüe fuera de la vivienda, pero dentro de la edificación; letrina (con tratamiento); pozo ciego o negro; y campo abierto o al aire libre, todas las cuales representan un 2,04 % cada una.`;
    return `${p1}\n\n${p2}`;
  }

  obtenerTextoDesechosSolidosCP(): string {
    const distrito = this.formDataSignal()?.['distritoSeleccionado'] || 'Cahuacho';
    const centro = this.formDataSignal()?.['centroPobladoAISI'] || 'Cahuacho';
    const p1 = `La gestión de los desechos sólidos está a cargo de la Municipalidad Distrital de ${distrito}, aunque según los entrevistados, la recolección se realiza de manera mensual, en promedio. En ese sentido, no existe una fecha establecida en la que la municipalidad gestione los desechos sólidos. Adicional a ello, las limitaciones en cuanto a infraestructura adecuada para el tratamiento de desechos sólidos generan algunos retos en la gestión eficiente de los mismos.`;
    const p2 = `Cuando los desechos sólidos son recolectados, estos son trasladados a un botadero cercano a la capital distrital, donde se realiza su disposición final. La falta de un sistema más avanzado para el tratamiento de los residuos, como plantas de reciclaje o de tratamiento, dificulta el manejo integral de los desechos y plantea preocupaciones ambientales a largo plazo. Además, la comunidad enfrenta desafíos derivados de la acumulación de basura en ciertos puntos, especialmente en épocas en que la recolección es menos frecuente. Ante ello, la misma población acude al botadero para disponer sus residuos sólidos, puesto que está prohibida la incineración. Cabe mencionar que sí existen puntos dentro del CP ${centro} en donde la población puede disponer sus desechos plásticos como botellas, aunque estos tampoco son recolectados frecuentemente por el personal de la municipalidad.`;
    return `${p1}\n\n${p2}`;
  }

  obtenerTextoElectricidadCP(): string {
    const si = (()=>{
      const cuadro = this.tableNumbering.getGlobalTableNumber(this.seccionId, 2);
      const tabla = TablePercentageHelper.calcularPorcentajesSimple(this.datos['coberturaElectricaCpTabla']||[], cuadro);
      return tabla.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('si'))?.porcentaje?.value || '____';
    })();
    const no = (()=>{
      const cuadro = this.tableNumbering.getGlobalTableNumber(this.seccionId, 2);
      const tabla = TablePercentageHelper.calcularPorcentajesSimple(this.datos['coberturaElectricaCpTabla']||[], cuadro);
      return tabla.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('no'))?.porcentaje?.value || '____';
    })();
    return `Se puede apreciar una amplia cobertura de alumbrado eléctrico en las viviendas del centro poblado en cuestión. Según los Censos Nacionales 2017, se cuenta con los siguientes datos: el ${si} de las viviendas cuenta con alumbrado eléctrico, mientras que el ${no} restante no tiene el referido servicio.`;
  }

  obtenerTextoEnergiaCocinarCP(): string {
    const centro = this.formDataSignal()?.['centroPobladoAISI'] || 'Cahuacho';
    const cuadro = this.tableNumbering.getGlobalTableNumber(this.seccionId, 3);
    const tabla = TablePercentageHelper.calcularPorcentajesSimple(this.datos['combustiblesCocinarCpTabla']||[], cuadro);
    const lena = tabla.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('leña'))?.porcentaje?.value || '____';
    const gas = tabla.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('gas'))?.porcentaje?.value || '____';
    const bosta = tabla.find((i:any)=> i.categoria && (i.categoria.toString().toLowerCase().includes('bosta') || i.categoria.toString().toLowerCase().includes('estiércol')))?.porcentaje?.value || '____';
    const electr = tabla.find((i:any)=> i.categoria && i.categoria.toString().toLowerCase().includes('electricidad'))?.porcentaje?.value || '____';
    return `Según los Censos Nacionales 2017, de un total de ${this.getTotalCombustiblesCocinar()} hogares en el CP ${centro}, se obtiene que un ${lena} emplea la leña. En menor medida, se emplean otros combustibles como el gas (balón GLP) en un ${gas}, la bosta o estiércol en un ${bosta} y la electricidad con un ${electr}. Cabe mencionar que los hogares pueden emplear más de un tipo de combustible para la cocción de los alimentos.`;
  }

  private getViviendasOcupadasPresentes(): string {
    if (!this.datos?.condicionOcupacionAISI || !Array.isArray(this.datos.condicionOcupacionAISI)) {
      return '____';
    }
    const item = this.datos.condicionOcupacionAISI.find((item: any) => 
      item.categoria?.toLowerCase().includes('ocupado') || item.categoria?.toLowerCase().includes('ocupada')
    );
    return item?.casos?.toString() || '____';
  }
  // Table update handlers - persist both table and paragraph texts to avoid races
  onAbastecimientoAguaTableUpdated(updated?: any[]): void {
    this.genericTablePersist('abastecimientoAguaCpTabla', updated);
  }

  // Field change handlers (called by dynamic-table when a cell changes)
  onAbastecimientoAguaFieldChange(index: number, field: string, value: any): void {
    this.handleTableFieldChange('abastecimientoAguaCpTabla', index, field, value);
  }

  onSaneamientoFieldChange(index: number, field: string, value: any): void {
    this.handleTableFieldChange('saneamientoCpTabla', index, field, value);
  }

  onCoberturaElectricaFieldChange(index: number, field: string, value: any): void {
    this.handleTableFieldChange('coberturaElectricaCpTabla', index, field, value);
  }

  onCombustiblesCocinarFieldChange(index: number, field: string, value: any): void {
    this.handleTableFieldChange('combustiblesCocinarCpTabla', index, field, value);
  }

  // TableUpdated handlers for other tables
  onSaneamientoTableUpdated(updated?: any[]): void {
    this.genericTablePersist('saneamientoCpTabla', updated);
  }

  onCoberturaElectricaTableUpdated(updated?: any[]): void {
    this.genericTablePersist('coberturaElectricaCpTabla', updated);
  }

  onCombustiblesCocinarTableUpdated(updated?: any[]): void {
    this.genericTablePersist('combustiblesCocinarCpTabla', updated);
  }

  private handleTableFieldChange(tablaKey: string, index: number, field: string, value: any) {
    // Prefer prefixed key if present in datos (group-prefixed storage), otherwise use base key
    let actualKey = tablaKey;
    try {
      const pref = require('src/app/shared/utils/prefix-manager').PrefixManager.getFieldKey(this.seccionId, tablaKey);
      if (pref && Array.isArray(this.datos[pref]) && this.datos[pref].length >= (index + 1)) {
        actualKey = pref;
      }
    } catch (e) {
      // ignore
    }

    const tabla = this.datos[actualKey] || [];
    if (!Array.isArray(tabla) || index < 0 || index >= tabla.length) {
      console.warn('[Seccion26] handleTableFieldChange - index out of range or tabla invalid', index, tabla.length, 'actualKey:', actualKey);
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
        // If total is zero, set 0,00 % calculated
        rows.forEach((item: any) => {
          if (!item.categoria || !item.categoria.toString().toLowerCase().includes('total')) {
            item.porcentaje = { value: '0,00 %', isCalculated: true };
          }
        });
      }
    }

    // Write back to the actual key used
    this.datos[actualKey] = [...tabla];

    // Ensure ProjectState is updated first to avoid race with SectionSync notifications
    try { this.projectFacade.setTableData(this.seccionId, null, actualKey, this.datos[actualKey]); } catch (e) { console.warn('[Seccion26] setTableData error', e); }
    try { this.projectFacade.setField(this.seccionId, null, tablaKey, this.datos[actualKey]); } catch (e) { console.warn('[Seccion26] setField base error', e); }
    if (actualKey !== tablaKey) {
      try { this.projectFacade.setField(this.seccionId, null, actualKey, this.datos[actualKey]); } catch (e) { console.warn('[Seccion26] setField prefixed error', e); }
    }

    try {
      const FormChangeServiceToken = require('src/app/core/services/state/form-change.service').FormChangeService;
      const formChange = this.injector.get(FormChangeServiceToken, null);
      if (formChange) {
        const textPayload: any = {};
        const textKey = this.getParrafoKeyForTabla(tablaKey);
        if (textKey && this.datos[textKey] !== undefined) textPayload[textKey] = this.datos[textKey];
        // Persist both actualKey (prefixed) and base tablaKey for compatibility
        const payload: any = { [actualKey]: this.datos[actualKey], [tablaKey]: this.datos[actualKey], ...textPayload };
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
    switch (tablaKey) {
      case 'abastecimientoAguaCpTabla': return 'textoServiciosAguaAISI';
      case 'saneamientoCpTabla': return 'textoDesagueCP';
      case 'coberturaElectricaCpTabla': return 'textoElectricidadCP';
      case 'combustiblesCocinarCpTabla': return 'textoEnergiaCocinarCP';
      default: return null;
    }
  }

  getTotalAbastecimientoAgua(): number {
    const tabla = this.datos['abastecimientoAguaCpTabla'] || [];
    return (tabla || []).filter((item:any) => !(item.categoria && item.categoria.toString().toLowerCase().includes('total'))).reduce((s:number,i:any)=>s + (Number(i.casos)||0),0);
  }

  getTotalSaneamiento(): number {
    const tabla = this.datos['saneamientoCpTabla'] || [];
    return (tabla || []).filter((item:any) => !(item.categoria && item.categoria.toString().toLowerCase().includes('total'))).reduce((s:number,i:any)=>s + (Number(i.casos)||0),0);
  }

  getTotalCoberturaElectrica(): number {
    const tabla = this.datos['coberturaElectricaCpTabla'] || [];
    return (tabla || []).filter((item:any) => !(item.categoria && item.categoria.toString().toLowerCase().includes('total'))).reduce((s:number,i:any)=>s + (Number(i.casos)||0),0);
  }

  getTotalCombustiblesCocinar(): number {
    const tabla = this.datos['combustiblesCocinarCpTabla'] || [];
    return (tabla || []).filter((item:any) => !(item.nombre && item.nombre.toString().toLowerCase().includes('total'))).reduce((s:number,i:any)=>s + (Number(i.casos)||0),0);
  }

  // (similar handlers for other tables omitted for brevity — will reuse pattern)

  onFotografiasDesechosChange(fotografias: FotoItem[]): void { this.onFotografiasChange(fotografias, this.PHOTO_PREFIX_DESECHOS); }
  onFotografiasElectricidadChange(fotografias: FotoItem[]): void { this.onFotografiasChange(fotografias, this.PHOTO_PREFIX_ELECTRICIDAD); }
  onFotografiasCocinarChange(fotografias: FotoItem[]): void { this.onFotografiasChange(fotografias, this.PHOTO_PREFIX_COCINAR); }

}
