import { Component, ChangeDetectorRef, Input, OnDestroy, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { StateService } from 'src/app/core/services/state.service';
import { CentrosPobladosActivosService } from 'src/app/core/services/centros-poblados-activos.service';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
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
  fotografiasUbicacionCache: FotoItem[] = [];
  fotografiasPoblacionCache: FotoItem[] = [];
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
    private centrosPobladosActivos: CentrosPobladosActivosService,
    private sanitizer: DomSanitizer,
    protected autoLoader: AutoBackendDataLoaderService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override onInitCustom(): void {
    this.llenarTablaAutomaticamenteSiNecesario();
    this.cargarDatosBackendSeccion4();
    setTimeout(() => {
      this.guardarTotalPoblacion();
    }, 500);
    this.calcularCoordenadasYAltitudReferenciales();
    
    // Inicializar párrafos con valores por defecto si no existen
    this.inicializarPárrafosParrafoSeccion4();
    
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

  private cargarDatosBackendSeccion4(): void {
    const parametros = this.getLoadParameters();
    if (parametros && parametros.length > 0) {
      this.autoLoader.loadSectionData('seccion4_aisd', parametros).subscribe(
        (data: { [fieldName: string]: any }) => {
          this.applyLoadedData(data);
        }
      );
    }
  }

  protected getSectionKey(): string {
    return 'seccion4_aisd';
  }

  protected getLoadParameters(): string[] | null {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const codigosActivos = prefijo?.startsWith('_A')
      ? this.centrosPobladosActivos.obtenerCodigosActivosPorPrefijo(prefijo)
      : [];

    return codigosActivos && codigosActivos.length > 0 ? codigosActivos : null;
  }

  protected applyLoadedData(loadedData: { [fieldName: string]: any }): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);

    for (const [fieldName, data] of Object.entries(loadedData)) {
      if (data === null || data === undefined) continue;
      
      const fieldKey = prefijo ? `${fieldName}${prefijo}` : fieldName;

      if (fieldName === 'tablaAISD2Datos' && Array.isArray(data) && data.length > 0) {
        this.formularioService.actualizarDato(fieldKey as any, data);
        // Limpiar cache para forzar recalcular filas
        this.filasCache = null;
        this.ultimoPrefijoCache = null;
      }
    }

    this.actualizarDatos();
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
      this.cargarDatosBackendSeccion4();
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
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
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

  /**
   * Busca un centro poblado en el JSON por nombre y obtiene sus coordenadas y altitud
   * Retorna las coordenadas formateadas como: "18L E: 660619 m N: 8291173 m"
   * Retorna la altitud formateada como: "3599 msnm"
   */
  private buscarCentroEnJSON(nombreCentro: string): any {
    if (!nombreCentro) return null;

    const jsonCompleto = this.datos['jsonCompleto'];
    const nombreUpper = nombreCentro.trim().toUpperCase();

    if (!jsonCompleto || typeof jsonCompleto !== 'object' || Array.isArray(jsonCompleto)) {
      return null;
    }

    // Recorrer todas las CLAVES (distritos) en el JSON
    for (const nombreDistrito of Object.keys(jsonCompleto)) {
      const centrosPoblados = jsonCompleto[nombreDistrito];
      if (Array.isArray(centrosPoblados)) {
        // Buscar el centro poblado por nombre (CCPP)
        const centro = centrosPoblados.find((cp: any) => {
          const nombreCP = (cp.CCPP || cp.ccpp || '').trim().toUpperCase();
          return nombreCP === nombreUpper;
        });

        if (centro) {
          // Formatear coordenadas: "18L E: 660619 m N: 8291173 m"
          const este = centro.ESTE || '____';
          const norte = centro.NORTE || '____';
          const zonaUTM = centro.ZONA_UTM || centro.zona_utm || '18L';
          
          let coordenadasFormato = '____';
          if (este !== '____' && norte !== '____') {
            coordenadasFormato = `${zonaUTM} E: ${este} m N: ${norte} m`;
          }

          // Formatear altitud: "3599 msnm"
          const altitudRaw = centro.ALTITUD || centro.altitud || '____';
          let altitudFormato = '____';
          if (altitudRaw !== '____') {
            altitudFormato = `${altitudRaw} msnm`;
          }

          return {
            nombre: centro.CCPP || nombreCentro,
            coordenadas: coordenadasFormato,
            altitud: altitudFormato,
            distrito: centro.DIST || '____',
            provincia: centro.PROV || '____',
            departamento: centro.DPTO || '____'
          };
        }
      }
    }

    return null;
  }

  /**
   * Obtiene la CAPITAL de la comunidad campesina actual: el centro poblado con MAYOR POBLACIÓN
   * entre los centros poblados SELECCIONADOS
   */
  private obtenerCapitalDeLaComunidadActual(): string | null {
    const comunidadesCampesinas = this.datos['comunidadesCampesinas'] || [];
    const prefijo = this.obtenerPrefijoGrupo();

    // Extraer el número del prefijo (_A1 -> 1, _A2 -> 2, etc.)
    if (!prefijo || !prefijo.startsWith('_A')) {
      return null;
    }

    const match = prefijo.match(/_A(\d+)/);
    if (!match) {
      return null;
    }

    const indiceComunidad = parseInt(match[1]) - 1;
    if (indiceComunidad < 0 || indiceComunidad >= comunidadesCampesinas.length) {
      return null;
    }

    const comunidad = comunidadesCampesinas[indiceComunidad];
    if (!comunidad || !comunidad.centrosPobladosSeleccionados || comunidad.centrosPobladosSeleccionados.length === 0) {
      return null;
    }

    const jsonCompleto = this.datos['jsonCompleto'];
    if (!jsonCompleto || typeof jsonCompleto !== 'object' || Array.isArray(jsonCompleto)) {
      return null;
    }

    // BUSCAR en el JSON todos los centros poblados que pertenecen a esta comunidad
    const distritoDeLaComunidad = comunidad.nombreOriginal || comunidad.nombre;
    const claveDistrito = Object.keys(jsonCompleto).find((clave: string) => 
      clave.toUpperCase() === distritoDeLaComunidad.toUpperCase() ||
      clave.toUpperCase().includes(distritoDeLaComunidad.toUpperCase().substring(0, 3))
    );

    if (!claveDistrito) {
      console.log(`[Seccion4] ⚠️ Comunidad ${comunidad.nombre} NO encontrada en JSON`);
      return null;
    }

    const centrosPobladosDelDistrito = jsonCompleto[claveDistrito];
    if (!Array.isArray(centrosPobladosDelDistrito)) {
      return null;
    }

    // FILTRAR solo los centros poblados SELECCIONADOS de la comunidad
    const centrosSeleccionados = centrosPobladosDelDistrito.filter((cp: any) => {
      const codigo = (cp.CODIGO || cp.codigo || '').toString();
      return comunidad.centrosPobladosSeleccionados.some((sel: any) => 
        sel.toString() === codigo
      );
    });

    if (centrosSeleccionados.length === 0) {
      console.log(`[Seccion4] ⚠️ No hay centros poblados seleccionados para ${comunidad.nombre}`);
      return null;
    }

    // BUSCAR el con MAYOR POBLACIÓN
    const capitalConMayorPoblacion = centrosSeleccionados.reduce((max: any, actual: any) => {
      const poblacionMax = parseInt(max.POBLACION || max.poblacion || '0') || 0;
      const poblacionActual = parseInt(actual.POBLACION || actual.poblacion || '0') || 0;
      return poblacionActual > poblacionMax ? actual : max;
    });

    console.log(`[Seccion4] 🏘️ Capital de ${comunidad.nombre}: ${capitalConMayorPoblacion.CCPP} (Población: ${capitalConMayorPoblacion.POBLACION})`);

    return capitalConMayorPoblacion.CCPP || capitalConMayorPoblacion.ccpp;
  }

  getFilasTablaAISD1(): any[] {
    // Obtener la CAPITAL de la comunidad actual (con mayor población)
    let capitalDeLaComunidad = this.obtenerCapitalDeLaComunidadActual();
    
    // Fallback a nombre de comunidad si no se encuentra capital
    if (!capitalDeLaComunidad) {
      capitalDeLaComunidad = this.obtenerNombreComunidadActual();
    }

    // Buscar los datos de la capital en el JSON
    const datosCapitalEnJSON = capitalDeLaComunidad ? this.buscarCentroEnJSON(capitalDeLaComunidad) : null;

    if (this.datos.tablaAISD1Datos && Array.isArray(this.datos.tablaAISD1Datos) && this.datos.tablaAISD1Datos.length > 0) {
      return this.datos.tablaAISD1Datos.map((fila: any) => {
        const localidad = fila.localidad || fila.Localidad || '';
        const coordenadas = fila.coordenadas || fila.Coordenadas || '';
        const altitud = fila.altitud || fila.Altitud || '';
        const distrito = fila.distrito || fila.Distrito || '';
        const provincia = fila.provincia || fila.Provincia || '';
        const departamento = fila.departamento || fila.Departamento || '';
        
        return {
          localidad: localidad && localidad.toString().trim() !== '' ? localidad : (this.datos.tablaAISD1Localidad || capitalDeLaComunidad || '____'),
          coordenadas: coordenadas && coordenadas.toString().trim() !== '' ? coordenadas : (datosCapitalEnJSON?.coordenadas || this.datos.tablaAISD1Coordenadas || this.datos.coordenadasAISD || '____'),
          altitud: altitud && altitud.toString().trim() !== '' ? altitud : (datosCapitalEnJSON?.altitud || this.datos.tablaAISD1Altitud || this.datos.altitudAISD || '____'),
          distrito: distrito && distrito.toString().trim() !== '' ? distrito : (this.datos.tablaAISD1Distrito || this.datos.distritoSeleccionado || '____'),
          provincia: provincia && provincia.toString().trim() !== '' ? provincia : (this.datos.tablaAISD1Provincia || this.datos.provinciaSeleccionada || '____'),
          departamento: departamento && departamento.toString().trim() !== '' ? departamento : (this.datos.tablaAISD1Departamento || this.datos.departamentoSeleccionado || '____')
        };
      });
    }
    
    return [{
      localidad: this.datos.tablaAISD1Localidad || capitalDeLaComunidad || '____',
      coordenadas: datosCapitalEnJSON?.coordenadas || this.datos.tablaAISD1Coordenadas || this.datos.coordenadasAISD || '____',
      altitud: datosCapitalEnJSON?.altitud || this.datos.tablaAISD1Altitud || this.datos.altitudAISD || '____',
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
    
    // Primero intenta obtener datos con prefijo (desde backend)
    const datosConPrefijo = prefijo ? this.datos[`tablaAISD2Datos${prefijo}`] : null;
    const datosBase = this.datos.tablaAISD2Datos;
    const tablaAISD2Datos = datosConPrefijo || datosBase;
    
    if (tablaAISD2Datos && Array.isArray(tablaAISD2Datos) && tablaAISD2Datos.length > 0) {
    const filasActivas = this.formularioService.obtenerFilasActivasTablaAISD2(prefijo);
      const filas = tablaAISD2Datos
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

    const centrosDisponibles = this.aplanarCentrosPoblados(centrosPobladosJSON);

    
    if (centrosPobladosJSON.length === 0) {
      return;
    }

    const codigosComunidad = this.obtenerCentrosPobladosDeComunidadCampesina();
    if (codigosComunidad.length === 0) {
      return;
    }

    const flagKey = `tablaAISD2DatosLlena${prefijo}`;
    if (this.datos[flagKey]) {
      return;
    }
    const codigosSet = new Set(codigosComunidad.map(c => c.toString().trim()));
    const centrosFiltrados = centrosDisponibles.filter((cp: any) => {
      const codigo = cp.CODIGO?.toString().trim() || '';
      return codigo && codigosSet.has(codigo);
    });
    
    if (centrosFiltrados.length > 0) {
      this.poblarTablaAutomaticamente(centrosFiltrados, prefijo);
      this.datos[flagKey] = true;
      this.formularioService.actualizarDato(flagKey as any, true);
    } else {
      console.warn('[Seccion4] No se encontraron centros poblados filtrados para los códigos proporcionados');
    }
  }

  poblarTablaAutomaticamente(centrosPoblados: any[], prefijo: string): void {
    const codigosActivos: string[] = [];
    
    const filas = centrosPoblados.map(cp => {
      const codigoCPP = cp.CODIGO?.toString().trim() || '';
      if (codigoCPP) {
        codigosActivos.push(codigoCPP);
      }
      return {
        punto: cp.CCPP || '____',
        codigo: codigoCPP || '____',
        poblacion: cp.POBLACION?.toString() || '0',
        viviendasEmpadronadas: '____',
        viviendasOcupadas: '____'
      };
    });

    this.datos.tablaAISD2Datos = filas;
    
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

  private aplanarCentrosPoblados(jsonData: any): any[] {
    if (!jsonData) {
      return [];
    }

    if (Array.isArray(jsonData)) {
      return jsonData;
    }

    if (typeof jsonData === 'object') {
      return Object.values(jsonData).reduce((acumulador: any[], valor) => {
        if (Array.isArray(valor)) {
          return acumulador.concat(valor);
        }
        return acumulador;
      }, []);
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
    } else if (campo.includes('ViviendasEmpadronadas') || campo.includes('ViviendasOcupadas')) {
      this.guardarTotalViviendas();
    }
    
    this.actualizarDatos();
  }

  guardarTotalPoblacion(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const totalPoblacionRaw = this.getTotalPoblacionAISD2();
    const totalPoblacion = typeof totalPoblacionRaw === 'number' ? totalPoblacionRaw : (totalPoblacionRaw === '____' ? 0 : parseInt(totalPoblacionRaw as any) || 0);
    const poblacionKey = prefijo ? `tablaAISD2TotalPoblacion${prefijo}` : 'tablaAISD2TotalPoblacion';
    
    if (typeof totalPoblacion === 'number' && totalPoblacion > 0) {
      this.formularioService.actualizarDato(poblacionKey as any, totalPoblacion);
      this.datos[poblacionKey] = totalPoblacion;
    }
    
    this.guardarTotalViviendas();
  }

  guardarTotalViviendas(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const totalViviendasEmpRaw = this.getTotalViviendasEmpadronadasAISD2();
    const totalViviendasOcpRaw = this.getTotalViviendasOcupadasAISD2();
    
    const totalViviendasEmp = typeof totalViviendasEmpRaw === 'number' ? totalViviendasEmpRaw : (totalViviendasEmpRaw === '____' ? 0 : parseInt(totalViviendasEmpRaw as any) || 0);
    const totalViviendasOcp = typeof totalViviendasOcpRaw === 'number' ? totalViviendasOcpRaw : (totalViviendasOcpRaw === '____' ? 0 : parseInt(totalViviendasOcpRaw as any) || 0);
    
    const viviendasEmpKey = prefijo ? `tablaAISD2TotalViviendasEmpadronadas${prefijo}` : 'tablaAISD2TotalViviendasEmpadronadas';
    const viviendasOcpKey = prefijo ? `tablaAISD2TotalViviendasOcupadas${prefijo}` : 'tablaAISD2TotalViviendasOcupadas';
    
    if (typeof totalViviendasEmp === 'number') {
      this.formularioService.actualizarDato(viviendasEmpKey as any, totalViviendasEmp);
      this.datos[viviendasEmpKey] = totalViviendasEmp;
    }
    
    if (typeof totalViviendasOcp === 'number') {
      this.formularioService.actualizarDato(viviendasOcpKey as any, totalViviendasOcp);
      this.datos[viviendasOcpKey] = totalViviendasOcp;
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
    this.fotografiasUbicacionCache = [...fotosUbicacion];
    this.fotografiasPoblacionCache = [...fotosPoblacion];
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
    // 1. Si hay cache, usarlo (más rápido y actualizado)
    if (this.fotografiasUbicacionCache && this.fotografiasUbicacionCache.length > 0) {
      return this.fotografiasUbicacionCache;
    }
    
    // 2. Fallback: cargar del servicio
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_UBICACION,
      groupPrefix
    );
  }

  getFotografiasPoblacionVista(): FotoItem[] {
    // 1. Si hay cache, usarlo (más rápido y actualizado)
    if (this.fotografiasPoblacionCache && this.fotografiasPoblacionCache.length > 0) {
      return this.fotografiasPoblacionCache;
    }
    
    // 2. Fallback: cargar del servicio
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_POBLACION,
      groupPrefix
    );
  }

  onFotografiasUbicacionChange(fotografias: FotoItem[]) {
    // 1. Guardar en el servicio
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_UBICACION, fotografias);
    
    // 2. Actualizar formulario
    this.fotografiasUbicacionFormMulti = [...fotografias];
    
    // 3. Actualizar cache
    this.fotografiasUbicacionCache = [...fotografias];
    
    // 4. Forzar detección de cambios
    this.cdRef.detectChanges();
  }

  onFotografiasPoblacionChange(fotografias: FotoItem[]) {
    // 1. Guardar en el servicio
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_POBLACION, fotografias);
    
    // 2. Actualizar formulario
    this.fotografiasPoblacionFormMulti = [...fotografias];
    
    // 3. Actualizar cache
    this.fotografiasPoblacionCache = [...fotografias];
    
    // 4. Forzar detección de cambios
    this.cdRef.detectChanges();
  }

  obtenerTextoSeccion4IntroduccionAISD(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `parrafoSeccion4_introduccion_aisd${prefijo}` : 'parrafoSeccion4_introduccion_aisd';
    const campoSinPrefijo = 'parrafoSeccion4_introduccion_aisd';
    
    // Prioridad: con prefijo > sin prefijo > por defecto
    const textoPersonalizado = this.datos[campoConPrefijo] || this.datos[campoSinPrefijo];
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const textoPorDefecto = `Se ha determinado como Área de Influencia Social Directa (AISD) a la CC ${grupoAISD}. Esta delimitación se justifica en los criterios de propiedad de terreno superficial, además de la posible ocurrencia de impactos directos como la contratación de mano de obra local, adquisición de bienes y servicios, así como logística. En los siguientes apartados se desarrolla la caracterización socioeconómica y cultural de la comunidad delimitada como parte del AISD.`;
    
    // Si hay texto personalizado, reemplazar placeholders
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado
        .replace(/CC\s*___/g, `CC ${grupoAISD}`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoSeccion4IntroduccionAISDConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion4IntroduccionAISD();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let html = this.escapeHtml(texto);
    if (grupoAISD !== '____') {
      html = html.replace(
        new RegExp(this.escapeRegex(grupoAISD), 'g'),
        `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`
      );
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoSeccion4ComunidadCompleto(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoParrafo = prefijo ? `parrafoSeccion4_comunidad_completo${prefijo}` : 'parrafoSeccion4_comunidad_completo';
    const textoPersonalizado = this.datos[campoParrafo] || this.datos['parrafoSeccion4_comunidad_completo'];
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const distrito = this.datos.distritoSeleccionado || '____';
    const provincia = this.datos.provinciaSeleccionada || '____';
    const aisd1 = this.datos.aisdComponente1 || '____';
    const aisd2 = this.datos.aisdComponente2 || '____';
    const departamento = this.datos.departamentoSeleccionado || '____';
    const grupoAISI = this.datos.grupoAISI || this.datos.distritoSeleccionado || '____';
    
    const textoPorDefecto = `La CC ${grupoAISD} se encuentra ubicada predominantemente dentro del distrito de ${distrito}, provincia de ${provincia}; no obstante, sus límites comunales abarcan pequeñas áreas de los distritos de ${aisd1} y de ${aisd2}, del departamento de ${departamento}. Esta comunidad se caracteriza por su historia y tradiciones que se mantienen vivas a lo largo de los años. Se encuentra compuesta por el anexo ${grupoAISD}, el cual es el centro administrativo comunal, además de los sectores agropecuarios de Yuracranra, Tastanic y Faldahuasi. Ello se pudo validar durante el trabajo de campo, así como mediante la Base de Datos de Pueblos Indígenas u Originarios (BDPI). Sin embargo, en la actualidad, estos sectores agropecuarios no cuentan con población permanente y la mayor parte de los comuneros se concentran en el anexo ${grupoAISD}.\n\nEn cuanto al nombre "${grupoAISD}", según los entrevistados, este proviene de una hierba que se empleaba para elaborar moldes artesanales para queso; no obstante, ya no se viene utilizando en el presente y es una práctica que ha ido reduciéndose paulatinamente. Por otro lado, cabe mencionar que la comunidad se halla al este de la CC Sondor, al norte del CP ${grupoAISI} y al oeste del anexo Nauquipa.\n\nAsimismo, la CC ${grupoAISD} es reconocida por el Ministerio de Cultura como parte de los pueblos indígenas u originarios, específicamente como parte del pueblo quechua. Esta identidad es un pilar fundamental de la comunidad, influyendo en sus prácticas agrícolas, celebraciones y organización social. La oficialización de la comunidad por parte del Estado peruano se remonta al 24 de agosto de 1987, cuando fue reconocida mediante RD N°495 – 87 – MAG – DR – VIII – A. Este reconocimiento formalizó la existencia y los derechos de la comunidad, fortaleciendo su posición y legitimidad dentro del marco legal peruano. Posteriormente, las tierras de la comunidad fueron tituladas el 28 de marzo de 1996, conforme consta en la Ficha 90000300, según la BDPI. Esta titulación ha sido crucial para la protección y manejo de sus recursos naturales, permitiendo a la comunidad planificar y desarrollar proyectos que beneficien a todos sus comuneros. La administración de estas tierras ha sido un factor clave en la preservación de su cultura y en el desarrollo sostenible de la comunidad.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado
        .replace(/CC\s*___/g, `CC ${grupoAISD}`)
        .replace(/distrito de\s*___/g, `distrito de ${distrito}`)
        .replace(/provincia de\s*___/g, `provincia de ${provincia}`)
        .replace(/distritos de\s*___\s*y de/g, `distritos de ${aisd1} y de`)
        .replace(/y de\s*___\s*del departamento/g, `y de ${aisd2} del departamento`)
        .replace(/departamento de\s*___/g, `departamento de ${departamento}`)
        .replace(/CP\s*___/g, `CP ${grupoAISI}`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoSeccion4ComunidadCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion4ComunidadCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const distrito = this.datos.distritoSeleccionado || '____';
    const provincia = this.datos.provinciaSeleccionada || '____';
    const aisd1 = this.datos.aisdComponente1 || '____';
    const aisd2 = this.datos.aisdComponente2 || '____';
    const departamento = this.datos.departamentoSeleccionado || '____';
    const grupoAISI = this.datos.grupoAISI || this.datos.distritoSeleccionado || '____';
    
    let html = this.escapeHtml(texto);
    
    const valores = [
      { valor: grupoAISD, clase: 'data-section' },
      { valor: distrito, clase: 'data-section' },
      { valor: provincia, clase: 'data-section' },
      { valor: aisd1, clase: 'data-section' },
      { valor: aisd2, clase: 'data-section' },
      { valor: departamento, clase: 'data-section' },
      { valor: grupoAISI, clase: 'data-section' }
    ];
    
    valores.forEach(({ valor, clase }) => {
      if (valor && valor !== '____') {
        html = html.replace(
          new RegExp(this.escapeRegex(valor), 'g'),
          `<span class="${clase}">${this.escapeHtml(valor)}</span>`
        );
      }
    });
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoSeccion4CaracterizacionIndicadores(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoParrafo = prefijo ? `parrafoSeccion4_caracterizacion_indicadores${prefijo}` : 'parrafoSeccion4_caracterizacion_indicadores';
    const textoPersonalizado = this.datos[campoParrafo] || this.datos['parrafoSeccion4_caracterizacion_indicadores'];
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const textoPorDefecto = `Para la caracterización de los indicadores demográficos y aquellos relacionados a viviendas, se emplea la sumatoria de casos obtenida al considerar aquellos puntos de población que conforman la CC ${grupoAISD}. En el siguiente cuadro, se presenta aquellos puntos de población identificados por el INEI que se encuentran dentro de la comunidad en cuestión.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado
        .replace(/CC\s*___/g, `CC ${grupoAISD}`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoSeccion4CaracterizacionIndicadoresConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion4CaracterizacionIndicadores();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let html = this.escapeHtml(texto);
    if (grupoAISD !== '____') {
      html = html.replace(
        new RegExp(this.escapeRegex(grupoAISD), 'g'),
        `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`
      );
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  getFieldIdTextoSeccion4IntroduccionAISD(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion4_introduccion_aisd${prefijo}` : 'parrafoSeccion4_introduccion_aisd';
  }

  getFieldIdTextoSeccion4ComunidadCompleto(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion4_comunidad_completo${prefijo}` : 'parrafoSeccion4_comunidad_completo';
  }

  getFieldIdTextoSeccion4CaracterizacionIndicadores(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion4_caracterizacion_indicadores${prefijo}` : 'parrafoSeccion4_caracterizacion_indicadores';
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  debugDatos(): void {
    // método usado solo en depuraciones puntuales, se deja vacío para evitar logs
  }

  private inicializarPárrafosParrafoSeccion4(): void {
    const prefijo = this.obtenerPrefijoGrupo();
    const campoConPrefijo = prefijo ? `parrafoSeccion4_introduccion_aisd${prefijo}` : 'parrafoSeccion4_introduccion_aisd';
    const campoSinPrefijo = 'parrafoSeccion4_introduccion_aisd';
    
    // Si no hay valor guardado, inicializar con el texto por defecto
    if (!this.datos[campoConPrefijo] && !this.datos[campoSinPrefijo]) {
      const textoDefault = this.obtenerTextoSeccion4IntroduccionAISD();
      this.formularioService.actualizarDato(campoConPrefijo, textoDefault);
      this.datos[campoConPrefijo] = textoDefault;
    }
    
    // Hacer lo mismo para los otros párrafos
    const campoCompletoConPrefijo = prefijo ? `parrafoSeccion4_comunidad_completo${prefijo}` : 'parrafoSeccion4_comunidad_completo';
    if (!this.datos[campoCompletoConPrefijo] && !this.datos['parrafoSeccion4_comunidad_completo']) {
      const textoDefault = this.obtenerTextoSeccion4ComunidadCompleto();
      this.formularioService.actualizarDato(campoCompletoConPrefijo, textoDefault);
      this.datos[campoCompletoConPrefijo] = textoDefault;
    }
    
    const campoIndicadoresConPrefijo = prefijo ? `parrafoSeccion4_caracterizacion_indicadores${prefijo}` : 'parrafoSeccion4_caracterizacion_indicadores';
    if (!this.datos[campoIndicadoresConPrefijo] && !this.datos['parrafoSeccion4_caracterizacion_indicadores']) {
      const textoDefault = this.obtenerTextoSeccion4CaracterizacionIndicadores();
      this.formularioService.actualizarDato(campoIndicadoresConPrefijo, textoDefault);
      this.datos[campoIndicadoresConPrefijo] = textoDefault;
    }
  }

}

