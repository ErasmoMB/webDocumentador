import { Injectable } from '@angular/core';
import { debugLog } from 'src/app/shared/utils/debug';

@Injectable({
  providedIn: 'root'
})
export class TableNumberingService {

  /**
   * NUMERACIÓN GLOBAL DINÁMICA - MULTI-SECCIÓN
   * 
   * Mantiene un registro de cuántas tablas tiene CADA SECCIÓN en el sistema.
   * Esto permite calcular números globales correctos incluso cuando
   * las secciones anteriores no estén cargadas en el DOM.
   */

  // Configuración: cuántas tablas tiene cada sección
  private sectionTableCounts = new Map<string, number>([
    ['3.1.1', 0],        // Sección 1: Identificación
    ['3.1.2', 0],        // Sección 2: Información General (Acceso)
    ['3.1.2.A', 0],      // Sección 2A: Información General (Acceso)
    ['3.1.2.B', 0],      // Sección 2B: Información General
    ['3.1.3', 1],        // Sección 3: Información General (Económica) - 1 tabla
    ['3.1.4.A1', 1],     // Sección 4A1: Características Económicas - 1 tabla
    ['3.1.4.A2', 1],     // Sección 4A2: Características Económicas - 1 tabla
    ['3.1.4.B.1', 0],    // Sección 5.1: Institucionalidad
    // Nota: '3.1.4.B' se registrará dinámicamente cuando se use para "Ubicación referencial" en AISI
    ['3.1.4.A.1.2', 2],  // Sección 6: Aspectos Demográficos - 2 tablas
    ['3.1.4.A.1.3', 3],  // Sección 7: Empleo e Ingresos - 3 tablas (PET, PEA, PEA Ocupada)
    // AISD (A.1.1 a A.1.20) - se registrarán dinámicamente
    // AISI (B.1.1 a B.1.15) - se registrarán dinámicamente
  ]);

  /**
   * Registra dinámicamente cuántas tablas tiene una sección
   * Evita duplicados: solo registra si no se ha registrado antes
   * (útil porque form y view pueden renderizar las mismas tablas)
   */
  registerSectionTableCount(sectionId: string, tableCount: number): void {
    const previous = this.sectionTableCounts.get(sectionId);
    
    // Solo actualizar si es la PRIMERA vez o si cambió el count
    if (previous === undefined || previous === 0) {
      this.sectionTableCounts.set(sectionId, tableCount);
      // 📋 Registrado: sectionId tiene tableCount tabla(s)
    } else if (previous !== tableCount) {
      // Si cambió el count, registrar el nuevo
      this.sectionTableCounts.set(sectionId, tableCount);
      // 📋 Actualizado: sectionId ahora tiene tableCount tabla(s) (antes previous)
    }
  }

  /**
   * Obtiene el número global de una tabla basado en:
   * - Todas las tablas de secciones anteriores (según orden jerárquico)
   * - El índice local dentro de esta sección
   */
  getGlobalTableNumber(sectionId: string, localIndexInSection: number): string {
    let globalIndex = 0;

    // ✅ ORDEN CORRECTO: Primero AISD, luego B (Ubicación CP), luego AISI
    const sectionOrder = [
      '3.1.1',        // Sección 1: Identificación
      '3.1.2',        // Sección 2: Información General (Acceso)
      '3.1.2.A',      // Sección 2A: Información General (Acceso)
      '3.1.2.B',      // Sección 2B: Información General
      '3.1.3',        // Sección 3: Información General (Económica)
      '3.1.4.A1',     // Sección 4A1: Características Económicas
      '3.1.4.A2',     // Sección 4A2: Características Económicas
      '3.1.4.B.1',    // Sección 5.1: Institucionalidad
      // ✅ AISD (A.1.1 a A.1.20) - TODAS PRIMERO
      '3.1.4.A.1.1',  // A.1.1 Institucionalidad
      '3.1.4.A.1.2',  // Sección 6: Aspectos Demográficos (AISD)
      '3.1.4.A.1.3',  // A.1.3
      '3.1.4.A.1.4',  // A.1.4
      '3.1.4.A.1.5',  // A.1.5
      '3.1.4.A.1.6',  // A.1.6
      '3.1.4.A.1.7',  // A.1.7
      '3.1.4.A.1.8',  // A.1.8
      '3.1.4.A.1.9',  // A.1.9
      '3.1.4.A.1.10', // A.1.10
      '3.1.4.A.1.11', // A.1.11
      '3.1.4.A.1.12', // A.1.12
      '3.1.4.A.1.13', // A.1.13
      '3.1.4.A.1.14', // A.1.14
      '3.1.4.A.1.15', // A.1.15
      '3.1.4.A.1.16', // A.1.16
      '3.1.4.A.1.17', // A.1.17
      '3.1.4.A.1.18', // A.1.18
      '3.1.4.A.1.19', // A.1.19
      '3.1.4.A.1.20', // A.1.20
      // ✅ AISI (B.1.1 a B.1.15) - DESPUÉS de todas las AISD
      // ⚠️ IMPORTANTE: B.1.15 debe estar ANTES de B para numeración secuencial correcta
      // B.1.15 tiene solo 1 tabla (Festividades), la segunda tabla (Mapa de actores) está en B.1.16
      '3.1.4.B.1.15', // B.1.15: Festividades (primera tabla = 3.36)
      // ✅ AISI: B (Ubicación referencial del CP) - ANTES de B.1.1 para numeración correcta
      '3.1.4.B',      // B: Ubicación referencial – Centro Poblado (viene después de B.1.15, antes de B.1.1)
      '3.1.4.B.1.1',  // B.1.1: Aspectos demográficos (primera tabla = 3.38, segunda = 3.39)
      '3.1.4.B.1.2',  // B.1.2: PET, PEA
      '3.1.4.B.1.3',  // B.1.3: PEA Ocupada
      '3.1.4.B.1.4',  // B.1.4: Vivienda
      '3.1.4.B.1.5',  // B.1.5: Servicios básicos
      '3.1.4.B.1.6',  // B.1.6: Telecomunicaciones
      '3.1.4.B.1.7',  // B.1.7: Salud y educación
      '3.1.4.B.1.8',  // B.1.8: Salud
      '3.1.4.B.1.9',  // B.1.9: Educación
      '3.1.4.B.1.10', // B.1.10: Lenguas y religión
      '3.1.4.B.1.11', // B.1.11: (reservado)
      '3.1.4.B.1.12', // B.1.12: IDH
      '3.1.4.B.1.13', // B.1.13: NBI
      '3.1.4.B.1.14', // B.1.14: Autoridades
      '3.1.4.B.1.16', // B.1.16: Mapa de actores (segunda tabla de B.1.15, viene después de todas las demás)
      // ✅ AISI: B (Ubicación referencial del CP) - YA INCLUIDO ANTES
    ];

    // Encontrar el índice de la sección actual
    const currentSectionIndex = sectionOrder.indexOf(sectionId);
    if (currentSectionIndex === -1) {
      console.warn(`⚠️ Sección desconocida: ${sectionId}`);
      return '';
    }

    // Sumar TODAS las tablas de secciones anteriores
    for (let i = 0; i < currentSectionIndex; i++) {
      const prevSectionId = sectionOrder[i];
      const tableCount = this.sectionTableCounts.get(prevSectionId) || 0;
      globalIndex += tableCount;
    }

    // Añadir el índice local dentro de esta sección
    globalIndex += localIndexInSection;

    // 🔍 DEBUG: Solo para 3.1.4.B (Ubicación referencial)
    if (sectionId === '3.1.4.B') {
      debugLog(`[NUMERACIÓN] 🔍 Calculando número para ${sectionId}:`, {
        currentSectionIndex,
        seccionesAnteriores: sectionOrder.slice(0, currentSectionIndex),
        tableCountsAnteriores: sectionOrder.slice(0, currentSectionIndex).map(id => ({
          id,
          count: this.sectionTableCounts.get(id) || 0
        })),
        globalIndexAntes: globalIndex - localIndexInSection,
        localIndexInSection,
        globalIndexFinal: globalIndex,
        numeroFinal: `3.${globalIndex + 1}`
      });
    }

    // 📊 getGlobalTableNumber: sectionId[localIndexInSection] → Índice global = globalIndex → 3.{globalIndex + 1}

    // Retornar número global: primera tabla = 3.1, segunda = 3.2, etc.
    return `3.${globalIndex + 1}`;
  }
}

