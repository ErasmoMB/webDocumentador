import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, ChangeDetectorRef, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { ImageManagementFacade } from 'src/app/core/services/image/image-management.facade';
import { TableConfig, TableColumn } from 'src/app/core/services/tables/table-management.service';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { PrefixManager } from '../../utils/prefix-manager';
import { SECCION17_PHOTO_PREFIX, SECCION17_DEFAULT_TEXTS, SECCION17_TEMPLATES } from './seccion17-constants';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { FormChangeService } from '../../../core/services/state/form-change.service';

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
    readonly Object = Object; // Para usar Object.keys en el template

    // ✅ HELPER PARA OBTENER PREFIJO
    private obtenerPrefijo(): string {
        return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
    }

    // ✅ OVERRIDE: onFieldChange CON PREFIJO AUTOMÁTICO (igual que sección 15)
    override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
        const prefijo = this.obtenerPrefijo();
        const campoConPrefijo = prefijo ? `${fieldId}${prefijo}` : fieldId;
        super.onFieldChange(campoConPrefijo, value, options);
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
        return this.PHOTO_PREFIX;
    });

    // ✅ REFACTOR: Usar ubicacionGlobal
    readonly ubicacionGlobal = computed(() => this.projectFacade.ubicacionGlobal());

    // ✅ Combinar datos legacy con section data (igual que en vista)
    readonly allSectionData: Signal<Record<string, any>> = computed(() => {
        const sectionData = this.projectFacade.selectSectionFields(this.seccionId, null)();
        const legacyData = this.projectFacade.obtenerDatos();
        return { ...legacyData, ...sectionData };
    });

    // ✅ Signal EXACTAMENTE igual al de la vista (lo que funciona)
    readonly indiceDesarrolloHumanoSignal: Signal<any[]> = computed(() => {
        const data = this.allSectionData();
        
        // ✅ USAR AMBOS MÉTODOS para compatibilidad
        const prefijo = this.obtenerPrefijo();
        const tablaKeyPrefijoHelper = prefijo ? `indiceDesarrolloHumanoTabla${prefijo}` : 'indiceDesarrolloHumanoTabla';
        const tablaKeyPrefixManager = PrefixManager.getFieldKey(this.seccionId, 'indiceDesarrolloHumanoTabla');
        
        // Priorizar PrefixManager (usado por app-dynamic-table)
        if (Array.isArray(data[tablaKeyPrefixManager])) {
            return data[tablaKeyPrefixManager];
        }
        
        // Fallback a PrefijoHelper
        if (Array.isArray(data[tablaKeyPrefijoHelper])) {
            return data[tablaKeyPrefijoHelper];
        }
        
        // Fallback final
        return data['indiceDesarrolloHumanoTabla'] || [];
    });

    // ✅ Signal para la tabla IDH - USANDO EL MISMO QUE LA VISTA
    readonly indiceDesarrolloHumanoTablaSignal: Signal<any[]> = computed(() => {
        return this.indiceDesarrolloHumanoSignal();
    });

    // Configuración de tabla IDH como Signal (SIMPLIFICADA)
    readonly indiceDesarrolloHumanoConfigSignal: Signal<TableConfig> = computed(() => ({
        tablaKey: 'indiceDesarrolloHumanoTabla', // Usar clave base simple
        totalKey: '',
        campoTotal: '',
        campoPorcentaje: '',
        calcularPorcentajes: false,
        camposParaCalcular: [],
        permiteAgregarFilas: true,
        permiteEliminarFilas: true,
        noInicializarDesdeEstructura: true,
        estructuraInicial: []
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

    // ✅ Propiedad para pasar a app-dynamic-table
    override datos: Record<string, any> = {};

    constructor(
        cdRef: ChangeDetectorRef,
        injector: Injector,
        private backendApi: BackendApiService,
        private formChangeService: FormChangeService
    ) {
        super(cdRef, injector);
        this.inicializarCamposDesdeStore();

        // ✅ EFFECT: Auto-sync datos generales Y tabla IDH (usando el mismo patrón de la vista)
        effect(() => {
            const data = this.allSectionData();
            const tablaData = this.indiceDesarrolloHumanoSignal();
            const tablaKey = this.getTablaKeyIDH();
            
            // Combinar datos generales con datos de la tabla
            this.datos = { ...data, [tablaKey]: tablaData };
            
            // También actualizar con la clave base para compatibilidad
            this.datos['indiceDesarrolloHumanoTabla'] = tablaData;
            
            this.cdRef.markForCheck();
            this.cdRef.detectChanges(); 
            
            setTimeout(() => {
                this.cdRef.detectChanges();
            }, 0);
        });
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

    getIndiceDesarrolloHumanoTabla(): any[] {
        return this.indiceDesarrolloHumanoSignal();
    }

    getTablaKeyIDH(): string {
        const prefijo = this.obtenerPrefijo();
        const tablaKeyPrefijoHelper = prefijo ? `indiceDesarrolloHumanoTabla${prefijo}` : 'indiceDesarrolloHumanoTabla';
        
        // ✅ USAR EL MISMO MÉTODO QUE USA app-dynamic-table internamente
        const tablaKeyPrefixManager = PrefixManager.getFieldKey(this.seccionId, 'indiceDesarrolloHumanoTabla');
        
        return tablaKeyPrefixManager;
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
        
        // ✅ Usar el mismo patrón exacto que sección 15
        const dataToPersist = tablaData || this.indiceDesarrolloHumanoTablaSignal();
        
        // 1. Usar FormChangeService como sección 15
        this.formChangeService.persistFields(this.seccionId, 'table', {
            [tablaKey]: dataToPersist
        }, { updateState: true, notifySync: true, persist: false });

        // 2. Obtener datos persistidos y actualizar this.datos
        const tablaPersistida = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() || dataToPersist || [];
        this.datos[tablaKey] = tablaPersistida;
        
        // 3. Llamar a onFieldChange para sincronización completa
        this.onFieldChange(tablaKey, tablaPersistida, { refresh: false });
        
        // 4. Forzar detección de cambios
        this.cdRef.markForCheck();
        this.cdRef.detectChanges();
    }

    /**
     * ✅ PATRÓN: Transformación de datos IDH del backend
     * Mapea los datos que vienen del backend (f0-f11) al formato de la tabla
     * f0: poblacion, f1: rankIdh1, f2: idh, f3: rankEsperanza, f4: esperanzaVida,
     * f5: rankEducacion1, f6: educacion, f7: rankEducacion2, f8: anosEducacion,
     * f9: rankAnios, f10: ingreso, f11: rankIngreso
     */
    private transformarDatosIDH(data: any[]): any[] {
        if (!Array.isArray(data) || data.length === 0) {
            return [];
        }

        const resultado = data.map(item => {
            const transformado = {
                poblacion: this.formatearNumero(item.f0),
                rankIdh1: this.formatearNumero(item.f1),
                idh: this.formatearDecimal(item.f2),
                rankEsperanza: this.formatearNumero(item.f3),
                esperanzaVida: this.formatearDecimal(item.f4),
                rankEducacion1: this.formatearNumero(item.f5),
                educacion: this.formatearDecimal(item.f6),
                rankEducacion2: this.formatearNumero(item.f7),
                anosEducacion: this.formatearDecimal(item.f8),
                rankAnios: this.formatearNumero(item.f9),
                ingreso: this.formatearDecimal(item.f10),
                rankIngreso: this.formatearNumero(item.f11)
            };
            return transformado;
        });
        
        return resultado;
    }

    /**
     * ✅ Helper: Formatear número
     * Convierte cualquier valor a un número válido, retorna 0 si no es válido
     */
    private formatearNumero(valor: any): number {
        if (valor === null || valor === undefined || valor === '____') return 0;
        
        // Si ya es un número
        if (typeof valor === 'number') {
            return isNaN(valor) ? 0 : valor;
        }
        
        // Si es un string, convertir a número
        const str = String(valor).trim();
        if (str === '' || str === '____') return 0;
        
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    }

    /**
     * ✅ Helper: Formatear decimal con separador
     * Convierte a string manteniendo el formato decimal correctamente
     */
    private formatearDecimal(valor: any): string {
        if (valor === null || valor === undefined || valor === '____') return '0.0';
        
        // Si es un número, convertir a string
        if (typeof valor === 'number') {
            // Si es un entero grande, mantener como está
            if (Number.isInteger(valor)) {
                return valor.toString();
            }
            // Si tiene decimales, formatear
            return valor.toFixed(2).replace('.', '.');
        }
        
        // Si es un string
        const str = String(valor).trim();
        if (str === '' || str === '____') return '0.0';
        
        // Reemplazar coma por punto si es necesario
        const numStr = str.replace(',', '.');
        
        // Validar que sea un número válido
        const num = parseFloat(numStr);
        return isNaN(num) ? '0.0' : numStr;
    }

    /**
     * ✅ PATRÓN: Inicializar tabla vacía
     * Se llama primero para limpiar la tabla antes de cargar del backend
     */
    private inicializarTablaVacia(): void {
        const prefijo = this.obtenerPrefijo();
        const tablaKeyPrefijoHelper = prefijo ? `indiceDesarrolloHumanoTabla${prefijo}` : 'indiceDesarrolloHumanoTabla';
        const tablaKeyPrefixManager = PrefixManager.getFieldKey(this.seccionId, 'indiceDesarrolloHumanoTabla');
        
        // Inicializar con PrefijoHelper
        this.projectFacade.setField(this.seccionId, null, tablaKeyPrefijoHelper, []);
        this.projectFacade.setField(this.seccionId, null, 'indiceDesarrolloHumanoTabla', []);
        
        // Inicializar con PrefixManager  
        this.projectFacade.setField(this.seccionId, null, tablaKeyPrefixManager, []);
    }

    /**
     * ✅ PATRÓN: Cargar datos del backend
     * 1. Obtiene centros poblados del grupo actual
     * 2. Llama al endpoint /demograficos/idh
     * 3. Transforma los datos
     * 4. Guarda en state con prefijo y fallback
     */
    private cargarDatosDelBackend(): void {
        // 1. Obtener códigos de centros poblados del grupo actual AISD
        const codigosArray = this.getCodigosCentrosPobladosAISD();
        let codigos: string[] = Array.from(codigosArray || []);

        // Si no hay códigos específicos, obtener todos los centros poblados disponibles
        if (!codigos || codigos.length === 0) {
            const allCcpp = this.projectFacade.allPopulatedCenters();
            if (allCcpp && allCcpp().length > 0) {
                codigos = allCcpp().map(cp => String(cp.codigo || cp.ubigeo)).filter(c => c);
            }
        }

        // Si aún no hay códigos, usar array vacío (el backend devolverá datos por defecto)
        if (!codigos || codigos.length === 0) {
            codigos = [];
        }

        // 2. Llamar al endpoint del backend
        this.backendApi.postIdh(codigos).subscribe({
            next: (response: any) => {
                // 3. Extraer y transformar datos
                let datosDelBackend: any[] = [];
                
                // El backend devuelve { data: [{ rows: [...] }], ... }
                if (response?.data) {
                    // Si response.data es un array de objetos con 'rows'
                    if (Array.isArray(response.data) && response.data.length > 0) {
                        if (response.data[0]?.rows && Array.isArray(response.data[0].rows)) {
                            datosDelBackend = response.data[0].rows;
                        } else if (Array.isArray(response.data)) {
                            // Si response.data es un array directo de filas
                            datosDelBackend = response.data;
                        }
                    }
                }

                const datosTransformados = this.transformarDatosIDH(datosDelBackend);

                if (datosTransformados && datosTransformados.length > 0) {
                    // 4. Guardar en AMBOS formatos de clave para compatibilidad completa
                    const prefijo = this.obtenerPrefijo();
                    const tablaKeyPrefijoHelper = prefijo ? `indiceDesarrolloHumanoTabla${prefijo}` : 'indiceDesarrolloHumanoTabla';
                    const tablaKeyPrefixManager = PrefixManager.getFieldKey(this.seccionId, 'indiceDesarrolloHumanoTabla');
                    
                    // Guardar con PrefijoHelper (usado por vista)
                    this.projectFacade.setField(this.seccionId, null, tablaKeyPrefijoHelper, datosTransformados);
                    this.projectFacade.setField(this.seccionId, null, 'indiceDesarrolloHumanoTabla', datosTransformados);
                    
                    // Guardar con PrefixManager (usado por app-dynamic-table)
                    this.projectFacade.setField(this.seccionId, null, tablaKeyPrefixManager, datosTransformados);
                    
                    // También actualizar this.datos directamente para ambas claves
                    this.datos[tablaKeyPrefijoHelper] = datosTransformados;
                    this.datos[tablaKeyPrefixManager] = datosTransformados;
                    this.datos['indiceDesarrolloHumanoTabla'] = datosTransformados;
                }

                this.cdRef.markForCheck();
            },
            error: (error) => {
                console.error('[SECCION17] Error al cargar IDH del backend:', error);
            }
        });
    }

    /**
     * ✅ PATRÓN: Inicialización personalizada
     * Se llama en onInitCustom para limpiar y cargar datos
     * Sigue el patrón de Sección 9: 1) inicializar tabla vacía, 2) cargar del backend
     */
    protected override onInitCustom(): void {
        super.onInitCustom();
        
        // ✅ PATRÓN SECCIÓN 9: Primero inicializar tabla vacía, luego cargar del backend
        this.inicializarTablaVacia();
        this.cargarDatosDelBackend();
    }

    /**
     * ✅ Cargar datos directamente sin esperar al backend
     * Esto es para verificar que la visualización funciona
     */
    private cargarDatosDirectos(): void {
        // Datos exactos que devuelve el backend
        const datosDelBackend = [
            {
                f0: 502,
                f1: 3086,
                f2: "0.3870",
                f3: 934,
                f4: "83.27",
                f5: 29,
                f6: "55.35",
                f7: 1010,
                f8: "6.18",
                f9: 970,
                f10: "391.1",
                f11: 1192
            }
        ];

        // Transformar datos
        const datosTransformados = this.transformarDatosIDH(datosDelBackend);

        // Guardar en state
        const prefijo = this.obtenerPrefijo();
        const tablaKey = prefijo ? `indiceDesarrolloHumanoTabla${prefijo}` : 'indiceDesarrolloHumanoTabla';
        
        this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
        this.projectFacade.setField(this.seccionId, null, 'indiceDesarrolloHumanoTabla', datosTransformados);
        
        this.cdRef.markForCheck();
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
