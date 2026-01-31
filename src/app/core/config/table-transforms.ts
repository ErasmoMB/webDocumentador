export function normalizeArrayFromApi(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (data && typeof data === 'object') return [data];
  return [];
}

export function transformServiciosPorCategoria(
  data: any,
  categoriaKey: 'Agua' | 'Desagüe' | 'Alumbrado'
): any[] {
  if (!data || typeof data !== 'object') {
    return [];
  }

  const items = (data as any)[categoriaKey] || [];
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item: any) => ({
    id_ubigeo: '000000000',
    categoria: item.tipo || '',
    tipo: item.tipo || '',
    casos: Number(item.casos) || 0,
    porcentaje: '0,00 %'
  }));
}

export function transformAfiliacionSaludTabla(data: any): any[] {
  const datosArray = normalizeArrayFromApi(data);
  if (datosArray.length === 0) {
    return [];
  }

  return datosArray.map((item: any) => ({
    categoria: item.categoria || 'Sin categoría',
    casos: Number(item.casos) || 0,
    porcentaje: item.porcentaje || 0
  }));
}

export function transformNivelEducativoTabla(data: any): any[] {
  const datosArray = normalizeArrayFromApi(data);
  if (datosArray.length === 0) {
    return [];
  }

  const nivelesMap = new Map<string, any>();
  let totalCasos = 0;

  datosArray.forEach((item: any) => {
    const nivel = (item.nivel_educativo || item.categoria || 'Sin categoría').trim();
    const key = nivel.toLowerCase();

    const cantidad = item.casos || item.cantidad || 0;
    totalCasos += cantidad;

    if (nivelesMap.has(key)) {
      const existing = nivelesMap.get(key);
      existing.casos = (existing.casos || 0) + cantidad;
    } else {
      nivelesMap.set(key, {
        categoria: nivel,
        casos: cantidad,
        porcentaje: 0
      });
    }
  });

  const resultado = Array.from(nivelesMap.values());
  resultado.forEach((item: any) => {
    if (totalCasos > 0) {
      const porcentajeNum = (item.casos / totalCasos) * 100;
      item.porcentaje = porcentajeNum.toFixed(2).replace('.', ',') + ' %';
    } else {
      item.porcentaje = '0,00 %';
    }
  });

  resultado.sort((a, b) => (b.casos || 0) - (a.casos || 0));
  return resultado;
}

export function transformTasaAnalfabetismoTabla(data: any): any[] {
  const datosArray = normalizeArrayFromApi(data);
  if (datosArray.length === 0) {
    return [];
  }

  return datosArray.map((item: any) => ({
    indicador: item.indicador || 'Sin categoría',
    casos: item.casos || 0,
    porcentaje: item.porcentaje || 0
  }));
}

export function transformLenguasSimple(data: any): any[] {
  const arr = Array.isArray(data) ? data : [];
  return arr.map((item: any) => ({
    idioma: item.idioma || '',
    casos: item.casos || 0,
    porcentaje: item.porcentaje || null
  }));
}

export function transformReligionesSimple(data: any): any[] {
  const arr = Array.isArray(data) ? data : [];
  return arr.map((item: any) => ({
    religion: item.religion || '',
    casos: item.casos || 0,
    porcentaje: item.porcentaje || null
  }));
}

export function transformNBISimple(data: any): any[] {
  const arr = Array.isArray(data) ? data : [];
  return arr.map((item: any) => ({
    necesidad: item.necesidad || '',
    casos: item.casos || 0,
    porcentaje: item.porcentaje || null
  }));
}

export function transformServiciosBasicosAISI(data: any): any[] {
  if (!data || typeof data !== 'object') return [];

  const servicios: any[] = [];
  const categorias: Array<'Agua' | 'Desagüe' | 'Alumbrado'> = ['Agua', 'Desagüe', 'Alumbrado'];

  categorias.forEach((categoria) => {
    const items = (data as any)[categoria] || [];
    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        servicios.push({
          servicio: categoria,
          tipo: item.tipo || '',
          casos: item.casos || 0,
          porcentaje: item.porcentaje || null
        });
      });
    }
  });

  return servicios;
}

export function transformCentrosPobladosAISI(data: any): any[] {
  const arr = Array.isArray(data) ? data : [];
  return arr.map((item: any) => ({
    localidad: item.centro_poblado || item.localidad || '',
    coordenadas: item.coordenadas || '',
    altitud: item.altitud || '',
    distrito: item.distrito || '',
    provincia: item.provincia || '',
    departamento: item.departamento || '',
    centro_poblado: item.centro_poblado || '',
    categoria: item.categoria || '',
    poblacion: item.poblacion || 0,
    viviendas_empadronadas: item.viviendas_empadronadas || 0,
    viviendas_ocupadas: item.viviendas_ocupadas || 0
  }));
}

export function transformLenguasMaternasTabla(data: any): any[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const lenguasMap = new Map<string, any>();
  let totalCasos = 0;

  data.forEach((item: any) => {
    const lengua = (item.idioma || item.lengua_materna || 'Sin categoría').trim();
    const key = lengua.toLowerCase();

    const cantidad = item.casos || item.hablantes || 0;
    totalCasos += cantidad;

    if (lenguasMap.has(key)) {
      const existing = lenguasMap.get(key);
      existing.casos = (existing.casos || 0) + cantidad;
    } else {
      lenguasMap.set(key, {
        categoria: lengua,
        casos: cantidad,
        porcentaje: 0
      });
    }
  });

  const resultado = Array.from(lenguasMap.values());
  resultado.forEach((item: any) => {
    item.porcentaje = totalCasos > 0 ? Math.round((item.casos / totalCasos) * 10000) / 100 : 0;
  });

  resultado.sort((a, b) => (b.casos || 0) - (a.casos || 0));

  return resultado;
}

export function transformReligionesTabla(data: any): any[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const religionesMap = new Map<string, any>();
  let totalCasos = 0;

  data.forEach((item: any) => {
    const religion = (item.religion || 'Sin categoría').trim();
    const key = religion.toLowerCase();

    const cantidad = item.casos || 0;
    totalCasos += cantidad;

    if (religionesMap.has(key)) {
      const existing = religionesMap.get(key);
      existing.casos = (existing.casos || 0) + cantidad;
    } else {
      religionesMap.set(key, {
        categoria: religion,
        casos: cantidad,
        porcentaje: 0
      });
    }
  });

  const resultado = Array.from(religionesMap.values());
  resultado.forEach((item: any) => {
    item.porcentaje = totalCasos > 0 ? Math.round((item.casos / totalCasos) * 10000) / 100 : 0;
  });

  resultado.sort((a, b) => (b.casos || 0) - (a.casos || 0));

  return resultado;
}

export function transformPoblacionSexoDesdeDemograficos(data: any): any[] {
  const arr = Array.isArray(data) ? data : [];
  if (arr.length === 0) {
    return [];
  }

  const item = arr[0];
  return [
    { sexo: 'Hombre', casos: item?.hombres || 0 },
    { sexo: 'Mujer', casos: item?.mujeres || 0 }
  ];
}

export function transformPoblacionEtarioDesdeDemograficos(data: any): any[] {
  const arr = Array.isArray(data) ? data : [];
  if (arr.length === 0) {
    return [];
  }

  const d = arr[0];
  return [
    { categoria: 'Menores de 1', casos: d?.menores_1 || 0 },
    { categoria: '1-14 años', casos: d?.de_1_a_14 || 0 },
    { categoria: '15-29 años', casos: d?.de_15_a_29 || 0 },
    { categoria: '30-44 años', casos: d?.de_30_a_44 || 0 },
    { categoria: '45-64 años', casos: d?.de_45_a_64 || 0 },
    { categoria: '65+ años', casos: d?.mayores_65 || 0 }
  ].filter((item) => (item.casos || 0) > 0);
}

export function transformPETDesdeAisdPet(data: any): any[] {
  const arr = Array.isArray(data) ? data : [];
  return arr.map((item: any) => ({
    categoria: item.categoría || item.categoria,
    casos: item.casos || 0
  }));
}

export function transformActividadesEconomicas(data: any): any[] {
  const arr = Array.isArray(data) ? data : [];
  return arr.map((item: any) => ({
    actividad: item.actividad || '',
    casos: item.casos || 0,
    porcentaje: item.porcentaje || null
  }));
}
