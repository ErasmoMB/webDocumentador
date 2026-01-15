import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
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
  private actualizandoDatos: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'poblacionDistritalCahuacho', 'petDistritalCahuacho', 'ingresoFamiliarPerCapita', 'rankingIngresoPerCapita', 'petTabla', 'peaTabla', 'peaOcupadaTabla'];
  
  override readonly PHOTO_PREFIX = 'fotografiaPEA';

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    private stateService: StateService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override onInitCustom(): void {
    this.asegurarArraysValidos();
    
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

  protected override actualizarDatosCustom(): void {
    this.asegurarArraysValidos();
  }

  protected override actualizarValoresConPrefijo(): void {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
  }

  asegurarArraysValidos() {
    if (!Array.isArray(this.datos.petTabla)) {
      this.datos.petTabla = [];
    }
    if (!Array.isArray(this.datos.peaTabla)) {
      this.datos.peaTabla = [];
    }
    if (!Array.isArray(this.datos.peaOcupadaTabla)) {
      this.datos.peaOcupadaTabla = [];
    }
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
    if (!this.datos?.petTabla || !Array.isArray(this.datos.petTabla)) {
      return '____';
    }
    const total = this.datos.petTabla.find((item: any) => item.categoria === 'Total');
    return total?.porcentaje || '____';
  }

  getPorcentajePETGrupo(categoria: string): string {
    if (!this.datos?.petTabla || !Array.isArray(this.datos.petTabla)) {
      return '____';
    }
    const grupo = this.datos.petTabla.find((item: any) => 
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
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  onFotografiasChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      const suffix = groupPrefix ? groupPrefix : '';
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX}${num}Titulo${suffix}` as any, foto.titulo || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX}${num}Fuente${suffix}` as any, foto.fuente || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX}${num}Imagen${suffix}` as any, foto.imagen || '');
    });
    this.actualizarFotografiasFormMulti();
    this.actualizarDatos();
  }

  obtenerTextoSeccion7SituacionEmpleoCompleto(): string {
    if (this.datos.parrafoSeccion7_situacion_empleo_completo) {
      return this.datos.parrafoSeccion7_situacion_empleo_completo;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    return `En la CC ${grupoAISD}, la mayor parte de la población se dedica a actividades económicas de carácter independiente, siendo la ganadería la principal fuente de sustento. De manera complementaria, también se desarrolla la agricultura. Esta realidad implica que la mayoría de los comuneros se dediquen al trabajo por cuenta propia, centrado en la crianza de vacunos y ovinos como las principales especies ganaderas. Estas actividades son claves para la economía local, siendo la venta de ganado y sus derivados una fuente de ingresos importante para las familias. En el ámbito agrícola, las tierras comunales se destinan a la producción de cultivos como la papa, habas y cebada, productos que se destinan principalmente al autoconsumo y de manera esporádica a la comercialización en mercados cercanos.\n\nEl empleo dependiente en la CC ${grupoAISD} es mínimo y se encuentra limitado a aquellos que trabajan en instituciones públicas. Entre ellos se encuentran los docentes que laboran en las instituciones educativas locales, así como el personal que presta servicios en el puesto de salud. Estas ocupaciones representan un pequeño porcentaje de la fuerza laboral, ya que la mayoría de los comuneros siguen trabajando en actividades tradicionales como la ganadería y la agricultura, que forman parte de su modo de vida ancestral.`;
  }

  obtenerTextoSeccion7IngresosCompleto(): string {
    if (this.datos.parrafoSeccion7_ingresos_completo) {
      return this.datos.parrafoSeccion7_ingresos_completo;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const ingresoPerCapita = this.datos.ingresoFamiliarPerCapita || '391,06';
    const ranking = this.datos.rankingIngresoPerCapita || '1191';
    
    return `En la CC ${grupoAISD}, los ingresos de la población provienen principalmente de las actividades ganaderas y agrícolas, que son las fuentes económicas predominantes en la localidad. La venta de vacunos y ovinos, así como de productos agrícolas como papa, habas y cebada, proporciona ingresos variables, dependiendo de las condiciones climáticas y las fluctuaciones en los mercados locales. Sin embargo, debido a la dependencia de estos sectores primarios, los ingresos no son estables ni regulares, y pueden verse afectados por factores como las heladas, la falta de pasto en épocas de sequía o la baja demanda de los productos en el mercado.\n\nOtra parte de los ingresos proviene de los comuneros que participan en actividades de comercio de pequeña escala, vendiendo sus productos en mercados locales o en ferias regionales. No obstante, esta forma de generación de ingresos sigue siendo limitada y no representa una fuente principal para la mayoría de las familias. En cuanto a los pocos habitantes que se encuentran empleados de manera dependiente, tales como los maestros en las instituciones educativas y el personal del puesto de salud, sus ingresos son más regulares, aunque representan una porción muy pequeña de la población.\n\nAdicionalmente, cabe mencionar que, según el informe del PNUD 2019, el distrito de ${distrito} (jurisdicción que abarca a los poblados que conforman la CC ${grupoAISD}) cuenta con un ingreso familiar per cápita de S/. ${ingresoPerCapita} mensuales, ocupando el puesto N°${ranking} en el ranking de dicha variable, lo que convierte a dicha jurisdicción en una de las que cuentan con menor ingreso familiar per cápita en todo el país.`;
  }
}

