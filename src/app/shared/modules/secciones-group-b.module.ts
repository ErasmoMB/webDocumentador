import { NgModule } from '@angular/core';
import { CoreSharedModule } from './core-shared.module';
import { Seccion13FormWrapperComponent } from '../components/forms/seccion13-form-wrapper.component';
import { Seccion13ViewComponent } from '../components/seccion13/seccion13-view.component';
import { Seccion14FormWrapperComponent } from '../components/forms/seccion14-form-wrapper.component';
import { Seccion14ViewComponent } from '../components/seccion14/seccion14-view.component';
import { Seccion15FormWrapperComponent } from '../components/forms/seccion15-form-wrapper.component';
import { Seccion15ViewComponent } from '../components/seccion15/seccion15-view.component';
import { Seccion16Component } from '../components/seccion16/seccion16.component';
import { Seccion16FormWrapperComponent } from '../components/forms/seccion16-form-wrapper.component';
import { Seccion17ViewComponent } from '../components/seccion17/seccion17-view.component';
import { Seccion17FormComponent } from '../components/seccion17/seccion17-form.component';
import { Seccion17FormWrapperComponent } from '../components/forms/seccion17-form-wrapper.component';
import { Seccion18ViewComponent } from '../components/seccion18/seccion18-view.component';
import { Seccion18FormComponent } from '../components/seccion18/seccion18-form.component';
import { Seccion18FormWrapperComponent } from '../components/forms/seccion18-form-wrapper.component';
import { Seccion19Component } from '../components/seccion19/seccion19.component';
import { Seccion20Component } from '../components/seccion20/seccion20.component';
import { Seccion21Component } from '../components/seccion21/seccion21.component';
import { Seccion22Component } from '../components/seccion22/seccion22.component';
import { Seccion23Component } from '../components/seccion23/seccion23.component';
import { Seccion24Component } from '../components/seccion24/seccion24.component';

// ✅ Updated: Seccion17 & 18 use ViewComponent + FormWrapperComponent pattern
const GROUP_B_COMPONENTS = [
  Seccion13FormWrapperComponent,
  Seccion14FormWrapperComponent,
  Seccion15FormWrapperComponent,
  Seccion15ViewComponent,
  Seccion16Component,
  Seccion17ViewComponent,
  Seccion17FormWrapperComponent,
  Seccion18ViewComponent,
  Seccion18FormWrapperComponent,
  Seccion19Component,
  Seccion20Component,
  Seccion21Component,
  Seccion22Component,
  Seccion23Component,
  Seccion24Component,
];

@NgModule({
  declarations: [],
  imports: [
    CoreSharedModule,
    Seccion13FormWrapperComponent,
    Seccion13ViewComponent,
    Seccion14FormWrapperComponent,
    Seccion14ViewComponent,
    Seccion15FormWrapperComponent,
    Seccion15ViewComponent,
    Seccion16Component,
    Seccion16FormWrapperComponent,
    Seccion17ViewComponent,
    Seccion17FormComponent,
    Seccion17FormWrapperComponent,
    Seccion18ViewComponent,
    Seccion18FormComponent,
    Seccion18FormWrapperComponent,
    Seccion19Component,
    Seccion20Component,
    Seccion21Component,
    Seccion22Component,
    Seccion23Component,
    Seccion24Component,
  ],
  exports: [
    CoreSharedModule,
    Seccion13FormWrapperComponent,
    Seccion13ViewComponent,
    Seccion14FormWrapperComponent,
    Seccion14ViewComponent,
    Seccion15FormWrapperComponent,
    Seccion15ViewComponent,
    Seccion16Component,
    Seccion16FormWrapperComponent,
    Seccion17ViewComponent,
    Seccion17FormComponent,
    Seccion17FormWrapperComponent,
    Seccion18ViewComponent,
    Seccion18FormComponent,
    Seccion18FormWrapperComponent,
    Seccion19Component,
    Seccion20Component,
    Seccion21Component,
    Seccion22Component,
    Seccion23Component,
    Seccion24Component,
  ]
})
export class SeccionesGroupBModule { }
