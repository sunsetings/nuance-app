import { supabase } from "./supabase.js";

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function getRequestHeaders() {
  const headers = {
    "Content-Type": "application/json",
    "X-Tonara-Local-Date": getLocalDateKey(),
  };

  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

async function callTranslateAPI(payload) {
  const headers = await getRequestHeaders();
  const response = await fetch("/api/translate", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Translation failed");
  }

  return response.json();
}

export async function refineAndTranslate({ text, tone, blendTone = null, fromLang, toLang, toneCount }) {
  return callTranslateAPI({
    mode: "refine",
    text,
    tone,
    blendTone,
    fromLang,
    toLang,
    toneCount,
  });
}

export async function quickTranslate({ text, fromLang, toLang }) {
  return callTranslateAPI({
    mode: "quick",
    text,
    fromLang,
    toLang,
  });
}
