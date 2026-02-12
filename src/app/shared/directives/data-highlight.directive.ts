import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { DataHighlightService } from './data-highlight.service';

/**
 * Directiva para resaltar datos automáticamente según su tipo
 * 
 * @usage
 * <!-- Resaltar un solo valor -->
 * <td appDataHighlight="database">305</td>
 * 
 * <!-- Múltiples valores en una fila -->
 * <tr>
 *   <td appDataHighlight="inherited">Chancay</td>
 *   <td appDataHighlight="database">305</td>
 *   <td appDataHighlight="calculated">45.5%</td>
 * </tr>
 */
@Directive({
  selector: '[appDataHighlight]',
  standalone: true
})
export class DataHighlightDirective implements OnInit {
  @Input('appDataHighlight') dataType: 'calculated' | 'inherited' | 'database' | 'manual' = 'database';

  constructor(
    private el: ElementRef,
    private highlightService: DataHighlightService
  ) {}

  ngOnInit(): void {
    let cssClass = '';

    switch(this.dataType) {
      case 'calculated':
        cssClass = this.highlightService.getCalculatedClass();
        break;
      case 'inherited':
        cssClass = this.highlightService.getInheritedClass();
        break;
      case 'database':
        cssClass = this.highlightService.getDatabaseClass();
        break;
      case 'manual':
        cssClass = this.highlightService.getManualClass();
        break;
    }

    this.el.nativeElement.classList.add(cssClass);
  }
}
