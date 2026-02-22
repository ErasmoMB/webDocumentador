import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, OnInit, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { SECCION4_WATCHED_FIELDS, SECCION4_PHOTO_PREFIXES, SECCION4_TEMPLATES, SECCION4_CONFIG } from './seccion4-constants';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, ImageUploadComponent],
  selector: 'app-seccion4-view',
  templateUrl: './seccion4-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion4ViewComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = SECCION4_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = false;

  // ✅ Hacer TEMPLATES accesible en template
  readonly SECCION4_TEMPLATES = SECCION4_TEMPLATES;

  readonly PHOTO_PREFIX_UBICACION = SECCION4_PHOTO_PREFIXES.UBICACION;
  readonly PHOTO_PREFIX_POBLACION = SECCION4_PHOTO_PREFIXES.POBLACION;
  override readonly PHOTO_PREFIX = '';

  override useReactiveSync: boolean = false;
  override watchedFields: string[] = SECCION4_WATCHED_FIELDS;

  readonly formDataSignal: Signal<Record<string, any>>;
  readonly tablaAISD1Signal: Signal<any[]>;
  readonly tablaAISD2Signal: Signal<any[]>;
  readonly fotosCacheSignal: Signal<FotoItem[]>;
  readonly viewModel: Signal<any>;
  
  // ✅ NUEVO: Signal para ubicación global (desde metadata)
  readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);

    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX_UBICACION, label: SECCION4_TEMPLATES.labelFotografiasUbicacion },
      { prefix: this.PHOTO_PREFIX_POBLACION, label: SECCION4_TEMPLATES.labelFotografiasOblacion }
    ];

    this.formDataSignal = computed(() => {
      const sectionData = this.projectFacade.selectSectionFields(this.seccionId, null)();
      const seccion2Data = this.projectFacade.selectSectionFields('3.1.2', null)();
      return { ...sectionData, comunidadesCampesinas: seccion2Data['comunidadesCampesinas'] || sectionData['comunidadesCampesinas'] };
    });

    this.tablaAISD1Signal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const keyA1 = `tablaAISD1Datos${prefijo}`;
      const conPrefijo = this.projectFacade.selectField(this.seccionId, null, keyA1)();
      if (Array.isArray(conPrefijo) && conPrefijo.length > 0) {
        return conPrefijo;
      }

      const sinPrefijo = this.projectFacade.selectField(this.seccionId, null, 'tablaAISD1Datos')();
      return Array.isArray(sinPrefijo) && sinPrefijo.length > 0 ? sinPrefijo : [];
    });

    this.tablaAISD2Signal = computed(() => {
      const prefijo = this.obtenerPrefijoGrupo();
      const keyA2 = `tablaAISD2Datos${prefijo}`;
      const conPrefijo = this.projectFacade.selectField(this.seccionId, null, keyA2)();
      if (Array.isArray(conPrefijo) && conPrefijo.length > 0) {
        return conPrefijo;
      }

      const sinPrefijo = this.projectFacade.selectField(this.seccionId, null, 'tablaAISD2Datos')();
      return Array.isArray(sinPrefijo) && sinPrefijo.length > 0 ? sinPrefijo : [];
    });

    // ✅ SIGNAL PARA FOTOGRAFÍAS - ÚNICA VERDAD (PATRÓN OBLIGATORIO)
    this.fotosCacheSignal = computed(() => {
      const fotos: FotoItem[] = [];
      const prefijo = this.obtenerPrefijoGrupo();
      
      for (const basePrefix of [this.PHOTO_PREFIX_UBICACION, this.PHOTO_PREFIX_POBLACION]) {
        for (let i = 1; i <= 10; i++) {
          const titulo = this.projectFacade.selectField(this.seccionId, null, `${basePrefix}${i}Titulo${prefijo}`)();
          const fuente = this.projectFacade.selectField(this.seccionId, null, `${basePrefix}${i}Fuente${prefijo}`)();
          const imagen = this.projectFacade.selectField(this.seccionId, null, `${basePrefix}${i}Imagen${prefijo}`)();
          
          if (imagen) {
            fotos.push({
              titulo: titulo || `Fotografía ${i}`,
              fuente: fuente || 'GEADES, 2024',
              imagen: imagen
            } as FotoItem);
          }
        }
      }
      return fotos;
    });

    this.viewModel = computed(() => {
      const sectionData = this.formDataSignal();
      const data = sectionData;
      const nombreComunidad = this.obtenerNombreComunidadActual();
      const tablaAISD1 = this.tablaAISD1Signal();
      const tablaAISD2 = this.tablaAISD2Signal();
      
      // Calcular totales inline
      const tablaAISD2Array = Array.isArray(tablaAISD2) ? tablaAISD2 : [];
      const totales = {
        poblacion: tablaAISD2Array.map(f => Number(f['poblacion']) || 0).reduce((a, b) => a + b, 0),
        empadronadas: tablaAISD2Array.map(f => Number(f['viviendasEmpadronadas']) || 0).reduce((a, b) => a + b, 0),
        ocupadas: tablaAISD2Array.map(f => Number(f['viviendasOcupadas']) || 0).reduce((a, b) => a + b, 0)
      };
      
      return {
        nombreComunidad,
        data: {
          ...data,
          comunidadesCampesinas: sectionData['comunidadesCampesinas'] ?? [],
          cuadroTituloAISD1: data['cuadroTituloAISD1' + this.obtenerPrefijoGrupo()] ?? '',
          cuadroTituloAISD2: data['cuadroTituloAISD2' + this.obtenerPrefijoGrupo()] ?? '',
          tablaAISD1Datos: tablaAISD1,
          tablaAISD2Datos: tablaAISD2
        },
        texts: {
          introduccionText: this.obtenerTextoIntroduccionAISD(data, nombreComunidad),
          comunidadText: this.obtenerTextoComunidadCompleto(data, nombreComunidad),
          caracterizacionText: this.obtenerTextoCaracterizacionIndicadores(data, nombreComunidad)
        },
        tables: {
          tablaAISD1: Array.isArray(tablaAISD1) ? tablaAISD1 : [],
          tablaAISD2: Array.isArray(tablaAISD2) ? tablaAISD2 : []
        },
        calculations: {
          totalesAISD2: totales
        },
        sources: {
          tablaAISD1Source: data['cuadroFuenteAISD1' + this.obtenerPrefijoGrupo()] ?? '',
          tablaAISD2Source: data['cuadroFuenteAISD2' + this.obtenerPrefijoGrupo()] ?? ''
        }
      };
    });

    effect(() => {
      const sectionData = this.formDataSignal();
      const legacyData = this.projectFacade.obtenerDatos();
      this.datos = { ...legacyData, ...sectionData };
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.fotosCacheSignal();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.cargarFotografias();
  }

  protected override cargarFotografias(): void {
    if (this.photoGroupsConfig.length > 0) {
      this.cargarTodosLosGrupos();
      this.cdRef.markForCheck();
    } else {
      super.cargarFotografias();
    }
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {}

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  // ✅ MÉTODOS INLINE DE TEXTO (sin servicios)
  private obtenerCampoConPrefijo(datos: any, campoBase: string): string {
    return PrefijoHelper.obtenerValorConPrefijo(datos, campoBase, this.seccionId) || datos[campoBase] || '';
  }

  obtenerTextoIntroduccionAISD(datos: any, nombreComunidad: string): string {
    const textoPersonalizado = this.obtenerCampoConPrefijo(datos, 'parrafoSeccion4_introduccion_aisd');
    
    const textoPorDefecto = SECCION4_TEMPLATES.introduccionAISDDefault
      .replace('{{nombreComunidad}}', nombreComunidad || '____');
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado.replace(/CC\s*___/g, `CC ${nombreComunidad}`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoComunidadCompleto(datos: any, nombreComunidad: string): string {
    const textoPersonalizado = this.obtenerCampoConPrefijo(datos, 'parrafoSeccion4_comunidad_completo');
    
    // ✅ REFACTOR: Usar ubicacionGlobal en lugar de datos
    const ubicacion = this.ubicacionGlobal();
    const distrito = ubicacion.distrito || '____';
    const provincia = ubicacion.provincia || '____';
    const departamento = ubicacion.departamento || '____';
    const aisd1 = datos['aisdComponente1'] || '____';
    const aisd2 = datos['aisdComponente2'] || '____';
    const grupoAISI = datos['grupoAISI'] || ubicacion.distrito || '____';
    
    const textoPorDefecto = SECCION4_TEMPLATES.descripcionComunidadDefault
      .replace(/{{nombreComunidad}}/g, nombreComunidad || '____')
      .replace('{{distrito}}', distrito)
      .replace('{{provincia}}', provincia)
      .replace('{{aisd1}}', aisd1)
      .replace('{{aisd2}}', aisd2)
      .replace('{{departamento}}', departamento)
      .replace('{{grupoAISI}}', grupoAISI);
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado
        .replace(/CC\s*___/g, `CC ${nombreComunidad}`)
        .replace(/distrito de\s*___/g, `distrito de ${distrito}`)
        .replace(/provincia de\s*___/g, `provincia de ${provincia}`)
        .replace(/distritos de\s*___\s*y de/g, `distritos de ${aisd1} y de`)
        .replace(/y de\s*___\s*del departamento/g, `y de ${aisd2} del departamento`)
        .replace(/departamento de\s*___/g, `departamento de ${departamento}`)
        .replace(/CP\s*___/g, `CP ${grupoAISI}`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoCaracterizacionIndicadores(datos: any, nombreComunidad: string): string {
    const textoPersonalizado = this.obtenerCampoConPrefijo(datos, 'parrafoSeccion4_caracterizacion_indicadores');
    
    const textoPorDefecto = SECCION4_TEMPLATES.caracterizacionIndicadoresDefault
      .replace('{{nombreComunidad}}', nombreComunidad || '____');
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado.replace(/CC\s*___/g, `CC ${nombreComunidad}`);
    }
    
    return textoPorDefecto;
  }
}


