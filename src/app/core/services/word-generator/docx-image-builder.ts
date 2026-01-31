import { AlignmentType, ImageRun, Paragraph, TextRun } from 'docx';

export type GetApiUrl = () => string;
export type EnsureString = (valor: any) => string;

export class DocxImageBuilder {
  constructor(private readonly getApiUrl: GetApiUrl) {}

  async crearImagen(elem: HTMLImageElement): Promise<Paragraph | null> {
    if (!elem.src || elem.src === '____' || elem.src.includes('data:image/svg')) {
      return null;
    }

    try {
      let arrayBuffer: ArrayBuffer;
      let type: 'png' | 'jpg' | 'gif' | 'bmp' = 'jpg';
      let imgWidth = 500;
      let imgHeight = 375;

      if (elem.src.startsWith('data:')) {
        const base64Data = elem.src.split(',')[1];
        if (!base64Data) {
          return null;
        }
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;

        const mimeType = elem.src.split(';')[0].split(':')[1];
        if (mimeType.includes('jpeg') || mimeType.includes('jpg')) type = 'jpg';
        else if (mimeType.includes('png')) type = 'png';
        else if (mimeType.includes('gif')) type = 'gif';
        else if (mimeType.includes('bmp')) type = 'bmp';

        if (elem.naturalWidth && elem.naturalHeight) {
          imgWidth = elem.naturalWidth;
          imgHeight = elem.naturalHeight;
        }
      } else if (elem.src.includes('/imagenes/')) {
        const urlParts = elem.src.split('/imagenes/');
        if (!urlParts[1]) {
          return null;
        }
        const imageId = urlParts[1].split('?')[0];

        try {
          const apiUrl = this.getApiUrl();
          const response = await fetch(`${apiUrl}/imagenes/${imageId}/base64`);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const imgData = await response.json();

          const dataUrlImage = new Image();

          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              resolve();
            }, 5000);

            dataUrlImage.onload = () => {
              clearTimeout(timeout);
              resolve();
            };

            dataUrlImage.onerror = () => {
              clearTimeout(timeout);
              reject(new Error('Error loading base64 image'));
            };

            dataUrlImage.src = imgData.data_url;
          });

          imgWidth = dataUrlImage.naturalWidth || elem.width || 500;
          imgHeight = dataUrlImage.naturalHeight || elem.height || 375;

          if (!imgWidth || !imgHeight || imgWidth === 0 || imgHeight === 0) {
            return null;
          }

          const canvas = document.createElement('canvas');
          const maxWidth = 500;
          const maxHeight = 375;
          let finalWidth = imgWidth;
          let finalHeight = imgHeight;

          if (imgWidth > maxWidth || imgHeight > maxHeight) {
            const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
            finalWidth = Math.round(imgWidth * ratio);
            finalHeight = Math.round(imgHeight * ratio);
          }

          canvas.width = finalWidth;
          canvas.height = finalHeight;

          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            return null;
          }

          ctx.drawImage(dataUrlImage, 0, 0, finalWidth, finalHeight);

          type = imgData.mime_type === 'image/png' ? 'png' : 'jpg';
          const mimeType = imgData.mime_type === 'image/png' ? 'image/png' : 'image/jpeg';

          let base64: string;
          try {
            base64 = canvas.toDataURL(mimeType, 0.85);
            if (!base64 || base64.length < 100) {
              return null;
            }
          } catch {
            return null;
          }

          const base64Data = base64.split(',')[1];
          if (!base64Data) {
            return null;
          }

          try {
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            arrayBuffer = bytes.buffer;
            imgWidth = finalWidth;
            imgHeight = finalHeight;
          } catch {
            return null;
          }
        } catch {
          return null;
        }
      } else {
        if (!elem.complete || elem.naturalWidth === 0 || elem.naturalHeight === 0) {
          try {
            await new Promise<void>((resolve) => {
              const timeout = setTimeout(() => {
                resolve();
              }, 3000);

              elem.onload = () => {
                clearTimeout(timeout);
                elem.onload = null;
                elem.onerror = null;
                resolve();
              };
              elem.onerror = () => {
                clearTimeout(timeout);
                elem.onload = null;
                elem.onerror = null;
                resolve();
              };
            });
          } catch {
            // no-op
          }
        }

        try {
          const canvas = document.createElement('canvas');
          const naturalWidth = elem.naturalWidth || elem.width || 500;
          const naturalHeight = elem.naturalHeight || elem.height || 375;

          if (!naturalWidth || !naturalHeight || naturalWidth === 0 || naturalHeight === 0) {
            return null;
          }

          imgWidth = naturalWidth;
          imgHeight = naturalHeight;

          const maxWidth = 500;
          const maxHeight = 375;
          let finalWidth = imgWidth;
          let finalHeight = imgHeight;

          if (imgWidth > maxWidth || imgHeight > maxHeight) {
            const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
            finalWidth = Math.round(imgWidth * ratio);
            finalHeight = Math.round(imgHeight * ratio);
          }

          canvas.width = finalWidth;
          canvas.height = finalHeight;

          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            return null;
          }

          ctx.drawImage(elem, 0, 0, finalWidth, finalHeight);

          const base64 = canvas.toDataURL('image/jpeg', 0.7);

          if (!base64 || base64.length < 100) {
            return null;
          }

          const base64Data = base64.split(',')[1];
          if (!base64Data) {
            return null;
          }

          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          arrayBuffer = bytes.buffer;
          type = 'jpg';
          imgWidth = finalWidth;
          imgHeight = finalHeight;
        } catch {
          return null;
        }
      }

      const imageData = new Uint8Array(arrayBuffer);
      if (imageData.length === 0) {
        return null;
      }

      const maxWidth = 500;
      const maxHeight = 375;
      let finalWidth = imgWidth;
      let finalHeight = imgHeight;

      if (imgWidth > maxWidth || imgHeight > maxHeight) {
        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        finalWidth = Math.round(imgWidth * ratio);
        finalHeight = Math.round(imgHeight * ratio);
      }

      const image = new ImageRun({
        data: imageData,
        transformation: { width: finalWidth, height: finalHeight },
        type,
      });

      return new Paragraph({
        children: [image],
        alignment: AlignmentType.CENTER,
        spacing: { before: 150, after: 200 },
      });
    } catch {
      return null;
    }
  }

  async crearImagenDesdeURL(url: string): Promise<Paragraph | null> {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout al cargar imagen desde URL'));
        }, 10000);

        img.onload = () => {
          clearTimeout(timeout);
          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            resolve();
          } else {
            reject(new Error('Imagen sin dimensiones válidas'));
          }
        };

        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Error al cargar imagen desde URL'));
        };

        img.src = url;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return null;
      }

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const extension = url.split('.').pop()?.toLowerCase();
      const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
      const type: 'png' | 'jpg' = extension === 'png' ? 'png' : 'jpg';

      const base64 = canvas.toDataURL(mimeType, 0.95);
      const base64Data = base64.split(',')[1];
      if (!base64Data) {
        return null;
      }

      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const maxWidth = 500;
      const maxHeight = 375;
      let finalWidth = img.naturalWidth;
      let finalHeight = img.naturalHeight;

      if (finalWidth > maxWidth || finalHeight > maxHeight) {
        const ratio = Math.min(maxWidth / finalWidth, maxHeight / finalHeight);
        finalWidth = Math.round(finalWidth * ratio);
        finalHeight = Math.round(finalHeight * ratio);
      }

      const image = new ImageRun({
        data: bytes,
        transformation: { width: finalWidth, height: finalHeight },
        type,
      });

      return new Paragraph({
        children: [image],
        alignment: AlignmentType.CENTER,
        spacing: { before: 150, after: 200 },
      });
    } catch {
      return null;
    }
  }

  async procesarGaleriaImagenes(elem: HTMLElement, asegurarString: EnsureString): Promise<any[]> {
    const contenido: any[] = [];
    const imageItems = Array.from(elem.querySelectorAll('.image-item'));

    for (const item of imageItems) {
      const caption = asegurarString(item.querySelector('p')?.textContent?.trim());
      const fuente = asegurarString(item.querySelector('div')?.textContent?.trim());
      const img = item.querySelector('img') as HTMLImageElement;

      if (img && img.src) {
        const imagen = await this.crearImagen(img);
        if (imagen) {
          if (caption) {
            contenido.push(
              new Paragraph({
                children: [new TextRun({ text: asegurarString(caption), bold: true })],
                spacing: { after: 100 },
              })
            );
          }
          contenido.push(imagen);
          if (fuente) {
            contenido.push(
              new Paragraph({
                text: asegurarString(fuente),
                alignment: AlignmentType.CENTER,
                spacing: { after: 150 },
              })
            );
          }
        }
      }
    }

    return contenido;
  }
}
