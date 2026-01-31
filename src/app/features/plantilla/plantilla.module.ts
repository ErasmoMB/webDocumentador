import { NgModule } from '@angular/core';

import { PlantillaRoutingModule } from './plantilla-routing.module';
import { PlantillaViewComponent } from '../../pages/plantilla/plantilla-view.component';
import { ResumenComponent } from '../../pages/plantilla/plantilla.component';
import { SharedModule } from '../../shared/shared.module';
import { AllSeccionesModule } from '../../shared/modules/all-secciones.module';

@NgModule({
  declarations: [
    PlantillaViewComponent,
    ResumenComponent,
  ],
  imports: [
    SharedModule,
    AllSeccionesModule,
    PlantillaRoutingModule,
  ]
})
export class PlantillaModule { }
