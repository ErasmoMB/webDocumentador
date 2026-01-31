import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WordGeneratorService } from 'src/app/core/services/word-generator.facade.service';
import { TextNormalizationService } from 'src/app/core/services/text-normalization.service';
import { LoggerService } from 'src/app/core/services/infrastructure/logger.service';
import { ResumenComponent } from './plantilla.component';
import { FormularioDatos, CentroPobladoData } from 'src/app/core/models/formulario.model';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { FormularioDataTransformer } from 'src/app/core/services/data-transformers/formulario-data-transformer.service';
import { StorageFacade } from 'src/app/core/services/infrastructure/storage-facade.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';

@Component({
    selector: 'app-plantilla-view',
    templateUrl: './plantilla-view.component.html',
    styleUrls: ['./plantilla-view.component.css'],
    standalone: false
})
export class PlantillaViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(ResumenComponent) resumenComponent!: ResumenComponent;
  
  datos: FormularioDatos | null = null;
  json: CentroPobladoData[] = [];
  modoEjemplo: boolean = false;
  verEjemploLabel: string = 'Ver Ejemplo';
  datosBackup: FormularioDatos | null = null;
  jsonBackup: CentroPobladoData[] | null = null;
  private resizeTimeout: any;

  constructor(
    private projectFacade: ProjectStateFacade,
    private formularioService: FormularioService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private wordGeneratorService: WordGeneratorService,
    private textNormalization: TextNormalizationService,
    private logger: LoggerService,
    private formChange: FormChangeService,
    private dataTransformer: FormularioDataTransformer,
    private storage: StorageFacade,
  ) {

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.cdRef.detectChanges();
    }, 100);
  }

  ngOnInit() {
    this.json = this.formularioService.obtenerJSON();
    this.datos = this.projectFacade.obtenerDatos() as FormularioDatos;
    
    // Detectar si ya hay datos de ejemplo cargados
    this.detectarModoEjemplo();
    
    // Si estamos en modo ejemplo, asegurar que las transformaciones estén aplicadas
    if (this.modoEjemplo && this.datos) {
      const datosTransformados = this.dataTransformer.transform(this.datos);
      this.datos = datosTransformados;
      // Actualizar el store con los datos transformados
      this.formularioService.actualizarDatos(datosTransformados);
    }
    
    // Actualizar todos los componentes con los datos cargados
    ViewChildHelper.updateAllComponents('actualizarDatos');
    
    const state = window.history.state;
    if (state?.returnSection) {
      this.storage.setItem('lastSectionId', state.returnSection);
    }
  }

  ngAfterViewInit() {
    if (this.resumenComponent) {
      this.resumenComponent.actualizarDatos();
    }
    
    // Asegurar que todos los componentes se actualicen
    ViewChildHelper.updateAllComponents('actualizarDatos');
  }

  ngOnDestroy() {

  }

  private detectarModoEjemplo() {
    // Verificar si hay datos de ejemplo cargados basándose en campos específicos
    if (this.datos) {
      // Verificar campos que solo se llenan con datos de ejemplo (campos con prefijo _B1)
      const tieneDatosEjemplo = !!(
        this.datos['morbilidadCpTabla_B1'] ||
        this.datos['natalidadMortalidadCpTabla_B1'] ||
        this.datos['afiliacionSaludTabla_B1']
      );

      if (tieneDatosEjemplo) {
        this.modoEjemplo = true;
        this.verEjemploLabel = 'Volver a mis datos';
      } else {
        this.modoEjemplo = false;
        this.verEjemploLabel = 'Ver Ejemplo';
      }
    }
  }

  shouldShowOrgCell(index: number, lista: any[]): boolean {
    if (!lista || index === 0) return true;
    return lista[index - 1]?.organizacion !== lista[index]?.organizacion;
  }

  getOrgRowSpan(organizacion: string, lista: any[]): number {
    if (!lista) return 1;
    return lista.filter(item => item.organizacion === organizacion).length;
  }

  shouldShowCargoCell(index: number, lista: any[]): boolean {
    if (!lista || index === 0) return true;
    const current = lista[index];
    const previous = lista[index - 1];
    return previous?.organizacion !== current?.organizacion || previous?.cargo !== current?.cargo;
  }

  getCargoRowSpan(organizacion: string, cargo: string, lista: any[]): number {
    if (!lista) return 1;
    return lista.filter(item => item.organizacion === organizacion && item.cargo === cargo).length;
  }

  shouldShowCategoriaCell(index: number): boolean {
    if (!this.datos?.mapaActores || index === 0) return true;
    return this.datos.mapaActores[index - 1]?.categoria !== this.datos.mapaActores[index]?.categoria;
  }

  getCategoriaRowSpan(categoria: string): number {
    if (!this.datos?.mapaActores) return 1;
    return this.datos.mapaActores.filter((a: any) => a.categoria === categoria).length;
  }

  agregarPuntoFinal(texto: string | undefined | null): string {
    return this.textNormalization.agregarPuntoFinal(texto);
  }

  normalizarDespuesDeQue(texto: string | undefined | null): string {
    return this.textNormalization.normalizarDespuesDeQue(texto);
  }

  normalizarComponente1(texto: string | undefined | null): string {
    return this.textNormalization.normalizarComponente1(texto);
  }

  normalizarDetalleProyecto(texto: string | undefined | null): string {
    return this.textNormalization.normalizarDetalleProyecto(texto);
  }

  capitalizarTexto(texto: string): string {
    return this.textNormalization.capitalizarTexto(texto);
  }

  normalizarNombreProyecto(texto: string | undefined | null, conArticulo: boolean = true): string {
    return this.textNormalization.normalizarNombreProyecto(texto, conArticulo);
  }

  calcularTotalPoblacion(): number {
    if (!this.datos?.puntosPoblacion) return 0;
    return this.datos.puntosPoblacion.reduce((sum: number, punto: any) => sum + (punto.poblacion || 0), 0);
  }

  calcularTotalViviendasEmpadronadas(): number {
    if (!this.datos?.puntosPoblacion) return 0;
    return this.datos.puntosPoblacion.reduce((sum: number, punto: any) => sum + (punto.viviendasEmpadronadas || 0), 0);
  }

  calcularTotalViviendasOcupadas(): number {
    if (!this.datos?.puntosPoblacion) return 0;
    return this.datos.puntosPoblacion.reduce((sum: number, punto: any) => sum + (punto.viviendasOcupadas || 0), 0);
  }

  async exportarWord() {
    const botonSelector = 'button[data-action="exportar-word"]';
    try {
      const botonExportar = document.querySelector(botonSelector) as HTMLButtonElement;
      if (botonExportar) {
        botonExportar.disabled = true;
        botonExportar.textContent = 'Exportando...';
      }

      if (this.resumenComponent) {
        this.resumenComponent.actualizarDatos();
      }
      this.cdRef.detectChanges();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const elemento = document.querySelector(".viewport-content") as HTMLElement || 
                       document.querySelector(".preview") as HTMLElement ||
                       document.querySelector("app-resumen") as HTMLElement;
      
      if (!elemento) {
        this.logger.error("No se encontró el contenido para exportar.");
        alert("No se pudo encontrar el contenido para exportar. Por favor, recarga la página e intenta nuevamente.");
        if (botonExportar) {
          botonExportar.disabled = false;
          botonExportar.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Exportar a Word';
        }
        return;
      }

      const nombreArchivo = `LBS${String(this.datos?.projectName || 'Documento')}`.replace(/\s+/g, '');
      
      await this.wordGeneratorService.generarDocumento(elemento, nombreArchivo);
      this.logger.info("Documento exportado correctamente");
      
      if (botonExportar) {
        botonExportar.disabled = false;
        botonExportar.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Exportar a Word';
      }
    } catch (error: any) {
      this.logger.error("Error al exportar a Word", error);
      const mensajeError = error?.message || error?.toString() || "Error desconocido al exportar";
      alert(`Error al exportar: ${mensajeError}\n\nPor favor, revisa la consola del navegador (F12) para más detalles.`);
      
      const botonExportar = document.querySelector(botonSelector) as HTMLButtonElement;
      if (botonExportar) {
        botonExportar.disabled = false;
        botonExportar.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Exportar a Word';
      }
    }
  }

  private hacerBackupSeguro(): boolean {
    try {
      const datosActuales = this.projectFacade.obtenerDatos() as FormularioDatos;
      const jsonActual = this.formularioService.obtenerJSON();
      
      if (datosActuales) {
        this.datosBackup = structuredClone(datosActuales);
      }
      if (jsonActual !== null && jsonActual !== undefined) {
        this.jsonBackup = structuredClone(jsonActual);
      }
      return true;
    } catch (error) {
      this.logger.error('Error al hacer backup de datos', error);
      this.datosBackup = null;
      this.jsonBackup = null;
      return false;
    }
  }

  async verEjemplo(event?: Event) {
    const boton = event?.target as HTMLButtonElement;
    try {
      if (boton) { boton.disabled = true; }

      if (!this.modoEjemplo) {
        // 📥 Cargando datos de ejemplo...
        if (!this.hacerBackupSeguro()) {
          throw new Error('No se pudo hacer backup de los datos actuales. Verifique la consola para más detalles.');
        }

        try {
          const ok = await this.formularioService.cargarMockCapitulo3();
          if (!ok) {
            throw new Error('No se pudo cargar el mock capitulo3.json. Verifique que el archivo existe.');
          }
        } catch (error: any) {
          if (error?.message?.includes('text.replace')) {
            this.logger.warn('Error en transformación de datos, continuando...', error);
          } else {
            throw error;
          }
        }
        
        // Obtener datos actualizados desde el store
        this.datos = this.projectFacade.obtenerDatos() as FormularioDatos;
        this.json = this.formularioService.obtenerJSON();
        
        // Persistir los datos de ejemplo para que se mantengan al recargar
        this.formChange.persistFields('global', '', this.datos || {}, { persist: true, updateLegacy: true });
        
        this.modoEjemplo = true;
        this.verEjemploLabel = 'Volver a mis datos';
        
        // Quitar marca de datos limpiados ya que ahora hay datos de ejemplo
        this.storage.removeItem('__datos_limpios_manualmente__');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (this.resumenComponent) {
          this.resumenComponent.actualizarDatos();
        } else {
          setTimeout(() => {
            if (this.resumenComponent) {
              this.resumenComponent.actualizarDatos();
            }
          }, 200);
        }
        
        // Forzar refresco de todos los componentes
        ViewChildHelper.updateAllComponents('actualizarDatos');
        
        this.cdRef.detectChanges();
      } else {
        // 🧹 Volviendo a mis datos...
        if (this.datosBackup) {
          this.formularioService.actualizarDatos(this.datosBackup);
          if (this.jsonBackup !== null && this.jsonBackup !== undefined) {
            this.formularioService.guardarJSON(this.jsonBackup);
          }
          // Quitar marca de datos limpiados ya que se restauraron datos del usuario
          this.storage.removeItem('__datos_limpios_manualmente__');
          this.datos = this.datosBackup;
          this.json = this.jsonBackup || [];
        } else {
          this.formularioService.limpiarDatos();
          this.formularioService.guardarJSON([]);

          this.datos = {} as FormularioDatos;
          this.json = [];
        }
        this.modoEjemplo = false;
        this.verEjemploLabel = 'Ver Ejemplo';
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (this.resumenComponent) {
          this.resumenComponent.actualizarDatos();
        } else {
          setTimeout(() => {
            if (this.resumenComponent) {
              this.resumenComponent.actualizarDatos();
            }
          }, 300);
        }
        
        // Forzar refresco de todos los componentes
        ViewChildHelper.updateAllComponents('actualizarDatos');
        
        this.cdRef.detectChanges();
      }
    } catch (error: any) {
      this.logger.error('Error al alternar ejemplo', error);
      const mensajeError = error?.message || 'Error desconocido al alternar el modo ejemplo';
      if (!mensajeError.includes('text.replace')) {
        alert(`No se pudo alternar el modo ejemplo.\n\n${mensajeError}`);
      }
    } finally {
      if (boton) { boton.disabled = false; }
    }
  }

  async descargarEjemplo(event?: Event) {
    try {
      const boton = event?.target as HTMLButtonElement;
      if (boton) { boton.disabled = true; boton.textContent = 'Generando...'; }

      const estabaEnModoEjemplo = this.modoEjemplo;
      if (!estabaEnModoEjemplo) {
        await this.verEjemplo();
        await new Promise(resolve => setTimeout(resolve, 250));
      }

      await this.exportarWord();

      if (!estabaEnModoEjemplo) {
        await this.verEjemplo();
      }

      if (boton) { boton.disabled = false; boton.textContent = 'Descargar Ejemplo'; }
    } catch (error) {
      this.logger.error('Error al descargar ejemplo', error);
      alert('Error al generar el documento ejemplo.');
      const boton = event?.target as HTMLButtonElement;
      if (boton) { boton.disabled = false; boton.textContent = 'Descargar Ejemplo'; }
    }
  }

  volverASeccion() {
    const state = window.history.state;
    let returnSection = state?.returnSection || this.storage.getItem('lastSectionId') || '3.1.1';
    
    // Asegurar que 'introduccion' siempre sea '3.1.1'
    if (returnSection === 'introduccion') {
      returnSection = '3.1.1';
    }
    
    this.router.navigate(['/seccion', returnSection]);
  }
}

