import { Injectable } from '@angular/core';
import { TableConfig } from '../table-management.service';
import { PercentageAdjustmentService } from './percentage-adjustment.service';
import { debugLog, debugWarn } from 'src/app/shared/utils/debug';

/**
 * ✅ SOLID - SRP: Responsabilidad única de calcular porcentajes y totales
 * ✅ SOLID - DIP: Depende de abstracción (PercentageAdjustmentService) para ajuste de porcentajes
 */
@Injectable({
  providedIn: 'root'
})
export class TableCalculationService {

  constructor(
    private percentageAdjustment: PercentageAdjustmentService
  ) {}

  calcularPorcentajes(
    datos: any,
    config: TableConfig
  ): void {
    const { tablaKey, totalKey, campoTotal, campoPorcentaje } = config;
    
    debugLog('[PORCENTAJES] 🔢 calcularPorcentajes() iniciado', {
      tablaKey,
      totalKey,
      campoTotal,
      campoPorcentaje,
      tieneCampoTotal: !!campoTotal,
      tieneCampoPorcentaje: !!campoPorcentaje
    });
    
    if (!campoTotal || !campoPorcentaje) {
      console.warn('[PORCENTAJES] ⚠️ No se puede calcular: falta campoTotal o campoPorcentaje');
      return;
    }
    
    const tabla = datos[tablaKey] || [];
    
    debugLog('[PORCENTAJES] 📊 Datos de la tabla:', {
      tablaKey,
      cantidadFilas: tabla.length,
      datos: tabla
    });
    
    if (tabla.length === 0) {
      console.warn('[PORCENTAJES] ⚠️ Tabla vacía, no se puede calcular');
      return;
    }

    // Buscar la fila "Total"
    const totalItem = tabla.find((item: any) => {
      const valor = item[totalKey];
      return valor && valor.toString().toLowerCase().includes('total');
    });
    
    // Calcular el total sumando todas las filas excepto la fila "Total"
    // Esto asegura que siempre usemos el total correcto, incluso si la fila Total no está actualizada
    let total = tabla.reduce((sum: number, item: any) => {
      const valor = item[totalKey];
      if (!valor || !valor.toString().toLowerCase().includes('total')) {
        return sum + (parseFloat(item[campoTotal]) || 0);
      }
      return sum;
    }, 0);
    
    debugLog('[PORCENTAJES] ➕ Total calculado:', total);
    
    // Si hay una fila Total y tiene un valor, usar ese valor si es mayor que 0
    // (esto permite que el usuario pueda sobrescribir manualmente el total si es necesario)
    if (totalItem && totalItem[campoTotal]) {
      const totalManual = parseFloat(totalItem[campoTotal]) || 0;
      if (totalManual > 0 && totalManual !== total) {
        // Si el total manual es diferente, usar el calculado (más preciso)
        totalItem[campoTotal] = total;
      }
    }

    if (total > 0 && campoPorcentaje) {
      debugLog('[PORCENTAJES] ✅ Calculando porcentajes para', tabla.length, 'filas');
      
      // ✅ SOLID - SRP: Separar responsabilidades
      // Paso 1: Calcular porcentajes individuales
      const porcentajesCalculados: Array<{ item: any; porcentajeNum: number; index: number }> = [];
      
      tabla.forEach((item: any, index: number) => {
        const valor = item[totalKey];
        const esTotal = valor && valor.toString().toLowerCase().includes('total');
        
        if (!esTotal) {
          const casos = parseFloat(item[campoTotal]) || 0;
          
          if (isNaN(casos)) {
            debugWarn(`[PORCENTAJES] ⚠️ Valor no numérico en ${campoTotal} para fila ${index}:`, item);
            porcentajesCalculados.push({ item, porcentajeNum: 0, index });
            return;
          }
          
          const porcentajeNumerico = (casos / total) * 100;
          const porcentajeRedondeado = Math.round(porcentajeNumerico * 100) / 100;
          porcentajesCalculados.push({ item, porcentajeNum: porcentajeRedondeado, index });
        }
      });
      
      // ✅ SOLID - DIP: Delegar ajuste a servicio especializado
      // Paso 2: Ajustar porcentajes para que sumen exactamente 100%
      const porcentajesNumericos = porcentajesCalculados.map(p => p.porcentajeNum);
      const porcentajesAjustados = this.percentageAdjustment.ajustarParaSumar100(porcentajesNumericos);
      
      // Paso 3: Aplicar los porcentajes ajustados y formateados a los items
      porcentajesCalculados.forEach(({ item, index }, i) => {
        const porcentajeFormateado = this.percentageAdjustment.formatearPorcentaje(porcentajesAjustados[i]);
        
        debugLog(`[PORCENTAJES] 📈 Fila ${index} (${item[totalKey]}): ${item[campoTotal]} casos → ${porcentajeFormateado}`);
        item[campoPorcentaje] = porcentajeFormateado;
      });
      
      debugLog('[PORCENTAJES] ✅ Porcentajes calculados. Tabla final:', tabla);
    } else if (campoPorcentaje) {
      debugWarn('[PORCENTAJES] ⚠️ Total es 0, estableciendo porcentajes en 0,00 %');
      tabla.forEach((item: any) => {
        const valor = item[totalKey];
        if (!valor || !valor.toString().toLowerCase().includes('total')) {
          item[campoPorcentaje] = '0,00 %';
        }
      });
    } else {
      debugWarn('[PORCENTAJES] ⚠️ No hay campoPorcentaje configurado');
    }
  }

  calcularTotales(
    datos: any,
    config: TableConfig
  ): number {
    const { tablaKey, totalKey, campoTotal } = config;
    
    if (!campoTotal) {
      return 0;
    }
    
    const tabla = datos[tablaKey] || [];
    
    if (tabla.length === 0) return 0;

    const totalItem = tabla.find((item: any) => {
      const valor = item[totalKey];
      return valor && valor.toString().toLowerCase().includes('total');
    });
    
    if (totalItem) {
      return parseFloat(totalItem[campoTotal]) || 0;
    }
    
    return tabla.reduce((sum: number, item: any) => {
      const valor = item[totalKey];
      if (!valor || !valor.toString().toLowerCase().includes('total')) {
        return sum + (parseFloat(item[campoTotal]) || 0);
      }
      return sum;
    }, 0);
  }

  /**
   * Calcula y actualiza automáticamente los totales en la fila "Total"
   * @param datos - Objeto con los datos del formulario
   * @param config - Configuración de la tabla
   */
  calcularYActualizarTotales(
    datos: any,
    config: TableConfig
  ): void {
    const { tablaKey, totalKey, campoTotal, campoPorcentaje } = config;
    
    if (!campoTotal) {
      return;
    }
    
    const tabla = datos[tablaKey] || [];
    
    if (tabla.length === 0) return;

    // Calcular el total sumando todas las filas excepto la fila "Total"
    const total = tabla.reduce((sum: number, item: any) => {
      const valor = item[totalKey];
      if (!valor || !valor.toString().toLowerCase().includes('total')) {
        const valorCampo = parseFloat(item[campoTotal]) || 0;
        return sum + valorCampo;
      }
      return sum;
    }, 0);

    // Buscar y actualizar la fila "Total"
    const totalItem = tabla.find((item: any) => {
      const valor = item[totalKey];
      return valor && valor.toString().toLowerCase().includes('total');
    });

    if (totalItem) {
      totalItem[campoTotal] = total;
      // Si hay campo de porcentaje, establecerlo en 100%
      if (campoPorcentaje) {
        totalItem[campoPorcentaje] = '100,00 %';
      }
    }
  }

  /**
   * Calcula automáticamente totales y porcentajes en una sola operación
   * @param datos - Objeto con los datos del formulario
   * @param config - Configuración de la tabla
   */
  calcularTotalesYPorcentajes(
    datos: any,
    config: TableConfig
  ): void {
    // Primero calcular y actualizar los totales
    this.calcularYActualizarTotales(datos, config);
    
    // Luego calcular los porcentajes (que usarán el total actualizado)
    this.calcularPorcentajes(datos, config);
  }
}
