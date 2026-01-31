import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SeccionesRoutingModule } from './secciones-routing.module';
import { SeccionComponent } from '../../pages/seccion/seccion.component';
import { CoreSharedModule } from '../../shared/modules/core-shared.module';
import { SeccionContainerComponent } from './container/seccion-container.component';

@NgModule({
  declarations: [
    SeccionComponent,
    SeccionContainerComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreSharedModule,
    SeccionesRoutingModule,
  ]
})
export class SeccionesModule { }
