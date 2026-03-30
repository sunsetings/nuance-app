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
  const stateRef = useRef({
    draggingIndex: null,
    dragOverIndex: null,
    toneOrder: loadOrder(),
    longPressTimer: null,
    touchDragActive: false,
    touchStartX: null,
    touchStartY: null,
  });

  useEffect(() => {
    setToneOrder(loadOrder());
  }, []);

  useEffect(() => { stateRef.current.toneOrder = toneOrder; }, [toneOrder]);
  useEffect(() => { stateRef.current.draggingIndex = draggingIndex; }, [draggingIndex]);
  useEffect(() => { stateRef.current.dragOverIndex = dragOverIndex; }, [dragOverIndex]);

  // Non-passive touchmove attached directly to DOM
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchMove = (e) => {
      const touch = e.touches[0];
      if (!stateRef.current.touchDragActive) {
        if (stateRef.current.touchStartX === null) {
          stateRef.current.touchStartX = touch.clientX;
          stateRef.current.touchStartY = touch.clientY;
        }
        const dx = Math.abs(touch.clientX - stateRef.current.touchStartX);
        const dy = Math.abs(touch.clientY - stateRef.current.touchStartY);
        if (dx > 8 || dy > 8) {
          clearTimeout(stateRef.current.longPressTimer);
        }
        return;
      }
      e.preventDefault();
      const els = document.elementsFromPoint(touch.clientX, touch.clientY);
      els.forEach(target => {
        const idx = target.dataset?.pillIndex;
        if (idx !== undefined) {
          const i = parseInt(idx);
          if (i !== stateRef.current.draggingIndex) {
            stateRef.current.dragOverIndex = i;
            setDragOverIndex(i);
          }
        }
      });
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, []);

  const handleTouchStart = (index) => {
    if (disabled) return;
    stateRef.current.touchDragActive = false;
    stateRef.current.touchStartX = null;
    stateRef.current.touchStartY = null;
    clearTimeout(stateRef.current.longPressTimer);
    stateRef.current.longPressTimer = setTimeout(() => {
      stateRef.current.touchDragActive = true;
      stateRef.current.draggingIndex = index;
      setDraggingIndex(index);
      if (navigator.vibrate) navigator.vibrate(40);
    }, 400);
  };

  const handleTouchEnd = () => {
    clearTimeout(stateRef.current.longPressTimer);
    const { touchDragActive, draggingIndex: di, dragOverIndex: doi, toneOrder: order } = stateRef.current;
    if (touchDragActive && di !== null && doi !== null && di !== doi) {
      const newOrder = [...order];
      const [moved] = newOrder.splice(di, 1);
      newOrder.splice(doi, 0, moved);
      setToneOrder(newOrder);
      saveOrder(newOrder);
    }
    stateRef.current.touchDragActive = false;
    stateRef.current.draggingIndex = null;
    stateRef.current.dragOverIndex = null;
    stateRef.current.touchStartX = null;
    stateRef.current.touchStartY = null;
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const handleTouchCancel = () => {
    clearTimeout(stateRef.current.longPressTimer);
    stateRef.current.touchDragActive = false;
    stateRef.current.draggingIndex = null;
    stateRef.current.dragOverIndex = null;
    stateRef.current.touchStartX = null;
    stateRef.current.touchStartY = null;
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  // Desktop drag
  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggingIndex(index);
  };
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (index !== stateRef.current.draggingIndex) setDragOverIndex(index);
  };
  const handleDrop = (e, index) => {
    e.preventDefault();
    const di = stateRef.current.draggingIndex;
    if (di === null || di === index) { setDraggingIndex(null); setDragOverIndex(null); return; }
    const newOrder = [...toneOrder];
    const [moved] = newOrder.splice(di, 1);
    newOrder.splice(index, 0, moved);
    setToneOrder(newOrder);
    saveOrder(newOrder);
    setDraggingIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => { setDraggingIndex(null); setDragOverIndex(null); };

  // Build pills
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
            if (disabled || stateRef.current.touchDragActive) return;
            if (isPast) { onSetLevel(lvl); return; }
            if (isNext && !isMaxed) onSelect(tone);
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
          if (disabled || stateRef.current.touchDragActive) return;
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
            data-pill-index={p.index}
            onClick={p.onClick}
            draggable={!disabled}
            onDragStart={e => handleDragStart(e, p.index)}
            onDragOver={e => handleDragOver(e, p.index)}
            onDrop={e => handleDrop(e, p.index)}
            onDragEnd={handleDragEnd}
            onTouchStart={() => handleTouchStart(p.index)}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
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
              touchAction: "pan-x",
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

      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 4, width: 72,
        background: `linear-gradient(to right, transparent, ${t.phoneBg})`,
        pointerEvents: "none",
      }} />

      {!disabled && (
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: 4, paddingRight: 2, position: "relative", zIndex: 2,
        }}>
          <span style={{ fontSize: 9, color: t.swipeHint, letterSpacing: "0.08em", fontWeight: "500", fontFamily: "'Lora',Georgia,serif" }}>hold to rearrange</span>
          <span style={{ fontSize: 9, color: t.swipeHint, letterSpacing: "0.08em", fontWeight: "500", fontFamily: "'Lora',Georgia,serif" }}>swipe for more →</span>
        </div>
      )}
    </div>
  );
}
