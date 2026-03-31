import { useState } from "react";
import { THEMES, FREE_TONES, MAX_SAME_TONE, FREE_DAILY_CAP } from "../lib/constants.js";
import { Toast, ShareSheet, ShareSaveRow, BottomNav, CopyBtn, RefineCounter } from "./UI.jsx";
import { ToneRow } from "./ToneRow.jsx";
import { refineAndTranslate } from "../lib/openai.js";
import { incrementUsage } from "../lib/usage.js";
import { saveTranslation, unsaveTranslation } from "../lib/userdata.js";

export function ResultsScreen({ navigate, isPremium, theme, initialData, savedItem, usageCount, setUsageCount, apiKey, recentTones, onAddRecentTone, savedItems, setSavedItems, user }) {
  const t = THEMES[theme] || THEMES.dark;
  const fromSaved = !!savedItem;
  const source = savedItem || initialData || {};

  const [activeTone, setActiveTone] = useState(source.tone || "Polite");
  const [toneCount, setToneCount] = useState(source.toneCount || 1);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [shareVisible, setShareVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [refined, setRefined] = useState(source.refined || "");
  const [translated, setTranslated] = useState(source.translated || "");
  const original = source.original || "";
  const toLang = source.toLang || source.to_lang || source.lang || "Japanese";

  // Check if this translation is already saved
  const existingSave = savedItems?.find(s =>
    s.original === original &&
    s.tone === activeTone &&
    s.tone_count === toneCount &&
    s.mode === "refine"
  );
  const saved = !!existingSave;

  const atLimit = !isPremium && usageCount >= FREE_DAILY_CAP;

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  };

  const doRefine = async (tone, count) => {
    if (!apiKey) { setError("No API key — add your OpenAI key in settings."); return; }
    if (atLimit && !isPremium) { navigate("upgrade"); return; }

    setLoading(true);
    setError(null);
    try {
      const result = await refineAndTranslate({
        text: original,
        tone,
        fromLang: source.fromLang || source.from_lang || "English",
        toLang,
        toneCount: count,
        apiKey,
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

  const handleSave = async () => {
    if (!user) { navigate("upgrade"); return; }
    if (saving) return;
    setSaving(true);
    try {
      if (saved && existingSave) {
        // Unsave
        await unsaveTranslation(user.id, existingSave.id);
        setSavedItems(prev => prev.filter(s => s.id !== existingSave.id));
      } else {
        // Save
        const newItem = await saveTranslation(user.id, {
          mode: "refine",
          original,
          refined,
          translated,
          tone: activeTone,
          toneCount,
          fromLang: source.fromLang || source.from_lang || "English",
          toLang,
        });
        setSavedItems(prev => [newItem, ...prev]);
        showToast("All 3 panels saved to favourites");
      }
    } catch (e) {
      console.error("Save failed:", e);
      setError("Couldn't save — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const refinedLabel = `REFINED · ${activeTone.toUpperCase()}${toneCount > 1 ? ` ×${toneCount}` : ""}`;
  const sourceLangCode = (source.fromLang || source.from_lang || "EN").slice(0, 2).toUpperCase();
  const targetLangCode = toLang.slice(0, 2).toUpperCase();
  const sectionMetaStyle = { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 };
  const sectionLabelStyle = { fontSize: 9, letterSpacing: "0.12em" };
  const inlineCopyWrapStyle = { display: "flex", alignItems: "center", gap: 8 };

  const resultSections = [
    {
      label: "ORIGINAL",
      content: original,
      lang: sourceLangCode,
      textToCopy: original,
      contentStyle: {
        padding: "0 0 4px 12px",
        borderLeft: `2px solid ${t.border}`,
        color: t.textDim,
        fontSize: 12,
        lineHeight: 1.72,
      },
      labelColor: t.textFaint,
    },
    {
      label: refinedLabel,
      content: refined,
      lang: sourceLangCode,
      textToCopy: refined,
      contentStyle: {
        padding: "16px 20px",
        background: t.highlight,
        borderRadius: 14,
        border: `1px solid ${t.highlightBorder}`,
        color: t.highlightText,
        fontSize: 13,
        lineHeight: 1.76,
      },
      labelColor: theme === "light" ? "#2a6a2a" : "#78b86f",
      labelWeight: "bold",
    },
    {
      label: "REFINED AND TRANSLATED",
      content: translated,
      lang: targetLangCode,
      textToCopy: translated,
      contentStyle: {
        padding: "16px 20px",
        background: t.highlight,
        borderRadius: 14,
        border: `1px solid ${t.highlightBorder}`,
        color: t.highlightText,
        fontSize: 12,
        lineHeight: 1.76,
      },
      labelColor: theme === "light" ? "#2a6a2a" : "#78b86f",
      labelWeight: "bold",
    },
  ];

  return (
    <div style={{
      padding: "14px 20px 8px", fontFamily: "'Lora',Georgia,serif",
      color: t.text, position: "relative", background: t.phoneBg,
      display: "flex", flexDirection: "column", minHeight: "100%",
    }}>
      <Toast message={toastMessage} visible={toastVisible} theme={theme} />
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

      {loading && (
        <div style={{ textAlign: "center", padding: "20px", color: t.textDim, fontSize: 13, fontStyle: "italic", letterSpacing: "0.05em" }}>
          refining…
        </div>
      )}

      {error && (
        <div style={{ background: "#2a0a0a", border: "1px solid #6a2020", borderRadius: 10, padding: "10px 14px", marginBottom: 8, fontSize: 12, color: "#e88", fontFamily: "'Lora',Georgia,serif" }}>
          {error}
        </div>
      )}

      {/* 3 panels */}
      {!loading && resultSections.map(({ label, content, lang, textToCopy, contentStyle, labelColor, labelWeight }, i) => (
        <div key={i} style={{ marginBottom: i < resultSections.length - 1 ? 10 : 8 }}>
          <div style={sectionMetaStyle}>
            <span style={{ ...sectionLabelStyle, color: labelColor, fontWeight: labelWeight || "normal" }}>{label}</span>
            <div style={inlineCopyWrapStyle}>
              <span style={{ fontSize: 9, color: t.textFaint, letterSpacing: "0.06em" }}>{lang}</span>
              <CopyBtn text={textToCopy} theme={theme} variant="inline" />
            </div>
          </div>
          <div style={contentStyle}>
            {content || <span style={{ fontStyle: "italic", opacity: 0.5 }}>—</span>}
          </div>
        </div>
      ))}

      <ShareSaveRow isPremium={isPremium} saved={saved} onSave={handleSave} onShare={() => setShareVisible(true)} navigate={navigate} theme={theme} />
      <BottomNav active="results" navigate={navigate} theme={theme} user={user} />
    </div>
  );
}
