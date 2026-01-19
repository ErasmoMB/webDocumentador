import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { StateService } from 'src/app/core/services/state.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { ViewChildHelper } from 'src/app/shared/utils/view-child-helper';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion7-form-wrapper',
  templateUrl: './seccion7-form-wrapper.component.html',
  styleUrls: ['./seccion7-form-wrapper.component.css']
})
export class Seccion7FormWrapperComponent implements OnInit, OnDestroy {
  @Input() seccionId: string = '';
  
  formData: any = {};
  datos: any = {};
  private subscription?: Subscription;

  petConfig: TableConfig = {
    tablaKey: 'petTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0,00 %' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  peaConfig: TableConfig = {
    tablaKey: 'peaTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [
      { categoria: 'PEA', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' },
      { categoria: 'No PEA', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' }
    ],
    calcularPorcentajes: true,
    camposParaCalcular: ['hombres', 'mujeres']
  };

  constructor(
    private formularioService: FormularioService,
    private stateService: StateService,
    private tableService: TableManagementService,
    public cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.actualizarDatos();
    this.subscription = this.stateService.datos$.subscribe(datos => {
      if (datos) {
        this.actualizarDatos();
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  actualizarDatos() {
    this.eliminarFilasTotal();
    this.datos = this.formularioService.obtenerDatos();
    this.formData = { ...this.datos };
  }

  private eliminarFilasTotal(): void {
    const datos = this.formularioService.obtenerDatos();
    let huboaCambios = false;
    
    const petTablaKey = this.getTablaKeyPET();
    const petTabla = PrefijoHelper.obtenerValorConPrefijo(datos, 'petTabla', this.seccionId) || datos[petTablaKey] || datos['petTabla'];
    if (petTabla && Array.isArray(petTabla)) {
      const longitudOriginal = petTabla.length;
      const datosFiltrados = petTabla.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.formularioService.actualizarDato(petTablaKey, datosFiltrados);
        huboaCambios = true;
      }
    }
    
    if (datos['peaTabla'] && Array.isArray(datos['peaTabla'])) {
      const longitudOriginal = datos['peaTabla'].length;
      const datosFiltrados = datos['peaTabla'].filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        datos['peaTabla'] = datosFiltrados;
        this.formularioService.actualizarDato('peaTabla', datos['peaTabla']);
        huboaCambios = true;
      }
    }
    
    if (datos['peaOcupadaTabla'] && Array.isArray(datos['peaOcupadaTabla'])) {
      const longitudOriginal = datos['peaOcupadaTabla'].length;
      const datosFiltrados = datos['peaOcupadaTabla'].filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        datos['peaOcupadaTabla'] = datosFiltrados;
        this.formularioService.actualizarDato('peaOcupadaTabla', datos['peaOcupadaTabla']);
        huboaCambios = true;
      }
    }
  }

  getPetConfig(): TableConfig {
    return {
      ...this.petConfig,
      tablaKey: this.getTablaKeyPET()
    };
  }

  onPETFieldChange(index: number, field: string, value: any) {
    const tablaKey = this.getTablaKeyPET();
    const config = this.getPetConfig();
    this.tableService.actualizarFila(this.datos, config, index, field, value, false);
    if (field === 'casos') {
      this.tableService.calcularPorcentajes(this.datos, config);
    }
    this.eliminarFilasTotal();
    this.formularioService.actualizarDato(tablaKey, this.datos[tablaKey]);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onPETTableUpdated() {
    const tablaKey = this.getTablaKeyPET();
    const config = this.getPetConfig();
    this.tableService.calcularPorcentajes(this.datos, config);
    this.eliminarFilasTotal();
    this.formularioService.actualizarDato(tablaKey, this.datos[tablaKey]);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  getTablaKeyPET(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `petTabla${prefijo}` : 'petTabla';
  }

  getTablaPET(): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'petTabla', this.seccionId);
    return pref || this.datos.petTabla || [];
  }

  getTotalPET(): string {
    const petTabla = this.getTablaPET();
    if (!petTabla || !Array.isArray(petTabla)) {
      return '0';
    }
    const datosSinTotal = petTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  onPEATableUpdated() {
    this.calcularPorcentajesPEA();
    this.eliminarFilasTotal();
    this.formularioService.actualizarDato('peaTabla', this.datos['peaTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onPEAFieldChange(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.peaConfig, index, field, value, false);
    if (field === 'hombres' || field === 'mujeres') {
      const tabla = this.datos['peaTabla'] || [];
      if (tabla[index]) {
        const hombres = parseFloat(tabla[index].hombres) || 0;
        const mujeres = parseFloat(tabla[index].mujeres) || 0;
        tabla[index].casos = hombres + mujeres;
      }
    }
    this.calcularPorcentajesPEA();
    this.eliminarFilasTotal();
    this.formularioService.actualizarDato('peaTabla', this.datos['peaTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  calcularPorcentajesPEA() {
    if (!this.datos['peaTabla'] || !Array.isArray(this.datos['peaTabla']) || this.datos['peaTabla'].length === 0) {
      return;
    }
    
    const tabla = this.datos['peaTabla'];
    const totalHombres = tabla.reduce((sum: number, item: any) => {
      if (!item.categoria || !item.categoria.toString().toLowerCase().includes('total')) {
        return sum + (parseFloat(item.hombres) || 0);
      }
      return sum;
    }, 0);
    
    const totalMujeres = tabla.reduce((sum: number, item: any) => {
      if (!item.categoria || !item.categoria.toString().toLowerCase().includes('total')) {
        return sum + (parseFloat(item.mujeres) || 0);
      }
      return sum;
    }, 0);
    
    const totalCasos = tabla.reduce((sum: number, item: any) => {
      if (!item.categoria || !item.categoria.toString().toLowerCase().includes('total')) {
        return sum + (parseFloat(item.casos) || 0);
      }
      return sum;
    }, 0);
    
    tabla.forEach((item: any) => {
      if (!item.categoria || !item.categoria.toString().toLowerCase().includes('total')) {
        const hombres = parseFloat(item.hombres) || 0;
        const mujeres = parseFloat(item.mujeres) || 0;
        const casos = parseFloat(item.casos) || 0;
        
        if (totalHombres > 0) {
          const porcentajeHombres = ((hombres / totalHombres) * 100).toFixed(2).replace('.', ',');
          item.porcentajeHombres = porcentajeHombres + ' %';
        } else {
          item.porcentajeHombres = '0,00 %';
        }
        
        if (totalMujeres > 0) {
          const porcentajeMujeres = ((mujeres / totalMujeres) * 100).toFixed(2).replace('.', ',');
          item.porcentajeMujeres = porcentajeMujeres + ' %';
        } else {
          item.porcentajeMujeres = '0,00 %';
        }
        
        if (totalCasos > 0) {
          const porcentaje = ((casos / totalCasos) * 100).toFixed(2).replace('.', ',');
          item.porcentaje = porcentaje + ' %';
        } else {
          item.porcentaje = '0,00 %';
        }
      }
    });
  }

  getTotalPEA(): string {
    if (!this.datos?.peaTabla || !Array.isArray(this.datos.peaTabla)) {
      return '0';
    }
    const datosSinTotal = this.datos.peaTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getPEAOcupadaSinTotal(): any[] {
    if (!this.datos?.peaOcupadaTabla || !Array.isArray(this.datos.peaOcupadaTabla)) {
      return [];
    }
    return this.datos.peaOcupadaTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalPEAOcupada(): string {
    if (!this.datos?.peaOcupadaTabla || !Array.isArray(this.datos.peaOcupadaTabla)) {
      return '0';
    }
    const datosSinTotal = this.datos.peaOcupadaTabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  onFieldChange(fieldId: string, value: any) {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    this.formData[fieldId] = valorLimpio;
    this.formularioService.actualizarDato(fieldId as any, valorLimpio);
    this.actualizarDatos();
  }

  actualizarPEAOcupada(index: number, field: string, value: any) {
    if (!this.datos['peaOcupadaTabla']) {
      this.datos['peaOcupadaTabla'] = [];
    }
    if (!this.datos['peaOcupadaTabla'][index]) {
      this.datos['peaOcupadaTabla'][index] = {};
    }
    this.datos['peaOcupadaTabla'][index][field] = value;
    
    if (field === 'hombres' || field === 'mujeres') {
      const hombres = parseFloat(this.datos['peaOcupadaTabla'][index].hombres) || 0;
      const mujeres = parseFloat(this.datos['peaOcupadaTabla'][index].mujeres) || 0;
      this.datos['peaOcupadaTabla'][index].casos = hombres + mujeres;
    }
    
    this.calcularPorcentajesPEAOcupada();
    this.formularioService.actualizarDato('peaOcupadaTabla', this.datos['peaOcupadaTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  calcularPorcentajesPEAOcupada() {
    if (!this.datos['peaOcupadaTabla'] || !Array.isArray(this.datos['peaOcupadaTabla']) || this.datos['peaOcupadaTabla'].length === 0) {
      return;
    }
    
    const tabla = this.datos['peaOcupadaTabla'];
    const totalHombres = tabla.reduce((sum: number, item: any) => {
      if (!item.categoria || !item.categoria.toString().toLowerCase().includes('total')) {
        return sum + (parseFloat(item.hombres) || 0);
      }
      return sum;
    }, 0);
    
    const totalMujeres = tabla.reduce((sum: number, item: any) => {
      if (!item.categoria || !item.categoria.toString().toLowerCase().includes('total')) {
        return sum + (parseFloat(item.mujeres) || 0);
      }
      return sum;
    }, 0);
    
    const totalCasos = tabla.reduce((sum: number, item: any) => {
      if (!item.categoria || !item.categoria.toString().toLowerCase().includes('total')) {
        return sum + (parseFloat(item.casos) || 0);
      }
      return sum;
    }, 0);
    
    tabla.forEach((item: any) => {
      if (!item.categoria || !item.categoria.toString().toLowerCase().includes('total')) {
        const hombres = parseFloat(item.hombres) || 0;
        const mujeres = parseFloat(item.mujeres) || 0;
        const casos = parseFloat(item.casos) || 0;
        
        if (totalHombres > 0) {
          const porcentajeHombres = ((hombres / totalHombres) * 100).toFixed(2).replace('.', ',');
          item.porcentajeHombres = porcentajeHombres + ' %';
        } else {
          item.porcentajeHombres = '0,00 %';
        }
        
        if (totalMujeres > 0) {
          const porcentajeMujeres = ((mujeres / totalMujeres) * 100).toFixed(2).replace('.', ',');
          item.porcentajeMujeres = porcentajeMujeres + ' %';
        } else {
          item.porcentajeMujeres = '0,00 %';
        }
        
        if (totalCasos > 0) {
          const porcentaje = ((casos / totalCasos) * 100).toFixed(2).replace('.', ',');
          item.porcentaje = porcentaje + ' %';
        } else {
          item.porcentaje = '0,00 %';
        }
      }
    });
  }

  eliminarPEAOcupada(index: number) {
    if (this.datos['peaOcupadaTabla'] && this.datos['peaOcupadaTabla'].length > 1) {
      this.datos['peaOcupadaTabla'].splice(index, 1);
      this.formularioService.actualizarDato('peaOcupadaTabla', this.datos['peaOcupadaTabla']);
      this.actualizarDatos();
    }
  }

  inicializarPEAOcupada() {
    if (!this.datos['peaOcupadaTabla'] || this.datos['peaOcupadaTabla'].length === 0) {
      this.datos['peaOcupadaTabla'] = [
        { categoria: 'PEA Ocupada', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' },
        { categoria: 'PEA Desocupada', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('peaOcupadaTabla', this.datos['peaOcupadaTabla']);
      this.actualizarDatos();
    }
  }

  agregarPEAOcupada() {
    if (!this.datos['peaOcupadaTabla']) {
      this.datos['peaOcupadaTabla'] = [];
    }
    this.datos['peaOcupadaTabla'].push({
      categoria: '',
      hombres: 0,
      porcentajeHombres: '0,00 %',
      mujeres: 0,
      porcentajeMujeres: '0,00 %',
      casos: 0,
      porcentaje: '0,00 %'
    });
    this.formularioService.actualizarDato('peaOcupadaTabla', this.datos['peaOcupadaTabla']);
    this.actualizarDatos();
  }

  getPorcentajePET(): string {
    if (!this.datos?.petTabla || !Array.isArray(this.datos.petTabla)) {
      return '____';
    }
    const total = this.datos.petTabla.find((item: any) => item.categoria === 'Total');
    return total?.porcentaje || '____';
  }

  getPorcentajePETGrupo(categoria: string): string {
    if (!this.datos?.petTabla || !Array.isArray(this.datos.petTabla)) {
      return '____';
    }
    const grupo = this.datos.petTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase())
    );
    return grupo?.porcentaje || '____';
  }

  getPorcentajePEA(): string {
    if (!this.datos?.peaTabla || !Array.isArray(this.datos.peaTabla)) {
      return '____';
    }
    const pea = this.datos.peaTabla.find((item: any) => item.categoria === 'PEA');
    return pea?.porcentaje || '____';
  }

  getPorcentajeNoPEA(): string {
    if (!this.datos?.peaTabla || !Array.isArray(this.datos.peaTabla)) {
      return '____';
    }
    const noPea = this.datos.peaTabla.find((item: any) => item.categoria === 'No PEA');
    return noPea?.porcentaje || '____';
  }

  getPorcentajePEAHombres(): string {
    if (!this.datos?.peaTabla || !Array.isArray(this.datos.peaTabla)) {
      return '____';
    }
    const pea = this.datos.peaTabla.find((item: any) => item.categoria === 'PEA');
    return pea?.porcentajeHombres || '____';
  }

  getPorcentajeNoPEAMujeres(): string {
    if (!this.datos?.peaTabla || !Array.isArray(this.datos.peaTabla)) {
      return '____';
    }
    const noPea = this.datos.peaTabla.find((item: any) => item.categoria === 'No PEA');
    return noPea?.porcentajeMujeres || '____';
  }

  getPorcentajePEADesocupada(): string {
    if (!this.datos?.peaOcupadaTabla || !Array.isArray(this.datos.peaOcupadaTabla)) {
      return '____';
    }
    const desocupada = this.datos.peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('desocupada')
    );
    return desocupada?.porcentaje || '____';
  }

  getPorcentajePEAOcupadaHombres(): string {
    if (!this.datos?.peaOcupadaTabla || !Array.isArray(this.datos.peaOcupadaTabla)) {
      return '____';
    }
    const ocupada = this.datos.peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && !item.categoria.toLowerCase().includes('desocupada')
    );
    return ocupada?.porcentajeHombres || '____';
  }

  getPorcentajePEAOcupadaMujeres(): string {
    if (!this.datos?.peaOcupadaTabla || !Array.isArray(this.datos.peaOcupadaTabla)) {
      return '____';
    }
    const ocupada = this.datos.peaOcupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada') && !item.categoria.toLowerCase().includes('desocupada')
    );
    return ocupada?.porcentajeMujeres || '____';
  }

  obtenerTextoPET(): string {
    if (this.datos.textoPET && this.datos.textoPET !== '____') {
      return this.datos.textoPET;
    }
    
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    const porcentajePET = this.getPorcentajePET();
    const porcentaje1529 = this.getPorcentajePETGrupo('15 a 29 años');
    const porcentaje65 = this.getPorcentajePETGrupo('65 años a más');
    
    return `En concordancia con el Convenio 138 de la Organización Internacional de Trabajo (OIT), aprobado por Resolución Legislativa Nº27453 de fecha 22 de mayo del 2001 y ratificado por DS Nº038-2001-RE, publicado el 31 de mayo de 2001, la población cumplida los 14 años de edad se encuentra en edad de trabajar.\n\nLa población en edad de trabajar (PET) de la CC ${grupoAISD}, considerada desde los 15 años a más, se compone del ${porcentajePET} de la población total. El bloque etario que más aporta a la PET es el de 15 a 29 años, pues representa el ${porcentaje1529} de este grupo poblacional. Por otro lado, el grupo etario que menos aporta al indicador es el de 65 años a más al representar solamente un ${porcentaje65}.`;
  }

  obtenerTextoDetalePEA(): string {
    if (this.datos.textoDetalePEA && this.datos.textoDetalePEA !== '____') {
      return this.datos.textoDetalePEA;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const poblacionDistrital = this.datos.poblacionDistritalCahuacho || '610';
    const petDistrital = this.datos.petDistritalCahuacho || '461';
    
    return `No obstante, los indicadores de la PEA, tanto de su cantidad total como por subgrupos (Ocupada y Desocupada), se describen a nivel distrital siguiendo la información oficial de la publicación "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI. Para ello es importante tomar en cuenta que la población distrital de ${distrito}, jurisdicción donde se ubica el AISD en cuestión, es de ${poblacionDistrital} personas, y que la PET (de 14 años a más) al mismo nivel está conformada por ${petDistrital} personas.`;
  }

  obtenerTextoDefinicionPEA(): string {
    if (this.datos.textoDefinicionPEA && this.datos.textoDefinicionPEA !== '____') {
      return this.datos.textoDefinicionPEA;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    
    return `La Población Económicamente Activa (PEA) constituye un indicador fundamental para comprender la dinámica económica y social de cualquier jurisdicción al nivel que se requiera. En este apartado, se presenta una descripción de la PEA del distrito de ${distrito}, jurisdicción que abarca a las poblaciones de la CC ${grupoAISD}. Para ello, se emplea la fuente "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI, con el cual se puede visualizar las características demográficas de la población en capacidad de trabajar en el distrito en cuestión.`;
  }

  obtenerTextoAnalisisPEA(): string {
    if (this.datos.textoAnalisisPEA && this.datos.textoAnalisisPEA !== '____') {
      return this.datos.textoAnalisisPEA;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const porcentajePEA = this.getPorcentajePEA();
    const porcentajeNoPEA = this.getPorcentajeNoPEA();
    const porcentajePEAHombres = this.getPorcentajePEAHombres();
    const porcentajeNoPEAMujeres = this.getPorcentajeNoPEAMujeres();
    
    return `Del cuadro precedente, se aprecia que la PEA del distrito de ${distrito} representa un ${porcentajePEA} del total de la PET de la jurisdicción, mientras que la No PEA abarca el ${porcentajeNoPEA} restante. Asimismo, se visualiza que los hombres se encuentran predominantemente dentro del indicador de PEA con un ${porcentajePEAHombres}; mientras que, en el caso de las mujeres, se hallan mayormente en el indicador de No PEA (${porcentajeNoPEAMujeres}).`;
  }

  obtenerTextoIndiceDesempleo(): string {
    if (this.datos.textoIndiceDesempleo && this.datos.textoIndiceDesempleo !== '____') {
      return this.datos.textoIndiceDesempleo;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId) || '____';
    
    return `El índice de desempleo es un indicador clave para evaluar la salud económica de una jurisdicción de cualquier nivel, ya que refleja la proporción de la Población Económicamente Activa (PEA) que se encuentra en busca de empleo, pero no logra obtenerlo. En este ítem, se caracteriza el índice de desempleo del distrito de ${distrito}, el cual abarca los poblados de la CC ${grupoAISD}. Para ello, se emplea la fuente "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI, con el cual se puede visualizar las características demográficas de la población que forma parte de la PEA y distinguir entre sus subgrupos (Ocupada y Desocupada).`;
  }

  obtenerNombreComunidadActual(): string {
    if (!this.datos) return '____';
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    if (!prefijo || !prefijo.startsWith('_A')) {
      return this.datos.grupoAISD || '____';
    }
    return this.datos.grupoAISD || '____';
  }

  obtenerTextoAnalisisOcupacion(): string {
    if (this.datos.textoAnalisisOcupacion && this.datos.textoAnalisisOcupacion !== '____') {
      return this.datos.textoAnalisisOcupacion;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const porcentajeDesocupada = this.getPorcentajePEADesocupada();
    const porcentajeOcupadaHombres = this.getPorcentajePEAOcupadaHombres();
    const porcentajeOcupadaMujeres = this.getPorcentajePEAOcupadaMujeres();
    
    return `Del cuadro precedente, se halla que en el distrito de ${distrito} la PEA Desocupada representa un ${porcentajeDesocupada} del total de la PEA. En adición a ello, se aprecia que tanto hombres como mujeres se encuentran predominantemente en el indicador de PEA Ocupada, con porcentajes de ${porcentajeOcupadaHombres} y ${porcentajeOcupadaMujeres}, respectivamente.`;
  }
}
