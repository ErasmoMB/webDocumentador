import { Injectable } from '@angular/core';
import { FormularioService } from './formulario.service';

@Injectable({
  providedIn: 'root'
})
export class TableNumberingService {

  private readonly allSections = [
    { id: '3.1.1', tableCount: 0, order: 1 },
    { id: '3.1.2', tableCount: 0, order: 2 },
    { id: '3.1.2.A', tableCount: 0, order: 2 },
    { id: '3.1.2.B', tableCount: 0, order: 2 },
    { id: '3.1.3', tableCount: 1, order: 3 },
    { id: '3.1.4.A', tableCount: 0, order: 4 },
    { id: '3.1.4.A.1', tableCount: 2, order: 4 },
    { id: '3.1.4.A.1.1', tableCount: 1, order: 5 },
    { id: '3.1.4.A.1.2', tableCount: 2, order: 6 },
    { id: '3.1.4.A.1.3', tableCount: 3, order: 7 },
    { id: '3.1.4.A.1.4', tableCount: 3, order: 8 },
    { id: '3.1.4.A.1.5', tableCount: 2, order: 9 },
    { id: '3.1.4.A.1.6', tableCount: 3, order: 10 },
    { id: '3.1.4.A.1.7', tableCount: 1, order: 11 },
    { id: '3.1.4.A.1.8', tableCount: 6, order: 12 },
    { id: '3.1.4.A.1.9', tableCount: 3, order: 13 },
    { id: '3.1.4.A.1.10', tableCount: 2, order: 14 },
    { id: '3.1.4.A.1.11', tableCount: 1, order: 15 },
    { id: '3.1.4.A.1.12', tableCount: 0, order: 16 },
    { id: '3.1.4.A.1.13', tableCount: 1, order: 17 },
    { id: '3.1.4.A.1.14', tableCount: 2, order: 18 },
    { id: '3.1.4.A.1.15', tableCount: 1, order: 19 },
    { id: '3.1.4.A.1.16', tableCount: 1, order: 20 },
    { id: '3.1.4.B', tableCount: 1, order: 21 },
    { id: '3.1.4.B.1', tableCount: 2, order: 21 },
    { id: '3.1.4.B.1.1', tableCount: 2, order: 22 },
    { id: '3.1.4.B.1.2', tableCount: 3, order: 23 },
    { id: '3.1.4.B.1.3', tableCount: 1, order: 24 },
    { id: '3.1.4.B.1.4', tableCount: 3, order: 25 },
    { id: '3.1.4.B.1.5', tableCount: 4, order: 26 },
    { id: '3.1.4.B.1.6', tableCount: 1, order: 27 },
    { id: '3.1.4.B.1.7', tableCount: 2, order: 28 },
    { id: '3.1.4.B.1.8', tableCount: 3, order: 29 },
    { id: '3.1.4.B.1.9', tableCount: 2, order: 30 }
  ];

  getSectionConfig(sectionId: string): { id: string; tableCount: number; order: number } | null {
    return this.allSections.find(s => s.id === sectionId) || null;
  }

  getGlobalTableNumber(sectionId: string, tableIndexInSection: number): string {
    const currentSection = this.getSectionConfig(sectionId);
    
    if (!currentSection) {
      return '';
    }

    let globalIndex = 0;
    const processedSections = new Set<string>();

    const sortedSections = [...this.allSections].sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.id.localeCompare(b.id);
    });

    for (const section of sortedSections) {
      if (section.order < currentSection.order && !processedSections.has(section.id)) {
        globalIndex += section.tableCount;
        processedSections.add(section.id);
      } 
      else if (section.order === currentSection.order && section.id !== currentSection.id) {
        if (section.id < currentSection.id) {
          globalIndex += section.tableCount;
        }
      }
    }

    globalIndex += tableIndexInSection;

    return `3.${globalIndex + 1}`;
  }
}
