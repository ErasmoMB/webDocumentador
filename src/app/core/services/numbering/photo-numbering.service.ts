import { Injectable } from '@angular/core';
import { ProjectStateFacade } from '../../state/project-state.facade';
import { FormChangeService } from '../state/form-change.service';

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
    private formChange: FormChangeService
  ) {
    this.printConfigurationSummary();
  }

  // --- NUEVO ORDEN GLOBAL DINÁMICO (compatible con AISD/AISI multi-grupo) ---
  private getDynamicGroupCount(): { aisd: number; aisi: number } {
    const datos: any = this.projectFacade.obtenerDatos() || {};
    const comunidades = Array.isArray(datos.comunidadesCampesinas) ? datos.comunidadesCampesinas.length : 0;
    const distritos = Array.isArray(datos.distritosAISI) ? datos.distritosAISI.length : 0;
    return {
      aisd: comunidades > 0 ? comunidades : 1,
      aisi: distritos > 0 ? distritos : 1
    };
  }

  private getOrderedSectionIdsForPhotos(): string[] {
    const { aisd, aisi } = this.getDynamicGroupCount();
    const ordered: string[] = ['3.1.1', '3.1.2.A', '3.1.2.B', '3.1.3'];

    for (let g = 1; g <= aisd; g++) {
      ordered.push(`3.1.4.A.${g}`);
      for (let s = 1; s <= 16; s++) ordered.push(`3.1.4.A.${g}.${s}`);
    }

    ordered.push('3.1.4.B');

    for (let g = 1; g <= aisi; g++) {
      ordered.push(`3.1.4.B.${g}`);
      for (let s = 1; s <= 16; s++) ordered.push(`3.1.4.B.${g}.${s}`);
    }

    return ordered;
  }

  private normalizeToTemplateSectionId(sectionId: string): string {
    if (!sectionId || typeof sectionId !== 'string') return sectionId;
    // AISD intro: 3.1.4.A.{g} -> 3.1.4.A.1
    if (/^3\.1\.4\.A\.\d+$/.test(sectionId)) return '3.1.4.A.1';
    // AISD subsección: 3.1.4.A.{g}.{s} -> 3.1.4.A.1.{s}
    const aisdSub = sectionId.match(/^3\.1\.4\.A\.(\d+)\.(\d+)$/);
    if (aisdSub) return `3.1.4.A.1.${aisdSub[2]}`;
    // AISI intro: 3.1.4.B.{g} -> 3.1.4.B.1
    if (/^3\.1\.4\.B\.\d+$/.test(sectionId)) return '3.1.4.B.1';
    // AISI subsección: 3.1.4.B.{g}.{s} -> 3.1.4.B.1.{s}
    const aisiSub = sectionId.match(/^3\.1\.4\.B\.(\d+)\.(\d+)$/);
    if (aisiSub) return `3.1.4.B.1.${aisiSub[2]}`;
    return sectionId;
  }

  private stripGroupSuffixFromPrefix(prefix: string, groupSuffix: string): string {
    if (!prefix || !groupSuffix) return prefix;
    return prefix.endsWith(groupSuffix) ? prefix.slice(0, -groupSuffix.length) : prefix;
  }

  private getConfiguredPrefixesForSection(sectionId: string): string[] {
    const templateId = this.normalizeToTemplateSectionId(sectionId);
    const cfg = this.getSectionConfig(templateId);
    return (cfg?.prefixes || []).filter(Boolean);
  }

  private discoverPrefixesFromData(sectionId: string, groupSuffix: string): string[] {
    const datos = this.projectFacade.obtenerDatos() || {};
    const discovered = new Set<string>();

    // Detectar claves: fotografiaX{n}Imagen{_A?/_B?} o fotografiaXImagen{_A?/_B?}
    // Limitamos al groupSuffix actual cuando aplique.
    const suffix = groupSuffix || '';
    const suffixPart = suffix ? `${suffix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$` : '$';
    const re = new RegExp(`^(fotografia[\\w]+?)(?:\\d+)?Imagen${suffixPart}`);
    for (const k of Object.keys(datos)) {
      const m = k.match(re);
      if (m && m[1]) discovered.add(m[1]);
    }

    return Array.from(discovered).sort();
  }

  private isValidImage(imagen: any): boolean {
    if (!imagen) return false;
    if (typeof imagen === 'string') {
      return imagen !== 'null' && imagen.trim() !== '' && (imagen.startsWith('data:image') || imagen.startsWith('http') || imagen.length > 100);
    }
    if (imagen instanceof File) {
      return imagen.type.startsWith('image/');
    }
    return false;
  }

  private countPhotosForPrefix(prefix: string, groupSuffix: string, maxPhotos: number = 10): number {
    const datos = this.projectFacade.obtenerDatos() || {};

    // Igual que ImageStorageService: si el prefix ya incluye el groupSuffix, no se añade suffix.
    const effectiveSuffix = groupSuffix && prefix.includes(groupSuffix) ? '' : groupSuffix;

    let count = 0;
    let numberedFound = false;
    for (let i = 1; i <= maxPhotos; i++) {
      const imagenKey = effectiveSuffix ? `${prefix}${i}Imagen${effectiveSuffix}` : `${prefix}${i}Imagen`;
      if (this.isValidImage(datos[imagenKey])) {
        count++;
        numberedFound = true;
      }
    }

    if (!numberedFound) {
      const baseKey = effectiveSuffix ? `${prefix}Imagen${effectiveSuffix}` : `${prefix}Imagen`;
      if (this.isValidImage(datos[baseKey])) count++;
    }

    return count;
  }

  private countPhotosInSection(sectionId: string, groupSuffix: string): number {
    // Para offsets globales, contamos solo los prefijos configurados de la sección.
    // Evita contar fotos de otras secciones que compartan el mismo sufijo de grupo.
    const configured = this.getConfiguredPrefixesForSection(sectionId);
    let total = 0;
    for (const p of configured) total += this.countPhotosForPrefix(p, groupSuffix);
    return total;
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

  /**
   * ✅ Numeración global REAL para fotos
   * - Secciones 1–3: fijas
   * - Desde 4: dinámicas por grupo AISD/AISI (3.1.4.A.{g} / 3.1.4.B.{g})
   * - Fotos por sección: variable (se cuenta dinámicamente)
   *
   * Parámetros:
   * - photoIndexInSection: 1-basado dentro del prefijo/slot (coincide con ImageStorageService)
   */
  public getGlobalPhotoNumber(
    sectionId: string,
    photoIndexInSection: number,
    prefix: string,
    groupPrefix: string = ''
  ): string {
    if (!sectionId) return '';
    if (!photoIndexInSection || photoIndexInSection < 1) return '';

    const orderedSections = this.getOrderedSectionIdsForPhotos();
    const currentIdx = orderedSections.indexOf(sectionId);
    if (currentIdx === -1) return '';

    const groupSuffixCurrent = groupPrefix || this.getGroupPrefix(sectionId);
    const basePrefixCurrent = this.stripGroupSuffixFromPrefix(prefix, groupSuffixCurrent);

    // 1) Sumar todas las fotos de secciones anteriores
    let totalPrev = 0;
    for (let i = 0; i < currentIdx; i++) {
      const prevSectionId = orderedSections[i];
      const prevGroupSuffix = this.getGroupPrefix(prevSectionId);
      totalPrev += this.countPhotosInSection(prevSectionId, prevGroupSuffix);
    }

    // 2) Dentro de la sección actual: sumar prefijos anteriores según configuración
    const configuredCurrent = this.getConfiguredPrefixesForSection(sectionId);
    const orderedPrefixes = basePrefixCurrent && !configuredCurrent.includes(basePrefixCurrent)
      ? [...configuredCurrent, basePrefixCurrent]
      : configuredCurrent;

    const currentPrefixIdx = basePrefixCurrent ? orderedPrefixes.indexOf(basePrefixCurrent) : -1;
    if (currentPrefixIdx > 0) {
      for (let p = 0; p < currentPrefixIdx; p++) {
        totalPrev += this.countPhotosForPrefix(orderedPrefixes[p], groupSuffixCurrent);
      }
    }

    const globalIndex = totalPrev + photoIndexInSection;
    return `3.${globalIndex}`;
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
