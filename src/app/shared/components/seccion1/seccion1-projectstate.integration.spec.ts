/**
 * SECCION1 + PROJECT STATE INTEGRATION TESTS
 * 
 * Tests para verificar la integración de Sección 1 con ProjectState:
 * 1. JSON Format A → Selectors.getAISDGroups() devuelve datos
 * 2. JSON Format B → Grupos múltiples creados correctamente
 * 3. Ubicación se sincroniza al ProjectState
 */

import { UIStoreService, Selectors, Commands } from 'src/app/core/state/ui-store.contract';
import { ProjectState, INITIAL_PROJECT_STATE } from 'src/app/core/state/project-state.model';
import { rootReducer, createInitialState } from 'src/app/core/state/reducers';
import {
  createJSONProcessingBatch,
  normalizeJSON,
  NormalizedJSONResult
} from 'src/app/core/services/data/json-normalizer';
import { CentroPobladoData } from 'src/app/core/models/formulario.model';

// ============================================================================
// MOCK DATA
// ============================================================================

function createMockCCPP(overrides: Partial<CentroPobladoData> = {}): CentroPobladoData {
  return {
    ITEM: 1,
    UBIGEO: 40306,
    CODIGO: 403060001,
    CCPP: 'Cahuacho',
    CATEGORIA: 'Capital distrital',
    POBLACION: 160,
    DPTO: 'Arequipa',
    PROV: 'Caravelí',
    DIST: 'Cahuacho',
    ESTE: 663078,
    NORTE: 8285498,
    ALTITUD: 3423,
    ...overrides
  };
}

// Formato A: Array simple
const FORMAT_A_JSON: CentroPobladoData[] = [
  createMockCCPP({ ITEM: 1, CODIGO: 403060001, CCPP: 'Cahuacho' }),
  createMockCCPP({ ITEM: 2, CODIGO: 403060002, CCPP: 'Ayroca' }),
  createMockCCPP({ ITEM: 3, CODIGO: 403060003, CCPP: 'Yuracranra' })
];

// Formato B: Objeto con grupos (comunidades campesinas)
const FORMAT_B_JSON: Record<string, CentroPobladoData[]> = {
  'CC Ayroca': [
    createMockCCPP({ ITEM: 1, CODIGO: 403060005, CCPP: 'Ayroca' }),
    createMockCCPP({ ITEM: 2, CODIGO: 403060004, CCPP: 'Yuracranra' })
  ],
  'CCPP Sondor': [
    createMockCCPP({ ITEM: 3, CODIGO: 403060010, CCPP: 'Sondor Centro' }),
    createMockCCPP({ ITEM: 4, CODIGO: 403060011, CCPP: 'Sondor Alto' })
  ]
};

// ============================================================================
// SIMULATED STORE (para tests sin Angular DI completo)
// ============================================================================

class TestStore {
  private _state: ProjectState;

  constructor() {
    this._state = createInitialState();
  }

  dispatch(command: any): void {
    this._state = rootReducer(this._state, command);
  }

  getSnapshot(): ProjectState {
    return this._state;
  }

  select<T>(selector: (state: ProjectState) => T): T {
    return selector(this._state);
  }

  reset(): void {
    this._state = createInitialState();
  }
}

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Seccion1 + ProjectState Integration', () => {
  let store: TestStore;

  beforeEach(() => {
    store = new TestStore();
  });

  describe('Format A JSON Processing', () => {
    it('should create AISD groups from Format A JSON', () => {
      // Simular lo que hace Seccion1.onJSONFileSelected con Format A
      const { batch } = createJSONProcessingBatch(FORMAT_A_JSON, {
        fileName: 'test.json'
      });

      expect(batch).not.toBeNull();
      store.dispatch(batch!);

      // Verificar que Selectors.getAISDGroups() devuelve datos
      const aisdGroups = store.select(Selectors.getAISDGroups);
      
      expect(aisdGroups.length).toBe(1); // Format A crea un grupo default
      expect(aisdGroups[0].nombre).toBe('Cahuacho'); // Usa el distrito como nombre
    });

    it('should register all CCPP from Format A', () => {
      const { batch } = createJSONProcessingBatch(FORMAT_A_JSON);
      store.dispatch(batch!);

      const state = store.getSnapshot();
      
      // Verificar que los CCPP están en el registry
      expect(state.ccppRegistry.allIds.length).toBe(3);
    });

    it('should set ubicacion from Format A JSON', () => {
      const { batch } = createJSONProcessingBatch(FORMAT_A_JSON);
      store.dispatch(batch!);

      const ubicacion = store.select(Selectors.getUbicacion);
      
      expect(ubicacion.departamento).toBe('Arequipa');
      expect(ubicacion.provincia).toBe('Caravelí');
      expect(ubicacion.distrito).toBe('Cahuacho');
    });
  });

  describe('Format B JSON Processing', () => {
    it('should create multiple AISD groups from Format B JSON', () => {
      const { batch, result } = createJSONProcessingBatch(FORMAT_B_JSON, {
        fileName: 'comunidades.json'
      });

      expect(batch).not.toBeNull();
      expect(result.groups.length).toBe(2);
      
      store.dispatch(batch!);

      // Verificar que Selectors.getAISDGroups() devuelve los 2 grupos
      const aisdGroups = store.select(Selectors.getAISDGroups);
      
      expect(aisdGroups.length).toBe(2);
      
      // Verificar nombres de grupos (sin prefijo CC/CCPP)
      const nombres = aisdGroups.map(g => g.nombre);
      expect(nombres).toContain('Ayroca');
      expect(nombres).toContain('Sondor');
    });

    it('should assign CCPP to correct groups in Format B', () => {
      const { batch, result } = createJSONProcessingBatch(FORMAT_B_JSON);
      store.dispatch(batch!);

      const state = store.getSnapshot();
      
      // Verificar que cada grupo tiene sus CCPP asignados
      const ayrocaGroup = state.groupConfig.aisd.find(g => g.nombre === 'Ayroca');
      const sondorGroup = state.groupConfig.aisd.find(g => g.nombre === 'Sondor');

      expect(ayrocaGroup).toBeDefined();
      expect(sondorGroup).toBeDefined();
      expect(ayrocaGroup!.ccppIds.length).toBe(2);
      expect(sondorGroup!.ccppIds.length).toBe(2);
    });

    it('should register all CCPP from all groups in Format B', () => {
      const { batch } = createJSONProcessingBatch(FORMAT_B_JSON);
      store.dispatch(batch!);

      const state = store.getSnapshot();
      
      // 2 CCPP en Ayroca + 2 CCPP en Sondor = 4 total
      expect(state.ccppRegistry.allIds.length).toBe(4);
    });
  });

  describe('Metadata Updates', () => {
    it('should update projectName from fileName', () => {
      const { batch } = createJSONProcessingBatch(FORMAT_A_JSON, {
        fileName: 'proyecto_paka.json'
      });
      store.dispatch(batch!);

      const projectName = store.select(Selectors.getProjectName);
      expect(projectName).toBe('proyecto_paka');
    });

    it('should not update projectName without fileName', () => {
      const { batch } = createJSONProcessingBatch(FORMAT_A_JSON);
      store.dispatch(batch!);

      const projectName = store.select(Selectors.getProjectName);
      expect(projectName).toBe(''); // Debería quedar vacío
    });
  });

  describe('Selector Availability', () => {
    it('should allow Sección 2 to read groups without legacy', () => {
      // Simular que Sección 1 procesa JSON
      const { batch } = createJSONProcessingBatch(FORMAT_B_JSON);
      store.dispatch(batch!);

      // Simular lo que haría Sección 2: leer grupos directamente de selectores
      const aisdGroups = store.select(Selectors.getAISDGroups);
      const aisiGroups = store.select(Selectors.getAISIGroups);

      // Sección 2 debería poder ver los grupos AISD
      expect(aisdGroups.length).toBe(2);
      expect(aisiGroups.length).toBe(0); // No se crearon grupos AISI

      // Verificar que los grupos tienen la estructura esperada
      aisdGroups.forEach(group => {
        expect(group.id).toBeDefined();
        expect(group.nombre).toBeDefined();
        expect(typeof group.level).toBe('number');
      });
    });

    it('should provide ubicacion to other sections', () => {
      const { batch } = createJSONProcessingBatch(FORMAT_A_JSON);
      store.dispatch(batch!);

      const ubicacion = store.select(Selectors.getUbicacion);

      // Otras secciones deberían poder usar esta ubicación
      expect(ubicacion.departamento).toBeTruthy();
      expect(ubicacion.provincia).toBeTruthy();
    });

    it('should provide project info to all sections', () => {
      const { batch } = createJSONProcessingBatch(FORMAT_A_JSON, {
        fileName: 'mi_proyecto.json'
      });
      store.dispatch(batch!);

      const projectInfo = store.select(Selectors.getProjectInfo);

      expect(projectInfo.projectName).toBe('mi_proyecto');
    });
  });

  describe('State Consistency', () => {
    it('should maintain state after multiple JSON uploads', () => {
      // Primera carga
      const { batch: batch1 } = createJSONProcessingBatch(FORMAT_A_JSON, {
        fileName: 'first.json'
      });
      store.dispatch(batch1!);

      let groups = store.select(Selectors.getAISDGroups);
      expect(groups.length).toBe(1);

      // Segunda carga (simular otra subida)
      const { batch: batch2 } = createJSONProcessingBatch(FORMAT_B_JSON, {
        fileName: 'second.json'
      });
      store.dispatch(batch2!);

      // Verificar que los nuevos grupos se agregaron
      groups = store.select(Selectors.getAISDGroups);
      expect(groups.length).toBe(3); // 1 del primero + 2 del segundo
    });

    it('should track CCPP registry across uploads', () => {
      const { batch: batch1 } = createJSONProcessingBatch(FORMAT_A_JSON);
      store.dispatch(batch1!);

      let state = store.getSnapshot();
      expect(state.ccppRegistry.allIds.length).toBe(3);

      const { batch: batch2 } = createJSONProcessingBatch(FORMAT_B_JSON);
      store.dispatch(batch2!);

      state = store.getSnapshot();
      expect(state.ccppRegistry.allIds.length).toBe(7); // 3 + 4
    });
  });
});

// ============================================================================
// COMMAND VERIFICATION TESTS
// ============================================================================

describe('JSON Processing Commands Structure', () => {
  it('should generate correct command order', () => {
    const { batch } = createJSONProcessingBatch(FORMAT_B_JSON, {
      fileName: 'test.json'
    });

    expect(batch).not.toBeNull();

    const types = batch!.payload.commands.map(c => c.type);

    // Verificar que metadata viene primero (si hay)
    const metaIdx = types.indexOf('metadata/update');
    const ubicIdx = types.indexOf('project/setUbicacion');
    const ccppIdx = types.indexOf('groupConfig/registerCCPPBatch');
    const groupIdx = types.findIndex(t => t === 'groupConfig/addGroup');

    // El orden debe ser: metadata < ubicacion < ccpp < groups
    if (metaIdx >= 0) {
      expect(metaIdx).toBeLessThan(ubicIdx);
    }
    expect(ubicIdx).toBeLessThan(ccppIdx);
    expect(ccppIdx).toBeLessThan(groupIdx);
  });

  it('should have valid batch transactionId', () => {
    const { batch } = createJSONProcessingBatch(FORMAT_A_JSON, {
      transactionId: 'custom_tx_123'
    });

    expect(batch!.payload.transactionId).toBe('custom_tx_123');
  });

  it('should generate unique transactionId when not provided', async () => {
    const { batch: batch1 } = createJSONProcessingBatch(FORMAT_A_JSON);
    
    // Esperar un milisegundo para garantizar timestamp diferente
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const { batch: batch2 } = createJSONProcessingBatch(FORMAT_A_JSON);

    expect(batch1!.payload.transactionId).not.toBe(batch2!.payload.transactionId);
  });
});
