import { useState } from "react";
import { THEMES } from "../lib/constants.js";

// ─── TOAST ───────────────────────────────────────────────────
export function Toast({ message, visible, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  return (
    <div style={{
      position: "absolute", bottom: 80, left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : 16}px)`,
      background: theme === "light" ? "#1a1a0a" : "#f5f1e8",
      color: theme === "light" ? "#f5f1e8" : "#1a1a0a",
      padding: "10px 20px", borderRadius: 24, fontSize: 12,
      fontFamily: "'Lora',Georgia,serif", whiteSpace: "nowrap",
      opacity: visible ? 1 : 0, transition: "all 0.3s ease",
      zIndex: 500, pointerEvents: "none",
      boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ color: t.accent }}>♥</span>{message}
    </div>
  );
}

// ─── SHARE SHEET ─────────────────────────────────────────────
export function ShareSheet({ visible, onClose, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  if (!visible) return null;
  const options = [
    { icon: "💬", label: "Messages" },
    { icon: "💚", label: "WhatsApp" },
    { icon: "✉️", label: "Mail" },
    { icon: "📋", label: "Copy all" },
    { icon: "🔵", label: "Telegram" },
    { icon: "📤", label: "More…" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 600, display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ background: "rgba(0,0,0,0.5)", position: "absolute", inset: 0 }} />
      <div onClick={e => e.stopPropagation()} style={{
        position: "relative",
        background: theme === "light" ? "#faf8f3" : "#1c1c1c",
        borderRadius: "20px 20px 0 0", padding: "20px 20px 32px",
        borderTop: `1px solid ${t.border2}`,
      }}>
        <div style={{ width: 36, height: 4, background: t.border2, borderRadius: 2, margin: "0 auto 18px" }} />
        <div style={{ fontSize: 11, color: t.textDim, letterSpacing: "0.1em", marginBottom: 14 }}>SHARE VIA</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {options.map(opt => (
            <button key={opt.label} onClick={onClose} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "12px 10px", background: t.surface2, border: `1px solid ${t.border}`,
              borderRadius: 14, cursor: "pointer", minWidth: 70, flex: 1,
            }}>
              <span style={{ fontSize: 22 }}>{opt.icon}</span>
              <span style={{ fontSize: 10, color: t.textMuted, fontFamily: "'Lora',Georgia,serif" }}>{opt.label}</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{
          width: "100%", marginTop: 14, padding: "12px",
          background: "transparent", border: `1px solid ${t.border}`,
          borderRadius: 12, color: t.textMuted, fontSize: 13,
          fontFamily: "'Lora',Georgia,serif", cursor: "pointer",
        }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── PHONE FRAME ─────────────────────────────────────────────
export function PhoneFrame({ children, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  return (
    <div style={{
      width: 375, height: 780,
      background: t.phoneBg, borderRadius: 44,
      border: `10px solid ${t.surface2}`,
      boxShadow: theme === "light"
        ? "0 0 0 1px #bbb,0 40px 80px rgba(0,0,0,0.15)"
        : "0 0 0 1px #333,0 48px 96px rgba(0,0,0,0.8)",
      overflow: "hidden", position: "relative",
      flexShrink: 0, transition: "all 0.3s",
    }}>
      {/* Notch */}
      <div style={{
        position: "absolute", top: 0, left: "50%",
        transform: "translateX(-50%)", width: 126, height: 30,
        background: t.notch, borderRadius: "0 0 20px 20px",
        zIndex: 100, display: "flex", alignItems: "center",
        justifyContent: "center", gap: 7,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.border2 }} />
        <div style={{ width: 42, height: 6, borderRadius: 4, background: t.border2 }} />
      </div>
      <div style={{ height: "100%", overflowY: "auto", paddingTop: 32 }}>
        {children}
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ──────────────────────────────────────────────
export function BottomNav({ active, navigate, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  return (
    <div style={{
      display: "flex", justifyContent: "space-around",
      paddingTop: 10, paddingBottom: 2,
      borderTop: `1px solid ${t.border}`, marginTop: 12,
    }}>
      {[
        { id: "home", icon: "⌂", label: "Home" },
        { id: "saved", icon: "♥", label: "Saved" },
        { id: "account", icon: "◎", label: "Account" },
      ].map(item => (
        <button key={item.id} onClick={() => navigate(item.id)} style={{
          background: "none", border: "none", cursor: "pointer",
          color: active === item.id ? t.accent : t.textDim,
          fontSize: 10, display: "flex", flexDirection: "column",
          alignItems: "center", gap: 3, transition: "color 0.15s",
          fontFamily: "'Lora',Georgia,serif",
        }}>
          <span style={{ fontSize: item.id === "saved" ? 19 : 17 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ─── COPY BUTTON ─────────────────────────────────────────────
export function CopyBtn({ text, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (text) navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} style={{
      background: "none",
      border: `1px solid ${copied ? t.highlightBorder : t.border2}`,
      borderRadius: 5, padding: "2px 8px",
      color: copied ? t.accent : t.textMuted,
      fontSize: 10, cursor: "pointer",
      transition: "all 0.15s", whiteSpace: "nowrap",
      fontFamily: "'Lora',Georgia,serif",
    }}>
      {copied ? "✓" : "Copy"}
    </button>
  );
}

// ─── MIC BUTTON ──────────────────────────────────────────────
export function MicButton({ isPremium, onDictate, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  const [listening, setListening] = useState(false);
  const handleTap = () => {
    if (!isPremium) { onDictate("upgrade"); return; }
    if (listening) return;
    setListening(true);

    // Use Web Speech API if available
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SR();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setListening(false);
        onDictate(transcript);
      };
      recognition.onerror = () => { setListening(false); };
      recognition.onend = () => { setListening(false); };
      recognition.start();
    } else {
      // Fallback for browsers without speech recognition
      setTimeout(() => {
        setListening(false);
        onDictate("I need this report done by Friday or we'll have a problem.");
      }, 2000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
      <button onClick={handleTap} style={{
        width: 38, height: 38, borderRadius: "50%",
        background: listening ? t.accent : isPremium ? t.surface2 : t.surface,
        border: `1.5px solid ${listening ? t.accent : isPremium ? t.border2 : t.border}`,
        color: listening ? t.accentText : isPremium ? t.textMuted : t.textFaint,
        fontSize: 16, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s", position: "relative",
        boxShadow: listening ? `0 0 0 4px ${t.highlight}` : "none",
      }}>
        🎙
        {!isPremium && (
          <span style={{
            position: "absolute", top: -5, right: -3,
            background: t.proTag, color: "#000",
            fontSize: 6, padding: "1px 4px", borderRadius: 5,
            fontWeight: "bold", lineHeight: 1.3,
          }}>PRO</span>
        )}
      </button>
      <span style={{
        fontSize: 8, color: listening ? t.accent : "transparent",
        letterSpacing: "0.05em", whiteSpace: "nowrap",
        transition: "color 0.2s", height: 10,
        fontFamily: "'Lora',Georgia,serif",
      }}>
        {listening ? "listening…" : "​"}
      </span>
    </div>
  );
}

// ─── SHARE + SAVE ROW ────────────────────────────────────────
export function ShareSaveRow({ isPremium, saved, onSave, onShare, navigate, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
      <button onClick={onShare} style={{
        flex: 1, padding: "12px", background: t.surface,
        border: `1px solid ${t.border}`, borderRadius: 11,
        color: t.textMuted, fontSize: 13,
        fontFamily: "'Lora',Georgia,serif", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        <span style={{ fontSize: 14 }}>↗</span> Share
      </button>
      <button
        onClick={() => { if (!isPremium) { navigate("upgrade"); return; } onSave(); }}
        style={{
          flex: 1, padding: "12px",
          background: saved ? t.highlight : t.surface,
          border: `1px solid ${saved ? t.highlightBorder : t.border}`,
          borderRadius: 11, color: saved ? t.accent : t.textMuted,
          fontSize: 13, fontFamily: "'Lora',Georgia,serif",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 7, transition: "all 0.2s",
        }}>
        <span style={{ fontSize: 22, lineHeight: 1, color: saved ? t.accent : theme === "light" ? "#bbb" : "#666" }}>
          {saved ? "♥" : "♡"}
        </span>
        <span>{saved ? "Saved" : "Save"}</span>
        {!isPremium && (
          <span style={{ fontSize: 8, background: t.proTag, color: "#000", padding: "1px 5px", borderRadius: 4, fontWeight: "bold", marginLeft: 2 }}>PRO</span>
        )}
      </button>
    </div>
  );
}

// ─── REFINE COUNTER (top right, free tier) ───────────────────
export function RefineCounter({ isPremium, usageCount, navigate, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  const FREE_DAILY_CAP = 30;
  const nearLimit = usageCount >= FREE_DAILY_CAP - 5;

  if (isPremium) {
    return (
      <button onClick={() => navigate("upgrade")} style={{
        background: "transparent",
        border: `1px solid ${t.highlightBorder}`,
        borderRadius: 12, padding: "4px 10px",
        color: t.accent, fontSize: 11,
        fontFamily: "'Lora',Georgia,serif", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 5,
      }}>
        ✦ Pro · 300/day
      </button>
    );
  }

  return (
    <button onClick={() => navigate("upgrade")} style={{
      background: nearLimit ? t.highlight : "transparent",
      border: `1px solid ${nearLimit ? t.highlightBorder : t.border}`,
      borderRadius: 12, padding: "4px 10px",
      color: nearLimit ? t.accent : t.textDim, fontSize: 11,
      fontFamily: "'Lora',Georgia,serif", cursor: "pointer",
      transition: "all 0.2s",
    }}>
      {usageCount}/{FREE_DAILY_CAP} refines
    </button>
  );
}
