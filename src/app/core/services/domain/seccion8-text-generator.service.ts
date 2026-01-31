import { Injectable } from '@angular/core';
import { Seccion8DataService } from './seccion8-data.service';

/**
 * Servicio de Generación de Texto para Sección 8
 * Responsable de generar textos descriptivos con datos resaltados
 */
@Injectable({ providedIn: 'root' })
export class Seccion8TextGeneratorService {

  constructor(private dataService: Seccion8DataService) {}

  /**
   * Genera texto para actividades económicas
   */
  generarTextoActividadesEconomicas(datos: any, seccionId: string): string {
    // Primero verificar si hay texto guardado manualmente
    const textoGuardado = this.dataService.obtenerValorConPrefijo(datos, 'parrafoSeccion8_actividades_economicas', seccionId);
    if (textoGuardado && textoGuardado.trim() !== '' && textoGuardado !== '____') {
      return textoGuardado;
    }
    
    // Si no hay texto guardado, generar automáticamente desde los datos de la tabla
    const nombreCC = this.dataService.obtenerNombreComunidadActual(datos, seccionId);
    const topOcupaciones = this.dataService.getTopOcupaciones(datos, seccionId, 3);
    
    if (topOcupaciones.length === 0) {
      return `Las principales actividades económicas en ${nombreCC} incluyen ____.`;
    }
    
    const primera = topOcupaciones[0] || { categoria: '____', porcentaje: '____' };
    const segunda = topOcupaciones[1] || { categoria: '____', porcentaje: '____' };
    
    return `Las principales actividades económicas en ${nombreCC} incluyen ${primera.categoria} con un ${primera.porcentaje}, seguido de ${segunda.categoria} con ${segunda.porcentaje}.`;
  }

  /**
   * Genera texto para actividades económicas con resaltado
   */
  generarTextoActividadesEconomicasConResaltado(datos: any, seccionId: string): string {
    const texto = this.generarTextoActividadesEconomicas(datos, seccionId);
    
    // Aplicar resaltado a los valores dinámicos
    const nombreCC = this.dataService.obtenerNombreComunidadActual(datos, seccionId);
    const topOcupaciones = this.dataService.getTopOcupaciones(datos, seccionId, 3);
    
    let html = texto;
    
    // Resaltar nombre de comunidad
    if (nombreCC && nombreCC !== '____') {
      html = html.replace(new RegExp(this.escapeRegex(nombreCC), 'g'), `<span class="data-highlight-database">${nombreCC}</span>`);
    }
    
    // Resaltar categorías y porcentajes si existen
    topOcupaciones.forEach(ocup => {
      if (ocup.categoria && ocup.categoria !== '____') {
        html = html.replace(new RegExp(this.escapeRegex(ocup.categoria), 'g'), `<span class="data-highlight-database">${ocup.categoria}</span>`);
      }
      if (ocup.porcentaje && ocup.porcentaje !== '____') {
        html = html.replace(new RegExp(this.escapeRegex(ocup.porcentaje), 'g'), `<span class="data-highlight-calculated">${ocup.porcentaje}</span>`);
      }
    });
    
    return html;
  }

  /**
   * Genera texto para análisis del cuadro 3.10
   */
  generarTextoAnalisisCuadro310(datos: any, seccionId: string): string {
    // Primero verificar si hay texto guardado manualmente
    const textoGuardado = this.dataService.obtenerValorConPrefijo(datos, 'parrafoSeccion8_analisis_cuadro', seccionId);
    if (textoGuardado && textoGuardado.trim() !== '' && textoGuardado !== '____') {
      return textoGuardado;
    }
    
    // Si no hay texto guardado, generar automáticamente desde los datos de la tabla
    const topOcupaciones = this.dataService.getTopOcupaciones(datos, seccionId, 3);
    
    if (topOcupaciones.length === 0) {
      return 'No hay datos disponibles para el análisis.';
    }
    
    const primera = topOcupaciones[0];
    const segunda = topOcupaciones[1];
    
    let texto = `Según el cuadro, la ocupación principal es ${primera.categoria} con ${primera.porcentaje}`;
    
    if (segunda) {
      texto += `, seguida de ${segunda.categoria} con ${segunda.porcentaje}`;
    }
    
    texto += '.';
    return texto;
  }

  /**
   * Genera texto para análisis del cuadro 3.10 con resaltado
   */
  generarTextoAnalisisCuadro310ConResaltado(datos: any, seccionId: string): string {
    const texto = this.generarTextoAnalisisCuadro310(datos, seccionId);
    
    // Aplicar resaltado a los valores dinámicos
    const topOcupaciones = this.dataService.getTopOcupaciones(datos, seccionId, 3);
    
    let html = texto;
    
    // Resaltar categorías y porcentajes si existen
    topOcupaciones.forEach(ocup => {
      if (ocup.categoria && ocup.categoria !== '____') {
        html = html.replace(new RegExp(this.escapeRegex(ocup.categoria), 'g'), `<span class="data-highlight-database">${ocup.categoria}</span>`);
      }
      if (ocup.porcentaje && ocup.porcentaje !== '____') {
        html = html.replace(new RegExp(this.escapeRegex(ocup.porcentaje), 'g'), `<span class="data-highlight-calculated">${ocup.porcentaje}</span>`);
      }
    });
    
    return html;
  }

  /**
   * Obtiene texto de ganadería completo
   */
  obtenerTextoGanaderiaCompleto(datos: any, seccionId: string): string {
    const texto = this.dataService.obtenerValorConPrefijo(datos, 'parrafoSeccion8_ganaderia_completo', seccionId);
    if (texto && texto.trim() !== '' && texto !== '____') {
      return texto;
    }
    
    // Texto por defecto si no hay texto guardado
    const nombreCC = this.dataService.obtenerNombreComunidadActual(datos, seccionId);
    return `La actividad ganadera en ${nombreCC} representa una de las principales fuentes de ingresos para las familias de la comunidad. Las especies más comunes incluyen vacunos, ovinos y camélidos, que se crían principalmente para la venta y el autoconsumo.`;
  }

  /**
   * Obtiene texto de ganadería completo con resaltado
   */
  obtenerTextoGanaderiaCompletoConResaltado(datos: any, seccionId: string): string {
    const texto = this.obtenerTextoGanaderiaCompleto(datos, seccionId);
    if (!texto) return '';
    return this.aplicarResaltado(texto);
  }

  /**
   * Obtiene texto de agricultura completo
   */
  obtenerTextoAgriculturaCompleto(datos: any, seccionId: string): string {
    const texto = this.dataService.obtenerValorConPrefijo(datos, 'parrafoSeccion8_agricultura_completo', seccionId);
    if (texto && texto.trim() !== '' && texto !== '____') {
      return texto;
    }
    
    // Texto por defecto si no hay texto guardado
    const nombreCC = this.dataService.obtenerNombreComunidadActual(datos, seccionId);
    return `La agricultura en ${nombreCC} se desarrolla principalmente en pequeñas parcelas familiares, donde se cultivan productos destinados tanto al consumo familiar como a la comercialización en mercados locales. Los principales cultivos incluyen papa, habas, cebada y otros productos andinos adaptados a las condiciones climáticas de la zona.`;
  }

  /**
   * Obtiene texto de agricultura completo con resaltado
   */
  obtenerTextoAgriculturaCompletoConResaltado(datos: any, seccionId: string): string {
    const texto = this.obtenerTextoAgriculturaCompleto(datos, seccionId);
    if (!texto) return '';
    return this.aplicarResaltado(texto);
  }

  /**
   * Obtiene texto de mercado comercialización 1
   */
  obtenerTextoMercadoComercializacion1(datos: any, seccionId: string): string {
    const texto = this.dataService.obtenerValorConPrefijo(datos, 'parrafoSeccion8_mercado_comercializacion_1', seccionId);
    if (texto && texto.trim() !== '' && texto !== '____') {
      return texto;
    }
    
    // Texto por defecto si no hay texto guardado
    const nombreCC = this.dataService.obtenerNombreComunidadActual(datos, seccionId);
    return `Los productos de ${nombreCC} se comercializan principalmente en mercados locales y ferias regionales. Los productores suelen vender directamente a intermediarios o consumidores finales, lo que les permite obtener mejores precios aunque requiere mayor dedicación de tiempo.`;
  }

  /**
   * Obtiene texto de mercado comercialización 1 con resaltado
   */
  obtenerTextoMercadoComercializacion1ConResaltado(datos: any, seccionId: string): string {
    const texto = this.obtenerTextoMercadoComercializacion1(datos, seccionId);
    if (!texto) return '';
    return this.aplicarResaltado(texto);
  }

  /**
   * Obtiene texto de mercado comercialización 2
   */
  obtenerTextoMercadoComercializacion2(datos: any, seccionId: string): string {
    const texto = this.dataService.obtenerValorConPrefijo(datos, 'parrafoSeccion8_mercado_comercializacion_2', seccionId);
    if (texto && texto.trim() !== '' && texto !== '____') {
      return texto;
    }
    
    // Texto por defecto si no hay texto guardado
    return `La comercialización enfrenta diversos desafíos, como la falta de infraestructura adecuada, la distancia a los centros de consumo y la variabilidad de los precios. A pesar de estas limitaciones, los productores continúan buscando estrategias para mejorar el acceso a los mercados y obtener mejores condiciones de venta.`;
  }

  /**
   * Obtiene texto de mercado comercialización 2 con resaltado
   */
  obtenerTextoMercadoComercializacion2ConResaltado(datos: any, seccionId: string): string {
    const texto = this.obtenerTextoMercadoComercializacion2(datos, seccionId);
    if (!texto) return '';
    return this.aplicarResaltado(texto);
  }

  /**
   * Obtiene texto de hábitos de consumo 1
   */
  obtenerTextoHabitosConsumo1(datos: any, seccionId: string): string {
    const texto = this.dataService.obtenerValorConPrefijo(datos, 'parrafoSeccion8_habitos_consumo_1', seccionId);
    if (texto && texto.trim() !== '' && texto !== '____') {
      return texto;
    }
    
    // Texto por defecto si no hay texto guardado
    const nombreCC = this.dataService.obtenerNombreComunidadActual(datos, seccionId);
    return `Los hábitos de consumo en ${nombreCC} están fuertemente influenciados por la producción local y las tradiciones culturales. La dieta de las familias se basa principalmente en productos agrícolas y pecuarios producidos en la comunidad, complementados con productos adquiridos en mercados locales.`;
  }

  /**
   * Obtiene texto de hábitos de consumo 1 con resaltado
   */
  obtenerTextoHabitosConsumo1ConResaltado(datos: any, seccionId: string): string {
    const texto = this.obtenerTextoHabitosConsumo1(datos, seccionId);
    if (!texto) return '';
    return this.aplicarResaltado(texto);
  }

  /**
   * Obtiene texto de hábitos de consumo 2
   */
  obtenerTextoHabitosConsumo2(datos: any, seccionId: string): string {
    const texto = this.dataService.obtenerValorConPrefijo(datos, 'parrafoSeccion8_habitos_consumo_2', seccionId);
    if (texto && texto.trim() !== '' && texto !== '____') {
      return texto;
    }
    
    // Texto por defecto si no hay texto guardado
    return `El autoconsumo representa una estrategia importante para la seguridad alimentaria de las familias. Los productos que no se consumen directamente se almacenan, intercambian o venden, permitiendo a las familias diversificar sus fuentes de ingresos y mantener una dieta variada durante todo el año.`;
  }

  /**
   * Obtiene texto de hábitos de consumo 2 con resaltado
   */
  obtenerTextoHabitosConsumo2ConResaltado(datos: any, seccionId: string): string {
    const texto = this.obtenerTextoHabitosConsumo2(datos, seccionId);
    if (!texto) return '';
    return this.aplicarResaltado(texto);
  }

  /**
   * Aplica resaltado a un texto
   */
  private aplicarResaltado(texto: string): string {
    if (!texto) return '';
    // Aquí puedes agregar lógica de resaltado específica si es necesario
    return texto;
  }

  /**
   * Escapa caracteres especiales para regex
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
