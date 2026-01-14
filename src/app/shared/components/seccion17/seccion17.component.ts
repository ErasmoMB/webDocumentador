import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
  selector: 'app-seccion17',
  templateUrl: './seccion17.component.html',
  styleUrls: ['./seccion17.component.css']
})
export class Seccion17Component implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: any = {};
  private datosAnteriores: any = {};
  watchedFields: string[] = ['distritoSeleccionado', 'indiceDesarrolloHumanoTabla'];

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
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
      }
    }
    
    if (hayCambios) {
      this.actualizarDatos();
      this.cdRef.markForCheck();
    }
  }

  actualizarDatos() {
    const datosNuevos = this.formularioService.obtenerDatos();
    this.datos = { ...datosNuevos };
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = JSON.parse(JSON.stringify((this.datos as any)[campo] || null));
    });
    this.cdRef.detectChanges();
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

  getIDH(): string {
    if (!this.datos?.indiceDesarrolloHumanoTabla || !Array.isArray(this.datos.indiceDesarrolloHumanoTabla) || this.datos.indiceDesarrolloHumanoTabla.length === 0) {
      return '____';
    }
    const item = this.datos.indiceDesarrolloHumanoTabla[0];
    return item?.idh || '____';
  }

  getRankIDH(): string {
    if (!this.datos?.indiceDesarrolloHumanoTabla || !Array.isArray(this.datos.indiceDesarrolloHumanoTabla) || this.datos.indiceDesarrolloHumanoTabla.length === 0) {
      return '____';
    }
    const item = this.datos.indiceDesarrolloHumanoTabla[0];
    return item?.rankIdh || item?.rankEsperanza || '____';
  }

  getFotografiasIDHVista(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const fotografias: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const imagenConPrefijo = prefijo ? this.datos[`fotografiaIDH${i}Imagen${prefijo}`] : null;
      const imagenSinPrefijo = this.datos[`fotografiaIDH${i}Imagen`];
      const imagen = imagenConPrefijo || imagenSinPrefijo;
      if (imagen && imagen.trim() !== '') {
        const tituloConPrefijo = prefijo ? this.datos[`fotografiaIDH${i}Titulo${prefijo}`] : null;
        const tituloSinPrefijo = this.datos[`fotografiaIDH${i}Titulo`];
        const titulo = tituloConPrefijo || tituloSinPrefijo || 'Índice de Desarrollo Humano';
        const fuenteConPrefijo = prefijo ? this.datos[`fotografiaIDH${i}Fuente${prefijo}`] : null;
        const fuenteSinPrefijo = this.datos[`fotografiaIDH${i}Fuente`];
        const fuente = fuenteConPrefijo || fuenteSinPrefijo || 'GEADES, 2024';
        fotografias.push({ imagen, titulo, fuente });
      }
    }
    return fotografias;
  }

  private obtenerPrefijoGrupo(): string {
    if (this.seccionId === '3.1.4.A.1.13' || this.seccionId.startsWith('3.1.4.A.1.')) return '_A1';
    if (this.seccionId === '3.1.4.A.2.13' || this.seccionId.startsWith('3.1.4.A.2.')) return '_A2';
    if (this.seccionId === '3.1.4.B.1.13' || this.seccionId.startsWith('3.1.4.B.1.')) return '_B1';
    if (this.seccionId === '3.1.4.B.2.13' || this.seccionId.startsWith('3.1.4.B.2.')) return '_B2';
    return '';
  }
}

