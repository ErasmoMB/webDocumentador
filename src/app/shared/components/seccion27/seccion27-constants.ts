/**
 * ✅ SECCION 27 - Infraestructura para transportes y comunicaciones (B.1.6)
 * Constantes y configuración centralizada
 * MODO IDEAL: 100% de textos centralizados, 0% hardcodeados en templates
 */

export const SECCION27_SECTION_ID = '3.1.4.B.1.6';

export const SECCION27_PHOTO_PREFIXES = {
  TRANSPORTE: 'fotografiaTransporteAISI',
  TELECOMUNICACIONES: 'fotografiaTelecomunicacionesAISI'
};

export const SECCION27_WATCHED_FIELDS = [
  // Párrafos de transporte
  'textoTransporteCP1',
  'textoTransporteCP2',
  
  // Costos de transporte
  'costoTransporteMinimo',
  'costoTransporteMaximo',
  
  // Párrafos de telecomunicaciones
  'textoTelecomunicacionesCP1',
  'textoTelecomunicacionesCP2',
  'textoTelecomunicacionesCP3',
  
  // Tabla y metadatos de telecomunicaciones
  'telecomunicacionesCpTabla',
  'cuadroTituloTelecomunicaciones',
  'cuadroFuenteTelecomunicaciones',
  
  // Centro poblado
  'centroPobladoAISI',
  'distritoSeleccionado',
  'ciudadOrigenComercio',
  
  // Fotografías de transporte
  ...Array.from({ length: 10 }, (_, i) => `fotografiaTransporteAISI${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaTransporteAISI${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaTransporteAISI${i + 1}Imagen`),
  
  // Fotografías de telecomunicaciones
  ...Array.from({ length: 10 }, (_, i) => `fotografiaTelecomunicacionesAISI${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaTelecomunicacionesAISI${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaTelecomunicacionesAISI${i + 1}Imagen`),
];

export const SECCION27_TEXT_FIELDS = [
  'textoTransporteCP1',
  'textoTransporteCP2',
  'textoTelecomunicacionesCP1',
  'textoTelecomunicacionesCP2',
  'textoTelecomunicacionesCP3'
];

export const SECCION27_TEMPLATES = {
  // ✅ TITULO DE SECCION
  tituloSeccion: 'B.1.6. Infraestructura para transportes y comunicaciones',
  
  // ✅ SUBSECCIONES (LETRAS)
  tituloSubseccionTransporte: 'a. Transporte',
  tituloSubseccionTelecomunicaciones: 'b. Telecomunicaciones',
  
  // ✅ SECCIONES DE EDICION
  tituloEditarParrafos: 'Editar Párrafos',
  
  // ✅ LABELS DE FORMULARIO - TRANSPORTE
  labelParrafoTransporte1: 'Transporte - Párrafo 1',
  labelParrafoTransporte2: 'Transporte - Párrafo 2',
  labelCostoTransporteMinimo: 'Costo mínimo de transporte (S/.)',
  labelCostoTransporteMaximo: 'Costo máximo de transporte (S/.)',
  labelFotosTransporte: 'Fotografías de Transporte',
  
  // ✅ HINTS DE FORMULARIO
  hintParrafo: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintCosto: 'Ingrese el costo en soles',
  
  // ✅ LABELS DE FORMULARIO - TELECOMUNICACIONES
  labelParrafoTelecomunicaciones1: 'Telecomunicaciones - Párrafo 1',
  labelParrafoTelecomunicaciones2: 'Telecomunicaciones - Párrafo 2',
  labelParrafoTelecomunicaciones3: 'Telecomunicaciones - Párrafo 3',
  labelTablaTelecomunicaciones: 'Tabla Servicios de telecomunicaciones',
  labelCuadroTitulo: 'Título del cuadro',
  labelCuadroFuente: 'Fuente del cuadro',
  labelFotosTelecomunicaciones: 'Fotografías de Telecomunicaciones',
  
  // ✅ PLACEHOLDERS DE FORMULARIO
  placeholderCosto: 'Ej: 25',
  placeholderCuadroTitulo: 'Título del cuadro',
  placeholderCuadroFuente: 'Fuente del cuadro',
  placeholderFotoTituloTransporte: 'Ej: Infraestructura de transporte',
  placeholderFotoTituloTelecomunicaciones: 'Ej: Infraestructura de telecomunicaciones',
  placeholderFotoFuente: 'Ej: GEADES, 2024',
  placeholderMedioComunicacion: 'Ej: Emisoras de radio',
  placeholderDescripcion: 'Ej: RPP, Nacional, Unión',
  
  // ✅ VALORES POR DEFECTO DE FOTOGRAFÍAS
  tituloFotoTransporteDefault: 'Infraestructura de transporte',
  tituloFotoTelecomunicacionesDefault: 'Infraestructura de telecomunicaciones',
  fuenteFotoDefault: 'GEADES, 2024',
  
  // ✅ LABELS DE FOTOGRAFÍAS (view)
  labelFotoTitulo: 'Título',
  labelFotoFuente: 'Fuente',
  labelFotoImagen: 'Imagen',
  
  // ✅ COLUMNAS DE TABLA
  columnaMedioComunicacion: 'Medio de comunicación',
  columnaDescripcion: 'Descripción',
  
  // ✅ TEXTOS POR DEFECTO CON PLACEHOLDERS
  textoTransporteCP1Template: `En el CP _____, la infraestructura de transporte es limitada. Dentro de la localidad solo se encuentran trochas carrozables que permiten llegar al centro poblado. Estas vías facilitan el acceso en vehículos, pero son de tierra y no están pavimentadas, lo que dificulta el tránsito en épocas de lluvias o durante el invierno. Los demás puntos poblados dentro del distrito también son accesibles mediante trochas carrozables, aunque en condiciones más precarias que las principales que permiten el acceso al centro poblado.`,
  
  textoTransporteCP2Template: `Por otro lado, no existen empresas de transporte formalmente establecidas dentro de la localidad. Sin embargo, existe un servicio de transporte frecuente que es provisto por una combi todos los días lunes. El único destino de esta movilidad es la ciudad de {{ciudadOrigen}}, a la cual parte cerca de las 10:30 am desde la capital distrital de {{distrito}}. El costo por este servicio varía entre S/. {{costoMin}} y S/. {{costoMax}} por trayecto, dependiendo de la demanda y las condiciones del viaje. Es así que esta es la única opción que tienen los habitantes para desplazarse a ciudades más grandes.`,
  
  textoTelecomunicacionesCP1Template: `En el CP _____, la infraestructura en telecomunicaciones proporciona acceso a diversos servicios de comunicación que conectan a la población con el resto del país. Aunque existen algunas limitaciones, los servicios disponibles permiten que los habitantes se mantengan informados y comunicados.`,
  
  textoTelecomunicacionesCP2Default: `En cuanto a radiodifusión, se puede captar señal de emisoras nacionales como RPP, Nacional y Unión, las cuales sirven como importantes fuentes de información y entretenimiento para la población local. Estas emisoras proporcionan noticias, música y programas de interés general que son valorados por los habitantes del centro poblado.`,
  
  textoTelecomunicacionesCP3Template: `Respecto a la señal de televisión, el centro poblado cuenta con acceso a América TV a través de señal abierta. Adicionalmente, algunas familias en _____ optan por servicios de televisión satelital como DIRECTV, lo que les permite acceder a una mayor variedad de canales y contenido.\n\nEn lo que respecta a la telefonía móvil e internet, la cobertura es proporcionada por las operadoras Movistar, Claro y Entel, lo que facilita la comunicación dentro del área y con el exterior. Para el acceso a internet, la población principalmente se conecta a través de los datos móviles proporcionados por Movistar y Entel, lo que les permite mantenerse conectados para actividades cotidianas y laborales.`,
};

export const SECCION27_METADATA = {
  SECTION_ID: SECCION27_SECTION_ID,
  TITLE: SECCION27_TEMPLATES.tituloSeccion,
  SUBSECTION_A: SECCION27_TEMPLATES.tituloSubseccionTransporte,
  SUBSECTION_B: SECCION27_TEMPLATES.tituloSubseccionTelecomunicaciones
};
