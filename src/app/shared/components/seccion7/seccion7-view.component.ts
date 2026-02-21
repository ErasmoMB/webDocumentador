import { Component, Input, ChangeDetectorRef, OnDestroy, Injector, ChangeDetectionStrategy, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { FotoItem } from '../image-upload/image-upload.component';
import { SECCION7_WATCHED_FIELDS, SECCION7_PHOTO_PREFIX, SECCION7_SECTION_ID, SECCION7_TEMPLATES } from './seccion7-constants';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';

@Component({
  standalone: true,
  imports: [CommonModule, CoreSharedModule],
  selector: 'app-seccion7-view',
  templateUrl: './seccion7-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion7ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION7_SECTION_ID;
  @Input() override modoFormulario: boolean = false;
  
  // ✅ Hacer TEMPLATES accesible en el template
  readonly SECCION7_TEMPLATES = SECCION7_TEMPLATES;
  
  override readonly PHOTO_PREFIX = SECCION7_PHOTO_PREFIX.PEA;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION7_WATCHED_FIELDS;
  
  fotografiasVista: FotoItem[] = [];

  readonly prefijoGrupoSignal: Signal<string> = computed(() => this.obtenerPrefijoGrupo());

  readonly viewDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly petTablaSignal: Signal<any[]> = computed(() => {
    const viewData = this.viewDataSignal();
    const prefijo = this.prefijoGrupoSignal();
    const petTablaKey = prefijo ? `petTabla${prefijo}` : 'petTabla';
    return Array.isArray(viewData[petTablaKey]) ? viewData[petTablaKey] : [];
  });

  readonly peaTablaSignal: Signal<any[]> = computed(() => {
    const viewData = this.viewDataSignal();
    const prefijo = this.prefijoGrupoSignal();
    const peaTablaKey = prefijo ? `peaTabla${prefijo}` : 'peaTabla';
    return Array.isArray(viewData[peaTablaKey]) ? viewData[peaTablaKey] : [];
  });

  readonly peaOcupadaTablaSignal: Signal<any[]> = computed(() => {
    const viewData = this.viewDataSignal();
    const prefijo = this.prefijoGrupoSignal();
    const peaOcupadaTablaKey = prefijo ? `peaOcupadaTabla${prefijo}` : 'peaOcupadaTabla';
    return Array.isArray(viewData[peaOcupadaTablaKey]) ? viewData[peaOcupadaTablaKey] : [];
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const prefix = this.PHOTO_PREFIX;
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen${prefijo}`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ SIGNAL: Extraer el DISTRITO de la tabla de Sección 4 (Ubicación referencial)
  readonly distritoDesdeSeccion4Signal: Signal<string> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    // Leer la tabla de ubicación de Sección 4 con el mismo prefijo
    const seccion4Id = '3.1.4.A.1'; // Sección 4
    const tablaKey = `tablaAISD1Datos${prefijo}`;
    
    // Obtener datos de Sección 4
    const seccion4Data = this.projectFacade.selectSectionFields(seccion4Id, null)();
    const tabla = seccion4Data[tablaKey] || seccion4Data['tablaAISD1Datos'];
    
    // Obtener el primer registro y extraer el distrito
    if (tabla && Array.isArray(tabla) && tabla.length > 0) {
      const primerRegistro = tabla[0];
      if (primerRegistro && primerRegistro.distrito && primerRegistro.distrito.trim() !== '') {
        return primerRegistro.distrito;
      }
    }
    
    return '____'; // Fallback si no encuentra el distrito
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private formChange: FormChangeService
  ) {
    super(cdRef, injector);
    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX, label: 'PEA' }
    ];

    effect(() => {
      const viewData = this.viewDataSignal();
      this.datos = { ...viewData };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT: Monitorear cambios en tablas PET, PEA, PEA Ocupada
    const seccion7ViewTablas = this;
    let inicializadoTablas = false;
    
    effect(() => {
      // Leer los signals de tablas para detectar cambios
      const petTabla = this.petTablaSignal();
      const peaTabla = this.peaTablaSignal();
      const peaOcupadaTabla = this.peaOcupadaTablaSignal();
      
      // Skip primer inicio
      if (!inicializadoTablas) {
        inicializadoTablas = true;
        console.log(`[SECCION7:VIEW:EFFECT:TABLAS] ⏭️ Skip primer inicio`);
        return;
      }
      
      console.log(`[SECCION7:VIEW:EFFECT:TABLAS] 🔄 Tablas cambiaron, actualizando vista...`);
      seccion7ViewTablas.cdRef.markForCheck();
    }, { allowSignalWrites: true });

    // ✅ EFFECT: Monitorear cambios de fotos
    // IMPORTANTE: Flag para evitar loop infinito (igual que Sección 6)
    const seccion7ViewFotos = this;
    let inicializadoView = false;
    
    effect(() => {
      const hash = this.photoFieldsHash();
      console.log(`[SECCION7:VIEW:EFFECT] Hash actual: ${hash?.substring(0, 50)}...`);
      
      // Skip primer inicio - fotos ya cargadas en constructor/onInitCustom
      if (!inicializadoView) {
        inicializadoView = true;
        console.log(`[SECCION7:VIEW:EFFECT] ⏭️ Skip primer inicio`);
        return;
      }
      
      console.log(`[SECCION7:VIEW:EFFECT] 📷 Hash cambió, recargando fotos...`);
      seccion7ViewFotos.cargarFotografias();
      seccion7ViewFotos.fotografiasVista = [...seccion7ViewFotos.fotografiasCache];
      seccion7ViewFotos.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    this.fotografiasVista = [...this.fotografiasCache];
  }

  protected override cargarFotografias(): void {
    // ✅ LEER DEL SIGNAL REACTIVO (igual que Sección 6)
    const formData = this.viewDataSignal();
    const prefijo = this.prefijoGrupoSignal();
    
    // ✅ Contar fotos reales en formData
    const fotoKeys = Object.keys(formData || {}).filter(k => 
      k.includes('fotografia') && k.includes('Imagen') && !k.includes('Titulo') && !k.includes('Fuente') && !k.includes('Numero')
    );
    
    let fotosReales = 0;
    for (const key of fotoKeys) {
      const valor = formData[key];
      if (valor && typeof valor === 'string' && valor.length > 0 && valor.startsWith('data:')) {
        fotosReales++;
      }
    }
    
    console.log(`[SECCION7:VIEW:FOTOS] 🔍 Cargando fotos:`, {
      prefijo,
      fotosReales,
      fotografiasCacheActual: this.fotografiasCache?.length || 0
    });
    
    // ✅ SOLO mantener cache si la cantidad de fotos es EXACTAMENTE IGUAL (igual que Sección 6)
    const cacheCount = this.fotografiasCache?.length || 0;
    if (cacheCount > 0 && cacheCount === fotosReales) {
      // Misma cantidad, verificar si títulos/fuentes cambiaron
      let necesitaRecarga = false;
      for (let i = 0; i < cacheCount; i++) {
        const foto = this.fotografiasCache[i];
        const titKey = `${this.PHOTO_PREFIX}${i + 1}Titulo${prefijo}`;
        const fuenteKey = `${this.PHOTO_PREFIX}${i + 1}Fuente${prefijo}`;
        if (formData[titKey] !== foto.titulo || formData[fuenteKey] !== foto.fuente) {
          console.log(`[SECCION7:VIEW:FOTOS] 🔄 Título/Fuente cambió para foto ${i + 1}, recargando`);
          necesitaRecarga = true;
          break;
        }
      }
      if (!necesitaRecarga) {
        console.log(`[SECCION7:VIEW:FOTOS] ✅ Títulos sin cambios, manteniendo cache`);
        this.fotografiasVista = [...this.fotografiasCache];
        this.cdRef.markForCheck();
        return;
      }
    } else {
      console.log(`[SECCION7:VIEW:FOTOS] ℹ️ Cache(${cacheCount}) != Reales(${fotosReales}), recargando`);
    }
    
    // ✅ Ahora cargar las fotos directamente del signal (igual que Sección 6)
    const fotos: FotoItem[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`;
      const imagen = formData[imagenKey];
      
      // Verificar que la imagen sea un data URL válido
      const esValida = imagen && typeof imagen === 'string' && imagen.length > 0 && imagen.startsWith('data:');
      
      if (esValida) {
        const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`;
        const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`;
        const numeroKey = `${this.PHOTO_PREFIX}${i}Numero${prefijo}`;
        
        fotos.push({
          imagen: imagen,
          titulo: formData[tituloKey] || '',
          fuente: formData[fuenteKey] || '',
          numero: formData[numeroKey] || i
        });
      }
    }
    
    console.log(`[SECCION7:VIEW:FOTOS] ✅ Fotos cargadas del signal: ${fotos.length}`);
    
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    this.fotografiasVista = [...this.fotografiasCache];
    this.cdRef.markForCheck();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {}

  // ✅ MÉTODOS PARA OBTENER TABLAS
  
  getPETConPorcentajes(): any[] {
    return this.petTablaSignal();
  }

  getPEAConPorcentajes(): any[] {
    return this.peaTablaSignal();
  }

  getPEAOcupadaConPorcentajes(): any[] {
    return this.peaOcupadaTablaSignal();
  }

  getTablaPET(): any[] {
    return this.petTablaSignal();
  }

  getTablaPEA(): any[] {
    return this.peaTablaSignal();
  }

  getTablaPEAOcupada(): any[] {
    return this.peaOcupadaTablaSignal();
  }

  // ✅ MÉTODOS HELPER
  
  trackByIndex(index: number): number {
    return index;
  }

  override obtenerNombreComunidadActual(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    if (prefijo && prefijo.startsWith('_A')) {
      const match = prefijo.match(/_A(\d+)/);
      if (match) {
        const index = parseInt(match[1]) - 1;
        const grupos = this.aisdGroups();
        if (grupos && grupos[index]?.nombre) {
          return grupos[index].nombre;
        }
      }
    }
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    return grupoAISD || this.datos.grupoAISD || '____';
  }

  obtenerPrefijo(): string {
    return this.obtenerPrefijoGrupo();
  }

  private obtenerValorCampo(baseField: string): string {
    const viewData = this.viewDataSignal();
    const prefijo = this.obtenerPrefijoGrupo();
    const claveConPrefijo = `${baseField}${prefijo}`;
    return viewData[claveConPrefijo] || viewData[baseField] || '';
  }

  getFotografiasPEAVista(): FotoItem[] {
    return this.fotografiasVista;
  }

  // ✅ MÉTODOS PARA TÍTULOS DINÁMICOS CON DISTRITO
  
  obtenerTituloCuadro3_8(): string {
    const titulo = this.obtenerValorCampo('cuadroTituloPEA') || SECCION7_TEMPLATES.PLACEHOLDER_TITULO_PEA;
    const distrito = this.distritoDesdeSeccion4Signal();
    return `${titulo} – Distrito ${distrito} (2017)`;
  }

  obtenerTituloCuadro3_9(): string {
    const titulo = this.obtenerValorCampo('cuadroTituloPEAOcupada') || SECCION7_TEMPLATES.PLACEHOLDER_TITULO_PEA_OCUPADA;
    const distrito = this.distritoDesdeSeccion4Signal();
    return `${titulo} – Distrito ${distrito} (2017)`;
  }

  obtenerTituloCuadro3_7(): string {
    return this.obtenerValorCampo('cuadroTituloPET') || SECCION7_TEMPLATES.PLACEHOLDER_TITULO_PET;
  }

  obtenerFuenteCuadro3_7(): string {
    return this.obtenerValorCampo('cuadroFuentePET') || 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)';
  }

  obtenerFuenteCuadro3_8(): string {
    return this.obtenerValorCampo('cuadroFuentePEA') || 'Resultados Definitivos de la Población Económicamente Activa 2017 – INEI 2018';
  }

  obtenerFuenteCuadro3_9(): string {
    return this.obtenerValorCampo('cuadroFuentePEAOcupada') || 'Resultados Definitivos de la Población Económicamente Activa 2017 – INEI 2018';
  }
  
  obtenerTextoSeccion7PETCompletoConResaltado(): SafeHtml {
    const viewData = this.viewDataSignal();
    const prefijo = this.obtenerPrefijo();
    
    // Prioridad: leer valor manual si existe
    const manualKey = `parrafoSeccion7_pet_completo${prefijo}`;
    let textoPersonalizado = viewData[manualKey];
    if (!textoPersonalizado) {
      textoPersonalizado = viewData['parrafoSeccion7_pet_completo'];
    }
    
    if (textoPersonalizado && textoPersonalizado.trim() !== '') {
      return this.sanitizer.bypassSecurityTrustHtml(textoPersonalizado);
    }

    // Generar texto por defecto
    const grupoAISD = this.obtenerNombreComunidadActual();
    const texto = `En concordancia con el Convenio 138 de la Organización Internacional de Trabajo (OIT), aprobado por Resolución Legislativa Nº27453 de fecha 22 de mayo del 2001 y ratificado por DS Nº038-2001-RE, publicado el 31 de mayo de 2001, la población cumplida los 14 años de edad se encuentra en edad de trabajar.\n\nLa población en edad de trabajar (PET) de la CC ${grupoAISD}, considerada desde los 15 años a más, se compone de la población total. El bloque etario que más aporta a la PET es el de 15 a 29 años. Por otro lado, el grupo etario que menos aporta al indicador es el de 65 años a más.`;
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoDetalePEAConResaltado(): SafeHtml {
    const viewData = this.viewDataSignal();
    const prefijo = this.obtenerPrefijo();
    
    const manualKey = `textoDetalePEA${prefijo}`;
    let texto = viewData[manualKey];
    if (!texto) {
      texto = viewData['textoDetalePEA'];
    }
    if (!texto || texto.trim() === '') {
      texto = `La Población Económicamente Activa (PEA) constituye un indicador fundamental para comprender la dinámica económica y social. En este apartado, se presenta la caracterización de la PEA del distrito, empleando información oficial del INEI.`;
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoDefinicionPEAConResaltado(): SafeHtml {
    const viewData = this.viewDataSignal();
    const prefijo = this.obtenerPrefijo();
    
    const manualKey = `textoDefinicionPEA${prefijo}`;
    let texto = viewData[manualKey];
    if (!texto) {
      texto = viewData['textoDefinicionPEA'];
    }
    if (!texto || texto.trim() === '') {
      texto = `La Población Económicamente Activa (PEA) está compuesta por todas aquellas personas en edad de trabajar que se encuentran empleadas o desempleadas activamente buscando empleo. Constituye un indicador clave de la participación laboral.`;
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoAnalisisPEAConResaltado(): SafeHtml {
    const viewData = this.viewDataSignal();
    const prefijo = this.obtenerPrefijo();
    
    const manualKey = `textoAnalisisPEA${prefijo}`;
    let texto = viewData[manualKey];
    if (!texto) {
      texto = viewData['textoAnalisisPEA'];
    }
    if (!texto || texto.trim() === '') {
      texto = `Del cuadro precedente, se aprecia que la PEA representa un porcentaje importante de la población en edad de trabajar. Asimismo, se evidencia una distribución diferenciada entre hombres y mujeres en su participación económica.`;
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoSeccion7SituacionEmpleoCompletoConResaltado(): SafeHtml {
    const viewData = this.viewDataSignal();
    const prefijo = this.obtenerPrefijo();
    
    const manualKey = `parrafoSeccion7_situacion_empleo_completo${prefijo}`;
    let texto = viewData[manualKey];
    if (!texto) {
      texto = viewData['parrafoSeccion7_situacion_empleo_completo'];
    }
    if (!texto || texto.trim() === '') {
      texto = `La situación del empleo refleja la estructura económica de la localidad. Permite diferenciar entre aquellos que trabajan de manera independiente, en actividades autónomas, y quienes se encuentran en empleos dependientes bajo relación laboral establecida.`;
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoSeccion7IngresosCompletoConResaltado(): SafeHtml {
    const viewData = this.viewDataSignal();
    const prefijo = this.obtenerPrefijo();
    
    const manualKey = `parrafoSeccion7_ingresos_completo${prefijo}`;
    let texto = viewData[manualKey];
    if (!texto) {
      texto = viewData['parrafoSeccion7_ingresos_completo'];
    }
    if (!texto || texto.trim() === '') {
      texto = `Los ingresos de la población provienen principalmente de las actividades económicas locales. Sin embargo, debido a dependencia de estos sectores y fluctuaciones del mercado, los ingresos no siempre resultan estables ni regulares, generando vulnerabilidad económica en las familias.`;
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoIndiceDesempleoConResaltado(): SafeHtml {
    const viewData = this.viewDataSignal();
    const prefijo = this.obtenerPrefijo();
    
    const manualKey = `textoIndiceDesempleo${prefijo}`;
    let texto = viewData[manualKey];
    if (!texto) {
      texto = viewData['textoIndiceDesempleo'];
    }
    if (!texto || texto.trim() === '') {
      texto = `El índice de desempleo es un indicador clave para evaluar la salud económica de la jurisdicción. Refleja la proporción de la Población Económicamente Activa (PEA) que se encuentra en búsqueda activa de empleo sin haberlo logrado obtener.`;
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  obtenerTextoAnalisisOcupacionConResaltado(): SafeHtml {
    const viewData = this.viewDataSignal();
    const prefijo = this.obtenerPrefijo();
    
    const manualKey = `textoAnalisisOcupacion${prefijo}`;
    let texto = viewData[manualKey];
    if (!texto) {
      texto = viewData['textoAnalisisOcupacion'] || `Del cuadro precedente, se halla que la PEA Desocupada representa un porcentaje del total de la PEA. En adición a ello, se aprecia que tanto hombres como mujeres se encuentran predominantemente en el indicador de PEA Ocupada.`;
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
