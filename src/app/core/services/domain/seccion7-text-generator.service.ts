import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PrefijoHelper } from '../../../shared/utils/prefijo-helper';

/**
 * Servicio para generar textos dinámicos de la Sección 7 (Situación de Empleo e Ingresos).
 * Genera párrafos con datos calculados y resaltados para PET, PEA y Empleo.
 */
@Injectable({
  providedIn: 'root'
})
export class Seccion7TextGeneratorService {

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Obtiene el texto completo sobre PET (Población en Edad de Trabajar)
   */
  obtenerTextoSeccion7PETCompleto(
    datos: any,
    seccionId: string,
    getPorcentajePET: () => string,
    getPorcentajePETGrupo: (grupo: string) => string,
    obtenerNombreComunidad: () => string
  ): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
    let textoPersonalizado = datos.parrafoSeccion7_pet_completo;
    if (!textoPersonalizado && prefijo) {
      textoPersonalizado = datos[`parrafoSeccion7_pet_completo${prefijo}`];
    }
    if (textoPersonalizado && textoPersonalizado.trim() !== '') {
      return textoPersonalizado;
    }
    
    const grupoAISD = obtenerNombreComunidad();
    const porcentajePET = getPorcentajePET();
    const porcentaje1529 = getPorcentajePETGrupo('15 a 29');
    const porcentaje65 = getPorcentajePETGrupo('65');
    
    return `En concordancia con el Convenio 138 de la Organización Internacional de Trabajo (OIT), aprobado por Resolución Legislativa Nº27453 de fecha 22 de mayo del 2001 y ratificado por DS Nº038-2001-RE, publicado el 31 de mayo de 2001, la población cumplida los 14 años de edad se encuentra en edad de trabajar.\n\nLa población en edad de trabajar (PET) de la CC ${grupoAISD}, considerada desde los 15 años a más, se compone del ${porcentajePET} de la población total. El bloque etario que más aporta a la PET es el de 15 a 29 años, pues representa el ${porcentaje1529} de este grupo poblacional. Por otro lado, el grupo etario que menos aporta al indicador es el de 65 años a más al representar solamente un ${porcentaje65}.`;
  }

  /**
   * Obtiene el texto completo sobre PET con resaltado HTML
   */
  obtenerTextoSeccion7PETCompletoConResaltado(
    datos: any,
    seccionId: string,
    getPorcentajePET: () => string,
    getPorcentajePETGrupo: (grupo: string) => string,
    obtenerNombreComunidad: () => string
  ): SafeHtml {
    const texto = this.obtenerTextoSeccion7PETCompleto(
      datos,
      seccionId,
      getPorcentajePET,
      getPorcentajePETGrupo,
      obtenerNombreComunidad
    );
    
    const grupoAISD = obtenerNombreComunidad();
    const porcentajePET = getPorcentajePET();
    const porcentaje1529 = getPorcentajePETGrupo('15 a 29');
    const porcentaje65 = getPorcentajePETGrupo('65');
    
    let html = this.escapeHtml(texto);
    
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    
    if (porcentajePET && porcentajePET !== '____' && porcentajePET !== '____%') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajePET), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajePET)}</span>`);
    }
    
    if (porcentaje1529 && porcentaje1529 !== '____' && porcentaje1529 !== '____%') {
      html = html.replace(new RegExp(this.escapeRegex(porcentaje1529), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentaje1529)}</span>`);
    }
    
    if (porcentaje65 && porcentaje65 !== '____' && porcentaje65 !== '____%') {
      html = html.replace(new RegExp(this.escapeRegex(porcentaje65), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentaje65)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Obtiene el texto completo sobre Situación de Empleo
   */
  obtenerTextoSeccion7SituacionEmpleoCompleto(
    datos: any,
    seccionId: string,
    obtenerNombreComunidad: () => string
  ): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
    let textoPersonalizado = datos.parrafoSeccion7_situacion_empleo_completo;
    if (!textoPersonalizado && prefijo) {
      textoPersonalizado = datos[`parrafoSeccion7_situacion_empleo_completo${prefijo}`];
    }
    if (textoPersonalizado && textoPersonalizado.trim() !== '') {
      return textoPersonalizado;
    }
    
    const grupoAISD = obtenerNombreComunidad();
    return `En la CC ${grupoAISD}, la mayor parte de la población se dedica a actividades económicas de carácter independiente, siendo la ganadería la principal fuente de sustento. De manera complementaria, también se desarrolla la agricultura. Esta realidad implica que la mayoría de los comuneros se dediquen al trabajo por cuenta propia, centrado en la crianza de vacunos y ovinos como las principales especies ganaderas. Estas actividades son claves para la economía local, siendo la venta de ganado y sus derivados una fuente de ingresos importante para las familias. En el ámbito agrícola, las tierras comunales se destinan a la producción de cultivos como la papa, habas y cebada, productos que se destinan principalmente al autoconsumo y de manera esporádica a la comercialización en mercados cercanos.\n\nEl empleo dependiente en la CC ${grupoAISD} es mínimo y se encuentra limitado a aquellos que trabajan en instituciones públicas. Entre ellos se encuentran los docentes que laboran en las instituciones educativas locales, así como el personal que presta servicios en el puesto de salud. Estas ocupaciones representan un pequeño porcentaje de la fuerza laboral, ya que la mayoría de los comuneros siguen trabajando en actividades tradicionales como la ganadería y la agricultura, que forman parte de su modo de vida ancestral.`;
  }

  /**
   * Obtiene el texto completo sobre Situación de Empleo con resaltado HTML
   */
  obtenerTextoSeccion7SituacionEmpleoCompletoConResaltado(
    datos: any,
    seccionId: string,
    obtenerNombreComunidad: () => string
  ): SafeHtml {
    const texto = this.obtenerTextoSeccion7SituacionEmpleoCompleto(datos, seccionId, obtenerNombreComunidad);
    const grupoAISD = obtenerNombreComunidad();
    
    let html = this.escapeHtml(texto);
    html = html.replace(/\n/g, '<br>');
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Obtiene el texto completo sobre Ingresos
   */
  obtenerTextoSeccion7IngresosCompleto(
    datos: any,
    seccionId: string,
    obtenerNombreComunidad: () => string
  ): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
    let textoPersonalizado = datos.parrafoSeccion7_ingresos_completo;
    if (!textoPersonalizado && prefijo) {
      textoPersonalizado = datos[`parrafoSeccion7_ingresos_completo${prefijo}`];
    }
    if (textoPersonalizado && textoPersonalizado.trim() !== '') {
      return textoPersonalizado;
    }
    
    const grupoAISD = obtenerNombreComunidad();
    const distrito = datos.distritoSeleccionado || '____';
    const ingresoPerCapita = datos.ingresoFamiliarPerCapita || '____';
    const ranking = datos.rankingIngresoPerCapita || '____';
    
    return `En la CC ${grupoAISD}, los ingresos de la población provienen principalmente de las actividades ganaderas y agrícolas, que son las fuentes económicas predominantes en la localidad. La venta de vacunos y ovinos, así como de productos agrícolas como papa, habas y cebada, proporciona ingresos variables, dependiendo de las condiciones climáticas y las fluctuaciones en los mercados locales. Sin embargo, debido a la dependencia de estos sectores primarios, los ingresos no son estables ni regulares, y pueden verse afectados por factores como las heladas, la falta de pasto en épocas de sequía o la baja demanda de los productos en el mercado.\n\nOtra parte de los ingresos proviene de los comuneros que participan en actividades de comercio de pequeña escala, vendiendo sus productos en mercados locales o en ferias regionales. No obstante, esta forma de generación de ingresos sigue siendo limitada y no representa una fuente principal para la mayoría de las familias. En cuanto a los pocos habitantes que se encuentran empleados de manera dependiente, tales como los maestros en las instituciones educativas y el personal del puesto de salud, sus ingresos son más regulares, aunque representan una porción muy pequeña de la población.\n\nAdicionalmente, cabe mencionar que, según el informe del PNUD 2019, el distrito de ${distrito} (jurisdicción que abarca a los poblados que conforman la CC ${grupoAISD}) cuenta con un ingreso familiar per cápita de S/. ${ingresoPerCapita} mensuales, ocupando el puesto N°${ranking} en el ranking de dicha variable, lo que convierte a dicha jurisdicción en una de las que cuentan con menor ingreso familiar per cápita en todo el país.`;
  }

  /**
   * Obtiene el texto completo sobre Ingresos con resaltado HTML
   */
  obtenerTextoSeccion7IngresosCompletoConResaltado(
    datos: any,
    seccionId: string,
    obtenerNombreComunidad: () => string
  ): SafeHtml {
    const texto = this.obtenerTextoSeccion7IngresosCompleto(datos, seccionId, obtenerNombreComunidad);
    const grupoAISD = obtenerNombreComunidad();
    const distrito = datos.distritoSeleccionado || '____';
    const ingresoPerCapita = datos.ingresoFamiliarPerCapita || '____';
    const ranking = datos.rankingIngresoPerCapita || '____';
    
    let html = this.escapeHtml(texto);
    html = html.replace(/\n/g, '<br>');
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (ingresoPerCapita && ingresoPerCapita !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(ingresoPerCapita), 'g'), `<span class="data-manual">${this.escapeHtml(ingresoPerCapita)}</span>`);
    }
    if (ranking && ranking !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(ranking), 'g'), `<span class="data-manual">${this.escapeHtml(ranking)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Obtiene el texto sobre PET (versión corta)
   */
  obtenerTextoPET(
    datos: any,
    getPorcentajePETGrupo: (grupo: string) => string,
    obtenerNombreComunidad: () => string
  ): string {
    if (datos.textoPET && datos.textoPET !== '____') {
      return datos.textoPET;
    }
    
    const grupoAISD = obtenerNombreComunidad();
    const porcentaje1429 = getPorcentajePETGrupo('14 a 29');
    const porcentaje65 = getPorcentajePETGrupo('65');
    
    return `En concordancia con el Convenio 138 de la Organización Internacional de Trabajo (OIT), aprobado por Resolución Legislativa Nº27453 de fecha 22 de mayo del 2001 y ratificado por DS Nº038-2001-RE, publicado el 31 de mayo de 2001, la población cumplida los 14 años de edad se encuentra en edad de trabajar. La población en edad de trabajar (PET) de la CC ${grupoAISD}, considerada desde los 15 años a más, se compone del total mostrado en la tabla siguiente. El bloque etario que más aporta a la PET es el de 14 a 29 años, pues representa el ${porcentaje1429} de este grupo poblacional. Por otro lado, el grupo etario que menos aporta al indicador es el de 65 años a más al representar solamente un ${porcentaje65}.`;
  }

  /**
   * Obtiene el texto sobre PET con resaltado HTML
   */
  obtenerTextoPETConResaltado(
    datos: any,
    getPorcentajePETGrupo: (grupo: string) => string,
    obtenerNombreComunidad: () => string
  ): SafeHtml {
    const texto = this.obtenerTextoPET(datos, getPorcentajePETGrupo, obtenerNombreComunidad);
    const grupoAISD = obtenerNombreComunidad();
    const porcentaje1429 = getPorcentajePETGrupo('14 a 29');
    const porcentaje65 = getPorcentajePETGrupo('65');
    
    let html = this.escapeHtml(texto);
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (porcentaje1429 && porcentaje1429 !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentaje1429), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentaje1429)}</span>`);
    }
    if (porcentaje65 && porcentaje65 !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentaje65), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentaje65)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Obtiene el texto de detalle de PEA
   */
  obtenerTextoDetalePEA(datos: any): string {
    if (datos.textoDetalePEA && datos.textoDetalePEA !== '____') {
      return datos.textoDetalePEA;
    }
    
    const distrito = datos.distritoSeleccionado || '____';
    const poblacionDistrital = datos.poblacionDistritalCahuacho || '____';
    const petDistrital = datos.petDistritalCahuacho || '____';
    
    return `No obstante, los indicadores de la PEA, tanto de su cantidad total como por subgrupos (Ocupada y Desocupada), se describen a nivel distrital siguiendo la información oficial de la publicación "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI. Para ello es importante tomar en cuenta que la población distrital de ${distrito}, jurisdicción donde se ubica el AISD en cuestión, es de ${poblacionDistrital} personas, y que la PET (de 14 años a más) al mismo nivel está conformada por ${petDistrital} personas.`;
  }

  /**
   * Obtiene el texto de detalle de PEA con resaltado HTML
   */
  obtenerTextoDetalePEAConResaltado(datos: any): SafeHtml {
    const texto = this.obtenerTextoDetalePEA(datos);
    const distrito = datos.distritoSeleccionado || '____';
    const poblacionDistrital = datos.poblacionDistritalCahuacho || '____';
    const petDistrital = datos.petDistritalCahuacho || '____';
    
    let html = this.escapeHtml(texto);
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (poblacionDistrital && poblacionDistrital !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(poblacionDistrital), 'g'), `<span class="data-section">${this.escapeHtml(poblacionDistrital)}</span>`);
    }
    if (petDistrital && petDistrital !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(petDistrital), 'g'), `<span class="data-section">${this.escapeHtml(petDistrital)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Obtiene el texto de definición de PEA
   */
  obtenerTextoDefinicionPEA(
    datos: any,
    obtenerNombreComunidad: () => string
  ): string {
    if (datos.textoDefinicionPEA && datos.textoDefinicionPEA !== '____') {
      return datos.textoDefinicionPEA;
    }
    
    const distrito = datos.distritoSeleccionado || '____';
    const grupoAISD = obtenerNombreComunidad();
    
    return `La Población Económicamente Activa (PEA) constituye un indicador fundamental para comprender la dinámica económica y social de cualquier jurisdicción al nivel que se requiera. En este apartado, se presenta una descripción de la PEA del distrito de ${distrito}, jurisdicción que abarca a las poblaciones de la CC ${grupoAISD}. Para ello, se emplea la fuente "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI, con el cual se puede visualizar las características demográficas de la población en capacidad de trabajar en el distrito en cuestión.`;
  }

  /**
   * Obtiene el texto de definición de PEA con resaltado HTML
   */
  obtenerTextoDefinicionPEAConResaltado(
    datos: any,
    obtenerNombreComunidad: () => string
  ): SafeHtml {
    const texto = this.obtenerTextoDefinicionPEA(datos, obtenerNombreComunidad);
    const distrito = datos.distritoSeleccionado || '____';
    const grupoAISD = obtenerNombreComunidad();
    
    let html = this.escapeHtml(texto);
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Obtiene el texto de análisis de PEA
   */
  obtenerTextoAnalisisPEA(
    datos: any,
    getPorcentajePEA: () => string,
    getPorcentajeNoPEA: () => string,
    getPorcentajePEAHombres: () => string,
    getPorcentajeNoPEAMujeres: () => string
  ): string {
    if (datos.textoAnalisisPEA && datos.textoAnalisisPEA !== '____') {
      return datos.textoAnalisisPEA;
    }
    
    const distrito = datos.distritoSeleccionado || '____';
    const porcentajePEA = getPorcentajePEA();
    const porcentajeNoPEA = getPorcentajeNoPEA();
    const porcentajePEAHombres = getPorcentajePEAHombres();
    const porcentajeNoPEAMujeres = getPorcentajeNoPEAMujeres();
    
    return `Del cuadro precedente, se aprecia que la PEA del distrito de ${distrito} representa un ${porcentajePEA} del total de la PET de la jurisdicción, mientras que la No PEA abarca el ${porcentajeNoPEA} restante. Asimismo, se visualiza que los hombres se encuentran predominantemente dentro del indicador de PEA con un ${porcentajePEAHombres}; mientras que, en el caso de las mujeres, se hallan mayormente en el indicador de No PEA (${porcentajeNoPEAMujeres}).`;
  }

  /**
   * Obtiene el texto de análisis de PEA con resaltado HTML
   */
  obtenerTextoAnalisisPEAConResaltado(
    datos: any,
    getPorcentajePEA: () => string,
    getPorcentajeNoPEA: () => string,
    getPorcentajePEAHombres: () => string,
    getPorcentajeNoPEAMujeres: () => string
  ): SafeHtml {
    const texto = this.obtenerTextoAnalisisPEA(
      datos,
      getPorcentajePEA,
      getPorcentajeNoPEA,
      getPorcentajePEAHombres,
      getPorcentajeNoPEAMujeres
    );
    
    const distrito = datos.distritoSeleccionado || '____';
    const porcentajePEA = getPorcentajePEA();
    const porcentajeNoPEA = getPorcentajeNoPEA();
    const porcentajePEAHombres = getPorcentajePEAHombres();
    const porcentajeNoPEAMujeres = getPorcentajeNoPEAMujeres();
    
    let html = this.escapeHtml(texto);
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (porcentajePEA && porcentajePEA !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajePEA), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajePEA)}</span>`);
    }
    if (porcentajeNoPEA && porcentajeNoPEA !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeNoPEA), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeNoPEA)}</span>`);
    }
    if (porcentajePEAHombres && porcentajePEAHombres !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajePEAHombres), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajePEAHombres)}</span>`);
    }
    if (porcentajeNoPEAMujeres && porcentajeNoPEAMujeres !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeNoPEAMujeres), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeNoPEAMujeres)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Obtiene el texto sobre índice de desempleo
   */
  obtenerTextoIndiceDesempleo(
    datos: any,
    obtenerNombreComunidad: () => string
  ): string {
    if (datos.textoIndiceDesempleo && datos.textoIndiceDesempleo !== '____') {
      return datos.textoIndiceDesempleo;
    }
    
    const distrito = datos.distritoSeleccionado || '____';
    const grupoAISD = obtenerNombreComunidad();
    
    return `El índice de desempleo es un indicador clave para evaluar la salud económica de una jurisdicción de cualquier nivel, ya que refleja la proporción de la Población Económicamente Activa (PEA) que se encuentra en busca de empleo, pero no logra obtenerlo. En este ítem, se caracteriza el índice de desempleo del distrito de ${distrito}, el cual abarca los poblados de la CC ${grupoAISD}. Para ello, se emplea la fuente "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI, con el cual se puede visualizar las características demográficas de la población que forma parte de la PEA y distinguir entre sus subgrupos (Ocupada y Desocupada).`;
  }

  /**
   * Obtiene el texto sobre índice de desempleo con resaltado HTML
   */
  obtenerTextoIndiceDesempleoConResaltado(
    datos: any,
    obtenerNombreComunidad: () => string
  ): SafeHtml {
    const texto = this.obtenerTextoIndiceDesempleo(datos, obtenerNombreComunidad);
    const distrito = datos.distritoSeleccionado || '____';
    const grupoAISD = obtenerNombreComunidad();
    
    let html = this.escapeHtml(texto);
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (grupoAISD && grupoAISD !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Obtiene el texto de análisis de ocupación
   */
  obtenerTextoAnalisisOcupacion(
    datos: any,
    getPorcentajePEADesocupada: () => string,
    getPorcentajePEAOcupadaHombres: () => string,
    getPorcentajePEAOcupadaMujeres: () => string
  ): string {
    if (datos.textoAnalisisOcupacion && datos.textoAnalisisOcupacion !== '____') {
      return datos.textoAnalisisOcupacion;
    }
    
    const distrito = datos.distritoSeleccionado || '____';
    const porcentajeDesocupada = getPorcentajePEADesocupada();
    const porcentajeOcupadaHombres = getPorcentajePEAOcupadaHombres();
    const porcentajeOcupadaMujeres = getPorcentajePEAOcupadaMujeres();
    
    return `Del cuadro precedente, se halla que en el distrito de ${distrito} la PEA Desocupada representa un ${porcentajeDesocupada} del total de la PEA. En adición a ello, se aprecia que tanto hombres como mujeres se encuentran predominantemente en el indicador de PEA Ocupada, con porcentajes de ${porcentajeOcupadaHombres} y ${porcentajeOcupadaMujeres}, respectivamente.`;
  }

  /**
   * Obtiene el texto de análisis de ocupación con resaltado HTML
   */
  obtenerTextoAnalisisOcupacionConResaltado(
    datos: any,
    getPorcentajePEADesocupada: () => string,
    getPorcentajePEAOcupadaHombres: () => string,
    getPorcentajePEAOcupadaMujeres: () => string
  ): SafeHtml {
    const texto = this.obtenerTextoAnalisisOcupacion(
      datos,
      getPorcentajePEADesocupada,
      getPorcentajePEAOcupadaHombres,
      getPorcentajePEAOcupadaMujeres
    );
    
    const distrito = datos.distritoSeleccionado || '____';
    const porcentajeDesocupada = getPorcentajePEADesocupada();
    const porcentajeOcupadaHombres = getPorcentajePEAOcupadaHombres();
    const porcentajeOcupadaMujeres = getPorcentajePEAOcupadaMujeres();
    
    let html = this.escapeHtml(texto);
    if (distrito && distrito !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    if (porcentajeDesocupada && porcentajeDesocupada !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeDesocupada), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeDesocupada)}</span>`);
    }
    if (porcentajeOcupadaHombres && porcentajeOcupadaHombres !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeOcupadaHombres), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeOcupadaHombres)}</span>`);
    }
    if (porcentajeOcupadaMujeres && porcentajeOcupadaMujeres !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(porcentajeOcupadaMujeres), 'g'), `<span class="data-calculated">${this.escapeHtml(porcentajeOcupadaMujeres)}</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Formatea un párrafo con saltos de línea HTML
   */
  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  // Utilidades privadas

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
