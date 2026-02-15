import {
  AlignmentType,
  BorderStyle,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalMergeType,
  WidthType,
} from 'docx';

export type EnsureString = (valor: any) => string;
export type ExtractTextWithHighlight = (
  elem: HTMLElement
) => Array<{ texto: string; esHighlight: boolean }>;

export class DocxTableBuilder {
  private static readonly SKIP = Symbol('SKIP_CELL');

  private esCeldaVisible(cell: HTMLElement): boolean {
    try {
      if (!cell) return false;
      if (cell.hasAttribute('hidden')) return false;
      if ((cell.getAttribute('aria-hidden') || '').toLowerCase() === 'true') return false;

      const style = (cell as HTMLElement).style;
      if (style?.display === 'none') return false;
      if (style?.visibility === 'hidden') return false;

      const computed = (globalThis as any).getComputedStyle?.(cell);
      if (computed) {
        if (computed.display === 'none') return false;
        if (computed.visibility === 'hidden') return false;
      }
    } catch {
      // Si falla getComputedStyle, asumimos visible.
    }
    return true;
  }

  private crearTableCellDesdeHtml(
    cell: HTMLElement,
    asegurarString: EnsureString,
    extraerTextoConHighlight: ExtractTextWithHighlight,
    opts?: {
      forceVerticalMerge?: (typeof VerticalMergeType)[keyof typeof VerticalMergeType];
      isHeaderOverride?: boolean;
      columnSpanOverride?: number;
      empty?: boolean;
    }
  ): TableCell {
    const isHeader =
      opts?.isHeaderOverride ??
      (cell.tagName === 'TH' || cell.classList.contains('table-header'));

    const cellHTMLElem = cell as HTMLElement;
    const isCentered =
      isHeader ||
      cell.classList.contains('table-cell-center') ||
      cell.classList.contains('header-centrado') ||
      cell.classList.contains('table-header') ||
      cellHTMLElem.style?.textAlign === 'center';

    const tieneHighlight = cellHTMLElem.querySelector('.highlight');
    const children: TextRun[] = [];

    if (opts?.empty) {
      children.push(
        new TextRun({
          text: ' ',
          bold: isHeader,
          font: 'Arial',
          size: 22,
        })
      );
    } else if (tieneHighlight) {
      const partes = extraerTextoConHighlight(cellHTMLElem);
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
      const texto = asegurarString(cellHTMLElem.textContent?.trim());
      children.push(
        new TextRun({
          text: asegurarString(texto),
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

    const colspan = opts?.columnSpanOverride ?? parseInt(cellHTMLElem.getAttribute('colspan') || '1');
    if (colspan > 1) {
      cellOptions.columnSpan = colspan;
      cellOptions.width = {
        size: colspan * 10,
        type: WidthType.PERCENTAGE,
      };
    }

    if (opts?.forceVerticalMerge) {
      cellOptions.verticalMerge = opts.forceVerticalMerge;
    }

    return new TableCell(cellOptions);
  }

  private construirGridCeldas(elem: HTMLElement): {
    grid: Array<Array<HTMLElement | typeof DocxTableBuilder.SKIP>>;
    maxCols: number;
  } {
    const trList = Array.from(elem.querySelectorAll('tr')) as HTMLElement[];
    const maxCols = this.calcularMaxColumnas(elem);

    // Estado de merges verticales por columna: si hay un merge activo, guardamos la celda "master"
    // para crear celdas CONTINUE en filas siguientes.
    const vMergeRemaining: Array<number> = Array(maxCols).fill(0);
    const vMergeMasterCellAtCol: Array<HTMLElement | null> = Array(maxCols).fill(null);
    const vMergeMasterSpan: Array<number> = Array(maxCols).fill(1);

    const grid: Array<Array<HTMLElement | typeof DocxTableBuilder.SKIP>> = [];

    for (let rowIndex = 0; rowIndex < trList.length; rowIndex++) {
      const rowElem = trList[rowIndex];
      const rowCells = (Array.from(rowElem.querySelectorAll('th, td')) as HTMLElement[]).filter((c) =>
        this.esCeldaVisible(c)
      );
      const outRow: Array<HTMLElement | typeof DocxTableBuilder.SKIP> = Array(maxCols).fill(null as any);

      // Track de columnas donde se aplicó prefill (CONTINUE) en esta fila.
      const prefilleadas: boolean[] = Array(maxCols).fill(false);

      // 1) Prellenar continuaciones de merge vertical
      for (let col = 0; col < maxCols; col++) {
        if (vMergeRemaining[col] > 0 && vMergeMasterCellAtCol[col]) {
          const master = vMergeMasterCellAtCol[col] as HTMLElement;
          const span = vMergeMasterSpan[col] || 1;

          // La celda master ocupa el col actual. Columnas subsiguientes dentro del span se marcan como SKIP.
          outRow[col] = master;
          prefilleadas[col] = true;
          for (let s = 1; s < span; s++) {
            if (col + s < maxCols) outRow[col + s] = DocxTableBuilder.SKIP;
          }
        }
      }

      // 2) Colocar celdas reales de HTML en los siguientes huecos libres
      let cellCursor = 0;
      let colCursor = 0;
      while (cellCursor < rowCells.length && colCursor < maxCols) {
        // saltar posiciones ya ocupadas por continuaciones o SKIP
        while (colCursor < maxCols && outRow[colCursor] !== null && outRow[colCursor] !== undefined) {
          colCursor++;
        }
        if (colCursor >= maxCols) break;

        const cell = rowCells[cellCursor++];
        outRow[colCursor] = cell;

        const colspan = parseInt(cell.getAttribute('colspan') || '1');
        const rowspan = parseInt(cell.getAttribute('rowspan') || '1');

        // Marcar SKIP por colspan
        if (colspan > 1) {
          for (let s = 1; s < colspan; s++) {
            if (colCursor + s < maxCols) outRow[colCursor + s] = DocxTableBuilder.SKIP;
          }
        }

        // Registrar merge vertical para filas siguientes.
        if (rowspan > 1) {
          vMergeRemaining[colCursor] = rowspan - 1;
          vMergeMasterCellAtCol[colCursor] = cell;
          vMergeMasterSpan[colCursor] = Math.max(1, colspan);
        }

        colCursor += Math.max(1, colspan);
      }

      // 3) Consumir exactamente 1 fila de rowspan SOLO cuando fue usada como CONTINUE en esta fila.
      // Esto evita el off-by-one que cortaba el merge una fila antes (típicamente en la fila "Total").
      for (let col = 0; col < maxCols; col++) {
        if (prefilleadas[col] && vMergeRemaining[col] > 0) {
          vMergeRemaining[col]--;
          if (vMergeRemaining[col] === 0) {
            vMergeMasterCellAtCol[col] = null;
            vMergeMasterSpan[col] = 1;
          }
        }
      }

      // 4) Rellenar nulos con celdas vacías (para estabilidad en DOCX)
      for (let col = 0; col < maxCols; col++) {
        if (outRow[col] === null || outRow[col] === undefined) {
          const empty = document.createElement('td');
          empty.textContent = '';
          outRow[col] = empty;
        }
      }

      grid.push(outRow);
    }

    return { grid, maxCols };
  }

  private calcularMaxColumnas(elem: HTMLElement): number {
    const rows = Array.from(elem.querySelectorAll('tr'));
    let maxCells = 0;
    for (const row of rows) {
      const cells = (Array.from(row.querySelectorAll('th, td')) as HTMLElement[]).filter((c) => this.esCeldaVisible(c));
      let totalColumns = 0;
      cells.forEach((cell) => {
        const colspan = parseInt(cell.getAttribute('colspan') || '1');
        totalColumns += colspan;
      });
      if (totalColumns > maxCells) {
        maxCells = totalColumns;
      }
    }
    return maxCells;
  }

  crearTabla(
    elem: HTMLElement,
    asegurarString: EnsureString,
    extraerTextoConHighlight: ExtractTextWithHighlight
  ): Table {
    const { grid, maxCols } = this.construirGridCeldas(elem);

    // Detectar merges verticales desde HTML para marcar RESTART/CONTINUE
    // Nota: Docx requiere verticalMerge; el HTML usa rowspan.
    const activeVmerge: Array<{ remaining: number; span: number } | null> = Array(maxCols).fill(null);

    const rows = grid.map((rowCells) => {
      const cells: TableCell[] = [];

      for (let col = 0; col < maxCols; col++) {
        const cellLike = rowCells[col];
        if (cellLike === DocxTableBuilder.SKIP) continue;

        const htmlCell = cellLike as HTMLElement;
        const colspan = parseInt(htmlCell.getAttribute('colspan') || '1');
        const rowspan = parseInt(htmlCell.getAttribute('rowspan') || '1');

        // Determinar verticalMerge
        let vMerge: (typeof VerticalMergeType)[keyof typeof VerticalMergeType] | undefined;

        if (activeVmerge[col]?.remaining && activeVmerge[col]!.remaining > 0) {
          vMerge = VerticalMergeType.CONTINUE;
          activeVmerge[col]!.remaining--;
          // Si hay span por colspan, consumir también en columnas siguientes como SKIP
          const span = activeVmerge[col]!.span || 1;
          for (let s = 1; s < span; s++) {
            // Las columnas skip ya vienen marcadas, no hacemos nada
          }
          // Celdas CONTINUE deben ir vacías (contenido en la celda RESTART)
          cells.push(
            this.crearTableCellDesdeHtml(htmlCell, asegurarString, extraerTextoConHighlight, {
              forceVerticalMerge: vMerge,
              columnSpanOverride: colspan,
              empty: true,
            })
          );
          // Saltar columnas del colspan
          col += Math.max(1, colspan) - 1;
          continue;
        }

        if (rowspan > 1) {
          vMerge = VerticalMergeType.RESTART;
          activeVmerge[col] = { remaining: rowspan - 1, span: Math.max(1, colspan) };
        } else {
          activeVmerge[col] = null;
        }

        cells.push(
          this.crearTableCellDesdeHtml(htmlCell, asegurarString, extraerTextoConHighlight, {
            forceVerticalMerge: vMerge,
            columnSpanOverride: colspan,
          })
        );

        col += Math.max(1, colspan) - 1;
      }

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

      // Elegir una fila de datos con el máximo de columnas para evitar sesgos cuando hay rowspan
      if (!dataRow && totalColumns === maxCells && cells.some((c) => c.tagName === 'TD')) {
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
