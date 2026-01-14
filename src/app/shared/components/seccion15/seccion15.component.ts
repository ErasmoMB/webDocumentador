import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
  selector: 'app-seccion15',
  templateUrl: './seccion15.component.html',
  styleUrls: ['./seccion15.component.css']
})
export class Seccion15Component implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: any = {};
  private datosAnteriores: any = {};
  watchedFields: string[] = ['grupoAISD', 'parrafoSeccion15_religion_completo', 'lenguasMaternasTabla', 'religionesTabla'];

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

  getPorcentajeCastellano(): string {
    if (!this.datos?.lenguasMaternasTabla || !Array.isArray(this.datos.lenguasMaternasTabla)) {
      return '____';
    }
    const castellano = this.datos.lenguasMaternasTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('castellano') || item.categoria.toLowerCase().includes('español'))
    );
    return castellano?.porcentaje || '____';
  }

  getPorcentajeQuechua(): string {
    if (!this.datos?.lenguasMaternasTabla || !Array.isArray(this.datos.lenguasMaternasTabla)) {
      return '____';
    }
    const quechua = this.datos.lenguasMaternasTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('quechua')
    );
    return quechua?.porcentaje || '____';
  }

  obtenerPrefijoGrupo(): string {
    if (this.seccionId === '3.1.4.A.1.11' || this.seccionId.startsWith('3.1.4.A.1.')) {
      return '_A1';
    } else if (this.seccionId === '3.1.4.A.2.11' || this.seccionId.startsWith('3.1.4.A.2.')) {
      return '_A2';
    } else if (this.seccionId === '3.1.4.B.1.11' || this.seccionId.startsWith('3.1.4.B.1.')) {
      return '_B1';
    } else if (this.seccionId === '3.1.4.B.2.11' || this.seccionId.startsWith('3.1.4.B.2.')) {
      return '_B2';
    }
    return '';
  }

  getFotografiasIglesiaVista(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const fotografias: any[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const imagenConPrefijo = prefijo ? this.datos[`fotografiaIglesia${i}Imagen${prefijo}`] : null;
      const imagenSinPrefijo = this.datos[`fotografiaIglesia${i}Imagen`];
      const imagen = imagenConPrefijo || imagenSinPrefijo;
      
      if (imagen && imagen.trim() !== '') {
        const tituloConPrefijo = prefijo ? this.datos[`fotografiaIglesia${i}Titulo${prefijo}`] : null;
        const tituloSinPrefijo = this.datos[`fotografiaIglesia${i}Titulo`];
        const titulo = tituloConPrefijo || tituloSinPrefijo || 'Iglesia Matriz del anexo ' + (this.datos.grupoAISD || 'Ayroca');
        
        const fuenteConPrefijo = prefijo ? this.datos[`fotografiaIglesia${i}Fuente${prefijo}`] : null;
        const fuenteSinPrefijo = this.datos[`fotografiaIglesia${i}Fuente`];
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

