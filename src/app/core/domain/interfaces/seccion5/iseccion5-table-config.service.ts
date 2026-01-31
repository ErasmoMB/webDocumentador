import { TableConfig } from 'src/app/core/services/table-management.service';

/**
 * Interfaz para el servicio de configuración de tablas de Seccion5
 * Define configuraciones para tablas de instituciones
 */
export interface ISeccion5TableConfigService {
  /**
   * Obtiene configuración para tabla de instituciones
   */
  getTablaInstitucionesConfig(): TableConfig;

  /**
   * Obtiene definición de columnas para tabla de instituciones
   */
  getColumnasInstituciones(): any[];
}
