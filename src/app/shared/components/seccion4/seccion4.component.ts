import { Component, ChangeDetectorRef, Input, OnDestroy, SimpleChanges } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { StateService } from 'src/app/core/services/state.service';
import { CentrosPobladosActivosService } from 'src/app/core/services/centros-poblados-activos.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion4',
  templateUrl: './seccion4.component.html',
  styleUrls: ['./seccion4.component.css']
})
export class Seccion4Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private filasCache: any[] | null = null;
  private ultimoPrefijoCache: string | null = null;
  
  readonly PHOTO_PREFIX_UBICACION = 'fotografiaUbicacionReferencial';
  readonly PHOTO_PREFIX_POBLACION = 'fotografiaPoblacionViviendas';
  
  fotografiasUbicacionFormMulti: FotoItem[] = [];
  fotografiasPoblacionFormMulti: FotoItem[] = [];
  private stateSubscription?: Subscription;
  
  override readonly PHOTO_PREFIX = '';
  
  override watchedFields: string[] = [
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
    'tablaAISD1Datos',
    'tablaAISD2Datos',
    'cuadroTituloAISD1',
    'cuadroFuenteAISD1',
    'cuadroTituloAISD2',
    'cuadroFuenteAISD2'
  ];

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    private stateService: StateService,
    private centrosPobladosActivos: CentrosPobladosActivosService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override onInitCustom(): void {
    this.llenarTablaAutomaticamenteSiNecesario();
    setTimeout(() => {
      this.guardarTotalPoblacion();
    }, 500);
    this.calcularCoordenadasYAltitudReferenciales();
    
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
    
    if (this.modoFormulario) {
      this.actualizarFotografiasFormMulti();
    } else {
      this.cargarFotografias();
    }
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
      this.stateSubscription = undefined;
    }
  }

  protected override onChangesCustom(changes: SimpleChanges): void {
    if (changes['seccionId']) {
      this.llenarTablaAutomaticamenteSiNecesario();
      this.calcularCoordenadasYAltitudReferenciales();
      this.actualizarFotografiasFormMulti();
    }
    
    if (changes['modoFormulario'] && !this.modoFormulario) {
      setTimeout(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  protected override detectarCambios(): boolean {
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
      
      let haCambiado = false;
      if (Array.isArray(valorActual) || Array.isArray(valorAnterior)) {
        haCambiado = JSON.stringify(valorActual) !== JSON.stringify(valorAnterior);
      } else if (typeof valorActual === 'object' && valorActual !== null || typeof valorAnterior === 'object' && valorAnterior !== null) {
        haCambiado = JSON.stringify(valorActual) !== JSON.stringify(valorAnterior);
      } else {
        haCambiado = valorActual !== valorAnterior;
      }
      
      if (haCambiado) {
        hayCambios = true;
        if (Array.isArray(valorActual)) {
          this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
        } else if (typeof valorActual === 'object' && valorActual !== null) {
          this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
        } else {
          this.datosAnteriores[campo] = valorActual;
        }
      }
    }
    
    const hayCambioGrupoAISD = grupoAISDActual !== grupoAISDAnterior || grupoAISDActual !== grupoAISDEnDatos;
    
    if (hayCambioGrupoAISD || hayCambios) {
      const centrosPobladosJSON = datosActuales['centrosPobladosJSON'] || [];
      if (centrosPobladosJSON.length > 0 && prefijo && prefijo.startsWith('_A')) {
        this.llenarTablaAutomaticamenteSiNecesario();
      }
      return true;
    }
    
    return false;
  }

  protected override actualizarDatosCustom(): void {
    setTimeout(() => {
      this.guardarTotalPoblacion();
    }, 100);
    this.filasCache = null;
    this.ultimoPrefijoCache = null;
    this.cargarFotografias();
    
    if (this.datos.tablaAISD2Datos && Array.isArray(this.datos.tablaAISD2Datos)) {
      console.log('[Seccion4] actualizarDatosCustom - tablaAISD2Datos actualizada', {
        length: this.datos.tablaAISD2Datos.length,
        primerElemento: this.datos.tablaAISD2Datos[0]
      });
    }
    
    if (this.datos.tablaAISD1Datos && Array.isArray(this.datos.tablaAISD1Datos)) {
      this.datos.tablaAISD1Datos.forEach((fila: any, index: number) => {
        if (index === 0) {
          if (fila.localidad && !this.datos.tablaAISD1Localidad) {
            this.datos.tablaAISD1Localidad = fila.localidad;
          }
          if (fila.coordenadas && !this.datos.tablaAISD1Coordenadas) {
            this.datos.tablaAISD1Coordenadas = fila.coordenadas;
          }
          if (fila.altitud && !this.datos.tablaAISD1Altitud) {
            this.datos.tablaAISD1Altitud = fila.altitud;
          }
          if (fila.distrito && !this.datos.tablaAISD1Distrito) {
            this.datos.tablaAISD1Distrito = fila.distrito;
          }
          if (fila.provincia && !this.datos.tablaAISD1Provincia) {
            this.datos.tablaAISD1Provincia = fila.provincia;
          }
          if (fila.departamento && !this.datos.tablaAISD1Departamento) {
            this.datos.tablaAISD1Departamento = fila.departamento;
          }
        }
      });
    }
  }

  override obtenerPrefijoGrupo(): string {
    const aisdMatch = this.seccionId.match(/^3\.1\.4\.([AB])(?:\.(\d+))?/);
    if (aisdMatch) {
      const letra = aisdMatch[1];
      const numero = aisdMatch[2] || '1';
      return `_${letra}${numero}`;
    }
    return '';
  }

  override obtenerNombreComunidadActual(): string {
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

  override obtenerValorConPrefijo(campo: string): any {
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

  protected override actualizarValoresConPrefijo(): void {
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

  getFilasTablaAISD1(): any[] {
    if (this.datos.tablaAISD1Datos && Array.isArray(this.datos.tablaAISD1Datos) && this.datos.tablaAISD1Datos.length > 0) {
      return this.datos.tablaAISD1Datos.map((fila: any) => {
        const localidad = fila.localidad || fila.Localidad || '';
        const coordenadas = fila.coordenadas || fila.Coordenadas || '';
        const altitud = fila.altitud || fila.Altitud || '';
        const distrito = fila.distrito || fila.Distrito || '';
        const provincia = fila.provincia || fila.Provincia || '';
        const departamento = fila.departamento || fila.Departamento || '';
        
        return {
          localidad: localidad && localidad.toString().trim() !== '' ? localidad : (this.datos.tablaAISD1Localidad || this.obtenerNombreComunidadActual() || '____'),
          coordenadas: coordenadas && coordenadas.toString().trim() !== '' ? coordenadas : (this.datos.tablaAISD1Coordenadas || this.datos.coordenadasAISD || '____'),
          altitud: altitud && altitud.toString().trim() !== '' ? altitud : (this.datos.tablaAISD1Altitud || this.datos.altitudAISD || '____'),
          distrito: distrito && distrito.toString().trim() !== '' ? distrito : (this.datos.tablaAISD1Distrito || this.datos.distritoSeleccionado || '____'),
          provincia: provincia && provincia.toString().trim() !== '' ? provincia : (this.datos.tablaAISD1Provincia || this.datos.provinciaSeleccionada || '____'),
          departamento: departamento && departamento.toString().trim() !== '' ? departamento : (this.datos.tablaAISD1Departamento || this.datos.departamentoSeleccionado || '____')
        };
      });
    }
    
    return [{
      localidad: this.datos.tablaAISD1Localidad || this.obtenerNombreComunidadActual() || '____',
      coordenadas: this.datos.tablaAISD1Coordenadas || this.datos.coordenadasAISD || '____',
      altitud: this.datos.tablaAISD1Altitud || this.datos.altitudAISD || '____',
      distrito: this.datos.tablaAISD1Distrito || this.datos.distritoSeleccionado || '____',
      provincia: this.datos.tablaAISD1Provincia || this.datos.provinciaSeleccionada || '____',
      departamento: this.datos.tablaAISD1Departamento || this.datos.departamentoSeleccionado || '____'
    }];
  }

  getFilasTablaAISD2(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    
    if (this.filasCache && this.ultimoPrefijoCache === prefijo) {
      return this.filasCache;
    }
    
    if (this.datos.tablaAISD2Datos && Array.isArray(this.datos.tablaAISD2Datos) && this.datos.tablaAISD2Datos.length > 0) {
      const filasActivas = this.formularioService.obtenerFilasActivasTablaAISD2(prefijo);
      const filas = this.datos.tablaAISD2Datos
        .filter((fila: any) => {
          if (this.modoFormulario) return true;
          const codigoStr = (fila.codigo || fila.Codigo)?.toString().trim() || '';
          return filasActivas.length === 0 || filasActivas.includes(codigoStr);
        })
        .map((fila: any) => ({
          punto: fila.punto || fila.Punto || '____',
          codigo: fila.codigo || fila.Codigo || '____',
          poblacion: fila.poblacion || fila.Poblacion || '____',
          viviendasEmpadronadas: fila.viviendasEmpadronadas || fila.ViviendasEmpadronadas || '____',
          viviendasOcupadas: fila.viviendasOcupadas || fila.ViviendasOcupadas || '____'
        }));
      
      if (filas.length > 0) {
        this.filasCache = filas;
        this.ultimoPrefijoCache = prefijo;
        return filas;
      }
    }
    
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
      
      const tieneValor = (val: any) => val && val !== '____' && val !== null && val !== undefined && val.toString().trim() !== '';
      const tieneAlgunDato = tieneValor(punto) || tieneValor(codigo) || tieneValor(poblacion) || 
                             tieneValor(viviendasEmp) || tieneValor(viviendasOcp);
      
      if (this.modoFormulario) {
        if (tieneAlgunDato || i === 1) {
          filas.push({
            punto: punto || '',
            codigo: codigo || '',
            poblacion: poblacion || '',
            viviendasEmpadronadas: viviendasEmp || '',
            viviendasOcupadas: viviendasOcp || ''
          });
        }
      } else {
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
    }
    
    if (filas.length === 0 && !this.modoFormulario) {
      filas.push({
        punto: '____',
        codigo: '____',
        poblacion: '____',
        viviendasEmpadronadas: '____',
        viviendasOcupadas: '____'
      });
    }
    
    this.filasCache = filas;
    this.ultimoPrefijoCache = prefijo;
    return filas;
  }

  getTotalPoblacionAISD2(): number | '____' {
    const filas = this.getFilasTablaAISD2();
    const total = filas
      .map(f => {
        const valor = f.poblacion;
        if (!valor || valor === '____' || valor === '') return 0;
        return Number(valor);
      })
      .filter(v => !isNaN(v))
      .reduce((a, b) => a + b, 0);
    return total === 0 && !this.modoFormulario ? '____' : total;
  }

  getTotalViviendasEmpadronadasAISD2(): number | '____' {
    const filas = this.getFilasTablaAISD2();
    const total = filas
      .map(f => {
        const valor = f.viviendasEmpadronadas;
        if (!valor || valor === '____' || valor === '') return 0;
        return Number(valor);
      })
      .filter(v => !isNaN(v))
      .reduce((a, b) => a + b, 0);
    return total === 0 && !this.modoFormulario ? '____' : total;
  }

  getTotalViviendasOcupadasAISD2(): number | '____' {
    const filas = this.getFilasTablaAISD2();
    const total = filas
      .map(f => {
        const valor = f.viviendasOcupadas;
        if (!valor || valor === '____' || valor === '') return 0;
        return Number(valor);
      })
      .filter(v => !isNaN(v))
      .reduce((a, b) => a + b, 0);
    return total === 0 && !this.modoFormulario ? '____' : total;
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
      if (filaIndex > 20) return;
      
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

    this.formularioService.actualizarDatos(this.datos);
    this.formularioService.guardarFilasActivasTablaAISD2(codigosActivos, prefijo);
    
    const comunidadId = this.centrosPobladosActivos.obtenerComunidadIdDePrefijo(prefijo);
    this.centrosPobladosActivos.actualizarCodigosActivos(comunidadId, codigosActivos);
    
    this.filasCache = null;
    this.ultimoPrefijoCache = null;
    this.guardarTotalPoblacion();
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
    
    if (campo.includes('Poblacion')) {
      this.guardarTotalPoblacion();
    }
    
    this.actualizarDatos();
  }

  guardarTotalPoblacion(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const totalPoblacionRaw = this.getTotalPoblacionAISD2();
    const totalPoblacion = typeof totalPoblacionRaw === 'number' ? totalPoblacionRaw : (totalPoblacionRaw === '____' ? 0 : parseInt(totalPoblacionRaw as any) || 0);
    const poblacionKey = prefijo ? `tablaAISD2TotalPoblacion${prefijo}` : 'tablaAISD2TotalPoblacion';
    
    console.log('🔍 [Seccion4] guardarTotalPoblacion - Debug:', {
      prefijo,
      poblacionKey,
      totalPoblacionRaw,
      totalPoblacion,
      tipo: typeof totalPoblacion,
      esNumero: typeof totalPoblacion === 'number',
      esMayorACero: typeof totalPoblacion === 'number' && totalPoblacion > 0,
      filasTabla: this.getFilasTablaAISD2().length
    });
    
    if (typeof totalPoblacion === 'number' && totalPoblacion > 0) {
      this.formularioService.actualizarDato(poblacionKey as any, totalPoblacion);
      this.datos[poblacionKey] = totalPoblacion;
      console.log('✅ [Seccion4] guardarTotalPoblacion - Guardado:', poblacionKey, '=', totalPoblacion);
    } else {
      console.warn('⚠️ [Seccion4] guardarTotalPoblacion - No se guardó (totalPoblacion no válido):', totalPoblacion);
    }
  }

  onCellEditTablaAISD1(event: any, campo: string, indiceFila: number, campoFila: string): void {
    const nuevoValor = event.target.textContent?.trim() || '';
    
    if (!this.datos.tablaAISD1Datos || !Array.isArray(this.datos.tablaAISD1Datos) || this.datos.tablaAISD1Datos.length === 0) {
      const filaInicial: any = {
        localidad: this.datos.tablaAISD1Localidad || this.obtenerNombreComunidadActual() || '',
        coordenadas: this.datos.tablaAISD1Coordenadas || this.datos.coordenadasAISD || '',
        altitud: this.datos.tablaAISD1Altitud || this.datos.altitudAISD || '',
        distrito: this.datos.tablaAISD1Distrito || this.datos.distritoSeleccionado || '',
        provincia: this.datos.tablaAISD1Provincia || this.datos.provinciaSeleccionada || '',
        departamento: this.datos.tablaAISD1Departamento || this.datos.departamentoSeleccionado || ''
      };
      filaInicial[campoFila] = nuevoValor;
      this.datos.tablaAISD1Datos = [filaInicial];
    } else {
      if (indiceFila >= 0 && indiceFila < this.datos.tablaAISD1Datos.length) {
        if (!this.datos.tablaAISD1Datos[indiceFila]) {
          this.datos.tablaAISD1Datos[indiceFila] = {
            localidad: '',
            coordenadas: '',
            altitud: '',
            distrito: '',
            provincia: '',
            departamento: ''
          };
        }
        (this.datos.tablaAISD1Datos[indiceFila] as any)[campoFila] = nuevoValor;
      } else if (indiceFila >= this.datos.tablaAISD1Datos.length) {
        const nuevaFila: any = {
          localidad: '',
          coordenadas: '',
          altitud: '',
          distrito: '',
          provincia: '',
          departamento: ''
        };
        nuevaFila[campoFila] = nuevoValor;
        this.datos.tablaAISD1Datos.push(nuevaFila);
      }
    }
    
    this.formularioService.actualizarDato('tablaAISD1Datos', this.datos.tablaAISD1Datos);
    
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
    this.formularioService.actualizarDato(campoConPrefijo, nuevoValor);
    this.datos[campoConPrefijo] = nuevoValor;
    
    if (indiceFila === 0) {
      const campoLegacy = `tablaAISD1${campoFila.charAt(0).toUpperCase() + campoFila.slice(1)}`;
      const campoLegacyConPrefijo = prefijo ? `${campoLegacy}${prefijo}` : campoLegacy;
      this.formularioService.actualizarDato(campoLegacyConPrefijo, nuevoValor);
      this.datos[campoLegacyConPrefijo] = nuevoValor;
    }
    
    this.actualizarDatos();
  }

  onTablaFieldChange(campo: string, valor: string): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
    const valorLimpio = valor.trim() || '';
    
    this.formularioService.actualizarDato(campoConPrefijo, valorLimpio);
    this.datos[campoConPrefijo] = valorLimpio;
    
    this.filasCache = null;
    this.ultimoPrefijoCache = null;
    this.guardarTotalPoblacion();
    this.actualizarDatos();
  }

  agregarFilaTabla(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const filasActuales = this.getFilasTablaAISD2();
    const siguienteIndice = filasActuales.length + 1;
    
    if (siguienteIndice > 20) {
      return;
    }

    const campoPunto = prefijo ? `tablaAISD2Fila${siguienteIndice}Punto${prefijo}` : `tablaAISD2Fila${siguienteIndice}Punto`;
    const campoCodigo = prefijo ? `tablaAISD2Fila${siguienteIndice}Codigo${prefijo}` : `tablaAISD2Fila${siguienteIndice}Codigo`;
    const campoPoblacion = prefijo ? `tablaAISD2Fila${siguienteIndice}Poblacion${prefijo}` : `tablaAISD2Fila${siguienteIndice}Poblacion`;
    const campoViviendasEmp = prefijo ? `tablaAISD2Fila${siguienteIndice}ViviendasEmpadronadas${prefijo}` : `tablaAISD2Fila${siguienteIndice}ViviendasEmpadronadas`;
    const campoViviendasOcp = prefijo ? `tablaAISD2Fila${siguienteIndice}ViviendasOcupadas${prefijo}` : `tablaAISD2Fila${siguienteIndice}ViviendasOcupadas`;

    this.formularioService.actualizarDato(campoPunto, '');
    this.formularioService.actualizarDato(campoCodigo, '');
    this.formularioService.actualizarDato(campoPoblacion, '');
    this.formularioService.actualizarDato(campoViviendasEmp, '');
    this.formularioService.actualizarDato(campoViviendasOcp, '');

    this.datos[campoPunto] = '';
    this.datos[campoCodigo] = '';
    this.datos[campoPoblacion] = '';
    this.datos[campoViviendasEmp] = '';
    this.datos[campoViviendasOcp] = '';

    this.filasCache = null;
    this.ultimoPrefijoCache = null;
    this.guardarTotalPoblacion();
    this.actualizarDatos();
  }

  eliminarFilaTabla(index: number): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const filasActuales = this.getFilasTablaAISD2();
    
    if (filasActuales.length <= 1) {
      return;
    }

    const filaIndex = index + 1;
    const campoPunto = prefijo ? `tablaAISD2Fila${filaIndex}Punto${prefijo}` : `tablaAISD2Fila${filaIndex}Punto`;
    const campoCodigo = prefijo ? `tablaAISD2Fila${filaIndex}Codigo${prefijo}` : `tablaAISD2Fila${filaIndex}Codigo`;
    const campoPoblacion = prefijo ? `tablaAISD2Fila${filaIndex}Poblacion${prefijo}` : `tablaAISD2Fila${filaIndex}Poblacion`;
    const campoViviendasEmp = prefijo ? `tablaAISD2Fila${filaIndex}ViviendasEmpadronadas${prefijo}` : `tablaAISD2Fila${filaIndex}ViviendasEmpadronadas`;
    const campoViviendasOcp = prefijo ? `tablaAISD2Fila${filaIndex}ViviendasOcupadas${prefijo}` : `tablaAISD2Fila${filaIndex}ViviendasOcupadas`;

    const codigoEliminado = this.obtenerValorConPrefijo(`tablaAISD2Fila${filaIndex}Codigo`);
    const codigoStr = codigoEliminado ? codigoEliminado.toString().trim() : '';

    this.formularioService.actualizarDato(campoPunto, '');
    this.formularioService.actualizarDato(campoCodigo, '');
    this.formularioService.actualizarDato(campoPoblacion, '');
    this.formularioService.actualizarDato(campoViviendasEmp, '');
    this.formularioService.actualizarDato(campoViviendasOcp, '');

    this.datos[campoPunto] = '';
    this.datos[campoCodigo] = '';
    this.datos[campoPoblacion] = '';
    this.datos[campoViviendasEmp] = '';
    this.datos[campoViviendasOcp] = '';

    if (codigoStr && prefijo) {
      const filasActivas = this.formularioService.obtenerFilasActivasTablaAISD2(prefijo);
      const nuevasFilasActivas = filasActivas.filter(codigo => codigo !== codigoStr);
      this.formularioService.guardarFilasActivasTablaAISD2(nuevasFilasActivas, prefijo);
      
      const comunidadId = this.centrosPobladosActivos.obtenerComunidadIdDePrefijo(prefijo);
      this.centrosPobladosActivos.actualizarCodigosActivos(comunidadId, nuevasFilasActivas);
    }

    this.filasCache = null;
    this.ultimoPrefijoCache = null;
    this.guardarTotalPoblacion();
    this.actualizarDatos();
  }

  obtenerTotalCentrosPobladosActivos(): number {
    const prefijo = this.obtenerPrefijoGrupo();
    return this.centrosPobladosActivos.obtenerTotalCentrosPobladosActivos(prefijo);
  }

  cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotosUbicacion = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_UBICACION,
      groupPrefix
    );
    const fotosPoblacion = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_POBLACION,
      groupPrefix
    );
    this.fotografiasCache = [...fotosUbicacion, ...fotosPoblacion];
    this.cdRef.markForCheck();
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasUbicacionFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_UBICACION,
      groupPrefix
    );
    this.fotografiasPoblacionFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_POBLACION,
      groupPrefix
    );
  }

  getFotografiasUbicacionVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_UBICACION,
      groupPrefix
    );
  }

  getFotografiasPoblacionVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_POBLACION,
      groupPrefix
    );
  }

  onFotografiasUbicacionChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_UBICACION, fotografias);
    this.fotografiasUbicacionFormMulti = [...fotografias];
  }

  onFotografiasPoblacionChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_POBLACION, fotografias);
    this.fotografiasPoblacionFormMulti = [...fotografias];
  }

  obtenerTextoSeccion4IntroduccionAISD(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoParrafo = prefijo ? `parrafoSeccion4_introduccion_aisd${prefijo}` : 'parrafoSeccion4_introduccion_aisd';
    if (this.datos[campoParrafo] || this.datos['parrafoSeccion4_introduccion_aisd']) {
      return this.datos[campoParrafo] || this.datos['parrafoSeccion4_introduccion_aisd'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    return `Se ha determinado como Área de Influencia Social Directa (AISD) a la CC ${grupoAISD}. Esta delimitación se justifica en los criterios de propiedad de terreno superficial, además de la posible ocurrencia de impactos directos como la contratación de mano de obra local, adquisición de bienes y servicios, así como logística. En los siguientes apartados se desarrolla la caracterización socioeconómica y cultural de la comunidad delimitada como parte del AISD.`;
  }

  obtenerTextoSeccion4ComunidadCompleto(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoParrafo = prefijo ? `parrafoSeccion4_comunidad_completo${prefijo}` : 'parrafoSeccion4_comunidad_completo';
    if (this.datos[campoParrafo] || this.datos['parrafoSeccion4_comunidad_completo']) {
      return this.datos[campoParrafo] || this.datos['parrafoSeccion4_comunidad_completo'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const distrito = this.datos.distritoSeleccionado || '____';
    const provincia = this.datos.provinciaSeleccionada || '____';
    const aisd1 = this.datos.aisdComponente1 || '____';
    const aisd2 = this.datos.aisdComponente2 || '____';
    const departamento = this.datos.departamentoSeleccionado || '____';
    const grupoAISI = this.datos.grupoAISI || this.datos.distritoSeleccionado || '____';
    
    return `La CC ${grupoAISD} se encuentra ubicada predominantemente dentro del distrito de ${distrito}, provincia de ${provincia}; no obstante, sus límites comunales abarcan pequeñas áreas de los distritos de ${aisd1} y de ${aisd2}, del departamento de ${departamento}. Esta comunidad se caracteriza por su historia y tradiciones que se mantienen vivas a lo largo de los años. Se encuentra compuesta por el anexo ${grupoAISD}, el cual es el centro administrativo comunal, además de los sectores agropecuarios de Yuracranra, Tastanic y Faldahuasi. Ello se pudo validar durante el trabajo de campo, así como mediante la Base de Datos de Pueblos Indígenas u Originarios (BDPI). Sin embargo, en la actualidad, estos sectores agropecuarios no cuentan con población permanente y la mayor parte de los comuneros se concentran en el anexo ${grupoAISD}.\n\nEn cuanto al nombre "${grupoAISD}", según los entrevistados, este proviene de una hierba que se empleaba para elaborar moldes artesanales para queso; no obstante, ya no se viene utilizando en el presente y es una práctica que ha ido reduciéndose paulatinamente. Por otro lado, cabe mencionar que la comunidad se halla al este de la CC Sondor, al norte del CP ${grupoAISI} y al oeste del anexo Nauquipa.\n\nAsimismo, la CC ${grupoAISD} es reconocida por el Ministerio de Cultura como parte de los pueblos indígenas u originarios, específicamente como parte del pueblo quechua. Esta identidad es un pilar fundamental de la comunidad, influyendo en sus prácticas agrícolas, celebraciones y organización social. La oficialización de la comunidad por parte del Estado peruano se remonta al 24 de agosto de 1987, cuando fue reconocida mediante RD N°495 – 87 – MAG – DR – VIII – A. Este reconocimiento formalizó la existencia y los derechos de la comunidad, fortaleciendo su posición y legitimidad dentro del marco legal peruano. Posteriormente, las tierras de la comunidad fueron tituladas el 28 de marzo de 1996, conforme consta en la Ficha 90000300, según la BDPI. Esta titulación ha sido crucial para la protección y manejo de sus recursos naturales, permitiendo a la comunidad planificar y desarrollar proyectos que beneficien a todos sus comuneros. La administración de estas tierras ha sido un factor clave en la preservación de su cultura y en el desarrollo sostenible de la comunidad.`;
  }

  obtenerTextoSeccion4CaracterizacionIndicadores(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoParrafo = prefijo ? `parrafoSeccion4_caracterizacion_indicadores${prefijo}` : 'parrafoSeccion4_caracterizacion_indicadores';
    if (this.datos[campoParrafo] || this.datos['parrafoSeccion4_caracterizacion_indicadores']) {
      return this.datos[campoParrafo] || this.datos['parrafoSeccion4_caracterizacion_indicadores'];
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    return `Para la caracterización de los indicadores demográficos y aquellos relacionados a viviendas, se emplea la sumatoria de casos obtenida al considerar aquellos puntos de población que conforman la CC ${grupoAISD}. En el siguiente cuadro, se presenta aquellos puntos de población identificados por el INEI que se encuentran dentro de la comunidad en cuestión.`;
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

}

