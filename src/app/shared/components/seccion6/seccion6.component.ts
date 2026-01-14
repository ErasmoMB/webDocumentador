import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
  selector: 'app-seccion6',
  templateUrl: './seccion6.component.html',
  styleUrls: ['./seccion6.component.css']
})
export class Seccion6Component implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: any = {};
  private datosAnteriores: any = {};
  watchedFields: string[] = ['grupoAISD', 'poblacionSexoAISD', 'poblacionEtarioAISD'];

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
    
    if (grupoAISDActual !== grupoAISDAnterior || grupoAISDActual !== grupoAISDEnDatos) {
      this.actualizarDatos();
      this.cdRef.markForCheck();
    }
  }

  actualizarDatos() {
    const datosNuevos = this.formularioService.obtenerDatos();
    this.datos = { ...datosNuevos };
    this.actualizarValoresConPrefijo();
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = (this.datos as any)[campo] || null;
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

  getPorcentajeHombres(): string {
    if (!this.datos?.poblacionSexoAISD || !Array.isArray(this.datos.poblacionSexoAISD)) {
      return '____';
    }
    const hombres = this.datos.poblacionSexoAISD.find((item: any) => 
      item.sexo && (item.sexo.toLowerCase().includes('hombre') || item.sexo.toLowerCase().includes('varon'))
    );
    return hombres?.porcentaje || '____';
  }

  getPorcentajeMujeres(): string {
    if (!this.datos?.poblacionSexoAISD || !Array.isArray(this.datos.poblacionSexoAISD)) {
      return '____';
    }
    const mujeres = this.datos.poblacionSexoAISD.find((item: any) => 
      item.sexo && (item.sexo.toLowerCase().includes('mujer') || item.sexo.toLowerCase().includes('femenin'))
    );
    return mujeres?.porcentaje || '____';
  }

  getPorcentajeGrupoEtario(categoria: string): string {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '____';
    }
    
    const grupo = this.datos.poblacionEtarioAISD.find((item: any) => {
      if (!item.categoria) return false;
      const itemCategoria = item.categoria.toLowerCase();
      const buscarCategoria = categoria.toLowerCase();
      
      if (buscarCategoria.includes('15 a 29')) {
        return itemCategoria.includes('15') && itemCategoria.includes('29');
      } else if (buscarCategoria.includes('0 a 14')) {
        return itemCategoria.includes('0') && (itemCategoria.includes('14') || itemCategoria.includes('menor'));
      } else if (buscarCategoria.includes('65')) {
        return itemCategoria.includes('65') || itemCategoria.includes('mayor');
      }
      
      return itemCategoria.includes(buscarCategoria);
    });
    
    return grupo?.porcentaje || '____';
  }

  getGrupoEtarioMayoritario(): string {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '15 a 29 años';
    }
    
    let mayorPorcentaje = 0;
    let grupoMayoritario = '15 a 29 años';
    
    this.datos.poblacionEtarioAISD.forEach((item: any) => {
      if (item.porcentaje) {
        const porcentajeNum = parseFloat(item.porcentaje.replace(',', '.').replace(' %', '').trim());
        if (!isNaN(porcentajeNum) && porcentajeNum > mayorPorcentaje) {
          mayorPorcentaje = porcentajeNum;
          grupoMayoritario = item.categoria || '15 a 29 años';
        }
      }
    });
    
    return grupoMayoritario;
  }

  getGrupoEtarioSegundo(): string {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '0 a 14 años';
    }
    
    const gruposOrdenados = [...this.datos.poblacionEtarioAISD]
      .filter((item: any) => item.porcentaje && item.categoria)
      .map((item: any) => ({
        categoria: item.categoria,
        porcentaje: parseFloat(item.porcentaje.replace(',', '.').replace(' %', '').trim())
      }))
      .filter((item: any) => !isNaN(item.porcentaje))
      .sort((a: any, b: any) => b.porcentaje - a.porcentaje);
    
    return gruposOrdenados.length > 1 ? gruposOrdenados[1].categoria : '0 a 14 años';
  }

  getGrupoEtarioMenoritario(): string {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '65 años a más';
    }
    
    let menorPorcentaje = Infinity;
    let grupoMenoritario = '65 años a más';
    
    this.datos.poblacionEtarioAISD.forEach((item: any) => {
      if (item.porcentaje) {
        const porcentajeNum = parseFloat(item.porcentaje.replace(',', '.').replace(' %', '').trim());
        if (!isNaN(porcentajeNum) && porcentajeNum < menorPorcentaje) {
          menorPorcentaje = porcentajeNum;
          grupoMenoritario = item.categoria || '65 años a más';
        }
      }
    });
    
    return grupoMenoritario;
  }

  getTotalPoblacionSexo(): string {
    if (!this.datos?.poblacionSexoAISD || !Array.isArray(this.datos.poblacionSexoAISD)) {
      return '0';
    }
    const total = this.datos.poblacionSexoAISD.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getTotalPoblacionEtario(): string {
    if (!this.datos?.poblacionEtarioAISD || !Array.isArray(this.datos.poblacionEtarioAISD)) {
      return '0';
    }
    const total = this.datos.poblacionEtarioAISD.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  obtenerPrefijoGrupo(): string {
    if (this.seccionId === '3.1.4.A.1.2' || this.seccionId.startsWith('3.1.4.A.1.')) return '_A1';
    if (this.seccionId === '3.1.4.A.2.2' || this.seccionId.startsWith('3.1.4.A.2.')) return '_A2';
    if (this.seccionId === '3.1.4.B.1.2' || this.seccionId.startsWith('3.1.4.B.1.')) return '_B1';
    if (this.seccionId === '3.1.4.B.2.2' || this.seccionId.startsWith('3.1.4.B.2.')) return '_B2';
    return '';
  }

  getFotografiasDemografiaVista(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const fotografias: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const imagenConPrefijo = prefijo ? this.datos[`fotografiaDemografia${i}Imagen${prefijo}`] : null;
      const imagenSinPrefijo = this.datos[`fotografiaDemografia${i}Imagen`];
      const imagen = imagenConPrefijo || imagenSinPrefijo;
      if (imagen && imagen.trim() !== '') {
        const tituloConPrefijo = prefijo ? this.datos[`fotografiaDemografia${i}Titulo${prefijo}`] : null;
        const tituloSinPrefijo = this.datos[`fotografiaDemografia${i}Titulo`];
        const titulo = tituloConPrefijo || tituloSinPrefijo || 'Demografía';
        const fuenteConPrefijo = prefijo ? this.datos[`fotografiaDemografia${i}Fuente${prefijo}`] : null;
        const fuenteSinPrefijo = this.datos[`fotografiaDemografia${i}Fuente`];
        const fuente = fuenteConPrefijo || fuenteSinPrefijo || 'GEADES, 2024';
        fotografias.push({ imagen, titulo, fuente });
      }
    }
    return fotografias;
  }
}

