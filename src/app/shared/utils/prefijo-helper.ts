export class PrefijoHelper {
  static obtenerPrefijoGrupo(seccionId: string): string {
    if (seccionId.startsWith('3.1.4.A.1')) {
      return '_A1';
    } else if (seccionId.startsWith('3.1.4.A.2')) {
      return '_A2';
    } else if (seccionId.startsWith('3.1.4.B.1')) {
      return '_B1';
    } else if (seccionId.startsWith('3.1.4.B.2')) {
      return '_B2';
    }
    return '';
  }

  static obtenerValorConPrefijo(datos: any, campo: string, seccionId: string): any {
    const prefijo = this.obtenerPrefijoGrupo(seccionId);
    const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
    return datos[campoConPrefijo] || datos[campo] || null;
  }
}

