import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { WordGeneratorService } from 'src/app/core/services/word-generator.service';
import { TextNormalizationService } from 'src/app/core/services/text-normalization.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import { ResumenComponent } from './plantilla.component';
import { FormularioDatos, CentroPobladoData } from 'src/app/core/models/formulario.model';

@Component({
  selector: 'app-plantilla-view',
  templateUrl: './plantilla-view.component.html',
  styleUrls: ['./plantilla-view.component.css']
})
export class PlantillaViewComponent implements OnInit, AfterViewInit {
  @ViewChild(ResumenComponent) resumenComponent!: ResumenComponent;
  
  datos: FormularioDatos | null = null;
  json: CentroPobladoData[] = [];
  modoEjemplo: boolean = false;
  verEjemploLabel: string = 'Ver Ejemplo';
  datosBackup: FormularioDatos | null = null;
  jsonBackup: CentroPobladoData[] | null = null;

  constructor(
    private formularioService: FormularioService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private wordGeneratorService: WordGeneratorService,
    private textNormalization: TextNormalizationService,
    private logger: LoggerService
  ) {}

  ngOnInit() {
    this.json = this.formularioService.obtenerJSON();
    this.datos = this.formularioService.obtenerDatos();
    
    const state = window.history.state;
    if (state?.returnSection) {
      localStorage.setItem('lastSectionId', state.returnSection);
    }
  }

  ngAfterViewInit() {
    if (this.resumenComponent) {
      this.resumenComponent.actualizarDatos();
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
    const elemento = document.querySelector(".viewport-content") as HTMLElement || 
                     document.querySelector(".preview") as HTMLElement;
    if (!elemento) {
      this.logger.error("No se encontró el contenido para exportar.");
      return;
    }

    const nombreArchivo = `LBS${this.datos?.projectName || 'Documento'}`.replace(/\s+/g, '');
    await this.wordGeneratorService.generarDocumento(elemento, nombreArchivo);
  }

  private hacerBackupSeguro(): boolean {
    try {
      const datosActuales = this.formularioService.obtenerDatos();
      const jsonActual = this.formularioService.obtenerJSON();
      
      if (datosActuales) {
        this.datosBackup = JSON.parse(JSON.stringify(datosActuales));
      }
      if (jsonActual !== null && jsonActual !== undefined) {
        this.jsonBackup = JSON.parse(JSON.stringify(jsonActual));
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
        if (!this.hacerBackupSeguro()) {
          throw new Error('No se pudo hacer backup de los datos actuales. Verifique la consola para más detalles.');
        }

        const ok = await this.formularioService.cargarMockCapitulo3();
        if (!ok) {
          throw new Error('No se pudo cargar el mock capitulo3.json. Verifique que el archivo existe.');
        }
        
        this.datos = this.formularioService.obtenerDatos();
        this.json = this.formularioService.obtenerJSON();
        this.modoEjemplo = true;
        this.verEjemploLabel = 'Volver a mis datos';
        
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
        
        this.cdRef.detectChanges();
      } else {
        if (!this.datosBackup) {
          throw new Error('No hay datos de backup para restaurar. Los datos originales se perdieron.');
        }

        this.formularioService.reemplazarDatos(this.datosBackup);
        if (this.jsonBackup !== null && this.jsonBackup !== undefined) {
          this.formularioService.guardarJSON(this.jsonBackup);
        }
        
        this.datos = this.formularioService.obtenerDatos();
        this.json = this.formularioService.obtenerJSON();
        this.modoEjemplo = false;
        this.verEjemploLabel = 'Ver Ejemplo';
        
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
        
        this.cdRef.detectChanges();
      }
    } catch (error: any) {
      this.logger.error('Error al alternar ejemplo', error);
      const mensajeError = error?.message || 'Error desconocido al alternar el modo ejemplo';
      alert(`No se pudo alternar el modo ejemplo.\n\n${mensajeError}`);
    } finally {
      if (boton) { boton.disabled = false; }
    }
  }

  async descargarEjemplo(event?: Event) {
    try {
      const boton = event?.target as HTMLButtonElement;
      if (boton) { boton.disabled = true; boton.textContent = 'Generando...'; }
      await this.wordGeneratorService.generarDocumentoEjemplo();
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
    const returnSection = state?.returnSection || localStorage.getItem('lastSectionId') || '3.1.1';
    
    this.router.navigate(['/seccion', returnSection]);
  }
}

