import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';

@Component({
    imports: [CommonModule],
    selector: 'app-table-wrapper',
    template: `
    <p class="table-title" *ngIf="tableNumber && !hideNumber">Cuadro N° {{ tableNumber }}</p>
    <p class="table-title-main" *ngIf="title">{{ title }}</p>
    <ng-content></ng-content>
  `,
    host: {
        '[attr.data-section-id]': 'sectionId',
        '[attr.data-hide-number]': 'hideNumber'
    },
    styles: []
})
export class TableWrapperComponent implements AfterViewInit {
  @Input() title: string = '';
  @Input() sectionId: string = 'default';
  @Input() hideNumber: boolean = false; // Ocultar número en formularios
  
  tableNumber: string = '';

  private afterViewInitDone = false;

  constructor(
    private globalNumbering: GlobalNumberingService,
    private el: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.afterViewInitDone = true;
      this.calculateTableNumber();
      this.cdr.markForCheck();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.afterViewInitDone) return;
    if (changes['sectionId'] || changes['hideNumber']) {
      this.calculateTableNumber();
      this.cdr.markForCheck();
    }
  }

  private calculateTableNumber() {
    if (this.hideNumber) {
      this.tableNumber = '';
      return;
    }

    const allTables = Array.from(document.querySelectorAll('app-table-wrapper'));
    let localIndex = 0;
    
    // Contar cuántas tablas del MISMO sectionId vienen ANTES de esta
    for (let i = 0; i < allTables.length; i++) {
      if (allTables[i] === this.el.nativeElement) {
        break;
      }
      const tableElement = allTables[i];
      const tableSectionId = tableElement.getAttribute('data-section-id');
      const isHidden = tableElement.getAttribute('data-hide-number') === 'true';
      
      // Si tiene el MISMO sectionId, incrementar localIndex
      if (tableSectionId === this.sectionId && !isHidden) {
        localIndex++;
      }
    }
    
    // Pasar el índice local correcto al servicio
    this.tableNumber = this.globalNumbering.getGlobalTableNumber(this.sectionId, localIndex);
  }
}


