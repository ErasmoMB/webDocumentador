import {
  AlignmentType,
  HeadingLevel,
  Paragraph,
  Table,
  TextRun,
} from 'docx';

import { DocxImageBuilder } from './docx-image-builder';
import { DocxTableBuilder } from './docx-table-builder';

type AnyDocxNode = any;

export class DocxHtmlContentBuilder {
  constructor(
    private readonly deps: {
      ensureString: (value: any) => string;
      tableBuilder: DocxTableBuilder;
      imageBuilder: DocxImageBuilder;
    }
  ) {}

  async convertirHtmlADocx(elemento: HTMLElement): Promise<AnyDocxNode[]> {
    const nodos = Array.from(elemento.childNodes);
    const contenido: AnyDocxNode[] = [];

    for (const nodo of nodos) {
      try {
        if (nodo.nodeType === Node.TEXT_NODE) {
          const texto = this.deps.ensureString(nodo.textContent?.trim());
          if (texto) {
            contenido.push(new Paragraph({ children: [new TextRun(texto)] }));
          }
        } else if (nodo.nodeType === Node.ELEMENT_NODE) {
          const elem = nodo as HTMLElement;
          const procesado = await this.procesarElemento(elem);
          if (procesado) {
            if (Array.isArray(procesado)) {
              contenido.push(...procesado.filter((p) => p));
            } else {
              contenido.push(procesado);
            }
          }
        }
      } catch {
        continue;
      }
    }

    return contenido;
  }

  private async procesarElemento(elem: HTMLElement): Promise<AnyDocxNode | AnyDocxNode[] | null> {
    const tagName = elem.tagName.toLowerCase();
    const text = this.deps.ensureString(elem.innerText?.trim());

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
      case 'p': {
        const parrafoResultado = this.crearParrafo(elem);
        return parrafoResultado;
      }
      case 'ul':
      case 'ol':
        return this.crearLista(elem);
      case 'table':
        return this.crearTabla(elem);
      case 'img':
        return await this.crearImagen(elem as HTMLImageElement);
      case 'div': {
        if (elem.classList.contains('image-gallery')) {
          return await this.procesarGaleriaImagenes(elem);
        }
        if (elem.classList.contains('foto-info') || elem.classList.contains('foto-item')) {
          const fotoItems = elem.querySelectorAll('.foto-item');
          if (fotoItems.length > 0 || elem.classList.contains('foto-item')) {
            return await this.procesarFotoInfo(elem);
          }
        }
        if (elem.classList.contains('text-justify')) {
          const tieneElementosHijos =
            elem.querySelectorAll('table, img, h1, h2, h3, h4, h5, app-image-upload, app-foto-info').length > 0;
          if (!tieneElementosHijos && text) {
            const textoStr = this.deps.ensureString(text);
            const parrafosTexto = textoStr.split(/\n\s*\n+/).filter((p) => p.trim());

            if (parrafosTexto.length > 1) {
              return parrafosTexto
                .map((parrafoTexto) => {
                  const textoNormalizado = parrafoTexto.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
                  if (textoNormalizado) {
                    return new Paragraph({
                      children: [new TextRun({ text: textoNormalizado, font: 'Arial' })],
                      alignment: AlignmentType.JUSTIFIED,
                      spacing: { after: 120, line: 360 },
                    });
                  }
                  return null;
                })
                .filter((p) => p !== null);
            }

            const textoNormalizado = textoStr.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
            if (textoNormalizado) {
              return new Paragraph({
                children: [new TextRun({ text: textoNormalizado, font: 'Arial' })],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 120, line: 360 },
              });
            }
          }
        }
        return await this.procesarContenidoDiv(elem);
      }
      default:
        return null;
    }
  }

  private crearTitulo(texto: string, nivel: any): Paragraph {
    const textoStr = this.deps.ensureString(texto);
    return new Paragraph({
      text: textoStr,
      heading: nivel,
      spacing: {
        before: 240,
        after: 200,
        line: 360,
      },
    });
  }

  private crearParrafo(elem: HTMLElement): Paragraph | Paragraph[] {
    try {
      const textoCompleto = this.extraerTextoCompleto(elem);
      const esTituloCentrado =
        elem.classList.contains('titulo-centrado') ||
        elem.classList.contains('table-title') ||
        elem.classList.contains('table-title-main');
      const esSource = elem.classList.contains('source');
      const tieneHighlight = elem.querySelector('.highlight');

      const textoStr = this.deps.ensureString(textoCompleto || '');

      if (tieneHighlight) {
        const partes = this.extraerTextoConHighlight(elem);
        const parrafosTexto = textoStr.split(/\n\s*\n+/).filter((p) => p.trim());

        if (parrafosTexto.length > 1) {
          return parrafosTexto.map((parrafoTexto) => {
            const children: TextRun[] = [];
            partes.forEach((parte) => {
              if (parrafoTexto.includes(parte.texto)) {
                const textoParte = this.deps.ensureString(parte.texto || '');
                if (textoParte) {
                  children.push(
                    new TextRun({
                      text: textoParte.replace(/\s+/g, ' ').trim(),
                      bold: parte.esHighlight,
                      font: 'Arial',
                    })
                  );
                }
              }
            });

            if (children.length === 0) {
              const textoNormalizado = parrafoTexto.replace(/\s+/g, ' ').trim();
              if (textoNormalizado) {
                children.push(
                  new TextRun({
                    text: textoNormalizado,
                    font: 'Arial',
                  })
                );
              }
            }

            return new Paragraph({
              alignment: esTituloCentrado ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
              children: children.length > 0 ? children : [new TextRun({ text: ' ', font: 'Arial' })],
              spacing: {
                after: esSource ? 200 : 120,
                line: 360,
              },
            });
          });
        }

        const children: TextRun[] = [];
        partes.forEach((parte) => {
          const textoParte = this.deps.ensureString(parte.texto || '');
          if (textoParte) {
            children.push(
              new TextRun({
                text: textoParte.replace(/\s+/g, ' ').trim(),
                bold: parte.esHighlight,
                font: 'Arial',
              })
            );
          }
        });

        return new Paragraph({
          alignment: esTituloCentrado ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
          children: children.length > 0 ? children : [new TextRun({ text: ' ', font: 'Arial' })],
          spacing: {
            after: esSource ? 200 : 120,
            line: 360,
          },
        });
      }

      if (textoStr) {
        const parrafosTexto = textoStr.split(/\n\s*\n+/).filter((p) => p.trim());

        if (parrafosTexto.length > 1) {
          return parrafosTexto.map((parrafoTexto) => {
            const textoNormalizado = parrafoTexto.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
            return new Paragraph({
              alignment: esTituloCentrado ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
              children: [
                new TextRun({
                  text: textoNormalizado || ' ',
                  font: 'Arial',
                }),
              ],
              spacing: {
                after: esSource ? 200 : 120,
                line: 360,
              },
            });
          });
        }

        const textoNormalizado = textoStr.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
        return new Paragraph({
          alignment: esTituloCentrado ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: textoNormalizado || ' ',
              font: 'Arial',
            }),
          ],
          spacing: {
            after: esSource ? 200 : 120,
            line: 360,
          },
        });
      }

      return new Paragraph({
        alignment: esTituloCentrado ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: ' ', font: 'Arial' })],
        spacing: {
          after: esSource ? 200 : 120,
          line: 360,
        },
      });
    } catch {
      return new Paragraph({
        text: ' ',
        spacing: { after: 120, line: 360 },
      });
    }
  }

  private extraerTextoCompleto(elem: HTMLElement): string {
    let texto = '';
    const nodos = Array.from(elem.childNodes);

    for (const nodo of nodos) {
      if (nodo.nodeType === Node.TEXT_NODE) {
        const contenido = nodo.textContent || '';
        texto += contenido;
      } else if (nodo.nodeType === Node.ELEMENT_NODE) {
        const elemento = nodo as HTMLElement;
        const tagName = elemento.tagName.toLowerCase();

        if (tagName === 'br') {
          texto += '\n';
        } else if (['span', 'strong', 'em', 'b', 'i', 'u'].includes(tagName)) {
          const textoSpan = this.extraerTextoCompleto(elemento);
          texto += textoSpan;
        } else if (tagName === 'p') {
          texto += this.extraerTextoCompleto(elemento) + '\n\n';
        } else if (tagName === 'div') {
          const textoDiv = this.extraerTextoCompleto(elemento);
          if (textoDiv.trim()) {
            texto += textoDiv + '\n\n';
          }
        }
      }
    }

    return texto;
  }

  private extraerTextoConHighlight(elem: HTMLElement): Array<{ texto: string; esHighlight: boolean }> {
    const partes: Array<{ texto: string; esHighlight: boolean }> = [];
    const nodos = Array.from(elem.childNodes);

    nodos.forEach((nodo) => {
      if (nodo.nodeType === Node.TEXT_NODE) {
        const texto = this.deps.ensureString(nodo.textContent?.trim());
        if (texto) {
          partes.push({ texto, esHighlight: false });
        }
      } else if (nodo.nodeType === Node.ELEMENT_NODE) {
        const elemento = nodo as HTMLElement;
        if (elemento.classList.contains('highlight')) {
          const texto = this.deps.ensureString(elemento.textContent?.trim());
          partes.push({ texto, esHighlight: true });
        } else {
          const texto = this.deps.ensureString(elemento.textContent?.trim());
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
    return items.map((li) => {
      const texto = this.deps.ensureString(li.innerText?.trim());
      return new Paragraph({
        children: [
          new TextRun({
            text: texto,
            font: 'Arial',
          }),
        ],
        bullet: { level: 0 },
        spacing: {
          after: 100,
          line: 360,
        },
      });
    });
  }

  private crearTabla(elem: HTMLElement): Table {
    return this.deps.tableBuilder.crearTabla(
      elem,
      (valor) => this.deps.ensureString(valor),
      (nodo) => this.extraerTextoConHighlight(nodo)
    );
  }

  private async procesarFotoInfo(elem: HTMLElement): Promise<AnyDocxNode[]> {
    const contenido: AnyDocxNode[] = [];

    const fotoItems = elem.querySelectorAll('.foto-item');

    if (fotoItems.length > 0) {
      for (const fotoItem of Array.from(fotoItems)) {
        const item = fotoItem as HTMLElement;
        const numero = this.deps.ensureString(item.querySelector('.foto-numero')?.textContent?.trim());
        const titulo = this.deps.ensureString(item.querySelector('.foto-titulo')?.textContent?.trim());
        const fuente = this.deps.ensureString(item.querySelector('.foto-fuente')?.textContent?.trim());
        const img = item.querySelector('img') as HTMLImageElement;

        if (numero) {
          contenido.push(
            new Paragraph({
              children: [new TextRun({ text: this.deps.ensureString(numero), bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            })
          );
        }

        if (titulo) {
          contenido.push(
            new Paragraph({
              children: [new TextRun({ text: this.deps.ensureString(titulo) })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 150 },
            })
          );
        }

        if (img && img.src && !img.src.includes('data:image/svg') && img.src !== '____') {
          try {
            const imagen = await this.crearImagen(img);
            if (imagen) {
              contenido.push(imagen);
            }
          } catch {
            // ignore
          }
        }

        if (fuente) {
          contenido.push(
            new Paragraph({
              children: [new TextRun({ text: this.deps.ensureString(fuente) })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            })
          );
        }
      }

      return contenido;
    }

    const numero = this.deps.ensureString(elem.querySelector('.foto-numero')?.textContent?.trim());
    const titulo = this.deps.ensureString(elem.querySelector('.foto-titulo')?.textContent?.trim());
    const fuente = this.deps.ensureString(elem.querySelector('.foto-fuente')?.textContent?.trim());
    const imagenes = elem.querySelectorAll('img') as NodeListOf<HTMLImageElement>;

    if (numero) {
      contenido.push(
        new Paragraph({
          children: [new TextRun({ text: this.deps.ensureString(numero), bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        })
      );
    }

    if (titulo) {
      contenido.push(
        new Paragraph({
          children: [new TextRun({ text: this.deps.ensureString(titulo) })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 150 },
        })
      );
    }

    for (const img of Array.from(imagenes)) {
      if (img && img.src && !img.src.includes('data:image/svg') && img.src !== '____') {
        try {
          const imagen = await this.crearImagen(img);
          if (imagen) {
            contenido.push(imagen);
          }
        } catch {
          // ignore
        }
      }
    }

    if (fuente) {
      contenido.push(
        new Paragraph({
          children: [new TextRun({ text: this.deps.ensureString(fuente) })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        })
      );
    }

    return contenido;
  }

  private async crearImagen(elem: HTMLImageElement): Promise<Paragraph | null> {
    return this.deps.imageBuilder.crearImagen(elem);
  }

  private async procesarGaleriaImagenes(elem: HTMLElement): Promise<AnyDocxNode[]> {
    return this.deps.imageBuilder.procesarGaleriaImagenes(elem, (valor) => this.deps.ensureString(valor));
  }

  private async procesarContenidoDiv(elem: HTMLElement): Promise<AnyDocxNode[]> {
    const contenido: AnyDocxNode[] = [];
    const nodos = Array.from(elem.childNodes);

    for (const nodo of nodos) {
      if (nodo.nodeType === Node.TEXT_NODE) {
        const texto = this.deps.ensureString(nodo.textContent || '');
        if (texto) {
          const parrafosTexto = texto.split(/\n\s*\n+/).filter((p) => p.trim());

          for (const parrafoTexto of parrafosTexto) {
            const textoNormalizado = parrafoTexto.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
            if (textoNormalizado) {
              contenido.push(
                new Paragraph({
                  children: [new TextRun({ text: textoNormalizado, font: 'Arial' })],
                  alignment: AlignmentType.JUSTIFIED,
                  spacing: { after: 120, line: 360 },
                })
              );
            }
          }
        }
      } else if (nodo.nodeType === Node.ELEMENT_NODE) {
        const elemento = nodo as HTMLElement;
        const tagName = elemento.tagName.toLowerCase();

        if (tagName === 'app-image-upload' || tagName === 'app-foto-info') {
          const fotoItems = elemento.querySelectorAll('.foto-item');
          if (fotoItems.length > 0) {
            const procesado = await this.procesarFotoInfo(elemento);
            if (procesado && procesado.length > 0) {
              contenido.push(...procesado);
            }
          } else {
            const procesado = await this.procesarElemento(elemento);
            if (procesado) {
              if (Array.isArray(procesado)) {
                contenido.push(...procesado.filter((p) => p));
              } else {
                contenido.push(procesado);
              }
            }
          }
          continue;
        }

        const procesado = await this.procesarElemento(elemento);
        if (procesado) {
          if (Array.isArray(procesado)) {
            contenido.push(...procesado.filter((p) => p));
          } else {
            contenido.push(procesado);
          }
        }
      }
    }

    return contenido;
  }
}
