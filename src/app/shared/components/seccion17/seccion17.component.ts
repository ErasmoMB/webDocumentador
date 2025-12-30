import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion17',
  templateUrl: './seccion17.component.html',
  styleUrls: ['./seccion17.component.css']
})
export class Seccion17Component implements OnInit {
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

  getIDH(): string {
    if (!this.datos?.indiceDesarrolloHumanoTabla || !Array.isArray(this.datos.indiceDesarrolloHumanoTabla) || this.datos.indiceDesarrolloHumanoTabla.length === 0) {
      return '____';
    }
    const item = this.datos.indiceDesarrolloHumanoTabla[0];
    return item?.idh || '____';
  }

  getRankIDH(): string {
    if (!this.datos?.indiceDesarrolloHumanoTabla || !Array.isArray(this.datos.indiceDesarrolloHumanoTabla) || this.datos.indiceDesarrolloHumanoTabla.length === 0) {
      return '____';
    }
    const item = this.datos.indiceDesarrolloHumanoTabla[0];
    return item?.rankIdh || item?.rankEsperanza || '____';
  }
}

