import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/core/services/utilities/config.service';

@Injectable({
  providedIn: 'root',
})
export class WordGeneratorService {
  constructor(private configService: ConfigService) {}

  private docxDepsPromise?: Promise<{
    Packer: typeof import('docx').Packer;
    saveAs: typeof import('file-saver').saveAs;
    DocxDocumentFactory: typeof import('src/app/core/services/word-generator/docx-document-factory').DocxDocumentFactory;
    DocxHtmlContentBuilder: typeof import('src/app/core/services/word-generator/docx-html-content-builder').DocxHtmlContentBuilder;
    DocxImageBuilder: typeof import('src/app/core/services/word-generator/docx-image-builder').DocxImageBuilder;
    DocxTableBuilder: typeof import('src/app/core/services/word-generator/docx-table-builder').DocxTableBuilder;
  }>;

  private loadDocxDeps() {
    if (!this.docxDepsPromise) {
      this.docxDepsPromise = (async () => {
        const [{ Packer }, fileSaver, docFactory, htmlBuilder, imageBuilder, tableBuilder] = await Promise.all([
          import('docx'),
          import('file-saver'),
          import('src/app/core/services/word-generator/docx-document-factory'),
          import('src/app/core/services/word-generator/docx-html-content-builder'),
          import('src/app/core/services/word-generator/docx-image-builder'),
          import('src/app/core/services/word-generator/docx-table-builder'),
        ]);

        // Detectar saveAs en las distintas formas que file-saver puede exportarlo
        let saveAsFn: any = undefined;
        if (fileSaver) {
          saveAsFn = fileSaver.saveAs ?? fileSaver.default?.saveAs ?? fileSaver.default ?? fileSaver;
        }

        if (typeof saveAsFn !== 'function') {
          console.warn('[WARN] file-saver import did not expose a saveAs function. Imported value:', fileSaver);
        }

        return {
          Packer,
          saveAs: saveAsFn,
          DocxDocumentFactory: docFactory.DocxDocumentFactory,
          DocxHtmlContentBuilder: htmlBuilder.DocxHtmlContentBuilder,
          DocxImageBuilder: imageBuilder.DocxImageBuilder,
          DocxTableBuilder: tableBuilder.DocxTableBuilder,
        };
      })();
    }

    return this.docxDepsPromise;
  }

  private asegurarString(valor: any): string {
    if (valor === null || valor === undefined) {
      return '';
    }
    if (typeof valor === 'string') {
      return valor.replace(/\\n/g, ' ').trim();
    }
    if (Array.isArray(valor)) {
      return valor.map((v) => this.asegurarString(v)).join('\n').trim();
    }
    if (typeof valor === 'object') {
      return String(valor);
    }
    return String(valor);
  }

  async generarDocumento(elemento: HTMLElement, nombreArchivo: string = 'documento'): Promise<void> {
    try {
      if (!elemento) {
        throw new Error('El elemento HTML no es válido');
      }

      const deps = await this.loadDocxDeps();

      const tableBuilder = new deps.DocxTableBuilder();
      const imageBuilder = new deps.DocxImageBuilder(() => this.configService.getApiUrl());
      const htmlContentBuilder = new deps.DocxHtmlContentBuilder({
        ensureString: (valor) => this.asegurarString(valor),
        tableBuilder,
        imageBuilder,
      });

      const children = await htmlContentBuilder.convertirHtmlADocx(elemento);

      if (!children || children.length === 0) {
        throw new Error('No se pudo generar contenido del documento. El documento está vacío.');
      }

      const doc = deps.DocxDocumentFactory.create(children, { withPageMargins: true });

      const blob = await deps.Packer.toBlob(doc);

      if (deps.saveAs && typeof deps.saveAs === 'function') {
        deps.saveAs(blob, `${nombreArchivo}.docx`);
        return;
      }

      // Fallback: crear enlace y descargar manualmente si saveAs no está disponible
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nombreArchivo}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      } catch (err) {
        throw new Error('saveAs ____ y fallback de descarga falló. Revisa la configuración de file-saver o la compatibilidad del navegador.');
      }
    } catch (error: any) {
      throw new Error(
        `Error al generar documento Word: ${error?.message || error?.toString() || 'Error desconocido'}`
      );
    }
  }

  async generarDocumentoEjemplo(): Promise<void> {
    const elemento =
      (document.querySelector('.viewport-content') as HTMLElement) ||
      (document.querySelector('.preview') as HTMLElement) ||
      (document.querySelector('app-resumen') as HTMLElement);

    if (!elemento) {
      throw new Error('No se encontró el contenido de ejemplo para exportar.');
    }

    await this.generarDocumento(elemento, 'LBSPaka_Ejemplo_Estructura');
  }

  obtenerDatosEjemplo(): any {
    return {
      projectName: 'Paka',
      departamentoSeleccionado: 'Arequipa',
      provinciaSeleccionada: 'Caravelí',
      distritoSeleccionado: 'Cahuacho',
      detalleProyecto: 'el sur del Perú',
      consultora: 'GEADES (2024)',
      cantidadEntrevistas: 18,
      fechaTrabajoCampo: 'noviembre de 2024',
      entrevistados: [
        { nombre: 'Miguel Ángel Sayaverde Rospigliosi', cargo: 'Presidente', organizacion: 'CC Ayroca' },
        { nombre: 'Julio Edilberto Ventura Quispe', cargo: 'Vicepresidente', organizacion: '' },
        { nombre: 'Zarita Juana Sayaverde Bustamante', cargo: 'Tesorero', organizacion: '' },
        { nombre: 'Elena Bustamante Rubio', cargo: 'Fiscal', organizacion: '' },
        { nombre: 'Kelvin Quispe Merino', cargo: 'Teniente Gobernador', organizacion: 'Anexo Ayroca' },
        { nombre: 'María Elena Aguayo Arias', cargo: 'Director', organizacion: 'IE Ayroca' },
      ],
      cantidadEncuestas: 60,
      componenteFuentesPrimarias2: 'orientada a hogares del AISD',
      nameuniverso: 'universo poblacional',
      muestra: 60,
      noEncuestados: 0,
      encuestadoPorcentaje: 100,
      noResultadoPorcentaje: 0,
      influenciaSocialDirecta: 'Comunidad Campesina Ayroca',
      grupoAISD: 'Comunidad Campesina Ayroca',
      centroPobladoAISI: 'Cahuacho',
      puntosPoblacion: [
        { nombre: 'Ayroca', codigo: '1001', poblacion: 180, viviendasEmpadronadas: 75, viviendasOcupadas: 70 },
        { nombre: 'Ayllito', codigo: '1002', poblacion: 120, viviendasEmpadronadas: 50, viviendasOcupadas: 48 },
      ],
    };
  }

  // Nota: la conversión HTML->DOCX se carga de forma lazy junto con docx.
}
