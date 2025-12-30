import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion15',
  templateUrl: './seccion15.component.html',
  styleUrls: ['./seccion15.component.css']
})
export class Seccion15Component implements OnInit {
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

  getPorcentajeCastellano(): string {
    if (!this.datos?.lenguasMaternasTabla || !Array.isArray(this.datos.lenguasMaternasTabla)) {
      return '____';
    }
    const castellano = this.datos.lenguasMaternasTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('castellano') || item.categoria.toLowerCase().includes('español'))
    );
    return castellano?.porcentaje || '____';
  }

  getPorcentajeQuechua(): string {
    if (!this.datos?.lenguasMaternasTabla || !Array.isArray(this.datos.lenguasMaternasTabla)) {
      return '____';
    }
    const quechua = this.datos.lenguasMaternasTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('quechua')
    );
    return quechua?.porcentaje || '____';
  }

  getFotoIglesia(): any {
    const titulo = this.datos?.['fotografiaIglesiaTitulo'] || 'Iglesia Matriz del anexo ' + (this.datos.grupoAISD || 'Ayroca');
    const fuente = this.datos?.['fotografiaIglesiaFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaIglesiaImagen'] || '';
    
    if (!imagen) {
      return {
        numero: '3. 18',
        titulo: '',
        fuente: '',
        ruta: ''
      };
    }
    
    return {
      numero: '3. 18',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }
}

