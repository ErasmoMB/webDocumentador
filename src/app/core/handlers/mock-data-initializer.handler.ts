import { Injectable, Injector } from '@angular/core';
import { MockDataService } from '../services/infrastructure/mock-data.service';
import { ProjectStateFacade } from '../state/project-state.facade';
import { StorageFacade } from '../services/infrastructure/storage-facade.service';
import { FormularioService } from '../services/formulario/formulario.service';

/**
 * Handler para inicializar datos del mock al inicio de la aplicación
 * 
 * ✅ IMPORTANTE: Este handler NO debe sobrescribir datos ya persistidos
 * Solo carga mock data cuando NO hay datos guardados previamente
 */
@Injectable({
  providedIn: 'root'
})
export class MockDataInitializerHandler {
  constructor(private injector: Injector) {}

  async initializeMockData(): Promise<void> {
    try {
      // Verificar si el usuario ha limpiado manualmente los datos
      const storage = this.injector.get(StorageFacade);
      const datosLimpios = storage.getItem('__datos_limpios_manualmente__');
      if (datosLimpios === 'true') {
        return; // No cargar datos automáticamente
      }

      // ✅ CRÍTICO: Verificar si ya hay datos persistidos en localStorage
      // Si ya hay datos guardados, NO cargar mock data para no sobrescribir
      const formularioService = this.injector.get(FormularioService, null);
      if (formularioService) {
        const datosExistentes = formularioService.obtenerDatos();
        if (datosExistentes && Object.keys(datosExistentes).length > 0) {
          // Ya hay datos guardados, no cargar mock
          return;
        }
      }

      // ✅ También verificar PROJECT_STATE en localStorage
      const projectStateRaw = storage.getItem('PROJECT_STATE');
      if (projectStateRaw) {
        // Ya hay estado guardado, no cargar mock
        return;
      }

      // Solo si NO hay datos persistidos, cargar mock data
      const mockDataService = this.injector.get(MockDataService);
      const projectFacade = this.injector.get(ProjectStateFacade);

      const mockData = await mockDataService.getCapitulo3Datos();

      if (mockData?.datos && Object.keys(mockData.datos).length > 0) {
        // Usar ProjectStateFacade para establecer datos iniciales
        Object.entries(mockData.datos).forEach(([key, value]) => {
          projectFacade.setField('global', null, key, value);
        });
      }
    } catch (error) {
      console.error('❌ [MockDataInitializer] Error:', error);
    }
  }
}
