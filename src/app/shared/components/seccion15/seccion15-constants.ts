/**
 * Constantes para Sección 15: Aspectos Culturales
 * Reutilizables entre form y view components
 */

export const SECCION15_PHOTO_PREFIX = 'fotografiaIglesia';

export const SECCION15_DEFAULT_TEXTS = {
  textoAspectosCulturalesDefault: (comunidad: string) =>
    `Los aspectos culturales juegan un papel significativo en la vida social y cultural de una comunidad, influyendo en sus valores, costumbres y prácticas cotidianas. En esta sección, se caracterizan y describen la diversidad religiosa en la CC ${comunidad}, explorando las principales creencias.`,

  textoIdiomaDefault: 'La lengua materna es la primera lengua o idioma que aprende una persona. De la data obtenida de los Censos Nacionales 2017, se aprecia que el castellano es la categoría mayoritaria, pues representa la mayor parte de la población de 3 años a más. En segundo lugar se halla el quechua como primer idioma.',

  textoReligionDefault: (comunidad: string) =>
    `En la actualidad, la confesión predominante dentro de la CC ${comunidad} es la católica. Según las entrevistas aplicadas, la permanencia del catolicismo como la religión mayoritaria se debe a la presencia de la iglesia, denominada Iglesia Matriz ${comunidad}, y a la inexistencia de templos evangélicos o de otras confesiones.\n\nEsta iglesia es el principal punto de reunión religiosa de la comunidad y juega un rol importante en la vida espiritual de sus habitantes. Otro espacio con gran valor espiritual es el cementerio, en donde los comuneros entierran y visitan a sus difuntos. Este lugar sehalla al sur del anexo ${comunidad}.`
};
