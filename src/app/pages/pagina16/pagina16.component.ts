import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from 'src/app/services/services/formulario.service';

@Component({
  selector: 'app-pagina16',
  templateUrl: './pagina16.component.html',
  styleUrls: ['./pagina16.component.css']
})
export class Pagina16Component implements OnInit {
  datos: any;

  constructor(private formularioService: FormularioService, private router: Router) {
    this.datos = this.formularioService.obtenerDatos();
  }

  ngOnInit() {
    if (!this.datos.textoOrganizacion) {
      this.datos.textoOrganizacion = `La organización social en ${this.datos.distritoSeleccionado || ''} se estructura a través de comunidades campesinas, juntas vecinales y organizaciones de base.`;
    }

    if (!this.datos.textoFestividades) {
      this.datos.textoFestividades = 'Las principales festividades están vinculadas al calendario agrícola y religioso, destacando celebraciones patronales y tradicionales.';
    }

    this.formularioService.actualizarDatos(this.datos);
  }

  siguientePaso() {
    this.formularioService.actualizarDatos(this.datos);
    this.router.navigate(['/resumen']);
  }

  regresar() {
    this.router.navigate(['/pagina15']);
  }
}
