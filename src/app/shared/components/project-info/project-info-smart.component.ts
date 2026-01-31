/**
 * PROJECT INFO SMART COMPONENT
 * 
 * Ejemplo de componente Smart que usa los adaptadores UI.
 * Maneja la información del proyecto (nombre, consultora, etc.)
 */

import { Component, ChangeDetectionStrategy, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UIReadAdapter, UIWriteAdapter } from '../../../core/adapters';

@Component({
  selector: 'app-project-info-smart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="project-info-container">
      <h3>Información del Proyecto</h3>
      
      <!-- Nombre del Proyecto -->
      <div class="form-group">
        <label>Nombre del Proyecto</label>
        <input 
          type="text"
          [value]="projectName()"
          (input)="onProjectNameChange($event)"
          placeholder="Ingrese nombre del proyecto"
        />
      </div>
      
      <!-- Consultora -->
      <div class="form-group">
        <label>Consultora</label>
        <input 
          type="text"
          [value]="consultora()"
          (input)="onConsultoraChange($event)"
          placeholder="Ingrese consultora"
        />
      </div>
      
      <!-- Ubicación -->
      <div class="form-group">
        <label>Ubicación</label>
        <div class="ubicacion-grid">
          <input 
            type="text"
            [value]="ubicacion().departamento"
            (input)="onDepartamentoChange($event)"
            placeholder="Departamento"
          />
          <input 
            type="text"
            [value]="ubicacion().provincia"
            (input)="onProvinciaChange($event)"
            placeholder="Provincia"
          />
          <input 
            type="text"
            [value]="ubicacion().distrito"
            (input)="onDistritoChange($event)"
            placeholder="Distrito"
          />
        </div>
      </div>
      
      <!-- Estado del proyecto -->
      <div class="project-status">
        <span [class.dirty]="isDirty()">
          {{ isDirty() ? '⚠️ Sin guardar' : '✅ Guardado' }}
        </span>
      </div>
      
      <!-- Acciones -->
      <div class="actions">
        <button (click)="onGuardar()" [disabled]="!isDirty()">
          Guardar
        </button>
        <button (click)="onReset()">
          Limpiar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .project-info-container {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.25rem;
      font-weight: bold;
    }
    .form-group input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .ubicacion-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.5rem;
    }
    .project-status {
      margin: 1rem 0;
    }
    .dirty {
      color: orange;
    }
    .actions {
      display: flex;
      gap: 0.5rem;
    }
    .actions button {
      padding: 0.5rem 1rem;
      cursor: pointer;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectInfoSmartComponent {
  private readonly reader = inject(UIReadAdapter);
  private readonly writer = inject(UIWriteAdapter);
  
  // Signals de lectura
  readonly projectName = this.reader.projectName;
  readonly consultora = this.reader.consultora;
  readonly ubicacion = this.reader.ubicacion;
  readonly isDirty = this.reader.isDirty;
  
  // Estado local para ubicación (ya que se actualiza en batch)
  private pendingUbicacion = {
    departamento: '',
    provincia: '',
    distrito: ''
  };
  
  constructor() {
    // Sincronizar estado local con el store
    effect(() => {
      const ubic = this.ubicacion();
      this.pendingUbicacion = { ...ubic };
    });
  }
  
  onProjectNameChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.writer.setProjectName(value);
  }
  
  onConsultoraChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.writer.setConsultora(value);
  }
  
  onDepartamentoChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.pendingUbicacion.departamento = value;
    this.updateUbicacion();
  }
  
  onProvinciaChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.pendingUbicacion.provincia = value;
    this.updateUbicacion();
  }
  
  onDistritoChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.pendingUbicacion.distrito = value;
    this.updateUbicacion();
  }
  
  private updateUbicacion(): void {
    this.writer.setUbicacion(
      this.pendingUbicacion.departamento,
      this.pendingUbicacion.provincia,
      this.pendingUbicacion.distrito
    );
  }
  
  onGuardar(): void {
    this.writer.markProjectSaved();
  }
  
  onReset(): void {
    this.writer.resetState();
  }
}
