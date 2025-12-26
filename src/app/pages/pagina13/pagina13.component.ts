import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from 'src/app/services/services/formulario.service';

@Component({
  selector: 'app-pagina13',
  templateUrl: './pagina13.component.html',
  styleUrls: ['./pagina13.component.css']
})
export class Pagina13Component implements OnInit {
  datos: any;

  constructor(private formularioService: FormularioService, private router: Router) {
    this.datos = this.formularioService.obtenerDatos();
  }

  ngOnInit() {
    if (!this.datos.textoInfraestructura) {
      this.datos.textoInfraestructura = `El distrito de ${this.datos.distritoSeleccionado || ''} cuenta con infraestructura básica en salud, educación y recreación.`;
    }

    if (!this.datos.infraestructuraSalud) {
      this.datos.infraestructuraSalud = 'Se cuenta con un puesto de salud que brinda atención básica.';
    }

    if (!this.datos.infraestructuraEducacion) {
      this.datos.infraestructuraEducacion = 'Existen instituciones educativas de nivel inicial, primaria y secundaria.';
    }

    if (!this.datos.infraestructuraRecreacion) {
      this.datos.infraestructuraRecreacion = 'La infraestructura recreativa incluye losas deportivas y espacios públicos.';
    }

    this.formularioService.actualizarDatos(this.datos);
  }

  siguientePaso() {
    this.formularioService.actualizarDatos(this.datos);
    this.router.navigate(['/pagina14']);
  }

  regresar() {
    this.router.navigate(['/pagina12']);
  }
}
