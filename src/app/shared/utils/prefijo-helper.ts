export class PrefijoHelper {
  static obtenerPrefijoGrupo(seccionId: string): string {
    const regex = /^3\.1\.4\.([A-Z])\.(\d+)/;
    const match = seccionId.match(regex);
    if (match) {
      const letra = match[1];
      const numero = match[2];
      return `_${letra}${numero}`;
    }
    return '';
  }

  static obtenerValorConPrefijo(datos: any, campo: string, seccionId: string): any {
    const prefijo = this.obtenerPrefijoGrupo(seccionId);
    const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
    return datos[campoConPrefijo] || datos[campo] || null;
  }
}

