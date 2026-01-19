import { Component, Input, ChangeDetectorRef, OnDestroy, SimpleChanges } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { StateService } from 'src/app/core/services/state.service';
import { AutocompleteService, AutocompleteData } from 'src/app/core/services/autocomplete.service';
import { CentrosPobladosActivosService } from 'src/app/core/services/centros-poblados-activos.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { GroupValidationService } from 'src/app/core/services/group-validation.service';
import { ProvinciaDinamicaService } from 'src/app/core/services/provincia-dinamica.service';
import { ProvinciasDinamicas } from 'src/app/core/models/provincia-dynamic.model';
import { Grupo } from 'src/app/core/models/group-config.model';
import { ComunidadCampesina, Distrito } from 'src/app/core/models/formulario.model';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

type CampoEntidad = 'comunidadesCampesinas' | 'distritosAISI';

@Component({
  selector: 'app-seccion2',
  templateUrl: './seccion2.component.html',
  styleUrls: ['./seccion2.component.css']
})

export class Seccion2Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.2';
  @Input() override modoFormulario: boolean = false;
  
  // Propiedades dinámicas para provincias
  provinciasDinamicas: ProvinciasDinamicas = {};
  provinciasOrdenadas: string[] = [];
  
  distritosDisponibles: string[] = [];
  distritosSeleccionados: { [key: string]: string } = {};
  seccionesAISI: number[] = [];
  distritosDisponiblesAISI: string[] = [];
  distritosAISI: Distrito[] = [];
  comunidadesCampesinas: ComunidadCampesina[] = [];
  
  // Flags para evitar reinicialización múltiple
  private _distritosAISICargados = false;
  private _comunidadesCargadas = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaSeccion2';
  
  fotografiasSeccion2: FotoItem[] = [];
  private stateSubscription?: Subscription;
  autocompleteData: { [key: string]: AutocompleteData } = {};
  
  override watchedFields: string[] = [
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
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    private stateService: StateService,
    private autocompleteService: AutocompleteService,
    private centrosPobladosActivos: CentrosPobladosActivosService,
    private groupConfig: GroupConfigService,
    private groupValidation: GroupValidationService,
    private provinciaDinamicaService: ProvinciaDinamicaService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override onInitCustom(): void {
    // Primero detectar provincias dinámicamente
    this.detectarProvinciasDinamicas();
    // Detectar distritos y comunidades
    this.detectarDistritosAISI();
    this.detectarComunidadesCampesinas();
    // Luego cargar las secciones AISI
    this.cargarSeccionesAISI();
    this.sincronizarCongrupConfigService();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.actualizarDatos();
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  /**
   * Sincroniza la configuración actual con GroupConfigService
   * Crea objetos Grupo desde las comunidades campesinas y distritos
   */
  private sincronizarCongrupConfigService(): void {
    try {
      // Sincronizar AISD (Comunidades Campesinas)
      const grupoAISD = this.construirGrupoAISD();
      if (grupoAISD) {
        this.groupConfig.setAISD(grupoAISD);
      }

      const grupoAISI = this.construirGrupoAISI();
      if (grupoAISI) {
        this.groupConfig.setAISI(grupoAISI);
      }
    } catch (error) {
      console.error('[Seccion2] Error sincronizando con GroupConfigService:', error);
    }
  }

  private construirGrupoAISD(): Grupo | null {
    if (!this.comunidadesCampesinas || this.comunidadesCampesinas.length === 0) {
      return null;
    }

    const nombres = this.comunidadesCampesinas
      .map((comunidad, index) => {
        const nombreLimpio = comunidad.nombre?.trim();
        const numero = index + 1;
        return nombreLimpio ? `A.${numero} ${nombreLimpio}` : `A.${numero}`;
      })
      .filter(Boolean);

    if (nombres.length === 0) {
      return null;
    }

    const codigosActivos = this.unirCodigosSeleccionados(this.comunidadesCampesinas);

    return {
      nombre: nombres.join(' / '),
      tipo: 'AISD',
      ccppList: [],
      ccppActivos: codigosActivos
    };
  }

  private construirGrupoAISI(): Grupo | null {
    if (!this.distritosAISI || this.distritosAISI.length === 0) {
      return null;
    }

    const nombres = this.distritosAISI
      .map((distrito, index) => {
        const nombreLimpio = distrito.nombre?.trim();
        const numero = index + 1;
        const sufijo = nombreLimpio ? ` ${nombreLimpio}` : '';
        return `B.${numero}${sufijo}`;
      })
      .filter(Boolean);

    if (nombres.length === 0) {
      return null;
    }

    const codigosActivos = this.unirCodigosSeleccionados(this.distritosAISI);

    return {
      nombre: nombres.join(' / '),
      tipo: 'AISI',
      ccppList: [],
      ccppActivos: codigosActivos
    };
  }

  private unirCodigosSeleccionados(entities: Array<ComunidadCampesina | Distrito>): string[] {
    const codigoSet = new Set<string>();
    entities.forEach(entity => {
      (entity.centrosPobladosSeleccionados || []).forEach(codigo => {
        const valor = codigo?.toString().trim();
        if (valor) {
          codigoSet.add(valor);
        }
      });
    });
    return Array.from(codigoSet);
  }

  private normalizarCodigo(codigo: string): string {
    return (codigo || '').toString().trim();
  }

  private toggleCentroPobladoEnLista<T extends ComunidadCampesina | Distrito>(entities: T[], id: string, codigo: string): string[] | null {
    const entidad = entities.find(entry => entry.id === id);
    if (!entidad) {
      return null;
    }

    const codigoNormalizado = this.normalizarCodigo(codigo);
    if (!codigoNormalizado) {
      return entidad.centrosPobladosSeleccionados || [];
    }

    const centrosActuales = entidad.centrosPobladosSeleccionados || [];
    const yaSeleccionado = centrosActuales.some(c => c === codigoNormalizado);
    entidad.centrosPobladosSeleccionados = yaSeleccionado
      ? centrosActuales.filter((c: string) => c !== codigoNormalizado)
      : [...centrosActuales, codigoNormalizado];

    return entidad.centrosPobladosSeleccionados;
  }

  private actualizarEntidadConCodigos(field: CampoEntidad, nuevasEntidades: Array<ComunidadCampesina | Distrito>, marcarCambios: boolean = false): void {
    if (field === 'comunidadesCampesinas') {
      this.comunidadesCampesinas = nuevasEntidades as ComunidadCampesina[];
    } else {
      this.distritosAISI = nuevasEntidades as Distrito[];
    }

    this.datos[field] = nuevasEntidades;
    this.formularioService.actualizarDato(field as any, nuevasEntidades);
    this.stateService.setDatos(this.formularioService.obtenerDatos());

    if (marcarCambios) {
      this.cdRef.markForCheck();
      this.cdRef.detectChanges();
    }
  }

  private aplicarCodigosAEntidad<T extends ComunidadCampesina | Distrito>(
    field: CampoEntidad,
    entidades: T[],
    id: string,
    codigos: string[],
    marcarCambios: boolean = false
  ): void {
    const nuevasEntidades = entidades.map(entidad => 
      entidad.id === id ? { ...entidad, centrosPobladosSeleccionados: [...codigos] } : entidad
    );
    this.actualizarEntidadConCodigos(field, nuevasEntidades, marcarCambios);
  }


  override ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  protected override onChangesCustom(changes: SimpleChanges): void {
    if (changes['modoFormulario'] && !this.modoFormulario) {
      setTimeout(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  protected override detectarCambios(): boolean {
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

    if (necesitaRecargar && hayCambios) {
      this.loadSectionData();
    }

    return hayCambios;
  }

  protected override actualizarValoresConPrefijo(): void {
    this.watchedFields.forEach(campo => {
      this.datosAnteriores[campo] = (this.datos as any)[campo] || null;
    });
  }

  protected override actualizarDatosCustom(): void {
    // Cargar distritos AISI desde localStorage
    const distritosGuardados = this.datos['distritosAISI'] || [];
    
    console.log('[Seccion2] 📥 Cargando distritosAISI desde datos:', JSON.stringify(distritosGuardados));
    
    if (distritosGuardados.length > 0 && Array.isArray(distritosGuardados)) {
      this.distritosAISI = distritosGuardados.map((d: Distrito) => ({
        ...d,
        nombreOriginal: d.nombreOriginal || d.nombre,
        centrosPobladosSeleccionados: (d.centrosPobladosSeleccionados || []).map((c: any) => {
          if (c === null || c === undefined) return '';
          return c.toString().trim();
        }).filter((codigo: string) => codigo !== '')
      }));
      
      console.log('[Seccion2] ✅ Distritos cargados exitosamente:', JSON.stringify(this.distritosAISI));
      
      if (this.distritosAISI.length > 0 && this.distritosAISI[0].nombre) {
        const primerDistritoNombre = this.distritosAISI[0].nombre;
        if (!this.datos['centroPobladoAISI'] || this.datos['centroPobladoAISI'] !== primerDistritoNombre) {
          this.datos['centroPobladoAISI'] = primerDistritoNombre;
          this.formularioService.actualizarDato('centroPobladoAISI', primerDistritoNombre);
        }
      }
    } else {
      console.log('[Seccion2] ⚠️ No hay distritosAISI guardados, detectando...');
      this.detectarDistritosAISI();
    }
    
    // Cargar comunidades campesinas desde localStorage
    const comunidadesGuardadas = this.datos['comunidadesCampesinas'] || [];
    if (comunidadesGuardadas.length > 0) {
      this.comunidadesCampesinas = comunidadesGuardadas.map((cc: ComunidadCampesina) => ({
        ...cc,
        centrosPobladosSeleccionados: (cc.centrosPobladosSeleccionados || []).map((c: any) => {
          if (c === null || c === undefined) return '';
          return c.toString().trim();
        }).filter((codigo: string) => codigo !== '')
      }));
    } else {
      this.detectarComunidadesCampesinas();
      
      if (this.comunidadesCampesinas.length === 0) {
        if (this.datos['grupoAISD']) {
          this.comunidadesCampesinas = [{
            id: 'cc_legacy',
            nombre: this.datos['grupoAISD'],
            centrosPobladosSeleccionados: this.datos['centrosPobladosSeleccionadosAISD'] || []
          }];
        } else {
          const centrosPobladosJSON = this.datos['centrosPobladosJSON'] || [];
          if (centrosPobladosJSON.length > 0) {
            const codigos = centrosPobladosJSON
              .map((cp: any) => {
                const codigo = cp.CODIGO;
                if (codigo === null || codigo === undefined) return '';
                return codigo.toString().trim();
              })
              .filter((codigo: string) => codigo !== '');
            
            this.comunidadesCampesinas = [{
              id: `cc_default_${Date.now()}`,
              nombre: '',
              centrosPobladosSeleccionados: codigos
            }];
            this.datos['comunidadesCampesinas'] = this.comunidadesCampesinas;
            this.formularioService.actualizarDato('comunidadesCampesinas', this.comunidadesCampesinas);
          }
        }
      }
    }
    
    this.cargarFotografias();
  }

  override getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
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
    return this.distritosAISI.map(d => d.nombre) || [];
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

    // Si jsonData es un objeto con claves (formato nuevo)
    if (jsonData && typeof jsonData === 'object' && !Array.isArray(jsonData)) {
      Object.keys(jsonData).forEach(key => {
        // Remover prefijo "CCPP " si existe
        let distritoNombre = key.trim();
        if (distritoNombre.toUpperCase().startsWith('CCPP ')) {
          distritoNombre = distritoNombre.substring(5).trim();
        }
        if (distritoNombre) {
          distritosSet.add(distritoNombre);
        }
      });
    }
    
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
    console.log('[Seccion2.cargarSeccionesAISI] Iniciando...');
    console.log('[Seccion2.cargarSeccionesAISI] distritosAISI actuales:', JSON.stringify(this.distritosAISI.map(d => ({ id: d.id, nombre: d.nombre, centros: d.centrosPobladosSeleccionados.length }))));
    
    // Mantener compatibilidad con secciones AISI (legacy)
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
    
    // Sincronizar con GroupConfigService
    if (seccion === 1) {
      const ccppActivos = this.distritosAISI.length > 0 
        ? this.distritosAISI[0].centrosPobladosSeleccionados || []
        : [];
      const grupoAISI = {
        nombre: distrito,
        tipo: 'AISI' as const,
        ccppList: [],
        ccppActivos: ccppActivos
      };
      this.groupConfig.setAISI(grupoAISI);
    }
    
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
    console.log('[Seccion2] ✅ guardarDistritosAISI guardado:', JSON.stringify(this.distritosAISI));
    this.datos['distritosAISI'] = this.distritosAISI;
    this.formularioService.actualizarDato('distritosAISI', this.distritosAISI);
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
      
      // Sincronizar AISD con GroupConfigService
      if (indiceComunidad === 0) {
        const cc = this.comunidadesCampesinas[indiceComunidad];
        if (cc.nombre) {
          const grupoAISD = {
            nombre: cc.nombre,
            tipo: 'AISD' as const,
            ccppList: [],
            ccppActivos: codigosSeleccionados
          };
          this.groupConfig.setAISD(grupoAISD);
        }
      }
    }
  }

  agregarComunidadCampesina(): void {
    const nuevaComunidad: ComunidadCampesina = {
      id: `cc_${Date.now()}`,
      nombre: '',
      centrosPobladosSeleccionados: [],
      esNueva: true
    };
    this.comunidadesCampesinas.push(nuevaComunidad);
    this.datos['comunidadesCampesinas'] = this.comunidadesCampesinas;
    this.formularioService.actualizarDato('comunidadesCampesinas', this.comunidadesCampesinas);
    this.stateService.setDatos(this.formularioService.obtenerDatos());
    this.actualizarDatos();
  }

  eliminarComunidadCampesina(id: string): void {
    if (this.comunidadesCampesinas.length <= 1) {
      return;
    }
    
    const nuevasComunidades = this.comunidadesCampesinas.filter(cc => cc.id !== id);
    
    this.comunidadesCampesinas = nuevasComunidades;
    this.datos['comunidadesCampesinas'] = nuevasComunidades;
    this.formularioService.actualizarDato('comunidadesCampesinas', nuevasComunidades);
    this.stateService.setDatos(this.formularioService.obtenerDatos());
    
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  actualizarNombreComunidad(id: string, nombre: string): void {
    // Crear nuevo array con la comunidad actualizada
    this.comunidadesCampesinas = this.comunidadesCampesinas.map(cc => {
      if (cc.id === id) {
        return {
          ...cc,
          nombre: nombre,
          esNueva: !nombre || nombre.trim() === '' ? cc.esNueva : false
        };
      }
      return cc;
    });
    
    this.datos['comunidadesCampesinas'] = this.comunidadesCampesinas;
    this.formularioService.actualizarDato('comunidadesCampesinas', this.comunidadesCampesinas);
    const datosActuales = this.formularioService.obtenerDatos();
    this.stateService.setDatos(datosActuales);
  }

  obtenerCentrosPobladosSeleccionadosComunidad(id: string): string[] {
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    return comunidad?.centrosPobladosSeleccionados || [];
  }

  estaCentroPobladoSeleccionadoComunidad(id: string, codigo: string): boolean {
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    if (!comunidad || !comunidad.centrosPobladosSeleccionados) {
      return false;
    }
    const codigoNormalizado = codigo?.toString().trim() || '';
    return comunidad.centrosPobladosSeleccionados.some(
      (c: string) => c?.toString().trim() === codigoNormalizado
    );
  }

  toggleCentroPobladoComunidad(id: string, codigo: string): void {
    const nuevosCentros = this.toggleCentroPobladoEnLista(this.comunidadesCampesinas, id, codigo);
    if (!nuevosCentros) {
      return;
    }

    this.actualizarEntidadConCodigos('comunidadesCampesinas', [...this.comunidadesCampesinas]);
    
    const prefijo = this.obtenerPrefijoDeComunidad(id);
    if (prefijo) {
      this.centrosPobladosActivos.actualizarCodigosActivos(id, nuevosCentros);
    }
  }

  private obtenerPrefijoDeComunidad(comunidadId: string): string {
    const indice = this.comunidadesCampesinas.findIndex(cc => cc.id === comunidadId);
    if (indice >= 0) {
      return `_A${indice + 1}`;
    }
    return '';
  }

  seleccionarTodosCentrosPobladosComunidad(id: string): void {
    const datos = this.formularioService.obtenerDatos();
    const jsonCompleto = datos['jsonCompleto'];
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    
    if (!comunidad) {
      return;
    }

    let codigos: string[] = [];

    if (jsonCompleto && typeof jsonCompleto === 'object' && !Array.isArray(jsonCompleto)) {
      const nombreGrupo = comunidad.nombre;
      const grupoOriginal = Object.keys(jsonCompleto).find(key => {
        const keySinPrefijo = key.toUpperCase().startsWith('CCPP ') ? key.substring(5).trim() : key;
        return keySinPrefijo === nombreGrupo || key === nombreGrupo;
      });
      
      if (grupoOriginal && jsonCompleto[grupoOriginal] && Array.isArray(jsonCompleto[grupoOriginal])) {
        codigos = jsonCompleto[grupoOriginal]
          .map((cp: any) => {
            const codigo = cp.CODIGO;
            if (codigo === null || codigo === undefined) return '';
            return codigo.toString().trim();
          })
          .filter((codigo: string) => codigo !== '');
      }
    }
    
    if (codigos.length === 0) {
      const centrosPobladosJSON = datos['centrosPobladosJSON'] || [];
      codigos = centrosPobladosJSON
        .map((cp: any) => {
          const codigo = cp.CODIGO;
          if (codigo === null || codigo === undefined) return '';
          return codigo.toString().trim();
        })
        .filter((codigo: string) => codigo !== '');
    }

    if (codigos.length === 0) {
      return;
    }

    this.aplicarCodigosAEntidad('comunidadesCampesinas', this.comunidadesCampesinas, id, codigos, true);
    
    const prefijo = this.obtenerPrefijoDeComunidad(id);
    if (prefijo) {
      this.centrosPobladosActivos.actualizarCodigosActivos(id, codigos);
    }
  }

  deseleccionarTodosCentrosPobladosComunidad(id: string): void {
    const comunidad = this.comunidadesCampesinas.find(cc => cc.id === id);
    if (!this.comunidadesCampesinas.some(cc => cc.id === id)) {
      return;
    }

    this.aplicarCodigosAEntidad('comunidadesCampesinas', this.comunidadesCampesinas, id, [], true);
    
    const prefijo = this.obtenerPrefijoDeComunidad(id);
    if (prefijo) {
      this.centrosPobladosActivos.actualizarCodigosActivos(id, []);
    }
  }

  // Métodos para DISTRITOS (AISI)
  agregarDistritoAISI(): void {
    if (this.distritosDisponiblesAISI.length === 0) {
      return;
    }
    const todosLosCCPP = this.obtenerTodosLosCentrosPoblados()
      .map((cp: any) => cp.CODIGO?.toString() || '')
      .filter((codigo: string) => codigo !== '');
    
    const nuevoDistrito: Distrito = {
      id: `dist_${Date.now()}_${Math.random()}`,
      nombre: '',
      nombreOriginal: '',
      centrosPobladosSeleccionados: todosLosCCPP
    };
    this.distritosAISI.push(nuevoDistrito);
    this.datos['distritosAISI'] = this.distritosAISI;
    this.formularioService.actualizarDato('distritosAISI', this.distritosAISI);
    this.onFieldChange('distritosAISI', this.distritosAISI);
    this.actualizarDatos();
  }

  eliminarDistritoAISI(id: string): void {
    if (this.distritosAISI.length <= 1) {
      return;
    }
    
    const nuevosDistritos = this.distritosAISI.filter(d => d.id !== id);
    this.distritosAISI = nuevosDistritos;
    this.datos['distritosAISI'] = nuevosDistritos;
    this.formularioService.actualizarDato('distritosAISI', nuevosDistritos);
    this.onFieldChange('distritosAISI', nuevosDistritos);
    this.actualizarDatos();
  }

  actualizarNombreDistrito(id: string, nombre: string): void {
    console.log('[Seccion2] 📝 actualizarNombreDistrito LLAMADO:', id, 'nombre:', nombre);
    console.log('[Seccion2] 📊 Distritos antes:', JSON.stringify(this.distritosAISI.map(d => ({ id: d.id, nombre: d.nombre }))));
    
    // Crear nuevo array con el distrito actualizado
    this.distritosAISI = this.distritosAISI.map(d => {
      if (d.id === id) {
        const nombreOriginal = !d.nombreOriginal || d.nombreOriginal.trim() === '' 
          ? (d.nombre && d.nombre.trim() !== '' ? d.nombre : nombre)
          : d.nombreOriginal;
        
        console.log('[Seccion2] 🔄 Actualizando:', { id, nombreOriginal, nuevoNombre: nombre });
        
        return {
          ...d,
          nombreOriginal: nombreOriginal,
          nombre: nombre,
          esNuevo: !nombre || nombre.trim() === '' ? d.esNuevo : false
        };
      }
      return d;
    });
    
    console.log('[Seccion2] 📊 Distritos después:', JSON.stringify(this.distritosAISI.map(d => ({ id: d.id, nombre: d.nombre }))));
    
    this.datos['distritosAISI'] = this.distritosAISI;
    console.log('[Seccion2] 💾 Guardando en formularioService...');
    this.formularioService.actualizarDato('distritosAISI', this.distritosAISI);
    
    const indiceDistrito = this.distritosAISI.findIndex(d => d.id === id);
    if (indiceDistrito === 0 || this.distritosAISI.length === 1) {
      this.datos['centroPobladoAISI'] = nombre;
      this.formularioService.actualizarDato('centroPobladoAISI', nombre);
    }
    
    this.sincronizarCongrupConfigService();
    const datosActuales = this.formularioService.obtenerDatos();
    this.stateService.setDatos(datosActuales);
  }

  estaCentroPobladoSeleccionadoDistrito(id: string, codigo: string): boolean {
    const distrito = this.distritosAISI.find(d => d.id === id);
    if (!distrito || !distrito.centrosPobladosSeleccionados) {
      return false;
    }
    const codigoNormalizado = codigo?.toString().trim() || '';
    return distrito.centrosPobladosSeleccionados.some(
      (c: string) => c?.toString().trim() === codigoNormalizado
    );
  }

  toggleCentroPobladoDistrito(id: string, codigo: string): void {
    console.log('[Seccion2] ☑️ Toggle CP:', codigo);
    const distrito = this.distritosAISI.find(d => d.id === id);
    
    const nuevosCentros = this.toggleCentroPobladoEnLista(this.distritosAISI, id, codigo);
    
    if (!nuevosCentros) {
      console.warn('[Seccion2] ❌ toggle retornó null');
      return;
    }

    this.actualizarEntidadConCodigos('distritosAISI', [...this.distritosAISI]);
    this.sincronizarCongrupConfigService();
  }

  seleccionarTodosCentrosPobladosDistrito(id: string): void {
    const distrito = this.distritosAISI.find(d => d.id === id);
    if (!distrito) {
      return;
    }

    const ccppDisponibles = this.obtenerCentrosPobladosDisponiblesParaDistrito(distrito.nombreOriginal || distrito.nombre);
    const codigos = ccppDisponibles
      .map((cp: any) => cp.CODIGO?.toString() || '')
      .filter((codigo: string) => codigo !== '');

    const nuevosDistritos = this.distritosAISI.map(d => 
      d.id === id ? { ...d, centrosPobladosSeleccionados: codigos } : d
    );
    
    this.aplicarCodigosAEntidad('distritosAISI', this.distritosAISI, id, codigos, true);
    this.sincronizarCongrupConfigService();
  }

  deseleccionarTodosCentrosPobladosDistrito(id: string): void {
    this.aplicarCodigosAEntidad('distritosAISI', this.distritosAISI, id, []);
    this.sincronizarCongrupConfigService();
  }

  trackByDistritoId(index: number, distrito: Distrito): string {
    return distrito.id;
  }

  cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasSeccion2 = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = this.fotografiasSeccion2;
  }

  onFotografiasChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.imageService.saveImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      fotografias,
      groupPrefix
    );
    this.fotografiasSeccion2 = [...fotografias];
    this.fotografiasCache = [...fotografias];
    this.fotografiasFormMulti = [...fotografias];
    this.cdRef.detectChanges();
  }

  obtenerTextoSeccion2Introduccion(): string {
    if (this.datos.parrafoSeccion2_introduccion) {
      return this.datos.parrafoSeccion2_introduccion;
    }
    
    return 'En términos generales, la delimitación del ámbito de estudio de las áreas de influencia social se hace tomando en consideración a los agentes e instancias sociales, individuales y/o colectivas, públicas y/o privadas, que tengan derechos o propiedad sobre el espacio o los recursos respecto de los cuales el proyecto de exploración minera tiene incidencia.\n\nAsimismo, el área de influencia social de un Proyecto tiene en consideración a los grupos de interés que puedan ser potencialmente afectadas por el desarrollo de dicho proyecto (según La Guía de Relaciones Comunitarias de la DGAAM del MINEM, se denomina "grupos de interés" a aquellos grupos humanos que son impactados por dicho Proyecto).\n\nEl criterio social para la delimitación de un área de influencia debe tener en cuenta la influencia que el Proyecto pudiera tener sobre el entorno social, que será o no ambientalmente impactado, considerando también la posibilidad de generar otro tipo de impactos, expectativas, intereses y/o demandas del entorno social.\n\nEn base a estos criterios se han identificado las áreas de influencia social directa e indirecta:';
  }

  obtenerTextoSeccion2AISDCompleto(): string {
    if (this.datos.parrafoSeccion2_aisd_completo) {
      return this.datos.parrafoSeccion2_aisd_completo;
    }
    
    const comunidades = this.obtenerComunidadesCampesinas();
    const tieneUna = comunidades.length === 1;
    const tieneMultiples = comunidades.length > 1;
    const textoComunidades = this.obtenerTextoComunidades();
    const distrito = this.datos.distritoSeleccionado || '____';
    const aisd1 = this.datos.aisdComponente1 || '____';
    const aisd2 = this.datos.aisdComponente2 || '____';
    const departamento = this.datos.departamentoSeleccionado || '____';
    
    let texto = `El Área de influencia social directa (AISD) se delimita en torno a ${tieneUna ? 'la comunidad campesina (CC)' : 'las comunidades campesinas (CC)'} ${textoComunidades}`;
    texto += tieneUna 
      ? `, cuya área comunal se encuentra predominantemente en el distrito de ${distrito} y en menor proporción en los distritos de ${aisd1} y de ${aisd2}, pertenecientes al departamento de ${departamento}`
      : `, cuyas áreas comunales se encuentran predominantemente en el distrito de ${distrito} y en menor proporción en los distritos de ${aisd1} y de ${aisd2}, pertenecientes al departamento de ${departamento}`;
    texto += `. La delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales. ${this.obtenerTextoComunidadesPosesion()} y gestiona${tieneMultiples ? 'n' : ''} las tierras donde se llevará a cabo la exploración minera, lo que implica una relación directa y significativa con el Proyecto.\n\n`;
    texto += `La titularidad de estas tierras establece un vínculo crucial con los pobladores locales, ya que cualquier actividad realizada en el área puede influir directamente sus derechos, usos y costumbres asociados a la tierra. Además, la gestión y administración de estos terrenos por parte de ${this.obtenerTextoComunidadesSingular()} requiere${tieneMultiples ? 'n' : ''} una consideración detallada en la planificación y ejecución del Proyecto, asegurando que las operaciones se lleven a cabo con respeto a la estructura organizativa y normativa de ${tieneUna ? 'la comunidad' : 'las comunidades'}.\n\n`;
    texto += `Los impactos directos en ${this.obtenerPrefijoCCImpactos()}${this.obtenerTextoComunidadesImpactos()}, derivados del proyecto de exploración minera, incluyen la contratación de mano de obra local, la interacción con las costumbres y autoridades, y otros efectos socioeconómicos y culturales. La generación de empleo local no solo proporcionará oportunidades económicas inmediatas, sino que también fomentará el desarrollo de habilidades y capacidades en la población. La interacción constante con las autoridades y ${tieneUna ? 'la comunidad' : 'las comunidades'} promoverá${tieneMultiples ? 'n' : ''} un diálogo y una cooperación que son esenciales para el éxito del Proyecto, respetando y adaptándose a las prácticas y tradiciones locales. La consideración de estos factores en la delimitación del AISD garantiza que el Proyecto avance de manera inclusiva y sostenible, alineado con las expectativas y necesidades de ${this.obtenerPrefijoCCFinal()}${this.obtenerTextoComunidadesFinal()}.`;
    
    return texto;
  }

  obtenerTextoSeccion2AISICompleto(): string {
    if (this.datos.parrafoSeccion2_aisi_completo) {
      return this.datos.parrafoSeccion2_aisi_completo;
    }
    
    const distritosAISI = this.obtenerDistritosSeleccionadosAISI();
    const tieneUnDistrito = distritosAISI.length === 1;
    const tieneMultiplesDistritos = distritosAISI.length > 1;
    const textoAISI = this.obtenerTextoAISI() || '____';
    
    if (tieneUnDistrito) {
      return `El Área de influencia social indirecta (AISI) se delimita en torno a la capital distrital de la jurisdicción de ${textoAISI}. Esta localidad se considera dentro del AISI debido a su función como centro administrativo y político de su respectivo distrito. Como capital distrital, el Centro Poblado (CP) ${textoAISI} es un punto focal para la interacción con las autoridades locales, quienes jugarán un papel crucial en la gestión y supervisión de las actividades del Proyecto. Además, la adquisición de bienes y servicios esporádicos en este centro poblado será esencial para el soporte logístico, lo que justifica su inclusión en el AISI.\n\nLa delimitación también se basa en la necesidad de establecer un diálogo continuo y efectivo con las autoridades políticas locales en el distrito de ${textoAISI}. Esta interacción es vital para asegurar que las operaciones del Proyecto sean transparentes y alineadas con las normativas locales y las expectativas de la población. Asimismo, la compra esporádica de suministros y la contratación de servicios en este centro poblado contribuirá al dinamismo económico de la capital distrital, generando beneficios indirectos para esta población. De esta manera, la delimitación del AISI considera tanto la dimensión administrativa y política como la económica, garantizando un enfoque integral y sostenible en la implementación del Proyecto.`;
    } else if (tieneMultiplesDistritos) {
      return `El Área de influencia social indirecta (AISI) se delimita en torno a las capitales distritales de las jurisdicciones de ${textoAISI}. Estas localidades se consideran dentro del AISI debido a su función como centros administrativos y políticos de sus respectivos distritos. Como capitales distritales, los Centros Poblados (CP) de ${textoAISI} son puntos focales para la interacción con las autoridades locales, quienes jugarán un papel crucial en la gestión y supervisión de las actividades del Proyecto. Además, la adquisición de bienes y servicios esporádicos en estos centros poblados será esencial para el soporte logístico, lo que justifica su inclusión en el AISI.\n\nLa delimitación también se basa en la necesidad de establecer un diálogo continuo y efectivo con las autoridades políticas locales en los distritos de ${textoAISI}. Esta interacción es vital para asegurar que las operaciones del Proyecto sean transparentes y alineadas con las normativas locales y las expectativas de la población. Asimismo, la compra esporádica de suministros y la contratación de servicios en estos centros poblados contribuirá al dinamismo económico de las capitales distritales, generando beneficios indirectos para esta población. De esta manera, la delimitación del AISI considera tanto la dimensión administrativa y política como la económica, garantizando un enfoque integral y sostenible en la implementación del Proyecto.`;
    }
    
    return `El Área de influencia social indirecta (AISI) se delimita en torno a la capital distrital de la jurisdicción de ${textoAISI}. Esta localidad se considera dentro del AISI debido a su función como centro administrativo y político de su respectivo distrito. Como capital distrital, el Centro Poblado (CP) ${textoAISI} es un punto focal para la interacción con las autoridades locales, quienes jugarán un papel crucial en la gestión y supervisión de las actividades del Proyecto. Además, la adquisición de bienes y servicios esporádicos en este centro poblado será esencial para el soporte logístico, lo que justifica su inclusión en el AISI.\n\nLa delimitación también se basa en la necesidad de establecer un diálogo continuo y efectivo con las autoridades políticas locales en el distrito de ${textoAISI}. Esta interacción es vital para asegurar que las operaciones del Proyecto sean transparentes y alineadas con las normativas locales y las expectativas de la población. Asimismo, la compra esporádica de suministros y la contratación de servicios en este centro poblado contribuirá al dinamismo económico de la capital distrital, generando beneficios indirectos para esta población. De esta manera, la delimitación del AISI considera tanto la dimensión administrativa y política como la económica, garantizando un enfoque integral y sostenible en la implementación del Proyecto.`;
  }

  /**
   * Detecta las provincias dinámicamente del JSON
   */
  private detectarProvinciasDinamicas(): void {
    const jsonCompleto = this.datos['jsonCompleto'];
    
    if (jsonCompleto && typeof jsonCompleto === 'object' && !Array.isArray(jsonCompleto)) {
      this.provinciasDinamicas = this.provinciaDinamicaService.analizarProvinciasDinamicas(jsonCompleto);
      this.provinciasOrdenadas = this.provinciaDinamicaService.obtenerProvinciasOrdenadas(this.provinciasDinamicas);
      
      console.log('[Seccion2] Provincias detectadas:', this.provinciasOrdenadas);
      console.log('[Seccion2] Detalle provincial:', this.provinciasDinamicas);
    }
  }

  /**
   * Obtiene los distritos para una provincia específica
   */
  obtenerDistritosParaProvincia(nombreProvincia: string): string[] {
    return this.provinciaDinamicaService.obtenerDistritosPorProvincia(this.provinciasDinamicas, nombreProvincia);
  }

  /**
   * Genera dinámicamente el párrafo AISD
   */
  generarParrafoAISDDinamico(): string {
    if (Object.keys(this.provinciasDinamicas).length === 0) {
      return '';
    }
    return this.provinciaDinamicaService.generarPárrafoAISD(this.provinciasDinamicas);
  }

  detectarDistritosAISI() {
    // Reiniciar flag para permitir recargar cuando hay datos guardados
    if (this.datos['distritosAISI'] && Array.isArray(this.datos['distritosAISI']) && this.datos['distritosAISI'].length > 0) {
      this._distritosAISICargados = false;
    }
    
    // Evitar ejecución múltiple (solo si no hay datos guardados)
    if (this._distritosAISICargados) {
      console.log('[Seccion2.detectarDistritosAISI] ⏭️ Ya se cargaron, SKIP');
      return;
    }
    
    // ⚠️ CRÍTICO: Primero intentar cargar distritos guardados
    const distritosGuardados = this.datos['distritosAISI'];
    console.log('[Seccion2.detectarDistritosAISI] distritosGuardados:', JSON.stringify(distritosGuardados));
    
    if (Array.isArray(distritosGuardados) && distritosGuardados.length > 0) {
      console.log('[Seccion2.detectarDistritosAISI] ✅ Cargando distritos guardados');
      this.distritosAISI = distritosGuardados.map((d: Distrito) => ({
        ...d,
        nombreOriginal: d.nombreOriginal || d.nombre,
        centrosPobladosSeleccionados: (d.centrosPobladosSeleccionados || [])
          .map((c: any) => c?.toString?.() || c)
          .filter((c: any) => c !== null && c !== undefined && c !== '')
      }));
      
      // Actualizar centro poblado al primero disponible
      if (this.distritosAISI.length > 0 && this.distritosAISI[0].nombre) {
        const primerDistritoNombre = this.distritosAISI[0].nombre;
        this.datos['centroPobladoAISI'] = primerDistritoNombre;
        this.formularioService.actualizarDato('centroPobladoAISI', primerDistritoNombre);
      }
      
      this._distritosAISICargados = true;
      console.log('[Seccion2.detectarDistritosAISI] ✅ FIN - Distritos cargados desde guardados');
      return;
    }
    
    // Si NO hay distritos guardados, CREAR nuevos
    console.log('[Seccion2.detectarDistritosAISI] 📝 Creando nuevos distritos...');
    
    const jsonCompleto = this.datos['jsonCompleto'];
    const distritosSet = new Set<string>();

    // Extraer los nombres de distrito del campo DIST de todos los centros poblados
    if (jsonCompleto && typeof jsonCompleto === 'object' && !Array.isArray(jsonCompleto)) {
      Object.keys(jsonCompleto).forEach(key => {
        const centrosPoblados = (jsonCompleto as any)[key];
        if (Array.isArray(centrosPoblados)) {
          centrosPoblados.forEach((cp: any) => {
            const nombreDistrito = cp.DIST || cp.dist;
            if (nombreDistrito && typeof nombreDistrito === 'string') {
              distritosSet.add(nombreDistrito.trim());
            }
          });
        }
      });
    }

    this.distritosDisponiblesAISI = Array.from(distritosSet).sort();

    if (this.distritosAISI.length === 0 && this.distritosDisponiblesAISI.length > 0) {
      this.distritosAISI = [];
      
      // Crear un distrito por cada distrito disponible con todos sus CCPP pre-seleccionados
      this.distritosDisponiblesAISI.forEach((nombreDistrito, index) => {
        const ccppDisponibles = this.obtenerCentrosPobladosDisponiblesParaDistrito(nombreDistrito);
        console.log(`[Seccion2] Distrito ${index + 1} "${nombreDistrito}" tiene ${ccppDisponibles.length} centros poblados`);
        
        const todosLosCCPP = ccppDisponibles
          .map((cp: any) => cp.CODIGO?.toString() || '')
          .filter((codigo: string) => codigo !== '');
        
        console.log(`[Seccion2] Códigos para Distrito ${index + 1}:`, JSON.stringify(todosLosCCPP));
        
        const nuevoDistrito: Distrito = {
          id: `dist_${Date.now()}_${Math.random()}`,
          nombre: nombreDistrito,
          nombreOriginal: nombreDistrito,
          centrosPobladosSeleccionados: todosLosCCPP,
          esNuevo: false  // false para que filtre correctamente por DIST
        };
        
        console.log(`[Seccion2] ✅ Distrito ${index + 1} creado:`, JSON.stringify({ nombre: nuevoDistrito.nombre, centros: nuevoDistrito.centrosPobladosSeleccionados.length }));
        this.distritosAISI.push(nuevoDistrito);
      });
      
      console.log('[Seccion2] 📊 Total de distritos creados:', this.distritosAISI.length);
      console.log('[Seccion2] 📋 Detalles:', JSON.stringify(this.distritosAISI.map(d => ({ nombre: d.nombre, centros: d.centrosPobladosSeleccionados.length }))));
      
      this.datos['distritosAISI'] = this.distritosAISI;
      this.formularioService.actualizarDato('distritosAISI', this.distritosAISI);
      
      if (this.distritosAISI.length > 0 && this.distritosAISI[0].nombre) {
        const primerDistritoNombre = this.distritosAISI[0].nombre;
        this.datos['centroPobladoAISI'] = primerDistritoNombre;
        this.formularioService.actualizarDato('centroPobladoAISI', primerDistritoNombre);
      }
    }
    
    this._distritosAISICargados = true;
  }

  detectarComunidadesCampesinas() {
    // Reiniciar flag para permitir recargar cuando hay datos guardados
    if (this.datos['comunidadesCampesinas'] && Array.isArray(this.datos['comunidadesCampesinas']) && this.datos['comunidadesCampesinas'].length > 0) {
      this._comunidadesCargadas = false;
    }
    
    // Evitar ejecución múltiple (solo si no hay datos guardados)
    if (this._comunidadesCargadas) {
      console.log('[Seccion2.detectarComunidadesCampesinas] ⏭️ Ya se cargaron, SKIP');
      return;
    }
    
    const jsonCompleto = this.datos['jsonCompleto'];
    const comunidadesDisponibles: string[] = [];

    // Extraer las claves del JSON (que representan comunidades campesinas)
    if (jsonCompleto && typeof jsonCompleto === 'object' && !Array.isArray(jsonCompleto)) {
      Object.keys(jsonCompleto).forEach(key => {
        let nombreComunidad = key.trim();
        // Remover prefijo "CCPP " si existe
        if (nombreComunidad.toUpperCase().startsWith('CCPP ')) {
          nombreComunidad = nombreComunidad.substring(5).trim();
        }
        if (nombreComunidad && Array.isArray((jsonCompleto as any)[key])) {
          comunidadesDisponibles.push(nombreComunidad);
        }
      });
    }

    const comunidadesGuardadasEnDatos = this.datos['comunidadesCampesinas'] || [];
    
    if (comunidadesGuardadasEnDatos.length > 0) {
      this.comunidadesCampesinas = comunidadesGuardadasEnDatos.map((cc: any) => ({
        ...cc,
        centrosPobladosSeleccionados: (cc.centrosPobladosSeleccionados || []).map((c: any) => {
          if (c === null || c === undefined) return '';
          return c.toString().trim();
        }).filter((codigo: string) => codigo !== '')
      }));
      this._comunidadesCargadas = true;
      console.log('[Seccion2.detectarComunidadesCampesinas] ✅ Cargadas desde storage');
      return;
    }

    let necesitaReinicializar = false;
    
    if (this.comunidadesCampesinas.length > 0) {
      const comunidadesGuardadas = this.comunidadesCampesinas
        .map(cc => cc.nombre.trim().toUpperCase())
        .filter(n => n !== '');
      const comunidadesValidasActualmente = comunidadesDisponibles.map(c => c.trim().toUpperCase());
      
      if (comunidadesGuardadas.length > 0) {
        const algunaComunidadInvalida = comunidadesGuardadas.some(c => !comunidadesValidasActualmente.includes(c));
        if (algunaComunidadInvalida) {
          necesitaReinicializar = true;
        }
      }
    } else if (comunidadesDisponibles.length > 0) {
      necesitaReinicializar = true;
    }

    if (necesitaReinicializar) {
      this.comunidadesCampesinas = [];
      
      comunidadesDisponibles.forEach(nombreComunidad => {
        // Obtener todos los CCPP de esta comunidad
        const ccppDisponibles = this.obtenerCentrosPobladosDeComunidadPorNombre(nombreComunidad);
        const todosLosCCPP = ccppDisponibles
          .map((cp: any) => cp.CODIGO?.toString() || '')
          .filter((codigo: string) => codigo !== '');
        
        const nuevaComunidad: ComunidadCampesina = {
          id: `cc_${Date.now()}_${Math.random()}`,
          nombre: nombreComunidad,
          centrosPobladosSeleccionados: todosLosCCPP
        };
        this.comunidadesCampesinas.push(nuevaComunidad);
      });
      
      this.datos['comunidadesCampesinas'] = this.comunidadesCampesinas;
      this.formularioService.actualizarDato('comunidadesCampesinas', this.comunidadesCampesinas);
    }
    
    this._comunidadesCargadas = true;
  }

  obtenerCentrosPobladosDeComunidadPorNombre(nombreComunidad: string): any[] {
    const jsonCompleto = this.datos['jsonCompleto'];
    
    if (!jsonCompleto || typeof jsonCompleto !== 'object' || Array.isArray(jsonCompleto)) {
      return [];
    }

    const nombreUpper = nombreComunidad.trim().toUpperCase();
    
    // Buscar la clave que corresponde a esta comunidad
    const keys = Object.keys(jsonCompleto);
    for (const key of keys) {
      let keySinPrefijo = key;
      if (key.toUpperCase().startsWith('CCPP ')) {
        keySinPrefijo = key.substring(5).trim();
      }
      
      if (keySinPrefijo.toUpperCase() === nombreUpper) {
        if (Array.isArray((jsonCompleto as any)[key])) {
          return (jsonCompleto as any)[key];
        }
      }
    }

    return [];
  }

  obtenerCentrosPobladosDisponiblesParaDistrito(nombreDistrito: string): any[] {
    if (!nombreDistrito || nombreDistrito.trim() === '') {
      return this.obtenerTodosLosCentrosPoblados();
    }

    const jsonCompleto = this.datos['jsonCompleto'];
    
    if (!jsonCompleto || typeof jsonCompleto !== 'object' || Array.isArray(jsonCompleto)) {
      return this.obtenerTodosLosCentrosPoblados();
    }

    const nombreUpper = nombreDistrito.trim().toUpperCase();
    const centrosPobladosDelDistrito: any[] = [];
    
    // Recorrer todas las claves del JSON (comunidades campesinas o grupos)
    Object.keys(jsonCompleto).forEach((key: string) => {
      const centrosPoblados = (jsonCompleto as any)[key];
      if (Array.isArray(centrosPoblados)) {
        // Filtrar los centros poblados que pertenecen al distrito seleccionado
        centrosPoblados.forEach((cp: any) => {
          const distritoCP = (cp.DIST || cp.dist || '').toString().trim().toUpperCase();
          if (distritoCP === nombreUpper) {
            centrosPobladosDelDistrito.push(cp);
          }
        });
      }
    });
    
    return centrosPobladosDelDistrito;
  }

  obtenerCentrosPobladosDeDistrito(id: string): any[] {
    const distrito = this.distritosAISI.find(d => d.id === id);
    if (!distrito) {
      return [];
    }
    return this.obtenerCentrosPobladosDisponiblesParaDistrito(distrito.nombreOriginal || distrito.nombre);
  }

  obtenerCentrosPobladosVisiblesDistrito(distrito: Distrito): any[] {
    // Siempre filtrar por el nombre del distrito (campo DIST)
    return this.obtenerCentrosPobladosDeDistrito(distrito.id);
  }

  private obtenerTodosLosCentrosPoblados(): any[] {
    const jsonCompleto = this.datos['jsonCompleto'];
    const centros: any[] = [];

    if (jsonCompleto && typeof jsonCompleto === 'object' && !Array.isArray(jsonCompleto)) {
      Object.keys(jsonCompleto).forEach((key: string) => {
        const lista = (jsonCompleto as any)[key];
        if (Array.isArray(lista)) {
          centros.push(...lista);
        }
      });
    }

    if (centros.length > 0) {
      return centros;
    }

    return this.datos['centrosPobladosJSON'] || [];
  }

  // Métodos para autocompletar (llamados desde seccion2-form-wrapper)
  onAutocompleteInput(field: string, value: string): void {
    // Actualizar el valor del campo
    this.datos[field] = value;
    console.log('[Seccion2] onAutocompleteInput:', field, value);
    
    // Si el campo es un distrito adicional, buscar sugerencias del backend
    if (field === 'aisdComponente1' || field === 'aisdComponente2') {
      this.buscarSugerenciasDistritoAdicional(field, value);
    }
    
    this.actualizarDatos();
  }

  onFocusDistritoAdicional(field: string): void {
    // Al hacer focus, si hay valor buscar sugerencias
    const valorActual = this.datos[field] || '';
    if (valorActual.trim().length > 0) {
      this.buscarSugerenciasDistritoAdicional(field, valorActual);
    }
  }
  
  buscarSugerenciasDistritoAdicional(field: string, termino: string): void {
    console.log('[Seccion2] buscarSugerenciasDistritoAdicional:', field, termino);
    
    if (!termino || termino.trim().length < 1) {
      this.autocompleteData[field] = {
        sugerencias: [],
        mostrar: false,
        buscado: ''
      };
      return;
    }
    
    // Extraer provincia del nombre del field (ej: "aisdComponente1_OCROS" → "OCROS")
    let provincia = this.obtenerProvinciaDelJSON();
    if (field.includes('_')) {
      const partes = field.split('_');
      const provinciaDelField = partes[partes.length - 1];
      if (this.provinciasOrdenadas.includes(provinciaDelField)) {
        provincia = provinciaDelField;
      }
    }
    
    console.log('[Seccion2] Provincia extraída para', field, ':', provincia);
    
    // Buscar distritos de esa provincia en el JSON LOCAL
    const sugerencias = this.buscarDistritosEnJSON(termino, provincia);
    console.log('[Seccion2] Sugerencias encontradas en JSON:', sugerencias);
    
    this.autocompleteData[field] = {
      sugerencias: sugerencias || [],
      mostrar: sugerencias && sugerencias.length > 0,
      buscado: termino
    };
    this.cdRef.detectChanges();
  }

  private buscarDistritosEnJSON(termino: string, provincia?: string): string[] {
    const jsonCompleto = this.datos['jsonCompleto'];
    if (!jsonCompleto || typeof jsonCompleto !== 'object' || Array.isArray(jsonCompleto)) {
      return [];
    }

    const terminoFilter = termino.toLowerCase();
    const distritosSet = new Set<string>();
    
    // Recorrer todas las comunidades en el JSON
    Object.keys(jsonCompleto).forEach((key: string) => {
      const centrosPoblados = (jsonCompleto as any)[key];
      if (Array.isArray(centrosPoblados)) {
        centrosPoblados.forEach((cp: any) => {
          const nombreDistrito = cp.DIST || cp.dist;
          const nombreProvincia = cp.PROV || cp.prov;
          
          // Filtrar por provincia si se proporciona
          if (provincia && nombreProvincia && nombreProvincia.toLowerCase() !== provincia.toLowerCase()) {
            return;
          }
          
          if (nombreDistrito) {
            const distritoLower = nombreDistrito.toLowerCase();
            if (distritoLower.includes(terminoFilter)) {
              distritosSet.add(nombreDistrito);
            }
          }
        });
      }
    });
    
    return Array.from(distritosSet).sort();
  }
  
  private obtenerProvinciaDelJSON(): string {
    const jsonCompleto = this.datos['jsonCompleto'];
    
    if (!jsonCompleto || typeof jsonCompleto !== 'object' || Array.isArray(jsonCompleto)) {
      return '';
    }
    
    // Obtener la provincia del primer centro poblado disponible
    const primerKey = Object.keys(jsonCompleto)[0];
    if (primerKey) {
      const centrosPoblados = (jsonCompleto as any)[primerKey];
      if (Array.isArray(centrosPoblados) && centrosPoblados.length > 0) {
        return centrosPoblados[0].PROV || '';
      }
    }
    
    return '';
  }

  cerrarSugerenciasAutocomplete(field: string): void {
    // Limpia datos de autocompletar para el campo especificado
    if (this.autocompleteData[field]) {
      this.autocompleteData[field] = {
        sugerencias: [],
        mostrar: false,
        buscado: ''
      };
    }
  }

  seleccionarSugerencia(field: string, sugerencia: any): void {
    // Selecciona una sugerencia y actualiza el campo correspondiente
    if (sugerencia) {
      this.datos[field] = sugerencia;
      this.formularioService.actualizarDato(field, sugerencia);
      this.cerrarSugerenciasAutocomplete(field);
      this.actualizarDatos();
    }
  }

  /**
   * Método auxiliar para manejar el mouseenter en sugerencias
   */
  onSugerenciaMouseEnter(event: any): void {
    if (event && event.target) {
      (event.target as HTMLElement).style.backgroundColor = '#f0f0f0';
    }
  }

  /**
   * Método auxiliar para manejar el mouseleave en sugerencias
   */
  onSugerenciaMouseLeave(event: any): void {
    if (event && event.target) {
      (event.target as HTMLElement).style.backgroundColor = 'white';
    }
  }
}

