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

    // ✅ Transformar tablas AISD del mock agregando prefijos
    this.transformAISDTables(transformed);

    // ✅ Transformar tablas de población (poblacionSexoAISD y poblacionEtarioAISD)
    this.transformPoblacionTables(transformed);

    return transformed;
  }

  /** Transforma tablas AISD del mock agregando prefijos _A1 */
  private transformAISDTables(data: any): void {
    console.log('%c[TableTransformer] transformAISDTables START', 'color: #00aa00; font-weight: bold');
    console.log('[TableTransformer] data.tablaAISD1Datos:', data.tablaAISD1Datos);
    console.log('[TableTransformer] data.tablaAISD2Datos:', data.tablaAISD2Datos);
    
    // Tablas AISD que necesitan prefijo _A1
    const tablasConPrefijo: Record<string, string> = {
      'tablaAISD1Datos': 'tablaAISD1Datos_A1',
      'tablaAISD2Datos': 'tablaAISD2Datos_A1',
      'puntosPoblacion': 'puntosPoblacion_A1',
      'jsonCompleto': 'jsonCompleto_A1',
      'json': 'jsonCompleto',
      // ✅ Agregar más tablas del mock que necesitan prefijo
      'poblacionSexoTabla': 'poblacionSexoTabla_A1',
      'poblacionEtarioTabla': 'poblacionEtarioTabla_A1',
      'peaOcupacionesTabla': 'peaOcupacionesTabla_A1',
      'poblacionPecuariaTabla': 'poblacionPecuariaTabla_A1',
      'caracteristicasAgriculturaTabla': 'caracteristicasAgriculturaTabla_A1',
      'condicionOcupacionTabla': 'condicionOcupacionTabla_A1',
      'tiposMaterialesTabla': 'tiposMaterialesTabla_A1',
      'abastecimientoAguaTabla': 'abastecimientoAguaTabla_A1',
      'tiposSaneamientoTabla': 'tiposSaneamientoTabla_A1',
      'coberturaElectricaTabla': 'coberturaElectricaTabla_A1',
      'caracteristicasSaludTabla': 'caracteristicasSaludTabla_A1',
      'ieAyrocaTabla': 'ieAyrocaTabla_A1',
      'ie40270Tabla': 'ie40270Tabla_A1',
      'nivelEducativoTabla': 'nivelEducativoTabla_A1',
      'tasaAnalfabetismoTabla': 'tasaAnalfabetismoTabla_A1',
      'cantidadEstudiantesEducacionTabla': 'cantidadEstudiantesEducacionTabla_A1',
      'cantidadEstudiantesGeneroTabla': 'cantidadEstudiantesGeneroTabla_A1',
      'alumnosIEAyrocaTabla': 'alumnosIEAyrocaTabla_A1',
      'alumnosIE40270Tabla': 'alumnosIE40270Tabla_A1',
      'natalidadMortalidadTabla': 'natalidadMortalidadTabla_A1',
      'morbilidadCpTabla': 'morbilidadCpTabla_A1',
      'afiliacionSaludTabla': 'afiliacionSaludTabla_A1',
      'telecomunicacionesTabla': 'telecomunicacionesTabla_A1',
      // Tablas AISI (B1)
      'actividadesEconomicasAISI': 'actividadesEconomicasAISI_B1',
      'tiposViviendaCpTabla': 'tiposViviendaCpTabla_B1',
      'condicionOcupacionCpTabla': 'condicionOcupacionCpTabla_B1',
      'abastecimientoAguaCpTabla': 'abastecimientoAguaCpTabla_B1',
      'saneamientoCpTabla': 'saneamientoCpTabla_B1',
      'coberturaElectricaCpTabla': 'coberturaElectricaCpTabla_B1',
      'combustiblesCocinarCpTabla': 'combustiblesCocinarCpTabla_B1',
      'telecomunicacionesCpTabla': 'telecomunicacionesCpTabla_B1',
      'puestoSaludCpTabla': 'puestoSaludCpTabla_B1',
      'educacionCpTabla': 'educacionCpTabla_B1',
      'natalidadMortalidadCpTabla': 'natalidadMortalidadCpTabla_B1',
      'morbilidadCpTabla_B1': 'morbilidadCpTabla_B1',
      'afiliacionSaludTabla_B1': 'afiliacionSaludTabla_B1',
      'nivelEducativoTabla_B1': 'nivelEducativoTabla_B1',
      'tasaAnalfabetismoTabla_B1': 'tasaAnalfabetismoTabla_B1',
      'lenguasMaternasTabla': 'lenguasMaternasTabla_B1',
      'religionesTabla': 'religionesTabla_B1',
      'indiceDesarrolloHumanoTabla': 'indiceDesarrolloHumanoTabla_B1',
      'nbiDistritoCahuachoTabla': 'nbiDistritoCahuachoTabla_B1',
      'ubicacionCpTabla': 'ubicacionCpTabla_B1',
      'peaDistritoSexoTabla': 'peaDistritoSexoTabla_B1',
      'peaOcupadaDesocupadaTabla': 'peaOcupadaDesocupadaTabla_B1'
    };

    Object.entries(tablasConPrefijo).forEach(([origen, destino]) => {
      if (data[origen] !== undefined && data[destino] === undefined) {
        console.log(`[TableTransformer] Copiando ${origen} -> ${destino}`);
        data[destino] = data[origen];
      }
    });

    // Copiar campos individuales AISD al campo con prefijo
    this.copyAISDFieldsWithPrefix(data);
    
    console.log('%c[TableTransformer] transformAISDTables END', 'color: #00aa00; font-weight: bold');
  }

  /** Copia campos individuales AISD con prefijo _A1 */
  private copyAISDFieldsWithPrefix(data: any): void {
    const camposAISD = [
      'cuadroTituloAISD1',
      'cuadroFuenteAISD1',
      'cuadroTituloAISD2',
      'cuadroFuenteAISD2',
      'tablaAISD1Coordenadas',
      'tablaAISD1Altitud',
      'tablaAISD1Fila1Localidad',
      'tablaAISD1Fila1Coordenadas',
      'tablaAISD1Fila1Altitud',
      'tablaAISD1Fila1Distrito',
      'tablaAISD1Fila1Provincia',
      'tablaAISD1Fila1Departamento',
      'tablaAISD2TotalPoblacion',
      'tablaAISD2TotalViviendasEmpadronadas',
      'tablaAISD2TotalViviendasOcupadas'
    ];

    camposAISD.forEach(campo => {
      const campoConPrefijo = `${campo}_A1`;
      if (data[campo] !== undefined && data[campoConPrefijo] === undefined) {
        data[campoConPrefijo] = data[campo];
      }
    });
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

  /** Transforma tablas de población (poblacionSexoAISD y poblacionEtarioAISD) */
  private transformPoblacionTables(data: any): void {
    console.log('%c[TableTransformer] transformPoblacionTables START', 'color: #ff6600; font-weight: bold');
    
    // Transformar poblacionSexoTabla_A1 -> poblacionSexoAISD
    if (Array.isArray(data.poblacionSexoTabla_A1) && data.poblacionSexoTabla_A1.length > 0) {
      console.log('[TableTransformer] Transformando poblacionSexoTabla_A1 -> poblacionSexoAISD');
      
      // Calcular total
      const total = data.poblacionSexoTabla_A1.reduce((sum: number, item: any) => sum + this.parseNumber(item.casos), 0);
      
      // Transformar con porcentajes
      data.poblacionSexoAISD = data.poblacionSexoTabla_A1.map((item: any) => ({
        sexo: item.sexo === 'Hombre' ? 'Hombres' : (item.sexo === 'Mujer' ? 'Mujeres' : item.sexo),
        casos: this.parseNumber(item.casos),
        porcentaje: total > 0 ? ((this.parseNumber(item.casos) / total) * 100).toFixed(1).replace('.', ',') + '%' : '0,00%'
      }));
      
      console.log('[TableTransformer] poblacionSexoAISD:', data.poblacionSexoAISD);
    }
    
    // Transformar poblacionEtarioTabla_A1 -> poblacionEtarioAISD
    if (Array.isArray(data.poblacionEtarioTabla_A1) && data.poblacionEtarioTabla_A1.length > 0) {
      console.log('[TableTransformer] Transformando poblacionEtarioTabla_A1 -> poblacionEtarioAISD');
      
      // Calcular total
      const total = data.poblacionEtarioTabla_A1.reduce((sum: number, item: any) => sum + this.parseNumber(item.casos), 0);
      
      // Transformar con porcentajes
      data.poblacionEtarioAISD = data.poblacionEtarioTabla_A1.map((item: any) => ({
        categoria: item.categoria,
        casos: this.parseNumber(item.casos),
        porcentaje: total > 0 ? ((this.parseNumber(item.casos) / total) * 100).toFixed(1).replace('.', ',') + '%' : '0,00%'
      }));
      
      console.log('[TableTransformer] poblacionEtarioAISD:', data.poblacionEtarioAISD);
    }
    
    console.log('%c[TableTransformer] transformPoblacionTables END', 'color: #ff6600; font-weight: bold');
  }
}
