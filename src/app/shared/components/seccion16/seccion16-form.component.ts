import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, ChangeDetectorRef, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { ImageManagementFacade } from 'src/app/core/services/image/image-management.facade';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { 
  SECCION16_PHOTO_PREFIX_RESERVORIO, 
  SECCION16_PHOTO_PREFIX_USO_SUELOS,
  SECCION16_WATCHED_FIELDS,
  SECCION16_SECTION_ID,
  SECCION16_TEMPLATES
} from './seccion16-constants';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion16-form',
    templateUrl: './seccion16-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion16FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION16_SECTION_ID;
  @Input() override modoFormulario: boolean = false;

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION16_TEMPLATES = SECCION16_TEMPLATES;
  
  // Sección 16 tiene DOS grupos de fotos
  readonly PHOTO_PREFIX_RESERVORIO = SECCION16_PHOTO_PREFIX_RESERVORIO;
  readonly PHOTO_PREFIX_USO_SUELOS = SECCION16_PHOTO_PREFIX_USO_SUELOS;
  
  // ✅ Campos observados para persistencia
  override watchedFields: string[] = SECCION16_WATCHED_FIELDS;

  fotografiasReservorio: FotoItem[] = [];
  fotografiasUsoSuelos: FotoItem[] = [];

  // ✅ HELPER PARA OBTENER PREFIJO
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
  }

  // ✅ OVERRIDE: onFieldChange CON PREFIJO AUTOMÁTICO
  override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
    const prefijo = this.obtenerPrefijo();
    const campoConPrefijo = prefijo ? `${fieldId}${prefijo}` : fieldId;
    super.onFieldChange(campoConPrefijo, value, options);
  }

  // ✅ SIGNAL PARA FOTOGRAFÍAS - ÚNICA VERDAD (PATRÓN OBLIGATORIO)
  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const prefijo = this.obtenerPrefijo();
    
    // Fotografías de Reservorio
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_RESERVORIO}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_RESERVORIO}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_RESERVORIO}${i}Imagen${prefijo}`)();
      
      if (imagen) {
        fotos.push({
          titulo: titulo || `Fotografía ${i}`,
          fuente: fuente || 'GEADES, 2024',
          imagen: imagen
        } as FotoItem);
      }
    }
    
    // Fotografías de Uso de Suelos
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_USO_SUELOS}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_USO_SUELOS}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_USO_SUELOS}${i}Imagen${prefijo}`)();
      
      if (imagen) {
        fotos.push({
          titulo: titulo || `Fotografía ${i}`,
          fuente: fuente || 'GEADES, 2024',
          imagen: imagen
        } as FotoItem);
      }
    }
    
    return fotos;
  });

  // ✅ SIGNAL PARA DATOS DE SECCIÓN CON EFECTO AUTO-SYNC
  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector
  ) {
    super(cdRef, injector);

    // ✅ Effect para sincronizar datos locales con el estado
    effect(() => {
      const sectionData = this.formDataSignal();
      this.datos = { ...sectionData };
      // Cuando hay cambios, recargar fotos
      this.cargarFotografias();
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    // Cargar ambos grupos de fotos manualmente
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void { }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
  }

  // Sobrescribir cargarFotografias para manejar DOS grupos
  override cargarFotografias(): void {
    const fotos = this.fotosCacheSignal();
    this.fotografiasReservorio = fotos.filter(f => f.imagen && f.imagen.includes(this.PHOTO_PREFIX_RESERVORIO));
    this.fotografiasUsoSuelos = fotos.filter(f => f.imagen && f.imagen.includes(this.PHOTO_PREFIX_USO_SUELOS));
    this.cdRef.markForCheck();
  }

  getFieldIdAguaCompleto(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `parrafoSeccion16_agua_completo${prefijo}` : 'parrafoSeccion16_agua_completo';
  }

  getFieldIdRecursosNaturalesCompleto(): string {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `parrafoSeccion16_recursos_naturales_completo${prefijo}` : 'parrafoSeccion16_recursos_naturales_completo';
  }

  onFotografiasReservorioChange(fotografias: FotoItem[]): void {
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    this.imageFacade.saveImages(
      this.seccionId,
      this.PHOTO_PREFIX_RESERVORIO,
      fotografias,
      groupPrefix
    );
    this.fotografiasReservorio = [...fotografias];
    this.cdRef.markForCheck();
  }

  onFotografiasUsoSuelosChange(fotografias: FotoItem[]): void {
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    this.imageFacade.saveImages(
      this.seccionId,
      this.PHOTO_PREFIX_USO_SUELOS,
      fotografias,
      groupPrefix
    );
    this.fotografiasUsoSuelos = [...fotografias];
    this.cdRef.markForCheck();
  }

  obtenerTextoAguaCompleto(): string {
    const fieldId = this.getFieldIdAguaCompleto();
    const textoConPrefijo = (this.datos as any)[fieldId];
    const textoSinPrefijo = (this.datos as any)['parrafoSeccion16_agua_completo'];
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;

    // Obtener valores dinámicos (con fallback a constantes)
    const grupoAISD = this.obtenerNombreComunidadActual();
    const ojosAgua1 = (this.datos as any).ojosAgua1 || SECCION16_TEMPLATES.ojosAgua1Default;
    const ojosAgua2 = (this.datos as any).ojosAgua2 || SECCION16_TEMPLATES.ojosAgua2Default;
    const rioAgricola = (this.datos as any).rioAgricola || SECCION16_TEMPLATES.rioAgricolaDefault;
    const quebradaAgricola = (this.datos as any).quebradaAgricola || SECCION16_TEMPLATES.quebradaAgricolaDefault;

    // Usar template de constantes con sustitución dinámica
    const textoPorDefecto = SECCION16_TEMPLATES.textoPorDefectoAguaCompleto
      .replace(/{{grupoAISD}}/g, grupoAISD)
      .replace(/{{ojosAgua1}}/g, ojosAgua1)
      .replace(/{{ojosAgua2}}/g, ojosAgua2)
      .replace(/{{rioAgricola}}/g, rioAgricola)
      .replace(/{{quebradaAgricola}}/g, quebradaAgricola);

    if (textoPersonalizado && textoPersonalizado !== '____' && String(textoPersonalizado).trim() !== '') {
      return textoPersonalizado;
    }

    return textoPorDefecto;
  }

  obtenerTextoRecursosNaturalesCompleto(): string {
    const fieldId = this.getFieldIdRecursosNaturalesCompleto();
    const textoConPrefijo = (this.datos as any)[fieldId];
    const textoSinPrefijo = (this.datos as any)['parrafoSeccion16_recursos_naturales_completo'];
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;

    const grupoAISD = this.obtenerNombreComunidadActual();

    // Usar template de constantes con sustitución dinámica
    const textoPorDefecto = SECCION16_TEMPLATES.textoPorDefectoRecursosNaturalesCompleto
      .replace(/{{grupoAISD}}/g, grupoAISD);

    if (textoPersonalizado && textoPersonalizado !== '____' && String(textoPersonalizado).trim() !== '') {
      return textoPersonalizado;
    }

    return textoPorDefecto;
  }
}
