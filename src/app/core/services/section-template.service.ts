import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SectionTemplateService {
  private fullTemplateCache: string | null = null;
  
  constructor(private http: HttpClient) {}
  
  private async loadFullTemplate(): Promise<string> {
    if (this.fullTemplateCache) {
      return this.fullTemplateCache;
    }
    
    try {
      const template = await firstValueFrom(
        this.http.get('/assets/templates/plantilla-completa.html', { responseType: 'text' })
      );
      this.fullTemplateCache = template;
      return template;
    } catch (error) {
      console.warn('No se pudo cargar plantilla completa desde assets, usando fallback');
      return '';
    }
  }
  
  private extractSectionFromFullTemplate(fullTemplate: string, sectionId: string): string {
    const startMarker = `<!-- SECTION:${sectionId}:START -->`;
    const endMarker = `<!-- SECTION:${sectionId}:END -->`;
    
    const startIndex = fullTemplate.indexOf(startMarker);
    const endIndex = fullTemplate.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
      console.warn(`No se encontraron marcadores para la sección ${sectionId}`);
      return '';
    }
    
    const sectionContent = fullTemplate.substring(
      startIndex + startMarker.length,
      endIndex
    ).trim();
    
    console.log(`Sección ${sectionId} extraída correctamente. Longitud: ${sectionContent.length} caracteres`);
    
    return sectionContent;
  }

  private extractUnifiedSection(fullTemplate: string, startSectionId: string, endSectionId: string): string {
    const startMarker = `<!-- SECTION:${startSectionId}:START -->`;
    let endIndex = fullTemplate.indexOf(`<!-- SECTION:${endSectionId}:END -->`);
    
    if (endIndex === -1) {
      endIndex = fullTemplate.length;
    }
    
    const startIndex = fullTemplate.indexOf(startMarker);
    
    if (startIndex === -1) {
      console.warn(`No se encontró el marcador de inicio para la sección ${startSectionId}`);
      return '';
    }
    
    let sectionContent = fullTemplate.substring(
      startIndex + startMarker.length,
      endIndex
    ).trim();
    
    if ((startSectionId === '3.1.4' || startSectionId === '3.1.4.A') && endSectionId === '3.1.4.A.1') {
      const a11Index = sectionContent.indexOf('<h5>A.1.1. Institucionalidad local</h5>');
      if (a11Index !== -1) {
        sectionContent = sectionContent.substring(0, a11Index).trim();
      }
    }
    
    console.log(`Sección unificada ${startSectionId} - ${endSectionId} extraída correctamente. Longitud: ${sectionContent.length} caracteres`);
    
    return sectionContent;
  }

  async getSectionTemplate(sectionId: string): Promise<string> {
    const fullTemplate = await this.loadFullTemplate();
    
    if (fullTemplate) {
      if (sectionId === '3.1.2.A' || sectionId === '3.1.2.B') {
        const extracted = this.extractSectionFromFullTemplate(fullTemplate, '3.1.2');
        if (extracted) {
          return extracted;
        }
      } else if (sectionId === '3.1.4' || sectionId === '3.1.4.A' || sectionId === '3.1.4.A.1') {
        const extracted = this.extractUnifiedSection(fullTemplate, '3.1.4', '3.1.4.A.1');
        if (extracted) {
          return extracted;
        }
      } else {
        const extracted = this.extractSectionFromFullTemplate(fullTemplate, sectionId);
        if (extracted) {
          return extracted;
        }
      }
    }
    
    return this.getLegacySectionTemplate(sectionId);
  }
  
  getSectionTemplateSync(sectionId: string): string {
    if (this.fullTemplateCache) {
      if (sectionId === '3.1.2.A' || sectionId === '3.1.2.B') {
        const extracted = this.extractSectionFromFullTemplate(this.fullTemplateCache, '3.1.2');
        if (extracted) {
          return extracted;
        }
      } else if (sectionId === '3.1.4' || sectionId === '3.1.4.A' || sectionId === '3.1.4.A.1') {
        const extracted = this.extractUnifiedSection(this.fullTemplateCache, '3.1.4', '3.1.4.A.1');
        if (extracted) {
          return extracted;
        }
      } else {
        const extracted = this.extractSectionFromFullTemplate(this.fullTemplateCache, sectionId);
        if (extracted) {
          return extracted;
        }
      }
    }
    
    return this.getLegacySectionTemplate(sectionId);
  }

  private getLegacySectionTemplate(sectionId: string): string {
    const templates: { [key: string]: string } = {
    };
    
    return templates[sectionId] || '';
  }

  getSectionFields(sectionId: string): any[] {
    const fields: { [key: string]: any[] } = {
      '3.1.1': [
        {
          id: 'projectName',
          label: 'Nombre del Proyecto',
          type: 'text',
          placeholder: 'Ej: Paka',
          required: true,
          fromBackend: false
        },
        {
          id: 'distritoSeleccionado',
          label: 'Distrito',
          type: 'autocomplete',
          placeholder: 'Escriba el nombre del distrito...',
          required: true,
          fromBackend: true,
          backendEndpoint: 'distrito',
          autocomplete: true
        },
        {
          id: 'provinciaSeleccionada',
          label: 'Provincia',
          type: 'select',
          placeholder: 'Se auto-completará al seleccionar distrito',
          required: true,
          fromBackend: true,
          backendEndpoint: 'provincia',
          options: [],
          dependsOn: 'distritoSeleccionado',
          autoComplete: true
        },
        {
          id: 'departamentoSeleccionado',
          label: 'Departamento',
          type: 'select',
          placeholder: 'Se auto-completará al seleccionar distrito',
          required: true,
          fromBackend: true,
          backendEndpoint: 'departamento',
          options: [],
          dependsOn: 'distritoSeleccionado',
          autoComplete: true
        }
      ],
      '3.1.2': [
        {
          id: 'distritoSeleccionado',
          label: 'Distrito Principal',
          type: 'autocomplete',
          placeholder: 'Escriba el nombre del distrito...',
          required: true,
          fromBackend: true,
          backendEndpoint: 'distrito',
          autocomplete: true
        },
        {
          id: 'departamentoSeleccionado',
          label: 'Departamento',
          type: 'select',
          placeholder: 'Se auto-completará al seleccionar distrito',
          required: true,
          fromBackend: true,
          backendEndpoint: 'departamento',
          options: [],
          dependsOn: 'distritoSeleccionado',
          autoComplete: true
        },
        {
          id: 'grupoAISD',
          label: 'Nombre de la Comunidad Campesina (CC)',
          type: 'autocomplete',
          placeholder: 'Escriba el nombre de la comunidad...',
          required: true,
          fromBackend: true,
          backendEndpoint: 'centro_poblado',
          autocomplete: true,
          dependsOn: 'distritoSeleccionado'
        },
        {
          id: 'aisdComponente1',
          label: 'Distrito Adicional 1',
          type: 'autocomplete',
          placeholder: 'Escriba el nombre del distrito...',
          required: false,
          fromBackend: true,
          backendEndpoint: 'distrito',
          autocomplete: true
        },
        {
          id: 'aisdComponente2',
          label: 'Distrito Adicional 2',
          type: 'autocomplete',
          placeholder: 'Escriba el nombre del distrito...',
          required: false,
          fromBackend: true,
          backendEndpoint: 'distrito',
          autocomplete: true
        },
        {
          id: 'grupoAISI',
          label: 'Centro Poblado (CP) AISI',
          type: 'text',
          placeholder: 'Ej: Cahuacho',
          required: false,
          fromBackend: false
        }
      ],
      '3.1.2.A': [
        {
          id: 'distritoSeleccionado',
          label: 'Distrito Principal',
          type: 'autocomplete',
          placeholder: 'Escriba el nombre del distrito...',
          required: true,
          fromBackend: true,
          backendEndpoint: 'distrito',
          autocomplete: true
        },
        {
          id: 'departamentoSeleccionado',
          label: 'Departamento',
          type: 'select',
          placeholder: 'Se auto-completará al seleccionar distrito',
          required: true,
          fromBackend: true,
          backendEndpoint: 'departamento',
          options: [],
          dependsOn: 'distritoSeleccionado',
          autoComplete: true
        },
        {
          id: 'grupoAISD',
          label: 'Nombre de la Comunidad Campesina (CC)',
          type: 'autocomplete',
          placeholder: 'Escriba el nombre de la comunidad...',
          required: true,
          fromBackend: true,
          backendEndpoint: 'centro_poblado',
          autocomplete: true,
          dependsOn: 'distritoSeleccionado'
        },
        {
          id: 'aisdComponente1',
          label: 'Distrito Adicional 1',
          type: 'autocomplete',
          placeholder: 'Escriba el nombre del distrito...',
          required: false,
          fromBackend: true,
          backendEndpoint: 'distrito',
          autocomplete: true
        },
        {
          id: 'aisdComponente2',
          label: 'Distrito Adicional 2',
          type: 'autocomplete',
          placeholder: 'Escriba el nombre del distrito...',
          required: false,
          fromBackend: true,
          backendEndpoint: 'distrito',
          autocomplete: true
        }
      ],
      '3.1.2.B': [
        {
          id: 'distritoSeleccionado',
          label: 'Distrito',
          type: 'autocomplete',
          placeholder: 'Escriba el nombre del distrito...',
          required: true,
          fromBackend: true,
          backendEndpoint: 'distrito',
          autocomplete: true
        },
        {
          id: 'grupoAISI',
          label: 'Centro Poblado (CP) AISI',
          type: 'text',
          placeholder: 'Ej: Cahuacho',
          required: false,
          fromBackend: false
        }
      ],
      '3.1.4.A.1.2': [
        {
          id: 'textoDemografiaAISD',
          label: 'Texto descriptivo - Población según sexo',
          type: 'textarea',
          placeholder: 'Ingrese el texto descriptivo...',
          required: false
        },
        {
          id: 'cargarDatosDemografiaAISD',
          label: 'Cargar datos demográficos desde backend',
          type: 'button',
          action: 'loadDemografiaAISD'
        }
      ],
      '3.1.4.B.1.1': [
        {
          id: 'textoDemografiaAISI',
          label: 'Texto descriptivo - Población según sexo',
          type: 'textarea',
          placeholder: 'Ingrese el texto descriptivo...',
          required: false
        },
        {
          id: 'cargarDatosDemografiaAISI',
          label: 'Cargar datos demográficos desde backend',
          type: 'button',
          action: 'loadDemografiaAISI'
        }
      ],
      '3.1.4.B.1.2': [
        {
          id: 'cargarDatosPEAAISI',
          label: 'Cargar datos PEA/No PEA desde backend',
          type: 'button',
          action: 'loadPEAAISI'
        }
      ],
      '3.1.4': [],
      '3.1.4.A': [],
      '3.1.4.A.1': [
        {
          id: 'cuadroNumeroAISD1',
          label: 'Número de Cuadro 1',
          type: 'text',
          placeholder: 'Ej: 3. 2',
          required: false,
          group: 'cuadro1'
        },
        {
          id: 'cuadroTituloAISD1',
          label: 'Título de Cuadro 1',
          type: 'text',
          placeholder: 'Ej: Ubicación referencial',
          required: false
        },
        {
          id: 'cuadroComunidadAISD1',
          label: 'Nombre de Comunidad en Título Cuadro 1',
          type: 'text',
          placeholder: 'Ej: Ayroca',
          required: false
        },
        {
          id: 'tablaAISD1Localidad',
          label: 'Tabla 1 - Localidad',
          type: 'text',
          placeholder: 'Ej: Ayroca',
          required: false
        },
        {
          id: 'tablaAISD1Coordenadas',
          label: 'Tabla 1 - Coordenadas',
          type: 'text',
          placeholder: 'Ej: 18L E: 660 619 m N: 8 291 173 m',
          required: false
        },
        {
          id: 'tablaAISD1Altitud',
          label: 'Tabla 1 - Altitud',
          type: 'text',
          placeholder: 'Ej: 3 599 msnm',
          required: false
        },
        {
          id: 'tablaAISD1Distrito',
          label: 'Tabla 1 - Distrito',
          type: 'text',
          placeholder: 'Ej: Cahuacho',
          required: false
        },
        {
          id: 'tablaAISD1Provincia',
          label: 'Tabla 1 - Provincia',
          type: 'text',
          placeholder: 'Ej: Caravelí',
          required: false
        },
        {
          id: 'tablaAISD1Departamento',
          label: 'Tabla 1 - Departamento',
          type: 'text',
          placeholder: 'Ej: Arequipa',
          required: false
        },
        {
          id: 'cuadroFuenteAISD1',
          label: 'Fuente de Cuadro 1',
          type: 'text',
          placeholder: 'Ej: GEADES (2024)',
          required: false
        },
        {
          id: 'cuadroNumeroAISD2',
          label: 'Número de Cuadro 2',
          type: 'text',
          placeholder: 'Ej: 3. 3',
          required: false
        },
        {
          id: 'cuadroTituloAISD2',
          label: 'Título de Cuadro 2',
          type: 'text',
          placeholder: 'Ej: Cantidad total de población y viviendas',
          required: false
        },
        {
          id: 'cuadroComunidadAISD2',
          label: 'Nombre de Comunidad en Título Cuadro 2',
          type: 'text',
          placeholder: 'Ej: Ayroca',
          required: false
        },
        {
          id: 'tablaAISD2Fila1Punto',
          label: 'Tabla 2 Fila 1 - Punto de Población',
          type: 'text',
          placeholder: 'Ej: Yuracranra',
          required: false
        },
        {
          id: 'tablaAISD2Fila1Codigo',
          label: 'Tabla 2 Fila 1 - Código',
          type: 'text',
          placeholder: 'Ej: 0403060004',
          required: false
        },
        {
          id: 'tablaAISD2Fila1Poblacion',
          label: 'Tabla 2 Fila 1 - Población',
          type: 'text',
          placeholder: 'Ej: 0',
          required: false
        },
        {
          id: 'tablaAISD2Fila1ViviendasEmpadronadas',
          label: 'Tabla 2 Fila 1 - Viviendas Empadronadas',
          type: 'text',
          placeholder: 'Ej: 1',
          required: false
        },
        {
          id: 'tablaAISD2Fila1ViviendasOcupadas',
          label: 'Tabla 2 Fila 1 - Viviendas Ocupadas',
          type: 'text',
          placeholder: 'Ej: 0',
          required: false
        },
        {
          id: 'tablaAISD2Fila2Punto',
          label: 'Tabla 2 Fila 2 - Punto de Población',
          type: 'text',
          placeholder: 'Ej: Ayroca',
          required: false
        },
        {
          id: 'tablaAISD2Fila2Codigo',
          label: 'Tabla 2 Fila 2 - Código',
          type: 'text',
          placeholder: 'Ej: 0403060005',
          required: false
        },
        {
          id: 'tablaAISD2Fila2Poblacion',
          label: 'Tabla 2 Fila 2 - Población',
          type: 'text',
          placeholder: 'Ej: 224',
          required: false
        },
        {
          id: 'tablaAISD2Fila2ViviendasEmpadronadas',
          label: 'Tabla 2 Fila 2 - Viviendas Empadronadas',
          type: 'text',
          placeholder: 'Ej: 84',
          required: false
        },
        {
          id: 'tablaAISD2Fila2ViviendasOcupadas',
          label: 'Tabla 2 Fila 2 - Viviendas Ocupadas',
          type: 'text',
          placeholder: 'Ej: 60',
          required: false
        },
        {
          id: 'tablaAISD2Fila3Punto',
          label: 'Tabla 2 Fila 3 - Punto de Población',
          type: 'text',
          placeholder: 'Ej: Tastanic',
          required: false
        },
        {
          id: 'tablaAISD2Fila3Codigo',
          label: 'Tabla 2 Fila 3 - Código',
          type: 'text',
          placeholder: 'Ej: 0403060008',
          required: false
        },
        {
          id: 'tablaAISD2Fila3Poblacion',
          label: 'Tabla 2 Fila 3 - Población',
          type: 'text',
          placeholder: 'Ej: 0',
          required: false
        },
        {
          id: 'tablaAISD2Fila3ViviendasEmpadronadas',
          label: 'Tabla 2 Fila 3 - Viviendas Empadronadas',
          type: 'text',
          placeholder: 'Ej: 1',
          required: false
        },
        {
          id: 'tablaAISD2Fila3ViviendasOcupadas',
          label: 'Tabla 2 Fila 3 - Viviendas Ocupadas',
          type: 'text',
          placeholder: 'Ej: 0',
          required: false
        },
        {
          id: 'tablaAISD2Fila4Punto',
          label: 'Tabla 2 Fila 4 - Punto de Población',
          type: 'text',
          placeholder: 'Ej: Faldahuasi',
          required: false
        },
        {
          id: 'tablaAISD2Fila4Codigo',
          label: 'Tabla 2 Fila 4 - Código',
          type: 'text',
          placeholder: 'Ej: 0403060014',
          required: false
        },
        {
          id: 'tablaAISD2Fila4Poblacion',
          label: 'Tabla 2 Fila 4 - Población',
          type: 'text',
          placeholder: 'Ej: 1',
          required: false
        },
        {
          id: 'tablaAISD2Fila4ViviendasEmpadronadas',
          label: 'Tabla 2 Fila 4 - Viviendas Empadronadas',
          type: 'text',
          placeholder: 'Ej: 4',
          required: false
        },
        {
          id: 'tablaAISD2Fila4ViviendasOcupadas',
          label: 'Tabla 2 Fila 4 - Viviendas Ocupadas',
          type: 'text',
          placeholder: 'Ej: 1',
          required: false
        },
        {
          id: 'tablaAISD2TotalPoblacion',
          label: 'Tabla 2 - Total Población',
          type: 'text',
          placeholder: 'Ej: 225',
          required: false
        },
        {
          id: 'tablaAISD2TotalViviendasEmpadronadas',
          label: 'Tabla 2 - Total Viviendas Empadronadas',
          type: 'text',
          placeholder: 'Ej: 90',
          required: false
        },
        {
          id: 'tablaAISD2TotalViviendasOcupadas',
          label: 'Tabla 2 - Total Viviendas Ocupadas',
          type: 'text',
          placeholder: 'Ej: 61',
          required: false
        },
        {
          id: 'cuadroFuenteAISD2',
          label: 'Fuente de Cuadro 2',
          type: 'text',
          placeholder: 'Ej: Reporte de Indicadores... REDINFORMA (MIDIS)',
          required: false
        },
        {
          id: 'fotografiaAISDNumero',
          label: 'Número de Fotografía',
          type: 'text',
          placeholder: 'Ej: 3. 1',
          required: false
        },
        {
          id: 'fotografiaAISDTitulo',
          label: 'Título de Fotografía',
          type: 'text',
          placeholder: 'Ej: Vista panorámica del Anexo Ayroca',
          required: false
        },
        {
          id: 'fotografiaAISDFuente',
          label: 'Fuente de Fotografía',
          type: 'text',
          placeholder: 'Ej: GEADES, 2024',
          required: false
        }
      ],
      '3.1.4.B': [
        {
          id: 'textoAISIIntro',
          label: 'Texto introductorio AISI',
          type: 'textarea',
          placeholder: 'Ingrese el texto introductorio del AISI...',
          required: false
        }
      ],
      '3.1.4.B.1': []
    };
    
    return fields[sectionId] || [];
  }
}

