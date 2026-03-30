// ─── PLAN LIMITS ─────────────────────────────────────────────
export const FREE_TONES = ["Polite", "Formal", "Friendly"];
export const PRO_TONES = ["Sincere", "Serious", "Succinct", "Assertive", "Diplomatic", "Empathetic", "Apologetic", "Enthusiastic", "Urgent", "Warm"];
export const ALL_TONES = [...FREE_TONES, ...PRO_TONES];
export const MAX_SAME_TONE = 3;
export const FREE_DAILY_CAP = 30;
export const PRO_SAVE_LIMIT = 50;
export const PRO_SAVE_WARN = 45;
export const FREE_BOOKMARK_LIMIT = 2;
export const PRO_BOOKMARK_LIMIT = 6;
export const CHAR_LIMIT = 500;

export const ALL_LANGUAGES = [
  "English","Spanish","French","Japanese","Mandarin","Arabic",
  "German","Portuguese","Korean","Italian","Vietnamese","Russian",
  "Dutch","Turkish","Polish"
];

// ─── THEMES ──────────────────────────────────────────────────
export const THEMES = {
  dark: {
    bg:"#050505", phoneBg:"#0f0f0f", surface:"#181818", surface2:"#222",
    border:"#333", border2:"#444",
    text:"#f5f1e8", textMuted:"#d0ccc0", textDim:"#9a9690", textFaint:"#686460",
    accent:"#c8f0a0", accentText:"#0a1a00",
    highlight:"#0e1e0e", highlightBorder:"#304e30", highlightText:"#c8e8a0",
    notch:"#1c1c1c", proTag:"#e8c547", swipeHint:"#e0dcd4",
  },
  light: {
    bg:"#e8e4da", phoneBg:"#faf8f3", surface:"#f0ece3", surface2:"#e6e2d8",
    border:"#d0ccbf", border2:"#b8b4a8",
    text:"#1a1a0a", textMuted:"#3a3830", textDim:"#6a6860", textFaint:"#9a9890",
    accent:"#2a7a2a", accentText:"#f0ece0",
    highlight:"#dff0df", highlightBorder:"#8ac08a", highlightText:"#1a4a1a",
    notch:"#ddd9d0", proTag:"#a07010", swipeHint:"#3a3830",
  },
};
const toggleBM = lang => setBookmarked(prev =>
    prev.includes(lang) ? prev.filter(l => l !== lang)
    : prev.length < bookmarkLimit ? [...prev, lang] : prev
  );

