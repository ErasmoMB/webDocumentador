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
  selector: 'app-seccion19',
  templateUrl: './seccion19.component.html',
  styleUrls: ['./seccion19.component.css']
})
export class Seccion19Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['grupoAISD', 'comunerosCalificados', 'autoridades', 'textoOrganizacionSocial'];
  
  override readonly PHOTO_PREFIX = 'fotografiaOrganizacionSocial';

  autoridadesConfig: TableConfig = {
    tablaKey: 'autoridades',
    totalKey: 'organizacion',
    campoTotal: 'organizacion',
    campoPorcentaje: 'cargo',
    estructuraInicial: [{ organizacion: '', cargo: '', nombre: '' }]
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

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasOrganizacionSocialVista(): FotoItem[] {
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
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.imageService.saveImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      fotografias,
      groupPrefix
    );
    this.fotografiasCache = [...fotografias];
    this.fotografiasFormMulti = [...fotografias];
    this.cdRef.detectChanges();
  }


  shouldShowOrgCell(index: number, autoridades: any[]): boolean {
    if (!autoridades || index === 0) {
      return true;
    }
    return autoridades[index].organizacion !== autoridades[index - 1].organizacion;
  }

  getOrgRowSpan(organizacion: string, autoridades: any[]): number {
    if (!autoridades) {
      return 1;
    }
    return autoridades.filter((item: any) => item.organizacion === organizacion).length;
  }

  obtenerTextoOrganizacionSocial(): string {
    if (this.datos.textoOrganizacionSocial && this.datos.textoOrganizacionSocial !== '____') {
      return this.datos.textoOrganizacionSocial;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || 'Ayroca';
    const comunerosCalificados = this.datos.comunerosCalificados || '65';
    
    return `La organización social más importante y con mayor poder es la CC ${grupoAISD}. Esta comunidad cuenta con una estructura organizativa que incluye una junta directiva, encargada de la gestión y representación legal de la comunidad. Por otra parte, la toma de decisiones clave se realiza en la asamblea general, en la cual participan y votan todos los comuneros activos que están debidamente inscritos en el padrón comunal. Esta asamblea es el máximo órgano de deliberación, donde se discuten temas de interés comunitario, como el uso de la tierra, los proyectos de desarrollo y la organización de actividades económicas y sociales.\n\nAl momento del trabajo de campo, según los entrevistados, se cuenta con ${comunerosCalificados} comuneros calificados dentro de la CC ${grupoAISD}. Estos se encuentran inscritos en el padrón, el cual es actualizado cada dos años antes de cada elección para una nueva junta directiva. Asimismo, cabe mencionar que esta última puede reelegirse por un período adicional, con la posibilidad de que una misma junta pueda gestionar por cuatro años como máximo.\n\nRespecto al rol de la mujer, es posible que estas puedan ser inscritas como comuneras calificadas dentro del padrón comunal. No obstante, solo se permite la inscripción si estas mujeres son viudas o madres solteras. De lo contrario, es el varón quien asume la responsabilidad. Por otra parte, dentro de la estructura interna de la comunidad campesina se cuenta con instancias especializadas como la JASS, la Asociación de Vicuñas y la Junta de Usuarios de Riego. Cada una de ellas cuenta con funciones específicas y sus representantes también son electos democráticamente.\n\nTambién se hallan autoridades locales como el teniente gobernador, quien es el representante del gobierno central a nivel local. El teniente gobernador tiene la función de coordinar y mediar entre las instituciones del Estado y la comunidad, así como de velar por el orden público. Asimismo, el agente municipal es responsable de la supervisión y cumplimiento de las normativas municipales, así como de brindar apoyo en la organización de actividades locales.`;
  }
}

