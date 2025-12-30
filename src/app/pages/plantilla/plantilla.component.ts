import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { WordGeneratorService } from 'src/app/core/services/word-generator.service';
import { Seccion1Component } from 'src/app/shared/components/seccion1/seccion1.component';
import { Seccion2Component } from 'src/app/shared/components/seccion2/seccion2.component';
import { Seccion3Component } from 'src/app/shared/components/seccion3/seccion3.component';
import { Seccion4Component } from 'src/app/shared/components/seccion4/seccion4.component';
import { Seccion5Component } from 'src/app/shared/components/seccion5/seccion5.component';
import { Seccion6Component } from 'src/app/shared/components/seccion6/seccion6.component';
import { Seccion7Component } from 'src/app/shared/components/seccion7/seccion7.component';
import { Seccion8Component } from 'src/app/shared/components/seccion8/seccion8.component';
import { Seccion9Component } from 'src/app/shared/components/seccion9/seccion9.component';
import { Seccion10Component } from 'src/app/shared/components/seccion10/seccion10.component';
import { Seccion11Component } from 'src/app/shared/components/seccion11/seccion11.component';
import { Seccion12Component } from 'src/app/shared/components/seccion12/seccion12.component';
import { Seccion13Component } from 'src/app/shared/components/seccion13/seccion13.component';
import { Seccion14Component } from 'src/app/shared/components/seccion14/seccion14.component';
import { Seccion15Component } from 'src/app/shared/components/seccion15/seccion15.component';
import { Seccion16Component } from 'src/app/shared/components/seccion16/seccion16.component';
import { Seccion17Component } from 'src/app/shared/components/seccion17/seccion17.component';
import { Seccion18Component } from 'src/app/shared/components/seccion18/seccion18.component';
import { Seccion19Component } from 'src/app/shared/components/seccion19/seccion19.component';
import { Seccion20Component } from 'src/app/shared/components/seccion20/seccion20.component';
import { Seccion21Component } from 'src/app/shared/components/seccion21/seccion21.component';
import { Seccion22Component } from 'src/app/shared/components/seccion22/seccion22.component';
import { Seccion23Component } from 'src/app/shared/components/seccion23/seccion23.component';
import { Seccion24Component } from 'src/app/shared/components/seccion24/seccion24.component';
import { Seccion25Component } from 'src/app/shared/components/seccion25/seccion25.component';
import { Seccion26Component } from 'src/app/shared/components/seccion26/seccion26.component';
import { Seccion27Component } from 'src/app/shared/components/seccion27/seccion27.component';
import { Seccion28Component } from 'src/app/shared/components/seccion28/seccion28.component';
import { Seccion29Component } from 'src/app/shared/components/seccion29/seccion29.component';
import { Seccion30Component } from 'src/app/shared/components/seccion30/seccion30.component';


@Component({
  selector: 'app-resumen',
  templateUrl: './plantilla.component.html',
})
export class ResumenComponent implements OnInit {
  @ViewChild(Seccion1Component) seccion1Component!: Seccion1Component;
  @ViewChild(Seccion2Component) seccion2Component!: Seccion2Component;
  @ViewChild(Seccion3Component) seccion3Component!: Seccion3Component;
  @ViewChild(Seccion4Component) seccion4Component!: Seccion4Component;
  @ViewChild(Seccion5Component) seccion5Component!: Seccion5Component;
  @ViewChild(Seccion6Component) seccion6Component!: Seccion6Component;
  @ViewChild(Seccion7Component) seccion7Component!: Seccion7Component;
  @ViewChild(Seccion8Component) seccion8Component!: Seccion8Component;
  @ViewChild(Seccion9Component) seccion9Component!: Seccion9Component;
  @ViewChild(Seccion10Component) seccion10Component!: Seccion10Component;
  @ViewChild(Seccion11Component) seccion11Component!: Seccion11Component;
  @ViewChild(Seccion12Component) seccion12Component!: Seccion12Component;
  @ViewChild(Seccion13Component) seccion13Component!: Seccion13Component;
  @ViewChild(Seccion14Component) seccion14Component!: Seccion14Component;
  @ViewChild(Seccion15Component) seccion15Component!: Seccion15Component;
  @ViewChild(Seccion16Component) seccion16Component!: Seccion16Component;
  @ViewChild(Seccion17Component) seccion17Component!: Seccion17Component;
  @ViewChild(Seccion18Component) seccion18Component!: Seccion18Component;
  @ViewChild(Seccion19Component) seccion19Component!: Seccion19Component;
  @ViewChild(Seccion20Component) seccion20Component!: Seccion20Component;
  @ViewChild(Seccion21Component) seccion21Component!: Seccion21Component;
  @ViewChild(Seccion22Component) seccion22Component!: Seccion22Component;
  @ViewChild(Seccion23Component) seccion23Component!: Seccion23Component;
  @ViewChild(Seccion24Component) seccion24Component!: Seccion24Component;
  @ViewChild(Seccion25Component) seccion25Component!: Seccion25Component;
  @ViewChild(Seccion26Component) seccion26Component!: Seccion26Component;
  @ViewChild(Seccion27Component) seccion27Component!: Seccion27Component;
  @ViewChild(Seccion28Component) seccion28Component!: Seccion28Component;
  @ViewChild(Seccion29Component) seccion29Component!: Seccion29Component;
  @ViewChild(Seccion30Component) seccion30Component!: Seccion30Component;
  
  datos: any;
  json: any;
  entrevistados: any[] = [];
  entrevistados2: { nombre: string; cargo: string; organizacion: string }[] = [];
  modoEjemplo: boolean = false;
  verEjemploLabel: string = 'Ver Ejemplo';
  datosBackup: any = null;
  jsonBackup: any = null;

  constructor(
    private formularioService: FormularioService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private wordGeneratorService: WordGeneratorService
  ) { }

  ngOnInit() {
    this.actualizarDatos();
  }

  actualizarDatos() {
    this.json = this.formularioService.obtenerJSON();
    this.datos = this.formularioService.obtenerDatos();
    if (this.datos && this.datos.entrevistados) {
      this.entrevistados = this.datos.entrevistados;
      this.entrevistados2 = this.datos.entrevistados;
    }
    
    // Actualizar seccion1 si existe
    if (this.seccion1Component) {
      this.seccion1Component.actualizarDatos();
    }
    
    // Actualizar seccion2 si existe
    if (this.seccion2Component) {
      this.seccion2Component.actualizarDatos();
    }
    
    // Actualizar seccion3 si existe
    if (this.seccion3Component) {
      this.seccion3Component.actualizarDatos();
    }
    
    // Actualizar seccion4 si existe
    if (this.seccion4Component) {
      this.seccion4Component.actualizarDatos();
    }
    
    if (this.seccion5Component) {
      this.seccion5Component.actualizarDatos();
    }
    
    if (this.seccion6Component) {
      this.seccion6Component.actualizarDatos();
    }
    
    if (this.seccion7Component) {
      this.seccion7Component.actualizarDatos();
    }
    
    if (this.seccion8Component) {
      this.seccion8Component.actualizarDatos();
    }
    
    if (this.seccion9Component) {
      this.seccion9Component.actualizarDatos();
    }
    
    if (this.seccion10Component) {
      this.seccion10Component.actualizarDatos();
    }
    
    if (this.seccion11Component) {
      this.seccion11Component.actualizarDatos();
    }
    
    if (this.seccion12Component) {
      this.seccion12Component.actualizarDatos();
    }
    
    if (this.seccion13Component) {
      this.seccion13Component.actualizarDatos();
    }
    
    if (this.seccion14Component) {
      this.seccion14Component.actualizarDatos();
    }
    
    if (this.seccion15Component) {
      this.seccion15Component.actualizarDatos();
    }
    
    if (this.seccion16Component) {
      this.seccion16Component.actualizarDatos();
    }
    
    if (this.seccion17Component) {
      this.seccion17Component.actualizarDatos();
    }
    
    if (this.seccion18Component) {
      this.seccion18Component.actualizarDatos();
    }
    
    if (this.seccion19Component) {
      this.seccion19Component.actualizarDatos();
    }
    
    if (this.seccion20Component) {
      this.seccion20Component.actualizarDatos();
    }
    
    if (this.seccion21Component) {
      this.seccion21Component.actualizarDatos();
    }
    
    if (this.seccion22Component) {
      this.seccion22Component.actualizarDatos();
    }
    
    if (this.seccion23Component) {
      this.seccion23Component.actualizarDatos();
    }
    
    if (this.seccion24Component) {
      this.seccion24Component.actualizarDatos();
    }
    
    if (this.seccion25Component) {
      this.seccion25Component.actualizarDatos();
    }
    
    if (this.seccion26Component) {
      this.seccion26Component.actualizarDatos();
    }
    
    if (this.seccion27Component) {
      this.seccion27Component.actualizarDatos();
    }
    
    if (this.seccion28Component) {
      this.seccion28Component.actualizarDatos();
    }
    
    if (this.seccion29Component) {
      this.seccion29Component.actualizarDatos();
    }
    
    if (this.seccion30Component) {
      this.seccion30Component.actualizarDatos();
    }
    
    this.cdRef.detectChanges();
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
    if (!texto || texto === '...') return '...';
    const textoTrim = texto.trim();
    if (/[.!?]$/.test(textoTrim)) {
      return textoTrim;
    }
    return textoTrim + '.';
  }

  normalizarDespuesDeQue(texto: string | undefined | null): string {
    if (!texto || texto === '...') return '...';
    let resultado = texto.trim();
    
    if (/^(el|la|los|las)\s+resto.+\s+por\s+/i.test(resultado)) {
      resultado = 'se considera ' + resultado;
    }
    
    if (resultado.length > 0 && /^[A-Z]/.test(resultado)) {
      const palabrasConMayuscula = ['El Proyecto', 'La Comunidad', 'Se consideran', 'Debido'];
      const empiezaConPalabra = palabrasConMayuscula.some(p => resultado.startsWith(p));
      
      if (!empiezaConPalabra) {
        resultado = resultado.charAt(0).toLowerCase() + resultado.slice(1);
      } else if (resultado.startsWith('Se consideran')) {
        resultado = 'se consideran' + resultado.slice(13);
      } else if (resultado.startsWith('El Proyecto')) {
        resultado = 'el Proyecto' + resultado.slice(11);
      }
    }
    
    return this.agregarPuntoFinal(resultado);
  }

  normalizarComponente1(texto: string | undefined | null): string {
    if (!texto || texto === '...') return '...';
    let resultado = texto.trim();
    
    if (/^el proyecto se ubica en el distrito de/i.test(resultado)) {
      resultado = resultado.replace(/^el proyecto se ubica en (el distrito de .+)/i, '$1');
    }
    
    if (resultado.length > 0 && /^[A-Z]/.test(resultado.charAt(0))) {
      const excepciones = ['El Proyecto', 'La Comunidad', 'Los centros'];
      const esExcepcion = excepciones.some(e => resultado.startsWith(e));
      
      if (!esExcepcion) {
        resultado = resultado.charAt(0).toLowerCase() + resultado.slice(1);
      } else if (resultado.startsWith('Los centros')) {
        resultado = 'los centros' + resultado.slice(11);
      } else if (resultado.startsWith('El Proyecto')) {
        resultado = 'el Proyecto' + resultado.slice(11);
      }
    }
    
    return this.agregarPuntoFinal(resultado);
  }

  normalizarDetalleProyecto(texto: string | undefined | null): string {
    if (!texto || texto === '...') return '...';
    let resultado = texto.trim();
    
    resultado = resultado.replace(/\bel\s+zona\b/gi, 'la zona');
    resultado = resultado.replace(/\bel\s+región\b/gi, 'la región');
    
    if (/^[A-Z]/.test(resultado)) {
      if (/^(zona|región|provincia|costa|sierra|selva)/i.test(resultado)) {
        resultado = 'la ' + resultado.charAt(0).toLowerCase() + resultado.slice(1);
      }
      else if (/^(distrito|departamento|valle|territorio)/i.test(resultado)) {
        resultado = 'el ' + resultado.charAt(0).toLowerCase() + resultado.slice(1);
      }
    }
    
    return resultado;
  }

  capitalizarTexto(texto: string): string {
    if (!texto || texto.trim() === '') return texto;
    const textoLimpio = texto.trim();
    return textoLimpio.charAt(0).toUpperCase() + textoLimpio.slice(1).toLowerCase();
  }

  normalizarNombreProyecto(texto: string | undefined | null, conArticulo: boolean = true): string {
    if (!texto || texto === '____' || texto === '...') return '____';
    let resultado = this.capitalizarTexto(texto.trim());
    
    if (conArticulo) {
      if (/^el proyecto /i.test(resultado)) {
        return resultado.charAt(0).toUpperCase() + resultado.slice(1);
      }
      else if (/^proyecto /i.test(resultado)) {
        return 'El ' + resultado.charAt(0).toUpperCase() + resultado.slice(1);
      }
      else {
        return 'El Proyecto ' + resultado;
      }
    } else {
      return resultado;
    }
  }
  calcularTotalPoblacion(): number {
    if (!this.datos.puntosPoblacion) return 0;
    return this.datos.puntosPoblacion.reduce((sum: number, punto: any) => sum + (punto.poblacion || 0), 0);
  }

  calcularTotalViviendasEmpadronadas(): number {
    if (!this.datos.puntosPoblacion) return 0;
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
    const titulo = this.datos?.['fotografiaIglesiaTitulo'] || 'Iglesia Matriz del anexo ' + (this.datos.grupoAISD || 'Ayroca');
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
    const titulo = this.datos?.['fotografiaReservorioTitulo'] || 'Reservorio del anexo ' + (this.datos.grupoAISD || 'Ayroca');
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
    const titulo = this.datos?.['fotografiaUsoSuelosTitulo'] || 'Uso de los suelos en el anexo ' + (this.datos.grupoAISD || 'Ayroca');
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
    if (!this.datos.puntosPoblacion) return 0;
    return this.datos.puntosPoblacion.reduce((sum: number, punto: any) => sum + (punto.viviendasOcupadas || 0), 0);
  }

  async exportarWord() {
    this.actualizarDatos();
    
    this.cdRef.detectChanges();
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const elemento = document.querySelector(".viewport-content") as HTMLElement || 
                     document.querySelector(".preview") as HTMLElement;
    if (!elemento) {
      console.error("No se encontró el contenido para exportar.");
      alert("No se pudo encontrar el contenido para exportar. Por favor, recarga la página e intenta nuevamente.");
      return;
    }

    const nombreArchivo = `LBS${this.datos?.projectName || 'Documento'}`.replace(/\s+/g, '');
    
    try {
      await this.wordGeneratorService.generarDocumento(elemento, nombreArchivo);
    } catch (error) {
      console.error("Error al exportar a Word:", error);
      alert("Hubo un error al exportar el documento. Por favor, intenta nuevamente.");
    }
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
      console.error('Error al hacer backup de datos:', error);
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
        this.cdRef.detectChanges();
      }
    } catch (error: any) {
      console.error('Error al alternar ejemplo:', error);
      const mensajeError = error?.message || 'Error desconocido al alternar el modo ejemplo';
      console.error('Detalle del error:', mensajeError);
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
      if (boton) { boton.disabled = false; boton.textContent = 'Descargar ejemplo'; }
    } catch (error) {
      console.error('Error al descargar ejemplo:', error);
      alert('Error al generar el documento ejemplo.');
      const boton = event?.target as HTMLButtonElement;
      if (boton) { boton.disabled = false; boton.textContent = 'Descargar ejemplo'; }
    }
  }

}

