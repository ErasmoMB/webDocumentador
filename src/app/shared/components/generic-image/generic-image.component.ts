import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ImageConfig {
  src: string;
  alt?: string;
  title?: string;
  caption?: string;
  width?: string;
  height?: string;
  maxWidth?: string;
  lazy?: boolean;
  responsive?: boolean;
  align?: 'left' | 'center' | 'right';
}

@Component({
    selector: 'app-generic-image',
    imports: [CommonModule],
    template: `
    <figure [class.image-wrapper]="true" 
            [class]="'align-' + (config.align || 'center')"
            [style.text-align]="config.align || 'center'">
      <img 
        [src]="config.src"
        [alt]="config.alt || 'Image'"
        [title]="config.title"
        [width]="config.width"
        [height]="config.height"
        [style.max-width]="config.maxWidth || '100%'"
        [style.height]="config.height ? 'auto' : 'auto'"
        [class.responsive]="config.responsive !== false"
        [loading]="config.lazy === true ? 'lazy' : 'eager'"
        class="image-content">
      <figcaption *ngIf="config.caption" class="image-caption">
        {{ config.caption }}
      </figcaption>
    </figure>
  `,
    styles: [`
    .image-wrapper {
      margin: 1.5rem 0;
      display: inline-block;
      width: 100%;
    }

    .image-wrapper.align-left {
      text-align: left;
    }

    .image-wrapper.align-center {
      text-align: center;
    }

    .image-wrapper.align-right {
      text-align: right;
    }

    .image-content {
      max-width: 100%;
      height: auto;
      display: block;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .image-content.responsive {
      width: 100%;
      max-width: 100%;
    }

    .image-caption {
      margin-top: 0.75rem;
      font-size: 0.9rem;
      color: #666;
      font-style: italic;
      text-align: center;
    }

    figure {
      margin: 1.5rem auto;
      padding: 0;
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericImageComponent implements OnInit {
  @Input() config: ImageConfig = {
    src: '',
    lazy: true,
    responsive: true,
    align: 'center'
  };

  ngOnInit() {
    if (!this.config.src) {
      console.warn('GenericImageComponent: src es requerido');
    }
  }
}
