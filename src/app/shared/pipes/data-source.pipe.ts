import { Pipe, PipeTransform, Injector } from '@angular/core';
import { FieldMappingFacade } from 'src/app/core/services/field-mapping/field-mapping.facade';

@Pipe({
    name: 'dataSource',
    pure: false,
    standalone: false
})
export class DataSourcePipe implements PipeTransform {
  private fieldMappingFacade: FieldMappingFacade | null = null;

  constructor(private injector: Injector) {}

  transform(fieldName: string): 'manual' | 'section' | 'backend' {
    if (!this.fieldMappingFacade) {
      this.fieldMappingFacade = this.injector.get(FieldMappingFacade);
    }
    
    if (this.fieldMappingFacade) {
      return this.fieldMappingFacade.getDataSourceType(fieldName);
    }
    
    return 'manual';
  }
}


