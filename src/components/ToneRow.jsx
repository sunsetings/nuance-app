import { DEFAULT_PRO_TONES, FREE_TONES, getToneStatus, MAX_SAME_TONE, THEMES } from "../lib/constants.js";

export function ToneRow({
  activeTone,
  toneCount,
  onSelect,
  onSetLevel,
  onOpenSheet,
  userTier,
  favourites = [],
  disabled,
  isHomeScreen = false,
  navigate,
  theme,
}) {
  const t = THEMES[theme] || THEMES.dark;
  const isPro = userTier === "pro";
  const baseVisibleTones = isPro
    ? (favourites.length > 0 ? favourites.slice(0, 4) : DEFAULT_PRO_TONES.slice(0, 4))
    : userTier === "free"
      ? FREE_TONES.slice(0, 4)
      : ["Polite", "Casual", "Formal", "Gen A"];

  const visibleTones = baseVisibleTones.includes(activeTone)
    ? baseVisibleTones
    : [activeTone, ...baseVisibleTones].slice(0, 5);

  const pills = [];
  if (isHomeScreen) {
    visibleTones.forEach((tone) => pills.push({ tone, level: 1, type: "tone" }));
  } else {
    visibleTones.forEach((tone) => {
      if (tone === activeTone) {
        const stackMax = Math.min(toneCount + 1, MAX_SAME_TONE);
        for (let level = 1; level <= stackMax; level += 1) {
          pills.push({ tone, level, type: "stack" });
        }
      } else {
        pills.push({ tone, level: 1, type: "tone" });
      }
    });
  }

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", opacity: disabled ? 0.2 : 1, paddingBottom: 2, paddingTop: 10, paddingRight: 2 }}>
            {pills.map((pill, index) => {
              const status = getToneStatus(pill.tone, userTier);
              const isActive = pill.tone === activeTone && (isHomeScreen || pill.level === toneCount);
              const isPast = !isHomeScreen && pill.tone === activeTone && pill.level < toneCount;
              const isNext = !isHomeScreen && pill.tone === activeTone && pill.level === toneCount + 1 && toneCount < MAX_SAME_TONE;
              const label = pill.level > 1 ? `${pill.tone} ×${pill.level}` : pill.tone;
              const borderColor = isActive ? t.accent : isNext ? t.highlightBorder : isPast ? t.border2 : status !== "unlocked" ? t.border : t.border2;
              const textColor = isActive ? t.accentText : isNext ? (theme === "light" ? "#2a5a20" : "#7acd7a") : isPast ? t.textMuted : status !== "unlocked" ? t.textFaint : t.textMuted;

              const handleClick = () => {
                if (disabled) return;
                if (status !== "unlocked") {
                  navigate(status === "free_locked" ? "signin_tone" : "upgrade");
                  return;
                }
                if (pill.type === "stack") {
                  if (isPast) {
                    onSetLevel(pill.level);
                    return;
                  }
                  if (isNext) {
                    onSelect(pill.tone);
                    return;
                  }
                }
                onSelect(pill.tone);
              };

              return (
                <button
                  key={`${pill.tone}-${pill.level}-${index}`}
                  onClick={handleClick}
                  style={{
                    flexShrink: 0,
                    padding: "7px 13px",
                    borderRadius: 18,
                    border: `1.5px solid ${borderColor}`,
                    background: isActive ? t.accent : "transparent",
                    color: textColor,
                    fontSize: 12,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    position: "relative",
                    transition: "all 0.18s",
                    fontFamily: "'Lora',Georgia,serif",
                    overflow: "visible",
                  }}
                >
                  {label}
                  {status === "free_locked" && (
                    <span style={{ position: "absolute", top: -8, right: -3, background: t.freeTag, color: "#fff", fontSize: 6, padding: "2px 4px", borderRadius: 4, fontWeight: "bold", lineHeight: 1.3, whiteSpace: "nowrap", zIndex: 10 }}>
                      FREE
                    </span>
                  )}
                  {status === "pro_locked" && (
                    <span style={{ position: "absolute", top: -8, right: -3, background: t.proTag, color: "#000", fontSize: 6, padding: "2px 4px", borderRadius: 4, fontWeight: "bold", lineHeight: 1.3, whiteSpace: "nowrap", zIndex: 10 }}>
                      PRO
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 36, background: `linear-gradient(to right, transparent, ${t.phoneBg})`, pointerEvents: "none" }} />
        </div>

        <button
          onClick={onOpenSheet}
          disabled={disabled}
          style={{ flexShrink: 0, minWidth: 60, padding: "7px 10px", borderRadius: 18, border: `1px solid ${t.border}`, background: "transparent", color: t.textDim, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", opacity: disabled ? 0.2 : 1, fontFamily: "'Lora',Georgia,serif" }}
        >
          + More
        </button>
      </div>

      {!disabled && (
        <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 68, marginTop: 3 }}>
          <span style={{ fontSize: 9, color: t.textFaint, letterSpacing: "0.06em" }}>Scroll for more tones</span>
        </div>
      )}
    </div>
  );
}
