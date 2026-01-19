import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-paragraph-editor',
  templateUrl: './paragraph-editor.component.html',
  styleUrls: ['./paragraph-editor.component.css']
})
export class ParagraphEditorComponent implements OnChanges {
  @Input() fieldId: string = '';
  @Input() label: string = '';
  @Input() hint: string = '';
  @Input() rows: number = 4;
  @Input() value: string = '';
  
  @Output() valueChange = new EventEmitter<string>();

  internalValue: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && changes['value'].currentValue !== this.internalValue) {
      this.internalValue = changes['value'].currentValue || '';
    }
  }

  ngOnInit(): void {
    this.internalValue = this.value || '';
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.internalValue = target.value;
    this.valueChange.emit(target.value);
  }
}
