import { Injectable } from '@angular/core';
import { ITableTransformer } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class TableTransformer implements ITableTransformer {

  transformTables(data: any): any {
    const transformed = { ...data };

    // Transformaciones específicas de tablas
    this.transformMorbilidadTable(transformed);
    this.transformNatalidadMortalidadTable(transformed);
    this.transformAfiliacionSaludTable(transformed);
    this.transformViviendaTables(transformed);

    return transformed;
  }

  private transformMorbilidadTable(data: any): void {
    const fuenteMorbilidad = data.morbilidadCpTabla || data.morbiliadTabla || data.morbilidadTabla;

    if (Array.isArray(fuenteMorbilidad) && fuenteMorbilidad.length > 0) {
      const tablaTransformada = fuenteMorbilidad.map((item: any) => ({
        grupo: item.grupo || '____',
        rango0_11: this.parseNumber(item.rango0_11 ?? item.edad0_11 ?? '0'),
        rango12_17: this.parseNumber(item.rango12_17 ?? item.edad12_17 ?? '0'),
        rango18_29: this.parseNumber(item.rango18_29 ?? item.edad18_29 ?? '0'),
        rango30_59: this.parseNumber(item.rango30_59 ?? item.edad30_59 ?? '0'),
        rango60: this.parseNumber(item.rango60 ?? item.edad60_mas ?? '0'),
        casos: this.parseNumber(item.casos ?? '0')
      }));

      data.morbilidadTabla = tablaTransformada;
      data.morbiliadTabla = tablaTransformada;
    }
  }

  private transformNatalidadMortalidadTable(data: any): void {
    if (Array.isArray(data.natalidadMortalidadTabla) && data.natalidadMortalidadTabla.length > 0) {
      data.natalidadMortalidadTabla = data.natalidadMortalidadTabla.map((item: any) => ({
        anio: item.anio || '____',
        natalidad: this.parseNumber(item.natalidad ?? '0'),
        mortalidad: this.parseNumber(item.mortalidad ?? '0')
      }));
    }
  }

  private transformAfiliacionSaludTable(data: any): void {
    if (Array.isArray(data.afiliacionSaludTabla) && data.afiliacionSaludTabla.length > 0) {
      // ✅ FASE 1: NO agregar porcentaje por defecto - se calculará dinámicamente
      data.afiliacionSaludTabla = data.afiliacionSaludTabla.map((item: any) => ({
        categoria: item.categoria || '____',
        casos: this.parseNumber(item.casos ?? '0')
        // porcentaje: item.porcentaje || '0%' // ❌ ELIMINADO - se calculará dinámicamente
      }));

      // Extraer porcentajes específicos (solo si existen en los datos originales)
      this.extractHealthInsurancePercentages(data);
    }
  }

  private extractHealthInsurancePercentages(data: any): void {
    // ✅ FASE 1: Solo extraer porcentajes si existen en los datos originales (no crear por defecto)
    data.afiliacionSaludTabla.forEach((item: any) => {
      const categoria = String(item.categoria || '');
      const porcentajeStr = String(item.porcentaje || '');

      // Solo extraer si el porcentaje existe en los datos originales
      if (porcentajeStr && porcentajeStr !== '0%' && porcentajeStr !== '0,00 %') {
        if (categoria.includes('SIS') && !categoria.includes('ESSALUD')) {
          data.porcentajeSIS = porcentajeStr.replace(/[^0-9,]/g, '');
        } else if (categoria.includes('ESSALUD')) {
          data.porcentajeESSALUD = porcentajeStr.replace(/[^0-9,]/g, '');
        } else if (categoria.includes('sin seguro') || categoria.includes('Ningún')) {
          data.porcentajeSinSeguro = porcentajeStr.replace(/[^0-9,]/g, '');
        }
      }
    });
  }

  private transformViviendaTables(data: any): void {
    this.transformTiposViviendaTable(data);
    this.transformCondicionOcupacionTable(data);
    this.transformTiposMaterialesTable(data);
  }

  private transformTiposViviendaTable(data: any): void {
    if (Array.isArray(data.tiposViviendaCpTabla) && data.tiposViviendaCpTabla.length > 0) {
      const tablaTransformada = this.normalizeHousingTable(data.tiposViviendaCpTabla);
      data.tiposViviendaCpTabla = tablaTransformada;
      data.tiposViviendaAISI = tablaTransformada;
    }
  }

  private transformCondicionOcupacionTable(data: any): void {
    if (Array.isArray(data.condicionOcupacionTabla) && data.condicionOcupacionTabla.length > 0) {
      const tablaTransformada = this.normalizeHousingTable(data.condicionOcupacionTabla);
      data.condicionOcupacionTabla = tablaTransformada;
      data.condicionOcupacionAISI = tablaTransformada;
    }
  }

  private transformTiposMaterialesTable(data: any): void {
    if (Array.isArray(data.tiposMaterialesTabla) && data.tiposMaterialesTabla.length > 0) {
      // ✅ FASE 1: NO agregar porcentaje por defecto - se calculará dinámicamente
      const materialesTransformada = data.tiposMaterialesTabla.map((item: any) => ({
        categoria: item.categoria || '____',
        tipoMaterial: item.tipoMaterial || '____',
        casos: this.parseNumber(item.casos ?? '0')
        // porcentaje: item.porcentaje || '0%' // ❌ ELIMINADO - se calculará dinámicamente
      }));

      data.tiposMaterialesTabla = materialesTransformada;
      data.materialesViviendaAISI = materialesTransformada;
    }
  }

  private normalizeHousingTable(table: any[]): any[] {
    // ✅ FASE 1: NO agregar porcentaje por defecto - se calculará dinámicamente
    return table.map((item: any) => ({
      categoria: item.categoria || '____',
      casos: this.parseNumber(item.casos ?? '0')
      // porcentaje: item.porcentaje || '0%' // ❌ ELIMINADO - se calculará dinámicamente
    }));
  }

  private parseNumber(value: any): number {
    return parseInt(String(value ?? '0').replace(/\s+/g, '')) || 0;
  }
}
