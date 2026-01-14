import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
  selector: 'app-seccion14',
  templateUrl: './seccion14.component.html',
  styleUrls: ['./seccion14.component.css']
})
export class Seccion14Component implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: any = {};
  private datosAnteriores: any = {};
  watchedFields: string[] = ['grupoAISD', 'parrafoSeccion14_indicadores_educacion_intro', 'nivelEducativoTabla', 'tasaAnalfabetismoTabla'];

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

  getPorcentajePrimaria(): string {
    if (!this.datos?.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return '____';
    }
    const primaria = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('primaria')
    );
    return primaria?.porcentaje || '____';
  }

  getPorcentajeSecundaria(): string {
    if (!this.datos?.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return '____';
    }
    const secundaria = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('secundaria')
    );
    return secundaria?.porcentaje || '____';
  }

  getPorcentajeSuperiorNoUniversitaria(): string {
    if (!this.datos?.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return '____';
    }
    const superiorNoUniv = this.datos.nivelEducativoTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('superior no universitaria') || item.categoria.toLowerCase().includes('superior no universitaria'))
    );
    return superiorNoUniv?.porcentaje || '____';
  }

  getTasaAnalfabetismo(): string {
    if (!this.datos?.tasaAnalfabetismoTabla || !Array.isArray(this.datos.tasaAnalfabetismoTabla)) {
      return '____';
    }
    const noSabeLeer = this.datos.tasaAnalfabetismoTabla.find((item: any) => 
      item.indicador && (item.indicador.toLowerCase().includes('no sabe') || item.indicador.toLowerCase().includes('no puede'))
    );
    return noSabeLeer?.porcentaje || '____';
  }

  getCasosAnalfabetismo(): string {
    if (!this.datos?.tasaAnalfabetismoTabla || !Array.isArray(this.datos.tasaAnalfabetismoTabla)) {
      return '____';
    }
    const noSabeLeer = this.datos.tasaAnalfabetismoTabla.find((item: any) => 
      item.indicador && (item.indicador.toLowerCase().includes('no sabe') || item.indicador.toLowerCase().includes('no puede'))
    );
    return noSabeLeer?.casos || '____';
  }

  getFotografiasEducacionIndicadoresVista(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const fotografias: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const imagenConPrefijo = prefijo ? this.datos[`fotografiaEducacionIndicadores${i}Imagen${prefijo}`] : null;
      const imagenSinPrefijo = this.datos[`fotografiaEducacionIndicadores${i}Imagen`];
      const imagen = imagenConPrefijo || imagenSinPrefijo;
      if (imagen && imagen.trim() !== '') {
        const tituloConPrefijo = prefijo ? this.datos[`fotografiaEducacionIndicadores${i}Titulo${prefijo}`] : null;
        const tituloSinPrefijo = this.datos[`fotografiaEducacionIndicadores${i}Titulo`];
        const titulo = tituloConPrefijo || tituloSinPrefijo || 'Indicadores de educación';
        const fuenteConPrefijo = prefijo ? this.datos[`fotografiaEducacionIndicadores${i}Fuente${prefijo}`] : null;
        const fuenteSinPrefijo = this.datos[`fotografiaEducacionIndicadores${i}Fuente`];
        const fuente = fuenteConPrefijo || fuenteSinPrefijo || 'GEADES, 2024';
        fotografias.push({ imagen, titulo, fuente });
      }
    }
    return fotografias;
  }

  private obtenerPrefijoGrupo(): string {
    // Mantiene consistencia con otras secciones AISD: asigna sufijo por grupo
    if (this.seccionId === '3.1.4.A.1.10' || this.seccionId.startsWith('3.1.4.A.1.')) return '_A1';
    if (this.seccionId === '3.1.4.A.2.10' || this.seccionId.startsWith('3.1.4.A.2.')) return '_A2';
    if (this.seccionId === '3.1.4.B.1.10' || this.seccionId.startsWith('3.1.4.B.1.')) return '_B1';
    if (this.seccionId === '3.1.4.B.2.10' || this.seccionId.startsWith('3.1.4.B.2.')) return '_B2';
    return '';
  }
}

