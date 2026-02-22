import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { SECCION19_TEMPLATES } from './seccion19.constants';

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

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION19_TEMPLATES = SECCION19_TEMPLATES;

  // ✅ SIGNALS: EXACTAMENTE IGUALES AL FORM (para independencia)
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly grupoAISDSignal: Signal<string> = computed(() => {
    const grupos = this.projectFacade.groupsByType('AISD')();
    return grupos.length > 0 ? grupos[0].nombre : SECCION19_TEMPLATES.grupoAISDDefault;
  });

  readonly comunerosCalificadosSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'comunerosCalificados')() || SECCION19_TEMPLATES.comunerosCalificadosDefault;
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
    return SECCION19_TEMPLATES.fuenteAutoridadesDefault;
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

  // Signal de prefijo de foto para aislamiento AISD
  readonly photoPrefixSignal: Signal<string> = computed(() => {
    return this.PHOTO_PREFIX;
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

    // ✅ EFFECT 2: Monitorear cambios en fotos (ÚNICA VERDAD)
    effect(() => {
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
    return SECCION19_TEMPLATES.parrafoOrganizacionDefault
      .replace(/____/g, grupoAISD)
      .replace(/____/g, comunerosCalificados);
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
    return SECCION19_TEMPLATES.tituloAutoridadesDefault.replace(/____/g, grupoAISD);
  }

  getFuenteAutoridades(): string {
    const fieldId = this.getFuenteAutoridadesField();
    const fuente = (this.datos as any)[fieldId];
    if (fuente && String(fuente).trim() !== '') return fuente;
    return SECCION19_TEMPLATES.fuenteAutoridadesDefault;
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
