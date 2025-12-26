import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from 'src/app/services/services/formulario.service';

@Component({
  selector: 'app-pagina12',
  templateUrl: './pagina12.component.html',
  styleUrls: ['./pagina12.component.css']
})
export class Pagina12Component implements OnInit {
  datos: any;

  constructor(private formularioService: FormularioService, private router: Router) {
    this.datos = this.formularioService.obtenerDatos();
  }

  ngOnInit() {
    if (!this.datos.textoTransporte) {
      this.datos.textoTransporte = `El acceso al distrito de ${this.datos.distritoSeleccionado || ''} se realiza principalmente por vía terrestre a través de carreteras afirmadas y trochas carrozables.`;
    }

    if (!this.datos.textoTelecomunicaciones) {
      this.datos.textoTelecomunicaciones = `En cuanto a telecomunicaciones, el acceso a telefonía móvil y servicios de internet es limitado en la zona.`;
    }

    this.formularioService.actualizarDatos(this.datos);
  }

  siguientePaso() {
    this.formularioService.actualizarDatos(this.datos);
    this.router.navigate(['/pagina13']);
  }

  regresar() {
    this.router.navigate(['/pagina11']);
  }
}
