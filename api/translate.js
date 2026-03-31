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
    "Gen A": "Gen Alpha and Gen Z internet slang — use terms like 'no cap', 'lowkey', 'fr fr', 'slay', 'it's giving', 'bussin', 'rizz', 'understood the assignment', 'ate that', 'periodt', emojis where natural. Very online, very current. Should sound distinctly different from just being casual.",
    "19th Century": "Formal Victorian-era prose — elaborate, eloquent, and ornate. Use archaic vocabulary and constructions appropriate to 19th century written English, adapted naturally to the target language.",
  };

  const toneInstruction = toneGuide[tone] ? ` Tone guide: ${toneGuide[tone]}` : "";
  const levelDesc =
    toneCount === 1
      ? ""
      : toneCount === 2
        ? ` Make it noticeably more ${tone.toLowerCase()} than the previous version.`
        : ` Push the ${tone.toLowerCase()} tone to its maximum — this is the most intensified version.`;

  return `You are a communication refinement and translation assistant.
Task 1 — REFINE:
Rewrite the following message in a "${tone}" tone. Keep the core meaning identical. Only change the tone and phrasing.${toneInstruction}${levelDesc}
Output ONLY the refined text, nothing else. No labels, no explanations.
Task 2 — TRANSLATE:
Translate the refined text from ${fromLang} into ${toLang}.
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

async function getSignedInUsageContext(userId, req) {
  const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const today = getRequestedLocalDate(req);

  const [{ data: usage }, { data: profile }] = await Promise.all([
    supabase.from("usage").select("count").eq("user_id", userId).eq("date", today).single(),
    supabase.from("profiles").select("is_pro").eq("id", userId).single(),
  ]);

  const count = usage?.count || 0;
  const cap = profile?.is_pro ? 500 : 30;
  return { count, cap };
}

async function enforceRequestAccess(req) {
  const token = getBearerToken(req);
  const user = await getAuthenticatedUser(token);

  if (!user) {
    enforceGuestRateLimit(req);
    return { user: null };
  }

  const usage = await getSignedInUsageContext(user.id, req);
  if (usage.count >= usage.cap) {
    const error = new Error(`Daily refine limit reached for this account (${usage.cap}/day).`);
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

    await enforceRequestAccess(req);

    const prompt = buildPrompt({ mode, text, tone, fromLang, toLang, toneCount });
    const result = await callOpenAI({ mode, prompt });
    return res.status(200).json(result);
  } catch (error) {
    console.error("Translate API error:", error.message);
    return res.status(error.statusCode || 500).json({ error: error.message || "Translation failed" });
  }
};
