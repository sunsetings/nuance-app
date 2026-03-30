import { supabase } from './supabase.js'

// ─── USAGE ───────────────────────────────────────────────────
// Gets today's refine count for a user from Supabase
export async function getUsageToday(userId) {
  const today = new Date().toISOString().split('T')[0] // "2026-03-30"
  const { data, error } = await supabase
    .from('usage')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (error || !data) return 0
  return data.count
}

// Increments today's refine count
export async function incrementUsageDB(userId) {
  const today = new Date().toISOString().split('T')[0]

  // Try to update existing row first
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
// Saves a translation to the user's favourites
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

// Removes a saved translation
export async function unsaveTranslation(userId, itemId) {
  const { error } = await supabase
    .from('saved_translations')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId)

  if (error) throw error
}

// Loads all saved translations for a user
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
// Gets or creates a user profile (stores isPro status)
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    // Create profile if it doesn't exist
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({ id: userId, is_pro: false })
      .select()
      .single()
    return newProfile
  }
  return data
}
