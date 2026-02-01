import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, OnInit, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { Seccion4TextGeneratorService } from 'src/app/core/services/domain/seccion4-text-generator.service';
import { Seccion4DataService } from 'src/app/core/services/domain/seccion4-data.service';
import { SectionSyncService } from 'src/app/core/services/state/section-sync.service';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  standalone: true,
  imports: [CommonModule, CoreSharedModule],
  selector: 'app-seccion4',
  templateUrl: './seccion4.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion4Component extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1';
  @Input() override modoFormulario: boolean = false;

  readonly PHOTO_PREFIX_UBICACION = 'fotografiaUbicacionReferencial';
  readonly PHOTO_PREFIX_POBLACION = 'fotografiaPoblacionViviendas';
  override readonly PHOTO_PREFIX = '';

  override useReactiveSync = false;

  readonly formDataSignal: Signal<Record<string, any>>;
  /** Señales dedicadas para las tablas (patrón Seccion3) para que la vista reaccione al store */
  readonly tablaAISD1Signal: Signal<any[]>;
  readonly tablaAISD2Signal: Signal<any[]>;
  readonly viewModel: Signal<{
    data: Record<string, any>;
    texts: { introduccionText: string; comunidadText: string; caracterizacionText: string };
    tables: { tablaAISD1: any[]; tablaAISD2: any[] };
    calculations: { totalesAISD2: { poblacion: number; empadronadas: number; ocupadas: number } };
    sources: { tablaAISD1Source: string; tablaAISD2Source: string };
  }>;
  readonly photoFieldsHash: Signal<string>;

  private tableSyncSubscription?: Subscription;

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private textGen: Seccion4TextGeneratorService,
    private dataSrv: Seccion4DataService,
    private sectionSync: SectionSyncService
  ) {
    super(cdRef, injector);
    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX_UBICACION, label: 'Ubicación' },
      { prefix: this.PHOTO_PREFIX_POBLACION, label: 'Población' }
    ];

    this.formDataSignal = computed(() => this.projectFacade.selectSectionFields(this.seccionId, null)());

    this.tablaAISD1Signal = computed(() => {
      const a1 = this.projectFacade.selectField(this.seccionId, null, 'tablaAISD1Datos_A1')();
      const a2 = this.projectFacade.selectField(this.seccionId, null, 'tablaAISD1Datos_A2')();
      const base = this.projectFacade.selectField(this.seccionId, null, 'tablaAISD1Datos')();
      const arr = Array.isArray(a1) && a1.length > 0 ? a1 : (Array.isArray(a2) && a2.length > 0 ? a2 : (Array.isArray(base) ? base : []));
      return arr;
    });
    this.tablaAISD2Signal = computed(() => {
      const a1 = this.projectFacade.selectField(this.seccionId, null, 'tablaAISD2Datos_A1')();
      const a2 = this.projectFacade.selectField(this.seccionId, null, 'tablaAISD2Datos_A2')();
      const base = this.projectFacade.selectField(this.seccionId, null, 'tablaAISD2Datos')();
      const arr = Array.isArray(a1) && a1.length > 0 ? a1 : (Array.isArray(a2) && a2.length > 0 ? a2 : (Array.isArray(base) ? base : []));
      return arr;
    });

    this.photoFieldsHash = computed(() => {
      let hash = '';
      for (const prefix of [this.PHOTO_PREFIX_UBICACION, this.PHOTO_PREFIX_POBLACION]) {
        for (let i = 1; i <= 10; i++) {
          const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
          const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
          const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
          hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
        }
      }
      return hash;
    });

    this.viewModel = computed(() => {
      const sectionData = this.formDataSignal();
      const legacyData = this.projectFacade.obtenerDatos();
      const data = { ...legacyData, ...sectionData };
      const nombreComunidad = this.dataSrv.obtenerNombreComunidadActual(data, this.seccionId);
      const fromStore1 = this.tablaAISD1Signal();
      const fromStore2 = this.tablaAISD2Signal();
      const tablaAISD1 = (Array.isArray(fromStore1) && fromStore1.length > 0) ? fromStore1 : (data['tablaAISD1Datos'] ?? data['tablaAISD1Datos_A1'] ?? data['tablaAISD1Datos_A2'] ?? []);
      const tablaAISD2 = (Array.isArray(fromStore2) && fromStore2.length > 0) ? fromStore2 : (data['tablaAISD2Datos'] ?? data['tablaAISD2Datos_A1'] ?? data['tablaAISD2Datos_A2'] ?? []);
      const totales = this.dataSrv.calcularTotalesAISD2(Array.isArray(tablaAISD2) ? tablaAISD2 : []);
      return {
        data: {
          ...data,
          comunidadesCampesinas: data['comunidadesCampesinas'] ?? [],
          cuadroTituloAISD1: data['cuadroTituloAISD1'],
          tablaAISD1Datos: tablaAISD1,
          tablaAISD2Datos: tablaAISD2
        },
        texts: {
          introduccionText: this.textGen.obtenerTextoIntroduccionAISD(data, nombreComunidad),
          comunidadText: this.textGen.obtenerTextoComunidadCompleto(data, nombreComunidad),
          caracterizacionText: this.textGen.obtenerTextoCaracterizacionIndicadores(data, nombreComunidad)
        },
        tables: {
          tablaAISD1: Array.isArray(tablaAISD1) ? tablaAISD1 : [],
          tablaAISD2: Array.isArray(tablaAISD2) ? tablaAISD2 : []
        },
        calculations: {
          totalesAISD2: {
            poblacion: totales.poblacion,
            empadronadas: totales.empadronadas,
            ocupadas: totales.ocupadas
          }
        },
        sources: {
          tablaAISD1Source: data['cuadroFuenteAISD1'] ?? '',
          tablaAISD2Source: data['cuadroFuenteAISD1'] ?? ''
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
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.cargarFotografias();
    this.subscribeToTableSync();
    
    // Console.log para mostrar el grupo AISD y sus centros poblados
    this.logGrupoAISD();
  }

  /** Log en consola del grupo AISD actual y sus centros poblados */
  private logGrupoAISD(): void {
    const match = this.seccionId.match(/^3\.1\.4\.A\.(\d+)/);
    if (!match) return;
    
    const numeroGrupo = parseInt(match[1], 10);
    const datos = this.projectFacade.obtenerDatos();
    
    // DEBUG: Mostrar estructura de datos
    console.log(`%c[DEBUG] Analizando sección ${this.seccionId}`, 'color: #666; font-size: 12px');
    console.log(`%c[DEBUG] Estructura de datos:`, 'color: #666; font-size: 12px');
    console.log('- comunidadesCampesinas:', datos['comunidadesCampesinas']);
    console.log('- centrosPobladosJSON:', datos['centrosPobladosJSON']);
    console.log('- jsonCompleto:', datos['jsonCompleto']);
    
    const comunidades = datos['comunidadesCampesinas'] || [];
    console.log(`%c[DEBUG] Total comunidades cargadas: ${comunidades.length}`, 'color: #999; font-size: 11px');
    
    if (comunidades.length === 0) {
      console.log('%c⚠️ No hay comunidades cargadas. Verifica que hayas cargado un JSON en sección 1.', 'color: #f59e0b; font-weight: bold');
      return;
    }
    
    const comunidadActual = comunidades[numeroGrupo - 1];
    console.log(`%c[DEBUG] Buscando comunidad en índice ${numeroGrupo - 1}:`, 'color: #999; font-size: 11px', comunidadActual);
    
    if (!comunidadActual) {
      console.log(`%c⚠️ No existe comunidad A.${numeroGrupo}. Comunidades disponibles: ${comunidades.length}`, 'color: #f59e0b; font-weight: bold');
      return;
    }
    
    console.log(`%c🏘️ GRUPO AISD: A.${numeroGrupo} - ${comunidadActual.nombre || 'Sin nombre'}`, 'color: #2563eb; font-weight: bold; font-size: 14px');
    console.log(`%cCentros Poblados (CCPP):`, 'color: #7c3aed; font-weight: bold');
    
    // Verificar qué contiene centrosPobladosSeleccionados
    const centrosPobladosSeleccionados = comunidadActual.centrosPobladosSeleccionados || [];
    console.log(`[DEBUG] centrosPobladosSeleccionados:`, centrosPobladosSeleccionados);
    
    if (centrosPobladosSeleccionados.length === 0) {
      console.log('  (Sin centros poblados asignados)');
      console.log('%c[INFO] Debes asignar centros poblados a esta comunidad en la sección 2', 'color: #f59e0b; font-size: 11px');
      return;
    }
    
    // Si centrosPobladosSeleccionados contiene strings (códigos), buscar en jsonCompleto
    const jsonCompleto = datos['jsonCompleto'] || {};
    const centrosDetalles: any[] = [];
    
    centrosPobladosSeleccionados.forEach((codigo: any, index: number) => {
      // Buscar en jsonCompleto
      let encontrado = false;
      Object.keys(jsonCompleto).forEach((grupoKey: string) => {
        const grupoData = jsonCompleto[grupoKey];
        if (Array.isArray(grupoData)) {
          const centro = grupoData.find((c: any) => {
            const codigoCentro = String(c.CODIGO || '').trim();
            const codigoBuscado = String(codigo).trim();
            return codigoCentro === codigoBuscado;
          });
          if (centro && !encontrado) {
            centrosDetalles.push(centro);
            encontrado = true;
          }
        }
      });
      
      if (!encontrado) {
        console.log(`  [DEBUG] Centro con código ${codigo} no encontrado en jsonCompleto`);
      }
    });
    
    if (centrosDetalles.length > 0) {
      centrosDetalles.forEach((cp: any, index: number) => {
        const nombre = cp.CCPP || cp.nombre || `CCPP ${index + 1}`;
        console.log(`  ${index + 1}. ${nombre} (Código: ${cp.CODIGO})`);
      });
    } else {
      console.log('  (Sin centros poblados encontrados en el JSON)');
    }
  }

  /** Seccion4 tiene varios grupos de fotos (Ubicación, Población); cargar todos para la vista */
  protected override cargarFotografias(): void {
    if (this.photoGroupsConfig.length > 0) {
      this.cargarTodosLosGrupos();
      this.cdRef.markForCheck();
    } else {
      super.cargarFotografias();
    }
  }

  override ngOnDestroy(): void {
    this.tableSyncSubscription?.unsubscribe();
    this.sectionSync.unsubscribeFromSection(this.seccionId);
    super.ngOnDestroy();
  }

  /** Suscripción a cambios de tablas para sincronizar vista con formulario */
  private subscribeToTableSync(): void {
    const tableFields = [
      'tablaAISD1Datos', 'tablaAISD2Datos',
      'tablaAISD1Datos_A1', 'tablaAISD2Datos_A1',
      'tablaAISD1Datos_A2', 'tablaAISD2Datos_A2'
    ];
    this.tableSyncSubscription = this.sectionSync.subscribeToSection(
      this.seccionId,
      tableFields,
      () => {
        this.cdRef.markForCheck();
      }
    );
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {}
}
