import { useState } from "react";
import { FREE_TONES, PRO_SAVED_TONE_LIMIT, THEMES, TONE_CATEGORIES, TONE_DESCRIPTIONS, getToneStatus } from "../lib/constants.js";

function SmallHeart({ size = 14, color, filled = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <path
        d="M7 12C7 12 2 8.5 2 5C2 3.5 3.2 2.5 4.7 2.5C5.6 2.5 6.4 2.9 7 3.6C7.6 2.9 8.4 2.5 9.3 2.5C10.8 2.5 12 3.5 12 5C12 8.5 7 12 7 12Z"
        stroke={color}
        strokeWidth="1.4"
        fill={filled ? color : "none"}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ToneSheet({ visible, onClose, activeTone, userTier, favourites = [], onToggleFav, onSelectTone, navigate, theme, title = "Tones" }) {
  const t = THEMES[theme] || THEMES.dark;
  const [search, setSearch] = useState("");

  if (!visible) return null;

  const statusFor = (tone) => getToneStatus(tone, userTier);
  const filterTones = (tones) => (search ? tones.filter((tone) => tone.toLowerCase().includes(search.toLowerCase())) : tones);
  const closeAll = () => {
    onClose();
    setSearch("");
  };

  const handleTap = (tone) => {
    const status = statusFor(tone);
    if (status === "unlocked") {
      onSelectTone(tone);
      closeAll();
      return;
    }
    closeAll();
    navigate(status === "free_locked" ? "signin_tone" : { screen: "upgrade", context: "tone" });
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 600, display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={closeAll}>
      <div style={{ background: "rgba(0,0,0,0.6)", position: "absolute", inset: 0 }} />
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", background: theme === "light" ? "#f6f2ea" : "#161616", borderRadius: "22px 22px 0 0", maxHeight: "76vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px 0", flexShrink: 0 }}>
          <div style={{ width: 30, height: 3, background: t.border2, borderRadius: 2, margin: "0 auto 14px" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={closeAll} style={{ background: "none", border: "none", color: t.textDim, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: 0, fontFamily: "'Lora',Georgia,serif" }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>←</span>
              <span style={{ fontSize: 12, letterSpacing: "0.02em" }}>Back</span>
            </button>
            <span style={{ fontSize: 15, fontWeight: "bold", color: t.text, letterSpacing: "-0.2px" }}>{title}</span>
            {userTier === "pro" ? (
              <span style={{ fontSize: 10, color: t.textDim, letterSpacing: "0.04em" }}>{favourites.length}/{PRO_SAVED_TONE_LIMIT} saved</span>
            ) : (
              <div style={{ width: 60 }} />
            )}
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tones…" style={{ width: "100%", background: t.surface2, border: "none", borderRadius: 10, padding: "9px 13px", color: t.text, fontSize: 13, outline: "none", marginBottom: 12, fontFamily: "'Lora',Georgia,serif" }} />
        </div>

        <div style={{ overflowY: "auto", padding: "2px 18px 24px", flex: 1 }}>
          {userTier === "pro" && favourites.length > 0 && !search && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 9 }}>Your saved tones</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {favourites.map((tone) => (
                  <div key={tone} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <button onClick={() => handleTap(tone)} style={{ padding: "7px 13px", borderRadius: 20, border: `1.5px solid ${tone === activeTone ? t.accent : t.highlightBorder}`, background: tone === activeTone ? t.accent : "transparent", color: tone === activeTone ? t.accentText : t.highlightText, fontSize: 12, cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>
                      {tone}
                    </button>
                    <button onClick={() => onToggleFav?.(tone)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 3px", display: "flex", alignItems: "center" }}>
                      <SmallHeart size={13} color={t.accent} filled />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {TONE_CATEGORIES.map((category) => {
            const tones = filterTones(category.tones);
            if (!tones.length) return null;
            return (
              <div key={category.label} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 9 }}>{category.label}</div>
                {tones.map((tone) => {
                  const status = statusFor(tone);
                  const isFav = favourites.includes(tone);
                  const isActive = tone === activeTone;
                  const locked = status !== "unlocked";
                  const isProTone = !FREE_TONES.includes(tone);
                  return (
                    <div key={tone} onClick={() => handleTap(tone)} style={{ display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: 11, background: isActive ? t.highlight : "transparent", cursor: "pointer", marginBottom: 2, transition: "background 0.15s" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                          <span style={{ fontSize: 13, color: isActive ? t.highlightText : locked ? t.textDim : t.text }}>{tone}</span>
                          {status === "free_locked" && <span style={{ background: t.freeTag, color: "#fff", fontSize: 7, padding: "1px 5px", borderRadius: 4, fontWeight: "bold", letterSpacing: "0.04em" }}>FREE</span>}
                          {(status === "pro_locked" || (userTier === "pro" && isProTone)) && <span style={{ background: t.proTag, color: "#000", fontSize: 7, padding: "1px 5px", borderRadius: 4, fontWeight: "bold", letterSpacing: "0.04em" }}>PRO</span>}
                          {isActive && <span style={{ fontSize: 10, color: t.accent }}>✓</span>}
                        </div>
                        <div style={{ fontSize: 11, color: t.textDim }}>{TONE_DESCRIPTIONS[tone]}</div>
                      </div>
                      {locked && <span style={{ fontSize: 11, color: t.textFaint, marginLeft: 8 }}>→</span>}
                      {userTier === "pro" && !locked && (
                        <button onClick={(e) => { e.stopPropagation(); onToggleFav?.(tone); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", marginLeft: 6, display: "flex", alignItems: "center" }}>
                          <SmallHeart size={14} color={isFav ? t.accent : t.textDim} filled={isFav} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
