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
        tablaKey: 'nbiCCAyrocaTabla',
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true,
        camposParaCalcular: ['casos'],
        // Estructura inicial fija (no editable en categorías)
        estructuraInicial: [
            { categoria: 'Población en Viviendas con características físicas inadecuadas', casos: 0, porcentaje: '0%' },
            { categoria: 'Población en Viviendas con hacinamiento', casos: 0, porcentaje: '0%' },
            { categoria: 'Población en Viviendas sin servicios higiénicos', casos: 0, porcentaje: '0%' },
            { categoria: 'Población en Hogares con niños que no asisten a la escuela', casos: 0, porcentaje: '0%' }
        ],
        permiteAgregarFilas: false,
        permiteEliminarFilas: false
    }));

    readonly nbiDistritoCahuachoConfigSignal: Signal<TableConfig> = computed(() => ({
        tablaKey: 'nbiDistritoCahuachoTabla',
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true,
        camposParaCalcular: ['casos'],
        // Estructura inicial fija (no editable en categorías)
        estructuraInicial: [
            { categoria: 'Viviendas con características físicas inadecuadas', casos: 0, porcentaje: '0%' },
            { categoria: 'Viviendas con hacinamiento', casos: 0, porcentaje: '0%' },
            { categoria: 'Viviendas sin servicios higiénicos', casos: 0, porcentaje: '0%' },
            { categoria: 'Hogares con niños que no asisten a la escuela', casos: 0, porcentaje: '0%' },
            { categoria: 'Hogares con alta dependencia económica', casos: 0, porcentaje: '0%' }
        ],
        permiteAgregarFilas: false,
        permiteEliminarFilas: false
    }));

    constructor(cdRef: ChangeDetectorRef, injector: Injector) {
        super(cdRef, injector);
        console.log('[Seccion18Form] constructor seccionId=', this.seccionId);
    }

    protected override onInitCustom(): void {
        // ✅ Inicializar campos de título si no existen
        const tituloNbiCCField = this.getTituloNbiCCField();
        if (!this.datos[tituloNbiCCField]) {
            this.datos[tituloNbiCCField] = this.obtenerTituloNbiCC();
        }
        
        const tituloNbiDistritoField = this.getTituloNbiDistritoField();
        if (!this.datos[tituloNbiDistritoField]) {
            this.datos[tituloNbiDistritoField] = this.obtenerTituloNbiDistrito();
        }
        
        const fuenteNbiCCField = this.getFuenteNbiCCField();
        if (!this.datos[fuenteNbiCCField]) {
            this.datos[fuenteNbiCCField] = this.obtenerFuenteNbiCC();
        }
        
        const fuenteNbiDistritoField = this.getFuenteNbiDistritoField();
        if (!this.datos[fuenteNbiDistritoField]) {
            this.datos[fuenteNbiDistritoField] = this.obtenerFuenteNbiDistrito();
        }
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
        const grupoAISD = (this.datos as any).grupoAISD || 'Ayroca';
        const distrito = (this.datos as any).distritoSeleccionado || 'Cahuacho';
        const totalCC = this.getTotalCC();
        const totalDist = this.getTotalDistrito();
        const porcentajeHacinamientoCC = this.getPorcentajeHacinamientoCC();
        const porcentajeSinServiciosCC = this.getPorcentajeSinServiciosCC();
        const porcentajeSinServiciosDist = this.getPorcentajeSinServiciosDistrito();
        const porcentajeHacinamientoDist = this.getPorcentajeHacinamientoDistrito();

        const formatoPorcentaje = (valor: string): string => {
            if (!valor || valor === '____' || valor.trim() === '') return '';
            return ` (${valor}%)`;
        };

        const texto1 = `En primer lugar, cabe mencionar que en la CC ${grupoAISD} sehalla un total de ${totalCC} personas residentes en viviendas particulares. De este conjunto, se observa que la NBI más frecuente, según población, es la de viviendas con hacinamiento${formatoPorcentaje(porcentajeHacinamientoCC)}, seguido de la de viviendas sin servicios higiénicos${formatoPorcentaje(porcentajeSinServiciosCC)}.`;

        const texto2 = `Por otro lado, a nivel distrital de ${distrito}, de un total de ${totalDist} unidades de análisis, se sabe que el tipo de NBI más frecuente es la de viviendas sin servicios higiénicos${formatoPorcentaje(porcentajeSinServiciosDist)}, seguida de la de viviendas con hacinamiento${formatoPorcentaje(porcentajeHacinamientoDist)}. En ese sentido, se aprecia que el orden de las dos NBI mayoritarias es inverso al comparar a la CC ${grupoAISD} con el distrito de ${distrito}.`;

        return `${texto1}\n\n${texto2}`;
    }

    private getTotalCC(): string {
        const tablaKey = this.getTablaKeyNbiCC();
        const tabla = (this.datos as any)[tablaKey] || [];
        if (!tabla || !Array.isArray(tabla)) return '____';
        const total = tabla.reduce((sum: number, item: any) => {
            const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
            return sum + casos;
        }, 0);
        return total > 0 ? total.toString() : '____';
    }

    private getTotalDistrito(): string {
        const tablaKey = this.getTablaKeyNbiDistrito();
        const tabla = (this.datos as any)[tablaKey] || [];
        if (!tabla || !Array.isArray(tabla)) return '____';
        const total = tabla.reduce((sum: number, item: any) => {
            const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
            return sum + casos;
        }, 0);
        return total > 0 ? total.toString() : '____';
    }

    private getPorcentajeHacinamientoCC(): string {
        const tablaKey = this.getTablaKeyNbiCC();
        const tabla = (this.datos as any)[tablaKey] || [];
        if (!tabla || !Array.isArray(tabla)) return '____';
        const item = tabla.find((i: any) => i.categoria && i.categoria.toLowerCase().includes('hacinamiento'));
        return item?.porcentaje || '____';
    }

    private getPorcentajeSinServiciosCC(): string {
        const tablaKey = this.getTablaKeyNbiCC();
        const tabla = (this.datos as any)[tablaKey] || [];
        if (!tabla || !Array.isArray(tabla)) return '____';
        const item = tabla.find((i: any) => i.categoria && i.categoria.toLowerCase().includes('sin servicios'));
        return item?.porcentaje || '____';
    }

    private getPorcentajeSinServiciosDistrito(): string {
        const tablaKey = this.getTablaKeyNbiDistrito();
        const tabla = (this.datos as any)[tablaKey] || [];
        if (!tabla || !Array.isArray(tabla)) return '____';
        const item = tabla.find((i: any) => i.categoria && i.categoria.toLowerCase().includes('sin servicios'));
        return item?.porcentaje || '____';
    }

    private getPorcentajeHacinamientoDistrito(): string {
        const tablaKey = this.getTablaKeyNbiDistrito();
        const tabla = (this.datos as any)[tablaKey] || [];
        if (!tabla || !Array.isArray(tabla)) return '____';
        const item = tabla.find((i: any) => i.categoria && i.categoria.toLowerCase().includes('hacinamiento'));
        return item?.porcentaje || '____';
    }

    onNbiCCTableUpdated(tablaData: any[]): void {
        const tablaKey = this.getTablaKeyNbiCC();
        this.onFieldChange(tablaKey, tablaData);
    }

    onNbiDistritoTableUpdated(tablaData: any[]): void {
        const tablaKey = this.getTablaKeyNbiDistrito();
        this.onFieldChange(tablaKey, tablaData);
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

    onTituloNbiCCChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const fieldId = this.getTituloNbiCCField();
        this.onFieldChange(fieldId, input.value);
    }

    onFuenteNbiCCChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const fieldId = this.getFuenteNbiCCField();
        this.onFieldChange(fieldId, input.value);
    }

    onTituloNbiDistritoChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const fieldId = this.getTituloNbiDistritoField();
        this.onFieldChange(fieldId, input.value);
    }

    onFuenteNbiDistritoChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const fieldId = this.getFuenteNbiDistritoField();
        this.onFieldChange(fieldId, input.value);
    }
}
