import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CoreSharedModule } from './modules/core-shared.module';

const SHARED_DECLARATIONS = [
  SidebarComponent,
];

@NgModule({
  declarations: [
    ...SHARED_DECLARATIONS,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CoreSharedModule,
  ],
  exports: [
    ...SHARED_DECLARATIONS,
    CoreSharedModule,
    CommonModule,
    FormsModule,
  ]
})
export class SharedModule { }
