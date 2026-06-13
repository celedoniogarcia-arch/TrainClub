// tipo: 'peso'|'tiempo'|'reps'|'peso_reps'
// Días: principiante=Lun/Mié/Vie · intermedio=Lun/Mar/Jue/Vie · avanzado=Lun-Vie

const FC = 'https://fitcron.com/wp-content/uploads'
const G = {
  pb:   `${FC}/2021/03/00251301-Barbell-Bench-Press_Chest-FIX_720.gif`,
  pi:   `${FC}/2021/03/03241301-Dumbbell-Incline-Palm-in-Press_Chest_720.gif`,
  fo:   `${FC}/2021/03/02511301-Chest-Dip_Chest_720.gif`,
  ap:   `${FC}/2021/03/02271301-Cable-Standing-Fly_Chest_720.gif`,
  et:   `${FC}/2021/04/37191301-Cable-Standing-High-Cross-Triceps-Extension_Upper-Arms_720.gif`,
  pf:   `${FC}/2021/04/01861301-Cable-Lying-Triceps-Extension-II_Upper-Arms_720.gif`,
  jp:   `${FC}/2021/04/01971301-Cable-Pulldown-pro-lat-bar_Back_720.gif`,
  rb:   `${FC}/2021/04/00491301-Barbell-Incline-Row_Back_720.gif`,
  rs:   `${FC}/2021/04/01891301-Cable-One-Arm-Bent-over-Row_Back-FIX_720.gif`,
  je:   `${FC}/2021/04/26161301-Cable-Lateral-Pulldown-with-V-bar_Back_720.gif`,
  cb:   `${FC}/2021/04/04461301-EZ-Barbell-Close-grip-Curl_Upper-Arms_720-1.gif`,
  cm:   `${FC}/2021/04/02981301-Dumbbell-Cross-Body-Hammer-Curl_Forearms_720.gif`,
  sq:   `${FC}/2021/04/01241301-Barbell-Wide-Squat_Thighs_720.gif`,
  pr:   `${FC}/2021/04/07401301-Sled-45%C2%B0-Leg-Wide-Press_Thighs_720.gif`,
  pmr:  `${FC}/2021/04/00851301-Barbell-Romanian-Deadlift_Hips_720.gif`,
  cf:   `${FC}/2021/04/05861301-Lever-Lying-Leg-Curl_Thighs_720.gif`,
  ec:   `${FC}/2021/04/05851301-Lever-Leg-Extension_Thighs_720.gif`,
  gp:   `${FC}/2021/04/01081301-Barbell-Standing-Leg-Calf-Raise_Calf_720.gif`,
  pm:   `${FC}/2021/04/07881301-Standing-Behind-Neck-Press_Shoulders_720.gif`,
  el:   `${FC}/2021/04/03111301-Dumbbell-Full-Can-Lateral-Raise_Shoulders_720.gif`,
  pp:   `${FC}/2021/04/03781301-Dumbbell-Rear-Fly_Shoulders_720.gif`,
  fp:   `${FC}/2021/04/02201301-Cable-Shrug_Back_720.gif`,
  entr: `${FC}/2021/04/02201301-Cable-Shrug_Back_720.gif`,
  pl:   `${FC}/2021/04/04631301-Front-Plank_waist-FIX_720.gif`,
  crp:  `${FC}/2021/04/01741301-Cable-Judo-Flip_waist_720.gif`,
  evp:  `${FC}/2021/04/17641301-Hanging-Leg-Hip-Raise_Waist_720.gif`,
  sg:   `${FC}/2021/04/01241301-Barbell-Wide-Squat_Thighs_720.gif`,
  pman: `${FC}/2021/03/02891301-Dumbbell-Bench-Press_Chest_720.gif`,
  rman: `${FC}/2021/04/02921301-Dumbbell-Bent-over-Row_back_Back_720.gif`,
  pmk:  `${FC}/2021/04/00321301-Barbell-Deadlift_Hips-FIX_720.gif`,
  planv:`${FC}/2021/04/04631301-Front-Plank_waist-FIX_720.gif`,
}

export const CICLOS = [
  { id: 'hiper',     nombre: 'Hipertrofia', semanas: 4, color: '#6366f1', bg: '#eef2ff', descripcion: 'Volumen alto · 3–4 series · 8–12 reps · Descanso 60–90 seg', objetivo: 'Maximizar el volumen de trabajo para estimular el crecimiento muscular.' },
  { id: 'fuerza',    nombre: 'Fuerza',      semanas: 4, color: '#ef4444', bg: '#fef2f2', descripcion: 'Carga alta · 4–5 series · 4–6 reps · Descanso 2–3 min',       objetivo: 'Aumentar la fuerza máxima con pesos más elevados y menos repeticiones.' },
  { id: 'definicion',nombre: 'Definición',  semanas: 4, color: '#10b981', bg: '#ecfdf5', descripcion: 'Ritmo alto · 3 series · 12–20 reps · Descanso 45 seg',         objetivo: 'Quemar grasa preservando músculo con mayor densidad de trabajo.' },
  { id: 'deload',    nombre: 'Deload',      semanas: 1, color: '#f59e0b', bg: '#fffbeb', descripcion: 'Recuperación · 2–3 series · 50% del peso habitual',             objetivo: 'Semana de recuperación activa para superar la fatiga acumulada.' },
]

const MOD = {
  hiper:      { seriesMod: 0,  repsMod: '' },
  fuerza:     { seriesMod: +1, repsMod: '4–6' },
  definicion: { seriesMod: -1, repsMod: '12–20' },
  deload:     { seriesMod: -1, repsMod: 'deload' },
}

const USER_MOD = {
  perder:       { principiante: { seriesMod: -1, repsOverride: '12–15', tipExtra: 'Descanso 45-60s para mantener ritmo cardíaco elevado.' }, intermedio: { seriesMod: 0, repsOverride: '12–15', tipExtra: 'Supersets y descanso de 60s para mayor densidad metabólica.' }, avanzado: { seriesMod: 0, repsOverride: '10–15', tipExtra: 'Drop sets y tempo 3-0-1 para máxima densidad.' } },
  ganar:        { principiante: { seriesMod: -1, repsOverride: '8–12',  tipExtra: 'Progresión doble: completa todas las reps → sube el peso.' }, intermedio: { seriesMod: 0, repsOverride: '8–12',  tipExtra: 'RIR 2-3. Último set al fallo técnico.' }, avanzado: { seriesMod: +1, repsOverride: '6–10',  tipExtra: 'RIR 1. Añade rest-pause o myo-reps.' } },
  fuerza:       { principiante: { seriesMod: 0,  repsOverride: '5–8',   tipExtra: 'Foco en técnica perfecta. Descanso 2-3 min.' }, intermedio: { seriesMod: +1, repsOverride: '4–6',   tipExtra: 'Aumenta carga cada sesión. Descanso 3 min.' }, avanzado: { seriesMod: +1, repsOverride: '3–5',   tipExtra: 'Periodización ondulante: varía 3, 4 y 5 reps.' } },
  recomposicion:{ principiante: { seriesMod: -1, repsOverride: '10–15', tipExtra: 'Déficit calórico leve. Proteína ≥2g/kg.' }, intermedio: { seriesMod: 0, repsOverride: '8–12',  tipExtra: 'Alterna días de mayor y menor volumen.' }, avanzado: { seriesMod: 0, repsOverride: '6–12',  tipExtra: 'Bloques 3-4 sem: volumen + fuerza.' } },
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANTILLAS POR OBJETIVO × NIVEL
// Reglas aplicadas (fuente: RP Strength + NSCA + Legion Athletics research):
//   · Principiante 3d (Lun/Mié/Vie): full body, cada músculo 3×/sem, ~3 sets/ses = 9/sem
//   · Intermedio   4d (Lun/Mar/Jue/Vie): upper-lower, 2×/sem, ~5 sets/ses = 10/sem
//   · Avanzado     5d (Lun-Vie): PPL, 2×/sem, ~7 sets/ses = 14/sem
//   · Burpees = cardio, NO series de fuerza
//   · Máx 6-8 sets directos por músculo por sesión
//   · Sin ejercicios redundantes en la misma sesión (ej. peso muerto + RDL)
// ─────────────────────────────────────────────────────────────────────────────

// ── PERDER GRASA ──────────────────────────────────────────────────────────────

const PERDER_PRINCIPIANTE = [
  {
    id: 'lunes', nombre: 'Lunes', enfoque: 'Full Body A — Tren superior + cardio', color: '#10b981', bg: '#ecfdf5', emoji: '🔥',
    cardio: 'Caminata inclinada 10% – 20 min al finalizar (zona 2, 65-70% FCmax)',
    ejercicios: [
      { id: 'sg',   nombre: 'Sentadilla goblet',         musculo: 'Cuádriceps, glúteos',   series: 3, reps: '12',  tipo: 'peso',   gif: G.sg,   tip: 'Kettlebell al pecho, pecho erguido. Muslo paralelo al suelo.', alternativas: [{ nombre: 'Sentadilla con peso corporal', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pman', nombre: 'Press mancuernas banco',    musculo: 'Pecho (fibras medias)', series: 3, reps: '12',  tipo: 'peso',   gif: G.pman, tip: 'Baja 2 seg, empuja sin impulso. Pecho completo.', alternativas: [{ nombre: 'Flexiones en suelo', musculo: 'Pecho' }] },
      { id: 'rman', nombre: 'Remo mancuerna unilateral', musculo: 'Espalda media',         series: 3, reps: '12',  tipo: 'peso',   gif: G.rman, tip: 'Apóyate en el banco. Codo pegado, tira hacia la cadera.', alternativas: [{ nombre: 'Remo con banda elástica', musculo: 'Espalda' }] },
      { id: 'el',   nombre: 'Elevaciones laterales',     musculo: 'Deltoides lateral',     series: 2, reps: '15',  tipo: 'peso',   gif: G.el,   tip: 'Peso ligero, pulgares abajo. No subas más de 90°.', alternativas: [{ nombre: 'Elevaciones con banda', musculo: 'Hombros' }] },
      { id: 'pl',   nombre: 'Plancha isométrica',        musculo: 'Core completo',         series: 3, reps: '30',  tipo: 'tiempo', gif: G.pl,   tip: 'Cuerpo recto, glúteos apretados. Respira controlado.', alternativas: [{ nombre: 'Plancha sobre rodillas', musculo: 'Core' }] },
    ]
  },
  {
    id: 'miercoles', nombre: 'Miércoles', enfoque: 'Full Body B — Tren inferior + core', color: '#10b981', bg: '#ecfdf5', emoji: '🦵',
    cardio: 'Bicicleta estática – 20 min ritmo constante al 65-70% FCmax',
    ejercicios: [
      { id: 'pr',   nombre: 'Prensa 45°',                musculo: 'Cuádriceps, glúteos',   series: 3, reps: '15',  tipo: 'peso',   gif: G.pr,   tip: 'No bloquees rodillas. Rango completo de movimiento.', alternativas: [{ nombre: 'Zancadas con mancuernas', musculo: 'Cuádriceps' }] },
      { id: 'pmr',  nombre: 'Peso muerto rumano',        musculo: 'Isquiotibiales, glúteos',series:3, reps: '12',  tipo: 'peso',   gif: G.pmr,  tip: 'Bisagra de cadera. Espalda neutra, barra cerca del cuerpo.', alternativas: [{ nombre: 'Peso muerto rumano con mancuernas', musculo: 'Isquiotibiales' }] },
      { id: 'pi',   nombre: 'Press inclinado mancuernas',musculo: 'Pecho (parte superior)',series: 3, reps: '12',  tipo: 'peso',   gif: G.pi,   tip: 'Banco a 30°. Codos a 45° del cuerpo, no en ángulo recto.', alternativas: [{ nombre: 'Flexiones con pies elevados', musculo: 'Pecho superior' }] },
      { id: 'jp',   nombre: 'Jalón al pecho (polea)',    musculo: 'Dorsal ancho',          series: 3, reps: '12',  tipo: 'peso',   gif: G.jp,   tip: 'Tira hacia la clavícula. Pecho erguido, no te balancees.', alternativas: [{ nombre: 'Jalón con banda', musculo: 'Dorsal' }] },
      { id: 'crp',  nombre: 'Crunch en polea',           musculo: 'Abdominales',           series: 3, reps: '15',  tipo: 'peso',   gif: G.crp,  tip: 'Contrae hacia las rodillas. No uses el cuello.', alternativas: [{ nombre: 'Crunch en suelo', musculo: 'Abdominales' }] },
      { id: 'gp',   nombre: 'Gemelos de pie',            musculo: 'Gemelos',               series: 3, reps: '20',  tipo: 'peso',   gif: G.gp,   tip: 'Rango completo. Aguanta 1 seg arriba.', alternativas: [{ nombre: 'Elevación de talones sentado', musculo: 'Sóleo' }] },
    ]
  },
  {
    id: 'viernes', nombre: 'Viernes', enfoque: 'Full Body C — Hinge + Pull + Core', color: '#10b981', bg: '#ecfdf5', emoji: '💪',
    cardio: 'HIIT en cinta – 15 min (1 min al 85% FCmax / 2 min suave × 5 rondas)',
    ejercicios: [
      { id: 'cf',   nombre: 'Curl femoral tumbado',      musculo: 'Isquiotibiales',        series: 3, reps: '12',  tipo: 'peso',   gif: G.cf,   tip: 'No levantes las caderas. Aprieta al final del recorrido.', alternativas: [{ nombre: 'Curl femoral de pie', musculo: 'Isquiotibiales' }] },
      { id: 'ec',   nombre: 'Extensión de cuádriceps',   musculo: 'Cuádriceps (aislado)',  series: 3, reps: '15',  tipo: 'peso',   gif: G.ec,   tip: 'Control total en la bajada. No uses impulso.', alternativas: [{ nombre: 'Sentadilla con silla', musculo: 'Cuádriceps' }] },
      { id: 'rs',   nombre: 'Remo sentado en polea',     musculo: 'Espalda media',         series: 3, reps: '12',  tipo: 'peso',   gif: G.rs,   tip: 'No te balancees. Codos pegados, tira al ombligo.', alternativas: [{ nombre: 'Remo en máquina', musculo: 'Espalda media' }] },
      { id: 'pp',   nombre: 'Pájaros con mancuernas',    musculo: 'Deltoides posterior',   series: 2, reps: '15',  tipo: 'peso',   gif: G.pp,   tip: 'Inclinado hacia adelante. Alas abiertas, codos semiflexionados.', alternativas: [{ nombre: 'Face pull con banda', musculo: 'Deltoides posterior' }] },
      { id: 'evp',  nombre: 'Elevación de piernas',      musculo: 'Abdomen inferior',      series: 3, reps: '12',  tipo: 'reps',   gif: G.evp,  tip: 'Sube lento, baja más lento todavía. Abdomen contraído.', alternativas: [{ nombre: 'Elevación de rodillas tumbado', musculo: 'Abdomen inferior' }] },
    ]
  },
]

const PERDER_INTERMEDIO = [
  {
    id: 'lunes', nombre: 'Lunes', enfoque: 'Upper A — Push + Bíceps', color: '#10b981', bg: '#ecfdf5', emoji: '💪',
    cardio: 'Caminata inclinada 10 min antes como calentamiento activo',
    ejercicios: [
      { id: 'pb',   nombre: 'Press banca plano',         musculo: 'Pecho (fibras medias)', series: 4, reps: '12',  tipo: 'peso',   gif: G.pb,   tip: 'Escápulas juntas, arco técnico. Carga moderada, reps altas para definición.', alternativas: [{ nombre: 'Press mancuernas banco', musculo: 'Pecho' }] },
      { id: 'pi',   nombre: 'Press inclinado mancuernas',musculo: 'Pecho (parte superior)',series: 3, reps: '12',  tipo: 'peso',   gif: G.pi,   tip: 'Banco 30°. Descanso 60s para mantener ritmo cardíaco.', alternativas: [{ nombre: 'Press inclinado en máquina', musculo: 'Pecho superior' }] },
      { id: 'pm',   nombre: 'Press militar mancuernas',  musculo: 'Deltoides anterior',    series: 3, reps: '12',  tipo: 'peso',   gif: G.pm,   tip: 'Core tenso. No arquees la espalda.', alternativas: [{ nombre: 'Press Arnold', musculo: 'Hombros completo' }] },
      { id: 'el',   nombre: 'Elevaciones laterales',     musculo: 'Deltoides lateral',     series: 3, reps: '15',  tipo: 'peso',   gif: G.el,   tip: 'Peso ligero, muchas reps. Superset con press para mayor gasto calórico.', alternativas: [{ nombre: 'Elevaciones en polea', musculo: 'Deltoides lateral' }] },
      { id: 'et',   nombre: 'Extensión tríceps polea',   musculo: 'Tríceps (cabeza lateral)',series:3, reps: '15', tipo: 'peso',   gif: G.et,   tip: 'Codos pegados. Extiende completamente, no uses impulso.', alternativas: [{ nombre: 'Fondos en banco', musculo: 'Tríceps' }] },
      { id: 'cb',   nombre: 'Curl bíceps barra EZ',      musculo: 'Bíceps (cabeza larga)', series: 3, reps: '15',  tipo: 'peso',   gif: G.cb,   tip: 'No balancees. Superset con tríceps para mayor densidad.', alternativas: [{ nombre: 'Curl con mancuernas', musculo: 'Bíceps' }] },
    ]
  },
  {
    id: 'martes', nombre: 'Martes', enfoque: 'Lower A — Cuádriceps + Glúteos', color: '#f97316', bg: '#fff7ed', emoji: '🦵',
    cardio: 'Bicicleta estática – 20 min zona 2 (65-70% FCmax) al finalizar',
    ejercicios: [
      { id: 'sq',   nombre: 'Sentadilla con barra',      musculo: 'Cuádriceps, glúteos',   series: 4, reps: '12',  tipo: 'peso',   gif: G.sq,   tip: 'Muslo paralelo. Descanso 75s para mantener ritmo metabólico.', alternativas: [{ nombre: 'Sentadilla goblet', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pr',   nombre: 'Prensa 45° pies altos',    musculo: 'Cuádriceps, glúteos',   series: 3, reps: '15',  tipo: 'peso',   gif: G.pr,   tip: 'Pies altos para mayor activación de glúteos. Reps altas.', alternativas: [{ nombre: 'Zancadas caminando', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'cf',   nombre: 'Curl femoral tumbado',      musculo: 'Isquiotibiales',        series: 3, reps: '15',  tipo: 'peso',   gif: G.cf,   tip: 'No levantes caderas. Control total.', alternativas: [{ nombre: 'Curl femoral de pie', musculo: 'Isquiotibiales' }] },
      { id: 'ec',   nombre: 'Extensión cuádriceps',      musculo: 'Cuádriceps (aislado)',  series: 3, reps: '20',  tipo: 'peso',   gif: G.ec,   tip: 'Reps altas para máxima quema local. Sin impulso.', alternativas: [{ nombre: 'Sentadilla con salto suave', musculo: 'Cuádriceps' }] },
      { id: 'gp',   nombre: 'Gemelos de pie',            musculo: 'Gemelos',               series: 4, reps: '20',  tipo: 'peso',   gif: G.gp,   tip: '20 reps lentas. Pausa 1 seg arriba, estira abajo.', alternativas: [{ nombre: 'Elevación de talones sentado', musculo: 'Sóleo' }] },
    ]
  },
  {
    id: 'jueves', nombre: 'Jueves', enfoque: 'Upper B — Pull + Hombros posteriores', color: '#10b981', bg: '#ecfdf5', emoji: '🔙',
    cardio: 'Elíptica o remo – 15 min ritmo moderado al acabar',
    ejercicios: [
      { id: 'jp',   nombre: 'Jalón al pecho',            musculo: 'Dorsal ancho',          series: 4, reps: '12',  tipo: 'peso',   gif: G.jp,   tip: 'Tira hacia la clavícula. Pecho erguido. Descanso 60s.', alternativas: [{ nombre: 'Dominadas asistidas', musculo: 'Dorsal' }] },
      { id: 'rb',   nombre: 'Remo con barra',            musculo: 'Espesor de espalda',    series: 3, reps: '12',  tipo: 'peso',   gif: G.rb,   tip: 'Espalda paralela al suelo. Tira al ombligo.', alternativas: [{ nombre: 'Remo mancuerna unilateral', musculo: 'Espalda media' }] },
      { id: 'rs',   nombre: 'Remo sentado polea',        musculo: 'Espalda media',         series: 3, reps: '15',  tipo: 'peso',   gif: G.rs,   tip: 'No te balancees. 15 reps controladas.', alternativas: [{ nombre: 'Remo en máquina', musculo: 'Espalda media' }] },
      { id: 'pp',   nombre: 'Pájaros con mancuernas',    musculo: 'Deltoides posterior',   series: 3, reps: '15',  tipo: 'peso',   gif: G.pp,   tip: 'Ligera flexión de codos. Mueve como alas.', alternativas: [{ nombre: 'Face pull con cuerda', musculo: 'Deltoides posterior' }] },
      { id: 'cm',   nombre: 'Curl martillo',             musculo: 'Bíceps (braquial)',     series: 3, reps: '15',  tipo: 'peso',   gif: G.cm,   tip: 'Agarre neutro. Trabaja braquial y supinador.', alternativas: [{ nombre: 'Curl martillo en polea', musculo: 'Braquial' }] },
      { id: 'pf',   nombre: 'Press francés mancuernas',  musculo: 'Tríceps (cabeza larga)',series: 3, reps: '15',  tipo: 'peso',   gif: G.pf,   tip: 'Codos al techo. Contrae tríceps al extender.', alternativas: [{ nombre: 'Extensión sobre cabeza en polea', musculo: 'Tríceps' }] },
    ]
  },
  {
    id: 'viernes', nombre: 'Viernes', enfoque: 'Lower B — Isquios + Core + HIIT', color: '#f97316', bg: '#fff7ed', emoji: '🔥',
    cardio: 'HIIT final – 15 min (20s sprint / 40s caminata × 15 rondas). Sin pesas en cardio.',
    ejercicios: [
      { id: 'pmr',  nombre: 'Peso muerto rumano',        musculo: 'Isquiotibiales, glúteos',series:4, reps: '12',  tipo: 'peso',   gif: G.pmr,  tip: 'Bisagra de cadera. Siente el estiramiento en isquios. Espalda neutra.', alternativas: [{ nombre: 'Peso muerto rumano con mancuernas', musculo: 'Isquiotibiales' }] },
      { id: 'sg',   nombre: 'Sentadilla goblet',         musculo: 'Cuádriceps, glúteos',   series: 3, reps: '15',  tipo: 'peso',   gif: G.sg,   tip: 'Complemento a sentadilla con barra del martes. Reps altas.', alternativas: [{ nombre: 'Sentadilla con peso corporal', musculo: 'Cuádriceps' }] },
      { id: 'pl',   nombre: 'Plancha isométrica',        musculo: 'Core completo',         series: 3, reps: '45',  tipo: 'tiempo', gif: G.pl,   tip: 'Glúteos apretados, cuerpo en línea recta. Respira.', alternativas: [{ nombre: 'Plancha sobre rodillas', musculo: 'Core' }] },
      { id: 'crp',  nombre: 'Crunch en polea',           musculo: 'Abdominales',           series: 3, reps: '20',  tipo: 'peso',   gif: G.crp,  tip: 'Contrae fuerte. 20 reps rápidas para mantener ritmo.', alternativas: [{ nombre: 'Crunch en suelo', musculo: 'Abdominales' }] },
      { id: 'evp',  nombre: 'Elevación de piernas',      musculo: 'Abdomen inferior',      series: 3, reps: '15',  tipo: 'reps',   gif: G.evp,  tip: 'Lento y controlado. Abdomen apretado todo el recorrido.', alternativas: [{ nombre: 'Elevación de rodillas', musculo: 'Abdomen inferior' }] },
    ]
  },
]

const PERDER_AVANZADO = [
  {
    id: 'lunes', nombre: 'Lunes', enfoque: 'Push — Pecho + Hombros + Tríceps', color: '#10b981', bg: '#ecfdf5', emoji: '💪',
    cardio: 'Caminata inclinada – 10 min calentamiento activo',
    ejercicios: [
      { id: 'pb',   nombre: 'Press banca plano',         musculo: 'Pecho (fibras medias)', series: 4, reps: '12',  tipo: 'peso',   gif: G.pb,   tip: 'Arco técnico, escápulas juntas. Carga moderada-alta con reps de definición.', alternativas: [{ nombre: 'Press mancuernas', musculo: 'Pecho' }] },
      { id: 'pi',   nombre: 'Press inclinado mancuernas',musculo: 'Pecho (parte superior)',series: 3, reps: '12',  tipo: 'peso',   gif: G.pi,   tip: 'Banco 30°. Pausa 1 seg abajo para mayor tensión.', alternativas: [{ nombre: 'Press inclinado barra', musculo: 'Pecho superior' }] },
      { id: 'pm',   nombre: 'Press militar barra de pie',musculo: 'Deltoides anterior',    series: 4, reps: '12',  tipo: 'peso',   gif: G.pm,   tip: 'De pie para máxima activación de core. No arquees la espalda.', alternativas: [{ nombre: 'Press Arnold sentado', musculo: 'Hombros completo' }] },
      { id: 'el',   nombre: 'Elevaciones laterales',     musculo: 'Deltoides lateral',     series: 4, reps: '15',  tipo: 'peso',   gif: G.el,   tip: 'Drop set en la última serie: peso normal + reducción 30% al fallo.', alternativas: [{ nombre: 'Elevaciones en polea', musculo: 'Deltoides lateral' }] },
      { id: 'et',   nombre: 'Extensión tríceps polea',   musculo: 'Tríceps (cabeza lateral)',series:3, reps: '15', tipo: 'peso',   gif: G.et,   tip: 'Superset con bíceps del día pull para mayor quema calórica.', alternativas: [{ nombre: 'Fondos en paralelas', musculo: 'Tríceps' }] },
      { id: 'pf',   nombre: 'Press francés',             musculo: 'Tríceps (cabeza larga)',series: 3, reps: '12',  tipo: 'peso',   gif: G.pf,   tip: 'Barra EZ, codos al techo. Último ejercicio del día.', alternativas: [{ nombre: 'Extensión sobre cabeza mancuerna', musculo: 'Tríceps' }] },
    ]
  },
  {
    id: 'martes', nombre: 'Martes', enfoque: 'Pull — Espalda + Bíceps + Posterior', color: '#10b981', bg: '#ecfdf5', emoji: '🔙',
    cardio: 'Bicicleta HIIT – 15 min (30s al 90% / 60s suave × 10) al finalizar',
    ejercicios: [
      { id: 'jp',   nombre: 'Jalón al pecho',            musculo: 'Dorsal ancho',          series: 4, reps: '12',  tipo: 'peso',   gif: G.jp,   tip: 'Tira hacia la clavícula. Pecho erguido. Descanso 60s.', alternativas: [{ nombre: 'Dominadas con banda asistida', musculo: 'Dorsal' }] },
      { id: 'rb',   nombre: 'Remo con barra',            musculo: 'Espesor de espalda',    series: 4, reps: '12',  tipo: 'peso',   gif: G.rb,   tip: 'Espalda paralela al suelo. Tira al ombligo. Pausa en el top.', alternativas: [{ nombre: 'Remo mancuerna unilateral', musculo: 'Espalda media' }] },
      { id: 'rs',   nombre: 'Remo sentado polea',        musculo: 'Espalda media',         series: 3, reps: '15',  tipo: 'peso',   gif: G.rs,   tip: '15 reps controladas. No te balancees.', alternativas: [{ nombre: 'Remo máquina', musculo: 'Espalda media' }] },
      { id: 'pp',   nombre: 'Pájaros con mancuernas',    musculo: 'Deltoides posterior',   series: 3, reps: '15',  tipo: 'peso',   gif: G.pp,   tip: 'Salud del manguito rotador = clave para perder grasa sin lesiones.', alternativas: [{ nombre: 'Face pull cuerda', musculo: 'Deltoides posterior' }] },
      { id: 'cb',   nombre: 'Curl bíceps barra EZ',      musculo: 'Bíceps (cabeza larga)', series: 3, reps: '15',  tipo: 'peso',   gif: G.cb,   tip: 'No balancees. Aprieta en el top.', alternativas: [{ nombre: 'Curl con mancuernas', musculo: 'Bíceps' }] },
      { id: 'cm',   nombre: 'Curl martillo',             musculo: 'Bíceps (braquial)',     series: 3, reps: '15',  tipo: 'peso',   gif: G.cm,   tip: 'Agarre neutro. Superset con curl normal para mayor bombeo.', alternativas: [{ nombre: 'Curl martillo en polea', musculo: 'Braquial' }] },
    ]
  },
  {
    id: 'miercoles', nombre: 'Miércoles', enfoque: 'Lower — Pierna Completa', color: '#f97316', bg: '#fff7ed', emoji: '🦵',
    cardio: 'Caminata inclinada – 20 min zona 2 al finalizar (no HIIT: piernas ya trabajadas)',
    ejercicios: [
      { id: 'sq',   nombre: 'Sentadilla con barra',      musculo: 'Cuádriceps, glúteos',   series: 4, reps: '12',  tipo: 'peso',   gif: G.sq,   tip: 'Reps altas para definición. Descanso 75s máximo.', alternativas: [{ nombre: 'Sentadilla goblet', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pr',   nombre: 'Prensa 45°',                musculo: 'Cuádriceps, glúteos',   series: 3, reps: '15',  tipo: 'peso',   gif: G.pr,   tip: 'Pies altos para glúteo. No bloquees rodillas.', alternativas: [{ nombre: 'Zancadas caminando', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pmr',  nombre: 'Peso muerto rumano',        musculo: 'Isquiotibiales, glúteos',series:3, reps: '12',  tipo: 'peso',   gif: G.pmr,  tip: 'Bisagra de cadera. Espalda neutra, siente el estiramiento.', alternativas: [{ nombre: 'RDL con mancuernas', musculo: 'Isquiotibiales' }] },
      { id: 'cf',   nombre: 'Curl femoral tumbado',      musculo: 'Isquiotibiales',        series: 3, reps: '15',  tipo: 'peso',   gif: G.cf,   tip: 'No levantes caderas. Control total en la bajada.', alternativas: [{ nombre: 'Curl femoral de pie', musculo: 'Isquiotibiales' }] },
      { id: 'gp',   nombre: 'Gemelos de pie',            musculo: 'Gemelos',               series: 4, reps: '20',  tipo: 'peso',   gif: G.gp,   tip: 'Rango completo. Estira en el fondo, aguanta 1s arriba.', alternativas: [{ nombre: 'Gemelos en prensa', musculo: 'Gemelos/Sóleo' }] },
    ]
  },
  {
    id: 'jueves', nombre: 'Jueves', enfoque: 'Upper C — Segunda estimulación + Core', color: '#10b981', bg: '#ecfdf5', emoji: '⚡',
    cardio: 'Elíptica – 15 min ritmo constante al finalizar',
    ejercicios: [
      { id: 'pman', nombre: 'Press mancuernas banco',    musculo: 'Pecho (fibras medias)', series: 3, reps: '15',  tipo: 'peso',   gif: G.pman, tip: 'Segunda sesión de pecho esta semana. Mayor RIR, más reps.', alternativas: [{ nombre: 'Flexiones', musculo: 'Pecho' }] },
      { id: 'rman', nombre: 'Remo mancuerna unilateral', musculo: 'Espalda media',         series: 3, reps: '15',  tipo: 'peso',   gif: G.rman, tip: 'Segunda sesión de espalda. Enfoca en la conexión muscular.', alternativas: [{ nombre: 'Remo con banda', musculo: 'Espalda' }] },
      { id: 'je',   nombre: 'Jalón agarre estrecho',     musculo: 'Dorsal y bíceps',       series: 3, reps: '15',  tipo: 'peso',   gif: G.je,   tip: 'Agarre neutro. Lleva codos hacia las caderas.', alternativas: [{ nombre: 'Dominadas agarre estrecho', musculo: 'Dorsal/Bíceps' }] },
      { id: 'fp',   nombre: 'Face pull en polea',        musculo: 'Rotadores, trapecio',   series: 3, reps: '20',  tipo: 'peso',   gif: G.fp,   tip: 'Salud del hombro. Codos arriba, polea a altura de ojos.', alternativas: [{ nombre: 'Rotaciones externas banda', musculo: 'Manguito rotador' }] },
      { id: 'pl',   nombre: 'Plancha isométrica',        musculo: 'Core completo',         series: 3, reps: '45',  tipo: 'tiempo', gif: G.pl,   tip: 'Core fuerte = mejor transferencia a todos los ejercicios.', alternativas: [{ nombre: 'Plancha lateral alternada', musculo: 'Oblicuos' }] },
      { id: 'evp',  nombre: 'Elevación de piernas',      musculo: 'Abdomen inferior',      series: 3, reps: '15',  tipo: 'reps',   gif: G.evp,  tip: 'Sube lento y baja más lento. Sin balanceo.', alternativas: [{ nombre: 'Elevación de rodillas colgado', musculo: 'Abdomen inferior' }] },
    ]
  },
  {
    id: 'viernes', nombre: 'Viernes', enfoque: 'Lower B — Isquios + Glúteos + HIIT', color: '#f97316', bg: '#fff7ed', emoji: '🔥',
    cardio: 'HIIT final – 20 min (1 min al 85% / 2 min suave × 7 rondas). Los burpees van aquí, no en series.',
    ejercicios: [
      { id: 'sg',   nombre: 'Sentadilla goblet',         musculo: 'Cuádriceps, glúteos',   series: 3, reps: '15',  tipo: 'peso',   gif: G.sg,   tip: 'Segunda sesión de pierna. Menos carga, más reps para definición.', alternativas: [{ nombre: 'Sentadilla con peso corporal', musculo: 'Cuádriceps' }] },
      { id: 'ec',   nombre: 'Extensión cuádriceps',      musculo: 'Cuádriceps (aislado)',  series: 3, reps: '20',  tipo: 'peso',   gif: G.ec,   tip: 'Aislamiento para quemar localmente. 20 reps lentas.', alternativas: [{ nombre: 'Sentadilla con salto controlado', musculo: 'Cuádriceps' }] },
      { id: 'entr', nombre: 'Encogimientos trapecio',    musculo: 'Trapecio',              series: 3, reps: '15',  tipo: 'peso',   gif: G.entr, tip: 'Hombros hacia las orejas. Pausa arriba.', alternativas: [{ nombre: 'Encogimientos con barra', musculo: 'Trapecio' }] },
      { id: 'crp',  nombre: 'Crunch en polea',           musculo: 'Abdominales',           series: 3, reps: '20',  tipo: 'peso',   gif: G.crp,  tip: 'Contrae hacia las rodillas. Sin usar el cuello.', alternativas: [{ nombre: 'Crunch en suelo', musculo: 'Abdominales' }] },
    ]
  },
]

// ── GANAR MÚSCULO ─────────────────────────────────────────────────────────────

const GANAR_PRINCIPIANTE = [
  {
    id: 'lunes', nombre: 'Lunes', enfoque: 'Full Body A — Sentadilla + Push + Pull', color: '#6366f1', bg: '#eef2ff', emoji: '💪',
    cardio: 'Caminata 8-10 min de calentamiento. Mínimo cardio: el objetivo es ganar músculo.',
    ejercicios: [
      { id: 'sg',   nombre: 'Sentadilla goblet',         musculo: 'Cuádriceps, glúteos',   series: 3, reps: '8–12', tipo: 'peso',   gif: G.sg,   tip: 'Aprender el patrón correctamente es lo más importante. Sin peso hasta dominar la técnica.', alternativas: [{ nombre: 'Sentadilla con peso corporal', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pman', nombre: 'Press mancuernas banco',    musculo: 'Pecho (fibras medias)', series: 3, reps: '8–12', tipo: 'peso',   gif: G.pman, tip: 'Baja 2 seg, pausa leve en el pecho, sube explosivo. Progresión doble.', alternativas: [{ nombre: 'Flexiones en suelo', musculo: 'Pecho' }] },
      { id: 'rman', nombre: 'Remo mancuerna unilateral', musculo: 'Espalda media',         series: 3, reps: '8–12', tipo: 'peso',   gif: G.rman, tip: 'Codo pegado al cuerpo. Cuando completes 12 reps todas las series, sube el peso.', alternativas: [{ nombre: 'Remo en máquina', musculo: 'Espalda media' }] },
      { id: 'et',   nombre: 'Extensión tríceps polea',   musculo: 'Tríceps (cabeza lateral)',series:2, reps: '12',  tipo: 'peso',   gif: G.et,   tip: 'Aislamiento de tríceps. Codos fijos.', alternativas: [{ nombre: 'Fondos en banco', musculo: 'Tríceps' }] },
      { id: 'pl',   nombre: 'Plancha isométrica',        musculo: 'Core completo',         series: 2, reps: '30',  tipo: 'tiempo', gif: G.pl,   tip: 'Core fuerte = más fuerza en todos los ejercicios.', alternativas: [{ nombre: 'Plancha sobre rodillas', musculo: 'Core' }] },
    ]
  },
  {
    id: 'miercoles', nombre: 'Miércoles', enfoque: 'Full Body B — Bisagra + Press + Jalón', color: '#6366f1', bg: '#eef2ff', emoji: '🔙',
    cardio: 'Caminata 8-10 min calentamiento.',
    ejercicios: [
      { id: 'pmr',  nombre: 'Peso muerto rumano mancuernas', musculo: 'Isquiotibiales, glúteos', series: 3, reps: '8–12', tipo: 'peso', gif: G.pmr, tip: 'Bisagra de cadera perfecta. Mancuernas para aprender el patrón sin riesgo de espalda.', alternativas: [{ nombre: 'Good morning con banda', musculo: 'Isquiotibiales' }] },
      { id: 'pi',   nombre: 'Press inclinado mancuernas',musculo: 'Pecho (parte superior)',series: 3, reps: '8–12', tipo: 'peso',   gif: G.pi,   tip: 'Banco 30°. Ángulo diferente al lunes para estimular más fibras.', alternativas: [{ nombre: 'Flexiones con pies elevados', musculo: 'Pecho superior' }] },
      { id: 'jp',   nombre: 'Jalón al pecho (polea)',    musculo: 'Dorsal ancho',          series: 3, reps: '8–12', tipo: 'peso',   gif: G.jp,   tip: 'Aprende la mecánica del jalón antes de pasar a dominadas. Pecho al frente.', alternativas: [{ nombre: 'Jalón con banda', musculo: 'Dorsal' }] },
      { id: 'cb',   nombre: 'Curl bíceps mancuernas',    musculo: 'Bíceps (cabeza larga)', series: 2, reps: '12',  tipo: 'peso',   gif: G.cb,   tip: 'No balancees. Supina la muñeca en el top.', alternativas: [{ nombre: 'Curl con banda', musculo: 'Bíceps' }] },
      { id: 'crp',  nombre: 'Crunch en suelo',           musculo: 'Abdominales',           series: 2, reps: '15',  tipo: 'reps',   gif: G.crp,  tip: 'Contrae el abdomen antes de subir. No jalones el cuello.', alternativas: [{ nombre: 'Crunch en polea', musculo: 'Abdominales' }] },
    ]
  },
  {
    id: 'viernes', nombre: 'Viernes', enfoque: 'Full Body C — Pierna + Upper total', color: '#6366f1', bg: '#eef2ff', emoji: '⚡',
    cardio: 'Caminata 10 min calentamiento.',
    ejercicios: [
      { id: 'pr',   nombre: 'Prensa 45°',                musculo: 'Cuádriceps, glúteos',   series: 3, reps: '10',  tipo: 'peso',   gif: G.pr,   tip: 'Alternativa segura a la sentadilla para el tercer estímulo de pierna semanal.', alternativas: [{ nombre: 'Sentadilla goblet', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'cf',   nombre: 'Curl femoral tumbado',      musculo: 'Isquiotibiales',        series: 3, reps: '12',  tipo: 'peso',   gif: G.cf,   tip: 'Isquiotibiales. Complemento al peso muerto rumano del miércoles.', alternativas: [{ nombre: 'Curl femoral con banda', musculo: 'Isquiotibiales' }] },
      { id: 'rs',   nombre: 'Remo sentado polea',        musculo: 'Espalda media',         series: 3, reps: '10',  tipo: 'peso',   gif: G.rs,   tip: 'Tercer estímulo de espalda. No te balancees.', alternativas: [{ nombre: 'Remo en máquina', musculo: 'Espalda media' }] },
      { id: 'el',   nombre: 'Elevaciones laterales',     musculo: 'Deltoides lateral',     series: 2, reps: '15',  tipo: 'peso',   gif: G.el,   tip: 'Hombros: solo trabajo directo del viernes. Peso ligero, forma perfecta.', alternativas: [{ nombre: 'Elevaciones con banda', musculo: 'Hombros' }] },
      { id: 'gp',   nombre: 'Gemelos de pie',            musculo: 'Gemelos',               series: 3, reps: '15',  tipo: 'peso',   gif: G.gp,   tip: 'Rango completo. Los gemelos necesitan frecuencia alta para crecer.', alternativas: [{ nombre: 'Elevación de talones sentado', musculo: 'Sóleo' }] },
    ]
  },
]

const GANAR_INTERMEDIO = [
  {
    id: 'lunes', nombre: 'Lunes', enfoque: 'Push — Pecho + Hombros + Tríceps', color: '#6366f1', bg: '#eef2ff', emoji: '💪',
    cardio: 'Caminata 10 min calentamiento. Cardio mínimo en días de músculo.',
    ejercicios: [
      { id: 'pb',   nombre: 'Press banca plano (barra)',  musculo: 'Pecho (fibras medias)', series: 4, reps: '8–10', tipo: 'peso',  gif: G.pb,   tip: 'Ejercicio principal. Escápulas juntas. Progresión lineal semanal.', alternativas: [{ nombre: 'Press mancuernas', musculo: 'Pecho' }] },
      { id: 'pi',   nombre: 'Press inclinado mancuernas',musculo: 'Pecho (parte superior)',series: 3, reps: '10',  tipo: 'peso',   gif: G.pi,   tip: 'Banco 30°. Desarrolla pectoral superior.', alternativas: [{ nombre: 'Press inclinado barra', musculo: 'Pecho superior' }] },
      { id: 'pm',   nombre: 'Press militar barra de pie',musculo: 'Deltoides anterior',    series: 3, reps: '8–10', tipo: 'peso',  gif: G.pm,   tip: 'De pie: mayor activación del core. No arquees la espalda.', alternativas: [{ nombre: 'Press Arnold sentado', musculo: 'Hombros completo' }] },
      { id: 'el',   nombre: 'Elevaciones laterales',     musculo: 'Deltoides lateral',     series: 3, reps: '12',  tipo: 'peso',   gif: G.el,   tip: 'Peso ligero, rango completo. Deltoides lateral = anchura.', alternativas: [{ nombre: 'Elevaciones en polea', musculo: 'Deltoides lateral' }] },
      { id: 'fo',   nombre: 'Fondos en paralelas',       musculo: 'Pecho inferior y tríceps',series:3,reps: '8–10',tipo:'peso_reps',gif:G.fo,  tip: 'Inclínate para pecho. Peso en cinturón si puedes hacer 10+ reps.', alternativas: [{ nombre: 'Fondos asistidos', musculo: 'Pecho/Tríceps' }] },
      { id: 'et',   nombre: 'Extensión tríceps polea',   musculo: 'Tríceps (cabeza lateral)',series:3, reps: '12', tipo: 'peso',   gif: G.et,   tip: 'Aislamiento final. Codos pegados al cuerpo.', alternativas: [{ nombre: 'Press francés', musculo: 'Tríceps' }] },
    ]
  },
  {
    id: 'martes', nombre: 'Martes', enfoque: 'Pull — Espalda + Bíceps + Posterior', color: '#6366f1', bg: '#eef2ff', emoji: '🔙',
    cardio: 'Caminata 10 min calentamiento.',
    ejercicios: [
      { id: 'jp',   nombre: 'Jalón al pecho',            musculo: 'Dorsal ancho',          series: 4, reps: '8',   tipo: 'peso',   gif: G.jp,   tip: 'Tira hacia la clavícula. Pecho erguido.', alternativas: [{ nombre: 'Dominadas asistidas', musculo: 'Dorsal' }] },
      { id: 'rb',   nombre: 'Remo con barra',            musculo: 'Espesor de espalda',    series: 4, reps: '8',   tipo: 'peso',   gif: G.rb,   tip: 'Espalda paralela al suelo. Tira al ombligo. Pausa en el top.', alternativas: [{ nombre: 'Remo mancuerna unilateral', musculo: 'Espalda media' }] },
      { id: 'rs',   nombre: 'Remo sentado polea',        musculo: 'Espalda media',         series: 3, reps: '10',  tipo: 'peso',   gif: G.rs,   tip: 'No te balancees. Codos pegados al cuerpo.', alternativas: [{ nombre: 'Remo en máquina', musculo: 'Espalda media' }] },
      { id: 'pp',   nombre: 'Pájaros con mancuernas',    musculo: 'Deltoides posterior',   series: 3, reps: '15',  tipo: 'peso',   gif: G.pp,   tip: 'Salud del hombro. No skips.', alternativas: [{ nombre: 'Face pull con cuerda', musculo: 'Deltoides posterior' }] },
      { id: 'cb',   nombre: 'Curl bíceps barra EZ',      musculo: 'Bíceps (cabeza larga)', series: 3, reps: '10',  tipo: 'peso',   gif: G.cb,   tip: 'No balancees. Aprieta en el top.', alternativas: [{ nombre: 'Curl con mancuernas', musculo: 'Bíceps' }] },
      { id: 'cm',   nombre: 'Curl martillo',             musculo: 'Bíceps (braquial)',     series: 2, reps: '12',  tipo: 'peso',   gif: G.cm,   tip: 'Agarre neutro. Trabaja braquial.', alternativas: [{ nombre: 'Curl martillo en polea', musculo: 'Braquial' }] },
    ]
  },
  {
    id: 'jueves', nombre: 'Jueves', enfoque: 'Legs — Pierna Completa', color: '#f97316', bg: '#fff7ed', emoji: '🦵',
    cardio: 'Caminata 10 min calentamiento. Sin cardio pesado: piernas piden recuperación.',
    ejercicios: [
      { id: 'sq',   nombre: 'Sentadilla con barra',      musculo: 'Cuádriceps, glúteos',   series: 4, reps: '8–10', tipo: 'peso',  gif: G.sq,   tip: 'Ejercicio rey. Espalda recta, muslo paralelo. Progresión semanal.', alternativas: [{ nombre: 'Sentadilla goblet', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pr',   nombre: 'Prensa 45°',                musculo: 'Cuádriceps, glúteos',   series: 4, reps: '10',  tipo: 'peso',   gif: G.pr,   tip: 'Accesorio de cuádriceps. No bloquees rodillas.', alternativas: [{ nombre: 'Hack squat', musculo: 'Cuádriceps' }] },
      { id: 'pmr',  nombre: 'Peso muerto rumano',        musculo: 'Isquiotibiales, glúteos',series:3, reps: '10',  tipo: 'peso',   gif: G.pmr,  tip: 'Bisagra de cadera. Barra cerca de las piernas.', alternativas: [{ nombre: 'RDL con mancuernas', musculo: 'Isquiotibiales' }] },
      { id: 'cf',   nombre: 'Curl femoral tumbado',      musculo: 'Isquiotibiales',        series: 3, reps: '12',  tipo: 'peso',   gif: G.cf,   tip: 'Aislamiento de isquios. No levantes caderas.', alternativas: [{ nombre: 'Curl femoral de pie', musculo: 'Isquiotibiales' }] },
      { id: 'ec',   nombre: 'Extensión cuádriceps',      musculo: 'Cuádriceps (aislado)',  series: 3, reps: '15',  tipo: 'peso',   gif: G.ec,   tip: 'Finalizador de cuádriceps. Control total.', alternativas: [{ nombre: 'Sentadilla con peso corporal', musculo: 'Cuádriceps' }] },
      { id: 'gp',   nombre: 'Gemelos de pie',            musculo: 'Gemelos',               series: 4, reps: '15',  tipo: 'peso',   gif: G.gp,   tip: 'Rango completo. Aguanta 1 seg arriba.', alternativas: [{ nombre: 'Gemelos en prensa', musculo: 'Gemelos/Sóleo' }] },
    ]
  },
  {
    id: 'viernes', nombre: 'Viernes', enfoque: 'Upper Full — Segunda estimulación Push + Pull', color: '#6366f1', bg: '#eef2ff', emoji: '⚡',
    cardio: 'Caminata 10 min calentamiento.',
    ejercicios: [
      { id: 'pman', nombre: 'Press mancuernas banco',    musculo: 'Pecho (fibras medias)', series: 3, reps: '12',  tipo: 'peso',   gif: G.pman, tip: '2ª sesión de pecho esta semana. Mayor RIR que el lunes, más reps.', alternativas: [{ nombre: 'Aperturas en polea', musculo: 'Pecho' }] },
      { id: 'rman', nombre: 'Remo mancuerna unilateral', musculo: 'Espalda media',         series: 3, reps: '12',  tipo: 'peso',   gif: G.rman, tip: '2ª sesión de espalda. Conexión muscular, no peso máximo.', alternativas: [{ nombre: 'Remo en máquina', musculo: 'Espalda media' }] },
      { id: 'je',   nombre: 'Jalón agarre estrecho',     musculo: 'Dorsal y bíceps',       series: 3, reps: '12',  tipo: 'peso',   gif: G.je,   tip: 'Agarre neutro. Lleva codos hacia las caderas.', alternativas: [{ nombre: 'Dominadas agarre estrecho', musculo: 'Dorsal/Bíceps' }] },
      { id: 'fp',   nombre: 'Face pull en polea',        musculo: 'Rotadores, trapecio',   series: 3, reps: '15',  tipo: 'peso',   gif: G.fp,   tip: 'Polea a altura de ojos. Codos arriba. Salud del hombro.', alternativas: [{ nombre: 'Rotaciones externas banda', musculo: 'Manguito rotador' }] },
      { id: 'pf',   nombre: 'Press francés',             musculo: 'Tríceps (cabeza larga)',series: 3, reps: '12',  tipo: 'peso',   gif: G.pf,   tip: '2ª sesión de tríceps. Barra EZ, codos al techo.', alternativas: [{ nombre: 'Extensión sobre cabeza mancuerna', musculo: 'Tríceps' }] },
      { id: 'pl',   nombre: 'Plancha isométrica',        musculo: 'Core completo',         series: 3, reps: '45',  tipo: 'tiempo', gif: G.pl,   tip: 'Core fuerte = mejor desempeño en todos los levantamientos.', alternativas: [{ nombre: 'Plancha lateral', musculo: 'Oblicuos' }] },
    ]
  },
]

const GANAR_AVANZADO = [
  {
    id: 'lunes', nombre: 'Lunes', enfoque: 'Push A — Pecho énfasis', color: '#6366f1', bg: '#eef2ff', emoji: '💪',
    cardio: 'Movilidad de hombros 8 min. Sin cardio en días de fuerza máxima.',
    ejercicios: [
      { id: 'pb',   nombre: 'Press banca plano (barra)',  musculo: 'Pecho (fibras medias)', series: 5, reps: '6–8', tipo: 'peso',   gif: G.pb,   tip: 'Ejercicio principal. Arco técnico, leg drive. Progresión semanal obligatoria.', alternativas: [{ nombre: 'Press mancuernas', musculo: 'Pecho' }] },
      { id: 'pi',   nombre: 'Press inclinado barra',      musculo: 'Pecho (parte superior)',series: 4, reps: '8',   tipo: 'peso',   gif: G.pi,   tip: 'Banco 30°. Accesorio principal de pecho superior.', alternativas: [{ nombre: 'Press inclinado mancuernas', musculo: 'Pecho superior' }] },
      { id: 'fo',   nombre: 'Fondos con lastre',          musculo: 'Pecho inferior y tríceps',series:3,reps:'8',  tipo:'peso_reps',gif:G.fo,   tip: 'Cinturón con 10-20kg. Máxima sobrecarga en pecho inferior.', alternativas: [{ nombre: 'Fondos en paralelas', musculo: 'Pecho/Tríceps' }] },
      { id: 'pm',   nombre: 'Press militar barra de pie', musculo: 'Deltoides anterior',    series: 4, reps: '6–8', tipo: 'peso',   gif: G.pm,   tip: 'De pie. Progresión lineal. Descanso 3 min.', alternativas: [{ nombre: 'Press Arnold sentado', musculo: 'Hombros completo' }] },
      { id: 'et',   nombre: 'Extensión tríceps polea',    musculo: 'Tríceps (cabeza lateral)',series:3,reps: '10', tipo: 'peso',   gif: G.et,   tip: 'Aislamiento de tríceps. RIR 2.', alternativas: [{ nombre: 'Press francés', musculo: 'Tríceps' }] },
      { id: 'pf',   nombre: 'Press francés',              musculo: 'Tríceps (cabeza larga)',series: 3, reps: '10',  tipo: 'peso',   gif: G.pf,   tip: 'Cabeza larga del tríceps. Barra EZ.', alternativas: [{ nombre: 'Extensión sobre cabeza mancuerna', musculo: 'Tríceps' }] },
    ]
  },
  {
    id: 'martes', nombre: 'Martes', enfoque: 'Pull A — Espalda énfasis', color: '#6366f1', bg: '#eef2ff', emoji: '🔙',
    cardio: 'Movilidad de hombros y cadena posterior 8 min.',
    ejercicios: [
      { id: 'jp',   nombre: 'Dominadas con lastre',       musculo: 'Dorsal ancho',          series: 4, reps: '6–8', tipo: 'peso_reps', gif: G.jp, tip: 'Cinturón con 5-15kg. Baja en 3 seg para máxima tensión.', alternativas: [{ nombre: 'Jalón al pecho', musculo: 'Dorsal' }] },
      { id: 'rb',   nombre: 'Remo Pendlay (barra)',       musculo: 'Espesor de espalda',    series: 4, reps: '6',   tipo: 'peso',   gif: G.rb,   tip: 'Remo desde el suelo (Pendlay): explosivo, máxima carga. Espalda paralela.', alternativas: [{ nombre: 'Remo con barra convencional', musculo: 'Espalda media' }] },
      { id: 'rs',   nombre: 'Remo sentado polea',         musculo: 'Espalda media',         series: 3, reps: '10',  tipo: 'peso',   gif: G.rs,   tip: 'Desarrolla el espesor de la espalda. No te balancees.', alternativas: [{ nombre: 'Remo máquina', musculo: 'Espalda media' }] },
      { id: 'je',   nombre: 'Jalón agarre estrecho',      musculo: 'Dorsal y bíceps',       series: 3, reps: '10',  tipo: 'peso',   gif: G.je,   tip: 'Agarre neutro. Lleva codos a las caderas.', alternativas: [{ nombre: 'Dominadas agarre neutro', musculo: 'Dorsal/Bíceps' }] },
      { id: 'cb',   nombre: 'Curl bíceps barra EZ',       musculo: 'Bíceps (cabeza larga)', series: 4, reps: '8',   tipo: 'peso',   gif: G.cb,   tip: 'Peso alto, RIR 1. Progresión semanal.', alternativas: [{ nombre: 'Curl con mancuernas', musculo: 'Bíceps' }] },
      { id: 'cm',   nombre: 'Curl martillo',              musculo: 'Bíceps (braquial)',     series: 3, reps: '10',  tipo: 'peso',   gif: G.cm,   tip: 'Braquial y braquiorradial. Agarre neutro.', alternativas: [{ nombre: 'Curl martillo en polea', musculo: 'Braquial' }] },
    ]
  },
  {
    id: 'miercoles', nombre: 'Miércoles', enfoque: 'Legs — Pierna Completa', color: '#f97316', bg: '#fff7ed', emoji: '🦵',
    cardio: 'Movilidad cadera y tobillo 10 min. Sin cardio: piernas requieren máxima recuperación.',
    ejercicios: [
      { id: 'sq',   nombre: 'Sentadilla con barra',       musculo: 'Cuádriceps, glúteos',   series: 5, reps: '6–8', tipo: 'peso',   gif: G.sq,   tip: 'Ejercicio rey. Progresión lineal obligatoria. Descanso 3-4 min.', alternativas: [{ nombre: 'Sentadilla goblet', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pr',   nombre: 'Prensa 45°',                 musculo: 'Cuádriceps, glúteos',   series: 4, reps: '10',  tipo: 'peso',   gif: G.pr,   tip: 'Accesorio de cuádriceps. Pies altos para glúteo.', alternativas: [{ nombre: 'Hack squat', musculo: 'Cuádriceps' }] },
      { id: 'pmr',  nombre: 'Peso muerto rumano',         musculo: 'Isquiotibiales, glúteos',series:4, reps: '8',   tipo: 'peso',   gif: G.pmr,  tip: 'Bisagra de cadera pesada. Barra roza las piernas.', alternativas: [{ nombre: 'RDL con mancuernas', musculo: 'Isquiotibiales' }] },
      { id: 'cf',   nombre: 'Curl femoral tumbado',       musculo: 'Isquiotibiales',        series: 3, reps: '12',  tipo: 'peso',   gif: G.cf,   tip: 'No levantes caderas. Aislamiento de isquios.', alternativas: [{ nombre: 'Curl femoral nórdico', musculo: 'Isquiotibiales' }] },
      { id: 'ec',   nombre: 'Extensión cuádriceps',       musculo: 'Cuádriceps (aislado)',  series: 3, reps: '15',  tipo: 'peso',   gif: G.ec,   tip: 'Finalizador. Control total.', alternativas: [{ nombre: 'Sentadilla con salto', musculo: 'Cuádriceps' }] },
      { id: 'gp',   nombre: 'Gemelos de pie',             musculo: 'Gemelos',               series: 5, reps: '12',  tipo: 'peso',   gif: G.gp,   tip: 'Máximo rango. Pausa 1 seg arriba y abajo.', alternativas: [{ nombre: 'Gemelos en prensa', musculo: 'Gemelos/Sóleo' }] },
    ]
  },
  {
    id: 'jueves', nombre: 'Jueves', enfoque: 'Push B — Hombros énfasis + 2ª pecho', color: '#8b5cf6', bg: '#f5f3ff', emoji: '🏔️',
    cardio: 'Movilidad de hombros 8 min obligatorio.',
    ejercicios: [
      { id: 'el',   nombre: 'Elevaciones laterales (pesadas)', musculo: 'Deltoides lateral', series: 5, reps: '10–12', tipo: 'peso', gif: G.el, tip: '2ª estimulación hombros. Peso alto para laterales. Deltoides lateral = anchura.', alternativas: [{ nombre: 'Elevaciones en polea', musculo: 'Deltoides lateral' }] },
      { id: 'pp',   nombre: 'Pájaros con mancuernas',     musculo: 'Deltoides posterior',   series: 4, reps: '15',  tipo: 'peso',   gif: G.pp,   tip: 'Deltoides posterior = salud del hombro. No lo saltes nunca.', alternativas: [{ nombre: 'Face pull cuerda', musculo: 'Deltoides posterior' }] },
      { id: 'pman', nombre: 'Press mancuernas banco',     musculo: 'Pecho (fibras medias)', series: 4, reps: '10',  tipo: 'peso',   gif: G.pman, tip: '2ª estimulación de pecho esta semana. Mayor RIR que el lunes.', alternativas: [{ nombre: 'Aperturas en polea', musculo: 'Pecho' }] },
      { id: 'ap',   nombre: 'Aperturas en polea',         musculo: 'Aislamiento de pecho',  series: 3, reps: '15',  tipo: 'peso',   gif: G.ap,   tip: 'Finalizador de pecho. Contrae al máximo en el centro.', alternativas: [{ nombre: 'Pec-deck', musculo: 'Pecho' }] },
      { id: 'fp',   nombre: 'Face pull en polea',         musculo: 'Rotadores, trapecio',   series: 3, reps: '20',  tipo: 'peso',   gif: G.fp,   tip: 'Salud del hombro. Polea a la altura de los ojos.', alternativas: [{ nombre: 'Rotaciones externas banda', musculo: 'Manguito rotador' }] },
    ]
  },
  {
    id: 'viernes', nombre: 'Viernes', enfoque: 'Pull B — 2ª Espalda + Bíceps + Core', color: '#6366f1', bg: '#eef2ff', emoji: '⚡',
    cardio: 'Caminata suave 15 min. Recuperación activa de cara al fin de semana.',
    ejercicios: [
      { id: 'rman', nombre: 'Remo mancuerna unilateral',  musculo: 'Espalda media',         series: 4, reps: '10',  tipo: 'peso',   gif: G.rman, tip: '2ª estimulación de espalda. Pausa en el top 1 seg.', alternativas: [{ nombre: 'Remo en máquina', musculo: 'Espalda media' }] },
      { id: 'je',   nombre: 'Jalón agarre estrecho',      musculo: 'Dorsal y bíceps',       series: 3, reps: '12',  tipo: 'peso',   gif: G.je,   tip: 'Agarre neutro o supino. Lleva codos a las caderas.', alternativas: [{ nombre: 'Dominadas agarre estrecho', musculo: 'Dorsal/Bíceps' }] },
      { id: 'entr', nombre: 'Encogimientos de trapecio',  musculo: 'Trapecio',              series: 3, reps: '15',  tipo: 'peso',   gif: G.entr, tip: 'Hombros a las orejas. Pausa 1 seg arriba.', alternativas: [{ nombre: 'Encogimientos con barra', musculo: 'Trapecio' }] },
      { id: 'cb',   nombre: 'Curl bíceps concentrado',    musculo: 'Bíceps (cabeza larga)', series: 3, reps: '12',  tipo: 'peso',   gif: G.cb,   tip: '2ª estimulación de bíceps. Mayor conexión muscular.', alternativas: [{ nombre: 'Curl predicador', musculo: 'Bíceps' }] },
      { id: 'pl',   nombre: 'Plancha isométrica',         musculo: 'Core completo',         series: 3, reps: '60',  tipo: 'tiempo', gif: G.pl,   tip: '60 seg. Core fuerte = más fuerza en sentadilla y banca.', alternativas: [{ nombre: 'Plancha lateral', musculo: 'Oblicuos' }] },
      { id: 'evp',  nombre: 'Elevación de piernas',       musculo: 'Abdomen inferior',      series: 3, reps: '15',  tipo: 'reps',   gif: G.evp,  tip: 'Sube lento. Abdomen contraído todo el recorrido.', alternativas: [{ nombre: 'Elevación de rodillas colgado', musculo: 'Abdomen inferior' }] },
    ]
  },
]

// ── GANAR FUERZA ─────────────────────────────────────────────────────────────

const FUERZA_PRINCIPIANTE = [
  {
    id: 'lunes', nombre: 'Lunes', enfoque: 'Sentadilla — Pierna + Técnica', color: '#ef4444', bg: '#fef2f2', emoji: '🏋️',
    cardio: 'Movilidad de cadera y tobillo – 10 min obligatorio antes de sentadilla.',
    ejercicios: [
      { id: 'sq',   nombre: 'Sentadilla con barra (técnica)', musculo: 'Cuádriceps, glúteos', series: 3, reps: '5', tipo: 'peso', gif: G.sq, tip: 'Aprender el patrón es la prioridad. Peso moderado. Descanso 3 min entre series.', alternativas: [{ nombre: 'Sentadilla goblet', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pr',   nombre: 'Prensa 45° (accesorio)',        musculo: 'Cuádriceps, glúteos', series: 3, reps: '8',  tipo: 'peso', gif: G.pr,  tip: 'Accesorio de pierna para reforzar el patrón de sentadilla.', alternativas: [{ nombre: 'Zancadas con mancuernas', musculo: 'Cuádriceps' }] },
      { id: 'pmr',  nombre: 'Peso muerto rumano mancuernas', musculo: 'Isquiotibiales, glúteos', series: 3, reps: '8', tipo: 'peso', gif: G.pmr, tip: 'Bisagra de cadera con mancuernas. Aprende el patrón antes del peso muerto convencional.', alternativas: [{ nombre: 'Good morning con banda', musculo: 'Isquiotibiales' }] },
      { id: 'cf',   nombre: 'Curl femoral tumbado',          musculo: 'Isquiotibiales',      series: 3, reps: '10', tipo: 'peso', gif: G.cf,  tip: 'Equilibra cuádriceps/isquios para prevenir lesiones.', alternativas: [{ nombre: 'Curl femoral con banda', musculo: 'Isquiotibiales' }] },
    ]
  },
  {
    id: 'miercoles', nombre: 'Miércoles', enfoque: 'Press Banca — Pecho + Tríceps', color: '#ef4444', bg: '#fef2f2', emoji: '💪',
    cardio: 'Activación de rotadores de hombro – 8 min.',
    ejercicios: [
      { id: 'pb',   nombre: 'Press banca plano (principal)', musculo: 'Pecho (fibras medias)', series: 3, reps: '5', tipo: 'peso', gif: G.pb, tip: 'Ejercicio del día. Aprender el arco técnico, leg drive y posición de escápulas. Descanso 3 min.', alternativas: [{ nombre: 'Press en máquina Smith', musculo: 'Pecho' }] },
      { id: 'pi',   nombre: 'Press inclinado mancuernas',   musculo: 'Pecho (parte superior)', series: 3, reps: '8', tipo: 'peso', gif: G.pi, tip: 'Banco 30°. Accesorio de pecho. Descanso 2 min.', alternativas: [{ nombre: 'Flexiones con pies elevados', musculo: 'Pecho superior' }] },
      { id: 'pf',   nombre: 'Press francés',                musculo: 'Tríceps (cabeza larga)', series: 3, reps: '8', tipo: 'peso', gif: G.pf, tip: 'Tríceps fuertes = más fuerza en banca. Barra EZ.', alternativas: [{ nombre: 'Extensión sobre cabeza mancuerna', musculo: 'Tríceps' }] },
      { id: 'et',   nombre: 'Extensión tríceps polea',      musculo: 'Tríceps (cabeza lateral)', series: 2, reps: '10', tipo: 'peso', gif: G.et, tip: 'Aislamiento de tríceps. Codos fijos.', alternativas: [{ nombre: 'Fondos en banco', musculo: 'Tríceps' }] },
    ]
  },
  {
    id: 'viernes', nombre: 'Viernes', enfoque: 'Peso Muerto — Espalda + Cadena Posterior', color: '#ef4444', bg: '#fef2f2', emoji: '🔙',
    cardio: 'Activación lumbar y movilidad de cadera – 10 min.',
    ejercicios: [
      { id: 'pmk',  nombre: 'Peso muerto convencional',     musculo: 'Cadena posterior',    series: 3, reps: '5',  tipo: 'peso', gif: G.pmk, tip: 'El ejercicio del día. Barra sobre mediopiés, espalda recta, empuja el suelo. Descanso 3-4 min.', alternativas: [{ nombre: 'Peso muerto sumo', musculo: 'Cadena posterior' }] },
      { id: 'rb',   nombre: 'Remo con barra',               musculo: 'Espesor de espalda',  series: 3, reps: '8',  tipo: 'peso', gif: G.rb,  tip: 'Espalda paralela al suelo. Accesorio de peso muerto.', alternativas: [{ nombre: 'Remo mancuerna unilateral', musculo: 'Espalda media' }] },
      { id: 'jp',   nombre: 'Jalón al pecho',               musculo: 'Dorsal ancho',         series: 3, reps: '8',  tipo: 'peso', gif: G.jp,  tip: 'Jalón para desarrollar el dorsal. Pecho erguido.', alternativas: [{ nombre: 'Dominadas asistidas', musculo: 'Dorsal' }] },
      { id: 'pl',   nombre: 'Plancha isométrica',           musculo: 'Core completo',        series: 3, reps: '30', tipo: 'tiempo', gif: G.pl, tip: 'Core fuerte = peso muerto más seguro y pesado.', alternativas: [{ nombre: 'Plancha sobre rodillas', musculo: 'Core' }] },
    ]
  },
]

const FUERZA_INTERMEDIO = [
  {
    id: 'lunes', nombre: 'Lunes', enfoque: 'Sentadilla — 5×5 + Accesorios', color: '#ef4444', bg: '#fef2f2', emoji: '🏋️',
    cardio: 'Movilidad cadera y tobillo 10 min. Nada más: recuperación es la prioridad.',
    ejercicios: [
      { id: 'sq',   nombre: 'Sentadilla con barra (principal)', musculo: 'Cuádriceps, glúteos', series: 5, reps: '5', tipo: 'peso', gif: G.sq, tip: 'Progresión lineal: añade 2.5kg respecto a la semana anterior. Descanso 3-4 min.', alternativas: [{ nombre: 'Sentadilla en Smith', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pr',   nombre: 'Prensa 45° (accesorio)',          musculo: 'Cuádriceps, glúteos', series: 4, reps: '8', tipo: 'peso', gif: G.pr, tip: 'Pies altos para más glúteo. Descanso 2-3 min.', alternativas: [{ nombre: 'Zancadas con barra', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pmr',  nombre: 'Peso muerto rumano',              musculo: 'Isquiotibiales, glúteos', series: 3, reps: '8', tipo: 'peso', gif: G.pmr, tip: 'Bisagra de cadera pesada. Barra roza las piernas.', alternativas: [{ nombre: 'RDL con mancuernas', musculo: 'Isquiotibiales' }] },
      { id: 'cf',   nombre: 'Curl femoral tumbado',            musculo: 'Isquiotibiales',      series: 3, reps: '10', tipo: 'peso', gif: G.cf, tip: 'Equilibra cuád/isquios. Previene lesiones en sentadilla.', alternativas: [{ nombre: 'Curl femoral nórdico', musculo: 'Isquiotibiales' }] },
      { id: 'gp',   nombre: 'Gemelos con carga',              musculo: 'Gemelos',              series: 3, reps: '12', tipo: 'peso', gif: G.gp, tip: 'Rango completo. Pausa 1 seg arriba.', alternativas: [{ nombre: 'Gemelos en prensa', musculo: 'Gemelos' }] },
    ]
  },
  {
    id: 'martes', nombre: 'Martes', enfoque: 'Press Banca — 5×5 + Accesorios', color: '#ef4444', bg: '#fef2f2', emoji: '💪',
    cardio: 'Activación de rotadores de hombro 8 min.',
    ejercicios: [
      { id: 'pb',   nombre: 'Press banca plano (principal)', musculo: 'Pecho (fibras medias)', series: 5, reps: '5', tipo: 'peso', gif: G.pb, tip: 'Ejercicio del día. Arco técnico, escápulas juntas y deprimidas, leg drive. Descanso 3-4 min.', alternativas: [{ nombre: 'Press en Smith', musculo: 'Pecho' }] },
      { id: 'pi',   nombre: 'Press inclinado barra',         musculo: 'Pecho (parte superior)', series: 4, reps: '6–8', tipo: 'peso', gif: G.pi, tip: 'Banco 30°. Desarrolla pectoral superior para mejorar la banca.', alternativas: [{ nombre: 'Press inclinado mancuernas', musculo: 'Pecho superior' }] },
      { id: 'fo',   nombre: 'Fondos con lastre',             musculo: 'Pecho inferior y tríceps', series: 3, reps: '6–8', tipo: 'peso_reps', gif: G.fo, tip: 'Excelente accesorio de banca. Inclínate para más pecho.', alternativas: [{ nombre: 'Fondos sin lastre', musculo: 'Pecho/Tríceps' }] },
      { id: 'pf',   nombre: 'Press francés',                 musculo: 'Tríceps (cabeza larga)', series: 3, reps: '8', tipo: 'peso', gif: G.pf, tip: 'Tríceps = 60% del bloqueo en banca. No skips.', alternativas: [{ nombre: 'Extensión sobre cabeza mancuerna', musculo: 'Tríceps' }] },
      { id: 'fp',   nombre: 'Face pull en polea',            musculo: 'Rotadores, trapecio',   series: 3, reps: '15', tipo: 'peso', gif: G.fp, tip: 'Salud del hombro. Siempre en días de press.', alternativas: [{ nombre: 'Rotaciones externas banda', musculo: 'Manguito rotador' }] },
    ]
  },
  {
    id: 'jueves', nombre: 'Jueves', enfoque: 'Peso Muerto — 4×3-5 + Espalda', color: '#ef4444', bg: '#fef2f2', emoji: '🔙',
    cardio: 'Activación lumbar y cadera 10 min.',
    ejercicios: [
      { id: 'pmk',  nombre: 'Peso muerto convencional (principal)', musculo: 'Cadena posterior', series: 4, reps: '3–5', tipo: 'peso', gif: G.pmk, tip: 'Ejercicio del día. Progresión lineal. Barra sobre mediopiés. Descanso 3-5 min.', alternativas: [{ nombre: 'Peso muerto sumo', musculo: 'Cadena posterior' }] },
      { id: 'rb',   nombre: 'Remo Pendlay',                        musculo: 'Espesor de espalda', series: 4, reps: '6', tipo: 'peso', gif: G.rb, tip: 'Remo desde el suelo. Explosivo. Excelente accesorio de peso muerto.', alternativas: [{ nombre: 'Remo con barra', musculo: 'Espalda media' }] },
      { id: 'jp',   nombre: 'Jalón al pecho pesado',               musculo: 'Dorsal ancho',       series: 3, reps: '6', tipo: 'peso', gif: G.jp, tip: 'Ancho de espalda. Peso alto, pocas reps.', alternativas: [{ nombre: 'Dominadas con lastre', musculo: 'Dorsal' }] },
      { id: 'pl',   nombre: 'Plancha avanzada',                    musculo: 'Core completo',      series: 3, reps: '60', tipo: 'tiempo', gif: G.pl, tip: 'Core fuerte = peso muerto más pesado y más seguro.', alternativas: [{ nombre: 'Plancha con extensión de brazo', musculo: 'Core' }] },
    ]
  },
  {
    id: 'viernes', nombre: 'Viernes', enfoque: 'Press Militar — 5×5 + Hombros + Core', color: '#8b5cf6', bg: '#f5f3ff', emoji: '🏔️',
    cardio: 'Movilidad de hombros 8 min.',
    ejercicios: [
      { id: 'pm',   nombre: 'Press militar barra de pie (principal)', musculo: 'Deltoides anterior', series: 5, reps: '5', tipo: 'peso', gif: G.pm, tip: 'De pie. Progresión lineal. Core tenso, no arquees la espalda. Descanso 3 min.', alternativas: [{ nombre: 'Press militar sentado mancuernas', musculo: 'Deltoides anterior' }] },
      { id: 'el',   nombre: 'Elevaciones laterales',                  musculo: 'Deltoides lateral',  series: 4, reps: '10–12', tipo: 'peso', gif: G.el, tip: 'Deltoides lateral para anchura. Más peso que en rutinas de hipertrofia.', alternativas: [{ nombre: 'Elevaciones en polea', musculo: 'Deltoides lateral' }] },
      { id: 'pp',   nombre: 'Face pull / Pájaros',                    musculo: 'Deltoides posterior', series: 4, reps: '15', tipo: 'peso', gif: G.pp, tip: 'Salud del hombro. Siempre en días de press militar.', alternativas: [{ nombre: 'Rotaciones externas banda', musculo: 'Manguito rotador' }] },
      { id: 'et',   nombre: 'Extensión tríceps polea',                musculo: 'Tríceps (cabeza lateral)', series: 3, reps: '10', tipo: 'peso', gif: G.et, tip: 'Tríceps fuertes = más fuerza en press militar.', alternativas: [{ nombre: 'Tríceps en polea con cuerda', musculo: 'Tríceps' }] },
      { id: 'crp',  nombre: 'Crunch en polea',                        musculo: 'Abdominales',         series: 3, reps: '15', tipo: 'peso', gif: G.crp, tip: 'Core resistente = mejora en todos los levantamientos.', alternativas: [{ nombre: 'Crunch en suelo', musculo: 'Abdominales' }] },
    ]
  },
]

const FUERZA_AVANZADO = [
  {
    id: 'lunes', nombre: 'Lunes', enfoque: 'Sentadilla Pesada + Accesorios pierna', color: '#ef4444', bg: '#fef2f2', emoji: '🏋️',
    cardio: 'Movilidad cadera y tobillo 10 min. Sin cardio.',
    ejercicios: [
      { id: 'sq',   nombre: 'Sentadilla con barra (heavy)', musculo: 'Cuádriceps, glúteos', series: 5, reps: '3–5', tipo: 'peso', gif: G.sq, tip: 'Sesión pesada. Progresión lineal o por bloques. Descanso 4-5 min.', alternativas: [{ nombre: 'Sentadilla frontal', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pr',   nombre: 'Prensa 45°',                   musculo: 'Cuádriceps, glúteos', series: 4, reps: '8',   tipo: 'peso', gif: G.pr, tip: 'Accesorio. Pies altos para glúteo.', alternativas: [{ nombre: 'Hack squat', musculo: 'Cuádriceps' }] },
      { id: 'pmr',  nombre: 'Peso muerto rumano',           musculo: 'Isquiotibiales, glúteos', series: 4, reps: '8', tipo: 'peso', gif: G.pmr, tip: 'Bisagra de cadera pesada. Complementa la sentadilla.', alternativas: [{ nombre: 'RDL con mancuernas', musculo: 'Isquiotibiales' }] },
      { id: 'cf',   nombre: 'Curl femoral',                 musculo: 'Isquiotibiales',      series: 3, reps: '10', tipo: 'peso', gif: G.cf, tip: 'Equilibra cuád/isquios para prevenir lesiones en sentadilla pesada.', alternativas: [{ nombre: 'Curl femoral nórdico', musculo: 'Isquiotibiales' }] },
      { id: 'gp',   nombre: 'Gemelos con máxima carga',    musculo: 'Gemelos',              series: 4, reps: '10', tipo: 'peso', gif: G.gp, tip: 'Máximo peso controlado. Pausa 1 seg arriba y abajo.', alternativas: [{ nombre: 'Gemelos en prensa', musculo: 'Gemelos/Sóleo' }] },
    ]
  },
  {
    id: 'martes', nombre: 'Martes', enfoque: 'Press Banca Pesado + Tríceps', color: '#ef4444', bg: '#fef2f2', emoji: '💪',
    cardio: 'Activación rotadores 8 min.',
    ejercicios: [
      { id: 'pb',   nombre: 'Press banca plano (heavy)',    musculo: 'Pecho (fibras medias)', series: 5, reps: '3–5', tipo: 'peso', gif: G.pb, tip: 'Sesión pesada. Arco técnico, leg drive, escápulas. Descanso 4-5 min.', alternativas: [{ nombre: 'Press en Smith', musculo: 'Pecho' }] },
      { id: 'pi',   nombre: 'Press inclinado barra',        musculo: 'Pecho (parte superior)', series: 4, reps: '6', tipo: 'peso', gif: G.pi, tip: 'Banco 30°. Accesorio principal de pecho superior.', alternativas: [{ nombre: 'Press inclinado mancuernas', musculo: 'Pecho superior' }] },
      { id: 'fo',   nombre: 'Fondos con lastre',            musculo: 'Pecho inferior y tríceps', series: 4, reps: '6–8', tipo: 'peso_reps', gif: G.fo, tip: 'Cinturón con lastre. El mejor accesorio de banca.', alternativas: [{ nombre: 'Fondos sin lastre', musculo: 'Pecho/Tríceps' }] },
      { id: 'pf',   nombre: 'Press francés',                musculo: 'Tríceps (cabeza larga)', series: 4, reps: '8', tipo: 'peso', gif: G.pf, tip: 'Tríceps = 60% del bloqueo en banca. Prioritario.', alternativas: [{ nombre: 'Extensión sobre cabeza mancuerna', musculo: 'Tríceps' }] },
      { id: 'et',   nombre: 'Extensión tríceps polea',      musculo: 'Tríceps (cabeza lateral)', series: 3, reps: '12', tipo: 'peso', gif: G.et, tip: 'Aislamiento de tríceps. Finalizador.', alternativas: [{ nombre: 'Tríceps en polea con cuerda', musculo: 'Tríceps' }] },
    ]
  },
  {
    id: 'miercoles', nombre: 'Miércoles', enfoque: 'Peso Muerto Pesado + Espalda', color: '#ef4444', bg: '#fef2f2', emoji: '🔙',
    cardio: 'Activación lumbar y cadera 10 min.',
    ejercicios: [
      { id: 'pmk',  nombre: 'Peso muerto convencional (heavy)', musculo: 'Cadena posterior', series: 4, reps: '2–4', tipo: 'peso', gif: G.pmk, tip: 'Sesión pesada. Progresión lineal o por bloques. Descanso 4-5 min.', alternativas: [{ nombre: 'Peso muerto sumo', musculo: 'Cadena posterior' }] },
      { id: 'rb',   nombre: 'Remo Pendlay',                    musculo: 'Espesor de espalda', series: 4, reps: '5', tipo: 'peso', gif: G.rb, tip: 'Remo desde el suelo. Explosivo. Máxima carga.', alternativas: [{ nombre: 'Remo con barra', musculo: 'Espalda media' }] },
      { id: 'jp',   nombre: 'Dominadas con lastre',            musculo: 'Dorsal ancho',       series: 4, reps: '5', tipo: 'peso_reps', gif: G.jp, tip: 'Cinturón con 10-20kg. Ancho de espalda.', alternativas: [{ nombre: 'Jalón al pecho pesado', musculo: 'Dorsal' }] },
      { id: 'rs',   nombre: 'Remo sentado polea',              musculo: 'Espalda media',      series: 3, reps: '10', tipo: 'peso', gif: G.rs, tip: 'Accesorio de espalda. No te balancees.', alternativas: [{ nombre: 'Remo máquina', musculo: 'Espalda media' }] },
      { id: 'pl',   nombre: 'Plancha avanzada',               musculo: 'Core completo',      series: 3, reps: '60', tipo: 'tiempo', gif: G.pl, tip: 'Core fuerte = peso muerto más pesado y seguro.', alternativas: [{ nombre: 'Ab wheel', musculo: 'Core' }] },
    ]
  },
  {
    id: 'jueves', nombre: 'Jueves', enfoque: 'Sentadilla Técnica + Pierna Accesoria', color: '#ef4444', bg: '#fef2f2', emoji: '🦵',
    cardio: 'Movilidad cadera 8 min.',
    ejercicios: [
      { id: 'sq',   nombre: 'Sentadilla técnica (65-75%)',    musculo: 'Cuádriceps, glúteos', series: 4, reps: '3', tipo: 'peso', gif: G.sq, tip: 'Sesión técnica al 65-75% del 1RM. Foco total en la forma: puntos de contacto, profundidad, trayectoria.', alternativas: [{ nombre: 'Sentadilla con pausa', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'ec',   nombre: 'Extensión cuádriceps',           musculo: 'Cuádriceps (aislado)', series: 4, reps: '12', tipo: 'peso', gif: G.ec, tip: 'Aislamiento. Trabaja el rango que la sentadilla no alcanza.', alternativas: [{ nombre: 'Sentadilla frontal', musculo: 'Cuádriceps' }] },
      { id: 'cf',   nombre: 'Curl femoral',                   musculo: 'Isquiotibiales',      series: 4, reps: '10', tipo: 'peso', gif: G.cf, tip: 'Segunda estimulación de isquios esta semana.', alternativas: [{ nombre: 'Curl nórdico', musculo: 'Isquiotibiales' }] },
      { id: 'cb',   nombre: 'Curl bíceps',                    musculo: 'Bíceps (cabeza larga)', series: 3, reps: '10', tipo: 'peso', gif: G.cb, tip: 'Bíceps fuertes = mejor agarre en peso muerto.', alternativas: [{ nombre: 'Curl con mancuernas', musculo: 'Bíceps' }] },
      { id: 'crp',  nombre: 'Crunch en polea',                musculo: 'Abdominales',         series: 3, reps: '15', tipo: 'peso', gif: G.crp, tip: 'Core fuerte = mayor estabilidad en todos los levantamientos.', alternativas: [{ nombre: 'Crunch en suelo', musculo: 'Abdominales' }] },
    ]
  },
  {
    id: 'viernes', nombre: 'Viernes', enfoque: 'Press Militar + Hombros + Banca Técnica', color: '#8b5cf6', bg: '#f5f3ff', emoji: '🏔️',
    cardio: 'Caminata suave 15 min. Recuperación activa para el fin de semana.',
    ejercicios: [
      { id: 'pm',   nombre: 'Press militar barra de pie (heavy)', musculo: 'Deltoides anterior', series: 5, reps: '3–5', tipo: 'peso', gif: G.pm, tip: 'Ejercicio del día. Progresión lineal. Descanso 3-4 min.', alternativas: [{ nombre: 'Press militar sentado', musculo: 'Deltoides anterior' }] },
      { id: 'pb',   nombre: 'Press banca técnica (65-75%)',       musculo: 'Pecho (fibras medias)', series: 3, reps: '3', tipo: 'peso', gif: G.pb, tip: 'Sesión técnica de banca. Practica el arco, la trayectoria y el toque.', alternativas: [{ nombre: 'Press en Smith con pausa', musculo: 'Pecho' }] },
      { id: 'el',   nombre: 'Elevaciones laterales',              musculo: 'Deltoides lateral',  series: 4, reps: '10', tipo: 'peso', gif: G.el, tip: 'Deltoides lateral = anchura. Progresión semanal.', alternativas: [{ nombre: 'Elevaciones en polea', musculo: 'Deltoides lateral' }] },
      { id: 'pp',   nombre: 'Face pull / Pájaros',                musculo: 'Deltoides posterior', series: 4, reps: '15', tipo: 'peso', gif: G.pp, tip: 'Salud del hombro. No skips nunca en fuerza.', alternativas: [{ nombre: 'Rotaciones externas banda', musculo: 'Manguito rotador' }] },
      { id: 'evp',  nombre: 'Elevación de piernas',               musculo: 'Abdomen inferior',   series: 3, reps: '15', tipo: 'reps', gif: G.evp, tip: 'Psoas fuerte = sentadilla y peso muerto más estables.', alternativas: [{ nombre: 'Elevación de rodillas colgado', musculo: 'Abdomen inferior' }] },
    ]
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Registro de plantillas: objetivo × nivel → días
// recomposicion usa las mismas que ganar (mismo split, distintas reps/tips via USER_MOD)
// ─────────────────────────────────────────────────────────────────────────────
const TEMPLATES = {
  perder_principiante:       PERDER_PRINCIPIANTE,
  perder_intermedio:         PERDER_INTERMEDIO,
  perder_avanzado:           PERDER_AVANZADO,
  ganar_principiante:        GANAR_PRINCIPIANTE,
  ganar_intermedio:          GANAR_INTERMEDIO,
  ganar_avanzado:            GANAR_AVANZADO,
  recomposicion_principiante:GANAR_PRINCIPIANTE,
  recomposicion_intermedio:  GANAR_INTERMEDIO,
  recomposicion_avanzado:    GANAR_AVANZADO,
  fuerza_principiante:       FUERZA_PRINCIPIANTE,
  fuerza_intermedio:         FUERZA_INTERMEDIO,
  fuerza_avanzado:           FUERZA_AVANZADO,
}

// Genera los días ajustados al ciclo actual y al perfil del usuario
export function getDiasCiclo(cicloId, objetivo = 'recomposicion', nivel = 'intermedio') {
  const mod = MOD[cicloId] || MOD.hiper
  const userMod = USER_MOD[objetivo]?.[nivel] || { seriesMod: 0, repsOverride: null, tipExtra: '' }
  const isDeload = cicloId === 'deload'
  const template = TEMPLATES[`${objetivo}_${nivel}`] || TEMPLATES['ganar_intermedio']
  const colorCiclo = CICLOS.find(c => c.id === cicloId)?.color

  return template.map(dia => ({
    ...dia,
    color: colorCiclo || dia.color,
    ejercicios: dia.ejercicios.map(ej => {
      const seriesMod = isDeload ? mod.seriesMod : mod.seriesMod + userMod.seriesMod
      const seriesAjustadas = Math.max(2, ej.series + seriesMod)
      let repsAjustadas
      if (isDeload) {
        repsAjustadas = ej.reps + ' (50% peso)'
      } else if (userMod.repsOverride && mod.repsMod === '' && objetivo !== 'fuerza') {
        repsAjustadas = userMod.repsOverride
      } else {
        repsAjustadas = mod.repsMod || ej.reps
      }
      const tipFinal = (!isDeload && userMod.tipExtra) ? `${ej.tip} · ${userMod.tipExtra}` : ej.tip
      return { ...ej, series: seriesAjustadas, reps: repsAjustadas, tip: tipFinal }
    })
  }))
}

// ─── Platos por objetivo (entrenamiento y descanso) ───────────────────────────
// Fuente: ISSN Position Stand (protein), RP Nutrition guidelines, NSCA
// Proteína: perder 2.2g/kg · recomp 2.0g/kg · ganar 1.9g/kg · fuerza 2.2g/kg
// Días entreno: más carbos; días descanso: sin slot post-entreno, carbos -30%

const _PLANES = {
  perder: {
    desayuno: [
      { nombre: 'Tortilla de claras + pimientos y espinacas', kcal: 250, p: 28, c: 8, g: 10, receta: '5 claras + 1 yema, pimientos y espinacas salteados. Alta proteína sin pico de insulina.' },
      { nombre: 'Yogur griego 0% + chía + arándanos', kcal: 220, p: 20, c: 18, g: 5, receta: '200g yogur griego 0%, 1 cda chía, 80g arándanos. Proteína + fibra sin carbos rápidos.' },
      { nombre: 'Avena + proteína de suero + canela', kcal: 310, p: 28, c: 32, g: 8, receta: '50g avena, 25g proteína de suero, 150ml agua, canela. Pre-entreno si se entrena en ayunas.' },
      { nombre: 'Requesón + fresas + nueces', kcal: 230, p: 22, c: 14, g: 8, receta: '200g requesón, 100g fresas, 10g nueces. Caseína natural de digestión lenta.' },
    ],
    postEntreno: [
      { nombre: 'Pechuga + arroz blanco + brócoli', kcal: 460, p: 52, c: 46, g: 6, receta: '200g pechuga a la plancha, 70g arroz cocido (sin sal), brócoli al vapor. Ventana anabólica: carbos rápidos + proteína.' },
      { nombre: 'Claras + tortitas de avena proteicas', kcal: 380, p: 42, c: 38, g: 5, receta: '200g claras pasteurizadas, 50g avena, 25g proteína, canela. Sin yemas para reducir grasas.' },
      { nombre: 'Atún al natural + boniato + ensalada', kcal: 400, p: 46, c: 38, g: 5, receta: '2 latas atún, 150g boniato cocido, lechuga, tomate, vinagre. IG moderado + proteína limpia.' },
      { nombre: 'Pollo deshebrado + quinoa + espinacas baby', kcal: 420, p: 50, c: 36, g: 6, receta: '200g pollo, 60g quinoa, espinacas baby, limón. Proteína completa + aminoácidos de quinoa.' },
    ],
    comida: [
      { nombre: 'Merluza al vapor + verduras + huevo cocido', kcal: 360, p: 50, c: 12, g: 10, receta: '220g merluza, brócoli + judías verdes, 1 huevo duro. Muy bajo calórico con proteína alta.' },
      { nombre: 'Ensalada de pollo + garbanzos + aguacate', kcal: 400, p: 46, c: 24, g: 12, receta: '200g pechuga, 80g garbanzos, 1/4 aguacate, tomate, pepino, limón.' },
      { nombre: 'Bacalao al horno + pimientos + tomate', kcal: 340, p: 44, c: 14, g: 8, receta: '220g bacalao desalado, pimientos rojos y tomate asados. Muy bajo en grasa.' },
      { nombre: 'Dorada al papillote + espárragos + patata pequeña', kcal: 370, p: 48, c: 18, g: 8, receta: '250g dorada, espárragos, 80g patata. Sin añadir grasa extra.' },
      { nombre: 'Revuelto de gambas + setas + calabacín', kcal: 310, p: 38, c: 10, g: 12, receta: '200g gambas, setas, calabacín, 2 huevos, AOVE. Proteína muy alta, carbos mínimos.' },
    ],
    merienda: [
      { nombre: 'Queso cottage + pepino + jamón york', kcal: 200, p: 24, c: 8, g: 6, receta: '150g cottage, 2 lonchas jamón york, pepino. Proteína de caseína sin carbos extra.' },
      { nombre: 'Batido proteico + hielo + cacao puro', kcal: 180, p: 30, c: 10, g: 3, receta: '30g proteína de suero, 200ml agua, hielo, 1 cda cacao puro 100%. Saciante sin calorías.' },
      { nombre: 'Atún + tostada integral + tomate', kcal: 230, p: 24, c: 20, g: 5, receta: '1 lata atún al natural, 1 tostada integral, tomate natural, orégano.' },
      { nombre: 'Yogur skyr + pepitas de calabaza', kcal: 210, p: 26, c: 12, g: 6, receta: '180g skyr, 10g pepitas de calabaza. Skyr: 11g proteína/100g vs 6g del yogur estándar.' },
    ],
    cena: [
      { nombre: 'Salmón a la plancha + ensalada verde + aguacate', kcal: 370, p: 40, c: 6, g: 18, receta: '180g salmón, lechuga variada, 1/4 aguacate, limón. Omega-3 antiinflamatorio nocturno.' },
      { nombre: 'Tortilla de claras + calabacín salteado', kcal: 270, p: 30, c: 8, g: 10, receta: '5 claras + 1 yema, calabacín, ajo, perejil. Proteína lenta (caseína del huevo) para la noche.' },
      { nombre: 'Pollo al horno + champiñones + brócoli', kcal: 300, p: 42, c: 10, g: 8, receta: '200g muslo sin piel, champiñones, brócoli, tomillo, sin salsas. Cena alta en proteína.' },
      { nombre: 'Merluza en papillote + espinacas + limón', kcal: 280, p: 44, c: 6, g: 8, receta: '220g merluza, espinacas, tomate cherry, limón. Sin aceite extra. Menos de 300 kcal.' },
      { nombre: 'Ensalada de gambas + huevo + aguacate', kcal: 320, p: 36, c: 8, g: 14, receta: '200g gambas cocidas, 2 huevos, 1/4 aguacate, lechuga. Proteína + grasas buenas sin carbos.' },
    ],
  },

  ganar: {
    desayuno: [
      { nombre: 'Avena + plátano + proteína + crema de cacahuete', kcal: 580, p: 38, c: 72, g: 14, receta: '80g avena, 1 plátano, 25g proteína, 15g crema cacahuete. Carbos complejos para energía duradera.' },
      { nombre: 'Tostadas + huevos revueltos + aguacate + zumo natural', kcal: 620, p: 30, c: 68, g: 22, receta: '3 tostadas integrales, 3 huevos, 1/2 aguacate, zumo de naranja natural. Desayuno calórico completo.' },
      { nombre: 'Pancakes proteicos + frutos rojos + miel', kcal: 550, p: 36, c: 66, g: 10, receta: '60g avena, 25g proteína, 3 claras, 1 yema, levadura. Con miel y arándanos.' },
      { nombre: 'Porridge de avena + frutos secos + plátano + leche entera', kcal: 600, p: 28, c: 76, g: 18, receta: '90g avena, 300ml leche entera, 1 plátano, 20g nueces, miel. Alta densidad energética.' },
    ],
    postEntreno: [
      { nombre: 'Pollo + arroz + boniato + brócoli', kcal: 680, p: 56, c: 78, g: 10, receta: '220g pechuga, 100g arroz, 150g boniato, brócoli. Máxima recarga de glucógeno post-entreno.' },
      { nombre: 'Ternera + pasta integral + salsa de tomate', kcal: 720, p: 58, c: 82, g: 14, receta: '200g ternera magra, 100g pasta integral, tomate natural, orégano. Proteína animal + carbos complejos.' },
      { nombre: 'Salmón + arroz jazmín + edamame', kcal: 660, p: 52, c: 68, g: 16, receta: '200g salmón, 90g arroz jazmín, 80g edamame, salsa soja light. Omega-3 + proteína completa vegetal.' },
      { nombre: 'Atún + pasta + tomate cherry + aceitunas', kcal: 640, p: 54, c: 74, g: 12, receta: '3 latas atún, 90g pasta integral, tomate cherry, aceitunas negras, AOVE.' },
    ],
    comida: [
      { nombre: 'Ternera con patata y pimientos al horno', kcal: 680, p: 54, c: 60, g: 18, receta: '220g solomillo, 200g patata, pimientos, cebolla. Densidad calórica alta con proteína animal premium.' },
      { nombre: 'Arroz con pollo al curry y leche de coco', kcal: 720, p: 52, c: 76, g: 16, receta: '200g pollo, 100g arroz, leche de coco, curry, guisantes. Carbos altos para superávit limpio.' },
      { nombre: 'Lentejas con chorizo y verduras', kcal: 650, p: 46, c: 72, g: 14, receta: '200g lentejas, 50g chorizo extra magro, zanahoria, puerro, apio.' },
      { nombre: 'Pechuga empanada + puré de boniato + ensalada', kcal: 660, p: 50, c: 64, g: 16, receta: '220g pechuga, huevo, pan rallado avena, 200g boniato, ensalada verde.' },
      { nombre: 'Salmón + quinoa + aguacate + edamame', kcal: 700, p: 52, c: 62, g: 22, receta: '200g salmón, 80g quinoa, 1/2 aguacate, 80g edamame. Máximo aporte de grasas saludables + proteína.' },
    ],
    merienda: [
      { nombre: 'Batido ganador: leche + plátano + avena + proteína', kcal: 520, p: 40, c: 72, g: 8, receta: '300ml leche entera, 1 plátano, 50g avena, 25g proteína. Líquido y fácil de tomar si cuesta llegar a calorías.' },
      { nombre: 'Tostadas + crema de cacahuete + miel', kcal: 480, p: 22, c: 58, g: 18, receta: '3 tostadas integrales, 25g crema cacahuete, miel. Alta densidad calórica sin sentirte lleno.' },
      { nombre: 'Yogur griego + granola + plátano + nueces', kcal: 450, p: 22, c: 56, g: 14, receta: '200g yogur griego, 40g granola, 1/2 plátano, 15g nueces. Proteína + carbos rápidos y lentos.' },
      { nombre: 'Arroz con leche proteico', kcal: 460, p: 28, c: 64, g: 8, receta: '70g arroz, 400ml leche semidesnatada, 20g proteína, canela, edulcorante. Clásico adaptado.' },
    ],
    cena: [
      { nombre: 'Salmón + boniato + espárragos', kcal: 560, p: 48, c: 48, g: 16, receta: '200g salmón, 200g boniato, espárragos, limón, AOVE.' },
      { nombre: 'Pollo al horno + arroz basmati + ensalada', kcal: 580, p: 52, c: 54, g: 12, receta: '220g pechuga, 80g arroz basmati, ensalada verde con AOVE.' },
      { nombre: 'Tortilla de 4 huevos + patata + cebolla', kcal: 540, p: 36, c: 46, g: 20, receta: '4 huevos, 200g patata, cebolla caramelizada, AOVE. Clásica pero calórica.' },
      { nombre: 'Pechuga rebozada en avena + puré de boniato', kcal: 560, p: 50, c: 52, g: 14, receta: '220g pechuga, huevo, avena en copos (no harina), 200g boniato.' },
      { nombre: 'Bacalao al horno + patata + pimiento rojo', kcal: 520, p: 52, c: 44, g: 10, receta: '250g bacalao, 150g patata, pimiento rojo asado, AOVE, ajo.' },
    ],
  },

  recomposicion: {
    desayuno: [
      { nombre: 'Avena + claras + arándanos + canela', kcal: 380, p: 30, c: 48, g: 6, receta: '60g avena, 150g claras pasteurizadas, 80g arándanos, canela. Carbos complejos + proteína para el día.' },
      { nombre: 'Tostadas + huevos revueltos + tomate natural', kcal: 400, p: 26, c: 44, g: 12, receta: '2 tostadas integrales, 3 huevos, tomate natural, orégano, AOVE.' },
      { nombre: 'Batido: avena + plátano + proteína + leche vegetal', kcal: 420, p: 32, c: 52, g: 6, receta: '50g avena, 1/2 plátano, 25g proteína, 200ml leche vegetal no azucarada.' },
      { nombre: 'Bowl de quark + muesli + fruta + semillas', kcal: 390, p: 28, c: 46, g: 10, receta: '200g quark (alto en proteína), 35g muesli sin azúcar, fruta de temporada, semillas de lino.' },
    ],
    postEntreno: [
      { nombre: 'Pollo + arroz basmati + brócoli', kcal: 520, p: 52, c: 58, g: 8, receta: '200g pechuga a la plancha, 80g arroz basmati, brócoli al vapor. El clásico más fiable post-entreno.' },
      { nombre: 'Salmón + boniato + ensalada verde', kcal: 540, p: 46, c: 50, g: 14, receta: '180g salmón al horno, 180g boniato, lechuga, tomate, limón.' },
      { nombre: 'Ternera + pasta integral + tomate natural', kcal: 580, p: 50, c: 58, g: 12, receta: '180g ternera, 80g pasta integral, tomate natural, albahaca, AOVE.' },
      { nombre: 'Claras + tortitas de avena + 1/2 plátano', kcal: 460, p: 40, c: 52, g: 6, receta: '200g claras, 60g avena, 1/2 plátano, canela. Rápido de preparar y muy completo.' },
    ],
    comida: [
      { nombre: 'Merluza al vapor + quinoa + pimientos salteados', kcal: 480, p: 48, c: 50, g: 9, receta: '200g merluza, 70g quinoa, pimientos y cebolla salteados, AOVE.' },
      { nombre: 'Pechuga al horno + garbanzos + pimientos asados', kcal: 510, p: 50, c: 46, g: 10, receta: '200g pechuga, 150g garbanzos, pimientos rojos asados, ajo.' },
      { nombre: 'Atún al natural + arroz + aguacate', kcal: 490, p: 46, c: 48, g: 13, receta: '2 latas atún, 70g arroz, 1/2 aguacate, limón, sal.' },
      { nombre: 'Lentejas + pollo + espinacas salteadas', kcal: 500, p: 48, c: 52, g: 8, receta: '150g lentejas cocidas, 150g pechuga a tiras, espinacas, ajo.' },
      { nombre: 'Bacalao al horno + patata pequeña + verduras', kcal: 470, p: 50, c: 44, g: 8, receta: '220g bacalao, 120g patata, pimiento rojo, AOVE, ajo, perejil.' },
    ],
    merienda: [
      { nombre: 'Yogur griego 0% + frutos rojos + nueces', kcal: 300, p: 22, c: 26, g: 12, receta: '200g yogur griego, 80g arándanos, 15g nueces. Proteína + grasas saludables + antioxidantes.' },
      { nombre: 'Batido proteico + 1/2 plátano', kcal: 320, p: 32, c: 38, g: 5, receta: '30g proteína, 250ml leche semidesnatada, 1/2 plátano. Merienda completa en 5 minutos.' },
      { nombre: 'Queso cottage + manzana + almendras', kcal: 290, p: 26, c: 22, g: 10, receta: '200g cottage, 1 manzana en dados, 15g almendras. Proteína lenta (caseína) para evitar catabolismo.' },
      { nombre: 'Tostadas + aguacate + atún al natural', kcal: 310, p: 26, c: 28, g: 12, receta: '2 tostadas integrales, 1/4 aguacate, 1 lata atún, limón, sal, pimienta.' },
    ],
    cena: [
      { nombre: 'Tortilla de 3 huevos + ensalada mixta', kcal: 360, p: 32, c: 10, g: 18, receta: '3 huevos, cebolla, pimiento, ensalada con AOVE y vinagre. Sin carbos por la noche.' },
      { nombre: 'Salmón a la plancha + espárragos + limón', kcal: 390, p: 40, c: 6, g: 16, receta: '180g salmón, espárragos a la plancha, limón. Omega-3 + proteína nocturna sin carbos.' },
      { nombre: 'Pollo al horno + calabacín + tomate cherry', kcal: 340, p: 42, c: 12, g: 10, receta: '200g pechuga, calabacín, tomate cherry, tomillo, AOVE.' },
      { nombre: 'Merluza al vapor + brócoli + huevo cocido', kcal: 320, p: 44, c: 8, g: 10, receta: '200g merluza, brócoli al vapor, 1 huevo, AOVE, limón.' },
      { nombre: 'Gambas a la plancha + ensalada + hummus', kcal: 350, p: 36, c: 14, g: 12, receta: '200g gambas, lechugas variadas, 50g hummus, limón, AOVE.' },
    ],
  },

  fuerza: {
    desayuno: [
      { nombre: 'Avena + huevos completos + plátano + leche entera', kcal: 520, p: 36, c: 64, g: 12, receta: '80g avena, 3 huevos, 1 plátano, 200ml leche. Energía sostenida para entrenos pesados.' },
      { nombre: 'Tostadas + huevos + mantequilla de cacahuete', kcal: 560, p: 32, c: 62, g: 18, receta: '3 tostadas integrales, 3 huevos, 20g crema cacahuete, zumo naranja natural.' },
      { nombre: 'Porridge proteico + nueces + miel', kcal: 480, p: 34, c: 58, g: 12, receta: '70g avena, 25g proteína de suero, 15g nueces, miel, leche entera. Glucógeno para grandes cargas.' },
      { nombre: 'Bowl de huevos + quinoa + espinacas + aguacate', kcal: 500, p: 34, c: 44, g: 18, receta: '3 huevos pochados, 60g quinoa, espinacas salteadas, 1/4 aguacate. Hierro + proteína completa.' },
    ],
    postEntreno: [
      { nombre: 'Ternera + arroz + patata cocida', kcal: 700, p: 60, c: 72, g: 14, receta: '220g solomillo/redondo, 90g arroz, 150g patata. Máxima síntesis proteica + recarga glucógeno.' },
      { nombre: 'Pollo + pasta integral + tomate + queso parmesano', kcal: 660, p: 56, c: 68, g: 14, receta: '200g pechuga, 100g pasta, tomate natural, 30g parmesano rallado.' },
      { nombre: 'Salmón + arroz jazmín + aguacate', kcal: 680, p: 52, c: 66, g: 18, receta: '200g salmón, 90g arroz, 1/4 aguacate, edamame, salsa soja.' },
      { nombre: 'Batido de recuperación: leche + avena + plátano + proteína', kcal: 600, p: 50, c: 70, g: 10, receta: '40g proteína, 1 plátano, 50g avena, 300ml leche. Bebible en el vestuario.' },
    ],
    comida: [
      { nombre: 'Ternera + lentejas + ensalada', kcal: 680, p: 60, c: 66, g: 14, receta: '220g solomillo, 180g lentejas cocidas, lechuga, tomate. Hierro + creatina natural de la carne.' },
      { nombre: 'Dorada al horno + arroz + verduras salteadas', kcal: 620, p: 54, c: 60, g: 12, receta: '250g dorada, 80g arroz, pimientos, champiñones, ajo, AOVE.' },
      { nombre: 'Pechuga + garbanzos + espinacas con ajo', kcal: 600, p: 58, c: 54, g: 10, receta: '220g pechuga, 150g garbanzos, espinacas, ajo, limón, comino.' },
      { nombre: 'Salmón + patata + brócoli con AOVE', kcal: 640, p: 52, c: 58, g: 16, receta: '200g salmón, 200g patata, brócoli, limón, AOVE. Fuerza: calorías + omega-3 antiinflamatorio.' },
      { nombre: 'Cerdo ibérico + quinoa + pimientos asados', kcal: 660, p: 54, c: 58, g: 16, receta: '220g lomo ibérico, 80g quinoa, pimientos rojos asados. Creatina natural en carne de cerdo.' },
    ],
    merienda: [
      { nombre: 'Batido proteico + avena + frutos secos', kcal: 420, p: 36, c: 42, g: 12, receta: '30g proteína, 20g nueces, 30g avena en copos, 250ml leche. Proteína entre comidas.' },
      { nombre: 'Tupper de pollo + arroz', kcal: 380, p: 40, c: 36, g: 6, receta: 'Sobrante de batch cooking: 150g pollo, 50g arroz. La merienda más práctica.' },
      { nombre: 'Yogur griego + granola proteica + miel', kcal: 360, p: 24, c: 44, g: 10, receta: '200g yogur griego, 35g granola alta proteína, miel. Sencillo y efectivo.' },
      { nombre: 'Pan de centeno + atún + aguacate', kcal: 380, p: 28, c: 36, g: 12, receta: '2 rebanadas pan centeno, 1 lata atún, 1/4 aguacate, pepino.' },
    ],
    cena: [
      { nombre: 'Pollo al horno + boniato + ensalada verde', kcal: 500, p: 50, c: 44, g: 10, receta: '220g pechuga, 200g boniato, ensalada verde, AOVE. Recuperación muscular nocturna.' },
      { nombre: 'Huevos + salmón ahumado + aguacate', kcal: 460, p: 40, c: 8, g: 22, receta: '3 huevos al plato, 80g salmón ahumado, 1/4 aguacate, limón, eneldo.' },
      { nombre: 'Ternera a la plancha + espárragos + champiñones', kcal: 440, p: 50, c: 6, g: 16, receta: '200g solomillo/redondo, espárragos, champiñones, sal, pimienta, AOVE.' },
      { nombre: 'Merluza al horno + quinoa + brócoli', kcal: 420, p: 48, c: 34, g: 8, receta: '220g merluza, 60g quinoa cocida, brócoli al vapor, limón.' },
      { nombre: 'Tortilla de 4 huevos + espinacas + queso feta', kcal: 480, p: 38, c: 6, g: 28, receta: '4 huevos, espinacas baby, 40g queso feta. Proteína + grasas nocturnas. Sin carbos.' },
    ],
  },
}

export function getPlatosByObjetivo(objetivo = 'recomposicion', esDiaEntreno = true) {
  const plan = _PLANES[objetivo] || _PLANES.recomposicion
  if (esDiaEntreno) return plan
  // Día de descanso: sin post-entreno, desayuno más ligero, sin slot de entreno
  const { postEntreno: _skip, ...resto } = plan
  return resto
}

// Retrocompatibilidad con cualquier referencia antigua a PLATOS
export const PLATOS = _PLANES.recomposicion

export const PLATOS_PREPARADOS = [
  // ── Mercadona ─────────────────────────────────────────────────────────────────
  { servicio: 'Mercadona', nombre: 'Pollo asado con verduras', kcal: 280, p: 32, c: 8, g: 12, precio: '~3.50€', nota: 'Bandeja lista para calentar. Alta proteína, bajo carbo.' },
  { servicio: 'Mercadona', nombre: 'Poke de salmón y arroz', kcal: 420, p: 28, c: 46, g: 12, precio: '~4.50€', nota: 'Rico en omega-3. Comer frío o templado.' },
  { servicio: 'Mercadona', nombre: 'Garbanzos a la jardinera', kcal: 300, p: 14, c: 38, g: 8, precio: '~1.80€', nota: 'Alta fibra, legumbre completa. Añade proteína extra si es post-entreno.' },
  { servicio: 'Mercadona', nombre: 'Merluza en salsa verde', kcal: 240, p: 26, c: 6, g: 10, precio: '~3.80€', nota: 'Muy bajo en calorías. Ideal para déficit con proteína alta de pescado.' },
  { servicio: 'Mercadona', nombre: 'Lentejas estofadas', kcal: 260, p: 12, c: 34, g: 6, precio: '~1.60€', nota: 'Alta fibra y hierro. Combinada con pollo = plato completo.' },
  { servicio: 'Mercadona', nombre: 'Alubias blancas con verduras', kcal: 290, p: 16, c: 40, g: 6, precio: '~1.80€', nota: 'Legumbre completa. Proteína vegetal + carbos de absorción lenta.' },
  { servicio: 'Mercadona', nombre: 'Pechuga de pollo a la plancha (pack 500g)', kcal: 165, p: 34, c: 0, g: 3, precio: '~4.50€/pack', nota: 'Proteína pura lista. 34g proteína por 100g. Combina con arroz o boniato.' },
  { servicio: 'Mercadona', nombre: 'Ensalada de quinoa con pollo y verduras', kcal: 340, p: 24, c: 36, g: 10, precio: '~3.90€', nota: 'Sin preparar. Proteína + carbos complejos de quinoa. Ideal comida de trabajo.' },
  { servicio: 'Mercadona', nombre: 'Bacalao con tomate y pimientos', kcal: 220, p: 28, c: 12, g: 6, precio: '~3.20€', nota: 'Bajo calórico. 28g proteína de pescado blanco. Perfecto en déficit.' },
  { servicio: 'Mercadona', nombre: 'Revuelto de setas y espárragos', kcal: 210, p: 12, c: 8, g: 14, precio: '~2.80€', nota: 'Bajo en carbos. Añadir lata de atún para completar la proteína.' },
  { servicio: 'Mercadona', nombre: 'Tortilla de patata (bandeja)', kcal: 320, p: 14, c: 28, g: 16, precio: '~2.50€', nota: 'Versátil. Mejor en volumen. En déficit: media ración + ensalada.' },
  { servicio: 'Mercadona', nombre: 'Gazpacho andaluz (brick 1L)', kcal: 80, p: 2, c: 12, g: 3, precio: '~1.40€', nota: 'Hidratante y muy bajo en calorías. Ideal como primer plato o snack.' },
  { servicio: 'Mercadona', nombre: 'Crema de calabacín y zanahoria', kcal: 120, p: 4, c: 18, g: 4, precio: '~1.80€', nota: 'Micronutrientes con muy pocas calorías. Primer plato en déficit.' },
  { servicio: 'Mercadona', nombre: 'Hamburguesas de pavo (pack 4)', kcal: 140, p: 22, c: 4, g: 4, precio: '~3.20€/pack', nota: '22g proteína por unidad. Muy baja en grasa. Plancha 3 min por lado.' },
  { servicio: 'Mercadona', nombre: 'Salmón marinado (sobre 100g)', kcal: 180, p: 22, c: 1, g: 10, precio: '~3.50€', nota: 'Omega-3 sin cocinar. Ideal en tostadas, ensaladas o con aguacate.' },
  { servicio: 'Mercadona', nombre: 'Muslos de pollo al horno (bandeja)', kcal: 240, p: 28, c: 0, g: 14, precio: '~3.80€', nota: 'Más grasa que la pechuga pero más sabroso. Bien en volumen.' },
  { servicio: 'Mercadona', nombre: 'Atún claro al natural (pack 3 latas)', kcal: 120, p: 28, c: 0, g: 1, precio: '~2.50€', nota: 'La proteína más barata y práctica. 28g proteína sin grasas.' },
  { servicio: 'Mercadona', nombre: 'Edamame al vapor (bolsa 400g)', kcal: 140, p: 12, c: 10, g: 6, precio: '~2.20€', nota: 'Proteína vegetal completa. Snack o guarnición rica en fibra.' },
  { servicio: 'Mercadona', nombre: 'Skyr natural Hacendado 0%', kcal: 65, p: 11, c: 4, g: 0, precio: '~1.20€/400g', nota: '11g proteína/100g. El lácteo más proteico del super. Merienda o desayuno.' },
  { servicio: 'Mercadona', nombre: 'Queso cottage Hacendado', kcal: 90, p: 12, c: 4, g: 3, precio: '~1.60€/250g', nota: 'Proteína + caseína de digestión lenta. Ideal para la noche o merienda.' },

  // ── Lidl ──────────────────────────────────────────────────────────────────────
  { servicio: 'Lidl', nombre: 'Pollo al horno con patatas (Deluxe)', kcal: 350, p: 30, c: 28, g: 12, precio: '~3.99€', nota: 'Opción completa sin preparación. Buen ratio precio/proteína.' },
  { servicio: 'Lidl', nombre: 'Filete de bacalao congelado (bolsa)', kcal: 95, p: 22, c: 0, g: 1, precio: '~5.99€/kg', nota: 'Proteína blanca muy económica. Descongelar en nevera la noche antes.' },
  { servicio: 'Lidl', nombre: 'Ensalada fitness de pollo y quinoa', kcal: 300, p: 22, c: 32, g: 8, precio: '~3.50€', nota: 'Lista para comer. Proteína + carbos complejos sin cocinar.' },
  { servicio: 'Lidl', nombre: 'Burger de ternera 5% grasa (pack 4)', kcal: 180, p: 26, c: 2, g: 8, precio: '~3.50€', nota: '26g proteína, muy baja en grasa. De lo mejor del súper en calidad/precio.' },
  { servicio: 'Lidl', nombre: 'Yogur griego Milbona natural (pack 4)', kcal: 130, p: 11, c: 8, g: 6, precio: '~2.29€', nota: '125g por ración. Merienda o desayuno. Añadir proteína de suero para completar.' },
  { servicio: 'Lidl', nombre: 'Salmón noruego fresco (lomo)', kcal: 200, p: 24, c: 0, g: 12, precio: '~12€/kg', nota: 'Mejor salmón precio/calidad. 24g proteína + omega-3. Plancha 4 min.' },
  { servicio: 'Lidl', nombre: 'Mix de legumbres cocidas (bote)', kcal: 240, p: 14, c: 34, g: 4, precio: '~1.50€', nota: 'Garbanzos + lentejas + judías. Alta fibra. Añadir proteína animal.' },

  // ── Carrefour ─────────────────────────────────────────────────────────────────
  { servicio: 'Carrefour', nombre: 'Bowl tikka masala de pollo y arroz', kcal: 420, p: 36, c: 44, g: 10, precio: '~4.20€', nota: 'Sabor india. 36g proteína. Calentar 3 min en microondas.' },
  { servicio: 'Carrefour', nombre: 'Salmón a la plancha con quinoa y verduras', kcal: 480, p: 40, c: 38, g: 14, precio: '~5.50€', nota: 'Omega-3 + proteína completa vegetal. Muy equilibrado.' },
  { servicio: 'Carrefour', nombre: 'Pollo asado entero (charcutería)', kcal: 220, p: 30, c: 0, g: 11, precio: '~6.50€/ud', nota: 'Rinde 3-4 tomas. Proteína pura muy económica por ración.' },
  { servicio: 'Carrefour', nombre: 'Ensalada César con pollo asado', kcal: 360, p: 28, c: 18, g: 18, precio: '~3.80€', nota: 'Lista para comer. Controla el aliño: aplicar la mitad para reducir calorías.' },

  // ── Wetaca ────────────────────────────────────────────────────────────────────
  { servicio: 'Wetaca', nombre: 'Pollo con batata y brócoli', kcal: 490, p: 42, c: 44, g: 12, precio: '~6.90€', nota: 'El más pedido. Macro equilibrado. Ideal post-entreno cualquier objetivo.' },
  { servicio: 'Wetaca', nombre: 'Salmón con quinoa y espinacas', kcal: 520, p: 40, c: 38, g: 18, precio: '~7.50€', nota: 'Rico en omega-3 y hierro. Antiinflamatorio natural.' },
  { servicio: 'Wetaca', nombre: 'Ternera con arroz integral y judías verdes', kcal: 560, p: 46, c: 50, g: 14, precio: '~7.20€', nota: 'Alta proteína animal. Para ciclos de volumen o fuerza.' },
  { servicio: 'Wetaca', nombre: 'Bacalao al pil-pil con patata', kcal: 440, p: 44, c: 36, g: 12, precio: '~7.80€', nota: 'Receta tradicional. Proteína de calidad de pescado blanco.' },
  { servicio: 'Wetaca', nombre: 'Lentejas con pollo y verduras', kcal: 480, p: 44, c: 48, g: 8, precio: '~6.80€', nota: 'Hierro + proteína completa. Ideal días de descanso.' },
  { servicio: 'Wetaca', nombre: 'Merluza al horno con pisto', kcal: 380, p: 42, c: 22, g: 10, precio: '~7.20€', nota: 'Bajo calórico (380 kcal), proteína muy alta. Perfecto en déficit.' },
  { servicio: 'Wetaca', nombre: 'Pollo al curry con cúrcuma y arroz basmati', kcal: 540, p: 44, c: 54, g: 12, precio: '~6.90€', nota: 'Cúrcuma antiinflamatoria. Completo post-entreno.' },
  { servicio: 'Wetaca', nombre: 'Cerdo agridulce con arroz jazmín', kcal: 520, p: 38, c: 56, g: 12, precio: '~6.50€', nota: 'Variedad. Buena proporción de macros. Más carbos para volumen.' },
  { servicio: 'Wetaca', nombre: 'Bowl de atún + arroz + edamame + alga wakame', kcal: 460, p: 42, c: 46, g: 8, precio: '~7.00€', nota: 'Inspiración japonesa. Bajo en grasa, alto en proteína y yodo.' },
  { servicio: 'Wetaca', nombre: 'Pechuga rellena de espinacas y queso fresco', kcal: 420, p: 50, c: 10, g: 16, precio: '~7.50€', nota: 'Proteína muy alta (50g). Bajo en carbos. Ideal para cena o déficit.' },

  // ── Knoweats ──────────────────────────────────────────────────────────────────
  { servicio: 'Knoweats', nombre: 'Pollo tikka masala + arroz basmati', kcal: 510, p: 45, c: 48, g: 11, precio: '~7.80€', nota: 'Diseñado para deportistas. 45g proteína verificada.' },
  { servicio: 'Knoweats', nombre: 'Bowl de salmón teriyaki + edamame + arroz', kcal: 540, p: 42, c: 50, g: 14, precio: '~8.50€', nota: 'Omega-3 + proteína vegetal de edamame. 42g proteína total.' },
  { servicio: 'Knoweats', nombre: 'Pasta boloñesa de ternera 100% magra', kcal: 580, p: 48, c: 60, g: 14, precio: '~7.50€', nota: 'Sin rellenos. 48g proteína animal. Para ciclos de volumen o fuerza.' },
  { servicio: 'Knoweats', nombre: 'Curry de pollo con garbanzos y espinacas', kcal: 490, p: 44, c: 46, g: 10, precio: '~7.80€', nota: 'Proteína animal + vegetal combinadas. Rico en hierro y fibra.' },
  { servicio: 'Knoweats', nombre: 'Ternera con patata y romero al horno', kcal: 560, p: 50, c: 46, g: 14, precio: '~8.20€', nota: '50g proteína. Creatina natural de carne. Ideal fuerza o volumen.' },
  { servicio: 'Knoweats', nombre: 'Merluza al vapor + quinoa + brócoli', kcal: 400, p: 46, c: 34, g: 8, precio: '~8.00€', nota: 'Proteína alta de pescado blanco. Muy bajo en grasa. Déficit perfecto.' },

  // ── Batch cooking casero ───────────────────────────────────────────────────────
  { servicio: 'Casero/Batch', nombre: 'Meal prep: pollo + arroz × 5 raciones', kcal: 530, p: 50, c: 55, g: 10, precio: '~2.50€/ud', nota: '1kg pechuga + 500g arroz en 30 min. 5 tupper lista. Más barato del mercado.' },
  { servicio: 'Casero/Batch', nombre: 'Meal prep: atún + pasta integral × 4 raciones', kcal: 480, p: 44, c: 52, g: 8, precio: '~2.00€/ud', nota: '4 latas atún + 400g pasta + tomate natural. Sin cocinar casi nada.' },
  { servicio: 'Casero/Batch', nombre: 'Meal prep: salmón + boniato × 4 raciones', kcal: 520, p: 44, c: 48, g: 14, precio: '~3.50€/ud', nota: '700g salmón + 1kg boniato al horno. 45 min de horno, semana entera lista.' },
  { servicio: 'Casero/Batch', nombre: 'Meal prep: lentejas guisadas × 6 raciones', kcal: 320, p: 20, c: 46, g: 5, precio: '~0.80€/ud', nota: '500g lentejas + verduras. Proteína vegetal más barata. Congela 4 raciones.' },
  { servicio: 'Casero/Batch', nombre: 'Meal prep: tortillas de claras × 5 raciones', kcal: 220, p: 28, c: 4, g: 8, precio: '~1.20€/ud', nota: 'Bote claras Mercadona (500g) + verduras variadas. Cena rápida en déficit.' },
  { servicio: 'Casero/Batch', nombre: 'Meal prep: bowl pollo + quinoa + verduras × 4', kcal: 490, p: 46, c: 44, g: 10, precio: '~3.20€/ud', nota: '800g pollo + 400g quinoa + verduras asadas. Domingo cooking, semana lista.' },
]

export const MUSCULO_MAP = {
  'Pecho': ['pecho', 'chest'],
  'Espalda': ['espalda', 'dorsal', 'trapecio', 'back', 'lumbar', 'lats'],
  'Hombros': ['hombro', 'deltoides', 'shoulder'],
  'Bíceps': ['bíceps', 'biceps', 'braquial'],
  'Tríceps': ['tríceps', 'triceps'],
  'Pierna': ['cuádriceps', 'cuadriceps', 'isquio', 'gemelo', 'glúteo', 'gluteo', 'pierna', 'thigh', 'calf', 'leg', 'cadera'],
  'Abdominales': ['core', 'abdomen', 'abdominal', 'oblicuo', 'waist'],
  'Cardio': ['full body', 'cardio'],
}

export function matchMusculo(ejMusculo) {
  const m = (ejMusculo || '').toLowerCase()
  for (const [fitcronGrupo, keywords] of Object.entries(MUSCULO_MAP)) {
    if (keywords.some(k => m.includes(k))) return fitcronGrupo
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// ADAPTACIÓN POR PERFIL FÍSICO (edad, IMC, sexo)
//
// Fuentes aplicadas:
//   · ACSM Guidelines for Exercise Testing & Prescription, 11ª ed. (2022)
//   · ACE Personal Trainer Manual, 5ª ed. — capítulos senior fitness
//   · RP Strength: "Training the Older Lifter" — Israetel & Hoffmann
//   · NSCA Essentials of Strength Training, 4ª ed. — Ch. 20 (Special Pops)
//   · NIH PMC8878739 — Sarcopenia prevention exercise guidelines 60+
//   · Obesity & Exercise: ACSM Position Stand (2009, actualizado 2021)
//
// Reglas clave implementadas:
//   50+  → sustituir barbell compounds por mancuernas/máquina (↓ carga axial)
//   60+  → ejercicios de equilibrio, RIR≥3, sin fallo absoluto
//   70+  → 60-70% FCmax, carga 50-60% 1RM, control sobre intensidad
//   IMC≥30 → sin saltos ni HIIT de alto impacto, cardio de bajo impacto
//   IMC≥35 → cardio sentado (bici, remo), ejercicios apoyados preferidos
// ─────────────────────────────────────────────────────────────────────────────

// Ejercicios sustitutos seguros por zona de edad/IMC
// Criterio: misma cadena muscular, menor compresión espinal y estrés articular
const EJ_SUSTITUTOS = {
  // Sentadilla barra → Prensa 45° (elimina carga axial espinal)
  sq: {
    id: 'pr', nombre: 'Prensa 45°', musculo: 'Cuádriceps, glúteos',
    tipo: 'peso', gif: G.pr,
    tip: 'Alternativa segura a la sentadilla con barra: sin carga axial en la columna. Pies en ancho de hombros. No bloquees rodillas en la extensión.',
    alternativas: [{ nombre: 'Sentadilla goblet con kettlebell', musculo: 'Cuádriceps/Glúteos' }],
  },
  // Press banca barra → Press mancuernas (rango libre, menor estrés glenohumeral)
  pb: {
    id: 'pman', nombre: 'Press mancuernas banco plano', musculo: 'Pecho (fibras medias)',
    tipo: 'peso', gif: G.pman,
    tip: 'Las mancuernas permiten un arco articular más natural que la barra, reduciendo el estrés en el hombro y la muñeca.',
    alternativas: [{ nombre: 'Press en máquina de pecho', musculo: 'Pecho' }],
  },
  // Remo barra → Remo polea sentado (elimina carga lumbar estática)
  rb: {
    id: 'rs', nombre: 'Remo sentado en polea', musculo: 'Espalda media',
    tipo: 'peso', gif: G.rs,
    tip: 'Sin carga axial en la columna lumbar. Espalda erguida, pecho al frente, codos pegados al cuerpo. Tira al ombligo.',
    alternativas: [{ nombre: 'Remo mancuerna unilateral apoyado', musculo: 'Espalda media' }],
  },
  // Press militar barra de pie → Press mancuernas sentado (elimina riesgo de equilibrio)
  pm: {
    id: 'pm', nombre: 'Press mancuernas sentado', musculo: 'Deltoides anterior',
    tipo: 'peso', gif: G.pm,
    tip: 'Realiza el press SENTADO en banco con respaldo. Reduce el riesgo de caída y la carga lumbar en comparación con el press de pie.',
    alternativas: [{ nombre: 'Press en máquina de hombros', musculo: 'Deltoides anterior' }],
  },
}

function getZonaEdad(edad) {
  const e = Number(edad) || 0
  if (!e) return null
  if (e < 40) return 'joven'         // Sin restricciones por edad
  if (e < 50) return 'adulto'        // Leve énfasis en recuperación
  if (e < 60) return 'maduro'        // Sustituir barbell → mancuerna/máquina
  if (e < 70) return 'senior'        // Bajo impacto, RPE controlado, equilibrio
  return 'senior_plus'               // Funcional, ligero, impacto mínimo
}

function getZonaBmi(pesoKg, alturaCm) {
  const p = Number(pesoKg) || 0
  const h = Number(alturaCm) || 0
  if (!p || !h) return null
  const bmi = p / ((h / 100) ** 2)
  if (bmi < 25)   return 'normal'
  if (bmi < 30)   return 'sobrepeso'
  if (bmi < 35)   return 'obeso1'
  return 'obeso2'
}

function adaptarCardio(cardio, zonaEdad, zonaBmi) {
  if (!cardio) return cardio
  let c = cardio
  const altaRestriccion = ['senior', 'senior_plus'].includes(zonaEdad) || zonaBmi === 'obeso2'
  const moderadaRestriccion = zonaEdad === 'maduro' || zonaBmi === 'obeso1'

  if (altaRestriccion) {
    // ACSM: 60+ y obesos mórbidos → cardio de baja intensidad, zona 2 estricta
    c = c.replace(/HIIT[^.–)·\n]*/gi, 'Cardio suave (HIIT no recomendado para tu perfil físico)')
    c = c.replace(/\b(sprint|sprints)\b/gi, 'caminata rápida')
    c = c.replace(/\d+%\s*FCmax/gi, '60-70% FCmax')
    c = c.replace(/×\s*\d+\s*rondas/gi, '')
  } else if (moderadaRestriccion) {
    // ACSM: 50+ y sobrepeso → limitar picos de FCmax
    c = c.replace(/\b(85|90|95)%\s*FCmax/gi, '75-80% FCmax')
    c = c.replace(/\bsprint\b/gi, 'trote moderado')
  }
  return c
}

// ── Calcula el perfil físico del usuario ──────────────────────────────────────
export function calcularPerfilFisico(datosUsuario = {}) {
  const { edad, pesoActual, altura, sexo } = datosUsuario
  const e = Number(edad) || 0
  const p = Number(pesoActual) || 0
  const h = Number(altura) || 0
  const bmi = (p && h) ? +(p / ((h / 100) ** 2)).toFixed(1) : null
  const zonaEdad = getZonaEdad(e)
  const zonaBmi  = getZonaBmi(p, h)
  const tieneDatos = !!(e && p && h)

  return { zonaEdad, zonaBmi, bmi, edad: e, pesoKg: p, alturaCm: h, sexo, tieneDatos }
}

// ── Adapta la rutina a los datos físicos del usuario ─────────────────────────
// Devuelve los días modificados con:
//   · Ejercicios de alto riesgo sustituidos por alternativas más seguras
//   · Cardio ajustado a la FCmax segura para la edad/IMC
//   · Tips enriquecidos con pautas específicas de la zona
export function adaptarDiasAlPerfil(dias, datosUsuario = {}) {
  const perfil = calcularPerfilFisico(datosUsuario)
  const { zonaEdad, zonaBmi, tieneDatos } = perfil

  if (!tieneDatos) return dias  // Sin datos físicos no se adapta

  const esMaduro    = ['maduro', 'senior', 'senior_plus'].includes(zonaEdad)
  const esSenior    = ['senior', 'senior_plus'].includes(zonaEdad)
  const esSeniorPlus = zonaEdad === 'senior_plus'
  const altoPeso    = ['obeso1', 'obeso2'].includes(zonaBmi)
  const debesSustituir = esMaduro || altoPeso

  return dias.map(dia => ({
    ...dia,
    cardio: adaptarCardio(dia.cardio, zonaEdad, zonaBmi),
    _perfil: { zonaEdad, zonaBmi },
    ejercicios: dia.ejercicios.map(ej => {
      // 1. Sustituir ejercicios de alta carga axial/articular cuando procede
      if (debesSustituir && EJ_SUSTITUTOS[ej.id]) {
        const sust = EJ_SUSTITUTOS[ej.id]
        return {
          ...sust,
          series: ej.series,
          reps: ej.reps,
          _sustituido: ej.nombre,  // para mostrar badge en UI
        }
      }

      // 2. Enriquecer el tip con pautas de la zona de edad
      let tipExtra = ''
      if (esSeniorPlus) {
        tipExtra = ' · 70+: usa el 50-60% de tu carga máxima. Prioriza control total. Descansa 2 min entre series.'
      } else if (esSenior) {
        tipExtra = ' · 60+: RIR≥3 (nunca al fallo). Descanso 90-120 s. Calentamiento articular de 10 min previo.'
      } else if (esMaduro) {
        tipExtra = ' · 50+: calienta 8-10 min antes de cargar. RIR≥2. Si hay dolor articular, usa alternativas.'
      } else if (altoPeso) {
        tipExtra = ' · IMC elevado: prioriza la técnica sobre la carga. Descansa 90 s entre series.'
      }

      return tipExtra ? { ...ej, tip: ej.tip + tipExtra } : ej
    }),
  }))
}

export const AVATARS = ['💪', '🏃', '🧘', '🏋️', '⚡', '🦁', '🔥', '🌟']
