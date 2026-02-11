import { Seccion5Data } from '../../entities';

/**
 * Interfaz para el servicio de generación de texto de Seccion5
 * Define operaciones para generar textos dinámicos de institucionalidad
 */
export interface ISeccion5TextGeneratorService {
  /**
   * Genera párrafo de institucionalidad con información sobre estructura organizativa
   * @param datos Datos de la sección
   * @param nombreComunidad Nombre de la comunidad
   * @param seccionId ID de la sección para extraer prefijo de grupo
   */
  obtenerTextoInstitucionalidad(datos: Seccion5Data, nombreComunidad: string, seccionId: string): string;

  /**
   * Valida que el párrafo contenga contenido significativo
   * @param parrafo Texto del párrafo
   */
  esParrafoValido(parrafo: string): boolean;

  /**
   * Formatea párrafo para presentación visual con estilos HTML
   * @param texto Texto a formatear
   */
  formatearParrafo(texto: string): string;
}
