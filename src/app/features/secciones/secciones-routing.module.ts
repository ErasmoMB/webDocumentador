import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeccionContainerComponent } from './container/seccion-container.component';

const routes: Routes = [
  { path: ':id', component: SeccionContainerComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeccionesRoutingModule { }
