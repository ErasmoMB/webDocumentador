import { NgModule } from '@angular/core';
import { CoreSharedModule } from './core-shared.module';
import { Seccion25FormWrapperComponent } from '../components/forms/seccion25-form-wrapper.component';
import { Seccion25FormComponent } from '../components/seccion25/seccion25-form.component';
import { Seccion25ViewComponent } from '../components/seccion25/seccion25-view.component';
import { Seccion26FormWrapperComponent } from '../components/forms/seccion26-form-wrapper.component';
import { Seccion26FormComponent } from '../components/seccion26/seccion26-form.component';
import { Seccion26ViewComponent } from '../components/seccion26/seccion26-view.component';
import { Seccion27FormWrapperComponent } from '../components/forms/seccion27-form-wrapper.component';
import { Seccion27FormComponent } from '../components/seccion27/seccion27-form.component';
import { Seccion27ViewComponent } from '../components/seccion27/seccion27-view.component';
import { Seccion28Component } from '../components/seccion28/seccion28.component';
import { Seccion29Component } from '../components/seccion29/seccion29.component';
import { Seccion30Component } from '../components/seccion30/seccion30.component';
import { Seccion31Component } from '../components/seccion31/seccion31.component';
import { Seccion32Component } from '../components/seccion32/seccion32.component';
import { Seccion33Component } from '../components/seccion33/seccion33.component';
import { Seccion34Component } from '../components/seccion34/seccion34.component';
import { Seccion35Component } from '../components/seccion35/seccion35.component';
import { Seccion36Component } from '../components/seccion36/seccion36.component';
import { Seccion30FormWrapperComponent } from '../components/forms/seccion30-form-wrapper.component';

const GROUP_C_COMPONENTS = [
  Seccion26FormWrapperComponent,
  Seccion26FormComponent,
  Seccion26ViewComponent,
  Seccion27FormWrapperComponent,
  Seccion27FormComponent,
  Seccion27ViewComponent,
  Seccion28Component,
  Seccion29Component,
  Seccion30Component,
  Seccion31Component,
  Seccion32Component,
  Seccion33Component,
  Seccion34Component,
  Seccion35Component,
  Seccion36Component,
  Seccion30FormWrapperComponent,
];

@NgModule({
  declarations: [],
  imports: [
    CoreSharedModule,
    Seccion25FormWrapperComponent,
    Seccion25FormComponent,
    Seccion25ViewComponent,
    Seccion26FormWrapperComponent,
    Seccion26FormComponent,
    Seccion26ViewComponent,
    Seccion27FormWrapperComponent,
    Seccion27FormComponent,
    Seccion27ViewComponent,
    Seccion28Component,
    Seccion29Component,
    Seccion30Component,
    Seccion31Component,
    Seccion32Component,
    Seccion33Component,
    Seccion34Component,
    Seccion35Component,
    Seccion36Component,
    Seccion30FormWrapperComponent,
  ],
  exports: [
    CoreSharedModule,
    Seccion25FormWrapperComponent,
    Seccion25FormComponent,
    Seccion25ViewComponent,
    Seccion26FormWrapperComponent,
    Seccion26FormComponent,
    Seccion26ViewComponent,
    Seccion27FormWrapperComponent,
    Seccion27FormComponent,
    Seccion27ViewComponent,
    Seccion28Component,
    Seccion29Component,
    Seccion30Component,
    Seccion31Component,
    Seccion32Component,
    Seccion33Component,
    Seccion34Component,
    Seccion35Component,
    Seccion36Component,
    Seccion30FormWrapperComponent,
  ]
})
export class SeccionesGroupCModule { }
