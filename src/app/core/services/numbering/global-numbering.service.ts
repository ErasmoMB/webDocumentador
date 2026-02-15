import { Injectable } from '@angular/core';
import { ProjectStateFacade } from '../../state/project-state.facade';
import { PhotoNumberingService } from './photo-numbering.service';

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
  // --- Tablas: configuración por subsección (los conteos son FIJOS) ---
  // Nota: Sección 4 (intro AISD) tiene 2 cuadros (Ubicación + Población/Viviendas).
  private readonly TABLAS_FIJAS_BASE: Record<string, number> = {
    '3.1.1': 0,
    '3.1.2': 0,
    '3.1.2.A': 0,
    '3.1.2.B': 0,
    '3.1.3': 1,
    '3.1.4.B': 0
  };

  private readonly TABLAS_AISD_SUBSECCION: Record<number, number> = {
    1: 1,
    2: 2,
    3: 3,
    4: 3,
    5: 2,
    6: 4,
    7: 1,
    8: 6,
    9: 3,
    10: 2,
    11: 2,
    12: 2,
    13: 0,
    14: 1,
    15: 2,
    16: 1
  };

  private readonly TABLAS_AISI_SUBSECCION: Record<number, number> = {
    1: 2,
    2: 3,
    3: 0,
    4: 3,
    5: 4,
    6: 1,
    7: 2,
    8: 3,
    9: 2,
    10: 2,
    11: 0,
    12: 1,
    13: 2,
    14: 1,
    15: 1,
    16: 1
  };
  
  // Fotos base por sección (para legacy)
  // (No se usa actualmente, pero se deja para referencia)
  // private readonly FOTOS_BASE: Record<string, number> = {
  //   '3.1.1': 1,
  //   '3.1.2': 3,
  //   '3.1.3': 4,
  // };
  
  constructor(
    private projectFacade: ProjectStateFacade,
    private photoNumberingService: PhotoNumberingService
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
  
  private getDynamicGroupCount(): { aisd: number; aisi: number } {
    const datos: any = this.projectFacade.obtenerDatos() || {};
    const comunidades = Array.isArray(datos.comunidadesCampesinas) ? datos.comunidadesCampesinas.length : 0;
    const distritos = Array.isArray(datos.distritosAISI) ? datos.distritosAISI.length : 0;
    return {
      aisd: comunidades > 0 ? comunidades : 1,
      aisi: distritos > 0 ? distritos : 1
    };
  }

  private getOrderedSectionIdsForTables(): string[] {
    const { aisd, aisi } = this.getDynamicGroupCount();
    const ordered: string[] = ['3.1.1', '3.1.2.A', '3.1.2.B', '3.1.3'];

    for (let g = 1; g <= aisd; g++) {
      ordered.push(`3.1.4.A.${g}`);
      for (let s = 1; s <= 16; s++) {
        ordered.push(`3.1.4.A.${g}.${s}`);
      }
    }

    ordered.push('3.1.4.B');

    for (let g = 1; g <= aisi; g++) {
      ordered.push(`3.1.4.B.${g}`);
      for (let s = 1; s <= 16; s++) {
        ordered.push(`3.1.4.B.${g}.${s}`);
      }
    }

    return ordered;
  }

  private getTableCountForSection(sectionId: string): number {
    if (this.TABLAS_FIJAS_BASE[sectionId] !== undefined) return this.TABLAS_FIJAS_BASE[sectionId];

    const aisdIntro = sectionId.match(/^3\.1\.4\.A\.(\d+)$/);
    if (aisdIntro) return 2;

    const aisdSub = sectionId.match(/^3\.1\.4\.A\.(\d+)\.(\d+)$/);
    if (aisdSub) {
      const s = parseInt(aisdSub[2], 10);
      return this.TABLAS_AISD_SUBSECCION[s] ?? 0;
    }

    const aisiIntro = sectionId.match(/^3\.1\.4\.B\.(\d+)$/);
    if (aisiIntro) return 1;

    const aisiSub = sectionId.match(/^3\.1\.4\.B\.(\d+)\.(\d+)$/);
    if (aisiSub) {
      const s = parseInt(aisiSub[2], 10);
      return this.TABLAS_AISI_SUBSECCION[s] ?? 0;
    }

    return 0;
  }

  /**
   * ✅ Numeración global REAL para tablas
   * - Secciones 1–3: fijas
   * - Desde sección 4: dinámicas por grupo AISD/AISI
   * - Conteo de tablas por sección: fijo (por subsección)
   */
  getGlobalTableNumber(sectionId: string, localTableIndex: number): string {
    const ordered = this.getOrderedSectionIdsForTables();
    const idx = ordered.indexOf(sectionId);
    if (idx === -1) return '';

    let totalPrev = 0;
    for (let i = 0; i < idx; i++) {
      totalPrev += this.getTableCountForSection(ordered[i]);
    }

    const globalIndex = totalPrev + localTableIndex + 1;
    return `3.${globalIndex}`;
  }

  /**
   * ✅ Numeración global para fotos
   * API usada en componentes: (sectionId, photoPrefix, photoIndex0Based)
   */
  getGlobalPhotoNumber(sectionId: string, photoPrefix: string, photoIndex: number): string {
    return this.photoNumberingService.getGlobalPhotoNumber(sectionId, photoIndex + 1, photoPrefix);
  }
  // Nota: La numeración de fotos ya NO se calcula aquí; se delega a PhotoNumberingService.
}
