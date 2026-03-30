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

const KEY = "tonara_usage";

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function getUsage() {
  try {
    const raw = localStorage.getItem(KEY);
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

export function incrementUsage() {
  const current = getUsage();
  const updated = { count: current.count + 1, day: getTodayKey() };
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function getRefinesToday() {
  return getUsage().count;
}

export function resetUsage() {
  localStorage.setItem(KEY, JSON.stringify({ count: 0, day: getTodayKey() }));
}
