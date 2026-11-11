/**
 * Historial de novedades de TrainClub.
 * Cada versión describe qué cambió para mostrarlo en la guía de novedades.
 * Cuando se incrementa ONBOARDING_VERSION en Onboarding.jsx,
 * añadir aquí la entrada correspondiente.
 */

export const CHANGELOG = {
  1: {
    titulo: 'Bienvenido a TrainClub',
    subtitulo: 'Tu entrenador personal en el bolsillo',
    tipo: 'inicial', // no muestra "novedades", muestra el tutorial completo
    novedades: [],
  },
  2: {
    titulo: '¡TrainClub se actualiza!',
    subtitulo: 'Estas son las novedades de esta versión',
    tipo: 'update',
    novedades: [
      { icon: '⏱', texto: 'Temporizador de descanso entre series (1\', 1\'30, 2\' y 3\')' },
      { icon: '🎯', texto: 'Alternativas de ejercicio ahora muestran la zona muscular específica (pecho alto, deltoides posterior…)' },
      { icon: '📦', texto: 'GIFs de ejercicios alojados en nuestros servidores — sin dependencias externas' },
      { icon: '🗺️', texto: 'Guía interactiva de bienvenida para nuevos usuarios' },
    ],
  },
  3: {
    titulo: '¡TrainClub se actualiza!',
    subtitulo: 'Registro serie a serie y récords de verdad',
    tipo: 'update',
    novedades: [
      { icon: '📝', texto: 'Cada serie registra kg y repeticiones (o segundos en planchas), con la columna "Anterior" de tu última sesión' },
      { icon: '✅', texto: 'Marca cada serie como hecha: el descanso arranca solo' },
      { icon: '🏆', texto: 'Las marcas personales cuentan en cualquier serie, no solo en la primera, e incluyen 1RM estimado' },
      { icon: '🔄', texto: 'Cada alternativa guarda su propio progreso' },
      { icon: '🔁', texto: 'Rotación automática de ejercicios cada 4 semanas para variar el estímulo' },
      { icon: '🖼️', texto: 'Imágenes revisadas: cada ejercicio muestra su movimiento correcto' },
    ],
  },
}
