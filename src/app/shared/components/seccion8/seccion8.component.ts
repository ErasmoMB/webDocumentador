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
    
    for (let i = 1; i <= 2; i++) {
      const titulo = this.datos?.[`fotografiaGanaderia${i}Titulo`];
      const fuente = this.datos?.[`fotografiaGanaderia${i}Fuente`];
      const imagen = this.datos?.[`fotografiaGanaderia${i}Imagen`];
      
      if (titulo || fuente || imagen) {
        fotos.push({
          numero: `3. ${i === 1 ? '4' : '4'}`,
          titulo: titulo || (i === 1 ? 'Ganado vacuno en la CC ' + (this.datos.grupoAISD || 'Ayroca') : 'Ganado ovino y caprino en la CC ' + (this.datos.grupoAISD || 'Ayroca')),
          fuente: fuente || 'GEADES, 2024',
          ruta: imagen || ''
        });
      }
    }
    
    if (fotos.length === 0) {
      fotos.push({
        numero: '3. 4',
        titulo: 'Ganado vacuno en la CC ' + (this.datos.grupoAISD || 'Ayroca'),
        fuente: 'GEADES, 2024',
        ruta: ''
      });
      fotos.push({
        numero: '3. 4',
        titulo: 'Ganado ovino y caprino en la CC ' + (this.datos.grupoAISD || 'Ayroca'),
        fuente: 'GEADES, 2024',
        ruta: ''
      });
    }
    
    return fotos;
  }

  getFotografiasAgricultura(): any[] {
    const fotos: any[] = [];
    
    for (let i = 1; i <= 2; i++) {
      const titulo = this.datos?.[`fotografiaAgricultura${i}Titulo`];
      const fuente = this.datos?.[`fotografiaAgricultura${i}Fuente`];
      const imagen = this.datos?.[`fotografiaAgricultura${i}Imagen`];
      
      if (titulo || fuente || imagen) {
        fotos.push({
          numero: `3. ${i === 1 ? '5' : '5'}`,
          titulo: titulo || (i === 1 ? 'Parcela agrícola en el anexo ' + (this.datos.grupoAISD || 'Ayroca') : 'Sector agrícola en la CC ' + (this.datos.grupoAISD || 'Ayroca')),
          fuente: fuente || 'GEADES, 2024',
          ruta: imagen || ''
        });
      }
    }
    
    if (fotos.length === 0) {
      fotos.push({
        numero: '3. 5',
        titulo: 'Parcela agrícola en el anexo ' + (this.datos.grupoAISD || 'Ayroca'),
        fuente: 'GEADES, 2024',
        ruta: ''
      });
      fotos.push({
        numero: '3. 5',
        titulo: 'Sector agrícola en la CC ' + (this.datos.grupoAISD || 'Ayroca'),
        fuente: 'GEADES, 2024',
        ruta: ''
      });
    }
    
    return fotos;
  }

  getFotoComercio(): any {
    const titulo = this.datos?.['fotografiaComercioTitulo'] || 'Comercio ambulatorio en el anexo ' + (this.datos.grupoAISD || 'Ayroca');
    const fuente = this.datos?.['fotografiaComercioFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaComercioImagen'] || '';
    
    return {
      numero: '3. 6',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }
}

