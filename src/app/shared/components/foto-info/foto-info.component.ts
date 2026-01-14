import { Component, Input, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { NumberingService } from 'src/app/core/services/numbering.service';

@Component({
  selector: 'app-foto-info',
  templateUrl: './foto-info.component.html',
  styleUrls: ['./foto-info.component.css']
})
export class FotoInfoComponent implements OnInit, AfterViewInit {
  @Input() numero: string = '';
  @Input() titulo: string = '';
  @Input() fuente: string = 'GEADES, 2024';
  @Input() ruta: string = '';
  @Input() fecha: string = '';
  @Input() coordenadas: string = '';
  @Input() direccion: string = '';
  @Input() ubicacion: string = '';
  @Input() altitud: string = '';
  @Input() velocidad: string = '0.0km/h';
  @Input() mostrarCompass: boolean = true;
  @Input() mostrarMetadata: boolean = true;
  @Input() autoNumber: boolean = false;
  @Input() sectionId: string = 'default';

  displayNumber: string = '';

  constructor(
    private numberingService: NumberingService,
    private el: ElementRef
  ) {}

  ngOnInit() {
    this.calculatePhotoNumber();
  }

  ngAfterViewInit() {
    if (this.autoNumber) {
      this.calculatePhotoNumber();
    }
  }

  private calculatePhotoNumber() {
    if (this.autoNumber) {
      const allPhotos = Array.from(document.querySelectorAll('app-foto-info[autoNumber="true"]'));
      const localIndex = allPhotos.indexOf(this.el.nativeElement);
      const globalIndex = this.numberingService.getGlobalPhotoIndex(this.sectionId, localIndex >= 0 ? localIndex : 0, this.el.nativeElement);
      this.displayNumber = this.numberingService.getFormattedPhotoNumber(this.sectionId, globalIndex);
    } else {
      this.displayNumber = this.numero;
    }
  }
}

