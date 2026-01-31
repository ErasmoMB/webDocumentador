import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Seccion4Component } from './seccion4.component';

@Component({
  standalone: true,
  imports: [CommonModule, Seccion4Component],
  selector: 'app-seccion4-view',
  template: `
    <app-seccion4 
      [seccionId]="seccionId" 
      [modoFormulario]="false">
    </app-seccion4>
  `
})
export class Seccion4ViewComponent {
  @Input() seccionId: string = '3.1.4.A.1';
}
