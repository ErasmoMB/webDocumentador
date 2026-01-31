import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlantillaViewComponent } from '../../pages/plantilla/plantilla-view.component';

const routes: Routes = [
  { path: '', component: PlantillaViewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlantillaRoutingModule { }
