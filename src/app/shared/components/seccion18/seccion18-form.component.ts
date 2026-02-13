import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, ChangeDetectorRef, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { ImageManagementFacade } from 'src/app/core/services/image/image-management.facade';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { SECCION18_PHOTO_PREFIX, SECCION18_DEFAULT_TEXTS, SECCION18_TEMPLATES } from './seccion18-constants';

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

    // ✅ EXPORTAR CONSTANTES AL TEMPLATE
    readonly SECCION18_TEMPLATES = SECCION18_TEMPLATES;
    readonly SECCION18_DEFAULT_TEXTS = SECCION18_DEFAULT_TEXTS;

    // ✅ HELPER PARA OBTENER PREFIJO
    private obtenerPrefijo(): string {
        return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
    }

    // ✅ SIGNALS REACTIVAS CON createAutoSyncField
    readonly textoNBI = this.createAutoSyncField('textoNecesidadesBasicasInsatisfechas', '');
    readonly tituloNbiCC = this.createAutoSyncField('tituloNbiCC', '');
    readonly fuenteNbiCC = this.createAutoSyncField('fuenteNbiCC', '');
    readonly tituloNbiDistrito = this.createAutoSyncField('tituloNbiDistrito', '');
    readonly fuenteNbiDistrito = this.createAutoSyncField('fuenteNbiDistrito', '');

    // Signal para fotos reactivas
    readonly fotografiasSignal: Signal<FotoItem[]> = computed(() => {
        const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
        return this.imageFacade.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix);
    });

    // Signal de prefijo de foto para aislamiento AISD
    readonly photoPrefixSignal: Signal<string> = computed(() => {
        const prefijo = this.obtenerPrefijo();
        return prefijo ? `${this.PHOTO_PREFIX}${prefijo}` : this.PHOTO_PREFIX;
    });

    // photoFieldsHash con prefijo para reactividad de fotos
    readonly photoFieldsHash: Signal<string> = computed(() => {
        let hash = '';
        const prefijo = this.obtenerPrefijo();
        const prefix = `${this.PHOTO_PREFIX}${prefijo}`;
        for (let i = 1; i <= 10; i++) {
            const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
            const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
            const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
            hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
        }
        return hash;
    });

    readonly nbiCCAyrocaConfigSignal: Signal<TableConfig> = computed(() => ({
        tablaKey: this.getTablaKeyNbiCC(),
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true,
        camposParaCalcular: ['casos'],
        noInicializarDesdeEstructura: true,
        permiteAgregarFilas: false,
        permiteEliminarFilas: false
    }));

    readonly nbiDistritoCahuachoConfigSignal: Signal<TableConfig> = computed(() => ({
        tablaKey: this.getTablaKeyNbiDistrito(),
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true,
        camposParaCalcular: ['casos'],
        noInicializarDesdeEstructura: true,
        permiteAgregarFilas: false,
        permiteEliminarFilas: false
    }));

    constructor(cdRef: ChangeDetectorRef, injector: Injector) {
        super(cdRef, injector);
        this.inicializarCamposDesdeStore();
    }

    /**
     * ✅ Inicializar campos desde store con fallback
     */
    private inicializarCamposDesdeStore(): void {
        const prefijo = this.obtenerPrefijo();
        const campoTexto = prefijo ? `textoNecesidadesBasicasInsatisfechas${prefijo}` : 'textoNecesidadesBasicasInsatisfechas';
        const campoTituloCC = prefijo ? `tituloNbiCC${prefijo}` : 'tituloNbiCC';
        const campoFuenteCC = prefijo ? `fuenteNbiCC${prefijo}` : 'fuenteNbiCC';
        const campoTituloDist = prefijo ? `tituloNbiDistrito${prefijo}` : 'tituloNbiDistrito';
        const campoFuenteDist = prefijo ? `fuenteNbiDistrito${prefijo}` : 'fuenteNbiDistrito';

        const textoGuardado = this.projectFacade.selectField(this.seccionId, null, campoTexto)();
        if (textoGuardado) this.textoNBI.update(textoGuardado);

        const tituloGuardado = this.projectFacade.selectField(this.seccionId, null, campoTituloCC)();
        if (tituloGuardado) this.tituloNbiCC.update(tituloGuardado);

        const fuenteGuardada = this.projectFacade.selectField(this.seccionId, null, campoFuenteCC)();
        if (fuenteGuardada) this.fuenteNbiCC.update(fuenteGuardada);

        const tituloDistGuardado = this.projectFacade.selectField(this.seccionId, null, campoTituloDist)();
        if (tituloDistGuardado) this.tituloNbiDistrito.update(tituloDistGuardado);

        const fuenteDistGuardada = this.projectFacade.selectField(this.seccionId, null, campoFuenteDist)();
        if (fuenteDistGuardada) this.fuenteNbiDistrito.update(fuenteDistGuardada);
    }

    protected override detectarCambios(): boolean {
        return false;
    }

    protected override actualizarValoresConPrefijo(): void { }

    protected override actualizarDatosCustom(): void { }

    override onFotografiasChange(fotografias: FotoItem[]): void {
        const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
        this.imageFacade.saveImages(this.seccionId, this.PHOTO_PREFIX, fotografias, groupPrefix);
        this.cdRef.detectChanges();
    }

    getTablaKeyNbiCC(): string {
        const prefijo = this.obtenerPrefijo();
        return prefijo ? `nbiCCAyrocaTabla${prefijo}` : 'nbiCCAyrocaTabla';
    }

    getTablaKeyNbiDistrito(): string {
        const prefijo = this.obtenerPrefijo();
        return prefijo ? `nbiDistritoCahuachoTabla${prefijo}` : 'nbiDistritoCahuachoTabla';
    }

    getFieldIdTextoNBI(): string {
        const prefijo = this.obtenerPrefijo();
        return prefijo ? `textoNecesidadesBasicasInsatisfechas${prefijo}` : 'textoNecesidadesBasicasInsatisfechas';
    }

    obtenerTextoCompleto(): string {
        const textoPersonalizado = this.textoNBI.value();
        if (textoPersonalizado && textoPersonalizado !== '____' && String(textoPersonalizado).trim() !== '') {
            return textoPersonalizado;
        }
        return this.generarTextoDefault();
    }

    private generarTextoDefault(): string {
        const grupoAISD = this.projectFacade.selectField(this.seccionId, null, 'grupoAISD')() || 'Ayroca';
        const distrito = this.projectFacade.selectField(this.seccionId, null, 'distritoSeleccionado')() || 'Cahuacho';
        const totalCC = this.getTotalCC();
        const totalDist = this.getTotalDistrito();
        const porcentajeHacinamientoCC = this.getPorcentajeHacinamientoCC();
        const porcentajeSinServiciosCC = this.getPorcentajeSinServiciosCC();
        const porcentajeSinServiciosDist = this.getPorcentajeSinServiciosDistrito();
        const porcentajeHacinamientoDist = this.getPorcentajeHacinamientoDistrito();

        return SECCION18_DEFAULT_TEXTS.textoNBIDefault(
            grupoAISD, distrito, totalCC, totalDist, 
            porcentajeHacinamientoCC, porcentajeSinServiciosCC,
            porcentajeSinServiciosDist, porcentajeHacinamientoDist
        );
    }

    private getTotalCC(): string {
        const tablaKey = this.getTablaKeyNbiCC();
        const tabla = this.projectFacade.selectField(this.seccionId, null, tablaKey)() || [];
        if (!tabla || !Array.isArray(tabla)) return '____';
        const total = tabla.reduce((sum: number, item: any) => {
            const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
            return sum + casos;
        }, 0);
        return total > 0 ? total.toString() : '____';
    }

    private getTotalDistrito(): string {
        const tablaKey = this.getTablaKeyNbiDistrito();
        const tabla = this.projectFacade.selectField(this.seccionId, null, tablaKey)() || [];
        if (!tabla || !Array.isArray(tabla)) return '____';
        const total = tabla.reduce((sum: number, item: any) => {
            const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
            return sum + casos;
        }, 0);
        return total > 0 ? total.toString() : '____';
    }

    private getPorcentajeHacinamientoCC(): string {
        const tablaKey = this.getTablaKeyNbiCC();
        const tabla = this.projectFacade.selectField(this.seccionId, null, tablaKey)() || [];
        if (!tabla || !Array.isArray(tabla)) return '____';
        const item = tabla.find((i: any) => i.categoria && i.categoria.toLowerCase().includes('hacinamiento'));
        return item?.porcentaje || '____';
    }

    private getPorcentajeSinServiciosCC(): string {
        const tablaKey = this.getTablaKeyNbiCC();
        const tabla = this.projectFacade.selectField(this.seccionId, null, tablaKey)() || [];
        if (!tabla || !Array.isArray(tabla)) return '____';
        const item = tabla.find((i: any) => i.categoria && i.categoria.toLowerCase().includes('sin servicios'));
        return item?.porcentaje || '____';
    }

    private getPorcentajeSinServiciosDistrito(): string {
        const tablaKey = this.getTablaKeyNbiDistrito();
        const tabla = this.projectFacade.selectField(this.seccionId, null, tablaKey)() || [];
        if (!tabla || !Array.isArray(tabla)) return '____';
        const item = tabla.find((i: any) => i.categoria && i.categoria.toLowerCase().includes('sin servicios'));
        return item?.porcentaje || '____';
    }

    private getPorcentajeHacinamientoDistrito(): string {
        const tablaKey = this.getTablaKeyNbiDistrito();
        const tabla = this.projectFacade.selectField(this.seccionId, null, tablaKey)() || [];
        if (!tabla || !Array.isArray(tabla)) return '____';
        const item = tabla.find((i: any) => i.categoria && i.categoria.toLowerCase().includes('hacinamiento'));
        return item?.porcentaje || '____';
    }

    onNbiCCTableUpdated(tablaData: any[]): void {
        const tablaKey = this.getTablaKeyNbiCC();
        this.projectFacade.setField(this.seccionId, null, tablaKey, tablaData);
        this.cdRef.markForCheck();
    }

    onNbiDistritoTableUpdated(tablaData: any[]): void {
        const tablaKey = this.getTablaKeyNbiDistrito();
        this.projectFacade.setField(this.seccionId, null, tablaKey, tablaData);
        this.cdRef.markForCheck();
    }

    // ✅ Métodos para obtener campos de título y fuente (como en seccion17)

    getTituloNbiCCField(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        return prefijo ? `tituloNbiCC${prefijo}` : 'tituloNbiCC';
    }

    getFuenteNbiCCField(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        return prefijo ? `fuenteNbiCC${prefijo}` : 'fuenteNbiCC';
    }

    getTituloNbiDistritoField(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        return prefijo ? `tituloNbiDistrito${prefijo}` : 'tituloNbiDistrito';
    }

    getFuenteNbiDistritoField(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        return prefijo ? `fuenteNbiDistrito${prefijo}` : 'fuenteNbiDistrito';
    }

    obtenerTituloNbiCC(): string {
        const fieldId = this.getTituloNbiCCField();
        const titulo = (this.datos as any)[fieldId];
        if (titulo && String(titulo).trim() !== '') return titulo;
        const grupoAISD = (this.datos as any).grupoAISD || 'Ayroca';
        return `Necesidades Básicas Insatisfechas (NBI) según población – CC ${grupoAISD} (2017)`;
    }

    obtenerFuenteNbiCC(): string {
        const fieldId = this.getFuenteNbiCCField();
        const fuente = (this.datos as any)[fieldId];
        if (fuente && String(fuente).trim() !== '') return fuente;
        return 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    }

    obtenerTituloNbiDistrito(): string {
        const fieldId = this.getTituloNbiDistritoField();
        const titulo = (this.datos as any)[fieldId];
        if (titulo && String(titulo).trim() !== '') return titulo;
        const distrito = (this.datos as any).distritoSeleccionado || 'Cahuacho';
        return `Tipos de NBI existentes – Distrito ${distrito} (2017)`;
    }

    obtenerFuenteNbiDistrito(): string {
        const fieldId = this.getFuenteNbiDistritoField();
        const fuente = (this.datos as any)[fieldId];
        if (fuente && String(fuente).trim() !== '') return fuente;
        return 'Perú: Mapa de Necesidades Básicas Insatisfechas (NBI), 1993, 2007 y 2017';
    }

    // ✅ Handlers para cambios en título y fuente
    // ✅ IMPORTANTE: Pasar campo SIN prefijo, el override onFieldChange() agrega prefijo automáticamente

    onTituloNbiCCChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.onFieldChange('tituloNbiCC', input.value);  // Sin prefijo, se agrega en override
    }

    onFuenteNbiCCChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.onFieldChange('fuenteNbiCC', input.value);  // Sin prefijo, se agrega en override
    }

    onTituloNbiDistritoChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.onFieldChange('tituloNbiDistrito', input.value);  // Sin prefijo, se agrega en override
    }

    onFuenteNbiDistritoChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.onFieldChange('fuenteNbiDistrito', input.value);  // Sin prefijo, se agrega en override
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
