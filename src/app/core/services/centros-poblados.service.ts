import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface CentroPoblado {
  ubigeo: string;
  centro_poblado: string;
  departamento: string;
  provincia: string;
  distrito: string;
  poblacion: number;
  hombres: number;
  mujeres: number;
  de_6_a_14_anios: number;
  de_15_a_29: number;
  de_30_a_44: number;
  de_45_a_64: number;
  de_65_a_mas?: number;
  comunidad?: string;
  tipo_comunidad?: string;
}

export interface DetalleCentroPoblado {
  success: boolean;
  ubigeo: string;
  ubicacion: {
    centro_poblado: string;
    departamento: string;
    provincia: string;
    distrito: string;
  };
  demografia: {
    total: number;
    hombres: number;
    mujeres: number;
    de_6_a_14_anios: number;
    de_15_a_29: number;
    de_30_a_44: number;
    de_45_a_64: number;
  };
  comunidad?: {
    nombre: string;
    tipo: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CentrosPobladosService {
  private apiUrl = 'http://localhost:8000/centros-poblados';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene datos de múltiples centros poblados por sus códigos UBIGEO
   * @param codigos Lista de códigos UBIGEO
   * @returns Observable con lista de centros poblados
   */
  obtenerPorCodigos(codigos: string[]): Observable<CentroPoblado[]> {
    console.log('[CentrosPobladosService] 🔵 REQUEST:', {
      url: `${this.apiUrl}/por-codigos-ubigeo`,
      method: 'POST',
      payload: { codigos_ubigeo: codigos },
      cantidad: codigos.length
    });

    return this.http.post<any>(`${this.apiUrl}/por-codigos-ubigeo`, {
      codigos_ubigeo: codigos
    }).pipe(
      map(response => {
        console.log('[CentrosPobladosService] 🟢 RESPONSE RAW:', {
          response_completa: JSON.parse(JSON.stringify(response)),
          centros_poblados_count: response?.centros_poblados?.length || 0,
          primer_centro: response?.centros_poblados?.[0] ? {
            ubigeo: response.centros_poblados[0].ubigeo,
            centro_poblado: response.centros_poblados[0].centro_poblado,
            hombres: response.centros_poblados[0].hombres,
            mujeres: response.centros_poblados[0].mujeres,
            de_6_a_14_anios: response.centros_poblados[0].de_6_a_14_anios,
            tipos: {
              hombres: typeof response.centros_poblados[0].hombres,
              mujeres: typeof response.centros_poblados[0].mujeres,
              de_6_a_14_anios: typeof response.centros_poblados[0].de_6_a_14_anios
            }
          } : null
        });

        const centros = response.centros_poblados || [];
        console.log('[CentrosPobladosService] 📦 Datos procesados:', {
          cantidad: centros.length,
          datos: JSON.parse(JSON.stringify(centros))
        });

        return centros;
      }),
      catchError(error => {
        console.error('[CentrosPobladosService] ❌ ERROR:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene todos los datos de un centro poblado específico
   * @param ubigeo Código UBIGEO del centro poblado
   * @returns Observable con datos completos del centro poblado
   */
  obtenerDetalle(ubigeo: string): Observable<DetalleCentroPoblado | null> {
    return this.http.get<DetalleCentroPoblado>(`${this.apiUrl}/detalle/${ubigeo}`).pipe(
      catchError(error => {
        console.error(`Error obteniendo detalle para UBIGEO ${ubigeo}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene datos de un centro poblado y lo convierte al formato esperado por la sección 22
   * @param ubigeo Código UBIGEO
   * @returns Observable con datos formateados
   */
  obtenerDatosFormateados(ubigeo: string): Observable<any> {
    return this.obtenerDetalle(ubigeo).pipe(
      map(response => {
        if (!response || !response.success) {
          return null;
        }

        const demo = response.demografia;
        const total = demo?.total || 0;

        // Calcular porcentajes
        const calcularPorcentaje = (valor: number, total: number) => {
          if (total === 0) return '0,00 %';
          return ((valor / total) * 100).toLocaleString('es-ES', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          }) + ' %';
        };

        return {
          centroPobladoAISI: response.ubicacion.centro_poblado,
          departamento: response.ubicacion.departamento,
          provincia: response.ubicacion.provincia,
          distrito: response.ubicacion.distrito,
          
          // Población por sexo
          poblacionSexoAISI: [
            {
              sexo: 'Hombre',
              casos: demo?.hombres || 0,
              porcentaje: calcularPorcentaje(demo?.hombres || 0, total)
            },
            {
              sexo: 'Mujer',
              casos: demo?.mujeres || 0,
              porcentaje: calcularPorcentaje(demo?.mujeres || 0, total)
            }
          ],
          
          // Población por grupo etario
          poblacionEtarioAISI: [
            {
              categoria: '0 a 14',
              casos: demo?.de_6_a_14_anios || 0,
              porcentaje: calcularPorcentaje(demo?.de_6_a_14_anios || 0, total)
            },
            {
              categoria: '15 a 29',
              casos: demo?.de_15_a_29 || 0,
              porcentaje: calcularPorcentaje(demo?.de_15_a_29 || 0, total)
            },
            {
              categoria: '30 a 44',
              casos: demo?.de_30_a_44 || 0,
              porcentaje: calcularPorcentaje(demo?.de_30_a_44 || 0, total)
            },
            {
              categoria: '45 a 64',
              casos: demo?.de_45_a_64 || 0,
              porcentaje: calcularPorcentaje(demo?.de_45_a_64 || 0, total)
            }
          ],
          
          textoDemografiaAISI: '',
          textoGrupoEtarioAISI: ''
        };
      }),
      catchError(error => {
        console.error('Error formateando datos:', error);
        return of(null);
      })
    );
  }
}
