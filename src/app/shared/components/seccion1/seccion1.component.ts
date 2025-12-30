import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion1',
  templateUrl: './seccion1.component.html',
  styleUrls: ['./seccion1.component.css']
})
export class Seccion1Component implements OnInit {
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

  normalizarNombreProyecto(texto: string | undefined | null, conArticulo: boolean = true): string {
    if (!texto || texto === '____' || texto === '...') return '____';
    let resultado = this.capitalizarTexto(texto.trim());
    
    if (conArticulo) {
      if (/^el proyecto /i.test(resultado)) {
        return resultado.charAt(0).toUpperCase() + resultado.slice(1);
      }
      else if (/^proyecto /i.test(resultado)) {
        return 'El ' + resultado.charAt(0).toUpperCase() + resultado.slice(1);
      }
      else {
        return 'El Proyecto ' + resultado;
      }
    } else {
      return resultado;
    }
  }

  capitalizarTexto(texto: string): string {
    if (!texto || texto.trim() === '') return texto;
    const textoLimpio = texto.trim();
    return textoLimpio.charAt(0).toUpperCase() + textoLimpio.slice(1).toLowerCase();
  }
}

