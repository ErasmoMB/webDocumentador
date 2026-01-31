import { Observable } from 'rxjs';
import { Seccion5Data, Institucion } from '../../entities';

/**
 * Interfaz para el servicio de datos de Seccion5
 * Define operaciones de negocio para manejo de datos de institucionalidad
 */
export interface ISeccion5DataService {
  /**
   * Obtiene el nombre de la comunidad actual según el prefijo de sección
   * @param datos Datos de la sección
   * @param seccionId ID de la sección
   */
  obtenerNombreComunidadActual(datos: Seccion5Data, seccionId: string): string;

  /**
   * Valida que la tabla de instituciones contenga datos
   * @param datos Datos de la sección
   * @param tablaKey Clave de la tabla
   */
  esTablaInstitucionesValida(datos: Seccion5Data, tablaKey: string): boolean;

  /**
   * Filtra instituciones por disponibilidad
   * @param instituciones Lista de instituciones
   * @param disponibilidad Disponibilidad deseada (SI/NO)
   */
  filtrarInstitucionesPorDisponibilidad(instituciones: Institucion[], disponibilidad: 'SI' | 'NO'): Institucion[];

  /**
   * Cuenta instituciones disponibles
   * @param instituciones Lista de instituciones
   */
  contarInstitucionesDisponibles(instituciones: Institucion[]): number;

  /**
   * Obtiene resumen estadístico de instituciones
   * @param instituciones Lista de instituciones
   */
  obtenerResumenInstituciones(instituciones: Institucion[]): {
    total: number;
    disponibles: number;
    noDisponibles: number;
  };
}
