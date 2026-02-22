import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Injector, OnDestroy, effect, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { SECCION28_TEMPLATES } from './seccion28-constants';
import { normalizeTitleWithPlaceholders } from '../../utils/placeholder-text.helper';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, GenericTableComponent, ImageUploadComponent],
  selector: 'app-seccion28-view',
  templateUrl: './seccion28-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion28ViewComponent extends AutoLoadSectionComponent implements OnDestroy {
  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION28_TEMPLATES = SECCION28_TEMPLATES;

  // ✅ MODO IDEAL: Signal reactivo de datos de formulario
  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  readonly centroPobladoActualSignal: Signal<string> = computed(() => {
    const data = this.formDataSignal() ?? {};
    return this.obtenerNombreCentroPobladoActual() || data['centroPobladoAISI'] || '____';
  });

  readonly distritoActualSignal: Signal<string> = computed(() => {
    const data = this.formDataSignal() ?? {};
    const ubicacion = this.projectFacade.ubicacionGlobal();
    return this.obtenerNombreDistritoActual() || data['distritoSeleccionado'] || ubicacion?.distrito || '____';
  });

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  override readonly PHOTO_PREFIX: string;
  
  // ✅ enable reactive signal sync (UNICA VERDAD)
  override useReactiveSync: boolean = true;

  // ✅ Signals de prefijos para fotos
  readonly photoPrefixSignalSalud: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fotografiaSaludAISI${prefijo}` : 'fotografiaSaludAISI';
  });

  readonly photoPrefixSignalEducacion: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fotografiaEducacionAISI${prefijo}` : 'fotografiaEducacionAISI';
  });

  readonly photoPrefixSignalRecreacion: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fotografiaRecreacionAISI${prefijo}` : 'fotografiaRecreacionAISI';
  });

  readonly photoPrefixSignalDeporte: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fotografiaDeporteAISI${prefijo}` : 'fotografiaDeporteAISI';
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector
  ) {
    super(cdRef, undefined as any, injector);

    // ✅ Inicializar PHOTO_PREFIX dinámicamente
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = 'fotografiaCahuacho';

    // ✅ Effect para sincronizar cambios en tiempo real
    effect(() => {
      this.formDataSignal();  // Acceder al signal para activar cambios
      this.cdRef.markForCheck();
    });
  }

  // ✅ Métodos de texto (copiados del form, leen del formDataSignal)
  obtenerTextoSaludCP(): string {
    const data = this.formDataSignal();
    if (data['textoSaludCP'] && data['textoSaludCP'] !== '____') {
      return data['textoSaludCP'];
    }
    const distrito = this.distritoActualSignal();
    const centroPoblado = this.centroPobladoActualSignal();
    return SECCION28_TEMPLATES.textoSaludDefault
      .replace('____', distrito)
      .replace('____', centroPoblado);
  }

  obtenerTextoEducacionCP(): string {
    const data = this.formDataSignal();
    if (data['textoEducacionCP'] && data['textoEducacionCP'] !== '____') {
      return data['textoEducacionCP'];
    }
    const centroPoblado = this.centroPobladoActualSignal();
    const nombreIE = data['nombreIEMayorEstudiantes'] || 'IE Virgen de Copacabana';
    const cantidadEstudiantes = data['cantidadEstudiantesIEMayor'] || '28';
    return SECCION28_TEMPLATES.textoEducacionDefault
      .replace('____', centroPoblado)
      .replace('____', nombreIE)
      .replace('____', cantidadEstudiantes);
  }

  obtenerTextoRecreacionCP1(): string {
    const data = this.formDataSignal();
    if (data['textoRecreacionCP1'] && data['textoRecreacionCP1'] !== '____') {
      return data['textoRecreacionCP1'];
    }
    const centroPoblado = this.centroPobladoActualSignal();
    return SECCION28_TEMPLATES.textoRecreacionCP1Default.replace(/____/g, centroPoblado);
  }

  obtenerTextoRecreacionCP2(): string {
    const data = this.formDataSignal();
    if (data['textoRecreacionCP2'] && data['textoRecreacionCP2'] !== '____') {
      return data['textoRecreacionCP2'];
    }
    return SECCION28_TEMPLATES.textoRecreacionCP2Default;
  }

  obtenerTextoRecreacionCP3(): string {
    const data = this.formDataSignal();
    if (data['textoRecreacionCP3'] && data['textoRecreacionCP3'] !== '____') {
      return data['textoRecreacionCP3'];
    }
    return SECCION28_TEMPLATES.textoRecreacionCP3Default;
  }

  obtenerTextoDeporteCP1(): string {
    const data = this.formDataSignal();
    if (data['textoDeporteCP1'] && data['textoDeporteCP1'] !== '____') {
      return data['textoDeporteCP1'];
    }
    const centroPoblado = this.centroPobladoActualSignal();
    return SECCION28_TEMPLATES.textoDeporteCP1Default.replace(/____/g, centroPoblado);
  }

  obtenerTextoDeporteCP2(): string {
    const data = this.formDataSignal();
    if (data['textoDeporteCP2'] && data['textoDeporteCP2'] !== '____') {
      return data['textoDeporteCP2'];
    }
    const centroPoblado = this.centroPobladoActualSignal();
    return SECCION28_TEMPLATES.textoDeporteCP2Default.replace(/____/g, centroPoblado);
  }

  getEducacionCpConPorcentajes(): any[] {
    const data = this.formDataSignal();
    const tablaKey = this.getTablaKeyEducacion();
    const tabla = data[tablaKey] || [];
    return tabla;
  }

  getTablaKeyPuestoSalud(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `puestoSaludCpTabla${prefijo}` : 'puestoSaludCpTabla';
  }

  getTablaKeyEducacion(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `educacionCpTabla${prefijo}` : 'educacionCpTabla';
  }

  getPuestoSaludTabla(): any[] {
    const data = this.formDataSignal();
    const tablaKey = this.getTablaKeyPuestoSalud();
    return data[tablaKey] || [];
  }

  get puestoSaludCpTablaVista(): any[] {
    return this.getPuestoSaludTabla();
  }

  get educacionCpTablaVista(): any[] {
    const data = this.formDataSignal();
    const tablaKey = this.getTablaKeyEducacion();
    return data[tablaKey] || [];
  }

  // Implement abstract methods from AutoLoadSectionComponent
  protected getSectionKey(): string { return 'seccion28_aisi'; }
  protected getLoadParameters(): string[] | null { return null; }
  protected detectarCambios(): boolean { return false; }
  protected actualizarValoresConPrefijo(): void { }

  // Fotografía helper
  override getFotografiasVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix);
  }

  getFotografiasSaludVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(this.seccionId, this.photoPrefixSignalSalud(), groupPrefix);
  }

  getFotografiasEducacionVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(this.seccionId, this.photoPrefixSignalEducacion(), groupPrefix);
  }

  getFotografiasRecreacionVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(this.seccionId, this.photoPrefixSignalRecreacion(), groupPrefix);
  }

  getFotografiasDeporteVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(this.seccionId, this.photoPrefixSignalDeporte(), groupPrefix);
  }

  getTituloPuestoSalud(): string {
    const data = this.formDataSignal();
    const centroPoblado = this.centroPobladoActualSignal();
    const distrito = this.distritoActualSignal();
    const fallback = `${SECCION28_TEMPLATES.tituloViewDefault} — ${centroPoblado}`;
    return normalizeTitleWithPlaceholders(data['puestoSaludTitulo'], fallback, centroPoblado, distrito);
  }

  getTituloEducacion(): string {
    const data = this.formDataSignal();
    const centroPoblado = this.centroPobladoActualSignal();
    const distrito = this.distritoActualSignal();
    const fallback = `${SECCION28_TEMPLATES.tituloEducacionViewDefault} – CP ${centroPoblado} (2023)`;
    return normalizeTitleWithPlaceholders(data['educacionTitulo'], fallback, centroPoblado, distrito);
  }

  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    super.ngOnDestroy();
  }
}
