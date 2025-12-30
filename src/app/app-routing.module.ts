import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './core/components/layout/layout.component';
import { SeccionComponent } from './pages/seccion/seccion.component';
import { PlantillaViewComponent } from './pages/plantilla/plantilla-view.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'seccion/introduccion', pathMatch: 'full' },
      { path: 'seccion/:id', component: SeccionComponent },
      { path: 'plantilla', component: PlantillaViewComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
