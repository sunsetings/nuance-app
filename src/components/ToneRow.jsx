import { useState, useRef, useEffect } from "react";
import { THEMES, FREE_TONES, ALL_TONES, MAX_SAME_TONE } from "../lib/constants.js";

const LS_TONE_ORDER = "tonara_toneOrder";

function loadOrder() {
  try {
    const stored = localStorage.getItem(LS_TONE_ORDER);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge: keep stored order, append any new tones not yet in stored
      const merged = [
        ...parsed.filter(t => ALL_TONES.includes(t)),
        ...ALL_TONES.filter(t => !parsed.includes(t)),
      ];
      return merged;
    }
  } catch {}
  return [...ALL_TONES];
}

function saveOrder(order) {
  try { localStorage.setItem(LS_TONE_ORDER, JSON.stringify(order)); } catch {}
}

export function ToneRow({ activeTone, toneCount, onSelect, onSetLevel, isPremium, disabled, isHomeScreen = false, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  const [toneOrder, setToneOrder] = useState(loadOrder);
  const [dragging, setDragging] = useState(null); // index being dragged
  const [dragOver, setDragOver] = useState(null); // index being hovered
  const longPressTimer = useRef(null);
  const isDraggingRef = useRef(false);

  // Keep order up to date if ALL_TONES changes (e.g. new tones added)
  useEffect(() => {
    setToneOrder(loadOrder());
  }, []);

  const startLongPress = (index) => {
    longPressTimer.current = setTimeout(() => {
      isDraggingRef.current = true;
      setDragging(index);
    }, 500);
  };

  const cancelLongPress = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = "move";
    setDragging(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (index !== dragging) setDragOver(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (dragging === null || dragging === index) {
      setDragging(null);
      setDragOver(null);
      return;
    }
    const newOrder = [...toneOrder];
    const [moved] = newOrder.splice(dragging, 1);
    newOrder.splice(index, 0, moved);
    setToneOrder(newOrder);
    saveOrder(newOrder);
    setDragging(null);
    setDragOver(null);
    isDraggingRef.current = false;
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
    isDraggingRef.current = false;
  };

  const pills = [];

  toneOrder.forEach((tone, index) => {
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
          locked: false, tappable, index,
          onClick: () => {
            if (disabled || isDraggingRef.current) return;
            if (isPast) { onSetLevel(lvl); return; }
            if (isNext && !isMaxed) { onSelect(tone); }
          },
        });
      }
    } else {
      pills.push({
        key: tone, label: tone,
        active: isActive, past: false, next: false, maxed: false,
        locked: isLocked, index,
        tappable: !disabled && !isLocked,
        onClick: () => {
          if (disabled || isDraggingRef.current) return;
          if (!disabled && !isLocked) onSelect(tone);
        },
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
        {pills.map((p, i) => (
          <button
            key={p.key}
            onClick={p.onClick}
            draggable={!disabled}
            onMouseDown={() => startLongPress(p.index)}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={() => startLongPress(p.index)}
            onTouchEnd={cancelLongPress}
            onDragStart={e => handleDragStart(e, p.index)}
            onDragOver={e => handleDragOver(e, p.index)}
            onDrop={e => handleDrop(e, p.index)}
            onDragEnd={handleDragEnd}
            style={{
              flexShrink: 0,
              padding: p.locked ? "7px 18px 7px 13px" : "7px 13px",
              borderRadius: 20,
              border: `1.5px solid ${dragOver === p.index ? t.accent : getBorder(p)}`,
              background: p.active ? t.accent : dragging === p.index ? t.surface2 : "transparent",
              color: getColor(p),
              fontSize: 12, fontFamily: "'Lora',Georgia,serif",
              cursor: dragging !== null ? "grabbing" : p.tappable ? "pointer" : "default",
              transition: "all 0.18s", whiteSpace: "nowrap",
              opacity: dragging === p.index ? 0.5 : 1,
              position: "relative",
              transform: dragOver === p.index ? "scale(1.05)" : "scale(1)",
            }}
          >
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

      {/* Bottom hints row */}
      {!disabled && (
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: 4, paddingRight: 2,
          position: "relative", zIndex: 2,
        }}>
          <span style={{
            fontSize: 9, color: t.swipeHint,
            letterSpacing: "0.08em", fontWeight: "500",
            fontFamily: "'Lora',Georgia,serif",
          }}>hold to rearrange</span>
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
