import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
  selector: 'app-seccion16',
  templateUrl: './seccion16.component.html',
  styleUrls: ['./seccion16.component.css']
})
export class Seccion16Component implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: any = {};
  private datosAnteriores: any = {};
  watchedFields: string[] = ['grupoAISD', 'parrafoSeccion16_agua_completo', 'parrafoSeccion16_recursos_naturales_completo', 'ojosAgua1', 'ojosAgua2', 'rioAgricola', 'quebradaAgricola'];

  constructor(
    private formularioService: FormularioService,
    private fieldMapping: FieldMappingService,
    private sectionDataLoader: SectionDataLoaderService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.actualizarDatos();
    this.loadSectionData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['seccionId']) {
      this.actualizarDatos();
      this.loadSectionData();
    }
  }

  ngDoCheck() {
    const datosActuales = this.formularioService.obtenerDatos();
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
      }
    }
    
    if (grupoAISDActual !== grupoAISDAnterior || grupoAISDActual !== grupoAISDEnDatos || hayCambios) {
      this.actualizarDatos();
      this.cdRef.markForCheck();
    }
  }

  actualizarDatos() {
    const datosNuevos = this.formularioService.obtenerDatos();
    this.datos = { ...datosNuevos };
    this.actualizarValoresConPrefijo();
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = JSON.parse(JSON.stringify((this.datos as any)[campo] || null));
    });
    this.cdRef.detectChanges();
  }

  actualizarValoresConPrefijo() {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
  }

  private loadSectionData(): void {
    const fieldsToLoad = this.fieldMapping.getFieldsForSection(this.seccionId);
    if (fieldsToLoad.length > 0) {
      this.sectionDataLoader.loadSectionData(this.seccionId, fieldsToLoad).subscribe();
    }
  }

  getDataSourceType(fieldName: string): 'manual' | 'automatic' | 'section' {
    return this.fieldMapping.getDataSourceType(fieldName);
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  obtenerPrefijoGrupo(): string {
    if (this.seccionId === '3.1.4.A.1.12' || this.seccionId.startsWith('3.1.4.A.1.')) {
      return '_A1';
    } else if (this.seccionId === '3.1.4.A.2.12' || this.seccionId.startsWith('3.1.4.A.2.')) {
      return '_A2';
    } else if (this.seccionId === '3.1.4.B.1.12' || this.seccionId.startsWith('3.1.4.B.1.')) {
      return '_B1';
    } else if (this.seccionId === '3.1.4.B.2.12' || this.seccionId.startsWith('3.1.4.B.2.')) {
      return '_B2';
    }
    return '';
  }

  getFotografiasReservorioVista(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const fotografias: any[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const imagenConPrefijo = prefijo ? this.datos[`fotografiaReservorio${i}Imagen${prefijo}`] : null;
      const imagenSinPrefijo = this.datos[`fotografiaReservorio${i}Imagen`];
      const imagen = imagenConPrefijo || imagenSinPrefijo;
      
      if (imagen && imagen.trim() !== '') {
        const tituloConPrefijo = prefijo ? this.datos[`fotografiaReservorio${i}Titulo${prefijo}`] : null;
        const tituloSinPrefijo = this.datos[`fotografiaReservorio${i}Titulo`];
        const titulo = tituloConPrefijo || tituloSinPrefijo || 'Reservorio del anexo ' + (this.datos.grupoAISD || 'Ayroca');
        
        const fuenteConPrefijo = prefijo ? this.datos[`fotografiaReservorio${i}Fuente${prefijo}`] : null;
        const fuenteSinPrefijo = this.datos[`fotografiaReservorio${i}Fuente`];
        const fuente = fuenteConPrefijo || fuenteSinPrefijo || 'GEADES, 2024';
        
        fotografias.push({
          imagen: imagen,
          titulo: titulo,
          fuente: fuente
        });
      }
    }
    
    return fotografias;
  }

  getFotografiasUsoSuelosVista(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const fotografias: any[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const imagenConPrefijo = prefijo ? this.datos[`fotografiaUsoSuelos${i}Imagen${prefijo}`] : null;
      const imagenSinPrefijo = this.datos[`fotografiaUsoSuelos${i}Imagen`];
      const imagen = imagenConPrefijo || imagenSinPrefijo;
      
      if (imagen && imagen.trim() !== '') {
        const tituloConPrefijo = prefijo ? this.datos[`fotografiaUsoSuelos${i}Titulo${prefijo}`] : null;
        const tituloSinPrefijo = this.datos[`fotografiaUsoSuelos${i}Titulo`];
        const titulo = tituloConPrefijo || tituloSinPrefijo || 'Uso de los suelos en el anexo ' + (this.datos.grupoAISD || 'Ayroca');
        
        const fuenteConPrefijo = prefijo ? this.datos[`fotografiaUsoSuelos${i}Fuente${prefijo}`] : null;
        const fuenteSinPrefijo = this.datos[`fotografiaUsoSuelos${i}Fuente`];
        const fuente = fuenteConPrefijo || fuenteSinPrefijo || 'GEADES, 2024';
        
        fotografias.push({
          imagen: imagen,
          titulo: titulo,
          fuente: fuente
        });
      }
    }
    
    return fotografias;
  }
}

