/**
 * Usage tracking
 * --------------
 * Tracks how many refines the user has done today.
 * Stored in localStorage (the browser's local memory).
 * Resets automatically at midnight (local time).
 *
 * localStorage is like a small notepad the browser keeps for each website.
 * It persists between sessions but is per-device.
 */

const REFINE_KEY = "tonara_usage";
const QUICK_KEY = "tonara_quick_usage";

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getStorageKey(mode = "refine") {
  return mode === "quick" ? QUICK_KEY : REFINE_KEY;
}

export function getUsage(mode = "refine") {
  try {
    const raw = localStorage.getItem(getStorageKey(mode));
    if (!raw) return { count: 0, day: getTodayKey() };
    const data = JSON.parse(raw);
    // If it's a new day, reset
    if (data.day !== getTodayKey()) {
      return { count: 0, day: getTodayKey() };
    }
    return data;
  } catch {
    return { count: 0, day: getTodayKey() };
  }
}

export function incrementUsage(mode = "refine") {
  const current = getUsage(mode);
  const updated = { count: current.count + 1, day: getTodayKey() };
  localStorage.setItem(getStorageKey(mode), JSON.stringify(updated));
  return updated;
}

export function getRefinesToday() {
  return getUsage("refine").count;
}

export function getQuickTranslationsToday() {
  return getUsage("quick").count;
}

export function resetUsage(mode = "refine") {
  localStorage.setItem(getStorageKey(mode), JSON.stringify({ count: 0, day: getTodayKey() }));
}
