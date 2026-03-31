import { useState } from "react";
import { THEMES, FREE_DAILY_CAP, FREE_SAVE_LIMIT, GUEST_DAILY_CAP, PRO_DAILY_CAP } from "../lib/constants.js";

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
      border: `8px solid ${t.surface2}`,
      boxShadow: theme === "light"
        ? "0 0 0 1px #bbb,0 40px 80px rgba(0,0,0,0.12)"
        : "0 0 0 1px #222,0 48px 96px rgba(0,0,0,0.9)",
      overflow: "hidden", position: "relative",
      flexShrink: 0, transition: "all 0.3s",
    }}>
      {/* Notch */}
      <div style={{
        position: "absolute", top: 0, left: "50%",
        transform: "translateX(-50%)", width: 120, height: 28,
        background: t.notch, borderRadius: "0 0 18px 18px",
        zIndex: 100, display: "flex", alignItems: "center",
        justifyContent: "center", gap: 7,
      }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: t.border2 }} />
        <div style={{ width: 38, height: 5, borderRadius: 3, background: t.border2 }} />
      </div>
      <div style={{ height: "100%", overflowY: "auto", paddingTop: 30 }}>
        {children}
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ──────────────────────────────────────────────
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

function MicIcon({ size = 15, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 17" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <rect x="5.5" y="1.5" width="5" height="8" rx="2.5" stroke={color} strokeWidth="1.35" fill="none" />
      <path d="M3 9C3 11.761 5.239 14 8 14C10.761 14 13 11.761 13 9" stroke={color} strokeWidth="1.35" strokeLinecap="round" fill="none" />
      <line x1="8" y1="14" x2="8" y2="15.5" stroke={color} strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

export function BottomNav({ active, navigate, theme, userTier }) {
  const t = THEMES[theme] || THEMES.dark;
  const isGuest = userTier === "guest";
  return (
    <div style={{
      display: "flex",
      paddingTop: 10, paddingBottom: 2,
      borderTop: `1px solid ${t.borderLight}`, marginTop: 14,
    }}>
      {[
        { id: "home", icon: "⌂", label: "Home" },
        { id: "saved", icon: "♥", label: "Saved", heart: true },
        { id: "account", icon: "◎", label: isGuest ? "Sign in" : "Account" },
      ].map(item => (
        <button key={item.id} onClick={() => navigate(isGuest && item.id === "account" ? "account" : item.id)} style={{
          flex: 1,
          background: "none", border: "none", cursor: "pointer",
          color: active === item.id ? t.accent : t.textDim,
          fontSize: 9, display: "flex", flexDirection: "column",
          alignItems: "center", gap: 3, transition: "color 0.15s",
          letterSpacing: "0.06em", textTransform: "uppercase",
          fontFamily: "'Lora',Georgia,serif",
          minWidth: 0,
          padding: "0 4px",
        }}>
          <span style={{ height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {item.heart ? (
              <SmallHeart size={16} color={active === item.id ? t.accent : t.textDim} filled={active === item.id} />
            ) : (
              <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
            )}
          </span>
          <span style={{ display: "block", width: "100%", textAlign: "center", lineHeight: 1.2 }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── COPY BUTTON ─────────────────────────────────────────────
export function CopyBtn({ text, theme, variant = "default" }) {
  const t = THEMES[theme] || THEMES.dark;
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (text) navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  if (variant === "inline") {
    return (
      <button onClick={handleCopy} style={{
        background: "none",
        border: "none",
        padding: 0,
        color: copied ? t.accent : t.textFaint,
        fontSize: 10,
        cursor: "pointer",
        transition: "color 0.15s",
        whiteSpace: "nowrap",
        fontFamily: "'Lora',Georgia,serif",
        letterSpacing: "0.04em",
      }}>
        {copied ? "✓ Copied" : "Copy"}
      </button>
    );
  }
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
export function MicButton({ userTier, onDictate, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  const isPro = userTier === "pro";
  const [listening, setListening] = useState(false);
  const handleTap = () => {
    if (!isPro) { onDictate("upgrade"); return; }
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
        width: 34, height: 34, borderRadius: "50%",
        background: "transparent",
        border: `1px solid ${listening ? t.accent : isPro ? t.border : t.borderLight}`,
        color: listening ? t.accent : isPro ? t.textDim : t.textFaint,
        fontSize: 16, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s", position: "relative",
        boxShadow: listening ? `0 0 0 3px ${t.highlight}` : "none",
      }}>
        <MicIcon size={15} color={listening ? t.accentText : isPro ? t.textDim : t.textFaint} />
        {!isPro && (
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
        transition: "color 0.2s", height: 9,
        fontFamily: "'Lora',Georgia,serif",
      }}>
        {listening ? "listening…" : "​"}
      </span>
    </div>
  );
}

// ─── SHARE + SAVE ROW ────────────────────────────────────────
export function ShareSaveRow({ userTier, saved, onSave, onShare, navigate, saveCount = 0, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  const handleSave = () => {
    if (userTier === "guest") {
      navigate("account");
      return;
    }
    if (userTier === "free" && saveCount >= FREE_SAVE_LIMIT) {
      navigate("upgrade");
      return;
    }
    onSave();
  };
  const saveLabel = userTier === "guest" ? "Sign in to save" : saved ? "Saved" : `Save${userTier === "free" ? ` (${saveCount}/${FREE_SAVE_LIMIT})` : ""}`;
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
      <button onClick={onShare} style={{
        flex: 1, padding: "11px", background: "transparent",
        border: `1px solid ${t.border}`, borderRadius: 10,
        color: t.textDim, fontSize: 12,
        fontFamily: "'Lora',Georgia,serif", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        <span style={{ fontSize: 13 }}>↗</span> Share
      </button>
      <button
        onClick={handleSave}
        style={{
          flex: 1, padding: "11px",
          background: saved ? t.highlight : "transparent",
          border: `1px solid ${saved ? t.highlightBorder : t.border}`,
          borderRadius: 10, color: saved ? t.highlightText : t.textDim,
          fontSize: userTier === "guest" ? 10 : 12, fontFamily: "'Lora',Georgia,serif",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 7, transition: "all 0.2s",
        }}>
        <SmallHeart size={14} color={saved ? t.accent : t.textFaint} filled={saved} />
        <span>{saveLabel}</span>
      </button>
    </div>
  );
}

// ─── REFINE COUNTER (top right, free tier) ───────────────────
export function RefineCounter({ usageCount, userTier, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  if (userTier === "pro") return null;
  const cap = userTier === "free" ? FREE_DAILY_CAP : GUEST_DAILY_CAP;
  const remaining = Math.max(0, cap - usageCount);
  const pct = usageCount / cap;
  let color = t.cOk;
  if (pct >= 0.85) color = t.cCrit;
  else if (pct >= 0.6) color = t.cWarn;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
      <span style={{ fontSize: 10, color, transition: "color 0.3s", letterSpacing: "0.04em" }}>
        {remaining} of {cap} refines
      </span>
      {remaining <= 3 && (
        <span style={{ fontSize: 9, color: t.proTag }}>
          {userTier === "guest" ? "· sign up for more" : "· upgrade for 500"}
        </span>
      )}
    </div>
  );
}
