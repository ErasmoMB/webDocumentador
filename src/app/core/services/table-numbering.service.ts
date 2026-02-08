import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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
    ['3.1.4.A.1.1', 1],  // A.1.1 Institucionalidad - 1 tabla (corregido)
    ['3.1.4.A.1.2', 2],  // Sección 6: Aspectos Demográficos - 2 tablas
    ['3.1.4.A.1.3', 3],  // Sección 7: Empleo e Ingresos - 3 tablas (PET, PEA, PEA Ocupada)
    ['3.1.4.A.1.4', 3],  // Sección 8: Actividades Económicas - 3 tablas (PEA, Ganadería, Agricultura)
    ['3.1.4.A.1.5', 2],  // Sección 9: Viviendas - 2 tablas (Condición de Ocupación, Tipos de Materiales)
    ['3.1.4.A.1.6', 4],  // Sección 10: A.1.6 - 4 tablas (Agua, Saneamiento, Electricidad, Energía para cocinar)
    ['3.1.4.A.1.7', 1],  // Sección 11: A.1.7 - 1 tabla (Telecomunicaciones)
    ['3.1.4.A.1.8', 6],  // Sección 12: A.1.8 - 6 tablas (salud, estudiantes, IE Ayroca, IE 40270, alumnos Ayroca, alumnos 40270)
    ['3.1.4.A.1.9', 3],  // A.1.9 - 3 tablas (Natalidad/Mortalidad, Morbilidad, Seguros)
    ['3.1.4.A.1.10', 2], // A.1.10 - 2 tablas (Nivel educativo, Analfabetismo)
    ['3.1.4.A.1.11', 2], // A.1.11 - 2 tablas (Lenguas maternas, Religión)
    ['3.1.4.A.1.12', 0], // A.1.12 - 0 tablas (Uso de suelos)
    ['3.1.4.A.1.13', 1], // A.1.13 (seccion17 - IDH) - 1 tabla
    ['3.1.4.A.1.14', 2], // A.1.14 - 2 tablas (NBI CC, NBI Distrito)
    ['3.1.4.A.1.15', 1], // A.1.15 - 1 tabla (Autoridades)
    ['3.1.4.A.1.16', 1], // A.1.16 - 1 tabla (Festividades)
    // === AISI (secciones B y B.1.x) ===
    ['3.1.4.B.1', 1],  // B.1: Centro Poblado - 1 tabla (Ubicación referencial)
    ['3.1.4.B.1.1', 2],  // B.1.1: Aspectos demográficos - 2 tablas (Sexo, Grupo etario)
    ['3.1.4.B.1.2', 3],  // B.1.2: PET, PEA - 3 tablas (PET, PEA/No PEA, PEA Ocupada)
    ['3.1.4.B.1.3', 0],  // B.1.3: PEA Ocupada - 0 tablas
    ['3.1.4.B.1.4', 3],  // B.1.4: Vivienda - 3 tablas (Tipos, Condición, Materiales)
    ['3.1.4.B.1.5', 4],  // B.1.5: Servicios básicos - 4 tablas (Agua, Saneamiento, Electricidad, Combustibles)
    ['3.1.4.B.1.6', 1],  // B.1.6: Telecomunicaciones - 1 tabla
    ['3.1.4.B.1.7', 2],  // B.1.7: Salud y educación - 2 tablas (Salud, Educación)
    ['3.1.4.B.1.8', 3],  // B.1.8: Salud - 3 tablas (Natalidad/Mortalidad, Morbilidad, Seguros)
    ['3.1.4.B.1.9', 2],  // B.1.9: Educación - 2 tablas (Nivel educativo, Analfabetismo)
    ['3.1.4.B.1.10', 2], // B.1.10: Lenguas y religión - 2 tablas (Lenguas, Religión)
    ['3.1.4.B.1.11', 0], // B.1.11: (reservado) - 0 tablas
    ['3.1.4.B.1.12', 1], // B.1.12: IDH - 1 tabla
    ['3.1.4.B.1.13', 2], // B.1.13: NBI - 2 tablas (NBI Población, NBI Tipos)
    ['3.1.4.B.1.14', 1], // B.1.14: Autoridades - 1 tabla
    ['3.1.4.B.1.15', 1], // B.1.15: Festividades - 1 tabla
    ['3.1.4.B.1.16', 1], // B.1.16: Mapa de actores - 1 tabla
  ]);

  // ORDEN DE SECCIONES (fuente de verdad para la numeración global)
  // Extraído para uso en tests y para mantener un único punto de mantenimiento.
  private readonly sectionOrder: string[] = [
    // === AISD (secciones 1-20) ===
    '3.1.1',        // Sección 1: Identificación
    '3.1.2',        // Sección 2: Información General (Acceso)
    '3.1.2.A',      // Sección 2A: Información General (Acceso)
    '3.1.2.B',      // Sección 2B: Información General
    '3.1.3',        // Sección 3: Información General (Económica)
    '3.1.4.A1',     // Sección 4A1: Características Económicas
    '3.1.4.A2',     // Sección 4A2: Características Económicas
    '3.1.4.A.1.1',  // A.1.1 Institucionalidad
    '3.1.4.A.1.2',  // Sección 6: Aspectos Demográficos (AISD)
    '3.1.4.A.1.3',  // Sección 7: Empleo e Ingresos (A.1.3)
    '3.1.4.A.1.4',  // Sección 8: Actividades Económicas (A.1.4)
    '3.1.4.A.1.5',  // Sección 9: Viviendas (A.1.5)
    '3.1.4.A.1.6',  // A.1.6
    '3.1.4.A.1.7',  // A.1.7
    '3.1.4.A.1.8',  // A.1.8
    '3.1.4.A.1.9',  // A.1.9
    '3.1.4.A.1.10', // A.1.10
    '3.1.4.A.1.11', // A.1.11
    '3.1.4.A.1.12', // A.1.12
    '3.1.4.A.1.13', // A.1.13 (seccion17 - IDH)
    '3.1.4.A.1.14', // A.1.14
    '3.1.4.A.1.15', // A.1.15
    '3.1.4.A.1.16', // A.1.16 (última sección AISD)
    // === AISI (secciones B y B.1.x) ===
    '3.1.4.B.1',   // B.1: Centro Poblado
    '3.1.4.B.1.1', // B.1.1: Aspectos demográficos
    '3.1.4.B.1.2', // B.1.2: PET, PEA
    '3.1.4.B.1.3', // B.1.3: PEA Ocupada
    '3.1.4.B.1.4', // B.1.4: Vivienda
    '3.1.4.B.1.5', // B.1.5: Servicios básicos
    '3.1.4.B.1.6', // B.1.6: Telecomunicaciones
    '3.1.4.B.1.7', // B.1.7: Salud y educación
    '3.1.4.B.1.8', // B.1.8: Salud
    '3.1.4.B.1.9', // B.1.9: Educación
    '3.1.4.B.1.10', // B.1.10: Lenguas y religión
    '3.1.4.B.1.11', // B.1.11: (reservado)
    '3.1.4.B.1.12', // B.1.12: IDH
    '3.1.4.B.1.13', // B.1.13: NBI
    '3.1.4.B.1.14', // B.1.14: Autoridades
    '3.1.4.B.1.15', // B.1.15: Festividades
    '3.1.4.B.1.16', // B.1.16: Mapa de actores
  ];

  /**
   * Normaliza `sectionId` para soportar typos históricos y alias comunes.
   *
   * - Si `sectionId` ya es reconocido, se retorna tal cual.
   * - Si no, se aplica un mapeo de alias conocidos (ej. '3.1.7' → '3.1.4.A.1.3').
   * - En caso de no encontrar una correspondencia, devuelve el `sectionId` original.
   */
  // Stream reactivo: emite cuando cambia la configuración de tablas (útil para componentes que deben recacular su número)
  private readonly _changes = new BehaviorSubject<void>(undefined);
  public readonly changes$ = this._changes.asObservable();
  public normalizeSectionId(sectionId: string): string {
    if (!sectionId || typeof sectionId !== 'string') return sectionId;

    // Si ya existe tal cual, devolverlo
    if (this.sectionTableCounts.has(sectionId)) return sectionId;

    // Mapeo explícito de alias/typos históricos a su sección correcta
    const aliasMap = new Map<string, string>([
      ['3.1.7', '3.1.4.A.1.3'],
      ['3.1.7.A.1.3', '3.1.4.A.1.3']
    ]);

    if (aliasMap.has(sectionId)) return aliasMap.get(sectionId)!;

    // Heurística adicional: si comienza con un alias conocido, mapearlo
    for (const [alias, target] of aliasMap.entries()) {
      if (sectionId.startsWith(alias)) return target;
    }

    // No se encontró correspondencia; devolver original
    return sectionId;
  }

  /**
   * Registra dinámicamente cuántas tablas tiene una sección
   * Evita duplicados: solo registra si no se ha registrado antes
   * (útil porque form y view pueden renderizar las mismas tablas)
   */
  registerSectionTableCount(sectionId: string, tableCount: number): void {
    const normalized = this.normalizeSectionId(sectionId);
    const previous = this.sectionTableCounts.get(normalized);

    // Si hubo normalización, dejar rastro en debug
    if (normalized !== sectionId) {
      debugLog(`[NUMERACIÓN] ⚠️ Normalizado sectionId: ${sectionId} → ${normalized}`);
    }

    // Solo actualizar si es la PRIMERA vez o si cambió el count
    if (previous === undefined || previous === 0) {
      this.sectionTableCounts.set(normalized, tableCount);
      // 📋 Registrado: sectionId tiene tableCount tabla(s)
      this._changes.next();
    } else if (previous !== tableCount) {
      // Si cambió el count, registrar el nuevo
      this.sectionTableCounts.set(normalized, tableCount);
      // 📋 Actualizado: sectionId ahora tiene tableCount tabla(s) (antes previous)
      this._changes.next();
    }
  }

  /**
   * Obtiene el número global de una tabla basado en:
   * - Todas las tablas de secciones anteriores (según orden jerárquico)
   * - El índice local dentro de esta sección
   */
  getGlobalTableNumber(sectionId: string, localIndexInSection: number): string {
    let globalIndex = 0;

    // Use the canonical section order via the class-level source of truth
    const sectionOrder = this.getSectionOrder();

    // Normalizar sectionId antes de buscar su índice
    const normalizedSectionId = this.normalizeSectionId(sectionId);

    // Encontrar el índice de la sección actual (usar el orden centralizado)
    const currentSectionIndex = sectionOrder.indexOf(normalizedSectionId);
    if (currentSectionIndex === -1) {
      // Aviso en debug para detectar sectionIds no válidos
      debugLog(`[NUMERACIÓN] ⚠️ SectionId desconocido: "${sectionId}" (normalizado: "${normalizedSectionId}")`);
      return '';
    }

    // Sumar TODAS las tablas de secciones anteriores (normalizando cada id)
    for (let i = 0; i < currentSectionIndex; i++) {
      const prevSectionId = sectionOrder[i];
      const normalizedPrev = this.normalizeSectionId(prevSectionId);
      const tableCount = this.sectionTableCounts.get(normalizedPrev) || 0;
      globalIndex += tableCount;
    }

    // Añadir el índice local dentro de esta sección
    globalIndex += localIndexInSection;



    // 📊 getGlobalTableNumber: sectionId[localIndexInSection] → Índice global = globalIndex → 3.{globalIndex + 1}

    // Retornar número global: primera tabla = 3.1, segunda = 3.2, etc.
    return `3.${globalIndex + 1}`;
  }

  // --- API helpers (útiles para tests y para la integración reactiva) ---

  /** Retorna una copia del orden de secciones */
  public getSectionOrder(): string[] { return [...this.sectionOrder]; }

  /** Retorna cuántas tablas tiene la sección (normalizando el ID primero) */
  public getSectionTableCount(sectionId: string): number | undefined {
    return this.sectionTableCounts.get(this.normalizeSectionId(sectionId));
  }
}



