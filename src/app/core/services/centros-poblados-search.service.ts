import { Injectable } from '@angular/core';
import { Distrito } from 'src/app/core/models/formulario.model';

/**
 * Servicio especializado para búsqueda y obtención de centros poblados
 * Extrae toda la lógica de búsqueda del componente
 */
@Injectable({ providedIn: 'root' })
export class CentrosPobladosSearchService {

  /**
   * Obtiene todos los centros poblados desde jsonCompleto o centrosPobladosJSON
   */
  obtenerTodosLosCentrosPoblados(datos: any): any[] {
    const jsonCompleto = datos['jsonCompleto'];
    const centros: any[] = [];

    if (jsonCompleto && typeof jsonCompleto === 'object' && !Array.isArray(jsonCompleto)) {
      Object.keys(jsonCompleto).forEach((key: string) => {
        const lista = (jsonCompleto as any)[key];
        if (Array.isArray(lista)) {
          centros.push(...lista);
        }
      });
    }

    if (centros.length > 0) {
      return centros;
    }

    return datos['centrosPobladosJSON'] || [];
  }

  /**
   * Obtiene centros poblados de una comunidad por su nombre
   */
  obtenerCentrosPobladosDeComunidadPorNombre(
    nombreComunidad: string,
    datos: any
  ): any[] {
    const jsonCompleto = datos['jsonCompleto'];
    
    if (!jsonCompleto || typeof jsonCompleto !== 'object' || Array.isArray(jsonCompleto)) {
      return [];
    }

    const nombreUpper = nombreComunidad.trim().toUpperCase();
    
    // Buscar la clave que corresponde a esta comunidad
    const keys = Object.keys(jsonCompleto);
    for (const key of keys) {
      let keySinPrefijo = key;
      if (key.toUpperCase().startsWith('CCPP ')) {
        keySinPrefijo = key.substring(5).trim();
      }
      
      if (keySinPrefijo.toUpperCase() === nombreUpper) {
        if (Array.isArray((jsonCompleto as any)[key])) {
          return (jsonCompleto as any)[key];
        }
      }
    }

    return [];
  }

  /**
   * Obtiene centros poblados disponibles para un distrito por su nombre
   */
  obtenerCentrosPobladosDisponiblesParaDistrito(
    nombreDistrito: string,
    datos: any
  ): any[] {
    if (!nombreDistrito || nombreDistrito.trim() === '') {
      return this.obtenerTodosLosCentrosPoblados(datos);
    }

    const jsonCompleto = datos['jsonCompleto'];
    
    if (!jsonCompleto || typeof jsonCompleto !== 'object' || Array.isArray(jsonCompleto)) {
      return this.obtenerTodosLosCentrosPoblados(datos);
    }

    const nombreUpper = nombreDistrito.trim().toUpperCase();
    const centrosPobladosDelDistrito: any[] = [];
    
    // Recorrer todas las claves del JSON (comunidades campesinas o grupos)
    Object.keys(jsonCompleto).forEach((key: string) => {
      const centrosPoblados = (jsonCompleto as any)[key];
      if (Array.isArray(centrosPoblados)) {
        // Filtrar los centros poblados que pertenecen al distrito seleccionado
        centrosPoblados.forEach((cp: any) => {
          const distritoCP = (cp.DIST || cp.dist || '').toString().trim().toUpperCase();
          if (distritoCP === nombreUpper) {
            centrosPobladosDelDistrito.push(cp);
          }
        });
      }
    });
    
    return centrosPobladosDelDistrito.length > 0 
      ? centrosPobladosDelDistrito 
      : this.obtenerTodosLosCentrosPoblados(datos);
  }

  /**
   * Obtiene centros poblados de un distrito por su ID
   */
  obtenerCentrosPobladosDeDistrito(
    distrito: Distrito,
    datos: any
  ): any[] {
    if (!distrito) {
      return [];
    }
    return this.obtenerCentrosPobladosDisponiblesParaDistrito(
      distrito.nombreOriginal || distrito.nombre || '',
      datos
    );
  }

  /**
   * Obtiene centros poblados visibles para un distrito
   */
  obtenerCentrosPobladosVisiblesDistrito(
    distrito: Distrito,
    datos: any
  ): any[] {
    return this.obtenerCentrosPobladosDeDistrito(distrito, datos);
  }

  /**
   * Obtiene centros poblados completos (con toda su información) para una comunidad
   */
  obtenerCentrosPobladosCompletosParaComunidad(
    comunidadId: string,
    comunidades: any[],
    codigosSeleccionados: string[],
    datos: any
  ): any[] {
    const comunidad = comunidades.find(cc => cc.id === comunidadId);
    if (!comunidad || !codigosSeleccionados || codigosSeleccionados.length === 0) {
      return [];
    }

    const todosLosCCPP = this.obtenerTodosLosCentrosPoblados(datos);
    const codigosNormalizados = codigosSeleccionados.map(c => c.toString().trim());
    
    return todosLosCCPP.filter((cp: any) => {
      const codigo = cp.CODIGO?.toString() || '';
      return codigosNormalizados.includes(codigo);
    });
  }

  /**
   * Obtiene centros poblados completos (con toda su información) para un distrito
   */
  obtenerCentrosPobladosCompletosParaDistrito(
    distritoId: string,
    distritos: Distrito[],
    datos: any
  ): any[] {
    const distrito = distritos.find(d => d.id === distritoId);
    if (!distrito || !distrito.centrosPobladosSeleccionados) {
      return [];
    }

    const todosLosCCPP = this.obtenerTodosLosCentrosPoblados(datos);
    const codigosSeleccionados = distrito.centrosPobladosSeleccionados.map(c => c.toString().trim());
    
    return todosLosCCPP.filter((cp: any) => {
      const codigo = cp.CODIGO?.toString() || '';
      return codigosSeleccionados.includes(codigo);
    });
  }

  /**
   * Busca distritos en el JSON por término de búsqueda
   */
  buscarDistritosEnJSON(
    termino: string,
    datos: any,
    provincia?: string
  ): string[] {
    const jsonCompleto = datos['jsonCompleto'];
    if (!jsonCompleto || typeof jsonCompleto !== 'object' || Array.isArray(jsonCompleto)) {
      return [];
    }

    const terminoFilter = termino.toLowerCase();
    const distritosSet = new Set<string>();
    
    // Recorrer todas las comunidades en el JSON
    Object.keys(jsonCompleto).forEach((key: string) => {
      const centrosPoblados = (jsonCompleto as any)[key];
      if (Array.isArray(centrosPoblados)) {
        centrosPoblados.forEach((cp: any) => {
          const nombreDistrito = cp.DIST || cp.dist;
          const nombreProvincia = cp.PROV || cp.prov;
          
          // Filtrar por provincia si se proporciona
          if (provincia && nombreProvincia && nombreProvincia.toLowerCase() !== provincia.toLowerCase()) {
            return;
          }
          
          if (nombreDistrito) {
            const distritoLower = nombreDistrito.toLowerCase();
            if (distritoLower.includes(terminoFilter)) {
              distritosSet.add(nombreDistrito);
            }
          }
        });
      }
    });
    
    return Array.from(distritosSet).sort();
  }

  /**
   * Obtiene la provincia del JSON (del primer centro poblado disponible)
   */
  obtenerProvinciaDelJSON(datos: any): string {
    const jsonCompleto = datos['jsonCompleto'];
    
    if (!jsonCompleto || typeof jsonCompleto !== 'object' || Array.isArray(jsonCompleto)) {
      return '';
    }
    
    // Obtener la provincia del primer centro poblado disponible
    const primerKey = Object.keys(jsonCompleto)[0];
    if (primerKey) {
      const centrosPoblados = (jsonCompleto as any)[primerKey];
      if (Array.isArray(centrosPoblados) && centrosPoblados.length > 0) {
        return centrosPoblados[0].PROV || '';
      }
    }
    
    return '';
  }
}
