import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from 'src/app/services/services/formulario.service';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  Media,
  ImageRun,
} from "docx";
import { saveAs } from "file-saver";


@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.css']
})
export class ResumenComponent implements OnInit {
  datos: any;
  json: any;
  entrevistados: any[] = [];
  entrevistados2: { nombre: string; cargo: string; organizacion: string }[] = [];

  constructor(private formularioService: FormularioService, private router: Router, private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    console.log(this.formularioService.obtenerJSON());
    this.json = this.formularioService.obtenerJSON();
    this.datos = this.formularioService.obtenerDatos();

    console.log(this.datos);


    console.log("Entrevistados2:", this.entrevistados2);
    this.cdRef.detectChanges();
  }

  // Función helper para agregar punto final solo si no existe
  agregarPuntoFinal(texto: string | undefined | null): string {
    if (!texto || texto === '...') return '...';
    const textoTrim = texto.trim();
    // Si ya termina en punto, signo de interrogación o exclamación, no agregar nada
    if (/[.!?]$/.test(textoTrim)) {
      return textoTrim;
    }
    // Si no termina en puntuación, agregar punto
    return textoTrim + '.';
  }

  // Función para normalizar texto después de "que"
  normalizarDespuesDeQue(texto: string | undefined | null): string {
    if (!texto || texto === '...') return '...';
    let resultado = texto.trim();
    
    // Detectar frases incompletas como "el resto del distrito X por rutas..." 
    // y agregar verbo "se considera"
    if (/^(el|la|los|las)\s+resto.+\s+por\s+/i.test(resultado)) {
      resultado = 'se considera ' + resultado;
    }
    
    // Si empieza con mayúscula (excepto nombres propios comunes), cambiar a minúscula
    if (resultado.length > 0 && /^[A-Z]/.test(resultado)) {
      // Lista de palabras que deben mantener mayúscula inicial
      const palabrasConMayuscula = ['El Proyecto', 'La Comunidad', 'Se consideran', 'Debido'];
      const empiezaConPalabra = palabrasConMayuscula.some(p => resultado.startsWith(p));
      
      if (!empiezaConPalabra) {
        resultado = resultado.charAt(0).toLowerCase() + resultado.slice(1);
      } else if (resultado.startsWith('Se consideran')) {
        resultado = 'se consideran' + resultado.slice(13);
      } else if (resultado.startsWith('El Proyecto')) {
        resultado = 'el Proyecto' + resultado.slice(11);
      }
    }
    
    return this.agregarPuntoFinal(resultado);
  }

  // Función para normalizar AISD/AISI componente1 (después de "a")
  normalizarComponente1(texto: string | undefined | null): string {
    if (!texto || texto === '...') return '...';
    let resultado = texto.trim();
    
    // Detectar y corregir frases mal estructuradas como "El Proyecto se ubica en..."
    // cuando debería ser solo "el distrito de..."
    if (/^el proyecto se ubica en el distrito de/i.test(resultado)) {
      resultado = resultado.replace(/^el proyecto se ubica en (el distrito de .+)/i, '$1');
    }
    
    // Convertir primera letra a minúscula si no es nombre propio
    if (resultado.length > 0 && /^[A-Z]/.test(resultado.charAt(0))) {
      // Excepciones: nombres propios de lugares
      const excepciones = ['El Proyecto', 'La Comunidad', 'Los centros'];
      const esExcepcion = excepciones.some(e => resultado.startsWith(e));
      
      if (!esExcepcion) {
        resultado = resultado.charAt(0).toLowerCase() + resultado.slice(1);
      } else if (resultado.startsWith('Los centros')) {
        resultado = 'los centros' + resultado.slice(11);
      } else if (resultado.startsWith('El Proyecto')) {
        resultado = 'el Proyecto' + resultado.slice(11);
      }
    }
    
    return this.agregarPuntoFinal(resultado);
  }

  // Función para normalizar detalleProyecto (artículos de género)
  normalizarDetalleProyecto(texto: string | undefined | null): string {
    if (!texto || texto === '...') return '...';
    let resultado = texto.trim();
    
    // Corregir "el zona" por "la zona"
    resultado = resultado.replace(/\bel\s+zona\b/gi, 'la zona');
    // Corregir "el región" por "la región"
    resultado = resultado.replace(/\bel\s+región\b/gi, 'la región');
    
    // Si empieza con mayúscula y no tiene artículo, agregarlo
    if (/^[A-Z]/.test(resultado)) {
      // Palabras femeninas que necesitan "la"
      if (/^(zona|región|provincia|costa|sierra|selva)/i.test(resultado)) {
        resultado = 'la ' + resultado.charAt(0).toLowerCase() + resultado.slice(1);
      }
      // Palabras masculinas que necesitan "el"
      else if (/^(distrito|departamento|valle|territorio)/i.test(resultado)) {
        resultado = 'el ' + resultado.charAt(0).toLowerCase() + resultado.slice(1);
      }
    }
    
    return resultado;
  }

  // Función para normalizar nombre del proyecto (evitar "El Proyecto Proyecto X")
  normalizarNombreProyecto(texto: string | undefined | null, conArticulo: boolean = true): string {
    if (!texto || texto === '...') return '...';
    let resultado = texto.trim();
    
    // Si el nombre ya empieza con "Proyecto" o "El Proyecto", manejarlo correctamente
    if (conArticulo) {
      // Si ya tiene "El Proyecto" al inicio, dejarlo como está
      if (/^el proyecto /i.test(resultado)) {
        return resultado.charAt(0).toUpperCase() + resultado.slice(1);
      }
      // Si empieza con "Proyecto" solo, agregar "El"
      else if (/^proyecto /i.test(resultado)) {
        return 'El ' + resultado.charAt(0).toUpperCase() + resultado.slice(1);
      }
      // Si no tiene "Proyecto", agregar "El Proyecto"
      else {
        return 'El Proyecto ' + resultado;
      }
    } else {
      // Sin artículo, solo devolver el nombre
      return resultado;
    }
  }

  // exportarWord() {
  //   let elemento = document.querySelector(".preview") as HTMLElement;
  //   if (!elemento) {
  //     console.error("No se encontró el contenido para exportar.");
  //     return;
  //   }

  //   let children = this.convertirHtmlADocx(elemento);

  //   let doc = new Document({
  //     sections: [
  //       {
  //         children: children,
  //       },
  //     ],
  //   });

  //   Packer.toBlob(doc).then((blob) => {
  //     saveAs(blob, "exportado.docx");
  //   });
  // }

  // convertirHtmlADocx(elemento: HTMLElement): any[] {
  //   let nodos = elemento.childNodes;
  //   let contenido: any[] = [];

  //   nodos.forEach((nodo) => {
  //     if (nodo.nodeType === Node.TEXT_NODE) {
  //       contenido.push(new Paragraph({ children: [new TextRun(nodo.textContent || "")] }));
  //     } else if (nodo.nodeType === Node.ELEMENT_NODE) {
  //       let elem = nodo as HTMLElement;
  //       let text = elem.innerText.trim();
  //       if (!text) return;

  //       if (elem.tagName === "H3") {
  //         contenido.push(
  //           new Paragraph({
  //             children: [
  //               new TextRun({
  //                 text,
  //                 bold: true,
  //                 color: "000000",
  //               }),
  //             ],
  //             spacing: { after: 200 },
  //           })
  //         );
  //       } else if (elem.tagName === "P") {
  //         const esTituloCentrado = elem.classList.contains("titulo-centrado");

  //         contenido.push(
  //           new Paragraph({
  //             alignment: esTituloCentrado ? AlignmentType.CENTER : AlignmentType.LEFT,
  //             children: [
  //               new TextRun({
  //                 text,
  //                 bold: esTituloCentrado, // Solo en negrita si tiene la clase
  //               }),
  //             ],
  //             spacing: { after: 100 },
  //           })
  //         );
  //       } else if (elem.tagName === "UL") {
  //         let items = Array.from(elem.querySelectorAll("li")).map(
  //           (li) => new Paragraph({ text: li.innerText, bullet: { level: 0 }, spacing: { after: 100 }, })
  //         );
  //         contenido.push(...items);
  //       } else if (elem.tagName === "TABLE") {
  //         const rows = Array.from(elem.querySelectorAll("tr")).map((row) => {
  //           const cells = Array.from(row.querySelectorAll("th, td")).map((cell) => {
  //             const isHeader = cell.tagName === "TH";
  //             const isCentered = cell.classList.contains("header-centrado");

  //             return new TableCell({
  //               children: [
  //                 new Paragraph({
  //                   alignment: isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
  //                   children: [
  //                     new TextRun({
  //                       text: (cell as HTMLElement).textContent?.trim() || '',
  //                       bold: isHeader,
  //                     }),
  //                   ],
  //                 }),
  //               ],
  //             });
  //           });
  //           return new TableRow({ children: cells });
  //         });

  //         const table = new Table({
  //           rows: rows,
  //           width: { size: 100, type: "pct" },
  //         });

  //         contenido.push(table);
  //       } else if (elem.classList.contains("image-gallery")) {
  //         const imageItems = elem.querySelectorAll(".image-item");

  //         for (const item of imageItems) {
  //           const img = item.querySelector("img") as HTMLImageElement;
  //           const caption = item.querySelector("p")?.textContent || "";
  //           const fuente = item.querySelector("div")?.textContent || "";

  //           if (img && img.src) {
  //             const response = await fetch(img.src);
  //             const blob = await response.blob();
  //             const arrayBuffer = await blob.arrayBuffer();

  //             const image = doc.createImage(arrayBuffer, 300, 200); // 👈 esto es lo correcto

  //             contenido.push(
  //               new Paragraph({
  //                 children: [new TextRun({ text: caption, bold: true })],
  //               }),
  //               new Paragraph({
  //                 children: [image],
  //                 alignment: AlignmentType.CENTER,
  //               }),
  //               new Paragraph({
  //                 text: fuente,
  //                 alignment: AlignmentType.CENTER,
  //               })
  //             );
  //           }
  //         }
  //       }
  //     }
  //   });

  //   return contenido;
  // }
  async exportarWord() {
    const elemento = document.querySelector(".preview") as HTMLElement;
    if (!elemento) {
      console.error("No se encontró el contenido para exportar.");
      return;
    }

    // Esperar contenido
    const children = await this.convertirHtmlADocx(elemento);

    const doc = new Document({
      sections: [
        {
          children: children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "exportado.docx");
  }

  async convertirHtmlADocx(elemento: HTMLElement): Promise<any[]> {
    const nodos = Array.from(elemento.childNodes);
    const contenido: any[] = [];
    const doc = new Document({
      sections: [
        {
          children: [],
        },
      ],
    });
    for (const nodo of nodos) {
      if (nodo.nodeType === Node.TEXT_NODE) {
        contenido.push(new Paragraph({ children: [new TextRun(nodo.textContent || "")] }));
      } else if (nodo.nodeType === Node.ELEMENT_NODE) {
        const elem = nodo as HTMLElement;
        const text = elem.innerText.trim();
        if (!text) continue;

        if (elem.tagName === "H3") {
          contenido.push(
            new Paragraph({
              children: [new TextRun({ text, bold: true, color: "000000" })],
              spacing: { after: 200 },
            })
          );
        } else if (elem.tagName === "P") {
          const esTituloCentrado = elem.classList.contains("titulo-centrado");
          contenido.push(
            new Paragraph({
              alignment: esTituloCentrado ? AlignmentType.CENTER : AlignmentType.LEFT,
              children: [new TextRun({ text, bold: esTituloCentrado })],
              spacing: { after: 100 },
            })
          );
        } else if (elem.tagName === "UL") {
          const items = Array.from(elem.querySelectorAll("li")).map(
            (li) =>
              new Paragraph({
                text: li.innerText,
                bullet: { level: 0 },
                spacing: { after: 100 },
              })
          );
          contenido.push(...items);
        } else if (elem.tagName === "TABLE") {
          const rows = Array.from(elem.querySelectorAll("tr")).map((row) => {
            const cells = Array.from(row.querySelectorAll("th, td")).map((cell) => {
              const isHeader = cell.tagName === "TH";
              const isCentered = cell.classList.contains("header-centrado");

              return new TableCell({
                children: [
                  new Paragraph({
                    alignment: isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
                    children: [
                      new TextRun({
                        text: (cell as HTMLElement).textContent?.trim() || "",
                        bold: isHeader,
                      }),
                    ],
                  }),
                ],
              });
            });
            return new TableRow({ children: cells });
          });

          contenido.push(
            new Table({
              rows,
              width: { size: 100, type: "pct" },
            })
          );
        } else if (elem.classList.contains("image-gallery")) {
          const imageItems = Array.from(elem.querySelectorAll(".image-item"));

          for (const item of imageItems) {
            const img = item.querySelector("img") as HTMLImageElement;
            const caption = item.querySelector("p")?.textContent || "";
            const fuente = item.querySelector("div")?.textContent || "";

            if (img && img.src) {
              const response = await fetch(img.src);
              const blob = await response.blob();
              const arrayBuffer = await blob.arrayBuffer();

              const extension = img.src.split('.').pop()?.toLowerCase();

              // Evitamos svg porque requiere fallback
              let type: "png" | "jpg" | "gif" | "bmp" = "png"; // por defecto png

              if (extension === "jpg" || extension === "jpeg") {
                type = "jpg";
              } else if (extension === "gif") {
                type = "gif";
              } else if (extension === "bmp") {
                type = "bmp";
              } else if (extension === "png") {
                type = "png";
              }

              const image = new ImageRun({
                data: new Uint8Array(arrayBuffer),
                transformation: { width: 200, height: 200 },
                type,
              });

              contenido.push(
                new Paragraph({ children: [new TextRun({ text: caption, bold: true })] }),
                new Paragraph({ children: [image], alignment: AlignmentType.CENTER }),
                new Paragraph({ text: fuente, alignment: AlignmentType.CENTER })
              );
            }
          }
        }
      }
    }

    return contenido;
  }

}

