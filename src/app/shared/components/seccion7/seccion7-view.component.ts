import { Component, Input, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Seccion7ViewInternalComponent } from './seccion7-view-internal.component';

/**
 * Componente Wrapper para la Vista de Sección 7
 * Simplifica el uso externo del componente de vista interna
 */
@Component({
    standalone: true,
    selector: 'app-seccion7-view',
    template: '<app-seccion7-view-internal [seccionId]="seccionId"></app-seccion7-view-internal>',
    imports: [Seccion7ViewInternalComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion7ViewComponent {
  @Input() seccionId: string = '';
  @ViewChild(Seccion7ViewInternalComponent) seccion7InternalComponent!: Seccion7ViewInternalComponent;
}
