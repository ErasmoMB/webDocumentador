import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { GenericImageComponent } from '../generic-image/generic-image.component';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion21',
    templateUrl: './seccion21.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion21Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  private readonly regexCache = new Map<string, RegExp>();
  
  fotografiasCahuachoCache: any[] = [];
  override watchedFields: string[] = ['parrafoSeccion21_aisi_intro_completo', 'parrafoSeccion21_centro_poblado_completo', 'centroPobladoAISI', 'provinciaSeleccionada', 'departamentoSeleccionado', 'leyCreacionDistrito', 'fechaCreacionDistrito', 'distritoSeleccionado', 'distritoAnterior', 'origenPobladores1', 'origenPobladores2', 'departamentoOrigen', 'anexosEjemplo', 'ubicacionCpTabla'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuacho';

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private stateAdapter: ReactiveStateAdapter,
    private sanitizer: DomSanitizer,
    autoLoader: AutoBackendDataLoaderService,
    private groupConfig: GroupConfigService
  ) {
    super(cdRef, autoLoader, injector, undefined, undefined);
  }

  protected override async onInitCustom(): Promise<void> {
    
    this.actualizarFotografiasCache();
    this.debugCentrosPobladosAISI(); // Debug de centros poblados
    if (this.modoFormulario) {
      if (this.seccionId) {
        setTimeout(() => {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }, 0);
      }
      this.stateSubscription = this.stateAdapter.datos$
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.seccionId) {
            this.actualizarFotografiasFormMulti();
            this.cdRef.detectChanges();
          }
        });
    } else {
      this.stateSubscription = this.stateAdapter.datos$
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.cargarFotografias();
          this.cdRef.detectChanges();
        });
    }
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasCache();
    }
  }

  override ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  protected getSectionKey(): string {
    return 'seccion21_aisi';
  }

  protected getLoadParameters(): string[] | null {
    return this.groupConfig.getAISICCPPActivos();
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.projectFacade.obtenerDatos();
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (!this.compararValores(valorActual, valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = this.clonarValor(valorActual);
      }
    }
    
    return hayCambios;
  }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
    this.actualizarFotografiasCache();
  }

  protected override actualizarDatos(): void {
    this.datos = this.projectFacade.obtenerDatos();
    this.actualizarFotografiasCache();
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = this.clonarValor((this.datos as any)[campo] || null);
    });
  }

  protected override actualizarValoresConPrefijo(): void {
    let centroPobladoAISI = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    
    // Si no hay centroPobladoAISI definido, usar el del informacionReferencialAISI (heredado del AutoLoad)
    if (!centroPobladoAISI && this.datos.informacionReferencialAISI?.centro_poblado) {
      centroPobladoAISI = this.datos.informacionReferencialAISI.centro_poblado;
    }
    
    // Fallback a PATIVILCA si no hay nada
    if (!centroPobladoAISI) {
      centroPobladoAISI = 'PATIVILCA';
    }
    
    this.datos.centroPobladoAISI = centroPobladoAISI;
    this.datosAnteriores.centroPobladoAISI = centroPobladoAISI;
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getTablaKeyUbicacionCp(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
  }

  get ubicacionCpConfig(): any {
    return {
      tablaKey: this.getTablaKeyUbicacionCp(),
      totalKey: 'localidad',
      campoTotal: 'localidad',
      estructuraInicial: [{ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' }]
    };
  }

  get columnasUbicacionCp(): any[] {
    return [
      { key: 'localidad', header: 'Localidad', align: 'left' },
      { key: 'coordenadas', header: 'Coordenadas', align: 'left' },
      { key: 'altitud', header: 'Altitud', align: 'left' },
      { key: 'distrito', header: 'Distrito', align: 'left' },
      { key: 'provincia', header: 'Provincia', align: 'left' },
      { key: 'departamento', header: 'Departamento', align: 'left' }
    ];
  }

  onTablaUpdated(): void {
    this.cdRef.detectChanges();
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
          const zonaUTM = centro.ZONA_UTM || centro.zona_utm || '18L'; // Por defecto 18L
          
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
   * Busca un centro poblado en el JSON por código y obtiene sus coordenadas y altitud
   * Retorna: { coordenadas: "ESTE, NORTE", altitud: "3423" }
   */
  private obtenerCoordenadasyAltitudDelCentro(codigoCentro: string): { coordenadas: string; altitud: string } | null {
    const jsonCompleto = this.datos['jsonCompleto'];
    if (!jsonCompleto || typeof jsonCompleto !== 'object' || Array.isArray(jsonCompleto)) {
      return null;
    }

    // Buscar en TODOS los distritos del JSON
    for (const nombreDistrito of Object.keys(jsonCompleto)) {
      const centrosPoblados = jsonCompleto[nombreDistrito];
      if (Array.isArray(centrosPoblados)) {
        const centro = centrosPoblados.find((cp: any) => 
          (cp.CODIGO || cp.codigo || '').toString() === codigoCentro?.toString()
        );

        if (centro) {
          const este = centro.ESTE || centro.este || '';
          const norte = centro.NORTE || centro.norte || '';
          const altitud = centro.ALTITUD || centro.altitud || '';

          return {
            coordenadas: `${este}, ${norte}`,
            altitud: altitud.toString()
          };
        }
      }
    }

    return null;
  }

  /**
   * Obtiene el CAPITAL del distrito actual: el centro poblado con MAYOR POBLACIÓN
   * entre los centros poblados SELECCIONADOS
   */
  private obtenerCapitalDelDistritoActual(): string | null {
    const distritosAISI = this.datos['distritosAISI'] || [];
    const distritoActual = this.datos.distritoSeleccionado;

    if (!distritoActual) return null;

    // Buscar el distrito actual en distritosAISI
    const distrito = distritosAISI.find((d: any) => 
      d.nombre === distritoActual || d.nombreOriginal === distritoActual
    );

    if (!distrito || !distrito.centrosPobladosSeleccionados || distrito.centrosPobladosSeleccionados.length === 0) {
      return null;
    }

    const jsonCompleto = this.datos['jsonCompleto'];
    if (!jsonCompleto || typeof jsonCompleto !== 'object' || Array.isArray(jsonCompleto)) {
      return null;
    }

    // BUSCAR en el JSON la CLAVE que corresponde a este distrito
    const distritosJSON = Object.keys(jsonCompleto);
    const claveDistrito = distritosJSON.find((clave: string) => 
      clave.toUpperCase() === distritoActual.toUpperCase() ||
      clave.toUpperCase().includes(distritoActual.toUpperCase().substring(0, 3))
    );

    if (!claveDistrito) {
      return null;
    }

    const centrosPobladosDelDistrito = jsonCompleto[claveDistrito];
    if (!Array.isArray(centrosPobladosDelDistrito)) {
      return null;
    }

    // FILTRAR solo los centros poblados SELECCIONADOS
    const centrosSeleccionados = centrosPobladosDelDistrito.filter((cp: any) => {
      const codigo = (cp.CODIGO || cp.codigo || '').toString();
      return distrito.centrosPobladosSeleccionados.some((sel: any) => 
        sel.toString() === codigo
      );
    });

    if (centrosSeleccionados.length === 0) {
      return null;
    }

    // BUSCAR el con MAYOR POBLACIÓN
    const capitalConMayorPoblacion = centrosSeleccionados.reduce((max: any, actual: any) => {
      const poblacionMax = parseInt(max.POBLACION || max.poblacion || '0') || 0;
      const poblacionActual = parseInt(actual.POBLACION || actual.poblacion || '0') || 0;
      return poblacionActual > poblacionMax ? actual : max;
    });


    return capitalConMayorPoblacion.CCPP || capitalConMayorPoblacion.ccpp;
  }

  getFilasUbicacionCp(): any[] {
    const tablaKey = this.getTablaKeyUbicacionCp();
    
    // Obtener la tabla del usuario (ubicacionCpTabla) - esto contiene coordenadas y altitud
    const tablaUbicacion = this.datos.ubicacionCpTabla || [];
    
    // Obtener la CAPITAL del distrito actual desde los centros poblados seleccionados
    let capitalDelDistrito = this.obtenerCapitalDelDistritoActual();

    // Fallback a centroPobladoAISI si no se encuentra la capital
    if (!capitalDelDistrito) {
      capitalDelDistrito = this.datos.centroPobladoAISI;
    }

    // Si aún no hay capital, fallback a informacionReferencialAISI
    if (!capitalDelDistrito && this.datos.informacionReferencialAISI) {
      capitalDelDistrito = this.datos.informacionReferencialAISI.centro_poblado;
    }

    // Último fallback
    if (!capitalDelDistrito) {
      capitalDelDistrito = 'PATIVILCA';
    }

    // Buscar los datos de la capital en el JSON
    const datosCapitalEnJSON = this.buscarCentroEnJSON(capitalDelDistrito);

    if (tablaUbicacion && Array.isArray(tablaUbicacion) && tablaUbicacion.length > 0) {
      // Retornar la tabla como está, pero auto-rellenando con datos del JSON
      return tablaUbicacion.map((fila: any, index: number) => {
        const localidad = fila.localidad || fila.Localidad || '';
        const coordenadas = fila.coordenadas || fila.Coordenadas || '';
        const altitud = fila.altitud || fila.Altitud || '';
        const distrito = fila.distrito || fila.Distrito || '';
        const provincia = fila.provincia || fila.Provincia || '';
        const departamento = fila.departamento || fila.Departamento || '';

        // Si es la primera fila y tenemos datos de la capital en JSON, rellenarla automáticamente
        const esCapitalRow = index === 0 && datosCapitalEnJSON;

        return {
          localidad: localidad && localidad.toString().trim() !== '' ? localidad : capitalDelDistrito,
          coordenadas: esCapitalRow && (datosCapitalEnJSON?.coordenadas !== '____') 
            ? datosCapitalEnJSON.coordenadas 
            : (coordenadas && coordenadas.toString().trim() !== '' ? coordenadas : '____'),
          altitud: esCapitalRow && (datosCapitalEnJSON?.altitud !== '____') 
            ? datosCapitalEnJSON.altitud 
            : (altitud && altitud.toString().trim() !== '' ? altitud : '____'),
          distrito: distrito && distrito.toString().trim() !== '' ? distrito : (this.datos.distritoSeleccionado || 'SAN PEDRO'),
          provincia: provincia && provincia.toString().trim() !== '' ? provincia : (this.datos.provinciaSeleccionada || 'OCROS'),
          departamento: departamento && departamento.toString().trim() !== '' ? departamento : (this.datos.departamentoSeleccionado || 'ANCASH'),
          esCapital: esCapitalRow // Marcador para resaltar en celeste
        };
      });
    }

    // Si no hay datos, retornar fila por defecto con datos de la capital
    return [{
      localidad: capitalDelDistrito,
      coordenadas: datosCapitalEnJSON?.coordenadas || '____',
      altitud: datosCapitalEnJSON?.altitud || '____',
      distrito: this.datos.distritoSeleccionado || 'SAN PEDRO',
      provincia: this.datos.provinciaSeleccionada || 'OCROS',
      departamento: this.datos.departamentoSeleccionado || 'ANCASH',
      esCapital: true // Marcador para resaltar en celeste
    }];
  }

  getFieldIdTextoAISIIntro(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion21_aisi_intro_completo${prefijo}` : 'parrafoSeccion21_aisi_intro_completo';
  }

  getFieldIdTextoCentroPoblado(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion21_centro_poblado_completo${prefijo}` : 'parrafoSeccion21_centro_poblado_completo';
  }

  protected override loadSectionData(): void {
    const fieldsToLoad = this.fieldMapping.getFieldsForSection(this.seccionId);
    if (fieldsToLoad.length > 0) {
      this.sectionDataLoader.loadSectionData(this.seccionId, fieldsToLoad)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
  }

  formatearParrafo(texto: string): SafeHtml {
    // Logged: [Seccion21] formatearParrafo called - seccionId: {this.seccionId}, texto length: {texto?.length}
    // Logged: [Seccion21] formatearParrafo texto: {texto}
    if (!texto) {
      // Logged: [Seccion21] formatearParrafo: texto vacío
      return '';
    }
    const parrafos = texto.split(/\n\n+/);
    const resultado = parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
    // Logged: [Seccion21] formatearParrafo resultado: {resultado}
    return this.sanitizer.bypassSecurityTrustHtml(resultado);
  }

  override actualizarFotografiasCache() {
    this.fotografiasCahuachoCache = this.getFotografiasCahuachoVista();
  }

  getFotografiasCahuachoVista(): FotoItem[] {
    if (this.fotografiasCache && this.fotografiasCache.length > 0) {
      return this.fotografiasCache;
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = [...fotos];
    this.cdRef.markForCheck();
  }

  override onFotografiasChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
  }

  obtenerTextoSeccion21AISIIntroCompleto(): string {
    // Logged: [Seccion21] obtenerTextoSeccion21AISIIntroCompleto - this.datos: {this.datos}
    // Logged: [Seccion21] parrafoSeccion21_aisi_intro_completo: {this.datos?.parrafoSeccion21_aisi_intro_completo}
    // Logged: [Seccion21] centroPobladoAISI: {this.datos?.centroPobladoAISI}
    // Logged: [Seccion21] provinciaSeleccionada: {this.datos?.provinciaSeleccionada}
    // Logged: [Seccion21] departamentoSeleccionado: {this.datos?.departamentoSeleccionado}
    
    if (this.datos.parrafoSeccion21_aisi_intro_completo) {
      // Logged: [Seccion21] Usando texto personalizado
      return this.datos.parrafoSeccion21_aisi_intro_completo;
    }
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const provincia = this.datos.provinciaSeleccionada || 'Caravelí';
    const departamento = this.datos.departamentoSeleccionado || 'Arequipa';
    
    // Logged: [Seccion21] Usando valores por defecto: {centroPoblado, provincia, departamento}
    
    return `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el CP ${centroPoblado}, capital distrital de la jurisdicción homónima, en la provincia de ${provincia}, en el departamento de ${departamento}. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, es la localidad de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`;
  }

  obtenerTextoSeccion21CentroPobladoCompleto(): string {
    if (this.datos.parrafoSeccion21_centro_poblado_completo) {
      return this.datos.parrafoSeccion21_centro_poblado_completo;
    }
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const provincia = this.datos.provinciaSeleccionada || 'Caravelí';
    const departamento = this.datos.departamentoSeleccionado || 'Arequipa';
    const ley = this.datos.leyCreacionDistrito || '8004';
    const fecha = this.datos.fechaCreacionDistrito || '22 de febrero de 1935';
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const distritoAnterior = this.datos.distritoAnterior || 'Caravelí';
    const origen1 = this.datos.origenPobladores1 || 'Caravelí';
    const origen2 = this.datos.origenPobladores2 || 'Parinacochas';
    const deptoOrigen = this.datos.departamentoOrigen || 'Ayacucho';
    const anexos = this.datos.anexosEjemplo || 'Ayroca o Sóndor';
    return `El CP ${centroPoblado} es la capital del distrito homónimo, perteneciente a la provincia de ${provincia}, en el departamento de ${departamento}. Su designación como capital distrital se oficializó mediante la Ley N°${ley}, promulgada el ${fecha}, fecha en que se creó el distrito de ${distrito}. Antes de ello, este asentamiento era un caserío del distrito de ${distritoAnterior}, marcando un importante cambio en su desarrollo administrativo y social.\n\nLos primeros pobladores de ${centroPoblado} provenían principalmente de ${origen1} y la provincia de ${origen2}, en ${deptoOrigen}. Entre las familias pioneras destacan apellidos como Espinoza, Miralles, De la Cruz y Aguayo, quienes sentaron las bases de la localidad actual. El nombre "${centroPoblado}" proviene del término quechua Ccahuayhuachu, que se traduce como "mírame desde aquí", reflejando posiblemente su ubicación estratégica o una percepción cultural del entorno.\n\nA diferencia de algunos anexos del distrito, como ${anexos}, que son centros administrativos de sus respectivas comunidades campesinas, el centro poblado ${centroPoblado} no se encuentra dentro de los límites de ninguna comunidad campesina. Esto le otorga una característica particular dentro del contexto rural, marcando su identidad como un núcleo urbano-administrativo independiente en el distrito.`;
  }

  inicializarUbicacionCp() {
    if (!this.datos['ubicacionCpTabla'] || this.datos['ubicacionCpTabla'].length === 0) {
      this.datos['ubicacionCpTabla'] = [
        { localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' }
      ];
      this.onFieldChange('ubicacionCpTabla', this.datos['ubicacionCpTabla'], { refresh: false });
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  agregarUbicacionCp() {
    if (!this.datos['ubicacionCpTabla']) {
      this.inicializarUbicacionCp();
    }
    this.datos['ubicacionCpTabla'].push({ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' });
    this.onFieldChange('ubicacionCpTabla', this.datos['ubicacionCpTabla'], { refresh: false });
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarUbicacionCp(index: number) {
    if (this.datos['ubicacionCpTabla'] && this.datos['ubicacionCpTabla'].length > 1) {
      this.datos['ubicacionCpTabla'].splice(index, 1);
      this.datos['ubicacionCpTabla'] = [...this.datos['ubicacionCpTabla']];
      this.onFieldChange('ubicacionCpTabla', this.datos['ubicacionCpTabla'], { refresh: false });
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarUbicacionCp(index: number, field: string, value: any) {
    if (!this.datos['ubicacionCpTabla']) {
      this.inicializarUbicacionCp();
    }
    if (this.datos['ubicacionCpTabla'][index]) {
      this.datos['ubicacionCpTabla'][index][field] = value;
      this.datos['ubicacionCpTabla'] = [...this.datos['ubicacionCpTabla']];
      this.onFieldChange('ubicacionCpTabla', this.datos['ubicacionCpTabla'], { refresh: false });
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  private debugCentrosPobladosAISI(): void {
    const match = this.seccionId.match(/^3\.1\.4\.B\.(\d+)/);
    if (!match) return;
    
    const numeroGrupo = parseInt(match[1], 10);
    const datos = this.projectFacade.obtenerDatos();
    
    // Limpiar consola para mostrar solo los logs del grupo actual
    console.clear();
    
    // DEBUG: Mostrar estructura de datos
    console.log(`%c[DEBUG AISI] Analizando sección ${this.seccionId}`, 'color: #666; font-size: 12px');
    console.log(`%c[DEBUG AISI] Estructura de datos:`, 'color: #666; font-size: 12px');
    console.log('- distritosAISI:', datos['distritosAISI']);
    console.log('- centrosPobladosJSON:', datos['centrosPobladosJSON']);
    console.log('- jsonCompleto:', datos['jsonCompleto']);
    
    const distritos = datos['distritosAISI'] || [];
    console.log(`%c[DEBUG AISI] Total distritos cargados: ${distritos.length}`, 'color: #999; font-size: 11px');
    
    if (distritos.length === 0) {
      console.log('%c⚠️ No hay distritos cargados. Verifica que hayas cargado un JSON en sección 1.', 'color: #f59e0b; font-weight: bold');
      return;
    }
    
    const distritoActual = distritos[numeroGrupo - 1];
    console.log(`%c[DEBUG AISI] Buscando distrito en índice ${numeroGrupo - 1}:`, 'color: #999; font-size: 11px', distritoActual);
    
    if (!distritoActual) {
      console.log(`%c⚠️ No existe distrito B.${numeroGrupo}. Distritos disponibles: ${distritos.length}`, 'color: #f59e0b; font-weight: bold');
      return;
    }
    
    console.log(`%c🗺️ GRUPO AISI: B.${numeroGrupo} - ${distritoActual.nombre || 'Sin nombre'}`, 'color: #dc2626; font-weight: bold; font-size: 14px');
    console.log(`%cCentros Poblados (CCPP):`, 'color: #b91c1c; font-weight: bold');
    
    // Verificar qué contiene centrosPobladosSeleccionados
    const centrosPobladosSeleccionados = distritoActual.centrosPobladosSeleccionados || [];
    console.log(`[DEBUG AISI] centrosPobladosSeleccionados:`, centrosPobladosSeleccionados);
    
    if (centrosPobladosSeleccionados.length === 0) {
      console.log('  (Sin centros poblados asignados)');
      console.log('%c[INFO AISI] Debes asignar centros poblados a este distrito en la sección 2', 'color: #f59e0b; font-size: 11px');
      return;
    }
    
    // Si centrosPobladosSeleccionados contiene strings (códigos), buscar en jsonCompleto
    const jsonCompleto = datos['jsonCompleto'] || {};
    const centrosDetalles: any[] = [];
    
    centrosPobladosSeleccionados.forEach((codigo: any, index: number) => {
      // Buscar en jsonCompleto
      let encontrado = false;
      Object.keys(jsonCompleto).forEach((grupoKey: string) => {
        const grupoData = jsonCompleto[grupoKey];
        if (Array.isArray(grupoData)) {
          const centro = grupoData.find((c: any) => {
            const codigoCentro = String(c.CODIGO || '').trim();
            const codigoBuscado = String(codigo).trim();
            return codigoCentro === codigoBuscado;
          });
          if (centro && !encontrado) {
            centrosDetalles.push(centro);
            encontrado = true;
          }
        }
      });
      
      if (!encontrado) {
        console.log(`  [DEBUG AISI] Centro con código ${codigo} no encontrado en jsonCompleto`);
      }
    });
    
    if (centrosDetalles.length > 0) {
      centrosDetalles.forEach((cp: any, index: number) => {
        const nombre = cp.CCPP || cp.nombre || `CCPP ${index + 1}`;
        console.log(`  ${index + 1}. ${nombre} (Código: ${cp.CODIGO})`);
      });
    } else {
      console.log('  (Sin centros poblados encontrados en el JSON)');
    }
  }

  private obtenerRegExp(pattern: string): RegExp {
    if (!this.regexCache.has(pattern)) {
      this.regexCache.set(pattern, new RegExp(pattern, 'g'));
    }
    return this.regexCache.get(pattern)!;
  }

  private compararValores(actual: any, anterior: any): boolean {
    if (actual === anterior) return true;
    if (actual == null || anterior == null) return actual === anterior;
    if (typeof actual !== typeof anterior) return false;
    if (typeof actual !== 'object') return actual === anterior;
    if (Array.isArray(actual) !== Array.isArray(anterior)) return false;
    if (Array.isArray(actual)) {
      if (actual.length !== anterior.length) return false;
      for (let i = 0; i < actual.length; i++) {
        if (!this.compararValores(actual[i], anterior[i])) return false;
      }
      return true;
    }
    const keysActual = Object.keys(actual);
    const keysAnterior = Object.keys(anterior);
    if (keysActual.length !== keysAnterior.length) return false;
    for (const key of keysActual) {
      if (!keysAnterior.includes(key)) return false;
      if (!this.compararValores(actual[key], anterior[key])) return false;
    }
    return true;
  }

  private clonarValor(valor: any): any {
    if (valor == null || typeof valor !== 'object') return valor;
    if (Array.isArray(valor)) {
      return valor.map(item => this.clonarValor(item));
    }
    const clon: any = {};
    for (const key in valor) {
      if (valor.hasOwnProperty(key)) {
        clon[key] = this.clonarValor(valor[key]);
      }
    }
    return clon;
  }
}



