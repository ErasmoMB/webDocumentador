import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion18',
  templateUrl: './seccion18.component.html',
  styleUrls: ['./seccion18.component.css']
})
export class Seccion18Component implements OnInit {
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

  getTotalPersonasCC(): string {
    if (!this.datos?.nbiCCAyrocaTabla || !Array.isArray(this.datos.nbiCCAyrocaTabla)) {
      return '____';
    }
    const totalItem = this.datos.nbiCCAyrocaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total referencial')
    );
    return totalItem?.casos || '____';
  }

  getPorcentajeHacinamientoCC(): string {
    if (!this.datos?.nbiCCAyrocaTabla || !Array.isArray(this.datos.nbiCCAyrocaTabla)) {
      return '____';
    }
    const item = this.datos.nbiCCAyrocaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('hacinamiento')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeSinServiciosCC(): string {
    if (!this.datos?.nbiCCAyrocaTabla || !Array.isArray(this.datos.nbiCCAyrocaTabla)) {
      return '____';
    }
    const item = this.datos.nbiCCAyrocaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('sin servicios higiénicos')
    );
    return item?.porcentaje || '____';
  }

  getTotalUnidadesDistrito(): string {
    if (!this.datos?.nbiDistritoCahuachoTabla || !Array.isArray(this.datos.nbiDistritoCahuachoTabla)) {
      return '____';
    }
    const totalItem = this.datos.nbiDistritoCahuachoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total referencial')
    );
    return totalItem?.casos || '____';
  }

  getPorcentajeSinServiciosDistrito(): string {
    if (!this.datos?.nbiDistritoCahuachoTabla || !Array.isArray(this.datos.nbiDistritoCahuachoTabla)) {
      return '____';
    }
    const item = this.datos.nbiDistritoCahuachoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('sin servicios higiénicos')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeHacinamientoDistrito(): string {
    if (!this.datos?.nbiDistritoCahuachoTabla || !Array.isArray(this.datos.nbiDistritoCahuachoTabla)) {
      return '____';
    }
    const item = this.datos.nbiDistritoCahuachoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('hacinamiento')
    );
    return item?.porcentaje || '____';
  }
}

