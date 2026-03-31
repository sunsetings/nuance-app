import { supabase } from './supabase.js'

function getLocalDateKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getUsageDateKey(type = 'refine') {
  const base = getLocalDateKey()
  return type === 'quick' ? `${base}__quick` : base
}

// ─── USAGE ───────────────────────────────────────────────────
export async function getUsageToday(userId, type = 'refine') {
  const today = getUsageDateKey(type)
  const { data, error } = await supabase
    .from('usage')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()
  if (error || !data) return 0
  return data.count
}

export async function incrementUsageDB(userId, type = 'refine') {
  const today = getUsageDateKey(type)
  const { data: existing } = await supabase
    .from('usage')
    .select('id, count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()
  if (existing) {
    await supabase
      .from('usage')
      .update({ count: existing.count + 1 })
      .eq('id', existing.id)
    return existing.count + 1
  } else {
    await supabase
      .from('usage')
      .insert({ user_id: userId, date: today, count: 1 })
    return 1
  }
}

// ─── SAVED ITEMS ─────────────────────────────────────────────
export async function saveTranslation(userId, item) {
  const { data, error } = await supabase
    .from('saved_translations')
    .insert({
      user_id: userId,
      mode: item.mode,
      original: item.original,
      refined: item.refined || null,
      translated: item.translated,
      tone: item.tone || null,
      tone_count: item.toneCount || null,
      from_lang: item.fromLang,
      to_lang: item.toLang,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function unsaveTranslation(userId, itemId) {
  const { error } = await supabase
    .from('saved_translations')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function getSavedTranslations(userId) {
  const { data, error } = await supabase
    .from('saved_translations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data || []
}

// ─── USER PROFILE ─────────────────────────────────────────────
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error || !data) {
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({ id: userId, is_pro: false })
      .select()
      .single()
    return newProfile
  }
  return data
}
