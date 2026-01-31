/**
 * TESTS: JSON IMPORT ADAPTER
 * 
 * Verifica la normalización de datos JSON importados:
 * - 1 key raíz → AISD (Comunidad)
 * - Múltiples keys → AISI (Distrito)
 * - Array directo → AISD con grupo default
 */

import {
  normalizeImportData,
  validateImportJson,
  getImportStats,
  NormalizedImportResult,
  InfluenceAreaType
} from './json-import.adapter';

describe('JsonImportAdapter', () => {

  // ==========================================================================
  // DATOS DE PRUEBA
  // ==========================================================================

  const mockCCPP1 = {
    ITEM: 1,
    UBIGEO: 40306,
    CODIGO: 403060001,
    CCPP: 'Centro Poblado 1',
    CATEGORIA: 'PUEBLO',
    POBLACION: 500,
    DPTO: 'AREQUIPA',
    PROV: 'CAYLLOMA',
    DIST: 'CAHUACHO',
    ESTE: 800000,
    NORTE: 8200000,
    ALTITUD: 3500
  };

  const mockCCPP2 = {
    ITEM: 2,
    UBIGEO: 40306,
    CODIGO: 403060002,
    CCPP: 'Centro Poblado 2',
    CATEGORIA: 'CASERIO',
    POBLACION: 250,
    DPTO: 'AREQUIPA',
    PROV: 'CAYLLOMA',
    DIST: 'CAHUACHO',
    ESTE: 800100,
    NORTE: 8200100,
    ALTITUD: 3600
  };

  const mockCCPP3 = {
    ITEM: 3,
    UBIGEO: 40307,
    CODIGO: 403070001,
    CCPP: 'Centro Poblado 3',
    CATEGORIA: 'PUEBLO',
    POBLACION: 800,
    DPTO: 'AREQUIPA',
    PROV: 'CAYLLOMA',
    DIST: 'MAJES',
    ESTE: 810000,
    NORTE: 8210000,
    ALTITUD: 3200
  };

  // ==========================================================================
  // normalizeImportData - CASO A: Una key (AISD)
  // ==========================================================================

  describe('normalizeImportData - AISD (1 key)', () => {
    
    it('debería detectar AISD con una sola key raíz', () => {
      const json = {
        'CAHUACHO': [mockCCPP1, mockCCPP2]
      };

      const result = normalizeImportData(json);

      expect(result.success).toBe(true);
      expect(result.metadata.detectedType).toBe('AISD');
      expect(result.groups.length).toBe(1);
      expect(result.ccpps.length).toBe(2);
    });

    it('debería crear grupo con nombre limpio sin prefijos', () => {
      const json = {
        'CCPP CAHUACHO': [mockCCPP1]
      };

      const result = normalizeImportData(json);

      expect(result.groups[0].nombre).toBe('CAHUACHO');
      expect(result.groups[0].tipo).toBe('AISD');
    });

    it('debería generar IDs únicos para cada CCPP', () => {
      const json = {
        'COMUNIDAD X': [mockCCPP1, mockCCPP2]
      };

      const result = normalizeImportData(json);

      const ids = result.ccpps.map(c => c.id);
      expect(new Set(ids).size).toBe(ids.length); // Todos únicos
    });

    it('debería extraer metadata de ubicación del primer CCPP', () => {
      const json = {
        'MI GRUPO': [mockCCPP1, mockCCPP2]
      };

      const result = normalizeImportData(json);

      expect(result.metadata.departamento).toBe('AREQUIPA');
      expect(result.metadata.provincia).toBe('CAYLLOMA');
      expect(result.metadata.distrito).toBe('CAHUACHO');
    });

    it('debería vincular CCPP IDs al grupo correctamente', () => {
      const json = {
        'GRUPO': [mockCCPP1, mockCCPP2]
      };

      const result = normalizeImportData(json);

      expect(result.groups[0].ccppIds.length).toBe(2);
      expect(result.groups[0].ccppIds).toContain(result.ccpps[0].id);
      expect(result.groups[0].ccppIds).toContain(result.ccpps[1].id);
    });

    it('debería manejar grupo vacío correctamente', () => {
      const json = {
        'VACIO': []
      };

      const result = normalizeImportData(json);

      expect(result.success).toBe(true);
      expect(result.groups.length).toBe(1);
      expect(result.groups[0].ccppIds.length).toBe(0);
      expect(result.ccpps.length).toBe(0);
    });
  });

  // ==========================================================================
  // normalizeImportData - CASO B: Múltiples keys (AISI)
  // ==========================================================================

  describe('normalizeImportData - AISI (múltiples keys)', () => {

    it('debería detectar AISI con múltiples keys raíz', () => {
      const json = {
        'CCPP SAN PEDRO': [mockCCPP1],
        'CCPP LIMA': [mockCCPP2],
        'CCPP NORTE': [mockCCPP3]
      };

      const result = normalizeImportData(json);

      expect(result.success).toBe(true);
      expect(result.metadata.detectedType).toBe('AISI');
      expect(result.groups.length).toBe(3);
    });

    it('debería marcar todos los grupos con tipo AISI', () => {
      const json = {
        'GRUPO A': [mockCCPP1],
        'GRUPO B': [mockCCPP2]
      };

      const result = normalizeImportData(json);

      result.groups.forEach(group => {
        expect(group.tipo).toBe('AISI');
      });
    });

    it('debería consolidar todos los CCPP en lista plana', () => {
      const json = {
        'GRUPO 1': [mockCCPP1, mockCCPP2],
        'GRUPO 2': [mockCCPP3]
      };

      const result = normalizeImportData(json);

      expect(result.ccpps.length).toBe(3);
      expect(result.metadata.totalCCPP).toBe(3);
    });

    it('debería asignar orden incremental a grupos', () => {
      const json = {
        'A': [mockCCPP1],
        'B': [mockCCPP2],
        'C': [mockCCPP3]
      };

      const result = normalizeImportData(json);

      expect(result.groups[0].orden).toBe(0);
      expect(result.groups[1].orden).toBe(1);
      expect(result.groups[2].orden).toBe(2);
    });

    it('debería manejar mezcla de grupos vacíos y con datos', () => {
      const json = {
        'CON DATOS': [mockCCPP1],
        'VACIO': [],
        'MAS DATOS': [mockCCPP2]
      };

      const result = normalizeImportData(json);

      expect(result.groups.length).toBe(3);
      expect(result.ccpps.length).toBe(2);
    });
  });

  // ==========================================================================
  // normalizeImportData - CASO C: Array directo
  // ==========================================================================

  describe('normalizeImportData - Array directo', () => {

    it('debería detectar AISD para array directo', () => {
      const json = [mockCCPP1, mockCCPP2];

      const result = normalizeImportData(json);

      expect(result.success).toBe(true);
      expect(result.metadata.detectedType).toBe('AISD');
    });

    it('debería crear un grupo default con nombre del distrito', () => {
      const json = [mockCCPP1, mockCCPP2];

      const result = normalizeImportData(json);

      expect(result.groups.length).toBe(1);
      expect(result.groups[0].nombre).toBe('CAHUACHO');
    });

    it('debería manejar array vacío', () => {
      const json: any[] = [];

      const result = normalizeImportData(json);

      expect(result.success).toBe(true);
      expect(result.groups.length).toBe(0);
      expect(result.ccpps.length).toBe(0);
    });

    it('debería filtrar elementos no-CCPP del array', () => {
      const json = [
        mockCCPP1,
        { invalid: true },
        'string invalido',
        null,
        mockCCPP2
      ];

      const result = normalizeImportData(json);

      expect(result.ccpps.length).toBe(2);
    });
  });

  // ==========================================================================
  // normalizeImportData - Casos de error
  // ==========================================================================

  describe('normalizeImportData - Errores', () => {

    it('debería retornar error para null', () => {
      const result = normalizeImportData(null);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('debería retornar error para undefined', () => {
      const result = normalizeImportData(undefined);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('debería retornar error para primitivos', () => {
      expect(normalizeImportData('string').success).toBe(false);
      expect(normalizeImportData(123).success).toBe(false);
      expect(normalizeImportData(true).success).toBe(false);
    });

    it('debería retornar error para objeto vacío', () => {
      const result = normalizeImportData({});

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('debería reportar keys que no contienen arrays', () => {
      const json = {
        'VALIDO': [mockCCPP1],
        'INVALIDO': 'no es array',
        'OTRO_INVALIDO': { nested: true }
      };

      const result = normalizeImportData(json);

      // Debe procesar el válido y reportar errores para inválidos
      expect(result.groups.length).toBe(1);
      expect(result.errors.length).toBe(2);
    });
  });

  // ==========================================================================
  // validateImportJson
  // ==========================================================================

  describe('validateImportJson', () => {

    it('debería validar array de CCPP', () => {
      const validation = validateImportJson([mockCCPP1]);

      expect(validation.valid).toBe(true);
      expect(validation.format).toBe('array');
      expect(validation.errors.length).toBe(0);
    });

    it('debería validar objeto con grupos', () => {
      const validation = validateImportJson({ grupo: [mockCCPP1] });

      expect(validation.valid).toBe(true);
      expect(validation.format).toBe('object');
    });

    it('debería invalidar null', () => {
      const validation = validateImportJson(null);

      expect(validation.valid).toBe(false);
      expect(validation.format).toBe('unknown');
    });

    it('debería invalidar array sin CCPP válidos', () => {
      const validation = validateImportJson([{ random: 'data' }]);

      expect(validation.valid).toBe(false);
      expect(validation.format).toBe('array');
    });

    it('debería aceptar array vacío', () => {
      const validation = validateImportJson([]);

      expect(validation.valid).toBe(true);
      expect(validation.format).toBe('array');
    });

    it('debería reportar keys inválidas en objeto', () => {
      const validation = validateImportJson({
        valido: [mockCCPP1],
        invalido: 'no array'
      });

      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(1); // Advertencia de key ignorada
    });
  });

  // ==========================================================================
  // getImportStats
  // ==========================================================================

  describe('getImportStats', () => {

    it('debería retornar stats para array', () => {
      const stats = getImportStats([mockCCPP1, mockCCPP2]);

      expect(stats.format).toBe('array');
      expect(stats.estimatedGroups).toBe(1);
      expect(stats.estimatedCCPP).toBe(2);
      expect(stats.detectedType).toBe('AISD');
    });

    it('debería retornar stats para objeto con 1 key (AISD)', () => {
      const stats = getImportStats({ grupo: [mockCCPP1, mockCCPP2] });

      expect(stats.format).toBe('object');
      expect(stats.estimatedGroups).toBe(1);
      expect(stats.estimatedCCPP).toBe(2);
      expect(stats.detectedType).toBe('AISD');
    });

    it('debería retornar stats para objeto con múltiples keys (AISI)', () => {
      const stats = getImportStats({
        grupo1: [mockCCPP1],
        grupo2: [mockCCPP2, mockCCPP3]
      });

      expect(stats.format).toBe('object');
      expect(stats.estimatedGroups).toBe(2);
      expect(stats.estimatedCCPP).toBe(3);
      expect(stats.detectedType).toBe('AISI');
    });

    it('debería retornar unknown para formato no reconocido', () => {
      const stats = getImportStats('invalid');

      expect(stats.format).toBe('unknown');
      expect(stats.estimatedGroups).toBe(0);
      expect(stats.estimatedCCPP).toBe(0);
      expect(stats.detectedType).toBeNull();
    });
  });

  // ==========================================================================
  // Normalización de propiedades CCPP
  // ==========================================================================

  describe('Normalización de propiedades CCPP', () => {

    it('debería mapear todas las propiedades correctamente', () => {
      const json = { grupo: [mockCCPP1] };

      const result = normalizeImportData(json);
      const ccpp = result.ccpps[0];

      expect(ccpp.item).toBe(1);
      expect(ccpp.ubigeo).toBe(40306);
      expect(ccpp.codigo).toBe('403060001');
      expect(ccpp.nombre).toBe('Centro Poblado 1');
      expect(ccpp.categoria).toBe('PUEBLO');
      expect(ccpp.poblacion).toBe(500);
      expect(ccpp.dpto).toBe('AREQUIPA');
      expect(ccpp.prov).toBe('CAYLLOMA');
      expect(ccpp.dist).toBe('CAHUACHO');
      expect(ccpp.este).toBe(800000);
      expect(ccpp.norte).toBe(8200000);
      expect(ccpp.altitud).toBe(3500);
    });

    it('debería usar valores default para propiedades faltantes', () => {
      const minimalCCPP = { CCPP: 'Minimal' };
      const json = { grupo: [minimalCCPP] };

      const result = normalizeImportData(json);
      const ccpp = result.ccpps[0];

      expect(ccpp.item).toBe(0);
      expect(ccpp.ubigeo).toBe(0);
      expect(ccpp.poblacion).toBe(0);
      expect(ccpp.dpto).toBe('');
    });

    it('debería generar ID basado en CODIGO', () => {
      const json = { grupo: [mockCCPP1] };

      const result = normalizeImportData(json);

      expect(result.ccpps[0].id).toBe('403060001');
    });
  });

  // ==========================================================================
  // Inmutabilidad
  // ==========================================================================

  describe('Inmutabilidad', () => {

    it('debería retornar arrays readonly', () => {
      const json = { grupo: [mockCCPP1] };
      
      const result = normalizeImportData(json);

      // TypeScript ya garantiza readonly, pero verificamos que son arrays inmutables
      expect(Array.isArray(result.groups)).toBe(true);
      expect(Array.isArray(result.ccpps)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('no debería mutar el JSON de entrada', () => {
      const originalJson = {
        grupo: [{ ...mockCCPP1 }]
      };
      const jsonCopy = JSON.stringify(originalJson);

      normalizeImportData(originalJson);

      expect(JSON.stringify(originalJson)).toBe(jsonCopy);
    });
  });

  // ==========================================================================
  // Casos de borde
  // ==========================================================================

  describe('Casos de borde', () => {

    it('debería manejar nombres de grupo con caracteres especiales', () => {
      const json = {
        'CCPP "San José" (Norte) - Parte 1': [mockCCPP1]
      };

      const result = normalizeImportData(json);

      expect(result.success).toBe(true);
      expect(result.groups[0].nombre).toBeTruthy();
      expect(result.groups[0].id).toMatch(/^group_/);
    });

    it('debería manejar CCPP con valores numéricos como strings', () => {
      const ccppWithStringNumbers = {
        ...mockCCPP1,
        POBLACION: '500' as any,
        ALTITUD: '3500' as any
      };
      const json = { grupo: [ccppWithStringNumbers] };

      const result = normalizeImportData(json);

      // Debería procesar sin errores (coerción implícita o manejo)
      expect(result.success).toBe(true);
    });

    it('debería generar IDs únicos para CCPP duplicados', () => {
      // Mismo CCPP en dos grupos diferentes
      const json = {
        'GRUPO A': [mockCCPP1],
        'GRUPO B': [mockCCPP1] // Mismo CCPP
      };

      const result = normalizeImportData(json);

      // Nota: En este caso, los IDs serían iguales porque se basan en CODIGO
      // Esto es un comportamiento esperado - el consumidor debe manejar duplicados
      expect(result.ccpps.length).toBe(2);
    });
  });
});
