import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion11',
  templateUrl: './seccion11.component.html',
  styleUrls: ['./seccion11.component.css']
})
export class Seccion11Component implements OnInit {
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

  getFotoTransporte(): any {
    const titulo = this.datos?.['fotografiaTransporteTitulo'] || 'Infraestructura de transporte en la CC ' + (this.datos.grupoAISD || 'Ayroca');
    const fuente = this.datos?.['fotografiaTransporteFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaTransporteImagen'] || '';
    
    return {
      numero: '3. 6',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoTelecomunicaciones(): any {
    const titulo = this.datos?.['fotografiaTelecomunicacionesTitulo'] || 'Vivienda con antena de DIRECTV en el anexo ' + (this.datos.grupoAISD || 'Ayroca');
    const fuente = this.datos?.['fotografiaTelecomunicacionesFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaTelecomunicacionesImagen'] || '';
    
    return {
      numero: '3. 9',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }
}

