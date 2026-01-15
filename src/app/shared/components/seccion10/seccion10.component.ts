import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion10',
  templateUrl: './seccion10.component.html',
  styleUrls: ['./seccion10.component.css']
})
export class Seccion10Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'parrafoSeccion10_servicios_basicos_intro', 'abastecimientoAguaTabla', 'cuotaMensualAgua', 'tiposSaneamientoTabla', 'saneamientoTabla', 'coberturaElectricaTabla', 'empresaElectrica', 'costoElectricidadMinimo', 'costoElectricidadMaximo'];
  
  readonly PHOTO_PREFIX_DESECHOS = 'fotografiaDesechosSolidos';
  readonly PHOTO_PREFIX_ELECTRICIDAD = 'fotografiaElectricidad';
  
  fotografiasDesechosSolidosFormMulti: FotoItem[] = [];
  fotografiasElectricidadFormMulti: FotoItem[] = [];
  
  override readonly PHOTO_PREFIX = '';

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef
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
    this.actualizarFotografiasFormMulti();
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
  }

  onFotografiasDesechosSolidosChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      const suffix = groupPrefix ? groupPrefix : '';
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX_DESECHOS}${num}Titulo${suffix}` as any, foto.titulo || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX_DESECHOS}${num}Fuente${suffix}` as any, foto.fuente || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX_DESECHOS}${num}Imagen${suffix}` as any, foto.imagen || '');
    });
    this.actualizarFotografiasFormMulti();
    this.actualizarDatos();
  }

  onFotografiasElectricidadChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      const suffix = groupPrefix ? groupPrefix : '';
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX_ELECTRICIDAD}${num}Titulo${suffix}` as any, foto.titulo || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX_ELECTRICIDAD}${num}Fuente${suffix}` as any, foto.fuente || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX_ELECTRICIDAD}${num}Imagen${suffix}` as any, foto.imagen || '');
    });
    this.actualizarFotografiasFormMulti();
    this.actualizarDatos();
  }

  obtenerTextoSeccion10ServiciosBasicosIntro(): string {
    if (this.datos.parrafoSeccion10_servicios_basicos_intro) {
      return this.datos.parrafoSeccion10_servicios_basicos_intro;
    }
    
    const viviendasOcupadas = this.datos['condicionOcupacionTabla']?.find((item: any) => item.categoria === 'Ocupadas')?.casos || '____';
    
    return `Los servicios básicos nos indican el nivel de desarrollo de una comunidad y un saneamiento deficiente va asociado a la transmisión de enfermedades como el cólera, la diarrea, la disentería, la hepatitis A, la fiebre tifoidea y la poliomielitis, y agrava el retraso del crecimiento. En 2010, la Asamblea General de las Naciones Unidas reconoció que el acceso al agua potable salubre y limpia, y al saneamiento es un derecho humano y pidió que se realizaran esfuerzos internacionales para ayudar a los países a proporcionar agua potable e instalaciones de saneamiento salubres, limpias, accesibles y asequibles. Los servicios básicos serán descritos a continuación tomando como referencia el total de viviendas con ocupantes presentes (${viviendasOcupadas}), tal como realiza el Censo Nacional 2017.`;
  }

  inicializarAbastecimientoAgua() {
    if (!this.datos['abastecimientoAguaTabla'] || this.datos['abastecimientoAguaTabla'].length === 0) {
      this.datos['abastecimientoAguaTabla'] = [
        { categoria: 'Viviendas con abastecimiento de agua por red pública', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas con abastecimiento de agua por pilón', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas sin abastecimiento de agua por los medios mencionados', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('abastecimientoAguaTabla', this.datos['abastecimientoAguaTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  agregarAbastecimientoAgua() {
    if (!this.datos['abastecimientoAguaTabla']) {
      this.inicializarAbastecimientoAgua();
    }
    const totalIndex = this.datos['abastecimientoAguaTabla'].findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['abastecimientoAguaTabla'].splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['abastecimientoAguaTabla'].push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('abastecimientoAguaTabla', this.datos['abastecimientoAguaTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarAbastecimientoAgua(index: number) {
    if (this.datos['abastecimientoAguaTabla'] && this.datos['abastecimientoAguaTabla'].length > 1) {
      const item = this.datos['abastecimientoAguaTabla'][index];
      if (item.categoria !== 'Total') {
        this.datos['abastecimientoAguaTabla'].splice(index, 1);
        this.formularioService.actualizarDato('abastecimientoAguaTabla', this.datos['abastecimientoAguaTabla']);
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarAbastecimientoAgua(index: number, field: string, value: any) {
    if (!this.datos['abastecimientoAguaTabla']) {
      this.inicializarAbastecimientoAgua();
    }
    if (this.datos['abastecimientoAguaTabla'][index]) {
      this.datos['abastecimientoAguaTabla'][index][field] = value;
      if (field === 'casos' && this.datos['abastecimientoAguaTabla'][index].categoria !== 'Total') {
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
  }

  inicializarTiposSaneamiento() {
    if ((!this.datos['tiposSaneamientoTabla'] || this.datos['tiposSaneamientoTabla'].length === 0) && (!this.datos['saneamientoTabla'] || this.datos['saneamientoTabla'].length === 0)) {
      this.datos['tiposSaneamientoTabla'] = [
        { categoria: 'Viviendas con saneamiento vía red pública', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas con saneamiento vía pozo séptico', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas sin saneamiento vía los medios mencionados', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('tiposSaneamientoTabla', this.datos['tiposSaneamientoTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  agregarTiposSaneamiento() {
    if (!this.datos['tiposSaneamientoTabla'] && !this.datos['saneamientoTabla']) {
      this.inicializarTiposSaneamiento();
    }
    const tabla = this.datos['tiposSaneamientoTabla'] || this.datos['saneamientoTabla'];
    if (tabla) {
      const totalIndex = tabla.findIndex((item: any) => item.categoria === 'Total');
      if (totalIndex >= 0) {
        tabla.splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
      } else {
        tabla.push({ categoria: '', casos: 0, porcentaje: '0%' });
      }
      const key = this.datos['tiposSaneamientoTabla'] ? 'tiposSaneamientoTabla' : 'saneamientoTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  eliminarTiposSaneamiento(index: number) {
    const tabla = this.datos['tiposSaneamientoTabla'] || this.datos['saneamientoTabla'];
    if (tabla && tabla.length > 1) {
      const item = tabla[index];
      if (item.categoria !== 'Total') {
        tabla.splice(index, 1);
        const key = this.datos['tiposSaneamientoTabla'] ? 'tiposSaneamientoTabla' : 'saneamientoTabla';
        this.formularioService.actualizarDato(key, tabla);
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarTiposSaneamiento(index: number, field: string, value: any) {
    if (!this.datos['tiposSaneamientoTabla'] && !this.datos['saneamientoTabla']) {
      this.inicializarTiposSaneamiento();
    }
    const tabla = this.datos['tiposSaneamientoTabla'] || this.datos['saneamientoTabla'];
    if (tabla && tabla[index]) {
      tabla[index][field] = value;
      const key = this.datos['tiposSaneamientoTabla'] ? 'tiposSaneamientoTabla' : 'saneamientoTabla';
      this.formularioService.actualizarDato(key, tabla);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  inicializarCoberturaElectrica() {
    if (!this.datos['coberturaElectricaTabla'] || this.datos['coberturaElectricaTabla'].length === 0) {
      this.datos['coberturaElectricaTabla'] = [
        { categoria: 'Viviendas con acceso a alumbrado eléctrico', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas sin acceso a alumbrado eléctrico', casos: 0, porcentaje: '0%' },
        { categoria: 'Total', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('coberturaElectricaTabla', this.datos['coberturaElectricaTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  agregarCoberturaElectrica() {
    if (!this.datos['coberturaElectricaTabla']) {
      this.inicializarCoberturaElectrica();
    }
    const totalIndex = this.datos['coberturaElectricaTabla'].findIndex((item: any) => item.categoria === 'Total');
    if (totalIndex >= 0) {
      this.datos['coberturaElectricaTabla'].splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['coberturaElectricaTabla'].push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('coberturaElectricaTabla', this.datos['coberturaElectricaTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarCoberturaElectrica(index: number) {
    if (this.datos['coberturaElectricaTabla'] && this.datos['coberturaElectricaTabla'].length > 1) {
      const item = this.datos['coberturaElectricaTabla'][index];
      if (item.categoria !== 'Total') {
        this.datos['coberturaElectricaTabla'].splice(index, 1);
        this.formularioService.actualizarDato('coberturaElectricaTabla', this.datos['coberturaElectricaTabla']);
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarCoberturaElectrica(index: number, field: string, value: any) {
    if (!this.datos['coberturaElectricaTabla']) {
      this.inicializarCoberturaElectrica();
    }
    if (this.datos['coberturaElectricaTabla'][index]) {
      this.datos['coberturaElectricaTabla'][index][field] = value;
      if (field === 'casos' && this.datos['coberturaElectricaTabla'][index].categoria !== 'Total') {
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
  }
}

