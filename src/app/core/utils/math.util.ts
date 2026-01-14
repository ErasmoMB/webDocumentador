export class MathUtil {
  static calcularPorcentaje(parte: number, total: number, decimales: number = 2): string {
    if (total === 0) return '0%';
    const porcentaje = (parte / total) * 100;
    return porcentaje.toFixed(decimales) + '%';
  }

  static calcularPorcentajeConComa(parte: number, total: number, decimales: number = 2): string {
    if (total === 0) return '0 %';
    const porcentaje = (parte / total) * 100;
    return porcentaje.toFixed(decimales).replace('.', ',') + ' %';
  }
}

