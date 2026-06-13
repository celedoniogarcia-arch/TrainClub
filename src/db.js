import { supabase } from './supabase.js'

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

export async function getProfiles() {
  if (!supabase) return JSON.parse(localStorage.getItem('rg_users') || '[]')
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
  return {
    registros:   data.registros   || {},
    histPeso:    data.hist_peso   || [],
    progSemanal: data.prog_semanal || {},
  }
}

export async function saveUserData(profileId, ud) {
  // Siempre guarda en local como caché
  const all = JSON.parse(localStorage.getItem('rg_data') || '{}')
  localStorage.setItem('rg_data', JSON.stringify({ ...all, [profileId]: ud }))
  if (!supabase) return
  await supabase.from('rg_user_data').upsert({
    profile_id:   profileId,
    registros:    ud.registros   || {},
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
