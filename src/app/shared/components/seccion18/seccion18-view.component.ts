import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, ChangeDetectorRef, Signal, computed, effect } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { ImageManagementFacade } from 'src/app/core/services/image/image-management.facade';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
import { TableNumberingService } from 'src/app/core/services/numbering/table-numbering.service';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, CoreSharedModule],
    selector: 'app-seccion18-view',
    templateUrl: './seccion18-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion18ViewComponent extends BaseSectionComponent implements OnDestroy {
    @Input() override seccionId: string = '3.1.4.A.1.14';
    @Input() override modoFormulario: boolean = false;

    override readonly PHOTO_PREFIX = 'fotografiaNBI';
    override useReactiveSync: boolean = true;

    readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
        this.projectFacade.selectSectionFields(this.seccionId, null)()
    );

    readonly fotografiasSignal: Signal<FotoItem[]> = computed(() => {
        const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
        return this.imageFacade.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix);
    });

    // Signal de prefijo de foto para aislamiento AISD
    readonly photoPrefixSignal: Signal<string> = computed(() => {
        const prefijo = this.obtenerPrefijoGrupo();
        return prefijo ? `${this.PHOTO_PREFIX}${prefijo}` : this.PHOTO_PREFIX;
    });

    // photoFieldsHash con prefijo para reactividad de fotos
    readonly photoFieldsHash: Signal<string> = computed(() => {
        let hash = '';
        const prefijo = this.obtenerPrefijoGrupo();
        const prefix = `${this.PHOTO_PREFIX}${prefijo}`;
        for (let i = 1; i <= 10; i++) {
            const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
            const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
            const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
            hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
        }
        return hash;
    });

    constructor(
        cdRef: ChangeDetectorRef,
        injector: Injector,
        private sanitizer: DomSanitizer,
    private tableNumbering: TableNumberingService
    ) {
        super(cdRef, injector);

        // ✅ Punto 4: Effect para sincronización
        effect(() => {
            this.formDataSignal();  // Depende del signal
            this.photoFieldsHash();  // Depende del hash de fotos
            this.cdRef.markForCheck();  // ← CRÍTICO: fuerza re-render
        });

        console.log('[Seccion18View] constructor seccionId=', this.seccionId);
    }

    protected override detectarCambios(): boolean {
        return false;
    }

    protected override actualizarValoresConPrefijo(): void {
    }

    protected override actualizarDatosCustom(): void {
    }

    override getFotografiasVista(): FotoItem[] {
        return this.fotografiasSignal();
    }

    private tieneContenidoReal(tabla: any[]): boolean {
        if (!tabla || !Array.isArray(tabla) || tabla.length === 0) return false;
        return tabla.some(item => {
            const categoria = item.categoria?.toString().trim() || '';
            const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
            return categoria !== '' || casos > 0;
        });
    }

    private getTableNbiCC(): any[] {
        const prefijo = this.obtenerPrefijoGrupo();
        const data = this.formDataSignal();
        const tablaConPrefijo = prefijo ? (data as any)[`nbiCCAyrocaTabla${prefijo}`] : null;
        if (tablaConPrefijo && this.tieneContenidoReal(tablaConPrefijo)) {
            return tablaConPrefijo;
        }
        return (data as any).nbiCCAyrocaTabla || [];
    }

    private getTableNbiDistrito(): any[] {
        const prefijo = this.obtenerPrefijoGrupo();
        const data = this.formDataSignal();
        const tablaConPrefijo = prefijo ? (data as any)[`nbiDistritoCahuachoTabla${prefijo}`] : null;
        if (tablaConPrefijo && this.tieneContenidoReal(tablaConPrefijo)) {
            return tablaConPrefijo;
        }
        return (data as any).nbiDistritoCahuachoTabla || [];
    }

    getNbiCCAyrocaConPorcentajes(): any[] {
        const tabla = this.getTableNbiCC();
        const cuadro = this.tableNumbering.getGlobalTableNumber(this.seccionId, 0);
        return TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
    }

    getNbiDistritoCahuachoConPorcentajes(): any[] {
        const tabla = this.getTableNbiDistrito();
        const cuadro = this.tableNumbering.getGlobalTableNumber(this.seccionId, 1);
        return TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
    }

    getNombreComunidad(): string {
        const data = this.formDataSignal();
        return PrefijoHelper.obtenerValorConPrefijo(data, 'grupoAISD', this.seccionId) || 'Ayroca';
    }

    getTextoNBI(): string {
        const data = this.formDataSignal();
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldId = prefijo ? `textoNecesidadesBasicasInsatisfechas${prefijo}` : 'textoNecesidadesBasicasInsatisfechas';
        const textoPersonalizado = (data as any)[fieldId] || (data as any)['textoNecesidadesBasicasInsatisfechas'];
        if (textoPersonalizado && textoPersonalizado !== '____' && String(textoPersonalizado).trim() !== '') {
            return textoPersonalizado;
        }
        return this.generarTextoDefault(data);
    }

    private generarTextoDefault(data: Record<string, any>): string {
        const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(data, 'grupoAISD', this.seccionId) || 'Ayroca';
        const distrito = (data as any).distritoSeleccionado || 'Cahuacho';
        const totalCC = this.getTotalCC(data);
        const totalDist = this.getTotalDistrito(data);
        const porcentajeHacinamientoCC = this.getPorcentajeHacinamientoCC(data);
        const porcentajeSinServiciosCC = this.getPorcentajeSinServiciosCC(data);
        const porcentajeSinServiciosDist = this.getPorcentajeSinServiciosDistrito(data);
        const porcentajeHacinamientoDist = this.getPorcentajeHacinamientoDistrito(data);

        const formatoPorcentaje = (valor: string): string => {
            if (!valor || valor === '____' || valor.trim() === '') return '';
            return ` (${valor}%)`;
        };

        const texto1 = `En primer lugar, cabe mencionar que en la CC ${grupoAISD} sehalla un total de ${totalCC} personas residentes en viviendas particulares. De este conjunto, se observa que la NBI más frecuente, según población, es la de viviendas con hacinamiento${formatoPorcentaje(porcentajeHacinamientoCC)}, seguido de la de viviendas sin servicios higiénicos${formatoPorcentaje(porcentajeSinServiciosCC)}.`;

        const texto2 = `Por otro lado, a nivel distrital de ${distrito}, de un total de ${totalDist} unidades de análisis, se sabe que el tipo de NBI más frecuente es la de viviendas sin servicios higiénicos${formatoPorcentaje(porcentajeSinServiciosDist)}, seguida de la de viviendas con hacinamiento${formatoPorcentaje(porcentajeHacinamientoDist)}. En ese sentido, se aprecia que el orden de las dos NBI mayoritarias es inverso al comparar a la CC ${grupoAISD} con el distrito de ${distrito}.`;

        return `${texto1}\n\n${texto2}`;
    }

    private getTotalCC(data: Record<string, any>): string {
        const tabla = this.getTableNbiCC();
        if (!tabla || !Array.isArray(tabla)) return '____';
        const total = tabla.reduce((sum: number, item: any) => {
            const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
            return sum + casos;
        }, 0);
        return total > 0 ? total.toString() : '____';
    }

    private getTotalDistrito(data: Record<string, any>): string {
        const tabla = this.getTableNbiDistrito();
        if (!tabla || !Array.isArray(tabla)) return '____';
        const total = tabla.reduce((sum: number, item: any) => {
            const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
            return sum + casos;
        }, 0);
        return total > 0 ? total.toString() : '____';
    }

    private getPorcentajeHacinamientoCC(data: Record<string, any>): string {
        const tabla = this.getTableNbiCC();
        if (!tabla || !Array.isArray(tabla)) return '____';
        const item = tabla.find((i: any) => i.categoria && i.categoria.toLowerCase().includes('hacinamiento'));
        return item?.porcentaje || '____';
    }

    private getPorcentajeSinServiciosCC(data: Record<string, any>): string {
        const tabla = this.getTableNbiCC();
        if (!tabla || !Array.isArray(tabla)) return '____';
        const item = tabla.find((i: any) => i.categoria && i.categoria.toLowerCase().includes('sin servicios'));
        return item?.porcentaje || '____';
    }

    private getPorcentajeSinServiciosDistrito(data: Record<string, any>): string {
        const tabla = this.getTableNbiDistrito();
        if (!tabla || !Array.isArray(tabla)) return '____';
        const item = tabla.find((i: any) => i.categoria && i.categoria.toLowerCase().includes('sin servicios'));
        return item?.porcentaje || '____';
    }

    private getPorcentajeHacinamientoDistrito(data: Record<string, any>): string {
        const tabla = this.getTableNbiDistrito();
        if (!tabla || !Array.isArray(tabla)) return '____';
        const item = tabla.find((i: any) => i.categoria && i.categoria.toLowerCase().includes('hacinamiento'));
        return item?.porcentaje || '____';
    }

    getTextoNBIConResaltado(): SafeHtml {
        const texto = this.getTextoNBI();
        const data = this.formDataSignal();
        const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(data, 'grupoAISD', this.seccionId) || 'Ayroca';
        const distrito = (data as any).distritoSeleccionado || 'Cahuacho';
        const totalCC = this.getTotalCC(data);
        const totalDist = this.getTotalDistrito(data);

        let html = this.escapeHtml(texto);
        html = html.replace(/ En primer lugar/g, '<br/><br/>En primer lugar');
        html = html.replace(new RegExp(this.escapeRegex(totalCC), 'g'), `<span class="data-section">${this.escapeHtml(totalCC)}</span>`);
        html = html.replace(new RegExp(this.escapeRegex(distrito), 'g'), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
        html = html.replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
        html = html.replace(/ viviendas con hacinamiento/g, ` <span class="data-source">viviendas con hacinamiento</span>`);
        html = html.replace(/ viviendas sin servicios higiénicos/g, ` <span class="data-source">viviendas sin servicios higiénicos</span>`);

        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    private escapeHtml(text: string): string {
        if (!text) return '';
        return text.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
    }

    private escapeRegex(text: string): string {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ✅ Métodos para obtener títulos y fuentes editables (como en seccion17)

    getTituloNbiCC(): string {
        const data = this.formDataSignal();
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldId = prefijo ? `tituloNbiCC${prefijo}` : 'tituloNbiCC';
        const titulo = (data as any)[fieldId];
        if (titulo && String(titulo).trim() !== '') return titulo;
        const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(data, 'grupoAISD', this.seccionId) || 'Ayroca';
        return `Necesidades Básicas Insatisfechas (NBI) según población – CC ${grupoAISD} (2017)`;
    }

    getFuenteNbiCC(): string {
        const data = this.formDataSignal();
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldId = prefijo ? `fuenteNbiCC${prefijo}` : 'fuenteNbiCC';
        const fuente = (data as any)[fieldId];
        if (fuente && String(fuente).trim() !== '') return fuente;
        return 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    }

    getTituloNbiDistrito(): string {
        const data = this.formDataSignal();
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldId = prefijo ? `tituloNbiDistrito${prefijo}` : 'tituloNbiDistrito';
        const titulo = (data as any)[fieldId];
        if (titulo && String(titulo).trim() !== '') return titulo;
        const distrito = (data as any).distritoSeleccionado || 'Cahuacho';
        return `Tipos de NBI existentes – Distrito ${distrito} (2017)`;
    }

    getFuenteNbiDistrito(): string {
        const data = this.formDataSignal();
        const prefijo = this.obtenerPrefijoGrupo();
        const fieldId = prefijo ? `fuenteNbiDistrito${prefijo}` : 'fuenteNbiDistrito';
        const fuente = (data as any)[fieldId];
        if (fuente && String(fuente).trim() !== '') return fuente;
        return 'Perú: Mapa de Necesidades Básicas Insatisfechas (NBI), 1993, 2007 y 2017';
    }
}
