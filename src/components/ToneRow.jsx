import { THEMES, FREE_TONES, ALL_TONES, MAX_SAME_TONE } from "../lib/constants.js";

/**
 * ToneRow
 * -------
 * Renders the scrollable row of tone pills.
 *
 * Smart ordering: recently used tones float to the front.
 * Bidirectional: past pills (lower levels) are tappable to go back down.
 * PRO badge floats above locked pills.
 */
export function ToneRow({ activeTone, toneCount, onSelect, onSetLevel, isPremium, disabled, isHomeScreen = false, recentTones = [], theme }) {
  const t = THEMES[theme] || THEMES.dark;

  // Smart ordering — recent tones first, then free tones, then pro tones
  const orderedTones = [
    ...recentTones.filter(tone => ALL_TONES.includes(tone)),
    ...ALL_TONES.filter(tone => !recentTones.includes(tone)),
  ];
  // Deduplicate
  const uniqueTones = [...new Set(orderedTones)];

  const pills = [];

  uniqueTones.forEach(tone => {
    const isActive = tone === activeTone;
    const isLocked = !isPremium && !FREE_TONES.includes(tone);

    if (isActive && !isHomeScreen) {
      const showUpTo = Math.min(toneCount + 1, MAX_SAME_TONE);
      for (let lvl = 1; lvl <= showUpTo; lvl++) {
        const isCurrent = lvl === toneCount;
        const isNext = lvl === toneCount + 1;
        const isPast = lvl < toneCount;
        const isMaxed = toneCount >= MAX_SAME_TONE && isCurrent;
        const tappable = !disabled && ((isNext && !isMaxed) || isPast);

        pills.push({
          key: `${tone}-${lvl}`,
          label: lvl === 1 ? tone : `${tone} ×${lvl}`,
          active: isCurrent, past: isPast, next: isNext, maxed: isMaxed,
          locked: false, tappable,
          onClick: () => {
            if (disabled) return;
            if (isPast) { onSetLevel(lvl); return; }
            if (isNext && !isMaxed) { onSelect(tone); }
          },
        });
      }
    } else {
      pills.push({
        key: tone, label: tone,
        active: isActive, past: false, next: false, maxed: false,
        locked: isLocked,
        tappable: !disabled && !isLocked,
        onClick: () => { if (!disabled && !isLocked) onSelect(tone); },
      });
    }
  });

  const getBorder = p => {
    if (p.active) return t.accent;
    if (p.next) return t.highlightBorder;
    if (p.past) return t.border2;
    if (p.maxed || p.locked) return t.border;
    return t.border2;
  };

  const getColor = p => {
    if (p.active) return t.accentText;
    if (p.next) return theme === "light" ? "#2a6a2a" : "#8adc8a";
    if (p.past) return t.textMuted;
    if (p.maxed) return t.textFaint;
    if (p.locked) return t.textDim;
    return t.textMuted;
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        display: "flex", gap: 7, overflowX: "auto",
        paddingBottom: 4, paddingTop: 10,
        scrollbarWidth: "none", msOverflowStyle: "none",
        opacity: disabled ? 0.2 : 1, transition: "opacity 0.2s",
        WebkitOverflowScrolling: "touch",
      }}>
        {pills.map(p => (
          <button key={p.key} onClick={p.onClick} style={{
            flexShrink: 0,
            padding: p.locked ? "7px 18px 7px 13px" : "7px 13px",
            borderRadius: 20,
            border: `1.5px solid ${getBorder(p)}`,
            background: p.active ? t.accent : "transparent",
            color: getColor(p),
            fontSize: 12, fontFamily: "'Lora',Georgia,serif",
            cursor: p.tappable ? "pointer" : "default",
            transition: "all 0.18s", whiteSpace: "nowrap",
            opacity: 1, position: "relative",
          }}>
            {p.label}
            {p.locked && (
              <span style={{
                position: "absolute", top: -7, right: -2,
                background: t.proTag, color: "#000",
                fontSize: 7, padding: "2px 5px", borderRadius: 6,
                fontWeight: "bold", lineHeight: 1.2, whiteSpace: "nowrap",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}>PRO</span>
            )}
          </button>
        ))}
        <div style={{ flexShrink: 0, width: 52 }} />
      </div>
      {/* Right fade */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 4, width: 72,
        background: `linear-gradient(to right, transparent, ${t.phoneBg})`,
        pointerEvents: "none",
      }} />
      {!disabled && (
        <div style={{
          display: "flex", justifyContent: "flex-end",
          marginTop: 4, paddingRight: 2,
          position: "relative", zIndex: 2,
        }}>
          <span style={{
            fontSize: 9, color: t.swipeHint,
            letterSpacing: "0.08em", fontWeight: "500",
            fontFamily: "'Lora',Georgia,serif",
          }}>swipe for more →</span>
        </div>
      )}
    </div>
  );
}
