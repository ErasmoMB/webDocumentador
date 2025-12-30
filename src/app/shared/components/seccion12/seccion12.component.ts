import { Component, OnInit } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';

@Component({
  selector: 'app-seccion12',
  templateUrl: './seccion12.component.html',
  styleUrls: ['./seccion12.component.css']
})
export class Seccion12Component implements OnInit {
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

  getFotoSalud(): any {
    const titulo = this.datos?.['fotografiaSaludTitulo'] || 'Infraestructura externa del Puesto de Salud ' + (this.datos.grupoAISD || 'Ayroca');
    const fuente = this.datos?.['fotografiaSaludFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaSaludImagen'] || '';
    
    return {
      numero: '3. 10',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoIEAyroca(): any {
    const titulo = this.datos?.['fotografiaIEAyrocaTitulo'] || 'Infraestructura de la IE ' + (this.datos.grupoAISD || 'Ayroca');
    const fuente = this.datos?.['fotografiaIEAyrocaFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaIEAyrocaImagen'] || '';
    
    return {
      numero: '3. 12',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoIE40270(): any {
    const titulo = this.datos?.['fotografiaIE40270Titulo'] || 'Infraestructura de la IE N°40270';
    const fuente = this.datos?.['fotografiaIE40270Fuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaIE40270Imagen'] || '';
    
    return {
      numero: '3. 13',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotografiasRecreacion(): any[] {
    const fotografias = [];
    
    const foto1 = {
      numero: '3. 16',
      titulo: this.datos?.['fotografiaRecreacion1Titulo'] || 'Parque recreacional público del anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      fuente: this.datos?.['fotografiaRecreacion1Fuente'] || 'GEADES, 2024',
      ruta: this.datos?.['fotografiaRecreacion1Imagen'] || ''
    };
    
    const foto2 = {
      numero: '3. 16',
      titulo: this.datos?.['fotografiaRecreacion2Titulo'] || 'Plaza de toros del anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      fuente: this.datos?.['fotografiaRecreacion2Fuente'] || 'GEADES, 2024',
      ruta: this.datos?.['fotografiaRecreacion2Imagen'] || ''
    };
    
    const foto3 = {
      numero: '3. 16',
      titulo: this.datos?.['fotografiaRecreacion3Titulo'] || 'Plaza central del anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      fuente: this.datos?.['fotografiaRecreacion3Fuente'] || 'GEADES, 2024',
      ruta: this.datos?.['fotografiaRecreacion3Imagen'] || ''
    };
    
    fotografias.push(foto1, foto2, foto3);
    return fotografias;
  }

  getFotografiasDeporte(): any[] {
    const fotografias = [];
    
    const foto1 = {
      numero: '3. 17',
      titulo: this.datos?.['fotografiaDeporte1Titulo'] || 'Losa deportiva del anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      fuente: this.datos?.['fotografiaDeporte1Fuente'] || 'GEADES, 2024',
      ruta: this.datos?.['fotografiaDeporte1Imagen'] || ''
    };
    
    const foto2 = {
      numero: '3. 17',
      titulo: this.datos?.['fotografiaDeporte2Titulo'] || 'Estadio del anexo ' + (this.datos.grupoAISD || 'Ayroca'),
      fuente: this.datos?.['fotografiaDeporte2Fuente'] || 'GEADES, 2024',
      ruta: this.datos?.['fotografiaDeporte2Imagen'] || ''
    };
    
    fotografias.push(foto1, foto2);
    return fotografias;
  }
}

