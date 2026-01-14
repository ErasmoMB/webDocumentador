import { Component, Input, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { NumberingService } from 'src/app/core/services/numbering.service';

@Component({
  selector: 'app-table-wrapper',
  template: `
    <p class="table-title" *ngIf="tableNumber">Cuadro N° {{ tableNumber }}</p>
    <p class="table-title-main" *ngIf="title">{{ title }}</p>
    <ng-content></ng-content>
  `,
  styles: []
})
export class TableWrapperComponent implements OnInit, AfterViewInit {
  @Input() title: string = '';
  @Input() sectionId: string = 'default';
  
  tableNumber: string = '';

  constructor(
    private numberingService: NumberingService,
    private el: ElementRef
  ) {}

  ngOnInit() {
    this.calculateTableNumber();
  }

  ngAfterViewInit() {
    this.calculateTableNumber();
  }

  private calculateTableNumber() {
    const allTables = Array.from(document.querySelectorAll('app-table-wrapper'));
    const localIndex = allTables.indexOf(this.el.nativeElement);
    const globalIndex = this.numberingService.getGlobalTableIndex(this.sectionId, localIndex, this.el.nativeElement);
    const formattedNumber = this.numberingService.getFormattedTableNumber(this.sectionId, globalIndex);
    this.tableNumber = formattedNumber;
  }
}


