import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, ChangeDetectorRef, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { ImageManagementFacade } from 'src/app/core/services/image/image-management.facade';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { SECCION16_PHOTO_PREFIX_RESERVORIO, SECCION16_PHOTO_PREFIX_USO_SUELOS } from './seccion16-constants';

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
  @Input() override seccionId: string = '3.1.4.A.1.12';
  @Input() override modoFormulario: boolean = false;

  // Sección 16 tiene DOS grupos de fotos
  readonly PHOTO_PREFIX_RESERVORIO = SECCION16_PHOTO_PREFIX_RESERVORIO;
  readonly PHOTO_PREFIX_USO_SUELOS = SECCION16_PHOTO_PREFIX_USO_SUELOS;

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

  // ✅ SIGNAL PARA TODAS LAS FOTOS (ambos prefijos) CON PREFIJO DE GRUPO
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
      this.datos = { ...this.projectFacade.obtenerDatos(), ...sectionData };
      // Cuando hay cambios, recargar fotos
      this.cargarFotografias();
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
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
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);

    // Cargar grupo Reservorio
    this.fotografiasReservorio = this.imageFacade.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_RESERVORIO,
      groupPrefix
    );

    // Cargar grupo UsoSuelos
    this.fotografiasUsoSuelos = this.imageFacade.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_USO_SUELOS,
      groupPrefix
    );

    this.cdRef.detectChanges();
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
    this.cdRef.detectChanges();
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
    this.cdRef.detectChanges();
  }

  obtenerTextoAguaCompleto(): string {
    const fieldId = this.getFieldIdAguaCompleto();
    const textoConPrefijo = (this.datos as any)[fieldId];
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
    const fieldId = this.getFieldIdRecursosNaturalesCompleto();
    const textoConPrefijo = (this.datos as any)[fieldId];
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
}
