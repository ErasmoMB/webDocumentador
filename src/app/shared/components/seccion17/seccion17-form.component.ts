import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, ChangeDetectorRef, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { ImageManagementFacade } from 'src/app/core/services/images/image-management.facade';
import { TableConfig, TableColumn } from 'src/app/core/services/table-management.service';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { SECCION17_PHOTO_PREFIX, SECCION17_DEFAULT_TEXTS } from './seccion17-constants';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, CoreSharedModule],
    selector: 'app-seccion17-form',
    templateUrl: './seccion17-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion17FormComponent extends BaseSectionComponent implements OnDestroy {
    @Input() override seccionId: string = '3.1.4.A.1.13';
    @Input() override modoFormulario: boolean = false;

    override readonly PHOTO_PREFIX = 'fotografiaIDH';
    override useReactiveSync: boolean = true;

    // ✅ HELPER PARA OBTENER PREFIJO
    private obtenerPrefijo(): string {
        return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
    }

    // ✅ OVERRIDE: onFieldChange CON PREFIJO AUTOMÁTICO
    override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
        const prefijo = this.obtenerPrefijo();
        const campoConPrefijo = prefijo ? `${fieldId}${prefijo}` : fieldId;
        super.onFieldChange(campoConPrefijo, value, options);
    }

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

    // Configuración de tabla IDH como Signal
    readonly indiceDesarrolloHumanoConfigSignal: Signal<TableConfig> = computed(() => ({
        tablaKey: this.getTablaKeyIDH(),
        totalKey: 'poblacion',
        campoTotal: 'poblacion',
        campoPorcentaje: 'idh',
        permiteAgregarFilas: false,
        permiteEliminarFilas: false,
        noInicializarDesdeEstructura: false,
        estructuraInicial: [
            { poblacion: 0, rankIdh1: 0, idh: '0.000', rankEsperanza: 0, esperanzaVida: '0.0', rankEducacion1: 0, educacion: '0.0%', rankEducacion2: 0, anosEducacion: '0.0', rankAnios: 0, ingreso: '0.0', rankIngreso: 0 }
        ]
    }));

    // Columnas de la tabla con estructura completa de 12 columnas (6 grupos x 2)
    readonly columnasIDH: TableColumn[] = [
        { field: 'poblacion', label: 'Habitantes', type: 'number', placeholder: '0' },
        { field: 'rankIdh1', label: 'Rank', type: 'number', placeholder: '0' },
        { field: 'idh', label: 'IDH', type: 'text', placeholder: '0.000' },
        { field: 'rankEsperanza', label: 'Rank', type: 'number', placeholder: '0' },
        { field: 'esperanzaVida', label: 'Años', type: 'text', placeholder: '0.0' },
        { field: 'rankEducacion1', label: 'Rank', type: 'number', placeholder: '0' },
        { field: 'educacion', label: 'Porcentaje', type: 'text', placeholder: '0.0%' },
        { field: 'rankEducacion2', label: 'Rank', type: 'number', placeholder: '0' },
        { field: 'anosEducacion', label: 'Años', type: 'text', placeholder: '0.0' },
        { field: 'rankAnios', label: 'Rank', type: 'number', placeholder: '0' },
        { field: 'ingreso', label: 'N.S. mes', type: 'text', placeholder: '0.0' },
        { field: 'rankIngreso', label: 'Rank', type: 'number', placeholder: '0' }
    ];

    constructor(
        cdRef: ChangeDetectorRef,
        injector: Injector
    ) {
        super(cdRef, injector);
    }

    protected override detectarCambios(): boolean {
        return false;
    }

    protected override actualizarValoresConPrefijo(): void { }

    protected override actualizarDatosCustom(): void {
        // Las fotos se cargan reactivamente a través de fotografiasSignal
    }

    override onFotografiasChange(fotografias: FotoItem[]): void {
        const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
        this.imageFacade.saveImages(
            this.seccionId,
            this.PHOTO_PREFIX,
            fotografias,
            groupPrefix
        );
        this.cdRef.detectChanges();
    }

    // === LÓGICA DE PÁRRAFOS ===

    getFieldIdTextoIDH(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        return prefijo ? `textoIndiceDesarrolloHumano${prefijo}` : 'textoIndiceDesarrolloHumano';
    }

    obtenerDistrito(): string {
        return (this.datos as any)['distritoSeleccionado'] || 'Cahuacho';
    }

    obtenerTextoIDHCompleto(): string {
        const fieldId = this.getFieldIdTextoIDH();
        const textoPersonalizado = (this.datos as any)[fieldId] || (this.datos as any)['textoIndiceDesarrolloHumano'];

        const distrito = (this.datos as any)['distritoSeleccionado'] || 'Cahuacho';
        const idh = this.getIDH();
        const rankIdh = this.getRankIDH();

        const idhValor = (idh !== '____' && idh !== '0.000' && idh !== '0,000') ? idh : '____';
        const rankValor = (rankIdh !== '____' && rankIdh !== '0') ? rankIdh : '____';

        const textoPorDefecto = `El Índice de Desarrollo Humano (IDH) mide el logro medio de un país (en nuestro país se mide también a niveles departamentales, provinciales y distritales) tratándose de un índice compuesto. El IDH contiene tres variables: la esperanza de vida al nacer, el logro educacional (alfabetización de adultos y la tasa bruta de matriculación primaria, secundaria y terciaria combinada) y el PIB real per cápita (PPA en dólares). El ingreso se considera en el IDH en representación de un nivel decente de vida y en reemplazo de todas las opciones humanas que no se reflejan en las otras dos dimensiones.\n\nSegún el informe del PNUD para el año 2019, el Índice de Desarrollo Humano del distrito de ${distrito} es de ${idhValor}. Es así que ocupa el puesto N°${rankValor} en el país, siendo una de las divisiones políticas de nivel subnacional con uno de los IDH más bajos.`;

        if (textoPersonalizado && textoPersonalizado !== '____' && String(textoPersonalizado).trim() !== '') {
            let textoFinal = textoPersonalizado;
            if (idhValor !== '____') {
                textoFinal = textoFinal.replace(/0\.000|0,000|____/g, idhValor);
            }
            if (rankValor !== '____') {
                textoFinal = textoFinal.replace(/N°\s*____/g, `N°${rankValor}`);
                textoFinal = textoFinal.replace(/puesto N°\s*____/g, `puesto N°${rankValor}`);
            }
            return textoFinal;
        }

        return textoPorDefecto;
    }

    // === LÓGICA DE TÍTULOS Y FUENTES ===

    getTituloIDHField(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        return prefijo ? `tituloIDH${prefijo}` : 'tituloIDH';
    }

    getFuenteIDHField(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        return prefijo ? `fuenteIDH${prefijo}` : 'fuenteIDH';
    }

    obtenerTituloIDH(): string {
        const fieldId = this.getTituloIDHField();
        return (this.datos as any)[fieldId] || (this.datos as any)['tituloIDH'] || '';
    }

    obtenerFuenteIDH(): string {
        const fieldId = this.getFuenteIDHField();
        return (this.datos as any)[fieldId] || (this.datos as any)['fuenteIDH'] || '';
    }

    onTituloIDHChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.onFieldChange('tituloIDH', input.value);  // Sin prefijo, se agrega en override
    }

    onFuenteIDHChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.onFieldChange('fuenteIDH', input.value);  // Sin prefijo, se agrega en override
    }

    // === LÓGICA DE TABLA ===

    getTablaKeyIDH(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        return prefijo ? `indiceDesarrolloHumanoTabla${prefijo}` : 'indiceDesarrolloHumanoTabla';
    }

    getIndiceDesarrolloHumanoTabla(): any[] {
        const tablaKey = this.getTablaKeyIDH();
        const tabla = (this.datos as any)[tablaKey] || (this.datos as any)['indiceDesarrolloHumanoTabla'] || [];
        return Array.isArray(tabla) ? tabla : [];
    }

    getIDH(): string {
        const tabla = this.getIndiceDesarrolloHumanoTabla();
        if (!tabla || tabla.length === 0) return '____';
        const item = tabla[0];
        return item?.idh || '____';
    }

    getRankIDH(): string {
        const tabla = this.getIndiceDesarrolloHumanoTabla();
        if (!tabla || tabla.length === 0) return '____';
        const item = tabla[0];
        return item?.rankIdh1 || '____';
    }

    onTablaActualizada(tablaData: any[]): void {
        const tablaKey = this.getTablaKeyIDH();
        this.onFieldChange(tablaKey, tablaData);
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
