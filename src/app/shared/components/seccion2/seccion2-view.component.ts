import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Seccion2Component } from './seccion2.component';
import { CoreSharedModule } from '../../modules/core-shared.module';

/**
 * Componente de VISTA para Sección 2
 * Solo muestra contenido (sin formularios)
 * Responsabilidad única: Presentación de datos
 */
@Component({
    imports: [
        CommonModule,
        CoreSharedModule,
        Seccion2Component
    ],
    selector: 'app-seccion2-view',
    templateUrl: './seccion2-view.component.html'
})
export class Seccion2ViewComponent implements OnInit {
  @Input() seccionId: string = '3.1.2';
  @ViewChild(Seccion2Component) seccion2Component!: Seccion2Component;

  constructor() {}

  ngOnInit() {
    // El componente hijo se inicializa automáticamente
  }
}
