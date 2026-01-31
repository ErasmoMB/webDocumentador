import type { FieldMapping } from './field-mapping.types';

export function createDefaultFieldMappings(): Map<string, FieldMapping> {
  const fieldMappings: Map<string, FieldMapping> = new Map();

  fieldMappings.set('projectName', { fieldName: 'projectName', dataSource: 'manual' });
  fieldMappings.set('distritoSeleccionado', { fieldName: 'distritoSeleccionado', dataSource: 'section' });
  fieldMappings.set('provinciaSeleccionada', { fieldName: 'provinciaSeleccionada', dataSource: 'section' });
  fieldMappings.set('departamentoSeleccionado', { fieldName: 'departamentoSeleccionado', dataSource: 'section' });
  fieldMappings.set('comunidadesCampesinas', { fieldName: 'comunidadesCampesinas', dataSource: 'section' });
  fieldMappings.set('grupoAISD', { fieldName: 'grupoAISD', dataSource: 'manual' });
  fieldMappings.set('grupoAISI', { fieldName: 'grupoAISI', dataSource: 'section' });
  fieldMappings.set('centroPobladoAISI', { fieldName: 'centroPobladoAISI', dataSource: 'manual' });
  fieldMappings.set('cantidadEntrevistas', { fieldName: 'cantidadEntrevistas', dataSource: 'manual' });
  fieldMappings.set('fechaTrabajoCampo', { fieldName: 'fechaTrabajoCampo', dataSource: 'manual' });
  fieldMappings.set('consultora', { fieldName: 'consultora', dataSource: 'manual' });
  fieldMappings.set('entrevistados', { fieldName: 'entrevistados', dataSource: 'manual' });
  fieldMappings.set('parrafoSeccion1_principal', { fieldName: 'parrafoSeccion1_principal', dataSource: 'manual' });
  fieldMappings.set('parrafoSeccion1_4', { fieldName: 'parrafoSeccion1_4', dataSource: 'manual' });
  fieldMappings.set('objetivoSeccion1_1', { fieldName: 'objetivoSeccion1_1', dataSource: 'manual' });
  fieldMappings.set('objetivoSeccion1_2', { fieldName: 'objetivoSeccion1_2', dataSource: 'manual' });
  fieldMappings.set('parrafoSeccion2_introduccion', { fieldName: 'parrafoSeccion2_introduccion', dataSource: 'manual' });
  fieldMappings.set('parrafoSeccion2_aisd_completo', { fieldName: 'parrafoSeccion2_aisd_completo', dataSource: 'manual' });
  fieldMappings.set('parrafoSeccion2_aisi_completo', { fieldName: 'parrafoSeccion2_aisi_completo', dataSource: 'manual' });
  fieldMappings.set('aisdComponente1', { fieldName: 'aisdComponente1', dataSource: 'manual' });
  fieldMappings.set('aisdComponente2', { fieldName: 'aisdComponente2', dataSource: 'manual' });
  fieldMappings.set('parrafoSeccion3_metodologia', { fieldName: 'parrafoSeccion3_metodologia', dataSource: 'manual' });
  fieldMappings.set('parrafoSeccion3_fuentes_primarias', { fieldName: 'parrafoSeccion3_fuentes_primarias', dataSource: 'manual' });
  fieldMappings.set(
    'parrafoSeccion3_fuentes_primarias_cuadro',
    { fieldName: 'parrafoSeccion3_fuentes_primarias_cuadro', dataSource: 'manual' }
  );
  fieldMappings.set('parrafoSeccion3_fuentes_secundarias', { fieldName: 'parrafoSeccion3_fuentes_secundarias', dataSource: 'manual' });
  fieldMappings.set('fuentesSecundariasLista', { fieldName: 'fuentesSecundariasLista', dataSource: 'manual' });
  fieldMappings.set('parrafoSeccion4_introduccion_aisd', { fieldName: 'parrafoSeccion4_introduccion_aisd', dataSource: 'manual' });
  fieldMappings.set('parrafoSeccion4_comunidad_completo', { fieldName: 'parrafoSeccion4_comunidad_completo', dataSource: 'manual' });
  fieldMappings.set(
    'parrafoSeccion4_caracterizacion_indicadores',
    { fieldName: 'parrafoSeccion4_caracterizacion_indicadores', dataSource: 'manual' }
  );
  fieldMappings.set('coordenadasAISD', { fieldName: 'coordenadasAISD', dataSource: 'section' });
  fieldMappings.set('altitudAISD', { fieldName: 'altitudAISD', dataSource: 'section' });
  fieldMappings.set('tablaAISD1Localidad', { fieldName: 'tablaAISD1Localidad', dataSource: 'section' });
  fieldMappings.set('tablaAISD1Coordenadas', { fieldName: 'tablaAISD1Coordenadas', dataSource: 'section' });
  fieldMappings.set('tablaAISD1Altitud', { fieldName: 'tablaAISD1Altitud', dataSource: 'section' });
  fieldMappings.set('tablaAISD1Distrito', { fieldName: 'tablaAISD1Distrito', dataSource: 'section' });
  fieldMappings.set('tablaAISD1Provincia', { fieldName: 'tablaAISD1Provincia', dataSource: 'section' });
  fieldMappings.set('tablaAISD1Departamento', { fieldName: 'tablaAISD1Departamento', dataSource: 'section' });
  fieldMappings.set('cuadroTituloAISD1', { fieldName: 'cuadroTituloAISD1', dataSource: 'manual' });
  fieldMappings.set('cuadroFuenteAISD1', { fieldName: 'cuadroFuenteAISD1', dataSource: 'manual' });
  fieldMappings.set('cuadroTituloAISD2', { fieldName: 'cuadroTituloAISD2', dataSource: 'manual' });
  fieldMappings.set('cuadroFuenteAISD2', { fieldName: 'cuadroFuenteAISD2', dataSource: 'manual' });
  fieldMappings.set('parrafoSeccion5_institucionalidad', { fieldName: 'parrafoSeccion5_institucionalidad', dataSource: 'manual' });
  fieldMappings.set('tituloInstituciones', { fieldName: 'tituloInstituciones', dataSource: 'manual' });
  fieldMappings.set('fuenteInstituciones', { fieldName: 'fuenteInstituciones', dataSource: 'manual' });
  fieldMappings.set('tablepagina6', { fieldName: 'tablepagina6', dataSource: 'manual' });

  fieldMappings.set('ubigeoAISD', { fieldName: 'ubigeoAISD', dataSource: 'backend' });
  fieldMappings.set('distritoAISD', { fieldName: 'distritoAISD', dataSource: 'backend' });
  fieldMappings.set('provinciaAISD', { fieldName: 'provinciaAISD', dataSource: 'backend' });
  fieldMappings.set('departamentoAISD', { fieldName: 'departamentoAISD', dataSource: 'backend' });
  fieldMappings.set('componentesCC', { fieldName: 'componentesCC', dataSource: 'backend' });
  fieldMappings.set('poblacionSexoAISD', {
    fieldName: 'poblacionSexoAISD',
    dataSource: 'backend',
    endpoint: '/aisd/poblacion-sexo'
  });
  fieldMappings.set('poblacionEtarioAISD', {
    fieldName: 'poblacionEtarioAISD',
    dataSource: 'backend',
    endpoint: '/aisd/poblacion-etario'
  });
  fieldMappings.set('petAISD', { fieldName: 'petAISD', dataSource: 'backend' });
  fieldMappings.set('petTabla', {
    fieldName: 'petTabla',
    dataSource: 'backend',
    endpoint: '/aisd/poblacion-etario'
  });
  fieldMappings.set('peaOcupacionesTabla', {
    fieldName: 'peaOcupacionesTabla',
    dataSource: 'backend',
    endpoint: '/economicos/principales'
  });
  fieldMappings.set('lenguasMaternasTabla', {
    fieldName: 'lenguasMaternasTabla',
    dataSource: 'backend',
    endpoint: '/vistas/lenguas-ubicacion'
  });
  fieldMappings.set('religionesTabla', {
    fieldName: 'religionesTabla',
    dataSource: 'backend',
    endpoint: '/vistas/religiones-ubicacion'
  });
  fieldMappings.set('tablaAISD2Punto', { fieldName: 'tablaAISD2Punto', dataSource: 'backend' });
  fieldMappings.set('tablaAISD2Codigo', { fieldName: 'tablaAISD2Codigo', dataSource: 'backend' });
  fieldMappings.set('tablaAISD2Poblacion', { fieldName: 'tablaAISD2Poblacion', dataSource: 'backend' });
  fieldMappings.set('materialesConstruccionAISD', { fieldName: 'materialesConstruccionAISD', dataSource: 'backend' });
  fieldMappings.set('serviciosBasicosAISD', { fieldName: 'serviciosBasicosAISD', dataSource: 'backend' });

  fieldMappings.set('ubigeoAISI', { fieldName: 'ubigeoAISI', dataSource: 'backend' });
  fieldMappings.set('distritoAISI', { fieldName: 'distritoAISI', dataSource: 'backend' });
  fieldMappings.set('provinciaAISI', { fieldName: 'provinciaAISI', dataSource: 'backend' });
  fieldMappings.set('departamentoAISI', { fieldName: 'departamentoAISI', dataSource: 'backend' });
  fieldMappings.set('centroPobladoCapitalAISI', { fieldName: 'centroPobladoCapitalAISI', dataSource: 'backend' });
  fieldMappings.set('poblacionSexoAISI', { fieldName: 'poblacionSexoAISI', dataSource: 'backend' });
  fieldMappings.set('poblacionEtarioAISI', { fieldName: 'poblacionEtarioAISI', dataSource: 'backend' });
  fieldMappings.set('petAISI', { fieldName: 'petAISI', dataSource: 'backend' });
  fieldMappings.set('peaDistritalAISI', { fieldName: 'peaDistritalAISI', dataSource: 'backend' });
  fieldMappings.set('actividadesEconomicasAISI', { fieldName: 'actividadesEconomicasAISI', dataSource: 'backend' });
  fieldMappings.set('materialesConstruccionAISI', { fieldName: 'materialesConstruccionAISI', dataSource: 'backend' });
  fieldMappings.set('serviciosBasicosAISI', { fieldName: 'serviciosBasicosAISI', dataSource: 'backend' });

  return fieldMappings;
}
