// ─── PLAN LIMITS ─────────────────────────────────────────────
export const GUEST_TONES = ["Friendly", "Playful"];
export const FREE_TONES = ["Friendly", "Playful", "Poetic", "Gen A", "Flirty"];
export const PRO_TONES = [
  "Polite", "Casual", "Sincere", "Serious", "Succinct", "Assertive", "Diplomatic",
  "Empathetic", "Apologetic", "Enthusiastic", "Urgent",
  "Shakespearean", "Professional", "Motivational", "Humble",
  "Anger", "Royal", "Luxury", "Chaotic", "Iconic",
  "Overexplaining", "Dad Joke", "Rapper", "Tea",
  "Noir",
];
export const ALL_TONES = [...FREE_TONES, ...PRO_TONES];
export const DEFAULT_PRO_TONES = ["Luxury", "Poetic", "Diplomatic", "Empathetic"];
export const MAX_SAME_TONE = 3;
export const GUEST_DAILY_CAP = 10;
export const FREE_DAILY_CAP = 20;
export const PRO_DAILY_CAP = 300;
export const PRO_SAVE_LIMIT = 50;
export const PRO_SAVE_WARN = 45;
export const FREE_SAVE_LIMIT = 3;
export const FREE_BOOKMARK_LIMIT = 1;
export const PRO_BOOKMARK_LIMIT = 10;
export const PRO_SAVED_TONE_LIMIT = 5;
export const CHAR_LIMIT = 2000;
export const TONE_BLEND_DELIMITER = ":::blend:::";

export const BASE_LANGUAGES = [
  "Arabic", "Dutch", "English", "French", "German", "Italian", "Japanese",
  "Korean", "Chinese (Simplified)", "Chinese (Traditional)", "Portuguese", "Russian", "Spanish", "Vietnamese",
];
export const PRO_LANGUAGES = [
  "Amharic", "Azerbaijani", "Bengali", "Burmese", "Catalan", "Croatian",
  "Czech", "Danish", "Finnish", "Georgian", "Greek", "Gujarati", "Haitian Creole",
  "Hausa", "Hebrew", "Hindi", "Hungarian", "Indonesian", "Kazakh", "Khmer",
  "Kurdish", "Malay", "Marathi", "Mongolian", "Nepali", "Norwegian", "Persian", "Polish",
  "Punjabi", "Romanian", "Serbian", "Sinhala", "Slovak", "Swahili", "Swedish", "Tagalog",
  "Tamil", "Telugu", "Thai", "Turkish", "Ukrainian", "Urdu", "Uzbek", "Yoruba", "Zulu", "Bulgarian",
  "Albanian", "Armenian", "Belarusian", "Bosnian", "Estonian", "Icelandic", "Irish", "Latvian",
  "Lithuanian", "Macedonian", "Maltese", "Slovenian", "Assamese", "Kannada", "Malayalam", "Odia",
  "Pashto", "Syriac", "Tibetan", "Uyghur", "Lao", "Javanese", "Sundanese", "Malagasy",
  "Somali", "Xhosa", "Igbo", "Oromo", "Luganda", "Shona", "Sesotho", "Kinyarwanda",
  "Wolof", "Fula", "Aymara", "Guarani", "Quechua", "Maori", "Samoan", "Tongan",
];
export const ALL_LANGUAGES = [...BASE_LANGUAGES, ...PRO_LANGUAGES];

export const AUTO_DETECT_LANGUAGE = "Detect language";
export const DEFAULT_FROM_LANG = AUTO_DETECT_LANGUAGE;
export const DEFAULT_TO_LANG = "Korean";

export const TONE_CATEGORIES = [
  { label: "Everyday", tones: ["Friendly", "Playful", "Casual", "Gen A", "Flirty"] },
  { label: "Polished", tones: ["Polite", "Professional", "Diplomatic", "Succinct", "Assertive", "Luxury"] },
  { label: "Heartfelt", tones: ["Empathetic", "Sincere", "Apologetic", "Humble", "Motivational"] },
  { label: "Intense", tones: ["Serious", "Urgent", "Anger", "Noir"] },
  { label: "Stylized", tones: ["Poetic", "Rapper", "Shakespearean", "Royal", "Iconic"] },
  { label: "Character", tones: ["Chaotic", "Tea", "Overexplaining", "Dad Joke", "Enthusiastic"] },
];

export const TONE_DESCRIPTIONS = {
  Polite: "Respectful and considerate",
  Casual: "Relaxed and everyday",
  "Gen A": "Current, internet-native tone",
  Playful: "Light and witty",
  Friendly: "Warm and approachable",
  Sincere: "Genuine and heartfelt",
  Serious: "Measured and no-nonsense",
  Succinct: "Short and to the point",
  Assertive: "Confident and direct",
  Diplomatic: "Tactful and balanced",
  Empathetic: "Understanding and caring",
  Apologetic: "Remorseful and soft",
  Enthusiastic: "Energetic and excited",
  Urgent: "Pressing and time-sensitive",
  Shakespearean: "Theatrical and Bard-like",
  Professional: "Clean and corporate-safe",
  Motivational: "Energising and encouraging",
  Humble: "Deferential and respectful",
  Anger: "Sharp and openly frustrated",
  Royal: "Regal and elevated",
  Luxury: "Elevated and high-end",
  Chaotic: "Unhinged and energetic",
  Iconic: "Confident and unforgettable",
  Overexplaining: "Needlessly detailed",
  "Dad Joke": "Corny and harmless",
  Poetic: "Lyrical and expressive",
  Rapper: "Rhythmic, punchy, and rhyme-forward",
  Flirty: "Playful and romantic",
  Tea: "Extra chatty, juicy, and unapologetically gossipy",
  Noir: "Moody and mysterious",
};

function getBlendPairKey(a, b) {
  return [a, b].filter(Boolean).sort().join("||");
}

const WARN_BLEND_PAIRS = new Set([
  getBlendPairKey("Professional", "Chaotic"),
  getBlendPairKey("Diplomatic", "Chaotic"),
  getBlendPairKey("Luxury", "Chaotic"),
  getBlendPairKey("Royal", "Gen A"),
  getBlendPairKey("Shakespearean", "Gen A"),
  getBlendPairKey("Serious", "Dad Joke"),
  getBlendPairKey("Apologetic", "Dad Joke"),
  getBlendPairKey("Noir", "Dad Joke"),
  getBlendPairKey("Iconic", "Humble"),
  getBlendPairKey("Urgent", "Dad Joke"),
]);

const BLOCK_BLEND_PAIRS = new Set([
  getBlendPairKey("Succinct", "Overexplaining"),
  getBlendPairKey("Professional", "Chaotic"),
]);

export function getBlendToneState(mainTone, blendTone) {
  if (!mainTone || !blendTone || mainTone === blendTone) return "allowed";
  const key = getBlendPairKey(mainTone, blendTone);
  if (BLOCK_BLEND_PAIRS.has(key)) return "blocked";
  if (WARN_BLEND_PAIRS.has(key)) return "warn";
  return "allowed";
}

export function serializeToneSelection(mainTone, blendTone = null) {
  if (!blendTone) return mainTone || null;
  return `${mainTone}${TONE_BLEND_DELIMITER}${blendTone}`;
}

export function parseToneSelection(value) {
  if (!value || typeof value !== "string" || !value.includes(TONE_BLEND_DELIMITER)) {
    return { tone: value || null, blendTone: null };
  }
  const [tone, blendTone] = value.split(TONE_BLEND_DELIMITER);
  return { tone: tone || null, blendTone: blendTone || null };
}

export function getUserTier(user, isPremium) {
  if (!user) return "guest";
  return isPremium ? "pro" : "free";
}

export function getCapForTier(userTier) {
  if (userTier === "pro") return PRO_DAILY_CAP;
  if (userTier === "free") return FREE_DAILY_CAP;
  return GUEST_DAILY_CAP;
}

export function getBookmarkLimitForTier(userTier) {
  return userTier === "pro" ? PRO_BOOKMARK_LIMIT : userTier === "free" ? FREE_BOOKMARK_LIMIT : 0;
}

export function getUnlockedTones(userTier) {
  if (userTier === "pro") return ALL_TONES;
  if (userTier === "free") return FREE_TONES;
  return GUEST_TONES;
}

export function getToneStatus(tone, userTier) {
  if (getUnlockedTones(userTier).includes(tone)) return "unlocked";
  if (FREE_TONES.includes(tone)) return "free_locked";
  return "pro_locked";
}

// ─── THEMES ──────────────────────────────────────────────────
export const THEMES = {
  dark: {
    bg:"#060606", phoneBg:"#0c0c0c", surface:"#161616", surface2:"#1e1e1e", surface3:"#121212",
    border:"#2a2a2a", border2:"#383838", borderLight:"#202020",
    text:"#f0ece0", textMuted:"#cac6ba", textDim:"#a7a39d", textFaint:"#97938c",
    accent:"#c8f0a0", accentText:"#0a1a00", accentDim:"#72a852",
    highlight:"#0c1c0c", highlightBorder:"#2a4a2a", highlightText:"#b8e090",
    highlight2:"#0a1810", highlightBorder2:"#1e3828", highlightText2:"#90c878",
    notch:"#181818", proTag:"#d4b040", freeTag:"#5a98e0",
    cOk:"#97938c", cWarn:"#d4b040", cCrit:"#c86060",
    inputBg:"#101010",
  },
  light: {
    bg:"#e4e0d6", phoneBg:"#f8f4ef", surface:"#eeeae0", surface2:"#e4e0d6", surface3:"#f2eee4",
    border:"#cac6ba", border2:"#aea8a0", borderLight:"#dedad0",
    text:"#1a180e", textMuted:"#3a3828", textDim:"#5a5848", textFaint:"#7a7868",
    accent:"#2a7020", accentText:"#f0ece0", accentDim:"#3a8a30",
    highlight:"#daeeda", highlightBorder:"#7ab87a", highlightText:"#1a401a",
    highlight2:"#e4f0e0", highlightBorder2:"#90c890", highlightText2:"#204020",
    notch:"#d8d4c8", proTag:"#d4b040", freeTag:"#1a5890",
    cOk:"#7a7868", cWarn:"#906010", cCrit:"#a83030",
    inputBg:"#f2ede4",
  },
};
