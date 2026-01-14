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
      { path: '', redirectTo: 'plantilla', pathMatch: 'full' },
      { path: 'seccion/:id', component: SeccionComponent },
      { path: 'plantilla', component: PlantillaViewComponent },
      { path: 'api-test', loadChildren: () => import('./shared/components/api-test/api-test.module').then(m => m.ApiTestModule) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
