import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion25',
  templateUrl: './seccion25.component.html',
  styleUrls: ['./seccion25.component.css']
})
export class Seccion25Component implements OnInit {
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

  getTotalViviendasEmpadronadas(): string {
    if (!this.datos?.tiposViviendaAISI || !Array.isArray(this.datos.tiposViviendaAISI)) {
      return '____';
    }
    const total = this.datos.tiposViviendaAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    return total?.casos?.toString() || '____';
  }

  getViviendasOcupadasPresentes(): string {
    if (!this.datos?.condicionOcupacionAISI || !Array.isArray(this.datos.condicionOcupacionAISI)) {
      return '____';
    }
    const item = this.datos.condicionOcupacionAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && item.categoria.toLowerCase().includes('presentes')
    );
    return item?.casos?.toString() || '____';
  }

  getPorcentajeOcupadasPresentes(): string {
    if (!this.datos?.condicionOcupacionAISI || !Array.isArray(this.datos.condicionOcupacionAISI)) {
      return '____';
    }
    const item = this.datos.condicionOcupacionAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && item.categoria.toLowerCase().includes('presentes')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajePisosTierra(): string {
    if (!this.datos?.materialesViviendaAISI || !Array.isArray(this.datos.materialesViviendaAISI)) {
      return '____';
    }
    const item = this.datos.materialesViviendaAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('pisos') && 
      item.tipoMaterial && item.tipoMaterial.toLowerCase().includes('tierra')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajePisosCemento(): string {
    if (!this.datos?.materialesViviendaAISI || !Array.isArray(this.datos.materialesViviendaAISI)) {
      return '____';
    }
    const item = this.datos.materialesViviendaAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('pisos') && 
      item.tipoMaterial && item.tipoMaterial.toLowerCase().includes('cemento')
    );
    return item?.porcentaje || '____';
  }

  getFotoEstructura(): any {
    const titulo = this.datos?.['fotografiaEstructuraAISITitulo'] || 'Estructura de las viviendas en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho');
    const fuente = this.datos?.['fotografiaEstructuraAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaEstructuraAISIImagen'] || '';
    
    return {
      numero: '3. 28',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }
}

