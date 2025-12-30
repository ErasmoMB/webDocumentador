import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion30',
  templateUrl: './seccion30.component.html',
  styleUrls: ['./seccion30.component.css']
})
export class Seccion30Component implements OnInit {
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

  getPorcentajeSecundaria(): string {
    if (!this.datos?.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return '____';
    }
    const item = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('secundaria')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajePrimaria(): string {
    if (!this.datos?.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return '____';
    }
    const item = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('primaria')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeSinNivel(): string {
    if (!this.datos?.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return '____';
    }
    const item = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('sin nivel') || item.categoria.toLowerCase().includes('inicial'))
    );
    return item?.porcentaje || '____';
  }

  getCasosAnalfabetismo(): string {
    if (!this.datos?.tasaAnalfabetismoTabla || !Array.isArray(this.datos.tasaAnalfabetismoTabla)) {
      return '____';
    }
    const item = this.datos.tasaAnalfabetismoTabla.find((item: any) => 
      item.indicador && item.indicador.toLowerCase().includes('no sabe')
    );
    return item?.casos?.toString() || '____';
  }

  getPorcentajeAnalfabetismo(): string {
    if (!this.datos?.tasaAnalfabetismoTabla || !Array.isArray(this.datos.tasaAnalfabetismoTabla)) {
      return '____';
    }
    const item = this.datos.tasaAnalfabetismoTabla.find((item: any) => 
      item.indicador && item.indicador.toLowerCase().includes('no sabe')
    );
    return item?.porcentaje || '____';
  }
}

