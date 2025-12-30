import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-foto-info',
  templateUrl: './foto-info.component.html',
  styleUrls: ['./foto-info.component.css']
})
export class FotoInfoComponent {
  @Input() numero: string = '1';
  @Input() titulo: string = 'Vista panorámica del Anexo Ayroca';
  @Input() fuente: string = 'GEADES, 2024';
  @Input() ruta: string = '';
}
