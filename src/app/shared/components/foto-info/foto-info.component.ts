import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-foto-info',
  templateUrl: './foto-info.component.html',
  styleUrls: ['./foto-info.component.css']
})
export class FotoInfoComponent {
  @Input() numero: string = '';
  @Input() titulo: string = '';
  @Input() fuente: string = 'GEADES, 2024';
  @Input() ruta: string = '';
  @Input() fecha: string = '';
  @Input() coordenadas: string = '';
  @Input() direccion: string = '';
  @Input() ubicacion: string = '';
  @Input() altitud: string = '';
  @Input() velocidad: string = '0.0km/h';
  @Input() mostrarCompass: boolean = true;
  @Input() mostrarMetadata: boolean = true;

  constructor() {}
}

