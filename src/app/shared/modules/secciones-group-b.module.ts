import { NgModule } from '@angular/core';
import { CoreSharedModule } from './core-shared.module';
import { Seccion13Component } from '../components/seccion13/seccion13.component';
import { Seccion14Component } from '../components/seccion14/seccion14.component';
import { Seccion15Component } from '../components/seccion15/seccion15.component';
import { Seccion16Component } from '../components/seccion16/seccion16.component';
import { Seccion17Component } from '../components/seccion17/seccion17.component';
import { Seccion18Component } from '../components/seccion18/seccion18.component';
import { Seccion19Component } from '../components/seccion19/seccion19.component';
import { Seccion20Component } from '../components/seccion20/seccion20.component';
import { Seccion21Component } from '../components/seccion21/seccion21.component';
import { Seccion22Component } from '../components/seccion22/seccion22.component';
import { Seccion23Component } from '../components/seccion23/seccion23.component';
import { Seccion24Component } from '../components/seccion24/seccion24.component';
import { Seccion14FormWrapperComponent } from '../components/forms/seccion14-form-wrapper.component';
import { Seccion15FormWrapperComponent } from '../components/forms/seccion15-form-wrapper.component';
import { Seccion16FormWrapperComponent } from '../components/forms/seccion16-form-wrapper.component';
import { Seccion17FormWrapperComponent } from '../components/forms/seccion17-18-form-wrapper.component';

const GROUP_B_COMPONENTS = [
  Seccion13Component,
  Seccion14Component,
  Seccion15Component,
  Seccion16Component,
  Seccion17Component,
  Seccion18Component,
  Seccion19Component,
  Seccion20Component,
  Seccion21Component,
  Seccion22Component,
  Seccion23Component,
  Seccion24Component,
  Seccion14FormWrapperComponent,
  Seccion15FormWrapperComponent,
  Seccion16FormWrapperComponent,
  Seccion17FormWrapperComponent,
];

@NgModule({
  declarations: [],
  imports: [
    CoreSharedModule,
    Seccion13Component,
    Seccion14Component,
    Seccion15Component,
    Seccion16Component,
    Seccion17Component,
    Seccion18Component,
    Seccion19Component,
    Seccion20Component,
    Seccion21Component,
    Seccion22Component,
    Seccion23Component,
    Seccion24Component,
    Seccion14FormWrapperComponent,
    Seccion15FormWrapperComponent,
    Seccion16FormWrapperComponent,
    Seccion17FormWrapperComponent,
  ],
  exports: [
    CoreSharedModule,
    Seccion13Component,
    Seccion14Component,
    Seccion15Component,
    Seccion16Component,
    Seccion17Component,
    Seccion18Component,
    Seccion19Component,
    Seccion20Component,
    Seccion21Component,
    Seccion22Component,
    Seccion23Component,
    Seccion24Component,
    Seccion14FormWrapperComponent,
    Seccion15FormWrapperComponent,
    Seccion16FormWrapperComponent,
    Seccion17FormWrapperComponent,
  ]
})
export class SeccionesGroupBModule { }
