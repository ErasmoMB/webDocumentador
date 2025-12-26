import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from 'src/app/services/services/formulario.service';

@Component({
  selector: 'app-pagina11',
  templateUrl: './pagina11.component.html',
  styleUrls: ['./pagina11.component.css']
})
export class Pagina11Component implements OnInit {
  datos: any;

  servicios = {
    agua: {
      redPublica: { total: 0, porcentaje: 0 },
      pozo: { total: 0, porcentaje: 0 },
      camion: { total: 0, porcentaje: 0 },
      rio: { total: 0, porcentaje: 0 },
      vecino: { total: 0, porcentaje: 0 },
      otros: { total: 0, porcentaje: 0 }
    },
    desague: {
      redPublica: { total: 0, porcentaje: 0 },
      pozo: { total: 0, porcentaje: 0 },
      letrina: { total: 0, porcentaje: 0 },
      rio: { total: 0, porcentaje: 0 },
      noTiene: { total: 0, porcentaje: 0 },
      otros: { total: 0, porcentaje: 0 }
    },
    electricidad: {
      redPublica: { total: 0, porcentaje: 0 },
      generador: { total: 0, porcentaje: 0 },
      panelSolar: { total: 0, porcentaje: 0 },
      noTiene: { total: 0, porcentaje: 0 },
      otros: { total: 0, porcentaje: 0 }
    },
    residuos: {
      camion: { total: 0, porcentaje: 0 },
      quema: { total: 0, porcentaje: 0 },
      entierra: { total: 0, porcentaje: 0 },
      rio: { total: 0, porcentaje: 0 },
      otros: { total: 0, porcentaje: 0 }
    }
  };

  constructor(private formularioService: FormularioService, private router: Router) {
    this.datos = this.formularioService.obtenerDatos();
  }

  ngOnInit() {
    this.inicializarDatos();
  }

  inicializarDatos() {
    if (!this.datos.textoServiciosBasicos) {
      this.datos.textoServiciosBasicos = `En el distrito de ${this.datos.distritoSeleccionado || ''}, según el Censo Nacional 2017, se identificaron las siguientes condiciones de acceso a servicios básicos.`;
    }

    if (!this.datos.textoAgua) {
      this.datos.textoAgua = `Respecto al abastecimiento de agua, la mayoría de viviendas en ${this.datos.distritoSeleccionado || ''} se abastecen de fuentes naturales como ríos o manantiales.`;
    }

    if (!this.datos.textoDesague) {
      this.datos.textoDesague = `En cuanto al servicio higiénico, predomina el uso de letrinas o pozos ciegos.`;
    }

    if (!this.datos.textoElectricidad) {
      this.datos.textoElectricidad = `El acceso a electricidad es limitado, con algunas viviendas conectadas a red pública y otras sin servicio.`;
    }

    if (!this.datos.textoResiduos) {
      this.datos.textoResiduos = `La eliminación de residuos sólidos se realiza principalmente mediante quema o entierro.`;
    }

    this.formularioService.actualizarDatos(this.datos);
  }

  calcularPorcentajes(servicio: any) {
    const total = Object.values(servicio).reduce((sum: number, item: any) => sum + item.total, 0);
    
    if (total > 0) {
      Object.keys(servicio).forEach(key => {
        servicio[key].porcentaje = (servicio[key].total / total) * 100;
      });
    }
  }

  actualizarDatos() {
    this.calcularPorcentajes(this.servicios.agua);
    this.calcularPorcentajes(this.servicios.desague);
    this.calcularPorcentajes(this.servicios.electricidad);
    this.calcularPorcentajes(this.servicios.residuos);
    
    this.datos.serviciosBasicos = this.servicios;
    this.formularioService.actualizarDatos(this.datos);
  }

  siguientePaso() {
    this.actualizarDatos();
    this.router.navigate(['/pagina12']);
  }

  regresar() {
    this.router.navigate(['/pagina10']);
  }
}
