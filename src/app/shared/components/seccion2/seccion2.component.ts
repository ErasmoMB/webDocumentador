import { Component, OnInit, ChangeDetectorRef, DoCheck } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { ComunidadCampesina } from 'src/app/core/models/formulario.model';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion2',
  templateUrl: './seccion2.component.html',
  styleUrls: ['./seccion2.component.css']
})
export class Seccion2Component implements OnInit, DoCheck {
  datos: any = {};
  distritosDisponibles: string[] = [];
  distritosSeleccionados: { [key: string]: string } = {};
  seccionesAISI: number[] = [];
  distritosSeleccionadosAISI: string[] = [];
  comunidadesCampesinas: ComunidadCampesina[] = [];
  fotografiasSeccion2: FotoItem[] = [];
  private datosAnteriores: any = {};
  seccionId: string = '3.1.2';
  watchedFields: string[] = [
    'parrafoSeccion2_introduccion',
    'parrafoSeccion2_aisd_completo',
    'parrafoSeccion2_aisi_completo',
    'grupoAISD',
    'distritoSeleccionado',
    'provinciaSeleccionada',
    'departamentoSeleccionado',
    'aisdComponente1',
    'aisdComponente2',
    'grupoAISI',
    'distritosAISI',
    'seccionesAISI',
    'comunidadesCampesinas'
  ];

  constructor(
    private formularioService: FormularioService,
    private fieldMapping: FieldMappingService,
    private sectionDataLoader: SectionDataLoaderService,
    private imageService: ImageManagementService,
    private photoNumberingService: PhotoNumberingService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.actualizarDatos();
    this.detectarDistritos();
    this.cargarSeccionesAISI();
    this.loadSectionData();
  }

  ngDoCheck() {
    const datosActuales = this.formularioService.obtenerDatos();
    let hayCambios = false;
    let necesitaRecargar = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (valorActual !== valorAnterior) {
        hayCambios = true;
        this.datosAnteriores[campo] = valorActual;
        
        if (campo === 'distritoSeleccionado' || campo === 'provinciaSeleccionada' || campo === 'departamentoSeleccionado') {
          necesitaRecargar = true;
        }
      }
    }

    if (hayCambios) {
      this.actualizarDatos();
      if (necesitaRecargar) {
        this.loadSectionData();
      }
      this.cdRef.markForCheck();
    }
  }

  actualizarDatos() {
    this.datos = this.formularioService.obtenerDatos();
    this.distritosSeleccionados = this.datos['distritosAISI'] || {};
    this.distritosSeleccionadosAISI = this.datos['distritosSeleccionadosAISI'] || [];
    this.comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
    if (this.comunidadesCampesinas.length === 0 && this.datos['grupoAISD']) {
      this.comunidadesCampesinas = [{
        id: 'cc_legacy',
        nombre: this.datos['grupoAISD'],
        centrosPobladosSeleccionados: this.datos['centrosPobladosSeleccionadosAISD'] || []
      }];
    }
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = (this.datos as any)[campo] || null;
    });
    this.cargarFotografias();
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

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  obtenerDistritosSeleccionadosAISI(): string[] {
    return this.distritosSeleccionadosAISI || [];
  }

  obtenerTextoAISI(): string {
    const distritos = this.obtenerDistritosSeleccionadosAISI();
    
    if (distritos.length === 0) {
      return '____';
    }
    
    if (distritos.length === 1) {
      return distritos[0];
    }
    
    if (distritos.length === 2) {
      return `${distritos[0]} y ${distritos[1]}`;
    }
    
    const ultimo = distritos[distritos.length - 1];
    const anteriores = distritos.slice(0, -1).join(', ');
    return `${anteriores} y ${ultimo}`;
  }

  obtenerTextoAISIPlural(): string {
    const distritos = this.obtenerDistritosSeleccionadosAISI();
    return distritos.length > 1 ? 'distritos' : 'distrito';
  }

  obtenerTextoAISICentrosPoblados(): string {
    const distritos = this.obtenerDistritosSeleccionadosAISI();
    return distritos.length > 1 ? 'centros poblados' : 'centro poblado';
  }

  detectarDistritos() {
    const jsonData = this.formularioService.obtenerJSON();
    const distritosSet = new Set<string>();

    if (Array.isArray(jsonData)) {
      jsonData.forEach((cp: any) => {
        if (cp && cp.DIST) {
          distritosSet.add(cp.DIST);
        }
      });
    } else if (jsonData && typeof jsonData === 'object') {
      Object.keys(jsonData).forEach((key: string) => {
        const centrosPoblados: any = jsonData[key];
        if (Array.isArray(centrosPoblados)) {
          centrosPoblados.forEach((cp: any) => {
            if (cp && cp.DIST) {
              distritosSet.add(cp.DIST);
            }
          });
        } else if (centrosPoblados && typeof centrosPoblados === 'object' && centrosPoblados.DIST) {
          distritosSet.add(centrosPoblados.DIST);
        }
      });
    }

    this.distritosDisponibles = Array.from(distritosSet).sort();

    if (this.distritosDisponibles.length === 1 && !this.distritosSeleccionados['B1']) {
      this.distritosSeleccionados['B1'] = this.distritosDisponibles[0];
      this.guardarDistritosAISI();
    }

    if (this.distritosDisponibles.length > 1 && this.seccionesAISI.length === 0) {
      this.seccionesAISI = [1];
      this.guardarSeccionesAISI();
    }
  }

  cargarSeccionesAISI() {
    const secciones = this.datos['seccionesAISI'] || [];
    if (secciones.length === 0 && this.distritosDisponibles.length > 0) {
      this.seccionesAISI = [1];
    } else {
      this.seccionesAISI = secciones;
    }
  }

  seleccionarDistritoParaAISI(seccion: number, distrito: string) {
    const key = `B${seccion}`;
    this.distritosSeleccionados[key] = distrito;
    this.guardarDistritosAISI();
    
    const grupoAISIKey = seccion === 1 ? 'grupoAISI' : `grupoAISI_B${seccion}`;
    this.datos[grupoAISIKey] = distrito;
    this.formularioService.actualizarDato(grupoAISIKey, distrito);
    
    const centroPobladoKey = seccion === 1 ? 'centroPobladoAISI' : `centroPobladoAISI_B${seccion}`;
    this.datos[centroPobladoKey] = distrito;
    this.formularioService.actualizarDato(centroPobladoKey, distrito);
    
    this.actualizarDatos();
  }

  agregarSeccionAISI() {
    const nuevaSeccion = this.seccionesAISI.length > 0 
      ? Math.max(...this.seccionesAISI) + 1 
      : 1;
    this.seccionesAISI.push(nuevaSeccion);
    this.guardarSeccionesAISI();
  }

  eliminarSeccionAISI(seccion: number) {
    this.seccionesAISI = this.seccionesAISI.filter(s => s !== seccion);
    delete this.distritosSeleccionados[`B${seccion}`];
    this.guardarSeccionesAISI();
    this.guardarDistritosAISI();
    this.actualizarDatos();
  }

  guardarDistritosAISI() {
    this.datos['distritosAISI'] = this.distritosSeleccionados;
    this.formularioService.actualizarDato('distritosAISI', this.distritosSeleccionados);
  }

  guardarSeccionesAISI() {
    this.datos['seccionesAISI'] = this.seccionesAISI;
    this.formularioService.actualizarDato('seccionesAISI', this.seccionesAISI);
  }

  obtenerDistritoSeleccionado(seccion: number): string {
    return this.distritosSeleccionados[`B${seccion}`] || '';
  }

  tieneUnSoloDistrito(): boolean {
    return this.distritosDisponibles.length === 1;
  }

  tieneMultiplesDistritos(): boolean {
    return this.distritosDisponibles.length > 1;
  }

  obtenerSiguienteNumeroSeccion(): number {
    if (this.seccionesAISI.length === 0) {
      return 1;
    }
    return Math.max(...this.seccionesAISI) + 1;
  }

  obtenerComunidadesCampesinas(): ComunidadCampesina[] {
    return this.comunidadesCampesinas.filter(cc => cc.nombre && cc.nombre.trim() !== '');
  }

  obtenerTextoComunidades(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    if (comunidades.length === 0) {
      return '____';
    }
    if (comunidades.length === 1) {
      return comunidades[0].nombre;
    }
    if (comunidades.length === 2) {
      return `${comunidades[0].nombre} y ${comunidades[1].nombre}`;
    }
    const ultima = comunidades[comunidades.length - 1].nombre;
    const anteriores = comunidades.slice(0, -1).map(cc => cc.nombre).join(', ');
    return `${anteriores} y ${ultima}`;
  }

  obtenerTextoComunidadesPlural(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    return comunidades.length > 1 ? 'las comunidades campesinas (CC)' : 'la comunidad campesina (CC)';
  }

  obtenerTextoComunidadesSingular(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    return comunidades.length > 1 ? 'estas comunidades' : 'esta comunidad';
  }

  obtenerTextoComunidadesPosesion(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    return comunidades.length > 1 ? 'Estas comunidades poseen' : 'Esta comunidad posee';
  }

  obtenerTextoComunidadesImpactos(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    if (comunidades.length === 0) {
      return '____';
    }
    if (comunidades.length === 1) {
      return comunidades[0].nombre;
    }
    if (comunidades.length === 2) {
      return `${comunidades[0].nombre} y ${comunidades[1].nombre}`;
    }
    const ultima = comunidades[comunidades.length - 1].nombre;
    const anteriores = comunidades.slice(0, -1).map(cc => cc.nombre).join(', ');
    return `${anteriores} y ${ultima}`;
  }

  obtenerTextoComunidadesFinal(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    if (comunidades.length === 0) {
      return '____';
    }
    if (comunidades.length === 1) {
      return comunidades[0].nombre;
    }
    if (comunidades.length === 2) {
      return `${comunidades[0].nombre} y ${comunidades[1].nombre}`;
    }
    const ultima = comunidades[comunidades.length - 1].nombre;
    const anteriores = comunidades.slice(0, -1).map(cc => cc.nombre).join(', ');
    return `${anteriores} y ${ultima}`;
  }

  obtenerPrefijoCCImpactos(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    return comunidades.length > 1 ? 'las CC ' : 'la CC ';
  }

  obtenerPrefijoCCFinal(): string {
    const comunidades = this.obtenerComunidadesCampesinas();
    return comunidades.length > 1 ? 'las CC ' : 'la CC ';
  }

  tieneUnaComunidad(): boolean {
    return this.obtenerComunidadesCampesinas().length === 1;
  }

  tieneMultiplesComunidades(): boolean {
    return this.obtenerComunidadesCampesinas().length > 1;
  }

  guardarCentrosPobladosSeleccionados(indiceComunidad: number, codigosSeleccionados: string[]): void {
    if (indiceComunidad >= 0 && indiceComunidad < this.comunidadesCampesinas.length) {
      this.comunidadesCampesinas[indiceComunidad].centrosPobladosSeleccionados = codigosSeleccionados;
      this.datos['comunidadesCampesinas'] = this.comunidadesCampesinas;
      this.formularioService.actualizarDato('comunidadesCampesinas', this.comunidadesCampesinas);
    }
  }

  obtenerPrefijoGrupo(): string {
    return '';
  }

  cargarFotografias(): void {
    this.fotografiasSeccion2 = this.imageService.loadImages(
      this.seccionId,
      'fotografiaSeccion2'
    );
  }
}

