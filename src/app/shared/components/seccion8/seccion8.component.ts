import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion8',
  templateUrl: './seccion8.component.html',
  styleUrls: ['./seccion8.component.css']
})
export class Seccion8Component implements OnInit {
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

  getPorcentajeOcupacion(categoria: string): string {
    if (!this.datos?.peaOcupacionesTabla || !Array.isArray(this.datos.peaOcupacionesTabla)) {
      return '____';
    }
    const item = this.datos.peaOcupacionesTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase())
    );
    return item?.porcentaje || '____';
  }

  getFotografiasGanaderia(): any[] {
    const fotos: any[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const titulo = this.datos?.[`fotografiaGanaderia${i}Titulo`];
      const fuente = this.datos?.[`fotografiaGanaderia${i}Fuente`];
      const imagen = this.datos?.[`fotografiaGanaderia${i}Imagen`];
      
      if (imagen) {
        fotos.push({
          numero: `3. ${4 + (fotos.length)}`,
          titulo: titulo || 'Ganado en la CC ' + (this.datos.grupoAISD || 'Ayroca'),
          fuente: fuente || 'GEADES, 2024',
          ruta: imagen
        });
      }
    }
    
    return fotos;
  }

  getFotografiasAgricultura(): any[] {
    const fotos: any[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const titulo = this.datos?.[`fotografiaAgricultura${i}Titulo`];
      const fuente = this.datos?.[`fotografiaAgricultura${i}Fuente`];
      const imagen = this.datos?.[`fotografiaAgricultura${i}Imagen`];
      
      if (imagen) {
        fotos.push({
          numero: `3. ${5 + (fotos.length)}`,
          titulo: titulo || 'Agricultura en la CC ' + (this.datos.grupoAISD || 'Ayroca'),
          fuente: fuente || 'GEADES, 2024',
          ruta: imagen
        });
      }
    }
    
    return fotos;
  }

  getFotoComercio(): any {
    const titulo = this.datos?.['fotografiaComercioTitulo'] || 'Comercio ambulatorio en el anexo ' + (this.datos.grupoAISD || 'Ayroca');
    const fuente = this.datos?.['fotografiaComercioFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaComercioImagen'] || '';
    
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

