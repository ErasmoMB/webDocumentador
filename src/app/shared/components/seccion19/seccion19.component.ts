import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion19',
  templateUrl: './seccion19.component.html',
  styleUrls: ['./seccion19.component.css']
})
export class Seccion19Component implements OnInit {
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

  shouldShowOrgCell(index: number, autoridades: any[]): boolean {
    if (!autoridades || index === 0) {
      return true;
    }
    return autoridades[index].organizacion !== autoridades[index - 1].organizacion;
  }

  getOrgRowSpan(organizacion: string, autoridades: any[]): number {
    if (!autoridades) {
      return 1;
    }
    return autoridades.filter((item: any) => item.organizacion === organizacion).length;
  }
}

