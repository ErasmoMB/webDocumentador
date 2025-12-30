import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion23',
  templateUrl: './seccion23.component.html',
  styleUrls: ['./seccion23.component.css']
})
export class Seccion23Component implements OnInit {
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

  getPorcentajePET(): string {
    if (!this.datos?.petGruposEdadAISI || !Array.isArray(this.datos.petGruposEdadAISI)) {
      return '____';
    }
    const totalItem = this.datos.petGruposEdadAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    if (!totalItem) {
      return '____';
    }
    const totalPET = totalItem.casos;
    const totalPoblacion = this.datos?.poblacionSexoAISI?.find((item: any) => 
      item.sexo && item.sexo.toLowerCase().includes('total')
    )?.casos || 160;
    if (!totalPoblacion || totalPoblacion === 0) {
      return '____';
    }
    const porcentaje = ((totalPET / totalPoblacion) * 100).toFixed(2);
    return porcentaje + ' %';
  }

  getPorcentajeGrupoPET(categoria: string): string {
    if (!this.datos?.petGruposEdadAISI || !Array.isArray(this.datos.petGruposEdadAISI)) {
      return '____';
    }
    const item = this.datos.petGruposEdadAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase())
    );
    return item?.porcentaje || '____';
  }

  getPoblacionDistrital(): string {
    return this.datos?.poblacionDistritalAISI || '610';
  }

  getPETDistrital(): string {
    return this.datos?.petDistritalAISI || '461';
  }

  getPorcentajePEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) {
      return '____';
    }
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeNoPEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) {
      return '____';
    }
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('no pea')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeHombresPEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) {
      return '____';
    }
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no')
    );
    return item?.porcentajeHombres || '____';
  }

  getPorcentajeMujeresNoPEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) {
      return '____';
    }
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('no pea')
    );
    return item?.porcentajeMujeres || '____';
  }

  getIngresoPerCapita(): string {
    return this.datos?.ingresoPerCapitaAISI || '391,06';
  }

  getRankingIngreso(): string {
    return this.datos?.rankingIngresoAISI || '1191';
  }

  getPorcentajeDesempleo(): string {
    if (!this.datos?.peaOcupadaDesocupadaTabla || !Array.isArray(this.datos.peaOcupadaDesocupadaTabla)) {
      return '____';
    }
    const item = this.datos.peaOcupadaDesocupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('desocupada')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeHombresOcupados(): string {
    if (!this.datos?.peaOcupadaDesocupadaTabla || !Array.isArray(this.datos.peaOcupadaDesocupadaTabla)) {
      return '____';
    }
    const item = this.datos.peaOcupadaDesocupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada')
    );
    return item?.porcentajeHombres || '____';
  }

  getPorcentajeMujeresOcupadas(): string {
    if (!this.datos?.peaOcupadaDesocupadaTabla || !Array.isArray(this.datos.peaOcupadaDesocupadaTabla)) {
      return '____';
    }
    const item = this.datos.peaOcupadaDesocupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada')
    );
    return item?.porcentajeMujeres || '____';
  }
}

