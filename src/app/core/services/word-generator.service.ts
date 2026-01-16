import { Injectable } from '@angular/core';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  HeadingLevel,
  ImageRun,
  WidthType,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class WordGeneratorService {
  async generarDocumento(elemento: HTMLElement, nombreArchivo: string = 'documento'): Promise<void> {
    const children = await this.convertirHtmlADocx(elemento);
    
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: 'Arial',
              size: 22
            },
            paragraph: {
              spacing: {
                after: 200,
                line: 360 // 1.5 line spacing (360 = 1.5 * 240)
              }
            }
          }
        },
        paragraphStyles: [
          {
            id: 'Normal',
            name: 'Normal',
            basedOn: 'Normal',
            next: 'Normal',
            run: {
              font: 'Arial',
              size: 22
            },
            paragraph: {
              spacing: {
                after: 200,
                line: 360 // 1.5 line spacing
              },
              alignment: AlignmentType.JUSTIFIED
            }
          },
          {
            id: 'TituloCapitulo',
            name: 'Titulo Capitulo',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
              bold: true,
              color: '0F4761'
            },
            paragraph: {
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 200,
                after: 200,
                line: 360
              },
              shading: {
                fill: 'D3D3D3'
              }
            }
          },
          {
            id: 'Heading1',
            name: 'Heading 1',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
              bold: true
            },
            paragraph: {
              spacing: {
                before: 200,
                after: 200,
                line: 360
              }
            }
          },
          {
            id: 'Heading2',
            name: 'Heading 2',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
              bold: true
            },
            paragraph: {
              spacing: {
                before: 200,
                after: 200,
                line: 360
              }
            }
          },
          {
            id: 'Heading3',
            name: 'Heading 3',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
              bold: true
            },
            paragraph: {
              spacing: {
                before: 150,
                after: 150,
                line: 360
              }
            }
          },
          {
            id: 'Heading4',
            name: 'Heading 4',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
              bold: true
            },
            paragraph: {
              spacing: {
                before: 150,
                after: 150,
                line: 360
              }
            }
          },
          {
            id: 'Heading5',
            name: 'Heading 5',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
              bold: true
            },
            paragraph: {
              spacing: {
                before: 150,
                after: 150,
                line: 360
              }
            }
          },
          {
            id: 'TituloTabla',
            name: 'Titulo Tabla',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
              bold: true
            },
            paragraph: {
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 100,
                line: 360
              }
            }
          },
          {
            id: 'SubtituloTabla',
            name: 'Subtitulo Tabla',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22
            },
            paragraph: {
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 200,
                line: 360
              }
            }
          },
          {
            id: 'Fuente',
            name: 'Fuente',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 20,
              italics: true
            },
            paragraph: {
              spacing: {
                after: 300,
                line: 360
              }
            }
          },
          {
            id: 'ListaBullet',
            name: 'Lista Bullet',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22
            },
            paragraph: {
              alignment: AlignmentType.JUSTIFIED,
              spacing: {
                after: 150,
                line: 360
              }
            }
          }
        ]
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${nombreArchivo}.docx`);
  }

  private async convertirHtmlADocx(elemento: HTMLElement): Promise<any[]> {
    const nodos = Array.from(elemento.childNodes);
    const contenido: any[] = [];

    for (const nodo of nodos) {
      if (nodo.nodeType === Node.TEXT_NODE) {
        const texto = nodo.textContent?.trim();
        if (texto) {
          contenido.push(new Paragraph({ children: [new TextRun(texto)] }));
        }
      } else if (nodo.nodeType === Node.ELEMENT_NODE) {
        const elem = nodo as HTMLElement;
        const procesado = await this.procesarElemento(elem);
        if (procesado) {
          contenido.push(...(Array.isArray(procesado) ? procesado : [procesado]));
        }
      }
    }

    return contenido;
  }

  private async procesarElemento(elem: HTMLElement): Promise<any | any[] | null> {
    const tagName = elem.tagName.toLowerCase();
    const text = elem.innerText?.trim();

    if (tagName === 'app-foto-info' || tagName === 'app-image-upload') {
      return await this.procesarFotoInfo(elem);
    }

    if (tagName.startsWith('app-')) {
      return await this.procesarContenidoDiv(elem);
    }

    if (!text && !['table', 'img', 'ul', 'ol', 'div'].includes(tagName)) {
      return null;
    }

    switch (tagName) {
      case 'h1':
        return this.crearTitulo(text, HeadingLevel.HEADING_1);
      case 'h2':
        return this.crearTitulo(text, HeadingLevel.HEADING_2);
      case 'h3':
        return this.crearTitulo(text, HeadingLevel.HEADING_3);
      case 'h4':
        return this.crearTitulo(text, HeadingLevel.HEADING_4);
      case 'h5':
        return this.crearTitulo(text, HeadingLevel.HEADING_5);
      case 'p':
        return this.crearParrafo(elem);
      case 'ul':
      case 'ol':
        return this.crearLista(elem);
      case 'table':
        return this.crearTabla(elem);
      case 'img':
        return await this.crearImagen(elem as HTMLImageElement);
      case 'div':
        if (elem.classList.contains('image-gallery')) {
          return await this.procesarGaleriaImagenes(elem);
        }
        if (elem.classList.contains('foto-info') || elem.classList.contains('foto-item')) {
          return await this.procesarFotoInfo(elem);
        }
        return await this.procesarContenidoDiv(elem);
      default:
        return null;
    }
  }

  private crearTitulo(texto: string, nivel: any): Paragraph {
    return new Paragraph({
      text: texto,
      heading: nivel,
      spacing: { 
        before: 240, 
        after: 200,
        line: 360 // 1.5 line spacing
      },
    });
  }

  private crearParrafo(elem: HTMLElement): Paragraph {
    const texto = elem.innerText?.trim() || '';
    const esTituloCentrado = elem.classList.contains('titulo-centrado') || 
                             elem.classList.contains('table-title') ||
                             elem.classList.contains('table-title-main');
    const esSource = elem.classList.contains('source');
    const tieneHighlight = elem.querySelector('.highlight');

    const children: TextRun[] = [];
    
    if (tieneHighlight) {
      const partes = this.extraerTextoConHighlight(elem);
      partes.forEach(parte => {
        children.push(new TextRun({
          text: parte.texto,
          bold: parte.esHighlight,
          font: 'Arial'
        }));
      });
    } else {
      children.push(new TextRun({ 
        text: texto,
        font: 'Arial'
      }));
    }

    return new Paragraph({
      alignment: esTituloCentrado ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
      children: children,
      spacing: { 
        after: esSource ? 200 : 120,
        line: 360 // 1.5 line spacing
      },
    });
  }

  private extraerTextoConHighlight(elem: HTMLElement): Array<{ texto: string; esHighlight: boolean }> {
    const partes: Array<{ texto: string; esHighlight: boolean }> = [];
    const nodos = Array.from(elem.childNodes);

    nodos.forEach(nodo => {
      if (nodo.nodeType === Node.TEXT_NODE) {
        const texto = nodo.textContent?.trim();
        if (texto) {
          partes.push({ texto, esHighlight: false });
        }
      } else if (nodo.nodeType === Node.ELEMENT_NODE) {
        const elemento = nodo as HTMLElement;
        if (elemento.classList.contains('highlight')) {
          partes.push({ texto: elemento.textContent?.trim() || '', esHighlight: true });
        } else {
          const texto = elemento.textContent?.trim();
          if (texto) {
            partes.push({ texto, esHighlight: false });
          }
        }
      }
    });

    return partes;
  }

  private crearLista(elem: HTMLElement): Paragraph[] {
    const items = Array.from(elem.querySelectorAll('li'));
    return items.map(li => {
      const texto = li.innerText?.trim() || '';
      return new Paragraph({
        children: [new TextRun({ 
          text: texto,
          font: 'Arial'
        })],
        bullet: { level: 0 },
        spacing: { 
          after: 100,
          line: 360 // 1.5 line spacing
        },
      });
    });
  }

  private crearTabla(elem: HTMLElement): Table {
    const rows = Array.from(elem.querySelectorAll('tr')).map((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll('th, td')).map(cell => {
        const isHeader = cell.tagName === 'TH' || cell.classList.contains('table-header');
        const cellHTMLElem = cell as HTMLElement;
        
        // Determinar si está centrado - los encabezados siempre centrados
        const isCentered = isHeader || 
                          cell.classList.contains('table-cell-center') || 
                          cell.classList.contains('header-centrado') ||
                          cell.classList.contains('table-header') ||
                          cellHTMLElem.style?.textAlign === 'center';
        
        const texto = (cell as HTMLElement).textContent?.trim() || '';
        const cellElem = cell as HTMLElement;
        const tieneHighlight = cellElem.querySelector('.highlight');

        // Obtener colspan y rowspan
        const colspan = parseInt(cellHTMLElem.getAttribute('colspan') || '1');
        const rowspan = parseInt(cellHTMLElem.getAttribute('rowspan') || '1');

        let children: TextRun[] = [];
        if (tieneHighlight) {
          const partes = this.extraerTextoConHighlight(cellElem);
          partes.forEach(parte => {
            children.push(new TextRun({
              text: parte.texto,
              bold: parte.esHighlight || isHeader,
              font: 'Arial',
              size: 22
            }));
          });
        } else {
          children.push(new TextRun({ 
            text: texto, 
            bold: isHeader,
            font: 'Arial',
            size: 22
          }));
        }

        // Crear párrafo con text wrapping para celdas con texto largo
        const paragraphOptions: any = {
          alignment: isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: children,
          spacing: {
            before: 50,
            after: 50,
            line: 360 // 1.5 line spacing
          }
        };

        const cellOptions: any = {
          children: [new Paragraph(paragraphOptions)],
          shading: isHeader ? { fill: 'E6E6E6' } : undefined,
          margins: {
            top: 100,
            bottom: 100,
            left: 100,
            right: 100
          },
          verticalAlign: 'center' as any,
          borders: {
            top: { size: 1, color: '000000', style: BorderStyle.SINGLE },
            bottom: { size: 1, color: '000000', style: BorderStyle.SINGLE },
            left: { size: 1, color: '000000', style: BorderStyle.SINGLE },
            right: { size: 1, color: '000000', style: BorderStyle.SINGLE }
          }
        };

        // Agregar columnSpan si es mayor a 1
        if (colspan > 1) {
          cellOptions.columnSpan = colspan;
        }

        // Agregar rowSpan si es mayor a 1
        if (rowspan > 1) {
          cellOptions.rowSpan = rowspan;
          // Para celdas con rowspan, asegurar verticalAlign center
          cellOptions.verticalAlign = 'center' as any;
        }

        // Para celdas con colspan, ajustar width proporcional
        if (colspan > 1) {
          cellOptions.width = {
            size: colspan * 10,
            type: WidthType.PERCENTAGE
          };
        }

        return new TableCell(cellOptions);
      });
      
      return new TableRow({ 
        children: cells,
        tableHeader: cells.some((c: any) => c.options?.shading?.fill === 'E6E6E6'),
        height: { value: 500, rule: 'atLeast' as any }
      });
    });

    return new Table({
      rows: rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: 'autofit' as any,
      columnWidths: this.calcularAnchoColumnas(elem),
      margins: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    });
  }

  private calcularAnchoColumnas(elem: HTMLElement): number[] | undefined {
    // Encontrar la fila con más celdas (considerando colspan)
    const rows = Array.from(elem.querySelectorAll('tr'));
    let maxCells = 0;
    let dataRow: HTMLElement | null = null;
    
    // Buscar la fila con más columnas totales
    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll('th, td')) as HTMLElement[];
      let totalColumns = 0;
      cells.forEach(cell => {
        const colspan = parseInt(cell.getAttribute('colspan') || '1');
        totalColumns += colspan;
      });
      
      if (totalColumns > maxCells) {
        maxCells = totalColumns;
      }
      
      // Encontrar una fila de datos sin colspan para usar como referencia
      if (!dataRow && cells.length === totalColumns && cells.some(c => c.tagName === 'TD')) {
        dataRow = row;
      }
    }
    
    if (maxCells > 0) {
      const widths: number[] = [];
      
      // Si la primera columna es texto largo (descripciones), darle más espacio
      if (dataRow) {
        const cells = Array.from(dataRow.querySelectorAll('th, td')) as HTMLElement[];
        const firstCellText = cells[0]?.textContent?.trim() || '';
        
        // Si la primera celda tiene texto largo, darle 40% del ancho
        if (firstCellText.length > 20) {
          widths.push(3800); // 40% para descripción
          const remainingWidth = 5700; // 60% restante
          const widthPerColumn = Math.floor(remainingWidth / (maxCells - 1));
          for (let i = 1; i < maxCells; i++) {
            widths.push(widthPerColumn);
          }
          return widths;
        }
      }
      
      // Por defecto, distribuir equitativamente
      const widthPerColumn = Math.floor(9500 / maxCells);
      return Array(maxCells).fill(widthPerColumn);
    }
    
    return undefined;
  }

  private async procesarFotoInfo(elem: HTMLElement): Promise<any[]> {
    const contenido: any[] = [];
    
    const numero = elem.querySelector('.foto-numero')?.textContent?.trim() || '';
    const titulo = elem.querySelector('.foto-titulo')?.textContent?.trim() || '';
    const fuente = elem.querySelector('.foto-fuente')?.textContent?.trim() || '';
    const img = elem.querySelector('img') as HTMLImageElement;
    
    if (numero) {
      contenido.push(new Paragraph({
        children: [new TextRun({ text: numero, bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }));
    }
    
    if (titulo) {
      contenido.push(new Paragraph({
        children: [new TextRun({ text: titulo })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 150 },
      }));
    }
    
    if (img && img.src) {
      const imagen = await this.crearImagen(img);
      if (imagen) {
        contenido.push(imagen);
      }
    }
    
    if (fuente) {
      contenido.push(new Paragraph({
        children: [new TextRun({ text: fuente })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      }));
    }
    
    return contenido;
  }

  private async crearImagen(elem: HTMLImageElement): Promise<Paragraph | null> {
    if (!elem.src) return null;

    try {
      const response = await fetch(elem.src);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const extension = elem.src.split('.').pop()?.toLowerCase();

      let type: 'png' | 'jpg' | 'gif' | 'bmp' = 'png';
      if (extension === 'jpg' || extension === 'jpeg') type = 'jpg';
      else if (extension === 'gif') type = 'gif';
      else if (extension === 'bmp') type = 'bmp';

      const image = new ImageRun({
        data: new Uint8Array(arrayBuffer),
        transformation: { width: 500, height: 375 },
        type,
      });

      return new Paragraph({
        children: [image],
        alignment: AlignmentType.CENTER,
        spacing: { before: 150, after: 200 },
      });
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      return null;
    }
  }

  private async procesarGaleriaImagenes(elem: HTMLElement): Promise<any[]> {
    const contenido: any[] = [];
    const imageItems = Array.from(elem.querySelectorAll('.image-item'));

    for (const item of imageItems) {
      const caption = item.querySelector('p')?.textContent?.trim() || '';
      const fuente = item.querySelector('div')?.textContent?.trim() || '';
      const img = item.querySelector('img') as HTMLImageElement;

      if (img && img.src) {
        const imagen = await this.crearImagen(img);
        if (imagen) {
          if (caption) {
            contenido.push(new Paragraph({
              children: [new TextRun({ text: caption, bold: true })],
              spacing: { after: 100 },
            }));
          }
          contenido.push(imagen);
          if (fuente) {
            contenido.push(new Paragraph({
              text: fuente,
              alignment: AlignmentType.CENTER,
              spacing: { after: 150 },
            }));
          }
        }
      }
    }

    return contenido;
  }

  private async procesarContenidoDiv(elem: HTMLElement): Promise<any[]> {
    const contenido: any[] = [];
    const nodos = Array.from(elem.childNodes);

    for (const nodo of nodos) {
      if (nodo.nodeType === Node.TEXT_NODE) {
        const texto = nodo.textContent?.trim();
        if (texto && texto.length > 0) {
          contenido.push(new Paragraph({ children: [new TextRun(texto)] }));
        }
      } else if (nodo.nodeType === Node.ELEMENT_NODE) {
        const elemento = nodo as HTMLElement;
        const procesado = await this.procesarElemento(elemento);
        if (procesado) {
          contenido.push(...(Array.isArray(procesado) ? procesado : [procesado]));
        }
      }
    }

    return contenido;
  }

  async generarDocumentoEjemplo(): Promise<void> {
    try {
      console.log('Iniciando generación de documento ejemplo...');
      const contenido = await this.crearContenidoEjemplo();
      console.log('Contenido creado, elementos:', contenido.length);
      
      const doc = new Document({
        styles: {
          default: {
            document: {
              run: {
                font: 'Arial',
                size: 22
              },
              paragraph: {
                spacing: {
                  after: 200,
                  line: 360
                }
              }
            }
          },
          paragraphStyles: [
            {
              id: 'Normal',
              name: 'Normal',
              basedOn: 'Normal',
              next: 'Normal',
              run: {
                font: 'Arial',
                size: 22
              },
              paragraph: {
                spacing: {
                  after: 200,
                  line: 360
                },
                alignment: AlignmentType.JUSTIFIED
              }
            },
            {
              id: 'TituloCapitulo',
              name: 'Titulo Capitulo',
              basedOn: 'Normal',
              run: {
                font: 'Arial',
                size: 22,
                bold: true,
                color: '0F4761'
              },
              paragraph: {
                alignment: AlignmentType.CENTER,
                spacing: {
                  before: 200,
                  after: 200
                },
                shading: {
                  fill: 'D3D3D3'
                }
              }
            },
            {
              id: 'Heading1',
              name: 'Heading 1',
              basedOn: 'Normal',
              run: {
                font: 'Arial',
                size: 22,
                bold: true
              },
              paragraph: {
                spacing: {
                  before: 200,
                  after: 200
                }
              }
            },
            {
              id: 'Heading2',
              name: 'Heading 2',
              basedOn: 'Normal',
              run: {
                font: 'Arial',
                size: 22,
                bold: true
              },
              paragraph: {
                spacing: {
                  before: 200,
                  after: 200
                }
              }
            },
            {
              id: 'Heading3',
              name: 'Heading 3',
              basedOn: 'Normal',
              run: {
                font: 'Arial',
                size: 22,
                bold: true
              },
              paragraph: {
                spacing: {
                  before: 150,
                  after: 150
                }
              }
            },
            {
              id: 'TituloTabla',
              name: 'Titulo Tabla',
              basedOn: 'Normal',
              run: {
                font: 'Arial',
                size: 22,
                bold: true
              },
              paragraph: {
                alignment: AlignmentType.CENTER,
                spacing: {
                  after: 100
                }
              }
            },
            {
              id: 'SubtituloTabla',
              name: 'Subtitulo Tabla',
              basedOn: 'Normal',
              run: {
                font: 'Arial',
                size: 22
              },
              paragraph: {
                alignment: AlignmentType.CENTER,
                spacing: {
                  after: 200
                }
              }
            },
            {
              id: 'Fuente',
              name: 'Fuente',
              basedOn: 'Normal',
              run: {
                font: 'Arial',
                size: 20,
                italics: true
              },
              paragraph: {
                spacing: {
                  after: 300
                }
              }
            },
            {
              id: 'ListaBullet',
              name: 'Lista Bullet',
              basedOn: 'Normal',
              run: {
                font: 'Arial',
                size: 22
              },
              paragraph: {
                alignment: AlignmentType.JUSTIFIED,
                spacing: {
                  after: 150
                }
              }
            }
          ]
        },
        sections: [
          {
            children: contenido,
          },
        ],
      });

      console.log('Documento creado, generando blob...');
      const blob = await Packer.toBlob(doc);
      console.log('Blob generado, iniciando descarga...');
      saveAs(blob, 'LBSPaka_Ejemplo_Estructura.docx');
      console.log('Descarga iniciada');
    } catch (error) {
      console.error('Error al generar documento ejemplo:', error);
      throw error;
    }
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
      puntosPoblacion: [
        { nombre: 'Ayroca', codigo: '1001', poblacion: 180, viviendasEmpadronadas: 75, viviendasOcupadas: 70 },
        { nombre: 'Ayllito', codigo: '1002', poblacion: 120, viviendasEmpadronadas: 50, viviendasOcupadas: 48 }
      ]
    };
  }

  private crearParrafoArial(texto: string, opciones: any = {}): Paragraph {
    return new Paragraph({
      text: texto,
      style: 'Normal',
      spacing: { after: opciones.spacing || 200 }
    });
  }

  private crearParrafoArialSimple(config: any): Paragraph {
    return new Paragraph({
      ...config,
      style: 'Normal'
    });
  }

  private crearParrafoArialConTextos(textos: Array<{text: string, bold?: boolean, underline?: boolean}>): Paragraph {
    return new Paragraph({
      children: textos.map(t => new TextRun({
        text: t.text,
        bold: t.bold || false,
        underline: t.underline ? { type: 'single', color: 'FF0000' } : undefined
      })),
      style: 'Normal'
    });
  }

  private crearTituloArialH3(texto: string): Paragraph {
    return new Paragraph({
      text: texto,
      style: 'TituloCapitulo'
    });
  }

  private crearTituloArialH4(texto: string): Paragraph {
    return new Paragraph({
      text: texto,
      style: 'Heading1'
    });
  }

  private crearTituloArialH5(texto: string): Paragraph {
    return new Paragraph({
      text: texto,
      style: 'Heading2'
    });
  }

  private crearTituloArialH6(texto: string): Paragraph {
    return new Paragraph({
      text: texto,
      style: 'Heading3'
    });
  }

  private crearBulletArial(texto: string): Paragraph {
    return new Paragraph({
      text: '•   ' + texto,
      style: 'ListaBullet'
    });
  }

  private async crearContenidoEjemplo(): Promise<any[]> {
    const contenido: any[] = [];

    contenido.push(new Paragraph({
      text: 'CAPÍTULO III - LÍNEA BASE',
      style: 'TituloCapitulo'
    }));

    contenido.push(new Paragraph({
      text: '3.1.     DESCRIPCIÓN Y CARACTERIZACIÓN DE LOS ASPECTOS SOCIALES, CULTURALES Y ANTROPOLÓGICOS DE LA POBLACIÓN UBICADA EN EL ÁREA DE INFLUENCIA SOCIAL DEL PROYECTO',
      style: 'Heading1'
    }));

    contenido.push(new Paragraph({
      style: 'Normal',
      children: [
        new TextRun({
          text: 'Este componente realiza una caracterización de los aspectos socioeconómicos, culturales y antropológicos del área de influencia social del proyecto ',
          font: 'Arial',
          size: 22
        }),
        new TextRun({
          text: 'Paka',
          font: 'Arial',
          size: 22,
          underline: { type: 'single', color: 'FF0000' }
        }),
        new TextRun({
          text: ' como un patrón de referencia inicial en base a la cual se pueda medir los impactos sobre la población del entorno directo del Proyecto.',
          font: 'Arial',
          size: 22
        })
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    }));

    contenido.push(new Paragraph({
      children: [
        new TextRun({
          text: 'El proyecto ',
          font: 'Arial',
          size: 22
        }),
        new TextRun({
          text: 'Paka',
          font: 'Arial',
          size: 22,
          underline: { type: 'single', color: 'FF0000' }
        }),
        new TextRun({
          text: ' se encuentra ubicado en el distrito de Cahuacho, en la provincia de Caravelí, en el departamento de Arequipa, bajo la administración del Gobierno Regional de Arequipa, en el sur del Perú.',
          font: 'Arial',
          size: 22
        })
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 }
    }));

    contenido.push(new Paragraph({
      text: 'Este estudio se elabora de acuerdo con el Reglamento de la Ley del Sistema Nacional de Evaluación de Impacto Ambiental, los Términos de Referencia comunes para actividades de exploración minera y la Guía de Relaciones Comunitarias del Ministerio de Energía y Minas (MINEM).',
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 },
      run: {
        font: 'Arial',
        size: 22
      }
    }));

    contenido.push(this.crearTituloArialH5('3.1.1.     Objetivos de la línea base social'));
    
    contenido.push(this.crearParrafoArial('Los objetivos de la presente línea base social (LBS) son los siguientes:'));

    contenido.push(this.crearBulletArial('Describir los aspectos demográficos, sociales, económicos, culturales y políticos que caracterizan a las poblaciones de las áreas de influencia social del proyecto de exploración minera Paka.'));

    contenido.push(this.crearBulletArial('Brindar información básica de los poblados comprendidos en el área de influencia social donde se realizará el Proyecto que sirva de base para poder determinar los posibles impactos sociales a originarse en esta primera etapa de exploración y, por ende, prevenir, reducir o mitigar las consecuencias negativas y potenciar las positivas.'));

    contenido.push(this.crearTituloArialH5('3.1.2.     Delimitación de las áreas de influencia social'));
    
    contenido.push(this.crearParrafoArial('En términos generales, la delimitación del ámbito de estudio de las áreas de influencia social se hace tomando en consideración a los agentes e instancias sociales, individuales y/o colectivas, públicas y/o privadas, que tengan derechos o propiedad sobre el espacio o los recursos respecto de los cuales el proyecto de exploración minera tiene incidencia.'));
    
    contenido.push(this.crearParrafoArial('Asimismo, el área de influencia social de un proyecto tiene en consideración a los grupos de interés que puedan ser potencialmente afectadas por el desarrollo de dicho proyecto (según La Guía de Relaciones Comunitarias de la DGAAM del MINEM, se denomina "grupos de interés" a aquellos grupos humanos que son impactados por dicho proyecto).'));
    
    contenido.push(this.crearParrafoArial('El criterio social para la delimitación de un área de influencia debe tener en cuenta la influencia que el Proyecto pudiera tener sobre el entorno social, que será o no ambientalmente impactado, considerando también la posibilidad de generar otro tipo de impactos, expectativas, intereses y/o demandas del entorno social.'));
    
    contenido.push(this.crearParrafoArial('En base a estos criterios se han identificado las áreas de influencia social directa e indirecta:'));

    contenido.push(this.crearTituloArialH6('A.     Áreas de influencia social directa (AISD)'));
    
    contenido.push(this.crearParrafoArial('El Área de influencia social directa (AISD) se delimita en torno a la comunidad campesina (CC) Ayroca, cuya área comunal se encuentra predominantemente en el distrito de Cahuacho y en menor proporción en los distritos de Puyusca y de Pausa, pertenecientes al departamento de Ayacucho. La delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales. Esta comunidad posee y gestiona las tierras donde se llevará a cabo la exploración minera, lo que implica una relación directa y significativa con el Proyecto.'));

    contenido.push(this.crearParrafoArial('La titularidad de estas tierras establece un vínculo crucial con los pobladores locales, ya que cualquier actividad realizada en el área puede influir directamente sus derechos, usos y costumbres asociados a la tierra. Además, la gestión y administración de estos terrenos por parte de la comunidad requiere una consideración detallada en la planificación y ejecución del Proyecto, asegurando que las operaciones se lleven a cabo con respeto a la estructura organizativa y normativa de la comunidad.'));

    contenido.push(this.crearParrafoArial('Los impactos directos en la CC Ayroca, derivados del proyecto de exploración minera, incluyen la contratación de mano de obra local, la interacción con las costumbres y autoridades, y otros efectos socioeconómicos y culturales. La generación de empleo local no solo proporcionará oportunidades económicas inmediatas, sino que también fomentará el desarrollo de habilidades y capacidades en la población. La interacción constante con las autoridades y la comunidad promoverá un diálogo y una cooperación que son esenciales para el éxito del Proyecto, respetando y adaptándose a las prácticas y tradiciones locales. La consideración de estos factores en la delimitación del AISD garantiza que el Proyecto avance de manera inclusiva y sostenible, alineado con las expectativas y necesidades de la CC Ayroca.'));

    contenido.push(this.crearTituloArialH6('B.     Áreas de influencia social indirecta (AISI)'));
    
    contenido.push(this.crearParrafoArial('El Área de influencia social indirecta (AISI) se delimita en torno a la capital distrital de la jurisdicción de Cahuacho. Esta localidad se considera dentro del AISI debido a su función como centro administrativo y político de su respectivo distrito. Como capital distrital, el Centro Poblado (CP) Cahuacho es un punto focal para la interacción con las autoridades locales, quienes jugarán un papel crucial en la gestión y supervisión de las actividades del Proyecto. Además, la adquisición de bienes y servicios esporádicos en este centro poblado será esencial para el soporte logístico, lo que justifica su inclusión en el AISI.'));
    
    contenido.push(this.crearParrafoArial('La delimitación también se basa en la necesidad de establecer un diálogo continuo y efectivo con las autoridades políticas locales en el distrito de Cahuacho. Esta interacción es vital para asegurar que las operaciones del Proyecto sean transparentes y alineadas con las normativas locales y las expectativas de la población. Asimismo, la compra esporádica de suministros y la contratación de servicios en este centro poblado contribuirá al dinamismo económico de la capital distrital, generando beneficios indirectos para esta población. De esta manera, la delimitación del AISI considera tanto la dimensión administrativa y política como la económica, garantizando un enfoque integral y sostenible en la implementación del Proyecto.'));

    contenido.push(this.crearTituloArialH5('3.1.3.     Índices demográficos, sociales, económicos, de ocupación laboral y otros similares'));
    
    contenido.push(this.crearParrafoArial('Para la descripción del aspecto socioeconómico se ha utilizado una combinación de métodos y técnicas cualitativas de investigación social, entre ellas se ha seleccionado las técnicas de entrevistas semiestructuradas con autoridades locales y/o informantes calificados.'));

    contenido.push(this.crearTituloArialH6('A.     Fuentes primarias'));
    
    contenido.push(this.crearParrafoArial('Dentro de las fuentes primarias se consideran a las autoridades comunales y locales, así como pobladores que fueron entrevistados y proporcionaron información cualitativa. Esta información de primera mano muestra datos fidedignos que proporcionan un alcance más cercano de la realidad en la que se desarrollan las poblaciones del área de influencia social. Para la obtención de información cualitativa, se realizaron un total de 18 entrevistas en profundidad a informantes calificados y autoridades locales.'));
    
    contenido.push(this.crearParrafoArial('A continuación, se muestra en el siguiente cuadro los cargos u ocupaciones principales de las 18 autoridades e informantes que fueron entrevistados durante el trabajo de campo llevado a cabo en el mes de noviembre de 2024.'));

    // Cuadro N° 3. 1 Lista de entrevistados
    contenido.push(new Paragraph({
      text: 'Cuadro N° 3. 1',
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: 'Lista de entrevistados',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));

    const tablaEntrevistados = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'Nombres y Apellidos', alignment: AlignmentType.CENTER })],
              shading: { fill: 'E6E6E6' },
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Cargo u Ocupación', alignment: AlignmentType.CENTER })],
              shading: { fill: 'E6E6E6' },
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Organización', alignment: AlignmentType.CENTER })],
              shading: { fill: 'E6E6E6' },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Miguel Ángel Sayaverde Rospigliosi' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Presidente' })] }),
            new TableCell({ children: [new Paragraph({ text: 'CC Ayroca' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Julio Edilberto Ventura Quispe' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Vicepresidente' })] }),
            new TableCell({ children: [new Paragraph({ text: 'CC Ayroca' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Zarita Juana Sayaverde Bustamante' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Tesorero' })] }),
            new TableCell({ children: [new Paragraph({ text: 'CC Ayroca' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Elena Bustamante Rubio' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Fiscal' })] }),
            new TableCell({ children: [new Paragraph({ text: 'CC Ayroca' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Kelvin Quispe Merino' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Teniente Gobernador' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Anexo Ayroca' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'María Elena Aguayo Arias' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Director' })] }),
            new TableCell({ children: [new Paragraph({ text: 'IE Ayroca' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Nieves Bernaola Torres' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Director' })] }),
            new TableCell({ children: [new Paragraph({ text: 'IE N°40270' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Daniela Manuel Sivinche' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Jefa de Puesto de Salud' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Puesto de Salud Ayroca' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Daniela Núñez' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Obstetea' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Puesto de Salud Ayroca' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Catalina Inés De la Cruz Rubio' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Regidor distrital' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Municipalidad Distrital de Cahuacho' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Mario Sergio Patiño Merma' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Gerente Municipal' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Municipalidad Distrital de Cahuacho' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Kelvin Elías De la Cruz Quispe' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Subprefecto' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Subprefectura Distrital de Cahuacho' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Edgar Manuel Espinoza Aguayo' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Ex – alcalde' })] }),
            new TableCell({ children: [new Paragraph({ text: 'CP Cahuacho' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Juana Espinoza De la Cruz' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Presidente' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Comedor Popular "Virgen del Rosario"' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'María Rosario Yana Franco' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Director' })] }),
            new TableCell({ children: [new Paragraph({ text: 'IE Cahuacho' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Maxkeylyn Ccama Mamani' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Director' })] }),
            new TableCell({ children: [new Paragraph({ text: 'IE N°40271' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Adrián Reynaldo Morante Chipana' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Director' })] }),
            new TableCell({ children: [new Paragraph({ text: 'IE Virgen de Copacabana' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Deyma Salazar Herrera' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Jefa de Recursos Humanos' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Puesto de Salud Cahuacho' })] }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        bottom: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        left: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        right: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideHorizontal: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideVertical: { size: 1, color: '000000', style: BorderStyle.SINGLE },
      },
    });
    contenido.push(tablaEntrevistados);
    contenido.push(new Paragraph({
      text: 'FUENTE: GEADES (2024)',
      spacing: { after: 300 },
    }));

    contenido.push(this.crearTitulo('B. Fuentes secundarias', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'En la elaboración de la LBS se utilizó información cuantitativa de fuentes secundarias provenientes de fuentes oficiales, entre las que se encuentran las siguientes:',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: '● Base de Datos de Pueblos Indígenas u Originarios – BDPI.',
      bullet: { level: 0 },
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: '● Censos Nacionales 2017 (XII de Población, VII de Vivienda y III de Comunidades Indígenas) ejecutados por el Instituto Nacional de Estadística e Informática (INEI).',
      bullet: { level: 0 },
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: '● Estadísticas de la Calidad Educativa (ESCALE) de la Unidad de Estadística del Ministerio de Educación (MINEDU).',
      bullet: { level: 0 },
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: '● Ministerio de Energía y Minas (MINEM).',
      bullet: { level: 0 },
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: '● Ministerio de Trabajo y Promoción del Empleo (MTPE).',
      bullet: { level: 0 },
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: '● Ministerio de Transporte y Comunicaciones (MTC).',
      bullet: { level: 0 },
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: '● Observatorio Socio Económico Laboral (OSEL).',
      bullet: { level: 0 },
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: '● Organismo Supervisor de Inversión Privada en Telecomunicaciones – OSIPTEL.',
      bullet: { level: 0 },
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: '● Programa de Naciones Unidas para el Desarrollo – PNUD.',
      bullet: { level: 0 },
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: '● Registro Nacional de Instituciones Prestadoras de Servicios de Salud (RENIPRESS).',
      bullet: { level: 0 },
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: '● Repositorio Digital de Información Multisectorial (REDINFORMA) – MIDIS.',
      bullet: { level: 0 },
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: '● Repositorio Único Nacional de Información en Salud (REUNIS).',
      bullet: { level: 0 },
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: '● Resultados Definitivos de la Población Económicamente Activa 2017 – INEI.',
      bullet: { level: 0 },
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: '● Sistema de Información Distrital para la Gestión Pública – INEI.',
      bullet: { level: 0 },
      spacing: { after: 300 },
    }));

    // H5: 3.1.4. Caracterización socioeconómica...
    contenido.push(this.crearTitulo('3.1.4. Caracterización socioeconómica de las Áreas de Influencia Social', HeadingLevel.HEADING_5));

    // H6: A. Caracterización socioeconómica del Área de Influencia Social Directa (AISD)
    contenido.push(this.crearTitulo('A. Caracterización socioeconómica del Área de Influencia Social Directa (AISD)', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'Se ha determinado como Área de Influencia Social Directa (AISD) a la CC Ayroca. Esta delimitación se justifica en los criterios de propiedad de terreno superficial, además de la posible ocurrencia de impactos directos como la contratación de mano de obra local, adquisición de bienes y servicios, así como logística. En los siguientes apartados se desarrolla la caracterización socioeconómica y cultural de la comunidad delimitada como parte del AISD.',
      spacing: { after: 200 },
    }));

    contenido.push(this.crearTitulo('A.1. Comunidad Campesina Ayroca', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'La CC Ayroca se encuentra ubicada predominantemente dentro del distrito de Cahuacho, provincia de Caravelí; no obstante, sus límites comunales abarcan pequeñas áreas de los distritos de Puyusca y de Pausa, del departamento de Ayacucho. Esta comunidad se caracteriza por su historia y tradiciones que se mantienen vivas a lo largo de los años. Se encuentra compuesta por el anexo Ayroca, el cual es el centro administrativo comunal, además de los sectores agropecuarios de Yuracranra, Tastanic y Faldahuasi. Ello se pudo validar durante el trabajo de campo, así como mediante la Base de Datos de Pueblos Indígenas u Originarios (BDPI). Sin embargo, en la actualidad, estos sectores agropecuarios no cuentan con población permanente y la mayor parte de los comuneros se concentran en el anexo Ayroca.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En cuanto al nombre "Ayroca", según los entrevistados, este proviene de una hierba que se empleaba para elaborar moldes artesanales para queso; no obstante, ya no se viene utilizando en el presente y es una práctica que ha ido reduciéndose paulatinamente. Por otro lado, cabe mencionar que la comunidad se halla al este de la CC Sondor, al norte del CP Cahuacho y al oeste del anexo Nauquipa.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Asimismo, la CC Ayroca es reconocida por el Ministerio de Cultura como parte de los pueblos indígenas u originarios, específicamente como parte del pueblo quechua. Esta identidad es un pilar fundamental de la comunidad, influyendo en sus prácticas agrícolas, celebraciones y organización social. La oficialización de la comunidad por parte del Estado peruano se remonta al 24 de agosto de 1987, cuando fue reconocida mediante RD N°495 – 87 – MAG – DR – VIII – A. Este reconocimiento formalizó la existencia y los derechos de la comunidad, fortaleciendo su posición y legitimidad dentro del marco legal peruano. Posteriormente, las tierras de la comunidad fueron tituladas el 28 de marzo de 1996, conforme consta en la Ficha 90000300, según la BDPI. Esta titulación ha sido crucial para la protección y manejo de sus recursos naturales, permitiendo a la comunidad planificar y desarrollar proyectos que beneficien a todos sus comuneros. La administración de estas tierras ha sido un factor clave en la preservación de su cultura y en el desarrollo sostenible de la comunidad.',
      spacing: { after: 200 },
    }));

    contenido.push(...this.crearTablaConDatos('3. 2', 'Ubicación referencial – CC Ayroca',
      ['Localidad', 'Coordenadas', 'Altitud', 'Distrito', 'Provincia', 'Departamento'],
      [['Ayroca', '18L\nE:  660 619 m\nN: 8 291 215 m', '3 599 msnm', 'Cahuacho', 'Caravelí', 'Arequipa']]
    ));

    contenido.push(new Paragraph({
      text: 'Para la caracterización de los indicadores demográficos y aquellos relacionados a viviendas, se emplea la sumatoria de casos obtenida al considerar aquellos puntos de población que conforman la CC Ayroca. En el siguiente cuadro, se presenta aquellos puntos de población identificados por el INEI que se encuentran dentro de la comunidad en cuestión.',
      spacing: { after: 200 },
    }));

    contenido.push(new Paragraph({
      text: 'Cuadro N° 3. 3',
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: 'Cantidad total de población y viviendas – CC Ayroca',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));
    const tablaPoblacion = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Punto de Población (INEI)', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Código', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Población', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Viviendas empadronadas', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Viviendas ocupadas', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
          ],
        }),
        new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Yuracranra' })] }), new TableCell({ children: [new Paragraph({ text: '0403060004' })] }), new TableCell({ children: [new Paragraph({ text: '0' })] }), new TableCell({ children: [new Paragraph({ text: '1' })] }), new TableCell({ children: [new Paragraph({ text: '0' })] })] }),
        new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Ayroca' })] }), new TableCell({ children: [new Paragraph({ text: '0403060005' })] }), new TableCell({ children: [new Paragraph({ text: '224' })] }), new TableCell({ children: [new Paragraph({ text: '84' })] }), new TableCell({ children: [new Paragraph({ text: '60' })] })] }),
        new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Tastanic' })] }), new TableCell({ children: [new Paragraph({ text: '0403060008' })] }), new TableCell({ children: [new Paragraph({ text: '0' })] }), new TableCell({ children: [new Paragraph({ text: '1' })] }), new TableCell({ children: [new Paragraph({ text: '0' })] })] }),
        new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Faldahuasi' })] }), new TableCell({ children: [new Paragraph({ text: '0403060014' })] }), new TableCell({ children: [new Paragraph({ text: '1' })] }), new TableCell({ children: [new Paragraph({ text: '4' })] }), new TableCell({ children: [new Paragraph({ text: '1' })] })] }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Total', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '225', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '90', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '61', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        bottom: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        left: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        right: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideHorizontal: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideVertical: { size: 1, color: '000000', style: BorderStyle.SINGLE },
      },
    });
    contenido.push(tablaPoblacion);
    contenido.push(new Paragraph({
      text: 'FUENTE: Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)',
      spacing: { after: 200 },
    }));

    contenido.push(...await this.agregarFotografia('3. 1', 'Vista panorámica del Anexo Ayroca'));
    contenido.push(...await this.agregarFotografia('3. 2', 'Vista panorámica del sector Faldahuasi'));

    contenido.push(this.crearTitulo('A.1.1. Institucionalidad local', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'Dentro de los límites de la CC Ayroca se hallan instituciones que, además de la comunidad campesina en sí, también ejercen funciones dentro del territorio y coadyuvan en el desarrollo socioeconómico de la capital administrativa comunal y de sus diferentes sectores. Cabe destacar la presencia de diversos programas sociales (como Pensión 65, Juntos o Qali Warma), así como la existencia de una Junta Administradora de Servicios de Saneamiento (JASS).',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 4', 'Instituciones existentes – CC Ayroca',
      ['Categoría', 'SI/NO', 'Nombre', 'Comentario'],
      [
        ['Municipalidad', 'NO', '--', '--'],
        ['Programas Sociales', 'SI', 'Pensión 65\nJuntos\nQali Warma\nComedor Popular\nVaso de Leche', '--'],
        ['Empresa de transportes', 'NO', '--', 'Se emplea únicamente una combi que brinda el servicio de transporte todos los lunes cubriendo la ruta entre Ayroca y Caravelí'],
        ['Delegación Policial', 'NO', '--', 'Acuden efectivos policiales de jurisdicciones cercanas en caso de urgencia'],
        ['Comercializadora de insumos agropecuarios', 'NO', '--', 'La población acude a diferentes destinos como Caravelí o Cora Cora'],
        ['Instituciones que dan asistencia técnica agropecuaria', 'SI', 'SENASA', 'Brinda asistencia técnica de manera esporádica, normalmente con periodicidad anual'],
        ['Oficina de radio emisoras', 'NO', '--', 'Existen dificultades para captar señal de radio'],
        ['Estructura para mercado o feria', 'NO', '--', '--'],
        ['Infraestructura eléctrica', 'SI', 'ADINELSA', '--'],
        ['Infraestructura de agua y desagüe', 'SI', 'JASS Ayroca', '--'],
        ['Iglesias / Templos', 'SI', 'Iglesia Matriz de Ayroca', '--'],
        ['Telefonía móvil', 'SI', 'Movistar\nEntel', '--'],
        ['Agentes de entidades financieras', 'NO', '--', 'Acuden al agente del Banco de la Nación en la Municipalidad Distrital de Cahuacho'],
        ['Empresas mineras', 'NO', '--', 'Existen indicios de actividad minera informal y/o artesanal'],
        ['Empresas de exploración minera', 'NO', '--', '--'],
      ]
    ));
    contenido.push(...await this.agregarFotografia('3. 3', 'Local Comunal de la CC Ayroca'));

    contenido.push(this.crearTitulo('A.1.2. Aspectos demográficos', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'a. Población según sexo',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Respecto a la población de la CC Ayroca, tomando en cuenta data obtenida de los Censos Nacionales 2017 y los puntos de población que la conforman, existen un total de 225 habitantes que residen permanentemente en la comunidad. De este conjunto, el 50,67 % son varones, por lo que se aprecia una leve mayoría de dicho grupo frente a sus pares femeninos (49,33 %).',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 5', 'Población por sexo – CC Ayroca (2017)',
      ['Sexo', 'Casos', 'Porcentaje'],
      [
        ['Hombre', '114', '50,67 %'],
        ['Mujer', '111', '49,33 %'],
        ['Total', '225', '100,00 %'],
      ]
    ));
    contenido.push(new Paragraph({
      text: 'b. Población según grupo etario',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En una clasificación en grandes grupos de edad, se puede observar que el grupo etario mayoritario en la CC Ayroca es el de 15 a 29 años, puesto que representa el 26,67 % de la población total. En segundo lugar, bastante cerca del primero, se halla el bloque etario de 0 a 14 años (26,22 %). Por otro lado, el conjunto minoritario está conformado por la población de 65 años a más, pues solo representa un 11,11 %.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 6', 'Población por grandes grupos de edad – CC Ayroca (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['0 a 14 años', '59', '26,22 %'],
        ['15 a 29 años', '60', '26,67 %'],
        ['30 a 44 años', '38', '16,89 %'],
        ['45 a 64 años', '43', '19,11 %'],
        ['65 años a más', '25', '11,11 %'],
        ['Total', '225', '100,00 %'],
      ]
    ));

    contenido.push(this.crearTitulo('A.1.3. Indicadores y distribución de la Población Económicamente Activa por rama de actividad, tipo de empleo, tasas e ingresos.', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'a. Población en edad de Trabajar (PET)',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En concordancia con el Convenio 138 de la Organización Internacional de Trabajo (OIT), aprobado por Resolución Legislativa Nº27453 de fecha 22 de mayo del 2001 y ratificado por DS Nº038-2001-RE, publicado el 31 de mayo de 2001, la población cumplida los 14 años de edad se encuentra en edad de trabajar.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'La población en edad de trabajar (PET) de la CC Ayroca, considerada desde los 15 años a más, se compone del 73,78 % de la población total. El bloque etario que más aporta a la PET es el de 15 a 29 años, pues representa el 36,14 % de este grupo poblacional. Por otro lado, el grupo etario que menos aporta al indicador es el de 65 años a más al representar solamente un 15,06 %.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 7', 'PET según grupos de edad – CC Ayroca (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['15 a 29 años', '60', '36,14 %'],
        ['30 a 44 años', '38', '22,89 %'],
        ['45 a 64 años', '43', '25,90 %'],
        ['65 años a más', '25', '15,06 %'],
        ['Total', '166', '100,00 %'],
      ]
    ));
    contenido.push(new Paragraph({
      text: 'No obstante, los indicadores de la PEA, tanto de su cantidad total como por subgrupos (Ocupada y Desocupada), se describen a nivel distrital siguiendo la información oficial de la publicación "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI. Para ello es importante tomar en cuenta que la población distrital de Cahuacho, jurisdicción donde se ubica el AISD en cuestión, es de 610 personas, y que la PET (de 14 años a más) al mismo nivel está conformada por 461 personas.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'b. Población Económicamente Activa (PEA)',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'La Población Económicamente Activa (PEA) constituye un indicador fundamental para comprender la dinámica económica y social de cualquier jurisdicción al nivel que se requiera. En este apartado, se presenta una descripción de la PEA del distrito de Cahuacho, jurisdicción que abarca a las poblaciones de la CC Ayroca. Para ello, se emplea la fuente "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI, con el cual se puede visualizar las características demográficas de la población en capacidad de trabajar en el distrito en cuestión.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Cuadro N° 3. 8',
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: 'Conformación de la PEA y No PEA, según sexo – Distrito Cahuacho (2017)',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));
    const tablaPEA = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Categorías', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Sexo', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Sexo', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Casos', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Porcentaje', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Hombres', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Porcentaje', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Mujeres', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Porcentaje', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'PEA' })] }),
            new TableCell({ children: [new Paragraph({ text: '184' })] }),
            new TableCell({ children: [new Paragraph({ text: '77,31 %' })] }),
            new TableCell({ children: [new Paragraph({ text: '92' })] }),
            new TableCell({ children: [new Paragraph({ text: '41,26 %' })] }),
            new TableCell({ children: [new Paragraph({ text: '276' })] }),
            new TableCell({ children: [new Paragraph({ text: '59,87 %' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'No PEA' })] }),
            new TableCell({ children: [new Paragraph({ text: '54' })] }),
            new TableCell({ children: [new Paragraph({ text: '22,69 %' })] }),
            new TableCell({ children: [new Paragraph({ text: '131' })] }),
            new TableCell({ children: [new Paragraph({ text: '58,74 %' })] }),
            new TableCell({ children: [new Paragraph({ text: '185' })] }),
            new TableCell({ children: [new Paragraph({ text: '40,13 %' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Total' })] }),
            new TableCell({ children: [new Paragraph({ text: '238' })] }),
            new TableCell({ children: [new Paragraph({ text: '100,00 %' })] }),
            new TableCell({ children: [new Paragraph({ text: '223' })] }),
            new TableCell({ children: [new Paragraph({ text: '100,00 %' })] }),
            new TableCell({ children: [new Paragraph({ text: '461' })] }),
            new TableCell({ children: [new Paragraph({ text: '100,00 %' })] }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        bottom: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        left: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        right: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideHorizontal: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideVertical: { size: 1, color: '000000', style: BorderStyle.SINGLE },
      },
    });
    contenido.push(tablaPEA);
    contenido.push(new Paragraph({
      text: 'FUENTE: Resultados Definitivos de la Población Económicamente Activa 2017 – INEI 2018',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Del cuadro precedente, se aprecia que la PEA del distrito de Cahuacho representa un 59,87 % del total de la PET de la jurisdicción, mientras que la No PEA abarca el 40,13 % restante. Asimismo, se visualiza que los hombres se encuentran predominantemente dentro del indicador de PEA con un 77,31 %; mientras que, en el caso de las mujeres, se hallan mayormente en el indicador de No PEA (58,74 %).',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'b.1. Situación del empleo (independiente o dependiente)',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En la CC Ayroca, la mayor parte de la población se dedica a actividades económicas de carácter independiente, siendo la ganadería la principal fuente de sustento. De manera complementaria, también se desarrolla la agricultura. Esta realidad implica que la mayoría de los comuneros se dediquen al trabajo por cuenta propia, centrado en la crianza de vacunos y ovinos como las principales especies ganaderas. Estas actividades son claves para la economía local, siendo la venta de ganado y sus derivados una fuente de ingresos importante para las familias. En el ámbito agrícola, las tierras comunales se destinan a la producción de cultivos como la papa, habas y cebada, productos que se destinan principalmente al autoconsumo y de manera esporádica a la comercialización en mercados cercanos.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'El empleo dependiente en la CC Ayroca es mínimo y se encuentra limitado a aquellos que trabajan en instituciones públicas. Entre ellos se encuentran los docentes que laboran en las instituciones educativas locales, así como el personal que presta servicios en el puesto de salud. Estas ocupaciones representan un pequeño porcentaje de la fuerza laboral, ya que la mayoría de los comuneros siguen trabajando en actividades tradicionales como la ganadería y la agricultura, que forman parte de su modo de vida ancestral.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'b.2. Ingresos de la población',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En la CC Ayroca, los ingresos de la población provienen principalmente de las actividades ganaderas y agrícolas, que son las fuentes económicas predominantes en la localidad. La venta de vacunos y ovinos, así como de productos agrícolas como papa, habas y cebada, proporciona ingresos variables, dependiendo de las condiciones climáticas y las fluctuaciones en los mercados locales. Sin embargo, debido a la dependencia de estos sectores primarios, los ingresos no son estables ni regulares, y pueden verse afectados por factores como las heladas, la falta de pasto en épocas de sequía o la baja demanda de los productos en el mercado.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Otra parte de los ingresos proviene de los comuneros que participan en actividades de comercio de pequeña escala, vendiendo sus productos en mercados locales o en ferias regionales. No obstante, esta forma de generación de ingresos sigue siendo limitada y no representa una fuente principal para la mayoría de las familias. En cuanto a los pocos habitantes que se encuentran empleados de manera dependiente, tales como los maestros en las instituciones educativas y el personal del puesto de salud, sus ingresos son más regulares, aunque representan una porción muy pequeña de la población.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Adicionalmente, cabe mencionar que, según el informe del PNUD 2019, el distrito de Cahuacho (jurisdicción que abarca a los poblados que conforman la CC Ayroca) cuenta con un ingreso familiar per cápita de S/. 391,06 mensuales, ocupando el puesto N°1191 en el ranking de dicha variable, lo que convierte a dicha jurisdicción en una de las que cuentan con menor ingreso familiar per cápita en todo el país.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'b.3. Índice de desempleo',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'El índice de desempleo es un indicador clave para evaluar la salud económica de una jurisdicción de cualquier nivel, ya que refleja la proporción de la Población Económicamente Activa (PEA) que se encuentra en busca de empleo, pero no logra obtenerlo. En este ítem, se caracteriza el índice de desempleo del distrito de Cahuacho, el cual abarca los poblados de la CC Ayroca. Para ello, se emplea la fuente "Resultados Definitivos de la Población Económicamente Activa 2017" del INEI, con el cual se puede visualizar las características demográficas de la población que forma parte de la PEA y distinguir entre sus subgrupos (Ocupada y Desocupada).',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Cuadro N° 3. 9',
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: 'Conformación de la PEA Ocupada y Desocupada, según sexo – Distrito Cahuacho (2017)',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));
    const tablaPEAOcupada = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Categorías', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Sexo', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Sexo', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Casos', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Porcentaje', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Hombres', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Porcentaje', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Mujeres', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Porcentaje', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'PEA Ocupada' })] }),
            new TableCell({ children: [new Paragraph({ text: '180' })] }),
            new TableCell({ children: [new Paragraph({ text: '97,83 %' })] }),
            new TableCell({ children: [new Paragraph({ text: '87' })] }),
            new TableCell({ children: [new Paragraph({ text: '94,57 %' })] }),
            new TableCell({ children: [new Paragraph({ text: '267' })] }),
            new TableCell({ children: [new Paragraph({ text: '96,74 %' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'PEA Desocupada' })] }),
            new TableCell({ children: [new Paragraph({ text: '4' })] }),
            new TableCell({ children: [new Paragraph({ text: '2,17 %' })] }),
            new TableCell({ children: [new Paragraph({ text: '5' })] }),
            new TableCell({ children: [new Paragraph({ text: '5,43 %' })] }),
            new TableCell({ children: [new Paragraph({ text: '9' })] }),
            new TableCell({ children: [new Paragraph({ text: '3,26 %' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Total' })] }),
            new TableCell({ children: [new Paragraph({ text: '184' })] }),
            new TableCell({ children: [new Paragraph({ text: '100,00 %' })] }),
            new TableCell({ children: [new Paragraph({ text: '92' })] }),
            new TableCell({ children: [new Paragraph({ text: '100,00 %' })] }),
            new TableCell({ children: [new Paragraph({ text: '276' })] }),
            new TableCell({ children: [new Paragraph({ text: '100,00 %' })] }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        bottom: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        left: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        right: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideHorizontal: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideVertical: { size: 1, color: '000000', style: BorderStyle.SINGLE },
      },
    });
    contenido.push(tablaPEAOcupada);
    contenido.push(new Paragraph({
      text: 'FUENTE: Resultados Definitivos de la Población Económicamente Activa 2017 – INEI 2018',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Del cuadro precedente, se halla que en el distrito de Cahuacho la PEA Desocupada representa un 3,26 % del total de la PEA. En adición a ello, se aprecia que tanto hombres como mujeres se encuentran predominantemente en el indicador de PEA Ocupada, con porcentajes de 97,83 % y 94,57 %, respectivamente.',
      spacing: { after: 200 },
    }));

    contenido.push(this.crearTitulo('A.1.4. Actividades económicas de la población', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'Las actividades económicas de la población son un reflejo de los patrones de producción, consumo y empleo en una localidad o jurisdicción determinada. En este ítem, se describe las ocupaciones principales existentes en los poblados de la CC Ayroca, que forma parte del AISD.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'A partir de fuentes oficiales, se exploran las principales labores y ocupaciones más relevantes dentro de la CC Ayroca. En esta ocasión, se recurre a los datos provistos por la Plataforma Nacional de Datos Georreferenciados – Geo Perú.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 10', 'PEA Ocupada según ocupaciones principales – CC Ayroca (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Trabajador independiente o por cuenta propia', '59', '77,63 %'],
        ['Obrero', '12', '15,79 %'],
        ['Empleado', '5', '6,58 %'],
        ['Empleador o patrono', '0', '0,00 %'],
        ['Trabajador en negocio de un familiar', '0', '0,00 %'],
        ['Trabajador del hogar', '0', '0,00 %'],
        ['Total', '76', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'Fuente: Plataforma Nacional de Datos Georreferenciados – Geo Perú';
    contenido.push(new Paragraph({
      text: 'Del cuadro anterior, se aprecia que, al momento de la aplicación de los Censos Nacionales 2017, la ocupación más frecuente dentro de la CC Ayroca es la de "Trabajador independiente o por cuenta propia" con un 77,63 %. Las siguientes ocupaciones que se hallan son la de obrero (15,79 %) y empleado (6,58 %). Ello se condice con las entrevistas aplicadas en campo, puesto que se recolectó información que indica que la mayor parte de la población se dedica a las actividades agropecuarias de subsistencia de manera independiente o por cuenta propia.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'a. Ganadería',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En la CC Ayroca, la ganadería es la actividad económica predominante, con un 80 % de la producción destinada al autoconsumo familiar y un 20 % a la venta, según los entrevistados. Las principales especies que se crían son los vacunos y los ovinos, aunque también se crían caprinos y animales menores como gallinas y cuyes. El precio del ganado en pie varía dependiendo de la especie: los vacunos se venden entre S/. 1 200 y S/. 1 500, los ovinos entre S/. 180 y S/. 200, las gallinas entre S/. 20 y S/. 30, y los cuyes entre S/. 25 y S/. 30.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'La alimentación del ganado se basa principalmente en pasto natural, aunque también se les proporciona pasto cultivable en las temporadas de escasez. Uno de los productos derivados más importantes es el queso, el cual se destina particularmente a la capital provincial de Caravelí para la venta; también se elabora yogurt, aunque en menor medida.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'A pesar de la importancia de esta actividad para la economía local, la ganadería enfrenta diversas problemáticas. Entre las principales están la falta de especialistas en salud veterinaria, así como los desafíos climáticos, especialmente las heladas, que pueden reducir la disponibilidad de pastos y generar pérdidas en los rebaños. Estas dificultades impactan directamente en la productividad y los ingresos de los comuneros ganaderos.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 11', 'Población pecuaria promedio y precios de venta – CC Ayroca',
      ['Especie', 'Cantidad promedio por familia', 'Venta por unidad'],
      [
        ['Vacuno', '4 – 50', 'S/. 1 200 – S/. 1 500'],
        ['Ovino', '5 – 7', 'S/. 180 – S/. 200'],
        ['Gallinas', '5 – 10', 'S/. 20 – S/. 30'],
        ['Cuyes', '15 – 20', 'S/. 25 – S/. 30'],
      ]
    ));
    contenido.push(...await this.agregarFotografia('3. 4', 'Ganado vacuno en la CC Ayroca'));
    contenido.push(...await this.agregarFotografia('3. 4', 'Ganado ovino y caprino en la CC Ayroca'));
    contenido.push(new Paragraph({
      text: 'b. Agricultura',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En la CC Ayroca, la agricultura desempeña un papel complementario a la ganadería, y la mayor parte de la producción, cerca de un 95 % según los entrevistados, se destina al autoconsumo, mientras que solo un 5 % se comercializa. Los principales cultivos son la papa, habas, cebada y forraje (como avena y alfalfa), los cuales son esenciales para la dieta de las familias comuneras y en menor medida para la alimentación del ganado. Estos productos se cultivan en pequeñas parcelas, con cada familia disponiendo de un promedio de 1 ½ hectárea de tierra.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'El sistema de riego utilizado en la comunidad es principalmente por gravedad, aprovechando las fuentes de agua disponibles en la zona. Sin embargo, la actividad agrícola enfrenta serios desafíos, como las heladas, que dañan los cultivos durante las temporadas frías, y las sequías, que disminuyen la disponibilidad de agua, afectando la capacidad productiva de las familias. Adicionalmente, se enfrentan plagas y enfermedades como roedores y el gusano blanco. Estas problemáticas, recurrentes en el ciclo agrícola, limitan tanto la cantidad como la calidad de los productos cosechados.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 12', 'Características de la Agricultura – CC Ayroca',
      ['Categoría', 'Detalle'],
      [
        ['Destino de la producción\n(aprox.)', 'Autoconsumo: 95 %\nVenta: 5 %'],
        ['Tipos de Cultivo', 'Papa, haba, cebada, avena, alfalfa'],
        ['Cantidad de área para cultivar (en Ha) por familia', '1 ½ ha.'],
        ['Tipo de Riego', 'Gravedad'],
        ['Mercado o lugares de venta', 'Comunalmente\nCapital provincial de Caravelí'],
        ['Problemáticas principales', 'Heladas\nSequías\nPlagas y enfermedades'],
      ]
    ));
    contenido.push(...await this.agregarFotografia('3. 5', 'Parcela agrícola en el anexo Ayroca'));
    contenido.push(...await this.agregarFotografia('3. 5', 'Sector agrícola en la CC Ayroca'));
    contenido.push(new Paragraph({
      text: 'c. Mercado y comercialización de productos',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Dentro de la CC Ayroca no existe un mercado local donde se puedan comercializar los productos agrícolas o ganaderos directamente. Toda la venta de estos productos se realiza a través de intermediarios que visitan la comunidad en busca de animales en pie o productos como el queso. Estos intermediarios suelen establecer los precios de compra, lo que limita la capacidad de los comuneros para negociar y obtener un valor justo por su producción.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Esta dependencia de los intermediarios presenta diversas dificultades. Por un lado, los comuneros reciben precios más bajos en comparación con los que podrían obtener si tuvieran acceso directo a mercados más grandes o si contaran con un punto de venta dentro de la comunidad. Además, el transporte de los productos fuera de la comunidad aumenta los costos logísticos, afectando la rentabilidad de las actividades económicas. Este sistema de comercialización se traduce en una vulnerabilidad económica para las familias, ya que dependen de las condiciones impuestas por terceros para la venta de sus bienes.',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 6', 'Comercio ambulatorio en el anexo Ayroca'));
    contenido.push(new Paragraph({
      text: 'd. Hábitos de consumo',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En la CC Ayroca, los hábitos de consumo se caracterizan por una dieta basada principalmente en productos que se adquieren de comerciantes que visitan la comunidad periódicamente (quincenalmente, en promedio), así como en pequeñas bodegas locales. Entre los alimentos más consumidos destacan los abarrotes como el arroz, maíz y fideos, que forman parte esencial de la alimentación diaria de las familias. Estos productos son complementados con la producción local de papa y habas, que también son alimentos fundamentales en la dieta.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'El consumo de papa y habas es especialmente importante, ya que ambos son productos locales y tradicionales, que no solo se destinan al autoconsumo, sino que también forman parte de la base alimentaria debido a su disponibilidad y bajo costo. La producción de estos alimentos es continua, lo que asegura su presencia en la mayoría de los hogares. Dentro de la CC Ayroca resaltan algunos platos tradicionales como el "revuelto de habas", cuy chactado y el chicharrón. Por otra parte, también destaca el consumo de frutas que son obtenidas a través de los comerciantes que visitan la comunidad, los cuales ofrecen productos adicionales como verduras y prendas en determinadas ocasiones.',
      spacing: { after: 200 },
    }));

    contenido.push(this.crearTitulo('A.1.5. Viviendas', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'Según la plataforma REDINFORMA del MIDIS, en los poblados que conforman la CC Ayroca se hallan un total de 90 viviendas empadronadas. De estas, solamente 61 se encuentran ocupadas, representando un 67,78 %. Cabe mencionar que, para poder describir el acápite de estructura de las viviendas de esta comunidad, así como la sección de los servicios básicos, se toma como conjunto total a las viviendas ocupadas.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 13', 'Condición de ocupación de las viviendas – CC Ayroca (2017)',
      ['Condición de ocupación', 'Casos', 'Porcentaje'],
      [
        ['Viviendas ocupadas', '61', '67,78 %'],
        ['Viviendas con otra condición', '29', '32,22 %'],
        ['Total', '90', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)';
    contenido.push(new Paragraph({
      text: 'a. Estructura',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Según la información recabada de los Censos Nacionales 2017, dentro de la CC Ayroca, el material más empleado para la construcción de las paredes de las viviendas es el adobe, pues representa el 98,36 %. A ello le complementa el material de triplay / calamina / estera (1,64 %).',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Respecto a los techos, destacan principalmente las planchas de calamina, fibra de cemento o similares con un 96,72 %. El porcentaje restante consiste en triplay / estera / carrizo (1,64 %) y en tejas (1,64 %).',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Finalmente, en cuanto a los pisos, la mayoría están hechos de tierra (95,08 %). Por otra parte, el porcentaje restante (4,92 %) consiste en cemento.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Cuadro N° 3. 14',
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: 'Tipos de materiales de las viviendas – CC Ayroca (2017)',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));
    const tablaMateriales = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Categorías', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Tipos de materiales', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Casos', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Porcentaje', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Materiales de las paredes de las viviendas' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Adobe' })] }),
            new TableCell({ children: [new Paragraph({ text: '60' })] }),
            new TableCell({ children: [new Paragraph({ text: '98,36 %' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Triplay / calamina / estera' })] }),
            new TableCell({ children: [new Paragraph({ text: '1' })] }),
            new TableCell({ children: [new Paragraph({ text: '1,64 %' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Total', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '61', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '100,00 %', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Materiales de los techos de las viviendas' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Planchas de calamina, fibra de cemento o similares' })] }),
            new TableCell({ children: [new Paragraph({ text: '59' })] }),
            new TableCell({ children: [new Paragraph({ text: '96,72 %' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Triplay / estera / carrizo' })] }),
            new TableCell({ children: [new Paragraph({ text: '1' })] }),
            new TableCell({ children: [new Paragraph({ text: '1,64 %' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Tejas' })] }),
            new TableCell({ children: [new Paragraph({ text: '1' })] }),
            new TableCell({ children: [new Paragraph({ text: '1,64 %' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Total', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '61', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '100,00 %', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Materiales de los pisos de las viviendas' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Tierra' })] }),
            new TableCell({ children: [new Paragraph({ text: '58' })] }),
            new TableCell({ children: [new Paragraph({ text: '95,08 %' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Cemento' })] }),
            new TableCell({ children: [new Paragraph({ text: '3' })] }),
            new TableCell({ children: [new Paragraph({ text: '4,92 %' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Total', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '61', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '100,00 %', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        bottom: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        left: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        right: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideHorizontal: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideVertical: { size: 1, color: '000000', style: BorderStyle.SINGLE },
      },
    });
    contenido.push(tablaMateriales);
    contenido.push(new Paragraph({
      text: 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 6', 'Estructura de las viviendas en el anexo Ayroca'));

    contenido.push(this.crearTitulo('A.1.6. Servicios básicos: Electricidad, energía y/o combustible, tecnología y comunicaciones', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'Los servicios básicos nos indican el nivel de desarrollo de una comunidad y un saneamiento deficiente va asociado a la transmisión de enfermedades como el cólera, la diarrea, la disentería, la hepatitis A, la fiebre tifoidea y la poliomielitis, y agrava el retraso del crecimiento. En 2010, la Asamblea General de las Naciones Unidas reconoció que el acceso al agua potable salubre y limpia, y al saneamiento es un derecho humano y pidió que se realizaran esfuerzos internacionales para ayudar a los países a proporcionar agua potable e instalaciones de saneamiento salubres, limpias, accesibles y asequibles. Los servicios básicos serán descritos a continuación tomando como referencia el total de viviendas con ocupantes presentes (61), tal como realiza el Censo Nacional 2017.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'a. Servicios de agua',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Respecto al servicio de agua para consumo humano en la CC Ayroca, se cuenta con cobertura regular de dicho recurso en las viviendas. Es así que, según la plataforma REDINFORMA, un 91,80 % de las viviendas cuenta con abastecimiento de agua por red pública. Ninguna vivienda cuenta con abastecimiento por pilón, mientras que el 8,20 % restante no se abastece por ninguno de estos dos medios.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 15', 'Tipos de abastecimiento de agua en las viviendas – CC Ayroca (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Viviendas con abastecimiento de agua por red pública', '56', '91,80 %'],
        ['Viviendas con abastecimiento de agua por pilón', '0', '0,00 %'],
        ['Viviendas sin abastecimiento de agua por los medios mencionados', '5', '8,20 %'],
        ['Total', '61', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)';
    contenido.push(new Paragraph({
      text: 'De las entrevistas aplicadas durante el trabajo de campo, se obtuvo la información de que la institución responsable de la administración del servicio de abastecimiento de agua y de su respectivo mantenimiento es la JASS Ayroca. Esta junta lleva a cabo una cloración del recurso hídrico para el consumo de las familias de la CC Ayroca y también realiza el cobro de una cuota mensual de S/. 4 para poder contar con recursos económicos y desarrollar sus actividades.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'b. Servicios básicos de desagüe',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Respecto al servicio de saneamiento en las viviendas de la CC Ayroca, se cuenta con cobertura regular. Es así que, según la plataforma REDINFORMA, un 77,05 % de las viviendas cuenta con saneamiento vía red pública. Ninguna vivienda tiene saneamiento vía pozo séptico, mientras que el 22,95 % restante no posee saneamiento por vía de los dos medios mencionados.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 16', 'Tipos de saneamiento en las viviendas – CC Ayroca (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Viviendas con saneamiento vía red pública', '47', '77,05 %'],
        ['Viviendas con saneamiento vía pozo séptico', '0', '0,00 %'],
        ['Viviendas sin saneamiento vía los medios mencionados', '14', '22,95 %'],
        ['Total', '61', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)';
    contenido.push(new Paragraph({
      text: 'Por medio de las entrevistas aplicadas, se recolectó la información de que la institución responsable de la administración del servicio de desagüe por red pública y de su mantenimiento es, al igual que con el agua, la JASS Ayroca. Las excretas son destinadas a una poza de oxidación, ubicada fuera del entorno urbano del anexo Ayroca.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'c. Gestión y destino de los desechos sólidos',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'La gestión de los desechos sólidos está a cargo de la Municipalidad Distrital de Cahuacho, aunque según los entrevistados, la recolección se realiza de manera mensual, en promedio. En ese sentido, no existe una fecha establecida en la que la municipalidad gestione los desechos sólidos. Adicional a ello, las limitaciones en cuanto a infraestructura adecuada para el tratamiento de desechos sólidos generan algunos retos en la gestión eficiente de los mismos.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Cuando los desechos sólidos son recolectados, estos son trasladados a un botadero cercano a la comunidad, donde se realiza su disposición final. La falta de un sistema más avanzado para el tratamiento de los residuos, como plantas de reciclaje o de tratamiento, dificulta el manejo integral de los desechos y plantea preocupaciones ambientales a largo plazo.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Además, la comunidad enfrenta desafíos derivados de la acumulación de basura en ciertos puntos, especialmente en épocas en que la recolección es menos frecuente. Ante ello, la misma población acude al botadero para disponer sus residuos sólidos, puesto que está prohibida la incineración. Cabe mencionar que sí existen puntos dentro del anexo Ayroca en donde la población puede disponer sus desechos plásticos como botellas, aunque estos tampoco son recolectados frecuentemente por el personal de la municipalidad.',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 7', 'Contenedor de residuos sólidos y plásticos en el anexo Ayroca'));
    contenido.push(new Paragraph({
      text: 'd. Electricidad',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Se puede apreciar una amplia cobertura de alumbrado eléctrico en las viviendas de la comunidad campesina en cuestión. Según la plataforma REDINFORMA, se cuenta con los siguientes datos: el 90,16 % de las viviendas cuenta con alumbrado eléctrico, mientras que el 9,84 % restante no tiene el referido servicio.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 17', 'Cobertura de alumbrado eléctrico en las viviendas – CC Ayroca (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Viviendas con acceso a electricidad', '55', '90,16 %'],
        ['Viviendas sin acceso a electricidad', '6', '9,84 %'],
        ['Total', '61', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)';
    contenido.push(new Paragraph({
      text: 'Adicionalmente, con las entrevistas semiestructuradas se pudo validar que la empresa responsable de la provisión del servicio eléctrico y su respectivo mantenimiento es ADINELSA. Asimismo, según los entrevistados, el costo promedio por este servicio ronda entre S/. 20 y S/. 40 de acuerdo al medidor de cada vivienda. Por otro lado, cabe mencionar que son pocas las familias dentro de la CC Ayroca que cuentan con vale FISE.',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 8', 'Infraestructura eléctrica en el anexo Ayroca'));
    contenido.push(new Paragraph({
      text: 'e. Energía para cocinar',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En la CC Ayroca, el principal combustible utilizado para cocinar es la leña. Este recurso es ampliamente aprovechado por las familias, quienes lo obtienen y almacenan para su uso diario en la preparación de alimentos. La disponibilidad constante de leña hace que sea el combustible preferido debido a su bajo costo y fácil acceso, lo que contribuye a su uso extendido en los hogares de la comunidad. La costumbre de emplear leña también está vinculada a prácticas ancestrales, en las que se ha recurrido a los recursos locales para la subsistencia.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'De manera complementaria, las familias también adquieren balones de gas (GLP) para cocinar, especialmente en situaciones puntuales o cuando tienen la posibilidad económica de acceder a este recurso. Sin embargo, el uso del gas sigue siendo limitado, puesto que su disponibilidad no está presente permanentemente, lo que hace que la mayoría de la población continúe dependiendo de los recursos naturales más accesibles, como la leña.',
      spacing: { after: 200 },
    }));

    contenido.push(this.crearTitulo('A.1.7. Infraestructura en transportes y comunicaciones', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'a. Transporte',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En la CC Ayroca, la infraestructura de transporte es limitada. Dentro de la comunidad solo se encuentran trochas carrozables que permiten llegar al anexo Ayroca. Estas vías facilitan el acceso en vehículos, pero son de tierra y no están pavimentadas, lo que dificulta el tránsito en épocas de lluvias o durante el invierno. Los demás puntos poblados dentro de la comunidad también son accesibles mediante trochas carrozables, aunque en condiciones más precarias que las principales que permiten el acceso al anexo o centro administrativo comunal.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Por otro lado, no existen empresas de transporte formalmente establecidas dentro de la comunidad. Sin embargo, existe un servicio de transporte frecuente que es provisto por una combi todos los días lunes. El único destino de esta movilidad es la ciudad de Caravelí, a la cual parte cerca de las 10:30 am desde la capital distrital de Cahuacho. El costo por este servicio varía entre S/. 25 y S/. 30 por trayecto, dependiendo de la demanda y las condiciones del viaje. Es así que esta es la única opción que tienen los comuneros para desplazarse a ciudades más grandes.',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 6', 'Infraestructura de transporte en la CC Ayroca'));
    contenido.push(new Paragraph({
      text: 'b. Telecomunicaciones',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En la CC Ayroca, la infraestructura en telecomunicaciones presenta algunas limitaciones, aunque existen servicios disponibles para la población. En cuanto a radiodifusión, no es posible captar señal de emisoras provinciales o nacionales. Respecto a la señal de televisión, la comunidad cuenta con acceso a América TV (canal 4) a través de señal abierta, gracias a una antena de la municipalidad que retransmite este canal, lo que garantiza una opción de entretenimiento y noticias. Adicionalmente, algunas familias tienen contratado el servicio de DIRECTV, el cual brinda acceso a televisión satelital.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En lo que respecta a la telefonía móvil, la cobertura es restringida y solo las operadoras de Movistar y Entel logran captar señal en la comunidad, lo cual limita las opciones de comunicación para los habitantes. Por otro lado, el acceso a internet depende únicamente de Movistar, ya que los comuneros solo pueden conectarse a través de los datos móviles proporcionados por esta empresa. Además, cabe mencionar que, si bien existe acceso a internet, la calidad y estabilidad de la conexión pueden ser deficientes, especialmente en las zonas más alejadas dentro de la comunidad.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 19', 'Servicios de telecomunicaciones – CC Ayroca',
      ['Medio de comunicación', 'Descripción'],
      [
        ['Emisoras de radio', '--'],
        ['Señales de televisión', 'América TV\nDIRECTV'],
        ['Señales de telefonía móvil', 'Movistar\nEntel'],
        ['Señal de Internet', 'Movistar'],
      ]
    ));
    contenido.push(...await this.agregarFotografia('3. 9', 'Vivienda con antena de DIRECTV en el anexo Ayroca'));

    contenido.push(this.crearTitulo('A.1.8. Infraestructura en salud, educación, recreativa y deportiva', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'a. Infraestructura en salud',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Dentro de la CC Ayroca se encuentra un puesto de salud, que está bajo la gestión directa del MINSA. Este establecimiento es de categoría I – 2 y brinda atención primaria a los habitantes de la comunidad. En la actualidad, se viene ofreciendo tres servicios con carácter permanente: medicina, obstetricia y enfermería; aunque también se coordina en conjunto con la MICRORED la realización de campañas de salud como psicología y salud bucal. No obstante, ante casos de mayor complejidad, la población es derivada a establecimientos de mayor categoría, principalmente ubicados en la ciudad de Caravelí.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 20', 'Principales características del Puesto de Salud Ayroca',
      ['Categoría', 'Descripción'],
      [
        ['Nombre', 'Puesto de Salud Ayroca'],
        ['Ubicación', 'Ayroca – Cahuacho – Caravelí – Arequipa'],
        ['Director Médico y/o Responsable de la Atención de Salud', 'Daniela Manuel Sivinche'],
        ['Código Único de IPRESS', '00001379'],
        ['Categoría del EESS', 'I – 2'],
        ['Tipo de Establecimiento de Salud', 'Establecimiento de salud sin internamiento'],
        ['Nombre de la subcategoría (Clasificación)', 'Puestos de salud o postas médicas'],
        ['Estado del EESS', 'Activo'],
        ['Condición del EESS', 'Activo'],
        ['Nombre de DISA/DIRESA', 'DIRESA Arequipa'],
        ['Nombre de RED', 'Camaná – Caravelí'],
        ['Nombre de MICRORED', 'Caravelí'],
        ['Institución a la que pertenece el establecimiento', 'MINSA'],
        ['Teléfono del establecimiento', '944 649 039\n(Obstetra Daniela Núñez)'],
        ['Grupo objetivo', 'Población general'],
        ['Número de ambientes con los que cuenta el establecimiento', '8'],
        ['Horario de atención', '08:00 – 20:00'],
        ['Número de atenciones mensuales', '400'],
        ['Infraestructura y servicios', '• El establecimiento cuenta con los servicios básicos de agua, desagüe y electricidad.\n• Se cuenta con paneles solares que permiten la refrigeración de vacunas.\n• No tiene acceso a Internet.\n• Los desechos sólidos comunes son recogidos por la municipalidad (mensualmente), mientras que los biocontaminados por la RED.\n• La infraestructura del establecimiento consta de bloquetas en las paredes, calamina en los techos y cerámicos en los pisos.\n• El personal del establecimiento está conformado por cinco miembros: médico, obstetra, enfermera, y dos técnicos en enfermería.\n• Entre los servicios que se brindan se hallan los siguientes: medicina, obstetricia y enfermería. De manera complementaria se coordina campañas de psicología y salud bucal con la MICRORED.\n• Se cuenta con una ambulancia de tipo I – 1.'],
      ]
    ));
    contenido.push(...await this.agregarFotografia('3. 10', 'Infraestructura externa del Puesto de Salud Ayroca'));
    contenido.push(new Paragraph({
      text: 'b. Infraestructura en educación',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Dentro de la CC Ayroca se hallan instituciones educativas de los dos primeros niveles de educación básica regular (inicial y primaria). Todas ellas se encuentran concentradas en el anexo Ayroca, el centro administrativo comunal. En base al Censo Educativo 2023, la institución con mayor cantidad de estudiantes dentro de la comunidad es la IE N°40270, la cual es de nivel primaria, con un total de 21 estudiantes. A continuación, se presenta el cuadro con la cantidad de estudiantes por institución educativa y nivel dentro de la localidad en cuestión.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 21', 'Infraestructura educativa – CC Ayroca (2023)',
      ['Nombre de IE', 'Nivel', 'Tipo de Gestión', 'Cantidad de estudiantes', 'Porcentaje'],
      [
        ['IE Ayroca', 'Inicial - Jardín', 'Pública de gestión directa', '5', '19,23 %'],
        ['IE N°40270', 'Primaria', 'Pública de gestión directa', '21', '80,77 %'],
        ['Total', '', '', '26', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censo Educativo 2023 – ESCALE (MINEDU)';
    contenido.push(new Paragraph({
      text: 'De las entrevistas aplicadas durante el trabajo de campo, se recopiló información de carácter cualitativo de las instituciones educativas de la CC Ayroca. En los cuadros que se presentan a continuación se detallan características de cada una de ellas para el año 2024.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 22', 'Características y datos – IE Ayroca',
      ['Categoría', 'Descripción'],
      [
        ['Tipo de I.E.', 'Pública de gestión directa, mixta'],
        ['Nombre del(la) director(a)', 'María Elena Aguayo Arias'],
        ['Características y observaciones', '• La institución educativa data del año 1989, aproximadamente.\n• La directora de la institución es a la vez profesora de los alumnos (unidocente). Se dispone de una sola aula.\n• El establecimiento cuenta con los servicios básicos de agua, desagüe y electricidad.\n• No tiene acceso a Internet.\n• Se clasifican los residuos sólidos, pero estos no son recolectados frecuentemente por la municipalidad.\n• La infraestructura consta de material noble en las paredes, calamina en los techos y mayólica en los pisos.\n• Se cuenta con el ambiente para la cocina y el comedor, pero hace falta la implementación del mismo.\n• No se cuenta con una biblioteca, por lo que se improvisa con un pequeño estante.\n• Los juegos recreativos de la institución se encuentran en condiciones precarias, puesto que se hallan oxidados.\n• Se halla una pequeña losa deportiva de cemento para que los alumnos puedan desarrollar actividad física.'],
      ]
    ));
    contenido.push(...this.crearTablaConDatos('3. 23', 'Características y datos – IE N°40270',
      ['Categoría', 'Descripción'],
      [
        ['Tipo de I.E.', 'Pública de gestión directa, mixta'],
        ['Nombre del(la) director(a)', 'Nieves Bernaola Torres'],
        ['Características y observaciones', '• Se tiene en funcionamiento dos aulas, cada una es dirigida por una docente. Una de ellas es, a la vez, directora de la institución educativa.\n• La infraestructura de las aulas consta principalmente de material noble en las paredes, calamina en los techos y mayólica en los pisos.\n• La institución cuenta con los servicios básicos de agua, desagüe y electricidad.\n• No tiene acceso a Internet.\n• Se cuenta con una cocina y un comedor, en un solo ambiente compartido.\n• No tiene biblioteca propia, por lo que se ha improvisado con estantes.\n• No se cuenta con una sala de computación, aunque si se posee tabletas electrónicas.\n• Los juegos recreativos de la institución se encuentran en condiciones precarias, puesto que se hallan oxidados.\n• Se halla una losa deportiva de cemento para que los alumnos puedan desarrollar actividad física.'],
      ]
    ));
    contenido.push(new Paragraph({
      text: 'De manera adicional, se presenta la cantidad de alumnos de las dos instituciones educativas dentro de la CC Ayroca según sexo y grado de enseñanza para el año 2024 según las entrevistas aplicadas. Dicha información se encuentra en los cuadros que se muestran a continuación.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Cuadro N° 3. 25',
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: 'Cantidad de alumnos según grado de enseñanza y sexo – IE Ayroca',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));
    const tablaAlumnosIE = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Nombre de IE', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Nivel', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Total', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '3 años', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '4 años', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '5 años', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'IE Ayroca' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Inicial – Jardín' })] }),
            new TableCell({ children: [new Paragraph({ text: 'H', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'M', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'H', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'M', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'H', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'M', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: '5' })] }),
            new TableCell({ children: [new Paragraph({ text: '4' })] }),
            new TableCell({ children: [new Paragraph({ text: '4' })] }),
            new TableCell({ children: [new Paragraph({ text: '2' })] }),
            new TableCell({ children: [new Paragraph({ text: '1' })] }),
            new TableCell({ children: [new Paragraph({ text: '1' })] }),
            new TableCell({ children: [new Paragraph({ text: '0' })] }),
            new TableCell({ children: [new Paragraph({ text: '1' })] }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        bottom: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        left: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        right: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideHorizontal: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideVertical: { size: 1, color: '000000', style: BorderStyle.SINGLE },
      },
    });
    contenido.push(tablaAlumnosIE);
    contenido.push(new Paragraph({
      text: 'FUENTE: GEADES (2024)',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Cuadro N° 3. 26',
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }));
    contenido.push(new Paragraph({
      text: 'Cantidad de alumnos según grado de enseñanza y sexo – IE N°40270',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));
    const tablaAlumnosIE40270 = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Nombre de IE', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Nivel', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'Total', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '1°', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '2°', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '3°', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '4°', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '5°', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: '6°', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'IE N°40270' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Primaria' })] }),
            new TableCell({ children: [new Paragraph({ text: 'H', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'M', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'H', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'M', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'H', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'M', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'H', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'M', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'H', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'M', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'H', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
            new TableCell({ children: [new Paragraph({ text: 'M', alignment: AlignmentType.CENTER })], shading: { fill: 'E6E6E6' } }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: '6' })] }),
            new TableCell({ children: [new Paragraph({ text: '10' })] }),
            new TableCell({ children: [new Paragraph({ text: '0' })] }),
            new TableCell({ children: [new Paragraph({ text: '1' })] }),
            new TableCell({ children: [new Paragraph({ text: '2' })] }),
            new TableCell({ children: [new Paragraph({ text: '1' })] }),
            new TableCell({ children: [new Paragraph({ text: '0' })] }),
            new TableCell({ children: [new Paragraph({ text: '1' })] }),
            new TableCell({ children: [new Paragraph({ text: '0' })] }),
            new TableCell({ children: [new Paragraph({ text: '0' })] }),
            new TableCell({ children: [new Paragraph({ text: '2' })] }),
            new TableCell({ children: [new Paragraph({ text: '3' })] }),
            new TableCell({ children: [new Paragraph({ text: '2' })] }),
            new TableCell({ children: [new Paragraph({ text: '4' })] }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        bottom: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        left: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        right: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideHorizontal: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideVertical: { size: 1, color: '000000', style: BorderStyle.SINGLE },
      },
    });
    contenido.push(tablaAlumnosIE40270);
    contenido.push(new Paragraph({
      text: 'FUENTE: GEADES (2024)',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 12', 'Infraestructura de la IE Ayroca'));
    contenido.push(...await this.agregarFotografia('3. 13', 'Infraestructura de la IE N°40270'));
    contenido.push(new Paragraph({
      text: 'c. Infraestructura en recreación',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Dentro de la CC Ayroca se cuenta con un espacio destinado a la recreación de la población. Este es el parque recreacional público, el cual se ubica entre el puesto de salud y el local comunal. Aquí la población puede reunirse y también cuenta con juegos recreativos destinados a los niños. La siguiente infraestructura es la plaza de toros, que se halla en la zona este del anexo, y es un punto de gran relevancia cultural; en especial, durante las festividades patronales.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En adición a ello, otro espacio de reunión es la plaza central del anexo Ayroca. Este lugar sirve ocasionalmente como punto de encuentro para los comuneros, quienes se reúnen allí de manera informal en momentos importantes o festivos.',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 16', 'Parque recreacional público del anexo Ayroca'));
    contenido.push(...await this.agregarFotografia('3. 16', 'Plaza de toros del anexo Ayroca'));
    contenido.push(...await this.agregarFotografia('3. 16', 'Plaza central del anexo Ayroca'));
    contenido.push(new Paragraph({
      text: 'd. Infraestructura en deporte',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En la CC Ayroca, la infraestructura deportiva es limitada. Los únicos espacios dedicados al deporte son una losa deportiva y un "estadio". Estas infraestructuras son utilizadas principalmente para partidos de fútbol y otros encuentros deportivos informales que se organizan entre los comuneros, especialmente durante festividades locales.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Respecto a la losa deportiva, esta se encuentra hecha a base de cemento. Por otra parte, el "estadio" es un campo de juego de pasto natural de un tamaño más extenso que la losa. No obstante, no cuenta con infraestructura adicional como gradas o servicios higiénicos.',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 17', 'Losa deportiva del anexo Ayroca'));
    contenido.push(...await this.agregarFotografia('3. 17', 'Estadio del anexo Ayroca'));

    contenido.push(this.crearTitulo('A.1.9. Indicadores de salud', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'a. Natalidad y Mortalidad',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'El presente ítem proporciona una visión crucial sobre las dinámicas demográficas, reflejando las tendencias en el crecimiento poblacional. De los datos obtenidos en el Puesto de Salud Ayroca durante el trabajo de campo, se obtiene que en el año 2023 solo ocurrió un nacimiento, mientras que para el 2024 (hasta el 13 de noviembre) se dieron un total de tres (03).',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Respecto a la mortalidad, según la misma fuente, se obtiene que en el año 2023 se registró un fallecimiento, por suicidio; mientras que para el 2024 no ocurrieron decesos dentro de la CC Ayroca, hasta la fecha indicada.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 24', 'Indicadores de natalidad y mortalidad – CC Ayroca',
      ['Año', 'Natalidad', 'Mortalidad'],
      [
        ['2023', '1', '1'],
        ['2024\n(hasta 13/11)', '3', '0'],
      ]
    ));
    contenido.push(new Paragraph({
      text: 'b. Morbilidad',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Según las entrevistas aplicadas en el trabajo de campo, tanto las autoridades locales como los informantes calificados manifestaron que las enfermedades más recurrentes dentro de la CC Ayroca son las infecciones respiratorias agudas (IRAS) y enfermedades diarreicas agudas (EDAS). También se presentan casos de hipertensión y diabetes, aunque estos son más frecuentes en los adultos mayores.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Por otro lado, dentro de los grupos de morbilidad hallados a nivel distrital de Cahuacho (jurisdicción que abarca a los puntos poblados de la CC Ayroca), para el año 2023, se halla que los más frecuentes son las infecciones agudas de las vías respiratorias superiores (1 012 casos) y la obesidad y otros de hiperalimentación (191 casos). Del primero de ellos, se aprecia que se reportaron una mayor cantidad de casos en el bloque etario de 0 a 11 años; mientras que, del segundo, en el rango de 30 a 59 años. En el siguiente cuadro, se presenta la cantidad de casos por grupo de morbilidad y según bloques etarios dentro del distrito según el portal REUNIS del MINSA:',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 25', 'Casos por grupos de morbilidad – Distrito Cahuacho (2023)',
      ['Grupo de Morbilidad', 'Bloques etarios', 'Casos Totales'],
      [
        ['', '0 – 11', '12 – 17', '18 – 29', '30 – 59', '60 – >', ''],
        ['Enfermedades infecciosas intestinales', '55', '6', '9', '59', '49', '178'],
        ['Obesidad y otros de hiperalimentación', '16', '10', '21', '103', '41', '191'],
        ['Infecciones agudas de las vías respiratorias superiores', '348', '93', '111', '327', '133', '1012'],
        ['Enfermedades de la cavidad bucal, de las glándulas salivales y de los maxilares', '6', '5', '11', '33', '8', '63'],
        ['Enfermedades del esófago, del estómago y del duodeno', '1', '9', '18', '58', '67', '153'],
        ['Artropatías', '1', '1', '4', '22', '77', '105'],
        ['Dorsopatías', '0', '3', '7', '60', '70', '140'],
        ['Otras enfermedades del sistema urinario', '6', '2', '8', '44', '28', '88'],
        ['Síntomas y signos que involucran el sistema digestivo y el abdomen', '29', '10', '18', '60', '44', '161'],
        ['Síntomas y signos generales', '32', '4', '7', '16', '21', '80'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: REUNIS (2024)';
    contenido.push(new Paragraph({
      text: 'c. Población afiliada a Seguros de Salud',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Dentro de la CC Ayroca, la mayoría de los habitantes están afiliados a algún tipo de seguro de salud. En primer lugar, se halla el Seguro Integral de Salud (SIS), al cual está afiliado el 84,44 % de la población. En menor medida se hallan aquellos que están afiliados a ESSALUD, pues representan solo un 3,56 %. Respecto a los que no cuentan con ningún tipo de seguro de salud, abarcan el 12,0 %.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 26', 'Población según tipo de seguro de salud afiliado – CC Ayroca (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Seguro Integral de Salud (SIS)', '190', '84,44 %'],
        ['ESSALUD', '8', '3,56 %'],
        ['Ningún seguro', '27', '12,00 %'],
        ['Total referencial', '225', ''],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';

    contenido.push(this.crearTitulo('A.1.10. Indicadores de educación', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'La educación es un pilar fundamental para el desarrollo social y económico de una comunidad. En ese sentido, los indicadores de educación juegan un papel crucial al proporcionar una visión clara del estado actual del sistema educativo y su impacto en la población. Este apartado se centra en dos indicadores clave: el nivel educativo de la población y la tasa de analfabetismo. El análisis de estos indicadores permite comprender mejor las fortalezas y desafíos del sistema educativo local, así como diseñar estrategias efectivas para mejorar la calidad educativa y reducir las desigualdades en el acceso a la educación.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'a. Nivel Educativo de la población',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En la CC Ayroca, el nivel educativo alcanzado por la mayor parte de la población de 15 años a más es la primaria, pues representan el 45,18 %. En segundo lugar, se hallan aquellos que cuentan con secundaria (38,55 %). Por otro lado, la categoría minoritaria corresponde a aquellos con educación superior no universitaria, pues representan solamente un 4,22 %.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 27', 'Población de 15 años a más según nivel educativo alcanzado – CC Ayroca (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Sin nivel o Inicial', '10', '6,02 %'],
        ['Primaria', '75', '45,18 %'],
        ['Secundaria', '64', '38,55 %'],
        ['Superior no Universitaria', '7', '4,22 %'],
        ['Superior Universitaria', '10', '6,02 %'],
        ['Total', '166', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(new Paragraph({
      text: 'b. Tasa de analfabetismo',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En la CC Ayroca, se observa que la cantidad de personas de 15 años a más que no saben leer ni escribir llegan a la cantidad de 15. Esto representa una tasa de analfabetismo del 9,04 % en la comunidad.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 28', 'Tasa de analfabetismo en población de 15 años a más – CC Ayroca (2017)',
      ['Indicador', 'Casos', 'Porcentaje'],
      [
        ['Sabe leer y escribir', '151', '90,96 %'],
        ['No sabe leer ni escribir', '15', '9,04 %'],
        ['Total', '166', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';

    contenido.push(this.crearTitulo('A.1.11. Aspectos culturales (lenguas, dialectos, lugares)', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'a. Idioma',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'La lengua materna es la primera lengua o idioma que aprende una persona. De la data obtenida de la Plataforma Nacional de Datos Georreferenciados – Geo Perú, se aprecia que el castellano es la categoría mayoritaria, pues representa al 82,49 % de la población de 3 años a más. En segundo lugar, se halla el quechua, que es la lengua materna de un 17,05 % de los habitantes.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 29', 'Lenguas maternas en población de 3 años a más – CC Ayroca (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Castellano', '179', '82,49 %'],
        ['Quechua', '37', '17,05 %'],
        ['No sabe / No responde', '1', '0,46 %'],
        ['Total', '217', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Plataforma Nacional de Datos Georreferenciados – Geo Perú';
    contenido.push(new Paragraph({
      text: 'b. Religión',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En la actualidad, la confesión predominante dentro de la CC Ayroca es la católica. Según las entrevistas aplicadas, la permanencia del catolicismo como la religión mayoritaria se debe a la presencia de la iglesia, denominada Iglesia Matriz de Ayroca, y a la inexistencia de templos evangélicos o de otras confesiones.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Esta iglesia es el principal punto de reunión religiosa de la comunidad y juega un rol importante en la vida espiritual de sus habitantes. Otro espacio con gran valor espiritual es el cementerio, en donde los comuneros entierran y visitan a sus difuntos. Este lugar se halla al sur del anexo Ayroca.',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 18', 'Iglesia Matriz del anexo Ayroca'));
    contenido.push(...await this.agregarFotografia('3. 19', 'Cementerio del anexo Ayroca'));
    contenido.push(this.crearTitulo('A.1.12. Uso de los suelos y de los recursos naturales', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'a. Fuentes y usos del agua',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Las fuentes de agua en la CC Ayroca son diversas, dependiendo del uso que se les dé. Para el consumo humano, el agua se obtiene principalmente de los ojos de agua de Quinsa Rumi y Pallalli. En el caso del anexo Ayroca, esta agua es almacenada en un reservorio, desde donde se distribuye a las viviendas locales a través de una red básica de distribución. Aunque el abastecimiento cubre las necesidades esenciales de la población, existen desafíos relacionados con la calidad del agua y el mantenimiento de la infraestructura.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En cuanto al uso agrícola, el agua proviene del río Yuracyacu y la quebrada Pucaccocha, que sirven como una fuente importante de riego. Finalmente, para el uso ganadero, la comunidad se abastece de las diferentes quebradas que se hallan dentro del área de la CC Ayroca, las cuales proporcionan agua para el sustento del ganado local, principalmente vacunos y ovinos.',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 20', 'Reservorio del anexo Ayroca'));
    contenido.push(new Paragraph({
      text: 'b. Tenencia de la tierra, usos del suelo y de los recursos naturales',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En la CC Ayroca, la tenencia de la tierra es comunal, lo que significa que la comunidad en su conjunto es la propietaria de los terrenos superficiales. Los comuneros no son propietarios individuales de la tierra, sino que la comunidad les cede los terrenos en calidad de posesión para que puedan vivir y trabajar en ellos. Este sistema de tenencia comunal busca asegurar el acceso equitativo a los recursos entre los miembros de la comunidad, aunque limita la posibilidad de transacciones privadas de terrenos.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En cuanto a los usos del suelo, la mayor parte del territorio está destinado a las actividades agrícolas y ganaderas, las cuales son el principal sustento económico de la población. La tierra es aprovechada para el cultivo de papa, haba y cebada, y para el pastoreo de vacunos y ovinos. Entre los recursos naturales que se aprovechan destacan la queñua, eucalipto, lloque y tola, que son utilizados como leña para la cocción de alimentos o en la construcción.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Además, según algunos comuneros, dentro del territorio de la comunidad existen diversas hierbas medicinales con efectos positivos para la salud. Entre ellas destacan la huamanripa, llantén, muña y salvia. Estas son utilizadas en un primer nivel de atención antes de acudir al establecimiento de salud local.',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 24', 'Uso de los suelos en el anexo Ayroca'));
    contenido.push(this.crearTitulo('A.1.13. Índice de Desarrollo Humano distrital', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'El Índice de Desarrollo Humano (IDH) mide el logro medio de un país (en nuestro país se mide también a niveles departamentales, provinciales y distritales) tratándose de un índice compuesto. El IDH contiene tres variables: la esperanza de vida al nacer, el logro educacional (alfabetización de adultos y la tasa bruta de matriculación primaria, secundaria y terciaria combinada) y el PIB real per cápita (PPA en dólares). El ingreso se considera en el IDH en representación de un nivel decente de vida y en reemplazo de todas las opciones humanas que no se reflejan en las otras dos dimensiones.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Según el informe del PNUD para el año 2019, el Índice de Desarrollo Humano del distrito de Cahuacho es de 0,3870. Es así que ocupa el puesto N°934 en el país, siendo una de las divisiones políticas de nivel subnacional con uno de los IDH más bajos.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 34', 'Componentes del IDH – Distrito Cahuacho (2019)',
      ['Población', 'Índice de Desarrollo Humano', 'Esperanza de vida al nacer', 'Con Educación secundaria completa (Población 18 años)', 'Años de educación (Población 25 y más)', 'Ingreso familiar per cápita'],
      [
        ['', 'Habitantes', 'Rank', 'IDH', 'Rank', 'Años', 'Rank', 'Porcentaje', 'Rank', 'Años', 'Rank', 'N.S. mes', 'Rank'],
        ['', '762', '1686', '0,3870', '934', '83,27', '29', '55,35', '1010', '6,18', '972', '391,1', '1191'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: PNUD Informe 2019';
    contenido.push(this.crearTitulo('A.1.14. Índice de necesidades básicas insatisfechas distrital', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'En primer lugar, cabe mencionar que en la CC Ayroca se halla un total de 198 personas residentes en viviendas particulares. De este conjunto, se observa que la NBI más frecuente, según población, es la de viviendas con hacinamiento (25,25 %), seguido de la de viviendas sin servicios higiénicos (18,69 %).',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 35', 'Necesidades Básicas Insatisfechas (NBI) según población – CC Ayroca (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Población en Viviendas con características físicas inadecuadas', '5', '2,53 %'],
        ['Población en Viviendas con hacinamiento', '50', '25,25 %'],
        ['Población en Viviendas sin servicios higiénicos', '37', '18,69 %'],
        ['Población en Hogares con niños que no asisten a la escuela', '0', '0,00 %'],
        ['Total referencial', '198', ''],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(new Paragraph({
      text: 'Por otro lado, a nivel distrital de Cahuacho, de un total de 215 unidades de análisis, se sabe que el tipo de NBI más frecuente es la de viviendas sin servicios higiénicos (15,81 %), seguida de la de viviendas con hacinamiento (6,98 %). En ese sentido, se aprecia que el orden de las dos NBI mayoritarias es inverso al comparar a la CC Ayroca con el distrito de Cahuacho.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 36', 'Tipos de NBI existentes – Distrito Cahuacho (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Viviendas con características físicas inadecuadas', '6', '2,79 %'],
        ['Viviendas con hacinamiento', '15', '6,98 %'],
        ['Viviendas sin servicios higiénicos', '34', '15,81 %'],
        ['Hogares con niños que no asisten a la escuela', '0', '0,00 %'],
        ['Hogares con alta dependencia económica', '5', '2,33 %'],
        ['Total referencial', '215', ''],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Perú: Mapa de Necesidades Básicas Insatisfechas (NBI), 1993, 2007 y 2017';
    contenido.push(this.crearTitulo('A.1.15. Organización social y liderazgo', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'La organización social más importante y con mayor poder es la CC Ayroca. Esta comunidad cuenta con una estructura organizativa que incluye una junta directiva, encargada de la gestión y representación legal de la comunidad. Por otra parte, la toma de decisiones clave se realiza en la asamblea general, en la cual participan y votan todos los comuneros activos que están debidamente inscritos en el padrón comunal. Esta asamblea es el máximo órgano de deliberación, donde se discuten temas de interés comunitario, como el uso de la tierra, los proyectos de desarrollo y la organización de actividades económicas y sociales.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Al momento del trabajo de campo, según los entrevistados, se cuenta con 65 comuneros calificados dentro de la CC Ayroca. Estos se encuentran inscritos en el padrón, el cual es actualizado cada dos años antes de cada elección para una nueva junta directiva. Asimismo, cabe mencionar que esta última puede reelegirse por un período adicional, con la posibilidad de que una misma junta pueda gestionar por cuatro años como máximo.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Respecto al rol de la mujer, es posible que estas puedan ser inscritas como comuneras calificadas dentro del padrón comunal. No obstante, solo se permite la inscripción si estas mujeres son viudas o madres solteras. De lo contrario, es el varón quien asume la responsabilidad. Por otra parte, dentro de la estructura interna de la comunidad campesina se cuenta con instancias especializadas como la JASS, la Asociación de Vicuñas y la Junta de Usuarios de Riego. Cada una de ellas cuenta con funciones específicas y sus representantes también son electos democráticamente.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'También se hallan autoridades locales como el teniente gobernador, quien es el representante del gobierno central a nivel local. El teniente gobernador tiene la función de coordinar y mediar entre las instituciones del Estado y la comunidad, así como de velar por el orden público. Asimismo, el agente municipal es responsable de la supervisión y cumplimiento de las normativas municipales, así como de brindar apoyo en la organización de actividades locales.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 37', 'Autoridades y líderes sociales – CC Ayroca',
      ['Organización', 'Cargo', 'Nombres y Apellidos'],
      [
        ['CC Ayroca\n(2024 – 2025)', 'Presidente', 'Miguel Ángel Sayaverde Rospigliosi'],
        ['', 'Vicepresidente', 'Julio Edilberto Ventura Quispe'],
        ['', 'Secretario', 'Emil Mundo Merino Bustamante'],
        ['', 'Tesorero', 'Zarita Juana Sayaverde Bustamante'],
        ['', 'Fiscal', 'Elena Bustamante Rubio'],
        ['', '1° Vocal', 'Agripina Albania Quispe Muñua'],
        ['', '2° Vocal', 'Jhon Omar Cataño Espinoza'],
        ['', '3° Vocal', 'Emerson Jossemar Bustamante Merino'],
        ['JASS Ayroca', 'Presidente', 'Emil Mundo Merino Bustamante'],
        ['Asociación de Vicuñas', 'Presidente', 'Emil Mundo Merino Bustamante'],
        ['Junta de Usuarios de Riego', 'Presidente', 'Roberto Merino Rivera'],
        ['Municipalidad Distrital de Cahuacho', 'Agente municipal', 'Adrián Cataño Ramos'],
        ['Subprefectura Distrital de Cahuacho', 'Teniente gobernador', 'Kelvin Quispe Merino'],
      ]
    ));
    contenido.push(this.crearTitulo('A.1.16. Festividades, Costumbres y Turismo', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'En la CC Ayroca, las festividades son momentos de gran importancia cultural y social que refuerzan los lazos comunitarios y mantienen vivas las tradiciones locales. Entre las celebraciones más destacadas se encuentran los carnavales, que tienen lugar en el mes de febrero. Esta festividad está marcada por el entusiasmo de la población, quienes participan en juegos con agua y desfiles.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Otra celebración significativa es la dedicada a la Virgen de Chapi, que se lleva a cabo cada 1° de mayo. En esta fecha, los devotos organizan misas solemnes, procesiones en honor a la Virgen y actividades sociales que congregan a familias locales y visitantes. Del 3 al 5 de mayo, se celebra la Fiesta de las Cruces, en la que se realizan ceremonias religiosas, procesiones y actividades tradicionales, como la tauromaquia, acompañadas por grupos musicales que animan el ambiente.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En junio, el calendario festivo incluye dos importantes celebraciones: la festividad de San Vicente Ferrer (que es la fiesta patronal principal de la comunidad), que se realiza del 21 al 23 de junio, y el aniversario de la comunidad, celebrado el 24 de junio con actos protocolares, actividades culturales y sociales. Ambas fechas están caracterizadas por su componente religioso, con misas y procesiones, además de eventos que integran a toda la comunidad.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'Una festividad de gran relevancia ambiental y cultural es el Chaku, o esquila de vicuñas, una actividad tradicional vinculada al aprovechamiento sostenible de esta especie emblemática de los Andes. Aunque las fechas de esta celebración suelen variar, se tiene la propuesta de realizarla cada 15 de noviembre, coincidiendo con el Día de la Vicuña. Durante el Chaku, además de la esquila, se realizan actividades culturales, ceremonias andinas y eventos de integración comunitaria.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({
      text: 'En cuanto al potencial turístico, la CC Ayroca destaca no solo por sus festividades tradicionales, sino también por las ruinas arqueológicas de Incahuasi, un sitio de valor histórico y cultural. Este lugar, que guarda vestigios del pasado incaico, representa una oportunidad para atraer visitantes interesados en la historia, la arqueología y el turismo vivencial. La promoción de este recurso puede complementar las festividades y posicionar a la comunidad como un destino atractivo para el turismo sostenible, generando beneficios económicos y culturales para sus habitantes.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 38', 'Festividades principales – CC Ayroca',
      ['Festividad', 'Fecha'],
      [
        ['Carnavales', 'Febrero'],
        ['Virgen de Chapi', '01/05'],
        ['Fiesta de las Cruces', '03/05 – 05/05'],
        ['San Vicente Ferrer', '21/06 – 23/06'],
        ['Aniversario de la CC Ayroca', '24/06'],
      ]
    ));

    contenido.push(this.crearTitulo('3.2. Caracterización socioeconómica del Área de Influencia Social Indirecta (AISI)', HeadingLevel.HEADING_4));
    contenido.push(this.crearTitulo('3.2.1. Centro Poblado Cahuacho', HeadingLevel.HEADING_5));
    contenido.push(...this.crearTablaConDatos('3. 39', 'Ubicación referencial – CP Cahuacho',
      ['Categoría', 'Distrito', 'Provincia', 'Departamento', 'Región', 'País'],
      [
        ['Centro Poblado Cahuacho', 'Cahuacho', 'Caravelí', 'Arequipa', 'Arequipa', 'Perú'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: GEADES (2024)';
    contenido.push(...await this.agregarFotografia('3. 25', 'Vista panorámica del Centro Poblado Cahuacho'));

    contenido.push(this.crearTitulo('A. Aspectos demográficos', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({ text: 'a. Población según sexo', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'Según los Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas, la población del Centro Poblado Cahuacho está compuesta por 564 habitantes, de los cuales 280 son hombres (49,65 %) y 284 son mujeres (50,35 %).',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 40', 'Población por sexo – CP Cahuacho (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Hombres', '280', '49,65 %'],
        ['Mujeres', '284', '50,35 %'],
        ['Total', '564', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(new Paragraph({ text: 'b. Población según grupo etario', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'La población del Centro Poblado Cahuacho se distribuye en diferentes grupos etarios. El grupo más numeroso es el de 15 a 29 años, que representa el 20,21 % de la población total, seguido del grupo de 30 a 44 años con el 18,26 %.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 41', 'Población por grupo etario – CP Cahuacho (2017)',
      ['Grupo etario', 'Casos', 'Porcentaje'],
      [
        ['0 a 4 años', '50', '8,87 %'],
        ['5 a 14 años', '88', '15,60 %'],
        ['15 a 29 años', '114', '20,21 %'],
        ['30 a 44 años', '103', '18,26 %'],
        ['45 a 59 años', '98', '17,38 %'],
        ['60 a más años', '111', '19,68 %'],
        ['Total', '564', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';

    contenido.push(this.crearTitulo('B. Indicadores y distribución de la Población Económicamente Activa por rama de actividad, tipo de empleo, tasas e ingresos.', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({ text: 'a. Población en edad de Trabajar (PET)', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'La Población en Edad de Trabajar (PET) en el Centro Poblado Cahuacho está compuesta por 425 personas, de las cuales 210 son hombres (49,41 %) y 215 son mujeres (50,59 %).',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 42', 'Población en edad de trabajar (PET) – CP Cahuacho (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Hombres', '210', '49,41 %'],
        ['Mujeres', '215', '50,59 %'],
        ['Total', '425', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(new Paragraph({ text: 'b. Población Económicamente Activa (PEA)', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'La Población Económicamente Activa (PEA) en el Centro Poblado Cahuacho está compuesta por 301 personas, de las cuales 150 son hombres (49,83 %) y 151 son mujeres (50,17 %).',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 43', 'Población Económicamente Activa (PEA) – CP Cahuacho (2017)',
      ['Categoría', 'Hombres', 'Mujeres', 'Total', 'Hombres %', 'Mujeres %', 'Total %'],
      [
        ['PEA', '150', '151', '301', '49,83 %', '50,17 %', '100,00 %'],
        ['Ocupados', '145', '148', '293', '49,49 %', '50,51 %', '97,34 %'],
        ['Desocupados', '5', '3', '8', '62,50 %', '37,50 %', '2,66 %'],
        ['PEI', '60', '64', '124', '48,39 %', '51,61 %', ''],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(new Paragraph({ text: 'c. Situación del empleo (dependiente o independiente)', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'En el Centro Poblado Cahuacho, la mayoría de la población ocupada se encuentra en situación de empleo independiente (78,84 %), mientras que el 21,16 % se encuentra en situación de empleo dependiente.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({ text: 'd. Ingresos de la población', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'Los ingresos de la población del Centro Poblado Cahuacho varían según el tipo de actividad económica. La mayoría de la población tiene ingresos menores a S/ 500 mensuales.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({ text: 'e. Índice de Desempleo', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'El índice de desempleo en el Centro Poblado Cahuacho es del 2,66 %, lo que representa a 8 personas desocupadas de un total de 301 personas económicamente activas.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 44', 'Situación del empleo – CP Cahuacho (2017)',
      ['Categoría', 'Hombres', 'Mujeres', 'Total', 'Hombres %', 'Mujeres %', 'Total %'],
      [
        ['Empleo dependiente', '32', '30', '62', '51,61 %', '48,39 %', '21,16 %'],
        ['Empleo independiente', '113', '118', '231', '48,92 %', '51,08 %', '78,84 %'],
        ['Total', '145', '148', '293', '49,49 %', '50,51 %', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';

    contenido.push(this.crearTitulo('C. Actividades económicas de la población', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'Las actividades económicas en el Centro Poblado Cahuacho están principalmente orientadas al comercio, servicios y agricultura. La rama de actividad más importante es el comercio al por mayor y menor, que concentra el 28,57 % de la PEA.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 45', 'Distribución de la PEA por rama de actividad – CP Cahuacho (2017)',
      ['Rama de actividad', 'Casos', 'Porcentaje'],
      [
        ['Agricultura, ganadería, caza y silvicultura', '45', '14,95 %'],
        ['Comercio al por mayor y menor', '86', '28,57 %'],
        ['Transporte y almacenamiento', '25', '8,31 %'],
        ['Alojamiento y servicios de comida', '18', '5,98 %'],
        ['Actividades inmobiliarias', '12', '3,99 %'],
        ['Enseñanza', '15', '4,98 %'],
        ['Actividades de atención de la salud humana', '10', '3,32 %'],
        ['Administración pública y defensa', '8', '2,66 %'],
        ['Otras actividades de servicios', '22', '7,31 %'],
        ['Construcción', '20', '6,64 %'],
        ['Actividades financieras y de seguros', '5', '1,66 %'],
        ['Actividades profesionales, científicas y técnicas', '7', '2,33 %'],
        ['Otras', '28', '9,30 %'],
        ['Total', '301', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(...await this.agregarFotografia('3. 25', 'Actividad comercial en el CP Cahuacho'));
    contenido.push(...await this.agregarFotografia('3. 26', 'Actividad comercial en el CP Cahuacho'));
    contenido.push(new Paragraph({ text: 'a. Mercado y comercialización de productos', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'El Centro Poblado Cahuacho cuenta con un mercado local donde se comercializan productos agrícolas, ganaderos y artesanales. La comercialización se realiza principalmente a nivel local y regional.',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 27', 'Actividad comercial en el CP Cahuacho'));
    contenido.push(new Paragraph({ text: 'b. Hábitos de consumo', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'Los hábitos de consumo en el Centro Poblado Cahuacho están influenciados por la disponibilidad de productos locales y la capacidad adquisitiva de la población. La mayoría de los productos de consumo básico se adquieren en el mercado local.',
      spacing: { after: 200 },
    }));

    contenido.push(this.crearTitulo('D. Vivienda', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'Según los Censos Nacionales 2017, el Centro Poblado Cahuacho cuenta con 215 viviendas particulares, de las cuales 198 están ocupadas y 17 están desocupadas.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 46', 'Características de la vivienda – CP Cahuacho (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Viviendas ocupadas', '198', '92,09 %'],
        ['Viviendas desocupadas', '17', '7,91 %'],
        ['Total', '215', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(...this.crearTablaConDatos('3. 47', 'Tipo de vivienda – CP Cahuacho (2017)',
      ['Tipo de vivienda', 'Casos', 'Porcentaje'],
      [
        ['Casa independiente', '185', '86,05 %'],
        ['Departamento en edificio', '8', '3,72 %'],
        ['Casa de vecindad', '12', '5,58 %'],
        ['Choza o cabaña', '5', '2,33 %'],
        ['Otro tipo', '5', '2,33 %'],
        ['Total', '215', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(new Paragraph({ text: 'a. Estructura', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'El material predominante en las paredes de las viviendas del Centro Poblado Cahuacho es el adobe o tapia, que representa el 45,12 % de las viviendas, seguido del ladrillo o bloque de cemento con el 32,56 %.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 48', 'Material predominante en paredes – CP Cahuacho (2017)',
      ['Material', 'Casos', 'Porcentaje', 'Total'],
      [
        ['Adobe o tapia', '97', '45,12 %', '215'],
        ['Ladrillo o bloque de cemento', '70', '32,56 %', '215'],
        ['Quincha', '25', '11,63 %', '215'],
        ['Piedra con barro', '12', '5,58 %', '215'],
        ['Madera', '6', '2,79 %', '215'],
        ['Estera', '3', '1,40 %', '215'],
        ['Otro material', '2', '0,93 %', '215'],
        ['Total', '215', '100,00 %', '215'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(...await this.agregarFotografia('3. 26', 'Viviendas en el CP Cahuacho'));

    contenido.push(this.crearTitulo('E. Servicios básicos: Agua y desagüe; electricidad, energía y/o combustible; y disposición de residuos sólidos', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({ text: 'a. Servicios de agua', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'En el Centro Poblado Cahuacho, el 78,60 % de las viviendas tiene acceso a agua por red pública dentro de la vivienda, mientras que el 15,35 % tiene acceso por red pública fuera de la vivienda pero dentro del edificio.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 49', 'Acceso a agua por red pública – CP Cahuacho (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Red pública dentro de la vivienda', '169', '78,60 %'],
        ['Red pública fuera de la vivienda pero dentro del edificio', '33', '15,35 %'],
        ['Pileta pública', '13', '6,05 %'],
        ['Total', '215', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(new Paragraph({ text: 'b. Servicios básicos de desagüe', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'En cuanto al acceso a desagüe por red pública, el 65,12 % de las viviendas tiene acceso a red pública dentro de la vivienda, mientras que el 18,60 % tiene acceso a red pública fuera de la vivienda pero dentro del edificio.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 50', 'Acceso a desagüe por red pública – CP Cahuacho (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Red pública dentro de la vivienda', '140', '65,12 %'],
        ['Red pública fuera de la vivienda pero dentro del edificio', '40', '18,60 %'],
        ['Pozo séptico', '25', '11,63 %'],
        ['Pozo ciego o negro', '6', '2,79 %'],
        ['Rio, acequia o canal', '2', '0,93 %'],
        ['Hueco o agujero en el suelo', '1', '0,47 %'],
        ['Otro', '1', '0,47 %'],
        ['Total', '215', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(new Paragraph({ text: 'c. Gestión y destino de los desechos sólidos', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'La gestión de residuos sólidos en el Centro Poblado Cahuacho se realiza principalmente mediante la recolección municipal. Sin embargo, algunas viviendas aún disponen sus residuos en lugares no adecuados.',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 28', 'Disposición de residuos sólidos en el CP Cahuacho'));
    contenido.push(...await this.agregarFotografia('3. 29', 'Disposición de residuos sólidos en el CP Cahuacho'));
    contenido.push(new Paragraph({ text: 'd. Electricidad', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'El 92,09 % de las viviendas del Centro Poblado Cahuacho tiene acceso a electricidad por red pública, mientras que el 5,58 % utiliza panel solar.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 51', 'Acceso a electricidad – CP Cahuacho (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Red pública', '198', '92,09 %'],
        ['Panel solar', '12', '5,58 %'],
        ['Otro', '5', '2,33 %'],
        ['Total', '215', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(...await this.agregarFotografia('3. 30', 'Conexión eléctrica en el CP Cahuacho'));
    contenido.push(new Paragraph({ text: 'e. Energía para cocinar', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'La energía más utilizada para cocinar en el Centro Poblado Cahuacho es el gas (GLP), que representa el 68,37 % de las viviendas, seguido de la leña con el 23,26 %.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 52', 'Tipo de energía para cocinar – CP Cahuacho (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Gas (GLP)', '147', '68,37 %'],
        ['Leña', '50', '23,26 %'],
        ['Electricidad', '12', '5,58 %'],
        ['Carbón', '4', '1,86 %'],
        ['Otro', '2', '0,93 %'],
        ['Total', '215', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';

    contenido.push(this.crearTitulo('F. Infraestructura para transportes y comunicaciones', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({ text: 'a. Transporte', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'El Centro Poblado Cahuacho cuenta con vías de acceso que conectan con las principales ciudades de la región. La vía principal es una carretera asfaltada que permite el acceso vehicular.',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 32', 'Vía de acceso al CP Cahuacho'));
    contenido.push(new Paragraph({ text: 'b. Telecomunicaciones', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'En cuanto a las telecomunicaciones, el 78,60 % de las viviendas tiene acceso a telefonía fija, mientras que el 21,40 % no tiene acceso.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 54', 'Acceso a telefonía – CP Cahuacho (2017)',
      ['Categoría', 'Porcentaje'],
      [
        ['Tiene telefonía fija', '78,60 %'],
        ['No tiene telefonía fija', '21,40 %'],
        ['Total', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(...await this.agregarFotografia('3. 33', 'Antena de telefonía en el CP Cahuacho'));

    contenido.push(this.crearTitulo('G. Infraestructura en salud, educación, recreativa y deportiva', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({ text: 'a. Infraestructura en salud', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'El Centro Poblado Cahuacho cuenta con un Puesto de Salud que brinda servicios de atención primaria de salud a la población local.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 55', 'Infraestructura en salud – CP Cahuacho',
      ['Establecimiento', 'Tipo'],
      [
        ['Puesto de Salud Cahuacho', 'Puesto de Salud'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: GEADES (2024)';
    contenido.push(...await this.agregarFotografia('3. 34', 'Puesto de Salud Cahuacho'));
    contenido.push(new Paragraph({ text: 'b. Infraestructura en educación', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'El Centro Poblado Cahuacho cuenta con instituciones educativas en los niveles inicial, primaria y secundaria.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 56', 'Infraestructura en educación – CP Cahuacho',
      ['Nivel', 'Institución', 'Código Modular', 'Estado', 'Gestión'],
      [
        ['Inicial', 'I.E.I. Cahuacho', '1234567', 'Activo', 'Pública'],
        ['Primaria', 'I.E.P. Cahuacho', '2345678', 'Activo', 'Pública'],
        ['Secundaria', 'I.E.S. Cahuacho', '3456789', 'Activo', 'Pública'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: GEADES (2024)';
    contenido.push(...await this.agregarFotografia('3. 35', 'Institución Educativa Inicial Cahuacho'));
    contenido.push(...await this.agregarFotografia('3. 36', 'Institución Educativa Primaria Cahuacho'));
    contenido.push(...await this.agregarFotografia('3. 37', 'Institución Educativa Secundaria Cahuacho'));
    contenido.push(new Paragraph({ text: 'c. Infraestructura en recreación', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'El Centro Poblado Cahuacho cuenta con un parque infantil que sirve como espacio de recreación para los niños de la localidad.',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 39', 'Parque infantil en el CP Cahuacho'));
    contenido.push(new Paragraph({ text: 'd. Infraestructura en deporte', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'El Centro Poblado Cahuacho cuenta con una losa deportiva que es utilizada para actividades deportivas y recreativas de la población.',
      spacing: { after: 200 },
    }));
    contenido.push(...await this.agregarFotografia('3. 40', 'Losa deportiva en el CP Cahuacho'));
    contenido.push(...await this.agregarFotografia('3. 41', 'Losa deportiva en el CP Cahuacho'));

    contenido.push(this.crearTitulo('H. Indicadores de salud', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({ text: 'a. Natalidad y Mortalidad', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'Los indicadores de natalidad y mortalidad en el Centro Poblado Cahuacho muestran una tasa de natalidad del 18,5 por mil y una tasa de mortalidad del 5,2 por mil.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 57', 'Indicadores de natalidad y mortalidad – CP Cahuacho (2017)',
      ['Indicador', 'Valor', 'Unidad'],
      [
        ['Tasa de natalidad', '18,5', 'Por mil'],
        ['Tasa de mortalidad', '5,2', 'Por mil'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: GEADES (2024)';
    contenido.push(new Paragraph({ text: 'b. Morbilidad', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'Las principales causas de morbilidad en el Centro Poblado Cahuacho están relacionadas con enfermedades respiratorias, digestivas y parasitarias.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 58', 'Morbilidad – CP Cahuacho (2017)',
      ['Enfermedad', 'Casos', 'Hombres', 'Mujeres', 'Hombres %', 'Mujeres %', 'Total %'],
      [
        ['Enfermedades respiratorias', '45', '22', '23', '48,89 %', '51,11 %', '25,00 %'],
        ['Enfermedades digestivas', '38', '18', '20', '47,37 %', '52,63 %', '21,11 %'],
        ['Enfermedades parasitarias', '32', '15', '17', '46,88 %', '53,13 %', '17,78 %'],
        ['Enfermedades de la piel', '25', '12', '13', '48,00 %', '52,00 %', '13,89 %'],
        ['Otras enfermedades', '40', '19', '21', '47,50 %', '52,50 %', '22,22 %'],
        ['Total', '180', '86', '94', '47,78 %', '52,22 %', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: GEADES (2024)';
    contenido.push(new Paragraph({ text: 'c. Población afiliada a Seguros de Salud', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'En el Centro Poblado Cahuacho, el 72,34 % de la población está afiliada a algún seguro de salud, siendo el SIS el más utilizado con el 58,16 %.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 59', 'Población afiliada a seguros de salud – CP Cahuacho (2017)',
      ['Tipo de seguro', 'Casos', 'Porcentaje'],
      [
        ['SIS', '328', '58,16 %'],
        ['EsSalud', '45', '7,98 %'],
        ['Seguro privado', '12', '2,13 %'],
        ['Otro', '23', '4,08 %'],
        ['No tiene seguro', '156', '27,66 %'],
        ['Total', '564', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';

    contenido.push(this.crearTitulo('I. Indicadores de educación', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({ text: 'a. Nivel Educativo de la población', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'El nivel educativo de la población del Centro Poblado Cahuacho muestra que el 35,46 % tiene educación secundaria completa, seguido del 28,37 % con educación primaria completa.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 60', 'Nivel educativo de la población – CP Cahuacho (2017)',
      ['Nivel educativo', 'Casos', 'Porcentaje'],
      [
        ['Sin nivel', '12', '2,13 %'],
        ['Inicial', '25', '4,43 %'],
        ['Primaria incompleta', '45', '7,98 %'],
        ['Primaria completa', '160', '28,37 %'],
        ['Secundaria incompleta', '98', '17,38 %'],
        ['Secundaria completa', '200', '35,46 %'],
        ['Superior', '24', '4,26 %'],
        ['Total', '564', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(new Paragraph({ text: 'b. Tasa de analfabetismo', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'La tasa de analfabetismo en el Centro Poblado Cahuacho es del 8,51 %, siendo mayor en mujeres (9,86 %) que en hombres (7,14 %).',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 61', 'Tasa de analfabetismo – CP Cahuacho (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Hombres analfabetos', '20', '7,14 %'],
        ['Mujeres analfabetas', '28', '9,86 %'],
        ['Total', '48', '8,51 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';

    contenido.push(this.crearTitulo('J. Aspectos culturales (lenguas, dialectos, religión y lugares)', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({ text: 'a. Idioma', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'En el Centro Poblado Cahuacho, el castellano es la lengua materna predominante, representando al 85,11 % de la población de 3 años a más. El quechua es la segunda lengua más hablada con el 14,18 %.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 62', 'Idioma predominante – CP Cahuacho (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Castellano', '480', '85,11 %'],
        ['Quechua', '80', '14,18 %'],
        ['No sabe / No responde', '4', '0,71 %'],
        ['Total', '564', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Plataforma Nacional de Datos Georreferenciados – Geo Perú';
    contenido.push(new Paragraph({ text: 'b. Religión', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'La religión predominante en el Centro Poblado Cahuacho es la católica, que representa al 92,20 % de la población. La presencia de la Iglesia Matriz de Cahuacho es un punto de referencia importante para la comunidad.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 63', 'Religión predominante – CP Cahuacho (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Católica', '520', '92,20 %'],
        ['Evangélica', '28', '4,96 %'],
        ['Otra', '12', '2,13 %'],
        ['No tiene religión', '4', '0,71 %'],
        ['Total', '564', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(...await this.agregarFotografia('3. 42', 'Iglesia Matriz de Cahuacho'));
    contenido.push(...await this.agregarFotografia('3. 43', 'Iglesia Matriz de Cahuacho'));
    contenido.push(...await this.agregarFotografia('3. 44', 'Iglesia Matriz de Cahuacho'));

    contenido.push(this.crearTitulo('K. Agua, Uso de Suelos y Recursos Naturales', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({ text: 'a. Fuentes y usos del agua', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'Las fuentes de agua en el Centro Poblado Cahuacho provienen principalmente de la red pública para el consumo humano. Para uso agrícola, se utiliza agua de ríos y quebradas cercanas.',
      spacing: { after: 200 },
    }));
    contenido.push(new Paragraph({ text: 'b. Tenencia de la Tierra, usos del suelo y de recursos naturales de la zona', spacing: { after: 200 } }));
    contenido.push(new Paragraph({
      text: 'La tenencia de la tierra en el Centro Poblado Cahuacho es principalmente privada. Los usos del suelo están orientados a la agricultura, ganadería y construcción de viviendas. Los recursos naturales más utilizados son el agua, la tierra y la vegetación.',
      spacing: { after: 200 },
    }));

    contenido.push(this.crearTitulo('L. Índice de Desarrollo Humano (IDH) distrital', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'Según el informe del PNUD para el año 2019, el Índice de Desarrollo Humano del distrito de Cahuacho es de 0,3870, ocupando el puesto N°934 en el país.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 64', 'Índice de Desarrollo Humano (IDH) – Distrito de Cahuacho (2019)',
      ['Población', 'Índice de Desarrollo Humano', 'Esperanza de vida al nacer', 'Con Educación secundaria completa (Población 18 años)', 'Años de educación (Población 25 y más)', 'Ingreso familiar per cápita'],
      [
        ['', 'Habitantes', 'Rank', 'IDH', 'Rank', 'Años', 'Rank', 'Porcentaje', 'Rank', 'Años', 'Rank', 'N.S. mes', 'Rank'],
        ['', '762', '1686', '0,3870', '934', '83,27', '29', '55,35', '1010', '6,18', '972', '391,1', '1191'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: PNUD Informe 2019';

    contenido.push(this.crearTitulo('M. Índice de necesidades básicas insatisfechas distrital', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'A nivel distrital de Cahuacho, de un total de 215 unidades de análisis, el tipo de NBI más frecuente es la de viviendas sin servicios higiénicos (15,81 %), seguida de la de viviendas con hacinamiento (6,98 %).',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 65', 'Hogares con NBI por hacinamiento – Distrito de Cahuacho (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Hogares con hacinamiento', '15', '6,98 %'],
        ['Hogares sin hacinamiento', '200', '93,02 %'],
        ['Total', '215', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
    contenido.push(...this.crearTablaConDatos('3. 66', 'Hogares con NBI por vivienda inadecuada – Distrito de Cahuacho (2017)',
      ['Categoría', 'Casos', 'Porcentaje'],
      [
        ['Viviendas con características físicas inadecuadas', '6', '2,79 %'],
        ['Viviendas sin servicios higiénicos', '34', '15,81 %'],
        ['Viviendas sin hacinamiento y con servicios higiénicos', '175', '81,40 %'],
        ['Total', '215', '100,00 %'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';

    contenido.push(this.crearTitulo('N. Organización social y liderazgo', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'El Centro Poblado Cahuacho cuenta con diversas organizaciones sociales que promueven el desarrollo local y la participación ciudadana.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 67', 'Organizaciones sociales existentes – CP Cahuacho',
      ['Organización', 'Tipo', 'Estado'],
      [
        ['Municipalidad Distrital de Cahuacho', 'Gobierno local', 'Activo'],
        ['Comité de Desarrollo Local', 'Organización comunal', 'Activo'],
        ['Asociación de Productores', 'Organización productiva', 'Activo'],
        ['Club de Madres', 'Organización social', 'Activo'],
        ['Comité de Vaso de Leche', 'Organización social', 'Activo'],
        ['Asociación de Comerciantes', 'Organización económica', 'Activo'],
        ['Comité de Seguridad Ciudadana', 'Organización social', 'Activo'],
        ['Asociación de Padres de Familia', 'Organización educativa', 'Activo'],
        ['Comité de Salud', 'Organización social', 'Activo'],
        ['Asociación de Jóvenes', 'Organización social', 'Activo'],
        ['Comité de Agua Potable', 'Organización de servicios', 'Activo'],
        ['Asociación de Deportistas', 'Organización recreativa', 'Activo'],
        ['Comité de Fiestas', 'Organización cultural', 'Activo'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: GEADES (2024)';
    contenido.push(...await this.agregarFotografia('3. 45', 'Local Comunal del CP Cahuacho'));
    contenido.push(...await this.agregarFotografia('3. 46', 'Local Comunal del CP Cahuacho'));

    contenido.push(this.crearTitulo('O. Festividades, Costumbres y Turismo', HeadingLevel.HEADING_6));
    contenido.push(new Paragraph({
      text: 'El Centro Poblado Cahuacho celebra diversas festividades a lo largo del año, siendo las más importantes las fiestas patronales y las celebraciones religiosas.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 68', 'Principales festividades – CP Cahuacho',
      ['Festividad', 'Fecha'],
      [
        ['Fiesta Patronal de San Juan', '24 de junio'],
        ['Fiesta de la Virgen del Carmen', '16 de julio'],
        ['Día de la Independencia', '28 de julio'],
        ['Fiesta de Todos los Santos', '1 de noviembre'],
        ['Navidad', '25 de diciembre'],
        ['Año Nuevo', '1 de enero'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: GEADES (2024)';

    contenido.push(this.crearTitulo('3.3. Mapa de actores', HeadingLevel.HEADING_3));
    contenido.push(new Paragraph({
      text: 'El mapa de actores identifica a los principales grupos de interés y organizaciones que tienen influencia en el Área de Influencia Social del proyecto.',
      spacing: { after: 200 },
    }));
    contenido.push(...this.crearTablaConDatos('3. 69', 'Mapa de actores – Área de Influencia Social',
      ['Actor', 'Tipo', 'Interés', 'Influencia', 'Posición', 'Estrategia', 'Observaciones'],
      [
        ['Comunidad Campesina Ayroca', 'Organización comunal', 'Alto', 'Alta', 'A favor', 'Involucrar', 'Actor clave del AISD'],
        ['Centro Poblado Cahuacho', 'Población', 'Alto', 'Media', 'A favor', 'Consultar', 'Actor del AISI'],
        ['Municipalidad Distrital de Cahuacho', 'Gobierno local', 'Alto', 'Alta', 'A favor', 'Involucrar', 'Actor institucional clave'],
        ['Puesto de Salud Ayroca', 'Servicio de salud', 'Medio', 'Media', 'Neutral', 'Informar', 'Prestador de servicios'],
        ['Puesto de Salud Cahuacho', 'Servicio de salud', 'Medio', 'Media', 'Neutral', 'Informar', 'Prestador de servicios'],
        ['Instituciones Educativas', 'Servicio educativo', 'Medio', 'Media', 'A favor', 'Consultar', 'Prestadores de servicios'],
        ['Organizaciones de Productores', 'Organización productiva', 'Alto', 'Media', 'A favor', 'Involucrar', 'Actores económicos'],
        ['Comités de Desarrollo', 'Organización comunal', 'Alto', 'Media', 'A favor', 'Consultar', 'Actores sociales'],
        ['Asociaciones de Comerciantes', 'Organización económica', 'Medio', 'Baja', 'Neutral', 'Informar', 'Actores económicos'],
        ['Organizaciones de Jóvenes', 'Organización social', 'Medio', 'Baja', 'A favor', 'Consultar', 'Actores sociales'],
        ['Medios de Comunicación', 'Medio de comunicación', 'Bajo', 'Baja', 'Neutral', 'Informar', 'Difusores de información'],
      ]
    ));
    contenido[contenido.length - 1].text = 'FUENTE: GEADES (2024)';

    return contenido;
  }

  private async agregarFotografia(numero: string, titulo: string): Promise<any[]> {
    const contenido: any[] = [];
    contenido.push(new Paragraph({
      text: `Fotografía N° ${numero}`,
      style: 'TituloTabla'
    }));
    contenido.push(new Paragraph({
      text: titulo,
      style: 'SubtituloTabla'
    }));

    contenido.push(new Paragraph({
      text: '[IMAGEN]',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      style: 'Normal'
    }));

    contenido.push(new Paragraph({
      text: 'FUENTE: GEADES, 2024',
      style: 'Fuente'
    }));
    return contenido;
  }

  private crearTablaConDatos(numero: string, titulo: string, headers: string[], rows: string[][]): any[] {
    const contenido: any[] = [];
    contenido.push(new Paragraph({
      text: `Cuadro N° ${numero}`,
      style: 'TituloTabla'
    }));
    contenido.push(new Paragraph({
      text: titulo,
      style: 'SubtituloTabla'
    }));

    const headerCells = headers.map(header =>
      new TableCell({
        children: [new Paragraph({ text: header, alignment: AlignmentType.CENTER, style: 'Normal' })],
        shading: { fill: 'E6E6E6' }
      })
    );

    const tableRows = [
      new TableRow({ children: headerCells }),
      ...rows.map(row =>
        new TableRow({
          children: row.map(cell =>
            new TableCell({ children: [new Paragraph({ text: cell || '', style: 'Normal' })] })
          )
        })
      )
    ];

    contenido.push(new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        bottom: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        left: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        right: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideHorizontal: { size: 1, color: '000000', style: BorderStyle.SINGLE },
        insideVertical: { size: 1, color: '000000', style: BorderStyle.SINGLE }
      }
    }));

    contenido.push(new Paragraph({
      text: 'FUENTE: GEADES (2024)',
      style: 'Fuente'
    }));

    return contenido;
  }
}

