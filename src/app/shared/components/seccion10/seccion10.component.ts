import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion10',
  templateUrl: './seccion10.component.html',
  styleUrls: ['./seccion10.component.css']
})
export class Seccion10Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'parrafoSeccion10_servicios_basicos_intro', 'abastecimientoAguaTabla', 'cuotaMensualAgua', 'tiposSaneamientoTabla', 'saneamientoTabla', 'coberturaElectricaTabla', 'empresaElectrica', 'costoElectricidadMinimo', 'costoElectricidadMaximo', 'textoServiciosAgua', 'textoServiciosAguaDetalle', 'textoServiciosDesague', 'textoServiciosDesagueDetalle', 'textoDesechosSolidos1', 'textoDesechosSolidos2', 'textoDesechosSolidos3', 'textoElectricidad1', 'textoElectricidad2', 'textoEnergiaParaCocinar'];
  
  readonly PHOTO_PREFIX_DESECHOS = 'fotografiaDesechosSolidos';
  readonly PHOTO_PREFIX_ELECTRICIDAD = 'fotografiaElectricidad';
  
  fotografiasDesechosSolidosFormMulti: FotoItem[] = [];
  fotografiasElectricidadFormMulti: FotoItem[] = [];
  
  override readonly PHOTO_PREFIX = '';

  abastecimientoAguaConfig: TableConfig = {
    tablaKey: 'abastecimientoAguaTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0%' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  tiposSaneamientoConfig: TableConfig = {
    tablaKey: 'tiposSaneamientoTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0%' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  coberturaElectricaConfig: TableConfig = {
    tablaKey: 'coberturaElectricaTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0%' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    private tableService: TableManagementService,
    private stateService: StateService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
      }
    }
    
    if (grupoAISDActual !== grupoAISDAnterior || grupoAISDActual !== grupoAISDEnDatos || hayCambios) {
      return true;
    }
    
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
  }

  protected override tieneFotografias(): boolean {
    return false;
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  getViviendasOcupadas(): string {
    if (!this.datos?.condicionOcupacionTabla || !Array.isArray(this.datos.condicionOcupacionTabla)) {
      return '____';
    }
    const ocupadas = this.datos.condicionOcupacionTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('ocupada') || item.categoria.toLowerCase().includes('ocupadas'))
    );
    return ocupadas?.casos || '____';
  }

  getPorcentajeAguaRedPublica(): string {
    if (!this.datos?.abastecimientoAguaTabla || !Array.isArray(this.datos.abastecimientoAguaTabla)) {
      return '____';
    }
    const redPublica = this.datos.abastecimientoAguaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('red pública')
    );
    return redPublica?.porcentaje || '____';
  }

  getPorcentajeAguaSinAbastecimiento(): string {
    if (!this.datos?.abastecimientoAguaTabla || !Array.isArray(this.datos.abastecimientoAguaTabla)) {
      return '____';
    }
    const sinAbastecimiento = this.datos.abastecimientoAguaTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('sin abastecimiento') || item.categoria.toLowerCase().includes('no se abastece'))
    );
    return sinAbastecimiento?.porcentaje || '____';
  }

  getPorcentajeSaneamientoRedPublica(): string {
    const tabla = this.datos?.tiposSaneamientoTabla || this.datos?.saneamientoTabla;
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const redPublica = tabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('red pública')
    );
    return redPublica?.porcentaje || '____';
  }

  getPorcentajeSaneamientoSinSaneamiento(): string {
    const tabla = this.datos?.tiposSaneamientoTabla || this.datos?.saneamientoTabla;
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    const sinSaneamiento = tabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('sin saneamiento') || item.categoria.toLowerCase().includes('no posee'))
    );
    return sinSaneamiento?.porcentaje || '____';
  }

  getPorcentajeElectricidad(): string {
    if (!this.datos?.coberturaElectricaTabla || !Array.isArray(this.datos.coberturaElectricaTabla)) {
      return '____';
    }
    const conElectricidad = this.datos.coberturaElectricaTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('con acceso') || item.categoria.toLowerCase().includes('con electricidad'))
    );
    return conElectricidad?.porcentaje || '____';
  }

  getPorcentajeSinElectricidad(): string {
    if (!this.datos?.coberturaElectricaTabla || !Array.isArray(this.datos.coberturaElectricaTabla)) {
      return '____';
    }
    const sinElectricidad = this.datos.coberturaElectricaTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('sin acceso') || item.categoria.toLowerCase().includes('sin electricidad'))
    );
    return sinElectricidad?.porcentaje || '____';
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasDesechosSolidosVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_DESECHOS,
      groupPrefix
    );
  }

  getFotografiasElectricidadVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_ELECTRICIDAD,
      groupPrefix
    );
  }

  override actualizarFotografiasFormMulti() {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasDesechosSolidosFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_DESECHOS,
      groupPrefix
    );
    this.fotografiasElectricidadFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_ELECTRICIDAD,
      groupPrefix
    );
  }

  protected override onInitCustom(): void {
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
  }

  cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = [...fotos];
    this.cdRef.markForCheck();
  }

  onFotografiasDesechosSolidosChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_DESECHOS, fotografias);
    this.fotografiasDesechosSolidosFormMulti = [...fotografias];
  }

  onFotografiasElectricidadChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_ELECTRICIDAD, fotografias);
    this.fotografiasElectricidadFormMulti = [...fotografias];
  }

  obtenerTextoSeccion10ServiciosBasicosIntro(): string {
    if (this.datos.parrafoSeccion10_servicios_basicos_intro) {
      return this.datos.parrafoSeccion10_servicios_basicos_intro;
    }
    
    const viviendasOcupadas = this.datos['condicionOcupacionTabla']?.find((item: any) => item.categoria === 'Ocupadas')?.casos || '____';
    
    return `Los servicios básicos nos indican el nivel de desarrollo de una comunidad y un saneamiento deficiente va asociado a la transmisión de enfermedades como el cólera, la diarrea, la disentería, la hepatitis A, la fiebre tifoidea y la poliomielitis, y agrava el retraso del crecimiento. En 2010, la Asamblea General de las Naciones Unidas reconoció que el acceso al agua potable salubre y limpia, y al saneamiento es un derecho humano y pidió que se realizaran esfuerzos internacionales para ayudar a los países a proporcionar agua potable e instalaciones de saneamiento salubres, limpias, accesibles y asequibles. Los servicios básicos serán descritos a continuación tomando como referencia el total de viviendas con ocupantes presentes (${viviendasOcupadas}), tal como realiza el Censo Nacional 2017.`;
  }

  onAbastecimientoAguaFieldChange(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.abastecimientoAguaConfig, index, field, value, false);
    if (field === 'casos' && this.datos['abastecimientoAguaTabla'][index] && this.datos['abastecimientoAguaTabla'][index].categoria !== 'Total') {
      const totalCasos = this.datos['abastecimientoAguaTabla']
        .filter((item: any) => item.categoria !== 'Total')
        .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
      const totalItem = this.datos['abastecimientoAguaTabla'].find((item: any) => item.categoria === 'Total');
      if (totalItem) {
        totalItem.casos = totalCasos;
        totalItem.porcentaje = '100,00 %';
      }
    }
    this.formularioService.actualizarDato('abastecimientoAguaTabla', this.datos['abastecimientoAguaTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onAbastecimientoAguaTableUpdated() {
    this.formularioService.actualizarDato('abastecimientoAguaTabla', this.datos['abastecimientoAguaTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onTiposSaneamientoFieldChange(index: number, field: string, value: any) {
    const tabla = this.datos['tiposSaneamientoTabla'] || this.datos['saneamientoTabla'];
    if (!tabla) {
      this.tableService.inicializarTabla(this.datos, this.tiposSaneamientoConfig);
    }
    const tablaKey = this.datos['tiposSaneamientoTabla'] ? 'tiposSaneamientoTabla' : 'saneamientoTabla';
    const config = { ...this.tiposSaneamientoConfig, tablaKey };
    this.tableService.actualizarFila(this.datos, config, index, field, value, false);
    const key = this.datos['tiposSaneamientoTabla'] ? 'tiposSaneamientoTabla' : 'saneamientoTabla';
    this.formularioService.actualizarDato(key, this.datos[key]);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onTiposSaneamientoTableUpdated() {
    const key = this.datos['tiposSaneamientoTabla'] ? 'tiposSaneamientoTabla' : 'saneamientoTabla';
    this.formularioService.actualizarDato(key, this.datos[key]);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onCoberturaElectricaFieldChange(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.coberturaElectricaConfig, index, field, value, false);
    if (field === 'casos' && this.datos['coberturaElectricaTabla'][index] && this.datos['coberturaElectricaTabla'][index].categoria !== 'Total') {
      const totalCasos = this.datos['coberturaElectricaTabla']
        .filter((item: any) => item.categoria !== 'Total')
        .reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
      const totalItem = this.datos['coberturaElectricaTabla'].find((item: any) => item.categoria === 'Total');
      if (totalItem) {
        totalItem.casos = totalCasos;
        totalItem.porcentaje = '100,00 %';
      }
    }
    this.formularioService.actualizarDato('coberturaElectricaTabla', this.datos['coberturaElectricaTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onCoberturaElectricaTableUpdated() {
    this.formularioService.actualizarDato('coberturaElectricaTabla', this.datos['coberturaElectricaTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  obtenerTextoServiciosAgua(): string {
    if (this.datos.textoServiciosAgua && this.datos.textoServiciosAgua !== '____') {
      return this.datos.textoServiciosAgua;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    const porcentajeRedPublica = this.getPorcentajeAguaRedPublica();
    const porcentajeSinAbastecimiento = this.getPorcentajeAguaSinAbastecimiento();
    
    return `Respecto al servicio de agua para consumo humano en la CC ${grupoAISD}, se cuenta con cobertura regular de dicho recurso en las viviendas. Es así que, según la plataforma REDINFORMA, un ${porcentajeRedPublica} de las viviendas cuenta con abastecimiento de agua por red pública. Ninguna vivienda cuenta con abastecimiento por pilón, mientras que el ${porcentajeSinAbastecimiento} restante no se abastece por ninguno de estos dos medios.`;
  }

  obtenerTextoServiciosAguaDetalle(): string {
    if (this.datos.textoServiciosAguaDetalle && this.datos.textoServiciosAguaDetalle !== '____') {
      return this.datos.textoServiciosAguaDetalle;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || 'Ayroca';
    const cuotaMensual = this.datos.cuotaMensualAgua || '4';
    
    return `De las entrevistas aplicadas durante el trabajo de campo, se obtuvo la información de que la institución responsable de la administración del servicio de abastecimiento de agua y de su respectivo mantenimiento es la JASS ${grupoAISD}. Esta junta lleva a cabo una cloración del recurso hídrico para el consumo de las familias de la CC ${grupoAISD} y también realiza el cobro de una cuota mensual de S/. ${cuotaMensual} para poder contar con recursos económicos y desarrollar sus actividades.`;
  }

  obtenerTextoServiciosDesague(): string {
    if (this.datos.textoServiciosDesague && this.datos.textoServiciosDesague !== '____') {
      return this.datos.textoServiciosDesague;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    const porcentajeRedPublica = this.getPorcentajeSaneamientoRedPublica();
    const porcentajeSinSaneamiento = this.getPorcentajeSaneamientoSinSaneamiento();
    
    return `Respecto al servicio de saneamiento en las viviendas de la CC ${grupoAISD}, se cuenta con cobertura regular. Es así que, según la plataforma REDINFORMA, un ${porcentajeRedPublica} de las viviendas cuenta con saneamiento vía red pública. Ninguna vivienda tiene saneamiento vía pozo séptico, mientras que el ${porcentajeSinSaneamiento} restante no posee saneamiento por vía de los dos medios mencionados.`;
  }

  obtenerTextoServiciosDesagueDetalle(): string {
    if (this.datos.textoServiciosDesagueDetalle && this.datos.textoServiciosDesagueDetalle !== '____') {
      return this.datos.textoServiciosDesagueDetalle;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || 'Ayroca';
    
    return `Por medio de las entrevistas aplicadas, se recolectó la información de que la institución responsable de la administración del servicio de desagüe por red pública y de su mantenimiento es, al igual que con el agua, la JASS ${grupoAISD}. Las excretas son destinadas a una poza de oxidación, ubicada fuera del entorno urbano del anexo ${grupoAISD}.`;
  }

  obtenerTextoDesechosSolidos1(): string {
    if (this.datos.textoDesechosSolidos1 && this.datos.textoDesechosSolidos1 !== '____') {
      return this.datos.textoDesechosSolidos1;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    
    return `La gestión de los desechos sólidos está a cargo de la Municipalidad Distrital de ${distrito}, aunque según los entrevistados, la recolección se realiza de manera mensual, en promedio. En ese sentido, no existe una fecha establecida en la que la municipalidad gestione los desechos sólidos. Adicional a ello, las limitaciones en cuanto a infraestructura adecuada para el tratamiento de desechos sólidos generan algunos retos en la gestión eficiente de los mismos.`;
  }

  obtenerTextoDesechosSolidos2(): string {
    if (this.datos.textoDesechosSolidos2 && this.datos.textoDesechosSolidos2 !== '____') {
      return this.datos.textoDesechosSolidos2;
    }
    
    return `Cuando los desechos sólidos son recolectados, estos son trasladados a un botadero cercano a la comunidad, donde se realiza su disposición final. La falta de un sistema más avanzado para el tratamiento de los residuos, como plantas de reciclaje o de tratamiento, dificulta el manejo integral de los desechos y plantea preocupaciones ambientales a largo plazo.`;
  }

  obtenerTextoDesechosSolidos3(): string {
    if (this.datos.textoDesechosSolidos3 && this.datos.textoDesechosSolidos3 !== '____') {
      return this.datos.textoDesechosSolidos3;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || 'Ayroca';
    
    return `Además, la comunidad enfrenta desafíos derivados de la acumulación de basura en ciertos puntos, especialmente en épocas en que la recolección es menos frecuente. Ante ello, la misma población acude al botadero para disponer sus residuos sólidos, puesto que está prohibida la incineración. Cabe mencionar que sí existen puntos dentro del anexo ${grupoAISD} en donde la población puede disponer sus desechos plásticos como botellas, aunque estos tampoco son recolectados frecuentemente por el personal de la municipalidad.`;
  }

  obtenerTextoElectricidad1(): string {
    if (this.datos.textoElectricidad1 && this.datos.textoElectricidad1 !== '____') {
      return this.datos.textoElectricidad1;
    }
    
    const porcentajeElectricidad = this.getPorcentajeElectricidad();
    const porcentajeSinElectricidad = this.getPorcentajeSinElectricidad();
    
    return `Se puede apreciar una amplia cobertura de alumbrado eléctrico en las viviendas de la comunidad campesina en cuestión. Según la plataforma REDINFORMA, se cuenta con los siguientes datos: el ${porcentajeElectricidad} de las viviendas cuenta con alumbrado eléctrico, mientras que el ${porcentajeSinElectricidad} restante no tiene el referido servicio.`;
  }

  obtenerTextoElectricidad2(): string {
    if (this.datos.textoElectricidad2 && this.datos.textoElectricidad2 !== '____') {
      return this.datos.textoElectricidad2;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    const empresa = this.datos.empresaElectrica || 'ADINELSA';
    const costoMinimo = this.datos.costoElectricidadMinimo || '20';
    const costoMaximo = this.datos.costoElectricidadMaximo || '40';
    
    return `Adicionalmente, con las entrevistas semiestructuradas se pudo validar que la empresa responsable de la provisión del servicio eléctrico y su respectivo mantenimiento es ${empresa}. Asimismo, según los entrevistados, el costo promedio por este servicio ronda entre S/. ${costoMinimo} y S/. ${costoMaximo} de acuerdo al medidor de cada vivienda. Por otro lado, cabe mencionar que son pocas las familias dentro de la CC ${grupoAISD} que cuentan con vale FISE.`;
  }

  obtenerTextoEnergiaParaCocinar(): string {
    if (this.datos.textoEnergiaParaCocinar && this.datos.textoEnergiaParaCocinar !== '____') {
      return this.datos.textoEnergiaParaCocinar;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    
    return `En la CC ${grupoAISD}, el principal combustible utilizado para cocinar es la leña. Este recurso es ampliamente aprovechado por las familias, quienes lo obtienen y almacenan para su uso diario en la preparación de alimentos. La disponibilidad constante de leña hace que sea el combustible preferido debido a su bajo costo y fácil acceso, lo que contribuye a su uso extendido en los hogares de la comunidad. La costumbre de emplear leña también está vinculada a prácticas ancestrales, en las que se ha recurrido a los recursos locales para la subsistencia.\n\nDe manera complementaria, las familias también adquieren balones de gas (GLP) para cocinar, especialmente en situaciones puntuales o cuando tienen la posibilidad económica de acceder a este recurso. Sin embargo, el uso del gas sigue siendo limitado, puesto que su disponibilidad no está presente permanentemente, lo que hace que la mayoría de la población continúe dependiendo de los recursos naturales más accesibles, como la leña.`;
  }
}

