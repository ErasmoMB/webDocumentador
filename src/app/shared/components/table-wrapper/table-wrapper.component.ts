import { Component, Input, AfterViewInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableNumberingService } from 'src/app/core/services/table-numbering.service';
import { debugLog } from 'src/app/shared/utils/debug';

@Component({
    imports: [CommonModule],
    selector: 'app-table-wrapper',
    template: `
    <p class="table-title" *ngIf="tableNumber && !hideNumber">Cuadro N° {{ tableNumber }}</p>
    <p class="table-title-main" *ngIf="title">{{ title }}</p>
    <ng-content></ng-content>
  `,
    host: {
        '[attr.data-section-id]': 'sectionId'
    },
    styles: []
})
export class TableWrapperComponent implements AfterViewInit {
  @Input() title: string = '';
  @Input() sectionId: string = 'default';
  @Input() hideNumber: boolean = false; // Ocultar número en formularios
  
  tableNumber: string = '';

  constructor(
    private tableNumberingService: TableNumberingService,
    private el: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    // Cuando esta tabla se renderiza, registrar cuántas tablas tiene su sección
    setTimeout(() => {
      // Solo registrar la PRIMERA tabla de cada sectionId
      // Esto evita que form y view registren por separado
      this.registerSectionTableCountOnce();
      this.calculateTableNumber();
      // Marcar para que Angular detecte el cambio en tableNumber
      this.cdr.markForCheck();
    }, 0);
  }

  private registerSectionTableCountOnce() {
    // Contar cuántas tablas del MISMO sectionId existen en el DOM
    const allTables = Array.from(document.querySelectorAll('app-table-wrapper'));
    const tablesInSection = allTables.filter(el => 
      el.getAttribute('data-section-id') === this.sectionId
    ).length;
    
    // Encontrar si esta es la PRIMERA tabla de su sectionId
    const firstTableOfSection = allTables.find(el => 
      el.getAttribute('data-section-id') === this.sectionId
    );
    
    // Solo registrar si esta ES la primera tabla de su sectionId
    if (firstTableOfSection === this.el.nativeElement) {
      // IMPORTANTE: Solo registrar si la sección NO tiene un valor predefinido en el servicio
      // Para AISD/AISI dinámicas, permitir el registro
      
      // ❌ Secciones fijas que NO deben registrarse dinámicamente (tienen configuración predefinida)
      const fixedSections = [
        '3.1.4.A.1.1',  // A.1.1 Institucionalidad - configuración fija
        '3.1.4.A.1.6',  // Sección 10: A.1.6 - configuración fija
        '3.1.4.A.1.7'   // Sección 11: A.1.7 - configuración fija
      ];
      
      const isFixedSection = fixedSections.includes(this.sectionId);
      const isDynamicAISDorAISI = (this.sectionId.startsWith('3.1.4.A.1.') || 
                                  this.sectionId.startsWith('3.1.4.B.1.') ||
                                  this.sectionId === '3.1.4.B') && !isFixedSection;
      
      if (isDynamicAISDorAISI) {
        // Para AISD/AISI DINÁMICAS: registrar dinámicamente
        this.tableNumberingService.registerSectionTableCount(this.sectionId, tablesInSection);
      } else {
        // Para secciones fijas: no registrar, usar configuración inicial
        // primera tabla detectada, usando configuración predefinida
      }
    }
  }

  private calculateTableNumber() {
    const allTables = Array.from(document.querySelectorAll('app-table-wrapper'));
    let localIndex = 0;
    
    // Contar cuántas tablas del MISMO sectionId vienen ANTES de esta
    for (let i = 0; i < allTables.length; i++) {
      if (allTables[i] === this.el.nativeElement) {
        break;
      }
      const tableElement = allTables[i];
      const tableSectionId = tableElement.getAttribute('data-section-id');
      
      // Si tiene el MISMO sectionId, incrementar localIndex
      if (tableSectionId === this.sectionId) {
        localIndex++;
      }
    }
    
    // Pasar el índice local correcto al servicio
    this.tableNumber = this.tableNumberingService.getGlobalTableNumber(this.sectionId, localIndex);
    
    // 🔍 DEBUG: Solo para 3.1.4.B (Ubicación referencial)
    if (this.sectionId === '3.1.4.B') {
      debugLog(`[NUMERACIÓN] 📋 TableWrapper para ${this.sectionId}:`, {
        title: this.title,
        localIndex,
        tableNumber: this.tableNumber,
        totalTablesInDOM: allTables.length,
        tablesWithSameSectionId: allTables.filter(t => t.getAttribute('data-section-id') === this.sectionId).length
      });
    }
  }
}


