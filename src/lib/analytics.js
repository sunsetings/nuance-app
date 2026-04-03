import posthog from "posthog-js";

const STORAGE_KEY = "tonara_beta_analytics_events";
const MAX_EVENTS = 300;
let posthogReady = false;

function isBrowser() {
  return typeof window !== "undefined";
}

function sanitizeValue(value) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue).filter((entry) => entry !== undefined);
  }
  if (typeof value === "object") {
    const next = {};
    Object.entries(value).forEach(([key, entry]) => {
      const sanitized = sanitizeValue(entry);
      if (sanitized !== undefined) next[key] = sanitized;
    });
    return next;
  }
  return String(value);
}

function buildPayload(event, props = {}) {
  return {
    event,
    timestamp: new Date().toISOString(),
    path: isBrowser() ? window.location.pathname : "",
    props: sanitizeValue(props),
  };
}

function persistPayload(payload) {
  if (!isBrowser()) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const next = [...existing, payload].slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

function fanOutToKnownProviders(event, props) {
  if (!isBrowser()) return;
  try {
    if (posthogReady) {
      posthog.capture(event, props);
    }
  } catch {}
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", event, props);
    }
  } catch {}
  try {
    if (typeof window.plausible === "function") {
      window.plausible(event, { props });
    }
  } catch {}
}

export function initAnalytics() {
  if (!isBrowser() || posthogReady) return;
  const key = import.meta.env?.VITE_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: import.meta.env?.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: false,
    persistence: "localStorage+cookie",
    loaded: () => {
      posthogReady = true;
    },
  });
}

export function identifyAnalyticsUser(userId, props = {}) {
  if (!isBrowser() || !posthogReady || !userId) return;
  try {
    posthog.identify(userId, sanitizeValue(props));
  } catch {}
}

export function resetAnalyticsUser() {
  if (!isBrowser() || !posthogReady) return;
  try {
    posthog.reset();
  } catch {}
}

export function track(event, props = {}) {
  if (!event) return;
  const payload = buildPayload(event, props);
  persistPayload(payload);
  fanOutToKnownProviders(event, payload.props || {});
  if (isBrowser()) {
    try {
      window.dispatchEvent(new CustomEvent("tonara:analytics", { detail: payload }));
    } catch {}
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.debug("[tonara analytics]", payload);
  }
}

export function trackScreen(screen, props = {}) {
  track("screen_view", { screen, ...props });
}

export function getStoredAnalyticsEvents() {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
