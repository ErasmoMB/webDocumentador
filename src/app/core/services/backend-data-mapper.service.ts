import { Injectable } from '@angular/core';

export interface DataMapping {
  fieldName: string;
  endpoint: string;
  transform?: (data: any) => any;
  paramType?: 'id_ubigeo' | 'ubigeo';
  aggregatable?: boolean;
}

export interface SectionDataConfig {
  [fieldName: string]: DataMapping;
}

@Injectable({
  providedIn: 'root'
})
export class BackendDataMapperService {
  private readonly mappingConfigs: Map<string, SectionDataConfig> = new Map();

  constructor() {
    this.initializeMappings();
  }

  private initializeMappings(): void {
    this.mappingConfigs.set('seccion6_aisd', {
      poblacionSexoAISD: {
        fieldName: 'poblacionSexoAISD',
        endpoint: '/demograficos/datos',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => this.transformPoblacionSexo(data)
      },
      poblacionEtarioAISD: {
        fieldName: 'poblacionEtarioAISD',
        endpoint: '/demograficos/datos',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => this.transformPoblacionEtario(data)
      }
    });

    this.mappingConfigs.set('seccion7_aisd', {
      petTabla: {
        fieldName: 'petTabla',
        endpoint: '/demograficos/datos',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => this.transformPETTabla(data)
      }
    });

    this.mappingConfigs.set('seccion8_aisd', {
      actividadesEconomicasAISD: {
        fieldName: 'actividadesEconomicasAISD',
        endpoint: '/economicos/principales',
        paramType: 'id_ubigeo',
        // Agregar múltiples CCPP suma sus casos por categoría
        aggregatable: true,
        transform: (data) => this.transformActividades(data)
      },
      peaOcupacionesTabla: {
        fieldName: 'peaOcupacionesTabla',
        endpoint: '/economicos/principales',
        paramType: 'id_ubigeo',
        // Agregar múltiples CCPP suma sus casos por categoría
        aggregatable: true,
        transform: (data) => this.transformPEAOcupaciones(data)
      }
    });

    this.mappingConfigs.set('seccion4_aisd', {
      tablaAISD2Datos: {
        fieldName: 'tablaAISD2Datos',
        endpoint: '/aisd/centros-poblados',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => {
          if (!Array.isArray(data)) return [];
          
          const resultado = data.map((item: any) => ({
            punto: item.centro_poblado || '____',
            codigo: item.codigo || '____',
            poblacion: item.poblacion || 0,
            viviendasEmpadronadas: item.viviendas_empadronadas || 0,
            viviendasOcupadas: item.viviendas_ocupadas || 0,
            Punto: item.centro_poblado || '____',
            Codigo: item.codigo || '____',
            Poblacion: item.poblacion || 0,
            ViviendasEmpadronadas: item.viviendas_empadronadas || 0,
            ViviendasOcupadas: item.viviendas_ocupadas || 0
          }));
          
          return resultado;
        }
      }
    });

    this.mappingConfigs.set('seccion9_aisd', {
      condicionOcupacionTabla: {
        fieldName: 'condicionOcupacionTabla',
        endpoint: '/aisd/centros-poblados',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => {
          const arr = Array.isArray(data) ? data : [];

          const toNum = (v: any) => {
            const n = typeof v === 'number' ? v : parseInt(v, 10);
            return isNaN(n) ? 0 : n;
          };

          const emp = arr.reduce((sum, x) => sum + toNum(x?.viviendas_empadronadas), 0);
          const ocu = arr.reduce((sum, x) => sum + toNum(x?.viviendas_ocupadas), 0);
          const otras = Math.max(emp - ocu, 0);

          const total = emp;
          if (total <= 0) {
            return [];
          }

          const pctOcu = total > 0 ? Math.round(((ocu / total) * 100) * 100) / 100 : 0;
          const pctOtras = total > 0 ? Math.round(((otras / total) * 100) * 100) / 100 : 0;
          const diff = Math.round((100 - (pctOcu + pctOtras)) * 100) / 100;
          const pctOtrasAdj = Math.round((pctOtras + diff) * 100) / 100;

          const formatPct = (v: number) =>
            v.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ',') + ' %';

          const resultado = [
            { categoria: 'Viviendas ocupadas', casos: ocu, porcentaje: formatPct(pctOcu) },
            { categoria: 'Viviendas con otra condición', casos: otras, porcentaje: formatPct(pctOtrasAdj) }
          ];
          
          return resultado;
        }
      },
      materialesConstruccionAISD: {
        fieldName: 'materialesConstruccionAISD',
        endpoint: '/aisd/materiales-construccion',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => this.transformMateriales(data)
      },
       tiposMaterialesTabla: {
         fieldName: 'tiposMaterialesTabla',
         endpoint: '/aisd/materiales-construccion',
         paramType: 'id_ubigeo',
         aggregatable: true,
         transform: (data) => {
           if (!Array.isArray(data)) return [];
           
           const norm = (s: any) =>
             (s ?? '')
               .toString()
               .normalize('NFD')
               .replace(/[\u0300-\u036f]/g, '')
               .toLowerCase()
               .replace(/\s+/g, ' ')
               .trim();

           // Agrupar por categoría normalizada + tipo material normalizado
           const grouped = new Map<string, any>();
           
           data.forEach((item: any) => {
             const catNorm = norm(item.categoria);
             const tipoNorm = norm(item.tipo_material || item.tipoMaterial);
             const key = `${catNorm}|||${tipoNorm}`;
             const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos, 10) || 0;
             
             if (grouped.has(key)) {
               grouped.get(key).casos += casos;
             } else {
               grouped.set(key, {
                 categoria: item.categoria,
                 tipoMaterial: item.tipo_material || item.tipoMaterial,
                 casos: casos
               });
             }
           });

           // Convertir a array y ordenar por categoría
           const filas = Array.from(grouped.values()).sort((a, b) => {
             const catA = norm(a.categoria);
             const catB = norm(b.categoria);
             if (catA !== catB) return catA.localeCompare(catB);
             return norm(a.tipoMaterial).localeCompare(norm(b.tipoMaterial));
           });

           return filas;
         }
       }
    });

    this.mappingConfigs.set('seccion10_aisd', {
      abastecimientoAguaTabla: {
        fieldName: 'abastecimientoAguaTabla',
        endpoint: '/servicios/basicos',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => {
          if (!Array.isArray(data)) {
            return [];
          }
          
          // Categorías esperadas para AGUA
          const categoriasEsperadas = [
            'Red pública dentro de la vivienda',
            'Red pública fuera de la vivienda',
            'Pozo',
            'Cisterna',
            'Pilón de uso público',
            'Río, acequia, manantial',
            'Otro tipo',
            'Sin acceso a red pública'
          ];
          
          // Filtrar solo registros de AGUA
          const agua = data.filter((item: any) => 
            (item.categoria || '').toLowerCase() === 'agua'
          );
          
          // Deduplicar tipos similares
          const normalizarTipo = (tipo: string) => {
            return (tipo || '')
              .toLowerCase()
              .trim()
              .replace(/\s+/g, ' ')
              .replace(/,\s*/g, ', ');
          };
          
          const tiposMap = new Map<string, any>();
          agua.forEach((item: any) => {
            const tipoNorm = normalizarTipo(item.tipo);
            if (tiposMap.has(tipoNorm)) {
              tiposMap.get(tipoNorm).casos += item.casos || 0;
            } else {
              tiposMap.set(tipoNorm, {
                tipoOriginal: item.tipo,
                casos: item.casos || 0
              });
            }
          });
          
          // Completar con categorías faltantes
          const resultado: any[] = [];
          categoriasEsperadas.forEach(cat => {
            const catNorm = normalizarTipo(cat);
            if (tiposMap.has(catNorm)) {
              resultado.push({
                categoria: tiposMap.get(catNorm).tipoOriginal,
                casos: tiposMap.get(catNorm).casos
              });
            } else {
              resultado.push({
                categoria: cat,
                casos: 0
              });
            }
          });
          
          // Calcular porcentajes
          const total = resultado.reduce((sum, item) => sum + (item.casos || 0), 0);
          const final = resultado.map((item: any) => ({
            categoria: item.categoria,
            casos: item.casos,
            porcentaje: total > 0 ? ((item.casos / total) * 100).toFixed(2) + ' %' : '0,00 %'
          }));
          
          return final;
        }
      },
      tiposSaneamientoTabla: {
        fieldName: 'tiposSaneamientoTabla',
        endpoint: '/servicios/basicos',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => {
          if (!Array.isArray(data)) {
            return [];
          }
          
          const categoriasEsperadas = [
            'Red pública de desagüe',
            'Con alcantarillado',
            'Pozo séptico',
            'Pozo negro',
            'Río, acequia o similar',
            'Sin alcantarillado',
            'No tiene desagüe'
          ];
          
          const desague = data.filter((item: any) => 
            (item.categoria || '').toLowerCase() === 'desagüe'
          );
          
          // Deduplicar tipos similares
          const normalizarTipo = (tipo: string) => {
            return (tipo || '')
              .toLowerCase()
              .trim()
              .replace(/\s+/g, ' ')
              .replace(/,\s*/g, ', ');
          };
          
          const tiposMap = new Map<string, any>();
          desague.forEach((item: any) => {
            const tipoNorm = normalizarTipo(item.tipo);
            if (tiposMap.has(tipoNorm)) {
              tiposMap.get(tipoNorm).casos += item.casos || 0;
            } else {
              tiposMap.set(tipoNorm, {
                tipoOriginal: item.tipo,
                casos: item.casos || 0
              });
            }
          });
          
          // Completar con categorías faltantes
          const resultado: any[] = [];
          categoriasEsperadas.forEach(cat => {
            const catNorm = normalizarTipo(cat);
            if (tiposMap.has(catNorm)) {
              resultado.push({
                categoria: tiposMap.get(catNorm).tipoOriginal,
                casos: tiposMap.get(catNorm).casos
              });
            } else {
              resultado.push({
                categoria: cat,
                casos: 0
              });
            }
          });
          
          // Calcular porcentajes
          const total = resultado.reduce((sum, item) => sum + (item.casos || 0), 0);
          const final = resultado.map((item: any) => ({
            categoria: item.categoria,
            casos: item.casos,
            porcentaje: total > 0 ? ((item.casos / total) * 100).toFixed(2) + ' %' : '0,00 %'
          }));
          
          return final;
        }
      },
      alumbradoElectricoTabla: {
        fieldName: 'alumbradoElectricoTabla',
        endpoint: '/servicios/basicos',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => {
          if (!Array.isArray(data)) {
            return [];
          }
          
          // Categorías esperadas para ALUMBRADO
          const categoriasEsperadas = [
            'Con alumbrado eléctrico',
            'Sin alumbrado eléctrico',
            'Gas',
            'Vela',
            'Kerosene/Petróleo',
            'Otro tipo'
          ];
          
          // Filtrar solo registros de ALUMBRADO
          const alumbrado = data.filter((item: any) => 
            (item.categoria || '').toLowerCase() === 'alumbrado'
          );
          
          // Deduplicar tipos similares
          const normalizarTipo = (tipo: string) => {
            return (tipo || '')
              .toLowerCase()
              .trim()
              .replace(/\s+/g, ' ')
              .replace(/,\s*/g, ', ');
          };
          
          const tiposMap = new Map<string, any>();
          alumbrado.forEach((item: any) => {
            const tipoNorm = normalizarTipo(item.tipo);
            if (tiposMap.has(tipoNorm)) {
              tiposMap.get(tipoNorm).casos += item.casos || 0;
            } else {
              tiposMap.set(tipoNorm, {
                tipoOriginal: item.tipo,
                casos: item.casos || 0
              });
            }
          });
          
          // Completar con categorías faltantes
          const resultado: any[] = [];
          categoriasEsperadas.forEach(cat => {
            const catNorm = normalizarTipo(cat);
            if (tiposMap.has(catNorm)) {
              resultado.push({
                categoria: tiposMap.get(catNorm).tipoOriginal,
                casos: tiposMap.get(catNorm).casos
              });
            } else {
              resultado.push({
                categoria: cat,
                casos: 0
              });
            }
          });
          
          // Calcular porcentajes
          const total = resultado.reduce((sum, item) => sum + (item.casos || 0), 0);
          const final = resultado.map((item: any) => ({
            categoria: item.categoria,
            casos: item.casos,
            porcentaje: total > 0 ? ((item.casos / total) * 100).toFixed(2) + ' %' : '0,00 %'
          }));
          
          return final;
        }
      }
    });

    this.mappingConfigs.set('seccion15_aisd', {
      lenguasAISD: {
        fieldName: 'lenguasAISD',
        endpoint: '/vistas/lenguas-ubicacion',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => this.transformLenguas(data)
      }
    });

    this.mappingConfigs.set('seccion16_aisd', {
      religionesAISD: {
        fieldName: 'religionesAISD',
        endpoint: '/vistas/religiones-ubicacion',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => this.transformReligiones(data)
      }
    });

    this.mappingConfigs.set('seccion19_aisd', {
      nbiAISD: {
        fieldName: 'nbiAISD',
        endpoint: '/vistas/nbi-ubicacion',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => this.transformNBI(data)
      }
    });

    this.mappingConfigs.set('seccion13_aisd', {
      afiliacionSaludTabla: {
        fieldName: 'afiliacionSaludTabla',
        endpoint: '/salud/seguro-salud',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => {
          if (!Array.isArray(data)) {
            return [];
          }

          // Mapear tipos de seguro - mantener incluso si no hay datos de cantidad
          const tiposUnificados = new Map<string, any>();
          let totalCasos = 0;
          
          data.forEach((item: any) => {
            const tipo = (item.tipo_seguro || 'Sin categoría').trim();
            const key = tipo.toLowerCase();
            
            // IMPORTANTE: El backend retorna 'cantidad' no 'casos'
            const cantidad = item.cantidad || item.casos || 0;
            totalCasos += cantidad;
            
            if (tiposUnificados.has(key)) {
              const existing = tiposUnificados.get(key);
              existing.casos = (existing.casos || 0) + cantidad;
            } else {
              tiposUnificados.set(key, {
                categoria: tipo,
                casos: cantidad,
                porcentaje: 0  // Se recalculará después
              });
            }
          });

          // RECALCULAR porcentajes basándose en el total agregado
          const resultado = Array.from(tiposUnificados.values());
          resultado.forEach((item: any) => {
            item.porcentaje = totalCasos > 0 
              ? Math.round((item.casos / totalCasos) * 10000) / 100  // 2 decimales
              : 0;
          });
          
          resultado.sort((a, b) => (b.casos || 0) - (a.casos || 0));

          return resultado;
        }
      }
    });

    this.mappingConfigs.set('seccion14_aisd', {
      nivelEducativoTabla: {
        fieldName: 'nivelEducativoTabla',
        endpoint: '/educacion/niveles',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => {
          if (!Array.isArray(data)) {
            return [];
          }

          const nivelesMap = new Map<string, any>();
          let totalCasos = 0;
          
          data.forEach((item: any) => {
            const nivel = (item.nivel_educativo || 'Sin categoría').trim();
            const key = nivel.toLowerCase();
            
            const cantidad = item.casos || item.cantidad || 0;
            totalCasos += cantidad;
            
            if (nivelesMap.has(key)) {
              const existing = nivelesMap.get(key);
              existing.casos = (existing.casos || 0) + cantidad;
            } else {
              nivelesMap.set(key, {
                categoria: nivel,
                casos: cantidad,
                porcentaje: 0
              });
            }
          });

          // Recalcular porcentajes
          const resultado = Array.from(nivelesMap.values());
          resultado.forEach((item: any) => {
            item.porcentaje = totalCasos > 0 
              ? Math.round((item.casos / totalCasos) * 10000) / 100
              : 0;
          });
          
          resultado.sort((a, b) => (b.casos || 0) - (a.casos || 0));

          return resultado;
        }
      },
      tasaAnalfabetismoTabla: {
        fieldName: 'tasaAnalfabetismoTabla',
        endpoint: '/educacion/tasa-analfabetismo',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => {
          if (!Array.isArray(data)) {
            return [];
          }

          const indicadoresMap = new Map<string, any>();
          let totalCasos = 0;
          
          data.forEach((item: any) => {
            const indicador = (item.indicador || 'Sin categoría').trim();
            const key = indicador.toLowerCase();
            
            const cantidad = item.casos || 0;
            totalCasos += cantidad;
            
            if (indicadoresMap.has(key)) {
              const existing = indicadoresMap.get(key);
              existing.casos = (existing.casos || 0) + cantidad;
            } else {
              indicadoresMap.set(key, {
                indicador: indicador,
                casos: cantidad,
                porcentaje: 0
              });
            }
          });

          // Recalcular porcentajes
          const resultado = Array.from(indicadoresMap.values());
          resultado.forEach((item: any) => {
            item.porcentaje = totalCasos > 0 
              ? Math.round((item.casos / totalCasos) * 10000) / 100
              : 0;
          });
          
          resultado.sort((a, b) => (b.casos || 0) - (a.casos || 0));

          return resultado;
        }
      }
    });

    this.mappingConfigs.set('seccion21_aisi', {
      informacionReferencialAISI: {
        fieldName: 'informacionReferencialAISI',
        endpoint: '/aisi/informacion-referencial',
        paramType: 'ubigeo',
        aggregatable: false,
        transform: (data) => data
      }
    });

    this.mappingConfigs.set('seccion22_aisi', {
      centrosPobladosAISI: {
        fieldName: 'centrosPobladosAISI',
        endpoint: '/aisi/centros-poblados',
        paramType: 'ubigeo',
        aggregatable: false,
        transform: (data) => this.transformCentrosPoblados(data)
      }
    });

    this.mappingConfigs.set('seccion15_aisd', {
      lenguasMaternasTabla: {
        fieldName: 'lenguasMaternasTabla',
        endpoint: '/lenguas/maternas',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => {
          if (!Array.isArray(data)) {
            return [];
          }

          const lenguasMap = new Map<string, any>();
          let totalCasos = 0;
          
          data.forEach((item: any) => {
            const lengua = (item.lengua_materna || 'Sin categoría').trim();
            const key = lengua.toLowerCase();
            
            const cantidad = item.casos || 0;
            totalCasos += cantidad;
            
            if (lenguasMap.has(key)) {
              const existing = lenguasMap.get(key);
              existing.casos = (existing.casos || 0) + cantidad;
            } else {
              lenguasMap.set(key, {
                categoria: lengua,
                casos: cantidad,
                porcentaje: 0
              });
            }
          });

          const resultado = Array.from(lenguasMap.values());
          resultado.forEach((item: any) => {
            item.porcentaje = totalCasos > 0 
              ? Math.round((item.casos / totalCasos) * 10000) / 100
              : 0;
          });
          
          resultado.sort((a, b) => (b.casos || 0) - (a.casos || 0));

          return resultado;
        }
      },
      religionesTabla: {
        fieldName: 'religionesTabla',
        endpoint: '/religiones',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => {
          if (!Array.isArray(data)) {
            return [];
          }

          const religionesMap = new Map<string, any>();
          let totalCasos = 0;
          
          data.forEach((item: any) => {
            const religion = (item.religion || 'Sin categoría').trim();
            const key = religion.toLowerCase();
            
            const cantidad = item.casos || 0;
            totalCasos += cantidad;
            
            if (religionesMap.has(key)) {
              const existing = religionesMap.get(key);
              existing.casos = (existing.casos || 0) + cantidad;
            } else {
              religionesMap.set(key, {
                categoria: religion,
                casos: cantidad,
                porcentaje: 0
              });
            }
          });

          const resultado = Array.from(religionesMap.values());
          resultado.forEach((item: any) => {
            item.porcentaje = totalCasos > 0 
              ? Math.round((item.casos / totalCasos) * 10000) / 100
              : 0;
          });
          
          resultado.sort((a, b) => (b.casos || 0) - (a.casos || 0));

          return resultado;
        }
      }
    });

    this.mappingConfigs.set('seccion18_aisd', {
      nbiCCAyrocaTabla: {
        fieldName: 'nbiCCAyrocaTabla',
        endpoint: '/nbi/por-ubigeo',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => {
          if (!Array.isArray(data)) {
            return [];
          }

          const nbiMap = new Map<string, any>();
          let totalCasos = 0;
          
          data.forEach((item: any) => {
            const carencia = (item.carencia || 'Sin categoría').trim();
            const key = carencia.toLowerCase();
            
            const cantidad = item.casos || 0;
            totalCasos += cantidad;
            
            if (nbiMap.has(key)) {
              const existing = nbiMap.get(key);
              existing.casos = (existing.casos || 0) + cantidad;
            } else {
              nbiMap.set(key, {
                categoria: carencia,
                casos: cantidad,
                porcentaje: 0
              });
            }
          });

          const resultado = Array.from(nbiMap.values());
          resultado.forEach((item: any) => {
            item.porcentaje = totalCasos > 0 
              ? Math.round((item.casos / totalCasos) * 10000) / 100
              : 0;
          });
          
          resultado.sort((a, b) => (b.casos || 0) - (a.casos || 0));

          return resultado;
        }
      },
      nbiDistritoCahuachoTabla: {
        fieldName: 'nbiDistritoCahuachoTabla',
        endpoint: '/nbi/por-ubigeo',
        paramType: 'id_ubigeo',
        aggregatable: true,
        transform: (data) => {
          if (!Array.isArray(data)) {
            return [];
          }

          const nbiMap = new Map<string, any>();
          let totalCasos = 0;
          
          data.forEach((item: any) => {
            const carencia = (item.carencia || 'Sin categoría').trim();
            const key = carencia.toLowerCase();
            
            const cantidad = item.casos || 0;
            totalCasos += cantidad;
            
            if (nbiMap.has(key)) {
              const existing = nbiMap.get(key);
              existing.casos = (existing.casos || 0) + cantidad;
            } else {
              nbiMap.set(key, {
                categoria: carencia,
                casos: cantidad,
                porcentaje: 0
              });
            }
          });

          const resultado = Array.from(nbiMap.values());
          resultado.forEach((item: any) => {
            item.porcentaje = totalCasos > 0 
              ? Math.round((item.casos / totalCasos) * 10000) / 100
              : 0;
          });
          
          resultado.sort((a, b) => (b.casos || 0) - (a.casos || 0));

          return resultado;
        }
      }
    });

    this.mappingConfigs.set('seccion23_aisi', {
      poblacionSexoAISI: {
        fieldName: 'poblacionSexoAISI',
        endpoint: '/demograficos/datos',
        paramType: 'ubigeo',
        aggregatable: true,
        transform: (data) => this.transformPoblacionSexo(data)
      }
    });

    this.mappingConfigs.set('seccion24_aisi', {
      poblacionEtarioAISI: {
        fieldName: 'poblacionEtarioAISI',
        endpoint: '/demograficos/datos',
        paramType: 'ubigeo',
        aggregatable: true,
        transform: (data) => this.transformPoblacionEtario(data)
      }
    });

    this.mappingConfigs.set('seccion25_aisi', {
      petAISI: {
        fieldName: 'petAISI',
        endpoint: '/aisd/pet',
        paramType: 'ubigeo',
        aggregatable: true,
        transform: (data) => this.transformPET(data)
      }
    });

    this.mappingConfigs.set('seccion26_aisi', {
      peaDistrital: {
        fieldName: 'peaDistrital',
        endpoint: '/aisi/pea-distrital',
        paramType: 'ubigeo',
        aggregatable: false,
        transform: (data) => data
      }
    });

    this.mappingConfigs.set('seccion27_aisi', {
      actividadesEconomicasAISI: {
        fieldName: 'actividadesEconomicasAISI',
        endpoint: '/economicos/principales',
        paramType: 'ubigeo',
        aggregatable: true,
        transform: (data) => this.transformActividades(data)
      }
    });

    this.mappingConfigs.set('seccion28_aisi', {
      viviendasCensoAISI: {
        fieldName: 'viviendasCensoAISI',
        endpoint: '/aisi/viviendas-censo',
        paramType: 'ubigeo',
        aggregatable: false,
        transform: (data) => data
      }
    });

    this.mappingConfigs.set('seccion29_aisi', {
      serviciosBasicosAISI: {
        fieldName: 'serviciosBasicosAISI',
        endpoint: '/servicios/basicos',
        paramType: 'ubigeo',
        aggregatable: true,
        transform: (data) => this.transformServicios(data)
      }
    });

    this.mappingConfigs.set('seccion30_aisi', {
      lenguasAISI: {
        fieldName: 'lenguasAISI',
        endpoint: '/vistas/lenguas-ubicacion',
        paramType: 'ubigeo',
        aggregatable: true,
        transform: (data) => this.transformLenguas(data)
      },
      religionesAISI: {
        fieldName: 'religionesAISI',
        endpoint: '/vistas/religiones-ubicacion',
        paramType: 'ubigeo',
        aggregatable: true,
        transform: (data) => this.transformReligiones(data)
      },
      nbiAISI: {
        fieldName: 'nbiAISI',
        endpoint: '/vistas/nbi-ubicacion',
        paramType: 'ubigeo',
        aggregatable: true,
        transform: (data) => this.transformNBI(data)
      }
    });
  }

  getConfig(sectionKey: string): SectionDataConfig | null {
    return this.mappingConfigs.get(sectionKey) || null;
  }

  getMapping(sectionKey: string, fieldName: string): DataMapping | null {
    const config = this.getConfig(sectionKey);
    return config?.[fieldName] || null;
  }

  private transformPoblacionSexo(data: any[]): any[] {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    const item = data[0];
    const resultado = [
      { sexo: 'Hombre', casos: item?.hombres || 0 },
      { sexo: 'Mujer', casos: item?.mujeres || 0 }
    ];
    return resultado;
  }

  private transformPoblacionEtario(data: any[]): any[] {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    const d = data[0];
    const resultado = [
      { categoria: 'Menores de 1', casos: d?.menores_1 || 0 },
      { categoria: '1-14 años', casos: d?.de_1_a_14 || 0 },
      { categoria: '15-29 años', casos: d?.de_15_a_29 || 0 },
      { categoria: '30-44 años', casos: d?.de_30_a_44 || 0 },
      { categoria: '45-64 años', casos: d?.de_45_a_64 || 0 },
      { categoria: '65+ años', casos: d?.mayores_65 || 0 }
    ].filter(item => item.casos > 0);
    return resultado;
  }

  private transformPET(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      categoria: item.categoría || item.categoria,
      casos: item.casos || 0
    }));
  }

  private transformPETTabla(data: any[]): any[] {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const d = data[0] || {};
    const de_15_a_29 = d?.de_15_a_29 || 0;
    const de_30_a_44 = d?.de_30_a_44 || 0;
    const de_45_a_64 = d?.de_45_a_64 || 0;
    const mayores_65 = d?.mayores_65 || 0;

    return [
      { categoria: '15 a 29 años', casos: de_15_a_29, porcentaje: null },
      { categoria: '30 a 44 años', casos: de_30_a_44, porcentaje: null },
      { categoria: '45 a 64 años', casos: de_45_a_64, porcentaje: null },
      { categoria: '65 años a más', casos: mayores_65, porcentaje: null }
    ].filter(item => (item.casos || 0) > 0);
  }

  private transformActividades(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      actividad: item.actividad || '',
      casos: item.casos || 0,
      porcentaje: item.porcentaje || null
    }));
  }

  private transformMateriales(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      categoria: item.categoria || '',
      tipo_material: item.tipo_material || '',
      casos: item.casos || 0
    }));
  }

  private transformServicios(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      servicio: item.servicio || '',
      tipo: item.tipo || '',
      casos: item.casos || 0,
      porcentaje: item.porcentaje || null
    }));
  }

  private transformLenguas(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      idioma: item.idioma || '',
      casos: item.casos || 0,
      porcentaje: item.porcentaje || null
    }));
  }

  private transformReligiones(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      religion: item.religion || '',
      casos: item.casos || 0,
      porcentaje: item.porcentaje || null
    }));
  }

  private transformNBI(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      necesidad: item.necesidad || '',
      casos: item.casos || 0,
      porcentaje: item.porcentaje || null
    }));
  }

  private transformCentrosPoblados(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      localidad: item.centro_poblado || item.localidad || '',
      coordenadas: item.coordenadas || '',
      altitud: item.altitud || '',
      distrito: item.distrito || '',
      provincia: item.provincia || '',
      departamento: item.departamento || '',
      // Campos opcionales del endpoint original
      centro_poblado: item.centro_poblado || '',
      categoria: item.categoria || '',
      poblacion: item.poblacion || 0,
      viviendas_empadronadas: item.viviendas_empadronadas || 0,
      viviendas_ocupadas: item.viviendas_ocupadas || 0
    }));
  }

  private transformPEAOcupaciones(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    // Backend devuelve {categoria: string, casos: number}
    // Necesitamos {categoria: string, casos: number, porcentaje: string}
    const items = data.map(item => ({
      categoria: item.categoria || '',
      casos: item.casos || 0,
      porcentaje: null // Se calcula en el componente
    }));
    return items;
  }
}
