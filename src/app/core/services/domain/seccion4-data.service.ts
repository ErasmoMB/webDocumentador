import { Injectable } from '@angular/core';
import { CentrosPobladosActivosService } from '../centros-poblados-activos.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Injectable({
  providedIn: 'root'
})
export class Seccion4DataService {

  constructor(
    private centrosPobladosActivos: CentrosPobladosActivosService
  ) {}

  obtenerNombreComunidadActual(datos: any, seccionId: string): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
    if (!prefijo || !prefijo.startsWith('_A')) return datos.grupoAISD || '____';

    const match = prefijo.match(/_A(\d+)/);
    if (!match) return datos.grupoAISD || '____';

    const index = parseInt(match[1]) - 1;
    const comunidades = datos['comunidadesCampesinas'] || [];
    return comunidades[index]?.nombre || datos.grupoAISD || '____';
  }

  calcularTotalesAISD2(filas: any[]): { poblacion: number; empadronadas: number; ocupadas: number } {
    const sum = (field: string) => filas
      .map(f => Number(f[field]) || 0)
      .reduce((a, b) => a + b, 0);

    return {
      poblacion: sum('poblacion'),
      empadronadas: sum('viviendasEmpadronadas'),
      ocupadas: sum('viviendasOcupadas')
    };
  }

  obtenerCapitalComunidad(datos: any, seccionId: string): string | null {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
    if (!prefijo?.startsWith('_A')) return null;

    const match = prefijo.match(/_A(\d+)/);
    if (!match) return null;

    const index = parseInt(match[1]) - 1;
    const comunidad = (datos['comunidadesCampesinas'] || [])[index];
    if (!comunidad?.centrosPobladosSeleccionados?.length) return null;

    const jsonCompleto = datos['jsonCompleto'];
    if (!jsonCompleto) return null;

    // Buscar el CP con mayor población entre los seleccionados
    let maxPob = -1;
    let capital = null;

    Object.values(jsonCompleto).forEach((distrito: any) => {
      if (Array.isArray(distrito)) {
        distrito.forEach(cp => {
          const codigo = (cp.CODIGO || cp.codigo || '').toString();
          if (comunidad.centrosPobladosSeleccionados.includes(codigo)) {
            const pob = parseInt(cp.POBLACION || cp.poblacion || '0');
            if (pob > maxPob) {
              maxPob = pob;
              capital = cp.CCPP || cp.ccpp;
            }
          }
        });
      }
    });

    return capital;
  }

  buscarDatosCentro(datos: any, nombreCentro: string): any {
    if (!nombreCentro || !datos['jsonCompleto']) return null;
    const target = nombreCentro.trim().toUpperCase();

    for (const distrito of Object.values(datos['jsonCompleto'])) {
      if (Array.isArray(distrito)) {
        const cp = distrito.find(c => (c.CCPP || c.ccpp || '').trim().toUpperCase() === target);
        if (cp) {
          const este = cp.ESTE || '____';
          const norte = cp.NORTE || '____';
          const zona = cp.ZONA_UTM || cp.zona_utm || '18L';
          return {
            coordenadas: este !== '____' ? `${zona} E: ${este} m N: ${norte} m` : '____',
            altitud: cp.ALTITUD ? `${cp.ALTITUD} msnm` : '____',
            distrito: cp.DIST || '____',
            provincia: cp.PROV || '____',
            departamento: cp.DPTO || '____'
          };
        }
      }
    }
    return null;
  }

  obtenerCodigosPorPrefijo(datos: any, seccionId: string): string[] {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
    if (!prefijo?.startsWith('_A')) return [];

    // Prioridad 1: Centros activos en el servicio (si ya se cargaron)
    const codigosActivos = this.centrosPobladosActivos.obtenerCodigosActivosPorPrefijo(prefijo);
    if (codigosActivos?.length > 0) return codigosActivos;

    // Prioridad 2: Buscar directamente en la definición de la comunidad (resiliente a refrescos)
    const match = prefijo.match(/_A(\d+)/);
    if (match) {
      const index = parseInt(match[1]) - 1;
      const comunidad = (datos['comunidadesCampesinas'] || [])[index];
      if (comunidad?.centrosPobladosSeleccionados) {
        return comunidad.centrosPobladosSeleccionados;
      }
    }

    return [];
  }

  obtenerDatosCentrosPorCodigos(jsonCompleto: any, codigos: string[]): any[] {
    const codigosSet = new Set(codigos.map(c => c.toString().trim()));
    const resultados: any[] = [];

    if (!jsonCompleto) return [];

    Object.values(jsonCompleto).forEach((distrito: any) => {
      if (Array.isArray(distrito)) {
        distrito.forEach(cp => {
          const codigo = (cp.CODIGO || cp.codigo || '').toString().trim();
          if (codigosSet.has(codigo)) {
            resultados.push(cp);
          }
        });
      }
    });

    return resultados;
  }

  aplanarCentrosPoblados(jsonData: any): any[] {
    if (!jsonData) return [];
    if (Array.isArray(jsonData)) return jsonData;
    return Object.values(jsonData).flat().filter(v => typeof v === 'object' && v !== null);
  }
}
