import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Seccion5ViewInternalComponent } from './seccion5-view-internal.component';

@Component({
    imports: [CommonModule, Seccion5ViewInternalComponent],
    selector: 'app-seccion5-view',
    template: `
    <app-seccion5-view-internal 
      [seccionId]="seccionId">
    </app-seccion5-view-internal>
  `
})
export class Seccion5ViewComponent {
  @Input() seccionId: string = '3.1.4.A.1';
}
