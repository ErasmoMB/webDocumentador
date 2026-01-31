import { TestBed } from '@angular/core/testing';
import { Seccion2TextGeneratorStrategy } from './seccion2-text-generator.strategy';
import { Seccion2TextGeneratorService } from '../seccion2-text-generator.service';
import { TextGenerationContext } from './text-generator-strategy.interface';
import { ComunidadCampesina, Distrito } from 'src/app/core/models/formulario.model';

describe('Seccion2TextGeneratorStrategy', () => {
  let strategy: Seccion2TextGeneratorStrategy;
  let mockTextGenerator: jasmine.SpyObj<Seccion2TextGeneratorService>;

  beforeEach(() => {
    mockTextGenerator = jasmine.createSpyObj('Seccion2TextGeneratorService', [
      'generarTextoAISDCompleto',
      'generarTextoAISICompleto',
      'obtenerTextoComunidades',
      'obtenerTextoComunidadesPlural',
      'obtenerTextoAISI'
    ]);

    TestBed.configureTestingModule({
      providers: [
        Seccion2TextGeneratorStrategy,
        { provide: Seccion2TextGeneratorService, useValue: mockTextGenerator }
      ]
    });

    strategy = TestBed.inject(Seccion2TextGeneratorStrategy);
  });

  describe('puedeGenerar', () => {
    it('debe retornar true para sectionId 3.1.2', () => {
      const contexto: TextGenerationContext = {
        sectionId: '3.1.2',
        textType: 'aisd_completo',
        params: {}
      };

      const resultado = strategy.puedeGenerar(contexto);

      expect(resultado).toBe(true);
    });

    it('debe retornar true para sectionId que empieza con 3.1.2', () => {
      const contexto: TextGenerationContext = {
        sectionId: '3.1.2.A',
        textType: 'aisd_completo',
        params: {}
      };

      const resultado = strategy.puedeGenerar(contexto);

      expect(resultado).toBe(true);
    });

    it('debe retornar false para otros sectionIds', () => {
      const contexto: TextGenerationContext = {
        sectionId: '3.1.3',
        textType: 'metodologia',
        params: {}
      };

      const resultado = strategy.puedeGenerar(contexto);

      expect(resultado).toBe(false);
    });
  });

  describe('generarTexto', () => {
    it('debe generar texto AISD completo', () => {
      const datos = { distritoSeleccionado: 'Distrito 1' };
      const contexto: TextGenerationContext = {
        sectionId: '3.1.2',
        textType: 'aisd_completo',
        params: { comunidades: [] }
      };
      mockTextGenerator.generarTextoAISDCompleto.and.returnValue('Texto AISD');

      const resultado = strategy.generarTexto(datos, contexto);

      expect(mockTextGenerator.generarTextoAISDCompleto).toHaveBeenCalled();
      expect(resultado).toBe('Texto AISD');
    });

    it('debe generar texto AISI completo', () => {
      const datos = {};
      const contexto: TextGenerationContext = {
        sectionId: '3.1.2',
        textType: 'aisi_completo',
        params: { distritos: [] }
      };
      mockTextGenerator.generarTextoAISICompleto.and.returnValue('Texto AISI');

      const resultado = strategy.generarTexto(datos, contexto);

      expect(mockTextGenerator.generarTextoAISICompleto).toHaveBeenCalled();
      expect(resultado).toBe('Texto AISI');
    });

    it('debe retornar string vacío para tipo desconocido', () => {
      const datos = {};
      const contexto: TextGenerationContext = {
        sectionId: '3.1.2',
        textType: 'tipo_desconocido',
        params: {}
      };

      const resultado = strategy.generarTexto(datos, contexto);

      expect(resultado).toBe('');
    });
  });
});
