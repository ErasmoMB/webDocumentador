/**
 * TableSyncHelper
 * 
 * Helper centralizado para sincronización dual de tablas (con/sin prefijo)
 * Elimina duplicación de código y garantiza consistencia
 * 
 * ✅ PATRÓN SENIOR: Centraliza lógica de sincronización
 */
export class TableSyncHelper {
  /**
   * Sincroniza una tabla con ambas versiones (con prefijo y sin prefijo)
   * 
   * ✅ PATRÓN SENIOR: Centraliza lógica de sincronización dual
   * Elimina duplicación y garantiza consistencia
   * 
   * @param datos - Objeto de datos donde se guardará
   * @param tablaKey - Clave base de la tabla (sin prefijo)
   * @param prefijo - Prefijo a aplicar (ej: '_A1') o null
   * @param tabla - Datos de la tabla a sincronizar
   * @param onFieldChange - Callback para persistir cambios (key, value)
   * @param datosAnteriores - Objeto para tracking de cambios (opcional)
   */
  static sincronizarTablaDual(
    datos: any,
    tablaKey: string,
    prefijo: string | null,
    tabla: any[],
    onFieldChange: (key: string, value: any) => void,
    datosAnteriores?: any
  ): void {
    if (!tabla || !Array.isArray(tabla)) {
      return;
    }

    // Hacer copia profunda para evitar mutaciones
    const tablaCopia = tabla.map(item => ({ ...item }));

    // Clave con prefijo
    const tablaKeyConPrefijo = prefijo ? `${tablaKey}${prefijo}` : tablaKey;

    // Guardar versión con prefijo
    datos[tablaKeyConPrefijo] = [...tablaCopia];
    onFieldChange(tablaKeyConPrefijo, datos[tablaKeyConPrefijo]);

    // Sincronizar versión sin prefijo para compatibilidad
    if (prefijo) {
      datos[tablaKey] = [...tablaCopia];
      onFieldChange(tablaKey, datos[tablaKey]);
    }

    // Actualizar datosAnteriores para detección de cambios
    if (datosAnteriores) {
      datosAnteriores[tablaKey] = structuredClone(tablaCopia);
    }
  }

  /**
   * Obtiene la clave de tabla con prefijo si existe
   */
  static obtenerTablaKey(tablaKey: string, prefijo: string | null): string {
    return prefijo ? `${tablaKey}${prefijo}` : tablaKey;
  }
}
