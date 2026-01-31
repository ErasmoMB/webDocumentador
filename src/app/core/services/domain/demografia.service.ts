import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { ProjectStateFacade } from '../../state/project-state.facade';
import { LoggerService } from '../infrastructure/logger.service';
import { MathUtil } from '../../utils/math.util';
import { CentroPoblado } from '../../models/api-response.model';
import { FormularioDatos } from '../../models/formulario.model';

/**
 * DemografiaService - Servicio para manejo de datos demográficos
 * 
 * ✅ FASE 4: Migrado a usar solo ProjectStateFacade
 */
@Injectable({
  providedIn: 'root'
})
export class DemografiaService {

  constructor(
    private dataService: DataService,
    private projectFacade: ProjectStateFacade,
    private logger: LoggerService
  ) {}

  async cargarDatosDemografiaAISD(
    datos: FormularioDatos,
    filasTablaAISD2: number,
    formData: Partial<FormularioDatos>
  ): Promise<FormularioDatos> {
    let codigosCPP: string[] = [];
    
    if (datos['codigos'] && Array.isArray(datos['codigos'])) {
      codigosCPP = datos['codigos'];
    } else {
      for (let i = 1; i <= filasTablaAISD2; i++) {
        const codigo = formData[`tablaAISD2Fila${i}Codigo`] || datos[`tablaAISD2Fila${i}Codigo`] || '';
        if (codigo && codigo.trim() !== '') {
          codigosCPP.push(codigo.trim());
        }
      }
    }
    
    if (!codigosCPP || codigosCPP.length === 0) {
      const distrito = datos['distritoSeleccionado'];
      if (!distrito) {
        throw new Error('Por favor, primero carga el JSON en la sección 3.1.4 para obtener los códigos CPP. Sin códigos CPP solo se puede cargar población por sexo, no por grupo etario.');
      }
      throw new Error('NO_CODIGOS_CPP');
    }
    
    const codigosValidos = codigosCPP.filter((codigo: string) => codigo && codigo.trim() !== '');
    if (codigosValidos.length === 0) {
      throw new Error('No se encontraron códigos CPP válidos. Por favor, verifica la tabla en la sección 3.1.4.');
    }
    
    return this.cargarPorCodigosCPP(datos, codigosValidos);
  }

  cargarPorDistrito(datos: FormularioDatos, distrito: string): Promise<FormularioDatos> {
    return new Promise((resolve, reject) => {
      this.dataService.getPoblacionByDistrito(distrito.toUpperCase()).subscribe({
        next: (response) => {
          if (response && response.success && Array.isArray(response.data)) {
            const grupoAISD = datos['grupoAISD'];
            const centroPoblado = response.data.find((cp: CentroPoblado) => 
              cp.centro_poblado && cp.centro_poblado.toUpperCase() === grupoAISD?.toUpperCase()
            ) || response.data[0];
            
            if (centroPoblado) {
              const total = centroPoblado.total || 0;
              const hombres = centroPoblado.hombres || 0;
              const mujeres = centroPoblado.mujeres || 0;
              
              const porcentajeHombres = MathUtil.calcularPorcentajeConComa(hombres, total);
              const porcentajeMujeres = MathUtil.calcularPorcentajeConComa(mujeres, total);
              
              datos['tablaAISD2TotalPoblacion'] = total.toString();
              datos['poblacionSexoAISD'] = [
                { sexo: 'Hombres', casos: hombres, porcentaje: porcentajeHombres },
                { sexo: 'Mujeres', casos: mujeres, porcentaje: porcentajeMujeres }
              ];
              
              resolve(datos);
            } else {
              reject(new Error('No se encontró el centro poblado'));
            }
          } else {
            reject(new Error('Respuesta inválida del servidor'));
          }
        },
        error: (error) => {
          this.logger.error('Error al cargar datos demográficos:', error);
          reject(error);
        }
      });
    });
  }

  private cargarPorCodigosCPP(datos: FormularioDatos, codigosCPP: string[]): Promise<FormularioDatos> {
    return new Promise((resolve, reject) => {
      this.dataService.getPoblacionByCpp(codigosCPP).subscribe({
        next: (response) => {
          if (response && response.success && response.data && response.data.poblacion) {
            const poblacion = response.data.poblacion;
            
            const totalPoblacion = poblacion.total_poblacion || 0;
            const totalHombres = poblacion.total_varones || 0;
            const totalMujeres = poblacion.total_mujeres || 0;
            
            const porcentajeHombres = MathUtil.calcularPorcentajeConComa(totalHombres, totalPoblacion);
            const porcentajeMujeres = MathUtil.calcularPorcentajeConComa(totalMujeres, totalPoblacion);
            
            datos['tablaAISD2TotalPoblacion'] = totalPoblacion.toString();
            datos['poblacionSexoAISD'] = [
              { sexo: 'Hombres', casos: totalHombres, porcentaje: porcentajeHombres },
              { sexo: 'Mujeres', casos: totalMujeres, porcentaje: porcentajeMujeres }
            ];
            
            const edad0_14 = poblacion.edad_0_14 || 0;
            const edad15_29 = poblacion.edad_15_29 || 0;
            const edad30_44 = poblacion.edad_30_44 || 0;
            const edad45_64 = poblacion.edad_45_64 || 0;
            const edad65_mas = poblacion.edad_65_mas || 0;
            
            datos['poblacionEtarioAISD'] = [
              { categoria: '0 a 14 años', casos: edad0_14, porcentaje: MathUtil.calcularPorcentajeConComa(edad0_14, totalPoblacion) },
              { categoria: '15 a 29 años', casos: edad15_29, porcentaje: MathUtil.calcularPorcentajeConComa(edad15_29, totalPoblacion) },
              { categoria: '30 a 44 años', casos: edad30_44, porcentaje: MathUtil.calcularPorcentajeConComa(edad30_44, totalPoblacion) },
              { categoria: '45 a 64 años', casos: edad45_64, porcentaje: MathUtil.calcularPorcentajeConComa(edad45_64, totalPoblacion) },
              { categoria: '65 años a más', casos: edad65_mas, porcentaje: MathUtil.calcularPorcentajeConComa(edad65_mas, totalPoblacion) }
            ];
            
            const petTotal = edad15_29 + edad30_44 + edad45_64 + edad65_mas;
            
            if (!datos['petTabla'] || datos['petTabla'].length === 0) {
              datos['petTabla'] = [
                { categoria: '15 a 29 años', casos: edad15_29, porcentaje: MathUtil.calcularPorcentajeConComa(edad15_29, petTotal) },
                { categoria: '30 a 44 años', casos: edad30_44, porcentaje: MathUtil.calcularPorcentajeConComa(edad30_44, petTotal) },
                { categoria: '45 a 64 años', casos: edad45_64, porcentaje: MathUtil.calcularPorcentajeConComa(edad45_64, petTotal) },
                { categoria: '65 años a más', casos: edad65_mas, porcentaje: MathUtil.calcularPorcentajeConComa(edad65_mas, petTotal) }
              ];
            }
            
            resolve(datos);
          } else {
            reject(new Error('Respuesta inválida del servidor'));
          }
        },
        error: (error) => {
          this.logger.error('Error al cargar datos demográficos desde códigos CPP:', error);
          reject(error);
        }
      });
    });
  }

  async cargarDatosDemografiaAISI(datos: FormularioDatos): Promise<FormularioDatos> {
    const distrito = datos['distritoSeleccionado'];
    if (!distrito) {
      throw new Error('Por favor, seleccione primero un distrito');
    }

    const jsonData = this.projectFacade.obtenerDatos()['centrosPobladosJSON'] || [];
    if (!jsonData || jsonData.length === 0) {
      throw new Error('No hay datos de centros poblados cargados');
    }

    const centroPobladoAISI = datos['centroPobladoAISI'];
    let centroPoblado: any = null;

    if (centroPobladoAISI) {
      centroPoblado = jsonData.find((cp: any) => 
        cp.CCPP && cp.CCPP.toUpperCase() === centroPobladoAISI.toUpperCase()
      );
    }

    if (!centroPoblado && jsonData.length > 0) {
      centroPoblado = jsonData[0];
    }

    if (!centroPoblado || !centroPoblado.POBLACION) {
      throw new Error('No se encontró información de población para el centro poblado seleccionado');
    }

    return new Promise((resolve, reject) => {
      this.dataService.getPoblacionByDistrito(distrito.toUpperCase()).subscribe({
        next: (response) => {
          if (response && response.success && Array.isArray(response.data)) {
            const centroPobladoEncontrado = response.data.find((cp: CentroPoblado) => 
              cp.centro_poblado && cp.centro_poblado.toUpperCase() === centroPobladoAISI?.toUpperCase()
            ) || response.data[0];

            if (centroPobladoEncontrado) {
              const total = centroPobladoEncontrado.total || 0;
              const hombres = centroPobladoEncontrado.hombres || 0;
              const mujeres = centroPobladoEncontrado.mujeres || 0;

              const porcentajeHombres = MathUtil.calcularPorcentajeConComa(hombres, total);
              const porcentajeMujeres = MathUtil.calcularPorcentajeConComa(mujeres, total);

              datos['poblacionDistritalAISI'] = total.toString();
              datos['poblacionSexoAISI'] = [
                { sexo: 'Hombres', casos: hombres, porcentaje: porcentajeHombres },
                { sexo: 'Mujeres', casos: mujeres, porcentaje: porcentajeMujeres }
              ];

              resolve(datos);
            } else {
              reject(new Error('No se encontró el centro poblado en la respuesta'));
            }
          } else {
            reject(new Error('Respuesta inválida del servidor'));
          }
        },
        error: (error) => {
          this.logger.error('Error al cargar datos demográficos AISI:', error);
          reject(error);
        }
      });
    });
  }
}

