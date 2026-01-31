/**
 * JSON NORMALIZER - UNIT TESTS
 * 
 * Tests para verificar:
 * 1. Detección de formato A (array) y B (objeto con grupos)
 * 2. Normalización correcta de CCPP
 * 3. Creación de grupos AISD
 * 4. Generación de Commands correctos
 * 5. Batch Command tiene estructura esperada
 */

import {
  detectJSONFormat,
  normalizeJSON,
  normalizeFormatA,
  normalizeFormatB,
  normalizeCCPP,
  cleanGroupName,
  generateCCPPId,
  extractUbicacion,
  createRegisterCCPPCommand,
  createGroupCommands,
  createUbicacionCommand,
  createMetadataCommand,
  createJSONProcessingBatch,
  validateJSONStructure,
  getJSONStats,
  NormalizedJSONResult,
  NormalizedCCPP
} from './json-normalizer';
import { CentroPobladoData } from '../../models/formulario.model';

// ============================================================================
// MOCK DATA
// ============================================================================

function createMockCCPP(overrides: Partial<CentroPobladoData> = {}): CentroPobladoData {
  return {
    ITEM: 1,
    UBIGEO: 150101,
    CODIGO: 1501010001,
    CCPP: 'Centro Poblado Test',
    CATEGORIA: 'CIUDAD',
    POBLACION: 1000,
    DPTO: 'LIMA',
    PROV: 'LIMA',
    DIST: 'MIRAFLORES',
    ESTE: 277000,
    NORTE: 8666000,
    ALTITUD: 79,
    ...overrides
  };
}

// Formato A: Array simple
const FORMAT_A_JSON: CentroPobladoData[] = [
  createMockCCPP({ ITEM: 1, CODIGO: 1001, CCPP: 'Poblado A1' }),
  createMockCCPP({ ITEM: 2, CODIGO: 1002, CCPP: 'Poblado A2' }),
  createMockCCPP({ ITEM: 3, CODIGO: 1003, CCPP: 'Poblado A3' })
];

// Formato B: Objeto con grupos
const FORMAT_B_JSON: Record<string, CentroPobladoData[]> = {
  'CC Comunidad Alfa': [
    createMockCCPP({ ITEM: 1, CODIGO: 2001, CCPP: 'Poblado B1', DIST: 'Cahuacho' }),
    createMockCCPP({ ITEM: 2, CODIGO: 2002, CCPP: 'Poblado B2', DIST: 'Cahuacho' })
  ],
  'CCPP Comunidad Beta': [
    createMockCCPP({ ITEM: 3, CODIGO: 3001, CCPP: 'Poblado B3', DIST: 'Cahuacho' }),
    createMockCCPP({ ITEM: 4, CODIGO: 3002, CCPP: 'Poblado B4', DIST: 'Cahuacho' })
  ]
};

// ============================================================================
// DETECCIÓN DE FORMATO TESTS
// ============================================================================

describe('JSON Normalizer - Format Detection', () => {
  describe('detectJSONFormat', () => {
    it('should detect Format A (array of CCPP)', () => {
      expect(detectJSONFormat(FORMAT_A_JSON)).toBe('A');
    });

    it('should detect Format B (object with groups)', () => {
      expect(detectJSONFormat(FORMAT_B_JSON)).toBe('B');
    });

    it('should return unknown for null', () => {
      expect(detectJSONFormat(null)).toBe('unknown');
    });

    it('should return unknown for undefined', () => {
      expect(detectJSONFormat(undefined)).toBe('unknown');
    });

    it('should return unknown for empty object without CCPP structure', () => {
      expect(detectJSONFormat({ someKey: 'value' })).toBe('unknown');
    });

    it('should return A for empty array', () => {
      expect(detectJSONFormat([])).toBe('A');
    });

    it('should return unknown for array without CCPP properties', () => {
      expect(detectJSONFormat([{ name: 'test' }])).toBe('unknown');
    });

    it('should detect Format A with CODIGO property', () => {
      expect(detectJSONFormat([{ CODIGO: 123 }])).toBe('A');
    });

    it('should detect Format A with UBIGEO property', () => {
      expect(detectJSONFormat([{ UBIGEO: 150101 }])).toBe('A');
    });

    it('should detect Format B with nested array containing CCPP', () => {
      expect(detectJSONFormat({ 'Grupo1': [{ CCPP: 'Test' }] })).toBe('B');
    });
  });
});

// ============================================================================
// NORMALIZACIÓN DE CCPP TESTS
// ============================================================================

describe('JSON Normalizer - CCPP Normalization', () => {
  describe('normalizeCCPP', () => {
    it('should normalize a complete CCPP', () => {
      const input = createMockCCPP();
      const result = normalizeCCPP(input);

      expect(result.id).toContain('ccpp_');
      expect(result.item).toBe(1);
      expect(result.ubigeo).toBe(150101);
      expect(result.codigo).toBe('1501010001');
      expect(result.nombre).toBe('Centro Poblado Test');
      expect(result.categoria).toBe('CIUDAD');
      expect(result.poblacion).toBe(1000);
      expect(result.dpto).toBe('LIMA');
      expect(result.prov).toBe('LIMA');
      expect(result.dist).toBe('MIRAFLORES');
    });

    it('should handle missing fields with defaults', () => {
      const input: CentroPobladoData = { CCPP: 'Only Name' };
      const result = normalizeCCPP(input);

      expect(result.nombre).toBe('Only Name');
      expect(result.item).toBe(0);
      expect(result.ubigeo).toBe(0);
      expect(result.codigo).toBe('');
      expect(result.poblacion).toBe(0);
    });

    it('should convert CODIGO to string', () => {
      const input = createMockCCPP({ CODIGO: 12345 });
      const result = normalizeCCPP(input);
      expect(result.codigo).toBe('12345');
    });
  });

  describe('generateCCPPId', () => {
    it('should generate unique ID based on UBIGEO and CODIGO', () => {
      const input = createMockCCPP({ UBIGEO: 150101, CODIGO: 1001 });
      const id = generateCCPPId(input);
      
      expect(id).toContain('ccpp_');
      expect(id).toContain('150101');
      expect(id).toContain('1001');
    });

    it('should handle missing values', () => {
      const input: CentroPobladoData = {};
      const id = generateCCPPId(input);
      
      expect(id).toContain('ccpp_0_');
    });
  });

  describe('extractUbicacion', () => {
    it('should extract ubicacion from first CCPP', () => {
      const result = extractUbicacion(FORMAT_A_JSON);
      
      expect(result.departamento).toBe('LIMA');
      expect(result.provincia).toBe('LIMA');
      expect(result.distrito).toBe('MIRAFLORES');
    });

    it('should return empty strings for empty array', () => {
      const result = extractUbicacion([]);
      
      expect(result.departamento).toBe('');
      expect(result.provincia).toBe('');
      expect(result.distrito).toBe('');
    });
  });
});

// ============================================================================
// NORMALIZACIÓN FORMATO A TESTS
// ============================================================================

describe('JSON Normalizer - Format A', () => {
  describe('normalizeFormatA', () => {
    it('should normalize array of CCPP', () => {
      const result = normalizeFormatA(FORMAT_A_JSON);

      expect(result.format).toBe('A');
      expect(result.ccppList.length).toBe(3);
      expect(result.rawData.length).toBe(3);
    });

    it('should create one default group with all CCPP', () => {
      const result = normalizeFormatA(FORMAT_A_JSON);

      expect(result.groups.length).toBe(1);
      expect(result.groups[0].tipo).toBe('AISD');
      expect(result.groups[0].ccppIds.length).toBe(3);
    });

    it('should use distrito as group name', () => {
      const result = normalizeFormatA(FORMAT_A_JSON);

      expect(result.groups[0].nombre).toBe('MIRAFLORES');
    });

    it('should handle empty array', () => {
      const result = normalizeFormatA([]);

      expect(result.format).toBe('A');
      expect(result.ccppList.length).toBe(0);
      expect(result.groups.length).toBe(0);
    });

    it('should extract ubicacion correctly', () => {
      const result = normalizeFormatA(FORMAT_A_JSON);

      expect(result.ubicacion.departamento).toBe('LIMA');
      expect(result.ubicacion.provincia).toBe('LIMA');
      expect(result.ubicacion.distrito).toBe('MIRAFLORES');
    });
  });
});

// ============================================================================
// NORMALIZACIÓN FORMATO B TESTS
// ============================================================================

describe('JSON Normalizer - Format B', () => {
  describe('cleanGroupName', () => {
    it('should remove "CCPP " prefix', () => {
      expect(cleanGroupName('CCPP Comunidad Beta')).toBe('Comunidad Beta');
    });

    it('should remove "CC " prefix', () => {
      expect(cleanGroupName('CC Comunidad Alfa')).toBe('Comunidad Alfa');
    });

    it('should handle names without prefix', () => {
      expect(cleanGroupName('Comunidad Gamma')).toBe('Comunidad Gamma');
    });

    it('should trim whitespace', () => {
      expect(cleanGroupName('  CC   Comunidad   ')).toBe('Comunidad');
    });
  });

  describe('normalizeFormatB', () => {
    it('should normalize object with groups', () => {
      const result = normalizeFormatB(FORMAT_B_JSON);

      expect(result.format).toBe('B');
      expect(result.ccppList.length).toBe(4);
    });

    it('should create multiple groups', () => {
      const result = normalizeFormatB(FORMAT_B_JSON);

      expect(result.groups.length).toBe(2);
      expect(result.groups[0].tipo).toBe('AISD');
      expect(result.groups[1].tipo).toBe('AISD');
    });

    it('should clean group names', () => {
      const result = normalizeFormatB(FORMAT_B_JSON);
      const names = result.groups.map(g => g.nombre);

      expect(names).toContain('Comunidad Alfa');
      expect(names).toContain('Comunidad Beta');
    });

    it('should assign correct CCPP to each group', () => {
      const result = normalizeFormatB(FORMAT_B_JSON);
      
      const alfaGroup = result.groups.find(g => g.nombre === 'Comunidad Alfa');
      const betaGroup = result.groups.find(g => g.nombre === 'Comunidad Beta');

      expect(alfaGroup?.ccppIds.length).toBe(2);
      expect(betaGroup?.ccppIds.length).toBe(2);
    });

    it('should extract ubicacion from all CCPP', () => {
      const result = normalizeFormatB(FORMAT_B_JSON);

      expect(result.ubicacion.distrito).toBe('Cahuacho');
    });
  });
});

// ============================================================================
// FUNCIÓN PRINCIPAL NORMALIZE JSON
// ============================================================================

describe('JSON Normalizer - Main Function', () => {
  describe('normalizeJSON', () => {
    it('should route Format A correctly', () => {
      const result = normalizeJSON(FORMAT_A_JSON);
      expect(result.format).toBe('A');
    });

    it('should route Format B correctly', () => {
      const result = normalizeJSON(FORMAT_B_JSON);
      expect(result.format).toBe('B');
    });

    it('should handle unknown format', () => {
      const result = normalizeJSON({ invalid: 'data' });
      
      expect(result.format).toBe('unknown');
      expect(result.ccppList.length).toBe(0);
      expect(result.groups.length).toBe(0);
    });
  });
});

// ============================================================================
// COMMAND GENERATION TESTS
// ============================================================================

describe('JSON Normalizer - Command Generation', () => {
  describe('createRegisterCCPPCommand', () => {
    it('should create RegisterCCPPBatchCommand', () => {
      const result = normalizeJSON(FORMAT_A_JSON);
      const command = createRegisterCCPPCommand(result);

      expect(command).not.toBeNull();
      expect(command!.type).toBe('groupConfig/registerCCPPBatch');
      expect(command!.payload.ccppList.length).toBe(3);
    });

    it('should return null for empty result', () => {
      const result = normalizeJSON([]);
      const command = createRegisterCCPPCommand(result);

      expect(command).toBeNull();
    });
  });

  describe('createGroupCommands', () => {
    it('should create AddGroupCommand for each group', () => {
      const result = normalizeJSON(FORMAT_B_JSON);
      const commands = createGroupCommands(result);

      expect(commands.length).toBe(2);
      expect(commands[0].type).toBe('groupConfig/addGroup');
      expect(commands[0].payload.tipo).toBe('AISD');
    });

    it('should include ccppIds in each group command', () => {
      const result = normalizeJSON(FORMAT_B_JSON);
      const commands = createGroupCommands(result);

      expect(commands[0].payload.ccppIds.length).toBeGreaterThan(0);
    });
  });

  describe('createUbicacionCommand', () => {
    it('should create SetUbicacionCommand with data', () => {
      const result = normalizeJSON(FORMAT_A_JSON);
      const command = createUbicacionCommand(result);

      expect(command).not.toBeNull();
      expect(command!.type).toBe('project/setUbicacion');
      expect(command!.payload.departamento).toBe('LIMA');
    });

    it('should return null when no ubicacion', () => {
      const result: NormalizedJSONResult = {
        format: 'A',
        ccppList: [],
        groups: [],
        ubicacion: { departamento: '', provincia: '', distrito: '' },
        rawData: []
      };
      const command = createUbicacionCommand(result);

      expect(command).toBeNull();
    });
  });

  describe('createMetadataCommand', () => {
    it('should create UpdateMetadataCommand from filename', () => {
      const command = createMetadataCommand('proyecto_test.json');

      expect(command).not.toBeNull();
      expect(command!.type).toBe('metadata/update');
      expect(command!.payload.projectName).toBe('proyecto_test');
    });

    it('should return null without filename', () => {
      expect(createMetadataCommand()).toBeNull();
      expect(createMetadataCommand('')).toBeNull();
    });
  });
});

// ============================================================================
// BATCH COMMAND TESTS
// ============================================================================

describe('JSON Normalizer - Batch Command', () => {
  describe('createJSONProcessingBatch', () => {
    it('should create batch for Format A', () => {
      const { batch, result } = createJSONProcessingBatch(FORMAT_A_JSON);

      expect(batch).not.toBeNull();
      expect(batch!.type).toBe('batch/execute');
      expect(result.format).toBe('A');
    });

    it('should create batch for Format B', () => {
      const { batch, result } = createJSONProcessingBatch(FORMAT_B_JSON);

      expect(batch).not.toBeNull();
      expect(result.format).toBe('B');
      expect(result.groups.length).toBe(2);
    });

    it('should return null batch for invalid JSON', () => {
      const { batch, result } = createJSONProcessingBatch({ invalid: true });

      expect(batch).toBeNull();
      expect(result.format).toBe('unknown');
    });

    it('should include metadata command when fileName provided', () => {
      const { batch } = createJSONProcessingBatch(FORMAT_A_JSON, { fileName: 'test.json' });
      
      const metadataCmd = batch!.payload.commands.find(c => c.type === 'metadata/update');
      expect(metadataCmd).toBeDefined();
    });

    it('should order commands correctly: metadata, ubicacion, ccpp, groups', () => {
      const { batch } = createJSONProcessingBatch(FORMAT_B_JSON, { fileName: 'test.json' });
      const types = batch!.payload.commands.map(c => c.type);

      const metaIdx = types.indexOf('metadata/update');
      const ubicIdx = types.indexOf('project/setUbicacion');
      const ccppIdx = types.indexOf('groupConfig/registerCCPPBatch');
      const groupIdx = types.findIndex(t => t === 'groupConfig/addGroup');

      // Verificar orden
      expect(metaIdx).toBeLessThan(ubicIdx);
      expect(ubicIdx).toBeLessThan(ccppIdx);
      expect(ccppIdx).toBeLessThan(groupIdx);
    });

    it('should use custom transactionId when provided', () => {
      const { batch } = createJSONProcessingBatch(FORMAT_A_JSON, { 
        transactionId: 'custom_tx_123' 
      });

      expect(batch!.payload.transactionId).toBe('custom_tx_123');
    });
  });
});

// ============================================================================
// VALIDATION TESTS
// ============================================================================

describe('JSON Normalizer - Validation', () => {
  describe('validateJSONStructure', () => {
    it('should validate correct Format A', () => {
      const result = validateJSONStructure(FORMAT_A_JSON);
      expect(result.valid).toBe(true);
    });

    it('should validate correct Format B', () => {
      const result = validateJSONStructure(FORMAT_B_JSON);
      expect(result.valid).toBe(true);
    });

    it('should reject unknown format', () => {
      const result = validateJSONStructure({ invalid: 'data' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('no reconocido');
    });

    it('should reject empty CCPP list', () => {
      const result = validateJSONStructure([]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('no contiene');
    });
  });

  describe('getJSONStats', () => {
    it('should calculate correct stats for Format A', () => {
      const result = normalizeJSON(FORMAT_A_JSON);
      const stats = getJSONStats(result);

      expect(stats.totalCCPP).toBe(3);
      expect(stats.totalGroups).toBe(1);
      expect(stats.format).toBe('A');
    });

    it('should calculate correct stats for Format B', () => {
      const result = normalizeJSON(FORMAT_B_JSON);
      const stats = getJSONStats(result);

      expect(stats.totalCCPP).toBe(4);
      expect(stats.totalGroups).toBe(2);
      expect(stats.format).toBe('B');
    });

    it('should sum total poblacion', () => {
      const result = normalizeJSON(FORMAT_A_JSON);
      const stats = getJSONStats(result);

      expect(stats.totalPoblacion).toBe(3000); // 3 CCPP x 1000 cada uno
    });
  });
});

// ============================================================================
// INTEGRATION TEST - FULL FLOW
// ============================================================================

describe('JSON Normalizer - Integration', () => {
  it('should process Format A end-to-end', () => {
    // 1. Detectar formato
    const format = detectJSONFormat(FORMAT_A_JSON);
    expect(format).toBe('A');

    // 2. Normalizar
    const normalized = normalizeJSON(FORMAT_A_JSON);
    expect(normalized.ccppList.length).toBe(3);
    expect(normalized.groups.length).toBe(1);

    // 3. Crear batch
    const { batch } = createJSONProcessingBatch(FORMAT_A_JSON, { 
      fileName: 'test_project.json' 
    });
    
    expect(batch).not.toBeNull();
    
    // 4. Verificar estructura del batch
    const commandTypes = batch!.payload.commands.map(c => c.type);
    expect(commandTypes).toContain('metadata/update');
    expect(commandTypes).toContain('project/setUbicacion');
    expect(commandTypes).toContain('groupConfig/registerCCPPBatch');
    expect(commandTypes).toContain('groupConfig/addGroup');
  });

  it('should process Format B end-to-end', () => {
    // 1. Detectar formato
    const format = detectJSONFormat(FORMAT_B_JSON);
    expect(format).toBe('B');

    // 2. Normalizar
    const normalized = normalizeJSON(FORMAT_B_JSON);
    expect(normalized.ccppList.length).toBe(4);
    expect(normalized.groups.length).toBe(2);

    // 3. Verificar nombres de grupos limpios
    const groupNames = normalized.groups.map(g => g.nombre);
    expect(groupNames).toContain('Comunidad Alfa');
    expect(groupNames).toContain('Comunidad Beta');

    // 4. Crear batch
    const { batch } = createJSONProcessingBatch(FORMAT_B_JSON);
    expect(batch).not.toBeNull();

    // 5. Contar comandos de grupo
    const groupCommands = batch!.payload.commands.filter(
      c => c.type === 'groupConfig/addGroup'
    );
    expect(groupCommands.length).toBe(2);
  });
});
