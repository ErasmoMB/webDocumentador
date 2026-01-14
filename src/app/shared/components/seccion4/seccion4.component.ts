import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion4',
  templateUrl: './seccion4.component.html',
  styleUrls: ['./seccion4.component.css']
})
export class Seccion4Component implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  datos: any = {};
  private datosAnteriores: any = {};
  private filasCache: any[] | null = null;
  private ultimoPrefijoCache: string | null = null;
  fotografiasSeccion4: FotoItem[] = [];
  fotografiasAISD: FotoItem[] = [];
  watchedFields: string[] = [
    'parrafoSeccion4_introduccion_aisd',
    'parrafoSeccion4_comunidad_completo',
    'parrafoSeccion4_caracterizacion_indicadores',
    'grupoAISD',
    'distritoSeleccionado',
    'provinciaSeleccionada',
    'departamentoSeleccionado',
    'aisdComponente1',
    'aisdComponente2',
    'coordenadasAISD',
    'altitudAISD',
    'tablaAISD1Localidad',
    'tablaAISD1Coordenadas',
    'tablaAISD1Altitud',
    'tablaAISD1Distrito',
    'tablaAISD1Provincia',
    'tablaAISD1Departamento',
    'cuadroTituloAISD1',
    'cuadroFuenteAISD1',
    'cuadroTituloAISD2',
    'cuadroFuenteAISD2'
  ];

  // Helper para identificar subsecciones AISD
  esSubseccionAISD(): boolean {
    return !!this.seccionId.match(/^3\.1\.4\.A\.\d+\.\d+$/);
  }

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
    this.loadSectionData();
    this.llenarTablaAutomaticamenteSiNecesario();
    this.calcularCoordenadasYAltitudReferenciales();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['seccionId']) {
      this.actualizarDatos();
      this.loadSectionData();
      this.llenarTablaAutomaticamenteSiNecesario();
      this.calcularCoordenadasYAltitudReferenciales();
    }
  }

  ngDoCheck() {
    const datosActuales = this.formularioService.obtenerDatos();
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `grupoAISD${prefijo}` : 'grupoAISD';
    const grupoAISDActual = datosActuales[campoConPrefijo] || datosActuales['grupoAISD'] || null;
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (valorActual !== valorAnterior) {
        hayCambios = true;
        this.datosAnteriores[campo] = valorActual;
      }
    }
    
    const hayCambioGrupoAISD = grupoAISDActual !== grupoAISDAnterior || grupoAISDActual !== grupoAISDEnDatos;
    
    if (hayCambioGrupoAISD || hayCambios) {
      this.actualizarDatos();
      this.cdRef.markForCheck();
    }

    const centrosPobladosJSON = datosActuales['centrosPobladosJSON'] || [];
    if (centrosPobladosJSON.length > 0 && prefijo && prefijo.startsWith('_A')) {
      this.llenarTablaAutomaticamenteSiNecesario();
    }
  }

  actualizarDatos() {
    this.filasCache = null;
    this.ultimoPrefijoCache = null;
    const datosNuevos = this.formularioService.obtenerDatos();
    this.datos = { ...datosNuevos };
    const prefijo = this.obtenerPrefijoGrupo();
    this.actualizarValoresConPrefijo();
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = (this.datos as any)[campo] || null;
    });
    this.filasCache = null;
    this.ultimoPrefijoCache = null;
    
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

  obtenerPrefijoGrupo(): string {
    const aisdMatch = this.seccionId.match(/^3\.1\.4\.([AB])(?:\.(\d+))?/);
    if (aisdMatch) {
      const letra = aisdMatch[1];
      const numero = aisdMatch[2] || '1';
      return `_${letra}${numero}`;
    }
    return '';
  }

  obtenerNombreComunidadActual(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    
    if (!prefijo || !prefijo.startsWith('_A')) {
      return this.datos.grupoAISD || '____';
    }
    
    // Extraer el número del prefijo (_A1 -> 1, _A2 -> 2, etc.)
    const match = prefijo.match(/_A(\d+)/);
    if (!match) {
      return this.datos.grupoAISD || '____';
    }
    
    const indiceComunidad = parseInt(match[1]) - 1;
    const comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
    
    if (indiceComunidad >= 0 && indiceComunidad < comunidadesCampesinas.length) {
      const comunidad = comunidadesCampesinas[indiceComunidad];
      return comunidad.nombre && comunidad.nombre.trim() !== '' ? comunidad.nombre : '____';
    }
    
    return this.datos.grupoAISD || '____';
  }

  obtenerValorConPrefijo(campo: string): any {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
    const valorConPrefijo = this.datos[campoConPrefijo];
    if (valorConPrefijo !== undefined && valorConPrefijo !== null) {
      return valorConPrefijo;
    }
    const valorPlano = this.datos[campo];
    if (valorPlano !== undefined && valorPlano !== null) {
      return valorPlano;
    }
    return null;
  }

  obtenerValorConPrefijoDesdeDatos(datos: any, campo: string): any {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
    return datos[campoConPrefijo] || datos[campo] || null;
  }

  actualizarValoresConPrefijo() {
    const prefijo = this.obtenerPrefijoGrupo();
    if (prefijo) {
      const grupoAISD = this.obtenerValorConPrefijo('grupoAISD');
      this.datos.grupoAISD = grupoAISD || null;
      this.datosAnteriores.grupoAISD = grupoAISD || null;
      
      const grupoAISI = this.obtenerValorConPrefijo('grupoAISI');
      this.datos.grupoAISI = grupoAISI || null;
      
      const centroPobladoAISI = this.obtenerValorConPrefijo('centroPobladoAISI');
      this.datos.centroPobladoAISI = centroPobladoAISI || null;
    } else {
      const grupoAISD = this.datos.grupoAISD || null;
      this.datosAnteriores.grupoAISD = grupoAISD;
    }
  }

  getFilasTablaAISD2(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const filas: any[] = [];
    const filasActivas = this.formularioService.obtenerFilasActivasTablaAISD2(prefijo);
    
    for (let i = 1; i <= 20; i++) {
      const punto = this.obtenerValorConPrefijo(`tablaAISD2Fila${i}Punto`);
      const codigo = this.obtenerValorConPrefijo(`tablaAISD2Fila${i}Codigo`);
      const poblacion = this.obtenerValorConPrefijo(`tablaAISD2Fila${i}Poblacion`);
      const viviendasEmp = this.obtenerValorConPrefijo(`tablaAISD2Fila${i}ViviendasEmpadronadas`);
      const viviendasOcp = this.obtenerValorConPrefijo(`tablaAISD2Fila${i}ViviendasOcupadas`);
      
      const codigoStr = codigo ? codigo.toString().trim() : '';
      const esFilaActiva = filasActivas.length === 0 || filasActivas.includes(codigoStr);
      
      const tieneValor = (val: any) => val && val !== '____' && val.toString().trim() !== '';
      const tieneAlgunDato = tieneValor(punto) || tieneValor(codigo) || tieneValor(poblacion) || 
                             tieneValor(viviendasEmp) || tieneValor(viviendasOcp);
      
      if (esFilaActiva && tieneAlgunDato) {
        filas.push({
          punto: punto || '____',
          codigo: codigo || '____',
          poblacion: poblacion || '____',
          viviendasEmpadronadas: viviendasEmp || '____',
          viviendasOcupadas: viviendasOcp || '____'
        });
      }
    }
    
    if (filas.length === 0) {
      filas.push({
        punto: '____',
        codigo: '____',
        poblacion: '____',
        viviendasEmpadronadas: '____',
        viviendasOcupadas: '____'
      });
    }
    return filas;
  }

  getTotalPoblacionAISD2(): number | '____' {
    const total = this.getFilasTablaAISD2()
      .map(f => Number(f.poblacion))
      .filter(v => !isNaN(v))
      .reduce((a, b) => a + b, 0);
    return isNaN(total) ? '____' : total;
  }

  getTotalViviendasEmpadronadasAISD2(): number | '____' {
    const total = this.getFilasTablaAISD2()
      .map(f => Number(f.viviendasEmpadronadas))
      .filter(v => !isNaN(v))
      .reduce((a, b) => a + b, 0);
    return isNaN(total) ? '____' : total;
  }

  getTotalViviendasOcupadasAISD2(): number | '____' {
    const total = this.getFilasTablaAISD2()
      .map(f => Number(f.viviendasOcupadas))
      .filter(v => !isNaN(v))
      .reduce((a, b) => a + b, 0);
    return isNaN(total) ? '____' : total;
  }

  llenarTablaAutomaticamenteSiNecesario(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    if (!prefijo || !prefijo.startsWith('_A')) {
      return;
    }

    const datosActuales = this.formularioService.obtenerDatos();
    const centrosPobladosJSON = datosActuales['centrosPobladosJSON'] || [];
    
    if (centrosPobladosJSON.length === 0) {
      return;
    }

    const codigosComunidad = this.obtenerCentrosPobladosDeComunidadCampesina();
    
    if (codigosComunidad.length === 0) {
      return;
    }

    const primerCampo = `tablaAISD2Fila1Punto${prefijo}`;
    const datosDelServicio = this.formularioService.obtenerDatos();
    if (datosDelServicio[primerCampo]) {
      return;
    }

    const codigosSet = new Set(codigosComunidad.map(c => c.toString().trim()));
    const centrosFiltrados = centrosPobladosJSON.filter((cp: any) => {
      const codigo = cp.CODIGO?.toString().trim() || '';
      return codigo && codigosSet.has(codigo);
    });
    
    if (centrosFiltrados.length > 0) {
      this.poblarTablaAutomaticamente(centrosFiltrados, prefijo);
    }
  }

  poblarTablaAutomaticamente(centrosPoblados: any[], prefijo: string): void {
    const codigosActivos: string[] = [];
    
    centrosPoblados.forEach((cp: any, index: number) => {
      const filaIndex = index + 1;
      if (filaIndex > 20) return; // Máximo 20 filas
      
      const codigoCPP = cp.CODIGO?.toString().trim() || '';
      const campoPunto = `tablaAISD2Fila${filaIndex}Punto${prefijo}`;
      const campoCodigo = `tablaAISD2Fila${filaIndex}Codigo${prefijo}`;
      const campoPoblacion = `tablaAISD2Fila${filaIndex}Poblacion${prefijo}`;
      
      this.datos[campoPunto] = cp.CCPP || '';
      this.datos[campoCodigo] = codigoCPP;
      this.datos[campoPoblacion] = cp.POBLACION?.toString() || '0';
      
      if (codigoCPP) {
        codigosActivos.push(codigoCPP);
      }
    });

    // Guardar en FormularioService
    this.formularioService.actualizarDatos(this.datos);
    this.formularioService.guardarFilasActivasTablaAISD2(codigosActivos, prefijo);
    
    // Limpiar caché para que se recalcule
    this.filasCache = null;
    this.ultimoPrefijoCache = null;
  }

  obtenerCentrosPobladosDeComunidadCampesina(): string[] {
    const prefijo = this.obtenerPrefijoGrupo();
    if (!prefijo) {
      return [];
    }
    
    const match = prefijo.match(/_A(\d+)/);
    if (!match) {
      return [];
    }
    
    const indiceComunidad = parseInt(match[1]) - 1;
    const comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
    
    if (indiceComunidad >= 0 && indiceComunidad < comunidadesCampesinas.length) {
      const comunidad = comunidadesCampesinas[indiceComunidad];
      if (comunidad?.centrosPobladosSeleccionados && Array.isArray(comunidad.centrosPobladosSeleccionados)) {
        return comunidad.centrosPobladosSeleccionados.filter((codigo: string) => codigo && codigo.trim() !== '');
      }
    }
    
    return [];
  }

  private calcularCoordenadasYAltitudReferenciales(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    if (!prefijo) {
      return;
    }

    const coordenadasExistentes = this.datos['coordenadasAISD'];
    const altitudExistente = this.datos['altitudAISD'];
    
    if ((coordenadasExistentes && coordenadasExistentes.trim() !== '' && coordenadasExistentes !== '____') ||
        (altitudExistente && altitudExistente.trim() !== '' && altitudExistente !== '____')) {
      return;
    }

    const centrosSeleccionados = this.obtenerCentrosPobladosDeComunidadCampesina();
    if (!centrosSeleccionados || centrosSeleccionados.length === 0) {
      return;
    }

    const jsonData = this.datos['centrosPobladosJSON'] || [];
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return;
    }

    const codigosSet = new Set(centrosSeleccionados.map(c => c.toString().trim()));
    const cpsConDatos = jsonData
      .filter((cp: any) =>
        cp.CODIGO && codigosSet.has(cp.CODIGO.toString().trim()) &&
        cp.POBLACION > 0 && cp.ESTE && cp.NORTE && cp.ALTITUD
      )
      .sort((a: any, b: any) => (b.POBLACION || 0) - (a.POBLACION || 0));

    if (cpsConDatos.length === 0) {
      return;
    }

    const cpPrincipal = cpsConDatos[0];
    const coordenadas = `18L E: ${cpPrincipal.ESTE} m N: ${cpPrincipal.NORTE} m`;
    const altitud = `${cpPrincipal.ALTITUD} msnm`;

    this.formularioService.actualizarDato('coordenadasAISD', coordenadas);
    this.formularioService.actualizarDato('altitudAISD', altitud);

    this.datos['coordenadasAISD'] = coordenadas;
    this.datos['altitudAISD'] = altitud;
  }

  onCellEdit(event: any, campo: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
    const nuevoValor = event.target.textContent?.trim() || '';
    
    this.formularioService.actualizarDato(campoConPrefijo, nuevoValor);
    this.datos[campoConPrefijo] = nuevoValor;
    
    this.actualizarDatos();
  }

  cargarFotografias(): void {
    if (this.seccionId.startsWith('3.1.4')) {
      const groupPrefix = this.obtenerPrefijoGrupo();
      
      this.fotografiasAISD = this.imageService.loadImages(
        this.seccionId,
        'fotografiaAISD',
        groupPrefix
      );
      
      this.fotografiasSeccion4 = [];
    } else {
      this.fotografiasSeccion4 = this.imageService.loadImages(
        this.seccionId,
        'fotografiaSeccion4'
      );
      
      this.fotografiasAISD = [];
    }
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  onFotografiasAISDChange(fotografias: FotoItem[]) {
    const groupPrefix = this.obtenerPrefijoGrupo();
    this.imageService.saveImages(
      this.seccionId,
      'fotografiaAISD',
      fotografias,
      groupPrefix
    );
    this.fotografiasAISD = fotografias;
  }

  onFotografiasSeccion4Change(fotografias: FotoItem[]) {
    this.imageService.saveImages(
      this.seccionId,
      'fotografiaSeccion4',
      fotografias
    );
    this.fotografiasSeccion4 = fotografias;
  }
}

