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
    const imagen = this.datos?.['fotografiaAISD3Imagen'] || this.datos?.['fotografiaInstitucionalidadImagen'] || '';
    
    if (!imagen) {
      return null;
    }
    
    const titulo = this.datos?.['fotografiaAISD3Titulo'] || this.datos?.['fotografiaInstitucionalidadTitulo'] || 'Local Comunal de la CC ' + (this.datos.grupoAISD || 'Ayroca');
    const fuente = this.datos?.['fotografiaAISD3Fuente'] || this.datos?.['fotografiaInstitucionalidadFuente'] || 'GEADES, 2024';
    
    return {
      numero: '3. 3',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen,
      fecha: this.datos?.['fotografiaAISD3Fecha'] || '',
      coordenadas: this.datos?.['coordenadasAISD'] || '',
      direccion: this.datos?.['fotografiaAISD3Direccion'] || '',
      ubicacion: this.getUbicacionTexto(),
      altitud: this.datos?.['altitudAISD'] ? this.datos.altitudAISD + 'm' : '',
      velocidad: this.datos?.['fotografiaAISD3Velocidad'] || '0.0km/h'
    };
  }

  getUbicacionTexto(): string {
    const partes = [];
    if (this.datos?.grupoAISD) partes.push('C.p ' + this.datos.grupoAISD);
    if (this.datos?.distritoSeleccionado) partes.push(this.datos.distritoSeleccionado);
    if (this.datos?.provinciaSeleccionada) partes.push(this.datos.provinciaSeleccionada);
    if (this.datos?.departamentoSeleccionado) partes.push(this.datos.departamentoSeleccionado);
    return partes.join(', ') || '';
  }
}

