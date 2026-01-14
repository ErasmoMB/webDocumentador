import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

export type DataSourceType = 'manual' | 'automatic' | 'section';

@Directive({
  selector: '[appDataSource]'
})
export class DataSourceDirective implements OnInit {
  @Input() appDataSource: DataSourceType = 'manual';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.applyStyle();
  }

  private applyStyle() {
    const nativeElement = this.el.nativeElement;
    
    if (this.appDataSource === 'automatic') {
      this.renderer.addClass(nativeElement, 'data-automatic');
    } else if (this.appDataSource === 'section') {
      this.renderer.addClass(nativeElement, 'data-section');
    } else {
      this.renderer.addClass(nativeElement, 'data-manual');
    }
  }
}


