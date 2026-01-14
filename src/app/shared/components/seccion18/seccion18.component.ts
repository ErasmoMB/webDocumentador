import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
  selector: 'app-seccion18',
  templateUrl: './seccion18.component.html',
  styleUrls: ['./seccion18.component.css']
})
export class Seccion18Component implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: any = {};
  private datosAnteriores: any = {};
  watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'nbiCCAyrocaTabla', 'nbiDistritoCahuachoTabla'];

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

  getTotalPersonasCC(): string {
    if (!this.datos?.nbiCCAyrocaTabla || !Array.isArray(this.datos.nbiCCAyrocaTabla)) {
      return '____';
    }
    const totalItem = this.datos.nbiCCAyrocaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total referencial')
    );
    return totalItem?.casos || '____';
  }

  getPorcentajeHacinamientoCC(): string {
    if (!this.datos?.nbiCCAyrocaTabla || !Array.isArray(this.datos.nbiCCAyrocaTabla)) {
      return '____';
    }
    const item = this.datos.nbiCCAyrocaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('hacinamiento')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeSinServiciosCC(): string {
    if (!this.datos?.nbiCCAyrocaTabla || !Array.isArray(this.datos.nbiCCAyrocaTabla)) {
      return '____';
    }
    const item = this.datos.nbiCCAyrocaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('sin servicios higiénicos')
    );
    return item?.porcentaje || '____';
  }

  getTotalUnidadesDistrito(): string {
    if (!this.datos?.nbiDistritoCahuachoTabla || !Array.isArray(this.datos.nbiDistritoCahuachoTabla)) {
      return '____';
    }
    const totalItem = this.datos.nbiDistritoCahuachoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total referencial')
    );
    return totalItem?.casos || '____';
  }

  getPorcentajeSinServiciosDistrito(): string {
    if (!this.datos?.nbiDistritoCahuachoTabla || !Array.isArray(this.datos.nbiDistritoCahuachoTabla)) {
      return '____';
    }
    const item = this.datos.nbiDistritoCahuachoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('sin servicios higiénicos')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeHacinamientoDistrito(): string {
    if (!this.datos?.nbiDistritoCahuachoTabla || !Array.isArray(this.datos.nbiDistritoCahuachoTabla)) {
      return '____';
    }
    const item = this.datos.nbiDistritoCahuachoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('hacinamiento')
    );
    return item?.porcentaje || '____';
  }

  getFotografiasNBIVista(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const fotografias: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const imagenConPrefijo = prefijo ? this.datos[`fotografiaNBI${i}Imagen${prefijo}`] : null;
      const imagenSinPrefijo = this.datos[`fotografiaNBI${i}Imagen`];
      const imagen = imagenConPrefijo || imagenSinPrefijo;
      if (imagen && imagen.trim() !== '') {
        const tituloConPrefijo = prefijo ? this.datos[`fotografiaNBI${i}Titulo${prefijo}`] : null;
        const tituloSinPrefijo = this.datos[`fotografiaNBI${i}Titulo`];
        const titulo = tituloConPrefijo || tituloSinPrefijo || 'Necesidades Básicas Insatisfechas';
        const fuenteConPrefijo = prefijo ? this.datos[`fotografiaNBI${i}Fuente${prefijo}`] : null;
        const fuenteSinPrefijo = this.datos[`fotografiaNBI${i}Fuente`];
        const fuente = fuenteConPrefijo || fuenteSinPrefijo || 'GEADES, 2024';
        fotografias.push({ imagen, titulo, fuente });
      }
    }
    return fotografias;
  }

  private obtenerPrefijoGrupo(): string {
    if (this.seccionId === '3.1.4.A.1.14' || this.seccionId.startsWith('3.1.4.A.1.')) return '_A1';
    if (this.seccionId === '3.1.4.A.2.14' || this.seccionId.startsWith('3.1.4.A.2.')) return '_A2';
    if (this.seccionId === '3.1.4.B.1.14' || this.seccionId.startsWith('3.1.4.B.1.')) return '_B1';
    if (this.seccionId === '3.1.4.B.2.14' || this.seccionId.startsWith('3.1.4.B.2.')) return '_B2';
    return '';
  }
}

