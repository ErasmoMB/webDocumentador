import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { SECCION23_TEMPLATES, SECCION23_WATCHED_FIELDS, SECCION23_SECTION_ID } from './seccion23-constants';

@Component({
  selector: 'app-seccion23-view',
  templateUrl: './seccion23-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CoreSharedModule, GenericTableComponent],
  standalone: true
})
export class Seccion23ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION23_SECTION_ID;
  @Input() override modoFormulario: boolean = false;

  // ✅ Exportar TEMPLATES para usar en HTML
  readonly SECCION23_TEMPLATES = SECCION23_TEMPLATES;

  // Campos observados para sincronización reactiva (se expande con prefijos automáticamente)
  override watchedFields: string[] = SECCION23_WATCHED_FIELDS;

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  readonly photoPrefixSignal: Signal<string>;
  
  // ✅ NUMERACIÓN GLOBAL
  readonly globalTableNumberSignal: Signal<string>;
  readonly globalTableNumberSignal2: Signal<string>;
  readonly globalTableNumberSignal3: Signal<string>;
  readonly globalPhotoNumbersSignal: Signal<string[]>;
  
  override PHOTO_PREFIX: string = '';
  override useReactiveSync: boolean = true;

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

  readonly petGruposEdadSignal: Signal<any[]> = computed(() => {
    const pref = this.obtenerPrefijoGrupo();
    const key = pref ? `petGruposEdadAISI${pref}` : 'petGruposEdadAISI';
    const v = this.projectFacade.selectField(this.seccionId, null, key)() ?? this.projectFacade.selectTableData(this.seccionId, null, 'petGruposEdadAISI')() ?? this.datos.petGruposEdadAISI ?? [];
    return v as any[];
  });

  readonly peaDistritoSexoSignal: Signal<any[]> = computed(() => {
    const pref = this.obtenerPrefijoGrupo();
    const key = pref ? `peaDistritoSexoTabla${pref}` : 'peaDistritoSexoTabla';
    return (this.projectFacade.selectField(this.seccionId, null, key)() ?? this.projectFacade.selectTableData(this.seccionId, null, 'peaDistritoSexoTabla')() ?? this.datos.peaDistritoSexoTabla ?? []) as any[];
  });

  readonly peaOcupadaDesocupadaSignal: Signal<any[]> = computed(() => {
    const pref = this.obtenerPrefijoGrupo();
    const key = pref ? `peaOcupadaDesocupadaTabla${pref}` : 'peaOcupadaDesocupadaTabla';
    return (this.projectFacade.selectField(this.seccionId, null, key)() ?? this.projectFacade.selectTableData(this.seccionId, null, 'peaOcupadaDesocupadaTabla')() ?? this.datos.peaOcupadaDesocupadaTabla ?? []) as any[];
  });

  // Photos - SEGUIR PATRON SECCION 21: leer directamente desde ProjectStateFacade
  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const basePrefix = 'fotografia';
    const groupPrefix = this.obtenerPrefijoGrupo();
    
    for (let i = 1; i <= 10; i++) {
      // Esquema correcto: {prefix}{i}{suffix}{group} → fotografia1Imagen_B1
      const imgKey = groupPrefix ? `${basePrefix}${i}Imagen${groupPrefix}` : `${basePrefix}${i}Imagen`;
      const titKey = groupPrefix ? `${basePrefix}${i}Titulo${groupPrefix}` : `${basePrefix}${i}Titulo`;
      const fuenteKey = groupPrefix ? `${basePrefix}${i}Fuente${groupPrefix}` : `${basePrefix}${i}Fuente`;
      
      const titulo = this.projectFacade.selectField(this.seccionId, null, titKey)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, imgKey)();
      
      if (imagen) {
        fotos.push({ titulo: titulo || `Fotografía ${i}`, fuente: fuente || 'GEADES, 2024', imagen } as FotoItem);
      }
    }
    return fotos;
  });

  // ✅ PARAGRAPH SIGNALS - patrón UNICA_VERDAD
  readonly textoPETIntroSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldName = `textoPETIntro${prefijo}`;
    return this.projectFacade.selectField(this.seccionId, null, fieldName)() || '';
  });

  readonly textoPETSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldName = `textoPET${prefijo}`;
    return this.projectFacade.selectField(this.seccionId, null, fieldName)() || '';
  });

  readonly textoIndicadoresDistritalesSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldName = `textoIndicadoresDistritales${prefijo}`;
    return this.projectFacade.selectField(this.seccionId, null, fieldName)() || '';
  });

  readonly textoPEASignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldName = `textoPEA${prefijo}`;
    return this.projectFacade.selectField(this.seccionId, null, fieldName)() || '';
  });

  readonly textoEmpleoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldName = `textoEmpleo${prefijo}`;
    return this.projectFacade.selectField(this.seccionId, null, fieldName)() || '';
  });

  readonly textoEmpleoDependienteSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldName = `textoEmpleoDependiente${prefijo}`;
    return this.projectFacade.selectField(this.seccionId, null, fieldName)() || '';
  });

  readonly textoIngresosSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldName = `textoIngresos${prefijo}`;
    return this.projectFacade.selectField(this.seccionId, null, fieldName)() || '';
  });

  readonly textoIndiceDesempleoSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldName = `textoIndiceDesempleo${prefijo}`;
    return this.projectFacade.selectField(this.seccionId, null, fieldName)() || '';
  });

  readonly textoPEASignalFull: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldName = `textoPEAFull${prefijo}`;
    return this.projectFacade.selectField(this.seccionId, null, fieldName)() || '';
  });

  readonly textoAnalisisPEASignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldName = `textoAnalisisPEA${prefijo}`;
    return this.projectFacade.selectField(this.seccionId, null, fieldName)() || '';
  });

  readonly viewModel: Signal<any> = computed(() => ({
    ...this.formDataSignal(),
    petGruposEdad: this.petGruposEdadSignal(),
    peaDistritoSexo: this.peaDistritoSexoSignal(),
    peaOcupadaDesocupada: this.peaOcupadaDesocupadaSignal(),
    fotos: this.fotosCacheSignal(),
    // ✅ Párrafos - señales reactivas
    textoPETIntro: this.textoPETIntroSignal(),
    textoPET: this.textoPETSignal(),
    textoIndicadoresDistritales: this.textoIndicadoresDistritalesSignal(),
    textoPEA: this.textoPEASignal(),
    textoEmpleo: this.textoEmpleoSignal(),
    textoEmpleoDependiente: this.textoEmpleoDependienteSignal(),
    textoIngresos: this.textoIngresosSignal(),
    textoIndiceDesempleo: this.textoIndiceDesempleoSignal(),
    textoPEAFull: this.textoPEASignalFull(),
    textoAnalisisPEA: this.textoAnalisisPEASignal()
  }));

  constructor(cdRef: ChangeDetectorRef, injector: Injector, private globalNumbering: GlobalNumberingService) {
    super(cdRef, injector);
    
    // ✅ Crear Signal para PHOTO_PREFIX dinámico
    this.photoPrefixSignal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const prefix = prefijo ? `fotografiaPEA${prefijo}` : 'fotografiaPEA';
      return prefix;
    });
    
    // Inicializar PHOTO_PREFIX para compatibilidad (usar el valor del signal)
    const prefijoInit = this.photoPrefixSignal();
    this.PHOTO_PREFIX = prefijoInit;
    
    // ✅ Sincronizar PHOTO_PREFIX cuando cambie el grupo
    effect(() => {
      this.PHOTO_PREFIX = this.photoPrefixSignal();
    });
    
    // ✅ Signal para número global de tabla (primera tabla: petGruposEdadAISI)
    this.globalTableNumberSignal = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
      return globalNum;
    });
    
    // ✅ Signal para número global de tabla (segunda tabla: peaDistritoSexoTabla)
    this.globalTableNumberSignal2 = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
      return globalNum;
    });
    
    // ✅ Signal para número global de tabla (tercera tabla: peaOcupadaDesocupadaTabla)
    this.globalTableNumberSignal3 = computed(() => {
      const globalNum = this.globalNumbering.getGlobalTableNumber(this.seccionId, 2);
      return globalNum;
    });
    
    // ✅ Signal para números globales de fotos
    this.globalPhotoNumbersSignal = computed(() => {
      const prefix = this.photoPrefixSignal();
      const fotos = this.fotosCacheSignal();
      
      const photoNumbers = fotos.map((_, index) => {
        const globalNum = this.globalNumbering.getGlobalPhotoNumber(this.seccionId, prefix, index);
        return globalNum;
      });
      
      return photoNumbers;
    });

    effect(() => {
      const data = this.formDataSignal();
      // Merge instead of replace: keep existing datos when selector is empty (fallback to BaseSectionComponent data)
      if (data && Object.keys(data).length > 0) {
        this.datos = { ...this.datos, ...data };
      }
      // Aplicar valores con prefijo después del merge (leer del signal, no de this.datos)
      this.datos.centroPobladoAISI = data?.['centroPobladoAISI'] || this.datos.centroPobladoAISI;
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });

    // ✅ Watch all paragraph signals for reactive sync
    effect(() => {
      // Read all paragraph signals to establish dependency
      this.textoPETIntroSignal();
      this.textoPETSignal();
      this.textoIndicadoresDistritalesSignal();
      this.textoPEASignal();
      this.textoEmpleoSignal();
      this.textoEmpleoDependienteSignal();
      this.textoIngresosSignal();
      this.textoIndiceDesempleoSignal();
      this.textoPEASignalFull();
      this.textoAnalisisPEASignal();
      this.cdRef.markForCheck();
    });
  }

  protected override obtenerPrefijoGrupo(): string { return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId); }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void {
    this.datos.centroPobladoAISI = (this.datos as any)?.centroPobladoAISI || null;
  }

  getPorcentajePET(): string {
    const tabla = this.petGruposEdadSignal();
    if (!tabla || !Array.isArray(tabla)) return '____';
    const total = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('total'));
    return this.normalizarValor(total?.porcentaje);
  }

  getPorcentajeGrupoPET(grupo: string): string {
    const tabla = this.petGruposEdadSignal();
    if (!tabla || !Array.isArray(tabla)) return '____';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes(grupo.toLowerCase()));
    return this.normalizarValor(item?.porcentaje);
  }

  obtenerTituloTabla(fieldName: string, defaultTitle: string): string {
    const valor = this.datos?.[fieldName];
    if (!valor || typeof valor !== 'string') {
      return this.reemplazarPlaceholdersTitulo(defaultTitle);
    }

    const texto = this.reemplazarPlaceholdersTitulo(valor.trim());
    if (!texto || this.tienePlaceholder(texto)) {
      return this.reemplazarPlaceholdersTitulo(defaultTitle);
    }

    const limpio = this.eliminarNumeroCuadro(texto);
    return limpio || this.reemplazarPlaceholdersTitulo(defaultTitle);
  }

  private reemplazarPlaceholdersTitulo(titulo: string | null | undefined): string {
    if (!titulo) return '';
    let resultado = titulo;

    const cp = (this.obtenerNombreCentroPobladoActual() || '____').trim() || '____';
    resultado = resultado
      .replace(/\{\{\s*centroPoblado\s*\}\}/gi, cp)
      .replace(/Centro\s+Poblado\s+_{2,}/gi, cp === '____' ? 'Centro Poblado ____' : `Centro Poblado ${cp}`)
      .replace(/CP\s+_{2,}/gi, cp === '____' ? 'CP ____' : `CP ${cp}`);

    const distrito = (this.obtenerNombreDistritoActual() || '____').trim() || '____';
    resultado = resultado
      .replace(/\{\{\s*distrito\s*\}\}/gi, distrito)
      .replace(/Distrito\s+_{2,}/gi, distrito === '____' ? 'Distrito ____' : `Distrito ${distrito}`);

    return resultado;
  }

  private normalizarValor(valor: any): string {
    if (valor === null || valor === undefined) return '____';
    const s = String(valor).trim();
    return s ? s : '____';
  }

  private eliminarNumeroCuadro(titulo: string): string {
    return titulo.replace(/^Cuadro\s+N[º°]\s*[\d\.]+(?:[\s:\-–—]+)?/i, '').trim();
  }

  tienePlaceholder(texto: string | null | undefined): boolean {
    return !!texto && /_{4,}/.test(texto);
  }

  getPorcentajePEA(): string {
    const tabla = this.peaDistritoSexoSignal();
    if (!tabla || !Array.isArray(tabla)) return '____';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no pea'));
    return this.normalizarValor(item?.porcentaje);
  }

  getPorcentajeNoPEA(): string {
    const tabla = this.peaDistritoSexoSignal();
    if (!tabla || !Array.isArray(tabla)) return '____';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('no pea'));
    return this.normalizarValor(item?.porcentaje);
  }

  getPorcentajeHombresPEA(): string {
    const tabla = this.peaDistritoSexoSignal();
    if (!tabla || !Array.isArray(tabla)) return '____';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no pea'));
    return this.normalizarValor(item?.porcentajeHombres);
  }

  getPorcentajeMujeresNoPEA(): string {
    const tabla = this.peaDistritoSexoSignal();
    if (!tabla || !Array.isArray(tabla)) return '____';
    const item = tabla.find((item: any) => item.categoria && item.categoria.toLowerCase().includes('no pea'));
    return this.normalizarValor(item?.porcentajeMujeres);
  }

  // Textos para template
  obtenerTextoPETIntro(): string {
    // ✅ Leer del signal (UNICA_VERDAD)
    const texto = this.textoPETIntroSignal();
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    return SECCION23_TEMPLATES.petIntroDefault;
  }

  obtenerTextoPET(): string {
    // ✅ Leer del signal (UNICA_VERDAD)
    const texto = this.textoPETSignal();
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const centroPoblado = this.obtenerNombreCentroPobladoActual();
    const porcentajePET = this.getPorcentajePET();
    const porcentaje4564 = this.getPorcentajeGrupoPET('45 a 64');
    const porcentaje65 = this.getPorcentajeGrupoPET('65');
    return SECCION23_TEMPLATES.petCompleteTemplateWithVariables
      .replace('{{centroPoblado}}', centroPoblado)
      .replace('{{porcentajePET}}', porcentajePET)
      .replace('{{porcentaje4564}}', porcentaje4564)
      .replace('{{porcentaje65}}', porcentaje65);
  }

  obtenerTextoIndicadoresDistritales(): string {
    // ✅ Leer del signal (UNICA_VERDAD)
    const texto = this.textoIndicadoresDistritalesSignal();
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const distrito = this.obtenerNombreDistritoActual();
    const poblacionDistrital = this.getPoblacionDistritalFn();
    const petDistrital = this.getPETDistrital();
    return SECCION23_TEMPLATES.indicadoresDistritalesTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{poblacionDistrital}}', poblacionDistrital)
      .replace('{{petDistrital}}', petDistrital);
  }

  obtenerTextoPEA(): string {
    // ✅ Leer del signal (UNICA_VERDAD)
    const texto = this.textoPEASignal();
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const distrito = this.obtenerNombreDistritoActual();
    const centroPoblado = this.obtenerNombreCentroPobladoActual();
    return SECCION23_TEMPLATES.peaCompleteTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{centroPoblado}}', centroPoblado);
  }

  obtenerTextoAnalisisPEA_AISI(): string {
    // ✅ Leer del signal (UNICA_VERDAD)
    const texto = this.textoAnalisisPEASignal();
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const distrito = this.obtenerNombreDistritoActual();
    return SECCION23_TEMPLATES.peaAnalisisTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{porcentajePEA}}', this.getPorcentajePEA())
      .replace('{{porcentajeNoPEA}}', this.getPorcentajeNoPEA())
      .replace('{{porcentajeHombresPEA}}', this.getPorcentajeHombresPEA())
      .replace('{{porcentajeMujeresNoPEA}}', this.getPorcentajeMujeresNoPEA());
  }

  obtenerTextoEmpleoAISI(): string {
    // ✅ Leer del signal (UNICA_VERDAD)
    const texto = this.textoEmpleoSignal();
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const distrito = this.obtenerNombreDistritoActual();
    return SECCION23_TEMPLATES.empleoSituacionDefault.replace('{{distrito}}', distrito);
  }

  obtenerTextoEmpleoDependiente_AISI(): string {
    // ✅ Leer del signal (UNICA_VERDAD)
    const texto = this.textoEmpleoDependienteSignal();
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    return SECCION23_TEMPLATES.empleoDependienteDefault;
  }

  obtenerTextoIngresosAISI(): string {
    // ✅ Leer del signal (UNICA_VERDAD)
    const texto = this.textoIngresosSignal();
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const distrito = this.obtenerNombreDistritoActual();
    const centroPoblado = this.obtenerNombreCentroPobladoActual();
    const ingresoPerCapita = this.getIngresoPerCapita();
    const rankingIngreso = this.getRankingIngreso();
    return SECCION23_TEMPLATES.ingresosTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{centroPoblado}}', centroPoblado)
      .replace('{{ingresoPerCapita}}', ingresoPerCapita)
      .replace('{{rankingIngreso}}', rankingIngreso);
  }

  obtenerTextoIndiceDesempleoAISI(): string {
    // ✅ Leer del signal (UNICA_VERDAD)
    const texto = this.textoIndiceDesempleoSignal();
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const distrito = this.obtenerNombreDistritoActual();
    const centroPoblado = this.obtenerNombreCentroPobladoActual();
    return SECCION23_TEMPLATES.indiceDesempleoTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{centroPoblado}}', centroPoblado);
  }

  obtenerTextoPEAAISI(): string {
    // ✅ Leer del signal (UNICA_VERDAD)
    const texto = this.textoPEASignalFull();
    if (texto && texto !== '____' && !this.tienePlaceholder(texto)) return texto;
    const distrito = this.obtenerNombreDistritoActual();
    return SECCION23_TEMPLATES.peaOcupadaDesocupadaTemplateWithVariables
      .replace('{{distrito}}', distrito)
      .replace('{{porcentajeDesempleo}}', this.getPorcentajeDesempleo())
      .replace('{{porcentajeHombres}}', this.getPorcentajeHombresOcupados())
      .replace('{{porcentajeMujeres}}', this.getPorcentajeMujeresOcupadas());
  }

  obtenerCentroPoblado(): string {
    const data = this.formDataSignal();
    return data['centroPobladoAISI'] || this.obtenerNombreCentroPobladoActual() || '____';
  }

  obtenerDistrito(): string {
    const data = this.formDataSignal();
    return data['distritoSeleccionado'] || this.obtenerNombreDistritoActual() || '____';
  }

  obtenerPoblacionDistrital(): string {
    const data = this.formDataSignal();
    return data['poblacionDistritalAISI'] || '____';
  }

  obtenerPETDistrital(): string {
    const data = this.formDataSignal();
    return data['petDistritalAISI'] || '____';
  }

  override ngOnDestroy(): void { super.ngOnDestroy(); }

  getPetGruposEdadAISIConPorcentajes(): any[] {
    return this.petGruposEdadSignal();
  }

  getPeaDistritoSexoConPorcentajes(): any[] {
    return this.peaDistritoSexoSignal();
  }

  getPeaOcupadaDesocupadaConPorcentajes(): any[] {
    return this.peaOcupadaDesocupadaSignal();
  }


  getIngresoPerCapita(): string {
    const v = this.formDataSignal()?.['ingresoPerCapita'] ?? null;
    if (v === null || v === undefined || v === '') return '____';
    const num = typeof v === 'number' ? v : parseFloat(String(v)) || 0;
    return num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getRankingIngreso(): string {
    return this.formDataSignal()?.['rankingIngreso'] ?? '____';
  }

  getPorcentajeDesempleo(): string {
    const rows = this.peaOcupadaDesocupadaSignal() || [];
    const item = rows.find((r: any) => r.categoria && r.categoria.toLowerCase().includes('desocup'));
    return this.normalizarValor(item?.porcentaje);
  }

  getPorcentajeHombresOcupados(): string {
    const rows = this.peaOcupadaDesocupadaSignal() || [];
    const item = rows.find((r: any) => r.categoria && r.categoria.toLowerCase().includes('ocup'));
    return this.normalizarValor(item?.porcentajeHombres);
  }

  getPorcentajeMujeresOcupadas(): string {
    const rows = this.peaOcupadaDesocupadaSignal() || [];
    const item = rows.find((r: any) => r.categoria && r.categoria.toLowerCase().includes('ocup'));
    return this.normalizarValor(item?.porcentajeMujeres);
  }

  getPoblacionDistritalFn(): string {
    const data = this.formDataSignal();
    return data?.['poblacionDistritalAISI'] || '____';
  }

  getPETDistrital(): string {
    const data = this.formDataSignal();
    return data?.['petDistritalAISI'] || '____';
  }
}

