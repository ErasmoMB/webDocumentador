import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion16',
  templateUrl: './seccion16.component.html',
  styleUrls: ['./seccion16.component.css']
})
export class Seccion16Component implements OnInit {
  datos: any = {};

  constructor(
    private formularioService: FormularioService
  ) { }

  ngOnInit() {
    this.actualizarDatos();
  }

  actualizarDatos() {
    this.datos = this.formularioService.obtenerDatos();
  }

  getFotoReservorio(): any {
    const titulo = this.datos?.['fotografiaReservorioTitulo'] || 'Reservorio del anexo ' + (this.datos.grupoAISD || 'Ayroca');
    const fuente = this.datos?.['fotografiaReservorioFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaReservorioImagen'] || '';
    
    return {
      numero: '3. 20',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoUsoSuelos(): any {
    const titulo = this.datos?.['fotografiaUsoSuelosTitulo'] || 'Uso de los suelos en el anexo ' + (this.datos.grupoAISD || 'Ayroca');
    const fuente = this.datos?.['fotografiaUsoSuelosFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaUsoSuelosImagen'] || '';
    
    return {
      numero: '3. 24',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }
}

