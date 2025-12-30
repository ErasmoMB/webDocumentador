import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion4',
  templateUrl: './seccion4.component.html',
  styleUrls: ['./seccion4.component.css']
})
export class Seccion4Component implements OnInit {
  datos: any = {};

  constructor(
    private formularioService: FormularioService
  ) { }

  ngOnInit() {
    this.actualizarDatos();
  }

  actualizarDatos() {
    this.datos = this.formularioService.obtenerDatos();
  }

  getFilasTablaAISD2(): any[] {
    const filas: any[] = [];
    
    // Buscar todas las filas con datos (hasta 20 filas máximo)
    for (let i = 1; i <= 20; i++) {
      const punto = this.datos?.[`tablaAISD2Fila${i}Punto`];
      const codigo = this.datos?.[`tablaAISD2Fila${i}Codigo`];
      const poblacion = this.datos?.[`tablaAISD2Fila${i}Poblacion`];
      const viviendasEmp = this.datos?.[`tablaAISD2Fila${i}ViviendasEmpadronadas`];
      const viviendasOcp = this.datos?.[`tablaAISD2Fila${i}ViviendasOcupadas`];
      
      // Incluir fila si tiene al menos un dato
      if (punto || codigo || poblacion || viviendasEmp || viviendasOcp) {
        filas.push({
          punto: punto || '____',
          codigo: codigo || '____',
          poblacion: poblacion || '____',
          viviendasEmpadronadas: viviendasEmp || '____',
          viviendasOcupadas: viviendasOcp || '____'
        });
      }
    }
    
    // Si no hay filas, mostrar una fila vacía
    if (filas.length === 0) {
      filas.push({
        punto: '____',
        codigo: '____',
        poblacion: '____',
        viviendasEmpadronadas: '____',
        viviendasOcupadas: '____'
      });
    }
    
    return filas;
  }

  getFotografiasAISD(): any[] {
    const fotos: any[] = [];
    
    // Buscar todas las fotografías (hasta 10 máximo)
    for (let i = 1; i <= 10; i++) {
      const titulo = this.datos?.[`fotografiaAISD${i}Titulo`];
      const fuente = this.datos?.[`fotografiaAISD${i}Fuente`];
      const imagen = this.datos?.[`fotografiaAISD${i}Imagen`];
      
      if (titulo || fuente || imagen) {
        fotos.push({
          numero: `3. ${i}`,
          titulo: titulo || 'Vista panorámica del Anexo Ayroca',
          fuente: fuente || 'GEADES, 2024',
          ruta: imagen || ''
        });
      }
    }
    
    // Si no hay fotografías, mostrar una placeholder
    if (fotos.length === 0) {
      fotos.push({
        numero: '3. 1',
        titulo: 'Vista panorámica del Anexo Ayroca',
        fuente: 'GEADES, 2024',
        ruta: ''
      });
    }
    
    return fotos;
  }
}

