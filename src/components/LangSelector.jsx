import { useState, useEffect, useRef } from "react";
import { THEMES, ALL_LANGUAGES } from "../lib/constants.js";

export function LangSelector({ label, value, onChange, bookmarked, onToggleBookmark, bookmarkLimit, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  const canAdd = bookmarked.length < bookmarkLimit;

  // Bookmarked languages float to the top, rest alphabetical
  const sorted = [...ALL_LANGUAGES].sort((a, b) => {
    const aB = bookmarked.includes(a), bB = bookmarked.includes(b);
    if (aB && !bB) return -1;
    if (!aB && bB) return 1;
    return a.localeCompare(b);
  });

  return (
    <div ref={ref} style={{ flex: 1, position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", background: "transparent", border: "none",
          color: t.text, fontSize: 13, fontFamily: "'Lora',Georgia,serif",
          cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", gap: 4,
        }}>
        <span style={{ flex: 1, textAlign: label === "TO" ? "right" : "left" }}>{value}</span>
        {bookmarked.includes(value) && <span style={{ fontSize: 9, color: t.proTag }}>♥</span>}
        <span style={{ color: t.textDim, fontSize: 9 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 10px)",
          left: label === "TO" ? "auto" : "-14px",
          right: label === "TO" ? "-14px" : "auto",
          width: 220,
          background: theme === "light" ? "#fff" : "#1c1c1c",
          border: `1px solid ${t.border2}`,
          borderRadius: 14, zIndex: 400, overflow: "hidden",
          boxShadow: theme === "light" ? "0 8px 24px rgba(0,0,0,0.12)" : "0 12px 32px rgba(0,0,0,0.6)",
        }}>
          {/* Bookmark counter */}
          <div style={{
            padding: "9px 14px 8px",
            borderBottom: `1px solid ${t.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.1em" }}>
              ♥ {bookmarked.length}/{bookmarkLimit} bookmarks used
            </span>
            {!canAdd && <span style={{ fontSize: 9, color: t.proTag }}>limit reached</span>}
          </div>

          <div style={{ maxHeight: 230, overflowY: "auto" }}>
            {sorted.map((lang, i) => {
              const isB = bookmarked.includes(lang), isSel = lang === value;
              const isFirst = !isB && i > 0 && bookmarked.includes(sorted[i - 1]);
              return (
                <div key={lang}>
                  {isFirst && bookmarked.length > 0 && (
                    <div style={{ height: 1, background: t.border, margin: "0 12px" }} />
                  )}
                  <div style={{
                    display: "flex", alignItems: "center", padding: "9px 14px",
                    background: isSel ? t.surface2 : "transparent",
                  }}>
                    <button
                      onClick={() => { onChange(lang); setOpen(false); }}
                      style={{
                        flex: 1, background: "none", border: "none",
                        color: isSel ? t.accent : t.textMuted,
                        fontSize: 13, fontFamily: "'Lora',Georgia,serif",
                        cursor: "pointer", textAlign: "left",
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                      {isB && <span style={{ fontSize: 9, color: t.proTag }}>♥</span>}
                      {lang}
                    </button>
                    <button
                      onClick={() => { if (isB || canAdd) onToggleBookmark(lang); }}
                      style={{
                        background: "none", border: "none",
                        color: isB ? t.proTag : canAdd ? t.textDim : t.border,
                        fontSize: 15,
                        cursor: (isB || canAdd) ? "pointer" : "default",
                        padding: "0 2px",
                      }}>
                      {isB ? "♥" : "♡"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
