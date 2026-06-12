// tipo: 'peso' = kg por serie | 'tiempo' = segundos | 'reps' = solo repeticiones | 'peso_reps' = peso opcional (ej. fondos lastrados)

const BASE = 'https://fitnessprogramer.com/wp-content/uploads'

export const CICLOS = [
  {
    id: 'hiper', nombre: 'Hipertrofia', semanas: 4, color: '#6366f1', bg: '#eef2ff',
    descripcion: 'Volumen alto · 3–4 series · 8–12 reps · Descanso 60–90 seg',
    objetivo: 'Maximizar el volumen de trabajo para estimular el crecimiento muscular.'
  },
  {
    id: 'fuerza', nombre: 'Fuerza', semanas: 4, color: '#ef4444', bg: '#fef2f2',
    descripcion: 'Carga alta · 4–5 series · 4–6 reps · Descanso 2–3 min',
    objetivo: 'Aumentar la fuerza máxima con pesos más elevados y menos repeticiones.'
  },
  {
    id: 'definicion', nombre: 'Definición', semanas: 4, color: '#10b981', bg: '#ecfdf5',
    descripcion: 'Ritmo alto · 3 series · 12–20 reps · Descanso 45 seg',
    objetivo: 'Quemar grasa preservando músculo con mayor densidad de trabajo.'
  },
  {
    id: 'deload', nombre: 'Deload', semanas: 1, color: '#f59e0b', bg: '#fffbeb',
    descripcion: 'Recuperación · 2–3 series · 50% del peso habitual',
    objetivo: 'Semana de recuperación activa para superar la fatiga acumulada y progresar más en el siguiente ciclo.'
  },
]

// Ajustes de series/reps por ciclo
const MOD = {
  hiper:      { seriesMod: 0, repsMod: '' },
  fuerza:     { seriesMod: +1, repsMod: '4–6' },
  definicion: { seriesMod: -1, repsMod: '12–20' },
  deload:     { seriesMod: -1, repsMod: 'deload' },
}

// Ejercicios alternativos por ciclo (para variedad)
const ALT_CICLO = {
  // [ejercicioId]: { cicloId: { nombre, musculo, gif, tip, tipo } }
  pb: {
    fuerza: { nombre: 'Press banca plano (fuerza)', musculo: 'Pecho', gif: `${BASE}/2021/02/Barbell-Bench-Press.gif`, tip: 'Ciclo fuerza: baja 4–5 seg, sube explosivo. Máximo peso controlado.' },
    definicion: { nombre: 'Press con mancuernas + apertura', musculo: 'Pecho', gif: `${BASE}/2021/02/Dumbbell-Flyes.gif`, tip: 'Ciclo definición: series cortas de descanso, siente el pecho en cada rep.' },
  },
  sq: {
    fuerza: { nombre: 'Sentadilla baja (powerlifting)', musculo: 'Cuádriceps/Glúteos', gif: `${BASE}/2021/02/Barbell-Squat.gif`, tip: 'Ciclo fuerza: posición baja, más glúteo. Máximo peso posible con control.' },
    definicion: { nombre: 'Sentadilla búlgara', musculo: 'Cuádriceps/Glúteos', gif: `${BASE}/2021/04/Bulgarian-Split-Squat.gif`, tip: 'Ciclo definición: pie trasero elevado, mayor rango de movimiento.' },
  },
  jp: {
    fuerza: { nombre: 'Dominadas con lastre', musculo: 'Dorsal ancho', gif: `${BASE}/2021/06/Weighted-Pull-Up.gif`, tip: 'Ciclo fuerza: añade peso al cinturón. 4–5 series de 4–6 reps.' },
    definicion: { nombre: 'Jalón al pecho con cuerda', musculo: 'Dorsal ancho', gif: `${BASE}/2021/02/Lat-Pulldown.gif`, tip: 'Ciclo definición: agarre en cuerda, más rango de movimiento.' },
  },
  pm: {
    fuerza: { nombre: 'Press militar sentado con barra', musculo: 'Deltoides', gif: `${BASE}/2021/02/Barbell-Military-Press.gif`, tip: 'Ciclo fuerza: sentado para más estabilidad y más carga.' },
    definicion: { nombre: 'Press Arnold', musculo: 'Deltoides completo', gif: `${BASE}/2021/02/Arnold-Press.gif`, tip: 'Ciclo definición: rotación completa, trabaja los 3 haces del deltoides.' },
  },
}

const DIAS_BASE = [
  {
    id: 'lunes', nombre: 'Lunes', enfoque: 'Pecho + Tríceps', color: '#6366f1', bg: '#eef2ff', emoji: '💪',
    cardio: 'Caminata inclinada en cinta – 10 min (ritmo rápido)',
    ejercicios: [
      { id: 'pb',   nombre: 'Press banca plano',           musculo: 'Pecho (fibras medias)',    series: 4, reps: '6–8',   tipo: 'peso',      gif: `${BASE}/2021/02/Barbell-Bench-Press.gif`,       tip: 'Espalda recta, escápulas juntas. Baja controlado hasta rozar el pecho.', alternativas: [{ nombre: 'Press con mancuernas banco plano', musculo: 'Pecho' }, { nombre: 'Press en máquina Smith', musculo: 'Pecho' }] },
      { id: 'pi',   nombre: 'Press inclinado mancuernas',  musculo: 'Pecho (parte superior)',   series: 3, reps: '8–10',  tipo: 'peso',      gif: `${BASE}/2021/02/Incline-Dumbbell-Press.gif`,    tip: 'Banco a 30–45°. Codos a 45° del cuerpo.', alternativas: [{ nombre: 'Press inclinado con barra', musculo: 'Pecho superior' }] },
      { id: 'fo',   nombre: 'Fondos asistidos',            musculo: 'Pecho inferior y tríceps', series: 3, reps: '8–10',  tipo: 'peso_reps', gif: `${BASE}/2021/02/Weighted-Dips.gif`,             tip: 'Inclínate hacia adelante para el pecho. Peso opcional en cinturón.', alternativas: [{ nombre: 'Crossover en polea baja', musculo: 'Pecho inferior' }] },
      { id: 'ap',   nombre: 'Aperturas en polea',          musculo: 'Aislamiento de pecho',     series: 3, reps: '12',    tipo: 'peso',      gif: `${BASE}/2021/02/Cable-Crossover.gif`,           tip: 'Ligera flexión en los codos. Controla la vuelta.', alternativas: [{ nombre: 'Pec-deck (mariposa)', musculo: 'Pecho' }] },
      { id: 'et',   nombre: 'Extensión tríceps en polea',  musculo: 'Tríceps (cabeza lateral)', series: 3, reps: '12',    tipo: 'peso',      gif: `${BASE}/2021/02/Triceps-Pushdown.gif`,          tip: 'Codos pegados al cuerpo, extiende completamente.', alternativas: [{ nombre: 'Fondos en banco', musculo: 'Tríceps' }] },
      { id: 'pf',   nombre: 'Press francés',               musculo: 'Tríceps (cabeza larga)',   series: 2, reps: '12',    tipo: 'peso',      gif: `${BASE}/2021/06/Skull-Crusher.gif`,             tip: 'Codos apuntando al techo. Usa barra EZ.', alternativas: [{ nombre: 'Extensión sobre la cabeza con mancuerna', musculo: 'Tríceps' }] },
    ]
  },
  {
    id: 'martes', nombre: 'Martes', enfoque: 'Espalda + Bíceps', color: '#10b981', bg: '#ecfdf5', emoji: '🔙',
    cardio: 'Bicicleta – HIIT 10–12 min (30 seg fuerte / 60 seg suave)',
    ejercicios: [
      { id: 'jp',   nombre: 'Jalón al pecho',              musculo: 'Dorsal ancho',             series: 4, reps: '8',     tipo: 'peso',      gif: `${BASE}/2021/02/Lat-Pulldown.gif`,              tip: 'Tira hacia la clavícula. Pecho erguido.', alternativas: [{ nombre: 'Dominadas asistidas', musculo: 'Dorsal' }] },
      { id: 'rb',   nombre: 'Remo con barra',              musculo: 'Espesor de espalda',       series: 4, reps: '8',     tipo: 'peso',      gif: `${BASE}/2021/02/Bent-Over-Barbell-Row.gif`,    tip: 'Espalda paralela al suelo, tira hacia el ombligo.', alternativas: [{ nombre: 'Remo con mancuerna unilateral', musculo: 'Espalda media' }] },
      { id: 'rs',   nombre: 'Remo sentado en polea',       musculo: 'Espalda media',            series: 3, reps: '10',    tipo: 'peso',      gif: `${BASE}/2021/02/Seated-Cable-Row.gif`,          tip: 'No te balancees. Codos pegados al cuerpo.', alternativas: [{ nombre: 'Remo en máquina', musculo: 'Espalda media' }] },
      { id: 'je',   nombre: 'Jalón agarre estrecho',       musculo: 'Dorsal y bíceps',          series: 3, reps: '10',    tipo: 'peso',      gif: `${BASE}/2021/02/Lat-Pulldown.gif`,              tip: 'Agarre neutro o supino. Lleva codos hacia las caderas.', alternativas: [{ nombre: 'Dominadas agarre estrecho', musculo: 'Dorsal/Bíceps' }] },
      { id: 'cb',   nombre: 'Curl con barra',              musculo: 'Bíceps (cabeza larga)',    series: 3, reps: '10',    tipo: 'peso',      gif: `${BASE}/2021/02/Barbell-Curl.gif`,              tip: 'No balancees el cuerpo. Aprieta al máximo.', alternativas: [{ nombre: 'Curl barra EZ', musculo: 'Bíceps' }] },
      { id: 'cm',   nombre: 'Curl martillo',               musculo: 'Bíceps (braquial)',        series: 2, reps: '12',    tipo: 'peso',      gif: `${BASE}/2021/02/Hammer-Curl.gif`,               tip: 'Agarre neutro (pulgar arriba). Trabaja braquial.', alternativas: [{ nombre: 'Curl martillo en polea', musculo: 'Braquial' }] },
    ]
  },
  {
    id: 'miercoles', nombre: 'Miércoles', enfoque: 'Pierna Completa', color: '#f97316', bg: '#fff7ed', emoji: '🦵',
    cardio: 'Caminata inclinada – 10 min (moderado)',
    ejercicios: [
      { id: 'sq',   nombre: 'Sentadilla',                  musculo: 'Cuádriceps, glúteos',      series: 4, reps: '6–8',   tipo: 'peso',      gif: `${BASE}/2021/02/Barbell-Squat.gif`,             tip: 'Espalda recta, rodillas siguen pies. Muslo paralelo al suelo.', alternativas: [{ nombre: 'Sentadilla goblet', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pr',   nombre: 'Prensa',                      musculo: 'Cuádriceps, glúteos',      series: 4, reps: '10',    tipo: 'peso',      gif: `${BASE}/2021/02/Leg-Press.gif`,                 tip: 'No bloquees rodillas al extender.', alternativas: [{ nombre: 'Zancadas con mancuernas', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pmr',  nombre: 'Peso muerto rumano',          musculo: 'Isquiotibiales, glúteos',  series: 3, reps: '10',    tipo: 'peso',      gif: `${BASE}/2021/02/Romanian-Deadlift.gif`,         tip: 'Bisagra de cadera. Barra roza las piernas todo el recorrido.', alternativas: [{ nombre: 'Peso muerto rumano con mancuernas', musculo: 'Isquiotibiales' }] },
      { id: 'cf',   nombre: 'Curl femoral',                musculo: 'Isquiotibiales',           series: 3, reps: '12',    tipo: 'peso',      gif: `${BASE}/2021/02/Lying-Leg-Curl.gif`,            tip: 'No levantes las caderas. Aprieta al final.', alternativas: [{ nombre: 'Curl femoral de pie', musculo: 'Isquiotibiales' }] },
      { id: 'ec',   nombre: 'Extensión cuádriceps',        musculo: 'Cuádriceps (aislado)',     series: 3, reps: '12',    tipo: 'peso',      gif: `${BASE}/2021/02/Leg-Extension.gif`,             tip: 'Control en la bajada. No uses impulso.', alternativas: [{ nombre: 'Sentadilla con salto', musculo: 'Cuádriceps' }] },
      { id: 'gp',   nombre: 'Gemelos de pie',              musculo: 'Gemelos',                  series: 4, reps: '15',    tipo: 'peso',      gif: `${BASE}/2021/02/Standing-Calf-Raises.gif`,      tip: 'Rango completo. Aguanta 1 seg arriba.', alternativas: [{ nombre: 'Elevación de talones sentado', musculo: 'Sóleo' }] },
    ]
  },
  {
    id: 'jueves', nombre: 'Jueves', enfoque: 'Hombro + Core', color: '#8b5cf6', bg: '#f5f3ff', emoji: '🏔️',
    cardio: 'Remo o elíptica – 10 min (suave)',
    ejercicios: [
      { id: 'pm',   nombre: 'Press militar',               musculo: 'Deltoides anterior',       series: 4, reps: '8',     tipo: 'peso',      gif: `${BASE}/2021/02/Barbell-Military-Press.gif`,   tip: 'Core tenso. No arquees la espalda.', alternativas: [{ nombre: 'Press Arnold', musculo: 'Hombros (completo)' }] },
      { id: 'el',   nombre: 'Elevaciones laterales',       musculo: 'Deltoides lateral',        series: 4, reps: '12',    tipo: 'peso',      gif: `${BASE}/2021/02/Dumbbell-Lateral-Raise.gif`,   tip: 'Pulgares ligeramente abajo. No subas más de 90°.', alternativas: [{ nombre: 'Elevaciones laterales en polea', musculo: 'Deltoides lateral' }] },
      { id: 'pp',   nombre: 'Pájaros posteriores',         musculo: 'Deltoides posterior',      series: 3, reps: '12',    tipo: 'peso',      gif: `${BASE}/2021/02/Bent-Over-Dumbbell-Fly.gif`,   tip: 'Espalda plana, ligera flexión de codos.', alternativas: [{ nombre: 'Face pull con cuerda', musculo: 'Deltoides posterior' }] },
      { id: 'fp',   nombre: 'Face pull',                   musculo: 'Rotadores, trapecio',      series: 3, reps: '12',    tipo: 'peso',      gif: `${BASE}/2021/04/Face-Pull.gif`,                 tip: 'Polea a la altura de los ojos. Codos arriba.', alternativas: [{ nombre: 'Rotaciones externas con banda', musculo: 'Manguito rotador' }] },
      { id: 'entr', nombre: 'Encogimientos trapecio',      musculo: 'Trapecio',                 series: 3, reps: '12',    tipo: 'peso',      gif: `${BASE}/2021/02/Dumbbell-Shrugs.gif`,           tip: 'Sube hombros hacia las orejas. No gires el cuello.', alternativas: [{ nombre: 'Encogimientos con barra', musculo: 'Trapecio' }] },
      { id: 'pl',   nombre: 'Plancha',                     musculo: 'Core completo',            series: 3, reps: '45',    tipo: 'tiempo',    gif: `${BASE}/2021/02/Plank.gif`,                     tip: 'Cuerpo en línea recta, glúteos apretados. Respira controlado.', alternativas: [{ nombre: 'Plancha lateral', musculo: 'Oblicuos' }] },
      { id: 'crp',  nombre: 'Crunch en polea',             musculo: 'Abdominales',              series: 3, reps: '15',    tipo: 'peso',      gif: `${BASE}/2021/06/Cable-Crunch.gif`,              tip: 'Contrae hacia las rodillas, no tires con el cuello.', alternativas: [{ nombre: 'Crunch en suelo', musculo: 'Abdominales' }] },
      { id: 'evp',  nombre: 'Elevación de piernas',        musculo: 'Abdomen inferior',         series: 3, reps: '12',    tipo: 'reps',      gif: `${BASE}/2021/02/Hanging-Leg-Raise.gif`,         tip: 'Sube las piernas sin balanceo. Contrae el abdomen al subir.', alternativas: [{ nombre: 'Elevación de rodillas en barra', musculo: 'Abdomen inferior' }] },
    ]
  },
  {
    id: 'viernes', nombre: 'Viernes', enfoque: 'Full Body Metabólico', color: '#f59e0b', bg: '#fffbeb', emoji: '🔥',
    cardio: 'Caminata rápida – 10 min', circuito: true, vueltas: 4,
    ejercicios: [
      { id: 'sg',   nombre: 'Sentadilla goblet',           musculo: 'Cuádriceps, glúteos',      series: 4, reps: '12',    tipo: 'peso',      gif: `${BASE}/2021/04/Goblet-Squat.gif`,              tip: 'Kettlebell al pecho. Pecho erguido todo el recorrido.', alternativas: [{ nombre: 'Sentadilla con peso corporal', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pman', nombre: 'Press mancuernas',            musculo: 'Pecho, hombros',           series: 4, reps: '12',    tipo: 'peso',      gif: `${BASE}/2021/02/Dumbbell-Bench-Press.gif`,     tip: 'Baja en 2 seg. Empuja explosivo.', alternativas: [{ nombre: 'Flexiones', musculo: 'Pecho/Hombros/Tríceps' }] },
      { id: 'rman', nombre: 'Remo mancuerna',              musculo: 'Espalda',                  series: 4, reps: '12',    tipo: 'peso',      gif: `${BASE}/2021/02/One-Arm-Dumbbell-Row.gif`,     tip: 'Apóyate en el banco. Codo pegado al cuerpo.', alternativas: [{ nombre: 'Remo con banda elástica', musculo: 'Espalda' }] },
      { id: 'pmk',  nombre: 'Peso muerto kettlebell',      musculo: 'Cadena posterior',         series: 4, reps: '12',    tipo: 'peso',      gif: `${BASE}/2021/06/Kettlebell-Deadlift.gif`,      tip: 'Bisagra de cadera. Empuja el suelo al subir.', alternativas: [{ nombre: 'Peso muerto con mancuernas', musculo: 'Cadena posterior' }] },
      { id: 'bur',  nombre: 'Burpees',                     musculo: 'Full body',                series: 4, reps: '10',    tipo: 'reps',      gif: `${BASE}/2021/02/Burpee.gif`,                    tip: 'Explosivo en el salto, controlado en la bajada.', alternativas: [{ nombre: 'Burpee sin salto', musculo: 'Full body (menor impacto)' }] },
      { id: 'planv',nombre: 'Plancha',                     musculo: 'Core',                     series: 4, reps: '45',    tipo: 'tiempo',    gif: `${BASE}/2021/02/Plank.gif`,                     tip: 'Respira controlado. No dejes caer las caderas.', alternativas: [{ nombre: 'Plancha sobre rodillas', musculo: 'Core (principiante)' }] },
    ]
  },
]

// Genera los días ajustados al ciclo actual
export function getDiasCiclo(cicloId) {
  const mod = MOD[cicloId]
  return DIAS_BASE.map(dia => ({
    ...dia,
    color: CICLOS.find(c => c.id === cicloId)?.color || dia.color,
    ejercicios: dia.ejercicios.map(ej => {
      const altCiclo = ALT_CICLO[ej.id]?.[cicloId]
      const seriesAjustadas = Math.max(2, ej.series + mod.seriesMod)
      let repsAjustadas = mod.repsMod || ej.reps
      if (mod.repsMod === 'deload') repsAjustadas = ej.reps + ' (50% peso)'
      return {
        ...(altCiclo ? { ...ej, nombre: altCiclo.nombre, gif: altCiclo.gif, tip: altCiclo.tip } : ej),
        series: seriesAjustadas,
        reps: repsAjustadas,
      }
    })
  }))
}

export const PLATOS = {
  postEntreno: [
    { nombre: 'Pollo + arroz + brócoli', kcal: 580, p: 52, c: 60, g: 10, receta: '200g pechuga a la plancha, 80g arroz basmati, brócoli al vapor con AOVE' },
    { nombre: 'Salmón + boniato + ensalada', kcal: 560, p: 45, c: 50, g: 14, receta: '180g salmón al horno con limón, 200g boniato, lechuga y tomate' },
    { nombre: 'Ternera + pasta integral', kcal: 600, p: 50, c: 58, g: 12, receta: '180g ternera, 80g pasta integral, salsa de tomate natural' },
  ],
  comida: [
    { nombre: 'Merluza + quinoa + verduras', kcal: 520, p: 48, c: 50, g: 9, receta: '200g merluza al vapor, 70g quinoa, pimientos y cebolla salteados' },
    { nombre: 'Pechuga al horno + garbanzos', kcal: 540, p: 50, c: 45, g: 10, receta: '200g pechuga, 150g garbanzos, pimientos rojos asados' },
    { nombre: 'Atún + arroz + aguacate', kcal: 510, p: 46, c: 48, g: 13, receta: '2 latas atún al natural, 70g arroz, 1/2 aguacate, limón' },
  ],
  merienda: [
    { nombre: 'Yogur griego + frutos rojos', kcal: 320, p: 22, c: 28, g: 12, receta: '200g yogur griego 0%, 80g arándanos, 15g nueces' },
    { nombre: 'Batido proteico + plátano', kcal: 340, p: 32, c: 38, g: 5, receta: '30g proteína de suero, 250ml leche semidesnatada, 1 plátano' },
    { nombre: 'Tostadas + huevo + aguacate', kcal: 360, p: 20, c: 32, g: 16, receta: '2 tostadas integrales, 2 huevos revueltos, 1/2 aguacate' },
  ],
  cena: [
    { nombre: 'Tortilla + ensalada mixta', kcal: 380, p: 32, c: 10, g: 18, receta: '3 huevos, cebolla, pimiento, ensalada con AOVE' },
    { nombre: 'Salmón a la plancha + espárragos', kcal: 400, p: 40, c: 6, g: 16, receta: '180g salmón, espárragos a la plancha, limón' },
    { nombre: 'Pollo al horno + calabacín', kcal: 360, p: 42, c: 12, g: 10, receta: '200g pechuga con hierbas, calabacín y cebolla salteados' },
  ],
}

export const AVATARS = ['💪', '🏃', '🧘', '🏋️', '⚡', '🦁', '🔥', '🌟']
