import { historialOrdenado, mejorSerie, seriesSesion, puntuacion, formatSerie, rangoReps, fechaADate } from './training.js'

// ─── MOTOR DE REGLAS DE ENTRENAMIENTO ────────────────────────────────────────

// Normaliza etiquetas de músculo específicas a grupos principales para MEV/MRV
const GRUPO_MUSCULAR = {
  'Pecho': ['pecho', 'chest'],
  'Espalda': ['espalda', 'dorsal', 'trapecio', 'back', 'lumbar', 'rotadores'],
  'Hombros': ['hombro', 'deltoides', 'shoulder'],
  'Bíceps': ['bíceps', 'biceps', 'braquial'],
  'Tríceps': ['tríceps', 'triceps'],
  'Pierna': ['cuádriceps', 'cuadriceps', 'isquio', 'gemelo', 'glúteo', 'gluteo', 'pierna', 'calf', 'leg'],
  'Core': ['core', 'abdomen', 'abdominal', 'oblicuo'],
}
export function normalizarMusculo(label) {
  if (!label) return 'Otros'
  const l = label.toLowerCase()
  for (const [grupo, keys] of Object.entries(GRUPO_MUSCULAR)) {
    if (keys.some(k => l.includes(k))) return grupo
  }
  return 'Otros'
}
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
// Mantener para compatibilidad con lógica de nivel (escala global)
const VOL = {
  principiante: { mev: 6,  mav: 12, mrv: 16 },
  intermedio:   { mev: 10, mav: 16, mrv: 20 },
  avanzado:     { mev: 12, mav: 18, mrv: 22 },
}

// ── MEV / MAV / MRV por grupo muscular — RP Strength 2024 ─────────────────────
// Más precisos que el volumen global: cada músculo tiene diferente capacidad de recuperación
// Fuente: rpstrength.com/blogs/articles/training-volume-landmarks-muscle-growth
const VOL_MUSCULO = {
  Pierna:   { mev: 8,  mav: 15, mrv: 22 },  // cuádriceps + isquio + glúteos juntos
  Espalda:  { mev: 8,  mav: 17, mrv: 25 },
  Pecho:    { mev: 8,  mav: 15, mrv: 22 },
  Hombros:  { mev: 6,  mav: 15, mrv: 20 },
  Bíceps:   { mev: 4,  mav: 11, mrv: 20 },
  Tríceps:  { mev: 4,  mav: 12, mrv: 18 },
  Core:     { mev: 4,  mav: 10, mrv: 16 },
  Otros:    { mev: 4,  mav: 10, mrv: 16 },
}

// Para mujeres: glúteos necesitan volumen extra (MEV más alto, MAV más amplio)
// Fuente: Gluteus Maximus Hypertrophy systematic review — PMC12018462
const VOL_MUSCULO_MUJER = {
  ...VOL_MUSCULO,
  Pierna: { mev: 10, mav: 16, mrv: 22 },  // +2 sets MEV por prioridad glúteo-isquio
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
export function generarRecomendaciones({ objetivo, nivel, semanasCiclo, registros, histPeso, actividades, DIAS, seriesExtra, perfilFisico, sexo, hoy }) {
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
        recomendaciones[ej.regId || ej.id] = calcularSugerenciaEjercicio(ej, registros, prog, params, { hoy })
      }
    }
  }

  // ── Análisis de volumen semanal (solo informativo, no genera alertas) ─────────
  const volumenMuscular = calcularVolumenMuscular(DIAS, registros, {})

  // ── Alertas (solo sobre comportamiento del usuario, no sobre el diseño) ────────
  const alertas = generarAlertas({ semanasCiclo, params, registros, DIAS, actividades, obj, perfilFisico })

  // ── Progresos — lo que el usuario está listo para mejorar ──────────────────
  const progresos = generarProgresos({ recomendaciones, nivel: niv, registros, DIAS })

  // ── Ciclo recomendado ────────────────────────────────────────────────────────
  const cicloRecomendado = calcularCicloRecomendado({ semanasCiclo, params, obj, niv, volumenMuscular, vol })

  return {
    params,
    prog,
    vol,
    recomendaciones,
    volumenMuscular,
    alertas,
    progresos,
    cicloRecomendado,
  }
}

// ── Sugerencia de carga para un ejercicio (doble progresión) ───────────────────
// Usa TODAS las series de cada sesión (no solo la primera) y la clave del
// ejercicio realmente realizado (ej.regId), de modo que alternativas y
// rotaciones llevan su propio progreso.
export function calcularSugerenciaEjercicio(ej, registros, prog, params, { hoy } = {}) {
  const regId = ej.regId || ej.id
  const metrica = ej.metrica || 'kg_reps'
  const hist = historialOrdenado(registros[regId], { excluir: hoy })

  const historialReciente = hist.slice(-4).map(([fecha, ses]) => {
    const top = mejorSerie(ses, metrica)
    return { fecha, display: formatSerie(top, metrica), valor: top ? puntuacion(top, metrica) : null }
  })
  const sinDatos = { kgObjetivo: null, repsObjetivo: null, estado: 'sin_datos', mensaje: null, historialReciente }
  if (!hist.length) return sinDatos

  const [repsMin, repsMax] = rangoReps(ej.reps)
  const ultima = seriesSesion(hist.at(-1)[1], metrica)
  if (!ultima.length) return sinDatos
  const top = mejorSerie(hist.at(-1)[1], metrica)
  const estancado = hist.length >= 3 && detectarEstancamiento(hist, metrica)

  // ── Isométricos ──
  if (metrica === 'seg') {
    const obj = (top.seg || 0) + 5
    return { kgObjetivo: top.kg || null, segObjetivo: obj, estado: 'mantener', mensaje: `Aguanta ${obj}s por serie (mejor: ${top.seg}s)`, historialReciente }
  }

  // ── Peso corporal (+ lastre opcional) ──
  if (metrica === 'reps') {
    const todasMax = ultima.every(s => (s.reps || 0) >= repsMax)
    if (todasMax && repsMax > 0) {
      const lastre = +((top.kg || 0) + Math.max(prog.aislamientos * 2, 2.5)).toFixed(2)
      return { kgObjetivo: lastre, repsObjetivo: repsMin, estado: 'subir_peso', mensaje: `¡${repsMax} reps en todas las series! Añade lastre: +${lastre}kg × ${repsMin}`, historialReciente }
    }
    const objetivo = Math.min((top.reps || 0) + 1, Math.max(repsMax, (top.reps || 0) + 1))
    return { kgObjetivo: top.kg || null, repsObjetivo: objetivo, estado: estancado ? 'estancado' : 'mantener', mensaje: `Intenta ${objetivo} reps${top.kg ? ` con +${top.kg}kg` : ''} (mejor: ${top.reps})`, historialReciente }
  }

  // ── Peso + reps ──
  const esCompuesto = COMPUESTOS.includes(normalizarMusculo(ej.musculo))
  const incremento = esCompuesto ? Math.max(prog.compuestos, 2.5) : Math.max(prog.aislamientos * 2, 1) // salto mínimo realista de discos/mancuernas
  const kgTrabajo = Math.max(...ultima.map(s => s.kg || 0))
  if (!kgTrabajo) return sinDatos
  const seriesTrabajo = ultima.filter(s => (s.kg || 0) === kgTrabajo)
  const sinReps = seriesTrabajo.every(s => s.reps == null)

  if (sinReps) {
    return { kgObjetivo: kgTrabajo, repsObjetivo: repsMin, estado: 'mantener', mensaje: `Usa ${kgTrabajo}kg y apunta las reps de cada serie para saber cuándo subir`, historialReciente }
  }
  if (estancado) {
    return { kgObjetivo: kgTrabajo, repsObjetivo: repsMin, estado: 'estancado', mensaje: `Sin progreso en 3 sesiones. Prueba una alternativa o baja a ${+(kgTrabajo * 0.9).toFixed(1)}kg y vuelve a subir`, historialReciente }
  }
  const completas = seriesTrabajo.length >= Math.min(ej.series || 1, ultima.length) && seriesTrabajo.every(s => (s.reps || 0) >= repsMax)
  if (completas) {
    const nuevo = +(kgTrabajo + incremento).toFixed(2)
    return { kgObjetivo: nuevo, repsObjetivo: repsMin, estado: 'subir_peso', mensaje: `¡${repsMax} reps en todas las series! Sube a ${nuevo}kg × ${repsMin}`, historialReciente }
  }
  const minReps = Math.min(...seriesTrabajo.map(s => s.reps || 0))
  const objetivo = Math.min(Math.max(minReps + 1, repsMin), repsMax)
  return { kgObjetivo: kgTrabajo, repsObjetivo: objetivo, estado: 'mantener', mensaje: `Mismo peso (${kgTrabajo}kg), busca ${objetivo} reps en cada serie`, historialReciente }
}

// ── Estancamiento: el mejor set (1RM estimado) no mejora en 3 sesiones ─────────
export function detectarEstancamiento(historial, metrica = 'kg_reps') {
  if (historial.length < 3) return false
  const vals = historial.slice(-3).map(([, ses]) => {
    const top = mejorSerie(ses, metrica)
    return top ? puntuacion(top, metrica) : 0
  })
  return vals[2] > 0 && vals[2] <= vals[0] && vals[2] <= vals[1]
}

// ── Volumen por grupo muscular ────────────────────────────────────────────────
// Usa el PLAN (series programadas) como base real; añade lo registrado si hay
// datos suficientes (≥7 días de historial). Así las alertas reflejan la rutina
// diseñada, no solo lo que el usuario ha registrado hasta ahora.
function calcularVolumenMuscular(DIAS, registros, seriesExtra = {}) {
  if (!DIAS) return {}

  // Volumen planificado (lo que dice la rutina, agrupado por grupo muscular principal)
  const planificado = {}
  for (const dia of DIAS) {
    for (const ej of (dia.ejercicios || [])) {
      const grupo = normalizarMusculo(ej.musculo)
      // seriesExtra puede estar keyed por etiqueta específica o por grupo
      const extra = seriesExtra[ej.musculo] || seriesExtra[grupo] || 0
      planificado[grupo] = (planificado[grupo] || 0) + ej.series + extra
    }
  }

  // Volumen registrado en últimas 2 semanas (también agrupado)
  const hoy = new Date()
  const hace14dias = new Date(hoy); hace14dias.setDate(hoy.getDate() - 14)
  const registrado = {}
  for (const dia of DIAS) {
    for (const ej of (dia.ejercicios || [])) {
      const rid = ej.regId || ej.id
      if (!registros[rid]) continue
      const grupo = normalizarMusculo(ej.musculo)
      const series = Object.entries(registros[rid])
        .filter(([fecha]) => fechaADate(fecha) >= hace14dias)
        .reduce((sum, [, s]) => sum + Object.keys(s).length, 0)
      registrado[grupo] = (registrado[grupo] || 0) + series
    }
  }

  // Si hay suficientes datos reales (≥5 series registradas en algún músculo),
  // promediamos plan + datos normalizados a semana; si no, usamos el plan.
  const totalRegistrado = Object.values(registrado).reduce((a, b) => a + b, 0)
  if (totalRegistrado >= 5) {
    const normalizado = Object.fromEntries(Object.entries(registrado).map(([k, v]) => [k, Math.round(v / 2)]))
    return Object.fromEntries(
      Object.keys({ ...planificado, ...normalizado }).map(k => [
        k, Math.max(planificado[k] || 0, normalizado[k] || 0)
      ])
    )
  }

  return planificado
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

// ── Alertas basadas en comportamiento del usuario (NO sobre el diseño de la rutina) ──
// La rutina ya está diseñada correctamente. Las alertas son solo sobre lo que el usuario hace.
function generarAlertas({ semanasCiclo, params, registros, DIAS, actividades, obj, perfilFisico }) {
  const alertas = []

  // Info: adaptaciones aplicadas al perfil (informativo, no un problema)
  if (perfilFisico?.tieneDatos) {
    const { zonaEdad, zonaBmi, bmi, edad } = perfilFisico
    if (zonaEdad === 'senior_plus') {
      alertas.push({ tipo: 'perfil_edad', prioridad: 'info',
        titulo: '🦴 Rutina adaptada para 70+ años',
        desc: `Con ${edad} años, tu rutina usa cargas del 50-70% 1RM, reps en zona 12-20 y ejercicios sin carga axial espinal (ACSM 2026).`,
      })
    } else if (zonaEdad === 'senior') {
      alertas.push({ tipo: 'perfil_edad', prioridad: 'info',
        titulo: '🦴 Rutina adaptada para 60-69 años',
        desc: `Los ejercicios con barra han sido sustituidos por mancuernas y máquinas. RIR≥3 en todos los ejercicios (ACSM + RP Strength).`,
      })
    } else if (zonaEdad === 'maduro') {
      alertas.push({ tipo: 'perfil_edad', prioridad: 'info',
        titulo: 'ℹ️ Rutina adaptada para 50-59 años',
        desc: `Ejercicios de alta carga axial sustituidos. Incrementos de carga al 2.5% (no 5%). Calienta 10 min antes de cada sesión.`,
      })
    }
    if (zonaBmi === 'obeso2') {
      alertas.push({ tipo: 'perfil_bmi', prioridad: 'info',
        titulo: `⚖️ Cardio adaptado (IMC ${bmi})`,
        desc: 'Cardio de alto impacto sustituido por bicicleta, remo o elíptica para proteger articulaciones (ACSM).',
      })
    } else if (zonaBmi === 'obeso1') {
      alertas.push({ tipo: 'perfil_bmi', prioridad: 'info',
        titulo: `⚖️ Rutina adaptada (IMC ${bmi})`,
        desc: 'Cardio de menor intensidad y preferencia por máquinas para menor impacto articular.',
      })
    }
  }

  // Acción recomendada: semana de descarga (basado en semanas acumuladas)
  if (semanasCiclo >= params.deloadSemanas) {
    alertas.push({
      tipo: 'deload', prioridad: 'alta',
      titulo: '⚡ Semana de descarga recomendada',
      desc: `Llevas ${semanasCiclo} semanas seguidas. Reduce el volumen esta semana para evitar sobreentrenamiento y potenciar las ganancias.`,
    })
  }

  // Basado en datos registrados: estancamiento real en peso/reps
  if (DIAS && registros) {
    for (const dia of DIAS) {
      for (const ej of (dia.ejercicios || [])) {
        if (ej.metrica === 'seg') continue
        const rid = ej.regId || ej.id
        const hist = historialOrdenado(registros[rid])
        if (hist.length >= 3 && detectarEstancamiento(hist, ej.metrica)) {
          alertas.push({
            tipo: 'plateau', prioridad: 'media',
            ejId: rid, slot: ej.slot, ejNombre: ej.nombre, ejMusculo: ej.musculo,
            titulo: `↔️ Estancamiento: ${ej.nombre}`,
            desc: `Tu mejor serie no ha mejorado en 3 sesiones. Cambia el ángulo de ataque: prueba el ejercicio alternativo o varía el rango de reps.`,
          })
        }
      }
    }
  }

  // Basado en comportamiento: cardio (solo si objetivo lo requiere)
  if (obj === 'perder' || obj === 'recomposicion') {
    const hoy = new Date()
    const hace7 = new Date(hoy); hace7.setDate(hoy.getDate() - 7)
    const cardioSemana = (actividades || []).filter(a => {
      const d = fechaADate(a.fecha)
      return d >= hace7 && ['correr', 'bici', 'eliptica', 'nadar', 'caminar'].includes(a.tipo)
    }).length
    if (cardioSemana < params.cardioSemana) {
      const faltan = params.cardioSemana - cardioSemana
      alertas.push({
        tipo: 'cardio_bajo', prioridad: 'media',
        titulo: '🏃 Cardio esta semana',
        desc: cardioSemana === 0
          ? `Tu objetivo es ${params.cardioSemana} sesiones de cardio esta semana (correr, bici, nadar…). Regístralas en la pestaña Entreno.`
          : `Llevas ${cardioSemana} de ${params.cardioSemana} sesiones de cardio esta semana. Te faltan ${faltan}.`,
      })
    }
  }

  return alertas
}

// ── Progresos del usuario — basados en datos reales registrados ───────────────
// Dice al usuario qué está listo para mejorar, no qué está mal
function generarProgresos({ recomendaciones, nivel, registros, DIAS }) {
  const progresos = []
  if (!recomendaciones || !DIAS) return progresos

  // Ejercicios con evidencia real de que están listos para más carga
  const listos = []
  for (const dia of DIAS) {
    for (const ej of (dia.ejercicios || [])) {
      const rec = recomendaciones[ej.regId || ej.id]
      if (rec?.estado === 'subir_peso') {
        listos.push({ ejId: ej.regId || ej.id, ejNombre: ej.nombre, pesoSugerido: rec.kgObjetivo, mensaje: rec.mensaje })
      }
    }
  }
  if (listos.length > 0) {
    progresos.push({
      tipo: 'subir_carga',
      titulo: `🏋️ ${listos.length} ejercicio${listos.length > 1 ? 's' : ''} listo${listos.length > 1 ? 's' : ''} para subir carga`,
      desc: listos.map(l => l.ejNombre).join(' · '),
      ejercicios: listos,
    })
  }

  // Recomendación de subir de nivel cuando el progreso lo justifica
  const subirNivel = detectarSubirNivel(recomendaciones, nivel, registros)
  if (subirNivel) {
    progresos.push({
      tipo: 'subir_nivel',
      titulo: '🏆 ¿Listo para el siguiente nivel?',
      desc: `En ${subirNivel.sesiones} sesiones registradas, el ${subirNivel.pct}% de tus ejercicios están progresando consistentemente. Considera subir a nivel ${subirNivel.siguienteLabel}.`,
      siguienteNivel: subirNivel.siguiente,
    })
  }

  return progresos
}

function detectarSubirNivel(recomendaciones, nivel, registros) {
  if (nivel === 'avanzado') return null
  const vals = Object.values(recomendaciones || {})
  if (vals.length < 4) return null
  const listos = vals.filter(r => r.estado === 'subir_peso').length
  const pct = Math.round(listos / vals.length * 100)
  if (pct < 50) return null

  // Contar sesiones únicas registradas como proxy de experiencia real
  const fechas = new Set()
  Object.values(registros || {}).forEach(ejReg => Object.keys(ejReg || {}).forEach(f => fechas.add(f)))
  if (fechas.size < 15) return null

  const siguiente = nivel === 'principiante' ? 'intermedio' : 'avanzado'
  const siguienteLabel = nivel === 'principiante' ? 'Intermedio' : 'Avanzado'
  return { siguiente, siguienteLabel, sesiones: fechas.size, pct }
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

export { VOL, PARAMS, PROGRESION }
