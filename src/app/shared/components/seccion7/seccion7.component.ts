import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion7',
  templateUrl: './seccion7.component.html',
  styleUrls: ['./seccion7.component.css']
})
export class Seccion7Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private datosSubscription?: Subscription;
  private stateSubscription?: Subscription;
  private actualizandoDatos: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'poblacionDistritalCahuacho', 'petDistritalCahuacho', 'ingresoFamiliarPerCapita', 'rankingIngresoPerCapita', 'petTabla', 'peaTabla', 'peaOcupadaTabla', 'parrafoSeccion7_situacion_empleo_completo', 'parrafoSeccion7_ingresos_completo', 'textoPET', 'textoDetalePEA', 'textoDefinicionPEA', 'textoAnalisisPEA', 'textoIndiceDesempleo', 'textoAnalisisOcupacion'];
  
  override readonly PHOTO_PREFIX = 'fotografiaPEA';
  override fotografiasCache: FotoItem[] = [];

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    private stateService: StateService,
    private sanitizer: DomSanitizer
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override onInitCustom(): void {
    this.asegurarArraysValidos();
    
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const petTablaInicial = this.datos[petTablaKey] || null;
    this.datosAnteriores[petTablaKey] = petTablaInicial ? JSON.parse(JSON.stringify(petTablaInicial)) : null;
    
    this.cargarFotografias();
    
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
    
    this.datosSubscription = this.stateService.datos$.pipe(
      debounceTime(100),
      distinctUntilChanged((prev, curr) => {
        if (!prev && !curr) return true;
        if (!prev || !curr) return false;
        const prevStr = JSON.stringify(prev);
        const currStr = JSON.stringify(curr);
        return prevStr === currStr;
      })
    ).subscribe((nuevosDatos) => {
      if (this.actualizandoDatos) return;
      if (!nuevosDatos) return;
      
      const datosAnteriores = JSON.stringify(this.datos);
      this.actualizandoDatos = true;
      this.actualizarDatos();
      this.asegurarArraysValidos();
      this.cargarFotografias();
      const datosNuevos = JSON.stringify(this.datos);
      
      if (datosAnteriores !== datosNuevos) {
        setTimeout(() => {
          this.cdRef.detectChanges();
          this.actualizandoDatos = false;
        }, 0);
      } else {
        this.actualizandoDatos = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.datosSubscription) {
      this.datosSubscription.unsubscribe();
    }
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const petTablaActual = datosActuales[petTablaKey] || null;
    const petTablaAnteriorKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const petTablaAnterior = this.datosAnteriores[petTablaAnteriorKey] || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
      }
    }
    
    if (JSON.stringify(petTablaActual) !== JSON.stringify(petTablaAnterior)) {
      hayCambios = true;
      this.datosAnteriores[petTablaAnteriorKey] = petTablaActual ? JSON.parse(JSON.stringify(petTablaActual)) : null;
    }
    
    if (grupoAISDActual !== grupoAISDAnterior || grupoAISDActual !== grupoAISDEnDatos || hayCambios) {
      return true;
    }
    
    return false;
  }

  protected override actualizarDatosCustom(): void {
    this.asegurarArraysValidos();
  }

  protected override actualizarValoresConPrefijo(): void {
    this.eliminarFilasTotal();
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
  }

  asegurarArraysValidos() {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const petTabla = this.datos[petTablaKey] || [];
    if (!Array.isArray(petTabla)) {
      this.datos[petTablaKey] = [];
    }
    if (!Array.isArray(this.datos.peaTabla)) {
      this.datos.peaTabla = [];
    }
    if (!Array.isArray(this.datos.peaOcupadaTabla)) {
      this.datos.peaOcupadaTabla = [];
    }
    this.eliminarFilasTotal();
  }

  private eliminarFilasTotal(): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    const petTabla = this.datos[petTablaKey];
    if (petTabla && Array.isArray(petTabla)) {
      const longitudOriginal = petTabla.length;
      const datosFiltrados = petTabla.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.datos[petTablaKey] = datosFiltrados;
        this.formularioService.actualizarDato(petTablaKey as any, datosFiltrados);
      }
    }
    if (this.datos.peaTabla && Array.isArray(this.datos.peaTabla)) {
      const longitudOriginal = this.datos.peaTabla.length;
      const datosFiltrados = this.datos.peaTabla.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.datos.peaTabla = datosFiltrados;
      }
    }
    if (this.datos.peaOcupadaTabla && Array.isArray(this.datos.peaOcupadaTabla)) {
      const longitudOriginal = this.datos.peaOcupadaTabla.length;
      const datosFiltrados = this.datos.peaOcupadaTabla.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.datos.peaOcupadaTabla = datosFiltrados;
      }
    }
  }

  getTablaKeyPET(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `petTabla${prefijo}` : 'petTabla';
  }

  private getTablaPET(): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'petTabla', this.seccionId);
    return pref || this.datos.petTabla || [];
  }

  getPETTablaSinTotal(): any[] {
    const petTabla = this.getTablaPET();
    if (!petTabla || !Array.isArray(petTabla)) {
      return [];
    }
    return petTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalPET(): string {
    const datosSinTotal = this.getPETTablaSinTotal();
    if (datosSinTotal.length === 0) {
      console.warn('⚠️ [Seccion7] getTotalPET - Tabla PET vacía');
      return '0';
    }
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    console.log('🔍 [Seccion7] getTotalPET - Total calculado:', total, 'de', datosSinTotal.length, 'filas');
    return total.toString();
  }

  getPEATableSinTotal(): any[] {
    if (!this.datos?.peaTabla || !Array.isArray(this.datos.peaTabla)) {
      return [];
    }
    return this.datos.peaTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalPEA(): string {
    const datosSinTotal = this.getPEATableSinTotal();
    if (datosSinTotal.length === 0) return '0';
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getTotalPEAHombres(): string {
    const datosSinTotal = this.getPEATableSinTotal();
    if (datosSinTotal.length === 0) return '0';
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const hombres = typeof item.hombres === 'number' ? item.hombres : parseInt(item.hombres) || 0;
      return sum + hombres;
    }, 0);
    return total.toString();
  }

  getTotalPEAMujeres(): string {
    const datosSinTotal = this.getPEATableSinTotal();
    if (datosSinTotal.length === 0) return '0';
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const mujeres = typeof item.mujeres === 'number' ? item.mujeres : parseInt(item.mujeres) || 0;
      return sum + mujeres;
    }, 0);
    return total.toString();
  }

  getPEAOcupadaTableSinTotal(): any[] {
    if (!this.datos?.peaOcupadaTabla || !Array.isArray(this.datos.peaOcupadaTabla)) {
      return [];
    }
    return this.datos.peaOcupadaTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalPEAOcupada(): string {
    const datosSinTotal = this.getPEAOcupadaTableSinTotal();
    if (datosSinTotal.length === 0) return '0';
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getTotalPEAOcupadaHombres(): string {
    const datosSinTotal = this.getPEAOcupadaTableSinTotal();
    if (datosSinTotal.length === 0) return '0';
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const hombres = typeof item.hombres === 'number' ? item.hombres : parseInt(item.hombres) || 0;
      return sum + hombres;
    }, 0);
    return total.toString();
  }

  getTotalPEAOcupadaMujeres(): string {
    const datosSinTotal = this.getPEAOcupadaTableSinTotal();
    if (datosSinTotal.length === 0) return '0';
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const mujeres = typeof item.mujeres === 'number' ? item.mujeres : parseInt(item.mujeres) || 0;
      return sum + mujeres;
    }, 0);
    return total.toString();
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }


  getPorcentajePET(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const poblacionKey = prefijo ? `tablaAISD2TotalPoblacion${prefijo}` : 'tablaAISD2TotalPoblacion';
    const totalPoblacion = parseInt(this.datos[poblacionKey] || this.datos.tablaAISD2TotalPoblacion || '0') || 0;
    const totalPET = parseInt(this.getTotalPET()) || 0;
    
    console.log('🔍 [Seccion7] getPorcentajePET - Debug:', {
      prefijo,
      poblacionKey,
      totalPoblacion,
      totalPET,
      datosPoblacionKey: this.datos[poblacionKey],
      datosTablaAISD2TotalPoblacion: this.datos.tablaAISD2TotalPoblacion,
      todasLasClaves: Object.keys(this.datos).filter(k => k.includes('tablaAISD2TotalPoblacion'))
    });
    
    if (totalPoblacion === 0) {
      console.warn('⚠️ [Seccion7] getPorcentajePET - Población total es 0');
      return '____';
    }
    
    if (totalPET === 0) {
      console.warn('⚠️ [Seccion7] getPorcentajePET - Total PET es 0');
      return '____';
    }
    
    const porcentaje = ((totalPET / totalPoblacion) * 100).toFixed(2);
    const resultado = porcentaje.replace('.', ',') + ' %';
    console.log('✅ [Seccion7] getPorcentajePET - Resultado:', resultado);
    return resultado;
  }

  getPorcentajePETGrupo(categoria: string): string {
    const petTabla = this.getTablaPET();
    if (!petTabla || !Array.isArray(petTabla)) {
      return '____';
    }
    const grupo = petTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase())
    );
    return grupo?.porcentaje || '____';
  }

  getPorcentajePEA(): string {
    if (!this.datos?.peaTabla || !Array.isArray(this.datos.peaTabla)) {
      return '____';
    }
    const pea = this.datos.peaTabla.find((item: any) => item.categoria === 'PEA');
    return pea?.porcentaje || '____';
  }

  getPorcentajeNoPEA(): string {
    if (!this.datos?.peaTabla || !Array.isArray(this.datos.peaTabla)) {
      return '____';
    }
    const noPea = this.datos.peaTabla.find((item: any) => item.categoria === 'No PEA');
    return noPea?.porcentaje || '____';
  }

  getPorcentajePEAHombres(): string {
    if (!this.datos?.peaTabla || !Array.isArray(this.datos.peaTabla)) {
      return '____';
    }
    const pea = this.datos.peaTabla.find((item: any) => item.categoria === 'PEA');
    return pea?.porcentajeHombres || '____';
  }

  getPorcentajeNoPEAMujeres(): string {
    if (!this.datos?.peaTabla || !Array.isArray(this.datos.peaTabla)) {
      return '____';
    }
    const noPea = this.datos.peaTabla.find((item: any) => item.categoria === 'No PEA');
    return noPea?.porcentajeMujeres || '____';
  }

  getPorcentajePEAOcupada(): string {
    if (!this.datos?.peaOcupadaTabla || !Array.isArray(this.datos.peaOcupadaTabla)) {
      return '____';
    }
    const ocupada = this.datos.peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && !item.categoria.toLowerCase().includes('desocupada')
    );
    return ocupada?.porcentaje || '____';
  }

  getPorcentajePEADesocupada(): string {
    if (!this.datos?.peaOcupadaTabla || !Array.isArray(this.datos.peaOcupadaTabla)) {
      return '____';
    }
    const desocupada = this.datos.peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('desocupada')
    );
    return desocupada?.porcentaje || '____';
  }

  getPorcentajePEAOcupadaHombres(): string {
    if (!this.datos?.peaOcupadaTabla || !Array.isArray(this.datos.peaOcupadaTabla)) {
      return '____';
    }
    const ocupada = this.datos.peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && !item.categoria.toLowerCase().includes('desocupada')
    );
    return ocupada?.porcentajeHombres || '____';
  }

  getPorcentajePEAOcupadaMujeres(): string {
    if (!this.datos?.peaOcupadaTabla || !Array.isArray(this.datos.peaOcupadaTabla)) {
      return '____';
    }
    const ocupada = this.datos.peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && !item.categoria.toLowerCase().includes('desocupada')
    );
    return ocupada?.porcentajeMujeres || '____';
  }

  trackByIndex(index: number): number {
    return index;
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasPEAVista(): FotoItem[] {
    if (this.fotografiasCache && this.fotografiasCache.length > 0) {
      return this.fotografiasCache;
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotografias = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    return fotografias || [];
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
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

  onFotografiasChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  obtenerTextoSeccion7SituacionEmpleoCompleto(): string {
    if (this.datos.parrafoSeccion7_situacion_empleo_completo) {
      return this.datos.parrafoSeccion7_situacion_empleo_completo;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    return `En la CC ${grupoAISD}, la mayor parte de la población se dedica a actividades económicas de carácter independiente, siendo la ganadería la principal fuente de sustento. De manera complementaria, también se desarrolla la agricultura. Esta realidad implica que la mayoría de los comuneros se dediquen al trabajo por cuenta propia, centrado en la crianza de vacunos y ovinos como las principales especies ganaderas. Estas actividades son claves para la economía local, siendo la venta de ganado y sus derivados una fuente de ingresos importante para las familias. En el ámbito agrícola, las tierras comunales se destinan a la producción de cultivos como la papa, habas y cebada, productos que se destinan principalmente al autoconsumo y de manera esporádica a la comercialización en mercados cercanos.\n\nEl empleo dependiente en la CC ${grupoAISD} es mínimo y se encuentra limitado a aquellos que trabajan en instituciones públicas. Entre ellos se encuentran los docentes que laboran en las instituciones educativas locales, así como el personal que presta servicios en el puesto de salud. Estas ocupaciones representan un pequeño porcentaje de la fuerza laboral, ya que la mayoría de los comuneros siguen trabajando en actividades tradicionales como la ganadería y la agricultura, que forman parte de su modo de vida ancestral.`;
  }

  obtenerTextoSeccion7IngresosCompleto(): string {
    if (this.datos.parrafoSeccion7_ingresos_completo) {
      return this.datos.parrafoSeccion7_ingresos_completo;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const ingresoPerCapita = this.datos.ingresoFamiliarPerCapita || '____';
    const ranking = this.datos.rankingIngresoPerCapita || '____';
    
    return `En la CC ${grupoAISD}, los ingresos de la población provienen principalmente de las actividades ganaderas y agrícolas, que son las fuentes económicas predominantes en la localidad. La venta de vacunos y ovinos, así como de productos agrícolas como papa, habas y cebada, proporciona ingresos variables, dependiendo de las condiciones climáticas y las fluctuaciones en los mercados locales. Sin embargo, debido a la dependencia de estos sectores primarios, los ingresos no son estables ni regulares, y pueden verse afectados por factores como las heladas, la falta de pasto en épocas de sequía o la baja demanda de los productos en el mercado.\n\nOtra parte de los ingresos proviene de los comuneros que participan en actividades de comercio de pequeña escala, vendiendo sus productos en mercados locales o en ferias regionales. No obstante, esta forma de generación de ingresos sigue siendo limitada y no representa una fuente principal para la mayoría de las familias. En cuanto a los pocos habitantes que se encuentran empleados de manera dependiente, tales como los maestros en las instituciones educativas y el personal del puesto de salud, sus ingresos son más regulares, aunque representan una porción muy pequeña de la población.\n\nAdicionalmente, cabe mencionar que, según el informe del PNUD 2019, el distrito de ${distrito} (jurisdicción que abarca a los poblados que conforman la CC ${grupoAISD}) cuenta con un ingreso familiar per cápita de S/. ${ingresoPerCapita} mensuales, ocupando el puesto N°${ranking} en el ranking de dicha variable, lo que convierte a dicha jurisdicción en una de las que cuentan con menor ingreso familiar per cápita en todo el país.`;
  }

  obtenerTextoPET(): string {
    if (this.datos.textoPET && this.datos.textoPET !== '____') {
      return this.datos.textoPET;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajePET = this.getPorcentajePET();
    const porcentaje1529 = this.getPorcentajePETGrupo('15 a 29 años');
    const porcentaje65 = this.getPorcentajePETGrupo('65 años a más');
    
    return `En concordancia con el Convenio 138 de la Organización Internacional de Trabajo (OIT), aprobado por Resolución Legislativa Nº27453 de fecha 22 de mayo del 2001 y ratificado por DS Nº038-2001-RE, publicado el 31 de mayo de 2001, la población cumplida los 14 años de edad se encuentra en edad de trabajar.\n\nLa población en edad de trabajar (PET) de la CC ${grupoAISD}, considerada desde los 15 años a más, se compone del ${porcentajePET} de la población total. El bloque etario que más aporta a la PET es el de 15 a 29 años, pues representa el ${porcentaje1529} de este grupo poblacional. Por otro lado, el grupo etario que menos aporta al indicador es el de 65 años a más al representar solamente un ${porcentaje65}.`;
  }

  obtenerTextoDetalePEA(): string {
    if (this.datos.textoDetalePEA && this.datos.textoDetalePEA !== '____') {
      return this.datos.textoDetalePEA;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const poblacionDistrital = this.datos.poblacionDistritalCahuacho || '610';
    const petDistrital = this.datos.petDistritalCahuacho || '461';
    
    return `No obstante, los indicadores de la PEA, tanto de su cantidad total como por subgrupos (Ocupada y Desocupada), se describen a nivel distrital siguiendo la información oficial de la publicación "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI. Para ello es importante tomar en cuenta que la población distrital de ${distrito}, jurisdicción donde se ubica el AISD en cuestión, es de ${poblacionDistrital} personas, y que la PET (de 14 años a más) al mismo nivel está conformada por ${petDistrital} personas.`;
  }

  obtenerTextoDefinicionPEA(): string {
    if (this.datos.textoDefinicionPEA && this.datos.textoDefinicionPEA !== '____') {
      return this.datos.textoDefinicionPEA;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `La Población Económicamente Activa (PEA) constituye un indicador fundamental para comprender la dinámica económica y social de cualquier jurisdicción al nivel que se requiera. En este apartado, se presenta una descripción de la PEA del distrito de ${distrito}, jurisdicción que abarca a las poblaciones de la CC ${grupoAISD}. Para ello, se emplea la fuente "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI, con el cual se puede visualizar las características demográficas de la población en capacidad de trabajar en el distrito en cuestión.`;
  }

  obtenerTextoAnalisisPEA(): string {
    if (this.datos.textoAnalisisPEA && this.datos.textoAnalisisPEA !== '____') {
      return this.datos.textoAnalisisPEA;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const porcentajePEA = this.getPorcentajePEA();
    const porcentajeNoPEA = this.getPorcentajeNoPEA();
    const porcentajePEAHombres = this.getPorcentajePEAHombres();
    const porcentajeNoPEAMujeres = this.getPorcentajeNoPEAMujeres();
    
    return `Del cuadro precedente, se aprecia que la PEA del distrito de ${distrito} representa un ${porcentajePEA} del total de la PET de la jurisdicción, mientras que la No PEA abarca el ${porcentajeNoPEA} restante. Asimismo, se visualiza que los hombres se encuentran predominantemente dentro del indicador de PEA con un ${porcentajePEAHombres}; mientras que, en el caso de las mujeres, se hallan mayormente en el indicador de No PEA (${porcentajeNoPEAMujeres}).`;
  }

  obtenerTextoIndiceDesempleo(): string {
    if (this.datos.textoIndiceDesempleo && this.datos.textoIndiceDesempleo !== '____') {
      return this.datos.textoIndiceDesempleo;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `El índice de desempleo es un indicador clave para evaluar la salud económica de una jurisdicción de cualquier nivel, ya que refleja la proporción de la Población Económicamente Activa (PEA) que se encuentra en busca de empleo, pero no logra obtenerlo. En este ítem, se caracteriza el índice de desempleo del distrito de ${distrito}, el cual abarca los poblados de la CC ${grupoAISD}. Para ello, se emplea la fuente "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI, con el cual se puede visualizar las características demográficas de la población que forma parte de la PEA y distinguir entre sus subgrupos (Ocupada y Desocupada).`;
  }

  obtenerTextoPETConResaltado(): SafeHtml {
    const texto = this.obtenerTextoPET();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajePET = this.getPorcentajePET();
    const porcentaje1529 = this.getPorcentajePETGrupo('15 a 29 años');
    const porcentaje65 = this.getPorcentajePETGrupo('65 años a más');
    
    let html = this.escapeHtml(texto);
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (porcentajePET && porcentajePET !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajePET), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajePET)}</span>`);
    }
    if (porcentaje1529 && porcentaje1529 !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentaje1529), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentaje1529)}</span>`);
    }
    if (porcentaje65 && porcentaje65 !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentaje65), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentaje65)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoDetalePEAConResaltado(): SafeHtml {
    const texto = this.obtenerTextoDetalePEA();
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const poblacionDistrital = this.datos.poblacionDistritalCahuacho || '610';
    const petDistrital = this.datos.petDistritalCahuacho || '461';
    
    let html = this.escapeHtml(texto);
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (poblacionDistrital && poblacionDistrital !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(poblacionDistrital), 'g'), `<span class="data-section">${this.escapeHtml(poblacionDistrital)}</span>`);
    }
    if (petDistrital && petDistrital !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(petDistrital), 'g'), `<span class="data-section">${this.escapeHtml(petDistrital)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoDefinicionPEAConResaltado(): SafeHtml {
    const texto = this.obtenerTextoDefinicionPEA();
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let html = this.escapeHtml(texto);
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoAnalisisPEAConResaltado(): SafeHtml {
    const texto = this.obtenerTextoAnalisisPEA();
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const porcentajePEA = this.getPorcentajePEA();
    const porcentajeNoPEA = this.getPorcentajeNoPEA();
    const porcentajePEAHombres = this.getPorcentajePEAHombres();
    const porcentajeNoPEAMujeres = this.getPorcentajeNoPEAMujeres();
    
    let html = this.escapeHtml(texto);
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (porcentajePEA && porcentajePEA !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajePEA), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajePEA)}</span>`);
    }
    if (porcentajeNoPEA && porcentajeNoPEA !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeNoPEA), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeNoPEA)}</span>`);
    }
    if (porcentajePEAHombres && porcentajePEAHombres !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajePEAHombres), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajePEAHombres)}</span>`);
    }
    if (porcentajeNoPEAMujeres && porcentajeNoPEAMujeres !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeNoPEAMujeres), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeNoPEAMujeres)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoSeccion7SituacionEmpleoCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion7SituacionEmpleoCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let html = this.escapeHtml(texto);
    html = html.replace(/\n/g, '<br>');
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoSeccion7IngresosCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion7IngresosCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const ingresoPerCapita = this.datos.ingresoFamiliarPerCapita || '____';
    const ranking = this.datos.rankingIngresoPerCapita || '____';
    
    let html = this.escapeHtml(texto);
    html = html.replace(/\n/g, '<br>');
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (ingresoPerCapita && ingresoPerCapita !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(ingresoPerCapita), 'g'), `<span class="data-manual">${this.escapeHtml(ingresoPerCapita)}</span>`);
    }
    if (ranking && ranking !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(ranking), 'g'), `<span class="data-manual">${this.escapeHtml(ranking)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  obtenerTextoAnalisisOcupacion(): string {
    if (this.datos.textoAnalisisOcupacion && this.datos.textoAnalisisOcupacion !== '____') {
      return this.datos.textoAnalisisOcupacion;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const porcentajeDesocupada = this.getPorcentajePEADesocupada();
    const porcentajeOcupadaHombres = this.getPorcentajePEAOcupadaHombres();
    const porcentajeOcupadaMujeres = this.getPorcentajePEAOcupadaMujeres();
    
    return `Del cuadro precedente, se halla que en el distrito de ${distrito} la PEA Desocupada representa un ${porcentajeDesocupada} del total de la PEA. En adición a ello, se aprecia que tanto hombres como mujeres se encuentran predominantemente en el indicador de PEA Ocupada, con porcentajes de ${porcentajeOcupadaHombres} y ${porcentajeOcupadaMujeres}, respectivamente.`;
  }

  obtenerTextoIndiceDesempleoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoIndiceDesempleo();
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let html = this.escapeHtml(texto);
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoAnalisisOcupacionConResaltado(): SafeHtml {
    const texto = this.obtenerTextoAnalisisOcupacion();
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const porcentajeDesocupada = this.getPorcentajePEADesocupada();
    const porcentajeOcupadaHombres = this.getPorcentajePEAOcupadaHombres();
    const porcentajeOcupadaMujeres = this.getPorcentajePEAOcupadaMujeres();
    
    let html = this.escapeHtml(texto);
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (porcentajeDesocupada && porcentajeDesocupada !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeDesocupada), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeDesocupada)}</span>`);
    }
    if (porcentajeOcupadaHombres && porcentajeOcupadaHombres !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeOcupadaHombres), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeOcupadaHombres)}</span>`);
    }
    if (porcentajeOcupadaMujeres && porcentajeOcupadaMujeres !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeOcupadaMujeres), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeOcupadaMujeres)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

