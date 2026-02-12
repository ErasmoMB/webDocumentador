import { Injectable } from '@angular/core';
import { ProjectStateFacade } from '../../state/project-state.facade';

/**
 * GlobalNumberingService - Servicio para numeración global de cuadros y fotografías
 * 
 * ✅ SOPORTA GRUPOS AISI Y AISD DINÁMICOS
 * 
 * Características:
 * - Cuadros: Cantidad FIJA por tipo de sección
 * - Fotos: Cantidad VARIABLE (se cuenta dinámicamente)
 * - Numeración global basada en el orden de aparición de grupos
 */
@Injectable({
  providedIn: 'root'
})
export class GlobalNumberingService {
  
  // Tablas por tipo de sección
  private readonly TABLAS_POR_SECCION: Record<string, number> = {
    // AISD
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
    
    // AISI B.1
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
    
    // AISI B.2
    '3.1.4.B.2': 1,
    '3.1.4.B.2.1': 2,
    '3.1.4.B.2.2': 3,
    '3.1.4.B.2.3': 1,
    '3.1.4.B.2.4': 3,
    '3.1.4.B.2.5': 2,
    '3.1.4.B.2.6': 1,
    '3.1.4.B.2.7': 1,
    '3.1.4.B.2.8': 1,
    '3.1.4.B.2.9': 6,
    
    // AISI B.3
    '3.1.4.B.3': 1,
    '3.1.4.B.3.1': 2,
    '3.1.4.B.3.2': 3,
    '3.1.4.B.3.3': 1,
    '3.1.4.B.3.4': 3,
    '3.1.4.B.3.5': 2,
    '3.1.4.B.3.6': 1,
    '3.1.4.B.3.7': 1,
    '3.1.4.B.3.8': 1,
    '3.1.4.B.3.9': 6,
  };
  
  // Fotos base por sección (para legacy)
  // (No se usa actualmente, pero se deja para referencia)
  // private readonly FOTOS_BASE: Record<string, number> = {
  //   '3.1.1': 1,
  //   '3.1.2': 3,
  //   '3.1.3': 4,
  // };
  
  constructor(
    private projectFacade: ProjectStateFacade
  ) {}

  isAISISection(sectionId: string): boolean {
    return sectionId.includes('.B.');
  }
  
  isAISDSection(sectionId: string): boolean {
    return sectionId.includes('.A.') || sectionId === '3.1.4.A';
  }
  
  getAISDGroups(): { id: string; nombre: string }[] {
    const aisdGroups = this.projectFacade.groupsByType('AISD')();
    return aisdGroups.map(g => ({ id: g.id, nombre: g.nombre }));
  }
  
  getAISIGroups(): { id: string; nombre: string }[] {
    const aisiGroups = this.projectFacade.groupsByType('AISI')();
    // Generar IDs correctos basados en el orden: B.1, B.2, B.3, etc.
    return aisiGroups.map((g, index) => ({ 
      id: `B.${index + 1}`, 
      nombre: g.nombre 
    }));
  }
  
  extractGroupNumber(sectionId: string): number {
    // Primero intentar extraer de sectionId (ej: 3.1.4.B.1 → 1)
    const match = sectionId.match(/[AB]\.(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    
    // Si no hay coincidencia, intentar extraer de un ID de grupo simple (ej: B.1 → 1)
    const groupMatch = sectionId.match(/^([AB])\.(\d+)$/);
    if (groupMatch) {
      return parseInt(groupMatch[2], 10);
    }
    
    // Si es solo una letra (A, B), devolver 1 por defecto
    if (/^[AB]$/.test(sectionId)) {
      return 1;
    }
    
    return 1;
  }
  
  calculateTableOffset(groupType: string, groupNumber: number): number {
    const TABLAS_POR_GRUPO_AISD = 36;
    const TABLAS_POR_GRUPO_AISI = 22;
    
    if (groupType === 'AISD') {
      let offset = 0;
      const groups = this.getAISDGroups();
      for (let i = 0; i < groups.length; i++) {
        if (i + 1 >= groupNumber) break;
        offset += TABLAS_POR_GRUPO_AISD;
      }
      return offset;
    }
    
    if (groupType === 'AISI') {
      const aisdGroups = this.getAISDGroups();
      const tablasAISD = aisdGroups.length * TABLAS_POR_GRUPO_AISD;
      
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
  
  getGlobalTableNumber(sectionId: string, localTableIndex: number): string {
    const groupNumber = this.extractGroupNumber(sectionId);
    const isAISI = this.isAISISection(sectionId);
    const isAISD = this.isAISDSection(sectionId);
    const groupType = isAISI ? 'AISI' : (isAISD ? 'AISD' : null);
    
    const groupOffset = this.calculateTableOffset(groupType || 'AISI', groupNumber);
    const base = 2;
    const globalNumber = base + groupOffset + localTableIndex;
    return `3.${globalNumber}`;
  }
  
  /**
   * Cuenta las imágenes existentes en una sección específica
   */
  private countImagesInSection(sectionId: string, prefix: string): number {
    const datos = this.projectFacade.obtenerDatos();
    let count = 0;
    console.log(`[DEBUG-COUNT-IMAGES] sectionId=${sectionId}, prefix=${prefix}`);
    for (let i = 1; i <= 10; i++) {
      const key = `${prefix}${i}Imagen`;
      const img = datos[key];
      const hasImage = img && img !== 'null' && img.trim() !== '' && (img.startsWith('data:image') || img.length > 100);
      if (hasImage) {
        count++;
        console.log(`[DEBUG-COUNT-IMAGES]   ${key}: SÍ ✅ (total: ${count})`);
      } else {
        console.log(`[DEBUG-COUNT-IMAGES]   ${key}: NO ❌`);
      }
    }
    console.log(`[DEBUG-COUNT-IMAGES] TOTAL: ${count}`);
    return count;
  }
  
  /**
   * Genera el prefijo de fotos para una sección
   */
  private getPhotoPrefix(sectionId: string, prefijoGrupo: string): string {
    if (prefijoGrupo) {
      return `fotografia${prefijoGrupo}`;
    }
    if (sectionId.startsWith('3.1.1')) return 'fotografia';
    if (sectionId.startsWith('3.1.2')) return 'fotografia';
    if (sectionId.startsWith('3.1.3')) return 'fotografia';
    return 'fotografia';
  }
  
  /**
   * Calcula el offset total de imágenes en grupos/secciones anteriores
   * 
   * LÓGICA:
   * 1. Secciones fijas (1-3): contar fotos en 3.1.1, 3.1.2, 3.1.3
   * 2. Grupos AISD: contar fotos en sección base de cada grupo A.1, A.2, etc.
   * 3. Grupos AISI: contar fotos en sección base de B.1, B.2 (hasta el grupo actual - 1)
   * 4. Secciones del grupo actual: contar fotos en subsecciones anteriores
   */
  private calculatePhotoOffset(sectionId: string, prefijoGrupo: string): number {
    let totalImages = 0;
    const currentGroupNum = this.extractGroupNumber(sectionId);
    const currentSectionNum = this.extractSectionNumber(sectionId);
    
    console.log(`[DEBUG-PHOTO-OFFSET] sectionId=${sectionId}, groupNum=${currentGroupNum}, sectionNum=${currentSectionNum}`);
    
    // 1. Secciones fijas (1-3) - fotos base (sin prefijo de grupo)
    totalImages += this.countImagesInSection('3.1.1', 'fotografia');
    totalImages += this.countImagesInSection('3.1.2', 'fotografia');
    totalImages += this.countImagesInSection('3.1.3', 'fotografia');
    console.log(`[DEBUG-PHOTO-OFFSET] Secciones fijas: ${totalImages}`);
    
    // 2. Grupos AISD - solo sección base (3.1.4.A, 3.1.4.A.1, 3.1.4.A.2, etc.)
    const aisdGroups = this.getAISDGroups();
    console.log(`[DEBUG-PHOTO-OFFSET] Grupos AISD: ${aisdGroups.length}`);
    for (const group of aisdGroups) {
      const groupNum = this.extractGroupNumber(group.id);
      // Sección base del grupo AISD
      const sectionBaseId = groupNum > 1 ? `3.1.4.A.${groupNum}` : '3.1.4.A';
      const prefix = this.getPhotoPrefix(sectionBaseId, '');
      const count = this.countImagesInSection(sectionBaseId, prefix);
      totalImages += count;
      console.log(`[DEBUG-PHOTO-OFFSET] AISD ${groupNum} (${sectionBaseId}): +${count}`);
    }
    
    // 3. Grupos AISI - solo sección base de cada grupo (B.1, B.2, etc.)
    const aisiGroups = this.getAISIGroups();
    console.log(`[DEBUG-PHOTO-OFFSET] Grupos AISI: ${aisiGroups.length}, actual=${currentGroupNum}`);
    console.log(`[DEBUG-PHOTO-OFFSET] Grupos AISI IDs: ${aisiGroups.map(g => g.id).join(', ')}`);
    
    for (const group of aisiGroups) {
      const groupNum = this.extractGroupNumber(group.id);
      const groupPrefix = `_B${groupNum}`;
      console.log(`[DEBUG-PHOTO-OFFSET] Iterando grupo: B.${groupNum} (id: ${group.id})`);
      
      // Si es un grupo anterior al actual, contar fotos en sección base
      if (groupNum < currentGroupNum) {
        const sectionBaseId = `3.1.4.B.${groupNum}`;
        const prefix = this.getPhotoPrefix(sectionBaseId, groupPrefix);
        const count = this.countImagesInSection(sectionBaseId, prefix);
        totalImages += count;
        console.log(`[DEBUG-PHOTO-OFFSET] AISI B.${groupNum} (${sectionBaseId}): +${count} (total: ${totalImages})`);
      }
      
      // Si es el grupo actual, contar fotos en subsecciones anteriores
      if (groupNum === currentGroupNum && currentSectionNum > 1) {
        console.log(`[DEBUG-PHOTO-OFFSET] Contando subsecciones anteriores en B.${groupNum}`);
        for (let secNum = 1; secNum < currentSectionNum; secNum++) {
          const subSectionId = `3.1.4.B.${groupNum}.${secNum}`;
          const prefix = this.getPhotoPrefix(subSectionId, prefijoGrupo);
          const count = this.countImagesInSection(subSectionId, prefix);
          totalImages += count;
          console.log(`[DEBUG-PHOTO-OFFSET]   Subsección ${subSectionId}: +${count}`);
        }
        break;
      }
    }
    
    console.log(`[DEBUG-PHOTO-OFFSET] TOTAL OFFSET: ${totalImages}`);
    return totalImages;
  }
  
  /**
   * Extrae el número de subsección del sectionId
   * 
   * Funciona para:
   * - 3.1.4.B.1 → 1 (grupo B.1, sección base)
   * - 3.1.4.B.1.1 → 1 (subsección 1 del grupo B.1)
   * - 3.1.4.B.1.2 → 2 (subsección 2 del grupo B.1)
   * - 3.1.4.B.2 → 1 (grupo B.2, sección base)
   * - 3.1.4.B.2.1 → 1 (subsección 1 del grupo B.2)
   */
  private extractSectionNumber(sectionId: string): number {
    // Extraer el número de grupo: B.1, B.2, B.3
    const groupMatch = sectionId.match(/\.B\.(\d+)/);
    if (!groupMatch) return 1;
    
    const groupNum = groupMatch[1];
    // Buscar la subsección después del grupo: .1, .2, etc.
    const sectionMatch = sectionId.match(new RegExp(`\\.B\\.${groupNum}\\.(\\d+)`));
    if (sectionMatch) {
      return parseInt(sectionMatch[1], 10);
    }
    
    // Si no hay subsección, es la sección base del grupo (ej: 3.1.4.B.1 o 3.1.4.B.2)
    return 1;
  }
  
  /**
   * Obtiene el número global de una fotografía
   * 
   * FÓRMULA: numero = fotosAnteriores + photoIndex + 1
   * 
   * DONDE:
   * - fotosAnteriores = fotos de secciones 1-3 + AISD + AISI anteriores
   * - photoIndex = posición de la foto dentro del grupo (0, 1, 2...)
   * 
   * @param sectionId - ID de la sección
   * @param prefijoGrupo - Prefijo del grupo (ej: '_B1')
   * @param photoIndex - Posición de la foto dentro del grupo (0, 1, 2...)
   */
  getGlobalPhotoNumber(sectionId: string, prefijoGrupo: string, photoIndex: number): string {
    const fotosAnteriores = this.calculatePhotoOffset(sectionId, prefijoGrupo);
    
    // Verificar si hay una imagen real en esta posición
    const key = `${prefijoGrupo ? 'fotografia' + prefijoGrupo : 'fotografia'}${photoIndex + 1}Imagen`;
    const datos = this.projectFacade.obtenerDatos();
    const imagen = datos[key];
    const hayImagen = imagen && imagen !== 'null' && imagen.trim() !== '' && (imagen.startsWith('data:image') || imagen.length > 100);
    
    // La fórmula: numero = fotosAnteriores + photoIndex + 1
    const globalNumber = fotosAnteriores + photoIndex + 1;
    
    console.log(`[DEBUG-PHOTO] ==========`);
    console.log(`[DEBUG-PHOTO] sectionId: ${sectionId}`);
    console.log(`[DEBUG-PHOTO] prefijoGrupo: ${prefijoGrupo}`);
    console.log(`[DEBUG-PHOTO] fotoIndex (0-basado): ${photoIndex}`);
    console.log(`[DEBUG-PHOTO] clave de imagen: ${key}`);
    console.log(`[DEBUG-PHOTO] ¿HAY IMAGEN?: ${hayImagen ? 'SÍ ✅' : 'NO ❌'}`);
    console.log(`[DEBUG-PHOTO] fotos anteriores: ${fotosAnteriores}`);
    console.log(`[DEBUG-PHOTO] globalNumber: ${fotosAnteriores} + ${photoIndex} + 1 = ${globalNumber}`);
    console.log(`[DEBUG-PHOTO] RESULTADO: 3.${globalNumber}`);
    console.log(`[DEBUG-PHOTO] ==========`);
    
    return `3.${globalNumber}`;
  }
}
