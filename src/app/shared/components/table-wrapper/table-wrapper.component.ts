import { Component, Input, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { TableNumberingService } from 'src/app/core/services/table-numbering.service';

@Component({
  selector: 'app-table-wrapper',
  template: `
    <p class="table-title" *ngIf="tableNumber">Cuadro N° {{ tableNumber }}</p>
    <p class="table-title-main" *ngIf="title">{{ title }}</p>
    <ng-content></ng-content>
  `,
  host: {
    '[attr.data-section-id]': 'sectionId'
  },
  styles: []
})
export class TableWrapperComponent implements OnInit, AfterViewInit {
  @Input() title: string = '';
  @Input() sectionId: string = 'default';
  
  tableNumber: string = '';

  constructor(
    private tableNumberingService: TableNumberingService,
    private el: ElementRef
  ) {}

  ngOnInit() {
    this.calculateTableNumber();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.calculateTableNumber();
    }, 0);
  }

  private calculateTableNumber() {
    const allTables = Array.from(document.querySelectorAll('app-table-wrapper'));
    let localIndex = 0;
    
    for (let i = 0; i < allTables.length; i++) {
      if (allTables[i] === this.el.nativeElement) {
        break;
      }
      const tableElement = allTables[i];
      const tableSectionId = tableElement.getAttribute('data-section-id');
      if (tableSectionId === this.sectionId) {
        localIndex++;
      }
    }
    
    this.tableNumber = this.tableNumberingService.getGlobalTableNumber(this.sectionId, localIndex);
  }
}


