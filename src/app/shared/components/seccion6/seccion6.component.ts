import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion6',
  templateUrl: './seccion6.component.html',
  styleUrls: ['./seccion6.component.css']
})
export class Seccion6Component implements OnInit {
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

  getPorcentajeHombres(): string {
    if (!this.datos?.poblacionSexoAISD || !Array.isArray(this.datos.poblacionSexoAISD)) {
      return '____';
    }
    const hombres = this.datos.poblacionSexoAISD.find((item: any) => 
      item.sexo && (item.sexo.toLowerCase().includes('hombre') || item.sexo.toLowerCase().includes('varon'))
    );
    return hombres?.porcentaje || '____';
  }

  getPorcentajeMujeres(): string {
    if (!this.datos?.poblacionSexoAISD || !Array.isArray(this.datos.poblacionSexoAISD)) {
      return '____';
    }
    const mujeres = this.datos.poblacionSexoAISD.find((item: any) => 
      item.sexo && (item.sexo.toLowerCase().includes('mujer') || item.sexo.toLowerCase().includes('femenin'))
    );
    return mujeres?.porcentaje || '____';
  }

  getPorcentajeGrupoEtario(categoria: string): string {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '____';
    }
    
    const grupo = this.datos.poblacionEtarioAISD.find((item: any) => {
      if (!item.categoria) return false;
      const itemCategoria = item.categoria.toLowerCase();
      const buscarCategoria = categoria.toLowerCase();
      
      if (buscarCategoria.includes('15 a 29')) {
        return itemCategoria.includes('15') && itemCategoria.includes('29');
      } else if (buscarCategoria.includes('0 a 14')) {
        return itemCategoria.includes('0') && (itemCategoria.includes('14') || itemCategoria.includes('menor'));
      } else if (buscarCategoria.includes('65')) {
        return itemCategoria.includes('65') || itemCategoria.includes('mayor');
      }
      
      return itemCategoria.includes(buscarCategoria);
    });
    
    return grupo?.porcentaje || '____';
  }

  getGrupoEtarioMayoritario(): string {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '15 a 29 años';
    }
    
    let mayorPorcentaje = 0;
    let grupoMayoritario = '15 a 29 años';
    
    this.datos.poblacionEtarioAISD.forEach((item: any) => {
      if (item.porcentaje) {
        const porcentajeNum = parseFloat(item.porcentaje.replace(',', '.').replace(' %', '').trim());
        if (!isNaN(porcentajeNum) && porcentajeNum > mayorPorcentaje) {
          mayorPorcentaje = porcentajeNum;
          grupoMayoritario = item.categoria || '15 a 29 años';
        }
      }
    });
    
    return grupoMayoritario;
  }

  getGrupoEtarioSegundo(): string {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '0 a 14 años';
    }
    
    const gruposOrdenados = [...this.datos.poblacionEtarioAISD]
      .filter((item: any) => item.porcentaje && item.categoria)
      .map((item: any) => ({
        categoria: item.categoria,
        porcentaje: parseFloat(item.porcentaje.replace(',', '.').replace(' %', '').trim())
      }))
      .filter((item: any) => !isNaN(item.porcentaje))
      .sort((a: any, b: any) => b.porcentaje - a.porcentaje);
    
    return gruposOrdenados.length > 1 ? gruposOrdenados[1].categoria : '0 a 14 años';
  }

  getGrupoEtarioMenoritario(): string {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '65 años a más';
    }
    
    let menorPorcentaje = Infinity;
    let grupoMenoritario = '65 años a más';
    
    this.datos.poblacionEtarioAISD.forEach((item: any) => {
      if (item.porcentaje) {
        const porcentajeNum = parseFloat(item.porcentaje.replace(',', '.').replace(' %', '').trim());
        if (!isNaN(porcentajeNum) && porcentajeNum < menorPorcentaje) {
          menorPorcentaje = porcentajeNum;
          grupoMenoritario = item.categoria || '65 años a más';
        }
      }
    });
    
    return grupoMenoritario;
  }
}

