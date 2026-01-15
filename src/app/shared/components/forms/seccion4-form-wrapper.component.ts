import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { StateService } from 'src/app/core/services/state.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion4-form-wrapper',
  templateUrl: './seccion4-form-wrapper.component.html',
  styleUrls: ['./seccion4-form-wrapper.component.css']
})
export class Seccion4FormWrapperComponent implements OnInit, OnDestroy {
  @Input() seccionId: string = '';
  @Input() fotografiasAISDFormMulti: FotoItem[] = [];
  
  formData: any = {};
  datos: any = {};
  autocompleteData: any = {};
  filasTablaAISD2: number = 1;
  private subscription?: Subscription;

  constructor(
    private formularioService: FormularioService,
    private stateService: StateService,
    private imageService: ImageManagementService
  ) {}

  ngOnInit() {
    this.actualizarDatos();
    this.subscription = this.stateService.datos$.subscribe(datos => {
      if (datos) {
        this.actualizarDatos();
      }
    });
    setTimeout(() => {
      const seccion4 = ViewChildHelper.getComponent('seccion4');
      if (seccion4 && seccion4['autocompleteData']) {
        this.autocompleteData = { ...this.autocompleteData, ...seccion4['autocompleteData'] };
      }
    }, 100);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  actualizarDatos() {
    this.datos = this.formularioService.obtenerDatos();
    this.formData = { ...this.datos };
  }

  onFieldChange(fieldId: string, value: any) {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    this.formData[fieldId] = valorLimpio;
    this.formularioService.actualizarDato(fieldId as any, valorLimpio);
    this.actualizarDatos();
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

  obtenerValorConPrefijo(campo: string): any {
    return PrefijoHelper.obtenerValorConPrefijo(this.datos, campo, this.seccionId);
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

  onFotografiasAISDChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      const suffix = groupPrefix ? groupPrefix : '';
      this.formularioService.actualizarDato(`fotografiaAISD${num}Titulo${suffix}` as any, foto.titulo || '');
      this.formularioService.actualizarDato(`fotografiaAISD${num}Fuente${suffix}` as any, foto.fuente || '');
      this.formularioService.actualizarDato(`fotografiaAISD${num}Imagen${suffix}` as any, foto.imagen || '');
    });
  }
}
