import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from 'src/app/services/services/formulario.service';

@Component({
  selector: 'app-pagina14',
  templateUrl: './pagina14.component.html',
  styleUrls: ['./pagina14.component.css']
})
export class Pagina14Component implements OnInit {
  datos: any;

  constructor(private formularioService: FormularioService, private router: Router) {
    this.datos = this.formularioService.obtenerDatos();
  }

  ngOnInit() {
    if (!this.datos.textoSalud) {
      this.datos.textoSalud = `En el distrito de ${this.datos.distritoSeleccionado || ''}, los principales indicadores de salud muestran tasas de natalidad y mortalidad acordes al contexto rural.`;
    }

    if (!this.datos.textoEducacion) {
      this.datos.textoEducacion = 'El nivel educativo de la población presenta tasas de alfabetización variable según grupos etarios.';
    }

    if (!this.datos.textoCultura) {
      this.datos.textoCultura = 'La población predominantemente habla quechua, con presencia del castellano. La religión católica es mayoritaria.';
    }

    this.formularioService.actualizarDatos(this.datos);
  }

  siguientePaso() {
    this.formularioService.actualizarDatos(this.datos);
    this.router.navigate(['/pagina15']);
  }

  regresar() {
    this.router.navigate(['/pagina13']);
  }
}
