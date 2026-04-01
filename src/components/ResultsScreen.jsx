import { useState } from "react";
import { THEMES, MAX_SAME_TONE, getCapForTier, getToneStatus } from "../lib/constants.js";
import { Toast, ShareSaveRow, BottomNav, CopyBtn, RefineCounter } from "./UI.jsx";
import { ToneSheet } from "./ToneSheet.jsx";
import { ToneRow } from "./ToneRow.jsx";
import { refineAndTranslate } from "../lib/openai.js";
import { incrementUsage } from "../lib/usage.js";
import { saveTranslation, unsaveTranslation } from "../lib/userdata.js";

export function ResultsScreen({ navigate, userTier, theme, initialData, savedItem, usageCount, setUsageCount, recentTones, savedTones = [], onToggleSavedTone, onAddRecentTone, savedItems, setSavedItems, user }) {
  const t = THEMES[theme] || THEMES.dark;
  const fromSaved = !!savedItem;
  const source = savedItem || initialData || {};

  const [activeTone, setActiveTone] = useState(source.tone || "Polite");
  const [toneCount, setToneCount] = useState(source.toneCount || 1);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [refined, setRefined] = useState(source.refined || "");
  const [translated, setTranslated] = useState(source.translated || "");
  const original = source.original || "";
  const toLang = source.toLang || source.to_lang || source.lang || "Japanese";
  const cap = getCapForTier(userTier);

  const ensureWithinCap = () => {
    if (usageCount >= cap) {
      navigate("cap");
      return false;
    }
    return true;
  };

  // Check if this translation is already saved
  const existingSave = savedItems?.find(s =>
    s.original === original &&
    s.tone === activeTone &&
    s.tone_count === toneCount &&
    s.mode === "refine"
  );
  const saved = !!existingSave;

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  };

  const buildShareImageBlob = async () => {
    const width = 1080;
    const horizontal = 72;
    const panelWidth = width - horizontal * 2;
    const titleColor = t.textFaint;
    const labelColor = theme === "light" ? "#2a6a2a" : "#78b86f";
    const bubbleFill = t.highlight;
    const bubbleStroke = t.highlightBorder;
    const bubbleText = t.highlightText;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const wrapText = (text, maxWidth, font) => {
      ctx.font = font;
      const words = String(text || "—").split(/\s+/);
      const lines = [];
      let line = "";
      words.forEach((word) => {
        const next = line ? `${line} ${word}` : word;
        if (ctx.measureText(next).width <= maxWidth) {
          line = next;
        } else {
          if (line) lines.push(line);
          line = word;
        }
      });
      if (line) lines.push(line);
      return lines.length ? lines : ["—"];
    };

    const originalLines = wrapText(original, panelWidth - 36, "42px Georgia");
    const refinedLines = wrapText(refined, panelWidth - 80, "44px Georgia");
    const translatedLines = wrapText(translated, panelWidth - 80, "40px Georgia");

    const originalHeight = Math.max(90, originalLines.length * 56);
    const refinedHeight = Math.max(150, refinedLines.length * 62 + 44);
    const translatedHeight = Math.max(150, translatedLines.length * 58 + 44);

    const totalHeight = 220 + originalHeight + refinedHeight + translatedHeight + 250;
    canvas.width = width;
    canvas.height = totalHeight;

    ctx.fillStyle = t.phoneBg;
    ctx.fillRect(0, 0, width, totalHeight);

    ctx.fillStyle = t.text;
    ctx.font = "bold 56px Georgia";
    ctx.fillText("tonara.", horizontal, 90);

    let y = 170;

    const drawSectionHeader = (label, lang, color, bold = false) => {
      ctx.fillStyle = color;
      ctx.font = `${bold ? "bold " : ""}24px Georgia`;
      ctx.fillText(label, horizontal, y);
      ctx.fillStyle = t.textFaint;
      ctx.font = "24px Georgia";
      const langText = String(lang || "").toUpperCase();
      const langWidth = ctx.measureText(langText).width;
      ctx.fillText(langText, width - horizontal - langWidth, y);
      y += 22;
    };

    const drawOriginalBlock = () => {
      drawSectionHeader("ORIGINAL", sourceLangCode, titleColor, false);
      y += 18;
      ctx.strokeStyle = t.border;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(horizontal + 10, y);
      ctx.lineTo(horizontal + 10, y + originalHeight - 18);
      ctx.stroke();
      ctx.fillStyle = t.textDim;
      ctx.font = "42px Georgia";
      originalLines.forEach((line, index) => {
        ctx.fillText(line, horizontal + 34, y + 10 + index * 56);
      });
      y += originalHeight + 34;
    };

    const roundedRect = (x, yPos, w, h, radius) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, yPos);
      ctx.lineTo(x + w - radius, yPos);
      ctx.quadraticCurveTo(x + w, yPos, x + w, yPos + radius);
      ctx.lineTo(x + w, yPos + h - radius);
      ctx.quadraticCurveTo(x + w, yPos + h, x + w - radius, yPos + h);
      ctx.lineTo(x + radius, yPos + h);
      ctx.quadraticCurveTo(x, yPos + h, x, yPos + h - radius);
      ctx.lineTo(x, yPos + radius);
      ctx.quadraticCurveTo(x, yPos, x + radius, yPos);
      ctx.closePath();
    };

    const drawBubbleBlock = (label, lang, lines, height, textColor) => {
      drawSectionHeader(label, lang, labelColor, true);
      y += 18;
      roundedRect(horizontal, y, panelWidth, height, 24);
      ctx.fillStyle = bubbleFill;
      ctx.fill();
      ctx.strokeStyle = bubbleStroke;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = textColor;
      ctx.font = label.includes("TRANSLATED") ? "40px Georgia" : "44px Georgia";
      const lineHeight = label.includes("TRANSLATED") ? 58 : 62;
      lines.forEach((line, index) => {
        ctx.fillText(line, horizontal + 40, y + 66 + index * lineHeight);
      });
      y += height + 38;
    };

    drawOriginalBlock();
    drawBubbleBlock(refinedLabel, sourceLangCode, refinedLines, refinedHeight, bubbleText);
    drawBubbleBlock("REFINED AND TRANSLATED", targetLangCode, translatedLines, translatedHeight, bubbleText);

    return await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  };

  const handleShare = async () => {
    try {
      const blob = await buildShareImageBlob();
      if (!blob) throw new Error("No image created");

      const file = new File([blob], "tonara-share.png", { type: "image/png" });

      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({
          files: [file],
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "tonara-share.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast("Image downloaded for sharing");
    } catch (e) {
      if (e?.name !== "AbortError") {
        showToast("Couldn't open native share");
      }
    }
  };

  const doRefine = async (tone, count) => {
    setLoading(true);
    setError(null);
    try {
      const result = await refineAndTranslate({
        text: original,
        tone,
        fromLang: source.fromLang || source.from_lang || "English",
        toLang,
        toneCount: count,
      });
      setRefined(result.refined);
      setTranslated(result.translated);
      if (user?.id) {
        setUsageCount((prev) => prev + 1);
      } else {
        const updated = incrementUsage();
        setUsageCount(updated.count);
      }
      onAddRecentTone(tone);
    } catch (e) {
      setError("Something went wrong — please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async tone => {
    if (!ensureWithinCap()) return;
    const status = getToneStatus(tone, userTier);
    if (status !== "unlocked") {
      navigate(status === "free_locked" ? "account" : "upgrade");
      return;
    }
    if (tone === activeTone) return;
    setActiveTone(tone);
    await doRefine(tone, toneCount);
  };

  const handleSetLevel = async lvl => {
    if (!ensureWithinCap()) return;
    if (lvl < 1 || lvl > MAX_SAME_TONE || lvl === toneCount) return;
    setToneCount(lvl);
    await doRefine(activeTone, lvl);
  };

  const handleSheetSelect = async (tone) => {
    if (!ensureWithinCap()) return;
    if (tone === activeTone) {
      if (toneCount !== 1) {
        setToneCount(1);
        await doRefine(tone, 1);
      }
      return;
    }
    setActiveTone(tone);
    await doRefine(tone, toneCount);
  };

  const handleSave = async () => {
    if (!user) { navigate("signin_save"); return; }
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

  const strengthLabelMap = {
    1: "LIGHT",
    2: "MEDIUM",
    3: "STRONG",
  };
  const refinedLabel = `REFINED · ${activeTone.toUpperCase()} (${strengthLabelMap[toneCount] || "LIGHT"})`;
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
        padding: "0 20px 4px 20px",
        borderLeft: `2px solid ${t.border}`,
        color: t.textDim,
        fontSize: 12,
        lineHeight: 1.72,
        boxSizing: "border-box",
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
      boxSizing: "border-box",
    }}>
      <Toast message={toastMessage} visible={toastVisible} theme={theme} />
      <ToneSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        activeTone={activeTone}
        userTier={userTier}
        favourites={savedTones}
        onToggleFav={onToggleSavedTone}
        onSelectTone={handleSheetSelect}
        navigate={navigate}
        theme={theme}
      />

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 8 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, marginTop: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => navigate(fromSaved ? "saved" : "home")} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 18, cursor: "pointer" }}>←</button>
            <span style={{ fontSize: 15, fontWeight: "bold" }}>Results</span>
            {fromSaved && <span style={{ fontSize: 9, color: t.accent, border: `1px solid ${t.highlightBorder}`, padding: "2px 8px", borderRadius: 10 }}>from saved</span>}
          </div>
          <ResultsHeaderCTA userTier={userTier} navigate={navigate} theme={theme} />
        </div>

        {/* Tone row */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 2 }}>
            <div style={{ fontSize: 15, color: t.text, fontWeight: "bold", letterSpacing: "-0.02em" }}>Refine further</div>
            <div style={{ fontSize: 9, color: t.textFaint, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>Scroll for more tones</div>
          </div>
          <ToneRow
            activeTone={activeTone} toneCount={toneCount}
            onSelect={handleSelect} onSetLevel={handleSetLevel}
            onOpenSheet={() => setSheetOpen(true)}
            userTier={userTier}
            favourites={savedTones}
            recentTones={recentTones}
            disabled={loading}
            isHomeScreen={false}
            navigate={navigate}
            theme={theme}
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

        <ShareSaveRow userTier={userTier} saved={saved} onSave={handleSave} onShare={handleShare} navigate={navigate} saveCount={savedItems?.length || 0} theme={theme} />
      </div>
      <div style={{ marginTop: "auto" }}>
        <BottomNav active="results" navigate={navigate} theme={theme} userTier={userTier} />
      </div>
    </div>
  );
}

function ResultsHeaderCTA({ userTier, navigate, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  if (userTier === "guest") {
    return <button onClick={() => navigate("signin_tone")} style={{ background: "transparent", border: "none", padding: "4px 0", color: t.freeTag, fontSize: 10, cursor: "pointer", letterSpacing: "0.02em", fontFamily: "'Lora',Georgia,serif" }}>Unlock free tones →</button>;
  }
  if (userTier === "free") {
    return <button onClick={() => navigate("upgrade")} style={{ background: "transparent", border: `1px solid ${t.proTag}`, borderRadius: 8, padding: "4px 10px", color: t.proTag, fontSize: 10, cursor: "pointer", letterSpacing: "0.02em", fontFamily: "'Lora',Georgia,serif" }}>Unlock Pro tones →</button>;
  }
  return <span style={{ fontSize: 10, color: t.accentDim, letterSpacing: "0.02em" }}>✦ Pro — all tones unlocked</span>;
}
