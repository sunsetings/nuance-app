import { useState, useRef, useEffect } from "react";
import { THEMES, FREE_TONES, ALL_TONES, MAX_SAME_TONE } from "../lib/constants.js";

const LS_TONE_ORDER = "tonara_toneOrder";

function loadOrder() {
  try {
    const stored = localStorage.getItem(LS_TONE_ORDER);
    if (stored) {
      const parsed = JSON.parse(stored);
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
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const containerRef = useRef(null);
  const longPressTimer = useRef(null);
  const touchDragActive = useRef(false);
  const touchStartIndex = useRef(null);
  const pillRefs = useRef([]);

  useEffect(() => {
    setToneOrder(loadOrder());
  }, []);

  // ── Desktop drag handlers ──────────────────────────────────
  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggingIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (index !== draggingIndex) setDragOverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) {
      setDraggingIndex(null); setDragOverIndex(null); return;
    }
    const newOrder = [...toneOrder];
    const [moved] = newOrder.splice(draggingIndex, 1);
    newOrder.splice(index, 0, moved);
    setToneOrder(newOrder);
    saveOrder(newOrder);
    setDraggingIndex(null); setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null); setDragOverIndex(null);
  };

  // ── Touch drag handlers ────────────────────────────────────
  const handleTouchStart = (e, index) => {
    if (disabled) return;
    touchStartIndex.current = index;
    touchDragActive.current = false;
    longPressTimer.current = setTimeout(() => {
      touchDragActive.current = true;
      setDraggingIndex(index);
      // Haptic feedback if available
      if (navigator.vibrate) navigator.vibrate(40);
    }, 500);
  };

  const handleTouchMove = (e) => {
    if (!touchDragActive.current) {
      clearTimeout(longPressTimer.current);
      return;
    }
    e.preventDefault();
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    pillRefs.current.forEach((ref, index) => {
      if (ref && elements.includes(ref)) {
        if (index !== draggingIndex) setDragOverIndex(index);
      }
    });
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer.current);
    if (touchDragActive.current && draggingIndex !== null && dragOverIndex !== null && draggingIndex !== dragOverIndex) {
      const newOrder = [...toneOrder];
      const [moved] = newOrder.splice(draggingIndex, 1);
      newOrder.splice(dragOverIndex, 0, moved);
      setToneOrder(newOrder);
      saveOrder(newOrder);
    }
    touchDragActive.current = false;
    setDraggingIndex(null);
    setDragOverIndex(null);
    touchStartIndex.current = null;
  };

  // ── Build pills ────────────────────────────────────────────
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
            if (disabled || touchDragActive.current) return;
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
          if (disabled || touchDragActive.current) return;
          if (!isLocked) onSelect(tone);
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
      <div
        ref={containerRef}
        style={{
          display: "flex", gap: 7, overflowX: "auto",
          paddingBottom: 4, paddingTop: 10,
          scrollbarWidth: "none", msOverflowStyle: "none",
          opacity: disabled ? 0.2 : 1, transition: "opacity 0.2s",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {pills.map((p, i) => (
          <button
            key={p.key}
            ref={el => pillRefs.current[i] = el}
            onClick={p.onClick}
            draggable={!disabled}
            onDragStart={e => handleDragStart(e, p.index)}
            onDragOver={e => handleDragOver(e, p.index)}
            onDrop={e => handleDrop(e, p.index)}
            onDragEnd={handleDragEnd}
            onTouchStart={e => handleTouchStart(e, p.index)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              flexShrink: 0,
              padding: p.locked ? "7px 18px 7px 13px" : "7px 13px",
              borderRadius: 20,
              border: `1.5px solid ${dragOverIndex === p.index ? t.accent : getBorder(p)}`,
              background: p.active ? t.accent : draggingIndex === p.index ? t.surface2 : "transparent",
              color: getColor(p),
              fontSize: 12, fontFamily: "'Lora',Georgia,serif",
              cursor: draggingIndex !== null ? "grabbing" : p.tappable ? "pointer" : "default",
              transition: "all 0.18s", whiteSpace: "nowrap",
              opacity: draggingIndex === p.index ? 0.5 : 1,
              position: "relative",
              transform: dragOverIndex === p.index ? "scale(1.05)" : "scale(1)",
              userSelect: "none", WebkitUserSelect: "none",
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

      {/* Bottom hints */}
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
