import { useState } from "react";
import { THEMES } from "../lib/constants.js";
import { Toast, ShareSheet, ShareSaveRow, BottomNav, CopyBtn, RefineCounter } from "./UI.jsx";
import { saveTranslation, unsaveTranslation } from "../lib/userdata.js";

export function QuickResultsScreen({ navigate, isPremium, theme, initialData, savedItem, usageCount, savedItems, setSavedItems, user }) {
  const t = THEMES[theme] || THEMES.dark;
  const fromSaved = !!savedItem;
  const source = savedItem || initialData || {};

  const [toastVisible, setToastVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const original = source.original || "";
  const translated = source.translated || "";
  const toLang = source.toLang || source.to_lang || source.lang || "Japanese";
  const sourceLangCode = (source.fromLang || source.from_lang || "EN").slice(0, 2).toUpperCase();
  const targetLangCode = toLang.slice(0, 2).toUpperCase();
  const sectionMetaStyle = { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 };

  // Check if already saved
  const existingSave = savedItems?.find(s =>
    s.original === original &&
    s.mode === "quick"
  );
  const saved = !!existingSave;

  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  };

  const handleSave = async () => {
    if (!user) { navigate("upgrade"); return; }
    if (saving) return;
    setSaving(true);
    try {
      if (saved && existingSave) {
        await unsaveTranslation(user.id, existingSave.id);
        setSavedItems(prev => prev.filter(s => s.id !== existingSave.id));
      } else {
        const newItem = await saveTranslation(user.id, {
          mode: "quick",
          original,
          translated,
          fromLang: source.fromLang || source.from_lang || "English",
          toLang,
        });
        setSavedItems(prev => [newItem, ...prev]);
        showToast();
      }
    } catch (e) {
      console.error("Save failed:", e);
      setError("Couldn't save — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      padding: "14px 20px 8px", fontFamily: "'Lora',Georgia,serif",
      color: t.text, background: t.phoneBg,
      display: "flex", flexDirection: "column", minHeight: "100%",
    }}>
      <Toast message="Translation saved to favourites" visible={toastVisible} theme={theme} />
      <ShareSheet visible={shareVisible} onClose={() => setShareVisible(false)} theme={theme} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, marginTop: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate(fromSaved ? "saved" : "home")} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 18, cursor: "pointer" }}>←</button>
          <span style={{ fontSize: 15, fontWeight: "bold" }}>Translation</span>
          {fromSaved && <span style={{ fontSize: 9, color: t.accent, border: `1px solid ${t.highlightBorder}`, padding: "2px 8px", borderRadius: 10 }}>from saved</span>}
        </div>
        <RefineCounter isPremium={isPremium} usageCount={usageCount} navigate={navigate} theme={theme} />
      </div>

      {error && (
        <div style={{ background: "#2a0a0a", border: "1px solid #6a2020", borderRadius: 10, padding: "10px 14px", marginBottom: 8, fontSize: 12, color: "#e88", fontFamily: "'Lora',Georgia,serif" }}>
          {error}
        </div>
      )}

      {[
        {
          label: "ORIGINAL",
          content: original,
          lang: sourceLangCode,
          textToCopy: original,
          labelColor: t.textFaint,
          contentStyle: {
            padding: "0 0 4px 12px",
            borderLeft: `2px solid ${t.border}`,
            color: t.textDim,
            fontSize: 12,
            lineHeight: 1.72,
          },
        },
        {
          label: "TRANSLATION",
          content: translated,
          lang: targetLangCode,
          textToCopy: translated,
          labelColor: theme === "light" ? "#2a6a2a" : "#78b86f",
          contentStyle: {
            padding: "16px 20px",
            background: t.highlight,
            borderRadius: 14,
            border: `1px solid ${t.highlightBorder}`,
            color: t.highlightText,
            fontSize: 12,
            lineHeight: 1.76,
          },
        },
      ].map(({ label, content, lang, textToCopy, labelColor, contentStyle }, i) => (
        <div key={i} style={{ marginBottom: 9 }}>
          <div style={sectionMetaStyle}>
            <span style={{ fontSize: 9, color: labelColor, letterSpacing: "0.12em", fontWeight: i === 1 ? "bold" : "normal" }}>{label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

      {!fromSaved && (
        <button onClick={() => navigate("home")} style={{
          width: "100%", padding: "11px",
          background: t.highlight, border: `1px dashed ${t.highlightBorder}`,
          borderRadius: 10, color: theme === "light" ? "#2a6a2a" : "#8adc8a",
          fontSize: 12, fontFamily: "'Lora',Georgia,serif",
          cursor: "pointer", marginTop: 8, marginBottom: 4,
        }}>
          ✦ Want to refine the tone? Try Refine & Translate
        </button>
      )}

      <BottomNav active="quickresults" navigate={navigate} theme={theme} user={user} />
    </div>
  );
}
