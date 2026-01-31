import { debugLog } from 'src/app/shared/utils/debug';

/**
 * Helper genérico para calcular porcentajes dinámicamente en tablas
 * Principio SOLID: Single Responsibility - Solo calcula porcentajes
 * Principio SOLID: Open/Closed - Extensible sin modificar código existente
 */
export class TablePercentageHelper {
  /**
   * Calcula porcentajes dinámicamente para una tabla simple (categoría, casos, porcentaje)
   * @param tabla Array de objetos con propiedades categoria y casos
   * @param cuadroNumero Número del cuadro para logging (opcional)
   * @returns Array con porcentajes calculados y fila Total agregada
   */
  static calcularPorcentajesSimple(
    tabla: any[],
    cuadroNumero?: string
  ): any[] {
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) {
      return [];
    }

    // Filtrar filas Total si existen
    const tablaSinTotal = tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });

    // Calcular total dinámicamente como suma de casos en la tabla
    const total = tablaSinTotal.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      const mensaje = cuadroNumero 
        ? `⚠️ Total casos en tabla Cuadro ${cuadroNumero} <= 0, retornando porcentajes 0,00%`
        : '⚠️ Total casos en tabla <= 0, retornando porcentajes 0,00%';
      debugLog(mensaje);
      return tablaSinTotal.map((item: any) => ({ ...item, porcentaje: { value: '0,00 %', isCalculated: true } }));
    }

    // Calcular porcentajes basados en el total de la tabla
    const tablaConPorcentajes = tablaSinTotal.map((item: any) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      if (cuadroNumero) {
        debugLog(`📊 Cálculo porcentaje Cuadro ${cuadroNumero} ${item.categoria}: ${casos} / ${total} = ${porcentaje.toFixed(2)}%`);
      }

      return {
        ...item,
        casos,
        porcentaje: { value: porcentajeFormateado, isCalculated: true }
      };
    });

    // Agregar fila de total
    const filaTotal = {
      categoria: 'Total',
      casos: { value: total, isCalculated: true },
      porcentaje: { value: '100,00 %', isCalculated: true }
    };
    tablaConPorcentajes.push(filaTotal);

    if (cuadroNumero) {
      debugLog(`📊 Cuadro N° ${cuadroNumero}:`, tablaConPorcentajes);
    }
    
    return tablaConPorcentajes;
  }

  /**
   * Calcula porcentajes dinámicamente para la tabla de educación (Cuadro 3.53)
   * Campos específicos: nombreIE, cantidadEstudiantes
   * @param tabla Array de objetos con propiedades nombreIE, nivel, tipoGestion, cantidadEstudiantes
   * @param cuadroNumero Número del cuadro para logging (opcional)
   * @returns Array con porcentajes calculados y fila Total agregada
   */
  static calcularPorcentajesEducacion(
    tabla: any[],
    cuadroNumero?: string
  ): any[] {
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) {
      return [];
    }

    // Filtrar filas Total si existen
    const tablaSinTotal = tabla.filter((item: any) => {
      const nombreIE = item.nombreIE?.toString().toLowerCase() || '';
      return !nombreIE.includes('total');
    });

    // Calcular total dinámicamente como suma de cantidadEstudiantes
    const total = tablaSinTotal.reduce((sum, item) => {
      const cantidadEstudiantes = typeof item?.cantidadEstudiantes === 'number' 
        ? item.cantidadEstudiantes 
        : parseInt(item?.cantidadEstudiantes) || 0;
      return sum + cantidadEstudiantes;
    }, 0);

    if (total <= 0) {
      const mensaje = cuadroNumero 
        ? `⚠️ Total estudiantes en tabla Cuadro ${cuadroNumero} <= 0, retornando porcentajes 0,00%`
        : '⚠️ Total estudiantes en tabla educación <= 0, retornando porcentajes 0,00%';
      debugLog(mensaje);
      return tablaSinTotal.map((item: any) => ({ 
        ...item, 
        porcentaje: { value: '0,00 %', isCalculated: true } 
      }));
    }

    // Calcular porcentajes basados en el total de estudiantes
    const tablaConPorcentajes = tablaSinTotal.map((item: any) => {
      const cantidadEstudiantes = typeof item?.cantidadEstudiantes === 'number' 
        ? item.cantidadEstudiantes 
        : parseInt(item?.cantidadEstudiantes) || 0;
      const porcentaje = (cantidadEstudiantes / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      if (cuadroNumero) {
        debugLog(`📊 Cálculo porcentaje Cuadro ${cuadroNumero} ${item.nombreIE}: ${cantidadEstudiantes} / ${total} = ${porcentaje.toFixed(2)}%`);
      }

      return {
        ...item,
        cantidadEstudiantes,
        porcentaje: { value: porcentajeFormateado, isCalculated: true }
      };
    });

    // Agregar fila de total
    const filaTotal = {
      nombreIE: 'Total',
      nivel: '',
      tipoGestion: '',
      cantidadEstudiantes: { value: total, isCalculated: true },
      porcentaje: { value: '100,00 %', isCalculated: true }
    };
    tablaConPorcentajes.push(filaTotal);

    if (cuadroNumero) {
      debugLog(`📊 Cuadro N° ${cuadroNumero} - Infraestructura educativa:`, tablaConPorcentajes);
    }
    
    return tablaConPorcentajes;
  }

  /**
   * Calcula porcentajes dinámicamente para la tabla de analfabetismo (Cuadro 3.58)
   * Campos específicos: indicador, casos
   * @param tabla Array de objetos con propiedades indicador, casos
   * @param cuadroNumero Número del cuadro para logging (opcional)
   * @returns Array con porcentajes calculados y fila Total agregada
   */
  static calcularPorcentajesAnalfabetismo(
    tabla: any[],
    cuadroNumero?: string
  ): any[] {
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) {
      return [];
    }

    // Filtrar filas Total si existen
    const tablaSinTotal = tabla.filter((item: any) => {
      const indicador = item.indicador?.toString().toLowerCase() || '';
      return !indicador.includes('total');
    });

    // Calcular total dinámicamente como suma de casos
    const total = tablaSinTotal.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' 
        ? item.casos 
        : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      const mensaje = cuadroNumero 
        ? `⚠️ Total casos en tabla Cuadro ${cuadroNumero} <= 0, retornando porcentajes 0,00%`
        : '⚠️ Total casos en tabla analfabetismo <= 0, retornando porcentajes 0,00%';
      debugLog(mensaje);
      return tablaSinTotal.map((item: any) => ({ 
        ...item, 
        porcentaje: { value: '0,00 %', isCalculated: true } 
      }));
    }

    // Calcular porcentajes basados en el total de casos
    const tablaConPorcentajes = tablaSinTotal.map((item: any) => {
      const casos = typeof item?.casos === 'number' 
        ? item.casos 
        : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      if (cuadroNumero) {
        debugLog(`📊 Cálculo porcentaje Cuadro ${cuadroNumero} ${item.indicador}: ${casos} / ${total} = ${porcentaje.toFixed(2)}%`);
      }

      return {
        ...item,
        casos,
        porcentaje: { value: porcentajeFormateado, isCalculated: true }
      };
    });

    // Agregar fila de total
    const filaTotal = {
      indicador: 'Total',
      casos: { value: total, isCalculated: true },
      porcentaje: { value: '100,00 %', isCalculated: true }
    };
    tablaConPorcentajes.push(filaTotal);

    if (cuadroNumero) {
      debugLog(`📊 Cuadro N° ${cuadroNumero} - Tasa de analfabetismo:`, tablaConPorcentajes);
    }
    
    return tablaConPorcentajes;
  }

  /**
   * Calcula porcentajes dinámicamente para la tabla de actividades económicas (Cuadro 3.43)
   * Campos específicos: actividad, casos
   * @param tabla Array de objetos con propiedades actividad, casos
   * @param cuadroNumero Número del cuadro para logging (opcional)
   * @returns Array con porcentajes calculados y fila Total agregada
   */
  static calcularPorcentajesActividadesEconomicas(
    tabla: any[],
    cuadroNumero?: string
  ): any[] {
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) {
      return [];
    }

    // Filtrar filas Total si existen
    const tablaSinTotal = tabla.filter((item: any) => {
      const actividad = item.actividad?.toString().toLowerCase() || '';
      return !actividad.includes('total');
    });

    // Calcular total dinámicamente como suma de casos
    const total = tablaSinTotal.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' 
        ? item.casos 
        : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      const mensaje = cuadroNumero 
        ? `⚠️ Total casos en tabla Cuadro ${cuadroNumero} <= 0, retornando porcentajes 0,00%`
        : '⚠️ Total casos en tabla actividades económicas <= 0, retornando porcentajes 0,00%';
      debugLog(mensaje);
      return tablaSinTotal.map((item: any) => ({ 
        ...item, 
        porcentaje: { value: '0,00 %', isCalculated: true } 
      }));
    }

    // Calcular porcentajes basados en el total de casos
    const tablaConPorcentajes = tablaSinTotal.map((item: any) => {
      const casos = typeof item?.casos === 'number' 
        ? item.casos 
        : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      if (cuadroNumero) {
        debugLog(`📊 Cálculo porcentaje Cuadro ${cuadroNumero} ${item.actividad}: ${casos} / ${total} = ${porcentaje.toFixed(2)}%`);
      }

      return {
        ...item,
        casos,
        porcentaje: { value: porcentajeFormateado, isCalculated: true }
      };
    });

    // Agregar fila de total
    const filaTotal = {
      actividad: 'Total',
      casos: { value: total, isCalculated: true },
      porcentaje: { value: '100,00 %', isCalculated: true }
    };
    tablaConPorcentajes.push(filaTotal);

    if (cuadroNumero) {
      debugLog(`📊 Cuadro N° ${cuadroNumero} - PEA Ocupada según actividad económica:`, tablaConPorcentajes);
    }
    
    return tablaConPorcentajes;
  }

  /**
   * Calcula porcentajes dinámicamente para la tabla de población por sexo (Cuadro 3.38)
   * Campos específicos: sexo, casos
   * @param tabla Array de objetos con propiedades sexo, casos
   * @param cuadroNumero Número del cuadro para logging (opcional)
   * @returns Array con porcentajes calculados y fila Total agregada
   */
  static calcularPorcentajesPoblacionSexo(
    tabla: any[],
    cuadroNumero?: string
  ): any[] {
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) {
      return [];
    }

    // Filtrar filas Total si existen
    const tablaSinTotal = tabla.filter((item: any) => {
      const sexo = item.sexo?.toString().toLowerCase() || '';
      return !sexo.includes('total');
    });

    // Calcular total dinámicamente como suma de casos
    const total = tablaSinTotal.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' 
        ? item.casos 
        : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      const mensaje = cuadroNumero 
        ? `⚠️ Total casos en tabla Cuadro ${cuadroNumero} <= 0, retornando porcentajes 0,00%`
        : '⚠️ Total casos en tabla población por sexo <= 0, retornando porcentajes 0,00%';
      debugLog(mensaje);
      return tablaSinTotal.map((item: any) => ({ 
        ...item, 
        porcentaje: { value: '0,00 %', isCalculated: true } 
      }));
    }

    // Calcular porcentajes basados en el total de casos
    const tablaConPorcentajes = tablaSinTotal.map((item: any) => {
      const casos = typeof item?.casos === 'number' 
        ? item.casos 
        : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      if (cuadroNumero) {
        debugLog(`📊 Cálculo porcentaje Cuadro ${cuadroNumero} ${item.sexo}: ${casos} / ${total} = ${porcentaje.toFixed(2)}%`);
      }

      return {
        ...item,
        casos,
        porcentaje: { value: porcentajeFormateado, isCalculated: true }
      };
    });

    // Agregar fila de total
    const filaTotal = {
      sexo: 'Total',
      casos: { value: total, isCalculated: true },
      porcentaje: { value: '100,00 %', isCalculated: true }
    };
    tablaConPorcentajes.push(filaTotal);

    if (cuadroNumero) {
      debugLog(`📊 Cuadro N° ${cuadroNumero} - Población por sexo:`, tablaConPorcentajes);
    }
    
    return tablaConPorcentajes;
  }

  /**
   * Calcula porcentajes dinámicamente para una tabla con múltiples columnas de porcentajes
   * (hombres, mujeres, casos totales)
   * @param tabla Array de objetos con propiedades categoria, hombres, mujeres, casos
   * @param cuadroNumero Número del cuadro para logging (opcional)
   * @returns Array con porcentajes calculados y fila Total agregada
   */
  static calcularPorcentajesMultiples(
    tabla: any[],
    cuadroNumero?: string
  ): any[] {
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) {
      return [];
    }

    // Filtrar filas Total si existen
    const tablaSinTotal = tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });

    // Calcular totales dinámicamente
    const totalHombres = tablaSinTotal.reduce((sum, item) => {
      const hombres = typeof item?.hombres === 'number' ? item.hombres : parseInt(item?.hombres) || 0;
      return sum + hombres;
    }, 0);

    const totalMujeres = tablaSinTotal.reduce((sum, item) => {
      const mujeres = typeof item?.mujeres === 'number' ? item.mujeres : parseInt(item?.mujeres) || 0;
      return sum + mujeres;
    }, 0);

    const totalCasos = tablaSinTotal.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (totalHombres <= 0 && totalMujeres <= 0 && totalCasos <= 0) {
      const mensaje = cuadroNumero 
        ? `⚠️ Totales en tabla Cuadro ${cuadroNumero} <= 0, retornando porcentajes 0,00%`
        : '⚠️ Totales en tabla <= 0, retornando porcentajes 0,00%';
      debugLog(mensaje);
      return tablaSinTotal.map((item: any) => ({
        ...item,
        porcentajeHombres: { value: '0,00 %', isCalculated: true },
        porcentajeMujeres: { value: '0,00 %', isCalculated: true },
        porcentaje: { value: '0,00 %', isCalculated: true }
      }));
    }

    // Calcular porcentajes para cada fila
    const tablaConPorcentajes = tablaSinTotal.map((item: any) => {
      const hombres = typeof item?.hombres === 'number' ? item.hombres : parseInt(item?.hombres) || 0;
      const mujeres = typeof item?.mujeres === 'number' ? item.mujeres : parseInt(item?.mujeres) || 0;
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;

      // Calcular porcentaje de hombres
      const porcentajeHombres = totalHombres > 0 
        ? (hombres / totalHombres) * 100 
        : 0;
      const porcentajeHombresFormateado = porcentajeHombres
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      // Calcular porcentaje de mujeres
      const porcentajeMujeres = totalMujeres > 0 
        ? (mujeres / totalMujeres) * 100 
        : 0;
      const porcentajeMujeresFormateado = porcentajeMujeres
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      // Calcular porcentaje total
      const porcentajeTotal = totalCasos > 0 
        ? (casos / totalCasos) * 100 
        : 0;
      const porcentajeTotalFormateado = porcentajeTotal
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      if (cuadroNumero) {
        debugLog(`📊 Cálculo porcentajes Cuadro ${cuadroNumero} ${item.categoria}: Hombres ${hombres}/${totalHombres}=${porcentajeHombres.toFixed(2)}%, Mujeres ${mujeres}/${totalMujeres}=${porcentajeMujeres.toFixed(2)}%, Total ${casos}/${totalCasos}=${porcentajeTotal.toFixed(2)}%`);
      }

      return {
        ...item,
        hombres: { value: hombres, isCalculated: false },
        mujeres: { value: mujeres, isCalculated: false },
        casos: { value: casos, isCalculated: false },
        porcentajeHombres: { value: porcentajeHombresFormateado, isCalculated: true },
        porcentajeMujeres: { value: porcentajeMujeresFormateado, isCalculated: true },
        porcentaje: { value: porcentajeTotalFormateado, isCalculated: true }
      };
    });

    // Agregar fila de total
    const filaTotal = {
      categoria: 'Total',
      hombres: { value: totalHombres, isCalculated: true },
      mujeres: { value: totalMujeres, isCalculated: true },
      casos: { value: totalCasos, isCalculated: true },
      porcentajeHombres: { value: '100,00 %', isCalculated: true },
      porcentajeMujeres: { value: '100,00 %', isCalculated: true },
      porcentaje: { value: '100,00 %', isCalculated: true }
    };
    tablaConPorcentajes.push(filaTotal);

    if (cuadroNumero) {
      debugLog(`📊 Cuadro N° ${cuadroNumero}:`, tablaConPorcentajes);
    }
    
    return tablaConPorcentajes;
  }
}
