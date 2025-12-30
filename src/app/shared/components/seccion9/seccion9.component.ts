import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion9',
  templateUrl: './seccion9.component.html',
  styleUrls: ['./seccion9.component.css']
})
export class Seccion9Component implements OnInit {
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
    if (!this.datos?.condicionOcupacionTabla || !Array.isArray(this.datos.condicionOcupacionTabla)) {
      return '____';
    }
    const total = this.datos.condicionOcupacionTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    return total?.casos || '____';
  }

  getViviendasOcupadas(): string {
    if (!this.datos?.condicionOcupacionTabla || !Array.isArray(this.datos.condicionOcupacionTabla)) {
      return '____';
    }
    const ocupadas = this.datos.condicionOcupacionTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('ocupada') || item.categoria.toLowerCase().includes('ocupadas'))
    );
    return ocupadas?.casos || '____';
  }

  getPorcentajeViviendasOcupadas(): string {
    if (!this.datos?.condicionOcupacionTabla || !Array.isArray(this.datos.condicionOcupacionTabla)) {
      return '____';
    }
    const ocupadas = this.datos.condicionOcupacionTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('ocupada') || item.categoria.toLowerCase().includes('ocupadas'))
    );
    return ocupadas?.porcentaje || '____';
  }

  getPorcentajeMaterial(categoria: string, tipoMaterial: string): string {
    if (!this.datos?.tiposMaterialesTabla || !Array.isArray(this.datos.tiposMaterialesTabla)) {
      return '____';
    }
    const item = this.datos.tiposMaterialesTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase()) &&
      item.tipoMaterial && item.tipoMaterial.toLowerCase().includes(tipoMaterial.toLowerCase())
    );
    return item?.porcentaje || '____';
  }

  getFotoEstructura(): any {
    const titulo = this.datos?.['fotografiaEstructuraTitulo'] || 'Estructura de las viviendas en el anexo ' + (this.datos.grupoAISD || 'Ayroca');
    const fuente = this.datos?.['fotografiaEstructuraFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaEstructuraImagen'] || '';
    
    if (!imagen) {
      return {
        numero: '3. 6',
        titulo: '',
        fuente: '',
        ruta: ''
      };
    }
    
    return {
      numero: '3. 6',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }
}

