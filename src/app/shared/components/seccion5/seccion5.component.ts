import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion5',
  templateUrl: './seccion5.component.html',
  styleUrls: ['./seccion5.component.css']
})
export class Seccion5Component implements OnInit {
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

  getFotoInstitucionalidad(): any {
    // Buscar la fotografía 3.3 o usar datos específicos
    const titulo = this.datos?.['fotografiaAISD3Titulo'] || this.datos?.['fotografiaInstitucionalidadTitulo'] || 'Local Comunal de la CC ' + (this.datos.grupoAISD || 'Ayroca');
    const fuente = this.datos?.['fotografiaAISD3Fuente'] || this.datos?.['fotografiaInstitucionalidadFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaAISD3Imagen'] || this.datos?.['fotografiaInstitucionalidadImagen'] || '';
    
    return {
      numero: '3. 3',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }
}

