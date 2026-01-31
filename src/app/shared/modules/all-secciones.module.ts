import { NgModule } from '@angular/core';
import { SeccionesGroupAModule } from './secciones-group-a.module';
import { SeccionesGroupBModule } from './secciones-group-b.module';
import { SeccionesGroupCModule } from './secciones-group-c.module';

/**
 * Módulo que agrupa todos los componentes de sección (1-36) 
 * Divide la carga en 3 grupos para mejorar performance
 */
@NgModule({
  imports: [
    SeccionesGroupAModule,
    SeccionesGroupBModule,
    SeccionesGroupCModule,
  ],
  exports: [
    SeccionesGroupAModule,
    SeccionesGroupBModule,
    SeccionesGroupCModule,
  ]
})
export class AllSeccionesModule { }
