// ─── MOTOR DE REGLAS DE ENTRENAMIENTO ────────────────────────────────────────
// Basado en:
// - Renaissance Periodization (RP Strength) — MEV/MAV/MRV landmarks
// - NIH PMC9302196 — Resistance training variables for hypertrophy
// - Arvo.guru periodization guide — volume, deload, RIR protocols
// - Progressive overload research PMC9528903

export const OBJETIVOS = [
  { id: 'perder',        nombre: 'Perder grasa',    icon: '🔥', desc: 'Déficit calórico + mantener músculo' },
  { id: 'ganar',         nombre: 'Ganar músculo',   icon: '💪', desc: 'Superávit + hipertrofia máxima' },
  { id: 'recomposicion', nombre: 'Recomposición',   icon: '⚡', desc: 'Perder grasa y ganar músculo a la vez' },
  { id: 'fuerza',        nombre: 'Ganar fuerza',    icon: '🏋️', desc: 'Pesos máximos, reps bajas' },
]

export const NIVELES = [
  { id: 'principiante', nombre: 'Principiante', icon: '🌱', desc: 'Menos de 1 año entrenando' },
  { id: 'intermedio',   nombre: 'Intermedio',   icon: '⚡', desc: '1 a 3 años entrenando' },
  { id: 'avanzado',     nombre: 'Avanzado',     icon: '🏆', desc: 'Más de 3 años entrenando' },
]

// ── Volumen semanal por grupo muscular (series/semana) ────────────────────────
// Fuente: RP Strength + NIH review (≥10 sets/muscle/week para maximizar hipertrofia)
const VOL = {
  principiante: { mev: 6,  mav: 12, mrv: 16 },
  intermedio:   { mev: 10, mav: 16, mrv: 20 },
  avanzado:     { mev: 12, mav: 18, mrv: 22 },
}

// ── Parámetros de entrenamiento por objetivo × nivel ─────────────────────────
// Fuente: Arvo periodization guide + RP principles
const PARAMS = {
  perder: {
    principiante: { series: 3, reps: '12-15', rir: 3, deloadSemanas: 6, ciclo: 'hiper',   cardioSemana: 3, intensidad: '55-65% 1RM' },
    intermedio:   { series: 3, reps: '12-15', rir: 2, deloadSemanas: 5, ciclo: 'hiper',   cardioSemana: 4, intensidad: '60-70% 1RM' },
    avanzado:     { series: 4, reps: '10-15', rir: 2, deloadSemanas: 4, ciclo: 'volumen', cardioSemana: 4, intensidad: '60-72% 1RM' },
  },
  ganar: {
    principiante: { series: 3, reps: '8-12',  rir: 3, deloadSemanas: 6, ciclo: 'hiper',   cardioSemana: 1, intensidad: '65-75% 1RM' },
    intermedio:   { series: 4, reps: '8-12',  rir: 2, deloadSemanas: 5, ciclo: 'hiper',   cardioSemana: 2, intensidad: '65-75% 1RM' },
    avanzado:     { series: 4, reps: '6-12',  rir: 2, deloadSemanas: 4, ciclo: 'volumen', cardioSemana: 2, intensidad: '67-77% 1RM' },
  },
  recomposicion: {
    principiante: { series: 3, reps: '10-15', rir: 3, deloadSemanas: 6, ciclo: 'hiper',   cardioSemana: 2, intensidad: '60-70% 1RM' },
    intermedio:   { series: 3, reps: '8-15',  rir: 2, deloadSemanas: 5, ciclo: 'hiper',   cardioSemana: 3, intensidad: '62-72% 1RM' },
    avanzado:     { series: 4, reps: '8-12',  rir: 2, deloadSemanas: 4, ciclo: 'volumen', cardioSemana: 3, intensidad: '65-75% 1RM' },
  },
  fuerza: {
    principiante: { series: 3, reps: '5-8',   rir: 3, deloadSemanas: 6, ciclo: 'fuerza',  cardioSemana: 1, intensidad: '75-82% 1RM' },
    intermedio:   { series: 4, reps: '4-6',   rir: 2, deloadSemanas: 5, ciclo: 'fuerza',  cardioSemana: 1, intensidad: '78-87% 1RM' },
    avanzado:     { series: 5, reps: '3-6',   rir: 1, deloadSemanas: 4, ciclo: 'fuerza',  cardioSemana: 1, intensidad: '80-90% 1RM' },
  },
}

// ── Progresión de carga por nivel ─────────────────────────────────────────────
// Fuente: Starting Strength + ACSM Progression Models
// Principiante: progresa cada sesión / semana
// Intermedio: progresa cada 2-3 semanas
// Avanzado: progresa cada 4-6 semanas
const PROGRESION = {
  principiante: { compuestos: 2.5, aislamientos: 1.25, repsParaSubir: 2, semanasParaSubir: 1 },
  intermedio:   { compuestos: 1.25, aislamientos: 0.5,  repsParaSubir: 3, semanasParaSubir: 2 },
  avanzado:     { compuestos: 0.5,  aislamientos: 0.25, repsParaSubir: 4, semanasParaSubir: 4 },
}

// Músculos compuestos (movimientos multiarticulares)
const COMPUESTOS = ['Pecho', 'Espalda', 'Pierna', 'Hombros']

// ── Función principal: genera todas las recomendaciones ───────────────────────
export function generarRecomendaciones({ objetivo, nivel, semanasCiclo, registros, histPeso, actividades, DIAS }) {
  const obj = objetivo || 'recomposicion'
  const niv = nivel || 'intermedio'
  const params = PARAMS[obj]?.[niv] || PARAMS.recomposicion.intermedio
  const prog   = PROGRESION[niv] || PROGRESION.intermedio
  const vol    = VOL[niv] || VOL.intermedio

  const recomendaciones = {}

  // ── Sugerencia de peso por ejercicio ────────────────────────────────────────
  if (DIAS) {
    for (const dia of DIAS) {
      for (const ej of (dia.ejercicios || [])) {
        recomendaciones[ej.id] = calcularSugerenciaEjercicio(ej, registros, prog, params)
      }
    }
  }

  // ── Análisis de volumen semanal por grupo muscular ───────────────────────────
  const volumenMuscular = calcularVolumenMuscular(DIAS, registros)

  // ── Alertas ──────────────────────────────────────────────────────────────────
  const alertas = generarAlertas({ semanasCiclo, params, volumenMuscular, vol, registros, DIAS, actividades, obj })

  // ── Ciclo recomendado ────────────────────────────────────────────────────────
  const cicloRecomendado = calcularCicloRecomendado({ semanasCiclo, params, obj, niv, volumenMuscular, vol })

  return {
    params,
    prog,
    vol,
    recomendaciones,
    volumenMuscular,
    alertas,
    cicloRecomendado,
  }
}

// ── Sugerencia de peso/carga para un ejercicio ────────────────────────────────
function calcularSugerenciaEjercicio(ej, registros, prog, params) {
  const ejReg = registros[ej.id]
  const historialRaw = ejReg
    ? Object.entries(ejReg).sort(([a], [b]) => fechaADate(a) - fechaADate(b))
    : []

  // Construir historial reciente para mostrar en UI (últimas 4 sesiones)
  const historialReciente = historialRaw.slice(-4).map(([fecha, series]) => {
    if (ej.tipo === 'peso' || ej.tipo === 'kg') {
      const kg = Number(series.s1) || null
      return { fecha, display: kg ? `${kg}kg` : '-' , valor: kg }
    }
    if (ej.tipo === 'peso_reps') {
      const [kg, reps] = (series.s1 || '').split('|')
      return { fecha, display: kg && reps ? `${kg}kg×${reps}` : '-', valor: Number(kg) || null }
    }
    if (ej.tipo === 'reps') {
      const r = Number(series.s1) || null
      return { fecha, display: r ? `${r} reps` : '-', valor: r }
    }
    if (ej.tipo === 'tiempo') {
      const s = Number(series.s1) || null
      return { fecha, display: s ? `${s}s` : '-', valor: s }
    }
    return { fecha, display: '-', valor: null }
  })

  const sinDatos = { pesoSugerido: null, estado: 'sin_datos', mensaje: null, historialReciente }

  if (historialRaw.length < 1) return sinDatos

  const esCompuesto = COMPUESTOS.includes(ej.musculo)
  const incremento = esCompuesto ? prog.compuestos : prog.aislamientos
  const ultimaSesion = historialRaw.at(-1)?.[1]

  // ── Ejercicios con peso libre (peso y kg son equivalentes) ──────────────────
  if (ej.tipo === 'peso' || ej.tipo === 'kg') {
    const ultimoPeso = Number(ultimaSesion?.s1) || 0
    if (!ultimoPeso) return { ...sinDatos, mensaje: null }

    const estancado = historialRaw.length >= 3 && detectarEstancamiento(historialRaw, 'kg')
    if (estancado) {
      return { pesoSugerido: ultimoPeso, estado: 'estancado', mensaje: `Sin progreso reciente. Intenta ${ultimoPeso}kg con mejor técnica.`, historialReciente }
    }
    const nuevoPeso = +(ultimoPeso + incremento).toFixed(2)
    return { pesoSugerido: nuevoPeso, estado: 'subir_peso', mensaje: `Sube a ${nuevoPeso}kg esta sesión`, historialReciente }
  }

  // ── Peso + reps (doble progresión) ──────────────────────────────────────────
  if (ej.tipo === 'peso_reps') {
    const ultimoPeso = Number(ultimaSesion?.s1?.split('|')[0]) || 0
    const ultimasReps = Number(ultimaSesion?.s1?.split('|')[1]) || 0
    if (!ultimoPeso) return { ...sinDatos, mensaje: null }

    const [repsMin, repsMax] = String(params.reps).includes('-')
      ? params.reps.split('-').map(Number)
      : [Number(params.reps) - 2, Number(params.reps)]

    const estancado = historialRaw.length >= 3 && detectarEstancamiento(historialRaw, ej.tipo)
    if (estancado) {
      return { pesoSugerido: ultimoPeso, estado: 'estancado', mensaje: `Sin progreso reciente. Intenta mejorar la técnica o cambia el ejercicio.`, historialReciente }
    }
    if (ultimasReps >= repsMax) {
      const nuevoPeso = +(ultimoPeso + incremento).toFixed(2)
      return { pesoSugerido: nuevoPeso, estado: 'subir_peso', repsObjetivo: repsMin, mensaje: `¡${repsMax} reps! → Sube a ${nuevoPeso}kg y apunta a ${repsMin} reps`, historialReciente }
    }
    return { pesoSugerido: ultimoPeso, estado: 'mantener', repsObjetivo: ultimasReps + 1, mensaje: `Mismo peso (${ultimoPeso}kg), intenta ${ultimasReps + 1} reps`, historialReciente }
  }

  // ── Solo reps ────────────────────────────────────────────────────────────────
  if (ej.tipo === 'reps') {
    const ultimasReps = Number(ultimaSesion?.s1) || 0
    if (!ultimasReps) return sinDatos
    return { pesoSugerido: null, estado: 'mantener', repsObjetivo: ultimasReps + prog.repsParaSubir, mensaje: `Intenta ${ultimasReps + prog.repsParaSubir} reps (último: ${ultimasReps})`, historialReciente }
  }

  // ── Tiempo ───────────────────────────────────────────────────────────────────
  if (ej.tipo === 'tiempo') {
    const ultimoTiempo = Number(ultimaSesion?.s1) || 0
    if (!ultimoTiempo) return sinDatos
    const objetivo = ultimoTiempo + 5
    return { pesoSugerido: null, estado: 'mantener', mensaje: `Intenta aguantar ${objetivo}s (último: ${ultimoTiempo}s)`, historialReciente }
  }

  return sinDatos
}

// ── Detectar estancamiento (2+ sesiones sin mejora) ──────────────────────────
function detectarEstancamiento(historial, tipo) {
  if (historial.length < 3) return false
  const ultimas = historial.slice(-3)

  if (tipo === 'peso_reps') {
    const pesos = ultimas.map(([, s]) => Number(s.s1?.split('|')[0]) || 0)
    return pesos[2] <= pesos[0] && pesos[2] <= pesos[1]
  }
  if (tipo === 'kg') {
    const pesos = ultimas.map(([, s]) => Number(s.s1) || 0)
    return pesos[2] <= pesos[0] && pesos[2] <= pesos[1]
  }
  return false
}

// ── Volumen por grupo muscular (series/semana últimas 2 semanas) ──────────────
function calcularVolumenMuscular(DIAS, registros) {
  if (!DIAS) return {}
  const hoy = new Date()
  const hace14dias = new Date(hoy); hace14dias.setDate(hoy.getDate() - 14)

  const resultado = {}
  for (const dia of DIAS) {
    for (const ej of (dia.ejercicios || [])) {
      if (!registros[ej.id]) continue
      const musculo = ej.musculo || 'Otros'
      const series = Object.entries(registros[ej.id])
        .filter(([fecha]) => fechaADate(fecha) >= hace14dias)
        .reduce((sum, [, s]) => sum + Object.keys(s).length, 0)

      resultado[musculo] = (resultado[musculo] || 0) + series
    }
  }
  // Normalizar a semana (dividir por 2 porque son 2 semanas)
  return Object.fromEntries(Object.entries(resultado).map(([k, v]) => [k, Math.round(v / 2)]))
}

// ── Ciclo recomendado según semanas + objetivo + volumen ──────────────────────
function calcularCicloRecomendado({ semanasCiclo, params, obj, niv, volumenMuscular, vol }) {
  const totalSeries = Object.values(volumenMuscular).reduce((s, v) => s + v, 0)
  const promedioSeries = totalSeries / (Object.keys(volumenMuscular).length || 1)

  // Semana de deload
  if (semanasCiclo >= params.deloadSemanas) {
    return { id: 'deload', razon: `Llevas ${semanasCiclo} semanas. Es momento de hacer deload (reducción 40-50% volumen).` }
  }

  // Si el volumen está por encima del MRV → deload anticipado
  if (promedioSeries > vol.mrv) {
    return { id: 'deload', razon: `Volumen muy alto (${Math.round(promedioSeries)} series/sem > MRV ${vol.mrv}). Deload necesario.` }
  }

  // Semanas 1-2: acumulación (volumen)
  if (semanasCiclo <= 2 && (obj === 'ganar' || obj === 'recomposicion')) {
    return { id: params.ciclo, razon: `Fase de acumulación (semana ${semanasCiclo}/${params.deloadSemanas}). Enfoca en volumen.` }
  }

  // Semanas 3-4: intensificación → fuerza
  if (semanasCiclo >= 3 && semanasCiclo < params.deloadSemanas && obj === 'ganar') {
    return { id: 'fuerza', razon: `Semana ${semanasCiclo}: cambia a fase de intensificación (cargas más altas, menos series).` }
  }

  return { id: params.ciclo, razon: `Ciclo óptimo para tu objetivo de ${obj}.` }
}

// ── Generar alertas de entrenamiento ─────────────────────────────────────────
function generarAlertas({ semanasCiclo, params, volumenMuscular, vol, registros, DIAS, actividades, obj }) {
  const alertas = []

  // Alerta deload
  if (semanasCiclo >= params.deloadSemanas) {
    alertas.push({
      tipo: 'deload',
      prioridad: 'alta',
      titulo: '⚡ Semana de descarga recomendada',
      desc: `Llevas ${semanasCiclo} sem. seguidas. Reduce 40-50% el volumen esta semana para evitar sobreentrenamiento y potenciar las ganancias.`,
    })
  }

  // Alerta ejercicios estancados
  if (DIAS && registros) {
    for (const dia of DIAS) {
      for (const ej of (dia.ejercicios || [])) {
        if (ej.tipo !== 'peso_reps' && ej.tipo !== 'kg') continue
        const hist = Object.entries(registros[ej.id] || {}).sort(([a], [b]) => fechaADate(a) - fechaADate(b))
        if (hist.length >= 3 && detectarEstancamiento(hist, ej.tipo)) {
          alertas.push({
            tipo: 'plateau',
            prioridad: 'media',
            ejId: ej.id,
            ejNombre: ej.nombre,
            ejMusculo: ej.musculo,
            titulo: `⚠️ Estancamiento: ${ej.nombre}`,
            desc: `Sin progreso en las últimas 3 sesiones. Considera cambiar el ángulo, el ejercicio alternativo, o añadir una técnica de intensidad.`,
          })
        }
      }
    }
  }

  // Alerta volumen bajo por grupo muscular
  for (const [musculo, series] of Object.entries(volumenMuscular)) {
    if (series < vol.mev) {
      alertas.push({
        tipo: 'volumen_bajo',
        prioridad: 'baja',
        musculo,
        titulo: `📉 Poco volumen: ${musculo}`,
        desc: `Solo ${series} series/sem (mínimo efectivo: ${vol.mev}). Añade 1-2 series o un ejercicio extra.`,
      })
    }
  }

  // Alerta cardio bajo (objetivo perder grasa)
  if (obj === 'perder' || obj === 'recomposicion') {
    const hoy = new Date()
    const hace7 = new Date(hoy); hace7.setDate(hoy.getDate() - 7)
    const cardioSemana = (actividades || []).filter(a => {
      const d = fechaADate(a.fecha)
      return d >= hace7 && ['correr', 'bici', 'eliptica', 'nadar', 'caminar'].includes(a.tipo)
    }).length
    const cardioRecomendado = params.cardioSemana
    if (cardioSemana < cardioRecomendado) {
      alertas.push({
        tipo: 'cardio_bajo',
        prioridad: 'media',
        titulo: `🏃 Cardio insuficiente esta semana`,
        desc: `${cardioSemana}/${cardioRecomendado} sesiones de cardio. Para tu objetivo, añade ${cardioRecomendado - cardioSemana} sesión(es) más.`,
      })
    }
  }

  return alertas
}

// ── Generar plan de nutrición basado en objetivo ──────────────────────────────
// Fuente: Body recomposition research + RP nutrition guidelines
export function calcularNutricionObjetivo({ objetivo, tdee, peso }) {
  if (!tdee || !peso) return null

  const proteinaG = Math.round(peso * 2.0) // 2g/kg para todos los objetivos

  if (objetivo === 'perder') {
    const kcal = tdee - 400  // Déficit moderado (-400 kcal) para perder ~0.4kg/sem
    return { kcal, proteinaG, razon: 'Déficit de 400 kcal para pérdida de grasa preservando músculo', ritmo: '~0.4 kg/semana' }
  }
  if (objetivo === 'ganar') {
    const kcal = tdee + 300  // Superávit limpio (+300 kcal)
    return { kcal, proteinaG, razon: 'Superávit limpio de 300 kcal para maximizar ganancia muscular', ritmo: '~0.25 kg/semana' }
  }
  if (objetivo === 'recomposicion') {
    // Cycling: días de entreno ligeramente por encima, días de descanso ligeramente por debajo
    const kcalEntreno = tdee + 100
    const kcalDescanso = tdee - 300
    return { kcal: tdee, kcalEntreno, kcalDescanso, proteinaG, razon: 'Mantenimiento con ciclado calórico (+100 entreno / -300 descanso)', ritmo: 'Lento (meses)' }
  }
  if (objetivo === 'fuerza') {
    const kcal = tdee + 200
    return { kcal, proteinaG, razon: 'Superávit leve para soportar el entrenamiento de fuerza máxima', ritmo: '~0.15 kg/semana' }
  }
  return null
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fechaADate(fechaStr) {
  // Soporta "DD/MM/YYYY" y "YYYY-MM-DD"
  if (!fechaStr) return 0
  if (fechaStr.includes('/')) {
    const [d, m, y] = fechaStr.split('/')
    return new Date(y, m - 1, d).getTime()
  }
  return new Date(fechaStr).getTime()
}

export { VOL, PARAMS, PROGRESION }
