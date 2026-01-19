import { Injectable } from '@angular/core';
import { ProvinciaInfo, ProvinciasDinamicas, JSONComunidad } from '../models/provincia-dynamic.model';

@Injectable({
  providedIn: 'root'
})
export class ProvinciaDinamicaService {

  constructor() { }

  /**
   * Analiza el JSON y extrae provincias con sus distritos y comunidades
   */
  analizarProvinciasDinamicas(jsonCompleto: JSONComunidad): ProvinciasDinamicas {
    const provincias: ProvinciasDinamicas = {};

    Object.keys(jsonCompleto).forEach(comunidadKey => {
      const items = jsonCompleto[comunidadKey];
      if (Array.isArray(items) && items.length > 0) {
        items.forEach(item => {
          const prov = item.PROV || item.prov;
          const dist = item.DIST || item.dist;
          const dpto = item.DPTO || item.dpto;

          if (prov) {
            if (!provincias[prov]) {
              provincias[prov] = {
                nombre: prov,
                comunidades: [],
                distritos: [],
                departamentos: [],
                distritosAdicionales: {
                  adicional1: '',
                  adicional2: ''
                }
              };
            }

            // Agregar comunidad
            const nombreComunidad = comunidadKey.replace('CCPP ', '');
            if (!provincias[prov].comunidades.includes(nombreComunidad)) {
              provincias[prov].comunidades.push(nombreComunidad);
            }

            // Agregar distrito
            if (dist && !provincias[prov].distritos.includes(dist)) {
              provincias[prov].distritos.push(dist);
            }

            // Agregar departamento
            if (dpto && !provincias[prov].departamentos.includes(dpto)) {
              provincias[prov].departamentos.push(dpto);
            }
          }
        });
      }
    });

    // Ordenar distritos
    Object.keys(provincias).forEach(prov => {
      provincias[prov].distritos = provincias[prov].distritos.sort();
    });

    return provincias;
  }

  /**
   * Obtiene todos los nombres de provincias de forma ordenada
   */
  obtenerProvinciasOrdenadas(provincias: ProvinciasDinamicas): string[] {
    return Object.keys(provincias).sort();
  }

  /**
   * Obtiene todos los distritos de una provincia específica
   */
  obtenerDistritosPorProvincia(provincias: ProvinciasDinamicas, nombreProvincia: string): string[] {
    return provincias[nombreProvincia]?.distritos || [];
  }

  /**
   * Genera el texto de comunidades para el párrafo
   */
  generarTextoComunidades(provincias: ProvinciasDinamicas): string {
    const todasLasComunidades: string[] = [];
    Object.values(provincias).forEach(prov => {
      todasLasComunidades.push(...prov.comunidades);
    });
    return this.formatearLista(todasLasComunidades);
  }

  /**
   * Genera el texto de distritos para el párrafo
   */
  generarTextoDistritos(provincias: ProvinciasDinamicas): string {
    const todosLosDistritos: string[] = [];
    Object.values(provincias).forEach(prov => {
      todosLosDistritos.push(...prov.distritos);
    });
    return this.formatearLista(todosLosDistritos);
  }

  /**
   * Genera el texto de departamentos para el párrafo
   */
  generarTextoDepartamentos(provincias: ProvinciasDinamicas): string {
    const todosDepartamentos: string[] = [];
    Object.values(provincias).forEach(prov => {
      todosDepartamentos.push(...prov.departamentos);
    });
    return this.formatearLista([...new Set(todosDepartamentos)]);
  }

  /**
   * Formatea una lista de strings en texto legible (ej: "A, B y C")
   */
  private formatearLista(items: string[]): string {
    const unicos = [...new Set(items)].sort();
    
    if (unicos.length === 0) return '';
    if (unicos.length === 1) return unicos[0];
    if (unicos.length === 2) return `${unicos[0]} y ${unicos[1]}`;
    
    return unicos.slice(0, -1).join(', ') + ' y ' + unicos[unicos.length - 1];
  }

  /**
   * Genera el párrafo AISD completo dinámicamente
   */
  generarPárrafoAISD(provincias: ProvinciasDinamicas): string {
    const comunidades = this.generarTextoComunidades(provincias);
    const distritos = this.generarTextoDistritos(provincias);
    const departamentos = this.generarTextoDepartamentos(provincias);

    const tieneUnaProvin = Object.keys(provincias).length === 1;
    const tieneUnaDist = this.obtenerTodosLosDistritos(provincias).length === 1;

    return `El Área de influencia social directa (AISD) se delimita en torno a las comunidades campesinas (CC) ${comunidades}, cuyas áreas comunales se encuentran ubicadas en los distritos de ${distritos}, pertenecientes a los departamentos de ${departamentos}. La delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales. Estas comunidades poseen y gestionan las tierras donde se llevará a cabo la exploración minera, lo que implica una relación directa y significativa con el Proyecto.`;
  }

  /**
   * Obtiene todos los distritos de todas las provincias
   */
  private obtenerTodosLosDistritos(provincias: ProvinciasDinamicas): string[] {
    const todos: string[] = [];
    Object.values(provincias).forEach(prov => {
      todos.push(...prov.distritos);
    });
    return [...new Set(todos)];
  }

  /**
   * Valida que se hayan ingresado los distritos adicionales para todas las provincias
   */
  validarDistritosAdicionales(provincias: ProvinciasDinamicas): boolean {
    return Object.values(provincias).every(prov => 
      prov.distritosAdicionales.adicional1 && 
      prov.distritosAdicionales.adicional2
    );
  }

  /**
   * Obtiene un resumen de provincias y distritos
   */
  obtenerResumen(provincias: ProvinciasDinamicas): string {
    const lineas: string[] = [];
    Object.entries(provincias).forEach(([prov, info]) => {
      const distritosTexto = info.distritos.join(', ');
      lineas.push(`${prov}: ${distritosTexto}`);
    });
    return lineas.join('\n');
  }
}
