import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { NumberingService } from 'src/app/core/services/numbering/numbering.service';

@Directive({
  selector: '[appTableNumber]',
  standalone: true
})
export class TableNumberDirective implements OnInit {
  @Input() appTableNumber?: string;
  @Input() sectionId?: string;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private numberingService: NumberingService
  ) {}

  ngOnInit() {
    const tableNumber = this.numberingService.getFormattedTableNumber(
      this.sectionId || 'default',
      this.getTableIndex()
    );
    
    const nativeElement = this.el.nativeElement;
    const currentText = nativeElement.textContent || '';
    
    if (currentText.includes('Cuadro') || currentText.includes('cuadro')) {
      this.renderer.setProperty(nativeElement, 'textContent', tableNumber);
    } else {
      this.renderer.setProperty(nativeElement, 'textContent', `${tableNumber}: ${currentText}`);
    }
  }

  private getTableIndex(): number {
    const tables = document.querySelectorAll('[appTableNumber]');
    let index = 0;
    for (let i = 0; i < tables.length; i++) {
      if (tables[i] === this.el.nativeElement) {
        index = i;
        break;
      }
    }
    return index;
  }
}


