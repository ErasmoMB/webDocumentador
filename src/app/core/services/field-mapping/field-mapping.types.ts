export interface FieldMapping {
  fieldName: string;
  endpoint?: string;
  endpointParams?: (seccionId: string, datos: any) => any;
  transform?: (data: any) => any;
  dataSource: 'manual' | 'section' | 'backend';
}
