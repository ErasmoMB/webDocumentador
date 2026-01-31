import { AlignmentType, Document } from 'docx';

export interface DocxDocumentFactoryOptions {
  withPageMargins?: boolean;
}

export class DocxDocumentFactory {
  static create(children: any[], options: DocxDocumentFactoryOptions = {}): Document {
    const withPageMargins = options.withPageMargins ?? false;

    return new Document({
      styles: {
        default: {
          document: {
            run: {
              font: 'Arial',
              size: 22,
            },
            paragraph: {
              spacing: {
                after: 200,
                line: 360,
              },
            },
          },
        },
        paragraphStyles: [
          {
            id: 'Normal',
            name: 'Normal',
            basedOn: 'Normal',
            next: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
            },
            paragraph: {
              spacing: {
                after: 200,
                line: 360,
              },
              alignment: AlignmentType.JUSTIFIED,
            },
          },
          {
            id: 'TituloCapitulo',
            name: 'Titulo Capitulo',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
              bold: true,
              color: '0F4761',
            },
            paragraph: {
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 200,
                after: 200,
                line: 360,
              },
              shading: {
                fill: 'D3D3D3',
              },
            },
          },
          {
            id: 'Heading1',
            name: 'Heading 1',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
              bold: true,
            },
            paragraph: {
              spacing: {
                before: 200,
                after: 200,
                line: 360,
              },
            },
          },
          {
            id: 'Heading2',
            name: 'Heading 2',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
              bold: true,
            },
            paragraph: {
              spacing: {
                before: 200,
                after: 200,
                line: 360,
              },
            },
          },
          {
            id: 'Heading3',
            name: 'Heading 3',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
              bold: true,
            },
            paragraph: {
              spacing: {
                before: 150,
                after: 150,
                line: 360,
              },
            },
          },
          {
            id: 'Heading4',
            name: 'Heading 4',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
              bold: true,
            },
            paragraph: {
              spacing: {
                before: 150,
                after: 150,
                line: 360,
              },
            },
          },
          {
            id: 'Heading5',
            name: 'Heading 5',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
              bold: true,
            },
            paragraph: {
              spacing: {
                before: 150,
                after: 150,
                line: 360,
              },
            },
          },
          {
            id: 'TituloTabla',
            name: 'Titulo Tabla',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
              bold: true,
            },
            paragraph: {
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 100,
                line: 360,
              },
            },
          },
          {
            id: 'SubtituloTabla',
            name: 'Subtitulo Tabla',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
            },
            paragraph: {
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 200,
                line: 360,
              },
            },
          },
          {
            id: 'Fuente',
            name: 'Fuente',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 20,
              italics: true,
            },
            paragraph: {
              spacing: {
                after: 300,
                line: 360,
              },
            },
          },
          {
            id: 'ListaBullet',
            name: 'Lista Bullet',
            basedOn: 'Normal',
            run: {
              font: 'Arial',
              size: 22,
            },
            paragraph: {
              alignment: AlignmentType.JUSTIFIED,
              spacing: {
                after: 150,
                line: 360,
              },
            },
          },
        ],
      },
      sections: [
        {
          properties: withPageMargins
            ? {
                page: {
                  margin: {
                    top: 1440,
                    right: 1440,
                    bottom: 1440,
                    left: 1440,
                  },
                },
              }
            : undefined,
          children,
        },
      ],
    });
  }
}
