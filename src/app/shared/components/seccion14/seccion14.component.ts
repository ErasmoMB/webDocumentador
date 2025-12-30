import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion14',
  templateUrl: './seccion14.component.html',
  styleUrls: ['./seccion14.component.css']
})
export class Seccion14Component implements OnInit {
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

  getPorcentajePrimaria(): string {
    if (!this.datos?.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return '____';
    }
    const primaria = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('primaria')
    );
    return primaria?.porcentaje || '____';
  }

  getPorcentajeSecundaria(): string {
    if (!this.datos?.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return '____';
    }
    const secundaria = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('secundaria')
    );
    return secundaria?.porcentaje || '____';
  }

  getPorcentajeSuperiorNoUniversitaria(): string {
    if (!this.datos?.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return '____';
    }
    const superiorNoUniv = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('superior no universitaria') || item.categoria.toLowerCase().includes('superior no universitaria'))
    );
    return superiorNoUniv?.porcentaje || '____';
  }

  getTasaAnalfabetismo(): string {
    if (!this.datos?.tasaAnalfabetismoTabla || !Array.isArray(this.datos.tasaAnalfabetismoTabla)) {
      return '____';
    }
    const noSabeLeer = this.datos.tasaAnalfabetismoTabla.find((item: any) => 
      item.indicador && (item.indicador.toLowerCase().includes('no sabe') || item.indicador.toLowerCase().includes('no puede'))
    );
    return noSabeLeer?.porcentaje || '____';
  }

  getCasosAnalfabetismo(): string {
    if (!this.datos?.tasaAnalfabetismoTabla || !Array.isArray(this.datos.tasaAnalfabetismoTabla)) {
      return '____';
    }
    const noSabeLeer = this.datos.tasaAnalfabetismoTabla.find((item: any) => 
      item.indicador && (item.indicador.toLowerCase().includes('no sabe') || item.indicador.toLowerCase().includes('no puede'))
    );
    return noSabeLeer?.casos || '____';
  }
}

