import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, ChangeDetectorRef, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { TableWrapperComponent } from '../table-wrapper/table-wrapper.component';
import { SECCION17_TEMPLATES, SECCION17_DEFAULT_TEXTS } from './seccion17-constants';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, CoreSharedModule, ImageUploadComponent, TableWrapperComponent],
    selector: 'app-seccion17-view',
    templateUrl: './seccion17-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion17ViewComponent extends BaseSectionComponent implements OnDestroy {
    @Input() override seccionId: string = '3.1.4.A.1.13';
    @Input() override modoFormulario: boolean = false;

    override readonly PHOTO_PREFIX = 'fotografiaIDH';
    override useReactiveSync: boolean = true;

    // ✅ EXPORTAR CONSTANTES AL TEMPLATE
    readonly SECCION17_TEMPLATES = SECCION17_TEMPLATES;
    readonly SECCION17_DEFAULT_TEXTS = SECCION17_DEFAULT_TEXTS;

    private readonly regexCache = new Map<string, RegExp>();

    // ✅ SIGNALS para datos reactivos
    readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
        this.projectFacade.selectSectionFields(this.seccionId, null)()
    );

    readonly allSectionData: Signal<Record<string, any>> = computed(() => {
        const sectionData = this.formDataSignal();
        const legacyData = this.projectFacade.obtenerDatos();
        return { ...legacyData, ...sectionData };
    });

    readonly indiceDesarrolloHumanoSignal: Signal<any[]> = computed(() => {
        const data = this.allSectionData();
        const prefijo = this.obtenerPrefijoGrupo();
        const tablaKey = prefijo ? `indiceDesarrolloHumanoTabla${prefijo}` : 'indiceDesarrolloHumanoTabla';
        return (Array.isArray(data[tablaKey]) ? data[tablaKey] : data['indiceDesarrolloHumanoTabla']) || [];
    });

    // Signal de prefijo de foto para aislamiento AISD
    readonly photoPrefixSignal: Signal<string> = computed(() => {
        return this.PHOTO_PREFIX;
    });

    // ✅ PATRÓN UNICA_VERDAD: fotosCacheSignal Signal para monitorear cambios de imágenes
    readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
        const fotos: FotoItem[] = [];
        const prefijo = this.obtenerPrefijoGrupo();
        
        for (let i = 1; i <= 10; i++) {
            const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`)();
            const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`)();
            const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`)();
            
            if (imagen) {
                fotos.push({
                    titulo: titulo || `Fotografía ${i}`,
                    fuente: fuente || 'GEADES, 2024',
                    imagen: imagen
                } as FotoItem);
            }
        }
        return fotos;
    });

    readonly fotografiasSignal: Signal<FotoItem[]> = computed(() => {
        // Leer directamente del localStorage para garantizar datos actualizados
        const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
        return this.imageFacade.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix);
    });

    // ✅ REFACTOR: Usar ubicacionGlobal
    readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

    constructor(
        cdRef: ChangeDetectorRef,
        injector: Injector,
        public sanitizer: DomSanitizer
    ) {
        super(cdRef, injector);

        // ✅ Punto 4: Effect para sincronización
        effect(() => {
            this.formDataSignal();  // Depende del signal
            this.allSectionData();  // Depende del merge de datos
            this.cdRef.markForCheck();  // ← CRÍTICO: fuerza re-render
        });
    }

    protected override detectarCambios(): boolean {
        return false;
    }

    protected override actualizarValoresConPrefijo(): void { }

    protected override actualizarDatosCustom(): void {
        // Las fotos se actualizan reactivamente a través de fotografiasSignal
    }

    override getFotografiasVista(): FotoItem[] {
        return this.fotografiasSignal();
    }

    // === LÓGICA DE PÁRRAFOS ===

    getFieldIdTextoIDH(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        return prefijo ? `textoIndiceDesarrolloHumano${prefijo}` : 'textoIndiceDesarrolloHumano';
    }

    obtenerDistrito(): string {
        // ✅ REFACTOR: Usar ubicacionGlobal
        return this.ubicacionGlobal().distrito || 'Cahuacho';
    }

    obtenerTextoIDHCompleto(): string {
        const fieldId = this.getFieldIdTextoIDH();
        const data = this.allSectionData();
        const textoPersonalizado = data[fieldId];

        // ✅ REFACTOR: Usar ubicacionGlobal
        const distrito = this.ubicacionGlobal().distrito || 'Cahuacho';
        const idh = this.getIDH();
        const rankIdh = this.getRankIDH();

        const idhValor = (idh !== '____' && idh !== '0.000' && idh !== '0,000') ? idh : '____';
        const rankValor = (rankIdh !== '____' && rankIdh !== '0') ? rankIdh : '____';

        const textoPorDefecto = SECCION17_DEFAULT_TEXTS.textoIDHDefault(distrito, idhValor, rankValor);

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

    obtenerTextoIDHConResaltado(): SafeHtml {
        try {
            const texto = this.obtenerTextoIDHCompleto();
            // ✅ REFACTOR: Usar ubicacionGlobal
            const distrito = this.ubicacionGlobal().distrito || 'Cahuacho';
            const idh = String(this.getIDH() || '');
            const rankIdh = String(this.getRankIDH() || '');

            let html = this.escapeHtml(texto);

            if (distrito !== 'Cahuacho') {
                const distritoStr = String(distrito);
                html = html.replace(this.obtenerRegExp(this.escapeRegex(distritoStr)), `<span class="data-section">${this.escapeHtml(distritoStr)}</span>`);
            }

            if (idh !== '____' && idh !== '0.000' && idh !== '0,000') {
                const idhEscapado = this.escapeHtml(idh);
                html = html.replace(this.obtenerRegExp(this.escapeRegex(idh)), `<span class="data-manual">${idhEscapado}</span>`);
            }

            if (rankIdh !== '____' && rankIdh !== '0') {
                const rankEscapado = this.escapeHtml(rankIdh);
                html = html.replace(this.obtenerRegExp(`N°${this.escapeRegex(rankIdh)}`), `N°<span class="data-manual">${rankEscapado}</span>`);
                html = html.replace(this.obtenerRegExp(`puesto N°${this.escapeRegex(rankIdh)}`), `puesto N°<span class="data-manual">${rankEscapado}</span>`);
            }

            html = html.replace(/\n\n/g, '</p><p class="text-justify">');
            html = `<p class="text-justify">${html}</p>`;

            return this.sanitizer.bypassSecurityTrustHtml(html);
        } catch (error) {
            console.error('[SECCION17_VIEW] Error en obtenerTextoIDHConResaltado:', error);
            return this.sanitizer.bypassSecurityTrustHtml(`<p class="text-justify">${this.escapeHtml(this.obtenerTextoIDHCompleto())}</p>`);
        }
    }

    // === LÓGICA DE TABLA ===

    getTablaKeyIDH(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        return prefijo ? `indiceDesarrolloHumanoTabla${prefijo}` : 'indiceDesarrolloHumanoTabla';
    }

    getIndiceDesarrolloHumanoTabla(): any[] {
        return this.indiceDesarrolloHumanoSignal();
    }

    getIDH(): string {
        const tabla = this.indiceDesarrolloHumanoSignal();
        if (!tabla || tabla.length === 0) return '____';
        const item = tabla[0];
        return item?.idh || '____';
    }

    getRankIDH(): string {
        const tabla = this.indiceDesarrolloHumanoSignal();
        if (!tabla || tabla.length === 0) return '____';
        const item = tabla[0];
        return item?.rankIdh1 || '____';
    }

    obtenerTituloIDH(): string {
        const data = this.allSectionData();
        const prefijo = this.obtenerPrefijoGrupo();
        
        // ✅ PRIMERO: Intentar leer el título personalizado guardado en el formulario
        const tituloFieldId = prefijo ? `tituloIDH${prefijo}` : 'tituloIDH';
        const tituloPersonalizado = data[tituloFieldId];
        
        // Si hay un título personalizado, retornarlo
        if (tituloPersonalizado && tituloPersonalizado.trim() !== '') {
            return tituloPersonalizado;
        }
        
        // ✅ REFACTOR: Usar obtenerNombreComunidadActual() para obtener el nombre del grupo
        const nombreComunidad = this.obtenerNombreComunidadActual();
        
        if (!prefijo) {
            return SECCION17_DEFAULT_TEXTS.tituloIDHDefault(nombreComunidad);
        }
        
        return `Componentes del Índice de Desarrollo Humano – CC ${nombreComunidad} (2019)`;
    }

    obtenerFuenteIDH(): string {
        const data = this.allSectionData();
        const prefijo = this.obtenerPrefijoGrupo();
        const fuenteField = prefijo ? `fuenteIDH${prefijo}` : 'fuenteIDH';
        const fuente = data[fuenteField] || '';
        return fuente && fuente.trim() !== '' ? fuente : SECCION17_TEMPLATES.fuenteIDHDefault;
    }

    // === UTILIDADES ===

    private obtenerRegExp(pattern: string): RegExp {
        if (!this.regexCache.has(pattern)) {
            this.regexCache.set(pattern, new RegExp(pattern, 'g'));
        }
        return this.regexCache.get(pattern)!;
    }

    private escapeRegex(text: any): string {
        const str = String(text || '');
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private escapeHtml(text: any): string {
        if (!text) return '';
        const str = String(text); // Convertir a string si no lo es
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    override ngOnDestroy(): void {
        this.regexCache.clear();
        super.ngOnDestroy();
    }
}
