import { supabase } from './supabase.js'

// Clave reservada dentro de rg_user_data.registros para el resto de datos de la app
const APP_KEY = '_app'

// ─── PERFILES ────────────────────────────────────────────────────────────────

function rowToProfile(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    avatar: row.avatar,
    cicloActual: row.ciclo_actual || 'hiper',
    cicloSemanaInicio: row.ciclo_semana_inicio || null,
    objetivo: row.objetivo || null,
    nivel: row.nivel || null,
    authUserId: row.auth_user_id || null,
  }
}

function profileToRow(profile) {
  return {
    id: profile.id,
    nombre: profile.nombre,
    avatar: profile.avatar,
    ciclo_actual: profile.cicloActual || 'hiper',
    ciclo_semana_inicio: profile.cicloSemanaInicio || null,
    objetivo: profile.objetivo || null,
    nivel: profile.nivel || null,
    auth_user_id: profile.authUserId || null,
  }
}

export async function getProfiles(authUserId) {
  if (!supabase) {
    const all = JSON.parse(localStorage.getItem('rg_users') || '[]')
    if (!authUserId) return all
    const own = all.filter(u => u.authUserId === authUserId)
    return own.length > 0 ? own : all.filter(u => !u.authUserId)
  }
  if (authUserId) {
    // Primero perfiles vinculados a este usuario
    const { data: own } = await supabase.from('rg_profiles').select('*').eq('auth_user_id', authUserId).order('created_at')
    if (own && own.length > 0) {
      const profiles = own.map(rowToProfile)
      localStorage.setItem('rg_users', JSON.stringify(profiles))
      return profiles
    }
    // Migración: si no hay vinculados, mostrar los sin vincular para que pueda reclamarlos
    const { data: unlinked } = await supabase.from('rg_profiles').select('*').is('auth_user_id', null).order('created_at')
    const profiles = (unlinked || []).map(rowToProfile)
    localStorage.setItem('rg_users', JSON.stringify(profiles))
    return profiles
  }
  const { data, error } = await supabase.from('rg_profiles').select('*').order('created_at')
  if (error) return JSON.parse(localStorage.getItem('rg_users') || '[]')
  const profiles = data.map(rowToProfile)
  localStorage.setItem('rg_users', JSON.stringify(profiles))
  return profiles
}

export async function upsertProfile(profile) {
  const users = JSON.parse(localStorage.getItem('rg_users') || '[]')
  const updated = users.some(u => u.id === profile.id)
    ? users.map(u => u.id === profile.id ? profile : u)
    : [...users, profile]
  localStorage.setItem('rg_users', JSON.stringify(updated))
  if (!supabase) return
  await supabase.from('rg_profiles').upsert(profileToRow(profile))
}

export async function deleteProfile(id) {
  const users = JSON.parse(localStorage.getItem('rg_users') || '[]')
  localStorage.setItem('rg_users', JSON.stringify(users.filter(u => u.id !== id)))
  if (!supabase) return
  await supabase.from('rg_profiles').delete().eq('id', id)
}

// ─── DATOS DE USUARIO ─────────────────────────────────────────────────────────

export async function getUserData(profileId) {
  if (!supabase) {
    const all = JSON.parse(localStorage.getItem('rg_data') || '{}')
    return all[profileId] || {}
  }
  const { data, error } = await supabase
    .from('rg_user_data').select('*').eq('profile_id', profileId).maybeSingle()
  if (error || !data) return {}
  // El resto de campos (alternativas elegidas, bloque de rotación, medidas,
  // actividades, marcas reseteadas…) viajan dentro de registros._app porque la
  // tabla solo tiene tres columnas. Antes se perdían al recargar.
  const { [APP_KEY]: extraNube, ...registros } = data.registros || {}
  // Primera carga tras el arreglo: se recupera lo que quedó en la caché local
  let extra = extraNube
  if (!extra) {
    const { registros: _r, histPeso: _h, progSemanal: _p, ...local } = JSON.parse(localStorage.getItem('rg_data') || '{}')[profileId] || {}
    extra = local
  }
  return {
    ...extra,
    registros,
    histPeso:    data.hist_peso   || [],
    progSemanal: data.prog_semanal || {},
  }
}


export async function saveUserData(profileId, ud) {
  // Siempre guarda en local como caché
  const all = JSON.parse(localStorage.getItem('rg_data') || '{}')
  localStorage.setItem('rg_data', JSON.stringify({ ...all, [profileId]: ud }))
  if (!supabase) return
  const { registros = {}, histPeso, progSemanal, ...extra } = ud
  await supabase.from('rg_user_data').upsert({
    profile_id:   profileId,
    registros:    { ...registros, [APP_KEY]: extra },
    hist_peso:    ud.histPeso    || [],
    prog_semanal: ud.progSemanal || {},
    updated_at:   new Date().toISOString(),
  })
}

// ─── DIETA ────────────────────────────────────────────────────────────────────

export async function getDieta(profileId) {
  if (!supabase) {
    const all = JSON.parse(localStorage.getItem('rg_dieta') || '{}')
    return all[profileId] || {}
  }
  const { data, error } = await supabase
    .from('rg_dieta').select('*').eq('profile_id', profileId).maybeSingle()
  if (error || !data) return {}
  return data.data || {}
}

export async function saveDieta(profileId, dietaData) {
  const all = JSON.parse(localStorage.getItem('rg_dieta') || '{}')
  localStorage.setItem('rg_dieta', JSON.stringify({ ...all, [profileId]: dietaData }))
  if (!supabase) return
  await supabase.from('rg_dieta').upsert({
    profile_id: profileId,
    data:       dietaData,
    updated_at: new Date().toISOString(),
  })
}
