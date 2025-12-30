import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion21',
  templateUrl: './seccion21.component.html',
  styleUrls: ['./seccion21.component.css']
})
export class Seccion21Component implements OnInit {
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

  getFotoCahuacho(): any {
    const titulo = this.datos?.['fotografiaCahuachoTitulo'] || 'Vista panorámica del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho');
    const fuente = this.datos?.['fotografiaCahuachoFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaCahuachoImagen'] || '';
    
    return {
      numero: '3. 25',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }
}

