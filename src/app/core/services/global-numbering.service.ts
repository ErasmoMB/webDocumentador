import { Injectable } from '@angular/core';
import { ProjectStateFacade } from '../state/project-state.facade';

/**
 * GlobalNumberingService - Servicio para numeración global de cuadros y fotografías
 * 
 * ✅ SOPORTA GRUPOS AISI Y AISD DINÁMICOS
 * 
 * Características:
 * - Cuadros: Cantidad FIJA por tipo de sección
 * - Fotos: Cantidad VARIABLE por sección
 * - Numeración global basada en el orden de aparición de grupos
 * 
 * Ejemplo de numeración:
 * - 1 grupo AISD × 36 tablas = 36 tablas (3.2 – 3.37)
 * - 2 grupos AISI × 22 tablas = 44 tablas (3.38 – 3.81)
 */
@Injectable({
  providedIn: 'root'
})
export class GlobalNumberingService {
  
  // Tablas por tipo de sección
  private readonly TABLAS_POR_SECCION: Record<string, number> = {
    // AISD: cada subsección tiene su cantidad de tablas
    '3.1.4.A': 1,
    '3.1.4.A.1': 1,
    '3.1.4.A.1.1': 1,
    '3.1.4.A.1.2': 2,
    '3.1.4.A.1.3': 3,
    '3.1.4.A.1.4': 2,
    '3.1.4.A.1.5': 4,
    '3.1.4.A.1.6': 1,
    '3.1.4.A.1.7': 6,
    '3.1.4.A.1.8': 3,
    '3.1.4.A.1.9': 2,
    '3.1.4.A.1.10': 2,
    '3.1.4.A.1.11': 1,
    '3.1.4.A.1.12': 2,
    '3.1.4.A.1.13': 1,
    '3.1.4.A.1.14': 1,
    '3.1.4.A.1.15': 2,
    
    // AISI: cada subsección tiene su cantidad de tablas
    '3.1.4.B.1': 1,
    '3.1.4.B.1.1': 2,
    '3.1.4.B.1.2': 3,
    '3.1.4.B.1.3': 1,
    '3.1.4.B.1.4': 3,
    '3.1.4.B.1.5': 2,
    '3.1.4.B.1.6': 1,
    '3.1.4.B.1.7': 1,
    '3.1.4.B.1.8': 1,
    '3.1.4.B.1.9': 6,
  };
  
  constructor(
    private projectFacade: ProjectStateFacade
  ) {
    console.log('[GLOBAL-NUMBERING] ✅ Servicio inicializado');
  }

  /**
   * Detecta si es una sección AISI (contiene .B. en el path)
   */
  isAISISection(sectionId: string): boolean {
    return sectionId.includes('.B.');
  }
  
  /**
   * Detecta si es una sección AISD (contiene .A. en el path)
   */
  isAISDSection(sectionId: string): boolean {
    return sectionId.includes('.A.') || sectionId === '3.1.4.A';
  }
  
  /**
   * Obtiene la lista de grupos AISD
   */
  getAISDGroups(): { id: string; nombre: string }[] {
    const aisdGroups = this.projectFacade.groupsByType('AISD')();
    console.log('[GLOBAL-NUMBERING] 📋 Grupos AISD:', aisdGroups.length);
    return aisdGroups.map(g => ({ id: g.id, nombre: g.nombre }));
  }
  
  /**
   * Obtiene la lista de grupos AISI
   */
  getAISIGroups(): { id: string; nombre: string }[] {
    const aisiGroups = this.projectFacade.groupsByType('AISI')();
    console.log('[GLOBAL-NUMBERING] 📋 Grupos AISI:', aisiGroups.length);
    return aisiGroups.map(g => ({ id: g.id, nombre: g.nombre }));
  }
  
  /**
   * Extrae el índice numérico del grupo del sectionId
   * '3.1.4.A.1.1' → 1
   * '3.1.4.B.1' → 1
   * '3.1.4.B.2' → 2
   */
  extractGroupNumber(sectionId: string): number {
    // Buscar A.1, A.2... o B.1, B.2...
    const match = sectionId.match(/[AB]\.(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 1;
  }
  
  /**
   * Calcula el offset total de tablas hasta el grupo especificado
   */
  calculateTableOffset(groupType: string, groupNumber: number): number {
    const TABLAS_POR_GRUPO_AISD = 36;
    const TABLAS_POR_GRUPO_AISI = 22;
    
    if (groupType === 'AISD') {
      // Solo contar grupos AISD anteriores
      let offset = 0;
      const groups = this.getAISDGroups();
      for (let i = 0; i < groups.length; i++) {
        if (i + 1 >= groupNumber) break;
        offset += TABLAS_POR_GRUPO_AISD;
      }
      return offset;
    }
    
    if (groupType === 'AISI') {
      // Sumar tablas de TODOS los grupos AISD
      const aisdGroups = this.getAISDGroups();
      const tablasAISD = aisdGroups.length * TABLAS_POR_GRUPO_AISD;
      
      // Sumar tablas de grupos AISI anteriores
      let offset = tablasAISD;
      const groups = this.getAISIGroups();
      for (let i = 0; i < groups.length; i++) {
        if (i + 1 >= groupNumber) break;
        offset += TABLAS_POR_GRUPO_AISI;
      }
      
      return offset;
    }
    
    return 0;
  }
  
  /**
   * Calcula el offset de tablas dentro de la sección actual
   */
  private calculateSectionOffset(sectionId: string): number {
    let offset = 0;
    const sortedSections = Object.keys(this.TABLAS_POR_SECCION).sort();
    
    for (const sec of sortedSections) {
      if (sec === sectionId) break;
      offset += this.TABLAS_POR_SECCION[sec] || 0;
    }
    
    return offset;
  }
  
  /**
   * Obtiene el número global de un cuadro
   */
  getGlobalTableNumber(sectionId: string, localTableIndex: number): string {
    const groupNumber = this.extractGroupNumber(sectionId);
    const isAISI = this.isAISISection(sectionId);
    const isAISD = this.isAISDSection(sectionId);
    const groupType = isAISI ? 'AISI' : (isAISD ? 'AISD' : null);
    
    console.log(`[GLOBAL-NUMBERING] 🔢 sectionId: ${sectionId}`);
    console.log(`[GLOBAL-NUMBERING]   groupType: ${groupType}, groupNumber: ${groupNumber}`);
    
    // Calcular offset del grupo (tablas de grupos anteriores)
    const groupOffset = this.calculateTableOffset(groupType || 'AISI', groupNumber);
    console.log(`[GLOBAL-NUMBERING]   groupOffset: ${groupOffset}`);
    
    // Número global: base + offset del grupo + índice local
    // Para numeración global NO usamos sectionOffset
    const base = 2;
    const globalNumber = base + groupOffset + localTableIndex;
    
    console.log(`[GLOBAL-NUMBERING]   ✅ Cuadro N° 3.${globalNumber}`);
    return `3.${globalNumber}`;
  }
  
  /**
   * Obtiene el número global de una foto
   */
  getGlobalPhotoNumber(sectionId: string, prefix: string, photoIndex: number): string {
    // Por ahora retornar un número simple
    return `3.${photoIndex + 1}`;
  }
}
