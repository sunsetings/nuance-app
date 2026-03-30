import { useState } from "react";
import { THEMES, FREE_DAILY_CAP, PRO_SAVE_LIMIT, PRO_SAVE_WARN, FREE_BOOKMARK_LIMIT, PRO_BOOKMARK_LIMIT } from "../lib/constants.js";
import { BottomNav } from "./UI.jsx";

// ─── ACCOUNT ─────────────────────────────────────────────────
export function AccountScreen({ navigate, isPremium, setIsPremium, theme, setTheme, usageCount, user, onLogout, savedItems }) {
  const t = THEMES[theme] || THEMES.dark;
  const savedCount = savedItems?.length || 0;

  return (
    <div style={{ padding: "14px 20px 8px", fontFamily: "'Lora',Georgia,serif", color: t.text, background: t.phoneBg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, marginTop: 6 }}>
        <button onClick={() => navigate("home")} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 18, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 16, fontWeight: "bold" }}>Account</span>
      </div>

      <div style={{ background: isPremium ? t.highlight : t.surface2, border: `1px solid ${isPremium ? t.highlightBorder : t.border}`, borderRadius: 16, padding: "18px", marginBottom: 14, textAlign: "center" }}>
        <div style={{ fontSize: 26, marginBottom: 6 }}>{isPremium ? "✦" : "◎"}</div>
        <div style={{ fontSize: 15, fontWeight: "bold" }}>{isPremium ? "Pro Member" : "Free Plan"}</div>
        <div style={{ fontSize: 12, color: t.textMuted, marginTop: 3 }}>{user?.email || "user@email.com"}</div>
        {!isPremium && (
          <button onClick={() => navigate("upgrade")} style={{ marginTop: 12, padding: "9px 22px", background: t.accent, color: t.accentText, border: "none", borderRadius: 10, fontSize: 13, fontWeight: "bold", cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>✦ Go Pro →</button>
        )}
      </div>

      {[
        { label: "Daily refines used", value: isPremium ? "Unlimited" : `${usageCount} / ${FREE_DAILY_CAP} today` },
        { label: "Tones available", value: isPremium ? "All 13" : "3 of 16" },
        { label: "Audio dictation 🎙", value: isPremium ? "Enabled" : "Locked", locked: !isPremium },
        { label: "Bookmarked languages", value: isPremium ? `Up to ${PRO_BOOKMARK_LIMIT} total` : `Up to ${FREE_BOOKMARK_LIMIT} total` },
        { label: "Saved favourites", value: isPremium ? `${savedCount} / ${PRO_SAVE_LIMIT}` : "Locked", locked: !isPremium, warn: isPremium && savedCount >= PRO_SAVE_WARN },
      ].map((item, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 13px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13 }}>{item.label}</span>
          <span style={{ fontSize: 13, color: item.locked ? t.textDim : item.warn ? t.proTag : t.accent }}>
            {item.locked ? "🔒 Pro" : item.value}
          </span>
        </div>
      ))}

      <div style={{ height: 1, background: t.border, margin: "14px 0" }} />

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.12em", marginBottom: 7 }}>APP LANGUAGE</div>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: t.textMuted }}>English</span>
          <span style={{ fontSize: 10, color: t.textFaint, fontStyle: "italic" }}>more languages coming soon</span>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.12em", marginBottom: 7 }}>DISPLAY MODE</div>
        <div style={{ display: "flex", background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: 3, gap: 3 }}>
          {[{ id: "dark", icon: "🌙", label: "Dark" }, { id: "light", icon: "☀️", label: "Light" }].map(opt => (
            <button key={opt.id} onClick={() => setTheme(opt.id)} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: "none", background: theme === opt.id ? t.surface2 : "transparent", color: theme === opt.id ? t.text : t.textMuted, fontSize: 11, fontFamily: "'Lora',Georgia,serif", cursor: "pointer", fontWeight: theme === opt.id ? "bold" : "normal", transition: "all 0.15s" }}>
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => setIsPremium(!isPremium)} style={{ width: "100%", padding: "10px", background: t.surface, border: `1px dashed ${t.border2}`, borderRadius: 9, color: t.textMuted, fontSize: 11, cursor: "pointer", fontFamily: "'Lora',Georgia,serif", marginBottom: 4 }}>
        [Demo: Switch to {isPremium ? "Free" : "Pro"} view]
      </button>

      <button onClick={onLogout} style={{ width: "100%", padding: "11px", background: "transparent", border: `1px solid ${t.border}`, borderRadius: 9, color: t.textDim, fontSize: 13, cursor: "pointer", fontFamily: "'Lora',Georgia,serif", marginBottom: 4 }}>
        Sign out
      </button>

      <BottomNav active="account" navigate={navigate} theme={theme} />
    </div>
  );
}

// ─── UPGRADE ─────────────────────────────────────────────────
export function UpgradeScreen({ navigate, setIsPremium, theme, user }) {
  const t = THEMES[theme] || THEMES.dark;
  return (
    <div style={{ padding: "14px 20px 28px", fontFamily: "'Lora',Georgia,serif", color: t.text, background: t.phoneBg }}>
      <button onClick={() => navigate("home")} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 18, cursor: "pointer", marginTop: 6, marginBottom: 16 }}>←</button>

      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ fontSize: 30, marginBottom: 8 }}>✦</div>
        <div style={{ fontSize: 19, fontWeight: "bold", marginBottom: 5 }}>tonara Pro</div>
        <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.65 }}>For people who communicate with precision.</div>
      </div>

      {[
        ["16 tone options", "vs 3 on free — Assertive, Diplomatic, Empathetic + 10 more"],
        ["Unlimited daily use", `Free is capped at ${FREE_DAILY_CAP} refines / day`],
        ["Audio dictation 🎙", "Speak your message instead of typing"],
        [`${PRO_BOOKMARK_LIMIT} bookmarked languages`, `vs ${FREE_BOOKMARK_LIMIT} on free — shared across both selectors`],
        [`Save up to ${PRO_SAVE_LIMIT} favourites`, "All 3 panels saved automatically. Reopen any time to keep refining."],
        ["Ad-free experience", "No banners, no interruptions"],
      ].map(([title, sub], i) => (
        <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
          <span style={{ color: t.accent, marginTop: 1, flexShrink: 0 }}>✓</span>
          <div>
            <div style={{ fontSize: 13 }}>{title}</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{sub}</div>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 18 }}>
        {[
          { label: "Annual", plan: "yearly", price: "$59.99 / year", sub: "Save 37% — best value", highlight: true },
          { label: "Monthly", plan: "monthly", price: "$7.99 / month", sub: null },
        ].map(opt => (
          <button key={opt.label} onClick={async () => {
            const priceId = opt.plan === "yearly"
              ? import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID
              : import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID;
            const res = await fetch("/api/create-checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ priceId, userId: user?.id, userEmail: user?.email }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
          }} style={{ width: "100%", padding: "14px 16px", marginBottom: 8, background: opt.highlight ? t.accent : t.surface, border: `1px solid ${opt.highlight ? t.accent : t.border}`, borderRadius: 12, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Lora',Georgia,serif", color: opt.highlight ? t.accentText : t.textMuted }}>
            <span style={{ fontSize: 13, fontWeight: "bold" }}>{opt.label}</span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13 }}>{opt.price}</div>
              {opt.sub && <div style={{ fontSize: 10, marginTop: 1 }}>{opt.sub}</div>}
            </div>
          </button>
        ))}
        <button onClick={() => navigate("home")} style={{ width: "100%", background: "none", border: "none", color: t.textMuted, fontSize: 12, cursor: "pointer", marginTop: 2, fontFamily: "'Lora',Georgia,serif" }}>
          Continue with free plan
        </button>
      </div>
    </div>
  );
}// ─── SAVED FAVOURITES ────────────────────────────────────────
export function SavedScreen({ navigate, isPremium, theme, onOpenSaved, savedItems, setSavedItems, user }) {
  const t = THEMES[theme] || THEMES.dark;
  const items = savedItems || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <div style={{ padding: "14px 20px 8px", fontFamily: "'Lora',Georgia,serif", color: t.text, background: t.phoneBg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, marginTop: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("home")} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 18, cursor: "pointer" }}>←</button>
          <span style={{ fontSize: 16, fontWeight: "bold" }}>Saved Favourites</span>
        </div>
        {isPremium && <span style={{ fontSize: 10, color: t.textMuted }}>{items.length} / {PRO_SAVE_LIMIT}</span>}
      </div>

      {!isPremium ? (
        <div style={{ textAlign: "center", padding: "36px 16px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>♥</div>
          <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 8 }}>Save your best translations</div>
          <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 6, lineHeight: 1.65 }}>All 3 panels saved automatically — original, refined, and translated.</div>
          <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 20, lineHeight: 1.65 }}>Reopen any time to keep refining. Up to {PRO_SAVE_LIMIT} saves on Pro.</div>
          <button onClick={() => navigate("upgrade")} style={{ padding: "12px 28px", background: t.accent, color: t.accentText, border: "none", borderRadius: 10, fontSize: 13, fontWeight: "bold", cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>✦ Go Pro</button>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "36px 16px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>♡</div>
          <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 8 }}>Nothing saved yet</div>
          <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.65 }}>Tap the heart on any translation to save it here.</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 10, color: t.textDim, marginBottom: 12 }}>Tap any item to reopen and keep refining.</div>
          {items.map(item => (
            <button key={item.id} onClick={() => onOpenSaved({
              ...item,
              tone: item.tone,
              toneCount: item.tone_count,
              fromLang: item.from_lang,
              toLang: item.to_lang,
            })} style={{ width: "100%", background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "12px 13px", marginBottom: 8, textAlign: "left", cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {item.mode === "refine"
                    ? <span style={{ padding: "2px 9px", borderRadius: 9, background: t.highlight, border: `1px solid ${t.highlightBorder}`, fontSize: 10, color: theme === "light" ? "#2a6a2a" : "#8adc8a" }}>{item.tone}{item.tone_count > 1 ? ` ×${item.tone_count}` : ""}</span>
                    : <span style={{ padding: "2px 9px", borderRadius: 9, background: t.surface2, border: `1px solid ${t.border2}`, fontSize: 10, color: t.textDim }}>Quick</span>
                  }
                  <span style={{ fontSize: 10, color: t.textDim }}>→ {item.to_lang}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: t.textFaint }}>{formatDate(item.created_at)}</span>
                  <span style={{ fontSize: 12, color: t.textDim }}>›</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>
                {item.original?.substring(0, 60)}{item.original?.length > 60 ? "…" : ""}
              </div>
            </button>
          ))}
        </>
      )}
      <BottomNav active="saved" navigate={navigate} theme={theme} />
    </div>
  );
}
