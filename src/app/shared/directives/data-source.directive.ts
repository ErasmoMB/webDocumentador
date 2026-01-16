import { Directive, ElementRef, Input, OnInit, OnChanges, SimpleChanges, Renderer2, Injector } from '@angular/core';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { ConfigService } from 'src/app/core/services/config.service';

export type DataSourceType = 'manual' | 'section';

@Directive({
  selector: '[appDataSource]'
})
export class DataSourceDirective implements OnInit, OnChanges {
  @Input() appDataSource: DataSourceType | string = 'manual';
  @Input() fieldName?: string;

  private fieldMappingService: FieldMappingService | null = null;
  private configService: ConfigService | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private injector: Injector
  ) {}

  ngOnInit() {
    if (!this.fieldMappingService) {
      this.fieldMappingService = this.injector.get(FieldMappingService);
    }
    if (!this.configService) {
      this.configService = this.injector.get(ConfigService);
    }
    this.applyStyle();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appDataSource'] || changes['fieldName']) {
      this.applyStyle();
    }
  }

  private applyStyle() {
    const nativeElement = this.el.nativeElement;
    
    this.renderer.removeClass(nativeElement, 'data-manual');
    this.renderer.removeClass(nativeElement, 'data-section');
    
    let resolvedType: DataSourceType | undefined;

    if (this.fieldName && this.fieldMappingService?.isTestDataField(this.fieldName)) {
      resolvedType = 'manual';
    } else if (typeof this.appDataSource === 'string') {
      resolvedType = this.appDataSource as DataSourceType;
    } else if (this.fieldName) {
      resolvedType = this.fieldMappingService?.getDataSourceType(this.fieldName);
    }

    if (this.fieldName === 'projectName') {
      resolvedType = 'manual';
    }

    if (resolvedType === 'manual') {
      this.renderer.addClass(nativeElement, 'data-manual');
    } else if (resolvedType === 'section') {
      this.renderer.addClass(nativeElement, 'data-section');
    }
  }
}


