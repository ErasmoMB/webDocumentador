import { Pipe, PipeTransform, Injector } from '@angular/core';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';

@Pipe({
  name: 'dataSource',
  pure: false
})
export class DataSourcePipe implements PipeTransform {
  private fieldMappingService: FieldMappingService | null = null;

  constructor(private injector: Injector) {}

  transform(fieldName: string): 'manual' | 'section' {
    if (!this.fieldMappingService) {
      this.fieldMappingService = this.injector.get(FieldMappingService);
    }
    
    if (this.fieldMappingService) {
      return this.fieldMappingService.getDataSourceType(fieldName);
    }
    
    return 'manual';
  }
}


