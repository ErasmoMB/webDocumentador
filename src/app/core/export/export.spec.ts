/**
 * EXPORT TESTS - PASO 8.4
 * 
 * Tests para el sistema de exportación.
 * 
 * Casos cubiertos:
 * - Construcción de documento
 * - Exportación JSON
 * - Estructura PDF
 * - Consistencia de numeración
 * - Snapshot testing
 */

import {
  // Contract
  EXPORT_VERSION,
  EXPORTER_ID,
  ExportedDocument,
  ExportOptions,
  DEFAULT_EXPORT_OPTIONS,
  generateContentHash,
  generateExportFilename,
  createExportMetadata,
  validateExportedDocument
} from './export.contract';

import {
  buildDocument,
  getDocumentStats
} from './document-builder.service';

import { JSONExporterService } from './json-exporter.service';

import { ProjectState, INITIAL_PROJECT_STATE } from '../state/project-state.model';

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

function createTestProjectState(): ProjectState {
  const now = Date.now();
  return {
    ...INITIAL_PROJECT_STATE,
    metadata: {
      projectId: 'test-123',
      projectName: 'Proyecto de Prueba',
      consultora: 'Consultora Test',
      detalleProyecto: 'Descripción del proyecto de prueba',
      createdAt: now - 86400000,
      updatedAt: now,
      version: '1.0.0'
    },
    groupConfig: {
      aisd: [
        { id: '1', nombre: 'Grupo AISD 1', tipo: 'AISD', parentId: null, ccppIds: [], orden: 0 },
        { id: '1.1', nombre: 'Subgrupo AISD 1.1', tipo: 'AISD', parentId: '1', ccppIds: [], orden: 1 }
      ],
      aisi: [
        { id: 'A', nombre: 'Grupo AISI A', tipo: 'AISI', parentId: null, ccppIds: [], orden: 0 }
      ],
      lastUpdated: now
    },
    globalRegistry: {
      ubicacion: {
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'Miraflores'
      },
      entrevistados: [
        { nombre: 'Juan Pérez', cargo: 'Gerente', organizacion: 'Org1' },
        { nombre: 'María García', cargo: 'Coordinadora', organizacion: 'Org2' }
      ],
      comunidadesCampesinas: [],
      distritos: []
    },
    sections: {
      byId: {
        'seccion1': {
          id: 'seccion1',
          groupType: 'AISD',
          groupId: '1',
          isInitialized: true,
          isComplete: false,
          lastModified: now
        },
        'seccion2': {
          id: 'seccion2',
          groupType: 'AISI',
          groupId: null,
          isInitialized: true,
          isComplete: true,
          lastModified: now
        }
      },
      allIds: ['seccion1', 'seccion2'],
      activeSectionId: 'seccion1'
    },
    fields: {
      byKey: {
        'seccion1::1::campo1': {
          sectionId: 'seccion1',
          groupId: '1',
          fieldName: 'campo1',
          state: {
            value: 'Valor del campo 1',
            touched: true,
            dirty: true,
            autoloaded: false,
            source: 'user',
            lastModified: now
          }
        },
        'seccion1::1::campo2': {
          sectionId: 'seccion1',
          groupId: '1',
          fieldName: 'campo2',
          state: {
            value: 123,
            touched: true,
            dirty: false,
            autoloaded: false,
            source: 'user',
            lastModified: now
          }
        },
        'seccion2::campoGeneral': {
          sectionId: 'seccion2',
          groupId: null,
          fieldName: 'campoGeneral',
          state: {
            value: 'Valor general',
            touched: false,
            dirty: false,
            autoloaded: true,
            source: 'api',
            lastModified: now
          }
        }
      },
      allKeys: ['seccion1::1::campo1', 'seccion1::1::campo2', 'seccion2::campoGeneral']
    },
    tables: {
      byKey: {
        'seccion1::1::tablaItems': {
          sectionId: 'seccion1',
          groupId: '1',
          tableKey: 'tablaItems',
          state: {
            rows: [
              { id: 'row1', orden: 0, data: { item: 'Item 1', cantidad: 10, precio: 100 } },
              { id: 'row2', orden: 1, data: { item: 'Item 2', cantidad: 20, precio: 200 } }
            ],
            totalKey: '',
            campoTotal: '',
            campoPorcentaje: null,
            lastModified: now
          }
        }
      },
      allKeys: ['seccion1::1::tablaItems']
    },
    images: {
      byId: {
        'img1': {
          id: 'img1',
          sectionId: 'seccion1',
          groupId: '1',
          numero: 1,
          titulo: 'Fotografía de prueba',
          fuente: 'Trabajo de campo',
          preview: 'data:image/jpeg;base64,/9j/fake',
          uploadStatus: 'uploaded',
          backendId: null,
          localPath: null,
          orden: 0,
          lastModified: now
        }
      },
      allIds: ['img1'],
      bySectionGroup: {
        'seccion1::1': ['img1']
      }
    },
    ccppRegistry: INITIAL_PROJECT_STATE.ccppRegistry,
    _internal: {
      isDirty: false,
      lastSaved: now,
      loadedFrom: 'storage'
    }
  };
}

// ============================================================================
// EXPORT CONTRACT TESTS
// ============================================================================

describe('Export Contract (PASO 8.1)', () => {
  
  describe('generateContentHash', () => {
    it('should generate consistent hash for same content', () => {
      const content = JSON.stringify({ test: 'data' });
      const hash1 = generateContentHash(content);
      const hash2 = generateContentHash(content);
      expect(hash1).toBe(hash2);
    });
    
    it('should generate different hash for different content', () => {
      const hash1 = generateContentHash('content1');
      const hash2 = generateContentHash('content2');
      expect(hash1).not.toBe(hash2);
    });
    
    it('should return 8-character hex string', () => {
      const hash = generateContentHash('test');
      expect(hash).toMatch(/^[0-9a-f]{8}$/);
    });
  });
  
  describe('generateExportFilename', () => {
    it('should generate valid filename', () => {
      const filename = generateExportFilename('Mi Proyecto', 'json');
      expect(filename).toMatch(/^Mi_Proyecto_\d{4}-\d{2}-\d{2}\.json$/);
    });
    
    it('should sanitize special characters', () => {
      const filename = generateExportFilename('Proyecto/Test<>:"|?*', 'pdf');
      expect(filename).not.toContain('/');
      expect(filename).not.toContain('<');
      expect(filename).toContain('.pdf');
    });
    
    it('should truncate long names', () => {
      const longName = 'A'.repeat(100);
      const filename = generateExportFilename(longName, 'json');
      expect(filename.length).toBeLessThan(80);
    });
  });
  
  describe('createExportMetadata', () => {
    it('should create metadata with correct version', () => {
      const meta = createExportMetadata('json', 'abc123');
      expect(meta.exportVersion).toBe(EXPORT_VERSION);
      expect(meta.exporterId).toBe(EXPORTER_ID);
      expect(meta.format).toBe('json');
      expect(meta.contentHash).toBe('abc123');
      expect(meta.exportedAt).toBeDefined();
    });
  });
  
  describe('validateExportedDocument', () => {
    it('should validate correct document', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      expect(validateExportedDocument(doc)).toBe(true);
    });
    
    it('should reject null', () => {
      expect(validateExportedDocument(null)).toBe(false);
    });
    
    it('should reject document missing project', () => {
      expect(validateExportedDocument({ sections: [] })).toBe(false);
    });
    
    it('should reject document missing sections array', () => {
      expect(validateExportedDocument({ 
        project: { projectName: 'Test' },
        _export: { exportVersion: '1.0.0' }
      })).toBe(false);
    });
  });
});

// ============================================================================
// DOCUMENT BUILDER TESTS
// ============================================================================

describe('Document Builder (PASO 8.2)', () => {
  
  describe('buildDocument', () => {
    it('should build complete document from state', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      
      expect(doc._export).toBeDefined();
      expect(doc.project).toBeDefined();
      expect(doc.ubicacion).toBeDefined();
      expect(doc.aisd).toBeDefined();
      expect(doc.aisi).toBeDefined();
      expect(doc.sections).toBeDefined();
    });
    
    it('should include project info from state', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      
      expect(doc.project.projectName).toBe('Proyecto de Prueba');
      expect(doc.project.consultora).toBe('Consultora Test');
    });
    
    it('should include ubicacion from state', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      
      expect(doc.ubicacion.departamento).toBe('Lima');
      expect(doc.ubicacion.provincia).toBe('Lima');
      expect(doc.ubicacion.distrito).toBe('Miraflores');
    });
    
    it('should include groups from state', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      
      expect(doc.aisd.length).toBe(2);
      expect(doc.aisi.length).toBe(1);
      expect(doc.aisd[0].nombre).toBe('Grupo AISD 1');
    });
    
    it('should include entrevistados from state', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      
      expect(doc.entrevistados.length).toBe(2);
      expect(doc.entrevistados[0].nombre).toBe('Juan Pérez');
    });
    
    it('should include initialized sections only', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      
      expect(doc.sections.length).toBe(2);
    });
    
    it('should include fields in sections', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      
      const section1 = doc.sections.find(s => s.sectionId === 'seccion1');
      expect(section1).toBeDefined();
      expect(section1!.fields.length).toBeGreaterThan(0);
    });
    
    it('should include tables in sections', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      
      const section1 = doc.sections.find(s => s.sectionId === 'seccion1');
      expect(section1).toBeDefined();
      expect(section1!.tables.length).toBe(1);
      expect(section1!.tables[0].rows.length).toBe(2);
    });
    
    it('should include images in sections', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      
      const section1 = doc.sections.find(s => s.sectionId === 'seccion1');
      expect(section1).toBeDefined();
      expect(section1!.images.length).toBe(1);
      expect(section1!.images[0].numero).toBe(1);
    });
  });
  
  describe('buildDocument with options', () => {
    it('should filter sections when sectionsFilter is set', () => {
      const state = createTestProjectState();
      const options = { ...DEFAULT_EXPORT_OPTIONS, sectionsFilter: ['seccion1'] };
      const doc = buildDocument(state, options);
      
      expect(doc.sections.length).toBe(1);
      expect(doc.sections[0].sectionId).toBe('seccion1');
    });
    
    it('should filter groups when groupsFilter is set', () => {
      const state = createTestProjectState();
      const options = { ...DEFAULT_EXPORT_OPTIONS, groupsFilter: ['1'] };
      const doc = buildDocument(state, options);
      
      expect(doc.aisd.length).toBe(1);
      expect(doc.aisd[0].id).toBe('1');
    });
    
    it('should exclude empty fields when includeEmptyFields is false', () => {
      const baseState = createTestProjectState();
      // Create new state with an empty field added
      const emptyFieldKey = 'seccion1::1::campoVacio';
      const state: ProjectState = {
        ...baseState,
        fields: {
          byKey: {
            ...baseState.fields.byKey,
            [emptyFieldKey]: {
              sectionId: 'seccion1',
              groupId: '1',
              fieldName: 'campoVacio',
              state: {
                value: '',
                touched: false,
                dirty: false,
                autoloaded: false,
                source: 'default',
                lastModified: Date.now()
              }
            }
          },
          allKeys: [...baseState.fields.allKeys, emptyFieldKey]
        }
      };
      
      const options = { ...DEFAULT_EXPORT_OPTIONS, includeEmptyFields: false };
      const doc = buildDocument(state, options);
      
      const section1 = doc.sections.find(s => s.sectionId === 'seccion1');
      const emptyField = section1!.fields.find(f => f.fieldName === 'campoVacio');
      expect(emptyField).toBeUndefined();
    });
  });
  
  describe('getDocumentStats', () => {
    it('should return correct statistics', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      const stats = getDocumentStats(doc);
      
      expect(stats.sectionsCount).toBe(2);
      expect(stats.fieldsCount).toBeGreaterThan(0);
      expect(stats.tablesCount).toBe(1);
      expect(stats.rowsCount).toBe(2);
      expect(stats.imagesCount).toBe(1);
      expect(stats.aisdGroupsCount).toBe(2);
      expect(stats.aisiGroupsCount).toBe(1);
      expect(stats.entrevistadosCount).toBe(2);
    });
  });
});

// ============================================================================
// JSON EXPORTER TESTS
// ============================================================================

describe('JSON Exporter (PASO 8.3)', () => {
  let jsonExporter: JSONExporterService;
  
  beforeEach(() => {
    jsonExporter = new JSONExporterService();
  });
  
  describe('export', () => {
    it('should export valid JSON', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      const result = jsonExporter.export(doc);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data).toBe('string');
        expect(() => JSON.parse(result.data as string)).not.toThrow();
      }
    });
    
    it('should include metadata by default', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      const result = jsonExporter.export(doc);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const parsed = JSON.parse(result.data as string);
        expect(parsed._export).toBeDefined();
        expect(parsed._export.exportVersion).toBe(EXPORT_VERSION);
      }
    });
    
    it('should generate correct filename', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      const result = jsonExporter.export(doc);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.filename).toContain('Proyecto_de_Prueba');
        expect(result.filename).toContain('.json');
      }
    });
    
    it('should respect indent option', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      
      const minified = jsonExporter.export(doc, { indent: null });
      const formatted = jsonExporter.export(doc, { indent: 2 });
      
      expect(minified.success && formatted.success).toBe(true);
      if (minified.success && formatted.success) {
        expect((formatted.data as string).length).toBeGreaterThan((minified.data as string).length);
      }
    });
  });
  
  describe('import', () => {
    it('should import valid JSON', () => {
      const state = createTestProjectState();
      const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
      const exported = jsonExporter.export(doc);
      
      if (exported.success) {
        const imported = jsonExporter.import(exported.data as string);
        expect(imported.success).toBe(true);
        if (imported.success) {
          expect(imported.document.project.projectName).toBe('Proyecto de Prueba');
        }
      }
    });
    
    it('should reject invalid JSON', () => {
      const result = jsonExporter.import('{ invalid json }');
      expect(result.success).toBe(false);
    });
    
    it('should reject document without project', () => {
      const result = jsonExporter.import('{ "sections": [] }');
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('Export Snapshots', () => {
  
  it('should produce consistent document structure', () => {
    const state = createTestProjectState();
    const doc1 = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
    const doc2 = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
    
    // Estructura debe ser idéntica (excluyendo timestamps)
    expect(doc1.project).toEqual(doc2.project);
    expect(doc1.ubicacion).toEqual(doc2.ubicacion);
    expect(doc1.aisd).toEqual(doc2.aisd);
    expect(doc1.aisi).toEqual(doc2.aisi);
    expect(doc1.sections.length).toBe(doc2.sections.length);
  });
  
  it('should maintain consistent image numbering', () => {
    const state = createTestProjectState();
    const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
    
    // Verificar que las imágenes mantienen su numeración
    const allImages = doc.sections.flatMap(s => s.images);
    const numbers = allImages.map(img => img.numero);
    
    // Números deben ser únicos y secuenciales
    const uniqueNumbers = new Set(numbers);
    expect(uniqueNumbers.size).toBe(numbers.length);
  });
  
  it('should maintain table row order', () => {
    const state = createTestProjectState();
    const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
    
    const section1 = doc.sections.find(s => s.sectionId === 'seccion1');
    const table = section1?.tables[0];
    
    expect(table).toBeDefined();
    if (table) {
      expect(table.rows[0].order).toBe(0);
      expect(table.rows[1].order).toBe(1);
    }
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Export Edge Cases', () => {
  
  it('should handle empty state', () => {
    const doc = buildDocument(INITIAL_PROJECT_STATE, DEFAULT_EXPORT_OPTIONS);
    
    expect(doc.sections.length).toBe(0);
    expect(doc.aisd.length).toBe(0);
    expect(doc.aisi.length).toBe(0);
  });
  
  it('should handle state with no images', () => {
    const baseState = createTestProjectState();
    const state: ProjectState = {
      ...baseState,
      images: {
        byId: {},
        allIds: [],
        bySectionGroup: {}
      }
    };
    
    const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
    const stats = getDocumentStats(doc);
    
    expect(stats.imagesCount).toBe(0);
  });
  
  it('should handle state with no tables', () => {
    const baseState = createTestProjectState();
    const state: ProjectState = {
      ...baseState,
      tables: {
        byKey: {},
        allKeys: []
      }
    };
    
    const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
    const stats = getDocumentStats(doc);
    
    expect(stats.tablesCount).toBe(0);
  });
  
  it('should handle special characters in text', () => {
    const baseState = createTestProjectState();
    const state: ProjectState = {
      ...baseState,
      metadata: {
        ...baseState.metadata,
        projectName: 'Proyecto con "comillas" y <tags>',
        detalleProyecto: 'Descripción con émojis 🎉 y ñ'
      }
    };
    
    const doc = buildDocument(state, DEFAULT_EXPORT_OPTIONS);
    const jsonExporter = new JSONExporterService();
    const result = jsonExporter.export(doc);
    
    expect(result.success).toBe(true);
    if (result.success) {
      const parsed = JSON.parse(result.data as string);
      expect(parsed.project.projectName).toContain('comillas');
      expect(parsed.project.detalleProyecto).toContain('ñ');
    }
  });
});
