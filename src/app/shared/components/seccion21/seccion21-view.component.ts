import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';

@Component({
  selector: 'app-seccion21-view',
  templateUrl: './seccion21-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule],
  standalone: true
})
export class Seccion21ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B';

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  override readonly PHOTO_PREFIX: string;
  override useReactiveSync: boolean = true;

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private sanitizer: DomSanitizer) {
    super(cdRef, injector);
    // Inicializar PHOTO_PREFIX dinámicamente basado en el grupo actual
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';

    effect(() => {
      const data = this.formDataSignal();
      // Solo actualizar si hay datos disponibles
      if (!data || Object.keys(data).length === 0) {
        this.cdRef.markForCheck();
        return;
      }
      const prefijo = this.obtenerPrefijoGrupo();
      const centroConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
      const tablaKey = prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
      const tituloTablaKey = prefijo ? `cuadroTituloUbicacionCp${prefijo}` : 'cuadroTituloUbicacionCp';
      
      const tablas: Record<string, any> = {};
      tablas[tablaKey] = this.ubicacionCpSignal();
      tablas['ubicacionCpTabla'] = tablas[tablaKey]; // Para compatibilidad
      tablas[centroConPrefijo] = PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId) || '____';
      tablas['centroPobladoAISI'] = tablas[centroConPrefijo]; // Para compatibilidad
      tablas[tituloTablaKey] = PrefijoHelper.obtenerValorConPrefijo(data, 'cuadroTituloUbicacionCp', this.seccionId) || `Ubicación referencial – Centro Poblado ${tablas[centroConPrefijo]}`;
      
      this.datos = { ...data, ...tablas };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly parrafoAisiSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion21_aisi_intro_completo')();
    if (manual && manual.trim().length > 0) return manual;
    const data = this.formDataSignal();
    const centro = PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId) || 'Cahuacho';
    const provincia = this.projectFacade.selectField(this.seccionId, null, 'provinciaSeleccionada')() || 'Caravelí';
    const departamento = this.projectFacade.selectField(this.seccionId, null, 'departamentoSeleccionado')() || 'Arequipa';
    return `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el CP ${centro}, capital distrital de la jurisdicción homónima, en la provincia de ${provincia}, en el departamento de ${departamento}. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, es la localidad de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`;
  });

  readonly parrafoCentroSignal: Signal<string> = computed(() => {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion21_centro_poblado_completo')();
    if (manual && manual.trim().length > 0) return manual;
    const data = this.formDataSignal();
    const centro = PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId) || 'Cahuacho';
    const provincia = this.projectFacade.selectField(this.seccionId, null, 'provinciaSeleccionada')() || 'Caravelí';
    const departamento = this.projectFacade.selectField(this.seccionId, null, 'departamentoSeleccionado')() || 'Arequipa';
    const ley = this.projectFacade.selectField(this.seccionId, null, 'leyCreacionDistrito')() || '8004';
    const fecha = this.projectFacade.selectField(this.seccionId, null, 'fechaCreacionDistrito')() || '22 de febrero de 1935';
    const distrito = this.projectFacade.selectField(this.seccionId, null, 'distritoSeleccionado')() || 'Cahuacho';
    const distritoAnterior = this.projectFacade.selectField(this.seccionId, null, 'distritoAnterior')() || 'Caravelí';
    const origen1 = this.projectFacade.selectField(this.seccionId, null, 'origenPobladores1')() || 'Caravelí';
    const origen2 = this.projectFacade.selectField(this.seccionId, null, 'origenPobladores2')() || 'Parinacochas';
    const deptoOrigen = this.projectFacade.selectField(this.seccionId, null, 'departamentoOrigen')() || 'Ayacucho';
    const anexos = this.projectFacade.selectField(this.seccionId, null, 'anexosEjemplo')() || 'Ayroca o Sóndor';
    return `El CP ${centro} es la capital del distrito homónimo, perteneciente a la provincia de ${provincia}, en el departamento de ${departamento}. Su designación como capital distrital se oficializó mediante la Ley N°${ley}, promulgada el ${fecha}, fecha en que se creó el distrito de ${distrito}. Antes de ello, este asentamiento era un caserío del distrito de ${distritoAnterior}, marcando un importante cambio en su desarrollo administrativo y social.\n\nLos primeros poblado ${centro} provenían principalmente de ${origen1} y la provincia de ${origen2}, en ${deptoOrigen}. Entre las familias pioneras destacan apellidos como Espinoza, Miralles, De la Cruz y Aguayo, quienes sentaron las bases de la localidad actual. El nombre "${centro}" proviene del término quechua Ccahuayhuachu, que se traduce como "mírame desde aquí", reflejando posiblemente su ubicación estratégica o una percepción cultural del entorno.\n\nA diferencia de algunos anexos del distrito, como ${anexos}, que son centros administrativos de sus respectivas comunidades campesinas, el centro poblado ${centro} no se encuentra dentro de los límites de ninguna comunidad campesina. Esto le otorga una característica particular dentro del contexto rural, marcando su identidad como un núcleo urbano-administrativo independiente en el distrito.`;
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      if (imagen) {
        fotos.push({ titulo: titulo || `Fotografía ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
      }
    }
    return fotos;
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  readonly ubicacionCpSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    return fromField ?? fromTable ?? [{ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' }];
  });

  readonly viewModel = computed(() => ({
    parrafoAisi: this.parrafoAisiSignal(),
    parrafoCentro: this.parrafoCentroSignal(),
    fotos: this.fotosCacheSignal(),
    ubicacionCp: this.ubicacionCpSignal()
  }));

  formatearParrafo(texto: string): SafeHtml {
    if (!texto) return '' as any;
    const parrafos = texto.split(/\n\n+/);
    const resultado = parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
    return this.sanitizer.bypassSecurityTrustHtml(resultado);
  }

  protected override onInitCustom(): void {
    // Inicializar datos con prefijos correctos
    const data = this.formDataSignal();
    const prefijo = this.obtenerPrefijoGrupo();
    const centroConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
    const tablaKey = prefijo ? `ubicacionCpTabla${prefijo}` : 'ubicacionCpTabla';
    const tituloTablaKey = prefijo ? `cuadroTituloUbicacionCp${prefijo}` : 'cuadroTituloUbicacionCp';
    
    const tablas: Record<string, any> = {};
    tablas[tablaKey] = this.ubicacionCpSignal();
    tablas['ubicacionCpTabla'] = tablas[tablaKey]; // Para compatibilidad
    tablas[centroConPrefijo] = PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId) || '____';
    tablas['centroPobladoAISI'] = tablas[centroConPrefijo]; // Para compatibilidad
    tablas[tituloTablaKey] = PrefijoHelper.obtenerValorConPrefijo(data, 'cuadroTituloUbicacionCp', this.seccionId) || `Ubicación referencial – Centro Poblado ${tablas[centroConPrefijo]}`;
    
    this.datos = { ...data, ...tablas };
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void {
    // Agregar valores con prefijos para que la plantilla HTML pueda usarlos
    const prefijo = this.obtenerPrefijoGrupo();
    const centroConPrefijo = prefijo ? `centroPobladoAISI${prefijo}` : 'centroPobladoAISI';
    const tituloTablaKey = prefijo ? `cuadroTituloUbicacionCp${prefijo}` : 'cuadroTituloUbicacionCp';
    
    // Asegurar que centroPobladoAISI esté disponible para la plantilla
    if (!this.datos.centroPobladoAISI || this.datos.centroPobladoAISI === '____') {
      const centroConPrefijoValor = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
      if (centroConPrefijoValor && centroConPrefijoValor !== '____') {
        this.datos.centroPobladoAISI = centroConPrefijoValor;
      }
    }
    
    // Asegurar que cuadroTituloUbicacionCp esté disponible para la plantilla
    if (!this.datos['cuadroTituloUbicacionCp'] || this.datos['cuadroTituloUbicacionCp'] === '____') {
      const tituloConPrefijoValor = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'cuadroTituloUbicacionCp', this.seccionId);
      if (tituloConPrefijoValor && tituloConPrefijoValor !== '____') {
        this.datos['cuadroTituloUbicacionCp'] = tituloConPrefijoValor;
      } else if (this.datos.centroPobladoAISI && this.datos.centroPobladoAISI !== '____') {
        this.datos['cuadroTituloUbicacionCp'] = `Ubicación referencial – Centro Poblado ${this.datos.centroPobladoAISI}`;
      }
    }
  }

  trackByIndex(index: number): number { return index; }
}
