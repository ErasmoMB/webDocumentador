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
    
    // Primero verificar versión con prefijo
    const valorConPrefijo = datos[campoConPrefijo];
    if (this.tieneContenidoReal(valorConPrefijo)) {
      return valorConPrefijo;
    }
    
    // Fallback a versión sin prefijo
    const valorSinPrefijo = datos[campo];
    if (this.tieneContenidoReal(valorSinPrefijo)) {
      return valorSinPrefijo;
    }
    
    return null;
  }

  /**
   * Verifica si un valor tiene contenido real (no vacío, no estructura placeholder)
   */
  private static tieneContenidoReal(valor: any): boolean {
    if (valor === null || valor === undefined) return false;
    
    // Si es string, verificar que no esté vacío
    if (typeof valor === 'string') {
      return valor.trim() !== '' && valor !== '____';
    }
    
    // Si es array, verificar que tenga elementos con contenido
    if (Array.isArray(valor)) {
      if (valor.length === 0) return false;
      
      // Verificar si al menos un elemento tiene contenido real
      return valor.some(item => {
        if (!item || typeof item !== 'object') return false;
        return Object.values(item).some(v => {
          if (v === null || v === undefined) return false;
          if (typeof v === 'string') return v.trim() !== '' && v !== '0%' && v !== '0,00 %';
          if (typeof v === 'number') return v !== 0;
          return true;
        });
      });
    }
    
    // Si es objeto, verificar que tenga propiedades
    if (typeof valor === 'object') {
      return Object.keys(valor).length > 0;
    }
    
    return true;
  }
}

