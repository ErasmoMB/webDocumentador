import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-paragraph-editor',
    imports: [CommonModule, FormsModule],
    templateUrl: './paragraph-editor.component.html',
    styleUrls: ['./paragraph-editor.component.css']
})
export class ParagraphEditorComponent implements OnInit, OnChanges {
  @Input() fieldId: string = '';
  @Input() label: string = '';
  @Input() hint: string = '';
  @Input() rows: number = 4;
  @Input() value: string = '';
  
  @Output() valueChange = new EventEmitter<string>();

  internalValue: string = '';

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.internalValue = this.value || '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const newValue = changes['value'].currentValue || '';
      // Siempre actualizar internalValue cuando cambia el valor externo
      // Esto asegura que el editor refleje los cambios guardados
      // Evitar emitir evento al aplicar valor externo: solo actualizar internalValue
      this.internalValue = newValue;
      this.cdRef.markForCheck();
    }
  }

  onModelChange(newValue: string): void {
    // Evitar eco: si el nuevo valor es igual al valor externo actual, no reemitir
    if (newValue === (this.value || '')) return;
    this.internalValue = newValue;
    this.valueChange.emit(newValue);
  }
}
