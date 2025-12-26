import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from 'src/app/services/services/formulario.service';

@Component({
  selector: 'app-pagina15',
  templateUrl: './pagina15.component.html',
  styleUrls: ['./pagina15.component.css']
})
export class Pagina15Component implements OnInit {
  datos: any;

  constructor(private formularioService: FormularioService, private router: Router) {
    this.datos = this.formularioService.obtenerDatos();
  }

  ngOnInit() {
    if (!this.datos.textoIDH) {
      this.datos.textoIDH = `El Índice de Desarrollo Humano del distrito de ${this.datos.distritoSeleccionado || ''} refleja condiciones de desarrollo medio-bajo según estándares nacionales.`;
    }

    if (!this.datos.textoNBI) {
      this.datos.textoNBI = 'Las Necesidades Básicas Insatisfechas muestran carencias en servicios básicos y condiciones de vivienda.';
    }

    if (!this.datos.textoUsoSuelos) {
      this.datos.textoUsoSuelos = 'El uso de suelos en la zona está destinado principalmente a actividades agropecuarias y conservación.';
    }

    this.formularioService.actualizarDatos(this.datos);
  }

  siguientePaso() {
    this.formularioService.actualizarDatos(this.datos);
    this.router.navigate(['/pagina16']);
  }

  regresar() {
    this.router.navigate(['/pagina14']);
  }
}
