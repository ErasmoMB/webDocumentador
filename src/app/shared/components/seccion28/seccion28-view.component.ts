import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Injector, OnDestroy, effect, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { AutoLoadSectionComponent } from '../auto-load-section.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, GenericTableComponent, ImageUploadComponent],
  selector: 'app-seccion28-view',
  templateUrl: './seccion28-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion28ViewComponent extends AutoLoadSectionComponent implements OnDestroy {
  // ✅ MODO IDEAL: Signal reactivo de datos de formulario
  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  override readonly PHOTO_PREFIX: string;

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
    this.PHOTO_PREFIX = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';

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
    const distrito = data['distritoSeleccionado'] || 'Cahuacho';
    const centroPoblado = data['centroPobladoAISI'] || 'Cahuacho';
    return `Dentro de la capital distrital de ${distrito} se encuentra un único establecimiento de salud de categoría I-2, que brinda atención primaria a la población local. Este puesto de salud es el principal punto de referencia para los habitantes de ${centroPoblado}, ofreciendo servicios esenciales como consultas médicas, controles de salud y atención básica de emergencias. Aunque cuenta con limitaciones en cuanto a especialidades médicas y equipamiento, su presencia es fundamental para atender las necesidades de salud de la población, especialmente considerando la ausencia de otros centros de mayor capacidad en la zona.`;
  }

  obtenerTextoEducacionCP(): string {
    const data = this.formDataSignal();
    if (data['textoEducacionCP'] && data['textoEducacionCP'] !== '____') {
      return data['textoEducacionCP'];
    }
    const centroPoblado = data['centroPobladoAISI'] || 'Cahuacho';
    const nombreIE = data['nombreIEMayorEstudiantes'] || 'IE Virgen de Copacabana';
    const cantidadEstudiantes = data['cantidadEstudiantesIEMayor'] || '28';
    return `Dentro del CP ${centroPoblado} se hallan instituciones educativas que cubren todos los niveles de educación básica regular. La institución con mayor cantidad de estudiantes es ${nombreIE} con ${cantidadEstudiantes} estudiantes.`;
  }

  obtenerTextoRecreacionCP1(): string {
    const data = this.formDataSignal();
    if (data['textoRecreacionCP1'] && data['textoRecreacionCP1'] !== '____') {
      return data['textoRecreacionCP1'];
    }
    const centroPoblado = data['centroPobladoAISI'] || 'Cahuacho';
    return `Dentro del CP ${centroPoblado} se cuenta con espacios destinados a la recreación de la población. Entre ellos destacan las plazas, las cuales funcionan como principales áreas de encuentro para la interacción y socialización, especialmente durante festividades y eventos culturales.`;
  }

  obtenerTextoRecreacionCP2(): string {
    const data = this.formDataSignal();
    if (data['textoRecreacionCP2'] && data['textoRecreacionCP2'] !== '____') {
      return data['textoRecreacionCP2'];
    }
    const centroPoblado = data['centroPobladoAISI'] || 'Cahuacho';
    return `Otra infraestructura recreativa relevante es la plaza de toros, que se halla en la zona este del centro poblado, y es un punto de gran relevancia cultural; en especial, durante las festividades patronales y celebraciones taurinas. Este espacio funciona como un centro de actividad importante para las festividades taurinas y celebraciones especiales, atrayendo tanto a residentes como a visitantes y promoviendo las tradiciones locales.`;
  }

  obtenerTextoRecreacionCP3(): string {
    const data = this.formDataSignal();
    if (data['textoRecreacionCP3'] && data['textoRecreacionCP3'] !== '____') {
      return data['textoRecreacionCP3'];
    }
    const centroPoblado = data['centroPobladoAISI'] || 'Cahuacho';
    return `Adicionalmente, cabe mencionar el mirador ubicado en el cerro Pilluni, el cual ofrece vistas panorámicas de la capital distrital y los paisajes circundantes. Este lugar es un punto de interés tanto para los residentes como para los visitantes, permitiendo disfrutar de la belleza natural y de actividades recreativas al aire libre, fortaleciendo la identidad comunitaria.`;
  }

  obtenerTextoDeporteCP1(): string {
    const data = this.formDataSignal();
    if (data['textoDeporteCP1'] && data['textoDeporteCP1'] !== '____') {
      return data['textoDeporteCP1'];
    }
    const centroPoblado = data['centroPobladoAISI'] || 'Cahuacho';
    return `En el CP ${centroPoblado}, la infraestructura deportiva consiste en instalaciones básicas para la práctica de actividades físicas y recreativas. Se destaca la losa deportiva ubicada detrás de la municipalidad, la cual es utilizada para diversos deportes colectivos como fútbol y vóley, y sirve como un espacio frecuente para eventos locales y recreación de niños y jóvenes.`;
  }

  obtenerTextoDeporteCP2(): string {
    const data = this.formDataSignal();
    if (data['textoDeporteCP2'] && data['textoDeporteCP2'] !== '____') {
      return data['textoDeporteCP2'];
    }
    const centroPoblado = data['centroPobladoAISI'] || 'Cahuacho';
    return `Asimismo, cabe mencionar que en ${centroPoblado} se cuenta con un "estadio", caracterizado por un campo extenso con pasto y tierra, utilizado principalmente para fútbol y otros deportes al aire libre. Este campo no cuenta con infraestructura adicional como cerco perimetral o gradas, lo que limita su capacidad para eventos formales de gran envergadura. A pesar de ello, el campo es utilizado para actividades recreativas y eventos locales, funcionando como un punto de encuentro comunitario en fechas especiales.`;
  }

  getEducacionCpConPorcentajes(): any[] {
    const data = this.formDataSignal();
    const tablaKey = this.getTablaKeyEducacion();
    const tabla = data[tablaKey] || data['educacionCpTabla'] || [];
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
    return data[tablaKey] || data['puestoSaludCpTabla'] || [];
  }

  get puestoSaludCpTablaVista(): any[] {
    return this.getPuestoSaludTabla();
  }

  get educacionCpTablaVista(): any[] {
    const data = this.formDataSignal();
    const tablaKey = this.getTablaKeyEducacion();
    return data[tablaKey] || data['educacionCpTabla'] || [];
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

  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    super.ngOnDestroy();
  }
}
