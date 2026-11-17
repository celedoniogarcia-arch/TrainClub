import { useState, useEffect, useRef, useCallback, useMemo, useId } from 'react'
import { CICLOS, PLATOS, PLATOS_PREPARADOS, AVATARS, getDiasCiclo, getPlatosByObjetivo, adaptarDiasAlPerfil, calcularPerfilFisico } from './data.js'
import { CATALOGO, alternativasDe, construirDiasVisibles, semanasHastaRotacion, bloqueDeFecha } from './catalogo.js'
import { fechaKey, parseSerie, serieTieneDatos, seriesSesion, mejorSerie, historialOrdenado, calcularPRs, prsDeSerie, formatSerie, volumenSesion, rangoReps, descansoRecomendado, evolucion, discosPorLado, calentamiento } from './training.js'
import { getProfiles, upsertProfile, deleteProfile, getUserData, saveUserData, getDieta, saveDieta } from './db.js'
import { OBJETIVOS, NIVELES, generarRecomendaciones, calcularNutricionObjetivo, normalizarMusculo, detectarEstancamiento } from './rulesEngine.js'
import { supabase, getSession, onAuthStateChange, signOut } from './supabase.js'
import { getQuoteOfDay } from './quotes.js'
import { pushSupported, subscribePush, unsubscribePush, getSubscription } from './pushService.js'
import { useSubscription } from './useSubscription.js'
import AuthScreen from './AuthScreen.jsx'
import Onboarding, { ONBOARDING_VERSION } from './Onboarding.jsx'

// ─── ACTIVIDADES EXTRA ───────────────────────────────────────────────────────

const ACTIVIDADES_EXTRA = [
  { id: 'correr',    nombre: 'Correr',     icon: '🏃', met: 9.0,  km: true  },
  { id: 'bici',      nombre: 'Bici',       icon: '🚴', met: 7.0,  km: true  },
  { id: 'padel',     nombre: 'Pádel',      icon: '🎾', met: 7.0,  km: false },
  { id: 'eliptica',  nombre: 'Elíptica',   icon: '⚡', met: 5.5,  km: false },
  { id: 'nadar',     nombre: 'Nadar',      icon: '🏊', met: 7.0,  km: false },
  { id: 'caminar',   nombre: 'Caminar',    icon: '🚶', met: 3.5,  km: true  },
  { id: 'futbol',    nombre: 'Fútbol',     icon: '⚽', met: 7.0,  km: false },
  { id: 'badminton', nombre: 'Bádminton',  icon: '🏸', met: 5.5,  km: false },
  { id: 'boxeo',     nombre: 'Boxeo',      icon: '🥊', met: 7.8,  km: false },
  { id: 'yoga',      nombre: 'Yoga',       icon: '🧘', met: 2.5,  km: false },
]

function calcKcalActividad(act, minutos, pesoKg = 75) {
  return Math.round(act.met * pesoKg * (minutos / 60))
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getWeekKey(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

// Mapeo índice JS (0=Dom) → ID de día en la plantilla
const DOW_TO_ID = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
const DIAS_SEMANA_LABEL = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}
function startOfDay(date) {
  const d = new Date(date); d.setHours(0,0,0,0); return d
}
function fechaADateLocal(f) {
  const [d, m, y] = String(f).split('/').map(Number)
  return new Date(y, m - 1, d).getTime()
}

const S = {
  page: { maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: 'var(--c-f5f5f7)', paddingBottom: 84 },
  header: { background: 'var(--surface)', padding: 'max(52px, calc(env(safe-area-inset-top, 0px) + 16px)) 20px 16px', borderBottom: '1px solid var(--c-e5e5ea)' },
  card: { background: 'var(--surface)', borderRadius: 16, overflow: 'hidden', marginBottom: 10 },
  input: { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--c-e5e5ea)', background: 'var(--c-f5f5f7)', color: 'var(--c-1c1c1e)', fontSize: 16 },
  btnPrimary: c => ({ padding: '14px', borderRadius: 14, background: c, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, width: '100%' }),
  btnPill: (active, c) => ({ padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: active ? c : 'var(--c-f5f5f7)', color: active ? '#fff' : 'var(--c-8e8e93)', flexShrink: 0 }),
  label: { fontSize: 12, color: 'var(--c-8e8e93)', marginBottom: 5, fontWeight: 500 },
  nav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--c-e5e5ea)', display: 'flex', paddingBottom: 'env(safe-area-inset-bottom,0px)' },
}

// Fondo suave del color de marca que funciona en modo claro y oscuro
const tinte = c => `color-mix(in srgb, ${c || '#6366f1'} 14%, var(--surface))`

// ─── TABLA DE SERIES (estilo Strong / Hevy) ──────────────────────────────────
// Cada serie registra kg + reps (o segundos en isométricos). Columna "Anterior"
// con la misma serie de la última sesión, ✓ para completar (lanza el descanso)
// y aviso 🏆 en CUALQUIER serie que bata una marca, no solo en la primera.

function TablaSeries({ ej, sesion, sesionPrevia, prPrevio, sug, editable, color, onChange, onCheck, onNota, onDiscos }) {
  const [nota, setNota] = useState(sesion?.nota || '')
  const notaTimer = useRef(null)
  useEffect(() => () => clearTimeout(notaTimer.current), [])
  const metrica = ej.metrica || 'kg_reps'
  const registradas = Object.keys(sesion || {}).filter(k => /^s\d+$/.test(k)).map(k => Number(k.slice(1)))
  const [extra, setExtra] = useState(0)
  const total = Math.max(ej.series || 1, ...registradas, 0) + extra
  const prev = n => parseSerie(sesionPrevia?.[`s${n}`], metrica)
  const cell = { ...S.input, textAlign: 'center', padding: '9px 4px', fontSize: 16, fontWeight: 700, minWidth: 0 }
  const [rMin, rMax] = rangoReps(ej.reps)
  const repsObj = sug?.repsObjetivo || rMax

  const sugerido = n => {
    const p = prev(n)
    return {
      kg: sug?.kgObjetivo ?? p.kg ?? null,
      reps: metrica === 'seg' ? null : (repsObj ?? p.reps ?? null),
      seg: metrica === 'seg' ? (sug?.segObjetivo ?? p.seg ?? rMax) : null,
    }
  }
  const cols = metrica === 'seg' ? '34px 1fr 1fr 44px' : '34px 1fr 1fr 1fr 44px'

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 6, fontSize: 10, fontWeight: 700, color: 'var(--c-8e8e93)', textTransform: 'uppercase', letterSpacing: 0.3, padding: '0 2px 6px' }}>
        <span style={{ textAlign: 'center' }}>Serie</span>
        <span style={{ textAlign: 'center' }}>Anterior</span>
        {metrica === 'seg'
          ? <span style={{ textAlign: 'center' }}>Segundos</span>
          : <><span style={{ textAlign: 'center' }}>{metrica === 'reps' ? '+kg lastre' : 'kg'}</span><span style={{ textAlign: 'center' }}>Reps</span></>}
        <span style={{ textAlign: 'center' }}>✓</span>
      </div>
      {Array.from({ length: total }, (_, i) => i + 1).map(n => {
        const s = parseSerie(sesion?.[`s${n}`], metrica)
        const p = prev(n)
        const ph = sugerido(n)
        const prs = prsDeSerie(s, prPrevio, metrica)
        const done = s.ok
        const bg = done ? 'var(--c-f0fdf4)' : 'transparent'
        const input = (campo, mode = 'decimal') => (
          <input type="number" inputMode={mode} disabled={!editable}
            placeholder={ph[campo] != null ? String(ph[campo]) : '—'}
            value={s[campo] ?? ''}
            onChange={e => onChange(n, { [campo]: e.target.value === '' ? null : Number(e.target.value) })}
            style={{ ...cell, background: done ? 'var(--c-dcfce7)' : 'var(--c-f5f5f7)' }} />
        )
        return (
          <div key={n}>
            <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 6, alignItems: 'center', padding: '3px 2px', borderRadius: 10, background: bg }}>
              <span style={{ textAlign: 'center', fontWeight: 800, color: n > (ej.series || 0) ? 'var(--c-8e8e93)' : 'var(--c-1c1c1e)', fontSize: 14 }}>{n}</span>
              <span style={{ textAlign: 'center', fontSize: 12, color: 'var(--c-8e8e93)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{serieTieneDatos(p) ? formatSerie(p, metrica) : '—'}</span>
              {metrica === 'seg' ? input('seg', 'numeric') : <>{input('kg')}{input('reps', 'numeric')}</>}
              <button disabled={!editable} onClick={() => onCheck(n, !done, ph)}
                aria-label={done ? 'Desmarcar serie' : 'Completar serie'}
                style={{ width: 40, height: 40, borderRadius: 10, border: 'none', cursor: editable ? 'pointer' : 'default', background: done ? '#10b981' : 'var(--c-e5e5ea)', color: done ? '#fff' : 'var(--c-8e8e93)', fontSize: 16, fontWeight: 800, justifySelf: 'center' }}>✓</button>
            </div>
            {done && editable && metrica !== 'seg' && (
              <div role="group" aria-label={`Esfuerzo percibido de la serie ${n}`} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 0 4px 40px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--c-8e8e93)', marginRight: 2 }} title="RPE: 10 = al fallo · 9 = te quedaba 1 rep · 8 = te quedaban 2">RPE</span>
                {[6, 7, 8, 9, 10].map(v => (
                  <button key={v} type="button" aria-pressed={s.rpe === v} onClick={() => onChange(n, { rpe: s.rpe === v ? null : v })}
                    style={{ minWidth: 30, minHeight: 28, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      background: s.rpe === v ? (v >= 9.5 ? '#ef4444' : v >= 8.5 ? '#f59e0b' : '#10b981') : 'var(--c-f2f2f7)',
                      color: s.rpe === v ? '#fff' : 'var(--c-636366)' }}>{v}</button>
                ))}
              </div>
            )}
            {prs.length > 0 && (
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-b45309)', padding: '2px 0 4px 40px' }}>
                🏆 {prs.length > 1 ? '¡Nuevas marcas!' : '¡Nueva marca!'} {prs.map(t => t === 'peso' ? 'peso máximo' : t === '1RM' ? '1RM estimado' : t === 'reps' ? 'repeticiones' : 'tiempo').join(' · ')}
              </div>
            )}
          </div>
        )
      })}
      {editable && (
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button onClick={() => setExtra(x => x + 1)}
            style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px dashed var(--c-c7c7cc)', background: 'transparent', color: color, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Añadir serie</button>
          {extra > 0 && (
            <button onClick={() => setExtra(x => Math.max(0, x - 1))}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--c-e5e5ea)', background: 'transparent', color: 'var(--c-8e8e93)', fontSize: 13, cursor: 'pointer' }}>− Quitar</button>
          )}
          {onDiscos && (
            <button type="button" onClick={() => onDiscos(parseSerie(sesion?.s1, metrica).kg ?? sugerido(1).kg ?? 20)}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--c-e5e5ea)', background: 'transparent', color: 'var(--c-3c3c43)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🧮 Discos</button>
          )}
        </div>
      )}
      {onNota && (editable || nota) && (
        <div style={{ marginTop: 10 }}>
          {sesionPrevia?.nota && (
            <div style={{ fontSize: 12, color: 'var(--c-8e8e93)', marginBottom: 6 }}>📝 Última vez: <i>{sesionPrevia.nota}</i></div>
          )}
          <label style={{ display: 'block' }}>
            <span style={{ ...S.label, display: 'block' }}>Notas del ejercicio</span>
            <textarea value={nota} disabled={!editable} rows={2} maxLength={300}
              placeholder="Ej: asiento en 4, agarre más cerrado, molestia en el hombro…"
              onChange={e => {
                const v = e.target.value
                setNota(v)
                clearTimeout(notaTimer.current)
                notaTimer.current = setTimeout(() => onNota(v), 800)
              }}
              onBlur={() => { clearTimeout(notaTimer.current); if (nota !== (sesion?.nota || '')) onNota(nota) }}
              style={{ ...S.input, fontSize: 14, resize: 'vertical', minHeight: 44 }} />
          </label>
        </div>
      )}
    </div>
  )
}

// ─── HOJA MODAL NATIVA (<dialog>) ────────────────────────────────────────────
// El navegador gestiona el foco, Esc / gesto atrás, la capa superior y el
// fondo inerte. Se abre con showModal() y avisa al cerrarse por cualquier vía.
function Hoja({ abierta, onClose, titulo, children }) {
  const ref = useRef(null)
  const idTitulo = useId()
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (abierta && !d.open) d.showModal()
    if (!abierta && d.open) d.close()
  }, [abierta])
  useEffect(() => {
    const d = ref.current
    if (!d) return
    const cerrar = () => onClose()
    d.addEventListener('close', cerrar)
    // Cerrar al tocar fuera donde no exista closedby="any"
    let fuera = false
    const out = e => { const r = d.getBoundingClientRect(); return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom }
    const down = e => { fuera = out(e) }
    const up = e => { if (!('closedBy' in HTMLDialogElement.prototype) && fuera && out(e)) d.close() }
    d.addEventListener('pointerdown', down); d.addEventListener('pointerup', up)
    return () => { d.removeEventListener('close', cerrar); d.removeEventListener('pointerdown', down); d.removeEventListener('pointerup', up) }
  }, [onClose])
  return (
    <dialog ref={ref} className="sheet" aria-labelledby={idTitulo} closedby="any">
      {abierta && <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12 }}>
          <h2 id={idTitulo} style={{ fontSize: 19, fontWeight: 800, textWrap: 'balance' }}>{titulo}</h2>
          <form method="dialog"><button className="icon-btn" aria-label="Cerrar" style={{ border: 'none', background: 'var(--c-f2f2f7)', borderRadius: 999, width: 32, height: 32, fontSize: 16, cursor: 'pointer', color: 'var(--c-636366)' }}>✕</button></form>
        </div>
        {children}
      </>}
    </dialog>
  )
}

// ─── CALCULADORA DE DISCOS Y CALENTAMIENTO ───────────────────────────────────
const COLOR_DISCO = { 25: '#ef4444', 20: '#3b82f6', 15: '#f59e0b', 10: '#10b981', 5: '#e5e7eb', 2.5: '#6b7280', 1.25: '#a3a3a3' }

function CalculadoraDiscos({ datos, onClose }) {
  const [kg, setKg] = useState(datos?.kg ?? 60)
  const [barra, setBarra] = useState(20)
  useEffect(() => { if (datos) { setKg(datos.kg ?? 60); setBarra(datos.barra ? 20 : 0) } }, [datos])
  const total = Number(kg) || 0
  const { discos, sobra, real } = discosPorLado(total, barra)
  const series = calentamiento(total, barra || 0)
  return (
    <Hoja abierta={!!datos} onClose={onClose} titulo={datos?.nombre || 'Discos'}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end', marginBottom: 14 }}>
        <label>
          <span style={{ ...S.label, display: 'block' }}>Peso objetivo (kg)</span>
          <input type="number" inputMode="decimal" step="2.5" min="0" value={kg} onChange={e => setKg(e.target.value)} style={{ ...S.input, fontSize: 22, fontWeight: 800, textAlign: 'center' }} />
        </label>
        <div role="group" aria-label="Peso de la barra" style={{ display: 'flex', gap: 4 }}>
          {[0, 10, 15, 20].map(b => (
            <button key={b} type="button" aria-pressed={barra === b} onClick={() => setBarra(b)}
              style={{ ...S.btnPill(barra === b, '#6366f1'), padding: '12px 10px', minHeight: 44 }}>{b === 0 ? 'Sin barra' : `${b}`}</button>
          ))}
        </div>
      </div>

      {barra > 0 && (
        <div style={{ background: 'var(--c-f5f5f7)', borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: 'var(--c-8e8e93)', marginBottom: 10 }}>Por cada lado de la barra</div>
          <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 3, minHeight: 74, marginBottom: 10 }}>
            <div style={{ width: 22, height: 10, background: 'var(--c-aeaeb2)', borderRadius: 3 }} />
            {[...discos].reverse().map((d, i) => (
              <div key={i} style={{ width: d >= 10 ? 16 : 11, height: 20 + Math.sqrt(d) * 10.5, background: COLOR_DISCO[d], borderRadius: 4, border: '1px solid rgb(0 0 0 / 0.15)' }} />
            ))}
            <div style={{ width: 8, height: 28, background: 'var(--c-8e8e93)', borderRadius: 2 }} />
            <div style={{ flex: 1, height: 10, background: 'var(--c-aeaeb2)', borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>
            {discos.length ? discos.join(' + ') + ' kg' : 'Solo la barra'}
          </div>
          {sobra > 0 && <div style={{ fontSize: 12, color: 'var(--c-b45309)', marginTop: 4 }}>No se puede cargar exacto con discos estándar: quedaría en {real} kg.</div>}
        </div>
      )}

      {series.length > 0 && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Calentamiento recomendado</h3>
          <p style={{ fontSize: 12, color: 'var(--c-8e8e93)', marginBottom: 8, textWrap: 'pretty' }}>Series de aproximación con pocas repeticiones para no fatigarte antes de las series efectivas.</p>
          <ol style={{ listStyle: 'none' }}>
            {series.map((w, i) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--c-f2f2f7)', fontSize: 14 }}>
                <span><b>{w.kg} kg</b> × {w.reps}</span>
                <span style={{ color: 'var(--c-8e8e93)', fontSize: 12 }}>{w.pct === 0 ? 'barra vacía' : `${Math.round(w.pct * 100)} %`}{barra > 0 && w.kg > barra ? ` · ${discosPorLado(w.kg, barra).discos.join('+')}/lado` : ''}</span>
              </li>
            ))}
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', fontSize: 14, color: '#6366f1', fontWeight: 700 }}>
              <span>{total} kg</span><span>series efectivas</span>
            </li>
          </ol>
        </>
      )}
    </Hoja>
  )
}

// ─── GRÁFICA DE EVOLUCIÓN (SVG ligera, sin dependencias) ─────────────────────
function GraficaEvolucion({ puntos, campo, unidad, color = '#6366f1' }) {
  const datos = puntos.filter(p => p[campo] > 0)
  if (datos.length < 2) return <div style={{ fontSize: 12, color: 'var(--c-8e8e93)', padding: '10px 0' }}>Registra al menos 2 sesiones para ver la gráfica.</div>
  const W = 320, H = 130, pad = { l: 34, r: 10, t: 12, b: 22 }
  const vals = datos.map(p => p[campo])
  const min = Math.min(...vals), max = Math.max(...vals)
  const rango = max - min || 1
  const x = i => pad.l + (i * (W - pad.l - pad.r)) / (datos.length - 1)
  const y = v => pad.t + (1 - (v - min) / rango) * (H - pad.t - pad.b)
  const linea = datos.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[campo]).toFixed(1)}`).join(' ')
  const area = `${linea} L${x(datos.length - 1)},${H - pad.b} L${pad.l},${H - pad.b} Z`
  const fmt = v => (v >= 1000 ? `${(v / 1000).toFixed(1)}t` : `${Math.round(v * 10) / 10}`)
  const ini = vals[0], fin = vals.at(-1)
  const cambio = ini ? Math.round(((fin - ini) / ini) * 100) : 0
  const resumen = `Evolución de ${datos.length} sesiones: de ${fmt(ini)} a ${fmt(fin)} ${unidad} (${cambio >= 0 ? '+' : ''}${cambio} %), máximo ${fmt(max)}.`
  return (
    <figure style={{ margin: '4px 0 12px' }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={resumen} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {[min, (min + max) / 2, max].map((v, i) => (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} style={{ stroke: 'var(--c-e5e5ea)' }} strokeDasharray="3 3" />
            <text x={pad.l - 6} y={y(v) + 4} textAnchor="end" fontSize="10" style={{ fill: 'var(--c-8e8e93)' }}>{fmt(v)}</text>
          </g>
        ))}
        <path d={area} fill={color} opacity="0.12" />
        <path d={linea} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {datos.map((p, i) => <circle key={i} cx={x(i)} cy={y(p[campo])} r={i === datos.length - 1 ? 4 : 2.5} fill={color}><title>{`${p.fecha}: ${fmt(p[campo])} ${unidad}`}</title></circle>)}
        <text x={pad.l} y={H - 6} fontSize="10" style={{ fill: 'var(--c-8e8e93)' }}>{datos[0].fecha}</text>
        <text x={W - pad.r} y={H - 6} fontSize="10" textAnchor="end" style={{ fill: 'var(--c-8e8e93)' }}>{datos.at(-1).fecha}</text>
      </svg>
      <figcaption style={{ fontSize: 12, color: cambio >= 0 ? 'var(--c-047857)' : 'var(--c-dc2626)', fontWeight: 600 }}>
        {cambio >= 0 ? '▲' : '▼'} {cambio >= 0 ? '+' : ''}{cambio} % desde la primera sesión
      </figcaption>
    </figure>
  )
}

// ─── RESUMEN AL TERMINAR EL ENTRENO ──────────────────────────────────────────
function ResumenEntreno({ resumen, onClose }) {
  const [copiado, setCopiado] = useState(false)
  if (!resumen) return <Hoja abierta={false} onClose={onClose} titulo="" />
  const { titulo, minutos, series, volumen, ejercicios, records, fecha } = resumen
  const texto = [
    `🏋️ ${titulo} · ${fecha}`,
    `${minutos ? `⏱ ${minutos} min · ` : ''}${series} series · ${volumen >= 1000 ? `${(volumen / 1000).toFixed(1)} t` : `${Math.round(volumen)} kg`} de volumen`,
    ...ejercicios.map(e => `• ${e.nombre}: ${e.mejor}${e.pr ? ' 🏆' : ''}`),
    records.length ? `🏆 ${records.length} ${records.length === 1 ? 'récord nuevo' : 'récords nuevos'}` : '',
    'Registrado con TrainClub',
  ].filter(Boolean).join('\n')
  async function compartir() {
    try {
      if (navigator.share) await navigator.share({ title: 'Mi entreno', text: texto })
      else { await navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 2000) }
    } catch { /* el usuario canceló */ }
  }
  const stat = (v, l) => (
    <div style={{ background: 'var(--c-f5f5f7)', borderRadius: 14, padding: '12px 6px', textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{v}</div>
      <div style={{ fontSize: 11, color: 'var(--c-8e8e93)' }}>{l}</div>
    </div>
  )
  return (
    <Hoja abierta onClose={onClose} titulo="¡Entreno completado! 💪">
      <p style={{ fontSize: 14, color: 'var(--c-8e8e93)', marginBottom: 14 }}>{titulo} · {fecha}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        {stat(minutos ? `${minutos}′` : '—', 'duración')}
        {stat(series, 'series')}
        {stat(volumen >= 1000 ? `${(volumen / 1000).toFixed(1)}t` : `${Math.round(volumen)}kg`, 'volumen')}
      </div>
      {records.length > 0 && (
        <div style={{ background: 'var(--c-fffbeb)', borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ fontWeight: 800, color: 'var(--c-92400e)', marginBottom: 4 }}>🏆 {records.length} {records.length === 1 ? 'récord nuevo' : 'récords nuevos'}</div>
          {records.map((r, i) => <div key={i} style={{ fontSize: 13, color: 'var(--c-92400e)' }}>{r}</div>)}
        </div>
      )}
      <ul style={{ listStyle: 'none', marginBottom: 16 }}>
        {ejercicios.map((e, i) => (
          <li key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--c-f2f2f7)', fontSize: 14 }}>
            <span style={{ minWidth: 0 }}>{e.nombre}</span>
            <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{e.mejor}{e.pr ? ' 🏆' : ''}</span>
          </li>
        ))}
      </ul>
      <button type="button" onClick={compartir} style={S.btnPrimary('#6366f1')}>{copiado ? '✓ Copiado' : '📤 Compartir resumen'}</button>
    </Hoja>
  )
}

// ─── PANTALLA USUARIOS ───────────────────────────────────────────────────────

function PantallaUsuarios({ users, loading, onSelect, onCreate, onDelete, onSignOut, maxProfiles = 1, plan = 'free', onUpgrade }) {
  const [creando, setCreando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [avatar, setAvatar] = useState('💪')
  const [objetivo, setObjetivo] = useState('recomposicion')
  const [nivel, setNivel] = useState('intermedio')
  const [borrandoId, setBorrandoId] = useState(null)
  const [codigoBorrar, setCodigoBorrar] = useState('')
  const [errorCodigo, setErrorCodigo] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const limitAlcanzado = users.length >= maxProfiles

  function guardar() {
    if (!nombre.trim()) return
    onCreate({ id: Date.now().toString(), nombre: nombre.trim(), avatar, objetivo, nivel, cicloActual: 'hiper', cicloSemanaInicio: getWeekKey() })
    setNombre(''); setAvatar('💪'); setObjetivo('recomposicion'); setNivel('intermedio'); setCreando(false)
  }

  function intentarBorrar(u) {
    if (codigoBorrar === 'borrarok') {
      onDelete(u.id); setBorrandoId(null); setCodigoBorrar(''); setErrorCodigo(false)
    } else {
      setErrorCodigo(true)
    }
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: 'var(--c-f5f5f7)', padding: '60px 20px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative' }}>
        <div style={{ fontSize: 52 }}>🏋️</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--c-1c1c1e)', marginTop: 12 }}>TrainClub</div>
        <div style={{ fontSize: 14, color: 'var(--c-8e8e93)', marginTop: 6 }}>¿Quién entrena hoy?</div>
        {onSignOut && (
          <button onClick={onSignOut}
            style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', fontSize: 12, color: 'var(--c-8e8e93)', cursor: 'pointer', padding: '6px 10px' }}>
            Salir →
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--c-8e8e93)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 14 }}>Cargando perfiles...</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {users.map(u => {
              const ciclo = CICLOS.find(c => c.id === u.cicloActual) || CICLOS[0]
              return (
                <div key={u.id} style={{ background: 'var(--surface)', borderRadius: 16, display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 14 }}>
                  <div style={{ fontSize: 36 }}>{u.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{u.nombre}</div>
                    <div style={{ fontSize: 11, marginTop: 3, display: 'inline-block', background: tinte(ciclo.color), color: ciclo.color, padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>{ciclo.nombre}</div>
                  </div>
                  <button onClick={() => onSelect(u)} style={{ padding: '10px 18px', borderRadius: 12, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Entrar</button>
                  <button onClick={() => { setBorrandoId(u.id); setCodigoBorrar(''); setErrorCodigo(false) }}
                    style={{ padding: '10px', borderRadius: 12, background: 'var(--c-fff0f0)', color: '#ff3b30', border: 'none', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                </div>
              )
            })}
          </div>

          {/* Modal borrar */}
          {borrandoId && (() => {
            const u = users.find(x => x.id === borrandoId)
            return (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                onClick={() => setBorrandoId(null)}>
                <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 }} onClick={e => e.stopPropagation()}>
                  <div style={{ fontSize: 32, textAlign: 'center' }}>🗑️</div>
                  <div style={{ fontSize: 17, fontWeight: 800, textAlign: 'center', marginTop: 10 }}>Eliminar a {u?.nombre}</div>
                  <div style={{ fontSize: 13, color: 'var(--c-8e8e93)', textAlign: 'center', marginTop: 6, marginBottom: 20 }}>Se borrarán todos sus datos. Escribe el código para confirmar.</div>
                  <div style={S.label}>Código de confirmación</div>
                  <input autoFocus type="text" placeholder="escribe el código aquí"
                    value={codigoBorrar} onChange={e => { setCodigoBorrar(e.target.value); setErrorCodigo(false) }}
                    onKeyDown={e => e.key === 'Enter' && intentarBorrar(u)}
                    style={{ ...S.input, marginBottom: 6, border: errorCodigo ? '1.5px solid #ff3b30' : '1px solid var(--c-e5e5ea)' }} />
                  {errorCodigo && <div style={{ fontSize: 12, color: '#ff3b30', marginBottom: 12 }}>Código incorrecto.</div>}
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button onClick={() => setBorrandoId(null)} style={{ flex: 1, padding: 13, borderRadius: 12, background: 'var(--c-f5f5f7)', color: 'var(--c-8e8e93)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                    <button onClick={() => intentarBorrar(u)} style={{ flex: 1, padding: 13, borderRadius: 12, background: '#ff3b30', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Eliminar</button>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Banner plan actual */}
          {plan === 'free' && users.length > 0 && (
            <div style={{ background: 'var(--c-eef2ff)', border: '1px solid var(--c-c7d2fe)', borderRadius: 14, padding: '10px 14px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>Plan Gratuito · 1 perfil</div>
                <div style={{ fontSize: 11, color: 'var(--c-8e8e93)' }}>Hasta 5 perfiles con Plan Familia</div>
              </div>
              <button onClick={() => setShowPaywall(true)} style={{ padding: '7px 14px', borderRadius: 10, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                Mejorar →
              </button>
            </div>
          )}

          {!creando ? (
            <button onClick={() => limitAlcanzado ? setShowPaywall(true) : setCreando(true)}
              style={{ width: '100%', padding: '16px', borderRadius: 16, border: `2px dashed ${limitAlcanzado ? 'var(--c-d1d5db)' : '#6366f1'}`, background: 'transparent', color: limitAlcanzado ? 'var(--c-aeaeb2)' : '#6366f1', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              {limitAlcanzado ? '🔒 Añadir usuario (Plan Familia)' : '+ Añadir usuario'}
            </button>
          ) : (
            <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Nuevo usuario</div>
              <div style={S.label}>Nombre</div>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="ej: Carlos" style={{ ...S.input, marginBottom: 16 }} />
              <div style={S.label}>Avatar</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setAvatar(a)} style={{ width: 48, height: 48, borderRadius: 12, border: avatar === a ? '2px solid #6366f1' : '2px solid var(--c-e5e5ea)', background: avatar === a ? 'var(--c-eef2ff)' : 'var(--surface)', fontSize: 24, cursor: 'pointer' }}>{a}</button>
                ))}
              </div>
              <div style={S.label}>Objetivo</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {OBJETIVOS.map(o => (
                  <button key={o.id} onClick={() => setObjetivo(o.id)}
                    style={{ padding: '10px 14px', borderRadius: 12, border: objetivo === o.id ? '2px solid #6366f1' : '2px solid var(--c-e5e5ea)', background: objetivo === o.id ? 'var(--c-eef2ff)' : 'var(--surface)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{o.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: objetivo === o.id ? '#6366f1' : 'var(--c-1c1c1e)' }}>{o.nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--c-8e8e93)' }}>{o.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div style={S.label}>Nivel de entrenamiento</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {NIVELES.map(n => (
                  <button key={n.id} onClick={() => setNivel(n.id)}
                    style={{ flex: 1, padding: '10px 8px', borderRadius: 12, border: nivel === n.id ? '2px solid #6366f1' : '2px solid var(--c-e5e5ea)', background: nivel === n.id ? 'var(--c-eef2ff)' : 'var(--surface)', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: 18 }}>{n.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: nivel === n.id ? '#6366f1' : 'var(--c-1c1c1e)', marginTop: 4 }}>{n.nombre}</div>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setCreando(false)} style={{ flex: 1, padding: 13, borderRadius: 12, background: 'var(--c-f5f5f7)', color: 'var(--c-8e8e93)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                <button onClick={guardar} style={{ flex: 2, ...S.btnPrimary('#6366f1'), borderRadius: 12 }}>Crear</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal paywall */}
      {showPaywall && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowPaywall(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: 24, padding: '32px 24px 28px', width: '100%', maxWidth: 380, textAlign: 'center' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍👩‍👧‍👦</div>
            <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--c-1c1c1e)', marginBottom: 6 }}>Plan Familia</div>
            <div style={{ fontSize: 14, color: 'var(--c-8e8e93)', marginBottom: 24, lineHeight: 1.5 }}>Añade hasta 5 perfiles para que toda la familia entrene con su rutina personalizada.</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                ['👤', 'Hasta 5 perfiles independientes'],
                ['🎯', 'Rutinas personalizadas por objetivo y nivel'],
                ['📊', 'Seguimiento individual de progreso'],
                ['🔔', 'Recordatorios para cada miembro'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--c-f5f5f7)', borderRadius: 12, padding: '10px 14px', textAlign: 'left' }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-1c1c1e)' }}>{text}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--c-eef2ff)', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#6366f1' }}>4,99€<span style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-8e8e93)' }}> /mes</span></div>
              <div style={{ fontSize: 12, color: 'var(--c-8e8e93)', marginTop: 2 }}>Cancela cuando quieras</div>
            </div>

            <button onClick={() => { setShowPaywall(false); onUpgrade?.() }}
              style={{ width: '100%', padding: '14px', borderRadius: 14, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, boxShadow: '0 4px 14px #6366f155', marginBottom: 10 }}>
              Contratar Plan Familia →
            </button>
            <button onClick={() => setShowPaywall(false)}
              style={{ background: 'none', border: 'none', color: 'var(--c-aeaeb2)', fontSize: 13, cursor: 'pointer' }}>
              Ahora no
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────

export default function App() {
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [udLoading, setUdLoading] = useState(false)
  const [tab, setTab] = useState('entreno')
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))
  const [calStart, setCalStart] = useState(() => startOfDay(new Date()))
  const [ejAbierto, setEjAbierto] = useState(null)
  const [altAbierta, setAltAbierta] = useState(null)
  const [busquedaEj, setBusquedaEj] = useState('')
  const [discos, setDiscos] = useState(null)
  const [resumen, setResumen] = useState(null)
  const [campoGrafica, setCampoGrafica] = useState('e1rm')
  const [grupoEj, setGrupoEj] = useState('Todos')
  const [marcaAbierta, setMarcaAbierta] = useState(null)
  const [mostrarPreparados, setMostrarPreparados] = useState(false)
  const [filtroServicio, setFiltroServicio] = useState('Todos')
  const [ud, setUdState] = useState({})
  const [dietaData, setDietaDataState] = useState({})
  const [pesoInput, setPesoInput] = useState('')
  const [medidaForm, setMedidaForm] = useState({ cintura: '', cadera: '', pecho: '', biceps: '', muslo: '' })
  const [dietaCalc, setDietaCalc] = useState(null)
  const [platoAbierto, setPlatoAbierto] = useState(null)
  const [mostrarCiclos, setMostrarCiclos] = useState(false)
  const [actividadModal, setActividadModal] = useState(false)
  const [actForm, setActForm] = useState({ tipo: 'correr', minutos: '', km: '' })
  const [revisionBanner, setRevisionBanner] = useState(null)
  const [editandoPerfil, setEditandoPerfil] = useState(false)
  const [notifPermiso, setNotifPermiso] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [pushActivo, setPushActivo] = useState(false)
  const [pushCargando, setPushCargando] = useState(false)
  useEffect(() => {
    getSubscription().then(s => setPushActivo(!!s))
  }, [userId])
  // null = cargando, false = no hay sesión, objeto = sesión activa
  const [authSession, setAuthSession] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { plan, maxProfiles, startCheckout } = useSubscription(authSession?.user?.id)
  const [onboardingPrevVersion, setOnboardingPrevVersion] = useState(0)
  const [restTimer, setRestTimer] = useState(null) // { segundos, total, ejNombre }
  const saveTimer = useRef(null)
  const dietaTimer = useRef(null)
  const restIntervalRef = useRef(null)

  // ── Temporizador de descanso ─────────────────────────────────────────────
  function iniciarDescanso(ejNombre, duracion = 90) {
    clearInterval(restIntervalRef.current)
    setRestTimer({ segundos: duracion, total: duracion, ejNombre })
    restIntervalRef.current = setInterval(() => {
      setRestTimer(prev => {
        if (!prev) return null
        if (prev.segundos <= 1) {
          clearInterval(restIntervalRef.current)
          if (navigator.vibrate) navigator.vibrate([300, 100, 300])
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)()
            ;[0, 150, 300].forEach(delay => {
              const osc = ctx.createOscillator()
              const gain = ctx.createGain()
              osc.connect(gain); gain.connect(ctx.destination)
              osc.frequency.value = 880
              gain.gain.setValueAtTime(0.3, ctx.currentTime + delay / 1000)
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay / 1000 + 0.3)
              osc.start(ctx.currentTime + delay / 1000)
              osc.stop(ctx.currentTime + delay / 1000 + 0.35)
            })
          } catch {}
          return { ...prev, segundos: 0 }
        }
        return { ...prev, segundos: prev.segundos - 1 }
      })
    }, 1000)
  }

  function cancelarDescanso() {
    clearInterval(restIntervalRef.current)
    setRestTimer(null)
  }

  // ── Auth: detectar sesión al arrancar y escuchar cambios ─────────────────
  useEffect(() => {
    if (!supabase) { setAuthSession(false); return } // sin Supabase → modo offline
    getSession().then(s => setAuthSession(s || false))
    const { data: { subscription } } = onAuthStateChange(s => setAuthSession(s || false))
    return () => subscription.unsubscribe()
  }, [])

  // Cargar perfiles al inicio y auto-seleccionar si hay sesión vinculada
  useEffect(() => {
    if (authSession === null) return // aún cargando auth
    const authUserId = authSession?.user?.id || null
    getProfiles(authUserId).then(p => {
      setUsers(p)
      setUsersLoading(false)
      if (authSession?.user) {
        const vinculado = p.find(u => u.authUserId === authSession.user.id)
        if (vinculado) setUserId(vinculado.id)
      }
    })
  }, [authSession])

  // Cargar datos del usuario al seleccionar
  useEffect(() => {
    if (!userId) return
    setUdLoading(true)
    Promise.all([getUserData(userId), getDieta(userId)]).then(([data, dieta]) => {
      setUdState(data)
      setDietaDataState(dieta)
      setUdLoading(false)
    })
  }, [userId])

  // ── Revisión semanal automática ───────────────────────────────────────────
  useEffect(() => {
    if (!userId || !ud || Object.keys(ud).length === 0) return
    const semanaActual = getWeekKey()
    if (ud.ultimaRevisionSemana === semanaActual) return // ya revisado esta semana

    const user_ = users.find(u => u.id === userId)
    if (!user_) return
    const niv = user_.nivel || 'intermedio'
    const obj = user_.objetivo || 'recomposicion'
    const ciclo = user_.cicloActual || 'hiper'
    const dias_ = getDiasCiclo(ciclo, obj, niv)
    const MEV = { principiante: 6, intermedio: 10, avanzado: 12 }[niv] || 10
    const MRV = { principiante: 16, intermedio: 20, avanzado: 22 }[niv] || 20

    // Calcular volumen planificado por grupo (con seriesExtra actuales)
    const baseGrupo_ = {}
    dias_.forEach(d => d.ejercicios.forEach(ej => {
      const g = normalizarMusculo(ej.musculo)
      const extra = (ud.seriesExtra || {})[g] || 0
      baseGrupo_[g] = (baseGrupo_[g] || 0) + ej.series + extra
    }))

    const nuevoExtra = { ...(ud.seriesExtra || {}) }
    let cambios = []

    // Ajustar volumen: añadir si bajo MEV, quitar si sobre MRV
    for (const [grupo, series] of Object.entries(baseGrupo_)) {
      if (series < MEV) {
        // Calcular base sin extra para saber cuánto añadir
        const baseSinExtra = baseGrupo_[grupo] - (nuevoExtra[grupo] || 0)
        const extraNecesario = Math.min(MEV - baseSinExtra, MRV - baseSinExtra)
        if (extraNecesario > 0) {
          nuevoExtra[grupo] = extraNecesario
          cambios.push(`↑ ${grupo}: +${extraNecesario} series (bajo MEV)`)
        }
      } else if (series > MRV) {
        // Reducir el extra hasta quedar en MRV
        const baseSinExtra = baseGrupo_[grupo] - (nuevoExtra[grupo] || 0)
        const extraMaximo = Math.max(0, MRV - baseSinExtra)
        nuevoExtra[grupo] = extraMaximo
        cambios.push(`↓ ${grupo}: reducido a MRV (recuperación)`)
      }
    }

    // Rotar ejercicios estancados (mejor serie sin mejorar en 3 sesiones)
    // Se cambia por otro de la MISMA familia; el nuevo empieza su propio historial.
    const nuevasAlts = Object.fromEntries(Object.entries(ud.alternativasActivas || {}).filter(([, v]) => typeof v === 'string'))
    const registros_ = ud.registros || {}
    const visibles_ = construirDiasVisibles(adaptarDiasAlPerfil(dias_, dietaData || {}), { alternativas: nuevasAlts, fecha: new Date(), objetivo: obj, bloqueInicio: ud.bloqueInicio })
    for (const dia of visibles_) {
      for (const ej of (dia.ejercicios || [])) {
        if (ej.metrica === 'seg' || nuevasAlts[ej.slot]) continue
        const hist = historialOrdenado(registros_[ej.regId])
        if (!detectarEstancamiento(hist, ej.metrica)) continue
        const ocupados = dia.ejercicios.map(e => e.regId)
        const alt = alternativasDe(ej.regId, { evitarBarra: !!dia._perfil?.evitarBarra, excluir: ocupados })[0]
        if (alt) {
          nuevasAlts[ej.slot] = alt.id
          cambios.push(`🔄 ${ej.nombre} → ${alt.nombre} (estancamiento)`)
        }
      }
    }

    setUd(prev => ({
      ...prev,
      seriesExtra: nuevoExtra,
      alternativasActivas: { ...nuevasAlts },
      ultimaRevisionSemana: semanaActual,
    }))

    if (cambios.length > 0) {
      setRevisionBanner({ semana: semanaActual, cambios })
    }
  }, [userId, ud.ultimaRevisionSemana]) // solo corre cuando cambia la semana o el usuario

  // Guardar datos de usuario con debounce (1s)
  // Acepta objeto o función (prev => next) para que actualizaciones simultáneas
  // (migración + revisión semanal al cargar) no se pisen entre sí.
  const setUd = useCallback((upd) => {
    setUdState(prev => {
      const next = typeof upd === 'function' ? upd(prev) : upd
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => saveUserData(userId, next), 1000)
      return next
    })
  }, [userId])

  const setDietaUser = useCallback((newDieta) => {
    setDietaDataState(newDieta)
    clearTimeout(dietaTimer.current)
    dietaTimer.current = setTimeout(() => saveDieta(userId, newDieta), 1000)
  }, [userId])

  const user = users.find(u => u.id === userId)
  const cicloActual = user?.cicloActual || 'hiper'
  const cicloInfo = CICLOS.find(c => c.id === cicloActual) || CICLOS[0]
  const DIAS = useMemo(() => {
    const dias = getDiasCiclo(cicloActual, user?.objetivo || 'recomposicion', user?.nivel || 'intermedio')
    return adaptarDiasAlPerfil(dias, dietaData || {})
  }, [cicloActual, user?.objetivo, user?.nivel, dietaData?.edad, dietaData?.pesoActual, dietaData?.altura, dietaData?.sexo])
  const alternativasActivas = useMemo(() =>
    Object.fromEntries(Object.entries(ud.alternativasActivas || {}).filter(([, v]) => typeof v === 'string')),
  [ud.alternativasActivas])
  // Días con rotación por bloques + alternativas elegidas, según la fecha seleccionada
  const DIAS_VIS = useMemo(() => construirDiasVisibles(DIAS, { alternativas: alternativasActivas, fecha: selectedDate, objetivo: user?.objetivo, bloqueInicio: ud.bloqueInicio }),
    [DIAS, alternativasActivas, selectedDate, user?.objetivo, ud.bloqueInicio])
  const diaSel = DIAS_VIS.find(d => d.id === DOW_TO_ID[selectedDate.getDay()]) || null
  // Antes: un día sin entreno en la plantilla mostraba la rutina del lunes
  const esFinde = !diaSel
  const dia = diaSel || DIAS_VIS[0]
  const fechaSel = fechaKey(selectedDate)
  const esFuturo = startOfDay(selectedDate) > startOfDay(new Date())

  // ── Migración única: historial con ids antiguos → ids del catálogo ────────
  // Antes 'jp' servía para "Jalón" y "Dominadas con lastre", 'cb' para 3 curls…
  // Se copia el historial al nuevo id solo si el id antiguo ya no se usa en el plan.
  useEffect(() => {
    if (!userId || udLoading || !ud || ud.migracionCatalogo >= 1 || !Object.keys(ud).length) return
    const regs = { ...(ud.registros || {}) }
    const idsPlan = new Set(DIAS.flatMap(d => d.ejercicios.map(e => e.id)))
    let movidos = 0
    DIAS.forEach(d => d.ejercicios.forEach(ej => {
      const old = ej.legacyId
      if (old && old !== ej.id && regs[old] && !regs[ej.id] && !idsPlan.has(old)) { regs[ej.id] = regs[old]; movidos++ }
    }))
    const altsLimpias = Object.fromEntries(Object.entries(ud.alternativasActivas || {}).filter(([, v]) => typeof v === 'string'))
    setUd(prev => ({
      ...prev,
      registros: { ...regs, ...(prev.registros || {}) },
      alternativasActivas: { ...altsLimpias, ...Object.fromEntries(Object.entries(prev.alternativasActivas || {}).filter(([, v]) => typeof v === 'string')) },
      migracionCatalogo: 1,
      // La rotación empieza a contar desde hoy: nada cambia de golpe al actualizar
      bloqueInicio: prev.bloqueInicio ?? bloqueDeFecha(new Date()),
    }))
    if (movidos) console.info(`[TrainClub] historial migrado en ${movidos} ejercicio(s)`)
  }, [userId, udLoading, ud.migracionCatalogo, DIAS])

  function updateUser(fields) {
    const updated = users.map(u => u.id === userId ? { ...u, ...fields } : u)
    setUsers(updated)
    upsertProfile({ ...user, ...fields })
  }

  // ── Registros ──
  const registros = ud.registros || {}
  // Sesiones excluidas de las marcas (reseteo de PR por ejercicio). El
  // historial no se borra: sigue visible en la pestaña Marcas y se puede restaurar.
  const marcasReset = ud.marcasReset || {}
  const registrosPR = useMemo(() => {
    const out = { ...registros }
    for (const [id, fechas] of Object.entries(marcasReset)) {
      if (!out[id]) continue
      const ocultas = new Set(fechas)
      out[id] = Object.fromEntries(Object.entries(out[id]).filter(([f]) => !ocultas.has(f)))
    }
    return out
  }, [ud.registros, ud.marcasReset])
  function resetearMarcas(id) {
    setUd(prev => ({ ...prev, marcasReset: { ...(prev.marcasReset || {}), [id]: Object.keys(prev.registros?.[id] || {}) } }))
  }
  function restaurarMarcas(id) {
    setUd(prev => { const m = { ...(prev.marcasReset || {}) }; delete m[id]; return { ...prev, marcasReset: m } })
  }
  function borrarSesion(id, fecha) {
    setUd(prev => {
      const ej = { ...(prev.registros?.[id] || {}) }
      delete ej[fecha]
      const regs = { ...(prev.registros || {}) }
      if (Object.keys(ej).length) regs[id] = ej; else delete regs[id]
      return { ...prev, registros: regs }
    })
  }
  // Las series se guardan en la FECHA SELECCIONADA (antes siempre en "hoy",
  // aunque estuvieras viendo otro día) y bajo el id del ejercicio realizado.
  function getSesion(regId, f = fechaSel) {
    return registros[regId]?.[f] || {}
  }
  function getSesionPrevia(regId) {
    const hist = historialOrdenado(registros[regId]).filter(([f]) => fechaADateLocal(f) < startOfDay(selectedDate).getTime())
    return hist.at(-1)?.[1] || null
  }
  function guardarSerie(ej, n, patch) {
    const metrica = ej.metrica
    const r = { ...registros, [ej.regId]: { ...(registros[ej.regId] || {}) } }
    const ses = { ...(r[ej.regId][fechaSel] || {}) }
    const cur = parseSerie(ses[`s${n}`], metrica)
    const next = { ...cur, ...patch }
    if (!serieTieneDatos(next) && !next.ok) delete ses[`s${n}`]
    else ses[`s${n}`] = { kg: next.kg, reps: next.reps, seg: next.seg, ok: !!next.ok, ...(next.rpe != null && { rpe: next.rpe }) }
    if (Object.keys(ses).length) r[ej.regId][fechaSel] = ses
    else delete r[ej.regId][fechaSel]
    // Hora de inicio del entreno: la primera serie completada del día
    const info = ud.sesionesInfo || {}
    const nuevaInfo = patch.ok && !info[fechaSel]?.inicio && fechaSel === fechaKey()
      ? { ...info, [fechaSel]: { ...(info[fechaSel] || {}), inicio: Date.now() } } : info
    setUd({ ...ud, registros: r, sesionesInfo: nuevaInfo })
  }
  const sesionesInfo = ud.sesionesInfo || {}
  const cerrarDiscos = useCallback(() => setDiscos(null), [])
  const cerrarResumen = useCallback(() => setResumen(null), [])
  function abrirResumen() {
    if (!diaSel) return
    let series = 0, volumen = 0
    const records = [], ejercicios = []
    diaSel.ejercicios.forEach(ej => {
      const ses = getSesion(ej.regId)
      const ss = seriesSesion(ses, ej.metrica)
      if (!ss.length) return
      const prPrev = calcularPRs(registrosPR[ej.regId], ej.metrica, { excluir: fechaSel })
      series += ss.filter(x => x.ok).length
      volumen += volumenSesion(ses, ej.metrica)
      const tags = [...new Set(ss.flatMap(x => prsDeSerie(x, prPrev, ej.metrica)))]
      if (tags.length) records.push(`${ej.nombre}: ${tags.map(t => t === 'peso' ? 'peso máximo' : t === '1RM' ? '1RM estimado' : t === 'reps' ? 'repeticiones' : 'tiempo').join(' · ')}`)
      ejercicios.push({ nombre: ej.nombre, mejor: formatSerie(mejorSerie(ses, ej.metrica), ej.metrica), pr: tags.length > 0 })
    })
    const info = sesionesInfo[fechaSel] || {}
    const fin = info.fin || Date.now()
    const minutos = info.inicio ? Math.max(1, Math.round((fin - info.inicio) / 60000)) : null
    if (!info.fin && fechaSel === fechaKey()) setUd(prev => ({ ...prev, sesionesInfo: { ...(prev.sesionesInfo || {}), [fechaSel]: { ...((prev.sesionesInfo || {})[fechaSel] || {}), fin } } }))
    setResumen({ titulo: diaSel.enfoque || diaSel.nombre || 'Entreno', fecha: fechaSel, minutos: minutos && minutos < 300 ? minutos : null, series, volumen, ejercicios, records })
  }
  function guardarNota(ej, texto) {
    // Actualización funcional: la nota se guarda con retardo y no debe pisar series marcadas entretanto
    const f = fechaSel
    setUd(prev => {
      const regs = prev.registros || {}
      const r = { ...regs, [ej.regId]: { ...(regs[ej.regId] || {}) } }
      const ses = { ...(r[ej.regId][f] || {}) }
      if (texto.trim()) ses.nota = texto; else delete ses.nota
      if (Object.keys(ses).length) r[ej.regId][f] = ses
      else delete r[ej.regId][f]
      return { ...prev, registros: r }
    })
  }
  function marcarSerie(ej, n, ok, sugeridos, esPrincipal) {
    const cur = parseSerie(getSesion(ej.regId)[`s${n}`], ej.metrica)
    const patch = { ok }
    // Al completar una serie vacía se rellena con lo sugerido (como Strong/Hevy)
    if (ok) for (const k of ['kg', 'reps', 'seg']) if (cur[k] == null && sugeridos[k] != null) patch[k] = sugeridos[k]
    guardarSerie(ej, n, patch)
    if (ok) iniciarDescanso(ej.nombre, descansoRecomendado(cicloActual, esPrincipal))
  }
  function aplicarSugerencia(ej, sug) {
    const r = { ...registros, [ej.regId]: { ...(registros[ej.regId] || {}) } }
    const ses = { ...(r[ej.regId][fechaSel] || {}) }
    for (let n = 1; n <= ej.series; n++) {
      const cur = parseSerie(ses[`s${n}`], ej.metrica)
      if (cur.ok) continue
      ses[`s${n}`] = {
        kg: sug.kgObjetivo ?? cur.kg,
        reps: ej.metrica === 'seg' ? null : (sug.repsObjetivo ?? cur.reps),
        seg: ej.metrica === 'seg' ? (sug.segObjetivo ?? cur.seg) : null,
        ok: false,
      }
    }
    r[ej.regId][fechaSel] = ses
    setUd({ ...ud, registros: r })
  }
  function etiquetaPR(ej) {
    const pr = calcularPRs(registrosPR[ej.regId], ej.metrica)
    if (ej.metrica === 'seg') return pr.maxSeg ? `🏆 ${pr.maxSeg}s` : null
    if (ej.metrica === 'reps') return pr.maxReps ? `🏆 ${pr.maxReps} reps${pr.maxKg ? ` · +${pr.maxKg}kg` : ''}` : null
    if (!pr.maxKg) return null
    return `🏆 ${pr.maxKg}kg${pr.maxE1RM > pr.maxKg ? ` · 1RM≈${Math.round(pr.maxE1RM)}` : ''}`
  }

  // ── Peso corporal ──
  const histPeso = ud.histPeso || []
  function addPeso() {
    if (!pesoInput) return
    const nuevoPeso = Number(pesoInput)
    setUd({ ...ud, histPeso: [...histPeso, { fecha: new Date().toLocaleDateString('es-ES'), peso: nuevoPeso, semana: getWeekKey() }] })
    // Sincronizar con pesoActual en Datos para que la nutrición use el peso real
    setDietaUser({ ...dietaData, pesoActual: String(nuevoPeso) })
    setPesoInput('')
  }

  // ── Medidas corporales ──
  const histMedidas = ud.histMedidas || []
  const MEDIDAS_DEF = [
    { k: 'cintura', label: 'Cintura', icon: '📏', color: '#6366f1' },
    { k: 'cadera',  label: 'Cadera',  icon: '🍑', color: '#f97316' },
    { k: 'pecho',   label: 'Pecho',   icon: '💪', color: '#10b981' },
    { k: 'biceps',  label: 'Bíceps',  icon: '💪', color: '#f59e0b' },
    { k: 'muslo',   label: 'Muslo',   icon: '🦵', color: '#8b5cf6' },
  ]
  function addMedida() {
    const vals = Object.fromEntries(Object.entries(medidaForm).filter(([, v]) => v !== '').map(([k, v]) => [k, Number(v)]))
    if (Object.keys(vals).length === 0) return
    setUd({ ...ud, histMedidas: [...histMedidas, { fecha: new Date().toLocaleDateString('es-ES'), ...vals }] })
    setMedidaForm({ cintura: '', cadera: '', pecho: '', biceps: '', muslo: '' })
  }

  // ── Progreso semanal ──
  const progSemanal = ud.progSemanal || {}
  function guardarSemana() {
    const semana = getWeekKey()
    const snapshot = {}
    const visiblesHoy = construirDiasVisibles(DIAS, { alternativas: alternativasActivas, fecha: new Date(), objetivo: user?.objetivo, bloqueInicio: ud.bloqueInicio })
    visiblesHoy.forEach(d => d.ejercicios.forEach(ej => {
      const pr = calcularPRs(registrosPR[ej.regId], ej.metrica)
      const max = ej.metrica === 'seg' ? pr.maxSeg : ej.metrica === 'reps' ? pr.maxReps : pr.maxKg
      const tipo = ej.metrica === 'seg' ? 'tiempo' : ej.metrica === 'reps' ? 'reps' : 'peso'
      if (max) { if (!snapshot[d.id]) snapshot[d.id] = {}; snapshot[d.id][ej.regId] = { nombre: ej.nombre, max, tipo, e1rm: pr.maxE1RM || null } }
    }))
    setUd({ ...ud, progSemanal: { ...progSemanal, [semana]: { snapshot, peso: histPeso.at(-1)?.peso, ciclo: cicloActual, fecha: new Date().toLocaleDateString('es-ES') } } })
    setRevisionBanner({ tipo: 'ok', msg: `Semana ${semana} guardada` })
    setTimeout(() => setRevisionBanner(null), 3000)
  }

  // ── Dieta ──
  const dUser = dietaData || { altura: '', edad: '', pesoActual: '', pesoObj: '', meta: 'recomposicion', sexo: 'hombre' }
  function calcDieta() {
    const { altura, edad, pesoActual, sexo } = dUser
    if (!altura || !edad || !pesoActual) return
    const objetivo = user?.objetivo || 'recomposicion'
    const nivel    = user?.nivel    || 'intermedio'
    // Harris-Benedict revisado (Mifflin-St Jeor)
    const tmb = sexo === 'hombre'
      ? 10 * +pesoActual + 6.25 * +altura - 5 * +edad + 5
      : 10 * +pesoActual + 6.25 * +altura - 5 * +edad - 161
    // Factor actividad según días de entreno (nivel)
    const actFactor = nivel === 'principiante' ? 1.45 : nivel === 'avanzado' ? 1.65 : 1.55
    const tdee = Math.round(tmb * actFactor)
    // Ajuste calórico por objetivo (ISSN + RP guidelines)
    const ajuste = { perder: -450, recomposicion: 0, ganar: 300, fuerza: 200 }
    const kcal = tdee + (ajuste[objetivo] ?? 0)
    // Proteína (g/kg): mayor en déficit para preservar músculo
    const protRatio = { perder: 2.2, recomposicion: 2.0, ganar: 1.9, fuerza: 2.2 }
    const p = Math.round(+pesoActual * (protRatio[objetivo] ?? 2.0))
    // Grasas: mínimo 0.8g/kg corporal
    const g = Math.max(Math.round(+pesoActual * 0.8), Math.round(kcal * 0.22 / 9))
    // Carbos: resto de calorías
    const c = Math.max(0, Math.round((kcal - p * 4 - g * 9) / 4))
    // Ciclado calórico para recomposición
    const kcalEntreno  = objetivo === 'recomposicion' ? tdee + 100 : null
    const kcalDescanso = objetivo === 'recomposicion' ? tdee - 300 : null
    setDietaCalc({ tdee, kcal, p, c, g, objetivo, nivel, kcalEntreno, kcalDescanso })
  }

  // ── Actividades extra ──
  const hoyStr = new Date().toLocaleDateString('es-ES')
  const actividades = ud.actividades || []
  const actividadesHoy = actividades.filter(a => a.fecha === hoyStr)
  const pesoRef = histPeso.at(-1)?.peso || 75

  function guardarActividad() {
    const def = ACTIVIDADES_EXTRA.find(a => a.id === actForm.tipo)
    if (!def || !actForm.minutos) return
    const kcal = calcKcalActividad(def, Number(actForm.minutos), pesoRef)
    const nueva = { fecha: hoyStr, tipo: def.id, nombre: def.nombre, icon: def.icon, minutos: Number(actForm.minutos), km: actForm.km ? Number(actForm.km) : null, kcal }
    setUd({ ...ud, actividades: [...actividades, nueva] })
    setActForm({ tipo: 'correr', minutos: '', km: '' })
    setActividadModal(false)
  }

  function borrarActividad(idx) {
    const fecha = actividadesHoy[idx].fecha
    let ci = -1
    const nuevas = actividades.filter(a => {
      if (a.fecha === fecha) { ci++; return ci !== idx }
      return true
    })
    setUd({ ...ud, actividades: nuevas })
  }

  const kcalTotalHoy = actividadesHoy.reduce((s, a) => s + a.kcal, 0)

  // ── Ciclo ──
  function semanasEnCiclo() {
    if (!user?.cicloSemanaInicio) return 0
    const [ay, aw] = user.cicloSemanaInicio.split('-W').map(Number)
    const [by, bw] = getWeekKey().split('-W').map(Number)
    return (by - ay) * 52 + (bw - aw)
  }
  const semanasCiclo = semanasEnCiclo()
  const semanasRestantes = Math.max(0, cicloInfo.semanas - semanasCiclo)

  // ── Alternativas (catálogo con imágenes verificadas) ─────────────────────
  // La elección se guarda por "hueco" del plan (slot) y el progreso por el
  // ejercicio realizado (regId): cada alternativa tiene su propio historial.
  function seleccionarAlternativa(slot, altId) {
    setUd({ ...ud, alternativasActivas: { ...alternativasActivas, [slot]: altId } })
    setAltAbierta(null)
  }
  function restaurarOriginal(slot) {
    const nuevas = { ...alternativasActivas }
    delete nuevas[slot]
    setUd({ ...ud, alternativasActivas: nuevas })
  }

  // ── Aplicar correcciones de alertas ──────────────────────────────────────
  function aplicarCorreccionAlerta(alerta) {
    if (alerta.tipo === 'deload') {
      updateUser({ cicloActual: 'deload', cicloSemanaInicio: getWeekKey() })
    } else if (alerta.tipo === 'plateau' && alerta.ejId) {
      const diaDe = DIAS_VIS.find(d => d.ejercicios.some(e => e.regId === alerta.ejId))
      const ocupados = diaDe ? diaDe.ejercicios.map(e => e.regId) : []
      const alt = alternativasDe(alerta.ejId, { evitarBarra: !!diaDe?._perfil?.evitarBarra, excluir: ocupados })[0]
      if (alt) setUd({ ...ud, alternativasActivas: { ...alternativasActivas, [alerta.slot || alerta.ejId]: alt.id } })
    }
  }

  // ── Motor de reglas (después de semanasCiclo) ─────────────────────────────
  const reglas = useMemo(() => generarRecomendaciones({
    objetivo: user?.objetivo || 'recomposicion',
    nivel: user?.nivel || 'intermedio',
    semanasCiclo,
    registros: registrosPR,
    histPeso: ud.histPeso || [],
    actividades: ud.actividades || [],
    DIAS: DIAS_VIS,
    perfilFisico: calcularPerfilFisico(dietaData || {}),
    sexo: dietaData?.sexo || null,
    hoy: fechaSel,
  }), [user?.objetivo, user?.nivel, semanasCiclo, registrosPR, ud.histPeso, ud.actividades, DIAS_VIS, fechaSel, dietaData?.edad, dietaData?.pesoActual, dietaData?.altura, dietaData?.sexo])
  const cicloCompletado = semanasCiclo >= cicloInfo.semanas
  function cambiarCiclo(id) { updateUser({ cicloActual: id, cicloSemanaInicio: getWeekKey() }); setMostrarCiclos(false); setEjAbierto(null) }

  // Auth: pantalla de login (solo si Supabase está configurado y no hay sesión)
  if (authSession === null) return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: 'var(--c-f5f5f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 48 }}>⏳</div>
    </div>
  )
  if (authSession === false && supabase) return <AuthScreen />

  // Pantalla de usuarios
  if (!userId) return (
    <PantallaUsuarios
      users={users} loading={usersLoading}
      maxProfiles={maxProfiles} plan={plan}
      onUpgrade={() => startCheckout(authSession?.user?.email)}
      onSelect={async u => {
        // Si el perfil no está vinculado a este auth user, vincularlo ahora
        if (authSession?.user && !u.authUserId) {
          const vinculado = { ...u, authUserId: authSession.user.id }
          setUsers(prev => prev.map(p => p.id === u.id ? vinculado : p))
          await upsertProfile(vinculado)
        }
        setUserId(u.id); setTab('entreno')
        if (!localStorage.getItem(`onboarding_v${ONBOARDING_VERSION}_${u.id}`)) {
          // Buscar la versión más alta que ya vio este usuario
          let prevVer = 0
          for (let v = ONBOARDING_VERSION - 1; v >= 1; v--) {
            if (localStorage.getItem(`onboarding_v${v}_${u.id}`)) { prevVer = v; break }
          }
          setOnboardingPrevVersion(prevVer)
          setShowOnboarding(true)
        }
      }}
      onCreate={async u => {
        // Solo vincular al auth user si no hay ya un perfil vinculado — evita que perfiles de prueba roben el auto-login
        const yaVinculado = users.some(p => p.authUserId === authSession?.user?.id)
        const conAuth = (!yaVinculado && authSession?.user) ? { ...u, authUserId: authSession.user.id } : u
        setUsers(prev => [...prev, conAuth])
        await upsertProfile(conAuth)
        setUserId(conAuth.id); setTab('entreno')
        setOnboardingPrevVersion(0) // usuario nuevo → tutorial completo
        setShowOnboarding(true)
      }}
      onDelete={async id => {
        setUsers(prev => prev.filter(u => u.id !== id))
        await deleteProfile(id)
      }}
      onSignOut={supabase ? signOut : null}
    />
  )

  if (udLoading) return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: 'var(--c-f5f5f7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 48 }}>{user?.avatar}</div>
      <div style={{ fontSize: 16, color: 'var(--c-8e8e93)' }}>Cargando datos de {user?.nombre}…</div>
    </div>
  )

  const TABS = [
    { id: 'entreno', icon: '🏋️', label: 'Entreno' },
    { id: 'datos', icon: '📊', label: 'Datos' },
    { id: 'dieta', icon: '🥗', label: 'Dieta' },
    { id: 'marcas', icon: '🏆', label: 'Marcas' },
    { id: 'progreso', icon: '📈', label: 'Progreso' },
  ]

  return (
    <div style={S.page}>
      {/* HEADER */}
      <div style={S.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--c-1c1c1e)', letterSpacing: -0.5 }}>
              {tab === 'entreno' ? '🏋️ Entreno' : tab === 'datos' ? '📊 Mis datos' : tab === 'dieta' ? '🥗 Nutrición' : tab === 'marcas' ? '🏆 Marcas' : '📈 Progreso'}
            </h1>
            <div style={{ fontSize: 13, color: 'var(--c-8e8e93)', marginTop: 3 }}>
              {tab === 'entreno' ? `Rutina ${DIAS.length} días · ${OBJETIVOS.find(o => o.id === user?.objetivo)?.nombre || 'Recomposición'}` :
               tab === 'datos' ? 'Perfil físico y seguimiento de peso' :
               tab === 'dieta' ? 'Plan personalizado de alimentación' : tab === 'marcas' ? 'Catálogo de ejercicios y récords' : 'Historial y evolución semanal'}
            </div>
          </div>
          <button onClick={() => setUserId(null)} aria-label={`Cambiar de perfil (${user?.nombre || ''})`}
            style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--c-eef2ff)', border: 'none', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user?.avatar}
          </button>
        </div>
        {/* Frase motivacional del día */}
        <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--c-f5f5f7)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: '#6366f1', fontStyle: 'italic', lineHeight: 1.4 }}>
            💬 {getQuoteOfDay()}
          </div>
        </div>

        {tab === 'entreno' && (
          <button onClick={() => setMostrarCiclos(!mostrarCiclos)}
            style={{ marginTop: 12, width: '100%', padding: '10px 14px', borderRadius: 12, background: tinte(cicloInfo.color), border: `1px solid ${cicloInfo.color}30`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: cicloInfo.color }}>Ciclo: {cicloInfo.nombre}</div>
              <div style={{ fontSize: 11, color: 'var(--c-8e8e93)', marginTop: 2 }}>
                {cicloCompletado ? '⚠️ ¡Ciclo completado! Cambia al siguiente' : `Semana ${semanasCiclo + 1}/${cicloInfo.semanas} · ${semanasRestantes} sem. restantes`}
              </div>
            </div>
            <span style={{ fontSize: 12, color: cicloInfo.color, fontWeight: 700 }}>Cambiar ▼</span>
          </button>
        )}
      </div>

      {/* Modal ciclos */}
      {mostrarCiclos && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={() => setMostrarCiclos(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 430, margin: '0 auto', padding: 20, paddingBottom: 40 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Cambiar ciclo de entrenamiento</div>
            <div style={{ fontSize: 13, color: 'var(--c-8e8e93)', marginBottom: 16, lineHeight: 1.5 }}>La ciencia recomienda cambiar el estímulo cada <b>4–6 semanas</b> para evitar estancamientos.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CICLOS.map(c => (
                <button key={c.id} onClick={() => cambiarCiclo(c.id)}
                  style={{ padding: '14px 16px', borderRadius: 14, background: c.id === cicloActual ? tinte(c.color) : 'var(--c-f5f5f7)', border: c.id === cicloActual ? `2px solid ${c.color}` : '2px solid transparent', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: c.id === cicloActual ? c.color : 'var(--c-1c1c1e)' }}>{c.nombre}</span>
                    <span style={{ fontSize: 11, color: 'var(--c-8e8e93)' }}>{c.semanas} {c.semanas === 1 ? 'semana' : 'semanas'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--c-8e8e93)', marginTop: 4 }}>{c.descripcion}</div>
                  {c.id === cicloActual && <div style={{ fontSize: 11, fontWeight: 700, color: c.color, marginTop: 4 }}>✓ Activo</div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '16px 12px 0' }}>

        {/* ══════════ ENTRENO ══════════ */}
        {tab === 'entreno' && (
          <>
            {/* Banner revisión semanal */}
            {revisionBanner && (
              <div style={{ background: 'var(--c-f0fdf4)', borderRadius: 14, padding: '12px 16px', marginBottom: 12, border: '1.5px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>{revisionBanner.semana ? `✅ Revisión semanal aplicada · ${revisionBanner.semana}` : '✅ Hecho'}</div>
                  <button onClick={() => setRevisionBanner(null)} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: 16, cursor: 'pointer', padding: 0 }}>✕</button>
                </div>
                {revisionBanner.msg && <div style={{ fontSize: 12, color: 'var(--c-065f46)' }}>{revisionBanner.msg}</div>}
                {(revisionBanner.cambios || []).map((c, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--c-065f46)', marginBottom: 2 }}>{c}</div>
                ))}
              </div>
            )}
            {/* Calendario — hoy siempre a la izquierda, navegación prev/next */}
            {(() => {
              const hoy = startOfDay(new Date())
              const dias = Array.from({ length: 7 }, (_, i) => addDays(calStart, i))
              const mesLabel = (() => {
                const m0 = calStart.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                const m6 = addDays(calStart, 6).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                return m0 === m6 ? m0.replace(/^\w/, c => c.toUpperCase()) : `${calStart.toLocaleDateString('es-ES',{month:'short'})} – ${addDays(calStart,6).toLocaleDateString('es-ES',{month:'short', year:'numeric'})}`
              })()
              return (
                <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '14px 12px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <button onClick={() => setCalStart(d => addDays(d, -7))}
                      style={{ border: 'none', background: 'var(--c-f2f2f7)', borderRadius: 8, width: 30, height: 30, fontSize: 16, cursor: 'pointer', display:'flex',alignItems:'center',justifyContent:'center' }}>‹</button>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-1c1c1e)' }}>{mesLabel}</div>
                    <button onClick={() => setCalStart(d => addDays(d, 7))}
                      style={{ border: 'none', background: 'var(--c-f2f2f7)', borderRadius: 8, width: 30, height: 30, fontSize: 16, cursor: 'pointer', display:'flex',alignItems:'center',justifyContent:'center' }}>›</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                    {dias.map((fecha, i) => {
                      const dow = fecha.getDay()
                      const esFindeSlot = dow === 0 || dow === 6
                      const esHoy = fecha.getTime() === hoy.getTime()
                      const esSeleccionado = fecha.getTime() === selectedDate.getTime()
                      const diaPlantilla = DIAS.find(d => d.id === DOW_TO_ID[dow])
                      const tieneEntreno = !esFindeSlot && !!diaPlantilla
                      const fechaKeyStr = fecha.toLocaleDateString('es-ES')
                      const yaEntrenoEseDia = Object.values(registros).some(ej => ej[fechaKeyStr] && Object.keys(ej[fechaKeyStr]).length > 0)
                      return (
                        <button key={i} onClick={() => { setSelectedDate(fecha); setEjAbierto(null); setAltAbierta(null) }}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 12, border: esHoy && !esSeleccionado ? `2px solid ${cicloInfo.color}` : '2px solid transparent', cursor: 'pointer', background: esSeleccionado ? cicloInfo.color : 'transparent', transition: 'all .15s' }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: esSeleccionado ? '#fff' : 'var(--c-8e8e93)' }}>{DIAS_SEMANA_LABEL[dow]}</span>
                          <span style={{ fontSize: 17, fontWeight: 800, color: esSeleccionado ? '#fff' : esHoy ? cicloInfo.color : 'var(--c-1c1c1e)' }}>{fecha.getDate()}</span>
                          {yaEntrenoEseDia
                            ? <span style={{ fontSize: 11, lineHeight: 1, color: esSeleccionado ? '#fff' : '#10b981' }}>✓</span>
                            : <span style={{ fontSize: 13, lineHeight: 1 }}>{esFindeSlot ? '🏖️' : tieneEntreno ? diaPlantilla.emoji : '·'}</span>
                          }
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* Banner día */}
            {(() => {
              const fecha = selectedDate
              const hoy = startOfDay(new Date())
              const esHoy = fecha.getTime() === hoy.getTime()
              const fechaStr = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
              const fechaKeyStr = fecha.toLocaleDateString('es-ES')
              const yaEntrenoEseDia = Object.values(registros).some(ej => ej[fechaKeyStr] && Object.keys(ej[fechaKeyStr]).length > 0)
              if (esFinde) return (
                <div style={{ ...S.card, background: 'var(--c-ecfdf5)', marginBottom: 12 }}>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>🏖️ Descanso activo</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {yaEntrenoEseDia && <span style={{ fontSize: 11, fontWeight: 700, background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: 20 }}>✓ Entrenado</span>}
                        {esHoy && <span style={{ fontSize: 11, fontWeight: 700, background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: 20 }}>Hoy</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#10b981', marginTop: 4, fontWeight: 500, textTransform: 'capitalize' }}>{fechaStr}</div>
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--c-8e8e93)' }}>💤 Sin pesas hoy — registra actividades como pádel, ruta, bici…</div>
                  </div>
                </div>
              )
              return (
                <div style={{ ...S.card, background: tinte(dia.color), marginBottom: 12 }}>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: cicloInfo.color }}>{dia.emoji} {dia.enfoque}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {yaEntrenoEseDia && <span style={{ fontSize: 11, fontWeight: 700, background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: 20 }}>✓ Entrenado</span>}
                        {esHoy && <span style={{ fontSize: 11, fontWeight: 700, background: cicloInfo.color, color: '#fff', padding: '3px 10px', borderRadius: 20 }}>Hoy</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: cicloInfo.color, marginTop: 4, fontWeight: 500, textTransform: 'capitalize' }}>{fechaStr}</div>
                    {dia.circuito && <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: cicloInfo.color }}>⚡ CIRCUITO – {dia.vueltas} VUELTAS · descanso 2 min</div>}
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--c-8e8e93)' }}>🏃 {dia.cardio}</div>
                  </div>
                </div>
              )
            })()}

            {/* Actividad extra del día */}
            <div style={{ ...S.card, marginBottom: 12 }}>
              <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-1c1c1e)' }}>🔥 Actividad extra</div>
                  {kcalTotalHoy > 0
                    ? <div style={{ fontSize: 12, color: '#f97316', marginTop: 2, fontWeight: 600 }}>{kcalTotalHoy} kcal quemadas hoy</div>
                    : <div style={{ fontSize: 12, color: 'var(--c-8e8e93)', marginTop: 2 }}>Elíptica, pádel, correr…</div>}
                </div>
                <button onClick={() => setActividadModal(true)}
                  style={{ padding: '8px 14px', borderRadius: 12, background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>+ Añadir</button>
              </div>
              {actividadesHoy.length > 0 && (
                <div style={{ borderTop: '1px solid var(--c-f2f2f7)' }}>
                  {actividadesHoy.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: i < actividadesHoy.length - 1 ? '1px solid var(--c-f2f2f7)' : 'none' }}>
                      <span style={{ fontSize: 22 }}>{a.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{a.nombre}</div>
                        <div style={{ fontSize: 12, color: 'var(--c-8e8e93)', marginTop: 1 }}>
                          {a.minutos} min{a.km ? ` · ${a.km} km` : ''}
                        </div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#f97316' }}>{a.kcal} kcal</span>
                      <button onClick={() => borrarActividad(i)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--c-c7c7cc)', padding: '4px 6px' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resumen de la sesión */}
            {!esFinde && (() => {
              let series = 0, vol = 0, prsHoy = 0
              dia.ejercicios.forEach(ej => {
                const ses = getSesion(ej.regId)
                const prPrev = calcularPRs(registrosPR[ej.regId], ej.metrica, { excluir: fechaSel })
                const ss = seriesSesion(ses, ej.metrica)
                series += ss.filter(x => x.ok).length
                vol += volumenSesion(ses, ej.metrica)
                if (ss.some(x => prsDeSerie(x, prPrev, ej.metrica).length)) prsHoy++
              })
              const totalSeries = dia.ejercicios.reduce((a, e) => a + e.series, 0)
              if (!series && !vol) return null
              return (
                <div style={{ ...S.card, padding: '12px 16px', marginBottom: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
                  <div><div style={{ fontSize: 18, fontWeight: 800, color: cicloInfo.color }}>{series}/{totalSeries}</div><div style={{ fontSize: 11, color: 'var(--c-8e8e93)' }}>series hechas</div></div>
                  <div><div style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-1c1c1e)' }}>{vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${Math.round(vol)}kg`}</div><div style={{ fontSize: 11, color: 'var(--c-8e8e93)' }}>volumen</div></div>
                  <div><div style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-b45309)' }}>{prsHoy}</div><div style={{ fontSize: 11, color: 'var(--c-8e8e93)' }}>🏆 récords</div></div>
                </div>
              )
            })()}

            {!esFinde && esFuturo && (
              <div style={{ fontSize: 12, color: 'var(--c-8e8e93)', textAlign: 'center', marginBottom: 10 }}>Día futuro: puedes ver la rutina, el registro se activa ese día.</div>
            )}

            {/* Ejercicios */}
            {!esFinde && dia.ejercicios.map((ej, idx) => {
              const open = ejAbierto === ej.slot
              const altOpen = altAbierta === ej.slot
              const esManual = ej.motivo === 'manual'
              const esRotacion = ej.motivo === 'rotacion'
              const sesion = getSesion(ej.regId)
              const hechas = seriesSesion(sesion, ej.metrica).filter(x => x.ok).length
              const prPrevio = calcularPRs(registrosPR[ej.regId], ej.metrica, { excluir: fechaSel })
              const etiquetaMax = etiquetaPR(ej)
              const esDeload = String(ej.reps).includes('deload') || cicloActual === 'deload'
              const ocupados = dia.ejercicios.map(e => e.regId)
              const alts = alternativasDe(ej.regId, { evitarBarra: !!dia._perfil?.evitarBarra, excluir: ocupados })
              const sug = reglas.recomendaciones[ej.regId]
              const repsLabel = ej.metrica === 'seg' ? `${ej.reps}s` : ej.reps
              const borde = open ? `2px solid ${cicloInfo.color}` : hechas >= ej.series ? '2px solid #10b981' : esManual ? '2px solid var(--c-a7f3d0)' : '2px solid transparent'

              return (
                <div key={ej.slot} style={{ ...S.card, border: borde }}>
                  <button onClick={() => { setEjAbierto(open ? null : ej.slot); setAltAbierta(null) }}
                    style={{ width: '100%', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={ej.gif} alt="" referrerPolicy="no-referrer" loading="lazy"
                      style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'contain', background: '#fff', border: '1px solid var(--c-f2f2f7)', flexShrink: 0 }}
                      onError={e => { e.target.style.visibility = 'hidden' }} />
                    <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-1c1c1e)' }}>{idx + 1}. {ej.nombre}</div>
                      <div style={{ fontSize: 12, color: 'var(--c-8e8e93)', marginTop: 2 }}>{ej.musculo}</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 3 }}>
                        {ej._sustituido && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-b45309)', background: 'var(--c-fffbeb)', borderRadius: 6, padding: '1px 6px' }}>⚡ Adaptado · antes: {ej._sustituido}</span>}
                        {esRotacion && <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', background: 'var(--c-eef2ff)', borderRadius: 6, padding: '1px 6px' }}>🔁 Rotación del bloque · sustituye a {ej.nombrePlan}</span>}
                        {esManual && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-047857)', background: 'var(--c-dcfce7)', borderRadius: 6, padding: '1px 6px' }}>🔄 Elegido por ti · plan: {ej.nombrePlan}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', marginRight: 4, flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: cicloInfo.color }}>{ej.series}×{repsLabel}</div>
                      {hechas > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>✓ {hechas}/{ej.series}</div>}
                      {etiquetaMax && <div style={{ fontSize: 11, color: 'var(--c-8e8e93)' }}>{etiquetaMax}</div>}
                    </div>
                    <span style={{ color: 'var(--c-c7c7cc)', fontSize: 11 }}>{open ? '▲' : '▼'}</span>
                  </button>

                  {open && (
                    <div style={{ borderTop: '1px solid var(--c-f2f2f7)', padding: '14px 16px' }}>
                      <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, position: 'relative' }}>
                        <img src={ej.gif} alt={ej.nombre} referrerPolicy="no-referrer"
                          style={{ width: '100%', maxHeight: 280, objectFit: 'contain', display: 'block' }}
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                        <div style={{ display: 'none', position: 'absolute', inset: 0, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--c-8e8e93)' }}>
                          <span style={{ fontSize: 40 }}>🏋️</span>
                          <span style={{ fontSize: 13 }}>{ej.nombre}</span>
                        </div>
                      </div>

                      <div style={{ background: tinte(cicloInfo.color), borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: cicloInfo.color, marginBottom: 3 }}>{cicloInfo.nombre}: {ej.series} series × {ej.metrica === 'seg' ? `${ej.reps} seg` : `${ej.reps} reps`}</div>
                        <div style={{ fontSize: 12, color: 'var(--c-3c3c43)', lineHeight: 1.4 }}>{ej.tip}</div>
                        {esDeload && <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4, fontWeight: 600 }}>⚡ Deload: usa ~50% de tu peso habitual</div>}
                        {esRotacion && <div style={{ fontSize: 11, color: '#6366f1', marginTop: 4 }}>🔁 Variante de este bloque de entrenamiento (próximo cambio de bloque en {semanasHastaRotacion(selectedDate)} sem). Su progreso se guarda aparte.</div>}
                      </div>

                      {/* Sugerencia de progresión */}
                      {sug?.mensaje && (() => {
                        const colorMap = { subir_peso: '#10b981', estancado: '#f97316', mantener: '#6366f1' }
                        const bgMap = { subir_peso: 'var(--c-f0fdf4)', estancado: 'var(--c-fff7ed)', mantener: 'var(--c-eef2ff)' }
                        const color = colorMap[sug.estado] || 'var(--c-8e8e93)'
                        const puedeAplicar = !esFuturo && (sug.kgObjetivo || sug.repsObjetivo || sug.segObjetivo)
                        return (
                          <div style={{ background: bgMap[sug.estado] || 'var(--c-f5f5f7)', borderRadius: 10, padding: '10px 12px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                                {sug.estado === 'subir_peso' ? '🚀 Sube de peso' : sug.estado === 'estancado' ? '⚠️ Estancamiento' : '🎯 Objetivo sesión'}
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-1c1c1e)' }}>{sug.mensaje}</div>
                            </div>
                            {puedeAplicar && (
                              <button onClick={() => aplicarSugerencia(ej, sug)}
                                style={{ flexShrink: 0, padding: '7px 12px', borderRadius: 10, border: 'none', background: color, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                Rellenar ↗
                              </button>
                            )}
                          </div>
                        )
                      })()}

                      <TablaSeries key={`${ej.regId}-${fechaSel}`} ej={ej} sesion={sesion} sesionPrevia={getSesionPrevia(ej.regId)}
                        prPrevio={prPrevio} sug={sug} editable={!esFuturo} color={cicloInfo.color}
                        onChange={(n, patch) => guardarSerie(ej, n, patch)}
                        onCheck={(n, ok, ph) => marcarSerie(ej, n, ok, ph, idx === 0)}
                        onNota={texto => guardarNota(ej, texto)}
                        onDiscos={ej.metrica === 'kg_reps' ? kg => setDiscos({ nombre: ej.nombre, kg, barra: !!CATALOGO[ej.regId]?.barra || /barra/i.test(ej.nombre) }) : null} />

                      {/* Descanso manual */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                        {[60, 90, 120, 180].map(seg => (
                          <button key={seg} onClick={() => iniciarDescanso(ej.nombre, seg)}
                            style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: '1px solid var(--c-e5e5ea)', background: 'var(--c-f5f5f7)', color: 'var(--c-3c3c43)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            ⏱ {seg < 60 ? `${seg}s` : `${Math.floor(seg / 60)}'`}{seg % 60 !== 0 && seg > 60 ? `${seg % 60}` : ''}
                          </button>
                        ))}
                      </div>

                      {/* Historial: mejor serie de las últimas sesiones */}
                      {sug?.historialReciente?.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-8e8e93)', marginBottom: 6 }}>MEJOR SERIE · ÚLTIMAS SESIONES</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {sug.historialReciente.map((h, i) => {
                              const isLast = i === sug.historialReciente.length - 1
                              const isBetter = i > 0 && h.valor > sug.historialReciente[i - 1].valor
                              return (
                                <div key={i} style={{ flex: 1, background: isLast ? 'var(--c-f0fdf4)' : 'var(--c-f5f5f7)', borderRadius: 8, padding: '5px 4px', textAlign: 'center', border: isLast ? '1px solid #10b981' : '1px solid transparent', minWidth: 0 }}>
                                  <div style={{ fontSize: 9, color: 'var(--c-8e8e93)', marginBottom: 2 }}>{h.fecha.split('/').slice(0, 2).join('/')}</div>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: isLast ? '#10b981' : 'var(--c-1c1c1e)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.display}</div>
                                  {isBetter && <div style={{ fontSize: 8, color: '#10b981' }}>▲</div>}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Alternativas */}
                      <div style={{ display: 'flex', gap: 8, marginBottom: altOpen ? 10 : 0 }}>
                        <button onClick={() => setAltAbierta(altOpen ? null : ej.slot)}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: `1px solid ${cicloInfo.color}`, background: 'transparent', color: cicloInfo.color, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                          🔄 {altOpen ? 'Ocultar' : `Cambiar ejercicio (${alts.length})`}
                        </button>
                        {(esManual || esRotacion) && (
                          <button onClick={() => esManual ? restaurarOriginal(ej.slot) : seleccionarAlternativa(ej.slot, ej.slot)}
                            style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid var(--c-e5e5ea)', background: 'var(--c-f5f5f7)', color: 'var(--c-8e8e93)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                            ↩ {esManual ? 'Volver al plan' : 'Fijar original'}
                          </button>
                        )}
                      </div>
                      {altOpen && (
                        <div style={{ background: 'var(--c-f5f5f7)', borderRadius: 12, overflow: 'hidden' }}>
                          {alts.map((alt, i) => {
                            const misma = alt.familia && alt.familia === CATALOGO[ej.regId]?.familia
                            const prAlt = etiquetaPR({ ...alt, regId: alt.id })
                            return (
                              <button key={alt.id} onClick={() => seleccionarAlternativa(ej.slot, alt.id)}
                                style={{ width: '100%', padding: '10px 12px', borderBottom: i < alts.length - 1 ? '1px solid var(--c-e5e5ea)' : 'none', background: misma ? 'var(--c-f0fdf4)' : 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                                <img src={alt.gif} alt={alt.nombre} referrerPolicy="no-referrer" loading="lazy"
                                  style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'contain', background: '#fff', flexShrink: 0 }}
                                  onError={e => { e.target.style.visibility = 'hidden' }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-1c1c1e)' }}>{alt.nombre}</div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: misma ? '#10b981' : 'var(--c-8e8e93)', background: misma ? 'var(--c-dcfce7)' : 'var(--c-e5e5ea)', padding: '1px 6px', borderRadius: 6 }}>
                                      {misma ? '✓ Mismo patrón' : `${alt.grupo} · ${alt.zona.replace('_', ' ')}`}
                                    </span>
                                    {prAlt && <span style={{ fontSize: 10, color: 'var(--c-8e8e93)' }}>{prAlt}</span>}
                                  </div>
                                </div>
                                <span style={{ fontSize: 12, color: cicloInfo.color, fontWeight: 700, flexShrink: 0 }}>Usar →</span>
                              </button>
                            )
                          })}
                          {alts.length === 0 && <div style={{ padding: 16, textAlign: 'center', color: 'var(--c-8e8e93)', fontSize: 13 }}>No hay alternativas para este ejercicio.</div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {!esFinde && !esFuturo && dia.ejercicios.some(ej => seriesSesion(getSesion(ej.regId), ej.metrica).some(x => x.ok)) && (
              <button type="button" onClick={abrirResumen}
                style={{ ...S.btnPrimary(cicloInfo.color), marginTop: 6, marginBottom: 10 }}>
                🏁 {sesionesInfo[fechaSel]?.fin ? 'Ver resumen del entreno' : 'Terminar entreno'}
              </button>
            )}
          </>
        )}

        {/* ══════════ PESO ══════════ */}
        {tab === 'datos' && (
          <>
            {/* ── Datos físicos ── */}
            <div style={{ ...S.card, padding: 16, marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Datos físicos</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                {[['Altura (cm)', 'altura', '175'], ['Edad (años)', 'edad', '30'], ['Peso objetivo (kg)', 'pesoObj', '75']].map(([l, k, ph]) => (
                  <div key={k}><div style={S.label}>{l}</div>
                    <input type="number" inputMode="decimal" placeholder={ph} value={dUser[k] || ''} onChange={e => setDietaUser({ ...dUser, [k]: e.target.value })} style={S.input} /></div>
                ))}
                <div><div style={S.label}>Peso actual (kg)</div>
                  <input type="number" inputMode="decimal" placeholder="80" value={dUser.pesoActual || ''} onChange={e => setDietaUser({ ...dUser, pesoActual: e.target.value })} style={S.input} />
                </div>
              </div>
              <div style={S.label}>Sexo biológico</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[['hombre', '♂ Hombre'], ['mujer', '♀ Mujer']].map(([v, l]) => (
                  <button key={v} style={{ ...S.btnPill(dUser.sexo === v, '#6366f1'), flex: 1 }} onClick={() => setDietaUser({ ...dUser, sexo: v })}>{l}</button>
                ))}
              </div>
              <div style={S.label}>Objetivo</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {OBJETIVOS.map(o => (
                  <button key={o.id} style={{ ...S.btnPill(user?.objetivo === o.id, '#6366f1'), flex: '1 1 auto' }}
                    onClick={() => updateUser({ objetivo: o.id })}>{o.icon} {o.nombre}</button>
                ))}
              </div>
              <div style={S.label}>Nivel</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {NIVELES.map(n => (
                  <button key={n.id} style={{ ...S.btnPill(user?.nivel === n.id, '#6366f1'), flex: 1 }}
                    onClick={() => updateUser({ nivel: n.id })}>{n.icon} {n.nombre}</button>
                ))}
              </div>
            </div>

            {/* ── Medidas corporales ── */}
            <div style={{ ...S.card, padding: 16, marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>📐 Medidas corporales <span style={{ fontSize: 11, color: 'var(--c-8e8e93)', fontWeight: 400 }}>(cm)</span></div>

              {/* Últimas medidas como chips */}
              {histMedidas.length > 0 && (() => {
                const ultima = histMedidas.at(-1)
                const anterior = histMedidas.length > 1 ? histMedidas.at(-2) : null
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 14 }}>
                    {MEDIDAS_DEF.map(({ k, label, icon, color }) => {
                      const val = ultima[k]
                      const prev = anterior?.[k]
                      const delta = val && prev ? (val - prev).toFixed(1) : null
                      if (!val) return <div key={k} style={{ background: 'var(--c-f5f5f7)', borderRadius: 10, padding: '8px 4px', textAlign: 'center' }}><div style={{ fontSize: 14 }}>{icon}</div><div style={{ fontSize: 9, color: 'var(--c-8e8e93)', marginTop: 2 }}>{label}</div><div style={{ fontSize: 11, color: 'var(--c-aeaeb2)' }}>—</div></div>
                      return (
                        <div key={k} style={{ background: `${color}12`, borderRadius: 10, padding: '8px 4px', textAlign: 'center', border: `1px solid ${color}30` }}>
                          <div style={{ fontSize: 14 }}>{icon}</div>
                          <div style={{ fontSize: 9, color, fontWeight: 700, marginTop: 2 }}>{label}</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-1c1c1e)' }}>{val}</div>
                          {delta !== null && <div style={{ fontSize: 9, color: Number(delta) <= 0 ? '#10b981' : '#f97316', fontWeight: 600 }}>{Number(delta) > 0 ? '+' : ''}{delta}</div>}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              {/* Formulario de registro */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                {MEDIDAS_DEF.map(({ k, label }) => (
                  <div key={k}>
                    <div style={S.label}>{label} (cm)</div>
                    <input type="number" inputMode="decimal" placeholder="—"
                      value={medidaForm[k]} onChange={e => setMedidaForm(f => ({ ...f, [k]: e.target.value }))}
                      style={{ ...S.input, textAlign: 'center' }} />
                  </div>
                ))}
              </div>
              <button onClick={addMedida} style={{ ...S.btnPrimary('#6366f1'), borderRadius: 12 }}>
                Guardar medidas
              </button>

              {/* Historial compacto */}
              {histMedidas.length > 1 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, color: 'var(--c-8e8e93)', fontWeight: 600, marginBottom: 8 }}>HISTORIAL</div>
                  {[...histMedidas].reverse().slice(0, 6).map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: i > 0 ? '1px solid var(--c-f2f2f7)' : 'none' }}>
                      <span style={{ fontSize: 12, color: 'var(--c-8e8e93)' }}>{m.fecha}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {MEDIDAS_DEF.filter(({ k }) => m[k]).map(({ k, label, color }) => (
                          <span key={k} style={{ fontSize: 11, fontWeight: 700, color, background: `${color}15`, padding: '2px 7px', borderRadius: 8 }}>
                            {label[0]}: {m[k]}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Log de peso ── */}
            <div style={{ ...S.card, padding: 16 }}>
              <div style={S.label}>Peso de hoy</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input type="number" inputMode="decimal" placeholder="ej: 78.5" value={pesoInput} onChange={e => setPesoInput(e.target.value)} style={{ ...S.input, flex: 1, fontSize: 20, fontWeight: 700 }} />
                <span style={{ padding: '12px 0', color: 'var(--c-8e8e93)', fontWeight: 600, alignSelf: 'center' }}>kg</span>
                <button onClick={addPeso} style={{ ...S.btnPrimary('#6366f1'), width: 'auto', padding: '12px 20px', borderRadius: 12 }}>Guardar</button>
              </div>
            </div>
            {histPeso.length > 0 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div style={{ ...S.card, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--c-8e8e93)' }}>Peso actual</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#6366f1', marginTop: 4 }}>{histPeso.at(-1).peso}</div>
                    <div style={{ fontSize: 13, color: 'var(--c-8e8e93)' }}>kg</div>
                  </div>
                  <div style={{ ...S.card, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--c-8e8e93)' }}>Cambio total</div>
                    {histPeso.length > 1
                      ? <><div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: histPeso.at(-1).peso <= histPeso[0].peso ? '#10b981' : '#f97316' }}>{(histPeso.at(-1).peso - histPeso[0].peso > 0 ? '+' : '')}{(histPeso.at(-1).peso - histPeso[0].peso).toFixed(1)}</div><div style={{ fontSize: 13, color: 'var(--c-8e8e93)' }}>kg</div></>
                      : <div style={{ fontSize: 22, marginTop: 8 }}>—</div>}
                  </div>
                </div>
                <div style={{ ...S.card, padding: 16, marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-8e8e93)', marginBottom: 14 }}>Evolución</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 80 }}>
                    {histPeso.slice(-14).map((e, i, arr) => {
                      const pesos = arr.map(x => x.peso), min = Math.min(...pesos), rng = Math.max(...pesos) - min || 1
                      const h = Math.round(((e.peso - min) / rng) * 56 + 16)
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <div style={{ width: '100%', height: h, borderRadius: '4px 4px 0 0', background: i === arr.length - 1 ? '#6366f1' : 'var(--c-e0e0f0)' }} />
                          {i === arr.length - 1 && <div style={{ fontSize: 9, color: '#6366f1', fontWeight: 700 }}>{e.peso}</div>}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ padding: '14px 16px 8px', fontSize: 13, fontWeight: 700, color: 'var(--c-8e8e93)' }}>HISTORIAL</div>
                  {[...histPeso].reverse().slice(0, 15).map((e, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--c-f2f2f7)' }}>
                      <span style={{ fontSize: 14, color: 'var(--c-3c3c43)' }}>{e.fecha}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {e.semana && <span style={{ fontSize: 11, color: 'var(--c-8e8e93)', background: 'var(--c-f5f5f7)', padding: '2px 8px', borderRadius: 8 }}>{e.semana}</span>}
                        <span style={{ fontSize: 16, fontWeight: 700 }}>{e.peso} kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--c-8e8e93)' }}><div style={{ fontSize: 48 }}>⚖️</div><div style={{ marginTop: 12 }}>Registra tu primer pesaje</div></div>}
          </>
        )}

        {/* ══════════ DIETA ══════════ */}
        {tab === 'dieta' && (
          <>
            {/* Perfil de entrenamiento activo → informa la dieta */}
            {user && (() => {
              const objId = user.objetivo || 'recomposicion'
              const nivId = user.nivel    || 'intermedio'
              const objInfo = OBJETIVOS.find(o => o.id === objId) || OBJETIVOS[0]
              const nivInfo = NIVELES.find(n => n.id === nivId)   || NIVELES[0]
              return (
                <div style={{ ...S.card, padding: '12px 16px', marginBottom: 10, background: 'var(--c-eef2ff)', border: '1px solid var(--c-c7d2fe)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', marginBottom: 6 }}>🎯 Dieta adaptada a tu perfil de entrenamiento</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      [objInfo.icon, objInfo.nombre, 'Objetivo'],
                      [nivInfo.icon, nivInfo.nombre, 'Nivel'],
                      [esFinde ? '🏖️' : '💪', esFinde ? 'Descanso' : 'Entreno', 'Hoy'],
                    ].map(([icon, nombre, label]) => (
                      <div key={label} style={{ flex: 1, background: 'var(--surface)', borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
                        <div style={{ fontSize: 18 }}>{icon}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', marginTop: 2 }}>{nombre}</div>
                        <div style={{ fontSize: 9, color: 'var(--c-8e8e93)' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Banner de datos — si faltan datos redirige a Datos */}
            {(!dUser.altura || !dUser.edad || !dUser.pesoActual) ? (
              <div style={{ ...S.card, padding: 16, marginBottom: 10, background: 'var(--c-fff7ed)', border: '1px solid var(--c-fed7aa)', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-9a3412)', marginBottom: 6 }}>Completa tus datos físicos</div>
                <div style={{ fontSize: 12, color: 'var(--c-c2410c)', marginBottom: 12 }}>Para calcular tu plan de nutrición necesitas altura, edad y peso.</div>
                <button style={{ ...S.btnPrimary('#f97316'), borderRadius: 12 }} onClick={() => setTab('datos')}>
                  Ir a Datos →
                </button>
              </div>
            ) : (
              <div style={{ ...S.card, padding: 16, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-1c1c1e)' }}>Tu plan nutricional</div>
                  <button style={{ fontSize: 11, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }} onClick={() => setTab('datos')}>Editar datos →</button>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {[
                    [dUser.pesoActual + ' kg', 'Peso'],
                    [dUser.altura + ' cm', 'Altura'],
                    [dUser.edad + ' años', 'Edad'],
                    [dUser.sexo === 'mujer' ? '♀ Mujer' : '♂ Hombre', 'Sexo'],
                  ].map(([val, lbl]) => (
                    <div key={lbl} style={{ background: 'var(--c-f5f5f7)', borderRadius: 10, padding: '6px 10px', textAlign: 'center', minWidth: 70 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>{val}</div>
                      <div style={{ fontSize: 10, color: 'var(--c-8e8e93)' }}>{lbl}</div>
                    </div>
                  ))}
                </div>
                <button style={S.btnPrimary('#6366f1')} onClick={calcDieta}>Calcular mi plan</button>
              </div>
            )}

            {dietaCalc && (() => {
              const objetivo = dietaCalc.objetivo || user?.objetivo || 'recomposicion'
              const platos = getPlatosByObjetivo(objetivo, !esFinde)
              const esRecomp = objetivo === 'recomposicion'
              // Slots de comida según si es día de entreno o descanso
              const slots = esFinde
                ? [
                    { hora: '08:30', label: 'Desayuno', icon: '☀️', color: '#f59e0b', tipo: 'desayuno', nota: 'Día de descanso: desayuno completo sin prisa.' },
                    { hora: '14:00', label: 'Comida principal', icon: '🍽️', color: '#f97316', tipo: 'comida', nota: 'Proteína + carbos moderados. Día de recuperación.' },
                    { hora: '17:30', label: 'Merienda', icon: '🥛', color: '#f59e0b', tipo: 'merienda', nota: 'Proteína + fruta. Sin carbos de alto IG.' },
                    { hora: '21:30', label: 'Cena', icon: '🌙', color: '#8b5cf6', tipo: 'cena', nota: 'Proteína + verduras. Pocos carbos por la noche.' },
                  ]
                : [
                    { hora: '07:30', label: 'Desayuno / Pre-entreno', icon: '☀️', color: '#f59e0b', tipo: 'desayuno', nota: 'Carbos complejos + proteína. Energía para el entreno.' },
                    { hora: '09:00', label: 'Post-entreno', icon: '🍗', color: '#10b981', tipo: 'postEntreno', nota: 'Ventana anabólica: proteína + carbos rápidos en <60 min.' },
                    { hora: '13:30', label: 'Comida principal', icon: '🍽️', color: '#f97316', tipo: 'comida', nota: 'Mayor aporte calórico del día. Proteína + carbos complejos.' },
                    { hora: '17:00', label: 'Merienda', icon: '🥛', color: '#f59e0b', tipo: 'merienda', nota: 'Proteína + fruta o carbohidrato ligero.' },
                    { hora: '21:30', label: 'Cena', icon: '🌙', color: '#8b5cf6', tipo: 'cena', nota: 'Proteína + verduras. Pocos carbos para favorecer la recuperación nocturna.' },
                  ]
              return (
                <>
                  {/* Macros del día */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 8 }}>
                    {[['Calorías', dietaCalc.kcal, 'kcal', '#f97316'], ['Proteína', dietaCalc.p, 'g', '#6366f1'], ['Carbos', dietaCalc.c, 'g', '#f59e0b']].map(([l, v, u, c]) => (
                      <div key={l} style={{ ...S.card, padding: 14, textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--c-8e8e93)' }}>{l}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: c, marginTop: 4 }}>{v}</div>
                        <div style={{ fontSize: 11, color: 'var(--c-8e8e93)' }}>{u}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ ...S.card, padding: '10px 16px', marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ fontSize: 13, color: 'var(--c-8e8e93)' }}>Grasas: <b style={{ color: '#a855f7' }}>{dietaCalc.g}g</b></span>
                      <span style={{ fontSize: 13, color: 'var(--c-8e8e93)' }}>Mantenimiento: <b>{dietaCalc.tdee} kcal</b></span>
                    </div>
                    {esRecomp && dietaCalc.kcalEntreno && (
                      <div style={{ marginTop: 8, padding: '6px 10px', background: 'var(--c-ecfdf5)', borderRadius: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 2 }}>⚡ Ciclado calórico (recomposición)</div>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <span style={{ fontSize: 12, color: 'var(--c-065f46)' }}>💪 Entreno: <b>{dietaCalc.kcalEntreno} kcal</b></span>
                          <span style={{ fontSize: 12, color: 'var(--c-065f46)' }}>🏖️ Descanso: <b>{dietaCalc.kcalDescanso} kcal</b></span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Plan de comidas del día */}
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-3c3c43)', marginBottom: 8, paddingLeft: 4 }}>
                    {esFinde ? '🏖️ Plan día de descanso' : '💪 Plan día de entreno'}
                  </div>
                  {slots.map(({ hora, label, icon, color, tipo, nota }) => {
                    const lista = platos[tipo] || []
                    return (
                      <div key={hora} style={{ ...S.card, marginBottom: 10 }}>
                        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 15, fontWeight: 700 }}>{label}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color }}>{hora}</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--c-8e8e93)', marginTop: 2 }}>{nota}</div>
                          </div>
                        </div>
                        {lista.length > 0 && (
                          <div style={{ borderTop: '1px solid var(--c-f2f2f7)' }}>
                            {lista.map((plato, i) => (
                              <div key={i}>
                                <button onClick={() => setPlatoAbierto(platoAbierto === `${tipo}-${i}` ? null : `${tipo}-${i}`)}
                                  style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < lista.length - 1 ? '1px solid var(--c-f2f2f7)' : 'none' }}>
                                  <span style={{ fontSize: 14, textAlign: 'left' }}>🍽️ {plato.nombre}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{plato.kcal} kcal</span>
                                    <span style={{ fontSize: 11, color: 'var(--c-c7c7cc)' }}>{platoAbierto === `${tipo}-${i}` ? '▲' : '▼'}</span>
                                  </div>
                                </button>
                                {platoAbierto === `${tipo}-${i}` && (
                                  <div style={{ background: 'var(--c-f9f9fb)', padding: '12px 16px' }}>
                                    <div style={{ fontSize: 13, color: 'var(--c-3c3c43)', marginBottom: 10, lineHeight: 1.5 }}>📋 {plato.receta}</div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                      {[['Proteína', plato.p, '#6366f1'], ['Carbos', plato.c, '#f59e0b'], ['Grasas', plato.g, '#a855f7']].map(([l, v, c]) => (
                                        <div key={l} style={{ flex: 1, background: 'var(--surface)', borderRadius: 10, padding: 8, textAlign: 'center' }}>
                                          <div style={{ fontSize: 10, color: 'var(--c-8e8e93)' }}>{l}</div>
                                          <div style={{ fontSize: 17, fontWeight: 800, color: c }}>{v}g</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </>
              )
            })()}

            {/* Comida preparada / supermercado */}
            <div style={{ ...S.card, marginTop: 10 }}>
              <button onClick={() => setMostrarPreparados(!mostrarPreparados)}
                style={{ width: '100%', padding: '16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>🛒 Comida preparada</div>
                  <div style={{ fontSize: 12, color: 'var(--c-8e8e93)', marginTop: 2 }}>Mercadona · Wetaca · Knoweats · Batch cooking</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--c-c7c7cc)' }}>{mostrarPreparados ? '▲' : '▼'}</span>
              </button>
              {mostrarPreparados && (
                <div style={{ borderTop: '1px solid var(--c-f2f2f7)', padding: '12px 16px' }}>
                  {/* Filtro por servicio */}
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 10 }}>
                    {['Todos', ...new Set(PLATOS_PREPARADOS.map(p => p.servicio))].map(s => (
                      <button key={s} onClick={() => setFiltroServicio(s)}
                        style={{ ...S.btnPill(filtroServicio === s, '#6366f1'), whiteSpace: 'nowrap' }}>{s}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {PLATOS_PREPARADOS.filter(p => filtroServicio === 'Todos' || p.servicio === filtroServicio).map((p, i) => {
                      // Determinar qué momento del día encaja mejor según macros
                      const slots = []
                      if (p.p >= 30 && p.c >= 30) slots.push({ label: 'Post-entreno', color: '#6366f1', bg: 'var(--c-eef2ff)' })
                      if (p.kcal >= 400 && p.kcal <= 650 && p.p >= 25) slots.push({ label: 'Comida', color: '#f97316', bg: 'var(--c-fff7ed)' })
                      if (p.kcal <= 400 && p.p >= 15) slots.push({ label: 'Merienda', color: '#10b981', bg: 'var(--c-ecfdf5)' })
                      if (p.kcal <= 450 && p.c <= 20) slots.push({ label: 'Cena', color: '#8b5cf6', bg: 'var(--c-f5f3ff)' })
                      if (slots.length === 0) slots.push({ label: 'Comida', color: '#f97316', bg: 'var(--c-fff7ed)' })
                      return (
                      <div key={i} style={{ background: 'var(--c-f9f9fb)', borderRadius: 12, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{p.nombre}</div>
                            <div style={{ fontSize: 11, color: 'var(--c-8e8e93)', marginTop: 2 }}>{p.servicio} · {p.precio}</div>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#f97316', marginLeft: 8 }}>{p.kcal} kcal</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          {[['P', p.p, '#6366f1'], ['C', p.c, '#f59e0b'], ['G', p.g, '#a855f7']].map(([l, v, c]) => (
                            <div key={l} style={{ background: 'var(--surface)', borderRadius: 8, padding: '4px 8px', textAlign: 'center', flex: 1 }}>
                              <div style={{ fontSize: 9, color: 'var(--c-8e8e93)' }}>{l}</div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: c }}>{v}g</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                          {slots.map(s => (
                            <span key={s.label} style={{ fontSize: 10, fontWeight: 700, color: s.color, background: tinte(s.color), borderRadius: 20, padding: '2px 8px' }}>
                              ✓ {s.label}
                            </span>
                          ))}
                        </div>
                        <div style={{ fontSize: 11, color: '#6366f1', fontStyle: 'italic' }}>{p.nota}</div>
                      </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════ PROGRESO ══════════ */}
        {tab === 'marcas' && (() => {
          // Catálogo completo + ejercicios con registros que no estén en él
          const planInfo = {}
          DIAS.forEach(d => d.ejercicios.forEach(e => { planInfo[e.id] = { id: e.id, nombre: e.nombre, grupo: e.grupo || 'Otros', metrica: e.metrica, gif: e.gif } }))
          const lista = [...Object.values(CATALOGO)]
          Object.keys(registros).forEach(id => { if (!CATALOGO[id]) lista.push(planInfo[id] || { id, nombre: id, grupo: 'Otros', metrica: 'kg_reps' }) })
          const grupos = ['Todos', ...Array.from(new Set(lista.map(e => e.grupo)))]
          const q = busquedaEj.trim().toLowerCase()
          const filas = lista
            .filter(e => (grupoEj === 'Todos' || e.grupo === grupoEj) && (!q || e.nombre.toLowerCase().includes(q)))
            .map(e => ({ ...e, nSes: historialOrdenado(registros[e.id]).length }))
            .sort((a, b) => (b.nSes > 0) - (a.nSes > 0) || a.nombre.localeCompare(b.nombre, 'es'))
          const conDatos = filas.filter(e => e.nSes > 0).length
          return (
            <div style={{ padding: '16px 16px 0' }}>
              <input type="search" aria-label="Buscar ejercicio" enterKeyHint="search" value={busquedaEj} onChange={e => setBusquedaEj(e.target.value)} placeholder="🔍 Buscar ejercicio" style={{ ...S.input, marginBottom: 10 }} />
              <div className="chips" role="group" aria-label="Filtrar por grupo muscular" style={{ marginBottom: 4 }}>
                {grupos.map(g => <button key={g} type="button" aria-pressed={grupoEj === g} onClick={() => setGrupoEj(g)} style={S.btnPill(grupoEj === g, '#6366f1')}>{g}</button>)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--c-8e8e93)', marginBottom: 10 }}>
                {filas.length} ejercicios · {conDatos} con registros. Toca uno para ver su historial, borrar sesiones erróneas o resetear sus marcas.
              </div>
              {filas.map(e => {
                const abierto = marcaAbierta === e.id
                const reset = !!marcasReset[e.id]
                const pr = calcularPRs(registrosPR[e.id], e.metrica)
                const etiqueta = etiquetaPR({ ...e, regId: e.id })
                const hist = historialOrdenado(registros[e.id]).slice().reverse()
                const ocultas = new Set(marcasReset[e.id] || [])
                return (
                  <div key={e.id} style={{ ...S.card, padding: 0 }}>
                    <button onClick={() => setMarcaAbierta(abierto ? null : e.id)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      {e.gif ? <img src={e.gif} alt="" loading="lazy" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', background: 'var(--c-f5f5f7)', flexShrink: 0 }} />
                        : <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--c-f5f5f7)', flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-1c1c1e)' }}>{e.nombre}</div>
                        <div style={{ fontSize: 12, color: etiqueta ? 'var(--c-b45309)' : 'var(--c-8e8e93)', marginTop: 2 }}>
                          {etiqueta || (reset && e.nSes ? 'Marcas reseteadas' : 'Sin marcas')}
                          <span style={{ color: 'var(--c-8e8e93)' }}> · {e.grupo}{e.nSes ? ` · ${e.nSes} ses.` : ''}</span>
                        </div>
                      </div>
                      <span style={{ color: 'var(--c-c7c7cc)', fontSize: 14 }}>{abierto ? '▲' : '▼'}</span>
                    </button>
                    {abierto && (
                      <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--c-f2f2f7)' }}>
                        {e.gif && <img src={e.gif} alt={e.nombre} loading="lazy" style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 12, background: 'var(--c-f5f5f7)', margin: '12px 0' }} />}
                        {e.metrica === 'kg_reps' && pr.maxKg > 0 && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center', marginBottom: 12 }}>
                            <div><div style={{ fontSize: 17, fontWeight: 800 }}>{pr.maxKg}kg</div><div style={{ fontSize: 11, color: 'var(--c-8e8e93)' }}>peso máx.</div></div>
                            <div><div style={{ fontSize: 17, fontWeight: 800 }}>{Math.round(pr.maxE1RM)}kg</div><div style={{ fontSize: 11, color: 'var(--c-8e8e93)' }}>1RM estimado</div></div>
                            <div><div style={{ fontSize: 17, fontWeight: 800 }}>{pr.maxVolumenSesion >= 1000 ? `${(pr.maxVolumenSesion / 1000).toFixed(1)}t` : `${Math.round(pr.maxVolumenSesion)}kg`}</div><div style={{ fontSize: 11, color: 'var(--c-8e8e93)' }}>volumen máx.</div></div>
                          </div>
                        )}
                        {hist.length > 1 && (() => {
                          const opciones = e.metrica === 'kg_reps' ? [['e1rm', '1RM est.', 'kg'], ['kg', 'Peso máx.', 'kg'], ['vol', 'Volumen', 'kg']]
                            : e.metrica === 'reps' ? [['reps', 'Repeticiones', 'reps'], ['kg', 'Lastre', 'kg']] : [['seg', 'Tiempo', 's']]
                          const sel = opciones.find(o => o[0] === campoGrafica) || opciones[0]
                          return (
                            <>
                              {opciones.length > 1 && (
                                <div role="group" aria-label="Métrica de la gráfica" className="chips" style={{ paddingBottom: 4 }}>
                                  {opciones.map(([k, l]) => <button key={k} type="button" aria-pressed={sel[0] === k} onClick={() => setCampoGrafica(k)} style={{ ...S.btnPill(sel[0] === k, '#6366f1'), padding: '6px 12px', fontSize: 12 }}>{l}</button>)}
                                </div>
                              )}
                              <GraficaEvolucion puntos={evolucion(registrosPR[e.id], e.metrica)} campo={sel[0]} unidad={sel[2]} />
                            </>
                          )
                        })()}
                        {hist.length === 0 && <div style={{ fontSize: 13, color: 'var(--c-8e8e93)', padding: '8px 0' }}>Aún no has registrado este ejercicio.</div>}
                        {hist.map(([f, ses]) => {
                          const mejor = mejorSerie(ses, e.metrica)
                          const n = seriesSesion(ses, e.metrica).length
                          return (
                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--c-f2f2f7)', opacity: ocultas.has(f) ? 0.45 : 1 }}>
                              <div style={{ width: 82, fontSize: 12, color: 'var(--c-8e8e93)' }}>{f}</div>
                              <div style={{ flex: 1, fontSize: 13, color: 'var(--c-1c1c1e)' }}>
                                {formatSerie(mejor, e.metrica)} <span style={{ color: 'var(--c-8e8e93)', fontSize: 12 }}>· {n} {n === 1 ? 'serie' : 'series'}</span>
                                {ocultas.has(f) && <span style={{ color: 'var(--c-8e8e93)', fontSize: 11 }}> · no cuenta</span>}
                              </div>
                              <button type="button" className="icon-btn" aria-label={`Borrar sesión del ${f}`}
                                onClick={() => { if (window.confirm(`¿Borrar la sesión del ${f} de ${e.nombre}? No se puede deshacer.`)) borrarSesion(e.id, f) }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4 }}>🗑</button>
                            </div>
                          )
                        })}
                        {hist.length > 0 && (
                          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            {!reset || hist.some(([f]) => !ocultas.has(f)) ? (
                              <button onClick={() => { if (window.confirm(`¿Resetear las marcas de ${e.nombre}? Tu historial se conserva, pero las sesiones actuales dejarán de contar para récords y sugerencias.`)) resetearMarcas(e.id) }}
                                style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid var(--c-fecaca)', background: 'var(--c-fef2f2)', color: 'var(--c-dc2626)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                ↺ Resetear marcas
                              </button>
                            ) : null}
                            {reset && (
                              <button onClick={() => restaurarMarcas(e.id)}
                                style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid var(--c-e5e5ea)', background: 'var(--surface)', color: '#6366f1', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                Restaurar marcas
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })()}

        {tab === 'progreso' && (
          <>
            {/* Panel de reglas — Análisis personalizado */}
            {(() => {
              const objInfo = OBJETIVOS.find(o => o.id === (user?.objetivo || 'recomposicion'))
              const nivInfo = NIVELES.find(n => n.id === (user?.nivel || 'intermedio'))
              const { params, vol, alertas, progresos, cicloRecomendado, volumenMuscular } = reglas
              const cicloRec = CICLOS.find(c => c.id === cicloRecomendado?.id)

              return (
                <div style={{ marginBottom: 10 }}>
                  {/* Perfil de entrenamiento */}
                  <div style={{ ...S.card, padding: 16, marginBottom: 10, background: 'var(--c-eef2ff)', border: '1px solid var(--c-c7d2fe)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#6366f1' }}>🧠 Tu perfil de entrenamiento</div>
                      <button onClick={() => setEditandoPerfil(e => !e)} style={{ fontSize: 12, fontWeight: 700, background: editandoPerfil ? '#6366f1' : 'var(--surface)', color: editandoPerfil ? '#fff' : '#6366f1', border: '1.5px solid #6366f1', borderRadius: 20, padding: '4px 12px', cursor: 'pointer' }}>
                        {editandoPerfil ? 'Listo' : 'Editar'}
                      </button>
                    </div>

                    {editandoPerfil ? (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', marginBottom: 8 }}>Objetivo</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                          {OBJETIVOS.map(o => (
                            <button key={o.id} onClick={() => updateUser({ objetivo: o.id })}
                              style={{ padding: '10px 14px', borderRadius: 12, border: (user?.objetivo || 'recomposicion') === o.id ? '2px solid #6366f1' : '2px solid var(--c-e5e5ea)', background: (user?.objetivo || 'recomposicion') === o.id ? 'var(--c-eef2ff)' : 'var(--surface)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 22 }}>{o.icon}</span>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: (user?.objetivo || 'recomposicion') === o.id ? '#6366f1' : 'var(--c-1c1c1e)' }}>{o.nombre}</div>
                                <div style={{ fontSize: 11, color: 'var(--c-8e8e93)' }}>{o.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', marginBottom: 8 }}>Nivel</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {NIVELES.map(n => (
                            <button key={n.id} onClick={() => updateUser({ nivel: n.id })}
                              style={{ flex: 1, padding: '10px 8px', borderRadius: 12, border: (user?.nivel || 'intermedio') === n.id ? '2px solid #6366f1' : '2px solid var(--c-e5e5ea)', background: (user?.nivel || 'intermedio') === n.id ? 'var(--c-eef2ff)' : 'var(--surface)', cursor: 'pointer', textAlign: 'center' }}>
                              <div style={{ fontSize: 22 }}>{n.icon}</div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: (user?.nivel || 'intermedio') === n.id ? '#6366f1' : 'var(--c-1c1c1e)', marginTop: 4 }}>{n.nombre}</div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ fontSize: 22 }}>{objInfo?.icon}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', marginTop: 4 }}>{objInfo?.nombre}</div>
                            <div style={{ fontSize: 10, color: 'var(--c-8e8e93)' }}>Objetivo</div>
                          </div>
                          <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ fontSize: 22 }}>{nivInfo?.icon}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', marginTop: 4 }}>{nivInfo?.nombre}</div>
                            <div style={{ fontSize: 10, color: 'var(--c-8e8e93)' }}>Nivel</div>
                          </div>
                          <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#6366f1' }}>{params.reps}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', marginTop: 4 }}>Reps</div>
                            <div style={{ fontSize: 10, color: 'var(--c-8e8e93)' }}>Rango óptimo</div>
                          </div>
                        </div>
                        <div style={{ marginTop: 10, background: 'var(--surface)', borderRadius: 12, padding: '10px 14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--c-3c3c43)', flexWrap: 'wrap', gap: 8 }}>
                            <span>📊 <b>{params.series}</b> series/ejercicio</span>
                            <span>💤 RIR <b>{params.rir}</b> (reps en reserva)</span>
                            <span>🏃 <b>{params.cardioSemana}</b> cardios/sem</span>
                            <span>⚡ Deload cada <b>{params.deloadSemanas}</b> sem</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--c-8e8e93)', marginTop: 6 }}>Intensidad recomendada: {params.intensidad}</div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Notificaciones push */}
                  <div style={{ ...S.card, padding: 16, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-1c1c1e)' }}>🔔 Recordatorios de entreno</div>
                      {pushActivo && <span style={{ fontSize: 11, background: 'var(--c-dcfce7)', color: '#16a34a', borderRadius: 8, padding: '2px 8px', fontWeight: 700 }}>Activo</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--c-8e8e93)', marginBottom: 12, lineHeight: 1.5 }}>
                      {!pushSupported()
                        ? 'Tu navegador no soporta notificaciones push. Instala la app desde el menú del navegador.'
                        : notifPermiso === 'denied'
                        ? 'Notificaciones bloqueadas en el navegador. Actívalas en Ajustes → Notificaciones.'
                        : pushActivo
                        ? 'Recibirás un recordatorio cada día a las 8:00h aunque la app esté cerrada.'
                        : 'Activa para recibir recordatorios diarios aunque tengas la app cerrada.'}
                    </div>
                    {pushSupported() && notifPermiso !== 'denied' && !pushActivo && (
                      <button disabled={pushCargando} onClick={async () => {
                        setPushCargando(true)
                        const result = await subscribePush(userId)
                        setPushCargando(false)
                        if (result.ok) {
                          setPushActivo(true)
                          setNotifPermiso('granted')
                        } else if (result.reason === 'denied') {
                          setNotifPermiso('denied')
                        }
                      }} style={{ ...S.btnPrimary('#6366f1'), borderRadius: 12, padding: '11px 16px', opacity: pushCargando ? 0.6 : 1 }}>
                        {pushCargando ? 'Activando…' : '🔔 Activar recordatorios'}
                      </button>
                    )}
                    {pushActivo && (
                      <button onClick={async () => {
                        await unsubscribePush()
                        setPushActivo(false)
                      }} style={{ width: '100%', padding: '10px 16px', borderRadius: 12, border: '1.5px solid var(--c-e5e5ea)', background: 'var(--c-f5f5f7)', color: 'var(--c-8e8e93)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        Desactivar recordatorios
                      </button>
                    )}
                  </div>

                  {/* Ciclo recomendado */}
                  {cicloRecomendado && cicloRec && cicloRecomendado.id !== cicloActual && (
                    <div style={{ ...S.card, padding: 16, marginBottom: 10, background: tinte(cicloRec.color), border: `1px solid ${cicloRec.color}40` }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: cicloRec.color, marginBottom: 4 }}>
                        🔄 Cambio de ciclo recomendado → {cicloRec.nombre}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--c-3c3c43)', marginBottom: 12 }}>{cicloRecomendado.razon}</div>
                      <button onClick={() => { updateUser({ cicloActual: cicloRec.id, cicloSemanaInicio: getWeekKey() }) }}
                        style={{ ...S.btnPrimary(cicloRec.color), borderRadius: 12, padding: '10px 16px' }}>
                        Cambiar a {cicloRec.nombre}
                      </button>
                    </div>
                  )}

                  {/* ── PROGRESO: siempre visible, crece con los datos ───────── */}
                  {(() => {
                    // Contar sesiones únicas registradas
                    const todasFechas = new Set()
                    Object.values(ud.registros || {}).forEach(ejReg => Object.keys(ejReg || {}).forEach(f => todasFechas.add(f)))
                    const sesiones = todasFechas.size
                    const sinDatos = sesiones === 0
                    const pocasDatos = sesiones > 0 && sesiones < 3

                    return (
                      <div style={{ ...S.card, overflow: 'hidden', marginBottom: 10 }}>
                        <div style={{ padding: '12px 16px 8px' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-8e8e93)' }}>TU PROGRESO</span>
                          {sesiones > 0 && <span style={{ fontSize: 11, color: 'var(--c-8e8e93)', marginLeft: 8 }}>{sesiones} sesión{sesiones !== 1 ? 'es' : ''} registrada{sesiones !== 1 ? 's' : ''}</span>}
                        </div>

                        {/* Plan activo — siempre visible */}
                        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--c-f2f2f7)' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-1c1c1e)', marginBottom: 8 }}>📋 Tu plan actual</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            {[
                              { label: 'Series/ejercicio', val: params.series },
                              { label: 'Repeticiones', val: params.reps },
                              { label: 'RIR (reps en reserva)', val: params.rir },
                              { label: 'Intensidad', val: params.intensidad },
                              { label: 'Cardio/semana', val: `${params.cardioSemana} ses.` },
                              { label: 'Deload cada', val: `${params.deloadSemanas} sem.` },
                            ].map(({ label, val }) => (
                              <div key={label} style={{ background: 'var(--c-f5f5f7)', borderRadius: 10, padding: '8px 10px' }}>
                                <div style={{ fontSize: 10, color: 'var(--c-8e8e93)', marginBottom: 2 }}>{label}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: cicloInfo.color }}>{val}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Sin datos: guía de qué va a pasar */}
                        {sinDatos && (
                          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--c-f2f2f7)', background: 'var(--c-f0f9ff)' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-0369a1)', marginBottom: 6 }}>📈 Cómo funciona el análisis</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {[
                                { n: 1, txt: 'Registra el peso y reps de cada ejercicio en el Entreno' },
                                { n: 3, txt: 'Tras 3 sesiones la app sabe cuándo subir de peso' },
                                { n: 15, txt: 'Con 15 sesiones evalúa si estás listo para subir de nivel' },
                              ].map(({ n, txt }) => (
                                <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--c-0369a1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{n}</div>
                                  <div style={{ fontSize: 12, color: 'var(--c-0c4a6e)', paddingTop: 3, lineHeight: 1.4 }}>{txt}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pocas sesiones y sin progresos aún: barra hacia primer análisis */}
                        {pocasDatos && (!progresos || progresos.length === 0) && (
                          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--c-f2f2f7)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-1c1c1e)' }}>Hacia el primer análisis</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: cicloInfo.color }}>{sesiones}/3 sesiones</span>
                            </div>
                            <div style={{ height: 6, borderRadius: 3, background: 'var(--c-f2f2f7)' }}>
                              <div style={{ height: 6, borderRadius: 3, background: cicloInfo.color, width: `${(sesiones / 3) * 100}%`, transition: 'width .3s' }} />
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--c-8e8e93)', marginTop: 6 }}>Registra {3 - sesiones} sesión{3 - sesiones !== 1 ? 'es' : ''} más y la app empezará a sugerirte cuándo subir de peso.</div>
                          </div>
                        )}

                        {/* Progresos reales (aparecen en cuanto hay datos, sin esperar las 3 sesiones) */}
                        {progresos && progresos.map((p, i) => (
                          <div key={i} style={{ padding: '12px 16px', borderTop: '1px solid var(--c-f2f2f7)', background: p.tipo === 'subir_nivel' ? 'var(--c-fffbeb)' : 'var(--c-f0fdf4)' }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: p.tipo === 'subir_nivel' ? '#d97706' : '#10b981' }}>{p.titulo}</div>
                            {p.tipo === 'subir_carga' && (
                              <>
                                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {p.ejercicios.map(ej => (
                                    <div key={ej.ejId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-dcfce7)', borderRadius: 8, padding: '6px 10px' }}>
                                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-166534)' }}>{ej.ejNombre}</span>
                                      <span style={{ fontSize: 12, color: 'var(--c-15803d)', fontWeight: 700 }}>{ej.mensaje}</span>
                                    </div>
                                  ))}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--c-6b7280)', marginTop: 8 }}>
                                  Los pesos sugeridos aparecen también en cada ejercicio del Entreno.
                                </div>
                              </>
                            )}
                            {p.tipo === 'subir_nivel' && (
                              <>
                                <div style={{ fontSize: 12, color: 'var(--c-92400e)', marginTop: 4, lineHeight: 1.5 }}>{p.desc}</div>
                                <button
                                  onClick={() => updateUser({ nivel: p.siguienteNivel })}
                                  style={{ marginTop: 10, padding: '8px 16px', borderRadius: 10, background: '#d97706', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                  Subir a nivel {p.siguienteNivel === 'intermedio' ? 'Intermedio' : 'Avanzado'} →
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  })()}

                  {/* ── AVISOS: solo sobre comportamiento del usuario ────────── */}
                  {alertas.length > 0 && (
                    <div style={{ ...S.card, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{ padding: '12px 16px 8px' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-8e8e93)' }}>AVISOS</span>
                      </div>
                      {alertas.map((a, i) => {
                        const esInfo = a.prioridad === 'info'
                        const color = esInfo ? '#6366f1' : a.prioridad === 'alta' ? '#ef4444' : '#f97316'
                        const bg = esInfo ? 'var(--c-f5f5ff)' : a.prioridad === 'alta' ? 'var(--c-fef2f2)' : 'var(--c-fff7ed)'
                        const btnLabel = a.tipo === 'deload' ? '⚡ Activar deload ahora' : a.tipo === 'plateau' ? '🔄 Cambiar ejercicio' : null
                        return (
                          <div key={i} style={{ padding: '12px 16px', borderTop: '1px solid var(--c-f2f2f7)', background: bg }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color }}>{a.titulo}</div>
                            <div style={{ fontSize: 12, color: 'var(--c-3c3c43)', marginTop: 4, lineHeight: 1.4 }}>{a.desc}</div>
                            {btnLabel && (
                              <button onClick={() => aplicarCorreccionAlerta(a)}
                                style={{ marginTop: 8, padding: '6px 12px', borderRadius: 8, border: `1px solid ${color}`, background: 'transparent', color, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                {btnLabel}
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })()}

            <div style={{ ...S.card, padding: 16, marginBottom: 10, background: 'var(--c-eef2ff)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#6366f1', marginBottom: 4 }}>📅 Semana actual: {getWeekKey()}</div>
              <div style={{ fontSize: 12, color: 'var(--c-8e8e93)', marginBottom: 12 }}>Guarda un snapshot de tus mejores marcas para comparar semana a semana.</div>
              <button onClick={guardarSemana} style={S.btnPrimary('#6366f1')}>💾 Guardar progreso de esta semana</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div style={{ ...S.card, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--c-8e8e93)' }}>Peso actual</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#6366f1', marginTop: 4 }}>{histPeso.at(-1)?.peso ?? '—'}{histPeso.length ? ' kg' : ''}</div>
              </div>
              <div style={{ ...S.card, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--c-8e8e93)' }}>Semanas guardadas</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981', marginTop: 4 }}>{Object.keys(progSemanal).length}</div>
              </div>
            </div>
            {Object.entries(progSemanal).sort((a, b) => b[0].localeCompare(a[0])).map(([semana, data], si, arr) => {
              const anterior = arr[si + 1]?.[1]
              const cicloSemana = CICLOS.find(c => c.id === data.ciclo) || cicloInfo
              return (
                <div key={semana} style={{ ...S.card, marginBottom: 10 }}>
                  <div style={{ padding: '12px 16px', background: 'var(--c-f5f5f7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 800 }}>{semana}</span>
                      {si === 0 && <span style={{ fontSize: 11, background: '#6366f1', color: '#fff', padding: '2px 8px', borderRadius: 10 }}>Última</span>}
                      <span style={{ fontSize: 11, background: tinte(cicloSemana.color), color: cicloSemana.color, padding: '1px 8px', borderRadius: 8, fontWeight: 600 }}>{cicloSemana.nombre}</span>
                    </div>
                    {data.peso && <span style={{ fontSize: 13, color: 'var(--c-8e8e93)' }}>⚖️ {data.peso}kg</span>}
                  </div>
                  {DIAS.map(d => {
                    const ejs = Object.entries(data.snapshot?.[d.id] || {})
                    if (!ejs.length) return null
                    return (
                      <div key={d.id} style={{ borderTop: '1px solid var(--c-f2f2f7)' }}>
                        <div style={{ padding: '8px 16px', background: tinte(d.color) }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.emoji} {d.enfoque}</span>
                        </div>
                        {ejs.map(([ejId, m], i) => {
                          const prevMax = anterior?.snapshot?.[d.id]?.[ejId]?.max
                          const diff = prevMax != null ? m.max - prevMax : null
                          const unidad = m.tipo === 'tiempo' ? 's' : m.tipo === 'reps' ? ' reps' : 'kg'
                          return (
                            <div key={ejId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: '1px solid var(--c-f2f2f7)' }}>
                              <span style={{ fontSize: 13 }}>{m.nombre}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {diff !== null && diff !== 0 && <span style={{ fontSize: 12, fontWeight: 700, color: diff > 0 ? '#10b981' : '#f97316' }}>{diff > 0 ? `▲ +${diff}` : `▼ ${diff}`}{unidad}</span>}
                                <span style={{ fontSize: 14, fontWeight: 800, color: '#f59e0b' }}>🏆 {m.max}{unidad}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )
            })}
            {Object.keys(progSemanal).length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--c-8e8e93)' }}>
                <div style={{ fontSize: 48 }}>📅</div>
                <div style={{ marginTop: 16, fontSize: 16, fontWeight: 600, color: 'var(--c-1c1c1e)' }}>Sin semanas guardadas aún</div>
                <div style={{ marginTop: 8, fontSize: 14 }}>Entrena, registra pesos y guarda tu semana</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal actividad extra */}
      {actividadModal && (() => {
        const def = ACTIVIDADES_EXTRA.find(a => a.id === actForm.tipo)
        const preview = def && actForm.minutos
          ? calcKcalActividad(def, Number(actForm.minutos), pesoRef)
          : null
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setActividadModal(false)}>
            <div style={{ background: 'var(--surface)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 430, margin: '0 auto', padding: 20, paddingBottom: 36 }}
              onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 16 }}>🔥 Añadir actividad</div>

              {/* Selector de actividad */}
              <div style={S.label}>Tipo de actividad</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {ACTIVIDADES_EXTRA.map(a => (
                  <button key={a.id} onClick={() => setActForm(f => ({ ...f, tipo: a.id, km: '' }))}
                    style={{ padding: '8px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: actForm.tipo === a.id ? '#f97316' : 'var(--c-f5f5f7)', color: actForm.tipo === a.id ? '#fff' : 'var(--c-3c3c43)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span>{a.icon}</span><span>{a.nombre}</span>
                  </button>
                ))}
              </div>

              {/* Tiempo y distancia */}
              <div style={{ display: 'grid', gridTemplateColumns: def?.km ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={S.label}>Duración (minutos)</div>
                  <div style={{ position: 'relative' }}>
                    <input type="number" inputMode="numeric" placeholder="30" value={actForm.minutos}
                      onChange={e => setActForm(f => ({ ...f, minutos: e.target.value }))}
                      style={{ ...S.input }} />
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--c-8e8e93)' }}>min</span>
                  </div>
                </div>
                {def?.km && (
                  <div>
                    <div style={S.label}>Distancia (opcional)</div>
                    <div style={{ position: 'relative' }}>
                      <input type="number" inputMode="decimal" placeholder="5.0" value={actForm.km}
                        onChange={e => setActForm(f => ({ ...f, km: e.target.value }))}
                        style={{ ...S.input }} />
                      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--c-8e8e93)' }}>km</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview kcal */}
              {preview && (
                <div style={{ background: 'var(--c-fff7ed)', border: '1px solid var(--c-fed7aa)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--c-92400e)' }}>Calorías estimadas</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#f97316' }}>{preview} kcal</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setActividadModal(false)}
                  style={{ flex: 1, padding: 13, borderRadius: 12, background: 'var(--c-f5f5f7)', color: 'var(--c-8e8e93)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                <button onClick={guardarActividad} disabled={!actForm.minutos}
                  style={{ flex: 2, ...S.btnPrimary('#f97316'), borderRadius: 12, opacity: actForm.minutos ? 1 : 0.4 }}>Guardar</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* TEMPORIZADOR DE DESCANSO */}
      {restTimer && (() => {
        const { segundos, total, ejNombre } = restTimer
        const progreso = segundos / total
        const terminado = segundos === 0
        const radio = 70
        const circunferencia = 2 * Math.PI * radio
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 0 }}
            onClick={terminado ? cancelarDescanso : undefined}>
            <div style={{ background: 'var(--c-1c1c1e)', borderRadius: 28, padding: '36px 28px 28px', width: 320, textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}>

              <div style={{ fontSize: 13, color: 'var(--c-aeaeb2)', marginBottom: 20, fontWeight: 500 }}>
                {terminado ? '¡Descanso completado!' : `Descansando · ${ejNombre}`}
              </div>

              {/* Círculo SVG */}
              <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto 24px' }}>
                <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="90" cy="90" r={radio} fill="none" stroke="#2c2c2e" strokeWidth="10" />
                  <circle cx="90" cy="90" r={radio} fill="none"
                    stroke={terminado ? '#10b981' : '#6366f1'} strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circunferencia}
                    strokeDashoffset={circunferencia * (1 - progreso)}
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 52, fontWeight: 800, color: terminado ? '#10b981' : '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {terminado ? '✓' : `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`}
                  </div>
                  {!terminado && <div style={{ fontSize: 12, color: 'var(--c-636366)', marginTop: 4 }}>restantes</div>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={cancelarDescanso}
                  style={{ flex: 1, padding: '13px', borderRadius: 14, background: '#2c2c2e', color: 'var(--c-aeaeb2)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15 }}>
                  {terminado ? 'Cerrar' : 'Saltar'}
                </button>
                {!terminado && (
                  <button onClick={() => iniciarDescanso(ejNombre, total)}
                    style={{ flex: 1, padding: '13px', borderRadius: 14, background: '#2c2c2e', color: 'var(--c-aeaeb2)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15 }}>
                    ↺ Reiniciar
                  </button>
                )}
                {terminado && (
                  <button onClick={cancelarDescanso}
                    style={{ flex: 2, padding: '14px', borderRadius: 14, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>
                    ¡A por la serie! 💪
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      <CalculadoraDiscos datos={discos} onClose={cerrarDiscos} />
      <ResumenEntreno resumen={resumen} onClose={cerrarResumen} />

      {/* ONBOARDING */}
      {showOnboarding && (
        <Onboarding previousVersion={onboardingPrevVersion} onFinish={() => {
          localStorage.setItem(`onboarding_v${ONBOARDING_VERSION}_${userId}`, '1')
          setShowOnboarding(false)
        }} />
      )}

      {/* NAV */}
      <nav style={S.nav} aria-label="Secciones">
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={() => { setTab(t.id); window.scrollTo({ top: 0 }) }} aria-current={tab === t.id ? 'page' : undefined}
            style={{ flex: 1, minHeight: 56, padding: '8px 0 10px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative' }}>
            {tab === t.id && <span aria-hidden="true" style={{ position: 'absolute', top: 0, width: 28, height: 3, borderRadius: 3, background: '#6366f1' }} />}
            <span aria-hidden="true" style={{ fontSize: 24, filter: tab === t.id ? 'none' : 'grayscale(0.6)', opacity: tab === t.id ? 1 : 0.75 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? '#6366f1' : 'var(--c-8e8e93)' }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
