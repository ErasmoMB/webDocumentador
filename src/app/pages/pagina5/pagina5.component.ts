import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from 'src/app/services/services/formulario.service';

@Component({
  selector: 'app-pagina5',
  templateUrl: './pagina5.component.html',
  styleUrls: ['./pagina5.component.css']
})
export class Pagina5Component implements OnInit {
  datos: any;
  json: any;

  constructor(private formularioService: FormularioService, private router: Router) {
    this.datos = this.formularioService.obtenerDatos();
    this.json = this.formularioService.obtenerJSON();
  }

  ngOnInit() {
    this.inicializarDatos();
  }

  inicializarDatos() {
    if (!this.datos.influenciaSocialDirecta) {
      this.datos.influenciaSocialDirecta = `CC ${this.datos.grupoAISD || ''}`;
    }

    if (!this.datos.componente1Pagina5) {
      this.datos.componente1Pagina5 = `La ${this.datos.grupoAISD || ''} se encuentra ubicada predominantemente dentro del distrito de ${this.datos.distritoSeleccionado || ''}, provincia de ${this.datos.provinciaSeleccionada || ''}; no obstante, sus límites comunales pueden abarcar pequeñas áreas de distritos colindantes.`;
    }

    if (!this.datos.descripcionTabla) {
      this.datos.descripcionTabla = 'Centro Comunal';
    }

    if (!this.datos.componente2Pagina5) {
      this.datos.componente2Pagina5 = `Esta delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales y la posible ocurrencia de impactos directos del proyecto.`;
    }

    this.formularioService.actualizarDatos(this.datos);
  }

  siguientePaso() {
    this.formularioService.actualizarDatos(this.datos);
    this.router.navigate(['/pagina6']);
  }

  regresar() {
    this.router.navigate(['/pagina4']);
  }
}
