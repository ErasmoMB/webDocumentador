import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion15',
  templateUrl: './seccion15.component.html',
  styleUrls: ['./seccion15.component.css']
})
export class Seccion15Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'parrafoSeccion15_religion_completo', 'lenguasMaternasTabla', 'religionesTabla', 'textoAspectosCulturales', 'textoIdioma', 'fotografiaIglesia'];
  
  override readonly PHOTO_PREFIX = 'fotografiaIglesia';
  override fotografiasCache: FotoItem[] = [];
  override fotografiasFormMulti: FotoItem[] = [];
  private stateSubscription?: Subscription;

  get lenguasMaternasConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyLenguasMaternas(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,
      camposParaCalcular: ['casos']
    };
  }

  get religionesConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyReligiones(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,
      camposParaCalcular: ['casos']
    };
  }

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    protected override autoLoader: AutoBackendDataLoaderService,
    private tableService: TableManagementService,
    private stateService: StateService,
    private groupConfig: GroupConfigService,
    private sanitizer: DomSanitizer
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef, autoLoader);
  }

  protected getSectionKey(): string {
    return 'seccion15_aisd';
  }

  protected getLoadParameters(): string[] | null {
    const ccppDesdeGrupo = this.groupConfig.getAISDCCPPActivos();
    
    if (ccppDesdeGrupo && ccppDesdeGrupo.length > 0) {
      // Limpiar '0' al inicio de cada CCPP
      const ccppLimpios = ccppDesdeGrupo.map((cpp: string) => {
        const cleaned = cpp.toString().replace(/^0+/, '') || '0';
        return cleaned;
      });
      return ccppLimpios;
    }
    return null;
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    let hayCambios = false;
    const prefijo = this.obtenerPrefijoGrupo();
    
    const tablasConPrefijo = ['lenguasMaternasTabla', 'religionesTabla'];
    
    for (const campo of this.watchedFields) {
      let valorActual: any = null;
      let valorAnterior: any = null;
      
      if (tablasConPrefijo.includes(campo)) {
        const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
        valorActual = (datosActuales as any)[campoConPrefijo] || (datosActuales as any)[campo] || null;
        valorAnterior = this.datosAnteriores[campoConPrefijo] || this.datosAnteriores[campo] || null;
      } else {
        valorActual = (datosActuales as any)[campo] || null;
        valorAnterior = this.datosAnteriores[campo] || null;
      }
      
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        if (tablasConPrefijo.includes(campo) && prefijo) {
          this.datosAnteriores[`${campo}${prefijo}`] = JSON.parse(JSON.stringify(valorActual));
        } else {
          this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
        }
      }
    }
    
    if (grupoAISDActual !== grupoAISDAnterior || grupoAISDActual !== grupoAISDEnDatos || hayCambios) {
      return true;
    }
    
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
  }

  cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    this.cdRef.markForCheck();
  }

  onFotografiasChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  getPorcentajeCastellano(): string {
    const tabla = this.getTablaLenguasMaternas();
    const item = tabla.find((i: any) => 
      i.categoria && (i.categoria.toLowerCase().includes('castellano') || i.categoria.toLowerCase().includes('español'))
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeQuechua(): string {
    const tabla = this.getTablaLenguasMaternas();
    const item = tabla.find((i: any) => 
      i.categoria && i.categoria.toLowerCase().includes('quechua')
    );
    return item?.porcentaje || '____';
  }

  obtenerTop2Lenguas(): { primera: any; segunda: any } {
    const tabla = this.getTablaLenguasMaternas();
    if (!tabla || tabla.length === 0) {
      return { primera: null, segunda: null };
    }
    
    // Ordenar por casos (descendente)
    const ordenada = [...tabla].sort((a: any, b: any) => {
      const casosA = typeof a.casos === 'number' ? a.casos : parseFloat(a.casos) || 0;
      const casosB = typeof b.casos === 'number' ? b.casos : parseFloat(b.casos) || 0;
      return casosB - casosA;
    });
    
    return {
      primera: ordenada[0] || null,
      segunda: ordenada[1] || null
    };
  }

  obtenerTop2Religiones(): { primera: any; segunda: any } {
    const tabla = this.getTablaReligiones();
    if (!tabla || tabla.length === 0) {
      return { primera: null, segunda: null };
    }
    
    // Ordenar por casos (descendente)
    const ordenada = [...tabla].sort((a: any, b: any) => {
      const casosA = typeof a.casos === 'number' ? a.casos : parseFloat(a.casos) || 0;
      const casosB = typeof b.casos === 'number' ? b.casos : parseFloat(b.casos) || 0;
      return casosB - casosA;
    });
    
    return {
      primera: ordenada[0] || null,
      segunda: ordenada[1] || null
    };
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getTablaKeyLenguasMaternas(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `lenguasMaternasTabla${prefijo}` : 'lenguasMaternasTabla';
  }

  getTablaLenguasMaternas(): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'lenguasMaternasTabla', this.seccionId);
    return pref || this.datos.lenguasMaternasTabla || [];
  }

  getTablaKeyReligiones(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `religionesTabla${prefijo}` : 'religionesTabla';
  }

  getTablaReligiones(): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'religionesTabla', this.seccionId);
    return pref || this.datos.religionesTabla || [];
  }

  getFotografiasIglesiaVista(): FotoItem[] {
    if (this.fotografiasCache && this.fotografiasCache.length > 0) {
      return [...this.fotografiasCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasCache;
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasFormMulti();
    this.cargarFotografias();
    this.eliminarFilasTotal();
    this.calcularPorcentajesLenguasMaternas();
    this.calcularPorcentajesReligiones();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  private eliminarFilasTotal(): void {
    const tablaKeyLenguas = this.getTablaKeyLenguasMaternas();
    const tablaLenguas = this.getTablaLenguasMaternas();
    
    if (tablaLenguas && Array.isArray(tablaLenguas)) {
      const longitudOriginal = tablaLenguas.length;
      const datosFiltrados = tablaLenguas.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.formularioService.actualizarDato(tablaKeyLenguas, datosFiltrados);
      }
    }

    const tablaKeyReligiones = this.getTablaKeyReligiones();
    const tablaReligiones = this.getTablaReligiones();
    
    if (tablaReligiones && Array.isArray(tablaReligiones)) {
      const longitudOriginal = tablaReligiones.length;
      const datosFiltrados = tablaReligiones.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.formularioService.actualizarDato(tablaKeyReligiones, datosFiltrados);
      }
    }
  }

  calcularPorcentajesLenguasMaternas(): void {
    const tablaKey = this.getTablaKeyLenguasMaternas();
    const tabla = this.getTablaLenguasMaternas();
    if (!tabla || tabla.length === 0) return;
    
    const total = tabla.reduce((sum: number, item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (categoria.includes('total')) return sum;
      const casos = typeof item.casos === 'number' ? item.casos : parseFloat(item.casos) || 0;
      return sum + casos;
    }, 0);
    
    if (total > 0) {
      tabla.forEach((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        if (!categoria.includes('total')) {
          const casos = typeof item.casos === 'number' ? item.casos : parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2).replace('.', ',');
          item.porcentaje = porcentaje + ' %';
        }
      });
    } else {
      tabla.forEach((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        if (!categoria.includes('total')) {
          item.porcentaje = '0,00 %';
        }
      });
    }
    
    this.datos[tablaKey] = tabla;
    this.formularioService.actualizarDato(tablaKey, tabla);
  }

  calcularPorcentajesReligiones(): void {
    const tablaKey = this.getTablaKeyReligiones();
    const tabla = this.getTablaReligiones();
    if (!tabla || tabla.length === 0) return;
    
    const total = tabla.reduce((sum: number, item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (categoria.includes('total')) return sum;
      const casos = typeof item.casos === 'number' ? item.casos : parseFloat(item.casos) || 0;
      return sum + casos;
    }, 0);
    
    if (total > 0) {
      tabla.forEach((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        if (!categoria.includes('total')) {
          const casos = typeof item.casos === 'number' ? item.casos : parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2).replace('.', ',');
          item.porcentaje = porcentaje + ' %';
        }
      });
    } else {
      tabla.forEach((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        if (!categoria.includes('total')) {
          item.porcentaje = '0,00 %';
        }
      });
    }
    
    this.datos[tablaKey] = tabla;
    this.formularioService.actualizarDato(tablaKey, tabla);
  }

  onLenguasMaternasFieldChange(rowIndex: number, field: string, value: any) {
    const tablaKey = this.getTablaKeyLenguasMaternas();
    const tabla = this.getTablaLenguasMaternas();
    if (tabla && tabla[rowIndex]) {
      tabla[rowIndex][field] = value;
      this.datos[tablaKey] = tabla;
      this.formularioService.actualizarDato(tablaKey, tabla);
      this.calcularPorcentajesLenguasMaternas();
      this.cdRef.detectChanges();
    }
  }

  onLenguasMaternasTableUpdated(): void {
    const tablaKey = this.getTablaKeyLenguasMaternas();
    const tabla = this.getTablaLenguasMaternas();
    this.datos[tablaKey] = tabla;
    this.calcularPorcentajesLenguasMaternas();
    this.cdRef.detectChanges();
  }

  onReligionesFieldChange(rowIndex: number, field: string, value: any) {
    const tablaKey = this.getTablaKeyReligiones();
    const tabla = this.getTablaReligiones();
    if (tabla && tabla[rowIndex]) {
      tabla[rowIndex][field] = value;
      this.datos[tablaKey] = tabla;
      this.formularioService.actualizarDato(tablaKey, tabla);
      this.calcularPorcentajesReligiones();
      this.cdRef.detectChanges();
    }
  }

  onReligionesTableUpdated(): void {
    const tablaKey = this.getTablaKeyReligiones();
    const tabla = this.getTablaReligiones();
    this.datos[tablaKey] = tabla;
    this.calcularPorcentajesReligiones();
    this.cdRef.detectChanges();
  }

  getLenguasMaternaSinTotal(): any[] {
    const tabla = this.getTablaLenguasMaternas();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalLenguasMaternas(): string {
    const filtered = this.getLenguasMaternaSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getReligionesSinTotal(): any[] {
    const tabla = this.getTablaReligiones();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalReligiones(): string {
    const filtered = this.getReligionesSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  getFieldIdReligionCompleto(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion15_religion_completo${prefijo}` : 'parrafoSeccion15_religion_completo';
  }

  obtenerTextoSeccion15ReligionCompleto(): string {
    const fieldId = this.getFieldIdReligionCompleto();
    const textoPersonalizado = this.datos[fieldId] || this.datos.parrafoSeccion15_religion_completo;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const top2 = this.obtenerTop2Religiones();
    
    let religionPrincipal = 'el catolicismo';
    if (top2.primera) {
      religionPrincipal = top2.primera.categoria?.toLowerCase() || 'el catolicismo';
    }
    
    const textoPorDefecto = `La confesión predominante dentro de la CC ${grupoAISD} es ${religionPrincipal}. Según las entrevistas, la permanencia de ${religionPrincipal} como religión mayoritaria se debe a la presencia de la iglesia, denominada Iglesia Matriz de ${grupoAISD}, y a la no existencia de templos evangélicos u otras confesiones. Esta iglesia es descrita como el principal punto de encuentro religioso para la comunidad y desempeña un papel importante en la vida espiritual de sus habitantes. Otro espacio de valor espiritual es el cementerio, donde los comuneros entierran y visitan a sus difuntos. Este lugar se encuentra ubicado al sur del anexo ${grupoAISD}.`;
    
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado;
    }
    
    return textoPorDefecto;
  }

  obtenerTextoSeccion15ReligionCompletoParaEditor(): string {
    const fieldId = this.getFieldIdReligionCompleto();
    const textoPersonalizado = this.datos[fieldId] || this.datos.parrafoSeccion15_religion_completo;
    
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `La confesión predominante dentro de la CC ${grupoAISD} es el catolicismo. Según las entrevistas, la permanencia del catolicismo como religión mayoritaria se debe a la presencia de la iglesia, denominada Iglesia Matriz de ${grupoAISD}, y a la no existencia de templos evangélicos u otras confesiones. Esta iglesia es descrita como el principal punto de encuentro religioso para la comunidad y desempeña un papel importante en la vida espiritual de sus habitantes. Otro espacio de valor espiritual es el cementerio, donde los comuneros entierran y visitan a sus difuntos. Este lugar se encuentra ubicado al sur del anexo ${grupoAISD}.`;
  }

  obtenerTextoSeccion15ReligionCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion15ReligionCompleto();
    const top2 = this.obtenerTop2Religiones();
    
    let html = this.escapeHtml(texto);
    
    // Resaltar primera religión (LILA - data-source)
    if (top2.primera && top2.primera.categoria) {
      const religionPrimera = top2.primera.categoria;
      const escapedReligion = this.escapeRegex(religionPrimera);
      html = html.replace(
        new RegExp(`\\b${escapedReligion}\\b`, 'gi'),
        `<span class="data-source">${this.escapeHtml(religionPrimera)}</span>`
      );
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }


  getFieldIdIdioma(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoIdioma${prefijo}` : 'textoIdioma';
  }

  obtenerTextoIdioma(): string {
    const fieldId = this.getFieldIdIdioma();
    const textoPersonalizado = this.datos[fieldId] || this.datos.textoIdioma;
    
    const top2 = this.obtenerTop2Lenguas();
    let textoPorDefecto = 'Se entiende por lengua materna aquella que es la primera lengua que aprende una persona.';
    
    if (top2.primera) {
      const categoriaPrimera = top2.primera.categoria || 'la categoría mayoritaria';
      const porcentajePrimera = top2.primera.porcentaje || '____';
      
      textoPorDefecto += ` En base a los datos de la Plataforma Nacional de Datos Georreferenciados – Geo Perú, ${categoriaPrimera} es la categoría mayoritaria, al representar el ${porcentajePrimera} de la población de 3 años a más.`;
      
      if (top2.segunda) {
        const categoriaSegunda = top2.segunda.categoria || 'otra categoría';
        const porcentajeSegunda = top2.segunda.porcentaje || '____';
        textoPorDefecto += ` En segundo lugar, se halla ${categoriaSegunda}, siendo la lengua materna del ${porcentajeSegunda} de los habitantes.`;
      }
    }
    
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado;
    }
    
    return textoPorDefecto;
  }

  obtenerTextoIdiomaParaEditor(): string {
    const fieldId = this.getFieldIdIdioma();
    const textoPersonalizado = this.datos[fieldId] || this.datos.textoIdioma;
    
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado;
    }
    
    const porcentajeCastellano = this.getPorcentajeCastellano() || '____';
    const porcentajeQuechua = this.getPorcentajeQuechua() || '____';
    
    return `Se entiende por lengua materna aquella que es la primera lengua que aprende una persona. En base a los datos de la Plataforma Nacional de Datos Georreferenciados – Geo Perú, el castellano es la categoría mayoritaria, al representar el ${porcentajeCastellano} de la población de 3 años a más. En segundo lugar, se halla el quechua, siendo la lengua materna del ${porcentajeQuechua} de los habitantes.`;
  }

  obtenerTextoIdiomaConResaltado(): SafeHtml {
    const texto = this.obtenerTextoIdioma();
    const top2 = this.obtenerTop2Lenguas();
    
    let html = texto;
    
    // Reemplazar ANTES de escapar HTML
    // Resaltar primera categoría (LILA - data-source)
    if (top2.primera && top2.primera.categoria) {
      const categoriaPrimera = top2.primera.categoria;
      html = html.split(categoriaPrimera).join(`[CATEGORIA_1:${categoriaPrimera}]`);
    }
    
    // Resaltar primer porcentaje (VERDE - data-calculated con %)
    if (top2.primera && top2.primera.porcentaje) {
      const porcentajePrimera = String(top2.primera.porcentaje);
      html = html.split(porcentajePrimera).join(`[PORCENTAJE_1:${porcentajePrimera}]`);
    }
    
    // Resaltar segunda categoría (LILA - data-source)
    if (top2.segunda && top2.segunda.categoria) {
      const categoriaSegunda = top2.segunda.categoria;
      html = html.split(categoriaSegunda).join(`[CATEGORIA_2:${categoriaSegunda}]`);
    }
    
    // Resaltar segundo porcentaje (VERDE - data-calculated con %)
    if (top2.segunda && top2.segunda.porcentaje) {
      const porcentajeSegunda = String(top2.segunda.porcentaje);
      html = html.split(porcentajeSegunda).join(`[PORCENTAJE_2:${porcentajeSegunda}]`);
    }
    
    // AHORA escapar el HTML
    html = this.escapeHtml(html);
    
    // Y AHORA hacer los reemplazos con spans
    if (top2.primera && top2.primera.categoria) {
      const categoriaPrimera = top2.primera.categoria;
      const placeholder = `[CATEGORIA_1:${categoriaPrimera}]`;
      html = html.split(placeholder).join(`<span class="data-source">${this.escapeHtml(categoriaPrimera)}</span>`);
    }
    
    if (top2.primera && top2.primera.porcentaje) {
      const porcentajePrimera = String(top2.primera.porcentaje);
      const placeholder = `[PORCENTAJE_1:${porcentajePrimera}]`;
      html = html.split(placeholder).join(`<span class="data-calculated">${this.escapeHtml(porcentajePrimera)}%</span>`);
    }
    
    if (top2.segunda && top2.segunda.categoria) {
      const categoriaSegunda = top2.segunda.categoria;
      const placeholder = `[CATEGORIA_2:${categoriaSegunda}]`;
      html = html.split(placeholder).join(`<span class="data-source">${this.escapeHtml(categoriaSegunda)}</span>`);
    }
    
    if (top2.segunda && top2.segunda.porcentaje) {
      const porcentajeSegunda = String(top2.segunda.porcentaje);
      const placeholder = `[PORCENTAJE_2:${porcentajeSegunda}]`;
      html = html.split(placeholder).join(`<span class="data-calculated">${this.escapeHtml(porcentajeSegunda)}%</span>`);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getFieldIdAspectosCulturales(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoAspectosCulturales${prefijo}` : 'textoAspectosCulturales';
  }

  obtenerTextoAspectosCulturales(): string {
    const fieldId = this.getFieldIdAspectosCulturales();
    const textoPersonalizado = this.datos[fieldId] || this.datos.textoAspectosCulturales;
    
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado;
    }
    
    return '';
  }

  obtenerTextoAspectosCulturalesConResaltado(): SafeHtml {
    const texto = this.obtenerTextoAspectosCulturales();
    let html = this.escapeHtml(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeRegex(str: any): string {
    if (typeof str !== 'string') {
      return '';
    }
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

}

