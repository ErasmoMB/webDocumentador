import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion21',
  templateUrl: './seccion21.component.html',
  styleUrls: ['./seccion21.component.css']
})
export class Seccion21Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  fotografiasCahuachoCache: any[] = [];
  override watchedFields: string[] = ['parrafoSeccion21_aisi_intro_completo', 'parrafoSeccion21_centro_poblado_completo', 'centroPobladoAISI', 'provinciaSeleccionada', 'departamentoSeleccionado', 'leyCreacionDistrito', 'fechaCreacionDistrito', 'distritoSeleccionado', 'distritoAnterior', 'origenPobladores1', 'origenPobladores2', 'departamentoOrigen', 'anexosEjemplo', 'ubicacionCpTabla'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuacho';

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
    this.actualizarFotografiasCache();
    if (this.modoFormulario) {
      if (this.seccionId) {
        setTimeout(() => {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }, 0);
      }
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        if (this.seccionId) {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }
      });
    } else {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasCache();
    }
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
      }
    }
    
    return hayCambios;
  }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
    this.actualizarFotografiasCache();
  }

  protected override actualizarDatos(): void {
    this.datos = this.formularioService.obtenerDatos();
    this.actualizarFotografiasCache();
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = JSON.parse(JSON.stringify((this.datos as any)[campo] || null));
    });
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  protected override loadSectionData(): void {
    const fieldsToLoad = this.fieldMapping.getFieldsForSection(this.seccionId);
    if (fieldsToLoad.length > 0) {
      this.sectionDataLoader.loadSectionData(this.seccionId, fieldsToLoad).subscribe();
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

  override actualizarFotografiasCache() {
    this.fotografiasCahuachoCache = this.getFotografiasCahuachoVista();
  }

  getFotografiasCahuachoVista(): FotoItem[] {
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
  }

  obtenerTextoSeccion21AISIIntroCompleto(): string {
    if (this.datos.parrafoSeccion21_aisi_intro_completo) {
      return this.datos.parrafoSeccion21_aisi_intro_completo;
    }
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const provincia = this.datos.provinciaSeleccionada || 'Caravelí';
    const departamento = this.datos.departamentoSeleccionado || 'Arequipa';
    return `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el CP ${centroPoblado}, capital distrital de la jurisdicción homónima, en la provincia de ${provincia}, en el departamento de ${departamento}. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, es la localidad de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`;
  }

  obtenerTextoSeccion21CentroPobladoCompleto(): string {
    if (this.datos.parrafoSeccion21_centro_poblado_completo) {
      return this.datos.parrafoSeccion21_centro_poblado_completo;
    }
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const provincia = this.datos.provinciaSeleccionada || 'Caravelí';
    const departamento = this.datos.departamentoSeleccionado || 'Arequipa';
    const ley = this.datos.leyCreacionDistrito || '8004';
    const fecha = this.datos.fechaCreacionDistrito || '22 de febrero de 1935';
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const distritoAnterior = this.datos.distritoAnterior || 'Caravelí';
    const origen1 = this.datos.origenPobladores1 || 'Caravelí';
    const origen2 = this.datos.origenPobladores2 || 'Parinacochas';
    const deptoOrigen = this.datos.departamentoOrigen || 'Ayacucho';
    const anexos = this.datos.anexosEjemplo || 'Ayroca o Sóndor';
    return `El CP ${centroPoblado} es la capital del distrito homónimo, perteneciente a la provincia de ${provincia}, en el departamento de ${departamento}. Su designación como capital distrital se oficializó mediante la Ley N°${ley}, promulgada el ${fecha}, fecha en que se creó el distrito de ${distrito}. Antes de ello, este asentamiento era un caserío del distrito de ${distritoAnterior}, marcando un importante cambio en su desarrollo administrativo y social.\n\nLos primeros pobladores de ${centroPoblado} provenían principalmente de ${origen1} y la provincia de ${origen2}, en ${deptoOrigen}. Entre las familias pioneras destacan apellidos como Espinoza, Miralles, De la Cruz y Aguayo, quienes sentaron las bases de la localidad actual. El nombre "${centroPoblado}" proviene del término quechua Ccahuayhuachu, que se traduce como "mírame desde aquí", reflejando posiblemente su ubicación estratégica o una percepción cultural del entorno.\n\nA diferencia de algunos anexos del distrito, como ${anexos}, que son centros administrativos de sus respectivas comunidades campesinas, el centro poblado ${centroPoblado} no se encuentra dentro de los límites de ninguna comunidad campesina. Esto le otorga una característica particular dentro del contexto rural, marcando su identidad como un núcleo urbano-administrativo independiente en el distrito.`;
  }

  inicializarUbicacionCp() {
    if (!this.datos['ubicacionCpTabla'] || this.datos['ubicacionCpTabla'].length === 0) {
      this.datos['ubicacionCpTabla'] = [
        { localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' }
      ];
      this.formularioService.actualizarDato('ubicacionCpTabla', this.datos['ubicacionCpTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  agregarUbicacionCp() {
    if (!this.datos['ubicacionCpTabla']) {
      this.inicializarUbicacionCp();
    }
    this.datos['ubicacionCpTabla'].push({ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' });
    this.formularioService.actualizarDato('ubicacionCpTabla', this.datos['ubicacionCpTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarUbicacionCp(index: number) {
    if (this.datos['ubicacionCpTabla'] && this.datos['ubicacionCpTabla'].length > 1) {
      this.datos['ubicacionCpTabla'].splice(index, 1);
      this.formularioService.actualizarDato('ubicacionCpTabla', this.datos['ubicacionCpTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarUbicacionCp(index: number, field: string, value: any) {
    if (!this.datos['ubicacionCpTabla']) {
      this.inicializarUbicacionCp();
    }
    if (this.datos['ubicacionCpTabla'][index]) {
      this.datos['ubicacionCpTabla'][index][field] = value;
      this.formularioService.actualizarDato('ubicacionCpTabla', this.datos['ubicacionCpTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }
}

