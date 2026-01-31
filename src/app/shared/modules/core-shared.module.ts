import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ImageUploadComponent } from '../components/image-upload/image-upload.component';
import { DynamicTableComponent } from '../components/dynamic-table/dynamic-table.component';
import { TableWrapperComponent } from '../components/table-wrapper/table-wrapper.component';
import { GenericTableComponent } from '../components/generic-table/generic-table.component';
import { GenericImageComponent } from '../components/generic-image/generic-image.component';
import { ParagraphEditorComponent } from '../components/paragraph-editor/paragraph-editor.component';
import { DataSourceDirective } from '../directives/data-source.directive';
import { DataHighlightDirective } from '../directives/data-highlight.directive';
import { TableNumberDirective } from '../directives/table-number.directive';
import { PhotoNumberDirective } from '../directives/photo-number.directive';
import { DataSourcePipe } from '../pipes/data-source.pipe';
import { LoadingDirective } from '../../core/directives/loading.directive';

const CORE_DECLARED = [
  DataSourcePipe,
  LoadingDirective,
];

const CORE_STANDALONE = [
  ImageUploadComponent,
  DynamicTableComponent,
  GenericTableComponent,
  GenericImageComponent,
  ParagraphEditorComponent,
  TableWrapperComponent,
  DataSourceDirective,
  DataHighlightDirective,
  TableNumberDirective,
  PhotoNumberDirective,
];

@NgModule({
  declarations: [...CORE_DECLARED],
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    // Importar componentes y directivas standalone
    ...CORE_STANDALONE,
  ],
  exports: [
    ...CORE_DECLARED,
    CommonModule,
    FormsModule,
    // Re-exportar standalone
    ...CORE_STANDALONE,
  ]
})
export class CoreSharedModule { }
