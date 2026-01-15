import { Component, Input, OnDestroy, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { StateService } from 'src/app/core/services/state.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion4-form-wrapper',
  templateUrl: './seccion4-form-wrapper.component.html',
  styleUrls: ['./seccion4-form-wrapper.component.css']
})
export class Seccion4FormWrapperComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  
  fotografiasUbicacionFormMulti: FotoItem[] = [];
  fotografiasPoblacionFormMulti: FotoItem[] = [];
  
  formData: any = {};
  autocompleteData: any = {};
  filasTablaAISD2: number = 1;
  private stateSubscription?: Subscription;

  override watchedFields: string[] = [
    'distritoSeleccionado',
    'coordenadasAISD',
    'altitudAISD',
    'cuadroTituloAISD1',
    'cuadroFuenteAISD1',
    'cuadroTituloAISD2',
    'cuadroFuenteAISD2',
    'parrafoSeccion4_caracterizacion_indicadores'
  ];

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    private stateService: StateService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    this.stateSubscription = this.stateService.datos$.subscribe(() => {
      this.cargarFotografias();
      this.cdRef.detectChanges();
    });
    setTimeout(() => {
      const seccion4 = ViewChildHelper.getComponent('seccion4');
      if (seccion4 && seccion4['autocompleteData']) {
        this.autocompleteData = { ...this.autocompleteData, ...seccion4['autocompleteData'] };
      }
    }, 100);
  }

  protected override onChangesCustom(changes: SimpleChanges): void {
    if (changes['seccionId']) {
      this.cargarFotografias();
    }
  }

  protected override actualizarDatosCustom(): void {
    this.formData = { ...this.datos };
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (valorActual !== valorAnterior) {
        hayCambios = true;
        this.datosAnteriores[campo] = valorActual;
      }
    }

    return hayCambios;
  }

  protected override actualizarValoresConPrefijo(): void {
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = (this.datos as any)[campo] || null;
    });
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  cargarFotografias() {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasUbicacionFormMulti = this.imageService.loadImages(
      this.seccionId,
      'fotografiaUbicacionReferencial',
      groupPrefix
    );
    this.fotografiasPoblacionFormMulti = this.imageService.loadImages(
      this.seccionId,
      'fotografiaPoblacionViviendas',
      groupPrefix
    );
  }

  override onFieldChange(fieldId: string, value: any) {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    this.formData[fieldId] = valorLimpio;
    super.onFieldChange(fieldId, valorLimpio);
  }

  obtenerDistritosDeComunidad(): string[] {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['obtenerDistritosDeComunidad']) {
      return component['obtenerDistritosDeComunidad']();
    }
    return [];
  }

  onDistritoPrincipalChange(value: string) {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['onDistritoPrincipalChange']) {
      component['onDistritoPrincipalChange'](value);
    }
  }

  onAltitudChange(value: any) {
    this.onFieldChange('altitudAISD', value);
  }

  normalizarAltitud() {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['normalizarAltitud']) {
      component['normalizarAltitud']();
    }
  }


  override obtenerValorConPrefijo(campo: string): any {
    return super.obtenerValorConPrefijo(campo);
  }

  onTablaFieldChange(fieldId: string, value: any) {
    this.onFieldChange(fieldId, value);
  }

  getFilasTabla(): any[] {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['getFilasTablaAISD2']) {
      return component['getFilasTablaAISD2']();
    }
    return [];
  }

  agregarFilaTabla() {
    this.filasTablaAISD2++;
  }

  eliminarFilaTabla(index: number) {
    if (this.filasTablaAISD2 > 1) {
      this.filasTablaAISD2--;
    }
  }

  onPuntoPoblacionInput(index: number, value: string) {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['onPuntoPoblacionInput']) {
      component['onPuntoPoblacionInput'](index, value);
      if (component['autocompleteData']) {
        this.autocompleteData = { ...this.autocompleteData, ...component['autocompleteData'] };
      }
    }
  }

  onPuntoPoblacionBlur(index: number) {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['onPuntoPoblacionBlur']) {
      component['onPuntoPoblacionBlur'](index);
      if (component['autocompleteData']) {
        this.autocompleteData = { ...this.autocompleteData, ...component['autocompleteData'] };
      }
    }
  }

  seleccionarPuntoPoblacion(index: number, sugerencia: any) {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['seleccionarPuntoPoblacion']) {
      component['seleccionarPuntoPoblacion'](index, sugerencia);
      if (component['autocompleteData']) {
        this.autocompleteData = { ...this.autocompleteData, ...component['autocompleteData'] };
      }
      this.actualizarDatos();
    }
  }

  cerrarSugerenciasAutocomplete(field: string) {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['cerrarSugerenciasAutocomplete']) {
      component['cerrarSugerenciasAutocomplete'](field);
      if (component['autocompleteData']) {
        this.autocompleteData = { ...this.autocompleteData, ...component['autocompleteData'] };
      }
    }
  }

  onFotografiasUbicacionChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange('fotografiaUbicacionReferencial', fotografias);
    this.fotografiasUbicacionFormMulti = [...fotografias];
  }

  onFotografiasPoblacionChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange('fotografiaPoblacionViviendas', fotografias);
    this.fotografiasPoblacionFormMulti = [...fotografias];
  }

  obtenerNombreComunidadActual(): string {
    const component = ViewChildHelper.getComponent('seccion4');
    if (component && component['obtenerNombreComunidadActual']) {
      return component['obtenerNombreComunidadActual']();
    }
    const prefijo = this.obtenerPrefijoGrupo();
    if (!prefijo || !prefijo.startsWith('_A')) {
      return this.datos.grupoAISD || '____';
    }
    return this.datos.grupoAISD || '____';
  }

  obtenerTextoSeccion4CaracterizacionIndicadores(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoParrafo = prefijo ? `parrafoSeccion4_caracterizacion_indicadores${prefijo}` : 'parrafoSeccion4_caracterizacion_indicadores';
    if (this.datos[campoParrafo] || this.datos['parrafoSeccion4_caracterizacion_indicadores']) {
      return this.datos[campoParrafo] || this.datos['parrafoSeccion4_caracterizacion_indicadores'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    return `Para la caracterización de los indicadores demográficos y aquellos relacionados a viviendas, se emplea la sumatoria de casos obtenida al considerar aquellos puntos de población que conforman la CC ${grupoAISD}. En el siguiente cuadro, se presenta aquellos puntos de población identificados por el INEI que se encuentran dentro de la comunidad en cuestión.`;
  }
}
