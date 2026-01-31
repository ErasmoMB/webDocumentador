import { Injectable } from '@angular/core';
import { ITextGenerator } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class TextGenerator implements ITextGenerator {

  generateDescriptiveTexts(data: any): any {
    const transformed = { ...data };

    this.generateEstructuraText(transformed);
    this.generateOcupacionViviendaText(transformed);

    return transformed;
  }

  private generateEstructuraText(data: any): void {
    if (!data.textoEstructuraAISI && Array.isArray(data.tiposMaterialesTabla) && data.tiposMaterialesTabla.length > 0) {
      const pisosTierra = data.tiposMaterialesTabla.find((item: any) => {
        const categoria = String(item.categoria || '');
        const tipoMaterial = String(item.tipoMaterial || '');
        return categoria.includes('pisos') && tipoMaterial.includes('Tierra');
      });

      const pisosCemento = data.tiposMaterialesTabla.find((item: any) => {
        const categoria = String(item.categoria || '');
        const tipoMaterial = String(item.tipoMaterial || '');
        return categoria.includes('pisos') && tipoMaterial.includes('Cemento');
      });

      const porcTierra = String(pisosTierra?.porcentaje || '79,59 %');
      const porcCemento = String(pisosCemento?.porcentaje || '20,41 %');
      const distrito = String(data.distritoSeleccionado || 'Cahuacho');

      data.textoEstructuraAISI = `Según la información recabada de los Censos Nacionales 2017, dentro del CP ${distrito}, el único material empleado para la construcción de las paredes de las viviendas es el adobe. Respecto a los techos, también se cuenta con un único material, que son las planchas de calamina, fibra de cemento o similares.\n\nFinalmente, en cuanto a los pisos, la mayoría están hechos de tierra (${porcTierra}). El porcentaje restante, que consta del ${porcCemento}, cuentan con pisos elaborados a base de cemento.`;
    }
  }

  private generateOcupacionViviendaText(data: any): void {
    if (!data.textoOcupacionViviendaAISI && data.condicionOcupacionTabla) {
      const ocupadasPresentes = data.condicionOcupacionTabla.find((item: any) => {
        const categoria = String(item.categoria || '');
        return categoria.includes('presentes');
      });

      const porcentaje = String(ocupadasPresentes?.porcentaje || '29,88 %');
      const casos = String(ocupadasPresentes?.casos || '49');
      const distrito = String(data.distritoSeleccionado || 'Cahuacho');

      data.textoOcupacionViviendaAISI = `Para poder describir el acápite de estructura de las viviendas de esta localidad, así como la sección de los servicios básicos, se toma como conjunto total a las viviendas ocupadas con personas presentes que llegan a la cantidad de ${casos}. A continuación, se muestra el cuadro con la información respecto a la condición de ocupación de viviendas, tal como realiza el Censo Nacional 2017. De aquí se halla que las viviendas ocupadas con personas presentes representan el ${porcentaje} del conjunto analizado.`;
    }
  }
}
