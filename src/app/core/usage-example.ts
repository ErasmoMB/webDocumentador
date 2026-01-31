// Ejemplo de uso de la nueva arquitectura Clean Architecture

import { Component, OnInit } from '@angular/core';
import { LoadSectionUseCase, UpdateSectionDataUseCase, SectionViewModel } from '../core';
import { SectionData } from '../core/domain/entities';

@Component({
  selector: 'app-example-usage',
  template: `
    <div *ngIf="viewModel">
      <h3>Datos calculados automáticamente</h3>
      <p>Total PET: {{ viewModel.calculatedData.totalPET }}</p>
      <p>Total PEA: {{ viewModel.calculatedData.totalPEA }}</p>

      <button (click)="updateData()">Actualizar Datos</button>
    </div>
  `
})
export class ExampleUsageComponent implements OnInit {
  viewModel: SectionViewModel | null = null;

  constructor(
    private loadSectionUseCase: LoadSectionUseCase,
    private updateSectionUseCase: UpdateSectionDataUseCase
  ) {}

  ngOnInit() {
    // Cargar datos usando caso de uso
    this.loadSectionUseCase.execute('seccion7').subscribe(viewModel => {
      this.viewModel = viewModel;
    });
  }

  updateData() {
    if (!this.viewModel) return;

    // Actualizar datos usando caso de uso
    const updates: Partial<SectionData> = {
      petTabla: [
        { categoria: '15-29 años', casos: 150 },
        { categoria: '30-44 años', casos: 200 }
      ]
    };

    this.updateSectionUseCase.execute('seccion7', updates).subscribe(calculatedData => {
      if (this.viewModel) {
        this.viewModel.calculatedData = calculatedData;
      }
    });
  }
}

// Beneficios demostrados:
// 1. SRP: Componente solo maneja UI
// 2. DIP: Depende de abstracciones (casos de uso)
// 3. ISP: Interfaces específicas por funcionalidad
// 4. OCP: Fácil agregar nuevos casos de uso
// 5. LSP: Implementaciones intercambiables
