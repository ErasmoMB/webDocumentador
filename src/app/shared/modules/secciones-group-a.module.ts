import { NgModule } from '@angular/core';
import { CoreSharedModule } from './core-shared.module';
import { Seccion1Component } from '../components/seccion1/seccion1.component';
import { Seccion2Component } from '../components/seccion2/seccion2.component';
import { Seccion3Component } from '../components/seccion3/seccion3.component';
import { Seccion4Component } from '../components/seccion4/seccion4.component';
import { Seccion5Component } from '../components/seccion5/seccion5.component';
import { Seccion6Component } from '../components/seccion6/seccion6.component';
import { Seccion7ViewComponent } from '../components/seccion7/seccion7-view.component';
import { Seccion7FormComponent } from '../components/seccion7/seccion7-form.component';
import { Seccion8Component } from '../components/seccion8/seccion8.component';
import { Seccion9Component } from '../components/seccion9/seccion9.component';
import { Seccion10Component } from '../components/seccion10/seccion10.component';
import { Seccion11Component } from '../components/seccion11/seccion11.component';
import { Seccion12Component } from '../components/seccion12/seccion12.component';
import { Seccion1FormWrapperComponent } from '../components/forms/seccion1-form-wrapper.component';
import { Seccion2FormWrapperComponent } from '../components/forms/seccion2-form-wrapper.component';
import { Seccion2ViewComponent } from '../components/seccion2/seccion2-view.component';
import { Seccion2FormComponent } from '../components/seccion2/seccion2-form.component';
import { Seccion3ViewComponent } from '../components/seccion3/seccion3-view.component';
import { Seccion3FormComponent } from '../components/seccion3/seccion3-form.component';
import { Seccion4FormWrapperComponent } from '../components/forms/seccion4-form-wrapper.component';
import { Seccion7FormWrapperComponent } from '../components/forms/seccion7-form-wrapper.component';

@NgModule({
  declarations: [],
  imports: [
    CoreSharedModule,
    Seccion1Component,
    Seccion2Component,
    Seccion3Component,
    Seccion4Component,
    Seccion5Component,
    Seccion6Component,
    Seccion7ViewComponent,
    Seccion7FormComponent,
    Seccion8Component,
    Seccion9Component,
    Seccion10Component,
    Seccion11Component,
    Seccion12Component,
    Seccion1FormWrapperComponent,
    Seccion2FormWrapperComponent, // Mantener por compatibilidad
    Seccion2ViewComponent,
    Seccion2FormComponent,
    Seccion3ViewComponent,
    Seccion3FormComponent,
    Seccion4FormWrapperComponent,
    Seccion7FormWrapperComponent,
  ],
  exports: [
    CoreSharedModule,
    // Los componentes standalone se exportan directamente desde imports
    Seccion1Component,
    Seccion2Component,
    Seccion3Component,
    Seccion4Component,
    Seccion5Component,
    Seccion6Component,
    Seccion7ViewComponent,
    Seccion7FormComponent,
    Seccion8Component,
    Seccion9Component,
    Seccion10Component,
    Seccion11Component,
    Seccion12Component,
    Seccion1FormWrapperComponent,
    Seccion2FormWrapperComponent, // Mantener por compatibilidad
    Seccion2ViewComponent,
    Seccion2FormComponent,
    Seccion3ViewComponent,
    Seccion3FormComponent,
    Seccion4FormWrapperComponent,
    Seccion7FormWrapperComponent,
  ]
})
export class SeccionesGroupAModule { }
