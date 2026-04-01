import { ALL_TONES, DEFAULT_PRO_TONES, FREE_TONES, PRO_TONES, getToneStatus, MAX_SAME_TONE, THEMES } from "../lib/constants.js";

function SmallHeart({ size = 10, color, filled = false }) {
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

export function ToneRow({
  activeTone,
  toneCount,
  onSelect,
  onSetLevel,
  onOpenSheet,
  userTier,
  favourites = [],
  priorityTonesOverride,
  disabled,
  isHomeScreen = false,
  showStrengthControl,
  navigate,
  theme,
}) {
  const t = THEMES[theme] || THEMES.dark;
  const defaultPriorityTones = userTier === "pro"
    ? DEFAULT_PRO_TONES
    : ["Polite", "Playful", "Casual", "Gen A"];

  const orderedCandidates = priorityTonesOverride?.length
    ? [...priorityTonesOverride, ...favourites, ...defaultPriorityTones, ...FREE_TONES, ...ALL_TONES]
    : userTier === "free"
      ? [activeTone, ...FREE_TONES, ...favourites, ...ALL_TONES]
      : [activeTone, ...favourites, ...defaultPriorityTones, ...FREE_TONES, ...ALL_TONES];
  const visibleTones = [];

  orderedCandidates.forEach((tone) => {
    if (!tone || visibleTones.includes(tone)) return;
    visibleTones.push(tone);
  });

  while (visibleTones.length < 5) {
    const nextTone = ALL_TONES.find((tone) => !visibleTones.includes(tone));
    if (!nextTone) break;
    visibleTones.push(nextTone);
  }

  const rowTones = visibleTones.slice(0, 5);
  const shouldShowStrengthControl = typeof showStrengthControl === "boolean" ? showStrengthControl : !isHomeScreen;

  const pills = rowTones.map((tone) => ({ tone, level: 1, type: "tone" }));
  const levelOptions = [
    { level: 1, label: "Light" },
    { level: 2, label: "Medium" },
    { level: 3, label: "Strong" },
  ];

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", opacity: disabled ? 0.2 : 1, paddingBottom: 2, paddingTop: 10, paddingRight: 2 }}>
            {pills.map((pill, index) => {
              const status = getToneStatus(pill.tone, userTier);
              const isFavourite = favourites.includes(pill.tone);
              const isActive = pill.tone === activeTone;
              const label = pill.tone;
              const showProBadge = PRO_TONES.includes(pill.tone);
              const borderColor = isActive ? t.accent : status !== "unlocked" ? t.border : t.border2;
              const textColor = isActive ? t.accentText : status !== "unlocked" ? t.textFaint : t.textMuted;

              const handleClick = () => {
                if (disabled) return;
                if (status !== "unlocked") {
                  navigate(status === "free_locked" ? "signin_tone" : "upgrade");
                  return;
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
                  {(status === "pro_locked" || (userTier === "pro" && showProBadge)) && (
                    <span style={{ position: "absolute", top: -8, right: -3, background: t.proTag, color: "#000", fontSize: 6, padding: "2px 4px", borderRadius: 4, fontWeight: "bold", lineHeight: 1.3, whiteSpace: "nowrap", zIndex: 10 }}>
                      PRO
                    </span>
                  )}
                  {isFavourite && status === "unlocked" && (
                    <span style={{ position: "absolute", top: -3, right: 6, zIndex: 11, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                      <SmallHeart size={10} color={t.proTag} filled />
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

      {shouldShowStrengthControl && !disabled && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
          <div style={{ width: "100%", maxWidth: 236 }}>
            <div style={{ textAlign: "center", fontSize: 9, color: t.textDim, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
              Tone strength
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 2,
              padding: 2,
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 11,
              width: "100%",
            }}>
              {levelOptions.map((option) => {
                const isActive = toneCount === option.level;
                return (
                  <button
                    key={option.level}
                    onClick={() => onSetLevel(option.level)}
                    style={{
                      border: "none",
                      borderRadius: 9,
                      background: isActive ? t.surface2 : "transparent",
                      color: isActive ? t.text : t.textFaint,
                      padding: "7px 4px",
                      fontSize: 10,
                      cursor: "pointer",
                      fontFamily: "'Lora',Georgia,serif",
                      fontWeight: isActive ? "bold" : "normal",
                      transition: "all 0.18s",
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
