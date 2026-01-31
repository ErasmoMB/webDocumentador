import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Seccion7FormComponent } from '../seccion7/seccion7-form.component';

@Component({
    imports: [CommonModule, Seccion7FormComponent],
    selector: 'app-seccion7-form-wrapper',
    templateUrl: './seccion7-form-wrapper.component.html'
})
export class Seccion7FormWrapperComponent {
  @Input() seccionId: string = '';
}
