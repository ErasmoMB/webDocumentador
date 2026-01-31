import { Injectable } from '@angular/core';
import { debugLog } from 'src/app/shared/utils/debug';

/**
 * ✅ SOLID - SRP: Responsabilidad única de ajustar porcentajes para que sumen exactamente 100%
 * ✅ SOLID - OCP: Abierto para extensión (nuevas estrategias de ajuste), cerrado para modificación
 */
@Injectable({
  providedIn: 'root'
})
export class PercentageAdjustmentService {

  /**
   * Ajusta los porcentajes para que sumen exactamente 100%
   * Estrategia: Ajusta la diferencia en el último elemento
   * 
   * @param porcentajes - Array de porcentajes calculados con redondeo
   * @returns Array de porcentajes ajustados que suman exactamente 100%
   */
  ajustarParaSumar100(porcentajes: number[]): number[] {
    if (porcentajes.length === 0) {
      return porcentajes;
    }

    // Calcular la suma de los porcentajes redondeados
    const sumaPorcentajes = porcentajes.reduce((sum, p) => sum + (p || 0), 0);
    const diferencia = Math.round((100 - sumaPorcentajes) * 100) / 100;

    debugLog(`[PORCENTAJES] 📊 Suma de porcentajes: ${sumaPorcentajes}%, Diferencia: ${diferencia}%`);

    // Si la diferencia es insignificante, retornar sin cambios
    if (Math.abs(diferencia) <= 0.001) {
      return porcentajes;
    }

    // Crear copia del array para no mutar el original
    const porcentajesAjustados = [...porcentajes];

    // Ajustar la diferencia en el último elemento
    const ultimoIndice = porcentajesAjustados.length - 1;
    const porcentajeAjustado = porcentajesAjustados[ultimoIndice] + diferencia;
    porcentajesAjustados[ultimoIndice] = Math.max(0, Math.round(porcentajeAjustado * 100) / 100);

    debugLog(`[PORCENTAJES] 🔧 Ajustando último porcentaje: ${porcentajesAjustados[ultimoIndice]}%`);

    // Verificar que la suma final sea exactamente 100%
    const sumaFinal = porcentajesAjustados.reduce((sum, p) => sum + (p || 0), 0);
    debugLog(`[PORCENTAJES] ✅ Suma final de porcentajes: ${sumaFinal}%`);

    return porcentajesAjustados;
  }

  /**
   * Formatea un porcentaje numérico a string con formato español
   * @param porcentaje - Porcentaje numérico (ej: 50.67)
   * @returns String formateado (ej: "50,67 %")
   */
  formatearPorcentaje(porcentaje: number): string {
    return porcentaje
      .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .replace('.', ',') + ' %';
  }
}
