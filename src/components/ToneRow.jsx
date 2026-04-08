import { useEffect, useRef } from "react";
import { ALL_TONES, DEFAULT_PRO_TONES, FREE_TONES, GUEST_TONES, PRO_TONES, getToneStatus, MAX_SAME_TONE, THEMES, getLocalizedToneName } from "../lib/constants.js";
import { createI18n } from "../lib/i18n.js";

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
  onSelectTranslateOnly,
  onOpenSheet,
  userTier,
  favourites = [],
  recentTones = [],
  priorityTonesOverride,
  disabled,
  isHomeScreen = false,
  showStrengthControl,
  showTranslateOnlyChip = false,
  translateOnlyActive = false,
  strengthDisabled = false,
  navigate,
  theme,
}) {
  const scrollerRef = useRef(null);
  const activePillRef = useRef(null);
  const t = THEMES[theme] || THEMES.dark;
  const copy = createI18n();
  const locale = copy.locale;
  const defaultPriorityTones = userTier === "pro"
    ? DEFAULT_PRO_TONES
    : userTier === "free"
      ? FREE_TONES
      : GUEST_TONES;
  const lastUsedTone = recentTones.find((tone) => tone && tone !== activeTone);
  const contextualTones = [];
  const addContextual = (tone) => {
    if (!tone || contextualTones.includes(tone)) return;
    contextualTones.push(tone);
  };

  addContextual(activeTone);
  favourites.forEach(addContextual);
  addContextual(lastUsedTone);

  const hasMeaningfulContext = favourites.length > 0 || !!lastUsedTone;
  const defaultRowSource = priorityTonesOverride?.length
    ? priorityTonesOverride
    : userTier === "pro"
      ? [activeTone, ...defaultPriorityTones, ...FREE_TONES, ...ALL_TONES]
      : userTier === "free"
        ? [activeTone, ...FREE_TONES, ...ALL_TONES]
        : [activeTone, ...GUEST_TONES, ...FREE_TONES, ...ALL_TONES];
  const defaultRowTones = [];
  defaultRowSource.forEach((tone) => {
    if (!tone || defaultRowTones.includes(tone)) return;
    defaultRowTones.push(tone);
  });

  const contextualToneSet = new Set(contextualTones);
  const orderedContextualTones = priorityTonesOverride?.length
    ? [
        ...priorityTonesOverride.filter((tone) => contextualToneSet.has(tone)),
        ...contextualTones.filter((tone) => !priorityTonesOverride.includes(tone)),
      ]
    : contextualTones;
  const maxResultsRowTones = favourites.length >= 5 ? 6 : 5;
  const limitedResultsRowTones = (() => {
    const next = [];
    const add = (tone) => {
      if (!tone || next.includes(tone) || next.length >= maxResultsRowTones) return;
      next.push(tone);
    };

    add(activeTone);
    orderedContextualTones.forEach(add);
    defaultPriorityTones.forEach(add);
    defaultRowTones.forEach(add);
    return next;
  })();
  const rowTones = isHomeScreen
    ? (hasMeaningfulContext ? orderedContextualTones : defaultRowTones.slice(0, 5))
    : limitedResultsRowTones;
  const shouldShowStrengthControl = typeof showStrengthControl === "boolean" ? showStrengthControl : !isHomeScreen;

  useEffect(() => {
    if (isHomeScreen) return;
    if (!scrollerRef.current || !activePillRef.current) return;
    activePillRef.current.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "center",
    });
  }, [activeTone, rowTones.join("|"), isHomeScreen]);

  const pills = rowTones.map((tone) => ({ tone, level: 1, type: "tone" }));
  const levelOptions = [
    { level: 1, label: copy.t("toneRow.light") },
    { level: 2, label: copy.t("toneRow.medium") },
    { level: 3, label: copy.t("toneRow.strong") },
  ];

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
          <div style={{
            display: "flex",
            flexWrap: "nowrap",
            gap: 6,
            overflowX: "auto",
            scrollbarWidth: "none",
            opacity: disabled ? 0.2 : 1,
            paddingBottom: 2,
            paddingTop: 10,
            paddingRight: 2,
          }} ref={scrollerRef}>
            {showTranslateOnlyChip && (
              <button
                onClick={() => {
                  if (disabled) return;
                  onSelectTranslateOnly?.();
                }}
                style={{
                  flexShrink: 0,
                  padding: "7px 13px",
                  borderRadius: 18,
                  border: `1.5px solid ${translateOnlyActive ? t.border : t.border2}`,
                  background: translateOnlyActive ? t.surface2 : "transparent",
                  color: translateOnlyActive ? t.text : t.textDim,
                  fontSize: 12,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.18s",
                  fontFamily: "'Lora',Georgia,serif",
                }}
              >
                Translate only
              </button>
            )}
            {pills.map((pill, index) => {
              const status = getToneStatus(pill.tone, userTier);
              const isFavourite = favourites.includes(pill.tone);
              const isActive = pill.tone === activeTone;
              const label = getLocalizedToneName(pill.tone, locale);
              const showProBadge = PRO_TONES.includes(pill.tone);
              const heartRight = showProBadge ? 18 : 6;
              const borderColor = isActive ? t.accent : status !== "unlocked" ? t.border : t.border2;
              const textColor = isActive ? t.accentText : status !== "unlocked" ? t.textFaint : t.textMuted;

              const handleClick = () => {
                if (disabled) return;
                if (status !== "unlocked") {
                  navigate(status === "free_locked" ? "signin_tone" : { screen: "upgrade", context: "tone" });
                  return;
                }
                onSelect(pill.tone);
              };

              return (
                <button
                  key={`${pill.tone}-${pill.level}-${index}`}
                  ref={isActive ? activePillRef : null}
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
                      {copy.t("toneRow.free")}
                    </span>
                  )}
                  {(status === "pro_locked" || (userTier === "pro" && showProBadge)) && (
                    <span style={{ position: "absolute", top: -8, right: -3, background: t.proTag, color: "#000", fontSize: 6, padding: "2px 4px", borderRadius: 4, fontWeight: "bold", lineHeight: 1.3, whiteSpace: "nowrap", zIndex: 10 }}>
                      {copy.t("toneRow.pro")}
                    </span>
                  )}
                  {isFavourite && status === "unlocked" && (
                    <span style={{ position: "absolute", top: -3, right: heartRight, zIndex: 11, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
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
          {copy.t("toneRow.more")}
        </button>
      </div>

      {shouldShowStrengthControl && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
          <div style={{ width: "100%", maxWidth: 236 }}>
            <div style={{ textAlign: "center", fontSize: 9, color: t.textDim, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
              {copy.t("toneRow.toneStrength")}
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
              opacity: disabled || strengthDisabled ? 0.45 : 1,
            }}>
              {levelOptions.map((option) => {
                const isActive = toneCount === option.level;
                return (
                  <button
                    key={option.level}
                    onClick={() => {
                      if (disabled || strengthDisabled) return;
                      onSetLevel(option.level);
                    }}
                    style={{
                      border: "none",
                      borderRadius: 9,
                      background: isActive ? t.surface2 : "transparent",
                      color: isActive ? t.text : t.textFaint,
                      padding: "7px 4px",
                      fontSize: 10,
                      cursor: disabled || strengthDisabled ? "default" : "pointer",
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
