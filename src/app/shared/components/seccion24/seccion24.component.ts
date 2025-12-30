import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion24',
  templateUrl: './seccion24.component.html',
  styleUrls: ['./seccion24.component.css']
})
export class Seccion24Component implements OnInit {
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

  getPorcentajeAgricultura(): string {
    if (!this.datos?.actividadesEconomicasAISI || !Array.isArray(this.datos.actividadesEconomicasAISI)) {
      return '____';
    }
    const item = this.datos.actividadesEconomicasAISI.find((item: any) => 
      item.actividad && item.actividad.toLowerCase().includes('agricultura')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeAdministracion(): string {
    if (!this.datos?.actividadesEconomicasAISI || !Array.isArray(this.datos.actividadesEconomicasAISI)) {
      return '____';
    }
    const item = this.datos.actividadesEconomicasAISI.find((item: any) => 
      item.actividad && item.actividad.toLowerCase().includes('administración')
    );
    return item?.porcentaje || '____';
  }

  getFotoActividadesEconomicas(): any {
    const titulo = this.datos?.['fotografiaActividadesEconomicasTitulo'] || 'Actividades económicas en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho');
    const fuente = this.datos?.['fotografiaActividadesEconomicasFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaActividadesEconomicasImagen'] || '';
    
    return {
      numero: '3. 26',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoMercado(): any {
    const titulo = this.datos?.['fotografiaMercadoTitulo'] || 'Comercio en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho');
    const fuente = this.datos?.['fotografiaMercadoFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaMercadoImagen'] || '';
    
    return {
      numero: '3. 27',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }
}

