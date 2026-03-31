const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

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

async function callOpenAI({ mode, prompt }) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
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
    const { mode, text, tone, fromLang, toLang, toneCount = 1 } = req.body || {};

    if (!mode || !text || !fromLang || !toLang) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (mode !== "quick" && mode !== "refine") {
      return res.status(400).json({ error: "Invalid mode" });
    }

    if (mode === "refine" && !tone) {
      return res.status(400).json({ error: "Missing tone for refine mode" });
    }

    const prompt = buildPrompt({ mode, text, tone, fromLang, toLang, toneCount });
    const result = await callOpenAI({ mode, prompt });
    return res.status(200).json(result);
  } catch (error) {
    console.error("Translate API error:", error.message);
    return res.status(500).json({ error: error.message || "Translation failed" });
  }
};
