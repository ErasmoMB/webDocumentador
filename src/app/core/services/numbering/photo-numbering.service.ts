import { Injectable } from '@angular/core';
import { ProjectStateFacade } from '../../state/project-state.facade';
import { FormChangeService } from '../state/form-change.service';
import { GlobalNumberingService } from './global-numbering.service';

/**
 * PhotoNumberingService - Servicio para numeración de fotografías
 * 
 * ✅ FASE 4: Migrado a usar solo ProjectStateFacade
 * ✅ FASE 5: Delega a GlobalNumberingService para grupos AISI dinámicos (B.2, B.3, etc.)
 */
@Injectable({
  providedIn: 'root'
})
export class PhotoNumberingService {

  private readonly allSections = [
    { id: '3.1.1', prefixes: ['fotografiaSeccion1'], order: 1, hasGroup: false },
    { id: '3.1.2', prefixes: ['fotografiaSeccion2'], order: 2, hasGroup: false },
    { id: '3.1.3', prefixes: ['fotografiaSeccion3'], order: 3, hasGroup: false },
    { id: '3.1.4.A', prefixes: ['fotografiaAISD', 'fotografiaAISD2', 'fotografiaUbicacionReferencial', 'fotografiaPoblacionViviendas'], order: 4, hasGroup: true },
    { id: '3.1.4.A.1', prefixes: ['fotografiaAISD', 'fotografiaAISD2', 'fotografiaUbicacionReferencial', 'fotografiaPoblacionViviendas'], order: 4, hasGroup: true },
    { id: '3.1.4.B.1', prefixes: ['fotografiaCahuacho'], order: 21, hasGroup: true },
    { id: '3.1.4.A.1.1', prefixes: ['fotografiaInstitucionalidad'], order: 5, hasGroup: true },
    { id: '3.1.4.B.1.1', prefixes: ['fotografiaCahuachoB11'], order: 22, hasGroup: true },
    { id: '3.1.4.A.1.2', prefixes: ['fotografiaDemografia'], order: 6, hasGroup: true },
    { id: '3.1.4.B.1.2', prefixes: ['fotografiaPEA'], order: 23, hasGroup: true },
    { id: '3.1.4.A.2', prefixes: ['fotografiaAISD', 'fotografiaAISD2', 'fotografiaUbicacionReferencial', 'fotografiaPoblacionViviendas'], order: 4, hasGroup: true },
    { id: '3.1.4.B.2', prefixes: ['fotografiaDemografia'], order: 6, hasGroup: true },
    { id: '3.1.4.A.1.3', prefixes: ['fotografiaPEA'], order: 7, hasGroup: true },
    { id: '3.1.4.B.1.3', prefixes: ['fotografiaCahuachoB13'], order: 24, hasGroup: true },
    { id: '3.1.4.A.3', prefixes: ['fotografiaPEA'], order: 7, hasGroup: true },
    { id: '3.1.4.B.3', prefixes: ['fotografiaPEA'], order: 7, hasGroup: true },
    { id: '3.1.4.A.1.4', prefixes: ['fotografiaGanaderia', 'fotografiaAgricultura', 'fotografiaComercio'], order: 8, hasGroup: true },
    { id: '3.1.4.B.1.4', prefixes: ['fotografiaCahuachoB14'], order: 25, hasGroup: true },
    { id: '3.1.4.A.4', prefixes: ['fotografiaGanaderia', 'fotografiaAgricultura', 'fotografiaComercio'], order: 8, hasGroup: true },
    { id: '3.1.4.B.4', prefixes: ['fotografiaGanaderia', 'fotografiaAgricultura', 'fotografiaComercio'], order: 8, hasGroup: true },
    { id: '3.1.4.A.1.5', prefixes: ['fotografiaEstructura'], order: 9, hasGroup: true },
    { id: '3.1.4.B.1.5', prefixes: ['fotografiaCahuachoB15', 'fotografiaDesechosSolidosAISI', 'fotografiaElectricidadAISI', 'fotografiaEnergiaCocinarAISI'], order: 26, hasGroup: true },
    { id: '3.1.4.A.5', prefixes: ['fotografiaEstructura'], order: 9, hasGroup: true },
    { id: '3.1.4.B.5', prefixes: ['fotografiaEstructura'], order: 9, hasGroup: true },
    { id: '3.1.4.A.1.6', prefixes: ['fotografiaDesechosSolidos', 'fotografiaElectricidad'], order: 10, hasGroup: true },
    { id: '3.1.4.B.1.6', prefixes: ['fotografiaCahuachoB16', 'fotografiaTransporteAISI', 'fotografiaTelecomunicacionesAISI'], order: 27, hasGroup: true },
    { id: '3.1.4.A.6', prefixes: ['fotografiaDesechosSolidos', 'fotografiaElectricidad'], order: 10, hasGroup: true },
    { id: '3.1.4.B.6', prefixes: ['fotografiaDesechosSolidos', 'fotografiaElectricidad'], order: 10, hasGroup: true },
    { id: '3.1.4.A.1.7', prefixes: ['fotografiaTransporte', 'fotografiaTelecomunicaciones'], order: 11, hasGroup: true },
    { id: '3.1.4.B.1.7', prefixes: ['fotografiaCahuachoB17', 'fotografiaSaludAISI', 'fotografiaEducacionAISI', 'fotografiaRecreacionAISI', 'fotografiaDeporteAISI'], order: 28, hasGroup: true },
    { id: '3.1.4.A.7', prefixes: ['fotografiaTransporte', 'fotografiaTelecomunicaciones'], order: 11, hasGroup: true },
    { id: '3.1.4.B.7', prefixes: ['fotografiaTransporte', 'fotografiaTelecomunicaciones'], order: 11, hasGroup: true },
    { id: '3.1.4.A.1.8', prefixes: ['fotografiaSalud', 'fotografiaIEAyroca', 'fotografiaIE40270', 'fotografiaRecreacion', 'fotografiaDeporte'], order: 12, hasGroup: true },
    { id: '3.1.4.B.1.8', prefixes: ['fotografiaCahuachoB18'], order: 29, hasGroup: true },
    { id: '3.1.4.A.8', prefixes: ['fotografiaSalud', 'fotografiaIEAyroca', 'fotografiaIE40270', 'fotografiaRecreacion', 'fotografiaDeporte'], order: 12, hasGroup: true },
    { id: '3.1.4.B.8', prefixes: ['fotografiaSalud', 'fotografiaIEAyroca', 'fotografiaIE40270', 'fotografiaRecreacion', 'fotografiaDeporte'], order: 12, hasGroup: true },
    { id: '3.1.4.A.1.9', prefixes: ['fotografiaSaludIndicadores'], order: 13, hasGroup: true },
    { id: '3.1.4.B.1.9', prefixes: ['fotografiaCahuachoB19'], order: 30, hasGroup: true },
    { id: '3.1.4.A.9', prefixes: ['fotografiaSaludIndicadores'], order: 13, hasGroup: true },
    { id: '3.1.4.B.9', prefixes: ['fotografiaSaludIndicadores'], order: 13, hasGroup: true },
    { id: '3.1.4.A.1.10', prefixes: ['fotografiaEducacionIndicadores'], order: 14, hasGroup: true },
    { id: '3.1.4.B.1.10', prefixes: ['fotografiaEducacionIndicadores'], order: 14, hasGroup: true },
    { id: '3.1.4.A.10', prefixes: ['fotografiaEducacionIndicadores'], order: 14, hasGroup: true },
    { id: '3.1.4.B.10', prefixes: ['fotografiaEducacionIndicadores'], order: 14, hasGroup: true },
    { id: '3.1.4.A.1.11', prefixes: ['fotografiaIglesia'], order: 15, hasGroup: true },
    { id: '3.1.4.B.1.11', prefixes: ['fotografiaIglesia'], order: 15, hasGroup: true },
    { id: '3.1.4.A.11', prefixes: ['fotografiaIglesia'], order: 15, hasGroup: true },
    { id: '3.1.4.B.11', prefixes: ['fotografiaIglesia'], order: 15, hasGroup: true },
    { id: '3.1.4.A.1.12', prefixes: ['fotografiaReservorio', 'fotografiaUsoSuelos'], order: 16, hasGroup: true },
    { id: '3.1.4.B.1.12', prefixes: ['fotografiaReservorio', 'fotografiaUsoSuelos'], order: 16, hasGroup: true },
    { id: '3.1.4.A.12', prefixes: ['fotografiaReservorio', 'fotografiaUsoSuelos'], order: 16, hasGroup: true },
    { id: '3.1.4.B.12', prefixes: ['fotografiaReservorio', 'fotografiaUsoSuelos'], order: 16, hasGroup: true },
    { id: '3.1.4.A.1.13', prefixes: ['fotografiaIDH'], order: 17, hasGroup: true },
    { id: '3.1.4.B.1.13', prefixes: ['fotografiaIDH'], order: 17, hasGroup: true },
    { id: '3.1.4.A.13', prefixes: ['fotografiaIDH'], order: 17, hasGroup: true },
    { id: '3.1.4.B.13', prefixes: ['fotografiaIDH'], order: 17, hasGroup: true },
    { id: '3.1.4.A.1.14', prefixes: ['fotografiaNBI'], order: 18, hasGroup: true },
    { id: '3.1.4.B.1.14', prefixes: ['fotografiaNBI'], order: 18, hasGroup: true },
    { id: '3.1.4.A.14', prefixes: ['fotografiaNBI'], order: 18, hasGroup: true },
    { id: '3.1.4.B.14', prefixes: ['fotografiaNBI'], order: 18, hasGroup: true },
    { id: '3.1.4.A.1.15', prefixes: ['fotografiaOrganizacionSocial'], order: 19, hasGroup: true },
    { id: '3.1.4.B.1.15', prefixes: ['fotografiaOrganizacionSocial'], order: 19, hasGroup: true },
    { id: '3.1.4.A.15', prefixes: ['fotografiaOrganizacionSocial'], order: 19, hasGroup: true },
    { id: '3.1.4.B.15', prefixes: ['fotografiaOrganizacionSocial'], order: 19, hasGroup: true },
    { id: '3.1.4.A.1.16', prefixes: ['fotografiaFestividades'], order: 20, hasGroup: true },
    { id: '3.1.4.B.1.16', prefixes: ['fotografiaFestividades'], order: 20, hasGroup: true },
    { id: '3.1.4.A.16', prefixes: ['fotografiaFestividades'], order: 20, hasGroup: true },
    { id: '3.1.4.B.16', prefixes: ['fotografiaFestividades'], order: 20, hasGroup: true }
  ];

  constructor(
    private projectFacade: ProjectStateFacade,
    private formChange: FormChangeService,
    private globalNumbering: GlobalNumberingService
  ) {
    this.printConfigurationSummary();
  }

  private printConfigurationSummary() {
    const sections = [
      { name: 'Sección 1', order: 1, ids: ['3.1.1'] },
      { name: 'Sección 2', order: 2, ids: ['3.1.2'] },
      { name: 'Sección 3', order: 3, ids: ['3.1.3'] },
      { name: 'Sección 4', order: 4, ids: ['3.1.4.A', '3.1.4.B'] },
      { name: 'Sección 5', order: 5, ids: ['3.1.4.A.1', '3.1.4.A.1.1'] },
      { name: 'Sección 6', order: 6, ids: ['3.1.4.A.2', '3.1.4.A.1.2'] },
      { name: 'Sección 7', order: 7, ids: ['3.1.4.A.3', '3.1.4.A.1.3'] },
      { name: 'Sección 8', order: 8, ids: ['3.1.4.A.4', '3.1.4.A.1.4'] },
      { name: 'Sección 9', order: 9, ids: ['3.1.4.A.5', '3.1.4.A.1.5'] },
      { name: 'Sección 10', order: 10, ids: ['3.1.4.A.6', '3.1.4.A.1.6'] },
      { name: 'Sección 11', order: 11, ids: ['3.1.4.A.7', '3.1.4.A.1.7'] },
      { name: 'Sección 12', order: 12, ids: ['3.1.4.A.8', '3.1.4.A.1.8'] },
      { name: 'Sección 13', order: 13, ids: ['3.1.4.A.9', '3.1.4.A.1.9'] },
      { name: 'Sección 14', order: 14, ids: ['3.1.4.A.10', '3.1.4.A.1.10'] },
      { name: 'Sección 15', order: 15, ids: ['3.1.4.A.11', '3.1.4.A.1.11'] },
      { name: 'Sección 16', order: 16, ids: ['3.1.4.A.12', '3.1.4.A.1.12'] },
      { name: 'Sección 17', order: 17, ids: ['3.1.4.A.13', '3.1.4.A.1.13'] },
      { name: 'Sección 18', order: 18, ids: ['3.1.4.A.14', '3.1.4.A.1.14'] },
      { name: 'Sección 19', order: 19, ids: ['3.1.4.A.15', '3.1.4.A.1.15'] },
      { name: 'Sección 20', order: 20, ids: ['3.1.4.A.16', '3.1.4.A.1.16'] },
      { name: 'Sección 21 (AISI)', order: 21, ids: ['3.1.4.B.1'] },
      { name: 'Sección 22 (AISI)', order: 22, ids: ['3.1.4.B.1.1'] },
      { name: 'Sección 23 (AISI)', order: 23, ids: ['3.1.4.B.1.2'] },
      { name: 'Sección 24 (AISI)', order: 24, ids: ['3.1.4.B.1.3'] },
      { name: 'Sección 25 (AISI)', order: 25, ids: ['3.1.4.B.1.4'] }
    ];

    sections.forEach(section => {
      const config = this.getSectionConfig(section.ids[0]);
    });
  }

  private getSectionConfig(sectionId: string) {
    const exactMatch = this.allSections.find(s => s.id === sectionId);
    if (exactMatch) return exactMatch;
    
    const matches = this.allSections.filter(s => sectionId.startsWith(s.id));
    if (matches.length === 0) return undefined;
    
    matches.sort((a, b) => b.id.length - a.id.length);
    return matches[0];
  }

  private isValidImage(imagen: any): boolean {
    if (!imagen) return false;
    if (typeof imagen === 'string') {
      return imagen !== 'null' && imagen.trim() !== '' && (imagen.startsWith('data:image') || imagen.length > 100);
    }
    if (imagen instanceof File) {
      return imagen.type.startsWith('image/');
    }
    return false;
  }

  private countPhotosInSectionByPrefixes(prefixes: string[], hasGroup: boolean, specificGroupSuffix: string = ''): number {
    const datos = this.projectFacade.obtenerDatos();
    let count = 0;

    // Include base (no numbered suffix) when searching group suffixes.
    const groupSuffixes = specificGroupSuffix ? [specificGroupSuffix] : 
                          hasGroup ? ['', '_A1', '_A2', '_A3', '_A4', '_A5', '_A6', '_A7', '_A8', '_A9', '_A10', '_B1', '_B2', '_B3', '_B4', '_B5', '_B6', '_B7', '_B8', '_B9', '_B10'] : [''];

    for (const prefix of prefixes) {
      for (const groupSuffix of groupSuffixes) {
        // First, check numbered slots (preferred). If any numbered slot exists, count them.
        let numberedFound = false;
        for (let i = 1; i <= 10; i++) {
          const imagenKey = `${prefix}${i}Imagen${groupSuffix}`;
          const imagen = datos[imagenKey];
          if (this.isValidImage(imagen)) {
            count++;
            numberedFound = true;
          }
        }

        // If no numbered images, check base key (e.g., fotografiaXImagen or fotografiaXImagen_B1)
        if (!numberedFound) {
          const baseKey = `${prefix}Imagen${groupSuffix}`;
          const baseImg = datos[baseKey];
          if (this.isValidImage(baseImg)) {
            count++;
          }
        }
      }
    }

    return count;
  }

  getGlobalPhotoNumber(
    sectionId: string,
    photoIndexInSection: number,
    prefix: string,
    groupPrefix: string = ''
  ): string {
    // ✅ NUEVO: Delegar a GlobalNumberingService para secciones AISI dinámicas (B.2, B.3, etc.)
    if (sectionId.includes('.B.')) {
      const prefijoGrupo = groupPrefix || this.extractGroupSuffix(sectionId);
      console.log(`[PHOTO-NUM] Delegando a GlobalNumberingService: sectionId=${sectionId}, prefix=${prefix}, groupPrefix=${prefijoGrupo}`);
      return this.globalNumbering.getGlobalPhotoNumber(sectionId, prefijoGrupo, photoIndexInSection);
    }
    
    // ✅ Lógica original para secciones no-AISI (3.1.1, 3.1.2, 3.1.3, AISD)
    const currentSection = this.getSectionConfig(sectionId);
    
    if (!currentSection) {
      return '';
    }

    let globalIndex = 0;
    const processedSections = new Set<string>();
    const specificGroupSuffix = groupPrefix || this.extractGroupSuffix(sectionId);

    const sortedSections = [...this.allSections].sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.id.localeCompare(b.id);
    });

    for (const section of sortedSections) {
      if (section.order < currentSection.order && !processedSections.has(section.id)) {
        const sectionGroupSuffix = section.hasGroup ? this.extractGroupSuffix(section.id) : '';
        const count = this.countPhotosInSectionByPrefixes(section.prefixes, section.hasGroup, sectionGroupSuffix);
        globalIndex += count;
        processedSections.add(section.id);
      } 
      else if (section.order === currentSection.order && section.id !== currentSection.id) {
        const isSisterSection = this.isSisterSection(section.id, currentSection.id);
        if (isSisterSection) {
          const sectionGroupSuffix = this.extractGroupSuffix(section.id);
          const count = this.countPhotosInSectionByPrefixes(section.prefixes, section.hasGroup, sectionGroupSuffix);
          globalIndex += count;
        }
      }
      else if (section.id === currentSection.id) {
        if (prefix) {
          // If the prefix is explicitly listed in section config, respect its position.
          if (currentSection.prefixes.length > 1 && currentSection.prefixes.includes(prefix)) {
            const currentPrefixIndex = currentSection.prefixes.indexOf(prefix);
            if (currentPrefixIndex > 0) {
              const previousPrefixes = currentSection.prefixes.slice(0, currentPrefixIndex);
              for (const prevPrefix of previousPrefixes) {
                const count = this.countPhotosInSectionByPrefixes([prevPrefix], currentSection.hasGroup, specificGroupSuffix);
                globalIndex += count;
              }
            }
          } else {
            // Prefix is not in the config list (likely a subgroup like 'fotografiaMercado').
            // Discover all fotografia* prefixes that belong to this section (using specificGroupSuffix).
            const datos = this.projectFacade.obtenerDatos();
            const discovered = new Set<string>();
            const suffix = `Imagen${specificGroupSuffix}`;

            Object.keys(datos).forEach(k => {
              if (!k.endsWith(suffix)) return;

              // Prefer configured prefixes (deterministic)
              for (const p of currentSection.prefixes) {
                if (k.startsWith(p)) { discovered.add(p); return; }
              }

              // Fallback: strip trailing digits immediately before 'Imagen' (slot numbers)
              const fallbackMatch = k.match(/^(fotografia[A-Za-z0-9_]*?)(\d+)Imagen/);
              if (fallbackMatch && fallbackMatch[1]) {
                discovered.add(fallbackMatch[1]);
                return;
              }

              // Last resort: capture base 'fotografiaXXX' before 'Imagen'
              const baseMatch = k.match(/^(fotografia[A-Za-z0-9_]*?)Imagen/);
              if (baseMatch && baseMatch[1]) discovered.add(baseMatch[1]);
            });

            // Include known prefixes from config as well for deterministic ordering
            currentSection.prefixes.forEach(p => discovered.add(p));

            // Sort deterministically (alphabetical) and accumulate counts until target prefix
            const ordered = Array.from(discovered).sort();

            for (const p of ordered) {
              if (p === prefix) break;
              const c = this.countPhotosInSectionByPrefixes([p], currentSection.hasGroup, specificGroupSuffix);
              globalIndex += c;
            }
          }
        }

        globalIndex += photoIndexInSection + 1;
        break;
      }
    }

    return `3.${globalIndex}`;
  }

  private isSisterSection(sectionId1: string, sectionId2: string): boolean {
    const parts1 = sectionId1.split('.');
    const parts2 = sectionId2.split('.');
    
    if (parts1.length !== parts2.length) {
      return false;
    }
    
    for (let i = 0; i < parts1.length - 1; i++) {
      if (parts1[i] !== parts2[i]) {
        return false;
      }
    }
    
    return parts1[parts1.length - 1] !== parts2[parts2.length - 1];
  }

  private extractGroupSuffix(sectionId: string): string {
    return this.getGroupPrefix(sectionId);
  }

  getGroupPrefix(sectionId: string): string {
    const matchB1 = sectionId.match(/^3\.1\.4\.B\.1(\.|$)/);
    if (matchB1) {
      return '_B1';
    }
    
    const matchB = sectionId.match(/^3\.1\.4\.B\.(\d+)(\.|$)/);
    if (matchB) {
      return `_B${matchB[1]}`;
    }
    
    const matchA = sectionId.match(/^3\.1\.4\.A\.(\d+)(\.|$)/);
    if (matchA) {
      return `_A${matchA[1]}`;
    }
    
    if (sectionId.startsWith('3.1.4.A')) {
      return '_A1';
    }
    
    if (sectionId.startsWith('3.1.4.B')) {
      return '_B1';
    }
    
    return '';
  }

  /**
   * Recomputes global sequential numbering for all photographs and persists
   * updated `Numero` fields under each section when they differ from current values.
   * This makes numbering dynamic and globally consecutive across sections.
   */
  public renumberAllAndPersist(): void {
    const datos = this.projectFacade.obtenerDatos();
    const orderedSections = [...this.allSections].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

    type ImgEntry = { sectionId: string; prefix: string; groupSuffix: string; slot: number; numeroKey: string };
    const entries: ImgEntry[] = [];

    const maxPhotos = 20;

    for (const section of orderedSections) {
      const sectionId = section.id;
      const specificGroupSuffix = section.hasGroup ? this.getGroupPrefix(sectionId) : '';

      // Discover prefixes present in datos for this section + include configured prefixes
      const discovered = new Set<string>(section.prefixes || []);
      const keyRegex = new RegExp(`^(fotografia[A-Za-z0-9_]*)(?:\\d+)?Imagen${specificGroupSuffix.replace('$','')}$`);
      Object.keys(datos).forEach(k => {
        const m = k.match(keyRegex);
        if (m && m[1]) discovered.add(m[1]);
      });

      // Ordered prefixes: configured first, then others alphabetically
      const orderedPrefixes = [...section.prefixes.filter(p => discovered.has(p)), ...Array.from(discovered).filter(p => !section.prefixes.includes(p)).sort()];

      for (const prefix of orderedPrefixes) {
        // Check numbered slots
        let foundNumbered = false;
        for (let i = 1; i <= maxPhotos; i++) {
          const imagenKey = specificGroupSuffix ? `${prefix}${i}Imagen${specificGroupSuffix}` : `${prefix}${i}Imagen`;
          const val = datos[imagenKey];
          if (this.isValidImage(val)) {
            const numeroKey = specificGroupSuffix ? `${prefix}${i}Numero${specificGroupSuffix}` : `${prefix}${i}Numero`;
            entries.push({ sectionId, prefix, groupSuffix: specificGroupSuffix, slot: i, numeroKey });
            foundNumbered = true;
          }
        }

        // If no numbered found, check base key
        if (!foundNumbered) {
          const baseKey = specificGroupSuffix ? `${prefix}Imagen${specificGroupSuffix}` : `${prefix}Imagen`;
          if (this.isValidImage(datos[baseKey])) {
            const numeroKey = specificGroupSuffix ? `${prefix}Numero${specificGroupSuffix}` : `${prefix}Numero`;
            // treat as slot 1
            entries.push({ sectionId, prefix, groupSuffix: specificGroupSuffix, slot: 1, numeroKey });
          }
        }
      }
    }

    // Now assign sequential numbers and prepare updates grouped by section
    const updatesBySection: Record<string, Record<string, any>> = {};
    let counter = 0;
    for (const e of entries) {
      counter++;
      const newNumero = `3.${counter}`;
      const currentVal = String(this.projectFacade.obtenerDatos()[e.numeroKey] ?? '').trim();
      if (currentVal !== newNumero) {
        updatesBySection[e.sectionId] = updatesBySection[e.sectionId] || {};
        updatesBySection[e.sectionId][e.numeroKey] = newNumero;
      }
    }

    // Persist updates per section
    for (const sectionId of Object.keys(updatesBySection)) {
      const updates = updatesBySection[sectionId];
      try {
        this.projectFacade.setFields(sectionId, null, updates);
        try { this.formChange.persistFields(sectionId, 'images', updates); } catch (e) { /* persist error */ }
      } catch (e) {
        /* setFields error */
      }
    }

    if (Object.keys(updatesBySection).length > 0) {
      try {
        // Refresh state so views reflect updated numbers
        const { ReactiveStateAdapter } = require('src/app/core/services/state-adapters/reactive-state-adapter.service');
      } catch (e) { /* noop - adapter not required here */ }
    }
  }

  private renumberTimer: any = null;
  private renumberInProgress: boolean = false;

  public scheduleRenumber(delay: number = 60): void {
    if (this.renumberTimer) clearTimeout(this.renumberTimer);
    this.renumberTimer = setTimeout(async () => {
      if (this.renumberInProgress) {
        // if still in progress, reschedule
        this.scheduleRenumber(delay);
        return;
      }
      this.renumberInProgress = true;
      try {
        this.renumberAllAndPersist();
      } catch (e) {
        /* scheduled renumber error */
      } finally {
        this.renumberInProgress = false;
        this.renumberTimer = null;
      }
    }, delay);
  }
}
