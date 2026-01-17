import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { StateService } from 'src/app/core/services/state.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion16',
  templateUrl: './seccion16.component.html',
  styleUrls: ['./seccion16.component.css']
})
export class Seccion16Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'parrafoSeccion16_agua_completo', 'parrafoSeccion16_recursos_naturales_completo', 'ojosAgua1', 'ojosAgua2', 'rioAgricola', 'quebradaAgricola'];
  
  readonly PHOTO_PREFIX_RESERVORIO = 'fotografiaReservorio';
  readonly PHOTO_PREFIX_USO_SUELOS = 'fotografiaUsoSuelos';
  
  fotografiasReservorioFormMulti: FotoItem[] = [];
  fotografiasUsoSuelosFormMulti: FotoItem[] = [];
  fotografiasReservorioCache: FotoItem[] = [];
  fotografiasUsoSuelosCache: FotoItem[] = [];
  
  override readonly PHOTO_PREFIX = '';
  private stateSubscription?: Subscription;

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

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasReservorioVista(): FotoItem[] {
    if (this.fotografiasReservorioCache && this.fotografiasReservorioCache.length > 0) {
      return this.fotografiasReservorioCache;
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_RESERVORIO,
      groupPrefix
    );
  }

  getFotografiasUsoSuelosVista(): FotoItem[] {
    if (this.fotografiasUsoSuelosCache && this.fotografiasUsoSuelosCache.length > 0) {
      return this.fotografiasUsoSuelosCache;
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_USO_SUELOS,
      groupPrefix
    );
  }

  override actualizarFotografiasFormMulti() {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasReservorioFormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_RESERVORIO, groupPrefix);
    this.fotografiasUsoSuelosFormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_USO_SUELOS, groupPrefix);
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
    this.fotografiasReservorioCache = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_RESERVORIO,
      groupPrefix
    );
    this.fotografiasUsoSuelosCache = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_USO_SUELOS,
      groupPrefix
    );
    this.cdRef.markForCheck();
  }

  onFotografiasReservorioChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.imageService.saveImages(
      this.seccionId,
      this.PHOTO_PREFIX_RESERVORIO,
      fotografias,
      groupPrefix
    );
    this.fotografiasReservorioFormMulti = [...fotografias];
    this.fotografiasReservorioCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  onFotografiasUsoSuelosChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.imageService.saveImages(
      this.seccionId,
      this.PHOTO_PREFIX_USO_SUELOS,
      fotografias,
      groupPrefix
    );
    this.fotografiasUsoSuelosFormMulti = [...fotografias];
    this.fotografiasUsoSuelosCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  getFieldIdAguaCompleto(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion16_agua_completo${prefijo}` : 'parrafoSeccion16_agua_completo';
  }

  getFieldIdRecursosNaturalesCompleto(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion16_recursos_naturales_completo${prefijo}` : 'parrafoSeccion16_recursos_naturales_completo';
  }

  obtenerTextoSeccion16AguaCompleto(): string {
    const fieldId = this.getFieldIdAguaCompleto();
    const textoConPrefijo = this.datos[fieldId];
    const textoSinPrefijo = this.datos.parrafoSeccion16_agua_completo;
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const ojosAgua1 = this.datos.ojosAgua1 || 'Quinsa Rumi';
    const ojosAgua2 = this.datos.ojosAgua2 || 'Pallalli';
    const rioAgricola = this.datos.rioAgricola || 'Yuracyacu';
    const quebradaAgricola = this.datos.quebradaAgricola || 'Pucaccocha';
    
    const textoPorDefecto = `Las fuentes de agua en la CC ${grupoAISD} son diversas, dependiendo del uso que se les dé. Para el consumo humano, el agua se obtiene principalmente de los ojos de agua de ${ojosAgua1} y ${ojosAgua2}. En el caso del anexo ${grupoAISD}, esta agua es almacenada en un reservorio, desde donde se distribuye a las viviendas locales a través de una red básica de distribución. Aunque el abastecimiento cubre las necesidades esenciales de la población, existen desafíos relacionados con la calidad del agua y el mantenimiento de la infraestructura.\n\nEn cuanto al uso agrícola, el agua proviene del río ${rioAgricola} y la quebrada ${quebradaAgricola}, que sirven como una fuente importante de riego. Finalmente, para el uso ganadero, la comunidad se abastece de las diferentes quebradas que se hallan dentro del área de la CC ${grupoAISD}, las cuales proporcionan agua para el sustento del ganado local, principalmente vacunos y ovinos.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado;
    }
    
    return textoPorDefecto;
  }

  obtenerTextoSeccion16AguaConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion16AguaCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const ojosAgua1 = this.datos.ojosAgua1 || 'Quinsa Rumi';
    const ojosAgua2 = this.datos.ojosAgua2 || 'Pallalli';
    const rioAgricola = this.datos.rioAgricola || 'Yuracyacu';
    const quebradaAgricola = this.datos.quebradaAgricola || 'Pucaccocha';
    
    let html = this.escapeHtml(texto);
    
    if (grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (ojosAgua1 !== 'Quinsa Rumi') {
      html = html.replace(new RegExp(this.escapeRegex(ojosAgua1), 'g'), `<span class="data-manual">${this.escapeHtml(ojosAgua1)}</span>`);
    }
    if (ojosAgua2 !== 'Pallalli') {
      html = html.replace(new RegExp(this.escapeRegex(ojosAgua2), 'g'), `<span class="data-manual">${this.escapeHtml(ojosAgua2)}</span>`);
    }
    if (rioAgricola !== 'Yuracyacu') {
      html = html.replace(new RegExp(this.escapeRegex(rioAgricola), 'g'), `<span class="data-manual">${this.escapeHtml(rioAgricola)}</span>`);
    }
    if (quebradaAgricola !== 'Pucaccocha') {
      html = html.replace(new RegExp(this.escapeRegex(quebradaAgricola), 'g'), `<span class="data-manual">${this.escapeHtml(quebradaAgricola)}</span>`);
    }
    
    html = html.replace(/\n\n/g, '</p><p class="text-justify">');
    html = `<p class="text-justify">${html}</p>`;
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoSeccion16RecursosNaturalesCompleto(): string {
    const fieldId = this.getFieldIdRecursosNaturalesCompleto();
    const textoConPrefijo = this.datos[fieldId];
    const textoSinPrefijo = this.datos.parrafoSeccion16_recursos_naturales_completo;
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    const textoPorDefecto = `En la CC ${grupoAISD}, la tenencia de la tierra es comunal, lo que significa que la comunidad en su conjunto es la propietaria de los terrenos superficiales. Los comuneros no son propietarios individuales de la tierra, sino que la comunidad les cede los terrenos en calidad de posesión para que puedan vivir y trabajar en ellos. Este sistema de tenencia comunal busca asegurar el acceso equitativo a los recursos entre los miembros de la comunidad, aunque limita la posibilidad de transacciones privadas de terrenos.\n\nEn cuanto a los usos del suelo, la mayor parte del territorio está destinado a las actividades agrícolas y ganaderas, las cuales son el principal sustento económico de la población. La tierra es aprovechada para el cultivo de papa, haba y cebada, y para el pastoreo de vacunos y ovinos. Entre los recursos naturales que se aprovechan destacan la queñua, eucalipto, lloque y tola, que son utilizados como leña para la cocción de alimentos o en la construcción.\n\nAdemás, según algunos comuneros, dentro del territorio de la comunidad existen diversas hierbas medicinales con efectos positivos para la salud. Entre ellas destacan la huamanripa, llantén, muña y salvia. Estas son utilizadas en un primer nivel de atención antes de acudir al establecimiento de salud local.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado;
    }
    
    return textoPorDefecto;
  }

  obtenerTextoSeccion16RecursosNaturalesConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion16RecursosNaturalesCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let html = this.escapeHtml(texto);
    
    if (grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
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

