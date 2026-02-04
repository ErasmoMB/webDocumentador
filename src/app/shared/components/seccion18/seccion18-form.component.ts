import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, ChangeDetectorRef, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { ImageManagementFacade } from 'src/app/core/services/images/image-management.facade';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, CoreSharedModule],
    selector: 'app-seccion18-form',
    templateUrl: './seccion18-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion18FormComponent extends BaseSectionComponent implements OnDestroy {
    @Input() override seccionId: string = '3.1.4.A.1.14';
    @Input() override modoFormulario: boolean = false;

    override readonly PHOTO_PREFIX = 'fotografiaNBI';
    override useReactiveSync: boolean = true;

    readonly fotografiasSignal: Signal<FotoItem[]> = computed(() => {
        const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
        return this.imageFacade.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix);
    });

    readonly nbiCCAyrocaConfigSignal: Signal<TableConfig> = computed(() => ({
        tablaKey: this.getTablaKeyNbiCC(),
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0%' }],
        calcularPorcentajes: true,
        camposParaCalcular: ['casos']
    }));

    readonly nbiDistritoCahuachoConfigSignal: Signal<TableConfig> = computed(() => ({
        tablaKey: this.getTablaKeyNbiDistrito(),
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0%' }],
        calcularPorcentajes: true,
        camposParaCalcular: ['casos']
    }));

    constructor(cdRef: ChangeDetectorRef, injector: Injector) {
        super(cdRef, injector);
        console.log('[Seccion18Form] constructor seccionId=', this.seccionId);
    }

    protected override detectarCambios(): boolean {
        return false;
    }

    protected override actualizarValoresConPrefijo(): void {
        const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
        this.datos.grupoAISD = grupoAISD || null;
    }

    protected override actualizarDatosCustom(): void {
    }

    override onFotografiasChange(fotografias: FotoItem[]): void {
        const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
        this.imageFacade.saveImages(this.seccionId, this.PHOTO_PREFIX, fotografias, groupPrefix);
        this.cdRef.detectChanges();
    }

    getTablaKeyNbiCC(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        return prefijo ? `nbiCCAyrocaTabla${prefijo}` : 'nbiCCAyrocaTabla';
    }

    getTablaKeyNbiDistrito(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        return prefijo ? `nbiDistritoCahuachoTabla${prefijo}` : 'nbiDistritoCahuachoTabla';
    }

    getFieldIdTextoNBI(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        return prefijo ? `textoNecesidadesBasicasInsatisfechas${prefijo}` : 'textoNecesidadesBasicasInsatisfechas';
    }

    obtenerTextoCompleto(): string {
        const fieldId = this.getFieldIdTextoNBI();
        const textoPersonalizado = (this.datos as any)[fieldId] || (this.datos as any)['textoNecesidadesBasicasInsatisfechas'];
        if (textoPersonalizado && textoPersonalizado !== '____' && String(textoPersonalizado).trim() !== '') {
            return textoPersonalizado;
        }
        return this.generarTextoDefault();
    }

    private generarTextoDefault(): string {
        const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || 'Ayroca';
        const distrito = (this.datos as any).distritoSeleccionado || 'Cahuacho';
        return `En primer lugar, cabe mencionar que en la CC ${grupoAISD} sehalla un total de ____ personas residentes en viviendas particulares...`;
    }

    onNbiCCTableUpdated(tablaData: any[]): void {
        const tablaKey = this.getTablaKeyNbiCC();
        this.onFieldChange(tablaKey, tablaData);
    }

    onNbiDistritoTableUpdated(tablaData: any[]): void {
        const tablaKey = this.getTablaKeyNbiDistrito();
        this.onFieldChange(tablaKey, tablaData);
    }
}
