const { createClient } = require("@supabase/supabase-js");

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const SUPABASE_URL = process.env.SUPABASE_URL || "https://zehwsrjfwgdrmnnclezl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BMWfC_3FdJkW7RMqYW1tcQ_cj79O7Y1";
const GUEST_RATE_WINDOW_MS = 60 * 1000;
const GUEST_RATE_LIMIT = 12;
const guestRateMap = new Map();

function buildPrompt({ mode, text, tone, fromLang, toLang, toneCount }) {
  if (mode === "quick") {
    return `Translate the following text from ${fromLang} into ${toLang}.
Output ONLY the translated text, no labels, no explanations.
Text: "${text}"
Respond in this exact JSON format (no markdown, no backticks):
{"translated":"..."}`;
  }

  const toneGuide = {
    Casual: "Relaxed, everyday language — like texting a close friend. Short sentences, natural contractions, no formality.",
    "Gen A": "Gen Alpha and Gen Z internet-native language — use a broad rotating mix of current expressions, playful phrasing, meme-adjacent wording, and casually online rhythm. Pull from a wider pool than the same few catchphrases, and vary the wording naturally between responses. Can include things like 'lowkey', 'highkey', 'fr', 'fr fr', 'no cap', 'it's giving', 'ate', 'core', 'vibes', 'delulu', 'iconic', 'wild', 'mid', 'bet', 'say less', or emojis when natural, but avoid sounding repetitive, forced, or copy-pasted. Should sound distinctly different from just being casual.",
    Cheeky: "Bold, mischievous, and lightly teasing. Keep it modern, playful, and a little cheeky without sounding archaic, theatrical, or overly literary. Do not use words like 'alas'.",
    Flirty: "Modern-day flirty — playful, confident, and casually charming. Keep it current, natural, and a little teasing, like present-day texting or light real-life banter. Avoid sounding old-fashioned, overly polished, theatrical, or poetic. Do not use words like 'alas'.",
    Shakespearean: "Theatrical, elevated, and Bard-like — use expressive, dramatic phrasing inspired by Shakespearean English without becoming unreadable. Favor lyrical turns of phrase, grand feeling, and stage-like rhythm, adapted naturally to the target language.",
    Dramatic: "Modern-day emotional intensity — vivid, expressive, and a little cinematic, but still current and natural. Make it feel heightened and dramatic without sounding theatrical, archaic, poetic, or like an old play.",
    Noir: "Moody and mysterious. Use shadowy, understated, slightly cinematic wording with a cool, enigmatic edge. Keep it modern and readable, not cheesy detective parody.",
  };

  const toneInstruction = toneGuide[tone] ? ` Tone guide: ${toneGuide[tone]}` : "";
  const levelDesc =
    toneCount === 1
      ? ` Intensity level: 1x. Apply the tone lightly. Keep the rewrite relatively close to the original message, with only a subtle tone shift. Preserve most of the original directness, structure, and communicative feel.`
      : toneCount === 2
        ? ` Intensity level: 2x. Make the tone clearly noticeable and natural. Rewrite more freely than 1x so the tone comes through in an obvious way, but keep the same meaning, intent, and overall message goal.`
        : ` Intensity level: 3x. This is the boldest, most fully committed version of the tone. Lean into the selected tone strongly and stylistically, but do not change the core meaning, factual content, or communicative goal of the message.`;

  return `You are a communication refinement and translation assistant.
Task 1 — REFINE:
Rewrite the following message in a "${tone}" tone. Keep the core meaning identical. Only change the tone and phrasing.${toneInstruction}${levelDesc}
Output ONLY the refined text, nothing else. No labels, no explanations.
Task 2 — TRANSLATE:
Translate into ${toLang} using this priority order:
1. Preserve the original message's core meaning, intent, and context.
2. Make the selected "${tone}" feel natural, relevant, and strong in ${toLang}.
3. Give very little weight to the exact wording of the refined text. Treat it only as a faint stylistic reference.

Important translation rules:
- Give MUCH MORE weight to the original meaning/intent and the selected tone than to the exact wording of the refined text.
- The translated message should sound like a native speaker in ${toLang} trying to express the message in a "${tone}" way.
- Preserve the social feeling, nuance, subtext, and emotional intensity selected by the user.
- Preserve the same intensity level in translation:
  - 1x = subtle, light-touch tone
  - 2x = clearly noticeable, balanced tone
  - 3x = strongest, boldest version of the tone
- The refined text is NOT the main source for translation. The original meaning and the selected tone are the main sources.
- If the refined wording and the best target-language tone conflict, choose the phrasing that best preserves the original meaning while making the tone land correctly in ${toLang}.
- Do not translate too literally if literal wording makes the message feel flatter, awkward, culturally off, or less on-tone.
- Let the target language adapt naturally so the result feels native, current, and context-appropriate for that tone.

In short: preserve the original meaning first, make the final translation sound naturally "${tone}" in ${toLang} second, and give only minimal weight to the exact wording of the refined sentence.
Output ONLY the translated text, nothing else.
Original message: "${text}"
Respond in this exact JSON format (no markdown, no backticks):
{"refined":"...","translated":"..."}`;
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function getClientIdentifier(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "anonymous";
}

function enforceGuestRateLimit(req) {
  const key = getClientIdentifier(req);
  const now = Date.now();
  const current = guestRateMap.get(key);

  if (!current || now - current.windowStart >= GUEST_RATE_WINDOW_MS) {
    guestRateMap.set(key, { count: 1, windowStart: now });
    return;
  }

  if (current.count >= GUEST_RATE_LIMIT) {
    const retryAfter = Math.ceil((GUEST_RATE_WINDOW_MS - (now - current.windowStart)) / 1000);
    const error = new Error(`Too many translation requests. Please wait ${retryAfter} seconds and try again.`);
    error.statusCode = 429;
    throw error;
  }

  current.count += 1;
  guestRateMap.set(key, current);
}

async function getAuthenticatedUser(token) {
  if (!token) return null;
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

function getRequestedLocalDate(req) {
  const value = req.headers["x-tonara-local-date"];
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : new Date().toISOString().split("T")[0];
}

function getUsageDateKey(req, mode) {
  const base = getRequestedLocalDate(req);
  return mode === "quick" ? `${base}__quick` : base;
}

async function getSignedInUsageContext(userId, req) {
  const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const refineDateKey = getUsageDateKey(req, "refine");
  const quickDateKey = getUsageDateKey(req, "quick");

  const [{ data: refineUsage }, { data: quickUsage }, { data: profile }] = await Promise.all([
    supabase.from("usage").select("count").eq("user_id", userId).eq("date", refineDateKey).single(),
    supabase.from("usage").select("count").eq("user_id", userId).eq("date", quickDateKey).single(),
    supabase.from("profiles").select("is_pro").eq("id", userId).single(),
  ]);

  const cap = profile?.is_pro ? 500 : 30;
  return {
    cap,
    refineCount: refineUsage?.count || 0,
    quickCount: quickUsage?.count || 0,
  };
}

async function incrementSignedInUsage(userId, req, mode) {
  const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const dateKey = getUsageDateKey(req, mode);

  const { data: existing } = await supabase
    .from("usage")
    .select("id, count")
    .eq("user_id", userId)
    .eq("date", dateKey)
    .single();

  if (existing) {
    await supabase
      .from("usage")
      .update({ count: existing.count + 1 })
      .eq("id", existing.id);
    return existing.count + 1;
  }

  await supabase
    .from("usage")
    .insert({ user_id: userId, date: dateKey, count: 1 });

  return 1;
}

async function enforceRequestAccess(req, mode) {
  const token = getBearerToken(req);
  const user = await getAuthenticatedUser(token);

  if (!user) {
    enforceGuestRateLimit(req);
    return { user: null };
  }

  const usage = await getSignedInUsageContext(user.id, req);
  const currentCount = mode === "quick" ? usage.quickCount : usage.refineCount;
  if (currentCount >= usage.cap) {
    const label = mode === "quick" ? "standard translations" : "refines";
    const error = new Error(`Daily ${label} limit reached for this account (${usage.cap}/day).`);
    error.statusCode = 429;
    throw error;
  }

  return { user };
}

async function callOpenAI({ mode, prompt }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured on the server.");
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: mode === "quick" ? 500 : 1000,
      temperature: mode === "quick" ? 0.3 : 0.7,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "OpenAI API error");
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error("Empty AI response");
  }

  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse AI response");
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { mode, text, tone, fromLang, toLang, toneCount = 1 } = body;

    if (!mode || !text || !fromLang || !toLang) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (mode !== "quick" && mode !== "refine") {
      return res.status(400).json({ error: "Invalid mode" });
    }

    if (mode === "refine" && !tone) {
      return res.status(400).json({ error: "Missing tone for refine mode" });
    }

    if (typeof text !== "string" || text.length > 5000) {
      return res.status(400).json({ error: "Text is too long." });
    }

    const access = await enforceRequestAccess(req, mode);

    const prompt = buildPrompt({ mode, text, tone, fromLang, toLang, toneCount });
    const result = await callOpenAI({ mode, prompt });
    if (access.user?.id) {
      await incrementSignedInUsage(access.user.id, req, mode);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Translate API error:", error.message);
    return res.status(error.statusCode || 500).json({ error: error.message || "Translation failed" });
  }
};
