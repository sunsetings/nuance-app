import { useState, useRef, useEffect } from "react";
import { ALL_LANGUAGES, ALL_TONES, PRO_LANGUAGES, THEMES, CHAR_LIMIT, DEFAULT_FROM_LANG, DEFAULT_TO_LANG, FREE_TONES, GUEST_TONES, getBookmarkLimitForTier, getCapForTier, AUTO_DETECT_LANGUAGE, getSpeechRecognitionLang, getCanonicalLanguageLabel, getLocalizedLanguageName } from "../lib/constants.js";
import { BottomNav, MicButton, RefineCounter } from "./UI.jsx";
import { LangSelector } from "./LangSelector.jsx";
import { ToneSheet } from "./ToneSheet.jsx";
import { ToneRow } from "./ToneRow.jsx";
import { createI18n, isRTLLocale } from "../lib/i18n.js";
import { track } from "../lib/analytics.js";

const LS_FROM = "tonara_fromLang";
const LS_TO = "tonara_toLang";
const LS_BOOKMARKS = "tonara_bookmarks";
const LS_FROM_TOUCHED = "tonara_fromLang_touched";
const LS_DICTATION_LANG = "tonara_dictationLang";

function buildHomeToneOrder(userTier, savedTones = []) {
  const next = [];
  const add = (tone) => {
    if (!tone || next.includes(tone)) return;
    next.push(tone);
  };

  if (userTier === "free") {
    FREE_TONES.forEach(add);
  } else if (userTier === "guest") {
    GUEST_TONES.forEach(add);
  } else {
    savedTones.forEach(add);
    ["Friendly", "Playful", "Poetic", "Gen A", "Flirty"].forEach(add);
  }

  ALL_TONES.forEach(add);
  return next;
}

function getDefaultHomeTone(userTier) {
  if (userTier === "free") return FREE_TONES[0];
  if (userTier === "guest") return GUEST_TONES[0];
  return "Friendly";
}

function getRecognitionLang(fromLang, locale) {
  const browserLocales = typeof navigator !== "undefined"
    ? [...new Set([...(navigator.languages || []), navigator.language].filter(Boolean))]
    : [];

  if (fromLang && fromLang !== AUTO_DETECT_LANGUAGE) {
    const canonical = getCanonicalLanguageLabel(fromLang, locale);
    const preferred = getSpeechRecognitionLang(canonical, "en-US");
    const preferredBase = preferred.split("-")[0].toLowerCase();

    for (const candidate of browserLocales) {
      const resolved = getSpeechRecognitionLang(candidate, "");
      if (resolved && resolved.split("-")[0].toLowerCase() === preferredBase) {
        return resolved;
      }
    }

    return preferred;
  }

  for (const candidate of browserLocales) {
    const resolved = getSpeechRecognitionLang(candidate, "");
    if (resolved) return resolved;
  }

  return getSpeechRecognitionLang(locale, "en-US");
}

function getDefaultDictationLanguage(locale) {
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem(LS_DICTATION_LANG) : "";
  const storedCanonical = getCanonicalLanguageLabel(stored, locale);
  if (storedCanonical && storedCanonical !== AUTO_DETECT_LANGUAGE) return storedCanonical;

  const browserLocales = typeof navigator !== "undefined"
    ? [...new Set([...(navigator.languages || []), navigator.language].filter(Boolean))]
    : [];
  const localeMap = {
    en: "English",
    ko: "Korean",
    ja: "Japanese",
    es: "Spanish",
    pt: "Portuguese",
    it: "Italian",
    ru: "Russian",
    ar: "Arabic",
    fr: "French",
    de: "German",
    vi: "Vietnamese",
    zh: "Chinese (Simplified)",
    nl: "Dutch",
    hi: "Hindi",
    id: "Indonesian",
    th: "Thai",
    tr: "Turkish",
    uk: "Ukrainian",
    pl: "Polish",
    sv: "Swedish",
    da: "Danish",
    nb: "Norwegian",
    no: "Norwegian",
    fi: "Finnish",
    cs: "Czech",
    el: "Greek",
    he: "Hebrew",
    ro: "Romanian",
    hu: "Hungarian",
    bn: "Bengali",
    ta: "Tamil",
    te: "Telugu",
    mr: "Marathi",
    gu: "Gujarati",
    pa: "Punjabi",
    ml: "Malayalam",
    kn: "Kannada",
    or: "Odia",
    si: "Sinhala",
    ne: "Nepali",
    ms: "Malay",
    fil: "Tagalog",
    tl: "Tagalog",
    ur: "Urdu",
  };

  for (const candidate of browserLocales) {
    const normalized = String(candidate).toLowerCase();
    if (normalized.startsWith("zh-tw") || normalized.startsWith("zh-hk") || normalized.startsWith("zh-hant")) {
      return "Chinese (Traditional)";
    }
    if (normalized.startsWith("zh")) {
      return "Chinese (Simplified)";
    }
    const label = localeMap[normalized.split("-")[0]];
    if (label) return label;
  }

  return "English";
}

export function HomeScreen({ navigate, userTier, theme, usageCount, onTranslate, savedTones = [], onToggleSavedTone, navContext = null }) {
  const t = THEMES[theme] || THEMES.dark;
  const copy = createI18n();
  const isRTL = isRTLLocale(copy.locale);
  const bookmarkLimit = getBookmarkLimitForTier(userTier);

  // Load last-used languages from localStorage, fall back to defaults
  const [fromLang, setFromLang] = useState(() => {
    const stored = localStorage.getItem(LS_FROM);
    const touched = localStorage.getItem(LS_FROM_TOUCHED) === "true";
    if (!stored) return DEFAULT_FROM_LANG;
    const normalized = getCanonicalLanguageLabel(stored, copy.locale);
    if (!touched && normalized === "English") return DEFAULT_FROM_LANG;
    return normalized;
  });
  const [toLang, setToLang] = useState(() => getCanonicalLanguageLabel(localStorage.getItem(LS_TO) || DEFAULT_TO_LANG, copy.locale));
  const [bookmarked, setBookmarked] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_BOOKMARKS);
      return stored ? JSON.parse(stored) : [DEFAULT_TO_LANG];
    } catch { return [DEFAULT_TO_LANG]; }
  });

  const [mode, setMode] = useState("refine");
  const [tone, setTone] = useState(() => getDefaultHomeTone(userTier));
  const [toneCount, setToneCount] = useState(1);
  const [homeToneOrder, setHomeToneOrder] = useState(() => buildHomeToneOrder(userTier, savedTones));
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [openLang, setOpenLang] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dictationSheetOpen, setDictationSheetOpen] = useState(false);
  const [dictationSearch, setDictationSearch] = useState("");
  const [dictationLang, setDictationLang] = useState(() => getDefaultDictationLanguage(copy.locale));
  const [listening, setListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  const isRefine = mode === "refine";
  const hasText = text.trim().length > 0;
  const cap = getCapForTier(userTier);
  const atLimit = isRefine && usageCount >= cap;

  // Persist language choices whenever they change
  useEffect(() => { localStorage.setItem(LS_FROM, fromLang); }, [fromLang]);
  useEffect(() => { localStorage.setItem(LS_TO, toLang); }, [toLang]);
  useEffect(() => { localStorage.setItem(LS_BOOKMARKS, JSON.stringify(bookmarked)); }, [bookmarked]);
  useEffect(() => { localStorage.setItem(LS_DICTATION_LANG, dictationLang); }, [dictationLang]);
  useEffect(() => {
    setHomeToneOrder((prev) => {
      const rebuilt = buildHomeToneOrder(userTier, savedTones);
      const next = [];
      const add = (entry) => {
        if (!entry || next.includes(entry)) return;
        next.push(entry);
      };

      prev.forEach(add);
      rebuilt.forEach(add);
      return next;
    });
  }, [userTier, savedTones]);
  useEffect(() => {
    const unlocked = userTier === "free" ? FREE_TONES : userTier === "guest" ? GUEST_TONES : ALL_TONES;
    if (!unlocked.includes(tone)) setTone(getDefaultHomeTone(userTier));
  }, [userTier, tone]);

  useEffect(() => {
    if (!navContext || typeof navContext !== "object") return;
    if (typeof navContext.prefillText === "string") {
      setText(navContext.prefillText.slice(0, CHAR_LIMIT));
    }
    if (navContext.mode === "refine" || navContext.mode === "quick") {
      setMode(navContext.mode);
    }
    if (typeof navContext.fromLang === "string" && navContext.fromLang) {
      localStorage.setItem(LS_FROM_TOUCHED, "true");
      setFromLang(getCanonicalLanguageLabel(navContext.fromLang, copy.locale));
    }
    if (typeof navContext.toLang === "string" && navContext.toLang) {
      setToLang(getCanonicalLanguageLabel(navContext.toLang, copy.locale));
    }
  }, [navContext]);
  useEffect(() => () => {
    try { recognitionRef.current?.stop?.(); } catch {}
    recognitionRef.current = null;
  }, []);

  const toggleBM = lang => setBookmarked(prev =>
    lang === AUTO_DETECT_LANGUAGE ? prev :
    userTier === "guest" ? prev : prev.includes(lang) ? (
      track("bookmark_removed", { language: lang, user_tier: userTier }),
      prev.filter(l => l !== lang)
    )
    : prev.length < bookmarkLimit ? (
      track("bookmark_added", { language: lang, user_tier: userTier }),
      [...prev, lang]
    ) : prev
  );

  const swapLanguages = () => {
    setSwapping(true);
    setFromLang(toLang);
    localStorage.setItem(LS_FROM_TOUCHED, "true");
    setToLang(fromLang === AUTO_DETECT_LANGUAGE ? "English" : fromLang);
    setTimeout(() => setSwapping(false), 300);
  };

  const handlePaste = async () => {
    try { const tx = await navigator.clipboard.readText(); setText(tx.slice(0, CHAR_LIMIT)); } catch {}
    textareaRef.current?.focus();
  };

  const handleFromLangChange = (nextLang) => {
    localStorage.setItem(LS_FROM_TOUCHED, "true");
    setFromLang(getCanonicalLanguageLabel(nextLang, copy.locale));
  };

  const handleDictate = val => {
    if (val === "upgrade") { navigate("upgrade"); return; }
    setText(val.slice(0, CHAR_LIMIT));
  };

  const startDictation = (lang) => {
    if (listening) return;
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    const recognitionLocale = getRecognitionLang(lang, copy.locale);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = recognitionLocale;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript || "";
      setListening(false);
      recognitionRef.current = null;
      if (transcript) handleDictate(transcript);
    };
    recognition.onerror = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.start();
  };

  const handleMicTap = () => {
    if (listening) {
      try { recognitionRef.current?.stop?.(); } catch {}
      track("dictation_stopped", { user_tier: userTier, source_language: fromLang, dictation_language: dictationLang });
      return;
    }
    if (fromLang !== AUTO_DETECT_LANGUAGE) {
      track("dictation_started", { user_tier: userTier, source_language: fromLang, dictation_language: fromLang, mode: "direct" });
      startDictation(fromLang);
      return;
    }
    setDictationLang((prev) => getCanonicalLanguageLabel(prev, copy.locale) || getDefaultDictationLanguage(copy.locale));
    setDictationSearch("");
    setDictationSheetOpen(true);
  };

  const handleUseDictationOnce = () => {
    const selected = getCanonicalLanguageLabel(dictationLang, copy.locale) || getDefaultDictationLanguage(copy.locale);
    if (PRO_LANGUAGES.includes(selected) && userTier !== "pro") {
      setDictationSheetOpen(false);
      navigate("upgrade");
      return;
    }
    setDictationLang(selected);
    setDictationSheetOpen(false);
    track("dictation_started", { user_tier: userTier, source_language: fromLang, dictation_language: selected, mode: "use_once" });
    startDictation(selected);
  };

  const handleSetDictationAsSource = () => {
    const selected = getCanonicalLanguageLabel(dictationLang, copy.locale) || getDefaultDictationLanguage(copy.locale);
    if (PRO_LANGUAGES.includes(selected) && userTier !== "pro") {
      setDictationSheetOpen(false);
      navigate("upgrade");
      return;
    }
    localStorage.setItem(LS_FROM_TOUCHED, "true");
    setFromLang(selected);
    setDictationLang(selected);
    setDictationSheetOpen(false);
    track("dictation_started", { user_tier: userTier, source_language: selected, dictation_language: selected, mode: "set_as_source" });
    startDictation(selected);
  };

  const handleTranslate = () => {
    if (!hasText) return;
    onTranslate({ text, tone, toneCount, fromLang, toLang, mode });
  };

  const handleRowToneSelect = (selectedTone) => {
    setTone(selectedTone);
    track("tone_selected", { tone: selectedTone, location: "home_row", user_tier: userTier });
  };

  const handleSheetToneSelect = (selectedTone) => {
    setTone(selectedTone);
    setHomeToneOrder((prev) => [selectedTone, ...prev.filter((entry) => entry !== selectedTone)]);
    track("tone_selected", { tone: selectedTone, location: "home_sheet", user_tier: userTier });
  };

  const charsLeft = CHAR_LIMIT - text.length;
  const charsNearLimit = charsLeft <= 50;
  const browserSuggestedDictation = getDefaultDictationLanguage(copy.locale);
  const supportedDictationLanguages = ALL_LANGUAGES
    .filter((lang) => getSpeechRecognitionLang(lang, "") !== "")
    .sort((a, b) => a.localeCompare(b));
  const availableDictationLanguages = [...new Set([
    browserSuggestedDictation,
    ...bookmarked,
    toLang,
    ...supportedDictationLanguages,
  ].filter((lang) => lang && lang !== AUTO_DETECT_LANGUAGE))]
    .map((lang) => getCanonicalLanguageLabel(lang, copy.locale))
    .filter((lang, index, arr) => lang && lang !== AUTO_DETECT_LANGUAGE && arr.indexOf(lang) === index);
  const filteredDictationLanguages = dictationSearch
    ? availableDictationLanguages.filter((lang) => {
        const needle = dictationSearch.toLowerCase();
        return (
          lang.toLowerCase().includes(needle) ||
          getLocalizedLanguageName(lang, copy.locale).toLowerCase().includes(needle)
        );
      })
    : availableDictationLanguages;
  const sortedDictationLanguages = [...filteredDictationLanguages].sort((a, b) => a.localeCompare(b));
  const freeDictationLanguages = filteredDictationLanguages
    .filter((lang) => !PRO_LANGUAGES.includes(lang))
    .sort((a, b) => a.localeCompare(b));
  const proDictationLanguages = filteredDictationLanguages
    .filter((lang) => PRO_LANGUAGES.includes(lang))
    .sort((a, b) => a.localeCompare(b));

  const renderDictationLanguageButton = (lang) => {
    const active = dictationLang === lang;
    const isProLanguage = PRO_LANGUAGES.includes(lang);
    const canUseLanguage = !isProLanguage || userTier === "pro";
    return (
      <button
        key={lang}
        onClick={() => {
          if (!canUseLanguage) {
            setDictationSheetOpen(false);
            navigate("upgrade");
            return;
          }
          setDictationLang(lang);
        }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 12px",
          borderRadius: 11,
          background: active ? t.highlight : "transparent",
          color: active ? t.highlightText : canUseLanguage ? t.text : t.textDim,
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          fontFamily: "'Lora',Georgia,serif",
          marginBottom: 2,
          opacity: canUseLanguage ? 1 : 0.78,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>{getLocalizedLanguageName(lang, copy.locale)}</span>
          {isProLanguage && (
            <span style={{ fontSize: 7, background: t.proTag, color: "#000", padding: "1px 4px", borderRadius: 3, fontWeight: "bold", letterSpacing: "0.04em" }}>
              {copy.t("langSelector.pro")}
            </span>
          )}
        </span>
        {active && canUseLanguage && <span style={{ fontSize: 12, color: t.accent }}>✓</span>}
      </button>
    );
  };

  return (
    <div style={{
      padding: "12px 20px 8px", fontFamily: "'Lora',Georgia,serif",
      color: t.text, display: "flex", flexDirection: "column",
      height: "100%", boxSizing: "border-box", background: t.phoneBg,
      direction: isRTL ? "rtl" : "ltr",
      position: "relative",
    }} dir={isRTL ? "rtl" : "ltr"}>
      {openLang && (
        <div
          onClick={() => setOpenLang(null)}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 250,
            background: "transparent",
          }}
        />
      )}
      <ToneSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        activeTone={tone}
        userTier={userTier}
        favourites={savedTones}
        onToggleFav={onToggleSavedTone}
        onSelectTone={handleSheetToneSelect}
        navigate={navigate}
        theme={theme}
        title={copy.t("results.tones")}
      />
      {dictationSheetOpen && (
        <div style={{ position: "absolute", inset: 0, zIndex: 650, display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={() => setDictationSheetOpen(false)}>
          <div style={{ background: "rgba(0,0,0,0.6)", position: "absolute", inset: 0 }} />
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", background: theme === "light" ? "#f6f2ea" : "#161616", borderRadius: "22px 22px 0 0", maxHeight: "76vh", display: "flex", flexDirection: "column", overflow: "hidden", direction: isRTL ? "rtl" : "ltr" }} dir={isRTL ? "rtl" : "ltr"}>
            <div style={{ padding: "14px 18px 0", flexShrink: 0 }}>
              <div style={{ width: 30, height: 3, background: t.border2, borderRadius: 2, margin: "0 auto 14px" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <button onClick={() => setDictationSheetOpen(false)} style={{ background: "none", border: "none", color: t.textDim, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: 0, fontFamily: "'Lora',Georgia,serif" }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{isRTL ? "→" : "←"}</span>
                  <span style={{ fontSize: 12, letterSpacing: "0.02em" }}>{copy.t("toneSheet.back")}</span>
                </button>
                <span style={{ fontSize: 15, fontWeight: "bold", color: t.text, letterSpacing: "-0.2px" }}>{copy.t("home.chooseDictationLanguage")}</span>
                <div style={{ width: 56 }} />
              </div>
              <div style={{ fontSize: 11, color: t.textDim, lineHeight: 1.5, marginBottom: 10 }}>
                {copy.t("home.dictationLanguageHelp")}
              </div>
              <input
                value={dictationSearch}
                onChange={(e) => setDictationSearch(e.target.value)}
                placeholder={copy.t("langSelector.searchLanguages")}
                style={{ width: "100%", background: t.surface2, border: "none", borderRadius: 10, padding: "9px 13px", color: t.text, fontSize: 13, outline: "none", marginBottom: 12, fontFamily: "'Lora',Georgia,serif" }}
              />
            </div>
            <div style={{ overflowY: "auto", padding: "2px 18px 18px", flex: 1 }}>
              {userTier === "pro" ? (
                sortedDictationLanguages.map(renderDictationLanguageButton)
              ) : (
                <>
                  {freeDictationLanguages.length > 0 && (
                    <div style={{ marginBottom: proDictationLanguages.length > 0 ? 8 : 0 }}>
                      <div style={{ padding: "6px 12px 4px", fontSize: 9, color: t.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {copy.t("langSelector.freeLanguages")}
                      </div>
                      {freeDictationLanguages.map(renderDictationLanguageButton)}
                    </div>
                  )}
                  {proDictationLanguages.length > 0 && (
                    <div>
                      {freeDictationLanguages.length > 0 && <div style={{ height: 1, background: t.borderLight, margin: "4px 0 8px" }} />}
                      <div style={{ padding: "6px 12px 4px", fontSize: 9, color: t.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {copy.t("langSelector.proLanguages")}
                      </div>
                      {proDictationLanguages.map(renderDictationLanguageButton)}
                    </div>
                  )}
                </>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "14px 18px 20px", borderTop: `1px solid ${t.borderLight}` }}>
              <button onClick={handleUseDictationOnce} style={{ padding: "12px 10px", borderRadius: 12, border: `1px solid ${t.border}`, background: "transparent", color: t.text, fontSize: 12.5, fontFamily: "'Lora',Georgia,serif", cursor: "pointer" }}>
                {copy.t("home.useOnce")}
              </button>
              <button onClick={handleSetDictationAsSource} style={{ padding: "12px 10px", borderRadius: 12, border: "none", background: t.accent, color: t.accentText, fontSize: 12.5, fontFamily: "'Lora',Georgia,serif", cursor: "pointer", fontWeight: "bold" }}>
                {copy.t("home.setAsSource")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, marginTop: 4 }}>
        <span style={{ fontSize: 26, fontWeight: "bold", letterSpacing: "-0.5px" }}>tonara.</span>
        {userTier === "pro" ? (
          <button onClick={() => navigate("upgrade")} style={{ background: "transparent", border: `1px solid ${t.highlightBorder}`, borderRadius: 10, padding: "5px 11px", color: t.accent, fontSize: 11, cursor: "pointer", letterSpacing: "0.02em", fontFamily: "'Lora',Georgia,serif" }}>
            ✦ {copy.t("home.pro")}
          </button>
        ) : userTier === "free" ? (
          <button onClick={() => navigate("upgrade")} style={{ background: t.accent, border: "none", borderRadius: 10, padding: "6px 12px", color: t.accentText, fontSize: 11, fontWeight: "bold", cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>
            {copy.t("home.upgradeToPro")}
          </button>
        ) : (
          <button onClick={() => navigate("signin_nav")} style={{ background: t.accent, border: "none", borderRadius: 10, padding: "6px 12px", color: t.accentText, fontSize: 11, fontWeight: "bold", cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>
            {copy.t("home.createFreeAccount")}
          </button>
        )}
      </div>
      <div style={{ marginBottom: 8, minHeight: 14 }}>
        <RefineCounter usageCount={usageCount} userTier={userTier} theme={theme} />
      </div>

      {/* Language bar */}
      <div style={{ marginBottom: 11, position: "relative", zIndex: 300 }}>
        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, background: t.surface, borderRadius: 12 }}>
          <LangSelector label={copy.t("home.from")} value={fromLang} onChange={handleFromLangChange} bookmarked={bookmarked} onToggleBookmark={toggleBM} bookmarkLimit={bookmarkLimit} userTier={userTier} openId={openLang} setOpenId={setOpenLang} myId="from" navigate={navigate} theme={theme} />
          <button onClick={swapLanguages} style={{
            background: "transparent", border: "none",
            width: 28, height: 28,
            color: t.textFaint, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "transform 0.3s",
            transform: swapping ? "rotate(180deg)" : "rotate(0deg)",
          }}>⇄</button>
          <LangSelector label={copy.t("home.to")} value={toLang} onChange={setToLang} bookmarked={bookmarked} onToggleBookmark={toggleBM} bookmarkLimit={bookmarkLimit} userTier={userTier} openId={openLang} setOpenId={setOpenLang} myId="to" navigate={navigate} theme={theme} />
        </div>
        {userTier !== "guest" && bookmarked.length > 0 && (
          <div style={{ padding: "4px 14px 0", display: "flex", justifyContent: "flex-end" }}>
            <span style={{ fontSize: 9, color: bookmarked.length >= bookmarkLimit ? t.proTag : t.textFaint, letterSpacing: "0.04em" }}>
              {copy.t("home.bookmarkedCount", { count: bookmarked.length, limit: bookmarkLimit })}
              {userTier === "free" && bookmarked.length >= bookmarkLimit && (
                <span style={{ color: t.proTag }}>
                  {" "}· <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("upgrade")}>{copy.t("home.proEquals10")}</span>
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", marginBottom: 10, gap: 2, padding: "2px", background: t.surface, borderRadius: 10 }}>
        {[{ id: "refine", label: copy.t("home.refineTranslateTab") }, { id: "quick", label: copy.t("home.translateOnlyTab") }].map(opt => (
          <button key={opt.id} onClick={() => setMode(opt.id)} style={{
            flex: 1, padding: "8px 6px", borderRadius: 8, border: "none",
            background: mode === opt.id ? t.surface2 : "transparent",
            color: mode === opt.id ? t.text : t.textFaint,
            fontSize: 10.5, fontFamily: "'Lora',Georgia,serif",
            cursor: "pointer", fontWeight: mode === opt.id ? "bold" : "normal",
            transition: "all 0.18s",
            lineHeight: 1.15,
            minHeight: 36,
          }}>{opt.label}</button>
        ))}
      </div>

      {/* Tone row */}
      {isRefine && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 2 }}>
            <div style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.14em", textTransform: "uppercase" }}>{copy.t("home.tone")}</div>
            <div style={{ fontSize: 9, color: t.textFaint, letterSpacing: "0.04em", textAlign: isRTL ? "left" : "right", lineHeight: 1.2, maxWidth: "46%" }}>{copy.t("home.pickHow")}</div>
          </div>
          <ToneRow
            activeTone={tone} toneCount={toneCount}
            onSelect={handleRowToneSelect} onSetLevel={setToneCount}
            onOpenSheet={() => setSheetOpen(true)}
            userTier={userTier}
            favourites={savedTones}
            recentTones={[]}
            priorityTonesOverride={homeToneOrder}
            disabled={false}
            isHomeScreen={true}
            showStrengthControl={true}
            navigate={navigate}
            theme={theme}
          />
        </div>
      )}

      {/* Text input */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        background: theme === "light" ? "#f2eee4" : "#151515",
        borderRadius: 14,
        transition: "border-color 0.2s", marginBottom: 10, minHeight: 0,
        boxShadow: theme === "dark" ? "0 0 0 1px #1e1e1e" : "0 0 0 1px #d4d0c4",
      }}>
        <div style={{ padding: "13px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${theme === "light" ? "#d0ccbf" : "#232323"}` }}>
          <span style={{ fontSize: 10, color: t.textFaint, fontStyle: "italic", letterSpacing: "0.03em" }}>
            {copy.t("home.writeNaturally")}
          </span>
          <span style={{ fontSize: 10, color: charsNearLimit ? t.proTag : t.textFaint, letterSpacing: "0.04em", transition: "color 0.2s" }}>
            {copy.t("home.left", { count: charsLeft })}
          </span>
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value.slice(0, CHAR_LIMIT))}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 160)}
          placeholder={isRefine ? copy.t("home.refinePlaceholder") : copy.t("home.quickPlaceholder")}
          style={{
            flex: 1, background: "transparent", border: "none",
            padding: "12px 16px", color: t.text, fontSize: 13,
            fontFamily: "'Lora',Georgia,serif", resize: "none",
            lineHeight: 1.7, outline: "none", minHeight: 70,
          }}
        />
        <div style={{
          display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center",
          padding: "8px 14px 10px", borderTop: `1px solid ${theme === "light" ? "#d0ccbf" : "#232323"}`, gap: 8,
        }}>
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <button onClick={handlePaste} style={{
              background: "transparent",
              border: "none",
              padding: 0,
              color: t.textFaint,
              fontSize: 11, fontFamily: "'Lora',Georgia,serif",
              cursor: "pointer", transition: "all 0.2s",
              letterSpacing: "0.04em",
            }}>{copy.t("home.paste")}</button>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <MicButton theme={theme} listening={listening} onTap={handleMicTap} />
          </div>
          <div />
        </div>
      </div>

      {/* CTA */}
      {atLimit ? (
        <button onClick={() => navigate("cap")} style={{
          width: "100%", padding: "15px",
          background: userTier === "pro" ? t.surface : t.proTag, color: userTier === "pro" ? t.textMuted : "#000",
          border: userTier === "pro" ? `1px solid ${t.border}` : "none",
          borderRadius: 13,
          fontSize: 14, fontFamily: "'Lora',Georgia,serif",
          fontWeight: "bold", cursor: "pointer",
        }}>
          {userTier === "pro" ? copy.t("home.dailyLimitPro", { cap }) : copy.t("home.dailyLimitUpgrade", { cap })}
        </button>
      ) : (
        <button onClick={handleTranslate} disabled={!hasText} style={{
          width: "100%", padding: "14px",
          background: hasText ? t.accent : t.surface,
          color: hasText ? t.accentText : t.textFaint,
          border: "none",
          borderRadius: 12, fontSize: 14,
          fontFamily: "'Lora',Georgia,serif",
          fontWeight: "bold", cursor: hasText ? "pointer" : "default",
          transition: "all 0.2s",
          letterSpacing: "-0.1px",
        }}>
          {mode === "refine" ? copy.t("home.refineTranslateButton") : copy.t("home.translateOnlyButton")}
        </button>
      )}

      <BottomNav active="home" navigate={navigate} theme={theme} userTier={userTier} />
    </div>
  );
}
