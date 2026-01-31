import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { TextGeneratorService } from './text-generator.service';
import { TextGeneratorStrategy, TextGenerationContext } from './text-generator-strategy.interface';
import { Seccion2TextGeneratorStrategy } from './seccion2-text-generator.strategy';
import { Seccion3TextGeneratorStrategy } from './seccion3-text-generator.strategy';

describe('TextGeneratorService', () => {
  let service: TextGeneratorService;
  let injector: Injector;
  let mockStrategy1: jasmine.SpyObj<TextGeneratorStrategy>;
  let mockStrategy2: jasmine.SpyObj<TextGeneratorStrategy>;

  beforeEach(() => {
    mockStrategy1 = jasmine.createSpyObj<TextGeneratorStrategy>('Seccion2TextGeneratorStrategy', [
      'puedeGenerar',
      'generarTexto'
    ], {
      sectionId: 'seccion2'
    });

    mockStrategy2 = jasmine.createSpyObj<TextGeneratorStrategy>('Seccion3TextGeneratorStrategy', [
      'puedeGenerar',
      'generarTexto'
    ], {
      sectionId: 'seccion3'
    });

    TestBed.configureTestingModule({
      providers: [
        TextGeneratorService,
        { provide: Seccion2TextGeneratorStrategy, useValue: mockStrategy1 },
        { provide: Seccion3TextGeneratorStrategy, useValue: mockStrategy2 }
      ]
    });

    injector = TestBed.inject(Injector);
    service = TestBed.inject(TextGeneratorService);
  });

  describe('registrarEstrategia', () => {
    it('debe registrar una nueva estrategia', () => {
      const nuevaEstrategia = jasmine.createSpyObj<TextGeneratorStrategy>('NuevaStrategy', [
        'puedeGenerar',
        'generarTexto'
      ], {
        sectionId: 'seccion99'
      });

      service.registrarEstrategia(nuevaEstrategia);

      const contexto: TextGenerationContext = {
        sectionId: '3.1.99',
        textType: 'test',
        params: {}
      };
      nuevaEstrategia.puedeGenerar.and.returnValue(true);
      nuevaEstrategia.generarTexto.and.returnValue('texto generado');

      const resultado = service.generarTexto({}, contexto);
      expect(resultado).toBe('texto generado');
    });
  });

  describe('generarTexto', () => {
    const mockDatos = { campo1: 'valor1' };
    const contexto: TextGenerationContext = {
      sectionId: '3.1.2',
      textType: 'aisd_completo',
      params: { comunidades: [] }
    };

    it('debe encontrar y usar la estrategia correcta', () => {
      mockStrategy1.puedeGenerar.and.returnValue(true);
      mockStrategy1.generarTexto.and.returnValue('Texto AISD generado');

      const resultado = service.generarTexto(mockDatos, contexto);

      expect(mockStrategy1.puedeGenerar).toHaveBeenCalledWith(contexto);
      expect(mockStrategy1.generarTexto).toHaveBeenCalledWith(mockDatos, contexto);
      expect(resultado).toBe('Texto AISD generado');
    });

    it('debe retornar string vacío cuando no encuentra estrategia', () => {
      mockStrategy1.puedeGenerar.and.returnValue(false);
      mockStrategy2.puedeGenerar.and.returnValue(false);

      const resultado = service.generarTexto(mockDatos, contexto);

      expect(resultado).toBe('');
    });

    it('debe usar la primera estrategia que puede generar', () => {
      mockStrategy1.puedeGenerar.and.returnValue(false);
      mockStrategy2.puedeGenerar.and.returnValue(true);
      mockStrategy2.generarTexto.and.returnValue('Texto Sección 3');

      const contextoSeccion3: TextGenerationContext = {
        sectionId: '3.1.3',
        textType: 'metodologia',
        params: {}
      };

      const resultado = service.generarTexto(mockDatos, contextoSeccion3);

      expect(mockStrategy2.generarTexto).toHaveBeenCalledWith(mockDatos, contextoSeccion3);
      expect(resultado).toBe('Texto Sección 3');
    });
  });

  describe('obtenerEstrategia', () => {
    it('debe obtener estrategia por sectionId', () => {
      const estrategia = service.obtenerEstrategia('3.1.2');
      expect(estrategia).toBeDefined();
    });

    it('debe retornar null cuando no encuentra estrategia', () => {
      const estrategia = service.obtenerEstrategia('3.1.99');
      expect(estrategia).toBeNull();
    });
  });

  describe('tieneEstrategia', () => {
    it('debe retornar true cuando existe estrategia', () => {
      expect(service.tieneEstrategia('3.1.2')).toBe(true);
    });

    it('debe retornar false cuando no existe estrategia', () => {
      expect(service.tieneEstrategia('3.1.99')).toBe(false);
    });
  });
});
