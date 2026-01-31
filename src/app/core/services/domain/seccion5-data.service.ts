import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ISeccion5DataService } from '../../domain/interfaces/seccion5/iseccion5-data.service';
import { Seccion5Data, Institucion } from '../../domain/entities/seccion5-data';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Injectable({
  providedIn: 'root'
})
export class Seccion5DataService implements ISeccion5DataService {

  getSeccion5Data(): Observable<Seccion5Data> {
    return of(this.getMockSeccion5Data());
  }

  updateSeccion5Data(updates: Partial<Seccion5Data>): Observable<Seccion5Data> {
    const currentData = this.getMockSeccion5Data();
    const updatedData: Seccion5Data = { ...currentData, ...updates };
    return of(updatedData);
  }

  private getMockSeccion5Data(): Seccion5Data {
    return {
      parrafoSeccion5_institucionalidad: 'La CC [Comunidad] posee una estructura organizativa que responde a sus necesidades locales...',
      grupoAISD: 'Comunidad Ejemplo',
      tituloInstituciones: 'Instituciones existentes – CC Comunidad Ejemplo',
      fuenteInstituciones: 'GEADES (2024)',
      tablepagina6: [
        { categoria: 'Asamblea General', respuesta: 'SI', comentario: 'Centro Comunal' },
        { categoria: 'Junta Directiva', respuesta: 'SI', comentario: 'Oficina Municipal' },
        { categoria: 'Rondas Campesinas', respuesta: 'NO', comentario: 'No existe' }
      ],
      comunidadesCampesinas: [{ nombre: 'Comunidad Ejemplo' }]
    };
  }

  /**
   * Obtiene el nombre de la comunidad actual según el prefijo de sección
   * Soporta múltiples comunidades en contextos con prefijos _A1, _A2, etc.
   */
  obtenerNombreComunidadActual(datos: Seccion5Data, seccionId: string): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
    if (!prefijo || !prefijo.startsWith('_A')) {
      return datos.grupoAISD || '____';
    }

    const match = prefijo.match(/_A(\d+)/);
    if (!match) {
      return datos.grupoAISD || '____';
    }

    const index = parseInt(match[1]) - 1;
    const comunidades = datos['comunidadesCampesinas'] || [];
    return comunidades[index]?.nombre || datos.grupoAISD || '____';
  }

  /**
   * Valida que la tabla de instituciones contenga datos
   */
  esTablaInstitucionesValida(datos: Seccion5Data, tablaKey: string): boolean {
    const tabla = datos[tablaKey as keyof Seccion5Data];
    return Array.isArray(tabla) && tabla.length > 0;
  }

  /**
   * Filtra instituciones por disponibilidad (SI/NO)
   */
  filtrarInstitucionesPorDisponibilidad(instituciones: Institucion[], disponibilidad: 'SI' | 'NO'): Institucion[] {
    return instituciones.filter(inst => inst.respuesta === disponibilidad);
  }

  /**
   * Cuenta total de instituciones disponibles
   */
  contarInstitucionesDisponibles(instituciones: Institucion[]): number {
    return this.filtrarInstitucionesPorDisponibilidad(instituciones, 'SI').length;
  }

  /**
   * Obtiene resumen de instituciones para vista
   * Útil para mostrar estadísticas o listados especializados
   */
  obtenerResumenInstituciones(instituciones: Institucion[]): {
    total: number;
    disponibles: number;
    noDisponibles: number;
  } {
    const disponibles = this.contarInstitucionesDisponibles(instituciones);
    const total = instituciones.length;

    return {
      total,
      disponibles,
      noDisponibles: total - disponibles
    };
  }
}
