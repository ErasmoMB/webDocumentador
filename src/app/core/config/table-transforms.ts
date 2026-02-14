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
  // El backend ya devuelve los datos correctamente con categoria, casos y porcentaje
  const datosArray = normalizeArrayFromApi(data);
  if (datosArray.length === 0) {
    return [];
  }
  
  // Devolver los datos tal cual del backend (sin recalcular porcentajes)
  return datosArray.map((item: any) => ({
    categoria: item.categoria || '',
    casos: item.casos || 0,
    porcentaje: item.porcentaje || ''
  }));
}

export function transformTasaAnalfabetismoTabla(data: any): any[] {
  // El backend devuelve 'categoria' pero la tabla espera 'indicador'
  const datosArray = normalizeArrayFromApi(data);
  if (datosArray.length === 0) {
    return [];
  }
  
  // Mapear 'categoria' a 'indicador' para la tabla
  return datosArray.map((item: any) => ({
    indicador: item.categoria || '',
    casos: item.casos || 0,
    porcentaje: item.porcentaje || ''
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
  // NOTA: El backend devuelve un array con un objeto que tiene:
  // [{ hombres: 332, mujeres: 290, total: 622, porcentaje_hombres: "53.38 %", porcentaje_mujeres: "46.62 %" }]
  
  // Si es array, tomar el primer elemento
  const item = Array.isArray(data) ? data[0] : data;
  
  if (!item) {
    return [];
  }

  // Transformar a formato de tabla con formato correcto (incluyendo Total)
  return [
    { sexo: 'Hombre', casos: item.hombres || 0, porcentaje: item.porcentaje_hombres || '0 %' },
    { sexo: 'Mujer', casos: item.mujeres || 0, porcentaje: item.porcentaje_mujeres || '0 %' },
    { sexo: 'Total', casos: item.total || 0, porcentaje: '100.00 %' }
  ].filter(row => (row.casos || 0) > 0);
}

export function transformPoblacionEtarioDesdeDemograficos(data: any): any[] {
  // NOTA: El backend devuelve DIRECTAMENTE el array de rows (después de unwrapDemograficoData):
  // [
  //   { categoria: "0-14 años", casos: 143, porcentaje: "22.99 %" },
  //   { categoria: "15-29 años", casos: 91, porcentaje: "14.63 %" },
  //   ...
  //   { categoria: "Total", casos: 622, porcentaje: "100.00 %" }
  // ]
  
  const arr = Array.isArray(data) ? data : [];
  
  // Devolver todas las filas incluyendo Total (igual que en transformPoblacionSexoDesdeDemograficos)
  return arr.filter((row: any) => {
    const casos = (row.casos || 0) > 0;
    return casos;
  });
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

/**
 * ✅ Transformar datos de NBI V2 desde backend (sp_nbi_from_cpp_v2)
 * Para tabla: "Necesidades Básicas Insatisfechas (NBI) según población"
 * 
 * El backend devuelve:
 * [
 *   { categoria: "Población en Viviendas con características físicas inadecuadas", casos: 161, porcentaje: "32,92 %" },
 *   { categoria: "Población en Viviendas con hacinamiento", casos: 90, porcentaje: "34,75 %" },
 *   { categoria: "Población en Viviendas sin servicios higiénicos", casos: 25, porcentaje: "5,11 %" },
 *   { categoria: "Población en Hogares con niños que no asisten a la escuela", casos: 0, porcentaje: "0,00 %" },
 *   { categoria: "Total referencial", casos: 489, porcentaje: "" }
 * ]
 */
export function transformNbiV2TablaSegunPoblacion(data: any): any[] {
  // MAPEO DIRECTO DEL BACKEND: f0 → categoria, f1 → casos, f2 → porcentaje
  // SIN CÁLCULOS ADICIONALES
  const arr = Array.isArray(data) ? data : [];
  return arr.map((item: any) => ({
    categoria: item.f0 || '',
    casos: item.f1 || 0,
    porcentaje: item.f2 || ''
  }));
}

/**
 * ✅ Transformar datos de NBI V2 para tabla de Tipos de NBI existentes
 * Es la misma transformación que transformNbiV2TablaSegunPoblacion
 * pero se usa para la segunda tabla del patrón
 */
export function transformNbiV2TiposExistentes(data: any): any[] {
  return transformNbiV2TablaSegunPoblacion(data);
}

/**
 * ✅ SECCION 30: Transformar datos de Nivel Educativo desde endpoint /demograficos/educacion
 * El backend devuelve filas directamente con: { categoria, casos, porcentaje }
 * Incluye la fila Total que debe ser mostrada en la tabla
 */
export function transformNivelEducativoDesdeDemograficos(data: any): any[] {
  const arr = Array.isArray(data) ? data : [];
  // Devolver todas las filas incluyendo Total (viene del backend)
  return arr.filter((row: any) => {
    const casos = (row.casos || 0) >= 0;
    return casos;
  }).map((row: any) => ({
    nivel: row.categoria || row.nivel || '',
    casos: row.casos || 0,
    porcentaje: row.porcentaje || '0.00 %'
  }));
}

/**
 * ✅ SECCION 30: Transformar datos de Tasa de Analfabetismo desde endpoint /demograficos/alfabetizacion
 * El backend devuelve filas directamente con: { categoria, casos, porcentaje }
 * Se mapea a: { indicador, casos, porcentaje }
 * Incluye la fila Total que debe ser mostrada en la tabla
 */
export function transformTasaAnalfabetismoDesdeDemograficos(data: any): any[] {
  const arr = Array.isArray(data) ? data : [];
  // Devolver todas las filas incluyendo Total (viene del backend)
  return arr.filter((row: any) => {
    const casos = (row.casos || 0) >= 0;
    return casos;
  }).map((row: any) => ({
    indicador: row.categoria || row.indicador || '',
    casos: row.casos || 0,
    porcentaje: row.porcentaje || '0.00 %'
  }));
}
