import { Component, Input, AfterViewInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableNumberingService } from 'src/app/core/services/numbering/table-numbering.service';
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

  private changesSub: any;

  constructor(
    private tableNumberingService: TableNumberingService,
    private el: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    // Registrar conteo la primera vez
    setTimeout(() => {
      this.registerSectionTableCountOnce();
      // Calcular número inicial
      this.calculateTableNumber();
      this.cdr.markForCheck();

      // Suscribirse a cambios del servicio para recalcular automáticamente
      this.changesSub = this.tableNumberingService.changes$.subscribe(() => {
        this.calculateTableNumber();
        this.cdr.markForCheck();
      });
    }, 0);
  }

  ngOnDestroy() {
    if (this.changesSub) {
      this.changesSub.unsubscribe();
    }
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
        // AISD
        '3.1.4.A.1.1',  // A.1.1 Institucionalidad
        '3.1.4.A.1.6',  // A.1.6 Servicios básicos
        '3.1.4.A.1.7',  // A.1.7 Telecomunicaciones
        '3.1.4.A.1.8',  // A.1.8 Salud y educación
        '3.1.4.A.1.9',  // A.1.9 Salud
        '3.1.4.A.1.10', // A.1.10 Educación
        '3.1.4.A.1.11', // A.1.11 Lenguas y religión
        '3.1.4.A.1.13', // A.1.13 IDH
        '3.1.4.A.1.14', // A.1.14 NBI
        '3.1.4.A.1.15', // A.1.15 Autoridades
        '3.1.4.A.1.16', // A.1.16 Festividades
        // AISI
        '3.1.4.B.1',    // B.1: Centro Poblado
        '3.1.4.B.1.1',  // B.1.1: Aspectos demográficos
        '3.1.4.B.1.2',  // B.1.2: PET, PEA
        '3.1.4.B.1.4',  // B.1.4: Vivienda
        '3.1.4.B.1.5',  // B.1.5: Servicios básicos
        '3.1.4.B.1.6',  // B.1.6: Telecomunicaciones
        '3.1.4.B.1.7',  // B.1.7: Salud y educación
        '3.1.4.B.1.8',  // B.1.8: Salud
        '3.1.4.B.1.9',  // B.1.9: Educación
        '3.1.4.B.1.10', // B.1.10: Lenguas y religión
        '3.1.4.B.1.12', // B.1.12: IDH
        '3.1.4.B.1.13', // B.1.13: NBI
        '3.1.4.B.1.14', // B.1.14: Autoridades
        '3.1.4.B.1.15', // B.1.15: Festividades
        '3.1.4.B.1.16'  // B.1.16: Mapa de actores
      ];
      
      const isFixedSection = fixedSections.includes(this.sectionId);
      const isDynamicAISDorAISI = (this.sectionId.startsWith('3.1.4.A.1.') || 
                                  this.sectionId.startsWith('3.1.4.B.1.') ||
                                  this.sectionId === '3.1.4.B' ||
                                  this.sectionId === '3.1.4.B.1') && !isFixedSection;
      
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


