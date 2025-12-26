import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from 'src/app/services/services/formulario.service';

@Component({
  selector: 'app-pagina4',
  templateUrl: './pagina4.component.html',
  styleUrls: ['./pagina4.component.css']
})
export class Pagina4Component {
  datos: any;
  entrevistados: { nombre: string; cargo: string; organizacion: string }[] = [];
  flagGuardar: boolean = false;
  flagGuardar2: boolean = false;
  title: string = '';
  

  constructor(private formularioService: FormularioService, private router: Router) {
    this.datos = this.formularioService.obtenerDatos();
    console.log(this.formularioService.obtenerJSON());
    // this.jsonData = this.formularioService.obtenerJSON();

    // Inicializar campos si no existen
    if (!this.datos.entrevistados) {
      this.datos.entrevistados = [];
    }
    if (!this.datos.cantidadEntrevistas) {
      this.datos.cantidadEntrevistas = 0;
    }
    if (!this.datos.consultora) {
      this.datos.consultora = '';
    }
    if (!this.datos.justificacionAISI) {
      this.datos.justificacionAISI = '';
    }
    if (!this.datos.componenteFuentesPrimarias2) {
      this.datos.componenteFuentesPrimarias2 = '';
    }

    this.datos.componenteFuentesPrimarias1 = 'de la ' + this.datos.distritoSeleccionado + ' (localidad perteneciente al AISD)';
    this.datos.pagina4DistDpto = 'el distrito de ' + this.datos.distritoSeleccionado + ' y la capital distrital, ambos ubicados en la provincia ' + this.datos.provinciaSeleccionada + ', departamento ' + this.datos.departamentoSeleccionado;

    this.formularioService.actualizarDatos(this.datos);
  }

  siguientePaso() {
    this.formularioService.actualizarDatos(this.datos);
    this.router.navigate(['/pagina5']);
  }

  regresar() {
    this.router.navigate(['/pagina3']);
  }

  actualizarCantidad() {
    // Convertir el valor a número correctamente
    const cantidad = Number(this.datos.cantidadEntrevistas) || 0;
  
    // Asignar el valor corregido a `datos.cantidadEntrevistas`
    this.datos.cantidadEntrevistas = cantidad;
  
    // Generar entrevistados nuevamente
    this.generarEntrevistados();
  }

  generarEntrevistados() {
    const cantidad = parseInt(this.datos.cantidadEntrevistas, 10) || 0;
    
    // Si la cantidad es menor, recortamos el array; si es mayor, agregamos nuevos elementos
    if (this.datos.entrevistados) {
      if (this.datos.entrevistados.length > cantidad) {
        this.datos.entrevistados = this.datos.entrevistados.slice(0, cantidad);
      } else {
        while (this.datos.entrevistados.length < cantidad) {
          this.datos.entrevistados.push({ nombre: '', cargo: '', organizacion: '' });
        }
      }
    } else {
      // Si this.datos.entrevistados no existe, lo inicializamos
      this.datos.entrevistados = Array.from({ length: cantidad }, () => ({
        nombre: '',
        cargo: '',
        organizacion: ''
      }));
    }
  }

  guardar() {
    this.flagGuardar = true;
    this.formularioService.actualizarDatos(this.datos);
    console.log('Datos ingresados:', this.datos.entrevistados);
  }

  actualizar(){
    const resultado = (100*Number(this.datos.muestra))/Number(this.datos.universo);
    const noEncuestados = this.datos.universo - this.datos.muestra;
    this.datos.detalleEncuesta = 'La muestra seleccionada a la que se aplicaron las encuestas dentro de la ' + this.datos.distritoSeleccionado + 
    '('+ this.datos.muestra + ' ' + this.datos.variable+')'+ ' representa el '+ resultado+'%'+ ' de ' + this.datos.nameuniverso +
     ' ('+ this.datos.muestra + ' ' + this.datos.variable+') '+ this.datos.fuente + '. Asimismo, los resultados de estos instrumentos de recojo de información, respecto a la comunidad en cuestión, cuentan con un margen de error de ' +
      this.datos.margen+'%'+ 'a un nivel de confianza del ' + this.datos.nivel+'%.';

    this.datos.precisionEncuesta = 'Cabe precisar que se aplicaron encuestas en la mayor cantidad de barrios posibles que conforman la comunidad. De esta manera, se asegura una mayor representatividad del conjunto total. Adicionalmente, cabe mencionar que las encuestas se aplicaron de manera aleatoria a las personas dentro de la comunidad, con la única condición de ser comuneros o ser familiar directo de alguno. En el siguiente cuadro se consigna el tamaño de la muestra y el porcentaje que representa respecto a res total de la  '+ this.datos.distritoSeleccionado + '.';
    
    this.datos.encuestadoPorcentaje = resultado;
    this.datos.noEncuestados = noEncuestados;
    this.datos.noResultadoPorcentaje = 100 - resultado;
    
    this.formularioService.actualizarDatos(this.datos);
  }

  guardar2(){
    this.flagGuardar2 = true;
    this.formularioService.actualizarDatos(this.datos);
  }

  resumen() {
    this.formularioService.actualizarDatos(this.datos);
    this.router.navigate(['/resumen']);
  }
}
