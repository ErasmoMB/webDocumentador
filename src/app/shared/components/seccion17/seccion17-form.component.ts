import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, ChangeDetectorRef, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { ImageManagementFacade } from 'src/app/core/services/image/image-management.facade';
import { TableConfig, TableColumn } from 'src/app/core/services/tables/table-management.service';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { SECCION17_PHOTO_PREFIX, SECCION17_DEFAULT_TEXTS, SECCION17_TEMPLATES } from './seccion17-constants';

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

    // ✅ EXPORTAR CONSTANTES AL TEMPLATE
    readonly SECCION17_TEMPLATES = SECCION17_TEMPLATES;
    readonly SECCION17_DEFAULT_TEXTS = SECCION17_DEFAULT_TEXTS;

    // ✅ HELPER PARA OBTENER PREFIJO
    private obtenerPrefijo(): string {
        return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
    }

    // ✅ SIGNALS REACTIVAS CON createAutoSyncField (CON PREFIJO DE GRUPO)
    readonly textoINDH = this.createAutoSyncField(`textoIndiceDesarrolloHumano${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
    readonly tituloIDH = this.createAutoSyncField(`tituloIDH${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
    readonly fuenteIDH = this.createAutoSyncField(`fuenteIDH${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');

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

    // ✅ REFACTOR: Usar ubicacionGlobal
    readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

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
        { field: 'poblacion', label: SECCION17_TEMPLATES.tableHeaders.poblacion, type: 'number', placeholder: '0' },
        { field: 'rankIdh1', label: SECCION17_TEMPLATES.tableHeaders.rankIdh1, type: 'number', placeholder: '0' },
        { field: 'idh', label: SECCION17_TEMPLATES.tableHeaders.idh, type: 'text', placeholder: '0.000' },
        { field: 'rankEsperanza', label: SECCION17_TEMPLATES.tableHeaders.rankEsperanza, type: 'number', placeholder: '0' },
        { field: 'esperanzaVida', label: SECCION17_TEMPLATES.tableHeaders.esperanzaVida, type: 'text', placeholder: '0.0' },
        { field: 'rankEducacion1', label: SECCION17_TEMPLATES.tableHeaders.rankEducacion1, type: 'number', placeholder: '0' },
        { field: 'educacion', label: SECCION17_TEMPLATES.tableHeaders.educacion, type: 'text', placeholder: '0.0%' },
        { field: 'rankEducacion2', label: SECCION17_TEMPLATES.tableHeaders.rankEducacion2, type: 'number', placeholder: '0' },
        { field: 'anosEducacion', label: SECCION17_TEMPLATES.tableHeaders.anosEducacion, type: 'text', placeholder: '0.0' },
        { field: 'rankAnios', label: SECCION17_TEMPLATES.tableHeaders.rankAnios, type: 'number', placeholder: '0' },
        { field: 'ingreso', label: SECCION17_TEMPLATES.tableHeaders.ingreso, type: 'text', placeholder: '0.0' },
        { field: 'rankIngreso', label: SECCION17_TEMPLATES.tableHeaders.rankIngreso, type: 'number', placeholder: '0' }
    ];

    constructor(
        cdRef: ChangeDetectorRef,
        injector: Injector
    ) {
        super(cdRef, injector);
        this.inicializarCamposDesdeStore();
    }

    /**
     * ✅ Inicializar campos desde store con fallback
     */
    private inicializarCamposDesdeStore(): void {
        // Obtener prefijo para campos con aislamiento AISD
        const prefijo = this.obtenerPrefijo();
        const campoTexto = prefijo ? `textoIndiceDesarrolloHumano${prefijo}` : 'textoIndiceDesarrolloHumano';
        const campoTitulo = prefijo ? `tituloIDH${prefijo}` : 'tituloIDH';
        const campoFuente = prefijo ? `fuenteIDH${prefijo}` : 'fuenteIDH';

        // Leer desde store o usar fallback
        const textoGuardado = this.projectFacade.selectField(this.seccionId, null, campoTexto)();
        if (textoGuardado) {
            this.textoINDH.update(textoGuardado);
        }

        const tituloGuardado = this.projectFacade.selectField(this.seccionId, null, campoTitulo)();
        if (tituloGuardado) {
            this.tituloIDH.update(tituloGuardado);
        }

        const fuenteGuardada = this.projectFacade.selectField(this.seccionId, null, campoFuente)();
        if (fuenteGuardada) {
            this.fuenteIDH.update(fuenteGuardada);
        }
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
        const prefijo = this.obtenerPrefijo();
        return prefijo ? `textoIndiceDesarrolloHumano${prefijo}` : 'textoIndiceDesarrolloHumano';
    }

    obtenerDistrito(): string {
        // ✅ REFACTOR: Usar ubicacionGlobal
        return this.ubicacionGlobal().distrito || 'Cahuacho';
    }

    obtenerTituloIDH(): string {
        const prefijo = this.obtenerPrefijo();
        
        // ✅ PRIMERO: Intentar leer el título personalizado guardado
        const fieldId = prefijo ? `tituloIDH${prefijo}` : 'tituloIDH';
        const tituloPersonalizado = this.projectFacade.selectField(this.seccionId, null, fieldId)();
        
        if (tituloPersonalizado && tituloPersonalizado.trim() !== '') {
            return tituloPersonalizado;
        }
        
        // ✅ FALLBACK: Generar título dinámico usando obtenerNombreComunidadActual
        const nombreComunidad = this.obtenerNombreComunidadActual();
        return `Componentes del Índice de Desarrollo Humano – CC ${nombreComunidad} (2019)`;
    }

    /**
     * ✅ PATRÓN: Obtener texto con fallback a default
     * Devuelve el texto guardado o el texto por defecto si está vacío
     * Usado en template para mostrar placeholder visible en formulario
     */
    obtenerTextoIDH(): string {
        const texto = this.textoINDH.value();
        
        // Si hay texto personalizado y no está vacío, devolverlo
        if (texto && texto !== '____' && String(texto).trim() !== '') {
            return texto;
        }
        
        // FALLBACK: Devolver texto por defecto igual a vista
        const distrito = this.obtenerDistrito();
        const idh = this.getIDH();
        const rankIdh = this.getRankIDH();
        
        const idhValor = (idh !== '____' && idh !== '0.000' && idh !== '0,000') ? idh : '____';
        const rankValor = (rankIdh !== '____' && rankIdh !== '0') ? rankIdh : '____';
        
        return SECCION17_DEFAULT_TEXTS.textoIDHDefault(distrito, idhValor, rankValor);
    }

    obtenerTextoIDHCompleto(): string {
        const textoPersonalizado = this.textoINDH.value();
        const distrito = this.obtenerDistrito();
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

    // === LÓGICA DE TABLA ===

    getTablaKeyIDH(): string {
        const prefijo = this.obtenerPrefijo();
        return prefijo ? `indiceDesarrolloHumanoTabla${prefijo}` : 'indiceDesarrolloHumanoTabla';
    }

    getIndiceDesarrolloHumanoTabla(): any[] {
        const tablaKey = this.getTablaKeyIDH();
        const tabla = this.projectFacade.selectField(this.seccionId, null, tablaKey)() || [];
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
        // Usar setField directamente para sincronizar tabla
        this.projectFacade.setField(this.seccionId, null, tablaKey, tablaData);
        this.cdRef.markForCheck();
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
