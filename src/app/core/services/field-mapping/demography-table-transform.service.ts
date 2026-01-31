import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DemographyTableTransformService {
  transformarPoblacionSexo(datos: any[]): any[] {
    if (!Array.isArray(datos) || datos.length === 0) {
      return [];
    }

    const datosAgregados = datos[0];
    const hombres = datosAgregados.hombres || 0;
    const mujeres = datosAgregados.mujeres || 0;
    const total = hombres + mujeres;

    if (total === 0) {
      return [];
    }

    const porcentajeHombres = total > 0 ? ((hombres / total) * 100).toFixed(2).replace('.', ',') + ' %' : '0,00 %';
    const porcentajeMujeres = total > 0 ? ((mujeres / total) * 100).toFixed(2).replace('.', ',') + ' %' : '0,00 %';

    return [
      { sexo: 'Hombres', casos: hombres, porcentaje: porcentajeHombres },
      { sexo: 'Mujeres', casos: mujeres, porcentaje: porcentajeMujeres }
    ];
  }

  transformarPoblacionEtario(datos: any[]): any[] {
    if (!Array.isArray(datos) || datos.length === 0) {
      return [];
    }

    const datosAgregados = datos[0];
    const de_1_a_14 = datosAgregados.de_1_a_14 || 0;
    const de_15_a_29 = datosAgregados.de_15_a_29 || 0;
    const de_30_a_44 = datosAgregados.de_30_a_44 || 0;
    const de_45_a_64 = datosAgregados.de_45_a_64 || 0;
    const mayores_65 = datosAgregados.mayores_65 || 0;
    const total = de_1_a_14 + de_15_a_29 + de_30_a_44 + de_45_a_64 + mayores_65;

    if (total === 0) {
      return [];
    }

    const calcularPorcentaje = (valor: number) =>
      total > 0 ? ((valor / total) * 100).toFixed(2).replace('.', ',') + ' %' : '0,00 %';

    return [
      { categoria: '0 a 14 años', casos: de_1_a_14, porcentaje: calcularPorcentaje(de_1_a_14) },
      { categoria: '15 a 29 años', casos: de_15_a_29, porcentaje: calcularPorcentaje(de_15_a_29) },
      { categoria: '30 a 44 años', casos: de_30_a_44, porcentaje: calcularPorcentaje(de_30_a_44) },
      { categoria: '45 a 64 años', casos: de_45_a_64, porcentaje: calcularPorcentaje(de_45_a_64) },
      { categoria: '65 años a más', casos: mayores_65, porcentaje: calcularPorcentaje(mayores_65) }
    ];
  }

  transformarPET(datos: any[]): any[] {
    if (!Array.isArray(datos) || datos.length === 0) {
      return [];
    }

    const datosAgregados = datos[0];
    const de_15_a_29 = datosAgregados.de_15_a_29 || 0;
    const de_30_a_44 = datosAgregados.de_30_a_44 || 0;
    const de_45_a_64 = datosAgregados.de_45_a_64 || 0;
    const mayores_65 = datosAgregados.mayores_65 || 0;
    const totalPET = de_15_a_29 + de_30_a_44 + de_45_a_64 + mayores_65;

    if (totalPET === 0) {
      return [];
    }

    const calcularPorcentaje = (valor: number) =>
      totalPET > 0 ? ((valor / totalPET) * 100).toFixed(2).replace('.', ',') + ' %' : '0,00 %';

    return [
      { categoria: '15 a 29 años', casos: de_15_a_29, porcentaje: calcularPorcentaje(de_15_a_29) },
      { categoria: '30 a 44 años', casos: de_30_a_44, porcentaje: calcularPorcentaje(de_30_a_44) },
      { categoria: '45 a 64 años', casos: de_45_a_64, porcentaje: calcularPorcentaje(de_45_a_64) },
      { categoria: '65 años a más', casos: mayores_65, porcentaje: calcularPorcentaje(mayores_65) }
    ];
  }
}
