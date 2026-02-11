import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Injector, OnDestroy, effect, Signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { LoadSeccion28UseCase, Seccion28ViewModel } from 'src/app/core/application/use-cases';
import { takeUntil } from 'rxjs/operators';
import { PrefijoHelper } from '../../utils/prefijo-helper';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, GenericTableComponent, ImageUploadComponent],
  selector: 'app-seccion28-view',
  templateUrl: './seccion28-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion28ViewComponent extends AutoLoadSectionComponent implements OnDestroy {
  seccion28ViewModel$ = this.loadSeccion28UseCase.execute();
  seccion28ViewModel?: Seccion28ViewModel;

  // ✅ PHOTO_PREFIX dinámico basado en el prefijo del grupo AISI
  override readonly PHOTO_PREFIX: string;

  // ✅ Signals de prefijos para fotos
  readonly photoPrefixSignalSalud: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fotografiaSaludAISI${prefijo}` : 'fotografiaSaludAISI';
  });

  readonly photoPrefixSignalEducacion: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fotografiaEducacionAISI${prefijo}` : 'fotografiaEducacionAISI';
  });

  readonly photoPrefixSignalRecreacion: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fotografiaRecreacionAISI${prefijo}` : 'fotografiaRecreacionAISI';
  });

  readonly photoPrefixSignalDeporte: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fotografiaDeporteAISI${prefijo}` : 'fotografiaDeporteAISI';
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private loadSeccion28UseCase: LoadSeccion28UseCase
  ) {
    super(cdRef, undefined as any, injector);

    // ✅ Inicializar PHOTO_PREFIX dinámicamente
    const prefijo = this.obtenerPrefijoGrupo();
    this.PHOTO_PREFIX = prefijo ? `fotografiaCahuacho${prefijo}` : 'fotografiaCahuacho';

    // Effect para aplicar prefijo a centroPobladoAISI (leer del store, no de this.datos)
    effect(() => {
      const data = this.projectFacade.selectSectionFields(this.seccionId, null)();
      const centroPrefijado = PrefijoHelper.obtenerValorConPrefijo(data, 'centroPobladoAISI', this.seccionId);
      if (centroPrefijado) {
        this.datos.centroPobladoAISI = centroPrefijado;
      }
      this.cdRef.markForCheck();
    });
    
    // Suscribirse a cambios del formulario
    this.seccion28ViewModel$
      .pipe(takeUntil(this.destroy$))
      .subscribe(vm => { 
        this.seccion28ViewModel = vm;
        this.cdRef.markForCheck(); 
      });

    // ✅ NUEVO: Escuchar cambios de SectionSyncService para sincronización inmediata
    try {
      const SectionSyncService = require('src/app/core/services/state/section-sync.service').SectionSyncService;
      const sectionSync = injector.get(SectionSyncService, null);
      if (sectionSync) {
        sectionSync.changes$
          .pipe(takeUntil(this.destroy$))
          .subscribe((event: any) => {
            // Si el cambio es de nuestra sección, forzar detección
            if (event.sectionId === this.seccionId) {
              this.actualizarDatos();  // Carga datos del store
              this.cdRef.markForCheck();  // Marca para detección
              this.cdRef.detectChanges();  // Fuerza detección inmediata
            }
          });
      }
    } catch (e) {
      // SectionSyncService no disponible, continuar sin sincronización inmediata
    }
  }

  obtenerTextoSalud(): string {
    return this.seccion28ViewModel?.texts.saludText || this.datos.textoSaludCP || '';
  }

  obtenerTextoEducacion(): string {
    return this.seccion28ViewModel?.texts.educacionText || this.datos.textoEducacionCP || '';
  }

  getEducacionCpConPorcentajes(): any[] {
    const tabla = this.datos.educacionCpTabla || [];
    return tabla; // View will use GenericTable; percentages should be computed by helper if present
  }

  getTablaKeyPuestoSalud(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `puestoSaludCpTabla${prefijo}` : 'puestoSaludCpTabla';
  }

  getTablaKeyEducacion(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `educacionCpTabla${prefijo}` : 'educacionCpTabla';
  }

  getPuestoSaludTabla(): any[] {
    const tablaKey = this.getTablaKeyPuestoSalud();
    return this.datos[tablaKey] || this.datos.puestoSaludCpTabla || [];
  }

  get puestoSaludCpTablaVista(): any[] {
    return this.getPuestoSaludTabla();
  }

  get educacionCpTablaVista(): any[] {
    const tablaKey = this.getTablaKeyEducacion();
    return this.datos[tablaKey] || this.datos.educacionCpTabla || [];
  }

  // Implement abstract methods from AutoLoadSectionComponent
  protected getSectionKey(): string { return 'seccion28_aisi'; }
  protected getLoadParameters(): string[] | null {
    try { return this.injector.get((require('src/app/core/services/group-config.service').GroupConfigService)); } catch { return null; }
  }
  protected detectarCambios(): boolean { return false; }
  protected actualizarValoresConPrefijo(): void { }

  // Fotografía helper
  override getFotografiasVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix);
  }

  getFotografiasSaludVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(this.seccionId, this.photoPrefixSignalSalud(), groupPrefix);
  }

  getFotografiasEducacionVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(this.seccionId, this.photoPrefixSignalEducacion(), groupPrefix);
  }

  getFotografiasRecreacionVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(this.seccionId, this.photoPrefixSignalRecreacion(), groupPrefix);
  }

  getFotografiasDeporteVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(this.seccionId, this.photoPrefixSignalDeporte(), groupPrefix);
  }

  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    super.ngOnDestroy();
  }
}
