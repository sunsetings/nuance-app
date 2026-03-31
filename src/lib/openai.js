async function callTranslateAPI(payload) {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "OpenAI API error");
  }

  return response.json();
}

export async function refineAndTranslate({ text, tone, fromLang, toLang, toneCount }) {
  return callTranslateAPI({
    mode: "refine",
    text,
    tone,
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
