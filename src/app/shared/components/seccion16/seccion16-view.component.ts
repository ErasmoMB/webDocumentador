import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, ChangeDetectorRef, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion16-view',
    templateUrl: './seccion16-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion16ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.12';
  @Input() override modoFormulario: boolean = false;

  readonly PHOTO_PREFIX_RESERVORIO = 'fotografiaReservorio';
  readonly PHOTO_PREFIX_USO_SUELOS = 'fotografiaUsoSuelos';
  override useReactiveSync: boolean = true;

  fotografiasReservorio: FotoItem[] = [];
  fotografiasUsoSuelos: FotoItem[] = [];
  private readonly regexCache = new Map<string, RegExp>();

  // ✅ HELPER PARA OBTENER PREFIJO
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
  }

  // ✅ PHOTO FIELDS HASH CON PREFIJOS
  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    let hash = '';

    // Reservorio photos
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_RESERVORIO}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_RESERVORIO}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_RESERVORIO}${i}Imagen${prefijo}`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }

    // UsoSuelos photos
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_USO_SUELOS}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_USO_SUELOS}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_USO_SUELOS}${i}Imagen${prefijo}`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }

    return hash;
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    public sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    this.fotografiasReservorio = this.getFotografiasVista(this.PHOTO_PREFIX_RESERVORIO);
    this.fotografiasUsoSuelos = this.getFotografiasVista(this.PHOTO_PREFIX_USO_SUELOS);
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void { }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
    this.fotografiasReservorio = this.getFotografiasVista(this.PHOTO_PREFIX_RESERVORIO);
    this.fotografiasUsoSuelos = this.getFotografiasVista(this.PHOTO_PREFIX_USO_SUELOS);
  }

  getFotografiasReservorioVista(): FotoItem[] {
    return this.fotografiasReservorio;
  }

  getFotografiasUsoSuelosVista(): FotoItem[] {
    return this.fotografiasUsoSuelos;
  }

  obtenerTextoAguaCompleto(): string {
    const prefijo = this.obtenerPrefijo();
    const fieldIdConPrefijo = `parrafoSeccion16_agua_completo${prefijo}`;
    const textoConPrefijo = (this.datos as any)[fieldIdConPrefijo];
    const textoSinPrefijo = (this.datos as any)['parrafoSeccion16_agua_completo'];
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;

    const grupoAISD = this.obtenerNombreComunidadActual();
    const ojosAgua1 = (this.datos as any).ojosAgua1 || 'Quinsa Rumi';
    const ojosAgua2 = (this.datos as any).ojosAgua2 || 'Pallalli';
    const rioAgricola = (this.datos as any).rioAgricola || 'Yuracyacu';
    const quebradaAgricola = (this.datos as any).quebradaAgricola || 'Pucaccocha';

    const textoPorDefecto = `Las fuentes de agua en la CC ${grupoAISD} son diversas, dependiendo del uso que se les dé. Para el consumo humano, el agua se obtiene principalmente de los ojos de agua de ${ojosAgua1} y ${ojosAgua2}. En el caso del anexo ${grupoAISD}, esta agua es almacenada en un reservorio, desde donde se distribuye a las viviendas locales a través de una red básica de distribución. Aunque el abastecimiento cubre las necesidades esenciales de la población, existen desafíos relacionados con la calidad del agua y el mantenimiento de la infraestructura.

En cuanto al uso agrícola, el agua proviene del río ${rioAgricola} y la quebrada ${quebradaAgricola}, que sirven como una fuente importante de riego. Finalmente, para el uso ganadero, la comunidad se abastece de las diferentes quebradas que se hallan dentro del área de la CC ${grupoAISD}, las cuales proporcionan agua para el sustento del ganado local, principalmente vacunos y ovinos.`;

    if (textoPersonalizado && textoPersonalizado !== '____' && String(textoPersonalizado).trim() !== '') {
      return textoPersonalizado;
    }

    return textoPorDefecto;
  }

  obtenerTextoRecursosNaturalesCompleto(): string {
    const prefijo = this.obtenerPrefijo();
    const fieldIdConPrefijo = `parrafoSeccion16_recursos_naturales_completo${prefijo}`;
    const textoConPrefijo = (this.datos as any)[fieldIdConPrefijo];
    const textoSinPrefijo = (this.datos as any)['parrafoSeccion16_recursos_naturales_completo'];
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;

    const grupoAISD = this.obtenerNombreComunidadActual();

    const textoPorDefecto = `En la CC ${grupoAISD}, la tenencia de la tierra es comunal, lo que significa que la comunidad en su conjunto es la propietaria de los terrenos superficiales. Los comuneros no son propietarios individuales de la tierra, sino que la comunidad les cede los terrenos en calidad de posesión para que puedan vivir y trabajar en ellos. Este sistema de tenencia comunal busca asegurar el acceso equitativo a los recursos entre los miembros de la comunidad, aunque limita la posibilidad de transacciones privadas de terrenos.

En cuanto a los usos del suelo, la mayor parte del territorio está destinado a las actividades agrícolas y ganaderas, las cuales son el principal sustento económico de la población. La tierra es aprovechada para el cultivo de papa, haba y cebada, y para el pastoreo de vacunos y ovinos. Entre los recursos naturales que se aprovechan destacan la queñua, eucalipto, lloque y tola, que son utilizados como leña para la cocción de alimentos o en la construcción.

Además, según algunos comuneros, dentro del territorio de la comunidad existen diversas hierbas medicinales con efectos positivos para la salud. Entre ellas destacan la huamanripa, llantén, muña y salvia. Estas son utilizadas en un primer nivel de atención antes de acudir al establecimiento de salud local.`;

    if (textoPersonalizado && textoPersonalizado !== '____' && String(textoPersonalizado).trim() !== '') {
      return textoPersonalizado;
    }

    return textoPorDefecto;
  }

  obtenerTextoAguaConResaltado(): SafeHtml {
    const texto = this.obtenerTextoAguaCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const ojosAgua1 = (this.datos as any).ojosAgua1 || 'Quinsa Rumi';
    const ojosAgua2 = (this.datos as any).ojosAgua2 || 'Pallalli';
    const rioAgricola = (this.datos as any).rioAgricola || 'Yuracyacu';
    const quebradaAgricola = (this.datos as any).quebradaAgricola || 'Pucaccocha';

    let html = this.escapeHtml(texto);

    if (grupoAISD !== '____') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (ojosAgua1 !== 'Quinsa Rumi') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(ojosAgua1)), `<span class="data-manual">${this.escapeHtml(ojosAgua1)}</span>`);
    }
    if (ojosAgua2 !== 'Pallalli') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(ojosAgua2)), `<span class="data-manual">${this.escapeHtml(ojosAgua2)}</span>`);
    }
    if (rioAgricola !== 'Yuracyacu') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(rioAgricola)), `<span class="data-manual">${this.escapeHtml(rioAgricola)}</span>`);
    }
    if (quebradaAgricola !== 'Pucaccocha') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(quebradaAgricola)), `<span class="data-manual">${this.escapeHtml(quebradaAgricola)}</span>`);
    }

    html = html.replace(/\n\n/g, '</p><p class="text-justify">');
    html = `<p class="text-justify">${html}</p>`;

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoRecursosNaturalesConResaltado(): SafeHtml {
    const texto = this.obtenerTextoRecursosNaturalesCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();

    let html = this.escapeHtml(texto);

    if (grupoAISD !== '____') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
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

  private obtenerRegExp(pattern: string): RegExp {
    if (!this.regexCache.has(pattern)) {
      this.regexCache.set(pattern, new RegExp(pattern, 'g'));
    }
    return this.regexCache.get(pattern)!;
  }
}
