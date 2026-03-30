import { useState } from "react";
import { THEMES, FREE_TONES, MAX_SAME_TONE, FREE_DAILY_CAP } from "../lib/constants.js";
import { Toast, ShareSheet, ShareSaveRow, BottomNav, CopyBtn, RefineCounter } from "./UI.jsx";
import { ToneRow } from "./ToneRow.jsx";
import { refineAndTranslate } from "../lib/openai.js";
import { incrementUsage } from "../lib/usage.js";

export function ResultsScreen({ navigate, isPremium, theme, initialData, savedItem, usageCount, setUsageCount, apiKey, recentTones, onAddRecentTone }) {
  const t = THEMES[theme] || THEMES.dark;
  const fromSaved = !!savedItem;

  // If coming from saved, use saved data. Otherwise use what was passed from home.
  const source = savedItem || initialData || {};

  const [activeTone, setActiveTone] = useState(source.tone || "Polite");
  const [toneCount, setToneCount] = useState(source.toneCount || 1);
  const [saved, setSaved] = useState(fromSaved);
  const [toastVisible, setToastVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // The three panels
  const [refined, setRefined] = useState(source.refined || "");
  const [translated, setTranslated] = useState(source.translated || "");
  const original = source.original || "";
  const toLang = source.toLang || source.lang || "Japanese";

  const atLimit = !isPremium && usageCount >= FREE_DAILY_CAP;

  const showToast = () => { setToastVisible(true); setTimeout(() => setToastVisible(false), 2200); };

  const doRefine = async (tone, count) => {
    if (!apiKey) { setError("No API key — add your OpenAI key in settings."); return; }
    if (atLimit && !isPremium) { navigate("upgrade"); return; }

    setLoading(true);
    setError(null);
    try {
      const result = await refineAndTranslate({
        text: original,
        tone, fromLang: source.fromLang || "English",
        toLang, toneCount: count, apiKey,
      });
      setRefined(result.refined);
      setTranslated(result.translated);
      const updated = incrementUsage();
      setUsageCount(updated.count);
      onAddRecentTone(tone);
    } catch (e) {
      setError("Something went wrong — please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async tone => {
    if (tone === activeTone) {
      if (toneCount >= MAX_SAME_TONE) return;
      const newCount = toneCount + 1;
      setToneCount(newCount);
      setActiveTone(tone);
      await doRefine(tone, newCount);
    } else {
      setActiveTone(tone);
      setToneCount(1);
      await doRefine(tone, 1);
    }
  };

  const handleSetLevel = async lvl => {
    setToneCount(lvl);
    await doRefine(activeTone, lvl);
  };

  const handleSave = () => { setSaved(s => !s); if (!saved) showToast(); };
  const refinedLabel = `REFINED · ${activeTone.toUpperCase()}${toneCount > 1 ? ` ×${toneCount}` : ""}`;

  return (
    <div style={{
      padding: "14px 20px 8px", fontFamily: "'Lora',Georgia,serif",
      color: t.text, position: "relative", background: t.phoneBg,
      display: "flex", flexDirection: "column", minHeight: "100%",
    }}>
      <Toast message="All 3 panels saved to favourites" visible={toastVisible} theme={theme} />
      <ShareSheet visible={shareVisible} onClose={() => setShareVisible(false)} theme={theme} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, marginTop: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate(fromSaved ? "saved" : "home")} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 18, cursor: "pointer" }}>←</button>
          <span style={{ fontSize: 15, fontWeight: "bold" }}>Results</span>
          {fromSaved && <span style={{ fontSize: 9, color: t.accent, border: `1px solid ${t.highlightBorder}`, padding: "2px 8px", borderRadius: 10 }}>from saved</span>}
        </div>
        <RefineCounter isPremium={isPremium} usageCount={usageCount} navigate={navigate} theme={theme} />
      </div>

      {/* Tone row */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.1em", marginBottom: 4 }}>REFINE FURTHER</div>
        <ToneRow
          activeTone={activeTone} toneCount={toneCount}
          onSelect={handleSelect} onSetLevel={handleSetLevel}
          isPremium={isPremium} disabled={loading}
          isHomeScreen={false} recentTones={recentTones} theme={theme}
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          textAlign: "center", padding: "20px",
          color: t.textDim, fontSize: 13,
          fontStyle: "italic", letterSpacing: "0.05em",
        }}>
          refining…
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          background: "#2a0a0a", border: "1px solid #6a2020",
          borderRadius: 10, padding: "10px 14px", marginBottom: 8,
          fontSize: 12, color: "#e88", fontFamily: "'Lora',Georgia,serif",
        }}>
          {error}
        </div>
      )}

      {/* 3 panels */}
      {!loading && [
        { label: "ORIGINAL", content: original, lang: source.fromLang || "EN", muted: true, highlight: false, textToCopy: original },
        { label: refinedLabel, content: refined, lang: source.fromLang || "EN", highlight: true, textToCopy: refined },
        { label: "TRANSLATED · " + toLang.toUpperCase(), content: translated, lang: toLang.slice(0, 2).toUpperCase(), highlight: false, textToCopy: translated },
      ].map(({ label, content, lang, muted, highlight, textToCopy }, i) => (
        <div key={i} style={{
          background: highlight ? t.highlight : t.surface,
          border: `1px solid ${highlight ? t.highlightBorder : t.border}`,
          borderRadius: 12, padding: "11px 13px", marginBottom: 8,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 9, color: highlight ? (theme === "light" ? "#2a6a2a" : "#8adc8a") : t.textDim, letterSpacing: "0.12em" }}>{label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 9, color: t.textDim }}>{lang}</span>
              <CopyBtn text={textToCopy} theme={theme} />
            </div>
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.68, color: muted ? t.textDim : highlight ? t.highlightText : t.textMuted }}>
            {content || <span style={{ fontStyle: "italic", opacity: 0.5 }}>—</span>}
          </div>
        </div>
      ))}

      <ShareSaveRow isPremium={isPremium} saved={saved} onSave={handleSave} onShare={() => setShareVisible(true)} navigate={navigate} theme={theme} />
      <BottomNav active="results" navigate={navigate} theme={theme} />
    </div>
  );
}
