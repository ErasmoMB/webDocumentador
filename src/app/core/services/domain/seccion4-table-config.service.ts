import { Injectable } from '@angular/core';
import { TableConfig } from '../table-management.service';

@Injectable({
  providedIn: 'root'
})
export class Seccion4TableConfigService {

  getTablaAISD1Config(): TableConfig {
    return {
      tablaKey: 'tablaAISD1Datos',
      totalKey: 'localidad',
      campoTotal: 'localidad',
      estructuraInicial: [{ localidad: '', coordenadas: '', altitud: '', distrito: '', provincia: '', departamento: '' }]
    };
  }

  getTablaAISD2Config(): TableConfig {
    return {
      tablaKey: 'tablaAISD2Datos',
      totalKey: 'punto',
      campoTotal: 'punto',
      estructuraInicial: [{ punto: '', codigo: '', poblacion: '', viviendasEmpadronadas: '', viviendasOcupadas: '' }]
    };
  }

  getColumnasAISD1(): any[] {
    return [
      { field: 'localidad', label: 'Localidad', type: 'text', placeholder: 'Nombre de localidad' },
      { field: 'coordenadas', label: 'Coordenadas', type: 'text', placeholder: 'Lat, Long' },
      { field: 'altitud', label: 'Altitud (m)', type: 'text', placeholder: 'Altitud' },
      { field: 'distrito', label: 'Distrito', type: 'text', placeholder: 'Distrito' },
      { field: 'provincia', label: 'Provincia', type: 'text', placeholder: 'Provincia' },
      { field: 'departamento', label: 'Departamento', type: 'text', placeholder: 'Departamento' }
    ];
  }

  getColumnasAISD2(): any[] {
    return [
      { field: 'punto', label: 'Punto', type: 'text', placeholder: 'Punto' },
      { field: 'codigo', label: 'Código', type: 'text', placeholder: 'Código' },
      { field: 'poblacion', label: 'Población', type: 'text', placeholder: '0' },
      { field: 'viviendasEmpadronadas', label: 'Viviendas Empadronadas', type: 'text', placeholder: '0' },
      { field: 'viviendasOcupadas', label: 'Viviendas Ocupadas', type: 'text', placeholder: '0' }
    ];
  }
}
