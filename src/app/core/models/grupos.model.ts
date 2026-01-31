/**
 * Modelo de Centro Poblado
 * Representa un centro poblado del JSON cargado
 */
export interface CentroPoblado {
  ITEM: number;
  UBIGEO: number | string;
  CODIGO: number | string;
  CCPP: string;
  CATEGORIA: string;
  POBLACION: number;
  DPTO: string;
  PROV: string;
  DIST: string;
  ESTE: number;
  NORTE: number;
  ALTITUD: number;
}

/**
 * Grupo AISD (Área de Influencia Social Directa)
 * Basado en Comunidades Campesinas
 */
export interface GrupoAISD {
  id: string; // UUID único
  nombre: string; // Ej: "Comunidad Cahuacho"
  tipo: 'AISD';
  orden: number; // 1, 2, 3... para generar A.1, A.2, A.3
  centrosPoblados: CentroPoblado[]; // CCPP seleccionados
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Grupo AISI (Área de Influencia Social Indirecta)
 * Basado en Distritos
 */
export interface GrupoAISI {
  id: string; // UUID único
  nombre: string; // Ej: "Distrito San Pedro"
  tipo: 'AISI';
  orden: number; // 1, 2, 3... para generar B.1, B.2, B.3
  centrosPoblados: CentroPoblado[]; // CCPP seleccionados
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Unión de tipos de grupos
 */
export type Grupo = GrupoAISD | GrupoAISI;

/**
 * Contexto de grupo inyectado en subsecciones
 * Se pasa a componentes de sección 4-30
 */
export interface ContextoGrupo {
  grupoTipo: 'AISD' | 'AISI';
  grupoId: string;
  grupoNombre: string;
  grupoOrden: number; // Para generar índice
  seccionNumero: string; // Ej: "A.1.4" o "B.2.7"
  seccionTitulo: string;
  centrosPoblados: CentroPoblado[];
}

/**
 * Configuración de secciones AISD (4-20)
 */
export const SECCIONES_AISD = [
  { numero: 4, subseccion: 1, titulo: 'Características demográficas' },
  { numero: 5, subseccion: 2, titulo: 'Servicios públicos' },
  { numero: 6, subseccion: 3, titulo: 'Actividades económicas' },
  { numero: 7, subseccion: 4, titulo: 'Empleo y PEA' },
  { numero: 8, subseccion: 5, titulo: 'Educación' },
  { numero: 9, subseccion: 6, titulo: 'Salud' },
  { numero: 10, subseccion: 7, titulo: 'Vivienda' },
  { numero: 11, subseccion: 8, titulo: 'Agua y saneamiento' },
  { numero: 12, subseccion: 9, titulo: 'Energía eléctrica' },
  { numero: 13, subseccion: 10, titulo: 'Transporte y vías' },
  { numero: 14, subseccion: 11, titulo: 'Comunicaciones' },
  { numero: 15, subseccion: 12, titulo: 'Organización social' },
  { numero: 16, subseccion: 13, titulo: 'Cultura e identidad' },
  { numero: 17, subseccion: 14, titulo: 'Seguridad ciudadana' },
  { numero: 18, subseccion: 15, titulo: 'Conflictos sociales' },
  { numero: 19, subseccion: 16, titulo: 'Percepciones del proyecto' },
  { numero: 20, subseccion: 17, titulo: 'Síntesis AISD' }
];

/**
 * Configuración de secciones AISI (21-30)
 */
export const SECCIONES_AISI = [
  { numero: 21, subseccion: 1, titulo: 'Ubicación geográfica' },
  { numero: 22, subseccion: 2, titulo: 'Población y demografía' },
  { numero: 23, subseccion: 3, titulo: 'Servicios básicos' },
  { numero: 24, subseccion: 4, titulo: 'Economía local' },
  { numero: 25, subseccion: 5, titulo: 'Infraestructura' },
  { numero: 26, subseccion: 6, titulo: 'Desarrollo social' },
  { numero: 27, subseccion: 7, titulo: 'Medio ambiente' },
  { numero: 28, subseccion: 8, titulo: 'Gobernanza' },
  { numero: 29, subseccion: 9, titulo: 'Análisis de impactos' },
  { numero: 30, subseccion: 10, titulo: 'Síntesis AISI' }
];
