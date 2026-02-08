import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CoreSharedModule, ParagraphEditorComponent, ImageUploadComponent, DynamicTableComponent],
  selector: 'app-seccion27-form',
  templateUrl: './seccion27-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion27FormComponent extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.6';
  @Input() override modoFormulario: boolean = false;

  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB16';
  readonly PHOTO_PREFIX_TRANSPORTE = 'fotografiaTransporteAISI';
  readonly PHOTO_PREFIX_TELECOMUNICACIONES = 'fotografiaTelecomunicacionesAISI';

  fotografiasTransporteFormMulti: FotoItem[] = [];
  fotografiasTelecomunicacionesFormMulti: FotoItem[] = [];

  telecomunicacionesConfig: TableConfig = {
    tablaKey: 'telecomunicacionesCpTabla',
    totalKey: 'medio',
    campoTotal: 'medio',
    // No percentage column for this table (descripcion is textual)
    calcularPorcentajes: false,
    estructuraInicial: [
      { medio: 'Emisoras de radio', descripcion: '' },
      { medio: 'Señales de televisión', descripcion: '' },
      { medio: 'Señales de telefonía móvil', descripcion: '' },
      { medio: 'Señal de Internet', descripcion: '' }
    ]
  };

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    protected override tableFacade: TableManagementFacade,
    private stateAdapter: ReactiveStateAdapter,
    private sanitizer: DomSanitizer,
    autoLoader: AutoBackendDataLoaderService,
    private groupConfig: GroupConfigService
  ) {
    super(cdRef, autoLoader, injector, undefined, tableFacade);
  }

  protected override onInitCustom(): void {
    if (this.modoFormulario) {
      if (this.seccionId) {
        setTimeout(() => {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }, 0);
      }
      this.stateAdapter.datos$.subscribe(() => {
        if (this.seccionId) {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }
      });
    }

    // Ensure cuadro title/source fields exist for the telecomunicaciones cuadro
    const keys = ['cuadroTituloTelecomunicaciones', 'cuadroFuenteTelecomunicaciones'];
    try {
      for (const k of keys) {
        const val = this.projectFacade.selectField(this.seccionId, null, k)();
        if (val === undefined || val === null) this.onFieldChange(k, '');
      }
    } catch (e) {}

    // Sanitize telecomunicaciones table: remove percentage values accidentally stored in 'descripcion'
    try {
      const tablaKey = 'telecomunicacionesCpTabla';
      const tabla = this.datos[tablaKey] || this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || [];
      if (Array.isArray(tabla) && tabla.length > 0) {
        let changed = false;
        tabla.forEach((row: any) => {
          let raw = row.descripcion;
          if (raw && typeof raw === 'object' && raw.value !== undefined) raw = raw.value;
          if (typeof raw === 'string' && raw.trim().match(/^[0-9]+([.,][0-9]+)?\s*%$/)) {
            row.descripcion = '';
            changed = true;
          }
        });
        if (changed) {
          this.genericTablePersist('telecomunicacionesCpTabla', tabla);
        }
      }
    } catch (e) {}
  }



  onFotografiasTransporteChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_TRANSPORTE, fotografias);
    this.fotografiasTransporteFormMulti = [...fotografias];
  }

  onFotografiasTelecomunicacionesChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_TELECOMUNICACIONES, fotografias);
    this.fotografiasTelecomunicacionesFormMulti = [...fotografias];
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasTransporteFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TRANSPORTE,
      groupPrefix
    );
    this.fotografiasTelecomunicacionesFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TELECOMUNICACIONES,
      groupPrefix
    );
  }

  private genericTablePersist(tablaKey: string, updated?: any[]) {
    const tabla = updated || this.datos[tablaKey] || [];
    this.datos[tablaKey] = [...tabla];
    try { this.projectFacade.setTableData(this.seccionId, null, tablaKey, this.datos[tablaKey]); } catch (e) { /* noop */ }
    try {
      const FormChangeServiceToken = require('src/app/core/services/state/form-change.service').FormChangeService;
      const formChange = this.injector.get(FormChangeServiceToken, null);
      if (formChange) {
        const textPayload: any = {};
        const textKey = this.getParrafoKeyForTabla ? this.getParrafoKeyForTabla(tablaKey) : null;
        if (textKey && this.datos[textKey] !== undefined) textPayload[textKey] = this.datos[textKey];
        const payload = { [tablaKey]: this.datos[tablaKey], ...textPayload };
        formChange.persistFields(this.seccionId, 'table', payload, { notifySync: true });

        try { this.projectFacade.setField(this.seccionId, null, tablaKey, this.datos[tablaKey]); } catch (e) { /* noop */ }
        try { const ViewChildHelper = require('src/app/shared/utils/view-child-helper').ViewChildHelper; ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) { /* noop */ }
      }
    } catch (e) { /* noop */ }
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  private getParrafoKeyForTabla(tablaKey: string): string | null {
    switch (tablaKey) {
      case 'telecomunicacionesCpTabla': return null;
      default: return null;
    }
  }

  obtenerTextoTransporteCP1(): string {
    if (this.datos.textoTransporteCP1 && this.datos.textoTransporteCP1 !== '____') {
      return this.datos.textoTransporteCP1;
    }
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    return `En el CP ${centroPoblado}, la infraestructura de transporte es limitada. Dentro de la localidad solo se encuentran trochas carrozables que permiten llegar al centro poblado. Estas vías facilitan el acceso en vehículos, pero son de tierra y no están pavimentadas, lo que dificulta el tránsito en épocas de lluvias o durante el invierno. Los demás puntos poblados dentro del distrito también son accesibles mediante trochas carrozables, aunque en condiciones más precarias que las principales que permiten el acceso al centro poblado.`;
  }

  obtenerTextoTransporteCP2(): string {
    if (this.datos.textoTransporteCP2 && this.datos.textoTransporteCP2 !== '____') {
      return this.datos.textoTransporteCP2;
    }
    const ciudadOrigen = this.datos.ciudadOrigenComercio || 'Caravelí';
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const costoMin = this.datos.costoTransporteMinimo || '25';
    const costoMax = this.datos.costoTransporteMaximo || '30';
    return `Por otro lado, no existen empresas de transporte formalmente establecidas dentro de la localidad. Sin embargo, existe un servicio de transporte frecuente que es provisto por una combi todos los días lunes. El único destino de esta movilidad es la ciudad de ${ciudadOrigen}, a la cual parte cerca de las 10:30 am desde la capital distrital de ${distrito}. El costo por este servicio varía entre S/. ${costoMin} y S/. ${costoMax} por trayecto, dependiendo de la demanda y las condiciones del viaje. Es así que esta es la única opción que tienen los pobladores para desplazarse a ciudades más grandes.`;
  }

  obtenerTextoTelecomunicacionesCP1(): string {
    if (this.datos.textoTelecomunicacionesCP1 && this.datos.textoTelecomunicacionesCP1 !== '____') {
      return this.datos.textoTelecomunicacionesCP1;
    }
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    return `En el CP ${centroPoblado}, la infraestructura en telecomunicaciones proporciona acceso a diversos servicios de comunicación que conectan a la población con el resto del país. Aunque existen algunas limitaciones, los servicios disponibles permiten que los habitantes se mantengan informados y comunicados.`;
  }

  obtenerTextoTelecomunicacionesCP2(): string {
    if (this.datos.textoTelecomunicacionesCP2 && this.datos.textoTelecomunicacionesCP2 !== '____') {
      return this.datos.textoTelecomunicacionesCP2;
    }
    return `En cuanto a radiodifusión, se puede captar señal de emisoras nacionales como RPP, Nacional y Unión, las cuales sirven como importantes fuentes de información y entretenimiento para la población local. Estas emisoras proporcionan noticias, música y programas de interés general que son valorados por los habitantes del centro poblado.`;
  }

  obtenerTextoTelecomunicacionesCP3(): string {
    if (this.datos.textoTelecomunicacionesCP3 && this.datos.textoTelecomunicacionesCP3 !== '____') {
      return this.datos.textoTelecomunicacionesCP3;
    }
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    return `Respecto a la señal de televisión, el centro poblado cuenta con acceso a América TV a través de señal abierta. Adicionalmente, algunas familias en ${centroPoblado} optan por servicios de televisión satelital como DIRECTV, lo que les permite acceder a una mayor variedad de canales y contenido.\n\nEn lo que respecta a la telefonía móvil e internet, la cobertura es proporcionada por las operadoras Movistar, Claro y Entel, lo que facilita la comunicación dentro del área y con el exterior. Para el acceso a internet, la población principalmente se conecta a través de los datos móviles proporcionados por Movistar y Entel, lo que les permite mantenerse conectados para actividades cotidianas y laborales.`;
  }

  // Implement abstract methods required by AutoLoadSectionComponent
  protected getSectionKey(): string { return 'seccion27_aisi'; }
  protected getLoadParameters(): string[] | null { return this.groupConfig.getAISICCPPActivos(); }
  protected detectarCambios(): boolean { return false; }
  protected actualizarValoresConPrefijo(): void { }

}
