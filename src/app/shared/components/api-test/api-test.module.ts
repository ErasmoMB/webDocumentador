import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ApiTestComponent } from './api-test.component';

const routes: Routes = [
  { path: '', component: ApiTestComponent }
];

@NgModule({
  declarations: [ApiTestComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ApiTestModule { }

