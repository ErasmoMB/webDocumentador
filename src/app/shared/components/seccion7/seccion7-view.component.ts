import { Component, Input, ChangeDetectorRef, OnDestroy, Injector, ChangeDetectionStrategy, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { FotoItem } from '../image-upload/image-upload.component';
import { SECCION7_WATCHED_FIELDS, SECCION7_PHOTO_PREFIX, SECCION7_SECTION_ID, SECCION7_TEMPLATES } from './seccion7-constants';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
    const prefix = `${this.PHOTO_PREFIX}${prefijo}`;
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);
    this.photoGroupsConfig = [
      { prefix: `${this.PHOTO_PREFIX}${this.prefijoGrupoSignal()}`, label: 'PEA' }
    ];

    effect(() => {
      const viewData = this.viewDataSignal();
      this.datos = { ...viewData };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.fotografiasVista = [...this.fotografiasCache];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    this.fotografiasVista = [...this.fotografiasCache];
  }

  protected override cargarFotografias(): void {
    if (this.photoGroupsConfig.length > 0) {
      this.cargarTodosLosGrupos();
      this.fotografiasVista = [...this.fotografiasCache];
      this.cdRef.markForCheck();
    } else {
      super.cargarFotografias();
    }
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

  getFotografiasPEAVista(): FotoItem[] {
    return this.fotografiasVista;
  }

  // ✅ MÉTODOS DE TEXTO (generan SafeHtml)
  
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
    
    const manualKey = `parrafoSeccion7_indice_desempleo${prefijo}`;
    let texto = viewData[manualKey];
    if (!texto) {
      texto = viewData['parrafoSeccion7_indice_desempleo'];
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
