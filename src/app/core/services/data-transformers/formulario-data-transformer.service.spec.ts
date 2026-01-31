import { TestBed } from '@angular/core/testing';
import { FormularioDataTransformer } from './formulario-data-transformer.service';
import { PhotoTransformer } from './photo-transformer.service';
import { FieldMapper } from './field-mapper.service';
import { DataCalculator } from './data-calculator.service';
import { TableTransformer } from './table-transformer.service';
import { TextGenerator } from './text-generator.service';

describe('FormularioDataTransformer', () => {
  let service: FormularioDataTransformer;
  let photoTransformerSpy: jasmine.SpyObj<PhotoTransformer>;
  let fieldMapperSpy: jasmine.SpyObj<FieldMapper>;
  let dataCalculatorSpy: jasmine.SpyObj<DataCalculator>;
  let tableTransformerSpy: jasmine.SpyObj<TableTransformer>;
  let textGeneratorSpy: jasmine.SpyObj<TextGenerator>;

  beforeEach(() => {
    const photoSpy = jasmine.createSpyObj('PhotoTransformer', ['transformPhotos']);
    const fieldSpy = jasmine.createSpyObj('FieldMapper', ['applyFieldAliases']);
    const dataSpy = jasmine.createSpyObj('DataCalculator', ['calculateTotals']);
    const tableSpy = jasmine.createSpyObj('TableTransformer', ['transformTables']);
    const textSpy = jasmine.createSpyObj('TextGenerator', ['generateDescriptiveTexts']);

    TestBed.configureTestingModule({
      providers: [
        FormularioDataTransformer,
        { provide: PhotoTransformer, useValue: photoSpy },
        { provide: FieldMapper, useValue: fieldSpy },
        { provide: DataCalculator, useValue: dataSpy },
        { provide: TableTransformer, useValue: tableSpy },
        { provide: TextGenerator, useValue: textSpy }
      ]
    });

    service = TestBed.inject(FormularioDataTransformer);
    photoTransformerSpy = TestBed.inject(PhotoTransformer) as jasmine.SpyObj<PhotoTransformer>;
    fieldMapperSpy = TestBed.inject(FieldMapper) as jasmine.SpyObj<FieldMapper>;
    dataCalculatorSpy = TestBed.inject(DataCalculator) as jasmine.SpyObj<DataCalculator>;
    tableTransformerSpy = TestBed.inject(TableTransformer) as jasmine.SpyObj<TableTransformer>;
    textGeneratorSpy = TestBed.inject(TextGenerator) as jasmine.SpyObj<TextGenerator>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should apply all transformations in correct order', () => {
    const inputData = {
      fotografias: [{ numero: '1.1', titulo: 'Test' }],
      campo1: 'value1'
    };

    const transformedData1 = { campo1: 'value1', campo2: 'value2' };
    const transformedData2 = { ...transformedData1, campo3: 'value3' };
    const transformedData3 = { ...transformedData2, campo4: 'value4' };
    const transformedData4 = { ...transformedData3, campo5: 'value5' };

    photoTransformerSpy.transformPhotos.and.returnValue([]);
    fieldMapperSpy.applyFieldAliases.and.returnValue(transformedData1);
    dataCalculatorSpy.calculateTotals.and.returnValue(transformedData2);
    tableTransformerSpy.transformTables.and.returnValue(transformedData3);
    textGeneratorSpy.generateDescriptiveTexts.and.returnValue(transformedData4);

    const result = service.transform(inputData);

    expect(photoTransformerSpy.transformPhotos).toHaveBeenCalledWith([{ numero: '1.1', titulo: 'Test' }]);
    expect(fieldMapperSpy.applyFieldAliases).toHaveBeenCalled();
    expect(dataCalculatorSpy.calculateTotals).toHaveBeenCalled();
    expect(tableTransformerSpy.transformTables).toHaveBeenCalled();
    expect(textGeneratorSpy.generateDescriptiveTexts).toHaveBeenCalled();
    expect(result).toEqual(transformedData4);
  });

  it('should handle photo transformations correctly', () => {
    const inputData = {
      fotografias: [
        { numero: '1.1', titulo: 'Foto 1', fuente: 'Fuente 1', ruta: '/img1.jpg' }
      ]
    };

    const mockTransformedPhotos = [
      { numero: 1, titulo: 'Foto 1', fuente: 'Fuente 1', ruta: '/img1.jpg' }
    ];

    // Mock the chain of transformations
    const dataWithPhotos = {
      ...inputData,
      fotografiaAISD1Titulo: 'Foto 1',
      fotografiaAISD1Fuente: 'Fuente 1',
      fotografiaAISD1Imagen: '/img1.jpg'
    };

    photoTransformerSpy.transformPhotos.and.returnValue(mockTransformedPhotos);
    fieldMapperSpy.applyFieldAliases.and.returnValue(dataWithPhotos);
    dataCalculatorSpy.calculateTotals.and.returnValue(dataWithPhotos);
    tableTransformerSpy.transformTables.and.returnValue(dataWithPhotos);
    textGeneratorSpy.generateDescriptiveTexts.and.returnValue(dataWithPhotos);

    const result = service.transform(inputData);

    expect(result.fotografiaAISD1Titulo).toBe('Foto 1');
    expect(result.fotografiaAISD1Fuente).toBe('Fuente 1');
    expect(result.fotografiaAISD1Imagen).toBe('/img1.jpg');
  });

  it('should handle empty input data', () => {
    const inputData = {};

    photoTransformerSpy.transformPhotos.and.returnValue([]);
    fieldMapperSpy.applyFieldAliases.and.returnValue(inputData);
    dataCalculatorSpy.calculateTotals.and.returnValue(inputData);
    tableTransformerSpy.transformTables.and.returnValue(inputData);
    textGeneratorSpy.generateDescriptiveTexts.and.returnValue(inputData);

    const result = service.transform(inputData);

    expect(result).toEqual(inputData);
  });
});
