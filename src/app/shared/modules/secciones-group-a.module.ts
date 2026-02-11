import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreSharedModule } from './core-shared.module';

// Sección 1 - Standalone components
import { Seccion1FormComponent } from '../components/seccion1/seccion1-form.component';
import { Seccion1ViewComponent } from '../components/seccion1/seccion1-view.component';
import { Seccion1FormWrapperComponent } from '../components/forms/seccion1-form-wrapper.component';

// Sección 2 - Standalone components
import { Seccion2ViewComponent } from '../components/seccion2/seccion2-view.component';
import { Seccion2FormComponent } from '../components/seccion2/seccion2-form.component';
import { Seccion2FormWrapperComponent } from '../components/forms/seccion2-form-wrapper.component';

// Sección 3 - Standalone components
import { Seccion3ViewComponent } from '../components/seccion3/seccion3-view.component';
import { Seccion3FormComponent } from '../components/seccion3/seccion3-form.component';
import { Seccion3FormWrapperComponent } from '../components/forms/seccion3-form-wrapper.component';

// Secciones 4-12
import { Seccion4FormComponent } from '../components/seccion4/seccion4-form.component';
import { Seccion4ViewComponent } from '../components/seccion4/seccion4-view.component';
import { Seccion4FormWrapperComponent } from '../components/forms/seccion4-form-wrapper.component';
import { Seccion5FormComponent } from '../components/seccion5/seccion5-form.component';
import { Seccion5ViewComponent } from '../components/seccion5/seccion5-view.component';
import { Seccion5FormWrapperComponent } from '../components/forms/seccion5-form-wrapper.component';
import { Seccion6FormWrapperComponent } from '../components/forms/seccion6-form-wrapper.component';
import { Seccion6ViewComponent } from '../components/seccion6/seccion6-view.component';
import { Seccion7ViewComponent } from '../components/seccion7/seccion7-view.component';
import { Seccion7FormComponent } from '../components/seccion7/seccion7-form.component';
import { Seccion7FormWrapperComponent } from '../components/forms/seccion7-form-wrapper.component';
import { Seccion8ViewComponent } from '../components/seccion8/seccion8-view.component';
import { Seccion8FormComponent } from '../components/seccion8/seccion8-form.component';
import { Seccion8FormWrapperComponent } from '../components/forms/seccion8-form-wrapper.component';
import { Seccion9ViewComponent } from '../components/seccion9/seccion9-view.component';
import { Seccion9FormComponent } from '../components/seccion9/seccion9-form.component';
import { Seccion9FormWrapperComponent } from '../components/forms/seccion9-form-wrapper.component';
import { Seccion10FormWrapperComponent } from '../components/forms/seccion10-form-wrapper.component';
import { Seccion10ViewComponent } from '../components/seccion10/seccion10-view.component';
import { Seccion11FormWrapperComponent } from '../components/forms/seccion11-form-wrapper.component';
import { Seccion11ViewComponent } from '../components/seccion11/seccion11-view.component';
import { Seccion11FormComponent } from '../components/seccion11/seccion11-form.component';
import { Seccion12FormWrapperComponent } from '../components/forms/seccion12-form-wrapper.component';
import { Seccion12FormComponent } from '../components/seccion12/seccion12-form.component';
import { Seccion12ViewComponent } from '../components/seccion12/seccion12-view.component';

@NgModule({
  imports: [
    CommonModule,
    CoreSharedModule,
    // Sección 1
    Seccion1FormComponent,
    Seccion1ViewComponent,
    Seccion1FormWrapperComponent,
    // Sección 2
    Seccion2ViewComponent,
    Seccion2FormComponent,
    Seccion2FormWrapperComponent,
    // Sección 3
    Seccion3ViewComponent,
    Seccion3FormComponent,
    Seccion3FormWrapperComponent,
    // Secciones 4-12
    Seccion4FormComponent,
    Seccion4ViewComponent,
    Seccion4FormWrapperComponent,
    // Sección 5
    Seccion5FormComponent,
    Seccion5ViewComponent,
    Seccion5FormWrapperComponent,
    // Sección 6
    Seccion6FormWrapperComponent,
    Seccion6ViewComponent,
    // Sección 7
    Seccion7ViewComponent,
    Seccion7FormComponent,
    Seccion7FormWrapperComponent,
    // Sección 8
    Seccion8ViewComponent,
    Seccion8FormComponent,
    Seccion8FormWrapperComponent,
    // Sección 9
    Seccion9ViewComponent,
    Seccion9FormComponent,
    Seccion9FormWrapperComponent,
    // Sección 10
    Seccion10FormWrapperComponent,
    Seccion10ViewComponent,
    // Sección 11
    Seccion11FormWrapperComponent,
    Seccion11ViewComponent,
    Seccion11FormComponent,
    // Sección 12
    Seccion12FormWrapperComponent,
    Seccion12FormComponent,
    Seccion12ViewComponent
  ],
  exports: [
    // Sección 1
    Seccion1FormComponent,
    Seccion1ViewComponent,
    Seccion1FormWrapperComponent,
    // Sección 2
    Seccion2ViewComponent,
    Seccion2FormComponent,
    Seccion2FormWrapperComponent,
    // Sección 3
    Seccion3ViewComponent,
    Seccion3FormComponent,
    Seccion3FormWrapperComponent,
    // Secciones 4-12
    Seccion4FormComponent,
    Seccion4ViewComponent,
    Seccion4FormWrapperComponent,
    // Sección 5
    Seccion5FormComponent,
    Seccion5ViewComponent,
    Seccion5FormWrapperComponent,
    // Sección 6
    Seccion6FormWrapperComponent,
    Seccion6ViewComponent,
    // Sección 7
    Seccion7ViewComponent,
    Seccion7FormComponent,
    Seccion7FormWrapperComponent,
    // Sección 8
    Seccion8ViewComponent,
    Seccion8FormComponent,
    Seccion8FormWrapperComponent,
    // Sección 9
    Seccion9ViewComponent,
    Seccion9FormComponent,
    Seccion9FormWrapperComponent,
    // Sección 10
    Seccion10FormWrapperComponent,
    Seccion10ViewComponent,
    // Sección 11
    Seccion11FormWrapperComponent,
    Seccion11ViewComponent,
    Seccion11FormComponent,
    // Sección 12
    Seccion12FormWrapperComponent,
    Seccion12FormComponent,
    Seccion12ViewComponent
  ]
})
export class SeccionesGroupAModule { }
