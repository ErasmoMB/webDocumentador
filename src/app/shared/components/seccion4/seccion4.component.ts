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
    const filasActivas = this.formularioService.obtenerFilasActivasTablaAISD2();
    
    // Buscar todas las filas con datos (hasta 20 filas máximo)
    for (let i = 1; i <= 20; i++) {
      const punto = this.datos?.[`tablaAISD2Fila${i}Punto`];
      const codigo = this.datos?.[`tablaAISD2Fila${i}Codigo`];
      const poblacion = this.datos?.[`tablaAISD2Fila${i}Poblacion`];
      const viviendasEmp = this.datos?.[`tablaAISD2Fila${i}ViviendasEmpadronadas`];
      const viviendasOcp = this.datos?.[`tablaAISD2Fila${i}ViviendasOcupadas`];
      
      const codigoStr = codigo ? codigo.toString().trim() : '';
      const esFilaActiva = filasActivas.length === 0 || filasActivas.includes(codigoStr);
      
      // Incluir fila solo si está activa y tiene al menos un dato
      if (esFilaActiva && (punto || codigo || poblacion || viviendasEmp || viviendasOcp)) {
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
    
    for (let i = 1; i <= 10; i++) {
      const titulo = this.datos?.[`fotografiaAISD${i}Titulo`];
      const fuente = this.datos?.[`fotografiaAISD${i}Fuente`];
      const imagen = this.datos?.[`fotografiaAISD${i}Imagen`];
      
      if (imagen) {
        fotos.push({
          numero: `3. ${i}`,
          titulo: titulo || 'Título de fotografía',
          fuente: fuente || 'GEADES, 2024',
          ruta: imagen
        });
      }
    }
    
    return fotos;
  }
}

