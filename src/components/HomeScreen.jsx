import { useState, useRef, useEffect } from "react";
import { ALL_TONES, THEMES, CHAR_LIMIT, DEFAULT_FROM_LANG, DEFAULT_TO_LANG, FREE_TONES, GUEST_TONES, getBookmarkLimitForTier, getCapForTier, AUTO_DETECT_LANGUAGE } from "../lib/constants.js";
import { BottomNav, MicButton, RefineCounter } from "./UI.jsx";
import { LangSelector } from "./LangSelector.jsx";
import { ToneSheet } from "./ToneSheet.jsx";
import { ToneRow } from "./ToneRow.jsx";

const LS_FROM = "tonara_fromLang";
const LS_TO = "tonara_toLang";
const LS_BOOKMARKS = "tonara_bookmarks";
const LS_FROM_TOUCHED = "tonara_fromLang_touched";

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

export function HomeScreen({ navigate, userTier, theme, usageCount, onTranslate, savedTones = [], onToggleSavedTone, navContext = null }) {
  const t = THEMES[theme] || THEMES.dark;
  const bookmarkLimit = getBookmarkLimitForTier(userTier);

  // Load last-used languages from localStorage, fall back to defaults
  const [fromLang, setFromLang] = useState(() => {
    const stored = localStorage.getItem(LS_FROM);
    const touched = localStorage.getItem(LS_FROM_TOUCHED) === "true";
    if (!stored) return DEFAULT_FROM_LANG;
    if (!touched && stored === "English") return DEFAULT_FROM_LANG;
    return stored;
  });
  const [toLang, setToLang] = useState(() => localStorage.getItem(LS_TO) || DEFAULT_TO_LANG);
  const [bookmarked, setBookmarked] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_BOOKMARKS);
      return stored ? JSON.parse(stored) : [DEFAULT_TO_LANG];
    } catch { return [DEFAULT_TO_LANG]; }
  });

  const [mode, setMode] = useState("refine");
  const [tone, setTone] = useState(() => getDefaultHomeTone(userTier));
  const [toneCount, setToneCount] = useState(2);
  const [homeToneOrder, setHomeToneOrder] = useState(() => buildHomeToneOrder(userTier, savedTones));
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [openLang, setOpenLang] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const textareaRef = useRef(null);

  const isRefine = mode === "refine";
  const hasText = text.trim().length > 0;
  const cap = getCapForTier(userTier);
  const atLimit = isRefine && usageCount >= cap;

  // Persist language choices whenever they change
  useEffect(() => { localStorage.setItem(LS_FROM, fromLang); }, [fromLang]);
  useEffect(() => { localStorage.setItem(LS_TO, toLang); }, [toLang]);
  useEffect(() => { localStorage.setItem(LS_BOOKMARKS, JSON.stringify(bookmarked)); }, [bookmarked]);
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
  }, [navContext]);

  const toggleBM = lang => setBookmarked(prev =>
    lang === AUTO_DETECT_LANGUAGE ? prev :
    userTier === "guest" ? prev : prev.includes(lang) ? prev.filter(l => l !== lang)
    : prev.length < bookmarkLimit ? [...prev, lang] : prev
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
    setFromLang(nextLang);
  };

  const handleDictate = val => {
    if (val === "upgrade") { navigate("upgrade"); return; }
    setText(val.slice(0, CHAR_LIMIT));
  };

  const handleTranslate = () => {
    if (!hasText) return;
    onTranslate({ text, tone, toneCount, fromLang, toLang, mode });
  };

  const handleRowToneSelect = (selectedTone) => {
    setTone(selectedTone);
  };

  const handleSheetToneSelect = (selectedTone) => {
    setTone(selectedTone);
    setHomeToneOrder((prev) => [selectedTone, ...prev.filter((entry) => entry !== selectedTone)]);
  };

  const charsLeft = CHAR_LIMIT - text.length;
  const charsNearLimit = charsLeft <= 50;

  return (
    <div style={{
      padding: "12px 20px 8px", fontFamily: "'Lora',Georgia,serif",
      color: t.text, display: "flex", flexDirection: "column",
      height: "100%", boxSizing: "border-box", background: t.phoneBg,
    }}>
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
        title="Tones"
      />
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, marginTop: 4 }}>
        <span style={{ fontSize: 26, fontWeight: "bold", letterSpacing: "-0.5px" }}>tonara.</span>
        {userTier === "pro" ? (
          <button onClick={() => navigate("upgrade")} style={{ background: "transparent", border: `1px solid ${t.highlightBorder}`, borderRadius: 10, padding: "5px 11px", color: t.accent, fontSize: 11, cursor: "pointer", letterSpacing: "0.02em", fontFamily: "'Lora',Georgia,serif" }}>
            ✦ Pro
          </button>
        ) : userTier === "free" ? (
          <button onClick={() => navigate("upgrade")} style={{ background: t.accent, border: "none", borderRadius: 10, padding: "6px 12px", color: t.accentText, fontSize: 11, fontWeight: "bold", cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>
            Upgrade to Pro
          </button>
        ) : (
          <button onClick={() => navigate("signin_nav")} style={{ background: t.accent, border: "none", borderRadius: 10, padding: "6px 12px", color: t.accentText, fontSize: 11, fontWeight: "bold", cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>
            Create free account
          </button>
        )}
      </div>
      <div style={{ marginBottom: 8, minHeight: 14 }}>
        <RefineCounter usageCount={usageCount} userTier={userTier} theme={theme} />
      </div>

      {/* Language bar */}
      <div style={{ marginBottom: 11, position: "relative", zIndex: 300 }}>
        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, background: t.surface, borderRadius: 12 }}>
          <LangSelector label="FROM" value={fromLang} onChange={handleFromLangChange} bookmarked={bookmarked} onToggleBookmark={toggleBM} bookmarkLimit={bookmarkLimit} userTier={userTier} openId={openLang} setOpenId={setOpenLang} myId="from" navigate={navigate} theme={theme} />
          <button onClick={swapLanguages} style={{
            background: "transparent", border: "none",
            width: 28, height: 28,
            color: t.textFaint, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "transform 0.3s",
            transform: swapping ? "rotate(180deg)" : "rotate(0deg)",
          }}>⇄</button>
          <LangSelector label="TO" value={toLang} onChange={setToLang} bookmarked={bookmarked} onToggleBookmark={toggleBM} bookmarkLimit={bookmarkLimit} userTier={userTier} openId={openLang} setOpenId={setOpenLang} myId="to" navigate={navigate} theme={theme} />
        </div>
        {userTier !== "guest" && bookmarked.length > 0 && (
          <div style={{ padding: "4px 14px 0", display: "flex", justifyContent: "flex-end" }}>
            <span style={{ fontSize: 9, color: bookmarked.length >= bookmarkLimit ? t.proTag : t.textFaint, letterSpacing: "0.04em" }}>
              {bookmarked.length}/{bookmarkLimit} bookmarked
              {userTier === "free" && bookmarked.length >= bookmarkLimit && (
                <span style={{ color: t.proTag }}>
                  {" "}· <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("upgrade")}>Pro = 10</span>
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", marginBottom: 10, gap: 2, padding: "2px", background: t.surface, borderRadius: 10 }}>
        {[{ id: "refine", label: "Refine & Translate" }, { id: "quick", label: "Translate only" }].map(opt => (
          <button key={opt.id} onClick={() => setMode(opt.id)} style={{
            flex: 1, padding: "8px 4px", borderRadius: 8, border: "none",
            background: mode === opt.id ? t.surface2 : "transparent",
            color: mode === opt.id ? t.text : t.textFaint,
            fontSize: 11, fontFamily: "'Lora',Georgia,serif",
            cursor: "pointer", fontWeight: mode === opt.id ? "bold" : "normal",
            transition: "all 0.18s",
          }}>{opt.label}</button>
        ))}
      </div>

      {/* Tone row */}
      {isRefine && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 2 }}>
            <div style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.14em", textTransform: "uppercase" }}>Tone</div>
            <div style={{ fontSize: 9, color: t.textFaint, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>Pick how it should come across</div>
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
            {isRefine ? "Write it naturally" : "Write it naturally"}
          </span>
          <span style={{ fontSize: 10, color: charsNearLimit ? t.proTag : t.textFaint, letterSpacing: "0.04em", transition: "color 0.2s" }}>
            {charsLeft} left
          </span>
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value.slice(0, CHAR_LIMIT))}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 160)}
          placeholder={isRefine ? "Type your message naturally — tonara will help it sound right." : "Type your message and tonara will translate it."}
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
            }}>Paste</button>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <MicButton userTier={userTier} onDictate={handleDictate} theme={theme} />
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
          {userTier === "pro" ? `Daily limit reached (${cap}) — come back tomorrow` : `✦ Daily limit reached (${cap}) — Upgrade to Pro`}
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
          {mode === "refine" ? "Refine & translate" : "Translate only"}
        </button>
      )}

      <BottomNav active="home" navigate={navigate} theme={theme} userTier={userTier} />
    </div>
  );
}
