import { Directive, ElementRef, Input, OnInit, OnChanges, SimpleChanges, Renderer2, Injector, AfterViewInit, DoCheck } from '@angular/core';
import { FieldMappingFacade } from 'src/app/core/services/field-mapping/field-mapping.facade';
import { ConfigService } from 'src/app/core/services/utilities/config.service';

export type DataSourceType = 'manual' | 'section' | 'backend' | 'calculated';

@Directive({
  selector: '[appDataSource]',
  standalone: true
})
export class DataSourceDirective implements OnInit, OnChanges, AfterViewInit, DoCheck {
  @Input() appDataSource: DataSourceType | string = 'manual';
  @Input() fieldName?: string;

  private fieldMappingFacade: FieldMappingFacade | null = null;
  private configService: ConfigService | null = null;
  private lastTextContent: string | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private injector: Injector
  ) {}

  ngOnInit() {
    if (!this.fieldMappingFacade) {
      this.fieldMappingFacade = this.injector.get(FieldMappingFacade);
    }
    if (!this.configService) {
      this.configService = this.injector.get(ConfigService);
    }
    this.applyStyle();
  }

  ngAfterViewInit() {
    // Verificar después de que Angular haya renderizado el contenido
    setTimeout(() => this.updateHasDataClass(), 0);
  }

  ngDoCheck() {
    // Verificar si el contenido ha cambiado
    const currentContent = this.el.nativeElement.textContent;
    if (currentContent !== this.lastTextContent) {
      this.lastTextContent = currentContent;
      this.updateHasDataClass();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appDataSource'] || changes['fieldName']) {
      this.applyStyle();
    }
  }

  private updateHasDataClass() {
    const nativeElement = this.el.nativeElement;
    const textContent = nativeElement.textContent?.trim() || '';
    
    // Verificar si tiene datos reales (no vacío y no es placeholder "____")
    const hasRealData = textContent.length > 0 && 
                        textContent !== '____' && 
                        !textContent.match(/^_+$/);
    
    if (hasRealData) {
      this.renderer.addClass(nativeElement, 'has-data');
    } else {
      this.renderer.removeClass(nativeElement, 'has-data');
    }
  }

  private applyStyle() {
    const nativeElement = this.el.nativeElement;
    
    this.renderer.removeClass(nativeElement, 'data-manual');
    this.renderer.removeClass(nativeElement, 'data-section');
    this.renderer.removeClass(nativeElement, 'data-backend');
    this.renderer.removeClass(nativeElement, 'data-calculated');
    
    let resolvedType: DataSourceType | undefined;

    if (this.fieldName && this.fieldMappingFacade?.isTestDataField(this.fieldName)) {
      resolvedType = 'manual';
    } else if (typeof this.appDataSource === 'string') {
      resolvedType = this.appDataSource as DataSourceType;
    } else if (this.fieldName) {
      resolvedType = this.fieldMappingFacade?.getDataSourceType(this.fieldName);
    }

    if (this.fieldName === 'projectName') {
      resolvedType = 'manual';
    }

    if (resolvedType === 'manual') {
      this.renderer.addClass(nativeElement, 'data-manual');
    } else if (resolvedType === 'section') {
      this.renderer.addClass(nativeElement, 'data-section');
    } else if (resolvedType === 'backend') {
      this.renderer.addClass(nativeElement, 'data-backend');
    } else if (resolvedType === 'calculated') {
      this.renderer.addClass(nativeElement, 'data-calculated');
    }

    // Actualizar clase has-data después de aplicar estilo
    this.updateHasDataClass();
  }
}


