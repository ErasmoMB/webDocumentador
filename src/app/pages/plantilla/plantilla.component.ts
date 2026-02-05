import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { WordGeneratorService } from 'src/app/core/services/word-generator.facade.service';
import { TextNormalizationService } from 'src/app/core/services/text-normalization.service';
import { LoggerService } from 'src/app/core/services/infrastructure/logger.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { FormularioDatos, CentroPobladoData, Entrevistado } from 'src/app/core/models/formulario.model';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { Seccion1Component } from 'src/app/shared/components/seccion1/seccion1.component';
import { Seccion2ViewComponent } from 'src/app/shared/components/seccion2/seccion2-view.component';
import { Seccion3ViewComponent } from 'src/app/shared/components/seccion3/seccion3-view.component';
import { Seccion4Component } from 'src/app/shared/components/seccion4/seccion4.component';
import { Seccion5Component } from 'src/app/shared/components/seccion5/seccion5.component';
import { Seccion6Component } from 'src/app/shared/components/seccion6/seccion6.component';
import { Seccion7ViewComponent } from 'src/app/shared/components/seccion7/seccion7-view.component';
import { Seccion8ViewComponent } from 'src/app/shared/components/seccion8/seccion8-view.component';
import { Seccion9ViewComponent } from 'src/app/shared/components/seccion9/seccion9-view.component';
import { Seccion10FormWrapperComponent } from 'src/app/shared/components/forms/seccion10-form-wrapper.component';
import { Seccion10ViewComponent } from 'src/app/shared/components/seccion10/seccion10-view.component';
import { Seccion11FormWrapperComponent } from 'src/app/shared/components/forms/seccion11-form-wrapper.component';
import { Seccion11ViewComponent } from 'src/app/shared/components/seccion11/seccion11-view.component';
import { Seccion12FormWrapperComponent } from 'src/app/shared/components/forms/seccion12-form-wrapper.component';
import { Seccion13FormWrapperComponent } from 'src/app/shared/components/forms/seccion13-form-wrapper.component';
import { Seccion13ViewComponent } from 'src/app/shared/components/seccion13/seccion13-view.component';
import { Seccion14FormWrapperComponent } from 'src/app/shared/components/forms/seccion14-form-wrapper.component';
import { Seccion14ViewComponent } from 'src/app/shared/components/seccion14/seccion14-view.component';
import { Seccion15ViewComponent } from 'src/app/shared/components/seccion15/seccion15-view.component';
import { Seccion16Component } from 'src/app/shared/components/seccion16/seccion16.component';
import { Seccion17FormComponent } from 'src/app/shared/components/seccion17/seccion17-form.component';
import { Seccion18FormComponent } from 'src/app/shared/components/seccion18/seccion18-form.component';
import { Seccion18FormWrapperComponent } from 'src/app/shared/components/forms/seccion18-form-wrapper.component';
import { Seccion18ViewComponent } from 'src/app/shared/components/seccion18/seccion18-view.component';
import { Seccion19FormWrapperComponent } from 'src/app/shared/components/forms/seccion19-form-wrapper.component';
import { Seccion19ViewComponent } from 'src/app/shared/components/seccion19/seccion19-view.component';
import { Seccion20ViewComponent } from 'src/app/shared/components/seccion20/seccion20-view.component';
import { Seccion20FormWrapperComponent } from 'src/app/shared/components/forms/seccion20-form-wrapper.component';
import { Seccion21ViewComponent } from 'src/app/shared/components/seccion21/seccion21-view.component';
import { Seccion21FormWrapperComponent } from 'src/app/shared/components/forms/seccion21-form-wrapper.component';
import { Seccion22ViewComponent } from 'src/app/shared/components/seccion22/seccion22-view.component';
import { Seccion22FormWrapperComponent } from 'src/app/shared/components/forms/seccion22-form-wrapper.component';
import { Seccion23ViewComponent } from 'src/app/shared/components/seccion23/seccion23-view.component';
import { Seccion23FormWrapperComponent } from 'src/app/shared/components/forms/seccion23-form-wrapper.component';
import { Seccion24Component } from 'src/app/shared/components/seccion24/seccion24.component';
import { Seccion25Component } from 'src/app/shared/components/seccion25/seccion25.component';
import { Seccion26Component } from 'src/app/shared/components/seccion26/seccion26.component';
import { Seccion27Component } from 'src/app/shared/components/seccion27/seccion27.component';
import { Seccion28Component } from 'src/app/shared/components/seccion28/seccion28.component';
import { Seccion29Component } from 'src/app/shared/components/seccion29/seccion29.component';
import { Seccion30Component } from 'src/app/shared/components/seccion30/seccion30.component';
import { Seccion31Component } from 'src/app/shared/components/seccion31/seccion31.component';
import { Seccion32Component } from 'src/app/shared/components/seccion32/seccion32.component';
import { Seccion33Component } from 'src/app/shared/components/seccion33/seccion33.component';
import { Seccion34Component } from 'src/app/shared/components/seccion34/seccion34.component';
import { Seccion35Component } from 'src/app/shared/components/seccion35/seccion35.component';
import { Seccion36Component } from 'src/app/shared/components/seccion36/seccion36.component';


@Component({
    selector: 'app-resumen',
    templateUrl: './plantilla.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ResumenComponent implements OnInit, AfterViewInit {
  @ViewChild(Seccion1Component) set seccion1(comp: Seccion1Component) {
    ViewChildHelper.registerComponent('seccion1', comp);
  }
  @ViewChild(Seccion2ViewComponent) set seccion2(comp: Seccion2ViewComponent) {
    // El componente de vista contiene Seccion2Component internamente
    if (comp && comp.seccion2Component) {
      ViewChildHelper.registerComponent('seccion2', comp.seccion2Component);
    }
  }
  @ViewChild(Seccion3ViewComponent) set seccion3(comp: Seccion3ViewComponent) {
    // El componente de vista contiene Seccion3Component internamente
    if (comp && comp.seccion3Component) {
      ViewChildHelper.registerComponent('seccion3', comp.seccion3Component);
    }
  }
  @ViewChild(Seccion4Component) set seccion4(comp: Seccion4Component) {
    ViewChildHelper.registerComponent('seccion4', comp);
  }
  @ViewChild(Seccion5Component) set seccion5(comp: Seccion5Component) {
    ViewChildHelper.registerComponent('seccion5', comp);
  }
  @ViewChild(Seccion6Component) set seccion6(comp: Seccion6Component) {
    ViewChildHelper.registerComponent('seccion6', comp);
  }
  @ViewChild(Seccion7ViewComponent) set seccion7(comp: Seccion7ViewComponent) {
    // El componente de vista contiene la lógica de Seccion7 internamente
    if (comp && comp.seccion7InternalComponent) {
      ViewChildHelper.registerComponent('seccion7', comp.seccion7InternalComponent);
    }
  }
  @ViewChild(Seccion8ViewComponent) set seccion8(comp: Seccion8ViewComponent) {
    ViewChildHelper.registerComponent('seccion8', comp);
  }
  @ViewChild(Seccion9ViewComponent) set seccion9(comp: Seccion9ViewComponent) {
    ViewChildHelper.registerComponent('seccion9', comp);
  }
  @ViewChild(Seccion10ViewComponent) set seccion10(comp: Seccion10ViewComponent) {
    ViewChildHelper.registerComponent('seccion10', comp);
  }
  @ViewChild(Seccion11ViewComponent) set seccion11(comp: Seccion11ViewComponent) {
    ViewChildHelper.registerComponent('seccion11', comp);
  }
  @ViewChild(Seccion12FormWrapperComponent) set seccion12(comp: Seccion12FormWrapperComponent) {
    ViewChildHelper.registerComponent('seccion12', comp);
  }
  @ViewChild(Seccion13ViewComponent) set seccion13View(comp: Seccion13ViewComponent) {
    ViewChildHelper.registerComponent('seccion13', comp);
  }
  @ViewChild(Seccion13FormWrapperComponent) set seccion13Form(comp: Seccion13FormWrapperComponent) {
    ViewChildHelper.registerComponent('seccion13Form', comp);
  }
  @ViewChild(Seccion14FormWrapperComponent) set seccion14(comp: Seccion14FormWrapperComponent) {
    ViewChildHelper.registerComponent('seccion14', comp);
  }
  @ViewChild(Seccion15ViewComponent) set seccion15(comp: Seccion15ViewComponent) {
    ViewChildHelper.registerComponent('seccion15', comp);
  }
  @ViewChild(Seccion16Component) set seccion16(comp: Seccion16Component) {
    ViewChildHelper.registerComponent('seccion16', comp);
  }
  @ViewChild(Seccion17FormComponent) set seccion17(comp: Seccion17FormComponent) {
    ViewChildHelper.registerComponent('seccion17', comp);
  }
  @ViewChild(Seccion18FormComponent) set seccion18(comp: Seccion18FormComponent) {
    ViewChildHelper.registerComponent('seccion18', comp);
  }
  @ViewChild(Seccion18ViewComponent) set seccion18View(comp: Seccion18ViewComponent) {
    ViewChildHelper.registerComponent('seccion18View', comp);
  }
  @ViewChild(Seccion19ViewComponent) set seccion19View(comp: Seccion19ViewComponent) {
    ViewChildHelper.registerComponent('seccion19View', comp);
  }
  @ViewChild(Seccion19FormWrapperComponent) set seccion19FormWrapper(comp: Seccion19FormWrapperComponent) {
    ViewChildHelper.registerComponent('seccion19FormWrapper', comp);
  }
  @ViewChild(Seccion20ViewComponent) set seccion20View(comp: Seccion20ViewComponent) {
    ViewChildHelper.registerComponent('seccion20View', comp);
  }
  @ViewChild(Seccion20FormWrapperComponent) set seccion20FormWrapper(comp: Seccion20FormWrapperComponent) {
    ViewChildHelper.registerComponent('seccion20FormWrapper', comp);
  }
  @ViewChild(Seccion21ViewComponent) set seccion21View(comp: Seccion21ViewComponent) {
    ViewChildHelper.registerComponent('seccion21', comp);
  }
  @ViewChild(Seccion21FormWrapperComponent) set seccion21FormWrapper(comp: Seccion21FormWrapperComponent) {
    ViewChildHelper.registerComponent('seccion21FormWrapper', comp);
  }
  @ViewChild(Seccion22ViewComponent) set seccion22View(comp: Seccion22ViewComponent) {
    ViewChildHelper.registerComponent('seccion22', comp);
  }
  @ViewChild(Seccion22FormWrapperComponent) set seccion22FormWrapper(comp: Seccion22FormWrapperComponent) {
    ViewChildHelper.registerComponent('seccion22FormWrapper', comp);
  }
  @ViewChild(Seccion23ViewComponent) set seccion23View(comp: Seccion23ViewComponent) {
    if (comp) ViewChildHelper.registerComponent('seccion23', comp);
  }
  @ViewChild(Seccion23FormWrapperComponent) set seccion23FormWrapper(comp: Seccion23FormWrapperComponent) {
    if (comp) ViewChildHelper.registerComponent('seccion23FormWrapper', comp);
  }
  @ViewChild(Seccion24Component) set seccion24(comp: Seccion24Component) {
    // [Plantilla DEBUG] seccion24 ViewChild set: !!comp
    ViewChildHelper.registerComponent('seccion24', comp);
  }
  @ViewChild(Seccion25Component) set seccion25(comp: Seccion25Component) {
    ViewChildHelper.registerComponent('seccion25', comp);
  }
  @ViewChild(Seccion26Component) set seccion26(comp: Seccion26Component) {
    ViewChildHelper.registerComponent('seccion26', comp);
  }
  @ViewChild(Seccion27Component) set seccion27(comp: Seccion27Component) {
    ViewChildHelper.registerComponent('seccion27', comp);
  }
  @ViewChild(Seccion28Component) set seccion28(comp: Seccion28Component) {
    ViewChildHelper.registerComponent('seccion28', comp);
  }
  @ViewChild(Seccion29Component) set seccion29(comp: Seccion29Component) {
    ViewChildHelper.registerComponent('seccion29', comp);
  }
  @ViewChild(Seccion30Component) set seccion30(comp: Seccion30Component) {
    ViewChildHelper.registerComponent('seccion30', comp);
  }
  @ViewChild(Seccion31Component) set seccion31(comp: Seccion31Component) {
    ViewChildHelper.registerComponent('seccion31', comp);
  }
  @ViewChild(Seccion32Component) set seccion32(comp: Seccion32Component) {
    ViewChildHelper.registerComponent('seccion32', comp);
  }
  @ViewChild(Seccion33Component) set seccion33(comp: Seccion33Component) {
    ViewChildHelper.registerComponent('seccion33', comp);
  }
  @ViewChild(Seccion34Component) set seccion34(comp: Seccion34Component) {
    ViewChildHelper.registerComponent('seccion34', comp);
  }
  @ViewChild(Seccion35Component) set seccion35(comp: Seccion35Component) {
    ViewChildHelper.registerComponent('seccion35', comp);
  }
  @ViewChild(Seccion36Component) set seccion36(comp: Seccion36Component) {
    ViewChildHelper.registerComponent('seccion36', comp);
  }
  
  datos: FormularioDatos | null = null;
  json: CentroPobladoData[] = [];
  entrevistados: Entrevistado[] = [];
  entrevistados2: Entrevistado[] = [];
  modoEjemplo: boolean = false;
  verEjemploLabel: string = 'Ver Ejemplo';
  datosBackup: FormularioDatos | null = null;
  jsonBackup: CentroPobladoData[] | null = null;
  private isUpdating: boolean = false;

  constructor(
    private projectFacade: ProjectStateFacade,
    private formularioService: FormularioService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private wordGeneratorService: WordGeneratorService,
    private textNormalization: TextNormalizationService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.actualizarDatos();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.actualizarDatos();
    }, 100);
  }

  actualizarDatos() {
    if (this.isUpdating) {
      return;
    }
    this.isUpdating = true;
    try {
      const datosCompletos = this.projectFacade.obtenerDatos();
      this.json = datosCompletos['centrosPobladosJSON'] || [];
      this.datos = datosCompletos as FormularioDatos;
      if (this.datos && this.datos.entrevistados) {
        this.entrevistados = this.datos.entrevistados;
        this.entrevistados2 = this.datos.entrevistados;
      }
      
      ViewChildHelper.updateAllComponents('actualizarDatos');
      
      this.cdRef.detectChanges();
    } finally {
      this.isUpdating = false;
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

  getFilasTablaAISD2(): any[] {
    const filas: any[] = [];
    const filasActivas = this.formularioService.obtenerFilasActivasTablaAISD2();
    
    // Buscar todas las filas con datos (hasta 20 filas máximo)
    for (let i = 1; i <= 20; i++) {
      const punto = this.datos?.[`tablaAISD2Fila${i}Punto`];
      const codigo = this.datos?.[`tablaAISD2Fila${i}Codigo`];
      const poblacion = this.datos?.[`tablaAISD2Fila${i}Poblacion`];
      const viviendasEmp = this.datos?.[`tablaAISD2Fila${i}ViviendasEmpadronadas`];
      const viviendasOcp = this.datos?.[`tablaAISD2Fila${i}ViviendasOcupadas`];
      
      const codigoStr = codigo ? codigo.toString().trim() : '';
      const esFilaActiva = filasActivas.length === 0 || filasActivas.includes(codigoStr);
      
      // Incluir fila solo si está activa y tiene al menos un dato
      if (esFilaActiva && (punto || codigo || poblacion || viviendasEmp || viviendasOcp)) {
        filas.push({
          punto: punto || '____',
          codigo: codigo || '____',
          poblacion: poblacion || '____',
          viviendasEmpadronadas: viviendasEmp || '____',
          viviendasOcupadas: viviendasOcp || '____'
        });
      }
    }
    
    // Si no hay filas, mostrar una fila vacía
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

  getFotografiasAISD(): any[] {
    const fotos: any[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const titulo = this.datos?.[`fotografiaAISD${i}Titulo`];
      const fuente = this.datos?.[`fotografiaAISD${i}Fuente`];
      const imagen = this.datos?.[`fotografiaAISD${i}Imagen`];
      
      if (imagen) {
        fotos.push({
          numero: i,
          titulo: titulo || 'Título de fotografía',
          fuente: fuente || 'GEADES, 2024',
          preview: imagen
        });
      }
    }
    
    return fotos;
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

  getPorcentajeCastellano(): string {
    if (!this.datos?.lenguasMaternasTabla || !Array.isArray(this.datos.lenguasMaternasTabla)) {
      return '____';
    }
    const castellano = this.datos.lenguasMaternasTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('castellano') || item.categoria.toLowerCase().includes('español'))
    );
    return castellano?.porcentaje || '____';
  }

  getPorcentajeQuechua(): string {
    if (!this.datos?.lenguasMaternasTabla || !Array.isArray(this.datos.lenguasMaternasTabla)) {
      return '____';
    }
    const quechua = this.datos.lenguasMaternasTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('quechua')
    );
    return quechua?.porcentaje || '____';
  }

  getFotoIglesia(): any {
    const titulo = this.datos?.['fotografiaIglesiaTitulo'] || 'Iglesia Matriz del anexo ' + (this.datos?.grupoAISD || 'Ayroca');
    const fuente = this.datos?.['fotografiaIglesiaFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaIglesiaImagen'] || '';
    
    return {
      numero: '3. 18',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoReservorio(): any {
    const titulo = this.datos?.['fotografiaReservorioTitulo'] || 'Reservorio del anexo ' + (this.datos?.grupoAISD || 'Ayroca');
    const fuente = this.datos?.['fotografiaReservorioFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaReservorioImagen'] || '';
    
    return {
      numero: '3. 20',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoUsoSuelos(): any {
    const titulo = this.datos?.['fotografiaUsoSuelosTitulo'] || 'Uso de los suelos en el anexo ' + (this.datos?.grupoAISD || 'Ayroca');
    const fuente = this.datos?.['fotografiaUsoSuelosFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaUsoSuelosImagen'] || '';
    
    return {
      numero: '3. 24',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  calcularTotalViviendasOcupadas(): number {
    if (!this.datos?.puntosPoblacion) return 0;
    return this.datos.puntosPoblacion.reduce((sum: number, punto: any) => sum + (punto.viviendasOcupadas || 0), 0);
  }

  async exportarWord() {
    try {
      this.actualizarDatos();
      this.cdRef.detectChanges();
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const elemento = document.querySelector(".viewport-content") as HTMLElement || 
                       document.querySelector(".preview") as HTMLElement;
      if (!elemento) {
        this.logger.error("No se encontró el contenido para exportar.");
        alert("No se pudo encontrar el contenido para exportar. Por favor, recarga la página e intenta nuevamente.");
        return;
      }

      const nombreArchivo = `LBS${String(this.datos?.projectName || 'Documento')}`.replace(/\s+/g, '');
      
      await this.wordGeneratorService.generarDocumento(elemento, nombreArchivo);
      this.logger.info("Documento exportado correctamente");
    } catch (error: any) {
      this.logger.error("Error al exportar a Word", error);
      const mensajeError = error?.message || "Error desconocido";
      alert(`Hubo un error al exportar el documento: ${mensajeError}. Por favor, intenta nuevamente.`);
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
        this.modoEjemplo = true;
        this.verEjemploLabel = 'Volver a mis datos';
        ViewChildHelper.updateAllComponents('actualizarDatos');
        this.cdRef.detectChanges();
      } else {
        if (this.datosBackup) {
          this.formularioService.actualizarDatos(this.datosBackup);
          if (this.jsonBackup !== null && this.jsonBackup !== undefined) {
            this.formularioService.guardarJSON(this.jsonBackup);
          }
        } else {
          this.formularioService.limpiarDatos();
          this.formularioService.guardarJSON([]);
        }
        
        this.datos = this.projectFacade.obtenerDatos() as FormularioDatos;
        this.json = this.formularioService.obtenerJSON();
        this.modoEjemplo = false;
        this.verEjemploLabel = 'Ver Ejemplo';
        
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

      if (boton) { boton.disabled = false; boton.textContent = 'Descargar ejemplo'; }
    } catch (error) {
      this.logger.error('Error al descargar ejemplo', error);
      alert('Error al generar el documento ejemplo.');
      const boton = event?.target as HTMLButtonElement;
      if (boton) { boton.disabled = false; boton.textContent = 'Descargar ejemplo'; }
    }
  }

}

