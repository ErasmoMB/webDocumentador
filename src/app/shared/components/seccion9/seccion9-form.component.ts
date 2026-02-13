import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { TableNumberingService } from 'src/app/core/services/numbering/table-numbering.service';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import {
  SECCION9_WATCHED_FIELDS,
  SECCION9_SECTION_ID,
  SECCION9_TEMPLATES,
  SECCION9_PLANTILLAS_DINAMICAS,
  SECCION9_CONFIG
} from './seccion9-constants';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CoreSharedModule,
    ImageUploadComponent,
    DynamicTableComponent,
    ParagraphEditorComponent
  ],
  selector: 'app-seccion9-form',
  templateUrl: './seccion9-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion9FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION9_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = true;
  
  // ✅ Hacer TEMPLATES accesible en template
  readonly SECCION9_TEMPLATES = SECCION9_TEMPLATES;

  override readonly PHOTO_PREFIX = SECCION9_CONFIG.photoPrefix;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION9_WATCHED_FIELDS;

  fotografiasSeccion9: FotoItem[] = [];

  // ✅ SIGNAL PRINCIPAL: Lee todos los datos de la sección
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  // ✅ AUTO-SYNC FIELDS (reemplazan onFieldChange) - CON PREFIJO DE GRUPO
  readonly textoViviendas = this.createAutoSyncField(`textoViviendas${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly textoEstructura = this.createAutoSyncField(`textoEstructura${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly tituloCondicionOcupacion = this.createAutoSyncField(`tituloCondicionOcupacion${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly fuenteCondicionOcupacion = this.createAutoSyncField(`fuenteCondicionOcupacion${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly tituloTiposMateriales = this.createAutoSyncField(`tituloTiposMateriales${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
  readonly fuenteTiposMateriales = this.createAutoSyncField(`fuenteTiposMateriales${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');

  // ✅ SIGNALS DERIVADOS: Lectura del estado
  readonly grupoAISDSignal: Signal<string> = computed(() => {
    // 1️⃣ Intentar obtener desde campo grupoAISD guardado en la sección
    const guardado = this.projectFacade.selectField(this.seccionId, null, 'grupoAISD')();
    if (guardado && guardado.trim() !== '') {
      return guardado;
    }
    
    // 2️⃣ Intentar desde AIISD groups (para secciones con prefijo como _A1, _A2)
    if (this.aisdGroups) {
      const grupos = this.aisdGroups();
      const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
      if (prefijo && prefijo.startsWith('_A')) {
        const match = prefijo.match(/_A(\d+)/);
        if (match) {
          const index = parseInt(match[1]) - 1;
          if (grupos && grupos[index]?.nombre) {
            return grupos[index].nombre;
          }
        }
      }
    }
    
    // 3️⃣ Fallback: Intentar obtener desde comunidades campesinas (Sección 1)
    const comunidadesCampesinas = this.projectFacade.selectField('3.1.1', null, 'comunidadesCampesinas')();
    if (comunidadesCampesinas && Array.isArray(comunidadesCampesinas) && comunidadesCampesinas.length > 0) {
      const primerCC = comunidadesCampesinas[0];
      if (primerCC?.nombre?.trim()) {
        return primerCC.nombre;
      }
    }
    
    // 4️⃣ Último recurso
    return '____';
  });

  // ✅ NUMERACIÓN GLOBAL - Tablas (dos tablas: condicionOcupacion, tiposMateriales)
  readonly globalTableNumberSignalCondicionOcupacion: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  });
  
  readonly globalTableNumberSignalTiposMateriales: Signal<string> = computed(() => {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
  });

  readonly condicionOcupacionSignal: Signal<any[]> = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `condicionOcupacionTabla${prefijo}` : 'condicionOcupacionTabla';
    return Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
  });

  readonly tiposMaterialesSignal: Signal<any[]> = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `tiposMaterialesTabla${prefijo}` : 'tiposMaterialesTabla';
    return Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ PLANTILLAS DINÁMICAS: Con sustitución de comunidad
  readonly textoViviendasDinamico: Signal<string> = computed(() => {
    const guardado = this.textoViviendas.value();
    if (guardado && guardado.trim().length > 0) {
      return guardado;
    }
    const comunidad = this.grupoAISDSignal();
    return SECCION9_PLANTILLAS_DINAMICAS.textoViviendasTemplate.replace('__COMUNIDAD__', comunidad);
  });

  readonly textoEstructuraDinamico: Signal<string> = computed(() => {
    const guardado = this.textoEstructura.value();
    if (guardado && guardado.trim().length > 0) {
      return guardado;
    }
    const comunidad = this.grupoAISDSignal();
    return SECCION9_PLANTILLAS_DINAMICAS.textoEstructuraTemplate.replace('__COMUNIDAD__', comunidad);
  });

  readonly tituloCondicionOcupacionDinamico: Signal<string> = computed(() => {
    const guardado = this.tituloCondicionOcupacion.value();
    if (guardado && guardado.trim().length > 0) {
      return guardado;
    }
    const comunidad = this.grupoAISDSignal();
    return SECCION9_TEMPLATES.tituloDefaultCondicionOcupacion.replace('{comunidad}', comunidad);
  });

  readonly tituloTiposMaterialesDinamico: Signal<string> = computed(() => {
    const guardado = this.tituloTiposMateriales.value();
    if (guardado && guardado.trim().length > 0) {
      return guardado;
    }
    const comunidad = this.grupoAISDSignal();
    return SECCION9_TEMPLATES.tituloDefaultTiposMateriales.replace('{comunidad}', comunidad);
  });

  readonly fuenteCondicionOcupacionDinamico: Signal<string> = computed(() => {
    const guardado = this.fuenteCondicionOcupacion.value();
    if (guardado && guardado.trim().length > 0) {
      return guardado;
    }
    return SECCION9_TEMPLATES.fuenteDefaultCondicionOcupacion;
  });

  readonly fuenteTiposMaterialesDinamico: Signal<string> = computed(() => {
    const guardado = this.fuenteTiposMateriales.value();
    if (guardado && guardado.trim().length > 0) {
      return guardado;
    }
    return SECCION9_TEMPLATES.fuenteDefaultTiposMateriales;
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private tableNumberingService: TableNumberingService,
    private globalNumbering: GlobalNumberingService
  ) {
    super(cdRef, injector);

    // ✅ EFFECT: Auto-sync datos generales
    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT: Monitorear fotos y actualizar
    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.fotografiasSeccion9 = [...this.fotografiasFormMulti];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    super.onFotografiasChange(fotografias, customPrefix);
    this.fotografiasSeccion9 = fotografias;
    this.cdRef.markForCheck();
  }

  // ✅ CONFIGURACIÓN DE TABLA 1: Condición de Ocupación
  get condicionOcupacionConfig(): any {
    return {
      tablaKey: this.getTablaKeyCondicionOcupacion(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      noInicializarDesdeEstructura: true,
      calcularPorcentajes: true
    };
  }

  getTablaKeyCondicionOcupacion(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `condicionOcupacionTabla${prefijo}` : 'condicionOcupacionTabla';
  }

  onCondicionOcupacionTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyCondicionOcupacion();
    const datos = updatedData || this.datos[tablaKey] || [];
    // ✅ Actualizar datos locales - DynamicTable se encarga de persistencia
    this.datos[tablaKey] = datos;
    this.cdRef.detectChanges();
  }

  // ✅ CONFIGURACIÓN DE TABLA 2: Tipos de Materiales
  get tiposMaterialesConfig(): any {
    return {
      tablaKey: this.getTablaKeyTiposMateriales(),
      totalKey: 'tipoMaterial',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      estructuraInicial: [],
      calcularPorcentajes: true
    };
  }

  getTablaKeyTiposMateriales(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `tiposMaterialesTabla${prefijo}` : 'tiposMaterialesTabla';
  }

  onTiposMaterialesTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyTiposMateriales();
    const datos = updatedData || this.datos[tablaKey] || [];
    // ✅ Actualizar datos locales - DynamicTable se encarga de persistencia
    this.datos[tablaKey] = datos;
    this.cdRef.detectChanges();
  }

  // ✅ NÚMEROS DE CUADROS DINÁMICOS (ahora usando GlobalNumberingService)
  obtenerNumeroCuadroCondicionOcupacion(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
  }

  obtenerNumeroCuadroTiposMateriales(): string {
    return this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  /**
   * ✅ Helper para templates - retorna prefijo de grupo para uso en HTML
   */
  obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }
}
