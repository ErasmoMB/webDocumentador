import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentosComponent } from './pages/documentos/documentos.component';
import { ResumenComponent } from './pages/resumen/resumen.component';
import { Pagina2Component } from './pages/pagina2/pagina2.component';
import { Pagina3Component } from './pages/pagina3/pagina3.component';
import { Pagina4Component } from './pages/pagina4/pagina4.component';
import { Pagina5Component } from './pages/pagina5/pagina5.component';
import { Pagina6Component } from './pages/pagina6/pagina6.component';
import { Pagina7Component } from './pages/pagina7/pagina7.component';
import { Pagina8Component } from './pages/pagina8/pagina8.component';
import { Pagina9Component } from './pages/pagina9/pagina9.component';
import { Pagina10Component } from './pages/pagina10/pagina10.component';
import { Pagina11Component } from './pages/pagina11/pagina11.component';
import { Pagina12Component } from './pages/pagina12/pagina12.component';
import { Pagina13Component } from './pages/pagina13/pagina13.component';
import { Pagina14Component } from './pages/pagina14/pagina14.component';
import { Pagina15Component } from './pages/pagina15/pagina15.component';
import { Pagina16Component } from './pages/pagina16/pagina16.component';

const routes: Routes = [
  { path: 'documento', component: DocumentosComponent }, 
  { path: 'resumen', component: ResumenComponent },
  { path: 'pagina2', component: Pagina2Component },
  { path: 'pagina3', component: Pagina3Component },
  { path: 'pagina4', component: Pagina4Component },
  { path: 'pagina5', component: Pagina5Component },
  { path: 'pagina6', component: Pagina6Component },
  { path: 'pagina7', component: Pagina7Component },
  { path: 'pagina8', component: Pagina8Component },
  { path: 'pagina9', component: Pagina9Component },
  { path: 'pagina10', component: Pagina10Component },
  { path: 'pagina11', component: Pagina11Component },
  { path: 'pagina12', component: Pagina12Component },
  { path: 'pagina13', component: Pagina13Component },
  { path: 'pagina14', component: Pagina14Component },
  { path: 'pagina15', component: Pagina15Component },
  { path: 'pagina16', component: Pagina16Component },

  { path: '', redirectTo: 'documento', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
