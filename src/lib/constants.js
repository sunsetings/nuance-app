// ─── PLAN LIMITS ─────────────────────────────────────────────
export const GUEST_TONES = ["Friendly", "Playful"];
export const FREE_TONES = ["Friendly", "Playful", "Poetic", "Gen A", "Flirty"];
export const PRO_TONES = [
  "Polite", "Casual", "Sincere", "Succinct", "Assertive", "Diplomatic",
  "Empathetic", "Apologetic", "Warm", "Enthusiastic", "Urgent",
  "Shakespearean", "Professional", "Motivational", "Humble",
  "Anger", "Royal", "Luxury", "Chaotic", "Sarcastic", "Savage",
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

export const LANGUAGE_CODE_MAP = {
  [AUTO_DETECT_LANGUAGE]: "",
  Arabic: "AR",
  Dutch: "NL",
  English: "EN",
  French: "FR",
  German: "DE",
  Italian: "IT",
  Japanese: "JA",
  Korean: "KO",
  "Chinese (Simplified)": "ZH-CN",
  "Chinese (Traditional)": "ZH-TW",
  Portuguese: "PT",
  Russian: "RU",
  Spanish: "ES",
  Vietnamese: "VI",
  Amharic: "AM",
  Azerbaijani: "AZ",
  Bengali: "BN",
  Burmese: "MY",
  Catalan: "CA",
  Croatian: "HR",
  Czech: "CS",
  Danish: "DA",
  Finnish: "FI",
  Georgian: "KA",
  Greek: "EL",
  Gujarati: "GU",
  "Haitian Creole": "HT",
  Hausa: "HA",
  Hebrew: "HE",
  Hindi: "HI",
  Hungarian: "HU",
  Indonesian: "ID",
  Kazakh: "KK",
  Khmer: "KM",
  Kurdish: "KU",
  Malay: "MS",
  Marathi: "MR",
  Mongolian: "MN",
  Nepali: "NE",
  Norwegian: "NO",
  Persian: "FA",
  Polish: "PL",
  Punjabi: "PA",
  Romanian: "RO",
  Serbian: "SR",
  Sinhala: "SI",
  Slovak: "SK",
  Swahili: "SW",
  Swedish: "SV",
  Tagalog: "TL",
  Tamil: "TA",
  Telugu: "TE",
  Thai: "TH",
  Turkish: "TR",
  Ukrainian: "UK",
  Urdu: "UR",
  Uzbek: "UZ",
  Yoruba: "YO",
  Zulu: "ZU",
  Bulgarian: "BG",
  Albanian: "SQ",
  Armenian: "HY",
  Belarusian: "BE",
  Bosnian: "BS",
  Estonian: "ET",
  Icelandic: "IS",
  Irish: "GA",
  Latvian: "LV",
  Lithuanian: "LT",
  Macedonian: "MK",
  Maltese: "MT",
  Slovenian: "SL",
  Assamese: "AS",
  Kannada: "KN",
  Malayalam: "ML",
  Odia: "OR",
  Pashto: "PS",
  Syriac: "SYC",
  Tibetan: "BO",
  Uyghur: "UG",
  Lao: "LO",
  Javanese: "JV",
  Sundanese: "SU",
  Malagasy: "MG",
  Somali: "SO",
  Xhosa: "XH",
  Igbo: "IG",
  Oromo: "OM",
  Luganda: "LG",
  Shona: "SN",
  Sesotho: "ST",
  Kinyarwanda: "RW",
  Wolof: "WO",
  Fula: "FF",
  Aymara: "AY",
  Guarani: "GN",
  Quechua: "QU",
  Maori: "MI",
  Samoan: "SM",
  Tongan: "TO",
};

const LANGUAGE_DISPLAY_OVERRIDES = {
  ko: {
    [AUTO_DETECT_LANGUAGE]: "언어 감지",
    "Chinese (Simplified)": "중국어(간체)",
    "Chinese (Traditional)": "중국어(번체)",
    "Haitian Creole": "아이티 크리올어",
  },
  ja: {
    [AUTO_DETECT_LANGUAGE]: "言語を検出",
    "Chinese (Simplified)": "中国語（簡体字）",
    "Chinese (Traditional)": "中国語（繁体字）",
    "Haitian Creole": "ハイチ・クレオール語",
  },
  es: {
    [AUTO_DETECT_LANGUAGE]: "Detectar idioma",
    "Chinese (Simplified)": "Chino (simplificado)",
    "Chinese (Traditional)": "Chino (tradicional)",
    "Haitian Creole": "Criollo haitiano",
  },
};

const TONE_NAME_TRANSLATIONS = {
  ko: {
    Friendly: "친근하게",
    Playful: "장난스럽게",
    Poetic: "시적으로",
    "Gen A": "Gen A",
    Flirty: "플러티하게",
    Polite: "정중하게",
    Casual: "캐주얼하게",
    Sincere: "진심 있게",
    Succinct: "간결하게",
    Assertive: "단호하게",
    Diplomatic: "외교적으로",
    Empathetic: "공감 있게",
    Apologetic: "미안하게",
    Warm: "따뜻하게",
    Enthusiastic: "열정적으로",
    Urgent: "긴급하게",
    Shakespearean: "셰익스피어풍",
    Professional: "프로답게",
    Motivational: "동기부여 있게",
    Humble: "겸손하게",
    Anger: "분노하게",
    Royal: "왕실풍",
    Luxury: "럭셔리하게",
    Chaotic: "혼돈스럽게",
    Sarcastic: "비꼬듯이",
    Savage: "독하게",
    Overexplaining: "과하게 설명하며",
    "Dad Joke": "아재개그처럼",
    Rapper: "래퍼처럼",
    Tea: "수다스럽게",
    Noir: "누아르풍",
  },
  ja: {
    Friendly: "フレンドリー",
    Playful: "遊び心",
    Poetic: "詩的",
    "Gen A": "Gen A",
    Flirty: "フラーティー",
    Polite: "丁寧",
    Casual: "カジュアル",
    Sincere: "誠実",
    Succinct: "簡潔",
    Assertive: "はっきり",
    Diplomatic: "外交的",
    Empathetic: "共感的",
    Apologetic: "申し訳なさげ",
    Warm: "あたたかい",
    Enthusiastic: "熱量高め",
    Urgent: "緊急",
    Shakespearean: "シェイクスピア風",
    Professional: "プロフェッショナル",
    Motivational: "やる気を出す",
    Humble: "控えめ",
    Anger: "怒り",
    Royal: "ロイヤル",
    Luxury: "ラグジュアリー",
    Chaotic: "カオス",
    Sarcastic: "皮肉",
    Savage: "辛辣",
    Overexplaining: "説明しすぎ",
    "Dad Joke": "ダジャレ親父",
    Rapper: "ラッパー風",
    Tea: "ゴシップ調",
    Noir: "ノワール",
  },
  es: {
    Friendly: "Amable",
    Playful: "Juguetón",
    Poetic: "Poético",
    "Gen A": "Gen A",
    Flirty: "Coqueto",
    Polite: "Cortés",
    Casual: "Casual",
    Sincere: "Sincero",
    Succinct: "Breve",
    Assertive: "Directo",
    Diplomatic: "Diplomático",
    Empathetic: "Empático",
    Apologetic: "Disculpándose",
    Warm: "Cálido",
    Enthusiastic: "Entusiasta",
    Urgent: "Urgente",
    Shakespearean: "Shakespeariano",
    Professional: "Profesional",
    Motivational: "Motivador",
    Humble: "Humilde",
    Anger: "Enojado",
    Royal: "Real",
    Luxury: "Lujo",
    Chaotic: "Caótico",
    Sarcastic: "Sarcástico",
    Savage: "Salvaje",
    Overexplaining: "Explica de más",
    "Dad Joke": "Chiste de papá",
    Rapper: "Rappero",
    Tea: "Chismoso",
    Noir: "Noir",
  },
};

const TONE_CATEGORY_TRANSLATIONS = {
  ko: {
    Everyday: "일상",
    Polished: "세련됨",
    Heartfelt: "진심",
    Intense: "강렬함",
    Stylized: "스타일",
    Character: "캐릭터",
  },
  ja: {
    Everyday: "日常",
    Polished: "洗練",
    Heartfelt: "気持ち重視",
    Intense: "強め",
    Stylized: "スタイル",
    Character: "キャラ",
  },
  es: {
    Everyday: "Cotidiano",
    Polished: "Pulido",
    Heartfelt: "Sentido",
    Intense: "Intenso",
    Stylized: "Con estilo",
    Character: "Personaje",
  },
};

const TONE_DESCRIPTION_TRANSLATIONS = {
  ko: {
    Polite: "존중하고 배려하는 톤",
    Casual: "편안하고 일상적인 톤",
    "Gen A": "요즘 인터넷 감성의 톤",
    Playful: "가볍고 재치 있는 톤",
    Friendly: "따뜻하고 다가가기 쉬운 톤",
    Sincere: "진솔하고 진심 어린 톤",
    Warm: "부드럽고 안심되는 다정한 톤",
    Succinct: "아주 짧고 군더더기 없는 톤",
    Assertive: "단호하고 분명한 톤",
    Diplomatic: "신중하고 균형 잡힌 톤",
    Empathetic: "이해심 있고 배려하는 톤",
    Apologetic: "미안함이 드러나는 부드러운 톤",
    Enthusiastic: "에너지 넘치고 신나는 톤",
    Urgent: "즉각적이고 다급한 톤",
    Shakespearean: "극적이고 셰익스피어풍인 톤",
    Professional: "깔끔하고 업무에 안전한 톤",
    Motivational: "힘을 실어주고 북돋는 톤",
    Humble: "겸손하고 공손한 톤",
    Anger: "날카롭고 화가 난 톤",
    Royal: "품위 있고 고급스러운 톤",
    Luxury: "고급스럽고 하이엔드한 톤",
    Chaotic: "매우 정신없고 거친 톤",
    Sarcastic: "건조하고 비꼬는 톤",
    Savage: "날카롭고 잔인할 만큼 센 톤",
    Overexplaining: "불필요할 정도로 자세한 톤",
    "Dad Joke": "말장난이 많은 아재개그 톤",
    Poetic: "서정적이고 표현적인 톤",
    Rapper: "리듬감 있고 라임이 느껴지는 톤",
    Flirty: "대담하게 장난스럽고 로맨틱한 톤",
    Tea: "유난히 수다스럽고 가십 같은 톤",
    Noir: "어둡고 미스터리한 톤",
  },
  ja: {
    Polite: "敬意があり思いやりのあるトーン",
    Casual: "気楽で日常的なトーン",
    "Gen A": "今っぽいネット感のあるトーン",
    Playful: "軽くてウィットのあるトーン",
    Friendly: "やさしく親しみやすいトーン",
    Sincere: "本気でまっすぐなトーン",
    Warm: "やわらかく安心感のあるトーン",
    Succinct: "かなり短く削ぎ落としたトーン",
    Assertive: "はっきりしていて迷いのないトーン",
    Diplomatic: "配慮がありバランスの取れたトーン",
    Empathetic: "理解があり寄り添うトーン",
    Apologetic: "申し訳なさが伝わるやわらかいトーン",
    Enthusiastic: "かなり元気で盛り上がったトーン",
    Urgent: "急ぎで見過ごしにくいトーン",
    Shakespearean: "芝居がかっていてシェイクスピア風のトーン",
    Professional: "きれいで仕事向きのトーン",
    Motivational: "前向きで背中を押すトーン",
    Humble: "控えめで礼儀正しいトーン",
    Anger: "鋭く怒りがにじむトーン",
    Royal: "高貴で気品のあるトーン",
    Luxury: "上質でラグジュアリーなトーン",
    Chaotic: "かなり暴走気味で予測不能なトーン",
    Sarcastic: "乾いていて皮肉の効いたトーン",
    Savage: "鋭く容赦ないトーン",
    Overexplaining: "必要以上に細かいトーン",
    "Dad Joke": "だじゃれ多めの親父ギャグ調トーン",
    Poetic: "叙情的で表現豊かなトーン",
    Rapper: "リズム感があり韻を踏むトーン",
    Flirty: "大胆でからかうようなロマンチックなトーン",
    Tea: "かなりおしゃべりでゴシップっぽいトーン",
    Noir: "ムーディーでミステリアスなトーン",
  },
  es: {
    Polite: "Respetuoso y considerado",
    Casual: "Relajado y cotidiano",
    "Gen A": "Tono actual y de internet",
    Playful: "Ligero e ingenioso",
    Friendly: "Cálido y cercano",
    Sincere: "Genuino y de corazón",
    Warm: "Suave, reconfortante y afectuoso",
    Succinct: "Muy breve y reducido al mínimo",
    Assertive: "Claro, firme y directo",
    Diplomatic: "Cuidadoso y equilibrado",
    Empathetic: "Comprensivo y atento",
    Apologetic: "Arrepentido y suave",
    Enthusiastic: "Muy energético, emocionado y expresivo",
    Urgent: "Inmediato y difícil de ignorar",
    Shakespearean: "Teatral y shakespeariano",
    Professional: "Limpio y adecuado para trabajo",
    Motivational: "Animado y muy alentador",
    Humble: "Modesto y respetuoso",
    Anger: "Cortante, intenso y claramente molesto",
    Royal: "Regio y elevado",
    Luxury: "Elegante y de alto nivel",
    Chaotic: "Muy descontrolado, errático y salvaje",
    Sarcastic: "Seco, mordaz y claramente sarcástico",
    Savage: "Filoso, despiadado y brutal",
    Overexplaining: "Demasiado detallado",
    "Dad Joke": "Muy cursi, lleno de juegos de palabras e inocente",
    Poetic: "Lírico y expresivo",
    Rapper: "Rítmico, potente y con rima",
    Flirty: "Juguetón, atrevido y romántico",
    Tea: "Muy conversador, jugoso y chismoso",
    Noir: "Oscuro y misterioso",
  },
};

export function getLanguageCode(label) {
  const value = String(label || "").trim();
  if (!value) return "";
  if (LANGUAGE_CODE_MAP[value]) return LANGUAGE_CODE_MAP[value];
  const normalized = value.toLowerCase();
  const matched = Object.entries(LANGUAGE_CODE_MAP).find(([name]) => name.toLowerCase() === normalized);
  if (matched) return matched[1];
  if (/detect|auto/i.test(value)) return "";
  return value.slice(0, 2).toUpperCase();
}

export function getLocalizedLanguageName(label, locale = "en") {
  const resolvedLocale = String(locale || "en").toLowerCase().slice(0, 2);
  const overrides = LANGUAGE_DISPLAY_OVERRIDES[resolvedLocale];
  if (overrides?.[label]) return overrides[label];
  if (!label || resolvedLocale === "en") return label;

  const rawCode = LANGUAGE_CODE_MAP[label];
  if (!rawCode) return label;

  const normalizedCode = rawCode.toLowerCase();
  try {
    const display = new Intl.DisplayNames([resolvedLocale], { type: "language" });
    const localized = display.of(normalizedCode);
    return localized || label;
  } catch {
    return label;
  }
}

export function getLocalizedToneName(tone, locale = "en") {
  const resolvedLocale = String(locale || "en").toLowerCase().slice(0, 2);
  return TONE_NAME_TRANSLATIONS[resolvedLocale]?.[tone] || tone;
}

export function getLocalizedToneCategory(label, locale = "en") {
  const resolvedLocale = String(locale || "en").toLowerCase().slice(0, 2);
  return TONE_CATEGORY_TRANSLATIONS[resolvedLocale]?.[label] || label;
}

export function getLocalizedToneDescription(tone, locale = "en") {
  const resolvedLocale = String(locale || "en").toLowerCase().slice(0, 2);
  return TONE_DESCRIPTION_TRANSLATIONS[resolvedLocale]?.[tone] || TONE_DESCRIPTIONS[tone] || "";
}

export const TONE_CATEGORIES = [
  { label: "Everyday", tones: ["Friendly", "Playful", "Casual", "Gen A", "Flirty"] },
  { label: "Polished", tones: ["Polite", "Professional", "Diplomatic", "Succinct", "Assertive", "Luxury"] },
  { label: "Heartfelt", tones: ["Empathetic", "Sincere", "Warm", "Apologetic", "Humble", "Motivational"] },
  { label: "Intense", tones: ["Urgent", "Anger", "Savage", "Noir"] },
  { label: "Stylized", tones: ["Poetic", "Rapper", "Shakespearean", "Royal", "Sarcastic"] },
  { label: "Character", tones: ["Chaotic", "Tea", "Overexplaining", "Dad Joke", "Enthusiastic"] },
];

export const TONE_DESCRIPTIONS = {
  Polite: "Respectful and considerate",
  Casual: "Relaxed and everyday",
  "Gen A": "Current, internet-native tone",
  Playful: "Light and witty",
  Friendly: "Warm and approachable",
  Sincere: "Genuine and heartfelt",
  Warm: "Gentle, reassuring, and emotionally soft",
  Succinct: "Extremely brief and stripped down",
  Assertive: "Blunt, firm, and unmistakably direct",
  Diplomatic: "Tactful and balanced",
  Empathetic: "Understanding and caring",
  Apologetic: "Remorseful and soft",
  Enthusiastic: "Very energetic, excited, and animated",
  Urgent: "Immediate, pressing, and hard to ignore",
  Shakespearean: "Theatrical and Bard-like",
  Professional: "Clean and corporate-safe",
  Motivational: "Hyped, uplifting, and strongly encouraging",
  Humble: "Deferential and respectful",
  Anger: "Sharp, heated, and openly pissed off",
  Royal: "Regal and elevated",
  Luxury: "Elevated and high-end",
  Chaotic: "Extremely unhinged, erratic, and wild",
  Sarcastic: "Dry, cutting, and clearly sarcastic",
  Savage: "Sharp, ruthless, and extra brutal",
  Overexplaining: "Needlessly detailed",
  "Dad Joke": "Maximum cornball, pun-heavy, and harmless",
  Poetic: "Lyrical and expressive",
  Rapper: "Rhythmic, punchy, and rhyme-forward",
  Flirty: "Boldly playful, teasing, and romantic",
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
  getBlendPairKey("Savage", "Dad Joke"),
  getBlendPairKey("Apologetic", "Dad Joke"),
  getBlendPairKey("Noir", "Dad Joke"),
  getBlendPairKey("Sarcastic", "Humble"),
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
