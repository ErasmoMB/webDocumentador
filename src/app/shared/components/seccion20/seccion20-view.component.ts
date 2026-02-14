import { Component, Input, ChangeDetectionStrategy, Injector, Signal, computed, ChangeDetectorRef } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { SECCION20_CONFIG, SECCION20_TEMPLATES } from './seccion20.constants';

@Component({
  selector: 'app-seccion20-view',
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  templateUrl: './seccion20-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion20ViewComponent extends BaseSectionComponent {
  @Input() override seccionId: string = SECCION20_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = false;

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION20_TEMPLATES = SECCION20_TEMPLATES;
  override readonly PHOTO_PREFIX = 'fotografiaFestividades';

  festividadesConfig: TableConfig = {
    tablaKey: 'festividades',
    totalKey: 'festividad',
    campoTotal: 'festividad',
    estructuraInicial: SECCION20_TEMPLATES.tablaEstructuraInicial
  };

  private readonly regexCache = new Map<string, RegExp>();

  readonly textoSignal = computed(() => {
    const fieldId = this.getFieldIdTextoFestividades();
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldId)();
    if (manual && manual.trim() !== '' && manual !== '____') return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(manual));
    return this.obtenerTextoFestividadesConResaltado();
  });

  readonly tituloSignal = computed(() => {
    const fieldId = this.getTituloFestividadesField();
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldId)();
    const nombre = this.obtenerNombreComunidadActual();
    if (manual && String(manual).trim() !== '') return manual;
    // ✅ Usar template centralizado
    return SECCION20_TEMPLATES.tituloDefault.replace('{{nombreComunidad}}', nombre);
  });

  readonly fuenteSignal = computed(() => {
    const fieldId = this.getFuenteFestividadesField();
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldId)();
    if (manual && String(manual).trim() !== '') return manual;
    // ✅ Usar template centralizado
    return SECCION20_TEMPLATES.fuenteDefault;
  });

  readonly tablaSignal: Signal<any[]> = computed(() => {
    const tablaKey = this.getTablaKeyFestividades();
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    const v = fromField ?? fromTable ?? this.festividadesConfig.estructuraInicial;
    return Array.isArray(v) ? v : [];
  });

  readonly fotosSignal = computed(() => {
    this.projectFacade.selectSectionFields(this.seccionId, null)();
    const gp = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, this.PHOTO_PREFIX, gp);
  });

  // Signal de prefijo de foto para aislamiento AISD
  readonly photoPrefixSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `${this.PHOTO_PREFIX}${prefijo}` : this.PHOTO_PREFIX;
  });

  // photoFieldsHash con prefijo para reactividad de fotos
  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    const prefijo = this.obtenerPrefijoGrupo();
    const prefix = `${this.PHOTO_PREFIX}${prefijo}`;
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  constructor(cdRef: ChangeDetectorRef, injector: Injector, public sanitizer: DomSanitizer) {
    super(cdRef, injector);
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  obtenerTextoFestividades(): string {
    const fieldId = this.getFieldIdTextoFestividades();
    const textoConPrefijo = this.datos[fieldId];
    const textoSinPrefijo = this.datos.textoFestividades;
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const sitioArqueologico = this.datos.sitioArqueologico || SECCION20_TEMPLATES.sitioArqueologicoDefault;
    
    // ✅ Usar template centralizado de constantes
    const textoPorDefecto = SECCION20_TEMPLATES.textoFestividadesDefault
      .replace(/{{nombreComunidad}}/g, grupoAISD)
      .replace(/{{sitioArqueologico}}/g, sitioArqueologico);
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado.replace(/CC\s*___/g, `CC ${grupoAISD}`).replace(/CC\s*____/g, `CC ${grupoAISD}`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoFestividadesConResaltado(): SafeHtml {
    const texto = this.obtenerTextoFestividades();
    const grupoAISD = this.obtenerNombreComunidadActual();
    // ✅ Usar template centralizado
    const sitioArqueologico = this.datos.sitioArqueologico || SECCION20_TEMPLATES.sitioArqueologicoDefault;
    
    let html = this.escapeHtml(texto);
    
    if (grupoAISD !== '____') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (sitioArqueologico !== SECCION20_TEMPLATES.sitioArqueologicoDefault) {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(sitioArqueologico)), `<span class="data-manual">${this.escapeHtml(sitioArqueologico)}</span>`);
    }
    
    html = html.replace(/\n\n/g, '</p><p class="text-justify">');
    html = `<p class="text-justify">${html}</p>`;
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private obtenerRegExp(pattern: string): RegExp {
    if (!this.regexCache.has(pattern)) {
      this.regexCache.set(pattern, new RegExp(pattern, 'g'));
    }
    return this.regexCache.get(pattern)!;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }



  getTablaKeyFestividades(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `festividades${prefijo}` : 'festividades';
  }

  getFieldIdTextoFestividades(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoFestividades${prefijo}` : 'textoFestividades';
  }

  getTituloFestividadesField(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `tituloFestividades${prefijo}` : 'tituloFestividades';
  }

  getFuenteFestividadesField(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fuenteFestividades${prefijo}` : 'fuenteFestividades';
  }
}
