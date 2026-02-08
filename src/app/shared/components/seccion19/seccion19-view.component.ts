import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
  selector: 'app-seccion19-view',
  templateUrl: './seccion19-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule, GenericTableComponent],
  standalone: true
})
export class Seccion19ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.15';

  override readonly PHOTO_PREFIX = 'fotografiaOrganizacionSocial';
  override useReactiveSync: boolean = true;

  // ✅ SIGNALS: EXACTAMENTE IGUALES AL FORM (para independencia)
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly grupoAISDSignal: Signal<string> = computed(() => {
    const grupos = this.projectFacade.groupsByType('AISD')();
    return grupos.length > 0 ? grupos[0].nombre : '____';
  });

  readonly comunerosCalificadosSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'comunerosCalificados')() || '65';
  });

  readonly textoOrganizacionSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldId = prefijo ? `textoOrganizacionSocial${prefijo}` : 'textoOrganizacionSocial';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldId)();
    
    if (manual && manual.trim().length > 0) return manual;
    
    const grupoAISD = this.grupoAISDSignal();
    const comunerosCalificados = this.comunerosCalificadosSignal();
    
    return this.generarTextoOrganizacionDefault(grupoAISD, comunerosCalificados);
  });

  // ✅ SEÑALES PARA TÍTULO Y FUENTE EDITABLES (igual que seccion18)
  readonly tituloAutoridadesSignal: Signal<string> = computed(() => {
    const data = this.formDataSignal();
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldId = prefijo ? `tituloAutoridades${prefijo}` : 'tituloAutoridades';
    const titulo = (data as any)[fieldId];
    if (titulo && String(titulo).trim() !== '') return titulo;
    const grupoAISD = this.grupoAISDSignal();
    return `Autoridades y líderes sociales – CC ${grupoAISD}`;
  });

  readonly fuenteAutoridadesSignal: Signal<string> = computed(() => {
    const data = this.formDataSignal();
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldId = prefijo ? `fuenteAutoridades${prefijo}` : 'fuenteAutoridades';
    const fuente = (data as any)[fieldId];
    if (fuente && String(fuente).trim() !== '') return fuente;
    return 'GEADES (2024)';
  });

  readonly autoridadesSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `autoridades${prefijo}` : 'autoridades';
    
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    
    const tabla = fromField ?? fromTable ?? [];
    
    if (Array.isArray(tabla) && tabla.length > 0 && this.tieneContenidoReal(tabla)) {
      return tabla;
    }
    
    return [];
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    // Depender de los campos de la sección para que el computed se re-evalúe cuando cambien
    this.projectFacade.selectSectionFields(this.seccionId, null)();
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix);
  });

  readonly textoOrganizacionConResaltadoSignal: Signal<SafeHtml> = computed(() => {
    const texto = this.textoOrganizacionSignal();
    const grupoAISD = this.grupoAISDSignal();
    const comunerosCalificados = this.comunerosCalificadosSignal();
    
    let html = this.escapeHtml(texto);
    
    if (grupoAISD !== '____') {
      const regex = new RegExp(this.escapeRegex(grupoAISD), 'g');
      html = html.replace(regex, `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    
    if (comunerosCalificados !== '65') {
      const regex = new RegExp(this.escapeRegex(comunerosCalificados), 'g');
      html = html.replace(regex, `<span class="data-manual">${this.escapeHtml(comunerosCalificados)}</span>`);
    }
    
    html = html.replace(/\n\n/g, '</p><p class="text-justify">');
    html = `<p class="text-justify">${html}</p>`;
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ VIEWMODEL: AGRUPA TODOS LOS DATOS
  // ViewModel sin resaltado para el texto del párrafo
  readonly viewModel: Signal<{
    grupoAISD: string;
    comunerosCalificados: string;
    textoOrganizacion: string;
    autoridades: any[];
    fotos: FotoItem[];
    tituloAutoridades: string;
    fuenteAutoridades: string;
  }> = computed(() => ({
    grupoAISD: this.grupoAISDSignal(),
    comunerosCalificados: this.comunerosCalificadosSignal(),
    textoOrganizacion: this.textoOrganizacionSignal(),
    autoridades: this.autoridadesSignal(),
    fotos: this.fotosCacheSignal(),
    tituloAutoridades: this.tituloAutoridadesSignal(),
    fuenteAutoridades: this.fuenteAutoridadesSignal(),
  }));

  // Getter para el texto plano (sin resaltado)
  get textoOrganizacionPlano(): string {
    // Convierte saltos de línea dobles en párrafos
    const texto = this.textoOrganizacionSignal();
    return `<p class=\"text-justify\">${(texto || '').replace(/\n\n/g, '</p><p class=\"text-justify\">')}</p>`;
  }

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);

    // ✅ EFFECT 1: Sincronizar this.datos con formDataSignal
    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2: Monitorear cambios en fotos
    effect(() => {
      this.photoFieldsHash();
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  override obtenerPrefijoGrupo(): string {
    // Delegar a PrefijoHelper para mantener la misma lógica en todo el proyecto
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  private generarTextoOrganizacionDefault(grupoAISD: string, comunerosCalificados: string): string {
    return `La organización social más importante y con mayor poder es la CC ${grupoAISD}. Esta comunidad cuenta con una estructura organizativa que incluye una junta directiva, encargada de la gestión y representación legal de la comunidad. Por otra parte, la toma de decisiones clave se realiza en la asamblea general, en la cual participan y votan todos los comuneros activos que están debidamente inscritos en el padrón comunal. Esta asamblea es el máximo órgano de deliberación, donde se discuten temas de interés comunitario, como el uso de la tierra, los proyectos de desarrollo y la organización de actividades económicas y sociales.\n\nAl momento del trabajo de campo, según los entrevistados, se cuenta con ${comunerosCalificados} comuneros calificados dentro de la CC ${grupoAISD}. Estos se encuentran inscritos en el padrón, el cual es actualizado cada dos años antes de cada elección para una nueva junta directiva. Asimismo, cabe mencionar que esta última puede reelegirse por un período adicional, con la posibilidad de que una misma junta pueda gestionar por cuatro años como máximo.\n\nRespecto al rol de la mujer, es posible que estas puedan ser inscritas como comuneras calificadas dentro del padrón comunal. No obstante, solo se permite la inscripción si estas mujeres son viudas o madres solteras. De lo contrario, es el varón quien asume la responsabilidad. Por otra parte, dentro de la estructura interna de la comunidad campesina se cuenta con instancias especializadas como la JASS, la Asociación de Vicuñas y la Junta de Usuarios de Riego. Cada una de ellas cuenta con funciones específicas y sus representantes también son electos democráticamente.\n\nTambién se hallan autoridades locales como el teniente gobernador, quien es el representante del gobierno central a nivel local. El teniente gobernador tiene la función de coordinar y mediar entre las instituciones del Estado y la comunidad, así como de velar por el orden público. Asimismo, el agente municipal es responsable de la supervisión y cumplimiento de las normativas municipales, así como de brindar apoyo en la organización de actividades locales.`;
  }

  private tieneContenidoReal(tabla: any[]): boolean {
    return tabla.some(item => {
      const org = item.organizacion?.toString().trim() || '';
      const cargo = item.cargo?.toString().trim() || '';
      const nombre = item.nombre?.toString().trim() || '';
      return org !== '' || cargo !== '' || nombre !== '';
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

   trackByIndex(index: number): number { return index; }

  // ✅ Métodos para obtener título y fuente (igual que seccion18)
  getTituloAutoridades(): string {
    const fieldId = this.getTituloAutoridadesField();
    const titulo = (this.datos as any)[fieldId];
    if (titulo && String(titulo).trim() !== '') return titulo;
    const grupoAISD = this.grupoAISDSignal();
    return `Autoridades y líderes sociales – CC ${grupoAISD}`;
  }

  getFuenteAutoridades(): string {
    const fieldId = this.getFuenteAutoridadesField();
    const fuente = (this.datos as any)[fieldId];
    if (fuente && String(fuente).trim() !== '') return fuente;
    return 'GEADES (2024)';
  }

  getAutoridades(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `autoridades${prefijo}` : 'autoridades';
    
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    
    const tabla = fromField ?? fromTable ?? [];
    
    if (Array.isArray(tabla) && tabla.length > 0 && this.tieneContenidoReal(tabla)) {
      return tabla;
    }
    
    return [];
  }

  override getFotografiasVista(): FotoItem[] {
    return this.fotosCacheSignal();
  }

  private getTituloAutoridadesField(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `tituloAutoridades${prefijo}` : 'tituloAutoridades';
  }

  private getFuenteAutoridadesField(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fuenteAutoridades${prefijo}` : 'fuenteAutoridades';
  }
}
