export interface AutoMergeKeyStrategy {
  id: string;
  matches: (item: any) => boolean;
  key: (item: any) => string;
}

export function createAutoMergeKeyStrategies(): AutoMergeKeyStrategy[] {
  return [
    {
      id: 'seguro-salud',
      matches: (item) => !!item?.tipo_seguro,
      key: (item) => `seg|${item.tipo_seguro}`
    },
    {
      id: 'materiales',
      matches: (item) => !!item?.categoria && !!(item?.tipo_material ?? item?.tipoMaterial),
      key: (item) => `mat|${item.categoria}|${item.tipo_material ?? item.tipoMaterial}`
    },
    {
      id: 'servicios',
      matches: (item) => !!item?.servicio && !!item?.tipo,
      key: (item) => `svc|${item.servicio}|${item.tipo}`
    },
    {
      id: 'actividad',
      matches: (item) => !!item?.actividad,
      key: (item) => `act|${item.actividad}`
    },
    {
      id: 'idioma',
      matches: (item) => !!item?.idioma,
      key: (item) => `idi|${item.idioma}`
    },
    {
      id: 'lengua-materna',
      matches: (item) => !!item?.lengua_materna,
      key: (item) => `lng|${item.lengua_materna}`
    },
    {
      id: 'religion',
      matches: (item) => !!item?.religion,
      key: (item) => `rel|${item.religion}`
    },
    {
      id: 'necesidad',
      matches: (item) => !!item?.necesidad,
      key: (item) => `nbi|${item.necesidad}`
    },
    {
      id: 'carencia',
      matches: (item) => !!item?.carencia,
      key: (item) => `car|${item.carencia}`
    },
    {
      id: 'sexo',
      matches: (item) => !!item?.sexo,
      key: (item) => `sex|${item.sexo}`
    },
    {
      id: 'nivel-educativo',
      matches: (item) => !!item?.nivel_educativo,
      key: (item) => `edu|${item.nivel_educativo}`
    },
    {
      id: 'indicador',
      matches: (item) => !!item?.indicador,
      key: (item) => `ind|${item.indicador}`
    },
    {
      id: 'categoria',
      matches: (item) => !!item?.categoria,
      key: (item) => `cat|${item.categoria}`
    },
    {
      id: 'fallback',
      matches: () => true,
      key: () => '__single__'
    }
  ];
}
