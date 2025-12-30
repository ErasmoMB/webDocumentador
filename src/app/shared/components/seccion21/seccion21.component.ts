import { Component, OnInit, OnDestroy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion21',
  templateUrl: './seccion21.component.html',
  styleUrls: ['./seccion21.component.css']
})
export class Seccion21Component implements OnInit, OnDestroy {
  datos: any = {};
  fotografiasCahuachoCache: any[] = [];

  constructor(
    private formularioService: FormularioService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.actualizarDatos();
    this.actualizarFotografiasCache();
    setTimeout(() => {
      this.cdRef.detectChanges();
    }, 0);
  }

  ngOnDestroy() {
  }

  actualizarDatos() {
    this.datos = this.formularioService.obtenerDatos();
    this.actualizarFotografiasCache();
  }

  actualizarFotografiasCache() {
    this.fotografiasCahuachoCache = this.getFotografiasCahuacho();
  }

  getFotografiasCahuacho(): any[] {
    const fotografias = [];
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `fotografiaCahuacho${i}Titulo`;
      const fuenteKey = `fotografiaCahuacho${i}Fuente`;
      const imagenKey = `fotografiaCahuacho${i}Imagen`;
      
      let titulo = this.datos?.[tituloKey];
      let fuente = this.datos?.[fuenteKey];
      let imagen = this.datos?.[imagenKey];
      
      if (i === 1) {
        titulo = titulo || this.datos?.['fotografiaCahuachoTitulo'] || 'Vista panorámica del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho');
        fuente = fuente || this.datos?.['fotografiaCahuachoFuente'] || 'GEADES, 2024';
        imagen = imagen || this.datos?.['fotografiaCahuachoImagen'] || '';
      }
      
      if (imagen) {
        fotografias.push({
          numero: `3. ${24 + i}`,
          titulo: titulo || 'Vista panorámica del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
          fuente: fuente || 'GEADES, 2024',
          ruta: imagen
        });
      }
    }
    
    if (fotografias.length === 0) {
      const titulo = this.datos?.['fotografiaCahuachoTitulo'] || 'Vista panorámica del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho');
      const fuente = this.datos?.['fotografiaCahuachoFuente'] || 'GEADES, 2024';
      const imagen = this.datos?.['fotografiaCahuachoImagen'] || '';
      
      if (imagen) {
        fotografias.push({
          numero: '3. 25',
          titulo: titulo,
          fuente: fuente,
          ruta: imagen
        });
      }
    }
    
    return fotografias;
  }

  getFotoCahuacho(): any {
    const fotografias = this.getFotografiasCahuacho();
    if (fotografias.length > 0) {
      return fotografias[0];
    }
    return {
      numero: '3. 25',
      titulo: 'Vista panorámica del CP ' + (this.datos.centroPobladoAISI || 'Cahuacho'),
      fuente: 'GEADES, 2024',
      ruta: ''
    };
  }
}

