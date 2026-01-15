import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NumberingService {
  private sectionTableCounts: { [sectionId: string]: number } = {
    '3.1.1': 0,
    '3.1.2': 0,
    '3.1.2.A': 0,
    '3.1.2.B': 0,
    '3.1.3': 1,
    '3.1.4.A': 0,
    '3.1.4.A.1': 2,
    '3.1.4.A.1.1': 1,
    '3.1.4.A.1.2': 2,
    '3.1.4.A.1.3': 3,
    '3.1.4.A.1.4': 3,
    '3.1.4.A.1.5': 2,
    '3.1.4.A.1.6': 3,
    '3.1.4.A.1.7': 1,
    '3.1.4.A.1.8': 6,
    '3.1.4.A.1.9': 3,
    '3.1.4.A.1.10': 2,
    '3.1.4.A.1.11': 1,
    '3.1.4.A.1.12': 0,
    '3.1.4.A.1.13': 1,
    '3.1.4.A.1.14': 2,
    '3.1.4.A.1.15': 1,
    '3.1.4.A.1.16': 1,
    '3.1.4.B': 2,
    '3.1.4.B.1': 2,
    '3.1.4.B.1.1': 4,
    '3.1.4.B.1.2': 6,
    '3.1.4.B.1.3': 2,
    '3.1.4.B.1.4': 6,
    '3.1.4.B.1.5': 8,
    '3.1.4.B.1.6': 2,
    '3.1.4.B.1.7': 4,
    '3.1.4.B.1.8': 6,
    '3.1.4.B.1.9': 4,
    '3.1.4.B.1.10': 4,
    '3.1.4.B.1.11': 0,
    '3.1.4.B.1.12': 2,
    '3.1.4.B.1.13': 4,
    '3.1.4.B.1.14': 2,
    '3.1.4.B.1.15': 4
  };

  private sectionPhotoCounts: { [sectionId: string]: number } = {
    '3.1.1': 0,
    '3.1.2': 0,
    '3.1.2.A': 0,
    '3.1.2.B': 0,
    '3.1.3': 0,
    '3.1.4.A': 0,
    '3.1.4.A.1': 0,
    '3.1.4.A.1.1': 1,
    '3.1.4.A.1.2': 0,
    '3.1.4.A.1.3': 0,
    '3.1.4.A.1.4': 0,
    '3.1.4.A.1.5': 1,
    '3.1.4.A.1.6': 2,
    '3.1.4.A.1.7': 2,
    '3.1.4.A.1.8': 4,
    '3.1.4.A.1.9': 0,
    '3.1.4.A.1.10': 0,
    '3.1.4.A.1.11': 1,
    '3.1.4.A.1.12': 2,
    '3.1.4.A.1.13': 0,
    '3.1.4.A.1.14': 0,
    '3.1.4.A.1.15': 0,
    '3.1.4.A.1.16': 0,
    '3.1.4.B': 2,
    '3.1.4.B.1': 2,
    '3.1.4.B.1.1': 0,
    '3.1.4.B.1.2': 0,
    '3.1.4.B.1.3': 4,
    '3.1.4.B.1.4': 2,
    '3.1.4.B.1.5': 4,
    '3.1.4.B.1.6': 4,
    '3.1.4.B.1.7': 8,
    '3.1.4.B.1.8': 0,
    '3.1.4.B.1.9': 0,
    '3.1.4.B.1.10': 2,
    '3.1.4.B.1.11': 0,
    '3.1.4.B.1.12': 0,
    '3.1.4.B.1.13': 0,
    '3.1.4.B.1.14': 0,
    '3.1.4.B.1.15': 0
  };

  private sectionOrder: string[] = [
    '3.1.1', '3.1.2', '3.1.2.A', '3.1.2.B', '3.1.3',
    '3.1.4.A', '3.1.4.A.1', '3.1.4.A.1.1', '3.1.4.A.1.2', '3.1.4.A.1.3',
    '3.1.4.A.1.4', '3.1.4.A.1.5', '3.1.4.A.1.6', '3.1.4.A.1.7', '3.1.4.A.1.8',
    '3.1.4.A.1.9', '3.1.4.A.1.10', '3.1.4.A.1.11', '3.1.4.A.1.12', '3.1.4.A.1.13',
    '3.1.4.A.1.14', '3.1.4.A.1.15', '3.1.4.A.1.16', '3.1.4.B', '3.1.4.B.1',
    '3.1.4.B.1.1', '3.1.4.B.1.2', '3.1.4.B.1.3', '3.1.4.B.1.4', '3.1.4.B.1.5',
    '3.1.4.B.1.6', '3.1.4.B.1.7', '3.1.4.B.1.8', '3.1.4.B.1.9', '3.1.4.B.1.10',
    '3.1.4.B.1.11', '3.1.4.B.1.12', '3.1.4.B.1.13', '3.1.4.B.1.14', '3.1.4.B.1.15'
  ];

  getGlobalTableIndex(sectionId: string, localIndex: number, element: Element): number {
    const allTables = Array.from(document.querySelectorAll('app-table-wrapper'));
    const currentSectionIndex = this.sectionOrder.indexOf(sectionId);
    
    if (allTables.length > 20) {
      const domIndex = allTables.indexOf(element);
      return domIndex >= 0 ? domIndex : localIndex;
    }
    
    if (currentSectionIndex >= 0) {
      let tablesBeforeCurrent = 0;
      
      for (let i = 0; i < currentSectionIndex; i++) {
        const prevSectionId = this.sectionOrder[i];
        tablesBeforeCurrent += this.sectionTableCounts[prevSectionId] || 0;
      }
      
      const domIndex = allTables.indexOf(element);
      if (domIndex >= 0) {
        return tablesBeforeCurrent + domIndex;
      }
      
      return tablesBeforeCurrent + localIndex;
    }
    
    const domIndex = allTables.indexOf(element);
    return domIndex >= 0 ? domIndex : localIndex;
  }

  getGlobalPhotoIndex(sectionId: string, localIndex: number, element: Element): number {
    const allPhotos = Array.from(document.querySelectorAll('app-foto-info[autoNumber="true"], app-image-upload[mostrarNumero="true"]'));
    const currentSectionIndex = this.sectionOrder.indexOf(sectionId);
    
    if (allPhotos.length > 20) {
      const domIndex = allPhotos.indexOf(element);
      return domIndex >= 0 ? domIndex : localIndex;
    }
    
    if (currentSectionIndex >= 0) {
      let photosBeforeCurrent = 0;
      
      for (let i = 0; i < currentSectionIndex; i++) {
        const prevSectionId = this.sectionOrder[i];
        photosBeforeCurrent += this.sectionPhotoCounts[prevSectionId] || 0;
      }
      
      const domIndex = allPhotos.indexOf(element);
      if (domIndex >= 0) {
        return photosBeforeCurrent + domIndex;
      }
      
      return photosBeforeCurrent + localIndex;
    }
    
    const domIndex = allPhotos.indexOf(element);
    return domIndex >= 0 ? domIndex : localIndex;
  }

  getFormattedTableNumber(sectionId: string, globalIndex: number): string {
    const number = globalIndex + 1;
    if (sectionId.startsWith('3.1')) {
      return `3.${number}`;
    }
    return number.toString();
  }

  getFormattedPhotoNumber(sectionId: string, globalIndex: number): string {
    const number = globalIndex + 1;
    if (sectionId.startsWith('3.1')) {
      return `3.${number}`;
    }
    return number.toString();
  }
}


