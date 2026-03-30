import { useState, useRef } from "react";
import { THEMES, FREE_BOOKMARK_LIMIT, PRO_BOOKMARK_LIMIT, CHAR_LIMIT, FREE_DAILY_CAP } from "../lib/constants.js";
import { BottomNav, MicButton, RefineCounter } from "./UI.jsx";
import { LangSelector } from "./LangSelector.jsx";
import { ToneRow } from "./ToneRow.jsx";

export function HomeScreen({ navigate, isPremium, theme, usageCount, onTranslate }) {
  const t = THEMES[theme] || THEMES.dark;
  const bookmarkLimit = isPremium ? PRO_BOOKMARK_LIMIT : FREE_BOOKMARK_LIMIT;

  const [mode, setMode] = useState("refine");
  const [fromLang, setFromLang] = useState("English");
  const [toLang, setToLang] = useState("Korean");
  const [bookmarked, setBookmarked] = useState(["English","Korean"]);
  const [tone, setTone] = useState("Polite");
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const textareaRef = useRef(null);

  const isRefine = mode === "refine";
  const hasText = text.trim().length > 0;
  const atLimit = !isPremium && usageCount >= FREE_DAILY_CAP;

  const toggleBM = lang => setBookmarked(prev =>
    prev.includes(lang) ? prev.filter(l => l !== lang)
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
    if (atLimit) { navigate("upgrade"); return; }
    onTranslate({ text, tone, fromLang, toLang, mode });
  };

  const charsLeft = CHAR_LIMIT - text.length;
  const charsNearLimit = charsLeft <= 50;

  return (
    <div style={{
      padding: "14px 20px 8px", fontFamily: "'Lora',Georgia,serif",
      color: t.text, display: "flex", flexDirection: "column",
      height: "100%", boxSizing: "border-box", background: t.phoneBg,
    }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13, marginTop: 6 }}>
        <span style={{ fontSize: 20, fontWeight: "bold", letterSpacing: "-0.5px" }}>tonara.</span>
        <RefineCounter isPremium={isPremium} usageCount={usageCount} navigate={navigate} theme={theme} />
      </div>

      {/* Language bar */}
      <div style={{ background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 12, marginBottom: 11, position: "relative", zIndex: 300 }}>
        <div style={{ padding: "9px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <LangSelector label="FROM" value={fromLang} onChange={setFromLang} bookmarked={bookmarked} onToggleBookmark={toggleBM} bookmarkLimit={bookmarkLimit} theme={theme} />
          <button onClick={swapLanguages} style={{
            background: "transparent", border: `1px solid ${t.border2}`,
            borderRadius: "50%", width: 30, height: 30,
            color: t.accent, fontSize: 15, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "transform 0.3s",
            transform: swapping ? "rotate(180deg)" : "rotate(0deg)",
          }}>⇄</button>
          <LangSelector label="TO" value={toLang} onChange={setToLang} bookmarked={bookmarked} onToggleBookmark={toggleBM} bookmarkLimit={bookmarkLimit} theme={theme} />
        </div>
        <div style={{ padding: "0 14px 8px", display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 9, color: bookmarked.length >= bookmarkLimit ? t.proTag : t.textFaint }}>
            ♥ {bookmarked.length}/{bookmarkLimit} bookmarks
            {!isPremium && bookmarked.length >= bookmarkLimit && (
              <span style={{ color: t.proTag }}>
                {" "}— <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("upgrade")}>Pro = 6</span>
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", background: t.surface, border: `1px solid ${t.border}`, borderRadius: 11, padding: 3, marginBottom: 11, gap: 3 }}>
        {[{ id: "refine", label: "Refine & Translate" }, { id: "quick", label: "Quick Translate" }].map(opt => (
          <button key={opt.id} onClick={() => setMode(opt.id)} style={{
            flex: 1, padding: "9px 6px", borderRadius: 8, border: "none",
            background: mode === opt.id ? t.surface2 : "transparent",
            color: mode === opt.id ? t.text : t.textDim,
            fontSize: 12, fontFamily: "'Lora',Georgia,serif",
            cursor: "pointer", fontWeight: mode === opt.id ? "bold" : "normal",
            transition: "all 0.18s",
            borderBottom: mode === opt.id && opt.id === "refine" ? `1.5px solid ${t.accent}` : "none",
          }}>{opt.label}</button>
        ))}
      </div>

      {/* Tone row */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.12em", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
          TONE
          {!isRefine
            ? <span style={{ fontSize: 9, color: t.textDim, fontStyle: "italic" }}>— not used in Quick Translate</span>
            : !isPremium && <span style={{ fontSize: 9, color: t.textDim }}>3 free · <span style={{ color: t.proTag }}>Pro</span> unlocks 13</span>
          }
        </div>
        <ToneRow
          activeTone={tone} toneCount={1}
          onSelect={setTone} onSetLevel={() => {}}
          isPremium={isPremium} disabled={!isRefine}
          isHomeScreen={true} theme={theme}
        />
      </div>

      {/* Text input */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        background: t.surface,
        border: `1px solid ${focused ? t.border2 : t.border}`,
        borderRadius: 12, overflow: "hidden",
        transition: "border-color 0.2s", marginBottom: 10, minHeight: 0,
      }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value.slice(0, CHAR_LIMIT))}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 160)}
          placeholder={isRefine ? "Type your message — we'll refine and translate it..." : "Type or paste text to translate..."}
          style={{
            flex: 1, background: "transparent", border: "none",
            padding: "12px 14px", color: t.text, fontSize: 13,
            fontFamily: "'Lora',Georgia,serif", resize: "none",
            lineHeight: 1.65, outline: "none", minHeight: 80,
          }}
        />
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "6px 12px 4px", borderTop: `1px solid ${t.border}`, gap: 8,
        }}>
          <button onClick={handlePaste} style={{
            display: "flex", alignItems: "center", gap: 5,
            background: focused ? t.surface2 : "transparent",
            border: `1px solid ${focused ? t.border2 : t.border}`,
            borderRadius: 7, padding: "4px 10px",
            color: focused ? t.textMuted : t.textDim,
            fontSize: 11, fontFamily: "'Lora',Georgia,serif",
            cursor: "pointer", transition: "all 0.2s",
          }}>⎘ Paste</button>
          <MicButton isPremium={isPremium} onDictate={handleDictate} theme={theme} />
          <span style={{
            fontSize: 10,
            color: charsNearLimit ? t.proTag : t.textFaint,
            minWidth: 60, textAlign: "right",
            transition: "color 0.2s",
          }}>
            {charsNearLimit ? `${charsLeft} left` : `${text.length}/${CHAR_LIMIT}`}
          </span>
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
          ✦ Daily limit reached — Go Pro for unlimited
        </button>
      ) : (
        <button onClick={handleTranslate} disabled={!hasText} style={{
          width: "100%", padding: "15px",
          background: hasText ? t.accent : t.surface2,
          color: hasText ? t.accentText : t.textDim,
          border: `1px solid ${hasText ? t.accent : t.border}`,
          borderRadius: 13, fontSize: 15,
          fontFamily: "'Lora',Georgia,serif",
          fontWeight: "bold", cursor: hasText ? "pointer" : "default",
          transition: "all 0.2s",
        }}>
          Translate
        </button>
      )}

      <BottomNav active="home" navigate={navigate} theme={theme} />
    </div>
  );
}
