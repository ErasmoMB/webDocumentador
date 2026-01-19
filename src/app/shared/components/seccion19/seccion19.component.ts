import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion19',
  templateUrl: './seccion19.component.html',
  styleUrls: ['./seccion19.component.css']
})
export class Seccion19Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['grupoAISD', 'comunerosCalificados', 'autoridades', 'textoOrganizacionSocial'];
  
  override readonly PHOTO_PREFIX = 'fotografiaOrganizacionSocial';

  autoridadesConfig: TableConfig = {
    tablaKey: 'autoridades',
    totalKey: 'organizacion',
    campoTotal: 'organizacion',
    estructuraInicial: [{ organizacion: '', cargo: '', nombre: '' }]
  };

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    protected override autoLoader: AutoBackendDataLoaderService,
    private tableService: TableManagementService,
    private stateService: StateService,
    private groupConfig: GroupConfigService,
    private sanitizer: DomSanitizer
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef, autoLoader);
  }

  protected getSectionKey(): string {
    return 'seccion19_aisd';
  }

  protected getLoadParameters(): string[] | null {
    const ccppDesdeGrupo = this.groupConfig.getAISDCCPPActivos();
    if (ccppDesdeGrupo && ccppDesdeGrupo.length > 0) {
      return ccppDesdeGrupo;
    }
    return null;
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasFormMulti();
    this.cargarFotografias();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  getTablaKeyAutoridades(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `autoridades${prefijo}` : 'autoridades';
  }

  getTablaAutoridades(): any[] {
    const tabaKey = this.getTablaKeyAutoridades();
    const tabla = this.datos[tabaKey] || this.datos.autoridades || [];
    return Array.isArray(tabla) ? tabla : [];
  }

  getFieldIdTextoOrganizacion(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoOrganizacionSocial${prefijo}` : 'textoOrganizacionSocial';
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
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
    if (this.fotografiasCache && this.fotografiasCache.length > 0) {
      return this.fotografiasCache;
    }
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
    const fieldId = this.getFieldIdTextoOrganizacion();
    const textoConPrefijo = this.datos[fieldId];
    const textoSinPrefijo = this.datos.textoOrganizacionSocial;
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const comunerosCalificados = this.datos.comunerosCalificados || '65';
    
    const textoPorDefecto = `La organización social más importante y con mayor poder es la CC ${grupoAISD}. Esta comunidad cuenta con una estructura organizativa que incluye una junta directiva, encargada de la gestión y representación legal de la comunidad. Por otra parte, la toma de decisiones clave se realiza en la asamblea general, en la cual participan y votan todos los comuneros activos que están debidamente inscritos en el padrón comunal. Esta asamblea es el máximo órgano de deliberación, donde se discuten temas de interés comunitario, como el uso de la tierra, los proyectos de desarrollo y la organización de actividades económicas y sociales.\n\nAl momento del trabajo de campo, según los entrevistados, se cuenta con ${comunerosCalificados} comuneros calificados dentro de la CC ${grupoAISD}. Estos se encuentran inscritos en el padrón, el cual es actualizado cada dos años antes de cada elección para una nueva junta directiva. Asimismo, cabe mencionar que esta última puede reelegirse por un período adicional, con la posibilidad de que una misma junta pueda gestionar por cuatro años como máximo.\n\nRespecto al rol de la mujer, es posible que estas puedan ser inscritas como comuneras calificadas dentro del padrón comunal. No obstante, solo se permite la inscripción si estas mujeres son viudas o madres solteras. De lo contrario, es el varón quien asume la responsabilidad. Por otra parte, dentro de la estructura interna de la comunidad campesina se cuenta con instancias especializadas como la JASS, la Asociación de Vicuñas y la Junta de Usuarios de Riego. Cada una de ellas cuenta con funciones específicas y sus representantes también son electos democráticamente.\n\nTambién se hallan autoridades locales como el teniente gobernador, quien es el representante del gobierno central a nivel local. El teniente gobernador tiene la función de coordinar y mediar entre las instituciones del Estado y la comunidad, así como de velar por el orden público. Asimismo, el agente municipal es responsable de la supervisión y cumplimiento de las normativas municipales, así como de brindar apoyo en la organización de actividades locales.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado
        .replace(/CC\s*___/g, `CC ${grupoAISD}`)
        .replace(/CC\s*____/g, `CC ${grupoAISD}`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoOrganizacionConResaltado(): SafeHtml {
    const texto = this.obtenerTextoOrganizacionSocial();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const comunerosCalificados = this.datos.comunerosCalificados || '65';
    
    let html = this.escapeHtml(texto);
    
    if (grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (comunerosCalificados !== '65') {
      html = html.replace(new RegExp(this.escapeRegex(comunerosCalificados), 'g'), `<span class="data-manual">${this.escapeHtml(comunerosCalificados)}</span>`);
    }
    
    html = html.replace(/\n\n/g, '</p><p class="text-justify">');
    html = `<p class="text-justify">${html}</p>`;
    
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
}

