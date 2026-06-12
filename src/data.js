// tipo: 'peso' = kg por serie | 'tiempo' = segundos | 'reps' = solo repeticiones | 'peso_reps' = peso opcional (ej. fondos lastrados)

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
  bur:  `${FC}/2021/03/11601301-Burpee_Cardio_720.gif`,
  planv:`${FC}/2021/04/04631301-Front-Plank_waist-FIX_720.gif`,
}

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

// ── Ajustes por objetivo × nivel ──────────────────────────────────────────────
const USER_MOD = {
  perder: {
    principiante: { seriesMod: -1, repsOverride: '12–15', tipExtra: 'Descanso corto 45-60s para quemar más calorías.' },
    intermedio:   { seriesMod: 0,  repsOverride: '12–15', tipExtra: 'Supersets o descanso de 60s para mantener ritmo cardíaco alto.' },
    avanzado:     { seriesMod: 0,  repsOverride: '12–15', tipExtra: 'Drop sets y tempo 3-0-1 para máxima densidad metabólica.' },
  },
  ganar: {
    principiante: { seriesMod: -1, repsOverride: '8–12',  tipExtra: 'Progresión doble: cuando completes todas las reps, sube el peso.' },
    intermedio:   { seriesMod: 0,  repsOverride: '8–12',  tipExtra: 'RIR 2-3. Último set hasta el fallo técnico.' },
    avanzado:     { seriesMod: +1, repsOverride: '6–10',  tipExtra: 'RIR 1. Añade técnicas de intensidad: rest-pause o myo-reps.' },
  },
  fuerza: {
    principiante: { seriesMod: 0,  repsOverride: '5–8',   tipExtra: 'Foco total en técnica. Descanso 2-3 min entre series.' },
    intermedio:   { seriesMod: +1, repsOverride: '4–6',   tipExtra: 'Aumenta carga cada sesión. Descanso completo 3 min.' },
    avanzado:     { seriesMod: +1, repsOverride: '3–5',   tipExtra: 'Periodización ondulante: varía 3, 4 y 5 reps semanalmente.' },
  },
  recomposicion: {
    principiante: { seriesMod: -1, repsOverride: '10–15', tipExtra: 'Déficit calórico leve. Mantén proteína alta ≥2g/kg.' },
    intermedio:   { seriesMod: 0,  repsOverride: '8–12',  tipExtra: 'Alterna días de mayor y menor volumen para gestionar fatiga.' },
    avanzado:     { seriesMod: 0,  repsOverride: '6–12',  tipExtra: 'Bloques de 3-4 semanas: semana de volumen y semana de fuerza.' },
  },
}

// ── Sustituciones de ejercicios por nivel ─────────────────────────────────────
// principiante: versión más segura/sencilla  |  avanzado: versión más exigente
const NIVEL_SWAP = {
  // Pecho
  pb: {
    principiante: { nombre: 'Press con mancuernas banco plano', gif: G.pman, tip: 'Mancuernas: mayor rango de movimiento y más seguro para aprender el patrón.' },
    avanzado:     null,
  },
  pi: {
    principiante: { nombre: 'Press inclinado en máquina', gif: G.pi, tip: 'Máquina guiada: aprende el ángulo inclinado sin riesgo de desequilibrio.' },
    avanzado:     { nombre: 'Press inclinado con barra + pausa', gif: G.pi, tip: 'Pausa 1 seg en el pecho. Máxima tensión en pectoral superior.' },
  },
  fo: {
    principiante: { nombre: 'Flexiones de pecho (push-ups)', gif: G.fo, tip: 'Cuerpo recto, baja hasta el pecho. Progresa a fondos cuando domines 15 reps.' },
    avanzado:     { nombre: 'Fondos con lastre', gif: G.fo, tip: 'Cinturón con 10-20kg. Máxima sobrecarga en pecho inferior y tríceps.' },
  },
  // Espalda
  jp: {
    principiante: { nombre: 'Jalón al pecho (máquina)', gif: G.jp, tip: 'Máquina guiada: aprende el patrón de tracción antes de pasar a dominadas.' },
    avanzado:     { nombre: 'Dominadas con lastre', gif: G.jp, tip: 'Añade 5-15kg en cinturón. Baja en 3 seg, sube explosivo.' },
  },
  rb: {
    principiante: { nombre: 'Remo con mancuerna unilateral', gif: G.rman, tip: 'Apóyate en el banco. Codo pegado al cuerpo, tira hacia la cadera.' },
    avanzado:     null,
  },
  // Pierna
  sq: {
    principiante: { nombre: 'Sentadilla goblet con kettlebell', gif: G.sg, tip: 'Kettlebell al pecho: postura automáticamente correcta. Foco total en técnica.' },
    avanzado:     { nombre: 'Sentadilla trasera (powerlifting)', gif: G.sq, tip: 'Barra baja (low bar): más activación de glúteos e isquiotibiales.' },
  },
  pmr: {
    principiante: { nombre: 'Peso muerto rumano con mancuernas', gif: G.pmr, tip: 'Mancuernas: más fácil mantener espalda neutra al aprender la bisagra de cadera.' },
    avanzado:     null,
  },
  // Hombros
  pm: {
    principiante: { nombre: 'Press Arnold con mancuernas', gif: G.el, tip: 'Mancuernas: mayor control y rango de movimiento. Trabaja los 3 haces del deltoides.' },
    avanzado:     { nombre: 'Press militar con barra de pie', gif: G.pm, tip: 'De pie: mayor activación del core. Máxima carga posible.' },
  },
}

// ── Plantilla PPL para GANAR MÚSCULO / RECOMPOSICIÓN ─────────────────────────
const DIAS_GANAR = [
  {
    id: 'lunes', nombre: 'Lunes', enfoque: 'Push — Pecho + Hombros + Tríceps', color: '#6366f1', bg: '#eef2ff', emoji: '💪',
    cardio: 'Caminata inclinada en cinta – 10 min (calentamiento)',
    ejercicios: [
      { id: 'pb',   nombre: 'Press banca plano (barra)',       musculo: 'Pecho (fibras medias)',    series: 4, reps: '6–8',   tipo: 'peso',      gif: G.pb,   tip: 'Espalda recta, escápulas juntas. Baja controlado hasta rozar el pecho.', alternativas: [{ nombre: 'Press con mancuernas banco plano', musculo: 'Pecho' }, { nombre: 'Press en máquina Smith', musculo: 'Pecho' }] },
      { id: 'pi',   nombre: 'Press inclinado mancuernas',      musculo: 'Pecho (parte superior)',   series: 3, reps: '8–10',  tipo: 'peso',      gif: G.pi,   tip: 'Banco a 30–45°. Codos a 45° del cuerpo.', alternativas: [{ nombre: 'Press inclinado con barra', musculo: 'Pecho superior' }] },
      { id: 'pm',   nombre: 'Press militar mancuernas',        musculo: 'Deltoides anterior',       series: 3, reps: '8–10',  tipo: 'peso',      gif: G.pm,   tip: 'Core tenso. No arquees la espalda. Exhala al subir.', alternativas: [{ nombre: 'Press Arnold', musculo: 'Hombros (completo)' }] },
      { id: 'el',   nombre: 'Elevaciones laterales',           musculo: 'Deltoides lateral',        series: 3, reps: '12',    tipo: 'peso',      gif: G.el,   tip: 'Pulgares ligeramente abajo. No subas más de 90°.', alternativas: [{ nombre: 'Elevaciones laterales en polea', musculo: 'Deltoides lateral' }] },
      { id: 'ap',   nombre: 'Aperturas en polea',              musculo: 'Aislamiento de pecho',     series: 3, reps: '12',    tipo: 'peso',      gif: G.ap,   tip: 'Ligera flexión en los codos. Controla la vuelta.', alternativas: [{ nombre: 'Pec-deck (mariposa)', musculo: 'Pecho' }] },
      { id: 'et',   nombre: 'Extensión tríceps en polea',      musculo: 'Tríceps (cabeza lateral)', series: 3, reps: '12',    tipo: 'peso',      gif: G.et,   tip: 'Codos pegados al cuerpo, extiende completamente.', alternativas: [{ nombre: 'Fondos en banco', musculo: 'Tríceps' }] },
      { id: 'pf',   nombre: 'Press francés',                   musculo: 'Tríceps (cabeza larga)',   series: 2, reps: '12',    tipo: 'peso',      gif: G.pf,   tip: 'Codos apuntando al techo. Usa barra EZ.', alternativas: [{ nombre: 'Extensión sobre la cabeza con mancuerna', musculo: 'Tríceps' }] },
    ]
  },
  {
    id: 'martes', nombre: 'Martes', enfoque: 'Pull — Espalda + Bíceps', color: '#10b981', bg: '#ecfdf5', emoji: '🔙',
    cardio: 'Bicicleta – HIIT 10–12 min (30 seg fuerte / 60 seg suave)',
    ejercicios: [
      { id: 'jp',   nombre: 'Jalón al pecho',                  musculo: 'Dorsal ancho',             series: 4, reps: '8',     tipo: 'peso',      gif: G.jp,   tip: 'Tira hacia la clavícula. Pecho erguido.', alternativas: [{ nombre: 'Dominadas asistidas', musculo: 'Dorsal' }] },
      { id: 'rb',   nombre: 'Remo con barra',                  musculo: 'Espesor de espalda',       series: 4, reps: '8',     tipo: 'peso',      gif: G.rb,   tip: 'Espalda paralela al suelo, tira hacia el ombligo.', alternativas: [{ nombre: 'Remo con mancuerna unilateral', musculo: 'Espalda media' }] },
      { id: 'rs',   nombre: 'Remo sentado en polea',           musculo: 'Espalda media',            series: 3, reps: '10',    tipo: 'peso',      gif: G.rs,   tip: 'No te balancees. Codos pegados al cuerpo.', alternativas: [{ nombre: 'Remo en máquina', musculo: 'Espalda media' }] },
      { id: 'je',   nombre: 'Jalón agarre estrecho',           musculo: 'Dorsal y bíceps',          series: 3, reps: '10',    tipo: 'peso',      gif: G.je,   tip: 'Agarre neutro o supino. Lleva codos hacia las caderas.', alternativas: [{ nombre: 'Dominadas agarre estrecho', musculo: 'Dorsal/Bíceps' }] },
      { id: 'pp',   nombre: 'Pájaros posteriores',             musculo: 'Deltoides posterior',      series: 3, reps: '12',    tipo: 'peso',      gif: G.pp,   tip: 'Espalda plana, ligera flexión de codos.', alternativas: [{ nombre: 'Face pull con cuerda', musculo: 'Deltoides posterior' }] },
      { id: 'cb',   nombre: 'Curl con barra',                  musculo: 'Bíceps (cabeza larga)',    series: 3, reps: '10',    tipo: 'peso',      gif: G.cb,   tip: 'No balancees el cuerpo. Aprieta al máximo.', alternativas: [{ nombre: 'Curl barra EZ', musculo: 'Bíceps' }] },
      { id: 'cm',   nombre: 'Curl martillo',                   musculo: 'Bíceps (braquial)',        series: 2, reps: '12',    tipo: 'peso',      gif: G.cm,   tip: 'Agarre neutro (pulgar arriba). Trabaja braquial.', alternativas: [{ nombre: 'Curl martillo en polea', musculo: 'Braquial' }] },
    ]
  },
  {
    id: 'miercoles', nombre: 'Miércoles', enfoque: 'Legs — Pierna Completa', color: '#f97316', bg: '#fff7ed', emoji: '🦵',
    cardio: 'Caminata inclinada – 10 min (calentamiento activo)',
    ejercicios: [
      { id: 'sq',   nombre: 'Sentadilla con barra',            musculo: 'Cuádriceps, glúteos',      series: 4, reps: '6–8',   tipo: 'peso',      gif: G.sq,   tip: 'Espalda recta, rodillas siguen pies. Muslo paralelo al suelo.', alternativas: [{ nombre: 'Sentadilla goblet', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pr',   nombre: 'Prensa 45°',                     musculo: 'Cuádriceps, glúteos',      series: 4, reps: '10',    tipo: 'peso',      gif: G.pr,   tip: 'No bloquees rodillas al extender.', alternativas: [{ nombre: 'Zancadas con mancuernas', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pmr',  nombre: 'Peso muerto rumano',             musculo: 'Isquiotibiales, glúteos',  series: 3, reps: '10',    tipo: 'peso',      gif: G.pmr,  tip: 'Bisagra de cadera. Barra roza las piernas todo el recorrido.', alternativas: [{ nombre: 'Peso muerto rumano con mancuernas', musculo: 'Isquiotibiales' }] },
      { id: 'cf',   nombre: 'Curl femoral tumbado',           musculo: 'Isquiotibiales',           series: 3, reps: '12',    tipo: 'peso',      gif: G.cf,   tip: 'No levantes las caderas. Aprieta al final.', alternativas: [{ nombre: 'Curl femoral de pie', musculo: 'Isquiotibiales' }] },
      { id: 'ec',   nombre: 'Extensión cuádriceps',           musculo: 'Cuádriceps (aislado)',     series: 3, reps: '12',    tipo: 'peso',      gif: G.ec,   tip: 'Control en la bajada. No uses impulso.', alternativas: [{ nombre: 'Sentadilla con salto', musculo: 'Cuádriceps' }] },
      { id: 'gp',   nombre: 'Gemelos de pie',                 musculo: 'Gemelos',                  series: 4, reps: '15',    tipo: 'peso',      gif: G.gp,   tip: 'Rango completo. Aguanta 1 seg arriba.', alternativas: [{ nombre: 'Elevación de talones sentado', musculo: 'Sóleo' }] },
    ]
  },
  {
    id: 'jueves', nombre: 'Jueves', enfoque: 'Hombros + Core + Trapecio', color: '#8b5cf6', bg: '#f5f3ff', emoji: '🏔️',
    cardio: 'Remo o elíptica – 10 min (suave)',
    ejercicios: [
      { id: 'pp',   nombre: 'Pájaros posteriores (mancuernas)', musculo: 'Deltoides posterior',    series: 3, reps: '15',    tipo: 'peso',      gif: G.pp,   tip: 'Ligera flexión de codos, mueve los brazos como alas.', alternativas: [{ nombre: 'Face pull con cuerda', musculo: 'Deltoides posterior' }] },
      { id: 'el',   nombre: 'Elevaciones laterales',           musculo: 'Deltoides lateral',        series: 4, reps: '12',    tipo: 'peso',      gif: G.el,   tip: 'Pulgares ligeramente abajo. No subas más de 90°.', alternativas: [{ nombre: 'Elevaciones laterales en polea', musculo: 'Deltoides lateral' }] },
      { id: 'fp',   nombre: 'Face pull en polea',              musculo: 'Rotadores, trapecio',      series: 3, reps: '15',    tipo: 'peso',      gif: G.fp,   tip: 'Polea a la altura de los ojos. Codos arriba.', alternativas: [{ nombre: 'Rotaciones externas con banda', musculo: 'Manguito rotador' }] },
      { id: 'entr', nombre: 'Encogimientos trapecio',          musculo: 'Trapecio',                 series: 3, reps: '12',    tipo: 'peso',      gif: G.entr, tip: 'Sube hombros hacia las orejas. No gires el cuello.', alternativas: [{ nombre: 'Encogimientos con barra', musculo: 'Trapecio' }] },
      { id: 'pl',   nombre: 'Plancha isométrica',              musculo: 'Core completo',            series: 3, reps: '45',    tipo: 'tiempo',    gif: G.pl,   tip: 'Cuerpo en línea recta, glúteos apretados. Respira controlado.', alternativas: [{ nombre: 'Plancha lateral', musculo: 'Oblicuos' }] },
      { id: 'crp',  nombre: 'Crunch en polea',                 musculo: 'Abdominales',              series: 3, reps: '15',    tipo: 'peso',      gif: G.crp,  tip: 'Contrae hacia las rodillas, no tires con el cuello.', alternativas: [{ nombre: 'Crunch en suelo', musculo: 'Abdominales' }] },
      { id: 'evp',  nombre: 'Elevación de piernas colgado',    musculo: 'Abdomen inferior',         series: 3, reps: '12',    tipo: 'reps',      gif: G.evp,  tip: 'Sube las piernas sin balanceo. Contrae el abdomen al subir.', alternativas: [{ nombre: 'Elevación de rodillas en barra', musculo: 'Abdomen inferior' }] },
    ]
  },
  {
    id: 'viernes', nombre: 'Viernes', enfoque: 'Full Body Metabólico + Punto Débil', color: '#f59e0b', bg: '#fffbeb', emoji: '🔥',
    cardio: 'Caminata rápida – 10 min', circuito: true, vueltas: 4,
    ejercicios: [
      { id: 'sg',   nombre: 'Sentadilla goblet',               musculo: 'Cuádriceps, glúteos',      series: 4, reps: '12',    tipo: 'peso',      gif: G.sg,   tip: 'Kettlebell al pecho. Pecho erguido todo el recorrido.', alternativas: [{ nombre: 'Sentadilla con peso corporal', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pman', nombre: 'Press mancuernas banco plano',    musculo: 'Pecho, hombros',           series: 4, reps: '12',    tipo: 'peso',      gif: G.pman, tip: 'Baja en 2 seg. Empuja explosivo.', alternativas: [{ nombre: 'Flexiones', musculo: 'Pecho/Hombros/Tríceps' }] },
      { id: 'rman', nombre: 'Remo mancuerna unilateral',      musculo: 'Espalda',                  series: 4, reps: '12',    tipo: 'peso',      gif: G.rman, tip: 'Apóyate en el banco. Codo pegado al cuerpo.', alternativas: [{ nombre: 'Remo con banda elástica', musculo: 'Espalda' }] },
      { id: 'pmk',  nombre: 'Peso muerto kettlebell',          musculo: 'Cadena posterior',         series: 4, reps: '12',    tipo: 'peso',      gif: G.pmk,  tip: 'Bisagra de cadera. Empuja el suelo al subir.', alternativas: [{ nombre: 'Peso muerto con mancuernas', musculo: 'Cadena posterior' }] },
      { id: 'bur',  nombre: 'Burpees',                         musculo: 'Full body',                series: 4, reps: '10',    tipo: 'reps',      gif: G.bur,  tip: 'Explosivo en el salto, controlado en la bajada.', alternativas: [{ nombre: 'Burpee sin salto', musculo: 'Full body (menor impacto)' }] },
      { id: 'planv',nombre: 'Plancha',                         musculo: 'Core',                     series: 4, reps: '45',    tipo: 'tiempo',    gif: G.planv,tip: 'Respira controlado. No dejes caer las caderas.', alternativas: [{ nombre: 'Plancha sobre rodillas', musculo: 'Core (principiante)' }] },
    ]
  },
]

// ── Plantilla FULL BODY METABÓLICO para PERDER GRASA ──────────────────────────
// Enfoque: circuitos compuestos, alta densidad de trabajo, cardio integrado
const DIAS_PERDER = [
  {
    id: 'lunes', nombre: 'Lunes', enfoque: 'Full Body A — Compuestos + HIIT', color: '#10b981', bg: '#ecfdf5', emoji: '🔥',
    cardio: 'HIIT en cinta – 15 min (1 min al 85% + 2 min suave, × 5)', circuito: true, vueltas: 3,
    ejercicios: [
      { id: 'sg',   nombre: 'Sentadilla goblet',               musculo: 'Cuádriceps, glúteos',      series: 3, reps: '15',    tipo: 'peso',      gif: G.sg,   tip: 'Kettlebell al pecho. Ritmo controlado. Descanso 45s.', alternativas: [{ nombre: 'Sentadilla con peso corporal', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pman', nombre: 'Press mancuernas banco',          musculo: 'Pecho, hombros',           series: 3, reps: '15',    tipo: 'peso',      gif: G.pman, tip: 'Rango completo. Pausa 1 seg abajo. Descanso 45s.', alternativas: [{ nombre: 'Flexiones', musculo: 'Pecho/Hombros/Tríceps' }] },
      { id: 'rman', nombre: 'Remo mancuerna unilateral',      musculo: 'Espalda',                  series: 3, reps: '15',    tipo: 'peso',      gif: G.rman, tip: 'Apóyate en banco, codo pegado. Cada lado. Descanso 45s.', alternativas: [{ nombre: 'Remo con banda elástica', musculo: 'Espalda' }] },
      { id: 'pmr',  nombre: 'Peso muerto rumano',             musculo: 'Isquiotibiales, glúteos',  series: 3, reps: '15',    tipo: 'peso',      gif: G.pmr,  tip: 'Bisagra de cadera controlada. Siente el estiramiento. Descanso 45s.', alternativas: [{ nombre: 'Peso muerto rumano con mancuernas', musculo: 'Isquiotibiales' }] },
      { id: 'bur',  nombre: 'Burpees',                         musculo: 'Full body',                series: 3, reps: '10',    tipo: 'reps',      gif: G.bur,  tip: 'Explosivo. Máxima intensidad en cada rep. Descanso 60s entre circuitos.', alternativas: [{ nombre: 'Burpee sin salto', musculo: 'Full body (menor impacto)' }] },
    ]
  },
  {
    id: 'martes', nombre: 'Martes', enfoque: 'Upper Metabólico + Core', color: '#6366f1', bg: '#eef2ff', emoji: '💪',
    cardio: 'Bicicleta estática – 20 min ritmo constante al 65-70% FCmax',
    ejercicios: [
      { id: 'pi',   nombre: 'Press inclinado mancuernas',      musculo: 'Pecho (parte superior)',   series: 3, reps: '15',    tipo: 'peso',      gif: G.pi,   tip: 'Banco 30°. Series seguidas con descanso mínimo.', alternativas: [{ nombre: 'Flexiones con pies elevados', musculo: 'Pecho superior' }] },
      { id: 'jp',   nombre: 'Jalón al pecho',                  musculo: 'Dorsal ancho',             series: 3, reps: '15',    tipo: 'peso',      gif: G.jp,   tip: 'Pecho erguido, tira hacia la clavícula. Control en la vuelta.', alternativas: [{ nombre: 'Jalón con banda elástica', musculo: 'Dorsal' }] },
      { id: 'el',   nombre: 'Elevaciones laterales',           musculo: 'Deltoides lateral',        series: 3, reps: '15',    tipo: 'peso',      gif: G.el,   tip: 'Peso ligero, rango completo. 3 series seguidas.', alternativas: [{ nombre: 'Elevaciones laterales en polea', musculo: 'Deltoides lateral' }] },
      { id: 'et',   nombre: 'Extensión tríceps en polea',      musculo: 'Tríceps (cabeza lateral)', series: 3, reps: '15',    tipo: 'peso',      gif: G.et,   tip: 'Codos pegados. Extiende completamente. Descanso 30s.', alternativas: [{ nombre: 'Fondos en banco', musculo: 'Tríceps' }] },
      { id: 'cb',   nombre: 'Curl bíceps con mancuernas',      musculo: 'Bíceps (cabeza larga)',    series: 3, reps: '15',    tipo: 'peso',      gif: G.cb,   tip: 'Superset con tríceps para mayor gasto calórico.', alternativas: [{ nombre: 'Curl martillo', musculo: 'Bíceps/Braquial' }] },
      { id: 'pl',   nombre: 'Plancha + rotación lateral',      musculo: 'Core completo',            series: 3, reps: '45',    tipo: 'tiempo',    gif: G.pl,   tip: 'Plancha estándar. Añade toque de hombro alterno si puedes.', alternativas: [{ nombre: 'Plancha sobre rodillas', musculo: 'Core' }] },
      { id: 'evp',  nombre: 'Elevación de piernas',            musculo: 'Abdomen inferior',         series: 3, reps: '15',    tipo: 'reps',      gif: G.evp,  tip: 'Sube lento, baja aún más lento. Aprieta el abdomen.', alternativas: [{ nombre: 'Elevación de rodillas sentado', musculo: 'Abdomen inferior' }] },
    ]
  },
  {
    id: 'miercoles', nombre: 'Miércoles', enfoque: 'Lower Body + Glúteo', color: '#f97316', bg: '#fff7ed', emoji: '🦵',
    cardio: 'Caminata inclinada 12% – 20 min (quema grasa zona 2)',
    ejercicios: [
      { id: 'sq',   nombre: 'Sentadilla',                      musculo: 'Cuádriceps, glúteos',      series: 3, reps: '15',    tipo: 'peso',      gif: G.sq,   tip: 'Descanso 45s. Mantén el ritmo cardíaco elevado.', alternativas: [{ nombre: 'Sentadilla goblet', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pr',   nombre: 'Prensa 45°',                     musculo: 'Cuádriceps, glúteos',      series: 3, reps: '20',    tipo: 'peso',      gif: G.pr,   tip: 'Reps altas para mayor quema. No bloquees rodillas.', alternativas: [{ nombre: 'Zancadas con mancuernas', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pmr',  nombre: 'Peso muerto rumano',             musculo: 'Isquiotibiales, glúteos',  series: 3, reps: '15',    tipo: 'peso',      gif: G.pmr,  tip: 'Bisagra de cadera. Barra pegada a las piernas.', alternativas: [{ nombre: 'Puente de glúteo con barra', musculo: 'Glúteos' }] },
      { id: 'cf',   nombre: 'Curl femoral tumbado',           musculo: 'Isquiotibiales',           series: 3, reps: '15',    tipo: 'peso',      gif: G.cf,   tip: 'Control total. No levantes caderas.', alternativas: [{ nombre: 'Curl femoral de pie', musculo: 'Isquiotibiales' }] },
      { id: 'gp',   nombre: 'Gemelos de pie',                 musculo: 'Gemelos',                  series: 3, reps: '20',    tipo: 'peso',      gif: G.gp,   tip: 'Rango completo. 20 reps para máxima quema local.', alternativas: [{ nombre: 'Elevación de talones sentado', musculo: 'Sóleo' }] },
      { id: 'crp',  nombre: 'Crunch en polea',                musculo: 'Abdominales',              series: 3, reps: '20',    tipo: 'peso',      gif: G.crp,  tip: 'Contrae fuerte en cada rep. No uses el cuello.', alternativas: [{ nombre: 'Crunch en suelo', musculo: 'Abdominales' }] },
    ]
  },
  {
    id: 'jueves', nombre: 'Jueves', enfoque: 'HIIT + Cardio Activo', color: '#ef4444', bg: '#fef2f2', emoji: '🏃',
    cardio: 'Sesión principal de cardio: 30 min bicicleta o correr al 70-75% FCmax',
    ejercicios: [
      { id: 'sg',   nombre: 'Sentadilla con salto',            musculo: 'Cuádriceps, glúteos',      series: 4, reps: '12',    tipo: 'reps',      gif: G.sg,   tip: 'Explosivo en el salto. Aterriza suave con rodillas flexionadas.', alternativas: [{ nombre: 'Sentadilla con peso corporal', musculo: 'Cuádriceps' }] },
      { id: 'pman', nombre: 'Flexiones dinámicas',            musculo: 'Pecho, hombros',           series: 4, reps: '12',    tipo: 'reps',      gif: G.pman, tip: 'Ritmo explosivo en la subida. Baja controlado.', alternativas: [{ nombre: 'Flexiones sobre rodillas', musculo: 'Pecho/Hombros' }] },
      { id: 'bur',  nombre: 'Burpees con salto',               musculo: 'Full body',                series: 4, reps: '10',    tipo: 'reps',      gif: G.bur,  tip: 'Mantén el ritmo. Descanso 90s entre series.', alternativas: [{ nombre: 'Burpee sin salto', musculo: 'Full body' }] },
      { id: 'rman', nombre: 'Remo mancuerna inclinado',       musculo: 'Espalda',                  series: 4, reps: '12',    tipo: 'peso',      gif: G.rman, tip: 'Superset con burpees. Mantiene el ritmo cardíaco.', alternativas: [{ nombre: 'Remo con banda', musculo: 'Espalda' }] },
      { id: 'pl',   nombre: 'Plancha con toque de hombro',    musculo: 'Core completo',            series: 3, reps: '40',    tipo: 'tiempo',    gif: G.pl,   tip: '20 seg plancha + 20 seg tocando hombros alternos.', alternativas: [{ nombre: 'Plancha estándar', musculo: 'Core' }] },
      { id: 'evp',  nombre: 'Mountain climbers',               musculo: 'Abdomen inferior',         series: 3, reps: '30',    tipo: 'reps',      gif: G.evp,  tip: 'Ritmo máximo. 30 reps (15 cada pierna). Cardio y core.', alternativas: [{ nombre: 'Elevación de rodillas lento', musculo: 'Abdomen inferior' }] },
    ]
  },
  {
    id: 'viernes', nombre: 'Viernes', enfoque: 'Full Body B — Circuito Final', color: '#f59e0b', bg: '#fffbeb', emoji: '🔥',
    cardio: 'Caminata inclinada – 15 min antes del circuito (activación)', circuito: true, vueltas: 4,
    ejercicios: [
      { id: 'pmk',  nombre: 'Peso muerto con mancuernas',      musculo: 'Cadena posterior',         series: 4, reps: '12',    tipo: 'peso',      gif: G.pmk,  tip: 'Empuja el suelo al subir. Espalda recta siempre.', alternativas: [{ nombre: 'Peso muerto kettlebell', musculo: 'Cadena posterior' }] },
      { id: 'pi',   nombre: 'Press inclinado mancuernas',      musculo: 'Pecho (parte superior)',   series: 4, reps: '12',    tipo: 'peso',      gif: G.pi,   tip: 'Rango completo. Descanso 30s entre ejercicios del circuito.', alternativas: [{ nombre: 'Flexiones con pies elevados', musculo: 'Pecho superior' }] },
      { id: 'rs',   nombre: 'Remo sentado en polea',           musculo: 'Espalda media',            series: 4, reps: '12',    tipo: 'peso',      gif: G.rs,   tip: 'Tira hacia el ombligo. No te balancees.', alternativas: [{ nombre: 'Remo con banda', musculo: 'Espalda' }] },
      { id: 'el',   nombre: 'Elevaciones laterales',           musculo: 'Deltoides lateral',        series: 4, reps: '15',    tipo: 'peso',      gif: G.el,   tip: 'Peso ligero, muchas reps. Mantiene el ritmo cardíaco.', alternativas: [{ nombre: 'Elevaciones en polea', musculo: 'Deltoides lateral' }] },
      { id: 'bur',  nombre: 'Burpees (final de circuito)',     musculo: 'Full body',                series: 4, reps: '8',     tipo: 'reps',      gif: G.bur,  tip: 'Finaliza cada vuelta con 8 burpees a tope. Descansa 90s.', alternativas: [{ nombre: 'Jumping jacks', musculo: 'Full body' }] },
    ]
  },
]

// ── Plantilla SBD (Squat/Bench/Deadlift) para GANAR FUERZA ───────────────────
// Enfoque: progresión lineal en los 3 levantamientos + accesorios
const DIAS_FUERZA = [
  {
    id: 'lunes', nombre: 'Lunes', enfoque: 'Sentadilla — Pierna + Glúteo', color: '#ef4444', bg: '#fef2f2', emoji: '🏋️',
    cardio: 'Movilidad de cadera y tobillo – 10 min (obligatorio antes de sentadilla)',
    ejercicios: [
      { id: 'sq',   nombre: 'Sentadilla con barra (principal)', musculo: 'Cuádriceps, glúteos',    series: 5, reps: '5',     tipo: 'peso',      gif: G.sq,   tip: 'El ejercicio del día. Progresión lineal: añade 2.5kg respecto a la semana anterior. Descanso 3-4 min.', alternativas: [{ nombre: 'Sentadilla en Smith', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pr',   nombre: 'Prensa 45° (accesorio)',          musculo: 'Cuádriceps, glúteos',      series: 4, reps: '8',     tipo: 'peso',      gif: G.pr,   tip: 'Accesorio de pierna. Pies altos para más glúteo. Descanso 2-3 min.', alternativas: [{ nombre: 'Hack squat', musculo: 'Cuádriceps' }] },
      { id: 'pmr',  nombre: 'Peso muerto rumano',             musculo: 'Isquiotibiales, glúteos',  series: 4, reps: '8',     tipo: 'peso',      gif: G.pmr,  tip: 'Bisagra de cadera perfecta. Isquios a tope en la bajada.', alternativas: [{ nombre: 'Peso muerto rumano con mancuernas', musculo: 'Isquiotibiales' }] },
      { id: 'cf',   nombre: 'Curl femoral',                   musculo: 'Isquiotibiales',           series: 3, reps: '10',    tipo: 'peso',      gif: G.cf,   tip: 'Accesorio para equilibrar cuád/isquio. No balancear.', alternativas: [{ nombre: 'Curl femoral nórdico', musculo: 'Isquiotibiales' }] },
      { id: 'gp',   nombre: 'Gemelos con carga máxima',       musculo: 'Gemelos',                  series: 4, reps: '10',    tipo: 'peso',      gif: G.gp,   tip: 'Peso máximo controlado. Pausa 1 seg arriba.', alternativas: [{ nombre: 'Gemelos en prensa', musculo: 'Gemelos/Sóleo' }] },
    ]
  },
  {
    id: 'martes', nombre: 'Martes', enfoque: 'Press Banca — Pecho + Tríceps', color: '#6366f1', bg: '#eef2ff', emoji: '💪',
    cardio: 'Movilidad de hombros y activación rotadores – 8 min',
    ejercicios: [
      { id: 'pb',   nombre: 'Press banca plano (principal)',   musculo: 'Pecho (fibras medias)',    series: 5, reps: '5',     tipo: 'peso',      gif: G.pb,   tip: 'El ejercicio del día. Progresión lineal. Arco técnico, escápulas juntas y deprimidas. Descanso 3-4 min.', alternativas: [{ nombre: 'Press en Smith', musculo: 'Pecho' }] },
      { id: 'pi',   nombre: 'Press inclinado con barra',       musculo: 'Pecho (parte superior)',   series: 4, reps: '6–8',   tipo: 'peso',      gif: G.pi,   tip: 'Accesorio. Banco 30°. Desarrolla pectoral superior para banca.', alternativas: [{ nombre: 'Press inclinado con mancuernas', musculo: 'Pecho superior' }] },
      { id: 'pf',   nombre: 'Press francés (accesorio tríceps)', musculo: 'Tríceps (cabeza larga)', series: 4, reps: '8',    tipo: 'peso',      gif: G.pf,   tip: 'Los tríceps son el 60% del bloqueo en banca. Fortalécelos.', alternativas: [{ nombre: 'Extensión sobre cabeza con mancuerna', musculo: 'Tríceps' }] },
      { id: 'fo',   nombre: 'Fondos con lastre',               musculo: 'Pecho inferior y tríceps', series: 3, reps: '6–8',  tipo: 'peso_reps', gif: G.fo,   tip: 'Cinturón con lastre. Excelente accesorio para banca.', alternativas: [{ nombre: 'Fondos en paralelas sin lastre', musculo: 'Pecho/Tríceps' }] },
      { id: 'ap',   nombre: 'Aperturas en polea (cable fly)',  musculo: 'Aislamiento de pecho',     series: 3, reps: '12',    tipo: 'peso',      gif: G.ap,   tip: 'Aislamiento final. Mayor bombeo y conexión muscular.', alternativas: [{ nombre: 'Pec-deck', musculo: 'Pecho' }] },
    ]
  },
  {
    id: 'miercoles', nombre: 'Miércoles', enfoque: 'Peso Muerto — Espalda + Core', color: '#10b981', bg: '#ecfdf5', emoji: '🔙',
    cardio: 'Activación lumbar y movilidad de cadera – 10 min',
    ejercicios: [
      { id: 'pmk',  nombre: 'Peso muerto convencional (principal)', musculo: 'Cadena posterior',   series: 4, reps: '3–5',   tipo: 'peso',      gif: G.pmk,  tip: 'El ejercicio del día. Progresión lineal. Barra sobre mediopiés, espalda recta, empuja el suelo. Descanso 3-5 min.', alternativas: [{ nombre: 'Peso muerto sumo', musculo: 'Cadena posterior' }] },
      { id: 'rb',   nombre: 'Remo con barra pendlay',            musculo: 'Espesor de espalda',    series: 4, reps: '6',     tipo: 'peso',      gif: G.rb,   tip: 'Remo desde el suelo (Pendlay): explosivo, máxima carga. Espalda paralela.', alternativas: [{ nombre: 'Remo con mancuerna', musculo: 'Espalda media' }] },
      { id: 'jp',   nombre: 'Jalón al pecho pesado',            musculo: 'Dorsal ancho',           series: 4, reps: '6',     tipo: 'peso',      gif: G.jp,   tip: 'Peso alto, pocas reps. Trabaja la anchura de espalda para banca.', alternativas: [{ nombre: 'Dominadas con lastre', musculo: 'Dorsal' }] },
      { id: 'rs',   nombre: 'Remo sentado en polea',            musculo: 'Espalda media',          series: 3, reps: '10',    tipo: 'peso',      gif: G.rs,   tip: 'Accesorio. Desarrolla el espesor de la espalda.', alternativas: [{ nombre: 'Remo máquina', musculo: 'Espalda media' }] },
      { id: 'pl',   nombre: 'Plancha + extensión alterna',      musculo: 'Core completo',          series: 3, reps: '45',    tipo: 'tiempo',    gif: G.pl,   tip: 'Core fuerte = más fuerza en todos los levantamientos.', alternativas: [{ nombre: 'Plancha estándar', musculo: 'Core' }] },
    ]
  },
  {
    id: 'jueves', nombre: 'Jueves', enfoque: 'Press Militar — Hombros + Tríceps', color: '#8b5cf6', bg: '#f5f3ff', emoji: '🏔️',
    cardio: 'Movilidad de hombros – 8 min (especialmente rotadores)',
    ejercicios: [
      { id: 'pm',   nombre: 'Press militar con barra de pie (principal)', musculo: 'Deltoides anterior', series: 5, reps: '5', tipo: 'peso', gif: G.pm, tip: 'El ejercicio del día. De pie para máxima activación del core. Progresión lineal. Descanso 3 min.', alternativas: [{ nombre: 'Press militar sentado con mancuernas', musculo: 'Deltoides anterior' }] },
      { id: 'el',   nombre: 'Elevaciones laterales pesadas',    musculo: 'Deltoides lateral',        series: 4, reps: '8–10', tipo: 'peso',      gif: G.el,   tip: 'Más peso que la norma. Deltoides lateral es el 60% de la anchura del hombro.', alternativas: [{ nombre: 'Elevaciones en polea', musculo: 'Deltoides lateral' }] },
      { id: 'pp',   nombre: 'Face pull con cuerda',             musculo: 'Deltoides posterior',      series: 4, reps: '15',    tipo: 'peso',      gif: G.pp,   tip: 'Salud del hombro = más fuerza a largo plazo. No saltar este.', alternativas: [{ nombre: 'Rotaciones externas con banda', musculo: 'Manguito rotador' }] },
      { id: 'et',   nombre: 'Extensión tríceps en polea',       musculo: 'Tríceps (cabeza lateral)', series: 4, reps: '10',   tipo: 'peso',      gif: G.et,   tip: 'Tríceps fuertes = más peso en banca y press militar.', alternativas: [{ nombre: 'Tríceps en polea con cuerda', musculo: 'Tríceps' }] },
      { id: 'fp',   nombre: 'Face pull / rotador externo',      musculo: 'Rotadores, trapecio',      series: 3, reps: '15',    tipo: 'peso',      gif: G.fp,   tip: 'Prevención de lesión de hombro. Siempre incluirlo en días de press.', alternativas: [{ nombre: 'Rotaciones con mancuerna', musculo: 'Manguito rotador' }] },
    ]
  },
  {
    id: 'viernes', nombre: 'Viernes', enfoque: 'Técnica + Accesorios Full Body', color: '#f59e0b', bg: '#fffbeb', emoji: '⚡',
    cardio: 'Caminata o bicicleta suave – 15 min (recuperación activa)',
    ejercicios: [
      { id: 'sq',   nombre: 'Sentadilla técnica (60-70%)',      musculo: 'Cuádriceps, glúteos',      series: 3, reps: '3',     tipo: 'peso',      gif: G.sq,   tip: 'Sesión de técnica al 60-70% del 1RM. Foco en la forma perfecta, no en el peso.', alternativas: [{ nombre: 'Sentadilla con pausa', musculo: 'Cuádriceps/Glúteos' }] },
      { id: 'pb',   nombre: 'Press banca técnica (60-70%)',     musculo: 'Pecho (fibras medias)',    series: 3, reps: '3',     tipo: 'peso',      gif: G.pb,   tip: 'Repasa el arco técnico. Punto de contacto, trayectoria de barra.', alternativas: [{ nombre: 'Press en Smith con pausa', musculo: 'Pecho' }] },
      { id: 'je',   nombre: 'Jalón agarre estrecho (bíceps)',   musculo: 'Dorsal y bíceps',          series: 3, reps: '10',    tipo: 'peso',      gif: G.je,   tip: 'Accesorio de bíceps/dorsal para días de peso muerto.', alternativas: [{ nombre: 'Curl martillo', musculo: 'Bíceps/Braquial' }] },
      { id: 'cb',   nombre: 'Curl con barra EZ',               musculo: 'Bíceps (cabeza larga)',    series: 3, reps: '10',    tipo: 'peso',      gif: G.cb,   tip: 'Bíceps fuertes = mejor agarre en peso muerto.', alternativas: [{ nombre: 'Curl con mancuernas', musculo: 'Bíceps' }] },
      { id: 'crp',  nombre: 'Crunch en polea',                  musculo: 'Abdominales',              series: 3, reps: '15',    tipo: 'peso',      gif: G.crp,  tip: 'Core resistente = transferencia directa a todos los levantamientos.', alternativas: [{ nombre: 'Crunch en suelo', musculo: 'Abdominales' }] },
      { id: 'evp',  nombre: 'Elevación de piernas',             musculo: 'Abdomen inferior',         series: 3, reps: '12',    tipo: 'reps',      gif: G.evp,  tip: 'Psoas fuerte = sentadilla y peso muerto más estables.', alternativas: [{ nombre: 'Elevación de rodillas', musculo: 'Abdomen inferior' }] },
    ]
  },
]

// ── Selecciona la plantilla de días según el objetivo del usuario ──────────────
function getDiasBase(objetivo) {
  if (objetivo === 'perder') return DIAS_PERDER
  if (objetivo === 'fuerza') return DIAS_FUERZA
  // ganar y recomposicion → PPL clásico
  return DIAS_GANAR
}

// ── Aplica variantes de nivel a los ejercicios ────────────────────────────────
// principiante: versiones más seguras/accesibles
// avanzado: variantes más exigentes
function aplicarNivel(ejercicios, nivel) {
  if (nivel === 'intermedio') return ejercicios
  return ejercicios.map(ej => {
    const swap = NIVEL_SWAP[ej.id]?.[nivel]
    if (!swap) return ej
    return { ...ej, nombre: swap.nombre, gif: swap.gif, tip: swap.tip + ' · ' + ej.tip.split(' · ')[0] }
  })
}

// Genera los días ajustados al ciclo actual y al perfil del usuario
export function getDiasCiclo(cicloId, objetivo = 'recomposicion', nivel = 'intermedio') {
  const mod = MOD[cicloId]
  const userMod = USER_MOD[objetivo]?.[nivel] || { seriesMod: 0, repsOverride: null, tipExtra: '' }
  const isDeload = cicloId === 'deload'
  const diasBase = getDiasBase(objetivo)
  const colorCiclo = CICLOS.find(c => c.id === cicloId)?.color

  return diasBase.map(dia => ({
    ...dia,
    color: colorCiclo || dia.color,
    ejercicios: aplicarNivel(dia.ejercicios, nivel).map(ej => {
      const seriesMod = isDeload ? mod.seriesMod : mod.seriesMod + userMod.seriesMod
      const seriesAjustadas = Math.max(2, ej.series + seriesMod)
      let repsAjustadas
      if (isDeload) {
        repsAjustadas = ej.reps + ' (50% peso)'
      } else if (userMod.repsOverride && mod.repsMod === '') {
        // Para fuerza: el objetivo ya define reps bajas, no sobreescribimos
        repsAjustadas = objetivo === 'fuerza' ? (mod.repsMod || ej.reps) : userMod.repsOverride
      } else {
        repsAjustadas = mod.repsMod || ej.reps
      }
      const tipFinal = (!isDeload && userMod.tipExtra) ? `${ej.tip} · ${userMod.tipExtra}` : ej.tip
      return { ...ej, series: seriesAjustadas, reps: repsAjustadas, tip: tipFinal }
    })
  }))
}

export const PLATOS = {
  postEntreno: [
    { nombre: 'Pollo + arroz + brócoli', kcal: 580, p: 52, c: 60, g: 10, receta: '200g pechuga a la plancha, 80g arroz basmati, brócoli al vapor con AOVE' },
    { nombre: 'Salmón + boniato + ensalada', kcal: 560, p: 45, c: 50, g: 14, receta: '180g salmón al horno con limón, 200g boniato, lechuga y tomate' },
    { nombre: 'Ternera + pasta integral', kcal: 600, p: 50, c: 58, g: 12, receta: '180g ternera, 80g pasta integral, salsa de tomate natural' },
    { nombre: 'Claras + tortitas de avena', kcal: 420, p: 40, c: 48, g: 6, receta: '200g claras de huevo revueltas, 60g copos de avena, arándanos y miel' },
  ],
  comida: [
    { nombre: 'Merluza + quinoa + verduras', kcal: 520, p: 48, c: 50, g: 9, receta: '200g merluza al vapor, 70g quinoa, pimientos y cebolla salteados' },
    { nombre: 'Pechuga al horno + garbanzos', kcal: 540, p: 50, c: 45, g: 10, receta: '200g pechuga, 150g garbanzos, pimientos rojos asados' },
    { nombre: 'Atún + arroz + aguacate', kcal: 510, p: 46, c: 48, g: 13, receta: '2 latas atún al natural, 70g arroz, 1/2 aguacate, limón' },
    { nombre: 'Lentejas + pollo + espinacas', kcal: 530, p: 48, c: 52, g: 8, receta: '150g lentejas cocidas, 150g pechuga a tiras, espinacas salteadas' },
  ],
  merienda: [
    { nombre: 'Yogur griego + frutos rojos', kcal: 320, p: 22, c: 28, g: 12, receta: '200g yogur griego 0%, 80g arándanos, 15g nueces' },
    { nombre: 'Batido proteico + plátano', kcal: 340, p: 32, c: 38, g: 5, receta: '30g proteína de suero, 250ml leche semidesnatada, 1 plátano' },
    { nombre: 'Tostadas + huevo + aguacate', kcal: 360, p: 20, c: 32, g: 16, receta: '2 tostadas integrales, 2 huevos revueltos, 1/2 aguacate' },
    { nombre: 'Queso cottage + fruta + almendras', kcal: 300, p: 26, c: 22, g: 10, receta: '200g queso cottage, 1 manzana, 15g almendras' },
  ],
  cena: [
    { nombre: 'Tortilla + ensalada mixta', kcal: 380, p: 32, c: 10, g: 18, receta: '3 huevos, cebolla, pimiento, ensalada con AOVE' },
    { nombre: 'Salmón a la plancha + espárragos', kcal: 400, p: 40, c: 6, g: 16, receta: '180g salmón, espárragos a la plancha, limón' },
    { nombre: 'Pollo al horno + calabacín', kcal: 360, p: 42, c: 12, g: 10, receta: '200g pechuga con hierbas, calabacín y cebolla salteados' },
    { nombre: 'Merluza al vapor + brócoli + huevo', kcal: 340, p: 44, c: 8, g: 10, receta: '200g merluza, brócoli al vapor, 1 huevo cocido, AOVE' },
  ],
}

// Comida preparada de supermercado / servicios de tupper
export const PLATOS_PREPARADOS = [
  // ── Mercadona ──────────────────────────────────────────────────────────────
  { servicio: 'Mercadona', nombre: 'Pollo asado con verduras', kcal: 280, p: 32, c: 8, g: 12, precio: '~3.50€', nota: 'Bandeja lista para calentar. Alta proteína, bajo carbo.' },
  { servicio: 'Mercadona', nombre: 'Poke de salmón y arroz', kcal: 420, p: 28, c: 46, g: 12, precio: '~4.50€', nota: 'Rico en omega-3. Comer frío o templado.' },
  { servicio: 'Mercadona', nombre: 'Garbanzos a la jardinera', kcal: 300, p: 14, c: 38, g: 8, precio: '~1.80€', nota: 'Conserva. Alta fibra, legumbre completa.' },
  { servicio: 'Mercadona', nombre: 'Ensalada de pollo y frutos secos', kcal: 350, p: 22, c: 18, g: 20, precio: '~3.20€', nota: 'Bandeja fría lista para comer. Grasa saludable de frutos secos.' },
  { servicio: 'Mercadona', nombre: 'Merluza en salsa verde', kcal: 240, p: 26, c: 6, g: 10, precio: '~3.80€', nota: 'Bandeja refrigerada. Bajo en calorías, alto en proteína de pescado.' },
  { servicio: 'Mercadona', nombre: 'Pollo al ajillo (bandeja)', kcal: 310, p: 34, c: 4, g: 16, precio: '~3.20€', nota: 'Sin gluten. Proteína alta, pocas calorías.' },
  // ── Wetaca ─────────────────────────────────────────────────────────────────
  { servicio: 'Wetaca', nombre: 'Pollo con batata y brócoli', kcal: 490, p: 42, c: 44, g: 12, precio: '~6.90€', nota: 'Macro equilibrado. Ideal post-entreno.' },
  { servicio: 'Wetaca', nombre: 'Salmón con quinoa y espinacas', kcal: 520, p: 40, c: 38, g: 18, precio: '~7.50€', nota: 'Rico en omega-3 y hierro. Excelente para recomposición.' },
  { servicio: 'Wetaca', nombre: 'Ternera con arroz integral y judías', kcal: 560, p: 46, c: 50, g: 14, precio: '~7.20€', nota: 'Alta proteína animal. Para ciclos de volumen.' },
  { servicio: 'Wetaca', nombre: 'Merluza con puré de boniato', kcal: 430, p: 38, c: 42, g: 10, precio: '~6.80€', nota: 'Bajo en grasa. Para definición o corte.' },
  // ── Knoweats ───────────────────────────────────────────────────────────────
  { servicio: 'Knoweats', nombre: 'Pollo tikka masala + arroz', kcal: 510, p: 45, c: 48, g: 11, precio: '~7.80€', nota: '40g proteína. Especialmente para deportistas.' },
  { servicio: 'Knoweats', nombre: 'Bacalao con hummus y verduras', kcal: 440, p: 38, c: 32, g: 14, precio: '~7.50€', nota: 'Alto proteína con grasas saludables del hummus.' },
  // ── Tappers/Caseros ────────────────────────────────────────────────────────
  { servicio: 'Casero/Batch', nombre: 'Meal prep: pollo + arroz × 5', kcal: 530, p: 50, c: 55, g: 10, precio: '~2.50€/ud', nota: 'Cocina 1kg pechuga + 500g arroz en 30 min para toda la semana.' },
  { servicio: 'Casero/Batch', nombre: 'Meal prep: atún + pasta × 4', kcal: 480, p: 44, c: 52, g: 8, precio: '~2.00€/ud', nota: '4 latas atún + 400g pasta integral. Rápido y económico.' },
  { servicio: 'Casero/Batch', nombre: 'Meal prep: lentejas + verdura × 4', kcal: 420, p: 22, c: 56, g: 8, precio: '~1.80€/ud', nota: 'Legumbre completa. Rica en hierro y fibra.' },
]

// Grupos musculares fitcron → musculo del ejercicio
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

export const AVATARS = ['💪', '🏃', '🧘', '🏋️', '⚡', '🦁', '🔥', '🌟']
