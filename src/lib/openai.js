export async function refineAndTranslate({ text, tone, fromLang, toLang, toneCount, apiKey }) {
  const toneGuide = {
    "Casual": "Relaxed, everyday language — like texting a close friend. Short sentences, natural contractions, no formality.",
    "Gen A": "Gen Alpha and Gen Z internet slang — use terms like 'no cap', 'lowkey', 'fr fr', 'slay', 'it's giving', 'bussin', 'rizz', 'understood the assignment', 'ate that', 'periodt', emojis where natural. Very online, very current. Should sound distinctly different from just being casual.",
    "19th Century": "Formal Victorian-era prose — elaborate, eloquent, and ornate. Use archaic vocabulary and constructions appropriate to 19th century written English, adapted naturally to the target language.",
  };
  const toneInstruction = toneGuide[tone] ? ` Tone guide: ${toneGuide[tone]}` : "";
  const levelDesc = toneCount === 1 ? "" : toneCount === 2 ? " Make it noticeably more " + tone.toLowerCase() + " than the previous version." : " Push the " + tone.toLowerCase() + " tone to its maximum — this is the most intensified version.";

  const prompt = `You are a communication refinement and translation assistant.
Task 1 — REFINE:
Rewrite the following message in a "${tone}" tone. Keep the core meaning identical. Only change the tone and phrasing.${toneInstruction}${levelDesc}
Output ONLY the refined text, nothing else. No labels, no explanations.
Task 2 — TRANSLATE:
Translate the refined text from ${fromLang} into ${toLang}.
Output ONLY the translated text, nothing else.
Original message: "${text}"
Respond in this exact JSON format (no markdown, no backticks):
{"refined":"...","translated":"..."}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "OpenAI API error");
  }

  const data = await response.json();
  const raw = data.choices[0].message.content.trim();
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse AI response");
  }
}

export async function quickTranslate({ text, fromLang, toLang, apiKey }) {
  const prompt = `Translate the following text from ${fromLang} into ${toLang}.
Output ONLY the translated text, no labels, no explanations.
Text: "${text}"
Respond in this exact JSON format (no markdown, no backticks):
{"translated":"..."}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 500,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "OpenAI API error");
  }

  const data = await response.json();
  const raw = data.choices[0].message.content.trim();
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse AI response");
  }
}
