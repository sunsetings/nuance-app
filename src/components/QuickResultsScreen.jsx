import { useState } from "react";
import { THEMES } from "../lib/constants.js";
import { Toast, ShareSaveRow, BottomNav, CopyBtn } from "./UI.jsx";
import { saveTranslation, unsaveTranslation } from "../lib/userdata.js";

const SHARE_CAPTION = "Try tonara.- it helps with tone, not just translation";

export function QuickResultsScreen({ navigate, userTier, theme, initialData, savedItem, usageCount, savedItems, setSavedItems, user }) {
  const t = THEMES[theme] || THEMES.dark;
  const fromSaved = !!savedItem;
  const source = savedItem || initialData || {};

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("Translation saved to favourites");
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

  const showToast = (message = "Translation saved to favourites") => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  };

  const handleShare = async () => {
    const shareText = [
      SHARE_CAPTION,
      `Original: ${original}`,
      `Translation (${toLang}): ${translated}`,
    ].filter(Boolean).join("\n\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: "tonara.",
          text: shareText,
        });
        return;
      }

      await navigator.clipboard.writeText(shareText);
      showToast("Copied to clipboard for sharing");
    } catch (e) {
      if (e?.name !== "AbortError") {
        setError("Couldn't open native share.");
      }
    }
  };

  const handleSave = async () => {
    if (!user) { navigate("signin_save"); return; }
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
      boxSizing: "border-box",
    }}>
      <Toast message={toastMessage} visible={toastVisible} theme={theme} />

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 8 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, marginTop: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => navigate(fromSaved ? "saved" : "home")} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 18, cursor: "pointer" }}>←</button>
            <span style={{ fontSize: 15, fontWeight: "bold" }}>Translation</span>
            {fromSaved && <span style={{ fontSize: 9, color: t.accent, border: `1px solid ${t.highlightBorder}`, padding: "2px 8px", borderRadius: 10 }}>from saved</span>}
          </div>
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
            padding: "0 20px 4px 20px",
            borderLeft: `2px solid ${t.border}`,
            color: t.textDim,
            fontSize: 12,
            lineHeight: 1.72,
            boxSizing: "border-box",
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

        <ShareSaveRow userTier={userTier} saved={saved} onSave={handleSave} onShare={handleShare} navigate={navigate} saveCount={savedItems?.length || 0} theme={theme} />

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
      </div>

      <div style={{ marginTop: "auto" }}>
        <BottomNav active="quickresults" navigate={navigate} theme={theme} userTier={userTier} />
      </div>
    </div>
  );
}
