// ─── REGISTRO DE SERIES Y MARCAS PERSONALES ──────────────────────────────────
// Formato nuevo de cada serie: { kg, reps, seg, ok }
// Formatos antiguos soportados (strings): "80" · "80|10" · "12" · "30"

export function fechaKey(d = new Date()) {
  return d.toLocaleDateString('es-ES')
}

export function fechaADate(fechaStr) {
  if (!fechaStr) return 0
  if (fechaStr.includes('/')) {
    const [d, m, y] = fechaStr.split('/').map(Number)
    return new Date(y, m - 1, d).getTime()
  }
  return new Date(fechaStr).getTime()
}

const num = v => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v))

// Normaliza una serie (nueva u antigua) según la métrica del ejercicio
export function parseSerie(raw, metrica = 'kg_reps') {
  if (raw == null || raw === '') return { kg: null, reps: null, seg: null, ok: false }
  if (typeof raw === 'object') {
    return { kg: num(raw.kg), reps: num(raw.reps), seg: num(raw.seg), ok: !!raw.ok }
  }
  const s = String(raw)
  if (s.includes('|')) {
    const [kg, reps] = s.split('|')
    return { kg: num(kg), reps: num(reps), seg: null, ok: true }
  }
  const n = num(s)
  if (metrica === 'seg')  return { kg: null, reps: null, seg: n, ok: n != null }
  if (metrica === 'reps') return { kg: null, reps: n, seg: null, ok: n != null }
  return { kg: n, reps: null, seg: null, ok: n != null }
}

export function serieTieneDatos(s) {
  return s.kg != null || s.reps != null || s.seg != null
}

// 1RM estimado (Epley). Solo fiable hasta ~12 reps; por encima se limita.
export function e1RM(kg, reps) {
  if (!kg) return 0
  if (!reps || reps <= 1) return kg
  return +(kg * (1 + Math.min(reps, 12) / 30)).toFixed(1)
}

// Puntuación de una serie para comparar cuál es la "mejor" (top set)
export function puntuacion(s, metrica) {
  if (metrica === 'seg') return (s.seg || 0) + (s.kg || 0) / 100
  if (metrica === 'reps') return s.kg ? e1RM(s.kg, s.reps) * 1000 + (s.reps || 0) : (s.reps || 0)
  return s.reps ? e1RM(s.kg, s.reps) : (s.kg || 0)
}

// Series válidas de una sesión, en orden
export function seriesSesion(sesion = {}, metrica) {
  return Object.entries(sesion)
    .filter(([k]) => /^s\d+$/.test(k))
    .sort(([a], [b]) => Number(a.slice(1)) - Number(b.slice(1)))
    .map(([k, v]) => ({ n: Number(k.slice(1)), ...parseSerie(v, metrica) }))
    .filter(serieTieneDatos)
}

// Mejor serie de la sesión (cualquier serie, no solo la primera)
export function mejorSerie(sesion, metrica) {
  const ss = seriesSesion(sesion, metrica)
  if (!ss.length) return null
  return ss.reduce((best, s) => (puntuacion(s, metrica) > puntuacion(best, metrica) ? s : best))
}

// Historial ordenado cronológicamente: [[fecha, sesion], ...]
export function historialOrdenado(regEj = {}, { excluir } = {}) {
  return Object.entries(regEj)
    .filter(([f, ses]) => f !== excluir && ses && Object.keys(ses).length)
    .sort(([a], [b]) => fechaADate(a) - fechaADate(b))
}

// Marcas personales considerando TODAS las series de TODAS las sesiones
export function calcularPRs(regEj = {}, metrica = 'kg_reps', { excluir } = {}) {
  const pr = { maxKg: 0, maxE1RM: 0, maxReps: 0, maxSeg: 0, maxVolumenSesion: 0, fechaMaxKg: null, fechaE1RM: null }
  for (const [fecha, ses] of historialOrdenado(regEj, { excluir })) {
    let vol = 0
    for (const s of seriesSesion(ses, metrica)) {
      if ((s.kg || 0) > pr.maxKg) { pr.maxKg = s.kg; pr.fechaMaxKg = fecha }
      const est = e1RM(s.kg, s.reps)
      if (est > pr.maxE1RM) { pr.maxE1RM = est; pr.fechaE1RM = fecha }
      if ((s.reps || 0) > pr.maxReps) pr.maxReps = s.reps
      if ((s.seg || 0) > pr.maxSeg) pr.maxSeg = s.seg
      vol += (s.kg || 0) * (s.reps || 0)
    }
    if (vol > pr.maxVolumenSesion) pr.maxVolumenSesion = vol
  }
  return pr
}

// ¿Esta serie bate alguna marca previa? Devuelve etiquetas de PR
export function prsDeSerie(s, prPrevio, metrica) {
  if (!s || !serieTieneDatos(s)) return []
  const out = []
  if (metrica === 'seg') {
    if (s.seg && s.seg > prPrevio.maxSeg && prPrevio.maxSeg > 0) out.push('tiempo')
    return out
  }
  if (metrica === 'reps' && !s.kg) {
    if (s.reps && s.reps > prPrevio.maxReps && prPrevio.maxReps > 0) out.push('reps')
    return out
  }
  if (s.kg && s.kg > prPrevio.maxKg && prPrevio.maxKg > 0) out.push('peso')
  const est = e1RM(s.kg, s.reps)
  if (s.reps && est > prPrevio.maxE1RM && prPrevio.maxE1RM > 0) out.push('1RM')
  return out
}

export function formatSerie(s, metrica) {
  if (!s) return '—'
  if (metrica === 'seg') return s.seg ? `${s.seg}s${s.kg ? ` +${s.kg}kg` : ''}` : '—'
  if (metrica === 'reps') return s.reps ? `${s.kg ? `+${s.kg}kg × ` : ''}${s.reps}` : '—'
  if (s.kg && s.reps) return `${s.kg}kg × ${s.reps}`
  if (s.kg) return `${s.kg}kg`
  if (s.reps) return `${s.reps} reps`
  return '—'
}

export function volumenSesion(sesion, metrica) {
  return seriesSesion(sesion, metrica).reduce((v, s) => v + (s.kg || 0) * (s.reps || 0), 0)
}

// Rango de reps "8–12" | "8-12" | "12" | "12 (50% peso)" → [min, max]
export function rangoReps(reps) {
  const s = String(reps || '')
  const m = s.match(/(\d+)\s*[–-]\s*(\d+)/)
  if (m) return [Number(m[1]), Number(m[2])]
  const n = s.match(/\d+/)
  return n ? [Number(n[0]), Number(n[0])] : [8, 12]
}

// Descanso recomendado (segundos) según ciclo y tipo de ejercicio
export function descansoRecomendado(cicloId, esPrincipal) {
  if (cicloId === 'fuerza')     return esPrincipal ? 180 : 120
  if (cicloId === 'definicion') return 45
  if (cicloId === 'deload')     return 60
  return esPrincipal ? 120 : 90
}
