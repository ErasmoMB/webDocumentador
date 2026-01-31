import { Injectable } from '@angular/core';
import { ComunidadCampesina, Distrito } from 'src/app/core/models/formulario.model';

/**
 * Servicio especializado para generar textos dinámicos de la Sección 2
 * Extrae toda la lógica de generación de texto del componente
 */
@Injectable({ providedIn: 'root' })
export class Seccion2TextGeneratorService {

  /**
   * Obtiene el texto formateado de comunidades (ej: "Comunidad1", "Comunidad1 y Comunidad2", etc.)
   */
  obtenerTextoComunidades(comunidades: ComunidadCampesina[]): string {
    const comunidadesValidas = this.filtrarComunidadesValidas(comunidades);
    
    if (comunidadesValidas.length === 0) {
      return '____';
    }
    if (comunidadesValidas.length === 1) {
      return comunidadesValidas[0].nombre;
    }
    if (comunidadesValidas.length === 2) {
      return `${comunidadesValidas[0].nombre} y ${comunidadesValidas[1].nombre}`;
    }
    
    const ultima = comunidadesValidas[comunidadesValidas.length - 1].nombre;
    const anteriores = comunidadesValidas.slice(0, -1).map(cc => cc.nombre).join(', ');
    return `${anteriores} y ${ultima}`;
  }

  /**
   * Obtiene el texto plural de comunidades
   */
  obtenerTextoComunidadesPlural(comunidades: ComunidadCampesina[]): string {
    const comunidadesValidas = this.filtrarComunidadesValidas(comunidades);
    return comunidadesValidas.length > 1 
      ? 'las comunidades campesinas (CC)' 
      : 'la comunidad campesina (CC)';
  }

  /**
   * Obtiene el texto singular de comunidades
   */
  obtenerTextoComunidadesSingular(comunidades: ComunidadCampesina[]): string {
    const comunidadesValidas = this.filtrarComunidadesValidas(comunidades);
    return comunidadesValidas.length > 1 ? 'estas comunidades' : 'esta comunidad';
  }

  /**
   * Obtiene el texto de posesión de comunidades
   */
  obtenerTextoComunidadesPosesion(comunidades: ComunidadCampesina[]): string {
    const comunidadesValidas = this.filtrarComunidadesValidas(comunidades);
    return comunidadesValidas.length > 1 
      ? 'Estas comunidades poseen' 
      : 'Esta comunidad posee';
  }

  /**
   * Obtiene el texto de comunidades para impactos
   */
  obtenerTextoComunidadesImpactos(comunidades: ComunidadCampesina[]): string {
    return this.obtenerTextoComunidades(comunidades);
  }

  /**
   * Obtiene el texto de comunidades para el final del párrafo
   */
  obtenerTextoComunidadesFinal(comunidades: ComunidadCampesina[]): string {
    return this.obtenerTextoComunidades(comunidades);
  }

  /**
   * Obtiene el prefijo para impactos de comunidades
   */
  obtenerPrefijoCCImpactos(comunidades: ComunidadCampesina[]): string {
    const comunidadesValidas = this.filtrarComunidadesValidas(comunidades);
    return comunidadesValidas.length > 1 ? 'las CC ' : 'la CC ';
  }

  /**
   * Obtiene el prefijo para el final del párrafo
   */
  obtenerPrefijoCCFinal(comunidades: ComunidadCampesina[]): string {
    return this.obtenerPrefijoCCImpactos(comunidades);
  }

  /**
   * Verifica si hay una sola comunidad
   */
  tieneUnaComunidad(comunidades: ComunidadCampesina[]): boolean {
    return this.filtrarComunidadesValidas(comunidades).length === 1;
  }

  /**
   * Verifica si hay múltiples comunidades
   */
  tieneMultiplesComunidades(comunidades: ComunidadCampesina[]): boolean {
    return this.filtrarComunidadesValidas(comunidades).length > 1;
  }

  /**
   * Obtiene el texto formateado de distritos AISI
   */
  obtenerTextoAISI(distritos: Distrito[]): string {
    const nombresDistritos = distritos
      .map(d => d.nombre?.trim())
      .filter(nombre => nombre && nombre !== '');
    
    if (nombresDistritos.length === 0) {
      return '____';
    }
    if (nombresDistritos.length === 1) {
      return nombresDistritos[0];
    }
    if (nombresDistritos.length === 2) {
      return `${nombresDistritos[0]} y ${nombresDistritos[1]}`;
    }
    
    const ultimo = nombresDistritos[nombresDistritos.length - 1];
    const anteriores = nombresDistritos.slice(0, -1).join(', ');
    return `${anteriores} y ${ultimo}`;
  }

  /**
   * Obtiene el texto plural de distritos AISI
   */
  obtenerTextoAISIPlural(distritos: Distrito[]): string {
    const nombresDistritos = distritos
      .map(d => d.nombre?.trim())
      .filter(nombre => nombre && nombre !== '');
    return nombresDistritos.length > 1 ? 'distritos' : 'distrito';
  }

  /**
   * Obtiene el texto de centros poblados AISI
   */
  obtenerTextoAISICentrosPoblados(distritos: Distrito[]): string {
    const nombresDistritos = distritos
      .map(d => d.nombre?.trim())
      .filter(nombre => nombre && nombre !== '');
    return nombresDistritos.length > 1 ? 'centros poblados' : 'centro poblado';
  }

  /**
   * Genera el texto completo del párrafo AISD
   */
  generarTextoAISDCompleto(
    comunidades: ComunidadCampesina[],
    distritoSeleccionado: string,
    aisdComponente1: string,
    aisdComponente2: string,
    departamentoSeleccionado: string
  ): string {
    const tieneUna = this.tieneUnaComunidad(comunidades);
    const tieneMultiples = this.tieneMultiplesComunidades(comunidades);
    const textoComunidades = this.obtenerTextoComunidades(comunidades);
    
    // ✅ Si no hay comunidades, retornar texto por defecto con placeholders
    if (!tieneUna && !tieneMultiples) {
      return `El Área de influencia social directa (AISD) se delimita en torno a las comunidades campesinas (CC) ____. La delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales. Las comunidades y gestiona las tierras donde se llevará a cabo la exploración minera, lo que implica una relación directa y significativa con el Proyecto.\n\nLa titularidad de estas tierras establece un vínculo crucial con los pobladores locales, ya que cualquier actividad realizada en el área puede influir directamente sus derechos, usos y costumbres asociados a la tierra. Además, la gestión y administración de estos terrenos por parte de las comunidades requieren una consideración detallada en la planificación y ejecución del Proyecto, asegurando que las operaciones se lleven a cabo con respeto a la estructura organizativa y normativa de las comunidades.\n\nLos impactos directos en las comunidades campesinas, derivados del proyecto de exploración minera, incluyen la contratación de mano de obra local, la interacción con las costumbres y autoridades, y otros efectos socioeconómicos y culturales. La generación de empleo local no solo proporcionará oportunidades económicas inmediatas, sino que también fomentará el desarrollo de habilidades y capacidades en la población. La interacción constante con las autoridades y las comunidades promoverán un diálogo y una cooperación que son esenciales para el éxito del Proyecto, respetando y adaptándose a las prácticas y tradiciones locales.`;
    }
    
    let texto = `El Área de influencia social directa (AISD) se delimita en torno a ${
      tieneUna ? 'la comunidad campesina (CC)' : 'las comunidades campesinas (CC)'
    } ${textoComunidades}`;
    
    texto += tieneUna
      ? `, cuya área comunal se encuentra predominantemente en el distrito de ${distritoSeleccionado || '____'} y en menor proporción en los distritos de ${aisdComponente1 || '____'} y de ${aisdComponente2 || '____'}, pertenecientes al departamento de ${departamentoSeleccionado || '____'}`
      : `, cuyas áreas comunales se encuentran predominantemente en el distrito de ${distritoSeleccionado || '____'} y en menor proporción en los distritos de ${aisdComponente1 || '____'} y de ${aisdComponente2 || '____'}, pertenecientes al departamento de ${departamentoSeleccionado || '____'}`;
    
    texto += `. La delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales. ${this.obtenerTextoComunidadesPosesion(comunidades)} y gestiona${tieneMultiples ? 'n' : ''} las tierras donde se llevará a cabo la exploración minera, lo que implica una relación directa y significativa con el Proyecto.\n\n`;
    
    texto += `La titularidad de estas tierras establece un vínculo crucial con los pobladores locales, ya que cualquier actividad realizada en el área puede influir directamente sus derechos, usos y costumbres asociados a la tierra. Además, la gestión y administración de estos terrenos por parte de ${this.obtenerTextoComunidadesSingular(comunidades)} requiere${tieneMultiples ? 'n' : ''} una consideración detallada en la planificación y ejecución del Proyecto, asegurando que las operaciones se lleven a cabo con respeto a la estructura organizativa y normativa de ${tieneUna ? 'la comunidad' : 'las comunidades'}.\n\n`;
    
    texto += `Los impactos directos en ${this.obtenerPrefijoCCImpactos(comunidades)}${this.obtenerTextoComunidadesImpactos(comunidades)}, derivados del proyecto de exploración minera, incluyen la contratación de mano de obra local, la interacción con las costumbres y autoridades, y otros efectos socioeconómicos y culturales. La generación de empleo local no solo proporcionará oportunidades económicas inmediatas, sino que también fomentará el desarrollo de habilidades y capacidades en la población. La interacción constante con las autoridades y ${tieneUna ? 'la comunidad' : 'las comunidades'} promoverá${tieneMultiples ? 'n' : ''} un diálogo y una cooperación que son esenciales para el éxito del Proyecto, respetando y adaptándose a las prácticas y tradiciones locales. La consideración de estos factores en la delimitación del AISD garantiza que el Proyecto avance de manera inclusiva y sostenible, alineado con las expectativas y necesidades de ${this.obtenerPrefijoCCFinal(comunidades)}${this.obtenerTextoComunidadesFinal(comunidades)}.`;
    
    return texto;
  }

  /**
   * Genera el texto completo del párrafo AISI
   */
  generarTextoAISICompleto(distritos: Distrito[]): string {
    const distritosNombres = distritos
      .map(d => d.nombre?.trim())
      .filter(nombre => nombre && nombre !== '');
    
    const tieneUnDistrito = distritosNombres.length === 1;
    const tieneMultiplesDistritos = distritosNombres.length > 1;
    const textoAISI = this.obtenerTextoAISI(distritos) || '____';
    
    if (tieneUnDistrito) {
      return `El Área de influencia social indirecta (AISI) se delimita en torno a la capital distrital de la jurisdicción de ${textoAISI}. Esta localidad se considera dentro del AISI debido a su función como centro administrativo y político de su respectivo distrito. Como capital distrital, el Centro Poblado (CP) ${textoAISI} es un punto focal para la interacción con las autoridades locales, quienes jugarán un papel crucial en la gestión y supervisión de las actividades del Proyecto. Además, la adquisición de bienes y servicios esporádicos en este centro poblado será esencial para el soporte logístico, lo que justifica su inclusión en el AISI.\n\nLa delimitación también se basa en la necesidad de establecer un diálogo continuo y efectivo con las autoridades políticas locales en el distrito de ${textoAISI}. Esta interacción es vital para asegurar que las operaciones del Proyecto sean transparentes y alineadas con las normativas locales y las expectativas de la población. Asimismo, la compra esporádica de suministros y la contratación de servicios en este centro poblado contribuirá al dinamismo económico de la capital distrital, generando beneficios indirectos para esta población. De esta manera, la delimitación del AISI considera tanto la dimensión administrativa y política como la económica, garantizando un enfoque integral y sostenible en la implementación del Proyecto.`;
    } else if (tieneMultiplesDistritos) {
      return `El Área de influencia social indirecta (AISI) se delimita en torno a las capitales distritales de las jurisdicciones de ${textoAISI}. Estas localidades se consideran dentro del AISI debido a su función como centros administrativos y políticos de sus respectivos distritos. Como capitales distritales, los Centros Poblados (CP) de ${textoAISI} son puntos focales para la interacción con las autoridades locales, quienes jugarán un papel crucial en la gestión y supervisión de las actividades del Proyecto. Además, la adquisición de bienes y servicios esporádicos en estos centros poblados será esencial para el soporte logístico, lo que justifica su inclusión en el AISI.\n\nLa delimitación también se basa en la necesidad de establecer un diálogo continuo y efectivo con las autoridades políticas locales en los distritos de ${textoAISI}. Esta interacción es vital para asegurar que las operaciones del Proyecto sean transparentes y alineadas con las normativas locales y las expectativas de la población. Asimismo, la compra esporádica de suministros y la contratación de servicios en estos centros poblados contribuirá al dinamismo económico de las capitales distritales, generando beneficios indirectos para esta población. De esta manera, la delimitación del AISI considera tanto la dimensión administrativa y política como la económica, garantizando un enfoque integral y sostenible en la implementación del Proyecto.`;
    }
    
    // ✅ Si no hay distritos cargados, retornar el mismo texto estructurado pero con placeholders
    // Asumimos formato de UN distrito por defecto
    return `El Área de influencia social indirecta (AISI) se delimita en torno a la capital distrital de la jurisdicción de ____. Esta localidad se considera dentro del AISI debido a su función como centro administrativo y político de su respectivo distrito. Como capital distrital, el Centro Poblado (CP) ____ es un punto focal para la interacción con las autoridades locales, quienes jugarán un papel crucial en la gestión y supervisión de las actividades del Proyecto. Además, la adquisición de bienes y servicios esporádicos en este centro poblado será esencial para el soporte logístico, lo que justifica su inclusión en el AISI.\n\nLa delimitación también se basa en la necesidad de establecer un diálogo continuo y efectivo con las autoridades políticas locales en el distrito de ____. Esta interacción es vital para asegurar que las operaciones del Proyecto sean transparentes y alineadas con las normativas locales y las expectativas de la población. Asimismo, la compra esporádica de suministros y la contratación de servicios en este centro poblado contribuirá al dinamismo económico de la capital distrital, generando beneficios indirectos para esta población. De esta manera, la delimitación del AISI considera tanto la dimensión administrativa y política como la económica, garantizando un enfoque integral y sostenible en la implementación del Proyecto.`;
  }

  /**
   * Filtra comunidades válidas (con nombre no vacío)
   */
  private filtrarComunidadesValidas(comunidades: ComunidadCampesina[]): ComunidadCampesina[] {
    return comunidades.filter(cc => cc.nombre && cc.nombre.trim() !== '');
  }
}
