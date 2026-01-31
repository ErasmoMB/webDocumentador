import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Seccion3Component } from './seccion3.component';
import { CoreSharedModule } from '../../modules/core-shared.module';

@Component({
    imports: [
        CommonModule,
        CoreSharedModule,
        Seccion3Component
    ],
    selector: 'app-seccion3-view',
    templateUrl: './seccion3-view.component.html'
})
export class Seccion3ViewComponent implements OnInit {
  @Input() seccionId: string = '3.1.3';
  @ViewChild(Seccion3Component) seccion3Component!: Seccion3Component;

  constructor() {}

  ngOnInit() {
  }
}
