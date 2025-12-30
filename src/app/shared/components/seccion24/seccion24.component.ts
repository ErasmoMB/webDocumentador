import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion24',
  templateUrl: './seccion24.component.html',
  styleUrls: ['./seccion24.component.css']
})
export class Seccion24Component implements OnInit {
  datos: any = {};
  fotografiasActividadesEconomicasCache: any[] = [];
  fotografiasMercadoCache: any[] = [];

  constructor(
    private formularioService: FormularioService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.actualizarDatos();
    setTimeout(() => {
      this.cdRef.detectChanges();
    }, 0);
  }

  actualizarDatos() {
    const datosAnteriores = JSON.stringify({
      actividades: this.datos?.['fotografiaActividadesEconomicasImagen'],
      mercado: this.datos?.['fotografiaMercadoImagen']
    });
    
    this.datos = this.formularioService.obtenerDatos();
    
    const datosActuales = JSON.stringify({
      actividades: this.datos?.['fotografiaActividadesEconomicasImagen'],
      mercado: this.datos?.['fotografiaMercadoImagen']
    });
    
    if (datosAnteriores !== datosActuales) {
      this.actualizarFotografiasCache();
      this.cdRef.detectChanges();
    } else {
      this.actualizarFotografiasCache();
    }
  }

  actualizarFotografiasCache() {
    this.fotografiasActividadesEconomicasCache = this.getFotografiasActividadesEconomicas();
    this.fotografiasMercadoCache = this.getFotografiasMercado();
    this.cdRef.markForCheck();
  }

  getFotografiasActividadesEconomicas(): any[] {
    const fotografias = [];
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `fotografiaActividadesEconomicas${i}Titulo`;
      const fuenteKey = `fotografiaActividadesEconomicas${i}Fuente`;
      const imagenKey = `fotografiaActividadesEconomicas${i}Imagen`;
      
      let titulo = this.datos?.[tituloKey];
      let fuente = this.datos?.[fuenteKey];
      let imagen = this.datos?.[imagenKey];
      
      if (i === 1) {
        titulo = titulo || this.datos?.['fotografiaActividadesEconomicasTitulo'] || 'Parcelas agrícolas en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho');
        fuente = fuente || this.datos?.['fotografiaActividadesEconomicasFuente'] || 'GEADES, 2024';
        imagen = imagen || this.datos?.['fotografiaActividadesEconomicasImagen'] || '';
      }
      
      if (imagen && typeof imagen === 'string' && imagen.trim() !== '' && (imagen.startsWith('data:image') || imagen.startsWith('blob:'))) {
        fotografias.push({
          numero: `3. ${25 + i}`,
          titulo: titulo || 'Parcelas agrícolas en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
          fuente: fuente || 'GEADES, 2024',
          ruta: imagen
        });
      }
    }
    
    return fotografias;
  }

  getFotografiasMercado(): any[] {
    const fotografias = [];
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `fotografiaMercado${i}Titulo`;
      const fuenteKey = `fotografiaMercado${i}Fuente`;
      const imagenKey = `fotografiaMercado${i}Imagen`;
      
      let titulo = this.datos?.[tituloKey];
      let fuente = this.datos?.[fuenteKey];
      let imagen = this.datos?.[imagenKey];
      
      if (i === 1) {
        titulo = titulo || this.datos?.['fotografiaMercadoTitulo'] || 'Bodega en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho');
        fuente = fuente || this.datos?.['fotografiaMercadoFuente'] || 'GEADES, 2024';
        imagen = imagen || this.datos?.['fotografiaMercadoImagen'] || '';
      }
      
      if (imagen && typeof imagen === 'string' && imagen.trim() !== '' && (imagen.startsWith('data:image') || imagen.startsWith('blob:'))) {
        fotografias.push({
          numero: `3. ${35 + i}`,
          titulo: titulo || 'Bodega en el CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
          fuente: fuente || 'GEADES, 2024',
          ruta: imagen
        });
      }
    }
    
    return fotografias;
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

