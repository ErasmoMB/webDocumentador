import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from 'src/app/services/services/formulario.service';

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.css']
})
export class DocumentosComponent {
  projectName: string = '';

  jsonData: DatosJSON[] = [];
  departamentos: string[] = [];
  provincias: string[] = [];
  distritos: string[] = [];

  departamentoSeleccionado: string = '';
  provinciaSeleccionada: string = '';
  distritoSeleccionado: string = '';

  detalleProyecto: string = '';

  datos: any;

  constructor(private formularioService: FormularioService, private router: Router) {
    this.datos = this.formularioService.obtenerDatos();
    console.log(this.formularioService.obtenerDatos());
  }

  siguientePaso() {
    // Asegurar que TODOS los campos estén guardados antes de navegar
    if (!this.datos.projectName) {
      this.datos.projectName = 'Proyecto ' + this.datos.distritoSeleccionado;
    }
    this.formularioService.actualizarDatos(this.datos);
    this.router.navigate(['/pagina2']);
  }

  resumen() {
    this.formularioService.actualizarDatos(this.datos);
    this.router.navigate(['/resumen']);
  }

  cargarArchivo(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onload = (e: any) => {
        try {
          const contenido = JSON.parse(e.target.result);
  
          const primeraClave = Object.keys(contenido)[0]; 

          if (contenido && contenido[primeraClave] && Array.isArray(contenido[primeraClave])) {
            this.jsonData = contenido[primeraClave]; 
            this.formularioService.guardarJSON(this.jsonData);
            this.departamentos = [...new Set(this.jsonData.map((item) => item.DPTO))];
          } else {
            console.error('El archivo JSON no tiene la estructura esperada.');
          }
        } catch (error) {
          console.error('Error al leer el archivo JSON:', error);
        }
      };
      lector.readAsText(archivo);
    }
  }

  actualizarProvincias() {
    if (this.datos.departamentoSeleccionado) {
      this.provincias = [
        ...new Set(
          this.jsonData
            .filter((item) => item.DPTO === this.datos.departamentoSeleccionado)
            .map((item) => item.PROV)
        )
      ];
      this.datos.provinciaSeleccionada = '';
      this.distritos = [];
    }
  }

  actualizarDistritos() {
    if (this.datos.provinciaSeleccionada) {
      this.distritos = [
        ...new Set(
          this.jsonData
            .filter(
              (item) =>
                item.DPTO === this.datos.departamentoSeleccionado &&
                item.PROV === this.datos.provinciaSeleccionada
            )
            .map((item) => item.DIST)
        )
      ];
      this.datos.distritoSeleccionado = '';
    }
  }
}

interface DatosJSON {
  DPTO: string;
  PROV: string;
  DIST: string;

}
