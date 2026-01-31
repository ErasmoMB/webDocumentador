import { Injectable } from '@angular/core';
import { TableConfig } from '../table-management.service';

@Injectable({
  providedIn: 'root'
})
export class Seccion5TableConfigService {

  /**
   * Configuración para tabla de Instituciones (Cuadro N° 3.4)
   * Tabla de instituciones con SI/NO dinámico para disponibilidad
   */
  getTablaInstitucionesConfig(): TableConfig {
    return {
      tablaKey: 'tablepagina6', // ✅ Solo clave base - el prefijo se aplica en dynamic-table
      totalKey: 'institucion'
      // ✅ Sin campoTotal ni estructuraInicial: tabla comienza vacía
    };
  }

  /**
   * Definición de columnas para tabla de Instituciones
   * Incluye: Institución, Disponibilidad (SI/NO), Ubicación
   */
  getColumnasInstituciones(): any[] {
    return [
      {
        field: 'categoria',
        label: 'Institución',
        type: 'text',
        placeholder: 'Nombre de institución'
      },
      {
        field: 'respuesta',
        label: 'Disponibilidad',
        type: 'select',
        allowedValues: ['SI', 'NO'],
        placeholder: 'Seleccionar'
      },
      {
        field: 'comentario',
        label: 'Ubicación',
        type: 'text',
        placeholder: 'Ubicación específica'
      }
    ];
  }
}
