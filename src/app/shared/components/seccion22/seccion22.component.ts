import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion22',
  templateUrl: './seccion22.component.html',
  styleUrls: ['./seccion22.component.css']
})
export class Seccion22Component implements OnInit {
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

  getTotalPoblacion(): string {
    if (!this.datos?.poblacionSexoAISI || !Array.isArray(this.datos.poblacionSexoAISI)) {
      return '____';
    }
    const totalItem = this.datos.poblacionSexoAISI.find((item: any) => 
      item.sexo && item.sexo.toLowerCase().includes('total')
    );
    return totalItem?.casos?.toString() || '____';
  }

  getPorcentajeMujeres(): string {
    if (!this.datos?.poblacionSexoAISI || !Array.isArray(this.datos.poblacionSexoAISI)) {
      return '____';
    }
    const item = this.datos.poblacionSexoAISI.find((item: any) => 
      item.sexo && item.sexo.toLowerCase().includes('mujer')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeHombres(): string {
    if (!this.datos?.poblacionSexoAISI || !Array.isArray(this.datos.poblacionSexoAISI)) {
      return '____';
    }
    const item = this.datos.poblacionSexoAISI.find((item: any) => 
      item.sexo && item.sexo.toLowerCase().includes('hombre')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeGrupoEtario(categoria: string): string {
    if (!this.datos?.poblacionEtarioAISI || !Array.isArray(this.datos.poblacionEtarioAISI)) {
      return '____';
    }
    const item = this.datos.poblacionEtarioAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase())
    );
    return item?.porcentaje || '____';
  }
}

