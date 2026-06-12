import { useState } from 'react'
import { CICLOS, PLATOS, AVATARS, getDiasCiclo } from './data.js'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function useLS(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init }
    catch { return init }
  })
  const save = v => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }
  return [val, save]
}

function getWeekKey() {
  const d = new Date()
  const start = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

const S = {
  page: { maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#f5f5f7', paddingBottom: 84 },
  header: { background: '#fff', padding: '52px 20px 16px', borderBottom: '1px solid #e5e5ea' },
  card: { background: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 10 },
  input: { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e5ea', background: '#f5f5f7', color: '#1c1c1e', fontSize: 16 },
  btnPrimary: c => ({ padding: '14px', borderRadius: 14, background: c, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, width: '100%' }),
  btnPill: (active, c) => ({ padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: active ? c : '#f5f5f7', color: active ? '#fff' : '#8e8e93', flexShrink: 0 }),
  label: { fontSize: 12, color: '#8e8e93', marginBottom: 5, fontWeight: 500 },
  nav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid #e5e5ea', display: 'flex', paddingBottom: 'env(safe-area-inset-bottom,0px)' },
}

// ─── INPUT DE EJERCICIO (peso / tiempo / reps / peso_reps) ───────────────────

function EjercicioInput({ ej, serie, valor, onChange, ultimoValor }) {
  const { tipo, reps } = ej
  const esDeload = String(reps).includes('deload')

  if (tipo === 'tiempo') {
    return (
      <div>
        <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 4, textAlign: 'center' }}>Serie {serie}</div>
        <div style={{ position: 'relative' }}>
          <input type="number" inputMode="numeric" placeholder={reps}
            value={valor} onChange={e => onChange(e.target.value)}
            style={{ ...S.input, textAlign: 'center', padding: '10px 8px', fontSize: 16, fontWeight: 700 }} />
          <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#8e8e93' }}>seg</span>
        </div>
        {ultimoValor && <div style={{ fontSize: 10, color: '#8e8e93', textAlign: 'center', marginTop: 2 }}>último: {ultimoValor}s</div>}
      </div>
    )
  }

  if (tipo === 'reps') {
    return (
      <div>
        <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 4, textAlign: 'center' }}>Serie {serie}</div>
        <div style={{ position: 'relative' }}>
          <input type="number" inputMode="numeric" placeholder={reps}
            value={valor} onChange={e => onChange(e.target.value)}
            style={{ ...S.input, textAlign: 'center', padding: '10px 8px', fontSize: 16, fontWeight: 700 }} />
          <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#8e8e93' }}>reps</span>
        </div>
        {ultimoValor && <div style={{ fontSize: 10, color: '#8e8e93', textAlign: 'center', marginTop: 2 }}>último: {ultimoValor} reps</div>}
      </div>
    )
  }

  if (tipo === 'peso_reps') {
    const [kg, repsVal] = (valor || '').split('|')
    return (
      <div>
        <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 4, textAlign: 'center' }}>Serie {serie}</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input type="number" inputMode="decimal" placeholder="0"
              value={kg || ''} onChange={e => onChange(`${e.target.value}|${repsVal || ''}`)}
              style={{ ...S.input, textAlign: 'center', padding: '10px 4px', fontSize: 14, fontWeight: 700 }} />
            <span style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', fontSize: 9, color: '#8e8e93' }}>kg</span>
          </div>
          <div style={{ position: 'relative', flex: 1 }}>
            <input type="number" inputMode="numeric" placeholder={reps}
              value={repsVal || ''} onChange={e => onChange(`${kg || ''}|${e.target.value}`)}
              style={{ ...S.input, textAlign: 'center', padding: '10px 4px', fontSize: 14, fontWeight: 700 }} />
            <span style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', fontSize: 9, color: '#8e8e93' }}>reps</span>
          </div>
        </div>
        {ultimoValor && <div style={{ fontSize: 10, color: '#8e8e93', textAlign: 'center', marginTop: 2 }}>último: {ultimoValor.replace('|', 'kg × ')} reps</div>}
      </div>
    )
  }

  // tipo === 'peso' (default)
  return (
    <div>
      <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 4, textAlign: 'center' }}>Serie {serie}</div>
      <div style={{ position: 'relative' }}>
        <input type="number" inputMode="decimal" placeholder={esDeload && ultimoValor ? `~${Math.round(Number(ultimoValor) * 0.5)}` : 'kg'}
          value={valor} onChange={e => onChange(e.target.value)}
          style={{ ...S.input, textAlign: 'center', padding: '10px 8px', fontSize: 18, fontWeight: 700 }} />
        <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#8e8e93' }}>kg</span>
      </div>
      {ultimoValor && <div style={{ fontSize: 10, color: '#8e8e93', textAlign: 'center', marginTop: 2 }}>último: {ultimoValor}kg</div>}
    </div>
  )
}

// ─── PANTALLA SELECCIÓN DE USUARIO ───────────────────────────────────────────

function PantallaUsuarios({ users, onSelect, onCreate, onDelete }) {
  const [creando, setCreando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [avatar, setAvatar] = useState('💪')

  function guardar() {
    if (!nombre.trim()) return
    onCreate({ id: Date.now().toString(), nombre: nombre.trim(), avatar, cicloActual: 'hiper', cicloSemanaInicio: getWeekKey() })
    setNombre(''); setAvatar('💪'); setCreando(false)
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#f5f5f7', padding: '60px 20px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 52 }}>🏋️</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#1c1c1e', marginTop: 12 }}>RutinaGym</div>
        <div style={{ fontSize: 14, color: '#8e8e93', marginTop: 6 }}>¿Quién entrena hoy?</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {users.map(u => {
          const ciclo = CICLOS.find(c => c.id === u.cicloActual) || CICLOS[0]
          return (
            <div key={u.id} style={{ background: '#fff', borderRadius: 16, display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 14 }}>
              <div style={{ fontSize: 36 }}>{u.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#1c1c1e' }}>{u.nombre}</div>
                <div style={{ fontSize: 11, marginTop: 3, display: 'inline-block', background: ciclo.bg, color: ciclo.color, padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>
                  {ciclo.nombre}
                </div>
              </div>
              <button onClick={() => onSelect(u)} style={{ padding: '10px 18px', borderRadius: 12, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Entrar</button>
              <button onClick={() => { if (confirm(`¿Eliminar a ${u.nombre}?`)) onDelete(u.id) }}
                style={{ padding: '10px', borderRadius: 12, background: '#fff0f0', color: '#ff3b30', border: 'none', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
            </div>
          )
        })}
      </div>

      {!creando ? (
        <button onClick={() => setCreando(true)} style={{ width: '100%', padding: '16px', borderRadius: 16, border: '2px dashed #d1d5db', background: 'transparent', color: '#6366f1', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          + Añadir usuario
        </button>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Nuevo usuario</div>
          <div style={S.label}>Nombre</div>
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="ej: Carlos" style={{ ...S.input, marginBottom: 16 }} />
          <div style={S.label}>Avatar</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {AVATARS.map(a => (
              <button key={a} onClick={() => setAvatar(a)} style={{ width: 48, height: 48, borderRadius: 12, border: avatar === a ? '2px solid #6366f1' : '2px solid #e5e5ea', background: avatar === a ? '#eef2ff' : '#fff', fontSize: 24, cursor: 'pointer' }}>{a}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setCreando(false)} style={{ flex: 1, padding: 13, borderRadius: 12, background: '#f5f5f7', color: '#8e8e93', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
            <button onClick={guardar} style={{ flex: 2, ...S.btnPrimary('#6366f1'), borderRadius: 12 }}>Crear</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────

export default function App() {
  const [users, setUsers] = useLS('rg_users', [])
  const [userId, setUserId] = useState(null)
  const [tab, setTab] = useState('entreno')
  const [diaIdx, setDiaIdx] = useState(0)
  const [ejAbierto, setEjAbierto] = useState(null)
  const [altAbierta, setAltAbierta] = useState(null)
  const [allData, setAllData] = useLS('rg_data', {})
  const [pesoInput, setPesoInput] = useState('')
  const [dietaData, setDietaData] = useLS('rg_dieta', {})
  const [dietaCalc, setDietaCalc] = useState(null)
  const [platoAbierto, setPlatoAbierto] = useState(null)
  const [mostrarCiclos, setMostrarCiclos] = useState(false)

  const user = users.find(u => u.id === userId)
  const ud = allData[userId] || {}
  const cicloActual = user?.cicloActual || 'hiper'
  const cicloInfo = CICLOS.find(c => c.id === cicloActual) || CICLOS[0]
  const DIAS = getDiasCiclo(cicloActual)
  const dia = DIAS[diaIdx]

  function setUd(newUd) { setAllData({ ...allData, [userId]: newUd }) }
  function updateUser(fields) { setUsers(users.map(u => u.id === userId ? { ...u, ...fields } : u)) }

  // ── Registros de peso por ejercicio ──
  // Estructura: registros[ejId][fecha][sN] = valor
  // Separado del día para que persista entre rotaciones de ciclo
  const registros = ud.registros || {}

  function setValorEj(ejId, serie, valor) {
    const hoy = new Date().toLocaleDateString('es-ES')
    const r = JSON.parse(JSON.stringify(registros))
    if (!r[ejId]) r[ejId] = {}
    if (!r[ejId][hoy]) r[ejId][hoy] = {}
    r[ejId][hoy][`s${serie}`] = valor
    setUd({ ...ud, registros: r })
  }

  function getValorHoy(ejId, serie) {
    const hoy = new Date().toLocaleDateString('es-ES')
    return registros[ejId]?.[hoy]?.[`s${serie}`] || ''
  }

  // Último valor registrado para un ejercicio (cualquier día pasado, no hoy)
  function getUltimoValor(ejId) {
    const hoy = new Date().toLocaleDateString('es-ES')
    const fechas = Object.keys(registros[ejId] || {}).filter(f => f !== hoy).sort().reverse()
    if (!fechas.length) return null
    const ultima = registros[ejId][fechas[0]]
    // Devuelve el valor de la primera serie como referencia
    return ultima?.s1 || null
  }

  function getMaxValor(ejId, tipo) {
    let max = 0
    Object.values(registros[ejId] || {}).forEach(dia => {
      Object.values(dia).forEach(v => {
        const n = tipo === 'peso_reps' ? Number((v || '').split('|')[0]) : Number(v)
        if (n > max) max = n
      })
    })
    return max || null
  }

  // ── Peso corporal ──
  const histPeso = ud.histPeso || []
  function addPeso() {
    if (!pesoInput) return
    setUd({ ...ud, histPeso: [...histPeso, { fecha: new Date().toLocaleDateString('es-ES'), peso: Number(pesoInput), semana: getWeekKey() }] })
    setPesoInput('')
  }

  // ── Progreso semanal ──
  const progSemanal = ud.progSemanal || {}
  function guardarSemana() {
    const semana = getWeekKey()
    const snapshot = {}
    DIAS.forEach(d => {
      d.ejercicios.forEach(ej => {
        const max = getMaxValor(ej.id, ej.tipo)
        if (max) {
          if (!snapshot[d.id]) snapshot[d.id] = {}
          snapshot[d.id][ej.id] = { nombre: ej.nombre, max, tipo: ej.tipo }
        }
      })
    })
    setUd({ ...ud, progSemanal: { ...progSemanal, [semana]: { snapshot, peso: histPeso.at(-1)?.peso, ciclo: cicloActual, fecha: new Date().toLocaleDateString('es-ES') } } })
    alert(`✅ Semana ${semana} guardada`)
  }

  // ── Dieta ──
  const dUser = dietaData[userId] || { altura: '', edad: '', pesoActual: '', pesoObj: '', meta: 'recomposicion', sexo: 'hombre' }
  function setDUser(d) { setDietaData({ ...dietaData, [userId]: d }) }
  function calcDieta() {
    const { altura, edad, pesoActual, meta, sexo } = dUser
    if (!altura || !edad || !pesoActual) return
    const tmb = sexo === 'hombre' ? 10 * +pesoActual + 6.25 * +altura - 5 * +edad + 5 : 10 * +pesoActual + 6.25 * +altura - 5 * +edad - 161
    const tdee = Math.round(tmb * 1.55)
    const kcal = meta === 'perder' ? tdee - 400 : meta === 'ganar' ? tdee + 300 : tdee
    const p = Math.round(+pesoActual * 2.0)
    const g = Math.round(kcal * 0.25 / 9)
    const c = Math.round((kcal - p * 4 - g * 9) / 4)
    setDietaCalc({ tdee, kcal, p, c, g })
  }

  // ── Calcular semanas en ciclo actual ──
  function semanasEnCiclo() {
    if (!user?.cicloSemanaInicio) return 0
    const [ay, aw] = user.cicloSemanaInicio.split('-W').map(Number)
    const [by, bw] = getWeekKey().split('-W').map(Number)
    return (by - ay) * 52 + (bw - aw)
  }
  const semanasCiclo = semanasEnCiclo()
  const semanasRestantes = Math.max(0, cicloInfo.semanas - semanasCiclo)
  const cicloCompletado = semanasCiclo >= cicloInfo.semanas

  function cambiarCiclo(nuevoCicloId) {
    updateUser({ cicloActual: nuevoCicloId, cicloSemanaInicio: getWeekKey() })
    setMostrarCiclos(false)
    setEjAbierto(null)
  }

  if (!userId) return (
    <PantallaUsuarios users={users}
      onSelect={u => setUserId(u.id)}
      onCreate={u => setUsers([...users, u])}
      onDelete={id => { setUsers(users.filter(u => u.id !== id)); const d = { ...allData }; delete d[id]; setAllData(d) }} />
  )

  const TABS = [
    { id: 'entreno', icon: '🏋️', label: 'Entreno' },
    { id: 'peso', icon: '⚖️', label: 'Peso' },
    { id: 'dieta', icon: '🥗', label: 'Dieta' },
    { id: 'progreso', icon: '📈', label: 'Progreso' },
  ]

  return (
    <div style={S.page}>
      {/* HEADER */}
      <div style={S.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1c1c1e', letterSpacing: -0.5 }}>
              {tab === 'entreno' ? '🏋️ Entreno' : tab === 'peso' ? '⚖️ Mi peso' : tab === 'dieta' ? '🥗 Nutrición' : '📈 Progreso'}
            </div>
            <div style={{ fontSize: 13, color: '#8e8e93', marginTop: 3 }}>
              {tab === 'entreno' ? 'Rutina 5 días · Bajar grasa y ganar músculo' :
               tab === 'peso' ? 'Control de peso corporal' :
               tab === 'dieta' ? 'Plan personalizado de alimentación' : 'Historial y evolución semanal'}
            </div>
          </div>
          <button onClick={() => setUserId(null)}
            style={{ width: 42, height: 42, borderRadius: 14, background: '#eef2ff', border: 'none', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user?.avatar}
          </button>
        </div>

        {/* Banner de ciclo */}
        {tab === 'entreno' && (
          <button onClick={() => setMostrarCiclos(!mostrarCiclos)}
            style={{ marginTop: 12, width: '100%', padding: '10px 14px', borderRadius: 12, background: cicloInfo.bg, border: `1px solid ${cicloInfo.color}30`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: cicloInfo.color }}>Ciclo: {cicloInfo.nombre}</div>
              <div style={{ fontSize: 11, color: '#8e8e93', marginTop: 2 }}>
                {cicloCompletado ? '⚠️ ¡Ciclo completado! Cambia al siguiente' : `Semana ${semanasCiclo + 1}/${cicloInfo.semanas} · ${semanasRestantes} sem. restantes`}
              </div>
            </div>
            <span style={{ fontSize: 12, color: cicloInfo.color, fontWeight: 700 }}>Cambiar ▼</span>
          </button>
        )}
      </div>

      {/* Modal cambio de ciclo */}
      {mostrarCiclos && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setMostrarCiclos(false)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 430, margin: '0 auto', padding: 20, paddingBottom: 40 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Cambiar ciclo de entrenamiento</div>
            <div style={{ fontSize: 13, color: '#8e8e93', marginBottom: 16, lineHeight: 1.5 }}>
              La ciencia recomienda cambiar el estímulo cada <b>4–6 semanas</b> para evitar estancamientos. Cada ciclo varía las series, reps y algunos ejercicios.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CICLOS.map(c => (
                <button key={c.id} onClick={() => cambiarCiclo(c.id)}
                  style={{ padding: '14px 16px', borderRadius: 14, background: c.id === cicloActual ? c.bg : '#f5f5f7', border: c.id === cicloActual ? `2px solid ${c.color}` : '2px solid transparent', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: c.id === cicloActual ? c.color : '#1c1c1e' }}>{c.nombre}</span>
                    <span style={{ fontSize: 11, color: '#8e8e93' }}>{c.semanas} {c.semanas === 1 ? 'semana' : 'semanas'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#8e8e93', marginTop: 4 }}>{c.descripcion}</div>
                  <div style={{ fontSize: 11, color: c.color, marginTop: 4, fontWeight: 500 }}>{c.objetivo}</div>
                  {c.id === cicloActual && <span style={{ fontSize: 11, fontWeight: 700, color: c.color }}>✓ Activo</span>}
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
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }}>
              {DIAS.map((d, i) => (
                <button key={d.id} style={S.btnPill(diaIdx === i, cicloInfo.color)}
                  onClick={() => { setDiaIdx(i); setEjAbierto(null); setAltAbierta(null) }}>
                  {d.emoji} {d.nombre}
                </button>
              ))}
            </div>

            <div style={{ ...S.card, background: dia.bg, marginBottom: 12 }}>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: cicloInfo.color }}>{dia.enfoque}</div>
                {dia.circuito && <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: cicloInfo.color }}>⚡ CIRCUITO – {dia.vueltas} VUELTAS · descanso 2 min</div>}
                <div style={{ marginTop: 8, fontSize: 12, color: '#8e8e93' }}>🏃 {dia.cardio}</div>
              </div>
            </div>

            {dia.ejercicios.map((ej, idx) => {
              const open = ejAbierto === ej.id
              const altOpen = altAbierta === ej.id
              const max = getMaxValor(ej.id, ej.tipo)
              const ultimo = getUltimoValor(ej.id)
              const esDeload = String(ej.reps).includes('deload')

              const etiquetaMax = () => {
                if (!max) return null
                if (ej.tipo === 'tiempo') return `🕐 ${max}s`
                if (ej.tipo === 'reps') return `✓ ${max} reps`
                return `🏆 ${max}kg`
              }

              return (
                <div key={ej.id} style={{ ...S.card, border: open ? `2px solid ${cicloInfo.color}` : '2px solid transparent' }}>
                  <button onClick={() => { setEjAbierto(open ? null : ej.id); setAltAbierta(null) }}
                    style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: cicloInfo.bg, color: cicloInfo.color, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{idx + 1}</div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1c1c1e' }}>{ej.nombre}</div>
                      <div style={{ fontSize: 12, color: '#8e8e93', marginTop: 2 }}>{ej.musculo}</div>
                    </div>
                    <div style={{ textAlign: 'right', marginRight: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: cicloInfo.color }}>{ej.series}×{ej.tipo === 'tiempo' ? `${ej.reps}s` : ej.reps}</div>
                      {etiquetaMax() && <div style={{ fontSize: 11, color: '#8e8e93' }}>{etiquetaMax()}</div>}
                    </div>
                    <span style={{ color: '#c7c7cc', fontSize: 11 }}>{open ? '▲' : '▼'}</span>
                  </button>

                  {open && (
                    <div style={{ borderTop: '1px solid #f2f2f7', padding: '14px 16px' }}>
                      {/* GIF */}
                      <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 12, background: '#f5f5f7', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <img src={ej.gif} alt={ej.nombre}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                        <div style={{ display: 'none', position: 'absolute', inset: 0, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#8e8e93' }}>
                          <span style={{ fontSize: 40 }}>🏋️</span>
                          <span style={{ fontSize: 13 }}>{ej.nombre}</span>
                        </div>
                      </div>

                      {/* Tip + badge ciclo */}
                      <div style={{ background: cicloInfo.bg, borderRadius: 10, padding: '10px 12px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 14 }}>💡</span>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: cicloInfo.color, marginBottom: 3 }}>{cicloInfo.nombre}: {ej.series} series × {ej.tipo === 'tiempo' ? `${ej.reps} seg` : ej.reps}</div>
                          <div style={{ fontSize: 12, color: '#3c3c43', lineHeight: 1.4 }}>{ej.tip}</div>
                          {esDeload && <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4, fontWeight: 600 }}>⚡ Deload: usa ~50% de tu peso habitual para recuperar</div>}
                        </div>
                      </div>

                      {/* Registro */}
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#3c3c43', marginBottom: 10 }}>
                        {ej.tipo === 'tiempo' ? 'Registra el tiempo (seg) por serie:' :
                         ej.tipo === 'reps' ? 'Registra las repeticiones por serie:' :
                         ej.tipo === 'peso_reps' ? 'Registra peso (kg) y reps por serie:' :
                         'Registra el peso (kg) por serie:'}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(ej.series, ej.tipo === 'peso_reps' ? 2 : 4)}, 1fr)`, gap: 8, marginBottom: 14 }}>
                        {Array.from({ length: ej.series }, (_, i) => i + 1).map(s => (
                          <EjercicioInput key={s} ej={ej} serie={s}
                            valor={getValorHoy(ej.id, s)}
                            onChange={v => setValorEj(ej.id, s, v)}
                            ultimoValor={s === 1 ? ultimo : null} />
                        ))}
                      </div>

                      {/* Botón alternativa */}
                      {ej.alternativas?.length > 0 && (
                        <>
                          <button onClick={() => setAltAbierta(altOpen ? null : ej.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: `1px solid ${cicloInfo.color}`, background: 'transparent', color: cicloInfo.color, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            🔄 {altOpen ? 'Ocultar alternativas' : `Si la máquina no está (${ej.alternativas.length})`}
                          </button>
                          {altOpen && (
                            <div style={{ marginTop: 10, background: '#f5f5f7', borderRadius: 12, overflow: 'hidden' }}>
                              {ej.alternativas.map((alt, i) => (
                                <div key={i} style={{ padding: '11px 14px', borderBottom: i < ej.alternativas.length - 1 ? '1px solid #e5e5ea' : 'none', display: 'flex', justifyContent: 'space-between' }}>
                                  <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{alt.nombre}</div>
                                    <div style={{ fontSize: 11, color: '#8e8e93', marginTop: 2 }}>{alt.musculo}</div>
                                  </div>
                                  <span style={{ fontSize: 18 }}>💪</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {/* ══════════ PESO ══════════ */}
        {tab === 'peso' && (
          <>
            <div style={{ ...S.card, padding: 16 }}>
              <div style={S.label}>Peso de hoy</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input type="number" inputMode="decimal" placeholder="ej: 78.5"
                  value={pesoInput} onChange={e => setPesoInput(e.target.value)}
                  style={{ ...S.input, flex: 1, fontSize: 20, fontWeight: 700 }} />
                <span style={{ padding: '12px 0', color: '#8e8e93', fontWeight: 600, alignSelf: 'center' }}>kg</span>
                <button onClick={addPeso} style={{ ...S.btnPrimary('#6366f1'), width: 'auto', padding: '12px 20px', borderRadius: 12 }}>Guardar</button>
              </div>
            </div>

            {histPeso.length > 0 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div style={{ ...S.card, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#8e8e93' }}>Peso actual</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#6366f1', marginTop: 4 }}>{histPeso.at(-1).peso}</div>
                    <div style={{ fontSize: 13, color: '#8e8e93' }}>kg</div>
                  </div>
                  <div style={{ ...S.card, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#8e8e93' }}>Cambio total</div>
                    {histPeso.length > 1
                      ? <><div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: histPeso.at(-1).peso <= histPeso[0].peso ? '#10b981' : '#f97316' }}>
                          {(histPeso.at(-1).peso - histPeso[0].peso > 0 ? '+' : '')}{(histPeso.at(-1).peso - histPeso[0].peso).toFixed(1)}
                        </div><div style={{ fontSize: 13, color: '#8e8e93' }}>kg</div></>
                      : <div style={{ fontSize: 22, marginTop: 8 }}>—</div>}
                  </div>
                </div>
                <div style={{ ...S.card, padding: 16, marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#8e8e93', marginBottom: 14 }}>Evolución</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 80 }}>
                    {histPeso.slice(-14).map((e, i, arr) => {
                      const pesos = arr.map(x => x.peso), min = Math.min(...pesos), rng = Math.max(...pesos) - min || 1
                      const h = Math.round(((e.peso - min) / rng) * 56 + 16)
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <div style={{ width: '100%', height: h, borderRadius: '4px 4px 0 0', background: i === arr.length - 1 ? '#6366f1' : '#e0e0f0' }} />
                          {i === arr.length - 1 && <div style={{ fontSize: 9, color: '#6366f1', fontWeight: 700 }}>{e.peso}</div>}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ padding: '14px 16px 8px', fontSize: 13, fontWeight: 700, color: '#8e8e93' }}>HISTORIAL</div>
                  {[...histPeso].reverse().slice(0, 15).map((e, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #f2f2f7' }}>
                      <span style={{ fontSize: 14, color: '#3c3c43' }}>{e.fecha}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {e.semana && <span style={{ fontSize: 11, color: '#8e8e93', background: '#f5f5f7', padding: '2px 8px', borderRadius: 8 }}>{e.semana}</span>}
                        <span style={{ fontSize: 16, fontWeight: 700 }}>{e.peso} kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {histPeso.length === 0 && <div style={{ textAlign: 'center', padding: '60px 0', color: '#8e8e93' }}><div style={{ fontSize: 48 }}>⚖️</div><div style={{ marginTop: 12 }}>Registra tu primer pesaje</div></div>}
          </>
        )}

        {/* ══════════ DIETA ══════════ */}
        {tab === 'dieta' && (
          <>
            <div style={{ ...S.card, padding: 16, marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Tus datos</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                {[['Altura (cm)', 'altura', '175'], ['Edad (años)', 'edad', '30'], ['Peso actual (kg)', 'pesoActual', '80'], ['Peso objetivo (kg)', 'pesoObj', '75']].map(([l, k, ph]) => (
                  <div key={k}><div style={S.label}>{l}</div>
                    <input type="number" inputMode="decimal" placeholder={ph} value={dUser[k]} onChange={e => setDUser({ ...dUser, [k]: e.target.value })} style={S.input} /></div>
                ))}
              </div>
              <div style={S.label}>Sexo</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {[['hombre', '♂ Hombre'], ['mujer', '♀ Mujer']].map(([v, l]) => (
                  <button key={v} style={{ ...S.btnPill(dUser.sexo === v, '#6366f1'), flex: 1 }} onClick={() => setDUser({ ...dUser, sexo: v })}>{l}</button>
                ))}
              </div>
              <div style={S.label}>Objetivo</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[['perder', '🔥 Bajar'], ['recomposicion', '⚡ Recomp'], ['ganar', '💪 Ganar']].map(([v, l]) => (
                  <button key={v} style={{ ...S.btnPill(dUser.meta === v, '#6366f1'), flex: 1 }} onClick={() => setDUser({ ...dUser, meta: v })}>{l}</button>
                ))}
              </div>
              <button style={S.btnPrimary('#6366f1')} onClick={calcDieta}>Calcular mi plan</button>
            </div>

            {dietaCalc && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
                  {[['Calorías', dietaCalc.kcal, 'kcal', '#f97316'], ['Proteína', dietaCalc.p, 'g', '#6366f1'], ['Carbos', dietaCalc.c, 'g', '#f59e0b']].map(([l, v, u, c]) => (
                    <div key={l} style={{ ...S.card, padding: 14, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#8e8e93' }}>{l}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: c, marginTop: 4 }}>{v}</div>
                      <div style={{ fontSize: 11, color: '#8e8e93' }}>{u}</div>
                    </div>
                  ))}
                </div>
                <div style={{ ...S.card, padding: '12px 16px', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#8e8e93' }}>Grasas: <b style={{ color: '#a855f7' }}>{dietaCalc.g}g</b></span>
                  <span style={{ fontSize: 13, color: '#8e8e93' }}>Mantenimiento: <b>{dietaCalc.tdee} kcal</b></span>
                </div>
                {[
                  { hora: '08:00', label: 'Entreno', icon: '💪', color: '#6366f1', tipo: null, nota: 'Café solo o agua. Entreno en ayunas.' },
                  { hora: '09:00', label: 'Post-entreno', icon: '🍗', color: '#10b981', tipo: 'postEntreno', nota: 'Proteína + carbohidratos para recuperar' },
                  { hora: '13:00', label: 'Comida principal', icon: '🍽️', color: '#f97316', tipo: 'comida', nota: 'Mayor aporte calórico del día' },
                  { hora: '17:00', label: 'Merienda', icon: '🥛', color: '#f59e0b', tipo: 'merienda', nota: 'Proteína + fruta o carbohidrato ligero' },
                  { hora: '22:00', label: 'Cena', icon: '🌙', color: '#8b5cf6', tipo: 'cena', nota: 'Proteína + verduras, pocos carbos' },
                ].map(({ hora, label, icon, color, tipo, nota }) => (
                  <div key={hora} style={{ ...S.card, marginBottom: 10 }}>
                    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 15, fontWeight: 700 }}>{label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color }}>{hora}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#8e8e93', marginTop: 2 }}>{nota}</div>
                      </div>
                    </div>
                    {tipo && PLATOS[tipo] && (
                      <div style={{ borderTop: '1px solid #f2f2f7' }}>
                        {PLATOS[tipo].map((plato, i) => (
                          <div key={i}>
                            <button onClick={() => setPlatoAbierto(platoAbierto === `${tipo}-${i}` ? null : `${tipo}-${i}`)}
                              style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < PLATOS[tipo].length - 1 ? '1px solid #f2f2f7' : 'none' }}>
                              <span style={{ fontSize: 14, textAlign: 'left' }}>🍽️ {plato.nombre}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color }}>{plato.kcal} kcal</span>
                                <span style={{ fontSize: 11, color: '#c7c7cc' }}>{platoAbierto === `${tipo}-${i}` ? '▲' : '▼'}</span>
                              </div>
                            </button>
                            {platoAbierto === `${tipo}-${i}` && (
                              <div style={{ background: '#f9f9fb', padding: '12px 16px' }}>
                                <div style={{ fontSize: 13, color: '#3c3c43', marginBottom: 10, lineHeight: 1.5 }}>📋 {plato.receta}</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  {[['Proteína', plato.p, '#6366f1'], ['Carbos', plato.c, '#f59e0b'], ['Grasas', plato.g, '#a855f7']].map(([l, v, c]) => (
                                    <div key={l} style={{ flex: 1, background: '#fff', borderRadius: 10, padding: 8, textAlign: 'center' }}>
                                      <div style={{ fontSize: 10, color: '#8e8e93' }}>{l}</div>
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
                ))}
              </>
            )}
          </>
        )}

        {/* ══════════ PROGRESO ══════════ */}
        {tab === 'progreso' && (
          <>
            <div style={{ ...S.card, padding: 16, marginBottom: 10, background: '#eef2ff' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#6366f1', marginBottom: 4 }}>📅 Semana actual: {getWeekKey()}</div>
              <div style={{ fontSize: 12, color: '#8e8e93', marginBottom: 12, lineHeight: 1.5 }}>Guarda un snapshot de tus mejores marcas para comparar semana a semana.</div>
              <button onClick={guardarSemana} style={S.btnPrimary('#6366f1')}>💾 Guardar progreso de esta semana</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div style={{ ...S.card, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#8e8e93' }}>Peso actual</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#6366f1', marginTop: 4 }}>{histPeso.at(-1)?.peso ?? '—'}{histPeso.length ? ' kg' : ''}</div>
              </div>
              <div style={{ ...S.card, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#8e8e93' }}>Semanas guardadas</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981', marginTop: 4 }}>{Object.keys(progSemanal).length}</div>
              </div>
            </div>

            {Object.entries(progSemanal).sort((a, b) => b[0].localeCompare(a[0])).map(([semana, data], si, arr) => {
              const anterior = arr[si + 1]?.[1]
              const cicloSemana = CICLOS.find(c => c.id === data.ciclo) || cicloInfo
              return (
                <div key={semana} style={{ ...S.card, marginBottom: 10 }}>
                  <div style={{ padding: '12px 16px', background: '#f5f5f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 800 }}>{semana}</span>
                      {si === 0 && <span style={{ marginLeft: 8, fontSize: 11, background: '#6366f1', color: '#fff', padding: '2px 8px', borderRadius: 10 }}>Última</span>}
                      <div style={{ display: 'inline-block', marginLeft: 8, fontSize: 11, background: cicloSemana.bg, color: cicloSemana.color, padding: '1px 8px', borderRadius: 8, fontWeight: 600 }}>{cicloSemana.nombre}</div>
                    </div>
                    {data.peso && <span style={{ fontSize: 13, color: '#8e8e93' }}>⚖️ {data.peso}kg</span>}
                  </div>
                  {DIAS.map(d => {
                    const ejs = Object.entries(data.snapshot?.[d.id] || {})
                    if (!ejs.length) return null
                    return (
                      <div key={d.id} style={{ borderTop: '1px solid #f2f2f7' }}>
                        <div style={{ padding: '8px 16px', background: d.bg }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.emoji} {d.enfoque}</span>
                        </div>
                        {ejs.map(([ejId, m], i) => {
                          const prevMax = anterior?.snapshot?.[d.id]?.[ejId]?.max
                          const diff = prevMax ? m.max - prevMax : null
                          const unidad = m.tipo === 'tiempo' ? 's' : m.tipo === 'reps' ? ' reps' : 'kg'
                          return (
                            <div key={ejId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: '1px solid #f2f2f7' }}>
                              <span style={{ fontSize: 13 }}>{m.nombre}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {diff !== null && diff !== 0 && (
                                  <span style={{ fontSize: 12, fontWeight: 700, color: diff > 0 ? '#10b981' : '#f97316' }}>
                                    {diff > 0 ? `▲ +${diff}` : `▼ ${diff}`}{unidad}
                                  </span>
                                )}
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
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8e8e93' }}>
                <div style={{ fontSize: 48 }}>📅</div>
                <div style={{ marginTop: 16, fontSize: 16, fontWeight: 600, color: '#1c1c1e' }}>Sin semanas guardadas aún</div>
                <div style={{ marginTop: 8, fontSize: 14 }}>Entrena, registra pesos y guarda tu semana</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* NAV */}
      <div style={S.nav}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: '10px 0 12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 24 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? '#6366f1' : '#8e8e93' }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
