import { Injectable } from '@angular/core';
import { TableConfig } from './table-management.service';

/**
 * ✅ SERVICIO DE MERGE INTELIGENTE
 * 
 * Combina datos del mock con la estructuraInicial de la tabla:
 * 1. Mantiene las categorías de la estructura inicial (nivel, indicador, etc.)
 * 2. Llena solo la columna de casos con los datos del mock
 * 3. Los porcentajes se calculan automáticamente por el servicio de cálculo
 * 
 * Esto resuelve el problema de que el mock solo proporciona casos y la tabla
 * necesita mantener la estructura de categorías predefinida.
 */
@Injectable({
  providedIn: 'root'
})
export class TableMockMergeService {

  /**
   * Combina datos del mock con la estructura inicial de la tabla.
   * 
   * @param datosMock - Datos provenientes del mock (solo con casos)
   * @param estructuraInicial - Estructura base con categorías predefinidas
   * @param config - Configuración de la tabla
   * @returns Array combinado con estructura de categorías y valores del mock
   */
  combinarMockConEstructura(
    datosMock: any[] | undefined,
    estructuraInicial: any[] | undefined,
    config: TableConfig
  ): any[] {
    // Si no hay estructura inicial, devolver datos tal cual
    if (!estructuraInicial || estructuraInicial.length === 0) {
      return datosMock || [];
    }

    // Si no hay datos mock, devolver estructura inicial como clone
    if (!datosMock || !Array.isArray(datosMock) || datosMock.length === 0) {
      return structuredClone(estructuraInicial);
    }

    const { totalKey, campoTotal, campoPorcentaje } = config;
    const claveCategoria = totalKey || 'categoria';

    // Crear mapa de datos del mock por categoría normalizada
    const mapaMock = this.crearMapaPorCategoria(datosMock, claveCategoria);

    // Combinar estructura con datos del mock
    const resultado = estructuraInicial.map(filaEstructura => {
      const categoriaEstructura = this.normalizarCategoria(filaEstructura[claveCategoria]);
      const datoMock = mapaMock.get(categoriaEstructura);

      const filaCombinada: any = {
        ...structuredClone(filaEstructura)
      };

      // Si hay datos del mock para esta categoría, llenar el campo de casos
      if (datoMock && campoTotal) {
        const valorCasos = datoMock[campoTotal];
        if (valorCasos !== undefined && valorCasos !== null && valorCasos !== '') {
          filaCombinada[campoTotal] = typeof valorCasos === 'number' ? valorCasos : parseFloat(valorCasos) || 0;
        }
      }

      // El porcentaje se deja vacío para que se calcule automáticamente
      if (campoPorcentaje) {
        filaCombinada[campoPorcentaje] = '';
      }

      return filaCombinada;
    });

    return resultado;
  }

  /**
   * Detecta si los datos parecen venir de un mock (solo tienen casos, sin porcentajes calculados)
   */
  sonDatosDeMock(datos: any[], config: TableConfig): boolean {
    if (!datos || datos.length === 0) return false;
    
    const { campoPorcentaje, campoTotal } = config;
    if (!campoPorcentaje || !campoTotal) return false;

    // Verificar si todos los porcentajes están vacíos o son '0%' pero hay casos
    let tieneCasosConValor = false;
    let todosLosPorcentajesVacios = true;

    for (const fila of datos) {
      const casos = fila[campoTotal];
      const porcentaje = fila[campoPorcentaje];

      // Verificar si hay casos con valor
      if (casos !== undefined && casos !== null && casos !== '' && casos !== 0) {
        tieneCasosConValor = true;
      }

      // Verificar si el porcentaje está vacío o es un placeholder
      const porcentajeVacio = !porcentaje || 
        porcentaje === '' || 
        porcentaje === '0%' || 
        porcentaje === '0,00 %' ||
        porcentaje === '0.00 %';

      if (!porcentajeVacio) {
        todosLosPorcentajesVacios = false;
      }
    }

    // Es mock si tiene casos pero todos los porcentajes están vacíos
    return tieneCasosConValor && todosLosPorcentajesVacios;
  }

  /**
   * Verifica si la estructura de datos existente coincide con la estructura inicial
   */
  estructuraCoincide(
    datosExistentes: any[],
    estructuraInicial: any[],
    claveCategoria: string
  ): boolean {
    if (!datosExistentes || !estructuraInicial) return false;
    if (datosExistentes.length !== estructuraInicial.length) return false;

    return estructuraInicial.every((filaEstructura, index) => {
      const filaExistente = datosExistentes[index];
      if (!filaExistente) return false;

      const catEstructura = this.normalizarCategoria(filaEstructura[claveCategoria]);
      const catExistente = this.normalizarCategoria(filaExistente[claveCategoria]);

      return catEstructura === catExistente;
    });
  }

  /**
   * Crea un mapa de datos indexado por categoría normalizada
   */
  private crearMapaPorCategoria(datos: any[], claveCategoria: string): Map<string, any> {
    const mapa = new Map<string, any>();

    datos.forEach(fila => {
      const categoria = this.normalizarCategoria(fila[claveCategoria]);
      if (categoria) {
        mapa.set(categoria, fila);
      }
    });

    return mapa;
  }

  /**
   * Normaliza una categoría para comparación insensible a mayúsculas/espacios
   */
  private normalizarCategoria(categoria: any): string {
    if (!categoria) return '';
    return String(categoria)
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remover acentos
  }
}
