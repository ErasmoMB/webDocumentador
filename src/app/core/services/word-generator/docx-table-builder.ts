import {
  AlignmentType,
  BorderStyle,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

export type EnsureString = (valor: any) => string;
export type ExtractTextWithHighlight = (
  elem: HTMLElement
) => Array<{ texto: string; esHighlight: boolean }>;

export class DocxTableBuilder {
  crearTabla(
    elem: HTMLElement,
    asegurarString: EnsureString,
    extraerTextoConHighlight: ExtractTextWithHighlight
  ): Table {
    const rows = Array.from(elem.querySelectorAll('tr')).map((row) => {
      const cells = Array.from(row.querySelectorAll('th, td')).map((cell) => {
        const isHeader = cell.tagName === 'TH' || cell.classList.contains('table-header');
        const cellHTMLElem = cell as HTMLElement;

        const isCentered =
          isHeader ||
          cell.classList.contains('table-cell-center') ||
          cell.classList.contains('header-centrado') ||
          cell.classList.contains('table-header') ||
          cellHTMLElem.style?.textAlign === 'center';

        const texto = asegurarString((cell as HTMLElement).textContent?.trim());
        const cellElem = cell as HTMLElement;
        const tieneHighlight = cellElem.querySelector('.highlight');

        const colspan = parseInt(cellHTMLElem.getAttribute('colspan') || '1');
        const rowspan = parseInt(cellHTMLElem.getAttribute('rowspan') || '1');

        const children: TextRun[] = [];
        if (tieneHighlight) {
          const partes = extraerTextoConHighlight(cellElem);
          partes.forEach((parte) => {
            const textoStr = asegurarString(parte.texto);
            children.push(
              new TextRun({
                text: textoStr,
                bold: parte.esHighlight || isHeader,
                font: 'Arial',
                size: 22,
              })
            );
          });
        } else {
          const textoStr = asegurarString(texto);
          children.push(
            new TextRun({
              text: textoStr,
              bold: isHeader,
              font: 'Arial',
              size: 22,
            })
          );
        }

        const paragraphOptions: any = {
          alignment: isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
          children,
          spacing: {
            before: 50,
            after: 50,
            line: 360,
          },
        };

        const cellOptions: any = {
          children: [new Paragraph(paragraphOptions)],
          shading: isHeader ? { fill: 'E6E6E6' } : undefined,
          margins: {
            top: 100,
            bottom: 100,
            left: 100,
            right: 100,
          },
          verticalAlign: 'center' as any,
          borders: {
            top: { size: 1, color: '000000', style: BorderStyle.SINGLE },
            bottom: { size: 1, color: '000000', style: BorderStyle.SINGLE },
            left: { size: 1, color: '000000', style: BorderStyle.SINGLE },
            right: { size: 1, color: '000000', style: BorderStyle.SINGLE },
          },
        };

        if (colspan > 1) {
          cellOptions.columnSpan = colspan;
          cellOptions.width = {
            size: colspan * 10,
            type: WidthType.PERCENTAGE,
          };
        }

        if (rowspan > 1) {
          cellOptions.rowSpan = rowspan;
          cellOptions.verticalAlign = 'center' as any;
        }

        return new TableCell(cellOptions);
      });

      return new TableRow({
        children: cells,
        tableHeader: cells.some((c: any) => c.options?.shading?.fill === 'E6E6E6'),
        height: { value: 500, rule: 'atLeast' as any },
      });
    });

    return new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: 'autofit' as any,
      columnWidths: this.calcularAnchoColumnas(elem, asegurarString),
      margins: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    });
  }

  calcularAnchoColumnas(elem: HTMLElement, asegurarString: EnsureString): number[] | undefined {
    const rows = Array.from(elem.querySelectorAll('tr'));
    let maxCells = 0;
    let dataRow: HTMLElement | null = null;

    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll('th, td')) as HTMLElement[];
      let totalColumns = 0;
      cells.forEach((cell) => {
        const colspan = parseInt(cell.getAttribute('colspan') || '1');
        totalColumns += colspan;
      });

      if (totalColumns > maxCells) {
        maxCells = totalColumns;
      }

      if (!dataRow && cells.length === totalColumns && cells.some((c) => c.tagName === 'TD')) {
        dataRow = row;
      }
    }

    if (maxCells > 0) {
      if (dataRow) {
        const cells = Array.from(dataRow.querySelectorAll('th, td')) as HTMLElement[];
        const firstCellText = asegurarString(cells[0]?.textContent?.trim());

        if (firstCellText.length > 20 && maxCells > 1) {
          const widths: number[] = [];
          widths.push(3800);
          const remainingWidth = 5700;
          const widthPerColumn = Math.floor(remainingWidth / (maxCells - 1));
          for (let i = 1; i < maxCells; i++) {
            widths.push(widthPerColumn);
          }
          return widths;
        }
      }

      const widthPerColumn = Math.floor(9500 / maxCells);
      return Array(maxCells).fill(widthPerColumn);
    }

    return undefined;
  }
}
