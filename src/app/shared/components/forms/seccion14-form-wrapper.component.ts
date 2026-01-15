import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { StateService } from 'src/app/core/services/state.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion14-form-wrapper',
  templateUrl: './seccion14-form-wrapper.component.html',
  styleUrls: ['./seccion14-form-wrapper.component.css']
})
export class Seccion14FormWrapperComponent implements OnInit, OnDestroy {
  @Input() seccionId: string = '';
  @Input() fotografiasEducacionIndicadoresFormMulti: FotoItem[] = [];
  
  formData: any = {};
  datos: any = {};
  private subscription?: Subscription;

  constructor(
    private formularioService: FormularioService,
    private stateService: StateService
  ) {}

  ngOnInit() {
    this.actualizarDatos();
    this.subscription = this.stateService.datos$.subscribe(datos => {
      if (datos) {
        this.actualizarDatos();
      }
    });
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

  actualizarNivelEducativo(index: number, field: string, value: any) {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['actualizarNivelEducativo']) {
      component['actualizarNivelEducativo'](index, field, value);
      this.actualizarDatos();
    }
  }

  eliminarNivelEducativo(index: number) {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['eliminarNivelEducativo']) {
      component['eliminarNivelEducativo'](index);
      this.actualizarDatos();
    }
  }

  inicializarNivelEducativo() {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['inicializarNivelEducativo']) {
      component['inicializarNivelEducativo']();
      this.actualizarDatos();
    }
  }

  agregarNivelEducativo() {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['agregarNivelEducativo']) {
      component['agregarNivelEducativo']();
      this.actualizarDatos();
    }
  }

  actualizarTasaAnalfabetismo(index: number, field: string, value: any) {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['actualizarTasaAnalfabetismo']) {
      component['actualizarTasaAnalfabetismo'](index, field, value);
      this.actualizarDatos();
    }
  }

  eliminarTasaAnalfabetismo(index: number) {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['eliminarTasaAnalfabetismo']) {
      component['eliminarTasaAnalfabetismo'](index);
      this.actualizarDatos();
    }
  }

  inicializarTasaAnalfabetismo() {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['inicializarTasaAnalfabetismo']) {
      component['inicializarTasaAnalfabetismo']();
      this.actualizarDatos();
    }
  }

  agregarTasaAnalfabetismo() {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['agregarTasaAnalfabetismo']) {
      component['agregarTasaAnalfabetismo']();
      this.actualizarDatos();
    }
  }

  onFotografiasEducacionIndicadoresChange(fotografias: FotoItem[]) {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['onFotografiasEducacionIndicadoresChange']) {
      component['onFotografiasEducacionIndicadoresChange'](fotografias);
    }
  }

  obtenerTextoSeccion14IndicadoresEducacionIntro(): string {
    const component = ViewChildHelper.getComponent('seccion14');
    if (component && component['obtenerTextoSeccion14IndicadoresEducacionIntro']) {
      return component['obtenerTextoSeccion14IndicadoresEducacionIntro']();
    }
    return '';
  }
}
