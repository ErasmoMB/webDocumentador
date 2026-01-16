import { Injectable } from '@angular/core';
import { FormularioService } from './formulario.service';
import { CentrosPobladosActivosService } from './centros-poblados-activos.service';

@Injectable({
  providedIn: 'root'
})
export class UbigeoHelperService {
  constructor(
    private formularioService: FormularioService,
    private centrosPobladosActivos: CentrosPobladosActivosService
  ) {}

  getIdUbigeoFromCentroPoblado(centroPoblado: any): string | null {
    return centroPoblado?.CODIGO?.toString() || null;
  }

  getIdUbigeoFromComunidadCampesina(seccionId: string): string | null {
    const datos = this.formularioService.obtenerDatos();
    const prefijo = this.getPrefijoFromSeccionId(seccionId);
    
    if (!prefijo || !prefijo.startsWith('_A')) {
      return null;
    }

    const match = prefijo.match(/_A(\d+)/);
    if (!match) {
      return null;
    }

    const indiceComunidad = parseInt(match[1]) - 1;
    const comunidadesCampesinas = datos['comunidadesCampesinas'] || [];

    if (indiceComunidad >= 0 && indiceComunidad < comunidadesCampesinas.length) {
      const comunidad = comunidadesCampesinas[indiceComunidad];
      if (comunidad && comunidad.centrosPobladosSeleccionados && Array.isArray(comunidad.centrosPobladosSeleccionados)) {
        const codigos = comunidad.centrosPobladosSeleccionados.filter((codigo: string) => codigo && codigo.trim() !== '');
        if (codigos.length > 0) {
          return codigos[0];
        }
      }
    }

    return null;
  }

  getIdUbigeoPrincipal(seccionId: string): string | null {
    const datos = this.formularioService.obtenerDatos();
    
    const codigosComunidad = this.getCodigosComunidad(seccionId);
    if (codigosComunidad.length > 0) {
      return codigosComunidad[0];
    }

    const centroPobladoAISI = datos['centroPobladoAISI'];
    if (centroPobladoAISI) {
      const jsonData = this.formularioService.obtenerJSON();
      const cpAISI = jsonData.find((cp: any) => cp.CCPP === centroPobladoAISI);
      if (cpAISI && cpAISI.CODIGO) {
        return cpAISI.CODIGO.toString();
      }
    }

    const distritoSeleccionado = datos['distritoSeleccionado'];
    if (distritoSeleccionado) {
      const jsonData = this.formularioService.obtenerJSON();
      const cp = jsonData.find((cp: any) => cp.DIST === distritoSeleccionado && cp.CATEGORIA === 'Capital distrital');
      if (cp && cp.CODIGO) {
        return cp.CODIGO.toString();
      }
    }

    return null;
  }

  getAllCodigosComunidad(seccionId: string): string[] {
    return this.getCodigosComunidad(seccionId);
  }

  private getCodigosComunidad(seccionId: string): string[] {
    const prefijo = this.getPrefijoFromSeccionId(seccionId);
    if (!prefijo || !prefijo.startsWith('_A')) {
      return [];
    }

    const codigosActivos = this.centrosPobladosActivos.obtenerCodigosActivosPorPrefijo(prefijo);
    
    if (codigosActivos.length > 0) {
      return codigosActivos;
    }

    const match = prefijo.match(/_A(\d+)/);
    if (!match) {
      return [];
    }

    const indiceComunidad = parseInt(match[1]) - 1;
    const datos = this.formularioService.obtenerDatos();
    const comunidadesCampesinas = datos['comunidadesCampesinas'] || [];

    if (indiceComunidad >= 0 && indiceComunidad < comunidadesCampesinas.length) {
      const comunidad = comunidadesCampesinas[indiceComunidad];
      if (comunidad && comunidad.centrosPobladosSeleccionados && Array.isArray(comunidad.centrosPobladosSeleccionados)) {
        return comunidad.centrosPobladosSeleccionados.filter((codigo: string) => codigo && codigo.trim() !== '');
      }
    }

    return [];
  }

  private getPrefijoFromSeccionId(seccionId: string): string {
    const matchA = seccionId.match(/^3\.1\.4\.A\.(\d+)/);
    if (matchA) {
      return `_A${matchA[1]}`;
    }
    
    const matchB = seccionId.match(/^3\.1\.4\.B\.(\d+)/);
    if (matchB) {
      return `_B${matchB[1]}`;
    }
    
    if (seccionId.startsWith('3.1.4.A')) {
      return '_A1';
    } else if (seccionId.startsWith('3.1.4.B')) {
      return '_B1';
    }
    
    return '';
  }
}
