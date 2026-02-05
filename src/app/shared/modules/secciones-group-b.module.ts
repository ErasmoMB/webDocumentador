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
import { Seccion19ViewComponent } from '../components/seccion19/seccion19-view.component';
import { Seccion19FormComponent } from '../components/seccion19/seccion19-form.component';
import { Seccion19FormWrapperComponent } from '../components/forms/seccion19-form-wrapper.component';
import { Seccion20ViewComponent } from '../components/seccion20/seccion20-view.component';
import { Seccion20FormComponent } from '../components/seccion20/seccion20-form.component';
import { Seccion20FormWrapperComponent } from '../components/forms/seccion20-form-wrapper.component';
import { Seccion21ViewComponent } from '../components/seccion21/seccion21-view.component';
import { Seccion21FormComponent } from '../components/seccion21/seccion21-form.component';
import { Seccion21FormWrapperComponent } from '../components/forms/seccion21-form-wrapper.component';
import { Seccion22ViewComponent } from '../components/seccion22/seccion22-view.component';
import { Seccion22FormComponent } from '../components/seccion22/seccion22-form.component';
import { Seccion22FormWrapperComponent } from '../components/forms/seccion22-form-wrapper.component';
import { Seccion23Component } from '../components/seccion23/seccion23.component';
import { Seccion24Component } from '../components/seccion24/seccion24.component';

// ✅ Updated: Seccion17, 18, 19 use ViewComponent + FormWrapperComponent pattern
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
  Seccion19ViewComponent,
  Seccion19FormWrapperComponent,
  Seccion20ViewComponent,
  Seccion20FormComponent,
  Seccion20FormWrapperComponent,
  Seccion21ViewComponent,
  Seccion21FormComponent,
  Seccion21FormWrapperComponent,
  Seccion22ViewComponent,
  Seccion22FormComponent,
  Seccion22FormWrapperComponent,
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
    Seccion19ViewComponent,
    Seccion19FormComponent,
    Seccion19FormWrapperComponent,
    Seccion20ViewComponent,
    Seccion20FormComponent,
    Seccion20FormWrapperComponent,
    Seccion21ViewComponent,
    Seccion21FormComponent,
    Seccion21FormWrapperComponent,
    Seccion22ViewComponent,
    Seccion22FormComponent,
    Seccion22FormWrapperComponent,
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
    Seccion19ViewComponent,
    Seccion19FormComponent,
    Seccion19FormWrapperComponent,
    Seccion20ViewComponent,
    Seccion20FormComponent,
    Seccion20FormWrapperComponent,
    Seccion21ViewComponent,
    Seccion21FormComponent,
    Seccion21FormWrapperComponent,
    Seccion22ViewComponent,
    Seccion22FormComponent,
    Seccion22FormWrapperComponent,
    Seccion23Component,
    Seccion24Component,
  ]
})
export class SeccionesGroupBModule { }
