declare const window: any;

const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
    return window.__ENV__[key];
  }
  return defaultValue;
};

export const environment = {
  production: true,
  useMockData: getEnvVar('USE_MOCK_DATA', 'false') === 'true',
  apiUrl: getEnvVar('API_URL', 'https://api.proyectopaka.com/api'),
  mockDataPath: getEnvVar('MOCK_DATA_PATH', 'assets/mockData'),
  mockDataFiles: {
    shared: {
      economia: 'economia.json',
      pea: 'pea.json',
      poblacion: 'poblacion.json'
    },
    aisd: {
      'a1-1': 'a1-1-institucionalidad.json',
      'a1-2': 'a1-2-demografia.json',
      'a1-3': 'a1-3-pea.json',
      'a1-4': 'a1-4-actividades.json',
      'a1-12': 'a1-12-uso-suelos.json',
      'a1-13': 'a1-13-idh.json',
      'a1-14': 'a1-14-nbi.json',
      'a1-15': 'a1-15-organizacion.json',
      'a1-16': 'a1-16-festividades.json'
    },
    aisi: {
      'b1-1': 'b1-1-demografia.json',
      'b1-2': 'b1-2-pea.json',
      'b1-3': 'b1-3-actividades.json',
      'b1-4': 'b1-4-vivienda.json',
      'b1-5': 'b1-5-servicios.json',
      'b1-6': 'b1-6-infraestructura.json',
      'b1-7': 'b1-7-infraestructura-social.json',
      'b1-8': 'b1-8-salud.json',
      'b1-9': 'b1-9-educacion.json'
    }
  }
};
