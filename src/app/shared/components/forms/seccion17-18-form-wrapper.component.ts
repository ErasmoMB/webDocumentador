import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
    imports: [CommonModule, FormsModule, CoreSharedModule],
    selector: 'app-seccion17-18-form-wrapper',
    templateUrl: './seccion17-18-form-wrapper.component.html',
    styleUrls: ['./seccion17-18-form-wrapper.component.css']
})
export class Seccion17FormWrapperComponent {
  @Input() seccionId: string = '';
}
