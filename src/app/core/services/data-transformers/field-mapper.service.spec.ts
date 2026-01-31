import { TestBed } from '@angular/core/testing';
import { FieldMapper } from './field-mapper.service';

describe('FieldMapper', () => {
  let service: FieldMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FieldMapper);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should apply field aliases correctly', () => {
    const inputData = {
      textoPoblacionSexoAISD: 'Texto A',
      poblacionSexoAISD: [1, 2, 3],
      existingField: 'existing value'
    };

    const result = service.applyFieldAliases(inputData);

    // The method should add new properties based on aliases
    // textoPoblacionSexoAISD -> textoPoblacionSexo
    // poblacionSexoAISD -> poblacionSexoTabla
    expect(result.textoPoblacionSexo).toBeDefined();
    expect(result.poblacionSexoTabla).toBeDefined();
    expect(result.textoPoblacionSexo).toBe('Texto A');
    expect(result.poblacionSexoTabla).toEqual([1, 2, 3]);

    // Original properties should still exist
    expect(result.textoPoblacionSexoAISD).toBe('Texto A');
    expect(result.poblacionSexoAISD).toEqual([1, 2, 3]);
    expect(result.existingField).toBe('existing value');
  });

  it('should not override existing destination fields', () => {
    const inputData = {
      textoPoblacionSexoAISD: 'New Text',
      textoPoblacionSexo: 'Existing Text'
    };

    const result = service.applyFieldAliases(inputData);

    expect(result.textoPoblacionSexo).toBe('Existing Text');
  });

  it('should apply text mappings', () => {
    const inputData = {
      textoNatalidadMortalidad: 'Texto de natalidad',
      textoMorbilidad: 'Texto de morbilidad',
      textoViviendas: 'Texto de viviendas',
      textoEstructura: 'Texto de estructura',
      distritoSeleccionado: 'Test District'
    };

    const result = service.applyFieldAliases(inputData);

    expect(result.parrafoSeccion13_natalidad_mortalidad_completo).toBe('Texto de natalidad');
    expect(result.parrafoSeccion13_morbilidad_completo).toBe('Texto de morbilidad');
    expect(result.textoViviendaAISI).toBe('Texto de viviendas');
    expect(result.textoEstructuraAISI).toBe('Texto de estructura');
    expect(result.centroPobladoAISI).toBe('Test District');
  });

  it('should handle empty data object', () => {
    const result = service.applyFieldAliases({});
    expect(result).toEqual({});
  });
});
