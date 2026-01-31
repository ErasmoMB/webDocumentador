import { NgModule } from '@angular/core';
import { CoreSharedModule } from './core-shared.module';
import { Seccion25Component } from '../components/seccion25/seccion25.component';
import { Seccion26Component } from '../components/seccion26/seccion26.component';
import { Seccion27Component } from '../components/seccion27/seccion27.component';
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
  Seccion25Component,
  Seccion26Component,
  Seccion27Component,
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
    Seccion25Component,
    Seccion26Component,
    Seccion27Component,
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
    Seccion25Component,
    Seccion26Component,
    Seccion27Component,
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
