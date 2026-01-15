import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-paragraph-editor',
  templateUrl: './paragraph-editor.component.html',
  styleUrls: ['./paragraph-editor.component.css']
})
export class ParagraphEditorComponent {
  @Input() fieldId: string = '';
  @Input() label: string = '';
  @Input() hint: string = '';
  @Input() rows: number = 4;
  @Input() value: string = '';
  
  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.valueChange.emit(target.value);
  }
}
