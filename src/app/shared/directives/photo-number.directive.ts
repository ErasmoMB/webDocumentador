import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { NumberingService } from 'src/app/core/services/numbering.service';

@Directive({
  selector: '[appPhotoNumber]',
  standalone: true
})
export class PhotoNumberDirective implements OnInit {
  @Input() appPhotoNumber?: string;
  @Input() sectionId?: string;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private numberingService: NumberingService
  ) {}

  ngOnInit() {
    const photoNumber = this.numberingService.getFormattedPhotoNumber(
      this.sectionId || 'default',
      this.getPhotoIndex()
    );
    
    const nativeElement = this.el.nativeElement;
    const currentText = nativeElement.textContent || '';
    
    if (currentText.includes('Foto') || currentText.includes('foto')) {
      this.renderer.setProperty(nativeElement, 'textContent', photoNumber);
    } else {
      this.renderer.setProperty(nativeElement, 'textContent', `${photoNumber}: ${currentText}`);
    }
  }

  private getPhotoIndex(): number {
    const photos = document.querySelectorAll('[appPhotoNumber]');
    let index = 0;
    for (let i = 0; i < photos.length; i++) {
      if (photos[i] === this.el.nativeElement) {
        index = i;
        break;
      }
    }
    return index;
  }
}


