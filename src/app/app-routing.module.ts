import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { NetworkAwarePreloadStrategy } from './core/services/network-aware-preload.strategy';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'plantilla', pathMatch: 'full' },
      {
        path: 'seccion',
        loadChildren: () => import('./features/secciones/secciones.module').then(m => m.SeccionesModule),
        data: { preload: true, preloadDelayMs: 5000 }
      },
      {
        path: 'plantilla',
        loadChildren: () => import('./features/plantilla/plantilla.module').then(m => m.PlantillaModule),
        data: { preload: true, preloadDelayMs: 1500 }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: NetworkAwarePreloadStrategy,
    initialNavigation: 'enabledNonBlocking'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
