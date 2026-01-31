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
  private previousValue: string = '';

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.internalValue = this.value || '';
    this.previousValue = this.internalValue;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const newValue = changes['value'].currentValue || '';
      // Solo actualizar si realmente cambió (comparar string)
      if (newValue !== this.previousValue) {
        this.internalValue = newValue;
        this.previousValue = newValue;
        this.cdRef.markForCheck();
      }
    }
  }

  onModelChange(newValue: string): void {
    this.internalValue = newValue;
    this.previousValue = newValue;
    this.valueChange.emit(newValue);
  }
}
