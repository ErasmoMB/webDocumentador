export class PrefijoHelper {
  static obtenerPrefijoGrupo(seccionId: string): string {
    // Intenta primero con formato completo: 3.1.4.A.1 o 3.1.4.A.2
    const regexCompleto = /^3\.1\.4\.([A-Z])\.(\d+)/;
    const matchCompleto = seccionId.match(regexCompleto);
    if (matchCompleto) {
      const letra = matchCompleto[1];
      const numero = matchCompleto[2];
      return `_${letra}${numero}`;
    }
    
    // Si no, intenta con formato simplificado: 3.1.4.A
    const regexSimple = /^3\.1\.4\.([A-Z])$/;
    const matchSimple = seccionId.match(regexSimple);
    if (matchSimple) {
      const letra = matchSimple[1];
      // Por defecto usa 1 si no hay número especificado
      return `_${letra}1`;
    }
    
    return '';
  }

  static obtenerValorConPrefijo(datos: any, campo: string, seccionId: string): any {
    const prefijo = this.obtenerPrefijoGrupo(seccionId);
    const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
    return datos[campoConPrefijo] || datos[campo] || null;
  }
}

