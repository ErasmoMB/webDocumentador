import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from 'src/app/services/services/formulario.service';

@Component({
  selector: 'app-pagina10',
  templateUrl: './pagina10.component.html',
  styleUrls: ['./pagina10.component.css']
})
export class Pagina10Component implements OnInit {
  datos: any;
  json: any;
  selectedImageUrl: string | null = null;
  imageName: string = "";

  viviendas = {
    ocupadas: { total: 0, personas: 0 },
    desocupadas: { total: 0, personas: 0 },
    construccion: { total: 0, personas: 0 }
  };

  materialesParedes = {
    ladrillo: { total: 0, porcentaje: 0 },
    adobe: { total: 0, porcentaje: 0 },
    tapia: { total: 0, porcentaje: 0 },
    piedra: { total: 0, porcentaje: 0 },
    madera: { total: 0, porcentaje: 0 },
    otros: { total: 0, porcentaje: 0 }
  };

  materialesTechos = {
    concreto: { total: 0, porcentaje: 0 },
    calamina: { total: 0, porcentaje: 0 },
    ichu: { total: 0, porcentaje: 0 },
    teja: { total: 0, porcentaje: 0 },
    otros: { total: 0, porcentaje: 0 }
  };

  materialesPisos = {
    tierra: { total: 0, porcentaje: 0 },
    cemento: { total: 0, porcentaje: 0 },
    losetas: { total: 0, porcentaje: 0 },
    madera: { total: 0, porcentaje: 0 },
    otros: { total: 0, porcentaje: 0 }
  };

  constructor(private formularioService: FormularioService, private router: Router) { }

  ngOnInit() {
    this.datos = this.formularioService.obtenerDatos();
    this.inicializarDatos();
  }

  inicializarDatos() {
    if (!this.datos.viviendasComponent1) {
      this.datos.viviendasComponent1 = `Según el Censo del 2017, en el distrito de ${this.datos.distritoSeleccionado || ''} se registraron viviendas con diferentes condiciones de ocupación y materiales de construcción predominantes.`;
    }

    if (!this.datos.estructuraComponent1) {
      this.datos.estructuraComponent1 = `Según el INEI, el material más usado para las paredes de las viviendas dentro del distrito de ${this.datos.distritoSeleccionado || ''} es la Tapia, seguido de la Piedra con barro y del Adobe.`;
    }

    if (!this.datos.estructuraComponent2) {
      this.datos.estructuraComponent2 = `Respecto a los techos, predomina la plancha de calamina, fibra de cemento o similares, seguido de paja y hojas de palmera.`;
    }

    if (!this.datos.estructuraComponent3) {
      this.datos.estructuraComponent3 = `En cuanto a los pisos, el material predominante es la tierra, seguido del cemento.`;
    }

    if (!this.datos.imagenes2) {
      this.datos.imagenes2 = [];
    }

    this.formularioService.actualizarDatos(this.datos);
  }

  calcularTotalesViviendas() {
    return this.viviendas.ocupadas.total + this.viviendas.desocupadas.total + this.viviendas.construccion.total;
  }

  calcularTotalesPersonas() {
    return this.viviendas.ocupadas.personas + this.viviendas.desocupadas.personas + this.viviendas.construccion.personas;
  }

  calcularPorcentajes(materiales: any) {
    const total = Object.values(materiales).reduce((sum: number, item: any) => sum + item.total, 0);
    
    if (total > 0) {
      Object.keys(materiales).forEach(key => {
        materiales[key].porcentaje = (materiales[key].total / total) * 100;
      });
    }
  }

  actualizarDatos() {
    this.calcularPorcentajes(this.materialesParedes);
    this.calcularPorcentajes(this.materialesTechos);
    this.calcularPorcentajes(this.materialesPisos);
    
    this.datos.viviendasData = this.viviendas;
    this.datos.materialesParedes = this.materialesParedes;
    this.datos.materialesTechos = this.materialesTechos;
    this.datos.materialesPisos = this.materialesPisos;
    
    this.formularioService.actualizarDatos(this.datos);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  guardarImagen() {
    if (!this.selectedImageUrl) {
      alert("Por favor, seleccione un archivo.");
      return;
    }
    if (!this.imageName.trim()) {
      alert("Por favor, escriba un nombre para la imagen.");
      return;
    }

    this.datos.imagenes2.push({ name: this.imageName, url: this.selectedImageUrl });
    this.imageName = "";
    this.selectedImageUrl = null;
    this.formularioService.actualizarDatos(this.datos);
  }

  siguientePaso() {
    this.actualizarDatos();
    this.router.navigate(['/resumen']);
  }

  regresar() {
    this.router.navigate(['/pagina9']);
  }
}
