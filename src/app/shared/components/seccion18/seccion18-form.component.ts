import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, ChangeDetectorRef, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { ImageManagementFacade } from 'src/app/core/services/image/image-management.facade';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { BackendApiService } from 'src/app/core/services/infrastructure/backend-api.service';
import { transformNbiV2TablaSegunPoblacion, transformNbiV2TiposExistentes } from 'src/app/core/config/table-transforms';
import { SECCION18_PHOTO_PREFIX, SECCION18_DEFAULT_TEXTS, SECCION18_TEMPLATES } from './seccion18-constants';

// ✅ Helper para desenvuelver datos del backend
const unwrapDemograficoData = (responseData: any): any[] => {
  if (!responseData) return [];
  if (Array.isArray(responseData) && responseData.length > 0) {
    return responseData[0]?.rows || responseData;
  }
  if (responseData.data) {
    const data = responseData.data;
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.rows || data;
    }
    return data;
  }
  return [];
};

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

    // ✅ Inyectar BackendApiService
    private backendApi: BackendApiService = this.injector.get(BackendApiService);

    // ✅ EXPORTAR CONSTANTES AL TEMPLATE
    readonly SECCION18_TEMPLATES = SECCION18_TEMPLATES;
    readonly SECCION18_DEFAULT_TEXTS = SECCION18_DEFAULT_TEXTS;

    // ✅ HELPER PARA OBTENER PREFIJO
    private obtenerPrefijo(): string {
        return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
    }

    // ✅ SIGNALS REACTIVAS CON createAutoSyncField (CON PREFIJO DE GRUPO)
    readonly textoNBI = this.createAutoSyncField(`textoNecesidadesBasicasInsatisfechas${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
    readonly tituloNbiCC = this.createAutoSyncField(`tituloNbiCC${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
    readonly fuenteNbiCC = this.createAutoSyncField(`fuenteNbiCC${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
    readonly tituloNbiDistrito = this.createAutoSyncField(`tituloNbiDistrito${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');
    readonly fuenteNbiDistrito = this.createAutoSyncField(`fuenteNbiDistrito${PrefijoHelper.obtenerPrefijoGrupo(this.seccionId)}`, '');

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
        this.backendApi = injector.get(BackendApiService);
        this.inicializarCamposDesdeStore();
    }

    /**
     * ✅ onInitCustom: Inicializar y cargar datos del backend
     * Llamar después de que onInit() de la clase base se complete
     */
    protected override onInitCustom(): void {
        super.onInitCustom();
        this.inicializarTablasVacias();
        this.cargarDatosDelBackend();
    }

    /**
     * ✅ Inicializar tablas como arrays vacíos
     */
    private inicializarTablasVacias(): void {
        const prefijo = this.obtenerPrefijoGrupo();
        const tablaKeyCC = `nbiCCAyrocaTabla${prefijo}`;
        const tablaKeyDistrito = `nbiDistritoCahuachoTabla${prefijo}`;
        
        this.projectFacade.setField(this.seccionId, null, tablaKeyCC, []);
        this.projectFacade.setField(this.seccionId, null, `nbiCCAyrocaTabla`, []);
        this.projectFacade.setField(this.seccionId, null, tablaKeyDistrito, []);
        this.projectFacade.setField(this.seccionId, null, `nbiDistritoCahuachoTabla`, []);
    }

    /**
     * ✅ Cargar datos del backend usando sp_nbi_from_cpp_v2 y sp_nbi_from_cpp
     * Obtiene códigos de centros poblados del grupo actual
     * Llama a dos endpoints: /demograficos/nbi-v2 y /demograficos/nbi
     * Transforma los datos y los guarda en el state
     */
    private cargarDatosDelBackend(): void {
        // 1. Obtener códigos de centros poblados del grupo AISD actual
        const codigosArray = this.getCodigosCentrosPobladosAISD();
        const codigos = [...codigosArray]; // Copia mutable

        if (!codigos || codigos.length === 0) {
            console.log('[SECCION18] ⚠️ No hay centros poblados en el grupo actual');
            return;
        }

        console.log('[SECCION18] 📡 Cargando datos NBI desde backend para grupo actual...', { codigos });

        const prefijo = this.obtenerPrefijoGrupo();

        // 2. PRIMERA TABLA: Llamar al backend para obtener NBI según población (nbi-v2)
        this.backendApi.postNbiV2(codigos).subscribe({
            next: (response: any) => {
                try {
                    const dataRaw = response?.data || [];
                    // Desenvuelver datos del backend
                    const datosDesenvueltos = unwrapDemograficoData(dataRaw);
                    const datosTransformados = transformNbiV2TablaSegunPoblacion(datosDesenvueltos);
                    console.log('[SECCION18] ✅ Datos NBI V2 (según población) cargados:', datosTransformados);
                    
                    // Guardar en el state CON PREFIJO
                    if (datosTransformados.length > 0) {
                        const tablaKey = `nbiCCAyrocaTabla${prefijo}`;
                        
                        // Guardar con prefijo
                        this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
                        
                        // También guardar sin prefijo para fallback
                        this.projectFacade.setField(this.seccionId, null, 'nbiCCAyrocaTabla', datosTransformados);
                        
                        this.cdRef.markForCheck();
                    }
                } catch (e) {
                    console.error('[SECCION18] ❌ Error transformando datos NBI V2:', e);
                }
            },
            error: (err: any) => {
                console.error('[SECCION18] ❌ Error cargando datos NBI V2 del backend:', err);
            }
        });

        // 3. SEGUNDA TABLA: Llamar al backend para obtener Tipos de NBI existentes (nbi viejo)
        this.backendApi.postNbi(codigos).subscribe({
            next: (response: any) => {
                try {
                    const dataRaw = response?.data || [];
                    // Desenvuelver datos del backend
                    const datosDesenvueltos = unwrapDemograficoData(dataRaw);
                    const datosTransformados = transformNbiV2TiposExistentes(datosDesenvueltos);
                    console.log('[SECCION18] ✅ Datos NBI (tipos existentes) cargados:', datosTransformados);
                    
                    // Guardar en el state CON PREFIJO
                    if (datosTransformados.length > 0) {
                        const tablaKey = `nbiDistritoCahuachoTabla${prefijo}`;
                        
                        // Guardar con prefijo
                        this.projectFacade.setField(this.seccionId, null, tablaKey, datosTransformados);
                        
                        // También guardar sin prefijo para fallback
                        this.projectFacade.setField(this.seccionId, null, 'nbiDistritoCahuachoTabla', datosTransformados);
                        
                        this.cdRef.markForCheck();
                    }
                } catch (e) {
                    console.error('[SECCION18] ❌ Error transformando datos NBI (tipos):', e);
                }
            },
            error: (err: any) => {
                console.error('[SECCION18] ❌ Error cargando datos NBI (tipos) del backend:', err);
            }
        });
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
        const grupoAISD = this.obtenerNombreComunidadActual();
        const distrito = this.obtenerDistrito();
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

    getTablaKeyNbiCC(): string {
        const prefijo = this.obtenerPrefijo();
        return prefijo ? `nbiCCAyrocaTabla${prefijo}` : 'nbiCCAyrocaTabla';
    }

    getTablaKeyNbiDistrito(): string {
        const prefijo = this.obtenerPrefijo();
        return prefijo ? `nbiDistritoCahuachoTabla${prefijo}` : 'nbiDistritoCahuachoTabla';
    }

    /**
     * ✅ PATRÓN: Obtener distrito dinámicamente desde tabla de sección 4
     * Lee la tabla "Ubicación referencial" (tablaAISD1Datos) de sección 4
     * y retorna el distrito del primer registro
     */
    obtenerDistrito(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        const seccion4Id = '3.1.4.A.1'; // Sección 4 - Caracterización socioeconómica
        const tablaKey = `tablaAISD1Datos${prefijo}`;
        
        // Leer tabla desde sección 4 (Ubicación referencial)
        const tabla = this.projectFacade.selectField(seccion4Id, null, tablaKey)() || [];
        
        // Retornar distrito del primer registro, o fallback a ubicacionGlobal
        if (Array.isArray(tabla) && tabla.length > 0 && tabla[0]?.distrito) {
            return tabla[0].distrito;
        }
        
        // Fallback: usar ubicacionGlobal como alternativa
        return this.ubicacionGlobal().distrito || 'Cahuacho';
    }

    /**
     * ✅ PATRÓN: Reemplazar dinámicamente {COMUNIDAD} con el nombre real
     */
    obtenerTituloNbiCC(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        const titulo = this.projectFacade.selectField(this.seccionId, null, `tituloNbiCC${prefijo}`)();
        const comunidad = this.obtenerNombreComunidadActual();
        return titulo || SECCION18_TEMPLATES.placeholderTituloNbiCC.replace(/____/g, comunidad);
    }

    obtenerFuenteNbiCC(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        const fuente = this.projectFacade.selectField(this.seccionId, null, `fuenteNbiCC${prefijo}`)();
        return fuente || SECCION18_TEMPLATES.placeholderFuenteNbiCC;
    }

    /**
     * ✅ PATRÓN (como sección 13): Reemplazar dinámicamente ____ con el nombre real del distrito
     * Lee desde tabla de sección 4 (Ubicación referencial)
     */
    obtenerTituloNbiDistrito(): string {
        const prefijo = this.obtenerPrefijoGrupo();
        const titulo = this.projectFacade.selectField(this.seccionId, null, `tituloNbiDistrito${prefijo}`)();
        const distrito = this.obtenerDistrito();
        return titulo || SECCION18_TEMPLATES.placeholderTituloNbiDistrito.replace(/____/g, distrito);
    }

    obtenerFuenteNbiDistrito(): string {
        const fieldId = this.getFuenteNbiDistritoField();
        const fuente = (this.datos as any)[fieldId];
        if (fuente && String(fuente).trim() !== '') return fuente;
        return SECCION18_TEMPLATES.placeholderFuenteNbiDistrito;
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
