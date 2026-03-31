import { useState, useRef, useEffect } from "react";
import { THEMES, CHAR_LIMIT, DEFAULT_FROM_LANG, DEFAULT_TO_LANG, getBookmarkLimitForTier, getCapForTier } from "../lib/constants.js";
import { BottomNav, MicButton, RefineCounter } from "./UI.jsx";
import { LangSelector } from "./LangSelector.jsx";
import { ToneSheet } from "./ToneSheet.jsx";
import { ToneRow } from "./ToneRow.jsx";

const LS_FROM = "tonara_fromLang";
const LS_TO = "tonara_toLang";
const LS_BOOKMARKS = "tonara_bookmarks";

export function HomeScreen({ navigate, userTier, theme, usageCount, onTranslate }) {
  const t = THEMES[theme] || THEMES.dark;
  const bookmarkLimit = getBookmarkLimitForTier(userTier);

  // Load last-used languages from localStorage, fall back to defaults
  const [fromLang, setFromLang] = useState(() => localStorage.getItem(LS_FROM) || DEFAULT_FROM_LANG);
  const [toLang, setToLang] = useState(() => localStorage.getItem(LS_TO) || DEFAULT_TO_LANG);
  const [bookmarked, setBookmarked] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_BOOKMARKS);
      return stored ? JSON.parse(stored) : [DEFAULT_FROM_LANG, DEFAULT_TO_LANG];
    } catch { return [DEFAULT_FROM_LANG, DEFAULT_TO_LANG]; }
  });

  const [mode, setMode] = useState("refine");
  const [tone, setTone] = useState("Polite");
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [openLang, setOpenLang] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const textareaRef = useRef(null);

  const isRefine = mode === "refine";
  const hasText = text.trim().length > 0;
  const cap = getCapForTier(userTier);
  const atLimit = usageCount >= cap;

  // Persist language choices whenever they change
  useEffect(() => { localStorage.setItem(LS_FROM, fromLang); }, [fromLang]);
  useEffect(() => { localStorage.setItem(LS_TO, toLang); }, [toLang]);
  useEffect(() => { localStorage.setItem(LS_BOOKMARKS, JSON.stringify(bookmarked)); }, [bookmarked]);

  const toggleBM = lang => setBookmarked(prev =>
    userTier === "guest" ? prev : prev.includes(lang) ? prev.filter(l => l !== lang)
    : prev.length < bookmarkLimit ? [...prev, lang] : prev
  );

  const swapLanguages = () => {
    setSwapping(true);
    setFromLang(toLang);
    setToLang(fromLang);
    setTimeout(() => setSwapping(false), 300);
  };

  const handlePaste = async () => {
    try { const tx = await navigator.clipboard.readText(); setText(tx.slice(0, CHAR_LIMIT)); } catch {}
    textareaRef.current?.focus();
  };

  const handleDictate = val => {
    if (val === "upgrade") { navigate("upgrade"); return; }
    setText(val.slice(0, CHAR_LIMIT));
  };

  const handleTranslate = () => {
    if (!hasText) return;
    if (atLimit) { navigate(userTier === "guest" ? "cap" : "upgrade"); return; }
    onTranslate({ text, tone, fromLang, toLang, mode });
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
        favourites={[]}
        onSelectTone={setTone}
        navigate={navigate}
        theme={theme}
      />
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, marginTop: 4 }}>
        <span style={{ fontSize: 26, fontWeight: "bold", letterSpacing: "-0.5px" }}>tonara.</span>
        {userTier === "pro" ? (
          <button onClick={() => navigate("account")} style={{ background: "transparent", border: `1px solid ${t.highlightBorder}`, borderRadius: 10, padding: "5px 11px", color: t.accent, fontSize: 11, cursor: "pointer", letterSpacing: "0.02em", fontFamily: "'Lora',Georgia,serif" }}>
            ✦ Pro
          </button>
        ) : userTier === "free" ? (
          <button onClick={() => navigate("upgrade")} style={{ background: t.accent, border: "none", borderRadius: 10, padding: "6px 12px", color: t.accentText, fontSize: 11, fontWeight: "bold", cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>
            ✦ Go Pro
          </button>
        ) : (
          <button onClick={() => navigate("signin_nav")} style={{ background: t.accent, border: "none", borderRadius: 10, padding: "6px 12px", color: t.accentText, fontSize: 11, fontWeight: "bold", cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>
            Sign up free
          </button>
        )}
      </div>
      <div style={{ marginBottom: 8, minHeight: 14 }}>
        <RefineCounter usageCount={usageCount} userTier={userTier} theme={theme} />
      </div>

      {/* Language bar */}
      <div style={{ marginBottom: 11, position: "relative", zIndex: 300 }}>
        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, background: t.surface, borderRadius: 12 }}>
          <LangSelector label="FROM" value={fromLang} onChange={setFromLang} bookmarked={bookmarked} onToggleBookmark={toggleBM} bookmarkLimit={bookmarkLimit} userTier={userTier} openId={openLang} setOpenId={setOpenLang} myId="from" navigate={navigate} theme={theme} />
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
                  {" "}· <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("upgrade")}>Pro = 6</span>
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", marginBottom: 10, gap: 2, padding: "2px", background: t.surface, borderRadius: 10 }}>
        {[{ id: "refine", label: "Refine & Translate" }, { id: "quick", label: "Standard Translate" }].map(opt => (
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
          <div style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 2 }}>Tone</div>
          <ToneRow
            activeTone={tone} toneCount={1}
            onSelect={setTone} onSetLevel={() => {}}
            onOpenSheet={() => setSheetOpen(true)}
            userTier={userTier}
            favourites={[]}
            disabled={false}
            isHomeScreen={true}
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
            {isRefine ? "Say what you really mean" : "Translate directly, without tone refinement"}
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
          placeholder={isRefine ? "Type your message — we'll refine and translate it..." : "Type or paste text to translate..."}
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
        <button onClick={() => navigate("upgrade")} style={{
          width: "100%", padding: "15px",
          background: t.proTag, color: "#000",
          border: "none", borderRadius: 13,
          fontSize: 14, fontFamily: "'Lora',Georgia,serif",
          fontWeight: "bold", cursor: "pointer",
        }}>
          ✦ Daily limit reached ({cap}) — Go Pro for 500/day
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
          Translate
        </button>
      )}

      <BottomNav active="home" navigate={navigate} theme={theme} userTier={userTier} />
    </div>
  );
}
