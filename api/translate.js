const { createClient } = require("@supabase/supabase-js");

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const SUPABASE_URL = process.env.SUPABASE_URL || "https://zehwsrjfwgdrmnnclezl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BMWfC_3FdJkW7RMqYW1tcQ_cj79O7Y1";
const GUEST_RATE_WINDOW_MS = 60 * 1000;
const GUEST_RATE_LIMIT = 12;
const guestRateMap = new Map();

function buildPrompt({ mode, text, tone, fromLang, toLang, toneCount }) {
  const isAutoDetected = fromLang === "Detect language";
  const sourceInstruction = isAutoDetected
    ? `Detect the source language of the input text automatically, then translate it into ${toLang}.`
    : `Translate the following text from ${fromLang} into ${toLang}.`;

  if (mode === "quick") {
    return `${sourceInstruction}
Output ONLY the translated text, no labels, no explanations.
Text: "${text}"
Respond in this exact JSON format (no markdown, no backticks):
{"translated":"..."}`;
  }

  const toneGuide = {
    Succinct: "Extremely concise. Strip the message down hard, cut filler, compress phrasing aggressively, and make every word earn its place. It should feel noticeably shorter and tighter than normal while still preserving the meaning.",
    Assertive: "Much more assertive. Use firmer, blunter, more commanding wording with very little hedging or softness. It should feel strong, direct, and hard to ignore.",
    Casual: "Relaxed, everyday language — like texting a close friend. Short sentences, natural contractions, no formality.",
    "Gen A": "Gen Alpha and Gen Z internet-native language — use a broad rotating mix of current expressions, playful phrasing, meme-adjacent wording, and casually online rhythm. Pull from a wider pool than the same few catchphrases, and vary the wording naturally between responses. Can include things like 'lowkey', 'highkey', 'fr', 'fr fr', 'no cap', 'it's giving', 'ate', 'core', 'vibes', 'delulu', 'iconic', 'wild', 'mid', 'bet', 'say less', or emojis when natural, but avoid sounding repetitive, forced, or copy-pasted. Should sound distinctly different from just being casual.",
    Flirty: "Much more flirty. Make it playfully seductive, teasing, confident, and clearly romantic with stronger chemistry and tension. It should feel boldly flirtatious and current, like real modern texting or banter, without turning stiff, old-fashioned, theatrical, or poetic.",
    Luxury: "Elevated and high-end. Sound polished, premium, and refined, like upscale hospitality or luxury branding, without becoming robotic or pretentious.",
    Motivational: "Far more motivational. Make it uplifting, energizing, and momentum-building, like a real pep talk. Use strong encouragement, belief, and forward-drive rather than mild positivity.",
    Urgent: "Much more urgent. Make it feel immediate, pressing, and hard to ignore, with stronger time pressure and a clearer need for action right now. It should feel genuinely urgent rather than merely important.",
    Anger: "Sharper, hotter, and more openly angry. Make the frustration unmistakable with biting, forceful wording, stronger edge, and less softness. It should feel irritated, fed up, or pissed off rather than merely stern, while still preserving the original meaning and not inventing new facts.",
    Chaotic: "Much more unhinged. Make it wild, impulsive, messy, over-the-top, and erratic with explosive energy, while still barely coherent enough to follow. It should feel delightfully unstable rather than simply playful.",
    Sarcastic: "Clearly sarcastic. Use dry, biting, eye-roll energy, pointed phrasing, and obvious verbal irony. It should feel knowingly cutting, not accidentally sincere.",
    Savage: "Extra ruthless. Make it brutally sharp, merciless, and cutting with zero softness. It should feel devastatingly direct and harsh, but still preserve the original meaning instead of inventing insults from nowhere.",
    Overexplaining: "Needlessly detailed. Over-clarify obvious things, add extra explanation and qualifiers, and make the message comically more elaborate while keeping the same meaning.",
    "Dad Joke": "Much cornier and more pun-heavy. Lean hard into eye-roll-worthy dad humor, wholesome groaners, obvious wordplay, and embarrassingly earnest joke energy without derailing the message.",
    Rapper: "Rhythmic, punchy, and rhyme-forward. Use bars, internal rhyme or end-rhyme when natural, and a rap-like flow that feels intentional and musical. Make the wording sound like lyrics or confident rap-influenced speech, but keep the meaning clear and avoid turning it into nonsense just to force a rhyme.",
    Tea: "Extremely chatty, juicy, and gossipy. Make it sound like someone spilling tea with animated side-comments, little reactions, knowing phrasing, and conversational momentum. Lean into nosy, dramatic, 'can you believe this?' energy when appropriate, but keep the core meaning intact and don't invent new facts.",
    Enthusiastic: "Much more enthusiastic. Turn up the excitement, warmth, exclamation, and eager energy so it feels openly thrilled and animated rather than just positive.",
    Shakespearean: "Theatrical, elevated, and Bard-like — use expressive, dramatic phrasing inspired by Shakespearean English without becoming unreadable. Favor lyrical turns of phrase, grand feeling, and stage-like rhythm, adapted naturally to the target language.",
    Noir: "Moody and mysterious. Use shadowy, understated, slightly cinematic wording with a cool, enigmatic edge. Keep it modern and readable, not cheesy detective parody.",
  };

  const toneInstruction = toneGuide[tone] ? ` Main tone guide: ${toneGuide[tone]}` : "";
  const levelDesc =
    toneCount === 1
      ? ` Intensity level: 1x. Apply the tone lightly. Keep the rewrite relatively close to the original message, with only a subtle tone shift. Preserve most of the original directness, structure, and communicative feel.`
      : toneCount === 2
        ? ` Intensity level: 2x. Make the tone clearly noticeable and natural. Rewrite more freely than 1x so the tone comes through in an obvious way, but keep the same meaning, intent, and overall message goal.`
        : ` Intensity level: 3x. This is the boldest, most fully committed version of the tone. Lean into the selected tone strongly and stylistically, but do not change the core meaning, factual content, or communicative goal of the message.`;

  return `You are a communication refinement and translation assistant.
Task 1 — REFINE:
Rewrite the message in a "${tone}" tone. Keep the meaning, intent, and context identical; change only tone and phrasing.${toneInstruction}${levelDesc}
Return only the refined text.

Task 2 — TRANSLATE:
Translate into ${toLang} with this priority:
1. Preserve the original meaning, intent, context, and relationship dynamic.
2. Make "${tone}" land naturally and clearly in ${toLang} using native phrasing, cultural nuance, and social norms.
3. Treat the refined wording only as a light stylistic reference, not the main translation source.

Rules:
- Prioritize the original message and selected tone over the exact wording of the refined text.
- The translation should sound like a native speaker in ${toLang} expressing this message in a "${tone}" way.
- Adapt formality, softness, directness, humor, flirtiness, emotion, and subtext to how that tone is naturally expressed in ${toLang}.
- Do not explicitly mention, label, or name the selected tone in the refined or translated output unless the original message itself calls for that wording.
- Prefer natural, culturally appropriate phrasing over literal wording whenever they conflict.
- Preserve intensity in both steps:
  - 1x = subtle
  - 2x = clear and balanced
  - 3x = boldest version of the tone
- If refined wording conflicts with what sounds right in ${toLang}, choose the phrasing that best preserves meaning while making the tone land correctly.
- If source language is auto detect, infer it from the original message.

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

  const cap = profile?.is_pro ? 300 : 20;
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
      model: "gpt-4o-mini",
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
  console.log("OpenAI usage:", {
    model: data.model,
    usage: data.usage,
    id: data.id,
  });
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
